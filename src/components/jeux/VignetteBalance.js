/**
 * L'APERÇU DE « LA BALANCE », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Une balance qui penche du côté du petit objet — le
 * piège du jeu, en un dessin.
 */
export default function VignetteBalance() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une balance qui penche du côté du petit objet"
    >
      <line x1="66" y1="12" x2="66" y2="56" className="jeu-vignette__trait" />
      <line x1="26" y1="8" x2="106" y2="20" className="jeu-vignette__trait" />
      <line x1="16" y1="26" x2="40" y2="26" className="jeu-vignette__trait" />
      <line x1="92" y1="38" x2="116" y2="38" className="jeu-vignette__trait" />
      <circle cx="28" cy="16" r="9" className="jeu-vignette__vide" />
      <circle cx="104" cy="33" r="4" className="jeu-vignette__jeton" />
    </svg>
  );
}
