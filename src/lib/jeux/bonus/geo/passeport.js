/**
 * LE PASSEPORT DE « OÙ SUR TERRE ? » (10/10/2026) : chaque lieu trouvé y
 * reçoit son tampon, avec la date du premier passage.
 *
 * Dans ce navigateur seulement, une entrée par enfant — comme les records
 * (`recordTemps.js`). Un confort, pas une donnée : sans stockage (navigation
 * privée, stockage plein), le passeport reste vide et le jeu marche pareil.
 */
const CLE = 'mimia-passeport-geo';

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
  } catch { /* sans stockage, pas de tampon gardé */ }
}

/** Les tampons d'un enfant : `{ [idDuLieu]: dateIso }`. */
export function tampons(eleveId) {
  const ligne = tout()[eleveId || 'invite'];
  return ligne && typeof ligne === 'object' ? ligne : {};
}

/** Tamponne un lieu ; rend true si c'est un nouveau tampon. */
export function tamponner(eleveId, lieuId, date = new Date()) {
  const table = tout();
  const cle = eleveId || 'invite';
  const ligne = table[cle] && typeof table[cle] === 'object' ? table[cle] : {};
  if (ligne[lieuId]) return false;
  table[cle] = { ...ligne, [lieuId]: date.toISOString() };
  ecrire(table);
  return true;
}
