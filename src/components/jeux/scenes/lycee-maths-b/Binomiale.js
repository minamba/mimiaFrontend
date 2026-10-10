import { nombreFr, TexteQuestion } from './outils';

/**
 * LA PLANCHE DE GALTON DU JARDIN D'HIVER — « La loi binomiale » (terminale,
 * terminale techno). La couverture : une grande planche de Galton vert d'eau
 * à clous de laiton, des billes de cuivre et d'argent qui rebondissent et
 * s'entassent dans des bacs de verre. La scène la reprend :
 *   - LA QUESTION : sur une plaque de verre cerclée de laiton ; à côté, la
 *     planche, où les billes tombent clou après clou (à chaque clou, gauche ou
 *     droite : une épreuve de Bernoulli) ;
 *   - LES RÉPONSES : les bacs de verre au pied de la planche (`choix`) — on
 *     lâche sa bille dans le bon bac ;
 *   - APRÈS LA RÉPONSE : l'histogramme de la loi B(n ; p) de la question, la
 *     barre (ou les barres) qui répondent allumées, l'espérance marquée ; pour
 *     les chemins, le triangle de Pascal et sa case ; pour le schéma, les
 *     épreuves identiques et indépendantes — ou ce qui l'empêche.
 */

const P = 'sc-loi-binomiale';

/* ---------------------------------------------------------------- le décor */

function Planche() {
  const clous = [];
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c <= r; c += 1) clous.push([100 + (c - r / 2) * 22, 34 + r * 17]);
  }
  return (
    <svg className={`${P}__planche`} viewBox="0 0 200 160" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sc-bin-cuivre" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ffe3c4" />
          <stop offset="1" stopColor="#b8642a" />
        </radialGradient>
        <radialGradient id="sc-bin-argent" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#7d8796" />
        </radialGradient>
      </defs>
      <rect x="6" y="4" width="188" height="152" rx="14" className={`${P}__fond`} />
      <path d="M80 6 H120 L106 22 H94 Z" className={`${P}__entonnoir`} />
      {clous.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" className={`${P}__clou`} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={36 + i * 22} y={118 + Math.abs(2.5 - i) * 5} width="18" height={34 - Math.abs(2.5 - i) * 5} rx="2" className={`${P}__tas`} />
          <rect x={34 + i * 22} y="112" width="22" height="42" rx="3" className={`${P}__bac`} />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx="100" cy="18" r="4.5" fill={i % 2 ? 'url(#sc-bin-argent)' : 'url(#sc-bin-cuivre)'} className={`${P}__bille est-chemin-${i % 3}`} style={{ '--n': i }} />
      ))}
    </svg>
  );
}

/* --------------------------------------------------------- les explications */

/** « B(10 ; 0,3) », « B(4 ; 1/3) » → { n, p }, ou null. */
export function lireLoi(texte) {
  const lu = String(texte).match(/B\((\d+) ; ([\d,]+(?:\/\d+)?)\)/);
  if (!lu) return null;
  const n = Number(lu[1]);
  let p;
  if (lu[2].includes('/')) {
    const [a, b] = lu[2].split('/').map(Number);
    p = b ? a / b : NaN;
  } else p = nombreFr(lu[2]);
  if (!Number.isInteger(n) || n < 1 || n > 40 || !(p > 0 && p < 1)) return null;
  return { n, p };
}

const combinaisons = (n, k) => {
  let c = 1;
  for (let i = 1; i <= k; i += 1) c = (c * (n - k + i)) / i;
  return Math.round(c);
};
const proba = (n, p, k) => combinaisons(n, k) * p ** k * (1 - p) ** (n - k);

/** L'histogramme de B(n ; p) : `allumees` dit quelles barres répondent, `barree` laquelle on retire. */
function Histogramme({
  n, p, allumees = [], barree = null, esperance = false, ecart = false,
}) {
  const valeurs = Array.from({ length: n + 1 }, (_, k) => proba(n, p, k));
  const max = Math.max(...valeurs);
  const L = 300;
  const larg = (L - 20) / (n + 1);
  const X = (k) => 10 + k * larg;
  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));
  return (
    <svg className={`${P}__histo`} viewBox={`0 0 ${L} 120`} aria-hidden="true" focusable="false">
      {ecart && (
        <rect x={X(mu - sigma) + larg / 2} y="6" width={2 * sigma * larg} height="92" className={`${P}__bande`} />
      )}
      {valeurs.map((v, k) => (
        <g key={k} className={`${P}__colonne`} style={{ '--n': k }}>
          <rect
            x={X(k) + larg * 0.12}
            y={98 - (v / max) * 86}
            width={larg * 0.76}
            height={Math.max((v / max) * 86, 0.6)}
            rx="2"
            className={`${allumees.includes(k) ? 'est-allumee' : ''}${barree === k ? ' est-barree' : ''}`}
          />
          {(n <= 12 || k % 2 === 0) && <text x={X(k) + larg / 2} y="112" textAnchor="middle">{k}</text>}
        </g>
      ))}
      {barree !== null && (
        <path d={`M${X(barree) + 2} 20 L${X(barree) + larg - 2} 96 M${X(barree) + larg - 2} 20 L${X(barree) + 2} 96`} className={`${P}__croix`} />
      )}
      {esperance && (
        <g className={`${P}__esperance`}>
          <line x1={X(mu) + larg / 2} y1="2" x2={X(mu) + larg / 2} y2="100" />
          <text x={X(mu) + larg / 2} y="12" textAnchor="middle">np</text>
        </g>
      )}
    </svg>
  );
}

