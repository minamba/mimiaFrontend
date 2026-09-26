import axios from 'axios';
import { API_BASE_URL } from './httpClient';
import { jetonEleve } from '../storage/sessionEleve';
import { enTeteBillet, signalerAffluence } from '../affluence/salleDAttente';

/**
 * L'ouverture de session enfant passe par un client NU.
 *
 * `httpClient` pose un en-tête d'autorisation sur chaque appel. Or on est
 * précisément en train d'en demander un : envoyer le jeton d'un parent
 * resté connecté sur cet appareil ferait entrer l'enfant dans le compte de son
 * père, alors qu'il venait de taper son propre code.
 */
const client = axios.create({ baseURL: API_BASE_URL });

/**
 * NU D'AUTORISATION, MAIS PAS DE BILLET.
 *
 * Le client ci-dessus ne porte aucune identité, et c'est le sujet du
 * commentaire au-dessus. La salle d'attente, elle, n'est pas une identité :
 * c'est un tour de file. Sans ces deux lignes, un enfant qui tape son code un
 * jour d'affluence recevrait une erreur brute au lieu de son rang — et
 * l'ouverture de session est justement l'un des gestes qui coûtent cher au
 * serveur, donc l'un des plus souvent refusés.
 */
client.interceptors.request.use((config) => {
  const billet = enTeteBillet();
  if (billet) config.headers['X-Billet'] = billet;
  return config;
});

client.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    if (erreur?.response?.status === 503
        && erreur?.response?.data?.code === 'AFFLUENCE') {
      signalerAffluence(erreur.response.data);
    }
    return Promise.reject(erreur);
  },
);

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
