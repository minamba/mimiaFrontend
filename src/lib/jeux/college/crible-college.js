/**
 * LE CRIBLE — multiples, diviseurs, nombres premiers, en 6e, 5e et 3e.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_DIVISIBILITE
 *   5e : MATH_5E_DIVISIBILITE
 *   3e : MATH_3E_ARITH_DIVISEURS, MATH_3E_ARITH_PREMIERS, MATH_3E_FRAC_IRRED
 *
 * EN 6e (2 + 2 + 2 + 2) :
 *   - DIVISIBLE PAR 3, 4 OU 9 : un seul nombre l'est. LES PIÈGES : regarder le
 *     dernier chiffre (pour 3 et 9, c'est la somme des chiffres), prendre un
 *     multiple de 3 pour un multiple de 9, regarder le seul chiffre des unités
 *     pour 4 ;
 *   - PAR 2, PAR 5 OU PAR 10 : un nombre qui finit par 5 n'est pas divisible par 10 ;
 *   - UN DIVISEUR : LE PIÈGE, prendre un multiple pour un diviseur ;
 *   - UN MULTIPLE : LE PIÈGE, prendre un diviseur pour un multiple.
 *
 * EN 5e (3 + 3 + 2) :
 *   - LE NOMBRE PREMIER : LES PIÈGES, croire qu'un nombre impair est premier
 *     (51 = 3 × 17), ou que 1 est premier ;
 *   - COMBIEN DE DIVISEURS : LES PIÈGES, oublier 1 et le nombre lui-même,
 *     ou ne compter qu'une fois chaque paire ;
 *   - DIVISIBLE PAR 3, 4 OU 9, comme en 6e.
 *
 * EN 3e (3 + 3 + 2) :
 *   - LE PGCD : LES PIÈGES, un diviseur commun qui n'est pas le plus grand,
 *     et le plus petit multiple commun ;
 *   - LA DÉCOMPOSITION EN FACTEURS PREMIERS : LES PIÈGES, un facteur qui
 *     n'est pas premier (4 × 3 × 5), un produit qui ne redonne pas le nombre ;
 *   - LA FRACTION IRRÉDUCTIBLE : LES PIÈGES, s'arrêter en chemin, diviser le
 *     haut et le bas par des nombres différents.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'crible-college', titre: 'Le crible', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le crible',
    accroche: 'Divisible par 3, par 4, par 9 ?',
    competences: ['MATH_6E_DIVISIBILITE'],
  },
  CINQUIEME: {
    titre: 'Le crible',
    accroche: 'Nombres premiers et diviseurs.',
    competences: ['MATH_5E_DIVISIBILITE'],
  },
  TROISIEME: {
    titre: 'Le crible',
    accroche: 'PGCD, facteurs premiers, irréductible.',
    competences: ['MATH_3E_ARITH_DIVISEURS', 'MATH_3E_ARITH_PREMIERS', 'MATH_3E_FRAC_IRRED'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && String(v) !== b);
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

export const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));

export function estPremier(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

export function diviseurs(n) {
  const liste = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) liste.push(d);
  return liste;
}

const EXPOSANTS = ['', '', '²', '³', '⁴', '⁵', '⁶'];

/** « 2³ × 3 × 5 » : les facteurs rangés, les répétés en puissance. */
export function ecrireFacteurs(facteurs) {
  const compte = new Map();
  [...facteurs].sort((x, y) => x - y).forEach((f) => compte.set(f, (compte.get(f) ?? 0) + 1));
  return [...compte].map(([f, e]) => `${f}${EXPOSANTS[e]}`).join(' × ');
}

/* -------------------------------------------------- divisible par 3, 4, 9 */

