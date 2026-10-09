/**
 * LE PRODUIT SCALAIRE — Nora, 1re générale (spécialité).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   MATH_1RE_SCAL_DEFINITION, MATH_1RE_SCAL_ORTHOGONAL,
 *   MATH_1RE_SCAL_APPLICATION, MATH_1RE_SCAL_PROPRIETES
 *
 * HUIT SORTES DE MANCHES, une de chaque, mélangées. Toutes les réponses sont
 * CALCULÉES ici ; les pièges sont les erreurs que font vraiment les élèves :
 *   - AVEC LES COORDONNÉES : xx′ + yy′. LES PIÈGES : le déterminant xy′ − x′y
 *     (celui de la colinéarité), et un « vecteur » (xx′ ; yy′) au lieu d'un
 *     nombre ;
 *   - AVEC LES NORMES ET L'ANGLE : ‖u‖ × ‖v‖ × cos θ. LES PIÈGES : le sinus au
 *     lieu du cosinus, le cosinus oublié, le signe d'un angle obtus ;
 *   - AVEC LE PROJETÉ : AB × AH, au signe près. LES PIÈGES : AB × AC (sans
 *     projeter), le signe quand H est de l'autre côté de A ;
 *   - LA POLARISATION : u · v à partir de ‖u + v‖ ou de ‖u − v‖. LES PIÈGES :
 *     oublier la moitié, inverser le signe entre les deux formules ;
 *   - LE DÉVELOPPEMENT de ‖u ± v‖². LES PIÈGES : oublier le double produit
 *     (l'erreur de (a + b)² = a² + b²), ou ne le compter qu'une fois ;
 *   - L'ORTHOGONALITÉ : trouver m pour que u · v = 0. LES PIÈGES : le signe,
 *     et la condition de colinéarité à la place ;
 *   - AL-KASHI POUR UNE LONGUEUR, au dixième. LES PIÈGES : le signe du terme
 *     en cosinus, Pythagore dans un triangle qui n'est pas rectangle, le
 *     facteur deux oublié ;
 *   - AL-KASHI POUR UN ANGLE, au degré. LES PIÈGES : le mauvais côté opposé,
 *     l'angle supplémentaire (le signe).
 *
 * Les vecteurs s'écrivent avec la flèche combinante (u⃗, AB⃗) ; l'angle
 * géométrique en A, « BÂC ».
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'produit-scalaire', titre: 'Le produit scalaire', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Le produit scalaire',
    accroche: 'Quatre façons de le calculer, et Al-Kashi.',
    competences: [
      'MATH_1RE_SCAL_DEFINITION', 'MATH_1RE_SCAL_ORTHOGONAL',
      'MATH_1RE_SCAL_APPLICATION', 'MATH_1RE_SCAL_PROPRIETES',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const U = 'u⃗';
const V = 'v⃗';

/** Un entier écrit à la française : le signe moins typographique. */
export const ecrire = (n) => (n < 0 ? `−${-n}` : String(n));

/** Un décimal arrondi à `chiffres` décimales, à la virgule. */
const arrondi = (x, chiffres) => {
  const s = (Math.round(x * 10 ** chiffres) / 10 ** chiffres).toFixed(chiffres).replace('.', ',');
  return s.startsWith('-') ? `−${s.slice(1)}` : s;
};

/** k√r, écrit simplement : « 0 », « 6 », « −√3 », « 10√2 ». */
export function racine(k, r) {
  if (k === 0) return '0';
  if (r === 1) return ecrire(k);
  if (k === 1) return `√${r}`;
  if (k === -1) return `−√${r}`;
  return `${ecrire(k)}√${r}`;
}

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

/** Un entier non nul entre −max et max. */
const nonNul = (t, max) => {
  const n = t.entre(1, max);
  return t.tirer() < 0.5 ? -n : n;
};

/* ------------------------------------------------- avec les coordonnées */

function coordonnees(t) {
  let a;
  let b;
  let c;
  let d;
  do {
    [a, b, c, d] = [nonNul(t, 6), nonNul(t, 6), nonNul(t, 6), nonNul(t, 6)];
  } while (a * c + b * d === a * d - b * c);
  const bonne = a * c + b * d;
  return manche(t.melanger, {
    consigne: 'coordonnees',
    question: `${U}(${ecrire(a)} ; ${ecrire(b)}) et ${V}(${ecrire(c)} ; ${ecrire(d)}).   ${U} · ${V} = ?`,
    bonne: ecrire(bonne),
    pieges: [
      [ecrire(a * d - b * c), 'pas-le-determinant'],
      [`(${ecrire(a * c)} ; ${ecrire(b * d)})`, 'un-nombre-pas-un-vecteur'],
    ],
    voisin: (k) => ecrire(bonne + (k % 2 ? k : -k)),
  });
}

