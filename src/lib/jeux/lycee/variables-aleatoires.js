/**
 * LES VARIABLES ALÉATOIRES — Nora, 1re générale (spécialité) et 1re
 * technologique (« L'espérance et les jeux de hasard »).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   1re générale : MATH_1RE_VA_NOTATIONS, MATH_1RE_VA_LOI,
 *     MATH_1RE_VA_ESPERANCE, MATH_1RE_VA_LINEARITE, MATH_1RE_VA_PROBLEME
 *   1re techno   : MATH_1TEC_VA_LOI, MATH_1TEC_VA_ESPERANCE
 *
 * LA LOI EST UN TABLEAU, une ligne par `\n` dans la question :
 *   Valeurs de X : −2 | 1 | 4
 *   Probabilités : 0,3 | 0,5 | 0,2
 * Les probabilités sont des multiples de 0,05, calculées en CENTIÈMES
 * ENTIERS : aucune erreur d'arrondi.
 *
 * LES SORTES DE MANCHES :
 *   - LA PROBABILITÉ MANQUANTE. LES PIÈGES : la somme des autres (au lieu de
 *     un moins cette somme), une loi équirépartie supposée ;
 *   - LES NOTATIONS {X ≤ a}, {X < a}… LES PIÈGES : l'inégalité large ou
 *     stricte, P(X = a) seule ;
 *   - LA LOI D'UN JEU : une urne, P(X = gain). LES PIÈGES : compter une seule
 *     boule, confondre la valeur et sa probabilité ;
 *   - L'ESPÉRANCE. LES PIÈGES : la moyenne des valeurs sans les pondérer, le
 *     signe moins oublié ;
 *   - LE JEU FAVORABLE OU NON (dé à six faces), selon le signe de l'espérance ;
 *   - LE GAIN NET, mise déduite. LES PIÈGES : oublier la mise, ne la retirer
 *     que quand on gagne ;
 *   en 1re générale seulement :
 *   - LA MISE ÉQUITABLE (l'espérance pour résoudre un problème) ;
 *   - LA VARIANCE par König-Huygens. LES PIÈGES : oublier de retrancher E(X)²,
 *     des écarts non élevés au carré (dont la somme pondérée est nulle) ;
 *   - LA LINÉARITÉ : E(aX + b) et V(aX + b). LES PIÈGES : oublier b, mettre b
 *     dans la variance, oublier le carré de a.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'variables-aleatoires', titre: 'Les variables aléatoires', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Les variables aléatoires',
    accroche: 'Loi, espérance, variance : le jeu vaut-il ?',
    competences: [
      'MATH_1RE_VA_NOTATIONS', 'MATH_1RE_VA_LOI', 'MATH_1RE_VA_ESPERANCE',
      'MATH_1RE_VA_LINEARITE', 'MATH_1RE_VA_PROBLEME',
    ],
  },
  PREMIERE_TECHNO: {
    titre: 'L’espérance et les jeux de hasard',
    accroche: 'Ce jeu est-il favorable ? Calcule !',
    competences: ['MATH_1TEC_VA_LOI', 'MATH_1TEC_VA_ESPERANCE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Un entier écrit à la française : le signe moins typographique. */
export const ecrire = (n) => (n < 0 ? `−${-n}` : String(n));

/** Un nombre donné en centièmes entiers : « 0,15 », « −1,4 », « 3 ». */
export function centiemes(k) {
  const signe = k < 0 ? '−' : '';
  const a = Math.abs(k);
  const entier = Math.floor(a / 100);
  const reste = a % 100;
  if (reste === 0) return `${signe}${entier}`;
  return `${signe}${entier},${String(reste).padStart(2, '0').replace(/0$/, '')}`;
}

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

/** Des valeurs entières distinctes, rangées. */
function valeurs(t, n, min, max) {
  const choisies = new Set();
  while (choisies.size < n) choisies.add(t.entre(min, max));
  return [...choisies].sort((x, y) => x - y);
}

