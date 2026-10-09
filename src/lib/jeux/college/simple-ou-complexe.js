/**
 * SIMPLE OU COMPLEXE ? — la phrase au collège, de la 6e à la 4e.
 * Professeur : Adrien (français).
 *
 * Prolonge le jeu du CM2 (`phrasesCM2.js`). Phrases écrites à la main ; le
 * nombre de verbes conjugués de chacune est compté à la main et relu.
 *
 * 6e — PHRASE SIMPLE, PHRASE COMPLEXE (3 + 3 + 2) :
 *   - SIMPLE OU COMPLEXE ? (3) : on compte les verbes conjugués. Pièges : la
 *     phrase longue, l'infinitif, le participe, le temps composé compté deux
 *     fois ;
 *   - COMBIEN DE VERBES CONJUGUÉS ? (3) ;
 *   - LAQUELLE EST COMPLEXE ? (2) : une complexe parmi deux simples piégées.
 *   On évite les propositions participiales (« Le spectacle terminé, … ») et
 *   infinitives, que certaines grammaires comptent comme des propositions.
 *
 * 5e — JUXTAPOSITION, COORDINATION, SUBORDINATION (3 + 3 + 2) :
 *   - COMMENT SONT-ELLES RELIÉES ? (3) : « car » coordonne, « parce que »
 *     subordonne — même sens, autre lien ;
 *   - RELIE-LES AINSI (3) : choisir la version juxtaposée, coordonnée ou
 *     subordonnée de deux mêmes propositions ;
 *   - QUEL EST CE MOT ? (2) : conjonction de coordination, de subordination,
 *     ou pronom relatif. LE PIÈGE : « que », relatif ou conjonction.
 *   On écarte « puis », « alors », « ensuite » : adverbes que les manuels ne
 *   rangent pas tous du même côté.
 *
 * 4e — L'INTERROGATION ET LA NÉGATION (3 + 2 + 3) :
 *   - QUELLE FORME INTERROGATIVE ? (3) : intonation, « est-ce que », inversion ;
 *   - L'INVERSION BIEN ÉCRITE (2) : le t entre deux traits d'union, le sujet
 *     nom repris par un pronom, le pronom après l'auxiliaire ;
 *   - LA NÉGATION BIEN ÉCRITE (3) : sans oublier « ne », sans « pas » de trop,
 *     à la bonne place.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'simple-ou-complexe', titre: 'Simple ou complexe ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Simple ou complexe ?',
    accroche: 'Compte les verbes conjugués.',
    competences: ['FR_6E_LANG_PHRASE'],
  },
  CINQUIEME: {
    titre: 'Simple ou complexe ?',
    accroche: 'Juxtaposées, coordonnées, subordonnées.',
    competences: ['FR_5E_LANG_PROPOSITIONS'],
  },
  QUATRIEME: {
    titre: 'Simple ou complexe ?',
    accroche: 'Poser une question, dire non.',
    competences: ['FR_4E_LANG_INTERROGATIVE', 'FR_4E_LANG_NEGATION'],
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

/** [phrase simple, le piège qu'elle tend]. */
export const SIMPLES_6E = [
  ['Le vieux pêcheur du village répare ses filets sur le port chaque matin.', 'longue'],
  ['Pendant les vacances de printemps, mes cousins de Lyon viennent chez nous.', 'longue'],
  ['Au fond du jardin, sous un vieux pommier, dort un gros chat roux.', 'longue'],
  ['Lucas veut apprendre la guitare.', 'infinitif'],
  ['Nous aimons nager et courir.', 'infinitif'],
  ['Elle commence à comprendre la leçon.', 'infinitif'],
  ['Fatigué par la course, le coureur s’assoit.', 'participe'],
  ['Ils regardent le film en mangeant du pop-corn.', 'participe'],
  ['Le loup, affamé, rôde autour de la ferme.', 'participe'],
  ['Les élèves sont sortis de la classe en silence.', 'compose'],
  ['Mon frère a fini ses devoirs avant le dîner.', 'compose'],
];

/** Des phrases complexes : au moins deux verbes conjugués. */
export const COMPLEXES_6E = [
  'Je lis pendant que tu dors.',
  'Il pleut, nous restons.',
  'Le chien que j’ai adopté s’appelle Max.',
  'Il crie mais personne ne l’entend.',
  'Elle sait que tu mens.',
  'Quand le soleil se couche, les chouettes sortent.',
  'Le train part et les voyageurs saluent.',
  'Si tu veux, nous partirons demain.',
  'Tom rit car il est content.',
];