/** Le triangle de Pascal jusqu'à la ligne n, la case « k parmi n » allumée. */
function Pascal({ n, k }) {
  const lignes = Array.from({ length: n + 1 }, (_, r) => Array.from({ length: r + 1 }, (__, c) => combinaisons(r, c)));
  const pas = 300 / (n + 2);
  return (
    <svg className={`${P}__pascal`} viewBox={`0 0 300 ${(n + 1) * 15 + 6}`} aria-hidden="true" focusable="false">
      {lignes.map((ligne, r) => ligne.map((v, c) => {
        const cible = r === n && c === k;
        return (
          <text
            // eslint-disable-next-line react/no-array-index-key
            key={`${r}-${c}`}
            x={150 + (c - r / 2) * pas}
            y={14 + r * 15}
            textAnchor="middle"
            className={`${P}__case${cible ? ' est-cible' : ''}`}
            style={{ '--n': r }}
          >
            {v}
          </text>
        );
      }))}
    </svg>
  );
}

function Explication({ m }) {
  const q = String(m.question);
  const loi = lireLoi(q);
  let dessin = null;
  let texte = `La réponse : ${m.bonne}.`;
  if (m.consigne === 'parametres') {
    const bonne = lireLoi(m.bonne);
    if (bonne) {
      dessin = <Histogramme n={bonne.n} p={bonne.p} />;
      texte = `${bonne.n} épreuves identiques et indépendantes, chacune un succès de probabilité p : X suit ${m.bonne}.`;
    } else {
      texte = 'Sans remise, l’urne change à chaque tirage : les épreuves ne sont ni identiques ni indépendantes. Ce n’est pas une loi binomiale.';
    }
  } else if (m.consigne === 'chemins') {
    const [n, k] = (q.match(/\d+/g) ?? []).map(Number);
    if (Number.isInteger(n) && Number.isInteger(k) && n <= 10 && k <= n) {
      dessin = <Pascal n={n} k={k} />;
      texte = `Les chemins à ${k} succès parmi ${n} épreuves : « ${k} parmi ${n} » = ${m.bonne}.`;
    }
  } else if (loi) {
    const { n } = loi;
    const k = nombreFr(q.match(/P\(X = (\d+)\)/)?.[1]);
    if (m.consigne === 'probabilite' && k !== null) {
      dessin = <Histogramme {...loi} allumees={[k]} />;
      texte = `P(X = ${k}) = (${k} parmi ${n}) × p${'⁰¹²³⁴⁵⁶⁷⁸⁹'[k] ?? 'ᵏ'} × (1 − p)ⁿ⁻ᵏ = ${m.bonne}`;
    } else if (m.consigne === 'extremes' && k !== null) {
      dessin = <Histogramme {...loi} allumees={[k]} />;
      texte = k === 0 ? `P(X = 0) : ${n} échecs de suite, (1 − p)ⁿ = ${m.bonne}.` : `P(X = ${n}) : ${n} succès de suite, pⁿ = ${m.bonne}.`;
    } else if (m.consigne === 'au-moins-un') {
      dessin = <Histogramme {...loi} allumees={Array.from({ length: n }, (_, i) => i + 1)} barree={0} />;
      texte = `Toutes les barres sauf la première : P(X ≥ 1) = 1 − P(X = 0) = ${m.bonne}.`;
    } else if (m.consigne === 'esperance') {
      dessin = <Histogramme {...loi} esperance />;
      texte = `En moyenne, n × p succès : E(X) = ${n} × p = ${m.bonne}.`;
    } else if (m.consigne === 'variance') {
      dessin = <Histogramme {...loi} esperance ecart />;
      texte = `La dispersion autour de np : V(X) = np(1 − p) = ${m.bonne}.`;
    } else if (m.consigne === 'ecart-type') {
      dessin = <Histogramme {...loi} esperance ecart />;
      texte = `La bande d’un écart type autour de np : σ(X) = √(np(1 − p)) ≈ ${m.bonne}.`;
    }
  }
  return (
    <div className={`${P}__explication`}>
      {dessin}
      <p className={`${P}__regle`}>{texte}</p>
    </div>
  );
}

export function QuestionBinomiale({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Planche />}
      <div className={`${P}__plaque`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/** Les réponses : les bacs de verre au pied de la planche ; on y lâche sa bille. */
export function BacsBinomiale({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__bacs`} role="group" aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <button
            key={cle}
            type="button"
            className={`${P}__bac-reponse${fausse ? ' est-fausse' : ''}`}
            style={{ '--i': i }}
            onClick={() => choisir(cle)}
            disabled={fausse}
          >
            <span className={`${P}__goulot`} aria-hidden="true" />
            <span className={`${P}__billes`} aria-hidden="true" />
            <span className={`${P}__etiquette`}>{libelle}</span>
          </button>
        );
      })}
    </div>
  );
}

