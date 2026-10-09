/**
 * COMME UNE IMAGE — les figures de style en 5e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_5E_LECT_FIGURES — « Repérer comparaison, métaphore et personnification »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - QUELLE FIGURE ? (4) : comparaison, métaphore, personnification ou
 *     hyperbole. LE PIÈGE : appeler « comparaison » une image sans outil de
 *     comparaison ; l'erreur rappelle l'indice de la bonne figure ;
 *   - L'OUTIL (2) : dans une comparaison, le petit mot qui relie (comme, tel,
 *     pareil à). LES PIÈGES : prendre le comparé ou le comparant ;
 *   - LE COMPARÉ (2) : ce dont on parle vraiment. LE PIÈGE : le comparant,
 *     l'image qu'on lui associe.
 * Phrases écrites pour le jeu, une seule figure défendable chacune : pas de
 * comparaison hyperbolique, pas de métaphore qui personnifie.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'comme-une-image-college', titre: 'Comme une image', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Comme une image',
    accroche: 'Comparaison, métaphore ou personnification ?',
    competences: ['FR_5E_LECT_FIGURES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const FIGURES = {
  comparaison: 'Une comparaison',
  metaphore: 'Une métaphore',
  personnification: 'Une personnification',
  hyperbole: 'Une hyperbole',
};

/** [phrase, figure]. */
export const PHRASES_FIGUREES = [
  ['Ce vieux chien est fidèle comme une ombre.', 'comparaison'],
  ['Sous la pluie, les toits brillaient comme de l’argent.', 'comparaison'],
  ['Pareille à une flèche, l’hirondelle traversa le ciel.', 'comparaison'],
  ['Les feuilles mortes tourbillonnaient comme des papillons.', 'comparaison'],
  ['Sa peau était blanche comme la neige.', 'comparaison'],
  ['Le brouillard, tel un voile, cachait la vallée.', 'comparaison'],
  ['Ce matin, la mer était un miroir immobile.', 'metaphore'],
  ['Ce garçon est un vrai moulin à paroles.', 'metaphore'],
  ['Les étoiles, ces diamants de la nuit, scintillaient.', 'metaphore'],
  ['Pendant la finale, le stade était une marmite bouillante.', 'metaphore'],
  ['Le chemin était un ruban de poussière.', 'metaphore'],
  ['Sous le soleil d’août, le désert est une fournaise.', 'metaphore'],
  ['Le soleil souriait aux promeneurs.', 'personnification'],
  ['Les arbres murmuraient des secrets au vent.', 'personnification'],
  ['La vieille maison soupirait dans la nuit.', 'personnification'],
  ['Le printemps frappe déjà à notre porte.', 'personnification'],
  ['Les étoiles nous regardaient en silence.', 'personnification'],
  ['La ville endormie attendait le jour.', 'personnification'],
  ['Je te l’ai répété mille fois !', 'hyperbole'],
  ['Ce sac pèse une tonne !', 'hyperbole'],
  ['J’ai attendu le bus pendant une éternité.', 'hyperbole'],
  ['Je meurs de faim !', 'hyperbole'],
  ['Ce devoir m’a pris des siècles.', 'hyperbole'],
  ['Après le match, j’étais mort de fatigue.', 'hyperbole'],
];

/** [phrase, comparé, outil (null pour une métaphore), comparant, un autre groupe de la phrase]. */
export const IMAGES = [
  ['Ses yeux brillaient comme des étoiles.', 'ses yeux', 'comme', 'des étoiles', 'brillaient'],
  ['Le lac, pareil à un miroir, reflétait les montagnes.', 'le lac', 'pareil à', 'un miroir', 'les montagnes'],
  ['Mon chat est doux comme de la soie.', 'mon chat', 'comme', 'de la soie', 'doux'],
  ['Tel un lion, le guerrier se jeta sur l’ennemi.', 'le guerrier', 'tel', 'un lion', 'l’ennemi'],
  ['Dans le ciel, les nuages ressemblaient à des moutons.', 'les nuages', 'ressemblaient à', 'des moutons', 'le ciel'],
  ['Sa voix était douce comme une caresse.', 'sa voix', 'comme', 'une caresse', 'douce'],
  ['La plage, semblable à un désert, s’étendait à perte de vue.', 'la plage', 'semblable à', 'un désert', 'à perte de vue'],
  ['Le train filait comme une flèche à travers la plaine.', 'le train', 'comme', 'une flèche', 'la plaine'],
  ['Ma grand-mère est rusée comme un renard.', 'ma grand-mère', 'comme', 'un renard', 'rusée'],
  ['La lune, cette lanterne pâle, éclairait le chemin.', 'la lune', null, 'cette lanterne pâle', 'le chemin'],
  ['Pendant la récréation, cette classe est une ruche.', 'cette classe', null, 'une ruche', 'la récréation'],
  ['Ses yeux sont deux lacs tranquilles.', 'ses yeux', null, 'deux lacs tranquilles', 'sont'],
  ['Le matin, mon frère est un ours.', 'mon frère', null, 'un ours', 'le matin'],
  ['La neige, ce grand drap blanc, couvrait les champs.', 'la neige', null, 'ce grand drap blanc', 'les champs'],
];

