/**
 * LE COMPTEUR DE SYLLABES — la poésie en 4e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_4E_LECT_POESIE — « Analyser un poème : vers, strophes, rimes, rythme »
 *
 * QUATRE SORTES DE MANCHES (3 + 2 + 2 + 1) :
 *   - COMPTER (3) : combien de syllabes dans ce vers ? Des vers célèbres,
 *     cités exactement, et comptés un à un (voir le décompte en regard de
 *     chacun). LES PIÈGES : compter le e muet final, compter le e élidé
 *     devant une voyelle, oublier le e muet devant une consonne, oublier la
 *     diérèse (« vi-o-lons », « Li-on ») ;
 *   - NOMMER (2) : octosyllabe, décasyllabe ou alexandrin ;
 *   - LES RIMES (2) : plates, croisées ou embrassées, dans un quatrain écrit
 *     pour le jeu ;
 *   - LA STROPHE (1) : distique, tercet, quatrain, sizain, sonnet.
 * Aucun vers douteux : pas de « ion » ni de « ier » ambigu, hors des deux
 * diérèses que tout manuel donne en exemple.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'compteur-de-syllabes', titre: 'Le compteur de syllabes', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  QUATRIEME: {
    titre: 'Le compteur de syllabes',
    accroche: 'Vers, strophes, rimes, rythme.',
    competences: ['FR_4E_LECT_POESIE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/**
 * [vers, auteur, nombre de syllabes, [[compte faux, erreur], …]].
 * Le décompte, syllabe par syllabe, est en commentaire.
 */
export const VERS = [
  // De-main-dès-l'au-b(e)à-l'heu-r(e)où-blan-chit-la-cam-pa(gne)
  ['Demain, dès l’aube, à l’heure où blanchit la campagne,', 'Victor Hugo', 12, [[13, 'elision'], [11, 'syllabe-oubliee']]],
  // Heu-reux-qui-com-m(e)U-lys-s(e)a-fait-un-beau-vo-ya(ge)
  ['Heureux qui, comme Ulysse, a fait un beau voyage,', 'Joachim du Bellay', 12, [[14, 'elision'], [11, 'syllabe-oubliee']]],
  // Je-fais-sou-vent-ce-rê-v(e)é-tran-g(e)et-pé-né-trant
  ['Je fais souvent ce rêve étrange et pénétrant', 'Paul Verlaine', 12, [[14, 'elision'], [11, 'syllabe-oubliee']]],
  // Ô-temps-sus-pends-ton-vol-et-vous-heu-res-pro-pi(ces)
  ['Ô temps ! suspends ton vol, et vous, heures propices !', 'Alphonse de Lamartine', 12, [[11, 'e-consonne'], [13, 'e-final']]],
  // Sou-vent-pour-s'a-mu-ser-les-hom-mes-d'é-qui-pa(ge)
  ['Souvent, pour s’amuser, les hommes d’équipage', 'Charles Baudelaire', 12, [[11, 'e-consonne'], [13, 'e-final']]],
  // Oh-com-bien-de-ma-rins-com-bien-de-ca-pi-tai(nes)
  ['Oh ! combien de marins, combien de capitaines', 'Victor Hugo', 12, [[13, 'e-final'], [11, 'syllabe-oubliee']]],
  // J'i-rai-par-la-fo-rêt-j'i-rai-par-la-mon-ta(gne)
  ['J’irai par la forêt, j’irai par la montagne.', 'Victor Hugo', 12, [[13, 'e-final'], [11, 'syllabe-oubliee']]],
  // C'é-tait-pen-dant-l'hor-reur-d'u-ne-pro-fon-de-nuit
  ['C’était pendant l’horreur d’une profonde nuit.', 'Jean Racine', 12, [[10, 'e-consonne'], [11, 'e-consonne']]],
  // Je-suis-le-Té-né-breux-le-Veuf-l'In-con-so-lé
  ['Je suis le Ténébreux, — le Veuf, — l’Inconsolé,', 'Gérard de Nerval', 12, [[11, 'syllabe-oubliee'], [13, 'syllabe-en-trop']]],
  // Sous-le-pont-Mi-ra-beau-cou-le-la-Sei(ne)
  ['Sous le pont Mirabeau coule la Seine', 'Guillaume Apollinaire', 10, [[9, 'e-consonne'], [11, 'e-final']]],
  // Maî-tre-Cor-beau-sur-un-ar-bre-per-ché
  ['Maître Corbeau, sur un arbre perché,', 'Jean de La Fontaine', 10, [[8, 'e-consonne'], [9, 'e-consonne']]],
  // Ce-toit-tran-quil-l(e)où-mar-chent-des-co-lom(bes)
  ['Ce toit tranquille, où marchent des colombes,', 'Paul Valéry', 10, [[9, 'e-consonne'], [11, 'elision']]],
  // Le-vent-du-soir-pas-se-sur-la-col-li(ne)
  ['Le vent du soir passe sur la colline', 'un vers écrit pour le jeu', 10, [[9, 'e-consonne'], [11, 'e-final']]],
  // Mi-gnon-n(e)al-lons-voir-si-la-ro(se)
  ['Mignonne, allons voir si la rose', 'Pierre de Ronsard', 8, [[9, 'elision'], [7, 'syllabe-oubliee']]],
  // Las-vo-yez-com-m(e)en-peu-d'es-pa(ce)
  ['Las ! voyez comme en peu d’espace,', 'Pierre de Ronsard', 8, [[9, 'elision'], [7, 'syllabe-oubliee']]],
  // Le-ciel-est-par-des-sus-le-toit
  ['Le ciel est, par-dessus le toit,', 'Paul Verlaine', 8, [[9, 'syllabe-en-trop'], [7, 'syllabe-oubliee']]],
  // Un-ar-bre-par-des-sus-le-toit
  ['Un arbre, par-dessus le toit,', 'Paul Verlaine', 8, [[7, 'e-consonne'], [9, 'syllabe-en-trop']]],
  // En-tre-les-pat-tes-d'un-Li-on (diérèse)
  ['Entre les pattes d’un Lion', 'Jean de La Fontaine', 8, [[7, 'dierese'], [9, 'syllabe-en-trop']]],
  // Te-nait-en-son-bec-un-fro-ma(ge)
  ['Tenait en son bec un fromage.', 'Jean de La Fontaine', 8, [[9, 'e-final'], [7, 'syllabe-oubliee']]],
  // Il-pleu-re-dans-mon-cœur
  ['Il pleure dans mon cœur', 'Paul Verlaine', 6, [[5, 'e-consonne'], [7, 'syllabe-en-trop']]],
  // Com-m(e)il-pleut-sur-la-vil(le)
  ['Comme il pleut sur la ville ;', 'Paul Verlaine', 6, [[7, 'elision'], [5, 'syllabe-oubliee']]],
  // Des-vi-o-lons (diérèse)
  ['Des violons', 'Paul Verlaine', 4, [[3, 'dierese'], [5, 'syllabe-en-trop']]],
];

