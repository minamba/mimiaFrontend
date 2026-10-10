/**
 * LE DOSSIER D'ENQUÊTE DE « L'IMAGE QUI MENT » (10/10/2026) : chaque scène
 * résolue s'y range, avec son intrus et s'il a été trouvé sans aide.
 *
 * Un CONFORT de ce navigateur, comme le record de temps (`recordTemps.js`) :
 * une clé par enfant, et rien de grave s'il disparaît (navigation privée,
 * stockage vidé ou bloqué) — le jeu marche pareil, le dossier repart vide.
 * Toute lecture et toute écriture passent par un try/catch.
 */
const CLE = 'mimia-dossier-enquete';

function tout() {
  try {
    const lu = JSON.parse(window.localStorage.getItem(CLE) || 'null');
    return lu && typeof lu === 'object' ? lu : {};
  } catch {
    return {};
  }
}

function ecrire(table) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(table));
  } catch { /* sans stockage, le dossier vaut pour la partie en cours */ }
}

const qui = (eleveId) => String(eleveId ?? 'invite');

/** Le dossier d'un enfant : { [sceneId]: { trouve, le } }. */
export function lireDossier(eleveId) {
  const d = tout()[qui(eleveId)];
  return d && typeof d === 'object' ? d : {};
}

/**
 * Range une scène résolue. Une scène trouvée le reste : la revoir et demander
 * de la voir ne retire pas l'étoile gagnée la première fois.
 */
export function rangerScene(eleveId, sceneId, trouve) {
  const table = tout();
  const dossier = { ...(table[qui(eleveId)] ?? {}) };
  const avant = dossier[sceneId];
  dossier[sceneId] = { trouve: Boolean(trouve || avant?.trouve), le: Date.now() };
  table[qui(eleveId)] = dossier;
  ecrire(table);
  return dossier;
}
