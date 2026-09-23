/**
 * L'APERÇU DE « L'HORLOGE », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Un cadran qui montre 3 heures : la petite aiguille sur
 * le 3, la grande sur le 12.
 */
export default function VignetteHorloge() {
  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une horloge qui montre trois heures"
    >
      <circle cx="66" cy="31" r="27" className="jeu-vignette__trait" />
      {[0, 3, 6, 9].map((h) => {
        const a = (h / 12) * 2 * Math.PI;
        return (
          <circle key={h} cx={66 + 21 * Math.sin(a)} cy={31 - 21 * Math.cos(a)} r="2" className="jeu-vignette__jeton" />
        );
      })}
      <line x1="66" y1="31" x2="66" y2="11" className="jeu-vignette__trait" />
      <line x1="66" y1="31" x2="80" y2="31" className="jeu-vignette__trait" style={{ strokeWidth: 5 }} />
    </svg>
  );
}
