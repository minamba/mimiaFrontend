/**
 * DIEUX ET HÉROS — les textes fondateurs de la 6e.
 * Professeur : Adrien (français).
 *
 * LE PROGRAMME DE 6e (« Récits de création ; création poétique », « Le monstre,
 * aux limites de l'humain », « Récits d'aventures ») fait lire l'Odyssée
 * d'Homère, les Métamorphoses d'Ovide, la Genèse et d'autres récits de
 * création. Le jeu en reprend les personnages, les épisodes les plus étudiés,
 * et les mots que la langue en a gardés.
 *
 * EXACTITUDE : chaque fait a été vérifié contre les textes (Odyssée : le
 * Cyclope et « Personne », les Sirènes et la cire, Argos, l'arc ; Ovide :
 * Daphné, Narcisse et Écho, Arachné, Midas ; Hésiode : Pandore et Prométhée ;
 * Genèse : six jours de création et le septième de repos, Éden, Noé, Babel).
 * Les choix faux sont des noms réels du même monde, pris pour leur
 * ressemblance : Dédale pour Icare, Calypso pour Circé, sept jours pour six.
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - QUI EST-CE ? (3) : un portrait, trois noms ;
 *   - L'ÉPISODE (3) : ce qui se passe dans le récit ;
 *   - LES MOTS DES MYTHES (2) : panique, écho, odyssée, dédale, médusé…
 * Chaque erreur rappelle le fait juste, en une phrase fixe.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'dieux-et-heros', titre: 'Dieux et héros', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Dieux et héros',
    accroche: 'Ulysse, Zeus, Noé : les récits fondateurs.',
    competences: ['FR_6E_LECT_MYTHE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [portrait, bonne réponse, deux autres, phrase du fait juste]. */
const PORTRAITS = [
  ['Roi des dieux de l’Olympe, il lance la foudre.', 'Zeus', ['Poséidon', 'Hadès'], 'qui-zeus'],
  ['Dieu des mers, il tient un trident et poursuit Ulysse de sa colère.', 'Poséidon', ['Zeus', 'Arès'], 'qui-poseidon'],
  ['Déesse de la sagesse, née tout armée de la tête de son père, elle protège Ulysse.', 'Athéna', ['Héra', 'Aphrodite'], 'qui-athena'],
  ['Il règne sur le monde des morts, les Enfers.', 'Hadès', ['Hermès', 'Poséidon'], 'qui-hades'],
  ['Messager des dieux, il porte des sandales ailées.', 'Hermès', ['Apollon', 'Arès'], 'qui-hermes'],
  ['Héros aux douze travaux, il étouffe le lion de Némée.', 'Héraclès', ['Thésée', 'Persée'], 'qui-heracles'],
  ['Il tue le Minotaure dans le labyrinthe, puis en ressort grâce au fil d’Ariane.', 'Thésée', ['Héraclès', 'Ulysse'], 'qui-thesee'],
  ['Il coupe la tête de Méduse sans croiser son regard.', 'Persée', ['Thésée', 'Jason'], 'qui-persee'],
  ['Roi d’Ithaque, il met dix ans à rentrer chez lui après la guerre de Troie.', 'Ulysse', ['Achille', 'Énée'], 'qui-ulysse'],
  ['Épouse d’Ulysse, elle défait chaque nuit la toile qu’elle tisse le jour, pour faire attendre ses prétendants.', 'Pénélope', ['Hélène', 'Circé'], 'qui-penelope'],
  ['Il vole le feu des dieux pour le donner aux hommes.', 'Prométhée', ['Hermès', 'Icare'], 'qui-promethee'],
  ['Magicienne, elle change les compagnons d’Ulysse en porcs.', 'Circé', ['Calypso', 'Pénélope'], 'qui-circe'],
  ['Cyclope géant, fils de Poséidon, il est aveuglé par Ulysse.', 'Polyphème', ['Le Minotaure', 'Cerbère'], 'qui-polypheme'],
  ['Déesse de l’amour et de la beauté, les Romains l’appellent Vénus.', 'Aphrodite', ['Athéna', 'Héra'], 'qui-aphrodite'],
  ['Avec des ailes collées à la cire, il vole trop près du soleil et tombe dans la mer.', 'Icare', ['Dédale', 'Persée'], 'qui-icare'],
  ['Chez les Romains, le roi des dieux ne s’appelle pas Zeus, mais…', 'Jupiter', ['Mars', 'Neptune'], 'qui-jupiter'],
];

