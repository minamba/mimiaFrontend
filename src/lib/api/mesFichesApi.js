import httpClient from './httpClient';

/**
 * MES FICHES DE RÉVISION — les fiches que l'élève tire de son propre cours
 * (14/10/2026). Un espace à part des fiches des professeurs
 * (`/eleves/:id/fiches`), d'où le préfixe `mes-fiches`.
 */
/**
 * L'ESPACE PARENT (16/10/2026) : les mêmes routes, à une autre adresse. Le
 * propriétaire `PARENT` (voir `lib/mesFiches/espaceFiches`) désigne le parent
 * connecté ; tout autre identifiant, un élève.
 */
const base = (eleveId) => (eleveId === 'parent' ? '/parents/moi/mes-fiches' : `/eleves/${eleveId}/mes-fiches`);

/** Un parent range par catégorie, un élève par matière : la même valeur, sous son nom. */
const choix = (eleveId, id) => (eleveId === 'parent'
  ? { categorieId: typeof id === 'number' ? id : null }
  : { matiereId: id });

/** Les cours envoyés et leurs fiches (sans contenu), du plus récent au plus ancien. */
export const getMesFiches = (eleveId) => httpClient.get(base(eleveId));

/** La jauge du mois : fiches utilisées, maximum, restantes, réserve de la famille, remise à zéro, packs. */
export const getQuota = (eleveId) => httpClient.get(`${base(eleveId)}/quota`);

/** Un brouillon : la matière et le type choisis. Rend `{ id }`. */
/** `complementDe` : le cours que ce brouillon complète (16/10/2026). */
export const creerCours = (eleveId, matiereId, type, complementDe = null) =>
  httpClient.post(`${base(eleveId)}/cours`, complementDe
    ? { ...choix(eleveId, matiereId), type, complementDe }
    : { ...choix(eleveId, matiereId), type });

/** Change la matière ou le type d'un brouillon, ses pages déjà déposées gardées (16/10/2026). */
export const modifierCours = (eleveId, coursId, matiereId, type) =>
  httpClient.put(`${base(eleveId)}/cours/${coursId}`, { ...choix(eleveId, matiereId), type });

/** Un cours, ses pages et ses fiches avec leur contenu (`blocs`). */
export const getCours = (eleveId, coursId) => httpClient.get(`${base(eleveId)}/cours/${coursId}`);

export const supprimerCours = (eleveId, coursId) => httpClient.delete(`${base(eleveId)}/cours/${coursId}`);

/** Une page du cours : photo ou PDF, envoyée comme en séance (FormData, champ `fichier`). */
export const ajouterPage = (eleveId, coursId, fichier) => {
  const corps = new FormData();
  corps.append('fichier', fichier, fichier.name);
  return httpClient.post(`${base(eleveId)}/cours/${coursId}/pages`, corps);
};

export const supprimerPage = (eleveId, coursId, pageId) =>
  httpClient.delete(`${base(eleveId)}/cours/${coursId}/pages/${pageId}`);

export const creerScanCours = (eleveId, coursId) =>
  httpClient.post(`${base(eleveId)}/cours/${coursId}/scan-mobile`);

export const etatScanCours = (eleveId, coursId, jeton) =>
  httpClient.get(`${base(eleveId)}/cours/${coursId}/scan-mobile/${jeton}`);

/** Le brouillon part à la lecture. */
export const envoyerCours = (eleveId, coursId) => httpClient.post(`${base(eleveId)}/cours/${coursId}/envoyer`);

/** Des fiches sur un cours lu : un type, et les rangs des notions choisies (à partir de 1). */
export const demanderFiches = (eleveId, coursId, type, notions = []) =>
  httpClient.post(`${base(eleveId)}/cours/${coursId}/fiches`, { type, notions });

export const supprimerFiche = (eleveId, ficheId) => httpClient.delete(`${base(eleveId)}/fiches/${ficheId}`);

/** Flash cards et quiz d'une fiche : écrits la première fois, gardés ensuite (16/10/2026). */
export const entrainementFiche = (eleveId, ficheId) =>
  httpClient.post(`${base(eleveId)}/fiches/${ficheId}/entrainement`);

/** Les mêmes, pour tout un cours (« Me tester » depuis sa carte). */
export const entrainementCours = (eleveId, coursId) =>
  httpClient.post(`${base(eleveId)}/cours/${coursId}/entrainement`);
