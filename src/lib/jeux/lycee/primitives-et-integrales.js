/**
 * PRIMITIVES ET INTÉGRALES — terminale générale (spécialité). Professeure : Nora.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_TLE_PRIMITIVES, MATH_TLE_INTEGRALE.
 *
 * SEPT SORTES DE MANCHES (1 + 2 + 1 + 1 + 1 + 1 + 1, mélangées) :
 *   - LA PRIMITIVE USUELLE : a xⁿ + c, ou a / x². LES PIÈGES : dériver au lieu
 *     de primitiver, oublier de diviser par n + 1, laisser la constante c
 *     telle quelle, perdre le signe moins de −1/x ;
 *   - LA PRIMITIVE D'UNE FORME COMPOSÉE (deux manches) : e^(ax), u′eᵘ, u′/u,
 *     u′uⁿ. LES PIÈGES : ne pas diviser par a (ou oublier son signe),
 *     primitiver facteur par facteur, diviser par u′, garder u′ devant ;
 *   - L'INTÉGRALE par une primitive, F(b) − F(a). LES PIÈGES : F(a) − F(b),
 *     f(b) − f(a), oublier F(a) ;
 *   - L'AIRE sous (ou sur) la courbe d'une fonction de signe constant. LE
 *     PIÈGE ROI : une aire négative ;
 *   - LE SIGNE de l'intégrale : positivité, et les bornes à l'envers ;
 *   - LA VALEUR MOYENNE : l'intégrale divisée par b − a. LES PIÈGES : oublier
 *     de diviser, prendre la moyenne des valeurs aux bornes ;
 *   - LA LINÉARITÉ ET LA RELATION DE CHASLES. LES PIÈGES : un coefficient
 *     oublié ou mal signé, additionner au lieu de retrancher.
 *
 * Les coefficients sont choisis pour que les primitives et les intégrales
 * soient entières ou en fractions exactes ; tout est calculé ici.
 *
 * LE DESSIN (09/10/2026) : l'intégrale, l'aire et la valeur moyenne portent
 * un `visuel`, la courbe de f et l'aire entre la courbe et l'axe sur [a ; b],
 * qui se remplit — jamais la valeur cherchée. Le signe montre une courbe
 * quelconque du signe annoncé, et les bornes dans l'ordre où on les lit
 * (« de », « à »). Rien pour les primitives ni pour la linéarité : des règles
 * de calcul, pas une situation à dessiner.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'primitives-et-integrales', titre: 'Primitives et intégrales', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'Primitives et intégrales',
    accroche: 'Primitiver, ce n’est pas dériver.',
    competences: ['MATH_TLE_PRIMITIVES', 'MATH_TLE_INTEGRALE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ les outils */

const SUP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => SUP[c]).join('');
const entier = (n) => (n < 0 ? `−${-n}` : `${n}`);
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));

/** « −3/2 », « 4 » : irréductible, le signe devant. */
function frac(n, d) {
  const signe = Math.sign(n) * Math.sign(d);
  const g = pgcd(Math.abs(n), Math.abs(d)) || 1;
  const [p, q] = [Math.abs(n) / g, Math.abs(d) / g];
  const corps = q === 1 ? `${p}` : `${p}/${q}`;
  return signe < 0 ? `−${corps}` : corps;
}