const EPISODES = [
  ['Odyssée. Comment Ulysse et ses compagnons sortent-ils de la grotte du Cyclope ?', 'Accrochés sous des béliers', ['Changés en oiseaux', 'Sur le dos du Cyclope'], 'ep-cyclope'],
  ['Odyssée. Quel nom Ulysse donne-t-il au Cyclope ?', 'Personne', ['Nestor', 'Achille'], 'ep-personne'],
  ['Odyssée. Que font les marins d’Ulysse pour ne pas entendre le chant des Sirènes ?', 'De la cire dans les oreilles', ['Ils chantent plus fort', 'Ils dorment au fond du navire'], 'ep-sirenes'],
  ['Odyssée. À Ithaque, quel animal reconnaît Ulysse déguisé en mendiant ?', 'Son chien Argos', ['Son cheval', 'Une chouette'], 'ep-argos'],
  ['Odyssée. Quelle épreuve Pénélope impose-t-elle aux prétendants ?', 'Tendre l’arc d’Ulysse', ['Vaincre un taureau', 'Résoudre une énigme'], 'ep-arc'],
  ['Métamorphoses. Pour échapper à Apollon, en quoi Daphné est-elle changée ?', 'En laurier', ['En rocher', 'En biche'], 'ep-daphne'],
  ['Métamorphoses. Quel don le roi Midas obtient-il de Dionysos ?', 'Changer en or ce qu’il touche', ['Vivre éternellement', 'Voler comme un oiseau'], 'ep-midas'],
  ['Métamorphoses. Qu’arrive-t-il à Narcisse ?', 'Il s’éprend de son reflet', ['Il est changé en loup', 'Il vole le feu'], 'ep-narcisse'],
  ['Métamorphoses. Pourquoi Arachné est-elle changée en araignée ?', 'Elle a défié Athéna au tissage', ['Elle a volé un trésor', 'Elle a menti à Zeus'], 'ep-arachne'],
  ['Genèse. En combien de jours Dieu crée-t-il le monde, avant de se reposer ?', 'Six', ['Sept', 'Dix'], 'ep-six-jours'],
  ['Genèse. Pourquoi Adam et Ève sont-ils chassés du jardin d’Éden ?', 'Ils ont mangé le fruit défendu', ['Ils ont tué le serpent', 'Ils ont bâti une tour'], 'ep-eden'],
  ['Genèse. Qui construit une arche pour survivre au Déluge ?', 'Noé', ['Abraham', 'Moïse'], 'ep-noe'],
  ['Quelle ruse Ulysse imagine-t-il pour prendre la ville de Troie ?', 'Un cheval de bois', ['Un taureau d’or', 'Un aigle de bronze'], 'ep-cheval'],
  ['Mythe grec de Pandore. Que s’échappe-t-il de la jarre qu’elle ouvre ?', 'Les maux de l’humanité', ['Le feu des dieux', 'L’or de Midas'], 'ep-pandore'],
  ['Genèse. Comment s’appelle la tour que les hommes veulent élever jusqu’au ciel ?', 'Babel', ['Éden', 'Sion'], 'ep-babel'],
];

const MOTS = [
  ['Le mot « panique » vient du nom de…', 'Pan, dieu des bergers', ['Pandore', 'Poséidon'], 'mot-panique'],
  ['Le mot « écho » vient du nom de…', 'La nymphe Écho', ['Le dieu Hermès', 'Le fleuve Styx'], 'mot-echo'],
  ['« Une odyssée », un long voyage plein d’aventures, vient du nom de…', 'Ulysse, Odysseus en grec', ['Héraclès', 'Jason'], 'mot-odyssee'],
  ['« Le talon d’Achille », c’est un point faible. Pourquoi ?', 'Seul son talon était vulnérable', ['Il boitait', 'Il avait perdu une sandale'], 'mot-achille'],
  ['« Une force herculéenne » vient du héros…', 'Hercule, ou Héraclès', ['Hermès', 'Hector'], 'mot-hercule'],
  ['« Un dédale de ruelles » : le mot vient de…', 'Dédale, l’architecte du labyrinthe', ['Icare', 'Thésée'], 'mot-dedale'],
  ['Une personne « narcissique » est une personne qui…', 'S’admire elle-même', ['A peur de tout', 'Parle sans arrêt'], 'mot-narcisse'],
  ['« Ouvrir la boîte de Pandore », c’est…', 'Déclencher des malheurs', ['Trouver un trésor', 'Garder un secret'], 'mot-pandore'],
  ['« Être médusé », c’est être…', 'Figé de stupeur', ['Très en colère', 'Couvert de serpents'], 'mot-meduse'],
  ['« Le fil d’Ariane », c’est…', 'Ce qui guide pour ne pas se perdre', ['Un piège', 'Une longue attente'], 'mot-ariane'],
  ['« Un supplice de Tantale », c’est…', 'Désirer sans jamais obtenir', ['Être enfermé', 'Courir sans fin'], 'mot-tantale'],
];

