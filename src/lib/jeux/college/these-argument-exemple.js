/**
 * THÈSE, ARGUMENT OU EXEMPLE ? — le texte engagé en 3e.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL :
 *   FR_3E_LECT_ENGAGEMENT — « Repérer la thèse et les arguments d'un texte
 *                            engagé »
 *
 * TROIS SORTES DE MANCHES (4 + 2 + 2) :
 *   - LE RÔLE (4) : un petit texte de trois phrases (thèse, argument,
 *     exemple, dans cet ordre) ; une phrase est désignée, quel est son rôle ?
 *     LES PIÈGES : prendre l'exemple pour un argument (il est concret, il
 *     illustre), l'argument pour la thèse (il répond à « pourquoi ? ») ;
 *   - LE CONNECTEUR (2) : car, donc, pourtant, de plus, par exemple…
 *     L'erreur dit ce qu'annonce le connecteur choisi (une cause, une
 *     conséquence, une opposition) ;
 *   - LA THÈSE (2) : un texte sans thèse écrite, trois reformulations ; les
 *     pièges sont un simple fait du texte, et le contresens.
 * Les faits cités sont vérifiés (Strasbourg et le vélo, Le Dernier Jour d'un
 * condamné, le travail des enfants dans les mines au XIXe siècle,
 * Pontevedra piétonne depuis 1999).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'these-argument-exemple', titre: 'Thèse, argument ou exemple ?', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'Thèse, argument ou exemple ?',
    accroche: 'Démonte un texte qui défend une idée.',
    competences: ['FR_3E_LECT_ENGAGEMENT'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const ROLES = { these: 'La thèse', argument: 'Un argument', exemple: 'Un exemple' };
const ORDRE = ['these', 'argument', 'exemple'];

/** [thèse, argument, exemple] : un petit texte engagé, dans l'ordre. */
export const TEXTES = [
  ['Il faut limiter le temps passé sur les écrans.', 'En effet, les écrans, le soir, perturbent le sommeil.', 'Par exemple, un adolescent qui joue jusqu’à minuit dort mal et se réveille fatigué.'],
  ['Le vélo est le meilleur moyen de se déplacer en ville.', 'D’abord, il ne pollue pas.', 'À Strasbourg, par exemple, beaucoup d’habitants vont travailler à vélo.'],
  ['La lecture rend plus libre.', 'Car lire, c’est découvrir d’autres façons de penser.', 'Ainsi, en lisant le Journal d’Anne Frank, on comprend ce qu’a vécu une jeune fille cachée pendant la guerre.'],
  ['La peine de mort doit être abolie partout dans le monde.', 'En effet, une erreur judiciaire ne pourrait jamais être réparée.', 'Dans Le Dernier Jour d’un condamné, Victor Hugo montrait déjà l’horreur de l’attente d’un homme qui va être exécuté.'],
  ['Le sport à l’école est indispensable.', 'Il apprend à respecter des règles et à jouer en équipe.', 'Lors d’un match de handball, chaque joueur doit faire confiance à ses partenaires.'],
  ['Il faut protéger les abeilles.', 'Sans elles, beaucoup de plantes ne seraient plus pollinisées.', 'Par exemple, les pommiers ont besoin des insectes pollinisateurs pour donner des fruits.'],
  ['Le travail des enfants est une injustice qu’il faut combattre.', 'Un enfant qui travaille ne peut pas aller à l’école et préparer son avenir.', 'Au XIXe siècle, en France, des enfants de huit ans descendaient dans les mines.'],
  ['Apprendre une langue étrangère est une chance.', 'Cela permet de communiquer avec des personnes du monde entier.', 'Lors d’un voyage en Espagne, parler espagnol permet de discuter avec les habitants.'],
  ['Le harcèlement scolaire ne doit jamais être pris à la légère.', 'Il peut laisser des blessures profondes, qui durent longtemps.', 'Par exemple, certains adultes se souviennent encore des moqueries subies au collège.'],
];

