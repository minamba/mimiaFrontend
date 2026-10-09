/**
 * LE MIROIR DU COLLÈGE — les transformations du plan, de la 6e à la 3e.
 * Professeure : Nora (mathématiques).
 *
 * AUCUN DESSIN : tout passe par des points d'un quadrillage donnés par leurs
 * coordonnées, A(2 ; 3). Chaque image se calcule donc en texte, et le code
 * la calcule (jamais recopiée).
 *
 * PAR CLASSE (trois sortes de manches, 3 + 3 + 2, mélangées) :
 *   6e — la symétrie axiale (axe vertical ou horizontal du quadrillage), les
 *        droites perpendiculaires et parallèles (les trois propriétés), le
 *        vocabulaire et ses notations [AB], (AB), [AB), AB ;
 *   5e — la symétrie centrale, le parallélogramme (côtés, angles, diagonales) ;
 *   4e — la translation (image d'un point, le parallélogramme qu'elle
 *        dessine, ce qu'elle conserve) ;
 *   3e — la rotation d'un quart de tour, l'homothétie (point, mesures,
 *        agrandissement ou réduction, rapport négatif), les vecteurs.
 *
 * LES PIÈGES : la mauvaise coordonnée qui change, la distance à l'axe mal
 * comptée, la symétrie axiale prise pour la centrale, la translation à
 * l'envers, le sens de rotation, le rapport ajouté au lieu de multiplié,
 * l'aire multipliée par le rapport et non par son carré, le signe du rapport.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'miroir-college', titre: 'Le miroir', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le miroir',
    accroche: 'Symétrie axiale, droites et notations.',
    competences: ['MATH_6E_GEO_SYMETRIE', 'MATH_6E_GEO_PERPENDICULAIRE', 'MATH_6E_GEO_PARALLELE', 'MATH_6E_GEO_VOCABULAIRE'],
  },
  CINQUIEME: {
    titre: 'Le miroir à un point',
    accroche: 'Symétrie centrale et parallélogramme.',
    competences: ['MATH_5E_GEO_SYM_CENTRALE', 'MATH_5E_GEO_PARALLELO'],
  },
  QUATRIEME: {
    titre: 'Le glissement',
    accroche: 'Une translation fait glisser la figure.',
    competences: ['MATH_4E_TRANSLATION'],
  },
  TROISIEME: {
    titre: 'Tourner, agrandir',
    accroche: 'Rotation, homothétie et vecteurs.',
    competences: ['MATH_3E_ROTATION', 'MATH_3E_HOMOTHETIE', 'MATH_3E_VECTEURS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −3 » : le signe moins typographique. */
const rel = (n) => (n < 0 ? `−${-n}` : `${n}`);
/** « (2 ; −3) » */
const pt = (x, y) => `(${rel(x)} ; ${rel(y)})`;
/** « 2,5 » */
const virgule = (x) => rel(x).replace('.', ',');

/** Une manche : la bonne réponse, ses pièges nommés, complétés par des voisins. */
function faire(melanger, consigne, question, bonne, paires, voisin, extra = {}) {
  const liste = troisChoix(bonne, paires.map(([k]) => k), voisin);
  const pieges = {};
  paires.forEach(([k, p]) => {
    if (k !== bonne && liste.includes(k) && !(k in pieges)) pieges[k] = p;
  });
  return {
    consigne, question, choix: melanger(liste).map((c) => ({ cle: c, libelle: c })), bonne, pieges, ...extra,
  };
}

const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T'];

/* ------------------------------------------------------------------ 6e */

function symetrieAxiale(o) {
  const { entre, au, melanger } = o;
  const vertical = au([true, false]);
  const k = entre(3, 8);
  const d = entre(1, Math.min(4, k - 1)) * au([-1, 1]);
  let autre = entre(1, 2 * k - 2);
  if (autre >= k) autre += 1; // jamais sur l'axe
  const s = Math.sign(d);
  // Coordonnée qui traverse l'axe : k − d → k + d.
  const fait = (traverse, reste) => (vertical ? pt(traverse, reste) : pt(reste, traverse));
  const bonne = fait(k + d, autre);
  const question = vertical
    ? `L'axe est la droite verticale qui passe par (${k} ; 0).\nSymétrique de A${pt(k - d, autre)} ?`
    : `L'axe est la droite horizontale qui passe par (0 ; ${k}).\nSymétrique de A${pt(autre, k - d)} ?`;
  return faire(melanger, 'symetrie-axiale', question, bonne, [
    [fait(k + d + s, autre), 'symetrie-distance'],
    [fait(k - d, 2 * k - autre), 'symetrie-axe'],
  ], (i) => fait(k + d - i * s, autre));
}

