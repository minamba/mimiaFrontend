import { ecrireFr, nombreFr, TexteQuestion } from './outils';

/**
 * LE CHANTIER DANS LE CIEL — « La géométrie dans l'espace » (terminale). La
 * couverture : un garçon accroupi sur une passerelle d'acier, au-dessus des
 * nuages ; des plans de verre se croisent, et trois flèches lumineuses
 * dessinent le repère. La scène la reprend :
 *   - LA QUESTION : sur un écran de verre sombre, bordé de lumière ; à côté,
 *     le repère (x, y, z) qui brille et deux plans de verre qui se croisent ;
 *   - LES RÉPONSES : des éclats de verre (`objets`) ;
 *   - APRÈS LA RÉPONSE : la situation dessinée en perspective (deux droites
 *     parallèles, sécantes ou non coplanaires ; un plan et son vecteur normal ;
 *     deux vecteurs à angle droit ; trois vecteurs dans un même plan ou non),
 *     et le calcul de la question refait avec ses nombres : le même t pour
 *     les trois coordonnées, le point qui annule l'équation, le produit
 *     scalaire nul. Un calcul qui ne retombe pas juste n'est pas montré.
 */

const P = 'sc-geometrie-espace';

/* ---------------------------------------------------------------- le décor */

/** Le repère de l'espace et ses deux plans de verre. */
function Repere() {
  return (
    <svg className={`${P}__repere`} viewBox="0 0 220 160" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sc-esp-ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d7fd9" />
          <stop offset="1" stopColor="#c9e6ff" />
        </linearGradient>
      </defs>
      <rect width="220" height="160" rx="16" fill="url(#sc-esp-ciel)" />
      {/* Les poutres d'acier et un îlot qui flotte. */}
      <path d="M0 30 H220 M0 38 H220 M30 0 V160 M190 0 V160" className={`${P}__poutre`} />
      <path className={`${P}__ilot`} d="M168 112 q14 -10 30 0 q-6 14 -15 18 q-9 -4 -15 -18 Z" fill="#6f8f5a" />
      <path className={`${P}__nuage`} d="M14 132 q10 -12 22 -3 q12 -8 20 4 q10 0 6 9 h-50 q-8 -4 2 -10 Z" fill="#fff" opacity="0.85" />
      {/* Deux plans de verre qui se croisent. */}
      <path className={`${P}__plan est-sol`} d="M30 110 L120 86 L196 110 L106 136 Z" />
      <path className={`${P}__plan est-mur`} d="M70 40 L150 26 L150 104 L70 120 Z" />
      {/* Le repère : trois flèches qui brillent. */}
      <g className={`${P}__axes`}>
        <line x1="106" y1="112" x2="106" y2="34" />
        <line x1="106" y1="112" x2="180" y2="128" />
        <line x1="106" y1="112" x2="46" y2="134" />
        <path d="M101 40 L106 30 L111 40 M172 122 L184 129 L172 133 M52 128 L42 136 L55 137" />
      </g>
      <text x="113" y="38" className={`${P}__lettre`}>z</text>
      <text x="182" y="122" className={`${P}__lettre`}>y</text>
      <text x="38" y="128" className={`${P}__lettre`}>x</text>
      <circle cx="106" cy="112" r="5" className={`${P}__origine`} />
    </svg>
  );
}

/* --------------------------------------------------------- les lectures */

/** « (1 ; −2 ; 3) » → [1, −2, 3] ; une lettre reste une lettre. */
export function triplets(texte) {
  return [...String(texte).matchAll(/\(([^()]+?) ; ([^()]+?) ; ([^()]+?)\)/g)]
    .map((t) => t.slice(1, 4).map((c) => (nombreFr(c) ?? c.trim())));
}

