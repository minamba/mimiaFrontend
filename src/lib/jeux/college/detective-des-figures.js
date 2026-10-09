/**
 * LE DÉTECTIVE DES FIGURES — 6e, Nora. Nouveau jeu.
 *
 * COMPÉTENCES : MATH_6E_GEO_TRIANGLES, MATH_6E_GEO_QUADRILATERES, MATH_6E_GEO_CERCLE.
 *
 * Aucun dessin : on reconnaît la figure à ses PROPRIÉTÉS, écrites en texte.
 *
 * CINQ SORTES DE MANCHES :
 *   - QUEL TRIANGLE ? (3) : le nom le plus précis. Les pièges ne sont jamais
 *     des noms vrais mais moins précis (un équilatéral est aussi isocèle : on
 *     ne propose donc jamais « isocèle » pour un équilatéral) ;
 *   - QUEL QUADRILATÈRE ? (2) : même règle — tout carré est un losange et un
 *     rectangle, tout rectangle un parallélogramme : seuls des noms FAUX
 *     servent de pièges ;
 *   - TOUJOURS VRAI ? (1) : la propriété vraie pour TOUS les losanges (ou
 *     rectangles…), contre des propriétés vraies pour certains seulement ;
 *   - RAYON ET DIAMÈTRE (1) : LE PIÈGE, confondre les deux ;
 *   - DEDANS, DESSUS, DEHORS (1) : comparer la distance au centre avec le
 *     rayon — et non avec le diamètre.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'detective-des-figures', titre: 'Le détective des figures', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le détective des figures',
    accroche: 'Une figure se reconnaît à ses propriétés.',
    competences: ['MATH_6E_GEO_TRIANGLES', 'MATH_6E_GEO_QUADRILATERES', 'MATH_6E_GEO_CERCLE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const TRIANGLES = {
  isocele: 'isocèle',
  equilateral: 'équilatéral',
  rectangle: 'rectangle',
  'rectangle-isocele': 'rectangle isocèle',
  quelconque: 'quelconque',
};

/** Relu à la main : le nom le plus précis, et deux noms FAUX pour ce triangle. */
export const BANQUE_TRIANGLES = [
  { texte: 'Deux côtés de même longueur, le troisième plus court.', bonne: 'isocele', faux: ['equilateral', 'rectangle'] },
  { texte: 'Trois côtés de même longueur.', bonne: 'equilateral', faux: ['rectangle', 'quelconque'] },
  { texte: 'Un angle droit, et les deux côtés de cet angle de même longueur.', bonne: 'rectangle-isocele', faux: ['equilateral', 'quelconque'] },
  { texte: 'Un angle droit, et trois côtés de longueurs toutes différentes.', bonne: 'rectangle', faux: ['isocele', 'equilateral'] },
  { texte: 'Côtés : 4 cm, 4 cm et 6 cm.', bonne: 'isocele', faux: ['equilateral', 'quelconque'] },
  { texte: 'Côtés : 5 cm, 6 cm et 7 cm.', bonne: 'quelconque', faux: ['isocele', 'rectangle'] },
  { texte: 'Trois angles de 60°.', bonne: 'equilateral', faux: ['rectangle', 'quelconque'] },
  { texte: 'Angles : 90°, 45° et 45°.', bonne: 'rectangle-isocele', faux: ['equilateral', 'quelconque'] },
  { texte: 'Angles : 50°, 50° et 80°.', bonne: 'isocele', faux: ['equilateral', 'rectangle'] },
  { texte: 'Angles : 30°, 60° et 90°.', bonne: 'rectangle', faux: ['isocele', 'equilateral'] },
  { texte: 'Angles : 40°, 60° et 80°.', bonne: 'quelconque', faux: ['isocele', 'rectangle'] },
];

const PIEGE_TRIANGLE = {
  isocele: 'piege-isocele',
  equilateral: 'piege-equilateral',
  rectangle: 'piege-rectangle',
  'rectangle-isocele': 'piege-rectangle-isocele',
  quelconque: 'piege-quelconque',
};

const QUADRILATERES = {
  carre: 'carré',
  rectangle: 'rectangle',
  losange: 'losange',
  parallelogramme: 'parallélogramme',
};

