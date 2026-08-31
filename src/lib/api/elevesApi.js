import httpClient from './httpClient';

export const getEleves = () => httpClient.get('/eleves');

export const getEleveById = (id) => httpClient.get(`/eleves/${id}`);

/**
 * Fiche détaillée d'un enfant, côté parent.
 * Le serveur vérifie que l'élève est bien rattaché au compte du jeton avant
 * de renvoyer quoi que ce soit.
 */
export const getFicheEleve = (id) => httpClient.get(`/eleves/${id}/fiche`);

/** Les évaluations d'un enfant, la plus récente d'abord. */
export const getEvaluations = (eleveId) =>
  httpClient.get(`/eleves/${eleveId}/evaluations`);

/**
 * Une tranche de l'historique : `{ elements, total, suite }`.
 *
 * `curseur` vient de la tranche précédente — `suite`. Null pour la première.
 * Le curseur n'est pas lisible et n'a pas à l'être : on le repasse tel quel.
 *
 * `matiereId` et `ancien` portent sur TOUT l'historique, pas sur la tranche
 * déjà affichée — c'est le serveur qui trie et filtre, sans quoi « maths »
 * ne montrerait que les maths des dix dernières lignes.
 */
export const getHistoriqueEvaluations = (eleveId, curseur, taille, tri) =>
  httpClient.get(`/eleves/${eleveId}/evaluations/historique`, {
    params: { curseur, taille, ...tri },
  });

/** Une tranche de l'historique des comptes rendus. */
export const getHistoriqueRapports = (eleveId, curseur, taille, tri) =>
  httpClient.get(`/eleves/${eleveId}/rapports/historique`, {
    params: { curseur, taille, ...tri },
  });

/** La copie d'une évaluation : questions, réponses, verdicts et observation. */
export const getCopieEvaluation = (eleveId, evaluationId) =>
  httpClient.get(`/eleves/${eleveId}/evaluations/${evaluationId}`);

/** Les comptes rendus de séance, le plus récent d'abord. */
export const getRapports = (eleveId) => httpClient.get(`/eleves/${eleveId}/rapports`);

/** Le détail d'un compte rendu de séance. */
export const getRapport = (eleveId, rapportId) =>
  httpClient.get(`/eleves/${eleveId}/rapports/${rapportId}`);

/**
 * Les compteurs de fiches par matière : `{ [matiereId]: { total, nouveautes } }`.
 * Sert aux cartes de matière, qui n'ont besoin que de deux entiers.
 */
export const getNombreFiches = (eleveId) => httpClient.get(`/eleves/${eleveId}/fiches`);

/** Les fiches d'une matière, la plus récemment révisée d'abord. */
export const getFiches = (eleveId, matiereId) =>
  httpClient.get(`/eleves/${eleveId}/fiches?matiereId=${matiereId}`);

/** Une fiche complète, avec l'identité de l'élève pour l'impression. */
export const getFiche = (eleveId, ficheId) =>
  httpClient.get(`/eleves/${eleveId}/fiches/${ficheId}`);

/** L'élève vient de lire la fiche : la pastille « à consulter » s'éteint. */
export const marquerFicheVue = (eleveId, ficheId) =>
  httpClient.post(`/eleves/${eleveId}/fiches/${ficheId}/vue`);

export const addEleve = (data) => httpClient.post('/eleves', data);

export const updateEleve = (data) => httpClient.put('/eleves', data);

/**
 * Retire un profil : il quitte les listes et libère sa place dans la formule.
 * Rien n'est effacé, et le geste se défait par `restaurerEleve`.
 */
export const archiverEleve = (id) => httpClient.post(`/eleves/${id}/archiver`);

/** Les profils retirés, ceux qu'on peut encore remettre. */
export const getElevesArchives = () => httpClient.get('/eleves/archives');

export const restaurerEleve = (id) => httpClient.post(`/eleves/${id}/restaurer`);

/**
 * Efface les données de l'enfant — identité, cours, évaluations, fiches.
 * Définitif. À ne proposer qu'avec une confirmation forte.
 */
export const supprimerDonneesEleve = (id) => httpClient.delete(`/eleves/${id}`);

/**
 * Le code d'accès d'un enfant, celui qu'il tape sur mimia.fr.
 *
 * Il est CRÉÉ au premier appel s'il n'existe pas encore : un enfant n'a pas de
 * code tant que personne ne l'a regardé, et il n'y a pas de raison d'en semer
 * dans la base pour des profils dont personne ne se servira.
 */
export const getCodeEleve = (id) => httpClient.get(`/eleves/${id}/code`);

/**
 * Régénère le code. L'ancien cesse de marcher, et TOUTES les sessions ouvertes
 * se ferment avec — sinon les appareils déjà connectés continueraient, et le
 * parent croirait avoir coupé quelque chose qu'il n'a pas coupé.
 */
export const regenererCodeEleve = (id) => httpClient.post(`/eleves/${id}/code`);

/** Coupe ou rouvre l'accès d'un enfant, sans toucher à son code. */
export const changerAccesEleve = (id, suspendu) =>
  httpClient.put(`/eleves/${id}/acces`, { suspendu });

/**
 * Les matières qui figurent à l'emploi du temps de cet élève.
 *
 * C'EST LE SERVEUR QUI DÉCIDE. La règle — bornes de niveau et exclusions de
 * voie — a longtemps été appliquée aussi côté front, et la copie s'ouvrait en
 * grand quand le niveau de l'élève n'était pas encore chargé : un enfant de
 * sixième s'est vu proposer la philosophie.
 *
 * Les matières « à venir » sont incluses, avec `active` à faux : elles
 * concernent bien sa classe, c'est leur ouverture qui n'est pas faite.
 */
export const getMatieresEleve = (eleveId) => httpClient.get(`/eleves/${eleveId}/matieres`);
