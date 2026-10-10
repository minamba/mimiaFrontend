import { rangDeLaClasse } from '../frise.js';

/**
 * LES JEUX BONUS — Camara, le 09/10/2026, modèles Genially à l'appui : devine
 * le mot, les mots cachés, devine la phrase, les paires, les opérations à
 * trous. « En bonus, car ce n'est pas lié aux notions de cours » : ils ont
 * leur rayon dans « Mes jeux », ne portent aucune compétence, et le professeur
 * ne les propose pas en fin de cours.
 *
 * DU CP À LA TERMINALE, la difficulté suit l'ANNÉE (le rang de la frise),
 * jamais la voie : une 1re STMG joue comme une 1re générale.
 *
 * UN CHRONO SELON LE MODE (choix de Camara) : en tranquille, il monte et
 * l'enfant bat son record de temps ; en défi, il descend, et à zéro c'est
 * fini — comme dans les escape games. Pas de cœurs dans ces jeux : le défi,
 * c'est la montre.
 */

/** L'année de la classe, de 1 (CP) à 12 (terminale) ; une classe inconnue joue au CP. */
export function rangDe(niveau) {
  return rangDeLaClasse(niveau) ?? 1;
}

/** La clé des données écrites par année : 'CP' … 'CM2', 'SIXIEME' … 'TERMINALE'. */
const CLES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME', 'SECONDE', 'PREMIERE', 'TERMINALE'];
export function anneeDe(niveau) {
  return CLES[rangDe(niveau) - 1];
}

/**
 * Le temps du défi, en secondes, par jeu et par année : assez pour finir sans
 * hésiter, pas assez pour flâner. À régler à l'usage.
 */
const DEFI = {
  operations: [150, 150, 150, 165, 165, 180, 180, 180, 180, 180, 180, 180],
  'mots-caches': [180, 180, 210, 240, 240, 270, 270, 300, 300, 300, 300, 300],
  'devine-le-mot': [180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180, 180],
  'devine-la-phrase': [210, 210, 210, 210, 210, 210, 210, 210, 210, 240, 240, 240],
  paires: [120, 120, 150, 150, 150, 180, 180, 180, 180, 180, 180, 180],
  puzzle: [90, 120, 150, 180, 180, 240, 240, 300, 300, 330, 360, 360],
  planetes: [120, 120, 120, 180, 180, 150, 150, 150, 150, 120, 120, 120],
  // 5 scènes à fouiller (10/10/2026) : 1 min par scène au CP, un peu moins chaque année.
  'image-qui-ment': [300, 300, 285, 270, 255, 240, 225, 210, 200, 190, 185, 180],
};
export function dureeDuDefi(jeu, niveau) {
  const table = DEFI[jeu];
  return table ? table[rangDe(niveau) - 1] : 180;
}

/** « 1:05 » : un temps en minutes et secondes. */
export function enMinutesSecondes(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Sans accents ni casse, une lettre par case : « Ébène » → « EBENE », « cœur » → « COEUR ». */
export function enCapitales(texte) {
  return String(texte ?? '')
    .replace(/œ/g, 'oe').replace(/Œ/g, 'OE').replace(/æ/g, 'ae').replace(/Æ/g, 'AE')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
}