/** [phrase, nombre de verbes conjugués, le piège qui fait compter trop]. */
export const COMPTER_6E = [
  ['Elle veut partir quand il arrive.', 2, 'infinitif'],
  ['Nous avons mangé, puis nous sommes sortis.', 2, 'compose'],
  ['Le garçon qui court vite gagne la course.', 2, null],
  ['J’entends les oiseaux dans le jardin.', 1, null],
  ['Il a ouvert la porte, il a regardé dehors et il a souri.', 3, 'compose'],
  ['Pierre lit, Marie dessine, Paul joue.', 3, null],
  ['En sortant de l’école, Léa a croisé son ami.', 1, 'participe'],
  ['Je pense que tu as raison.', 2, null],
  ['Le loup, affamé, sortit du bois.', 1, 'participe'],
  ['Quand il fait froid, nous allumons le feu et nous lisons.', 3, null],
  ['Ils doivent finir avant de partir.', 1, 'infinitif'],
  ['Le livre que tu m’as prêté est passionnant.', 2, 'compose'],
];

const COURTE = 45;
const NOM_PHRASE = { simple: 'Phrase simple', complexe: 'Phrase complexe' };

function sixieme({ melanger, entre }) {
  const liste = [];
  // Les phrases courtes servent d'abord à « laquelle est complexe ? », pour
  // qu'aucune phrase ne revienne deux fois dans la même partie.
  const simplesCourtes = melanger(SIMPLES_6E.filter(([p]) => p.length <= COURTE)).slice(0, 4);
  const complexesCourtes = melanger(COMPLEXES_6E.filter((p) => p.length <= COURTE)).slice(0, 2);
  const simples = melanger(SIMPLES_6E.filter((s) => !simplesCourtes.includes(s)));
  const complexes = melanger(COMPLEXES_6E.filter((p) => !complexesCourtes.includes(p)));

  // Une ou deux simples, le reste complexe : la réponse ne se devine pas.
  const nbSimples = entre(1, 2);
  const aClasser = [
    ...simples.slice(0, nbSimples).map(([phrase, piege]) => [phrase, piege, 'simple']),
    ...complexes.slice(0, 3 - nbSimples).map((phrase) => [phrase, null, 'complexe']),
  ];
  aClasser.forEach(([phrase, piege, bonne]) => {
    liste.push({
      consigne: 'simple-complexe-6e',
      question: phrase,
      bonne,
      choix: ['simple', 'complexe'].map((c) => ({ cle: c, libelle: NOM_PHRASE[c] })),
      pieges: bonne === 'simple' ? { complexe: `compter-${piege}` } : { simple: 'compter-complexe' },
    });
  });

  melanger(COMPTER_6E).slice(0, 3).forEach(([phrase, n, piege]) => {
    const nombres = n === 3 ? [2, 3, 4] : [1, 2, 3];
    const pieges = {};
    nombres.filter((k) => k !== n).forEach((k) => {
      pieges[String(k)] = k > n ? (piege ? `compter-${piege}` : 'compter-surplus') : 'compter-oubli';
    });
    liste.push({
      consigne: 'compter-6e',
      question: phrase,
      bonne: String(n),
      choix: nombres.map((k) => ({ cle: String(k), libelle: String(k) })),
      pieges,
    });
  });

  for (let i = 0; i < 2; i += 1) {
    const bonne = complexesCourtes[i];
    const [a, b] = [simplesCourtes[2 * i], simplesCourtes[2 * i + 1]];
    liste.push(depuisBanque(melanger, 'laquelle-6e', [
      'Une seule de ces phrases est complexe :', bonne,
      [a[0], `compter-${a[1]}`], [b[0], `compter-${b[1]}`],
    ]));
  }
  return melanger(liste);
}

// ------------------------------------------------------------------ 5e

