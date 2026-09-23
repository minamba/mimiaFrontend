import * as miroir from '../../lib/jeux/miroir';
import { repliquesMiroir } from '../../lib/jeux/voix/repliques';
import JeuDeChoix from './JeuDeChoix';
import GeometrieCM1 from './GeometrieCM1';

/**
 * LE MIROIR, À L'ÉCRAN — une figure et trois lignes, ou un triangle et ses
 * trois coins. Toute la règle vit dans `miroir.js`.
 *
 * UNE FOIS L'AXE TROUVÉ, IL S'ÉCLAIRE en pointillé vert, comme le pli d'une
 * feuille. Une fois l'angle droit trouvé, le petit carré de l'équerre s'y pose.
 */
const REGLE = {
  MANCHES: miroir.MANCHES,
  serie: miroir.serie,
  bilan: miroir.bilan,
  consigne: (m) => repliquesMiroir.consigne(m.mode),
  choix: (m) => m.choix.map((l) => ({ cle: l, libelle: l })),
  verdict: miroir.verdict,
  erreur: (m, sens) => repliquesMiroir.erreur(sens),
  aide: () => null,
};

function MiroirAvantCM1(props) {
  return (
    <JeuDeChoix
      {...props}
      regle={REGLE}
      classe="jeu--miroir"
      rendreQuestion={(m, termine) => (m.mode === 'axe' ? <Axe m={m} termine={termine} /> : <Angle m={m} termine={termine} />)}
    />
  );
}

function Axe({ m, termine }) {
  const points = m.points.map((p) => p.join(',')).join(' ');
  return (
    <svg className="miroir__dessin" viewBox="0 0 200 165" role="img" aria-label="Une figure et trois lignes, A, B et C">
      <polygon points={points} className="miroir__figure" />
      {m.traces.map((t) => (
        <g key={t.lettre} className={`miroir__trace${termine && t.sorte === 'axe' ? ' est-axe' : ''}`}>
          <line x1={t.points[0][0]} y1={t.points[0][1]} x2={t.points[1][0]} y2={t.points[1][1]} />
          <text x={t.points[0][0] + 6} y={t.points[0][1] + 12} className="miroir__lettre">{t.lettre}</text>
        </g>
      ))}
    </svg>
  );
}

function Angle({ m, termine }) {
  const [droit, ...autres] = m.sommets;
  const pts = m.sommets.map((s) => s.point.join(',')).join(' ');
  // Le petit carré de l'équerre, tourné vers l'intérieur du triangle.
  const [x, y] = droit.point;
  const sx = Math.sign(autres[0].point[0] - x) || Math.sign(autres[1].point[0] - x);
  const sy = Math.sign(autres[1].point[1] - y) || Math.sign(autres[0].point[1] - y);
  const c = 14;
  return (
    <svg className="miroir__dessin" viewBox="0 0 200 165" role="img" aria-label="Un triangle et ses trois coins, A, B et C">
      <polygon points={pts} className="miroir__figure miroir__figure--triangle" />
      {termine && (
        <path d={`M${x + sx * c} ${y} L${x + sx * c} ${y + sy * c} L${x} ${y + sy * c}`} className="miroir__equerre" />
      )}
      {m.sommets.map((s) => {
        const [px, py] = s.point;
        const dx = px < 100 ? -12 : 12;
        const dy = py < 80 ? -8 : 14;
        return <text key={s.lettre} x={px + dx} y={py + dy} textAnchor="middle" className="miroir__lettre">{s.lettre}</text>;
      })}
    </svg>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `GeometrieCM1.js` ; il lit la classe. */
export default function Miroir({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <GeometrieCM1 niveau={niveau} {...props} /> : <MiroirAvantCM1 niveau={niveau} {...props} />;
}
