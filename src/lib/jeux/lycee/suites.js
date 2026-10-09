/**
 * LES SUITES — Nora, en 1re générale (spécialité mathématiques).
 *
 * Suites arithmétiques et géométriques, suites définies par récurrence. Huit
 * manches tirées parmi huit sortes, toutes les réponses CALCULÉES ici :
 *   - le terme par récurrence : u₀, puis uₙ₊₁ = k uₙ + b. PIÈGES : une étape
 *     de trop ou de moins, k(uₙ + b) au lieu de k uₙ + b ;
 *   - uₙ₊₁ à partir de uₙ = n² + bn + c. PIÈGES : uₙ + 1 au lieu de remplacer
 *     n par n + 1, le double produit oublié dans (n + 1)² ;
 *   - le terme général arithmétique, uₙ = uₚ + (n − p)r. PIÈGES : le décalage
 *     d'un rang quand on part de u₁ ou de u₀, le premier terme oublié ;
 *   - le terme général géométrique, uₙ = uₚ × qⁿ⁻ᵖ. PIÈGES : ajouter la raison
 *     au lieu de multiplier, (u₀ q)ⁿ, le décalage d'un rang ;
 *   - la raison. PIÈGES : l'écart de deux termes éloignés pris pour la
 *     raison, la différence au lieu du quotient, la raison à l'envers ;
 *   - la nature d'une suite. PIÈGES : le premier terme pris pour la raison,
 *     arithmétique et géométrique confondues, uₙ₊₁ = 2uₙ + 1 cru géométrique ;
 *   - les sommes : 1 + 2 + … + n, 1 + q + … + qⁿ, la somme de termes
 *     arithmétiques. PIÈGES : le nombre de termes, la division par deux ou par
 *     q − 1 oubliée ;
 *   - le sens de variation. PIÈGES : un premier terme négatif (q = 2 et u₀ < 0
 *     donne une suite DÉCROISSANTE), une raison négative.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'suites', titre: 'Les suites', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Les suites',
    accroche: 'Arithmétiques, géométriques : la raison.',
    competences: [
      'MATH_1RE_SUITES_NOTION', 'MATH_1RE_SUITES_TERMES', 'MATH_1RE_SUITES_ARITH',
      'MATH_1RE_SUITES_GEO', 'MATH_1RE_SUITES_VARIATION', 'MATH_1RE_SUITES_MODELE',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ l'écriture */

const NB = ' ';

/** « −3 », « 2,5 », « 35 000 » : le signe moins typographique, la virgule. */
function nb(x) {
  let r = Math.round(x * 1e6) / 1e6;
  if (Object.is(r, -0)) r = 0;
  const [ent, dec] = String(Math.abs(r)).split('.');
  const groupe = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, NB) : ent;
  return (r < 0 ? '−' : '') + groupe + (dec ? `,${dec}` : '');
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
const INDICES = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
const sub = (n) => String(n).split('').map((c) => INDICES[Number(c)]).join('');
/** u₀, u₁₂ */
const u = (n) => `u${sub(n)}`;

/** « n² + 3n − 2 » : coefficients du plus haut degré au plus bas, en n. */
function poly(coefs, v = 'n') {
  const deg = coefs.length - 1;
  let s = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const k = deg - i;
    const lettre = k === 0 ? '' : `${v}${k > 1 ? sup(k) : ''}`;
    const abs = Math.abs(c);
    const corps = abs === 1 && k > 0 ? lettre : `${nb(abs)}${lettre}`;
    if (s === '') s = (c < 0 ? '−' : '') + corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}
/** « + 3 », « − 2 » : une constante ajoutée. */
const plus = (b) => (b < 0 ? ` − ${nb(-b)}` : ` + ${nb(b)}`);
/** « 2uₙ », « −uₙ », « uₙ » */
const fois = (k) => {
  if (k === 1) return 'uₙ';
  if (k === -1) return '−uₙ';
  return `${nb(k)}uₙ`;
};

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

/** Une manche à choix fixes : chaque mauvais choix porte sa phrase. */
function fixe(melanger, {
  consigne, question, bonne, pieges,
}) {
  return {
    consigne,
    question,
    choix: cartes(melanger([bonne, ...Object.keys(pieges)])),
    bonne,
    pieges,
  };
}

/* ------------------------------------------------------------- récurrence */

