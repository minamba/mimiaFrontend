/**
 * LE CHEVALIER — le récit de chevalerie en 5e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_5E_LECT_CHEVALERIE — « Lire un récit chevaleresque et en situer les
 *                            valeurs »
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2) :
 *   - LA VALEUR (3) : un geste du chevalier, la valeur qu'il montre —
 *     courage, loyauté, courtoisie, foi, générosité (la « largesse ») ;
 *   - LA LÉGENDE (3) : la légende arthurienne, des faits établis seulement
 *     (l'épée dans la pierre, Excalibur, la Table ronde, Guenièvre, Lancelot,
 *     Perceval, Yvain le chevalier au lion, Chrétien de Troyes, Camelot,
 *     Brocéliande, Avalon). LES PIÈGES sont des voisins réels : Durandal est
 *     l'épée de Roland, Joyeuse celle de Charlemagne, Iseut l'amante de
 *     Tristan ; la phrase d'erreur remet chacun à sa place ;
 *   - LE MOT (2) : destrier, écuyer, adouber, heaume, écu, haubert, vassal,
 *     félon, quête, preux.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'le-chevalier', titre: 'Le chevalier', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Le chevalier',
    accroche: 'Les valeurs de la Table ronde.',
    competences: ['FR_5E_LECT_CHEVALERIE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const VALEURS = {
  courage: 'Le courage',
  loyaute: 'La loyauté',
  courtoisie: 'La courtoisie',
  foi: 'La foi',
  generosite: 'La générosité',
};

/** [geste du chevalier, valeur]. */
export const GESTES = [
  ['Seul face au dragon, le chevalier ne recule pas d’un pas.', 'courage'],
  ['Malgré la peur, il entre dans la forêt dont personne n’est jamais revenu.', 'courage'],
  ['Blessé au bras, le chevalier continue de défendre le pont contre dix brigands.', 'courage'],
  ['Le chevalier a promis de revenir dans un an : il revient au jour dit, comme promis.', 'loyaute'],
  ['On lui offre de l’or pour ouvrir à l’ennemi les portes du château de son seigneur : il refuse.', 'loyaute'],
  ['Son compagnon d’armes est accusé à tort : le chevalier ne l’abandonne pas et reste à ses côtés.', 'loyaute'],
  ['Il salue la dame avec respect et lui cède la meilleure place à table.', 'courtoisie'],
  ['Le chevalier parle avec douceur et politesse à la reine, même quand il est en colère.', 'courtoisie'],
  ['Avant le tournoi, il attache à sa lance le ruban de sa dame, pour lui faire honneur.', 'courtoisie'],
  ['Avant d’être adoubé, le jeune homme passe la nuit à prier dans la chapelle.', 'foi'],
  ['Il fait le signe de croix et confie sa vie à Dieu avant d’entrer dans la forêt enchantée.', 'foi'],
  ['Il part chercher le Graal, la coupe sacrée, pour servir Dieu.', 'foi'],
  ['Le chevalier partage son pain avec un mendiant rencontré sur la route.', 'generosite'],
  ['Après sa victoire, il distribue le butin à ses compagnons sans rien garder pour lui.', 'generosite'],
  ['Il donne son manteau à un pauvre qui grelotte au bord du chemin.', 'generosite'],
];

