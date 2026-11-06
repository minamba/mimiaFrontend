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

export const creerJeuTest = (niveauId, titre) => httpClient.post(BASE, { niveauId, titre });

export const modifierJeuTest = (id, niveauId, titre) => httpClient.put(`${BASE}/${id}`, { niveauId, titre });

export const supprimerJeuTest = (id) => httpClient.delete(`${BASE}/${id}`);

/** `nombre` lignes créées, `competences` ce qui en est déjà écrit. */
export const ajouterTestAuJeu = (id, { titre, matiereId, nombre, competences }) =>
  httpClient.post(`${BASE}/${id}/tests`, {
    titre, matiereId, nombre, competences,
  });

export const modifierTestDuJeu = (id, testId, { titre, matiereId }) =>
  httpClient.put(`${BASE}/${id}/tests/${testId}`, { titre, matiereId });

export const supprimerTestDuJeu = (id, testId) => httpClient.delete(`${BASE}/${id}/tests/${testId}`);

export const ajouterLigneDeTest = (id, testId) => httpClient.post(`${BASE}/${id}/tests/${testId}/lignes`);

export const modifierLigneDeTest = (id, ligneId, {
  competence, statut, dateEffectuee, commentaire,
}) => httpClient.put(`${BASE}/${id}/lignes/${ligneId}`, {
  competence, statut, dateEffectuee, commentaire,
});

/** Le choix dans la liste : le statut seul, pour ne rien écraser d'autre. */
export const changerStatutLigneDeTest = (id, ligneId, statut) =>
  httpClient.put(`${BASE}/${id}/lignes/${ligneId}/statut`, { statut });

export const supprimerLigneDeTest = (id, ligneId) => httpClient.delete(`${BASE}/${id}/lignes/${ligneId}`);
