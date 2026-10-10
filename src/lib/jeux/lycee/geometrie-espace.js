/**
 * LA GÉOMÉTRIE DANS L'ESPACE — terminale générale, Nora (mathématiques).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (classe TERMINALE) :
 *   MATH_TLE_VECT_ESPACE, MATH_TLE_PARAMETRIQUE, MATH_TLE_PLAN_CARTESIEN,
 *   MATH_TLE_SCAL_ESPACE, MATH_TLE_ORTHOGONALITE, MATH_TLE_DROITES_PLANS
 *
 * SEPT SORTES DE MANCHES (huit par partie, mélangées) :
 *   - UN POINT SUR UNE DROITE : pour quelle valeur de t a-t-on M ∈ d ? ou
 *     aucune. LES PIÈGES : se tromper de signe en isolant t ; vérifier deux
 *     coordonnées sur trois ;
 *   - LE VECTEUR NORMAL d'un plan ax + by + cz + d = 0 (la bonne réponse est
 *     parfois un multiple). LES PIÈGES : perdre les signes, prendre un vecteur
 *     du plan (orthogonal au normal), mettre d dans le vecteur ;
 *   - L'ÉQUATION D'UN PLAN par un point et un vecteur normal. LES PIÈGES : le
 *     signe de d, échanger le point et le vecteur ;
 *   - UN POINT DANS UN PLAN. LES PIÈGES : un point de ax + by + cz = d (signe
 *     de d), le vecteur normal pris pour un point ;
 *   - L'ORTHOGONALITÉ : la valeur de m qui annule le produit scalaire. LES
 *     PIÈGES : le signe en isolant m, oublier la troisième coordonnée ;
 *   - DEUX DROITES : parallèles, sécantes ou non coplanaires (cas construits,
 *     donc sûrs). LES PIÈGES : « pas parallèles donc sécantes », oublier de
 *     résoudre le système, ignorer des vecteurs directeurs colinéaires ;
 *   - TROIS VECTEURS COPLANAIRES ? w = αu + βv, ou non. LES PIÈGES : les
 *     coefficients échangés, une combinaison juste sur deux coordonnées.
 *
 * Toutes les réponses sont construites puis vérifiées par le calcul ; un
 * piège qui serait juste lui aussi (vecteur colinéaire, équation
 * proportionnelle, point du plan) est écarté.
 *
 * LE VISUEL (09/10/2026) : aucune manche n'en porte, et c'est voulu. Tout se
 * joue sur des coordonnées, des équations et des positions relatives : aucune
 * figure ni aucun solide du dessinateur (`lib/jeux/visuels.js`) ne les montre
 * fidèlement. Il faudrait un repère de l'espace, avec droites et plans.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'geometrie-espace', titre: 'La géométrie dans l’espace', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'La géométrie dans l’espace',
    accroche: 'Droites, plans et vecteurs normaux.',
    competences: [
      'MATH_TLE_VECT_ESPACE', 'MATH_TLE_PARAMETRIQUE', 'MATH_TLE_PLAN_CARTESIEN',
      'MATH_TLE_SCAL_ESPACE', 'MATH_TLE_ORTHOGONALITE', 'MATH_TLE_DROITES_PLANS',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------- vecteurs */

export const scal = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
export const plus = (u, v) => u.map((x, i) => x + v[i]);
export const fois = (k, u) => u.map((x) => k * x);
export const vectoriel = (u, v) => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
export const nul = (u) => u.every((x) => x === 0);
export const colineaires = (u, v) => nul(vectoriel(u, v));
export const det = (u, v, w) => scal(vectoriel(u, v), w);

/* ------------------------------------------------------------- écriture */

const ecrire = (x) => (x < 0 ? `−${-x}` : `${x}`);
/** « (1 ; −2 ; 3) » ; une coordonnée peut être une lettre (« m »). */
export const triplet = (v) => `(${v.map((x) => (typeof x === 'number' ? ecrire(x) : x)).join(' ; ')})`;

/** « 1 + 2t », « −3 − t », « 4t », « 5 ». */
export function affine(c, k, p) {
  if (k === 0) return ecrire(c);
  const corps = Math.abs(k) === 1 ? p : `${Math.abs(k)}${p}`;
  if (c === 0) return k < 0 ? `−${corps}` : corps;
  return `${ecrire(c)} ${k < 0 ? '−' : '+'} ${corps}`;
}

