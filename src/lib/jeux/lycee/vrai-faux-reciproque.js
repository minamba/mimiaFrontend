/**
 * VRAI, FAUX, RÉCIPROQUE — Nora, 1re générale et 1re technologique.
 * Domaine « Vocabulaire ensembliste et logique ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   1re générale : MATH_1RE_LOG_IMPLICATION, MATH_1RE_LOGIQUE_CONTRAPOSEE,
 *     MATH_1RE_LOG_CONTRE_EXEMPLE, MATH_1RE_LOG_NECESSAIRE,
 *     MATH_1RE_LOGIQUE_QUANTIF, MATH_1RE_LOG_CONNECTEURS, MATH_1RE_LOG_STATUT
 *   1re techno   : MATH_1TEC_LOG_RECIPROQUE, MATH_1TEC_LOG_CONTRE_EXEMPLE,
 *     MATH_1TEC_LOG_NECESSAIRE, MATH_1TEC_LOGIQUE, MATH_1TEC_LOG_STATUT
 *
 * TOUT EST ÉCRIT À LA MAIN, chaque proposition vérifiée une à une (et
 * re-vérifiée par le test, par balayage numérique quand c'est possible).
 * Les propositions sont classiques et sans ambiguïté : le cadre (« x réel »,
 * « n entier naturel ») est toujours affiché, entre parenthèses.
 *
 * HUIT SORTES DE MANCHES, une de chaque, mélangées :
 *   - LA RÉCIPROQUE. LES PIÈGES : la contraposée, et la négation sans échange ;
 *   - LA CONTRAPOSÉE. LES PIÈGES : la réciproque, et la négation sans échange ;
 *   - VRAIE OU FAUSSE : l'implication, sa réciproque (qui peut être fausse
 *     quand l'implication est vraie), sa contraposée (toujours de même valeur) ;
 *   - NÉCESSAIRE, SUFFISANTE, OU LES DEUX. LE PIÈGE : le sens de l'implication ;
 *   - LE CONTRE-EXEMPLE. LES PIÈGES : un nombre qui vérifie la proposition, et
 *     (pour « si…, alors… ») un nombre qui ne vérifie même pas l'hypothèse ;
 *   - LA NÉGATION. LES PIÈGES : garder le quantificateur, garder la propriété,
 *     l'inégalité stricte niée en stricte, « aucun » pour « pas tous », le
 *     « et » qui reste « et ». En 1re technologique, seulement les connecteurs
 *     « et », « ou » (les quantificateurs n'y sont pas au programme) ;
 *   - LE STATUT D'UNE LETTRE : variable, inconnue ou paramètre ;
 *   - IDENTITÉ OU ÉQUATION.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'vrai-faux-reciproque', titre: 'Vrai, faux, réciproque', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Vrai, faux, réciproque',
    accroche: 'Réciproque, contraposée, contre-exemple.',
    competences: [
      'MATH_1RE_LOG_IMPLICATION', 'MATH_1RE_LOGIQUE_CONTRAPOSEE', 'MATH_1RE_LOG_CONTRE_EXEMPLE',
      'MATH_1RE_LOG_NECESSAIRE', 'MATH_1RE_LOGIQUE_QUANTIF', 'MATH_1RE_LOG_CONNECTEURS',
      'MATH_1RE_LOG_STATUT',
    ],
  },
  PREMIERE_TECHNO: {
    titre: 'Vrai, faux, réciproque',
    accroche: 'Réciproque, contre-exemple, négation.',
    competences: [
      'MATH_1TEC_LOG_RECIPROQUE', 'MATH_1TEC_LOG_CONTRE_EXEMPLE', 'MATH_1TEC_LOG_NECESSAIRE',
      'MATH_1TEC_LOGIQUE', 'MATH_1TEC_LOG_STATUT',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ les banques */

/**
 * Les implications « si P, alors Q », avec leurs négations écrites à la main.
 * `directe` : l'implication est-elle vraie ? `reciproque` : et « si Q, alors P » ?
 */