const NOMS_DROITES = ['(d₁)', '(d₂)', '(d₃)'];

function droites(o) {
  const { au, melanger } = o;
  const [p, q, l] = melanger(NOMS_DROITES);
  const cas = au([['⊥', '⊥'], ['//', '//'], ['//', '⊥'], ['⊥', '//']]);
  const memes = cas[0] === cas[1];
  const bonne = memes ? 'parallèles' : 'perpendiculaires';
  const question = `${p} ${cas[0]} ${l} et ${q} ${cas[1]} ${l}.\nEt ${p}, ${q} ?`;
  let piege = 'parallele-perpendiculaire';
  if (cas[0] === '⊥' && cas[1] === '⊥') piege = 'deux-perpendiculaires';
  if (cas[0] === '//' && cas[1] === '//') piege = 'deux-paralleles';
  const pieges = memes ? { perpendiculaires: piege } : { 'parallèles': piege };
  pieges['on ne peut pas savoir'] = 'droites-on-sait';
  return {
    consigne: 'droites',
    question,
    choix: melanger(['parallèles', 'perpendiculaires', 'on ne peut pas savoir']).map((c) => ({ cle: c, libelle: c })),
    bonne,
    pieges,
  };
}

function notation(o) {
  const { au, melanger } = o;
  const [x, y] = melanger(LETTRES);
  const seg = `[${x}${y}]`;
  const dro = `(${x}${y})`;
  const demi = `[${x}${y})`;
  const lon = `${x}${y}`;
  const sorte = au(['segment', 'droite', 'demi', 'longueur']);
  if (sorte === 'segment') {
    return faire(melanger, 'notation', `Le segment d'extrémités ${x} et ${y} s'écrit :`, seg,
      melanger([[dro, 'notation-droite'], [demi, 'notation-demi-droite'], [lon, 'notation-longueur']]), () => lon);
  }
  if (sorte === 'droite') {
    return faire(melanger, 'notation', `La droite qui passe par ${x} et ${y} s'écrit :`, dro,
      melanger([[seg, 'notation-segment'], [demi, 'notation-demi-droite']]), () => lon);
  }
  if (sorte === 'demi') {
    return faire(melanger, 'notation', `La demi-droite d'origine ${x} qui passe par ${y} s'écrit :`, demi,
      [[`[${y}${x})`, 'notation-origine'], ...melanger([[dro, 'notation-droite'], [seg, 'notation-segment']])], () => lon);
  }
  return faire(melanger, 'notation', `La longueur du segment ${seg} s'écrit :`, lon,
    melanger([[seg, 'notation-segment'], [dro, 'notation-droite']]), () => demi);
}

/* ------------------------------------------------------------------ 5e */

function nonNul(entre, a, b) {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
}

function symetrieCentrale(o) {
  const { entre, melanger } = o;
  const a = entre(-3, 4);
  const b = entre(-3, 4);
  const dx = nonNul(entre, -5, 5);
  const dy = nonNul(entre, -5, 5);
  const bonne = pt(a - dx, b - dy);
  return faire(melanger, 'symetrie-centrale', `Centre O${pt(a, b)}.\nSymétrique de A${pt(a + dx, b + dy)} ?`, bonne, [
    [pt(a - dx, b + dy), 'centrale-axiale'],
    [pt(a + 2 * dx, b + 2 * dy), 'centrale-centre'],
  ], (i) => pt(a - dx + i, b - dy));
}

function parallelogramme(o) {
  const { entre, au, melanger } = o;
  if (au([true, false])) {
    const l1 = entre(3, 12);
    let l2 = entre(2, 11);
    if (l2 >= l1) l2 += 1;
    const demande = au(['CD', 'DA']);
    const bonne = demande === 'CD' ? l1 : l2;
    const autre = demande === 'CD' ? l2 : l1;
    return faire(melanger, 'parallelogramme', `ABCD est un parallélogramme.\nAB = ${l1} cm et BC = ${l2} cm.\n${demande} = ?`, `${bonne} cm`, [
      [`${autre} cm`, 'parallelo-cotes'],
      [`${l1 + l2} cm`, 'parallelo-cotes'],
    ], (i) => `${bonne + i} cm`);
  }
  let alpha = 5 * entre(7, 29); // de 35° à 145°
  if (alpha === 90) alpha = 75;
  const demande = au(['C', 'B', 'D']);
  const bonne = demande === 'C' ? alpha : 180 - alpha;
  const autre = demande === 'C' ? 180 - alpha : alpha;
  return faire(melanger, 'parallelogramme', `ABCD est un parallélogramme.\nL'angle en A mesure ${alpha}°.\nL'angle en ${demande} = ?`, `${bonne}°`, [
    [`${autre}°`, 'parallelo-angles'],
    [`${360 - alpha}°`, 'parallelo-angles'],
  ], (i) => `${bonne + 10 * i}°`);
}

