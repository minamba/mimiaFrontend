/**
 * LA QUESTION DE GRAMMAIRE — l'oral du bac de français, en 1re.
 * Professeur : Adrien (français).
 *
 * Les points exacts du programme, analysés avec la terminologie grammaticale
 * officielle (2020). Phrases écrites à la main, une seule réponse défendable ;
 * les cas que les grammaires discutent sont écartés (« ce que » après
 * « savoir », « douter que », « si » interrogatif rangé parmi les classes,
 * « de sorte que » sans mode net, « guère », « quel » attribut…).
 *
 * 1re GÉNÉRALE (2 + 1 + 1, puis 2 tirées parmi 4, puis 1 + 1) :
 *   - LA NATURE DE LA SUBORDONNÉE (2) : relative, complétive,
 *     circonstancielle, interrogative indirecte. LES PIÈGES : « si »
 *     interrogatif pris pour une condition, « où » relatif pris pour un lieu,
 *     « l'idée que tu partes » (complétive) prise pour une relative ;
 *   - SA FONCTION (1) : sujet, attribut, COD, complément du nom, de
 *     l'adjectif, de l'antécédent, circonstanciel. LE PIÈGE : donner à la
 *     relative la fonction de son pronom relatif ;
 *   - LA CLASSE DE « QUE » (1) : pronom relatif, conjonction, pronom
 *     interrogatif ;
 *   - L'INTERROGATION (2 parmi 4) : directe ou indirecte, totale ou
 *     partielle ; ses marques (inversion simple ou complexe, « est-ce que »,
 *     intonation) ; la classe du mot interrogatif ; la question rapportée ;
 *   - LA NÉGATION (1 + 1) : totale, partielle — et ce qui n'en est pas :
 *     « ne… que » restrictif, « ne » explétif ; puis son moyen : phrase
 *     négative, préfixe, mot de sens négatif.
 *
 * 1re TECHNOLOGIQUE (2 + 1, 1 + 1 + 1, 1 + 1) :
 *   - LE RAPPORT LOGIQUE (2) : cause, conséquence, but, condition,
 *     concession. LES PIÈGES : « si bien que » n'est pas un but, « même si »
 *     n'est pas une condition, « de sorte que » change de sens avec le mode,
 *     « si riche qu'il soit » est une concession ;
 *   - LE MODE (1) : « bien que » + subjonctif, « même si » + indicatif,
 *     jamais de conditionnel ni de futur après le « si » de condition ;
 *   - L'INTERROGATION (1 + 1 + 1) : directe ou indirecte, totale ou
 *     partielle ; la question rapportée ; ce que fait vraiment la question
 *     (information, requête polie, question rhétorique) ;
 *   - LA NÉGATION (1 + 1) : totale, partielle, restriction, « ne » explétif ;
 *     puis la phrase négative, le préfixe ou l'antonyme.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'question-de-grammaire', titre: 'La question de grammaire', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'La question de grammaire',
    accroche: 'Subordination, interrogation, négation.',
    competences: ['FR_1RE_METH_GRAMMAIRE', 'FR_1RE_LANG_SUBORDINATION', 'FR_1RE_LANG_INTERROGATION', 'FR_1RE_LANG_NEGATION'],
  },
  PREMIERE_TECHNO: {
    titre: 'La question de grammaire',
    accroche: 'Cause, but, concession, et la négation.',
    competences: [
      'FR_1TEC_METH_GRAMMAIRE', 'FR_1TEC_LANG_CIRCONSTANCIELLES', 'FR_1TEC_LANG_INTERROGATION', 'FR_1TEC_LANG_NEGATION',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Une manche à réponses libres : [libellé faux, piège]. */
function libre(melanger, consigne, question, bonne, faux) {
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: `${consigne}-regle`,
  };
}

/** Une manche à étiquettes fixes ; chaque mauvaise étiquette a sa phrase. */
function etiquettes(consigne, question, bonne, cles, libelles, piegeDe) {
  return {
    consigne,
    question,
    bonne,
    choix: cles.map((c) => ({ cle: c, libelle: libelles[c] })),
    pieges: Object.fromEntries(cles.filter((c) => c !== bonne).map((c) => [c, piegeDe(c)])),
    aide: `${consigne}-regle`,
  };
}

// ------------------------------------------------------------ la subordination

export const NATURES = {
  relative: 'Relative',
  completive: 'Complétive',
  circonstancielle: 'Circonstancielle',
  interrogative: 'Interrogative indirecte',
};

/** [phrase, nature de la subordonnée entre crochets, pièges propres à une confusion]. */
export const NATURES_1RE = [
  ['Le roman [que tu m’as prêté] m’a passionné.', 'relative', { completive: 'que-relatif' }],
  ['La ville [où il est né] a beaucoup changé.', 'relative', { circonstancielle: 'ou-relatif', interrogative: 'ou-relatif' }],
  ['Le personnage [dont tout le monde parle] meurt à la fin.', 'relative', {}],
  ['Les lecteurs [qui ont aimé ce livre] attendent la suite.', 'relative', {}],
  ['La lettre [qu’Emma attendait] n’arriva jamais.', 'relative', { completive: 'que-relatif' }],
  ['Le poète affirme [que la beauté est éternelle].', 'completive', {}],
  ['Je crains [qu’il ne soit trop tard].', 'completive', {}],
  ['L’idée [que le héros puisse échouer] inquiète le lecteur.', 'completive', { relative: 'que-conjonction-nom' }],
  ['La nouvelle [que la guerre était finie] se répandit.', 'completive', { relative: 'que-conjonction-nom' }],
  ['Il annonce [qu’il quittera la ville].', 'completive', {}],
  ['Le narrateur se demande [si son ami reviendra].', 'interrogative', { circonstancielle: 'si-interrogatif' }],
  ['Personne ne sait [pourquoi le héros a fui].', 'interrogative', { circonstancielle: 'interrogatif-sans-antecedent' }],
  ['Elle demande [qui a écrit cette lettre].', 'interrogative', { relative: 'interrogatif-sans-antecedent' }],
  ['J’ignore [quand la représentation commencera].', 'interrogative', { circonstancielle: 'interrogatif-sans-antecedent' }],
  ['Le héros se demande [où il a caché la lettre].', 'interrogative', {
    relative: 'interrogatif-sans-antecedent', circonstancielle: 'interrogatif-sans-antecedent',
  }],
  ['[Si tu relis ce poème], tu en verras la beauté.', 'circonstancielle', { interrogative: 'si-condition' }],
  ['Il écrivit toute la nuit [parce que l’éditeur attendait].', 'circonstancielle', {}],
  ['[Bien que la critique l’ait éreinté], le roman connut un grand succès.', 'circonstancielle', {}],
  ['[Quand le rideau se lève], la scène est vide.', 'circonstancielle', {}],
  ['Le public applaudit [dès que l’acteur paraît].', 'circonstancielle', {}],
];

