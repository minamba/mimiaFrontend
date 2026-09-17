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
 * L'ADRESSE ET NON L'IDENTIFIANT : le `sub` est délibérément absent des
 * réponses de l'API métier, l'adresse est le seul lien dont l'administration
 * dispose entre les deux bases.
 */
export const supprimerIdentiteDe = (mail) =>
  clientIdentite.delete(`/api/admin/comptes/${encodeURIComponent(mail)}`);

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
 * L'ADRESSE ET NON L'IDENTIFIANT, comme la suppression : le `sub` est
 * délibérément absent des réponses de l'API métier.
 */
export const reinitialiserMotDePasseDe = (mail, motDePasse) =>
  clientIdentite.put(
    `/api/admin/comptes/${encodeURIComponent(mail)}/mot-de-passe`,
    { motDePasse },
  );
