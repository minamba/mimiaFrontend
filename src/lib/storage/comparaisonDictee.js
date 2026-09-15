/**
 * LE TEXTE D'UNE DICTÉE, RELU DANS LES MESSAGES.
 *
 * Deux usages, et rien d'autre :
 *
 * - reconstituer le texte dicté depuis le début de la dictée en cours — il est
 *   dans les messages, mot pour mot, puisque ce sont eux qui commandent la
 *   voix ;
 * - distinguer une dictée NEUVE d'une relecture de celle en cours, pour savoir
 *   quand reposer la question du support.
 *
 * La vérification des passages manquants qui vivait ici a été retirée le
 * 11/09/2026, à la demande de Camara : la façon de traiter les manques dans
 * une dictée est à redéfinir.
 */

/** Le texte réduit à ses mots nus : sans accents, sans ponctuation, en bas de casse. */
function mots(texte) {
  return (texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean);
}

/**
 * Une dictée, phrase par phrase.
 *
 * C'est le grain auquel le professeur relit : il redonne UNE phrase, pas tout
 * le passage.
 */
export function phrases(texte) {
  return (texte ?? '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter((p) => mots(p).length > 0);
}

/**
 * Le texte dicté depuis le début de cette dictée, relu dans les messages.
 *
 * LES RELECTURES NE COMPTENT QU'UNE FOIS. Le professeur redit une phrase :
 * elle apparaît alors deux, trois, quatre fois dans le fil, et le texte
 * doublerait. On garde l'ordre de première apparition — c'est celui de la
 * dictée.
 *
 * La fenêtre s'arrête à la dernière correction : ce qui précède appartient à
 * une dictée close, même dans la même séance.
 */
export function texteDicteDepuis(messages) {
  const bloc = /\[DICTEE\]([\s\S]*?)\[\/DICTEE\]/gi;
  const liste = messages ?? [];

  let debut = 0;
  liste.forEach((m, i) => {
    if ((m?.contenu ?? '').includes('[DICTEE_CORRIGEE]')) debut = i + 1;
  });

  const retenues = [];
  const vues = new Set();

  for (let i = debut; i < liste.length; i += 1) {
    if (liste[i]?.role === 'user') continue;

    const contenu = liste[i]?.contenu ?? '';
    let trouve = bloc.exec(contenu);
    bloc.lastIndex = 0;

    while (trouve !== null) {
      phrases(trouve[1]).forEach((phrase) => {
        const cle = phrase.normalize('NFD').replace(/[̀-ͯ]/g, '')
          .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

        if (!vues.has(cle)) {
          vues.add(cle);
          retenues.push(phrase);
        }
      });

      trouve = bloc.exec(contenu);
    }

    bloc.lastIndex = 0;
  }

  return retenues.join(' ');
}

/** La forme nue d'une phrase, pour la reconnaître malgré la ponctuation. */
function cle(phrase) {
  return mots(phrase).join(' ');
}

/**
 * Ce passage ouvre-t-il une dictée NEUVE, ou relit-il celle en cours ?
 *
 * POURQUOI LA QUESTION SE POSE. Une dictée ne se referme qu'à sa correction —
 * et le professeur ne corrige presque jamais dans la foulée : cinq dictées
 * « en attente » dormaient dans la base le 11/09/2026. L'état de la
 * précédente survivait donc à la suivante : mode d'écriture conservé, question
 * du support jamais reposée, et l'élève renvoyé à un cahier qu'il n'avait pas
 * choisi.
 *
 * LA RELECTURE REDIT CE QUI A DÉJÀ ÉTÉ DICTÉ, une nouvelle dictée apporte un
 * texte inédit. C'est tout ce qui les sépare, et cela suffit à les distinguer.
 */
export function ouvreUneNouvelleDictee(passage, dejaDicte) {
  const arrivantes = phrases(passage).map(cle).filter(Boolean);
  if (arrivantes.length === 0) return false;

  const connues = new Set(phrases(dejaDicte).map(cle));

  // Rien de connu encore : c'est forcément un début.
  if (connues.size === 0) return true;

  // Une seule phrase déjà entendue suffit à dire qu'on est dans la même
  // dictée : le professeur relit un passage, il ne recommence pas.
  return !arrivantes.some((p) => connues.has(p));
}