export const FONCTIONS = {
  sujet: 'Sujet du verbe',
  attribut: 'Attribut du sujet',
  cod: 'Complément d’objet direct',
  cdn: 'Complément du nom',
  cadj: 'Complément de l’adjectif',
  cant: 'Complément de l’antécédent',
  cc: 'Complément circonstanciel',
};

/**
 * [phrase, fonction de la subordonnée entre crochets, deux autres fonctions
 * avec leur piège (null : la règle de la bonne)]. « Complément du nom » n'est
 * jamais proposé à côté de « complément de l'antécédent » quand la
 * subordonnée est une relative : les deux désigneraient la même chose.
 */
export const FONCTIONS_1RE = [
  ['[Qu’il ait menti] ne fait aucun doute.', 'sujet', [['cod', null], ['cc', null]]],
  ['[Que tu viennes] me ferait plaisir.', 'sujet', [['cod', null], ['cc', null]]],
  ['L’essentiel est [que tu sois honnête].', 'attribut', [['cod', 'attribut-pas-cod'], ['sujet', null]]],
  ['Mon seul souhait est [que tu réussisses].', 'attribut', [['cod', 'attribut-pas-cod'], ['cdn', null]]],
  ['L’idée [qu’il puisse partir] m’attriste.', 'cdn', [['cant', 'que-conjonction-nom'], ['cod', null]]],
  ['La crainte [que le navire ne coule] gagne l’équipage.', 'cdn', [['cant', 'que-conjonction-nom'], ['sujet', null]]],
  ['Le roi est heureux [que son fils soit revenu].', 'cadj', [['cod', 'cadj-pas-cod'], ['cc', null]]],
  ['Elle est sûre [qu’il reviendra].', 'cadj', [['cod', 'cadj-pas-cod'], ['cc', null]]],
  ['Le poète affirme [que la beauté est éternelle].', 'cod', [['sujet', null], ['cdn', null]]],
  ['Le narrateur se demande [si son ami reviendra].', 'cod', [['cc', 'interrogative-cod'], ['sujet', null]]],
  ['J’ignore [quand la représentation commencera].', 'cod', [['cc', 'interrogative-cod'], ['sujet', null]]],
  ['Il annonce [qu’il quittera la ville].', 'cod', [['cdn', null], ['cc', null]]],
  ['Le roman [que tu m’as prêté] m’a passionné.', 'cant', [['cod', 'fonction-du-relatif'], ['cc', null]]],
  ['Les lecteurs [qui ont aimé ce livre] attendent la suite.', 'cant', [['sujet', 'fonction-du-relatif'], ['cc', null]]],
  ['La maison [où elle est née] a été vendue.', 'cant', [['cc', 'ou-relatif'], ['cod', null]]],
  ['[Quand le rideau se lève], la scène est vide.', 'cc', [['sujet', null], ['cod', null]]],
  ['Il écrivit toute la nuit [parce que l’éditeur attendait].', 'cc', [['cod', null], ['cdn', null]]],
];

export const CLASSES_QUE = {
  relatif: 'Pronom relatif',
  conjonction: 'Conjonction de subordination',
  interrogatif: 'Pronom interrogatif',
};

/** [phrase où « que » n'apparaît qu'une fois, sa classe]. */
export const QUE_1RE = [
  ['Le roman qu’il écrit parle de la guerre.', 'relatif'],
  ['Les vers que tu cites sont célèbres.', 'relatif'],
  ['La lettre que Julien reçoit le trouble.', 'relatif'],
  ['C’est une pièce que j’ai vue deux fois.', 'relatif'],
  ['L’idée qu’il a eue était brillante.', 'relatif'],
  ['L’idée qu’il puisse partir m’attriste.', 'conjonction'],
  ['Le héros sait qu’il va mourir.', 'conjonction'],
  ['Il faut qu’elle parte.', 'conjonction'],
  ['Je pense qu’il a raison.', 'conjonction'],
  ['On raconte qu’un trésor dort sous l’île.', 'conjonction'],
  ['Que cherches-tu dans ce poème ?', 'interrogatif'],
  ['Que va devenir le héros ?', 'interrogatif'],
  ['Qu’as-tu compris de ce passage ?', 'interrogatif'],
  ['Que faire ?', 'interrogatif'],
  ['Que dit le narrateur à la fin ?', 'interrogatif'],
];
const PIEGE_QUE = { relatif: 'que-relatif', conjonction: 'que-conjonction', interrogatif: 'que-interrogatif' };

// ------------------------------------------------------------ l'interrogation

export const TYPES_INTERRO = {
  dt: 'Directe totale',
  dp: 'Directe partielle',
  it: 'Indirecte totale',
  ip: 'Indirecte partielle',
};

/** [phrase, type : d/i (directe, indirecte) puis t/p (totale, partielle)]. */
export const INTERRO_TYPES = [
  ['Viendras-tu au théâtre ce soir ?', 'dt'],
  ['Est-ce que le héros va mourir ?', 'dt'],
  ['Ton frère a-t-il lu ce roman ?', 'dt'],
  ['Tu as compris la consigne ?', 'dt'],
  ['Où le narrateur a-t-il grandi ?', 'dp'],
  ['Pourquoi le personnage se tait-il ?', 'dp'],
  ['Qui a écrit cette lettre ?', 'dp'],
  ['Quel poème préfères-tu ?', 'dp'],
  ['Le lecteur se demande si le héros survivra.', 'it'],
  ['Dis-moi si tu as aimé la pièce.', 'it'],
  ['J’ignore si la lettre est arrivée.', 'it'],
  ['Elle demande si le spectacle est complet.', 'it'],
  ['Le narrateur se demande pourquoi elle est partie.', 'ip'],
  ['Dis-moi quel poème tu préfères.', 'ip'],
  ['Elle ignore qui a écrit cette lettre.', 'ip'],
  ['Je me demande où il a caché le trésor.', 'ip'],
];

