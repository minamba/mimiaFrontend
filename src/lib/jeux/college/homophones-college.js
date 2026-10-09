/**
 * LES HOMOPHONES — les homophones grammaticaux en 6e.
 * Professeur : Adrien (français).
 *
 * UNE PHRASE À TROU, DES MOTS QUI SE PRONONCENT PAREIL : a/à, et/est,
 * son/sont, on/ont, ce/se, ces/ses/c'est/s'est, ou/où, la/là/l'a,
 * leur/leurs, quand/quant/qu'en, peu/peut. Une seule réponse possible par
 * phrase : « ces » et « ses » ne sont proposés que si la phrase tranche
 * (« -là », « propres », un objet qui ne peut être qu'à lui).
 *
 * CHAQUE ERREUR DONNE LA MÉTHODE DE REMPLACEMENT de la bonne réponse :
 * a → avait, est → était, sont → étaient, ont → avaient, on → il,
 * son → mon, s'est → je me suis, l'a → l'avait, peut → pouvait, quand →
 * lorsque, quant à → en ce qui concerne, leur devant un verbe → lui…
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - VERBE OU PAS (3) : a/à, et/est, son/sont, on/ont — être et avoir ;
 *   - LES PETITS MOTS (3) : ce/se, ces/ses/c'est/s'est, la/là/l'a, leur/leurs ;
 *   - LES AUTRES (2) : ou/où, quand/quant/qu'en, peu/peut.
 * En début de phrase, les choix prennent la majuscule.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'homophones-college', titre: 'Les homophones', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Les homophones',
    accroche: 'a ou à, ces ou ses : remplace pour choisir.',
    competences: ['FR_6E_LANG_HOMOPHONES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Les mots de chaque groupe : ce sont les choix proposés. */
const GROUPES = {
  a: ['a', 'à'],
  et: ['et', 'est'],
  son: ['son', 'sont'],
  on: ['on', 'ont'],
  ce: ['ce', 'se'],
  ces: ['ces', 'ses', 'c’est', 's’est'],
  la: ['la', 'là', 'l’a'],
  leur: ['leur', 'leurs'],
  ou: ['ou', 'où'],
  quand: ['quand', 'quant', 'qu’en'],
  peu: ['peu', 'peut'],
};

/** Le nom de la règle de chaque mot : la phrase dite est `regle-<nom>`. */
const NOM = {
  a: 'a',
  à: 'a-accent',
  et: 'et',
  est: 'est',
  son: 'son',
  sont: 'sont',
  on: 'on',
  ont: 'ont',
  ce: 'ce',
  se: 'se',
  ces: 'ces',
  ses: 'ses',
  'c’est': 'c-est',
  's’est': 's-est',
  la: 'la',
  là: 'la-accent',
  'l’a': 'l-a',
  leur: 'leur',
  leurs: 'leurs',
  ou: 'ou',
  où: 'ou-accent',
  quand: 'quand',
  quant: 'quant',
  'qu’en': 'qu-en',
  peu: 'peu',
  peut: 'peut',
};

