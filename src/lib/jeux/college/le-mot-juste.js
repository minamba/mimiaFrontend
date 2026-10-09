/**
 * LE MOT JUSTE — le vocabulaire au collège, de la 6e à la 3e.
 * Professeur : Adrien (français).
 *
 * Prolonge « Contraires et jumeaux » du CM2 (`vocabulaireCM2.js`). Banques
 * écrites à la main : une seule réponse défendable, et des pièges qui sont
 * de vraies confusions d'élèves.
 *
 * 6e — RELATIONS ET FORMATION DES MOTS (3 + 3 + 2) :
 *   - LE SYNONYME (3) : pièges, le contraire et le mot de la même famille
 *     (« courageux » → « courage » n'est pas un synonyme : autre classe) ;
 *   - UN MOT, PLUSIEURS SENS (3) : c'est le contexte qui choisit ;
 *   - PRÉFIXE, RADICAL, SUFFIXE (2).
 *
 * 5e — LE LEXIQUE DU JUGEMENT ET DES SENTIMENTS (3 + 3 + 2) :
 *   - QUEL SENTIMENT ? (3) : des indices (gestes, corps, paroles) ;
 *   - LE PLUS FORT (3) : la gradation (inquiétude, peur, terreur) ;
 *   - FAVORABLE OU DÉFAVORABLE ? (2).
 *
 * 4e — DÉNOTATION ET CONNOTATION (3 + 3 + 2) :
 *   - MÉLIORATIF, NEUTRE OU PÉJORATIF (3) : demeure, maison, masure ;
 *   - CE QU'IL DÉSIGNE, CE QU'IL ÉVOQUE (3) : la colombe est un oiseau, elle
 *     évoque la paix ;
 *   - SYNONYMES, ANTONYMES, HOMONYMES, PARONYMES (2).
 *
 * 3e — LE MOT PRÉCIS (3 + 3 + 2) :
 *   - LE MOT PASSE-PARTOUT (3) : faire, dire, chose, il y a, mettre, avoir.
 *     Pièges : un mot précis qui ne va pas avec le complément (« commettre un
 *     gâteau »), et un autre mot passe-partout ;
 *   - LE MOT QUI REGROUPE (3) : l'hyperonyme exact, ni trop large ni faux ;
 *   - LE VERBE PRÉCIS (2) : « dire tout bas », c'est chuchoter.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'le-mot-juste', titre: 'Le mot juste', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le mot juste',
    accroche: 'Synonymes, sens et familles de mots.',
    competences: ['FR_6E_LANG_VOC_RELATIONS', 'FR_6E_LANG_FORMATION'],
  },
  CINQUIEME: {
    titre: 'Le mot juste',
    accroche: 'Les mots du jugement et des sentiments.',
    competences: ['FR_5E_LANG_LEXIQUE', 'FR_5E_LANG_VOC_RELATIONS'],
  },
  QUATRIEME: {
    titre: 'Le mot juste',
    accroche: 'Ce que le mot dit, ce qu’il suggère.',
    competences: ['FR_4E_LANG_CONNOTATION', 'FR_4E_LANG_VOC_RELATIONS'],
  },
  TROISIEME: {
    titre: 'Le mot juste',
    accroche: 'Chasse les mots passe-partout.',
    competences: ['FR_3E_LANG_LEXIQUE', 'FR_3E_LANG_VOC_RELATIONS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const enChoix = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** [question, bonne, [faux, piège], …] → une manche. */
function depuisBanque(melanger, consigne, [question, bonne, ...faux]) {
  return {
    consigne,
    question,
    bonne,
    choix: enChoix(melanger([bonne, ...faux.map(([f]) => f)])),
    pieges: Object.fromEntries(faux),
  };
}

/** Une question à étiquettes fixes : chaque mauvaise étiquette renvoie à la règle de la bonne. */
function classement(consigne, question, bonne, cles, libelles, prefixe) {
  return {
    consigne,
    question,
    bonne,
    choix: cles.map((c) => ({ cle: c, libelle: libelles[c] })),
    pieges: Object.fromEntries(cles.filter((c) => c !== bonne).map((c) => [c, `${prefixe}-${bonne}`])),
  };
}

// ------------------------------------------------------------------ 6e

