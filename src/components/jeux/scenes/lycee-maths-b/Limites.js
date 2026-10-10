import { nombreFr, TexteQuestion } from './outils';

/**
 * LE CANYON DES CASCADES — « Limites et continuité » (terminale). La
 * couverture : une randonneuse au blouson bleu et orange, au bord de falaises
 * d'où tombent des cascades, l'horizon à perte de vue. La scène la reprend :
 *   - LA QUESTION : gravée sur une stèle de pierre ; au-dessus, la randonneuse
 *     marche sur un sentier qui file vers l'horizon (les bornes 1, 10, 100,
 *     1 000 rapetissent : on va vers l'infini), une cascade coule à côté ;
 *   - LES RÉPONSES : des radeaux qui dansent sur la rivière — on monte sur le
 *     bon (`choix`) ;
 *   - APRÈS LA RÉPONSE : l'explication de la sorte de manche — les termes de
 *     qⁿ en barres, les deux rivières f et g qui se rejoignent, le terme qui
 *     domine, le podium des croissances comparées, les flèches du tableau de
 *     variations comptées une à une, le théorème qui s'applique.
 * Avant la réponse, rien n'est calculé à l'écran.
 */

const P = 'sc-limites-et-continuite';

/* ---------------------------------------------------------------- le décor */

/** La randonneuse : blouson bleu à liseré orange, cheveux bouclés, sac à dos. */
function Randonneuse() {
  return (
    <g className={`${P}__randonneuse`}>
      <ellipse cx="0" cy="34" rx="9" ry="2.4" fill="rgba(0,0,0,0.25)" />
      <g className={`${P}__jambes`}>
        <rect x="-5" y="18" width="4" height="15" rx="2" fill="#2b2f3a" />
        <rect x="1" y="18" width="4" height="15" rx="2" fill="#2b2f3a" />
      </g>
      <rect x="-9" y="2" width="6" height="12" rx="2" fill="#3c2a1e" />
      <path d="M-7 3 Q0 -2 7 3 L8 20 L-8 20 Z" fill="#2c5fd6" stroke="#ff8a1c" strokeWidth="1.6" />
      <circle cx="0" cy="-6" r="7" fill="#f6d2b0" />
      <path d="M-8 -8 q2 -9 8 -8 q7 -1 8 7 q2 4 -1 8 q1 -6 -3 -9 q-5 -3 -10 1 q-3 3 -2 7 q-3 -2 0 -6 Z" fill="#8a4b1f" />
      <circle cx="2.5" cy="-6" r="1" fill="#3b2412" />
      <path d="M1 -2 q2 1.4 4 0" stroke="#a5442a" strokeWidth="1" fill="none" />
    </g>
  );
}

/** Les falaises, la cascade, le sentier vers l'horizon et ses bornes de plus en plus loin. */
function Canyon() {
  const bornes = [
    { x: 196, y: 108, s: 1, t: '1' },
    { x: 168, y: 86, s: 0.78, t: '10' },
    { x: 150, y: 71, s: 0.6, t: '100' },
    { x: 139, y: 61, s: 0.45, t: '1 000' },
  ];
  return (
    <svg className={`${P}__canyon`} viewBox="0 0 280 130" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-lim-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fb2ff" />
          <stop offset="1" stopColor="#d7efff" />
        </linearGradient>
        <linearGradient id="sc-lim-eau" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9fbff" />
          <stop offset="1" stopColor="#5cc8d8" />
        </linearGradient>
      </defs>
      <rect width="280" height="130" rx="14" fill="url(#sc-lim-ciel)" />
      <path className={`${P}__nuage`} d="M30 22 q8 -10 18 -2 q10 -6 15 4 q8 1 4 7 h-38 q-6 -4 1 -9 Z" fill="#fff" opacity="0.9" />
      <path d="M150 58 l20 -22 l14 12 l18 -16 l26 26 Z" fill="#9fb7c9" />
      {/* L'horizon : l'infini, qu'on n'atteint jamais. */}
      <circle className={`${P}__horizon`} cx="134" cy="56" r="9" fill="#fff6c9" />
      <text x="134" y="59.5" textAnchor="middle" className={`${P}__infini`}>∞</text>
      <path d="M0 130 V64 L40 52 L70 68 L92 58 L120 62 L124 130 Z" fill="#7e8f74" />
      <path d="M0 130 V76 L36 66 L60 80 L86 72 L110 80 L118 130 Z" fill="#5e7a52" />
      <path d="M280 130 V60 L248 50 L222 64 L196 58 L176 66 L168 130 Z" fill="#8a9b7a" />
      {/* La cascade, qui coule sans fin. */}
      <rect x="100" y="60" width="12" height="70" fill="url(#sc-lim-eau)" />
      <path className={`${P}__chute`} d="M102 60 V130 M106 60 V130 M110 60 V130" stroke="#fff" strokeWidth="1.4" strokeDasharray="5 7" />
      <ellipse className={`${P}__ecume`} cx="106" cy="126" rx="16" ry="4" fill="#fff" opacity="0.8" />
      {/* Le sentier vers l'horizon. */}
      <path d="M180 130 L226 130 L138 60 L132 60 Z" fill="#d8c7a0" />
      <path d="M203 130 L135 60" stroke="#fff" strokeWidth="1" strokeDasharray="4 5" opacity="0.7" />
      {bornes.map((b) => (
        <g key={b.t} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
          <rect x="-11" y="-14" width="22" height="13" rx="3" fill="#fff" stroke="#5e4a2c" strokeWidth="1.2" />
          <text x="0" y="-4.5" textAnchor="middle" className={`${P}__borne`}>{b.t}</text>
          <rect x="-1.2" y="-1" width="2.4" height="8" fill="#5e4a2c" />
        </g>
      ))}
      <g transform="translate(212 92)">
        <Randonneuse />
      </g>
    </svg>
  );
}

