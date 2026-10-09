/**
 * L'ÉQUATION DE DROITE — seconde.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_2DE_DROITES, MATH_2DE_FONC_AFFINE.
 *
 * CINQ SORTES DE MANCHES (2 + 1 + 2 + 1 + 2) :
 *   - LE COEFFICIENT DIRECTEUR entre deux points. LES PIÈGES : les x sur les
 *     y (Δx/Δy), soustraire dans deux ordres différents (le signe change) ;
 *   - L'ORDONNÉE À L'ORIGINE d'une droite de pente connue passant par un
 *     point : p = y − m x. LES PIÈGES, p = y + m x, et l'ordonnée du point ;
 *   - L'ÉQUATION RÉDUITE par deux points. LES PIÈGES : m et p échangés,
 *     p mal isolé ;
 *   - LES DROITES PARALLÈLES : même coefficient directeur. LES PIÈGES, même
 *     ordonnée à l'origine, coefficient opposé ;
 *   - LE SYSTÈME de deux équations à deux inconnues (solution entière, unique).
 *     LES PIÈGES : le couple dans le désordre (y ; x), un couple qui ne
 *     vérifie que la première équation.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'equation-de-droite', titre: 'L’équation de droite', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'L’équation de droite',
    accroche: 'Pente, ordonnée à l’origine et systèmes.',
    competences: ['MATH_2DE_DROITES', 'MATH_2DE_FONC_AFFINE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const ent = (n) => String(Object.is(n, -0) ? 0 : n).replace('-', '−');

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

const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));

/** Une fraction irréductible : « −3/2 », « 4 ». */
function frac(n, d) {
  const g = pgcd(n, d);
  let [a, b] = [n / g, d / g];
  if (b < 0) [a, b] = [-a, -b];
  return b === 1 ? ent(a) : `${ent(a)}/${b}`;
}

function nonNul(t, min, max) {
  let a;
  do {
    a = t.entre(min, max);
  } while (a === 0);
  return a;
}

const point = (nom, x, y) => `${nom}(${ent(x)} ; ${ent(y)})`;
const couple = (x, y) => `(${ent(x)} ; ${ent(y)})`;

/** « y = 2x − 3 », « y = −x », « y = 4 ». */
function reduite(m, p) {
  let mx = '';
  if (m === 1) mx = 'x';
  else if (m === -1) mx = '−x';
  else if (m !== 0) mx = `${ent(m)}x`;
  if (!mx) return `y = ${ent(p)}`;
  if (p === 0) return `y = ${mx}`;
  return `y = ${mx} ${p > 0 ? '+' : '−'} ${Math.abs(p)}`;
}

/** « 2x + y = 7 », « −x − 3y = −1 ». */
function lineaire(a, b, c) {
  const terme = (k, v) => {
    if (k === 1) return v;
    if (k === -1) return `−${v}`;
    return `${ent(k)}${v}`;
  };
  const yb = b > 0 ? `+ ${terme(b, 'y')}` : `− ${terme(-b, 'y')}`;
  return `${terme(a, 'x')} ${yb} = ${ent(c)}`;
}

/* ------------------------------------------------ le coefficient directeur */

function coefficient(t) {
  const x1 = t.entre(-5, 5);
  const y1 = t.entre(-5, 5);
  const dx = nonNul(t, -4, 4);
  const dy = nonNul(t, -8, 8);
  return manche(t.melanger, {
    consigne: 'coefficient-directeur',
    question: `${point('A', x1, y1)} et ${point('B', x1 + dx, y1 + dy)}\nCoefficient directeur de la droite (AB) ?`,
    bonne: frac(dy, dx),
    pieges: [[frac(dx, dy), 'dy-sur-dx'], [frac(-dy, dx), 'meme-ordre']],
    voisin: (k) => frac(dy + (k % 2 ? k : -k) * Math.abs(dx), dx),
  });
}

/* ------------------------------------------- l'ordonnée à l'origine */

function ordonnee(t) {
  const m = nonNul(t, -4, 4);
  const x = nonNul(t, -5, 5);
  const y = t.entre(-6, 6);
  const p = y - m * x;
  return manche(t.melanger, {
    consigne: 'ordonnee-origine',
    question: `La droite de coefficient directeur ${ent(m)} passe par ${point('A', x, y)}.\nSon ordonnée à l’origine ?`,
    bonne: ent(p),
    pieges: [[ent(y + m * x), 'calcul-de-p'], [ent(y), 'ordonnee-du-point']],
    voisin: (k) => ent(p + (k % 2 ? k : -k)),
  });
}

/* --------------------------------------------------- l'équation réduite */