/** n probabilités, multiples de 0,05 (en centièmes), toutes non nulles, de somme 1. */
function probas(t, n) {
  const coupures = new Set();
  while (coupures.size < n - 1) coupures.add(t.entre(1, 19));
  const bornes = [0, ...[...coupures].sort((x, y) => x - y), 20];
  return bornes.slice(1).map((b, i) => 5 * (b - bornes[i]));
}

/** Le tableau de la loi, deux lignes. */
const tableau = (xs, ps) => `Valeurs de X : ${xs.map(ecrire).join(' | ')}\nProbabilités : ${ps.map((p) => (p === null ? '?' : centiemes(p))).join(' | ')}`;

/** Des voisins en centièmes, qui restent des probabilités. */
const voisinProba = (bonne) => (k) => centiemes(bonne + 5 * k < 100 ? bonne + 5 * k : bonne - 5 * k);
const voisinNombre = (bonne, pas = 10) => (k) => centiemes(bonne + (k % 2 ? pas * k : -pas * k));

/* ------------------------------------------------ la probabilité manquante */

function manquante(t) {
  const n = t.au([4, 5]);
  const xs = valeurs(t, n, -5, 10);
  const ps = probas(t, n);
  const i = t.entre(0, n - 1);
  const bonne = ps[i];
  const autres = 100 - bonne;
  return manche(t.melanger, {
    consigne: 'manquante',
    question: tableau(xs, ps.map((p, j) => (j === i ? null : p))),
    bonne: centiemes(bonne),
    pieges: [[centiemes(autres), 'complement-a-un'], [centiemes(100 / n), 'pas-equiprobable']],
    voisin: voisinProba(bonne),
  });
}

/* --------------------------------------------------------- les notations */

const OPERATEURS = {
  '≤': (x, a) => x <= a,
  '<': (x, a) => x < a,
  '≥': (x, a) => x >= a,
  '>': (x, a) => x > a,
};
const CONTRAIRE_LARGE = {
  '≤': '<', '<': '≤', '≥': '>', '>': '≥',
};

function notations(t) {
  const n = t.au([4, 5]);
  const xs = valeurs(t, n, -4, 9);
  const ps = probas(t, n);
  const i = t.entre(1, n - 2);
  const a = xs[i];
  const op = t.au(Object.keys(OPERATEURS));
  const somme = (o) => xs.reduce((s, x, j) => s + (OPERATEURS[o](x, a) ? ps[j] : 0), 0);
  const bonne = somme(op);
  return manche(t.melanger, {
    consigne: 'notations',
    question: `${tableau(xs, ps)}\nP(X ${op} ${ecrire(a)}) = ?`,
    bonne: centiemes(bonne),
    pieges: [[centiemes(somme(CONTRAIRE_LARGE[op])), 'inegalite-large'], [centiemes(ps[i]), 'cumuler-les-valeurs']],
    voisin: voisinProba(bonne),
  });
}

/* ---------------------------------------------------- la loi d'un jeu (urne) */

function urne(t) {
  const total = t.au([10, 20]);
  let rouges;
  let vertes;
  do {
    rouges = t.entre(2, total / 2);
    vertes = t.entre(2, total / 2);
  } while (rouges + vertes >= total - 1);
  const noires = total - rouges - vertes;
  const gainRouge = t.entre(5, 12);
  const gainVert = t.entre(1, 4);
  const perte = t.entre(1, 5);
  const centieme = 100 / total;
  const sorte = t.au(['rouge', 'vert', 'noir']);
  const [valeur, nombre, montant] = {
    rouge: [gainRouge, rouges, gainRouge],
    vert: [gainVert, vertes, gainVert],
    noir: [-perte, noires, perte],
  }[sorte];
  const bonne = nombre * centieme;
  return manche(t.melanger, {
    consigne: 'urne',
    question: `Une urne contient ${total} boules : ${rouges} rouges, ${vertes} vertes et ${noires} noires. On en tire une au hasard. Rouge : on gagne ${gainRouge} € ; verte : on gagne ${gainVert} € ; noire : on perd ${perte} €. X est le gain, en euros.\nP(X = ${ecrire(valeur)}) = ?`,
    bonne: centiemes(bonne),
    pieges: [
      [montant * centieme <= 100 ? centiemes(montant * centieme) : null, 'valeur-pas-proba'],
      [centiemes(centieme), 'compter-les-boules'],
    ],
    voisin: voisinProba(bonne),
  });
}

