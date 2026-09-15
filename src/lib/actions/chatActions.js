export const CONVERSATION_OPEN_REQUEST = 'CONVERSATION_OPEN_REQUEST';
export const CONVERSATION_OPEN_SUCCESS = 'CONVERSATION_OPEN_SUCCESS';
export const CONVERSATION_OPEN_FAILURE = 'CONVERSATION_OPEN_FAILURE';

export const MESSAGES_LOAD_SUCCESS = 'MESSAGES_LOAD_SUCCESS';

export const MESSAGE_SEND_REQUEST = 'MESSAGE_SEND_REQUEST';
export const MESSAGE_SEND_FAILURE = 'MESSAGE_SEND_FAILURE';

/** L'agent prend la parole en premier : aucun message élève n'est affiché. */
export const ACCUEIL_REQUEST = 'ACCUEIL_REQUEST';
export const ANNONCE_REQUEST = 'ANNONCE_REQUEST';

/** @param type 'fin-proche' | 'fin' */
export const annoncer = (conversationId, type) => ({
  type: ANNONCE_REQUEST,
  payload: { conversationId, annonce: type },
});

/** Fragment reçu du flux SSE. */
export const MESSAGE_DELTA = 'MESSAGE_DELTA';
/** Fin du flux : la réponse en cours devient un message définitif. */
export const MESSAGE_DONE = 'MESSAGE_DONE';

/** Le forfait de la famille est épuisé : l'agent n'a pas pris la parole. */
export const QUOTA_EPUISE = 'QUOTA_EPUISE';

export const CHAT_RESET = 'CHAT_RESET';

/**
 * Ouvre (ou crée) la conversation d'un élève pour une matière.
 *
 * @param seanceFinie la séance était DÉJÀ terminée au chargement de la page.
 *   Le professeur ne prend alors pas la parole : voir le saga.
 * @param dureeChoisieMinutes la durée choisie par l'élève pour cette séance
 *   (voir DUREES dans GrilleMatieres.js), transmise à l'accueil pour
 *   qu'elle rejoigne le compte rendu écrit à la conclusion de cette séance.
 * @param controleId le contrôle que l'élève vient préparer, quand il est
 *   arrivé par « Préparer ce contrôle ». Le professeur ouvre alors dessus au
 *   lieu de le proposer.
 * @param mode d'où vient l'élève : 'controle', 'bilan', 'examen', ou `null`
 *   pour un cours normal. Le professeur ne parle que de ce qui correspond au
 *   bouton cliqué — voir `ModesSeance` côté serveur, qui revérifie tout.
 * @param epreuveCode l'épreuve d'examen préparée, en mode 'examen'.
 */
export const ouvrirConversation = (
  eleveId, matiereId, seanceFinie = false, dureeChoisieMinutes = null, controleId = null,
  mode = null, epreuveCode = null,
) => ({
  type: CONVERSATION_OPEN_REQUEST,
  payload: {
    eleveId, matiereId, seanceFinie, dureeChoisieMinutes, controleId, mode, epreuveCode,
  },
});

/**
 * @param secondesRestantes temps restant dans la séance, tenu par le
 *   navigateur. Le serveur ne le connaît pas : il ignore la durée choisie et
 *   l'heure de départ.
 * @param pieceJointe un aperçu minimal ({ id, estImage, nomFichier }) de la
 *   pièce déjà envoyée, pour que la bulle de l'élève l'affiche tout de suite
 *   — sans lui, elle restait vide jusqu'au rechargement de la page, seul
 *   moment où le serveur redonne le vrai message avec sa pièce jointe.
 */
export const envoyerMessage = (
  conversationId, contenu, secondesRestantes = null, pieceJointeId = null, pieceJointe = null,
) => ({
  type: MESSAGE_SEND_REQUEST,
  payload: { conversationId, contenu, secondesRestantes, pieceJointeId, pieceJointe },
});

export const resetChat = () => ({ type: CHAT_RESET });
