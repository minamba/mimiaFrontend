/**
 * FONCTIONS ET PARABOLES — 1re et terminale technologiques (Nora).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   1re techno : MATH_1TEC_PARABOLE_ASSOCIER, MATH_1TEC_PARABOLE_ELEMENTS,
 *                MATH_1TEC_POLY_RACINES, MATH_1TEC_DERIV_CALCULER,
 *                MATH_1TEC_DERIV_VARIATIONS, MATH_1TEC_DERIV_TANGENTE
 *   Tle techno : MATH_TTEC_INVERSE (étudier la fonction inverse et l'utiliser
 *                dans un problème) — le seul code de terminale techno sur les
 *                courbes de fonctions et leur dérivée.
 *
 * EN TERMINALE TECHNO, LA COURBE SUIVANTE : L'HYPERBOLE, sur ]0 ; +∞[.
 *   - LA DÉRIVÉE de px² + mx + c + a/x. LES PIÈGES : a/x² sans le signe moins,
 *     −a/x sans le carré, la constante gardée ;
 *   - LES VARIATIONS de ax + b/x (b = ak²) : f′(x) = a − b/x² s'annule en k.
 *     LES PIÈGES : le sens de variation inversé, s'arrêter à x² = k² ;
 *   - LE COÛT MOYEN MINIMAL C(x) = ax + c + b/x, atteint en x = k. LES PIÈGES :
 *     donner k (la position) pour le minimum, l'image de k² ;
 *   - LA TANGENTE à a/x + c : f′(x₀) = −a/x₀². LES PIÈGES : oublier (x − x₀),
 *     la dérivée sans signe moins, échanger pente et image.
 *
 * EN 1re TECHNO, SIX SORTES DE MANCHES, MÉLANGÉES :
 *   - ASSOCIER une parabole décrite en mots (sens, sommet, racines, un point)
 *     à ax², ax² + c ou a(x − x₁)(x − x₂). LES PIÈGES : le signe de a, le
 *     signe de c, le signe des racines (x + 1 s'annule en −1), diviser par
 *     l'abscisse au lieu de son carré ;
 *   - LIRE la forme factorisée : les racines, le sommet (au milieu des
 *     racines), le signe. LES PIÈGES : le signe des racines, prendre f(0)
 *     pour l'ordonnée du sommet, le signe de a entre les racines ;
 *   - L'AXE DE SYMÉTRIE de ax² + bx + c, sans formule : 0 et −b/a ont la même
 *     image. LES PIÈGES : le signe, oublier de prendre le milieu ;
 *   - LA DÉRIVÉE d'un polynôme de degré 2 ou 3. LES PIÈGES : ne pas
 *     multiplier par l'exposant, ne pas baisser l'exposant, garder la
 *     constante ;
 *   - LES VARIATIONS par le signe de f′ (degré 2 ou 3). LES PIÈGES : le sens
 *     du signe de f′, le signe des racines de f′ ;
 *   - LA TANGENTE : y = f′(a)(x − a) + f(a). LES PIÈGES : oublier (x − a),
 *     échanger pente et image.
 *
 * Toutes les bonnes réponses sont calculées ici, avec des coefficients
 * entiers ; un piège qui tomberait sur la bonne réponse est écarté.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'fonctions-et-paraboles', titre: 'Fonctions et paraboles', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE_TECHNO: {
    titre: 'Fonctions et paraboles',
    accroche: 'Paraboles, dérivées et tangentes.',
    competences: [
      'MATH_1TEC_PARABOLE_ASSOCIER', 'MATH_1TEC_PARABOLE_ELEMENTS', 'MATH_1TEC_POLY_RACINES',
      'MATH_1TEC_DERIV_CALCULER', 'MATH_1TEC_DERIV_VARIATIONS', 'MATH_1TEC_DERIV_TANGENTE',
    ],
  },
  TERMINALE_TECHNO: {
    titre: 'Fonctions et paraboles',
    accroche: 'Fonction inverse, coût moyen, tangentes.',
    competences: ['MATH_TTEC_INVERSE'],
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

/** Un entier, avec le vrai signe moins. */
const ent = (x) => (x < 0 ? `−${-x}` : `${x}`);

