/**
 * LIMITES ET CONTINUITÉ — terminale générale (spécialité). Professeure : Nora.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_TLE_SUITES_LIMITE, MATH_TLE_SUITES_CONV,
 * MATH_TLE_FONC_LIMITE, MATH_TLE_CONTINUITE.
 *
 * SIX SORTES DE MANCHES (2 + 1 + 1 + 1 + 1 + 1 + 1, mélangées) :
 *   - LES OPÉRATIONS SUR LES LIMITES : somme, produit, quotient, à partir des
 *     limites de f et de g. LES PIÈGES : « +∞ − ∞ = 0 », « 0 × ∞ = 0 »,
 *     « ∞ / ∞ = 1 », un nombre sur 0⁺ qui donnerait 0, le signe oublié, et
 *     voir une forme indéterminée là où il n'y en a pas ;
 *   - LE TERME DOMINANT (deux manches) : un polynôme dont les deux premiers
 *     termes donnent VRAIMENT une forme indéterminée, puis une fonction
 *     rationnelle. LES PIÈGES : s'arrêter à « forme indéterminée », lire le
 *     signe du mauvais terme, prendre le quotient des constantes, oublier de
 *     comparer les degrés ;
 *   - LES CROISSANCES COMPARÉES : une banque de limites canoniques (eˣ/xⁿ,
 *     xⁿe⁻ˣ, ln x / x, x ln x en 0…), l'exposant tiré au hasard. LES PIÈGES :
 *     « forme indéterminée », et le mauvais vainqueur ;
 *   - LE THÉORÈME DES VALEURS INTERMÉDIAIRES : un tableau de variations dit en
 *     phrases, combien de solutions pour f(x) = k ? LES PIÈGES : une seule
 *     solution dès que k est entre le minimum et le maximum, ou ne regarder
 *     que les valeurs aux bornes de l'intervalle ;
 *   - LA SUITE GÉOMÉTRIQUE qⁿ (et a + b·qⁿ). LES PIÈGES : une raison proche de
 *     un prise pour un, une raison négative, la constante oubliée ;
 *   - LA CONVERGENCE : suite monotone bornée, théorèmes de comparaison et des
 *     gendarmes. LES PIÈGES : le majorant pris pour la limite, la comparaison
 *     dans le mauvais sens.
 *
 * Tout ce qui varie (les nombres, les fonctions) est dans `question` et les
 * libellés ; PHRASES est fixe, sans aucun chiffre.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'limites-et-continuite', titre: 'Limites et continuité', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'Limites et continuité',
    accroche: 'Lever les formes indéterminées.',
    competences: ['MATH_TLE_SUITES_LIMITE', 'MATH_TLE_SUITES_CONV', 'MATH_TLE_FONC_LIMITE', 'MATH_TLE_CONTINUITE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ les outils */

const PINF = '+∞';
const MINF = '−∞';
const FI = 'forme indéterminée';
const SANS = 'pas de limite';
const infini = (s) => (s > 0 ? PINF : MINF);
const oppose = (l) => (l === PINF ? MINF : PINF);

const SUP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => SUP[c]).join('');
/** « −3 » avec le vrai signe moins. */
const entier = (n) => (n < 0 ? `−${-n}` : `${n}`);
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));

