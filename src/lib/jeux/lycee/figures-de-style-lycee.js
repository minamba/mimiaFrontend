/**
 * LES FIGURES DE STYLE — le français de 2de (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_2DE_LECT_PROCEDES — « Nommer un procédé d'écriture et dire l'effet qu'il
 *                           produit »
 *   FR_2DE_LECT_POESIE   — « Analyser un poème du XIXe au XXIe siècle »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - QUELLE FIGURE ? (4) : une phrase, quatorze figures possibles (antithèse,
 *     oxymore, chiasme, hyperbole, litote, euphémisme, anaphore, gradation,
 *     métonymie, périphrase, personnification, allégorie, comparaison,
 *     métaphore). Les deux autres choix sont les deux figures qu'on prend le
 *     plus souvent pour la bonne (CONFUSIONS), et chaque paire a sa phrase.
 *     LES PIÈGES : litote et euphémisme, antithèse et oxymore, comparaison et
 *     métaphore, métaphore et métonymie, allégorie et personnification,
 *     périphrase et métonymie ;
 *   - LA DÉFINITION (2) : la définition, la figure ; mêmes pièges ;
 *   - L'EFFET (2) : la figure est nommée, quel effet produit-elle ? LES
 *     PIÈGES : la lecture au pied de la lettre (« il nous a quittés » pris
 *     pour un départ en voyage), l'effet inverse (la litote prise pour une
 *     atténuation, l'hyperbole pour un compte exact).
 *
 * Les citations sont exactes et canoniques (Corneille, Molière, Louise Labé,
 * Baudelaire, Hugo, Éluard) ; les autres phrases sont écrites pour le jeu,
 * chacune relue pour que les deux figures proposées à côté de la bonne n'y
 * soient PAS : aucune antithèse dans un chiasme proposé avec l'antithèse,
 * aucune exagération dans une gradation, aucune négation dans un euphémisme.
 * Une phrase tirée pour L'EFFET n'est jamais aussi tirée pour QUELLE FIGURE ?
 * dans la même partie : la question donnerait la réponse.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'figures-de-style-lycee', titre: 'Les figures de style', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Les figures de style',
    accroche: 'Litote ou euphémisme ? Oxymore ou antithèse ?',
    competences: ['FR_2DE_LECT_PROCEDES', 'FR_2DE_LECT_POESIE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const FIGURES = {
  antithese: 'Une antithèse',
  oxymore: 'Un oxymore',
  chiasme: 'Un chiasme',
  hyperbole: 'Une hyperbole',
  litote: 'Une litote',
  euphemisme: 'Un euphémisme',
  anaphore: 'Une anaphore',
  gradation: 'Une gradation',
  metonymie: 'Une métonymie',
  periphrase: 'Une périphrase',
  personnification: 'Une personnification',
  allegorie: 'Une allégorie',
  comparaison: 'Une comparaison',
  metaphore: 'Une métaphore',
};

/** Les deux figures qu'on prend le plus souvent pour celle-ci. */
export const CONFUSIONS = {
  antithese: ['oxymore', 'chiasme'],
  oxymore: ['antithese', 'metaphore'],
  chiasme: ['anaphore', 'gradation'],
  hyperbole: ['litote', 'gradation'],
  litote: ['euphemisme', 'hyperbole'],
  euphemisme: ['litote', 'hyperbole'],
  anaphore: ['gradation', 'chiasme'],
  gradation: ['anaphore', 'chiasme'],
  metonymie: ['metaphore', 'periphrase'],
  periphrase: ['metonymie', 'euphemisme'],
  personnification: ['allegorie', 'comparaison'],
  allegorie: ['personnification', 'metaphore'],
  comparaison: ['metaphore', 'metonymie'],
  metaphore: ['comparaison', 'metonymie'],
};

export const paire = (a, b) => [a, b].sort().join('-ou-');

