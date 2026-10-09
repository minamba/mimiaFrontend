/**
 * LE LOGARITHME — terminale générale (spécialité). Professeure : Nora.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_TLE_LOG, et MATH_TLE_DERIV_COMPOSEE pour
 * la dérivée de ln u.
 *
 * SEPT SORTES DE MANCHES (2 + 1 + 1 + 1 + 1 + 1 + 1, mélangées) :
 *   - LES PROPRIÉTÉS : ln a + ln b, ln a − ln b, n ln a. LES PIÈGES, les vrais :
 *     ln(a + b) = ln a + ln b, ln a × ln b, ln(a − b), ln a ÷ ln b,
 *     ln(n a) et (ln a)ⁿ pour n ln a ;
 *   - LES VALEURS : ln 1, ln e, ln(eᵃ), e^(ln a), ln(1/a). LES PIÈGES : ln 1 = 1,
 *     ln e = 0, la réciproque prise à l'envers, ln(1/a) = 1/ln a ;
 *   - LE DOMAINE de ln(ax + b). LES PIÈGES : le crochet fermé (ln 0 n'existe
 *     pas), le sens de l'inégalité quand a est négatif ;
 *   - L'ÉQUATION ln(ax + b) = ln(cx + d). LE PIÈGE ROI : garder une solution
 *     hors du domaine. Et le signe perdu en changeant de membre ;
 *   - L'ÉQUATION SIMPLE : ln x = k, eˣ = a, eˣ = −a. LES PIÈGES : x = 10ᵏ (ln
 *     n'est pas le logarithme décimal), x = ln k, une solution pour eˣ < 0 ;
 *   - L'INÉQUATION : ln x < k, ln x > k, eˣ > a, eˣ < a. LES PIÈGES : oublier
 *     x > 0, changer le sens, recopier le domaine de ln pour eˣ ;
 *   - LA DÉRIVÉE DE ln u : u′/u. LES PIÈGES : 1/u, 1/u′.
 *
 * Toutes les valeurs sont calculées ici ; un piège qui vaudrait la bonne
 * réponse (même nombre, même fonction) est écarté avant d'être proposé.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'logarithme', titre: 'Le logarithme', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'Le logarithme',
    accroche: 'ln(a + b) n’est pas ln a + ln b.',
    competences: ['MATH_TLE_LOG', 'MATH_TLE_DERIV_COMPOSEE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------ les outils */

const SUP = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻',
};
const sup = (n) => String(n).split('').map((c) => SUP[c]).join('');
const entier = (n) => (n < 0 ? `−${-n}` : `${n}`);
const AUCUNE = 'aucune solution';

/** « 3x² − x + 1 » à partir de [[3, 2], [−1, 1], [1, 0]]. */
function poly(termes) {
  let s = '';
  termes.filter(([c]) => c !== 0).forEach(([c, d]) => {
    const abs = Math.abs(c);
    let x = `x${sup(d)}`;
    if (d === 1) x = 'x';
    if (d === 0) x = '';
    const corps = d !== 0 && abs === 1 ? x : `${abs}${x}`;
    if (s === '') s = c < 0 ? `−${corps}` : corps;
    else s += c < 0 ? ` − ${corps}` : ` + ${corps}`;
  });
  return s || '0';
}

const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
/** Deux valeurs égales : nombres, ou fonctions vues en quelques points. */
function memes(u, v) {
  if (Array.isArray(u) && Array.isArray(v)) return u.every((a, i) => proche(a, v[i]));
  if (typeof u === 'number' && typeof v === 'number') return proche(u, v);
  return u === v;
}

/** Les points où l'on compare deux fonctions (toutes définies pour x > 0). */
const POINTS = [0.5, 1.3, 2.7];
const enPoints = (f) => POINTS.map(f);

/**
 * Une manche à trois choix : la bonne réponse, deux pièges nommés (tirés
 * parmi ceux qui valent autre chose que la bonne réponse), des voisins sinon.
 * Chaque candidat est [libellé, valeur] ; un piège est [libellé, valeur, phrase].
 */
