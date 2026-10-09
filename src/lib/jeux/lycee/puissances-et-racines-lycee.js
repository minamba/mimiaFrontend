/**
 * PUISSANCES ET RACINES — seconde.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL : MATH_2DE_PUISSANCES.
 *
 * CINQ SORTES DE MANCHES (3 + 1 + 1 + 1 + 2) :
 *   - LES RÈGLES DES PUISSANCES, exposants entiers relatifs, avec une lettre
 *     pour base (deux exposants différents donnent deux expressions
 *     différentes) : produit, quotient, puissance de puissance. LES PIÈGES :
 *     multiplier les exposants d'un produit, additionner ceux d'un quotient
 *     ou d'une puissance de puissance, perdre un signe moins, soustraire à
 *     l'envers ;
 *   - L'EXPOSANT NÉGATIF : 2⁻³ = 1/8. LES PIÈGES, −8 (le nombre devient
 *     négatif) et le nombre fois l'exposant ;
 *   - SIMPLIFIER UNE RACINE : √50 = 5√2. LES PIÈGES, sortir le carré au lieu
 *     de sa racine (25√2), sortir un facteur qui n'est pas un carré (5√10) ;
 *   - CALCULER AVEC DES RACINES : √9 + √16 n'est pas √25 ; √2 × √8 = √16 = 4,
 *     pas √10, et il faut prendre la racine du produit ;
 *   - L'ÉCRITURE SCIENTIFIQUE : LES PIÈGES, le signe de l'exposant, un rang de
 *     trop, et la bonne valeur dont le premier facteur n'est pas entre 1 et 10.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'puissances-et-racines-lycee', titre: 'Puissances et racines', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Puissances et racines',
    accroche: 'Exposants, racines et écriture scientifique.',
    competences: ['MATH_2DE_PUISSANCES'],
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

const EXPOSANTS = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
/** −3 → « ⁻³ ». */
const sup = (n) => String(n).split('').map((c) => EXPOSANTS[c]).join('');
/** « a⁻³ » ; l'exposant 1 ne s'écrit pas : « a ». */
const puiss = (base, e) => (e === 1 ? base : `${base}${sup(e)}`);

function nonNul(t, min, max) {
  let a;
  do {
    a = t.entre(min, max);
  } while (a === 0);
  return a;
}

/* --------------------------------------------------- les règles de calcul */

function regles(t, sorte) {
  const L = t.au(['a', 'x']);
  let m;
  let n;
  let e;
  do {
    m = nonNul(t, -5, 7);
    n = nonNul(t, -4, 6);
    if (sorte === 'produit') e = m + n;
    else if (sorte === 'quotient') e = m - n;
    else {
      n = t.au([-3, -2, 2, 3]);
      m = nonNul(t, -4, 4);
      e = m * n;
    }
  } while (e === 0 || e === 1 || (sorte === 'puissance' && m === 1) || (m < 0 && n < 0 && sorte !== 'puissance') || (m > 0 && n > 0 && sorte !== 'puissance'));
  // Au moins un exposant négatif dans un produit ou un quotient : c'est là que l'on se trompe.
  let question;
  let pieges;
  if (sorte === 'produit') {
    question = `${puiss(L, m)} × ${puiss(L, n)} = ?`;
    pieges = [[m * n, 'produit-additionner'], [m - n, 'signe-de-l-exposant']];
  } else if (sorte === 'quotient') {
    question = `${puiss(L, m)} ÷ ${puiss(L, n)} = ?`;
    pieges = [[m + n, 'quotient-soustraire'], [n - m, 'ordre-du-quotient']];
  } else {
    question = `(${puiss(L, m)})${sup(n)} = ?`;
    pieges = [[m + n, 'puissance-multiplier'], [-e, 'signe-de-l-exposant']];
  }
  return manche(t.melanger, {
    consigne: 'regles-puissances',
    question,
    bonne: puiss(L, e),
    pieges: pieges.map(([x, p]) => [puiss(L, x), p]),
    voisin: (k) => puiss(L, e + (k % 2 ? k : -k)),
  });
}

/* ------------------------------------------------- l'exposant négatif */

function negative(t) {
  const b = t.au([2, 3, 4, 5, 10]);
  const n = b === 10 ? t.entre(1, 3) : t.entre(2, 3);
  const v = b ** n;
  return manche(t.melanger, {
    consigne: 'puissance-negative',
    question: `${b}${sup(-n)} = ?`,
    bonne: `1/${v}`,
    pieges: [
      [`−${v}`, 'exposant-negatif-inverse'],
      t.au([[`−${b * n}`, 'puissance-pas-produit'], [`1/${b * n}`, 'puissance-pas-produit']]),
    ],
    voisin: (k) => `1/${v + k}`,
  });
}

/* ------------------------------------------------- simplifier une racine */

function simplifier(t) {
  const k = t.entre(2, 6);
  const m = t.au([2, 3, 5, 6, 7]);
  const n = k * k * m;
  return manche(t.melanger, {
    consigne: 'simplifier-racine',
    question: `√${n} = ?`,
    bonne: `${k}√${m}`,
    pieges: [[`${k * k}√${m}`, 'sortir-la-racine'], [`${k}√${k * m}`, 'carre-parfait']],
    voisin: (j) => `${k + j}√${m}`,
  });
}

/* ------------------------------------------- calculer avec des racines */

