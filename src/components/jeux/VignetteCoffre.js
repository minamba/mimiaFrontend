/**
 * L'APERÇU DU « COFFRE DES CENTAINES », sur sa carte de la ludothèque : une
 * plaque, deux barres, trois cubes — le matériel du jeu, et le nombre 123.
 */
export default function VignetteCoffre() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une plaque de cent, deux barres de dix et trois cubes"
    >
      <rect x="8" y="10" width="42" height="42" rx="3" className="jeu-vignette__jeton" />
      <rect x="58" y="10" width="9" height="42" rx="2" className="jeu-vignette__jeton" />
      <rect x="71" y="10" width="9" height="42" rx="2" className="jeu-vignette__jeton" />
      <rect x="88" y="43" width="9" height="9" rx="2" className="jeu-vignette__jeton" />
      <rect x="100" y="43" width="9" height="9" rx="2" className="jeu-vignette__jeton" />
      <rect x="112" y="43" width="9" height="9" rx="2" className="jeu-vignette__jeton" />
      <text x="105" y="30" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 16 }}>123</text>
    </svg>
  );
}
