import { rangDe } from './reglages.js';

/**
 * LE MORPION — Camara, le 09/10/2026 (« le tic-tac-toe, je ne sais plus
 * comment ça s'appelle en français »). L'enfant (✕) contre l'ordinateur (◯),
 * trois manches.
 *
 * L'ORDINATEUR S'AFFÛTE AVEC L'ANNÉE, et le mode défi le rend d'un cran plus
 * fort — ici, le défi, c'est l'adversaire, pas la montre :
 *   0 — distrait : il joue au hasard, gagne s'il le voit une fois sur deux ;
 *   1 — attentif : il gagne s'il peut, bloque s'il doit, sinon au hasard ;
 *   2 — rusé : il calcule tout, mais se trompe un coup sur quatre ;
 *   3 — imbattable : il calcule tout ; le mieux qu'on puisse faire est un nul.
 *
 * DES GRILLES PLUS GRANDES (10/10/2026) — Camara : « c'est trop simple, je
 * voudrais un niveau compliqué avec plus de cases ». L'enfant choisit sa
 * difficulté, comme aux échecs (celle de sa classe est mise en avant) :
 * Facile et Moyen sur 3 × 3 (aligner 3), Difficile sur 5 × 5 et Expert sur
 * 7 × 7 (aligner 4). Sur une grande grille, le calcul complet est impossible :
 * l'ordinateur y note chaque case d'après les alignements qu'elle ouvre ou
 * qu'elle coupe (`noter`), et en Expert il regarde en plus la meilleure
 * réponse de l'enfant à chacun de ses coups.
 */
export const PHRASES = {
  'consigne-choix': 'Choisis ta difficulté : plus elle monte, plus la grille est grande et plus il faut aligner de croix.',
  consigne: 'Aligne trois croix avant l’ordinateur : en ligne, en colonne ou en diagonale.',
  'consigne-quatre': 'Aligne quatre croix avant l’ordinateur : en ligne, en colonne ou en diagonale.',
  gagne: 'Bravo, tu as gagné la manche !',
  // « match-nul » et non « nul » (10/10/2026) : nul.mp3 est un nom RÉSERVÉ sous Windows, Git refusait de l'indexer.
  'match-nul': 'Match nul ! Personne n’a aligné trois signes.',
  'nul-quatre': 'Match nul ! Personne n’a aligné quatre signes.',
  perdu: 'L’ordinateur a gagné cette manche. Tu feras mieux la prochaine fois, c’est certain.',
  bravo: 'Bravo, la partie est finie !',
};

export const ENFANT = 'X';
export const ORDI = 'O';
export const MANCHES = 3;

/** La grille classique : 3 × 3, aligner 3. */
export const CLASSIQUE = { taille: 3, aligner: 3 };

/** Les quatre difficultés, de la plus douce à la plus dure. */
export const DIFFICULTES = [
  {
    cle: 'facile', libelle: 'Facile', detail: '3 × 3 · il joue un peu au hasard', taille: 3, aligner: 3, force: 0,
  },
  {
    cle: 'moyen', libelle: 'Moyen', detail: '3 × 3 · il réfléchit', taille: 3, aligner: 3, force: 2,
  },
  {
    cle: 'difficile', libelle: 'Difficile', detail: '5 × 5 · aligne 4', taille: 5, aligner: 4, force: 2,
  },
  {
    cle: 'expert', libelle: 'Expert', detail: '7 × 7 · aligne 4, il voit loin', taille: 7, aligner: 4, force: 3,
  },
];

export const difficulte = (cle) => DIFFICULTES.find((d) => d.cle === cle) ?? DIFFICULTES[0];

/** Celle qu'on met en avant pour la classe. */
export function difficulteConseillee(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 2) return 'facile';
  if (rang <= 5) return 'moyen';
  return rang <= 9 ? 'difficile' : 'expert';
}