function diagonales(o) {
  const { entre, au, melanger } = o;
  const k = entre(2, 9);
  let m = entre(2, 9);
  if (m === k || m === 2 * k) m = k + 1 === 2 * k ? k + 2 : k + 1;
  const demande = au(['OA', 'OC']);
  return faire(melanger, 'diagonales', `ABCD est un parallélogramme de centre O.\nAC = ${2 * k} cm et BD = ${2 * m} cm.\n${demande} = ?`, `${k} cm`, [
    [`${2 * k} cm`, 'diagonales-milieu'],
    [`${m} cm`, 'diagonales-egales'],
  ], (i) => `${k + i} cm`);
}

/* ------------------------------------------------------------------ 4e */

function translation(o) {
  const { entre, melanger } = o;
  const bx = entre(-4, 4);
  const by = entre(-4, 4);
  const vx = nonNul(entre, -5, 5);
  const vy = nonNul(entre, -5, 5);
  const ax = entre(-4, 4);
  const ay = entre(-4, 4);
  const bonne = pt(ax + vx, ay + vy);
  return faire(melanger, 'translation',
    `La translation qui transforme B${pt(bx, by)} en C${pt(bx + vx, by + vy)}.\nImage de A${pt(ax, ay)} ?`, bonne, [
      [pt(ax - vx, ay - vy), 'translation-sens'],
      [pt(ax + vx, ay), 'translation-deux-coordonnees'],
    ], (i) => pt(ax + vx + i, ay + vy));
}

/** Le parallélogramme que dessine une translation : P → Q et R → S donnent PQSR. */
function quadrilatere(o, consigne, question) {
  const { melanger } = o;
  const [p, q, r, s] = melanger(LETTRES);
  return faire(melanger, consigne, question(p, q, r, s), `${p}${q}${s}${r}`, [
    [`${p}${q}${r}${s}`, 'parallelogramme-ordre'],
    [`${p}${r}${q}${s}`, 'parallelogramme-ordre'],
  ], () => `${q}${p}${s}${r}`);
}

function translationMesure(o) {
  const { entre, au, melanger } = o;
  const sorte = au(['longueur', 'angle', 'aire']);
  if (sorte === 'longueur') {
    const l = entre(3, 15);
    return faire(melanger, 'translation-mesure', `Une translation transforme le triangle ABC en DEF.\nAB = ${l} cm.\nDE = ?`, `${l} cm`, [
      [`${2 * l} cm`, 'translation-conserve'],
    ], (i) => `${l + i} cm`);
  }
  if (sorte === 'angle') {
    const a = 5 * entre(5, 16);
    return faire(melanger, 'translation-mesure', `Une translation transforme le triangle ABC en DEF.\nL'angle en A mesure ${a}°.\nL'angle en D = ?`, `${a}°`, [
      [`${180 - a}°`, 'translation-conserve'],
      [`${2 * a}°`, 'translation-conserve'],
    ], (i) => `${a + 5 * i}°`);
  }
  const s = entre(4, 30);
  return faire(melanger, 'translation-mesure', `Une translation transforme le triangle ABC en DEF.\nAire de ABC : ${s} cm².\nAire de DEF = ?`, `${s} cm²`, [
    [`${2 * s} cm²`, 'translation-conserve'],
    [`${4 * s} cm²`, 'translation-conserve'],
  ], (i) => `${s + i} cm²`);
}

/* ------------------------------------------------------------------ 3e */

