/**
 * LE SECOND DEGRÉ — Nora, en 1re générale (spécialité mathématiques).
 *
 * Huit sortes de manches, une par partie, dans le désordre ; les trinômes
 * sont construits à partir de leurs racines ou de leur forme canonique, pour
 * que tout tombe juste, et chaque réponse est CALCULÉE ici :
 *   - le discriminant. PIÈGES : le signe de 4ac (b² + 4ac), le carré d'un
 *     négatif écrit −b², b² confondu avec 2b ;
 *   - le nombre de racines selon le signe de Δ ;
 *   - les racines (−b ± √Δ)/(2a). PIÈGES : (b ± √Δ)/(2a), qui donne les
 *     opposées, et la division par a au lieu de 2a, qui les double ;
 *   - la forme canonique. PIÈGES : le signe de α, β = c (α² non retranché),
 *     α² non multiplié par a ;
 *   - le sommet. PIÈGES : α = b/(2a) sans le moins, β pris égal à c, le
 *     signe de α lu dans a(x − α)² + β ;
 *   - le signe d'un trinôme factorisé. PIÈGES : le signe de a oublié (« du
 *     signe de a à l'extérieur des racines »), les crochets ;
 *   - la somme et le produit des racines, S = −b/a et P = c/a. PIÈGES : −b/a
 *     sans le moins, S et P échangés, la division par a oubliée ;
 *   - le trinôme qui s'annule en deux nombres donnés. PIÈGES : le signe des
 *     racines dans les facteurs, la règle des signes du produit.
 *
 * LE DESSIN (09/10/2026) : cinq sortes portent un `visuel` (voir
 * `lib/jeux/visuels.js`), la parabole du trinôme de la question, sans aucun
 * tirage — la même graine redonne la même partie. La fenêtre est centrée sur
 * le sommet et montre les racines ; on ne marque que ce que la question donne
 * (les racines du signe et du trinôme à trouver), jamais ce qu'elle demande.
 * Pas de dessin pour Δ, la somme et le produit (des calculs), ni pour le
 * nombre de racines : la courbe le donnerait sans calcul, et une parabole qui
 * frôle l'axe s'y lirait mal.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';
import { valeur as ordonneeEn } from '../visuels.js';

export const FAMILLE = { cle: 'second-degre', titre: 'Le second degré', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Le second degré',
    accroche: 'Delta, racines, sommet et signe.',
    competences: [
      'MATH_1RE_TRINOME_RACINES', 'MATH_1RE_TRINOME_SIGNE', 'MATH_1RE_TRINOME_FORME',
      'MATH_1RE_TRINOME_FACTORISER', 'MATH_1RE_TRINOME_DEUX_RACINES',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ l'écriture */

/** « −3 », « 2,5 » : le signe moins typographique, la virgule. */
function nb(x) {
  let r = Math.round(x * 1e6) / 1e6;
  if (Object.is(r, -0)) r = 0;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
}

const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
/** « −5/2 », « 3 » : une fraction irréductible, le signe devant. */
function fr(n, d = 1) {
  let [a, b] = d < 0 ? [-n, -d] : [n, d];
  const g = pgcd(Math.abs(a), b) || 1;
  [a, b] = [a / g, b / g];
  const s = a < 0 ? '−' : '';
  return b === 1 ? `${s}${Math.abs(a)}` : `${s}${Math.abs(a)}/${b}`;
}
/** « {−5/2 ; 3} » : un ensemble de solutions rangé dans l'ordre. */
function ensemble(valeurs) {
  const vus = new Map();
  valeurs.forEach(([n, d]) => vus.set(fr(n, d), n / d));
  const tri = [...vus.entries()].sort((x, y) => x[1] - y[1]).map(([s]) => s);
  return `{${tri.join(' ; ')}}`;
}

/** « 2x² − 3x + 1 » : coefficients du plus haut degré au plus bas. */
function poly(coefs) {
  const deg = coefs.length - 1;
  let s = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const k = deg - i;
    const lettre = ['', 'x', 'x²', 'x³'][k];
    const abs = Math.abs(c);
    const corps = abs === 1 && k > 0 ? lettre : `${nb(abs)}${lettre}`;
    if (s === '') s = (c < 0 ? '−' : '') + corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}
