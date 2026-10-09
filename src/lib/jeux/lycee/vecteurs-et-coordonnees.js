/**
 * VECTEURS ET COORDONNÉES — seconde.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_2DE_VECTEURS, MATH_2DE_REPERAGE,
 * MATH_2DE_COLINEARITE.
 *
 * SEPT SORTES DE MANCHES (2 + 1 + 1 + 1 + 1 + 1 + 1) :
 *   - LES COORDONNÉES DU VECTEUR AB. LES PIÈGES : A − B au lieu de B − A,
 *     additionner les coordonnées des points ;
 *   - LA SOMME, OU k u − v : LES PIÈGES, additionner les deux coordonnées
 *     d'un même vecteur, ne multiplier que la première coordonnée, perdre
 *     le signe moins ;
 *   - LE MILIEU : LES PIÈGES, la demi-différence, oublier de diviser par 2 ;
 *   - LA DISTANCE : LES PIÈGES, oublier la racine, additionner les écarts ;
 *   - LA COLINÉARITÉ, la valeur de m (déterminant nul). LES PIÈGES : le signe,
 *     le déterminant mal croisé ;
 *   - LA COLINÉARITÉ, oui ou non : des coordonnées « presque »
 *     proportionnelles (le signe d'une seule change) ;
 *   - LE PARALLÉLOGRAMME ABCD : D = A − B + C (vecteur AB = vecteur DC). LE
 *     PIÈGE : l'ordre des sommets.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'vecteurs-et-coordonnees', titre: 'Vecteurs et coordonnées', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Vecteurs et coordonnées',
    accroche: 'Milieu, distance, colinéarité.',
    competences: ['MATH_2DE_VECTEURS', 'MATH_2DE_REPERAGE', 'MATH_2DE_COLINEARITE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Un nombre à la française : virgule décimale, vrai signe moins. */
function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',').replace('-', '−');
}

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

function nonNul(t, min, max) {
  let a;
  do {
    a = t.entre(min, max);
  } while (a === 0);
  return a;
}

const couple = (x, y) => `(${nb(x)} ; ${nb(y)})`;
const nomme = (nom, [x, y]) => `${nom}${couple(x, y)}`;
const alterne = (k) => (k % 2 ? k : -k);

/** Un point qui n'est pas l'origine, coordonnées entre −6 et 6. */
function pointHorsOrigine(t) {
  return [nonNul(t, -6, 6), t.entre(-6, 6)];
}

/* --------------------------------------------- les coordonnées de AB */

function coordonnees(t) {
  const A = pointHorsOrigine(t);
  let B;
  do {
    B = [t.entre(-6, 6), t.entre(-6, 6)];
  } while (B[0] === A[0] && B[1] === A[1]);
  const [dx, dy] = [B[0] - A[0], B[1] - A[1]];
  return manche(t.melanger, {
    consigne: 'coordonnees-vecteur',
    question: `${nomme('A', A)} et ${nomme('B', B)}\nCoordonnées du vecteur AB ?`,
    bonne: couple(dx, dy),
    pieges: [[couple(-dx, -dy), 'extremite-moins-origine'], [couple(A[0] + B[0], A[1] + B[1]), 'soustraire-pas-additionner']],
    voisin: (k) => couple(dx + alterne(k), dy),
  });
}

/* ------------------------------------------------ la somme, k u − v */

function combinaison(t) {
  const [a, b, c, d] = [nonNul(t, -5, 5), nonNul(t, -5, 5), nonNul(t, -5, 5), nonNul(t, -5, 5)];
  const vecteurs = `Vecteurs u${couple(a, b)} et v${couple(c, d)}`;
  if (t.au([true, false])) {
    return manche(t.melanger, {
      consigne: 'combinaison',
      question: `${vecteurs}\nCoordonnées de u + v ?`,
      bonne: couple(a + c, b + d),
      pieges: [[couple(a + b, c + d), 'coordonnee-par-coordonnee'], [couple(a - c, b - d), 'signe-de-la-somme']],
      voisin: (k) => couple(a + c, b + d + alterne(k)),
    });
  }
  const k = t.entre(2, 3);
  return manche(t.melanger, {
    consigne: 'combinaison',
    question: `${vecteurs}\nCoordonnées de ${k}u − v ?`,
    bonne: couple(k * a - c, k * b - d),
    pieges: [[couple(k * a - c, b - d), 'multiplier-chaque-coordonnee'], [couple(k * a + c, k * b + d), 'soustraire-chaque-coordonnee']],
    voisin: (j) => couple(k * a - c + alterne(j), k * b - d),
  });
}

