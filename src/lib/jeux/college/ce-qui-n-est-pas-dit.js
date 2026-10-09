/**
 * CE QUI N'EST PAS DIT — l'implicite et l'ironie en 3e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_3E_LECT_IMPLICITE — « Dégager l'implicite et l'ironie d'un texte »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - CE QU'ON COMPREND (4) : une réplique, ce qu'elle laisse entendre. TROIS
 *     ERREURS NOMMÉES : s'arrêter à ce qui est dit mot pour mot, le
 *     contresens, et la sur-interprétation (inventer ce que rien n'indique) ;
 *   - IRONIQUE OU SINCÈRE ? (2) : les mêmes mots, deux situations ; seule
 *     la situation dit s'il faut les prendre à l'envers ;
 *   - LE MOT QUI SOUS-ENTEND (2) : encore, enfin, même, aussi, ne… plus,
 *     de nouveau — le petit mot qui suppose quelque chose avant ou en plus.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'ce-qui-n-est-pas-dit', titre: 'Ce qui n’est pas dit', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'Ce qui n’est pas dit',
    accroche: 'Sous-entendus, implicite et ironie.',
    competences: ['FR_3E_LECT_IMPLICITE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [réplique, ce qu'elle laisse entendre, [[lecture fausse, erreur], …]]. */
export const SOUS_ENTENDUS = [
  ['« Tiens, tu as enfin rangé ta chambre ! »', 'D’habitude, elle n’est pas rangée.', [['La chambre est rangée, c’est tout.', 'seulement-dit'], ['Il va être puni.', 'sur-interpretation']]],
  ['« Pierre a arrêté de fumer. »', 'Pierre fumait avant.', [['Pierre n’a jamais fumé.', 'contresens'], ['Pierre est malade.', 'sur-interpretation']]],
  ['« Il fait froid ici, non ? » dit Marie en regardant la fenêtre ouverte.', 'Marie aimerait qu’on ferme la fenêtre.', [['Marie donne la température.', 'seulement-dit'], ['Marie veut partir.', 'sur-interpretation']]],
  ['« Même Lucas a eu la moyenne ! »', 'On ne s’attendait pas à ce que Lucas réussisse.', [['Lucas est le meilleur de la classe.', 'contresens'], ['Lucas a triché.', 'sur-interpretation']]],
  ['« Encore en retard ! » soupire le professeur.', 'L’élève est souvent en retard.', [['C’est la première fois.', 'contresens'], ['Le professeur est en retard, lui aussi.', 'sur-interpretation']]],
  ['« Tu as vu l’heure ? » demande la mère à son fils qui joue encore à minuit.', 'Il devrait aller se coucher.', [['Elle veut savoir l’heure.', 'seulement-dit'], ['Elle a perdu sa montre.', 'sur-interpretation']]],
  ['« Ton gâteau est… original », dit Léo, après une seule bouchée.', 'Léo n’aime pas vraiment le gâteau.', [['Léo trouve le gâteau délicieux.', 'contresens'], ['Le gâteau a brûlé.', 'sur-interpretation']]],
  ['« Je ne suis plus fâchée contre toi. »', 'Elle était fâchée avant.', [['Elle n’a jamais été fâchée.', 'contresens'], ['Elle va lui offrir un cadeau.', 'sur-interpretation']]],
  ['« Ce n’est pas moi qui ai cassé le vase, mais je ne dirai pas qui c’est. »', 'Il sait qui a cassé le vase.', [['Personne n’a cassé le vase.', 'contresens'], ['Le vase était très cher.', 'sur-interpretation']]],
  ['« Vous pouvez me passer le sel ? »', 'Il demande poliment le sel.', [['Il demande si l’autre en est capable.', 'seulement-dit'], ['Le plat est trop salé.', 'sur-interpretation']]],
  ['« Les autres invités sont partis, et il est minuit », dit l’hôte en bâillant.', 'Il aimerait que son invité s’en aille.', [['Il raconte ce que font les autres invités.', 'seulement-dit'], ['Il est malade.', 'sur-interpretation']]],
  ['« Cette fois, je vérifierai moi-même que la porte est fermée. »', 'La dernière fois, la porte était mal fermée.', [['Il aime vérifier les portes.', 'seulement-dit'], ['Un voleur est entré.', 'sur-interpretation']]],
  ['« Julie est revenue de vacances. »', 'Julie était partie en vacances.', [['Julie n’est jamais partie.', 'contresens'], ['Julie a aimé ses vacances.', 'sur-interpretation']]],
];