/** [groupe, phrase à trou, bonne réponse en minuscules, règle propre (facultative)]. */
const VERBE_OU_PAS = [
  ['a', 'Mon frère ___ perdu ses clés.', 'a'],
  ['a', 'Nous allons ___ la piscine.', 'à'],
  ['a', 'Elle ___ trois chats et un chien.', 'a'],
  ['a', 'Il pense ___ ses vacances.', 'à'],
  ['a', 'Le facteur ___ apporté un colis.', 'a'],
  ['a', 'J’ai mal ___ la tête.', 'à'],
  ['et', 'Le ciel ___ gris ce matin.', 'est'],
  ['et', 'J’ai acheté du pain ___ du fromage.', 'et'],
  ['et', 'Mon chien ___ très joueur.', 'est'],
  ['et', 'Elle chante ___ elle danse.', 'et'],
  ['et', 'Le gâteau ___ dans le four.', 'est'],
  ['et', 'Il fait froid ___ humide.', 'et'],
  ['son', 'Les invités ___ arrivés.', 'sont'],
  ['son', 'Léo range ___ cartable.', 'son'],
  ['son', 'Mes parents ___ partis en voyage.', 'sont'],
  ['son', 'Elle a oublié ___ parapluie.', 'son'],
  ['son', 'Ces fruits ___ trop mûrs.', 'sont'],
  ['on', 'Mes voisins ___ repeint leur maison.', 'ont'],
  ['on', '___ ira au cinéma ce soir.', 'on'],
  ['on', 'Les élèves ___ fini leur exercice.', 'ont'],
  ['on', 'Demain, ___ partira de bonne heure.', 'on'],
  ['on', 'Ils ___ gagné le match.', 'ont'],
  ['on', '___ entend la mer depuis la fenêtre.', 'on'],
];

const PETITS_MOTS = [
  ['ce', 'Il ___ lave les mains avant de manger.', 'se'],
  ['ce', '___ château date du Moyen Âge.', 'ce'],
  ['ce', 'Les chats ___ cachent sous le lit.', 'se'],
  ['ce', 'J’adore ___ film.', 'ce'],
  ['ce', 'Elle ___ promène au bord de la rivière.', 'se'],
  ['ce', 'Regarde ___ magnifique arc-en-ciel !', 'ce'],
  ['ces', 'Léa range ___ propres affaires.', 'ses'],
  ['ces', '___ chaussures-là sont à toi ?', 'ces'],
  ['ces', '___ mon meilleur ami.', 'c’est'],
  ['ces', 'Il ___ blessé en tombant.', 's’est'],
  ['ces', 'Regarde ___ nuages noirs au-dessus de nous !', 'ces'],
  ['ces', 'Le chat lèche ___ pattes.', 'ses'],
  ['ces', 'Je crois que ___ l’heure de partir.', 'c’est'],
  ['ces', 'Elle ___ endormie devant la télévision.', 's’est'],
  ['ces', 'Mon père ___ trompé de chemin.', 's’est'],
  ['ces', '___ difficile, mais j’y arriverai.', 'c’est'],
  ['la', 'Pose ce carton ___, près de la porte.', 'là'],
  ['la', 'Ce livre, il ___ lu deux fois.', 'l’a'],
  ['la', 'Ferme ___ fenêtre, s’il te plaît.', 'la'],
  ['la', 'Je suis ___ pour t’aider.', 'là'],
  ['la', 'La lettre ? Le facteur ___ apportée ce matin.', 'l’a'],
  ['la', 'Elle a perdu ___ clé du garage.', 'la'],
  ['la', 'Mon chien ? Mon voisin ___ trouvé dans son jardin.', 'l’a'],
  ['la', 'Cette chanson, je ___ chante tous les jours.', 'la'],
  ['leur', 'Les élèves sortent ___ cahiers.', 'leurs'],
  ['leur', 'Je ___ ai expliqué la règle.', 'leur'],
  ['leur', 'Les deux frères partagent ___ chambre.', 'leur', 'leur-un'],
  ['leur', 'Mes cousins ont vendu tous ___ jouets.', 'leurs'],
  ['leur', 'Le professeur ___ rend les copies.', 'leur'],
  ['leur', 'Les oiseaux nourrissent ___ petits.', 'leurs'],
];

