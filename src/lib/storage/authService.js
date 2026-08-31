import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const AUTH_URL = process.env.REACT_APP_AUTH_URL ?? 'http://localhost:5067';

/**
 * Client OIDC vers SchoolWebApp.IdentityServer.
 *
 * Authorization Code + PKCE : aucun client secret n'est embarqué dans le
 * navigateur. Les jetons vivent en sessionStorage plutôt qu'en localStorage —
 * ils disparaissent à la fermeture de l'onglet, ce qui limite la casse sur un
 * poste partagé (et un ordinateur familial l'est presque toujours).
 */
const userManager = new UserManager({
  authority: AUTH_URL,
  client_id: 'school-ia-spa',
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: `${window.location.origin}/`,
  silent_redirect_uri: `${window.location.origin}/silent-renew`,
  response_type: 'code',
  // `roles` est indispensable : sans lui, le claim de rôle n'est pas émis dans
  // le jeton d'identité et le front ne peut pas savoir qui est administrateur.
  scope: 'openid profile email roles api offline_access',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

export const authService = {
  /**
   * Redirige vers le serveur d'identité.
   *
   * `inscription` mène au formulaire de CRÉATION de compte plutôt qu'à celui
   * de connexion. Un visiteur qui clique « Créer mon compte parent » et
   * atterrit devant un champ de mot de passe qu'il n'a pas encore doit
   * repérer un lien discret pour arriver là où le bouton avait promis de le
   * mener — beaucoup abandonnent avant.
   *
   * Le paramètre voyage jusqu'au serveur, qui décide de la page à servir. On
   * ne construit pas l'URL d'inscription ici : la redirection après connexion
   * doit rester celle qu'OpenID Connect a préparée, et la fabriquer à la main
   * la casserait.
   */
  login: ({ inscription = false } = {}) =>
    userManager.signinRedirect(
      inscription ? { extraQueryParams: { inscription: '1' } } : undefined,
    ),

  /** Traite le retour sur /callback et renvoie l'utilisateur connecté. */
  completeLogin: () => userManager.signinRedirectCallback(),

  /** Renouvellement silencieux (iframe sur /silent-renew). */
  completeSilentRenew: () => userManager.signinSilentCallback(),

  logout: () => userManager.signoutRedirect(),

  /** Utilisateur en session, ou null. */
  getUser: () => userManager.getUser(),

  /** Access token courant, ou null s'il est absent ou expiré. */
  getAccessToken: async () => {
    const user = await userManager.getUser();
    if (!user || user.expired) return null;
    return user.access_token;
  },

  onUserLoaded: (callback) => userManager.events.addUserLoaded(callback),

  onAccessTokenExpired: (callback) => userManager.events.addAccessTokenExpired(callback),
};

export default userManager;