/** « −3/2 », « 4 » : irréductible, le signe devant. */
function frac(n, d) {
  const signe = Math.sign(n) * Math.sign(d);
  const g = pgcd(Math.abs(n), Math.abs(d));
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
const memes = (u, v) => (typeof u === 'number' && typeof v === 'number' ? proche(u, v) : u === v);

/**
 * Une manche à trois choix : la bonne réponse, deux pièges nommés (tirés
 * parmi ceux qui valent autre chose que la bonne réponse), des voisins sinon.
 * Chaque candidat est [libellé, valeur] ; un piège est [libellé, valeur, phrase].
 */
function manche(t, {
  consigne, question, bonne, pieges = [], voisins = [], aide,
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
  return m;
}

/** Un candidat dont la valeur est son libellé. */
const mot = (l) => [l, l];
const TOUT = [mot(PINF), mot(MINF), ['0', 0], mot(FI), ['1', 1]];

/* ------------------------------------------ les opérations sur les limites */

const REELS = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];

/** Une limite, telle qu'on l'écrit. */
const ecrire = (l) => {
  if (l.inf) return infini(l.inf);
  if (l.zero) return l.zero > 0 ? '0⁺' : '0⁻';
  return entier(l.reel);
};

function operations(t) {
  const op = t.au(['+', '×', '/']);
  const sA = t.au([1, -1]);
  const sB = t.au([1, -1]);
  const reel = t.au(REELS);
  const cas = t.entre(1, op === '/' ? 4 : 3);
  let f;
  let g;
  let bonne;
  let pieges;
  const echanger = op !== '/' && t.entre(0, 1) === 1;
  if (op === '+') {
    if (cas === 1) {
      [f, g] = [{ inf: sA }, { inf: -sA }];
      bonne = FI;
      pieges = [[['0', 0], 'infini-moins-infini']];
    } else if (cas === 2) {
      [f, g] = [{ inf: sA }, { inf: sA }];
      bonne = infini(sA);
      pieges = [[mot(FI), 'pas-indeterminee'], [mot(oppose(bonne)), 'somme-infinie']];
    } else {
      [f, g] = [{ inf: sA }, { reel }];
      bonne = infini(sA);
      pieges = [[mot(FI), 'pas-indeterminee'], [mot(oppose(bonne)), 'somme-infinie']];
    }
  } else if (op === '×') {
    if (cas === 1) {
      [f, g] = [{ inf: sA }, { zero: sB }];
      bonne = FI;
      pieges = [[['0', 0], 'zero-fois-infini']];
    } else if (cas === 2) {
      [f, g] = [{ inf: sA }, { reel }];
      bonne = infini(sA * Math.sign(reel));
      pieges = [[mot(oppose(bonne)), 'signe-produit'], [mot(FI), 'pas-indeterminee']];
    } else {
      [f, g] = [{ inf: sA }, { inf: sB }];
      bonne = infini(sA * sB);
      pieges = [[mot(oppose(bonne)), 'signe-produit'], [mot(FI), 'pas-indeterminee']];
    }
  } else if (cas === 1) {
    [f, g] = [{ inf: sA }, { inf: sB }];
    bonne = FI;
    pieges = [[['1', 1], 'infini-sur-infini']];
  } else if (cas === 2) {
    [f, g] = [{ reel }, { inf: sB }];
    bonne = '0';
    pieges = [[mot(FI), 'pas-indeterminee']];
  } else if (cas === 3) {
    [f, g] = [{ reel }, { zero: sB }];
    bonne = infini(Math.sign(reel) * sB);
    pieges = [[['0', 0], 'diviser-par-zero'], [mot(oppose(bonne)), 'signe-quotient']];
  } else {
    [f, g] = [{ inf: sA }, { reel }];
    bonne = infini(sA * Math.sign(reel));
    pieges = [[mot(oppose(bonne)), 'signe-quotient'], [mot(FI), 'pas-indeterminee']];
  }
  if (echanger) [f, g] = [g, f];
  const b = bonne === '0' ? ['0', 0] : mot(bonne);
  return manche(t, {
    consigne: 'operations',
    question: `Au même point : lim f = ${ecrire(f)} et lim g = ${ecrire(g)}.\nlim (f ${op} g) = ?`,
    bonne: b,
    pieges: pieges.map(([c, phrase]) => [...c, phrase]),
    voisins: TOUT,
  });
}

/* ---------------------------------------------------- le terme dominant */

function polynome(t) {
  let n;
  let m;
  let a;
  let b;
  let s;
  // Les deux premiers termes ont des limites de signes contraires : la forme
  // indéterminée est réelle, et c'est le terme de plus haut degré qui la lève.
  do {
    n = t.entre(2, 5);
    m = t.entre(1, n - 1);
    a = nonNul(t, 4);
    b = nonNul(t, 6);
    s = t.au([1, -1]);
  } while (Math.sign(a) * s ** n === Math.sign(b) * s ** m);
  const c = t.entre(-5, 5);
  const bonne = infini(Math.sign(a) * s ** n);
  return manche(t, {
    consigne: 'terme-dominant',
    question: `f(x) = ${poly([[a, n], [b, m], [c, 0]])}\nlim f(x) en ${infini(s)} ?`,
    bonne: mot(bonne),
    pieges: [[FI, FI, 'lever-forme'], [oppose(bonne), oppose(bonne), 'signe-terme-dominant']],
    voisins: [['0', 0]],
    aide: 'terme-dominant-regle',
  });
}

function rationnelle(t) {
  const [p, q] = t.au([[1, 1], [2, 2], [1, 2], [2, 1]]);
  const a = nonNul(t, 5);
  const c = nonNul(t, 5);
  const b = nonNul(t, 6);
  const d = nonNul(t, 6);
  const s = t.au([1, -1]);
  let bonne;
  let pieges;
  if (p === q) {
    bonne = [frac(a, c), a / c];
    pieges = [[FI, FI, 'lever-forme'], [frac(b, d), b / d, 'constantes']];
  } else if (p < q) {
    bonne = ['0', 0];
    pieges = [[FI, FI, 'lever-forme'], [frac(a, c), a / c, 'degres']];
  } else {
    // (a x²) / (c x) = (a / c) x
    const l = infini(Math.sign(a * c) * s);
    bonne = mot(l);
    pieges = [[FI, FI, 'lever-forme'], [frac(a, c), a / c, 'degres'], [oppose(l), oppose(l), 'signe-terme-dominant']];
  }
  return manche(t, {
    consigne: 'terme-dominant',
    question: `f(x) = (${poly([[a, p], [b, 0]])}) / (${poly([[c, q], [d, 0]])})\nlim f(x) en ${infini(s)} ?`,
    bonne,
    pieges,
    voisins: [['0', 0], mot(PINF), mot(MINF), ['1', 1]],
    aide: 'terme-dominant-regle',
  });
}

/* ------------------------------------------------ les croissances comparées */

/** [expression (n remplacé par l'exposant), point, limite, le mauvais vainqueur]. */
const CROISSANCES = [
  ['eˣ / xⁿ', PINF, PINF, '0'],
  ['xⁿ / eˣ', PINF, '0', PINF],
  ['xⁿ e^(−x)', PINF, '0', PINF],
  ['xⁿ eˣ', MINF, '0', 'signe'],
  ['ln x / x', PINF, '0', PINF],
  ['ln x / xⁿ', PINF, '0', PINF],
  ['x / ln x', PINF, PINF, '0'],
  ['x ln x', '0', '0', MINF],
  ['xⁿ ln x', '0', '0', MINF],
  ['eˣ − xⁿ', PINF, PINF, MINF],
  ['x − ln x', PINF, PINF, MINF],
];

function croissances(t) {
  const [modele, point, limite, vaincu] = t.au(CROISSANCES);
  const n = t.entre(2, 5);
  const expression = modele.replace('ⁿ', sup(n));
  // xⁿ eˣ en −∞ : le mauvais vainqueur est la limite de xⁿ, selon la parité.
  const autre = vaincu === 'signe' ? infini(n % 2 ? -1 : 1) : vaincu;
  const valeur = (l) => (l === '0' ? ['0', 0] : mot(l));
  const ou = point === '0' ? 'en 0, avec x > 0' : `en ${point}`;
  return manche(t, {
    consigne: 'croissances',
    question: `lim ${expression}\n${ou} ?`,
    bonne: valeur(limite),
    pieges: [[FI, FI, 'croissances-comparees'], [...valeur(autre), 'qui-l-emporte']],
    voisins: TOUT,
  });
}

/* ------------------------------------- le théorème des valeurs intermédiaires */

function tvi(t) {
  const morceaux = t.entre(2, 3);
  const xs = [t.entre(-4, 0)];
  const ys = [t.entre(-6, 6)];
  let monte = t.entre(0, 1) === 1;
  const sens = [];
  for (let i = 0; i < morceaux; i += 1) {
    xs.push(xs[i] + t.entre(1, 3));
    const delta = t.entre(2, 8);
    ys.push(ys[i] + (monte ? delta : -delta));
    sens.push(monte);
    monte = !monte;
  }
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  // k n'est aucune valeur du tableau. Parfois hors de [min ; max] (aucune
  // solution) ; sinon entre les deux, parmi les entiers libres — il peut ne
  // pas y en avoir (1, 3, 0, 2 occupent tout ]0 ; 3[).
  const libres = [];
  for (let v = min + 1; v < max; v += 1) if (!ys.includes(v)) libres.push(v);
  const k = t.entre(1, 5) === 1 || libres.length === 0
    ? (t.entre(0, 1) ? max + t.entre(1, 3) : min - t.entre(1, 3))
    : t.au(libres);
  const entre = (u, v) => (k - u) * (k - v) < 0;
  let compte = 0;
  for (let i = 0; i < morceaux; i += 1) if (entre(ys[i], ys[i + 1])) compte += 1;
  const uneSeule = k > min && k < max ? 1 : 0;
  const auxBornes = entre(ys[0], ys[morceaux]) ? 1 : 0;
  const lignes = sens.map((m, i) => `f ${m ? 'croît' : 'décroît'} de ${entier(ys[i])} à ${entier(ys[i + 1])} sur [${entier(xs[i])} ; ${entier(xs[i + 1])}]`);
  const nombre = (v) => [`${v}`, v];
  return manche(t, {
    consigne: 'tvi',
    question: `f est continue sur [${entier(xs[0])} ; ${entier(xs[morceaux])}].\n${lignes.join(',\npuis ')}.\nNombre de solutions de f(x) = ${entier(k)} ?`,
    bonne: nombre(compte),
    pieges: [[...nombre(uneSeule), 'tvi-chaque-intervalle'], [...nombre(auxBornes), 'tvi-extremites']],
    voisins: [0, 1, 2, 3].map(nombre),
    aide: 'tvi-regle',
  });
}

/* --------------------------------------------------- la suite géométrique */

const PETITES = [['0,5', 0.5], ['0,8', 0.8], ['0,9', 0.9], ['0,99', 0.99]];
const GRANDES = [['1,02', 1.02], ['1,1', 1.1], ['1,5', 1.5], ['2', 2], ['3', 3]];
const TRES_NEGATIVES = [['−2', -2], ['−1,5', -1.5], ['−3', -3]];
const NEGATIVES = [['−0,5', -0.5], ['−0,2', -0.2], ['−0,9', -0.9]];

function geometrique(t) {
  const sorte = t.entre(1, 5);
  const zero = ['0', 0];
  const un = ['1', 1];
  if (sorte === 1) {
    const [q] = t.au(PETITES);
    return manche(t, {
      consigne: 'geometrique',
      question: `uₙ = ${q}ⁿ\nlim uₙ ?`,
      bonne: zero,
      pieges: [[...un, 'proche-de-un'], [PINF, PINF, 'raison-et-un']],
      voisins: [mot(SANS)],
    });
  }
  if (sorte === 2) {
    const [q] = t.au(GRANDES);
    return manche(t, {
      consigne: 'geometrique',
      question: `uₙ = ${q}ⁿ\nlim uₙ ?`,
      bonne: mot(PINF),
      pieges: [[...un, 'proche-de-un'], [...zero, 'raison-et-un']],
      voisins: [mot(SANS)],
    });
  }
  if (sorte === 3) {
    const [q] = t.au(TRES_NEGATIVES);
    return manche(t, {
      consigne: 'geometrique',
      question: `uₙ = (${q})ⁿ\nlim uₙ ?`,
      bonne: mot(SANS),
      pieges: [[PINF, PINF, 'raison-negative'], [MINF, MINF, 'raison-negative']],
      voisins: [zero],
    });
  }
  if (sorte === 4) {
    const [q] = t.au(NEGATIVES);
    return manche(t, {
      consigne: 'geometrique',
      question: `uₙ = (${q})ⁿ\nlim uₙ ?`,
      bonne: zero,
      pieges: [[SANS, SANS, 'raison-entre']],
      voisins: [mot(MINF), un],
    });
  }
  const [q] = t.au(PETITES);
  const a = nonNul(t, 6);
  const b = nonNul(t, 5);
  return manche(t, {
    consigne: 'geometrique',
    question: `uₙ = ${entier(a)} ${b < 0 ? '−' : '+'} ${Math.abs(b)} × ${q}ⁿ\nlim uₙ ?`,
    bonne: [entier(a), a],
    pieges: [[entier(a + b), a + b, 'limite-pas-premier-terme'], ['0', 0, 'constante-oubliee']],
    voisins: [mot(PINF), mot(SANS)],
  });
}

/* ----------------------------------------------------------- la convergence */

const CONVERGE = '(uₙ) converge';
const RIEN = 'On ne peut pas conclure';
const lim = (v) => `lim uₙ = ${v}`;

function convergence(t) {
  const sorte = t.entre(1, 6);
  const M = nonNul(t, 9);
  const L = t.entre(-5, 5);
  let question;
  let bonne;
  let pieges;
  let voisins = [];
  if (sorte === 1) {
    question = `(uₙ) est croissante et majorée par ${entier(M)}.`;
    bonne = CONVERGE;
    pieges = [[lim(entier(M)), 'borne-pas-limite'], [lim(PINF), 'bornee-pas-infinie']];
  } else if (sorte === 2) {
    question = `(uₙ) est décroissante et minorée par ${entier(M)}.`;
    bonne = CONVERGE;
    pieges = [[lim(entier(M)), 'borne-pas-limite'], [lim(MINF), 'bornee-pas-infinie']];
  } else if (sorte === 3) {
    question = '(uₙ) est croissante et n’est pas majorée.';
    bonne = lim(PINF);
    pieges = [[CONVERGE, 'non-majoree'], [RIEN, 'non-majoree']];
  } else if (sorte === 4) {
    question = `Pour tout n, uₙ ≥ vₙ,\net lim vₙ = ${PINF}.`;
    bonne = lim(PINF);
    pieges = [[RIEN, 'comparaison'], [CONVERGE, 'comparaison']];
  } else if (sorte === 5) {
    question = `Pour tout n, uₙ ≤ vₙ,\net lim vₙ = ${PINF}.`;
    bonne = RIEN;
    pieges = [[lim(PINF), 'comparaison-sens'], [CONVERGE, 'comparaison-sens']];
  } else {
    question = `Pour tout n, vₙ ≤ uₙ ≤ wₙ,\net lim vₙ = lim wₙ = ${entier(L)}.`;
    bonne = lim(entier(L));
    pieges = [[RIEN, 'gendarmes']];
    voisins = [mot(lim(entier(L + 1))), mot(lim(PINF))];
  }
  return manche(t, {
    consigne: 'convergence',
    question,
    bonne: mot(bonne),
    pieges: pieges.map(([l, phrase]) => [l, l, phrase]),
    voisins,
  });
}

/* ------------------------------------------------------------- la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const liste = [
    operations(t), operations(t),
    polynome(t), rationnelle(t),
    croissances(t), tvi(t),
    geometrique(t), convergence(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  operations: 'Quelle est la limite de cette somme, de ce produit ou de ce quotient ?',
  'terme-dominant': 'Trouve la limite, en levant l’indétermination s’il le faut.',
  croissances: 'Croissances comparées : quelle est cette limite ?',
  tvi: 'Combien de solutions cette équation a-t-elle sur l’intervalle ?',
  geometrique: 'Vers quoi tend cette suite ?',
  convergence: 'Que peut-on affirmer sur cette suite ?',

  'infini-moins-infini': 'Plus l’infini moins l’infini ne fait pas zéro : c’est une forme indéterminée, qu’il faut lever en factorisant.',
  'pas-indeterminee': 'Ce n’est pas une forme indéterminée : les quatre formes à connaître sont l’infini moins l’infini, zéro fois l’infini, l’infini sur l’infini et zéro sur zéro.',
  'somme-infinie': 'Un nombre fini ou un infini de même signe ajouté à un infini : la somme garde le signe de cet infini.',
  'zero-fois-infini': 'Zéro fois l’infini ne fait pas zéro : c’est une forme indéterminée.',
  'signe-produit': 'Pour un produit, applique la règle des signes : moins par plus donne moins, moins par moins donne plus.',
  'infini-sur-infini': 'L’infini sur l’infini ne fait pas un : c’est une forme indéterminée, à lever en factorisant par le terme dominant.',
  'diviser-par-zero': 'Diviser un nombre non nul par une quantité qui tend vers zéro fait exploser le quotient : la limite est infinie, avec la règle des signes.',
  'signe-quotient': 'Pour un quotient, applique la règle des signes au numérateur et au dénominateur.',
  'lever-forme': 'Une forme indéterminée se lève : factorise par le terme de plus haut degré, c’est lui qui donne la limite.',
  'signe-terme-dominant': 'Regarde le terme de plus haut degré : le signe de son coefficient, et en moins l’infini, la parité de son exposant.',
  constantes: 'En l’infini, ce sont les termes de plus haut degré qui comptent, pas les constantes : garde le quotient de leurs coefficients.',
  degres: 'Compare les degrés : si le dénominateur l’emporte, la limite est nulle ; si c’est le numérateur, elle est infinie ; à égalité seulement, c’est le quotient des coefficients.',
  'croissances-comparees': 'Les croissances comparées lèvent l’indétermination : l’exponentielle l’emporte sur toute puissance de x, et toute puissance de x l’emporte sur le logarithme.',
  'qui-l-emporte': 'Regarde qui l’emporte : l’exponentielle sur les puissances de x, les puissances de x sur le logarithme.',
  'tvi-chaque-intervalle': 'Applique le théorème sur chaque intervalle où f est strictement monotone, puis additionne les solutions.',
  'tvi-extremites': 'Ne regarde pas seulement les valeurs aux bornes : suis chaque flèche du tableau de variations.',
  'proche-de-un': 'Une raison proche de un n’est pas égale à un : q puissance n ne tend pas vers un.',
  'raison-et-un': 'Compare la raison à un : plus grande que un, q puissance n tend vers plus l’infini ; entre moins un et un, vers zéro.',
  'raison-negative': 'Une raison inférieure ou égale à moins un fait alterner les signes sans les écraser : la suite n’a pas de limite.',
  'raison-entre': 'Une raison entre moins un et zéro fait alterner les signes, mais les termes s’écrasent vers zéro.',
  'limite-pas-premier-terme': 'Le premier terme n’est pas la limite : q puissance n tend vers zéro, il ne reste que la constante.',
  'constante-oubliee': 'Ici, q puissance n tend vers zéro, mais la constante ajoutée, elle, reste.',
  'borne-pas-limite': 'Un majorant ou un minorant n’est pas forcément la limite : le théorème dit seulement que la suite converge.',
  'bornee-pas-infinie': 'Une suite bornée de ce côté ne peut pas partir à l’infini de ce côté.',
  'non-majoree': 'Une suite croissante qui n’est pas majorée tend vers plus l’infini : c’est un théorème du cours.',
  comparaison: 'Théorème de comparaison : une suite plus grande qu’une suite qui tend vers plus l’infini tend elle aussi vers plus l’infini.',
  'comparaison-sens': 'Être plus petite qu’une suite qui tend vers plus l’infini ne dit rien : la comparaison ne marche que dans l’autre sens.',
  gendarmes: 'Théorème des gendarmes : coincée entre deux suites de même limite, la suite a cette limite.',

  'operations-regle': 'Repère la forme : un nombre, plus ou moins l’infini, ou une forme indéterminée, puis applique les règles du cours.',
  'terme-dominant-regle': 'En l’infini, factorise par le terme de plus haut degré, en haut comme en bas.',
  'croissances-regle': 'Exponentielle, puissances de x, logarithme : dans cet ordre, le premier l’emporte.',
  'tvi-regle': 'Sur chaque intervalle où f est continue et strictement monotone, une valeur comprise entre les deux bornes est atteinte une seule fois.',
  'geometrique-regle': 'Pour q puissance n : vers zéro si la raison est entre moins un et un, vers plus l’infini si elle dépasse un, sans limite si elle est inférieure ou égale à moins un.',
  'convergence-regle': 'Monotone et bornée du bon côté, la suite converge ; pour comparer, il faut le bon sens d’inégalité.',
};
