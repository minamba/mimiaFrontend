/**
 * LA TOUR DES PUISSANCES — puissances et notation scientifique, de la 5e à la 3e.
 * Professeure : Nora (mathématiques).
 *
 * LES ÉCRITURES SONT EXACTES : les nombres à virgule se construisent à partir
 * de leurs chiffres (jamais par un calcul en virgule flottante), et les
 * exposants s'écrivent en exposant (2³, 10⁻⁴).
 *
 * PAR CLASSE (trois sortes de manches, 3 + 3 + 2, mélangées) :
 *   5e — la valeur d'une puissance, un produit écrit en puissance, les
 *        priorités avec une puissance ;
 *   4e — les puissances de dix (exposant négatif, produit, quotient),
 *        l'écriture scientifique, les signes et les parenthèses ;
 *   3e — produit en écriture scientifique, comparer des écritures
 *        scientifiques, quotient en écriture scientifique.
 *
 * LE PIÈGE ROI : 2³ = 6, la puissance prise pour un produit par l'exposant.
 * Puis : l'exposant négatif qui rendrait le nombre négatif, les exposants
 * multipliés au lieu d'être ajoutés, −3² confondu avec (−3)², « 45 × 10³ »
 * pris pour une écriture scientifique, la retenue oubliée quand le produit
 * dépasse dix, le plus grand nombre devant la puissance pris pour le plus grand.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'tour-des-puissances', titre: 'La tour des puissances', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'La tour des puissances',
    accroche: 'Deux au cube, ce n’est pas six.',
    competences: ['MATH_5E_PUISSANCES'],
  },
  QUATRIEME: {
    titre: 'La tour des puissances',
    accroche: 'Puissances de dix et écriture scientifique.',
    competences: ['MATH_4E_PUISSANCES', 'MATH_4E_PUISS_DIX'],
  },
  TROISIEME: {
    titre: 'La tour des géants',
    accroche: 'Calcule avec l’écriture scientifique.',
    competences: ['MATH_3E_PUISSANCES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const SUP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
/** « ⁻³ » */
export const exposant = (n) => String(n).split('').map((c) => SUP[c]).join('');
/** « 3 045 », « −1 000 » */
const grouper = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const entier = (n) => (n < 0 ? `−${grouper(String(-n))}` : grouper(String(n)));

/** N × 10^k écrit exactement, à la française (N entier positif). */
export function decimal(N, k) {
  const s = String(N);
  if (k >= 0) return grouper(s + '0'.repeat(k));
  const pos = s.length + k;
  const ent = pos > 0 ? s.slice(0, pos) : '0';
  const dec = (pos > 0 ? s.slice(pos) : '0'.repeat(-pos) + s).replace(/0+$/, '');
  return dec ? `${grouper(ent)},${dec}` : grouper(ent);
}

/** « 4,5 × 10⁻³ » : m est un entier de chiffres, d le nombre de décimales de la mantisse. */
const sci = (mantisse, e) => `${mantisse} × 10${exposant(e)}`;
/** La mantisse d'un entier N de un ou deux chiffres significatifs : 45 → « 4,5 », 40 → « 4 ». */
const mantisseDe = (N) => decimal(N, -(String(N).length - 1));

function faire(melanger, consigne, question, bonne, paires, voisin, extra = {}) {
  const liste = troisChoix(bonne, paires.map(([k]) => k), voisin);
  const pieges = {};
  paires.forEach(([k, p]) => {
    if (k !== bonne && liste.includes(k) && !(k in pieges)) pieges[k] = p;
  });
  return {
    consigne, question, choix: melanger(liste).map((c) => ({ cle: c, libelle: c })), bonne, pieges, ...extra,
  };
}

function nonNul(entre, a, b) {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
}

/* ------------------------------------------------------------------ 5e */

function valeur(o) {
  const { entre, au, melanger } = o;
  const a = au([2, 3, 4, 5, 10]);
  if (a === 10) {
    const n = entre(2, 6);
    return faire(melanger, 'valeur-puissance', `10${exposant(n)} = ?`, entier(10 ** n), [
      [entier(10 * n), 'puissance-produit'],
      [entier(10 ** (n + 1)), 'puissance-dix-zeros'],
    ], (i) => entier(10 ** (n - i)));
  }
  const n = entre(3, a <= 3 ? 5 : 4); // 2⁴ = 4² : le piège tombe, un voisin le remplace
  return faire(melanger, 'valeur-puissance', `${a}${exposant(n)} = ?`, entier(a ** n), [
    [entier(a * n), 'puissance-produit'],
    [entier(n ** a), 'puissance-inverse'],
  ], (i) => entier(a ** n + i));
}