export const NOMS = { 8: 'octosyllabe', 10: 'decasyllabe', 12: 'alexandrin' };
export const LIBELLES_NOMS = { octosyllabe: 'Un octosyllabe', decasyllabe: 'Un décasyllabe', alexandrin: 'Un alexandrin' };

export const DISPOSITIONS = { plates: 'Plates', croisees: 'Croisées', embrassees: 'Embrassées' };

/** [quatrain écrit pour le jeu, disposition des rimes]. */
export const QUATRAINS = [
  ['Le soleil s’endort au fond du vallon,\nLe berger rappelle ses moutons ;\nLa lune se lève au-dessus du bois,\nLe hibou l’appelle de sa voix.', 'plates'],
  ['Sur le port, les bateaux dansent,\nLes mouettes crient et s’élancent ;\nUn vieux marin répare un filet,\nEn sifflant un air qui lui plaît.', 'plates'],
  ['Au clocher, midi sonne,\nLe village s’endort en automne ;\nLes enfants rentrent en riant,\nLeurs écharpes volent au vent.', 'plates'],
  ['La pluie tombe sur la ville,\nLes passants pressent le pas ;\nLe long du toit, l’eau file,\nEt chante tout bas.', 'croisees'],
  ['Le chat dort près de la cheminée,\nRoulé dans un rayon d’or ;\nIl rêve à la souris échappée,\nEt sourit en dormant encore.', 'croisees'],
  ['J’ai vu la mer un matin d’été,\nBleue comme un ciel sans nuage ;\nLes vagues venaient me saluer\nEt mourir sur la plage.', 'croisees'],
  ['Le vieux moulin tourne encore,\nSes ailes battent dans le vent ;\nIl moud le blé comme avant,\nDu soir jusqu’à l’aurore.', 'embrassees'],
  ['Au fond du jardin dort un puits,\nOù la lune vient se pencher ;\nElle y laisse, sans se fâcher,\nUn peu de lumière chaque nuit.', 'embrassees'],
  ['La forêt garde ses secrets,\nSous la mousse et sous les branches ;\nLes biches aux taches blanches\nPassent sans bruit dans les genêts.', 'embrassees'],
];

/** [question, bonne réponse, deux choix faux, phrase de l'erreur]. */
export const STROPHES = [
  ['Une strophe de quatre vers s’appelle…', 'un quatrain', ['un tercet', 'un distique'], 'strophe-noms'],
  ['Une strophe de trois vers s’appelle…', 'un tercet', ['un quatrain', 'un sizain'], 'strophe-noms'],
  ['Une strophe de deux vers s’appelle…', 'un distique', ['un tercet', 'un quatrain'], 'strophe-noms'],
  ['Une strophe de six vers s’appelle…', 'un sizain', ['un quatrain', 'un tercet'], 'strophe-noms'],
  ['Un sonnet est formé de…', 'deux quatrains et deux tercets', ['quatre quatrains', 'trois tercets et un distique'], 'strophe-sonnet'],
  ['Combien de vers compte un sonnet ?', '14', ['12', '16'], 'strophe-sonnet'],
];

