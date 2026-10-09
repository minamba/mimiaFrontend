/**
 * LA PHOTO AGRANDIE — milieux, proportionnalité et Thalès, en 4e et en 3e.
 * Professeure : Nora (mathématiques).
 *
 * Aucun dessin : la configuration est dite en une ligne (« M sur [AB], N sur
 * [AC], (MN) // (BC) »), les longueurs suivent. Toutes les réponses sont
 * construites à partir d'un rapport p/q tiré au hasard : elles tombent juste.
 *
 * PAR CLASSE :
 *   4e (3 + 3 + 2) — le théorème des milieux (la moitié, et le parallèle au
 *        troisième côté) ; la proportionnalité dans un triangle ; la photo
 *        agrandie. Pièges : le double au lieu de la moitié, raisonner par
 *        différence au lieu de multiplier, le rapport pris à l'envers ;
 *   3e (3 + 3 + 2) — Thalès (triangle ou papillon) ; la réciproque, avec le
 *        piège des différences égales qui ne font pas des rapports égaux ;
 *        l'agrandissement : aires × k², volumes × k³.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'photo-agrandie', titre: 'La photo agrandie', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'La photo agrandie',
    accroche: 'Milieux et proportions dans un triangle.',
    competences: ['MATH_4E_MILIEUX', 'MATH_4E_THALES_INTRO'],
  },
  TROISIEME: {
    titre: 'La photo agrandie',
    accroche: 'Thalès, et l’aire qui grandit en k².',
    competences: ['MATH_3E_THALES', 'MATH_3E_THALES_REC', 'MATH_3E_AGRANDISSEMENT'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « 2,5 » : la virgule (jusqu'au millième). */
const nb = (x) => {
  const r = Math.round(x * 1000) / 1000;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
};
/** Un nombre qui s'écrit exactement avec deux décimales au plus. */
const net = (x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;
/** Des triangles sans M, N, I ni J, que l'on garde pour les points ajoutés. */
const TRIANGLES = ['ABC', 'DEF', 'RST', 'UVW', 'EFG'];
const RAPPORTS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5]];

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

/** Un piège de longueur, seulement s'il est positif et s'écrit proprement. */
const piegeCm = (x, phrase) => (x > 0 && net(x) ? [[`${nb(x)} cm`, phrase]] : []);

// ------------------------------------------------------------------ 4e

function milieux(o, sorte) {
  const { entre, au, melanger } = o;
  const [A, B, C] = au(TRIANGLES).split('');
  const intro = `Dans ${A}${B}${C}, I est le milieu de [${A}${B}] et J celui de [${A}${C}].`;
  if (sorte === 'parallele') {
    return {
      consigne: 'milieux',
      question: `${intro} La droite (IJ) est parallèle à ?`,
      bonne: `(${B}${C})`,
      choix: melanger([`(${B}${C})`, `(${A}${B})`, `(${A}${C})`]).map((x) => ({ cle: x, libelle: x })),
      pieges: { [`(${A}${B})`]: 'milieux-troisieme-cote', [`(${A}${C})`]: 'milieux-troisieme-cote' },
    };
  }
  if (sorte === 'cote') {
    const bc = entre(4, 30);
    return monter(melanger, 'milieux', `${intro} ${B}${C} = ${bc} cm. IJ = ?`, `${nb(bc / 2)} cm`, [
      [`${nb(bc * 2)} cm`, 'milieux-moitie'],
      [`${nb(bc)} cm`, 'milieux-moitie'],
    ], (k) => `${nb(bc / 2 + k)} cm`);
  }
  const ij = entre(2, 15);
  return monter(melanger, 'milieux', `${intro} IJ = ${ij} cm. ${B}${C} = ?`, `${nb(ij * 2)} cm`, [
    [`${nb(ij / 2)} cm`, 'milieux-moitie'],
    [`${nb(ij)} cm`, 'milieux-moitie'],
  ], (k) => `${nb(ij * 2 + k)} cm`);
}

function proportionnalite(o) {
  const { entre, au, melanger } = o;
  const [A, B, C] = au(TRIANGLES).split('');
  const [p, q] = au(RAPPORTS);
  const t = entre(1, 3);
  const u = entre(1, 4);
  const [am, ab, bc] = [p * t, q * t, q * u];
  const mn = p * u;
  return monter(
    melanger,
    'proportionnalite',
    `Dans ${A}${B}${C}, M est sur [${A}${B}], N sur [${A}${C}] et (MN) // (${B}${C}). ${A}M = ${am} cm, ${A}${B} = ${ab} cm, ${B}${C} = ${bc} cm. MN = ?`,
    `${nb(mn)} cm`,
    [
      ...piegeCm(bc - (ab - am), 'additif-pas-proportionnel'),
      ...piegeCm((bc * ab) / am, 'rapport-inverse'),
    ],
    (k) => `${nb(mn + k)} cm`,
  );
}

