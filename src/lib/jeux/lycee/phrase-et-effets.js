/**
 * LA PHRASE ET SES EFFETS — le français de 2de (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_2DE_LANG_SYNTAXE       — « Analyser la syntaxe d'une phrase pour en
 *                                tirer un effet de sens »
 *   FR_2DE_LANG_INTERROGATION — « Analyser les formes et les valeurs de
 *                                l'interrogation »
 *
 * QUATRE SORTES DE MANCHES (4 + 2 + 1 + 1) :
 *   - LE PROCÉDÉ (4) : phrase nominale, longue période, juxtaposition
 *     (asyndète), inversion du sujet, mise en relief (« c'est… qui »), rythme
 *     ternaire, question rhétorique. Les deux autres choix sont les voisins
 *     qu'on confond (CONFUSIONS), chaque paire a sa phrase. LES PIÈGES : un
 *     complément en tête pris pour une inversion dans une phrase sans verbe,
 *     l'inversion prise pour une mise en relief, la juxtaposition de quatre
 *     membres prise pour un rythme ternaire ;
 *   - L'EFFET (2) : le procédé est nommé, quel effet produit-il ? LES
 *     PIÈGES : l'effet inverse (la juxtaposition qui « ralentit »), la
 *     question rhétorique prise pour une vraie demande ;
 *   - LA FORME DE L'INTERROGATION (1) : totale, partielle ou indirecte ;
 *   - SA VALEUR (1) : vraie demande, ordre poli, reproche, affirmation
 *     déguisée.
 *
 * Phrases écrites pour le jeu, relues : une juxtaposition proposée à côté du
 * rythme ternaire n'a jamais trois membres, une phrase nominale n'a aucun
 * verbe conjugué, une question rhétorique ne contient pas « c'est ».
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'phrase-et-effets', titre: 'La phrase et ses effets', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'La phrase et ses effets',
    accroche: 'Ce que la syntaxe fait au sens.',
    competences: ['FR_2DE_LANG_SYNTAXE', 'FR_2DE_LANG_INTERROGATION'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const PROCEDES = {
  'phrase-nominale': 'Une phrase nominale',
  periode: 'Une longue période',
  asyndete: 'Une juxtaposition (asyndète)',
  inversion: 'Une inversion du sujet',
  'mise-en-relief': 'Une mise en relief',
  'rythme-ternaire': 'Un rythme ternaire',
  'interrogation-rhetorique': 'Une question rhétorique',
};

/** Les deux procédés qu'on prend le plus souvent pour celui-ci. */
export const CONFUSIONS = {
  'phrase-nominale': ['inversion', 'mise-en-relief'],
  periode: ['asyndete', 'phrase-nominale'],
  asyndete: ['rythme-ternaire', 'periode'],
  inversion: ['mise-en-relief', 'phrase-nominale'],
  'mise-en-relief': ['inversion', 'interrogation-rhetorique'],
  'rythme-ternaire': ['asyndete', 'periode'],
  'interrogation-rhetorique': ['mise-en-relief', 'phrase-nominale'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [phrase écrite pour le jeu, procédé]. */
export const EXEMPLES = [
  ['Soudain, un cri dans la nuit.', 'phrase-nominale'],
  ['Au bout du chemin, la mer.', 'phrase-nominale'],
  ['Quelle étrange soirée !', 'phrase-nominale'],
  ['Personne dans la rue. Pas un bruit.', 'phrase-nominale'],
  ['Silence absolu dans la salle d’examen.', 'phrase-nominale'],

  ['Lorsque, après tant d’années passées loin de la maison où il avait grandi, il aperçut enfin, au détour du chemin bordé de peupliers, le toit que sa mère avait tant aimé, il sentit son cœur se serrer.', 'periode'],
  ['Si l’on voulait comprendre pourquoi cette ville, autrefois si fière de ses ateliers et de son port, s’était peu à peu vidée de ses habitants, il faudrait remonter aux années où les premières usines fermèrent leurs portes.', 'periode'],
  ['Quand le soir tombait sur la plaine et que les derniers oiseaux regagnaient les haies, le vieil homme, qui n’avait pas quitté son banc depuis le matin, se levait enfin pour rentrer.', 'periode'],

  ['Il entra, s’assit, prit la plume, écrivit.', 'asyndete'],
  ['Le vent tombe, la mer se calme.', 'asyndete'],
  ['Les portes claquent, les enfants crient, les chiens aboient, la maison s’éveille.', 'asyndete'],
  ['Il pleuvait, nous sommes restés.', 'asyndete'],

  ['Sur la colline s’élevait un vieux château.', 'inversion'],
  ['Au loin résonnait la cloche du village.', 'inversion'],
  ['Dans le silence de la nuit passa une ombre.', 'inversion'],
  ['Alors commença la longue attente.', 'inversion'],

  ['C’est toi qui as raison.', 'mise-en-relief'],
  ['C’est la peur qui le fait fuir.', 'mise-en-relief'],
  ['Ce que je veux, c’est la vérité.', 'mise-en-relief'],
  ['C’est à Paris qu’il a tout appris.', 'mise-en-relief'],

  ['Il était beau, riche et cruel.', 'rythme-ternaire'],
  ['Il faut lire, comprendre et retenir.', 'rythme-ternaire'],
  ['Elle aimait la mer, le vent et les longues marches.', 'rythme-ternaire'],
  ['Le jardin était calme, fleuri et silencieux.', 'rythme-ternaire'],

  ['Qui n’a jamais rêvé de partir ?', 'interrogation-rhetorique'],
  ['Peut-on accepter qu’un enfant ait faim ?', 'interrogation-rhetorique'],
  ['La guerre a-t-elle jamais rendu un peuple heureux ?', 'interrogation-rhetorique'],
  ['Faut-il rappeler tout ce que nous lui devons ?', 'interrogation-rhetorique'],
];

/**
 * [phrase, procédé, bon effet, [deux effets à écarter], phrase de l'erreur].
 * Des phrases à part : aucune n'est dans EXEMPLES.
 */
export const EFFETS = [
  ['Soudain, un coup de feu.', 'phrase-nominale', 'Créer une surprise brutale', ['Ralentir le récit', 'Exprimer un doute'], 'effet-phrase-nominale'],
  ['Devant nous, immense, la forêt.', 'phrase-nominale', 'Isoler une image, comme une découverte', ['Raconter une longue action', 'Poser une question'], 'effet-phrase-nominale'],
  ['Je suis venu, j’ai vu, j’ai vaincu.', 'asyndete', 'Traduire la rapidité de l’action', ['Marquer une hésitation', 'Ralentir le rythme'], 'effet-asyndete'],
  ['On crie, on court, on se bouscule, on s’enfuit.', 'asyndete', 'Rendre la panique, sans pause', ['Expliquer les causes de la panique', 'Ralentir la scène'], 'effet-asyndete'],
  ['C’est toi que j’accuse.', 'mise-en-relief', 'Insister sur la personne accusée', ['Atténuer l’accusation', 'Poser une vraie question'], 'effet-mise-en-relief'],
  ['Ce qui compte, c’est le courage.', 'mise-en-relief', 'Détacher l’essentiel pour y insister', ['Énumérer plusieurs qualités', 'Atténuer le propos'], 'effet-mise-en-relief'],
  ['Qui pourrait rester insensible à tant de souffrance ?', 'interrogation-rhetorique', 'Faire admettre une évidence au lecteur', ['Demander une information', 'Avouer une ignorance'], 'effet-interrogation-rhetorique'],
  ['Faut-il encore attendre que la forêt brûle ?', 'interrogation-rhetorique', 'Pousser le lecteur à répondre : non', ['Demander un délai précis', 'Avouer une ignorance'], 'effet-interrogation-rhetorique'],
  ['Il faut apprendre, comprendre et transmettre.', 'rythme-ternaire', 'Donner à la phrase ampleur et équilibre', ['Créer une rupture brutale', 'Exprimer un doute'], 'effet-rythme-ternaire'],
  ['Sur la plaine déserte s’avançait une armée.', 'inversion', 'Retarder le sujet pour le mettre en valeur', ['Poser une question', 'Donner un ordre'], 'effet-inversion'],
  ['Lorsque enfin, après des heures de marche dans la neige et le vent, il atteignit le refuge où l’attendaient ses compagnons, il s’effondra de fatigue.', 'periode', 'Faire attendre le dénouement de la phrase', ['Créer un effet de rapidité', 'Isoler un mot bref'], 'effet-periode'],
];

export const FORMES = { totale: 'Totale', partielle: 'Partielle', indirecte: 'Indirecte' };

/** [phrase, forme de l'interrogation]. */
export const INTERROGATIONS = [
  ['Viendras-tu demain ?', 'totale'],
  ['Est-ce que tu as fini ton devoir ?', 'totale'],
  ['Tu viens avec nous ?', 'totale'],
  ['Le train est-il déjà parti ?', 'totale'],
  ['Où vas-tu si tôt ?', 'partielle'],
  ['Qui a pris mon livre ?', 'partielle'],
  ['Pourquoi ris-tu ?', 'partielle'],
  ['Quand partirons-nous ?', 'partielle'],
  ['Combien coûte ce billet ?', 'partielle'],
  ['Je me demande s’il viendra.', 'indirecte'],
  ['Dis-moi pourquoi tu pleures.', 'indirecte'],
  ['Il ignore quand le train partira.', 'indirecte'],
  ['J’aimerais savoir qui a écrit cette lettre.', 'indirecte'],
];

/** La phrase de l'erreur : [forme juste][forme choisie]. */
const ERREURS_FORME = {
  totale: { partielle: 'interro-totale', indirecte: 'interro-directe' },
  partielle: { totale: 'interro-partielle', indirecte: 'interro-directe' },
  indirecte: { totale: 'interro-indirecte', partielle: 'interro-indirecte' },
};

const INFO = 'Une vraie demande d’information';
const ORDRE = 'Un ordre poli';
const REPROCHE = 'Un reproche';

/** [question, valeur juste, [[valeur à écarter, phrase de l'erreur], …]]. */
export const VALEURS = [
  ['Quelle heure est-il, s’il te plaît ?', INFO, [[ORDRE, 'valeur-info'], [REPROCHE, 'valeur-info']]],
  ['À quelle heure ouvre la bibliothèque ?', INFO, [[ORDRE, 'valeur-info'], [REPROCHE, 'valeur-info']]],
  ['Pourriez-vous fermer la fenêtre ?', ORDRE, [['Une question sur ses capacités', 'valeur-ordre'], [REPROCHE, 'valeur-ordre']]],
  ['Pouvez-vous me passer le sel ?', ORDRE, [['Une question sur ses capacités', 'valeur-ordre'], [REPROCHE, 'valeur-ordre']]],
  ['Voulez-vous bien vous asseoir ?', ORDRE, [[INFO, 'valeur-ordre'], [REPROCHE, 'valeur-ordre']]],
  ['Combien de fois faudra-t-il te le répéter ?', REPROCHE, [[INFO, 'valeur-reproche'], [ORDRE, 'valeur-reproche']]],
  ['N’avez-vous donc aucune honte ?', REPROCHE, [[INFO, 'valeur-reproche'], [ORDRE, 'valeur-reproche']]],
  ['Qui ne voudrait pas vivre en paix ?', 'Une affirmation déguisée : tout le monde', [[INFO, 'valeur-rhetorique'], [ORDRE, 'valeur-rhetorique']]],
  ['Qui peut croire à de tels mensonges ?', 'Une affirmation déguisée : personne', [[INFO, 'valeur-rhetorique'], [ORDRE, 'valeur-rhetorique']]],
];

/** Une manche à classer : le bon procédé et ses deux voisins, chaque erreur a sa paire. */
function classer(melanger, consigne, question, bonne) {
  const autres = CONFUSIONS[bonne];
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((cle) => ({ cle, libelle: PROCEDES[cle] })),
    pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
    aide: `${consigne}-regle`,
  };
}

const libres = (melanger, bonne, faux) => melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c }));

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);

  const procedes = melanger(EXEMPLES).slice(0, 4)
    .map(([phrase, procede]) => classer(melanger, 'procede', `« ${phrase} »`, procede));

  const effets = melanger(EFFETS).slice(0, 2).map(([phrase, procede, bonne, faux, erreur]) => ({
    consigne: 'effet',
    question: `« ${phrase} »\n${PROCEDES[procede]} : quel effet ?`,
    bonne,
    choix: libres(melanger, bonne, faux.map((f) => [f])),
    pieges: Object.fromEntries(faux.map((f) => [f, erreur])),
    aide: 'effet-regle',
  }));

  const formes = melanger(INTERROGATIONS).slice(0, 1).map(([phrase, forme]) => ({
    consigne: 'forme',
    question: `« ${phrase} »`,
    bonne: forme,
    choix: Object.entries(FORMES).map(([cle, libelle]) => ({ cle, libelle })),
    pieges: ERREURS_FORME[forme],
    aide: 'forme-regle',
  }));

  const valeurs = melanger(VALEURS).slice(0, 1).map(([phrase, bonne, faux]) => ({
    consigne: 'valeur',
    question: `« ${phrase} »`,
    bonne,
    choix: libres(melanger, bonne, faux),
    pieges: Object.fromEntries(faux),
    aide: 'valeur-regle',
  }));

  return melanger([...procedes, ...effets, ...formes, ...valeurs]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  procede: 'Quel procédé reconnais-tu dans la construction de cette phrase ?',
  effet: 'Le procédé est nommé : quel effet produit-il ici ?',
  forme: 'Cette interrogation est-elle totale, partielle ou indirecte ?',
  valeur: 'Que fait vraiment cette question ?',

  'inversion-ou-phrase-nominale': 'Cherche le verbe conjugué. S’il n’y en a pas, c’est une phrase nominale. L’inversion suppose un sujet placé après son verbe.',
  'mise-en-relief-ou-phrase-nominale': 'Une phrase nominale n’a pas de verbe conjugué. La mise en relief encadre un mot par « c’est… qui » ou « c’est… que » pour le détacher.',
  'asyndete-ou-periode': 'La juxtaposition aligne des propositions courtes, sans mot de liaison. La longue période déploie une seule phrase ample, avec des subordonnées qui retardent sa fin.',
  'periode-ou-phrase-nominale': 'Une phrase nominale est brève et n’a pas de verbe conjugué. La longue période est une phrase ample, avec plusieurs propositions qui s’emboîtent.',
  'periode-ou-rythme-ternaire': 'Le rythme ternaire groupe trois éléments de même nature. La longue période est une phrase ample, qui retarde sa fin par des subordonnées.',
  'asyndete-ou-rythme-ternaire': 'Compte les membres. Le rythme ternaire en groupe exactement trois, souvent liés par « et ». La juxtaposition aligne des propositions sans mot de liaison, deux, quatre ou plus.',
  'inversion-ou-mise-en-relief': 'La mise en relief détache un mot par « c’est… qui » ou par un déplacement suivi d’une reprise. L’inversion place simplement le sujet après le verbe.',
  'interrogation-rhetorique-ou-mise-en-relief': 'Un point d’interrogation sans attente de réponse : c’est une question rhétorique. La mise en relief, elle, encadre un mot par « c’est… qui ».',
  'interrogation-rhetorique-ou-phrase-nominale': 'La phrase a un verbe conjugué et un point d’interrogation : c’est une question, et la réponse va de soi. C’est une question rhétorique.',

  'effet-phrase-nominale': 'Sans verbe, la phrase nominale frappe d’un coup : elle saisit l’instant ou isole une image, sans rien raconter.',
  'effet-asyndete': 'Sans mots de liaison, les actions s’enchaînent sans pause : la juxtaposition accélère le rythme.',
  'effet-mise-en-relief': 'Le tour « c’est… que » détache un élément pour y insister : il renforce le propos, il ne l’atténue pas.',
  'effet-interrogation-rhetorique': 'Une question rhétorique n’attend pas de réponse : la réponse va de soi, et le lecteur est amené à l’admettre.',
  'effet-rythme-ternaire': 'Trois éléments de même nature donnent à la phrase un mouvement ample et équilibré, une impression de complétude.',
  'effet-inversion': 'Le sujet arrive après le verbe, à la fin : l’inversion le fait attendre et le met en valeur.',
  'effet-periode': 'La longue période retarde sa fin par des subordonnées : le lecteur attend, avec le personnage, le dénouement de la phrase.',

  'interro-totale': 'On peut y répondre par oui ou par non : l’interrogation porte sur toute la phrase, elle est totale.',
  'interro-partielle': 'Un mot interrogatif, qui, où, quand, pourquoi, combien, fait porter la question sur une partie de la phrase : elle est partielle.',
  'interro-directe': 'La question est posée directement, avec un point d’interrogation : elle est directe, pas indirecte.',
  'interro-indirecte': 'Pas de point d’interrogation, une subordonnée après un verbe comme demander, savoir, ignorer : c’est une interrogation indirecte.',

  'valeur-info': 'Ici, celui qui parle ignore vraiment la réponse et la demande : c’est une vraie demande d’information.',
  'valeur-ordre': 'Personne ne demande si l’autre en est capable : la question sert à demander poliment d’agir. C’est un ordre atténué.',
  'valeur-reproche': 'La question n’attend pas de réponse : elle exprime l’agacement ou l’indignation. C’est un reproche.',
  'valeur-rhetorique': 'La réponse va de soi : la question est une affirmation déguisée, qui oblige le lecteur à l’admettre.',

  'procede-regle': 'Observe la construction : un verbe ou non, l’ordre sujet verbe, le nombre de membres, les mots de liaison, la ponctuation.',
  'effet-regle': 'Un procédé de syntaxe agit sur le rythme et sur l’attention : accélérer, ralentir, surprendre, insister, faire réagir.',
  'forme-regle': 'Totale : on répond par oui ou par non. Partielle : un mot interrogatif. Indirecte : une subordonnée, sans point d’interrogation.',
  'valeur-regle': 'Une question ne demande pas toujours une information : elle peut ordonner poliment, reprocher, ou affirmer une évidence.',
};
