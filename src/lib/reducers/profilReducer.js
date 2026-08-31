import {
  PROFIL_LOAD_REQUEST,
  PROFIL_LOAD_SUCCESS,
  PROFIL_LOAD_FAILURE,
  PROFIL_SAVE_REQUEST,
  PROFIL_SAVE_SUCCESS,
  PROFIL_SAVE_FAILURE,
  MOT_DE_PASSE_REQUEST,
  MOT_DE_PASSE_SUCCESS,
  MOT_DE_PASSE_FAILURE,
  PROFIL_RESET_MESSAGES,
} from '../actions/profilActions';

const initialState = {
  parent: null,

  // Nature du compte, lue sur le serveur d'identité. Sans elle, on proposerait
  // un formulaire de mot de passe à quelqu'un qui se connecte avec Google.
  compte: null,

  loading: true,
  saving: false,
  error: null,
  succes: null,
};

export default function profilReducer(state = initialState, action) {
  switch (action.type) {
    case PROFIL_LOAD_REQUEST:
      return { ...state, loading: true, error: null };

    case PROFIL_LOAD_SUCCESS:
      return { ...state, loading: false, ...action.payload };

    case PROFIL_LOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case PROFIL_SAVE_REQUEST:
    case MOT_DE_PASSE_REQUEST:
      return { ...state, saving: true, error: null, succes: null };

    case PROFIL_SAVE_SUCCESS:
      return { ...state, saving: false, parent: action.payload, succes: 'Vos informations sont enregistrées.' };

    case MOT_DE_PASSE_SUCCESS:
      return { ...state, saving: false, succes: action.payload };

    case PROFIL_SAVE_FAILURE:
    case MOT_DE_PASSE_FAILURE:
      return { ...state, saving: false, error: action.payload };

    case PROFIL_RESET_MESSAGES:
      return { ...state, error: null, succes: null };

    default:
      return state;
  }
}