/** « d : x = 1 + 2t ; y = −3 − t ; z = 4t (t ∈ ℝ) ». */
export const droite = (nom, A, u, p) => `${nom} : x = ${affine(A[0], u[0], p)} ; y = ${affine(A[1], u[1], p)} ; z = ${affine(A[2], u[2], p)} (${p} ∈ ℝ)`;

/** « 2x − y + 3z − 4 = 0 ». */
export function equation([a, b, c, d]) {
  const morceaux = [];
  [[a, 'x'], [b, 'y'], [c, 'z'], [d, '']].forEach(([k, lettre]) => {
    if (k === 0) return;
    const corps = lettre && Math.abs(k) === 1 ? lettre : `${Math.abs(k)}${lettre}`;
    if (morceaux.length === 0) morceaux.push(k < 0 ? `−${corps}` : corps);
    else morceaux.push(`${k < 0 ? '−' : '+'} ${corps}`);
  });
  return `${morceaux.join(' ')} = 0`;
}

/** Deux équations du même plan : (a, b, c, d) proportionnels. */
const memePlan = (e, f) => {
  const k = e.findIndex((x) => x !== 0);
  return e.every((x, i) => x * f[k] === f[i] * e[k]);
};

/* -------------------------------------------------------------- tirages */

const nonNul = (t, max) => t.entre(1, max) * t.au([1, -1]);
const point = (t, max = 3) => [t.entre(-max, max), t.entre(-max, max), t.entre(-max, max)];

/** Un vecteur à petites coordonnées, non nul (au moins deux coordonnées non nulles si demandé). */
function vecteur(t, max = 3, auMoinsDeux = false) {
  let v;
  do {
    v = point(t, max);
  } while (v.filter((x) => x !== 0).length < (auMoinsDeux ? 2 : 1));
  return v;
}

/** Un vecteur non nul orthogonal à n (n a au moins deux coordonnées non nulles). */
const orthogonalA = (n) => (n[0] !== 0 || n[1] !== 0 ? [n[1], -n[0], 0] : [0, n[2], -n[1]]);

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/**
 * Une manche à libellés : la bonne réponse, les pièges [libellé, phrase]
 * (null ou déjà juste : écarté), des voisins si besoin.
 */
function manche(t, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const valides = t.melanger(pieges).filter(([v]) => v !== null && v !== bonne);
  const liste = troisChoix(bonne, valides.map(([v]) => v), voisin);
  const table = {};
  valides.forEach(([v, phrase]) => {
    if (liste.includes(v) && !(v in table)) table[v] = phrase;
  });
  return {
    consigne, question, choix: cartes(t.melanger(liste)), bonne, pieges: table,
  };
}

/* ------------------------------------------------- un point sur la droite */

const AUCUNE = 'Aucune : M ∉ d';

function pointDroite(t) {
  const A = point(t, 4);
  const u = [nonNul(t, 3), nonNul(t, 3), nonNul(t, 3)];
  const t0 = nonNul(t, 3);
  const M = plus(A, fois(t0, u));
  const valeur = (x) => `t = ${ecrire(x)}`;
  const sur = t.entre(0, 1) === 1;
  let pieges;
  if (sur) {
    pieges = [[valeur(-t0), 'isoler-t'], [AUCUNE, 'meme-t-partout']];
  } else {
    M[2] += t.au([-2, -1, 1, 2]);
    const t1 = (M[2] - A[2]) / u[2];
    pieges = [[valeur(t0), 'tester-les-trois'], [Number.isInteger(t1) ? valeur(t1) : null, 'tester-les-trois']];
  }
  return manche(t, {
    consigne: 'point-droite',
    question: `${droite('d', A, u, 't')}\nM${triplet(M)} : pour quelle valeur de t a-t-on M ∈ d ?`,
    bonne: sur ? valeur(t0) : AUCUNE,
    pieges,
    voisin: (j) => valeur(t0 + j),
  });
}

/* ------------------------------------------------------ le vecteur normal */

