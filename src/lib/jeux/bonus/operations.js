import { outils } from '../outils.js';
import { rangDe } from './reglages.js';

/**
 * LES OPÉRATIONS À TROUS — Camara, le 09/10/2026 (modèle Genially
 * « Mathematical operations ») : « l'enfant sélectionne un signe et le place
 * dans le trou pour obtenir le résultat ».
 *
 * LES SIGNES SUIVENT L'ANNÉE : + et − au CP et au CE1, le × au CE2, le ÷ au
 * CM. À partir de la 6e, DEUX trous par calcul : les priorités entrent en
 * jeu (8 ? 3 ? 2 = 14, c'est 8 + 3 × 2). Dès la 4e, les nombres relatifs.
 *
 * UNE SEULE RÉPONSE PAR CALCUL, toujours : 2 ? 2 = 4 accepte + et ×, et un
 * enfant qui met × aurait raison sans qu'on le lui dise. Le générateur essaie
 * TOUTES les combinaisons de signes et écarte les calculs qui en admettent
 * plus d'une. Aucune division qui ne tombe pas juste.
 */
export const SIGNES = ['+', '-', '×', '÷'];
export const AFFICHE = {
  '+': '+', '-': '−', '×': '×', '÷': '÷',
};

export const PHRASES = {
  consigne: 'Choisis un signe, puis pose-le dans une case : chaque calcul doit donner le bon résultat.',
  'consigne-priorites': 'Deux signes par calcul : souviens-toi, on multiplie et on divise avant d’additionner et de soustraire.',
  faux: 'Ce signe ne donne pas le bon résultat. Essaie un autre signe.',
  bravo: 'Bravo, tous tes calculs sont justes !',
  dommage: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

/** Les signes permis à cette année. */
export function signesDe(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 2) return ['+', '-'];
  if (rang === 3) return ['+', '-', '×'];
  return SIGNES;
}

const unSigne = (a, s, b) => {
  if (s === '+') return a + b;
  if (s === '-') return a - b;
  if (s === '×') return a * b;
  if (b === 0 || a % b !== 0) return null;
  return a / b;
};
const fort = (s) => s === '×' || s === '÷';

/** La valeur d'un calcul à un ou deux signes, priorités comprises ; null si une division ne tombe pas juste. */
export function evaluer(termes, signes) {
  if (signes.length === 1) return unSigne(termes[0], signes[0], termes[1]);
  const [a, b, c] = termes;
  const [s1, s2] = signes;
  if (fort(s2) && !fort(s1)) {
    const droite = unSigne(b, s2, c);
    return droite === null ? null : unSigne(a, s1, droite);
  }
  const gauche = unSigne(a, s1, b);
  return gauche === null ? null : unSigne(gauche, s2, c);
}

/** Toutes les combinaisons de signes qui donnent le résultat. */
function solutions(termes, resultat, permis) {
  const combos = termes.length === 2 ? permis.map((s) => [s]) : permis.flatMap((s) => permis.map((t) => [s, t]));
  return combos.filter((c) => evaluer(termes, c) === resultat);
}

function tirerTermes(o, rang, signes) {
  const { entre, au } = o;
  if (rang <= 5) {
    const s = au(signes);
    if (rang <= 1) {
      const a = entre(1, 9); const b = entre(1, 9);
      return { termes: s === '-' ? [Math.max(a, b), Math.min(a, b)] : [a, b], signes: [s] };
    }
    if (rang === 2) {
      const a = entre(2, 20); const b = entre(1, 15);
      return { termes: s === '-' ? [Math.max(a, b), Math.min(a, b)] : [a, b], signes: [s] };
    }
    if (s === '×') return { termes: [entre(2, rang === 3 ? 5 : 10), entre(2, 10)], signes: [s] };
    if (s === '÷') {
      const b = entre(2, 10); const q = entre(2, 10);
      return { termes: [b * q, b], signes: [s] };
    }
    const a = entre(10, rang === 3 ? 50 : 100); const b = entre(2, rang === 3 ? 40 : 90);
    return { termes: s === '-' ? [Math.max(a, b), Math.min(a, b)] : [a, b], signes: [s] };
  }
  const relatifs = rang >= 8;
  const n = () => entre(1, rang >= 10 ? 15 : 12);
  const a = relatifs && entre(0, 2) === 0 ? -n() : n();
  return { termes: [a, n(), n()], signes: [au(signes), au(signes)] };
}

/** Une partie : six calculs (cinq à deux trous à partir de la 6e), chacun à réponse unique. */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const rang = rangDe(niveau);
  const permis = signesDe(niveau);
  const nombre = rang <= 5 ? 6 : 5;
  const calculs = [];
  const vus = new Set();
  let essais = 0;
  while (calculs.length < nombre && essais < 5000) {
    essais += 1;
    const { termes, signes } = tirerTermes(o, rang, permis);
    const resultat = evaluer(termes, signes);
    if (resultat === null) continue;
    // Pas de résultat négatif avant la 4e, ni de résultat démesuré.
    if (rang < 8 && resultat < 0) continue;
    if (Math.abs(resultat) > (rang <= 2 ? 30 : 200)) continue;
    if (solutions(termes, resultat, permis).length !== 1) continue;
    const cle = `${termes.join(',')}=${resultat}`;
    if (vus.has(cle)) continue;
    vus.add(cle);
    calculs.push({ termes, signes, resultat });
  }
  return calculs;
}

/** Le calcul est-il juste avec ces signes ? */
export function juste(calcul, choix) {
  return choix.length === calcul.signes.length && choix.every(Boolean) && evaluer(calcul.termes, choix) === calcul.resultat;
}

/** Un nombre tel qu'on l'écrit : les négatifs entre parenthèses quand ils ne sont pas en tête. */
export function ecrireNombre(n, enTete) {
  const t = String(Math.abs(n));
  if (n >= 0) return t;
  return enTete ? `−${t}` : `(−${t})`;
}
