/**
 * LE SCHÉMA NARRATIF — les cinq étapes d'un récit, en 6e.
 * Professeur : Adrien (français).
 *
 * SITUATION INITIALE, ÉLÉMENT PERTURBATEUR, PÉRIPÉTIES, ÉLÉMENT DE
 * RÉSOLUTION, SITUATION FINALE. Tous les extraits sont écrits pour le jeu,
 * courts, avec l'indice qui tranche (l'imparfait du décor, « un jour »,
 * « tenta… mais », « enfin », « depuis ce jour »).
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2, mélangées) :
 *   - QUELLE ÉTAPE ? (4) : un extrait, trois étapes proposées — la bonne et
 *     ses deux voisines, celles qu'on confond vraiment (la situation initiale
 *     et l'élément perturbateur, les péripéties et la résolution, la
 *     résolution et la situation finale) ;
 *   - LE PREMIER MOMENT (2) : trois phrases d'une même histoire, dans le
 *     désordre ; laquelle vient en premier ? (« remettre dans l'ordre ») ;
 *   - LE DERNIER MOMENT (2) : laquelle vient en dernier ?
 * Les deux histoires d'une partie sont toujours différentes.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'schema-narratif', titre: 'Le schéma narratif', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le schéma narratif',
    accroche: 'Cinq étapes pour une histoire : remets-les.',
    competences: ['FR_6E_LECT_SCHEMA'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Les cinq étapes, dans l'ordre du récit. */
export const ETAPES = ['initiale', 'perturbateur', 'peripeties', 'resolution', 'finale'];

const LIBELLES = {
  initiale: 'Situation initiale',
  perturbateur: 'Élément perturbateur',
  peripeties: 'Péripéties',
  resolution: 'Élément de résolution',
  finale: 'Situation finale',
};

/** Les deux étapes qu'on confond avec chacune. */
const VOISINES = {
  initiale: ['perturbateur', 'finale'],
  perturbateur: ['initiale', 'peripeties'],
  peripeties: ['perturbateur', 'resolution'],
  resolution: ['peripeties', 'finale'],
  finale: ['resolution', 'initiale'],
};

/** [extrait, étape]. */
const EXTRAITS = [
  ['Il y a bien longtemps, au bord d’une forêt, vivait un meunier avec ses trois filles. Chaque jour, il faisait tourner son moulin en chantant.', 'initiale'],
  ['Dans un petit port de Bretagne, Maël aidait son père à réparer les filets. La vie s’écoulait paisiblement, au rythme des marées.', 'initiale'],
  ['Le roi Arthos régnait sur un royaume prospère. Ses sujets vivaient heureux, et la paix durait depuis vingt ans.', 'initiale'],
  ['Mais un matin, le moulin cessa de tourner : la rivière s’était tarie pendant la nuit.', 'perturbateur'],
  ['Un soir de tempête, un inconnu frappa à la porte et remit à Maël une carte mystérieuse.', 'perturbateur'],
  ['Un jour, un dragon surgit des montagnes et enleva la fille du roi.', 'perturbateur'],
  ['Le jeune homme traversa le marais, échappa aux loups, puis se perdit dans une grotte obscure.', 'peripeties'],
  ['Maël affronta d’abord une mer déchaînée ; plus loin, des pirates tentèrent de lui voler sa carte.', 'peripeties'],
  ['Le chevalier tenta d’escalader la tour, mais il glissa. Il essaya alors de convaincre le gardien, qui refusa.', 'peripeties'],
  ['Enfin, grâce à sa flûte magique, la jeune fille endormit le dragon et délivra la princesse.', 'resolution'],
  ['C’est alors qu’un vieux pêcheur montra à Maël le passage secret : il découvrit enfin le trésor caché.', 'resolution'],
  ['Finalement, le meunier trouva la source bouchée par un rocher ; il le déplaça, et l’eau revint.', 'resolution'],
  ['Depuis ce jour, le moulin n’a plus jamais cessé de tourner, et la famille vit dans l’abondance.', 'finale'],
  ['Le chevalier épousa la princesse, et ils régnèrent longtemps sur un royaume en paix.', 'finale'],
  ['De retour au village, Maël partagea son trésor ; on ne le vit plus jamais repartir en mer.', 'finale'],
];

