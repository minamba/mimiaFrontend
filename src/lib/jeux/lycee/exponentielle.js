/**
 * L'EXPONENTIELLE — Nora, en 1re générale (spécialité mathématiques).
 *
 * Huit sortes de manches, une par partie, dans le désordre ; toutes les
 * réponses sont CALCULÉES ici :
 *   - le produit eᵃ × eᵇ = eᵃ⁺ᵇ. PIÈGES : eᵃᵇ (multiplier les exposants),
 *     e⁰ pris pour 0 ;
 *   - le quotient eᵃ ÷ eᵇ = eᵃ⁻ᵇ. PIÈGES : eᵃ⁺ᵇ, eᵇ⁻ᵃ, eᵃ/ᵇ ;
 *   - la puissance (eᵃ)ⁿ = eⁿᵃ. PIÈGES : eᵃ⁺ⁿ, e^(aⁿ), e^(x²) pour (eˣ)² ;
 *   - l'inverse e⁻ᵃ = 1/eᵃ. PIÈGES : −eᵃ (l'opposé), e^(1/a) ;
 *   - le signe : eˣ > 0 pour tout x. PIÈGES : « positif ou nul » (l'exponentielle
 *     ne s'annule jamais), « du signe de x », la solution x = 0 ajoutée à
 *     (ax + b)eˣ = 0, le sens de l'inégalité ;
 *   - la dérivée de e^(kx) et de (ax + b)eˣ. PIÈGES : le facteur k oublié,
 *     eˣ dérivée comme une puissance (kx e^(kx − 1)), (uv)′ = u′v′ ;
 *   - les équations et inéquations eᵃ = eᵇ ⇔ a = b. PIÈGES : e^(…) = 1 résolu
 *     comme … = 1 (au lieu de … = 0), le terme qui change de membre, le sens de
 *     l'inégalité ;
 *   - les variations de c e^(kx). PIÈGES : le signe de c fois k, « négative »
 *     pour une fonction toujours positive.
 *
 * LE DESSIN (09/10/2026) : le signe porte un `visuel`, la courbe de
 * l'exponentielle de la question (eˣ, e^(−x), e^(2x), −eˣ), ou, devant
 * (ax + b)e^(kx), celle du seul facteur e^(kx) : il ne s'annule jamais, c'est
 * tout le piège — le produit dessiné montrerait sa racine, donc la réponse.
 * L'équation eᵃˣ⁺ᵇ = 1 montre eˣ et son point (0 ; 1), l'inéquation eˣ
 * croissante. Rien pour les règles de calcul, la dérivée (la tangente donnerait
 * le facteur k), l'égalité eᵃ = eᵇ ni les variations de c e^(kx) : la courbe
 * serait la réponse.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'exponentielle', titre: 'L’exponentielle', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'L’exponentielle',
    accroche: 'Propriétés, signe, dérivée, équations.',
    competences: ['MATH_1RE_EXP', 'MATH_1RE_EXP_ETUDE', 'MATH_1RE_EXP_DERIVEE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ l'écriture */

/** « −3 », « 2,5 » : le signe moins typographique, la virgule. */
function nb(x) {
  let r = Math.round(x * 1e6) / 1e6;
  if (Object.is(r, -0)) r = 0;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
}

const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
/** « −5/2 », « 3 » : une fraction irréductible, le signe devant. */
function fr(n, d = 1) {
  let [a, b] = d < 0 ? [-n, -d] : [n, d];
  const g = pgcd(Math.abs(a), b) || 1;
  [a, b] = [a / g, b / g];
  const s = a < 0 ? '−' : '';
  return b === 1 ? `${s}${Math.abs(a)}` : `${s}${Math.abs(a)}/${b}`;
}
/** « {−5/2 ; 3} » : un ensemble de solutions rangé dans l'ordre. */
function ensemble(valeurs) {
  const vus = new Map();
  valeurs.forEach(([n, d]) => vus.set(fr(n, d), n / d));
  const tri = [...vus.entries()].sort((x, y) => x[1] - y[1]).map(([s]) => s);
  return `{${tri.join(' ; ')}}`;
}

const EXPOSANTS = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => EXPOSANTS[c]).join('');

