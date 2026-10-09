/**
 * LE TRI DES SUBORDONNÉES — la phrase complexe, de la 5e à la 3e.
 * Professeur : Adrien (français).
 *
 * La subordonnée est entre crochets dans la question affichée. Phrases
 * écrites à la main, une seule réponse défendable.
 *
 * 5e — RELATIVE ET CONJONCTIVE (3 + 3 + 2) :
 *   - L'ANTÉCÉDENT (3) : pièges, le sujet de la relative (« tu » dans « le
 *     livre que tu lis ») et l'autre nom de la principale ;
 *   - RELATIVE OU CONJONCTIVE ? (3) : LE PIÈGE, « que » — pronom relatif
 *     quand il remplace un nom, conjonction quand il n'en remplace aucun ;
 *   - QUEL VERBE COMPLÈTE-T-ELLE ? (2) : la conjonctive complète le verbe de
 *     la principale, pas le sien.
 *
 * 4e — LES CIRCONSTANCIELLES ET LEUR SENS (3 + 3 + 2) :
 *   - QUEL SENS ? (3) : temps, cause, conséquence, but, condition, concession.
 *     Pièges : « comme » (cause, pas temps), « même si » (concession, pas
 *     condition), but et conséquence ;
 *   - LE BON SUBORDONNANT (3) : choisir le mot qui donne le sens demandé ;
 *   - QUELLE SUBORDONNÉE ? (2) : relative, complétive ou circonstancielle
 *     (« la maison où j'habite » : « où » relatif, pas un lieu).
 *
 * 3e — L'ANALYSE COMPLÈTE (3 + 3 + 2) :
 *   - COMBIEN DE PROPOSITIONS ? (3) : autant que de verbes conjugués. On
 *     évite les propositions infinitives et participiales, que les
 *     grammaires ne comptent pas toutes de la même façon ;
 *   - LA NATURE DE CHAQUE PROPOSITION (3) : principale, indépendante,
 *     relative, complétive, circonstancielle ;
 *   - SA FONCTION (2) : COD, complément de l'antécédent, complément
 *     circonstanciel. Les consécutives en « si… que » sont écartées ici :
 *     leur fonction se discute.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'tri-des-subordonnees', titre: 'Le tri des subordonnées', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Le tri des subordonnées',
    accroche: 'Relative ou conjonctive ?',
    competences: ['FR_5E_LANG_RELATIVE', 'FR_5E_LANG_CONJONCTIVE'],
  },
  QUATRIEME: {
    titre: 'Le tri des subordonnées',
    accroche: 'Cause, but, conséquence… à toi de trier.',
    competences: ['FR_4E_LANG_CIRCONSTANCIELLE'],
  },
  TROISIEME: {
    titre: 'Le tri des subordonnées',
    accroche: 'Analyse la phrase complexe.',
    competences: ['FR_3E_LANG_ANALYSE'],
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

// ------------------------------------------------------------------ 5e

/** [phrase, antécédent, un mot de la relative, un autre nom de la principale]. */
export const ANTECEDENTS_5E = [
  ['Mon frère a lu le livre [que tu lui as prêté].', 'livre', 'tu', 'frère'],
  ['Avec mon frère, j’ai revu la maison [où nous avons grandi].', 'maison', 'nous', 'frère'],
  ['Ma voisine a adopté le chien [dont tu m’as parlé].', 'chien', 'tu', 'voisine'],
  ['Mes parents ont visité le musée [que mon professeur avait conseillé].', 'musée', 'professeur', 'parents'],
  ['Au marché, Léa a acheté des fruits [que le marchand venait de cueillir].', 'fruits', 'marchand', 'Léa'],
  ['Le guide montre aux touristes le château [où le roi est né].', 'château', 'roi', 'touristes'],
  ['Ma sœur a retrouvé l’amie [qui lui écrivait des lettres].', 'amie', 'lettres', 'sœur'],
  ['Le maire félicite les pompiers [qui ont éteint l’incendie].', 'pompiers', 'incendie', 'maire'],
  ['Tom raconte à sa mère le film [qu’il a vu hier].', 'film', 'il', 'mère'],
  ['Le capitaine regarde l’île [vers laquelle le bateau se dirige].', 'île', 'bateau', 'capitaine'],
  ['Les enfants écoutent l’histoire [que leur grand-père raconte].', 'histoire', 'grand-père', 'enfants'],
  ['Notre entraîneur a filmé le match [que nous avons perdu].', 'match', 'nous', 'entraîneur'],
];