/* ------------------------------------------- avec les normes et l'angle */

/** [écriture de l'angle, cos = c/2 × √r, sin = s/2 × √q]. */
const ANGLES = [
  ['π/6', [1, 3], [1, 1]],
  ['π/4', [1, 2], [1, 2]],
  ['π/3', [1, 1], [1, 3]],
  ['π/2', [0, 1], [2, 1]],
  ['2π/3', [-1, 1], [1, 3]],
  ['3π/4', [-1, 2], [1, 2]],
  ['5π/6', [-1, 3], [1, 1]],
  ['π', [-2, 1], [0, 1]],
];

function normesAngle(t) {
  const n1 = 2 * t.entre(1, 5);
  const n2 = t.entre(2, 9);
  const demi = (n1 * n2) / 2;
  const [angle, [c, r], [s, q]] = t.au(ANGLES);
  const bonne = racine(demi * c, r);
  // L'angle plat (π) n'est pas obtus : son piège est le cosinus oublié.
  const obtus = c < 0 && angle !== 'π';
  const pieges = [
    [racine(demi * s, q), 'cosinus-pas-sinus'],
    [ecrire(n1 * n2), 'oublier-le-cosinus'],
  ];
  if (obtus) pieges.unshift([racine(-demi * c, r), 'angle-obtus']);
  return manche(t.melanger, {
    consigne: 'normes-angle',
    question: `‖${U}‖ = ${n1}, ‖${V}‖ = ${n2} et (${U}, ${V}) = ${angle}.   ${U} · ${V} = ?`,
    bonne,
    pieges,
    voisin: (k) => racine(demi * c + (c >= 0 ? k : -k), r),
  });
}

/* ------------------------------------------------------- avec le projeté */

function projete(t) {
  const ab = t.entre(3, 9);
  const dehors = t.tirer() < 0.4;
  const ah = dehors ? t.entre(1, 5) : t.entre(1, ab - 1);
  const ac = ah + t.entre(1, 4);
  const bonne = (dehors ? -1 : 1) * ab * ah;
  const place = dehors
    ? 'A est entre H et B'
    : 'H est sur le segment [AB]';
  return manche(t.melanger, {
    consigne: 'projete',
    question: `H est le projeté orthogonal de C sur (AB), et ${place}. AB = ${ab}, AH = ${ah}, AC = ${ac}.   AB⃗ · AC⃗ = ?`,
    bonne: ecrire(bonne),
    pieges: [
      [ecrire(-bonne), 'sens-du-projete'],
      [ecrire((dehors ? -1 : 1) * ab * ac), 'projeter-sur-la-droite'],
    ],
    voisin: (k) => ecrire(bonne + (dehors ? -k : k) * ab),
  });
}

/* ------------------------------------------------------- la polarisation */

function polarisation(t) {
  const plus = t.tirer() < 0.5;
  let a;
  let b;
  let c;
  do {
    a = t.entre(2, 9);
    b = t.entre(2, 9);
    c = t.entre(Math.abs(a - b) + 1, a + b - 1);
  } while ((c + a + b) % 2 !== 0);
  const double = plus ? c * c - a * a - b * b : a * a + b * b - c * c;
  const bonne = double / 2;
  return manche(t.melanger, {
    consigne: 'polarisation',
    question: `‖${U}‖ = ${a}, ‖${V}‖ = ${b} et ‖${U} ${plus ? '+' : '−'} ${V}‖ = ${c}.   ${U} · ${V} = ?`,
    bonne: ecrire(bonne),
    pieges: [
      [ecrire(double), 'polarisation-moitie'],
      [ecrire(-bonne), 'polarisation-signe'],
    ],
    voisin: (k) => ecrire(bonne + (k % 2 ? k : -k)),
  });
}

/* ------------------------------------------------------ le développement */