/** « 3x − 2 », « −x + 4 », « 2x », « 5 » */
function affine(a, b) {
  let s;
  if (a === 0) return nb(b);
  if (a === 1) s = 'x';
  else if (a === -1) s = '−x';
  else s = `${nb(a)}x`;
  if (b > 0) s += ` + ${nb(b)}`;
  if (b < 0) s += ` − ${nb(-b)}`;
  return s;
}
/** « 2x² − 3x » : coefficients du plus haut degré au plus bas. */
function poly(coefs) {
  const deg = coefs.length - 1;
  let s = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const k = deg - i;
    const lettre = ['', 'x', 'x²'][k];
    const abs = Math.abs(c);
    const corps = abs === 1 && k > 0 ? lettre : `${nb(abs)}${lettre}`;
    if (s === '') s = (c < 0 ? '−' : '') + corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}
/** e à une puissance entière : « e⁷ », « e⁻³ », « e », « 1 ». */
function E(n) {
  if (n === 0) return '1';
  if (n === 1) return 'e';
  return `e${sup(n)}`;
}
/** e à une puissance affine : « eˣ », « e^(−2x) », « e^(3x + 1) ». */
const ex = (a, b = 0) => (a === 1 && b === 0 ? 'eˣ' : `e^(${affine(a, b)})`);
/** Un coefficient devant : « 3 », « − », « ». */
const coef = (k) => {
  if (k === 1) return '';
  if (k === -1) return '−';
  return nb(k);
};

