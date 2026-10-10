import { outils } from '../outils.js';
import { rangDe } from './reglages.js';

/**
 * LES PLANÈTES — Camara, le 09/10/2026 (modèle Genially « Jeu pour classer
 * les planètes ») : ranger les huit planètes du système solaire sur leurs
 * orbites, du Soleil vers l'extérieur.
 *
 * DE PLUS EN PLUS DIFFICILE :
 *   - du CP au CE2, une manche : l'ordre depuis le Soleil ; chaque orbite a la
 *     taille et la couleur de sa planète, en pointillés (un indice) ;
 *   - dès le CM1, une seconde manche : de la plus grande à la plus petite ;
 *   - dès la 6e, les orbites ne donnent plus d'indice ;
 *   - dès la 4e, les noms sont cachés : on reconnaît chaque planète à son
 *     aspect, et son nom s'affiche une fois posée.
 *
 * LES TAILLES SONT VRAIES dans leur ordre (Jupiter, Saturne, Uranus,
 * Neptune, Terre, Vénus, Mars, Mercure), adoucies pour tenir à l'écran.
 */
export const PHRASES = {
  consigne: 'Range les planètes sur leurs orbites, de la plus proche du Soleil à la plus lointaine.',
  'consigne-taille': 'Maintenant, range les planètes de la plus grande à la plus petite.',
  faux: 'Ce n’est pas sa place. Essaie une autre orbite.',
  bravo: 'Bravo, le système solaire est en ordre !',
  dommage: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

/** Les huit planètes, dans l'ordre depuis le Soleil. `taille` : rayon relatif à l'écran. */
export const PLANETES = [
  { cle: 'mercure', nom: 'Mercure', taille: 0.38, couleurs: ['#d9d4cf', '#8e8780'] },
  { cle: 'venus', nom: 'Vénus', taille: 0.55, couleurs: ['#ffd29a', '#e8893a'] },
  { cle: 'terre', nom: 'Terre', taille: 0.58, couleurs: ['#7fd3ff', '#2e7d32'] },
  { cle: 'mars', nom: 'Mars', taille: 0.45, couleurs: ['#ff8a6b', '#b23a26'] },
  { cle: 'jupiter', nom: 'Jupiter', taille: 1, couleurs: ['#e8c9a2', '#8b5a3c'] },
  { cle: 'saturne', nom: 'Saturne', taille: 0.88, couleurs: ['#f6e3a8', '#c49a50'], anneau: true },
  { cle: 'uranus', nom: 'Uranus', taille: 0.7, couleurs: ['#c8f4ff', '#4fb6d6'] },
  { cle: 'neptune', nom: 'Neptune', taille: 0.68, couleurs: ['#7aa8ff', '#1d3fae'] },
];

/** Ce que l'année ouvre : la manche des tailles, les indices, les noms. */
export function reglageDe(niveau) {
  const rang = rangDe(niveau);
  return {
    manches: rang >= 4 ? ['distance', 'taille'] : ['distance'],
    indices: rang <= 5,
    noms: rang <= 7,
  };
}

/** L'ordre attendu d'une manche : une liste de clés de planètes. */
export function ordreAttendu(manche) {
  if (manche === 'distance') return PLANETES.map((p) => p.cle);
  return [...PLANETES].sort((a, b) => b.taille - a.taille).map((p) => p.cle);
}

/** Le plateau de départ d'une manche : les planètes mélangées dans la réserve. */
export function reserve(graine, manche) {
  const { melanger } = outils(graine + (manche === 'taille' ? 7 : 0));
  return melanger(PLANETES.map((p) => p.cle));
}

/** La planète va-t-elle à cette place ? */
export const aSaPlace = (manche, cle, place) => ordreAttendu(manche)[place] === cle;

export const planete = (cle) => PLANETES.find((p) => p.cle === cle);
