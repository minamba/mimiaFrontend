/**
 * L'EXERCICE DE LECTURE À VOIX HAUTE — Camara, le 06/11/2026, sur le signalement de Hilda (CP) : « pour les
 * phrases suivantes, l'enfant entend la phrase avant de devoir la lire. Cela fausse l'exercice : l'enfant ne
 * lit plus, il répète ce qu'il vient d'entendre ». Du CP au CM2, en français.
 *
 * Le texte à lire est au TABLEAU, qui ne se prononce jamais ; le professeur le sait et le reçoit à chaque tour
 * (`LectureAVoixHaute.cs`, côté serveur). Ici, LA PROTECTION QUI NE DÉPEND PAS DU MODÈLE : pendant l'exercice,
 * la voix saute toute phrase du professeur qui contient une phrase du texte que l'élève n'a pas encore lue.
 * Elle travaille sur des phrases COMPLÈTES, au moment où le service de voix les met en file : jamais à moitié.
 *
 * SAUF LA PHRASE QU'IL VIENT DE LIRE : après son essai, le professeur peut la relire pour le corriger (voulu par
 * Camara le même jour). On la reconnaît à ce que le micro a écrit de sa lecture.
 */

import { depuisLaDemande } from './changementDExercice';

/** Écrite seule par le professeur au début de l'exercice ; ni affichée, ni dite. */
export const BALISE_LECTURE = '[EXERCICE_LECTURE]';

/**
 * CE QUE L'ENFANT A LU AU MICRO NE S'ÉCRIT PAS DANS LE FIL — Camara, le 06/11/2026 : « ça sert à rien de
 * retranscrire dans le chat ce que l'enfant dit, vu qu'on est sur de l'audio, comme pour les syllabes ». Le message
 * garde la transcription, pour le professeur, derrière ce marqueur ; la bulle n'affiche que « Lu à voix haute ».
 * Seulement au micro : ce qu'il TAPE reste affiché.
 */
export const MARQUEUR_LU = '[LU_A_VOIX_HAUTE]';
export const LIBELLE_LU = '🔊 Lu à voix haute';

export const marquerLecture = (texte) => `${MARQUEUR_LU} ${texte}`;
export const estLectureEntendue = (contenu) => typeof contenu === 'string' && contenu.startsWith(MARQUEUR_LU);

/** Les mêmes que le serveur : au-delà, sans balise ni consigne de lecture, l'exercice est fini. */
const MESSAGES_SUIVIS = 12;

// « Lis la phrase », « relis le texte », « lis-la à voix haute ».
// L'ANGLAIS AUSSI (06/11/2026) : Marine dit « lis la phrase » comme « read the sentence ».
const FAIT_LIRE = /\b(?:(?:re)?lis\b(?:-la|-le|-les)?[^.!?\n]{0,40}\b(?:phrases?|texte|lignes?|histoire|paragraphe|voix haute)|(?:re)?read\b[^.!?\n]{0,40}\b(?:sentences?|text|lines?|story|aloud|out loud))\b/i;
const TABLEAU = /\[ARDOISE\]([\s\S]*?)\[\/ARDOISE\]/gi;

/** En dessous, une « phrase » (« Oui. ») se retrouverait dans tout ce que dit le professeur. */
const LONGUEUR_MIN = 6;

