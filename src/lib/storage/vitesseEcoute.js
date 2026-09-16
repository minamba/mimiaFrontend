import { ouvreUneNouvelleDictee } from './comparaisonDictee';

// LES QUATRE DESSINS, À LA PLACE DES EMOJIS — Camara, le 16/09/2026. L'escargot
// et l'éclair ne se dessinent pas pareil d'un appareil à l'autre, et un emoji
// de 15 px ne dit pas grand-chose à un enfant. Ici, le même personnage va de
// plus en plus vite : l'image porte la vitesse mieux que le mot.
import imageTresLent from '../../assets/tres_lent.png';
import imageLent from '../../assets/lent.png';
import imageNormal from '../../assets/normal.png';
import imageRapide from '../../assets/rapide.png';

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

// PLUS DE PHRASE SOUS LE NOM — Camara, le 16/09/2026, en séance puis sur la
// page d'accueil. « mot à mot », « comme en classe » : le dessin les dit, et
// quatre phrases sous quatre dessins allongeaient la carte pour rien. Le champ
// `aide` a été retiré avec elles, plutôt que laissé sans emploi.
export const VITESSES = [
  { cle: 'tres_lent', libelle: 'Très lent', image: imageTresLent },
  { cle: 'lent', libelle: 'Lent', image: imageLent },
  { cle: 'normal', libelle: 'Normal', image: imageNormal },
  { cle: 'rapide', libelle: 'Rapide', image: imageRapide },
];

export const VITESSE_PAR_DEFAUT = 'normal';

/**
 * Cette clé désigne-t-elle une des quatre vitesses ?
 *
 * Le professeur pose lui-même la vitesse quand l'élève demande « plus lent »
 * ou « plus vite » (voir `[VITESSE:cible]` dans `ardoise.js`). Un modèle de
 * langue écrit parfois autre chose que ce qu'on lui a dit — « plus_lent »,
 * « slow », un intitulé traduit. Une clé inconnue est ignorée : l'exercice
 * continue au débit en cours plutôt que de partir sur une valeur inventée.
 */
export function estVitesseConnue(cle) {
  return VITESSES.some((v) => v.cle === cle);
}

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