function recurrence({ au, entre, melanger }) {
  const u0 = entre(-5, 6);
  const k = au([2, 3, -2]);
  let b = 0;
  while (b === 0) b = entre(-5, 5);
  const n = au([2, 3]);
  const pas = (v) => k * v + b;
  const mauvais = (v) => k * (v + b);
  let bonne = u0;
  let avant = u0;
  let faux = u0;
  for (let i = 0; i < n; i += 1) {
    avant = bonne;
    bonne = pas(bonne);
    faux = mauvais(faux);
  }
  return manche(melanger, {
    consigne: 'recurrence',
    question: `${u(0)} = ${nb(u0)} et uₙ₊₁ = ${fois(k)}${plus(b)}. ${u(n)} = ?`,
    bonne: nb(bonne),
    pieges: [[nb(avant), 'recurrence-rangs'], [nb(faux), 'recurrence-priorite'], [nb(pas(bonne)), 'recurrence-rangs']],
    voisin: (j) => nb(bonne + j),
  });
}

function termeSuivant({ entre, melanger }) {
  let b = 0;
  let c = 0;
  while (b === 0) b = entre(-5, 5);
  while (c === 0) c = entre(-6, 6);
  // (n + 1)² + b(n + 1) + c = n² + (2 + b)n + (1 + b + c)
  return manche(melanger, {
    consigne: 'terme-suivant',
    question: `Pour tout entier n, uₙ = ${poly([1, b, c])}. uₙ₊₁ = ?`,
    bonne: poly([1, 2 + b, 1 + b + c]),
    pieges: [[poly([1, b, c + 1]), 'indice-n-plus-un'], [poly([1, b, 1 + b + c]), 'double-produit']],
    voisin: (j) => poly([1, 2 + b, 1 + b + c + j]),
  });
}

/* -------------------------------------------------------- terme général */

function arithmetique({ au, entre, melanger }) {
  const p = au([0, 1]);
  const up = entre(-10, 20);
  let r = 0;
  while (r === 0) r = entre(-6, 6);
  const n = entre(8, 20);
  const bonne = up + (n - p) * r;
  const decale = p === 1 ? up + n * r : up + (n - 1) * r;
  return manche(melanger, {
    consigne: 'arithmetique',
    question: `(uₙ) est arithmétique de raison ${nb(r)}, et ${u(p)} = ${nb(up)}. ${u(n)} = ?`,
    bonne: nb(bonne),
    pieges: [[nb(decale), 'premier-rang'], [nb((n - p) * r), 'terme-initial']],
    voisin: (j) => nb(bonne + j * r * 2),
  });
}

function geometrique({ au, entre, melanger }) {
  const p = au([0, 1]);
  const up = au([1, 2, 3, 4, 5, -1, -2, -3]);
  const q = au([2, 3, -2]);
  const e = entre(3, q === 3 ? 5 : 6);
  const n = p + e;
  const bonne = up * q ** e;
  return manche(melanger, {
    consigne: 'geometrique',
    question: `(uₙ) est géométrique de raison ${nb(q)}, et ${u(p)} = ${nb(up)}. ${u(n)} = ?`,
    bonne: nb(bonne),
    pieges: melanger([
      [nb(up + e * q), 'geometrique-pas-arithmetique'],
      [nb((up * q) ** e), 'priorite-puissance'],
      [nb(up * q ** (e + (p === 1 ? 1 : -1))), 'premier-rang'],
    ]),
    voisin: (j) => nb(bonne * (j + 1) + j),
  });
}

/* ---------------------------------------------------------------- raison */

function raison({ au, entre, melanger }) {
  if (au([true, false])) {
    const i = entre(0, 5);
    const d = entre(2, 6);
    const ui = entre(-10, 20);
    let r = 0;
    while (r === 0) r = entre(-6, 6);
    const uj = ui + d * r;
    return manche(melanger, {
      consigne: 'raison',
      question: `(uₙ) est arithmétique, ${u(i)} = ${nb(ui)} et ${u(i + d)} = ${nb(uj)}. Sa raison ?`,
      bonne: nb(r),
      pieges: [[nb(uj - ui), 'raison-ecart-rangs'], [fr(d, uj - ui), 'raison-inverse-arithmetique']],
      voisin: (j) => nb(r + j),
    });
  }
  const i = entre(0, 6);
  let un = 0;
  while (un === 0) un = entre(-6, 6);
  const q = au([2, 3, 4, 5, -2, -3]);
  return manche(melanger, {
    consigne: 'raison',
    question: `(uₙ) est géométrique, ${u(i)} = ${nb(un)} et ${u(i + 1)} = ${nb(un * q)}. Sa raison ?`,
    bonne: nb(q),
    pieges: [[nb(un * q - un), 'raison-quotient'], [fr(1, q), 'raison-inverse-geometrique']],
    voisin: (j) => nb(q + (q > 0 ? j : -j)),
  });
}

