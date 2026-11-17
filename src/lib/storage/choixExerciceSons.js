/**
 * QUEL EXERCICE DE SONS ? — Camara, le 07/11/2026 : deux exercices de plus, LIRE la syllabe en couleur d'une image et
 * LIRE un mot (voir `lib/lectureDImage.js`). Avec l'écoute des syllabes et des mots, ça fait quatre : ils ne se devinent
 * plus dans les mots de l'enfant. Le professeur pose la question avec la balise [CHOIX_EXERCICE_SONS], l'écran montre
 * les boutons.
 *
 * LE CLIC PART COMME UNE PHRASE D'ENFANT (« Je veux lire des syllabes. ») : c'est elle que le serveur lit pour savoir
 * l'exercice en cours (`RegleVerificationSon.TypeDEcoute`), exactement comme s'il l'avait dite. Pas de fait caché.
 *
 * EN ANGLAIS, PAS DE SYLLABES : écouter des sons, écouter des mots, lire des mots (un son seul ne se lit pas au micro).
 *
 * La carte est celle de la dictée : un enfant qui en a déjà vu une sait y répondre.
 */
import { reponseEnAttente } from './fenetreExercice';

const BALISE = /\[CHOIX_EXERCICE_SONS(?::([a-z]+))?\]/gi;

export const QUESTION_CHOIX_EXERCICE_SONS = 'Quel exercice veux-tu faire ?';

export const ECOUTER_SYLLABES = 'ecouter-syllabes';
export const ECOUTER_SONS = 'ecouter-sons';
export const ECOUTER_MOTS = 'ecouter-mots';
export const LIRE_SYLLABES = 'lire-syllabes';
export const LIRE_MOTS = 'lire-mots';

/** Les boutons, dans l'ordre de la carte. `phrase` : ce qui part au professeur. */
const EXERCICES = {
  [ECOUTER_SYLLABES]: { libelle: 'Écouter des syllabes', aide: 'Je te les dis, tu les répètes', phrase: 'Je veux écouter des syllabes.' },
  [ECOUTER_SONS]: { libelle: 'Écouter des sons', aide: 'Je te les dis, tu les répètes', phrase: 'Je veux écouter des sons.' },
  [ECOUTER_MOTS]: { libelle: 'Écouter des mots', aide: 'Je te les dis, tu les répètes', phrase: 'Je veux écouter des mots.' },
  [LIRE_SYLLABES]: { libelle: 'Lire des syllabes', aide: 'Tu lis la syllabe en couleur', phrase: 'Je veux lire des syllabes.' },
  [LIRE_MOTS]: { libelle: 'Lire des mots', aide: 'Tu lis le mot au tableau', phrase: 'Je veux lire des mots.' },
};

/**
 * Les exercices de la carte, pour ce cours et ce qu'il a demandé — Camara, le 07/11/2026 : « quand je demande un exercice
 * sur les mots, il doit me proposer uniquement écouter des mots et lire des mots, rien sur les syllabes », et l'inverse.
 * Le sujet vient de la balise posée par le serveur (« [CHOIX_EXERCICE_SONS:mots] ») ; sans sujet, tous.
 */
export function exercicesProposes(matiereCode, sujet = null) {
  const anglais = (matiereCode ?? '').toUpperCase() === 'ANGLAIS';
  let codes;
  if (sujet === 'mots') codes = [ECOUTER_MOTS, LIRE_MOTS];
  else if (sujet === 'syllabes' || sujet === 'sons') {
    // En anglais, les sons ne se lisent pas au micro : écouter des sons, ou lire les mots qui les portent.
    codes = anglais ? [ECOUTER_SONS, LIRE_MOTS] : [ECOUTER_SYLLABES, LIRE_SYLLABES];
  } else {
    codes = anglais ? [ECOUTER_SONS, ECOUTER_MOTS, LIRE_MOTS] : [ECOUTER_SYLLABES, ECOUTER_MOTS, LIRE_SYLLABES, LIRE_MOTS];
  }
  return codes.map((code) => ({ code, ...EXERCICES[code] }));
}

/** Le sujet de la carte posée par ce message : 'mots', 'syllabes', 'sons', ou null (tous). */
export function sujetDuChoix(texte) {
  BALISE.lastIndex = 0;
  const trouve = BALISE.exec(texte ?? '');
  BALISE.lastIndex = 0;
  return trouve?.[1]?.toLowerCase() ?? null;
}

