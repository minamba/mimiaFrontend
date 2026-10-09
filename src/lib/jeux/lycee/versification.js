/**
 * LA VERSIFICATION — le français de 2de (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_2DE_LECT_POESIE          — « Analyser un poème du XIXe au XXIe siècle »
 *   FR_2DE_LECT_POESIE_ANCIENNE — « Analyser un poème du Moyen Âge au XVIIIe
 *                                  siècle »
 *
 * SIX SORTES DE MANCHES (2 + 1 + 1 + 1 + 1 + 2) :
 *   - COMPTER (2) : combien de syllabes dans ce vers ? Des vers célèbres,
 *     cités exactement, comptés un à un (le décompte est en regard). LES
 *     PIÈGES : compter le e muet en fin de vers, compter le e élidé devant
 *     une voyelle, oublier le e muet devant une consonne (ou suivi de « s »
 *     et « nt », qui ne s'élide jamais), oublier la diérèse (« nu-ées »,
 *     « Li-on », « vi-o-lons »), dédoubler une synérèse (« ciel ») ;
 *   - LE MÈTRE (1) : octosyllabe, décasyllabe ou alexandrin ;
 *   - LES RIMES (1) : suivies, croisées ou embrassées, dans un quatrain ;
 *   - LA RICHESSE (1) : pauvre (un son commun), suffisante (deux), riche
 *     (trois ou plus). LE PIÈGE : compter les lettres au lieu des sons ;
 *   - LE REJET (1) : rejet ou contre-rejet, avec la césure en leurre ;
 *   - LES NOTIONS (2) : sonnet, césure, hémistiche, rime féminine, diérèse,
 *     synérèse, enjambement, vers libre, poème en prose.
 *
 * Aucun vers douteux : les diérèses sont celles que tout manuel donne, les
 * quatrains et les vers « écrits pour le jeu » sont comptés en commentaire.
 * Le vers tiré pour COMPTER n'est jamais celui de LE MÈTRE.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'versification', titre: 'La versification', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'La versification',
    accroche: 'Syllabes, rimes, rejets et sonnets.',
    competences: ['FR_2DE_LECT_POESIE', 'FR_2DE_LECT_POESIE_ANCIENNE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/**
 * [vers, auteur, nombre de syllabes, [[compte faux, erreur], [compte faux, erreur]]].
 * Le décompte, syllabe par syllabe, est en commentaire ; (e) : e élidé ou final.
 */
