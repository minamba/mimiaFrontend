/**
 * LA DÉRIVATION — Nora, en 1re générale (spécialité mathématiques).
 *
 * Huit sortes de manches, une par partie, dans le désordre ; toutes les
 * dérivées et toutes les tangentes sont CALCULÉES ici :
 *   - les dérivées usuelles : xⁿ, k xⁿ, 1/x, k/x, √x, k√x. PIÈGES : n xⁿ
 *     (l'exposant non diminué), xⁿ⁻¹ (le coefficient oublié), 1/x² sans le
 *     moins, 1/√x au lieu de 1/(2√x), la constante k perdue ;
 *   - un polynôme de degré trois. PIÈGES : la constante gardée, les
 *     exposants non descendus ;
 *   - le produit (uv)′ = u′v + uv′. PIÈGES : (uv)′ = u′v′, et u′v − uv′ ;
 *   - le quotient (u/v)′ = (u′v − uv′)/v² et l'inverse (1/v)′ = −v′/v².
 *     PIÈGES : uv′ − u′v (l'ordre), u′/v′, le signe moins oublié, la dérivée
 *     de v oubliée ;
 *   - le nombre dérivé calculé. PIÈGES : l'image f(a) au lieu de f′(a) ;
 *   - le nombre dérivé lu sur une tangente. PIÈGES : la pente à l'envers,
 *     l'ordonnée du point ;
 *   - l'équation de la tangente y = f′(a)(x − a) + f(a). PIÈGES : y = f′(a)x
 *     + f(a), f(a) et f′(a) échangés ;
 *   - le signe de f′ et les variations. PIÈGES : « f′ négative » lu comme
 *     « f négative », le sens de variation inversé.
 *
 * LE DESSIN (09/10/2026) : quatre sortes portent un `visuel` (voir
 * `lib/jeux/visuels.js`), construit avec les valeurs de la question et sans
 * aucun tirage — la même graine redonne la même partie :
 *   - le nombre dérivé : la parabole, le point A et sa tangente (une pente,
 *     pas une hauteur) ;
 *   - le nombre dérivé lu : A, B et la tangente qu'il faut lire ; la courbe
 *     n'étant pas donnée, une parabole qui la touche en A ;
 *   - la tangente de x² + bx + c : la parabole et le point A, sans la tangente
 *     (c'est elle qu'on cherche) ; pas de dessin quand seuls f(a) et f′(a)
 *     sont donnés, il n'y aurait pas de courbe ;
 *   - les variations : la courbe de f′ sur l'intervalle, ses racines marquées.
 * Les dérivées à écrire (usuelles, polynôme, produit, quotient) n'ont pas de
 * dessin : ce sont des calculs.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';
import { valeur as ordonneeEn } from '../visuels.js';

export const FAMILLE = { cle: 'derivation', titre: 'La dérivation', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'La dérivation',
    accroche: 'Dérivées, tangentes et variations.',
    competences: [
      'MATH_1RE_DERIV_GRAPHIQUE', 'MATH_1RE_DERIV_NOMBRE', 'MATH_1RE_DERIV_REFERENCE',
      'MATH_1RE_DERIV_FONCTION', 'MATH_1RE_DERIV_VARIATION',
    ],
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

const EXPOSANTS = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => EXPOSANTS[c]).join('');

/** « 3x² − 2x + 5 » : coefficients du plus haut degré au plus bas. */
function poly(coefs) {
  const deg = coefs.length - 1;
  let s = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const k = deg - i;
    const lettre = k === 0 ? '' : `x${k > 1 ? sup(k) : ''}`;
    const abs = Math.abs(c);
    const corps = abs === 1 && k > 0 ? lettre : `${nb(abs)}${lettre}`;
    if (s === '') s = (c < 0 ? '−' : '') + corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}
/** Un seul terme c xᵏ : « 5x⁴ », « x », « −2 ». */
const mono = (c, k) => poly([c, ...Array(k).fill(0)]);
/** « 3x − 2 », « −x + 4 », « 2x », « 5 » */
const affine = (a, b) => poly([a, b]);

/* ------------------------------------------------------------ les dessins */

// « + 0 » : jamais de −0, qu’un aller-retour JSON ne redonnerait pas.
const arrondi = (x) => Math.round(x * 100) / 100 + 0;

/** [a, b, c] (du plus haut degré au plus bas, comme `poly`) → la fonction dessinée. */
const trace = (coefs, etiquette) => ({ forme: 'poly', coefs: [...coefs].reverse().map((c) => c + 0), ...(etiquette ? { etiquette } : {}) });