function photo(o) {
  const { entre, au, melanger } = o;
  const k = au([2, 3, 4, 1.5, 2.5]);
  const l = 2 * entre(2, 6);
  const L = l + entre(2, 6);
  return monter(
    melanger,
    'photo',
    `Une photo de ${l} cm sur ${L} cm est agrandie : ses ${l} cm deviennent ${nb(l * k)} cm. Et ses ${L} cm ?`,
    `${nb(L * k)} cm`,
    [
      ...piegeCm(L + l * k - l, 'additif-pas-proportionnel'),
      ...piegeCm(L / k, 'rapport-inverse'),
    ],
    (j) => `${nb(L * k + j)} cm`,
  );
}

function quatrieme(o) {
  const liste = [];
  o.melanger(['cote', 'segment', 'parallele']).forEach((sorte) => liste.push(milieux(o, sorte)));
  for (let i = 0; i < 3; i += 1) liste.push(proportionnalite(o));
  for (let i = 0; i < 2; i += 1) liste.push(photo(o));
  return liste;
}

// ------------------------------------------------------------------ 3e

function thales(o) {
  const { entre, au, melanger } = o;
  const [p, q] = au(RAPPORTS);
  const [t, u, v] = [entre(1, 3), entre(1, 3), entre(1, 4)];
  const [am, ab, an, ac, mn, bc] = [p * t, q * t, p * u, q * u, p * v, q * v];
  const figure = au(['triangle', 'papillon']) === 'triangle'
    ? 'M est sur [AB], N sur [AC] et (MN) // (BC).'
    : 'Les droites (BM) et (CN) se coupent en A, et (MN) // (BC).';
  if (au(['AC', 'MN']) === 'AC') {
    return monter(melanger, 'thales', `${figure} AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm. AC = ?`, `${nb(ac)} cm`, [
      ...piegeCm(an + (ab - am), 'additif-pas-proportionnel'),
      ...piegeCm((an * am) / ab, 'rapport-inverse'),
    ], (k) => `${nb(ac + k)} cm`);
  }
  return monter(melanger, 'thales', `${figure} AM = ${am} cm, AB = ${ab} cm, BC = ${bc} cm. MN = ?`, `${nb(mn)} cm`, [
    ...piegeCm(bc - (ab - am), 'additif-pas-proportionnel'),
    ...piegeCm((bc * ab) / am, 'rapport-inverse'),
  ], (k) => `${nb(mn + k)} cm`);
}

export const RECIPROQUE = { oui: 'Oui', non: 'Non', inconnu: 'On ne peut pas savoir' };

function reciproqueThales(o) {
  const { entre, au } = o;
  const sorte = au(['paralleles', 'differences', 'proches']);
  let am; let ab; let an; let ac;
  if (sorte === 'paralleles') {
    const [p, q] = au(RAPPORTS);
    const t = entre(1, 3);
    let u = entre(1, 4);
    while (u === t) u = entre(1, 4);
    [am, ab, an, ac] = [p * t, q * t, p * u, q * u];
  } else if (sorte === 'differences') {
    // Mêmes écarts AB − AM et AC − AN : les rapports, eux, diffèrent.
    const a = entre(2, 8);
    let b = entre(2, 8);
    while (b === a) b = entre(2, 8);
    const d = entre(1, 5);
    [am, ab, an, ac] = [a, a + d, b, b + d];
  } else {
    const [p, q] = au(RAPPORTS);
    const t = entre(1, 3);
    const u = entre(2, 4);
    [am, ab, an, ac] = [p * t, q * t, p * u + 1, q * u];
    if (am * ac === an * ab) ac += 1;
  }
  const paralleles = am * ac === an * ab;
  const bonne = paralleles ? 'oui' : 'non';
  return {
    consigne: 'reciproque-thales',
    question: `M est sur [AB], N sur [AC]. AM = ${am} cm, AB = ${ab} cm, AN = ${an} cm, AC = ${ac} cm. (MN) // (BC) ?`,
    bonne,
    choix: ['oui', 'non', 'inconnu'].map((cle) => ({ cle, libelle: RECIPROQUE[cle] })),
    pieges: paralleles
      ? { non: 'comparer-rapports', inconnu: 'reciproque-conclure' }
      : { oui: sorte === 'differences' ? 'rapports-pas-differences' : 'comparer-rapports', inconnu: 'reciproque-conclure' },
  };
}