/** Toutes les lignes gagnantes (fenêtres de `aligner` cases) d'une grille. */
const lignesCache = new Map();
export function lignesDe({ taille, aligner }) {
  const cle = `${taille}/${aligner}`;
  if (lignesCache.has(cle)) return lignesCache.get(cle);
  const lignes = [];
  const dans = (l, c) => l >= 0 && c >= 0 && l < taille && c < taille;
  [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(([dl, dc]) => {
    for (let l = 0; l < taille; l += 1) {
      for (let c = 0; c < taille; c += 1) {
        if (dans(l + dl * (aligner - 1), c + dc * (aligner - 1))) {
          lignes.push(Array.from({ length: aligner }, (_, k) => (l + dl * k) * taille + (c + dc * k)));
        }
      }
    }
  });
  lignesCache.set(cle, lignes);
  return lignes;
}

/** Le gagnant et sa ligne, 'nul' si la grille est pleine, sinon null. */
export function issue(grille, plateau = CLASSIQUE) {
  for (const l of lignesDe(plateau)) {
    const v = grille[l[0]];
    if (v && l.every((k) => grille[k] === v)) return { gagnant: v, ligne: l };
  }
  return grille.every(Boolean) ? { gagnant: 'nul', ligne: [] } : null;
}

const libres = (g) => g.map((v, i) => (v ? null : i)).filter((i) => i !== null);

/** Le coup qui fait gagner `joueur` tout de suite, s'il existe. */
function coupGagnant(g, joueur, plateau = CLASSIQUE) {
  return libres(g).find((i) => issue(g.map((v, k) => (k === i ? joueur : v)), plateau)?.gagnant === joueur) ?? null;
}

function minimax(g, joueur) {
  const fin = issue(g);
  if (fin) return { score: fin.gagnant === ORDI ? 1 : fin.gagnant === ENFANT ? -1 : 0 };
  let meilleur = null;
  libres(g).forEach((i) => {
    const suite = g.map((v, k) => (k === i ? joueur : v));
    const { score } = minimax(suite, joueur === ORDI ? ENFANT : ORDI);
    if (!meilleur || (joueur === ORDI ? score > meilleur.score : score < meilleur.score)) meilleur = { score, coup: i };
  });
  return meilleur;
}

/**
 * LA NOTE D'UNE CASE sur une grande grille : pour chaque ligne qui la contient
 * et où l'adversaire n'a encore rien, plus j'y ai de signes, plus elle vaut
 * (attaque) ; et pareil pour les lignes de l'adversaire (défense), un peu
 * moins. Le centre gagne une petite prime.
 */
const POIDS = [1, 6, 40, 400, 5000];
function noter(g, i, joueur, plateau) {
  const autre = joueur === ORDI ? ENFANT : ORDI;
  let note = 0;
  lignesDe(plateau).forEach((l) => {
    if (!l.includes(i)) return;
    const miens = l.filter((k) => g[k] === joueur).length;
    const siens = l.filter((k) => g[k] === autre).length;
    if (siens === 0) note += POIDS[Math.min(miens, POIDS.length - 1)];
    if (miens === 0) note += POIDS[Math.min(siens, POIDS.length - 1)] * 0.8;
  });
  const m = (plateau.taille - 1) / 2;
  const l = Math.floor(i / plateau.taille);
  const c = i % plateau.taille;
  return note + (plateau.taille - Math.abs(l - m) - Math.abs(c - m)) * 0.5;
}

function meilleurParNote(g, joueur, plateau) {
  let meilleur = null;
  libres(g).forEach((i) => {
    const n = noter(g, i, joueur, plateau);
    if (!meilleur || n > meilleur.n) meilleur = { i, n };
  });
  return meilleur?.i ?? null;
}

/** Une grande grille : gagner, bloquer, puis la meilleure note (en Expert, en tenant compte de la réponse). */
function coupGrandeGrille(g, force, hasard, plateau) {
  const possibles = libres(g);
  const auHasard = () => possibles[Math.floor(hasard() * possibles.length)];
  const gagne = coupGagnant(g, ORDI, plateau);
  if (force === 0) return gagne !== null && hasard() < 0.5 ? gagne : auHasard();
  if (gagne !== null) return gagne;
  const bloque = coupGagnant(g, ENFANT, plateau);
  if (bloque !== null) return bloque;
  if (force === 1) return hasard() < 0.4 ? auHasard() : meilleurParNote(g, ORDI, plateau);
  if (force === 2) return hasard() < 0.15 ? auHasard() : meilleurParNote(g, ORDI, plateau);
  // Expert : les 8 meilleures cases, chacune jugée d'après la meilleure réponse de l'enfant.
  const candidats = possibles
    .map((i) => ({ i, n: noter(g, i, ORDI, plateau) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  let meilleur = null;
  candidats.forEach(({ i, n }) => {
    const suite = g.map((v, k) => (k === i ? ORDI : v));
    const reponse = meilleurParNote(suite, ENFANT, plateau);
    const menace = reponse === null ? 0 : noter(suite, reponse, ENFANT, plateau);
    const valeur = n - menace * 0.6;
    if (!meilleur || valeur > meilleur.valeur) meilleur = { i, valeur };
  });
  return meilleur?.i ?? meilleurParNote(g, ORDI, plateau);
}

/** La force de l'ordinateur : selon l'année, plus un cran en défi. */
export function forceDe(niveau, defi = false) {
  const rang = rangDe(niveau);
  const base = rang <= 2 ? 0 : rang <= 5 ? 1 : rang <= 9 ? 2 : 3;
  return Math.min(3, base + (defi ? 1 : 0));
}

/** Le coup de l'ordinateur. `hasard` : un nombre de [0, 1[ (tirage reproductible dans les tests). */
export function coupOrdi(grille, force, hasard = Math.random, plateau = CLASSIQUE) {
  if (plateau.taille > 3) return coupGrandeGrille(grille, force, hasard, plateau);
  const possibles = libres(grille);
  const auHasard = () => possibles[Math.floor(hasard() * possibles.length)];
  if (force === 0) {
    const gagne = coupGagnant(grille, ORDI);
    return gagne !== null && hasard() < 0.5 ? gagne : auHasard();
  }
  if (force === 1) {
    return coupGagnant(grille, ORDI) ?? coupGagnant(grille, ENFANT) ?? auHasard();
  }
  if (force === 2 && hasard() < 0.25) return coupGagnant(grille, ORDI) ?? auHasard();
  return minimax(grille, ORDI).coup;
}