/** L'erreur sur directe/indirecte passe avant l'erreur sur totale/partielle. */
function piegeInterro(bonne, choisie) {
  if (bonne[0] !== choisie[0]) return bonne[0] === 'd' ? 'interro-directe' : 'interro-indirecte';
  return bonne[1] === 't' ? 'interro-totale' : 'interro-partielle';
}

export const MARQUES = {
  simple: 'Inversion simple du sujet',
  complexe: 'Inversion complexe du sujet',
  estceque: 'La tournure « est-ce que »',
  intonation: 'La seule intonation',
};

/** [interrogation totale directe, sa marque]. */
export const MARQUES_1RE = [
  ['Viens-tu ce soir ?', 'simple'],
  ['Aimes-tu ce roman ?', 'simple'],
  ['Avez-vous lu la préface ?', 'simple'],
  ['Le héros mourra-t-il ?', 'complexe'],
  ['Cette pièce te plaît-elle ?', 'complexe'],
  ['Ta sœur a-t-elle fini le livre ?', 'complexe'],
  ['Est-ce que tu viens ce soir ?', 'estceque'],
  ['Est-ce que la pièce est longue ?', 'estceque'],
  ['Est-ce que le narrateur ment ?', 'estceque'],
  ['Tu viens ce soir ?', 'intonation'],
  ['La pièce est longue ?', 'intonation'],
  ['Tu as lu la préface ?', 'intonation'],
];
const PIEGE_MARQUE = {
  simple: 'marque-simple', complexe: 'marque-complexe', estceque: 'marque-est-ce-que', intonation: 'marque-intonation',
};

export const MOTS = { determinant: 'Déterminant interrogatif', pronom: 'Pronom interrogatif', adverbe: 'Adverbe interrogatif' };

/** [question, le mot interrogatif indiqué, sa classe]. */
export const MOTS_1RE = [
  ['Quel roman préfères-tu ?', 'Quel', 'determinant'],
  ['Quelle scène relis-tu ?', 'Quelle', 'determinant'],
  ['À quelle heure commence la pièce ?', 'quelle', 'determinant'],
  ['Quels personnages sont sincères ?', 'Quels', 'determinant'],
  ['Lequel de ces poèmes préfères-tu ?', 'Lequel', 'pronom'],
  ['Qui a écrit cette lettre ?', 'Qui', 'pronom'],
  ['Que cherches-tu ?', 'Que', 'pronom'],
  ['À quoi penses-tu ?', 'quoi', 'pronom'],
  ['Laquelle de ces scènes choisis-tu ?', 'Laquelle', 'pronom'],
  ['Où vas-tu ?', 'Où', 'adverbe'],
  ['Quand partira-t-il ?', 'Quand', 'adverbe'],
  ['Comment le héros s’échappe-t-il ?', 'Comment', 'adverbe'],
  ['Pourquoi pleures-tu ?', 'Pourquoi', 'adverbe'],
];

/** [question directe, la bonne question rapportée, deux erreurs avec leur piège]. */
export const INDIRECTES = [
  ['Où vas-tu ?', 'où je vais.', [['où vais-je.', 'indirecte-sans-inversion'], ['où est-ce que je vais.', 'indirecte-sans-est-ce-que']]],
  ['Viens-tu ce soir ?', 'si je viens ce soir.', [['est-ce que je viens ce soir.', 'indirecte-si'], ['si je viens ce soir ?', 'indirecte-point']]],
  ['Que lis-tu ?', 'ce que je lis.', [['qu’est-ce que je lis.', 'indirecte-ce-que'], ['que je lis.', 'indirecte-ce-que']]],
  ['Qu’est-ce qui te fait peur ?', 'ce qui me fait peur.', [['qu’est-ce qui me fait peur.', 'indirecte-ce-qui'], ['qui me fait peur.', 'indirecte-ce-qui']]],
  ['Pourquoi pleures-tu ?', 'pourquoi je pleure.', [['pourquoi est-ce que je pleure.', 'indirecte-sans-est-ce-que'], ['pourquoi je pleure ?', 'indirecte-point']]],
  ['Est-ce que tu as fini ?', 'si j’ai fini.', [['est-ce que j’ai fini.', 'indirecte-si'], ['si j’ai fini ?', 'indirecte-point']]],
  ['Quand partiras-tu ?', 'quand je partirai.', [['quand partirai-je.', 'indirecte-sans-inversion'], ['quand est-ce que je partirai.', 'indirecte-sans-est-ce-que']]],
  ['Qui t’a écrit ?', 'qui m’a écrit.', [['qui est-ce qui m’a écrit.', 'indirecte-sans-est-ce-que'], ['qui m’a écrit ?', 'indirecte-point']]],
  ['Comment as-tu trouvé la pièce ?', 'comment j’ai trouvé la pièce.', [
    ['comment ai-je trouvé la pièce.', 'indirecte-sans-inversion'], ['comment est-ce que j’ai trouvé la pièce.', 'indirecte-sans-est-ce-que'],
  ]],
  ['Aimes-tu la poésie ?', 'si j’aime la poésie.', [['est-ce que j’aime la poésie.', 'indirecte-si'], ['si j’aime la poésie ?', 'indirecte-point']]],
  ['Quel livre choisis-tu ?', 'quel livre je choisis.', [
    ['quel livre choisis-je.', 'indirecte-sans-inversion'], ['quel livre est-ce que je choisis.', 'indirecte-sans-est-ce-que'],
  ]],
  ['Que veux-tu ?', 'ce que je veux.', [['qu’est-ce que je veux.', 'indirecte-ce-que'], ['que je veux.', 'indirecte-ce-que']]],
];

export const VALEURS = {
  information: 'Une demande d’information',
  requete: 'Une demande d’action, polie',
  rhetorique: 'Une affirmation déguisée',
};

