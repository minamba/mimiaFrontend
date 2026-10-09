/**
 * QUI PARLE ? — les paroles rapportées, de la 6e à la 4e.
 * Professeur : Adrien (français).
 *
 * 6e — REPÉRER LES PAROLES DANS UN RÉCIT (3 + 3 + 2, mélangées) :
 *   - QUI DIT CELA ? (3) : un court dialogue écrit pour le jeu ; les
 *     paroles sont entre guillemets ou après un tiret, la phrase qui les
 *     accompagne (« répondit Tom ») nomme celui qui parle. LES PIÈGES : le
 *     personnage nommé juste avant, et « le narrateur » quand les paroles
 *     disent « je » ;
 *   - LE VERBE DE PAROLE (3) : trois verbes de la phrase, un seul introduit
 *     les paroles. LES PIÈGES : un verbe d'action, et un verbe pris DANS les
 *     paroles (« Fermez tout ! ») ;
 *   - QUEL DISCOURS ? (2) : discours direct, discours indirect, ou pas de
 *     paroles du tout.
 *
 * 4e — DU DISCOURS DIRECT AU DISCOURS INDIRECT (3 + 3 + 2) :
 *   - LA BONNE TRANSPOSITION (3) : trois suites possibles. Pièges : les
 *     pronoms et possessifs non transposés, le temps non transposé, la
 *     question qui garde son inversion, l'ordre qui garde son point
 *     d'exclamation ;
 *   - LE TEMPS (3) : présent → imparfait, passé composé → plus-que-parfait,
 *     futur → conditionnel. Pièges : garder le temps, se tromper de temps ;
 *   - LES INDICATEURS DE TEMPS (2) : demain → le lendemain, hier → la
 *     veille… Pièges : le garder, ou partir dans le mauvais sens.
 * Le verbe qui introduit est TOUJOURS au passé simple (déclara, expliqua),
 * jamais « dit » qui pourrait être un présent : la concordance s'impose,
 * une seule réponse est défendable.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'qui-parle', titre: 'Qui parle ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Qui parle ?',
    accroche: 'Guillemets, tirets : trouve qui parle.',
    competences: ['FR_6E_LECT_DISCOURS'],
  },
  QUATRIEME: {
    titre: 'Du direct à l’indirect',
    accroche: 'Rapporte les paroles sans les trahir.',
    competences: ['FR_4E_LANG_DISCOURS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

// ------------------------------------------------------------------ 6e

/** [extrait, paroles demandées, bonne réponse, deux autres]. « Le narrateur » est toujours un piège. */
const QUI_DIT = [
  ['« Tu viens jouer ? » demanda Léa à son frère. « Pas maintenant, je lis », répondit Tom.', 'Pas maintenant, je lis', 'Tom', ['Léa', 'Le narrateur']],
  ['— Qui a laissé la porte ouverte ? gronda la mère.\n— C’est le chat, murmura Hugo.', 'C’est le chat', 'Hugo', ['La mère', 'Le chat']],
  ['« Je suis le roi de cette forêt », rugit le lion. Le renard s’inclina sans un mot.', 'Je suis le roi de cette forêt', 'Le lion', ['Le renard', 'Le narrateur']],
  ['Le capitaine se tourna vers le mousse : « Monte au mât et surveille l’horizon ! »', 'Monte au mât et surveille l’horizon !', 'Le capitaine', ['Le mousse', 'Le narrateur']],
  ['« As-tu vu mon chien ? » demanda une fillette au boulanger. Celui-ci haussa les épaules : « Je ne l’ai pas vu. »', 'Je ne l’ai pas vu.', 'Le boulanger', ['La fillette', 'Le narrateur']],
  ['« Silence ! » ordonna la professeure. Les élèves se turent aussitôt.', 'Silence !', 'La professeure', ['Les élèves', 'Le narrateur']],
  ['Ulysse appela ses compagnons :\n— Bouchez-vous les oreilles avec cette cire !', 'Bouchez-vous les oreilles avec cette cire !', 'Ulysse', ['Les compagnons', 'Le narrateur']],
  ['— Je t’ai attendu tout l’après-midi, soupira Inès.\n— Pardon, mon bus était en retard, dit Karim.', 'Pardon, mon bus était en retard', 'Karim', ['Inès', 'Le narrateur']],
  ['« Pourquoi salis-tu mon eau ? » gronda le loup. « Je bois plus bas que vous », répondit l’agneau.', 'Je bois plus bas que vous', 'L’agneau', ['Le loup', 'Le narrateur']],
  ['« Où allez-vous si tard ? » demanda le garde. Le voyageur ne répondit rien et pressa le pas.', 'Où allez-vous si tard ?', 'Le garde', ['Le voyageur', 'Le narrateur']],
  ['Je m’approchai du vieil homme. « Tu cherches quelque chose, petit ? » me demanda-t-il.', 'Tu cherches quelque chose, petit ?', 'Le vieil homme', ['Le narrateur', 'Un passant']],
  ['— On rentre ? proposa Lucas.\n— Encore cinq minutes ! supplia sa sœur.', 'Encore cinq minutes !', 'La sœur de Lucas', ['Lucas', 'Le narrateur']],
];