export const IMPLICATIONS = [
  {
    cadre: 'x réel', p: 'x = 3', q: 'x² = 9', nonP: 'x ≠ 3', nonQ: 'x² ≠ 9', directe: true, reciproque: false,
  },
  {
    cadre: 'ABCD quadrilatère',
    p: 'ABCD est un carré',
    q: 'ABCD est un rectangle',
    nonP: 'ABCD n’est pas un carré',
    nonQ: 'ABCD n’est pas un rectangle',
    directe: true,
    reciproque: false,
  },
  {
    cadre: 'n entier naturel',
    p: 'n est un multiple de 4',
    q: 'n est pair',
    nonP: 'n n’est pas un multiple de 4',
    nonQ: 'n est impair',
    directe: true,
    reciproque: false,
  },
  {
    cadre: 'x réel', p: 'x > 2', q: 'x > 1', nonP: 'x ≤ 2', nonQ: 'x ≤ 1', directe: true, reciproque: false,
  },
  {
    cadre: 'ABC triangle',
    p: 'ABC est rectangle en A',
    q: 'BC² = AB² + AC²',
    nonP: 'ABC n’est pas rectangle en A',
    nonQ: 'BC² ≠ AB² + AC²',
    directe: true,
    reciproque: true,
  },
  {
    cadre: 'ABCD quadrilatère',
    p: 'ABCD est un parallélogramme',
    q: '[AC] et [BD] ont le même milieu',
    nonP: 'ABCD n’est pas un parallélogramme',
    nonQ: '[AC] et [BD] n’ont pas le même milieu',
    directe: true,
    reciproque: true,
  },
  {
    cadre: 'n entier naturel',
    p: 'n est pair',
    q: 'n² est pair',
    nonP: 'n est impair',
    nonQ: 'n² est impair',
    directe: true,
    reciproque: true,
  },
  {
    cadre: 'x réel', p: 'x² = 4', q: 'x = 2', nonP: 'x² ≠ 4', nonQ: 'x ≠ 2', directe: false, reciproque: true,
  },
  {
    cadre: 'a et b réels', p: 'ab = 0', q: 'a = 0', nonP: 'ab ≠ 0', nonQ: 'a ≠ 0', directe: false, reciproque: true,
  },
  {
    cadre: 'n entier naturel',
    p: 'n est divisible par 6',
    q: 'n est divisible par 3',
    nonP: 'n n’est pas divisible par 6',
    nonQ: 'n n’est pas divisible par 3',
    directe: true,
    reciproque: false,
  },
  {
    cadre: 'x réel', p: 'x < 3', q: 'x² < 9', nonP: 'x ≥ 3', nonQ: 'x² ≥ 9', directe: false, reciproque: true,
  },
  {
    cadre: 'ABCD quadrilatère',
    p: 'ABCD est un losange',
    q: '(AC) et (BD) sont perpendiculaires',
    nonP: 'ABCD n’est pas un losange',
    nonQ: '(AC) et (BD) ne sont pas perpendiculaires',
    directe: true,
    reciproque: false,
  },
  {
    cadre: 'a et b réels', p: 'a² = b²', q: 'a = b', nonP: 'a² ≠ b²', nonQ: 'a ≠ b', directe: false, reciproque: true,
  },
  {
    cadre: 'x réel', p: 'x ≥ 1', q: 'x² ≥ 1', nonP: 'x < 1', nonQ: 'x² < 1', directe: true, reciproque: false,
  },
  {
    cadre: 'n entier naturel',
    p: 'n se termine par 5',
    q: 'n est divisible par 5',
    nonP: 'n ne se termine pas par 5',
    nonQ: 'n n’est pas divisible par 5',
    directe: true,
    reciproque: false,
  },
];

const D = 'contre-exemple-doit-contredire';
const H = 'hypothese-fausse';

