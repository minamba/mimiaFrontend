/**
 * L'ÉCHELLE CONTRE LE MUR — le théorème de Pythagore et sa réciproque, en 4e.
 * Professeure : Nora (mathématiques).
 *
 * Beaucoup de triplets entiers (3-4-5, 5-12-13, 8-15-17…) pour des valeurs
 * exactes, et quelques longueurs quelconques arrondies au dixième : la
 * question dit TOUJOURS laquelle des deux on attend.
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - L'HYPOTÉNUSE (3) : deux exactes, une arrondie. Pièges : soustraire
 *     les carrés au lieu de les ajouter, ajouter les longueurs sans carrés ;
 *   - UN CÔTÉ DE L'ANGLE DROIT (3) : une exacte, une arrondie, et l'échelle
 *     contre le mur. LE PIÈGE : additionner au lieu de soustraire ; puis
 *     soustraire les longueurs sans carrés ;
 *   - LA RÉCIPROQUE (2) : le triangle est-il rectangle, et en quel sommet ?
 *     Pièges : conclure sans l'égalité exacte, l'angle droit placé ailleurs
 *     qu'en face du plus grand côté.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'echelle-contre-le-mur', titre: 'L’échelle contre le mur', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'L’échelle contre le mur',
    accroche: 'Pythagore, dans un sens et dans l’autre.',
    competences: ['MATH_4E_PYTHAGORE', 'MATH_4E_PYTHAGORE_REC'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Les triplets de Pythagore de base (on les agrandit parfois). */
export const TRIPLETS = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
const TRIANGLES = ['ABC', 'DEF', 'RST', 'KLM', 'UVW'];

/** Arrondi au dixième, toujours avec son chiffre : « 8,1 », « 8,0 ». */
export const dix = (x) => (Math.round(x * 10) / 10).toFixed(1).replace('.', ',');
/** « 2,5 » : la virgule. */
const nb = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',');
/** Une longueur : entière si elle l'est, sinon arrondie au dixième. */
const longueur = (x) => (Number.isInteger(x) ? String(x) : dix(x));

/** Une manche : la bonne réponse, ses pièges (jamais justes), et des voisins s'il en manque. */
function monter(melanger, consigne, question, bonne, pieges, voisin) {
  const faux = pieges.filter(([v]) => v !== bonne);
  const cles = troisChoix(bonne, faux.map(([v]) => v), voisin);
  const lesPieges = {};
  faux.forEach(([v, phrase]) => {
    if (cles.includes(v) && !(v in lesPieges)) lesPieges[v] = phrase;
  });
  return {
    consigne, question, bonne, choix: melanger(cles).map((c) => ({ cle: c, libelle: c })), pieges: lesPieges,
  };
}

/** Un triplet, agrandi d'un facteur entier tant que les côtés restent raisonnables. */
function triplet({ entre, au }) {
  const [a, b, c] = au(TRIPLETS);
  const k = entre(1, Math.max(1, Math.min(4, Math.floor(40 / c))));
  return [a * k, b * k, c * k];
}

/** « AB » écrit dans l'ordre du nom du triangle. */
const segment = (nom, x, y) => (nom.indexOf(x) < nom.indexOf(y) ? `${x}${y}` : `${y}${x}`);

/** Le nom du triangle, son angle droit P, et les deux autres sommets Q et R. */
function triangle({ au, melanger }) {
  const nom = au(TRIANGLES);
  const [P, Q, R] = melanger(nom.split(''));
  return {
    nom, P, Q, R,
  };
}

const finie = (x) => !dix(x).endsWith(',0');

function hypotenuse(o, exacte) {
  const { entre, melanger } = o;
  const {
    nom, P, Q, R,
  } = triangle(o);
  let u; let v; let h;
  if (exacte) {
    const [a, b, c] = triplet(o);
    [u, v] = melanger([a, b]);
    h = c;
  } else {
    do {
      u = entre(2, 12);
      v = entre(2, 12);
      h = Math.sqrt(u * u + v * v);
    } while (u === v || Number.isInteger(h) || !finie(h));
  }
  const bonne = `${exacte ? h : dix(h)} cm`;
  return monter(
    melanger,
    'hypotenuse',
    `${nom} rectangle en ${P} : ${segment(nom, P, Q)} = ${u} cm, ${segment(nom, P, R)} = ${v} cm. ${segment(nom, Q, R)} = ? (${exacte ? 'valeur exacte' : 'arrondi au dixième'})`,
    bonne,
    [
      [`${longueur(Math.sqrt(Math.abs(v * v - u * u)))} cm`, 'hypotenuse-additionner'],
      [`${u + v} cm`, 'carres-pas-longueurs'],
    ],
    (k) => `${exacte ? h + k : dix(h + k)} cm`,
  );
}