const PUISSANCES = ['', 'x', 'x²', 'x³'];

/** « 2x³ − 5x² + 3x − 7 » à partir des coefficients, du plus haut degré au plus bas. */
function poly(coefs) {
  const termes = [];
  coefs.forEach((c, i) => {
    const degre = coefs.length - 1 - i;
    if (c === 0) return;
    const abs = Math.abs(c);
    const corps = degre === 0 ? `${abs}` : `${abs === 1 ? '' : abs}${PUISSANCES[degre]}`;
    if (!termes.length) termes.push(`${c < 0 ? '−' : ''}${corps}`);
    else termes.push(`${c < 0 ? '−' : '+'} ${corps}`);
  });
  return termes.length ? termes.join(' ') : '0';
}

/** « (x − 3) », « (x + 1) », « x » pour la racine zéro. */
const facteur = (r) => {
  if (r === 0) return 'x';
  return r > 0 ? `(x − ${r})` : `(x + ${-r})`;
};

/** « −2(x + 1)(x − 3) ». */
function facto(a, x1, x2) {
  let tete = ent(a);
  if (a === 1) tete = '';
  if (a === -1) tete = '−';
  return `${tete}${facteur(x1)}${facteur(x2)}`;
}

const valeurEn = (coefs, x) => coefs.reduce((acc, c) => acc * x + c, 0);
const SIGNES = [-3, -2, -1, 1, 2, 3];

/** Deux racines entières non nulles, x₁ < x₂, et non opposées (sinon leur signe ne se voit pas). */
function racines(t, pair = false) {
  let x1;
  let x2;
  do {
    x1 = t.entre(-5, 5);
    x2 = t.entre(-5, 5);
  } while (x1 === 0 || x2 === 0 || x1 >= x2 || x1 === -x2 || (pair && (x1 + x2) % 2 !== 0));
  return [x1, x2];
}

const versLe = (a) => (a > 0 ? 'le haut' : 'le bas');

/* ---------------------------------------------------------------- associer */

function associer(sorte, t) {
  const a = t.au(SIGNES);
  if (sorte === 'sommet') {
    const c = t.entre(1, 6) * t.au([1, -1]);
    return manche(t.melanger, {
      consigne: 'associer',
      question: `Parabole tournée vers ${versLe(a)}, de sommet (0 ; ${ent(c)}). Son expression ?`,
      bonne: poly([a, 0, c]),
      pieges: [[poly([-a, 0, c]), 'sens-de-a'], [poly([a, 0, -c]), 'ordonnee-du-sommet']],
      voisin: (k) => poly([a, 0, c + k]),
    });
  }
  if (sorte === 'racines') {
    const [x1, x2] = racines(t);
    return manche(t.melanger, {
      consigne: 'associer',
      question: `Parabole tournée vers ${versLe(a)}, qui coupe l’axe des abscisses en ${ent(x1)} et en ${ent(x2)}. Son expression ?`,
      bonne: facto(a, x1, x2),
      pieges: [[facto(a, -x1, -x2), 'signe-des-racines'], [facto(-a, x1, x2), 'sens-de-a']],
      voisin: (k) => facto(a, x1 - k, x2 + k),
    });
  }
  const x0 = t.au([-3, -2, 2, 3]);
  const y = a * x0 * x0;
  return manche(t.melanger, {
    consigne: 'associer',
    question: `Parabole de sommet l’origine, qui passe par le point (${ent(x0)} ; ${ent(y)}). Son expression ?`,
    bonne: poly([a, 0, 0]),
    pieges: [[poly([y / x0, 0, 0]), 'carre-de-x'], [poly([-a, 0, 0]), 'point-sur-la-courbe']],
    voisin: (k) => poly([a + k * Math.sign(a), 0, 0]),
  });
}

/* ------------------------------------------------------------------- lire */

