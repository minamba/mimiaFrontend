/**
 * LA CULTURE LITTÉRAIRE — qui a écrit quoi, quand, dans quel genre, dans
 * quel mouvement. 1re générale et technologique. Professeur : Adrien.
 *
 * UNIQUEMENT des œuvres canoniques et des faits certains, relus un à un.
 * Aucune œuvre n'y est présentée comme « au programme » : ce n'est pas
 * l'objet du jeu, et les œuvres des programmes limitatifs récents en sont
 * volontairement absentes. Une date n'est donnée que lorsqu'elle est sûre ;
 * sinon, la question se pose au siècle. Le genre n'est demandé que lorsqu'il
 * ne se discute pas (ni Le Cid, ni Cyrano, ni les Fables).
 *
 * CINQ SORTES DE MANCHES (2 + 1 + 2 + 2 + 1) :
 *   - L'AUTEUR (2) : qui a écrit cette œuvre ? LES PIÈGES : un écrivain du
 *     même siècle, un écrivain d'un autre siècle — chacun a sa phrase ;
 *   - L'ŒUVRE (1) : laquelle de ces œuvres cet écrivain a-t-il écrite ?
 *   - LE SIÈCLE (2) : le bon et ses deux voisins ;
 *   - LE GENRE (2) : tragédie, comédie, drame romantique, roman, roman
 *     épistolaire, conte philosophique, recueil de poèmes, essai,
 *     autobiographie ;
 *   - LE MOUVEMENT (1) : humanisme, classicisme, Lumières, romantisme,
 *     réalisme, naturalisme, symbolisme, surréalisme ; les mouvements
 *     proposés à côté sont d'un autre siècle, pour qu'aucun écrivain « à
 *     cheval » ne rende deux réponses défendables.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'culture-litteraire', titre: 'La culture littéraire', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'La culture littéraire',
    accroche: 'Qui a écrit quoi, et quand ?',
    competences: ['FR_1RE_LECT_PARCOURS', 'FR_1RE_ECR_EXEMPLES'],
  },
  PREMIERE_TECHNO: {
    titre: 'La culture littéraire',
    accroche: 'Qui a écrit quoi, et quand ?',
    competences: ['FR_1TEC_LECT_CONTEXTE', 'FR_1TEC_ECR_ETAYER_ESSAI'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [titre, auteur, siècle, genre (null : on ne le demande pas), année de parution sûre (ou null)]. */