function rotation(o) {
  const { entre, au, melanger } = o;
  const a = entre(-2, 3);
  const b = entre(-2, 3);
  const dx = nonNul(entre, -4, 4);
  const dy = nonNul(entre, -4, 4);
  const direct = au([true, false]); // sens inverse des aiguilles d'une montre
  const anti = pt(a - dy, b + dx);
  const horaire = pt(a + dy, b - dx);
  const sens = direct ? 'dans le sens inverse des aiguilles d’une montre' : 'dans le sens des aiguilles d’une montre';
  return faire(melanger, 'rotation', `Rotation de centre O${pt(a, b)}, d'angle 90°, ${sens}.\nImage de A${pt(a + dx, b + dy)} ?`,
    direct ? anti : horaire, [
      [direct ? horaire : anti, 'rotation-sens'],
      [pt(a - dx, b - dy), 'rotation-angle'],
    ], (i) => pt(a - dx + i, b - dy));
}

const RAPPORTS_TAILLE = [-3, -2, -1.5, -1, -0.5, -0.25, 0.25, 0.5, 0.75, 1.5, 2, 2.5, 3];

function homothetie(o) {
  const { entre, au, melanger } = o;
  const sorte = au(['point', 'longueur', 'aire', 'taille']);
  if (sorte === 'point') {
    const k = au([-3, -2, 2, 3]);
    const x = nonNul(entre, -4, 4);
    const y = nonNul(entre, -4, 4);
    const bonne = pt(k * x, k * y);
    return faire(melanger, 'homothetie-point', `Homothétie de centre O(0 ; 0) et de rapport ${rel(k)}.\nImage de A${pt(x, y)} ?`, bonne, [
      [pt(-k * x, -k * y), 'rapport-negatif'],
      [pt(x + k, y + k), 'homothetie-ajouter'],
    ], (i) => pt(k * x + i, k * y));
  }
  if (sorte === 'longueur') {
    const k = au([-3, -2, 2, 3, 4]);
    const l = entre(4, 9); // l + k reste une longueur positive : un piège crédible
    const bonne = `${Math.abs(k) * l} cm`;
    return faire(melanger, 'homothetie-mesure', `Homothétie de rapport ${rel(k)}.\nUn segment de ${l} cm a pour image un segment de :`, bonne, [
      ...(k < 0 ? [[`${rel(k * l)} cm`, 'longueur-positive']] : []),
      [`${rel(l + k)} cm`, 'homothetie-ajouter'],
      [`${k * k * l} cm`, 'longueur-rapport'],
    ], (i) => `${Math.abs(k) * l + i} cm`);
  }
  if (sorte === 'aire') {
    const k = au([-3, -2, 2, 3]);
    const s = entre(2, 9);
    return faire(melanger, 'homothetie-mesure', `Homothétie de rapport ${rel(k)}.\nUne figure de ${s} cm² a pour image une figure de :`, `${k * k * s} cm²`, [
      [`${Math.abs(k) * s} cm²`, 'aire-carre-rapport'],
      [`${2 * Math.abs(k) * s} cm²`, 'aire-carre-rapport'],
    ], (i) => `${k * k * s + i} cm²`);
  }
  const k = au(RAPPORTS_TAILLE);
  let bonne = 'garde la taille';
  if (Math.abs(k) > 1) bonne = 'agrandit la figure';
  if (Math.abs(k) < 1) bonne = 'réduit la figure';
  const tous = ['agrandit la figure', 'réduit la figure', 'garde la taille'];
  const pieges = {};
  tous.filter((c) => c !== bonne).forEach((c) => { pieges[c] = 'rapport-taille'; });
  return {
    consigne: 'homothetie-taille',
    question: `Une homothétie de rapport ${virgule(k)} :`,
    choix: melanger(tous).map((c) => ({ cle: c, libelle: c })),
    bonne,
    pieges,
  };
}

function vecteur(o) {
  const { entre, au, melanger } = o;
  if (au([true, false])) {
    return quadrilatere(o, 'translation-parallelogramme', (p, q, r, s) => `Les vecteurs ${p}${q} et ${r}${s} sont égaux.\nQuel quadrilatère est un parallélogramme ?`);
  }
  const [a, b] = melanger(['A', 'B', 'E', 'F', 'K', 'L']);
  const ax = entre(-4, 4);
  const ay = entre(-4, 4);
  const vx = nonNul(entre, -5, 5);
  const vy = nonNul(entre, -5, 5);
  const mx = entre(-4, 4);
  const my = entre(-4, 4);
  return faire(melanger, 'vecteur',
    `${a}${pt(ax, ay)} et ${b}${pt(ax + vx, ay + vy)}.\nTranslation de vecteur ${a}${b} : image de M${pt(mx, my)} ?`, pt(mx + vx, my + vy), [
      [pt(mx - vx, my - vy), 'vecteur-sens'],
      [pt(mx + vx, my), 'translation-deux-coordonnees'],
    ], (i) => pt(mx + vx + i, my + vy));
}