function lire(sorte, t) {
  const a = t.au(SIGNES);
  const [x1, x2] = racines(t, sorte === 'sommet');
  const f = facto(a, x1, x2);
  if (sorte === 'racines') {
    return manche(t.melanger, {
      consigne: 'lire',
      question: `f(x) = ${f}. Racines de f ?`,
      bonne: `${ent(x1)} et ${ent(x2)}`,
      pieges: [[`${ent(-x2)} et ${ent(-x1)}`, 'signe-des-racines']],
      voisin: (k) => `${ent(x1 - k)} et ${ent(x2 + k)}`,
    });
  }
  if (sorte === 'sommet') {
    const m = (x1 + x2) / 2;
    const ym = a * (m - x1) * (m - x2);
    return manche(t.melanger, {
      consigne: 'lire',
      question: `f(x) = ${f}. Sommet de la parabole ?`,
      bonne: `(${ent(m)} ; ${ent(ym)})`,
      pieges: [[`(${ent(m)} ; ${ent(a * x1 * x2)})`, 'ordonnee-a-l-origine'], [`(${ent(-m)} ; ${ent(ym)})`, 'signe-des-racines']],
      voisin: (k) => `(${ent(m)} ; ${ent(ym + k)})`,
    });
  }
  const interieur = t.au([true, false]);
  const intervalle = interieur
    ? `]${ent(x1)} ; ${ent(x2)}[`
    : t.au([`]−∞ ; ${ent(x1)}[`, `]${ent(x2)} ; +∞[`]);
  const positif = (interieur ? -a : a) > 0;
  const bonne = positif ? 'positif' : 'negatif';
  return {
    consigne: 'lire',
    question: `f(x) = ${f}. Signe de f(x) pour x ∈ ${intervalle} ?`,
    choix: [{ cle: 'positif', libelle: 'Positif' }, { cle: 'negatif', libelle: 'Négatif' }],
    bonne,
    pieges: { [positif ? 'negatif' : 'positif']: 'signe-hors-racines' },
  };
}

/* -------------------------------------------------------------------- axe */

function axe(t) {
  const a = t.au(SIGNES);
  let s = t.entre(-5, 5);
  if (s === 0) s = 2;
  const c = t.entre(-9, 9);
  return manche(t.melanger, {
    consigne: 'axe',
    question: `f(x) = ${poly([a, -2 * a * s, c])}. Axe de symétrie de la parabole ?`,
    bonne: `x = ${ent(s)}`,
    pieges: [[`x = ${ent(-s)}`, 'signe-de-l-axe'], [`x = ${ent(2 * s)}`, 'axe-au-milieu']],
    voisin: (k) => `x = ${ent(s + k)}`,
  });
}

/* ---------------------------------------------------------------- dérivée */

function derivee(t) {
  const degre = t.au([2, 3]);
  const a3 = degre === 3 ? t.au([-4, -3, -2, -1, 1, 2, 3, 4]) : 0;
  let a2 = t.entre(-6, 6);
  if (degre === 2 && a2 === 0) a2 = 3;
  const a1 = t.entre(-9, 9);
  let a0 = t.entre(-9, 9);
  if (a0 === 0) a0 = 5;
  const d = [3 * a3, 2 * a2, a1];
  const pieges = t.melanger([
    [poly([a3, a2, a1]), 'multiplier-par-l-exposant'],
    [poly([3 * a3, 2 * a2, a1, 0]), 'baisser-l-exposant'],
    // La constante gardée, ajoutée au terme constant de la dérivée.
    [poly([3 * a3, 2 * a2, a1 + a0]), 'constante-derivee-nulle'],
  ]);
  return manche(t.melanger, {
    consigne: 'derivee',
    question: `f(x) = ${poly([a3, a2, a1, a0])}. Dérivée f′(x) ?`,
    bonne: poly(d),
    pieges,
    voisin: (k) => poly([3 * a3, 2 * a2, a1 + k]),
  });
}

/* ------------------------------------------------------------- variations */

