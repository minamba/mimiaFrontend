import httpClient from './httpClient';

/**
 * LES CARNETS DE TEST DE L'ADMINISTRATION — Camara, le 04/11/2026.
 *
 * Chaque écriture rend le jeu entier, relu : c'est lui qui porte le statut
 * recalculé, l'écran n'a rien à déduire. Voir `JeuxDeTestsController`.
 */
const BASE = '/admin/jeux-tests';

export const getJeuxTests = () => httpClient.get(BASE);

export const getJeuTest = (id) => httpClient.get(`${BASE}/${id}`);

/** `section` : « generaux » pour un jeu de TESTS GÉNÉRAUX (sans classe) ; sinon la classe décide. */
export const creerJeuTest = (niveauId, titre, section = null) => httpClient.post(BASE, { niveauId, titre, section });

export const modifierJeuTest = (id, niveauId, titre, section = null) => httpClient.put(`${BASE}/${id}`, { niveauId, titre, section });

/** Les catégories déjà employées dans les blocs des tests généraux (22/11/2026). */
export const getCategoriesTests = () => httpClient.get(`${BASE}/categories`);

export const supprimerJeuTest = (id) => httpClient.delete(`${BASE}/${id}`);

/** `nombre` lignes créées, `competences` ce qui en est déjà écrit. `categorie` au lieu de `matiereId` pour les tests généraux. */
export const ajouterTestAuJeu = (id, {
  titre, matiereId, categorie, nombre, competences,
}) => httpClient.post(`${BASE}/${id}/tests`, {
  titre, matiereId, categorie, nombre, competences,
});

export const modifierTestDuJeu = (id, testId, { titre, matiereId, categorie }) =>
  httpClient.put(`${BASE}/${id}/tests/${testId}`, { titre, matiereId, categorie });

export const supprimerTestDuJeu = (id, testId) => httpClient.delete(`${BASE}/${id}/tests/${testId}`);

export const ajouterLigneDeTest = (id, testId) => httpClient.post(`${BASE}/${id}/tests/${testId}/lignes`);

export const modifierLigneDeTest = (id, ligneId, {
  competence, statut, commentaire,
}) => httpClient.put(`${BASE}/${id}/lignes/${ligneId}`, {
  competence, statut, commentaire,
});

/** `position` : son rang une fois déplacée, à partir de 0 (tout en haut du test). */
export const deplacerLigneDeTest = (id, ligneId, position) =>
  httpClient.put(`${BASE}/${id}/lignes/${ligneId}/position`, { position });

/** Le choix dans la liste : le statut seul, pour ne rien écraser d'autre. */
export const changerStatutLigneDeTest = (id, ligneId, statut) =>
  httpClient.put(`${BASE}/${id}/lignes/${ligneId}/statut`, { statut });

export const supprimerLigneDeTest = (id, ligneId) => httpClient.delete(`${BASE}/${id}/lignes/${ligneId}`);
