/**
 * LA CONVEXITÉ — terminale générale, Nora (mathématiques).
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (classe TERMINALE) : MATH_TLE_CONVEXITE
 *
 * SEPT SORTES DE MANCHES (huit par partie, mélangées) :
 *   - LA DÉRIVÉE SECONDE d'un polynôme. LES PIÈGES : s'arrêter à f′, garder
 *     la constante de f′ ;
 *   - CONVEXE SUR UN INTERVALLE ? f est donnée, on lit le signe de f″ sur
 *     [a ; b] : convexe, concave, ou ni l'un ni l'autre (l'intervalle contient
 *     le point d'inflexion). LES PIÈGES : inverser convexe et concave, oublier
 *     le changement de signe ;
 *   - LE POINT D'INFLEXION d'une cubique dont f′ a deux racines entières.
 *     LE PIÈGE ROI : donner un extremum (racine de f′) ; et le signe ;
 *   - LES POINTS D'INFLEXION, f″ factorisée : une racine double annule f″
 *     sans changer son signe. LE PIÈGE : la compter quand même ;
 *   - LA COURBE ET SES TANGENTES (OU SES CORDES), f″ donnée sur un intervalle :
 *     au-dessus, au-dessous, ou ni l'un ni l'autre partout. LES PIÈGES :
 *     échanger tangentes et cordes, ignorer un changement de signe ;
 *   - LES FONCTIONS DE RÉFÉRENCE (banque écrite à la main) : x², eˣ, ln, √x,
 *     x³, 1/x, x⁴… LES PIÈGES : « ln est croissante donc convexe », x³
 *     convexe sur ℝ, x⁴ « a un point d'inflexion en 0 » ;
 *   - LE LIEN AVEC LES DÉRIVÉES (banque écrite à la main) : f′ croissante,
 *     f″ ≥ 0, ou seulement f′ ≥ 0 (on ne peut pas conclure).
 *
 * Tout ce qui se calcule est calculé ; les banques se vérifient à part (le
 * test recalcule le signe de chaque f″ sur des points de l'intervalle).
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'convexite', titre: 'La convexité', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'La convexité',
    accroche: 'Convexe, concave, et le point d’inflexion.',
    competences: ['MATH_TLE_CONVEXITE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------- écriture */

const ecrire = (x) => (x < 0 ? `−${-x}` : `${x}`);
const PUISSANCES = ['', 'x', 'x²', 'x³', 'x⁴'];

/** Un polynôme, du plus haut degré au plus bas : [a, b, c] → « ax² + bx + c ». */
export function polynome(coefs) {
  const degre = coefs.length - 1;
  const morceaux = [];
  coefs.forEach((k, i) => {
    if (k === 0) return;
    const p = PUISSANCES[degre - i];
    const corps = p && Math.abs(k) === 1 ? p : `${Math.abs(k)}${p}`;
    if (morceaux.length === 0) morceaux.push(k < 0 ? `−${corps}` : corps);
    else morceaux.push(`${k < 0 ? '−' : '+'} ${corps}`);
  });
  return morceaux.length ? morceaux.join(' ') : '0';
}

/** La dérivée d'un polynôme écrit du plus haut degré au plus bas. */
export const deriver = (coefs) => coefs.slice(0, -1).map((k, i) => k * (coefs.length - 1 - i));

/** « (x − 3) », « (x + 2) ». */
const facteur = (r) => (r > 0 ? `(x − ${r})` : `(x + ${-r})`);
/** Un coefficient devant un produit : rien pour 1, « − » pour −1. */
const devant = (k) => {
  if (k === 1) return '';
  return k === -1 ? '−' : ecrire(k);
};

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

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

/* --------------------------------------------------- la dérivée seconde */

function deriveeSeconde(t) {
  const e = t.au([0, 0, 1, -1]);
  const a = t.entre(1, 3) * t.au([1, -1]);
  const b = t.entre(-5, 5);
  const c = t.entre(1, 6) * t.au([1, -1]);
  const d = t.entre(-5, 5);
  const f = e === 0 ? [a, b, c, d] : [e, a, b, c, d];
  const f1 = deriver(f);
  const f2 = deriver(f1);
  const avecConstante = [...f2.slice(0, -1), f2[f2.length - 1] + c];
  return manche(t, {
    consigne: 'derivee-seconde',
    question: `f(x) = ${polynome(f)}\nf″(x) = ?`,
    bonne: polynome(f2),
    pieges: [[polynome(f1), 'deriver-deux-fois'], [polynome(avecConstante), 'constante-derivee']],
    voisin: (j) => polynome([...f2.slice(0, -1), f2[f2.length - 1] + j]),
  });
}

/* --------------------------------------------- convexe sur un intervalle */