/** [phrase, source (null : écrite pour le jeu), figure]. */
export const EXEMPLES = [
  ['Je vis, je meurs ; je me brûle et me noie.', 'Louise Labé', 'antithese'],
  ['Hier, il possédait un château ; aujourd’hui, il dort sous les ponts.', null, 'antithese'],
  ['Tout le monde le connaît, personne ne l’aime.', null, 'antithese'],
  ['Le jour, la place est pleine de cris ; la nuit, elle est vide et silencieuse.', null, 'antithese'],

  ['Cette obscure clarté qui tombe des étoiles', 'Corneille, Le Cid', 'oxymore'],
  ['Un silence assourdissant suivit l’annonce des résultats.', null, 'oxymore'],
  ['Le prix fut remis à un illustre inconnu.', null, 'oxymore'],
  ['Elle le quitta avec une douce cruauté.', null, 'oxymore'],

  ['Il faut manger pour vivre, et non pas vivre pour manger.', 'Molière, L’Avare', 'chiasme'],
  ['Il était doux avec les faibles, avec les forts il était dur.', null, 'chiasme'],
  ['Elle partit à l’aube, au crépuscule elle revint.', null, 'chiasme'],
  ['Ils travaillent pour vivre ; d’autres vivent pour travailler.', null, 'chiasme'],

  ['Je te l’ai répété cent fois !', null, 'hyperbole'],
  ['Elle versa des torrents de larmes.', null, 'hyperbole'],
  ['Ce sac pèse une tonne.', null, 'hyperbole'],
  ['J’ai attendu une éternité devant ce guichet.', null, 'hyperbole'],

  ['Va, je ne te hais point.', 'Corneille, Le Cid', 'litote'],
  ['Ton gâteau n’est pas mauvais du tout.', null, 'litote'],
  ['Ce n’était pas une mince affaire.', null, 'litote'],
  ['Je ne suis pas mécontent de ce résultat.', null, 'litote'],
  ['Il n’est pas bête, ce garçon.', null, 'litote'],

  ['Il nous a quittés l’hiver dernier.', null, 'euphemisme'],
  ['Elle s’est éteinte paisiblement dans son sommeil.', null, 'euphemisme'],
  ['Après trois ans de service, il a été remercié.', null, 'euphemisme'],
  ['L’entreprise s’est séparée de deux cents salariés.', null, 'euphemisme'],

  ['Rome, l’unique objet de mon ressentiment !\nRome, à qui vient ton bras d’immoler mon amant !', 'Corneille, Horace', 'anaphore'],
  ['Mon bras qu’avec respect toute l’Espagne admire,\nMon bras, qui tant de fois a sauvé cet empire,', 'Corneille, Le Cid', 'anaphore'],
  ['Il faut lire pour comprendre, il faut lire pour douter, il faut lire pour rêver.', null, 'anaphore'],
  ['Ici, on travaille ; ici, on partage ; ici, on apprend.', null, 'anaphore'],

  ['Va, cours, vole, et nous venge.', 'Corneille, Le Cid', 'gradation'],
  ['La rumeur enfla : d’abord un murmure, bientôt des cris, enfin une clameur.', null, 'gradation'],
  ['Il marcha, courut, s’enfuit à toutes jambes.', null, 'gradation'],
  ['C’est une faute, une trahison, un crime.', null, 'gradation'],

  ['Ce soir, nous boirons un verre ensemble.', null, 'metonymie'],
  ['Elle a lu tout Zola pendant l’été.', null, 'metonymie'],
  ['Toute la salle applaudit le pianiste.', null, 'metonymie'],
  ['L’Élysée a démenti cette rumeur.', null, 'metonymie'],

  ['L’astre du jour se levait sur la plaine.', null, 'periphrase'],
  ['Le roi des animaux dormait à l’ombre d’un arbre.', null, 'periphrase'],
  ['Il parle à merveille la langue de Shakespeare.', null, 'periphrase'],
  ['La Ville Lumière attire chaque année des millions de visiteurs.', null, 'periphrase'],

  ['Le vent hurlait contre les volets.', null, 'personnification'],
  ['La vieille horloge soupirait à chaque heure.', null, 'personnification'],
  ['La ville s’éveillait lentement sous la pluie.', null, 'personnification'],
  ['Les arbres tendaient leurs bras nus vers le ciel.', null, 'personnification'],

  ['La Mort, sa faux à la main, frappait à toutes les portes.', null, 'allegorie'],
  ['La Justice, les yeux bandés, tenait sa balance d’une main ferme.', null, 'allegorie'],
  ['La Renommée, trompette aux lèvres, annonçait partout sa victoire.', null, 'allegorie'],
  ['La Liberté, un drapeau à la main, guidait le peuple sur les barricades.', null, 'allegorie'],

  ['La terre est bleue comme une orange', 'Paul Éluard', 'comparaison'],
  ['Le Poète est semblable au prince des nuées', 'Baudelaire, L’Albatros', 'comparaison'],
  ['Tel un fauve, il bondit sur son adversaire.', null, 'comparaison'],
  ['Ses yeux brillaient comme deux braises dans la nuit.', null, 'comparaison'],

  ['Ma jeunesse ne fut qu’un ténébreux orage', 'Baudelaire, L’Ennemi', 'metaphore'],
  ['Cette faucille d’or dans le champ des étoiles', 'Hugo, Booz endormi', 'metaphore'],
  ['Pendant la finale, le stade était un chaudron.', null, 'metaphore'],
  ['Sa colère était un volcan prêt à exploser.', null, 'metaphore'],
];

