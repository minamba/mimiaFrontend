import { outils } from '../outils.js';
import { anneeDe, enCapitales, rangDe } from './reglages.js';
import { THEMES } from './donnees/vocabulaire.js';

/**
 * LES MOTS CACHÉS — Camara, le 09/10/2026 : « l'enfant doit garder la souris
 * cliquée pour faire un mot » (au doigt aussi, sur tablette).
 *
 * UN THÈME PAR PARTIE, tiré dans la liste de son année (`donnees/vocabulaire.js`).
 * LA GRILLE GRANDIT AVEC L'ANNÉE, et les directions avec elle :
 *   - CP, CE1 : de gauche à droite et de haut en bas seulement ;
 *   - CE2 → CM2 : la diagonale qui descend en plus ;
 *   - collège : les mots à l'envers et la diagonale qui monte ;
 *   - lycée : les huit directions.
 * Les accents tombent dans la grille, comme dans tous les mots mêlés : « é »
 * s'écrit E, « œ » s'écrit OE.
 */
export const PHRASES = {
  consigne: 'Retrouve tous les mots cachés dans la grille. Garde le doigt appuyé, ou la souris cliquée, pour tracer un mot.',
  bravo: 'Bravo, tu as trouvé tous les mots cachés !',
  dommage: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

const DROITE = [0, 1];
const BAS = [1, 0];
const DIAG_BAS = [1, 1];
const DIAG_HAUT = [-1, 1];

/** La taille de la grille et les directions permises, selon l'année. */
export function reglageDe(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 1) return { taille: 7, directions: [DROITE, BAS], envers: false };
  if (rang === 2) return { taille: 8, directions: [DROITE, BAS], envers: false };
  if (rang === 3) return { taille: 9, directions: [DROITE, BAS, DIAG_BAS], envers: false };
  if (rang <= 5) return { taille: 10, directions: [DROITE, BAS, DIAG_BAS], envers: false };
  if (rang <= 9) return { taille: 12, directions: [DROITE, BAS, DIAG_BAS, DIAG_HAUT], envers: true };
  return { taille: 13, directions: [DROITE, BAS, DIAG_BAS, DIAG_HAUT], envers: true };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Une partie : le thème, la grille (lignes de lettres), et chaque mot avec ses
 * cases. Un mot qui ne trouve pas sa place après mille essais est laissé de
 * côté : la grille ne propose que ce qu'elle contient vraiment.
 */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const { taille, directions, envers } = reglageDe(niveau);
  const themes = THEMES[anneeDe(niveau)] ?? THEMES.CP;
  const theme = o.au(themes);
  const grille = Array.from({ length: taille }, () => Array(taille).fill(''));
  const mots = [];

  // Les plus longs d'abord : ils ont le moins de places possibles.
  const aPlacer = [...theme.mots].sort((a, b) => enCapitales(b).length - enCapitales(a).length);
  aPlacer.forEach((mot) => {
    const lettres = enCapitales(mot);
    if (lettres.length > taille) return;
    for (let essai = 0; essai < 1000; essai += 1) {
      const [dl, dc] = o.au(directions);
      const aLEnvers = envers && o.entre(0, 2) === 0;
      const suite = aLEnvers ? [...lettres].reverse() : [...lettres];
      const l0 = o.entre(0, taille - 1);
      const c0 = o.entre(0, taille - 1);
      const cases = suite.map((_, i) => [l0 + dl * i, c0 + dc * i]);
      const dedans = cases.every(([l, c]) => l >= 0 && l < taille && c >= 0 && c < taille);
      if (!dedans) continue;
      const libre = cases.every(([l, c], i) => grille[l][c] === '' || grille[l][c] === suite[i]);
      if (!libre) continue;
      cases.forEach(([l, c], i) => { grille[l][c] = suite[i]; });
      // Les cases dans l'ordre du mot, quel que soit le sens où il est écrit.
      mots.push({ mot, lettres, cases: aLEnvers ? [...cases].reverse() : cases });
      return;
    }
  });

  for (let l = 0; l < taille; l += 1) {
    for (let c = 0; c < taille; c += 1) {
      if (!grille[l][c]) grille[l][c] = ALPHABET[o.entre(0, ALPHABET.length - 1)];
    }
  }
  // L'ordre du thème pour la liste affichée.
  mots.sort((a, b) => theme.mots.indexOf(a.mot) - theme.mots.indexOf(b.mot));
  return { titre: theme.titre, taille, grille, mots };
}

/**
 * Les cases d'un tracé, de la case de départ vers celle du doigt : en ligne
 * droite, horizontale, verticale ou diagonale. Un tracé biais se range sur la
 * direction la plus proche, comme on tire un trait à la règle.
 */
export function trace(depart, arrivee) {
  const [l0, c0] = depart;
  let dl = arrivee[0] - l0;
  let dc = arrivee[1] - c0;
  const n = Math.max(Math.abs(dl), Math.abs(dc));
  if (n === 0) return [depart];
  // Vers la direction la plus proche parmi les huit.
  const angle = Math.atan2(dl, dc);
  const huitieme = Math.round(angle / (Math.PI / 4));
  dl = Math.round(Math.sin((huitieme * Math.PI) / 4));
  dc = Math.round(Math.cos((huitieme * Math.PI) / 4));
  return Array.from({ length: n + 1 }, (_, i) => [l0 + dl * i, c0 + dc * i]);
}

/** Le mot que désignent ces cases, dans un sens ou dans l'autre — ou null. */
export function motTrace(partie, cases, dejaTrouves = []) {
  const cle = (cs) => cs.map(([l, c]) => `${l},${c}`).join('|');
  const voulu = cle(cases);
  const inverse = cle([...cases].reverse());
  return partie.mots.find((m) => !dejaTrouves.includes(m.mot) && (cle(m.cases) === voulu || cle(m.cases) === inverse)) ?? null;
}