/** [situation et question, ce que fait vraiment la question]. */
export const VALEURS_1TEC = [
  ['Au guichet, un voyageur demande : « À quelle heure part le train ? »', 'information'],
  ['Dans la rue, un touriste demande : « Où se trouve le musée ? »', 'information'],
  ['Au téléphone, une amie demande : « Tu arrives à quelle heure ? »', 'information'],
  ['Le détective demande au témoin : « Qu’avez-vous vu cette nuit-là ? »', 'information'],
  ['À table, Paul dit à sa sœur : « Peux-tu me passer le sel ? »', 'requete'],
  ['La salle est glacée ; une élève demande à son voisin : « Pourrais-tu fermer la fenêtre ? »', 'requete'],
  ['À la bibliothèque, quelqu’un murmure : « Pourriez-vous parler moins fort ? »', 'requete'],
  ['Le directeur dit aux élèves debout : « Voulez-vous bien vous asseoir ? »', 'requete'],
  ['Dans un discours, l’orateur lance : « Qui n’a jamais rêvé d’un monde plus juste ? »', 'rhetorique'],
  ['Un poète écrit : « Ne sommes-nous pas tous mortels ? »', 'rhetorique'],
  ['L’avocat de l’accusé s’écrie : « Faut-il donc condamner un innocent ? »', 'rhetorique'],
  ['Un philosophe écrit : « Qui ne souhaite pas être heureux ? »', 'rhetorique'],
];

// ------------------------------------------------------------ la négation

export const NEGATIONS = {
  totale: 'Négation totale',
  partielle: 'Négation partielle',
  restriction: 'Restriction (ne… que)',
  expletif: 'Ne explétif',
};
const PIEGE_NEGATION = {
  totale: 'negation-totale', partielle: 'negation-partielle', restriction: 'restriction', expletif: 'ne-expletif',
};

/** [phrase avec « ne », sa valeur]. */
export const NEGATIONS_TYPES = [
  ['Le héros ne répond pas.', 'totale'],
  ['Je ne t’en veux point.', 'totale'],
  ['Elle n’a pas lu la lettre.', 'totale'],
  ['Ne pas se pencher au-dehors.', 'totale'],
  ['Le narrateur ne sort jamais de chez lui.', 'partielle'],
  ['Personne n’a vu le coupable.', 'partielle'],
  ['Rien ne bouge dans la maison.', 'partielle'],
  ['Le poète ne croit plus à l’amour.', 'partielle'],
  ['Aucun témoin n’est venu.', 'partielle'],
  ['Il ne lit que des romans.', 'restriction'],
  ['Le héros n’a qu’une idée : fuir.', 'restriction'],
  ['On ne voit que lui sur scène.', 'restriction'],
  ['Je crains qu’il ne soit trop tard.', 'expletif'],
  ['Partez avant qu’il ne pleuve.', 'expletif'],
  ['Il est plus habile qu’on ne le croit.', 'expletif'],
];

export const MOYENS = {
  phrase: 'Une phrase négative',
  prefixe: 'Un préfixe négatif',
  lexique: 'Un mot de sens négatif',
};

/** [phrase, le seul moyen qui y exprime la négation]. */
export const NEGATIONS_MOYENS = [
  ['Ce manuscrit est illisible.', 'prefixe'],
  ['Le héros se montre incapable d’agir.', 'prefixe'],
  ['Cette scène paraît irréelle.', 'prefixe'],
  ['Le fils désobéit à son père.', 'prefixe'],
  ['Le jeune homme reste immobile.', 'prefixe'],
  ['Le roi refuse la grâce du condamné.', 'lexique'],
  ['Le père interdit ce mariage.', 'lexique'],
  ['Le témoin principal est absent.', 'lexique'],
  ['Il est parti sans dire au revoir.', 'lexique'],
  ['La reine ignore la vérité.', 'lexique'],
  ['Le héros ne parle jamais de son passé.', 'phrase'],
  ['La lettre n’est pas arrivée.', 'phrase'],
  ['Le poète ne chante plus.', 'phrase'],
  ['Elle n’a pas répondu.', 'phrase'],
];

/** [mot, son contraire formé par préfixe, deux formes qui n'existent pas, avec leur piège]. */
export const PREFIXES = [
  ['lisible', 'illisible', [['inlisible', 'prefixe-assimilation'], ['délisible', 'prefixe-usage']]],
  ['légal', 'illégal', [['inlégal', 'prefixe-assimilation'], ['délégal', 'prefixe-usage']]],
  ['logique', 'illogique', [['inlogique', 'prefixe-assimilation'], ['malogique', 'prefixe-usage']]],
  ['réel', 'irréel', [['inréel', 'prefixe-assimilation'], ['déréel', 'prefixe-usage']]],
  ['responsable', 'irresponsable', [['inresponsable', 'prefixe-assimilation'], ['malresponsable', 'prefixe-usage']]],
  ['régulier', 'irrégulier', [['inrégulier', 'prefixe-assimilation'], ['malrégulier', 'prefixe-usage']]],
  ['possible', 'impossible', [['inpossible', 'prefixe-assimilation'], ['dépossible', 'prefixe-usage']]],
  ['mobile', 'immobile', [['inmobile', 'prefixe-assimilation'], ['malmobile', 'prefixe-usage']]],
  ['patient', 'impatient', [['inpatient', 'prefixe-assimilation'], ['dépatient', 'prefixe-usage']]],
  ['mortel', 'immortel', [['inmortel', 'prefixe-assimilation'], ['démortel', 'prefixe-usage']]],
  ['buvable', 'imbuvable', [['inbuvable', 'prefixe-assimilation'], ['débuvable', 'prefixe-usage']]],
  ['prudent', 'imprudent', [['inprudent', 'prefixe-assimilation'], ['malprudent', 'prefixe-usage']]],
  ['agréable', 'désagréable', [['inagréable', 'prefixe-usage'], ['malagréable', 'prefixe-usage']]],
  ['content', 'mécontent', [['incontent', 'prefixe-usage'], ['décontent', 'prefixe-usage']]],
  ['adroit', 'maladroit', [['inadroit', 'prefixe-usage'], ['désadroit', 'prefixe-usage']]],
  ['normal', 'anormal', [['innormal', 'prefixe-usage'], ['dénormal', 'prefixe-usage']]],
];