/** La phrase envoyée au clic. */
export const phraseDuChoix = (code) => EXERCICES[code]?.phrase ?? '';

/** Vrai si le professeur demande à l'élève de choisir son exercice. */
export function demandeChoixExerciceSons(texte) {
  BALISE.lastIndex = 0;
  const pose = BALISE.test(texte ?? '');
  BALISE.lastIndex = 0;
  return pose;
}

/**
 * LE CHOIX DIT À VOIX HAUTE (« lire ! ») : la carte connaît le sujet, le serveur non. La phrase du bouton part avec lui,
 * dans un fait que la bulle n'affiche pas, et le serveur la lit comme un clic (« Je veux lire des mots. »).
 */
const MARQUE_CHOIX = /\n?\[EXERCICE CHOISI : [^\]]*\]/g;

export function marquerChoixExerciceSons(texte, code) {
  return `${(texte ?? '').trim()}\n[EXERCICE CHOISI : ${phraseDuChoix(code)}]`;
}

/** Retire la balise et le fait pour l'affichage et la voix. */
export function retirerMarqueurChoixExerciceSons(texte) {
  return (texte ?? '').replace(MARQUE_CHOIX, '').replace(BALISE, '').trimEnd();
}

/**
 * LA RÉPONSE DE L'ENFANT, cliquée ou dite : « lire » ou « écouter », avec « syllabes », « sons » ou « mots ». Ce qui ne
 * tranche pas laisse la carte ouverte : on ne devine pas à sa place.
 */
const LIRE = /(?<!\p{L})(?:lire|lis|lecture)(?!\p{L})/iu;
const ECOUTER = /(?<!\p{L})(?:[ée]cout\p{L}*|entendre)(?!\p{L})/iu;
const SYLLABES = /(?<!\p{L})syllabes?(?!\p{L})/iu;
const SONS = /(?<!\p{L})sons(?!\p{L})/iu;
const MOTS = /(?<!\p{L})mots?(?!\p{L})/iu;
const REPONSE_COURTE = 120;

export function lireReponseChoixExerciceSons(texte, sujet = null) {
  const dit = (texte ?? '').trim();
  if (!dit || dit.length > REPONSE_COURTE) return undefined;

  const lire = LIRE.test(dit);
  const ecouter = ECOUTER.test(dit);
  if (lire === ecouter) return undefined;

  // LE SUJET DE LA CARTE SUFFIT : « lire » répond à une carte des mots.
  let syllabes = SYLLABES.test(dit);
  let sons = SONS.test(dit);
  let mots = MOTS.test(dit);
  if (!syllabes && !sons && !mots && sujet) {
    syllabes = sujet === 'syllabes';
    sons = sujet === 'sons';
    mots = sujet === 'mots';
  }
  if ([syllabes, sons, mots].filter(Boolean).length !== 1) return undefined;

  if (lire) return syllabes ? LIRE_SYLLABES : mots ? LIRE_MOTS : undefined;
  return syllabes ? ECOUTER_SYLLABES : sons ? ECOUTER_SONS : ECOUTER_MOTS;
}

/**
 * L'exercice choisi : un code s'il a répondu, `null` si la question attend (la carte s'affiche), `undefined` si elle
 * n'est pas posée.
 */
export function exerciceSonsChoisi(messages) {
  const question = [...(messages ?? [])].reverse().find((m) => m?.role === 'assistant' && demandeChoixExerciceSons(m.contenu));
  const sujet = sujetDuChoix(question?.contenu);
  const reponse = reponseEnAttente(messages, {
    lireReponse: () => undefined,
    lireReponseOrale: (texte) => lireReponseChoixExerciceSons(texte, sujet),
    pose: demandeChoixExerciceSons,
    propres: ['CHOIX_EXERCICE_SONS'],
  });

  // LA QUESTION N'ATTEND PLUS SI LE PROFESSEUR A REPRIS LA PAROLE (même raison que `typeDicteeChoisi`).
  if (reponse === null) {
    const dernierProf = [...(messages ?? [])].reverse().find((m) => m?.role === 'assistant');
    if (!demandeChoixExerciceSons(dernierProf?.contenu)) return undefined;
  }

  return reponse;
}