export const VERS = [
  // De-main-dès-l'au-b(e)à-l'heu-r(e)où-blan-chit-la-cam-pa-gn(e)
  ['Demain, dès l’aube, à l’heure où blanchit la campagne,', 'Victor Hugo', 12, [[13, 'elision'], [11, 'syllabe-oubliee']]],
  // Heu-reux-qui-com-m(e)U-lys-s(e)a-fait-un-beau-vo-ya-g(e)
  ['Heureux qui, comme Ulysse, a fait un beau voyage,', 'Joachim du Bellay', 12, [[14, 'elision'], [13, 'e-final']]],
  // Ô-temps-sus-pends-ton-vol-et-vous-heu-res-pro-pi-c(es)
  ['Ô temps ! suspends ton vol, et vous, heures propices !', 'Alphonse de Lamartine', 12, [[11, 'e-consonne'], [13, 'e-final']]],
  // Com-me-je-des-cen-dais-des-Fleu-ves-im-pas-si-bl(es) : « ves » ne s'élide pas
  ['Comme je descendais des Fleuves impassibles,', 'Arthur Rimbaud', 12, [[11, 'e-consonne'], [13, 'e-final']]],
  // Sou-vent-pour-s'a-mu-ser-les-hom-mes-d'é-qui-pa-g(e)
  ['Souvent, pour s’amuser, les hommes d’équipage', 'Charles Baudelaire', 12, [[11, 'e-consonne'], [13, 'e-final']]],
  // Pren-nent-des-al-ba-tros-vas-tes-oi-seaux-des-mers
  ['Prennent des albatros, vastes oiseaux des mers,', 'Charles Baudelaire', 12, [[10, 'e-consonne'], [11, 'e-consonne']]],
  // Je-fais-sou-vent-ce-rê-v(e)é-tran-g(e)et-pé-né-trant
  ['Je fais souvent ce rêve étrange et pénétrant', 'Paul Verlaine', 12, [[14, 'elision'], [11, 'syllabe-oubliee']]],
  // Ô-ra-g(e)ô-dé-ses-poir-ô-vieil-les-s(e)en-ne-mi(e)
  ['Ô rage ! ô désespoir ! ô vieillesse ennemie !', 'Pierre Corneille', 12, [[14, 'elision'], [13, 'e-final']]],
  // Le-vier-ge-le-vi-va-c(e)et-le-bel-au-jour-d'hui
  ['Le vierge, le vivace et le bel aujourd’hui', 'Stéphane Mallarmé', 12, [[11, 'e-consonne'], [13, 'elision']]],
  // Wa-ter-loo-Wa-ter-loo-Wa-ter-loo-mor-ne-plai-n(e)
  ['Waterloo ! Waterloo ! Waterloo ! morne plaine !', 'Victor Hugo', 12, [[11, 'e-consonne'], [13, 'e-final']]],
  // Le-Po-è-t(e)est-sem-bla-bl(e)au-prin-ce-des-nu-ées (diérèse)
  ['Le Poète est semblable au prince des nuées', 'Charles Baudelaire', 12, [[11, 'dierese'], [13, 'elision']]],
  // C'é-tait-pen-dant-l'hor-reur-d'u-ne-pro-fon-de-nuit
  ['C’était pendant l’horreur d’une profonde nuit.', 'Jean Racine', 12, [[10, 'e-consonne'], [11, 'e-consonne']]],
  // Sous-le-pont-Mi-ra-beau-cou-le-la-Sei-n(e)
  ['Sous le pont Mirabeau coule la Seine', 'Guillaume Apollinaire', 10, [[9, 'e-consonne'], [11, 'e-final']]],
  // Maî-tre-Cor-beau-sur-un-ar-bre-per-ché
  ['Maître Corbeau, sur un arbre perché,', 'Jean de La Fontaine', 10, [[8, 'e-consonne'], [9, 'e-consonne']]],
  // Ce-toit-tran-quil-l(e)où-mar-chent-des-co-lom-b(es)
  ['Ce toit tranquille, où marchent des colombes,', 'Paul Valéry', 10, [[11, 'elision'], [9, 'e-consonne']]],
  // Mi-gnon-n(e)al-lons-voir-si-la-ro-s(e)
  ['Mignonne, allons voir si la rose', 'Pierre de Ronsard', 8, [[9, 'elision'], [7, 'syllabe-oubliee']]],
  // Las-vo-yez-com-m(e)en-peu-d'es-pa-c(e)
  ['Las ! voyez comme en peu d’espace,', 'Pierre de Ronsard', 8, [[9, 'elision'], [7, 'syllabe-oubliee']]],
  // Le-ciel-est-par-des-sus-le-toit (synérèse : « ciel » en une syllabe)
  ['Le ciel est, par-dessus le toit,', 'Paul Verlaine', 8, [[9, 'synerese'], [7, 'syllabe-oubliee']]],
  // En-tre-les-pat-tes-d'un-Li-on (diérèse)
  ['Entre les pattes d’un Lion', 'Jean de La Fontaine', 8, [[7, 'dierese'], [9, 'syllabe-en-trop']]],
  // Te-nait-en-son-bec-un-fro-ma-g(e)
  ['Tenait en son bec un fromage.', 'Jean de La Fontaine', 8, [[9, 'e-final'], [7, 'syllabe-oubliee']]],
  // Il-pleu-re-dans-mon-cœur
  ['Il pleure dans mon cœur', 'Paul Verlaine', 6, [[5, 'e-consonne'], [7, 'syllabe-en-trop']]],
  // Des-vi-o-lons (diérèse)
  ['Des violons', 'Paul Verlaine', 4, [[3, 'dierese'], [5, 'syllabe-en-trop']]],
];