function variations(degre, t) {
  if (degre === 2) {
    const a = t.au(SIGNES);
    let s = t.entre(-5, 5);
    if (s === 0) s = -3;
    const c = t.entre(-9, 9);
    const sens = t.au(['croissante', 'décroissante']);
    // a > 0 : décroissante sur ]−∞ ; s], croissante sur [s ; +∞[ ; l'inverse si a < 0.
    const aGauche = (a > 0) === (sens === 'décroissante');
    const gauche = (x) => `]−∞ ; ${ent(x)}]`;
    const droite = (x) => `[${ent(x)} ; +∞[`;
    const cote = aGauche ? gauche : droite;
    return manche(t.melanger, {
      consigne: 'variations',
      question: `f(x) = ${poly([a, -2 * a * s, c])}. Sur quel intervalle f est-elle ${sens} ?`,
      bonne: cote(s),
      pieges: [[(aGauche ? droite : gauche)(s), 'signe-de-la-derivee'], [cote(-s), 'signe-de-l-axe']],
      voisin: (k) => cote(s + k),
    });
  }
  // f′(x) = 3a(x − p)(x − q) : f = ax³ − (3a/2)(p + q)x² + 3apq x + d, à coefficients entiers.
  const a = t.au([-2, -1, 1, 2]);
  let p;
  let q;
  do {
    p = t.entre(-4, 4);
    q = t.entre(-4, 4);
  } while (p >= q || (Math.abs(a) === 1 && (p + q) % 2 !== 0));
  const d = t.entre(-5, 5);
  const f = [a, (-3 * a * (p + q)) / 2, 3 * a * p * q, d];
  const sens = a > 0 ? 'décroissante' : 'croissante';
  return manche(t.melanger, {
    consigne: 'variations',
    question: `f(x) = ${poly(f)}. Sur quel intervalle f est-elle ${sens} ?`,
    bonne: `[${ent(p)} ; ${ent(q)}]`,
    pieges: [[`[${ent(q)} ; +∞[`, 'signe-de-la-derivee'], [`[${ent(-q)} ; ${ent(-p)}]`, 'signe-des-racines']],
    voisin: (k) => `[${ent(p - k)} ; ${ent(q)}]`,
  });
}

/* --------------------------------------------------------------- tangente */

function tangente(t) {
  const degre = t.au([2, 3]);
  let f;
  let x0;
  if (degre === 3) {
    f = [t.au([-2, -1, 1, 2]), t.entre(-3, 3), t.entre(-5, 5), t.entre(-5, 5)];
    x0 = t.au([-2, -1, 1, 2]);
  } else {
    f = [t.au(SIGNES), t.entre(-6, 6), t.entre(-9, 9)];
    x0 = t.au([-3, -2, -1, 1, 2, 3]);
  }
  const n = f.length - 1;
  const fPrime = f.slice(0, -1).map((c, i) => c * (n - i));
  const image = valeurEn(f, x0);
  const pente = valeurEn(fPrime, x0);
  const ordonnee = image - pente * x0;
  return manche(t.melanger, {
    consigne: 'tangente',
    question: `f(x) = ${poly(f)}. Tangente au point d’abscisse ${ent(x0)} ?`,
    bonne: `y = ${poly([pente, ordonnee])}`,
    pieges: [[`y = ${poly([pente, image])}`, 'tangente-en-a'], [`y = ${poly([image, pente])}`, 'pente-et-image']],
    voisin: (k) => `y = ${poly([pente + k, ordonnee])}`,
  });
}

/* ------------------------------------------------- terminale : l'hyperbole */

/** « 2x + 3 + 50/x », « −x² + 4x − 3/x² » : un polynôme suivi d'un terme en 1/x (ou 1/x² avec puissance « ² »). */
function avecInverse(coefs, a, puissance = '') {
  const tete = poly(coefs);
  const terme = `${Math.abs(a)}/x${puissance}`;
  if (tete === '0') return a < 0 ? `−${terme}` : terme;
  return `${tete} ${a < 0 ? '−' : '+'} ${terme}`;
}

