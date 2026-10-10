import { avecVisuel } from '../base';
import {
  Texte, ecrire, nombre, pointsNommes, sur, useDeroule,
} from './commun';

/**
 * LA ROUTE DE MONTAGNE DE LA DÉRIVATION (09/10/2026). La couverture : une
 * route en lacets à flanc de montagne, des viaducs, le soleil qui se lève sur
 * les sommets. Le nombre dérivé, c'est la pente de la route sous les roues :
 * la voiture la suit et penche avec elle (la tangente).
 *   - LA QUESTION est sur un grand panneau routier vert ; à côté, la route où
 *     la voiture roule et s'incline à chaque virage ;
 *   - LES RÉPONSES sont des panneaux indicateurs plantés au bord de la route
 *     (`objets`) ;
 *   - APRÈS LA RÉPONSE, la route rejoue la dérivation : terme à terme
 *     (4x³ → 12x²), la formule du produit ou du quotient avec u, v, u′, v′,
 *     le nombre dérivé remplacé dans f′, l'équation de la tangente
 *     y = f′(a)(x − a) + f(a), la pente lue entre deux points.
 */

const P = 'sc-derivation';
const EXP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const exposant = (n) => String(n).split('').map((c) => EXP[Number(c)]).join('');

/** « 4x³ + 5x² − x + 6 » → { 3: 4, 2: 5, 1: −1, 0: 6 }, ou null. */
export function polynome(texte) {
  const t = String(texte).replace(/\s/g, '').replace(/−/g, '-');
  if (!/^[-+]?[\dx⁰¹²³⁴⁵⁶⁷⁸⁹+-]+$/.test(t)) return null;
  const termes = t.match(/[+-]?[^+-]+/g) ?? [];
  const p = {};
  for (const terme of termes) {
    const r = terme.match(/^([+-]?)(\d*)(x([⁰¹²³⁴⁵⁶⁷⁸⁹]*))?$/);
    if (!r || (r[2] === '' && !r[3])) return null;
    const coef = (r[1] === '-' ? -1 : 1) * (r[2] === '' ? 1 : Number(r[2]));
    const deg = r[3] ? (r[4] ? Number(r[4].split('').map((c) => EXP.indexOf(c)).join('')) : 1) : 0;
    p[deg] = (p[deg] ?? 0) + coef;
  }
  return p;
}

export const deriver = (p) => Object.fromEntries(Object.entries(p).filter(([d]) => Number(d) > 0).map(([d, c]) => [Number(d) - 1, c * Number(d)]));
const multiplier = (p, q) => {
  const r = {};
  Object.entries(p).forEach(([d1, c1]) => Object.entries(q).forEach(([d2, c2]) => {
    const d = Number(d1) + Number(d2);
    r[d] = (r[d] ?? 0) + c1 * c2;
  }));
  return r;
};
const ajouter = (p, q) => {
  const r = { ...p };
  Object.entries(q).forEach(([d, c]) => { r[d] = (r[d] ?? 0) + c; });
  return r;
};
const oppose = (p) => Object.fromEntries(Object.entries(p).map(([d, c]) => [d, -c]));
const valeurEn = (p, x) => Object.entries(p).reduce((s, [d, c]) => s + c * x ** Number(d), 0);

/** Un polynôme écrit comme le module l'écrit : « 12x² + 10x + 2 », « −x », « 0 ». */
export function ecrirePolynome(p) {
  const termes = Object.entries(p).map(([d, c]) => [Number(d), c]).filter(([, c]) => c !== 0).sort((a, b) => b[0] - a[0]);
  if (termes.length === 0) return '0';
  return termes.map(([d, c], i) => {
    const abs = Math.abs(c);
    const corps = d === 0 ? String(abs) : `${abs === 1 ? '' : abs}x${d > 1 ? exposant(d) : ''}`;
    if (i === 0) return `${c < 0 ? '−' : ''}${corps}`;
    return ` ${c < 0 ? '−' : '+'} ${corps}`;
  }).join('');
}

const monome = (d, c) => ecrirePolynome({ [d]: c });