/** « 2 », « − », « » : un coefficient devant une parenthèse. */
const devant = (a) => {
  if (a === 1) return '';
  if (a === -1) return '−';
  return nb(a);
};
/** « (x − 3) », « (x + 2) », « x » : le facteur qui s'annule en r. */
const facteur = (r) => {
  if (r === 0) return 'x';
  return r > 0 ? `(x − ${nb(r)})` : `(x + ${nb(-r)})`;
};
/** « 2(x − 3)² + 5 » */
function canonique(a, alpha, beta) {
  let s = `${devant(a)}${facteur(alpha) === 'x' ? 'x' : facteur(alpha)}²`;
  if (beta > 0) s += ` + ${nb(beta)}`;
  if (beta < 0) s += ` − ${nb(-beta)}`;
  return s;
}
const point = (x, y) => `(${x} ; ${y})`;

/* ------------------------------------------------------------ le dessin */

// « + 0 » : jamais de −0, qu’un aller-retour JSON ne redonnerait pas.
const arrondi = (x) => Math.round(x * 100) / 100 + 0;

/**
 * La parabole de ax² + bx + c ([a, b, c], comme `poly`) : fenêtre centrée sur
 * le sommet, assez large pour les abscisses `aVoir` (les racines), l'axe des x
 * toujours visible ; `points` marqués en plus.
 */
function parabole([a, b, c], aVoir = [], points = []) {
  const alpha = -b / (2 * a);
  const demi = Math.max(3, ...aVoir.map((x) => Math.abs(x - alpha) + 1.5));
  const [xmin, xmax] = [arrondi(alpha - demi), arrondi(alpha + demi)];
  const f = { forme: 'poly', coefs: [c + 0, b + 0, a] };
  const ys = [0];
  for (let i = 0; i <= 48; i += 1) ys.push(ordonneeEn(f, xmin + ((xmax - xmin) * i) / 48));
  const air = Math.max((Math.max(...ys) - Math.min(...ys)) * 0.1, 0.5);
  return {
    type: 'courbe',
    fenetre: {
      xmin, xmax, ymin: arrondi(Math.min(...ys) - air), ymax: arrondi(Math.max(...ys) + air),
    },
    fonctions: [f],
    ...(points.length ? { points } : {}),
  };
}

/* ---------------------------------------------------------- les manches */

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche : la bonne réponse, ses pièges nommés (jamais justes), des voisins s'il en manque. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin,
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
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
}

const nonNul = (entre, a, b) => {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
};

/**
 * Un trinôme à deux racines rationnelles : (x − r)(ax − m), racines r et m/a.
 * Rend [a, b, c] et les racines [[r, 1], [m, a]], distinctes et non opposées.
 */
function aRacines({ au, entre }) {
  let a;
  let r;
  let m;
  do {
    a = au([1, 2, 3, -1, -2]);
    r = entre(-5, 5);
    m = entre(-6, 6);
  } while (a * r === m || a * r === -m);
  return { coefs: [a, -(a * r + m), m * r], racines: [[r, 1], [m, a]] };
}

/* --------------------------------------------------------- discriminant */

function discriminant({ au, entre, melanger }) {
  const a = au([1, 2, 3, -1, -2, -3]);
  const b = nonNul(entre, -9, 9);
  const c = nonNul(entre, -9, 9);
  const delta = b * b - 4 * a * c;
  return manche(melanger, {
    consigne: 'discriminant',
    question: `Pour f(x) = ${poly([a, b, c])}, que vaut Δ ?`,
    bonne: nb(delta),
    pieges: [
      [nb(b * b + 4 * a * c), 'delta-signe'],
      b < 0 ? [nb(-b * b - 4 * a * c), 'carre-d-un-negatif'] : [nb(2 * b - 4 * a * c), 'carre-pas-double'],
    ],
    voisin: (k) => nb(delta + 4 * k),
  });
}

const AUCUNE = 'aucune racine';
const UNE = 'une seule racine';
const DEUX = 'deux racines';