/** [phrase, mot, synonyme, contraire, mot de la même famille]. */
export const SYNONYMES_6E = [
  ['Le chemin est étroit.', 'étroit', 'resserré', 'large', 'étroitesse'],
  ['Elle a répondu avec calme.', 'calme', 'sérénité', 'agitation', 'calmer'],
  ['C’est un élève très habile.', 'habile', 'adroit', 'maladroit', 'habileté'],
  ['Il a commencé son exposé.', 'commencé', 'entamé', 'terminé', 'commencement'],
  ['La salle était pleine.', 'pleine', 'remplie', 'vide', 'plénitude'],
  ['Il est très courageux.', 'courageux', 'brave', 'lâche', 'courage'],
  ['Le voyage fut long et pénible.', 'pénible', 'éprouvant', 'agréable', 'peine'],
  ['Elle dissimule sa joie.', 'dissimule', 'cache', 'montre', 'dissimulation'],
  ['Ce gâteau est délicieux.', 'délicieux', 'savoureux', 'infect', 'délice'],
  ['Notre équipe a gagné le match.', 'gagné', 'remporté', 'perdu', 'gain'],
  ['Il est triste depuis hier.', 'triste', 'malheureux', 'joyeux', 'tristesse'],
  ['Le soldat obéit aux ordres.', 'obéit', 'se soumet', 'désobéit', 'obéissance'],
];

/** [phrase, mot, le bon sens, deux autres sens du même mot]. */
export const POLYSEMIE_6E = [
  ['Le pilote a pris les commandes de l’avion.', 'commandes', 'les manettes pour diriger', 'des achats demandés à un magasin', 'des ordres donnés à quelqu’un'],
  ['Ce détail est la clé de l’énigme.', 'clé', 'ce qui permet de comprendre', 'un objet qui ouvre une serrure', 'un signe au début d’une portée'],
  ['La mer est calme : pas une ride à sa surface.', 'ride', 'une petite vague', 'un pli de la peau', 'une rayure sur un objet'],
  ['Le chef d’orchestre lève sa baguette.', 'baguette', 'un petit bâton pour diriger', 'un pain long', 'un bâtonnet pour manger'],
  ['Ils pique-niquent au pied de la montagne.', 'pied', 'le bas', 'une partie du corps', 'une unité de mesure'],
  ['Le serveur apporte l’addition.', 'addition', 'la note à payer', 'une opération de calcul', 'un ajout'],
  ['La tempête a déchiré les voiles du bateau.', 'voiles', 'les toiles qui prennent le vent', 'des tissus qui cachent le visage', 'des brumes légères'],
  ['Le prisonnier a purgé sa peine.', 'peine', 'sa punition', 'son chagrin', 'son effort'],
  ['Le navire a mis le cap sur l’île.', 'cap', 'la direction', 'une pointe de terre dans la mer', 'une étape difficile'],
  ['Ce chanteur a une voix grave.', 'grave', 'basse', 'sérieuse', 'dangereuse'],
  ['Le cuisinier a monté les blancs en neige.', 'monté', 'battus pour les rendre fermes', 'portés en haut', 'assemblés pièce par pièce'],
  ['Le boxeur a encaissé un coup terrible.', 'encaissé', 'reçu sans tomber', 'mis de l’argent en caisse', 'rangé dans une caisse'],
];

