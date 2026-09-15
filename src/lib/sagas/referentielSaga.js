import { all, call, put, takeLatest } from 'redux-saga/effects';
import { getNiveaux, getMatieres, getAcademies } from '../api/referentielApi';
import {
  REFERENTIEL_LOAD_REQUEST,
  REFERENTIEL_LOAD_SUCCESS,
  REFERENTIEL_LOAD_FAILURE,
} from '../actions/referentielActions';

function* chargerReferentielSaga() {
  try {
    // Les trois appels sont indépendants : autant les lancer en parallèle.
    const [niveaux, matieres, academies] = yield all([
      call(getNiveaux), call(getMatieres), call(getAcademies),
    ]);

    yield put({
      type: REFERENTIEL_LOAD_SUCCESS,
      payload: { niveaux: niveaux.data, matieres: matieres.data, academies: academies.data },
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
