/**
 * LE RECORD DE TEMPS DES JEUX BONUS — Camara, le 09/10/2026 : « mettre des
 * chronos dans les parties, comme ça il y a un challenge ». En tranquille, le
 * chrono monte : le record est le temps le plus COURT pour finir la partie.
 *
 * Même logique que `record.js` (dans ce navigateur, une clé par enfant, par
 * jeu et par classe — voir ses notes), mais un record qu'on bat en
 * descendant. Une table à part : mêler des temps et des scores dans la même
 * ferait comparer des secondes à des bonnes réponses.
 */
const CLE = 'mimia-records-temps';
const MAX = 300;

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
  } catch { /* sans stockage, pas de record : le jeu marche pareil */ }
}

const cleDe = (eleveId, jeu, niveau) => `${eleveId}|${jeu}|${niveau}`;

/** Le meilleur temps connu, en millisecondes, ou null. */
export function meilleurTemps(eleveId, jeu, niveau) {
  if (!eleveId || !jeu) return null;
  const ligne = tout()[cleDe(eleveId, jeu, niveau)];
  return ligne && typeof ligne.ms === 'number' ? ligne.ms : null;
}

/**
 * Enregistre une partie finie : `{ precedent, record }`, le meilleur temps
 * d'avant et si celui-ci le bat. Égaler n'est pas battre.
 */
export function enregistrerTemps(eleveId, jeu, niveau, ms) {
  if (!eleveId || !jeu || typeof ms !== 'number') return { precedent: null, record: false };
  const table = tout();
  const cle = cleDe(eleveId, jeu, niveau);
  const precedent = typeof table[cle]?.ms === 'number' ? table[cle].ms : null;
  const record = precedent !== null && ms < precedent;
  if (precedent === null || ms < precedent) {
    table[cle] = { ms, le: new Date().toISOString() };
    const cles = Object.keys(table);
    if (cles.length > MAX) {
      cles.sort((a, b) => String(table[a].le).localeCompare(String(table[b].le)))
        .slice(0, cles.length - MAX)
        .forEach((k) => { delete table[k]; });
    }
    ecrire(table);
  }
  return { precedent, record };
}