/** Relu à la main : le nom le plus précis, et deux noms FAUX pour ce quadrilatère. */
export const BANQUE_QUADRILATERES = [
  { texte: 'Quatre côtés de même longueur, aucun angle droit.', bonne: 'losange', faux: ['carre', 'rectangle'] },
  { texte: 'Quatre angles droits, deux côtés voisins de longueurs différentes.', bonne: 'rectangle', faux: ['carre', 'losange'] },
  { texte: 'Côtés opposés parallèles, aucun angle droit, deux côtés voisins de longueurs différentes.', bonne: 'parallelogramme', faux: ['rectangle', 'losange'] },
  { texte: 'Diagonales qui se coupent en leur milieu, perpendiculaires, de longueurs différentes.', bonne: 'losange', faux: ['rectangle', 'carre'] },
  { texte: 'Diagonales qui se coupent en leur milieu, de même longueur, non perpendiculaires.', bonne: 'rectangle', faux: ['losange', 'carre'] },
  { texte: 'Diagonales qui se coupent en leur milieu, de longueurs différentes, non perpendiculaires.', bonne: 'parallelogramme', faux: ['rectangle', 'losange'] },
];

const PIEGE_QUADRILATERE = {
  carre: 'piege-carre',
  rectangle: 'piege-rectangle-quadri',
  losange: 'piege-losange',
};

const PROPRIETES = {
  'diag-perp': 'Diagonales perpendiculaires',
  'diag-egales': 'Diagonales de même longueur',
  'diag-milieu': 'Diagonales de même milieu',
  'angles-droits': 'Quatre angles droits',
  'cotes-egaux': 'Quatre côtés égaux',
  'cotes-paralleles': 'Côtés opposés parallèles',
  'un-angle-droit': 'Au moins un angle droit',
  'diag-perp-egales': 'Diagonales perpendiculaires et de même longueur',
  'diag-differentes': 'Diagonales de longueurs différentes',
  'cotes-differents': 'Côtés voisins de longueurs différentes',
};

/** Relu à la main : vraies pour TOUTE figure de la famille ; fausses = pas toujours vraies. */
export const BANQUE_PROPRIETES = [
  { figure: 'un losange', vraies: ['diag-perp', 'cotes-egaux', 'cotes-paralleles', 'diag-milieu'], fausses: ['diag-egales', 'angles-droits'], piege: 'pas-toujours' },
  { figure: 'un rectangle', vraies: ['diag-egales', 'angles-droits', 'cotes-paralleles', 'diag-milieu'], fausses: ['diag-perp', 'cotes-egaux'], piege: 'pas-toujours' },
  { figure: 'un parallélogramme', vraies: ['diag-milieu', 'cotes-paralleles'], fausses: ['diag-perp', 'diag-egales', 'un-angle-droit', 'cotes-egaux'], piege: 'pas-toujours' },
  { figure: 'un carré', vraies: ['diag-perp-egales'], fausses: ['diag-differentes', 'cotes-differents'], piege: 'carre-tout' },
];

const POSITIONS = [
  { cle: 'interieur', libelle: 'à l’intérieur' },
  { cle: 'sur', libelle: 'sur le cercle' },
  { cle: 'exterieur', libelle: 'à l’extérieur' },
];

/** Où est un point à la distance d du centre d'un cercle de rayon r ? */
export function position(d, r) {
  if (d === r) return 'sur';
  return d < r ? 'interieur' : 'exterieur';
}

/** Des dixièmes de centimètre, écrits à la française. */
const cm = (dixiemes) => `${String(dixiemes / 10).replace('.', ',')} cm`;