function nombreRacines({ au, entre, melanger }) {
  const cas = au(['negatif', 'nul', 'positif']);
  let coefs;
  if (cas === 'nul') {
    const a = au([1, 2, 3, -1, -2]);
    const r = nonNul(entre, -5, 5);
    coefs = [a, -2 * a * r, a * r * r];
  } else {
    let delta;
    do {
      coefs = [au([1, 2, 3, -1, -2, -3]), nonNul(entre, -8, 8), nonNul(entre, -9, 9)];
      delta = coefs[1] ** 2 - 4 * coefs[0] * coefs[2];
    } while (cas === 'negatif' ? delta >= 0 : delta <= 0);
  }
  const bonne = { negatif: AUCUNE, nul: UNE, positif: DEUX }[cas];
  const phrase = { negatif: 'delta-negatif', nul: 'delta-nul', positif: 'delta-positif' }[cas];
  const pieges = {};
  [AUCUNE, UNE, DEUX].filter((c) => c !== bonne).forEach((c) => { pieges[c] = phrase; });
  return {
    consigne: 'nombre-racines',
    question: `Combien de racines réelles a ${poly(coefs)} ?`,
    choix: cartes(melanger([AUCUNE, UNE, DEUX])),
    bonne,
    pieges,
  };
}

/* ---------------------------------------------------------------- racines */

function racines(t) {
  const { coefs, racines: [[r, d1], [m, a]] } = aRacines(t);
  const resultat = manche(t.melanger, {
    consigne: 'racines',
    question: `Résous ${poly(coefs)} = 0`,
    bonne: ensemble([[r, d1], [m, a]]),
    pieges: [[ensemble([[-r, d1], [-m, a]]), 'racines-moins-b'], [ensemble([[2 * r, d1], [2 * m, a]]), 'racines-deux-a']],
    voisin: (k) => ensemble([[r + k, d1], [m, a]]),
  });
  // La parabole coupe l'axe aux racines, qu'on ne marque pas : on les calcule.
  return { ...resultat, visuel: parabole(coefs, [r, m / a]) };
}

/* ------------------------------------------------------- forme canonique */

function formeCanonique({ au, entre, melanger }) {
  const a = au([1, 1, 2, -1, 3, -2]);
  const alpha = nonNul(entre, -5, 5);
  const beta = entre(-9, 9);
  const c = a * alpha * alpha + beta;
  const m = manche(melanger, {
    consigne: 'canonique',
    question: `Forme canonique de ${poly([a, -2 * a * alpha, c])} ?`,
    bonne: canonique(a, alpha, beta),
    pieges: [
      [canonique(a, -alpha, beta), 'canonique-alpha-signe'],
      a === 1
        ? [canonique(1, alpha, c), 'canonique-beta']
        : [canonique(a, alpha, beta + (a - 1) * alpha * alpha), 'canonique-facteur-a'],
    ],
    voisin: (k) => canonique(a, alpha, beta + k),
  });
  return { ...m, visuel: parabole([a, -2 * a * alpha, c]) };
}

/* ------------------------------------------------------------------ sommet */

function sommet({ au, entre, melanger }) {
  const a = au([1, 2, -1, 3, -2]);
  const alpha = nonNul(entre, -5, 5);
  const beta = entre(-9, 9);
  const f = (x) => a * (x - alpha) ** 2 + beta;
  // La parabole, sans marquer le sommet : c'est lui qu'on cherche.
  const visuel = parabole([a, -2 * a * alpha, f(0)]);
  if (au([true, false])) {
    const c = f(0);
    const m = manche(melanger, {
      consigne: 'sommet',
      question: `Sommet de la parabole de f(x) = ${poly([a, -2 * a * alpha, c])} ?`,
      bonne: point(nb(alpha), nb(beta)),
      pieges: [[point(nb(-alpha), nb(f(-alpha))), 'sommet-moins-b'], [point(nb(alpha), nb(c)), 'sommet-image']],
      voisin: (k) => point(nb(alpha), nb(beta + k)),
    });
    return { ...m, visuel };
  }
  const m = manche(melanger, {
    consigne: 'sommet',
    question: `Sommet de la parabole de f(x) = ${canonique(a, alpha, beta)} ?`,
    bonne: point(nb(alpha), nb(beta)),
    pieges: [[point(nb(-alpha), nb(beta)), 'canonique-alpha-signe'], [point(nb(beta), nb(alpha)), 'sommet-ordre']],
    voisin: (k) => point(nb(alpha), nb(beta + k)),
  });
  return { ...m, visuel };
}

