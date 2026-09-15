/**
 * LES ADRESSES DU SCANNER PAR QR CODE — en production comme en développement.
 *
 * PRODUCTION : le QR code porte l'origine de la page (https://mimia.fr), et le
 * téléphone appelle l'API au même endroit. Rien à régler.
 *
 * DÉVELOPPEMENT : tout vit sur `localhost`, qui pour un téléphone désigne le
 * téléphone lui-même. Le serveur de développement donne donc l'adresse de
 * l'ordinateur sur le réseau (voir `src/setupProxy.js`), le QR code la porte,
 * et la page du téléphone passe par ce même serveur pour joindre l'API.
 *
 * `REACT_APP_PUBLIC_URL` reste possible pour forcer une adresse — un tunnel,
 * un autre port — et l'emporte sur tout le reste.
 */

const HOTE_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;
const API_LOCALE = /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/;

/** L'adresse que porte le QR code. */
export function adresseScan(jeton, origine = window.location.origin) {
  const base = (process.env.REACT_APP_PUBLIC_URL || origine || '').replace(/\/+$/, '');
  return `${base}/scan/${encodeURIComponent(jeton)}`;
}

/**
 * L'origine à mettre dans le QR code.
 *
 * En développement, sur un ordinateur ouvert en `localhost`, on demande au
 * serveur de développement l'adresse de la machine sur le réseau. Si ça
 * échoue, on retombe sur l'origine de la page — le QR code marchera alors sur
 * l'ordinateur lui-même, pas sur un téléphone, mais rien ne casse.
 */
export async function origineScan({
  env = process.env,
  emplacement = window.location,
  recuperer = typeof window.fetch === 'function' ? window.fetch.bind(window) : null,
} = {}) {
  if (env.REACT_APP_PUBLIC_URL) return env.REACT_APP_PUBLIC_URL;

  if (env.NODE_ENV === 'development' && HOTE_LOCAL.test(emplacement.hostname) && recuperer) {
    try {
      const reponse = await recuperer('/__adresse-reseau');
      if (reponse.ok) {
        const { adresse } = await reponse.json();
        if (adresse) return adresse;
      }
    } catch {
      // Le serveur de développement ne répond pas : on garde l'origine.
    }
  }

  return emplacement.origin;
}

/**
 * La base d'API pour la PAGE DU TÉLÉPHONE.
 *
 * Si l'API est configurée sur `localhost` mais que la page est ouverte depuis
 * une autre machine — le téléphone —, on appelle en relatif : le serveur de
 * développement relaie. Partout ailleurs, la base habituelle, inchangée : en
 * production elle est déjà vide.
 */
export function baseApiScan(apiUrl, hote = window.location.hostname) {
  return API_LOCALE.test(apiUrl || '') && !HOTE_LOCAL.test(hote) ? '' : (apiUrl ?? '');
}

/** « 9:05 » — le temps qui reste avant que le QR code expire. */
export function tempsRestant(expireLe, maintenant = Date.now()) {
  const secondes = Math.max(0, Math.floor((new Date(expireLe).getTime() - maintenant) / 1000));
  return `${Math.floor(secondes / 60)}:${String(secondes % 60).padStart(2, '0')}`;
}
