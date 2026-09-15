/**
 * Dans quelle langue régler la reconnaissance vocale du NAVIGATEUR, selon la
 * matière du cours.
 *
 * POURQUOI CE FICHIER EXISTE
 * --------------------------
 * Le moteur principal (serveur, voir `ecouteTempsReel.js`) sait déjà faire
 * ça : côté API, `VocabulaireTranscription.Langue` LÂCHE la contrainte de
 * langue pour les cours de langue, et laisse le fournisseur détecter,
 * segment par segment, si l'élève parle français ou la langue étudiée.
 *
 * Le moteur de repli — la reconnaissance du navigateur, utilisée quand le
 * serveur est injoignable — ne sait pas faire ça : `SpeechRecognition.lang`
 * n'accepte qu'UNE SEULE langue, pas de détection automatique, pas de
 * bilinguisme. Ce fichier n'existait pas, et la reconnaissance restait
 * réglée sur le français EN TOUTE MATIÈRE, cours de langue compris.
 *
 * CE QUE ÇA CASSAIT, ET C'EST ARRIVÉ EN PRODUCTION
 * --------------------------------------------------
 * Le 06/09/2026 : un élève d'anglais a répondu « cat ». Entendu par une
 * reconnaissance réglée sur le français, c'est ressorti « carte » — un vrai
 * mot, qui ne signale aucune erreur de transcription. Le professeur a alors
 * corrigé l'élève VERS LE FRANÇAIS, sur une réponse qui était pourtant juste.
 *
 * LE CHOIX, ET IL EST ASYMÉTRIQUE COMME CÔTÉ SERVEUR
 * ----------------------------------------------------
 * Faute de pouvoir couvrir les deux langues à la fois, on choisit LA LANGUE
 * ÉTUDIÉE plutôt que le français. C'est le même arbitrage que
 * `VocabulaireTranscription.cs`, pour la même raison : la phrase qu'on
 * évalue est celle que l'élève produit dans la langue du cours ; le
 * bavardage en français — une question, un commentaire — est secondaire.
 * Mieux vaut abîmer le second que la première.
 *
 * Cette dégradation ne touche QUE le moteur de repli, donc seulement les
 * séances où le serveur est injoignable — l'exception, pas la règle.
 */

/**
 * Code BCP-47 par matière. Mêmes matières que côté serveur
 * (`VocabulaireTranscription.MatieresBilingues`) : ne pas ajouter une langue
 * ici sans l'ajouter aussi là-bas, les deux listes doivent avancer ensemble.
 */
export const LANGUES_ETUDIEES = {
  ANGLAIS: 'en-US',
  ESPAGNOL: 'es-ES',
  ALLEMAND: 'de-DE',
  ITALIEN: 'it-IT',
  CHINOIS: 'zh-CN',
  // Les spécialités de langue de la voie générale se parlent dans leur langue.
  LLCER_ANGLAIS: 'en-US',
  AMC: 'en-US',
  LLCER_ESPAGNOL: 'es-ES',
};

/**
 * LA LISTE DES MATIÈRES DE LANGUE EN DÉCOULE — voir `matieresLangues.js`.
 * Elle y était recopiée, et deux listes finissent par diverger.
 */
const LANGUE_PAR_MATIERE = LANGUES_ETUDIEES;

/** Langue par défaut : le français, pour toutes les matières hors langues. */
const LANGUE_PAR_DEFAUT = 'fr-FR';

/**
 * @param {string|null|undefined} matiereCode
 * @returns {string} le code BCP-47 à donner à `SpeechRecognition.lang`
 */
export function langueTranscription(matiereCode) {
  if (!matiereCode) return LANGUE_PAR_DEFAUT;

  return LANGUE_PAR_MATIERE[matiereCode.toUpperCase()] ?? LANGUE_PAR_DEFAUT;
}

export default langueTranscription;
