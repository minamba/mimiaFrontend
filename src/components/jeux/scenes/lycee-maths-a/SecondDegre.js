import { avecVisuel } from '../base';
import {
  Reponses, Texte, ecrire, nombre, sur, useDeroule,
} from './commun';

/**
 * LE PONT EN ARC DU SECOND DEGRÉ (09/10/2026). La couverture : un pont dont
 * l'arche est une parabole parfaite, au-dessus d'un lac de montagne où elle
 * se reflète. Une parabole, c'est une arche : son sommet, ses deux pieds.
 *   - LA QUESTION est gravée sur la pile du pont ; au-dessus, l'arche attend
 *     sa clé de voûte (le trou en haut), et le lac la reflète en ondulant ;
 *   - LES RÉPONSES sont des clés de voûte, posées sur la rive : on choisit
 *     celle qui ferme l'arche (`choix`) ;
 *   - APRÈS LA RÉPONSE, la clé tombe en place, l'arche s'illumine, et le
 *     calcul s'écrit dessous, ligne après ligne : Δ = b² − 4ac, les racines
 *     (les pieds de l'arche), le sommet (α ; β), la somme et le produit.
 */

const P = 'sc-second-degre';

/** Le PGCD, pour écrire une fraction réduite. */
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
/** n/d → « 4/3 », « −2 », « 1/3 ». */
function fraction(n, d) {
  if (d === 0) return '?';
  const s = Math.sign(n) * Math.sign(d);
  const g = pgcd(Math.abs(n), Math.abs(d)) || 1;
  const [p, q] = [Math.abs(n) / g, Math.abs(d) / g];
  return `${s < 0 ? '−' : ''}${q === 1 ? p : `${p}/${q}`}`;
}
const par = (x) => (x < 0 ? `(${ecrire(x)})` : ecrire(x));

/** « −2x² + 8x − 16 », « x² − x − 2 », « −2x² + 6x » → { a, b, c }, ou null. */
export function trinome(texte) {
  const t = String(texte).replace(/−/g, '-');
  const r = t.match(/(-?\d*)x²(?:\s*([+-])\s*(\d*)x(?!²))?(?:\s*([+-])\s*(\d+)(?![\dx]))?/);
  if (!r) return null;
  const coef = (s) => (s === '' ? 1 : s === '-' ? -1 : Number(s)); // eslint-disable-line no-nested-ternary
  const a = coef(r[1]);
  const b = r[2] ? (r[2] === '-' ? -1 : 1) * coef(r[3]) : 0;
  const c = r[4] ? (r[4] === '-' ? -1 : 1) * Number(r[5]) : 0;
  return { a, b, c };
}

/** « −(x − 3)² − 5 » → { a, alpha, beta } ; « −3(x − 1)(x − 7) » → { a, x1, x2 }. */
function formeCanonique(texte) {
  const r = String(texte).replace(/−/g, '-').match(/(-?\d*)\(x ([+-]) (\d+)\)²(?: ([+-]) (\d+))?/);
  if (!r) return null;
  const a = r[1] === '' ? 1 : r[1] === '-' ? -1 : Number(r[1]); // eslint-disable-line no-nested-ternary
  return { a, alpha: (r[2] === '-' ? 1 : -1) * Number(r[3]), beta: r[4] ? (r[4] === '-' ? -1 : 1) * Number(r[5]) : 0 };
}
function formeFactorisee(texte) {
  // « −2x(x + 6) » : une des racines est 0.
  const x = String(texte).replace(/−/g, '-').match(/(-?\d*)x\(x ([+-]) (\d+)\)/);
  if (x) {
    const k = x[1] === '' ? 1 : x[1] === '-' ? -1 : Number(x[1]); // eslint-disable-line no-nested-ternary
    return { a: k, x1: 0, x2: (x[2] === '-' ? 1 : -1) * Number(x[3]) };
  }
  const r = String(texte).replace(/−/g, '-').match(/(-?\d*)\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)/);
  if (!r) return null;
  const a = r[1] === '' ? 1 : r[1] === '-' ? -1 : Number(r[1]); // eslint-disable-line no-nested-ternary
  return { a, x1: (r[2] === '-' ? 1 : -1) * Number(r[3]), x2: (r[4] === '-' ? 1 : -1) * Number(r[5]) };
}