/** [phrase, le lien entre ses propositions]. */
export const LIENS_5E = [
  ['Le vent souffle, la pluie tombe.', 'juxtaposition'],
  ['Il est tard ; je rentre chez moi.', 'juxtaposition'],
  ['Je suis venu, j’ai vu, j’ai vaincu.', 'juxtaposition'],
  ['Elle sourit : elle a compris.', 'juxtaposition'],
  ['Le chat dort, le chien veille.', 'juxtaposition'],
  ['Nous sortons, il fait beau.', 'juxtaposition'],
  ['Je voulais venir, mais j’étais malade.', 'coordination'],
  ['Il reste à la maison car il est malade.', 'coordination'],
  ['Tu viens ou tu restes ?', 'coordination'],
  ['Il a travaillé, donc il a réussi.', 'coordination'],
  ['Le chat dort et le chien veille.', 'coordination'],
  ['Il reste à la maison parce qu’il est malade.', 'subordination'],
  ['Je pense que tu as raison.', 'subordination'],
  ['Quand la nuit tombe, les étoiles brillent.', 'subordination'],
  ['Le livre que je lis est passionnant.', 'subordination'],
  ['Si tu travailles, tu réussiras.', 'subordination'],
  ['Elle chante pendant qu’il joue du piano.', 'subordination'],
  ['Bien qu’il pleuve, nous sortons.', 'subordination'],
];
const NOM_LIENS = { juxtaposition: 'Juxtaposition', coordination: 'Coordination', subordination: 'Subordination' };

/** [juxtaposées, coordonnées, subordonnées] : les mêmes propositions, trois liens. */
export const RELIER_5E = [
  ['Il pleut, je reste.', 'Il pleut, donc je reste.', 'Je reste parce qu’il pleut.'],
  ['Elle est fatiguée, elle se couche.', 'Elle est fatiguée, donc elle se couche.', 'Elle se couche parce qu’elle est fatiguée.'],
  ['Le réveil sonne, je me lève.', 'Le réveil sonne et je me lève.', 'Je me lève quand le réveil sonne.'],
  ['Il a couru, il est arrivé en retard.', 'Il a couru, mais il est arrivé en retard.', 'Bien qu’il ait couru, il est arrivé en retard.'],
  ['Tu travailles, tu progresses.', 'Tu travailles, donc tu progresses.', 'Si tu travailles, tu progresses.'],
  ['Le soleil se lève, les oiseaux chantent.', 'Le soleil se lève et les oiseaux chantent.', 'Les oiseaux chantent quand le soleil se lève.'],
  ['J’ai faim, je mange une pomme.', 'J’ai faim, donc je mange une pomme.', 'Je mange une pomme parce que j’ai faim.'],
  ['Nous avons gagné, nous sommes heureux.', 'Nous avons gagné, donc nous sommes heureux.', 'Nous sommes heureux parce que nous avons gagné.'],
  ['Il fait froid, il a mis son écharpe.', 'Il a mis son écharpe car il fait froid.', 'Il a mis son écharpe parce qu’il fait froid.'],
];
const LIENS = ['juxtaposition', 'coordination', 'subordination'];

/** [phrase, le mot entre crochets : sa nature]. */
export const MOTS_5E = [
  ['Il reste chez lui [car] il est malade.', 'coordination'],
  ['Je voulais venir, [mais] j’étais malade.', 'coordination'],
  ['Il a travaillé, [donc] il a réussi.', 'coordination'],
  ['Tu viens [ou] tu restes ?', 'coordination'],
  ['Il reste chez lui [parce qu’]il est malade.', 'subordination'],
  ['[Quand] la nuit tombe, les étoiles brillent.', 'subordination'],
  ['[Puisque] tu insistes, je viens.', 'subordination'],
  ['[Si] tu veux, nous partirons.', 'subordination'],
  ['Je sais [que] tu viens.', 'subordination'],
  ['Elle pense [que] tu as raison.', 'subordination'],
  ['Le film [que] je regarde est drôle.', 'relatif'],
  ['Le livre [que] tu lis est à moi.', 'relatif'],
  ['La fille [qui] chante est ma sœur.', 'relatif'],
  ['Le chien [dont] je parle est à moi.', 'relatif'],
];
const NOM_MOTS = {
  coordination: 'Conjonction de coordination',
  subordination: 'Conjonction de subordination',
  relatif: 'Pronom relatif',
};