/** Un plan : normal à au moins deux coordonnées non nulles, d non nul. */
function plan(t) {
  const n = vecteur(t, 4, true);
  let P0;
  do {
    P0 = point(t);
  } while (scal(n, P0) === 0);
  return [n, P0, -scal(n, P0)];
}

function vecteurNormal(t) {
  const [n, , d] = plan(t);
  const k = t.au([1, 1, -1, 2]);
  const bonne = triplet(fois(k, n));
  const piege = (v) => (nul(v) || colineaires(v, n) ? null : triplet(v));
  return manche(t, {
    consigne: 'vecteur-normal',
    question: `P : ${equation([...n, d])}\nLequel est un vecteur normal à P ?`,
    bonne,
    pieges: [
      [piege(n.map(Math.abs)), 'signe-des-coefficients'],
      [piege(orthogonalA(n)), 'directeur-pas-normal'],
      [piege([n[0], n[1], d]), 'normal-sans-d'],
    ],
    voisin: (j) => triplet([k * n[0] + j, k * n[1], k * n[2]]),
  });
}

/* ---------------------------------------------------- l'équation du plan */

function equationPlan(t) {
  const [n, A, d] = plan(t);
  const piege = (e) => (memePlan(e, [...n, d]) ? null : equation(e));
  return manche(t, {
    consigne: 'equation-plan',
    question: `Le plan P passe par A${triplet(A)} et admet n${triplet(n)} pour vecteur normal.\nUne équation de P ?`,
    bonne: equation([...n, d]),
    pieges: [
      [piege([...n, -d]), 'calcul-de-d'],
      [piege([...A, d]), 'point-et-normal'],
    ],
    voisin: (j) => equation([...n, d + j]),
  });
}

/* ------------------------------------------------------- un point du plan */

function pointPlan(t) {
  const [n, P0, d] = plan(t);
  const w = orthogonalA(n);
  const B = plus(P0, fois(t.entre(-1, 1), w));
  const Q = plus(fois(-1, P0), fois(t.entre(-1, 1), w));
  const dans = (M) => scal(n, M) + d === 0;
  const piege = (M) => (dans(M) ? null : triplet(M));
  const i = n.findIndex((x) => x !== 0);
  return manche(t, {
    consigne: 'point-plan',
    question: `P : ${equation([...n, d])}\nQuel point appartient à P ?`,
    bonne: triplet(B),
    pieges: [[piege(Q), 'signe-de-d'], [piege(n), 'normal-pas-point']],
    voisin: (j) => triplet(B.map((x, k) => (k === i ? x + j : x))),
  });
}

/* -------------------------------------------------------- l'orthogonalité */

function orthogonal(t) {
  let u;
  let v;
  let pos;
  let m;
  do {
    pos = t.entre(0, 1);
    u = [nonNul(t, 4), nonNul(t, 4), nonNul(t, 4)];
    v = [nonNul(t, 4), nonNul(t, 4), nonNul(t, 4)];
    v[pos] = nonNul(t, 2);
    u[pos] = 0;
    m = -scal(u, v) / v[pos];
  } while (!Number.isInteger(m) || m === 0 || Math.abs(m) > 20);
  const autre = 1 - pos;
  const m2 = -(u[autre] * v[autre]) / v[pos];
  const ecrit = u.map((x, k) => (k === pos ? 'm' : x));
  const valeur = (x) => `m = ${ecrire(x)}`;
  return manche(t, {
    consigne: 'orthogonal',
    question: `u${triplet(ecrit)} et v${triplet(v)}.\nPour quelle valeur de m sont-ils orthogonaux ?`,
    bonne: valeur(m),
    pieges: [[valeur(-m), 'isoler-m'], [Number.isInteger(m2) && m2 !== m ? valeur(m2) : null, 'scalaire-trois-coordonnees']],
    voisin: (j) => valeur(m + j),
  });
}

/* ------------------------------------------------------------ deux droites */

const POSITIONS = {
  paralleles: 'Parallèles',
  secantes: 'Sécantes',
  'non-coplanaires': 'Non coplanaires',
};