/** LE CALCUL D'UNE MANCHE : { lignes, arche: { a, racines, sommet } } ou null. */
export function calculDe(m) {
  const q = String(m.question);
  const lignes = [];
  let a;
  let b;
  let c;
  const fc = formeCanonique(q);
  const ff = formeFactorisee(q);
  if (m.consigne === 'deux-racines') {
    const r = q.match(/s’annule en ([−-]?\d+) et en ([−-]?\d+)/);
    if (!r) return null;
    const [x1, x2] = [nombre(r[1]), nombre(r[2])];
    a = 1; b = -(x1 + x2); c = x1 * x2;
    lignes.push(`(x − ${par(x1)})(x − ${par(x2)})`, `= x² − ${par(x1 + x2)}x + ${par(x1 * x2)}`);
  } else if (ff && m.consigne === 'signe') {
    ({ a } = ff);
    b = -a * (ff.x1 + ff.x2); c = a * ff.x1 * ff.x2;
    lignes.push(`Racines : ${ecrire(Math.min(ff.x1, ff.x2))} et ${ecrire(Math.max(ff.x1, ff.x2))}`, a > 0
      ? 'a > 0 : l’arche est à l’envers, négative entre les racines, positive dehors'
      : 'a < 0 : l’arche est debout, positive entre les racines, négative dehors');
  } else if (fc && m.consigne === 'sommet') {
    ({ a } = fc);
    b = -2 * a * fc.alpha; c = a * fc.alpha * fc.alpha + fc.beta;
    lignes.push(`Forme canonique : α = ${ecrire(fc.alpha)}, β = ${ecrire(fc.beta)}`);
  } else {
    const t = trinome(q);
    if (!t) return null;
    ({ a, b, c } = t);
  }
  const delta = b * b - 4 * a * c;
  const alpha = -b / (2 * a);
  const beta = a * alpha * alpha + b * alpha + c;
  switch (m.consigne) {
    case 'discriminant':
    case 'nombre-racines':
      lignes.push(`Δ = b² − 4ac = ${par(b)}² − 4 × ${par(a)} × ${par(c)} = ${ecrire(delta)}`);
      if (m.consigne === 'discriminant' && nombre(m.bonne) !== delta) return null;
      if (m.consigne === 'nombre-racines') lignes.push(delta > 0 ? 'Δ > 0 : deux racines' : delta === 0 ? 'Δ = 0 : une seule racine' : 'Δ < 0 : aucune racine'); // eslint-disable-line no-nested-ternary
      break;
    case 'racines':
      lignes.push(`Δ = ${par(b)}² − 4 × ${par(a)} × ${par(c)} = ${ecrire(delta)}`);
      if (delta > 0) lignes.push(`x = (${ecrire(-b)} ± √${ecrire(delta)}) ÷ ${ecrire(2 * a)}`);
      break;
    case 'sommet':
      if (!fc) lignes.push(`α = −b ÷ 2a = ${ecrire(alpha)}`, `β = f(${ecrire(alpha)}) = ${ecrire(beta)}`);
      if (`(${ecrire(alpha)} ; ${ecrire(beta)})` !== m.bonne) return null;
      break;
    case 'canonique':
      lignes.push(`α = −b ÷ 2a = ${ecrire(alpha)}`, `β = f(${ecrire(alpha)}) = ${ecrire(beta)}`);
      break;
    case 'somme-produit':
      lignes.push(`S = −b ÷ a = ${fraction(-b, a)}`, `P = c ÷ a = ${fraction(c, a)}`);
      if (`S = ${fraction(-b, a)} ; P = ${fraction(c, a)}` !== m.bonne) return null;
      break;
    case 'signe':
      if (!ff) lignes.push(a > 0 ? 'a > 0 : l’arche est à l’envers, négative entre les racines' : 'a < 0 : l’arche est debout, positive entre les racines');
      break;
    case 'deux-racines':
      break;
    default:
      return null;
  }
  const racines = delta > 0 ? [(-b - Math.sqrt(delta)) / (2 * a), (-b + Math.sqrt(delta)) / (2 * a)].sort((x, y) => x - y) : delta === 0 ? [alpha] : []; // eslint-disable-line no-nested-ternary
  return { lignes, arche: { a, racines, sommet: [alpha, beta] } };
}

