/**
 * SOLIDES ET PATRONS — les solides de l'espace, en 6e et en 4e.
 *
 * Aucun dessin : les solides et les patrons sont DÉCRITS en texte.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_GEO_SOLIDES — « Reconnaître les solides usuels et leurs patrons »
 *   4e : MATH_4E_GEO_SOLIDES — « Représenter pyramides et cônes, et leurs sections »
 *        MATH_4E_MES_VOLUME  — « Calculer le volume d'une pyramide et d'un cône »
 *
 * EN 6e (3 + 3 + 2) :
 *   - FACES, ARÊTES, SOMMETS : LES PIÈGES, confondre les trois mots ;
 *   - LE PATRON DÉCRIT : quel solide ? LES PIÈGES, prisme ou pyramide,
 *     cylindre ou cône, cube ou pavé ;
 *   - LE SOLIDE DÉCRIT par ses propriétés.
 *
 *   UN CUBE EST AUSSI UN PAVÉ DROIT, et un pavé droit est aussi un prisme : on
 *   ne met jamais côte à côte deux noms qui seraient tous deux justes.
 *
 * EN 4e (3 + 3 + 2) :
 *   - LE VOLUME D'UNE PYRAMIDE OU D'UN CÔNE : LES PIÈGES, oublier le tiers,
 *     diviser par deux, prendre le diamètre pour le rayon ;
 *   - LA SECTION par un plan : parallèle à la base, c'est une réduction de la
 *     base ; par le sommet et l'axe d'un cône, un triangle ;
 *   - FACES, ARÊTES, SOMMETS D'UNE PYRAMIDE : LES PIÈGES, oublier la base,
 *     oublier le sommet, ne compter que les arêtes de la base.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'solides-et-patrons', titre: 'Solides et patrons', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Solides et patrons',
    accroche: 'Faces, arêtes, sommets et patrons.',
    competences: ['MATH_6E_GEO_SOLIDES'],
  },
  QUATRIEME: {
    titre: 'Solides et patrons',
    accroche: 'Pyramides, cônes et leurs sections.',
    competences: ['MATH_4E_GEO_SOLIDES', 'MATH_4E_MES_VOLUME'],
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

/** Une manche dont les choix sont écrits à la main : la bonne, et chaque faux avec sa phrase. */
function aLaMain(melanger, consigne, question, bonne, faux) {
  return {
    consigne,
    question,
    choix: cartes(melanger([bonne, ...faux.map(([c]) => c)])),
    bonne,
    pieges: Object.fromEntries(faux.filter(([, p]) => p)),
  };
}

/* ---------------------------------------------------------------- 6e */

/** Faces, arêtes, sommets — vérifiés par la relation d'Euler F + S − A = 2 dans le test. */
export const SOLIDES = [
  { nom: 'Un cube', faces: 6, aretes: 12, sommets: 8 },
  { nom: 'Un pavé droit', faces: 6, aretes: 12, sommets: 8 },
  { nom: 'Un prisme droit à base triangulaire', faces: 5, aretes: 9, sommets: 6 },
  { nom: 'Un prisme droit à base hexagonale', faces: 8, aretes: 18, sommets: 12 },
  { nom: 'Une pyramide à base carrée', faces: 5, aretes: 8, sommets: 5 },
  { nom: 'Une pyramide à base triangulaire', faces: 4, aretes: 6, sommets: 4 },
  { nom: 'Une pyramide à base hexagonale', faces: 7, aretes: 12, sommets: 7 },
];

const CONFUSIONS = {
  faces: { aretes: 'arete-ou-face', sommets: 'face-ou-sommet' },
  aretes: { sommets: 'arete-ou-sommet', faces: 'arete-ou-face' },
  sommets: { aretes: 'arete-ou-sommet', faces: 'face-ou-sommet' },
};
const MOTS = { faces: 'de faces', aretes: 'd’arêtes', sommets: 'de sommets' };

function compter6(element, { au, melanger }) {
  const solide = au(SOLIDES);
  const pieges = Object.entries(CONFUSIONS[element]).map(([autre, phrase]) => [solide[autre], phrase]);
  return manche(melanger, {
    consigne: 'compter',
    question: `${solide.nom} : combien ${MOTS[element]} ?`,
    bonne: solide[element],
    pieges,
    voisin: (k) => solide[element] + k,
  });
}

