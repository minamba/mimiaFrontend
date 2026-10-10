import { Game } from 'js-chess-engine';
import { rangDe } from './reglages.js';

/**
 * LES ÉCHECS — Camara, le 09/10/2026 (modèle Genially « Jeu d'échecs ») :
 * « un jeu d'échecs, avec le choix de la difficulté pour les enfants ».
 *
 * LE MOTEUR : `js-chess-engine` (licence MIT) — toutes les règles (roque,
 * prise en passant, promotion, échec et mat, pat) et une IA à cinq niveaux.
 * Stockfish, plus fort, est sous GPL : écarté pour un produit payant.
 *
 * L'ENFANT CHOISIT SA DIFFICULTÉ ; celle de sa classe est mise en avant. Les
 * blancs pour l'enfant, les noirs pour l'ordinateur. Le « débutant » joue au
 * hasard bien plus qu'il ne calcule : un enfant de six ans doit pouvoir gagner.
 *
 * LES NOIRS SONT ROUGES À L'ÉCRAN (09/10/2026) : le palais de glace oppose des
 * pièces de cristal bleu et de cristal rouge. Camara : « ce n'est pas le roi noir,
 * mais rouge ». La consigne et les noms dits au lecteur d'écran suivent ; le
 * code garde « noir » (c'est le camp, pour la règle des échecs).
 *
 * LE MODE DÉFI RETIRE LES AIDES : en tranquille, les coups possibles
 * s'allument et l'on peut reprendre son coup ; en défi, ni l'un ni l'autre.
 */
export const PHRASES = {
  consigne: 'Choisis ta difficulté, puis joue avec les blancs. Mets le roi rouge échec et mat !',
  echec: 'Échec au roi !',
  gagne: 'Échec et mat ! Bravo, tu as gagné la partie !',
  perdu: 'Échec et mat… L’ordinateur a gagné cette fois. Tu feras mieux la prochaine fois, c’est certain.',
  // « pat » et non « nul » (10/10/2026) : nul.mp3 est un nom RÉSERVÉ sous Windows, Git refusait de l'indexer.
  pat: 'Pat : personne ne peut gagner. Match nul !',
};

export const DIFFICULTES = [
  { cle: 'debutant', libelle: 'Débutant', detail: 'Il joue un peu au hasard', niveau: 1, hasard: 80 },
  { cle: 'facile', libelle: 'Facile', detail: 'Il voit un coup à l’avance', niveau: 2, hasard: 30 },
  { cle: 'moyen', libelle: 'Moyen', detail: 'Il réfléchit vraiment', niveau: 3, hasard: 8 },
  { cle: 'fort', libelle: 'Fort', detail: 'Pour les joueurs aguerris', niveau: 4, hasard: 0 },
];

/** La difficulté conseillée selon l'année. */
export function difficulteConseillee(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 3) return 'debutant';
  if (rang <= 5) return 'facile';
  if (rang <= 9) return 'moyen';
  return 'fort';
}

/**
 * Les pièces dessinées en caractères — pleines pour les deux camps, la
 * couleur vient du style. Le sélecteur U+FE0E impose le dessin en texte :
 * sans lui, certains appareils affichent le pion en émoji.
 */
const DESSINS = {
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};
export const dessin = (piece) => `${DESSINS[piece.toLowerCase()]}︎`;
export const estBlanche = (piece) => piece === piece.toUpperCase();

const NOMS = {
  k: 'roi', q: 'dame', r: 'tour', b: 'fou', n: 'cavalier', p: 'pion',
};
export const nomDe = (piece) => `${NOMS[piece.toLowerCase()]} ${estBlanche(piece) ? 'blanc' : 'rouge'}`;

export const COLONNES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
/** Les 64 cases, de A8 en haut à gauche à H1 en bas à droite : l'enfant a les blancs en bas. */
export const CASES = [8, 7, 6, 5, 4, 3, 2, 1].flatMap((l) => COLONNES.map((c) => `${c}${l}`));

/** Une partie neuve, ou reprise d'un état exporté. */
export const nouvellePartie = (etat) => (etat ? new Game(etat) : new Game());

/** Les pièces prises, par camp : ce qui manque à chaque armée depuis le départ. */
const DEPART = {
  P: 8, N: 2, B: 2, R: 2, Q: 1, p: 8, n: 2, b: 2, r: 2, q: 1,
};
export function piecesPrises(pieces) {
  const restent = {};
  Object.values(pieces).forEach((p) => { restent[p] = (restent[p] ?? 0) + 1; });
  const prises = { blanches: [], noires: [] };
  Object.entries(DEPART).forEach(([p, n]) => {
    const manque = Math.max(0, n - (restent[p] ?? 0));
    for (let i = 0; i < manque; i += 1) prises[estBlanche(p) ? 'blanches' : 'noires'].push(p);
  });
  return prises;
}

/** Le coup de l'ordinateur pour cette difficulté : `{ DE: 'VERS' }`, déjà joué sur la partie. */
export function coupOrdi(partie, cleDifficulte) {
  const d = DIFFICULTES.find((x) => x.cle === cleDifficulte) ?? DIFFICULTES[0];
  return partie.ai({ level: d.niveau, randomness: d.hasard, play: true }).move;
}
