/**
 * LA RÈGLE DES DIXIÈMES — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_NUM_DECIMAUX — « Découvrir les nombres décimaux »
 *
 * DEUX SORTES DE MANCHES :
 *   - LA FLÈCHE SUR LA RÈGLE (4) : une règle de 2 à 3 coupée en dix ; la
 *     flèche montre 2,7. Pièges : 2,07 (le zéro qui s'invite) et 27 (la
 *     virgule oubliée). L'écran dessine la règle (`RegleDesDixiemes.js`) ;
 *   - LE PLUS GRAND (4) : 3,5 ou 3,45 ? LE PIÈGE DU CM1 : croire que le
 *     nombre le plus long est le plus grand. On compare chiffre par chiffre,
 *     les dixièmes d'abord.
 */

import { bilan as bilanCommun, outils } from './outils.js';
import { virgule } from './fractionsCM1.js';

export const MANCHES = 8;

const net = (x) => Math.round(x * 100) / 100;

export function serie(graine = Date.now()) {
  const { entre, melanger } = outils(graine);
  const liste = [];

  const dixiemes = melanger([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let i = 0; i < 4; i += 1) {
    const debut = entre(0, 8);
    const d = dixiemes[i];
    const bonne = virgule(net(debut + d / 10));
    const zero = `${debut},0${d}`;
    const colle = String(debut * 10 + d);
    liste.push({
      consigne: 'regle',
      debut,
      dixiemes: d,
      bonne,
      choix: melanger([bonne, zero, colle]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [zero]: 'regle-zero', [colle]: 'regle-virgule' },
    });
  }

  for (let i = 0; i < 4; i += 1) {
    // 3,5 contre 3,45 : le plus court est le plus grand.
    const u = entre(1, 9);
    const d = entre(2, 9);
    const a = virgule(net(u + d / 10));
    const b = virgule(net(u + (d - 1) / 10 + entre(1, 9) / 100));
    liste.push({
      consigne: 'plus-grand',
      question: `${a}   ou   ${b} ?`,
      bonne: a,
      choix: melanger([a, b]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [b]: 'plus-long' },
    });
  }
  return liste;
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  regle: 'Quel nombre montre la flèche ? La règle est coupée en dixièmes.',
  'plus-grand': 'Lequel est le plus grand ?',
  'regle-zero': 'Chaque petit trait vaut un dixième : c’est le premier chiffre après la virgule, sans zéro devant.',
  'regle-virgule': 'N’oublie pas la virgule : la flèche est entre deux nombres entiers.',
  'plus-long': 'Le nombre le plus long n’est pas forcément le plus grand. Compare d’abord les unités, puis les dixièmes.',
};
