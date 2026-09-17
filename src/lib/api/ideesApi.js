import httpClient, { API_BASE_URL } from './httpClient';

/**
 * Le carnet d'idées d'évolution, côté administration.
 *
 * Les pièces jointes ne transitent par aucune de ces listes : elles ont leur
 * propre adresse, servie une par une et mise en cache par le navigateur.
 */
export const getIdees = () => httpClient.get('/admin/idees');

export const getIdee = (id) => httpClient.get(`/admin/idees/${id}`);

export const creerIdee = (idee) => httpClient.post('/admin/idees', idee);

export const modifierIdee = (id, idee) => httpClient.put(`/admin/idees/${id}`, idee);

export const supprimerIdee = (id) => httpClient.delete(`/admin/idees/${id}`);

/**
 * Attache un fichier à une idée : image, audio ou document.
 *
 * UNE SEULE ROUTE POUR LES TROIS — Camara, le 17/09/2026. Ce sont la même
 * chose en base : des octets accrochés à une idée. Ce qui les sépare est ce
 * qu'on en fait à l'écran, et le serveur le dit dans le champ `genre` de la
 * réponse : `image` s'affiche dans le texte, `audio` s'écoute sur place,
 * `document` se télécharge.
 *
 * La réponse porte aussi `rang` — le nombre à citer dans `[image:N]` —, qui
 * vaut 0 quand ce n'est pas une image.
 */
export const ajouterPieceIdee = (id, fichier) => {
  const corps = new FormData();
  corps.append('fichier', fichier);

  return httpClient.post(`/admin/idees/${id}/pieces`, corps);
};

/**
 * Retire une pièce et renvoie la description.
 *
 * RÉÉCRITE POUR UNE IMAGE : les marqueurs des suivantes ont reculé d'un rang.
 * Inchangée pour un audio ou un document, qui ne sont cités nulle part.
 */
export const retirerPieceIdee = (id, pieceId) =>
  httpClient.delete(`/admin/idees/${id}/pieces/${pieceId}`);

/**
 * Les octets d'une pièce, ramenés par une requête AUTHENTIFIÉE.
 *
 * PAS DE `src` DIRECT VERS L'API, ET C'EST LA RAISON D'ÊTRE DE CETTE FONCTION.
 * L'application s'authentifie par un en-tête `Authorization`, pas par un
 * cookie : une balise `<img src="/admin/idees/1/pieces/2">` partirait sans
 * jeton et recevrait un 401. On télécharge donc le fichier comme n'importe
 * quelle autre requête, et on en fait une adresse locale.
 *
 * Coller le jeton dans l'URL aurait été l'autre solution, et elle est mauvaise :
 * les URL se retrouvent dans les journaux du serveur, dans l'historique du
 * navigateur et dans les en-têtes `Referer`.
 *
 * L'APPELANT DOIT LIBÉRER L'ADRESSE (`URL.revokeObjectURL`) quand il ne s'en
 * sert plus : sans cela, chaque ouverture d'aperçu laisse une copie du fichier
 * en mémoire jusqu'au rechargement de la page.
 */
export const chargerPieceIdee = async (id, pieceId) => {
  const { data } = await httpClient.get(`/admin/idees/${id}/pieces/${pieceId}`, {
    responseType: 'blob',
  });

  return URL.createObjectURL(data);
};

// Gardée pour les tests et le débogage : l'adresse réelle de la route.
export const cheminPieceIdee = (id, pieceId) =>
  `${API_BASE_URL}/admin/idees/${id}/pieces/${pieceId}`;