/* --------------------------------------------------------- les explications */

/** « uₙ = 0,5ⁿ », « uₙ = (−2)ⁿ », « uₙ = 3 − 2 × 0,8ⁿ » → { a, b, q } avec uₙ = a + b qⁿ, ou null. */
export function lireGeometrique(question) {
  const ligne = String(question).split('\n')[0];
  const m = ligne.match(/^uₙ = (?:(−?\d+) ([+−]) (\d+) × )?\(?(−?[\d,]+)\)?ⁿ$/);
  if (!m) return null;
  const q = nombreFr(m[4]);
  if (q === null) return null;
  if (m[1] === undefined) return { a: 0, b: 1, q };
  const a = nombreFr(m[1]);
  const b = nombreFr(m[3]);
  if (a === null || b === null) return null;
  return { a, b: m[2] === '−' ? -b : b, q };
}

/** Les termes de qⁿ en barres : on voit la suite s'écraser, exploser ou osciller. */
function BarresGeometrique({ suite }) {
  const { a, b, q } = suite;
  const termes = Array.from({ length: 10 }, (_, n) => a + b * q ** n);
  const plafond = Math.max(...termes.map((u) => Math.abs(u)), Math.abs(a), 1);
  const H = 54;
  const hauteur = (u) => (Math.min(Math.abs(u), plafond) / plafond) * H;
  let regle = 'La raison est entre −1 et 1 : qⁿ s’écrase vers 0.';
  if (q > 1) regle = 'La raison dépasse 1 : qⁿ grandit sans fin, vers +∞.';
  if (q <= -1) regle = 'La raison est inférieure ou égale à −1 : les termes changent de signe sans se calmer.';
  return (
    <div className={`${P}__barres`}>
      <svg viewBox="0 0 250 130" aria-hidden="true" focusable="false">
        <line x1="8" y1="65" x2="244" y2="65" className={`${P}__axe`} />
        {a !== 0 && (
          <line x1="8" y1={65 - (a / plafond) * H} x2="244" y2={65 - (a / plafond) * H} className={`${P}__asymptote`} />
        )}
        {termes.map((u, n) => (
          <g key={n} className={`${P}__barre`} style={{ '--n': n }}>
            <rect x={14 + n * 23} y={u >= 0 ? 65 - hauteur(u) : 65} width="15" height={Math.max(hauteur(u), 1)} rx="3" className={u >= 0 ? 'est-positive' : 'est-negative'} />
            <text x={21.5 + n * 23} y="126" textAnchor="middle">{`u${'₀₁₂₃₄₅₆₇₈₉'[n]}`}</text>
          </g>
        ))}
      </svg>
      <p className={`${P}__regle`}>{regle}</p>
    </div>
  );
}