function ecrirePuissance(o) {
  const { entre, melanger } = o;
  const a = entre(2, 9);
  let n = entre(3, 6);
  if (n === a) n = a === 6 ? 5 : n + 1;
  if (a === 2 && n === 4) n = 5; // 2⁴ = 4² : le piège « 4² » serait juste
  return faire(melanger, 'ecrire-puissance', `${Array(n).fill(a).join(' × ')} = ?`, `${a}${exposant(n)}`, [
    [`${n}${exposant(a)}`, 'puissance-inverse'],
    [`${a} × ${n}`, 'puissance-produit'],
  ], () => `${a}${exposant(n + 1)}`);
}

function priorite(o) {
  const { entre, au, melanger } = o;
  const a = entre(2, 5);
  const b = entre(2, 9);
  const n = au([2, 2, 3]);
  if (au([true, false])) {
    return faire(melanger, 'calcul-puissance', `${b} + ${a}${exposant(n)} = ?`, entier(b + a ** n), [
      [entier((b + a) ** n), 'priorite-puissance'],
      [entier(b + a * n), 'puissance-produit'],
    ], (i) => entier(b + a ** n + i));
  }
  return faire(melanger, 'calcul-puissance', `${b} × ${a}${exposant(n)} = ?`, entier(b * a ** n), [
    [entier((b * a) ** n), 'priorite-puissance'],
    [entier(b * a * n), 'puissance-produit'],
  ], (i) => entier(b * a ** n + b * i));
}

/* ------------------------------------------------------------------ 4e */

function puissanceDix(o) {
  const { entre, au, melanger } = o;
  const sorte = au(['negatif', 'produit', 'quotient']);
  if (sorte === 'negatif') {
    const n = entre(2, 5);
    return faire(melanger, 'puissance-dix', `10${exposant(-n)} = ?`, decimal(1, -n), [
      [entier(-(10 ** n)), 'exposant-negatif'],
      [decimal(1, -n - 1), 'puissance-dix-negatif'],
    ], (i) => decimal(1, -n + i));
  }
  if (sorte === 'produit') {
    let a = nonNul(entre, -4, 6);
    let b = nonNul(entre, -4, 6);
    if (a + b === 0) b += b > 0 ? 1 : -1; // 10⁰ = 100⁰ : le piège serait juste
    if (a * b === a + b) a += 1; // 2 et 2 : le piège serait juste
    return faire(melanger, 'puissance-dix', `10${exposant(a)} × 10${exposant(b)} = ?`, `10${exposant(a + b)}`, [
      [`10${exposant(a * b)}`, 'produit-exposants'],
      [`100${exposant(a + b)}`, 'produit-bases'],
    ], (i) => `10${exposant(a + b + i)}`);
  }
  const a = entre(-3, 8);
  let b = nonNul(entre, -4, 6);
  if (b === a) b = a + 1 === 0 ? a + 2 : a + 1;
  return faire(melanger, 'puissance-dix', `10${exposant(a)} ÷ 10${exposant(b)} = ?`, `10${exposant(a - b)}`, [
    [`10${exposant(a + b)}`, 'quotient-exposants'],
    [`10${exposant(b - a)}`, 'quotient-ordre'],
  ], (i) => `10${exposant(a - b + i)}`);
}

function scientifique(o) {
  const { entre, au, melanger } = o;
  const d1 = entre(1, 9);
  const d2 = entre(0, 9);
  const N = 10 * d1 + d2;
  const e = au([-5, -4, -3, -2, -1, 2, 3, 4, 5, 6]); // jamais 1 : « 45 × 10⁰ » ne serait pas un piège crédible
  const m = mantisseDe(N);
  // N × 10^k = m × 10^e, avec k = e − 1.
  const k = e - 1;
  const pieges = melanger([
    [`${N} × 10${exposant(k)}`, 'scientifique-un-chiffre'],
    [sci(m, e + au([-1, 1])), 'scientifique-exposant'],
    ...(e < 0 ? [[sci(m, -e), 'exposant-negatif-sci']] : []),
  ]);
  return faire(melanger, 'scientifique', `Écriture scientifique de ${decimal(N, k)} ?`, sci(m, e), pieges,
    (i) => sci(m, e + 1 + i));
}

