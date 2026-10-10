import { ecrireFr, nombreFr, TexteQuestion } from './outils';

/**
 * LA CENTRALE SOLAIRE — « Fonctions et paraboles » (1re et terminale techno).
 * La couverture : sous un dôme de verre, des miroirs paraboliques géants qui
 * renvoient le soleil vers des tours ; un garçon tend la main vers la
 * lumière. Une parabole, c'est le miroir qui concentre les rayons en son
 * foyer. La scène la reprend :
 *   - LA QUESTION : sur la tablette de l'ingénieur ; à côté, un miroir
 *     parabolique, les rayons du soleil qui tombent, se réfléchissent et
 *     convergent vers le foyer, où la tour s'allume ;
 *   - LES RÉPONSES : des panneaux de miroir (`objets`) ;
 *   - APRÈS LA RÉPONSE : le calcul de la question refait terme à terme —
 *     chaque terme dérivé (l'exposant descend devant, a/x devient −a/x²), la
 *     tangente y = f′(a)(x − a) + f(a) avec ses deux nombres, l'axe au milieu
 *     de deux points de même image, le coût moyen minimal où C′ s'annule —,
 *     ou la règle de lecture de la parabole.
 */

const P = 'sc-fonctions-et-paraboles';

/* ---------------------------------------------------------------- le décor */

function Miroir() {
  const rayons = [52, 82, 112, 168, 198];
  const foyer = [140, 66];
  const y = (x) => 128 - ((x - 140) ** 2) / 120;
  return (
    <svg className={`${P}__miroir`} viewBox="0 0 280 150" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-par-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4aa3f0" />
          <stop offset="1" stopColor="#d8f1ff" />
        </linearGradient>
        <linearGradient id="sc-par-glace" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9f6ff" />
          <stop offset="0.5" stopColor="#9cc9ee" />
          <stop offset="1" stopColor="#e9f6ff" />
        </linearGradient>
      </defs>
      <rect width="280" height="150" rx="16" fill="url(#sc-par-ciel)" />
      {/* Les arceaux du dôme de verre. */}
      <path d="M0 150 Q140 -40 280 150 M40 150 Q140 0 240 150" className={`${P}__dome`} />
      <circle cx="232" cy="26" r="14" className={`${P}__soleil`} />
      {/* La tour et son foyer. */}
      <rect x="134" y="66" width="12" height="70" className={`${P}__tour`} />
      <circle cx={foyer[0]} cy={foyer[1]} r="8" className={`${P}__foyer`} />
      {/* Les rayons : tombent, touchent le miroir, repartent vers le foyer. */}
      {rayons.map((x, i) => (
        <path key={x} d={`M${x} 0 V${y(x).toFixed(1)} L${foyer[0]} ${foyer[1]}`} className={`${P}__rayon`} style={{ '--n': i }} />
      ))}
      <path d={`M40 ${y(40)} Q140 ${128 + (128 - y(40))} 240 ${y(240)}`} className={`${P}__parabole`} />
      <rect x="0" y="136" width="280" height="14" className={`${P}__sol`} />
      <path d="M0 142 H280" className={`${P}__rail`} />
    </svg>
  );
}

/* --------------------------------------------------------- les termes */

const EXP = { '': 1, '²': 2, '³': 3 };

/**
 * Une expression « 2x³ − 5x² + 3x − 7 », « 2x + 3 + 50/x », « −3/x² » →
 * ses termes { c, p } (c × xᵖ, p entier, négatif pour 1/x et 1/x²), ou null.
 */