/* ------------------------------------------------------------------- signe */

function signe({ au, entre, melanger }) {
  const a = au([1, 2, 3, -1, -2, -3]);
  const x1 = entre(-6, 3);
  const x2 = x1 + entre(1, 6);
  const op = au(['>', '<', '≥', '≤']);
  const strict = op === '>' || op === '<';
  const positif = op === '>' || op === '≥';
  // Entre les racines, le trinôme a le signe de −a.
  const dedans = (a < 0) === positif;
  const [A, B] = [nb(x1), nb(x2)];
  const interieur = (s) => (s ? `]${A} ; ${B}[` : `[${A} ; ${B}]`);
  const exterieur = (s) => (s ? `]−∞ ; ${A}[ ∪ ]${B} ; +∞[` : `]−∞ ; ${A}] ∪ [${B} ; +∞[`);
  const m = manche(melanger, {
    consigne: 'signe',
    // « 2x(x − 3) » plutôt que « 2(x − 3)x » quand une racine est nulle.
    question: `Résous ${devant(a)}${x2 === 0 ? `x${facteur(x1)}` : `${facteur(x1)}${facteur(x2)}`} ${op} 0`,
    bonne: dedans ? interieur(strict) : exterieur(strict),
    pieges: [
      [dedans ? exterieur(strict) : interieur(strict), 'signe-de-a'],
      [dedans ? interieur(!strict) : exterieur(!strict), 'inegalite-stricte'],
    ],
    voisin: (k) => (dedans ? `]${A} ; ${nb(x2 + k)}[` : `]−∞ ; ${nb(x1 - k)}[ ∪ ]${B} ; +∞[`),
  });
  // La parabole et ses racines, données par la forme factorisée : le signe se lit de part et d'autre.
  return {
    ...m,
    visuel: parabole([a, -a * (x1 + x2), a * x1 * x2], [x1, x2], [{ x: x1, y: 0 }, { x: x2, y: 0 }]),
  };
}

/* ------------------------------------------------------- somme et produit */

const sp = (s, p) => `S = ${s} ; P = ${p}`;

function sommeProduit(t) {
  const { coefs: [a, b, c] } = aRacines(t);
  const S = fr(-b, a);
  const P = fr(c, a);
  return manche(t.melanger, {
    consigne: 'somme-produit',
    question: `${poly([a, b, c])} = 0 a deux racines. Leur somme S et leur produit P ?`,
    bonne: sp(S, P),
    pieges: [
      [sp(fr(b, a), P), 'somme-moins-b-sur-a'],
      a !== 1 ? [sp(nb(-b), nb(c)), 'diviser-par-a'] : null,
      [sp(P, S), 'somme-produit-echange'],
    ].filter(Boolean),
    voisin: (k) => sp(S, fr(c + k * a, a)),
  });
}

/* ------------------------------------------------ deux racines données */

function deuxRacines({ entre, melanger }) {
  let r1;
  let r2;
  do {
    r1 = nonNul(entre, -6, 6);
    r2 = nonNul(entre, -6, 6);
  } while (r1 === r2 || r1 === -r2);
  const m = manche(melanger, {
    consigne: 'deux-racines',
    question: `Quel trinôme, avec a = 1, s’annule en ${nb(r1)} et en ${nb(r2)} ?`,
    bonne: poly([1, -(r1 + r2), r1 * r2]),
    pieges: [[poly([1, r1 + r2, r1 * r2]), 'racines-signe-facteur'], [poly([1, -(r1 + r2), -r1 * r2]), 'regle-des-signes']],
    voisin: (k) => poly([1, -(r1 + r2), r1 * r2 + k]),
  });
  // La parabole qui passe par les deux racines données (marquées) ; son
  // ordonnée à l'origine, le produit r1 × r2, se vérifie sur l'axe.
  return {
    ...m,
    visuel: parabole([1, -(r1 + r2), r1 * r2], [r1, r2, 0], [{ x: r1, y: 0 }, { x: r2, y: 0 }]),
  };
}

