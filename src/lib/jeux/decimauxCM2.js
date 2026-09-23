/**
 * LES NOMBRES DÉCIMAUX DU CM2 — la règle des dixièmes au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_NUM_DECIMAUX — « Lire et écrire les nombres décimaux »
 *
 * DEUX SORTES DE MANCHES :
 *   - LA LOUPE SUR LA RÈGLE (4) : entre 2,3 et 2,4, dix centièmes ; la flèche
 *     montre 2,37. Pièges : 2,7 (le rang sauté) et 2,307 (un zéro en trop) ;
 *   - LE ZÉRO QUI COMPTE (4) : 4,05 ou 4,5, lequel est le plus petit — ou
 *     sont-ils égaux ? LE PIÈGE : croire le zéro inutile. Au milieu d'un
 *     nombre, il tient la place des dixièmes.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

export function serie(graine = Date.now()) {
  const { entre, melanger } = outils(graine);
  const liste = [];

  const centiemes = melanger([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (let i = 0; i < 4; i += 1) {
    const u = entre(0, 9);
    const d = entre(0, 8);
    const c = centiemes[i];
    // Écrits chiffre par chiffre : « 6,0 » garde son zéro, que le calcul effacerait.
    const bonne = `${u},${d}${c}`;
    const saute = `${u},${c}`;
    const zero = `${u},${d}0${c}`;
    liste.push({
      consigne: 'loupe',
      gauche: `${u},${d}`,
      droite: `${u},${d + 1}`,
      pas: c,
      bonne,
      choix: melanger([bonne, saute, zero]).map((x) => ({ cle: x, libelle: x })),
      pieges: { [saute]: 'loupe-rang', [zero]: 'loupe-zero' },
    });
  }

  for (let i = 0; i < 4; i += 1) {
    const u = entre(1, 9);
    const a = entre(1, 9);
    const petit = `${u},0${a}`;
    const grand = `${u},${a}`;
    liste.push({
      consigne: 'zero',
      question: `${grand}   ou   ${petit} ?`,
      bonne: petit,
      choix: [...melanger([petit, grand]), 'egaux'].map((x) => ({ cle: x, libelle: x === 'egaux' ? 'Ils sont égaux' : x })),
      pieges: { [grand]: 'zero-plus-grand', egaux: 'zero-egaux' },
    });
  }
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  loupe: 'On a mis la loupe sur un dixième, coupé en dix centièmes. Quel nombre montre la flèche ?',
  zero: 'Lequel est le plus petit ? Ou sont-ils égaux ?',
  'loupe-rang': 'Chaque petit trait vaut un centième : c’est le deuxième chiffre après la virgule, derrière les dixièmes.',
  'loupe-zero': 'Il n’y a pas de zéro entre les dixièmes et les centièmes : le centième vient juste après.',
  'zero-plus-grand': 'Compare les dixièmes : l’un en a zéro, l’autre en a plusieurs. Le zéro rend le nombre plus petit.',
  'zero-egaux': 'Le zéro au milieu n’est pas inutile : il dit qu’il n’y a aucun dixième. Ces deux nombres ne sont pas égaux.',
};