const ALLURES = {
  convexe: 'Convexe',
  concave: 'Concave',
  ni: 'Ni convexe ni concave',
};

/** f est une cubique : f″(x) = 6ax + 2b s'annule en −b/(3a). */
function convexeSur(t) {
  const a = t.entre(1, 2) * t.au([1, -1]);
  const b = t.entre(-6, 6);
  const c = t.entre(-5, 5);
  const d = t.entre(-5, 5);
  const r = -b / (3 * a);
  const sorte = t.au(['gauche', 'droite', 'contient']);
  const long = t.entre(2, 5);
  let p;
  if (sorte === 'contient') p = Math.ceil(r) - t.entre(1, long - 1);
  else if (sorte === 'droite') p = Math.floor(r) + t.entre(1, 3);
  else p = Math.ceil(r) - t.entre(1, 3) - long;
  const q = p + long;
  let bonne;
  if (sorte === 'contient') bonne = 'ni';
  else bonne = (sorte === 'droite') === (a > 0) ? 'convexe' : 'concave';
  const pieges = bonne === 'ni'
    ? { convexe: 'changement-de-signe', concave: 'changement-de-signe' }
    : { [bonne === 'convexe' ? 'concave' : 'convexe']: 'convexe-positif', ni: 'signe-constant' };
  return {
    consigne: 'convexe-sur',
    question: `f(x) = ${polynome([a, b, c, d])}\nSur [${ecrire(p)} ; ${ecrire(q)}], f est :`,
    choix: t.melanger(Object.entries(ALLURES).map(([cle, libelle]) => ({ cle, libelle }))),
    bonne,
    pieges,
  };
}

/* ------------------------------------------------- le point d'inflexion */

/** f′(x) = 3a(x − p)(x − q) : extremums en p et q, inflexion au milieu. */
function inflexion(t) {
  const a = t.au([1, -1, 2, -2]);
  let p;
  let q;
  do {
    [p, q] = [t.entre(-4, 4), t.entre(-4, 4)];
  } while (p === q || (p + q) % 2 !== 0);
  const r = (p + q) / 2;
  const f = [a, -3 * a * r, 3 * a * p * q, t.entre(-5, 5)];
  const valeur = (x) => `x = ${ecrire(x)}`;
  return manche(t, {
    consigne: 'inflexion',
    question: `f(x) = ${polynome(f)}\nAbscisse du point d’inflexion de la courbe de f ?`,
    bonne: valeur(r),
    pieges: [[valeur(p), 'extremum-pas-inflexion'], [valeur(q), 'extremum-pas-inflexion'], [valeur(-r), 'resoudre-signe']],
    voisin: (j) => valeur(r + j),
  });
}

/* --------------------------------------- les points d'inflexion, f″ factorisée */

function pointsInflexion(t) {
  const k = t.au([1, 2, 3, -1, -2]);
  let p;
  let q;
  do {
    [p, q] = [t.entre(-4, 4), t.entre(-4, 4)];
  } while (p === q || p === 0 || q === 0);
  const double = t.entre(0, 1) === 1;
  const [lo, hi] = p < q ? [p, q] : [q, p];
  const seul = (x) => `x = ${ecrire(x)} seulement`;
  const deux = `x = ${ecrire(lo)} et x = ${ecrire(hi)}`;
  const expression = double ? `${devant(k)}${facteur(p)}²${facteur(q)}` : `${devant(k)}${facteur(p)}${facteur(q)}`;
  const bonne = double ? seul(q) : deux;
  const pieges = double
    ? { [seul(p)]: 'annule-sans-changer', [deux]: 'annule-sans-changer' }
    : { [seul(lo)]: 'deux-changements', [seul(hi)]: 'deux-changements' };
  return {
    consigne: 'points-inflexion',
    question: `f″(x) = ${expression}\nOù la courbe de f a-t-elle un point d’inflexion ?`,
    choix: cartes(t.melanger([seul(lo), seul(hi), deux])),
    bonne,
    pieges,
  };
}

/* --------------------------------------------- les tangentes et les cordes */

/** [f″(x), intervalle, signe] — signe : '+' (≥ 0), '−' (≤ 0), '±' (change de signe). */
export const SECONDES = [
  ['x² + 1', 'ℝ', '+'],
  ['eˣ', 'ℝ', '+'],
  ['e^(−x)', 'ℝ', '+'],
  ['1/x²', ']0 ; +∞[', '+'],
  ['4 + cos x', 'ℝ', '+'],
  ['x⁴ + 3', 'ℝ', '+'],
  ['6x', ']0 ; +∞[', '+'],
  ['1/x', ']0 ; +∞[', '+'],
  ['−2', 'ℝ', '−'],
  ['−x² − 1', 'ℝ', '−'],
  ['−eˣ', 'ℝ', '−'],
  ['−1/x²', ']0 ; +∞[', '−'],
  ['sin x − 2', 'ℝ', '−'],
  ['−6x', ']0 ; +∞[', '−'],
  ['x − 1', 'ℝ', '±'],
  ['x³', 'ℝ', '±'],
  ['cos x', 'ℝ', '±'],
  ['eˣ − 1', 'ℝ', '±'],
  ['ln x', ']0 ; +∞[', '±'],
  ['x² − 4', 'ℝ', '±'],
];