export const FORMATION_6E = [
  ['Le radical de « démontable »', 'mont', ['démont', 'formation-radical'], ['able', 'formation-radical']],
  ['Le radical de « refroidissement »', 'froid', ['refroid', 'formation-radical'], ['ment', 'formation-radical']],
  ['Le radical de « dangereusement »', 'danger', ['dangereuse', 'formation-radical'], ['ment', 'formation-radical']],
  ['Le radical de « reboiser »', 'bois', ['rebois', 'formation-radical'], ['er', 'formation-radical']],
  ['Le radical de « impoli »', 'poli', ['im', 'formation-radical'], ['impol', 'formation-radical']],
  ['« re- » dans « relire » veut dire…', 'à nouveau', ['le contraire', 'formation-sens'], ['avant', 'formation-sens']],
  ['« in- » dans « inutile » veut dire…', 'le contraire', ['à nouveau', 'formation-sens'], ['avant', 'formation-sens']],
  ['« pré- » dans « préhistoire » veut dire…', 'avant', ['après', 'formation-sens'], ['à nouveau', 'formation-sens']],
  ['« dé- » dans « défaire » veut dire…', 'le contraire', ['avant', 'formation-sens'], ['à nouveau', 'formation-sens']],
  ['lent + le suffixe -ment', 'lentement', ['ralentir', 'formation-suffixe'], ['lenteur', 'formation-suffixe']],
  ['Le suffixe de « jardinage »', '-age', ['jardin', 'formation-suffixe'], ['-nage', 'formation-suffixe']],
  ['Le suffixe de « chanteur »', '-eur', ['chant', 'formation-suffixe'], ['-teur', 'formation-suffixe']],
  ['Le suffixe de « lavable »', '-able', ['lav', 'formation-suffixe'], ['-ble', 'formation-suffixe']],
  ['Le préfixe de « impossible »', 'im-', ['possible', 'formation-prefixe'], ['-ible', 'formation-prefixe']],
  ['Le préfixe de « déplacer »', 'dé-', ['place', 'formation-prefixe'], ['-er', 'formation-prefixe']],
];

function sixieme({ melanger }) {
  const liste = [];
  melanger(SYNONYMES_6E).slice(0, 3).forEach(([phrase, mot, bonne, contraire, famille]) => {
    liste.push(depuisBanque(melanger, 'synonyme-6e', [
      `« ${phrase} » Un synonyme de « ${mot} » :`, bonne,
      [contraire, 'synonyme-contraire'], [famille, 'synonyme-famille'],
    ]));
  });
  melanger(POLYSEMIE_6E).slice(0, 3).forEach(([phrase, mot, bonne, a, b]) => {
    liste.push(depuisBanque(melanger, 'polysemie-6e', [
      `« ${phrase} » Ici, « ${mot} » veut dire…`, bonne,
      [a, 'polysemie-contexte'], [b, 'polysemie-contexte'],
    ]));
  });
  melanger(FORMATION_6E).slice(0, 2).forEach((e) => liste.push(depuisBanque(melanger, 'formation-6e', e)));
  return melanger(liste);
}

// ------------------------------------------------------------------ 5e

/** [passage, le sentiment, deux autres]. */
export const SENTIMENTS_5E = [
  ['Il serra les poings, prêt à exploser, et claqua la porte.', 'la colère', 'la tristesse', 'la surprise'],
  ['Elle baissa les yeux et rougit : tout le monde avait vu son erreur.', 'la honte', 'la colère', 'la joie'],
  ['Enfin, il avait retrouvé son chien ! Il poussa un long soupir.', 'le soulagement', 'la tristesse', 'la jalousie'],
  ['Il ne supportait pas que son frère reçoive plus de cadeaux que lui.', 'la jalousie', 'l’admiration', 'la honte'],
  ['Elle regardait les vieilles photos de son enfance en soupirant.', 'la nostalgie', 'la colère', 'la jalousie'],
  ['Son cœur battait fort ; il n’osait plus avancer dans le noir.', 'la peur', 'la joie', 'l’admiration'],
  ['Il regarda l’athlète franchir la barre et applaudit, ébloui.', 'l’admiration', 'la jalousie', 'la peur'],
  ['Elle le toisa de haut, sans même daigner lui répondre.', 'le mépris', 'la peur', 'l’admiration'],
  ['Il était minuit et sa fille n’était toujours pas rentrée.', 'l’inquiétude', 'la joie', 'le mépris'],
  ['Elle sautait partout en riant : elle avait réussi son examen !', 'la joie', 'la honte', 'l’inquiétude'],
  ['Il resta bouche bée devant ce cadeau qu’il n’attendait pas.', 'la surprise', 'la colère', 'le mépris'],
  ['Depuis le départ de son ami, il passait ses journées seul, les larmes aux yeux.', 'la tristesse', 'la jalousie', 'le soulagement'],
];

