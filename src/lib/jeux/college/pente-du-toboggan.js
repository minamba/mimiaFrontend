/**
 * LA PENTE DU TOBOGGAN — la trigonométrie, en 4e (cosinus) et en 3e
 * (sinus, cosinus, tangente).
 * Professeure : Nora (mathématiques).
 *
 * Aucun dessin : le triangle est nommé, son angle droit dit (« ABC rectangle
 * en A »), l'angle étudié écrit avec son sommet au milieu (« l'angle ABC »).
 * Tous les calculs se font EN DEGRÉS dans le code ; la question dit toujours
 * la précision attendue (au dixième pour une longueur, au degré pour un angle).
 *
 * PAR CLASSE :
 *   4e (3 + 3 + 2) — quel rapport est le cosinus ; une longueur par le
 *        cosinus ; un angle par le cosinus. Pièges : l'opposé pris pour
 *        l'adjacent, l'hypoténuse en haut, multiplier au lieu de diviser, la
 *        calculatrice en radians, le cosinus pris pour l'angle (oubli
 *        d'arccos), l'autre angle aigu ;
 *   3e (3 + 3 + 2) — choisir le bon rapport (SOHCAHTOA) ; calculer une
 *        longueur ; calculer un angle. Pièges : sinus et cosinus échangés,
 *        la tangente quand l'hypoténuse est en jeu, le produit en croix à
 *        l'envers, l'autre angle aigu.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'pente-du-toboggan', titre: 'La pente du toboggan', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'La pente du toboggan',
    accroche: 'Le cosinus : adjacent sur hypoténuse.',
    competences: ['MATH_4E_COSINUS'],
  },
  TROISIEME: {
    titre: 'La pente du toboggan',
    accroche: 'Sinus, cosinus ou tangente ? À toi.',
    competences: ['MATH_3E_TRIGO'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const RAD = Math.PI / 180;
/** Les rapports, l'angle en degrés. */
export const TRIGO = {
  sin: (a) => Math.sin(a * RAD),
  cos: (a) => Math.cos(a * RAD),
  tan: (a) => Math.tan(a * RAD),
};
/** Les fonctions réciproques, en degrés. */
export const ARC = {
  sin: (x) => Math.asin(x) / RAD,
  cos: (x) => Math.acos(x) / RAD,
  tan: (x) => Math.atan(x) / RAD,
};
/** Le côté du haut et celui du bas de chaque rapport. */
export const COTES = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] };

/** Arrondi au dixième, avec le signe moins typographique : « 8,1 », « −7,2 ». */
export const dix = (x) => {
  const r = Math.round(x * 10) / 10;
  return (r < 0 ? '−' : '') + Math.abs(r).toFixed(1).replace('.', ',');
};
/** « 0,67 » : arrondi au centième. */
const cent = (x) => String(Math.round(x * 100) / 100).replace('.', ',');

const TRIANGLES = ['ABC', 'DEF', 'RST', 'KLM', 'UVW'];

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

/**
 * Le triangle : son nom, l'angle droit en P, l'angle étudié en V, le troisième
 * sommet W ; ses côtés nommés dans l'ordre du nom (« AB », jamais « BA »).
 */
function triangle({ au, melanger }) {
  const nom = au(TRIANGLES);
  const [P, V, W] = melanger(nom.split(''));
  const seg = (x, y) => (nom.indexOf(x) < nom.indexOf(y) ? `${x}${y}` : `${y}${x}`);
  return {
    nom,
    P,
    angle: `${W}${V}${P}`,
    cote: { adj: seg(V, P), opp: seg(P, W), hyp: seg(V, W) },
  };
}

/** Un angle aigu, ni trop plat ni trop raide, jamais 45° (son complémentaire serait lui-même). */
const angleAigu = (entre) => {
  let a = entre(20, 70);
  while (a === 45) a = entre(20, 70);
  return a;
};

// ------------------------------------------------------------------ 4e

function cosinusRapport(o) {
  const { nom, P, angle, cote } = triangle(o);
  return monter(o.melanger, 'cosinus-rapport', `${nom} rectangle en ${P}. Cosinus de l’angle ${angle} = ?`, `${cote.adj}/${cote.hyp}`, [
    [`${cote.opp}/${cote.hyp}`, 'cosinus-adjacent'],
    [`${cote.hyp}/${cote.adj}`, 'hypotenuse-en-bas'],
  ], () => `${cote.opp}/${cote.adj}`);
}