/** [réplique et sa situation, 'ironique' ou 'sincere']. */
export const REPLIQUES = [
  ['« Bravo, quelle adresse ! » dit Léa à son frère, qui vient de renverser son verre.', 'ironique'],
  ['« Quelle belle journée ! » dit Paul, trempé jusqu’aux os sous l’averse.', 'ironique'],
  ['« Merci pour ton aide », dit Hugo à son ami, qui l’a regardé porter seul tous les cartons.', 'ironique'],
  ['« Tu es vraiment en avance ! » lance le professeur à l’élève qui arrive avec une heure de retard.', 'ironique'],
  ['« Génial, encore des épinards ! » soupire Tom, qui les déteste.', 'ironique'],
  ['« Bravo, quelle adresse ! » dit l’entraîneur au gardien, qui vient d’arrêter un penalty.', 'sincere'],
  ['« Quelle belle journée ! » dit Paul en sortant au soleil, sur la plage.', 'sincere'],
  ['« Merci pour ton aide », dit Hugo à son ami, qui a porté la moitié des cartons.', 'sincere'],
  ['« Tu es vraiment en avance ! » dit la mère, étonnée de voir son fils prêt une heure avant le bus.', 'sincere'],
  ['« Génial, des crêpes ! » s’écrie Tom, qui les adore.', 'sincere'],
];

/** [phrase, le mot qui sous-entend, deux mots qui ne sous-entendent rien]. */
export const MOTS = [
  ['Paul est encore malade.', 'encore', ['Paul', 'malade']],
  ['Elle a enfin trouvé du travail.', 'enfin', ['trouvé', 'travail']],
  ['Il ne pleut plus.', 'plus', ['Il', 'pleut']],
  ['Même le directeur a ri.', 'Même', ['directeur', 'ri']],
  ['Ma sœur a de nouveau oublié ses clés.', 'de nouveau', ['oublié', 'clés']],
  ['Il n’a toujours pas répondu.', 'toujours', ['Il', 'répondu']],
  ['Elle a cessé de mentir.', 'cessé', ['Elle', 'a']],
  ['Lui aussi a manqué le train.', 'aussi', ['manqué', 'le train']],
  ['Il est revenu à la maison.', 'revenu', ['Il', 'la maison']],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const libres = (liste) => melanger(liste).map((c) => ({ cle: c, libelle: c }));

  const sousEntendus = melanger(SOUS_ENTENDUS).slice(0, 4).map(([replique, sens, faux]) => ({
    consigne: 'sous-entendu',
    question: replique,
    bonne: sens,
    choix: libres([sens, ...faux.map(([f]) => f)]),
    pieges: Object.fromEntries(faux),
    aide: 'sous-entendu-regle',
  }));

  const ironie = [
    ...melanger(REPLIQUES.filter(([, t]) => t === 'ironique')).slice(0, 1),
    ...melanger(REPLIQUES.filter(([, t]) => t === 'sincere')).slice(0, 1),
  ].map(([replique, ton]) => ({
    consigne: 'ironie',
    question: replique,
    bonne: ton,
    choix: [{ cle: 'ironique', libelle: 'Ironique' }, { cle: 'sincere', libelle: 'Sincère' }],
    pieges: ton === 'ironique' ? { sincere: 'ironie-contexte' } : { ironique: 'sincere-contexte' },
    aide: 'ironie-regle',
  }));

  const mots = melanger(MOTS).slice(0, 2).map(([p, mot, faux]) => ({
    consigne: 'mot-qui-sous-entend',
    question: `« ${p} »`,
    bonne: mot,
    choix: libres([mot, ...faux]),
    pieges: Object.fromEntries(faux.map((f) => [f, 'mot-sans-sous-entendu'])),
    aide: 'mot-qui-sous-entend-regle',
  }));

  return melanger([...sousEntendus, ...ironie, ...mots]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'sous-entendu': 'Que laisse entendre cette phrase, sans le dire ?',
  ironie: 'Cette phrase est-elle ironique, ou sincère ? Regarde bien la situation.',
  'mot-qui-sous-entend': 'Quel mot laisse entendre quelque chose de plus que ce qui est dit ?',
  'seulement-dit': 'Tu t’arrêtes à ce qui est dit mot pour mot. Demande-toi pourquoi la personne le dit ainsi, et ce qu’elle attend de l’autre.',
  contresens: 'C’est le contraire de ce que la phrase laisse entendre. Cherche le mot qui suppose quelque chose : encore, enfin, même, ne… plus.',
  'sur-interpretation': 'Rien dans la phrase ne permet de le dire. L’implicite se déduit des mots du texte : il ne s’invente pas.',
  'sous-entendu-regle': 'L’implicite se tire des mots et de la situation : ce que la phrase suppose, ou ce qu’elle suggère sans le dire.',
  'ironie-contexte': 'Les mots disent une chose, la situation montre le contraire : c’est de l’ironie. Compare toujours la phrase et la situation.',
  'sincere-contexte': 'Ici, la situation confirme les mots : rien ne les contredit, la phrase est sincère.',
  'ironie-regle': 'L’ironie dit le contraire de ce qu’elle pense. Elle ne se voit que si la situation contredit les mots.',
  'mot-sans-sous-entendu': 'Ce mot dit seulement le fait. Cherche le petit mot qui suppose quelque chose avant ou en plus : encore, enfin, même, aussi, ne… plus.',
  'mot-qui-sous-entend-regle': 'Enlève le mot : si la phrase ne suppose plus rien sur le passé ou sur les autres, c’est lui qui sous-entendait.',
};
