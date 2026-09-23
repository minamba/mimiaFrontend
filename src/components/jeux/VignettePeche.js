/**
 * L'APERÇU DE « LA PÊCHE AUX SONS », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Deux poissons, une ligne de pêche, et la lettre du
 * son — la situation du jeu.
 */
export default function VignettePeche() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Deux poissons, une ligne de pêche, et la lettre ou"
    >
      <ellipse cx="36" cy="44" rx="18" ry="11" className="jeu-vignette__jeton" />
      <path d="M52 44 L62 36 L62 52 Z" className="jeu-vignette__jeton" />
      <ellipse cx="88" cy="44" rx="18" ry="11" className="jeu-vignette__vide" />
      <path d="M104 44 L114 36 L114 52 Z" className="jeu-vignette__vide" />
      <line x1="36" y1="4" x2="36" y2="33" className="jeu-vignette__trait" />
      <text x="96" y="22" textAnchor="middle" className="jeu-vignette__chiffre" style={{ fontSize: 18 }}>ou</text>
    </svg>
  );
}
