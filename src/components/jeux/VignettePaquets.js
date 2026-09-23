/**
 * L'APERÇU DES « PAQUETS DE DIX », sur sa carte de la ludothèque.
 *
 * Il ne sert plus tant que le jeu a sa couverture illustrée — la carte n'en
 * affiche qu'une des deux. Il reste le repli, et il doit donc rester vrai :
 * des bûchettes, comme le décor et comme le jeu, jamais des jetons ronds.
 *
 * Le dessin montre un paquet déjà lié et trois bûchettes encore libres : la
 * situation du jeu, pas une illustration de dizaines en général.
 */
export default function VignettePaquets() {
  const buchette = (x, classe) => (
    <rect key={x} x={x} y="14" width="5" height="34" rx="2.5" className={classe} />
  );

  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Un paquet de dix bûchettes lié, et trois bûchettes libres"
    >
      {/* Le paquet : dix bûchettes serrées, et leur lien en travers. */}
      {Array.from({ length: 10 }, (_, i) => buchette(8 + i * 7, 'jeu-vignette__jeton'))}
      <rect x="4" y="26" width="72" height="8" rx="2" className="jeu-vignette__boite" />

      {/* Les bûchettes restées libres, un peu à l'écart. */}
      {[96, 108, 120].map((x) => buchette(x, 'jeu-vignette__jeton'))}
    </svg>
  );
}