function cosinusLongueur(o, sorte) {
  const { entre, melanger } = o;
  const { nom, P, angle, cote } = triangle(o);
  const a = angleAigu(entre);
  const c = TRIGO.cos(a);
  const enRadians = Math.cos(a);
  const x = sorte === 'adjacent' ? entre(4, 15) : entre(3, 12);
  const [connu, cherche] = sorte === 'adjacent' ? [cote.hyp, cote.adj] : [cote.adj, cote.hyp];
  const juste = sorte === 'adjacent' ? x * c : x / c;
  const pieges = [[`${dix(sorte === 'adjacent' ? x / c : x * c)} cm`, 'produit-en-croix']];
  if (Math.abs(enRadians) >= 0.2) {
    pieges.push([`${dix(sorte === 'adjacent' ? x * enRadians : x / enRadians)} cm`, 'calculatrice-degres']);
  }
  return monter(
    melanger,
    'cosinus-longueur',
    `${nom} rectangle en ${P} : angle ${angle} = ${a}°, ${connu} = ${x} cm. ${cherche} ≈ ? (arrondi au dixième)`,
    `${dix(juste)} cm`,
    pieges,
    (k) => `${dix(juste + k)} cm`,
  );
}

function cosinusAngle(o) {
  const { entre, melanger } = o;
  const { nom, P, angle, cote } = triangle(o);
  let adj; let hyp; let a;
  do {
    adj = entre(2, 9);
    hyp = entre(adj + 1, 12);
    a = Math.round(ARC.cos(adj / hyp));
  } while (a === 45);
  return monter(
    melanger,
    'cosinus-angle',
    `${nom} rectangle en ${P} : ${cote.adj} = ${adj} cm, ${cote.hyp} = ${hyp} cm. Angle ${angle} ≈ ? (arrondi au degré)`,
    `${a}°`,
    [
      [`${90 - a}°`, 'angle-complementaire'],
      [`${cent(adj / hyp)}°`, 'arccos-touche'],
    ],
    (k) => `${a + k}°`,
  );
}

function quatrieme(o) {
  const liste = [];
  for (let i = 0; i < 3; i += 1) liste.push(cosinusRapport(o));
  o.melanger(['adjacent', 'adjacent', 'hypotenuse']).forEach((sorte) => liste.push(cosinusLongueur(o, sorte)));
  for (let i = 0; i < 2; i += 1) liste.push(cosinusAngle(o));
  return liste;
}

// ------------------------------------------------------------------ 3e

export const RAPPORTS = { sin: 'Le sinus', cos: 'Le cosinus', tan: 'La tangente' };
/** Le rapport qui relie deux côtés. */
export const rapportDe = (x, y) => Object.keys(COTES).find((f) => COTES[f].includes(x) && COTES[f].includes(y));

function choisirRapport(o) {
  const { au, melanger } = o;
  const { nom, P, angle, cote } = triangle(o);
  const [connu, cherche] = melanger(au([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]));
  const bonne = rapportDe(connu, cherche);
  const pieges = {
    sin: { cos: 'reperer-cotes', tan: 'hypotenuse-en-jeu' },
    cos: { sin: 'reperer-cotes', tan: 'hypotenuse-en-jeu' },
    tan: { sin: 'tangente-sans-hypotenuse', cos: 'tangente-sans-hypotenuse' },
  }[bonne];
  return {
    consigne: 'choisir-rapport',
    question: `${nom} rectangle en ${P}. On connaît l’angle ${angle} et ${cote[connu]} ; on cherche ${cote[cherche]}. Quel rapport ?`,
    bonne,
    choix: ['sin', 'cos', 'tan'].map((cle) => ({ cle, libelle: RAPPORTS[cle] })),
    pieges,
  };
}

/** Le rapport qu'on prend à tort : sinus et cosinus s'échangent, la tangente devient un sinus. */
const AUTRE = { sin: ['cos', 'reperer-cotes'], cos: ['sin', 'reperer-cotes'], tan: ['sin', 'sohcahtoa'] };

function trigoLongueur(o) {
  const { entre, au, melanger } = o;
  const { nom, P, angle, cote } = triangle(o);
  const f = au(['sin', 'cos', 'tan']);
  const a = angleAigu(entre);
  const s = entre(3, 15);
  const [haut, bas] = COTES[f];
  const v = TRIGO[f](a);
  const [faux, phrase] = AUTRE[f];
  const w = TRIGO[faux](a);
  const connuEnBas = entre(0, 1) === 1;
  // haut = bas × rapport : on multiplie pour le côté du haut, on divise pour celui du bas.
  const [connu, cherche, juste, croix, autre] = connuEnBas
    ? [bas, haut, s * v, s / v, s * w]
    : [haut, bas, s / v, s * v, s / w];
  return monter(
    melanger,
    'trigo-longueur',
    `${nom} rectangle en ${P} : angle ${angle} = ${a}°, ${cote[connu]} = ${s} cm. ${cote[cherche]} ≈ ? (arrondi au dixième)`,
    `${dix(juste)} cm`,
    [[`${dix(croix)} cm`, 'produit-en-croix'], [`${dix(autre)} cm`, phrase]],
    (k) => `${dix(juste + k)} cm`,
  );
}

