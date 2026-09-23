/**
 * L'APERÇU DES « PARTS DE PIZZA », sur sa carte de la ludothèque : une pizza
 * coupée en quatre, trois parts garnies, et la fraction 3/4.
 */
export default function VignettePizza() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une pizza en quatre parts, trois garnies : trois quarts"
    >
      <circle cx="34" cy="31" r="25" className="jeu-vignette__vide" />
      <path d="M34 31 L34 6 A25 25 0 1 1 9 31 Z" className="jeu-vignette__jeton" />
      <text x="94" y="26" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>3</text>
      <line x1="84" y1="31" x2="104" y2="31" className="jeu-vignette__trait" />
      <text x="94" y="50" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>4</text>
    </svg>
  );
}