function divisiblePar(d, { entre, melanger }) {
  const multiple = d * entre(Math.ceil(100 / d), Math.floor(999 / d));
  const tirer = (forme, condition) => {
    let n = forme();
    while (!condition(n) || n === multiple) n = forme();
    return n;
  };
  let pieges;
  if (d === 9) {
    pieges = [
      [tirer(() => 3 * entre(34, 333), (n) => n % 9 !== 0), 'neuf-et-trois'],
      [tirer(() => 10 * entre(10, 99) + 9, (n) => n % 9 !== 0), 'critere-dernier-chiffre'],
    ];
  } else if (d === 3) {
    pieges = [
      [tirer(() => 10 * entre(10, 99) + 3, (n) => n % 3 !== 0), 'critere-dernier-chiffre'],
      [tirer(() => entre(100, 999), (n) => n % 3 !== 0), 'divisible-par-regle'],
    ];
  } else {
    pieges = [
      [tirer(() => 10 * entre(10, 99) + 4, (n) => n % 4 !== 0), 'critere-quatre'],
      [tirer(() => 2 * entre(50, 499), (n) => n % 4 !== 0), 'critere-quatre'],
    ];
  }
  const [p1, p2] = pieges;
  if (p1[0] === p2[0]) p2[0] = tirer(() => entre(100, 999), (n) => n % d !== 0 && n !== p1[0]);
  return manche(melanger, {
    consigne: 'divisible-par',
    question: `Lequel est divisible par ${d} ?`,
    bonne: multiple,
    pieges,
    voisin: () => { throw new Error('jamais'); },
  });
}

/* ---------------------------------------------------------------- 6e */

function critere6(finit5, { entre, melanger }) {
  const n = 10 * entre(10, 99) + (finit5 ? 5 : 2 * entre(1, 4));
  const pieges = finit5
    ? [['10', 'critere-dix'], ['2', 'critere-deux']]
    : [['5', 'critere-cinq'], ['10', 'critere-dix']];
  return {
    consigne: 'critere',
    question: `${n} est divisible par… ?`,
    choix: cartes(melanger(['2', '5', '10'])),
    bonne: finit5 ? '5' : '2',
    pieges: Object.fromEntries(pieges),
  };
}

const NOMBRES_RICHES = [24, 30, 36, 42, 45, 48, 54, 56, 60, 63, 72, 75, 84, 90, 96];

function diviseur6({ entre, au, melanger }) {
  const n = au(NOMBRES_RICHES);
  const propres = diviseurs(n).filter((d) => d > 2 && d < n);
  const bonne = au(propres);
  let faux = bonne + entre(1, 5);
  while (n % faux === 0) faux += 1;
  return manche(melanger, {
    consigne: 'diviseur',
    question: `Lequel est un diviseur de ${n} ?`,
    bonne,
    pieges: [[n * entre(2, 3), 'multiple-ou-diviseur'], [faux, 'diviseur-regle']],
    voisin: () => { throw new Error('jamais'); },
  });
}

function multiple6({ entre, au, melanger }) {
  const d = au([6, 8, 9, 10, 12, 14, 15]);
  const bonne = d * entre(3, 9);
  const div = au(diviseurs(d).filter((x) => x > 1 && x < d));
  return manche(melanger, {
    consigne: 'multiple',
    question: `Lequel est un multiple de ${d} ?`,
    bonne,
    pieges: [[div, 'multiple-ou-diviseur'], [bonne + entre(1, d - 1), 'multiple-regle']],
    voisin: () => { throw new Error('jamais'); },
  });
}

/* ---------------------------------------------------------------- 5e */

const PREMIERS = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const IMPAIRS_COMPOSES = [21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93];

function premier5(avecUn, { au, melanger }) {
  const bonne = au(PREMIERS);
  const [a, b] = melanger(IMPAIRS_COMPOSES);
  return {
    consigne: 'nombre-premier',
    question: 'Lequel est un nombre premier ?',
    choix: cartes(melanger([String(bonne), String(a), avecUn ? '1' : String(b)])),
    bonne: String(bonne),
    pieges: avecUn
      ? { [a]: 'impair-pas-premier', 1: 'un-pas-premier' }
      : { [a]: 'impair-pas-premier', [b]: 'impair-pas-premier' },
  };
}

const NOMBRES_DIVISEURS = [12, 18, 20, 24, 28, 30, 32, 40, 42, 44, 45, 48, 50, 52, 54, 56, 60, 63, 66, 70, 72, 75, 80, 90, 98, 100];

