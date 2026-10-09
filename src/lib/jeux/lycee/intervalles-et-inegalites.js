/**
 * INTERVALLES ET INÉGALITÉS — seconde.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_2DE_INTERVALLES, MATH_2DE_LOGIQUE_ENSEMBLES.
 *
 * SIX SORTES DE MANCHES (2 + 1 + 1 + 1 + 1 + 2) :
 *   - ÉCRIRE EN INTERVALLE : « −3 < x ≤ 4 », « x ≥ 2 ». LES PIÈGES : les
 *     crochets à l'envers (stricte = ouvert), l'infini fermé, la demi-droite
 *     dans le mauvais sens ;
 *   - L'INTERSECTION ET LA RÉUNION : LES PIÈGES, prendre l'une pour l'autre,
 *     ne pas garder à chaque borne le crochet de l'intervalle d'où elle vient ;
 *   - LA VALEUR ABSOLUE, UNE DISTANCE : |x − a| ≤ r. LES PIÈGES, le signe du
 *     centre (|x + 3| est centré en −3), oublier le centre ;
 *   - LE CENTRE ET LE RAYON d'un intervalle : LES PIÈGES, prendre la longueur
 *     pour le rayon, une borne pour le centre ;
 *   - ENCADRER k x + m : LES PIÈGES, ne pas renverser l'ordre quand k est
 *     négatif, laisser les crochets sur place, oublier la constante,
 *     ajouter avant de multiplier.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'intervalles-et-inegalites', titre: 'Intervalles et inégalités', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Intervalles et inégalités',
    accroche: 'Crochets, valeur absolue et encadrements.',
    competences: ['MATH_2DE_INTERVALLES', 'MATH_2DE_LOGIQUE_ENSEMBLES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Un nombre à la française : virgule décimale, vrai signe moins. */
function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',').replace('-', '−');
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

const ouvre = (ferme) => (ferme ? '[' : ']');
const clot = (ferme) => (ferme ? ']' : '[');

/** « [2 ; 5[ » ; du côté de l'infini, le crochet est toujours ouvert. */
function iv(a, fa, b, fb) {
  const ga = a === -Infinity ? '−∞' : nb(a);
  const gb = b === Infinity ? '+∞' : nb(b);
  return `${ouvre(fa && a !== -Infinity)}${ga} ; ${gb}${clot(fb && b !== Infinity)}`;
}

/* ------------------------------------------------- écrire en intervalle */

function ecrire(t) {
  if (t.entre(0, 2) > 0) {
    const a = t.entre(-9, 5);
    const b = a + t.entre(2, 9);
    const sa = t.au([true, false]); // inégalité stricte à gauche ?
    const sb = t.au([true, false]);
    return manche(t.melanger, {
      consigne: 'ecrire-intervalle',
      question: `Les réels x tels que ${nb(a)} ${sa ? '<' : '≤'} x ${sb ? '<' : '≤'} ${nb(b)}`,
      bonne: iv(a, !sa, b, !sb),
      pieges: [[iv(a, sa, b, sb), 'crochets-inverses'], [iv(a, sa, b, !sb), 'crochets-inverses']],
      voisin: (k) => iv(a, !sa, b + k, !sb),
    });
  }
  const a = t.entre(-9, 9);
  const sens = t.au(['>', '≥', '<', '≤']);
  const strict = sens === '>' || sens === '<';
  const haut = sens === '>' || sens === '≥';
  const bonne = haut ? iv(a, !strict, Infinity, false) : iv(-Infinity, false, a, !strict);
  const infiniFerme = haut ? `${ouvre(!strict)}${nb(a)} ; +∞]` : `[−∞ ; ${nb(a)}${clot(!strict)}`;
  const autreSens = haut ? iv(-Infinity, false, a, !strict) : iv(a, !strict, Infinity, false);
  const inverse = haut ? iv(a, strict, Infinity, false) : iv(-Infinity, false, a, strict);
  return manche(t.melanger, {
    consigne: 'ecrire-intervalle',
    question: `Les réels x tels que x ${sens} ${nb(a)}`,
    bonne,
    pieges: t.melanger([
      [infiniFerme, 'infini-toujours-ouvert'],
      [autreSens, 'sens-de-la-demi-droite'],
      [inverse, 'crochets-inverses'],
    ]),
    voisin: (k) => (haut ? iv(a + k, !strict, Infinity, false) : iv(-Infinity, false, a - k, !strict)),
  });
}