/** « 2x − y + 3z − 4 = 0 » → [2, −1, 3, −4], ou null. */
export function lirePlan(texte) {
  const lu = String(texte).match(/P : (.+) = 0/);
  if (!lu) return null;
  const coef = [0, 0, 0, 0];
  const termes = lu[1].replace(/ ([+−]) /g, ' $1').split(' ');
  for (const terme of termes) {
    const t = terme.match(/^([+−]?)(\d*)([xyz]?)$/);
    if (!t || (t[2] === '' && t[3] === '')) return null;
    const signe = t[1] === '−' ? -1 : 1;
    const valeur = t[2] === '' ? 1 : Number(t[2]);
    coef[t[3] ? 'xyz'.indexOf(t[3]) : 3] = signe * valeur;
  }
  return coef;
}

/** « 1 + 2t », « −3 − t », « 4t », « 5 » → [constante, coefficient de t], ou null. */
export function lireAffine(texte, p = 't') {
  const s = String(texte).trim();
  const motif = new RegExp(`^(?:(−?\\d+)(?: ([+−]) (\\d*)${p})?|(−?)(\\d*)${p})$`);
  const lu = s.match(motif);
  if (!lu) return null;
  if (lu[1] !== undefined) {
    const c = nombreFr(lu[1]);
    if (lu[2] === undefined) return [c, 0];
    return [c, (lu[2] === '−' ? -1 : 1) * (lu[3] === '' ? 1 : Number(lu[3]))];
  }
  return [0, (lu[4] === '−' ? -1 : 1) * (lu[5] === '' ? 1 : Number(lu[5]))];
}

const par = (x) => (x < 0 ? `(${ecrireFr(x)})` : ecrireFr(x));

/* --------------------------------------------------------- les dessins */

/** Deux droites en perspective : parallèles, sécantes, ou l'une au-dessus de l'autre. */
function DeuxDroites({ cas }) {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 240 120" aria-hidden="true" focusable="false">
      <path d="M10 92 L120 66 L230 92 L120 118 Z" className={`${P}__plan est-sol`} />
      {cas === 'non-coplanaires' && <path d="M40 18 L200 18 L200 70 L40 70 Z" className={`${P}__plan est-haut`} />}
      {cas === 'paralleles' && (
        <>
          <line x1="30" y1="96" x2="200" y2="74" className={`${P}__droite est-d`} pathLength="1" />
          <line x1="50" y1="108" x2="220" y2="86" className={`${P}__droite est-dp`} pathLength="1" />
        </>
      )}
      {cas === 'secantes' && (
        <>
          <line x1="30" y1="96" x2="210" y2="80" className={`${P}__droite est-d`} pathLength="1" />
          <line x1="80" y1="70" x2="170" y2="114" className={`${P}__droite est-dp`} pathLength="1" />
          <circle cx="124" cy="88" r="6" className={`${P}__impact`} />
        </>
      )}
      {cas === 'non-coplanaires' && (
        <>
          <line x1="30" y1="96" x2="210" y2="80" className={`${P}__droite est-d`} pathLength="1" />
          <line x1="70" y1="30" x2="190" y2="58" className={`${P}__droite est-dp`} pathLength="1" />
          <line x1="124" y1="44" x2="124" y2="86" className={`${P}__aplomb`} />
        </>
      )}
    </svg>
  );
}

/** Un plan de verre et son vecteur normal, dressé à angle droit. */
function PlanEtNormale({ point = false }) {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 240 120" aria-hidden="true" focusable="false">
      <path d="M20 92 L130 64 L226 90 L116 118 Z" className={`${P}__plan est-sol`} />
      <line x1="122" y1="91" x2="122" y2="18" className={`${P}__normale`} pathLength="1" />
      <path d="M116 26 L122 14 L128 26" className={`${P}__pointe`} />
      <path d="M122 84 h8 v-7" className={`${P}__angle-droit`} />
      <text x="130" y="22" className={`${P}__lettre est-sombre`}>n</text>
      {point && <circle cx="80" cy="96" r="6" className={`${P}__impact est-pose`} />}
    </svg>
  );
}

