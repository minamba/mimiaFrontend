import { all, call, put, takeLatest } from 'redux-saga/effects';
import {
  getProfil,
  modifierProfil,
  getEtatCompte,
  changerMotDePasse as apiChangerMotDePasse,
} from '../api/profilApi';
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
} from '../actions/profilActions';

function* chargerProfilSaga() {
  try {
    // Deux serveurs différents, deux appels indépendants : autant les
    // lancer ensemble.
    const [profil, compte] = yield all([call(getProfil), call(getEtatCompte)]);

    yield put({
      type: PROFIL_LOAD_SUCCESS,
      payload: { parent: profil.data, compte: compte.data },
    });
  } catch (error) {
    yield put({
      type: PROFIL_LOAD_FAILURE,
      payload: 'Impossible de charger votre profil.',
    });
  }
}

function* enregistrerProfilSaga(action) {
  try {
    const { data } = yield call(modifierProfil, action.payload);
    yield put({ type: PROFIL_SAVE_SUCCESS, payload: data });
  } catch (error) {
    yield put({
      type: PROFIL_SAVE_FAILURE,
      payload: error.response?.data?.message ?? "L'enregistrement a échoué.",
    });
  }
}

function* motDePasseSaga(action) {
  try {
    const { data } = yield call(apiChangerMotDePasse, action.payload);
    yield put({
      type: MOT_DE_PASSE_SUCCESS,
      payload: data?.message ?? 'Votre mot de passe a été changé.',
    });
  } catch (error) {
    yield put({
      type: MOT_DE_PASSE_FAILURE,
      // Le serveur d'identité renvoie un message déjà traduit et volontairement
      // peu bavard : on le montre tel quel.
      payload: error.response?.data?.message ?? 'Le changement de mot de passe a échoué.',
    });
  }
}

export default function* profilSaga() {
  yield takeLatest(PROFIL_LOAD_REQUEST, chargerProfilSaga);
  yield takeLatest(PROFIL_SAVE_REQUEST, enregistrerProfilSaga);
  yield takeLatest(MOT_DE_PASSE_REQUEST, motDePasseSaga);
}
