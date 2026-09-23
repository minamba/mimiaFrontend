/**
 * L'APERÇU DES « MOTS ÉCLAIR », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Un éclair, et un mot qui passe.
 */
export default function VignetteEclair() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Un éclair et le mot dans"
    >
      <path d="M30 4 12 34h13l-5 24 22-34H29z" className="jeu-vignette__jeton" />
      <rect x="54" y="14" width="70" height="34" rx="8" className="jeu-vignette__vide" />
      <text x="89" y="38" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>dans</text>
    </svg>
  );
}