const AUTRES = [
  ['ou', 'Tu préfères la mer ___ la montagne ?', 'ou'],
  ['ou', 'La maison ___ je suis né est à vendre.', 'où'],
  ['ou', '___ as-tu rangé mes lunettes ?', 'où'],
  ['ou', 'Il viendra lundi ___ mardi.', 'ou'],
  ['ou', 'Je me souviens du jour ___ tu es arrivé.', 'où'],
  ['ou', 'Veux-tu une pomme ___ une poire ?', 'ou'],
  ['quand', '___ il pleut, je reste à la maison.', 'quand'],
  ['quand', '___ à moi, je préfère rester ici.', 'quant'],
  ['quand', 'Il ne sort ___ été.', 'qu’en'],
  ['quand', 'Préviens-moi ___ tu seras prêt.', 'quand'],
  ['quand', '___ penses-tu ?', 'qu’en'],
  ['quand', 'Mon frère adore le football ; ___ à ma sœur, elle préfère le tennis.', 'quant'],
  ['peu', 'Il ___ venir avec nous.', 'peut'],
  ['peu', 'J’ai ___ dormi cette nuit.', 'peu'],
  ['peu', 'Elle ___ nager pendant une heure.', 'peut'],
  ['peu', 'Ce gâteau est un ___ trop sucré.', 'peu'],
  ['peu', 'On ___ entrer maintenant.', 'peut'],
  ['peu', 'Il reste ___ de temps.', 'peu'],
];

const majuscule = (mot) => mot[0].toUpperCase() + mot.slice(1);

const fabriquer = ([groupe, question, bonne, regle], melanger) => {
  const ecrire = (mot) => (question.startsWith('___') ? majuscule(mot) : mot);
  const phrase = `regle-${regle ?? NOM[bonne]}`;
  const autres = GROUPES[groupe].filter((c) => c !== bonne);
  return {
    consigne: `choisir-${groupe}`,
    question,
    bonne: ecrire(bonne),
    choix: melanger(GROUPES[groupe]).map((c) => ({ cle: ecrire(c), libelle: ecrire(c) })),
    pieges: Object.fromEntries(autres.map((c) => [ecrire(c), phrase])),
    aide: phrase,
  };
};

