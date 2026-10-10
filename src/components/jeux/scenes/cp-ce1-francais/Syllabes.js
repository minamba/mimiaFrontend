import { Cligne, Decor, Mascotte } from './communs';

/**
 * L'ATELIER DES SYLLABES, SON UNIVERS (09/10/2026). La couverture : un studio
 * de musique — des lampes suspendues, un disque au mur, un micro, un
 * xylophone arc-en-ciel, des notes qui volent, et des cartes de syllabes aux
 * lettres de couleur (« la » rouge, « ma » vert, « to » orange…). La scène
 * reprend :
 *   - LE DÉCOR : les lampes qui s'allument doucement, le disque qui tourne,
 *     des notes qui montent, le xylophone dont les lames s'allument une à une
 *     quand le mot est bien lu — comme on frappe les syllabes ;
 *   - LA MASCOTTE : Do, une note de musique bleue, qui bat la mesure, saute et
 *     tourne quand le train est juste, se balance pour encourager ;
 *   - LES ÉTIQUETTES deviennent les cartes de la couverture, chacune sa couleur ;
 *   - LA FÊTE : le train chante, wagon après wagon (voir `AtelierDesSyllabes.js`).
 */

const NOTES = [
  [6, '#e5533d', 9, 0], [16, '#2b7bd6', 11, 4], [30, '#43a047', 10, 7], [44, '#f59f2c', 12, 2],
  [62, '#9c4dcc', 9, 5.5], [74, '#e5533d', 11, 1], [86, '#2b7bd6', 10, 8], [95, '#43a047', 12, 3],
];

/** Une croche : une tête, une hampe, un crochet. */
function Croche({ couleur }) {
  return (
    <svg viewBox="0 0 30 40" focusable="false">
      <ellipse cx="10" cy="32" rx="8" ry="6" transform="rotate(-20 10 32)" fill={couleur} />
      <path d="M17 31 V4 Q26 8 27 17" fill="none" stroke={couleur} strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

const LAMES = ['#e5533d', '#f59f2c', '#f7d038', '#43a047', '#2b7bd6', '#9c4dcc'];

/** Le xylophone : six lames arc-en-ciel ; `joue` les allume une à une. */
function Xylophone({ joue }) {
  return (
    <svg className={`sc-atelier-syllabes__xylo${joue ? ' est-joue' : ''}`} viewBox="0 0 150 80" focusable="false">
      <path d="M6 30 L144 18 M6 66 L144 72" stroke="#7a4a22" strokeWidth="7" strokeLinecap="round" />
      {LAMES.map((c, i) => {
        const x = 12 + i * 22;
        const haut = 8 + i * 2;
        return (
          <rect
            key={c + x}
            className="sc-atelier-syllabes__lame"
            style={{ '--n': i }}
            x={x}
            y={haut + 6}
            width="17"
            height={64 - haut * 1.4}
            rx="3"
            fill={c}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="1.5"
          />
        );
      })}
      <g className="sc-atelier-syllabes__baguette">
        <path d="M118 6 L84 44" stroke="#c98a4a" strokeWidth="4" strokeLinecap="round" />
        <circle cx="82" cy="47" r="6.5" fill="#d9472b" />
      </g>
    </svg>
  );
}

/** Le studio, derrière le train. `joue` : le mot est bien lu, le xylophone le chante. */
export function DecorStudio({ joue }) {
  return (
    <Decor className="sc-atelier-syllabes__decor">
      {[0, 1].map((i) => (
        <span key={i} className={`sc-atelier-syllabes__lampe sc-atelier-syllabes__lampe--${i ? 'd' : 'g'}`}>
          <span className="sc-atelier-syllabes__abat-jour" />
          <span className="sc-atelier-syllabes__lumiere" />
        </span>
      ))}
      <svg className="sc-atelier-syllabes__disque" viewBox="0 0 60 60" focusable="false">
        <circle cx="30" cy="30" r="28" fill="#1c1c22" />
        <circle cx="30" cy="30" r="21" fill="none" stroke="#33333d" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="15" fill="none" stroke="#33333d" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="9" fill="#2b7bd6" />
        <path d="M30 23 A7 7 0 0 1 37 30" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.7" />
        <circle cx="30" cy="30" r="2" fill="#f4f1ea" />
      </svg>
      {NOTES.map(([x, couleur, duree, delai]) => (
        <span
          key={x}
          className="sc-atelier-syllabes__note"
          style={{ '--x': `${x}%`, '--duree': `${duree}s`, '--delai': `${-delai}s` }}
        >
          <Croche couleur={couleur} />
        </span>
      ))}
      <Xylophone joue={joue} />
    </Decor>
  );
}

/** Do, la note de musique : une tête ronde, une hampe, un crochet qui bat la mesure. */
export function NoteDo({ humeur, declic }) {
  return (
    <Mascotte nom="note" humeur={humeur} declic={declic}>
      <svg className="sc-atelier-syllabes__do" viewBox="0 0 110 130" focusable="false">
        <rect x="70" y="8" width="10" height="84" rx="4" fill="#1d4fb8" />
        <path className="sc-atelier-syllabes__crochet" d="M78 10 Q104 22 102 50 Q98 36 80 32 Z" fill="#1d4fb8" />
        <ellipse cx="48" cy="92" rx="36" ry="27" transform="rotate(-18 48 92)" fill="#3d7bfd" stroke="#1d3f99" strokeWidth="3" />
        <ellipse cx="36" cy="80" rx="10" ry="5" transform="rotate(-30 36 80)" fill="#fff" opacity="0.35" />
        <Cligne>
          <circle cx="36" cy="92" r="6" fill="#fff" />
          <circle cx="58" cy="86" r="6" fill="#fff" />
          <circle cx="35" cy="93" r="3.3" fill="#152238" />
          <circle cx="57" cy="87" r="3.3" fill="#152238" />
          <circle cx="34" cy="92" r="1.1" fill="#fff" />
          <circle cx="56" cy="86" r="1.1" fill="#fff" />
        </Cligne>
        <circle cx="28" cy="104" r="4" fill="#ff9aa8" opacity="0.75" />
        <circle cx="68" cy="96" r="4" fill="#ff9aa8" opacity="0.75" />
        <path className="sc-cp-ce1-francais__sourire" d="M40 104 Q50 110 58 100" fill="none" stroke="#0f2563" strokeWidth="2.6" strokeLinecap="round" />
        <path className="sc-cp-ce1-francais__bouche" d="M39 102 Q50 116 60 98 Z" fill="#c2334f" stroke="#0f2563" strokeWidth="2" />
      </svg>
    </Mascotte>
  );
}
