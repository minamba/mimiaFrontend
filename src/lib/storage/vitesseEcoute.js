import { ouvreUneNouvelleDictee } from './comparaisonDictee';

/**
 * À QUELLE VITESSE LE PROFESSEUR LIT UN PASSAGE D'ÉCOUTE.
 *
 * Voulu par Camara le 12/09/2026 : avant chaque exercice de compréhension
 * orale, l'enfant choisit lui-même le débit. Un élève de 6e qui découvre
 * l'anglais et un lycéen n'entendent pas la même chose d'un même texte lu à
 * la même vitesse — et celui qui n'a rien compris n'ose pas toujours demander
 * qu'on ralentisse.
 *
 * GLOBAL À TOUTES LES LANGUES : la question se pose pour tout passage borné
 * par une balise d'écoute, quelle que soit la matière — anglais, espagnol,
 * italien, allemand, chinois, français.
 *
 * LE CHOIX NE VAUT QUE POUR LA LANGUE ÉTUDIÉE. Les explications du professeur,
 * en français, gardent son débit habituel : ralentir ce qui est déjà compris
 * n'aide personne et allonge la séance.
 */

export const VITESSES = [
  { cle: 'tres_lent', libelle: 'Très lent', aide: 'mot à mot', icone: '🐢' },
  { cle: 'lent', libelle: 'Lent', aide: 'pour bien tout entendre', icone: '🚶' },
  { cle: 'normal', libelle: 'Normal', aide: 'comme en classe', icone: '💬' },
  { cle: 'rapide', libelle: 'Rapide', aide: 'comme un vrai locuteur', icone: '⚡' },
];

export const VITESSE_PAR_DEFAUT = 'normal';

/**
 * Le facteur de la voix DE REPLI — celle du navigateur, quand le serveur est
 * injoignable. La vraie voix, elle, reçoit une consigne de débit : voir
 * `SyntheseVocaleService`.
 */
const FACTEURS = {
  tres_lent: 0.7,
  lent: 0.85,
  normal: 1,
  rapide: 1.15,
};

export function facteurNavigateur(vitesse) {
  return FACTEURS[vitesse] ?? 1;
}

const MOTS_MINIMUM = 3;

const compterMots = (texte) => (texte ?? '').trim().split(/\s+/).filter(Boolean).length;

/**
 * La question « à quelle vitesse ? » doit-elle s'afficher ?
 *
 * Quatre conditions, et chacune a sa raison :
 *
 * - un passage d'écoute doit être là, évidemment ;
 * - il doit faire au moins trois mots : le texte arrive en flux, et poser la
 *   question sur « The » n'aurait aucun sens — on attend d'en voir assez pour
 *   savoir si c'est un passage inédit ;
 * - la question ne se repose pas dans le même tour de parole ;
 * - et surtout : un passage DÉJÀ entendu ne la repose pas. Quand le
 *   professeur relit le même texte à la demande de l'élève, la vitesse
 *   choisie tient. Seul un exercice INÉDIT vaut une nouvelle question — même
 *   règle que pour le support d'une dictée, et même comparaison.
 */
export function carteVitesseVisible({
  passageEcoute, passageChoisi, tourDuChoix, tourEleve,
}) {
  if (!passageEcoute || compterMots(passageEcoute) < MOTS_MINIMUM) return false;
  if (tourDuChoix === tourEleve) return false;
  if (!passageChoisi) return true;

  return ouvreUneNouvelleDictee(passageEcoute, passageChoisi);
}