/** [question, bonne réponse, deux choix faux, phrase de l'erreur]. */
export const LEGENDE = [
  ['Qui retire l’épée plantée dans la pierre, et devient roi ?', 'Arthur', ['Lancelot', 'Merlin'], 'legende-epee-pierre'],
  ['Quel enchanteur veille sur le roi Arthur et le conseille ?', 'Merlin', ['Perceval', 'Gauvain'], 'legende-merlin'],
  ['Comment s’appelle l’épée du roi Arthur ?', 'Excalibur', ['Durandal', 'Joyeuse'], 'legende-excalibur'],
  ['Autour de quoi se réunissent les chevaliers d’Arthur ?', 'La Table ronde', ['Le trône d’or', 'La grande cheminée'], 'legende-table'],
  ['Pourquoi la Table est-elle ronde ?', 'Nul n’y est au-dessus des autres', ['Pour gagner de la place', 'Pour imiter le soleil'], 'legende-table-ronde'],
  ['Qui est l’épouse du roi Arthur ?', 'Guenièvre', ['Iseut', 'Viviane'], 'legende-guenievre'],
  ['Quel chevalier aime en secret la reine Guenièvre ?', 'Lancelot', ['Perceval', 'Yvain'], 'legende-lancelot'],
  ['Chez Chrétien de Troyes, quel jeune Gallois naïf découvre le Graal ?', 'Perceval', ['Lancelot', 'Arthur'], 'legende-perceval'],
  ['Qui a écrit, au XIIe siècle, Yvain, Lancelot et Perceval ?', 'Chrétien de Troyes', ['Molière', 'Victor Hugo'], 'legende-chretien'],
  ['Comment s’appelle le château du roi Arthur ?', 'Camelot', ['Brocéliande', 'Avalon'], 'legende-camelot'],
  ['Dans quelle forêt enchantée la fée Viviane retient-elle Merlin ?', 'Brocéliande', ['Camelot', 'Sherwood'], 'legende-broceliande'],
  ['Yvain est aussi appelé « le chevalier au… »', 'Lion', ['Dragon', 'Cygne'], 'legende-yvain'],
  ['Quelle coupe sacrée les chevaliers de la Table ronde cherchent-ils ?', 'Le Graal', ['Excalibur', 'La Toison d’or'], 'legende-graal'],
  ['Quel chevalier de la Table ronde est le neveu d’Arthur ?', 'Gauvain', ['Lancelot', 'Perceval'], 'legende-gauvain'],
  ['Où Arthur, blessé à mort, est-il emporté à la fin ?', 'Sur l’île d’Avalon', ['À Camelot', 'À Brocéliande'], 'legende-avalon'],
];

