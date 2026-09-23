/**
 * L'APERÇU DE « LA COURSE DES TABLES », sur sa carte de la ludothèque : une
 * piste, une voiture, et un calcul.
 */
export default function VignetteCourse() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une piste de course et le calcul 3 fois 4"
    >
      <rect x="6" y="42" width="120" height="10" rx="5" className="jeu-vignette__vide" />
      <rect x="6" y="42" width="54" height="10" rx="5" className="jeu-vignette__jeton" />
      <circle cx="60" cy="47" r="7" className="jeu-vignette__trait" />
      <text x="66" y="28" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>3 × 4</text>
    </svg>
  );
}
