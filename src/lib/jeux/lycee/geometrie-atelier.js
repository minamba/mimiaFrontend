/**
 * LA GÉOMÉTRIE DE L'ATELIER — Nora, voie professionnelle (2de, 1re et terminale pro).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (colonne NIVEAU de competences-lycee.txt) :
 *   2de pro : MATH_2PRO_GEO_GRANDEURS, MATH_2PRO_GEO_THEOREMES
 *   1re pro : MATH_1PRO_GEO_ESPACE
 *   Tle pro : MATH_TPRO_TRIGO_TRIANGLE
 *
 * Des mesures d'atelier et de chantier. Chaque arrondi est dit dans la
 * question (au centième, à l'unité, au dixième de degré), et tous les choix
 * d'une manche sont écrits avec la même précision.
 *
 * EN 2de PRO (4 sortes) :
 *   - L'AIRE d'une pièce rectangulaire, d'un plateau rond : LES PIÈGES, le
 *     périmètre, la somme des côtés, le diamètre pris pour le rayon ;
 *   - LE VOLUME d'une dalle (épaisseur en cm), d'une cuve en litres : LES
 *     PIÈGES, mélanger les unités, oublier une dimension, un mètre cube pris
 *     pour cent litres, le diamètre pris pour le rayon ;
 *   - PYTHAGORE (échelle, écharpe de portail) : LES PIÈGES, ajouter les carrés
 *     quand on cherche un côté de l'angle droit, ajouter les longueurs ;
 *   - LA TRIGONOMÉTRIE du triangle rectangle (rampe, toit) : LES PIÈGES,
 *     cosinus au lieu de sinus, tangente avec l'hypoténuse, l'angle complémentaire.
 *
 * EN 1re PRO (4 sortes) — grandeurs dans un solide :
 *   - LE CÔNE (tas de sable) : LES PIÈGES, oublier le tiers, oublier le carré ;
 *   - LA BOULE (cuve sphérique) : LES PIÈGES, l'aire de la sphère, r² au lieu de r³ ;
 *   - LA GRANDE DIAGONALE d'une caisse : LES PIÈGES, la diagonale du fond,
 *     ajouter les longueurs ;
 *   - LA TÔLE d'une cuve (aire latérale) : LES PIÈGES, le volume, oublier le deux.
 *
 * EN TERMINALE PRO (3 sortes) — résoudre un triangle quelconque :
 *   - AL-KASHI, UN CÔTÉ : LES PIÈGES, Pythagore hors d'un triangle rectangle,
 *     le signe devant 2bc cos Â ;
 *   - AL-KASHI, UN ANGLE : LES PIÈGES, le signe (l'angle supplémentaire),
 *     l'angle qui n'est pas en face du côté isolé ;
 *   - LA LOI DES SINUS : LES PIÈGES, sinus inversés, proportionnalité aux
 *     angles au lieu de leurs sinus, oublier de calculer le troisième angle.
 *
 * LE VISUEL (09/10/2026) : chaque manche porte un `visuel` (voir
 * `lib/jeux/visuels.js`) — pièce, solide, triangle rectangle ou triangle
 * quelconque ABC —, avec les cotes de l'énoncé et « ? » pour la longueur ou
 * l'angle cherché ; un diamètre est coté de bord à bord, une diagonale tracée.
 * Aucun tirage en plus : la même graine redonne la même partie.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'geometrie-atelier', titre: 'La géométrie de l’atelier', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE_PRO: {
    titre: 'La géométrie de l’atelier',
    accroche: 'Aires, volumes, Pythagore et trigo.',
    competences: ['MATH_2PRO_GEO_GRANDEURS', 'MATH_2PRO_GEO_THEOREMES'],
  },
  PREMIERE_PRO: {
    titre: 'La géométrie de l’atelier',
    accroche: 'Cônes, boules, caisses et cuves.',
    competences: ['MATH_1PRO_GEO_ESPACE'],
  },
  TERMINALE_PRO: {
    titre: 'La géométrie de l’atelier',
    accroche: 'Al-Kashi et la loi des sinus.',
    competences: ['MATH_TPRO_TRIGO_TRIANGLE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* --------------------------------------------------------------- outils */

const grouper = (entier) => (entier.length > 4 ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : entier);

/** Un nombre exact à la française : virgule, sans zéro inutile. */
export function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  const [entier, decimales] = String(r).split('.');
  return decimales ? `${grouper(entier)},${decimales}` : grouper(entier);
}

