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
 */
export const ouvrirConversation = (eleveId, matiereId, seanceFinie = false) => ({
  type: CONVERSATION_OPEN_REQUEST,
  payload: { eleveId, matiereId, seanceFinie },
});

/**
 * @param secondesRestantes temps restant dans la séance, tenu par le
 *   navigateur. Le serveur ne le connaît pas : il ignore la durée choisie et
 *   l'heure de départ.
 */
export const envoyerMessage = (
  conversationId, contenu, secondesRestantes = null, pieceJointeId = null,
) => ({
  type: MESSAGE_SEND_REQUEST,
  payload: { conversationId, contenu, secondesRestantes, pieceJointeId },
});

export const resetChat = () => ({ type: CHAT_RESET });
