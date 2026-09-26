import axios from 'axios';
import httpClient from './httpClient';
import { authService } from '../storage/authService';

// ---------------------------------------------------------------- API métier
export const getProfil = () => httpClient.get('/profil');

export const modifierProfil = (data) => httpClient.put('/profil', data);


// ------------------------------------------------------- serveur d'identité
/**
 * Client distinct : le mot de passe se change sur le serveur d'identité, pas
 * sur l'API métier — celle-ci n'a aucun accès aux credentials, et c'est la
 * séparation qui fait qu'une faille dans l'API ne compromet pas les comptes.
 */
const AUTH_URL = process.env.REACT_APP_AUTH_URL ?? 'http://localhost:5067';

const clientIdentite = axios.create({ baseURL: AUTH_URL });

clientIdentite.interceptors.request.use(async (config) => {
  const token = await authService.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Nature du compte : mot de passe local, ou connexion Google. */
export const getEtatCompte = () => clientIdentite.get('/api/compte');

export const changerMotDePasse = (data) =>
  clientIdentite.post('/api/compte/mot-de-passe', data);

/**
 * Efface le compte, en DEUX temps et dans cet ordre.
 *
 * POURQUOI DEUX APPELS
 * -------------------
 * Le compte vit dans deux bases : les données de la famille dans l'API métier,
 * les identifiants dans le serveur d'identité. Cette séparation est ce qui
 * fait qu'une faille de l'API ne compromet pas les mots de passe — elle a un
 * prix, et le voici : personne ne peut tout effacer d'un seul geste.
 *
 * POURQUOI LES DONNÉES D'ABORD
 * ---------------------------
 * Si le second appel échoue, il reste une identité sans données : le parent se
 * reconnecte, tombe sur un compte vide, et redemande. Dans l'autre sens, on
 * aurait effacé la seule clé d'accès à des données d'enfants — que plus
 * personne ne pourrait ni consulter ni réclamer. C'est précisément ce que la
 * suppression est censée empêcher.
 */
export const supprimerMonCompte = async () => {
  await httpClient.delete('/profil');
  await clientIdentite.delete('/api/compte');
};

/**
 * L'identité de QUELQU'UN D'AUTRE, effacée par un administrateur.
 *
 * Exportée depuis ce fichier parce que c'est lui qui tient le client du serveur
 * d'identité, et que la séparation des deux bases s'explique juste au-dessus.
 * La dupliquer ailleurs ferait vivre deux clients pour un seul serveur.
 *
 * LE `sub`, ET NON L'ADRESSE — changé le 23/09/2026 pour les trois actions
 * d'identité. Voir `changerEmailDe` plus bas : l'adresse peut mentir, le `sub`
 * jamais. Ici le risque était le plus grave des trois — sur un compte
 * désynchronisé, les données partaient et l'identité restait, donc le parent
 * « supprimé » gardait son accès.
 */
export const supprimerIdentiteDe = (sub) =>
  clientIdentite.delete(`/api/admin/comptes/par-id/${encodeURIComponent(sub)}`);

/**
 * Crée l'identité d'un parent, à la demande d'un administrateur.
 *
 * PREMIER des trois appels de la création (identité, fiche, rôle) — l'inverse
 * de la suppression, et pour la même raison : c'est le `sub` rendu ici qui
 * relie la fiche au compte.
 *
 * `motDePasse` DÉCIDE DU RESTE — Camara, le 17/09/2026. Renseigné, le compte
 * est utilisable dans la seconde et aucun courriel ne part. Absent, le parent
 * reçoit le lien pour choisir le sien, comme avant.
 */
export const creerIdentite = ({ email, prenom, nom, motDePasse }) =>
  clientIdentite.post('/api/admin/comptes', { email, prenom, nom, motDePasse });

/**
 * Réinitialise le mot de passe d'un parent, à la demande d'un administrateur —
 * Camara, le 17/09/2026.
 *
 * LE PARENT N'EST PAS PRÉVENU. Aucun courriel ne part : c'est un dépannage
 * demandé de vive voix, et l'administrateur redonne le mot de passe lui-même.
 *
 * SES SESSIONS EN COURS TOMBENT. Identity renouvelle le tampon de sécurité à
 * chaque réinitialisation — c'est ce qu'on attend quand le mot de passe change
 * sans que le titulaire ait rien fait.
 *
 * LE `sub`, comme la suppression et le changement d'adresse : c'est la seule
 * clé qu'un changement d'adresse ne périme pas.
 */
export const reinitialiserMotDePasseDe = (sub, motDePasse) =>
  clientIdentite.put(
    `/api/admin/comptes/par-id/${encodeURIComponent(sub)}/mot-de-passe`,
    { motDePasse },
  );

/**
 * Change l'adresse de CONNEXION d'un parent — Camara, le 23/09/2026 : « j'ai
 * changé l'adresse mail d'un parent dans l'onglet administrateur, mais elle ne
 * peut plus se connecter ».
 *
 * CE QUI MANQUAIT. « Modifier le compte » n'appelait que l'API métier, qui
 * écrit `Parents.Mail` — l'adresse d'AFFICHAGE et d'ENVOI. La base d'identité,
 * où vivent l'identifiant et le mot de passe, n'était jamais prévenue : le
 * parent recevait ses bilans à la nouvelle adresse et ne pouvait entrer
 * qu'avec l'ancienne, sans que rien ne le lui dise.
 *
 * LE `sub` EST LA CLÉ, ET C'EST TOUTE LA CORRECTION DU SOIR. La première
 * version prenait l'ancienne adresse — celle que l'écran affiche, donc celle
 * de la base MÉTIER. Sur un compte dont les deux bases avaient déjà divergé,
 * cette adresse ne désignait personne côté identité : la route qui devait
 * précisément remettre les deux d'accord répondait 404. La seule clé qui ne
 * périme jamais est le `sub`, que l'API métier expose désormais à
 * l'administration (`ParentAdmin.identityUserId`).
 *
 * APPELÉE À CHAQUE ENREGISTREMENT D'UNE FICHE PARENT, sans chercher à deviner
 * si l'adresse a changé. C'est le serveur qui compare, et il compare à ce que
 * l'identité porte VRAIMENT ; identique, il ne fait rien et rend 204. Deux
 * bénéfices : le front n'a pas à tenir une copie de l'état de l'autre base, et
 * un compte désynchronisé se répare tout seul au premier passage dans la
 * fenêtre.
 *
 * LES SESSIONS DU PARENT TOMBENT quand l'adresse change vraiment : Identity
 * renouvelle le tampon de sécurité. Un jeton encore valide portant une adresse
 * qui n'existe plus n'aurait mené qu'à des erreurs incompréhensibles.
 */
export const changerEmailDe = (sub, nouvelEmail) =>
  clientIdentite.put(
    `/api/admin/comptes/par-id/${encodeURIComponent(sub)}/email`,
    { email: nouvelEmail },
  );
