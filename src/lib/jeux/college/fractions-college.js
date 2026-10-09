/**
 * LES FRACTIONS — de la 6e à la 4e.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_FRAC_SENS, MATH_6E_FRAC_EGALES, MATH_6E_FRAC_COMPARER
 *   5e : MATH_5E_FRAC_ADD, MATH_5E_FRAC_MULT
 *   4e : MATH_4E_FRAC_OPERATIONS
 *
 * EN 6e (2 + 2 + 2 + 2) :
 *   - LE SENS : une pizza en 8 parts, 3 mangées, quelle part reste ? LES
 *     PIÈGES : donner la part mangée, ou mettre les parts mangées en bas ;
 *   - LES FRACTIONS ÉGALES : LES PIÈGES, ajouter le même nombre en haut et en
 *     bas, ou ne multiplier que le numérateur ;
 *   - SIMPLIFIER : LES PIÈGES, soustraire au lieu de diviser, ne diviser que
 *     le haut ;
 *   - COMPARER : LES PIÈGES, croire que le plus grand dénominateur fait la plus
 *     grande part, comparer les numérateurs sans même dénominateur.
 *
 * EN 5e (3 + 3 + 2) — les résultats restent tels qu'on les calcule (sans
 * simplification), comme les écrit un élève de 5e :
 *   - ADDITIONNER ET SOUSTRAIRE, dénominateurs multiples l'un de l'autre. LES
 *     PIÈGES : additionner les dénominateurs, changer le dénominateur sans
 *     changer le numérateur ;
 *   - MULTIPLIER : LES PIÈGES, le produit en croix, garder le dénominateur
 *     commun, multiplier aussi le dénominateur par l'entier ;
 *   - LE MÊME DÉNOMINATEUR : 3/4 = ?/12.
 *
 * EN 4e (3 + 3 + 2) — résultats irréductibles :
 *   - DIVISER : multiplier par l'inverse. LES PIÈGES : multiplier sans
 *     inverser, inverser la mauvaise fraction ;
 *   - ADDITIONNER, SOUSTRAIRE avec des dénominateurs quelconques ;
 *   - LA PRIORITÉ : 1/2 + 3/4 × 2/5, la multiplication d'abord.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'fractions-college', titre: 'Les fractions', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Les fractions',
    accroche: 'Égales, simplifiées, la plus grande.',
    competences: ['MATH_6E_FRAC_SENS', 'MATH_6E_FRAC_EGALES', 'MATH_6E_FRAC_COMPARER'],
  },
  CINQUIEME: {
    titre: 'Les fractions',
    accroche: 'Additionner et multiplier des fractions.',
    competences: ['MATH_5E_FRAC_ADD', 'MATH_5E_FRAC_MULT'],
  },
  QUATRIEME: {
    titre: 'Les fractions',
    accroche: 'Les quatre opérations, même la division.',
    competences: ['MATH_4E_FRAC_OPERATIONS'],
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
  // Un piège qui vaudrait la bonne réponse (4/8 pour 1/2) serait juste : on l'écarte.
  const valides = pieges.filter(([v]) => v !== null && !egales(String(v), b));
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

/** « 6/8 » et « 3/4 » ont la même valeur : produits en croix. */
function egales(x, y) {
  const [a, b = 1] = x.split('/').map(Number);
  const [c, d = 1] = y.split('/').map(Number);
  return a * d === b * c;
}