/** La phrase d'une mauvaise position : [la bonne][celle qu'on a choisie]. */
const ERREUR_DE_POSITION = {
  paralleles: { secantes: 'directeurs-colineaires', 'non-coplanaires': 'directeurs-colineaires' },
  secantes: { paralleles: 'directeurs-pas-colineaires', 'non-coplanaires': 'resoudre-le-systeme' },
  'non-coplanaires': { paralleles: 'directeurs-pas-colineaires', secantes: 'pas-paralleles-pas-secantes' },
};

function positions(sorte, t) {
  const A = point(t);
  const u = vecteur(t);
  let v;
  let B;
  if (sorte === 'paralleles') {
    v = fois(t.au([-2, -1, 2]), u);
    let w;
    do {
      w = vecteur(t);
    } while (colineaires(w, u));
    B = plus(A, w);
  } else {
    do {
      v = vecteur(t);
    } while (colineaires(u, v));
    if (sorte === 'secantes') {
      const I = plus(A, fois(t.entre(-2, 2), u));
      B = plus(I, fois(-t.entre(-2, 2), v));
    } else {
      let w;
      do {
        w = vecteur(t);
      } while (det(u, v, w) === 0);
      B = plus(A, w);
    }
  }
  return {
    consigne: 'positions',
    question: `${droite('d', A, u, 't')}\n${droite('d′', B, v, 's')}\nPosition relative de d et d′ ?`,
    choix: Object.entries(POSITIONS).map(([cle, libelle]) => ({ cle, libelle })),
    bonne: sorte,
    pieges: ERREUR_DE_POSITION[sorte],
  };
}

/* ------------------------------------------------------- trois vecteurs */

/** « Oui : w = 2u − v » ; un coefficient nul disparaît. */
export function combinaison(a, b) {
  const terme = (k, l) => (Math.abs(k) === 1 ? l : `${Math.abs(k)}${l}`);
  let s;
  if (a === 0) s = `${b < 0 ? '−' : ''}${terme(b, 'v')}`;
  else if (b === 0) s = `${a < 0 ? '−' : ''}${terme(a, 'u')}`;
  else s = `${a < 0 ? '−' : ''}${terme(a, 'u')} ${b < 0 ? '−' : '+'} ${terme(b, 'v')}`;
  return `Oui : w = ${s}`;
}

const NON = 'Non';

