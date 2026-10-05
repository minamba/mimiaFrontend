/**
 * Détection d'écho : le micro a-t-il capté la voix du professeur ?
 *
 * Sur haut-parleurs, ce qui sort des enceintes revient dans le micro. La
 * reconnaissance vocale le transcrit fidèlement, et l'application croit que
 * l'élève vient de dire ce que le professeur vient de dire — le cours part
 * alors en boucle sur lui-même.
 *
 * Au casque le problème n'existe pas. C'est donc un signal d'équipement, pas
 * une panne : la bonne réponse est de le dire à l'élève.
 *
 * UN ÉCHO EST UNE COPIE, PAS UNE RÉPONSE — Camara, le 30/09/2026 : deux
 * familles sur haut-parleurs le même jour, « le micro ne marche qu'une fois sur
 * dix ». La règle jugeait sur les MOTS COMMUNS : sept mots sur dix en commun
 * avec ce que le professeur venait de dire, et c'était un écho. Or un enfant
 * répond très souvent avec les mots de la question — « on reprend la dictée
 * là où on l'avait laissée », « je veux qu'on fasse autre chose » : tous les
 * mots viennent du professeur, et la réponse passait pour un retour
 * d'enceinte. Le mode mains libres se coupait, le professeur annonçait « je
 * m'entends parler dans ton micro », et la famille recliquait sur le micro à
 * chaque tour.
 *
 * Un retour d'enceinte reproduit la phrase DANS L'ORDRE, d'un seul tenant. Et
 * sur haut-parleurs, le micro est sourd pendant que le professeur parle
 * (voir `auDebutDeParole`) : ce qui peut revenir, c'est la FIN de sa phrase,
 * pas un morceau du milieu. C'est cela qu'on cherche maintenant.
 */

/** En dessous, la phrase est trop courte pour conclure quoi que ce soit. */
const MOTS_MINIMUM = 4;

/**
 * Au-delà, ce n'est plus un écho : l'élève a eu le temps de formuler.
 * Un retour d'enceinte, lui, arrive dans la seconde.
 */
const FENETRE_MS = 6000;

/**
 * Une longue capture — le micro ouvert au casque sur de vrais haut-parleurs
 * rend la phrase entière — peut trébucher sur un mot : on accepte, à partir
 * de douze mots, neuf mots sur dix qui suivent l'ordre du professeur.
 *
 * DOUZE, ET PAS MOINS : un enfant peut répéter mot pour mot un morceau de
 * huit mots de la question (« la dictée là où on l'avait laissée ») ; il
 * n'en récite pas douze d'affilée. Une phrase entière de professeur en
 * compte soixante.
 */
const MOTS_POUR_TOLERANCE = 12;
const PART_DANS_L_ORDRE = 0.9;

const normaliser = (texte) =>
  (texte ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

/** `mots` termine-t-il `dites`, mot pour mot ? */
const estLaFin = (mots, dites) =>
  mots.length <= dites.length
  && dites.slice(dites.length - mots.length).every((mot, i) => mot === mots[i]);

/**
 * La part de `mots` couverte par des suites d'au moins deux mots qui se
 * retrouvent, dans le même ordre et d'un seul tenant, dans `dites`.
 */
function partDansLOrdre(mots, dites) {
  let couverts = 0;
  let i = 0;

  while (i < mots.length) {
    let meilleure = 0;

    for (let debut = 0; debut < dites.length; debut += 1) {
      let longueur = 0;
      while (i + longueur < mots.length
        && debut + longueur < dites.length
        && mots[i + longueur] === dites[debut + longueur]) {
        longueur += 1;
      }
      if (longueur > meilleure) meilleure = longueur;
    }

    if (meilleure >= 2) {
      couverts += meilleure;
      i += meilleure;
    } else {
      i += 1; // un mot trébuché, ou un mot de l'élève
    }
  }

  return couverts / mots.length;
}

/**
 * @param transcription ce que le micro vient de capter
 * @param parole        ce que le professeur vient de dire
 * @param finLe         horodatage de la fin de sa phrase (Date.now())
 */
export function estUnEcho(transcription, parole, finLe) {
  if (!parole || !finLe) return false;
  if (Date.now() - finLe > FENETRE_MS) return false;

  const mots = normaliser(transcription);

  // Une réponse courte — « oui », « je sais pas », « 12 » — ne doit jamais
  // être prise pour un écho, même si le professeur venait de le dire.
  if (mots.length < MOTS_MINIMUM) return false;

  const dites = normaliser(parole);
  if (dites.length === 0) return false;

  // La fin de la phrase du professeur, mot pour mot : le retour d'enceinte.
  if (estLaFin(mots, dites)) return true;

  // Une longue capture qui suit son texte dans l'ordre, à un mot près.
  return mots.length >= MOTS_POUR_TOLERANCE && partDansLOrdre(mots, dites) >= PART_DANS_L_ORDRE;
}
