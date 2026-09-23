/**
 * L'APERÇU DE « L'ATELIER DES SYLLABES », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Deux wagons pleins, un vide — la situation du jeu.
 */
export default function VignetteSyllabes() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Un train de trois wagons : ra, di, et un wagon vide"
    >
      <rect x="6" y="18" width="36" height="28" rx="6" className="jeu-vignette__jeton" />
      <rect x="48" y="18" width="36" height="28" rx="6" className="jeu-vignette__jeton" />
      <rect x="90" y="18" width="36" height="28" rx="6" className="jeu-vignette__vide" />
      <circle cx="16" cy="50" r="5" className="jeu-vignette__trait" />
      <circle cx="32" cy="50" r="5" className="jeu-vignette__trait" />
      <circle cx="58" cy="50" r="5" className="jeu-vignette__trait" />
      <circle cx="74" cy="50" r="5" className="jeu-vignette__trait" />
      <circle cx="100" cy="50" r="5" className="jeu-vignette__trait" />
      <circle cx="116" cy="50" r="5" className="jeu-vignette__trait" />
      <text x="24" y="38" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 15, fill: '#fff' }}>ra</text>
      <text x="66" y="38" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 15, fill: '#fff' }}>di</text>
    </svg>
  );
}