/* --------------------------------------------------------------- nature */

const ARITH = (r) => `arithmétique, r = ${nb(r)}`;
const GEO = (q) => `géométrique, q = ${nb(q)}`;
const NI = 'ni arithmétique ni géométrique';

function nature({ au, entre, melanger }) {
  const sorte = au(['explicite-a', 'explicite-g', 'recurrence-a', 'recurrence-g', 'affine', 'carre']);
  let question;
  let bonne;
  let pieges;
  if (sorte === 'explicite-a') {
    let r = 0;
    let a = 0;
    while (r === 0) r = entre(-5, 6);
    while (a === 0 || a === r) a = entre(-6, 9);
    question = `uₙ = ${poly([r, a])}`;
    bonne = ARITH(r);
    pieges = { [ARITH(a)]: 'raison-terme-initial', [GEO(r)]: 'arithmetique-ou-geometrique' };
  } else if (sorte === 'explicite-g') {
    const q = entre(2, 5);
    let a;
    do a = entre(2, 7); while (a === q);
    question = `uₙ = ${a} × ${q}ⁿ`;
    bonne = GEO(q);
    pieges = { [GEO(a)]: 'raison-terme-initial', [ARITH(q)]: 'arithmetique-ou-geometrique' };
  } else if (sorte === 'recurrence-a') {
    let r = 0;
    let a = 0;
    while (r === 0) r = entre(-5, 6);
    while (a === 0 || a === r) a = entre(-6, 9);
    question = `${u(0)} = ${nb(a)} et uₙ₊₁ = uₙ${plus(r)}`;
    bonne = ARITH(r);
    pieges = { [GEO(r)]: 'arithmetique-ou-geometrique', [ARITH(a)]: 'raison-terme-initial' };
  } else if (sorte === 'recurrence-g') {
    const q = entre(2, 5);
    let a = 0;
    while (a === 0 || a === q) a = entre(-4, 7);
    question = `${u(0)} = ${nb(a)} et uₙ₊₁ = ${fois(q)}`;
    bonne = GEO(q);
    pieges = { [ARITH(q)]: 'arithmetique-ou-geometrique', [GEO(a)]: 'raison-terme-initial' };
  } else if (sorte === 'affine') {
    // Le piège classique : uₙ₊₁ = 2uₙ + 1 n'est ni l'une ni l'autre (sauf au point fixe).
    const k = entre(2, 3);
    let b = 0;
    let a;
    while (b === 0) b = entre(-5, 5);
    do a = entre(-3, 6); while (a * (1 - k) === b || a === 0);
    question = `${u(0)} = ${nb(a)} et uₙ₊₁ = ${fois(k)}${plus(b)}`;
    bonne = NI;
    pieges = { [GEO(k)]: 'ni-l-un-ni-l-autre', [ARITH(b)]: 'ni-l-un-ni-l-autre' };
  } else {
    let c = 0;
    while (c === 0 || c === 2) c = entre(-5, 6);
    question = `uₙ = ${poly([1, 0, c])}`;
    bonne = NI;
    pieges = { [ARITH(c)]: 'ni-l-un-ni-l-autre', [GEO(2)]: 'ni-l-un-ni-l-autre' };
  }
  return fixe(melanger, {
    consigne: 'nature', question, bonne, pieges,
  });
}

/* ---------------------------------------------------------------- sommes */

