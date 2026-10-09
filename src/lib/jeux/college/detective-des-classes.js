/**
 * LE DÉTECTIVE DES CLASSES — les huit classes grammaticales en 6e.
 * Professeur : Adrien (français).
 *
 * UN MOT ENTRE CROCHETS DANS UNE PHRASE : quelle est sa classe ? Nom,
 * déterminant, adjectif, pronom, verbe, adverbe, préposition, conjonction.
 * Les phrases sont écrites à la main : une seule réponse défendable.
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - LES MOTS VARIABLES (3) : nom, déterminant, adjectif, pronom, verbe ;
 *   - LE MÊME MOT, DEUX CLASSES (3) : LE piège du collège. « le », « la »,
 *     « les » déterminants devant un nom, pronoms devant un verbe ; « leur »
 *     déterminant ou pronom ; « fort » adjectif ou adverbe ; « bien » adverbe
 *     ou nom ; « dîner », « ferme » nom ou verbe ;
 *   - LES MOTS INVARIABLES (2) : adverbe, préposition ou conjonction. On évite
 *     « donc » et « or », que la terminologie de 2020 range parmi les adverbes.
 *
 * Chaque erreur dit comment reconnaître la BONNE classe ; les mots qui
 * changent de classe ont leur phrase à eux.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'detective-des-classes', titre: 'Le détective des classes', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le détective des classes',
    accroche: 'Nom, pronom, adverbe… démasque chaque mot.',
    competences: ['FR_6E_LANG_CLASSES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const LIBELLES = {
  nom: 'Nom',
  determinant: 'Déterminant',
  adjectif: 'Adjectif',
  pronom: 'Pronom',
  verbe: 'Verbe',
  adverbe: 'Adverbe',
  preposition: 'Préposition',
  conjonction: 'Conjonction',
};

/** [phrase, le mot entre crochets ; bonne classe ; deux autres classes ; phrase du piège (facultative)]. */
const VARIABLES = [
  ['Le [chat] dort sur le canapé.', 'nom', ['verbe', 'adjectif']],
  ['Ma sœur a un vélo [rouge].', 'adjectif', ['nom', 'adverbe']],
  ['Les élèves [écoutent] le professeur.', 'verbe', ['nom', 'adjectif']],
  ['[Cette] maison est très ancienne.', 'determinant', ['pronom', 'adjectif']],
  ['[Elle] chante sous la douche.', 'pronom', ['determinant', 'nom']],
  ['Nous avons visité un [immense] château.', 'adjectif', ['adverbe', 'nom']],
  ['Le vent [souffle] sur la plage.', 'verbe', ['nom', 'adverbe']],
  ['J’ai perdu [mes] clés.', 'determinant', ['pronom', 'adjectif']],
  ['Ce livre, je [le] relis chaque été.', 'pronom', ['determinant', 'nom'], 'le-pronom'],
  ['Ses amis [lui] ont offert un cadeau.', 'pronom', ['determinant', 'nom']],
  ['La [forêt] est silencieuse.', 'nom', ['adjectif', 'verbe']],
  ['Les marins semblaient [joyeux].', 'adjectif', ['verbe', 'nom']],
  ['[Quelques] oiseaux chantaient.', 'determinant', ['adjectif', 'pronom']],
  ['Prends [celui-ci], il est plus solide.', 'pronom', ['determinant', 'adverbe']],
];

const MEME_MOT = [
  ['Le gâteau ? Je [le] mange tout de suite.', 'pronom', ['determinant', 'nom'], 'le-pronom'],
  ['[Le] gâteau est encore chaud.', 'determinant', ['pronom', 'nom'], 'le-determinant'],
  ['Ces fleurs, je [les] ai cueillies ce matin.', 'pronom', ['determinant', 'adjectif'], 'le-pronom'],
  ['Elle ouvre [la] fenêtre.', 'determinant', ['pronom', 'nom'], 'le-determinant'],
  ['Cette chanson, je [la] connais par cœur.', 'pronom', ['determinant', 'nom'], 'le-pronom'],
  ['Je [leur] ai prêté mon ballon.', 'pronom', ['determinant', 'adverbe'], 'leur-pronom'],
  ['Les voisins promènent [leur] chien.', 'determinant', ['pronom', 'adjectif'], 'leur-determinant'],
  ['Il est très [fort] aux échecs.', 'adjectif', ['adverbe', 'nom'], 'fort-adjectif'],
  ['Ne parle pas si [fort] !', 'adverbe', ['adjectif', 'verbe'], 'fort-adverbe'],
  ['Tu as [bien] travaillé.', 'adverbe', ['adjectif', 'nom'], 'bien-adverbe'],
  ['Ce collier est mon [bien] le plus précieux.', 'nom', ['adverbe', 'adjectif'], 'bien-nom'],
  ['Après le [dîner], nous jouerons aux cartes.', 'nom', ['verbe', 'adjectif'], 'nom-pas-verbe'],
  ['Nous allons [dîner] chez ma tante.', 'verbe', ['nom', 'adjectif'], 'verbe-infinitif'],
  ['Il [ferme] la porte à clé.', 'verbe', ['adjectif', 'nom'], 'verbe-conjugue'],
  ['Mon oncle vit dans une [ferme].', 'nom', ['verbe', 'adjectif'], 'nom-pas-verbe'],
];

