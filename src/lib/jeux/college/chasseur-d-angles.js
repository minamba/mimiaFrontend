/**
 * LE CHASSEUR D'ANGLES — les angles de la 5e.
 * Professeure : Nora (mathématiques).
 *
 * Aucun dessin : la figure est dite en une phrase (deux droites, une
 * sécante ; un triangle et deux de ses angles ; trois longueurs).
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - L'ANGLE ÉGAL (3) : alterne-interne ou correspondant d'un angle donné.
 *     Pièges : le supplémentaire (180 − x), le complémentaire (90 − x), et,
 *     une fois sur deux, des droites NON parallèles — on ne peut rien dire ;
 *   - LA SOMME DES ANGLES (3) : le troisième angle d'un triangle, ou l'angle
 *     à la base d'un triangle isocèle. Pièges : 360° au lieu de 180°, la
 *     somme des deux angles donnée comme réponse, l'angle au sommet recopié ;
 *   - LE TRIANGLE CONSTRUCTIBLE (2) : l'inégalité triangulaire, avec le cas
 *     limite du triangle aplati.
 *
 * LE DESSIN (09/10/2026) : l'angle égal porte un `visuel`, les deux droites
 * et leur sécante (penchées l'une vers l'autre si elles ne sont pas
 * parallèles), l'angle donné au premier croisement, le demandé en « ? » au
 * second ; la somme des angles, le triangle avec ses angles connus et « ? ».
 * Pas le triangle « constructible » : le dessiner donnerait la réponse.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'chasseur-d-angles', titre: 'Le chasseur d’angles', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Le chasseur d’angles',
    accroche: 'Parallèles, triangles : traque l’angle.',
    competences: ['MATH_5E_GEO_ANGLES', 'MATH_5E_GEO_TRI_ANGLES', 'MATH_5E_GEO_TRI_INEG'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

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

const deg = (x) => `${x}°`;
export const ON_NE_SAIT_PAS = 'On ne peut pas savoir';

const CONSTRUCTIBLE = {
  oui: 'Oui, un vrai triangle',
  aplati: 'Oui, mais aplati',
  non: 'Non, impossible',
};

/**
 * Les coins marqués sur la sécante du dessin, qui descend vers la droite : aux
 * deux croisements, « se » et « no » sont aigus, « ne » et « so » obtus. On
 * prend ceux qui ont l'allure de l'angle donné. Alternes-internes : entre les
 * droites (sous la 1re, au-dessus de la 2de), de part et d'autre de la sécante ;
 * correspondants : le même coin aux deux croisements.
 */
const COINS = {
  'alterne-interne': { aigu: ['se', 'no'], obtus: ['so', 'ne'] },
  correspondant: { aigu: ['se', 'se'], obtus: ['ne', 'ne'] },
};

function secante(x, sorte, paralleles) {
  const [c1, c2] = COINS[sorte][x < 90 ? 'aigu' : 'obtus'];
  return {
    type: 'figure',
    forme: 'secante',
    angles: [{ point: 1, coin: c1, valeur: deg(x) }, { point: 2, coin: c2, valeur: '?' }],
    ...(paralleles ? {} : { paralleles: false }),
  };
}

