import { useId } from 'react';
import {
  Bulle, Fete, humeurDe, rangee,
} from './communs';
import './ce2-maths.css';

/**
 * LE MIROIR (CE2) — 09/10/2026. La couverture : une fillette devant un grand
 * miroir à cadre de bois posé sur une table, son reflet qui lui fait un clin
 * d'œil, un pot de crayons de couleur, une brosse, une lanterne, du lierre.
 * La scène :
 *   - LA QUESTION : la figure dessinée dans le miroir (le dessin d'origine,
 *     gardé), cadre de bois vissé, un reflet de lumière qui balaie la glace ;
 *     la lanterne se balance, le lierre bouge ; un papillon — l'animal
 *     symétrique par excellence —, mascotte du jeu, bat des ailes ;
 *   - LES RÉPONSES : des crayons de couleur dans leur pot, A, B, C — chaque
 *     ligne du dessin porte la couleur de son crayon ;
 *   - APRÈS LA RÉPONSE : ON PLIE. La moitié de la figure se rabat le long de
 *     l'axe et vient se poser exactement sur l'autre moitié — on voit
 *     POURQUOI c'est un axe de symétrie. Pour l'angle droit, l'équerre glisse
 *     et se cale dans le coin, puis son petit carré s'y dessine.
 * Rien ne se plie avant la réponse : ce serait la donner.
 */

/** La couleur de chaque crayon, et de la ligne ou du coin qui porte sa lettre. */
export const COULEURS = { A: '#e03131', B: '#1c7ed6', C: '#9c36b5' };
const couleur = (lettre) => COULEURS[lettre] ?? '#1d3a5c';

/** Un identifiant sûr pour un `clipPath` (React donne des caractères spéciaux). */
const useIdSvg = (prefixe) => `${prefixe}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

/**
 * LE PLI : la moitié de la figure, découpée d'un côté de l'axe, se rabat sur
 * l'autre côté. Vertical (x = 100) ou horizontal (y = 80), comme `miroir.js`.
 */
function Pli({ m }) {
  const id = useIdSvg('sc-le-miroir-ce2-moitie');
  const axe = m.traces?.find((t) => t.sorte === 'axe');
  if (!axe) return null;
  const vertical = axe.points[0][0] === axe.points[1][0];
  const points = m.points.map((p) => p.join(',')).join(' ');
  return (
    <>
      <clipPath id={id}>
        {vertical ? <rect x="0" y="0" width="100" height="165" /> : <rect x="0" y="0" width="200" height="80" />}
      </clipPath>
      <g className={`sc-le-miroir-ce2__volet sc-le-miroir-ce2__volet--${vertical ? 'v' : 'h'}`}>
        <polygon points={points} clipPath={`url(#${id})`} className="sc-le-miroir-ce2__moitie" />
      </g>
    </>
  );
}

export function Axe({ m, termine }) {
  const points = m.points.map((p) => p.join(',')).join(' ');
  return (
    <svg className="miroir__dessin" viewBox="0 0 200 165" role="img" aria-label="Une figure et trois lignes, A, B et C">
      <polygon points={points} className="miroir__figure" />
      {termine && <Pli m={m} />}
      {m.traces.map((t) => (
        <g
          key={t.lettre}
          className={`miroir__trace${termine && t.sorte === 'axe' ? ' est-axe' : ''}${termine && t.sorte !== 'axe' ? ' sc-le-miroir-ce2__trace--eteinte' : ''}`}
          style={{ '--couleur': couleur(t.lettre) }}
        >
          <line x1={t.points[0][0]} y1={t.points[0][1]} x2={t.points[1][0]} y2={t.points[1][1]} className="sc-le-miroir-ce2__ligne" />
          <text x={t.points[0][0] + 6} y={t.points[0][1] + 12} className="miroir__lettre sc-le-miroir-ce2__lettre">{t.lettre}</text>
        </g>
      ))}
    </svg>
  );
}