function manche(t, {
  consigne, question, bonne, pieges = [], voisins = [], aide,
}) {
  const liste = [bonne];
  const table = {};
  const dejaLa = ([l, v]) => liste.some(([l2, v2]) => l2 === l || memes(v2, v));
  t.melanger(pieges).forEach(([l, v, phrase]) => {
    if (liste.length < 3 && !dejaLa([l, v])) {
      liste.push([l, v]);
      table[l] = phrase;
    }
  });
  voisins.forEach((c) => { if (liste.length < 3 && !dejaLa(c)) liste.push(c); });
  const m = {
    consigne,
    question,
    choix: t.melanger(liste).map(([l]) => ({ cle: l, libelle: l })),
    bonne: bonne[0],
    pieges: table,
  };
  if (aide) m.aide = aide;
  return m;
}

const ln = (n) => [`ln ${n}`, Math.log(n)];
const voisinsLn = (n) => [1, 2, 3].map((k) => ln(n + k));

/* -------------------------------------------------------- les propriétés */

function proprietes(t, sorte) {
  if (sorte === 'somme') {
    let a;
    let b;
    do {
      a = t.entre(2, 9);
      b = t.entre(2, 9);
    } while (a === b);
    return manche(t, {
      consigne: 'proprietes',
      question: `ln ${a} + ln ${b} = ?`,
      bonne: ln(a * b),
      pieges: [
        [...ln(a + b), 'ln-somme'],
        [`ln ${a} × ln ${b}`, Math.log(a) * Math.log(b), 'ln-produit'],
      ],
      voisins: voisinsLn(a * b),
    });
  }
  if (sorte === 'difference') {
    const b = t.entre(2, 6);
    const q = t.entre(2, 6);
    const a = b * q;
    return manche(t, {
      consigne: 'proprietes',
      question: `ln ${a} − ln ${b} = ?`,
      bonne: ln(q),
      pieges: [
        [...ln(a - b), 'ln-difference'],
        [`ln ${a} ÷ ln ${b}`, Math.log(a) / Math.log(b), 'ln-quotient'],
      ],
      voisins: voisinsLn(q),
    });
  }
  const n = t.entre(2, 4);
  const a = t.entre(2, 5);
  return manche(t, {
    consigne: 'proprietes',
    question: `${n} ln ${a} = ?`,
    bonne: ln(a ** n),
    pieges: [
      [...ln(n * a), 'ln-puissance'],
      [`(ln ${a})${sup(n)}`, Math.log(a) ** n, 'ln-puissance'],
    ],
    voisins: voisinsLn(a ** n),
  });
}

/* ------------------------------------------------------------- les valeurs */

const nombre = (v) => [entier(v), v];

function valeurs(t) {
  const sorte = t.entre(1, 5);
  if (sorte === 1) {
    return manche(t, {
      consigne: 'valeurs',
      question: 'ln 1 = ?',
      bonne: nombre(0),
      pieges: [[...nombre(1), 'ln-de-un'], ['e', Math.E, 'ln-de-un']],
      voisins: [nombre(-1)],
    });
  }
  if (sorte === 2) {
    return manche(t, {
      consigne: 'valeurs',
      question: 'ln e = ?',
      bonne: nombre(1),
      pieges: [[...nombre(0), 'ln-de-e'], ['e', Math.E, 'ln-de-e']],
      voisins: [nombre(-1)],
    });
  }
  if (sorte === 3) {
    let a;
    do a = t.entre(-5, 9); while (a === 0 || a === 1);
    return manche(t, {
      consigne: 'valeurs',
      question: `ln(e${sup(a)}) = ?`,
      bonne: nombre(a),
      pieges: [[`e${sup(a)}`, Math.exp(a), 'reciproques'], [...nombre(-a), 'reciproques']],
      voisins: [nombre(a + 1), nombre(a - 1)],
    });
  }
  if (sorte === 4) {
    const a = t.entre(2, 9);
    return manche(t, {
      consigne: 'valeurs',
      question: `e^(ln ${a}) = ?`,
      bonne: nombre(a),
      pieges: [[...ln(a), 'reciproques'], [`e${sup(a)}`, Math.exp(a), 'reciproques']],
      voisins: [nombre(a + 1), nombre(a - 1)],
    });
  }
  const a = t.entre(2, 9);
  return manche(t, {
    consigne: 'valeurs',
    question: `ln(1/${a}) = ?`,
    bonne: [`−ln ${a}`, -Math.log(a)],
    pieges: [[`1/ln ${a}`, 1 / Math.log(a), 'ln-inverse'], [...ln(a), 'ln-inverse']],
    voisins: [[`−ln ${a + 1}`, -Math.log(a + 1)]],
  });
}