export const OEUVRES = [
  // XVIe siècle
  ['Les Essais', 'Montaigne', 16, 'essai', 1580],
  ['Les Regrets', 'Joachim du Bellay', 16, 'poesie', 1558],
  ['Défense et illustration de la langue française', 'Joachim du Bellay', 16, null, 1549],
  ['Les Amours', 'Pierre de Ronsard', 16, 'poesie', null],
  ['L’Heptaméron', 'Marguerite de Navarre', 16, null, null],
  // XVIIe siècle
  ['Le Cid', 'Pierre Corneille', 17, null, 1637],
  ['Horace', 'Pierre Corneille', 17, 'tragedie', null],
  ['Cinna', 'Pierre Corneille', 17, 'tragedie', null],
  ['Phèdre', 'Jean Racine', 17, 'tragedie', 1677],
  ['Andromaque', 'Jean Racine', 17, 'tragedie', null],
  ['Britannicus', 'Jean Racine', 17, 'tragedie', null],
  ['Bérénice', 'Jean Racine', 17, 'tragedie', null],
  ['Tartuffe', 'Molière', 17, 'comedie', null],
  ['Le Misanthrope', 'Molière', 17, 'comedie', null],
  ['L’Avare', 'Molière', 17, 'comedie', null],
  ['Dom Juan', 'Molière', 17, 'comedie', null],
  ['Les Fables', 'Jean de La Fontaine', 17, null, null],
  ['La Princesse de Clèves', 'Madame de La Fayette', 17, 'roman', 1678],
  ['Pensées', 'Blaise Pascal', 17, null, null],
  ['Discours de la méthode', 'René Descartes', 17, null, 1637],
  ['Histoires ou contes du temps passé', 'Charles Perrault', 17, null, 1697],
  // XVIIIe siècle
  ['Candide', 'Voltaire', 18, 'conte-philo', 1759],
  ['Zadig', 'Voltaire', 18, 'conte-philo', null],
  ['Micromégas', 'Voltaire', 18, 'conte-philo', 1752],
  ['Lettres persanes', 'Montesquieu', 18, 'epistolaire', 1721],
  ['De l’esprit des lois', 'Montesquieu', 18, null, 1748],
  ['Les Confessions', 'Jean-Jacques Rousseau', 18, 'autobiographie', null],
  ['Du contrat social', 'Jean-Jacques Rousseau', 18, null, 1762],
  ['Jacques le fataliste', 'Denis Diderot', 18, 'roman', null],
  ['Le Neveu de Rameau', 'Denis Diderot', 18, null, null],
  ['Le Mariage de Figaro', 'Beaumarchais', 18, 'comedie', null],
  ['Le Barbier de Séville', 'Beaumarchais', 18, 'comedie', 1775],
  ['Le Jeu de l’amour et du hasard', 'Marivaux', 18, 'comedie', 1730],
  ['Les Liaisons dangereuses', 'Choderlos de Laclos', 18, 'epistolaire', 1782],
  ['Paul et Virginie', 'Bernardin de Saint-Pierre', 18, 'roman', 1788],
  // XIXe siècle
  ['Les Fleurs du mal', 'Charles Baudelaire', 19, 'poesie', 1857],
  ['Le Spleen de Paris', 'Charles Baudelaire', 19, null, null],
  ['Les Misérables', 'Victor Hugo', 19, 'roman', 1862],
  ['Notre-Dame de Paris', 'Victor Hugo', 19, 'roman', 1831],
  ['Les Contemplations', 'Victor Hugo', 19, 'poesie', 1856],
  ['Hernani', 'Victor Hugo', 19, 'drame', 1830],
  ['Ruy Blas', 'Victor Hugo', 19, 'drame', 1838],
  ['Le Rouge et le Noir', 'Stendhal', 19, 'roman', 1830],
  ['La Chartreuse de Parme', 'Stendhal', 19, 'roman', 1839],
  ['Le Père Goriot', 'Honoré de Balzac', 19, 'roman', null],
  ['Eugénie Grandet', 'Honoré de Balzac', 19, 'roman', null],
  ['Madame Bovary', 'Gustave Flaubert', 19, 'roman', 1857],
  ['L’Éducation sentimentale', 'Gustave Flaubert', 19, 'roman', 1869],
  ['Germinal', 'Émile Zola', 19, 'roman', 1885],
  ['L’Assommoir', 'Émile Zola', 19, 'roman', 1877],
  ['Bel-Ami', 'Guy de Maupassant', 19, 'roman', 1885],
  ['Lorenzaccio', 'Alfred de Musset', 19, 'drame', 1834],
  ['Méditations poétiques', 'Alphonse de Lamartine', 19, 'poesie', 1820],
  ['Poèmes saturniens', 'Paul Verlaine', 19, 'poesie', 1866],
  ['Le Comte de Monte-Cristo', 'Alexandre Dumas', 19, 'roman', null],
  ['Cyrano de Bergerac', 'Edmond Rostand', 19, null, null],
  // XXe siècle
  ['Alcools', 'Guillaume Apollinaire', 20, 'poesie', 1913],
  ['Calligrammes', 'Guillaume Apollinaire', 20, 'poesie', 1918],
  ['À la recherche du temps perdu', 'Marcel Proust', 20, 'roman', null],
  ['Voyage au bout de la nuit', 'Louis-Ferdinand Céline', 20, 'roman', 1932],
  ['L’Étranger', 'Albert Camus', 20, 'roman', 1942],
  ['La Peste', 'Albert Camus', 20, 'roman', 1947],
  ['Nadja', 'André Breton', 20, null, 1928],
  ['Capitale de la douleur', 'Paul Éluard', 20, 'poesie', 1926],
  ['Paroles', 'Jacques Prévert', 20, 'poesie', 1946],
  ['La Cantatrice chauve', 'Eugène Ionesco', 20, null, null],
  ['En attendant Godot', 'Samuel Beckett', 20, null, null],
  ['Huis clos', 'Jean-Paul Sartre', 20, null, null],
  ['Les Mots', 'Jean-Paul Sartre', 20, 'autobiographie', null],
  ['La Condition humaine', 'André Malraux', 20, 'roman', 1933],
  ['Mémoires d’Hadrien', 'Marguerite Yourcenar', 20, 'roman', 1951],
  ['Le Petit Prince', 'Antoine de Saint-Exupéry', 20, null, 1943],
];

