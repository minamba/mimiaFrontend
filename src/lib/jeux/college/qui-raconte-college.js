/**
 * QUI RACONTE ? — narrateur et point de vue en 6e, l'autobiographie en 3e.
 * Professeur : Adrien (français).
 *
 * 6e — LE NARRATEUR ET LE POINT DE VUE (3 + 3 + 2, mélangées). Extraits
 * écrits pour le jeu :
 *   - QUI RACONTE ? (3) : un narrateur personnage, qui dit « je » et vit
 *     l'histoire, ou un narrateur extérieur. LE PIÈGE : le « je » d'un
 *     dialogue, entre guillemets ;
 *   - QUEL POINT DE VUE ? (3) : interne (un seul personnage, ses sensations,
 *     ses doutes), externe (une caméra : gestes, paroles, aucune pensée),
 *     omniscient (plusieurs consciences, l'avenir). LE PIÈGE : prendre
 *     l'interne pour l'omniscient parce qu'on lit des pensées ;
 *   - CE QUE SAIT LE NARRATEUR (2) : la définition par l'indice.
 *
 * 3e — LE RÉCIT AUTOBIOGRAPHIQUE (3 + 3 + 2) :
 *   - QUEL GENRE ? (3) : autobiographie, biographie, roman à la première
 *     personne, journal intime, mémoires. Les exemples réels sont sûrs (Les
 *     Mots de Sartre, Enfance de Sarraute, Si le grain ne meurt de Gide, le
 *     Journal d'Anne Frank, les Mémoires de guerre de De Gaulle, Robinson
 *     Crusoé) ; on ne propose jamais « autobiographie » face à un journal ou
 *     à des mémoires, pour qu'une seule réponse reste défendable ;
 *   - AUTEUR, NARRATEUR OU PERSONNAGE ? (3) : dans l'autobiographie inventée
 *     de « Paul Morel », qui est qui ? L'auteur signe, le narrateur se
 *     souvient au moment où il écrit, le personnage agit au moment des faits ;
 *   - LE PACTE AUTOBIOGRAPHIQUE (2) : Philippe Lejeune, la promesse de
 *     vérité, l'identité des trois instances, Rousseau, le roman
 *     autobiographique, la mémoire qui trahit.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'qui-raconte-college', titre: 'Qui raconte ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Qui raconte ?',
    accroche: 'Narrateur et point de vue : qui voit quoi ?',
    competences: ['FR_6E_LECT_NARRATEUR'],
  },
  TROISIEME: {
    titre: 'Moi, je raconte',
    accroche: 'Auteur, narrateur, personnage : qui est qui ?',
    competences: ['FR_3E_LECT_AUTOBIO'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

// ------------------------------------------------------------------ 6e

const NARRATEURS = { personnage: 'Un narrateur personnage, qui dit je', exterieur: 'Un narrateur extérieur à l’histoire' };

/** [extrait, qui raconte, un « je » de dialogue qui trompe]. */
const EXTRAITS = [
  ['Je n’avais jamais vu la mer. Ce jour-là, en descendant du train, j’ai senti l’odeur du sel et j’ai couru vers la plage.', 'personnage', false],
  ['Nous étions trois à attendre devant la grille. Moi, je tremblais ; mes amis faisaient semblant de rire.', 'personnage', false],
  ['Quand j’ai ouvert la lettre, mes mains se sont mises à trembler : j’étais admise au conservatoire.', 'personnage', false],
  ['Mon grand-père m’emmenait pêcher chaque dimanche. Je portais le seau, il portait les cannes.', 'personnage', false],
  ['J’entendis un craquement derrière moi. Je me retournai lentement : personne.', 'personnage', false],
  ['Je ne sais pas pourquoi, mais ce matin-là, j’ai pris un autre chemin pour aller au collège.', 'personnage', false],
  ['Le jeune berger regardait les nuages. Il savait que l’orage serait là avant la nuit.', 'exterieur', false],
  ['« Je refuse de partir ! » s’écria la princesse. Le roi soupira et quitta la salle.', 'exterieur', true],
  ['Mathis ouvrit la porte du grenier. Une odeur de poussière lui sauta au visage.', 'exterieur', false],
  ['« J’ai gagné ! » hurla Zoé en brandissant sa coupe. Ses parents applaudirent.', 'exterieur', true],
  ['La vieille dame nourrissait les pigeons chaque matin. Elle leur parlait comme à des amis.', 'exterieur', false],
  ['« Je vous attendais », dit l’inconnu en souriant. Les voyageurs se regardèrent, inquiets.', 'exterieur', true],
];

