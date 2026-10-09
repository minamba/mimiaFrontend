/**
 * LES ACCORDS — réussir les accords dans une phrase longue, en 5e.
 * Professeur : Adrien (français).
 *
 * Prolonge « Le sujet qui s'éloigne » du CM (`sujetEloigne.js`). Phrases
 * écrites à la main, une seule réponse défendable : on écarte les accords
 * discutés (« la plupart des… », les couleurs composées, les noms
 * épicènes comme « élèves », dont on ne connaît pas le genre).
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - LE VERBE ET SON SUJET (3) : sujet éloigné par une relative, sujet
 *     inversé (« Dans la forêt vivent… »), nom complément pris pour le sujet
 *     (« le chant des oiseaux résonne »), sujets multiples ;
 *   - ADJECTIFS ET PARTICIPES (3) : le masculin l'emporte, l'adjectif séparé
 *     par des virgules, le participe avec être, et avec avoir quand le COD
 *     est placé avant (« les fleurs qu'elle a cueillies ») ou après ;
 *   - LEUR OU LEURS ? (2) : pronom devant un verbe (jamais de s),
 *     déterminant devant un nom (s au pluriel).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'les-accords-college', titre: 'Les accords', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Les accords',
    accroche: 'Une phrase longue, aucun accord oublié.',
    competences: ['FR_5E_LANG_ACCORDS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const enChoix = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** [question, bonne, [faux, piège], …] → une manche. */
function depuisBanque(melanger, consigne, [question, bonne, ...faux]) {
  return {
    consigne,
    question,
    bonne,
    choix: enChoix(melanger([bonne, ...faux.map(([f]) => f)])),
    pieges: Object.fromEntries(faux),
  };
}

/** Le verbe s'accorde avec son sujet. Les verbes sont au présent, sauf mention. */
export const VERBES = [
  ['Les feuilles du vieux chêne qui pousse près de la rivière … en automne. (tomber)', 'tombent', ['tombe', 'sujet-eloigne']],
  ['Dans la forêt … d’étranges animaux. (vivre)', 'vivent', ['vit', 'sujet-inverse']],
  ['Le bruit des voitures qui passent sous mes fenêtres me … chaque nuit. (réveiller)', 'réveille', ['réveillent', 'sujet-complement']],
  ['Où … les clés que je t’ai données ? (être)', 'sont', ['est', 'sujet-inverse']],
  ['Les enfants de ma voisine, que tu connais bien, … au collège. (aller)', 'vont', ['va', 'sujet-eloigne'], ['vas', 'sujet-eloigne']],
  ['Sur la table … un bouquet de roses. (trôner)', 'trône', ['trônent', 'sujet-complement']],
  ['Le chant des oiseaux … dès l’aube. (résonner)', 'résonne', ['résonnent', 'sujet-complement']],
  ['Les lettres que m’… ma grand-mère sont rangées dans une boîte. (écrire, à l’imparfait)', 'écrivait', ['écrivaient', 'sujet-inverse']],
  ['Le livre que lisent mes amis … passionnant. (être)', 'est', ['sont', 'sujet-eloigne']],
  ['Toi et moi … partir demain. (devoir)', 'devons', ['doivent', 'sujet-nous'], ['doit', 'sujet-pluriel']],
  ['Mon frère et ma sœur … au cinéma ce soir. (aller)', 'vont', ['va', 'sujet-pluriel']],
  ['Chaque matin, au bord du lac, se … les promeneurs. (retrouver)', 'retrouvent', ['retrouve', 'sujet-inverse']],
  ['Ce que racontent les anciens … souvent vrai. (être)', 'est', ['sont', 'sujet-eloigne']],
  ['La fumée des cheminées … vers le ciel. (monter)', 'monte', ['montent', 'sujet-complement']],
];

export const ADJECTIFS = [
  ['Les fleurs que ma mère a … sont magnifiques. (cueillir)', 'cueillies', ['cueilli', 'pp-avoir-cod-avant'], ['cueillis', 'accord-genre']],
  ['Ma tante et ma cousine sont … hier soir. (arriver)', 'arrivées', ['arrivés', 'accord-genre'], ['arrivée', 'accord-nombre']],
  ['Mon oncle et ma tante sont … hier soir. (arriver)', 'arrivés', ['arrivées', 'masculin-pluriel'], ['arrivé', 'accord-nombre']],
  ['Des chemises et des pantalons … traînaient par terre. (froissé)', 'froissés', ['froissées', 'masculin-pluriel'], ['froissé', 'accord-nombre']],
  ['Les garçons, … par la longue journée, rentrent chez eux. (épuisé)', 'épuisés', ['épuisé', 'adj-eloigne'], ['épuisées', 'accord-genre']],
  ['Les voitures garées devant l’école étaient toutes … (neuf)', 'neuves', ['neufs', 'accord-genre'], ['neuve', 'accord-nombre']],
  ['Les tartes que mon père a … étaient délicieuses. (préparer)', 'préparées', ['préparé', 'pp-avoir-cod-avant'], ['préparés', 'accord-genre']],
  ['Mon père a … des tartes délicieuses. (préparer)', 'préparé', ['préparées', 'pp-avoir-cod-apres'], ['préparés', 'pp-avoir-cod-apres']],
  ['Ses cheveux, longtemps … par le soleil, sont devenus clairs. (brûler)', 'brûlés', ['brûlé', 'adj-eloigne'], ['brûlées', 'accord-genre']],
  ['Les fenêtres de la vieille maison étaient … depuis des années. (fermer)', 'fermées', ['fermée', 'noyau-du-groupe'], ['fermés', 'accord-genre']],
  ['Les filles sont … très tôt ce matin. (partir)', 'parties', ['partis', 'accord-genre'], ['parti', 'accord-nombre']],
  ['Les murs de la cour, … de lierre, semblaient très anciens. (couvert)', 'couverts', ['couverte', 'noyau-du-groupe'], ['couvertes', 'accord-genre']],
];

