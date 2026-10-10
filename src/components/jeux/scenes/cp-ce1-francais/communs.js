import './cp-ce1-francais.css';

/**
 * LES BRIQUES COMMUNES DES JEUX DE LECTURE DU CP ET DU CE1 (09/10/2026) —
 * Camara : « fais la même chose avec les jeux du CP, CE1, CE2 ». Ce que les
 * sept écrans du groupe partagent : le décor posé derrière le jeu, la
 * mascotte qui réagit, la fête de la réussite. Chaque jeu garde SON univers
 * (la mer, le studio, l'orage de mots, la salle de jeux, le bureau du
 * détective, le village, la fête foraine) ; seules ces mécaniques sont
 * communes. Classes préfixées `sc-cp-ce1-francais` (voir `cp-ce1-francais.css`).
 *
 * RIEN DE TOUT CELA NE SE LIT NI NE SE CLIQUE : décor, mascotte et fête sont
 * `aria-hidden` et laissent passer le doigt (`pointer-events: none`). Ils ne
 * portent aucun mot — un mot du décor pourrait se lire à la place de celui du
 * jeu (le mot éclair, l'étiquette « des »…). Tout est en CSS : pas de
 * minuterie, et tout s'arrête sous `prefers-reduced-motion`.
 */

/**
 * L'HUMEUR DE LA MASCOTTE : elle fête la réussite, encourage après une erreur
 * (jamais de moquerie), attend le reste du temps.
 */
export function humeurDe({ reussi = false, faute = false } = {}) {
  if (reussi) return 'bravo';
  if (faute) return 'encourage';
  return 'attente';
}

/**
 * LA MASCOTTE, en bas à droite du jeu (le bas gauche est au professeur dans
 * les jeux qui en ont un). `declic` rejoue le geste : deux erreurs de suite,
 * deux encouragements. Autour d'elle, des étoiles quand elle fête, un cœur
 * quand elle encourage.
 */
export function Mascotte({
  nom, humeur = 'attente', declic = 0, children,
}) {
  return (
    <div
      className={`sc-cp-ce1-francais__mascotte sc-cp-ce1-francais__mascotte--${nom}`}
      data-humeur={humeur}
      data-mascotte={nom}
      aria-hidden="true"
    >
      <div key={`${humeur}-${declic}`} className={`sc-cp-ce1-francais__pose est-${humeur}`}>
        {children}
      </div>
      {humeur === 'bravo' && (
        <span key={`b-${declic}`} className="sc-cp-ce1-francais__aureole">
          {[0, 1, 2, 3].map((i) => <span key={i} className="sc-cp-ce1-francais__etoile" style={{ '--n': i }} />)}
        </span>
      )}
      {humeur === 'encourage' && <span key={`e-${declic}`} className="sc-cp-ce1-francais__coeur" />}
    </div>
  );
}

const TEINTES = ['#ffd23f', '#ff6b6b', '#4dabf7', '#51cf66', '#cc5de8', '#ff922b'];

/**
 * LA FÊTE DE LA RÉUSSITE : une gerbe d'éclats qui part du milieu du jeu et
 * s'éteint — étoiles, bulles, notes, éclairs, confettis ou pétales, selon le
 * jeu. Elle ne joue qu'une fois (CSS, `both`) : posée à la réussite, retirée à
 * la manche suivante.
 */
export function Fete({ forme = 'etoile', nombre = 18 }) {
  return (
    <div className="sc-cp-ce1-francais__fete" data-forme={forme} aria-hidden="true">
      <span className="sc-cp-ce1-francais__flash" />
      {Array.from({ length: nombre }, (_, i) => (
        <span
          // Des éclats identiques : la place est la seule identité.
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`sc-cp-ce1-francais__eclat sc-cp-ce1-francais__eclat--${forme}`}
          style={{
            '--angle': `${(i * 360) / nombre + (i % 2) * 9}deg`,
            '--dist': `${120 + (i % 4) * 42}px`,
            '--delai': `${(i % 5) * 60}ms`,
            '--teinte': TEINTES[i % TEINTES.length],
            '--tour': `${(i % 2 ? 1 : -1) * (160 + i * 23)}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** Le calque du décor : derrière le jeu, jamais devant. */
export function Decor({ className = '', children }) {
  return (
    <div className={`sc-cp-ce1-francais__decor ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}

/** Des yeux qui clignent : un groupe SVG que le CSS referme de temps en temps. */
export function Cligne({ children, decalage = 0 }) {
  return (
    <g className="sc-cp-ce1-francais__cligne" style={{ '--decalage': `${decalage}s` }}>
      {children}
    </g>
  );
}