const POINTS_DE_VUE = { interne: 'Point de vue interne', externe: 'Point de vue externe', omniscient: 'Point de vue omniscient' };

/** [extrait, point de vue]. */
const PDV = [
  ['Léa poussa la porte du grenier. Il faisait sombre ; elle crut entendre un souffle tout près d’elle et sentit ses jambes trembler.', 'interne'],
  ['Le soldat avançait dans la brume. Il ne voyait rien à trois pas, et chaque bruit le faisait sursauter. Était-ce l’ennemi ?', 'interne'],
  ['Assise au fond de la classe, Inès regardait la pendule. Les minutes lui paraissaient interminables ; elle n’avait qu’une envie : sortir.', 'interne'],
  ['Du haut de l’arbre, Tom aperçut une silhouette au loin. Il plissa les yeux : était-ce son père, ou un inconnu ?', 'interne'],
  ['Un homme entra dans le café. Il portait un manteau gris. Il commanda un café, le but d’un trait et sortit sans un mot.', 'externe'],
  ['La voiture s’arrêta devant la maison. Deux personnes en descendirent, regardèrent autour d’elles, puis sonnèrent à la porte.', 'externe'],
  ['Le cavalier traversa la place au galop. Il sauta de cheval, attacha les rênes à un anneau et entra dans l’auberge.', 'externe'],
  ['Une femme était assise sur le banc. Elle ouvrit son sac, en sortit une lettre et la déchira en petits morceaux.', 'externe'],
  ['Pierre croyait que sa sœur dormait. En réalité, Julie, inquiète, guettait son retour. Aucun des deux ne savait que leur père ne rentrerait pas.', 'omniscient'],
  ['Le marchand pensait avoir fait une bonne affaire ; le client, lui, se réjouissait de l’avoir trompé. Tous deux allaient bientôt le regretter.', 'omniscient'],
  ['Dans le village, chacun avait son secret : le boulanger craignait la ruine, le maire rêvait de partir, et la petite Rose savait qui avait volé la cloche.', 'omniscient'],
  ['Le roi ignorait que son fidèle conseiller préparait sa chute depuis des années. Le conseiller, lui, ne se doutait pas que la reine l’avait percé à jour.', 'omniscient'],
];

/** La phrase d'erreur : PIEGES_PDV[bonne][choisie]. */
const PIEGES_PDV = {
  interne: { externe: 'pdv-interne', omniscient: 'pdv-un-seul' },
  externe: { interne: 'pdv-externe', omniscient: 'pdv-externe' },
  omniscient: { interne: 'pdv-plusieurs', externe: 'pdv-omniscient' },
};

/** [indice, point de vue]. */
const INDICES = [
  ['Le narrateur sait tout : les pensées de chacun, le passé et l’avenir.', 'omniscient'],
  ['On ne voit que ce qu’une caméra filmerait : des gestes, des paroles, le décor. Aucune pensée.', 'externe'],
  ['On découvre l’histoire par les yeux d’un seul personnage, avec ses sensations et ses doutes.', 'interne'],
  ['Le lecteur ignore ce que pensent les personnages : il ne voit que leurs actions.', 'externe'],
  ['Le narrateur annonce ce qui arrivera aux personnages des années plus tard.', 'omniscient'],
  ['Le lecteur sait ce que ressent l’héroïne, mais rien des pensées des autres.', 'interne'],
  ['Le narrateur révèle à la fois ce que pensent le voleur et le policier.', 'omniscient'],
];

// ------------------------------------------------------------------ 3e

const GENRES = {
  autobiographie: 'Autobiographie',
  biographie: 'Biographie',
  roman: 'Roman en « je »',
  journal: 'Journal intime',
  memoires: 'Mémoires',
};

