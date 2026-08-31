import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getNiveaux, getMatieres } from '../api/referentielApi';
import {
  REFERENTIEL_LOAD_REQUEST,
  REFERENTIEL_LOAD_SUCCESS,
  REFERENTIEL_LOAD_FAILURE,
} from '../actions/referentielActions';

function* chargerReferentielSaga() {
  try {
    // Les deux appels sont indépendants : autant les lancer en parallèle.
    const [niveaux, matieres] = yield all([call(getNiveaux), call(getMatieres)]);

    yield put({
      type: REFERENTIEL_LOAD_SUCCESS,
      payload: { niveaux: niveaux.data, matieres: matieres.data },
    });
  } catch (error) {
    yield put({
      type: REFERENTIEL_LOAD_FAILURE,
      payload: "Impossible de charger les niveaux et les matières.",
    });
  }
}

export default function* referentielSaga() {
  yield takeLatest(REFERENTIEL_LOAD_REQUEST, chargerReferentielSaga);
}
