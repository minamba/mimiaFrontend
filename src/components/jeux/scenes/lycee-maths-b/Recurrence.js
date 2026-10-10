import { nombreFr, TexteQuestion } from './outils';

/**
 * LE PALAIS DES DOMINOS — « La récurrence » (terminale). La couverture : un
 * garçon en sweat rouge, dans un palais laqué rouge et or, pose le doigt sur
 * le premier d'une longue file de dominos ; un pendule à boule attend de la
 * lancer. C'est l'image même de la récurrence : le premier tombe
 * (l'initialisation), chacun fait tomber le suivant (l'hérédité), donc tous
 * tombent (la conclusion). La scène la reprend :
 *   - LA QUESTION : sur un rouleau de papier, bordé de laque rouge et d'or ;
 *     à côté, la file de dominos, le pendule qui se balance ;
 *   - LES RÉPONSES : des dominos debout (`choix`) — on renverse le bon ;
 *   - APRÈS LA RÉPONSE : la file rejoue la preuve — tout tombe si elle est
 *     juste, rien ne part si l'initialisation cloche, la chaîne casse si
 *     l'hérédité cloche ; pour un calcul, chaque domino porte son terme u₀,
 *     u₁, u₂… et tombe sur le suivant jusqu'au terme demandé.
 */

const P = 'sc-recurrence';
const INDICES = '₀₁₂₃₄₅₆₇₈₉';
const indice = (n) => String(n).split('').map((c) => INDICES[Number(c)]).join('');

/* ---------------------------------------------------------------- le décor */

/** Le pendule à boule, qui pousse le premier domino. */
function Pendule({ lance = true }) {
  return (
    <g className={`${P}__pendule${lance ? ' est-lance' : ''}`}>
      <rect x="6" y="14" width="22" height="6" rx="2" className={`${P}__potence`} />
      <rect x="14" y="14" width="6" height="74" rx="2" className={`${P}__potence`} />
      <g className={`${P}__bras`}>
        <line x1="17" y1="20" x2="40" y2="62" className={`${P}__tige`} />
        <circle cx="40" cy="66" r="8" className={`${P}__boule`} />
      </g>
    </g>
  );
}

function File() {
  return (
    <svg className={`${P}__file`} viewBox="0 0 240 110" aria-hidden="true" focusable="false">
      <rect width="240" height="110" rx="16" className={`${P}__salle`} />
      <path d="M0 30 H240 M60 0 V30 M180 0 V30" className={`${P}__poutres`} />
      <rect x="0" y="88" width="240" height="22" className={`${P}__table`} />
      <Pendule />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`translate(${56 + i * 22} 56)`}>
          <g className={`${P}__domino-deco`} style={{ '--n': i }}>
            <rect x="0" y="0" width="12" height="32" rx="2" className={`${P}__face`} />
            <rect x="0" y="0" width="12" height="32" rx="2" className={`${P}__liseret`} />
            <circle cx="6" cy="8" r="1.6" className={`${P}__point`} />
            <circle cx="6" cy="22" r="1.6" className={`${P}__point`} />
          </g>
        </g>
      ))}
    </svg>
  );
}

/* --------------------------------------------------------- les calculs */

/** « u₀ = 2 et uₙ₊₁ = 3uₙ − 1. » → la suite des termes jusqu'à N ; null si l'écriture est inattendue. */
export function lireRecurrence(question) {
  const q = String(question);
  const u0 = nombreFr(q.match(/^u₀ = (−?\d+) et/)?.[1]);
  const regle = q.match(/uₙ₊₁ = (.+?)\.\n/)?.[1];
  if (u0 === null || !regle) return null;
  let suivant = null;
  const affine = regle.match(/^(−?\d*)uₙ(?: ([+−]) (\d+))?$/);
  const indicee = regle.match(/^uₙ \+ (\d*)n(?: ([+−]) (\d+))?$/);
  if (affine) {
    let p = 1;
    if (affine[1] === '−') p = -1;
    else if (affine[1] !== '') p = nombreFr(affine[1]);
    const q0 = affine[2] ? (affine[2] === '−' ? -1 : 1) * Number(affine[3]) : 0;
    suivant = (u) => p * u + q0;
  } else if (indicee) {
    const c = indicee[1] === '' ? 1 : Number(indicee[1]);
    const e = indicee[2] ? (indicee[2] === '−' ? -1 : 1) * Number(indicee[3]) : 0;
    suivant = (u, n) => u + c * n + e;
  }
  if (!suivant) return null;
  const termes = [u0];
  for (let n = 0; n < 6; n += 1) termes.push(suivant(termes[n], n));
  return termes;
}

/** « uₙ = 2 × 3ⁿ − 1 », « uₙ = 3ⁿ + 2 » → la fonction n ↦ uₙ, ou null. */
export function lireFormule(texte) {
  const lu = String(texte).match(/^uₙ = (?:(−?\d+) × )?(\d+)ⁿ(?: ([+−]) (\d+))?$/);
  if (!lu) return null;
  const m = lu[1] === undefined ? 1 : nombreFr(lu[1]);
  const p = Number(lu[2]);
  const l = lu[3] ? (lu[3] === '−' ? -1 : 1) * Number(lu[4]) : 0;
  return (n) => m * p ** n + l;
}

const ecrire = (x) => (x < 0 ? `−${-x}` : `${x}`);

/* --------------------------------------------------------- l'explication */

/**
 * La file qui rejoue : `tombent` dominos tombent l'un après l'autre (tous si
 * `tombent` vaut leur nombre), les étiquettes sous chacun.
 */