/** Les deux autres rôles ; l'erreur, quelle qu'elle soit, rappelle les indices du bon. */
const AUTRES_ROLES = { these: ['argument', 'exemple'], argument: ['these', 'exemple'], exemple: ['argument', 'these'] };

/** [phrase à trou, le bon connecteur, [[connecteur faux, ce qu'il annonce], …]]. */
export const CONNECTEURS = [
  ['Il faut dormir assez, … le sommeil aide à retenir ses leçons.', 'car', [['donc', 'connecteur-consequence'], ['pourtant', 'connecteur-opposition']]],
  ['Il a beaucoup révisé ; … il a réussi son examen.', 'donc', [['car', 'connecteur-cause'], ['pourtant', 'connecteur-opposition']]],
  ['Il a beaucoup révisé ; … il a raté son examen.', 'pourtant', [['donc', 'connecteur-consequence'], ['car', 'connecteur-cause']]],
  ['Le vélo est économique. …, il est bon pour la santé.', 'De plus', [['Pourtant', 'connecteur-opposition'], ['Au contraire', 'connecteur-opposition']]],
  ['Les écrans fatiguent les yeux. …, certains élèves ont mal à la tête après une soirée de jeux vidéo.', 'Par exemple', [['Pourtant', 'connecteur-opposition'], ['Au contraire', 'connecteur-opposition']]],
  ['Il pleuvait très fort, … le match a été reporté.', 'c’est pourquoi', [['car', 'connecteur-cause'], ['pourtant', 'connecteur-opposition']]],
  ['Le match a été reporté … il pleuvait très fort.', 'parce qu’', [['donc', 'connecteur-consequence'], ['mais', 'connecteur-opposition']]],
  ['Il faut protéger les abeilles. …, sans elles, beaucoup de plantes ne seraient plus pollinisées.', 'En effet', [['Pourtant', 'connecteur-opposition'], ['Au contraire', 'connecteur-opposition']]],
  ['Ce film est long ; …, il ne m’a jamais ennuyé.', 'cependant', [['donc', 'connecteur-consequence'], ['en effet', 'connecteur-cause']]],
  ['On peut lire des romans, … des poèmes ou des bandes dessinées.', 'mais aussi', [['donc', 'connecteur-consequence'], ['car', 'connecteur-cause']]],
];

/** [texte sans thèse écrite, sa thèse, un simple fait du texte, le contresens]. */
export const THESES = [
  ['Chaque année, des tonnes de plastique finissent dans les océans. Les tortues prennent les sacs pour des méduses et s’étouffent. Pourtant, un simple sac en tissu suffirait à l’éviter.', 'Il faut renoncer aux sacs en plastique.', 'Les tortues mangent des méduses.', 'Les sacs en tissu ne servent à rien.'],
  ['Lire chaque soir enrichit le vocabulaire. Les grands lecteurs écrivent souvent avec plus d’aisance. Et un livre ne coûte pas plus cher qu’une place de cinéma.', 'La lecture mérite une place dans nos journées.', 'Un livre coûte le prix d’une place de cinéma.', 'Le cinéma vaut mieux que la lecture.'],
  ['Dans les centres-villes sans voitures, l’air est plus pur. Les enfants peuvent y jouer sans danger. À Pontevedra, en Espagne, le centre est piéton depuis plus de vingt ans.', 'Il faut fermer les centres-villes aux voitures.', 'Pontevedra est une ville d’Espagne.', 'Les voitures rendent la ville plus agréable.'],
  ['Les animaux des cirques passent leur vie dans des cages étroites. On les dresse à faire des tours qui ne sont pas naturels pour eux. Plusieurs pays ont déjà interdit les animaux sauvages dans les cirques.', 'Les animaux sauvages n’ont pas leur place au cirque.', 'Les cages des cirques sont étroites.', 'Le cirque doit garder ses lions.'],
  ['L’uniforme efface les différences entre élèves riches et pauvres. Il évite les moqueries sur les vêtements. Et chaque matin, on ne perd plus de temps à choisir sa tenue.', 'L’uniforme à l’école est une bonne idée.', 'On perd du temps à choisir sa tenue.', 'Chacun doit s’habiller comme il veut à l’école.'],
  ['Le bénévolat permet de se sentir utile. On y rencontre des personnes très différentes de soi. Beaucoup de jeunes bénévoles disent y avoir appris à écouter.', 'Tout le monde devrait essayer le bénévolat.', 'Des jeunes sont bénévoles.', 'Aider les autres est une perte de temps.'],
  ['Les jeux vidéo développent les réflexes et la logique. Certains se jouent à plusieurs et apprennent à coopérer. Des chirurgiens s’entraînent même sur des simulateurs.', 'Les jeux vidéo ne sont pas qu’une perte de temps.', 'Des chirurgiens utilisent des simulateurs.', 'Il faut interdire les jeux vidéo.'],
];