const INVARIABLES = [
  ['Le chat dort [sous] la table.', 'preposition'],
  ['Il pleut, [mais] nous sortirons.', 'conjonction'],
  ['Elle court [vite].', 'adverbe'],
  ['Je viendrai [avec] mon frère.', 'preposition'],
  ['Tu préfères le thé [ou] le café ?', 'conjonction'],
  ['Nous partirons [demain].', 'adverbe'],
  ['Je lis [pendant] le trajet.', 'preposition'],
  ['Ce film est [très] drôle.', 'adverbe'],
  ['Je reste à la maison [car] il fait froid.', 'conjonction'],
  ['Range ton manteau [dans] l’armoire.', 'preposition'],
  ['Elle chante [souvent] le soir.', 'adverbe'],
  ['Préviens-moi [quand] tu arrives.', 'conjonction'],
  ['Ce cadeau est [pour] toi.', 'preposition'],
  ['Nous avons [beaucoup] marché.', 'adverbe'],
  ['Il n’aime ni le riz [ni] les pâtes.', 'conjonction'],
].map(([q, bonne]) => [q, bonne, ['adverbe', 'preposition', 'conjonction'].filter((c) => c !== bonne)]);

const fabriquer = (consigne) => ([question, bonne, autres, piege], melanger) => ({
  consigne,
  question,
  bonne,
  choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: LIBELLES[c] })),
  pieges: Object.fromEntries(autres.map((c) => [c, piege ?? `classe-${bonne}`])),
  aide: `classe-${bonne}`,
});

/** Les sortes de manches de chaque classe : la banque, combien on en tire, comment on les fabrique. */
export const SORTES = {
  SIXIEME: [
    { banque: VARIABLES, nombre: 3, fabriquer: fabriquer('classe-variable') },
    { banque: MEME_MOT, nombre: 3, fabriquer: fabriquer('classe-meme-mot') },
    { banque: INVARIABLES, nombre: 2, fabriquer: fabriquer('classe-invariable') },
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
  'classe-variable': 'Quelle est la classe du mot entre crochets ? Regarde sa place, et ce qu’il fait dans la phrase.',
  'classe-meme-mot': 'Attention, ce mot peut changer de classe d’une phrase à l’autre. Quelle est sa classe ici ?',
  'classe-invariable': 'Ce mot ne varie pas. Est-ce un adverbe, une préposition ou une conjonction ?',
  'classe-variable-regle': 'Pour trouver la classe d’un mot, regarde ce qui l’entoure : un nom suit un déterminant, un verbe se conjugue, un adjectif précise un nom.',
  'classe-meme-mot-regle': 'Un même mot peut changer de classe : regarde ce qui le suit. Devant un nom, c’est souvent un déterminant ; devant un verbe, un pronom.',
  'classe-invariable-regle': 'Une préposition introduit un groupe, une conjonction relie deux éléments, un adverbe précise le sens d’un verbe ou d’un adjectif.',
  'classe-nom': 'C’est un nom : il désigne une personne, un animal, une chose ou une idée, et on peut mettre un déterminant devant, comme le, un ou ce.',
  'classe-determinant': 'C’est un déterminant : il est placé devant un nom, il l’annonce, et il s’accorde avec lui.',
  'classe-adjectif': 'C’est un adjectif : il précise un nom, et il s’accorde avec lui en genre et en nombre.',
  'classe-pronom': 'C’est un pronom : il remplace un nom, ou désigne une personne. Il est souvent placé devant un verbe.',
  'classe-verbe': 'C’est un verbe : il se conjugue. Essaie de le mettre à un autre temps, il change de forme.',
  'classe-adverbe': 'C’est un adverbe : il ne varie jamais, et il précise le sens d’un verbe, d’un adjectif ou d’un autre adverbe.',
  'classe-preposition': 'C’est une préposition : elle ne varie pas, et elle introduit un groupe de mots, comme à, de, dans, sous, avec ou pour.',
  'classe-conjonction': 'C’est une conjonction : elle relie deux mots, deux groupes ou deux propositions, comme mais, ou, et, ni, car, ou encore quand et que.',
  'le-pronom': 'Ici, le mot est placé devant un verbe et remplace un nom déjà cité : c’est un pronom, pas un déterminant.',
  'le-determinant': 'Ici, le mot est placé devant un nom, qu’il annonce : c’est un déterminant, pas un pronom.',
  'leur-pronom': 'Devant un verbe, leur veut dire à eux : c’est un pronom, et il ne prend jamais de s.',
  'leur-determinant': 'Devant un nom, leur l’annonce, comme son ou ses : c’est un déterminant possessif.',
  'fort-adjectif': 'Ici, le mot dit comment est la personne, après le verbe être, et il s’accorderait : elle est forte. C’est un adjectif.',
  'fort-adverbe': 'Ici, le mot précise le verbe et ne s’accorde pas : elles parlent fort. C’est un adverbe.',
  'bien-adverbe': 'Ici, bien précise le verbe, il dit comment on a travaillé : c’est un adverbe, invariable.',
  'bien-nom': 'Ici, bien est annoncé par le déterminant mon, et on pourrait dire mon trésor : c’est un nom.',
  'nom-pas-verbe': 'Ici, le mot est annoncé par un déterminant : c’est un nom. Un verbe, lui, se conjugue.',
  'verbe-infinitif': 'Ici, aucun déterminant n’annonce le mot : c’est un verbe à l’infinitif, comme manger ou partir.',
  'verbe-conjugue': 'Ici, le mot se conjugue avec il : il fermait, il fermera. C’est un verbe.',
};