const COTES = {
  dessus: 'Au-dessus',
  dessous: 'Au-dessous',
  aucun: 'Ni l’un ni l’autre partout',
};

function positionCourbe([f2, intervalle, signe], t) {
  const objet = t.au(['tangentes', 'cordes']);
  let bonne;
  if (signe === '±') bonne = 'aucun';
  else bonne = (signe === '+') === (objet === 'tangentes') ? 'dessus' : 'dessous';
  const pieges = bonne === 'aucun'
    ? { dessus: 'changement-de-signe', dessous: 'changement-de-signe' }
    : { [bonne === 'dessus' ? 'dessous' : 'dessus']: 'tangentes-et-cordes', aucun: 'signe-constant' };
  return {
    consigne: 'position-courbe',
    question: `f″(x) = ${f2} sur ${intervalle}.\nSur cet intervalle, par rapport à ses ${objet}, la courbe de f est :`,
    choix: t.melanger(Object.entries(COTES).map(([cle, libelle]) => ({ cle, libelle }))),
    bonne,
    pieges,
  };
}

/* -------------------------------------------- les fonctions de référence */

/** [fonction, intervalle, allure, la phrase d'un choix tentant mais faux]. */
export const REFERENCES = [
  ['x ↦ x²', 'ℝ', 'convexe'],
  ['x ↦ eˣ', 'ℝ', 'convexe'],
  ['x ↦ e^(−x)', 'ℝ', 'convexe'],
  ['x ↦ x⁴', 'ℝ', 'convexe'],
  ['x ↦ x³', '[0 ; +∞[', 'convexe'],
  ['x ↦ 1/x', ']0 ; +∞[', 'convexe'],
  ['x ↦ ln x', ']0 ; +∞[', 'concave'],
  ['x ↦ √x', ']0 ; +∞[', 'concave'],
  ['x ↦ −x²', 'ℝ', 'concave'],
  ['x ↦ 1/x', ']−∞ ; 0[', 'concave'],
  ['x ↦ cos x', '[−π/2 ; π/2]', 'concave'],
  ['x ↦ sin x', '[0 ; π]', 'concave'],
  ['x ↦ x³', 'ℝ', 'ni'],
];

/** Les erreurs nommées : ln et √ croissantes mais concaves ; x⁴ dont f″ s'annule sans changer de signe. */
function piegesReference(fonction, allure) {
  if (allure === 'ni') return { convexe: 'changement-de-signe', concave: 'changement-de-signe' };
  const contraire = allure === 'convexe' ? 'concave' : 'convexe';
  const croissanteConcave = fonction === 'x ↦ ln x' || fonction === 'x ↦ √x';
  return {
    [contraire]: croissanteConcave ? 'croissante-pas-convexe' : 'convexe-concave',
    ni: fonction === 'x ↦ x⁴' ? 'annule-sans-changer' : 'signe-constant',
  };
}

function reference([fonction, intervalle, allure], t) {
  return {
    consigne: 'reference',
    question: `${fonction} sur ${intervalle}.\nCette fonction est :`,
    choix: t.melanger(Object.entries(ALLURES).map(([cle, libelle]) => ({ cle, libelle }))),
    bonne: allure,
    pieges: piegesReference(fonction, allure),
  };
}

/* ---------------------------------------------- le lien avec les dérivées */

const CONCLUSIONS = {
  convexe: 'Convexe',
  concave: 'Concave',
  rien: 'On ne peut pas conclure',
};

/** [hypothèse, conclusion, la phrase si l'on conclut à tort]. */
export const LIENS = [
  ['f′ est croissante sur I.', 'convexe'],
  ['f′ est décroissante sur I.', 'concave'],
  ['f″(x) ≥ 0 pour tout x de I.', 'convexe'],
  ['f″(x) ≤ 0 pour tout x de I.', 'concave'],
  ['La courbe de f est au-dessus de toutes ses tangentes sur I.', 'convexe'],
  ['La courbe de f est au-dessus de toutes ses cordes sur I.', 'concave'],
  ['f est croissante sur I.', 'rien', 'croissante-pas-convexe'],
  ['f′(x) ≥ 0 pour tout x de I.', 'rien', 'signe-de-f-prime'],
  ['f′(x) ≤ 0 pour tout x de I.', 'rien', 'signe-de-f-prime'],
];