function AngleDroit() {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 240 120" aria-hidden="true" focusable="false">
      <line x1="70" y1="100" x2="200" y2="100" className={`${P}__vecteur est-u`} pathLength="1" />
      <line x1="70" y1="100" x2="70" y2="16" className={`${P}__vecteur est-v`} pathLength="1" />
      <path d="M192 94 L204 100 L192 106 M64 24 L70 12 L76 24" className={`${P}__pointe`} />
      <path d="M70 88 h12 v12" className={`${P}__angle-droit est-flash`} />
      <text x="206" y="96" className={`${P}__lettre est-sombre`}>u</text>
      <text x="78" y="20" className={`${P}__lettre est-sombre`}>v</text>
    </svg>
  );
}

function TroisVecteurs({ dansLePlan }) {
  return (
    <svg className={`${P}__dessin`} viewBox="0 0 240 120" aria-hidden="true" focusable="false">
      <path d="M14 96 L120 62 L230 92 L124 120 Z" className={`${P}__plan est-sol`} />
      <line x1="60" y1="98" x2="150" y2="84" className={`${P}__vecteur est-u`} pathLength="1" />
      <line x1="60" y1="98" x2="104" y2="72" className={`${P}__vecteur est-v`} pathLength="1" />
      {dansLePlan
        ? <line x1="60" y1="98" x2="190" y2="96" className={`${P}__vecteur est-w`} pathLength="1" />
        : <line x1="60" y1="98" x2="150" y2="16" className={`${P}__vecteur est-w est-sort`} pathLength="1" />}
      <text x="152" y="80" className={`${P}__lettre est-sombre`}>u</text>
      <text x="96" y="66" className={`${P}__lettre est-sombre`}>v</text>
      <text x={dansLePlan ? 194 : 154} y={dansLePlan ? 92 : 16} className={`${P}__lettre est-sombre`}>w</text>
    </svg>
  );
}

/* --------------------------------------------------------- les calculs */

/** Le paramètre t de chaque coordonnée : le même partout, M est sur d. */
function Parametres({ m }) {
  const q = String(m.question);
  const lu = q.match(/x = (.+?) ; y = (.+?) ; z = (.+?) \(t ∈ ℝ\)/);
  const M = triplets(q.split('\n')[1] ?? '')[0];
  if (!lu || !M || M.some((c) => typeof c !== 'number')) return null;
  const formes = lu.slice(1, 4).map((s) => lireAffine(s));
  if (formes.some((f) => f === null)) return null;
  return (
    <ul className={`${P}__calculs`}>
      {formes.map(([c, k], i) => {
        const t = k === 0 ? null : (M[i] - c) / k;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} style={{ '--n': i }}>
            {`${'xyz'[i]} : ${ecrireFr(M[i])} = ${lu[i + 1]} donne t = ${t === null ? '—' : ecrireFr(t)}`}
          </li>
        );
      })}
    </ul>
  );
}

/** Le point de la réponse remplacé dans l'équation du plan : on trouve 0. */
function PointDansPlan({ m }) {
  const plan = lirePlan(m.question);
  const M = triplets(m.bonne)[0];
  if (!plan || !M || M.some((c) => typeof c !== 'number')) return null;
  const total = plan[0] * M[0] + plan[1] * M[1] + plan[2] * M[2] + plan[3];
  if (total !== 0) return null;
  return (
    <ul className={`${P}__calculs`}>
      <li>{`${plan[0]} × ${par(M[0])} + ${par(plan[1])} × ${par(M[1])} + ${par(plan[2])} × ${par(M[2])} + ${par(plan[3])} = 0 ✔`}</li>
    </ul>
  );
}

