import { call, put, takeLatest, takeLeading } from 'redux-saga/effects';
import { authService } from '../storage/authService';
import {
  AUTH_INIT_REQUEST,
  AUTH_INIT_SUCCESS,
  AUTH_INIT_FAILURE,
  AUTH_LOGIN_REQUEST,
  AUTH_CALLBACK_REQUEST,
  AUTH_LOGOUT_REQUEST,
} from '../actions/authActions';

function* initAuthSaga() {
  try {
    const user = yield call(authService.getUser);
    yield put({
      type: AUTH_INIT_SUCCESS,
      payload: user && !user.expired ? user.profile : null,
    });
  } catch (error) {
    yield put({ type: AUTH_INIT_FAILURE, payload: error.message });
  }
}

function* loginSaga(action) {
  try {
    // Les options traversent telles quelles : c'est `authService` qui sait ce
    // qu'elles veulent dire pour le serveur d'identité.
    yield call(authService.login, action.payload);
  } catch (error) {
    // `Failed to fetch` sur le document de découverte = serveur d'identité
    // injoignable. Le message brut du navigateur n'aide personne : on dit
    // ce qui se passe réellement.
    const injoignable =
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError') ||
      error?.name === 'TypeError';

    yield put({
      type: AUTH_INIT_FAILURE,
      payload: injoignable
        ? "Le service de connexion est momentanément indisponible. Réessayez dans un instant."
        : "La connexion n'a pas pu démarrer. Réessayez.",
    });
  }
}

function* callbackSaga() {
  try {
    const user = yield call(authService.completeLogin);
    yield put({ type: AUTH_INIT_SUCCESS, payload: user.profile });
  } catch (error) {
    // Un code d'autorisation ne s'échange qu'une fois. Un second essai — double
    // exécution des effets en StrictMode, ou simple rechargement de /callback —
    // échoue forcément. Mais si la session a été créée entre-temps, il n'y a
    // aucune erreur à signaler : on vérifie avant de crier.
    const session = yield call(authService.getUser);

    if (session && !session.expired) {
      yield put({ type: AUTH_INIT_SUCCESS, payload: session.profile });
      return;
    }

    yield put({
      type: AUTH_INIT_FAILURE,
      payload: "La connexion n'a pas abouti. Réessayez.",
    });
  }
}

function* logoutSaga() {
  try {
    yield call(authService.logout);
  } catch (error) {
    yield put({ type: AUTH_INIT_FAILURE, payload: error.message });
  }
}

export default function* authSaga() {
  yield takeLatest(AUTH_INIT_REQUEST, initAuthSaga);
  yield takeLatest(AUTH_LOGIN_REQUEST, loginSaga);
  // takeLeading et non takeLatest : annuler un échange de code en cours pour en
  // lancer un second condamnerait le seul qui pouvait aboutir.
  yield takeLeading(AUTH_CALLBACK_REQUEST, callbackSaga);
  yield takeLatest(AUTH_LOGOUT_REQUEST, logoutSaga);
}