/* ------------------------------------------------------------- la série */

const fois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  SIXIEME: (o) => [...fois(3, symetrieAxiale, o), ...fois(3, droites, o), ...fois(2, notation, o)],
  CINQUIEME: (o) => [...fois(3, symetrieCentrale, o), ...fois(3, parallelogramme, o), ...fois(2, diagonales, o)],
  QUATRIEME: (o) => [
    ...fois(3, translation, o),
    ...fois(3, (x) => quadrilatere(x, 'translation-parallelogramme',
      (p, q, r, s) => `La translation qui transforme ${p} en ${q} transforme ${r} en ${s}.\nQuel quadrilatère est un parallélogramme ?`), o),
    ...fois(2, translationMesure, o),
  ],
  TROISIEME: (o) => [...fois(3, rotation, o), ...fois(3, homothetie, o), ...fois(2, vecteur, o)],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES.SIXIEME;
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 6e
  'symetrie-axiale': 'Trouve le symétrique de ce point par rapport à l’axe.',
  'symetrie-distance': 'Compte les carreaux entre le point et l’axe, puis exactement autant de l’autre côté de l’axe.',
  'symetrie-axe': 'Le point traverse l’axe en ligne droite, perpendiculairement : si l’axe est vertical, seule la première coordonnée change ; s’il est horizontal, seule la seconde.',
  'symetrie-axiale-regle': 'Le symétrique est de l’autre côté de l’axe, à la même distance, sur la perpendiculaire à l’axe.',
  droites: 'Que peux-tu dire de ces deux droites ?',
  'deux-perpendiculaires': 'Deux droites perpendiculaires à une même droite sont parallèles entre elles.',
  'deux-paralleles': 'Deux droites parallèles à une même droite sont parallèles entre elles.',
  'parallele-perpendiculaire': 'Si deux droites sont parallèles, toute droite perpendiculaire à l’une est perpendiculaire à l’autre.',
  'droites-on-sait': 'On peut savoir : une des trois propriétés des droites parallèles et perpendiculaires répond à coup sûr.',
  'droites-regle': 'Deux perpendiculaires à une même droite sont parallèles ; deux parallèles à une même droite aussi ; une perpendiculaire à l’une de deux parallèles l’est aussi à l’autre.',
  notation: 'Choisis la bonne notation.',
  'notation-droite': 'Les parenthèses, c’est la droite : elle ne s’arrête jamais, ni d’un côté ni de l’autre.',
  'notation-segment': 'Les crochets des deux côtés, c’est le segment : il s’arrête à ses deux extrémités.',
  'notation-demi-droite': 'Un crochet d’un seul côté, c’est la demi-droite : elle s’arrête à son origine, et continue de l’autre côté.',
  'notation-longueur': 'Sans crochets ni parenthèses, les deux lettres désignent une longueur, c’est-à-dire un nombre.',
  'notation-origine': 'Pour la demi-droite, l’origine s’écrit en premier, du côté du crochet.',
  'notation-regle': 'Des crochets : le segment ; des parenthèses : la droite ; un seul crochet, du côté de l’origine : la demi-droite ; sans rien : la longueur.',
  // 5e
  'symetrie-centrale': 'Trouve le symétrique de ce point par rapport au centre.',
  'centrale-axiale': 'Une symétrie centrale est un demi-tour autour du centre : les deux coordonnées changent, pas une seule.',
  'centrale-centre': 'Le centre, c’est O : il est le milieu du segment qui joint le point à son symétrique. Pars de O, pas du point.',
  'symetrie-centrale-regle': 'Le centre est le milieu du point et de son symétrique : le déplacement qui mène du point au centre se refait une fois de plus, au-delà du centre.',
  parallelogramme: 'Utilise les propriétés du parallélogramme pour trouver cette mesure.',
  'parallelo-cotes': 'Dans un parallélogramme, ce sont les côtés opposés qui ont la même longueur : AB et CD, BC et DA.',
  'parallelo-angles': 'Dans un parallélogramme, les angles opposés sont égaux, et deux angles consécutifs font cent quatre-vingts degrés à eux deux.',
  'parallelogramme-regle': 'Côtés opposés de même longueur, angles opposés égaux, angles consécutifs supplémentaires.',
  diagonales: 'Trouve cette longueur grâce aux diagonales du parallélogramme.',
  'diagonales-milieu': 'Les diagonales d’un parallélogramme se coupent en leur milieu : le centre partage chacune en deux moitiés.',
  'diagonales-egales': 'Les deux diagonales d’un parallélogramme n’ont pas forcément la même longueur : prends la moitié de la bonne diagonale.',
  'diagonales-regle': 'Le centre est le milieu de chaque diagonale : la longueur cherchée est la moitié de sa diagonale.',
  // 4e
  translation: 'Où la translation envoie-t-elle ce point ?',
  'translation-sens': 'Attention au sens : la translation va du premier point vers son image, pas l’inverse. Fais le même trajet, dans le même sens.',
  'translation-deux-coordonnees': 'Le glissement se fait à la fois à l’horizontale et à la verticale : ajoute le décalage aux deux coordonnées.',
  'translation-regle': 'Calcule le décalage de l’image moins le point de départ, puis ajoute-le aux deux coordonnées du point.',
  'translation-parallelogramme': 'Quel quadrilatère est un parallélogramme ?',
  'parallelogramme-ordre': 'Fais le tour dans l’ordre : le premier point, son image, l’image du second point, puis le second point.',
  'translation-parallelogramme-regle': 'Le point, son image, l’image de l’autre point, puis l’autre point : c’est l’ordre du tour du parallélogramme.',
  'translation-mesure': 'Que devient cette mesure après la translation ?',
  'translation-conserve': 'Une translation fait glisser la figure sans la tourner ni l’agrandir : longueurs, angles et aires restent les mêmes.',
  'translation-mesure-regle': 'Une translation conserve les longueurs, les angles et les aires.',
  // 3e
  rotation: 'Où ce quart de tour envoie-t-il ce point ?',
  'rotation-sens': 'Regarde bien le sens de rotation : un quart de tour dans le sens des aiguilles d’une montre et un quart de tour dans l’autre sens n’arrivent pas au même endroit.',
  'rotation-angle': 'Un angle droit, c’est un quart de tour : le point ne passe pas de l’autre côté du centre, ce serait un demi-tour.',
  'rotation-regle': 'Repère le décalage du point par rapport au centre, fais-le tourner d’un quart de tour dans le bon sens, puis repars du centre.',
  'homothetie-point': 'Où l’homothétie envoie-t-elle ce point ?',
  'rapport-negatif': 'Un rapport négatif envoie l’image de l’autre côté du centre : les coordonnées changent de signe.',
  'homothetie-ajouter': 'Une homothétie multiplie les distances au centre par le rapport, elle n’ajoute rien.',
  'homothetie-point-regle': 'Avec le centre à l’origine, multiplie les deux coordonnées du point par le rapport, avec son signe.',
  'homothetie-mesure': 'Que devient cette mesure par l’homothétie ?',
  'longueur-positive': 'Une longueur n’est jamais négative : on la multiplie par la distance à zéro du rapport.',
  'longueur-rapport': 'Une longueur est multipliée par le rapport, sans le signe ; c’est l’aire qui est multipliée par le carré du rapport.',
  'aire-carre-rapport': 'Les aires sont multipliées par le carré du rapport : si les longueurs triplent, l’aire est multipliée par neuf.',
  'homothetie-mesure-regle': 'Les longueurs sont multipliées par la distance à zéro du rapport, les aires par le carré du rapport.',
  'homothetie-taille': 'Cette homothétie agrandit-elle ou réduit-elle la figure ?',
  'rapport-taille': 'Seule la distance à zéro du rapport compte pour la taille : plus grande que un, la figure s’agrandit ; plus petite que un, elle rétrécit. Le signe dit seulement de quel côté du centre elle se trouve.',
  'homothetie-taille-regle': 'Compare la distance à zéro du rapport avec un : au-dessus, on agrandit ; en dessous, on réduit ; égale à un, la taille ne change pas.',
  vecteur: 'Où la translation de ce vecteur envoie-t-elle ce point ?',
  'vecteur-sens': 'Le vecteur va de son origine vers son extrémité : le décalage, c’est l’extrémité moins l’origine.',
  'vecteur-regle': 'Calcule le décalage du vecteur, l’extrémité moins l’origine, et ajoute-le aux deux coordonnées du point.',
};
