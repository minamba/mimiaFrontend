/**
 * LIRE UN GRAPHIQUE — Nora, voie professionnelle (2de, 1re et terminale pro).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (colonne NIVEAU de competences-lycee.txt) :
 *   2de pro : MATH_2PRO_ALG_GRAPHIQUE, MATH_2PRO_LOGIQUE_INTERVALLE
 *   1re pro : MATH_1PRO_DERIV_CALCULER, MATH_1PRO_DERIV_VARIATIONS, MATH_1PRO_DERIV_EXTREMUM
 *   Tle pro : MATH_TPRO_POLY3_DERIVEE, MATH_TPRO_POLY3_VARIATIONS, MATH_TPRO_POLY3_EXPLOITER
 *
 * EN 2de PRO (5 sortes) — une fonction donnée par un tableau de valeurs ou
 * par une courbe décrite en mots :
 *   - L'IMAGE : LES PIÈGES, chercher la valeur sur la ligne des f(x) (lire un
 *     antécédent), glisser d'une colonne ;
 *   - L'ANTÉCÉDENT : LES PIÈGES, lire une image, glisser d'une colonne ;
 *   - L'INTERVALLE DE CROISSANCE : LES PIÈGES, donner un intervalle de valeurs
 *     de f (lu sur l'axe vertical), confondre monter et descendre ;
 *   - LE MAXIMUM OU LE MINIMUM : LES PIÈGES, donner la valeur de x au lieu de
 *     la valeur de f, prendre le creux pour le maximum (l'extremum est au bord) ;
 *   - OÙ IL EST ATTEINT : LE PIÈGE, donner la valeur de f au lieu de x.
 *
 * EN 1re PRO (4 sortes) — polynômes de degré deux, dérivée :
 *   - LA DÉRIVÉE de ax² + bx + c : LES PIÈGES, oublier le facteur deux, faire
 *     disparaître le terme en x, multiplier sans baisser l'exposant ;
 *   - LA TANGENTE : f′(a) est la pente de la tangente. LES PIÈGES, Δx/Δy,
 *     l'ordonnée du point ;
 *   - LE SENS DE VARIATION à partir de f′(x) = ax + b sur un intervalle. LES
 *     PIÈGES, inverser le lien signe/variations, ignorer le changement de signe,
 *     ou en inventer un quand la racine est hors de l'intervalle ;
 *   - LE BÉNÉFICE MAXIMAL : où (B′(x) = 0) et combien. LES PIÈGES, la valeur
 *     pour la position, oublier le facteur deux, (−2 × 20)² au lieu de −2 × 20².
 *
 * EN TERMINALE PRO (4 sortes) — polynômes de degré trois :
 *   - LA DÉRIVÉE de ax³ + bx² + cx + d : mêmes pièges qu'en 1re ;
 *   - LE NOMBRE DÉRIVÉ f′(a) : LES PIÈGES, calculer f(a), oublier les facteurs ;
 *   - LES VARIATIONS depuis f′(x) = k(x − r)(x − s) : LES PIÈGES, inverser le
 *     signe du trinôme, oublier un changement de sens ;
 *   - EXPLOITER UN TABLEAU DE VARIATIONS : LES PIÈGES, prendre l'extremum
 *     local pour l'extremum de l'intervalle, donner la position.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'lire-un-graphique', titre: 'Lire un graphique', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE_PRO: {
    titre: 'Lire un graphique',
    accroche: 'Image, antécédent, variations, maximum.',
    competences: ['MATH_2PRO_ALG_GRAPHIQUE', 'MATH_2PRO_LOGIQUE_INTERVALLE'],
  },
  PREMIERE_PRO: {
    titre: 'Lire un graphique',
    accroche: 'La dérivée dit où la courbe monte.',
    competences: ['MATH_1PRO_DERIV_CALCULER', 'MATH_1PRO_DERIV_VARIATIONS', 'MATH_1PRO_DERIV_EXTREMUM'],
  },
  TERMINALE_PRO: {
    titre: 'Lire un graphique',
    accroche: 'Degré trois : dérivée et variations.',
    competences: ['MATH_TPRO_POLY3_DERIVEE', 'MATH_TPRO_POLY3_VARIATIONS', 'MATH_TPRO_POLY3_EXPLOITER'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* --------------------------------------------------------------- outils */