export const METRES = { 8: 'octosyllabe', 10: 'decasyllabe', 12: 'alexandrin' };
export const LIBELLES_METRES = { octosyllabe: 'Un octosyllabe', decasyllabe: 'Un décasyllabe', alexandrin: 'Un alexandrin' };

export const DISPOSITIONS = { suivies: 'Suivies (A A B B)', croisees: 'Croisées (A B A B)', embrassees: 'Embrassées (A B B A)' };

/** [quatrain, source (null : écrit pour le jeu), disposition des rimes]. */
export const QUATRAINS = [
  ['La Cigale, ayant chanté\nTout l’été,\nSe trouva fort dépourvue\nQuand la bise fut venue :', 'La Fontaine, La Cigale et la Fourmi', 'suivies'],
  ['Le soir descend sur la colline,\nLe vent se tait, l’herbe s’incline ;\nLe berger rentre son troupeau\nSous la lune, au flanc du coteau.', null, 'suivies'],
  ['La pluie a lavé les pavés,\nLes passants se sont dérobés ;\nSeul un chat, sous la gouttière,\nGuette un rayon de lumière.', null, 'suivies'],
  ['Il neige sur le vieux village,\nChaque toit blanchit sans partage ;\nDans la rue, un enfant joyeux\nLève vers le ciel ses grands yeux.', null, 'suivies'],
  ['Souvent, pour s’amuser, les hommes d’équipage\nPrennent des albatros, vastes oiseaux des mers,\nQui suivent, indolents compagnons de voyage,\nLe navire glissant sur les gouffres amers.', 'Baudelaire, L’Albatros', 'croisees'],
  ['Demain, dès l’aube, à l’heure où blanchit la campagne,\nJe partirai. Vois-tu, je sais que tu m’attends.\nJ’irai par la forêt, j’irai par la montagne.\nJe ne puis demeurer loin de toi plus longtemps.', 'Victor Hugo', 'croisees'],
  ['Maître Corbeau, sur un arbre perché,\nTenait en son bec un fromage.\nMaître Renard, par l’odeur alléché,\nLui tint à peu près ce langage :', 'La Fontaine, Le Corbeau et le Renard', 'croisees'],
  ['Ainsi, toujours poussés vers de nouveaux rivages,\nDans la nuit éternelle emportés sans retour,\nNe pourrons-nous jamais sur l’océan des âges\nJeter l’ancre un seul jour ?', 'Lamartine, Le Lac', 'croisees'],
  ['Le vent du soir court dans les branches,\nLa lune glisse sur l’étang ;\nAu pré, les marguerites blanches\nSe ferment doucement, en tremblant.', null, 'croisees'],
  ['La Nature est un temple où de vivants piliers\nLaissent parfois sortir de confuses paroles ;\nL’homme y passe à travers des forêts de symboles\nQui l’observent avec des regards familiers.', 'Baudelaire, Correspondances', 'embrassees'],
  ['Je fais souvent ce rêve étrange et pénétrant\nD’une femme inconnue, et que j’aime, et qui m’aime,\nEt qui n’est, chaque fois, ni tout à fait la même\nNi tout à fait une autre, et m’aime et me comprend.', 'Verlaine, Mon rêve familier', 'embrassees'],
  ['Sur la grève, la mer murmure,\nElle efface nos pas légers ;\nLes goélands, en messagers,\nAnnoncent la marée future.', null, 'embrassees'],
];

export const RICHESSES = { pauvre: 'Pauvre', suffisante: 'Suffisante', riche: 'Riche' };