export const paire = (a, b) => [a, b].sort().join('-ou-');

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const vers = melanger(VERS);
  const montrer = (v, auteur) => `« ${v} »\n— ${auteur}`;

  const comptes = vers.slice(0, 3).map(([v, auteur, n, faux]) => ({
    consigne: 'compter',
    question: montrer(v, auteur),
    bonne: String(n),
    choix: [n, ...faux.map(([f]) => f)].sort((a, b) => a - b).map((x) => ({ cle: String(x), libelle: String(x) })),
    pieges: Object.fromEntries(faux.map(([f, p]) => [String(f), p])),
    aide: 'compter-regle',
  }));

  const noms = vers.slice(3).filter(([, , n]) => NOMS[n]).slice(0, 2).map(([v, auteur, n]) => {
    const bonne = NOMS[n];
    const autres = Object.values(NOMS).filter((x) => x !== bonne);
    return {
      consigne: 'nommer',
      question: montrer(v, auteur),
      bonne,
      choix: Object.values(NOMS).map((cle) => ({ cle, libelle: LIBELLES_NOMS[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, paire(a, bonne)])),
      aide: 'nommer-regle',
    };
  });

  const rimes = melanger(QUATRAINS).slice(0, 2).map(([quatrain, disposition]) => ({
    consigne: 'rimes',
    question: quatrain,
    bonne: disposition,
    choix: Object.entries(DISPOSITIONS).map(([cle, libelle]) => ({ cle, libelle })),
    pieges: Object.fromEntries(Object.keys(DISPOSITIONS).filter((d) => d !== disposition).map((d) => [d, `rimes-${disposition}`])),
    aide: 'rimes-regle',
  }));

  const strophes = melanger(STROPHES).slice(0, 1).map(([question, bonne, faux, phrase]) => ({
    consigne: 'strophe',
    question,
    bonne,
    choix: melanger([bonne, ...faux]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map((f) => [f, phrase])),
  }));

  return melanger([...comptes, ...noms, ...rimes, ...strophes]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  compter: 'Combien de syllabes compte ce vers ?',
  nommer: 'Compte les syllabes : comment s’appelle ce vers ?',
  rimes: 'Comment les rimes sont-elles disposées dans ce quatrain ?',
  strophe: 'Une question sur les strophes.',
  'e-final': 'Le e muet à la fin du vers ne se compte jamais.',
  elision: 'Un e muet suivi d’un mot qui commence par une voyelle ne se prononce pas : il s’efface, et ne compte pas.',
  'e-consonne': 'Dans un vers, le e muet suivi d’une consonne se prononce : il compte pour une syllabe.',
  dierese: 'Ici, le poète sépare deux voyelles qui se suivent, comme « vi-o-lon » ou « li-on » : c’est une diérèse, qui ajoute une syllabe.',
  'syllabe-oubliee': 'Tape chaque syllabe du doigt, une voyelle prononcée à la fois, sans en sauter.',
  'syllabe-en-trop': 'Une syllabe, c’est un seul son de voyelle : « ciel », « toit » ou « cœur » n’en font qu’une.',
  'compter-regle': 'Compte les voyelles prononcées : le e muet compte devant une consonne, jamais devant une voyelle, jamais en fin de vers.',
  'alexandrin-ou-decasyllabe': 'Dix syllabes, c’est un décasyllabe ; douze, un alexandrin. Recompte en tapant chaque syllabe, sans oublier les e muets devant une consonne.',
  'alexandrin-ou-octosyllabe': 'Huit syllabes, c’est un octosyllabe ; douze, un alexandrin. Recompte en tapant chaque syllabe, sans oublier les e muets devant une consonne.',
  'decasyllabe-ou-octosyllabe': 'Huit syllabes, c’est un octosyllabe ; dix, un décasyllabe. Recompte en tapant chaque syllabe, sans oublier les e muets devant une consonne.',
  'nommer-regle': 'Compte d’abord les syllabes : huit, c’est un octosyllabe ; dix, un décasyllabe ; douze, un alexandrin.',
  'rimes-plates': 'Les vers riment deux par deux, à la suite : A A B B. Ce sont des rimes plates.',
  'rimes-croisees': 'Les rimes alternent, une sur deux : A B A B. Ce sont des rimes croisées.',
  'rimes-embrassees': 'Les deux vers du milieu riment ensemble, entourés par les deux autres : A B B A. Ce sont des rimes embrassées.',
  'rimes-regle': 'Donne une lettre à chaque son de fin de vers : la même lettre pour les sons qui riment, puis lis le motif.',
  'strophe-noms': 'Deux vers font un distique, trois un tercet, quatre un quatrain, six un sizain.',
  'strophe-sonnet': 'Un sonnet compte quatorze vers : deux quatrains, puis deux tercets.',
};
