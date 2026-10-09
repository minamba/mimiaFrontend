/**
 * LA BALANCE DES ÉQUATIONS — les équations, en 4e et en 3e.
 * Professeure : Nora (mathématiques).
 *
 * Une équation, c'est une balance : ce qu'on fait d'un côté, on le fait de
 * l'autre. Chaque solution est construite d'abord (on tire x, puis on
 * fabrique l'équation qu'il vérifie) : la bonne réponse est donc toujours
 * exacte, et le test la remet dans l'équation.
 *
 * PAR CLASSE :
 *   4e (3 + 2 + 3) — résoudre ax + b = c ; résoudre ax + b = cx + d ;
 *        mettre un problème en équation (programme, âges, périmètre).
 *        Pièges : le terme qui change de membre sans changer de signe,
 *        le coefficient retiré au lieu de divisé, le programme mal ordonné,
 *        « de plus » traduit par une soustraction, le périmètre pris pour
 *        l'aire ou compté sur deux côtés ;
 *   3e (3 + 3 + 2) — l'équation produit nul (pièges : les signes, le
 *        coefficient qu'on oublie de diviser) ; un problème à résoudre par
 *        une équation ; l'équation à deux membres.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'balance-des-equations', titre: 'La balance des équations', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'La balance des équations',
    accroche: 'Une balance : on agit des deux côtés.',
    competences: ['MATH_4E_EQUATION', 'MATH_4E_PROB_EQUATION'],
  },
  TROISIEME: {
    titre: 'La balance des équations',
    accroche: 'Produit nul et problèmes mis en équation.',
    competences: ['MATH_3E_EQ_PRODUIT', 'MATH_3E_EQ_PROBLEME'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −3 », « 2,5 » : le signe moins typographique et la virgule. */
const nb = (x) => {
  const r = Math.round(x * 1000) / 1000;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
};
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
/** n/d en fraction irréductible, « −7/3 », ou un entier « 4 ». */
export function fraction(n, d) {
  const s = (n < 0) !== (d < 0) ? -1 : 1;
  const g = pgcd(Math.abs(n), Math.abs(d)) || 1;
  const [p, q] = [Math.abs(n) / g, Math.abs(d) / g];
  if (q === 1) return nb(s * p);
  return `${s < 0 ? '−' : ''}${p}/${q}`;
}
/** « 3x − 2 », « x + 4 », « 2x » */
function affine(a, b) {
  let s;
  if (a === 1) s = 'x';
  else if (a === -1) s = '−x';
  else s = `${nb(a)}x`;
  if (b > 0) s += ` + ${nb(b)}`;
  if (b < 0) s += ` − ${nb(-b)}`;
  return s;
}
/** Le facteur qui s'annule en r : « (x − 3) », « (2x + 6) ». */
function facteur(p, r) {
  return `(${affine(p, -p * r)})`;
}
/** « x = −5 ou x = 3 », dans l'ordre croissant. */
export function deuxSolutions(u, v) {
  const [a, b] = u < v ? [u, v] : [v, u];
  return `x = ${nb(a)} ou x = ${nb(b)}`;
}

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

const nonNul = (entre, a, b) => {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
};

/** ax + b = c, de solution s. */
function resoudre({ entre, melanger }) {
  const a = entre(2, 7);
  const s = nonNul(entre, -6, 9);
  const b = nonNul(entre, -12, 12);
  const c = a * s + b;
  return monter(melanger, 'resoudre', `${affine(a, b)} = ${nb(c)}`, `x = ${nb(s)}`, [
    [`x = ${fraction(c + b, a)}`, 'changer-de-membre'],
    [`x = ${nb(c - b - a)}`, 'diviser-pas-soustraire'],
  ], (k) => `x = ${nb(s + k)}`);
}

/** ax + b = cx + d, de solution s. */
function deuxMembres({ entre, melanger }) {
  const a = entre(3, 8);
  const c = entre(1, a - 1);
  const s = nonNul(entre, -6, 9);
  const b = nonNul(entre, -10, 10);
  const d = (a - c) * s + b;
  return monter(melanger, 'deux-membres', `${affine(a, b)} = ${affine(c, d)}`, `x = ${nb(s)}`, [
    [`x = ${fraction(d - b, a + c)}`, 'changer-de-membre'],
    [`x = ${fraction(d + b, a - c)}`, 'changer-de-membre'],
  ], (k) => `x = ${nb(s + k)}`);
}