/** [question, bonne réponse, deux choix faux, phrase de l'erreur]. */
export const MOTS = [
  ['Un destrier, c’est…', 'un cheval de bataille', ['un jeune serviteur', 'une épée à deux mains'], 'mot-destrier'],
  ['Un écuyer, c’est…', 'un jeune noble au service d’un chevalier', ['un cheval de course', 'un bouclier'], 'mot-ecuyer'],
  ['Adouber quelqu’un, c’est…', 'le faire chevalier', ['le chasser du château', 'le soigner'], 'mot-adouber'],
  ['Un heaume, c’est…', 'un casque', ['un bouclier', 'une lance'], 'mot-heaume'],
  ['L’écu du chevalier, c’est…', 'son bouclier', ['son casque', 'son épée'], 'mot-ecu'],
  ['Un haubert, c’est…', 'une cotte de mailles', ['un cheval', 'un château fort'], 'mot-haubert'],
  ['Un tournoi, c’est…', 'une fête où les chevaliers s’affrontent', ['une prière du soir', 'un voyage en mer'], 'mot-tournoi'],
  ['Un vassal, c’est…', 'celui qui jure fidélité à un seigneur', ['le roi d’un pays voisin', 'un marchand ambulant'], 'mot-vassal'],
  ['Un félon, c’est…', 'un traître', ['un héros', 'un pèlerin'], 'mot-felon'],
  ['La quête du chevalier, c’est…', 'une longue recherche pleine d’épreuves', ['un repas de fête', 'un combat à cheval'], 'mot-quete'],
  ['Un preux chevalier est…', 'vaillant', ['peureux', 'rusé'], 'mot-preux'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const valeurs = melanger(GESTES).slice(0, 3).map(([geste, valeur]) => {
    const autres = melanger(Object.keys(VALEURS).filter((v) => v !== valeur)).slice(0, 2);
    return {
      consigne: 'valeur',
      question: geste,
      bonne: valeur,
      choix: melanger([valeur, ...autres]).map((cle) => ({ cle, libelle: VALEURS[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, `valeur-${valeur}`])),
      aide: 'valeur-regle',
    };
  });

  const qcm = (consigne, [question, bonne, faux, phrase]) => ({
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...faux]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux.map((f) => [f, phrase])),
  });

  return melanger([
    ...valeurs,
    ...melanger(LEGENDE).slice(0, 3).map((x) => qcm('legende', x)),
    ...melanger(MOTS).slice(0, 2).map((x) => qcm('mot', x)),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  valeur: 'Quelle valeur du chevalier montre ce geste ?',
  legende: 'Une question sur la légende du roi Arthur.',
  mot: 'Que veut dire ce mot du Moyen Âge ?',
  'valeur-courage': 'Affronter le danger sans reculer, malgré la peur : c’est le courage, la prouesse du chevalier.',
  'valeur-loyaute': 'Tenir sa parole, rester fidèle à son seigneur ou à son compagnon, sans jamais trahir : c’est la loyauté.',
  'valeur-courtoisie': 'Être poli, respectueux, faire honneur aux dames : c’est la courtoisie, l’art de bien se tenir à la cour.',
  'valeur-foi': 'Prier, servir Dieu, chercher ce qui est sacré : c’est la foi du chevalier chrétien.',
  'valeur-generosite': 'Donner, partager, ne rien garder pour soi : c’est la générosité, que le Moyen Âge appelait la largesse.',
  'valeur-regle': 'Demande-toi ce que le chevalier fait vraiment : affronter un danger, tenir parole, honorer une dame, prier ou donner.',
  'legende-epee-pierre': 'Seul le futur roi pouvait retirer l’épée de la pierre : c’est le jeune Arthur qui y parvient.',
  'legende-merlin': 'Merlin est l’enchanteur, le magicien qui veille sur Arthur depuis sa naissance.',
  'legende-excalibur': 'L’épée d’Arthur s’appelle Excalibur. Durandal est l’épée de Roland, et Joyeuse celle de Charlemagne.',
  'legende-table': 'Les compagnons d’Arthur sont les chevaliers de la Table ronde.',
  'legende-table-ronde': 'Une table ronde n’a pas de bout : aucune place n’y vaut plus qu’une autre, et tous les chevaliers y sont égaux.',
  'legende-guenievre': 'La reine, épouse d’Arthur, c’est Guenièvre. Iseut est l’amante de Tristan, et Viviane, la dame du Lac.',
  'legende-lancelot': 'Lancelot du Lac, le plus fameux des chevaliers d’Arthur, aime en secret la reine Guenièvre.',
  'legende-perceval': 'Perceval le Gallois, élevé loin du monde, ignore tout de la chevalerie : c’est le héros du Conte du Graal.',
  'legende-chretien': 'Chrétien de Troyes a écrit, au Moyen Âge, les grands romans de la Table ronde. Molière et Victor Hugo sont venus des siècles plus tard.',
  'legende-camelot': 'Le château d’Arthur, c’est Camelot. Brocéliande est une forêt, et Avalon une île.',
  'legende-broceliande': 'Brocéliande est la forêt enchantée de la légende, où la fée Viviane retient Merlin. Camelot est le château d’Arthur.',
  'legende-yvain': 'Yvain est le chevalier au lion : il sauve un lion, qui devient son fidèle compagnon.',
  'legende-graal': 'Le Graal est la coupe sacrée que cherchent les chevaliers. Excalibur est une épée ; la Toison d’or, c’est l’histoire de Jason.',
  'legende-gauvain': 'Gauvain, le fils de la sœur d’Arthur, est son neveu et l’un de ses plus fidèles chevaliers.',
  'legende-avalon': 'Après sa dernière bataille, Arthur blessé à mort est emporté sur l’île d’Avalon.',
  'mot-destrier': 'Le destrier est le grand cheval de bataille du chevalier.',
  'mot-ecuyer': 'L’écuyer accompagne le chevalier, porte ses armes, et apprend auprès de lui à le devenir.',
  'mot-adouber': 'L’adoubement est la cérémonie où un jeune homme reçoit ses armes et devient chevalier.',
  'mot-heaume': 'Le heaume est le casque du chevalier, qui lui protège toute la tête.',
  'mot-ecu': 'L’écu est le bouclier du chevalier, souvent peint à ses armoiries.',
  'mot-haubert': 'Le haubert est une longue tunique faite d’anneaux de fer : une cotte de mailles.',
  'mot-tournoi': 'Au tournoi, les chevaliers s’affrontent devant les dames et les seigneurs, pour montrer leur valeur.',
  'mot-vassal': 'Le vassal jure fidélité à son seigneur, qui lui donne en échange une terre, un fief.',
  'mot-felon': 'Le félon trahit sa parole ou son seigneur : c’est le pire reproche qu’on puisse faire à un chevalier.',
  'mot-quete': 'La quête est la longue recherche du chevalier, à travers des épreuves qui le font grandir.',
  'mot-preux': 'Un preux chevalier est vaillant : la prouesse, c’est le courage au combat.',
};