/** [situation, genre, deux autres genres]. */
const QUEL_GENRE = [
  ['Un écrivain raconte sa propre enfance, sous son vrai nom, en disant je.', 'autobiographie', ['roman', 'biographie']],
  ['Un écrivain raconte la vie de Victor Hugo, de sa naissance à sa mort.', 'biographie', ['autobiographie', 'roman']],
  ['Un écrivain fait dire je à un jeune marin imaginaire, qui raconte ses voyages.', 'roman', ['autobiographie', 'biographie']],
  ['Jour après jour, une adolescente note ses pensées dans un cahier, en datant chaque page.', 'journal', ['roman', 'biographie']],
  ['Un ancien ministre raconte les grands événements politiques dont il a été le témoin et l’acteur.', 'memoires', ['biographie', 'roman']],
  ['Dans « Les Mots », Jean-Paul Sartre raconte sa propre enfance et dit je.', 'autobiographie', ['biographie', 'roman']],
  ['Dans « Enfance », Nathalie Sarraute fait revivre ses souvenirs de petite fille.', 'autobiographie', ['biographie', 'journal']],
  ['Cachée pendant la guerre, Anne Frank écrit dans son cahier des lettres datées, adressées à une amie imaginaire, Kitty.', 'journal', ['biographie', 'roman']],
  ['Dans « Robinson Crusoé », le héros raconte son naufrage en disant je ; il n’a jamais existé.', 'roman', ['autobiographie', 'biographie']],
  ['Un historien retrace la vie de Jeanne d’Arc à partir des archives de son procès.', 'biographie', ['autobiographie', 'roman']],
  ['Un écrivain invente un adolescent qui raconte, en disant je, sa première année de lycée.', 'roman', ['autobiographie', 'journal']],
  ['Dans « Si le grain ne meurt », André Gide raconte sa jeunesse sous son propre nom.', 'autobiographie', ['biographie', 'roman']],
  ['Dans ses « Mémoires de guerre », Charles de Gaulle raconte les années de guerre qu’il a vécues au premier rang.', 'memoires', ['biographie', 'roman']],
];

const ROLES = { auteur: 'L’auteur', narrateur: 'Le narrateur', personnage: 'Le personnage' };

/** [question sur l'autobiographie de Paul Morel, rôle]. */
const QUI_EST_QUI = [
  ['Paul Morel publie ses souvenirs d’enfance. Le nom imprimé sur la couverture désigne…', 'auteur'],
  ['« Aujourd’hui encore, quand j’y repense, je rougis. » Celui qui dit je, au moment où il écrit, c’est…', 'narrateur'],
  ['« À sept ans, je me cachais sous la table dès qu’on sonnait. » Le petit garçon caché sous la table, c’est…', 'personnage'],
  ['« Je n’ai jamais oublié ce jour-là. » Celui qui se souvient, en écrivant, c’est…', 'narrateur'],
  ['« J’avais dix ans et je courais dans les prés. » L’enfant qui court dans les prés, c’est…', 'personnage'],
  ['La personne réelle qui a écrit le livre et signé le contrat avec l’éditeur, c’est…', 'auteur'],
  ['« Je le comprends mieux maintenant : j’avais simplement peur. » Celui qui juge son passé, avec le recul, c’est…', 'narrateur'],
  ['« Je grimpai sur le toit pour récupérer mon ballon. » Celui qui grimpe sur le toit, c’est…', 'personnage'],
  ['Celui qui décide de publier ses souvenirs et choisit le titre du livre, c’est…', 'auteur'],
  ['« Je ne savais pas encore que cette rencontre changerait ma vie. » Celui qui connaît déjà la suite, c’est…', 'narrateur'],
  ['« Je pleurai toute la nuit, seul dans le dortoir. » Celui qui pleure dans le dortoir, c’est…', 'personnage'],
];

/** [question, bonne, deux autres, phrase du fait juste]. */
const PACTE = [
  ['Qui a défini le « pacte autobiographique » ?', 'Philippe Lejeune', ['Jean-Jacques Rousseau', 'Victor Hugo'], 'pacte-lejeune'],
  ['Par le pacte autobiographique, l’auteur promet au lecteur…', 'De dire la vérité sur lui-même', ['D’inventer une belle histoire', 'De raconter la vie d’un autre'], 'pacte-verite'],
  ['Pour qu’il y ait autobiographie, l’auteur, le narrateur et le personnage principal doivent…', 'Être la même personne', ['Être trois personnes différentes', 'Être des personnages inventés'], 'pacte-identite'],
  ['Qui ouvre ses « Confessions » en promettant de se montrer « dans toute la vérité de la nature » ?', 'Jean-Jacques Rousseau', ['Victor Hugo', 'Molière'], 'pacte-rousseau'],
  ['Un roman dont le héros ressemble à l’auteur, mais porte un autre nom, s’appelle…', 'Un roman autobiographique', ['Une autobiographie', 'Une biographie'], 'pacte-roman-autobiographique'],
  ['Dans une autobiographie, celui qui dit je…', 'Est l’auteur lui-même', ['Est un personnage inventé', 'Est un témoin extérieur'], 'pacte-identite'],
  ['Même sincère, pourquoi un autobiographe peut-il se tromper ?', 'Sa mémoire est imparfaite', ['Il est obligé d’inventer', 'Il raconte la vie d’un autre'], 'pacte-memoire'],
];