// ------------------------------------------------------------ les circonstancielles (voie technologique)

export const SENS = {
  cause: 'Cause',
  consequence: 'Conséquence',
  but: 'But',
  condition: 'Condition',
  concession: 'Concession',
  temps: 'Temps',
};

/** [phrase, rapport logique, deux autres rapports, pièges propres à une confusion]. */
export const SENS_1TEC = [
  ['Le héros renonce [parce qu’il a peur].', 'cause', 'consequence', 'but', {}],
  ['[Puisque tu insistes], je lirai ce roman.', 'cause', 'condition', 'concession', {}],
  ['[Comme il était malade], il resta chez lui.', 'cause', 'temps', 'consequence', { temps: 'comme-cause' }],
  ['[Sous prétexte qu’il était fatigué], il refusa de venir.', 'cause', 'but', 'concession', {}],
  ['[Étant donné que le théâtre est fermé], la pièce est reportée.', 'cause', 'condition', 'consequence', {}],
  ['Il a tant lu [qu’il connaît ce poème par cœur].', 'consequence', 'cause', 'but', {}],
  ['Il pleuvait, [si bien que la représentation fut annulée].', 'consequence', 'but', 'cause', { but: 'si-bien-que' }],
  ['Il a parlé fort, [de sorte que tout le monde l’a entendu].', 'consequence', 'but', 'condition', { but: 'de-sorte-que-indicatif' }],
  ['Il est si ému [qu’il ne peut plus parler].', 'consequence', 'cause', 'concession', {}],
  ['Parle fort [de sorte que tout le monde t’entende].', 'but', 'consequence', 'condition', { consequence: 'de-sorte-que-subjonctif' }],
  ['Il relit la scène [pour que son jeu soit parfait].', 'but', 'consequence', 'cause', {}],
  ['Elle se cache [afin qu’on ne la reconnaisse pas].', 'but', 'cause', 'consequence', {}],
  ['[Si tu lis la préface], tu comprendras mieux le roman.', 'condition', 'cause', 'temps', {}],
  ['Tu joueras ce rôle [à condition que tu apprennes ton texte].', 'condition', 'but', 'temps', {}],
  ['[Pourvu qu’il fasse beau], la fête aura lieu dehors.', 'condition', 'but', 'cause', {}],
  ['[Au cas où tu changerais d’avis], appelle-moi.', 'condition', 'concession', 'temps', {}],
  ['[Bien que la pièce soit longue], le public reste captivé.', 'concession', 'cause', 'condition', {}],
  ['[Même s’il pleut], la représentation aura lieu.', 'concession', 'condition', 'temps', { condition: 'meme-si' }],
  ['[Quoiqu’il soit riche], il vit simplement.', 'concession', 'cause', 'consequence', {}],
  ['[Si riche qu’il soit], il n’est pas heureux.', 'concession', 'consequence', 'condition', {
    consequence: 'si-que-concession', condition: 'si-que-concession',
  }],
  ['[Quand bien même il le voudrait], il ne pourrait pas revenir.', 'concession', 'condition', 'temps', {}],
];

/** [phrase à trou, la bonne forme du verbe, une ou deux formes fautives avec leur piège]. */
export const MODES_1TEC = [
  ['Bien qu’il … fatigué, il continue d’écrire.', 'soit', [['est', 'bien-que-subjonctif'], ['serait', 'bien-que-subjonctif']]],
  ['Je te prête ce livre pour que tu le … .', 'lises', [['lis', 'but-subjonctif'], ['liras', 'but-subjonctif']]],
  ['Même s’il …, nous jouerons dehors.', 'pleut', [['pleuve', 'meme-si-indicatif'], ['pleuvrait', 'si-jamais-conditionnel']]],
  ['Si tu … ce roman, tu l’aimeras.', 'lis', [['liras', 'si-jamais-futur'], ['lirais', 'si-jamais-conditionnel']]],
  ['Il reste chez lui parce qu’il … malade.', 'est', [['soit', 'cause-indicatif']]],
  ['Tu pourras sortir à condition que tu … tes devoirs.', 'finisses', [['finis', 'condition-subjonctif'], ['finiras', 'condition-subjonctif']]],
  ['Il a tant lu qu’il … ce poème par cœur.', 'connaît', [['connaisse', 'consequence-indicatif']]],
  ['Quoiqu’elle … raison, personne ne l’écoute.', 'ait', [['a', 'bien-que-subjonctif'], ['aurait', 'bien-que-subjonctif']]],
  ['Pourvu qu’il … beau demain, la fête aura lieu.', 'fasse', [['fait', 'condition-subjonctif'], ['fera', 'condition-subjonctif']]],
  ['Si j’… plus de temps, je lirais davantage.', 'avais', [['aurais', 'si-jamais-conditionnel'], ['ai', 'si-concordance']]],
  ['Afin que chacun … le texte, le professeur le lit à voix haute.', 'comprenne', [['comprend', 'but-subjonctif'], ['comprendra', 'but-subjonctif']]],
  ['Il a parlé si bas que personne ne l’… .', 'a entendu', [['ait entendu', 'consequence-indicatif']]],
  ['Même si tu … tort, je t’écouterai.', 'as', [['aies', 'meme-si-indicatif'], ['aurais', 'si-jamais-conditionnel']]],
  ['Bien que la critique … sévère, la pièce triomphe.', 'soit', [['est', 'bien-que-subjonctif'], ['sera', 'bien-que-subjonctif']]],
];

// ------------------------------------------------------------ les manches

const crochets = 'La subordonnée est entre crochets.';

function nature(t, [phrase, bonne, propres]) {
  return etiquettes('nature-sub', `${phrase}\n\n${crochets}`, bonne, Object.keys(NATURES), NATURES, (c) => propres[c] ?? `nature-${bonne}`);
}

function fonction(t, [phrase, bonne, autres]) {
  const cles = t.melanger([bonne, ...autres.map(([c]) => c)]);
  const propres = Object.fromEntries(autres);
  return etiquettes('fonction-sub', `${phrase}\n\n${crochets}`, bonne, cles, FONCTIONS, (c) => propres[c] ?? `fonction-${bonne}`);
}