/* ------------------------------------------------------------ l'espérance */

function esperance(t) {
  let xs;
  do {
    xs = valeurs(t, 4, -6, 9);
  } while (xs[0] >= 0);
  const ps = probas(t, 4);
  const e = xs.reduce((s, x, j) => s + x * ps[j], 0);
  const moyenne = 25 * xs.reduce((s, x) => s + x, 0);
  const sansSigne = xs.reduce((s, x, j) => s + Math.abs(x) * ps[j], 0);
  return manche(t.melanger, {
    consigne: 'esperance',
    question: `${tableau(xs, ps)}\nE(X) = ?`,
    bonne: centiemes(e),
    pieges: [[centiemes(moyenne), 'ponderer-par-les-probas'], [centiemes(sansSigne), 'garder-le-signe']],
    voisin: voisinNombre(e),
  });
}

/* ----------------------------------------------------- le jeu favorable ? */

const FAVORABLE = 'Favorable au joueur';
const DEFAVORABLE = 'Défavorable au joueur';
const EQUITABLE = 'Équitable';

function favorable(t) {
  const g1 = t.entre(4, 15);
  const deux = t.tirer() < 0.5;
  const g2 = t.entre(1, 5);
  const faces = deux ? 2 : 1;
  const perdantes = 5 - faces;
  const gagne = g1 + faces * g2;
  let perte;
  if (gagne % perdantes === 0 && t.tirer() < 0.4) perte = gagne / perdantes;
  else {
    do {
      perte = t.entre(1, 6);
    } while (perte * perdantes === gagne);
  }
  const somme = gagne - perdantes * perte;
  let bonne = EQUITABLE;
  if (somme > 0) bonne = FAVORABLE;
  else if (somme < 0) bonne = DEFAVORABLE;
  const pieges = {};
  [FAVORABLE, DEFAVORABLE, EQUITABLE].forEach((c) => {
    if (c !== bonne) pieges[c] = 'signe-de-l-esperance';
  });
  return {
    consigne: 'favorable',
    question: `On lance un dé équilibré à six faces. Avec un 6, on gagne ${g1} € ; avec ${deux ? 'un 4 ou un 5' : 'un 5'}, on gagne ${g2} € ; sinon, on perd ${perte} €. Ce jeu est…`,
    choix: cartes([FAVORABLE, DEFAVORABLE, EQUITABLE]),
    bonne,
    pieges,
  };
}

/* ------------------------------------------------------------- le gain net */

/** Un jeu : deux lots, leurs probabilités en centièmes. */
function lots(t) {
  const p1 = 5 * t.entre(1, 4);
  const p2 = 5 * t.entre(2, 8);
  const g1 = 5 * t.entre(2, 10);
  const g2 = t.entre(2, 9);
  return [p1, p2, g1, g2];
}

function gainNet(t) {
  const [p1, p2, g1, g2] = lots(t);
  const mise = t.entre(1, 5);
  const brut = g1 * p1 + g2 * p2;
  const bonne = brut - 100 * mise;
  const euros = (k) => `${centiemes(k)} €`;
  return manche(t.melanger, {
    consigne: 'gain-net',
    question: `Un ticket coûte ${mise} €. Il fait gagner ${g1} € avec une probabilité de ${centiemes(p1)}, ${g2} € avec une probabilité de ${centiemes(p2)}, et rien sinon. Espérance du gain du joueur, mise déduite ?`,
    bonne: euros(bonne),
    pieges: [[euros(brut), 'retirer-la-mise'], [euros(brut - mise * (p1 + p2)), 'perte-aussi']],
    voisin: (k) => euros(bonne + (k % 2 ? 10 * k : -10 * k)),
  });
}

/* ------------------------------------------------- la mise équitable (1re) */

