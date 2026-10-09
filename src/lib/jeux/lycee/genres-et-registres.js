/**
 * GENRES ET REGISTRES — le français de 2de (Adrien). La suite de « Quel
 * registre ? » (4e), un cran plus fine.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_2DE_LECT_THEATRE       — « Analyser une tragédie ou une comédie du
 *                                XVIIe siècle »
 *   FR_2DE_LECT_ROMAN         — « Analyser un roman du XVIIIe au XXIe siècle
 *                                et son personnage »
 *   FR_2DE_LECT_ARGUMENTATION — « Analyser un texte de la littérature
 *                                d'idées du XVIe au XVIIIe »
 *
 * QUATRE SORTES DE MANCHES (4 + 2 + 1 + 1) :
 *   - LE REGISTRE (4) : un court extrait écrit pour le jeu, au registre
 *     dominant net : tragique, pathétique, épique, lyrique, satirique,
 *     polémique, comique, fantastique, didactique. Les deux autres choix sont
 *     les voisins qu'on confond (CONFUSIONS), chaque paire a sa phrase. LES
 *     PIÈGES : tragique et pathétique, épique et tragique, lyrique et
 *     pathétique, satirique et comique, satirique et polémique ;
 *   - LE GENRE (2) : fable, apologue, conte philosophique, roman épistolaire,
 *     nouvelle, tragédie, comédie, drame romantique, épopée, utopie,
 *     dystopie, autobiographie. Les œuvres citées sont celles de tous les
 *     manuels (Candide, Phèdre, Ruy Blas, Les Liaisons dangereuses…) ;
 *   - L'INDICE (1) : à quoi reconnaît-on ce registre ? Les choix sont les
 *     indices des deux registres voisins ;
 *   - LA VISÉE (1) : quel effet cherche-t-il à produire ? Même construction.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'genres-et-registres', titre: 'Genres et registres', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Genres et registres',
    accroche: 'Tragique, épique, satirique, polémique…',
    competences: ['FR_2DE_LECT_THEATRE', 'FR_2DE_LECT_ROMAN', 'FR_2DE_LECT_ARGUMENTATION'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [nom affiché sur le bouton, nom dans une question]. */
export const REGISTRES = {
  tragique: ['Tragique', 'tragique'],
  pathetique: ['Pathétique', 'pathétique'],
  epique: ['Épique', 'épique'],
  lyrique: ['Lyrique', 'lyrique'],
  satirique: ['Satirique', 'satirique'],
  polemique: ['Polémique', 'polémique'],
  comique: ['Comique', 'comique'],
  fantastique: ['Fantastique', 'fantastique'],
  didactique: ['Didactique', 'didactique'],
};

