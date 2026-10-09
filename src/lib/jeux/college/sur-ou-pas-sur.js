/**
 * SÛR OU PAS SÛR ? — la modalisation en 3e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_3E_LANG_MODALISATION — « Repérer les marques de jugement et de
 *                              certitude dans un texte »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - QUELLE NUANCE ? (4) : la phrase exprime-t-elle une certitude, un doute,
 *     ou un jugement (heureusement, hélas, une merveille) ? DEUX PIÈGES
 *     NOMMÉS : « sans doute », qui veut dire « probablement » (c'est « sans
 *     AUCUN doute » qui est sûr), et le conditionnel des journaux (« le
 *     voleur serait entré »), qui ne garantit rien ;
 *   - LE MOT QUI NUANCE (2) : le modalisateur de la phrase ;
 *   - LA PLUS SÛRE, LA MOINS SÛRE (2) : trois phrases sur le même fait,
 *     rangées de la certitude au simple possible.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'sur-ou-pas-sur', titre: 'Sûr ou pas sûr ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'Sûr ou pas sûr ?',
    accroche: 'Certitude, doute et jugement.',
    competences: ['FR_3E_LANG_MODALISATION'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const NUANCES = { certitude: 'Une certitude', doute: 'Un doute', jugement: 'Un jugement' };

/** [phrase, nuance, pièges propres à la phrase]. */
export const PHRASES_NUANCEES = [
  ['Il viendra sans aucun doute.', 'certitude'],
  ['Je suis convaincu que nous gagnerons.', 'certitude'],
  ['Il est évident que la Terre tourne autour du Soleil.', 'certitude'],
  ['Assurément, le train partira à l’heure.', 'certitude'],
  ['Il est certain que le spectacle aura lieu.', 'certitude'],
  ['Elle a forcément entendu la sonnerie.', 'certitude'],
  ['Il viendra peut-être demain.', 'doute'],
  ['Il est sans doute déjà parti.', 'doute', { certitude: 'sans-doute' }],
  ['Il semble que l’orage approche.', 'doute'],
  ['Il se pourrait que le match soit annulé.', 'doute'],
  ['Je crois qu’elle a raison, mais je n’en suis pas sûr.', 'doute'],
  ['Selon un témoin, le voleur serait entré par la fenêtre.', 'doute', { certitude: 'conditionnel-doute' }],
  ['Probablement, la réunion sera reportée.', 'doute'],
  ['Heureusement, personne n’a été blessé.', 'jugement'],
  ['Hélas, le spectacle est annulé.', 'jugement'],
  ['Ce roman est une pure merveille.', 'jugement'],
  ['Malheureusement, il a manqué son train.', 'jugement'],
  ['Cette décision est franchement scandaleuse.', 'jugement'],
];

/** [phrase, le mot qui nuance, deux mots qui ne nuancent pas]. */
export const MODALISATEURS = [
  ['Il est probablement malade.', 'probablement', ['est', 'malade']],
  ['Elle a sûrement oublié l’heure.', 'sûrement', ['oublié', 'l’heure']],
  ['Hélas, la neige a fondu.', 'Hélas', ['la neige', 'fondu']],
  ['Le suspect aurait quitté la ville.', 'aurait', ['suspect', 'la ville']],
  ['Il pleuvra peut-être ce soir.', 'peut-être', ['pleuvra', 'ce soir']],
  ['Heureusement, le bus était à l’heure.', 'Heureusement', ['le bus', 'à l’heure']],
  ['Elle viendra certainement samedi.', 'certainement', ['viendra', 'samedi']],
  ['Il semble fatigué ce matin.', 'semble', ['fatigué', 'ce matin']],
  ['Visiblement, le chat a tout mangé.', 'Visiblement', ['le chat', 'tout mangé']],
];

/** Trois phrases sur le même fait : [certaine, probable, seulement possible]. */
export const ECHELLES = [
  ['Il viendra sans aucun doute.', 'Il viendra sans doute.', 'Il viendra peut-être.'],
  ['Il est certain que le musée est fermé.', 'Le musée est probablement fermé.', 'Il se peut que le musée soit fermé.'],
  ['Je suis sûr qu’il a menti.', 'Je pense qu’il a menti.', 'Je me demande s’il a menti.'],
  ['Il est évident que le pont va céder.', 'Le pont risque de céder.', 'Il n’est pas impossible que le pont cède.'],
  ['La fusée décollera à midi, c’est confirmé.', 'La fusée devrait décoller à midi.', 'La fusée décollera peut-être à midi.'],
  ['Elle a forcément reçu ma lettre.', 'Elle a sans doute reçu ma lettre.', 'Elle a peut-être reçu ma lettre.'],
  ['Il est certain qu’il neigera demain.', 'Il neigera probablement demain.', 'Il se pourrait qu’il neige demain.'],
];
const NIVEAUX = ['echelle-certain', 'echelle-probable', 'echelle-possible'];