/* -------------------------------------------------------------- le domaine */

/** ln(ax + b), écrit « ln(2x − 6) » ou « ln(6 − 2x) ». */
function interieur(a, b) {
  if (a > 0 || b === 0) return poly([[a, 1], [b, 0]]);
  return poly([[b, 0], [a, 1]]);
}

function domaine(t) {
  let a;
  do a = t.entre(-3, 3); while (a === 0);
  const r = t.entre(-5, 5);
  const b = -a * r;
  const droite = [`]${entier(r)} ; +∞[`, `]${r};+`];
  const gauche = [`]−∞ ; ${entier(r)}[`, `-;${r}[`];
  const bonne = a > 0 ? droite : gauche;
  const ferme = a > 0 ? [`[${entier(r)} ; +∞[`, `[${r};+`] : [`]−∞ ; ${entier(r)}]`, `-;${r}]`];
  return manche(t, {
    consigne: 'domaine',
    question: `f(x) = ln(${interieur(a, b)})\nDomaine de définition de f ?`,
    bonne,
    pieges: [[...(a > 0 ? gauche : droite), 'domaine-signe'], [...ferme, 'domaine-strict']],
    voisins: [['ℝ', 'R']],
  });
}

/* ------------------------------------------------------------ les équations */

const solution = (x) => [`x = ${entier(x)}`, x];

function equation(t) {
  let a;
  let c;
  do {
    a = t.entre(1, 5);
    c = t.entre(1, 5);
  } while (a === c);
  const x0 = t.entre(-6, 6);
  // La valeur commune sous les deux logarithmes : positive, la solution tient.
  let v;
  do v = t.entre(-5, 6); while (v === 0);
  const b = v - a * x0;
  const d = v - c * x0;
  const question = `ln(${poly([[a, 1], [b, 0]])}) = ln(${poly([[c, 1], [d, 0]])})\nSolutions ?`;
  const aucune = [AUCUNE, AUCUNE];
  const signe = [...solution(-x0), 'isoler-x'];
  if (v > 0) {
    return manche(t, {
      consigne: 'equation',
      question,
      bonne: solution(x0),
      pieges: [[...aucune, 'solution-acceptee'], signe],
      voisins: [solution(x0 + 1), solution(x0 - 1)],
      aide: 'equation-regle',
    });
  }
  return manche(t, {
    consigne: 'equation',
    question,
    bonne: aucune,
    pieges: [[...solution(x0), 'domaine-equation'], signe],
    voisins: [solution(x0 + 1)],
    aide: 'equation-regle',
  });
}

function equationSimple(t) {
  const sorte = t.entre(1, 3);
  if (sorte === 1) {
    let k;
    do k = t.entre(-3, 5); while (k === 0 || k === 1);
    const pieges = [[`x = 10${sup(k)}`, 10 ** k, 'ln-pas-decimal']];
    if (k > 0) pieges.push([`x = ln ${k}`, Math.log(k), 'defaire-ln']);
    return manche(t, {
      consigne: 'equation-simple',
      question: `ln x = ${entier(k)}\nSolution ?`,
      bonne: [`x = e${sup(k)}`, Math.exp(k)],
      pieges,
      voisins: [[`x = e${sup(k + 1)}`, Math.exp(k + 1)], [`x = ${entier(k)}`, k]],
    });
  }
  const a = t.entre(2, 9);
  if (sorte === 2) {
    return manche(t, {
      consigne: 'equation-simple',
      question: `eˣ = ${a}\nSolution ?`,
      bonne: [`x = ln ${a}`, Math.log(a)],
      pieges: [[`x = e${sup(a)}`, Math.exp(a), 'reciproques']],
      voisins: [[`x = ln ${a + 1}`, Math.log(a + 1)], [`x = −ln ${a}`, -Math.log(a)]],
    });
  }
  return manche(t, {
    consigne: 'equation-simple',
    question: `eˣ = −${a}\nSolution ?`,
    bonne: [AUCUNE, AUCUNE],
    pieges: [[`x = −ln ${a}`, -Math.log(a), 'exp-positive'], [`x = ln ${a}`, Math.log(a), 'exp-positive']],
  });
}

/* --------------------------------------------------------- les inéquations */

