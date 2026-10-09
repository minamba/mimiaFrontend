/**
 * QUEL REGISTRE ? — registres, fantastique et réalisme en 4e.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_4E_LECT_REGISTRE    — « Identifier le registre d'un texte et ce qui le
 *                             produit »
 *   FR_4E_LECT_FANTASTIQUE — « Identifier ce qui crée le doute dans un récit
 *                             fantastique »
 *   FR_4E_LECT_REALISME    — « Lire une nouvelle réaliste ou fantastique et en
 *                             analyser la chute »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - LE REGISTRE (4) : un court extrait écrit pour le jeu — comique,
 *     tragique, pathétique, lyrique, fantastique, réaliste (et merveilleux,
 *     le voisin du fantastique). LES PIÈGES : pathétique et tragique,
 *     lyrique et pathétique, fantastique et merveilleux, fantastique et
 *     réaliste ; chaque paire a sa phrase ;
 *   - LE DOUTE (2) : ce qui fait hésiter le lecteur (« il me sembla »,
 *     « je crus », une question sans réponse), le cadre ordinaire, la fin
 *     ouverte, le « je » du narrateur ;
 *   - LA NOUVELLE (2) : chute, incipit, La Parure et Le Horla (Maupassant),
 *     La Vénus d'Ille (Mérimée), Balzac et le réalisme.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'quel-registre', titre: 'Quel registre ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'Quel registre ?',
    accroche: 'Réaliste, fantastique, tragique…',
    competences: ['FR_4E_LECT_REGISTRE', 'FR_4E_LECT_FANTASTIQUE', 'FR_4E_LECT_REALISME'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const REGISTRES = {
  comique: 'Comique',
  tragique: 'Tragique',
  pathetique: 'Pathétique',
  lyrique: 'Lyrique',
  fantastique: 'Fantastique',
  realiste: 'Réaliste',
  merveilleux: 'Merveilleux',
};

/** Les deux registres qu'on prend le plus souvent pour celui-ci. */
const CONFUSIONS = {
  comique: ['tragique', 'lyrique'],
  tragique: ['pathetique', 'comique'],
  pathetique: ['tragique', 'lyrique'],
  lyrique: ['pathetique', 'realiste'],
  fantastique: ['merveilleux', 'realiste'],
  realiste: ['fantastique', 'lyrique'],
  merveilleux: ['fantastique', 'realiste'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [extrait écrit pour le jeu, registre]. */
export const EXTRAITS = [
  ['Voulant saluer la comtesse avec élégance, monsieur Crapoussin s’inclina si bas que sa perruque tomba dans la soupière.', 'comique'],
  ['« Je n’ai peur de rien ! » déclara le capitaine, avant de sauter sur une chaise en voyant passer une souris.', 'comique'],
  ['Le professeur expliqua pendant une heure l’importance du silence, en criant si fort qu’on l’entendit dans tout le collège.', 'comique'],
  ['Œdipe a fui sa ville pour échapper à l’oracle ; mais sur la route, sans le savoir, il tue son propre père. Les dieux l’avaient annoncé : il ne pouvait y échapper.', 'tragique'],
  ['Elle doit choisir entre l’honneur de sa famille et l’homme qu’elle aime : quoi qu’elle fasse, elle perdra tout.', 'tragique'],
  ['Le héros sait que le destin a parlé : il marche vers le combat où il mourra, sans pouvoir s’y soustraire.', 'tragique'],
  ['La petite fille, pieds nus dans la neige, frottait ses allumettes une à une pour se réchauffer ; personne ne s’arrêtait pour la regarder.', 'pathetique'],
  ['Chaque soir, le vieux chien attendait son maître à la gare. Son maître ne revint jamais, et l’animal, maigre et tremblant, continua d’attendre.', 'pathetique'],
  ['La mère serrait contre elle son enfant malade ; elle n’avait plus de pain, plus de feu, et elle pleurait en silence.', 'pathetique'],
  ['Ô mon pays, que j’aime tes collines ! Mon cœur s’envole quand je revois tes champs dorés sous le soleil du soir.', 'lyrique'],
  ['Je t’attends depuis l’aube, et chaque instant sans toi me semble une saison entière ; mon âme ne vit que de ton souvenir.', 'lyrique'],
  ['Que la mer est belle ce matin ! Je sens monter en moi une joie immense, pareille aux vagues qui viennent à moi.', 'lyrique'],
  ['Ce soir-là, en rentrant, je trouvai ma chaise tournée vers la fenêtre. Je vis seul, et j’avais fermé à clé. Avais-je rêvé ? Je n’ose encore le croire.', 'fantastique'],
  ['Quand je me suis couché, le portrait de mon grand-père avait les yeux fermés. Au matin, ils me fixaient. Était-ce la fatigue ?', 'fantastique'],
  ['Chaque nuit, j’entends des pas au grenier. Pourtant, il est vide, et personne n’en a la clé. Je finis par me demander si je ne deviens pas fou.', 'fantastique'],
  ['La rue s’éveillait : les marchands ouvraient leurs volets, une odeur de pain chaud sortait de la boulangerie, et les fiacres claquaient sur les pavés.', 'realiste'],
  ['Dans l’atelier, quarante ouvrières cousaient depuis six heures du matin, penchées sur leurs machines, pour un salaire qui payait à peine le loyer.', 'realiste'],
  ['Le père Martin comptait ses sous sur la table de la cuisine, à la lueur de la lampe à pétrole, en soupirant devant le prix du charbon.', 'realiste'],
  ['La fée toucha la citrouille de sa baguette, et elle devint un carrosse doré. Cendrillon y monta sans s’étonner.', 'merveilleux'],
  ['Le dragon salua le roi et lui offrit trois œufs d’or ; personne, à la cour, ne parut surpris.', 'merveilleux'],
];

/** [question, bonne réponse, [[choix faux, phrase de l'erreur], …]]. */
export const DOUTE = [
  ['Laquelle de ces phrases crée le doute ?', 'Il me sembla que la statue bougeait.', [['La statue se dressait au milieu du parc.', 'doute-fait'], ['La statue était en bronze.', 'doute-fait']]],
  ['Laquelle de ces phrases crée le doute ?', 'Je crus entendre une voix m’appeler.', [['La maison était silencieuse.', 'doute-fait'], ['Je montai l’escalier.', 'doute-fait']]],
  ['Laquelle de ces phrases crée le doute ?', 'Était-ce un rêve ? Je n’ose le dire.', [['Je me couchai vers minuit.', 'doute-fait'], ['La chambre donnait sur le jardin.', 'doute-fait']]],
  ['Laquelle de ces phrases crée le doute ?', 'Peut-être n’était-ce que le vent…', [['Le vent soufflait depuis le matin.', 'doute-fait'], ['Je fermai la fenêtre.', 'doute-fait']]],
  ['Lequel de ces mots marque l’hésitation ?', 'peut-être', [['certainement', 'doute-fait'], ['hier', 'doute-fait']]],
  ['À la fin d’un récit fantastique, le plus souvent…', 'le doute demeure', [['tout s’explique par un rêve', 'doute-fin'], ['une fée vient tout réparer', 'doute-merveilleux']]],
  ['Un récit fantastique commence le plus souvent…', 'dans un cadre ordinaire, réaliste', [['dans un royaume imaginaire', 'doute-cadre'], ['sur une planète lointaine', 'doute-cadre']]],
  ['Pourquoi le narrateur fantastique dit-il souvent « je » ?', 'On partage ses doutes', [['Pour faire rire le lecteur', 'doute-je'], ['Il connaît toute la vérité', 'doute-je']]],
  ['Dans le merveilleux, le surnaturel…', 'est accepté sans étonnement', [['fait douter le héros', 'doute-merveilleux'], ['n’apparaît jamais', 'doute-merveilleux']]],
];

/** [question, bonne réponse, deux choix faux, phrase de l'erreur]. */
export const NOUVELLE = [
  ['La fin inattendue d’une nouvelle, qui surprend le lecteur, s’appelle…', 'la chute', ['l’incipit', 'la morale'], 'nouvelle-chute'],
  ['Les toutes premières lignes d’un roman ou d’une nouvelle s’appellent…', 'l’incipit', ['la chute', 'l’épilogue'], 'nouvelle-incipit'],
  ['Qui a écrit la nouvelle La Parure ?', 'Guy de Maupassant', ['Victor Hugo', 'Jules Verne'], 'nouvelle-maupassant'],
  ['La Parure : Mathilde a passé dix ans à rembourser une rivière de diamants perdue. La chute révèle que…', 'le collier était faux', ['le collier a été retrouvé', 'son mari l’avait vendu'], 'nouvelle-parure'],
  ['Le Horla, de Maupassant, est une nouvelle…', 'fantastique', ['comique', 'merveilleuse'], 'nouvelle-horla'],
  ['Qui a écrit la nouvelle fantastique La Vénus d’Ille ?', 'Prosper Mérimée', ['Molière', 'Jean de La Fontaine'], 'nouvelle-merimee'],
  ['Un écrivain réaliste cherche avant tout à…', 'peindre le monde tel qu’il est', ['faire rêver avec la magie', 'chanter ses sentiments en vers'], 'nouvelle-realisme'],
  ['Lequel de ces détails est réaliste ?', 'le prix du pain chez le boulanger', ['une épée qui parle', 'un château de nuages'], 'nouvelle-detail'],
  ['Quel romancier du XIXe siècle est un grand écrivain réaliste ?', 'Honoré de Balzac', ['Pierre de Ronsard', 'Chrétien de Troyes'], 'nouvelle-balzac'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const registres = melanger(EXTRAITS).slice(0, 4).map(([extrait, registre]) => {
    const autres = CONFUSIONS[registre];
    return {
      consigne: 'registre',
      question: extrait,
      bonne: registre,
      choix: melanger([registre, ...autres]).map((cle) => ({ cle, libelle: REGISTRES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, paire(a, registre)])),
      aide: 'registre-regle',
    };
  });

  const doute = melanger(DOUTE).slice(0, 2).map(([question, bonne, faux]) => ({
    consigne: 'doute',
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: 'doute-regle',
  }));

  const nouvelle = melanger(NOUVELLE).slice(0, 2).map(([question, bonne, faux, phrase]) => ({
    consigne: 'nouvelle',
    question,
    bonne,
    choix: melanger([bonne, ...faux]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map((f) => [f, phrase])),
  }));

  return melanger([...registres, ...doute, ...nouvelle]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  registre: 'Quel est le registre de cet extrait ? Demande-toi quel effet il produit sur toi.',
  doute: 'Une question sur le récit fantastique, et sur ce qui fait douter le lecteur.',
  nouvelle: 'Une question sur la nouvelle, réaliste ou fantastique.',
  'comique-ou-tragique': 'Le comique cherche à faire rire. Le tragique montre un personnage écrasé par un destin auquel il ne peut pas échapper.',
  'comique-ou-lyrique': 'Le lyrique exprime les sentiments intimes de celui qui dit « je ». Le comique, lui, cherche à faire rire.',
  'pathetique-ou-tragique': 'Le pathétique veut émouvoir, faire pitié devant une souffrance. Le tragique montre en plus un destin inévitable, une fatalité.',
  'lyrique-ou-pathetique': 'Le lyrique, c’est un « je » qui exprime ses émotions, souvent avec des exclamations. Le pathétique veut nous faire pleurer sur la souffrance d’un autre.',
  'lyrique-ou-realiste': 'Le réaliste décrit le monde tel qu’il est, avec des détails précis. Le lyrique exprime les émotions de celui qui dit « je ».',
  'fantastique-ou-merveilleux': 'Dans le merveilleux, le surnaturel est accepté sans surprise, comme dans les contes. Dans le fantastique, il inquiète et fait douter.',
  'fantastique-ou-realiste': 'Le fantastique fait entrer dans le monde ordinaire un événement qu’on ne peut expliquer, et le doute s’installe. Le réaliste reste dans le monde ordinaire.',
  'merveilleux-ou-realiste': 'Fées, dragons et magie acceptés par tous : c’est le merveilleux. Le réaliste peint le monde ordinaire, tel qu’il est.',
  'registre-regle': 'Le registre, c’est l’effet produit : rire, comique ; pitié, pathétique ; destin fatal, tragique ; émotions d’un « je », lyrique ; doute, fantastique ; monde vrai, réaliste.',
  'doute-fait': 'Ceci affirme un fait, sans hésiter. Le doute naît de mots comme « il me sembla », « je crus », « peut-être », ou d’une question sans réponse.',
  'doute-fin': 'Dans le fantastique, rien ne vient tout expliquer : le lecteur reste partagé entre une explication rationnelle et le surnaturel.',
  'doute-merveilleux': 'Une fée, une magie acceptée de tous, c’est le merveilleux des contes. Le fantastique, lui, fait douter : le surnaturel y dérange.',
  'doute-cadre': 'Le fantastique a besoin d’un monde ordinaire, vraisemblable : c’est là que l’étrange fait peur.',
  'doute-je': 'Le narrateur qui dit « je » ne sait pas tout : le lecteur hésite avec lui, sans pouvoir trancher.',
  'doute-regle': 'Le fantastique repose sur l’hésitation : un cadre ordinaire, un événement étrange, et un doute qui ne se lève pas.',
  'nouvelle-chute': 'La chute est la fin inattendue d’une nouvelle, préparée en secret, qui oblige à relire l’histoire autrement.',
  'nouvelle-incipit': 'L’incipit, ce sont les premières lignes d’un récit : elles posent le cadre et donnent envie de lire.',
  'nouvelle-maupassant': 'La Parure est une nouvelle réaliste de Guy de Maupassant, le grand auteur de nouvelles du dix-neuvième siècle.',
  'nouvelle-parure': 'Toute la chute est là : la parure perdue était fausse, et dix ans de misère n’ont servi à rien.',
  'nouvelle-horla': 'Le Horla raconte un être invisible : existe-t-il, ou le narrateur devient-il fou ? Ce doute en fait une nouvelle fantastique.',
  'nouvelle-merimee': 'La Vénus d’Ille est une nouvelle fantastique de Prosper Mérimée : une statue de bronze semble prendre vie.',
  'nouvelle-realisme': 'Le réalisme peint le monde tel qu’il est, avec ses détails vrais, même les plus ordinaires.',
  'nouvelle-detail': 'Un détail réaliste pourrait se vérifier dans la vie de tous les jours : un prix, une rue, un métier.',
  'nouvelle-balzac': 'Balzac, l’auteur de La Comédie humaine, est un maître du roman réaliste au dix-neuvième siècle.',
};