function equationReduite(t) {
  const m = nonNul(t, -4, 4);
  let p;
  do {
    p = t.entre(-6, 6);
  } while (p === m);
  const x1 = nonNul(t, -4, 4);
  const x2 = x1 + t.entre(1, 3);
  const [y1, y2] = [m * x1 + p, m * x2 + p];
  return manche(t.melanger, {
    consigne: 'equation-reduite',
    question: `${point('A', x1, y1)} et ${point('B', x2, y2)}\nÉquation réduite de la droite (AB) ?`,
    bonne: reduite(m, p),
    pieges: [[reduite(p, m), 'm-et-p'], [reduite(m, y1 + m * x1), 'calcul-de-p']],
    voisin: (k) => reduite(m, p + (k % 2 ? k : -k)),
  });
}

/* --------------------------------------------------- les parallèles */

function paralleles(t) {
  const m = nonNul(t, -5, 5);
  const p = t.entre(-6, 6);
  let p2;
  do {
    p2 = t.entre(-6, 6);
  } while (p2 === p);
  let m2;
  do {
    m2 = nonNul(t, -5, 5);
  } while (m2 === m || m2 === -m);
  return manche(t.melanger, {
    consigne: 'paralleles',
    question: `(d) : ${reduite(m, p)}\nQuelle droite est parallèle à (d) ?`,
    bonne: reduite(m, p2),
    pieges: [[reduite(m2, p), 'meme-ordonnee-pas-parallele'], [reduite(-m, p2), 'signe-du-coefficient']],
    voisin: (k) => reduite(m + k, p2),
  });
}

/* ------------------------------------------------------- le système */

function systeme(t) {
  let x0;
  let y0;
  do {
    x0 = t.entre(-5, 5);
    y0 = t.entre(-5, 5);
  } while (x0 === y0);
  let a;
  let b;
  let c;
  let d;
  do {
    [a, b, c, d] = [nonNul(t, -3, 3), nonNul(t, -3, 3), nonNul(t, -3, 3), nonNul(t, -3, 3)];
  } while (a * d - b * c === 0);
  return manche(t.melanger, {
    consigne: 'systeme',
    question: `${lineaire(a, b, a * x0 + b * y0)}\n${lineaire(c, d, c * x0 + d * y0)}\nLe couple solution (x ; y) ?`,
    bonne: couple(x0, y0),
    pieges: [[couple(y0, x0), 'ordre-du-couple'], [couple(x0 + b, y0 - a), 'les-deux-equations']],
    voisin: (k) => couple(x0 + (k % 2 ? k : -k), y0),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  return t.melanger([
    coefficient(t), coefficient(t),
    ordonnee(t),
    equationReduite(t), equationReduite(t),
    paralleles(t),
    systeme(t), systeme(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'coefficient-directeur': 'Calcule le coefficient directeur de la droite qui passe par ces deux points.',
  'ordonnee-origine': 'Trouve l’ordonnée à l’origine de cette droite.',
  'equation-reduite': 'Trouve l’équation réduite de la droite qui passe par ces deux points.',
  paralleles: 'Laquelle de ces droites est parallèle à la droite d ?',
  systeme: 'Résous ce système de deux équations à deux inconnues.',

  'dy-sur-dx': 'Le coefficient directeur, c’est la variation des ordonnées divisée par la variation des abscisses : les y en haut, les x en bas.',
  'meme-ordre': 'Soustrais dans le même ordre en haut et en bas : y de B moins y de A, sur x de B moins x de A.',
  'calcul-de-p': 'Remplace x et y par les coordonnées d’un point dans y égale m x plus p, puis isole p : attention au signe.',
  'ordonnee-du-point': 'L’ordonnée à l’origine, c’est l’ordonnée du point d’abscisse zéro, pas celle du point donné.',
  'm-et-p': 'Dans y égale m x plus p, m est le nombre devant x et p le nombre seul : ne les échange pas.',
  'meme-ordonnee-pas-parallele': 'Deux droites parallèles ont le même coefficient directeur ; la même ordonnée à l’origine ne suffit pas.',
  'signe-du-coefficient': 'Le coefficient directeur doit être exactement le même, signe compris.',
  'ordre-du-couple': 'Un couple solution s’écrit dans l’ordre : x d’abord, y ensuite.',
  'les-deux-equations': 'Ce couple vérifie la première équation, mais pas la seconde : la solution doit vérifier les deux.',

  'coefficient-directeur-regle': 'Différence des ordonnées divisée par la différence des abscisses, dans le même ordre.',
  'ordonnee-origine-regle': 'p est égal à y moins m fois x, avec les coordonnées du point.',
  'equation-reduite-regle': 'Calcule d’abord m avec les deux points, puis p avec l’un d’eux.',
  'paralleles-regle': 'Deux droites sont parallèles quand elles ont le même coefficient directeur.',
  'systeme-regle': 'Par substitution ou par combinaison, trouve x et y, puis vérifie le couple dans les deux équations.',
};
