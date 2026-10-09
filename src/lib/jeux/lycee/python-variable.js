/**
 * PYTHON : QUE VAUT LA VARIABLE ? — seconde.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL : MATH_2DE_ALGO_PYTHON.
 *
 * Un court programme Python est AFFICHÉ dans `question` (une ligne par
 * « \n », indentation de quatre espaces) ; l'élève prévoit ce qu'il affiche.
 * La bonne réponse est obtenue en SIMULANT le programme ici, pas à pas, en
 * JavaScript (aucun eval) ; le test la recalcule avec un petit interpréteur
 * Python indépendant qui lit le texte de la question. Tout reste entier et
 * positif, comme ce qu'affiche Python.
 *
 * SEPT SORTES DE MANCHES (1 + 2 + 1 + 1 + 1 + 1 + 1) :
 *   - L'AFFECTATION : b = a + 3 puis a change — b ne bouge pas ; l'échange
 *     raté a = b ; b = a ;
 *   - LA BOUCLE FOR : range(n) s'arrête AVANT n, range(a, b) commence à a,
 *     range(a, b, p) avance de p ; le nombre de tours ;
 *   - LA BOUCLE WHILE : la valeur affichée est la première qui rend la
 *     condition fausse ; le compteur de tours ;
 *   - LE TEST if / else : la branche exécutée, le > strict ;
 *   - LA FONCTION def : f(f(c)), f(c) + f(d) qui n'est pas f(c + d), une
 *     variable locale et range(1, n + 1) ;
 *   - LES OPÉRATEURS // % ** ;
 *   - LA BOUCLE ET LE TEST : additionner les multiples, ou les compter ?
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'python-variable', titre: 'Python : que vaut la variable ?', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Python : que vaut la variable ?',
    accroche: 'Lis le programme, prévois l’affichage.',
    competences: ['MATH_2DE_ALGO_PYTHON'],
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

const programme = (...lignes) => lignes.join('\n');
const pas = (bonne) => (k) => bonne + k;
/** La somme des entiers de range(a, b, p), boucle comprise. */
function sommeRange(a, b, p = 1) {
  let s = 0;
  for (let i = a; i < b; i += p) s += i;
  return s;
}

/* ------------------------------------------------------------ l'affectation */

function affectation(t) {
  if (t.au([true, false])) {
    const a0 = t.entre(2, 9);
    const k = t.entre(2, 5);
    const a1 = t.entre(10, 20);
    const op = t.au(['+', '*']);
    let a = a0;
    const b = op === '+' ? a + k : a * k;
    a = a1;
    const fige = op === '+' ? a + k : a * k;
    return manche(t.melanger, {
      consigne: 'affectation',
      question: programme(`a = ${a0}`, `b = a ${op} ${k}`, `a = ${a1}`, 'print(b)'),
      bonne: b,
      pieges: [[fige, 'affectation-figee']],
      voisin: pas(b),
    });
  }
  const x = t.entre(1, 9);
  let y;
  do {
    y = t.entre(1, 9);
  } while (y === x);
  let a = x;
  let b = y;
  a = b;
  b = a;
  const affiche = t.au(['a', 'b']);
  const bonne = affiche === 'a' ? a : b;
  return manche(t.melanger, {
    consigne: 'affectation',
    question: programme(`a = ${x}`, `b = ${y}`, 'a = b', 'b = a', `print(${affiche})`),
    bonne,
    // Afficher b : l'élève croit l'échange réussi. Afficher a : il lit « a = b » à l'envers.
    pieges: [[x, affiche === 'b' ? 'echange-sans-temporaire' : 'affectation-sens']],
    voisin: pas(x + y),
  });
}

/* ------------------------------------------------------------ la boucle for */

