import httpClient from './httpClient';

/**
 * LES RAPPORTS D'ORIENTATION DE LA CONSEILLÈRE (11/10/2026) : un par séance,
 * adressé à l'élève. À part de `elevesApi` : seule la carte de la conseillère
 * et sa page s'en servent.
 */

/** Les rapports, le plus récent d'abord. Vide quand la conseillère est éteinte. */
export const getRapportsOrientation = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/rapports-orientation`);

/** `{ nouveaux, total }` : le pied de la carte de la conseillère. */
export const compterRapportsOrientation = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/rapports-orientation/compte`);

/** L'élève les a ouverts. Le serveur ne les marque que si c'est bien lui, pas son parent. */
export const marquerRapportsOrientationVus = (eleveId) =>
  httpClient.post(`/eleves/${eleveId}/rapports-orientation/vus`);