/** [phrase, relative ou conjonctive]. */
export const RELATIVE_CONJONCTIVE_5E = [
  ['Le gâteau [que tu as fait] est délicieux.', 'relative'],
  ['Je relis la lettre [que Léo m’a envoyée].', 'relative'],
  ['La chanson [que nous chantons] est ancienne.', 'relative'],
  ['Voici le film [que je préfère].', 'relative'],
  ['Les fleurs [que tu as cueillies] sentent bon.', 'relative'],
  ['Il a perdu la clé [qu’on lui avait confiée].', 'relative'],
  ['Le chemin [qui mène au lac] est étroit.', 'relative'],
  ['La ville [où je suis né] est au bord de la mer.', 'relative'],
  ['Je sais [que tu as fait un gâteau].', 'conjonctive'],
  ['Léo pense [que la lettre arrivera demain].', 'conjonctive'],
  ['Nous espérons [que la chanson te plaira].', 'conjonctive'],
  ['Il dit [qu’il préfère ce film].', 'conjonctive'],
  ['Je crois [que les fleurs sentent bon].', 'conjonctive'],
  ['On lui a annoncé [qu’il avait gagné].', 'conjonctive'],
  ['Elle veut [que tu viennes].', 'conjonctive'],
  ['Je doute [qu’il réussisse].', 'conjonctive'],
];
const NOM_5E = { relative: 'Subordonnée relative', conjonctive: 'Subordonnée conjonctive' };

/** [phrase, le verbe que complète la conjonctive, le verbe de la conjonctive]. */
export const VERBE_COMPLETE_5E = [
  ['Je sais [que tu as fait un gâteau].', 'sais', 'as fait'],
  ['Léo pense [que la lettre arrivera demain].', 'pense', 'arrivera'],
  ['Nous espérons [que la chanson te plaira].', 'espérons', 'plaira'],
  ['Il dit [qu’il préfère ce film].', 'dit', 'préfère'],
  ['On lui a annoncé [qu’il avait gagné].', 'a annoncé', 'avait gagné'],
  ['Elle veut [que tu viennes].', 'veut', 'viennes'],
  ['Je doute [qu’il réussisse].', 'doute', 'réussisse'],
  ['Je crois [que les fleurs sentent bon].', 'crois', 'sentent'],
];