export function serie(graine = Date.now()) {
  const { melanger, entre } = outils(graine);
  const libres = (liste) => melanger(liste).map((c) => ({ cle: c, libelle: c }));

  const roles = melanger(TEXTES).slice(0, 4).map((texte) => {
    const i = entre(0, 2);
    const role = ORDRE[i];
    return {
      consigne: 'role',
      question: `${texte.join(' ')}\n\n→ « ${texte[i]} »`,
      bonne: role,
      choix: ORDRE.map((cle) => ({ cle, libelle: ROLES[cle] })),
      pieges: Object.fromEntries(AUTRES_ROLES[role].map((a) => [a, `role-${role}`])),
      aide: 'role-regle',
    };
  });

  const connecteurs = melanger(CONNECTEURS).slice(0, 2).map(([p, bon, faux]) => ({
    consigne: 'connecteur',
    question: p,
    bonne: bon,
    choix: libres([bon, ...faux.map(([f]) => f)]),
    pieges: Object.fromEntries(faux),
    aide: 'connecteur-regle',
  }));

  const theses = melanger(THESES).slice(0, 2).map(([texte, these, fait, contresens]) => ({
    consigne: 'these',
    question: texte,
    bonne: these,
    choix: libres([these, fait, contresens]),
    pieges: { [fait]: 'these-pas-fait', [contresens]: 'these-contresens' },
    aide: 'these-regle',
  }));

  return melanger([...roles, ...connecteurs, ...theses]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  role: 'Dans ce petit texte engagé, quel est le rôle de la phrase indiquée ?',
  connecteur: 'Quel connecteur logique complète la phrase ?',
  these: 'Quelle thèse ce texte défend-il ?',
  'role-these': 'La thèse est l’idée que l’auteur défend : la phrase qui dit ce qu’il faut penser ou faire. Les autres phrases sont là pour la soutenir.',
  'role-argument': 'L’argument justifie la thèse : il répond à la question « pourquoi ? ». Il reste général.',
  'role-exemple': 'L’exemple est un cas précis et concret, un fait, un lieu, un livre : il illustre l’argument.',
  'role-regle': 'Pose-toi deux questions : que veut-on me faire penser ? C’est la thèse. Pourquoi ? C’est l’argument. Et le cas concret qui le montre, c’est l’exemple.',
  'connecteur-cause': 'Car, en effet, parce que annoncent une cause. Vérifie que la suite explique bien pourquoi.',
  'connecteur-consequence': 'Donc, c’est pourquoi annoncent une conséquence. Vérifie que la suite découle bien de ce qui précède.',
  'connecteur-opposition': 'Mais, pourtant, cependant, au contraire marquent une opposition. Y a-t-il vraiment une opposition entre les deux idées ?',
  'connecteur-regle': 'Cherche le lien entre les deux idées : une cause, une conséquence, une opposition, un ajout ou un exemple. Puis choisis le connecteur qui le dit.',
  'these-pas-fait': 'Ce n’est qu’un fait du texte, qui sert d’argument ou d’exemple. La thèse, c’est l’idée d’ensemble que tous ces faits défendent.',
  'these-contresens': 'C’est le contraire de ce que défend le texte. Demande-toi où veulent en venir tous les arguments.',
  'these-regle': 'Lis les arguments, puis demande-toi : à quoi l’auteur veut-il me faire adhérer ? La réponse est la thèse.',
};