/** Minuscules, sans accents ni ponctuation, espaces resserrés : « Le vélo est rouge. » → « le velo est rouge ». */
export function normaliser(texte) {
  return (texte ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const horsTableau = (texte) => (texte ?? '').replace(TABLEAU, ' ');

/** Les messages du professeur, du plus ancien au plus récent. */
const duProfesseur = (messages) => (messages ?? []).filter((m) => m?.role === 'assistant').map((m) => m.contenu ?? '');

/** L'exercice est-il en cours, d'après les derniers messages du professeur ? */
export function lectureEnCours(messages) {
  // LA LECTURE EN IMAGES N'EST PAS CET EXERCICE — production, 07/11/2026 : « lis à voix haute la syllabe en
  // couleur » (lib/lectureDImage.js) réveillait celui-ci, chaque syllabe lue devenait « Lu à voix haute » sans
  // verdict, et l'enfant restait bloqué sur « coi ». Le dernier exercice ouvert par le professeur l'emporte.
  //
  // IL A DEMANDÉ À CHANGER D'EXERCICE (14/11/2026, voir lib/changementDExercice.js) : les « lis la phrase » d'avant sa
  // demande ne tiennent plus l'exercice ouvert, comme au serveur. Sinon tout ce qu'il disait ensuite au micro restait
  // « Lu à voix haute » pendant douze messages.
  const recents = duProfesseur(depuisLaDemande(messages, MESSAGES_SUIVIS)).slice(-MESSAGES_SUIVIS);
  for (let i = recents.length - 1; i >= 0; i -= 1) {
    const m = recents[i];
    if (LECTURE_EN_IMAGES.test(m)) return false;
    if (m.includes(BALISE_LECTURE) || FAIT_LIRE.test(horsTableau(m))) return true;
  }
  return false;
}

const LECTURE_EN_IMAGES = /\[LECTURE_IMAGE:|\[CHOIX_EXERCICE_SONS/i;

/** Le dernier texte écrit au tableau (le flux en cours d'abord), ou null. */
export function texteALire(messages, reponseEnCours = '') {
  const textes = [...duProfesseur(messages).slice(-MESSAGES_SUIVIS), reponseEnCours ?? ''];
  for (let i = textes.length - 1; i >= 0; i -= 1) {
    const blocs = [...(textes[i] ?? '').matchAll(TABLEAU)].map((b) => b[1].trim()).filter(Boolean);
    if (blocs.length > 0) return blocs[blocs.length - 1];
  }
  return null;
}

/** Les phrases d'un texte : une par ligne, et chaque ligne coupée à sa ponctuation. */
export function phrasesDuTexte(texte) {
  return (texte ?? '')
    .split(/\n+/)
    .flatMap((ligne) => ligne.match(/[^.!?…]+[.!?…]*/g) ?? [])
    .map(normaliser)
    .filter((p) => p.length >= LONGUEUR_MIN);
}

/** La part des mots de `phrase` que l'on retrouve dans `lu`. */
function recouvrement(phrase, lu) {
  const mots = phrase.split(' ');
  const dits = new Set(lu.split(' '));
  return mots.filter((m) => dits.has(m)).length / mots.length;
}

/**
 * Les phrases que la voix doit taire : celles du texte au tableau, sauf celle que l'élève vient de lire.
 * Vide hors de l'exercice.
 */
export function phrasesATaire(messages, reponseEnCours = '') {
  if (!lectureEnCours([...(messages ?? []), { role: 'assistant', contenu: reponseEnCours }])) return [];

  const phrases = phrasesDuTexte(texteALire(messages, reponseEnCours));
  if (phrases.length === 0) return [];

  // CE QU'IL VIENT DE LIRE : son dernier message, s'il suit le texte. La phrase qu'il recouvre le mieux (la
  // moitié de ses mots au moins) peut être relue par le professeur.
  const derniers = messages ?? [];
  const dernierEleve = [...derniers].reverse().find((m) => m?.role === 'user');
  const lu = normaliser(dernierEleve?.contenu);
  let relue = null;
  if (lu) {
    let meilleur = 0.5;
    phrases.forEach((p) => {
      const r = recouvrement(p, lu);
      if (r >= meilleur) { meilleur = r; relue = p; }
    });
  }

  return phrases.filter((p) => p !== relue);
}

/** Cette phrase du professeur souffle-t-elle une phrase à lire ? */
export function estATaire(phrase, aTaire) {
  if (!aTaire || aTaire.length === 0) return false;
  const dite = normaliser(phrase);
  return dite.length > 0 && aTaire.some((p) => dite.includes(p));
}

/** Un texte sans ses phrases à taire (la fin d'un flux, qui n'a pas toujours sa ponctuation). */
export function sansPhrasesATaire(texte, aTaire) {
  if (!aTaire || aTaire.length === 0 || !texte) return texte;
  return (texte.match(/[^.!?…]+[.!?…]*["'»)\]]*\s*/g) ?? [texte])
    .filter((morceau) => !estATaire(morceau, aTaire))
    .join('');
}
