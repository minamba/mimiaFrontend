/**
 * L'APERÇU DE « LA MACHINE À DIX », sur sa carte de la ludothèque : un 7
 * entre, un 70 sort.
 */
export default function VignetteMachine() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une machine : 7 entre, 70 sort"
    >
      <text x="16" y="38" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>7</text>
      <rect x="34" y="12" width="56" height="38" rx="8" className="jeu-vignette__jeton" />
      <text x="62" y="37" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 15, fill: '#fff' }}>× 10</text>
      <text x="114" y="38" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>70</text>
    </svg>
  );
}
