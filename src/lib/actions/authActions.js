export const AUTH_INIT_REQUEST = 'AUTH_INIT_REQUEST';
export const AUTH_INIT_SUCCESS = 'AUTH_INIT_SUCCESS';
export const AUTH_INIT_FAILURE = 'AUTH_INIT_FAILURE';
export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST';
export const AUTH_CALLBACK_REQUEST = 'AUTH_CALLBACK_REQUEST';
export const AUTH_LOGOUT_REQUEST = 'AUTH_LOGOUT_REQUEST';

export const initAuth = () => ({ type: AUTH_INIT_REQUEST });
/**
 * Envoie au serveur d'identité.
 *
 * `login({ inscription: true })` mène au formulaire de création de compte
 * plutôt qu'à celui de connexion — pour les boutons qui promettent d'ouvrir
 * un compte, pas d'en retrouver un.
 */
export const login = (options) => ({ type: AUTH_LOGIN_REQUEST, payload: options });
export const traiterCallback = () => ({ type: AUTH_CALLBACK_REQUEST });
export const logout = () => ({ type: AUTH_LOGOUT_REQUEST });
