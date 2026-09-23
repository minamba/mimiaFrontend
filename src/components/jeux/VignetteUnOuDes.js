/**
 * L'APERÇU DE « UN OU DES ? », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Un rond seul, trois ronds, et le s du pluriel.
 */
export default function VignetteUnOuDes() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Un objet seul, et trois objets avec un s"
    >
      <circle cx="22" cy="31" r="11" className="jeu-vignette__jeton" />
      <line x1="44" y1="10" x2="44" y2="52" className="jeu-vignette__trait" />
      <circle cx="62" cy="22" r="9" className="jeu-vignette__jeton" />
      <circle cx="84" cy="22" r="9" className="jeu-vignette__jeton" />
      <circle cx="73" cy="42" r="9" className="jeu-vignette__jeton" />
      <text x="112" y="42" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 26 }}>s</text>
    </svg>
  );
}
