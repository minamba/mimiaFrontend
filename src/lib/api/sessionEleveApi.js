import axios from 'axios';
import { API_BASE_URL } from './httpClient';
import { jetonEleve } from '../storage/sessionEleve';

/**
 * L'ouverture de session enfant passe par un client NU.
 *
 * `httpClient` pose un en-tête d'autorisation sur chaque appel. Or on est
 * précisément en train d'en demander un : envoyer le jeton d'un parent
 * resté connecté sur cet appareil ferait entrer l'enfant dans le compte de son
 * père, alors qu'il venait de taper son propre code.
 */
const client = axios.create({ baseURL: API_BASE_URL });

/** Échange le code contre un jeton de session. */
export const ouvrirSession = (code) => client.post('/sessions/eleve', { code });

/**
 * Ferme la session côté serveur, pour que le jeton ne serve plus.
 *
 * L'effacer seulement du navigateur laisserait une ligne vivante en base :
 * quiconque aurait relevé le jeton pourrait continuer à s'en servir.
 */
export const fermerSession = () => {
  const jeton = jetonEleve();
  if (!jeton) return Promise.resolve();

  return client.delete('/sessions/eleve', {
    headers: { Authorization: `Eleve ${jeton}` },
  });
};