/** [phrase, le verbe de parole, [autre verbe, nom de l'erreur]×2]. */
const VERBE_PAROLE = [
  ['Le garde courut vers la porte et hurla : « Fermez tout ! »', 'hurla', [['courut', 'verbe-action'], ['Fermez', 'verbe-dans-paroles']]],
  ['« Je reviendrai », promit le chevalier en montant à cheval.', 'promit', [['reviendrai', 'verbe-dans-paroles'], ['montant', 'verbe-action']]],
  ['Elle posa son sac et murmura : « Je suis épuisée. »', 'murmura', [['posa', 'verbe-action'], ['suis', 'verbe-dans-paroles']]],
  ['« Qui est là ? » demanda Paul, qui tremblait de peur.', 'demanda', [['tremblait', 'verbe-action'], ['est', 'verbe-dans-paroles']]],
  ['Le roi se leva et déclara : « La guerre est finie. »', 'déclara', [['leva', 'verbe-action'], ['est', 'verbe-dans-paroles']]],
  ['« Courez ! » cria Nora en attrapant la main de son frère.', 'cria', [['Courez', 'verbe-dans-paroles'], ['attrapant', 'verbe-action']]],
  ['Le vieil homme sourit, puis répondit : « Tu as bien grandi. »', 'répondit', [['sourit', 'verbe-action'], ['grandi', 'verbe-dans-paroles']]],
  ['« Il fait froid », grommela Hugo en fermant la fenêtre.', 'grommela', [['fait', 'verbe-dans-paroles'], ['fermant', 'verbe-action']]],
  ['La sorcière s’approcha et lança : « Vous ne sortirez jamais d’ici ! »', 'lança', [['approcha', 'verbe-action'], ['sortirez', 'verbe-dans-paroles']]],
  ['« Je n’ai rien vu », affirma le témoin en baissant les yeux.', 'affirma', [['vu', 'verbe-dans-paroles'], ['baissant', 'verbe-action']]],
  ['Le capitaine regarda la mer et ordonna : « Hissez les voiles ! »', 'ordonna', [['regarda', 'verbe-action'], ['Hissez', 'verbe-dans-paroles']]],
  ['« Dors bien », chuchota maman en éteignant la lumière.', 'chuchota', [['Dors', 'verbe-dans-paroles'], ['éteignant', 'verbe-action']]],
];

const DISCOURS_LIBELLES = { direct: 'Discours direct', indirect: 'Discours indirect', recit: 'Pas de paroles rapportées' };