function developpement(t) {
  const plus = t.tirer() < 0.5;
  const a = t.entre(2, 8);
  const b = t.entre(2, 8);
  let p;
  do {
    p = t.entre(-(a * b - 1), a * b - 1);
  } while (p === 0);
  const signe = plus ? 1 : -1;
  const bonne = a * a + b * b + signe * 2 * p;
  return manche(t.melanger, {
    consigne: 'developpement',
    question: `‖${U}‖ = ${a}, ‖${V}‖ = ${b} et ${U} · ${V} = ${ecrire(p)}.   ‖${U} ${plus ? '+' : '−'} ${V}‖² = ?`,
    bonne: ecrire(bonne),
    pieges: [
      [ecrire(a * a + b * b), 'double-produit'],
      [ecrire(a * a + b * b + signe * p), 'double-produit-deux'],
    ],
    voisin: (k) => ecrire(bonne + 2 * k),
  });
}

/* --------------------------------------------------------- l'orthogonalité */

function orthogonalite(t) {
  let a;
  let b;
  let c;
  do {
    [a, b, c] = [nonNul(t, 6), nonNul(t, 4), nonNul(t, 6)];
  } while ((a * c) % b !== 0 || (b * c) % a !== 0);
  const m = -(a * c) / b;
  return manche(t.melanger, {
    consigne: 'orthogonalite',
    question: `${U}(${ecrire(a)} ; ${ecrire(b)}) et ${V}(${ecrire(c)} ; m). Pour quelle valeur de m sont-ils orthogonaux ?`,
    bonne: `m = ${ecrire(m)}`,
    pieges: [
      [`m = ${ecrire(-m)}`, 'orthogonal-signe'],
      [`m = ${ecrire((b * c) / a)}`, 'orthogonal-pas-colineaire'],
    ],
    voisin: (k) => `m = ${ecrire(m + (k % 2 ? k : -k))}`,
  });
}

/* --------------------------------------------------- Al-Kashi : longueur */

const DEG = Math.PI / 180;

function alKashiLongueur(t) {
  const b = t.entre(3, 12);
  const c = t.entre(3, 12);
  let theta;
  do {
    theta = 5 * t.entre(5, 31);
  } while (theta === 90);
  const co = Math.cos(theta * DEG);
  const exact = Math.sqrt(b * b + c * c - 2 * b * c * co);
  const bonne = arrondi(exact, 1);
  const candidats = [
    [Math.sqrt(b * b + c * c + 2 * b * c * co), 'al-kashi-signe'],
    t.au([[Math.sqrt(b * b + c * c), 'pas-rectangle'], [Math.sqrt(b * b + c * c - b * c * co), 'al-kashi-deux']]),
  ].filter(([v]) => Math.abs(v - exact) > 0.15);
  return manche(t.melanger, {
    consigne: 'al-kashi-longueur',
    question: `Dans le triangle ABC : AB = ${c}, AC = ${b} et BÂC = ${theta}°. BC ≈ ? (au dixième)`,
    bonne,
    pieges: candidats.map(([v, phrase]) => [arrondi(v, 1), phrase]),
    voisin: (k) => arrondi(exact + (k % 2 ? 0.3 * k : -0.3 * k), 1),
  });
}

/* ------------------------------------------------------ Al-Kashi : angle */

const degres = (cosinus) => Math.acos(cosinus) / DEG;