function somme({ au, entre, melanger }) {
  const sorte = au(['entiers', 'geometrique', 'arithmetique']);
  if (sorte === 'entiers') {
    const n = au([20, 30, 40, 50, 60, 80, 100]);
    const bonne = (n * (n + 1)) / 2;
    return manche(melanger, {
      consigne: 'somme',
      question: `1 + 2 + 3 + … + ${n} = ?`,
      bonne: nb(bonne),
      pieges: [[nb(n * (n + 1)), 'somme-moitie'], [nb((n * (n - 1)) / 2), 'nombre-de-termes']],
      voisin: (j) => nb(bonne + 10 * j),
    });
  }
  if (sorte === 'geometrique') {
    const q = au([2, 3]);
    const n = q === 2 ? entre(5, 10) : entre(4, 6);
    const bonne = (q ** (n + 1) - 1) / (q - 1);
    return manche(melanger, {
      consigne: 'somme',
      question: `1 + ${q} + ${q}² + … + ${q}${sup(n)} = ?`,
      bonne: nb(bonne),
      pieges: [
        [nb((q ** n - 1) / (q - 1)), 'nombre-de-termes'],
        [nb(q ** (n + 1) - 1), 'somme-geometrique-diviser'],
        [nb(q ** (n + 1)), 'somme-geometrique-moins-un'],
      ],
      voisin: (j) => nb(bonne + 2 * j),
    });
  }
  const u0 = entre(1, 9);
  const r = entre(2, 5);
  const n = entre(9, 19);
  const un = u0 + n * r;
  const bonne = ((n + 1) * (u0 + un)) / 2;
  return manche(melanger, {
    consigne: 'somme',
    question: `(uₙ) est arithmétique, ${u(0)} = ${u0} et r = ${r}. ${u(0)} + ${u(1)} + … + ${u(n)} = ?`,
    bonne: nb(bonne),
    pieges: [[nb((n * (u0 + un)) / 2), 'nombre-de-termes'], [nb((n + 1) * (u0 + un)), 'somme-moitie']],
    voisin: (j) => nb(bonne + 5 * j),
  });
}

/* ------------------------------------------------------------- variation */

const CROISSANTE = 'croissante';
const DECROISSANTE = 'décroissante';
const NON_MONOTONE = 'ni croissante ni décroissante';

function variation({ au, entre, melanger }) {
  const sorte = au(['arithmetique', 'geometrique', 'geometrique', 'alternee']);
  if (sorte === 'arithmetique') {
    let r = 0;
    while (r === 0) r = entre(-6, 6);
    const u0 = entre(-9, 9);
    const bonne = r > 0 ? CROISSANTE : DECROISSANTE;
    const pieges = {};
    [CROISSANTE, DECROISSANTE, NON_MONOTONE].filter((c) => c !== bonne).forEach((c) => { pieges[c] = 'variation-arithmetique'; });
    return fixe(melanger, {
      consigne: 'variation',
      question: au([
        `(uₙ) est arithmétique de raison ${nb(r)}, avec ${u(0)} = ${nb(u0)}. Sens de variation ?`,
        `uₙ = ${poly([r, u0])}. Sens de variation de (uₙ) ?`,
      ]),
      bonne,
      pieges,
    });
  }
  if (sorte === 'geometrique') {
    const q = au([2, 3, 0.5, 1.5]);
    const u0 = au([1, 2, 3, 4, 5, -1, -2, -3, -4, -5]);
    const monte = (q > 1) === (u0 > 0);
    const bonne = monte ? CROISSANTE : DECROISSANTE;
    const contraire = monte ? DECROISSANTE : CROISSANTE;
    return fixe(melanger, {
      consigne: 'variation',
      question: `(uₙ) est géométrique de raison ${nb(q)}, avec ${u(0)} = ${nb(u0)}. Sens de variation ?`,
      bonne,
      pieges: {
        [contraire]: u0 < 0 ? 'signe-premier-terme' : 'variation-geometrique',
        [NON_MONOTONE]: 'variation-geometrique',
      },
    });
  }
  const q = au([-2, -3, -0.5]);
  const u0 = au([1, 2, 3, -1, -2, -3]);
  return fixe(melanger, {
    consigne: 'variation',
    question: `(uₙ) est géométrique de raison ${nb(q)}, avec ${u(0)} = ${nb(u0)}. Sens de variation ?`,
    bonne: NON_MONOTONE,
    pieges: { [CROISSANTE]: 'raison-negative', [DECROISSANTE]: 'raison-negative' },
  });
}

/* ------------------------------------------------------------ la partie */

const SORTES = [recurrence, termeSuivant, arithmetique, geometrique, raison, nature, somme, variation];

