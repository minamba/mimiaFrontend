/**
 * ACTIF OU PASSIF ? — la voix du verbe, en 5e.
 * Professeur : Adrien (français).
 *
 * Phrases écrites à la main, une seule réponse défendable.
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - ACTIVE OU PASSIVE ? (3) : LE PIÈGE, « être » pris pour la marque du
 *     passif — « elle est partie » est un passé composé à la voix active.
 *     Et le passif sans complément d'agent reste un passif ;
 *   - À LA VOIX PASSIVE (3) : garder le temps (c'est « être » qui le porte :
 *     il a mangé → il a été mangé), accorder le participe avec le nouveau
 *     sujet, ne pas échanger les rôles ;
 *   - LE COMPLÉMENT D'AGENT (2) : ni le sujet, ni le complément
 *     circonstanciel placé à côté.
 * On évite les phrases du type « la porte est fermée », où l'on hésite entre
 * un état et un passif.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'actif-ou-passif', titre: 'Actif ou passif ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Actif ou passif ?',
    accroche: 'Qui fait l’action, qui la subit ?',
    competences: ['FR_5E_LANG_VOIX'],
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

/** [phrase, voix, le piège qu'elle tend]. */
export const VOIX = [
  ['Le chat mange la souris.', 'active', null],
  ['Le vent a renversé la poubelle.', 'active', null],
  ['Le facteur apporte le courrier.', 'active', null],
  ['Le soleil éclaire la pièce.', 'active', null],
  ['Elle est partie à huit heures.', 'active', 'etre'],
  ['Les élèves sont arrivés en retard.', 'active', 'etre'],
  ['Nous sommes tombés dans la neige.', 'active', 'etre'],
  ['Ma sœur est née en hiver.', 'active', 'etre'],
  ['Les invités sont venus à la fête.', 'active', 'etre'],
  ['La souris est mangée par le chat.', 'passive', null],
  ['La poubelle a été renversée par le vent.', 'passive', null],
  ['La pièce est éclairée par le soleil.', 'passive', null],
  ['Le voleur sera arrêté par la police.', 'passive', null],
  ['Le héros était admiré de tous.', 'passive', null],
  ['Le courrier est apporté chaque matin.', 'passive', 'sans-agent'],
  ['Ce château fut construit au Moyen Âge.', 'passive', 'sans-agent'],
  ['Les copies ont été corrigées.', 'passive', 'sans-agent'],
];
const NOM_VOIX = { active: 'Voix active', passive: 'Voix passive' };

/** [phrase active, sa voix passive au même temps, [faux, piège], [faux, piège]]. */
export const TRANSFORMER = [
  ['Le chat mange la souris.', 'La souris est mangée par le chat.', ['La souris a été mangée par le chat.', 'garder-temps'], ['La souris est mangé par le chat.', 'accord-passif']],
  ['Le vent a renversé la poubelle.', 'La poubelle a été renversée par le vent.', ['La poubelle est renversée par le vent.', 'garder-temps'], ['La poubelle a été renversé par le vent.', 'accord-passif']],
  ['La police arrêtera le voleur.', 'Le voleur sera arrêté par la police.', ['Le voleur est arrêté par la police.', 'garder-temps'], ['Le voleur arrêtera la police.', 'echange-roles']],
  ['Les élèves admiraient le professeur.', 'Le professeur était admiré par les élèves.', ['Le professeur est admiré par les élèves.', 'garder-temps'], ['Le professeur était admirés par les élèves.', 'accord-passif']],
  ['Un architecte construisit ce pont.', 'Ce pont fut construit par un architecte.', ['Ce pont a été construit par un architecte.', 'garder-temps'], ['Ce pont construisit un architecte.', 'echange-roles']],
  ['Le jury récompensera les gagnantes.', 'Les gagnantes seront récompensées par le jury.', ['Les gagnantes seront récompensés par le jury.', 'accord-passif'], ['Les gagnantes sont récompensées par le jury.', 'garder-temps']],
  ['Mes parents ont repeint la cuisine.', 'La cuisine a été repeinte par mes parents.', ['La cuisine a été repeint par mes parents.', 'accord-passif'], ['La cuisine est repeinte par mes parents.', 'garder-temps']],
  ['Le chien poursuit les chats.', 'Les chats sont poursuivis par le chien.', ['Les chats sont poursuivi par le chien.', 'accord-passif'], ['Les chats poursuivent le chien.', 'echange-roles']],
  ['Le maire inaugurait la bibliothèque.', 'La bibliothèque était inaugurée par le maire.', ['La bibliothèque est inaugurée par le maire.', 'garder-temps'], ['La bibliothèque inaugurait le maire.', 'echange-roles']],
  ['Les pompiers ont sauvé les enfants.', 'Les enfants ont été sauvés par les pompiers.', ['Les enfants sont sauvés par les pompiers.', 'garder-temps'], ['Les enfants ont sauvé les pompiers.', 'echange-roles']],
  ['Une tempête détruira la récolte.', 'La récolte sera détruite par une tempête.', ['La récolte sera détruit par une tempête.', 'accord-passif'], ['La récolte a été détruite par une tempête.', 'garder-temps']],
];

