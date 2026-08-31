import {
  ELEVES_LOAD_REQUEST,
  ELEVES_LOAD_SUCCESS,
  ELEVES_LOAD_FAILURE,
  ELEVE_SUBMIT_REQUEST,
  ELEVE_SUBMIT_SUCCESS,
  ELEVE_SUBMIT_FAILURE,
  ELEVE_RESET,
  ELEVE_SELECT,
} from '../actions/elevesActions';

const initialState = {
  liste: [],
  selectionne: null,
  loading: false,
  submitting: false,
  success: false,
  error: null,
};

export default function elevesReducer(state = initialState, action) {
  switch (action.type) {
    case ELEVES_LOAD_REQUEST:
      return { ...state, loading: true, error: null };

    case ELEVES_LOAD_SUCCESS:
      return { ...state, loading: false, liste: action.payload };

    case ELEVES_LOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case ELEVE_SUBMIT_REQUEST:
      return { ...state, submitting: true, success: false, error: null };

    case ELEVE_SUBMIT_SUCCESS:
      return {
        ...state,
        submitting: false,
        success: true,
        liste: [...state.liste.filter((e) => e.id !== action.payload.id), action.payload],
      };

    case ELEVE_SUBMIT_FAILURE:
      return { ...state, submitting: false, error: action.payload };

    case ELEVE_RESET:
      return { ...state, submitting: false, success: false, error: null };

    case ELEVE_SELECT:
      return { ...state, selectionne: action.payload };

    default:
      return state;
  }
}
