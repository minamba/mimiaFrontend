/**
 * LE CALCUL MENTAL — 6e, Nora. Suite du calcul mental du primaire.
 *
 * COMPÉTENCE : MATH_6E_CALC_MENTAL.
 *
 * TROIS SORTES DE MANCHES :
 *   - L'ORDRE DE GRANDEUR (3) : 49,8 × 21,3 ≈ 1 000. LE PIÈGE : un zéro de
 *     trop ou de moins (100, 10 000) ;
 *   - LE NOMBRE ROND TOUT PROCHE (3) : 23 × 99 = 2 300 − 23. LE PIÈGE : ne
 *     retirer qu'un (2 299), ou oublier la correction (2 300) ;
 *   - PAR CINQ, VINGT-CINQ, CINQUANTE (2) : par dix puis la moitié, par cent
 *     puis le quart ou la moitié. Pièges : oublier de diviser, se tromper de
 *     division.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'calcul-mental-college', titre: 'Le calcul mental', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le calcul mental',
    accroche: 'Calculer vite, et estimer juste.',
    competences: ['MATH_6E_CALC_MENTAL'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const ESP = ' ';

/** m × 10^e, écrit à la française : « 3 450,25 ». */
function ecrire(m, e = 0) {
  const a = Math.abs(m);
  let entier;
  let decimales = '';
  if (e >= 0) {
    entier = String(a * 10 ** e);
  } else {
    const p = 10 ** -e;
    entier = String(Math.floor(a / p));
    decimales = String(a % p).padStart(-e, '0').replace(/0+$/, '');
  }
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ESP);
  return `${m < 0 ? '−' : ''}${entier}${decimales ? `,${decimales}` : ''}`;
}

function construire(melanger, consigne, question, bonne, pieges, voisin) {
  const vus = [bonne];
  const gardes = [];
  pieges.forEach(([c, phrase]) => {
    if (!vus.includes(c)) { vus.push(c); gardes.push([c, phrase]); }
  });
  const choix = troisChoix(bonne, gardes.map(([c]) => c), voisin);
  return {
    consigne,
    question,
    bonne,
    choix: melanger(choix).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(gardes.filter(([c]) => choix.includes(c))),
  };
}

/** Un écart non nul entre -n et n. */
function ecart(entre, n) {
  let e;
  do { e = entre(-n, n); } while (e === 0);
  return e;
}

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // L'ordre de grandeur d'un produit.
  for (let i = 0; i < 3; i += 1) {
    let question;
    let rond;
    if (au([true, false])) {
      // Deux décimaux proches de dizaines : 49,8 × 21,3 ≈ 50 × 20.
      const A = entre(2, 9) * 10;
      const B = entre(2, 9) * 10;
      question = `${ecrire(A * 10 + ecart(entre, 4), -1)} × ${ecrire(B * 10 + ecart(entre, 4), -1)} ≈ ?`;
      rond = A * B;
    } else {
      // Un nombre proche d'une centaine fois un nombre proche d'une dizaine.
      const A = entre(2, 9) * 100;
      const B = entre(2, 9) * 10;
      question = `${ecrire(A + ecart(entre, 15))} × ${ecrire(B + ecart(entre, 2))} ≈ ?`;
      rond = A * B;
    }
    liste.push(construire(melanger, 'ordre-de-grandeur', question, ecrire(rond),
      [[ecrire(rond / 10), 'ordre-zeros'], [ecrire(rond * 10), 'ordre-zeros']],
      (k) => ecrire(rond * 100 * k)));
  }

  // Le nombre rond tout proche : 9, 11, 99, 101.
  melanger([9, 11, 99, 101]).slice(0, 3).forEach((m) => {
    const B = m < 50 ? 10 : 100;
    const n = B === 10 ? entre(13, 49) : entre(6, 39);
    const bonne = n * m;
    liste.push(construire(melanger, 'nombre-proche', `${n} × ${m} = ?`, ecrire(bonne),
      [[ecrire(n * B + (m - B)), 'corriger-une-fois'], [ecrire(n * B), 'oublier-correction']],
      (k) => ecrire(bonne + k * 10)));
  });

  // Par 5, 25 ou 50.
  melanger([5, 25, 50]).slice(0, 2).forEach((m) => {
    let n;
    if (m === 25) n = entre(2, 24) * 4;
    else n = entre(6, 49) * 2;
    const bonne = n * m;
    const B = m === 5 ? 10 : 100;
    const pieges = [[ecrire(n * B), 'moitie-ou-quart']];
    if (m === 25) pieges.push([ecrire((n * B) / 2), 'moitie-ou-quart']);
    if (m === 50) pieges.push([ecrire((n * B) / 4), 'moitie-ou-quart']);
    liste.push(construire(melanger, 'fois-cinq', `${n} × ${m} = ?`, ecrire(bonne), pieges,
      (k) => ecrire(bonne + k * m)));
  });

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'ordre-de-grandeur': 'Donne un ordre de grandeur de ce produit, sans le calculer exactement.',
  'nombre-proche': 'Calcule de tête, en t’aidant d’un nombre rond tout proche.',
  'fois-cinq': 'Calcule de tête : passe par dix ou par cent.',

  'ordre-zeros': 'Arrondis chaque nombre à une valeur simple, multiplie les chiffres, puis compte bien les zéros.',
  'corriger-une-fois': 'Multiplier par quatre-vingt-dix-neuf, c’est multiplier par cent, puis retirer le nombre lui-même, pas seulement un. Même idée pour neuf, onze ou cent un.',
  'oublier-correction': 'Tu as multiplié par le nombre rond : il reste à ajouter ou à retirer le nombre lui-même.',
  'moitie-ou-quart': 'Par cinq : fois dix, puis la moitié. Par cinquante : fois cent, puis la moitié. Par vingt-cinq : fois cent, puis le quart.',

  'ordre-de-grandeur-regle': 'Remplace chaque nombre par un nombre rond tout proche, puis multiplie.',
  'nombre-proche-regle': 'Multiplie par le nombre rond, puis ajoute ou retire le nombre lui-même autant de fois qu’il le faut.',
  'fois-cinq-regle': 'Cinq, c’est la moitié de dix ; cinquante, la moitié de cent ; vingt-cinq, le quart de cent.',
};