function cinquieme({ melanger }) {
  const liste = [];
  melanger(ANTECEDENTS_5E).slice(0, 3).forEach(([phrase, bonne, dedans, autre]) => {
    liste.push(depuisBanque(melanger, 'antecedent-5e', [
      phrase, bonne, [dedans, 'antecedent-dans-relative'], [autre, 'antecedent-proche'],
    ]));
  });
  melanger(RELATIVE_CONJONCTIVE_5E).slice(0, 3).forEach(([phrase, bonne]) => {
    liste.push(classement('nature-5e', phrase, bonne, ['relative', 'conjonctive'], NOM_5E, 'nature'));
  });
  melanger(VERBE_COMPLETE_5E).slice(0, 2).forEach(([phrase, bonne, sien]) => {
    liste.push(depuisBanque(melanger, 'verbe-complete-5e', [phrase, bonne, [sien, 'verbe-de-la-subordonnee']]));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ 4e

const NOM_SENS = {
  temps: 'Temps',
  cause: 'Cause',
  consequence: 'Conséquence',
  but: 'But',
  condition: 'Condition',
  concession: 'Concession',
};

/** [phrase, sens de la circonstancielle, deux sens voisins]. */
export const SENS_4E = [
  ['Nous sommes restés à l’intérieur [parce qu’il pleuvait].', 'cause', 'consequence', 'but'],
  ['[Comme il était malade], il n’est pas venu.', 'cause', 'temps', 'consequence'],
  ['[Puisque tu insistes], je viens.', 'cause', 'condition', 'concession'],
  ['Il a tant couru [qu’il est épuisé].', 'consequence', 'cause', 'but'],
  ['Il pleuvait fort, [si bien que le match fut annulé].', 'consequence', 'cause', 'but'],
  ['Il fait si chaud [que les glaces fondent].', 'consequence', 'cause', 'but'],
  ['Parle plus fort [pour que tout le monde t’entende].', 'but', 'consequence', 'cause'],
  ['Je me lève tôt [afin que nous partions à l’heure].', 'but', 'consequence', 'temps'],
  ['[Si tu te dépêches], tu attraperas le bus.', 'condition', 'temps', 'cause'],
  ['Tu pourras sortir [à condition que tu aies fini tes devoirs].', 'condition', 'temps', 'but'],
  ['[Quand la cloche sonnera], vous sortirez.', 'temps', 'condition', 'cause'],
  ['Range ta chambre [avant que tes parents rentrent].', 'temps', 'but', 'condition'],
  ['[Pendant que tu dormais], il a neigé.', 'temps', 'cause', 'concession'],
  ['[Lorsque le soleil se couche], le ciel rougit.', 'temps', 'condition', 'cause'],
  ['[Bien qu’il soit fatigué], il continue de courir.', 'concession', 'cause', 'condition'],
  ['Elle sort [quoiqu’il fasse très froid].', 'concession', 'cause', 'consequence'],
  ['[Même s’il pleut], nous irons au stade.', 'concession', 'condition', 'temps'],
];

/** [sens demandé, phrase à compléter, bon subordonnant, deux autres]. */
export const SUBORDONNANTS_4E = [
  ['but', 'Je t’explique la règle … tu comprennes.', 'pour que', 'si bien que', 'parce que'],
  ['cause', 'Nous restons dedans … la pluie tombe.', 'parce que', 'afin que', 'bien que'],
  ['concession', '… le vent souffle, le bateau sort du port.', 'Bien que', 'Parce que', 'Pour que'],
  ['consequence', 'Il a neigé toute la nuit, … les routes sont bloquées.', 'si bien que', 'pour que', 'bien que'],
  ['condition', 'Tu progresseras … tu t’entraînes chaque jour.', 'si', 'bien que', 'pour que'],
  ['temps', 'Range tes affaires … la cloche sonne.', 'quand', 'si', 'parce que'],
  ['but', 'Il économise … il puisse partir en voyage.', 'pour qu’', 'parce qu’', 'si bien qu’'],
  ['cause', '… le temps est beau, nous mangeons dehors.', 'Comme', 'Bien que', 'Pour que'],
  ['concession', 'Le match a lieu … la pluie tombe.', 'bien que', 'parce que', 'pour que'],
  ['temps', 'Le public se tait … le rideau se lève.', 'dès que', 'bien que', 'pour que'],
];

const NOM_NATURES = {
  relative: 'Subordonnée relative',
  completive: 'Subordonnée complétive',
  circonstancielle: 'Subordonnée circonstancielle',
  principale: 'Proposition principale',
  independante: 'Proposition indépendante',
};
const SUBORDONNEES = ['relative', 'completive', 'circonstancielle'];

/** [phrase, nature de la subordonnée entre crochets]. */
export const NATURES_4E = [
  ['Le film [que j’ai vu] était drôle.', 'relative'],
  ['La maison [où j’habite] est ancienne.', 'relative'],
  ['Le chemin [qui mène au lac] est étroit.', 'relative'],
  ['Je pense [que tu as raison].', 'completive'],
  ['Elle espère [que tu viendras].', 'completive'],
  ['On dit [que la mer est froide].', 'completive'],
  ['[Quand il pleut], je lis.', 'circonstancielle'],
  ['Nous partirons [dès que le soleil se lèvera].', 'circonstancielle'],
  ['[Bien qu’il soit tard], nous restons.', 'circonstancielle'],
];

function quatrieme({ melanger }) {
  const liste = [];
  melanger(SENS_4E).slice(0, 3).forEach(([phrase, bonne, a, b]) => {
    liste.push(classement('sens-4e', phrase, bonne, melanger([bonne, a, b]), NOM_SENS, 'sens'));
  });
  melanger(SUBORDONNANTS_4E).slice(0, 3).forEach(([sens, phrase, bonne, a, b]) => {
    liste.push(depuisBanque(melanger, 'subordonnant-4e', [
      `${NOM_SENS[sens]} : ${phrase}`, bonne, [a, `sens-${sens}`], [b, `sens-${sens}`],
    ]));
  });
  melanger(NATURES_4E).slice(0, 2).forEach(([phrase, bonne]) => {
    liste.push(classement('nature-4e', phrase, bonne, SUBORDONNEES, NOM_NATURES, 'nature'));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ 3e

/** [phrase, nombre de propositions, le piège qui fait compter trop]. */
export const PROPOSITIONS_3E = [
  ['Quand il rentra, il vit que la porte était ouverte.', 3, null],
  ['Je pense que tu réussiras si tu travailles.', 3, null],
  ['Le garçon qui parle est mon frère.', 2, null],
  ['Elle chante, il danse et les enfants applaudissent.', 3, null],
  ['Bien qu’il soit tard, nous continuons le film que nous avons commencé.', 3, 'compose'],
  ['Il veut partir avant que la nuit tombe.', 2, 'infinitif'],
  ['La ville où je suis né se trouve au bord de la mer.', 2, 'compose'],
  ['Je sais que tu as menti, mais je te pardonne parce que tu regrettes.', 4, 'compose'],
  ['En rentrant, j’ai vu que tu avais rangé ta chambre.', 2, 'participe'],
  ['Comme il pleuvait, nous sommes restés à la maison et nous avons joué.', 3, 'compose'],
  ['Dis-moi ce que tu penses.', 2, null],
  ['L’homme que tu as croisé hier habite ici depuis qu’il est enfant.', 3, 'compose'],
];

/** [phrase, nature de la proposition entre crochets, deux natures voisines]. */
export const NATURES_3E = [
  ['Je pense [que tu as raison].', 'completive', 'relative', 'circonstancielle'],
  ['Elle espère [que tu viendras].', 'completive', 'relative', 'circonstancielle'],
  ['On lui a annoncé [qu’il avait gagné].', 'completive', 'relative', 'principale'],
  ['Le film [que j’ai vu] était drôle.', 'relative', 'completive', 'circonstancielle'],
  ['La maison [où j’habite] est ancienne.', 'relative', 'circonstancielle', 'completive'],
  ['L’histoire [que je te raconte] est vraie.', 'relative', 'completive', 'principale'],
  ['Le garçon [dont je t’ai parlé] arrive.', 'relative', 'completive', 'circonstancielle'],
  ['[Quand il pleut], je lis.', 'circonstancielle', 'relative', 'completive'],
  ['[Si tu veux], nous partirons.', 'circonstancielle', 'completive', 'independante'],
  ['Nous partirons [dès que le soleil se lèvera].', 'circonstancielle', 'relative', 'completive'],
  ['Il ne vient pas [parce qu’il est malade].', 'circonstancielle', 'completive', 'relative'],
  ['[Je lis] quand il pleut.', 'principale', 'circonstancielle', 'independante'],
  ['[Il pense] que tu mens.', 'principale', 'independante', 'completive'],
  ['[Le vent souffle], la pluie tombe.', 'independante', 'principale', 'circonstancielle'],
  ['[Elle rit] et il pleure.', 'independante', 'principale', 'relative'],
];

const FONCTION_DE = { completive: 'cod', relative: 'cdn', circonstancielle: 'cc' };
const NOM_FONCTIONS = { cod: 'COD du verbe', cdn: 'Complément de l’antécédent', cc: 'Complément circonstanciel' };

function troisieme({ melanger }) {
  const liste = [];
  melanger(PROPOSITIONS_3E).slice(0, 3).forEach(([phrase, n, piege]) => {
    const nombres = [n - 1, n, n + 1];
    const pieges = {};
    nombres.filter((k) => k !== n).forEach((k) => {
      pieges[String(k)] = k > n ? (piege ? `propositions-${piege}` : 'propositions-surplus') : 'propositions-oubli';
    });
    liste.push({
      consigne: 'propositions-3e',
      question: phrase,
      bonne: String(n),
      choix: nombres.map((k) => ({ cle: String(k), libelle: String(k) })),
      pieges,
    });
  });
  const natures = melanger(NATURES_3E);
  natures.slice(0, 3).forEach(([phrase, bonne, a, b]) => {
    liste.push(classement('nature-3e', phrase, bonne, melanger([bonne, a, b]), NOM_NATURES, 'nature'));
  });
  // La fonction : sur d'autres subordonnées que celles dont on vient de demander la nature.
  natures.slice(3).filter(([, nature]) => FONCTION_DE[nature]).slice(0, 2).forEach(([phrase, nature]) => {
    liste.push(classement('fonction-3e', phrase, FONCTION_DE[nature], ['cod', 'cdn', 'cc'], NOM_FONCTIONS, 'fonction'));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ le jeu

const PAR_NIVEAU = { CINQUIEME: cinquieme, QUATRIEME: quatrieme, TROISIEME: troisieme };

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
  // 5e
  'antecedent-5e': 'Quel est l’antécédent du pronom relatif ?',
  'antecedent-5e-regle': 'L’antécédent est le nom que le pronom relatif remplace : il est placé juste avant lui.',
  'antecedent-dans-relative': 'Ce mot appartient à la relative. L’antécédent est en dehors, juste avant le pronom relatif : c’est le nom qu’il remplace.',
  'antecedent-proche': 'L’antécédent se place juste avant le pronom relatif : c’est le nom que ce pronom remplace.',
  'nature-5e': 'Cette subordonnée est-elle relative, ou conjonctive ?',
  'nature-5e-regle': 'Demande-toi si le mot qui l’introduit remplace un nom placé juste avant.',
  'nature-relative': 'La subordonnée complète un nom, son antécédent, et le pronom relatif remplace ce nom : c’est une relative.',
  'nature-conjonctive': 'La subordonnée complète le verbe, comme un COD, et « que » ne remplace aucun nom : c’est une conjonctive.',
  'verbe-complete-5e': 'Quel verbe la subordonnée conjonctive complète-t-elle ?',
  'verbe-complete-5e-regle': 'La conjonctive est le COD du verbe de la principale : pose la question « quoi ? » après ce verbe.',
  'verbe-de-la-subordonnee': 'Ce verbe est dans la subordonnée. La conjonctive complète le verbe de la principale, celui qui est hors des crochets.',

  // 4e
  'sens-4e': 'Quel est le sens de cette subordonnée circonstancielle ?',
  'sens-4e-regle': 'Regarde le mot qui introduit la subordonnée, puis demande-toi : quand ? pourquoi ? dans quel but ? à quelle condition ?',
  'sens-temps': 'La subordonnée situe l’action dans le temps : quand, lorsque, dès que, avant que, pendant que. C’est le temps.',
  'sens-cause': 'La subordonnée donne la raison : parce que, puisque, comme. C’est la cause.',
  'sens-consequence': 'La subordonnée donne le résultat : si bien que, si… que, tant… que. C’est la conséquence.',
  'sens-but': 'La subordonnée dit l’objectif, ce qu’on veut obtenir, au subjonctif : pour que, afin que. C’est le but.',
  'sens-condition': 'La subordonnée pose une condition : si, à condition que. C’est la condition.',
  'sens-concession': 'La subordonnée dit un obstacle qui n’empêche pas l’action : bien que, quoique, même si. C’est la concession.',
  'subordonnant-4e': 'Choisis le mot qui donne à la subordonnée le sens demandé.',
  'subordonnant-4e-regle': 'Chaque subordonnant a son sens : relis le sens demandé, puis cherche le mot qui l’exprime.',
  'nature-4e': 'Quelle est la nature de cette subordonnée ?',
  'nature-4e-regle': 'Demande-toi ce que complète la subordonnée : un nom, le verbe, ou toute la phrase.',
  'nature-completive': 'La subordonnée complète le verbe, comme un COD, et « que » ne remplace aucun nom : c’est une complétive, une conjonctive complément du verbe.',
  'nature-circonstancielle': 'La subordonnée dit quand, pourquoi, à quelle condition. Elle complète toute la phrase et peut souvent se déplacer : c’est une circonstancielle.',

  // 3e
  'propositions-3e': 'Combien de propositions compte cette phrase ?',
  'propositions-3e-regle': 'Une proposition, c’est un verbe conjugué avec son sujet : compte les verbes conjugués, et tu as le nombre de propositions.',
  'propositions-oubli': 'Compte chaque verbe conjugué, sans oublier ceux des subordonnées : chacun forme une proposition.',
  'propositions-surplus': 'Ne compte que les verbes conjugués : un nom ou un adjectif ne forme pas de proposition.',
  'propositions-compose': 'Un temps composé, c’est un seul verbe : l’auxiliaire et le participe forment une seule proposition.',
  'propositions-infinitif': 'Ici, l’infinitif n’a pas de sujet à lui : il ne forme pas une proposition.',
  'propositions-participe': 'Ici, le participe n’a pas de sujet à lui : il ne forme pas une proposition.',
  'nature-3e': 'Quelle est la nature de la proposition entre crochets ?',
  'nature-3e-regle': 'Demande-toi si la proposition dépend d’une autre, si une autre dépend d’elle, ou ni l’un ni l’autre.',
  'nature-principale': 'Une subordonnée dépend de cette proposition : c’est la principale.',
  'nature-independante': 'Cette proposition ne dépend d’aucune autre, et aucune ne dépend d’elle : elle est indépendante.',
  'fonction-3e': 'Quelle est la fonction de la subordonnée entre crochets ?',
  'fonction-3e-regle': 'Demande-toi ce que la subordonnée complète : le verbe, un nom, ou toute la phrase.',
  'fonction-cod': 'La complétive répond à la question « quoi ? » après le verbe : elle est COD.',
  'fonction-cdn': 'La relative complète un nom, son antécédent, comme le ferait un adjectif : elle est complément de l’antécédent.',
  'fonction-cc': 'La circonstancielle dit quand, pourquoi, à quelle condition : elle est complément circonstanciel, et peut se déplacer.',
};
