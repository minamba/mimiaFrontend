/**
 * LE MIROIR — le cinquième nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_GEO_SYMETRIE    — « Reconnaître un axe de symétrie »
 *   MATH_CE2_GEO_ANGLE_DROIT — « Reconnaître et tracer un angle droit »
 *
 * DEUX TEMPS :
 *   1. L'AXE (5 manches) : une figure, trois lignes A, B, C. Laquelle est un
 *      axe de symétrie — celle le long de laquelle on plierait la figure en
 *      deux moitiés qui se superposent ? Les fausses lignes coupent aussi la
 *      figure en deux, mais en deux moitiés DIFFÉRENTES : c'est la confusion
 *      du CE2, « couper en deux » n'est pas « plier en deux pareilles ».
 *   2. L'ANGLE DROIT (3 manches) : un triangle, ses coins A, B, C. Lequel est
 *      un angle droit ? Une fois trouvé, le petit carré de l'équerre s'y pose.
 *
 * « TRACER » UN ANGLE DROIT DEMANDE UNE ÉQUERRE ET UNE FEUILLE : ce jeu en
 * travaille la reconnaissance, le tracé reste au cahier.
 *
 * LES FIGURES SONT DESSINÉES À LA MAIN, chacune symétrique par rapport à un
 * seul axe — un rectangle, qui en a deux, rendrait deux réponses justes.
 */

export const MANCHES = 8;
export const MANCHES_AXE = 5;

/** Les figures, dans un cadre de 200 sur 160, et leur axe : vertical en x = 100, ou horizontal en y = 80. */
export const FIGURES = [
  { nom: 'maison', axe: 'v', points: [[60, 150], [140, 150], [140, 90], [100, 45], [60, 90]] },
  { nom: 'fleche', axe: 'h', points: [[30, 65], [115, 65], [115, 40], [175, 80], [115, 120], [115, 95], [30, 95]] },
  { nom: 'cerf-volant', axe: 'v', points: [[100, 15], [145, 65], [100, 150], [55, 65]] },
  { nom: 't', axe: 'v', points: [[45, 30], [155, 30], [155, 58], [115, 58], [115, 150], [85, 150], [85, 58], [45, 58]] },
  { nom: 'poisson', axe: 'h', points: [[25, 80], [80, 45], [135, 80], [175, 50], [175, 110], [135, 80], [80, 115]] },
  { nom: 'sapin', axe: 'v', points: [[100, 15], [150, 85], [120, 85], [160, 135], [110, 135], [110, 155], [90, 155], [90, 135], [40, 135], [80, 85], [50, 85]] },
  { nom: 'bateau', axe: 'v', points: [[40, 100], [160, 100], [135, 140], [65, 140]] },
];

/** Les trois lignes d'une figure : l'axe, une parallèle décalée, une diagonale. */
function lignes(figure) {
  if (figure.axe === 'v') {
    return {
      axe: [[100, 5], [100, 158]],
      decalee: [[70, 5], [70, 158]],
      diagonale: [[20, 20], [180, 150]],
    };
  }
  return {
    axe: [[10, 80], [190, 80]],
    decalee: [[10, 55], [190, 55]],
    diagonale: [[30, 20], [170, 145]],
  };
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Un triangle rectangle : le coin droit, et deux côtés de longueurs tirées. */
function triangle(tirer) {
  const l1 = 70 + Math.floor(tirer() * 70);
  const l2 = 50 + Math.floor(tirer() * 60);
  const tourne = Math.floor(tirer() * 4);
  // Le coin droit, puis les deux autres, selon l'orientation tirée.
  const bases = [
    [[40, 140], [40 + l1, 140], [40, 140 - l2]],
    [[160, 140], [160 - l1, 140], [160, 140 - l2]],
    [[40, 20], [40 + l1, 20], [40, 20 + l2]],
    [[160, 20], [160 - l1, 20], [160, 20 + l2]],
  ];
  return bases[tourne];
}

export function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };

  const axes = melanger(FIGURES).slice(0, MANCHES_AXE).map((figure) => {
    const l = lignes(figure);
    const lettres = melanger(['A', 'B', 'C']);
    const traces = [
      { lettre: lettres[0], sorte: 'axe', points: l.axe },
      { lettre: lettres[1], sorte: 'decalee', points: l.decalee },
      { lettre: lettres[2], sorte: 'diagonale', points: l.diagonale },
    ];
    return {
      mode: 'axe', figure: figure.nom, points: figure.points, traces, bonne: lettres[0],
      choix: ['A', 'B', 'C'],
    };
  });

  const angles = Array.from({ length: MANCHES - MANCHES_AXE }, () => {
    const sommets = triangle(tirer);
    const lettres = melanger(['A', 'B', 'C']);
    return {
      mode: 'angle',
      sommets: sommets.map((p, i) => ({ lettre: lettres[i], point: p })),
      bonne: lettres[0],
      choix: ['A', 'B', 'C'],
    };
  });

  return [...axes, ...angles];
}

export function verdict(m, choix) {
  return choix === m.bonne ? 'juste' : m.mode;
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export const PHRASES = {
  consigneAxe: 'Quelle ligne est un axe de symétrie ?',
  consigneAngle: 'Quel coin du triangle est un angle droit ?',
  axe: 'Si on plie le long de cette ligne, les deux moitiés ne se superposent pas.',
  angle: 'Un angle droit, c’est le coin d’une feuille. Vérifie avec ton équerre.',
};
