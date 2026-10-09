/**
 * LE VOCABULAIRE DE L'ANALYSE — le français de 2de (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_2DE_LECT_ROMAN    — « Analyser un roman du XVIIIe au XXIe siècle et son
 *                           personnage »
 *   FR_2DE_LECT_PROCEDES — « Nommer un procédé d'écriture et dire l'effet qu'il
 *                           produit »
 *   FR_2DE_LANG_LEXIQUE  — « Analyser un mot par son étymologie et son
 *                           évolution »
 *
 * SIX SORTES DE MANCHES (2 + 1 + 1 + 1 + 2 + 1) :
 *   - LA FOCALISATION (2) : interne, externe ou zéro, sur un extrait écrit
 *     pour le jeu. LES PIÈGES : le récit à la troisième personne cru
 *     externe alors qu'on entre dans une tête ; le narrateur omniscient
 *     pris pour une focalisation interne parce qu'il dit des pensées ;
 *   - L'ÉNONCIATION (1) : énoncé ancré dans la situation (discours) ou coupé
 *     (récit) ;
 *   - LE REPÈRE (1) : quel mot renvoie à la situation d'énonciation ? LE
 *     PIÈGE : « la veille », « le lendemain », « ce jour-là », qui renvoient
 *     au récit, pris pour « hier », « demain », « aujourd'hui » ;
 *   - LA MODALISATION (1) : certitude, doute ou jugement de valeur. LE
 *     PIÈGE : « sans doute », qui exprime une probabilité, pas une
 *     certitude ;
 *   - LE LEXIQUE (2) : champ lexical, connotation et dénotation, polysémie
 *     et homonymie, sens propre et sens figuré, mot péjoratif ;
 *   - L'ÉTYMOLOGIE (1) : des racines grecques et latines sûres.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'vocabulaire-analyse', titre: 'Le vocabulaire de l’analyse', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Le vocabulaire de l’analyse',
    accroche: 'Focalisation, énonciation, connotation.',
    competences: ['FR_2DE_LECT_ROMAN', 'FR_2DE_LECT_PROCEDES', 'FR_2DE_LANG_LEXIQUE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const paire = (a, b) => [a, b].sort().join('-ou-');

export const FOCALISATIONS = {
  interne: 'Interne',
  externe: 'Externe',
  zero: 'Zéro (narrateur omniscient)',
};

/** [extrait écrit pour le jeu, focalisation]. */
export const RECITS = [
  ['Pendant que Paul rêvait de gloire, sa mère, à l’autre bout de la ville, priait pour lui ; aucun des deux ne savait que le destin allait les réunir le soir même.', 'zero'],
  ['Marie souriait, mais au fond d’elle-même elle tremblait ; quant à Pierre, il ignorait tout de sa peur et ne pensait qu’à son examen.', 'zero'],
  ['Le vieux Martin ne le savait pas encore, mais il vivait là son dernier hiver.', 'zero'],
  ['Paul regardait la porte. Elle allait entrer, il en était sûr ; son cœur battait si fort qu’il crut qu’on l’entendait. Pourquoi tardait-elle ?', 'interne'],
  ['De sa fenêtre, Emma voyait la route vide. Il ne viendrait pas, elle le sentait ; cette attente lui devenait insupportable.', 'interne'],
  ['Le garçon leva les yeux : la salle lui parut immense, et tous ces visages inconnus semblaient le juger.', 'interne'],
  ['Un homme entra, posa son chapeau sur la table et s’assit sans un mot. Il alluma une cigarette. Personne ne bougea.', 'externe'],
  ['La femme marchait vite. Elle s’arrêta devant la vitrine, regarda sa montre, puis repartit.', 'externe'],
  ['Deux hommes descendirent du train. Le plus grand portait une valise noire ; l’autre jetait des coups d’œil vers la sortie.', 'externe'],
];

export const ANCRAGES = { ancre: 'Ancré dans la situation (discours)', coupe: 'Coupé de la situation (récit)' };