function cinquieme({ melanger }) {
  const liste = [];
  melanger(LIENS_5E).slice(0, 3).forEach(([phrase, bonne]) => {
    liste.push(classement('lien-5e', phrase, bonne, LIENS, NOM_LIENS, 'lien'));
  });
  const cibles = melanger([...LIENS]);
  melanger(RELIER_5E).slice(0, 3).forEach((versions, i) => {
    const cible = cibles[i];
    const bonne = versions[LIENS.indexOf(cible)];
    const faux = LIENS.filter((l) => l !== cible).map((l) => [versions[LIENS.indexOf(l)], `lien-${cible}`]);
    liste.push(depuisBanque(melanger, `relier-${cible}-5e`, ['Les deux propositions, reliées ainsi :', bonne, ...faux]));
  });
  melanger(MOTS_5E).slice(0, 2).forEach(([phrase, bonne]) => {
    liste.push(classement('mot-5e', phrase, bonne, ['coordination', 'subordination', 'relatif'], NOM_MOTS, 'mot'));
  });
  return melanger(liste);
}

// ------------------------------------------------------------------ 4e

/** [question, sa forme]. */
export const INTERROGATIVES_4E = [
  ['Tu viens ce soir ?', 'intonation'],
  ['Ton frère part demain ?', 'intonation'],
  ['Vous avez fini vos devoirs ?', 'intonation'],
  ['Vous habitez où ?', 'intonation'],
  ['Elle t’a appelé hier ?', 'intonation'],
  ['Est-ce que tu viens ce soir ?', 'est-ce-que'],
  ['Où est-ce que vous habitez ?', 'est-ce-que'],
  ['Pourquoi est-ce qu’elle pleure ?', 'est-ce-que'],
  ['Est-ce que ton chien mord ?', 'est-ce-que'],
  ['Viens-tu ce soir ?', 'inversion'],
  ['Ton frère part-il demain ?', 'inversion'],
  ['Où habitez-vous ?', 'inversion'],
  ['A-t-il compris la consigne ?', 'inversion'],
  ['Quand partons-nous ?', 'inversion'],
];
const FORMES = ['intonation', 'est-ce-que', 'inversion'];
const NOM_FORMES = { intonation: 'Intonation', 'est-ce-que': '« Est-ce que »', inversion: 'Inversion du sujet' };

export const INVERSIONS_4E = [
  ['Est-ce qu’il a mangé ?', 'A-t-il mangé ?', ['A-il mangé ?', 't-euphonique'], ['A mangé-t-il ?', 'inversion-auxiliaire']],
  ['Est-ce qu’elle va au cinéma ?', 'Va-t-elle au cinéma ?', ['Va-elle au cinéma ?', 't-euphonique'], ['Va-t’elle au cinéma ?', 't-apostrophe']],
  ['Est-ce que vous avez fini ?', 'Avez-vous fini ?', ['Avez vous fini ?', 'trait-union'], ['Avez-t-vous fini ?', 't-inutile']],
  ['Est-ce qu’il viendra demain ?', 'Viendra-t-il demain ?', ['Viendra-il demain ?', 't-euphonique'], ['Viendra-t’il demain ?', 't-apostrophe']],
  ['Est-ce que tu prends le bus ?', 'Prends-tu le bus ?', ['Prends tu le bus ?', 'trait-union'], ['Prends-t-tu le bus ?', 't-inutile']],
  ['Est-ce que Paul aime le sport ?', 'Paul aime-t-il le sport ?', ['Aime Paul le sport ?', 'inversion-nom'], ['Paul aime-il le sport ?', 't-euphonique']],
  ['Est-ce que tes parents sont partis ?', 'Tes parents sont-ils partis ?', ['Sont partis tes parents ?', 'inversion-nom'], ['Tes parents sont-t-ils partis ?', 't-inutile']],
  ['Est-ce qu’on part bientôt ?', 'Part-on bientôt ?', ['Part-t-on bientôt ?', 't-inutile'], ['Part on bientôt ?', 'trait-union']],
  ['Est-ce qu’elle a compris ?', 'A-t-elle compris ?', ['A-elle compris ?', 't-euphonique'], ['A compris-t-elle ?', 'inversion-auxiliaire']],
  ['Est-ce que ta sœur chante bien ?', 'Ta sœur chante-t-elle bien ?', ['Chante ta sœur bien ?', 'inversion-nom'], ['Ta sœur chante-elle bien ?', 't-euphonique']],
];