/** « −2(x − 2)(x − 6) », « 3x(x − 4) », « (x − 2)(x − 7) » → le polynôme développé, ou null. */
function factorise(texte) {
  const t = String(texte).replace(/−/g, '-');
  const k = (s) => (s === '' ? 1 : s === '-' ? -1 : Number(s)); // eslint-disable-line no-nested-ternary
  let r = t.match(/^(-?\d*)\(x ([+-]) (\d+)\)\(x ([+-]) (\d+)\)$/);
  if (r) {
    const [a, b] = [(r[2] === '-' ? -1 : 1) * Number(r[3]), (r[4] === '-' ? -1 : 1) * Number(r[5])];
    return multiplier({ 0: k(r[1]) }, multiplier({ 1: 1, 0: a }, { 1: 1, 0: b }));
  }
  r = t.match(/^(-?\d*)x\(x ([+-]) (\d+)\)$/);
  if (r) return multiplier({ 1: k(r[1]) }, { 1: 1, 0: (r[2] === '-' ? -1 : 1) * Number(r[3]) });
  return null;
}

/** LES LIGNES DE L'EXPLICATION d'une manche, ou null. */
export function derouleDe(m) {
  const q = String(m.question);
  const b = String(m.bonne);
  let r;
  switch (m.consigne) {
    case 'usuelles':
    case 'polynome': {
      r = q.match(/^f\(x\) = (.+) ; f′\(x\) = \?$/);
      if (!r) return null;
      if (/√x/.test(r[1])) return [`(√x)′ = 1/(2√x)`, `f′(x) = ${b}`];
      if (r[1] === '1/x') return ['(1/x)′ = −1/x²'];
      if (/^\d+\/x$/.test(r[1])) return ['(1/x)′ = −1/x²', `(${r[1]})′ = ${r[1].split('/')[0]} × (−1/x²) = ${b}`];
      const p = polynome(r[1]);
      if (!p || ecrirePolynome(deriver(p)) !== b) return null;
      return Object.entries(p).map(([d, c]) => [Number(d), c]).sort((x, y) => y[0] - x[0])
        .map(([d, c]) => `${monome(d, c)}  →  ${d === 0 ? '0' : monome(d - 1, c * d)}`);
    }
    case 'produit': {
      r = q.match(/^f\(x\) = \(([^)]+)\)\(([^)]+)\) ; f′\(x\) = \?$/);
      if (!r) return null;
      const [u, v] = [polynome(r[1]), polynome(r[2])];
      if (!u || !v) return null;
      const resultat = ajouter(multiplier(deriver(u), v), multiplier(u, deriver(v)));
      if (ecrirePolynome(resultat) !== b) return null;
      return [
        `u = ${r[1]}  →  u′ = ${ecrirePolynome(deriver(u))}`,
        `v = ${r[2]}  →  v′ = ${ecrirePolynome(deriver(v))}`,
        `(uv)′ = u′v + uv′ = ${ecrirePolynome(deriver(u))}(${r[2]}) + (${r[1]})(${ecrirePolynome(deriver(v))})`,
      ];
    }
    case 'quotient': {
      r = q.match(/^f\(x\) = (?:\(([^)]+)\)|(1))\/\(?([^)]+?)\)? ; f′\(x\) = \?$/);
      if (!r) return null;
      const haut = r[1] ?? r[2];
      const [u, v] = [polynome(haut), polynome(r[3])];
      if (!u || !v) return null;
      const num = ajouter(multiplier(deriver(u), v), oppose(multiplier(u, deriver(v))));
      if (!b.startsWith(`${ecrirePolynome(num)}/`)) return null;
      if (haut === '1') return [`v = ${r[3]}  →  v′ = ${ecrirePolynome(deriver(v))}`, '(1/v)′ = −v′/v²'];
      return [
        `u = ${haut}  →  u′ = ${ecrirePolynome(deriver(u))}`,
        `v = ${r[3]}  →  v′ = ${ecrirePolynome(deriver(v))}`,
        '(u/v)′ = (u′v − uv′)/v²',
        `u′v − uv′ = ${ecrirePolynome(num)}`,
      ];
    }
    case 'nombre-derive': {
      r = q.match(/^f\(x\) = (.+) ; f′\(([−-]?\d+)\) = \?$/);
      if (!r) return null;
      const p = polynome(r[1]);
      const a = nombre(r[2]);
      if (!p) return null;
      const d = deriver(p);
      if (valeurEn(d, a) !== nombre(b)) return null;
      return [`f′(x) = ${ecrirePolynome(d)}`, `f′(${ecrire(a)}) = ${ecrire(valeurEn(d, a))}`];
    }
    case 'tangente': {
      r = q.match(/^f\(([−-]?\d+)\) = ([−-]?\d+) et f′\(\1\) = ([−-]?\d+)\./);
      let [a, fa, pente] = [];
      if (r) {
        [a, fa, pente] = [nombre(r[1]), nombre(r[2]), nombre(r[3])];
      } else {
        r = q.match(/^f\(x\) = (.+) ; tangente au point d’abscisse ([−-]?\d+) \?$/);
        if (!r) return null;
        const p = polynome(r[1]);
        if (!p) return null;
        a = nombre(r[2]);
        fa = valeurEn(p, a);
        pente = valeurEn(deriver(p), a);
      }
      const lignes = [`f(${ecrire(a)}) = ${ecrire(fa)}  et  f′(${ecrire(a)}) = ${ecrire(pente)}`, `y = f′(a)(x − a) + f(a) = ${ecrire(pente)}(x − ${a < 0 ? `(${ecrire(a)})` : ecrire(a)}) + ${fa < 0 ? `(${ecrire(fa)})` : ecrire(fa)}`];
      return lignes;
    }
    case 'nombre-derive-lu': {
      const { A, B } = pointsNommes(q);
      if (!A || !B) return null;
      return [`pente = (yB − yA) ÷ (xB − xA)`, `= (${ecrire(B[1])} − ${A[1] < 0 ? `(${ecrire(A[1])})` : ecrire(A[1])}) ÷ (${ecrire(B[0])} − ${A[0] < 0 ? `(${ecrire(A[0])})` : ecrire(A[0])}) = ${b}`];
    }
    case 'variations': {
      r = q.match(/^f′\(x\) = (.+)\. Sur \[([−-]?\d+) ; ([−-]?\d+)\]/);
      if (!r) return null;
      const d = polynome(r[1]) ?? factorise(r[1]);
      if (!d) return null;
      const signes = [nombre(r[2]), nombre(r[3]), (nombre(r[2]) + nombre(r[3])) / 2].map((x) => valeurEn(d, x));
      if (/croissante/.test(b) && !/dé/.test(b) && signes.every((s) => s >= 0)) return [`f′(x) ≥ 0 sur [${r[2]} ; ${r[3]}]`, 'la route monte : f est croissante'];
      if (/décroissante/.test(b) && signes.every((s) => s <= 0)) return [`f′(x) ≤ 0 sur [${r[2]} ; ${r[3]}]`, 'la route descend : f est décroissante'];
      return null;
    }
    default:
      return null;
  }
}