/** [mot, mot, les sons communs à la fin, un par case]. La richesse se compte dans le code. */
export const RIMES = [
  ['ami', 'pari', ['i']],
  ['vie', 'folie', ['i']],
  ['bleu', 'feu', ['eu']],
  ['genou', 'hibou', ['ou']],
  ['dépourvue', 'venue', ['u']],
  ['bonté', 'été', ['t', 'é']],
  ['fleur', 'cœur', ['eu', 'r']],
  ['campagne', 'montagne', ['a', 'gn']],
  ['attends', 'longtemps', ['t', 'an']],
  ['amour', 'jour', ['ou', 'r']],
  ['soleil', 'pareil', ['è', 'ill']],
  ['perché', 'alléché', ['ch', 'é']],
  ['pénétrant', 'comprend', ['r', 'an']],
  ['cheval', 'rival', ['v', 'a', 'l']],
  ['mers', 'amers', ['m', 'è', 'r']],
  ['piliers', 'familiers', ['i', 'l', 'y', 'é']],
  ['image', 'mage', ['m', 'a', 'j']],
  ['temple', 'exemple', ['an', 'p', 'l']],
  ['lumière', 'chaumière', ['m', 'y', 'è', 'r']],
  ['charmant', 'dormant', ['r', 'm', 'an']],
];

export const richesse = (sons) => (sons.length >= 3 ? 'riche' : ['', 'pauvre', 'suffisante'][sons.length]);

export const COUPES = { rejet: 'Un rejet', 'contre-rejet': 'Un contre-rejet', cesure: 'Une césure' };

/**
 * [deux vers, source, le groupe mis en relief, rejet ou contre-rejet].
 * Les vers écrits pour le jeu sont des alexandrins, comptés en commentaire.
 */
export const DEBORDEMENTS = [
  ['Il dort dans le soleil, la main sur sa poitrine\nTranquille. Il a deux trous rouges au côté droit.', 'Rimbaud, Le Dormeur du val', 'Tranquille.', 'rejet'],
  ['Accrochant follement aux herbes des haillons\nD’argent ; où le soleil, de la montagne fière,', 'Rimbaud, Le Dormeur du val', 'D’argent', 'rejet'],
  ['Et la nuque baignant dans le frais cresson bleu,\nDort ; il est étendu dans l’herbe, sous la nue,', 'Rimbaud, Le Dormeur du val', 'Dort', 'rejet'],
  ['Serait-ce déjà lui ? C’est bien à l’escalier\nDérobé. Vite, ouvrons.', 'Hugo, Hernani', 'Dérobé.', 'rejet'],
  // Il-mar-chait-vers-la-mer-sans-sa-voir-qu'il-mar-chait / Seul-Le-vent-em-por-tait-le-res-te-de-ses-mots
  ['Il marchait vers la mer sans savoir qu’il marchait\nSeul. Le vent emportait le reste de ses mots.', null, 'Seul.', 'rejet'],
  // Le-vieux-ma-rin-rê-vait-près-du-feu-U-n(e)é-toi-l(e) / Bril-lait-au-des-sus-de-la-mer-im-men-s(e)et-cal-m(e)
  ['Le vieux marin rêvait près du feu. Une étoile\nBrillait au-dessus de la mer immense et calme.', null, 'Une étoile', 'contre-rejet'],
  // Nous-a-vions-tout-quit-té-pour-la-vil-l(e)Un-ma-tin / Nous-som-mes-re-ve-nus-au-vil-la-ge-na-tal
  ['Nous avions tout quitté pour la ville. Un matin\nNous sommes revenus au village natal.', null, 'Un matin', 'contre-rejet'],
  // El-l(e)at-ten-dait-tou-jours-à-la-fe-nê-tr(e)Et-puis / Un-soir-sans-di-r(e)un-mot-el-le-fer-ma-les-yeux
  ['Elle attendait toujours à la fenêtre. Et puis\nUn soir, sans dire un mot, elle ferma les yeux.', null, 'Et puis', 'contre-rejet'],
];

