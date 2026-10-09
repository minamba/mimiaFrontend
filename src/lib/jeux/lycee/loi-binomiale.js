/**
 * LA LOI BINOMIALE — terminale générale (spécialité) et terminale
 * technologique. Professeure : Nora.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   terminale       : MATH_TLE_BINOMIALE, MATH_TLE_VA_SOMME (variance np(1 − p)) ;
 *   terminale techno : MATH_TTEC_VA_BINOMIALE, MATH_TTEC_VA_ESPERANCE
 *                     (espérance et écart type).
 *
 * LES SORTES DE MANCHES :
 *   - RECONNAÎTRE LE SCHÉMA DE BERNOULLI : dé, pièce, urne avec remise, QCM
 *     au hasard, tirs manqués — et le tirage SANS remise, qui n'est pas
 *     binomial. LES PIÈGES : échanger n et p, prendre la probabilité de
 *     l'échec, compter sur les boules bleues au lieu du total ;
 *   - P(X = k) (terminale) : arrondie au millième, ou exacte pour p = 1/2 ou
 *     1/3. LES PIÈGES : oublier le coefficient binomial, oublier les échecs,
 *     échanger les exposants ;
 *   - P(X = 0) et P(X = n) (terminale techno) : (1 − p)ⁿ et pⁿ. LES PIÈGES :
 *     succès et échec échangés, n × p au lieu de pⁿ ;
 *   - P(X ≥ 1) = 1 − P(X = 0). LES PIÈGES : n × p, oublier « 1 − », échanger
 *     succès et échec ;
 *   - L'ESPÉRANCE np. LES PIÈGES : n(1 − p), np(1 − p) ;
 *   - LA VARIANCE np(1 − p) (terminale), L'ÉCART TYPE √(np(1 − p)) (techno).
 *     LES PIÈGES : np, oublier n, oublier la racine ;
 *   - LES CHEMINS (terminale) : le nombre de chemins à k succès, « k parmi n ».
 *     LES PIÈGES : 2ⁿ, les arrangements.
 *
 * Les probabilités sont calculées en entiers (p = a/10, ou une fraction), et
 * un arrondi qui tomberait pile sur un « 5 » est retiré.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'loi-binomiale', titre: 'La loi binomiale', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'La loi binomiale',
    accroche: 'Bernoulli, k succès, espérance np.',
    competences: ['MATH_TLE_BINOMIALE', 'MATH_TLE_VA_SOMME'],
  },
  TERMINALE_TECHNO: {
    titre: 'La loi binomiale',
    accroche: 'Reconnaître B(n ; p), et s’en servir.',
    competences: ['MATH_TTEC_VA_BINOMIALE', 'MATH_TTEC_VA_ESPERANCE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ les outils */

const SUP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => SUP[c]).join('');
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));