/** Le produit scalaire, la valeur de m remplacée : il est nul. */
function ProduitNul({ m }) {
  const [u, v] = triplets(m.question);
  const mv = nombreFr(String(m.bonne).replace('m = ', ''));
  if (!u || !v || mv === null || v.some((c) => typeof c !== 'number')) return null;
  const uu = u.map((c) => (c === 'm' ? mv : c));
  if (uu.some((c) => typeof c !== 'number')) return null;
  const total = uu.reduce((s, c, i) => s + c * v[i], 0);
  if (total !== 0) return null;
  return (
    <ul className={`${P}__calculs`}>
      <li>{`u · v = ${uu.map((c, i) => `${par(c)} × ${par(v[i])}`).join(' + ')} = 0 ✔`}</li>
    </ul>
  );
}

/** Le d de l'équation, avec le point A et le vecteur normal n. */
function CalculDeD({ m }) {
  const [A, n] = triplets(m.question);
  if (!A || !n || [...A, ...n].some((c) => typeof c !== 'number')) return null;
  const d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]);
  return (
    <ul className={`${P}__calculs`}>
      <li>{`d = −(${n[0]} × ${par(A[0])} + ${par(n[1])} × ${par(A[1])} + ${par(n[2])} × ${par(A[2])}) = ${ecrireFr(d)}`}</li>
    </ul>
  );
}

const TEXTES = {
  paralleles: 'Les vecteurs directeurs sont colinéaires : les droites sont parallèles.',
  secantes: 'Directeurs non colinéaires, et le système a une solution : les droites se coupent.',
  'non-coplanaires': 'Directeurs non colinéaires, mais aucun point commun : elles ne sont dans aucun plan commun.',
};

function Explication({ m }) {
  let dessin = null;
  let calcul = null;
  let texte = null;
  switch (m.consigne) {
    case 'positions':
      dessin = <DeuxDroites cas={m.bonne} />;
      texte = TEXTES[m.bonne];
      break;
    case 'vecteur-normal': {
      dessin = <PlanEtNormale />;
      const plan = lirePlan(m.question);
      texte = plan
        ? `Les coefficients de x, y et z donnent un vecteur normal : n(${plan.slice(0, 3).map(ecrireFr).join(' ; ')}), ou un de ses multiples.`
        : 'Les coefficients de x, y et z donnent un vecteur normal, ou un de ses multiples.';
      break;
    }
    case 'equation-plan':
      dessin = <PlanEtNormale point />;
      calcul = <CalculDeD m={m} />;
      texte = 'n(a ; b ; c) donne ax + by + cz + d = 0, et A, qui est dans le plan, donne d.';
      break;
    case 'point-plan':
      dessin = <PlanEtNormale point />;
      calcul = <PointDansPlan m={m} />;
      texte = 'Un point est dans le plan quand ses coordonnées vérifient l’équation.';
      break;
    case 'orthogonal':
      dessin = <AngleDroit />;
      calcul = <ProduitNul m={m} />;
      texte = 'Orthogonaux : le produit scalaire, sur les trois coordonnées, est nul.';
      break;
    case 'point-droite':
      calcul = <Parametres m={m} />;
      texte = String(m.bonne).startsWith('Aucune')
        ? 'Les trois coordonnées ne donnent pas le même t : M n’est pas sur d.'
        : 'Le même t pour les trois coordonnées : M est sur d.';
      break;
    case 'coplanaires': {
      const oui = String(m.bonne).startsWith('Oui');
      dessin = <TroisVecteurs dansLePlan={oui} />;
      texte = oui
        ? `${String(m.bonne).replace('Oui : ', '')} : w est une combinaison de u et v, les trois sont dans un même plan.`
        : 'Aucune combinaison αu + βv ne redonne w sur les trois coordonnées : w sort du plan.';
      break;
    }
    default:
      texte = `La réponse : ${m.bonne}.`;
  }
  return (
    <div className={`${P}__explication`}>
      {dessin}
      {calcul}
      {texte && <p className={`${P}__regle`}>{texte}</p>}
    </div>
  );
}

export function QuestionEspace({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <Repere />}
      <div className={`${P}__ecran`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}
