import * as regle from '../../lib/jeux/geometrieCM1';
import * as regleCM2 from '../../lib/jeux/geometrieCM2';
import jeuSimple from './JeuSimple';

const rad = (d) => (d * Math.PI) / 180;

/** Un angle : deux demi-droites qui partent du même sommet. */
function Angle({ angle, rotation }) {
  const [cx, cy, r] = [70, 130, 110];
  const bout = (a) => [cx + r * Math.cos(rad(-(rotation + a))), cy + r * Math.sin(rad(-(rotation + a)))];
  const [x1, y1] = bout(0);
  const [x2, y2] = bout(angle);
  return (
    <svg className="geo__dessin" viewBox="0 0 200 180" role="img" aria-label="Un angle">
      <line x1={cx} y1={cy} x2={x1} y2={y1} className="geo__trait" />
      <line x1={cx} y1={cy} x2={x2} y2={y2} className="geo__trait" />
      <circle cx={cx} cy={cy} r={4} className="geo__point" />
    </svg>
  );
}

/** Deux droites : la seconde tournée de `ecart` degrés (0 : parallèle, décalée). */
function Droites({ rotation, ecart }) {
  const trait = (angle, dx, dy) => {
    const [c, s] = [Math.cos(rad(angle)), Math.sin(rad(angle))];
    return { x1: 100 + dx - 90 * c, y1: 90 + dy - 90 * s, x2: 100 + dx + 90 * c, y2: 90 + dy + 90 * s };
  };
  const decale = ecart === 0 ? 34 : 0;
  const n = [-Math.sin(rad(rotation)) * decale, Math.cos(rad(rotation)) * decale];
  return (
    <svg className="geo__dessin" viewBox="0 0 200 180" role="img" aria-label="Deux droites">
      <line {...trait(rotation, -n[0], -n[1])} className="geo__trait" />
      <line {...trait(rotation + ecart, n[0], n[1])} className="geo__trait geo__trait--second" />
    </svg>
  );
}

const C = 22;

/** Une moitié de figure en carreaux ; `droite` la place à droite de l'axe. */
function Moitie({ cases, droite }) {
  return (
    <svg className="geo__moitie" viewBox={`0 0 ${regle.LARGEUR * C} ${regle.HAUTEUR * C}`} role="img" aria-label="Une moitié de figure">
      {Array.from({ length: regle.LARGEUR * regle.HAUTEUR }, (_, i) => (
        <rect key={i} x={(i % regle.LARGEUR) * C} y={Math.floor(i / regle.LARGEUR) * C} width={C} height={C} className="aires__trait" />
      ))}
      {cases.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x * C} y={y * C} width={C} height={C} className={droite ? 'geo__case geo__case--reflet' : 'geo__case'} />
      ))}
    </svg>
  );
}

function Miroir({ gauche }) {
  return (
    <div className="geo__miroir">
      <Moitie cases={gauche} />
      <span className="geo__axe" aria-hidden="true" />
      <span className="geo__vide" aria-hidden="true">?</span>
    </div>
  );
}

/** Les figures usuelles du CM2, dessinées à plat. */
const SOMMETS = {
  carre: '55,35 135,35 135,115 55,115',
  rectangle: '25,50 175,50 175,125 25,125',
  losange: '100,15 155,90 100,165 45,90',
  parallelogramme: '55,50 175,50 145,130 25,130',
  'triangle-rectangle': '45,30 45,145 165,145',
  'triangle-equilateral': '100,25 170,146 30,146',
  'triangle-isocele': '100,20 140,150 60,150',
};

function Figure({ figure }) {
  return (
    <svg className="geo__dessin" viewBox="0 0 200 180" role="img" aria-label="Une figure">
      <polygon points={SOMMETS[figure]} className="geo__figure" />
    </svg>
  );
}

function Question(m) {
  if (m.consigne === 'angle' || m.consigne === 'mesure') return <Angle angle={m.angle} rotation={m.rotation} />;
  if (m.consigne === 'figure') return <Figure figure={m.figure} />;
  if (m.consigne === 'droites') return <Droites rotation={m.rotation} ecart={m.ecart} />;
  return <Miroir gauche={m.gauche} />;
}

/**
 * LA GÉOMÉTRIE DU CM1 — le miroir au CM1, à l'écran. Angles, droites et
 * figures se dessinent ici ; toute la règle vit dans `geometrieCM1.js`.
 */
export default jeuSimple({
  module: regle,
  prefixe: 'geometrie-cm1',
  classe: 'jeu--miroir',
  rendreQuestion: Question,
  rendreChoix: (c, m) => (m.consigne === 'miroir' ? <Moitie cases={m.moities[c.cle]} droite /> : c.libelle),
  parNiveau: { CM2: { module: regleCM2, prefixe: 'geometrie-cm2' } },
});