/** « 3/8 », « 1 » : irréductible (n ≥ 0, d > 0). */
function frac(n, d) {
  const g = pgcd(n, d) || 1;
  return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`;
}

/** Un nombre décimal exact : num / 10^k, écrit à la française (« 0,25 », « 2,1 »). */
function decimal(num, k) {
  if (k === 0) return `${num}`;
  const s = String(Math.abs(num)).padStart(k + 1, '0');
  const ent = s.slice(0, s.length - k);
  const dec = s.slice(s.length - k).replace(/0+$/, '');
  const corps = dec === '' ? ent : `${ent},${dec}`;
  return num < 0 ? `−${corps}` : corps;
}

/** Un arrondi écrit avec tous ses chiffres : num / 10^k positif (« 0,230 », « 1,20 »). */
function fixe(num, k) {
  const s = String(num).padStart(k + 1, '0');
  return `${s.slice(0, s.length - k)},${s.slice(s.length - k)}`;
}

/** Un arrondi à 10^−k près, en entiers ; null si la valeur tombe pile sur un « 5 ». */
function arrondi(num, den, k) {
  const big = num * 10 ** k;
  const q = Math.floor(big / den);
  const r = big - q * den;
  if (2 * r === den) return null;
  return 2 * r > den ? q + 1 : q;
}

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

const combinaisons = (n, k) => {
  let c = 1;
  for (let i = 1; i <= k; i += 1) c = (c * (n - k + i)) / i;
  return c;
};
const factorielle = (n) => (n <= 1 ? 1 : n * factorielle(n - 1));

/** Une loi B(n ; p), le libellé et une valeur qui l'identifie. */
const loi = (n, num, den) => [`B(${n} ; ${frac(num, den)})`, `${n}|${num / den}`];
const dixieme = (a) => decimal(a, 1);

/* ------------------------------------------- reconnaître le schéma */

const PAS_BINOMIALE = 'Pas une loi binomiale';

function parametres(t) {
  const sorte = t.entre(1, 6);
  if (sorte === 1) {
    const n = t.entre(4, 12);
    const face = t.entre(1, 6);
    const pieges = [[...loi(n, 5, 6), 'succes-echec']];
    if (n !== 6) pieges.push([...loi(6, 1, 6), 'n-et-p']);
    return manche(t, {
      consigne: 'parametres',
      question: `On lance ${n} fois un dé équilibré à six faces.\nX compte le nombre de ${face} obtenus.`,
      bonne: loi(n, 1, 6),
      pieges,
      voisins: [loi(n, 1, 2), loi(n + 1, 1, 6)],
      aide: 'parametres-regle',
    });
  }
  if (sorte === 2) {
    const n = t.entre(3, 10);
    return manche(t, {
      consigne: 'parametres',
      question: `On lance ${n} fois une pièce équilibrée.\nX compte le nombre de « pile ».`,
      bonne: loi(n, 1, 2),
      pieges: [[...loi(2, 1, 2), 'n-et-p']],
      voisins: [loi(n, 1, n), loi(n + 1, 1, 2)],
      aide: 'parametres-regle',
    });
  }
  const r = t.entre(2, 7);
  let b;
  do b = t.entre(2, 7); while (b === r);
  if (sorte === 3 || sorte === 4) {
    const avec = sorte === 3;
    const n = avec ? t.entre(3, 8) : t.entre(2, 4);
    const question = `Une urne contient ${r} boules rouges et ${b} boules bleues.\nOn tire ${n} boules, une à une, ${avec ? 'AVEC' : 'SANS'} remise.\nX compte les boules rouges.`;
    if (avec) {
      return manche(t, {
        consigne: 'parametres',
        question,
        bonne: loi(n, r, r + b),
        pieges: [[...loi(n, b, r + b), 'succes-echec'], [...loi(n, r, b), 'proba-sur-total']],
        voisins: [[PAS_BINOMIALE, PAS_BINOMIALE]],
        aide: 'parametres-regle',
      });
    }
    return manche(t, {
      consigne: 'parametres',
      question,
      bonne: [PAS_BINOMIALE, PAS_BINOMIALE],
      pieges: [[...loi(n, r, r + b), 'sans-remise']],
      voisins: [loi(n, b, r + b)],
      aide: 'parametres-regle',
    });
  }
  if (sorte === 5) {
    const n = t.entre(5, 20);
    const m = t.entre(3, 5);
    return manche(t, {
      consigne: 'parametres',
      question: `Un QCM a ${n} questions, chacune avec ${m} réponses dont une seule juste.\nUn élève répond au hasard à chaque question.\nX compte les bonnes réponses.`,
      bonne: loi(n, 1, m),
      pieges: [[...loi(m, 1, n), 'n-et-p'], [...loi(n, m - 1, m), 'succes-echec']],
      voisins: [loi(n, 1, 2)],
      aide: 'parametres-regle',
    });
  }
  const n = t.entre(3, 10);
  const a = t.entre(6, 9);
  const reussite = dixieme(a);
  return manche(t, {
    consigne: 'parametres',
    question: `Une joueuse réussit chaque tir avec la probabilité ${reussite}.\nElle tire ${n} fois, de façon indépendante.\nX compte les tirs manqués.`,
    bonne: [`B(${n} ; ${dixieme(10 - a)})`, `${n}|${(10 - a) / 10}`],
    pieges: [[`B(${n} ; ${reussite})`, `${n}|${a / 10}`, 'succes-echec']],
    voisins: [[`B(${n + 1} ; ${dixieme(10 - a)})`, `${n + 1}|${(10 - a) / 10}`], [PAS_BINOMIALE, PAS_BINOMIALE]],
    aide: 'parametres-regle',
  });
}

/* ---------------------------------------------------- P(X = k), terminale */

function probabilite(t) {
  let n;
  let k;
  let a;
  let exact;
  // p = a/10 ; tout en entiers sur 10ⁿ. On écarte les arrondis ambigus et les
  // probabilités trop petites pour être lues au millième.
  do {
    n = t.entre(4, 10);
    k = t.entre(1, n - 1);
    a = t.entre(1, 9);
    exact = arrondi(combinaisons(n, k) * a ** k * (10 - a) ** (n - k), 10 ** n, 3);
  } while (exact === null || exact < 10);
  const den = 10 ** n;
  const lu = (num) => {
    const v = arrondi(num, den, 3);
    // Un piège qui ne serait pas une probabilité (nulle au millième, ou plus grande que un) ne piège personne.
    return v === null || v === 0 || v > 1000 ? null : [fixe(v, 3), v / 1000];
  };
  const C = combinaisons(n, k);
  const pieges = [
    [lu(a ** k * (10 - a) ** (n - k)), 'coefficient-binomial'],
    [lu(C * a ** k * 10 ** (n - k)), 'echecs-oublies'],
    [lu(C * a ** (n - k) * (10 - a) ** k), 'exposants'],
  ].filter(([c]) => c !== null).map(([c, phrase]) => [...c, phrase]);
  const voisin = (j) => {
    const v = exact + j * 11 <= 1000 ? exact + j * 11 : exact - j * 11;
    return [fixe(v, 3), v / 1000];
  };
  return manche(t, {
    consigne: 'probabilite',
    question: `X suit la loi B(${n} ; ${dixieme(a)}).\nP(X = ${k}), arrondie au millième ?`,
    bonne: [fixe(exact, 3), exact / 1000],
    pieges,
    voisins: [voisin(1), voisin(2), voisin(3)],
    aide: 'probabilite-regle',
  });
}

function probabiliteExacte(t) {
  const q = t.au([2, 3]);
  const n = t.entre(3, 5);
  const k = t.entre(1, n - 1);
  // p = 1/q : P(X = k) = C × (q − 1)^(n − k) / qⁿ.
  const den = q ** n;
  const C = combinaisons(n, k);
  const f = (num) => [frac(num, den), num / den];
  return manche(t, {
    consigne: 'probabilite',
    question: `X suit la loi B(${n} ; 1/${q}).\nP(X = ${k}), valeur exacte ?`,
    bonne: f(C * (q - 1) ** (n - k)),
    pieges: [
      [...f((q - 1) ** (n - k)), 'coefficient-binomial'],
      [...f(C * q ** (n - k)), 'echecs-oublies'],
      [...f(C * (q - 1) ** k), 'exposants'],
    ].filter(([, v]) => v <= 1),
    voisins: [f(C * (q - 1) ** (n - k) + 1), f(C * (q - 1) ** (n - k) + 2)],
    aide: 'probabilite-regle',
  });
}

/* ------------------------------------------ P(X = 0), P(X = n), P(X ≥ 1) */

/** « 0,7⁴ » et sa valeur exacte. */
const puissance = (a, n) => [`${dixieme(a)}${sup(n)}`, (a / 10) ** n];

function extremes(t) {
  const n = t.entre(3, 8);
  const a = t.entre(1, 9);
  const zero = t.entre(0, 1) === 1;
  const succes = zero ? 10 - a : a;
  const echec = 10 - succes;
  return manche(t, {
    consigne: 'extremes',
    question: `X suit la loi B(${n} ; ${dixieme(a)}).\nP(X = ${zero ? 0 : n}) = ?`,
    bonne: puissance(succes, n),
    pieges: [
      [...puissance(echec, n), 'succes-echec'],
      [`${n} × ${dixieme(succes)}`, (n * succes) / 10, 'puissance-pas-produit'],
    ],
    voisins: [puissance(succes, n + 1), puissance(succes, n - 1)],
    aide: 'extremes-regle',
  });
}

function auMoinsUn(t) {
  const n = t.entre(3, 8);
  const a = t.entre(1, 9);
  const moins = (b) => [`1 − ${dixieme(b)}${sup(n)}`, 1 - (b / 10) ** n];
  return manche(t, {
    consigne: 'au-moins-un',
    question: `X suit la loi B(${n} ; ${dixieme(a)}).\nP(X ≥ 1) = ?`,
    bonne: moins(10 - a),
    pieges: [
      [...moins(a), 'succes-echec'],
      [`${n} × ${dixieme(a)}`, (n * a) / 10, 'au-moins-un-somme'],
      [...puissance(10 - a, n), 'contraire-oublie'],
    ],
    voisins: [[`1 − ${dixieme(10 - a)}${sup(n + 1)}`, 1 - ((10 - a) / 10) ** (n + 1)], puissance(a, n)],
    aide: 'au-moins-un-regle',
  });
}

/* ---------------------------------------------- espérance, variance, écart type */

function esperance(t) {
  const n = t.entre(5, 20);
  const a = t.entre(1, 9);
  // n a / 10, n (10 − a) / 10, n a (10 − a) / 100 : des décimaux exacts.
  const dec = (num, k) => [decimal(num, k), num / 10 ** k];
  const E = n * a;
  return manche(t, {
    consigne: 'esperance',
    question: `X suit la loi B(${n} ; ${dixieme(a)}).\nE(X) = ?`,
    bonne: dec(E, 1),
    pieges: [
      [...dec(n * (10 - a), 1), 'succes-echec'],
      [...dec(n * a * (10 - a), 2), 'esperance-variance'],
    ],
    voisins: [dec(E + 10, 1), dec(E + 5, 1), dec(E + 20, 1)],
    aide: 'esperance-regle',
  });
}

function variance(t) {
  const n = t.entre(5, 20);
  const a = t.entre(1, 9);
  const dec = (num, k) => [decimal(num, k), num / 10 ** k];
  const V = n * a * (10 - a);
  return manche(t, {
    consigne: 'variance',
    question: `X suit la loi B(${n} ; ${dixieme(a)}).\nV(X) = ?`,
    bonne: dec(V, 2),
    pieges: [
      [...dec(n * a, 1), 'esperance-variance'],
      [...dec(a * (10 - a), 2), 'variance-n'],
    ],
    voisins: [dec(V + 100, 2), dec(V + 200, 2)],
    aide: 'variance-regle',
  });
}

function ecartType(t) {
  let n;
  let a;
  let cent;
  // σ = √(n a (10 − a)) / 10 : en centièmes, √(n a (10 − a)) × 10. On écarte
  // les arrondis ambigus.
  do {
    n = t.entre(5, 20);
    a = t.entre(1, 9);
    cent = Math.sqrt(n * a * (10 - a)) * 10;
  } while (Math.abs(cent - Math.floor(cent) - 0.5) < 1e-6);
  const sigma = Math.round(cent);
  const centieme = (v) => [fixe(v, 2), v / 100];
  return manche(t, {
    consigne: 'ecart-type',
    question: `X suit la loi B(${n} ; ${dixieme(a)}).\nÉcart type σ(X), arrondi au centième ?`,
    bonne: centieme(sigma),
    pieges: [
      [decimal(n * a * (10 - a), 2), (n * a * (10 - a)) / 100, 'ecart-type-racine'],
      [...centieme(Math.round(Math.sqrt(n * a * 10) * 10)), 'ecart-type-formule'],
    ],
    voisins: [centieme(sigma + 11), centieme(sigma + 23)],
    aide: 'ecart-type-regle',
  });
}

/* ------------------------------------------------------------ les chemins */

function chemins(t) {
  const n = t.entre(4, 8);
  const k = t.entre(2, n - 2);
  const C = combinaisons(n, k);
  const nombre = (v) => [`${v}`, v];
  return manche(t, {
    consigne: 'chemins',
    question: `Un arbre représente ${n} épreuves de Bernoulli.\nCombien de chemins comptent exactement ${k} succès ?`,
    bonne: nombre(C),
    pieges: [
      [...nombre(2 ** n), 'tous-les-chemins'],
      [...nombre(factorielle(n) / factorielle(n - k)), 'arrangements'],
    ],
    voisins: [nombre(C + 1), nombre(n * k + 1)],
    aide: 'chemins-regle',
  });
}

/* ------------------------------------------------------------- la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const liste = niveau === 'TERMINALE_TECHNO'
    ? [
      parametres(t), parametres(t),
      extremes(t), extremes(t),
      auMoinsUn(t),
      esperance(t), esperance(t),
      ecartType(t),
    ]
    : [
      parametres(t), parametres(t),
      probabilite(t), probabiliteExacte(t),
      auMoinsUn(t),
      esperance(t), variance(t),
      chemins(t),
    ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  parametres: 'Quelle loi suit la variable X ?',
  probabilite: 'Calcule cette probabilité.',
  extremes: 'Calcule cette probabilité, sans arbre.',
  'au-moins-un': 'Quelle est la probabilité d’au moins un succès ?',
  esperance: 'Calcule l’espérance de X.',
  variance: 'Calcule la variance de X.',
  'ecart-type': 'Calcule l’écart type de X.',
  chemins: 'Combien de chemins de l’arbre conviennent ?',

  'succes-echec': 'Repère bien le succès : p est la probabilité de ce que X compte, pas de l’échec.',
  'n-et-p': 'Le nombre n compte les répétitions de l’épreuve, et p est la probabilité du succès à chaque fois : ne les échange pas.',
  'proba-sur-total': 'La probabilité d’un succès se calcule sur le nombre total de boules, pas sur les autres boules.',
  'sans-remise': 'Sans remise, la composition de l’urne change à chaque tirage : les épreuves ne sont pas indépendantes, ce n’est pas une loi binomiale.',
  'coefficient-binomial': 'N’oublie pas le nombre de chemins, k parmi n, devant le produit des probabilités.',
  'echecs-oublies': 'Il faut aussi les échecs : multiplie par un moins p, à la puissance n moins k.',
  exposants: 'La puissance de p compte les succès, celle de un moins p compte les échecs.',
  'puissance-pas-produit': 'Les épreuves sont indépendantes : on multiplie la même probabilité n fois, c’est une puissance, pas n fois la probabilité.',
  'au-moins-un-somme': 'On n’ajoute pas les probabilités de chaque épreuve : passe par l’événement contraire, aucun succès.',
  'contraire-oublie': 'Ça, c’est la probabilité de n’avoir aucun succès : au moins un, c’est un moins cette probabilité.',
  'esperance-variance': 'L’espérance d’une loi binomiale est n fois p ; n fois p fois un moins p, c’est la variance.',
  'variance-n': 'La variance d’une loi binomiale est n fois p fois un moins p : n’oublie pas n.',
  'ecart-type-racine': 'L’écart type est la racine carrée de la variance : n’oublie pas la racine.',
  'ecart-type-formule': 'L’écart type est la racine de n fois p fois un moins p, pas la racine de n fois p.',
  'tous-les-chemins': 'Deux puissance n compte tous les chemins de l’arbre ; ici, seulement ceux qui ont exactement k succès.',
  arrangements: 'Un chemin est fixé par les places de ses succès, sans ordre entre elles : c’est k parmi n, pas un arrangement.',

  'parametres-regle': 'Une même épreuve à deux issues, répétée n fois de façon indépendante : X compte les succès, et p est la probabilité d’un succès.',
  'probabilite-regle': 'P de X égale k, c’est k parmi n, fois p puissance k, fois un moins p puissance n moins k.',
  'extremes-regle': 'Aucun succès : un moins p, à la puissance n. Que des succès : p puissance n.',
  'au-moins-un-regle': 'Au moins un succès, c’est le contraire d’aucun succès : un moins, un moins p, à la puissance n.',
  'esperance-regle': 'L’espérance d’une loi binomiale est n fois p.',
  'variance-regle': 'La variance d’une loi binomiale est n fois p fois un moins p.',
  'ecart-type-regle': 'L’écart type est la racine carrée de n fois p fois un moins p.',
  'chemins-regle': 'Le nombre de chemins à k succès parmi n épreuves, c’est le coefficient binomial k parmi n.',
};
