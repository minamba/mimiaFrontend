/**
 * L'APERÇU DE « DEUX PAR DEUX », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Deux assiettes : l'une avec ses biscuits, l'autre sous
 * sa cloche — la question du jeu, en un dessin.
 */
export default function VignetteDeux() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Deux assiettes, l'une avec trois biscuits, l'autre sous une cloche"
    >
      <ellipse cx="34" cy="46" rx="28" ry="10" className="jeu-vignette__vide" />
      {[22, 34, 46].map((x) => <circle key={x} cx={x} cy="42" r="5" className="jeu-vignette__jeton" />)}
      <ellipse cx="98" cy="46" rx="28" ry="10" className="jeu-vignette__vide" />
      <path d="M72 46 Q72 14 98 14 Q124 14 124 46 Z" className="jeu-vignette__trait" />
      <circle cx="98" cy="11" r="3" className="jeu-vignette__jeton" />
    </svg>
  );
}