// ------------------------------------------------------------------ fabriques

const fabriquerNarrateur = ([question, bonne, dialogue], melanger) => {
  const autre = bonne === 'personnage' ? 'exterieur' : 'personnage';
  const phrase = dialogue ? 'narrateur-dialogue' : `narrateur-${bonne}`;
  return {
    consigne: 'qui-raconte',
    question,
    bonne,
    choix: melanger([bonne, autre]).map((c) => ({ cle: c, libelle: NARRATEURS[c] })),
    pieges: { [autre]: phrase },
    aide: phrase,
  };
};

const fabriquerPdv = (consigne) => ([question, bonne], melanger) => {
  const autres = Object.keys(POINTS_DE_VUE).filter((c) => c !== bonne);
  return {
    consigne,
    question,
    bonne,
    choix: melanger(Object.keys(POINTS_DE_VUE)).map((c) => ({ cle: c, libelle: POINTS_DE_VUE[c] })),
    pieges: Object.fromEntries(autres.map((c) => [c, PIEGES_PDV[bonne][c]])),
    aide: `pdv-${bonne}`,
  };
};

const fabriquerGenre = ([question, bonne, autres], melanger) => ({
  consigne: 'quel-genre',
  question,
  bonne,
  choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: GENRES[c] })),
  pieges: Object.fromEntries(autres.map((c) => [c, `genre-${bonne}`])),
  aide: `genre-${bonne}`,
});

const fabriquerRole = ([question, bonne], melanger) => {
  const autres = Object.keys(ROLES).filter((c) => c !== bonne);
  return {
    consigne: 'qui-est-qui',
    question,
    bonne,
    choix: melanger(Object.keys(ROLES)).map((c) => ({ cle: c, libelle: ROLES[c] })),
    pieges: Object.fromEntries(autres.map((c) => [c, `role-${bonne}`])),
    aide: `role-${bonne}`,
  };
};

const fabriquerPacte = ([question, bonne, autres, phrase], melanger) => ({
  consigne: 'pacte',
  question,
  bonne,
  choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(autres.map((c) => [c, phrase])),
  aide: phrase,
});