function lien([hypothese, conclusion, phrase], t) {
  const pieges = conclusion === 'rien'
    ? { convexe: phrase, concave: phrase }
    : { [conclusion === 'convexe' ? 'concave' : 'convexe']: 'convexe-concave', rien: 'lien-derivee-regle' };
  return {
    consigne: 'lien-derivee',
    question: `f est deux fois dérivable sur un intervalle I.\n${hypothese}\nAlors, sur I, f est :`,
    choix: Object.entries(CONCLUSIONS).map(([cle, libelle]) => ({ cle, libelle })),
    bonne: conclusion,
    pieges,
  };
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const liste = [
    deriveeSeconde(t),
    convexeSur(t),
    convexeSur(t),
    inflexion(t),
    pointsInflexion(t),
    positionCourbe(t.au(SECONDES), t),
    reference(t.au(REFERENCES), t),
    lien(t.au(LIENS), t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'derivee-seconde': 'Calcule la dérivée seconde de cette fonction.',
  'convexe-sur': 'Sur cet intervalle, la fonction est-elle convexe, concave, ou ni l’un ni l’autre ?',
  inflexion: 'Trouve l’abscisse du point d’inflexion.',
  'points-inflexion': 'Où la dérivée seconde change-t-elle de signe ?',
  'position-courbe': 'La courbe est-elle au-dessus, ou au-dessous ?',
  reference: 'Cette fonction de référence est-elle convexe, ou concave ?',
  'lien-derivee': 'Que peut-on conclure sur la convexité ?',

  'deriver-deux-fois': 'Ça, c’est la dérivée première. La dérivée seconde est la dérivée de la dérivée : dérive une deuxième fois.',
  'constante-derivee': 'En dérivant une deuxième fois, le terme constant de la dérivée première disparaît : la dérivée d’une constante est nulle.',
  'convexe-positif': 'Dérivée seconde positive ou nulle : convexe, la courbe est en creux. Négative ou nulle : concave.',
  'signe-constant': 'Ici, la dérivée seconde garde le même signe sur tout l’intervalle : la fonction est convexe, ou concave.',
  'changement-de-signe': 'La dérivée seconde change de signe sur l’intervalle : la fonction est convexe d’un côté, concave de l’autre.',
  'extremum-pas-inflexion': 'Là, c’est la dérivée première qui s’annule : c’est un extremum. Un point d’inflexion, c’est la dérivée seconde qui change de signe.',
  'resoudre-signe': 'Attention au signe en résolvant : dérivée seconde égale à zéro, isole x avec soin.',
  'annule-sans-changer': 'Un facteur au carré annule la dérivée seconde sans changer son signe : pas de point d’inflexion à cet endroit.',
  'deux-changements': 'Deux facteurs simples, deux changements de signe : il y a deux points d’inflexion.',
  'tangentes-et-cordes': 'Convexe : au-dessus de ses tangentes, au-dessous de ses cordes. Concave : c’est l’inverse.',
  'croissante-pas-convexe': 'Croissante ne veut pas dire convexe : le sens de variation dépend de la dérivée première, la convexité de la dérivée seconde.',
  'convexe-concave': 'Convexe : la dérivée première croît, la dérivée seconde est positive, la courbe est en creux. Concave : tout l’inverse.',
  'signe-de-f-prime': 'Le signe de la dérivée première donne le sens de variation, pas la convexité. Pour la convexité, il faut savoir si la dérivée première croît.',

  'derivee-seconde-regle': 'Dérive une première fois, puis dérive le résultat : x puissance n devient n fois x puissance n moins un, à chaque fois.',
  'convexe-sur-regle': 'Calcule la dérivée seconde et étudie son signe sur l’intervalle : positive, convexe ; négative, concave ; si elle change de signe, ni l’un ni l’autre.',
  'inflexion-regle': 'Le point d’inflexion est là où la dérivée seconde s’annule en changeant de signe.',
  'points-inflexion-regle': 'Un point d’inflexion, c’est un changement de signe de la dérivée seconde. Fais son tableau de signes, facteur par facteur.',
  'position-courbe-regle': 'Convexe : au-dessus des tangentes, au-dessous des cordes. Concave : l’inverse. Si la dérivée seconde change de signe, aucune position ne vaut partout.',
  'reference-regle': 'Calcule la dérivée seconde de la fonction et regarde son signe sur l’intervalle.',
  'lien-derivee-regle': 'Dérivée première croissante, ou dérivée seconde positive : convexe. Dérivée première décroissante, ou dérivée seconde négative : concave.',
};