export function lireTermes(expr) {
  const s = String(expr).trim();
  if (!s) return null;
  const morceaux = s.replace(/ ([+−]) /g, ' $1').split(' ');
  const termes = [];
  for (const m of morceaux) {
    const signe = m.startsWith('−') ? -1 : 1;
    const corps = m.replace(/^[+−]/, '');
    let t = corps.match(/^(\d+)\/x([²]?)$/);
    if (t) termes.push({ c: signe * Number(t[1]), p: t[2] ? -2 : -1 });
    else {
      t = corps.match(/^(\d*)x([²³]?)$/);
      if (t) termes.push({ c: signe * (t[1] === '' ? 1 : Number(t[1])), p: EXP[t[2]] });
      else if (/^\d+$/.test(corps)) termes.push({ c: signe * Number(corps), p: 0 });
      else return null;
    }
  }
  return termes;
}

const PUIS = { 1: 'x', 2: 'x²', 3: 'x³' };

/** Un terme écrit : « 3x² », « −50/x² », « 7 ». */
export function ecrireTerme({ c, p }, premier = false) {
  if (c === 0) return '';
  const abs = Math.abs(c);
  let corps;
  if (p === 0) corps = ecrireFr(abs);
  else if (p > 0) corps = `${abs === 1 ? '' : ecrireFr(abs)}${PUIS[p]}`;
  else corps = `${ecrireFr(abs)}/x${p === -2 ? '²' : ''}`;
  if (premier) return c < 0 ? `−${corps}` : corps;
  return `${c < 0 ? '−' : '+'} ${corps}`;
}

const deriveTerme = ({ c, p }) => ({ c: c * p, p: p - 1 });
const valeurTermes = (termes, x) => termes.reduce((s, { c, p }) => s + c * x ** p, 0);
const ecrireTermes = (termes) => termes.filter((t) => t.c !== 0).map((t, i) => ecrireTerme(t, i === 0)).join(' ') || '0';

/** « f(x) = … sur ]0 ; +∞[. Dérivée f′(x) ? » → l'expression de f. */
const expressionDe = (q, nom = 'f') => String(q).match(new RegExp(`${nom}\\(x\\) = (.+?)(?: sur \\]0 ; \\+∞\\[)?\\. `))?.[1] ?? null;

/* --------------------------------------------------------- les explications */

/** La dérivée terme à terme : chaque terme, et ce qu'il devient. */
function TermeATerme({ m }) {
  const termes = lireTermes(expressionDe(m.question));
  if (!termes) return null;
  return (
    <div className={`${P}__termes`}>
      {termes.map((t, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`${P}__terme`} style={{ '--n': i }}>
          <span>{ecrireTerme(t, true)}</span>
          <span className={`${P}__fleche`} aria-hidden="true">→</span>
          <strong>{t.p === 0 ? '0' : ecrireTerme(deriveTerme(t), true)}</strong>
        </span>
      ))}
      <p className={`${P}__regle`}>{`f′(x) = ${m.bonne}`}</p>
    </div>
  );
}

/** La tangente : f(a) et f′(a), puis l'équation. */
function Tangente({ m }) {
  const q = String(m.question);
  const termes = lireTermes(expressionDe(q));
  const a = nombreFr(q.match(/abscisse (−?\d+)/)?.[1]);
  if (!termes || a === null) return null;
  const fa = valeurTermes(termes, a);
  const fpa = valeurTermes(termes.map(deriveTerme), a);
  return (
    <div className={`${P}__termes`}>
      <span className={`${P}__terme`}>{`f(${ecrireFr(a)}) = ${ecrireFr(fa)}`}</span>
      <span className={`${P}__terme`} style={{ '--n': 1 }}>{`f′(${ecrireFr(a)}) = ${ecrireFr(fpa)}`}</span>
      <p className={`${P}__regle`}>{`y = f′(a)(x − a) + f(a) = ${ecrireFr(fpa)}(x − ${ecrireFr(a)}) + ${ecrireFr(fa)}, soit ${m.bonne}`.replace(/− −/g, '+ ').replace(/\+ −/g, '− ')}</p>
    </div>
  );
}

