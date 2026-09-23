/**
 * LA BOÎTE MYSTÈRE — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_ALG_INCONNUE — « Représenter un nombre inconnu par un symbole »
 *
 * UN NOMBRE EST CACHÉ DANS LA BOÎTE : ▢ + 17 = 45. Trois sortes de manches :
 *   - L'ADDITION À TROU (3) : ▢ + 17 = 45 → 28. LE PIÈGE : 45 + 17 = 62,
 *     on a ajouté au lieu de retirer ;
 *   - LA MULTIPLICATION À TROU (3) : ▢ × 6 = 42 → 7. LE PIÈGE : 42 − 6 ;
 *   - LE NOMBRE PENSÉ (2) : « je le multiplie par 3, j'ajoute 4, j'obtiens
 *     25 » → 7. On défait à l'envers. Le piège : défaire dans le mauvais ordre.
 */

import { bilan as bilanCommun, outils, troisChoix } from './outils.js';

export const MANCHES = 8;
export const BOITE = '▢';

export function serie(graine = Date.now()) {
  const { entre, melanger } = outils(graine);
  const liste = [];

  for (let i = 0; i < 3; i += 1) {
    const x = entre(12, 68);
    const a = entre(11, 39);
    const s = x + a;
    const devant = i % 2 === 0;
    liste.push({
      consigne: 'addition',
      question: devant ? `${BOITE} + ${a} = ${s}` : `${a} + ${BOITE} = ${s}`,
      bonne: x,
      choix: melanger(troisChoix(x, [s + a], (k) => x + 10 * k)).map((c) => ({ cle: c, libelle: String(c) })),
      pieges: { [s + a]: 'addition-sens' },
    });
  }

  for (let i = 0; i < 3; i += 1) {
    const x = entre(3, 9);
    const a = entre(4, 9);
    const p = x * a;
    liste.push({
      consigne: 'multiplication',
      question: `${BOITE} × ${a} = ${p}`,
      bonne: x,
      choix: melanger(troisChoix(x, [p - a, p + a], (k) => x + k)).map((c) => ({ cle: c, libelle: String(c) })),
      pieges: { [p - a]: 'multiplication-moins', [p + a]: 'multiplication-plus' },
    });
  }

  for (let i = 0; i < 2; i += 1) {
    const x = entre(3, 12);
    const f = entre(2, 5);
    const a = entre(2, 9);
    const r = x * f + a;
    // Défaire dans le mauvais ordre : diviser d'abord, puis retirer.
    const desordre = r / f - a;
    const pieges = Number.isInteger(desordre) && desordre > 0 ? [desordre] : [];
    liste.push({
      consigne: 'pense',
      question: `Je pense à un nombre. Je le multiplie par ${f}, puis j’ajoute ${a}. J’obtiens ${r}.`,
      bonne: x,
      choix: melanger(troisChoix(x, [...pieges, r - a], (k) => x + k)).map((c) => ({ cle: c, libelle: String(c) })),
      pieges: { ...(pieges.length ? { [desordre]: 'pense-ordre' } : {}), [r - a]: 'pense-moitie' },
    });
  }
  return liste;
}

export function verdict(m, cle) {
  if (Number(cle) === m.bonne) return 'juste';
  return m.pieges[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  addition: 'Quel nombre se cache dans la boîte ?',
  multiplication: 'Quel nombre se cache dans la boîte ?',
  pense: 'À quel nombre ai-je pensé ?',
  'addition-sens': 'Tu as ajouté. Pour trouver ce qui manque, on retire : le total moins le nombre connu.',
  'addition-regle': 'Cherche ce qui manque : le total moins le nombre connu.',
  'multiplication-moins': 'On ne soustrait pas : cherche dans quelle table se trouve le résultat.',
  'multiplication-plus': 'On n’ajoute pas : cherche dans quelle table se trouve le résultat.',
  'multiplication-regle': 'Combien de fois ce nombre tient-il dans le résultat ? C’est une division.',
  'pense-ordre': 'On défait à l’envers : d’abord on retire ce qu’on a ajouté, ensuite on divise.',
  'pense-moitie': 'Tu as retiré ce qu’on a ajouté, c’est bien. Il reste à défaire la multiplication : divise.',
  'pense-regle': 'Défais les calculs en partant de la fin : retire, puis divise.',
};