/* ------------------------------------------------------------ le milieu */

function milieu(t) {
  const A = pointHorsOrigine(t);
  let B;
  do {
    B = [t.entre(-6, 6), t.entre(-6, 6)];
  } while ((B[0] === A[0] && B[1] === A[1]) || (A[0] + B[0] === 0 && A[1] + B[1] === 0));
  const [sx, sy] = [A[0] + B[0], A[1] + B[1]];
  return manche(t.melanger, {
    consigne: 'milieu',
    question: `${nomme('A', A)} et ${nomme('B', B)}\nCoordonnées du milieu de [AB] ?`,
    bonne: couple(sx / 2, sy / 2),
    pieges: [[couple((B[0] - A[0]) / 2, (B[1] - A[1]) / 2), 'milieu-somme'], [couple(sx, sy), 'milieu-diviser']],
    voisin: (k) => couple(sx / 2 + alterne(k), sy / 2),
  });
}

/* ---------------------------------------------------------- la distance */

const TRIPLETS = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5]];

function distance(t) {
  let dx;
  let dy;
  if (t.entre(0, 2) === 0) {
    const [u, v] = t.au(TRIPLETS);
    [dx, dy] = [u * t.au([-1, 1]), v * t.au([-1, 1])];
  } else {
    [dx, dy] = [nonNul(t, -6, 6), nonNul(t, -6, 6)];
  }
  const A = [t.entre(-5, 5), t.entre(-5, 5)];
  const B = [A[0] + dx, A[1] + dy];
  const n = dx * dx + dy * dy;
  const s = Math.round(Math.sqrt(n));
  const carre = s * s === n;
  const bonne = carre ? `${s}` : `√${n}`;
  return manche(t.melanger, {
    consigne: 'distance',
    question: `${nomme('A', A)} et ${nomme('B', B)}\nLongueur AB ?`,
    bonne,
    pieges: [[`${n}`, 'racine-oubliee'], [`${Math.abs(dx) + Math.abs(dy)}`, 'distance-pas-somme']],
    voisin: (k) => (carre ? `${s + alterne(k)}` : `√${n + alterne(k)}`),
  });
}

/* --------------------------------------------------- la colinéarité */

function colineaireValeur(t) {
  const [c, d] = [nonNul(t, -4, 4), nonNul(t, -4, 4)];
  const k = t.au([-3, -2, 2, 3]);
  const a = k * c;
  const m = k * d; // a × d − m × c = 0
  const croise = (a * c) % d === 0 ? (a * c) / d : null; // a × c − m × d = 0, le déterminant mal croisé
  return manche(t.melanger, {
    consigne: 'colineaire-valeur',
    question: `Vecteurs u(${nb(a)} ; m) et v${couple(c, d)}\nPour quelle valeur de m sont-ils colinéaires ?`,
    bonne: nb(m),
    pieges: [[nb(-m), 'determinant-signe'], [croise === null ? null : nb(croise), 'determinant-croise']],
    voisin: (j) => nb(m + alterne(j)),
  });
}

const OUI = 'Colinéaires';
const NON = 'Pas colinéaires';

function colineaireTest(t) {
  const [a, b] = [nonNul(t, -5, 5), nonNul(t, -5, 5)];
  const k = t.au([-3, -2, 2, 3]);
  const sorte = t.au(['oui', 'oui', 'signe', 'decale']);
  let v;
  if (sorte === 'oui') v = [k * a, k * b];
  else if (sorte === 'signe') v = [k * a, -k * b];
  else v = [k * a, k * b + t.au([-1, 1])];
  const oui = sorte === 'oui';
  return {
    consigne: 'colineaire-test',
    question: `Vecteurs u${couple(a, b)} et v${couple(v[0], v[1])}\nColinéaires ?`,
    choix: cartes(t.melanger([OUI, NON])),
    bonne: oui ? OUI : NON,
    pieges: oui ? { [NON]: 'determinant-nul' } : { [OUI]: sorte === 'signe' ? 'proportion-et-signe' : 'determinant-nul' },
  };
}

/* --------------------------------------------------- le parallélogramme */