/** Les patrons décrits : [description, solide, [[faux, phrase]…]]. Une phrase nulle → la règle. */
export const PATRONS = [
  ['de 6 carrés identiques', 'Cube', [['Pyramide', null], ['Cylindre', null]]],
  ['de 6 rectangles, égaux deux à deux, qui ne sont pas tous des carrés', 'Pavé droit', [['Cube', 'cube-ou-pave'], ['Pyramide', null]]],
  ['de 2 triangles identiques et de 3 rectangles', 'Prisme droit', [['Pyramide', 'prisme-ou-pyramide'], ['Cône', null]]],
  ['d’un carré et de 4 triangles identiques', 'Pyramide', [['Prisme droit', 'prisme-ou-pyramide'], ['Cube', null]]],
  ['de 4 triangles', 'Pyramide', [['Prisme droit', 'prisme-ou-pyramide'], ['Cône', null]]],
  ['de 2 disques identiques et d’un rectangle', 'Cylindre', [['Cône', 'cylindre-ou-cone'], ['Prisme droit', null]]],
  ['d’un disque et d’une portion de disque', 'Cône', [['Cylindre', 'cylindre-ou-cone'], ['Pyramide', 'pyramide-ou-cone']]],
];

/** Les solides décrits par leurs propriétés. */
export const PORTRAITS = [
  ['J’ai 2 bases triangulaires face à face et 3 faces rectangulaires.', 'Prisme droit', [['Pyramide', 'prisme-ou-pyramide'], ['Cube', null]]],
  ['J’ai une base carrée et 4 faces triangulaires qui se rejoignent en un même point.', 'Pyramide', [['Prisme droit', 'prisme-ou-pyramide'], ['Cône', 'pyramide-ou-cone']]],
  ['J’ai 2 bases en forme de disque et une surface courbe.', 'Cylindre', [['Cône', 'cylindre-ou-cone'], ['Boule', null]]],
  ['J’ai une seule base, un disque, et un sommet.', 'Cône', [['Cylindre', 'cylindre-ou-cone'], ['Pyramide', 'pyramide-ou-cone']]],
  ['Je n’ai ni face plane, ni arête, ni sommet.', 'Boule', [['Cylindre', null], ['Cône', null]]],
  ['J’ai 6 faces rectangulaires, et elles ne sont pas toutes carrées.', 'Pavé droit', [['Cube', 'cube-ou-pave'], ['Pyramide', null]]],
];

/* ---------------------------------------------------------------- 4e */

function volume4(sorte, { entre, melanger }) {
  if (sorte === 'cone') {
    let r;
    let h;
    do {
      r = entre(2, 6);
      h = entre(3, 12);
    } while ((r * r * h) % 3 !== 0);
    const v = (r * r * h) / 3;
    return manche(melanger, {
      consigne: 'volume',
      question: `Cône de diamètre ${2 * r} cm et de hauteur ${h} cm. Volume en cm³, en fonction de π ?`,
      bonne: `${v}π`,
      pieges: [[`${r * r * h}π`, 'oublier-le-tiers'], [`${4 * v}π`, 'rayon-ou-diametre']],
      voisin: (k) => `${v + k}π`,
    });
  }
  let lo;
  let l;
  let h;
  do {
    lo = entre(2, 9);
    l = sorte === 'carree' ? lo : entre(2, 9);
    h = entre(3, 12);
  } while ((lo * l * h) % 6 !== 0 || (sorte !== 'carree' && l === lo));
  const base = sorte === 'carree' ? `carrée de côté ${lo} cm` : `rectangulaire de ${lo} cm sur ${l} cm`;
  return manche(melanger, {
    consigne: 'volume',
    question: `Pyramide à base ${base}, de hauteur ${h} cm. Volume en cm³ ?`,
    bonne: (lo * l * h) / 3,
    pieges: [[lo * l * h, 'oublier-le-tiers'], [(lo * l * h) / 2, 'tiers-pas-moitie']],
    voisin: (k) => (lo * l * h) / 3 + k,
  });
}

/** Les sections : [solide et plan, section, [[faux, phrase]…]]. */
export const SECTIONS = [
  ['Une pyramide à base carrée, coupée par un plan parallèle à sa base.', 'Un carré', [['Un triangle', 'section-parallele-base'], ['Un disque', null]]],
  ['Une pyramide à base triangulaire, coupée par un plan parallèle à sa base.', 'Un triangle', [['Un carré', 'section-parallele-base'], ['Un disque', null]]],
  ['Une pyramide à base hexagonale, coupée par un plan parallèle à sa base.', 'Un hexagone', [['Un triangle', 'section-parallele-base'], ['Un carré', 'section-parallele-base']]],
  ['Un cône, coupé par un plan parallèle à sa base.', 'Un disque', [['Un triangle', 'section-parallele-base'], ['Un carré', null]]],
  ['Un cône, coupé par un plan qui passe par son sommet et par son axe.', 'Un triangle', [['Un disque', 'section-par-le-sommet'], ['Un carré', null]]],
];

const BASES = [['triangulaire', 3], ['carrée', 4], ['pentagonale', 5], ['hexagonale', 6], ['octogonale', 8]];