/** [phrase, sorte de discours]. */
const QUEL_DISCOURS = [
  ['« J’ai faim », dit le petit garçon.', 'direct'],
  ['Le petit garçon dit qu’il avait faim.', 'indirect'],
  ['Le petit garçon avait faim.', 'recit'],
  ['Elle demanda si le train était parti.', 'indirect'],
  ['— Le train est-il parti ? demanda-t-elle.', 'direct'],
  ['Le train était déjà parti.', 'recit'],
  ['Mon père m’a dit de ranger ma chambre.', 'indirect'],
  ['Le soleil se couchait sur la plage.', 'recit'],
  ['Le guide nous expliqua que le château avait mille ans.', 'indirect'],
  ['« Ce château a mille ans », expliqua le guide.', 'direct'],
];

// ------------------------------------------------------------------ 4e

/** [phrase au discours direct, début de la phrase au discours indirect, bonne suite, [suite fausse, erreur]×2]. */
const VERS_INDIRECT = [
  ['Léa déclara : « Je suis fatiguée. »', 'Léa déclara…', 'qu’elle était fatiguée.', [['que j’étais fatiguée.', 'indirect-pronoms'], ['qu’elle est fatiguée.', 'indirect-temps']]],
  ['Tom expliqua : « Je ne trouve pas mes clés. »', 'Tom expliqua…', 'qu’il ne trouvait pas ses clés.', [['qu’il ne trouvait pas mes clés.', 'indirect-pronoms'], ['qu’il ne trouve pas ses clés.', 'indirect-temps']]],
  ['Ma sœur me demanda : « Tu viens avec moi ? »', 'Ma sœur me demanda…', 'si je venais avec elle.', [['si tu venais avec moi.', 'indirect-pronoms'], ['est-ce que je venais avec elle ?', 'indirect-question']]],
  ['Le médecin affirma aux parents : « Votre fils va mieux. »', 'Le médecin affirma aux parents…', 'que leur fils allait mieux.', [['que votre fils allait mieux.', 'indirect-pronoms'], ['que leur fils va mieux.', 'indirect-temps']]],
  ['Paul répondit : « J’ai fini mon travail. »', 'Paul répondit…', 'qu’il avait fini son travail.', [['qu’il avait fini mon travail.', 'indirect-pronoms'], ['qu’il a fini son travail.', 'indirect-temps']]],
  ['La reine ordonna au soldat : « Ouvre la porte ! »', 'La reine ordonna au soldat…', 'd’ouvrir la porte.', [['ouvre la porte !', 'indirect-ordre'], ['qu’il ouvre la porte !', 'indirect-ordre']]],
  ['Inès demanda à son frère : « Où as-tu caché le gâteau ? »', 'Inès demanda à son frère…', 'où il avait caché le gâteau.', [['où as-tu caché le gâteau ?', 'indirect-question'], ['où il a caché le gâteau.', 'indirect-temps']]],
  ['Le pêcheur raconta : « Je vois un dauphin chaque matin. »', 'Le pêcheur raconta…', 'qu’il voyait un dauphin chaque matin.', [['que je voyais un dauphin chaque matin.', 'indirect-pronoms'], ['qu’il voit un dauphin chaque matin.', 'indirect-temps']]],
  ['Hugo promit à sa mère : « Je rangerai ma chambre. »', 'Hugo promit à sa mère…', 'qu’il rangerait sa chambre.', [['qu’il rangerait ma chambre.', 'indirect-pronoms'], ['qu’il rangera sa chambre.', 'indirect-temps']]],
  ['Le professeur demanda aux élèves : « Avez-vous compris ? »', 'Le professeur demanda aux élèves…', 's’ils avaient compris.', [['avez-vous compris ?', 'indirect-question'], ['s’ils ont compris.', 'indirect-temps']]],
  ['Nina expliqua : « Mon chat est malade. »', 'Nina expliqua…', 'que son chat était malade.', [['que mon chat était malade.', 'indirect-pronoms'], ['que son chat est malade.', 'indirect-temps']]],
  ['Le chef ordonna aux soldats : « Restez à vos postes ! »', 'Le chef ordonna aux soldats…', 'de rester à leurs postes.', [['de rester à vos postes.', 'indirect-pronoms'], ['restez à vos postes !', 'indirect-ordre']]],
];