/** La définition de chaque figure. */
export const DEFINITIONS = {
  antithese: 'Opposer deux termes de sens contraire, placés dans deux groupes distincts.',
  oxymore: 'Unir dans un même groupe de mots deux termes de sens contraire.',
  chiasme: 'Disposer deux groupes de mots en croix, selon le schéma A B B A.',
  hyperbole: 'Exagérer une idée pour frapper les esprits.',
  litote: 'Dire moins pour faire entendre plus, souvent en niant le contraire.',
  euphemisme: 'Atténuer une réalité pénible ou choquante pour la rendre supportable.',
  anaphore: 'Répéter le même mot en tête de plusieurs vers ou de plusieurs phrases.',
  gradation: 'Enchaîner des termes d’intensité croissante ou décroissante.',
  metonymie: 'Désigner une chose par une autre qui lui est liée : le contenant pour le contenu, l’auteur pour l’œuvre.',
  periphrase: 'Remplacer un mot par une expression plus longue qui le définit.',
  personnification: 'Prêter des traits humains à un objet, un animal ou un élément naturel.',
  allegorie: 'Représenter une idée abstraite sous une forme concrète, souvent un personnage.',
  comparaison: 'Rapprocher deux réalités à l’aide d’un outil : comme, tel, semblable à.',
  metaphore: 'Rapprocher deux réalités sans outil de comparaison : l’une est désignée par l’autre.',
};

/**
 * [phrase, source, figure, bon effet, [deux effets à écarter], phrase de l'erreur].
 * Chaque phrase est aussi dans EXEMPLES : la partie ne la tire pas deux fois.
 */
export const EFFETS = [
  ['Va, je ne te hais point.', 'Corneille, Le Cid', 'litote', 'Avouer son amour avec retenue', ['Dire sa haine avec force', 'Exagérer sa colère'], 'effet-litote'],
  ['Va, cours, vole, et nous venge.', 'Corneille, Le Cid', 'gradation', 'Rendre l’ordre de plus en plus pressant', ['Montrer une hésitation', 'Ralentir l’action'], 'effet-gradation'],
  ['Je vis, je meurs ; je me brûle et me noie.', 'Louise Labé', 'antithese', 'Dire les contradictions de la passion', ['Décrire un paysage', 'Se moquer de l’amoureux'], 'effet-antithese'],
  ['Il nous a quittés l’hiver dernier.', null, 'euphemisme', 'Adoucir l’annonce d’une mort', ['Annoncer un départ en voyage', 'Insister sur la brutalité de la mort'], 'effet-euphemisme'],
  ['Je te l’ai répété cent fois !', null, 'hyperbole', 'Marquer l’agacement en exagérant', ['Donner le nombre exact de fois', 'Atténuer un reproche'], 'effet-hyperbole'],
  ['Rome, l’unique objet de mon ressentiment !\nRome, à qui vient ton bras d’immoler mon amant !', 'Corneille, Horace', 'anaphore', 'Marteler la haine de Camille pour Rome', ['Varier le vocabulaire', 'Adoucir le reproche'], 'effet-anaphore'],
  ['Cette obscure clarté qui tombe des étoiles', 'Corneille, Le Cid', 'oxymore', 'Peindre une lumière faible et étrange', ['Décrire un plein soleil', 'Opposer deux personnages'], 'effet-oxymore'],
  ['Il faut manger pour vivre, et non pas vivre pour manger.', 'Molière, L’Avare', 'chiasme', 'Rendre frappant le renversement de l’idée', ['Répéter deux fois la même idée', 'Exagérer l’appétit'], 'effet-chiasme'],
  ['La Justice, les yeux bandés, tenait sa balance d’une main ferme.', null, 'allegorie', 'Rendre visible une idée abstraite', ['Décrire une femme réelle', 'Se moquer des juges'], 'effet-allegorie'],
  ['L’astre du jour se levait sur la plaine.', null, 'periphrase', 'Désigner le soleil de façon plus noble', ['Cacher une réalité choquante', 'Exagérer la chaleur'], 'effet-periphrase'],
  ['Toute la salle applaudit le pianiste.', null, 'metonymie', 'Désigner le public par le lieu', ['Décrire les murs de la salle', 'Prêter vie au bâtiment'], 'effet-metonymie'],
  ['Le vent hurlait contre les volets.', null, 'personnification', 'Rendre la nature menaçante, presque vivante', ['Mesurer la force du vent', 'Représenter une idée abstraite'], 'effet-personnification'],
  ['Ma jeunesse ne fut qu’un ténébreux orage', 'Baudelaire, L’Ennemi', 'metaphore', 'Dire une jeunesse tourmentée', ['Raconter une tempête réelle', 'Faire rire de sa jeunesse'], 'effet-metaphore'],
];