function Chaine({ etiquettes, tombent, cassure = null, lance = true, allume = null }) {
  const n = etiquettes.length;
  const pas = Math.min(36, 200 / n);
  return (
    <svg className={`${P}__chaine`} viewBox="0 0 260 106" aria-hidden="true" focusable="false">
      <rect x="0" y="66" width="260" height="8" rx="3" className={`${P}__table`} />
      <g transform="translate(-4 -2)"><Pendule lance={lance} /></g>
      {etiquettes.map((e, i) => {
        const x = 52 + i * pas + (cassure !== null && i >= cassure ? 14 : 0);
        const tombe = i < tombent;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <g key={i}>
            <g transform={`translate(${x} 30)`}>
              <g className={`${P}__domino${tombe ? ' est-tombe' : ''}${allume === i ? ' est-allume' : ''}`} style={{ '--n': i }}>
                <rect x="0" y="0" width="12" height="36" rx="2" className={`${P}__face`} />
                <rect x="0" y="0" width="12" height="36" rx="2" className={`${P}__liseret`} />
                <circle cx="6" cy="9" r="1.7" className={`${P}__point`} />
                <circle cx="6" cy="26" r="1.7" className={`${P}__point`} />
              </g>
            </g>
            <text x={x + 6} y={i % 2 ? 102 : 88} textAnchor="middle" className={`${P}__etiquette`}>{e}</text>
          </g>
        );
      })}
    </svg>
  );
}

const PREUVES = {
  rien: 'Initialisation juste, hérédité juste : le premier tombe, chacun fait tomber le suivant, tous tombent.',
  initialisation: 'L’initialisation cloche : le premier domino ne tombe pas, rien ne démarre — même si l’hérédité est juste.',
  heredite: 'L’hérédité cloche : un domino ne fait pas tomber le suivant, la chaîne casse.',
};

function Explication({ m }) {
  const rangs = ['P(0)', 'P(1)', 'P(2)', 'P(3)', '…', 'P(n)', 'P(n+1)'];
  let chaine = <Chaine etiquettes={rangs} tombent={rangs.length} />;
  let texte = 'Initialisation : le premier tombe. Hérédité : chacun fait tomber le suivant. Conclusion : tous tombent.';
  if (m.consigne === 'preuve') {
    texte = PREUVES[m.bonne] ?? texte;
    if (m.bonne === 'initialisation') chaine = <Chaine etiquettes={rangs} tombent={0} />;
    if (m.bonne === 'heredite') chaine = <Chaine etiquettes={rangs} tombent={3} cassure={3} />;
  } else if (m.consigne === 'etapes') {
    const allume = { initialisation: 0, heredite: 5, conclusion: null }[m.bonne];
    if (m.bonne === 'initialisation') texte = 'L’initialisation : on vérifie que le premier domino tombe, P(n₀) vraie.';
    if (m.bonne === 'heredite') texte = 'L’hérédité : si un domino tombe, il fait tomber le suivant. P(n) ⇒ P(n + 1).';
    if (m.bonne === 'conclusion') texte = 'La conclusion : le premier tombe et chacun pousse le suivant, donc tous tombent.';
    chaine = <Chaine etiquettes={rangs} tombent={rangs.length} allume={allume ?? null} />;
  } else if (m.consigne === 'propriete') {
    texte = 'P(n) parle d’un seul rang n, sans « pour tout n » : c’est la phrase que chaque domino transmet au suivant.';
  } else if (m.consigne === 'terme') {
    const termes = lireRecurrence(m.question);
    const N = '₀₁₂₃₄₅₆₇₈₉'.indexOf(String(m.question).match(/Combien vaut u(.)/)?.[1] ?? '');
    if (termes && N >= 0 && ecrire(termes[N]) === m.bonne) {
      const vus = termes.slice(0, N + 1);
      chaine = <Chaine etiquettes={vus.map((u, i) => `u${indice(i)}=${ecrire(u)}`)} tombent={vus.length} allume={N} />;
      texte = `On applique la relation rang après rang, de u₀ jusqu’à u${indice(N)} = ${m.bonne}.`;
    }
  } else if (m.consigne === 'conjecture') {
    const termes = lireRecurrence(m.question);
    const formule = lireFormule(m.bonne);
    if (termes && formule && [0, 1, 2, 3].every((n) => formule(n) === termes[n])) {
      const vus = termes.slice(0, 4);
      chaine = <Chaine etiquettes={vus.map((u, i) => `u${indice(i)}=${ecrire(u)}`)} tombent={4} />;
      texte = `${m.bonne} redonne u₀, u₁, u₂ et u₃ ✔ — reste à le démontrer par récurrence.`;
    }
  }
  return (
    <div className={`${P}__explication`}>
      {chaine}
      <p className={`${P}__regle`}>{texte}</p>
    </div>
  );
}

export function QuestionRecurrence({ m, termine }) {
  return (
    <div className={P}>
      {termine ? <Explication m={m} /> : <File />}
      <div className={`${P}__rouleau`}>
        <TexteQuestion m={m} classe={`${P}__texte`} />
      </div>
    </div>
  );
}

/** Les réponses : des dominos debout ; on renverse le bon. */
export function DominosRecurrence({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__dominos`} role="group" aria-label="Choisis ta réponse">
      {choix.map(({ cle, libelle }, i) => {
        const fausse = fautes.includes(cle);
        return (
          <button
            key={cle}
            type="button"
            className={`${P}__domino-reponse${fausse ? ' est-fausse' : ''}`}
            style={{ '--i': i }}
            onClick={() => choisir(cle)}
            disabled={fausse}
          >
            <span className={`${P}__points`} aria-hidden="true">
              {Array.from({ length: i + 1 }, (_, k) => <span key={k} />)}
            </span>
            <span className={`${P}__libelle`}>{libelle}</span>
          </button>
        );
      })}
    </div>
  );
}
