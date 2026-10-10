import { Cligne, Decor, Mascotte } from './communs';

/**
 * LES MOTS ÉCLAIR, LEUR UNIVERS (09/10/2026). La couverture : un garçon
 * attrape au vol des cartes de mots qui filent dans des traînées de lumière,
 * des éclairs jaunes partout, un chronomètre, une lampe de bureau. La scène
 * reprend :
 *   - LE DÉCOR : des traînées de vitesse, des éclairs qui crépitent, des
 *     cartes qui filent — BLANCHES, sans un mot : un mot du décor se lirait à
 *     la place du mot éclair —, la lampe, le chronomètre (lent : ce n'est pas
 *     une course, l'enfant déclenche l'éclair quand il est prêt) ;
 *   - L'ÉCLAIR : quand le mot passe, la pièce s'illumine d'un coup ;
 *   - LA MASCOTTE : Zip, un petit éclair jaune, qui crépite en attendant,
 *     tressaille quand le mot passe, bondit sur la bonne carte ;
 *   - LA FÊTE : une gerbe d'éclairs (voir `MotsEclair.js`).
 */

const TRAINEES = [[12, 3.2, 0], [26, 4.1, 1.4], [41, 2.8, 2.3], [57, 3.6, 0.7], [71, 4.4, 2.9], [86, 3, 1.9]];
const ECLAIRS = [[8, 20, 0], [88, 30, 1.1], [14, 70, 2.2], [92, 76, 0.6], [50, 8, 1.7]];
const CARTES = [[18, 9, 0, -8], [62, 11, 3, 6], [35, 13, 6, -4], [80, 10, 8, 10]];

function Boulon() {
  return (
    <svg viewBox="0 0 40 60" focusable="false">
      <path d="M24 2 L6 34 H19 L14 58 L34 24 H21 Z" fill="#ffd23f" stroke="#e09b00" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function Chrono() {
  return (
    <svg className="sc-mots-eclair__chrono" viewBox="0 0 80 90" focusable="false">
      <rect x="33" y="2" width="14" height="9" rx="2" fill="#8d99a6" />
      <circle cx="40" cy="50" r="34" fill="#c7cfd8" stroke="#6b7785" strokeWidth="4" />
      <circle cx="40" cy="50" r="27" fill="#fff" />
      <path d="M40 50 L40 23 A27 27 0 0 1 63 37 Z" fill="#e5383b" opacity="0.85" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <path key={i} d="M40 26 V30" stroke="#33404d" strokeWidth="2" transform={`rotate(${i * 30} 40 50)`} />
      ))}
      <g className="sc-mots-eclair__aiguille">
        <path d="M40 50 V28" stroke="#1b2a4a" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="40" cy="50" r="3.5" fill="#1b2a4a" />
    </svg>
  );
}

function Lampe() {
  return (
    <svg className="sc-mots-eclair__lampe" viewBox="0 0 120 90" focusable="false">
      <path d="M4 4 L40 22" stroke="#2b2f36" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 14 L70 8 L84 44 L44 54 Z" fill="#2b2f36" />
      <ellipse className="sc-mots-eclair__ampoule" cx="64" cy="50" rx="18" ry="7" transform="rotate(-14 64 50)" fill="#fff3b0" />
    </svg>
  );
}

/** L'orage de mots, derrière le cadre. `eclair` : le mot passe, la pièce s'illumine. */
export function DecorOrage({ eclair }) {
  return (
    <Decor className={`sc-mots-eclair__decor${eclair ? ' est-eclair' : ''}`}>
      {TRAINEES.map(([y, duree, delai]) => (
        <span key={y} className="sc-mots-eclair__trainee" style={{ '--y': `${y}%`, '--duree': `${duree}s`, '--delai': `${-delai}s` }} />
      ))}
      {CARTES.map(([y, duree, delai, angle]) => (
        <span
          key={y}
          className="sc-mots-eclair__carte-volante"
          style={{
            '--y': `${y}%`, '--duree': `${duree}s`, '--delai': `${-delai}s`, '--angle': `${angle}deg`,
          }}
        >
          <span />
          <span />
        </span>
      ))}
      {ECLAIRS.map(([x, y, delai]) => (
        <span key={`${x}-${y}`} className="sc-mots-eclair__boulon" style={{ '--x': `${x}%`, '--y': `${y}%`, '--delai': `${delai}s` }}>
          <Boulon />
        </span>
      ))}
      <Lampe />
      <Chrono />
      {eclair && <span className="sc-mots-eclair__flash" />}
    </Decor>
  );
}

/** Zip, le petit éclair : un zigzag jaune avec des yeux. */
export function Zip({ humeur, declic }) {
  return (
    <Mascotte nom="eclair" humeur={humeur} declic={declic}>
      <svg className="sc-mots-eclair__zip" viewBox="0 0 110 130" focusable="false">
        <g className="sc-mots-eclair__etincelles">
          <path d="M14 30 L4 24 M18 18 L12 6 M92 92 L104 98 M88 104 L96 116" stroke="#ffe680" strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <path
          d="M66 4 L20 70 H50 L36 126 L92 50 H60 L80 4 Z"
          fill="#ffd23f"
          stroke="#d98a00"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M66 10 L30 64 H40" stroke="#fff6c2" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        <Cligne>
          <circle cx="50" cy="56" r="6" fill="#fff" />
          <circle cx="66" cy="56" r="6" fill="#fff" />
          <circle cx="49" cy="57" r="3.3" fill="#3b2600" />
          <circle cx="65" cy="57" r="3.3" fill="#3b2600" />
          <circle cx="48" cy="56" r="1.1" fill="#fff" />
          <circle cx="64" cy="56" r="1.1" fill="#fff" />
        </Cligne>
        <path className="sc-cp-ce1-francais__sourire" d="M50 68 Q58 74 66 68" fill="none" stroke="#7a4a00" strokeWidth="2.6" strokeLinecap="round" />
        <path className="sc-cp-ce1-francais__bouche" d="M49 66 Q58 80 67 66 Z" fill="#c2334f" stroke="#7a4a00" strokeWidth="2" />
      </svg>
    </Mascotte>
  );
}