function pyramide4(element, { au, melanger }) {
  const [nom, n] = au(BASES);
  const valeurs = { faces: n + 1, aretes: 2 * n, sommets: n + 1 };
  const pieges = {
    faces: [[n, 'compter-la-base'], [2 * n, 'arete-ou-face']],
    aretes: [[n, 'aretes-pyramide'], [n + 1, 'arete-ou-sommet']],
    sommets: [[n, 'compter-le-sommet'], [2 * n, 'arete-ou-sommet']],
  }[element];
  return manche(melanger, {
    consigne: 'pyramide',
    question: `Une pyramide à base ${nom} : combien ${MOTS[element]} ?`,
    bonne: valeurs[element],
    pieges,
    voisin: (k) => valeurs[element] + k,
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  const { melanger } = t;
  let liste;
  if (niveau === 'QUATRIEME') {
    liste = [
      ...melanger(['carree', 'rectangle', 'cone']).map((s) => volume4(s, t)),
      ...melanger(SECTIONS).slice(0, 3).map(([q, b, f]) => aLaMain(melanger, 'section', q, b, f)),
      ...melanger(['faces', 'aretes', 'sommets']).slice(0, 2).map((e) => pyramide4(e, t)),
    ];
  } else {
    liste = [
      ...melanger(['faces', 'aretes', 'sommets']).map((e) => compter6(e, t)),
      ...melanger(PATRONS).slice(0, 3).map(([d, b, f]) => aLaMain(melanger, 'patron', `Un patron formé ${d}. Quel solide ?`, b, f)),
      ...melanger(PORTRAITS).slice(0, 2).map(([d, b, f]) => aLaMain(melanger, 'quel-solide', d, b, f)),
    ];
  }
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  compter: 'Compte bien, sur ce solide.',
  patron: 'Quel solide ce patron permet-il de fabriquer ?',
  'quel-solide': 'Quel solide se cache derrière cette description ?',
  volume: 'Calcule le volume de ce solide.',
  section: 'Quelle est la forme de cette section ?',
  pyramide: 'Compte bien, sur cette pyramide.',

  'arete-ou-sommet': 'Une arête est un segment, le bord entre deux faces ; un sommet est un point, un coin du solide.',
  'arete-ou-face': 'Une face est une surface plane ; une arête est le segment où deux faces se touchent.',
  'face-ou-sommet': 'Une face est une surface plane ; un sommet est un coin, là où se rejoignent des arêtes.',
  'prisme-ou-pyramide': 'Un prisme a deux bases identiques face à face, reliées par des rectangles ; une pyramide a une seule base, et des triangles qui se rejoignent au sommet.',
  'cylindre-ou-cone': 'Un cylindre a deux disques pour bases ; un cône n’en a qu’un, et un sommet.',
  'pyramide-ou-cone': 'Une pyramide a une base polygonale et des faces triangulaires ; un cône a une base en forme de disque et une surface courbe.',
  'cube-ou-pave': 'Un cube n’a que des faces carrées, toutes identiques.',
  'oublier-le-tiers': 'Pour une pyramide ou un cône, le volume est le tiers de : aire de la base fois hauteur.',
  'tiers-pas-moitie': 'On divise par trois, pas par deux : une pyramide remplit le tiers du prisme de même base et de même hauteur.',
  'rayon-ou-diametre': 'Le rayon, c’est la moitié du diamètre : divise d’abord le diamètre par deux.',
  'section-parallele-base': 'Un plan parallèle à la base coupe le solide selon une réduction de sa base : même forme, en plus petit.',
  'section-par-le-sommet': 'Un plan qui passe par le sommet d’un cône et par son axe le coupe selon un triangle.',
  'compter-la-base': 'N’oublie pas la base : elle compte aussi comme une face.',
  'compter-le-sommet': 'N’oublie pas le sommet de la pyramide, en plus des sommets de la base.',
  'aretes-pyramide': 'Une pyramide a les arêtes de sa base, et autant d’arêtes qui montent au sommet : compte les deux.',

  'compter-regle': 'Les faces sont les surfaces planes, les arêtes les segments, les sommets les coins.',
  'patron-regle': 'Compte les pièces du patron et regarde leur forme : chaque pièce devient une face du solide.',
  'quel-solide-regle': 'Regarde les bases : deux bases face à face, c’est un prisme ou un cylindre ; une seule base et un sommet, une pyramide ou un cône.',
  'volume-regle': 'Pyramide ou cône : aire de la base fois hauteur, divisé par trois.',
  'section-regle': 'Parallèle à la base, la section a la forme de la base, en plus petit.',
  'pyramide-regle': 'Une pyramide a une face de plus que sa base n’a de côtés, deux fois plus d’arêtes que sa base, et un sommet de plus que sa base.',
};
