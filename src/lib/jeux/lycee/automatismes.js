/**
 * LES AUTOMATISMES — Nora, en 1re générale et en 1re technologique.
 *
 * LE JEU PHARE DE LA 1re : le format du QCM d'automatismes de l'épreuve
 * anticipée de mathématiques. Une question courte, trois réponses, pas de
 * calculatrice. Chaque partie tire TROIS manches sur les taux d'évolution (le
 * cœur de l'épreuve) et CINQ sur le reste du programme d'automatismes ; toutes
 * les réponses sont CALCULÉES ici, jamais recopiées.
 *
 * LES SORTES DE MANCHES, ET LEURS PIÈGES :
 *   Taux d'évolution
 *   - le coefficient multiplicateur : prendre le taux seul (0,07 au lieu de
 *     1,07), ou celui de la hausse pour une baisse ;
 *   - la valeur finale et la valeur initiale : ajouter des euros au lieu de
 *     pour cent, donner la seule variation, « revenir » en appliquant le taux
 *     inverse au lieu de diviser par le coefficient ;
 *   - le taux d'évolution : l'écart pris pour un taux, l'écart divisé par la
 *     valeur d'arrivée, le coefficient écrit en pourcentage ;
 *   - les évolutions successives : additionner les taux (+20 % puis −20 % ne
 *     font pas 0 %) ;
 *   - la réciproque : prendre l'opposé (après +25 %, c'est −20 %, pas −25 %).
 *   Le reste
 *   - proportions : pourcentage d'une quantité, proportion d'une proportion ;
 *   - calcul littéral : développer (le double produit oublié, le carré d'un
 *     négatif), factoriser (identités, le moins devant la parenthèse) ;
 *   - calcul numérique : puissances, fractions ;
 *   - équations et inéquations : le terme qui change de membre, le sens de
 *     l'inégalité quand on divise par un négatif, l'équation produit nul ;
 *   - lecture graphique décrite en texte : image et antécédent, coefficient
 *     directeur, équation réduite, signe, f(x) = k ;
 *   - probabilités conditionnelles : P_A(B) contre P(A ∩ B), le mauvais
 *     univers dans un tableau ;
 *   - conversions : heures décimales, aires et volumes, vitesses.
 *
 * Ce qui se DIT (PHRASES) est fixe, sans aucun nombre ; ce qui varie est dans
 * `question` et dans les libellés, affichés.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'automatismes', titre: 'Les automatismes', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Les automatismes',
    accroche: 'Le QCM d’automatismes, sans calculatrice.',
    competences: [
      'MATH_1RE_AUTO_TAUX_APPLIQUER', 'MATH_1RE_AUTO_TAUX_CALCULER',
      'MATH_1RE_AUTO_TAUX_SUCCESSIFS', 'MATH_1RE_AUTO_TAUX_RECIPROQUE',
      'MATH_1RE_AUTO_PRODUIT_NUL', 'MATH_1RE_AUTO_SIGNE', 'MATH_1RE_AUTO_CALCUL_LITTERAL',
      'MATH_1RE_AUTO_GRAPH_EQUATION', 'MATH_1RE_AUTO_GRAPH_SIGNE',
      'MATH_1RE_AUTO_DROITE_LIRE', 'MATH_1RE_AUTO_COEFF_DIRECTEUR',
      'MATH_1RE_PROBA_COND', 'MATH_1RE_AUTO_PROBA_NOTATIONS',
    ],
  },
  PREMIERE_TECHNO: {
    titre: 'Les automatismes',
    accroche: 'Le QCM d’automatismes, sans calculatrice.',
    competences: [
      'MATH_1TEC_AUTO_TAUX_APPLIQUER', 'MATH_1TEC_AUTO_EVOLUTION',
      'MATH_1TEC_AUTO_TAUX_SUCCESSIFS', 'MATH_1TEC_AUTO_TAUX_RECIPROQUE',
      'MATH_1TEC_AUTO_PRODUIT_NUL', 'MATH_1TEC_AUTO_SIGNE', 'MATH_1TEC_AUTO_ALGEBRE',
      'MATH_1TEC_AUTO_GRAPHIQUE', 'MATH_1TEC_AUTO_GRAPH_SIGNE',
      'MATH_1TEC_AUTO_DROITE_LIRE', 'MATH_1TEC_AUTO_COEFF_DIRECTEUR',
      'MATH_1TEC_PROB_CONDITION', 'MATH_1TEC_AUTO_PROBA_NOTATIONS',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ l'écriture */

const NB = ' ';

/** « −3 », « 2,5 », « 35 000 » : le signe moins typographique, la virgule. */
export function nb(x) {
  let r = Math.round(x * 1e6) / 1e6;
  if (Object.is(r, -0)) r = 0;
  const [ent, dec] = String(Math.abs(r)).split('.');
  const groupe = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, NB) : ent;
  return (r < 0 ? '−' : '') + groupe + (dec ? `,${dec}` : '');
}
/** « +30 % », « −4 % », « 0 % » : un taux d'évolution, signé. */
const taux = (t) => `${t > 1e-9 ? '+' : ''}${nb(t)}${NB}%`;
/** « 12 % » : une proportion. */
const part = (t) => `${nb(t)}${NB}%`;
/** « 92 € », « 112,50 € ». */
function euros(x) {
  const r = Math.round(x * 100) / 100;
  if (Number.isInteger(r)) return `${nb(r)}${NB}€`;
  return `${r.toFixed(2).replace('.', ',')}${NB}€`;
}