export const SORTES = {
  SIXIEME: [
    { banque: VERBE_OU_PAS, nombre: 3, fabriquer },
    { banque: PETITS_MOTS, nombre: 3, fabriquer },
    { banque: AUTRES, nombre: 2, fabriquer },
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
  'choisir-a': 'A, ou à ? Remplace par avait pour choisir.',
  'choisir-et': 'Et, ou est ? Remplace par était pour choisir.',
  'choisir-son': 'Son, ou sont ? Remplace par étaient pour choisir.',
  'choisir-on': 'On, ou ont ? Remplace par avaient, ou par il, pour choisir.',
  'choisir-ce': 'Ce, ou se ? Regarde si le mot est devant un nom ou devant un verbe.',
  'choisir-ces': 'Ces, ses, c’est ou s’est ? Essaie de mettre la phrase à l’imparfait, ou de dire les siens.',
  'choisir-la': 'La, là, ou l’a ? Remplace par là-bas, ou par l’avait, pour choisir.',
  'choisir-leur': 'Leur, ou leurs ? Regarde le mot qui suit : un verbe, ou un nom au pluriel ?',
  'choisir-ou': 'Ou, ou où ? Essaie de dire ou bien.',
  'choisir-quand': 'Quand, quant, ou qu’en ? Remplace par lorsque, ou par en ce qui concerne.',
  'choisir-peu': 'Peu, ou peut ? Remplace par pouvait pour choisir.',
  'choisir-a-regle': 'Si l’on peut dire avait, c’est a, le verbe avoir ; sinon, c’est à, avec un accent.',
  'choisir-et-regle': 'Si l’on peut dire était, c’est est, le verbe être ; si l’on peut dire et puis, c’est et.',
  'choisir-son-regle': 'Si l’on peut dire étaient, c’est sont, le verbe être ; si l’on peut dire mon, c’est son.',
  'choisir-on-regle': 'Si l’on peut dire avaient, c’est ont, le verbe avoir ; si l’on peut dire il, c’est on.',
  'choisir-ce-regle': 'Devant un nom, c’est ce, qui montre ; devant un verbe pronominal, c’est se.',
  'choisir-ces-regle': 'Ces montre, ses veut dire les siens, c’est devient c’était, et s’est devient je me suis.',
  'choisir-la-regle': 'Là-bas, c’est là avec un accent ; l’avait, c’est l’a ; sinon, c’est la.',
  'choisir-leur-regle': 'Devant un verbe, leur ne prend jamais de s ; devant un nom au pluriel, leurs en prend un.',
  'choisir-ou-regle': 'Si l’on peut dire ou bien, c’est ou ; pour un lieu ou un moment, c’est où.',
  'choisir-quand-regle': 'Lorsque, c’est quand ; en ce qui concerne, c’est quant à ; que suivi de en, c’est qu’en.',
  'choisir-peu-regle': 'Si l’on peut dire pouvait, c’est peut, le verbe pouvoir ; sinon, c’est peu.',
  'regle-a': 'On peut dire avait à la place : c’est a, le verbe avoir, sans accent.',
  'regle-a-accent': 'On ne peut pas dire avait à la place : c’est à, la préposition, avec un accent.',
  'regle-et': 'On peut dire et puis à la place : c’est et, le mot qui relie.',
  'regle-est': 'On peut dire était à la place : c’est est, le verbe être.',
  'regle-son': 'On peut dire mon ou ton à la place : c’est son, le déterminant.',
  'regle-sont': 'On peut dire étaient à la place : c’est sont, le verbe être.',
  'regle-on': 'On peut dire il à la place : c’est on, le pronom.',
  'regle-ont': 'On peut dire avaient à la place : c’est ont, le verbe avoir.',
  'regle-ce': 'Le mot est devant un nom, qu’il montre : au pluriel, on dirait ces. C’est ce, le déterminant.',
  'regle-se': 'Le mot est devant un verbe, et avec je on dirait me : je me lave, il se lave. C’est se, le pronom.',
  'regle-ces': 'On peut ajouter là après le nom, ces livres-là : c’est ces, qui montre.',
  'regle-ses': 'Ce sont les siens, à lui ou à elle ; au singulier, on dirait son ou sa. C’est ses, avec un s au début.',
  'regle-c-est': 'On peut dire c’était à la place : on écrit c, apostrophe, est.',
  'regle-s-est': 'Le verbe est pronominal : avec je, on dirait je me suis. On écrit s, apostrophe, est.',
  'regle-la': 'On ne peut dire ni là-bas, ni l’avait : c’est la, sans accent, devant un nom ou devant un verbe.',
  'regle-la-accent': 'On peut dire là-bas, ou ici : c’est là, avec un accent, qui indique le lieu.',
  'regle-l-a': 'On peut dire l’avait à la place : on écrit l, apostrophe, a.',
  'regle-leur': 'Devant un verbe, on pourrait dire lui : leur, le pronom, ne prend jamais de s.',
  'regle-leur-un': 'Ils n’ont qu’une seule chose à eux, et le nom est au singulier : leur reste sans s.',
  'regle-leurs': 'Le nom qui suit est au pluriel, il y a plusieurs choses à eux : leurs prend un s.',
  'regle-ou': 'On peut dire ou bien à la place : c’est ou, sans accent.',
  'regle-ou-accent': 'Le mot indique un lieu ou un moment, ou pose la question du lieu : c’est où, avec un accent.',
  'regle-quand': 'On peut dire lorsque à la place : c’est quand, qui indique le moment.',
  'regle-quant': 'On peut dire en ce qui concerne : quant à s’écrit avec un t.',
  'regle-qu-en': 'Ce sont deux petits mots, que et en : on pourrait dire seulement en, ou que penses-tu de cela. On écrit qu, apostrophe, en.',
  'regle-peu': 'On peut dire pas beaucoup à la place : c’est peu, qui indique une petite quantité.',
  'regle-peut': 'On peut dire pouvait à la place : c’est peut, le verbe pouvoir.',
};
