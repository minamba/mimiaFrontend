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
  estSuperAdmin: false,
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
function aLeRole(profil, role) {
  const roles = profil?.role ?? profil?.roles;
  if (!roles) return false;
  return Array.isArray(roles) ? roles.includes(role) : roles === role;
}

const estAdministrateur = (profil) => aLeRole(profil, 'Admin');

/**
 * Le SUPER-administrateur : celui dont l'adresse est en configuration.
 *
 * Il porte les deux rôles — « Admin » lui ouvre le tableau de bord comme aux
 * autres, « SuperAdmin » ce qui ne se délègue pas : les Modes, et l'attribution
 * du droit d'administrer lui-même.
 *
 * Comme le test du dessus, celui-ci ne sert QU'À l'affichage : cacher un onglet
 * n'est pas une autorisation. L'API refuse ces routes sur son propre contrôle,
 * et c'est lui qui protège.
 */
const estSuperAdministrateur = (profil) => aLeRole(profil, 'SuperAdmin');

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
        estSuperAdmin: estSuperAdministrateur(action.payload),
      };

    case AUTH_INIT_FAILURE:
      return {
        ...state,
        loading: false,
        authentifie: false,
        estAdmin: false,
        estSuperAdmin: false,
        error: action.payload,
      };

    default:
      return state;
  }
}