/* --------------------------------------------- intersection et réunion */

function interUnion(t, quoi) {
  const a0 = t.entre(-8, 2);
  const c = a0 + t.entre(1, 4);
  const b = c + t.entre(1, 5);
  const d0 = b + t.entre(1, 4);
  const infini = t.au(['aucun', 'aucun', 'gauche', 'droite']);
  const a = infini === 'gauche' ? -Infinity : a0;
  const d = infini === 'droite' ? Infinity : d0;
  const [fa, fb, fc, fd] = [t.au([true, false]), t.au([true, false]), t.au([true, false]), t.au([true, false])];
  const inter = iv(c, fc, b, fb);
  const union = iv(a, fa, d, fd);
  const question = `I = ${iv(a, fa, b, fb)} et J = ${iv(c, fc, d, fd)}\nI ${quoi === 'inter' ? '∩' : '∪'} J = ?`;
  if (quoi === 'inter') {
    return manche(t.melanger, {
      consigne: 'intersection',
      question,
      bonne: inter,
      pieges: [[union, 'inter-ou-union'], [iv(c, !fc, b, !fb), 'crochet-de-sa-borne']],
      voisin: (k) => iv(c, fc, b + k, fb),
    });
  }
  return manche(t.melanger, {
    consigne: 'reunion',
    question,
    bonne: union,
    pieges: [[inter, 'union-ou-inter'], [iv(a, !fa, d, !fd), 'crochet-de-sa-borne']],
    voisin: (k) => (d !== Infinity ? iv(a, fa, d + k, fd) : iv(a - k, fa, d, fd)),
  });
}

/* ------------------------------------------- la valeur absolue, distance */

function nonNul(t, min, max) {
  let a;
  do {
    a = t.entre(min, max);
  } while (a === 0);
  return a;
}

function valeurAbsolue(t) {
  const a = nonNul(t, -6, 6);
  const r = t.entre(1, 6);
  const strict = t.au([true, false]);
  const expr = a > 0 ? `|x − ${a}|` : `|x + ${-a}|`;
  return manche(t.melanger, {
    consigne: 'valeur-absolue',
    question: `Les réels x tels que ${expr} ${strict ? '<' : '≤'} ${r}`,
    bonne: iv(a - r, !strict, a + r, !strict),
    pieges: t.melanger([
      [iv(-a - r, !strict, -a + r, !strict), 'signe-du-centre'],
      [iv(-r, !strict, r, !strict), 'centre-oublie'],
      [iv(a - r, strict, a + r, strict), 'crochets-inverses'],
    ]),
    voisin: (k) => iv(a - r - k, !strict, a + r + k, !strict),
  });
}

const cr = (c, r) => `c = ${nb(c)} ; r = ${nb(r)}`;

function centreRayon(t) {
  const a = nonNul(t, -6, 6);
  const r = t.entre(1, 6);
  return manche(t.melanger, {
    consigne: 'centre-rayon',
    question: `${iv(a - r, true, a + r, true)} est l’ensemble des réels x tels que |x − c| ≤ r.\nc et r ?`,
    bonne: cr(a, r),
    pieges: t.melanger([
      [cr(a, 2 * r), 'rayon-demi-longueur'],
      [cr(a - r, 2 * r), 'centre-milieu'],
      [cr(-a, r), 'signe-du-centre'],
    ]),
    voisin: (k) => cr(a, r + k),
  });
}

/* ------------------------------------------------------------ encadrer */