/** Un arrondi à d décimales, écrit avec exactement d décimales. */
export function fixe(x, d) {
  const r = Math.round(x * 10 ** d) / 10 ** d;
  const [entier, decimales] = r.toFixed(d).split('.');
  return decimales ? `${grouper(entier)},${decimales}` : grouper(entier);
}

const RAD = Math.PI / 180;
const sin = (deg) => Math.sin(deg * RAD);
const cos = (deg) => Math.cos(deg * RAD);
const tan = (deg) => Math.tan(deg * RAD);
const deg = (rad) => rad / RAD;

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/**
 * Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent.
 * Le `visuel`, s'il y en a un, passe tel quel : il ne tire rien au hasard.
 */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin, visuel,
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
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table, ...(visuel ? { visuel } : {}),
  };
}

/** Le dessin d'une figure plane ou d'un solide, ses cotes écrites comme dans la question. */
const figure = (forme, cotes, plus = {}) => ({
  type: 'figure', forme, cotes, ...plus,
});
const solide = (forme, cotes) => ({ type: 'solide', forme, cotes });

/**
 * Une manche dont la réponse est un arrondi : chaque choix est arrondi à la
 * même précision, et les voisins s'écartent d'un nombre entier de pas.
 */
function mancheArrondie(t, {
  consigne, question, exact, d, pieges, pas, visuel,
}) {
  const unite = 10 ** -d;
  return manche(t.melanger, {
    consigne,
    question,
    bonne: fixe(exact, d),
    pieges: t.melanger(pieges.map(([v, phrase]) => [fixe(v, d), phrase])),
    voisin: (k) => fixe(exact + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.max(pas, unite), d),
    visuel,
  });
}

/** Un décimal à un chiffre après la virgule, tiré entre a et b (en dixièmes). */
const dixiemes = (t, a, b) => t.entre(a, b) / 10;

/* ------------------------------------------------------------- 2de pro */

function aire2(t) {
  if (t.entre(0, 1)) {
    const L = t.entre(25, 90);
    const l = t.entre(15, L - 5);
    return manche(t.melanger, {
      consigne: 'aire',
      question: `Un atelier rectangulaire mesure ${nb(L / 10)} m sur ${nb(l / 10)} m.\nSurface à carreler (m²) ?`,
      bonne: nb((L * l) / 100),
      pieges: t.melanger([[nb((2 * (L + l)) / 10), 'aire-perimetre'], [nb((L + l) / 10), 'aire-produit']]),
      voisin: (k) => nb((L * l + 10 * k) / 100),
      visuel: figure('rectangle', { longueur: `${nb(L / 10)} m`, largeur: `${nb(l / 10)} m` }),
    });
  }
  const D = dixiemes(t, 6, 24);
  return mancheArrondie(t, {
    consigne: 'aire',
    question: `Un plateau de table rond a un diamètre de ${nb(D)} m.\nAire du plateau (m², au centième) ?`,
    exact: Math.PI * (D / 2) ** 2,
    d: 2,
    pas: 0.1,
    pieges: [[Math.PI * D * D, 'rayon-diametre'], [Math.PI * D, 'aire-perimetre']],
    visuel: figure('disque', { diametre: `${nb(D)} m` }),
  });
}

function volume2(t) {
  if (t.entre(0, 1)) {
    const L = t.entre(3, 8);
    const l = t.entre(2, L);
    const e = t.au([8, 10, 12, 15, 20]);
    return manche(t.melanger, {
      consigne: 'volume',
      question: `Une dalle de béton mesure ${L} m sur ${l} m, et ${e} cm d’épaisseur.\nVolume de béton (m³) ?`,
      bonne: nb((L * l * e) / 100),
      pieges: t.melanger([[nb(L * l * e), 'memes-unites'], [nb(L * l), 'volume-trois-dimensions']]),
      voisin: (k) => nb((L * l * e + 10 * k) / 100),
      // L'épaisseur est la hauteur du pavé, laissée en centimètres comme dans l'énoncé.
      visuel: solide('pave', { longueur: `${L} m`, largeur: `${l} m`, hauteur: `${e} cm` }),
    });
  }
  const D = dixiemes(t, 6, 20);
  const H = dixiemes(t, 8, 25);
  const exact = Math.PI * (D / 2) ** 2 * H * 1000;
  return mancheArrondie(t, {
    consigne: 'volume',
    question: `Une cuve cylindrique a un diamètre de ${nb(D)} m et une hauteur de ${nb(H)} m.\nContenance (litres, à l’unité) ?`,
    exact,
    d: 0,
    pas: 50,
    pieges: [[Math.PI * D * D * H * 1000, 'rayon-diametre'], [exact / 10, 'conversion-litres']],
    visuel: solide('cylindre', { diametre: `${nb(D)} m`, hauteur: `${nb(H)} m` }),
  });
}

