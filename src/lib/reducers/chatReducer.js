import {
  CONVERSATION_OPEN_REQUEST,
  CONVERSATION_OPEN_SUCCESS,
  CONVERSATION_OPEN_FAILURE,
  MESSAGES_LOAD_SUCCESS,
  MESSAGE_SEND_REQUEST,
  MESSAGE_SEND_FAILURE,
  MESSAGE_DELTA,
  MESSAGE_DONE,
  VERDICT_ELEVE,
  ACCUEIL_REQUEST,
  ANNONCE_REQUEST,
  QUOTA_EPUISE,
  CHAT_RESET,
  ECHEANCE_FORFAIT,
  FORFAIT_ATTEINT,
} from '../actions/chatActions';

const initialState = {
  conversation: null,
  messages: [],
  /** Réponse en cours de génération, accumulée fragment par fragment. */
  reponseEnCours: '',
  /** Vrai pendant que l'agent écrit : verrouille le champ de saisie. */
  streaming: false,
  loading: false,
  error: null,
  /**
   * Motif de refus du forfait, ou null. Séparé de `error` : un forfait épuisé
   * n'est pas une panne, et l'écran qu'il appelle n'est pas le même.
   */
  quota: null,
  /**
   * L'échéance du forfait pendant la séance, `{ le, motif }` — l'instant (ms)
   * où les heures tombent à zéro et le motif de la coupure —, ou null quand
   * rien ne doit couper (16/10/2026).
   */
  echeance: null,
};

export default function chatReducer(state = initialState, action) {
  switch (action.type) {
    case CONVERSATION_OPEN_REQUEST:
      return { ...initialState, loading: true };

    case CONVERSATION_OPEN_SUCCESS:
      return { ...state, loading: false, conversation: action.payload };

    case CONVERSATION_OPEN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case MESSAGES_LOAD_SUCCESS:
      return { ...state, messages: action.payload };

    case MESSAGE_SEND_REQUEST:
      // Le message de l'élève s'affiche immédiatement, sans attendre le serveur.
      // L'id négatif évite toute collision avec les identifiants réels.
      return {
        ...state,
        streaming: true,
        error: null,
        reponseEnCours: '',
        messages: [
          ...state.messages,
          {
            id: -Date.now(),
            role: 'user',
            contenu: action.payload.contenu,
            dateCreation: new Date().toISOString(),
            // Sans lui, une photo tout juste envoyée restait invisible dans
            // sa propre bulle jusqu'au prochain rechargement de la page —
            // seul moment où le serveur redonne le message avec sa pièce.
            piecesJointes: action.payload.piecesJointes ?? null,
            // Le singulier garde la première, pour ce qui ne connaît que lui.
            pieceJointe: action.payload.piecesJointes?.[0] ?? null,
            // Le verdict de la voix : la bulle écrit « Bonne prononciation » ou « On
            // réessaie » tout de suite, pas au rechargement (04/11/2026).
            sonJuste: typeof action.payload.sonJuste === 'boolean' ? action.payload.sonJuste : null,
          },
        ],
      };

    // Comme un envoi, mais sans bulle élève : c'est l'agent qui prend la
    // parole seul — à l'ouverture du cours, ou sur relance du minuteur.
    //
    // L'annonce du minuteur manquait ici, et c'est ce qui a permis à la
    // corruption d'aller aussi loin : elle streamait avec `streaming` resté
    // faux et sans remise à zéro du tampon. Le champ de saisie n'était pas
    // verrouillé, et toute la logique qui distingue « un tour est en cours »
    // de « rien ne se passe » — verrouillage, lecture à voix haute, rattrapage
    // de fin de tour — jugeait sur une valeur fausse.
    case ACCUEIL_REQUEST:
    case ANNONCE_REQUEST:
      return { ...state, streaming: true, error: null, reponseEnCours: '' };

    case MESSAGE_DELTA:
      return { ...state, reponseEnCours: state.reponseEnCours + action.payload };

    // Le serveur a jugé le dernier message de l'élève (une lecture tapée, #49) : sa bulle prend le verdict et le texte
    // gardé (« J'ai lu la syllabe son. »), comme si le micro l'avait jugé. Seulement la bulle qu'on vient d'envoyer.
    case VERDICT_ELEVE: {
      const i = state.messages.length - 1;
      const dernier = state.messages[i];
      if (!dernier || dernier.role !== 'user' || !(dernier.id < 0)) return state;
      const { sonJuste, contenu } = action.payload ?? {};
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, i),
          {
            ...dernier,
            contenu: typeof contenu === 'string' && contenu ? contenu : dernier.contenu,
            sonJuste: typeof sonJuste === 'boolean' ? sonJuste : null,
            // Le son du verdict reste à jouer (Chat.js) : le micro joue le sien, pas le clavier.
            verdictServeur: true,
          },
        ],
      };
    }

    case MESSAGE_DONE:
      // La réponse accumulée devient un message définitif.
      return {
        ...state,
        streaming: false,
        reponseEnCours: '',
        messages: state.reponseEnCours
          ? [
              ...state.messages,
              {
                id: -Date.now(),
                role: 'assistant',
                contenu: state.reponseEnCours,
                dateCreation: new Date().toISOString(),
              },
            ]
          : state.messages,
      };

    case MESSAGE_SEND_FAILURE:
      return { ...state, streaming: false, error: action.payload };

    // Le serveur a refusé le tour. On retire la bulle optimiste de l'élève :
    // la laisser lui ferait croire que son message est parti.
    case QUOTA_EPUISE:
      return {
        ...state,
        streaming: false,
        reponseEnCours: '',
        quota: action.payload,
        messages: state.messages.filter(
          (m, index) => !(m.role === 'user' && index === state.messages.length - 1 && m.id < 0),
        ),
      };

    case ECHEANCE_FORFAIT:
      return { ...state, echeance: action.payload };

    // LE FORFAIT EST ATTEINT EN PLEINE SÉANCE : coupé net. Le motif rejoint
    // `quota`, qui ferme déjà tout (saisie, micro, minuteur) ; la bulle de
    // l'élève reste — son message est bien parti, c'est le temps qui manque.
    case FORFAIT_ATTEINT:
      return {
        ...state,
        streaming: false,
        reponseEnCours: '',
        quota: action.payload || 'PotEpuise',
        echeance: null,
      };

    case CHAT_RESET:
      return initialState;

    default:
      return state;
  }
}
