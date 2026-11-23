import httpClient from './httpClient';

/**
 * LES EXAMENS BLANCS — Camara, le 23/11/2026 : brevet blanc en 3e, bac blanc en 1re et terminale, bac pro blanc en
 * voie professionnelle. Un examen blanc est une date et ses matières ; chaque matière a ses documents (vingt au
 * plus, sans limite de pages ni de taille propre : 100 Mo par fichier), effacés deux mois après l'examen blanc.
 */
const base = (eleveId) => `/eleves/${eleveId}/examens-blancs`;

/** `{ type, libelle }` : « Brevet blanc », « Bac blanc », « Bac pro blanc », ou null si sa classe n'en a pas. */
export const getTypeExamenBlanc = (eleveId) => httpClient.get(`${base(eleveId)}/type`);

/** Tous ses examens blancs, du plus proche au plus lointain, avec leurs matières et leurs documents. */
export const getExamensBlancs = (eleveId) => httpClient.get(base(eleveId));

export const getExamenBlanc = (eleveId, examenId) => httpClient.get(`${base(eleveId)}/${examenId}`);

/**
 * Ajoute une matière pour une date : `{ matiereId, dateExamen: 'AAAA-MM-JJ', heureExamen: 'HH:mm' | null }`.
 * Rejoint l'examen blanc de ce jour-là s'il existe. Rend `{ examenBlancId, matiereLigneId }`.
 * 403 : réservé aux abonnés.
 */
export const ajouterMatiereExamenBlanc = (eleveId, donnees) =>
  httpClient.post(`${base(eleveId)}/matieres`, donnees);

export const supprimerExamenBlanc = (eleveId, examenId) => httpClient.delete(`${base(eleveId)}/${examenId}`);

export const retirerMatiereExamenBlanc = (eleveId, examenId, ligneId) =>
  httpClient.delete(`${base(eleveId)}/${examenId}/matieres/${ligneId}`);

export const ajouterDocumentExamenBlanc = (eleveId, examenId, ligneId, fichier) => {
  const corps = new FormData();
  corps.append('fichier', fichier, fichier.name);
  return httpClient.post(`${base(eleveId)}/${examenId}/matieres/${ligneId}/documents`, corps);
};

export const retirerDocumentExamenBlanc = (eleveId, examenId, documentId) =>
  httpClient.delete(`${base(eleveId)}/${examenId}/documents/${documentId}`);

/** Le fichier tel qu'il a été envoyé, en blob ; 410 une fois effacé (deux mois après l'examen blanc). */
export const getFichierExamenBlanc = (eleveId, examenId, documentId) =>
  httpClient.get(`${base(eleveId)}/${examenId}/documents/${documentId}/fichier`, { responseType: 'blob' });

/** `{ texte, lu, illisible }` : le texte d'un Word, Excel ou PowerPoint. */
export const getTexteExamenBlanc = (eleveId, examenId, documentId) =>
  httpClient.get(`${base(eleveId)}/${examenId}/documents/${documentId}/texte`);