function mancheNom(melanger, consigne, item, noms, piegesPar) {
  const cles = [item.bonne, ...item.faux];
  return {
    consigne,
    question: item.texte,
    bonne: item.bonne,
    choix: melanger(cles).map((c) => ({ cle: c, libelle: noms[c] })),
    pieges: Object.fromEntries(item.faux.map((c) => [c, piegesPar[c]])),
  };
}

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  melanger(BANQUE_TRIANGLES).slice(0, 3).forEach((item) => {
    liste.push(mancheNom(melanger, 'quel-triangle', item, TRIANGLES, PIEGE_TRIANGLE));
  });

  melanger(BANQUE_QUADRILATERES).slice(0, 2).forEach((item) => {
    liste.push(mancheNom(melanger, 'quel-quadrilatere', item, QUADRILATERES, PIEGE_QUADRILATERE));
  });

  // Toujours vrai ?
  {
    const item = au(BANQUE_PROPRIETES);
    const vraie = au(item.vraies);
    const fausses = melanger(item.fausses).slice(0, 2);
    liste.push({
      consigne: 'propriete-toujours',
      question: `Toujours vrai pour ${item.figure} ?`,
      bonne: vraie,
      choix: melanger([vraie, ...fausses]).map((c) => ({ cle: c, libelle: PROPRIETES[c] })),
      pieges: Object.fromEntries(fausses.map((c) => [c, item.piege])),
    });
  }

  // Rayon et diamètre, en dixièmes de centimètre.
  {
    const sorte = entre(0, 2);
    let question;
    let juste;
    let faux;
    if (sorte === 0) {
      const r = entre(2, 15) * 10;
      question = `Un cercle a un rayon de ${cm(r)}. Son diamètre ?`;
      juste = 2 * r;
      faux = r / 2;
    } else {
      const D = entre(4, 20) * 10;
      question = sorte === 1
        ? `Un cercle a un diamètre de ${cm(D)}. Son rayon ?`
        : `A est sur le cercle de centre O et de diamètre ${cm(D)}. OA ?`;
      juste = D / 2;
      faux = sorte === 1 ? 2 * D : D;
    }
    const bonne = cm(juste);
    const piege = cm(faux);
    const voisin = cm(juste + 10 === faux ? juste + 20 : juste + 10);
    const choix = [bonne, piege, voisin];
    liste.push({
      consigne: 'cercle-mesure',
      question,
      bonne,
      choix: melanger(choix).map((c) => ({ cle: c, libelle: c })),
      pieges: { [piege]: 'rayon-diametre' },
    });
  }

  // Dedans, dessus, dehors.
  {
    const r = entre(3, 9);
    let question;
    let d;
    const pieges = {};
    if (au([true, false])) {
      // Le diamètre est donné, et M est entre le rayon et le diamètre : dehors.
      d = entre(r + 1, 2 * r - 1);
      question = `Cercle de centre O et de diamètre ${2 * r} cm. OM = ${d} cm. Où est M ?`;
      pieges.interieur = 'rayon-diametre';
      pieges.sur = 'position-cercle';
    } else {
      d = r + au([-2, -1, 0, 1, 2]);
      question = `Cercle de centre O et de rayon ${r} cm. OM = ${d} cm. Où est M ?`;
    }
    const bonne = position(d, r);
    POSITIONS.forEach(({ cle }) => {
      if (cle !== bonne && !pieges[cle]) pieges[cle] = 'position-cercle';
    });
    liste.push({
      consigne: 'cercle-position',
      question,
      bonne,
      choix: POSITIONS.map((c) => ({ ...c })),
      pieges,
    });
  }

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'quel-triangle': 'Quel est le nom le plus précis de ce triangle ?',
  'quel-quadrilatere': 'Quel est le nom le plus précis de ce quadrilatère ?',
  'propriete-toujours': 'Quelle propriété est vraie pour toutes les figures de cette famille ?',
  'cercle-mesure': 'Rayon ou diamètre : trouve la bonne longueur.',
  'cercle-position': 'Où se trouve le point M par rapport au cercle ?',

  'piege-isocele': 'Isocèle demande deux côtés de même longueur, ou deux angles égaux : cherche-les dans l’énoncé.',
  'piege-equilateral': 'Équilatéral demande trois côtés de même longueur, ou trois angles égaux.',
  'piege-rectangle': 'Rectangle demande un angle droit, de quatre-vingt-dix degrés : cherche-le dans l’énoncé.',
  'piege-rectangle-isocele': 'Rectangle isocèle demande les deux à la fois : un angle droit, et deux côtés de même longueur.',
  'piege-quelconque': 'Avant de dire quelconque, cherche deux côtés égaux, deux angles égaux ou un angle droit.',
  'piege-carre': 'Un carré a à la fois quatre angles droits et quatre côtés de même longueur : vérifie les deux.',
  'piege-rectangle-quadri': 'Un rectangle a quatre angles droits, et ses diagonales ont la même longueur.',
  'piege-losange': 'Un losange a quatre côtés de même longueur, et ses diagonales sont perpendiculaires.',
  'pas-toujours': 'Cette propriété est vraie pour certaines de ces figures seulement : il en faut une qui soit vraie pour toutes.',
  'carre-tout': 'Un carré est à la fois un rectangle et un losange : ses côtés sont égaux, et ses diagonales sont perpendiculaires et de même longueur.',
  'rayon-diametre': 'Le rayon va du centre au cercle ; le diamètre traverse le cercle en passant par le centre : il vaut deux rayons.',
  'position-cercle': 'Compare la distance au centre avec le rayon : plus petite, le point est à l’intérieur ; égale, sur le cercle ; plus grande, à l’extérieur.',

  'quel-triangle-regle': 'Cherche d’abord un angle droit, puis des côtés ou des angles égaux, et choisis le nom qui dit tout.',
  'quel-quadrilatere-regle': 'Regarde les côtés, les angles et les diagonales, et choisis le nom qui dit tout.',
  'propriete-toujours-regle': 'Une propriété de la famille doit être vraie pour chacune de ses figures, sans exception.',
  'cercle-mesure-regle': 'Le diamètre vaut deux rayons ; le rayon, la moitié du diamètre.',
  'cercle-position-regle': 'Compare la distance au centre avec le rayon du cercle.',
};