function signes(o) {
  const { entre, au, melanger } = o;
  const sorte = au(['parenthese', 'sans', 'produit']);
  const a = entre(2, 5);
  if (sorte === 'parenthese') {
    const n = entre(2, 4);
    const v = (-a) ** n;
    return faire(melanger, 'signes-puissance', `(−${a})${exposant(n)} = ?`, entier(v), [
      [entier(-v), 'signe-puissance'],
      [entier(-a * n), 'puissance-produit'],
    ], (i) => entier(v + i));
  }
  if (sorte === 'sans') {
    const n = au([2, 4]);
    return faire(melanger, 'signes-puissance', `−${a}${exposant(n)} = ?`, entier(-(a ** n)), [
      [entier(a ** n), 'parenthese-puissance'],
      [entier(-a * n), 'puissance-produit'],
    ], (i) => entier(-(a ** n) - i));
  }
  const b = entre(2, 7);
  const m = entre(2, 6);
  let n = entre(2, 6);
  if (m === 2 && n === 2) n = 3;
  return faire(melanger, 'signes-puissance', `${b}${exposant(m)} × ${b}${exposant(n)} = ?`, `${b}${exposant(m + n)}`, [
    [`${b}${exposant(m * n)}`, 'produit-exposants'],
    [`${b * b}${exposant(m + n)}`, 'produit-bases'],
  ], (i) => `${b}${exposant(m + n + i)}`);
}

/* ------------------------------------------------------------------ 3e */

function produitSci(o) {
  const { entre, melanger } = o;
  const m1 = entre(2, 9);
  const m2 = entre(2, 9);
  const e1 = entre(-6, 8);
  let e2 = entre(-6, 8);
  if (e1 * e2 === e1 + e2) e2 += 1;
  const p = m1 * m2;
  const retenue = p >= 10 ? 1 : 0;
  const m = mantisseDe(p);
  const E = e1 + e2 + retenue;
  const pieges = [[sci(m, e1 * e2 + retenue), 'produit-exposants']];
  if (retenue) pieges.push([sci(m, e1 + e2), 'scientifique-decaler']);
  else if (m1 + m2 < 10) pieges.push([sci(m1 + m2, E), 'mantisses-additionner']);
  return faire(melanger, 'produit-scientifique', `(${m1} × 10${exposant(e1)}) × (${m2} × 10${exposant(e2)}) = ?`, sci(m, E), pieges,
    (i) => sci(m, E + i));
}

function comparer(o) {
  const { entre, au, melanger } = o;
  const E = au([-5, -4, -3, -2, 1, 2, 3, 4, 5, 6]); // jamais 10⁰ dans la liste : plus parlant
  const grand = sci(mantisseDe(entre(10, 45)), E + 1);
  const piege = sci(mantisseDe(entre(70, 99)), E);
  const autre = sci(mantisseDe(entre(12, 69)), E);
  return {
    consigne: 'comparer-scientifique',
    question: 'Lequel est le plus grand ?',
    choix: melanger([grand, piege, autre]).map((c) => ({ cle: c, libelle: c })),
    bonne: grand,
    pieges: { [piege]: 'comparer-exposant', [autre]: 'comparer-exposant' },
  };
}