/** Des propositions universelles FAUSSES : leurs contre-exemples, et des choix qui n'en sont pas. */
export const CONTRE_EXEMPLES = [
  { enonce: 'Pour tout réel x, x² ≥ x.', ce: ['0,5', '0,2'], non: [['2', D], ['−1', D], ['1', D]] },
  { enonce: 'Pour tout réel x, x² > 0.', ce: ['0'], non: [['−2', D], ['3', D], ['0,5', D]] },
  {
    enonce: 'Pour tout entier naturel n, n² + n + 41 est un nombre premier.',
    ce: ['40'],
    non: [['1', D], ['2', D], ['3', D]],
  },
  { enonce: 'Pour tout réel x, √(x²) = x.', ce: ['−3', '−1'], non: [['3', D], ['0', D], ['2', D]] },
  { enonce: 'Pour tout entier naturel n, 2ⁿ > n².', ce: ['2', '3', '4'], non: [['1', D], ['5', D], ['6', D]] },
  { enonce: 'Pour tout réel x non nul, 1/x ≤ 1.', ce: ['0,5', '0,25'], non: [['2', D], ['−1', D], ['4', D]] },
  { enonce: 'Pour tout réel x, si x² > 4, alors x > 2.', ce: ['−3', '−5'], non: [['3', D], ['1', H], ['0', H]] },
  { enonce: 'Pour tout réel x, x³ ≥ x².', ce: ['0,5', '−1'], non: [['2', D], ['1', D], ['0', D]] },
  {
    enonce: 'Pour tous réels positifs a et b, √(a + b) = √a + √b.',
    ce: ['a = 9 et b = 16', 'a = 1 et b = 1'],
    non: [['a = 0 et b = 4', D], ['a = 7 et b = 0', D]],
  },
  {
    enonce: 'Pour tout entier naturel n, n² − n est un multiple de 4.',
    ce: ['2', '3'],
    non: [['4', D], ['5', D], ['1', D]],
  },
  {
    enonce: 'Pour tous réels a et b, (a + b)² = a² + b².',
    ce: ['a = 1 et b = 1', 'a = 2 et b = 3'],
    non: [['a = 0 et b = 5', D], ['a = 3 et b = 0', D]],
  },
];

const Q = 'negation-quantificateur';
const I = 'negation-inegalite';
const P = 'negation-propriete';
const E = 'negation-et-ou';

/** Les négations : la bonne, et deux fausses pistes nommées. `connecteur` : sans quantificateur. */
export const NEGATIONS = [
  {
    enonce: 'Pour tout réel x, x² ≥ 0.',
    bonne: 'Il existe un réel x tel que x² < 0',
    pieges: [['Pour tout réel x, x² < 0', Q], ['Il existe un réel x tel que x² ≤ 0', I]],
  },
  {
    enonce: 'Il existe un entier n tel que n² = 2.',
    bonne: 'Pour tout entier n, n² ≠ 2',
    pieges: [['Il existe un entier n tel que n² ≠ 2', Q], ['Pour tout entier n, n² = 2', P]],
  },
  {
    enonce: 'Pour tout réel x, f(x) ≤ 5.',
    bonne: 'Il existe un réel x tel que f(x) > 5',
    pieges: [['Il existe un réel x tel que f(x) ≥ 5', I], ['Pour tout réel x, f(x) > 5', Q]],
  },
  {
    enonce: 'Tous les élèves de la classe ont la moyenne.',
    bonne: 'Au moins un élève n’a pas la moyenne',
    pieges: [['Aucun élève n’a la moyenne', 'negation-pas-aucun'], ['Au moins un élève a la moyenne', P]],
  },
  {
    enonce: 'Il existe un réel x tel que eˣ < 0.',
    bonne: 'Pour tout réel x, eˣ ≥ 0',
    pieges: [['Pour tout réel x, eˣ > 0', I], ['Il existe un réel x tel que eˣ ≥ 0', Q]],
  },
  {
    enonce: 'Pour tout entier n, n² + n est pair.',
    bonne: 'Il existe un entier n tel que n² + n soit impair',
    pieges: [['Pour tout entier n, n² + n est impair', Q], ['Il existe un entier n tel que n² + n soit pair', P]],
  },
  {
    enonce: 'Il existe un réel x tel que x² = −1.',
    bonne: 'Pour tout réel x, x² ≠ −1',
    pieges: [['Il existe un réel x tel que x² ≠ −1', Q], ['Pour tout réel x, x² = −1', P]],
  },
  {
    connecteur: true,
    enonce: 'x et y sont des réels : « x ≥ 2 et y ≥ 2 ».',
    bonne: 'x < 2 ou y < 2',
    pieges: [['x < 2 et y < 2', E], ['x ≤ 2 ou y ≤ 2', I]],
  },
  {
    connecteur: true,
    enonce: 'n est un entier : « n est pair ou n est un multiple de 3 ».',
    bonne: 'n est impair et n n’est pas un multiple de 3',
    pieges: [
      ['n est impair ou n n’est pas un multiple de 3', E],
      ['n est impair et n est un multiple de 3', 'negation-chaque-morceau'],
    ],
  },
  {
    connecteur: true,
    enonce: 'x est un réel : « x < 0 ou x > 5 ».',
    bonne: 'x ≥ 0 et x ≤ 5',
    pieges: [['x ≥ 0 ou x ≤ 5', E], ['x > 0 et x < 5', I]],
  },
];

