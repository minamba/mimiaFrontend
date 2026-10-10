/**
 * LES BRIQUES COMMUNES DU GROUPE « CP-MATHS-2 » (09/10/2026) — le chantier
 * des formes, l'horloge, la balance et deux par deux. Chaque jeu a son
 * univers, son enfant et son CSS (`sc-<clé du jeu>`) ; ici, seulement ce qui
 * ne se voit pas, et la gerbe de la fête, dont chaque jeu choisit les motifs.
 */

/**
 * L'HUMEUR DE LA MASCOTTE, tirée de ce que le jeu sait déjà : la manche est
 * gagnée, ou une réponse vient d'être refusée. Rien d'autre — la mascotte ne
 * devine jamais, elle réagit.
 */
export function humeurDe({ gagne, refus }) {
  if (gagne) return 'bravo';
  return refus ? 'oups' : 'attente';
}

/**
 * LA GERBE DE LA FÊTE, à chaque réussite : des éclats partent du centre de la
 * scène et retombent. Une seule fois (le jeu la remonte à chaque manche avec
 * une `key`), sans minuterie : c'est le CSS qui anime, et il la cache en
 * mouvement réduit.
 *
 * LES PLACES NE SONT PAS TIRÉES AU HASARD : le rendu reste pur, et la gerbe
 * est la même à chaque rendu d'une même manche. `motifs` est une liste de
 * dessins SVG (viewBox 0 0 40 40), pris tour à tour.
 */
export function Gerbe({ prefixe, motifs, nombre = 18 }) {
  return (
    <div className={`${prefixe}__fete`} aria-hidden="true">
      {Array.from({ length: nombre }, (_, i) => {
        const angle = (i / nombre) * 2 * Math.PI + 0.35;
        const loin = 150 + ((i * 47) % 5) * 26;
        const style = {
          '--x': `${Math.round(Math.cos(angle) * loin)}px`,
          '--y': `${Math.round(Math.sin(angle) * loin * 0.7 - 40)}px`,
          '--r': `${(i % 2 ? 1 : -1) * (160 + (i % 5) * 45)}deg`,
          '--t': `${(i % 4) * 70}ms`,
          '--e': `${0.8 + (i % 3) * 0.22}`,
        };
        return (
          // Des éclats sans identité : leur place dans la gerbe est leur clé.
          // eslint-disable-next-line react/no-array-index-key
          <svg key={i} className={`${prefixe}__eclat`} style={style} viewBox="0 0 40 40">
            {motifs[i % motifs.length]}
          </svg>
        );
      })}
    </div>
  );
}

/** Une étoile à cinq branches, centrée dans 40 × 40. */
export const ETOILE = (couleur = '#ffc83d', bord = '#e09a00') => (
  <path
    d="M20 3 L25 14.5 L37.5 15.5 L28 24 L31 36.5 L20 30 L9 36.5 L12 24 L2.5 15.5 L15 14.5 Z"
    fill={couleur}
    stroke={bord}
    strokeWidth="2"
    strokeLinejoin="round"
  />
);
