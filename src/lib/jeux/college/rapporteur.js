/**
 * LE RAPPORTEUR — 6e, Nora. Nouveau jeu.
 *
 * COMPÉTENCE : MATH_6E_MES_ANGLE.
 *
 * Aucun dessin : la position du rapporteur est décrite en texte. Un rapporteur
 * porte deux échelles, l'intérieure et l'extérieure ; en tout point, leurs
 * deux lectures font 180 (40 sur l'une, 140 sur l'autre).
 *
 * TROIS SORTES DE MANCHES :
 *   - LIRE LE RAPPORTEUR (3) : LE PIÈGE CLASSIQUE, lire sur l'échelle qui ne
 *     part pas de zéro sur le premier côté, et trouver 180 − a ;
 *   - AIGU, DROIT OU OBTUS (3) : pièges : confondre aigu et obtus, prendre
 *     pour droit un angle qui ne fait pas exactement 90° ;
 *   - L'ANGLE PARTAGÉ (2) : un angle droit (ou plat) coupé en deux ; l'un
 *     est connu, l’autre ? LE PIÈGE : confondre 90 et 180.
 *
 * LE DESSIN (09/10/2026) : le `visuel` montre l'angle posé sur le rapporteur,
 * sa mesure en « ? » (lecture), ou l'angle avec sa mesure (nature). L'angle
 * partagé : les deux angles adjacents, le connu avec sa mesure, l'autre en « ? ».
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'rapporteur', titre: 'Le rapporteur', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le rapporteur',
    accroche: 'Mesurer un angle, sans se tromper d’échelle.',
    competences: ['MATH_6E_MES_ANGLE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

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

const deg = (a) => `${a}°`;

/** La nature d'un angle d'après sa mesure (entre 0 et 180 exclus). */
export function nature(a) {
  if (a === 90) return 'droit';
  return a < 90 ? 'aigu' : 'obtus';
}

const NATURES = [
  { cle: 'aigu', libelle: 'aigu' },
  { cle: 'droit', libelle: 'droit' },
  { cle: 'obtus', libelle: 'obtus' },
];

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // Lire le rapporteur : le zéro sur [OA], l'autre côté coupe les deux échelles.
  for (let i = 0; i < 3; i += 1) {
    let a;
    do { a = entre(3, 33) * 5; } while (a === 90);
    const zero = au(['intérieure', 'extérieure']);
    const interieure = zero === 'intérieure' ? a : 180 - a;
    const exterieure = 180 - interieure;
    liste.push({
      ...construire(melanger, 'lire-angle',
        `[OA] passe par le 0 de l’échelle ${zero}. [OB] passe par ${interieure} sur l’échelle intérieure et ${exterieure} sur l’échelle extérieure. AÔB = ?`,
        deg(a),
        [[deg(180 - a), 'mauvaise-echelle']],
        (k) => deg(a + (a < 90 ? 10 : -10) * k)),
      visuel: {
        type: 'figure', forme: 'angle', angle: { mesure: a, valeur: '?' }, rapporteur: true,
      },
    });
  }

  // Aigu, droit ou obtus : au moins un aigu et un obtus.
  melanger(['aigu', 'obtus', au(['droit', 'aigu', 'obtus'])]).forEach((sorte) => {
    let a = 90;
    if (sorte === 'aigu') a = entre(1, 17) * 5;
    if (sorte === 'obtus') a = entre(19, 35) * 5;
    const pieges = {};
    NATURES.forEach(({ cle }) => {
      if (cle === sorte) return;
      pieges[cle] = cle === 'droit' || sorte === 'droit' ? 'angle-droit' : 'aigu-obtus';
    });
    liste.push({
      consigne: 'nature-angle',
      question: `Un angle de ${deg(a)} est…`,
      bonne: sorte,
      choix: NATURES.map((c) => ({ ...c })),
      pieges,
      visuel: { type: 'figure', forme: 'angle', angle: { mesure: a, valeur: deg(a) } },
    });
  });

  // L'angle partagé : droit ou plat. Le dessin : l'angle connu, puis l'autre en « ? ».
  const partage = (a, entier) => ({
    type: 'figure', forme: 'angles-adjacents', angle: { mesure1: a, mesure2: entier - a, valeur1: deg(a), valeur2: '?' },
  });
  for (let i = 0; i < 2; i += 1) {
    if (au([true, false])) {
      const a = entre(3, 15) * 5;
      liste.push({
        ...construire(melanger, 'angle-partage',
          `Un angle droit est partagé en deux angles. L’un mesure ${deg(a)}. L’autre ?`, deg(90 - a),
          [[deg(180 - a), 'droit-ou-plat']],
          (k) => deg(90 - a + 10 * k)),
        visuel: partage(a, 90),
      });
    } else {
      let a;
      do { a = entre(4, 32) * 5; } while (a === 90);
      const pieges = a < 90 ? [[deg(90 - a), 'droit-ou-plat']] : [];
      liste.push({
        ...construire(melanger, 'angle-partage',
          `Un angle plat est partagé en deux angles. L’un mesure ${deg(a)}. L’autre ?`, deg(180 - a), pieges,
          (k) => deg(180 - a + 10 * k)),
        visuel: partage(a, 180),
      });
    }
  }

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'lire-angle': 'Lis la mesure de l’angle sur le rapporteur.',
  'nature-angle': 'Cet angle est-il aigu, droit ou obtus ?',
  'angle-partage': 'Quelle est la mesure de l’autre angle ?',

  'mauvaise-echelle': 'Lis sur l’échelle qui part de zéro sur le premier côté, pas sur l’autre : sinon, tu trouves cent quatre-vingts moins la bonne mesure.',
  'aigu-obtus': 'Aigu : plus petit qu’un angle droit, moins de quatre-vingt-dix degrés. Obtus : plus grand, entre quatre-vingt-dix et cent quatre-vingts degrés.',
  'angle-droit': 'Un angle droit mesure exactement quatre-vingt-dix degrés, ni plus ni moins.',
  'droit-ou-plat': 'Un angle droit mesure quatre-vingt-dix degrés, un angle plat cent quatre-vingts : regarde lequel est partagé, puis soustrais.',

  'lire-angle-regle': 'Le centre du rapporteur sur le sommet, un côté sur le zéro : lis la graduation de l’autre côté, sur l’échelle de ce zéro.',
  'nature-angle-regle': 'Compare l’angle à l’angle droit : plus petit, il est aigu ; plus grand, il est obtus.',
  'angle-partage-regle': 'Les deux angles forment ensemble l’angle entier : retire la mesure connue de celle de l’angle entier.',
};