/** Les deux registres qu'on prend le plus souvent pour celui-ci. */
export const CONFUSIONS = {
  tragique: ['pathetique', 'epique'],
  pathetique: ['tragique', 'lyrique'],
  epique: ['tragique', 'lyrique'],
  lyrique: ['pathetique', 'epique'],
  satirique: ['polemique', 'comique'],
  polemique: ['satirique', 'didactique'],
  comique: ['satirique', 'lyrique'],
  fantastique: ['tragique', 'pathetique'],
  didactique: ['polemique', 'satirique'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [extrait écrit pour le jeu, registre dominant]. */
export const EXTRAITS = [
  ['Je savais, en franchissant ce seuil, que je n’en reviendrais pas. Les dieux avaient parlé : mon père mourrait de ma main, et je n’y pouvais rien.', 'tragique'],
  ['Quoi qu’elle choisisse, elle perd : trahir son père ou renoncer à celui qu’elle aime. Le piège s’est refermé, et nul ne peut l’en sortir.', 'tragique'],
  ['C’est en fuyant l’oracle que je l’ai accompli. Chacun de mes efforts m’a conduit au crime : il n’y avait pas d’issue.', 'tragique'],

  ['La vieille femme tendait la main sous la pluie ; ses doigts gelés tremblaient, et personne, personne ne s’arrêtait.', 'pathetique'],
  ['L’enfant appelait sa mère dans les décombres. Sa petite voix faiblissait d’heure en heure, et nul ne l’entendait.', 'pathetique'],
  ['Il serra une dernière fois la lettre de son fils, mort au front, et voulut la relire ; ses larmes l’en empêchèrent.', 'pathetique'],

  ['Dix mille cavaliers déferlèrent sur la plaine ; seul sur le pont, le héros brandit son épée et en renversa vingt d’un seul coup.', 'epique'],
  ['La terre tremblait sous les sabots ; les étendards claquaient, et l’armée, marée d’acier, roula vers les remparts.', 'epique'],
  ['Il sonna du cor si fort que les montagnes en tremblèrent, et l’écho courut jusqu’au camp de l’empereur, à trente lieues de là.', 'epique'],

  ['Que j’aime ces matins d’avril, quand le jardin s’éveille et que mon âme, légère, s’envole avec les hirondelles !', 'lyrique'],
  ['Mon amour, je t’écris de la mer : chaque vague me parle de toi, et mon cœur bat au rythme de la marée.', 'lyrique'],
  ['Ô nuit, douce nuit, je t’aime pour ton silence ; en toi, mon cœur se repose et rêve.', 'lyrique'],

  ['Le ministre, homme d’une rare vertu, ne s’enrichissait que les jours de semaine ; le dimanche, il se reposait.', 'satirique'],
  ['Dans ce salon, on jugeait les livres sans les avoir lus, et l’on applaudissait toujours celui qui avait le plus d’argent.', 'satirique'],
  ['Les médecins de la ville avaient un remède infaillible : ils saignaient le malade jusqu’à ce qu’il guérisse, ou qu’il meure, ce qui réglait aussi la question.', 'satirique'],

  ['Vous qui prétendez défendre la liberté, vous l’avez trahie ! Je vous accuse d’avoir menti au peuple, et je le prouverai.', 'polemique'],
  ['Assez de discours ! Cette loi est une honte, et ceux qui l’ont votée devront en répondre devant la nation.', 'polemique'],
  ['Comment osez-vous parler de justice, vous qui avez condamné un innocent ? Votre silence est un crime.', 'polemique'],

  ['En voulant saluer la duchesse, le baron recula, marcha sur sa propre cape et s’étala de tout son long dans le gâteau.', 'comique'],
  ['— Qui frappe ? — C’est moi. — Moi qui ? — Moi, moi ! — Ah, c’est toi… Mais qui, toi ?', 'comique'],
  ['Le valet, caché sous la table, éternua au moment précis où son maître jurait qu’il était seul.', 'comique'],

  ['Chaque nuit, le tableau changeait : le personnage peint tournait un peu plus la tête vers mon lit. Je me répétais que la fatigue me trompait, sans parvenir à y croire.', 'fantastique'],
  ['Je l’entendis monter l’escalier, alors que je vivais seul et que la porte était verrouillée. Le lendemain, des traces de pas mouillés marquaient le parquet. Avais-je rêvé ?', 'fantastique'],
  ['Sur la route du retour, la même vieille femme m’apparut trois fois au bord du fossé, toujours souriante, alors que je roulais vite. Je n’ose dire ce que je crois.', 'fantastique'],

  ['Pour bien conserver une pomme, il faut d’abord la choisir saine, puis la placer au frais, à l’abri de la lumière. Ainsi, elle tiendra tout l’hiver.', 'didactique'],
  ['Retenez ceci : la Lune ne brille pas d’elle-même ; elle renvoie la lumière du Soleil, comme un miroir.', 'didactique'],
  ['Le volcan naît d’une remontée de magma ; lorsque la pression devient trop forte, la lave jaillit par la cheminée.', 'didactique'],
];

/** Ce qui signale chaque registre. */
export const INDICES = {
  tragique: 'Le lexique de la fatalité et du destin',
  pathetique: 'Le lexique de la souffrance, qui appelle la pitié',
  epique: 'L’amplification et l’hyperbole des combats',
  lyrique: 'La première personne et l’expression des sentiments',
  satirique: 'L’ironie qui ridiculise un travers social',
  polemique: 'L’interpellation violente d’un adversaire',
  comique: 'Le quiproquo, la répétition, le comique de geste',
  fantastique: 'L’hésitation entre explication rationnelle et surnaturel',
  didactique: 'Un vocabulaire précis et des explications ordonnées',
};

/** L'effet que chaque registre cherche à produire. */
export const VISEES = {
  tragique: 'La terreur et la pitié devant un destin inévitable',
  pathetique: 'Émouvoir jusqu’aux larmes devant une souffrance',
  epique: 'L’admiration pour le héros et ses exploits',
  lyrique: 'Le partage d’une émotion intime',
  satirique: 'Faire rire d’un travers pour le dénoncer',
  polemique: 'Discréditer un adversaire en l’attaquant',
  comique: 'Faire rire, divertir',
  fantastique: 'L’inquiétude et le doute',
  didactique: 'Instruire, transmettre un savoir',
};

/** [question, bonne réponse, [[choix à écarter, phrase de l'erreur], …]]. */
export const GENRES = [
  ['Récit bref, souvent en vers, qui met en scène des animaux pour illustrer une morale.', 'La fable', [['Le conte philosophique', 'genre-fable'], ['La nouvelle', 'genre-fable']]],
  ['Récit court à visée argumentative, qui illustre une leçon : fable, conte philosophique, parabole…', 'L’apologue', [['L’essai', 'genre-apologue'], ['Le roman', 'genre-apologue']]],
  ['Candide, de Voltaire, est…', 'Un conte philosophique', [['Une fable', 'genre-candide'], ['Un roman épistolaire', 'genre-candide']]],
  ['Les Liaisons dangereuses, de Laclos, roman fait de lettres, est…', 'Un roman épistolaire', [['Un conte philosophique', 'genre-epistolaire'], ['Une autobiographie', 'genre-epistolaire']]],
  ['Les Lettres persanes, de Montesquieu, sont…', 'Un roman épistolaire', [['Une épopée', 'genre-epistolaire'], ['Une tragédie', 'genre-epistolaire']]],
  ['Récit bref, centré sur peu de personnages et un seul événement, souvent clos par une chute.', 'La nouvelle', [['Le roman', 'genre-nouvelle'], ['La fable', 'genre-nouvelle']]],
  ['Pièce où des personnages de haut rang, pris dans un dilemme, vont vers une fin malheureuse.', 'La tragédie', [['La comédie', 'genre-tragedie'], ['La farce', 'genre-tragedie']]],
  ['Pièce du XIXe siècle qui mêle le sublime et le grotesque et rejette les règles classiques.', 'Le drame romantique', [['La tragédie', 'genre-drame'], ['La farce', 'genre-drame']]],
  ['Phèdre, de Racine, est…', 'Une tragédie', [['Une comédie', 'genre-phedre'], ['Un drame romantique', 'genre-phedre']]],
  ['Le Malade imaginaire, de Molière, est…', 'Une comédie', [['Une tragédie', 'genre-moliere'], ['Un drame romantique', 'genre-moliere']]],
  ['Ruy Blas, de Victor Hugo, est…', 'Un drame romantique', [['Une tragédie classique', 'genre-ruy-blas'], ['Une farce', 'genre-ruy-blas']]],
  ['Long poème qui chante les exploits d’un héros, comme La Chanson de Roland.', 'L’épopée', [['La fable', 'genre-epopee'], ['Le sonnet', 'genre-epopee']]],
  ['Récit qui décrit une société idéale imaginaire pour critiquer la société réelle.', 'Une utopie', [['Une dystopie', 'genre-utopie'], ['Un conte merveilleux', 'genre-utopie']]],
  ['Récit qui décrit une société cauchemardesque, souvent totalitaire, pour alerter le lecteur.', 'Une dystopie', [['Une utopie', 'genre-dystopie'], ['Une épopée', 'genre-dystopie']]],
  ['Récit où l’auteur raconte sa propre vie, en s’engageant à dire la vérité.', 'L’autobiographie', [['Le roman', 'genre-autobiographie'], ['La nouvelle', 'genre-autobiographie']]],
  ['Dans une fable, la leçon formulée clairement s’appelle…', 'La morale', [['La chute', 'genre-morale'], ['L’incipit', 'genre-morale']]],
  ['Les Essais de Montaigne relèvent…', 'De la littérature d’idées', [['Du roman', 'genre-essais'], ['De la poésie lyrique', 'genre-essais']]],
];

/** Une manche à classer : le bon registre et ses deux voisins, chaque erreur a sa paire. */
function classer(melanger, consigne, question, bonne, libelle) {
  const autres = CONFUSIONS[bonne];
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((cle) => ({ cle, libelle: libelle(cle) })),
    pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
    aide: `${consigne}-regle`,
  };
}

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);

  const registres = melanger(EXTRAITS).slice(0, 4)
    .map(([extrait, r]) => classer(melanger, 'registre', `« ${extrait} »`, r, (c) => REGISTRES[c][0]));

  const genres = melanger(GENRES).slice(0, 2).map(([question, bonne, faux]) => ({
    consigne: 'genre',
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: 'genre-regle',
  }));

  const [rIndice, rVisee] = melanger(Object.keys(REGISTRES));
  const indice = classer(melanger, 'indice', `Le registre ${REGISTRES[rIndice][1]} : quel indice le signale ?`, rIndice, (c) => INDICES[c]);
  const visee = classer(melanger, 'visee', `Le registre ${REGISTRES[rVisee][1]} : quel effet cherche-t-il ?`, rVisee, (c) => VISEES[c]);

  return melanger([...registres, ...genres, indice, visee]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  registre: 'Quel est le registre dominant de cet extrait ? Demande-toi quel effet il produit sur le lecteur.',
  genre: 'Une question sur les genres littéraires.',
  indice: 'À quel indice reconnaît-on ce registre ?',
  visee: 'Quel effet ce registre cherche-t-il à produire sur le lecteur ?',

  'pathetique-ou-tragique': 'Le pathétique veut émouvoir, faire pleurer sur une souffrance. Le tragique montre en plus un destin inévitable : quoi que fasse le héros, il est perdu d’avance.',
  'epique-ou-tragique': 'L’épique grandit le héros et ses exploits, avec des hyperboles et des foules en mouvement. Le tragique l’écrase sous une fatalité à laquelle il ne peut échapper.',
  'lyrique-ou-pathetique': 'Le lyrique, c’est un « je » qui exprime ses propres émotions, joie comme peine. Le pathétique veut nous faire pleurer sur la souffrance d’un autre.',
  'epique-ou-lyrique': 'Le lyrique exprime les sentiments intimes de celui qui dit « je ». L’épique raconte des exploits hors du commun, avec amplification et hyperboles.',
  'polemique-ou-satirique': 'La satire se moque, avec ironie, d’un travers de la société. La polémique attaque de front un adversaire, avec violence et sans détour.',
  'comique-ou-satirique': 'La satire fait rire aussi, mais pour dénoncer un travers de la société : le rire y est une arme. Le comique cherche d’abord à divertir.',
  'didactique-ou-polemique': 'Le didactique explique calmement pour instruire. Le polémique interpelle et attaque un adversaire.',
  'comique-ou-lyrique': 'Le comique cherche à faire rire, par le geste, les mots, le quiproquo. Le lyrique exprime les émotions intimes de celui qui dit « je ».',
  'fantastique-ou-tragique': 'Le fantastique installe un doute : un fait étrange, qu’on ne sait pas expliquer, dans un monde ordinaire. Le tragique montre un destin fatal, sans aucun mystère.',
  'fantastique-ou-pathetique': 'Le fantastique cherche l’inquiétude et le doute face à l’inexplicable ; le pathétique cherche la pitié devant une souffrance.',
  'didactique-ou-satirique': 'Le didactique transmet un savoir, sans moquerie. La satire se moque d’un travers pour le dénoncer.',

  'genre-fable': 'Récit bref, animaux, morale : c’est la fable, comme chez La Fontaine. Le conte philosophique, lui, suit les aventures d’un héros pour discuter des idées.',
  'genre-apologue': 'L’apologue est le nom commun de tous ces récits courts qui illustrent une leçon : la fable, le conte philosophique, la parabole. L’essai argumente directement, sans récit.',
  'genre-candide': 'Candide est un conte philosophique : un récit plein de péripéties, au service d’une critique, celle de l’optimisme.',
  'genre-epistolaire': 'Un roman composé de lettres échangées entre personnages est un roman épistolaire.',
  'genre-nouvelle': 'Récit bref, peu de personnages, une chute : c’est la nouvelle, comme chez Maupassant. Le roman est bien plus long.',
  'genre-tragedie': 'Des personnages de haut rang, un dilemme, une fin malheureuse : c’est la tragédie. La comédie et la farce font rire.',
  'genre-drame': 'Le drame romantique de Victor Hugo mêle le sublime et le grotesque et refuse la règle des trois unités, contrairement à la tragédie classique.',
  'genre-phedre': 'Phèdre, de Racine, est une tragédie classique : une passion coupable, une héroïne écrasée par le destin.',
  'genre-moliere': 'Le Malade imaginaire est une comédie de Molière : on y rit d’un homme obsédé par sa santé et de ses médecins.',
  'genre-ruy-blas': 'Ruy Blas est un drame romantique de Victor Hugo : un valet amoureux d’une reine, le sublime mêlé au grotesque.',
  'genre-epopee': 'L’épopée est un long poème narratif qui chante les exploits d’un héros, comme La Chanson de Roland.',
  'genre-utopie': 'Société idéale, imaginée pour critiquer la nôtre : c’est l’utopie. La dystopie en est l’inverse, une société cauchemardesque.',
  'genre-dystopie': 'Société cauchemardesque, souvent totalitaire : c’est la dystopie. L’utopie, elle, imagine une société idéale.',
  'genre-autobiographie': 'Raconter sa propre vie en promettant la vérité, c’est l’autobiographie : l’auteur, le narrateur et le personnage ne font qu’un.',
  'genre-morale': 'La leçon d’une fable s’appelle la morale. La chute est la fin inattendue d’une nouvelle ; l’incipit, le début d’un récit.',
  'genre-essais': 'Les Essais de Montaigne appartiennent à la littérature d’idées : l’auteur y réfléchit librement, sans fiction.',

  'registre-regle': 'Le registre, c’est l’effet dominant : pitié, pathétique ; destin fatal, tragique ; exploits, épique ; émotions d’un « je », lyrique ; moquerie qui dénonce, satirique ; attaque, polémique ; rire, comique ; doute, fantastique ; savoir, didactique.',
  'genre-regle': 'Regarde la forme et la visée : un récit ou une pièce, court ou long, en vers ou en prose, pour divertir ou pour argumenter.',
  'indice-regle': 'Chaque registre a ses marques : le destin pour le tragique, la souffrance pour le pathétique, l’hyperbole pour l’épique, le « je » pour le lyrique.',
  'visee-regle': 'Demande-toi ce que le texte veut faire ressentir : pitié, admiration, rire, peur, colère, ou désir d’apprendre.',
};