function mise(t) {
  const [p1, p2, g1, g2] = lots(t);
  const bonne = g1 * p1 + g2 * p2;
  const euros = (k) => `${centiemes(k)} €`;
  return manche(t.melanger, {
    consigne: 'mise',
    question: `Un jeu fait gagner ${g1} € avec une probabilité de ${centiemes(p1)}, ${g2} € avec une probabilité de ${centiemes(p2)}, et rien sinon. Quelle mise rend le jeu équitable ?`,
    bonne: euros(bonne),
    pieges: [[euros(50 * (g1 + g2)), 'ponderer-par-les-probas'], [euros(g1 * p1), 'toutes-les-issues']],
    voisin: (k) => euros(bonne + (k % 2 ? 10 * k : -10 * k)),
  });
}

/* --------------------------------------------------------- la variance (1re) */

/** Σ x × p, les p en dixièmes : dix fois l'espérance. */
const dixFoisE = (xs, pt) => xs.reduce((s, x, j) => s + x * pt[j], 0);

function variance(t) {
  let xs;
  let pt;
  do {
    xs = valeurs(t, 3, -4, 8);
    const a = t.entre(1, 8);
    const b = t.entre(1, 9 - a);
    pt = [a, b, 10 - a - b];
  } while (dixFoisE(xs, pt) % 10 !== 0 || dixFoisE(xs, pt) === 0);
  const e10 = dixFoisE(xs, pt);
  const e = e10 / 10;
  // En dixièmes : E(X²) = Σ x² p, et V = E(X²) − E(X)².
  const carres = xs.reduce((s, x, j) => s + x * x * pt[j], 0);
  const v = carres - 10 * e * e;
  return manche(t.melanger, {
    consigne: 'variance',
    question: `${tableau(xs, pt.map((p) => 10 * p))}\nE(X) = ${ecrire(e)}.   V(X) = ?`,
    bonne: centiemes(10 * v),
    pieges: [[centiemes(10 * carres), 'konig-huygens'], ['0', 'ecarts-au-carre']],
    // Une variance reste positive : les voisins vont vers le haut.
    voisin: (k) => centiemes(10 * v + 50 * k),
  });
}

/* -------------------------------------------------------- la linéarité (1re) */

/** « 2X + 5 », « −3X − 4 ». */
const affine = (a, b) => `${ecrire(a)}X ${b < 0 ? '−' : '+'} ${Math.abs(b)}`;