/** La route en lacets : la voiture la suit et penche avec la pente (la tangente). */
function Route() {
  return (
    <div className={`${P}__route`} aria-hidden="true">
      <svg viewBox="0 0 200 120" focusable="false">
        <path d="M0 70 L30 30 L52 50 L84 8 L120 46 L150 22 L200 60 V120 H0 Z" className={`${P}__montagne`} />
        <path d="M84 8 L96 20 L88 22 L80 14 Z M150 22 L160 30 L146 30 Z" className={`${P}__neige`} />
        <circle cx="176" cy="22" r="10" className={`${P}__soleil`} />
        <path d="M6 104 C 50 40, 80 110, 120 70 S 170 30, 196 52" className={`${P}__bitume`} />
        <path d="M6 104 C 50 40, 80 110, 120 70 S 170 30, 196 52" className={`${P}__ligne`} />
      </svg>
      <span className={`${P}__voiture`}>
        <span className={`${P}__phare`} />
      </span>
    </div>
  );
}

function Deroule({ lignes }) {
  const n = useDeroule(lignes.length, 850);
  return (
    <ol className={`${P}__deroule`} aria-label="La dérivation, pas à pas">
      {lignes.map((l, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={i} className={i < n ? 'est-ecrite' : ''}>{l}</li>
      ))}
    </ol>
  );
}

export function QuestionDerivation({ m, termine }) {
  const lignes = termine ? sur(() => derouleDe(m)) : null;
  const panneau = (
    <div className={`${P}__bord`}>
      <Route />
      <div className={`${P}__panneau`}>
        <Texte m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      {avecVisuel(m, panneau)}
      {lignes && lignes.length > 0 && <Deroule lignes={lignes} />}
    </div>
  );
}
