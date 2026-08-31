import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../reducers/rootReducer';
import rootSaga from '../sagas/rootSaga';

// `legacy_createStore` est exactement `createStore`, sans l'avertissement de
// dépréciation que Redux 5 affiche à chaque démarrage. Structure identique à
// celle du document d'architecture.
const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
