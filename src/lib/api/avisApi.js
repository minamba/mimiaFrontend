import httpClient from './httpClient';

/**
 * Les avis publiés : moyenne, répartition par étoile, et les derniers écrits.
 *
 * SANS AUTHENTIFICATION, à dessein. C'est une vitrine, et le visiteur qui n'a
 * pas de compte est exactement son public.
 */
export const getAvisPublics = (limite = 10, decalage = 0) =>
  httpClient.get('/avis', { params: { limite, decalage } });

/**
 * L'avis du parent connecté, ou 204 s'il n'en a jamais laissé.
 */
export const getMonAvis = () => httpClient.get('/avis/mien');

/**
 * Dépose ou remplace son avis.
 *
 * IL REPASSE EN ATTENTE DE RELECTURE À CHAQUE ENVOI, même s'il était déjà
 * publié — c'est l'API qui l'impose. Le dire à l'écran évite qu'un parent
 * croie son changement en ligne alors qu'il attend.
 */
export const deposerAvis = (note, titre, commentaire) =>
  httpClient.put('/avis', { note, titre, commentaire });

/** Retire son propre avis. */
export const retirerMonAvis = () => httpClient.delete('/avis');

// --------------------------------------------------------------- relecture

/** Tous les avis, ceux en attente en premier. Réservé à l'administration. */
export const getAvisARelire = () => httpClient.get('/avis/relecture');

/** Publie ou retire un avis de la vitrine. */
export const publierAvis = (id, publie) =>
  httpClient.put(`/avis/${id}/publication`, { publie });

/** Supprime définitivement un avis. */
export const supprimerAvis = (id) => httpClient.delete(`/avis/${id}`);