/** Les deux rivières f et g qui se rejoignent : le lac porte la limite (ou le tourbillon de l'indétermination). */
function Rivieres({ m }) {
  const lu = String(m.question).match(/lim f = (\S+) et lim g = (\S+)\.\nlim \(f (\S) g\)/);
  if (!lu) return null;
  const [, f, g, op] = lu;
  const indeterminee = m.bonne === 'forme indéterminée';
  return (
    <div className={`${P}__rivieres`}>
      <span className={`${P}__source`}>{`lim f = ${f}`}</span>
      <span className={`${P}__operation`} aria-hidden="true">{op}</span>
      <span className={`${P}__source`}>{`lim g = ${g}`}</span>
      <span className={`${P}__fleche`} aria-hidden="true">→</span>
      <span className={`${P}__lac${indeterminee ? ' est-tourbillon' : ''}`}>{m.bonne}</span>
      {indeterminee && (
        <p className={`${P}__regle`}>Les quatre formes indéterminées : ∞ − ∞, 0 × ∞, ∞ / ∞ et 0 / 0. On les lève en factorisant.</p>
      )}
    </div>
  );
}

/** Le premier terme d'une somme écrite « 3x⁵ − 2x² + 1 ». */
const premierTerme = (s) => String(s).trim().split(/ [+−] /)[0];

/** Le terme qui domine en l'infini : le premier écrit, en haut (et en bas pour un quotient). */
function Dominant({ m }) {
  const ligne = String(m.question).split('\n')[0];
  const expr = ligne.replace(/^f\(x\) = /, '');
  if (expr === ligne) return null;
  let dominant;
  const quotient = expr.match(/^\((.+)\) \/ \((.+)\)$/);
  if (quotient) {
    const bas = premierTerme(quotient[2]);
    dominant = `${premierTerme(quotient[1])} / ${bas.startsWith('−') ? `(${bas})` : bas}`;
  } else dominant = premierTerme(expr);
  return (
    <div className={`${P}__dominant`}>
      <span className={`${P}__expr`}>{expr}</span>
      <span className={`${P}__fleche`} aria-hidden="true">≈</span>
      <span className={`${P}__geant`}>{dominant}</span>
      <p className={`${P}__regle`}>En l’infini, le terme de plus haut degré l’emporte : c’est lui qui donne la limite.</p>
    </div>
  );
}

/** Le podium des croissances comparées : l'exponentielle, puis les puissances, puis le logarithme. */
function Podium() {
  return (
    <div className={`${P}__podium`}>
      {[['eˣ', 'or', '1'], ['xⁿ', 'argent', '2'], ['ln x', 'bronze', '3']].map(([nom, metal, rang]) => (
        <div key={nom} className={`${P}__marche est-${metal}`}>
          <strong>{nom}</strong>
          <span>{rang}</span>
        </div>
      ))}
      <p className={`${P}__regle`}>L’exponentielle l’emporte sur toute puissance de x, qui l’emporte sur le logarithme.</p>
    </div>
  );
}

/** Le théorème des valeurs intermédiaires, flèche par flèche : k est-il entre les deux bornes ? */
function Fleches({ m }) {
  const q = String(m.question);
  const k = nombreFr(q.match(/f\(x\) = (−?\d+)/)?.[1]);
  const morceaux = [...q.matchAll(/(croît|décroît) de (−?\d+) à (−?\d+)/g)].map((x) => [x[1], nombreFr(x[2]), nombreFr(x[3])]);
  if (k === null || morceaux.length === 0 || morceaux.some(([, a, b]) => a === null || b === null)) return null;
  return (
    <div className={`${P}__tvi`}>
      {morceaux.map(([sens, a, b], i) => {
        const oui = (k - a) * (k - b) < 0;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} className={`${P}__morceau ${oui ? 'est-oui' : 'est-non'}`} style={{ '--n': i }}>
            {`${sens === 'croît' ? '↗' : '↘'} de ${a} à ${b} : ${k} ${oui ? 'est atteint une fois ✔' : 'n’est pas entre les deux ✘'}`}
          </span>
        );
      })}
      <p className={`${P}__regle`}>{`On compte une solution par flèche qui passe par ${k} : ${m.bonne}.`}</p>
    </div>
  );
}

