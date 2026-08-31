import { call, put, takeLatest } from 'redux-saga/effects';
import { getEleves, addEleve, updateEleve } from '../api/elevesApi';
import {
  ELEVES_LOAD_REQUEST,
  ELEVES_LOAD_SUCCESS,
  ELEVES_LOAD_FAILURE,
  ELEVE_SUBMIT_REQUEST,
  ELEVE_SUBMIT_SUCCESS,
  ELEVE_SUBMIT_FAILURE,
} from '../actions/elevesActions';

function* chargerElevesSaga() {
  try {
    const reponse = yield call(getEleves);
    yield put({ type: ELEVES_LOAD_SUCCESS, payload: reponse.data });
  } catch (error) {
    yield put({
      type: ELEVES_LOAD_FAILURE,
      payload: 'Impossible de charger les profils.',
    });
  }
}

function* submitEleveSaga(action) {
  try {
    const estModification = Boolean(action.payload.id);
    const reponse = yield call(estModification ? updateEleve : addEleve, action.payload);

    yield put({ type: ELEVE_SUBMIT_SUCCESS, payload: reponse.data });
  } catch (error) {
    const statut = error.response?.status;

    // 409 : la formule ne couvre pas un enfant de plus. Ce n'est ni une saisie
    // invalide ni une panne, et le serveur renvoie déjà le bon message — il
    // nomme la formule et le nombre de places. On le reprend tel quel.
    const message =
      statut === 409 || statut === 400
        ? error.response.data?.message ?? 'Les informations saisies sont invalides.'
        : 'Une erreur est survenue, veuillez réessayer.';

    yield put({ type: ELEVE_SUBMIT_FAILURE, payload: message });
  }
}

export default function* elevesSaga() {
  yield takeLatest(ELEVES_LOAD_REQUEST, chargerElevesSaga);
  yield takeLatest(ELEVE_SUBMIT_REQUEST, submitEleveSaga);
}