function pythagore2(t) {
  if (t.entre(0, 1)) {
    const L = dixiemes(t, 30, 60);
    const d = dixiemes(t, 8, 18);
    return mancheArrondie(t, {
      consigne: 'pythagore',
      question: `Une échelle de ${nb(L)} m est posée contre un mur, son pied à ${nb(d)} m du mur.\nHauteur atteinte sur le mur (m, au centième) ?`,
      exact: Math.sqrt(L * L - d * d),
      d: 2,
      pas: 0.1,
      pieges: [[Math.sqrt(L * L + d * d), 'hypotenuse-plus-long'], [L - d, 'pythagore-carres']],
      visuel: figure('echelle', { hypotenuse: `${nb(L)} m`, horizontal: `${nb(d)} m`, vertical: '?' }),
    });
  }
  const a = dixiemes(t, 25, 50);
  const b = dixiemes(t, 10, 20);
  return mancheArrondie(t, {
    consigne: 'pythagore',
    question: `Un portail rectangulaire de ${nb(a)} m sur ${nb(b)} m est renforcé par une écharpe en diagonale.\nLongueur de l’écharpe (m, au centième) ?`,
    exact: Math.sqrt(a * a + b * b),
    d: 2,
    pas: 0.1,
    pieges: [[a + b, 'pythagore-carres'], [Math.sqrt(a * a - b * b), 'hypotenuse-plus-long']],
    // Le portail et son écharpe : la diagonale du rectangle.
    visuel: figure('rectangle', { longueur: `${nb(a)} m`, largeur: `${nb(b)} m`, diagonale: '?' }),
  });
}

const PENTES = [
  (L, a) => `Une rampe de chargement de ${nb(L)} m fait un angle de ${a}° avec le sol.`,
  (L, a) => `Un tapis convoyeur de ${nb(L)} m fait un angle de ${a}° avec le sol.`,
  (L, a) => `Un chevron de toit de ${nb(L)} m fait un angle de ${a}° avec l’horizontale.`,
];

function trigo2(t) {
  if (t.entre(0, 1)) {
    const L = dixiemes(t, 20, 80);
    let a;
    do a = t.entre(10, 70); while (a >= 38 && a <= 52);
    return mancheArrondie(t, {
      consigne: 'trigo',
      question: `${t.au(PENTES)(L, a)}\nHauteur atteinte (m, au centième) ?`,
      exact: L * sin(a),
      d: 2,
      pas: 0.1,
      pieges: [[L * cos(a), 'cosinus-adjacent'], [L * tan(a), 'tangente-hypotenuse']],
      visuel: figure('triangle-rectangle', { hypotenuse: `${nb(L)} m`, vertical: '?' }, { angle: { sommet: 'bas', valeur: `${a}°` } }),
    });
  }
  // Une pente d'au moins un cinquième : sinon l'arc sinus et l'arc tangente
  // donnent le même arrondi, et le piège disparaîtrait.
  const h10 = t.entre(5, 30);
  const h = h10 / 10;
  const d = dixiemes(t, h10 + 10, Math.max(h10 + 10, Math.min(80, 5 * h10)));
  return mancheArrondie(t, {
    consigne: 'trigo',
    question: `Un toit monte de ${nb(h)} m sur une largeur horizontale de ${nb(d)} m.\nAngle du toit avec l’horizontale (degré, au dixième) ?`,
    exact: deg(Math.atan(h / d)),
    d: 1,
    pas: 1,
    pieges: [[deg(Math.atan(d / h)), 'angle-complementaire'], [deg(Math.asin(h / d)), 'tangente-deux-cotes']],
    visuel: figure('triangle-rectangle', { vertical: `${nb(h)} m`, horizontal: `${nb(d)} m` }, { angle: { sommet: 'bas', valeur: '?' } }),
  });
}

/* ------------------------------------------------------------- 1re pro */