const montrer = (phrase, source) => (source ? `« ${phrase} »\n— ${source}` : `« ${phrase} »`);

/** Une manche à classer : la bonne figure et ses deux voisines, chaque erreur a sa paire. */
function classer(melanger, consigne, question, bonne) {
  const autres = CONFUSIONS[bonne];
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map((cle) => ({ cle, libelle: FIGURES[cle] })),
    pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
    aide: `${consigne}-regle`,
  };
}

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);

  const effets = melanger(EFFETS).slice(0, 2).map(([phrase, source, figure, bonne, faux, erreur]) => ({
    consigne: 'effet',
    question: `${montrer(phrase, source)}\n${FIGURES[figure]} : quel effet ?`,
    bonne,
    choix: melanger([bonne, ...faux]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map((f) => [f, erreur])),
    aide: 'effet-regle',
  }));
  const dejaVues = effets.map((m) => m.question);

  const figures = melanger(EXEMPLES)
    .filter(([phrase, source]) => !dejaVues.some((q) => q.startsWith(montrer(phrase, source))))
    .slice(0, 4)
    .map(([phrase, source, figure]) => classer(melanger, 'figure', montrer(phrase, source), figure));

  const definitions = melanger(Object.keys(DEFINITIONS)).slice(0, 2)
    .map((figure) => classer(melanger, 'definition', DEFINITIONS[figure], figure));

  return melanger([...figures, ...definitions, ...effets]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  figure: 'Quelle figure de style reconnais-tu dans ce passage ?',
  definition: 'Quelle figure de style correspond à cette définition ?',
  effet: 'La figure est nommée : quel effet produit-elle ici ?',

  'antithese-ou-oxymore': 'L’oxymore soude deux termes contraires dans un même groupe de mots, comme « obscure clarté ». L’antithèse les oppose dans deux groupes distincts, souvent symétriques.',
  'antithese-ou-chiasme': 'Le chiasme croise les termes selon le schéma A B B A. L’antithèse oppose deux idées contraires, sans forcément les croiser.',
  'metaphore-ou-oxymore': 'L’oxymore soude deux termes de sens contraire dans un même groupe. La métaphore désigne une chose par une image, sans aucune contradiction.',
  'anaphore-ou-chiasme': 'L’anaphore répète le même mot en tête de plusieurs vers ou de plusieurs phrases. Le chiasme dispose deux groupes en miroir, A B B A.',
  'chiasme-ou-gradation': 'La gradation fait monter ou descendre l’intensité, terme après terme. Le chiasme dispose les termes en croix, A B B A.',
  'hyperbole-ou-litote': 'L’hyperbole exagère pour frapper. La litote fait l’inverse : elle dit moins, souvent par une négation, pour faire entendre plus.',
  'gradation-ou-hyperbole': 'L’hyperbole exagère une seule idée. La gradation enchaîne plusieurs termes dont l’intensité monte ou descend.',
  'euphemisme-ou-litote': 'Le piège classique. L’euphémisme adoucit une réalité pénible, pour l’atténuer vraiment. La litote dit moins pour faire entendre plus, souvent en niant le contraire : sous « je ne te hais point », il faut entendre « je t’aime ».',
  'euphemisme-ou-hyperbole': 'L’euphémisme atténue une réalité pénible ; l’hyperbole, au contraire, l’exagère.',
  'anaphore-ou-gradation': 'L’anaphore repose sur la répétition d’un même mot en tête de groupe. La gradation, sur des termes différents dont l’intensité monte ou descend.',
  'metaphore-ou-metonymie': 'La métaphore rapproche deux réalités sans lien réel, par ressemblance. La métonymie remplace un mot par un autre qui lui est réellement lié : le contenant, le lieu, l’auteur.',
  'metonymie-ou-periphrase': 'La périphrase remplace un mot par une expression qui le définit, comme « l’astre du jour » pour le soleil. La métonymie le remplace par un terme qui lui est lié, comme « un verre » pour son contenu.',
  'euphemisme-ou-periphrase': 'La périphrase remplace un mot par une expression qui le définit, sans chercher à adoucir. L’euphémisme, lui, atténue une réalité pénible ou choquante.',
  'allegorie-ou-personnification': 'L’allégorie donne un corps à une idée abstraite, la Mort, la Justice, souvent avec une majuscule et des attributs. La personnification prête des traits humains à une chose concrète, un animal, un élément naturel.',
  'comparaison-ou-personnification': 'La comparaison a besoin d’un outil, comme ou tel. La personnification prête directement des gestes ou des sentiments humains à une chose.',
  'allegorie-ou-metaphore': 'L’allégorie incarne une idée abstraite sous les traits d’un personnage, avec ses attributs. La métaphore rapproche deux réalités par une image, sans en faire un personnage.',
  'comparaison-ou-metaphore': 'Cherche l’outil de comparaison : comme, tel, semblable à. S’il y en a un, c’est une comparaison ; sans outil, c’est une métaphore.',
  'comparaison-ou-metonymie': 'La comparaison rapproche deux réalités à l’aide d’un outil, comme ou tel. La métonymie remplace un mot par un autre qui lui est lié, sans aucun outil.',

  'effet-litote': 'La litote dit moins pour faire entendre plus : en niant la haine, Chimène avoue l’amour qu’elle ne peut pas dire ouvertement.',
  'effet-gradation': 'Trois verbes de plus en plus rapides, aller, courir, voler : l’ordre devient de plus en plus pressant.',
  'effet-antithese': 'Vivre et mourir, brûler et se noyer : les contraires disent le désordre d’une passion qui déchire.',
  'effet-euphemisme': 'L’euphémisme ne raconte pas un départ : il adoucit une mort, pour la dire sans brutalité.',
  'effet-hyperbole': 'Personne n’a compté jusqu’à cent : l’hyperbole exagère pour dire l’agacement.',
  'effet-anaphore': 'Le nom répété en tête de vers frappe comme un marteau : la haine de Camille revient sans cesse sur Rome.',
  'effet-oxymore': 'Obscure et clarté se contredisent : ensemble, ils peignent une lumière faible, nocturne, presque irréelle.',
  'effet-chiasme': 'Les mêmes mots, croisés, inversent le sens : le chiasme rend le renversement frappant et facile à retenir.',
  'effet-allegorie': 'La femme aux yeux bandés n’existe pas : elle donne une forme visible à une idée, l’impartialité de la justice.',
  'effet-periphrase': 'L’astre du jour, c’est le soleil : la périphrase le désigne de façon plus noble, sans rien cacher.',
  'effet-metonymie': 'Ce ne sont pas les murs qui applaudissent : la métonymie désigne le public par le lieu qu’il occupe.',
  'effet-personnification': 'Le vent qui hurle comme un être vivant rend la nature inquiétante, presque menaçante.',
  'effet-metaphore': 'Il n’y a pas d’orage réel : l’image dit une jeunesse sombre et tourmentée.',

  'figure-regle': 'Cherche l’indice : un outil de comparaison, une répétition en tête de vers, deux contraires, une négation qui dit plus, une exagération.',
  'definition-regle': 'Relis la définition mot à mot : contraires dans un même groupe ou dans deux groupes, outil ou pas d’outil, idée abstraite ou chose concrète.',
  'effet-regle': 'Une figure n’est jamais là pour décorer : demande-toi ce qu’elle fait ressentir ou comprendre au lecteur.',
};