// ------------------------------------------------------------------ 4e

const MISES_EN_EQUATION = {
  programme({ entre }) {
    const a = entre(2, 6);
    const b = entre(2, 9);
    let s = entre(2, 12);
    while (s + a === a * s) s = entre(2, 12); // « x + a + b » ne doit jamais tomber juste par hasard
    const c = a * s + b;
    return {
      question: `Je pense à un nombre x. Je le multiplie par ${a}, puis j’ajoute ${b} : j’obtiens ${c}. Quelle équation ?`,
      bonne: `${a}x + ${b} = ${c}`,
      pieges: [[`${a}(x + ${b}) = ${c}`, 'ordre-du-programme'], [`x + ${a} + ${b} = ${c}`, 'fois-pas-plus']],
      voisin: (k) => `${a + k}x + ${b} = ${c}`,
    };
  },
  ages({ entre }) {
    const b = entre(2, 9);
    const s = entre(8, 15);
    const c = 2 * s + b;
    return {
      question: `Tom a x ans. Sa sœur a ${b} ans de plus que lui. À eux deux, ils ont ${c} ans. Quelle équation ?`,
      bonne: `x + x + ${b} = ${c}`,
      pieges: [[`x + ${b} = ${c}`, 'compter-tout'], [`x + x − ${b} = ${c}`, 'de-plus-ajouter']],
      voisin: (k) => `x + x + ${b + k} = ${c}`,
    };
  },
  perimetre({ entre }) {
    let b; let s; let c;
    do {
      b = entre(2, 9);
      s = entre(2, 12);
      c = 4 * s + 2 * b;
    } while (s * (s + b) === c); // l'aire ne doit jamais tomber juste par hasard
    return {
      question: `Un rectangle a pour largeur x et pour longueur x + ${b}. Son périmètre vaut ${c} cm. Quelle équation ?`,
      bonne: `2x + 2(x + ${b}) = ${c}`,
      pieges: [[`x + x + ${b} = ${c}`, 'perimetre-quatre-cotes'], [`x(x + ${b}) = ${c}`, 'perimetre-pas-aire']],
      voisin: (k) => `2x + 2(x + ${b + k}) = ${c}`,
    };
  },
};

function quatrieme(o) {
  const liste = [];
  for (let i = 0; i < 3; i += 1) liste.push(resoudre(o));
  for (let i = 0; i < 2; i += 1) liste.push(deuxMembres(o));
  o.melanger(Object.keys(MISES_EN_EQUATION)).forEach((sorte) => {
    const {
      question, bonne, pieges, voisin,
    } = MISES_EN_EQUATION[sorte](o);
    liste.push(monter(o.melanger, 'mise-en-equation', question, bonne, pieges, voisin));
  });
  return liste;
}

// ------------------------------------------------------------------ 3e

const PROBLEMES = {
  nombre({ entre }) {
    const a = entre(3, 7);
    const c = entre(2, a - 1);
    const s = entre(2, 15);
    const b = entre(1, 12);
    const d = (a - c) * s + b;
    return {
      question: `${a} fois un nombre, plus ${b}, égale ${c} fois ce nombre, plus ${d}. Quel est ce nombre ?`,
      bonne: nb(s),
      pieges: [[fraction(d + b, a - c), 'changer-de-membre'], [fraction(d - b, a + c), 'changer-de-membre']],
      voisin: (k) => nb(s + k),
    };
  },
  rectangle({ entre }) {
    const b = entre(2, 9);
    const s = entre(3, 15);
    const c = 4 * s + 2 * b;
    return {
      question: `Un rectangle : sa longueur dépasse sa largeur de ${b} cm, son périmètre vaut ${c} cm. Sa largeur ?`,
      bonne: `${nb(s)} cm`,
      pieges: [[`${nb((c - b) / 2)} cm`, 'perimetre-quatre-cotes'], [`${nb((c - b) / 4)} cm`, 'developper-parenthese']],
      voisin: (k) => `${nb(s + k)} cm`,
    };
  },
  cahiers({ entre }) {
    const a = entre(2, 6);
    const s = entre(2, 9);
    const b = a * entre(1, 4);
    const c = a * s + b;
    return {
      question: `${a} cahiers identiques et un livre à ${b} € coûtent ${c} € en tout. Le prix d’un cahier ?`,
      bonne: `${nb(s)} €`,
      pieges: [[`${fraction(c + b, a)} €`, 'changer-de-membre'], [`${nb(c - b - a)} €`, 'diviser-pas-soustraire']],
      voisin: (k) => `${nb(s + k)} €`,
    };
  },
};