const classeQue = ([phrase, bonne]) => etiquettes(
  'classe-que',
  `${phrase}\n\n→ « ${/qu’/i.test(phrase) && !/\bque\b/i.test(phrase) ? 'qu’' : 'que'} »`,
  bonne,
  Object.keys(CLASSES_QUE),
  CLASSES_QUE,
  () => PIEGE_QUE[bonne],
);

const typeInterro = ([phrase, bonne]) => etiquettes(
  'interro-type',
  phrase,
  bonne,
  Object.keys(TYPES_INTERRO),
  TYPES_INTERRO,
  (c) => piegeInterro(bonne, c),
);

const marque = ([phrase, bonne]) => etiquettes('marque', phrase, bonne, Object.keys(MARQUES), MARQUES, () => PIEGE_MARQUE[bonne]);

const motInterrogatif = ([phrase, mot, bonne]) => etiquettes(
  'mot-interrogatif',
  `${phrase}\n\n→ « ${mot} »`,
  bonne,
  Object.keys(MOTS),
  MOTS,
  () => `mot-${bonne}`,
);

function indirecte(t, [directe, bonne, faux]) {
  const m = libre(t.melanger, 'indirecte', `Il me demande : « ${directe} »\n\nRapporte la question : « Il me demande… »`, bonne, faux);
  m.choix = m.choix.map(({ cle }) => ({ cle, libelle: `… ${cle}` }));
  return m;
}

const valeur = ([situation, bonne]) => etiquettes('valeur', situation, bonne, Object.keys(VALEURS), VALEURS, () => `valeur-${bonne}`);

const negationType = ([phrase, bonne]) => etiquettes(
  'negation-type',
  phrase,
  bonne,
  Object.keys(NEGATIONS),
  NEGATIONS,
  () => PIEGE_NEGATION[bonne],
);

const negationMoyen = ([phrase, bonne]) => etiquettes(
  'negation-moyen',
  phrase,
  bonne,
  Object.keys(MOYENS),
  MOYENS,
  () => `moyen-${bonne}`,
);

const prefixe = (t, [mot, bonne, faux]) => libre(t.melanger, 'prefixe', `Le contraire de « ${mot} »`, bonne, faux);

function sens(t, [phrase, bonne, a, b, propres]) {
  return etiquettes('sens-circ', `${phrase}\n\n${crochets}`, bonne, t.melanger([bonne, a, b]), SENS, (c) => propres[c] ?? `sens-${bonne}`);
}

const mode = (t, [phrase, bonne, faux]) => libre(t.melanger, 'mode', phrase, bonne, faux);

// ------------------------------------------------------------ la partie

function premiere(t) {
  const natures = t.melanger(NATURES_1RE).slice(0, 2);
  const vues = natures.map(([p]) => p);
  const [fonc] = t.melanger(FONCTIONS_1RE.filter(([p]) => !vues.includes(p)));
  const interro = {
    'interro-type': () => typeInterro(t.au(INTERRO_TYPES)),
    marque: () => marque(t.au(MARQUES_1RE)),
    'mot-interrogatif': () => motInterrogatif(t.au(MOTS_1RE)),
    indirecte: () => indirecte(t, t.au(INDIRECTES)),
  };
  const deux = t.melanger(Object.keys(interro)).slice(0, 2);
  return t.melanger([
    ...natures.map((n) => nature(t, n)),
    fonction(t, fonc),
    classeQue(t.au(QUE_1RE)),
    ...deux.map((k) => interro[k]()),
    negationType(t.au(NEGATIONS_TYPES)),
    negationMoyen(t.au(NEGATIONS_MOYENS)),
  ]);
}

function premiereTechno(t) {
  const derniere = t.au(['negation-moyen', 'prefixe']) === 'prefixe'
    ? prefixe(t, t.au(PREFIXES))
    : negationMoyen(t.au(NEGATIONS_MOYENS));
  return t.melanger([
    ...t.melanger(SENS_1TEC).slice(0, 2).map((s) => sens(t, s)),
    mode(t, t.au(MODES_1TEC)),
    typeInterro(t.au(INTERRO_TYPES)),
    indirecte(t, t.au(INDIRECTES)),
    valeur(t.au(VALEURS_1TEC)),
    negationType(t.au(NEGATIONS_TYPES)),
    derniere,
  ]);
}