export const SIECLES = { 16: 'XVIe siècle', 17: 'XVIIe siècle', 18: 'XVIIIe siècle', 19: 'XIXe siècle', 20: 'XXe siècle' };
const MOT_SIECLE = { 16: 'xvi', 17: 'xvii', 18: 'xviii', 19: 'xix', 20: 'xx' };

/** Le siècle d'une année : 1801 à 1900, c'est le XIXe. */
export const siecleDe = (annee) => Math.floor((annee - 1) / 100) + 1;

export const GENRES = {
  tragedie: 'Tragédie',
  comedie: 'Comédie',
  drame: 'Drame romantique',
  roman: 'Roman',
  epistolaire: 'Roman épistolaire',
  'conte-philo': 'Conte philosophique',
  poesie: 'Recueil de poèmes',
  essai: 'Essai',
  autobiographie: 'Autobiographie',
};

/** Les genres qu'on ne propose pas à côté du bon : ils le contiennent, ou s'y confondent. */
const VOISINS = { epistolaire: ['roman'], 'conte-philo': ['roman'], roman: ['epistolaire'] };

export const MOUVEMENTS = {
  humanisme: ['Humanisme', 16],
  classicisme: ['Classicisme', 17],
  lumieres: ['Lumières', 18],
  romantisme: ['Romantisme', 19],
  realisme: ['Réalisme', 19],
  naturalisme: ['Naturalisme', 19],
  symbolisme: ['Symbolisme', 19],
  surrealisme: ['Surréalisme', 20],
};

/** [écrivain, son mouvement, sans discussion]. */
export const ECRIVAINS_MOUVEMENTS = [
  ['Montaigne', 'humanisme'],
  ['Joachim du Bellay', 'humanisme'],
  ['Pierre de Ronsard', 'humanisme'],
  ['Molière', 'classicisme'],
  ['Jean Racine', 'classicisme'],
  ['Jean de La Fontaine', 'classicisme'],
  ['Nicolas Boileau', 'classicisme'],
  ['Voltaire', 'lumieres'],
  ['Montesquieu', 'lumieres'],
  ['Denis Diderot', 'lumieres'],
  ['Victor Hugo', 'romantisme'],
  ['Alphonse de Lamartine', 'romantisme'],
  ['Alfred de Musset', 'romantisme'],
  ['Alfred de Vigny', 'romantisme'],
  ['Honoré de Balzac', 'realisme'],
  ['Gustave Flaubert', 'realisme'],
  ['Émile Zola', 'naturalisme'],
  ['Paul Verlaine', 'symbolisme'],
  ['Stéphane Mallarmé', 'symbolisme'],
  ['André Breton', 'surrealisme'],
  ['Paul Éluard', 'surrealisme'],
];

/** Le siècle de chaque écrivain, tiré de ses œuvres. */
export const SIECLE_DE = Object.fromEntries(OEUVRES.map(([, a, s]) => [a, s]));
const ECRIVAINS = Object.keys(SIECLE_DE);

const titre = ([t, , , , annee]) => `« ${t} »${annee ? ` (${annee})` : ''}`;

function auteur(t, oeuvre) {
  const [, bonne, siecle] = oeuvre;
  const meme = t.au(ECRIVAINS.filter((a) => a !== bonne && SIECLE_DE[a] === siecle));
  const autre = t.au(ECRIVAINS.filter((a) => SIECLE_DE[a] !== siecle));
  return {
    consigne: 'auteur',
    question: titre(oeuvre),
    bonne,
    choix: t.melanger([bonne, meme, autre]).map((c) => ({ cle: c, libelle: c })),
    pieges: { [meme]: 'auteur-meme-siecle', [autre]: 'auteur-autre-siecle' },
    aide: 'auteur-regle',
  };
}