/** [le plus fort, deux mots plus faibles du même sens]. */
export const GRADATION_5E = [
  ['la terreur', 'l’inquiétude', 'la peur'],
  ['la fureur', 'l’agacement', 'la colère'],
  ['le désespoir', 'la mélancolie', 'la tristesse'],
  ['l’euphorie', 'la satisfaction', 'la joie'],
  ['stupéfait', 'étonné', 'surpris'],
  ['furieux', 'mécontent', 'fâché'],
  ['adorer', 'apprécier', 'aimer'],
  ['exécrable', 'médiocre', 'mauvais'],
  ['excellent', 'correct', 'bon'],
  ['épouvanté', 'craintif', 'effrayé'],
  ['magnifique', 'joli', 'beau'],
  ['ravi', 'satisfait', 'content'],
];

/** [expression, favorable ou defavorable]. */
export const JUGEMENTS_5E = [
  ['un geste généreux', 'favorable'],
  ['un élève exemplaire', 'favorable'],
  ['un travail remarquable', 'favorable'],
  ['un ami loyal', 'favorable'],
  ['un acte héroïque', 'favorable'],
  ['une idée brillante', 'favorable'],
  ['une conduite admirable', 'favorable'],
  ['un artiste talentueux', 'favorable'],
  ['un geste lâche', 'defavorable'],
  ['un travail médiocre', 'defavorable'],
  ['un ami hypocrite', 'defavorable'],
  ['un acte odieux', 'defavorable'],
  ['un enfant égoïste', 'defavorable'],
  ['une conduite méprisable', 'defavorable'],
  ['un résultat lamentable', 'defavorable'],
  ['un discours ennuyeux', 'defavorable'],
];
const NOM_JUGEMENTS = { favorable: 'Favorable', defavorable: 'Défavorable' };