/* ------------------------------------------------------------ la partie */

const SORTES = [discriminant, nombreRacines, racines, formeCanonique, sommet, signe, sommeProduit, deuxRacines];

// Une seule classe : la 1re générale. Les huit sortes, une fois chacune.
export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  return t.melanger(SORTES.map((f) => f(t)));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  discriminant: 'Calcule le discriminant.',
  'nombre-racines': 'Combien de racines ? Regarde le signe du discriminant.',
  racines: 'Résous cette équation du second degré.',
  canonique: 'Trouve la forme canonique.',
  sommet: 'Trouve le sommet de la parabole.',
  signe: 'Résous cette inéquation, grâce au signe du trinôme.',
  'somme-produit': 'Trouve la somme et le produit des racines, sans les calculer.',
  'deux-racines': 'Trouve le trinôme qui s’annule en ces deux nombres.',

  'delta-signe': 'Delta, c’est b au carré moins quatre a c : garde bien le signe de a et celui de c.',
  'carre-d-un-negatif': 'Le carré d’un nombre négatif est positif : b au carré ne peut pas être négatif.',
  'carre-pas-double': 'b au carré, c’est b fois b, pas deux fois b.',
  'delta-negatif': 'Delta est négatif : le trinôme n’a aucune racine réelle.',
  'delta-nul': 'Delta est nul : le trinôme a une seule racine, dite double.',
  'delta-positif': 'Delta est positif : le trinôme a deux racines distinctes.',
  'racines-moins-b': 'Les racines valent moins b, plus ou moins racine de delta, sur deux a : n’oublie pas le moins devant b.',
  'racines-deux-a': 'On divise par deux a, pas par a.',
  'canonique-alpha-signe': 'Alpha vaut moins b sur deux a ; dans la forme canonique, on écrit x moins alpha.',
  'canonique-beta': 'Quand tu complètes le carré, retranche le carré que tu as ajouté : bêta, c’est f d’alpha.',
  'canonique-facteur-a': 'Le carré ajouté est multiplié par a : bêta vaut c moins a fois alpha au carré, c’est-à-dire f d’alpha.',
  'sommet-moins-b': 'L’abscisse du sommet est moins b sur deux a : n’oublie pas le moins.',
  'sommet-image': 'L’ordonnée du sommet est f d’alpha, pas le coefficient c.',
  'sommet-ordre': 'Dans la forme canonique, le sommet a pour abscisse alpha et pour ordonnée bêta, dans cet ordre.',
  'signe-de-a': 'Un trinôme a le signe de a à l’extérieur de ses racines, et le signe contraire entre elles.',
  'inegalite-stricte': 'Inégalité stricte, crochets ouverts sur les racines ; inégalité large, crochets fermés.',
  'somme-moins-b-sur-a': 'La somme des racines vaut moins b sur a : attention au signe.',
  'diviser-par-a': 'Somme et produit se divisent par a : moins b sur a, et c sur a.',
  'somme-produit-echange': 'La somme, c’est moins b sur a ; le produit, c sur a. Ne les échange pas.',
  'racines-signe-facteur': 'Un trinôme qui s’annule en r contient le facteur x moins r : attention aux signes.',
  'regle-des-signes': 'Le terme constant est le produit des deux racines : vérifie la règle des signes.',

  'discriminant-regle': 'Delta égale b au carré moins quatre a c.',
  'nombre-racines-regle': 'Delta négatif, aucune racine ; nul, une seule ; positif, deux.',
  'racines-regle': 'Calcule delta, puis moins b plus ou moins racine de delta, le tout sur deux a.',
  'canonique-regle': 'Alpha égale moins b sur deux a, bêta égale f d’alpha, et f de x égale a fois x moins alpha au carré, plus bêta.',
  'sommet-regle': 'Le sommet a pour coordonnées alpha et f d’alpha.',
  'signe-regle': 'Signe de a à l’extérieur des racines, signe contraire entre elles.',
  'somme-produit-regle': 'Somme des racines : moins b sur a. Produit : c sur a.',
  'deux-racines-regle': 'Un trinôme qui s’annule en r et s s’écrit a fois x moins r, fois x moins s.',
};
