import { useEffect, useState } from 'react';

/**
 * LES OUTILS COMMUNS DES SCÈNES DU GROUPE « CE2-MATHS » (09/10/2026) — le tour
 * du jardin, combien de temps, les bouteilles, le miroir et le diagramme.
 * Chaque jeu a son univers, sa mascotte et son CSS (`sc-<clé du jeu>`) ; ici,
 * ce qui ne se voit pas (le mouvement réduit, le déroulé pas à pas, l'humeur
 * de la mascotte) et la gerbe d'étoiles de la réussite, la même partout.
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
export function useDeroule(total, cadence = 900, depart = 400) {
  const [n, setN] = useState(() => (mouvementReduit() ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const id = setTimeout(() => setN((k) => k + 1), n === 0 ? depart : cadence);
    return () => clearTimeout(id);
  }, [n, total, cadence, depart]);
  return Math.min(n, total);
}

/**
 * L'HUMEUR DE LA MASCOTTE. Elle attend (et respire) ; elle fait la fête quand
 * l'enfant trouve ; elle l'encourage — jamais de moquerie — après un choix
 * faux ; elle explique quand la réponse est montrée après deux erreurs.
 */
export function humeurDe(termine, extra = {}) {
  if (termine) return extra?.trouve ? 'fete' : 'explique';
  return extra?.derniereFaute != null ? 'encourage' : 'attend';
}

/** Un tableau de `n` éléments numérotés. */
export const rangee = (n) => Array.from({ length: Math.max(0, n) }, (_, i) => i);

/**
 * LA FÊTE DE LA RÉUSSITE : des étoiles et des confettis qui jaillissent
 * autour de la mascotte. Tout le dessin est dans le CSS (`sc-ce2-maths__fete`).
 */
export function Fete({ couleurs = ['#ffd43b', '#ff6b6b', '#4dabf7', '#69db7c'] }) {
  return (
    <span className="sc-ce2-maths__fete" aria-hidden="true">
      {rangee(10).map((i) => (
        <span
          key={i}
          className={`sc-ce2-maths__eclat${i % 2 ? ' sc-ce2-maths__eclat--etoile' : ''}`}
          style={{ '--angle': `${i * 36}deg`, '--couleur': couleurs[i % couleurs.length], '--n': i }}
        />
      ))}
    </span>
  );
}

/**
 * LE MOT DE LA MASCOTTE, dans une bulle : « Bravo ! », « Essaie encore ! »…
 * Il n'est pas indispensable — la mascotte le dit déjà par son geste.
 */
const MOTS = { fete: 'Bravo !', encourage: 'Essaie encore !', explique: 'Regarde !' };
export function Bulle({ humeur }) {
  if (!MOTS[humeur]) return null;
  return <span key={humeur} className="sc-ce2-maths__bulle" aria-hidden="true">{MOTS[humeur]}</span>;
}