function agrandissement(o, sorte) {
  const { entre, au, melanger } = o;
  const k = au([2, 3, 4, 5, 0.5]);
  const verbe = k < 1 ? 'réduit' : 'agrandi';
  if (sorte === 'aire') {
    const a = k < 1 ? 4 * entre(1, 6) : entre(2, 12);
    return monter(melanger, 'agrandissement', `Une figure de ${a} cm² est ${k < 1 ? 'réduite' : 'agrandie'} à l’échelle ${nb(k)}. Sa nouvelle aire ?`, `${nb(a * k * k)} cm²`, [
      [`${nb(a * k)} cm²`, 'aire-k-carre'],
      [`${nb(a * k * k * k)} cm²`, 'aire-pas-volume'],
    ], (j) => `${nb(a * k * k + j)} cm²`);
  }
  const v = k < 1 ? 8 * entre(1, 6) : entre(2, 10);
  return monter(melanger, 'agrandissement', `Un solide de ${v} cm³ est ${verbe} à l’échelle ${nb(k)}. Son nouveau volume ?`, `${nb(v * k * k * k)} cm³`, [
    [`${nb(v * k)} cm³`, 'volume-k-cube'],
    [`${nb(v * k * k)} cm³`, 'volume-k-cube'],
  ], (j) => `${nb(v * k * k * k + j)} cm³`);
}

function troisieme(o) {
  const liste = [];
  for (let i = 0; i < 3; i += 1) liste.push(thales(o));
  for (let i = 0; i < 3; i += 1) liste.push(reciproqueThales(o));
  o.melanger(['aire', 'volume']).forEach((sorte) => liste.push(agrandissement(o, sorte)));
  return liste;
}

const BANQUES = { QUATRIEME: quatrieme, TROISIEME: troisieme };

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
  milieux: 'Deux milieux dans un triangle : utilise le théorème des milieux.',
  proportionnalite: 'Les longueurs du petit triangle et du grand sont proportionnelles. Calcule celle qui manque.',
  photo: 'La photo est agrandie sans être déformée. Quelle est sa nouvelle longueur ?',
  thales: 'Des droites parallèles : utilise le théorème de Thalès.',
  'reciproque-thales': 'Ces deux droites sont-elles parallèles ?',
  agrandissement: 'Agrandir ou réduire change les aires et les volumes. De combien ?',

  // Les erreurs, chacune avec sa méthode.
  'milieux-moitie': 'Le segment qui joint les milieux de deux côtés mesure la moitié du troisième côté.',
  'milieux-troisieme-cote': 'La droite qui joint les milieux de deux côtés est parallèle au troisième côté, celui qui ne porte aucun des deux milieux.',
  'additif-pas-proportionnel': 'Les longueurs sont proportionnelles : on multiplie par le même coefficient, on n’ajoute pas le même écart.',
  'rapport-inverse': 'Prends le rapport dans le bon sens : petit triangle sur grand triangle, les longueurs dans le même ordre.',
  'comparer-rapports': 'Calcule les deux rapports, A M sur A B et A N sur A C : s’ils sont égaux, les droites sont parallèles ; sinon, elles ne le sont pas.',
  'rapports-pas-differences': 'Des écarts égaux ne suffisent pas : ce sont les rapports qu’il faut comparer, et ici ils sont différents.',
  'reciproque-conclure': 'On peut toujours conclure : si les rapports sont égaux, les droites sont parallèles ; sinon, elles ne le sont pas.',
  'aire-k-carre': 'Une aire a deux dimensions : quand les longueurs sont multipliées par k, l’aire est multipliée par k au carré.',
  'aire-pas-volume': 'Le cube de k, c’est pour les volumes. Une aire est multipliée par k au carré.',
  'volume-k-cube': 'Un volume a trois dimensions : quand les longueurs sont multipliées par k, le volume est multiplié par k au cube.',

  // Les replis.
  'milieux-regle': 'La droite des milieux est parallèle au troisième côté et mesure sa moitié.',
  'proportionnalite-regle': 'Trouve le coefficient qui fait passer du petit triangle au grand, puis applique-le.',
  'photo-regle': 'Trouve par combien la largeur a été multipliée, puis multiplie la longueur par le même nombre.',
  'thales-regle': 'Écris l’égalité des trois rapports, puis fais un produit en croix.',
  'reciproque-thales-regle': 'Compare les rapports A M sur A B et A N sur A C.',
  'agrandissement-regle': 'Les longueurs sont multipliées par k, les aires par k au carré, et les volumes par k au cube.',
};
