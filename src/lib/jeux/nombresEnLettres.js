/**
 * UN NOMBRE DE 0 À 9 999, EN LETTRES — pour les jeux du CE1 et du CE2, où « lire
 * et écrire les nombres jusqu'à 1000 » (puis 10 000) veut dire lire « trois cent
 * quarante-deux » ou « deux mille cinq ». « Mille » est invariable.
 *
 * L'ORTHOGRAPHE TRADITIONNELLE, celle des manuels de CE1 : des traits d'union
 * sous cent seulement (« trois cent quarante-deux »), « et » devant un
 * (« vingt et un », « soixante et onze », mais « quatre-vingt-un »), et le s
 * de « quatre-vingts » et de « deux cents » quand rien ne les suit. Les
 * rectifications de 1990 (« trois-cent-quarante-deux ») sont acceptées aussi,
 * mais un enfant ne doit pas voir les deux dans le même jeu.
 */

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
];
const DIZAINES = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];

function moinsDeCent(n) {
  if (n <= 16) return UNITES[n];
  if (n < 20) return `dix-${UNITES[n - 10]}`;

  // 70 à 79 et 90 à 99 se disent sur la vingtaine d'avant : soixante-dix,
  // quatre-vingt-douze.
  if (n < 80 && n >= 70) return n === 71 ? 'soixante et onze' : `soixante-${moinsDeCent(n - 60)}`;
  if (n >= 80) {
    if (n === 80) return 'quatre-vingts';
    return `quatre-vingt-${moinsDeCent(n - 80)}`;
  }

  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DIZAINES[d];
  if (u === 1) return `${DIZAINES[d]} et un`;
  return `${DIZAINES[d]}-${UNITES[u]}`;
}

function moinsDeMille(n) {
  if (n < 100) return moinsDeCent(n);

  const c = Math.floor(n / 100);
  const reste = n % 100;
  const centaines = c === 1 ? 'cent' : `${UNITES[c]} cent${reste === 0 ? 's' : ''}`;
  return reste === 0 ? centaines : `${centaines} ${moinsDeCent(reste)}`;
}

/**
 * JUSQU'À 999 999 999, POUR LES GRANDS NOMBRES DU CM1. Deux règles de plus :
 *   - « mille » est invariable, et « cent » et « vingt » perdent leur s devant
 *     lui : « deux cent mille », « quatre-vingt mille » ;
 *   - « million » est un nom : il prend un s (« deux millions »), et « cent »
 *     garde le sien devant lui (« deux cents millions »).
 */
function milliers(m) {
  if (m === 1) return 'mille';
  return `${moinsDeMille(m).replace(/cents$/, 'cent').replace(/vingts$/, 'vingt')} mille`;
}

export function enLettres(n) {
  if (!Number.isInteger(n) || n < 0 || n > 999999999) throw new Error(`Hors de 0 à 999 999 999 : ${n}`);
  if (n < 1000) return moinsDeMille(n);
  const millions = Math.floor(n / 1000000);
  const mille = Math.floor(n / 1000) % 1000;
  const reste = n % 1000;
  const morceaux = [];
  if (millions > 0) morceaux.push(`${moinsDeMille(millions)} million${millions > 1 ? 's' : ''}`);
  if (mille > 0) morceaux.push(milliers(mille));
  if (reste > 0) morceaux.push(moinsDeMille(reste));
  return morceaux.join(' ');
}