function encadrer(t) {
  const p = t.entre(-6, 4);
  const q = p + t.entre(1, 6);
  const fp = t.au([true, false]);
  const fq = t.au([true, false]);
  let k;
  do {
    k = t.entre(-5, 5);
  } while (k > -2 && k < 2);
  const m = nonNul(t, -9, 9);
  const expr = `${nb(k)}x ${m > 0 ? '+' : '−'} ${Math.abs(m)}`;
  const question = `x ∈ ${iv(p, fp, q, fq)}\nÀ quel intervalle appartient ${expr} ?`;
  if (k > 0) {
    return manche(t.melanger, {
      consigne: 'encadrer',
      question,
      bonne: iv(k * p + m, fp, k * q + m, fq),
      pieges: [
        [iv(k * p, fp, k * q, fq), 'constante-oubliee'],
        [iv(k * (p + m), fp, k * (q + m), fq), 'ordre-des-operations'],
      ],
      voisin: (j) => iv(k * p + m, fp, k * q + m + j, fq),
    });
  }
  return manche(t.melanger, {
    consigne: 'encadrer',
    question,
    bonne: iv(k * q + m, fq, k * p + m, fp),
    pieges: [
      [`${ouvre(fp)}${nb(k * p + m)} ; ${nb(k * q + m)}${clot(fq)}`, 'ordre-renverse'],
      ...t.melanger([
        [iv(k * q + m, fp, k * p + m, fq), 'crochets-suivent-bornes'],
        [iv(k * q, fq, k * p, fp), 'constante-oubliee'],
      ]),
    ],
    voisin: (j) => iv(k * q + m, fq, k * p + m + j, fp),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  const [q1, q2] = t.melanger(['inter', 'union']);
  return t.melanger([
    ecrire(t), ecrire(t),
    interUnion(t, q1), interUnion(t, q2),
    valeurAbsolue(t), centreRayon(t),
    encadrer(t), encadrer(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'ecrire-intervalle': 'Écris cet ensemble de réels sous forme d’intervalle.',
  intersection: 'Trouve l’intersection de ces deux intervalles : les réels qui sont dans les deux à la fois.',
  reunion: 'Trouve la réunion de ces deux intervalles : les réels qui sont dans l’un ou dans l’autre.',
  'valeur-absolue': 'Une valeur absolue est une distance : traduis cette condition par un intervalle.',
  'centre-rayon': 'Retrouve le centre et le rayon de cet intervalle.',
  encadrer: 'Encadre cette expression en partant de l’intervalle où se trouve x.',

  'crochets-inverses': 'Inégalité stricte, crochet ouvert ; inégalité large, crochet fermé. Le crochet ouvert tourne le dos au nombre.',
  'infini-toujours-ouvert': 'L’infini n’est pas un nombre qu’on atteint : de son côté, le crochet est toujours ouvert.',
  'sens-de-la-demi-droite': 'Regarde le sens de l’inégalité : x plus grand que le nombre, on va vers plus l’infini ; plus petit, vers moins l’infini.',
  'inter-ou-union': 'Tu as pris la réunion. L’intersection ne garde que les réels communs aux deux : la plus grande des bornes de gauche, la plus petite des bornes de droite.',
  'union-ou-inter': 'Tu as pris l’intersection. La réunion garde tout ce qui est dans l’un ou dans l’autre : la plus petite borne de gauche, la plus grande borne de droite.',
  'crochet-de-sa-borne': 'Chaque borne garde le crochet de l’intervalle d’où elle vient.',
  'signe-du-centre': 'Attention au signe : la valeur absolue de x moins c mesure la distance de x à c. Avec x plus un nombre, le centre est donc l’opposé de ce nombre.',
  'centre-oublie': 'La distance se mesure à partir du centre, pas à partir de zéro : l’intervalle va du centre moins le rayon au centre plus le rayon.',
  'rayon-demi-longueur': 'Le rayon, c’est la moitié de la longueur de l’intervalle : la distance du centre à une borne.',
  'centre-milieu': 'Le centre est le milieu de l’intervalle : la demi-somme des deux bornes.',
  'ordre-renverse': 'Multiplier par un nombre négatif renverse l’ordre : la plus petite valeur passe à gauche, réécris l’intervalle dans l’ordre.',
  'crochets-suivent-bornes': 'Quand l’ordre se renverse, chaque crochet suit sa borne : celui de droite passe à gauche.',
  'constante-oubliee': 'Tu as multiplié, mais il reste le nombre à ajouter aux deux bornes.',
  'ordre-des-operations': 'On multiplie d’abord, puis on ajoute : respecte l’ordre de l’expression.',

  'ecrire-intervalle-regle': 'Repère les deux bornes, puis le crochet de chacune : fermé si la borne est atteinte, ouvert sinon.',
  'intersection-regle': 'L’intersection va de la plus grande borne de gauche à la plus petite borne de droite, chacune avec son crochet.',
  'reunion-regle': 'Quand les intervalles se chevauchent, la réunion va de la plus petite borne de gauche à la plus grande borne de droite.',
  'valeur-absolue-regle': 'Les réels à une distance du centre au plus égale au rayon : du centre moins le rayon au centre plus le rayon.',
  'centre-rayon-regle': 'Le centre est le milieu des deux bornes, le rayon la moitié de la longueur.',
  'encadrer-regle': 'Applique le calcul à chaque borne ; si tu multiplies par un négatif, renverse l’ordre et les crochets.',
};
