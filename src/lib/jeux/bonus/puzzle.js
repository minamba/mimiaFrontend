import { outils } from '../outils.js';
import { rangDe } from './reglages.js';

/**
 * LE PUZZLE — Camara, le 09/10/2026 (modèle Genially « Very easy level ») :
 * « un jeu de puzzle partout, de plus en plus difficile, avec plus de pièces
 * selon les classes, du CP à la terminale ».
 *
 * LES IMAGES SONT LES DÉCORS PEINTS DES JEUX (`imagesSecondaire.js`), tous au
 * format 1400 × 788 : rien à produire, et l'enfant reconstitue des scènes
 * qu'il croise ailleurs dans Mimia.
 *
 * ON ÉCHANGE DEUX PIÈCES : un toucher sur l'une, un toucher sur l'autre (ou
 * un glisser à la souris). Une pièce à sa place se verrouille. Pas de pièce
 * « en vrac » hors du cadre : sur une tablette, c'est ce qui reste jouable.
 */
export const PHRASES = {
  consigne: 'Échange les pièces deux par deux pour reconstituer l’image.',
  bravo: 'Bravo, le puzzle est terminé !',
  dommage: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

/** Colonnes × lignes selon l'année : de 4 pièces au CP à 30 en terminale. */
const GRILLES = [[2, 2], [3, 2], [3, 3], [4, 3], [4, 3], [4, 4], [4, 4], [5, 4], [5, 4], [6, 4], [6, 5], [6, 5]];
export function grilleDe(niveau) {
  const [colonnes, lignes] = GRILLES[rangDe(niveau) - 1];
  return { colonnes, lignes };
}

/**
 * Une partie : l'image tirée parmi `images`, la grille, et `ordre` — pour
 * chaque case, la pièce qui s'y trouve. Aucune pièce n'est à sa place au
 * départ (sauf à deux pièces, où c'est impossible à éviter autrement).
 */
export function serie(graine = Date.now(), niveau = 'CP', images = []) {
  const o = outils(graine);
  const { colonnes, lignes } = grilleDe(niveau);
  const n = colonnes * lignes;
  let ordre = o.melanger(Array.from({ length: n }, (_, i) => i));
  for (let essai = 0; essai < 50 && ordre.some((p, i) => p === i); essai += 1) {
    ordre = o.melanger(ordre);
  }
  // Un dernier coup de pouce : décaler d'un cran les pièces restées en place.
  if (ordre.some((p, i) => p === i)) ordre = ordre.map((_, i) => ordre[(i + 1) % n]);
  return {
    image: images.length ? o.au(images) : null, colonnes, lignes, ordre,
  };
}

/** Échange le contenu de deux cases. */
export const echanger = (ordre, a, b) => ordre.map((p, i) => (i === a ? ordre[b] : i === b ? ordre[a] : p));

/** Combien de pièces sont à leur place. */
export const bienPlacees = (ordre) => ordre.filter((p, i) => p === i).length;
