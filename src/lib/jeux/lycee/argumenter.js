/**
 * ARGUMENTER — le français de 2de (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_2DE_LECT_ARGUMENTATION — « Analyser un texte de la littérature d'idées
 *                                du XVIe au XVIIIe »
 *   FR_2DE_LECT_PRESSE        — « Analyser un texte de la littérature d'idées
 *                                et de la presse du XIXe au XXIe siècle »
 *
 * QUATRE SORTES DE MANCHES (2 + 2 + 2 + 2) :
 *   - LA RELATION (2) : quel lien logique exprime le connecteur de la
 *     phrase ? Cause, conséquence, opposition, concession, addition. LES
 *     PIÈGES : cause et conséquence inversées (« car » et « donc »),
 *     opposition et concession (« tandis que » et « bien que ») ;
 *   - LE CONNECTEUR (2) : quel mot complète la phrase ? Les deux autres
 *     choix rendent la phrase absurde ou fautive, et l'erreur dit le lien
 *     qu'ils expriment, face à celui qu'il fallait ;
 *   - L'ARGUMENT (2) : d'autorité, par l'exemple, par analogie, ad hominem.
 *     LES PIÈGES : l'exemple pris pour une autorité, l'attaque de la
 *     personne prise pour un argument d'autorité ;
 *   - LA STRATÉGIE (2) : thèse adverse, concession ou réfutation.
 *
 * Volontairement écartés, parce qu'ils se rangent tantôt dans l'opposition,
 * tantôt dans la concession selon les manuels : « mais » seul, « pourtant »,
 * « cependant », « néanmoins ». Les citations d'autorité sont des faits
 * sûrs (l'Organisation mondiale de la santé, le GIEC), aucune phrase n'est
 * prêtée à un écrivain.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'argumenter', titre: 'Argumenter', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Argumenter',
    accroche: 'Connecteurs, arguments, réfutation.',
    competences: ['FR_2DE_LECT_ARGUMENTATION', 'FR_2DE_LECT_PRESSE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const RELATIONS = {
  cause: 'La cause',
  consequence: 'La conséquence',
  opposition: 'L’opposition',
  concession: 'La concession',
  addition: 'L’addition',
};

/** Les deux liens qu'on prend le plus souvent pour celui-ci. */
export const CONFUSIONS_RELATION = {
  cause: ['consequence', 'addition'],
  consequence: ['cause', 'addition'],
  opposition: ['concession', 'cause'],
  concession: ['opposition', 'consequence'],
  addition: ['cause', 'opposition'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [phrase, connecteur, relation]. Le connecteur est dans la phrase. */
export const LIENS = [
  ['Il est resté chez lui, car il était malade.', 'car', 'cause'],
  ['Puisque tu insistes, je viendrai.', 'Puisque', 'cause'],
  ['Il a réussi parce qu’il a beaucoup travaillé.', 'parce qu’', 'cause'],
  ['La récolte fut maigre : en effet, il n’avait pas plu depuis trois mois.', 'en effet', 'cause'],
  ['Le spectacle a été annulé en raison de la tempête.', 'en raison de', 'cause'],
  ['Il n’a pas révisé ; il a donc échoué.', 'donc', 'consequence'],
  ['La route était glissante, si bien que plusieurs voitures ont dérapé.', 'si bien que', 'consequence'],
  ['Les prix ont augmenté ; par conséquent, les ventes ont baissé.', 'par conséquent', 'consequence'],
  ['Il faisait très froid, c’est pourquoi l’école a fermé.', 'c’est pourquoi', 'consequence'],
  ['Paul aime la mer, tandis que sa sœur préfère la montagne.', 'tandis que', 'opposition'],
  ['La ville est bruyante ; la campagne, en revanche, est paisible.', 'en revanche', 'opposition'],
  ['Les uns applaudissaient ; les autres, au contraire, sifflaient.', 'au contraire', 'opposition'],
  ['Bien qu’il soit fatigué, il continue de courir.', 'Bien qu’', 'concession'],
  ['Même s’il pleut, nous sortirons.', 'Même s’', 'concession'],
  ['Certes, ce livre est long, mais il se lit facilement.', 'Certes… mais', 'concession'],
  ['Malgré la pluie, la fête a eu lieu.', 'Malgré', 'concession'],
  ['Quoiqu’il soit riche, il vit simplement.', 'Quoiqu’', 'concession'],
  ['Ce film est drôle ; de plus, il fait réfléchir.', 'de plus', 'addition'],
  ['Elle parle anglais ; en outre, elle comprend l’arabe.', 'en outre', 'addition'],
  ['Non seulement il chante, mais encore il compose.', 'Non seulement… mais encore', 'addition'],
];

/**
 * [phrase à trou, [bon connecteur, relation], [[connecteur à écarter, relation], …]].
 * Les connecteurs à écarter rendent la phrase absurde, ou fautive.
 */
export const TROUS = [
  ['Il a beaucoup plu, … la rivière a débordé.', ['si bien que', 'consequence'], [['car', 'cause'], ['bien que', 'concession']]],
  ['… il soit malade, il est venu travailler.', ['Bien qu’', 'concession'], [['Parce qu’', 'cause'], ['Puisqu’', 'cause']]],
  ['Il est resté au lit … il avait de la fièvre.', ['parce qu’', 'cause'], [['si bien qu’', 'consequence'], ['bien qu’', 'concession']]],
  ['Mon frère adore le cinéma ; ma sœur, …, préfère le théâtre.', ['en revanche', 'opposition'], [['par conséquent', 'consequence'], ['en effet', 'cause']]],
  ['Ce roman est passionnant ; …, il est très bien écrit.', ['de plus', 'addition'], [['en revanche', 'opposition'], ['c’est pourquoi', 'consequence']]],
  ['… la pluie, le match a eu lieu.', ['Malgré', 'concession'], [['À cause de', 'cause'], ['Grâce à', 'cause']]],
  ['Certes, l’exercice est difficile, … il reste à ta portée.', ['mais', 'concession'], [['donc', 'consequence'], ['car', 'cause']]],
  ['Il n’a pas assez dormi ; …, il s’endort en classe.', ['c’est pourquoi', 'consequence'], [['en revanche', 'opposition'], ['malgré cela', 'concession']]],
  ['Les touristes affluent l’été, … l’hiver le village est désert.', ['tandis que', 'opposition'], [['parce que', 'cause'], ['si bien que', 'consequence']]],
  ['Elle parle anglais et espagnol ; …, elle apprend le chinois.', ['en outre', 'addition'], [['par conséquent', 'consequence'], ['car', 'cause']]],
];

export const ARGUMENTS = {
  autorite: 'Un argument d’autorité',
  exemple: 'Un argument par l’exemple',
  analogie: 'Un argument par analogie',
  'ad-hominem': 'Un argument ad hominem',
};

export const CONFUSIONS_ARGUMENT = {
  autorite: ['exemple', 'ad-hominem'],
  exemple: ['autorite', 'analogie'],
  analogie: ['exemple', 'autorite'],
  'ad-hominem': ['autorite', 'analogie'],
};

/** [argument écrit pour le jeu, type]. */
export const TYPES = [
  ['Selon l’Organisation mondiale de la santé, le tabac tue jusqu’à la moitié de ceux qui en consomment.', 'autorite'],
  ['Les scientifiques du GIEC l’affirment : le climat se réchauffe sous l’effet des activités humaines.', 'autorite'],
  ['Les grands spécialistes du sommeil le reconnaissent : sans repos, la mémoire ne fixe rien.', 'autorite'],
  ['Regarde ton cousin : il a appris le piano à quarante ans, preuve qu’il n’est jamais trop tard.', 'exemple'],
  ['L’an dernier, notre lycée a rangé les téléphones pendant les cours, et l’attention s’est nettement améliorée.', 'exemple'],
  ['Marie Curie, deux fois lauréate du prix Nobel, montre qu’une femme pouvait exceller en science malgré tous les obstacles.', 'exemple'],
  ['Un esprit qu’on ne nourrit pas de lectures dépérit, comme une plante qu’on n’arrose pas.', 'analogie'],
  ['Gouverner un pays, c’est comme piloter un navire : il faut garder le cap dans la tempête.', 'analogie'],
  ['L’école est au savoir ce que le terrain d’entraînement est au sport : le lieu où l’on s’exerce avant le match.', 'analogie'],
  ['Comment croire à ses idées sur l’écologie ? Il prend l’avion tous les mois !', 'ad-hominem'],
  ['Ne l’écoutez pas : il n’a même pas son bac.', 'ad-hominem'],
  ['Ce critique n’a jamais écrit un roman : son avis ne vaut rien.', 'ad-hominem'],
];

export const STRATEGIES = {
  'these-adverse': 'La thèse adverse',
  concession: 'Une concession',
  refutation: 'Une réfutation',
};

/** [phrase écrite pour le jeu, rôle dans un texte qui défend la thèse inverse]. */
export const ROLES = [
  ['On prétend souvent que la lecture est un loisir dépassé.', 'these-adverse'],
  ['Selon certains, il faudrait interdire les voitures en ville.', 'these-adverse'],
  ['Beaucoup pensent que l’argent fait le bonheur.', 'these-adverse'],
  ['Certains affirment que les écrans abrutissent la jeunesse.', 'these-adverse'],
  ['Certes, les jeux vidéo peuvent isoler.', 'concession'],
  ['Il est vrai que l’uniforme coûte cher aux familles.', 'concession'],
  ['J’admets que cette mesure présente quelques avantages.', 'concession'],
  ['Reconnaissons-le : la ville offre plus d’emplois.', 'concession'],
  ['Mais cet argument ne tient pas : les chiffres montrent le contraire.', 'refutation'],
  ['C’est oublier que le bonheur ne s’achète pas.', 'refutation'],
  ['Cette idée est démentie par les faits.', 'refutation'],
  ['Rien ne prouve, en réalité, que l’uniforme améliore les résultats.', 'refutation'],
];

/** Une manche à classer : la bonne catégorie et ses deux voisines, chaque erreur a sa paire. */
function classer(melanger, consigne, question, bonne, confusions, noms) {
  const autres = confusions[bonne];
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((cle) => ({ cle, libelle: noms[cle] })),
    pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
    aide: `${consigne}-regle`,
  };
}

/** Les trois rôles d'une stratégie : chaque erreur a sa paire. */
const CONFUSIONS_STRATEGIE = {
  'these-adverse': ['concession', 'refutation'],
  concession: ['these-adverse', 'refutation'],
  refutation: ['concession', 'these-adverse'],
};

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);

  const relations = melanger(LIENS).slice(0, 2).map(([phrase, connecteur, relation]) => classer(
    melanger,
    'relation',
    `« ${phrase} »\n→ ${connecteur}`,
    relation,
    CONFUSIONS_RELATION,
    RELATIONS,
  ));

  const connecteurs = melanger(TROUS).slice(0, 2).map(([phrase, [bonne, lien], faux]) => ({
    consigne: 'connecteur',
    question: phrase,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map(([f, r]) => [f, paire(r, lien)])),
    aide: 'connecteur-regle',
  }));

  const types = melanger(TYPES).slice(0, 2)
    .map(([phrase, type]) => classer(melanger, 'argument', `« ${phrase} »`, type, CONFUSIONS_ARGUMENT, ARGUMENTS));

  const strategies = melanger(ROLES).slice(0, 2)
    .map(([phrase, role]) => classer(melanger, 'strategie', `« ${phrase} »`, role, CONFUSIONS_STRATEGIE, STRATEGIES));

  return melanger([...relations, ...connecteurs, ...types, ...strategies]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  relation: 'Quel lien logique ce connecteur exprime-t-il ?',
  connecteur: 'Quel connecteur complète la phrase avec le bon lien logique ?',
  argument: 'De quel type d’argument s’agit-il ?',
  strategie: 'Dans un texte qui défend l’avis contraire, quel rôle joue cette phrase ?',

  'cause-ou-consequence': 'Le piège classique : la cause explique pourquoi, elle vient avant dans les faits, avec car, parce que, puisque. La conséquence en découle, avec donc, si bien que, c’est pourquoi.',
  'addition-ou-cause': 'L’addition ajoute un argument de plus, avec de plus, en outre. La cause explique pourquoi, avec car, parce que.',
  'addition-ou-consequence': 'L’addition ajoute une idée à côté de l’autre. La conséquence montre ce qui découle de la première idée.',
  'concession-ou-opposition': 'L’opposition met deux faits face à face, avec tandis que, en revanche. La concession admet un fait, mais maintient le contraire de ce qu’on attendait, avec bien que, même si, certes… mais, malgré.',
  'cause-ou-opposition': 'L’opposition confronte deux faits contraires. La cause explique l’un par l’autre.',
  'concession-ou-consequence': 'La conséquence découle normalement du fait. La concession dit l’inverse : malgré le fait, la suite attendue ne se produit pas.',
  'addition-ou-opposition': 'L’addition ajoute un élément qui va dans le même sens. L’opposition en met un en face, qui va en sens contraire.',
  'cause-ou-concession': 'La concession admet un fait qui aurait dû empêcher la suite, avec bien que, malgré. La cause explique la suite, avec parce que, car.',
  'consequence-ou-opposition': 'La conséquence montre ce qui découle d’un fait, avec donc, c’est pourquoi. L’opposition met en face un fait contraire, avec en revanche, tandis que.',
  'addition-ou-concession': 'L’addition ajoute un élément dans le même sens. La concession admet un obstacle, mais maintient la suite, avec bien que, malgré.',

  'autorite-ou-exemple': 'L’argument d’autorité s’appuie sur la parole d’une personne ou d’une institution reconnue. L’argument par l’exemple s’appuie sur un cas précis, un fait, une personne dont on raconte l’histoire.',
  'ad-hominem-ou-autorite': 'L’argument d’autorité s’appuie sur une voix reconnue pour soutenir une idée. L’argument ad hominem attaque la personne au lieu de discuter son idée : il disqualifie l’adversaire.',
  'analogie-ou-exemple': 'L’analogie compare la situation à une autre, d’un domaine différent : la plante, le navire. L’exemple cite un cas réel du même domaine.',
  'analogie-ou-autorite': 'L’analogie raisonne par comparaison avec un autre domaine. L’argument d’autorité s’appuie sur la parole d’une voix reconnue.',
  'ad-hominem-ou-analogie': 'L’argument ad hominem s’en prend à la personne, pas à son idée. L’analogie éclaire une idée par une comparaison.',

  'concession-ou-these-adverse': 'La thèse adverse est l’avis de l’autre camp, souvent introduit par « on prétend », « certains pensent ». La concession, c’est l’auteur qui accorde un point à l’adversaire, avec « certes » ou « il est vrai que », avant de le dépasser.',
  'refutation-ou-these-adverse': 'La thèse adverse expose l’avis de l’autre camp. La réfutation le rejette, preuves à l’appui : « c’est oublier que », « cette idée ne tient pas ».',
  'concession-ou-refutation': 'La concession accorde un point à l’adversaire, avec « certes » ou « j’admets ». La réfutation, au contraire, rejette son idée.',

  'relation-regle': 'Repère le connecteur et demande-toi ce qu’il relie : une raison, un résultat, deux faits opposés, un obstacle surmonté, ou un ajout.',
  'connecteur-regle': 'Lis la phrase entière, trouve le lien entre ses deux parties, puis choisis le connecteur qui l’exprime.',
  'argument-regle': 'Autorité : une voix reconnue. Exemple : un cas précis. Analogie : une comparaison avec un autre domaine. Ad hominem : une attaque contre la personne.',
  'strategie-regle': 'Thèse adverse : l’avis du camp d’en face. Concession : on lui accorde un point. Réfutation : on rejette son idée.',
};