function inequation(t) {
  const sorte = t.entre(1, 4);
  if (sorte <= 2) {
    let k;
    do k = t.entre(-2, 4); while (k === 0 || k === 1);
    const ek = `e${sup(k)}`;
    const avant = `]0 ; ${ek}[`;
    const apres = `]${ek} ; +∞[`;
    if (sorte === 1) {
      return manche(t, {
        consigne: 'inequation',
        question: `ln x < ${entier(k)}\nSolutions ?`,
        bonne: [avant, avant],
        pieges: [[`]−∞ ; ${ek}[`, `]−∞ ; ${ek}[`, 'domaine-inequation'], [apres, apres, 'sens-inequation']],
        aide: 'inequation-regle',
      });
    }
    return manche(t, {
      consigne: 'inequation',
      question: `ln x > ${entier(k)}\nSolutions ?`,
      bonne: [apres, apres],
      pieges: [[avant, avant, 'sens-inequation'], [`]${entier(k)} ; +∞[`, `]${entier(k)} ; +∞[`, 'defaire-ln']],
      aide: 'inequation-regle',
    });
  }
  const a = t.entre(2, 9);
  const apres = `]ln ${a} ; +∞[`;
  const avant = `]−∞ ; ln ${a}[`;
  if (sorte === 3) {
    return manche(t, {
      consigne: 'inequation',
      question: `eˣ > ${a}\nSolutions ?`,
      bonne: [apres, apres],
      pieges: [[`]e${sup(a)} ; +∞[`, `]e${sup(a)} ; +∞[`, 'reciproques'], [avant, avant, 'sens-inequation']],
      aide: 'inequation-regle',
    });
  }
  return manche(t, {
    consigne: 'inequation',
    question: `eˣ < ${a}\nSolutions ?`,
    bonne: [avant, avant],
    pieges: [[`]0 ; ln ${a}[`, `]0 ; ln ${a}[`, 'exp-partout'], [apres, apres, 'sens-inequation']],
    aide: 'inequation-regle',
  });
}

/* ---------------------------------------------------- la dérivée de ln u */

function derivee(t) {
  if (t.entre(0, 1)) {
    // u(x) = a x² + c, positive partout.
    const a = t.entre(1, 4);
    const c = t.entre(1, 6);
    const u = poly([[a, 2], [c, 0]]);
    const du = poly([[2 * a, 1]]);
    const U = (x) => a * x * x + c;
    return manche(t, {
      consigne: 'derivee',
      question: `f(x) = ln(${u})\nf′(x) = ?`,
      bonne: [`${du} / (${u})`, enPoints((x) => (2 * a * x) / U(x))],
      pieges: [
        [`1 / (${u})`, enPoints((x) => 1 / U(x)), 'oubli-u-prime'],
        [`1 / (${du})`, enPoints((x) => 1 / (2 * a * x)), 'ln-u-derivee'],
        [`ln(${du})`, enPoints((x) => Math.log(2 * a * x)), 'deriver-dedans'],
      ],
      voisins: [[`${du} / (${poly([[a, 2], [c + 1, 0]])})`, enPoints((x) => (2 * a * x) / (U(x) + 1))]],
    });
  }
  // u(x) = a x + b, étudiée là où elle est positive (x > 0).
  const a = t.entre(2, 5);
  const b = t.entre(1, 6);
  const u = poly([[a, 1], [b, 0]]);
  const U = (x) => a * x + b;
  return manche(t, {
    consigne: 'derivee',
    question: `f(x) = ln(${u}), pour x > 0\nf′(x) = ?`,
    bonne: [`${a} / (${u})`, enPoints((x) => a / U(x))],
    pieges: [
      [`1 / (${u})`, enPoints((x) => 1 / U(x)), 'oubli-u-prime'],
      [`1/${a}`, enPoints(() => 1 / a), 'ln-u-derivee'],
    ],
    voisins: [[`${a} / (${poly([[a, 1], [b + 1, 0]])})`, enPoints((x) => a / (U(x) + 1))]],
  });
}