function cinquieme({ entre, au, melanger }) {
  const liste = [];

  // L'angle égal : alterne-interne ou correspondant.
  const nonParallele = entre(0, 1) === 1 ? entre(0, 2) : -1;
  for (let i = 0; i < 3; i += 1) {
    let x = entre(20, 160);
    while (x >= 85 && x <= 95) x = entre(20, 160);
    const sorte = au(['alterne-interne', 'correspondant']);
    const visuel = secante(x, sorte, i !== nonParallele);
    if (i === nonParallele) {
      liste.push({
        ...monter(
          melanger,
          'angle-egal',
          `Deux droites NON parallèles, une sécante. Un angle mesure ${x}°. Son angle ${sorte} mesure ?`,
          ON_NE_SAIT_PAS,
          [[deg(x), 'paralleles-d-abord'], [deg(180 - x), 'paralleles-d-abord']],
          (k) => deg(x + 10 * k),
        ),
        visuel,
      });
    } else {
      liste.push({
        ...monter(
          melanger,
          'angle-egal',
          `Deux droites parallèles, une sécante. Un angle mesure ${x}°. Son angle ${sorte} mesure ?`,
          deg(x),
          [[deg(180 - x), 'angles-egaux'], ...(x < 90 ? [[deg(90 - x), 'pas-complementaires']] : [])],
          (k) => deg(x + 10 * k),
        ),
        visuel,
      });
    }
  }

  // La somme des angles d'un triangle.
  const isocele = entre(0, 2);
  for (let i = 0; i < 3; i += 1) {
    if (i === isocele) {
      let s = 2 * entre(10, 70);
      while (s === 60) s = 2 * entre(10, 70);
      const base = (180 - s) / 2;
      liste.push({
        ...monter(
          melanger,
          'somme-triangle',
          `Triangle ABC isocèle en A, angle A = ${s}°. Angle B = ?`,
          deg(base),
          [[deg(180 - s), 'isocele-partage'], [deg(s), 'isocele-base']],
          (k) => deg(base + 5 * k),
        ),
        visuel: { type: 'figure', forme: 'triangle-quelconque', angle: { A: deg(s), B: '?' } },
      });
    } else {
      let a = entre(25, 85);
      let b = entre(25, 85);
      while (a + b > 165 || a + b === 90) {
        a = entre(25, 85);
        b = entre(25, 85);
      }
      const c = 180 - a - b;
      liste.push({
        ...monter(
          melanger,
          'somme-triangle',
          `Triangle ABC : angle A = ${a}°, angle B = ${b}°. Angle C = ?`,
          deg(c),
          [[deg(360 - a - b), 'somme-cent-quatre-vingts'], [deg(a + b), 'soustraire-de-la-somme']],
          (k) => deg(c + 10 * k),
        ),
        visuel: { type: 'figure', forme: 'triangle-quelconque', angle: { A: deg(a), B: deg(b), C: '?' } },
      });
    }
  }

  // Le triangle constructible.
  for (let i = 0; i < 2; i += 1) {
    const sorte = au(['oui', 'non', 'aplati']);
    const a = entre(3, 9);
    const b = entre(3, 9);
    let c;
    if (sorte === 'oui') c = entre(Math.abs(a - b) + 1, a + b - 1);
    else if (sorte === 'aplati') c = a + b;
    else c = a + b + entre(1, 4);
    const cotes = melanger([a, b, c]);
    const pieges = {
      oui: { non: 'inegalite-verifiee', aplati: 'aplati-seulement-egalite' },
      non: { oui: 'plus-grand-cote', aplati: 'aplati-seulement-egalite' },
      aplati: { oui: 'aplati-egalite', non: 'aplati-egalite' },
    }[sorte];
    liste.push({
      consigne: 'constructible',
      question: `Un triangle de côtés ${cotes[0]} cm, ${cotes[1]} cm et ${cotes[2]} cm ?`,
      bonne: sorte,
      choix: ['oui', 'aplati', 'non'].map((cle) => ({ cle, libelle: CONSTRUCTIBLE[cle] })),
      pieges,
    });
  }
  return liste;
}

const BANQUES = { CINQUIEME: cinquieme };

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
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
  'angle-egal': 'Deux droites, une sécante : combien mesure l’angle demandé ?',
  'somme-triangle': 'Combien mesure l’angle qui manque dans ce triangle ?',
  constructible: 'Peut-on construire un triangle avec ces trois longueurs ?',

  // Les erreurs, chacune avec sa méthode.
  'angles-egaux': 'Avec des droites parallèles, les angles alternes-internes et les angles correspondants ont la même mesure : ils ne s’ajoutent pas pour faire un angle plat.',
  'pas-complementaires': 'Ces angles ne sont pas complémentaires : avec des droites parallèles, ils sont égaux.',
  'paralleles-d-abord': 'L’égalité des angles alternes-internes ou correspondants ne vaut que si les droites sont parallèles : sinon, on ne peut rien conclure.',
  'somme-cent-quatre-vingts': 'Dans un triangle, la somme des trois angles vaut cent quatre-vingts degrés, pas trois cent soixante.',
  'soustraire-de-la-somme': 'Ajoute les deux angles connus, puis retire ce total de cent quatre-vingts degrés.',
  'isocele-partage': 'Retire l’angle au sommet de cent quatre-vingts degrés, puis partage le reste en deux : les deux angles à la base sont égaux.',
  'isocele-base': 'Dans un triangle isocèle, ce sont les deux angles à la base qui sont égaux, pas l’angle au sommet.',
  'plus-grand-cote': 'Compare le plus grand côté à la somme des deux autres : s’il est plus long, les deux petits côtés ne peuvent pas se rejoindre.',
  'inegalite-verifiee': 'Le plus grand côté est plus court que la somme des deux autres : le triangle se construit.',
  'aplati-egalite': 'Quand le plus grand côté est égal à la somme des deux autres, les trois sommets sont alignés : le triangle est aplati.',
  'aplati-seulement-egalite': 'Un triangle n’est aplati que si le plus grand côté est exactement égal à la somme des deux autres.',

  // Les replis, si un choix voisin est pris.
  'angle-egal-regle': 'Vérifie d’abord que les droites sont parallèles ; si oui, alternes-internes et correspondants sont égaux.',
  'somme-triangle-regle': 'La somme des angles d’un triangle vaut cent quatre-vingts degrés : retire les angles connus.',
  'constructible-regle': 'Compare le plus grand côté à la somme des deux autres.',
};