/**
 * [phrase au discours direct, phrase au discours indirect à trou, temps du
 * discours direct, bonne forme, forme au même temps, forme au mauvais temps].
 */
const TEMPS = [
  ['Elle annonça : « Je partirai demain. »', 'Elle annonça qu’elle ___ le lendemain.', 'futur', 'partirait', 'partira', 'partait'],
  ['Il expliqua : « Je connais le chemin. »', 'Il expliqua qu’il ___ le chemin.', 'present', 'connaissait', 'connaît', 'connaîtrait'],
  ['Elle avoua : « J’ai cassé le vase. »', 'Elle avoua qu’elle ___ le vase.', 'passe-compose', 'avait cassé', 'a cassé', 'cassait'],
  ['Le maire promit : « La piscine ouvrira en juin. »', 'Le maire promit que la piscine ___ en juin.', 'futur', 'ouvrirait', 'ouvrira', 'ouvrait'],
  ['Le pilote annonça : « L’avion survole les Alpes. »', 'Le pilote annonça que l’avion ___ les Alpes.', 'present', 'survolait', 'survole', 'survolerait'],
  ['Mon frère prétendit : « J’ai vu un fantôme. »', 'Mon frère prétendit qu’il ___ un fantôme.', 'passe-compose', 'avait vu', 'a vu', 'voyait'],
  ['Les élèves jurèrent : « Nous serons sages. »', 'Les élèves jurèrent qu’ils ___ sages.', 'futur', 'seraient', 'seront', 'étaient'],
  ['La voisine répondit : « Mon chien a peur de l’orage. »', 'La voisine répondit que son chien ___ peur de l’orage.', 'present', 'avait', 'a', 'aurait'],
  ['Le témoin déclara : « Le voleur s’est enfui par la fenêtre. »', 'Le témoin déclara que le voleur ___ par la fenêtre.', 'passe-compose', 's’était enfui', 's’est enfui', 's’enfuyait'],
  ['Karim répondit : « Je n’ai pas faim. »', 'Karim répondit qu’il ___ pas faim.', 'present', 'n’avait', 'n’a', 'n’aurait'],
];

/** [phrase au discours direct, phrase au discours indirect à trou, bonne, [faux, erreur]×2]. */
const INDICATEURS = [
  ['Il annonça : « Je reviendrai demain. »', 'Il annonça qu’il reviendrait ___.', 'le lendemain', [['demain', 'indicateur-garde'], ['la veille', 'indicateur-sens']]],
  ['Elle raconta : « Je suis arrivée hier. »', 'Elle raconta qu’elle était arrivée ___.', 'la veille', [['hier', 'indicateur-garde'], ['le lendemain', 'indicateur-sens']]],
  ['Le chef annonça : « Nous partons maintenant. »', 'Le chef annonça qu’ils partaient ___.', 'à ce moment-là', [['maintenant', 'indicateur-garde'], ['la veille', 'indicateur-sens']]],
  ['Elle confia : « Aujourd’hui, je suis heureuse. »', 'Elle confia qu’elle était heureuse ___.', 'ce jour-là', [['aujourd’hui', 'indicateur-garde'], ['la veille', 'indicateur-sens']]],
  ['Le directeur annonça : « La réunion aura lieu la semaine prochaine. »', 'Le directeur annonça que la réunion aurait lieu ___.', 'la semaine suivante', [['la semaine prochaine', 'indicateur-garde'], ['la semaine précédente', 'indicateur-sens']]],
  ['Mon ami avoua : « J’ai menti la semaine dernière. »', 'Mon ami avoua qu’il avait menti ___.', 'la semaine précédente', [['la semaine dernière', 'indicateur-garde'], ['la semaine suivante', 'indicateur-sens']]],
  ['Le marin expliqua : « Ce soir, la mer sera calme. »', 'Le marin expliqua que la mer serait calme ___.', 'ce soir-là', [['ce soir', 'indicateur-garde'], ['la veille au soir', 'indicateur-sens']]],
  ['Léa écrivit : « Je t’appellerai dans deux jours. »', 'Léa écrivit qu’elle l’appellerait ___.', 'deux jours plus tard', [['dans deux jours', 'indicateur-garde'], ['deux jours avant', 'indicateur-sens']]],
];

