/**
 * LES AIRES DU CM2 — le tour du jardin au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_MES_AIRE — « Calculer l'aire d'un rectangle »
 *
 * AU CM2, ON NE COMPTE PLUS LES CARREAUX, ON MULTIPLIE, ET L'AIRE A SON
 * UNITÉ : des centimètres carrés, des mètres carrés. Les pièges :
 *   - le PÉRIMÈTRE, en cm (le tour, pas la surface) ;
 *   - l'ADDITION des deux côtés, en cm² ;
 *   - pour la pièce en L, UN SEUL des deux rectangles.
 * Trois rectangles, deux carrés, trois pièces en L.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

export function serie(graine = Date.now()) {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  const rectangle = (consigne, a, b, u, texte) => {
    const aire = `${a * b} ${u}²`;
    const tour = `${2 * (a + b)} ${u}`;
    const somme = `${a + b} ${u}²`;
    liste.push({
      consigne,
      question: texte,
      bonne: aire,
      choix: melanger([aire, tour, somme]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [tour]: 'perimetre', [somme]: 'addition' },
    });
  };

  for (let i = 0; i < 3; i += 1) {
    const a = entre(5, 12);
    const b = entre(2, a - 1);
    const u = au(['cm', 'm']);
    rectangle('rectangle', a, b, u, `Un rectangle de ${a} ${u} sur ${b} ${u}.`);
  }
  for (let i = 0; i < 2; i += 1) {
    const c = entre(3, 9);
    // Un carré de 4 : aire 16, périmètre 16 — deux réponses qui se liraient pareil.
    const cote = c === 4 ? 5 : c;
    const u = au(['cm', 'm']);
    rectangle('carre', cote, cote, u, `Un carré de ${cote} ${u} de côté.`);
  }

  for (let i = 0; i < 3; i += 1) {
    const a = entre(5, 9);
    const b = entre(3, 6);
    const c = entre(2, 4);
    const d = entre(2, 4);
    const bonne = `${a * b + c * d} m²`;
    const seul = `${a * b} m²`;
    const tout = `${(a + c) * (b + d)} m²`;
    liste.push({
      consigne: 'compose',
      question: `Une pièce en L : un rectangle de ${a} m sur ${b} m, collé à un rectangle de ${c} m sur ${d} m.`,
      bonne,
      choix: melanger([bonne, seul, tout]).map((x) => ({ cle: x, libelle: x })),
      pieges: { [seul]: 'compose-seul', [tout]: 'compose-tout' },
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
  rectangle: 'Quelle est l’aire de ce rectangle ?',
  carre: 'Quelle est l’aire de ce carré ?',
  compose: 'Quelle est l’aire de cette pièce ?',
  perimetre: 'Ça, c’est le tour de la figure, en centimètres ou en mètres. L’aire se mesure en carrés : longueur fois largeur.',
  addition: 'On n’ajoute pas les côtés : l’aire, c’est la longueur multipliée par la largeur.',
  'compose-seul': 'Tu n’as compté qu’un des deux rectangles. Calcule l’aire de chacun, puis ajoute-les.',
  'compose-tout': 'La pièce n’est pas un grand rectangle : il lui manque un coin. Calcule chaque rectangle, puis ajoute.',
};
