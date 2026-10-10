import { useEffect, useState } from 'react';

/**
 * LES OUTILS COMMUNS DES SCÈNES DU GROUPE « PRIMAIRE-MATHS-A » (09/10/2026) —
 * le calcul malin, les grands nombres, les fractions, les aires, les durées,
 * les mesures, la suite qui continue et la recette pour 8. Chaque jeu a son
 * univers et son CSS (`sc-<clé du jeu>`) ; ici, seulement ce qui ne se voit
 * pas : le mouvement réduit, le déroulé pas à pas, l'écriture des nombres.
 */

/** L'enfant a demandé moins de mouvement : on montre directement la fin. */
export function mouvementReduit() {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * LE DÉROULÉ PAS À PAS DE L'EXPLICATION — comme l'usine Python qui rejoue son
 * programme : 0, 1, 2… jusqu'à `total`, une étape toutes les `cadence`
 * millisecondes. Une seule minuterie à la fois, nettoyée au démontage ; en
 * mouvement réduit, la dernière étape tout de suite.
 */
export function useDeroule(total, cadence = 900, depart = 350) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), n === 0 ? depart : cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence, depart]);
  return Math.min(n, total);
}

/** « 4,5 » : un nombre à la française, sans les bavures des flottants. */
export const fr = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',');

/** « 4,50 € » : un prix. */
export const euros = (x) => `${x.toFixed(2).replace('.', ',')} €`;

/** « 1 250 » : les classes séparées par une espace. */
export const enClasses = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** « 2,5 » → 2.5 ; NaN si ce n'est pas un nombre. */
export const lireNombre = (texte) => Number(String(texte).replace(/\s/g, '').replace(',', '.'));

/** Un tableau de `n` éléments numérotés : de quoi dessiner des billes, des parts… */
export const rangee = (n) => Array.from({ length: Math.max(0, n) }, (_, i) => i);