function alKashiAngle(t) {
  let a;
  let b;
  let c;
  do {
    [a, b, c] = [t.entre(3, 12), t.entre(3, 12), t.entre(3, 12)];
  } while (a >= b + c || b >= a + c || c >= a + b);
  const exact = degres((b * b + c * c - a * a) / (2 * b * c));
  const bonne = Math.round(exact);
  const candidats = [
    [180 - exact, 'angle-supplementaire'],
    [degres((a * a + b * b - c * c) / (2 * a * b)), 'cote-oppose'],
  ].filter(([v]) => Math.abs(v - exact) > 1.5);
  return manche(t.melanger, {
    consigne: 'al-kashi-angle',
    question: `Dans le triangle ABC : AB = ${c}, AC = ${b} et BC = ${a}. BÂC ≈ ? (au degré)`,
    bonne: `${bonne}°`,
    pieges: candidats.map(([v, phrase]) => [`${Math.round(v)}°`, phrase]),
    voisin: (k) => `${bonne + (k % 2 ? 3 * k : -3 * k)}°`,
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  // Une seule classe pour l'instant : le niveau ne change rien.
  if (!PAR_CLASSE[niveau]) return serie(graine, CLASSES[0]);
  return t.melanger([
    coordonnees(t), normesAngle(t), projete(t), polarisation(t),
    developpement(t), orthogonalite(t), alKashiLongueur(t), alKashiAngle(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  coordonnees: 'Calcule ce produit scalaire avec les coordonnées.',
  'normes-angle': 'Calcule ce produit scalaire avec les normes et l’angle.',
  projete: 'Calcule ce produit scalaire grâce au projeté orthogonal.',
  polarisation: 'Retrouve le produit scalaire à partir des normes.',
  developpement: 'Développe ce carré de norme.',
  orthogonalite: 'Trouve la valeur qui rend ces deux vecteurs orthogonaux.',
  'al-kashi-longueur': 'Calcule cette longueur avec la formule d’Al-Kashi.',
  'al-kashi-angle': 'Calcule cet angle avec la formule d’Al-Kashi.',

  'pas-le-determinant': 'Ça, c’est le déterminant, celui de la colinéarité. Pour le produit scalaire, on multiplie les abscisses entre elles, les ordonnées entre elles, et on ajoute.',
  'un-nombre-pas-un-vecteur': 'Un produit scalaire est un nombre, pas un vecteur : ajoute les deux produits.',
  'cosinus-pas-sinus': 'C’est le cosinus de l’angle qui intervient, pas le sinus.',
  'oublier-le-cosinus': 'Tu as multiplié les normes, mais il manque le cosinus de l’angle.',
  'angle-obtus': 'L’angle est obtus : son cosinus est négatif, et le produit scalaire aussi.',
  'projeter-sur-la-droite': 'On ne multiplie pas par A C : on projette C sur la droite A B, et on multiplie A B par A H.',
  'sens-du-projete': 'Regarde le sens : si A B et A H vont dans le même sens, le produit est positif ; sinon, il est négatif.',
  'polarisation-moitie': 'N’oublie pas de diviser par deux : le double produit vaut deux fois u scalaire v.',
  'polarisation-signe': 'Avec la norme de u plus v, le double produit s’ajoute ; avec la norme de u moins v, il se retranche. Repars du bon développement.',
  'double-produit': 'Comme pour un carré de somme, il y a un double produit : deux fois u scalaire v.',
  'double-produit-deux': 'Le double produit compte deux fois u scalaire v, pas une seule.',
  'orthogonal-signe': 'Écris que x x prime plus y y prime vaut zéro, puis isole m sans perdre le signe.',
  'orthogonal-pas-colineaire': 'Ça, c’est la condition de colinéarité. Orthogonaux veut dire produit scalaire nul : x x prime plus y y prime égale zéro.',
  'al-kashi-signe': 'Dans la formule d’Al-Kashi, on retranche deux fois le produit des côtés par le cosinus de l’angle.',
  'pas-rectangle': 'Le triangle n’est pas rectangle : Pythagore ne suffit pas, il faut le terme en cosinus d’Al-Kashi.',
  'al-kashi-deux': 'Il manque le facteur deux devant le produit des côtés et du cosinus.',
  'cote-oppose': 'Le côté au carré qu’on retranche est celui qui fait face à l’angle cherché : ici, B C.',
  'angle-supplementaire': 'Attention au signe du cosinus : tu as trouvé l’angle supplémentaire. Le cosinus vaut la somme des carrés des côtés adjacents, moins le carré du côté opposé, le tout sur deux fois leur produit.',

  'coordonnees-regle': 'Multiplie les abscisses, multiplie les ordonnées, et ajoute les deux produits.',
  'normes-angle-regle': 'Produit des normes, fois le cosinus de l’angle entre les deux vecteurs.',
  'projete-regle': 'Projette C sur la droite A B : le produit vaut A B fois A H, avec un signe moins si les sens sont opposés.',
  'polarisation-regle': 'Développe le carré de la norme, puis isole u scalaire v, sans oublier de diviser par deux.',
  'developpement-regle': 'Carré de la première norme, plus carré de la seconde, plus ou moins deux fois le produit scalaire.',
  'orthogonalite-regle': 'Deux vecteurs sont orthogonaux quand leur produit scalaire est nul : écris l’équation et résous-la.',
  'al-kashi-longueur-regle': 'B C au carré égale A B au carré plus A C au carré, moins deux fois A B fois A C fois le cosinus de l’angle en A.',
  'al-kashi-angle-regle': 'Isole le cosinus de l’angle dans la formule d’Al-Kashi, puis prends l’arc cosinus.',
};