/** Le théorème qui s'applique, nommé et dessiné. */
function Theoreme({ m }) {
  const q = String(m.question);
  let nom = 'Théorème de la limite monotone';
  let dessin = 'monotone';
  let texte = 'Monotone et bornée du bon côté : la suite converge, sans que la borne soit forcément sa limite.';
  const descend = q.includes('décroissante');
  if (q.includes('vₙ ≤ uₙ ≤ wₙ')) {
    nom = 'Théorème des gendarmes';
    dessin = 'gendarmes';
    texte = 'Coincée entre deux suites de même limite, la suite a cette limite.';
  } else if (q.includes('uₙ ≥ vₙ')) {
    nom = 'Théorème de comparaison';
    dessin = 'pousse';
    texte = 'Plus grande qu’une suite qui part vers +∞, elle y part aussi.';
  } else if (q.includes('uₙ ≤ vₙ')) {
    nom = 'La comparaison, dans le mauvais sens';
    dessin = 'rien';
    texte = 'Être plus petite qu’une suite qui part vers +∞ ne dit rien : on ne peut pas conclure.';
  } else if (q.includes('pas majorée')) {
    dessin = 'pousse';
    texte = 'Croissante et non majorée : elle part vers +∞.';
  }
  return (
    <div className={`${P}__theoreme`}>
      <svg viewBox="0 0 160 70" aria-hidden="true" focusable="false" className={`${P}__mini est-${dessin}`}>
        {dessin === 'gendarmes' && (
          <>
            <path d="M6 10 Q80 30 154 35" className={`${P}__trait est-haut`} pathLength="1" />
            <path d="M6 62 Q80 42 154 37" className={`${P}__trait est-bas`} pathLength="1" />
            <path d="M6 30 Q40 46 80 34 T154 36" className={`${P}__trait est-milieu`} />
          </>
        )}
        {dessin === 'monotone' && (
          <>
            <line x1="6" y1={descend ? 56 : 14} x2="154" y2={descend ? 56 : 14} className={`${P}__plafond`} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <circle key={n} cx={12 + n * 19} cy={descend ? 8 + 40 * (1 - 0.72 ** n) : 62 - 40 * (1 - 0.72 ** n)} r="3.6" className={`${P}__point`} style={{ '--n': n }} />
            ))}
          </>
        )}
        {(dessin === 'pousse' || dessin === 'rien') && (
          <>
            <path d={dessin === 'pousse' ? 'M6 50 Q90 46 154 6' : 'M6 40 Q90 36 154 4'} className={`${P}__trait est-haut`} pathLength="1" />
            <path d={dessin === 'pousse' ? 'M6 62 Q90 58 154 22' : 'M6 62 Q90 60 154 56'} className={`${P}__trait est-bas`} pathLength="1" />
          </>
        )}
      </svg>
      <div>
        <strong>{nom}</strong>
        <p className={`${P}__regle`}>{texte}</p>
      </div>
    </div>
  );
}

/** Après la réponse : l'explication de la sorte de manche. */
function Explication({ m }) {
  let contenu = null;
  if (m.consigne === 'geometrique') {
    const suite = lireGeometrique(m.question);
    contenu = suite ? <BarresGeometrique suite={suite} /> : null;
  } else if (m.consigne === 'operations') contenu = <Rivieres m={m} />;
  else if (m.consigne === 'terme-dominant') contenu = <Dominant m={m} />;
  else if (m.consigne === 'croissances') contenu = <Podium />;
  else if (m.consigne === 'tvi') contenu = <Fleches m={m} />;
  else if (m.consigne === 'convergence') contenu = <Theoreme m={m} />;
  return (
    <div className={`${P}__explication`}>
      {contenu ?? <p className={`${P}__regle`}>{`La réponse : ${m.bonne}.`}</p>}
    </div>
  );
}

export function QuestionLimites({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Canyon />}
      <div className={`${P}__stele`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/** Les réponses : des radeaux qui dansent sur la rivière, chacun un bouton à son libellé. */
export function RadeauxLimites({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__riviere`} role="group" aria-label="Choisis ta réponse">
      <span className={`${P}__vagues`} aria-hidden="true" />
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <button
            key={cle}
            type="button"
            className={`${P}__radeau${fausse ? ' est-fausse' : ''}`}
            style={{ '--i': i }}
            onClick={() => choisir(cle)}
            disabled={fausse}
          >
            <span className={`${P}__planches`} aria-hidden="true" />
            <span className={`${P}__libelle`}>{libelle}</span>
          </button>
        );
      })}
    </div>
  );
}
