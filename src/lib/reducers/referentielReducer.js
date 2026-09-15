import {
  REFERENTIEL_LOAD_REQUEST,
  REFERENTIEL_LOAD_SUCCESS,
  REFERENTIEL_LOAD_FAILURE,
} from '../actions/referentielActions';

const initialState = {
  niveaux: [],
  matieres: [],
  academies: [],
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
        academies: action.payload.academies,
      };

    case REFERENTIEL_LOAD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