function coplanaires(t) {
  let u;
  let v;
  do {
    u = vecteur(t, 3);
    v = vecteur(t, 3);
  } while (colineaires(u, v));
  const [a, b] = [t.au([-2, -1, 1, 2, 3]), t.au([-2, -1, 1, 2, 3])];
  const w = plus(fois(a, u), fois(b, v));
  const cop = t.entre(0, 1) === 1;
  const echange = a !== b ? combinaison(b, a) : null;
  let pieges;
  if (cop) {
    pieges = [[echange, 'coefficients-a-verifier'], [NON, 'combinaison-existe']];
  } else {
    const n = vectoriel(u, v);
    const i = t.au([0, 1, 2].filter((k) => n[k] !== 0));
    w[i] += t.au([-1, 1]);
    pieges = [[combinaison(a, b), 'tester-les-trois'], [echange, 'tester-les-trois']];
  }
  return manche(t, {
    consigne: 'coplanaires',
    question: `u${triplet(u)}, v${triplet(v)}, w${triplet(w)}.\nCes trois vecteurs sont-ils coplanaires ?`,
    bonne: cop ? combinaison(a, b) : NON,
    pieges,
    voisin: (j) => combinaison(a + j, b),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const [p1, p2] = t.melanger(Object.keys(POSITIONS));
  const liste = [
    pointDroite(t),
    vecteurNormal(t),
    equationPlan(t),
    pointPlan(t),
    orthogonal(t),
    positions(p1, t),
    positions(p2, t),
    coplanaires(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'point-droite': 'Ce point est-il sur la droite ? Si oui, pour quelle valeur du paramètre ?',
  'vecteur-normal': 'Lis un vecteur normal sur l’équation cartésienne du plan.',
  'equation-plan': 'Trouve l’équation cartésienne de ce plan.',
  'point-plan': 'Lequel de ces points appartient au plan ?',
  orthogonal: 'Pour quelle valeur ces deux vecteurs sont-ils orthogonaux ?',
  positions: 'Ces deux droites sont-elles parallèles, sécantes, ou non coplanaires ?',
  coplanaires: 'Ces trois vecteurs sont-ils coplanaires ?',

  'isoler-t': 'Attention au signe en isolant le paramètre : on retranche la coordonnée du point de départ, puis on divise par celle du vecteur directeur.',
  'meme-t-partout': 'Isole le paramètre dans une équation, puis vérifie que cette même valeur convient aux deux autres : ici, elle convient.',
  'tester-les-trois': 'Une égalité de points ou de vecteurs se vérifie sur les trois coordonnées, pas seulement sur deux : ici, l’une d’elles ne colle pas.',
  'signe-des-coefficients': 'Le vecteur normal reprend les coefficients de x, y et z avec leurs signes : un moins devant y donne une coordonnée négative.',
  'directeur-pas-normal': 'Ce vecteur est dans le plan, pas normal à lui : son produit scalaire avec le vecteur des coefficients est nul.',
  'normal-sans-d': 'Le vecteur normal se lit sur les coefficients de x, y et z. Le nombre seul, d, n’en fait pas partie.',
  'calcul-de-d': 'Pour trouver d, remplace x, y et z par les coordonnées du point : la somme doit valoir zéro, donc d est l’opposé du reste.',
  'point-et-normal': 'Les coefficients de x, y et z sont ceux du vecteur normal, pas ceux du point : le point sert seulement à trouver d.',
  'signe-de-d': 'Remplace les coordonnées dans l’équation entière, le nombre d compris : on doit trouver zéro. Ce point donne l’opposé de d.',
  'normal-pas-point': 'Un vecteur normal n’est pas un point du plan : remplace les coordonnées dans l’équation pour vérifier.',
  'isoler-m': 'Attention au signe : en passant de l’autre côté de l’égalité, le reste du produit scalaire change de signe.',
  'scalaire-trois-coordonnees': 'Dans l’espace, le produit scalaire a trois termes : x par x, y par y, et z par z. N’oublie pas le dernier.',
  'directeurs-colineaires': 'Les vecteurs directeurs sont colinéaires : les droites sont parallèles. Elles ne peuvent être ni sécantes, ni non coplanaires.',
  'directeurs-pas-colineaires': 'Pour être parallèles, il faut des vecteurs directeurs colinéaires : ce n’est pas le cas ici.',
  'resoudre-le-systeme': 'Résous le système : il a une solution, donc les droites ont un point commun. Elles sont sécantes.',
  'pas-paralleles-pas-secantes': 'Dans l’espace, deux droites non parallèles ne se coupent pas forcément. Résous le système : ici, il n’a pas de solution.',
  'coefficients-a-verifier': 'Remplace les coefficients dans la combinaison et vérifie chaque coordonnée : l’ordre de u et de v compte.',
  'combinaison-existe': 'Cherche deux réels qui donnent w à partir de u et de v : ici, ils existent, donc les vecteurs sont coplanaires.',

  'point-droite-regle': 'Isole le paramètre dans une équation, puis vérifie cette valeur dans les deux autres. Si une seule ne colle pas, le point n’est pas sur la droite.',
  'vecteur-normal-regle': 'Le plan d’équation a x plus b y plus c z plus d égale zéro a pour vecteur normal le vecteur de coordonnées a, b, c, ou tout vecteur colinéaire.',
  'equation-plan-regle': 'Les coefficients de x, y et z sont les coordonnées du vecteur normal ; on trouve d en écrivant que le point vérifie l’équation.',
  'point-plan-regle': 'Remplace x, y et z par les coordonnées du point : il est dans le plan si l’on trouve exactement zéro.',
  'orthogonal-regle': 'Deux vecteurs sont orthogonaux quand leur produit scalaire est nul : x par x, plus y par y, plus z par z, égale zéro.',
  'positions-regle': 'Vecteurs directeurs colinéaires : parallèles. Sinon, résous le système : une solution, sécantes ; aucune, non coplanaires.',
  'coplanaires-regle': 'Trois vecteurs sont coplanaires si l’un s’écrit comme combinaison des deux autres. Cherche les coefficients, puis vérifie les trois coordonnées.',
};