const fabriquer = (consigne) => ([question, bonne, autres, phrase], melanger) => ({
  consigne,
  question,
  bonne,
  choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(autres.map((c) => [c, phrase])),
  aide: phrase,
});

export const SORTES = {
  SIXIEME: [
    { banque: PORTRAITS, nombre: 3, fabriquer: fabriquer('qui-est-ce') },
    { banque: EPISODES, nombre: 3, fabriquer: fabriquer('episode') },
    { banque: MOTS, nombre: 2, fabriquer: fabriquer('mot-des-mythes') },
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
  'qui-est-ce': 'Quel dieu, quelle déesse ou quel héros se cache derrière ce portrait ?',
  episode: 'Que se passe-t-il dans ce récit fondateur ? Choisis la bonne réponse.',
  'mot-des-mythes': 'Ce mot, ou cette expression, nous vient des mythes. Que veut-il dire, ou d’où vient-il ?',
  'qui-est-ce-regle': 'Chaque dieu a son domaine et ses attributs : la foudre pour Zeus, le trident pour Poséidon, les sandales ailées pour Hermès.',
  'episode-regle': 'Repense au récit, étape par étape : qui agit, contre qui, et avec quelle ruse ?',
  'mot-des-mythes-regle': 'Beaucoup de nos mots gardent le nom d’un dieu ou d’un héros : retrouve son histoire, et le sens du mot suit.',
  'qui-zeus': 'Zeus est le roi des dieux : il règne sur l’Olympe et lance la foudre. Les Romains l’appellent Jupiter.',
  'qui-poseidon': 'Poséidon est le dieu des mers, armé d’un trident. Ulysse a aveuglé son fils, le Cyclope : le dieu le poursuit de sa colère.',
  'qui-athena': 'Athéna, déesse de la sagesse, est née tout armée de la tête de Zeus. Dans l’Odyssée, elle protège Ulysse.',
  'qui-hades': 'Hadès, frère de Zeus, règne sur les Enfers, le royaume des morts.',
  'qui-hermes': 'Hermès est le messager des dieux : il porte des sandales ailées et un casque ailé.',
  'qui-heracles': 'Héraclès, Hercule chez les Romains, accomplit douze travaux ; le premier est la victoire sur le lion de Némée.',
  'qui-thesee': 'Thésée tue le Minotaure dans le labyrinthe, et retrouve la sortie grâce au fil que lui a donné Ariane.',
  'qui-persee': 'Persée coupe la tête de Méduse en regardant son reflet dans son bouclier, pour ne pas être changé en pierre.',
  'qui-ulysse': 'Ulysse, roi d’Ithaque, combat dix ans à Troie, puis erre encore dix ans sur la mer avant de rentrer chez lui.',
  'qui-penelope': 'Pénélope, l’épouse d’Ulysse, promet de choisir un prétendant quand sa toile sera finie, et la défait chaque nuit.',
  'qui-promethee': 'Prométhée vole le feu des dieux pour le donner aux hommes. Zeus le punit en l’enchaînant à un rocher.',
  'qui-circe': 'Circé, la magicienne, change les compagnons d’Ulysse en porcs. Calypso, elle, retient Ulysse sur son île.',
  'qui-polypheme': 'Polyphème est le Cyclope, fils de Poséidon, qu’Ulysse aveugle pour s’échapper de sa grotte.',
  'qui-aphrodite': 'Aphrodite est la déesse de l’amour et de la beauté ; les Romains l’appellent Vénus.',
  'qui-icare': 'Icare s’envole avec des ailes de plumes et de cire fabriquées par son père, Dédale. Il monte trop près du soleil, la cire fond, et il tombe.',
  'qui-jupiter': 'Les Romains ont repris les dieux grecs sous d’autres noms : Zeus devient Jupiter, Poséidon devient Neptune, Arès devient Mars.',
  'ep-cyclope': 'Ulysse enivre et aveugle le Cyclope, puis ses compagnons et lui sortent de la grotte accrochés sous le ventre des béliers.',
  'ep-personne': 'Ulysse dit au Cyclope qu’il s’appelle Personne : quand le géant crie que Personne l’attaque, les autres Cyclopes ne viennent pas l’aider.',
  'ep-sirenes': 'Les marins se bouchent les oreilles avec de la cire ; Ulysse, lui, se fait attacher au mât pour écouter le chant sans danger.',
  'ep-argos': 'Le vieux chien Argos reconnaît son maître malgré son déguisement de mendiant ; il remue la queue, puis il meurt.',
  'ep-arc': 'Pénélope promet d’épouser celui qui tendra l’arc d’Ulysse et fera passer une flèche à travers douze haches : seul Ulysse y parvient.',
  'ep-daphne': 'Pour échapper à Apollon, Daphné est changée en laurier : depuis, le laurier est l’arbre d’Apollon.',
  'ep-midas': 'Midas obtient de changer en or tout ce qu’il touche, même sa nourriture : il doit supplier le dieu de lui retirer ce don.',
  'ep-narcisse': 'Narcisse tombe amoureux de son propre reflet dans l’eau ; il dépérit, et une fleur pousse à sa place, le narcisse.',
  'ep-arachne': 'Arachné se vante de tisser mieux qu’Athéna, Minerve chez les Romains, et la défie : la déesse la change en araignée.',
  'ep-six-jours': 'Selon la Genèse, Dieu crée le monde en six jours, et il se repose le septième.',
  'ep-eden': 'Adam et Ève mangent le fruit de l’arbre de la connaissance, que Dieu leur avait interdit : ils sont chassés du jardin d’Éden.',
  'ep-noe': 'Noé construit l’arche et y fait monter sa famille et un couple de chaque espèce d’animaux, pour survivre au Déluge.',
  'ep-cheval': 'Pour prendre Troie, Ulysse imagine un grand cheval de bois, dans lequel se cachent des guerriers grecs.',
  'ep-pandore': 'En ouvrant la jarre, Pandore libère tous les maux sur les hommes ; seule l’espérance reste au fond.',
  'ep-babel': 'Les hommes veulent bâtir la tour de Babel jusqu’au ciel ; Dieu brouille leurs langues, et ils ne se comprennent plus.',
  'mot-panique': 'Pan, dieu des bergers et de la nature, provoquait des peurs soudaines et sans raison : une peur panique.',
  'mot-echo': 'La nymphe Écho, punie par Héra, ne peut plus que répéter les derniers mots qu’elle entend.',
  'mot-odyssee': 'Ulysse s’appelle Odysseus en grec : son long voyage de retour a donné le mot odyssée.',
  'mot-achille': 'Sa mère l’avait plongé dans le Styx en le tenant par le talon : c’était le seul endroit où Achille pouvait être blessé.',
  'mot-hercule': 'Héraclès, Hercule chez les Romains, avait une force immense : une force herculéenne est une force hors du commun.',
  'mot-dedale': 'Dédale est l’architecte qui a construit le labyrinthe du Minotaure : un dédale est un lieu où l’on se perd.',
  'mot-narcisse': 'Narcisse tomba amoureux de son propre reflet : une personne narcissique ne cesse de s’admirer.',
  'mot-pandore': 'Pandore a ouvert la jarre d’où sont sortis tous les maux : ouvrir la boîte de Pandore, c’est déclencher une suite de malheurs.',
  'mot-meduse': 'Le regard de Méduse changeait en pierre ceux qui la regardaient : être médusé, c’est rester figé de stupeur.',
  'mot-ariane': 'Ariane donna à Thésée un fil pour retrouver la sortie du labyrinthe : le fil d’Ariane, c’est ce qui guide.',
  'mot-tantale': 'Tantale, puni aux Enfers, ne pouvait jamais atteindre l’eau ni les fruits tout proches de lui : c’est désirer sans jamais obtenir.',
};