const VARIABLE = 'une variable';
const INCONNUE = 'une inconnue';
const PARAMETRE = 'un paramètre';

/** Le statut d'une lettre. */
export const STATUTS = [
  ['On résout l’équation 3x + 5 = 11. Ici, x est…', INCONNUE],
  ['La fonction f est définie sur ℝ par f(x) = x² + 1. Ici, x est…', VARIABLE],
  ['Pour chaque réel m, on trace la droite d’équation y = mx + 2. Ici, m est…', PARAMETRE],
  ['On résout x² − mx + 1 = 0 selon les valeurs du réel m. Ici, m est…', PARAMETRE],
  ['On résout x² − mx + 1 = 0 selon les valeurs du réel m. Ici, x est…', INCONNUE],
  ['La fonction g est définie sur [0 ; 10] par g(t) = 5t − 3. Ici, t est…', VARIABLE],
  ['On cherche l’entier n tel que 2n + 7 = 31. Ici, n est…', INCONNUE],
  ['Pour chaque réel a, on étudie la fonction x ↦ ax². Ici, a est…', PARAMETRE],
  ['Pour chaque réel a, on étudie la fonction x ↦ ax². Ici, x est…', VARIABLE],
];

const IDENTITE = 'Une identité';
const EQUATION = 'Une équation';

/** Des égalités : vraies pour tout x (identités), ou seulement pour certains (équations). */
export const EGALITES = [
  ['(x + 1)² = x² + 2x + 1', IDENTITE],
  ['(x + 1)² = 4', EQUATION],
  ['x² − 1 = (x − 1)(x + 1)', IDENTITE],
  ['x² − 1 = 0', EQUATION],
  ['2(x + 3) = 2x + 6', IDENTITE],
  ['2(x + 3) = x + 6', EQUATION],
  ['(x − 2)² = x² − 4x + 4', IDENTITE],
  ['(x − 2)² = x² + 4', EQUATION],
  ['x(x + 3) = x² + 3x', IDENTITE],
  ['(x + 3)² = x² + 9', EQUATION],
];

/* ------------------------------------------------------------ les manches */

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));
const si = (h, c) => `Si ${h}, alors ${c}`;
const citer = (f) => `« ${si(f.p, f.q)} » (${f.cadre})`;