/** L'axe de symétrie : 0 et −b/a ont la même image ; l'axe passe au milieu. */
function Axe({ m }) {
  const termes = lireTermes(expressionDe(m.question));
  if (!termes) return null;
  const a = termes.find((t) => t.p === 2)?.c;
  const b = termes.find((t) => t.p === 1)?.c ?? 0;
  if (!a) return null;
  const autre = -b / a;
  return (
    <div className={`${P}__termes`}>
      <span className={`${P}__terme`}>{`f(0) = f(${ecrireFr(autre)}) = ${ecrireFr(valeurTermes(termes, 0))}`}</span>
      <p className={`${P}__regle`}>{`Deux points de même image : l’axe passe au milieu, ${m.bonne}.`}</p>
    </div>
  );
}

/** Les variations : f′, terme à terme ; son signe donne le sens de variation. */
function Variations({ m }) {
  const termes = lireTermes(expressionDe(m.question));
  if (!termes) return null;
  return (
    <div className={`${P}__termes`}>
      <span className={`${P}__terme`}>{`f′(x) = ${ecrireTermes(termes.map(deriveTerme))}`}</span>
      <p className={`${P}__regle`}>{`${REGLES.variations} Ici : ${m.bonne}.`}</p>
    </div>
  );
}

/** Le coût moyen minimal : C′(x) = 0 donne la position, C de cette position donne le minimum. */
function Minimum({ m }) {
  const termes = lireTermes(expressionDe(m.question, 'C'));
  if (!termes) return null;
  const a = termes.find((t) => t.p === 1)?.c;
  const b = termes.find((t) => t.p === -1)?.c;
  if (!(a > 0 && b > 0)) return null;
  const k = Math.sqrt(b / a);
  return (
    <div className={`${P}__termes`}>
      <span className={`${P}__terme`}>{`C′(x) = ${ecrireTermes(termes.map(deriveTerme))}`}</span>
      <span className={`${P}__terme`} style={{ '--n': 1 }}>{`C′(x) = 0 pour x = ${ecrireFr(k)}`}</span>
      <p className={`${P}__regle`}>{`Le minimum est C(${ecrireFr(k)}) = ${m.bonne} : la valeur, pas la position.`}</p>
    </div>
  );
}

const REGLES = {
  associer: 'a > 0 : tournée vers le haut ; a < 0 : vers le bas. a(x − x₁)(x − x₂) coupe l’axe en x₁ et x₂ — attention aux signes.',
  lire: 'a(x − x₁)(x − x₂) : racines x₁ et x₂ ; sommet au milieu des racines ; f a le signe de a à l’extérieur des racines.',
  variations: 'f′ positive : f croissante ; f′ négative : f décroissante. Le signe de f′ se lit avec ses racines.',
};

function Explication({ m }) {
  let calcul = null;
  if (m.consigne === 'derivee') calcul = <TermeATerme m={m} />;
  else if (m.consigne === 'tangente') calcul = <Tangente m={m} />;
  else if (m.consigne === 'axe') calcul = <Axe m={m} />;
  else if (m.consigne === 'minimum') calcul = <Minimum m={m} />;
  else if (m.consigne === 'variations') calcul = <Variations m={m} />;
  return (
    <div className={`${P}__explication`}>
      <svg className={`${P}__eclat`} viewBox="0 0 200 50" aria-hidden="true" focusable="false">
        <path d="M20 10 Q100 80 180 10" className={`${P}__parabole`} />
        {[40, 70, 130, 160].map((x, i) => (
          <path key={x} d={`M${x} 0 V${(10 + 140 * ((x - 20) / 160) * (1 - (x - 20) / 160)).toFixed(1)} L100 30`} className={`${P}__rayon est-final`} style={{ '--n': i }} />
        ))}
        <circle cx="100" cy="30" r="6" className={`${P}__foyer est-allume`} />
      </svg>
      {calcul}
      {!calcul && <p className={`${P}__regle`}>{REGLES[m.consigne] ?? `La réponse : ${m.bonne}.`}</p>}
    </div>
  );
}

export function QuestionParaboles({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Miroir />}
      <div className={`${P}__tablette`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
