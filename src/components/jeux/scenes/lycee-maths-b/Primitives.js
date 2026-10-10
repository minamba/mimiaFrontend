import {
  ecrireFr, fenetreValide, nombreFr, repere, TexteQuestion, tracer, valeurSure,
} from './outils';

/**
 * LES MARAIS SALANTS AU COUCHANT — « Primitives et intégrales » (terminale).
 * La couverture : des bassins de sel en terrasses au bord de la mer, le
 * soleil qui se couche, une paludière qui montre l'horizon. Une intégrale,
 * c'est une aire qu'on remplit : un bassin. La scène la reprend :
 *   - LA QUESTION : sur un panneau de bois blanchi par le sel ; au-dessus, les
 *     bassins scintillent au couchant, le soleil descend, le râteau tire le sel ;
 *   - LES RÉPONSES : de petits bassins d'eau rose (`objets`) ;
 *   - APRÈS LA RÉPONSE : le bassin se remplit sous la courbe — l'eau sous
 *     l'axe compte en négatif pour une intégrale, jamais pour une aire, et la
 *     valeur moyenne est le niveau d'eau qui garde la même aire ; pour une
 *     primitive, on dérive la réponse et on retombe sur f ; pour la linéarité
 *     et Chasles, le calcul posé.
 */

const P = 'sc-primitives-et-integrales';

/* ---------------------------------------------------------------- le décor */