export function serie(graine = Date.now()) {
  const { melanger, entre } = outils(graine);

  const nuances = melanger(PHRASES_NUANCEES).slice(0, 4).map(([p, nuance, propres = {}]) => {
    const pieges = {};
    Object.keys(NUANCES).filter((n) => n !== nuance).forEach((n) => { pieges[n] = propres[n] ?? `marque-${nuance}`; });
    return {
      consigne: 'nuance',
      question: `« ${p} »`,
      bonne: nuance,
      choix: Object.entries(NUANCES).map(([cle, libelle]) => ({ cle, libelle })),
      pieges,
      aide: 'nuance-regle',
    };
  });

  const mots = melanger(MODALISATEURS).slice(0, 2).map(([p, mot, faux]) => ({
    consigne: 'mot-qui-nuance',
    question: `« ${p} »`,
    bonne: mot,
    choix: melanger([mot, ...faux]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map((f) => [f, 'mot-sans-nuance'])),
    aide: 'mot-qui-nuance-regle',
  }));

  const echelles = melanger(ECHELLES).slice(0, 2).map((trois) => {
    const plus = entre(0, 1) === 0;
    const bonne = plus ? trois[0] : trois[2];
    return {
      consigne: plus ? 'plus-sure' : 'moins-sure',
      question: plus ? 'La plus sûre ?' : 'La moins sûre ?',
      bonne,
      choix: melanger(trois).map((c) => ({ cle: c, libelle: c })),
      pieges: Object.fromEntries(trois.map((c, i) => [c, NIVEAUX[i]]).filter(([c]) => c !== bonne)),
      aide: 'echelle-regle',
    };
  });

  return melanger([...nuances, ...mots, ...echelles]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  nuance: 'Cette phrase exprime-t-elle une certitude, un doute, ou un jugement ?',
  'mot-qui-nuance': 'Quel mot montre ce que pense celui qui parle ?',
  'plus-sure': 'Laquelle de ces phrases est la plus sûre ?',
  'moins-sure': 'Laquelle de ces phrases est la moins sûre ?',
  'marque-certitude': 'Des mots comme « sans aucun doute », « il est certain que », « forcément » ne laissent aucune place à l’hésitation : c’est une certitude.',
  'marque-doute': 'Des mots comme « peut-être », « il semble », « il se pourrait », « probablement » laissent place à l’hésitation : c’est un doute.',
  'marque-jugement': 'Des mots comme « heureusement », « hélas », « une merveille » disent si c’est bien ou mal : c’est un jugement, pas un degré de certitude.',
  'sans-doute': 'Attention : « sans doute » veut dire « probablement ». C’est « sans aucun doute » qui marque la certitude.',
  'conditionnel-doute': 'Le conditionnel des journaux, « il serait entré », signale une information non vérifiée : c’est un doute.',
  'nuance-regle': 'Demande-toi si celui qui parle est sûr, s’il hésite, ou s’il dit ce qu’il en pense.',
  'mot-sans-nuance': 'Ce mot dit le fait lui-même. Cherche le mot qui montre la pensée de celui qui parle : peut-être, hélas, sans doute, ou un verbe au conditionnel.',
  'mot-qui-nuance-regle': 'Enlève le mot : si la phrase devient une simple affirmation, c’est lui qui nuançait.',
  'echelle-certain': 'Cette phrase est sûre d’elle : « sans aucun doute », « il est certain que », « c’est confirmé » marquent la certitude.',
  'echelle-probable': 'Cette phrase dit que c’est probable : ni tout à fait sûr, ni seulement possible.',
  'echelle-possible': 'Cette phrase dit seulement que c’est possible : « peut-être », « il se peut » marquent le doute le plus fort.',
  'echelle-regle': 'Range les trois phrases : d’abord la certitude, puis le probable, enfin le simple possible.',
};