function parallelogramme(t) {
  let A;
  let B;
  let C;
  do {
    A = [t.entre(-5, 5), t.entre(-5, 5)];
    B = [t.entre(-5, 5), t.entre(-5, 5)];
    C = [t.entre(-5, 5), t.entre(-5, 5)];
  } while ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0);
  const D = [A[0] - B[0] + C[0], A[1] - B[1] + C[1]];
  return manche(t.melanger, {
    consigne: 'parallelogramme',
    question: `ABCD est un parallélogramme.\n${nomme('A', A)}, ${nomme('B', B)}, ${nomme('C', C)}\nCoordonnées de D ?`,
    bonne: couple(D[0], D[1]),
    pieges: t.melanger([
      [couple(B[0] + C[0] - A[0], B[1] + C[1] - A[1]), 'ordre-des-sommets'],
      [couple(A[0] + B[0] - C[0], A[1] + B[1] - C[1]), 'ordre-des-sommets'],
    ]),
    voisin: (k) => couple(D[0] + alterne(k), D[1]),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  return t.melanger([
    coordonnees(t), coordonnees(t),
    combinaison(t), milieu(t), distance(t),
    colineaireValeur(t), colineaireTest(t),
    parallelogramme(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'coordonnees-vecteur': 'Donne les coordonnées du vecteur A B.',
  combinaison: 'Calcule les coordonnées de ce vecteur.',
  milieu: 'Trouve les coordonnées du milieu du segment A B.',
  distance: 'Calcule la longueur A B.',
  'colineaire-valeur': 'Trouve la valeur de m qui rend ces deux vecteurs colinéaires.',
  'colineaire-test': 'Ces deux vecteurs sont-ils colinéaires ?',
  parallelogramme: 'Trouve les coordonnées du quatrième sommet de ce parallélogramme.',

  'extremite-moins-origine': 'Les coordonnées du vecteur A B, c’est l’extrémité moins l’origine : B moins A.',
  'soustraire-pas-additionner': 'Pour un vecteur, on soustrait les coordonnées des deux points, on ne les additionne pas.',
  'coordonnee-par-coordonnee': 'On additionne abscisse avec abscisse, ordonnée avec ordonnée, pas les deux coordonnées d’un même vecteur.',
  'signe-de-la-somme': 'C’est une somme : on additionne les coordonnées des deux vecteurs, on ne les soustrait pas.',
  'multiplier-chaque-coordonnee': 'Le nombre devant le vecteur multiplie ses deux coordonnées, pas seulement la première.',
  'soustraire-chaque-coordonnee': 'Attention au signe moins : on soustrait les coordonnées du second vecteur.',
  'milieu-somme': 'Le milieu, c’est la moyenne des coordonnées : on additionne, puis on divise par deux.',
  'milieu-diviser': 'Tu as additionné les coordonnées, il reste à diviser par deux.',
  'racine-oubliee': 'Tu as la somme des carrés des écarts : la longueur est sa racine carrée.',
  'distance-pas-somme': 'La distance n’est pas la somme des écarts : on élève chaque écart au carré, on additionne, puis on prend la racine.',
  'determinant-signe': 'Écris le déterminant, x de u fois y de v moins y de u fois x de v, et résous déterminant égal zéro sans perdre le signe.',
  'determinant-croise': 'Le déterminant croise les coordonnées : x de u fois y de v, moins y de u fois x de v.',
  'determinant-nul': 'Calcule le déterminant : s’il est nul, les vecteurs sont colinéaires ; sinon, ils ne le sont pas.',
  'proportion-et-signe': 'Les coordonnées doivent être proportionnelles avec le même coefficient, signe compris : vérifie avec le déterminant.',
  'ordre-des-sommets': 'Dans le parallélogramme A B C D, les sommets se suivent : le vecteur A B est égal au vecteur D C.',

  'coordonnees-vecteur-regle': 'Coordonnées du vecteur A B : abscisse de B moins abscisse de A, ordonnée de B moins ordonnée de A.',
  'combinaison-regle': 'Calcule coordonnée par coordonnée : d’abord les abscisses, puis les ordonnées.',
  'milieu-regle': 'Le milieu a pour coordonnées la moyenne des abscisses et la moyenne des ordonnées.',
  'distance-regle': 'La longueur A B est la racine carrée de la somme des carrés des écarts d’abscisses et d’ordonnées.',
  'colineaire-valeur-regle': 'Deux vecteurs sont colinéaires quand leur déterminant est nul : écris-le, puis résous.',
  'colineaire-test-regle': 'Calcule le déterminant : nul, colinéaires ; non nul, pas colinéaires.',
  'parallelogramme-regle': 'A B C D est un parallélogramme quand le vecteur A B est égal au vecteur D C.',
};
