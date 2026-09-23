/**
 * L'APERÇU DU « TRAIN DES NOMBRES », sur sa carte de la ludothèque.
 *
 * Comme celui de la boîte de 10, ce dessin n'est pas décoratif : c'est la
 * seule chose de la carte qu'un CP puisse lire. Il montre la situation du
 * jeu — une voie graduée, trois bornes écrites, un wagon à placer — et non un
 * train en général.
 */
export default function VignetteTrain() {
  const arrets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <svg
      className="jeu-vignette"
      viewBox="0 0 132 62"
      role="img"
      aria-label="Une voie graduée de zéro à dix, et un wagon à placer"
    >
      <rect x="6" y="40" width="120" height="4" rx="2" className="jeu-vignette__jeton" />

      {arrets.map((n) => {
        const x = 8 + n * 11.6;
        const borne = n === 0 || n === 5 || n === 10;

        return (
          <g key={n}>
            <rect
              x={x - 1.2}
              y={borne ? 30 : 34}
              width="2.4"
              height={borne ? 10 : 6}
              rx="1.2"
              className={borne ? 'jeu-vignette__jeton' : 'jeu-vignette__vide'}
            />
            {borne && (
              <text x={x} y="56" textAnchor="middle" className="jeu-vignette__chiffre">{n}</text>
            )}
          </g>
        );
      })}

      <rect x="42" y="8" width="28" height="16" rx="4" className="jeu-vignette__boite" />
    </svg>
  );
}
