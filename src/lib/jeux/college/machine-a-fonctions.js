/**
 * LA MACHINE À FONCTIONS — la notion de fonction, de la 5e à la 3e.
 * Professeure : Nora (mathématiques).
 *
 * Un nombre entre dans la machine, un autre en sort. Tout est du texte : la
 * machine est un programme de calcul (5e) ou une expression f(x) (3e), et la
 * droite de la représentation graphique est décrite par deux de ses points.
 *
 * PAR CLASSE :
 *   5e (3 + 3 + 2) — faire tourner un programme de calcul ; remonter de la
 *        sortie à l'entrée ; reconnaître le programme d'un tableau d'entrées
 *        et de sorties. Pièges : les étapes dans le désordre, une étape
 *        oubliée, la machine qu'on refait tourner au lieu de la défaire, le
 *        programme qui ne marche que pour la première entrée ;
 *   3e (2 + 2 + 2 + 2) — l'image, l'antécédent, la fonction linéaire, la
 *        droite d'une fonction affine. LE PIÈGE : confondre image et
 *        antécédent ; puis la priorité, le raisonnement additif devant une
 *        fonction linéaire, le coefficient directeur sans division par
 *        l'écart des abscisses, a et b échangés.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'machine-a-fonctions', titre: 'La machine à fonctions', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'La machine à fonctions',
    accroche: 'Un nombre entre, un autre sort.',
    competences: ['MATH_5E_FONC_NOTION'],
  },
  TROISIEME: {
    titre: 'La machine à fonctions',
    accroche: 'Image, antécédent : ne les confonds pas.',
    competences: ['MATH_3E_FONC_NOTION', 'MATH_3E_FONC_LINEAIRE', 'MATH_3E_FONC_AFFINE', 'MATH_3E_FONC_GRAPHIQUE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −3 », « 2,5 » : le signe moins typographique et la virgule. */
