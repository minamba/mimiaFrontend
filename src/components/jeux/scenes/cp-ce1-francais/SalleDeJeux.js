import { Cligne, Decor, Mascotte } from './communs';

/**
 * UN OU DES ?, SON UNIVERS (09/10/2026). La couverture : une salle de jeux
 * pleine de jouets — une guirlande de fanions, un nounours au nœud rouge, un
 * petit robot, des voitures (une rouge sur la carte « un », trois sur la
 * carte « des »), des cubes, un ballon étoilé. La scène reprend :
 *   - LE DÉCOR : la guirlande qui se balance, le ballon qui rebondit, la tour
 *     de cubes, le robot qui clignote, une petite voiture qui traverse ;
 *   - L'IMAGE devient une carte de la couverture, posée sur la table ;
 *   - LA MASCOTTE : le nounours, qui se dandine, lève les bras à la bonne
 *     étiquette, penche la tête pour encourager ;
 *   - LA FÊTE : des confettis, et les jouets de la carte sautent l'un après
 *     l'autre — un, ou des (voir `UnOuDes.js`).
 */

const FANIONS = ['#e5533d', '#f7d038', '#43a047', '#2b7bd6', '#ec5f9c', '#f59f2c', '#9c4dcc', '#26a69a', '#e5533d', '#f7d038', '#2b7bd6', '#43a047'];

function Guirlande() {
  return (
    <svg className="sc-un-ou-des__guirlande" viewBox="0 0 600 50" preserveAspectRatio="none" focusable="false">
      <path d="M0 6 Q300 34 600 6" stroke="#8a5f35" strokeWidth="2" fill="none" />
      {FANIONS.map((c, i) => {
        const x = 18 + i * 48;
        const t = x / 600;
        const y = 6 + 4 * 28 * t * (1 - t);
        return (
          // eslint-disable-next-line react/no-array-index-key
          <path key={i} className="sc-un-ou-des__fanion" style={{ '--n': i }} d={`M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 26} Z`} fill={c} />
        );
      })}
    </svg>
  );
}

function Cubes() {
  return (
    <svg className="sc-un-ou-des__cubes" viewBox="0 0 90 100" focusable="false">
      <rect x="6" y="58" width="38" height="38" rx="4" fill="#2b7bd6" stroke="#174a87" strokeWidth="2.5" />
      <rect x="46" y="58" width="38" height="38" rx="4" fill="#43a047" stroke="#25652a" strokeWidth="2.5" />
      <g className="sc-un-ou-des__cube-haut">
        <rect x="26" y="18" width="38" height="38" rx="4" fill="#f7d038" stroke="#a68510" strokeWidth="2.5" />
        <path d="M45 24 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z" fill="#e5533d" />
      </g>
    </svg>
  );
}

function Ballon() {
  return (
    <span className="sc-un-ou-des__ballon">
      <svg viewBox="0 0 50 50" focusable="false">
        <circle cx="25" cy="25" r="22" fill="#2b5fd9" stroke="#163a8c" strokeWidth="2.5" />
        <path d="M25 10 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z" fill="#f7d038" />
        <ellipse cx="17" cy="15" rx="6" ry="3.5" fill="#fff" opacity="0.4" />
      </svg>
    </span>
  );
}

function Robot() {
  return (
    <svg className="sc-un-ou-des__robot" viewBox="0 0 60 80" focusable="false">
      <path d="M30 4 V14" stroke="#7a8794" strokeWidth="3" />
      <circle className="sc-un-ou-des__antenne" cx="30" cy="5" r="4" fill="#e5383b" />
      <rect x="12" y="14" width="36" height="26" rx="7" fill="#dfe6ee" stroke="#7a8794" strokeWidth="2.5" />
      <circle cx="23" cy="27" r="4.5" fill="#2bb5e8" />
      <circle cx="37" cy="27" r="4.5" fill="#2bb5e8" />
      <rect x="16" y="44" width="28" height="24" rx="5" fill="#2b7bd6" stroke="#174a87" strokeWidth="2.5" />
      <circle cx="30" cy="56" r="4" fill="#f7d038" />
      <rect x="18" y="68" width="8" height="10" rx="2" fill="#7a8794" />
      <rect x="34" y="68" width="8" height="10" rx="2" fill="#7a8794" />
    </svg>
  );
}

