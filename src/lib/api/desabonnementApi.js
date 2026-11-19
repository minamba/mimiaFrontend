import axios from 'axios';
import { API_BASE_URL } from './httpClient';

/**
 * Le désabonnement depuis un lien de courriel.
 *
 * UN CLIENT SANS SESSION, comme celui des enfants : le parent arrive depuis sa
 * messagerie, déconnecté, et ces routes sont anonymes — le jeton du lien dit
 * qui il est. Passer par le client authentifié le ferait renvoyer vers la
 * connexion au premier refus.
 */
const client = axios.create({ baseURL: API_BASE_URL });

/** Ce que désigne le lien, et si c'est déjà fait. Ne désabonne pas. */
export const lireDesabonnement = (jeton) => client.get('/desabonnement', { params: { jeton } });

export const confirmerDesabonnement = (jeton) => client.post('/desabonnement', { jeton });

/**
 * Pour les offres, `jetonAnnulation` est obligatoire : celui que la désinscription vient de rendre (valable 30 minutes).
 * Sans lui, le serveur répond 403 — le lien d'un vieux courriel ne suffit pas à redonner un consentement.
 */
export const reabonner = (jeton, jetonAnnulation = undefined) =>
  client.post('/desabonnement/reabonnement', { jeton, jetonAnnulation });