const nb = (x) => {
  const r = Math.round(x * 1000) / 1000;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
};
/** « 3x − 2 », « −x + 4 », « 2x » */
export function affine(a, b) {
  let s;
  if (a === 1) s = 'x';
  else if (a === -1) s = '−x';
  else s = `${nb(a)}x`;
  if (b > 0) s += ` + ${nb(b)}`;
  if (b < 0) s += ` − ${nb(-b)}`;
  return s;
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

// ------------------------------------------------------------------ 5e

function cinquieme({ entre, au, melanger }) {
  const liste = [];

  // Faire tourner le programme.
  for (let i = 0; i < 3; i += 1) {
    const a = entre(2, 6);
    const b = entre(1, 9);
    const x = entre(2, 9);
    if (au(['fois-plus', 'plus-fois']) === 'fois-plus') {
      const bonne = nb(a * x + b);
      liste.push(monter(melanger, 'programme-sortie', `Programme : × ${a}, puis + ${b}. On entre ${x}. Il sort ?`, bonne, [
        [nb((x + b) * a), 'ordre-etapes'],
        [nb(a * x), 'toutes-les-etapes'],
      ], (k) => nb(a * x + b + k)));
    } else {
      const bonne = nb((x + b) * a);
      liste.push(monter(melanger, 'programme-sortie', `Programme : + ${b}, puis × ${a}. On entre ${x}. Il sort ?`, bonne, [
        [nb(x * a + b), 'ordre-etapes'],
        [nb(x + b), 'toutes-les-etapes'],
      ], (k) => nb((x + b) * a + k)));
    }
  }

  // Remonter de la sortie à l'entrée.
  for (let i = 0; i < 3; i += 1) {
    const a = entre(2, 6);
    const b = entre(1, 9);
    const k = entre(2, 12);
    if (au(['fois-plus', 'plus-fois']) === 'fois-plus') {
      const n = a * k + b;
      liste.push(monter(melanger, 'programme-entree', `Programme : × ${a}, puis + ${b}. Il sort ${n}. Quel nombre est entré ?`, nb(k), [
        [nb(a * n + b), 'remonter-programme'],
        [nb(n - b), 'defaire-tout'],
      ], (j) => nb(k + j)));
    } else {
      const n = (k + b) * a;
      liste.push(monter(melanger, 'programme-entree', `Programme : + ${b}, puis × ${a}. Il sort ${n}. Quel nombre est entré ?`, nb(k), [
        [nb((n + b) * a), 'remonter-programme'],
        [nb(n / a), 'defaire-tout'],
      ], (j) => nb(k + j)));
    }
  }

  // Le programme d'un tableau : il doit marcher pour toutes les entrées.
  for (let i = 0; i < 2; i += 1) {
    const a = entre(2, 5);
    let b = entre(2, 9);
    while (b === a) b = entre(2, 9);
    const e2 = entre(2, 5);
    const e3 = e2 + entre(1, 4);
    const f = (x) => a * x + b;
    const bonne = `× ${a}, puis + ${b}`;
    liste.push(monter(melanger, 'quelle-fonction', `1 → ${f(1)}   ;   ${e2} → ${f(e2)}   ;   ${e3} → ${f(e3)}`, bonne, [
      [`+ ${a + b}`, 'tester-toutes-les-entrees'],
      [`× ${b}, puis + ${a}`, 'tester-toutes-les-entrees'],
    ], (k) => `× ${a + k}, puis + ${b}`));
  }
  return liste;
}

// ------------------------------------------------------------------ 3e

/** f(x) = ax + b, et un nombre v dont l'antécédent k est entier. */
function tirerAffine({ entre, au }) {
  const a = au([2, 3, 4, 5, -2, -3]);
  let b = 0;
  while (b === 0) b = entre(-9, 9);
  let k = 0;
  while (k === 0) k = entre(-4, 6);
  return {
    a, b, k, v: a * k + b,
  };
}

function troisieme(o) {
  const { entre, au, melanger } = o;
  const liste = [];

  for (let i = 0; i < 2; i += 1) {
    const {
      a, b, k, v,
    } = tirerAffine(o);
    const image = a * v + b;
    liste.push(monter(melanger, 'image', `f(x) = ${affine(a, b)}. Image de ${nb(v)} ?`, nb(image), [
      [nb(k), 'pris-antecedent'],
      [nb(a * (v + b)), 'priorite-calcul'],
    ], (j) => nb(image + j)));
  }

  for (let i = 0; i < 2; i += 1) {
    const {
      a, b, k, v,
    } = tirerAffine(o);
    liste.push(monter(melanger, 'antecedent', `f(x) = ${affine(a, b)}. Antécédent de ${nb(v)} ?`, nb(k), [
      [nb(a * v + b), 'pris-image'],
      [nb(v - b), 'antecedent-diviser'],
    ], (j) => nb(k + j)));
  }

  for (let i = 0; i < 2; i += 1) {
    const c = entre(2, 9);
    const x1 = entre(2, 6);
    let x2 = entre(2, 12);
    while (x2 === x1) x2 = entre(2, 12);
    liste.push(monter(melanger, 'lineaire', `f est linéaire et f(${x1}) = ${c * x1}. f(${x2}) = ?`, nb(c * x2), [
      [nb(c * x1 + (x2 - x1)), 'lineaire-additif'],
      [nb(c * x1 * x2), 'lineaire-coefficient'],
    ], (j) => nb(c * x2 + j)));
  }

  for (let i = 0; i < 2; i += 1) {
    const a = au([1, 2, 3, 4, -1, -2]);
    let b = 0;
    while (b === 0 || b === a) b = entre(-5, 9);
    const d = entre(2, 4);
    liste.push(monter(
      melanger,
      'graphique',
      `La droite de f passe par (0 ; ${nb(b)}) et (${d} ; ${nb(b + a * d)}). f(x) = ?`,
      affine(a, b),
      [
        [affine(b, a), 'ordonnee-origine'],
        [affine(a * d, b), 'coefficient-ecart'],
      ],
      (j) => affine(a, b + j),
    ));
  }
  return liste;
}

const BANQUES = { CINQUIEME: cinquieme, TROISIEME: troisieme };

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
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
  'programme-sortie': 'Fais tourner le programme : quel nombre sort de la machine ?',
  'programme-entree': 'Ce nombre est sorti de la machine. Lequel était entré ?',
  'quelle-fonction': 'Quel programme transforme chaque entrée en sa sortie ?',
  image: 'Calcule l’image de ce nombre par la fonction.',
  antecedent: 'Cherche l’antécédent de ce nombre par la fonction.',
  lineaire: 'La fonction est linéaire. Trouve l’image demandée.',
  graphique: 'La droite passe par ces deux points. Quelle est l’expression de la fonction ?',

  // Les erreurs, chacune avec sa méthode.
  'ordre-etapes': 'Les étapes se font dans l’ordre du programme : d’abord la première, puis la seconde.',
  'toutes-les-etapes': 'Chaque étape compte : applique-les toutes, l’une après l’autre.',
  'remonter-programme': 'Ici, on connaît la sortie : il faut remonter la machine à l’envers, pas la refaire tourner.',
  'defaire-tout': 'Pour remonter, défais chaque étape en partant de la dernière : l’addition se défait par une soustraction, la multiplication par une division.',
  'tester-toutes-les-entrees': 'Un programme doit marcher pour toutes les entrées : vérifie-le sur chacune, pas seulement sur la première.',
  'pris-antecedent': 'Tu as cherché l’antécédent. L’image, c’est ce qui sort : remplace x par le nombre et calcule.',
  'pris-image': 'Tu as calculé l’image. L’antécédent, c’est ce qu’on entre : cherche le x dont l’image est ce nombre.',
  'priorite-calcul': 'Remplace x par le nombre, puis multiplie d’abord et ajoute ensuite : la multiplication passe avant.',
  'antecedent-diviser': 'Pour trouver x, isole-le : enlève d’abord le terme constant, puis divise par le coefficient de x.',
  'lineaire-additif': 'Une fonction linéaire, c’est la proportionnalité : on multiplie, on n’ajoute pas. Cherche d’abord le coefficient.',
  'lineaire-coefficient': 'Le coefficient, c’est l’image divisée par le nombre de départ. Multiplie ensuite ce coefficient par le nouveau nombre.',
  'ordonnee-origine': 'Dans a x plus b, b est l’ordonnée à l’origine, la valeur en zéro ; a est le coefficient directeur, la pente.',
  'coefficient-ecart': 'Le coefficient directeur, c’est la différence des ordonnées divisée par la différence des abscisses.',

  // Les replis, si un choix voisin est pris.
  'programme-sortie-regle': 'Applique chaque étape du programme, dans l’ordre, au nombre de départ.',
  'programme-entree-regle': 'Défais les étapes du programme, de la dernière à la première.',
  'quelle-fonction-regle': 'Essaie chaque programme sur toutes les entrées : le bon redonne toutes les sorties.',
  'image-regle': 'Remplace x par le nombre dans l’expression, puis calcule.',
  'antecedent-regle': 'Écris que f de x égale ce nombre, puis résous l’équation.',
  'lineaire-regle': 'Trouve le coefficient en divisant l’image par le nombre, puis multiplie-le par le nouveau nombre.',
  'graphique-regle': 'L’ordonnée à l’origine se lit au point d’abscisse zéro ; le coefficient directeur, c’est la montée divisée par l’avancée.',
};