/** « 3x² − x + 1 » à partir de [[3, 2], [−1, 1], [1, 0]]. */
function poly(termes) {
  let s = '';
  termes.filter(([c]) => c !== 0).forEach(([c, d]) => {
    const abs = Math.abs(c);
    let x = `x${sup(d)}`;
    if (d === 1) x = 'x';
    if (d === 0) x = '';
    const corps = d !== 0 && abs === 1 ? x : `${abs}${x}`;
    if (s === '') s = c < 0 ? `−${corps}` : corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}

const nonNul = (t, max) => {
  const v = t.entre(1, max);
  return t.entre(0, 1) ? v : -v;
};

const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
/** Deux valeurs égales : nombres, ou fonctions vues en quelques points. */
function memes(u, v) {
  if (Array.isArray(u) && Array.isArray(v)) return u.every((a, i) => proche(a, v[i]));
  if (typeof u === 'number' && typeof v === 'number') return proche(u, v);
  return u === v;
}

/** Les points où l'on compare deux fonctions (toutes définies pour x > 0). */
const POINTS = [0.5, 1.3, 2.7];
const enPoints = (f) => POINTS.map(f);

/**
 * Une manche à trois choix : la bonne réponse, deux pièges nommés (tirés
 * parmi ceux qui valent autre chose que la bonne réponse), des voisins sinon.
 * Chaque candidat est [libellé, valeur] ; un piège est [libellé, valeur, phrase].
 */
function manche(t, {
  consigne, question, bonne, pieges = [], voisins = [], aide, visuel,
}) {
  const liste = [bonne];
  const table = {};
  const dejaLa = ([l, v]) => liste.some(([l2, v2]) => l2 === l || memes(v2, v));
  t.melanger(pieges).forEach(([l, v, phrase]) => {
    if (liste.length < 3 && !dejaLa([l, v])) {
      liste.push([l, v]);
      table[l] = phrase;
    }
  });
  voisins.forEach((c) => { if (liste.length < 3 && !dejaLa(c)) liste.push(c); });
  const m = {
    consigne,
    question,
    choix: t.melanger(liste).map(([l]) => ({ cle: l, libelle: l })),
    bonne: bonne[0],
    pieges: table,
  };
  if (aide) m.aide = aide;
  if (visuel) m.visuel = visuel;
  return m;
}

const nombre = (v) => [entier(v), v];
const fraction = (n, d) => [frac(n, d), n / d];

/* ---------------------------------------------------- la primitive usuelle */

/** Un polynôme [[coef, degré]…] en fonction. */
const enFonction = (termes) => (x) => termes.reduce((s, [c, d]) => s + c * x ** d, 0);
const candidatPoly = (termes) => [poly(termes), enPoints(enFonction(termes))];

function primitive(t) {
  if (t.entre(1, 3) <= 2) {
    const n = t.entre(1, 3);
    const alpha = nonNul(t, 3);
    const a = (n + 1) * alpha;
    const c = nonNul(t, 5);
    return manche(t, {
      consigne: 'primitive',
      question: `f(x) = ${poly([[a, n], [c, 0]])}\nUne primitive F de f ?`,
      bonne: candidatPoly([[alpha, n + 1], [c, 1]]),
      pieges: [
        [...candidatPoly([[n * a, n - 1]]), 'deriver-pas-primitiver'],
        [...candidatPoly([[a, n + 1], [c, 1]]), 'diviser-par-n-plus-un'],
        [...candidatPoly([[alpha, n + 1], [c, 0]]), 'primitive-constante'],
      ],
      voisins: [candidatPoly([[alpha, n + 1], [c + 1, 1]])],
      aide: 'primitive-regle',
    });
  }
  // a / x² = a x⁻², de primitive −a / x.
  const a = nonNul(t, 6);
  return manche(t, {
    consigne: 'primitive',
    question: `f(x) = ${entier(a)}/x², sur ]0 ; +∞[\nUne primitive F de f ?`,
    bonne: [`${entier(-a)}/x`, enPoints((x) => -a / x)],
    pieges: [
      [`${entier(a)}/x`, enPoints((x) => a / x), 'signe-inverse'],
      [`${entier(-2 * a)}/x³`, enPoints((x) => (-2 * a) / x ** 3), 'deriver-pas-primitiver'],
    ],
    voisins: [[`${entier(-a)}/x²`, enPoints((x) => -a / x ** 2)]],
    aide: 'primitive-regle',
  });
}

/* ------------------------------------------------- les formes composées */

function composee(t, sorte) {
  if (sorte === 'exp') {
    const a = t.au([2, 3, 4, 5, -2, -3]);
    const e = `e^(${poly([[a, 1]])})`;
    const E = (x) => Math.exp(a * x);
    const pieges = [
      [`${entier(a)}${e}`, enPoints((x) => a * E(x)), 'deriver-pas-primitiver'],
      [e, enPoints(E), 'diviser-par-a'],
    ];
    if (a < 0) pieges.push([`${e}/${-a}`, enPoints((x) => E(x) / -a), 'diviser-par-a']);
    return manche(t, {
      consigne: 'composee',
      question: `f(x) = ${e}\nUne primitive F de f ?`,
      bonne: [a > 0 ? `${e}/${a}` : `−${e}/${-a}`, enPoints((x) => E(x) / a)],
      pieges,
      voisins: [[`${e}/${Math.abs(a) + 1}`, enPoints((x) => E(x) / (Math.abs(a) + 1))]],
      aide: 'composee-regle',
    });
  }
  const a = t.entre(1, 3);
  const du = poly([[2 * a, 1]]);
  const dU = (x) => 2 * a * x;
  if (sorte === 'u-prime-e-u') {
    const u = poly([[a, 2]]);
    const E = (x) => Math.exp(a * x * x);
    return manche(t, {
      consigne: 'composee',
      question: `f(x) = ${du} e^(${u})\nUne primitive F de f ?`,
      bonne: [`e^(${u})`, enPoints(E)],
      pieges: [
        [`${u} e^(${u})`, enPoints((x) => a * x * x * E(x)), 'primitive-facteur'],
        [`e^(${u})/(${du})`, enPoints((x) => E(x) / dU(x)), 'diviser-par-u-prime'],
      ],
      voisins: [[`e^(${u})/${2 * a}`, enPoints((x) => E(x) / (2 * a))]],
      aide: 'composee-regle',
    });
  }
  const c = t.entre(1, 5);
  const u = poly([[a, 2], [c, 0]]);
  const U = (x) => a * x * x + c;
  if (sorte === 'u-prime-sur-u') {
    return manche(t, {
      consigne: 'composee',
      question: `f(x) = ${du} / (${u})\nUne primitive F de f ?`,
      bonne: [`ln(${u})`, enPoints((x) => Math.log(U(x)))],
      pieges: [
        [`ln(${du})`, enPoints((x) => Math.log(dU(x))), 'u-prime-sur-u'],
        [`${du} ln(${u})`, enPoints((x) => dU(x) * Math.log(U(x))), 'primitive-facteur'],
      ],
      voisins: [[`1 / (${u})`, enPoints((x) => 1 / U(x))]],
      aide: 'composee-regle',
    });
  }
  // u′ uⁿ, de primitive uⁿ⁺¹ / (n + 1).
  const n = t.entre(2, 3);
  const k = n + 1;
  return manche(t, {
    consigne: 'composee',
    question: `f(x) = ${du}(${u})${sup(n)}\nUne primitive F de f ?`,
    bonne: [`(${u})${sup(k)}/${k}`, enPoints((x) => U(x) ** k / k)],
    pieges: [
      [`(${u})${sup(k)}`, enPoints((x) => U(x) ** k), 'diviser-par-n-plus-un'],
      [`${du}(${u})${sup(k)}/${k}`, enPoints((x) => (dU(x) * U(x) ** k) / k), 'garder-u-prime'],
    ],
    voisins: [[`(${u})${sup(k)}/${n}`, enPoints((x) => U(x) ** k / n)]],
    aide: 'composee-regle',
  });
}

/* ----------------------------------------------------------- l'intégrale */

/**
 * f(x) = 3P x² + 2Q x + r, de primitive F(x) = P x³ + Q x² + r x : tout est
 * entier. Les bornes a < b, entre −2 et 3.
 */
function trinome(t, { constant = false } = {}) {
  let P;
  let Q;
  let r;
  if (constant) {
    // De signe constant : 3P x² + r, avec P et r de même signe.
    P = nonNul(t, 2);
    Q = 0;
    r = Math.sign(P) * t.entre(1, 4);
  } else {
    do {
      P = t.entre(-2, 2);
      Q = t.entre(-2, 2);
      r = t.entre(-4, 4);
    } while (P === 0 && Q === 0);
  }
  const termes = [[3 * P, 2], [2 * Q, 1], [r, 0]];
  return {
    texte: poly(termes),
    f: enFonction(termes),
    F: enFonction([[P, 3], [Q, 2], [r, 1]]),
    coefs: [r, 2 * Q, 3 * P],
  };
}

/**
 * Le dessin : la courbe de f un peu au-delà de [a ; b], l'axe des abscisses
 * toujours en vue, et l'aire entre les deux sur [a ; b].
 */
function dessin({ f, coefs }, a, b) {
  const [xmin, xmax] = [a - 0.5, b + 0.5];
  const ys = Array.from({ length: 41 }, (_, i) => f(xmin + ((xmax - xmin) * i) / 40));
  const [lo, hi] = [Math.min(0, ...ys), Math.max(0, ...ys)];
  const air = Math.max(1, (hi - lo) * 0.1);
  return {
    type: 'courbe',
    fenetre: {
      xmin, xmax, ymin: Math.floor(lo - air), ymax: Math.ceil(hi + air),
    },
    fonctions: [{ forme: 'poly', coefs, etiquette: 'f' }],
    aire: { fonction: 0, a, b },
  };
}

function bornes(t, ecart = 1) {
  const a = t.entre(-2, 3 - ecart);
  return [a, t.entre(a + ecart, 3)];
}

const integ = (a, b, g = 'f(x)') => `∫ de ${entier(a)} à ${entier(b)} de ${g} dx`;

function integrale(t) {
  const tri = trinome(t);
  const { texte, f, F } = tri;
  const [a, b] = bornes(t);
  const I = F(b) - F(a);
  const pieges = [
    [...nombre(F(a) - F(b)), 'bornes-ordre'],
    [...nombre(f(b) - f(a)), 'integrale-pas-f'],
  ];
  if (a !== 0) pieges.push([...nombre(F(b)), 'primitive-en-a']);
  return manche(t, {
    consigne: 'integrale',
    question: `${integ(a, b, `(${texte})`)} = ?`,
    bonne: nombre(I),
    pieges,
    voisins: [nombre(I + 1), nombre(I - 1), nombre(I + 2)],
    aide: 'integrale-regle',
    visuel: dessin(tri, a, b),
  });
}

function aire(t) {
  const tri = trinome(t, { constant: true });
  const { texte, f, F } = tri;
  const [a, b] = bornes(t);
  const I = F(b) - F(a);
  const A = Math.abs(I);
  const pieges = [
    [...nombre(-A), 'aire-positive'],
    [...nombre(f(b) - f(a)), 'integrale-pas-f'],
  ];
  if (a !== 0) pieges.push([...nombre(F(b)), 'primitive-en-a']);
  return manche(t, {
    consigne: 'aire',
    question: `f(x) = ${texte}\nAire du domaine entre la courbe, l’axe des abscisses\net les droites x = ${entier(a)} et x = ${entier(b)} (en u.a.) ?`,
    bonne: nombre(A),
    pieges,
    voisins: [nombre(A + 1), nombre(A + 2), nombre(A + 3)],
    aide: 'aire-regle',
    visuel: dessin(tri, a, b),
  });
}

/* ----------------------------------------------------------- le signe */

const POSITIF = '≥ 0';
const NEGATIF = '≤ 0';
const RIEN = 'On ne peut pas conclure';

function signe(t) {
  const lo = t.entre(-4, 3);
  const hi = lo + t.entre(1, 5);
  const positive = t.entre(0, 1) === 1;
  const envers = t.entre(0, 2) === 0;
  const [bas, haut] = envers ? [hi, lo] : [lo, hi];
  const bonne = positive !== envers ? POSITIF : NEGATIF;
  const autre = bonne === POSITIF ? NEGATIF : POSITIF;
  // Une courbe quelconque du signe annoncé, seulement sur [lo ; hi], et les
  // bornes de l'intégrale dans l'ordre où on les lit : « de », puis « à ».
  const s = positive ? 1 : -1;
  const L = hi - lo;
  return manche(t, {
    consigne: 'signe',
    question: `f est continue et ${positive ? 'positive' : 'négative'} sur [${entier(lo)} ; ${entier(hi)}].\nSigne de ${integ(bas, haut)} ?`,
    bonne: [bonne, bonne],
    pieges: [[autre, autre, envers ? 'bornes-inversees' : 'signe-integrale'], [RIEN, RIEN, 'positivite']],
    aide: 'signe-regle',
    visuel: {
      type: 'courbe',
      fenetre: {
        xmin: lo - 1, xmax: hi + 1, ymin: positive ? -1 : -3, ymax: positive ? 3 : 1,
      },
      // Sans étiquette : le dessinateur la pose en bout de fenêtre, là où f n'est pas définie.
      fonctions: [{ forme: 'morceaux', points: [[lo, 1.2 * s], [lo + L / 3, 2.4 * s], [lo + (2 * L) / 3, 1.5 * s], [hi, 2.1 * s]] }],
      aire: { fonction: 0, a: bas, b: haut },
      points: [{ x: bas, y: 0, etiquette: 'de' }, { x: haut, y: 0, etiquette: 'à' }],
    },
  });
}

/* --------------------------------------------------- la valeur moyenne */

function moyenne(t) {
  const tri = trinome(t);
  const { texte, f, F } = tri;
  const [a, b] = bornes(t, 2);
  const I = F(b) - F(a);
  const L = b - a;
  return manche(t, {
    consigne: 'moyenne',
    question: `f(x) = ${texte}\nValeur moyenne de f sur [${entier(a)} ; ${entier(b)}] ?`,
    bonne: fraction(I, L),
    pieges: [
      [...fraction(I, 1), 'moyenne-diviser'],
      [...fraction(f(a) + f(b), 2), 'moyenne-pas-milieu'],
    ],
    voisins: [fraction(I + 1, L), fraction(I - 1, L), fraction(I + 2, L)],
    aide: 'moyenne-regle',
    visuel: dessin(tri, a, b),
  });
}

/* ------------------------------------------- la linéarité et Chasles */

function linearite(t) {
  if (t.entre(0, 1)) {
    const [a, b] = bornes(t);
    const A = nonNul(t, 9);
    const B = nonNul(t, 9);
    const alpha = t.entre(2, 5);
    const beta = t.au([-3, -2, -1, 2, 3]);
    const g = `${beta < 0 ? '−' : '+'} ${Math.abs(beta) === 1 ? '' : Math.abs(beta)}g(x)`;
    return manche(t, {
      consigne: 'linearite',
      question: `${integ(a, b)} = ${entier(A)}\n${integ(a, b, 'g(x)')} = ${entier(B)}\n${integ(a, b, `(${alpha}f(x) ${g})`)} = ?`,
      bonne: nombre(alpha * A + beta * B),
      pieges: [
        [...nombre(alpha * A + B * Math.sign(beta)), 'linearite-coefficient'],
        [...nombre(A + beta * B), 'linearite-coefficient'],
        [...nombre(alpha * A - beta * B), 'signe-coefficient'],
      ],
      voisins: [nombre(alpha * A + beta * B + 1), nombre(alpha * A + beta * B - 1)],
      aide: 'linearite-regle',
    });
  }
  const c = t.entre(-2, 1);
  const d = c + t.entre(1, 3);
  const e = d + t.entre(1, 3);
  const A = nonNul(t, 12);
  let B;
  do B = nonNul(t, 9); while (B === A);
  return manche(t, {
    consigne: 'linearite',
    question: `${integ(c, e)} = ${entier(A)}\n${integ(c, d)} = ${entier(B)}\n${integ(d, e)} = ?`,
    bonne: nombre(A - B),
    pieges: [[...nombre(A + B), 'chasles'], [...nombre(B - A), 'bornes-ordre']],
    voisins: [nombre(A - B + 1), nombre(A - B - 1)],
    aide: 'linearite-regle',
  });
}

/* ------------------------------------------------------------- la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const [c1, c2] = t.melanger(['exp', 'u-prime-e-u', 'u-prime-sur-u', 'u-prime-u-n']);
  const liste = [
    primitive(t), composee(t, c1), composee(t, c2),
    integrale(t), aire(t), signe(t),
    moyenne(t), linearite(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  primitive: 'Trouve une primitive de cette fonction.',
  composee: 'Reconnais la forme, et trouve une primitive.',
  integrale: 'Calcule cette intégrale à l’aide d’une primitive.',
  aire: 'Calcule cette aire, en unités d’aire.',
  signe: 'Quel est le signe de cette intégrale ?',
  moyenne: 'Calcule la valeur moyenne de la fonction sur cet intervalle.',
  linearite: 'Calcule cette intégrale à partir de celles qu’on connaît.',

  'deriver-pas-primitiver': 'Tu as dérivé : on cherche une fonction dont la dérivée est f. Vérifie toujours en dérivant ta réponse.',
  'diviser-par-n-plus-un': 'Une primitive de x puissance n est x puissance n plus un, divisé par n plus un : n’oublie pas de diviser.',
  'primitive-constante': 'Une primitive d’une constante c est c fois x, pas c : dérive ta réponse pour le vérifier.',
  'signe-inverse': 'Une primitive de un sur x carré est moins un sur x : n’oublie pas le signe moins, dérive pour vérifier.',
  'diviser-par-a': 'Une primitive de e puissance a x est e puissance a x divisé par a, avec le signe de a : dérive pour vérifier.',
  'primitive-facteur': 'On ne primitive pas facteur par facteur : reconnais une forme du cours, comme u prime fois e puissance u.',
  'diviser-par-u-prime': 'On ne divise pas par u prime, qui dépend de x : u prime fois e puissance u a pour primitive e puissance u, tout simplement.',
  'u-prime-sur-u': 'Reconnais u prime sur u : sa primitive est le logarithme de u, le dénominateur, pas du numérateur.',
  'garder-u-prime': 'Dans la forme u prime fois u puissance n, u prime est absorbé par la primitive : il ne reste pas devant.',
  'bornes-ordre': 'Une intégrale se calcule F de la borne du haut moins F de la borne du bas, dans cet ordre.',
  'integrale-pas-f': 'On ne calcule pas f aux bornes, mais une primitive F : l’intégrale est F de b moins F de a.',
  'primitive-en-a': 'N’oublie pas de retrancher F de la borne du bas, même quand elle paraît petite.',
  'aire-positive': 'Une aire est toujours positive : si la courbe est sous l’axe, l’aire est l’opposé de l’intégrale.',
  'bornes-inversees': 'Quand la borne du bas est plus grande que celle du haut, l’intégrale change de signe.',
  'signe-integrale': 'Avec des bornes dans l’ordre croissant, l’intégrale a le signe de la fonction.',
  positivite: 'Le signe de la fonction et l’ordre des bornes suffisent pour conclure : c’est la positivité de l’intégrale.',
  'moyenne-diviser': 'La valeur moyenne, c’est l’intégrale divisée par la longueur de l’intervalle : n’oublie pas de diviser.',
  'moyenne-pas-milieu': 'La valeur moyenne n’est pas la moyenne des valeurs aux bornes : c’est l’intégrale divisée par la longueur de l’intervalle.',
  'linearite-coefficient': 'Chaque coefficient multiplie sa propre intégrale : applique la linéarité terme à terme.',
  'signe-coefficient': 'Garde le signe du coefficient devant g : il multiplie l’intégrale de g avec son signe.',
  chasles: 'Relation de Chasles : l’intégrale sur le grand intervalle est la somme des intégrales sur les deux morceaux. Pour un morceau, on retranche.',

  'primitive-regle': 'Pour vérifier une primitive, dérive-la : tu dois retrouver f.',
  'composee-regle': 'Reconnais la forme du cours : u prime fois e puissance u, u prime sur u, ou u prime fois u puissance n.',
  'integrale-regle': 'Trouve une primitive F, puis calcule F de la borne du haut moins F de la borne du bas.',
  'aire-regle': 'L’aire est l’intégrale de la fonction si elle est positive, son opposé si elle est négative.',
  'signe-regle': 'Fonction positive et bornes dans l’ordre croissant : l’intégrale est positive. Chaque inversion change le signe.',
  'moyenne-regle': 'La valeur moyenne est l’intégrale sur l’intervalle, divisée par sa longueur.',
  'linearite-regle': 'Les coefficients sortent de l’intégrale, et les intervalles se recollent avec la relation de Chasles.',
};