export const NEGATIONS_4E = [
  ['Il a vu quelqu’un. (avec « personne »)', 'Il n’a vu personne.', ['Il a vu personne.', 'oubli-ne'], ['Il n’a personne vu.', 'place-personne']],
  ['Elle mange encore. (avec « plus »)', 'Elle ne mange plus.', ['Elle mange plus.', 'oubli-ne'], ['Elle ne mange plus pas.', 'un-seul-mot']],
  ['Nous avons tout compris. (avec « rien »)', 'Nous n’avons rien compris.', ['Nous avons rien compris.', 'oubli-ne'], ['Nous n’avons pas rien compris.', 'un-seul-mot']],
  ['Il sort toujours le soir. (avec « jamais »)', 'Il ne sort jamais le soir.', ['Il sort jamais le soir.', 'oubli-ne'], ['Il ne sort pas jamais le soir.', 'un-seul-mot']],
  ['Tu as quelque chose à dire. (avec « rien »)', 'Tu n’as rien à dire.', ['Tu as rien à dire.', 'oubli-ne'], ['Tu n’as pas rien à dire.', 'un-seul-mot']],
  ['On entend du bruit. (avec « pas »)', 'On n’entend pas de bruit.', ['On entend pas de bruit.', 'oubli-ne-on'], ['On ne entend pas de bruit.', 'elision-ne']],
  ['Quelqu’un est venu. (avec « personne »)', 'Personne n’est venu.', ['Personne est venu.', 'oubli-ne'], ['Personne n’est pas venu.', 'un-seul-mot']],
  ['J’ai déjà vu ce film. (avec « jamais »)', 'Je n’ai jamais vu ce film.', ['J’ai jamais vu ce film.', 'oubli-ne'], ['Je n’ai vu jamais ce film.', 'place-compose']],
  ['Il a encore faim. (avec « plus »)', 'Il n’a plus faim.', ['Il a plus faim.', 'oubli-ne'], ['Il ne a plus faim.', 'elision-ne']],
  ['On a gagné. (avec « pas »)', 'On n’a pas gagné.', ['On a pas gagné.', 'oubli-ne-on'], ['On n’a gagné pas.', 'place-compose']],
];

function quatrieme({ melanger }) {
  const liste = [];
  melanger(INTERROGATIVES_4E).slice(0, 3).forEach(([question, bonne]) => {
    liste.push(classement('interrogative-4e', question, bonne, FORMES, NOM_FORMES, 'interro'));
  });
  melanger(INVERSIONS_4E).slice(0, 2).forEach(([source, ...reste]) => {
    liste.push(depuisBanque(melanger, 'inversion-4e', [source, ...reste]));
  });
  melanger(NEGATIONS_4E).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'negation-4e', e)));
  return melanger(liste);
}

// ------------------------------------------------------------------ le jeu

