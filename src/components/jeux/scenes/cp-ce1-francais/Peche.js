import { Cligne, Decor, Mascotte } from './communs';

/**
 * LA PÊCHE AUX SONS, SON UNIVERS (09/10/2026). La couverture : une fillette
 * pêche depuis sa barque, sous l'eau un poisson-clown mord à l'hameçon, les
 * sons flottent dans des bulles (« ou », « on », « ch »), une tortue verte
 * sourit, un coffre déborde d'or près d'une étoile de mer. La scène reprend :
 *   - LE DÉCOR : la surface qui ondule, des rayons de soleil, des bulles qui
 *     montent, un banc de poissons au loin, des algues qui ondulent, la
 *     ligne au bouchon rouge et blanc et son hameçon, un coffre fermé ;
 *   - LA MASCOTTE : la tortue, qui nage sur place, cligne, fait une
 *     pirouette à la belle pêche et encourage d'un hochement après une erreur ;
 *   - LA FÊTE : le coffre au trésor s'ouvre, les pièces brillent, une gerbe de
 *     bulles s'envole (voir `PecheAuxSons.js`).
 * Les poissons eux-mêmes deviennent des poissons-clowns (des rayures blanches
 * sur le corps orange) : même bouton, même rôle.
 */

/** Les bulles qui montent : une table fixe, pour que rien ne saute d'un rendu à l'autre. */
const BULLES = [
  [4, 10, 9, 0], [11, 16, 11, 3], [19, 8, 8, 6], [27, 13, 10, 1.5], [36, 9, 12, 7],
  [47, 18, 9, 4], [58, 11, 11, 0.5], [66, 15, 8, 5.5], [74, 8, 10, 2.5], [83, 20, 12, 8],
  [90, 12, 9, 3.5], [96, 9, 11, 6.5],
];

/** Un poisson du banc lointain : une silhouette. */
const silhouette = (x, y, e) => `M${x} ${y} q${8 * e} ${-6 * e} ${16 * e} 0 l${6 * e} ${-4 * e} v${8 * e} l${-6 * e} ${-4 * e} q${-8 * e} ${6 * e} ${-16 * e} 0 z`;

function Banc({ className }) {
  return (
    <svg className={`sc-peche-aux-sons__banc ${className}`} viewBox="0 0 120 50" focusable="false">
      <path d={silhouette(8, 14, 1)} />
      <path d={silhouette(34, 26, 0.8)} />
      <path d={silhouette(14, 36, 0.9)} />
      <path d={silhouette(56, 16, 0.7)} />
      <path d={silhouette(70, 34, 1)} />
    </svg>
  );
}

function Algue({ className }) {
  return (
    <svg className={`sc-peche-aux-sons__algue ${className}`} viewBox="0 0 60 160" focusable="false">
      <path className="sc-peche-aux-sons__brin" d="M18 160 C6 120 30 100 16 66 C6 40 22 22 14 2" />
      <path className="sc-peche-aux-sons__brin sc-peche-aux-sons__brin--b" d="M34 160 C44 128 24 110 38 80 C48 58 34 40 44 18" />
      <path className="sc-peche-aux-sons__brin sc-peche-aux-sons__brin--c" d="M48 160 C54 140 44 128 52 104" />
    </svg>
  );
}

/** Le coffre au trésor : fermé pendant la pêche, il s'ouvre sur la belle pêche. */
function Coffre({ ouvert }) {
  return (
    <svg className={`sc-peche-aux-sons__coffre${ouvert ? ' est-ouvert' : ''}`} viewBox="0 0 120 100" focusable="false">
      <g className="sc-peche-aux-sons__or">
        <circle cx="42" cy="50" r="8" />
        <circle cx="60" cy="46" r="9" />
        <circle cx="78" cy="51" r="8" />
        <circle cx="52" cy="40" r="6" />
        <circle cx="70" cy="39" r="6" />
      </g>
      <g className="sc-peche-aux-sons__brille">
        <path d="M60 14 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" />
        <path d="M34 26 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
        <path d="M88 24 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
      </g>
      <rect x="18" y="52" width="84" height="42" rx="6" fill="#8a5a2b" stroke="#4e3117" strokeWidth="3" />
      <rect x="18" y="66" width="84" height="7" fill="#e3b33e" />
      <rect x="54" y="60" width="12" height="16" rx="2" fill="#f1c84b" stroke="#9c7419" strokeWidth="2" />
      <g className="sc-peche-aux-sons__couvercle">
        <path d="M18 54 V40 Q60 18 102 40 V54 Z" fill="#9b6a35" stroke="#4e3117" strokeWidth="3" />
        <path d="M18 46 Q60 26 102 46" stroke="#e3b33e" strokeWidth="5" fill="none" />
      </g>
    </svg>
  );
}