function oeuvreDe(t, oeuvre) {
  const [bonne, ecrivain, siecle] = oeuvre;
  const autres = OEUVRES.filter(([, a]) => a !== ecrivain);
  const [meme] = t.au(autres.filter(([, , s]) => s === siecle));
  const [autre] = t.au(autres.filter(([, , s]) => s !== siecle));
  return {
    consigne: 'oeuvre',
    question: ecrivain,
    bonne,
    choix: t.melanger([bonne, meme, autre]).map((c) => ({ cle: c, libelle: c })),
    pieges: { [meme]: 'oeuvre-meme-siecle', [autre]: 'oeuvre-autre-siecle' },
    aide: 'oeuvre-regle',
  };
}

function siecleQuestion(t, oeuvre) {
  const [, ecrivain, siecle] = oeuvre;
  let voisins = [siecle - 1, siecle + 1];
  if (siecle === 16) voisins = [17, 18];
  if (siecle === 20) voisins = [18, 19];
  const bonne = SIECLES[siecle];
  return {
    consigne: 'siecle',
    question: `« ${oeuvre[0]} », de ${ecrivain}`,
    bonne,
    choix: [siecle, ...voisins].sort((a, b) => a - b).map((s) => ({ cle: SIECLES[s], libelle: SIECLES[s] })),
    pieges: Object.fromEntries(voisins.map((s) => [SIECLES[s], `siecle-${MOT_SIECLE[siecle]}`])),
    aide: 'siecle-regle',
  };
}

function genre(t, oeuvre) {
  const [nom, ecrivain, , bonne] = oeuvre;
  const exclus = VOISINS[bonne] ?? [];
  const autres = t.melanger(Object.keys(GENRES).filter((g) => g !== bonne && !exclus.includes(g))).slice(0, 2);
  return {
    consigne: 'genre',
    question: `« ${nom} », de ${ecrivain}`,
    bonne,
    choix: t.melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: GENRES[c] })),
    pieges: Object.fromEntries(autres.map((g) => [g, `genre-${bonne}`])),
    aide: 'genre-regle',
  };
}

function mouvement(t, [ecrivain, bonne]) {
  const siecle = MOUVEMENTS[bonne][1];
  const autres = t.melanger(Object.keys(MOUVEMENTS).filter((m) => MOUVEMENTS[m][1] !== siecle)).slice(0, 2);
  return {
    consigne: 'mouvement',
    question: ecrivain,
    bonne,
    choix: t.melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: MOUVEMENTS[c][0] })),
    pieges: Object.fromEntries(autres.map((m) => [m, `mouvement-${bonne}`])),
    aide: 'mouvement-regle',
  };
}

