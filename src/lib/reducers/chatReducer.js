import {
  CONVERSATION_OPEN_REQUEST,
  CONVERSATION_OPEN_SUCCESS,
  CONVERSATION_OPEN_FAILURE,
  MESSAGES_LOAD_SUCCESS,
  MESSAGE_SEND_REQUEST,
  MESSAGE_SEND_FAILURE,
  MESSAGE_DELTA,
  MESSAGE_DONE,
  ACCUEIL_REQUEST,
  ANNONCE_REQUEST,
  QUOTA_EPUISE,
  CHAT_RESET,
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

    case CHAT_RESET:
      return initialState;

    default:
      return state;
  }
}