function cinquieme({ melanger }) {
  const liste = [];
  melanger(SENTIMENTS_5E).slice(0, 3).forEach(([passage, bonne, a, b]) => {
    liste.push(depuisBanque(melanger, 'sentiment-5e', [passage, bonne, [a, 'sentiment-indices'], [b, 'sentiment-indices']]));
  });
  melanger(GRADATION_5E).slice(0, 3).forEach(([bonne, a, b]) => {
    liste.push(depuisBanque(melanger, 'gradation-5e', ['Le mot le plus fort :', bonne, [a, 'gradation-intensite'], [b, 'gradation-intensite']]));
  });
  melanger(JUGEMENTS_5E).slice(0, 2).forEach(([expression, bonne]) => {
    liste.push(classement('jugement-5e', `« ${expression} »`, bonne, ['favorable', 'defavorable'], NOM_JUGEMENTS, 'jugement'));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ 4e

/** [mot, sa connotation]. */
export const CONNOTATIONS_4E = [
  ['un taudis', 'pejoratif'],
  ['une masure', 'pejoratif'],
  ['un chauffard', 'pejoratif'],
  ['un canasson', 'pejoratif'],
  ['pleurnicher', 'pejoratif'],
  ['la populace', 'pejoratif'],
  ['un rafiot', 'pejoratif'],
  ['un écrivaillon', 'pejoratif'],
  ['maigrichon', 'pejoratif'],
  ['avare', 'pejoratif'],
  ['téméraire', 'pejoratif'],
  ['une demeure', 'melioratif'],
  ['svelte', 'melioratif'],
  ['un festin', 'melioratif'],
  ['un parfum', 'melioratif'],
  ['économe', 'melioratif'],
  ['audacieux', 'melioratif'],
  ['intrépide', 'melioratif'],
  ['un chef-d’œuvre', 'melioratif'],
  ['une maison', 'neutre'],
  ['un conducteur', 'neutre'],
  ['un cheval', 'neutre'],
  ['pleurer', 'neutre'],
  ['la foule', 'neutre'],
  ['un bateau', 'neutre'],
  ['un écrivain', 'neutre'],
  ['un repas', 'neutre'],
  ['une odeur', 'neutre'],
];
const NOM_CONNOTATIONS = { melioratif: 'Mélioratif', neutre: 'Neutre', pejoratif: 'Péjoratif' };

/** [mot, dénotation, connotation, une idée qui ne s'y attache pas]. */
export const DENOTATIONS_4E = [
  ['la rose', 'une fleur à épines', 'l’amour', 'la ruse'],
  ['le noir', 'la couleur la plus sombre', 'le deuil', 'la paix'],
  ['la colombe', 'un oiseau proche du pigeon', 'la paix', 'la trahison'],
  ['le renard', 'un mammifère au pelage roux', 'la ruse', 'la pureté'],
  ['l’automne', 'la saison entre l’été et l’hiver', 'le déclin', 'le renouveau'],
  ['le lion', 'un grand félin sauvage', 'le courage', 'la bêtise'],
  ['le serpent', 'un reptile sans pattes', 'la trahison', 'la paix'],
  ['le printemps', 'la saison entre l’hiver et l’été', 'le renouveau', 'le deuil'],
  ['le blanc', 'la couleur de la neige', 'la pureté', 'le deuil'],
  ['l’âne', 'un animal proche du cheval', 'la bêtise', 'le courage'],
  ['la fourmi', 'un insecte qui vit en colonie', 'le travail', 'la paresse'],
  ['l’or', 'un métal précieux et jaune', 'la richesse', 'la pauvreté'],
];

/** [paire de mots, relation]. */
export const RELATIONS_4E = [
  ['éminent / imminent', 'paronymes'],
  ['collision / collusion', 'paronymes'],
  ['conjecture / conjoncture', 'paronymes'],
  ['effraction / infraction', 'paronymes'],
  ['allusion / illusion', 'paronymes'],
  ['irruption / éruption', 'paronymes'],
  ['percepteur / précepteur', 'paronymes'],
  ['verre / vert', 'homonymes'],
  ['chair / chère', 'homonymes'],
  ['pain / pin', 'homonymes'],
  ['cour / court', 'homonymes'],
  ['sceau / seau', 'homonymes'],
  ['conte / compte', 'homonymes'],
  ['vaillant / courageux', 'synonymes'],
  ['craindre / redouter', 'synonymes'],
  ['achever / terminer', 'synonymes'],
  ['bâtir / construire', 'synonymes'],
  ['sincère / hypocrite', 'antonymes'],
  ['généreux / avare', 'antonymes'],
  ['éphémère / durable', 'antonymes'],
  ['optimiste / pessimiste', 'antonymes'],
  ['maladroit / habile', 'antonymes'],
];
const NOM_RELATIONS = {
  synonymes: 'Synonymes', antonymes: 'Antonymes', homonymes: 'Homonymes', paronymes: 'Paronymes',
};

function quatrieme({ melanger, entre }) {
  const liste = [];
  melanger(CONNOTATIONS_4E).slice(0, 3).forEach(([mot, bonne]) => {
    liste.push(classement('connotation-4e', `« ${mot} »`, bonne, ['melioratif', 'neutre', 'pejoratif'], NOM_CONNOTATIONS, 'connotation'));
  });
  melanger(DENOTATIONS_4E).slice(0, 3).forEach(([mot, denotation, connotation, intrus]) => {
    // Le tirage décide : ce que le mot désigne, ou ce qu'il évoque.
    if (entre(0, 1) === 0) {
      liste.push(depuisBanque(melanger, 'denotation-4e', [
        `« ${mot} » désigne…`, denotation,
        [connotation, 'denotation-sens-premier'], [intrus, 'denotation-sens-premier'],
      ]));
    } else {
      liste.push(depuisBanque(melanger, 'evocation-4e', [
        `« ${mot} » évoque souvent…`, connotation,
        [denotation, 'connotation-pas-denotation'], [intrus, 'connotation-autre-mot'],
      ]));
    }
  });
  melanger(RELATIONS_4E).slice(0, 2).forEach(([paire, bonne]) => {
    liste.push(classement('relation-4e', paire, bonne, ['synonymes', 'antonymes', 'homonymes', 'paronymes'], NOM_RELATIONS, 'relation'));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ 3e

export const PASSE_PARTOUT_3E = [
  ['[faire] une erreur', 'commettre', ['réaliser', 'precis-contexte'], ['avoir', 'precis-vague']],
  ['[faire] un gâteau', 'confectionner', ['commettre', 'precis-contexte'], ['mettre', 'precis-vague']],
  ['[faire] un discours', 'prononcer', ['confectionner', 'precis-contexte'], ['dire', 'precis-vague']],
  ['[faire] un mur', 'construire', ['prononcer', 'precis-contexte'], ['mettre', 'precis-vague']],
  ['[faire] du sport', 'pratiquer', ['exercer', 'precis-contexte'], ['avoir', 'precis-vague']],
  ['[faire] un métier', 'exercer', ['confectionner', 'precis-contexte'], ['avoir', 'precis-vague']],
  ['[dire] un secret', 'révéler', ['déclamer', 'precis-contexte'], ['faire', 'precis-vague']],
  ['[dire] son opinion', 'exprimer', ['réciter', 'precis-contexte'], ['faire', 'precis-vague']],
  ['[dire] une poésie devant la classe', 'réciter', ['révéler', 'precis-contexte'], ['faire', 'precis-vague']],
  ['Le marteau est une [chose] utile.', 'un outil', ['un ustensile', 'precis-contexte'], ['un truc', 'precis-vague']],
  ['La liberté est une [chose] précieuse.', 'une valeur', ['un outil', 'precis-contexte'], ['un truc', 'precis-vague']],
  ['[Il y a] un arbre devant la maison.', 'Un arbre se dresse', ['Un arbre coule', 'precis-contexte'], ['Un arbre est', 'precis-vague']],
  ['[Il y a] une rivière au fond de la vallée.', 'Une rivière coule', ['Une rivière se dresse', 'precis-contexte'], ['Une rivière est', 'precis-vague']],
  ['[mettre] son manteau pour sortir', 'enfiler', ['ranger', 'precis-contexte'], ['faire', 'precis-vague']],
  ['[avoir] une maladie', 'contracter', ['commettre', 'precis-contexte'], ['faire', 'precis-vague']],
  ['[donner] un prix au gagnant', 'décerner', ['prononcer', 'precis-contexte'], ['mettre', 'precis-vague']],
];

/** [liste, le mot qui les regroupe exactement, un mot trop large, un mot faux]. */
export const HYPERONYMES_3E = [
  ['marteau, scie, tournevis', 'des outils', 'des objets', 'des ustensiles'],
  ['violon, flûte, piano', 'des instruments de musique', 'des objets', 'des appareils'],
  ['chêne, sapin, bouleau', 'des arbres', 'des végétaux', 'des fleurs'],
  ['roman, conte, nouvelle', 'des récits', 'des textes', 'des poèmes'],
  ['colère, joie, peur', 'des émotions', 'des mots', 'des caractères'],
  ['chaise, armoire, table', 'des meubles', 'des objets', 'des outils'],
  ['football, tennis, judo', 'des sports', 'des activités', 'des jeux'],
  ['merle, moineau, pigeon', 'des oiseaux', 'des animaux', 'des insectes'],
  ['requin, saumon, thon', 'des poissons', 'des animaux', 'des mammifères'],
  ['Mercure, Mars, Jupiter', 'des planètes', 'des astres', 'des étoiles'],
  ['fourmi, abeille, mouche', 'des insectes', 'des animaux', 'des oiseaux'],
  ['pomme, poire, cerise', 'des fruits', 'des aliments', 'des légumes'],
];

export const VERBE_PRECIS_3E = [
  ['Il a [dit] tout bas, à l’oreille de son voisin : « Attention. »', 'chuchoté', ['hurlé', 'verbe-indice'], ['affirmé', 'verbe-indice']],
  ['Elle a [dit] en criant de toutes ses forces : « Au secours ! »', 'hurlé', ['murmuré', 'verbe-indice'], ['suggéré', 'verbe-indice']],
  ['Il a [dit], en hésitant et en butant sur les mots, qu’il était désolé.', 'bredouillé', ['proclamé', 'verbe-indice'], ['ordonné', 'verbe-indice']],
  ['Le capitaine a [dit] d’un ton sans réplique : « Rompez ! »', 'ordonné', ['supplié', 'verbe-indice'], ['chuchoté', 'verbe-indice']],
  ['Elle a [dit], à genoux, les mains jointes : « Pitié ! »', 'supplié', ['ordonné', 'verbe-indice'], ['affirmé', 'verbe-indice']],
  ['Il a [dit] en se moquant : « Joli travail… »', 'ironisé', ['supplié', 'verbe-indice'], ['bredouillé', 'verbe-indice']],
  ['Le blessé [est allé] péniblement jusqu’à la porte.', 's’est traîné', ['s’est précipité', 'verbe-indice'], ['a couru', 'verbe-indice']],
  ['Le cheval [est allé] très vite vers la ligne d’arrivée.', 'a galopé', ['a trotté', 'verbe-indice'], ['s’est traîné', 'verbe-indice']],
  ['Elle a [regardé] longuement, sans bouger, ce tableau qu’elle admirait.', 'contemplé', ['aperçu', 'verbe-indice'], ['entrevu', 'verbe-indice']],
  ['Il a [vu] un court instant une ombre passer.', 'aperçu', ['contemplé', 'verbe-indice'], ['examiné', 'verbe-indice']],
  ['Le médecin a [regardé] la plaie avec soin, dans les moindres détails.', 'examiné', ['aperçu', 'verbe-indice'], ['entrevu', 'verbe-indice']],
  ['Il a [mangé] son repas très vite, en avalant de gros morceaux.', 'englouti', ['grignoté', 'verbe-indice'], ['savouré', 'verbe-indice']],
  ['Elle a [mangé] lentement, en appréciant chaque bouchée.', 'savouré', ['englouti', 'verbe-indice'], ['dévoré', 'verbe-indice']],
];

function troisieme({ melanger }) {
  const liste = [];
  melanger(PASSE_PARTOUT_3E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'passe-partout-3e', e)));
  melanger(HYPERONYMES_3E).slice(0, 3).forEach(([mots, bonne, large, faux]) => {
    liste.push(depuisBanque(melanger, 'hyperonyme-3e', [
      `${mots} : ce sont…`, bonne,
      [large, 'hyperonyme-trop-large'], [faux, 'hyperonyme-faux'],
    ]));
  });
  melanger(VERBE_PRECIS_3E).slice(0, 2).forEach((e) => liste.push(depuisBanque(melanger, 'verbe-precis-3e', e)));
  return melanger(liste);
}

// ------------------------------------------------------------------ le jeu

const PAR_NIVEAU = {
  SIXIEME: sixieme, CINQUIEME: cinquieme, QUATRIEME: quatrieme, TROISIEME: troisieme,
};

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const fabrique = PAR_NIVEAU[niveau] ?? PAR_NIVEAU[CLASSES[0]];
  return fabrique(outils(graine));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 6e
  'synonyme-6e': 'Choisis le synonyme : le mot qui a le même sens dans cette phrase.',
  'synonyme-6e-regle': 'Un synonyme se met à la place du mot sans changer le sens de la phrase : essaie-le dans la phrase.',
  'synonyme-contraire': 'Ce mot dit le contraire : c’est un antonyme. Un synonyme a le même sens.',
  'synonyme-famille': 'Ce mot est de la même famille, mais ce n’est pas un synonyme : il n’est pas de la même classe. Remets-le dans la phrase pour vérifier.',
  'polysemie-6e': 'Ce mot a plusieurs sens. Lequel a-t-il dans cette phrase ?',
  'polysemie-6e-regle': 'Un mot polysémique a plusieurs sens : ce sont les mots autour qui choisissent le bon.',
  'polysemie-contexte': 'Ce sens existe, mais pas dans cette phrase : lis les mots autour, c’est le contexte qui choisit le sens.',
  'formation-6e': 'Découpe le mot : préfixe, radical, suffixe.',
  'formation-6e-regle': 'Le préfixe est avant le radical, le suffixe après. Le radical est la partie commune à toute la famille.',
  'formation-radical': 'Le radical, c’est la partie commune à tous les mots de la famille : enlève le préfixe et le suffixe.',
  'formation-prefixe': 'Le préfixe se place avant le radical : in-, im-, dé-, re-, pré-.',
  'formation-suffixe': 'Le suffixe se place après le radical, et change souvent la classe du mot : -ment, -age, -eur, -able.',
  'formation-sens': 'Chaque préfixe a son sens : in-, im- et dé- disent le contraire ; re- dit « à nouveau » ; pré- dit « avant ».',

  // 5e
  'sentiment-5e': 'Quel sentiment éprouve le personnage ?',
  'sentiment-5e-regle': 'Cherche les indices : les gestes, le corps, les paroles du personnage disent ce qu’il ressent.',
  'sentiment-indices': 'Relis les indices : un geste, une réaction du corps, une situation. Lequel de ces sentiments les explique tous ?',
  'gradation-5e': 'Lequel de ces mots est le plus fort ?',
  'gradation-5e-regle': 'Range les mots du plus faible au plus fort : le plus fort dit le sentiment ou le jugement à l’extrême.',
  'gradation-intensite': 'Ce mot est plus faible. Range les trois du plus faible au plus fort : le dernier est celui qui va le plus loin.',
  'jugement-5e': 'Ce mot exprime-t-il un jugement favorable, ou défavorable ?',
  'jugement-5e-regle': 'Demande-toi si le mot fait l’éloge, ou s’il critique.',
  'jugement-favorable': 'Ce mot fait l’éloge : il exprime un jugement favorable.',
  'jugement-defavorable': 'Ce mot critique, il blâme : il exprime un jugement défavorable.',

  // 4e
  'connotation-4e': 'Ce mot est-il mélioratif, neutre ou péjoratif ?',
  'connotation-4e-regle': 'Demande-toi si le mot ajoute un jugement : favorable, il est mélioratif ; défavorable, péjoratif ; aucun, neutre.',
  'connotation-melioratif': 'Ce mot ajoute un jugement favorable, une valeur : il est mélioratif.',
  'connotation-neutre': 'Ce mot désigne la chose sans la juger : il est neutre.',
  'connotation-pejoratif': 'Ce mot ajoute un jugement défavorable, du mépris : il est péjoratif.',
  'denotation-4e': 'Quelle est la dénotation de ce mot : ce qu’il désigne ?',
  'denotation-4e-regle': 'La dénotation, c’est le sens premier, celui du dictionnaire.',
  'denotation-sens-premier': 'La dénotation, c’est le sens premier, celui du dictionnaire. Ce que le mot évoque en plus, c’est sa connotation.',
  'evocation-4e': 'Que suggère ce mot ? Cherche sa connotation.',
  'evocation-4e-regle': 'La connotation, c’est ce que le mot évoque en plus de son sens : une idée, une émotion.',
  'connotation-pas-denotation': 'Ça, c’est la dénotation, ce que le mot désigne. La connotation, c’est ce qu’il évoque en plus : une idée, une émotion.',
  'connotation-autre-mot': 'Cette idée ne s’attache pas à ce mot. Pense aux fables, aux poèmes, aux expressions où il revient.',
  'relation-4e': 'Quelle relation unit ces deux mots ?',
  'relation-4e-regle': 'Compare le sens des deux mots, puis leur son.',
  'relation-synonymes': 'Les deux mots ont le même sens : on peut remplacer l’un par l’autre. Ce sont des synonymes.',
  'relation-antonymes': 'Les deux mots ont des sens contraires : ce sont des antonymes.',
  'relation-homonymes': 'Les deux mots se prononcent de la même façon, mais n’ont pas le même sens : ce sont des homonymes.',
  'relation-paronymes': 'Les deux mots se ressemblent sans se prononcer tout à fait pareil, et leur sens diffère : ce sont des paronymes.',

  // 3e
  'passe-partout-3e': 'Remplace le mot passe-partout par le mot précis.',
  'passe-partout-3e-regle': 'Le mot précis dit exactement l’action ou la chose, et il va avec son complément.',
  'precis-contexte': 'Ce mot est précis, mais il ne va pas avec ce complément : relis toute l’expression avant de choisir.',
  'precis-vague': 'Ce mot est aussi vague que le premier : cherche celui qui dit exactement l’action ou la chose.',
  'hyperonyme-3e': 'Quel mot regroupe exactement tous les autres ?',
  'hyperonyme-3e-regle': 'Cherche la catégorie la plus précise à laquelle chaque mot de la liste appartient.',
  'hyperonyme-trop-large': 'Ce mot est juste, mais trop large : cherche la catégorie la plus précise qui les regroupe tous.',
  'hyperonyme-faux': 'Ce mot ne convient pas à tous : vérifie que chaque mot de la liste en fait bien partie.',
  'verbe-precis-3e': 'Remplace le verbe entre crochets par le verbe le plus précis.',
  'verbe-precis-3e-regle': 'Relis la phrase : un indice dit comment l’action est faite. Le verbe précis contient cette manière.',
  'verbe-indice': 'Ce verbe ne dit pas la même manière : relis l’indice dans la phrase, il dit comment l’action est faite.',
};