// Une seule classe : la 1re générale.
export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  // Les huit sortes, presque une fois chacune : l'une des deux premières cède
  // parfois sa place à un second terme général ou à une seconde récurrence.
  const sortes = [...SORTES];
  sortes[t.entre(0, 1)] = t.au([arithmetique, geometrique, recurrence, termeSuivant]);
  return t.melanger(sortes.map((f) => f(t)));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  recurrence: 'Calcule ce terme pas à pas, avec la relation de récurrence.',
  'terme-suivant': 'Exprime le terme suivant en fonction de n.',
  arithmetique: 'Calcule ce terme de la suite arithmétique.',
  geometrique: 'Calcule ce terme de la suite géométrique.',
  raison: 'Trouve la raison de la suite.',
  nature: 'Arithmétique, géométrique, ou ni l’un ni l’autre ?',
  somme: 'Calcule cette somme.',
  variation: 'Trouve le sens de variation de la suite.',

  'recurrence-rangs': 'Compte les étapes : chaque application de la relation fait avancer d’un seul rang.',
  'recurrence-priorite': 'Dans la relation, on multiplie d’abord le terme, puis on ajoute la constante.',
  'indice-n-plus-un': 'Le terme suivant ne s’obtient pas en ajoutant un au terme : remplace n par n plus un partout dans la formule.',
  'double-produit': 'Développe le carré de n plus un sans oublier son double produit.',
  'premier-rang': 'Regarde le rang du premier terme : du rang de départ au rang cherché, compte le nombre de pas.',
  'terme-initial': 'N’oublie pas le premier terme : on part de lui, puis on ajoute la raison à chaque pas.',
  'geometrique-pas-arithmetique': 'Dans une suite géométrique, on multiplie par la raison à chaque pas : on n’ajoute pas.',
  'priorite-puissance': 'Seule la raison est élevée à la puissance ; le premier terme multiplie ensuite le résultat.',
  'raison-ecart-rangs': 'Cet écart s’étale sur plusieurs rangs : divise-le par le nombre de pas.',
  'raison-inverse-arithmetique': 'La raison, c’est l’écart des termes divisé par l’écart des rangs, dans cet ordre.',
  'raison-quotient': 'La raison d’une suite géométrique est le quotient de deux termes consécutifs, pas leur différence.',
  'raison-inverse-geometrique': 'La raison, c’est un terme divisé par le précédent, dans cet ordre.',
  'raison-terme-initial': 'Ce nombre est le premier terme, pas la raison.',
  'arithmetique-ou-geometrique': 'Ajouter le même nombre à chaque pas, c’est arithmétique ; multiplier par le même nombre, c’est géométrique.',
  'ni-l-un-ni-l-autre': 'Calcule trois termes consécutifs : ni leur différence ni leur quotient n’est constant.',
  'somme-moitie': 'N’oublie pas de diviser par deux : la somme vaut le nombre de termes fois la moyenne du premier et du dernier.',
  'nombre-de-termes': 'Compte bien les termes : du rang de départ au rang d’arrivée, il y en a un de plus que l’écart des rangs.',
  'somme-geometrique-diviser': 'Dans la formule de la somme, n’oublie pas de diviser par la raison moins un.',
  'somme-geometrique-moins-un': 'La somme vaut la raison à la puissance du nombre de termes, moins un, le tout divisé par la raison moins un.',
  'variation-arithmetique': 'Une suite arithmétique est croissante si sa raison est positive, décroissante si elle est négative.',
  'signe-premier-terme': 'Regarde aussi le signe du premier terme : quand il est négatif, le sens de variation s’inverse.',
  'variation-geometrique': 'Avec des termes positifs, une suite géométrique croît si la raison dépasse un, et décroît si la raison est entre zéro et un.',
  'raison-negative': 'Avec une raison négative, les termes changent de signe à chaque pas : la suite n’est pas monotone.',

  'recurrence-regle': 'Applique la relation une fois par rang : multiplie, puis ajoute.',
  'terme-suivant-regle': 'Remplace n par n plus un dans la formule, puis développe et réduis.',
  'arithmetique-regle': 'Le terme cherché égale le premier terme plus le nombre de pas fois la raison.',
  'geometrique-regle': 'Le terme cherché égale le premier terme fois la raison à la puissance du nombre de pas.',
  'raison-regle': 'Arithmétique : écart des termes divisé par l’écart des rangs. Géométrique : quotient de deux termes consécutifs.',
  'nature-regle': 'Cherche si l’on ajoute ou si l’on multiplie toujours le même nombre.',
  'somme-regle': 'Nombre de termes fois la moyenne du premier et du dernier ; pour une suite géométrique, la formule avec la raison.',
  'variation-regle': 'Regarde le signe de la différence entre un terme et le précédent.',
};