function cone1(t) {
  const r = dixiemes(t, 8, 25);
  const h = dixiemes(t, 6, 20);
  const contexte = t.au([
    `Un tas de sable conique a un rayon de ${nb(r)} m et une hauteur de ${nb(h)} m.`,
    `Une trémie conique a un rayon de ${nb(r)} m et une profondeur de ${nb(h)} m.`,
  ]);
  return mancheArrondie(t, {
    consigne: 'cone',
    question: `${contexte}\nVolume (m³, au centième) ?`,
    exact: (Math.PI * r * r * h) / 3,
    d: 2,
    pas: 0.1,
    pieges: [[Math.PI * r * r * h, 'cone-tiers'], [(Math.PI * r * h) / 3, 'rayon-au-carre']],
    visuel: solide('cone', { rayon: `${nb(r)} m`, hauteur: `${nb(h)} m` }),
  });
}

function boule1(t) {
  let r;
  do r = dixiemes(t, 4, 15); while (r === 1);
  return mancheArrondie(t, {
    consigne: 'boule',
    question: `Une cuve sphérique de gaz a un rayon intérieur de ${nb(r)} m.\nVolume (m³, au centième) ?`,
    exact: (4 / 3) * Math.PI * r ** 3,
    d: 2,
    pas: 0.1,
    pieges: [[4 * Math.PI * r * r, 'aire-ou-volume'], [(4 / 3) * Math.PI * r * r, 'rayon-au-cube']],
    visuel: solide('boule', { rayon: `${nb(r)} m` }),
  });
}

function diagonale1(t) {
  const a = dixiemes(t, 8, 20);
  const b = dixiemes(t, 5, 15);
  const c = dixiemes(t, 4, 12);
  return mancheArrondie(t, {
    consigne: 'diagonale',
    question: `Une caisse en forme de pavé mesure ${nb(a)} m × ${nb(b)} m × ${nb(c)} m.\nLongueur de la plus longue barre qui y entre, en diagonale (m, au centième) ?`,
    exact: Math.sqrt(a * a + b * b + c * c),
    d: 2,
    pas: 0.1,
    pieges: [[Math.sqrt(a * a + b * b), 'diagonale-espace'], [a + b + c, 'pythagore-carres']],
    // La caisse, ses trois dimensions et sa grande diagonale, la barre cherchée.
    visuel: solide('pave', {
      longueur: `${nb(a)} m`, largeur: `${nb(b)} m`, hauteur: `${nb(c)} m`, diagonale: '?',
    }),
  });
}

function tole1(t) {
  const r = dixiemes(t, 3, 12);
  const h = dixiemes(t, 8, 25);
  return mancheArrondie(t, {
    consigne: 'tole',
    question: `On roule une tôle pour former une cuve cylindrique sans fond ni couvercle, de rayon ${nb(r)} m et de hauteur ${nb(h)} m.\nAire de la tôle (m², au centième) ?`,
    exact: 2 * Math.PI * r * h,
    d: 2,
    pas: 0.1,
    pieges: [[Math.PI * r * r * h, 'aire-ou-volume'], [Math.PI * r * h, 'perimetre-du-cercle']],
    visuel: solide('cylindre', { rayon: `${nb(r)} m`, hauteur: `${nb(h)} m` }),
  });
}

/* ------------------------------------------------------------- Tle pro */

const TRIANGLES = [
  'Un terrain triangulaire ABC.',
  'Une ferme de charpente triangulaire ABC.',
  'Un géomètre relève le triangle ABC.',
  'Une tôle découpée en triangle ABC.',
];

function kashiCote(t) {
  const b = t.entre(3, 15);
  const c = t.entre(3, 15);
  let a;
  do a = t.entre(25, 150); while (a >= 80 && a <= 100);
  const ps = b * b + c * c;
  return mancheArrondie(t, {
    consigne: 'al-kashi-cote',
    question: `${t.au(TRIANGLES)}\nAB = ${c} m, AC = ${b} m, Â = ${a}°.\nLongueur BC (m, au centième) ?`,
    exact: Math.sqrt(ps - 2 * b * c * cos(a)),
    d: 2,
    pas: 0.1,
    pieges: [[Math.sqrt(ps), 'pythagore-hors-rectangle'], [Math.sqrt(ps + 2 * b * c * cos(a)), 'signe-al-kashi']],
    visuel: figure('triangle-quelconque', { AB: `${c} m`, AC: `${b} m`, BC: '?' }, { angle: { A: `${a}°` } }),
  });
}

