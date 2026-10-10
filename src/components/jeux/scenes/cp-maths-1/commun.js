/**
 * LES BRIQUES COMMUNES DU GROUPE « CP-MATHS-1 » (09/10/2026) — la boîte de
 * 10, la marchande, le train des nombres et les paquets de dix. Chaque jeu a
 * son univers, sa mascotte et ses classes (`sc-<clé du jeu>`) ; ici, seulement
 * ce que les quatre partagent sans que l'enfant le voie : l'humeur de la
 * mascotte et la gerbe de la fête.
 *
 * AUCUNE MINUTERIE : tout se joue en CSS. Une réaction se rejoue en changeant
 * la `key` de l'élément qui la porte (un essai de plus = un nouvel élément),
 * et une fête s'éteint d'elle-même à la fin de son animation.
 */

/**
 * L'HUMEUR DE LA MASCOTTE, tirée de l'état du jeu — jamais un état à elle :
 *   - 'bravo'   la réponse est juste : elle saute, la fête part ;
 *   - 'aide'    deux essais faux, le jeu montre la réponse : elle console ;
 *   - 'oups'    un essai faux : elle penche la tête et encourage ;
 *   - 'attente' le reste du temps : elle respire, cligne, regarde le jeu.
 */
export function humeurDe({ juste = false, faux = false, aide = false }) {
  if (juste) return 'bravo';
  if (aide) return 'aide';
  if (faux) return 'oups';
  return 'attente';
}

/**
 * LES ÉCLATS D'UNE GERBE : `n` directions régulières autour du centre, deux
 * longueurs alternées, un léger retard en cascade. Pas de hasard — le même
 * rendu à chaque fois, et des tests qui ne dépendent pas d'un tirage.
 */
export function eclats(n = 14, portee = 160) {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.18 : 0);
    const r = portee * (i % 3 === 0 ? 1 : i % 3 === 1 ? 0.72 : 0.86);
    return {
      i,
      style: {
        '--dx': `${Math.round(Math.cos(angle) * r)}px`,
        '--dy': `${Math.round(Math.sin(angle) * r * 0.8)}px`,
        '--tour': `${(i % 2 ? 1 : -1) * (120 + (i % 4) * 60)}deg`,
        '--retard': `${(i % 5) * 0.05}s`,
      },
    };
  });
}

/**
 * LA GERBE DE LA FÊTE — une pluie d'éclats du thème (étoiles, plumes,
 * pièces, bûchettes…) qui part du centre de la scène et retombe. Purement
 * décorative : cachée aux lecteurs d'écran, elle laisse passer les clics, et
 * elle s'éteint seule (voir `sc-cp-maths-1-gerbe` dans le CSS du groupe).
 *
 * `formes` : une liste de fonctions qui dessinent UN éclat ; on les alterne.
 */
export function Gerbe({ prefixe, formes, nombre = 14, portee = 170 }) {
  return (
    <div className={`sc-cp-maths-1__gerbe ${prefixe}__gerbe`} aria-hidden="true">
      {eclats(nombre, portee).map(({ i, style }) => (
        <span key={i} className={`sc-cp-maths-1__eclat ${prefixe}__eclat`} style={style}>
          {formes[i % formes.length](i)}
        </span>
      ))}
    </div>
  );
}

/** Une étoile à cinq branches, en SVG : l'éclat que toutes les fêtes partagent. */
export function Etoile({ couleur = '#ffd34d' }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path
        d="M12 1.8l2.9 6.6 7.2.7-5.4 4.8 1.6 7.1L12 17.3 5.7 21l1.6-7.1L1.9 9.1l7.2-.7z"
        fill={couleur}
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Les classes d'une scène : son préfixe, son humeur, et la fête quand c'est gagné. */
export function classesScene(prefixe, humeur) {
  return `${prefixe} ${prefixe}--${humeur}${humeur === 'bravo' ? ` ${prefixe}--fete` : ''}`;
}