/* ---------------------------------------------------------- les manches */

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche : la bonne réponse, ses pièges nommés (jamais justes), des voisins s'il en manque. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin, visuel,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && v !== undefined && String(v) !== b);
  const liste = troisChoix(b, valides.map(([v]) => String(v)), (k) => String(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = String(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  const m = {
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
  if (visuel) m.visuel = visuel;
  return m;
}

/**
 * Le dessin : la courbe de c e^(kx) seule, l'axe des abscisses en vue. La
 * fenêtre s'arrête là où |c e^(kx)| atteint 10, le bord haut (ou bas) : la
 * courbe ne sort jamais du cadre, et l'asymptote y = 0 a toute la place.
 */
function courbe({ c = 1, k = 1, etiquette, points } = {}) {
  const bord = Math.round((Math.log(10 / Math.abs(c)) / Math.abs(k)) * 100) / 100;
  const [xmin, xmax] = k > 0 ? [-3, bord] : [-bord, 3];
  const v = {
    type: 'courbe',
    fenetre: {
      xmin, xmax, ymin: c > 0 ? -1 : -10, ymax: c > 0 ? 10 : 1,
    },
    fonctions: [{
      forme: 'exp', a: c, k, etiquette,
    }],
  };
  if (points) v.points = points;
  return v;
}

const nonNul = (entre, a, b) => {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
};

const SENS = {
  '>': '<', '<': '>', '≥': '≤', '≤': '≥',
};

/* ----------------------------------------------------------------- produit */

function produit({ au, entre, melanger }) {
  if (au([true, true, false])) {
    let a;
    let b;
    do {
      a = nonNul(entre, -5, 7);
      b = nonNul(entre, -5, 7);
    } while (a * b === a + b || a === 1 || b === 1);
    return manche(melanger, {
      consigne: 'produit',
      question: `${E(a)} × ${E(b)} = ?`,
      bonne: E(a + b),
      pieges: [[E(a * b), 'exp-produit'], [a + b === 0 ? '0' : null, 'exp-zero']],
      voisin: (k) => E(a + b + k),
    });
  }
  const a = nonNul(entre, -3, 3);
  const b = nonNul(entre, -3, 3);
  const c = nonNul(entre, -5, 5);
  return manche(melanger, {
    consigne: 'produit',
    question: `${ex(a)} × ${ex(b, c)} = ?`,
    bonne: a + b === 0 ? E(c) : ex(a + b, c),
    pieges: [[`e^(${poly([a * b, a * c, 0])})`, 'exp-produit']],
    voisin: (k) => ex(a + b + k, c),
  });
}

/* ----------------------------------------------------------------- quotient */

function quotient({ entre, melanger }) {
  let a;
  let b;
  do {
    a = entre(-4, 8);
    b = nonNul(entre, -5, 5);
  } while (a === b || a === 0 || a === 1 || b === 1);
  return manche(melanger, {
    consigne: 'quotient',
    question: `${E(a)} ÷ ${E(b)} = ?`,
    bonne: E(a - b),
    pieges: melanger([
      [E(a + b), 'exp-quotient'],
      [E(b - a), 'exp-quotient-ordre'],
      [a % b === 0 ? E(a / b) : null, 'exp-quotient'],
    ]),
    voisin: (k) => E(a - b + k),
  });
}

/* ---------------------------------------------------------------- puissance */

function puissance({ au, entre, melanger }) {
  if (au([true, true, false])) {
    const a = au([2, 3, 4, -2, -3]);
    // (e²)² : a + n, a × n et aⁿ valent tous quatre, il n'y aurait plus de piège.
    const n = a === 2 ? 3 : entre(2, 3);
    return manche(melanger, {
      consigne: 'puissance',
      question: `(${E(a)})${sup(n)} = ?`,
      bonne: E(a * n),
      pieges: [[E(a + n), 'exp-puissance'], [E(a ** n), 'exp-puissance-exposant']],
      voisin: (k) => E(a * n + k),
    });
  }
  const n = entre(2, 3);
  return manche(melanger, {
    consigne: 'puissance',
    question: `(eˣ)${sup(n)} = ?`,
    bonne: ex(n),
    pieges: [[`e^(x${sup(n)})`, 'exp-puissance-exposant'], [ex(1, n), 'exp-puissance']],
    voisin: (k) => ex(n + k),
  });
}

/* ------------------------------------------------------------------ inverse */

function inverse({ au, entre, melanger }) {
  const sorte = au(['vers-negatif', 'vers-fraction', 'x']);
  const a = entre(2, 6);
  if (sorte === 'vers-negatif') {
    return manche(melanger, {
      consigne: 'inverse',
      question: `1/${E(a)} = ?`,
      bonne: E(-a),
      pieges: [[`−${E(a)}`, 'exp-inverse-oppose'], [`e^(1/${a})`, 'exp-inverse-racine']],
      voisin: (k) => E(-a - k),
    });
  }
  if (sorte === 'vers-fraction') {
    return manche(melanger, {
      consigne: 'inverse',
      question: `${E(-a)} = ?`,
      bonne: `1/${E(a)}`,
      pieges: [[`−${E(a)}`, 'exp-inverse-oppose'], [`−1/${E(a)}`, 'exp-toujours-positive']],
      voisin: (k) => `1/${E(a + k)}`,
    });
  }
  return manche(melanger, {
    consigne: 'inverse',
    question: 'e^(−x) = ?',
    bonne: '1/eˣ',
    pieges: [['−eˣ', 'exp-inverse-oppose'], ['−1/eˣ', 'exp-toujours-positive']],
    voisin: (k) => `1/${ex(k + 1)}`,
  });
}

/* -------------------------------------------------------------------- signe */

const STRICT_POS = 'strictement positif';
const STRICT_NEG = 'strictement négatif';

function signe({ au, entre, melanger }) {
  const sorte = au(['toujours', 'equation', 'inequation']);
  if (sorte === 'toujours') {
    const [expr, bonne, pieges] = au([
      ['eˣ', STRICT_POS, { 'positif ou nul': 'exp-jamais-nulle', 'du signe de x': 'exp-toujours-positive' }],
      ['e^(−x)', STRICT_POS, { [STRICT_NEG]: 'exp-toujours-positive', 'positif ou nul': 'exp-jamais-nulle' }],
      ['e^(2x)', STRICT_POS, { 'du signe de x': 'exp-toujours-positive', 'positif ou nul': 'exp-jamais-nulle' }],
      ['−eˣ', STRICT_NEG, { [STRICT_POS]: 'exp-signe-coefficient', 'négatif ou nul': 'exp-jamais-nulle' }],
    ]);
    // Le dessin : la courbe de cette expression même, c e^(kx).
    const dessin = {
      'eˣ': { c: 1, k: 1 }, 'e^(−x)': { c: 1, k: -1 }, 'e^(2x)': { c: 1, k: 2 }, '−eˣ': { c: -1, k: 1 },
    }[expr];
    return {
      consigne: 'signe-toujours',
      question: `Pour tout réel x, ${expr} est…`,
      choix: cartes(melanger([bonne, ...Object.keys(pieges)])),
      bonne,
      pieges,
      visuel: courbe({ ...dessin, etiquette: `y = ${expr}` }),
    };
  }
  const a = au([1, 2, 3, -1, -2, -3]);
  const b = nonNul(entre, -8, 8);
  const k = au([1, 1, 2, -1, 3]);
  if (sorte === 'equation') {
    return manche(melanger, {
      consigne: 'signe-equation',
      question: `Résous (${affine(a, b)})${ex(k)} = 0`,
      bonne: ensemble([[-b, a]]),
      pieges: [[ensemble([[-b, a], [0, 1]]), 'exp-jamais-nulle'], [ensemble([[b, a]]), 'transposer-signe']],
      voisin: (j) => ensemble([[-b + j, a]]),
      visuel: courbe({ k, etiquette: `y = ${ex(k)}` }),
    });
  }
  const op = au(['>', '<', '≥', '≤']);
  const bon = a > 0 ? op : SENS[op];
  return manche(melanger, {
    consigne: 'signe-inequation',
    question: `Résous (${affine(a, b)})${ex(k)} ${op} 0`,
    bonne: `x ${bon} ${fr(-b, a)}`,
    pieges: [
      [`x ${SENS[bon]} ${fr(-b, a)}`, a < 0 ? 'inegalite-diviser-negatif' : 'exp-signe-du-facteur'],
      [`x ${bon} ${fr(b, a)}`, 'transposer-signe'],
    ],
    voisin: (j) => `x ${bon} ${fr(-b + j, a)}`,
    visuel: courbe({ k, etiquette: `y = ${ex(k)}` }),
  });
}

/* ------------------------------------------------------------------ dérivée */

function derivee({ au, entre, melanger }) {
  const sorte = au(['ekx', 'c-ekx', 'affine', 'produit']);
  const q = (f) => `f(x) = ${f} ; f′(x) = ?`;
  if (sorte === 'ekx') {
    const k = au([2, 3, 4, 5, -1, -2, -3]);
    return manche(melanger, {
      consigne: 'derivee',
      question: q(ex(k)),
      bonne: `${coef(k)}${ex(k)}`,
      pieges: [[ex(k), 'exp-derivee-facteur'], [`${coef(k)}x × ${ex(k, -1)}`, 'exp-pas-puissance']],
      voisin: (j) => `${coef(k * (j + 1))}${ex(k)}`,
    });
  }
  if (sorte === 'c-ekx') {
    const c = entre(2, 5);
    const k = au([2, 3, -1, -2]);
    return manche(melanger, {
      consigne: 'derivee',
      question: q(`${c}${ex(k)}`),
      bonne: `${coef(c * k)}${ex(k)}`,
      pieges: [[`${c}${ex(k)}`, 'exp-derivee-facteur'], [`${coef(k)}${ex(k)}`, 'constante-multiplicative']],
      voisin: (j) => `${coef(c * k * (j + 1))}${ex(k)}`,
    });
  }
  if (sorte === 'affine') {
    const a = au([2, 3, -2, -3]);
    const b = nonNul(entre, -5, 5);
    return manche(melanger, {
      consigne: 'derivee',
      question: q(ex(a, b)),
      bonne: `${coef(a)}${ex(a, b)}`,
      pieges: [[ex(a, b), 'exp-derivee-facteur'], [`(${affine(a, b)})${ex(a, b - 1)}`, 'exp-pas-puissance']],
      voisin: (j) => `${coef(a * (j + 1))}${ex(a, b)}`,
    });
  }
  let a;
  let b;
  do {
    a = au([1, 2, 3, -1, -2]);
    b = nonNul(entre, -5, 5);
  } while (a + b === 0 || a === b);
  // ((ax + b)eˣ)′ = a eˣ + (ax + b)eˣ = (ax + a + b)eˣ
  return manche(melanger, {
    consigne: 'derivee',
    question: q(`(${affine(a, b)})eˣ`),
    bonne: `(${affine(a, a + b)})eˣ`,
    pieges: [[`${coef(a)}eˣ`, 'produit-des-derivees'], [`(${affine(-a, a - b)})eˣ`, 'produit-signe']],
    voisin: (j) => `(${affine(a, a + b + j)})eˣ`,
  });
}

/* ---------------------------------------------------------------- équations */

function equation({ au, entre, melanger }) {
  const sorte = au(['egalite', 'un', 'inequation']);
  if (sorte === 'egalite') {
    let a;
    let c;
    do {
      a = nonNul(entre, -4, 4);
      c = nonNul(entre, -4, 4);
    } while (a === c || a + c === 0);
    const b = nonNul(entre, -6, 6);
    const d = entre(-6, 6);
    return manche(melanger, {
      consigne: 'equation',
      question: `Résous ${ex(a, b)} = ${ex(c, d)}`,
      bonne: `x = ${fr(d - b, a - c)}`,
      pieges: [[`x = ${fr(d + b, a - c)}`, 'transposer-signe'], [`x = ${fr(d - b, a + c)}`, 'transposer-x']],
      voisin: (k) => `x = ${fr(d - b + k, a - c)}`,
    });
  }
  if (sorte === 'un') {
    const a = au([1, 2, 3, 4, -1, -2, -3]);
    const b = nonNul(entre, -8, 8);
    return manche(melanger, {
      consigne: 'equation',
      question: `Résous ${ex(a, b)} = 1`,
      bonne: `x = ${fr(-b, a)}`,
      pieges: [[`x = ${fr(1 - b, a)}`, 'exp-zero'], [`x = ${fr(b, a)}`, 'transposer-signe']],
      voisin: (k) => `x = ${fr(-b + k, a)}`,
      // eˣ vaut 1 en x = 0 et nulle part ailleurs : l'exposant doit être nul.
      visuel: courbe({ etiquette: 'y = eˣ', points: [{ x: 0, y: 1, etiquette: 'e⁰ = 1' }] }),
    });
  }
  const a = au([1, 2, 3, -1, -2, -3]);
  const b = nonNul(entre, -6, 6);
  let c;
  do c = entre(-5, 5); while (c === 0 || c === 1);
  const op = au(['>', '<', '≥', '≤']);
  const bon = a > 0 ? op : SENS[op];
  return manche(melanger, {
    consigne: 'inequation',
    question: `Résous ${ex(a, b)} ${op} ${E(c)}`,
    bonne: `x ${bon} ${fr(c - b, a)}`,
    pieges: [
      [`x ${SENS[bon]} ${fr(c - b, a)}`, a < 0 ? 'inegalite-diviser-negatif' : 'exp-croissante'],
      [`x ${bon} ${fr(c + b, a)}`, 'transposer-signe'],
    ],
    voisin: (k) => `x ${bon} ${fr(c - b + k, a)}`,
    // eˣ croissante : comparer deux exponentielles, c'est comparer les exposants.
    visuel: courbe({ etiquette: 'y = eˣ' }),
  });
}

/* --------------------------------------------------------------- variations */

function variation({ au, melanger }) {
  const c = au([1, 2, 3, -1, -2, -3]);
  const k = au([1, 2, 3, -1, -2]);
  const croissante = c * k > 0;
  const bonne = croissante ? 'croissante' : 'décroissante';
  const faux = c > 0 ? 'négative' : 'positive';
  return {
    consigne: 'variation',
    question: `f(x) = ${coef(c)}${ex(k)}. Sur ℝ, f est…`,
    choix: cartes(melanger([bonne, croissante ? 'décroissante' : 'croissante', faux])),
    bonne,
    pieges: {
      [croissante ? 'décroissante' : 'croissante']: 'exp-variation-signe',
      [faux]: 'exp-signe-coefficient',
    },
  };
}

/* ------------------------------------------------------------ la partie */

const SORTES = [produit, quotient, puissance, inverse, signe, derivee, equation, variation];

// Une seule classe : la 1re générale. Les huit sortes, une fois chacune.
export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  return t.melanger(SORTES.map((f) => f(t)));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  produit: 'Simplifie ce produit d’exponentielles.',
  quotient: 'Simplifie ce quotient d’exponentielles.',
  puissance: 'Simplifie cette puissance.',
  inverse: 'Écris autrement cette exponentielle.',
  'signe-toujours': 'Quel est le signe ?',
  'signe-equation': 'Résous cette équation produit.',
  'signe-inequation': 'Résous cette inéquation, grâce au signe de l’exponentielle.',
  derivee: 'Dérive cette fonction.',
  equation: 'Résous cette équation.',
  inequation: 'Résous cette inéquation.',
  variation: 'Trouve le sens de variation de f.',

  'exp-produit': 'e puissance a, fois e puissance b, égale e puissance a plus b : on additionne les exposants.',
  'exp-zero': 'e puissance zéro vaut un, pas zéro.',
  'exp-quotient': 'e puissance a, divisé par e puissance b, égale e puissance a moins b : on soustrait les exposants.',
  'exp-quotient-ordre': 'L’exposant du haut moins celui du bas, dans cet ordre.',
  'exp-puissance': 'e puissance a, le tout puissance n, égale e puissance n fois a : on multiplie.',
  'exp-puissance-exposant': 'On multiplie l’exposant par n ; on ne l’élève pas à la puissance n.',
  'exp-inverse-oppose': 'e puissance moins a, c’est un sur e puissance a, l’inverse, pas l’opposé.',
  'exp-inverse-racine': 'L’inverse correspond à l’exposant opposé, pas à l’exposant inverse.',
  'exp-toujours-positive': 'Une exponentielle est toujours strictement positive, quel que soit l’exposant.',
  'exp-jamais-nulle': 'Une exponentielle ne s’annule jamais : elle est strictement positive.',
  'exp-signe-coefficient': 'L’exponentielle est strictement positive : le signe vient du coefficient devant elle.',
  'exp-signe-du-facteur': 'L’exponentielle est positive : le signe du produit est celui du facteur affine. Ici, diviser par un positif garde le sens.',
  'transposer-signe': 'Un terme qui change de membre change de signe.',
  'transposer-x': 'Regroupe les termes en x du même côté : on soustrait, on n’additionne pas.',
  'inegalite-diviser-negatif': 'Diviser par un nombre négatif change le sens de l’inégalité.',
  'exp-croissante': 'L’exponentielle est croissante : elle garde le sens de l’inégalité, et diviser par un positif aussi.',
  'exp-derivee-facteur': 'La dérivée de e puissance k x est k fois e puissance k x : n’oublie pas le facteur k.',
  'exp-pas-puissance': 'L’exponentielle ne se dérive pas comme une puissance : sa dérivée, c’est elle-même, fois la dérivée de l’exposant.',
  'constante-multiplicative': 'Le nombre en facteur reste en facteur : il multiplie la dérivée.',
  'produit-des-derivees': 'La dérivée d’un produit n’est pas le produit des dérivées : u prime v, plus u v prime.',
  'produit-signe': 'Pour un produit, c’est u prime v plus u v prime : on additionne.',
  'exp-variation-signe': 'La dérivée de c fois e puissance k x est c fois k fois e puissance k x : son signe est celui de c fois k.',

  'produit-regle': 'On additionne les exposants.',
  'quotient-regle': 'On soustrait les exposants : celui du haut moins celui du bas.',
  'puissance-regle': 'On multiplie l’exposant par la puissance.',
  'inverse-regle': 'e puissance moins a égale un sur e puissance a.',
  'signe-toujours-regle': 'Une exponentielle est toujours strictement positive.',
  'signe-equation-regle': 'L’exponentielle ne s’annule jamais : seul le facteur affine peut être nul.',
  'signe-inequation-regle': 'L’exponentielle est positive : le signe du produit est celui du facteur affine.',
  'derivee-regle': 'La dérivée de e puissance u est u prime fois e puissance u.',
  'equation-regle': 'e puissance a égale e puissance b si et seulement si a égale b ; et un, c’est e puissance zéro.',
  'inequation-regle': 'L’exponentielle est croissante : compare les exposants, dans le même sens.',
  'variation-regle': 'Dérive, puis regarde le signe de la dérivée.',
};
