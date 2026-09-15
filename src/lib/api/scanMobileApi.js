import httpClient, { API_BASE_URL } from './httpClient';
import { baseApiScan } from '../storage/scanMobile';

/**
 * LA PAGE DU TÉLÉPHONE — des routes ouvertes, dont la seule autorisation est
 * le jeton du QR code. Voir `ScanMobileController.cs`.
 *
 * La base d'API est recalculée à chaque appel : en développement, le
 * téléphone passe par le serveur de développement (voir `baseApiScan`).
 */
const options = () => ({ baseURL: baseApiScan(API_BASE_URL) });

/** `{ profPrenom, matiere, expireLe, dejaEnvoye }` — 404 si le QR code est expiré. */
export const lireScanMobile = (jeton) =>
  httpClient.get(`/scan-mobile/${encodeURIComponent(jeton)}`, options());

export const envoyerScanMobile = (jeton, fichier, opts = {}) => {
  const corps = new FormData();
  corps.append('fichier', fichier, fichier.name);

  return httpClient.post(`/scan-mobile/${encodeURIComponent(jeton)}`, corps, {
    ...options(),
    onUploadProgress: opts.onProgression,
  });
};