/** Des histoires en cinq phrases courtes, une par étape, dans l'ordre. */
const HISTOIRES = [
  [
    'Une souris vivait heureuse dans une grange.',
    'Un jour, un chat affamé s’installa dans la grange.',
    'La souris tenta de fuir, mais le chat la guettait.',
    'Un chien chassa enfin le chat de la grange.',
    'Depuis, la souris vit de nouveau en paix.',
  ],
  [
    'Lina vivait avec sa grand-mère au bord de la mer.',
    'Un matin, sa grand-mère tomba gravement malade.',
    'Lina chercha en vain une plante rare dans les falaises.',
    'Un berger lui donna enfin la plante qui guérit.',
    'Sa grand-mère guérit, et elles vécurent heureuses.',
  ],
  [
    'Le village de Bréhan était calme et prospère.',
    'Une nuit, la cloche de l’église fut volée.',
    'Les enfants suivirent des traces jusqu’à la forêt.',
    'Ils démasquèrent enfin le voleur, caché dans un moulin.',
    'Depuis, la cloche sonne de nouveau chaque dimanche.',
  ],
  [
    'Le jeune Tom gardait les moutons de son père.',
    'Un soir, un loup emporta le plus bel agneau.',
    'Tom gravit la montagne et affronta l’orage.',
    'Il retrouva enfin l’agneau, sain et sauf, dans une grotte.',
    'Depuis, Tom est le berger le plus respecté du pays.',
  ],
  [
    'Une princesse vivait paisiblement dans son château.',
    'Un jour, un sorcier jaloux la changea en grenouille.',
    'Elle chercha en vain de l’aide auprès des animaux.',
    'Une fée rompit enfin le sortilège.',
    'La princesse retrouva son château et sa joie.',
  ],
  [
    'Chaque été, Hugo passait ses vacances à la ferme.',
    'Un jour, le cheval préféré d’Hugo disparut.',
    'Hugo fouilla les bois, puis les champs voisins.',
    'Il retrouva enfin le cheval, coincé dans un ravin.',
    'Depuis, le cheval ne quitte plus jamais son enclos.',
  ],
  [
    'Un petit robot nettoyait les rues de la ville.',
    'Un jour, une panne plongea la ville dans le noir.',
    'Le robot traversa des quartiers sombres et dangereux.',
    'Il répara enfin la centrale électrique.',
    'La ville brille à nouveau, et le robot est un héros.',
  ],
  [
    'Deux amis tenaient une boulangerie très appréciée.',
    'Un matin, leur vieux four tomba en panne.',
    'Ils essayèrent de le réparer, sans succès.',
    'Un forgeron leur fabriqua enfin une pièce neuve.',
    'Depuis, leur pain est meilleur que jamais.',
  ],
];

const fabriquerEtape = ([question, bonne], melanger) => {
  const autres = VOISINES[bonne];
  return {
    consigne: 'quelle-etape',
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: LIBELLES[c] })),
    pieges: Object.fromEntries(autres.map((c) => [c, `etape-${bonne}`])),
    aide: `etape-${bonne}`,
  };
};

/** Trois phrases d'une histoire, dans le désordre : la plus tôt, ou la plus tardive. */
const fabriquerOrdre = (sens) => (histoire, melanger) => {
  const rangs = melanger([0, 1, 2, 3, 4]).slice(0, 3);
  const bonne = sens === 'premier' ? Math.min(...rangs) : Math.max(...rangs);
  const cle = (r) => ETAPES[r];
  return {
    consigne: `ordre-${sens}`,
    question: sens === 'premier'
      ? 'Laquelle de ces trois phrases vient en premier dans l’histoire ?'
      : 'Laquelle de ces trois phrases vient en dernier dans l’histoire ?',
    bonne: cle(bonne),
    rang: bonne,
    choix: melanger(rangs).map((r) => ({ cle: cle(r), libelle: histoire[r] })),
    pieges: Object.fromEntries(rangs.filter((r) => r !== bonne).map((r) => [cle(r), `ordre-${sens}-indice`])),
    aide: `ordre-${sens}-indice`,
  };
};

export const SORTES = {
  SIXIEME: [
    { banque: EXTRAITS, nombre: 4, fabriquer: fabriquerEtape },
    { banque: HISTOIRES, nombre: 2, fabriquer: fabriquerOrdre('premier'), histoires: true },
    { banque: HISTOIRES, nombre: 2, fabriquer: fabriquerOrdre('dernier'), histoires: true },
  ],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { melanger } = outils(graine);
  const sortes = SORTES[niveau] ?? SORTES[CLASSES[0]];
  // Les histoires se tirent une seule fois : jamais la même deux fois dans une partie.
  const histoires = melanger(HISTOIRES);
  let prises = 0;
  const liste = sortes.flatMap(({ banque, nombre, fabriquer, histoires: h }) => {
    const tirees = h ? histoires.slice(prises, prises + nombre) : melanger(banque).slice(0, nombre);
    if (h) prises += nombre;
    return tirees.map((item) => fabriquer(item, melanger));
  });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'quelle-etape': 'À quelle étape du schéma narratif appartient cet extrait ?',
  'ordre-premier': 'Ces trois phrases viennent de la même histoire. Laquelle arrive en premier ?',
  'ordre-dernier': 'Ces trois phrases viennent de la même histoire. Laquelle arrive en dernier ?',
  'quelle-etape-regle': 'Le récit avance en cinq étapes : situation initiale, élément perturbateur, péripéties, élément de résolution, situation finale.',
  'ordre-premier-regle': 'Le récit part d’un équilibre, la situation initiale ; puis un événement le bouscule, et les aventures commencent.',
  'ordre-dernier-regle': 'Le récit finit par un nouvel équilibre, la situation finale ; juste avant, l’élément de résolution règle le problème.',
  'etape-initiale': 'On présente les personnages, le lieu et leur vie tranquille, souvent à l’imparfait : c’est la situation initiale.',
  'etape-perturbateur': 'Un événement vient bousculer la vie tranquille et lance l’histoire, souvent avec un jour, ou un matin : c’est l’élément perturbateur.',
  'etape-peripeties': 'Le héros agit, rencontre des obstacles, essaie et échoue parfois : ce sont les péripéties.',
  'etape-resolution': 'Un événement met fin au problème, souvent annoncé par enfin ou finalement : c’est l’élément de résolution.',
  'etape-finale': 'Le calme revient, un nouvel équilibre s’installe, souvent pour longtemps, depuis ce jour : c’est la situation finale.',
  'ordre-premier-indice': 'Cherche la phrase où tout est encore calme, celle qui présente le personnage et sa vie : c’est la situation initiale, elle vient d’abord. Puis viennent l’événement qui bouscule tout, et les aventures.',
  'ordre-dernier-indice': 'Cherche la phrase où le problème est réglé pour de bon, souvent avec depuis : c’est la situation finale. Juste avant elle, vient la résolution, avec enfin.',
};
