/**
 * LES MOUVEMENTS LITTÉRAIRES — le français de 2de (Adrien).
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_2DE_LECT_MOUVEMENT — « Situer un texte dans son mouvement littéraire »
 *
 * QUATRE SORTES DE MANCHES (2 + 2 + 2 + 2) :
 *   - L'AUTEUR (2) : à quel mouvement le rattache-t-on ? Dix mouvements,
 *     de l'humanisme à l'absurde. Les deux autres choix sont les voisins
 *     qu'on confond (CONFUSIONS), chaque paire a sa phrase. LES PIÈGES :
 *     réalisme et naturalisme, humanisme et Lumières, classicisme et
 *     romantisme, symbolisme et surréalisme ;
 *   - LE SIÈCLE (2) : d'un mouvement ou d'une œuvre datée. Le siècle est
 *     CALCULÉ depuis l'année, gardée dans la banque. LE PIÈGE : le décalage
 *     d'un siècle (les années 1600 sont le XVIIe) ;
 *   - L'IDÉE (2) : ce que défend le mouvement ;
 *   - L'ŒUVRE (2) : à quel mouvement appartient-elle ?
 *
 * SEULEMENT DES RATTACHEMENTS SÛRS, ceux de tous les manuels. Écartés
 * exprès : Corneille (baroque ou classique), Stendhal et Maupassant (réalisme
 * ou naturalisme), Chateaubriand (préromantique), Baudelaire (entre
 * romantisme, Parnasse et symbolisme), Aragon (surréaliste puis non), et le
 * baroque de LE SIÈCLE (à cheval sur deux siècles).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'mouvements-litteraires', titre: 'Les mouvements littéraires', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Les mouvements littéraires',
    accroche: 'De l’humanisme à l’absurde.',
    competences: ['FR_2DE_LECT_MOUVEMENT'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const MOUVEMENTS = {
  humanisme: 'L’humanisme',
  baroque: 'Le baroque',
  classicisme: 'Le classicisme',
  lumieres: 'Les Lumières',
  romantisme: 'Le romantisme',
  realisme: 'Le réalisme',
  naturalisme: 'Le naturalisme',
  symbolisme: 'Le symbolisme',
  surrealisme: 'Le surréalisme',
  absurde: 'L’absurde',
};

/** Les deux mouvements qu'on prend le plus souvent pour celui-ci. */
export const CONFUSIONS = {
  humanisme: ['classicisme', 'lumieres'],
  baroque: ['classicisme', 'romantisme'],
  classicisme: ['baroque', 'lumieres'],
  lumieres: ['humanisme', 'classicisme'],
  romantisme: ['classicisme', 'realisme'],
  realisme: ['naturalisme', 'romantisme'],
  naturalisme: ['realisme', 'symbolisme'],
  symbolisme: ['romantisme', 'surrealisme'],
  surrealisme: ['symbolisme', 'absurde'],
  absurde: ['surrealisme', 'realisme'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [auteur, mouvement]. Un auteur, un seul mouvement. */
export const AUTEURS = [
  ['François Rabelais', 'humanisme'],
  ['Michel de Montaigne', 'humanisme'],
  ['Pierre de Ronsard', 'humanisme'],
  ['Joachim du Bellay', 'humanisme'],
  ['Jean de Sponde', 'baroque'],
  ['Saint-Amant', 'baroque'],
  ['Théophile de Viau', 'baroque'],
  ['Molière', 'classicisme'],
  ['Jean Racine', 'classicisme'],
  ['Jean de La Fontaine', 'classicisme'],
  ['Nicolas Boileau', 'classicisme'],
  ['Voltaire', 'lumieres'],
  ['Denis Diderot', 'lumieres'],
  ['Jean-Jacques Rousseau', 'lumieres'],
  ['Montesquieu', 'lumieres'],
  ['Victor Hugo', 'romantisme'],
  ['Alphonse de Lamartine', 'romantisme'],
  ['Alfred de Musset', 'romantisme'],
  ['Alfred de Vigny', 'romantisme'],
  ['Honoré de Balzac', 'realisme'],
  ['Gustave Flaubert', 'realisme'],
  ['Émile Zola', 'naturalisme'],
  ['les frères Goncourt', 'naturalisme'],
  ['Stéphane Mallarmé', 'symbolisme'],
  ['Paul Verlaine', 'symbolisme'],
  ['Arthur Rimbaud', 'symbolisme'],
  ['André Breton', 'surrealisme'],
  ['Paul Éluard', 'surrealisme'],
  ['Robert Desnos', 'surrealisme'],
  ['Albert Camus', 'absurde'],
  ['Eugène Ionesco', 'absurde'],
  ['Samuel Beckett', 'absurde'],
];

/**
 * [question, année de référence]. Le siècle se calcule depuis l'année :
 * jamais écrit à la main. Les années ne s'affichent pas.
 */
export const DATES = [
  ['En quel siècle l’humanisme s’épanouit-il en France ?', 1550],
  ['En quel siècle triomphe le classicisme ?', 1660],
  ['En quel siècle les Lumières rayonnent-elles ?', 1750],
  ['En quel siècle naît le romantisme français ?', 1820],
  ['En quel siècle le réalisme s’impose-t-il ?', 1850],
  ['En quel siècle Zola lance-t-il le naturalisme ?', 1880],
  ['En quel siècle le symbolisme apparaît-il ?', 1886],
  ['En quel siècle naît le surréalisme ?', 1924],
  ['En quel siècle naît le théâtre de l’absurde ?', 1950],
  ['En quel siècle Rabelais publie-t-il Gargantua ?', 1534],
  ['En quel siècle Montaigne écrit-il ses Essais ?', 1580],
  ['En quel siècle Ronsard publie-t-il ses Odes ?', 1550],
  ['En quel siècle Molière fait-il jouer Le Misanthrope ?', 1666],
  ['En quel siècle Racine écrit-il Phèdre ?', 1677],
  ['En quel siècle La Fontaine publie-t-il ses Fables ?', 1668],
  ['En quel siècle Voltaire publie-t-il Candide ?', 1759],
  ['En quel siècle Montesquieu publie-t-il les Lettres persanes ?', 1721],
  ['En quel siècle Rousseau publie-t-il Du contrat social ?', 1762],
  ['En quel siècle Hugo publie-t-il Les Contemplations ?', 1856],
  ['En quel siècle Balzac publie-t-il Le Père Goriot ?', 1835],
  ['En quel siècle Flaubert publie-t-il Madame Bovary ?', 1857],
  ['En quel siècle Zola publie-t-il Germinal ?', 1885],
  ['En quel siècle Breton publie-t-il le Manifeste du surréalisme ?', 1924],
  ['En quel siècle Camus publie-t-il L’Étranger ?', 1942],
  ['En quel siècle Beckett fait-il jouer En attendant Godot ?', 1953],
];

/** Le siècle d'une année : 1677 → 17. */
export const siecleDe = (annee) => Math.floor((annee - 1) / 100) + 1;

const ROMAINS = {
  15: 'XVe', 16: 'XVIe', 17: 'XVIIe', 18: 'XVIIIe', 19: 'XIXe', 20: 'XXe', 21: 'XXIe',
};
export const siecleEcrit = (s) => `${ROMAINS[s]} siècle`;

/** [ce que défend le mouvement, mouvement]. */
export const IDEES = [
  ['Placer l’homme au centre, relire les textes antiques, croire au pouvoir de l’éducation.', 'humanisme'],
  ['Le goût du mouvement, de l’illusion et de la métamorphose : un monde instable où tout passe.', 'baroque'],
  ['Imiter les Anciens, viser l’ordre et la clarté, respecter des règles comme celle des trois unités.', 'classicisme'],
  ['L’idéal de l’honnête homme, la bienséance et la vraisemblance au théâtre.', 'classicisme'],
  ['Éclairer les esprits par la raison, combattre l’intolérance et le fanatisme.', 'lumieres'],
  ['Rassembler tous les savoirs dans une encyclopédie pour libérer les esprits.', 'lumieres'],
  ['Exprimer le moi, la passion, la mélancolie, et chercher refuge dans la nature.', 'romantisme'],
  ['Mêler le sublime et le grotesque, contre les règles du théâtre classique.', 'romantisme'],
  ['Représenter la société telle qu’elle est, sans l’idéaliser, avec des détails exacts.', 'realisme'],
  ['Montrer le poids de l’hérédité et du milieu, avec une méthode inspirée des sciences.', 'naturalisme'],
  ['Suggérer plutôt que décrire, chercher les correspondances et la musique des mots.', 'symbolisme'],
  ['Libérer l’inconscient par le rêve et l’écriture automatique.', 'surrealisme'],
  ['Laisser surgir des images inattendues, hors du contrôle de la raison.', 'surrealisme'],
  ['Montrer un monde privé de sens, où le langage tourne à vide.', 'absurde'],
];

/** [œuvre, mouvement]. */
export const OEUVRES = [
  ['Gargantua, de Rabelais', 'humanisme'],
  ['Les Essais, de Montaigne', 'humanisme'],
  ['Les Regrets, de Du Bellay', 'humanisme'],
  ['Les Tragiques, d’Agrippa d’Aubigné', 'baroque'],
  ['Phèdre, de Racine', 'classicisme'],
  ['Le Misanthrope, de Molière', 'classicisme'],
  ['Les Fables, de La Fontaine', 'classicisme'],
  ['Candide, de Voltaire', 'lumieres'],
  ['L’Encyclopédie, de Diderot et d’Alembert', 'lumieres'],
  ['De l’esprit des lois, de Montesquieu', 'lumieres'],
  ['Les Méditations poétiques, de Lamartine', 'romantisme'],
  ['Lorenzaccio, de Musset', 'romantisme'],
  ['Hernani, de Victor Hugo', 'romantisme'],
  ['Le Père Goriot, de Balzac', 'realisme'],
  ['Madame Bovary, de Flaubert', 'realisme'],
  ['L’Assommoir, de Zola', 'naturalisme'],
  ['Germinal, de Zola', 'naturalisme'],
  ['L’Après-midi d’un faune, de Mallarmé', 'symbolisme'],
  ['Romances sans paroles, de Verlaine', 'symbolisme'],
  ['Nadja, d’André Breton', 'surrealisme'],
  ['Les Champs magnétiques, de Breton et Soupault', 'surrealisme'],
  ['La Cantatrice chauve, d’Ionesco', 'absurde'],
  ['En attendant Godot, de Beckett', 'absurde'],
  ['Le Mythe de Sisyphe, de Camus', 'absurde'],
];

/** Une manche à classer : le bon mouvement et ses deux voisins, chaque erreur a sa paire. */
function classer(melanger, consigne, question, bonne) {
  const autres = CONFUSIONS[bonne];
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((cle) => ({ cle, libelle: MOUVEMENTS[cle] })),
    pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
    aide: `${consigne}-regle`,
  };
}

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);

  const auteurs = melanger(AUTEURS).slice(0, 2)
    .map(([nom, mvt]) => classer(melanger, 'auteur', `À quel mouvement rattache-t-on ${nom} ?`, mvt));

  const siecles = melanger(DATES).slice(0, 2).map(([question, annee]) => {
    const s = siecleDe(annee);
    const bonne = siecleEcrit(s);
    const avant = siecleEcrit(s - 1);
    const apres = siecleEcrit(s + 1);
    return {
      consigne: 'siecle',
      question,
      bonne,
      choix: melanger([avant, bonne, apres]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [avant]: 'siecle-decalage', [apres]: 'siecle-reperes' },
      aide: 'siecle-regle',
    };
  });

  const idees = melanger(IDEES).slice(0, 2).map(([idee, mvt]) => classer(melanger, 'idee', idee, mvt));

  const oeuvres = melanger(OEUVRES).slice(0, 2).map(([oeuvre, mvt]) => classer(melanger, 'oeuvre', oeuvre, mvt));

  return melanger([...auteurs, ...siecles, ...idees, ...oeuvres]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  auteur: 'À quel mouvement littéraire rattache-t-on cet auteur ?',
  siecle: 'En quel siècle ? Attention au décalage entre l’année et le siècle.',
  idee: 'Quel mouvement littéraire défend cette idée ?',
  oeuvre: 'À quel mouvement littéraire appartient cette œuvre ?',

  'classicisme-ou-humanisme': 'L’humanisme, c’est le seizième siècle de la Renaissance : Rabelais, Montaigne, Ronsard. Le classicisme, c’est le dix-septième siècle de Louis Quatorze : Molière, Racine, La Fontaine.',
  'humanisme-ou-lumieres': 'Tous deux font confiance à la raison humaine. Mais l’humanisme appartient au seizième siècle, la Renaissance ; les Lumières, au dix-huitième, avec Voltaire, Diderot et Rousseau.',
  'baroque-ou-classicisme': 'Le baroque aime le mouvement, l’illusion, l’instabilité ; le classicisme, qui lui succède, recherche l’ordre, la mesure et la clarté.',
  'baroque-ou-romantisme': 'Le baroque, entre le seizième et le dix-septième siècle, chante un monde instable et changeant ; le romantisme, au dix-neuvième, exprime d’abord le moi et ses passions.',
  'classicisme-ou-lumieres': 'Le classicisme, c’est le siècle de Louis Quatorze, celui des règles et de l’imitation des Anciens. Les Lumières, au siècle suivant, mettent la raison au service de la critique.',
  'classicisme-ou-romantisme': 'Le romantisme s’est construit contre le classicisme : il rejette les règles, comme celle des trois unités, et mêle le sublime au grotesque.',
  'realisme-ou-romantisme': 'Le romantisme exprime le moi et ses rêves ; le réalisme, qui lui succède au milieu du dix-neuvième siècle, veut peindre la société telle qu’elle est.',
  'naturalisme-ou-realisme': 'Le piège classique : le naturalisme prolonge le réalisme, mais il y ajoute une méthode presque scientifique, l’hérédité et le milieu. Zola en est le chef de file ; Balzac et Flaubert sont réalistes.',
  'naturalisme-ou-symbolisme': 'À la même époque, deux voies opposées : le naturalisme montre la réalité crue, avec Zola ; le symbolisme cherche au-delà le mystère et suggère, avec Mallarmé.',
  'romantisme-ou-symbolisme': 'Le romantisme dit le moi et ses émotions ; le symbolisme, à la fin du dix-neuvième siècle, préfère suggérer, par des images et la musique du vers.',
  'surrealisme-ou-symbolisme': 'Le symbolisme, à la fin du dix-neuvième siècle, suggère par des symboles. Le surréalisme, né après la Première Guerre mondiale avec Breton, libère l’inconscient et le rêve.',
  'absurde-ou-surrealisme': 'Le surréalisme explore le rêve et l’inconscient, dans l’entre-deux-guerres. L’absurde, après la Seconde Guerre mondiale, montre un monde privé de sens, avec Camus, Ionesco et Beckett.',
  'absurde-ou-realisme': 'Le réalisme peint une société précise et cohérente ; l’absurde montre au contraire un monde qui n’a plus de sens, où le langage tourne à vide.',

  'siecle-decalage': 'Attention au décalage : les années mille six cent appartiennent au dix-septième siècle, et les années mille huit cent au dix-neuvième. Ajoute un au nombre de centaines.',
  'siecle-reperes': 'Un siècle trop tard. Garde des repères : la Renaissance au seizième, Louis Quatorze au dix-septième, les Lumières au dix-huitième, le romantisme et le réalisme au dix-neuvième, le surréalisme au vingtième.',

  'auteur-regle': 'Associe chaque auteur à son époque et à ce qu’il défend : la Renaissance, le siècle de Louis Quatorze, les Lumières, puis les grands mouvements du dix-neuvième et du vingtième siècle.',
  'siecle-regle': 'Le siècle, c’est le nombre de centaines plus un : les années mille sept cent sont le dix-huitième siècle.',
  'idee-regle': 'Chaque mouvement a son idée maîtresse : l’homme et les Anciens pour l’humanisme, l’ordre pour le classicisme, la raison critique pour les Lumières, le moi pour le romantisme, le réel pour le réalisme.',
  'oeuvre-regle': 'Pense d’abord à l’auteur de l’œuvre et à son siècle : le mouvement suit.',
};
