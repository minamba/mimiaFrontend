/**
 * LA RECETTE POUR 8 — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_PROP_IDENTIFIER — « Reconnaître une situation de proportionnalité »
 *   MATH_CM1_PROP_RESOUDRE   — « Résoudre un problème de proportionnalité »
 *
 * DEUX SORTES DE MANCHES :
 *   - LA RECETTE (6) : pour 4 personnes, 200 g de farine ; pour 8 ? pour 6 ?
 *     LE PIÈGE DU CM1, C'EST L'ADDITION : on ajoute 4 personnes, donc on
 *     ajoute 4 grammes. Pour 6, on passe par une personne ou par la moitié ;
 *   - EST-CE PROPORTIONNEL ? (2) : l'âge et la taille ne le sont pas ; le
 *     prix des cahiers, si.
 */

import { bilan as bilanCommun, outils, troisChoix } from './outils.js';

export const MANCHES = 8;

/** [ingrédient, unité, quantité pour 4]. */
const INGREDIENTS = [
  ['farine', 'g', [200, 240, 300, 400]],
  ['lait', 'cL', [40, 60, 80]],
  ['œufs', '', [2, 4, 6]],
  ['sucre', 'g', [100, 120, 160]],
  ['beurre', 'g', [80, 100, 120]],
];

/** [situation, oui ou non]. */
export const SITUATIONS = [
  ['3 cahiers coûtent 6 €. 6 cahiers coûtent 12 €.', true],
  ['À 5 ans, Léo mesure 1,10 m. À 10 ans, il mesure 1,40 m.', false],
  ['Une voiture fait 100 km en 1 heure, et 200 km en 2 heures, toujours à la même vitesse.', true],
  ['Un bébé de 1 mois pèse 4 kg. À 2 mois, il pèse 5 kg.', false],
  ['1 kg de pommes coûte 3 €. 2 kg coûtent 6 €.', true],
  ['À 8 ans, Zoé chausse du 31. À 16 ans, elle chausse du 39.', false],
];

const avec = (q, unite, nom) => (unite ? `${q} ${unite} de ${nom}` : `${q} ${nom}`);

export function serie(graine = Date.now()) {
  const { au, melanger } = outils(graine);
  const liste = [];
  const cibles = melanger([8, 8, 12, 6, 2, 6]);
  melanger(INGREDIENTS).concat(melanger(INGREDIENTS)).slice(0, 6).forEach(([nom, unite, quantites], i) => {
    const pour4 = au(quantites);
    const n = cibles[i];
    const bonne = (pour4 * n) / 4;
    const ajout = pour4 + (n - 4);
    const double = pour4 * 2 === bonne ? pour4 * 4 : pour4 * 2;
    liste.push({
      consigne: n === 8 || n === 12 ? 'recette-fois' : 'recette-passer',
      question: `Pour 4 personnes : ${avec(pour4, unite, nom)}. Pour ${n} personnes ?`,
      bonne,
      choix: melanger(troisChoix(bonne, [ajout, double], (k) => bonne + k * (pour4 / 4))).map((c) => ({ cle: c, libelle: avec(c, unite, nom) })),
      // L'ajout d'abord nommé : s'il tombe sur le double, c'est lui qu'on explique.
      pieges: { [double]: 'recette-regle', [ajout]: 'ajout' },
    });
  });
  melanger(SITUATIONS.filter(([, p]) => p)).slice(0, 1)
    .concat(melanger(SITUATIONS.filter(([, p]) => !p)).slice(0, 1))
    .forEach(([question, oui]) => {
      liste.push({
        consigne: 'proportionnel',
        question,
        bonne: oui ? 'oui' : 'non',
        choix: [{ cle: 'oui', libelle: 'Oui, c’est proportionnel' }, { cle: 'non', libelle: 'Non' }],
      });
    });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'proportionnel') return m.bonne === 'oui' ? 'prop-oui' : 'prop-non';
  return m.pieges[cle] ?? 'recette-regle';
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'recette-fois': 'Combien en faut-il ? Regarde combien de fois plus de personnes.',
  'recette-passer': 'Combien en faut-il ? Tu peux passer par la moitié, ou par une seule personne.',
  proportionnel: 'Est-ce une situation de proportionnalité ?',
  ajout: 'On n’ajoute pas le même nombre : quand les personnes sont deux fois plus nombreuses, il faut deux fois plus de tout.',
  'recette-regle': 'Cherche d’abord la quantité pour une personne, ou pour deux, puis multiplie.',
  'prop-oui': 'Quand l’un double, l’autre double aussi : c’est proportionnel.',
  'prop-non': 'Quand l’un double, l’autre ne double pas : ce n’est pas proportionnel.',
};