/** « 8/x − 3 » : le terme en 1/x d'abord, la constante ensuite. */
const inverseEtConstante = (a, c) => `${a < 0 ? '−' : ''}${Math.abs(a)}/x${c ? ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}` : ''}`;

const SUR = 'sur ]0 ; +∞[';

function deriveeInverse(t) {
  const avecCarre = t.au([true, false]);
  const p = avecCarre ? t.au([-3, -2, -1, 1, 2, 3]) : 0;
  let m = t.entre(-6, 6);
  if (m === 0) m = 2;
  let c = avecCarre ? 0 : t.entre(-9, 9);
  if (!avecCarre && c === 0) c = 4;
  let a = t.entre(-20, 20);
  if (a === 0) a = 6;
  const derivee = (lin, inverse, puissance = '²') => avecInverse([2 * p, lin], inverse, puissance);
  return manche(t.melanger, {
    consigne: 'derivee',
    question: `f(x) = ${avecInverse([p, m, c], a)} ${SUR}. Dérivée f′(x) ?`,
    bonne: derivee(m, -a),
    pieges: t.melanger([
      [derivee(m, a), 'signe-derivee-inverse'],
      [derivee(m, -a, ''), 'signe-derivee-inverse'],
      [c ? derivee(m + c, -a) : null, 'constante-derivee-nulle'],
    ]),
    voisin: (k) => derivee(m + k, -a),
  });
}

function variationsInverse(t) {
  const a = t.au([1, -1]) * t.entre(1, 5);
  const k = t.entre(2, 6);
  const c = t.entre(-9, 9);
  const sens = t.au(['croissante', 'décroissante']);
  // f′(x) = a − ak²/x² = a(x² − k²)/x² : du signe de −a sur ]0 ; k[, de a au-delà.
  const aGauche = (a > 0) === (sens === 'décroissante');
  const gauche = (x) => `]0 ; ${x}]`;
  const droite = (x) => `[${x} ; +∞[`;
  const cote = aGauche ? gauche : droite;
  return manche(t.melanger, {
    consigne: 'variations',
    question: `f(x) = ${avecInverse([a, c], a * k * k)} ${SUR}. Sur quel intervalle f est-elle ${sens} ?`,
    bonne: cote(k),
    pieges: [[(aGauche ? droite : gauche)(k), 'signe-de-la-derivee'], [cote(k * k), 'x-carre-racine']],
    voisin: (j) => cote(k + j),
  });
}

function minimumCout(t) {
  const a = t.entre(1, 5);
  const k = t.entre(2, 10);
  const c = t.entre(0, 20);
  const cout = (x) => a * x + c + (a * k * k) / x;
  const euros = (x) => `${x} €`;
  return manche(t.melanger, {
    consigne: 'minimum',
    question: `Une entreprise fabrique x centaines de pièces (x > 0). Le coût moyen d’une pièce, en euros, est C(x) = ${avecInverse([a, c], a * k * k)}. Coût moyen minimal ?`,
    bonne: euros(cout(k)),
    pieges: [[euros(k), 'valeur-pas-position'], [euros(cout(k * k)), 'x-carre-racine']],
    voisin: (j) => euros(cout(k) + j),
  });
}

function tangenteInverse(t) {
  const x0 = t.entre(1, 4);
  const m = t.au([-4, -3, -2, -1, 1, 2, 3, 4]);
  const c = t.entre(-5, 5);
  // f(x) = m x₀² / x + c : f(x₀) = m x₀ + c, f′(x₀) = −m x₀² / x₀² = −m.
  const image = m * x0 + c;
  const pente = -m;
  const droite = (p, o) => `y = ${poly([p, o])}`;
  return manche(t.melanger, {
    consigne: 'tangente',
    question: `f(x) = ${inverseEtConstante(m * x0 * x0, c)} ${SUR}. Tangente au point d’abscisse ${x0} ?`,
    bonne: droite(pente, image - pente * x0),
    pieges: [
      [droite(pente, image), 'tangente-en-a'],
      [droite(m, image - m * x0), 'signe-derivee-inverse'],
      [droite(image, pente), 'pente-et-image'],
    ],
    voisin: (k) => droite(pente + k, image - pente * x0),
  });
}

function serieTerminale(t) {
  return [
    deriveeInverse(t), deriveeInverse(t),
    variationsInverse(t), variationsInverse(t),
    minimumCout(t),
    tangenteInverse(t), tangenteInverse(t),
    t.au([minimumCout, variationsInverse])(t),
  ];
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  if (niveau === 'TERMINALE_TECHNO') return t.melanger(serieTerminale(t));
  const [s1, s2] = t.melanger(['sommet', 'racines', 'point']);
  const liste = [
    associer(s1, t), associer(s2, t),
    lire(t.au(['racines', 'sommet', 'signe']), t),
    axe(t),
    derivee(t), derivee(t),
    variations(t.au([2, 3]), t),
    tangente(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  associer: 'Quelle expression correspond à cette parabole ?',
  lire: 'Lis la forme factorisée : racines, sommet ou signe.',
  axe: 'Trouve l’axe de symétrie de la parabole.',
  derivee: 'Calcule la fonction dérivée, terme à terme.',
  variations: 'Étudie le signe de f prime pour trouver le sens de variation.',
  tangente: 'Donne l’équation réduite de la tangente.',

  'sens-de-a': 'Le signe de a donne le sens : a positif, la parabole est tournée vers le haut ; a négatif, vers le bas.',
  'ordonnee-du-sommet': 'Pour a x carré plus c, le sommet a pour abscisse zéro et pour ordonnée c : regarde bien le signe de c.',
  'signe-des-racines': 'Le facteur x moins trois s’annule pour x égal trois, et x plus deux pour x égal moins deux : attention au signe des racines.',
  'carre-de-x': 'L’ordonnée du point vaut a fois le carré de son abscisse : divise par ce carré, pas par l’abscisse.',
  'point-sur-la-courbe': 'Remplace x par l’abscisse du point : l’image doit redonner exactement son ordonnée, signe compris.',
  'ordonnee-a-l-origine': 'Ce point est l’image de zéro, pas le sommet. Le sommet est au milieu des racines : calcule l’image de ce milieu.',
  'signe-hors-racines': 'Un polynôme du second degré a le signe de a à l’extérieur des racines, et le signe contraire entre elles.',
  'signe-de-l-axe': 'Attention au signe : zéro et moins b sur a ont la même image, et l’axe passe au milieu de ces deux nombres.',
  'axe-au-milieu': 'Zéro et moins b sur a ont la même image : l’axe passe au milieu, donc à la moitié de moins b sur a.',
  'multiplier-par-l-exposant': 'La dérivée de x puissance n, c’est n fois x puissance n moins un : multiplie par l’exposant.',
  'baisser-l-exposant': 'Après avoir multiplié par l’exposant, baisse-le de un : la dérivée de x carré est deux x.',
  'constante-derivee-nulle': 'La dérivée d’une constante est nulle : le terme constant disparaît.',
  'signe-de-la-derivee': 'Là où f prime est négative, f décroît ; là où elle est positive, f croît. Vérifie le signe de f prime sur cet intervalle.',
  'tangente-en-a': 'La tangente a pour équation y égal f prime de a fois x moins a, plus f de a : n’oublie pas le x moins a.',
  'pente-et-image': 'Le coefficient directeur de la tangente est le nombre dérivé f prime de a, pas l’image f de a.',

  'associer-regle': 'Le signe de a donne le sens de la parabole ; le sommet et les racines se lisent dans l’expression.',
  'lire-regle': 'Les racines annulent un facteur ; le sommet est au milieu des racines ; entre les racines, le signe est contraire à celui de a.',
  'axe-regle': 'Mets x en facteur dans a x carré plus b x : zéro et moins b sur a ont la même image, et l’axe passe juste au milieu.',
  'derivee-regle': 'Dérive terme à terme : n fois x puissance n moins un, et la constante disparaît.',
  'variations-regle': 'Calcule f prime, cherche où elle s’annule, étudie son signe : négative, f décroît ; positive, f croît.',
  'tangente-regle': 'Calcule f de a et f prime de a, puis écris y égal f prime de a fois x moins a, plus f de a.',

  // Terminale techno : la fonction inverse.
  minimum: 'Trouve le minimum de cette fonction à partir du signe de sa dérivée.',
  'signe-derivee-inverse': 'La dérivée de un sur x est moins un sur x carré : un signe moins, et x au carré au dénominateur.',
  'x-carre-racine': 'Tu as trouvé la valeur de x carré : prends sa racine carrée, positive ici puisque x est positif.',
  'valeur-pas-position': 'Ça, c’est l’abscisse où le minimum est atteint : le minimum, c’est l’image de ce nombre par la fonction.',
  'minimum-regle': 'Calcule la dérivée, trouve où elle s’annule, vérifie qu’elle passe du négatif au positif, puis calcule l’image de ce nombre.',
};
