import httpClient from './httpClient';

/**
 * L'ESPACE PARENT (Camara, le 16/10/2026) — ce qu'il ouvre au parent connecté,
 * et ses catégories de fiches. Les fiches elles-mêmes passent par
 * `mesFichesApi`, avec le propriétaire `PARENT`.
 */

/** `{ fiches, sansLimite, actif }` : la barre de navigation n'affiche le bouton que si `fiches` est vrai. */
export const getEspaceParent = () => httpClient.get('/parents/moi/espace');

export const getCategories = () => httpClient.get('/parents/moi/categories');

export const creerCategorie = (libelle, couleur) => httpClient.post('/parents/moi/categories', { libelle, couleur });

export const modifierCategorie = (id, libelle, couleur) => httpClient.put(`/parents/moi/categories/${id}`, { libelle, couleur });

/** Ses cours restent, « sans catégorie ». */
export const supprimerCategorie = (id) => httpClient.delete(`/parents/moi/categories/${id}`);

/** Les couleurs proposées — les mêmes que le serveur (`FichesRevisionEleve.CouleursCategories`). */
export const COULEURS_CATEGORIES = [
  '#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0D9488', '#0891B2', '#475569',
];