/** Un nombre à la française : virgule, vrai signe moins, sans zéro inutile. */
export function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  if (r === 0) return '0';
  const [entier, decimales] = String(Math.abs(r)).split('.');
  // Au-delà de quatre chiffres, des groupes de trois séparés par une espace fine.
  const groupes = entier.length > 4 ? entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : entier;
  const s = decimales ? `${groupes},${decimales}` : groupes;
  return r < 0 ? `−${s}` : s;
}

const PUISSANCES = ['', 'x', 'x²', 'x³'];

/** [a, b, c] (du plus haut degré au plus bas) → « 3x² − 5x + 2 ». */
export function poly(coefs) {
  const degre = coefs.length - 1;
  let s = '';
  coefs.forEach((c, i) => {
    const p = degre - i;
    if (c === 0) return;
    const abs = Math.abs(c);
    const corps = p === 0 ? nb(abs) : `${abs === 1 ? '' : nb(abs)}${PUISSANCES[p]}`;
    if (s === '') s = c < 0 ? `−${corps}` : corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
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

const intervalle = (a, b) => `[${nb(a)} ; ${nb(b)}]`;
const point = (x, y) => `(${nb(x)} ; ${nb(y)})`;

/* ------------------------------------------------------------- 2de pro */

const TABLEAUX = [
  'Puissance d’un moteur (kW) selon son régime x.',
  'Stock d’une pièce détachée, semaine x.',
  'Clients d’un magasin selon l’heure x.',
  'Production d’une ligne (dizaines de pièces), jour x.',
];

/** Six abscisses régulières. */
function abscisses(t) {
  const debut = t.entre(0, 2);
  const pas = t.entre(1, 2);
  return Array.from({ length: 6 }, (_, k) => debut + pas * k);
}

const tableau = (contexte, xs, ys) => `${contexte}\nx : ${xs.map(nb).join(' | ')}\nf(x) : ${ys.map(nb).join(' | ')}`;

function image2(t) {
  const xs = abscisses(t);
  let ys;
  let i;
  let j;
  do {
    i = t.entre(0, 5);
    j = t.entre(0, 5);
    ys = xs.map(() => t.entre(0, 30));
    ys[j] = xs[i];
  } while (i === j || new Set(ys).size < 6 || xs[j] === ys[i]);
  const voisine = i === 5 ? ys[4] : ys[i + 1];
  return manche(t.melanger, {
    consigne: 'image',
    question: `${tableau(t.au(TABLEAUX), xs, ys)}\nImage de ${nb(xs[i])} par f ?`,
    bonne: nb(ys[i]),
    pieges: t.melanger([[nb(xs[j]), 'image-pas-antecedent'], [nb(voisine), 'colonne-voisine']]),
    voisin: (k) => nb(ys[i] + k),
  });
}

function antecedent2(t) {
  const xs = abscisses(t);
  let ys;
  let j;
  let m;
  do {
    j = t.entre(0, 5);
    m = t.entre(0, 5);
    ys = xs.map(() => t.entre(0, 30));
    ys[j] = xs[m];
  } while (j === m || new Set(ys).size < 6 || ys[m] === xs[j]);
  const voisine = j === 0 ? xs[1] : xs[j - 1];
  return manche(t.melanger, {
    consigne: 'antecedent',
    question: `${tableau(t.au(TABLEAUX), xs, ys)}\nAntécédent de ${nb(ys[j])} par f ?`,
    bonne: nb(xs[j]),
    pieges: t.melanger([[nb(ys[m]), 'antecedent-pas-image'], [nb(voisine), 'colonne-voisine']]),
    voisin: (k) => nb(xs[(j + k + 1) % 6]),
  });
}

const COURBES = [
  'Niveau d’une cuve (cm), x en heures.',
  'Bénéfice d’un atelier (k€), x en dizaines de commandes.',
  'Température d’un four (dizaines de °C), x en minutes.',
  'Débit d’une pompe (L/min), x en minutes.',
];

/** Une courbe en deux morceaux : (0 ; y0), (x1 ; y1), (x2 ; y2), avec une bosse ou un creux. */
function courbe(t) {
  const x1 = t.entre(2, 8);
  const x2 = x1 + t.entre(2, 8);
  const bosse = t.entre(0, 1) === 1;
  let y0;
  let y1;
  let y2;
  do {
    if (bosse) {
      y1 = t.entre(15, 40);
      y0 = t.entre(0, y1 - 5);
      y2 = t.entre(0, y1 - 5);
    } else {
      y1 = t.entre(0, 15);
      y0 = t.entre(y1 + 5, 40);
      y2 = t.entre(y1 + 5, 40);
    }
  } while (y0 === y2 || [y0, y1, y2].some((y) => [0, x1, x2].includes(y)));
  const [premier, second] = bosse ? ['monte', 'descend'] : ['descend', 'monte'];
  const texte = `${t.au(COURBES)}\nLa courbe de f part du point ${point(0, y0)}, ${premier} jusqu’au point ${point(x1, y1)}, `
    + `puis ${second} jusqu’au point ${point(x2, y2)}.`;
  return {
    x1, x2, y0, y1, y2, bosse, texte,
  };
}

function croissance2(t) {
  const c = courbe(t);
  const croissante = t.entre(0, 1) === 1;
  // Le morceau demandé : le premier si son sens est celui demandé.
  const premierMonte = c.bosse;
  const demandePremier = croissante === premierMonte;
  const [a, b, ya, yb] = demandePremier ? [0, c.x1, c.y0, c.y1] : [c.x1, c.x2, c.y1, c.y2];
  const [autreA, autreB] = demandePremier ? [c.x1, c.x2] : [0, c.x1];
  return manche(t.melanger, {
    consigne: 'croissance',
    question: `${c.texte}\nSur quel intervalle f est-elle ${croissante ? 'croissante' : 'décroissante'} ?`,
    bonne: intervalle(a, b),
    pieges: t.melanger([
      [intervalle(Math.min(ya, yb), Math.max(ya, yb)), 'intervalle-en-abscisse'],
      [intervalle(autreA, autreB), 'croissante-decroissante'],
    ]),
    voisin: (k) => intervalle(0, c.x2 + k),
  });
}

function extremum2(t) {
  const c = courbe(t);
  const maximum = t.entre(0, 1) === 1;
  const ys = [c.y0, c.y1, c.y2];
  const xs = [0, c.x1, c.x2];
  const valeur = maximum ? Math.max(...ys) : Math.min(...ys);
  const position = xs[ys.indexOf(valeur)];
  // Le tournant est l'extremum demandé (une bosse pour un maximum) ou non.
  const auTournant = maximum === c.bosse;
  const pieges = [[nb(position), 'valeur-ou-position']];
  if (!auTournant) pieges.push([nb(c.y1), 'tournant-pas-extremum']);
  return manche(t.melanger, {
    consigne: 'extremum',
    question: `${c.texte}\n${maximum ? 'Maximum' : 'Minimum'} de f sur ${intervalle(0, c.x2)} ?`,
    bonne: nb(valeur),
    pieges: t.melanger(pieges),
    voisin: (k) => nb(valeur + (maximum ? k : -k)),
  });
}

function atteint2(t) {
  const c = courbe(t);
  const maximum = c.bosse;
  return manche(t.melanger, {
    consigne: 'atteint',
    question: `${c.texte}\nPour quelle valeur de x f est-elle ${maximum ? 'maximale' : 'minimale'} ?`,
    bonne: nb(c.x1),
    pieges: [[nb(c.y1), 'valeur-ou-position']],
    voisin: (k) => nb(c.x1 + k),
  });
}

/* ------------------------------------------------------------- 1re pro */

const nonNul = (t, a, b) => {
  let v = 0;
  while (v === 0) v = t.entre(a, b);
  return v;
};

function derivee1(t) {
  const a = nonNul(t, -6, 6);
  const b = nonNul(t, -9, 9);
  const c = nonNul(t, -9, 9);
  return manche(t.melanger, {
    consigne: 'derivee',
    question: `f(x) = ${poly([a, b, c])}\nf′(x) = ?`,
    bonne: poly([2 * a, b]),
    pieges: t.melanger([
      [poly([a, b]), 'derivee-oubli-facteur'],
      [poly([2 * a, 0]), 'derivee-terme-en-x'],
      [poly([2 * a, b, 0]), 'derivee-sans-baisser'],
    ]),
    voisin: (k) => poly([2 * a, b + k]),
  });
}

/** Un quotient a/b, décimal à deux chiffres au plus, pour pouvoir l'écrire sans arrondi. */
const decimalExact = (a, b) => b !== 0 && (a * 100) % b === 0;

function tangente1(t) {
  let dx;
  let dy;
  let xa;
  let ya;
  do {
    dx = t.entre(1, 5);
    dy = nonNul(t, -12, 12);
    xa = t.entre(-3, 6);
    ya = t.entre(-5, 15);
  } while (Math.abs(dx) === Math.abs(dy) || !decimalExact(dy, dx) || !decimalExact(dx, dy) || ya * dx === dy);
  const pente = dy / dx;
  return manche(t.melanger, {
    consigne: 'tangente',
    question: `La tangente à la courbe de f au point A d’abscisse ${nb(xa)} passe par A${point(xa, ya)} et B${point(xa + dx, ya + dy)}.\nf′(${nb(xa)}) = ?`,
    bonne: nb(pente),
    pieges: t.melanger([[nb(dx / dy), 'coefficient-directeur'], [nb(ya), 'nombre-derive-pente']]),
    voisin: (k) => nb(pente + k),
  });
}

const SENS = {
  monte: 'croissante',
  descend: 'décroissante',
  creux: 'décroissante puis croissante',
  bosse: 'croissante puis décroissante',
};

function sensVariation1(t) {
  const a = nonNul(t, -5, 5);
  const r = t.entre(-5, 10);
  const dedans = t.entre(0, 2) > 0;
  let lo;
  let hi;
  if (dedans) {
    lo = r - t.entre(1, 5);
    hi = r + t.entre(1, 6);
  } else if (t.entre(0, 1)) {
    lo = r + t.entre(1, 4);
    hi = lo + t.entre(2, 8);
  } else {
    hi = r - t.entre(1, 4);
    lo = hi - t.entre(2, 8);
  }
  let bonne;
  let pieges;
  if (dedans) {
    bonne = a > 0 ? SENS.creux : SENS.bosse;
    pieges = [[a > 0 ? SENS.bosse : SENS.creux, 'signe-derivee'], [a > 0 ? SENS.monte : SENS.descend, 'changement-de-signe']];
  } else {
    const positive = a * ((lo + hi) / 2 - r) > 0;
    bonne = positive ? SENS.monte : SENS.descend;
    pieges = [[positive ? SENS.descend : SENS.monte, 'signe-derivee'], [a > 0 ? SENS.creux : SENS.bosse, 'racine-hors-intervalle']];
  }
  return manche(t.melanger, {
    consigne: 'sens-variation',
    question: `f′(x) = ${poly([a, -a * r])} sur ${intervalle(lo, hi)}.\nSens de variation de f ?`,
    bonne,
    pieges,
    voisin: () => Object.values(SENS).find((s) => s !== bonne && !pieges.some(([p]) => p === s)),
  });
}

function sommet1(valeurDemandee, t) {
  const a = -t.entre(1, 4);
  const x0 = t.entre(5, 30);
  const b = -2 * a * x0;
  const haut = -a * x0 * x0;
  const c = -t.entre(Math.ceil(haut / 10), Math.floor((haut * 8) / 10));
  const benefice = (x) => a * x * x + b * x + c;
  const question = `B(x) = ${poly([a, b, c])} est le bénéfice (en €) pour x objets fabriqués par jour, x entre 0 et ${2 * x0}.\n`;
  if (valeurDemandee) {
    return manche(t.melanger, {
      consigne: 'sommet-valeur',
      question: `${question}Bénéfice maximal (en €) ?`,
      bonne: nb(benefice(x0)),
      pieges: t.melanger([[nb(x0), 'valeur-ou-position'], [nb(a * a * x0 * x0 + b * x0 + c), 'priorite-carre']]),
      voisin: (k) => nb(benefice(x0) + 10 * k),
    });
  }
  return manche(t.melanger, {
    consigne: 'sommet',
    question: `${question}Pour quel nombre x d’objets le bénéfice est-il maximal ?`,
    bonne: nb(x0),
    pieges: t.melanger([[nb(2 * x0), 'derivee-oubli-facteur'], [nb(benefice(x0)), 'valeur-ou-position']]),
    voisin: (k) => nb(x0 + k),
  });
}

/* ------------------------------------------------------------- Tle pro */

function derivee3(t) {
  const a = nonNul(t, -4, 4);
  const b = nonNul(t, -6, 6);
  const c = nonNul(t, -9, 9);
  const d = nonNul(t, -9, 9);
  return manche(t.melanger, {
    consigne: 'derivee-degre-trois',
    question: `f(x) = ${poly([a, b, c, d])}\nf′(x) = ?`,
    bonne: poly([3 * a, 2 * b, c]),
    pieges: t.melanger([
      [poly([a, b, c]), 'derivee-oubli-facteur'],
      [poly([3 * a, 2 * b, c, 0]), 'derivee-sans-baisser'],
      [poly([3 * a, 2 * b, 0]), 'derivee-terme-en-x'],
    ]),
    voisin: (k) => poly([3 * a, 2 * b, c + k]),
  });
}

function nombreDerive3(t) {
  let a;
  let b;
  let c;
  let d;
  let x0;
  let juste;
  let image;
  let oubli;
  do {
    a = nonNul(t, -3, 3);
    b = nonNul(t, -6, 6);
    c = t.entre(-9, 9);
    d = nonNul(t, -9, 9);
    x0 = nonNul(t, -3, 3);
    juste = 3 * a * x0 * x0 + 2 * b * x0 + c;
    image = a * x0 ** 3 + b * x0 * x0 + c * x0 + d;
    oubli = a * x0 * x0 + b * x0 + c;
  } while (new Set([juste, image, oubli]).size < 3);
  return manche(t.melanger, {
    consigne: 'nombre-derive',
    question: `f(x) = ${poly([a, b, c, d])}\nf′(${nb(x0)}) = ?`,
    bonne: nb(juste),
    pieges: t.melanger([[nb(image), 'calculer-f-prime'], [nb(oubli), 'derivee-oubli-facteur']]),
    voisin: (k) => nb(juste + k),
  });
}

/** « x − 2 », « x + 4 », « x » pour la racine 0. */
const facteur = (r) => {
  if (r === 0) return 'x';
  return r > 0 ? `(x − ${nb(r)})` : `(x + ${nb(-r)})`;
};

const FLECHES = {
  plusMoinsPlus: '↗ ↘ ↗',
  moinsPlusMoins: '↘ ↗ ↘',
  descendMonte: '↘ ↗',
  monteDescend: '↗ ↘',
};

function variations3(t) {
  const k = nonNul(t, -3, 3);
  const r1 = t.entre(-5, 4);
  const r2 = r1 + t.entre(1, 5);
  const lo = r1 - t.entre(1, 4);
  const hi = r2 + t.entre(1, 4);
  let produit = r1 === 0 ? `x${facteur(r2)}` : `${facteur(r1)}${facteur(r2)}`;
  if (r2 === 0) produit = `x${facteur(r1)}`;
  let coef = nb(k);
  if (k === 1) coef = '';
  if (k === -1) coef = '−';
  const bonne = k > 0 ? FLECHES.plusMoinsPlus : FLECHES.moinsPlusMoins;
  return manche(t.melanger, {
    consigne: 'variations-trinome',
    question: `f′(x) = ${coef}${produit} sur ${intervalle(lo, hi)}.\nVariations de f, de gauche à droite ?`,
    bonne,
    pieges: [
      [k > 0 ? FLECHES.moinsPlusMoins : FLECHES.plusMoinsPlus, 'signe-trinome'],
      [k > 0 ? FLECHES.monteDescend : FLECHES.descendMonte, 'deux-racines'],
    ],
    voisin: () => (k > 0 ? FLECHES.descendMonte : FLECHES.monteDescend),
  });
}

const VARIATIONS = [
  'Niveau d’eau d’un bassin (dm), x en heures.',
  'Bénéfice d’un atelier (k€), x en centaines de pièces.',
  'Vitesse d’un tapis roulant (dm/s), x en minutes.',
];

function exploiter3(t) {
  const xs = [0];
  for (let k = 0; k < 3; k += 1) xs.push(xs[k] + t.entre(2, 5));
  const monteDabord = t.entre(0, 1) === 1;
  const maximum = t.entre(0, 1) === 1;
  let vs;
  do {
    // Les valeurs alternent : basse, haute, basse, haute (ou l'inverse).
    const bas = () => t.entre(1, 20);
    const haut = () => t.entre(21, 45);
    vs = monteDabord ? [bas(), haut(), bas(), haut()] : [haut(), bas(), haut(), bas()];
  } while (new Set(vs).size < 4 || vs.some((v) => xs.includes(v)));
  // Les candidats : les indices des hauts pour un maximum, des bas pour un minimum.
  const hauts = monteDabord ? [1, 3] : [0, 2];
  const bas = monteDabord ? [0, 2] : [1, 3];
  const candidats = (maximum ? hauts : bas).map((i) => vs[i]);
  const valeur = maximum ? Math.max(...candidats) : Math.min(...candidats);
  const autre = candidats.find((v) => v !== valeur);
  const fleches = monteDabord ? ['↗', '↘', '↗'] : ['↘', '↗', '↘'];
  const ligne = xs.map((x, i) => `f(${nb(x)}) = ${nb(vs[i])}`)
    .reduce((s, morceau, i) => (i === 0 ? morceau : `${s} ${fleches[i - 1]} ${morceau}`), '');
  return manche(t.melanger, {
    consigne: 'exploiter-variations',
    question: `${t.au(VARIATIONS)}\nTableau de variations de f sur ${intervalle(0, xs[3])} :\n${ligne}\n${maximum ? 'Maximum' : 'Minimum'} de f sur ${intervalle(0, xs[3])} ?`,
    bonne: nb(valeur),
    pieges: t.melanger([[nb(autre), 'comparer-extremums'], [nb(xs[vs.indexOf(valeur)]), 'valeur-ou-position']]),
    voisin: (k) => nb(valeur + (maximum ? k : -k)),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  let liste;
  if (niveau === 'TERMINALE_PRO') {
    liste = [
      derivee3(t), derivee3(t),
      nombreDerive3(t), nombreDerive3(t),
      variations3(t), variations3(t),
      exploiter3(t), exploiter3(t),
    ];
  } else if (niveau === 'PREMIERE_PRO') {
    liste = [
      derivee1(t), derivee1(t),
      tangente1(t), tangente1(t),
      sensVariation1(t), sensVariation1(t),
      sommet1(false, t), sommet1(true, t),
    ];
  } else {
    liste = [
      image2(t), image2(t),
      antecedent2(t), antecedent2(t),
      croissance2(t), croissance2(t),
      extremum2(t), atteint2(t),
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
  image: 'Lis l’image demandée dans le tableau de valeurs.',
  antecedent: 'Trouve l’antécédent demandé dans le tableau de valeurs.',
  croissance: 'Lis sur quel intervalle la fonction a le sens de variation demandé.',
  extremum: 'Lis sur la courbe la valeur extrême demandée.',
  atteint: 'Trouve pour quelle valeur de x cet extremum est atteint.',
  derivee: 'Calcule la fonction dérivée de ce polynôme.',
  tangente: 'Lis le nombre dérivé grâce à la tangente.',
  'sens-variation': 'Déduis du signe de la dérivée le sens de variation de f.',
  sommet: 'Grâce à la dérivée, trouve pour quelle quantité le bénéfice est maximal.',
  'sommet-valeur': 'Calcule le bénéfice maximal.',
  'derivee-degre-trois': 'Calcule la dérivée de ce polynôme de degré trois.',
  'nombre-derive': 'Calcule ce nombre dérivé.',
  'variations-trinome': 'Déduis les variations de f du signe de sa dérivée.',
  'exploiter-variations': 'Exploite le tableau de variations pour trouver la valeur demandée.',

  'image-pas-antecedent': 'L’image se lit dans l’autre sens : pars de la valeur sur la ligne des x, et lis le nombre juste en dessous, sur la ligne des f de x.',
  'antecedent-pas-image': 'Un antécédent se cherche sur la ligne des f de x : repère la valeur, puis lis le x placé juste au-dessus.',
  'colonne-voisine': 'Reste dans la même colonne : chaque f de x est placé exactement sous son x.',
  'intervalle-en-abscisse': 'Un intervalle de variation se lit sur l’axe horizontal : ce sont des valeurs de x, pas des valeurs de f.',
  'croissante-decroissante': 'Croissante, la courbe monte quand on avance vers la droite ; décroissante, elle descend.',
  'valeur-ou-position': 'Un maximum ou un minimum est une valeur de f, lue sur l’axe vertical ; l’endroit où il est atteint est une valeur de x, lue sur l’axe horizontal.',
  'tournant-pas-extremum': 'Le point où la courbe change de sens n’est pas forcément celui demandé : une bosse est un maximum, un creux un minimum, et l’autre extremum se cherche aux extrémités.',
  'derivee-oubli-facteur': 'La dérivée de x puissance n, c’est n fois x puissance n moins un : n’oublie pas de multiplier par l’exposant.',
  'derivee-terme-en-x': 'La dérivée de a fois x, c’est a, pas zéro : seule la constante disparaît.',
  'derivee-sans-baisser': 'En dérivant, on multiplie par l’exposant ET on baisse l’exposant de un.',
  'coefficient-directeur': 'La pente de la tangente, c’est la variation des ordonnées divisée par la variation des abscisses, pas l’inverse.',
  'nombre-derive-pente': 'Le nombre dérivé est la pente de la tangente, pas l’ordonnée du point de contact.',
  'signe-derivee': 'Quand f prime est positive, f est croissante ; quand elle est négative, f est décroissante.',
  'changement-de-signe': 'La dérivée s’annule à l’intérieur de l’intervalle et change de signe : le sens de variation change aussi.',
  'racine-hors-intervalle': 'La dérivée s’annule en dehors de l’intervalle : sur cet intervalle, elle garde un seul signe.',
  'priorite-carre': 'Dans un terme comme a x au carré, seul x est élevé au carré : calcule d’abord le carré, puis multiplie par le coefficient, signe compris.',
  'calculer-f-prime': 'Le nombre dérivé, c’est f prime calculée en ce point : dérive d’abord, puis remplace x, au lieu de calculer f.',
  'signe-trinome': 'Un trinôme est du signe de son coefficient principal à l’extérieur des racines, et du signe contraire entre elles.',
  'deux-racines': 'La dérivée s’annule deux fois dans l’intervalle et change deux fois de signe : il y a trois sens de variation.',
  'comparer-extremums': 'Un extremum local n’est pas forcément l’extremum de tout l’intervalle : compare-le avec la valeur à la borne.',

  'image-regle': 'L’image d’un nombre se lit sur la ligne des f de x, juste sous ce nombre.',
  'antecedent-regle': 'Repère la valeur sur la ligne des f de x, puis lis le x placé au-dessus.',
  'croissance-regle': 'Suis la courbe de gauche à droite, et note les valeurs de x où elle monte ou descend.',
  'extremum-regle': 'Compare la valeur au point où la courbe tourne avec les valeurs aux deux extrémités.',
  'atteint-regle': 'Repère le point le plus haut ou le plus bas, puis lis son abscisse.',
  'derivee-regle': 'Dérive terme à terme : a x au carré donne deux a x, b x donne b, la constante donne zéro.',
  'tangente-regle': 'Calcule la pente de la tangente : différence des ordonnées divisée par différence des abscisses.',
  'sens-variation-regle': 'Cherche où la dérivée s’annule, puis son signe de chaque côté sur l’intervalle.',
  'sommet-regle': 'Résous B prime de x égale zéro : la solution donne la quantité qui rend le bénéfice maximal.',
  'sommet-valeur-regle': 'Trouve d’abord où B prime s’annule, puis calcule B en cette valeur.',
  'derivee-degre-trois-regle': 'Dérive terme à terme : x au cube donne trois x au carré, x au carré donne deux x, la constante donne zéro.',
  'nombre-derive-regle': 'Calcule f prime de x, puis remplace x par la valeur demandée.',
  'variations-trinome-regle': 'Étudie le signe de la dérivée entre ses racines et à l’extérieur, puis traduis-le en flèches.',
  'exploiter-variations-regle': 'Compare toutes les valeurs candidates du tableau, y compris celles aux bornes.',
};
