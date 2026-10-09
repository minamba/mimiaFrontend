/**
 * LA RÉCURRENCE — terminale générale, Nora (mathématiques).
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (classe TERMINALE) : MATH_TLE_RECURRENCE
 *
 * CINQ SORTES DE MANCHES (huit par partie, mélangées) :
 *   - LA PREUVE QUI CLOCHE (trois par partie) : une « preuve » en quelques
 *     lignes, écrite à la main et vérifiée ligne à ligne. Qu'est-ce qui
 *     cloche : l'initialisation (absente ou fausse), l'hérédité (calcul faux,
 *     inégalité retournée, hypothèse circulaire, inégalité vraie seulement plus
 *     loin), ou rien ? Chaque preuve a sa phrase, qui dit ce qui cloche (ou
 *     pourquoi tout tient) ;
 *   - LES TROIS ÉTAPES (banque) : le rôle de chaque étape, ce qu'on suppose
 *     dans l'hérédité, ce qu'on conclut quand une étape manque. LES PIÈGES :
 *     supposer P(n) « pour tout n », croire qu'une initialisation fausse
 *     prouve le contraire ;
 *   - LA BONNE PROPRIÉTÉ P(n) (banque). LES PIÈGES : « pour tout n » dans
 *     P(n), une propriété qui ne dépend pas de n, « positive » pour
 *     « croissante » ;
 *   - CALCULER UN TERME (deux par partie) : uₙ₊₁ = a·uₙ + b, ou
 *     uₙ₊₁ = uₙ + c·n + e. LES PIÈGES : se décaler d'un rang, appliquer
 *     a·(uₙ + b), mettre n + 1 à la place de n ;
 *   - CONJECTURER une formule explicite (uₙ = m × pⁿ + ℓ) après avoir calculé
 *     les premiers termes. LES PIÈGES : une formule qui ne colle qu'aux deux
 *     premiers termes, un exposant décalé, une suite crue géométrique.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'recurrence', titre: 'La récurrence', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'La récurrence',
    accroche: 'Initialiser, hériter, conclure.',
    competences: ['MATH_TLE_RECURRENCE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const ecrire = (x) => (x < 0 ? `−${-x}` : `${x}`);
const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/* ------------------------------------------------- la preuve qui cloche */

const VERDICTS = {
  initialisation: 'L’initialisation',
  heredite: 'L’hérédité',
  rien: 'Rien : elle est juste',
};

/**
 * [la preuve, ce qui cloche, la phrase qui l'explique]. Vérifiées une à une :
 *   3ⁿ pair : 3⁰ = 1 est impair, l'hérédité seule est juste ;
 *   4ⁿ + 1 : 4(4ⁿ + 1) − 3 = 4ⁿ⁺¹ + 1, mais 4⁰ + 1 = 2 ;
 *   somme + 1 : l'hérédité tient, mais 1 × 2 ÷ 2 + 1 = 2 ≠ 1 ;
 *   uₙ = 2ⁿ − 1 : 2(2ⁿ − 1) + 1 = 2ⁿ⁺¹ − 1, mais 2⁰ − 1 = 0 ≠ u₀ = 1 ;
 *   3 − uₙ : de uₙ ≤ 2 on tire 3 − uₙ ≥ 1, pas ≤ 1 ;
 *   2ⁿ > n² : 2n² ≥ (n + 1)² est faux pour n = 1 et 2 (et P(2) est fausse) ;
 *   7ⁿ − 1 : 7(7ⁿ − 1) = 7ⁿ⁺¹ − 7, pas 7ⁿ⁺¹ − 1 ;
 *   5ⁿ − 1 : l'hérédité suppose ce qu'elle doit démontrer ;
 *   10ⁿ − 1 : 10(10ⁿ − 1) + 9 = 10ⁿ⁺¹ − 1 = 9(10k + 1) ;
 *   2ⁿ ≥ n + 1 : 2n + 2 ≥ n + 2 pour n ≥ 0 ;
 *   √(uₙ + 2) : √ est croissante, √2 ≤ uₙ₊₁ ≤ √4 = 2 ;
 *   uₙ = 2ⁿ⁺¹ − 1 : 2(2ⁿ⁺¹ − 1) + 1 = 2ⁿ⁺² − 1, et u₀ = 1 = 2¹ − 1 ;
 *   n² + n : (n + 1)² + (n + 1) = (n² + n) + 2(n + 1).
 */