function troisieme(o) {
  const { entre, au, melanger } = o;
  const liste = [];

  for (let i = 0; i < 3; i += 1) {
    let p; let r1; let r2;
    do {
      p = au([1, 1, 2, 3]);
      r1 = nonNul(entre, -9, 9);
      r2 = nonNul(entre, -9, 9);
    } while (Math.abs(r1) === Math.abs(r2) || Math.abs(p * r1) === Math.abs(r2));
    const question = `${facteur(p, r1)}${facteur(1, r2)} = 0`;
    const pieges = [[deuxSolutions(-r1, -r2), 'annuler-chaque-facteur']];
    pieges.push(p > 1 ? [deuxSolutions(p * r1, r2), 'diviser-coefficient'] : [deuxSolutions(r1, -r2), 'annuler-chaque-facteur']);
    liste.push(monter(melanger, 'produit-nul', question, deuxSolutions(r1, r2), pieges, (k) => deuxSolutions(r1 + k, r2 + k)));
  }

  melanger(Object.keys(PROBLEMES)).forEach((sorte) => {
    const {
      question, bonne, pieges, voisin,
    } = PROBLEMES[sorte](o);
    liste.push(monter(melanger, 'probleme', question, bonne, pieges, voisin));
  });

  for (let i = 0; i < 2; i += 1) liste.push(deuxMembres(o));
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
  resoudre: 'Résous l’équation : quelle valeur de x équilibre la balance ?',
  'deux-membres': 'Il y a des x des deux côtés. Résous l’équation.',
  'mise-en-equation': 'Quelle équation traduit ce problème ?',
  'produit-nul': 'Un produit est égal à zéro. Quelles sont les solutions ?',
  probleme: 'Mets le problème en équation, puis résous-la.',

  // Les erreurs, chacune avec sa méthode.
  'changer-de-membre': 'Quand un terme change de membre, il change de signe : ajoute ou retire la même chose des deux côtés de la balance.',
  'diviser-pas-soustraire': 'Pour défaire une multiplication par le coefficient, on divise les deux membres par ce coefficient : on ne le retire pas.',
  'ordre-du-programme': 'On multiplie d’abord, puis on ajoute : le nombre ajouté reste hors de la multiplication, sans parenthèses.',
  'fois-pas-plus': 'Multiplier x par un nombre, c’est écrire ce nombre collé devant x : on ne l’ajoute pas.',
  'compter-tout': 'À eux deux, c’est l’âge de Tom plus celui de sa sœur : chacun doit apparaître dans l’équation.',
  'de-plus-ajouter': 'Avoir des années de plus, c’est un âge plus grand : on ajoute, on ne retire pas.',
  'perimetre-quatre-cotes': 'Le périmètre fait le tour du rectangle : deux largeurs et deux longueurs, quatre côtés en tout.',
  'perimetre-pas-aire': 'Longueur fois largeur, c’est l’aire. Le périmètre, c’est la somme des quatre côtés.',
  'developper-parenthese': 'Deux fois une longueur avec un écart, c’est deux fois x plus deux fois l’écart : développe toute la parenthèse.',
  'annuler-chaque-facteur': 'Un facteur s’annule quand ce qu’il contient vaut zéro : résous chaque petite équation, x moins trois égale zéro donne x égale trois.',
  'diviser-coefficient': 'Après avoir isolé le terme en x, divise par son coefficient pour trouver x.',

  // Les replis.
  'resoudre-regle': 'Retire le terme constant des deux côtés, puis divise les deux côtés par le coefficient de x.',
  'deux-membres-regle': 'Regroupe les x d’un côté et les nombres de l’autre, puis divise par le coefficient de x.',
  'mise-en-equation-regle': 'Nomme l’inconnue x, puis traduis chaque phrase du problème, mot à mot, en calcul.',
  'produit-nul-regle': 'Un produit est nul si l’un de ses facteurs est nul : annule chaque facteur, l’un après l’autre.',
  'probleme-regle': 'Écris l’équation du problème, résous-la, puis vérifie que la solution convient.',
};
