import { all } from 'redux-saga/effects';
import authSaga from './authSaga';
import referentielSaga from './referentielSaga';
import elevesSaga from './elevesSaga';
import chatSaga from './chatSaga';
import adminSaga from './adminSaga';
import profilSaga from './profilSaga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    referentielSaga(),
    elevesSaga(),
    chatSaga(),
    adminSaga(),
    profilSaga(),
  ]);
}