const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
/** « −5/2 », « 3 » : une fraction irréductible, le signe devant. */
export function fr(n, d = 1) {
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

const EXPOSANTS = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => EXPOSANTS[c]).join('');

/** « 3x − 2 », « −x + 4 », « 2x » */
function affine(a, b) {
  let s;
  if (a === 0) return nb(b);
  if (a === 1) s = 'x';
  else if (a === -1) s = '−x';
  else s = `${nb(a)}x`;
  if (b > 0) s += ` + ${nb(b)}`;
  if (b < 0) s += ` − ${nb(-b)}`;
  return s;
}
/** « 4x² − 12x + 9 » : coefficients du plus haut degré au plus bas. */
function poly(coefs) {
  const deg = coefs.length - 1;
  let s = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const k = deg - i;
    const lettre = k === 0 ? '' : `x${k > 1 ? sup(k) : ''}`;
    const abs = Math.abs(c);
    const corps = abs === 1 && k > 0 ? lettre : `${nb(abs)}${lettre}`;
    if (s === '') s = (c < 0 ? '−' : '') + corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
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

/* ---------------------------------------------------- taux d'évolution */

function coefficient({ au, melanger }) {
  const p = au([2, 3, 5, 8, 12, 15, 20, 25, 30, 35, 40, 60, 75]);
  const hausse = au([true, false]);
  const bonne = hausse ? 1 + p / 100 : 1 - p / 100;
  return manche(melanger, {
    consigne: 'coefficient',
    question: `${hausse ? 'Augmenter' : 'Baisser'} de ${p}${NB}%, c’est multiplier par…`,
    bonne: nb(bonne),
    pieges: [
      [nb(p / 100), 'coefficient-un-plus'],
      [nb(hausse ? 1 - p / 100 : 1 + p / 100), 'coefficient-hausse-baisse'],
    ],
    voisin: (k) => nb(bonne + k / 10),
  });
}

function appliquer({ au, entre, melanger }) {
  const p = au([5, 10, 15, 20, 25, 30, 40]);
  const hausse = au([true, false]);
  const s = hausse ? 1 : -1;
  if (au(['finale', 'initiale']) === 'finale') {
    const v0 = au([40, 60, 80, 120, 150, 200, 250, 300, 400, 500, 640, 800]);
    const vf = (v0 * (100 + s * p)) / 100;
    return manche(melanger, {
      consigne: 'valeur-finale',
      question: `Un prix de ${euros(v0)} ${hausse ? 'augmente' : 'baisse'} de ${p}${NB}%. Nouveau prix ?`,
      bonne: euros(vf),
      pieges: [[euros(v0 + s * p), 'pourcentage-pas-euros'], [euros((v0 * p) / 100), 'variation-seule']],
      voisin: (k) => euros(vf + 2 * k),
    });
  }
  // La valeur de départ est un multiple de 20 : l'arrivée tombe juste.
  const v0 = 20 * entre(2, 30);
  const vf = (v0 * (100 + s * p)) / 100;
  return manche(melanger, {
    consigne: 'valeur-initiale',
    question: `Après une ${hausse ? 'hausse' : 'baisse'} de ${p}${NB}%, un prix vaut ${euros(vf)}. Prix de départ ?`,
    bonne: euros(v0),
    pieges: [[euros((vf * (100 - s * p)) / 100), 'taux-inverse'], [euros(vf - s * p), 'pourcentage-pas-euros']],
    voisin: (k) => euros(v0 + 5 * k),
  });
}

function calculerTaux({ au, entre, melanger }) {
  const t = au([-60, -50, -40, -25, -20, -10, 10, 20, 25, 30, 50, 60, 100, 150]);
  let v0;
  do v0 = 20 * entre(1, 20); while (v0 === 100);
  const v1 = (v0 * (100 + t)) / 100;
  const pieges = [];
  // L'écart divisé par la valeur d'arrivée, quand il tombe juste au dixième.
  const arrivee = (100 * (v1 - v0)) / v1;
  if (Math.abs(arrivee * 10 - Math.round(arrivee * 10)) < 1e-9) pieges.push([taux(arrivee), 'taux-diviser-par-depart']);
  pieges.push([taux(v1 - v0), 'taux-pas-ecart'], [taux(100 + t), 'taux-pas-coefficient']);
  return manche(melanger, {
    consigne: 'taux',
    question: `Un effectif passe de ${nb(v0)} à ${nb(v1)}. Taux d’évolution ?`,
    bonne: taux(t),
    pieges,
    voisin: (k) => taux(t + 5 * k),
  });
}

const evolution = (t, debut) => {
  const mot = t > 0 ? `hausse de ${t}${NB}%` : `baisse de ${-t}${NB}%`;
  return debut ? `Une ${mot}` : `une ${mot}`;
};

function successives({ au, melanger }) {
  let t1;
  let t2;
  const allerRetour = au([true, false]);
  if (allerRetour) {
    const p = au([10, 20, 25, 30, 40, 50]);
    t1 = au([p, -p]);
    t2 = -t1;
  } else {
    const liste = [5, 10, 15, 20, 25, 30, 40, 50, -10, -20, -25, -30, -40, -50];
    t1 = au(liste);
    do t2 = au(liste); while (t2 === -t1);
  }
  const global = ((100 + t1) * (100 + t2)) / 100 - 100;
  return manche(melanger, {
    consigne: 'successives',
    question: `${evolution(t1, true)}, puis ${evolution(t2, false)}. Évolution globale ?`,
    bonne: taux(global),
    pieges: [
      [taux(t1 + t2), allerRetour ? 'hausse-baisse-pas-nulle' : 'taux-successifs'],
      [taux(((100 + t1) * (100 + t2)) / 100), 'taux-pas-coefficient'],
    ],
    voisin: (k) => taux(global + k),
  });
}

function reciproque({ au, melanger }) {
  // Des taux dont la réciproque tombe juste.
  const t = au([25, -20, 100, -50, 150, -60, 60, 300, -75, 400, -80]);
  const r = (-100 * t) / (100 + t);
  return manche(melanger, {
    consigne: 'reciproque',
    question: `Un prix ${t > 0 ? 'augmente' : 'baisse'} de ${Math.abs(t)}${NB}%. Quelle évolution le ramène à sa valeur de départ ?`,
    bonne: taux(r),
    pieges: [[taux(-t), 'reciproque-pas-oppose'], [taux(10000 / (100 + t)), 'taux-pas-coefficient']],
    voisin: (k) => taux(r + 5 * k),
  });
}

/* ------------------------------------------------------------ proportions */

function proportion({ au, melanger }) {
  if (au([true, false])) {
    const p = au([5, 10, 12, 15, 20, 25, 30, 40, 60, 75]);
    const n = au([40, 60, 80, 120, 140, 160, 200, 240, 300, 360, 400, 500, 600, 800]);
    const bonne = (p * n) / 100;
    return manche(melanger, {
      consigne: 'pourcentage-de',
      question: `${p}${NB}% de ${nb(n)} = ?`,
      bonne: nb(bonne),
      pieges: [[nb((p * n) / 10), 'pourcentage-sur-cent'], [nb(n - p), 'pourcentage-pas-soustraction']],
      voisin: (k) => nb(bonne + k),
    });
  }
  const p1 = au([20, 25, 40, 50, 60, 75, 80]);
  const p2 = au([10, 20, 25, 30, 40, 50]);
  const bonne = (p1 * p2) / 100;
  return manche(melanger, {
    consigne: 'proportion-de-proportion',
    question: `Dans un lycée, ${p1}${NB}% des élèves sont internes, et ${p2}${NB}% des internes font du théâtre. Part des élèves du lycée internes et faisant du théâtre ?`,
    bonne: part(bonne),
    pieges: [
      [part(p2), 'proportion-de-la-partie'],
      [p1 + p2 <= 100 ? part(p1 + p2) : null, 'proportions-additionnees'],
    ],
    voisin: (k) => part(bonne + 2 * k),
  });
}

/* --------------------------------------------------------- calcul littéral */

function developper({ au, entre, melanger }) {
  const sorte = au(['carre', 'difference', 'produit']);
  if (sorte === 'carre') {
    const a = au([1, 1, 2, 3]);
    let b = 0;
    while (b === 0) b = entre(-6, 6);
    let second;
    if (a > 1) second = [poly([a, 2 * a * b, b * b]), 'carre-du-coefficient'];
    else if (b < 0) second = [poly([1, 2 * b, -b * b]), 'carre-d-un-negatif'];
    else second = [poly([1, b, b * b]), 'double-produit'];
    return manche(melanger, {
      consigne: 'developper',
      question: `Développe : (${affine(a, b)})²`,
      bonne: poly([a * a, 2 * a * b, b * b]),
      pieges: [[poly([a * a, 0, b * b]), 'double-produit'], second],
      voisin: (k) => poly([a * a, 2 * a * b + 2 * k, b * b]),
    });
  }
  if (sorte === 'difference') {
    const a = au([1, 1, 2, 3]);
    const b = entre(1, 7);
    return manche(melanger, {
      consigne: 'developper',
      question: `Développe : (${affine(a, -b)})(${affine(a, b)})`,
      bonne: poly([a * a, 0, -b * b]),
      pieges: [
        [poly([a * a, 0, b * b]), 'identite-difference'],
        a > 1 ? [poly([a, 0, -b * b]), 'carre-du-coefficient'] : [poly([1, -2 * b, -b * b]), 'identite-difference'],
      ],
      voisin: (k) => poly([a * a, 0, -b * b - k]),
    });
  }
  const a = au([1, 2, 3]);
  const c = au([1, 2, 3]);
  let b = 0;
  let d = 0;
  while (b === 0) b = entre(-6, 6);
  while (d === 0 || a * d + b * c === 0) d = entre(-6, 6);
  return manche(melanger, {
    consigne: 'developper',
    question: `Développe : (${affine(a, b)})(${affine(c, d)})`,
    bonne: poly([a * c, a * d + b * c, b * d]),
    pieges: [[poly([a * c, 0, b * d]), 'distributivite-double'], [poly([a * c, a * d + b * c, -b * d]), 'regle-des-signes']],
    voisin: (k) => poly([a * c, a * d + b * c + k, b * d]),
  });
}

function factoriser({ au, entre, melanger }) {
  const sorte = au(['difference', 'carre', 'facteur-commun']);
  if (sorte === 'difference') {
    const a = au([1, 1, 2, 3]);
    const b = entre(2, 7);
    return manche(melanger, {
      consigne: 'factoriser',
      question: `Factorise : ${poly([a * a, 0, -b * b])}`,
      bonne: `(${affine(a, -b)})(${affine(a, b)})`,
      pieges: [
        [`(${affine(a, -b)})²`, 'identite-difference'],
        a === 1
          ? [`(x − ${b * b})(x + ${b * b})`, 'racine-carree']
          : [`(${affine(a * a, -b)})(${affine(a * a, b)})`, 'carre-du-coefficient'],
      ],
      voisin: (k) => `(${affine(a, -(b + k))})(${affine(a, b + k)})`,
    });
  }
  if (sorte === 'carre') {
    const a = au([1, 1, 2, 3]);
    let b = 0;
    while (b === 0) b = entre(-6, 6);
    return manche(melanger, {
      consigne: 'factoriser',
      question: `Factorise : ${poly([a * a, 2 * a * b, b * b])}`,
      bonne: `(${affine(a, b)})²`,
      pieges: [[`(${affine(a, -b)})²`, 'identite-signe'], [`(${affine(a, -b)})(${affine(a, b)})`, 'identite-difference']],
      voisin: (k) => `(${affine(a, b + (b > 0 ? k : -k))})²`,
    });
  }
  // (x + p)(ax + b) − (x + p)(cx + d) = (x + p)((a − c)x + b − d)
  let p = 0;
  while (p === 0) p = entre(-5, 5);
  const c = au([1, 2]);
  const a = c + au([1, 2, 3]);
  let b = 0;
  let d = 0;
  while (b === 0) b = entre(-6, 6);
  while (d === 0 || b - d === 0 || b + d === 0) d = entre(-6, 6);
  return manche(melanger, {
    consigne: 'factoriser',
    question: `Factorise : (${affine(1, p)})(${affine(a, b)}) − (${affine(1, p)})(${affine(c, d)})`,
    bonne: `(${affine(1, p)})(${affine(a - c, b - d)})`,
    pieges: [[`(${affine(1, p)})(${affine(a - c, b + d)})`, 'moins-devant-parenthese']],
    voisin: (k) => `(${affine(1, p)})(${affine(a - c + k, b - d)})`,
  });
}

/* --------------------------------------------------------- calcul numérique */

function puissances({ au, entre, melanger }) {
  const sorte = au(['produit', 'puissance', 'quotient']);
  const a = au([2, 3, 5, 10]);
  const p = (e, base = a) => `${base}${sup(e)}`;
  if (sorte === 'produit') {
    let m;
    let n;
    do {
      m = entre(2, 6);
      n = entre(2, 6);
    } while (m === 2 && n === 2);
    return manche(melanger, {
      consigne: 'puissances',
      question: `${p(m)} × ${p(n)} = ?`,
      bonne: p(m + n),
      pieges: [[p(m * n), 'puissances-produit'], [p(m + n, a * a), 'puissances-garder-base']],
      voisin: (k) => p(m + n + k),
    });
  }
  if (sorte === 'puissance') {
    let m;
    let n;
    do {
      m = entre(2, 4);
      n = entre(2, 3);
    } while (m === 2 && n === 2);
    return manche(melanger, {
      consigne: 'puissances',
      question: `(${p(m)})${sup(n)} = ?`,
      bonne: p(m * n),
      pieges: [[p(m + n), 'puissance-de-puissance'], [p(m ** n), 'puissance-de-puissance']],
      voisin: (k) => p(m * n + k),
    });
  }
  const n = entre(2, 4);
  const m = n + entre(2, 5);
  return manche(melanger, {
    consigne: 'puissances',
    question: `${p(m)} ÷ ${p(n)} = ?`,
    bonne: p(m - n),
    pieges: [[p(m + n), 'puissances-quotient'], [m % n === 0 ? p(m / n) : null, 'puissances-quotient']],
    voisin: (k) => p(m - n + k),
  });
}

function fractions({ entre, melanger }) {
  let a;
  let b;
  let c;
  let d;
  do {
    b = entre(2, 7);
    d = entre(2, 9);
    a = entre(1, b - 1);
    c = entre(1, d - 1);
  } while (b === d || pgcd(a, b) !== 1 || pgcd(c, d) !== 1);
  return manche(melanger, {
    consigne: 'fractions',
    question: `${a}/${b} + ${c}/${d} = ?`,
    bonne: fr(a * d + b * c, b * d),
    pieges: [[fr(a + c, b + d), 'fractions-denominateurs'], [fr(a + c, b * d), 'fractions-numerateurs']],
    voisin: (k) => fr(a * d + b * c + k, b * d),
  });
}

/* -------------------------------------------------- équations, inéquations */

const SENS = {
  '>': '<', '<': '>', '≥': '≤', '≤': '≥',
};

function equation({ au, entre, melanger }) {
  const sorte = au(['lineaire', 'inequation', 'produit-nul']);
  if (sorte === 'lineaire') {
    const a = au([2, 3, 4, 5, -2, -3, -4, -5]);
    let b = 0;
    while (b === 0) b = entre(-9, 9);
    let c;
    do c = entre(-9, 9); while (c === b);
    return manche(melanger, {
      consigne: 'equation',
      question: `Résous : ${affine(a, b)} = ${nb(c)}`,
      bonne: `x = ${fr(c - b, a)}`,
      pieges: [[`x = ${fr(c + b, a)}`, 'transposer-signe'], [`x = ${fr(a, c - b)}`, 'diviser-sens']],
      voisin: (k) => `x = ${fr(c - b + k, a)}`,
    });
  }
  if (sorte === 'inequation') {
    const a = au([-1, -2, -3, -4, -5, -2, -3, 2, 3, 4]);
    let b = 0;
    while (b === 0) b = entre(-9, 9);
    const op = au(['>', '<', '≥', '≤']);
    const bon = a > 0 ? op : SENS[op];
    return manche(melanger, {
      consigne: 'inequation',
      question: `Résous : ${affine(a, b)} ${op} 0`,
      bonne: `x ${bon} ${fr(-b, a)}`,
      pieges: [
        [`x ${SENS[bon]} ${fr(-b, a)}`, a < 0 ? 'inegalite-diviser-negatif' : 'inegalite-sens'],
        [`x ${bon} ${fr(b, a)}`, 'transposer-signe'],
      ],
      voisin: (k) => `x ${bon} ${fr(-b + k, a)}`,
    });
  }
  let a;
  let c;
  let b;
  let d;
  do {
    a = au([1, 2, 3]);
    c = au([1, 2, 3]);
    b = entre(-7, 7);
    d = entre(-7, 7);
  } while ((a === 1 && c === 1) || b === 0 || d === 0
    || b * c === a * d || b * c === -a * d);
  return manche(melanger, {
    consigne: 'produit-nul',
    question: `Résous : (${affine(a, b)})(${affine(c, d)}) = 0`,
    bonne: ensemble([[-b, a], [-d, c]]),
    pieges: [[ensemble([[b, a], [d, c]]), 'produit-nul-signe'], [ensemble([[-b, 1], [-d, 1]]), 'produit-nul-diviser']],
    voisin: (k) => ensemble([[-b + k * a, a], [-d, c]]),
  });
}

/* ---------------------------------------------------- lecture graphique */

function graphique({ au, entre, melanger }) {
  const sorte = au(['image', 'coefficient', 'droite', 'signe', 'equation']);
  if (sorte === 'image') {
    const x = entre(-6, 6);
    let y;
    do y = entre(-6, 6); while (y === x);
    const [X, Y] = [nb(x), nb(y)];
    const bonne = au([`f(${X}) = ${Y}`, `${Y} est l’image de ${X}`, `${X} est un antécédent de ${Y}`]);
    const [p1, p2] = melanger([`f(${Y}) = ${X}`, `${X} est l’image de ${Y}`, `${Y} est un antécédent de ${X}`]);
    return manche(melanger, {
      consigne: 'image-antecedent',
      question: `Le point (${X} ; ${Y}) est sur la courbe de f. Qu’en déduit-on ?`,
      bonne,
      pieges: [[p1, 'image-ou-antecedent'], [p2, 'image-ou-antecedent']],
      voisin: (k) => `f(${X}) = ${nb(y + k)}`,
    });
  }
  if (sorte === 'coefficient') {
    const x1 = entre(-4, 4);
    const y1 = entre(-5, 5);
    const dx = entre(2, 4);
    let dy;
    do dy = entre(-8, 8); while (dy === 0 || Math.abs(dy) === dx);
    return manche(melanger, {
      consigne: 'coefficient-directeur',
      question: `A(${nb(x1)} ; ${nb(y1)}) et B(${nb(x1 + dx)} ; ${nb(y1 + dy)}). Coefficient directeur de la droite (AB) ?`,
      bonne: fr(dy, dx),
      pieges: [[fr(dx, dy), 'pente-inverse'], [nb(dy), 'pente-diviser']],
      voisin: (k) => fr(dy + k, dx),
    });
  }
  if (sorte === 'droite') {
    let m = 0;
    let b = 0;
    while (m === 0) m = entre(-4, 4);
    while (b === 0 || b === m) b = entre(-6, 6);
    const dx = entre(2, 3);
    return manche(melanger, {
      consigne: 'equation-droite',
      question: `Une droite coupe l’axe des ordonnées au point (0 ; ${nb(b)}) et passe par le point (${dx} ; ${nb(b + m * dx)}). Son équation réduite ?`,
      bonne: `y = ${affine(m, b)}`,
      pieges: [[`y = ${affine(b, m)}`, 'droite-a-et-b'], [`y = ${affine(m * dx, b)}`, 'pente-diviser']],
      voisin: (k) => `y = ${affine(m, b + k)}`,
    });
  }
  if (sorte === 'signe') {
    const x1 = entre(-6, 2);
    const x2 = x1 + entre(2, 6);
    const dessus = au([true, false]);
    const op = au(['>', '<', '≥', '≤']);
    const strict = op === '>' || op === '<';
    const positif = op === '>' || op === '≥';
    const dedans = dessus === positif;
    const [A, B] = [nb(x1), nb(x2)];
    const interieur = (s) => (s ? `]${A} ; ${B}[` : `[${A} ; ${B}]`);
    const exterieur = (s) => (s ? `]−∞ ; ${A}[ ∪ ]${B} ; +∞[` : `]−∞ ; ${A}] ∪ [${B} ; +∞[`);
    const bonne = dedans ? interieur(strict) : exterieur(strict);
    return manche(melanger, {
      consigne: 'signe-lu',
      question: `La courbe de f coupe l’axe des abscisses en ${A} et en ${B} ; elle est au-${dessus ? 'dessus' : 'dessous'} de cet axe entre ces deux points, au-${dessus ? 'dessous' : 'dessus'} ailleurs. Solutions de f(x) ${op} 0 ?`,
      bonne,
      pieges: [
        [dedans ? exterieur(strict) : interieur(strict), 'signe-lecture'],
        [dedans ? interieur(!strict) : exterieur(!strict), 'inegalite-stricte'],
      ],
      voisin: (k) => (dedans ? `]${A} ; ${nb(x2 + k)}[` : `]−∞ ; ${nb(x1 - k)}[ ∪ ]${B} ; +∞[`),
    });
  }
  const x1 = entre(-6, 2);
  const x2 = x1 + entre(2, 6);
  let k = 0;
  while (k === 0 || k === x1 || k === x2) k = entre(-5, 5);
  return manche(melanger, {
    consigne: 'equation-lue',
    question: `La droite d’équation y = ${nb(k)} coupe la courbe de f en deux points seulement, d’abscisses ${nb(x1)} et ${nb(x2)}. Solutions de f(x) = ${nb(k)} ?`,
    bonne: ensemble([[x1, 1], [x2, 1]]),
    pieges: [[`{${nb(k)}}`, 'solutions-abscisses']],
    voisin: (j) => ensemble([[x1, 1], [x2 + j, 1]]),
  });
}

/* ----------------------------------------------------------- probabilités */

function probabilites({ au, entre, melanger }) {
  if (au([true, false])) {
    const pA = au([0.2, 0.4, 0.5, 0.8]);
    const pc = au([0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.9]);
    const inter = Math.round(pA * pc * 1e6) / 1e6;
    return manche(melanger, {
      consigne: 'conditionnelle',
      question: `P(A) = ${nb(pA)} et P(A ∩ B) = ${nb(inter)}. Que vaut P_A(B) ?`,
      bonne: nb(pc),
      pieges: [[nb(pA * inter), 'conditionnelle-diviser'], [nb(inter), 'conditionnelle-intersection']],
      voisin: (k) => nb(pc + 0.05 * k),
    });
  }
  const total = au([200, 400, 500]);
  const g = au([40, 50, 80, 100]);
  const s = entre(3, g - 3);
  return manche(melanger, {
    consigne: 'tableau-croise',
    question: `Dans un lycée de ${total} élèves, ${g} font du théâtre, dont ${s} en terminale. On choisit au hasard un élève qui fait du théâtre. Probabilité qu’il soit en terminale ?`,
    bonne: nb(s / g),
    pieges: [[nb(s / total), 'conditionnelle-univers'], [nb(g / total), 'conditionnelle-evenement']],
    voisin: (k) => nb((s + k) / g),
  });
}

/* ------------------------------------------------------------- conversions */

function conversion({ au, entre, melanger }) {
  const sorte = au(['heures', 'aire', 'vitesse']);
  if (sorte === 'heures') {
    const h = entre(1, 4);
    const f = au([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.75, 0.8, 0.9]);
    const min = Math.round(f * 60);
    return manche(melanger, {
      consigne: 'heures',
      question: `${nb(h + f)} h = ?`,
      bonne: `${h} h ${min} min`,
      pieges: [[`${h} h ${Math.round(f * 100)} min`, 'heures-decimales']],
      voisin: (k) => `${h + k} h ${min} min`,
    });
  }
  if (sorte === 'aire') {
    const v = au([0.5, 0.8, 1.2, 1.5, 2.5, 3.5, 4.2]);
    const [unite, cible, facteur, piege, phrase] = au([
      ['m²', 'cm²', 10000, 100, 'conversion-aire'],
      ['m²', 'dm²', 100, 10, 'conversion-aire'],
      ['m³', 'L', 1000, 100, 'conversion-volume'],
    ]);
    return manche(melanger, {
      consigne: 'aire-volume',
      question: `${nb(v)} ${unite} = ? ${cible}`,
      bonne: nb(v * facteur),
      pieges: [[nb(v * piege), phrase], [nb(v * facteur * 10), phrase]],
      voisin: (k) => nb(v * facteur + k),
    });
  }
  const v = 18 * entre(1, 8);
  return manche(melanger, {
    consigne: 'vitesse',
    question: `${v} km/h = ? m/s`,
    bonne: nb((v * 5) / 18),
    pieges: [[nb(v * 3.6), 'vitesse-sens'], [nb(v / 60), 'vitesse-heure-secondes']],
    voisin: (k) => nb((v * 5) / 18 + k),
  });
}

/* ------------------------------------------------------------ la partie */

const TAUX = [coefficient, appliquer, calculerTaux, successives, reciproque];
const RESTE = [proportion, developper, factoriser, puissances, fractions, equation, graphique, probabilites, conversion];

// La 1re générale et la 1re technologique passent le même QCM d'automatismes.
export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const sortes = [...t.melanger(TAUX).slice(0, 3), ...t.melanger(RESTE).slice(0, 5)];
  return t.melanger(sortes.map((f) => f(t)));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  coefficient: 'Trouve le coefficient multiplicateur.',
  'valeur-finale': 'Applique le taux d’évolution, et trouve la valeur finale.',
  'valeur-initiale': 'Retrouve la valeur de départ.',
  taux: 'Calcule le taux d’évolution.',
  successives: 'Deux évolutions de suite : trouve l’évolution globale.',
  reciproque: 'Trouve l’évolution réciproque.',
  'pourcentage-de': 'Calcule ce pourcentage.',
  'proportion-de-proportion': 'Calcule la proportion d’une proportion.',
  developper: 'Développe et réduis.',
  factoriser: 'Factorise.',
  puissances: 'Calcule avec les règles des puissances.',
  fractions: 'Calcule, et donne le résultat irréductible.',
  equation: 'Résous cette équation.',
  inequation: 'Résous cette inéquation.',
  'produit-nul': 'Résous cette équation produit nul.',
  'image-antecedent': 'Choisis la phrase juste.',
  'coefficient-directeur': 'Calcule le coefficient directeur de la droite.',
  'equation-droite': 'Retrouve l’équation réduite de la droite.',
  'signe-lu': 'Lis les solutions sur la courbe décrite.',
  'equation-lue': 'Lis les solutions sur la courbe décrite.',
  conditionnelle: 'Calcule cette probabilité conditionnelle.',
  'tableau-croise': 'Calcule cette probabilité, en regardant bien parmi qui on choisit.',
  heures: 'Convertis cette durée en heures et minutes.',
  'aire-volume': 'Convertis dans l’unité demandée.',
  vitesse: 'Convertis cette vitesse en mètres par seconde.',

  'coefficient-un-plus': 'Le coefficient multiplicateur vaut un plus le taux pour une hausse, un moins le taux pour une baisse.',
  'coefficient-hausse-baisse': 'Une hausse donne un coefficient plus grand que un, une baisse un coefficient plus petit que un.',
  'pourcentage-pas-euros': 'Le taux est un pourcentage, pas un montant : multiplie par le coefficient multiplicateur.',
  'variation-seule': 'Ce nombre n’est que la variation. Multiplie directement la valeur de départ par le coefficient multiplicateur.',
  'taux-inverse': 'Appliquer le taux inverse ne ramène pas au départ : divise la valeur finale par le coefficient multiplicateur.',
  'taux-diviser-par-depart': 'Un taux d’évolution se calcule par rapport au départ : divise l’écart par la valeur de départ, pas par celle d’arrivée.',
  'taux-pas-ecart': 'L’écart n’est pas un taux : divise-le par la valeur de départ, puis multiplie par cent.',
  'taux-pas-coefficient': 'Ça, c’est le coefficient multiplicateur écrit en pourcentage. Le taux, c’est le coefficient moins un.',
  'taux-successifs': 'Les taux successifs ne s’additionnent pas : on multiplie les coefficients multiplicateurs.',
  'hausse-baisse-pas-nulle': 'Une hausse puis une baisse du même pourcentage ne ramènent pas au départ : multiplie les deux coefficients.',
  'reciproque-pas-oppose': 'La réciproque n’est pas l’opposé du taux : divise un par le coefficient multiplicateur, puis retire un.',
  'pourcentage-sur-cent': 'Prendre un pourcentage, c’est multiplier par le taux, puis diviser par cent.',
  'pourcentage-pas-soustraction': 'Un pourcentage ne se retranche pas : multiplie la quantité par le taux, puis divise par cent.',
  'proportion-de-la-partie': 'Cette part n’est prise que parmi les internes : multiplie-la par la part des internes dans tout le lycée.',
  'proportions-additionnees': 'Une proportion d’une proportion se multiplie : on ne les additionne pas.',
  'double-produit': 'Une identité remarquable a trois termes : n’oublie pas le double produit.',
  'carre-du-coefficient': 'Le carré porte sur tout le terme : le coefficient de x est élevé au carré lui aussi.',
  'carre-d-un-negatif': 'Le carré d’un nombre négatif est positif : le dernier terme s’ajoute.',
  'identite-difference': 'Une somme fois une différence des mêmes termes donne une différence de deux carrés, sans terme en x.',
  'distributivite-double': 'Chaque terme de la première parenthèse multiplie chaque terme de la seconde : il y a quatre produits.',
  'regle-des-signes': 'Vérifie la règle des signes dans chaque produit.',
  'racine-carree': 'Écris le nombre comme un carré : c’est sa racine carrée qui va dans les parenthèses.',
  'identite-signe': 'Le signe du double produit donne le signe dans la parenthèse.',
  'moins-devant-parenthese': 'Le signe moins devant la parenthèse change le signe de tous ses termes.',
  'puissances-produit': 'Pour multiplier deux puissances d’un même nombre, on additionne les exposants.',
  'puissances-garder-base': 'On garde la même base : seuls les exposants se combinent.',
  'puissance-de-puissance': 'Une puissance de puissance : on multiplie les exposants.',
  'puissances-quotient': 'Pour diviser deux puissances d’un même nombre, on soustrait les exposants.',
  'fractions-denominateurs': 'On n’additionne pas les dénominateurs : mets d’abord les fractions au même dénominateur.',
  'fractions-numerateurs': 'Quand tu changes un dénominateur, multiplie aussi son numérateur par le même nombre.',
  'transposer-signe': 'Un terme qui change de membre change de signe.',
  'diviser-sens': 'Pour isoler x, divise par son coefficient : le coefficient va au dénominateur.',
  'inegalite-diviser-negatif': 'Diviser par un nombre négatif change le sens de l’inégalité.',
  'inegalite-sens': 'Diviser par un nombre positif garde le sens de l’inégalité.',
  'produit-nul-signe': 'Chaque facteur s’annule pour une valeur précise : résous chaque facteur égal à zéro, et regarde bien le signe.',
  'produit-nul-diviser': 'Après avoir changé de membre, divise encore par le coefficient de x.',
  'image-ou-antecedent': 'Un point de la courbe a pour coordonnées x et f de x : l’abscisse a pour image l’ordonnée.',
  'pente-inverse': 'Le coefficient directeur, c’est l’écart des ordonnées divisé par l’écart des abscisses, dans cet ordre.',
  'pente-diviser': 'Divise l’écart des ordonnées par l’écart des abscisses.',
  'droite-a-et-b': 'Dans y égale a x plus b, a est le coefficient directeur et b l’ordonnée à l’origine.',
  'signe-lecture': 'f de x est positif là où la courbe est au-dessus de l’axe des abscisses, négatif là où elle est au-dessous.',
  'inegalite-stricte': 'Inégalité stricte, crochets ouverts sur les zéros ; inégalité large, crochets fermés.',
  'solutions-abscisses': 'Les solutions sont des abscisses : celles des points d’intersection, pas leur ordonnée.',
  'conditionnelle-diviser': 'La probabilité de B sachant A, c’est la probabilité de A et B divisée par celle de A.',
  'conditionnelle-intersection': 'Ça, c’est la probabilité de A et B. Sachant A, on la divise par la probabilité de A.',
  'conditionnelle-univers': 'On choisit dans un groupe seulement : divise par l’effectif de ce groupe, pas par l’effectif total.',
  'conditionnelle-evenement': 'Ça, c’est la probabilité d’être dans le groupe. Ici, on sait déjà qu’on y est.',
  'heures-decimales': 'Une heure compte soixante minutes : la partie décimale se multiplie par soixante.',
  'conversion-aire': 'Pour une aire, chaque unité vaut cent fois la suivante : on décale de deux rangs par unité.',
  'conversion-volume': 'Un mètre cube vaut mille litres : pour un volume, on décale de trois rangs par unité.',
  'vitesse-sens': 'Un mètre par seconde est plus rapide qu’un kilomètre par heure : il y en a moins, on divise par trois virgule six.',
  'vitesse-heure-secondes': 'Une heure compte trois mille six cents secondes, pas soixante : divise par trois virgule six.',

  'coefficient-regle': 'Hausse : un plus le taux. Baisse : un moins le taux.',
  'valeur-finale-regle': 'Valeur finale égale valeur de départ fois coefficient multiplicateur.',
  'valeur-initiale-regle': 'Valeur de départ égale valeur finale divisée par le coefficient multiplicateur.',
  'taux-regle': 'Taux égale arrivée moins départ, divisé par départ.',
  'successives-regle': 'Multiplie les coefficients multiplicateurs, puis retire un.',
  'reciproque-regle': 'Le coefficient réciproque est l’inverse du coefficient : un divisé par lui.',
  'pourcentage-de-regle': 'Multiplie la quantité par le taux, puis divise par cent.',
  'proportion-de-proportion-regle': 'Multiplie les deux proportions entre elles.',
  'developper-regle': 'Développe terme à terme, ou utilise la bonne identité remarquable, puis réduis.',
  'factoriser-regle': 'Cherche un facteur commun ou une identité remarquable, et vérifie en redéveloppant.',
  'puissances-regle': 'Produit : on additionne les exposants. Quotient : on les soustrait. Puissance de puissance : on les multiplie.',
  'fractions-regle': 'Même dénominateur d’abord, puis additionne les numérateurs, et simplifie.',
  'equation-regle': 'Isole x : passe la constante de l’autre côté, puis divise par le coefficient de x.',
  'inequation-regle': 'Isole x, et change le sens de l’inégalité si tu divises par un négatif.',
  'produit-nul-regle': 'Un produit est nul si et seulement si l’un de ses facteurs est nul.',
  'image-antecedent-regle': 'f de l’abscisse égale l’ordonnée.',
  'coefficient-directeur-regle': 'Écart des ordonnées divisé par écart des abscisses.',
  'equation-droite-regle': 'L’ordonnée à l’origine se lit sur l’axe, puis le coefficient directeur avec le second point.',
  'signe-lu-regle': 'Au-dessus de l’axe, f est positive ; au-dessous, négative. Regarde aussi si les zéros comptent.',
  'equation-lue-regle': 'Les solutions sont les abscisses des points d’intersection.',
  'conditionnelle-regle': 'P sachant A de B égale P de A inter B, divisé par P de A.',
  'tableau-croise-regle': 'Divise par l’effectif du groupe dans lequel on choisit.',
  'heures-regle': 'Multiplie la partie décimale par soixante pour avoir les minutes.',
  'aire-volume-regle': 'Aire : deux rangs par unité. Volume : trois rangs, et un décimètre cube vaut un litre.',
  'vitesse-regle': 'Pour passer des kilomètres par heure aux mètres par seconde, divise par trois virgule six.',
};