// ------------------------------------------------------------------ fabriques

const fabriquerQuiDit = ([extrait, paroles, bonne, autres], melanger) => ({
  consigne: 'qui-dit',
  question: `${extrait}\nQui dit : « ${paroles} » ?`,
  extrait,
  bonne,
  choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(autres.map((c) => [c, c === 'Le narrateur' ? 'parole-narrateur' : 'parole-qui'])),
  aide: 'parole-qui',
});

const fabriquerVerbe = ([question, bonne, fausses], melanger) => ({
  consigne: 'verbe-de-parole',
  question,
  bonne,
  choix: melanger([bonne, ...fausses.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(fausses),
  aide: 'verbe-de-parole-regle',
});

const fabriquerDiscours = ([question, bonne], melanger) => {
  const autres = Object.keys(DISCOURS_LIBELLES).filter((c) => c !== bonne);
  return {
    consigne: 'quel-discours',
    question,
    bonne,
    choix: melanger(Object.keys(DISCOURS_LIBELLES)).map((c) => ({ cle: c, libelle: DISCOURS_LIBELLES[c] })),
    pieges: Object.fromEntries(autres.map((c) => [c, `discours-${bonne}`])),
    aide: `discours-${bonne}`,
  };
};

const fabriquerIndirect = ([direct, debut, bonne, fausses], melanger) => ({
  consigne: 'vers-indirect',
  question: `${direct}\n${debut}`,
  bonne,
  choix: melanger([bonne, ...fausses.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(fausses),
  aide: fausses[0][1],
});

const fabriquerTemps = ([direct, indirect, temps, bonne, meme, autre], melanger) => ({
  consigne: 'temps-indirect',
  question: `${direct}\n${indirect}`,
  bonne,
  choix: melanger([bonne, meme, autre]).map((c) => ({ cle: c, libelle: c })),
  pieges: { [meme]: `indirect-${temps}`, [autre]: `indirect-${temps}` },
  aide: `indirect-${temps}`,
});

const fabriquerIndicateur = ([direct, indirect, bonne, fausses], melanger) => ({
  consigne: 'indicateur-indirect',
  question: `${direct}\n${indirect}`,
  bonne,
  choix: melanger([bonne, ...fausses.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
  pieges: Object.fromEntries(fausses),
  aide: 'indicateur-garde',
});

export const SORTES = {
  SIXIEME: [
    { banque: QUI_DIT, nombre: 3, fabriquer: fabriquerQuiDit },
    { banque: VERBE_PAROLE, nombre: 3, fabriquer: fabriquerVerbe },
    { banque: QUEL_DISCOURS, nombre: 2, fabriquer: fabriquerDiscours },
  ],
  QUATRIEME: [
    { banque: VERS_INDIRECT, nombre: 3, fabriquer: fabriquerIndirect },
    { banque: TEMPS, nombre: 3, fabriquer: fabriquerTemps },
    { banque: INDICATEURS, nombre: 2, fabriquer: fabriquerIndicateur },
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
  'qui-dit': 'Lis l’extrait : quel personnage prononce ces paroles ?',
  'verbe-de-parole': 'Quel est le verbe de parole, celui qui introduit ou accompagne les paroles ?',
  'quel-discours': 'Discours direct, discours indirect, ou pas de paroles du tout ?',
  'qui-dit-regle': 'Regarde la phrase qui annonce ou accompagne les paroles : elle nomme celui qui parle.',
  'verbe-de-parole-regle': 'Le verbe de parole est en dehors des guillemets : dire, demander, crier, murmurer, répondre. Il dit comment on parle.',
  'quel-discours-regle': 'Entre guillemets ou après un tiret, c’est le discours direct ; après que, si ou de, sans guillemets, le discours indirect.',
  'parole-qui': 'Regarde la phrase qui annonce ou accompagne les paroles, avec un verbe comme dire, répondre ou crier : elle indique qui parle. À chaque tiret, l’interlocuteur change.',
  'parole-narrateur': 'Le narrateur raconte ; les paroles entre guillemets, ou après un tiret, sont celles d’un personnage, même quand elles disent je. Cherche son nom près du verbe de parole.',
  'verbe-action': 'Ce verbe dit une action, pas une parole. Le verbe de parole introduit ou accompagne les paroles : dire, crier, demander, murmurer.',
  'verbe-dans-paroles': 'Ce verbe est dans les paroles elles-mêmes, entre les guillemets. Le verbe de parole est dehors, dans le récit : il dit comment on parle.',
  'discours-direct': 'Les paroles sont citées telles quelles, entre guillemets ou après un tiret : c’est le discours direct.',
  'discours-indirect': 'Les paroles sont rapportées par le narrateur, après un verbe de parole suivi de que, si ou de, sans guillemets : c’est le discours indirect.',
  'discours-recit': 'Personne ne parle ici : il n’y a ni verbe de parole, ni guillemets, ni tiret. C’est le récit.',
  // 4e
  'vers-indirect': 'Passe ces paroles au discours indirect : quelle suite est correcte ?',
  'temps-indirect': 'Au discours indirect, dans un récit au passé, quel temps prend le verbe ?',
  'indicateur-indirect': 'Au discours indirect, dans un récit au passé, que devient l’indicateur de temps ?',
  'vers-indirect-regle': 'Au discours indirect, les pronoms, les temps et les indicateurs de temps changent, et la ponctuation des paroles disparaît.',
  'temps-indirect-regle': 'Après un verbe au passé, le présent devient imparfait, le passé composé devient plus-que-parfait, le futur devient conditionnel.',
  'indicateur-indirect-regle': 'Demain devient le lendemain, hier devient la veille, maintenant devient à ce moment-là.',
  'indirect-pronoms': 'Au discours indirect, celui qui parle n’est plus je : les pronoms et les possessifs changent. Je devient il ou elle, mon devient son, votre devient leur.',
  'indirect-temps': 'Le verbe qui introduit est au passé : le présent devient imparfait, le passé composé devient plus-que-parfait, le futur devient conditionnel.',
  'indirect-question': 'Une question au discours indirect perd son inversion et son point d’interrogation : on écrit si, ou où, puis le sujet avant le verbe.',
  'indirect-ordre': 'Un ordre au discours indirect se rapporte avec de et l’infinitif, sans point d’exclamation.',
  'indirect-present': 'Le présent du discours direct devient un imparfait : je connais devient il connaissait.',
  'indirect-passe-compose': 'Le passé composé du discours direct devient un plus-que-parfait : j’ai vu devient il avait vu.',
  'indirect-futur': 'Le futur du discours direct devient un conditionnel présent : je partirai devient elle partirait.',
  'indicateur-garde': 'Dans un récit au passé, les indicateurs de temps changent : demain devient le lendemain, hier devient la veille, maintenant devient à ce moment-là.',
  'indicateur-sens': 'Attention au sens : demain, c’est après, donc le lendemain ; hier, c’est avant, donc la veille. Le moment ne change pas, seul le repère change.',
};