const PAR_NIVEAU = { PREMIERE: premiere, PREMIERE_TECHNO: premiereTechno };

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
  // La nature de la subordonnée
  'nature-sub': 'Quelle est la nature de la subordonnée entre crochets ?',
  'nature-sub-regle': 'Regarde le mot qui l’introduit, et ce que la subordonnée complète : un nom, un verbe, toute la phrase, ou une question qu’on rapporte.',
  'nature-relative': 'Le mot qui l’introduit reprend un nom placé juste avant, son antécédent, et il a une fonction dans la subordonnée : c’est une relative.',
  'nature-completive': '« Que » ne reprend aucun nom et n’a aucune fonction dans la subordonnée : il ne fait que l’introduire. C’est une complétive.',
  'nature-circonstancielle': 'La subordonnée indique une circonstance, le temps, la cause, la condition ou la concession, et complète toute la phrase : elle est circonstancielle.',
  'nature-interrogative': 'La subordonnée rapporte une question, après un verbe comme demander, ignorer ou savoir : c’est une interrogative indirecte.',
  'si-interrogatif': 'Après « se demander », « si » introduit une question rapportée, à laquelle on répondrait par oui ou par non : c’est une interrogative indirecte, pas une condition.',
  'si-condition': 'Ici, « si » pose une condition, et la subordonnée complète toute la phrase : c’est une circonstancielle de condition, pas une question rapportée.',
  'ou-relatif': '« Où » reprend ici un nom placé juste avant lui, son antécédent : c’est un pronom relatif. La subordonnée est relative, même si elle parle d’un lieu.',
  'interrogatif-sans-antecedent': 'Le mot qui introduit la subordonnée ne reprend aucun nom : il porte une question, après un verbe comme demander, ignorer ou savoir. C’est une interrogative indirecte.',
  'que-conjonction-nom': 'Ce « que » ne reprend pas le nom placé avant lui : il n’a aucune fonction dans la subordonnée, qui développe le contenu de ce nom. C’est une complétive, complément du nom, pas une relative.',

  // La fonction de la subordonnée
  'fonction-sub': 'Quelle est la fonction de la subordonnée entre crochets ?',
  'fonction-sub-regle': 'Cherche ce que la subordonnée complète, puis remplace-la par « cela » ou par un groupe nominal : sa fonction apparaît.',
  'fonction-sujet': 'Placée en tête, avant le verbe, la subordonnée peut être remplacée par « cela » : elle est sujet du verbe.',
  'fonction-attribut': 'La subordonnée suit le verbe être et dit ce qu’est le sujet : elle est attribut du sujet.',
  'fonction-cod': 'Pose la question « quoi ? » après le verbe : la subordonnée y répond. Elle est complément d’objet direct.',
  'fonction-cdn': 'La subordonnée développe le contenu d’un nom, l’idée, la crainte, la nouvelle : elle est complément du nom.',
  'fonction-cadj': 'La subordonnée complète un adjectif, comme heureux, sûr ou certain : elle est complément de l’adjectif.',
  'fonction-cant': 'La relative complète un nom, son antécédent, comme le ferait un adjectif : elle est complément de l’antécédent.',
  'fonction-cc': 'La subordonnée dit quand, pourquoi, à quelle condition, et on peut la déplacer : elle est complément circonstanciel.',
  'attribut-pas-cod': 'Après le verbe être, il n’y a pas de complément d’objet : la subordonnée dit ce qu’est le sujet, elle est attribut.',
  'cadj-pas-cod': 'Un adjectif n’a pas de complément d’objet : la subordonnée complète l’adjectif, elle est complément de l’adjectif.',
  'interrogative-cod': 'La subordonnée rapporte une question, après « ignorer » ou « se demander » : c’est une interrogative indirecte, complément d’objet direct du verbe.',
  'fonction-du-relatif': 'Attention : c’est le pronom relatif qui a cette fonction, à l’intérieur de la relative. La relative entière, elle, complète son antécédent.',

  // La classe de « que »
  'classe-que': 'Quelle est la classe de ce mot « que » ?',
  'classe-que-regle': 'Demande-toi si « que » reprend un nom placé avant lui, s’il pose une question, ou s’il ne fait qu’introduire une subordonnée.',
  'que-relatif': 'Ce « que » reprend le nom placé juste avant lui, et il est complément d’objet dans la subordonnée : c’est un pronom relatif.',
  'que-conjonction': 'Ce « que » ne reprend aucun nom et n’a aucune fonction dans la subordonnée : il ne fait que l’introduire. C’est une conjonction de subordination.',
  'que-interrogatif': 'Ce « que » ouvre une question directe : il demande « quelle chose ? ». C’est un pronom interrogatif.',

  // L'interrogation
  'interro-type': 'Cette interrogation est-elle directe ou indirecte, totale ou partielle ?',
  'interro-type-regle': 'Directe, la question est posée telle quelle ; indirecte, elle est rapportée dans une subordonnée. Totale, on répond par oui ou par non ; partielle, elle porte sur un élément.',
  'interro-directe': 'La question est posée telle quelle et se termine par un point d’interrogation : l’interrogation est directe.',
  'interro-indirecte': 'La question est rapportée dans une subordonnée, après un verbe comme demander ou ignorer, sans point d’interrogation : l’interrogation est indirecte.',
  'interro-totale': 'On peut y répondre par oui ou par non : l’interrogation est totale.',
  'interro-partielle': 'On ne peut pas répondre par oui ou par non : un mot interrogatif, qui, où, pourquoi, quel, porte sur un élément. L’interrogation est partielle.',
  marque: 'Comment cette interrogation directe est-elle marquée ?',
  'marque-regle': 'Regarde la place du sujet : après le verbe, ou repris par un pronom après le verbe ; sinon, cherche « est-ce que », ou la seule intonation.',
  'marque-simple': 'Le sujet est un pronom, placé juste après le verbe et relié par un trait d’union : c’est l’inversion simple.',
  'marque-complexe': 'Le sujet est un nom placé avant le verbe, et un pronom le reprend après le verbe : c’est l’inversion complexe.',
  'marque-est-ce-que': 'La phrase garde l’ordre sujet, verbe : c’est « est-ce que », en tête, qui porte la question.',
  'marque-intonation': 'Ni inversion ni « est-ce que » : seule l’intonation qui monte, à l’oral, et le point d’interrogation, à l’écrit, marquent la question.',
  'mot-interrogatif': 'Quelle est la classe du mot interrogatif indiqué ?',
  'mot-interrogatif-regle': 'Demande-toi si le mot accompagne un nom, s’il le remplace, ou s’il porte sur le verbe pour demander le lieu, le temps, la manière ou la cause.',
  'mot-determinant': 'Ce mot accompagne un nom et s’accorde avec lui : c’est un déterminant interrogatif.',
  'mot-pronom': 'Ce mot remplace un nom et occupe sa place, sujet ou complément : c’est un pronom interrogatif.',
  'mot-adverbe': 'Ce mot est invariable et porte sur le verbe, pour demander le lieu, le temps, la manière ou la cause : c’est un adverbe interrogatif.',
  indirecte: 'Comment rapporter correctement cette question ?',
  'indirecte-regle': 'Dans l’interrogation indirecte : ni inversion, ni « est-ce que », ni point d’interrogation ; et une question totale s’introduit par « si ».',
  'indirecte-sans-inversion': 'Dans l’interrogation indirecte, le sujet revient avant le verbe : on n’inverse plus.',
  'indirecte-sans-est-ce-que': '« Est-ce que » appartient à la question directe : il disparaît quand on rapporte la question.',
  'indirecte-si': 'Une question totale, à laquelle on répond par oui ou par non, se rapporte avec « si ».',
  'indirecte-ce-que': '« Que » et « qu’est-ce que » deviennent « ce que » quand on rapporte la question.',
  'indirecte-ce-qui': '« Qu’est-ce qui » devient « ce qui » quand on rapporte la question ; « qui » seul demanderait une personne.',
  'indirecte-point': 'La question rapportée fait partie d’une phrase déclarative : elle se termine par un point, pas par un point d’interrogation.',
  valeur: 'Dans cette situation, que fait vraiment cette question ?',
  'valeur-regle': 'Une phrase interrogative ne demande pas toujours une information : elle peut demander poliment une action, ou affirmer avec force.',
  'valeur-information': 'Celui qui parle ignore la réponse, et il la demande vraiment : c’est une demande d’information.',
  'valeur-requete': 'On n’attend pas un oui ou un non, mais un geste : c’est une demande d’action, rendue polie par la forme de la question.',
  'valeur-rhetorique': 'La réponse va de soi et n’est pas attendue : la question sert à affirmer avec force. C’est une question rhétorique.',

  // La négation
  'negation-type': 'Quelle valeur a le « ne » de cette phrase ?',
  'negation-type-regle': 'Demande-toi sur quoi porte la négation : toute la phrase, ou un seul élément. Et vérifie que c’en est une : « ne… que » veut dire seulement, et un « ne » qu’on peut supprimer sans changer le sens est explétif.',
  'negation-totale': '« Ne… pas » ou « ne… point » nient toute la phrase : la négation est totale.',
  'negation-partielle': 'Jamais, plus, rien, personne, aucun : la négation ne porte que sur un élément, le temps, la chose, la personne. Elle est partielle.',
  restriction: '« Ne… que » veut dire « seulement » : la phrase n’est pas négative, elle restreint. C’est une tournure restrictive.',
  'ne-expletif': 'Supprime ce « ne » : le sens ne change pas. Il n’a aucune valeur négative, c’est un ne explétif, après craindre, avant que, ou un comparatif.',
  'negation-moyen': 'Par quel moyen la négation est-elle exprimée ici ?',
  'negation-moyen-regle': 'La négation passe par la phrase négative, avec « ne » ; par un préfixe, comme in ou dés ; ou par le sens même d’un mot, comme refuser ou absent.',
  'moyen-phrase': 'La négation est portée par « ne » et un second mot, pas, jamais, plus : c’est une phrase négative.',
  'moyen-prefixe': 'La négation est dans le mot lui-même, grâce à un préfixe : in, il, im, ir, dés. C’est une négation par préfixe.',
  'moyen-lexique': 'Ni « ne », ni préfixe : c’est le sens même du mot, refuser, interdire, absent, sans, ignorer, qui exprime la négation.',
  prefixe: 'Quel est le contraire de ce mot, formé avec un préfixe ?',
  'prefixe-regle': 'Le préfixe in change de forme selon la lettre qui suit : il devant l, ir devant r, im devant m, b ou p. Et certains mots prennent dés, mé, mal ou a.',
  'prefixe-assimilation': 'Le préfixe in s’adapte à la lettre qui suit : il devant l, ir devant r, im devant m, b et p. On écrit illisible, irréel, impossible.',
  'prefixe-usage': 'Ce mot n’existe pas : chaque mot a son préfixe, fixé par l’usage, in, dés, mé, mal ou a. Pense à un mot de la même famille que tu connais.',

  // Les circonstancielles
  'sens-circ': 'Quel rapport logique exprime cette subordonnée circonstancielle ?',
  'sens-circ-regle': 'Regarde le mot qui introduit la subordonnée et le mode du verbe, puis demande-toi : pourquoi ? avec quel résultat ? dans quel but ? à quelle condition ? malgré quoi ?',
  'sens-cause': 'La subordonnée donne la raison de ce qui se passe : parce que, puisque, comme, sous prétexte que. C’est la cause.',
  'sens-consequence': 'La subordonnée donne le résultat, à l’indicatif : si bien que, tant… que, si… que. C’est la conséquence.',
  'sens-but': 'La subordonnée dit le résultat voulu, pas encore atteint, au subjonctif : pour que, afin que. C’est le but.',
  'sens-condition': 'La subordonnée pose une condition à ce qui se passe : si, à condition que, pourvu que, au cas où. C’est la condition.',
  'sens-concession': 'La subordonnée dit un obstacle qui n’empêche rien : bien que, quoique, même si, quand bien même. C’est la concession.',
  'comme-cause': 'Ici, « comme » donne la raison de ce qui suit : il signifie « puisque ». C’est la cause.',
  'si-bien-que': '« Si bien que » annonce un résultat réel, à l’indicatif : c’est la conséquence. Le but, lui, vise un résultat voulu, au subjonctif.',
  'de-sorte-que-indicatif': '« De sorte que » suivi de l’indicatif présente un résultat réel, qui s’est produit : c’est la conséquence.',
  'de-sorte-que-subjonctif': '« De sorte que » suivi du subjonctif présente un résultat voulu, pas encore atteint : c’est le but.',
  'meme-si': '« Même si » ne pose pas de condition : il annonce un obstacle qui n’empêchera rien. C’est la concession.',
  'si-que-concession': '« Si » suivi d’un adjectif, puis « que » et le subjonctif : quelle que soit sa richesse, rien ne change. C’est une concession.',
  mode: 'Quelle forme du verbe complète correctement la phrase ?',
  'mode-regle': 'Chaque subordonnant impose son mode : l’indicatif après parce que, si, même si, si bien que ; le subjonctif après bien que, quoique, pour que, afin que, à condition que.',
  'bien-que-subjonctif': '« Bien que » et « quoique » se construisent avec le subjonctif : bien qu’il soit, quoiqu’elle ait.',
  'but-subjonctif': 'Le but vise un résultat qui n’est pas encore réel : après « pour que » et « afin que », le subjonctif.',
  'condition-subjonctif': '« À condition que » et « pourvu que » se construisent avec le subjonctif.',
  'cause-indicatif': 'La cause présente un fait réel : après « parce que », l’indicatif.',
  'consequence-indicatif': 'La conséquence présente un résultat réel : après « tant… que » ou « si… que », l’indicatif.',
  'meme-si-indicatif': 'Après « même si », comme après « si », on emploie l’indicatif.',
  'si-jamais-conditionnel': 'Après le « si » de condition, jamais de conditionnel : on écrit « si tu lis », « si j’avais ».',
  'si-jamais-futur': 'Après le « si » de condition, jamais de futur : le présent suffit, et c’est la principale qui porte le futur.',
  'si-concordance': 'Quand la principale est au conditionnel, la subordonnée en « si » se met à l’imparfait : si j’avais, je lirais.',
};