function Voiture() {
  return (
    <span className="sc-un-ou-des__voiture">
      <svg viewBox="0 0 90 50" focusable="false">
        <path d="M8 34 V26 Q10 20 20 18 L30 8 H58 L70 18 Q84 20 84 30 V34 Z" fill="#e5383b" stroke="#8c1d1f" strokeWidth="2.5" />
        <path d="M34 12 H46 V20 H27 Z M50 12 H57 L65 20 H50 Z" fill="#cfeaf8" />
        <g className="sc-un-ou-des__roue">
          <circle cx="24" cy="36" r="9" fill="#2b2f36" />
          <circle cx="24" cy="36" r="3.5" fill="#c7cfd8" />
        </g>
        <g className="sc-un-ou-des__roue">
          <circle cx="68" cy="36" r="9" fill="#2b2f36" />
          <circle cx="68" cy="36" r="3.5" fill="#c7cfd8" />
        </g>
      </svg>
    </span>
  );
}

/** La salle de jeux, derrière la carte et l'étiquette. */
export function DecorSalleDeJeux() {
  return (
    <Decor className="sc-un-ou-des__decor">
      <Guirlande />
      {[[10, 30, 0], [90, 24, 1.2], [6, 58, 2], [94, 52, 0.6], [50, 16, 1.6]].map(([x, y, d]) => (
        <span key={`${x}-${y}`} className="sc-un-ou-des__scintille" style={{ '--x': `${x}%`, '--y': `${y}%`, '--delai': `${d}s` }} />
      ))}
      <Robot />
      <Cubes />
      <Ballon />
      <Voiture />
    </Decor>
  );
}

/** Le nounours de la couverture : brun, museau clair, nœud papillon rouge. */
export function Nounours({ humeur, declic }) {
  return (
    <Mascotte nom="nounours" humeur={humeur} declic={declic}>
      <svg className="sc-un-ou-des__nounours" viewBox="0 0 120 130" focusable="false">
        <g className="sc-un-ou-des__bras sc-un-ou-des__bras--g">
          <ellipse cx="22" cy="86" rx="12" ry="20" fill="#b97a45" stroke="#6e4220" strokeWidth="2.5" />
        </g>
        <g className="sc-un-ou-des__bras sc-un-ou-des__bras--d">
          <ellipse cx="98" cy="86" rx="12" ry="20" fill="#b97a45" stroke="#6e4220" strokeWidth="2.5" />
        </g>
        <ellipse cx="60" cy="98" rx="36" ry="30" fill="#c98a52" stroke="#6e4220" strokeWidth="3" />
        <ellipse cx="60" cy="104" rx="20" ry="16" fill="#efd3a8" />
        <ellipse cx="36" cy="124" rx="14" ry="8" fill="#b97a45" stroke="#6e4220" strokeWidth="2.5" />
        <ellipse cx="84" cy="124" rx="14" ry="8" fill="#b97a45" stroke="#6e4220" strokeWidth="2.5" />
        <g className="sc-un-ou-des__tete">
          <circle cx="30" cy="18" r="13" fill="#b97a45" stroke="#6e4220" strokeWidth="2.5" />
          <circle cx="90" cy="18" r="13" fill="#b97a45" stroke="#6e4220" strokeWidth="2.5" />
          <circle cx="30" cy="18" r="6" fill="#efd3a8" />
          <circle cx="90" cy="18" r="6" fill="#efd3a8" />
          <circle cx="60" cy="42" r="32" fill="#c98a52" stroke="#6e4220" strokeWidth="3" />
          <ellipse cx="60" cy="54" rx="15" ry="11" fill="#efd3a8" />
          <ellipse cx="60" cy="48" rx="6" ry="4.5" fill="#3b2412" />
          <Cligne>
            <circle cx="47" cy="36" r="4.5" fill="#2a1a0c" />
            <circle cx="73" cy="36" r="4.5" fill="#2a1a0c" />
            <circle cx="45.8" cy="34.6" r="1.4" fill="#fff" />
            <circle cx="71.8" cy="34.6" r="1.4" fill="#fff" />
          </Cligne>
          <circle cx="38" cy="50" r="4.5" fill="#ff9aa8" opacity="0.7" />
          <circle cx="82" cy="50" r="4.5" fill="#ff9aa8" opacity="0.7" />
          <path className="sc-cp-ce1-francais__sourire" d="M53 58 Q60 63 67 58" fill="none" stroke="#3b2412" strokeWidth="2.4" strokeLinecap="round" />
          <path className="sc-cp-ce1-francais__bouche" d="M52 57 Q60 70 68 57 Z" fill="#c2334f" stroke="#3b2412" strokeWidth="2" />
        </g>
        <path d="M46 72 L60 78 L46 84 Z M74 72 L60 78 L74 84 Z" fill="#e5383b" stroke="#8c1d1f" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="60" cy="78" r="4" fill="#c42a2c" />
      </svg>
    </Mascotte>
  );
}
