import httpClient from './httpClient';

/**
 * MES PODCASTS — les podcasts audio que l'élève tire de son cours (Camara, le 15/11/2026). Le même chemin que « Mes
 * fiches de révision » (`mesFichesApi.js`), à une autre adresse : un cours importé (ou un sujet écrit ou dicté),
 * ses notions, puis un ÉPISODE par notion, lu par le professeur de la matière.
 */
// L'ESPACE PARENT (15/11/2026) : le propriétaire `parent` vise `/parents/moi/mes-podcasts`, les mêmes routes.
const base = (eleveId) => (eleveId === 'parent' ? '/parents/moi/mes-podcasts' : `/eleves/${eleveId}/mes-podcasts`);

/**
 * Ce que le brouillon porte : la matière de l'élève, ou la catégorie du parent (`aucune` = sans catégorie) et la voix
 * qu'il a choisie.
 */
const choix = (eleveId, choixId, prof) => (eleveId === 'parent'
  ? { categorieId: choixId === 'aucune' || choixId == null ? null : choixId, prof }
  : { matiereId: choixId });

/** Les cours envoyés et leurs épisodes (sans texte), du plus récent au plus ancien, et la jauge. */
export const getMesPodcasts = (eleveId) => httpClient.get(base(eleveId));

/** La jauge du mois : podcasts utilisés, maximum, restants, crédits de la famille, remise à zéro, packs, plafonds. */
export const getQuotaPodcasts = (eleveId) => httpClient.get(`${base(eleveId)}/quota`);

/** Un brouillon dans une matière. Rend `{ id }`. */
export const creerCoursPodcast = (eleveId, matiereId, prof) =>
  httpClient.post(`${base(eleveId)}/cours`, choix(eleveId, matiereId, prof));

export const modifierCoursPodcast = (eleveId, coursId, matiereId, prof) =>
  httpClient.put(`${base(eleveId)}/cours/${coursId}`, choix(eleveId, matiereId, prof));

/** Les professeurs que le parent peut choisir pour lire son podcast : `[{ avatar, prenom, matieres }]`. */
export const getProfesseursPodcast = () => httpClient.get('/parents/moi/mes-podcasts/professeurs');

/** Un cours, ses pages, ses notions et ses épisodes avec leur texte (`paragraphes`). */
export const getCoursPodcast = (eleveId, coursId) => httpClient.get(`${base(eleveId)}/cours/${coursId}`);

export const supprimerCoursPodcast = (eleveId, coursId) => httpClient.delete(`${base(eleveId)}/cours/${coursId}`);

export const ajouterPagePodcast = (eleveId, coursId, fichier) => {
  const corps = new FormData();
  corps.append('fichier', fichier, fichier.name);
  return httpClient.post(`${base(eleveId)}/cours/${coursId}/pages`, corps);
};

export const ecrireTextePodcast = (eleveId, coursId, texte) =>
  httpClient.put(`${base(eleveId)}/cours/${coursId}/texte`, { texte });

export const supprimerPagePodcast = (eleveId, coursId, pageId) =>
  httpClient.delete(`${base(eleveId)}/cours/${coursId}/pages/${pageId}`);

export const creerScanPodcast = (eleveId, coursId) => httpClient.post(`${base(eleveId)}/cours/${coursId}/scan-mobile`);

export const etatScanPodcast = (eleveId, coursId, jeton) =>
  httpClient.get(`${base(eleveId)}/cours/${coursId}/scan-mobile/${jeton}`);

/**
 * L'AVANCEMENT D'UN COURS (15/11/2026) : état, épisodes demandés et faits, pourcentage (0 à 100, null hors
 * fabrication). Une réponse courte, relue toutes les quelques secondes par la barre de toutes les pages.
 */
export const getAvancementPodcast = (eleveId, coursId) =>
  httpClient.get(`${base(eleveId)}/cours/${coursId}/avancement`);

/**
 * LE RÉSUMÉ DE LIVRE (15/11/2026) : le titre du livre, écrit ou dicté, et son auteur s'il le connaît. Prend la place du
 * texte d'un podcast libre.
 */
export const ecrireLivrePodcast = (eleveId, coursId, titre, auteur) =>
  httpClient.put(`${base(eleveId)}/cours/${coursId}/livre`, { titre, auteur });

/** Le brouillon part à la lecture. */
export const envoyerCoursPodcast = (eleveId, coursId) => httpClient.post(`${base(eleveId)}/cours/${coursId}/envoyer`);

/** Les épisodes d'un cours lu : les rangs des notions choisies (à partir de 1). */
export const demanderEpisodes = (eleveId, coursId, notions = []) =>
  httpClient.post(`${base(eleveId)}/cours/${coursId}/episodes`, { notions });

export const supprimerEpisode = (eleveId, episodeId) => httpClient.delete(`${base(eleveId)}/episodes/${episodeId}`);

/**
 * L'AUDIO D'UN ÉPISODE, EN BLOB. Un `<audio src>` ne sait pas porter l'en-tête d'authentification ni le billet de
 * la salle d'attente : on le télécharge par le client HTTP, et le lecteur lit l'URL locale du blob.
 * `wav` : pour un navigateur qui ne lit pas l'Ogg Opus (iPhone avant iOS 18.4).
 */
export const getAudioEpisode = (eleveId, episodeId, wav = false) =>
  httpClient.get(`${base(eleveId)}/episodes/${episodeId}/audio${wav ? `?format=wav&v=${VERSION_WAV}` : ''}`, { responseType: 'blob' });

/**
 * LA VERSION DU WAV (15/11/2026). L'audio est gardé un an par le navigateur (« immutable ») : le jour où le serveur
 * change sa façon de fabriquer le WAV, l'adresse doit changer, sinon le navigateur ressert l'ancien. Le 15/11, le WAV
 * décodé en 24 kHz était du bruit (MP3 inaudible) ; la version 2 est celle qui décode en 48 kHz.
 */
const VERSION_WAV = 2;

/** L'encadré « Podcasts » de Mon forfait (parent) : réserve, podcasts du mois par enfant, packs. */
export const getPodcastsDuForfait = () => httpClient.get('/abonnements/podcasts');

/** Achète un pack de crédits de podcasts : rend `{ urlPaiement }`, ou `{ credits }` pour un compte exempté. */
export const acheterPodcasts = (pack) => httpClient.post(`/abonnements/podcasts?pack=${encodeURIComponent(pack)}`);