/* ------------------------------------------------------------- la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const [p1, p2] = t.melanger(['somme', 'difference', 'puissance']);
  const liste = [
    proprietes(t, p1), proprietes(t, p2),
    valeurs(t), domaine(t),
    equation(t), equationSimple(t),
    inequation(t), derivee(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  proprietes: 'Écris ce calcul avec un seul logarithme.',
  valeurs: 'Combien vaut cette expression ?',
  domaine: 'Sur quel ensemble cette fonction est-elle définie ?',
  equation: 'Résous cette équation, sans oublier le domaine.',
  'equation-simple': 'Résous cette équation.',
  inequation: 'Résous cette inéquation.',
  derivee: 'Dérive cette fonction.',

  'ln-somme': 'Le logarithme transforme un produit en somme : la somme des logarithmes de a et de b, c’est le logarithme du produit, pas celui de la somme.',
  'ln-produit': 'Une somme de logarithmes n’est pas un produit de logarithmes : c’est le logarithme du produit de a par b.',
  'ln-difference': 'Le logarithme transforme un quotient en différence : le logarithme de a moins celui de b, c’est le logarithme de a sur b, pas celui de la différence.',
  'ln-quotient': 'Une différence de logarithmes n’est pas un quotient de logarithmes : c’est le logarithme du quotient de a par b.',
  'ln-puissance': 'L’exposant sort devant le logarithme : n fois le logarithme de a, c’est le logarithme de a puissance n ; ni le logarithme de n fois a, ni le logarithme élevé à la puissance n.',
  'ln-de-un': 'Exponentielle de zéro vaut un, donc le logarithme de un vaut zéro.',
  'ln-de-e': 'Exponentielle de un vaut e, donc le logarithme de e vaut un.',
  reciproques: 'Le logarithme et l’exponentielle se défont l’un l’autre : le logarithme de e puissance a vaut a, et e puissance logarithme de a vaut a.',
  'ln-inverse': 'Le logarithme de un sur a, c’est moins le logarithme de a : l’inverse devient un signe moins.',
  'domaine-signe': 'Résous « ce qui est sous le logarithme est strictement positif » : en divisant par un nombre négatif, le sens de l’inégalité change.',
  'domaine-strict': 'Le logarithme n’est défini que pour un nombre strictement positif : le logarithme de zéro n’existe pas, le crochet reste ouvert.',
  'domaine-equation': 'Avant de résoudre, écris le domaine : ce qui est sous chaque logarithme doit être strictement positif. Une solution hors du domaine est rejetée.',
  'solution-acceptee': 'Vérifie la solution dans le domaine : ici, ce qui est sous chaque logarithme est bien positif, la solution est acceptée.',
  'isoler-x': 'Quand un terme change de membre, il change de signe : refais le passage d’un côté à l’autre.',
  'ln-pas-decimal': 'Le logarithme népérien est de base e : sa réciproque est l’exponentielle, pas les puissances de dix.',
  'defaire-ln': 'Pour défaire le logarithme, applique l’exponentielle aux deux membres : le logarithme de x égale k donne x égale e puissance k.',
  'exp-positive': 'L’exponentielle est toujours strictement positive : elle ne peut pas valoir un nombre négatif, il n’y a pas de solution.',
  'domaine-inequation': 'N’oublie pas le domaine : le logarithme de x n’existe que pour x strictement positif, l’intervalle commence à zéro.',
  'sens-inequation': 'Le logarithme et l’exponentielle sont croissants : en les appliquant, on garde le sens de l’inégalité.',
  'exp-partout': 'L’exponentielle est définie sur tous les réels : pas de condition x positif ici, l’intervalle part de moins l’infini.',
  'oubli-u-prime': 'N’oublie pas u prime au numérateur : la dérivée du logarithme de u, c’est u prime sur u.',
  'ln-u-derivee': 'C’est u prime sur u, pas un sur u prime : la dérivée de u va en haut, u reste en bas.',
  'deriver-dedans': 'On ne dérive pas seulement l’intérieur : la dérivée du logarithme de u est la fraction u prime sur u.',

  'proprietes-regle': 'Un produit devient une somme, un quotient une différence, une puissance un facteur devant.',
  'valeurs-regle': 'Le logarithme de un vaut zéro, celui de e vaut un, et le logarithme défait l’exponentielle.',
  'domaine-regle': 'Le domaine, c’est là où l’expression sous le logarithme est strictement positive.',
  'equation-regle': 'Le domaine d’abord ; puis deux logarithmes égaux veulent dire deux expressions égales, et on vérifie que la solution est dans le domaine.',
  'equation-simple-regle': 'Le logarithme de x égale k donne x égale e puissance k ; e puissance x égale a donne x égale logarithme de a, si a est positif.',
  'inequation-regle': 'Le domaine d’abord, puis on applique la fonction réciproque, qui est croissante : le sens se garde.',
  'derivee-regle': 'La dérivée du logarithme de u est u prime sur u.',
};
