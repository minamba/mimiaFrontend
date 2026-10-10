import {
  deriverPolynome, ecrirePolynome, lirePolynome, TexteQuestion,
} from './outils';

/**
 * LES TOITS DE TUILES AU COUCHANT — « La convexité » (terminale). La
 * couverture : une fille accroupie sur des toits de tuiles orangées aux
 * pentes courbes, des pavillons aux avant-toits relevés, le soleil couchant.
 * Un toit, c'est une courbe : creusée comme un bol (convexe) ou bombée comme
 * un dôme (concave). La scène la reprend :
 *   - LA QUESTION : sur un panneau laqué, bordé de terre cuite ; à côté, les
 *     toits au couchant, et une bille qui roule dans le creux d'un toit ;
 *   - LES RÉPONSES : des tuiles de terre cuite (`objets`) ;
 *   - APRÈS LA RÉPONSE : la courbe de l'allure trouvée se trace, ses
 *     tangentes (ou ses cordes) viennent se poser une à une — au-dessous d'un
 *     toit convexe, au-dessus d'un toit concave, de part et d'autre d'un point
 *     d'inflexion, qui clignote ; pour f″, la dérivation faite deux fois.
 */

const P = 'sc-convexite';

/* ---------------------------------------------------------------- le décor */

function Toits() {
  return (
    <svg className={`${P}__toits`} viewBox="0 0 240 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-conv-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5d8fd8" />
          <stop offset="0.6" stopColor="#ffc58a" />
          <stop offset="1" stopColor="#ff9d5c" />
        </linearGradient>
        <linearGradient id="sc-conv-tuile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f08a4b" />
          <stop offset="1" stopColor="#a8441c" />
        </linearGradient>
      </defs>
      <rect width="240" height="150" rx="16" fill="url(#sc-conv-ciel)" />
      <circle className={`${P}__soleil`} cx="46" cy="64" r="14" fill="#fff3c4" />
      <path d="M0 96 L50 80 L84 90 L130 74 L170 86 L240 76 V110 H0 Z" fill="#7d6aa8" opacity="0.6" />
      {/* Un pavillon au loin : avant-toits relevés. */}
      <path d="M150 64 Q176 58 200 40 Q224 58 250 64 Q222 66 200 60 Q178 66 150 64 Z" fill="url(#sc-conv-tuile)" />
      <rect x="170" y="64" width="60" height="22" fill="#f6e3c6" />
      {/* Le grand toit au premier plan, creusé comme un bol. */}
      <path d="M0 98 Q120 170 240 98 V150 H0 Z" fill="url(#sc-conv-tuile)" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <path key={i} d={`M${i * 21} ${(98 + 144 * (i / 11.43) * (1 - i / 11.43)).toFixed(1)} v50`} className={`${P}__rang`} />
      ))}
      <path d="M0 98 Q120 170 240 98" className={`${P}__faitage`} />
      {/* La bille roule dans le creux, de part et d'autre. */}
      <circle className={`${P}__bille`} cx="120" cy="126" r="7" />
    </svg>
  );
}

/* --------------------------------------------------------- l'explication */

/** L'allure à montrer, d'après la sorte de manche et sa réponse. */
export function allureDe(m) {
  const q = String(m.question);
  switch (m.consigne) {
    case 'convexe-sur':
    case 'reference':
    case 'lien-derivee':
      return { convexe: 'convexe', concave: 'concave', ni: 'ni', rien: 'rien' }[m.bonne] ?? null;
    case 'position-courbe': {
      const objet = q.includes('cordes') ? 'cordes' : 'tangentes';
      if (m.bonne === 'aucun') return 'ni';
      const dessusTangentes = (m.bonne === 'dessus') === (objet === 'tangentes');
      return dessusTangentes ? 'convexe' : 'concave';
    }
    case 'inflexion':
    case 'points-inflexion':
      return 'ni';
    default:
      return null;
  }
}

const COURBES = {
  convexe: (x) => 0.0095 * (x - 120) ** 2 + 15,
  concave: (x) => 120 - 0.0095 * (x - 120) ** 2,
  ni: (x) => 65 - 0.00004 * (x - 120) ** 3,
};
const PENTES = {
  convexe: (x) => 0.019 * (x - 120),
  concave: (x) => -0.019 * (x - 120),
  ni: (x) => -0.00012 * (x - 120) ** 2,
};

