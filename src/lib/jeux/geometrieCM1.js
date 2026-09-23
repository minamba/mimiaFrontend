/**
 * LA GÉOMÉTRIE DU CM1 — le miroir au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_MES_ANGLE           — « Comparer des angles et employer leur
 *                                  vocabulaire »
 *   MATH_CM1_GEO_PERPENDICULAIRE — « Tracer perpendiculaires et parallèles »
 *   MATH_CM1_GEO_SYMETRIE        — « Construire le symétrique d'une figure
 *                                  simple »
 *
 * TROIS SORTES DE MANCHES, TOUTES DESSINÉES (le dessin vit dans l'écran,
 * `GeometrieCM1.js` ; le module ne garde que les nombres) :
 *   - L'ANGLE (3) : aigu, droit ou obtus — l'équerre comme juge ;
 *   - DEUX DROITES (3) : perpendiculaires, parallèles, ou ni l'un ni l'autre ;
 *   - LE MIROIR (2) : trois moitiés proposées pour compléter la figure. Les
 *     pièges : la figure qui a GLISSÉ sans se retourner, et celle qui s'est
 *     retournée DE HAUT EN BAS.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

export const ANGLES = { aigu: [35, 50, 65], droit: [90], obtus: [115, 130, 150] };
export const NOMS = {
  aigu: 'Aigu', droit: 'Droit', obtus: 'Obtus', perpendiculaires: 'Perpendiculaires', paralleles: 'Parallèles', secantes: 'Ni l’un ni l’autre',
};

/** Le demi-quadrillage de gauche : 4 colonnes, 5 rangs ; la colonne 3 touche l'axe. */
const LARGEUR = 4;
const HAUTEUR = 5;
const cle = (cases) => cases.map(([x, y]) => `${x}.${y}`).sort().join(' ');

export function serie(graine = Date.now()) {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  melanger(['aigu', 'droit', 'obtus']).forEach((sorte) => {
    liste.push({
      consigne: 'angle',
      angle: au(ANGLES[sorte]),
      rotation: entre(0, 3) * 20 - 30,
      bonne: sorte,
      choix: ['aigu', 'droit', 'obtus'].map((c) => ({ cle: c, libelle: NOMS[c] })),
    });
  });

  melanger(['perpendiculaires', 'paralleles', 'secantes']).forEach((sorte) => {
    liste.push({
      consigne: 'droites',
      rotation: entre(0, 5) * 15,
      ecart: { perpendiculaires: 90, paralleles: 0, secantes: au([40, 60, 125]) }[sorte],
      bonne: sorte,
      choix: ['perpendiculaires', 'paralleles', 'secantes'].map((c) => ({ cle: c, libelle: NOMS[c] })),
    });
  });

  while (liste.length < MANCHES) {
    // Cinq ou six carreaux, dont au moins un contre l'axe.
    const cases = [[LARGEUR - 1, entre(0, HAUTEUR - 1)]];
    while (cases.length < entre(5, 6)) {
      const [x, y] = au(cases);
      const [dx, dy] = au([[1, 0], [-1, 0], [0, 1], [0, -1]]);
      const c = [x + dx, y + dy];
      if (c[0] >= 0 && c[0] < LARGEUR && c[1] >= 0 && c[1] < HAUTEUR && !cases.some(([a, b]) => a === c[0] && b === c[1])) cases.push(c);
    }
    const miroir = cases.map(([x, y]) => [LARGEUR - 1 - x, y]);
    const glisse = cases.map(([x, y]) => [x, y]);
    const bas = cases.map(([x, y]) => [LARGEUR - 1 - x, HAUTEUR - 1 - y]);
    const cles = [cle(miroir), cle(glisse), cle(bas)];
    if (new Set(cles).size === 3) {
      liste.push({
        consigne: 'miroir',
        gauche: cases,
        bonne: 'miroir',
        moities: { miroir, glisse, bas },
        choix: melanger(['miroir', 'glisse', 'bas']).map((c) => ({ cle: c, libelle: c })),
      });
    }
  }
  return liste;
}

export function verdict(m, choisi) {
  if (choisi === m.bonne) return 'juste';
  if (m.consigne === 'miroir') return `miroir-${choisi}`;
  return `${m.consigne}-${m.bonne}`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export { LARGEUR, HAUTEUR };

export const PHRASES = {
  angle: 'Cet angle est-il aigu, droit ou obtus ?',
  droites: 'Ces deux droites sont-elles perpendiculaires, parallèles, ou ni l’un ni l’autre ?',
  miroir: 'Quelle moitié complète la figure, comme dans un miroir ?',
  'angle-aigu': 'Il est plus fermé que le coin de l’équerre : c’est un angle aigu.',
  'angle-droit': 'Le coin de l’équerre s’y pose exactement : c’est un angle droit.',
  'angle-obtus': 'Il est plus ouvert que le coin de l’équerre : c’est un angle obtus.',
  'droites-perpendiculaires': 'Elles se coupent en faisant un angle droit : elles sont perpendiculaires.',
  'droites-paralleles': 'Elles gardent toujours le même écart et ne se croisent jamais : elles sont parallèles.',
  'droites-secantes': 'Elles se croisent, mais pas en angle droit : ni perpendiculaires, ni parallèles.',
  'miroir-glisse': 'Cette figure a glissé sans se retourner. Dans un miroir, elle se retourne, et chaque carreau reste à la même distance de l’axe.',
  'miroir-bas': 'Cette figure s’est retournée de haut en bas. L’axe est debout : les carreaux gardent leur hauteur.',
};
