/**
 * CE QU'IL RESTE À DIRE — la suite d'un texte déjà prononcé.
 *
 * LE PROBLÈME : UN CURSEUR QUI CHANGE DE TEXTE SOUS LUI
 * ----------------------------------------------------
 * Le message du professeur arrive en flux, et l'écran le confie au lecteur au
 * fur et à mesure. Il faut donc retenir où on en est. C'était un NOMBRE de
 * caractères — et ce nombre servait sur deux chaînes différentes : le tampon
 * du flux pendant la réponse, le message enregistré une fois la réponse
 * versée au fil. Dès qu'elles diffèrent d'un caractère, la découpe glisse.
 *
 * LA RÉPONSE : COMPARER LES TEXTES, PAS LEURS LONGUEURS
 * ----------------------------------------------------
 * La bonne question n'est pas « combien de caractères ai-je lus » mais « ce
 * texte est-il la SUITE de ce que j'ai dit ». Quatre cas :
 *
 *   1. le texte PROLONGE — on ne confie que ce qui dépasse ;
 *   2. le texte RACCOURCIT sans rien contredire — rien de neuf à dire ;
 *   3. le texte DIFFÈRE SUR SA TOUTE FIN — une borne s'est recomposée pendant
 *      que du texte neuf arrivait : on repart du dernier point commun ;
 *   4. le texte CONTREDIT — c'est un autre tour de parole.
 *
 * LE CAS 3, ET LE SILENCE QU'IL A COÛTÉ — Camara, le 04/10/2026 : « dès le
 * début de la compréhension orale, la voix de la prof a coupé ». Le texte
 * arrive par paquets ; un paquet s'est terminé sur « [E », la moitié de la
 * balise « [EN] » qui ouvre le passage. Ces deux caractères, pris pour du
 * texte, sont entrés dans le repère. Au paquet suivant la balise s'est
 * complétée, le passage a été reconnu, la lecture s'est arrêtée le temps du
 * choix de la vitesse — puis n'a JAMAIS repris : le repère finissait par
 * « [E », que le texte final ne contenait plus. Ni prolongement, ni
 * raccourci : la première version y voyait un texte contradictoire, et en
 * fin de message elle choisissait de SE TAIRE.
 *
 * Un silence est pire qu'une syllabe redite. D'où la tolérance du cas 3, et
 * `resteApres`, qui retrouve toujours une suite à dire.
 */

/**
 * Ce qu'une borne à moitié écrite peut laisser de faux au bout du repère :
 * « [ARDOISE », « [/DICTEE » — une quinzaine de caractères au plus.
 */
const TOLERANCE = 16;

/** Longueur du début commun aux deux chaînes. */
function prefixeCommun(a, b) {
  const borne = Math.min(a.length, b.length);
  let i = 0;
  while (i < borne && a[i] === b[i]) i += 1;
  return i;
}

/**
 * UNE BORNE À MOITIÉ ARRIVÉE NE SE CONFIE PAS AU LECTEUR.
 *
 * Tant que « [EN » n'a pas son crochet fermant, rien ne dit que c'est une
 * balise : le reste du programme le traite comme du texte, et la voix dirait
 * « E ». On laisse donc de côté la toute fin d'un flux quand elle ressemble
 * à un début de balise ; elle partira au paquet suivant, sous sa vraie forme.
 * À n'utiliser que PENDANT le flux : un message terminé se dit en entier.
 */
export function sansBorneEntamee(texte) {
  return (texte ?? '').replace(/\[\/?[A-ZÀ-Ý_]{0,24}$/, '');
}

/**
 * @param dejaDit le texte déjà confié au lecteur
 * @param texte   le texte prononçable connu maintenant
 * @returns {{aDire: string, dit: string, nouveauTour: boolean}}
 *          `aDire` ce qu'il reste à confier, `dit` le nouveau repère,
 *          `nouveauTour` vrai quand les deux textes se contredisent pour de
 *          bon — en flux, c'est une nouvelle réponse et elle se dit ; en fin
 *          de message, l'appelant passe par `resteApres`.
 */
export function suiteADire(dejaDit, texte) {
  const dit = dejaDit ?? '';
  const complet = texte ?? '';

  // UN TEXTE VIDE NE SIGNALE RIEN. C'est l'état entre deux tours de parole,
  // pas un tour plus court : sans cette sortie, le repère retomberait à vide
  // à chaque fin de flux et le message suivant serait redit en entier.
  if (complet.length === 0) return { aDire: '', dit, nouveauTour: false };

  if (complet.startsWith(dit)) {
    return { aDire: complet.slice(dit.length), dit: complet, nouveauTour: false };
  }

  // Le texte s'arrête avant ce qui a été dit, sans le contredire : une borne
  // vient de se recomposer. Rien de neuf, mais le repère suit le rognage.
  if (dit.startsWith(complet)) {
    return { aDire: '', dit: complet, nouveauTour: false };
  }

  // La différence ne porte que sur la toute fin du repère : une borne s'est
  // recomposée ET du texte neuf est arrivé dans le même paquet. On repart du
  // dernier point commun — au pire quelques caractères sont redits, jamais
  // une phrase, et surtout rien n'est perdu.
  const commun = prefixeCommun(dit, complet);

  if (dit.length - commun <= TOLERANCE) {
    return { aDire: complet.slice(commun), dit: complet, nouveauTour: false };
  }

  return { aDire: complet, dit: complet, nouveauTour: true };
}

/**
 * EN FIN DE MESSAGE, IL Y A TOUJOURS UNE SUITE À DIRE.
 *
 * Le message enregistré peut différer de ce qui a été lu en flux — le serveur
 * retire un bloc, corrige une tournure. On cherche alors où ce qui a été dit
 * s'ARRÊTE dans le texte final : ses derniers caractères servent d'ancre. À
 * défaut d'ancre, on reprend à la même longueur, comme le faisait l'ancien
 * compteur — imparfait, mais jamais muet.
 */
export function resteApres(dejaDit, texte) {
  const dit = dejaDit ?? '';
  const complet = texte ?? '';

  const ancre = dit.slice(-24);

  if (ancre.length >= 8) {
    const position = complet.lastIndexOf(ancre, dit.length + 40);
    if (position >= 0) return complet.slice(position + ancre.length);
  }

  return complet.slice(Math.min(dit.length, complet.length));
}

export default suiteADire;