/** [énoncé, ancrage]. */
export const ENONCES = [
  ['Je t’attends ici depuis ce matin, et tu n’es toujours pas venu.', 'ancre'],
  ['Demain, nous visiterons le musée que tu m’as conseillé.', 'ancre'],
  ['Hier, j’ai croisé ton frère devant la gare.', 'ancre'],
  ['Vous lisez ces lignes, et vous vous demandez sans doute où je veux en venir.', 'ancre'],
  ['Maintenant, écoute-moi bien : je ne le répéterai pas.', 'ancre'],
  ['Il partit le lendemain et ne revint jamais au village.', 'coupe'],
  ['Ce jour-là, la reine reçut les ambassadeurs dans la grande salle.', 'coupe'],
  ['Napoléon mourut à Sainte-Hélène en 1821.', 'coupe'],
  ['La veille, les soldats avaient traversé le fleuve.', 'coupe'],
  ['Le marchand ouvrit sa boutique, salua ses voisins et attendit les clients.', 'coupe'],
];

/** [le mot qui renvoie à la situation d'énonciation, [deux mots qui n'y renvoient pas], phrase de l'erreur]. */
export const REPERES = [
  ['demain', ['le lendemain', 'ce jour-là'], 'repere-temps'],
  ['hier', ['la veille', 'à cette époque'], 'repere-temps'],
  ['aujourd’hui', ['ce jour-là', 'à cette date'], 'repere-temps'],
  ['maintenant', ['alors', 'à ce moment-là'], 'repere-temps'],
  ['la semaine prochaine', ['la semaine suivante', 'cette semaine-là'], 'repere-temps'],
  ['l’an dernier', ['l’année précédente', 'cette année-là'], 'repere-temps'],
  ['je', ['il', 'elle'], 'repere-personne'],
  ['tu', ['il', 'ils'], 'repere-personne'],
  ['nous', ['ils', 'elles'], 'repere-personne'],
];

export const MODALITES = { certitude: 'Une certitude', doute: 'Un doute', jugement: 'Un jugement de valeur' };

/** [phrase écrite pour le jeu, ce qu'exprime celui qui parle]. */
export const MODALISATIONS = [
  ['Il viendra certainement.', 'certitude'],
  ['Il est évident que tu as raison.', 'certitude'],
  ['Il réussira sans aucun doute.', 'certitude'],
  ['Il est certain que la crise durera.', 'certitude'],
  ['Sans doute viendra-t-il demain.', 'doute'],
  ['Il est peut-être malade.', 'doute'],
  ['Le ministre serait sur le départ.', 'doute'],
  ['Il semble que la situation s’améliore.', 'doute'],
  ['Il est probable que le match sera reporté.', 'doute'],
  ['Heureusement, personne n’a été blessé.', 'jugement'],
  ['Ce film est hélas bien trop long.', 'jugement'],
  ['Ce discours magnifique a ému toute la salle.', 'jugement'],
  ['Cette décision est scandaleuse.', 'jugement'],
];

const POLYSEMIQUE = 'Un mot polysémique';
const HOMONYMES = 'Des homonymes';
const SYNONYMES = 'Des synonymes';