function boucleFor(t, sorte) {
  if (sorte === 'somme') {
    const n = t.entre(4, 9);
    const s = sommeRange(0, n);
    return manche(t.melanger, {
      consigne: 'boucle-for',
      question: programme('s = 0', `for i in range(${n}):`, '    s = s + i', 'print(s)'),
      bonne: s,
      pieges: [[sommeRange(0, n + 1), 'range-exclut-la-fin'], [n, 'compter-ou-additionner']],
      voisin: pas(s),
    });
  }
  if (sorte === 'somme-ab') {
    const a = t.entre(2, 5);
    const b = a + t.entre(3, 5);
    const s = sommeRange(a, b);
    return manche(t.melanger, {
      consigne: 'boucle-for',
      question: programme('s = 0', `for i in range(${a}, ${b}):`, '    s = s + i', 'print(s)'),
      bonne: s,
      pieges: [[sommeRange(a, b + 1), 'range-exclut-la-fin'], [sommeRange(0, b), 'range-depart']],
      voisin: pas(s),
    });
  }
  if (sorte === 'compte') {
    const a = t.entre(2, 9);
    const b = a + t.entre(3, 12);
    let c = 0;
    for (let i = a; i < b; i += 1) c += 1;
    return manche(t.melanger, {
      consigne: 'boucle-for',
      question: programme('c = 0', `for i in range(${a}, ${b}):`, '    c = c + 1', 'print(c)'),
      bonne: c,
      pieges: [[c + 1, 'range-exclut-la-fin'], [b, 'range-depart']],
      voisin: pas(c),
    });
  }
  if (sorte === 'double') {
    const x0 = t.entre(1, 5);
    const n = t.entre(3, 6);
    let x = x0;
    for (let i = 0; i < n; i += 1) x *= 2;
    return manche(t.melanger, {
      consigne: 'boucle-for',
      question: programme(`x = ${x0}`, `for i in range(${n}):`, '    x = x * 2', 'print(x)'),
      bonne: x,
      pieges: t.melanger([[x * 2, 'nombre-de-tours'], [x / 2, 'nombre-de-tours']]),
      voisin: pas(x),
    });
  }
  // Le pas : range(a, b, p), la borne b tombe pile sur un multiple du pas.
  const a = t.entre(0, 3);
  const p = t.entre(2, 3);
  const b = a + p * t.entre(3, 5);
  const s = sommeRange(a, b, p);
  return manche(t.melanger, {
    consigne: 'boucle-for',
    question: programme('s = 0', `for i in range(${a}, ${b}, ${p}):`, '    s += i', 'print(s)'),
    bonne: s,
    pieges: [[s + b, 'range-exclut-la-fin'], [sommeRange(a, b), 'le-pas-de-range']],
    voisin: pas(s),
  });
}

/* ---------------------------------------------------------- la boucle while */

function boucleWhile(t) {
  if (t.au([true, false])) {
    const u0 = t.entre(1, 10);
    const r = t.entre(2, 7);
    const L = u0 + t.entre(10, 40);
    let u = u0;
    while (u < L) u += r;
    return manche(t.melanger, {
      consigne: 'boucle-while',
      question: programme(`u = ${u0}`, `while u < ${L}:`, `    u = u + ${r}`, 'print(u)'),
      bonne: u,
      pieges: [[u - r, 'dernier-tour'], [L, 'seuil-pas-valeur']],
      voisin: pas(u),
    });
  }
  let x0;
  let q;
  let L;
  let n;
  do {
    x0 = t.entre(1, 5);
    q = t.entre(2, 3);
    L = t.entre(20, 200);
    let x = x0;
    n = 0;
    while (x < L) {
      x *= q;
      n += 1;
    }
  } while (n < 2);
  return manche(t.melanger, {
    consigne: 'boucle-while',
    question: programme('n = 0', `x = ${x0}`, `while x < ${L}:`, `    x = x * ${q}`, '    n = n + 1', 'print(n)'),
    bonne: n,
    pieges: [[n - 1, 'dernier-tour'], [n + 1, 'condition-du-while']],
    voisin: pas(n + 1),
  });
}

/* --------------------------------------------------------------- le test */

function condition(t) {
  const sorte = t.au(['parite', 'multiple', 'stricte']);
  if (sorte === 'stricte') {
    const s = t.entre(3, 9);
    const x = s;
    const y = x > s ? x * 2 : x + 10;
    return manche(t.melanger, {
      consigne: 'condition',
      question: programme(`x = ${s}`, `if x > ${s}:`, '    y = x * 2', 'else:', '    y = x + 10', 'print(y)'),
      bonne: y,
      pieges: [[x * 2, 'inegalite-stricte']],
      voisin: pas(y),
    });
  }
  const x = t.entre(4, 30);
  const [d, siOui, siNon, lignes] = sorte === 'parite'
    ? [2, Math.floor(x / 2), 3 * x + 1, ['    y = x // 2', 'else:', '    y = 3 * x + 1']]
    : [3, Math.floor(x / 3), x - 1, ['    y = x // 3', 'else:', '    y = x - 1']];
  const vrai = x % d === 0;
  return manche(t.melanger, {
    consigne: 'condition',
    question: programme(`x = ${x}`, `if x % ${d} == 0:`, ...lignes, 'print(y)'),
    bonne: vrai ? siOui : siNon,
    pieges: [[vrai ? siNon : siOui, 'condition-du-if']],
    voisin: pas(vrai ? siOui : siNon),
  });
}