/** [question, bonne réponse, [[choix à écarter, phrase de l'erreur], …]]. */
export const NOTIONS = [
  ['Combien de vers compte un sonnet ?', '14', [['12', 'notion-sonnet'], ['16', 'notion-sonnet']]],
  ['Le sonnet français classique est formé de…', 'deux quatrains et deux tercets', [['quatre quatrains', 'notion-sonnet'], ['trois tercets et un quatrain', 'notion-sonnet']]],
  ['Dans un alexandrin classique, la césure tombe…', 'après la sixième syllabe', [['après la quatrième syllabe', 'notion-cesure-quatre'], ['à la fin du vers', 'notion-cesure']]],
  ['Dans un décasyllabe classique, la césure tombe le plus souvent…', 'après la quatrième syllabe', [['après la sixième syllabe', 'notion-cesure-quatre'], ['après la deuxième syllabe', 'notion-cesure-quatre']]],
  ['Chaque moitié d’un alexandrin, de part et d’autre de la césure, s’appelle…', 'un hémistiche', [['un tercet', 'notion-hemistiche'], ['un distique', 'notion-hemistiche']]],
  ['Une rime qui se termine par un e muet est…', 'une rime féminine', [['une rime masculine', 'notion-feminine'], ['une rime pauvre', 'notion-feminine']]],
  ['Prononcer en deux syllabes deux voyelles qui se suivent (« li-on »), c’est…', 'une diérèse', [['une synérèse', 'notion-dierese'], ['une élision', 'notion-dierese']]],
  ['Prononcer en une seule syllabe deux voyelles qui se suivent (« ciel »), c’est…', 'une synérèse', [['une diérèse', 'notion-synerese'], ['une césure', 'notion-synerese']]],
  ['Quand la phrase déborde d’un vers sur le suivant, on parle…', 'd’enjambement', [['de césure', 'notion-enjambement'], ['de diérèse', 'notion-enjambement']]],
  ['Un vers de dix syllabes s’appelle…', 'un décasyllabe', [['un octosyllabe', 'notion-metres'], ['un alexandrin', 'notion-metres']]],
  ['En France, le sonnet est popularisé au XVIe siècle par…', 'Ronsard et Du Bellay', [['Hugo et Lamartine', 'notion-pleiade'], ['Racine et Molière', 'notion-pleiade']]],
  ['Un poème en vers libres…', 'n’impose ni mètre fixe ni rime régulière', [['n’est pas découpé en vers', 'notion-vers-libre'], ['est toujours en alexandrins', 'notion-vers-libre']]],
  ['Un poème en prose…', 'n’est pas découpé en vers', [['est écrit en alexandrins', 'notion-prose'], ['compte toujours quatorze vers', 'notion-prose']]],
];

export const paire = (a, b) => [a, b].sort().join('-ou-');