/** [question, bonne réponse, [[choix à écarter, phrase de l'erreur], …]]. */
export const LEXIQUE = [
  ['« vagues, écume, marée, houle » : de quoi ces mots forment-ils le champ lexical ?', 'La mer', [['La montagne', 'lexique-champ'], ['La ville', 'lexique-champ']]],
  ['« trembler, frisson, angoisse, effroi » : de quoi ces mots forment-ils le champ lexical ?', 'La peur', [['Le froid', 'lexique-champ'], ['La colère', 'lexique-champ']]],
  ['« assaut, bataille, soldats, canons » : de quoi ces mots forment-ils le champ lexical ?', 'La guerre', [['Le sport', 'lexique-champ'], ['La fête', 'lexique-champ']]],
  ['« vagues, écume, marée, houle » : ces mots forment…', 'Un champ lexical', [['Une famille de mots', 'lexique-famille'], [SYNONYMES, 'lexique-famille']]],
  ['« Cette maison est une prison » : que connote ici le mot « prison » ?', 'L’enfermement, l’oppression', [['Un bâtiment pénitentiaire', 'lexique-denotation'], ['La sécurité', 'lexique-connotation']]],
  ['« Une colombe s’est posée sur la ville en ruines » : que connote la colombe ?', 'La paix', [['Un oiseau blanc', 'lexique-denotation'], ['La guerre', 'lexique-connotation']]],
  ['Le sens premier et objectif d’un mot, celui du dictionnaire, s’appelle…', 'La dénotation', [['La connotation', 'lexique-denotation-definition'], ['La polysémie', 'lexique-denotation-definition']]],
  ['« feuille » : d’arbre, de papier, de métal. Ce mot est…', POLYSEMIQUE, [[HOMONYMES, 'lexique-polysemie'], [SYNONYMES, 'lexique-polysemie']]],
  ['« opération » : chirurgicale, militaire, de calcul. Ce mot est…', POLYSEMIQUE, [[HOMONYMES, 'lexique-polysemie'], [SYNONYMES, 'lexique-polysemie']]],
  ['« bureau » : le meuble, la pièce, le service. Ce mot est…', POLYSEMIQUE, [[HOMONYMES, 'lexique-polysemie'], [SYNONYMES, 'lexique-polysemie']]],
  ['« ver », « vert » et « verre » sont…', HOMONYMES, [[POLYSEMIQUE, 'lexique-homonymes'], [SYNONYMES, 'lexique-homonymes']]],
  ['« Il a un cœur de pierre » : « pierre » est employé au sens…', 'Figuré', [['Propre', 'lexique-figure']]],
  ['« Un accueil glacial » : « glacial » est employé au sens…', 'Figuré', [['Propre', 'lexique-figure']]],
  ['« Un vent glacial » : « glacial » est employé au sens…', 'Propre', [['Figuré', 'lexique-propre']]],
  ['Pour parler d’une habitation, lequel de ces mots est péjoratif ?', 'Une bicoque', [['Une maison', 'lexique-pejoratif'], ['Une demeure', 'lexique-pejoratif']]],
  ['Pour parler de celui qui écrit, lequel de ces mots est péjoratif ?', 'Un écrivaillon', [['Un écrivain', 'lexique-pejoratif'], ['Un auteur', 'lexique-pejoratif']]],
  ['Pour parler de celui qui conduit, lequel de ces mots est péjoratif ?', 'Un chauffard', [['Un conducteur', 'lexique-pejoratif'], ['Un automobiliste', 'lexique-pejoratif']]],
];

/** [question, bonne réponse, [deux choix à écarter]]. */
export const ETYMOLOGIES = [
  ['« démocratie » : du grec dêmos, le peuple, et kratos…', 'Le pouvoir', ['La loi', 'La cité']],
  ['« philosophie » : du grec philos, qui aime, et sophia…', 'La sagesse', ['La parole', 'La vérité']],
  ['« géographie » : du grec gê, la terre, et graphein…', 'Écrire, décrire', ['Mesurer', 'Parcourir']],
  ['« chronologie » : du grec chronos…', 'Le temps', ['L’ordre', 'L’histoire']],
  ['« hippodrome » : du grec hippos…', 'Le cheval', ['La course', 'Le stade']],
  ['« aquatique » : du latin aqua…', 'L’eau', ['La mer', 'Le poisson']],
  ['« bibliothèque » : du grec biblion…', 'Le livre', ['Le savoir', 'La salle']],
  ['« anthropologie » : du grec anthrôpos…', 'L’être humain', ['Le savant', 'Le peuple']],
  ['« orthographe » : du grec orthos…', 'Droit, correct', ['Écrit', 'Ancien']],
];

const libres = (melanger, bonne, faux) => melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c }));