function kashiAngle(t) {
  let a;
  let b;
  let c;
  let A;
  do {
    a = t.entre(4, 15);
    b = t.entre(4, 15);
    c = t.entre(4, 15);
    A = deg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
  } while (a >= b + c - 1 || b >= a + c - 1 || c >= a + b - 1 || a === b || Math.abs(A - 90) < 5);
  const B = deg(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
  return mancheArrondie(t, {
    consigne: 'al-kashi-angle',
    question: `${t.au(TRIANGLES)}\nBC = ${a} m, AC = ${b} m, AB = ${c} m.\nAngle Â (degré, au dixième) ?`,
    exact: A,
    d: 1,
    pas: 1,
    pieges: [[180 - A, 'signe-al-kashi'], [B, 'angle-oppose']],
    visuel: figure('triangle-quelconque', { BC: `${a} m`, AC: `${b} m`, AB: `${c} m` }, { angle: { A: '?' } }),
  });
}

function sinus(t) {
  let A;
  let B;
  let C;
  do {
    A = t.entre(25, 110);
    B = t.entre(25, 110);
    C = 180 - A - B;
  } while (C < 20 || A === B || A === C || B === C);
  const a = t.entre(4, 20);
  const cherche = t.entre(0, 1) ? 'AC' : 'AB';
  const debut = `${t.au(TRIANGLES)}\nBC = ${a} m, Â = ${A}°, B̂ = ${B}°.\nLongueur ${cherche} (m, au centième) ?`;
  const visuel = figure('triangle-quelconque', { BC: `${a} m`, [cherche]: '?' }, { angle: { A: `${A}°`, B: `${B}°` } });
  if (cherche === 'AC') {
    return mancheArrondie(t, {
      consigne: 'loi-des-sinus',
      question: debut,
      exact: (a * sin(B)) / sin(A),
      d: 2,
      pas: 0.1,
      pieges: [[(a * sin(A)) / sin(B), 'sinus-face-a-face'], [(a * B) / A, 'sinus-des-angles']],
      visuel,
    });
  }
  return mancheArrondie(t, {
    consigne: 'loi-des-sinus',
    question: debut,
    exact: (a * sin(C)) / sin(A),
    d: 2,
    pas: 0.1,
    pieges: [[(a * sin(B)) / sin(A), 'troisieme-angle'], [(a * sin(A)) / sin(C), 'sinus-face-a-face']],
    visuel,
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  let liste;
  if (niveau === 'TERMINALE_PRO') {
    liste = [
      kashiCote(t), kashiCote(t), kashiCote(t),
      kashiAngle(t), kashiAngle(t),
      sinus(t), sinus(t), sinus(t),
    ];
  } else if (niveau === 'PREMIERE_PRO') {
    liste = [
      cone1(t), cone1(t),
      boule1(t), boule1(t),
      diagonale1(t), diagonale1(t),
      tole1(t), tole1(t),
    ];
  } else {
    liste = [
      aire2(t), aire2(t),
      volume2(t), volume2(t),
      pythagore2(t), pythagore2(t),
      trigo2(t), trigo2(t),
    ];
  }
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  aire: 'Calcule cette aire, avec la précision demandée.',
  volume: 'Calcule ce volume, dans l’unité demandée.',
  pythagore: 'Utilise le théorème de Pythagore.',
  trigo: 'Utilise la trigonométrie du triangle rectangle.',
  cone: 'Calcule le volume de ce cône.',
  boule: 'Calcule le volume de cette boule.',
  diagonale: 'Calcule cette longueur dans l’espace.',
  tole: 'Calcule l’aire de tôle nécessaire.',
  'al-kashi-cote': 'Calcule ce côté avec la formule d’Al-Kashi.',
  'al-kashi-angle': 'Calcule cet angle avec la formule d’Al-Kashi.',
  'loi-des-sinus': 'Calcule cette longueur avec la loi des sinus.',

  'aire-perimetre': 'Le périmètre mesure le tour ; l’aire mesure la surface. Ici, on veut la surface.',
  'aire-produit': 'L’aire d’un rectangle, c’est la longueur multipliée par la largeur, pas leur somme.',
  'rayon-diametre': 'Les formules du disque et du cylindre utilisent le rayon : divise d’abord le diamètre par deux.',
  'memes-unites': 'Avant de multiplier, mets toutes les longueurs dans la même unité : les centimètres en mètres.',
  'volume-trois-dimensions': 'Un volume multiplie trois longueurs : n’oublie pas l’épaisseur.',
  'conversion-litres': 'Un mètre cube vaut mille litres, pas cent.',
  'hypotenuse-plus-long': 'L’hypoténuse est le plus long côté : pour trouver un autre côté, on soustrait les carrés au lieu de les additionner.',
  'pythagore-carres': 'Pythagore porte sur les carrés des longueurs : on ne peut pas ajouter ou soustraire les longueurs elles-mêmes.',
  'cosinus-adjacent': 'Le côté opposé à l’angle se calcule avec le sinus : sinus égale opposé sur hypoténuse. Le cosinus donne le côté adjacent.',
  'tangente-hypotenuse': 'La tangente relie les deux côtés de l’angle droit. Ici, on connaît l’hypoténuse : c’est le sinus qu’il faut.',
  'angle-complementaire': 'Tangente égale opposé sur adjacent : pour l’angle avec l’horizontale, le côté opposé est la hauteur.',
  'tangente-deux-cotes': 'Tu connais les deux côtés de l’angle droit, pas l’hypoténuse : c’est la tangente qu’il faut, pas le sinus.',
  'cone-tiers': 'Le volume d’un cône, c’est le tiers de celui du cylindre de même base : n’oublie pas de diviser par trois.',
  'rayon-au-carre': 'L’aire de la base est pi fois le rayon au carré : n’oublie pas le carré.',
  'aire-ou-volume': 'Tu as calculé une autre grandeur : relis bien si l’on demande une aire, en mètres carrés, ou un volume, en mètres cubes.',
  'rayon-au-cube': 'Le volume d’une boule utilise le rayon au cube : quatre tiers fois pi fois le rayon au cube.',
  'diagonale-espace': 'C’est seulement la diagonale du fond : applique Pythagore une deuxième fois avec la hauteur.',
  'perimetre-du-cercle': 'La longueur de la tôle est le périmètre du cercle, deux fois pi fois le rayon : n’oublie pas le deux.',
  'pythagore-hors-rectangle': 'Pythagore ne vaut que dans un triangle rectangle : ici, il faut le terme correctif d’Al-Kashi.',
  'signe-al-kashi': 'Dans Al-Kashi, on retranche deux fois le produit des côtés par le cosinus de l’angle : attention au signe moins.',
  'angle-oppose': 'Dans Al-Kashi, l’angle cherché est celui qui fait face au côté isolé : pour l’angle en A, isole le côté B C.',
  'sinus-face-a-face': 'Chaque côté est associé au sinus de l’angle qui lui fait face : vérifie quel angle est en face de chaque côté.',
  'sinus-des-angles': 'Les côtés sont proportionnels aux sinus des angles, pas aux angles eux-mêmes.',
  'troisieme-angle': 'Le côté A B fait face à l’angle en C : calcule d’abord cet angle, cent quatre-vingts degrés moins les deux autres.',

  'aire-regle': 'Rectangle : longueur fois largeur. Disque : pi fois le rayon au carré.',
  'volume-regle': 'Mets tout dans la même unité, multiplie, puis convertis si besoin : un mètre cube vaut mille litres.',
  'pythagore-regle': 'Repère l’hypoténuse : son carré est la somme des carrés des deux autres côtés.',
  'trigo-regle': 'Repère l’hypoténuse, le côté opposé et le côté adjacent à l’angle, puis choisis sinus, cosinus ou tangente.',
  'cone-regle': 'Volume du cône : un tiers fois pi fois le rayon au carré fois la hauteur.',
  'boule-regle': 'Volume de la boule : quatre tiers fois pi fois le rayon au cube.',
  'diagonale-regle': 'Calcule la diagonale du fond, puis applique Pythagore avec la hauteur.',
  'tole-regle': 'Aire latérale du cylindre : deux fois pi fois le rayon fois la hauteur.',
  'al-kashi-cote-regle': 'Le carré du côté cherché vaut la somme des carrés des deux autres, moins deux fois leur produit par le cosinus de l’angle compris.',
  'al-kashi-angle-regle': 'Isole le cosinus de l’angle dans la formule d’Al-Kashi, puis prends l’arc cosinus.',
  'loi-des-sinus-regle': 'Dans un triangle, chaque côté divisé par le sinus de l’angle opposé donne le même nombre.',
};
