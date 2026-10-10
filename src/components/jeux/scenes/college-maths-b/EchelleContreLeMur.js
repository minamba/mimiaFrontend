import { avecVisuel } from '../base';
import {
  Enonce, ecrire, nombre, nombresDe, proprietesChoix, useEtapes,
} from './commun';

/**
 * LA RUELLE BLANCHE — « L'échelle contre le mur » (4e), le 09/10/2026.
 * La couverture : une ruelle d'île grecque, des murs chaulés, des volets bleus,
 * des bougainvilliers roses, une échelle de bois appuyée au mur. La scène :
 *   - L'ÉNONCÉ sur un carreau de faïence blanc et bleu, le dessin coté de la
 *     question au-dessus (il reste toujours), des fleurs qui se balancent ;
 *   - APRÈS LA RÉPONSE : les CARRÉS DE PYTHAGORE poussent sur les trois côtés
 *     du triangle ; les deux petits se déversent dans le grand, et le calcul
 *     se pose : a² + b² = c², puis la racine ;
 *   - LA RÉCIPROQUE : rien n'est dessiné avant (un angle droit dessiné
 *     donnerait la réponse) ; APRÈS, on compare le carré du plus grand côté à
 *     la somme des deux autres, et seulement alors le triangle se trace, avec
 *     son angle droit s'il en a un ;
 *   - LES RÉPONSES : les barreaux d'une échelle appuyée au mur.
 */

const P = 'sc-echelle-contre-le-mur';
const carre = (x) => Math.round(x * x * 100) / 100;

/** Le triangle rectangle et ses trois carrés. `u` : côté debout, `v` : côté couché. */
function Carres({
  u, v, n, aires = [],
}) {
  const e = 120 / Math.max(u + v, 1);
  const U = u * e;
  const V = v * e;
  const px = 10 + U;
  const py = 10 + U + V;
  const Q = [px, py - U];
  const R = [px + V, py];
  const pts = (l) => l.map((p) => p.join(',')).join(' ');
  const W = px + V + U + 10;
  const H = py + V + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`${P}__carres`} aria-hidden="true" focusable="false">
      <polygon points={pts([[px, py], Q, [Q[0] - U, Q[1]], [px - U, py]])} className={`${P}__carre ${P}__carre--a${n >= 1 ? ' est-pousse' : ''}`} />
      <polygon points={pts([[px, py], R, [R[0], R[1] + V], [px, py + V]])} className={`${P}__carre ${P}__carre--b${n >= 1 ? ' est-pousse' : ''}`} />
      <polygon points={pts([Q, R, [R[0] + U, R[1] - V], [Q[0] + U, Q[1] - V]])} className={`${P}__carre ${P}__carre--c${n >= 2 ? ' est-pousse' : ''}`} />
      <polygon points={pts([[px, py], Q, R])} className={`${P}__triangle`} />
      <path d={`M${px} ${py - 9} h9 v9`} className={`${P}__droit`} />
      {/* Les aires, écrites dans leurs carrés quand ils ont poussé. */}
      {n >= 1 && aires[0] !== undefined && <text x={px - U / 2} y={py - U / 2 + 5} textAnchor="middle" className={`${P}__aire`}>{aires[0]}</text>}
      {n >= 1 && aires[1] !== undefined && <text x={px + V / 2} y={py + V / 2 + 5} textAnchor="middle" className={`${P}__aire`}>{aires[1]}</text>}
      {n >= 2 && aires[2] !== undefined && <text x={(Q[0] + R[0] + U) / 2} y={(Q[1] + R[1] - V) / 2 + 5} textAnchor="middle" className={`${P}__aire`}>{aires[2]}</text>}
    </svg>
  );
}

/** Ce que la question donne : le côté debout, le côté couché, et les lignes du calcul. */
function calcul(m) {
  const q = String(m.question);
  const bonne = String(m.bonne);
  if (/échelle/.test(q)) {
    const [L, d] = nombresDe(q);
    if (!Number.isFinite(L) || !Number.isFinite(d)) return null;
    const h2 = Math.round((L * L - d * d) * 100) / 100;
    return {
      u: Math.sqrt(Math.max(h2, 0)),
      v: d,
      aires: [ecrire(h2), ecrire(carre(d)), ecrire(carre(L))],
      lignes: [
        `L’échelle est l’hypoténuse : hauteur² = ${ecrire(L)}² − ${ecrire(d)}²`,
        `= ${ecrire(carre(L))} − ${ecrire(carre(d))} = ${ecrire(h2)}`,
        `hauteur = √${ecrire(h2)} ≈ ${bonne}`,
      ],
    };
  }
  const apres = q.split(':')[1] ?? '';
  const [x, y] = nombresDe(apres);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const cherche = (q.match(/\. (\w{2}) = \?/) ?? [])[1] ?? '?';
  const exacte = /valeur exacte/.test(q);
  if (m.consigne === 'hypotenuse') {
    const s = x * x + y * y;
    return {
      u: x,
      v: y,
      aires: [x * x, y * y, s],
      lignes: [
        `${cherche}² = ${x}² + ${y}² = ${x * x} + ${y * y} = ${s}`,
        `${cherche} = √${s} ${exacte ? '=' : '≈'} ${bonne}`,
      ],
    };
  }
  const d = x * x - y * y;
  return {
    u: y,
    v: Math.sqrt(Math.max(d, 0)),
    aires: [y * y, d, x * x],
    lignes: [
      `${cherche}² = ${x}² − ${y}² = ${x * x} − ${y * y} = ${d}`,
      `${cherche} = √${d} ${exacte ? '=' : '≈'} ${bonne}`,
    ],
  };
}

