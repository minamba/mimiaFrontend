import {
  AUTH_INIT_REQUEST,
  AUTH_INIT_SUCCESS,
  AUTH_INIT_FAILURE,
} from '../actions/authActions';

const initialState = {
  /** null tant qu'on n'a pas interrogé le stockage de session. */
  utilisateur: null,
  authentifie: false,
  estAdmin: false,
  /** Vrai au démarrage : on ne sait pas encore si une session existe. */
  loading: true,
  error: null,
};

/**
 * Le claim `role` arrive sous forme de chaîne quand il y a un seul rôle, et
 * de tableau au-delà. Ne tester que l'un des deux casse silencieusement dès
 * qu'un utilisateur cumule deux rôles.
 *
 * Ce test ne sert QU'À l'affichage : l'API revérifie le rôle sur chaque appel.
 */
function estAdministrateur(profil) {
  const roles = profil?.role ?? profil?.roles;
  if (!roles) return false;
  return Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
}

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case AUTH_INIT_REQUEST:
      return { ...state, loading: true, error: null };

    case AUTH_INIT_SUCCESS:
      return {
        ...state,
        loading: false,
        utilisateur: action.payload,
        authentifie: Boolean(action.payload),
        estAdmin: estAdministrateur(action.payload),
      };

    case AUTH_INIT_FAILURE:
      return {
        ...state,
        loading: false,
        authentifie: false,
        estAdmin: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