export const PREUVES = [
  ['P(n) : 3ⁿ est pair.\nHérédité : si 3ⁿ est pair, alors 3ⁿ⁺¹ = 3 × 3ⁿ est pair.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'initialisation', 'preuve-sans-initialisation'],
  ['P(n) : 4ⁿ + 1 est divisible par 3.\nHérédité : si 4ⁿ + 1 = 3k, alors 4ⁿ⁺¹ + 1 = 4(4ⁿ + 1) − 3 = 3(4k − 1).\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'initialisation', 'preuve-sans-initialisation'],
  ['P(n) : 1 + 2 + … + n = n(n + 1)/2 + 1, pour n ≥ 1.\nInitialisation : pour n = 1, on a 1 = 1 × 2/2 + 1.\nHérédité : si P(n) est vraie, en ajoutant n + 1, on obtient (n + 1)(n + 2)/2 + 1.\nDonc P(n) est vraie pour tout n ≥ 1.',
    'initialisation', 'initialisation-a-recalculer'],
  ['u₀ = 1 et uₙ₊₁ = 2uₙ + 1.\nP(n) : uₙ = 2ⁿ − 1.\nInitialisation : u₀ = 1 = 2⁰ − 1.\nHérédité : si uₙ = 2ⁿ − 1, alors uₙ₊₁ = 2(2ⁿ − 1) + 1 = 2ⁿ⁺¹ − 1.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'initialisation', 'initialisation-a-recalculer'],
  ['u₀ = 1 et uₙ₊₁ = 3 − uₙ.\nP(n) : uₙ ≤ 2.\nInitialisation : u₀ = 1 ≤ 2.\nHérédité : si uₙ ≤ 2, alors uₙ₊₁ = 3 − uₙ ≤ 3 − 2 = 1 ≤ 2.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'heredite', 'inegalite-retournee'],
  ['P(n) : 2ⁿ > n², pour n ≥ 1.\nInitialisation : 2¹ = 2 > 1 = 1².\nHérédité : si 2ⁿ > n², alors 2ⁿ⁺¹ > 2n² ≥ (n + 1)².\nDonc P(n) est vraie pour tout n ≥ 1.',
    'heredite', 'heredite-pour-tout-rang'],
  ['P(n) : 7ⁿ − 1 est divisible par 6.\nInitialisation : 7⁰ − 1 = 0 = 6 × 0.\nHérédité : si 7ⁿ − 1 = 6k, alors 7ⁿ⁺¹ − 1 = 7(7ⁿ − 1) = 6 × 7k.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'heredite', 'heredite-calcul-faux'],
  ['P(n) : 5ⁿ − 1 est divisible par 4.\nInitialisation : 5⁰ − 1 = 0 = 4 × 0.\nHérédité : supposons 5ⁿ⁺¹ − 1 divisible par 4 ; alors 5ⁿ⁺¹ − 1 est bien divisible par 4.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'heredite', 'heredite-circulaire'],
  ['P(n) : 10ⁿ − 1 est divisible par 9.\nInitialisation : 10⁰ − 1 = 0 = 9 × 0.\nHérédité : si 10ⁿ − 1 = 9k, alors 10ⁿ⁺¹ − 1 = 10(10ⁿ − 1) + 9 = 9(10k + 1).\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'rien', 'preuve-complete'],
  ['P(n) : 2ⁿ ≥ n + 1.\nInitialisation : 2⁰ = 1 ≥ 0 + 1.\nHérédité : si 2ⁿ ≥ n + 1, alors 2ⁿ⁺¹ ≥ 2n + 2 ≥ n + 2.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'rien', 'preuve-complete'],
  ['u₀ = 0 et uₙ₊₁ = √(uₙ + 2).\nP(n) : 0 ≤ uₙ ≤ 2.\nInitialisation : 0 ≤ u₀ = 0 ≤ 2.\nHérédité : si 0 ≤ uₙ ≤ 2, alors 2 ≤ uₙ + 2 ≤ 4 ; la racine carrée est croissante, donc √2 ≤ uₙ₊₁ ≤ 2, d’où 0 ≤ uₙ₊₁ ≤ 2.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'rien', 'preuve-complete'],
  ['u₀ = 1 et uₙ₊₁ = 2uₙ + 1.\nP(n) : uₙ = 2ⁿ⁺¹ − 1.\nInitialisation : u₀ = 1 = 2¹ − 1.\nHérédité : si uₙ = 2ⁿ⁺¹ − 1, alors uₙ₊₁ = 2(2ⁿ⁺¹ − 1) + 1 = 2ⁿ⁺² − 1.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'rien', 'preuve-complete'],
  ['P(n) : n² + n est pair.\nInitialisation : 0² + 0 = 0, qui est pair.\nHérédité : si n² + n est pair, alors (n + 1)² + (n + 1) = (n² + n) + 2(n + 1) est pair.\nDonc P(n) est vraie pour tout n ∈ ℕ.',
    'rien', 'preuve-complete'],
];

function preuve([texte, cloche, phrase]) {
  const pieges = {};
  Object.keys(VERDICTS).forEach((k) => { if (k !== cloche) pieges[k] = phrase; });
  return {
    consigne: 'preuve',
    question: `${texte}\nQu’est-ce qui cloche ?`,
    choix: Object.entries(VERDICTS).map(([cle, libelle]) => ({ cle, libelle })),
    bonne: cloche,
    pieges,
    aide: 'preuve-regle',
  };
}

/* ------------------------------------------------------- les trois étapes */

const ETAPES = {
  initialisation: 'L’initialisation',
  heredite: 'L’hérédité',
  conclusion: 'La conclusion',
};
const ROLE = { initialisation: 'role-initialisation', heredite: 'role-heredite', conclusion: 'role-conclusion' };

/**
 * [question, l'étape] — on choisit parmi les trois étapes ; ou [question, la
 * bonne réponse, [[une mauvaise réponse, sa phrase] × 2]].
 */
export const QUESTIONS_ETAPES = [
  ['Dans quelle étape vérifie-t-on que la propriété est vraie au premier rang n₀ ?', 'initialisation'],
  ['Dans quelle étape suppose-t-on P(n) vraie pour un entier n ≥ n₀ fixé, pour en déduire P(n + 1) ?', 'heredite'],
  ['Quelle étape dit : « P est vraie au rang n₀ et héréditaire, donc vraie pour tout n ≥ n₀ » ?', 'conclusion'],
  ['Dans l’hérédité, que suppose-t-on ?', 'P(n) vraie pour un n ≥ n₀ fixé', [
    ['P(n) vraie pour tout n ≥ n₀', 'hypothese-pour-tout'],
    ['P(n + 1) vraie', 'hypothese-pas-conclusion'],
  ]],
  ['Que démontre-t-on dans l’hérédité ?', 'Si P(n) est vraie, alors P(n + 1) l’est', [
    ['P(n + 1) est vraie, sans condition', 'heredite-implication'],
    ['P(n) est vraie pour tout n ≥ n₀', 'heredite-pas-conclusion'],
  ]],
  ['L’hérédité est démontrée, mais P(n₀) est fausse. Que conclure ?', 'Rien : la récurrence ne démarre pas', [
    ['P(n) est vraie pour tout n ≥ n₀', 'initialisation-indispensable'],
    ['P(n) est fausse pour tout n ≥ n₀', 'rien-a-conclure'],
  ]],
  ['P(n₀) est vraie, mais l’hérédité ne se démontre pas. Que conclure ?', 'Seulement que P(n₀) est vraie', [
    ['P(n) est vraie pour tout n ≥ n₀', 'heredite-indispensable'],
    ['P(n) est fausse pour tout n > n₀', 'rien-a-conclure'],
  ]],
];

function etape([question, bonne, autres], t) {
  if (!autres) {
    return {
      consigne: 'etapes',
      question,
      choix: Object.entries(ETAPES).map(([cle, libelle]) => ({ cle, libelle })),
      bonne,
      pieges: Object.fromEntries(Object.keys(ETAPES).filter((k) => k !== bonne).map((k) => [k, ROLE[k]])),
    };
  }
  return {
    consigne: 'etapes',
    question,
    choix: cartes(t.melanger([bonne, ...autres.map(([l]) => l)])),
    bonne,
    pieges: Object.fromEntries(autres),
  };
}

/* ---------------------------------------------------- la bonne propriété */

/** [le but, la bonne P(n), [[une mauvaise P(n), sa phrase] × 2]]. */
export const PROPRIETES = [
  ['Montrer que uₙ = 2ⁿ + 1 pour tout n ∈ ℕ.', 'P(n) : uₙ = 2ⁿ + 1', [
    ['P(n) : pour tout n, uₙ = 2ⁿ + 1', 'pour-tout-dans-p'],
    ['P(n) : u₀ = 2', 'propriete-depend-de-n'],
  ]],
  ['Montrer que la suite (uₙ) est croissante.', 'P(n) : uₙ ≤ uₙ₊₁', [
    ['P(n) : uₙ ≥ 0', 'signe-pas-variation'],
    ['P(n) : uₙ ≥ u₀', 'termes-consecutifs'],
  ]],
  ['Montrer que la suite (uₙ) est décroissante.', 'P(n) : uₙ₊₁ ≤ uₙ', [
    ['P(n) : uₙ ≤ 0', 'signe-pas-variation'],
    ['P(n) : uₙ ≤ u₀', 'termes-consecutifs'],
  ]],
  ['Montrer que uₙ ≤ 3 pour tout n ∈ ℕ.', 'P(n) : uₙ ≤ 3', [
    ['P(n) : pour tout n, uₙ ≤ 3', 'pour-tout-dans-p'],
    ['P(n) : uₙ₊₁ ≤ uₙ', 'majoree-pas-decroissante'],
  ]],
  ['Montrer que 0 < uₙ < 1 pour tout n ∈ ℕ.', 'P(n) : 0 < uₙ < 1', [
    ['P(n) : 0 < u₀ < 1', 'propriete-depend-de-n'],
    ['P(n) : uₙ < uₙ₊₁', 'encadrement-pas-variation'],
  ]],
  ['Montrer que 1 + 3 + … + (2n − 1) = n² pour tout n ≥ 1.', 'P(n) : 1 + 3 + … + (2n − 1) = n²', [
    ['P(n) : 2n − 1 = n²', 'somme-entiere'],
    ['P(n) : pour tout n ≥ 1, 1 + 3 + … + (2n − 1) = n²', 'pour-tout-dans-p'],
  ]],
];

function propriete([but, bonne, autres], t) {
  return {
    consigne: 'propriete',
    question: `${but}\nQuelle propriété P(n) démontrer par récurrence ?`,
    choix: cartes(t.melanger([bonne, ...autres.map(([l]) => l)])),
    bonne,
    pieges: Object.fromEntries(autres),
  };
}

/* ------------------------------------------------------- calculer un terme */

/** Les termes u₀ … u_N d'une suite récurrente. */
export function termes(u0, suivant, N) {
  const u = [u0];
  for (let n = 0; n < N; n += 1) u.push(suivant(u[n], n));
  return u;
}

const INDICES = '₀₁₂₃₄₅₆₇₈₉';
const indice = (n) => String(n).split('').map((c) => INDICES[Number(c)]).join('');

/** « 3uₙ − 1 », « −uₙ + 4 ». */
function affine(p, q) {
  let s;
  if (p === 1) s = 'uₙ';
  else if (p === -1) s = '−uₙ';
  else s = `${ecrire(p)}uₙ`;
  if (q === 0) return s;
  return `${s} ${q < 0 ? '−' : '+'} ${Math.abs(q)}`;
}

function manche(t, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = ecrire(bonne);
  const valides = t.melanger(pieges).filter(([v]) => v !== null && v !== bonne);
  const liste = troisChoix(b, valides.map(([v]) => ecrire(v)), (k) => ecrire(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = ecrire(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  return {
    consigne, question, choix: cartes(t.melanger(liste)), bonne: b, pieges: table,
  };
}

function terme(sorte, t) {
  const N = t.entre(3, 4);
  const u0 = t.entre(-3, 5);
  if (sorte === 'affine') {
    const p = t.au([2, 3, -2]);
    let q;
    do {
      q = t.entre(1, 5) * t.au([1, -1]);
    } while (u0 * (1 - p) === q); // u₀ point fixe : la suite serait constante.
    const u = termes(u0, (x) => p * x + q, N + 1);
    const priorite = termes(u0, (x) => p * (x + q), N);
    return manche(t, {
      consigne: 'terme',
      question: `u₀ = ${ecrire(u0)} et uₙ₊₁ = ${affine(p, q)}.\nCombien vaut u${indice(N)} ?`,
      bonne: u[N],
      pieges: [[u[N - 1], 'compter-les-rangs'], [u[N + 1], 'compter-les-rangs'], [priorite[N], 'priorite-recurrence']],
      voisin: (j) => u[N] + j,
    });
  }
  const c = t.entre(1, 3);
  const e = t.entre(-3, 3);
  const pas = (n) => c * n + e;
  const u = termes(u0, (x, n) => x + pas(n), N + 1);
  const decale = termes(u0, (x, n) => x + pas(n + 1), N);
  const ajout = `${c === 1 ? '' : c}n${e === 0 ? '' : ` ${e < 0 ? '−' : '+'} ${Math.abs(e)}`}`;
  return manche(t, {
    consigne: 'terme',
    question: `u₀ = ${ecrire(u0)} et uₙ₊₁ = uₙ + ${ajout}.\nCombien vaut u${indice(N)} ?`,
    bonne: u[N],
    pieges: [[decale[N], 'indice-dans-la-formule'], [u[N - 1], 'compter-les-rangs'], [u[N + 1], 'compter-les-rangs']],
    voisin: (j) => u[N] + j,
  });
}

/* -------------------------------------------------------------- conjecturer */

const EXPOSANTS = { n: 'ⁿ', 'n+1': 'ⁿ⁺¹' };

/** « uₙ = 2 × 3ⁿ − 1 », « uₙ = 3ⁿ⁺¹ + 2 ». */
export function geometrique(m, p, exposant, l) {
  let s;
  if (m === 1) s = `${p}${EXPOSANTS[exposant]}`;
  else s = `${ecrire(m)} × ${p}${EXPOSANTS[exposant]}`;
  if (l !== 0) s += ` ${l < 0 ? '−' : '+'} ${Math.abs(l)}`;
  return `uₙ = ${s}`;
}

/** « uₙ = 4n + 1 ». */
export function arithmetique(r, a) {
  let s = `${r === 1 ? '' : r}n`;
  if (a !== 0) s += ` ${a < 0 ? '−' : '+'} ${Math.abs(a)}`;
  return `uₙ = ${s}`;
}

function conjecture(t) {
  const p = t.au([2, 3]);
  // m ≠ p : « 2 × 2ⁿ » s'écrirait mieux 2ⁿ⁺¹.
  const m = t.au(p === 2 ? [1, 3] : [1, 2]);
  const l = t.entre(-3, 3);
  const u0 = m + l;
  const q = l * (1 - p);
  const r = m * (p - 1);
  const bonne = geometrique(m, p, 'n', l);
  const pieges = [
    [arithmetique(r, u0), 'conjecture-trois-termes'],
    [geometrique(m, p, 'n+1', l), 'verifier-premier-terme'],
    [u0 !== 0 && l !== 0 ? geometrique(u0, p, 'n', 0) : null, 'pas-geometrique'],
  ];
  const valides = t.melanger(pieges).filter(([v]) => v !== null && v !== bonne);
  const liste = troisChoix(bonne, valides.map(([v]) => v), (j) => geometrique(m, p, 'n', l + j));
  const table = {};
  valides.forEach(([v, phrase]) => {
    if (liste.includes(v) && !(v in table)) table[v] = phrase;
  });
  return {
    consigne: 'conjecture',
    question: `u₀ = ${ecrire(u0)} et uₙ₊₁ = ${affine(p, q)}.\nCalcule u₁, u₂, u₃. Quelle formule conjecturer ?`,
    choix: cartes(t.melanger(liste)),
    bonne,
    pieges: table,
  };
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const [p1, p2, p3] = t.melanger(PREUVES);
  const liste = [
    preuve(p1), preuve(p2), preuve(p3),
    etape(t.au(QUESTIONS_ETAPES), t),
    propriete(t.au(PROPRIETES), t),
    terme('affine', t),
    terme('indice', t),
    conjecture(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  preuve: 'Lis cette preuve par récurrence ligne à ligne. Qu’est-ce qui cloche ?',
  etapes: 'Une question sur les trois étapes d’une récurrence.',
  propriete: 'Quelle propriété faut-il démontrer par récurrence ?',
  terme: 'Calcule ce terme, de proche en proche.',
  conjecture: 'Calcule les premiers termes, puis choisis la formule qui colle à tous.',

  'preuve-sans-initialisation': 'Il n’y a pas d’initialisation, et pour cause : au premier rang, la propriété est fausse. L’hérédité seule ne prouve rien.',
  'initialisation-a-recalculer': 'Recalcule le premier rang toi-même : l’égalité annoncée est fausse. L’hérédité a beau marcher, la récurrence ne démarre pas.',
  'inegalite-retournee': 'Dans l’hérédité, on soustrait le terme : l’inégalité se retourne. Si le terme vaut au plus deux, trois moins ce terme vaut au moins un.',
  'heredite-pour-tout-rang': 'L’hérédité doit tenir à chaque rang, dès le premier. Teste l’inégalité utilisée pour les petites valeurs de n : elle est fausse.',
  'heredite-calcul-faux': 'Développe chaque égalité de l’hérédité : l’une d’elles est fausse. Il manque un terme pour retomber sur l’expression voulue.',
  'heredite-circulaire': 'Cette hérédité suppose ce qu’elle doit démontrer. On part de la propriété au rang n pour arriver au rang suivant.',
  'preuve-complete': 'Tout tient : le premier rang est vérifié, et chaque ligne de l’hérédité est juste. Refais les calculs avant de soupçonner une étape.',

  'role-initialisation': 'L’initialisation vérifie seulement la propriété au premier rang, par un calcul direct.',
  'role-heredite': 'L’hérédité ne vérifie aucun rang précis : elle montre que si la propriété est vraie à un rang, elle l’est au suivant.',
  'role-conclusion': 'La conclusion ne démontre rien de neuf : elle rassemble l’initialisation et l’hérédité.',
  'hypothese-pour-tout': 'Supposer la propriété vraie pour tout n, c’est supposer ce qu’on veut démontrer. On la suppose pour un entier n fixé.',
  'hypothese-pas-conclusion': 'Le rang suivant, c’est ce qu’on veut obtenir : on ne peut pas le supposer. On suppose la propriété au rang n.',
  'heredite-pas-conclusion': 'Vraie pour tout rang, c’est la conclusion, qui vient après. L’hérédité démontre seulement le passage d’un rang au suivant.',
  'heredite-implication': 'L’hérédité démontre une implication : si la propriété est vraie au rang n, alors elle l’est au rang suivant.',
  'initialisation-indispensable': 'Sans initialisation, rien ne démarre : l’hérédité seule ne prouve aucun rang.',
  'heredite-indispensable': 'Sans hérédité, on ne peut pas passer d’un rang au suivant : on ne sait rien au-delà du premier.',
  'rien-a-conclure': 'Une étape qui échoue ne prouve pas le contraire : la propriété peut être vraie ou fausse aux autres rangs.',

  'pour-tout-dans-p': 'La propriété dépend de n : on n’y écrit pas « pour tout n ». Le « pour tout » vient seulement avec la conclusion.',
  'propriete-depend-de-n': 'Cette propriété ne parle que du premier terme : elle ne dépend pas de n. La récurrence porte sur le terme de rang n.',
  'signe-pas-variation': 'Le signe d’un terme ne dit rien du sens de variation. Compare chaque terme au suivant.',
  'termes-consecutifs': 'Le sens de variation compare chaque terme au suivant, pas au premier terme.',
  'majoree-pas-decroissante': 'Être majorée par trois, ce n’est pas être décroissante : la propriété, c’est l’inégalité elle-même.',
  'encadrement-pas-variation': 'On veut encadrer chaque terme, pas comparer deux termes : la propriété, c’est l’encadrement lui-même.',
  'somme-entiere': 'La propriété porte sur la somme entière, pas sur son dernier terme.',

  'compter-les-rangs': 'Compte les rangs avec soin : le premier terme a le rang zéro. Calcule terme après terme jusqu’au rang demandé.',
  'priorite-recurrence': 'Multiplie d’abord le terme, puis ajoute la constante : la multiplication passe avant l’addition.',
  'indice-dans-la-formule': 'Pour passer d’un terme au suivant, la formule utilise le rang du terme de départ, pas celui du terme d’arrivée.',

  'conjecture-trois-termes': 'Cette formule colle aux deux premiers termes seulement. Une conjecture se teste sur au moins trois termes.',
  'verifier-premier-terme': 'Teste la formule au rang zéro : elle ne redonne pas le premier terme. Vérifie l’exposant.',
  'pas-geometrique': 'Cette suite n’est pas géométrique : le quotient de deux termes consécutifs change. Teste ta formule sur plusieurs termes.',

  'preuve-regle': 'Vérifie l’initialisation par un calcul, puis chaque ligne de l’hérédité : chaque égalité, chaque inégalité, à chaque rang.',
  'etapes-regle': 'Initialisation : le premier rang. Hérédité : si c’est vrai à un rang, c’est vrai au suivant. Conclusion : vrai pour tout rang à partir du premier.',
  'propriete-regle': 'La propriété dépend de n et dit exactement ce qu’on veut démontrer au rang n, sans « pour tout ».',
  'terme-regle': 'Applique la relation de récurrence une fois par rang, en partant du premier terme.',
  'conjecture-regle': 'Calcule plusieurs termes, puis teste chaque formule sur chacun d’eux, en commençant par le premier.',
};
