/**
 * L'APERÇU DU « CHANTIER DES FORMES », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Le dessin montre un tas de formes en contour, dont
 * un carré posé sur la pointe — la situation du jeu, et son piège principal.
 */
export default function VignetteChantier() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Un tas de formes : un triangle, un carré sur la pointe, un cercle et un rectangle"
    >
      <polygon points="18,8 34,40 2,40" className="jeu-vignette__trait" />
      <polygon points="56,6 72,22 56,38 40,22" className="jeu-vignette__trait" />
      <circle cx="94" cy="22" r="15" className="jeu-vignette__trait" />
      <rect x="26" y="46" width="80" height="12" rx="1" className="jeu-vignette__trait" />
    </svg>
  );
}