function reciproque(t, f) {
  const bonne = si(f.q, f.p);
  const pieges = {
    [si(f.nonQ, f.nonP)]: 'reciproque-pas-contraposee',
    [si(f.nonP, f.nonQ)]: 'reciproque-pas-negation',
  };
  return {
    consigne: 'reciproque', question: citer(f), choix: cartes(t.melanger([bonne, ...Object.keys(pieges)])), bonne, pieges,
  };
}

function contraposee(t, f) {
  const bonne = si(f.nonQ, f.nonP);
  const pieges = {
    [si(f.q, f.p)]: 'contraposee-pas-reciproque',
    [si(f.nonP, f.nonQ)]: 'contraposee-ordre',
  };
  return {
    consigne: 'contraposee', question: citer(f), choix: cartes(t.melanger([bonne, ...Object.keys(pieges)])), bonne, pieges,
  };
}

const VRAIE = 'Vraie';
const FAUSSE = 'Fausse';

function verite(t, f) {
  const sorte = t.au(['implication', 'reciproque', 'contraposee']);
  let question;
  let vraie;
  let phraseSiFaux;
  let phraseSiVrai;
  if (sorte === 'implication') {
    question = `${citer(f)} est…`;
    vraie = f.directe;
    phraseSiFaux = 'implication-vraie';
    phraseSiVrai = 'implication-contre-exemple';
  } else if (sorte === 'reciproque') {
    question = `${citer(f)} est ${f.directe ? 'vraie' : 'fausse'}. Sa réciproque, « ${si(f.q, f.p)} », est…`;
    vraie = f.reciproque;
    phraseSiFaux = 'implication-vraie';
    phraseSiVrai = 'reciproque-contre-exemple';
  } else {
    question = `${citer(f)} est ${f.directe ? 'vraie' : 'fausse'}. Sa contraposée, « ${si(f.nonQ, f.nonP)} », est…`;
    vraie = f.directe;
    phraseSiFaux = 'contraposee-meme-valeur';
    phraseSiVrai = 'contraposee-meme-valeur';
  }
  return {
    consigne: 'verite',
    question,
    choix: cartes([VRAIE, FAUSSE]),
    bonne: vraie ? VRAIE : FAUSSE,
    pieges: vraie ? { [FAUSSE]: phraseSiFaux } : { [VRAIE]: phraseSiVrai },
  };
}

const SUFFISANTE = 'Suffisante, pas nécessaire';
const NECESSAIRE = 'Nécessaire, pas suffisante';
const LES_DEUX = 'Nécessaire et suffisante';

function necessaire(t, f) {
  const versQ = t.tirer() < 0.5;
  // « Pour avoir B, la condition C est… » : suffisante si C ⇒ B, nécessaire si B ⇒ C.
  const [but, condition] = versQ ? [f.q, f.p] : [f.p, f.q];
  const suffit = versQ ? f.directe : f.reciproque;
  const faut = versQ ? f.reciproque : f.directe;
  let bonne = LES_DEUX;
  if (suffit && !faut) bonne = SUFFISANTE;
  if (faut && !suffit) bonne = NECESSAIRE;
  const pieges = {};
  [SUFFISANTE, NECESSAIRE, LES_DEUX].forEach((c) => {
    if (c === bonne) return;
    if (bonne === LES_DEUX) pieges[c] = 'equivalence-oubliee';
    else if (c === LES_DEUX) pieges[c] = 'pas-equivalence';
    else pieges[c] = 'suffisante-ou-necessaire';
  });
  return {
    consigne: 'necessaire',
    question: `Pour avoir « ${but} », la condition « ${condition} » est…   (${f.cadre})`,
    choix: cartes([SUFFISANTE, NECESSAIRE, LES_DEUX]),
    bonne,
    pieges,
  };
}

function contreExemple(t) {
  const item = t.au(CONTRE_EXEMPLES);
  const bonne = t.au(item.ce);
  const non = t.melanger(item.non).slice(0, 2);
  const pieges = {};
  non.forEach(([v, phrase]) => { pieges[v] = phrase; });
  return {
    consigne: 'contre-exemple',
    question: item.enonce,
    choix: cartes(t.melanger([bonne, ...non.map(([v]) => v)])),
    bonne,
    pieges,
  };
}

