import { useEffect, useState } from 'react';

/**
 * LES OUTILS COMMUNS DES SCÈNES DU GROUPE « PRIMAIRE-MATHS-B » (09/10/2026) —
 * le crible, la boîte mystère, le sac de billes, la règle des dixièmes, la
 * géométrie, le tableau du marché et le robot. Chaque jeu a son univers et son
 * CSS (`sc-<clé du jeu>`) ; ici, seulement ce qui ne se voit pas.
 *
 * LES EXPLICATIONS SE DÉROULENT EN CSS : chaque étape porte son rang (`--n`)
 * et apparaît après les précédentes. Pas de minuterie à nettoyer, et en
 * mouvement réduit, tout est là d'un coup (l'état final est l'état de repos).
 * Seule la coccinelle qui compte suit une minuterie (`useEtapes`).
 */

/** Un tableau de `n` éléments numérotés : de quoi dessiner des billes, des traits… */
export const rangee = (n) => Array.from({ length: Math.max(0, Math.min(Number(n) || 0, 200)) }, (_, i) => i);

/** Les nombres entiers d'un texte, dans l'ordre : « ▢ + 17 = 45 » → [17, 45]. */
export const entiersDe = (texte) => (String(texte ?? '').match(/\d+/g) ?? []).map(Number);

/** Le style d'une étape de l'explication : son rang dans le déroulé. */
export const rang = (n) => ({ '--n': n });

/** L'enfant a demandé moins de mouvement : on montre directement la fin. */
export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * UN DÉROULÉ PAS À PAS, quand l'explication doit suivre un objet qui bouge
 * (la coccinelle qui saute de trait en trait) : 0, 1, 2… jusqu'à `total`,
 * une étape toutes les `cadence` millisecondes. Une seule minuterie à la
 * fois, nettoyée au démontage ; en mouvement réduit, la fin tout de suite.
 */
export function useEtapes(total, cadence = 380, depart = 500) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), n === 0 ? depart : cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence, depart]);
  return Math.min(n, total);
}