function Marais() {
  const bassins = [
    [10, 92, 70, 14], [86, 92, 64, 14], [156, 92, 70, 14],
    [26, 110, 80, 15], [112, 110, 74, 15], [192, 110, 62, 15],
  ];
  return (
    <svg className={`${P}__marais`} viewBox="0 0 260 132" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-prim-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b4b9a" />
          <stop offset="0.45" stopColor="#f2799b" />
          <stop offset="0.75" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#ffe0a3" />
        </linearGradient>
        <linearGradient id="sc-prim-eau" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd6e4" />
          <stop offset="0.5" stopColor="#f6a9c5" />
          <stop offset="1" stopColor="#c99ae6" />
        </linearGradient>
      </defs>
      <rect width="260" height="132" rx="14" fill="url(#sc-prim-ciel)" />
      <circle className={`${P}__soleil`} cx="196" cy="58" r="13" fill="#fff2b0" />
      <path d="M0 70 L40 52 L70 62 L110 48 L150 64 L260 56 V80 H0 Z" fill="#6c4f8f" opacity="0.8" />
      <rect y="72" width="260" height="14" fill="#f7b38c" />
      <path className={`${P}__reflet`} d="M180 75 h32 M186 80 h20" stroke="#fff6c9" strokeWidth="2" strokeLinecap="round" />
      <rect y="86" width="260" height="46" fill="#e9dccb" />
      {bassins.map(([x, y, l, h], i) => (
        // eslint-disable-next-line react/no-array-index-key
        <g key={i}>
          <rect x={x} y={y} width={l} height={h} rx="2" fill="url(#sc-prim-eau)" stroke="#fffaf2" strokeWidth="2.5" />
          <rect className={`${P}__scintille`} x={x + 6} y={y + 3} width={l / 3} height="2" rx="1" fill="#fff" style={{ '--n': i }} />
        </g>
      ))}
      {/* Les tas de sel et le râteau de la paludière. */}
      <path d="M232 128 l10 -14 l10 14 Z M214 128 l7 -9 l7 9 Z" fill="#fffdf8" stroke="#d8c7b0" strokeWidth="1" />
      <g className={`${P}__rateau`}>
        <line x1="10" y1="88" x2="46" y2="122" stroke="#8a5a2b" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 126 h20" stroke="#8a5a2b" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- les explications */

/** « −3/2 », « 5 », « −4 » → un nombre ; null sinon. */
export function lireFraction(texte) {
  const lu = String(texte).trim().match(/^([−-]?\d+)(?:\/(\d+))?$/);
  if (!lu) return null;
  const n = nombreFr(lu[1]);
  const d = lu[2] ? Number(lu[2]) : 1;
  return n === null || d === 0 ? null : n / d;
}

/** Le bassin qui se remplit sous la courbe : l'intégrale, l'aire, ou le niveau moyen. */
function Bassin({ m }) {
  const v = m.visuel;
  const fenetre = fenetreValide(v);
  const f = v?.fonctions?.[0];
  const a = v?.aire?.a;
  const b = v?.aire?.b;
  if (!fenetre || !f || !Number.isFinite(a) || !Number.isFinite(b)) return null;
  const R = repere(fenetre, 320, 170);
  const { X, Y } = R;
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const zero = Math.min(Math.max(0, fenetre.ymin), fenetre.ymax);
  // L'eau, tranche par tranche : au-dessus de l'axe (bleu) ou au-dessous (rouge pour une intégrale).
  const tranches = [];
  const N = 40;
  for (let i = 0; i < N; i += 1) {
    const x0 = lo + ((hi - lo) * i) / N;
    const x1 = lo + ((hi - lo) * (i + 1)) / N;
    const y = valeurSure(f, (x0 + x1) / 2);
    if (Number.isFinite(y)) tranches.push({ x0, x1, y });
  }
  const moyenne = m.consigne === 'moyenne' ? lireFraction(m.bonne) : null;
  const signee = m.consigne === 'integrale';
  let legende = `Aire = ${m.bonne} u.a. : une aire est toujours positive.`;
  if (signee) legende = `∫ = F(b) − F(a) = ${m.bonne} : l’eau sous l’axe compte en négatif.`;
  if (m.consigne === 'moyenne') legende = `Valeur moyenne = (1 / (b − a)) × ∫ f = ${m.bonne} : le niveau d’eau qui garde la même aire.`;
  return (
    <div className={`${P}__bassin`}>
      <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false">
        <line x1="0" y1={Y(zero)} x2="320" y2={Y(zero)} className={`${P}__axe`} />
        <g className={`${P}__eau`} style={{ transformOrigin: `160px ${Y(zero).toFixed(1)}px` }}>
          {tranches.map(({ x0, x1, y }, i) => (
            <rect
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              x={X(x0)}
              width={Math.max(X(x1) - X(x0) + 0.4, 0.5)}
              y={Math.min(Y(y), Y(zero))}
              height={Math.abs(Y(y) - Y(zero))}
              className={signee && y < 0 ? 'est-negative' : 'est-positive'}
            />
          ))}
        </g>
        {moyenne !== null && Number.isFinite(moyenne) && (
          <rect
            x={X(lo)}
            width={X(hi) - X(lo)}
            y={Math.min(Y(moyenne), Y(zero))}
            height={Math.abs(Y(moyenne) - Y(zero))}
            className={`${P}__niveau`}
          />
        )}
        <path d={tracer(f, fenetre, R)} className={`${P}__courbe`} />
        {[lo, hi].map((x) => <line key={x} x1={X(x)} y1="4" x2={X(x)} y2="166" className={`${P}__borne`} />)}
      </svg>
      <p className={`${P}__regle`}>{legende}</p>
    </div>
  );
}

/** La vérification d'une primitive : on dérive F, on retrouve f. */
function Verification({ m }) {
  const f = String(m.question).split('\n')[0].replace(/^f\(x\) = /, '').replace(/, sur .*$/, '');
  return (
    <div className={`${P}__verif`}>
      <span className={`${P}__piece`}>{`F(x) = ${m.bonne}`}</span>
      <span className={`${P}__derive`} aria-hidden="true">dérivée ↓</span>
      <span className={`${P}__piece est-f`}>{`F′(x) = f(x) = ${f}`}</span>
      <p className={`${P}__regle`}>Primitiver, c’est le chemin inverse de dériver : la dérivée de F redonne f.</p>
    </div>
  );
}

/** Un nombre dans un calcul : entre parenthèses s'il est négatif. */
const par = (x) => (x < 0 ? `(${ecrireFr(x)})` : ecrireFr(x));

/** La linéarité ou la relation de Chasles, le calcul posé avec les nombres de la question. */
function Calcul({ m }) {
  const lignes = String(m.question).split('\n');
  const val = (l) => nombreFr(l?.match(/= (−?\d+)$/)?.[1]);
  const [A, B] = [val(lignes[0]), val(lignes[1])];
  if (A === null || B === null) return null;
  const lin = lignes[2]?.match(/\((\d+)f\(x\) ([+−]) (\d*)g\(x\)\)/);
  if (lin) {
    const alpha = Number(lin[1]);
    const beta = (lin[2] === '−' ? -1 : 1) * (lin[3] === '' ? 1 : Number(lin[3]));
    return (
      <div className={`${P}__verif`}>
        <span className={`${P}__piece`}>{`∫(${alpha}f ${lin[2]} ${lin[3]}g) = ${alpha} × ∫f ${lin[2]} ${lin[3] || '1'} × ∫g`}</span>
        <span className={`${P}__piece est-f`}>{`= ${alpha} × ${par(A)} ${beta < 0 ? '−' : '+'} ${Math.abs(beta)} × ${par(B)} = ${m.bonne}`}</span>
        <p className={`${P}__regle`}>L’intégrale est linéaire : les coefficients sortent, avec leur signe.</p>
      </div>
    );
  }
  const bornes = (l) => l?.match(/de (−?\d+) à (−?\d+)/)?.slice(1, 3);
  const [c, e] = bornes(lignes[0]) ?? [];
  const [, d] = bornes(lignes[1]) ?? [];
  if (c === undefined || d === undefined || e === undefined) return null;
  return (
    <div className={`${P}__chasles`}>
      <svg viewBox="0 0 300 70" aria-hidden="true" focusable="false">
        <line x1="20" y1="40" x2="280" y2="40" className={`${P}__route`} />
        <path d="M20 40 Q85 6 150 40" className={`${P}__arc est-connu`} />
        <path d="M150 40 Q215 6 280 40" className={`${P}__arc est-cherche`} />
        <path d="M20 46 Q150 76 280 46" className={`${P}__arc est-total`} />
        {[[20, c], [150, d], [280, e]].map(([x, t]) => (
          <g key={x}>
            <circle cx={x} cy="40" r="5" className={`${P}__jalon`} />
            <text x={x} y="30" textAnchor="middle" className={`${P}__nombre`}>{t}</text>
          </g>
        ))}
      </svg>
      <span className={`${P}__piece est-f`}>{`∫ de ${d} à ${e} = ${ecrireFr(A)} − ${par(B)} = ${m.bonne}`}</span>
      <p className={`${P}__regle`}>Relation de Chasles : de c à e, c’est de c à d, puis de d à e.</p>
    </div>
  );
}

function Signe({ m }) {
  const lu = String(m.question).match(/∫ de (−?\d+) à (−?\d+)/);
  const envers = lu ? nombreFr(lu[1]) > nombreFr(lu[2]) : false;
  let texte = 'Positivité : une fonction positive a une intégrale positive (bornes dans l’ordre), négative pour une fonction négative.';
  if (envers) texte = 'Les bornes sont à l’envers (de la plus grande à la plus petite) : l’intégrale change de signe.';
  return (
    <div className={`${P}__verif`}>
      <span className={`${P}__piece est-f`}>{`Signe : ${m.bonne}`}</span>
      <p className={`${P}__regle`}>{texte}</p>
    </div>
  );
}

function Explication({ m }) {
  let contenu = null;
  if (['integrale', 'aire', 'moyenne'].includes(m.consigne)) contenu = <Bassin m={m} />;
  else if (m.consigne === 'primitive' || m.consigne === 'composee') contenu = <Verification m={m} />;
  else if (m.consigne === 'linearite') contenu = <Calcul m={m} />;
  else if (m.consigne === 'signe') contenu = <Signe m={m} />;
  return (
    <div className={`${P}__explication`}>
      {contenu ?? <p className={`${P}__regle`}>{`La réponse : ${m.bonne}.`}</p>}
    </div>
  );
}

export function QuestionPrimitives({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Marais />}
      <div className={`${P}__panneau`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