/** L'arche, son reflet, et la place de la clé de voûte (vide avant la réponse). */
function Pont({ posee }) {
  const arche = 'M20 112 Q160 -40 300 112';
  return (
    <svg className={`${P}__pont${posee ? ' est-ferme' : ''}`} viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${P}-lac`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd3f7" />
          <stop offset="1" stopColor="#1f6fa8" />
        </linearGradient>
      </defs>
      <rect x="0" y="112" width="320" height="58" fill={`url(#${P}-lac)`} />
      <g className={`${P}__reflet`}>
        <path d="M20 112 Q160 264 300 112" className={`${P}__arche`} />
      </g>
      <rect x="6" y="40" width="22" height="74" className={`${P}__pile`} />
      <rect x="292" y="40" width="22" height="74" className={`${P}__pile`} />
      <path d={arche} className={`${P}__arche ${P}__arche--gauche`} pathLength="1" />
      <path d="M8 36 H312" className={`${P}__tablier`} />
      {[60, 100, 220, 260].map((x) => <line key={x} x1={x} y1="36" x2={x} y2={112 - 304 * ((x - 20) / 280) * (1 - (x - 20) / 280)} className={`${P}__suspente`} />)}
      <path d="M144 32 L176 32 L170 50 L150 50 Z" className={`${P}__cle${posee ? ' est-posee' : ''}`} />
      {!posee && <path d="M146 32 L174 32 L169 48 L151 48 Z" className={`${P}__trou`} />}
      {[1, 2, 3].map((i) => <circle key={i} cx={40 + i * 70} cy={20 - (i % 2) * 6} r="2.2" className={`${P}__etincelle`} style={{ '--i': i }} />)}
    </svg>
  );
}

/** La parabole de la manche, ses pieds (racines) et son sommet : après la réponse. */
function Parabole({ a, racines, sommet }) {
  const [alpha, beta] = sommet;
  const largeur = Math.max(3, ...racines.map((r) => Math.abs(r - alpha) * 1.4));
  const xmin = alpha - largeur;
  const xmax = alpha + largeur;
  const f = (x) => a * (x - alpha) ** 2 + beta;
  const ys = [f(xmin), beta, 0];
  const ymin = Math.min(...ys);
  const ymax = Math.max(...ys);
  const marge = (ymax - ymin) * 0.15 || 1;
  const X = (x) => 14 + ((x - xmin) / (xmax - xmin)) * 252;
  const Y = (y) => 116 - ((y - (ymin - marge)) / (ymax - ymin + 2 * marge)) * 104;
  let d = '';
  for (let i = 0; i <= 60; i += 1) {
    const x = xmin + ((xmax - xmin) * i) / 60;
    d += `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)} `;
  }
  return (
    <svg className={`${P}__parabole`} viewBox="0 0 280 130" aria-hidden="true" focusable="false">
      <line x1="6" x2="274" y1={Y(0)} y2={Y(0)} className={`${P}__eau`} />
      <path d={d} className={`${P}__courbe`} pathLength="1" />
      {racines.map((r) => (
        <g key={r} className={`${P}__pied`}>
          <circle cx={X(r)} cy={Y(0)} r="5" />
          <text x={X(r)} y={Y(0) + (a > 0 ? -9 : 17)} textAnchor="middle">{ecrire(r, 2)}</text>
        </g>
      ))}
      <g className={`${P}__sommet`}>
        <circle cx={X(alpha)} cy={Y(beta)} r="5" />
        <text x={X(alpha)} y={Y(beta) + (a > 0 ? 18 : -9)} textAnchor="middle">{`(${ecrire(alpha, 2)} ; ${ecrire(beta, 2)})`}</text>
      </g>
    </svg>
  );
}

function Calcul({ calcul }) {
  const n = useDeroule(calcul.lignes.length, 900);
  return (
    <div className={`${P}__calcul`}>
      <ol aria-label="Le calcul">
        {calcul.lignes.map((l, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={i < n ? 'est-ecrite' : ''}>{l}</li>
        ))}
      </ol>
      <Parabole {...calcul.arche} />
    </div>
  );
}

export function QuestionSecondDegre({ m, termine }) {
  const calcul = termine ? sur(() => calculDe(m)) : null;
  const pile = (
    <div className={`${P}__ouvrage`}>
      <Pont posee={termine} />
      <div className={`${P}__pierre`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {avecVisuel(m, pile)}
      {calcul && <Calcul calcul={calcul} />}
    </div>
  );
}

/** Les clés de voûte sur la rive : on choisit celle qui ferme l'arche. */
export function ClesDeVoute({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__rive`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Pose la bonne clé de voûte"
      />
    </div>
  );
}