/** Le décor marin, derrière les poissons. `ouvert` : la belle pêche ouvre le coffre. */
export function DecorMarin({ ouvert }) {
  return (
    <Decor className="sc-peche-aux-sons__decor">
      <span className="sc-peche-aux-sons__surface" />
      {[0, 1, 2, 3].map((i) => <span key={i} className="sc-peche-aux-sons__rayon" style={{ '--n': i }} />)}
      <Banc className="sc-peche-aux-sons__banc--a" />
      <Banc className="sc-peche-aux-sons__banc--b" />
      {BULLES.map(([x, taille, duree, delai]) => (
        <span
          key={x}
          className="sc-peche-aux-sons__bulle"
          style={{
            '--x': `${x}%`, '--taille': `${taille}px`, '--duree': `${duree}s`, '--delai': `${-delai}s`,
          }}
        />
      ))}
      <svg className="sc-peche-aux-sons__ligne" viewBox="0 0 30 120" focusable="false">
        <path d="M15 0 V8 M15 34 V100" stroke="#2b1d0e" strokeWidth="1.6" />
        <path d="M3 22 A12 12 0 0 1 27 22 Z" fill="#e5383b" stroke="#8c1d1f" strokeWidth="2" />
        <path d="M3 22 A12 12 0 0 0 27 22 Z" fill="#fff" stroke="#8c1d1f" strokeWidth="2" />
        <path d="M15 100 V110 A6 6 0 0 1 3 110 L5 106" fill="none" stroke="#9aa6b2" strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      <Algue className="sc-peche-aux-sons__algue--g" />
      <Algue className="sc-peche-aux-sons__algue--d" />
      <Coffre ouvert={ouvert} />
    </Decor>
  );
}

/** La tortue : carapace verte, grands yeux, nageoires qui pagaient. Elle regarde vers le jeu. */
export function Tortue({ humeur, declic }) {
  return (
    <Mascotte nom="tortue" humeur={humeur} declic={declic}>
      <svg className="sc-peche-aux-sons__tortue" viewBox="0 0 130 100" focusable="false">
        <path className="sc-peche-aux-sons__palme sc-peche-aux-sons__palme--avant" d="M40 66 Q30 92 52 88 Q58 78 54 66 Z" fill="#7cc95e" stroke="#3f7a2c" strokeWidth="2.5" />
        <path className="sc-peche-aux-sons__palme sc-peche-aux-sons__palme--arriere" d="M92 68 Q104 88 112 78 Q110 68 98 62 Z" fill="#7cc95e" stroke="#3f7a2c" strokeWidth="2.5" />
        <path d="M108 52 L124 58 L108 62 Z" fill="#7cc95e" stroke="#3f7a2c" strokeWidth="2" />
        <ellipse cx="72" cy="56" rx="40" ry="28" fill="#3d9a4a" stroke="#1f5c28" strokeWidth="3" />
        <path d="M72 30 L84 40 L80 56 L64 56 L60 40 Z" fill="#6cc46f" stroke="#1f5c28" strokeWidth="2" />
        <path d="M48 44 L60 40 L64 56 L52 64 L40 56 Z" fill="#5ab25e" stroke="#1f5c28" strokeWidth="2" />
        <path d="M96 44 L84 40 L80 56 L92 64 L104 56 Z" fill="#5ab25e" stroke="#1f5c28" strokeWidth="2" />
        <path d="M34 64 Q72 90 110 64" fill="none" stroke="#c9e89a" strokeWidth="5" strokeLinecap="round" />
        <g className="sc-peche-aux-sons__tete">
          <circle cx="26" cy="46" r="20" fill="#8fd46a" stroke="#3f7a2c" strokeWidth="3" />
          <Cligne>
            <circle cx="20" cy="40" r="6.5" fill="#fff" />
            <circle cx="18.5" cy="40.5" r="3.6" fill="#1b2a4a" />
            <circle cx="17.4" cy="39" r="1.3" fill="#fff" />
          </Cligne>
          <circle cx="12" cy="52" r="3.4" fill="#ff9aa8" opacity="0.8" />
          <path className="sc-cp-ce1-francais__sourire" d="M14 56 Q22 62 30 56" fill="none" stroke="#1f3d14" strokeWidth="2.5" strokeLinecap="round" />
          <path className="sc-cp-ce1-francais__bouche" d="M13 55 Q22 68 31 55 Z" fill="#c2334f" stroke="#1f3d14" strokeWidth="2" />
        </g>
      </svg>
    </Mascotte>
  );
}
