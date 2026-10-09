/**
 * LES OPÉRATIONS POSÉES — 6e, Nora. Suite des opérations posées du CM2.
 *
 * COMPÉTENCES : MATH_6E_CALC_ADD, MATH_6E_CALC_MULT.
 *
 * QUATRE SORTES DE MANCHES (tout se calcule en entiers) :
 *   - L'ADDITION (2) : 12,5 + 3,47. LE PIÈGE : ajouter les parties décimales
 *     comme des entiers (5 + 47 → 15,52) au lieu de poser virgule sous virgule ;
 *   - LA SOUSTRACTION (1) : 8,3 − 2,45. Pièges : retourner la soustraction des
 *     décimales (45 − 30 → 6,15), oublier de rendre la retenue ;
 *   - LE PRODUIT DE DÉCIMAUX (3) : 2,4 × 0,3. LE PIÈGE : une virgule mal
 *     placée (un chiffre de trop ou de moins après la virgule) ;
 *   - PAR DIX, CENT, MILLE, OU PAR ZÉRO VIRGULE UN (2) : pièges : ajouter des
 *     zéros après la virgule, se tromper de nombre de rangs, de sens.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'operations-college', titre: 'Les opérations posées', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Les opérations posées',
    accroche: 'Virgule sous virgule, et sans erreur.',
    competences: ['MATH_6E_CALC_ADD', 'MATH_6E_CALC_MULT'],
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

const cent = (v) => ecrire(v, -2);

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

/** Un entier entre deux bornes qui ne finit pas par zéro. */
function sansZero(entre, a, b) {
  let n;
  do { n = entre(a, b); } while (n % 10 === 0);
  return n;
}

const FACTEURS = [
  { texte: '10', decalage: 1 },
  { texte: '100', decalage: 2 },
  { texte: `1${ESP}000`, decalage: 3 },
  { texte: '0,1', decalage: -1 },
  { texte: '0,01', decalage: -2 },
];

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // L'addition, en centièmes : a = e1,d1 et b = e2,c.
  for (let i = 0; i < 2; i += 1) {
    const e1 = entre(2, 40);
    const d1 = entre(1, 9);
    const e2 = entre(1, 20);
    const c = sansZero(entre, 11, 89);
    const a = e1 * 100 + d1 * 10;
    const b = e2 * 100 + c;
    const somme = a + b;
    const collee = (e1 + e2) * 100 + d1 + c;
    const [x, y] = au([true, false]) ? [a, b] : [b, a];
    liste.push(construire(melanger, 'addition', `${cent(x)} + ${cent(y)} = ?`, cent(somme),
      [[cent(collee), 'virgule-sous-virgule']],
      (k) => cent(somme + (k % 2 ? 100 : -100) * Math.ceil(k / 2))));
  }

  // La soustraction : les décimales du bas dépassent celles du haut.
  {
    const e1 = entre(5, 40);
    const d1 = entre(1, 8);
    const e2 = entre(1, e1 - 1);
    const c = sansZero(entre, d1 * 10 + 1, 99);
    const a = e1 * 100 + d1 * 10;
    const b = e2 * 100 + c;
    const diff = a - b;
    const retournee = (e1 - e2) * 100 + (c - d1 * 10);
    const sansRetenue = (e1 - e2) * 100 + (100 + d1 * 10 - c);
    liste.push(construire(melanger, 'soustraction', `${cent(a)} − ${cent(b)} = ?`, cent(diff),
      [[cent(retournee), 'soustraction-retournee'], [cent(sansRetenue), 'retenue-oubliee']],
      (k) => cent(diff + k * 10)));
  }

  // Le produit de deux décimaux : x × 10^-ka par y × 10^-kb.
  for (let i = 0; i < 3; i += 1) {
    let x;
    let y;
    let ka;
    let kb;
    do {
      ka = entre(0, 1);
      kb = entre(1, 2);
      x = sansZero(entre, 12, 99);
      y = entre(2, 9);
    } while ((x * y) % 10 === 0);
    const p = x * y;
    const k = ka + kb;
    liste.push(construire(melanger, 'multiplication', `${ecrire(x, -ka)} × ${ecrire(y, -kb)} = ?`, ecrire(p, -k),
      [[ecrire(p, -k + 1), 'virgule-produit'], [ecrire(p, -k - 1), 'virgule-produit']],
      (j) => ecrire(p + j, -k)));
  }

  // Par 10, 100, 1 000, 0,1 ou 0,01 : un nombre à deux décimales.
  melanger(FACTEURS).slice(0, 2).forEach(({ texte, decalage }) => {
    const n = sansZero(entre, 101, 9999);
    const bonne = ecrire(n, -2 + decalage);
    const pieges = decalage > 0
      ? [[`${cent(n)}${'0'.repeat(decalage)}`, 'ajouter-zeros'], [ecrire(n, -2 + decalage - 1), 'decalage-rang']]
      : [[ecrire(n, -2 - decalage), 'par-zero-virgule-un'], [ecrire(n, -2 + decalage + (decalage === -1 ? -1 : 1)), 'decalage-rang']];
    liste.push(construire(melanger, 'par-dix', `${cent(n)} × ${texte} = ?`, bonne, pieges,
      (j) => ecrire(n + j, -2 + decalage)));
  });

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  addition: 'Calcule cette somme : pose-la dans ta tête, virgule sous virgule.',
  soustraction: 'Calcule cette différence : virgule sous virgule, et attention aux retenues.',
  multiplication: 'Calcule ce produit de nombres décimaux.',
  'par-dix': 'Multiplie ce nombre de tête : chaque chiffre change de rang.',

  'virgule-sous-virgule': 'Pose les nombres virgule sous virgule : les dixièmes avec les dixièmes, les centièmes avec les centièmes. Complète avec un zéro si besoin.',
  'soustraction-retournee': 'On ne retourne jamais une soustraction : si le chiffre du haut est plus petit, ajoute-lui dix en empruntant au rang voisin.',
  'retenue-oubliee': 'Quand tu empruntes dix à un rang, rends-le au rang suivant : on ajoute un au chiffre du bas.',
  'virgule-produit': 'Multiplie sans les virgules, puis compte les chiffres après la virgule dans les deux facteurs : le produit en a autant.',
  'ajouter-zeros': 'Ajouter des zéros après la virgule ne change pas le nombre : multiplier par dix, c’est décaler chaque chiffre d’un rang vers la gauche.',
  'decalage-rang': 'Un rang par zéro : par dix, un rang ; par cent, deux rangs ; par mille, trois rangs.',
  'par-zero-virgule-un': 'Multiplier par zéro virgule un ou zéro virgule zéro un rend le nombre plus petit : chaque chiffre recule vers la droite, d’un ou de deux rangs.',

  'addition-regle': 'Virgule sous virgule, on additionne de droite à gauche, sans oublier les retenues.',
  'soustraction-regle': 'Virgule sous virgule, on soustrait de droite à gauche, et chaque emprunt se rend au rang suivant.',
  'multiplication-regle': 'Multiplie les nombres sans virgule, puis place la virgule : autant de chiffres après elle que dans les deux facteurs réunis.',
  'par-dix-regle': 'Par dix, cent ou mille, le nombre grandit ; par zéro virgule un ou zéro virgule zéro un, il rapetisse. Un rang par zéro.',
};
