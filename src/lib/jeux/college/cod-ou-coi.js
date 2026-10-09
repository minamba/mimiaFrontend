/**
 * COD OU COI ? — les fonctions dans la phrase, en 6e.
 * Professeur : Adrien (français).
 *
 * UN GROUPE ENTRE CROCHETS : quelle est sa fonction ? Sujet, COD, COI,
 * attribut du sujet, complément circonstanciel. Phrases écrites à la main,
 * une seule réponse défendable.
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - COD, COI OU CIRCONSTANCIEL (3) : LE PIÈGE, le groupe introduit par une
 *     préposition pris pour un COD, ou le complément circonstanciel de lieu
 *     pris pour un COI ;
 *   - ATTRIBUT OU COD (3) : après être, sembler, devenir, paraître, rester, le
 *     groupe est un attribut ; après un verbe d'action, un COD. Les deux se
 *     ressemblent : « est une excellente cuisinière » et « prépare une
 *     excellente soupe » ;
 *   - SUJET OU CIRCONSTANCIEL (2) : le sujet inversé (« Sur la table
 *     traînaient des miettes »), et le complément qu'on déplace.
 *
 * Les erreurs se nomment par la paire (bonne réponse, réponse choisie) : la
 * phrase dit la méthode qui tranche entre les deux.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'cod-ou-coi', titre: 'COD ou COI ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'COD ou COI ?',
    accroche: 'Sujet, COD, COI, attribut : à toi de juger.',
    competences: ['FR_6E_LANG_FONCTIONS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const LIBELLES = {
  sujet: 'Sujet',
  cod: 'COD',
  coi: 'COI',
  attribut: 'Attribut du sujet',
  cc: 'Complément circonstanciel',
};

/** La phrase d'erreur : PIEGES[bonne][choisie], sinon la règle de la bonne fonction. */
const PIEGES = {
  cod: { coi: 'cod-sans-preposition', cc: 'cod-pas-cc', attribut: 'cod-pas-attribut' },
  coi: { cod: 'coi-preposition', cc: 'coi-pas-cc' },
  cc: { cod: 'cc-se-deplace', coi: 'cc-se-deplace', sujet: 'cc-se-deplace' },
  attribut: { cod: 'attribut-pas-cod', coi: 'attribut-pas-cod' },
  sujet: { cod: 'fonction-sujet', cc: 'fonction-sujet' },
};

/** [phrase avec le groupe entre crochets, bonne fonction, piège propre à la phrase (facultatif)]. */
const COD_COI_CC = [
  ['Léa lit [un roman policier].', 'cod'],
  ['Le chien obéit [à son maître].', 'coi'],
  ['Nous parlons [de nos vacances].', 'coi'],
  ['Mon frère répare [son vélo].', 'cod'],
  ['Tu ressembles [à ta mère].', 'coi'],
  ['Elle se souvient [de cette journée].', 'coi'],
  ['Les enfants construisent [une cabane].', 'cod'],
  ['J’ai téléphoné [à mon grand-père].', 'coi'],
  ['Il joue [dans le jardin].', 'cc'],
  ['Le professeur corrige [nos copies].', 'cod'],
  ['Je pense souvent [à mes amis].', 'coi'],
  ['Elle chante [avec joie].', 'cc'],
  ['Ils doutent [de sa parole].', 'coi'],
  ['Il mange [une pomme] chaque matin.', 'cod'],
  ['Nous dînerons [à huit heures].', 'cc'],
];

const ATTRIBUT_COD = [
  ['Ce gâteau semble [délicieux].', 'attribut'],
  ['Ma cousine est devenue [médecin].', 'attribut'],
  ['Le ciel paraît [menaçant].', 'attribut'],
  ['Les spectateurs restaient [silencieux].', 'attribut'],
  ['Tom est [le capitaine de l’équipe].', 'attribut'],
  ['Ces montagnes sont [très hautes].', 'attribut'],
  ['Le chiot devient [énorme].', 'attribut'],
  ['Ma grand-mère est [une excellente cuisinière].', 'attribut'],
  ['Ce chevalier demeure [fidèle à son roi].', 'attribut'],
  ['Mon père a acheté [un nouveau manteau].', 'cod'],
  ['Le peintre regarde [le paysage].', 'cod'],
  ['Ma grand-mère prépare [une excellente soupe].', 'cod'],
  ['Le chevalier aime [son roi].', 'cod'],
];

const SUJET_CC = [
  ['Dans la clairière apparut [un cerf].', 'sujet', 'sujet-inverse'],
  ['[Le vieux pêcheur] répare ses filets.', 'sujet'],
  ['« Viens ici ! » cria [le capitaine].', 'sujet', 'sujet-inverse'],
  ['[Chaque été], nous campons près du lac.', 'cc'],
  ['Les élèves sortent [à toute vitesse].', 'cc'],
  ['Sur la table traînaient [des miettes].', 'sujet', 'sujet-inverse'],
  ['Nous partirons [après le déjeuner].', 'cc'],
  ['[Les feuilles des arbres] tombent en automne.', 'sujet'],
  ['Nous restons à l’intérieur [à cause de la pluie].', 'cc'],
  ['Où sont passés [mes ciseaux] ?', 'sujet', 'sujet-inverse'],
];