function negation(t, connecteurSeulement) {
  const banque = connecteurSeulement ? NEGATIONS.filter((n) => n.connecteur) : NEGATIONS;
  const item = t.au(banque);
  const pieges = {};
  item.pieges.forEach(([v, phrase]) => { pieges[v] = phrase; });
  return {
    consigne: 'negation',
    question: item.enonce,
    choix: cartes(t.melanger([item.bonne, ...Object.keys(pieges)])),
    bonne: item.bonne,
    pieges,
  };
}

const PHRASE_STATUT = {
  [VARIABLE]: 'statut-variable',
  [INCONNUE]: 'statut-inconnue',
  [PARAMETRE]: 'statut-parametre',
};

function statut(t) {
  const [question, bonne] = t.au(STATUTS);
  const pieges = {};
  [VARIABLE, INCONNUE, PARAMETRE].forEach((c) => { if (c !== bonne) pieges[c] = PHRASE_STATUT[c]; });
  return {
    consigne: 'statut', question, choix: cartes([VARIABLE, INCONNUE, PARAMETRE]), bonne, pieges,
  };
}

function identite(t) {
  const [egalite, bonne] = t.au(EGALITES);
  const autre = bonne === IDENTITE ? EQUATION : IDENTITE;
  return {
    consigne: 'identite',
    question: `x désigne un réel. « ${egalite} » est…`,
    choix: cartes([IDENTITE, EQUATION]),
    bonne,
    pieges: { [autre]: bonne === IDENTITE ? 'identite-pas-equation' : 'equation-pas-identite' },
  };
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  // Quatre implications différentes pour les quatre manches qui en parlent.
  // Réciproque et contraposée : jamais une équivalence (P et Q disent alors
  // la même chose, et « si non P, alors non Q » vaudrait la contraposée).
  const [f1, f2] = t.melanger(IMPLICATIONS.filter((f) => !(f.directe && f.reciproque)));
  const [f3, f4] = t.melanger(IMPLICATIONS.filter((f) => f !== f1 && f !== f2));
  return t.melanger([
    reciproque(t, f1), contraposee(t, f2), verite(t, f3), necessaire(t, f4),
    contreExemple(t), negation(t, niveau === 'PREMIERE_TECHNO'), statut(t), identite(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  reciproque: 'Quelle est la réciproque de cette implication ?',
  contraposee: 'Quelle est la contraposée de cette implication ?',
  verite: 'Vraie ou fausse ? Cherche un contre-exemple avant de répondre.',
  necessaire: 'Cette condition est-elle nécessaire, suffisante, ou les deux ?',
  'contre-exemple': 'Choisis un contre-exemple à cette proposition.',
  negation: 'Quelle est la négation de cette proposition ?',
  statut: 'Quel est le rôle de cette lettre ?',
  identite: 'Identité ou équation ?',

  'reciproque-pas-contraposee': 'Ça, c’est la contraposée : on a nié et échangé. Pour la réciproque, on échange seulement l’hypothèse et la conclusion, sans rien nier.',
  'reciproque-pas-negation': 'On ne nie rien dans une réciproque : on échange seulement l’hypothèse et la conclusion.',
  'contraposee-pas-reciproque': 'Ça, c’est la réciproque. La contraposée échange l’hypothèse et la conclusion, et les nie toutes les deux.',
  'contraposee-ordre': 'Tu as nié, mais sans échanger : la contraposée part de la négation de la conclusion, pour arriver à la négation de l’hypothèse.',
  'implication-vraie': 'Pour dire qu’une implication est fausse, il faut un contre-exemple : un cas où l’hypothèse est vraie et la conclusion fausse. Ici, il n’y en a aucun.',
  'implication-contre-exemple': 'Cherche un cas où l’hypothèse est vraie et la conclusion fausse : un seul suffit pour que l’implication soit fausse.',
  'reciproque-contre-exemple': 'Une implication vraie peut avoir une réciproque fausse : cherche un cas où la nouvelle hypothèse est vraie et la nouvelle conclusion fausse.',
  'contraposee-meme-valeur': 'Une implication et sa contraposée disent la même chose : elles sont vraies ou fausses en même temps.',
  'suffisante-ou-necessaire': 'Suffisante veut dire : si la condition est vraie, alors on a le résultat. Nécessaire veut dire : si on a le résultat, alors la condition est vraie. Teste les deux sens.',
  'pas-equivalence': 'Pour nécessaire et suffisante, il faut que les deux sens soient vrais. Cherche un contre-exemple à l’un des deux.',
  'equivalence-oubliee': 'Ici, les deux sens sont vrais : la condition est à la fois nécessaire et suffisante.',
  'contre-exemple-doit-contredire': 'Ce choix vérifie la proposition : il ne la contredit pas. Un contre-exemple est un cas où elle est fausse.',
  'hypothese-fausse': 'Pour contredire une implication, il faut que l’hypothèse soit vraie et la conclusion fausse. Ici, l’hypothèse n’est même pas vérifiée.',
  'negation-quantificateur': 'Pour nier, on change aussi le quantificateur : pour tout devient il existe, et il existe devient pour tout.',
  'negation-inegalite': 'Le contraire de strictement plus petit, c’est plus grand ou égal : l’égalité change de camp.',
  'negation-propriete': 'Tu as bien changé le quantificateur, mais il faut aussi nier la propriété.',
  'negation-pas-aucun': 'Le contraire de tous l’ont, ce n’est pas aucun ne l’a : il suffit d’un seul qui ne l’a pas.',
  'negation-et-ou': 'Quand on nie, le « et » devient « ou », et le « ou » devient « et ».',
  'negation-chaque-morceau': 'Il faut nier chacun des deux morceaux, pas seulement le premier.',
  'statut-variable': 'Une variable parcourt tout un ensemble de valeurs, comme la lettre d’une fonction. Regarde si, ici, on cherche plutôt cette lettre, ou si on la fixe.',
  'statut-inconnue': 'Une inconnue, c’est une valeur précise qu’on cherche en résolvant. Ici, on ne cherche pas cette lettre.',
  'statut-parametre': 'Un paramètre est fixé pour tout le problème, et on étudie ce qui change selon sa valeur. Ici, ce n’est pas le rôle de cette lettre.',
  'identite-pas-equation': 'Développe les deux membres : ils sont égaux pour toutes les valeurs de x. C’est une identité, il n’y a rien à résoudre.',
  'equation-pas-identite': 'Teste deux ou trois valeurs de x : si l’égalité devient fausse pour l’une d’elles, ce n’est pas une identité, c’est une équation à résoudre.',

  'reciproque-regle': 'La réciproque de si P, alors Q, c’est si Q, alors P.',
  'contraposee-regle': 'La contraposée de si P, alors Q, c’est si non Q, alors non P.',
  'verite-regle': 'Une implication est fausse dès qu’on trouve un cas où l’hypothèse est vraie et la conclusion fausse.',
  'necessaire-regle': 'Si la condition entraîne le résultat, elle est suffisante ; si le résultat entraîne la condition, elle est nécessaire.',
  'contre-exemple-regle': 'Un contre-exemple vérifie les hypothèses, mais pas la conclusion.',
  'negation-regle': 'Pour nier, pour tout devient il existe, il existe devient pour tout, et la propriété est niée.',
  'statut-regle': 'Inconnue : on la cherche. Variable : elle parcourt un ensemble. Paramètre : on le fixe pour tout le problème.',
  'identite-regle': 'Une identité est vraie pour toutes les valeurs ; une équation, seulement pour certaines, qu’on cherche.',
};
