import * as regle from '../../lib/jeux/airesCM1';
import * as regleCM2 from '../../lib/jeux/airesCM2';
import jeuSimple from './JeuSimple';

const CASE = 34;

/** La figure en carreaux, sur un quadrillage un peu plus grand qu'elle. */
function Quadrillage({ figure }) {
  const l = figure.l + 2;
  const h = figure.h + 2;
  return (
    <svg className="aires__quadrillage" viewBox={`0 0 ${l * CASE} ${h * CASE}`} role="img" aria-label="Une figure sur un quadrillage">
      {Array.from({ length: l + 1 }, (_, x) => (
        <line key={`x${x}`} x1={x * CASE} y1={0} x2={x * CASE} y2={h * CASE} className="aires__trait" />
      ))}
      {Array.from({ length: h + 1 }, (_, y) => (
        <line key={`y${y}`} x1={0} y1={y * CASE} x2={l * CASE} y2={y * CASE} className="aires__trait" />
      ))}
      {figure.cases.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={(x + 1) * CASE} y={(y + 1) * CASE} width={CASE} height={CASE} className="aires__case" />
      ))}
    </svg>
  );
}

/**
 * LES AIRES DU CM1 — le tour du jardin au CM1, à l'écran. La figure est
 * dessinée ; le rectangle se dit en mots. Toute la règle vit dans
 * `airesCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'aires-cm1',
  classe: 'jeu--jardin',
  rendreQuestion: (m) => (m.figure ? <Quadrillage figure={m.figure} /> : <p className="phrase-a-trou">{m.question}</p>),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'aires-cm2' } },
});