const montrer = (v, auteur) => `« ${v} »\n— ${auteur}`;

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const { melanger } = outils(graine);
  const vers = melanger(VERS);

  const comptes = vers.slice(0, 2).map(([v, auteur, n, faux]) => ({
    consigne: 'compter',
    question: montrer(v, auteur),
    bonne: String(n),
    choix: melanger([n, ...faux.map(([f]) => f)]).map((x) => ({ cle: String(x), libelle: String(x) })),
    pieges: Object.fromEntries(faux.map(([f, p]) => [String(f), p])),
    aide: 'compter-regle',
  }));

  const metres = vers.slice(2).filter(([, , n]) => METRES[n]).slice(0, 1).map(([v, auteur, n]) => {
    const bonne = METRES[n];
    const autres = Object.values(METRES).filter((x) => x !== bonne);
    return {
      consigne: 'metre',
      question: montrer(v, auteur),
      bonne,
      choix: Object.values(METRES).map((cle) => ({ cle, libelle: LIBELLES_METRES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
      aide: 'metre-regle',
    };
  });

  const rimes = melanger(QUATRAINS).slice(0, 1).map(([quatrain, source, disposition]) => ({
    consigne: 'rimes',
    question: source ? `${quatrain}\n— ${source}` : quatrain,
    bonne: disposition,
    choix: Object.entries(DISPOSITIONS).map(([cle, libelle]) => ({ cle, libelle })),
    pieges: Object.fromEntries(Object.keys(DISPOSITIONS).filter((d) => d !== disposition).map((d) => [d, `rimes-${disposition}`])),
    aide: 'rimes-regle',
  }));

  const richesses = melanger(RIMES).slice(0, 1).map(([a, b, sons]) => {
    const bonne = richesse(sons);
    return {
      consigne: 'richesse',
      question: `« ${a} » / « ${b} »`,
      bonne,
      choix: Object.entries(RICHESSES).map(([cle, libelle]) => ({ cle, libelle })),
      pieges: Object.fromEntries(Object.keys(RICHESSES).filter((r) => r !== bonne).map((r) => [r, `richesse-${bonne}`])),
      aide: 'richesse-regle',
    };
  });

  const coupes = melanger(DEBORDEMENTS).slice(0, 1).map(([deuxVers, source, groupe, bonne]) => {
    const autres = Object.keys(COUPES).filter((c) => c !== bonne);
    return {
      consigne: 'coupe',
      question: `${deuxVers}${source ? `\n— ${source}` : ''}\n→ « ${groupe} »`,
      bonne,
      choix: melanger(Object.keys(COUPES)).map((cle) => ({ cle, libelle: COUPES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, a === 'cesure' ? 'coupe-cesure' : 'contre-rejet-ou-rejet'])),
      aide: 'coupe-regle',
    };
  });

  const notions = melanger(NOTIONS).slice(0, 2).map(([question, bonne, faux]) => ({
    consigne: 'notion',
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: 'notion-regle',
  }));

  return melanger([...comptes, ...metres, ...rimes, ...richesses, ...coupes, ...notions]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  compter: 'Combien de syllabes compte ce vers ?',
  metre: 'Compte les syllabes : comment s’appelle ce vers ?',
  rimes: 'Comment les rimes sont-elles disposées dans ce quatrain ?',
  richesse: 'Ces deux mots riment : la rime est-elle pauvre, suffisante ou riche ?',
  coupe: 'Le groupe signalé déborde d’un vers sur l’autre : quel procédé le met en relief ?',
  notion: 'Une question sur la versification.',

  'e-final': 'Le e muet à la fin du vers ne se compte jamais, même suivi d’un s.',
  elision: 'Un e muet suivi d’un mot qui commence par une voyelle s’élide : il ne se prononce pas, et ne compte pas.',
  'e-consonne': 'Dans un vers, le e muet se prononce devant une consonne, et aussi quand il est suivi d’un s ou de « nt » : il compte alors pour une syllabe.',
  dierese: 'Ici, le poète sépare deux voyelles qui se suivent, comme « nu-ées » ou « li-on » : c’est une diérèse, qui ajoute une syllabe.',
  synerese: '« Ciel » se prononce en une seule syllabe : deux voyelles réunies en un seul son, c’est une synérèse.',
  'syllabe-oubliee': 'Reprends le vers syllabe par syllabe, une voyelle prononcée à la fois, sans en sauter.',
  'syllabe-en-trop': 'Une syllabe, c’est un seul son de voyelle prononcé : recompte sans en ajouter.',
  'compter-regle': 'Compte les voyelles prononcées : le e muet compte devant une consonne, jamais devant une voyelle, jamais en fin de vers.',

  'alexandrin-ou-decasyllabe': 'Dix syllabes, c’est un décasyllabe ; douze, un alexandrin. Recompte sans oublier les e muets devant une consonne.',
  'alexandrin-ou-octosyllabe': 'Huit syllabes, c’est un octosyllabe ; douze, un alexandrin. Recompte sans oublier les e muets devant une consonne.',
  'decasyllabe-ou-octosyllabe': 'Huit syllabes, c’est un octosyllabe ; dix, un décasyllabe. Recompte sans oublier les e muets devant une consonne.',
  'metre-regle': 'Compte d’abord les syllabes : huit, c’est un octosyllabe ; dix, un décasyllabe ; douze, un alexandrin.',

  'rimes-suivies': 'Les vers riment deux par deux, à la suite : A A B B. Ce sont des rimes suivies, qu’on appelle aussi rimes plates.',
  'rimes-croisees': 'Les rimes alternent, une sur deux : A B A B. Ce sont des rimes croisées.',
  'rimes-embrassees': 'Les deux vers du milieu riment ensemble, entourés par les deux autres : A B B A. Ce sont des rimes embrassées.',
  'rimes-regle': 'Écoute la fin de chaque vers et donne-lui une lettre : la même lettre pour les sons qui riment, puis lis le motif.',

  'richesse-pauvre': 'Compte les sons, pas les lettres : ici, seule la dernière voyelle est commune. Un seul son, c’est une rime pauvre.',
  'richesse-suffisante': 'Compte les sons, pas les lettres : ici, deux sons sont communs, la voyelle et une consonne. Deux sons, c’est une rime suffisante.',
  'richesse-riche': 'Compte les sons, pas les lettres : ici, trois sons ou plus sont communs. C’est une rime riche.',
  'richesse-regle': 'Prononce les deux fins de mots et compte les sons identiques : un, la rime est pauvre ; deux, suffisante ; trois ou plus, riche.',

  'contre-rejet-ou-rejet': 'Regarde où commence la phrase. Le rejet repousse au début du vers suivant un mot bref qui termine la phrase. Le contre-rejet place à la fin du vers un mot bref qui commence une phrase poursuivie au vers suivant.',
  'coupe-cesure': 'La césure coupe l’alexandrin en son milieu : elle ne fait pas déborder la phrase d’un vers sur l’autre. Cherche plutôt un rejet ou un contre-rejet.',
  'coupe-regle': 'Rejet : un mot bref repoussé au début du vers suivant. Contre-rejet : un mot bref placé à la fin du vers, qui lance la phrase suivante.',

  'notion-sonnet': 'Le sonnet compte quatorze vers : deux quatrains, puis deux tercets.',
  'notion-cesure': 'La césure est une pause à l’intérieur du vers, pas à sa fin.',
  'notion-cesure-quatre': 'Dans l’alexandrin classique, la césure tombe après la sixième syllabe, au milieu ; dans le décasyllabe, le plus souvent après la quatrième.',
  'notion-hemistiche': 'L’hémistiche, c’est la moitié d’un vers, de part et d’autre de la césure. Le tercet et le distique sont des strophes.',
  'notion-feminine': 'Une rime terminée par un e muet est féminine, même au pluriel ; toutes les autres sont masculines.',
  'notion-dierese': 'Séparer deux voyelles en deux syllabes, « li-on », c’est la diérèse ; les réunir en une seule, c’est la synérèse.',
  'notion-synerese': 'Réunir deux voyelles en une seule syllabe, « ciel », c’est la synérèse ; les séparer, c’est la diérèse.',
  'notion-enjambement': 'Quand la phrase continue au vers suivant sans pause, c’est un enjambement. La césure est une pause à l’intérieur du vers.',
  'notion-metres': 'Huit syllabes, octosyllabe ; dix, décasyllabe ; douze, alexandrin.',
  'notion-pleiade': 'Au seizième siècle, les poètes de la Pléiade, Ronsard et Du Bellay en tête, imposent le sonnet venu d’Italie.',
  'notion-vers-libre': 'Le vers libre reste un vers, avec son retour à la ligne, mais sans mètre fixe ni rime régulière.',
  'notion-prose': 'Le poème en prose est un poème sans vers : ni mètre, ni rime, ni retour à la ligne imposé.',
  'notion-regle': 'Revois le vocabulaire du poème : mètre, césure, hémistiche, rime, strophe, sonnet.',
};