/** La courbe de l'allure, et ses tangentes ou ses cordes qui viennent se poser. */
function Courbe({ allure, objet }) {
  const f = COURBES[allure];
  const fp = PENTES[allure];
  let d = '';
  for (let x = 20; x <= 220; x += 5) d += `${x === 20 ? 'M' : 'L'}${x} ${(130 - f(x)).toFixed(1)} `;
  const Y = (y) => 130 - y;
  const points = allure === 'ni' ? [60, 120, 180] : [55, 120, 185];
  return (
    <svg className={`${P}__courbe`} viewBox="0 0 240 140" aria-hidden="true" focusable="false">
      <path d={d.trim()} className={`${P}__trace`} pathLength="1" />
      {objet === 'cordes'
        ? [[40, 110], [90, 200]].map(([a, b], i) => (
          <line key={a} x1={a} y1={Y(f(a))} x2={b} y2={Y(f(b))} className={`${P}__corde`} style={{ '--n': i }} />
        ))
        : points.map((x0, i) => {
          const y0 = f(x0);
          const p = fp(x0);
          return (
            <line key={x0} x1={x0 - 32} y1={Y(y0 - 32 * p)} x2={x0 + 32} y2={Y(y0 + 32 * p)} className={`${P}__tangente`} style={{ '--n': i }} />
          );
        })}
      {allure === 'ni' && <circle cx="120" cy={Y(f(120))} r="6" className={`${P}__inflexion`} />}
    </svg>
  );
}

const TEXTES = {
  convexe: 'Convexe : f″ ≥ 0, f′ croissante ; la courbe est au-dessus de ses tangentes et au-dessous de ses cordes, comme un bol.',
  concave: 'Concave : f″ ≤ 0, f′ décroissante ; la courbe est au-dessous de ses tangentes et au-dessus de ses cordes, comme un dôme.',
  ni: 'f″ change de signe : la courbe passe d’un côté à l’autre de sa tangente au point d’inflexion. Ni convexe ni concave sur tout l’intervalle.',
  rien: 'Le signe de f, ou de f′, ne dit rien de la courbure : c’est f″ (ou le sens de variation de f′) qui la donne.',
};

function DeriveeSeconde({ m }) {
  const f = String(m.question).split('\n')[0].replace(/^f\(x\) = /, '');
  const coefs = lirePolynome(f);
  const fPrime = coefs ? ecrirePolynome(deriverPolynome(coefs)) : null;
  return (
    <div className={`${P}__chaine`}>
      <span className={`${P}__piece`}>{`f(x) = ${f}`}</span>
      {fPrime && <span className={`${P}__fleche`} aria-hidden="true">dérivée ↓</span>}
      {fPrime && <span className={`${P}__piece`} style={{ '--n': 1 }}>{`f′(x) = ${fPrime}`}</span>}
      <span className={`${P}__fleche`} aria-hidden="true" style={{ '--n': 2 }}>dérivée ↓</span>
      <span className={`${P}__piece est-fin`} style={{ '--n': 2 }}>{`f″(x) = ${m.bonne}`}</span>
    </div>
  );
}

function Explication({ m }) {
  if (m.consigne === 'derivee-seconde') {
    return (
      <div className={`${P}__explication`}>
        <DeriveeSeconde m={m} />
        <p className={`${P}__regle`}>On dérive deux fois ; la constante disparaît dès la première fois.</p>
      </div>
    );
  }
  const allure = allureDe(m);
  const objet = String(m.question).includes('cordes') ? 'cordes' : 'tangentes';
  let texte = allure ? TEXTES[allure] : `La réponse : ${m.bonne}.`;
  if (m.consigne === 'points-inflexion') {
    texte = 'Un point d’inflexion, c’est là où f″ s’annule EN CHANGEANT de signe. Une racine double annule f″ sans changer son signe.';
  } else if (m.consigne === 'inflexion') {
    texte = 'Le point d’inflexion est là où f″ s’annule en changeant de signe — pas là où f′ s’annule (ce sont les bosses).';
  }
  return (
    <div className={`${P}__explication`}>
      {allure && allure !== 'rien' && <Courbe allure={allure} objet={objet} />}
      <p className={`${P}__regle`}>{texte}</p>
    </div>
  );
}

export function QuestionConvexite({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Toits />}
      <div className={`${P}__panneau`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