function combien5(n, { melanger }) {
  const tau = diviseurs(n).length;
  return manche(melanger, {
    consigne: 'nombre-diviseurs',
    question: `Combien ${n} a-t-il de diviseurs ?`,
    bonne: tau,
    pieges: [[tau - 2, 'oublier-un-et-lui-meme'], [tau % 2 === 0 ? tau / 2 : null, 'diviseurs-par-paires']],
    voisin: (k) => tau + k,
  });
}

/* ---------------------------------------------------------------- 3e */

const GRANDS_PGCD = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24];

function premiersEntreEux({ entre }) {
  let p;
  let q;
  do {
    p = entre(2, 9);
    q = entre(2, 9);
  } while (p === q || pgcd(p, q) !== 1);
  return [p, q];
}

function pgcd3(t) {
  const g = t.au(GRANDS_PGCD);
  const [p, q] = premiersEntreEux(t);
  const plusPetitFacteur = diviseurs(g).find((x) => x > 1);
  return manche(t.melanger, {
    consigne: 'pgcd',
    question: `PGCD(${g * p} ; ${g * q}) = ?`,
    bonne: g,
    pieges: [[g / plusPetitFacteur, 'plus-grand-diviseur'], [g * p * q, 'pgcd-ppcm']],
    voisin: (k) => g + k,
  });
}

function decomposition3({ entre, melanger }) {
  let facteurs;
  let n;
  do {
    const e = [entre(0, 4), entre(0, 3), entre(0, 2), entre(0, 1)];
    facteurs = [2, 3, 5, 7].flatMap((p, i) => Array(e[i]).fill(p));
    n = facteurs.reduce((x, y) => x * y, 1);
  } while (
    n < 24 || n > 1000 || facteurs.length < 3
    || new Set(facteurs).size < 2 || facteurs.length === new Set(facteurs).size
  );
  const bonne = ecrireFacteurs(facteurs);
  // Deux facteurs collés : un facteur qui n'est plus premier.
  const range = [...facteurs].sort((x, y) => x - y);
  const colle = [range[0] * range[1], ...range.slice(2)];
  const collee = colle.map(String).sort((x, y) => Number(x) - Number(y)).join(' × ');
  // Un facteur oublié : le produit ne redonne plus le nombre.
  const oubli = ecrireFacteurs(range.slice(1));
  return manche(melanger, {
    consigne: 'decomposition',
    question: `${n} = ?`,
    bonne,
    pieges: [[collee, 'facteur-pas-premier'], [oubli, 'produit-faux']],
    voisin: () => { throw new Error('jamais'); },
  });
}

const GRANDS_COMPOSES = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18];