function racines(t) {
  if (t.au([true, false])) {
    const p = t.entre(2, 9);
    let q;
    do {
      q = t.entre(2, 9);
    } while (q === p);
    return manche(t.melanger, {
      consigne: 'racines',
      question: `√${p * p} + √${q * q} = ?`,
      bonne: `${p + q}`,
      pieges: [[`√${p * p + q * q}`, 'racine-de-somme']],
      voisin: (k) => `${p + q + (k % 2 ? k : -k)}`,
    });
  }
  const m = t.au([2, 3, 5]);
  const [u, v] = t.melanger([1, 2, 3]);
  const [a, b] = [m * u * u, m * v * v];
  return manche(t.melanger, {
    consigne: 'racines',
    question: `√${a} × √${b} = ?`,
    bonne: `${m * u * v}`,
    pieges: [[`√${a + b}`, 'produit-de-racines'], [`${a * b}`, 'racine-oubliee']],
    voisin: (k) => `${m * u * v + k}`,
  });
}

/* ------------------------------------------------ l'écriture scientifique */

/** « 325000 » → « 325 000 », par groupes de trois (espace fine insécable). */
const grouper = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function scientifique(t) {
  const premier = t.entre(1, 9);
  const longueur = t.entre(1, 3);
  let chiffres = String(premier);
  while (chiffres.length < longueur - 1) chiffres += String(t.entre(0, 9));
  if (longueur > 1) chiffres += String(t.entre(1, 9)); // jamais de zéro à la fin
  const grand = t.au([true, false]);
  const e = grand ? t.entre(3, 7) : -t.entre(2, 6);
  const ecrit = e >= 0
    ? grouper(chiffres + '0'.repeat(e + 1 - chiffres.length))
    : `0,${'0'.repeat(-e - 1)}${chiffres}`;
  const facteur = chiffres.length > 1 ? `${chiffres[0]},${chiffres.slice(1)}` : chiffres;
  const sci = (f, x) => `${f} × 10${sup(x)}`;
  return manche(t.melanger, {
    consigne: 'scientifique',
    question: `${ecrit} = ?`,
    bonne: sci(facteur, e),
    pieges: t.melanger([
      [sci(facteur, -e), 'exposant-du-sens'],
      [sci(facteur, e + 1), 'compter-les-rangs'],
      [sci(chiffres, e - chiffres.length + 1), 'facteur-entre-un-et-dix'],
    ]),
    voisin: (k) => sci(facteur, e - k),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  return t.melanger([
    regles(t, 'produit'), regles(t, 'quotient'), regles(t, 'puissance'),
    negative(t), simplifier(t), racines(t),
    scientifique(t), scientifique(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'regles-puissances': 'Écris ce calcul sous la forme d’une seule puissance.',
  'puissance-negative': 'Que vaut cette puissance d’exposant négatif ?',
  'simplifier-racine': 'Simplifie cette racine : un entier fois la racine du plus petit nombre possible.',
  racines: 'Calcule, en respectant les règles des racines carrées.',
  scientifique: 'Donne l’écriture scientifique de ce nombre.',

  'produit-additionner': 'Quand on multiplie deux puissances d’un même nombre, on additionne les exposants : on ne les multiplie pas.',
  'signe-de-l-exposant': 'Attention au signe : un exposant négatif se compte avec son signe moins.',
  'quotient-soustraire': 'Pour diviser deux puissances d’un même nombre, on soustrait les exposants.',
  'ordre-du-quotient': 'On soustrait dans l’ordre : l’exposant du nombre divisé moins l’exposant du diviseur.',
  'puissance-multiplier': 'Une puissance de puissance : on multiplie les exposants, on ne les additionne pas.',
  'exposant-negatif-inverse': 'Un exposant négatif ne rend pas le nombre négatif : il donne l’inverse de la puissance.',
  'puissance-pas-produit': 'Une puissance, c’est le nombre multiplié par lui-même plusieurs fois, pas le nombre fois l’exposant.',
  'sortir-la-racine': 'Ce qui sort de la racine, c’est la racine du carré, pas le carré lui-même.',
  'carre-parfait': 'Écris d’abord le nombre comme un carré parfait fois un autre nombre : seule la racine du carré parfait sort.',
  'racine-de-somme': 'La racine d’une somme n’est pas la somme des racines : calcule chaque racine d’abord.',
  'produit-de-racines': 'Racine de a fois racine de b, c’est la racine du produit, pas celle de la somme.',
  'racine-oubliee': 'Tu as multiplié sous la racine, mais il reste à prendre la racine du produit.',
  'exposant-du-sens': 'Un nombre plus petit que un a un exposant négatif ; un grand nombre, un exposant positif.',
  'compter-les-rangs': 'Compte de combien de rangs la virgule se déplace pour ne laisser qu’un chiffre non nul devant elle.',
  'facteur-entre-un-et-dix': 'La valeur est juste, mais en écriture scientifique, le nombre devant la puissance de dix est compris entre un et dix.',

  'regles-puissances-regle': 'Produit : on additionne les exposants. Quotient : on les soustrait. Puissance de puissance : on les multiplie.',
  'puissance-negative-regle': 'Un nombre à la puissance moins n, c’est un sur ce nombre à la puissance n.',
  'simplifier-racine-regle': 'Cherche le plus grand carré parfait qui divise le nombre, et sors sa racine.',
  'racines-regle': 'La racine d’un produit est le produit des racines ; pour une somme, il n’y a pas de règle.',
  'scientifique-regle': 'Un seul chiffre non nul avant la virgule, puis la puissance de dix qui rend la bonne valeur.',
};