/** [phrase passive, complément d'agent, sujet, complément circonstanciel]. */
export const AGENTS = [
  ['Ce matin, la souris a été attrapée par le chat.', 'par le chat', 'la souris', 'ce matin'],
  ['Le blessé fut transporté à l’hôpital par les secours.', 'par les secours', 'le blessé', 'à l’hôpital'],
  ['Dans ce village, le héros était admiré de tous.', 'de tous', 'le héros', 'dans ce village'],
  ['Le colis sera livré demain par le facteur.', 'par le facteur', 'le colis', 'demain'],
  ['Pendant la nuit, la tente fut emportée par le vent.', 'par le vent', 'la tente', 'pendant la nuit'],
  ['Le voleur a été arrêté par la police devant la banque.', 'par la police', 'le voleur', 'devant la banque'],
  ['Chaque été, la plage est envahie par les touristes.', 'par les touristes', 'la plage', 'chaque été'],
  ['Cette lettre a été écrite par ma grand-mère en 1950.', 'par ma grand-mère', 'cette lettre', 'en 1950'],
  ['Le gâteau sera partagé par les enfants à la fin du repas.', 'par les enfants', 'le gâteau', 'à la fin du repas'],
  ['Au Moyen Âge, ce château fut construit par un seigneur.', 'par un seigneur', 'ce château', 'au Moyen Âge'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const liste = [];
  // Une phrase vue en « active ou passive ? » ne revient pas à transformer.
  const voix = melanger(VOIX).slice(0, 3);
  voix.forEach(([phrase, bonne, piege]) => {
    const autre = bonne === 'active' ? 'passive' : 'active';
    let p = `voix-${bonne}`;
    if (piege === 'etre') p = 'voix-etre-actif';
    liste.push({
      consigne: 'voix',
      question: phrase,
      bonne,
      choix: ['active', 'passive'].map((c) => ({ cle: c, libelle: NOM_VOIX[c] })),
      pieges: { [autre]: p },
    });
  });
  const dejaVues = voix.map(([phrase]) => phrase);
  melanger(TRANSFORMER.filter(([active]) => !dejaVues.includes(active))).slice(0, 3).forEach((e) => {
    liste.push(depuisBanque(melanger, 'transformer', e));
  });
  melanger(AGENTS).slice(0, 2).forEach(([phrase, bonne, sujet, cc]) => {
    liste.push(depuisBanque(melanger, 'agent', [phrase, bonne, [sujet, 'agent-sujet'], [cc, 'agent-cc']]));
  });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  voix: 'Cette phrase est-elle à la voix active, ou à la voix passive ?',
  'voix-regle': 'Demande-toi si le sujet fait l’action, ou s’il la subit.',
  'voix-active': 'Ici, le sujet fait l’action : la phrase est à la voix active.',
  'voix-passive': 'Le sujet subit l’action, et le verbe est formé de être et du participe passé : c’est la voix passive, même sans complément d’agent.',
  'voix-etre-actif': 'Être ne signe pas toujours le passif : partir, arriver, tomber se conjuguent avec être au passé composé, à la voix active. Au passif, le sujet subit l’action.',
  transformer: 'Mets cette phrase à la voix passive, sans changer le temps.',
  'transformer-regle': 'Le COD devient sujet, le sujet devient complément d’agent, et être prend le temps du verbe actif.',
  'garder-temps': 'Garde le temps : au passif, c’est l’auxiliaire être qui prend le temps du verbe actif. Il mange devient il est mangé ; il a mangé devient il a été mangé.',
  'accord-passif': 'Au passif, le participe passé s’accorde avec le nouveau sujet, comme un adjectif.',
  'echange-roles': 'Le COD de la phrase active devient le sujet, et le sujet devient complément d’agent, introduit par par. Le sens ne change pas.',
  agent: 'Trouve le complément d’agent.',
  'agent-regle': 'Le complément d’agent fait l’action ; il est introduit par par, ou parfois par de.',
  'agent-sujet': 'Ça, c’est le sujet : il subit l’action. Le complément d’agent, introduit par par ou de, est celui qui la fait.',
  'agent-cc': 'Ce groupe dit où ou quand : c’est un complément circonstanciel. Le complément d’agent fait l’action : demande-toi « par qui ? ».',
};