function irreductible3(t) {
  const g = t.au(GRANDS_COMPOSES);
  let p;
  let q;
  do {
    p = t.entre(1, 9);
    q = t.entre(2, 9);
  } while (p === q || pgcd(p, q) !== 1);
  const [a, b] = [g * p, g * q];
  const d = diviseurs(g).find((x) => x > 1);
  return manche(t.melanger, {
    consigne: 'irreductible',
    question: `Rends irréductible : ${a}/${b}`,
    bonne: `${p}/${q}`,
    pieges: [[`${a / d}/${b / d}`, 'simplifier-jusqu-au-bout'], [`${p}/${b / d}`, 'diviser-les-deux']],
    voisin: (k) => `${p + k}/${q}`,
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  const { melanger, au } = t;
  let liste;
  if (niveau === 'TROISIEME') {
    liste = [
      pgcd3(t), pgcd3(t), pgcd3(t),
      decomposition3(t), decomposition3(t), decomposition3(t),
      irreductible3(t), irreductible3(t),
    ];
  } else if (niveau === 'CINQUIEME') {
    const nombres = melanger(NOMBRES_DIVISEURS);
    const [d1, d2] = melanger([3, 4, 9]);
    liste = [
      premier5(true, t), premier5(false, t), premier5(au([true, false]), t),
      combien5(nombres[0], t), combien5(nombres[1], t), combien5(nombres[2], t),
      divisiblePar(d1, t), divisiblePar(d2, t),
    ];
  } else {
    const [d1, d2] = melanger([3, 4, 9]);
    liste = [
      divisiblePar(d1, t), divisiblePar(d2, t),
      critere6(true, t), critere6(false, t),
      diviseur6(t), diviseur6(t),
      multiple6(t), multiple6(t),
    ];
  }
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'divisible-par': 'Un seul de ces nombres est divisible par le nombre affiché. Lequel ?',
  critere: 'Par lequel de ces nombres est-il divisible ?',
  diviseur: 'Trouve le diviseur de ce nombre.',
  multiple: 'Trouve le multiple de ce nombre.',
  'nombre-premier': 'Un seul de ces nombres est premier. Lequel ?',
  'nombre-diviseurs': 'Combien ce nombre a-t-il de diviseurs ?',
  pgcd: 'Trouve le plus grand diviseur commun de ces deux nombres.',
  decomposition: 'Décompose ce nombre en produit de facteurs premiers.',
  irreductible: 'Rends cette fraction irréductible.',

  'critere-dernier-chiffre': 'Pour trois et pour neuf, le dernier chiffre ne dit rien : additionne tous les chiffres du nombre.',
  'neuf-et-trois': 'Ce nombre est divisible par trois, mais pas par neuf : la somme de ses chiffres doit être dans la table de neuf.',
  'critere-quatre': 'Pour quatre, le chiffre des unités ne suffit pas : regarde le nombre formé par les deux derniers chiffres.',
  'critere-dix': 'Un nombre divisible par dix se termine par zéro.',
  'critere-deux': 'Un nombre divisible par deux est pair : il se termine par zéro, deux, quatre, six ou huit.',
  'critere-cinq': 'Un nombre divisible par cinq se termine par zéro ou par cinq.',
  'multiple-ou-diviseur': 'Ne confonds pas : un diviseur est plus petit que le nombre et le partage sans reste ; un multiple est dans sa table, il est plus grand.',
  'impair-pas-premier': 'Impair ne veut pas dire premier : cherche un diviseur, par exemple trois ou sept.',
  'un-pas-premier': 'Un n’est pas premier : un nombre premier a exactement deux diviseurs, un et lui-même.',
  'oublier-un-et-lui-meme': 'N’oublie pas un et le nombre lui-même : ce sont aussi des diviseurs.',
  'diviseurs-par-paires': 'Les diviseurs vont par paires : quand tu en trouves un, son partenaire compte aussi.',
  'plus-grand-diviseur': 'Ce nombre divise les deux, mais il en existe un plus grand : cherche le plus grand diviseur commun.',
  'pgcd-ppcm': 'Ce nombre est un multiple commun. Le PGCD divise les deux nombres : il est plus petit qu’eux.',
  'facteur-pas-premier': 'Un des facteurs n’est pas premier : décompose-le encore.',
  'produit-faux': 'Remultiplie tes facteurs : le produit doit redonner exactement le nombre de départ.',
  'simplifier-jusqu-au-bout': 'Cette fraction se simplifie encore : divise par le plus grand diviseur commun, ou recommence jusqu’au bout.',
  'diviser-les-deux': 'Divise le numérateur et le dénominateur par le même nombre, sinon la fraction change de valeur.',

  'divisible-par-regle': 'Pour trois et neuf, additionne les chiffres ; pour quatre, regarde les deux derniers chiffres.',
  'critere-regle': 'Divisible par deux : il est pair. Par cinq : il finit par zéro ou cinq. Par dix : il finit par zéro.',
  'diviseur-regle': 'Un diviseur partage le nombre sans reste : vérifie avec une division.',
  'multiple-regle': 'Un multiple est dans la table du nombre : vérifie avec une division sans reste.',
  'nombre-premier-regle': 'Un nombre premier n’a que deux diviseurs : un et lui-même.',
  'nombre-diviseurs-regle': 'Cherche les diviseurs par paires, en commençant par un et le nombre lui-même.',
  'pgcd-regle': 'Liste les diviseurs de chaque nombre et garde le plus grand qu’ils ont en commun.',
  'decomposition-regle': 'Divise par deux tant que tu peux, puis par trois, par cinq, par sept : n’écris que des nombres premiers.',
  'irreductible-regle': 'Divise le numérateur et le dénominateur par leur plus grand diviseur commun.',
};