/* ------------------------------------------------------------ la fonction */

function fonction(t) {
  const sorte = t.au(['compose', 'images', 'locale']);
  if (sorte === 'compose') {
    let a;
    let b;
    let c;
    do {
      a = t.entre(2, 3);
      c = t.entre(1, 4);
      b = t.entre(1, a * c - 1);
    } while (a * (a * c - b) - b < 1); // f(f(c)) reste positif
    const f = (x) => a * x - b;
    return manche(t.melanger, {
      consigne: 'fonction',
      question: programme('def f(x):', `    return ${a} * x - ${b}`, '', `print(f(f(${c})))`),
      bonne: f(f(c)),
      pieges: [[f(c), 'appel-imbrique'], [a * a * c - b, 'appel-imbrique']],
      voisin: pas(f(f(c))),
    });
  }
  if (sorte === 'images') {
    const b = t.entre(1, 9);
    const c = t.entre(1, 5);
    const d = t.entre(1, 5);
    const f = (x) => x * x + b;
    return manche(t.melanger, {
      consigne: 'fonction',
      question: programme('def f(x):', `    return x * x + ${b}`, '', `print(f(${c}) + f(${d}))`),
      bonne: f(c) + f(d),
      pieges: [[f(c + d), 'image-d-une-somme'], [c * c + d * d + b, 'chaque-appel']],
      voisin: pas(f(c) + f(d)),
    });
  }
  const m = t.entre(3, 8);
  const g = (n) => {
    let s = 0;
    for (let k = 1; k < n + 1; k += 1) s += k;
    return s;
  };
  return manche(t.melanger, {
    consigne: 'fonction',
    question: programme('def g(n):', '    s = 0', '    for k in range(1, n + 1):', '        s = s + k', '    return s', '', `print(g(${m}))`),
    bonne: g(m),
    pieges: [[g(m - 1), 'range-plus-un'], [m, 'compter-ou-additionner']],
    voisin: pas(g(m)),
  });
}

/* ------------------------------------------------------------ les opérateurs */

function operateurs(t) {
  const sorte = t.au(['quotient', 'reste', 'puissance']);
  if (sorte === 'puissance') {
    const x = t.entre(2, 5);
    const n = t.entre(2, 4);
    return manche(t.melanger, {
      consigne: 'operateurs',
      question: programme(`x = ${x}`, `n = ${n}`, 'print(x ** n)'),
      bonne: x ** n,
      pieges: [[x * n, 'puissance-python'], [n ** x, 'puissance-ordre']],
      voisin: pas(x ** n),
    });
  }
  let a;
  let b;
  do {
    a = t.entre(13, 50);
    b = t.entre(3, 7);
  } while (a % b === 0 || Math.floor(a / b) === a % b);
  const [q, r] = [Math.floor(a / b), a % b];
  return manche(t.melanger, {
    consigne: 'operateurs',
    question: programme(`a = ${a}`, `b = ${b}`, sorte === 'quotient' ? 'print(a // b)' : 'print(a % b)'),
    bonne: sorte === 'quotient' ? q : r,
    pieges: sorte === 'quotient'
      ? [[r, 'quotient-ou-reste'], [q + 1, 'division-entiere']]
      : [[q, 'quotient-ou-reste']],
    voisin: pas(sorte === 'quotient' ? q + 1 : r),
  });
}

/* ------------------------------------------------ la boucle et le test */