/** « 3/4 », irréductible ; « 2 » quand le dénominateur vaut 1. Null si négatif ou nul. */
export function irred(n, d) {
  if (n <= 0 || d <= 0) return null;
  const g = pgcd(n, d);
  return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`;
}

/** Une fraction telle qu'on l'écrit, sans la simplifier. Null si négative ou nulle. */
const brute = (n, d) => (n > 0 && d > 0 ? `${n}/${d}` : null);

/** Une fraction irréductible strictement entre 0 et 1, dénominateur entre 2 et max. */
function propre({ entre }, max = 9) {
  let n;
  let d;
  do {
    d = entre(2, max);
    n = entre(1, d - 1);
  } while (pgcd(n, d) !== 1);
  return [n, d];
}

/* ---------------------------------------------------------------- 6e */

const OBJETS = [
  ['Une pizza', 'parts'],
  ['Une tablette de chocolat', 'carrés'],
  ['Un gâteau', 'parts'],
  ['Une tarte', 'parts'],
];

function sens6(t) {
  const [objet, morceaux] = t.au(OBJETS);
  const total = t.entre(5, 12);
  let pris = t.entre(1, total - 1);
  if (pris * 2 === total) pris += 1;
  const reste = total - pris;
  return manche(t.melanger, {
    consigne: 'sens',
    question: `${objet} en ${total} ${morceaux} égales ; on en prend ${pris}. Quelle fraction reste ?`,
    bonne: brute(reste, total),
    pieges: [[brute(pris, total), 'ce-qui-reste'], [brute(reste, pris), 'denominateur-total']],
    voisin: (k) => brute(reste, total + k),
  });
}

function egales6(t) {
  let a;
  let b;
  do {
    [a, b] = [t.entre(1, 8), t.entre(2, 9)];
  } while (a === b || pgcd(a, b) !== 1);
  const k = t.entre(2, 5);
  return manche(t.melanger, {
    consigne: 'egales',
    question: `Quelle fraction est égale à ${a}/${b} ?`,
    bonne: brute(a * k, b * k),
    pieges: [[brute(a + k, b + k), 'ajouter-pas-multiplier'], [brute(a * k, b), 'multiplier-les-deux']],
    voisin: (j) => brute(a * k + j, b * k),
  });
}

function simplifier6(t) {
  const [p, q] = propre(t);
  const g = t.entre(2, 6);
  const [a, b] = [g * p, g * q];
  return manche(t.melanger, {
    consigne: 'simplifier',
    question: `Simplifie : ${a}/${b}`,
    bonne: brute(p, q),
    pieges: [[brute(p, b - a + p), 'soustraire-pas-diviser'], [brute(p, b), 'diviser-les-deux']],
    voisin: (j) => brute(p + j, q),
  });
}

function comparer6(memeNumerateur, t) {
  let gauche;
  let droite;
  let bonne;
  let piege;
  if (memeNumerateur) {
    const a = t.entre(1, 4);
    let [b, c] = [t.entre(a + 1, 9), t.entre(a + 1, 9)];
    while (b === c) c = t.entre(a + 1, 10);
    [gauche, droite] = [`${a}/${b}`, `${a}/${c}`];
    bonne = b < c ? gauche : droite;
    piege = 'grand-denominateur';
  } else {
    // a/b contre c/(b × k), avec c plus grand que a mais a/b plus grand.
    let a;
    let b;
    let k;
    let c;
    do {
      b = t.entre(2, 5);
      k = t.entre(2, 3);
      a = t.entre(1, b - 1);
      c = a * k - 1;
    } while (c <= a);
    if (c > a + 1) c = t.entre(a + 1, a * k - 1);
    [gauche, droite] = [`${a}/${b}`, `${c}/${b * k}`];
    bonne = gauche;
    piege = 'comparer-sans-convertir';
  }
  const autre = bonne === gauche ? droite : gauche;
  return {
    consigne: 'comparer',
    question: `${gauche}   ou   ${droite} ?`,
    choix: cartes(t.melanger([gauche, droite])),
    bonne,
    pieges: { [autre]: piege },
  };
}

/* ---------------------------------------------------------------- 5e */

function additionner5(soustraire, t) {
  let a;
  let b;
  let c;
  let k;
  // La deuxième fraction est irréductible ; pour une soustraction, son
  // numérateur est plus petit que le premier, pour que les erreurs des élèves
  // (soustraire les numérateurs et les dénominateurs) restent possibles.
  do {
    [a, b] = propre(t, 6);
    k = t.entre(2, 4);
    c = t.entre(1, soustraire ? Math.max(1, a - 1) : b * k - 1);
  } while (pgcd(c, b * k) !== 1 || (soustraire && c >= a));
  const d = b * k;
  const signe = soustraire ? '−' : '+';
  const haut = soustraire ? a * k - c : a * k + c;
  const naif = soustraire ? a - c : a + c;
  const basNaif = soustraire ? d - b : d + b;
  return manche(t.melanger, {
    consigne: 'additionner',
    question: `${a}/${b} ${signe} ${c}/${d} = ?`,
    bonne: brute(haut, d),
    pieges: [[brute(naif, basNaif), 'additionner-denominateurs'], [brute(naif, d), 'convertir-numerateur']],
    voisin: (j) => brute(haut + j, d),
  });
}

function multiplier5(sorte, t) {
  if (sorte === 'entier') {
    const [a, b] = propre(t);
    const n = t.entre(2, 6);
    return manche(t.melanger, {
      consigne: 'multiplier',
      question: `${n} × ${a}/${b} = ?`,
      bonne: brute(n * a, b),
      pieges: [[brute(n * a, n * b), 'entier-fois-fraction'], [brute(n + a, b), 'multiplier-pas-ajouter']],
      voisin: (j) => brute(n * a + j, b),
    });
  }
  const [a, b] = propre(t);
  let [c, d] = propre(t);
  if (sorte === 'meme-bas') {
    d = b;
    c = t.entre(1, b - 1);
  }
  if (c === d) c = 1;
  const pieges = sorte === 'meme-bas'
    ? [[brute(a * c, b), 'garder-denominateur'], [brute(a * d, b * c), 'produit-en-croix']]
    : [[brute(a * d, b * c), 'produit-en-croix'], [brute(a + c, b + d), 'multiplier-pas-ajouter']];
  return manche(t.melanger, {
    consigne: 'multiplier',
    question: `${a}/${b} × ${c}/${d} = ?`,
    bonne: brute(a * c, b * d),
    pieges,
    voisin: (j) => brute(a * c + j, b * d),
  });
}

function memeDenominateur5(t) {
  const [a, b] = propre(t, 7);
  const k = t.entre(2, 5);
  const d = b * k;
  return manche(t.melanger, {
    consigne: 'meme-denominateur',
    question: `${a}/${b} = …/${d}`,
    bonne: brute(a * k, d),
    pieges: [[brute(a, d), 'convertir-numerateur'], [brute(a + d - b, d), 'ajouter-pas-multiplier']],
    voisin: (j) => brute(a * k + j, d),
  });
}

/* ---------------------------------------------------------------- 4e */

function diviser4(entier, t) {
  if (entier) {
    const [a, b] = propre(t);
    const n = a * t.entre(1, 4) + (a === 1 ? 1 : 0);
    return manche(t.melanger, {
      consigne: 'diviser',
      question: `${n} ÷ ${a}/${b} = ?`,
      bonne: irred(n * b, a),
      pieges: [[irred(n * a, b), 'diviser-inverse'], [irred(a, n * b), 'inverser-la-bonne']],
      voisin: (j) => irred(n * b + j * a, a),
    });
  }
  let a;
  let b;
  let c;
  let d;
  do {
    [a, b] = propre(t);
    [c, d] = propre(t);
  } while (a * d === b * c);
  return manche(t.melanger, {
    consigne: 'diviser',
    question: `${a}/${b} ÷ ${c}/${d} = ?`,
    bonne: irred(a * d, b * c),
    pieges: [[irred(a * c, b * d), 'diviser-inverse'], [irred(b * c, a * d), 'inverser-la-bonne']],
    voisin: (j) => irred(a * d + j, b * c),
  });
}

function somme4(soustraire, t) {
  let a;
  let b;
  let c;
  let d;
  do {
    [a, b] = propre(t, 8);
    [c, d] = propre(t, 8);
  } while (b === d || b % d === 0 || d % b === 0 || (soustraire && a * d <= c * b));
  const m = (b * d) / pgcd(b, d);
  const haut = soustraire ? a * (m / b) - c * (m / d) : a * (m / b) + c * (m / d);
  const naif = soustraire ? a - c : a + c;
  const basNaif = soustraire ? b - d : b + d;
  return manche(t.melanger, {
    consigne: 'somme',
    question: `${a}/${b} ${soustraire ? '−' : '+'} ${c}/${d} = ?`,
    bonne: irred(haut, m),
    pieges: [[irred(naif, basNaif), 'additionner-denominateurs'], [irred(naif, m), 'convertir-numerateur']],
    voisin: (j) => irred(haut + j, m),
  });
}

function priorite4(t) {
  let a;
  let b;
  let c;
  let d;
  let e;
  let f;
  do {
    [a, b] = propre(t, 4);
    [c, d] = propre(t, 5);
    [e, f] = propre(t, 5);
  } while (e === f);
  // a/b + (c/d × e/f) = (a d f + b c e) / (b d f).
  const bonne = irred(a * d * f + b * c * e, b * d * f);
  // (a/b + c/d) × e/f = (a d + b c) e / (b d f).
  const piege = irred((a * d + b * c) * e, b * d * f);
  return manche(t.melanger, {
    consigne: 'priorite',
    question: `${a}/${b} + ${c}/${d} × ${e}/${f} = ?`,
    bonne,
    pieges: [[piege, 'priorite-fractions']],
    voisin: (j) => irred(a * d * f + b * c * e + j, b * d * f),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  let liste;
  if (niveau === 'QUATRIEME') {
    liste = [
      diviser4(false, t), diviser4(false, t), diviser4(true, t),
      somme4(false, t), somme4(false, t), somme4(true, t),
      priorite4(t), priorite4(t),
    ];
  } else if (niveau === 'CINQUIEME') {
    const [m1, m2] = t.melanger(['entier', 'meme-bas', 'quelconque']);
    liste = [
      additionner5(false, t), additionner5(false, t), additionner5(true, t),
      multiplier5(m1, t), multiplier5(m2, t), multiplier5('quelconque', t),
      memeDenominateur5(t), memeDenominateur5(t),
    ];
  } else {
    liste = [
      sens6(t), sens6(t),
      egales6(t), egales6(t),
      simplifier6(t), simplifier6(t),
      comparer6(true, t), comparer6(false, t),
    ];
  }
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  sens: 'Quelle fraction du tout reste-t-il ?',
  egales: 'Trouve la fraction égale à celle-ci.',
  simplifier: 'Simplifie cette fraction.',
  comparer: 'Laquelle de ces deux fractions est la plus grande ?',
  additionner: 'Calcule, en mettant d’abord les fractions au même dénominateur.',
  multiplier: 'Calcule ce produit de fractions.',
  'meme-denominateur': 'Écris cette fraction avec le dénominateur demandé.',
  diviser: 'Calcule ce quotient, et donne le résultat irréductible.',
  somme: 'Calcule, et donne le résultat irréductible.',
  priorite: 'Calcule en respectant les priorités, résultat irréductible.',

  'ce-qui-reste': 'On demande la part qui reste : enlève les parts prises du nombre total de parts.',
  'denominateur-total': 'En bas, on écrit le nombre total de parts égales ; en haut, le nombre de parts qu’on garde.',
  'ajouter-pas-multiplier': 'Pour garder la même valeur, on multiplie le numérateur et le dénominateur par le même nombre : on n’ajoute pas.',
  'multiplier-les-deux': 'Multiplie le numérateur ET le dénominateur par le même nombre.',
  'soustraire-pas-diviser': 'Pour simplifier, on divise le numérateur et le dénominateur par le même nombre : on ne soustrait pas.',
  'diviser-les-deux': 'Divise le numérateur ET le dénominateur par le même nombre.',
  'grand-denominateur': 'Plus on partage en parts nombreuses, plus chaque part est petite : avec le même numérateur, le plus petit dénominateur gagne.',
  'comparer-sans-convertir': 'Mets d’abord les deux fractions au même dénominateur, puis compare les numérateurs.',
  'additionner-denominateurs': 'On n’additionne pas les dénominateurs : on met les fractions au même dénominateur, puis on opère sur les numérateurs.',
  'convertir-numerateur': 'Quand tu multiplies le dénominateur, multiplie aussi le numérateur par le même nombre.',
  'produit-en-croix': 'Pour multiplier deux fractions, on multiplie les numérateurs entre eux et les dénominateurs entre eux, sans croiser.',
  'garder-denominateur': 'Le même dénominateur, c’est pour additionner. Pour multiplier, on multiplie aussi les dénominateurs.',
  'entier-fois-fraction': 'Un nombre entier fois une fraction : on multiplie seulement le numérateur.',
  'multiplier-pas-ajouter': 'C’est une multiplication : multiplie les numérateurs entre eux et les dénominateurs entre eux.',
  'diviser-inverse': 'Diviser par une fraction, c’est multiplier par son inverse : retourne la deuxième fraction.',
  'inverser-la-bonne': 'On retourne la fraction par laquelle on divise, c’est-à-dire la deuxième, pas la première.',
  'priorite-fractions': 'Avec les fractions aussi, la multiplication passe avant l’addition.',

  'sens-regle': 'Le dénominateur compte toutes les parts ; le numérateur, celles qui restent.',
  'egales-regle': 'Multiplie le numérateur et le dénominateur par le même nombre.',
  'simplifier-regle': 'Divise le numérateur et le dénominateur par un même diviseur commun.',
  'comparer-regle': 'Mets les deux fractions au même dénominateur, puis compare les numérateurs.',
  'additionner-regle': 'Même dénominateur d’abord, puis additionne ou soustrais les numérateurs ; le dénominateur ne change pas.',
  'multiplier-regle': 'Numérateur fois numérateur, dénominateur fois dénominateur.',
  'meme-denominateur-regle': 'Cherche par combien on a multiplié le dénominateur, et multiplie le numérateur par ce même nombre.',
  'diviser-regle': 'Multiplie la première fraction par l’inverse de la deuxième, puis simplifie.',
  'somme-regle': 'Cherche un dénominateur commun, convertis les deux fractions, opère sur les numérateurs, puis simplifie.',
  'priorite-regle': 'Calcule d’abord le produit, puis ajoute la première fraction, au même dénominateur.',
};
