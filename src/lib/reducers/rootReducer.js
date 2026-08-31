import { combineReducers } from 'redux';
import authReducer from './authReducer';
import referentielReducer from './referentielReducer';
import elevesReducer from './elevesReducer';
import chatReducer from './chatReducer';
import adminReducer from './adminReducer';
import profilReducer from './profilReducer';

export default combineReducers({
  auth: authReducer,
  referentiel: referentielReducer,
  eleves: elevesReducer,
  chat: chatReducer,
  admin: adminReducer,
  profil: profilReducer,
});