function Pythagore({ m }) {
  const c = calcul(m);
  const n = useEtapes(c ? c.lignes.length + 1 : 0, 1100, 500);
  if (!c) return null;
  return (
    <div className={`${P}__atelier`}>
      <Carres u={c.u} v={c.v} n={n} aires={c.aires} />
      <ol className={`${P}__ardoise`} aria-label="Le calcul">
        {c.lignes.map((l, i) => <li key={l} className={i < n - 1 ? 'est-pose' : ''}>{l}</li>)}
      </ol>
    </div>
  );
}

/** La réciproque : les carrés des trois côtés, comparés ; puis le triangle, s'il est rectangle. */
function Reciproque({ m }) {
  const r = String(m.question).match(/Triangle (\w{3}) : (.+)\.$/);
  const k = useEtapes(3, 1200, 500);
  if (!r) return null;
  const nom = r[1];
  const cotes = [...r[2].matchAll(/(\w{2}) = (\d+) cm/g)].map((x) => [x[1], nombre(x[2])]).sort((a, b) => a[1] - b[1]);
  if (cotes.length !== 3) return null;
  const [[n1, a], [n2, b], [n3, c]] = cotes;
  const egal = a * a + b * b === c * c;
  const sommet = nom.split('').find((l) => !n3.includes(l));
  // Le triangle tracé à l'échelle : le grand côté couché, le sommet opposé au-dessus.
  const e = 230 / c;
  const xA = (c * c + a * a - b * b) / (2 * c);
  const hA = Math.sqrt(Math.max(a * a - xA * xA, 0));
  const T = [[20, 150], [20 + c * e, 150], [20 + c * e - xA * e, 150 - hA * e]];
  return (
    <div className={`${P}__atelier`}>
      <ol className={`${P}__ardoise`} aria-label="Le calcul">
        <li className={k >= 1 ? 'est-pose' : ''}>{`Le plus grand côté : ${n3} = ${c} cm, et ${n3}² = ${c * c}`}</li>
        <li className={k >= 2 ? 'est-pose' : ''}>{`${n1}² + ${n2}² = ${a * a} + ${b * b} = ${a * a + b * b}`}</li>
        <li className={k >= 3 ? 'est-pose' : ''}>
          {egal ? `Égalité : rectangle en ${sommet}, en face de [${n3}]` : `${a * a + b * b} ≠ ${c * c} : pas rectangle`}
        </li>
      </ol>
      {k >= 3 && (
        <svg viewBox="0 0 270 170" className={`${P}__trace`} aria-hidden="true" focusable="false">
          <polygon points={T.map((p) => p.join(',')).join(' ')} className={`${P}__triangle`} />
          {egal && <circle cx={T[2][0]} cy={T[2][1]} r="12" className={`${P}__coin-droit`} />}
          <text x={T[2][0]} y={T[2][1] - 10} textAnchor="middle" className={`${P}__nom`}>{sommet}</text>
        </svg>
      )}
    </div>
  );
}

/** Les bougainvilliers roses qui débordent du mur. */
function Fleurs() {
  return (
    <span className={`${P}__fleurs`} aria-hidden="true">
      {Array.from({ length: 7 }, (_, i) => <span key={i} className={`${P}__fleur`} style={{ '--k': i }} />)}
    </span>
  );
}

export function QuestionEchelle({ m, termine }) {
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__mur`}>
        <Fleurs />
        {avecVisuel(m, <Enonce m={m} classe={`${P}__faience`} />)}
      </div>
      {termine && (m.consigne === 'reciproque' ? <Reciproque m={m} /> : <Pythagore m={m} />)}
    </div>
  );
}

/** Les réponses : les barreaux d'une échelle de bois, appuyée au mur blanc. */
export function Barreaux({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__echelle`}>
      <span className={`${P}__montant ${P}__montant--g`} aria-hidden="true" />
      <span className={`${P}__montant ${P}__montant--d`} aria-hidden="true" />
      <ul className={`${P}__barreaux`} aria-label="Choisis ta réponse">
        {choix.map(({ cle, libelle }, i) => (
          <li key={cle} style={{ '--i': i }}>
            <button {...proprietesChoix(cle, fautes, choisir)} className={`${P}__barreau${fautes.includes(cle) ? ' est-faux' : ''}`}>
              {libelle}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const sceneEchelle = {
  question: (m, termine) => <QuestionEchelle m={m} termine={termine} />,
  choix: (props) => <Barreaux {...props} />,
};