function boucleEtTest(t) {
  const k = t.entre(2, 4);
  const n = k * t.entre(3, 6);
  let c = 0;
  let compte = 0;
  for (let i = 1; i < n; i += 1) {
    if (i % k === 0) {
      c += i;
      compte += 1;
    }
  }
  return manche(t.melanger, {
    consigne: 'boucle-et-test',
    question: programme('c = 0', `for i in range(1, ${n}):`, `    if i % ${k} == 0:`, '        c = c + i', 'print(c)'),
    bonne: c,
    pieges: [[c + n, 'range-exclut-la-fin'], [compte, 'compter-ou-additionner']],
    voisin: pas(c),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  const [f1, f2] = t.melanger(['somme', 'somme-ab', 'compte', 'double', 'pas']);
  return t.melanger([
    affectation(t),
    boucleFor(t, f1), boucleFor(t, f2),
    boucleWhile(t), condition(t), fonction(t), operateurs(t), boucleEtTest(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  affectation: 'Suis les affectations dans l’ordre : qu’affiche ce programme ?',
  'boucle-for': 'Compte bien les tours de la boucle : qu’affiche ce programme ?',
  'boucle-while': 'La boucle tourne tant que la condition est vraie : qu’affiche ce programme ?',
  condition: 'Quelle branche du test s’exécute ? Qu’affiche ce programme ?',
  fonction: 'Suis les appels de la fonction : qu’affiche ce programme ?',
  operateurs: 'Attention aux opérateurs de Python : qu’affiche ce programme ?',
  'boucle-et-test': 'Une boucle et un test : qu’affiche ce programme ?',

  'affectation-figee': 'Une affectation calcule la valeur une fois pour toutes : changer a ensuite ne modifie pas b.',
  'echange-sans-temporaire': 'Après a égale b, l’ancienne valeur de a est perdue : b reçoit donc sa propre valeur. Pour échanger, il faut une variable de plus.',
  'affectation-sens': 'Dans a égale b, c’est la variable de gauche qui reçoit la valeur de droite : a prend la valeur de b.',
  'range-exclut-la-fin': 'Range s’arrête juste avant la borne de fin : cette dernière valeur n’est jamais parcourue.',
  'range-depart': 'Range de a à b commence à a, pas à zéro.',
  'nombre-de-tours': 'Range de n fait exactement n tours : compte les doublements un par un.',
  'le-pas-de-range': 'Le troisième nombre de range est le pas : i avance de ce pas à chaque tour.',
  'dernier-tour': 'La boucle refait un tour tant que la condition est vraie : la valeur affichée est la première qui la rend fausse.',
  'seuil-pas-valeur': 'Le programme n’affiche pas le seuil : il affiche la valeur de la variable au moment où la condition devient fausse.',
  'condition-du-while': 'La condition est testée avant chaque tour : dès qu’elle est fausse, la boucle s’arrête sans refaire de tour.',
  'condition-du-if': 'Évalue la condition avec la valeur de x : c’est l’autre branche qui s’exécute.',
  'inegalite-stricte': 'Strictement plus grand exclut l’égalité : un nombre n’est pas strictement plus grand que lui-même.',
  'appel-imbrique': 'f de f : on calcule d’abord l’appel intérieur, puis on applique f à son résultat.',
  'image-d-une-somme': 'L’image d’une somme n’est pas la somme des images : calcule chaque appel séparément.',
  'chaque-appel': 'Chaque appel de la fonction ajoute son propre nombre : il y a deux appels.',
  'range-plus-un': 'Range jusqu’à n plus un s’arrête juste avant n plus un : n lui-même est donc compris.',
  'quotient-ou-reste': 'Deux barres obliques donnent le quotient entier ; le symbole pour cent donne le reste.',
  'division-entiere': 'La division entière arrondit vers le bas : on garde seulement le quotient.',
  'puissance-python': 'Deux étoiles, c’est la puissance : le nombre multiplié par lui-même, pas le produit des deux nombres.',
  'puissance-ordre': 'Le nombre avant les deux étoiles est la base, celui d’après est l’exposant.',
  'compter-ou-additionner': 'La variable ajoute la valeur de la boucle à chaque tour, pas un : on additionne les valeurs, on ne les compte pas.',

  'affectation-regle': 'Exécute les lignes une à une et note la valeur de chaque variable après chaque ligne.',
  'boucle-for-regle': 'Écris les valeurs que prend i, de la première à la dernière avant la borne de fin, et suis la variable tour par tour.',
  'boucle-while-regle': 'Avant chaque tour, teste la condition ; note la valeur après chaque tour, jusqu’à ce que la condition soit fausse.',
  'condition-regle': 'Calcule d’abord la condition avec la valeur de x, puis exécute seulement la branche qui convient.',
  'fonction-regle': 'Remplace le paramètre par la valeur donnée à l’appel, et calcule ce que la fonction renvoie.',
  'operateurs-regle': 'Deux barres obliques : le quotient entier. Pour cent : le reste. Deux étoiles : la puissance.',
  'boucle-et-test-regle': 'À chaque tour, teste la condition ; la variable ne change que lorsque le test est vrai.',
};