export function serie(graine = Date.now()) {
  const t = outils(graine);
  // Une œuvre ne sert qu'une fois par partie.
  const avecGenre = t.melanger(OEUVRES.filter(([, , , g]) => g));
  const genres = avecGenre.slice(0, 2);
  const restantes = t.melanger(OEUVRES.filter((o) => !genres.includes(o)));
  return t.melanger([
    ...restantes.slice(0, 2).map((o) => auteur(t, o)),
    oeuvreDe(t, restantes[2]),
    ...restantes.slice(3, 5).map((o) => siecleQuestion(t, o)),
    ...genres.map((o) => genre(t, o)),
    mouvement(t, t.au(ECRIVAINS_MOUVEMENTS)),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  auteur: 'Qui a écrit cette œuvre ?',
  'auteur-regle': 'Situe d’abord l’œuvre dans son siècle et dans son genre, puis cherche l’écrivain qui l’a signée.',
  'auteur-meme-siecle': 'C’est la bonne époque, mais pas le bon écrivain. Retiens pour chacun ses œuvres phares : ce sont elles qui le désignent.',
  'auteur-autre-siecle': 'Cet écrivain n’est pas du même siècle que l’œuvre : situe-la d’abord dans son époque, puis cherche parmi les écrivains de ce temps.',
  oeuvre: 'Laquelle de ces œuvres cet écrivain a-t-il écrite ?',
  'oeuvre-regle': 'Situe l’écrivain dans son siècle et dans son genre de prédilection, puis cherche l’œuvre qui lui correspond.',
  'oeuvre-meme-siecle': 'Cette œuvre est bien de la même époque, mais d’un autre écrivain. Retiens les œuvres phares de chacun.',
  'oeuvre-autre-siecle': 'Cette œuvre n’est pas du même siècle que cet écrivain : situe-le d’abord dans son époque.',

  siecle: 'En quel siècle cette œuvre a-t-elle paru ?',
  'siecle-regle': 'Rattache l’œuvre à son mouvement : chaque mouvement a son siècle, de la Renaissance au surréalisme.',
  'siecle-xvi': 'Le seizième siècle, c’est la Renaissance et l’humanisme : Montaigne, Ronsard, du Bellay.',
  'siecle-xvii': 'Le dix-septième siècle, c’est le siècle classique : Corneille, Molière, Racine, La Fontaine.',
  'siecle-xviii': 'Le dix-huitième siècle, c’est le siècle des Lumières : Voltaire, Montesquieu, Diderot, Rousseau.',
  'siecle-xix': 'Le dix-neuvième siècle, c’est le romantisme, puis le réalisme et le naturalisme : Hugo, Balzac, Flaubert, Baudelaire, Zola.',
  'siecle-xx': 'Le vingtième siècle, c’est Apollinaire, le surréalisme, puis Camus, Sartre et le théâtre de l’absurde.',

  genre: 'À quel genre appartient cette œuvre ?',
  'genre-regle': 'Pense à la forme d’abord : du théâtre, un récit en prose, des poèmes ou une réflexion ; puis au ton, tragique, comique ou philosophique.',
  'genre-tragedie': 'Des personnages nobles, une passion ou un destin qui les écrase, une fin funeste : c’est une tragédie.',
  'genre-comedie': 'Des vices et des travers moqués, des situations qui font rire, une fin heureuse : c’est une comédie.',
  'genre-drame': 'Du théâtre qui mêle le sublime et le grotesque, et brise les règles classiques : c’est un drame romantique.',
  'genre-roman': 'Un long récit en prose, avec des personnages et une intrigue : c’est un roman.',
  'genre-epistolaire': 'Le récit avance par des lettres échangées entre les personnages : c’est un roman épistolaire.',
  'genre-conte-philo': 'Un récit court et plaisant, souvent ironique, qui sert à faire passer des idées : c’est un conte philosophique.',
  'genre-poesie': 'Un ensemble de poèmes réunis par leur auteur : c’est un recueil de poèmes.',
  'genre-essai': 'Une réflexion personnelle, en prose, où l’auteur pense librement sur lui-même et sur le monde : c’est un essai.',
  'genre-autobiographie': 'L’auteur raconte sa propre vie, en son nom : c’est une autobiographie.',

  mouvement: 'À quel mouvement littéraire rattache-t-on cet écrivain ?',
  'mouvement-regle': 'Situe d’abord l’écrivain dans son siècle : chaque mouvement a le sien.',
  'mouvement-humanisme': 'L’humanisme, au seizième siècle, place l’homme et le savoir antique au centre : Montaigne, Ronsard, du Bellay.',
  'mouvement-classicisme': 'Le classicisme, au dix-septième siècle, cherche l’ordre, la mesure et le naturel : Molière, Racine, La Fontaine, Boileau.',
  'mouvement-lumieres': 'Les Lumières, au dix-huitième siècle, combattent l’intolérance par la raison : Voltaire, Montesquieu, Diderot.',
  'mouvement-romantisme': 'Le romantisme, au dix-neuvième siècle, exalte le moi, la passion et la nature : Hugo, Lamartine, Musset, Vigny.',
  'mouvement-realisme': 'Le réalisme, au dix-neuvième siècle, peint la société telle qu’elle est : Balzac, Flaubert.',
  'mouvement-naturalisme': 'Le naturalisme, à la fin du dix-neuvième siècle, pousse le réalisme vers une observation presque scientifique, autour de Zola.',
  'mouvement-symbolisme': 'Le symbolisme, à la fin du dix-neuvième siècle, suggère plus qu’il ne décrit : Verlaine, Mallarmé.',
  'mouvement-surrealisme': 'Le surréalisme, au vingtième siècle, libère le rêve et l’inconscient, autour d’André Breton et de Paul Éluard.',
};