const libres = (melanger, bonne, faux) => melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c }));

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const figures = melanger(PHRASES_FIGUREES).slice(0, 4).map(([phrase, figure]) => {
    const autres = melanger(Object.keys(FIGURES).filter((f) => f !== figure)).slice(0, 2);
    const pieges = {};
    autres.forEach((f) => { pieges[f] = f === 'comparaison' ? 'comparaison-sans-outil' : `indice-${figure}`; });
    return {
      consigne: 'figure',
      question: `« ${phrase} »`,
      bonne: figure,
      choix: melanger([figure, ...autres]).map((cle) => ({ cle, libelle: FIGURES[cle] })),
      pieges,
      aide: 'figure-regle',
    };
  });

  const images = melanger(IMAGES);
  const avecOutil = images.filter(([, , o]) => o).slice(0, 2);
  const outilsM = avecOutil.map(([phrase, compare, outil, comparant]) => {
    const faux = [[compare, 'outil-compare'], [comparant, 'outil-comparant']];
    return {
      consigne: 'outil',
      question: `« ${phrase} »`,
      bonne: outil,
      choix: libres(melanger, outil, faux),
      pieges: Object.fromEntries(faux),
      aide: 'outil-regle',
    };
  });

  const comparesM = images.filter((i) => !avecOutil.includes(i)).slice(0, 2).map(([phrase, compare, , comparant, autre]) => {
    const faux = [[comparant, 'compare-comparant'], [autre, 'compare-autre']];
    return {
      consigne: 'compare',
      question: `« ${phrase} »`,
      bonne: compare,
      choix: libres(melanger, compare, faux),
      pieges: Object.fromEntries(faux),
      aide: 'compare-regle',
    };
  });

  return melanger([...figures, ...outilsM, ...comparesM]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  figure: 'Quelle figure de style reconnais-tu dans cette phrase ?',
  outil: 'Dans cette comparaison, quel est l’outil de comparaison ?',
  compare: 'Dans cette image, qu’est-ce qui est comparé ?',
  'comparaison-sans-outil': 'Une comparaison a toujours un outil : comme, tel, pareil à, semblable à. Ici, il n’y en a pas : cherche une autre figure.',
  'indice-comparaison': 'Il y a un outil de comparaison, comme ou tel, qui relie deux choses : c’est une comparaison.',
  'indice-metaphore': 'Deux choses sont rapprochées sans outil de comparaison : l’une devient l’autre. C’est une métaphore.',
  'indice-personnification': 'Une chose ou un animal agit comme une personne : il sourit, il parle, il attend. C’est une personnification.',
  'indice-hyperbole': 'L’idée est exagérée exprès, pour frapper les esprits : c’est une hyperbole.',
  'figure-regle': 'Cherche d’abord un outil de comparaison. S’il y en a un, c’est une comparaison ; sinon, demande-toi si une chose devient une autre, si elle agit comme une personne, ou si l’on exagère.',
  'outil-compare': 'Ce groupe, c’est ce dont on parle : le comparé. L’outil est le petit mot qui le relie à l’image.',
  'outil-comparant': 'Ce groupe, c’est l’image : le comparant. L’outil est le petit mot qui le relie au comparé.',
  'outil-regle': 'L’outil de comparaison relie le comparé et le comparant : comme, tel, pareil à, semblable à, ressembler à.',
  'compare-comparant': 'Ce groupe, c’est l’image qu’on lui associe : le comparant. Le comparé, c’est ce dont la phrase parle vraiment.',
  'compare-autre': 'Le comparé, c’est ce dont on parle vraiment ; le comparant, c’est l’image. Ce groupe n’est ni l’un ni l’autre.',
  'compare-regle': 'Demande-toi de quoi parle vraiment la phrase : c’est le comparé. L’image qu’on lui associe, c’est le comparant.',
};
