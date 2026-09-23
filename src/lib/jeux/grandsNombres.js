/**
 * LES GRANDS NOMBRES — le coffre des centaines au CM1.
 *
 * Voulu par Camara le 21/09/2026 : « fais tout, comme ça on attaquera le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_NUM_MILLIONS — « Lire et écrire les grands nombres entiers »
 *
 * LE JEU. Deux sens, quatre manches chacun :
 *   - LIRE : le nombre en chiffres, trois écritures en lettres ;
 *   - ÉCRIRE : le nombre en lettres, trois écritures en chiffres.
 *
 * LA CLÉ DU CM1, CE SONT LES CLASSES : on lit par paquets de trois chiffres —
 * millions, mille, unités. LES PIÈGES EN SORTENT :
 *   - un ZÉRO oublié ou déplacé dans une classe : 3 045 200 lu « trois
 *     millions quatre cent cinq mille deux cents » ;
 *   - une CLASSE DÉCALÉE : les millions lus comme des mille.
 * Les chiffres s'écrivent avec l'espace des classes, comme au tableau.
 */

import { enLettres } from './nombresEnLettres.js';
import { bilan as bilanCommun, outils, troisChoix } from './outils.js';

export const MANCHES = 8;

/** « 3 045 200 » : les classes séparées par une espace. */
export const enChiffres = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Un zéro déplacé dans la classe des mille : 045 → 405. */
function zeroDeplace(n) {
  const s = String(n).padStart(9, '0');
  const mille = s.slice(3, 6);
  if (!mille.includes('0') || mille === '000') return n + 100000;
  const permute = mille[1] + mille[0] + mille[2];
  return Number(s.slice(0, 3) + permute + s.slice(6));
}

export function serie(graine = Date.now()) {
  const { entre, melanger } = outils(graine);
  const liste = [];
  const vus = new Set();
  for (let i = 0; i < MANCHES; i += 1) {
    let n;
    do {
      const millions = entre(1, 9) * (i % 3 === 0 ? 1 : entre(1, 3) === 1 ? 10 : 1);
      const mille = entre(0, 9) * 10 + entre(0, 9) + (entre(0, 1) ? 0 : entre(1, 9) * 100);
      const unites = entre(0, 1) ? entre(1, 9) * 100 : entre(10, 999);
      n = millions * 1000000 + mille * 1000 + unites;
    } while (vus.has(n));
    vus.add(n);
    const pieges = [zeroDeplace(n), Math.floor(n / 1000)];
    const nombres = troisChoix(n, pieges, (k) => n + k * 1000);
    const lire = i % 2 === 0;
    liste.push({
      nombre: n,
      consigne: lire ? 'lire' : 'ecrire',
      question: lire ? enChiffres(n) : enLettres(n),
      bonne: n,
      choix: melanger(nombres).map((x) => ({ cle: x, libelle: lire ? enLettres(x) : enChiffres(x) })),
    });
  }
  return liste;
}

/** Juste, ou la classe à regarder : un zéro, ou une classe entière décalée. */
export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return String(cle).length === String(m.bonne).length ? 'zero' : 'classe';
}

export const bilan = (n) => bilanCommun(n, MANCHES);

/** Toutes les phrases dites du jeu — le registre des voix les enregistre. */
export const PHRASES = {
  lire: 'Lis ce grand nombre : quelle est la bonne écriture en lettres ?',
  ecrire: 'Écris ce nombre en chiffres : quelle est la bonne écriture ?',
  zero: 'Regarde chaque classe de trois chiffres : un zéro tient la place d’un chiffre.',
  classe: 'Sépare le nombre en classes : les millions, les mille, puis les unités.',
};