export const SORTES = {
  SIXIEME: [
    { banque: EXTRAITS, nombre: 3, fabriquer: fabriquerNarrateur },
    { banque: PDV, nombre: 3, fabriquer: fabriquerPdv('point-de-vue') },
    { banque: INDICES, nombre: 2, fabriquer: fabriquerPdv('ce-que-sait') },
  ],
  TROISIEME: [
    { banque: QUEL_GENRE, nombre: 3, fabriquer: fabriquerGenre },
    { banque: QUI_EST_QUI, nombre: 3, fabriquer: fabriquerRole },
    { banque: PACTE, nombre: 2, fabriquer: fabriquerPacte },
  ],
};

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { melanger } = outils(graine);
  const sortes = SORTES[niveau] ?? SORTES[CLASSES[0]];
  const liste = sortes.flatMap(({ banque, nombre, fabriquer }) => melanger(banque).slice(0, nombre).map((item) => fabriquer(item, melanger)));
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 6e
  'qui-raconte': 'Qui raconte cette histoire ? Un narrateur personnage, ou un narrateur extérieur ?',
  'point-de-vue': 'À travers quels yeux voit-on la scène ? Choisis le point de vue.',
  'ce-que-sait': 'Que sait le narrateur ? Retrouve le point de vue qui correspond.',
  'qui-raconte-regle': 'Cherche le je en dehors des guillemets : s’il y en a un, le narrateur est un personnage ; sinon, il est extérieur.',
  'point-de-vue-regle': 'Un seul personnage dont on partage les pensées : interne. Aucune pensée : externe. Les pensées de tous, et l’avenir : omniscient.',
  'ce-que-sait-regle': 'Un seul personnage dont on partage les pensées : interne. Aucune pensée : externe. Les pensées de tous, et l’avenir : omniscient.',
  'narrateur-personnage': 'Celui qui raconte dit je, en dehors des guillemets, et vit ce qu’il raconte : c’est un narrateur personnage.',
  'narrateur-exterieur': 'Celui qui raconte dit il ou elle : il ne participe pas à l’histoire. C’est un narrateur extérieur.',
  'narrateur-dialogue': 'Le je est entre guillemets : c’est un personnage qui parle. Mais le récit, autour, dit il ou elle : le narrateur est extérieur.',
  'pdv-interne': 'On voit et on ressent tout à travers un seul personnage : ses sensations, ses pensées, ses doutes. C’est le point de vue interne.',
  'pdv-externe': 'On ne voit que ce qu’une caméra filmerait : des gestes, des paroles, aucune pensée. C’est le point de vue externe.',
  'pdv-omniscient': 'Le narrateur connaît les pensées de plusieurs personnages, et même ce qui va arriver : c’est le point de vue omniscient.',
  'pdv-un-seul': 'On connaît les pensées d’un seul personnage, et on ne voit que ce qu’il voit : c’est le point de vue interne, pas omniscient.',
  'pdv-plusieurs': 'Ici, on entre dans la tête de plusieurs personnages, ou on connaît l’avenir : aucun personnage ne pourrait savoir tout cela. C’est le point de vue omniscient.',
  // 3e
  'quel-genre': 'Autobiographie, biographie, roman, journal ou mémoires ? Retrouve le genre.',
  'qui-est-qui': 'Dans cette autobiographie, qui est désigné : l’auteur, le narrateur, ou le personnage ?',
  pacte: 'Le pacte autobiographique : choisis la bonne réponse.',
  'quel-genre-regle': 'Demande-toi qui dit je, et si cette personne a vraiment existé : c’est ce qui distingue l’autobiographie du roman et de la biographie.',
  'qui-est-qui-regle': 'L’auteur signe le livre ; le narrateur raconte, au moment où il écrit ; le personnage agit, au moment des faits.',
  'pacte-regle': 'Dans le pacte autobiographique, l’auteur, le narrateur et le personnage sont la même personne, et l’auteur promet de dire vrai.',
  'genre-autobiographie': 'L’auteur, le narrateur et le personnage principal sont la même personne, réelle, qui raconte sa propre vie : c’est une autobiographie.',
  'genre-biographie': 'L’auteur raconte la vie d’une autre personne, réelle, en disant il ou elle : c’est une biographie.',
  'genre-roman': 'Le je est celui d’un personnage inventé : l’auteur n’est pas le narrateur. C’est un roman à la première personne.',
  'genre-journal': 'On écrit au jour le jour, en datant ses pages, sans connaître la suite : c’est un journal intime.',
  'genre-memoires': 'L’auteur raconte sa vie surtout à travers les grands événements dont il a été témoin : ce sont des mémoires.',
  'role-auteur': 'L’auteur est la personne réelle qui écrit et signe le livre : son nom est sur la couverture.',
  'role-narrateur': 'Le narrateur est celui qui raconte, au moment où il écrit : il se souvient, il juge, il connaît déjà la suite.',
  'role-personnage': 'Le personnage est celui qui agit dans l’histoire, au moment des faits : ici, l’enfant d’autrefois.',
  'pacte-lejeune': 'C’est Philippe Lejeune qui a défini le pacte autobiographique : l’auteur, le narrateur et le personnage sont la même personne, et l’auteur s’engage à dire vrai.',
  'pacte-verite': 'Par le pacte autobiographique, l’auteur s’engage auprès du lecteur à dire la vérité sur sa propre vie.',
  'pacte-identite': 'Dans une autobiographie, l’auteur, le narrateur et le personnage principal sont une seule et même personne.',
  'pacte-rousseau': 'Jean-Jacques Rousseau ouvre ses Confessions en promettant de se montrer tout entier, dans toute la vérité de la nature.',
  'pacte-roman-autobiographique': 'Quand le héros ressemble à l’auteur mais porte un autre nom, l’auteur ne s’engage pas à dire vrai : c’est un roman autobiographique.',
  'pacte-memoire': 'Même sincère, l’autobiographe se souvient avec une mémoire imparfaite : il peut oublier, ou embellir sans le vouloir.',
};