/** Une manche à classer parmi toutes les catégories : chaque erreur a sa paire. */
function classer(melanger, consigne, question, bonne, noms) {
  const autres = Object.keys(noms).filter((k) => k !== bonne);
  return {
    consigne,
    question,
    bonne,
    choix: melanger(Object.keys(noms)).map((cle) => ({ cle, libelle: noms[cle] })),
    pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
    aide: `${consigne}-regle`,
  };
}

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);

  const focalisations = melanger(RECITS).slice(0, 2)
    .map(([extrait, f]) => classer(melanger, 'focalisation', `« ${extrait} »`, f, FOCALISATIONS));

  const enonciations = melanger(ENONCES).slice(0, 1).map(([enonce, a]) => ({
    consigne: 'enonciation',
    question: `« ${enonce} »`,
    bonne: a,
    choix: Object.entries(ANCRAGES).map(([cle, libelle]) => ({ cle, libelle })),
    pieges: { [a === 'ancre' ? 'coupe' : 'ancre']: `enonciation-${a}` },
    aide: 'enonciation-regle',
  }));

  const reperes = melanger(REPERES).slice(0, 1).map(([bonne, faux, erreur]) => ({
    consigne: 'repere',
    question: 'Lequel de ces mots renvoie à la situation d’énonciation ?',
    bonne,
    choix: libres(melanger, bonne, faux.map((f) => [f])),
    pieges: Object.fromEntries(faux.map((f) => [f, erreur])),
    aide: 'repere-regle',
  }));

  const modalisations = melanger(MODALISATIONS).slice(0, 1)
    .map(([phrase, m]) => classer(melanger, 'modalisation', `« ${phrase} »`, m, MODALITES));

  const lexique = melanger(LEXIQUE).slice(0, 2).map(([question, bonne, faux]) => ({
    consigne: 'lexique',
    question,
    bonne,
    choix: libres(melanger, bonne, faux),
    pieges: Object.fromEntries(faux),
    aide: 'lexique-regle',
  }));

  const etymologies = melanger(ETYMOLOGIES).slice(0, 1).map(([question, bonne, faux]) => ({
    consigne: 'etymologie',
    question,
    bonne,
    choix: libres(melanger, bonne, faux.map((f) => [f])),
    pieges: Object.fromEntries(faux.map((f) => [f, 'etymologie-racine'])),
    aide: 'etymologie-regle',
  }));

  return melanger([...focalisations, ...enonciations, ...reperes, ...modalisations, ...lexique, ...etymologies]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  focalisation: 'Par les yeux de qui voit-on la scène ? Quelle est la focalisation ?',
  enonciation: 'Cet énoncé est-il ancré dans la situation où l’on parle, ou coupé d’elle ?',
  repere: 'Lequel de ces mots renvoie à la situation d’énonciation ?',
  modalisation: 'Qu’exprime celui qui parle : une certitude, un doute, ou un jugement ?',
  lexique: 'Une question sur le sens des mots.',
  etymologie: 'Que veut dire cette racine ?',

  'externe-ou-interne': 'En focalisation interne, on entre dans la tête d’un seul personnage : ce qu’il voit, sent, pense. En focalisation externe, on ne voit que les gestes, comme une caméra, sans jamais entrer dans une tête.',
  'externe-ou-zero': 'Le narrateur omniscient sait tout : les pensées de plusieurs personnages, le passé, l’avenir. En focalisation externe, il ne sait rien de plus qu’un témoin qui regarde.',
  'interne-ou-zero': 'Le piège classique : dire des pensées ne suffit pas. Si l’on entre dans plusieurs têtes, ou si le narrateur annonce l’avenir, c’est la focalisation zéro. Si l’on reste dans une seule tête, c’est la focalisation interne.',

  'enonciation-ancre': 'Des mots renvoient à la situation où l’on parle : je, tu, ici, hier, demain, le présent, le passé composé. L’énoncé est ancré, c’est un discours.',
  'enonciation-coupe': 'Aucun mot ne renvoie à celui qui parle : troisième personne, passé simple, repères comme « ce jour-là » ou « la veille ». L’énoncé est coupé de la situation, c’est un récit.',

  'repere-temps': '« La veille », « le lendemain », « ce jour-là » se repèrent par rapport au récit. « Hier », « demain », « aujourd’hui » se repèrent par rapport au moment où l’on parle : eux seuls renvoient à la situation d’énonciation.',
  'repere-personne': '« Je », « tu », « nous » désignent ceux qui parlent et à qui l’on parle. « Il » et « elle » désignent quelqu’un hors de l’échange : ils ne renvoient pas à la situation d’énonciation.',

  'certitude-ou-doute': 'Attention à « sans doute » : il exprime une probabilité, pas une certitude. « Certainement », « il est évident que », « sans aucun doute » marquent la certitude ; « peut-être », « il semble », le conditionnel marquent le doute.',
  'certitude-ou-jugement': 'Le jugement de valeur dit ce que celui qui parle pense de bon ou de mauvais : heureusement, hélas, magnifique, scandaleux. La certitude dit seulement qu’il est sûr de ce qu’il affirme.',
  'doute-ou-jugement': 'Le doute porte sur la vérité du fait : peut-être, sans doute, il semble. Le jugement porte sur sa valeur : heureusement, hélas, magnifique.',

  'lexique-champ': 'Un champ lexical réunit des mots qui renvoient tous au même thème : cherche le thème que tous les mots partagent, pas seulement un ou deux.',
  'lexique-famille': 'Une famille de mots partage le même radical, comme terre, terrain, enterrer. Ici, les mots n’ont pas de radical commun : ils partagent un thème, c’est un champ lexical.',
  'lexique-denotation': 'C’est le sens premier, celui du dictionnaire : la dénotation. On demande la connotation, ce que le mot suggère en plus dans ce contexte.',
  'lexique-connotation': 'La connotation, c’est ce que le mot suggère dans ce contexte : relis la phrase et demande-toi quelle idée ou quelle émotion le mot ajoute.',
  'lexique-denotation-definition': 'Le sens premier et objectif, c’est la dénotation. La connotation, ce sont les sens que le mot suggère en plus ; la polysémie, le fait qu’un mot ait plusieurs sens.',
  'lexique-polysemie': 'Un seul mot, plusieurs sens liés entre eux : il est polysémique. Les homonymes sont des mots différents qui se prononcent de la même façon, comme ver, vert et verre.',
  'lexique-homonymes': 'Ver, vert et verre sont trois mots différents, d’origines et de sens différents, qui se prononcent pareil : ce sont des homonymes. Un mot polysémique est un seul mot aux sens liés.',
  'lexique-figure': 'Un cœur n’est pas fait de pierre, un accueil n’a pas de température : le mot est détourné de son sens premier, il est employé au sens figuré.',
  'lexique-propre': 'Le vent est vraiment très froid : le mot garde son sens premier, il est employé au sens propre.',
  'lexique-pejoratif': 'Un mot péjoratif ajoute une idée de mépris ou de dévalorisation : bicoque, écrivaillon, chauffard. Les autres sont neutres ou valorisants.',

  'etymologie-racine': 'Pense à un autre mot construit sur la même racine pour en retrouver le sens : chronomètre pour le temps, hippopotame pour le cheval, bibliographie pour le livre.',

  'focalisation-regle': 'Demande-toi ce que sait le narrateur : tout, et plusieurs têtes, c’est zéro ; une seule tête, c’est interne ; rien que l’extérieur, c’est externe.',
  'enonciation-regle': 'Cherche les marques de celui qui parle : je, tu, ici, maintenant, hier, demain. S’il y en a, l’énoncé est ancré ; sinon, il est coupé.',
  'repere-regle': 'Un repère d’énonciation se comprend seulement si l’on sait qui parle, où et quand : je, tu, ici, hier, demain.',
  'modalisation-regle': 'Repère les mots qui montrent l’attitude de celui qui parle : adverbes, verbes comme sembler, conditionnel, adjectifs qui jugent.',
  'lexique-regle': 'Revois les notions : champ lexical, famille de mots, dénotation et connotation, polysémie et homonymie, sens propre et sens figuré.',
  'etymologie-regle': 'Décompose le mot en racines grecques ou latines : chacune garde son sens dans les mots d’aujourd’hui.',
};