/** [phrase, leur ou leurs, ce qui décide : pronom, singulier, pluriel]. */
export const LEUR = [
  ['Les enfants rangent … jouets.', 'leurs', 'pluriel'],
  ['Les oiseaux construisent … nids au printemps.', 'leurs', 'pluriel'],
  ['Ces élèves aiment … professeurs.', 'leurs', 'pluriel'],
  ['Les musiciens accordent … instruments.', 'leurs', 'pluriel'],
  ['Je … ai donné mon adresse.', 'leur', 'pronom'],
  ['Quand mes cousins viennent, je … prête mes jeux.', 'leur', 'pronom'],
  ['Dis-… la vérité !', 'leur', 'pronom'],
  ['Je … ai offert des fleurs.', 'leur', 'pronom'],
  ['Le maître … lit une histoire.', 'leur', 'pronom'],
  ['Mes voisins promènent … chien.', 'leur', 'singulier'],
  ['Mes parents ont vendu … maison.', 'leur', 'singulier'],
  ['Les joueurs écoutent … entraîneur.', 'leur', 'singulier'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const liste = [];
  melanger(VERBES).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'verbe', e)));
  melanger(ADJECTIFS).slice(0, 3).forEach((e) => liste.push(depuisBanque(melanger, 'adjectif', e)));
  melanger(LEUR).slice(0, 2).forEach(([phrase, bonne, raison]) => {
    const autre = bonne === 'leur' ? 'leurs' : 'leur';
    liste.push({
      consigne: 'leur',
      question: phrase,
      bonne,
      choix: enChoix(['leur', 'leurs']),
      pieges: { [autre]: `leur-${raison}` },
    });
  });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  verbe: 'Accorde le verbe avec son sujet : trouve-le, même s’il est loin ou placé après.',
  'verbe-regle': 'Demande-toi « qui est-ce qui… ? » devant le verbe : la réponse est le sujet, et le verbe s’accorde avec lui.',
  'sujet-eloigne': 'Le nom le plus proche n’est pas forcément le sujet. Demande-toi : qui est-ce qui fait l’action ?',
  'sujet-inverse': 'Le sujet est placé après le verbe. Demande-toi « qui est-ce qui… ? », et cherche-le derrière le verbe.',
  'sujet-complement': 'Le nom qui suit « de » complète le nom sujet : c’est le premier nom, le noyau, qui commande le verbe.',
  'sujet-pluriel': 'Deux sujets reliés par « et » forment un sujet pluriel : le verbe se met au pluriel.',
  'sujet-nous': 'Plusieurs sujets dont « moi », c’est comme « nous » : terminaison -ons.',
  adjectif: 'Accorde ce mot : cherche d’abord le nom avec lequel il s’accorde.',
  'adjectif-regle': 'Trouve le nom que le mot complète, puis donne-lui son genre et son nombre.',
  'accord-genre': 'Cherche le genre du nom : féminin ou masculin ? Le mot qui s’accorde prend son genre.',
  'accord-nombre': 'Le nom est au pluriel, ou il y en a plusieurs : le mot qui s’accorde prend la marque du pluriel.',
  'masculin-pluriel': 'Un nom masculin et un nom féminin ensemble : l’accord se fait au masculin pluriel.',
  'pp-avoir-cod-avant': 'Avec avoir, le participe s’accorde avec le COD s’il est placé avant le verbe : cherche ce que remplace « que ».',
  'pp-avoir-cod-apres': 'Avec avoir, le participe ne s’accorde pas quand le COD est placé après le verbe.',
  'adj-eloigne': 'Même séparé par des virgules, le mot s’accorde avec le nom qu’il complète : cherche ce nom, ici au pluriel.',
  'noyau-du-groupe': 'Le mot s’accorde avec le premier nom, le noyau du groupe ; le nom qui suit « de » ne fait que le compléter.',
  leur: 'Leur, ou leurs ? Regarde le mot qui suit.',
  'leur-regle': 'Devant un verbe, leur ne prend jamais de s. Devant un nom, il prend un s si le nom est au pluriel.',
  'leur-pronom': 'Devant un verbe, leur est un pronom qui veut dire « à eux » : il ne prend jamais de s.',
  'leur-singulier': 'Devant un nom au singulier, leur est un déterminant sans s : leur chien.',
  'leur-pluriel': 'Devant un nom au pluriel, leur est un déterminant, et il prend un s : leurs jouets.',
};