function coteAngleDroit(o, sorte) {
  const { entre, au, melanger } = o;
  if (sorte === 'echelle') {
    // En décimètres, pour des longueurs entières ; la réponse est en mètres.
    let L; let d; let h;
    do {
      L = au([25, 30, 35, 40, 45, 50]);
      d = entre(Math.ceil(L / 4), Math.floor(L / 2));
      h = Math.sqrt(L * L - d * d);
    } while (!finie(h / 10) || dix(Math.sqrt(L * L + d * d) / 10) === dix(h / 10));
    return monter(
      melanger,
      'cote-angle-droit',
      `Une échelle de ${nb(L / 10)} m est posée contre un mur vertical, son pied à ${nb(d / 10)} m du mur. À quelle hauteur touche-t-elle le mur ? (arrondi au dixième)`,
      `${dix(h / 10)} m`,
      [
        [`${dix(Math.sqrt(L * L + d * d) / 10)} m`, 'soustraire-pour-un-cote'],
        [`${nb((L - d) / 10)} m`, 'carres-pas-longueurs'],
      ],
      (k) => `${dix(h / 10 + k / 10)} m`,
    );
  }
  const {
    nom, P, Q, R,
  } = triangle(o);
  let a; let b; let c;
  const exacte = sorte === 'exacte';
  if (exacte) {
    const t = triplet(o);
    [a, b] = melanger([t[0], t[1]]);
    c = t[2];
  } else {
    do {
      c = entre(6, 15);
      a = entre(2, c - 1);
      b = Math.sqrt(c * c - a * a);
    } while (Number.isInteger(b) || !finie(b) || dix(Math.sqrt(c * c + a * a)) === dix(b));
  }
  return monter(
    melanger,
    'cote-angle-droit',
    `${nom} rectangle en ${P} : ${segment(nom, Q, R)} = ${c} cm, ${segment(nom, P, Q)} = ${a} cm. ${segment(nom, P, R)} = ? (${exacte ? 'valeur exacte' : 'arrondi au dixième'})`,
    `${exacte ? b : dix(b)} cm`,
    [
      [`${longueur(Math.sqrt(c * c + a * a))} cm`, 'soustraire-pour-un-cote'],
      [`${c - a} cm`, 'carres-pas-longueurs'],
    ],
    (k) => `${exacte ? b + k : dix(b + k)} cm`,
  );
}

function reciproque(o) {
  const {
    entre, au, melanger,
  } = o;
  const rectangle = entre(0, 1) === 1;
  let [a, b, c] = triplet(o);
  if (!rectangle) {
    let c2 = c + au([-1, 1]);
    while (c2 <= Math.max(a, b) || c2 * c2 === a * a + b * b) c2 += 1;
    c = c2;
  }
  [a, b] = melanger([a, b]);
  const nom = au(TRIANGLES);
  const [V, W1, W2] = melanger(nom.split(''));
  const cotes = melanger([
    `${segment(nom, W1, W2)} = ${c} cm`,
    `${segment(nom, V, W1)} = ${a} cm`,
    `${segment(nom, V, W2)} = ${b} cm`,
  ]);
  const enV = `Rectangle en ${V}`;
  const enW = `Rectangle en ${au([W1, W2])}`;
  const non = 'Pas rectangle';
  return {
    consigne: 'reciproque',
    question: `Triangle ${nom} : ${cotes.join(', ')}.`,
    bonne: rectangle ? enV : non,
    choix: melanger([enV, enW, non]).map((x) => ({ cle: x, libelle: x })),
    pieges: rectangle
      ? { [enW]: 'angle-droit-oppose', [non]: 'reciproque-egalite' }
      : { [enV]: 'reciproque-egalite', [enW]: 'reciproque-egalite' },
  };
}

function quatrieme(o) {
  const liste = [];
  o.melanger([true, true, false]).forEach((exacte) => liste.push(hypotenuse(o, exacte)));
  o.melanger(['exacte', 'arrondie', 'echelle']).forEach((sorte) => liste.push(coteAngleDroit(o, sorte)));
  for (let i = 0; i < 2; i += 1) liste.push(reciproque(o));
  return liste;
}

const BANQUES = { QUATRIEME: quatrieme };

export function serie(graine = Date.now(), niveau = 'QUATRIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES[CLASSES[0]];
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // Les consignes.
  hypotenuse: 'Calcule la longueur de l’hypoténuse, le côté en face de l’angle droit.',
  'cote-angle-droit': 'Calcule la longueur du côté de l’angle droit qui manque.',
  reciproque: 'Ce triangle est-il rectangle ? Et si oui, en quel sommet ?',

  // Les erreurs, chacune avec sa méthode.
  'hypotenuse-additionner': 'L’hypoténuse est le plus grand côté : ajoute les carrés des deux autres côtés, puis prends la racine carrée.',
  'carres-pas-longueurs': 'Le théorème de Pythagore porte sur les carrés des longueurs : élève chaque côté au carré avant d’ajouter ou de soustraire.',
  'soustraire-pour-un-cote': 'Pour un côté de l’angle droit, on soustrait : le carré de l’hypoténuse moins le carré du côté connu, puis la racine carrée. Ce côté est plus court que l’hypoténuse.',
  'reciproque-egalite': 'Calcule le carré du plus grand côté et la somme des carrés des deux autres : le triangle n’est rectangle que s’ils sont exactement égaux.',
  'angle-droit-oppose': 'L’angle droit est toujours en face du plus grand côté, l’hypoténuse.',

  // Les replis.
  'hypotenuse-regle': 'Le carré de l’hypoténuse est la somme des carrés des deux autres côtés.',
  'cote-angle-droit-regle': 'Le carré du côté cherché, c’est le carré de l’hypoténuse moins le carré du côté connu.',
  'reciproque-regle': 'Compare le carré du plus grand côté à la somme des carrés des deux autres.',
};