function linearite(t) {
  const a = t.au([-3, -2, 2, 3, 4, 5]);
  let b;
  do {
    b = t.entre(-6, 6);
  } while (b === 0);
  if (t.tirer() < 0.5) {
    const e = t.entre(-4, 7);
    const bonne = a * e + b;
    return manche(t.melanger, {
      consigne: 'linearite',
      question: `E(X) = ${ecrire(e)}.   E(${affine(a, b)}) = ?`,
      bonne: ecrire(bonne),
      pieges: [[ecrire(a * e), 'linearite-constante'], [ecrire(a * (e + b)), 'linearite-ordre']],
      voisin: (k) => ecrire(bonne + (k % 2 ? k : -k)),
    });
  }
  const v = t.entre(2, 9);
  const bonne = a * a * v;
  return manche(t.melanger, {
    consigne: 'linearite',
    question: `V(X) = ${v}.   V(${affine(a, b)}) = ?`,
    bonne: ecrire(bonne),
    pieges: [[ecrire(a * v), 'variance-carre'], [ecrire(a * a * v + b), 'variance-constante']],
    voisin: (k) => ecrire(bonne + (k % 2 ? 2 * k : -2 * k)),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  if (niveau === 'PREMIERE_TECHNO') {
    return t.melanger([
      manquante(t), notations(t), urne(t), esperance(t), esperance(t),
      favorable(t), gainNet(t), t.au([urne, favorable, notations])(t),
    ]);
  }
  return t.melanger([
    manquante(t), notations(t), urne(t), esperance(t),
    t.au([favorable, gainNet])(t), mise(t), variance(t), linearite(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  manquante: 'Retrouve la probabilité qui manque dans la loi de X.',
  notations: 'Calcule cette probabilité avec la loi de X.',
  urne: 'Détermine cette probabilité dans la loi du gain.',
  esperance: 'Calcule l’espérance de X.',
  favorable: 'Calcule l’espérance du gain, et dis si le jeu est favorable.',
  'gain-net': 'Calcule l’espérance du gain, la mise déduite.',
  mise: 'Trouve la mise qui rend le jeu équitable.',
  variance: 'Calcule la variance de X.',
  linearite: 'Utilise la linéarité.',

  'complement-a-un': 'Tu as additionné les autres probabilités, mais il faut aller jusqu’au bout : la somme de toutes vaut un, donc la manquante est un moins cette somme.',
  'pas-equiprobable': 'Rien ne dit que les valeurs ont la même probabilité : utilise que la somme de toutes les probabilités vaut un.',
  'inegalite-large': 'Regarde bien l’inégalité : avec un symbole large, la valeur elle-même compte ; avec un symbole strict, elle ne compte pas.',
  'cumuler-les-valeurs': 'Ça, c’est la probabilité d’une seule valeur. Additionne les probabilités de toutes les valeurs qui vérifient l’inégalité.',
  'valeur-pas-proba': 'Ne confonds pas la valeur prise par X, en euros, et sa probabilité : compte les boules qui donnent ce gain, et divise par le nombre total.',
  'compter-les-boules': 'Plusieurs boules donnent ce gain : compte-les toutes, puis divise par le nombre total de boules.',
  'ponderer-par-les-probas': 'L’espérance n’est pas la moyenne simple des valeurs : chaque valeur est multipliée par sa probabilité.',
  'garder-le-signe': 'Une perte compte avec un signe moins : multiplie la valeur négative par sa probabilité, sans enlever le signe.',
  'signe-de-l-esperance': 'Calcule l’espérance du gain : positive, le jeu est favorable ; négative, il est défavorable ; nulle, il est équitable.',
  'retirer-la-mise': 'Tu as l’espérance de ce qu’on gagne, mais on paie la mise à chaque partie : retire-la.',
  'perte-aussi': 'Quand on ne gagne rien, on a quand même payé la mise : le gain net vaut alors moins la mise. La mise se retire dans tous les cas.',
  'toutes-les-issues': 'N’oublie aucun lot : l’espérance additionne chaque gain multiplié par sa probabilité.',
  'konig-huygens': 'Tu as l’espérance de X au carré. Pour la variance, retranche encore le carré de l’espérance.',
  'ecarts-au-carre': 'Les écarts à la moyenne, pondérés, se compensent toujours et donnent zéro : c’est pour ça qu’on les élève au carré.',
  'linearite-constante': 'La constante ajoutée se retrouve dans l’espérance : E de a X plus b, c’est a fois E de X, plus b.',
  'linearite-ordre': 'On ne multiplie pas b par a : E de a X plus b, c’est a fois E de X, puis on ajoute b.',
  'variance-carre': 'Dans la variance, le coefficient passe au carré : V de a X plus b, c’est a au carré fois V de X.',
  'variance-constante': 'Ajouter une constante décale les valeurs sans changer leur dispersion : b disparaît de la variance.',

  'manquante-regle': 'La somme de toutes les probabilités d’une loi vaut un.',
  'notations-regle': 'Repère les valeurs qui vérifient l’inégalité, et additionne leurs probabilités.',
  'urne-regle': 'Compte les boules qui donnent ce gain, et divise par le nombre total de boules.',
  'esperance-regle': 'Multiplie chaque valeur par sa probabilité, et additionne tout.',
  'favorable-regle': 'Le signe de l’espérance du gain dit si le jeu est favorable, défavorable ou équitable.',
  'gain-net-regle': 'Espérance des gains, moins la mise payée à chaque partie.',
  'mise-regle': 'Le jeu est équitable quand la mise est égale à l’espérance des gains.',
  'variance-regle': 'Variance : espérance de X au carré, moins le carré de l’espérance.',
  'linearite-regle': 'E de a X plus b vaut a fois E de X plus b ; V de a X plus b vaut a au carré fois V de X.',
};
