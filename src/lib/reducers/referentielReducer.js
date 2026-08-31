import {
  REFERENTIEL_LOAD_REQUEST,
  REFERENTIEL_LOAD_SUCCESS,
  REFERENTIEL_LOAD_FAILURE,
} from '../actions/referentielActions';

const initialState = {
  niveaux: [],
  matieres: [],
  loading: false,
  error: null,
};

export default function referentielReducer(state = initialState, action) {
  switch (action.type) {
    case REFERENTIEL_LOAD_REQUEST:
      return { ...state, loading: true, error: null };

    case REFERENTIEL_LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        niveaux: action.payload.niveaux,
        matieres: action.payload.matieres,
      };

    case REFERENTIEL_LOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