const fabriquer = (consigne, possibles) => ([question, bonne, piege], melanger) => {
  const autres = possibles.filter((c) => c !== bonne);
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: LIBELLES[c] })),
    pieges: Object.fromEntries(autres.map((c) => [c, piege ?? PIEGES[bonne][c] ?? `fonction-${bonne}`])),
    aide: `fonction-${bonne}`,
  };
};

export const SORTES = {
  SIXIEME: [
    { banque: COD_COI_CC, nombre: 3, fabriquer: fabriquer('fonction-complement', ['cod', 'coi', 'cc']) },
    { banque: ATTRIBUT_COD, nombre: 3, fabriquer: fabriquer('fonction-attribut-cod', ['attribut', 'cod', 'coi']) },
    { banque: SUJET_CC, nombre: 2, fabriquer: fabriquer('fonction-sujet-cc', ['sujet', 'cod', 'cc']) },
  ],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { melanger } = outils(graine);
  const sortes = SORTES[niveau] ?? SORTES[CLASSES[0]];
  const liste = sortes.flatMap(({ banque, nombre, fabriquer: f }) => melanger(banque).slice(0, nombre).map((item) => f(item, melanger)));
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'fonction-complement': 'Ce groupe est-il un COD, un COI, ou un complément circonstanciel ? Regarde s’il y a une préposition, puis essaie de le déplacer.',
  'fonction-attribut-cod': 'Attribut du sujet, COD ou COI ? Regarde d’abord le verbe : est-ce un verbe d’état, ou un verbe d’action ?',
  'fonction-sujet-cc': 'Quelle est la fonction du groupe entre crochets ? Pose la question qui est-ce qui, devant le verbe.',
  'fonction-complement-regle': 'Sans préposition, c’est un COD ; avec une préposition demandée par le verbe, un COI ; s’il dit où, quand ou comment et qu’il se déplace, un complément circonstanciel.',
  'fonction-attribut-cod-regle': 'Après un verbe d’état, comme être, sembler ou devenir, le groupe est un attribut du sujet ; après un verbe d’action, c’est un complément d’objet.',
  'fonction-sujet-cc-regle': 'Le sujet répond à la question qui est-ce qui, devant le verbe ; le complément circonstanciel se déplace et se supprime.',
  'fonction-sujet': 'C’est le sujet : pose la question qui est-ce qui, ou qu’est-ce qui, devant le verbe. C’est lui qui commande l’accord du verbe.',
  'fonction-cod': 'C’est un COD : il complète le verbe sans préposition. Il répond à la question quoi, ou qui, posée après le verbe.',
  'fonction-coi': 'C’est un COI : il complète le verbe avec une préposition, à ou de. Il répond à la question à qui, à quoi, de qui ou de quoi.',
  'fonction-attribut': 'C’est un attribut du sujet : il est relié au sujet par un verbe d’état, comme être, sembler ou devenir, et il dit qui ou comment est le sujet.',
  'fonction-cc': 'C’est un complément circonstanciel : il dit où, quand, comment ou pourquoi, et on peut le déplacer ou le supprimer.',
  'cod-sans-preposition': 'Il n’y a pas de préposition entre le verbe et le groupe : c’est un COD. Un COI, lui, commence par à ou de.',
  'cod-pas-cc': 'Ce groupe ne dit ni où, ni quand, ni comment : il répond à la question quoi, posée après le verbe. C’est un COD.',
  'cod-pas-attribut': 'Ce verbe n’est pas un verbe d’état : il dit une action. Le groupe qui le suit, sans préposition, est un COD.',
  'coi-preposition': 'Le groupe commence par à ou de, une préposition demandée par le verbe : on dit parler de, obéir à. C’est un COI, pas un COD.',
  'coi-pas-cc': 'La préposition est demandée par le verbe, et le groupe ne se déplace pas en tête de phrase : c’est un COI, pas un complément circonstanciel.',
  'cc-se-deplace': 'Ce groupe dit où, quand, comment ou pourquoi, et on peut le déplacer en tête de phrase ou le supprimer : c’est un complément circonstanciel.',
  'attribut-pas-cod': 'Le verbe est un verbe d’état : être, sembler, devenir, paraître, rester ou demeurer. Ce qui suit dit qui ou comment est le sujet : c’est un attribut, pas un complément.',
  'sujet-inverse': 'Le sujet est ici placé après le verbe. Pose la question qui est-ce qui, ou qu’est-ce qui, devant le verbe : c’est lui le sujet.',
};