/** Une parabole qui passe par (x0 ; y0) avec la pente donnée — quand la courbe de f n'est pas donnée. */
const paraboleTangente = (x0, y0, pente) => trace([0.5, pente - x0, y0 - pente * x0 + (x0 * x0) / 2]);

/** Un dessin de courbes sur [xmin ; xmax] : la fenêtre se cale sur les fonctions, les points et l'axe des x. */
function dessin(xmin, xmax, fonctions, autres = {}) {
  const ys = [0, ...(autres.points ?? []).map((p) => p.y)];
  fonctions.forEach((f) => {
    for (let i = 0; i <= 48; i += 1) ys.push(ordonneeEn(f, xmin + ((xmax - xmin) * i) / 48));
  });
  const air = Math.max((Math.max(...ys) - Math.min(...ys)) * 0.1, 0.5);
  return {
    type: 'courbe',
    fenetre: {
      xmin: arrondi(xmin), xmax: arrondi(xmax), ymin: arrondi(Math.min(...ys) - air), ymax: arrondi(Math.max(...ys) + air),
    },
    fonctions,
    ...autres,
  };
}

/* ---------------------------------------------------------- les manches */

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche : la bonne réponse, ses pièges nommés (jamais justes), des voisins s'il en manque. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && v !== undefined && String(v) !== b);
  const liste = troisChoix(b, valides.map(([v]) => String(v)), (k) => String(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = String(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  return {
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
}

const nonNul = (entre, a, b) => {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
};

const derivee = (f) => `f(x) = ${f} ; f′(x) = ?`;

/* ------------------------------------------------------- dérivées usuelles */

function usuelles({ au, entre, melanger }) {
  const sorte = au(['puissance', 'k-puissance', 'inverse', 'k-inverse', 'racine', 'k-racine']);
  if (sorte === 'puissance') {
    const n = entre(2, 7);
    return manche(melanger, {
      consigne: 'usuelles',
      question: derivee(mono(1, n)),
      bonne: mono(n, n - 1),
      pieges: [[mono(n, n), 'puissance-moins-un'], [mono(1, n - 1), 'puissance-coefficient']],
      voisin: (k) => mono(n + k, n - 1),
    });
  }
  if (sorte === 'k-puissance') {
    const c = entre(2, 6);
    const n = entre(2, 5);
    return manche(melanger, {
      consigne: 'usuelles',
      question: derivee(mono(c, n)),
      bonne: mono(c * n, n - 1),
      pieges: [[mono(c * n, n), 'puissance-moins-un'], [mono(c, n - 1), 'puissance-coefficient']],
      voisin: (k) => mono(c * n + k, n - 1),
    });
  }
  if (sorte === 'inverse') {
    return manche(melanger, {
      consigne: 'usuelles',
      question: derivee('1/x'),
      bonne: '−1/x²',
      pieges: [['1/x²', 'inverse-signe'], ['−1/x', 'inverse-carre']],
      voisin: (k) => `−${k + 1}/x²`,
    });
  }
  if (sorte === 'k-inverse') {
    const c = entre(2, 9);
    return manche(melanger, {
      consigne: 'usuelles',
      question: derivee(`${c}/x`),
      bonne: `−${c}/x²`,
      pieges: [[`${c}/x²`, 'inverse-signe'], ['−1/x²', 'constante-multiplicative']],
      voisin: (k) => `−${c + k}/x²`,
    });
  }
  if (sorte === 'racine') {
    return manche(melanger, {
      consigne: 'usuelles',
      question: derivee('√x'),
      bonne: '1/(2√x)',
      pieges: [['1/√x', 'racine-deux'], ['2√x', 'racine-inverse']],
      voisin: (k) => `${k + 1}/(2√x)`,
    });
  }
  const c = au([3, 5, 7]);
  return manche(melanger, {
    consigne: 'usuelles',
    question: derivee(`${c}√x`),
    bonne: `${c}/(2√x)`,
    pieges: [[`${c}/√x`, 'racine-deux'], ['1/(2√x)', 'constante-multiplicative']],
    voisin: (k) => `${c + 2 * k}/(2√x)`,
  });
}

/* ---------------------------------------------------------------- polynôme */

function polynome({ entre, melanger }) {
  const a = nonNul(entre, -4, 4);
  const b = nonNul(entre, -6, 6);
  const c = nonNul(entre, -9, 9);
  const d = nonNul(entre, -9, 9);
  return manche(melanger, {
    consigne: 'polynome',
    question: derivee(poly([a, b, c, d])),
    bonne: poly([3 * a, 2 * b, c]),
    pieges: melanger([
      [poly([3 * a, 2 * b, c + d]), 'constante-derivee-nulle'],
      [poly([a, b, c]), 'puissance-coefficient'],
      [poly([3 * a, 2 * b, c, 0]), 'puissance-moins-un'],
    ]),
    voisin: (k) => poly([3 * a, 2 * b + k, c]),
  });
}

/* ------------------------------------------------------------------ produit */

function produit({ entre, melanger }) {
  const a = entre(1, 3);
  const b = nonNul(entre, -6, 6);
  const c = entre(1, 3);
  const d = nonNul(entre, -6, 6);
  // f = (ax + b)(cx² + d) ; f′ = a(cx² + d) + (ax + b)(2cx)
  return manche(melanger, {
    consigne: 'produit',
    question: derivee(`(${affine(a, b)})(${poly([c, 0, d])})`),
    bonne: poly([3 * a * c, 2 * b * c, a * d]),
    pieges: [[mono(2 * a * c, 1), 'produit-des-derivees'], [poly([-a * c, -2 * b * c, a * d]), 'produit-signe']],
    voisin: (k) => poly([3 * a * c, 2 * b * c + k, a * d]),
  });
}

/* ----------------------------------------------------------------- quotient */

function quotient({ au, entre, melanger }) {
  const sorte = au(['u-sur-v', 'u-sur-v', 'inverse-carre', 'inverse-affine']);
  if (sorte === 'u-sur-v') {
    let a;
    let b;
    let c;
    let d;
    do {
      a = entre(1, 3);
      c = entre(1, 3);
      b = nonNul(entre, -6, 6);
      d = nonNul(entre, -6, 6);
    } while (a * d - b * c === 0);
    const v = affine(c, d);
    const num = a * d - b * c;
    return manche(melanger, {
      consigne: 'quotient',
      question: derivee(`(${affine(a, b)})/(${v})`),
      bonne: `${nb(num)}/(${v})²`,
      pieges: [[`${nb(-num)}/(${v})²`, 'quotient-ordre'], [fr(a, c), 'quotient-des-derivees']],
      voisin: (k) => `${nb(num + k)}/(${v})²`,
    });
  }
  if (sorte === 'inverse-carre') {
    const k0 = entre(1, 9);
    const v = poly([1, 0, k0]);
    return manche(melanger, {
      consigne: 'quotient',
      question: derivee(`1/(${v})`),
      bonne: `−2x/(${v})²`,
      pieges: [[`2x/(${v})²`, 'inverse-signe'], ['1/(2x)', 'inverse-des-derivees']],
      voisin: (k) => `−${2 + k}x/(${v})²`,
    });
  }
  const a = entre(2, 4);
  const b = nonNul(entre, -6, 6);
  const v = affine(a, b);
  return manche(melanger, {
    consigne: 'quotient',
    question: derivee(`1/(${v})`),
    bonne: `−${a}/(${v})²`,
    pieges: [[`${a}/(${v})²`, 'inverse-signe'], [`−1/(${v})²`, 'inverse-derivee-interieure']],
    voisin: (k) => `−${a + k}/(${v})²`,
  });
}

/* ---------------------------------------------------------- nombre dérivé */

function nombreDerive({ entre, melanger }) {
  const a = nonNul(entre, -4, 4);
  const b = entre(-6, 6);
  const c = entre(-9, 9);
  const x0 = nonNul(entre, -3, 3);
  const bonne = 2 * a * x0 + b;
  const image = a * x0 * x0 + b * x0 + c;
  const m = manche(melanger, {
    consigne: 'nombre-derive',
    question: `f(x) = ${poly([a, b, c])} ; f′(${nb(x0)}) = ?`,
    bonne: nb(bonne),
    pieges: [[nb(image), 'image-pas-derive'], [nb(a * x0 + b), 'puissance-coefficient']],
    voisin: (k) => nb(bonne + k),
  });
  // Le nombre dérivé, c'est la pente de la tangente en A — pas la hauteur de A.
  return {
    ...m,
    visuel: dessin(x0 - 2.5, x0 + 2.5, [trace([a, b, c])], {
      points: [{ x: x0, y: image, etiquette: 'A' }],
      tangente: { x: x0, y: image, pente: bonne },
    }),
  };
}

function nombreDeriveLu({ entre, melanger }) {
  const x0 = entre(-3, 3);
  const y0 = entre(-4, 4);
  const dx = entre(1, 3);
  let dy;
  do dy = nonNul(entre, -6, 6); while (Math.abs(dy) === dx);
  const m = manche(melanger, {
    consigne: 'nombre-derive-lu',
    question: `La tangente à la courbe de f au point A(${nb(x0)} ; ${nb(y0)}) passe par B(${nb(x0 + dx)} ; ${nb(y0 + dy)}). f′(${nb(x0)}) = ?`,
    bonne: fr(dy, dx),
    pieges: [[fr(dx, dy), 'pente-inverse'], [nb(y0), 'image-pas-derive']],
    voisin: (k) => fr(dy + k, dx),
  });
  // La tangente à lire, par A et B ; la courbe n'est pas donnée : une parabole qui la touche en A.
  return {
    ...m,
    visuel: dessin(x0 - 2, x0 + dx + 1.5, [paraboleTangente(x0, y0, dy / dx)], {
      points: [{ x: x0, y: y0, etiquette: 'A' }, { x: x0 + dx, y: y0 + dy, etiquette: 'B' }],
      tangente: { x: x0, y: y0, pente: dy / dx },
    }),
  };
}

/* ---------------------------------------------------------------- tangente */

function tangente({ au, entre, melanger }) {
  const a = nonNul(entre, -3, 3);
  let fa;
  let m;
  let question;
  // La parabole x² + bx + c quand elle est donnée, pour le dessin.
  let courbe = null;
  if (au([true, false])) {
    fa = entre(-6, 6);
    m = nonNul(entre, -5, 5);
    question = `f(${nb(a)}) = ${nb(fa)} et f′(${nb(a)}) = ${nb(m)}. Tangente au point d’abscisse ${nb(a)} ?`;
  } else {
    const b = entre(-5, 5);
    const c = entre(-5, 5);
    fa = a * a + b * a + c;
    m = 2 * a + b;
    question = `f(x) = ${poly([1, b, c])} ; tangente au point d’abscisse ${nb(a)} ?`;
    courbe = trace([1, b, c]);
  }
  const y = (pente, p) => `y = ${affine(pente, p)}`;
  const resultat = manche(melanger, {
    consigne: 'tangente',
    question,
    bonne: y(m, fa - m * a),
    pieges: [[y(m, fa), 'tangente-formule'], [y(fa, m - fa * a), 'tangente-echange']],
    voisin: (k) => y(m, fa - m * a + k),
  });
  if (!courbe) return resultat;
  // La parabole et le point de contact A ; la tangente n'est pas tracée : c'est elle qu'on cherche.
  return {
    ...resultat,
    visuel: dessin(a - 3, a + 3, [courbe], { points: [{ x: a, y: fa, etiquette: 'A' }] }),
  };
}

/* --------------------------------------------------------------- variations */

function variations({ au, entre, melanger }) {
  let expr;
  let A;
  let B;
  let positif;
  // f′ et ses racines, pour le dessin.
  let fPrime;
  let racines;
  if (au([true, false])) {
    const k = au([1, 2, 3, -1, -2, -3]);
    const x1 = entre(-5, 2);
    const x2 = x1 + entre(2, 5);
    fPrime = [k, -k * (x1 + x2), k * x1 * x2];
    racines = [x1, x2];
    const ou = au(['entre', 'droite', 'gauche']);
    if (ou === 'entre') [A, B] = [x1, x2];
    else if (ou === 'droite') [A, B] = [x2, x2 + entre(2, 4)];
    else [A, B] = [x1 - entre(2, 4), x1];
    // Entre les racines, f′ a le signe de −k ; à l'extérieur, celui de k.
    positif = ou === 'entre' ? k < 0 : k > 0;
    const facteur = (r) => {
      if (r === 0) return 'x';
      return r > 0 ? `(x − ${nb(r)})` : `(x + ${nb(-r)})`;
    };
    const facteurs = x2 === 0 ? `x${facteur(x1)}` : `${facteur(x1)}${facteur(x2)}`;
    expr = `${{ 1: '', '-1': '−' }[k] ?? nb(k)}${facteurs}`;
  } else {
    const a = au([1, 2, 3, -1, -2, -3]);
    const r = entre(-5, 5);
    expr = affine(a, -a * r);
    fPrime = [a, -a * r];
    racines = [r];
    if (au([true, false])) {
      [A, B] = [r, r + entre(2, 5)];
      positif = a > 0;
    } else {
      [A, B] = [r - entre(2, 5), r];
      positif = a < 0;
    }
  }
  const bonne = positif ? 'croissante' : 'décroissante';
  return {
    consigne: 'variations',
    question: `f′(x) = ${expr}. Sur [${nb(A)} ; ${nb(B)}], on peut affirmer que f est…`,
    choix: cartes(melanger(['croissante', 'décroissante', positif ? 'positive' : 'négative'])),
    bonne,
    pieges: {
      [positif ? 'décroissante' : 'croissante']: 'derivee-signe-variations',
      [positif ? 'positive' : 'négative']: 'derivee-pas-signe-de-f',
    },
    // La courbe de f′ (pas de f !) sur l'intervalle seul : son signe s'y lit.
    visuel: dessin(A, B, [trace(fPrime, 'f′')], {
      points: racines.filter((x) => x >= A && x <= B).map((x) => ({ x, y: 0 })),
    }),
  };
}

/* ------------------------------------------------------------ la partie */

const SORTES = [usuelles, polynome, produit, quotient, nombreDerive, nombreDeriveLu, tangente, variations];

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
  usuelles: 'Dérive cette fonction de référence.',
  polynome: 'Dérive ce polynôme.',
  produit: 'Dérive ce produit.',
  quotient: 'Dérive ce quotient.',
  'nombre-derive': 'Calcule ce nombre dérivé.',
  'nombre-derive-lu': 'Lis le nombre dérivé sur la tangente.',
  tangente: 'Trouve l’équation de la tangente.',
  variations: 'Du signe de f prime, déduis les variations de f.',

  'puissance-moins-un': 'La dérivée de x puissance n, c’est n fois x puissance n moins un : l’exposant diminue de un.',
  'puissance-coefficient': 'L’exposant descend devant : il multiplie le coefficient.',
  'inverse-signe': 'La dérivée de un sur x est moins un sur x au carré : n’oublie pas le signe moins.',
  'inverse-carre': 'La dérivée de un sur x a x au carré au dénominateur.',
  'constante-multiplicative': 'Un nombre en facteur reste en facteur : la dérivée de k fois u, c’est k fois u prime.',
  'racine-deux': 'La dérivée de racine de x est un sur deux racine de x : n’oublie pas le deux.',
  'racine-inverse': 'La dérivée de racine de x est un sur deux racine de x : c’est une fraction.',
  'constante-derivee-nulle': 'La dérivée d’une constante est nulle : le terme constant disparaît.',
  'produit-des-derivees': 'La dérivée d’un produit n’est pas le produit des dérivées : u prime v, plus u v prime.',
  'produit-signe': 'Pour un produit, c’est u prime v plus u v prime ; le moins, c’est pour le quotient.',
  'quotient-ordre': 'Au numérateur, u prime v moins u v prime, dans cet ordre.',
  'quotient-des-derivees': 'La dérivée d’un quotient n’est pas le quotient des dérivées : u prime v moins u v prime, sur v au carré.',
  'inverse-des-derivees': 'La dérivée de un sur v, c’est moins v prime sur v au carré.',
  'inverse-derivee-interieure': 'Moins v prime sur v au carré : n’oublie pas de multiplier par la dérivée de v.',
  'image-pas-derive': 'Ça, c’est l’image f de a. Le nombre dérivé est la pente de la tangente.',
  'pente-inverse': 'La pente, c’est l’écart des ordonnées divisé par l’écart des abscisses, dans cet ordre.',
  'tangente-formule': 'La tangente s’écrit y égale f prime de a, fois x moins a, plus f de a : n’oublie pas le moins a.',
  'tangente-echange': 'Le coefficient directeur de la tangente est f prime de a ; f de a est l’ordonnée du point.',
  'derivee-signe-variations': 'Si f prime est positive, f est croissante ; si f prime est négative, f est décroissante.',
  'derivee-pas-signe-de-f': 'Le signe de f prime donne les variations de f, pas le signe de f.',

  'usuelles-regle': 'Revois le tableau des dérivées usuelles.',
  'polynome-regle': 'Dérive terme à terme : n fois x puissance n moins un, et les constantes disparaissent.',
  'produit-regle': 'La dérivée de u v est u prime v plus u v prime.',
  'quotient-regle': 'La dérivée de u sur v est u prime v moins u v prime, sur v au carré.',
  'nombre-derive-regle': 'Calcule f prime de x, puis remplace x par la valeur donnée.',
  'nombre-derive-lu-regle': 'Le nombre dérivé est le coefficient directeur de la tangente.',
  'tangente-regle': 'y égale f prime de a, fois x moins a, plus f de a.',
  'variations-regle': 'f prime positive, f croissante ; f prime négative, f décroissante.',
};