export function Angle({ m, termine }) {
  const [droit, ...autres] = m.sommets;
  const pts = m.sommets.map((s) => s.point.join(',')).join(' ');
  // Le petit carré de l'équerre, tourné vers l'intérieur du triangle.
  const [x, y] = droit.point;
  const sx = Math.sign(autres[0].point[0] - x) || Math.sign(autres[1].point[0] - x);
  const sy = Math.sign(autres[1].point[1] - y) || Math.sign(autres[0].point[1] - y);
  const c = 14;
  const l = 34;
  return (
    <svg className="miroir__dessin" viewBox="0 0 200 165" role="img" aria-label="Un triangle et ses trois coins, A, B et C">
      <polygon points={pts} className="miroir__figure miroir__figure--triangle" />
      {termine && (
        <g className="sc-le-miroir-ce2__equerre" style={{ transformOrigin: `${x}px ${y}px`, '--sx': sx, '--sy': sy }}>
          <polygon points={`${x},${y} ${x + sx * l},${y} ${x},${y + sy * l}`} className="sc-le-miroir-ce2__equerre-corps" />
          <polygon points={`${x + sx * 7},${y + sy * 7} ${x + sx * 19},${y + sy * 7} ${x + sx * 7},${y + sy * 19}`} className="sc-le-miroir-ce2__equerre-trou" />
        </g>
      )}
      {termine && (
        <path d={`M${x + sx * c} ${y} L${x + sx * c} ${y + sy * c} L${x} ${y + sy * c}`} className="miroir__equerre sc-le-miroir-ce2__carre" />
      )}
      {m.sommets.map((s) => {
        const [px, py] = s.point;
        const dx = px < 100 ? -12 : 12;
        const dy = py < 80 ? -8 : 14;
        return (
          <g key={s.lettre} style={{ '--couleur': couleur(s.lettre) }}>
            <circle cx={px} cy={py} r="4" className="sc-le-miroir-ce2__coin" />
            <text x={px + dx} y={py + dy} textAnchor="middle" className="miroir__lettre sc-le-miroir-ce2__lettre">{s.lettre}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Le papillon, mascotte du miroir : ses deux ailes, pareilles, battent ensemble. */
export function Papillon({ humeur }) {
  const aile = (
    <>
      <path d="M0 0 C-10 -30 -46 -34 -42 -8 C-40 4 -18 6 0 0 Z" fill="#cc5de8" stroke="#862e9c" strokeWidth="2" />
      <path d="M0 2 C-16 6 -36 18 -26 32 C-18 40 -4 22 0 2 Z" fill="#f783ac" stroke="#a61e4d" strokeWidth="2" />
      <circle cx="-26" cy="-12" r="6" fill="#fff3bf" />
      <circle cx="-17" cy="20" r="4" fill="#fff3bf" />
    </>
  );
  return (
    <div className={`sc-le-miroir-ce2__mascotte est-${humeur}`} aria-hidden="true">
      <Bulle humeur={humeur} />
      {humeur === 'fete' && <Fete couleurs={['#cc5de8', '#f783ac', '#ffd43b', '#74c0fc']} />}
      <svg className="sc-le-miroir-ce2__papillon" viewBox="-50 -50 100 100" focusable="false">
        <g className="sc-le-miroir-ce2__aile sc-le-miroir-ce2__aile--g">{aile}</g>
        <g transform="scale(-1 1)"><g className="sc-le-miroir-ce2__aile sc-le-miroir-ce2__aile--d">{aile}</g></g>
        <ellipse cx="0" cy="6" rx="5" ry="22" fill="#5f3dc4" />
        <circle cx="0" cy="-20" r="9" fill="#7048e8" />
        <path d="M-3 -28 Q-10 -42 -16 -42 M3 -28 Q10 -42 16 -42" fill="none" stroke="#5f3dc4" strokeWidth="2" strokeLinecap="round" />
        <circle cx="-16" cy="-42" r="2.5" fill="#5f3dc4" />
        <circle cx="16" cy="-42" r="2.5" fill="#5f3dc4" />
        <g className="sc-le-miroir-ce2__yeux">
          <circle cx="-3.5" cy="-21" r="2.4" fill="#fff" />
          <circle cx="3.5" cy="-21" r="2.4" fill="#fff" />
          <circle cx="-3" cy="-21" r="1.2" fill="#1b1b2f" />
          <circle cx="4" cy="-21" r="1.2" fill="#1b1b2f" />
        </g>
        <path d="M-3 -16 q3 3 6 0" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/** Le décor : le lierre, la lanterne, les fleurs de la table. */
function Decor() {
  return (
    <div className="sc-le-miroir-ce2__decor" aria-hidden="true">
      {rangee(7).map((i) => <span key={i} className="sc-le-miroir-ce2__lierre" style={{ '--n': i }} />)}
      <span className="sc-le-miroir-ce2__lanterne" />
      <span className="sc-le-miroir-ce2__table" />
      {rangee(4).map((i) => <span key={i} className="sc-le-miroir-ce2__fleur" style={{ '--n': i }} />)}
    </div>
  );
}

/** Ce que montre l'explication, sous le miroir. */
function Legende({ m }) {
  if (m.mode === 'axe') {
    return <p className="sc-le-miroir-ce2__legende">{`On plie le long de ${m.bonne} : les deux moitiés se superposent.`}</p>;
  }
  return <p className="sc-le-miroir-ce2__legende">{`Le coin ${m.bonne} est un angle droit : l’équerre s’y pose.`}</p>;
}

/** LA QUESTION : la figure dans le miroir, et le papillon. */
export function QuestionMiroir({ m, termine, extra }) {
  const humeur = humeurDe(termine, extra);
  return (
    <div className={`sc-le-miroir-ce2${termine ? ' est-termine' : ''}`}>
      <Decor />
      <div className="sc-le-miroir-ce2__cadre">
        {rangee(4).map((i) => <span key={i} className={`sc-le-miroir-ce2__vis sc-le-miroir-ce2__vis--${i}`} aria-hidden="true" />)}
        <div className="sc-le-miroir-ce2__glace">
          {m.mode === 'axe' ? <Axe m={m} termine={termine} /> : <Angle m={m} termine={termine} />}
          <span className="sc-le-miroir-ce2__reflet" aria-hidden="true" />
        </div>
      </div>
      {termine && <Legende m={m} />}
      <Papillon key={`${humeur}-${extra?.derniereFaute ?? ''}`} humeur={humeur} />
    </div>
  );
}

/**
 * LES RÉPONSES : des crayons de couleur dans leur pot. Chaque crayon est un
 * bouton à sa lettre ; un crayon faux est barré, terni, et ne se prend plus.
 */
export function ChoixMiroir({ choix, fautes, choisir }) {
  return (
    <div className="sc-le-miroir-ce2__pot-entier">
      <ul className="sc-le-miroir-ce2__crayons" aria-label="Choisis ton crayon">
        {choix.map(({ cle, libelle }, i) => {
          const fausse = fautes.includes(cle);
          return (
            <li key={cle} style={{ '--i': i, '--couleur': couleur(cle) }}>
              <button type="button" className={`sc-le-miroir-ce2__crayon${fausse ? ' est-fausse' : ''}`} onClick={() => choisir(cle)} disabled={fausse}>
                <span className="sc-le-miroir-ce2__mine" aria-hidden="true" />
                <span className="sc-le-miroir-ce2__bois">{libelle}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <span className="sc-le-miroir-ce2__pot" aria-hidden="true" />
    </div>
  );
}