function trigoAngle(o) {
  const { entre, au, melanger } = o;
  const { nom, P, angle, cote } = triangle(o);
  const f = au(['sin', 'cos', 'tan']);
  const [haut, bas] = COTES[f];
  let h; let b; let a;
  do {
    if (f === 'tan') {
      h = entre(2, 12);
      b = entre(2, 12);
    } else {
      b = entre(5, 15);
      h = entre(2, b - 1);
    }
    a = Math.round(ARC[f](h / b));
  } while (h === b || a === 45 || a < 5 || a > 85);
  const pieges = [[`${90 - a}°`, 'reperer-cotes']];
  if (f !== 'tan') pieges.push([`${Math.round(ARC.tan(h / b))}°`, 'sohcahtoa']);
  else if (h < b) pieges.push([`${Math.round(ARC.sin(h / b))}°`, 'sohcahtoa']);
  const donnees = melanger([`${cote[haut]} = ${h} cm`, `${cote[bas]} = ${b} cm`]);
  return monter(
    melanger,
    'trigo-angle',
    `${nom} rectangle en ${P} : ${donnees.join(', ')}. Angle ${angle} ≈ ? (arrondi au degré)`,
    `${a}°`,
    pieges,
    (k) => `${a + k}°`,
  );
}

function troisieme(o) {
  const liste = [];
  for (let i = 0; i < 3; i += 1) liste.push(choisirRapport(o));
  for (let i = 0; i < 3; i += 1) liste.push(trigoLongueur(o));
  for (let i = 0; i < 2; i += 1) liste.push(trigoAngle(o));
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
  'cosinus-rapport': 'Quel rapport de longueurs donne le cosinus de cet angle ?',
  'cosinus-longueur': 'Utilise le cosinus de l’angle pour calculer la longueur demandée.',
  'cosinus-angle': 'Retrouve la mesure de l’angle grâce à son cosinus.',
  'choisir-rapport': 'Sinus, cosinus ou tangente : lequel choisir ici ?',
  'trigo-longueur': 'Choisis le bon rapport, puis calcule la longueur.',
  'trigo-angle': 'Choisis le bon rapport, puis retrouve l’angle.',

  // Les erreurs, chacune avec sa méthode.
  'cosinus-adjacent': 'Le cosinus, c’est le côté adjacent sur l’hypoténuse. L’adjacent est le côté de l’angle droit qui touche l’angle étudié.',
  'hypotenuse-en-bas': 'L’hypoténuse se met toujours en bas : le cosinus d’un angle aigu est plus petit que un.',
  'produit-en-croix': 'Écris d’abord l’égalité du rapport, puis isole la longueur cherchée par un produit en croix : selon sa place, on multiplie ou on divise.',
  'calculatrice-degres': 'Règle ta calculatrice en degrés : l’angle est donné en degrés, pas en radians.',
  'angle-complementaire': 'Tu as trouvé l’autre angle aigu. Le côté adjacent est celui qui touche l’angle cherché.',
  'arccos-touche': 'Le cosinus n’est pas l’angle : pour retrouver l’angle, utilise la touche arccos de ta calculatrice.',
  'reperer-cotes': 'Repère les côtés depuis l’angle étudié : l’opposé est en face de lui, l’adjacent le touche, l’hypoténuse est en face de l’angle droit.',
  sohcahtoa: 'Souviens-toi : sinus, opposé sur hypoténuse ; cosinus, adjacent sur hypoténuse ; tangente, opposé sur adjacent.',
  'tangente-sans-hypotenuse': 'Ici, l’hypoténuse n’intervient pas : avec l’opposé et l’adjacent, c’est la tangente.',
  'hypotenuse-en-jeu': 'L’hypoténuse est en jeu : ce sera le sinus ou le cosinus, pas la tangente.',

  // Les replis.
  'cosinus-rapport-regle': 'Le cosinus d’un angle aigu, c’est le côté adjacent divisé par l’hypoténuse.',
  'cosinus-longueur-regle': 'Écris cosinus égale adjacent sur hypoténuse, remplace ce que tu connais, puis fais un produit en croix.',
  'cosinus-angle-regle': 'Calcule adjacent sur hypoténuse, puis applique arccos, calculatrice en degrés.',
  'choisir-rapport-regle': 'Repère les deux côtés en jeu depuis l’angle, puis choisis le rapport qui les relie.',
  'trigo-longueur-regle': 'Choisis le rapport qui relie le côté connu et le côté cherché, puis fais un produit en croix.',
  'trigo-angle-regle': 'Choisis le rapport des deux côtés connus, puis applique la touche réciproque de ta calculatrice, en degrés.',
};