const PAR_NIVEAU = { SIXIEME: sixieme, CINQUIEME: cinquieme, QUATRIEME: quatrieme };

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
  'simple-complexe-6e': 'Cette phrase est-elle simple, ou complexe ? Compte ses verbes conjugués.',
  'simple-complexe-6e-regle': 'Un seul verbe conjugué : phrase simple. Deux ou plus : phrase complexe.',
  'compter-6e': 'Combien de verbes conjugués compte cette phrase ?',
  'compter-6e-regle': 'Un verbe conjugué a un sujet et change avec la personne et le temps : compte-les un par un.',
  'laquelle-6e': 'Laquelle de ces phrases est complexe ?',
  'laquelle-6e-regle': 'Compte les verbes conjugués de chaque phrase : la complexe en a au moins deux.',
  'compter-longue': 'Une phrase longue n’est pas forcément complexe : compte les verbes conjugués. Ici, il n’y en a qu’un.',
  'compter-infinitif': 'Un verbe à l’infinitif n’est pas conjugué : il ne compte pas.',
  'compter-participe': 'Un participe, comme « fatigué » ou « en mangeant », n’est pas un verbe conjugué : il ne compte pas.',
  'compter-compose': 'Un verbe à un temps composé compte pour un seul : l’auxiliaire et le participe vont ensemble.',
  'compter-surplus': 'Ne compte que les verbes conjugués, chacun avec son sujet : un nom n’est pas un verbe.',
  'compter-oubli': 'Cherche chaque verbe conjugué avec son sujet, sans en oublier : même après qui, que ou quand.',
  'compter-complexe': 'Il y a plusieurs verbes conjugués, chacun avec son sujet : c’est une phrase complexe.',

  // 5e
  'lien-5e': 'Comment les propositions de cette phrase sont-elles reliées ?',
  'lien-5e-regle': 'Regarde ce qu’il y a entre les propositions : une ponctuation, une conjonction de coordination, ou un mot qui en fait dépendre une.',
  'relier-juxtaposition-5e': 'Choisis la phrase où les propositions sont juxtaposées.',
  'relier-juxtaposition-5e-regle': 'Des propositions juxtaposées ne sont séparées que par une virgule, un point-virgule ou deux-points.',
  'relier-coordination-5e': 'Choisis la phrase où les propositions sont coordonnées.',
  'relier-coordination-5e-regle': 'Des propositions coordonnées sont reliées par mais, ou, et, donc, or, ni, car.',
  'relier-subordination-5e': 'Choisis la phrase où une proposition est subordonnée à l’autre.',
  'relier-subordination-5e-regle': 'Une subordonnée commence par un mot comme que, qui, quand, si, parce que, bien que.',
  'lien-juxtaposition': 'Entre les propositions, il n’y a qu’une virgule, un point-virgule ou deux-points : elles sont juxtaposées.',
  'lien-coordination': 'Les propositions sont reliées par une conjonction de coordination, mais, ou, et, donc, or, ni, car : elles sont coordonnées.',
  'lien-subordination': 'Une proposition dépend de l’autre : elle commence par un subordonnant, que, qui, quand, si, parce que. C’est la subordination.',
  'mot-5e': 'Quelle est la nature du mot entre crochets ?',
  'mot-5e-regle': 'Demande-toi si ce mot relie deux propositions de même rang, ou s’il en fait dépendre une, et s’il remplace un nom.',
  'mot-coordination': 'Mais, ou, et, donc, or, ni, car : ce sont les conjonctions de coordination. Elles relient deux propositions de même rang.',
  'mot-subordination': 'Ce mot fait dépendre une proposition d’une autre, et ne remplace aucun nom : c’est une conjonction de subordination.',
  'mot-relatif': 'Ce mot remplace le nom placé juste avant, son antécédent : c’est un pronom relatif.',

  // 4e
  'interrogative-4e': 'Quelle forme a cette question ?',
  'interrogative-4e-regle': 'Regarde l’ordre des mots : sujet avant le verbe, « est-ce que », ou sujet après le verbe.',
  'interro-intonation': 'L’ordre des mots est celui d’une phrase qui affirme : seule l’intonation, et le point d’interrogation, montrent la question.',
  'interro-est-ce-que': 'La question est construite avec « est-ce que », et le sujet reste devant le verbe.',
  'interro-inversion': 'Le pronom sujet passe après le verbe, relié par un trait d’union : c’est l’inversion du sujet.',
  'inversion-4e': 'Pose la même question avec l’inversion du sujet.',
  'inversion-4e-regle': 'Le pronom sujet se place après le verbe, ou après l’auxiliaire, avec un trait d’union.',
  't-euphonique': 'Entre deux voyelles, on glisse un t entre deux traits d’union : a-t-il, va-t-elle.',
  't-apostrophe': 'Le t ajouté s’écrit entre deux traits d’union, jamais avec une apostrophe : va-t-elle.',
  't-inutile': 'Le t ne s’ajoute qu’entre deux voyelles : ici, on n’en a pas besoin.',
  'trait-union': 'Le verbe et le pronom sujet placé après lui sont reliés par un trait d’union.',
  'inversion-auxiliaire': 'Au temps composé, le pronom sujet se place juste après l’auxiliaire : a-t-il mangé ?',
  'inversion-nom': 'Quand le sujet est un nom, il reste devant le verbe, et un pronom le reprend après : Paul vient-il ?',
  'negation-4e': 'Choisis la phrase négative correctement écrite.',
  'negation-4e-regle': 'À l’écrit, la négation a deux parties : ne, et un mot comme pas, plus, jamais, rien ou personne.',
  'oubli-ne': 'À l’écrit, la négation a deux mots : ne, puis pas, plus, jamais, rien ou personne. N’oublie pas le ne.',
  'oubli-ne-on': 'Après « on », devant une voyelle, on entend la liaison : on n’entend pas. Ce n’ doit s’écrire.',
  'un-seul-mot': 'Ne s’emploie avec un seul mot de négation : ne… jamais, ne… rien, ne… plus, sans ajouter pas.',
  'elision-ne': 'Devant une voyelle, ne devient n’ : il n’a plus faim.',
  'place-personne': 'Avec « personne », la négation entoure l’auxiliaire et le participe : il n’a vu personne.',
  'place-compose': 'Au temps composé, ne… pas et ne… jamais entourent l’auxiliaire : je n’ai jamais vu.',
};