function quotientSci(o) {
  const { entre, au, melanger } = o;
  const e1 = entre(-5, 9);
  let e2 = nonNul(entre, -5, 6);
  if (e2 === e1) e2 = e1 + 1 === 0 ? e1 + 2 : e1 + 1;
  if (au([true, false])) {
    const [b, q] = au([[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [4, 2]]);
    const a = b * q;
    return faire(melanger, 'quotient-scientifique', `(${a} × 10${exposant(e1)}) ÷ (${b} × 10${exposant(e2)}) = ?`, sci(q, e1 - e2), [
      [sci(q, e1 + e2), 'quotient-exposants'],
      [sci(q, e2 - e1), 'quotient-ordre'],
    ], (i) => sci(q, e1 - e2 + i));
  }
  // Le quotient est plus petit que un : 2 ÷ 8 = 0,25 = 2,5 × 10⁻¹.
  const [b, q] = au([[1, 2], [2, 2], [3, 2], [4, 2], [1, 4], [2, 4], [1, 5]]);
  const a = b * q;
  const c = 10 / q; // b ÷ a = 1 ÷ q, et 1 ÷ q = (10 ÷ q) × 10⁻¹
  const m = Number.isInteger(c) ? String(c) : decimal(Math.round(c * 10), -1);
  const E = e1 - e2 - 1;
  return faire(melanger, 'quotient-scientifique', `(${b} × 10${exposant(e1)}) ÷ (${a} × 10${exposant(e2)}) = ?`, sci(m, E), [
    [sci(m, e1 - e2), 'scientifique-decaler'],
    [sci(m, e1 + e2 - 1), 'quotient-exposants'],
  ], (i) => sci(m, E - i));
}

/* ------------------------------------------------------------- la série */

const fois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  CINQUIEME: (o) => [...fois(3, valeur, o), ...fois(3, ecrirePuissance, o), ...fois(2, priorite, o)],
  QUATRIEME: (o) => [...fois(3, puissanceDix, o), ...fois(3, scientifique, o), ...fois(2, signes, o)],
  TROISIEME: (o) => [...fois(3, produitSci, o), ...fois(3, comparer, o), ...fois(2, quotientSci, o)],
};

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES.CINQUIEME;
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 5e
  'valeur-puissance': 'Calcule cette puissance.',
  'puissance-produit': 'Une puissance n’est pas un produit par l’exposant : deux au cube, c’est deux fois deux fois deux, et non deux fois trois.',
  'puissance-inverse': 'La base et l’exposant ne s’échangent pas : la base est le nombre multiplié, l’exposant dit combien de fois il apparaît.',
  'puissance-dix-zeros': 'Pour une puissance de dix, l’exposant donne le nombre de zéros : ni un de plus, ni un de moins.',
  'valeur-puissance-regle': 'Écris le produit en entier, la base répétée autant de fois que l’exposant, puis calcule.',
  'ecrire-puissance': 'Écris ce produit sous la forme d’une puissance.',
  'ecrire-puissance-regle': 'Le nombre répété est la base ; le nombre de facteurs est l’exposant, écrit en petit, en haut à droite.',
  'calcul-puissance': 'Calcule en respectant les priorités.',
  'priorite-puissance': 'La puissance se calcule en premier, avant la multiplication et l’addition : elle ne porte que sur le nombre juste avant elle.',
  'calcul-puissance-regle': 'D’abord la puissance, ensuite la multiplication, enfin l’addition.',
  // 4e
  'puissance-dix': 'Calcule avec les puissances de dix.',
  'exposant-negatif': 'Un exposant négatif ne rend pas le nombre négatif : il donne un nombre plus petit que un, un inverse.',
  'puissance-dix-negatif': 'Avec un exposant négatif, le chiffre un se place à ce rang après la virgule : dix puissance moins trois, c’est un millième.',
  'produit-exposants': 'Pour multiplier deux puissances d’un même nombre, on additionne les exposants, on ne les multiplie pas.',
  'produit-bases': 'La base ne change pas : on garde le même nombre, et on additionne les exposants.',
  'quotient-exposants': 'Pour diviser deux puissances d’un même nombre, on soustrait les exposants, on ne les additionne pas.',
  'quotient-ordre': 'On soustrait dans l’ordre : l’exposant du nombre divisé moins l’exposant du diviseur.',
  'puissance-dix-regle': 'Produit : on additionne les exposants ; quotient : on les soustrait ; un exposant négatif donne un nombre plus petit que un.',
  scientifique: 'Donne l’écriture scientifique de ce nombre.',
  'scientifique-un-chiffre': 'En écriture scientifique, il y a un seul chiffre avant la virgule, et ce chiffre n’est pas zéro.',
  'scientifique-exposant': 'Compte de combien de rangs la virgule se déplace : c’est l’exposant de dix.',
  'exposant-negatif-sci': 'Ce nombre est plus petit que un : l’exposant de dix est négatif.',
  'scientifique-regle': 'Place la virgule juste après le premier chiffre non nul, puis compte de combien de rangs elle a bougé : c’est l’exposant.',
  'signes-puissance': 'Attention aux signes et aux parenthèses.',
  'signe-puissance': 'Un nombre négatif à une puissance paire donne un résultat positif ; à une puissance impaire, un résultat négatif.',
  'parenthese-puissance': 'Sans parenthèses, la puissance ne porte que sur le nombre, pas sur le signe moins : on calcule la puissance, puis on garde le signe moins devant.',
  'signes-puissance-regle': 'Regarde sur quoi porte l’exposant : avec des parenthèses, sur le nombre et son signe ; sans parenthèses, sur le nombre seul.',
  // 3e
  'produit-scientifique': 'Calcule ce produit, et donne le résultat en écriture scientifique.',
  'scientifique-decaler': 'Le nombre devant la puissance de dix doit être au moins égal à un et plus petit que dix : décale la virgule, et corrige l’exposant d’autant.',
  'mantisses-additionner': 'On multiplie entre eux les nombres placés devant les puissances de dix, on ne les additionne pas.',
  'produit-scientifique-regle': 'Multiplie les nombres de devant entre eux, additionne les exposants, puis remets le résultat en écriture scientifique.',
  'comparer-scientifique': 'Lequel de ces nombres est le plus grand ?',
  'comparer-exposant': 'Compare d’abord les exposants : la plus grande puissance de dix l’emporte, quel que soit le nombre devant.',
  'comparer-scientifique-regle': 'Compare les exposants ; seulement s’ils sont égaux, compare les nombres de devant.',
  'quotient-scientifique': 'Calcule ce quotient, et donne le résultat en écriture scientifique.',
  'quotient-scientifique-regle': 'Divise les nombres de devant, soustrais les exposants, puis remets le résultat en écriture scientifique.',
};
