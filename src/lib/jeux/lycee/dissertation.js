/**
 * LA DISSERTATION — l'écrit du bac de français, en 1re générale.
 * Professeur : Adrien (français).
 *
 * Ce qui se vérifie en une réponse avant de rédiger. Sujets et exemples
 * génériques, écrits pour le jeu : aucune œuvre au programme n'y est nommée,
 * les exemples décrivent une scène ou un poème sans titre.
 *
 * QUATRE SORTES DE MANCHES (2 + 1 + 2 + 2 + 1) :
 *   - LA PROBLÉMATIQUE (2) : celle qui fait apparaître une tension. LES
 *     PIÈGES : la reformulation du sujet, la question de fait qui se règle
 *     d'un mot ;
 *   - LE TYPE DE PLAN (1) : dialectique, thématique, analytique, reconnu à
 *     l'enchaînement de ses parties ;
 *   - LE PLAN QUI RÉPOND (2) : trois plans pour un sujet. LES PIÈGES : le
 *     hors-sujet, le plan qui raconte l'œuvre, les trois parties qui disent
 *     la même chose ;
 *   - L'EXEMPLE (2) : celui qui prouve l'argument. LES PIÈGES : la
 *     généralité qui n'illustre rien, l'exemple précis d'une autre idée ;
 *   - LE CONNECTEUR (1) : concession, opposition, cause, conséquence, ajout,
 *     conclusion.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'dissertation', titre: 'La dissertation', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'La dissertation',
    accroche: 'La problématique, le plan, l’exemple.',
    competences: ['FR_1RE_ECR_DISSERTATION', 'FR_1RE_ECR_PROBLEMATISER', 'FR_1RE_ECR_EXEMPLES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

function libre(melanger, consigne, question, bonne, faux) {
  return {
    consigne,
    question,
    bonne,
    choix: melanger([bonne, ...faux.map(([f]) => f)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(faux),
    aide: `${consigne}-regle`,
  };
}

/** [sujet, la bonne problématique, la reformulation, la question de fait]. */
export const PROBLEMATIQUES = [
  ['Le roman doit-il nous faire aimer ses personnages ?',
    'Faut-il s’attacher à un personnage pour être saisi par un roman, ou peut-on l’être par ceux qu’on rejette ?',
    'Est-ce que le roman doit nous faire aimer ses personnages ?',
    'Les romans ont-ils des personnages ?'],
  ['La poésie n’est-elle qu’un jeu sur les mots ?',
    'Le travail des mots n’est-il qu’un plaisir de forme, ou est-ce par lui que la poésie dit le monde ?',
    'La poésie est-elle seulement un jeu avec les mots ?',
    'Les poèmes sont-ils faits de mots ?'],
  ['Le théâtre est-il fait pour être lu ou pour être vu ?',
    'Le texte théâtral se suffit-il à lui-même, ou n’existe-t-il pleinement que sur scène ?',
    'Le théâtre doit-il être lu, ou plutôt être vu ?',
    'Peut-on acheter des pièces de théâtre en librairie ?'],
  ['Un personnage de roman doit-il être vraisemblable ?',
    'Un personnage doit-il nous ressembler pour nous toucher, ou l’invraisemblable peut-il révéler une vérité ?',
    'Faut-il qu’un personnage de roman soit vraisemblable ?',
    'Les romans racontent-ils des histoires ?'],
  ['La littérature d’idées doit-elle plaire pour convaincre ?',
    'Le plaisir du récit et du style sert-il l’argumentation, ou risque-t-il d’en détourner le lecteur ?',
    'Pour convaincre, la littérature d’idées doit-elle plaire ?',
    'Des philosophes ont-ils écrit des contes ?'],
  ['Le poète doit-il s’engager dans les combats de son temps ?',
    'La poésie perd-elle sa liberté en servant une cause, ou trouve-t-elle dans l’engagement une force nouvelle ?',
    'Le poète doit-il prendre part aux combats de son époque ?',
    'Des poètes ont-ils écrit pendant une guerre ?'],
  ['Le rire au théâtre empêche-t-il de réfléchir ?',
    'Le rire détourne-t-il le spectateur des questions graves, ou est-il une manière de les lui faire voir ?',
    'Au théâtre, le rire empêche-t-il la réflexion ?',
    'Les comédies font-elles rire ?'],
  ['Lit-on un roman pour s’évader ?',
    'Le roman nous arrache-t-il au réel, ou nous y ramène-t-il par un détour ?',
    'Lisons-nous des romans pour nous évader ?',
    'Lit-on des romans pendant les vacances ?'],
  ['La tragédie n’est-elle qu’un spectacle de souffrance ?',
    'Le spectateur vient-il seulement voir souffrir, ou la tragédie lui fait-elle comprendre la condition humaine ?',
    'La tragédie se réduit-elle à montrer la souffrance ?',
    'Les héros de tragédie meurent-ils parfois ?'],
  ['Un poème doit-il être compris pour être aimé ?',
    'Le plaisir du poème passe-t-il par le sens, ou la musique des mots peut-elle toucher avant d’être comprise ?',
    'Faut-il comprendre un poème pour l’aimer ?',
    'Les poèmes se récitent-ils à voix haute ?'],
  ['Le romancier doit-il tout dire de ses personnages ?',
    'Le roman gagne-t-il à tout montrer, ou le silence et le mystère font-ils la force d’un personnage ?',
    'Un romancier doit-il dire tout de ses personnages ?',
    'Les romanciers décrivent-ils leurs personnages ?'],
  ['L’argumentation a-t-elle besoin de la fiction ?',
    'Un récit inventé convainc-il mieux qu’un raisonnement direct, ou risque-t-il de brouiller la thèse ?',
    'La fiction est-elle nécessaire à l’argumentation ?',
    'Les fables ont-elles une morale ?'],
];

export const TYPES = { dialectique: 'Plan dialectique', thematique: 'Plan thématique', analytique: 'Plan analytique' };

/** [plan, son type]. */
export const PLANS_TYPES = [
  ['I. La poésie peut changer le monde.\nII. Mais elle reste souvent impuissante.\nIII. Elle change d’abord notre regard sur le monde.', 'dialectique'],
  ['I. Le roman divertit.\nII. Pourtant, il dérange aussi.\nIII. Il divertit pour mieux déranger.', 'dialectique'],
  ['I. Le théâtre se lit comme un livre.\nII. Mais il est écrit pour la scène.\nIII. Texte et représentation se complètent.', 'dialectique'],
  ['I. Le rire fait réfléchir.\nII. Cependant, il peut endormir l’esprit critique.\nIII. Tout dépend de ce que vise le rire.', 'dialectique'],
  ['I. La poésie émeut.\nII. La poésie dénonce.\nIII. La poésie fait rêver.', 'thematique'],
  ['I. Le roman fait connaître une époque.\nII. Il éclaire le cœur humain.\nIII. Il forme le goût du lecteur.', 'thematique'],
  ['I. Le théâtre fait rire.\nII. Il fait pleurer.\nIII. Il fait réfléchir.', 'thematique'],
  ['I. La force du rythme.\nII. La force des images.\nIII. La force des sonorités.', 'thematique'],
  ['I. Le constat : la lecture recule chez les jeunes.\nII. Les causes de ce recul.\nIII. Ses conséquences, et les remèdes.', 'analytique'],
  ['I. Les faits : la poésie se vend peu.\nII. Les raisons de ce désintérêt.\nIII. Comment lui rendre des lecteurs.', 'analytique'],
  ['I. Le problème : les salles de théâtre se vident.\nII. Ses causes.\nIII. Les remèdes possibles.', 'analytique'],
  ['I. Ce que montre le texte : une injustice.\nII. D’où elle vient.\nIII. Ce qu’elle entraîne.', 'analytique'],
];

/** [sujet, le bon plan, deux plans fautifs avec leur piège]. */
export const PLANS_SUJETS = [
  ['Le roman doit-il nous faire aimer ses personnages ?',
    'I. On s’attache aux personnages qu’on aime. II. Mais des personnages odieux nous captivent aussi. III. Le roman nous fait surtout comprendre ceux qu’il peint.',
    [['I. Les origines du roman. II. Son essor. III. Ses formes actuelles.', 'plan-hors-sujet'],
      ['I. Les personnages aimables nous plaisent. II. Nous aimons les héros sympathiques. III. Les lecteurs préfèrent les personnages attachants.', 'plan-redite']]],
  ['La poésie n’est-elle qu’un jeu sur les mots ?',
    'I. La poésie joue avec les sons et les formes. II. Mais ce jeu porte une émotion et une vision du monde. III. C’est par le jeu sur les mots que le poème dit le monde.',
    [['I. L’enfance du poète. II. Ses amours. III. Sa mort.', 'plan-hors-sujet'],
      ['I. Le premier poème du recueil. II. Les poèmes du milieu. III. Le dernier poème.', 'plan-paraphrase']]],
  ['Le théâtre est-il fait pour être lu ou pour être vu ?',
    'I. Le texte théâtral se lit et se suffit. II. Mais il est écrit pour la scène, la voix et le corps. III. Lecture et représentation se complètent.',
    [['I. Le théâtre antique. II. Le théâtre classique. III. Le théâtre moderne.', 'plan-hors-sujet'],
      ['I. Le début de la pièce. II. Le milieu de la pièce. III. Le dénouement.', 'plan-paraphrase']]],
  ['Le poète doit-il s’engager ?',
    'I. La poésie peut servir une cause. II. Mais l’engagement menace sa liberté. III. Le poème s’engage d’abord par sa forme.',
    [['I. Qu’est-ce qu’un sonnet ? II. Les règles du vers. III. Le vers libre.', 'plan-hors-sujet'],
      ['I. Le poète doit défendre des idées. II. Le poète doit prendre parti. III. Le poète doit lutter pour une cause.', 'plan-redite']]],
  ['Le rire au théâtre empêche-t-il de réfléchir ?',
    'I. Le rire divertit et détend le spectateur. II. Mais il dénonce les vices et fait réfléchir. III. Le rire est une arme de la réflexion.',
    [['I. La tragédie fait pleurer. II. Le drame mêle les genres. III. Le théâtre de l’absurde.', 'plan-hors-sujet'],
      ['I. Les deux premiers actes. II. La scène du quiproquo. III. Le mariage final.', 'plan-paraphrase']]],
  ['Lit-on un roman pour s’évader ?',
    'I. Le roman nous transporte dans d’autres mondes. II. Mais il nous ramène au réel et à nous-mêmes. III. L’évasion est un détour pour mieux voir le monde.',
    [['I. Les romans les plus vendus. II. Le métier d’éditeur. III. Le prix des livres.', 'plan-hors-sujet'],
      ['I. On lit pour oublier le quotidien. II. On lit pour fuir la réalité. III. On lit pour se changer les idées.', 'plan-redite']]],
  ['Un personnage de roman doit-il être vraisemblable ?',
    'I. La vraisemblance fait croire au personnage. II. Mais l’invraisemblable fascine et fait rêver. III. Plus que vraisemblable, un personnage doit être vrai.',
    [['I. La vie de l’auteur. II. Son époque. III. Ses autres livres.', 'plan-hors-sujet'],
      ['I. L’enfance du héros. II. Sa jeunesse. III. Sa mort.', 'plan-paraphrase']]],
  ['La littérature d’idées doit-elle plaire pour convaincre ?',
    'I. Le plaisir de lire capte l’attention. II. Mais il peut détourner de la thèse. III. Plaire et convaincre s’allient quand le plaisir sert la pensée.',
    [['I. Qu’est-ce qu’un philosophe ? II. Les grands philosophes. III. La philosophie aujourd’hui.', 'plan-hors-sujet'],
      ['I. Il faut plaire au lecteur. II. Le lecteur doit prendre plaisir. III. Le texte doit être agréable.', 'plan-redite']]],
  ['La tragédie n’est-elle qu’un spectacle de souffrance ?',
    'I. La tragédie montre des souffrances extrêmes. II. Mais elle fait aussi comprendre et réfléchir. III. La souffrance représentée devient connaissance de l’homme.',
    [['I. La comédie. II. La farce. III. Le vaudeville.', 'plan-hors-sujet'],
      ['I. L’exposition. II. Le nœud de l’intrigue. III. La mort du héros.', 'plan-paraphrase']]],
];

/** [argument, le bon exemple, deux exemples fautifs avec leur piège]. */
export const EXEMPLES = [
  ['Le théâtre comique dénonce les vices de la société.',
    'Une comédie où un faux dévot dupe toute une famille ridiculise l’hypocrisie.',
    [['Une tragédie où un roi se sacrifie pour son peuple bouleverse le spectateur.', 'exemple-autre-idee'],
      ['Beaucoup de comédies le montrent très bien.', 'exemple-vague']]],
  ['La poésie peut dénoncer la guerre.',
    'Un poème montre une mère qui cherche son fils parmi les morts d’un village en ruines.',
    [['Un poème célèbre la beauté d’un coucher de soleil sur la mer.', 'exemple-autre-idee'],
      ['De nombreux poètes ont parlé de la guerre.', 'exemple-vague']]],
  ['Le roman permet de comprendre une époque.',
    'Un roman qui suit des mineurs en grève fait voir la misère ouvrière de tout un siècle.',
    [['Un roman d’aventures tient le lecteur en haleine par ses rebondissements.', 'exemple-autre-idee'],
      ['On le voit dans beaucoup de romans.', 'exemple-vague']]],
  ['Le héros tragique est écrasé par une force qui le dépasse.',
    'Un héros tente d’échapper à l’oracle qui annonce son crime, et l’accomplit en fuyant.',
    [['Un valet rusé trompe son maître pour aider deux jeunes amoureux.', 'exemple-autre-idee'],
      ['Les héros tragiques souffrent toujours beaucoup.', 'exemple-vague']]],
  ['La fable instruit en divertissant.',
    'Un corbeau flatté lâche son fromage : on sourit, et l’on retient la leçon sur les flatteurs.',
    [['Une fable met souvent en scène des animaux.', 'exemple-autre-idee'],
      ['Toutes les fables sont à la fois amusantes et instructives.', 'exemple-vague']]],
  ['Le roman peut faire entendre la voix des exclus.',
    'Un roman suit une ouvrière ruinée qui vend ses cheveux pour nourrir sa fille.',
    [['Un roman décrit les fêtes somptueuses d’une famille aristocratique.', 'exemple-autre-idee'],
      ['Les romanciers s’intéressent souvent aux pauvres.', 'exemple-vague']]],
  ['La poésie célèbre la beauté du monde.',
    'Un poème peint l’aube sur un lac, ses couleurs et le silence de l’eau.',
    [['Un poème dénonce les horreurs d’une bataille.', 'exemple-autre-idee'],
      ['La nature est très présente en poésie.', 'exemple-vague']]],
  ['Le théâtre fait réfléchir sur le pouvoir.',
    'Une tragédie montre un empereur qui devient tyran et sacrifie ceux qu’il aimait.',
    [['Une comédie repose sur un quiproquo entre deux jumeaux.', 'exemple-autre-idee'],
      ['Le pouvoir est un thème important au théâtre.', 'exemple-vague']]],
  ['L’autobiographie aide à se comprendre soi-même.',
    'Un écrivain raconte un vol commis enfant, et cherche ce que ce souvenir révèle de lui.',
    [['Un écrivain invente un monde imaginaire peuplé de dragons.', 'exemple-autre-idee'],
      ['Écrire sur soi, c’est toujours utile.', 'exemple-vague']]],
  ['Le conte philosophique critique la société sous le masque du divertissement.',
    'Un jeune homme naïf parcourt le monde et découvre guerres et injustices : on rit, et l’on réfléchit.',
    [['Un roman d’amour raconte la rencontre de deux jeunes gens au bal.', 'exemple-autre-idee'],
      ['Les philosophes aiment beaucoup critiquer.', 'exemple-vague']]],
  ['La description romanesque peut annoncer le destin des personnages.',
    'Une pension sombre et misérable, décrite en détail, annonce la déchéance de ceux qui y vivent.',
    [['Un dialogue vif fait avancer l’intrigue.', 'exemple-autre-idee'],
      ['Les descriptions sont nombreuses dans les romans.', 'exemple-vague']]],
];

/** [phrase à trou, le bon connecteur, deux connecteurs fautifs avec ce qu'ils annoncent]. */
export const CONNECTEURS = [
  ['… , le roman distrait ; mais il fait aussi réfléchir.', 'Certes', [['Donc', 'connecteur-consequence'], ['Ainsi', 'connecteur-consequence']]],
  ['Le théâtre classique impose des règles strictes. … , certains auteurs les ont contournées.', 'Pourtant', [['Ainsi', 'connecteur-consequence'], ['De plus', 'connecteur-ajout']]],
  ['Le poète refuse de s’engager, … , selon lui, l’art n’a pas à servir une cause.', 'car', [['pourtant', 'connecteur-opposition'], ['au contraire', 'connecteur-opposition']]],
  ['Le personnage est ridicule ; … le spectateur rit de lui.', 'c’est pourquoi', [['car', 'connecteur-cause'], ['pourtant', 'connecteur-opposition']]],
  ['La tragédie émeut le spectateur. … , elle l’aide à comprendre la condition humaine.', 'De plus', [['Pourtant', 'connecteur-opposition'], ['Au contraire', 'connecteur-opposition']]],
  ['La poésie semble réservée à une élite. … , les chansons populaires prouvent qu’elle touche chacun.', 'Pourtant', [['Ainsi', 'connecteur-consequence'], ['En effet', 'connecteur-cause']]],
  ['Le roman divertit, nous l’avons vu. … , il ne se limite pas à ce rôle.', 'Cependant', [['Ainsi', 'connecteur-consequence'], ['En effet', 'connecteur-cause']]],
  ['Le théâtre s’écrit, mais il ne vit que sur scène. … , il est à la fois un texte et un spectacle.', 'En somme', [['Par exemple', 'connecteur-exemple'], ['Pourtant', 'connecteur-opposition']]],
  ['Le héros échoue sans cesse ; … il ne renonce jamais.', 'pourtant', [['donc', 'connecteur-consequence'], ['car', 'connecteur-cause']]],
  ['Le conte est court et plaisant ; … il touche un large public.', 'donc', [['pourtant', 'connecteur-opposition'], ['car', 'connecteur-cause']]],
  ['La satire fait rire des puissants. … , les fables mettent en scène un lion orgueilleux et ses courtisans.', 'Par exemple', [['Pourtant', 'connecteur-opposition'], ['En somme', 'connecteur-conclusion']]],
];

const lettres = ['A', 'B', 'C'];

function planAuSujet(t, [sujet, bon, faux]) {
  const plans = t.melanger([[bon, null], ...faux]);
  const bonne = lettres[plans.findIndex(([, p]) => p === null)];
  return {
    consigne: 'plan-au-sujet',
    question: `Sujet : « ${sujet} »\n\n${plans.map(([p], i) => `${lettres[i]}. ${p}`).join('\n\n')}`,
    bonne,
    choix: lettres.map((l) => ({ cle: l, libelle: `Plan ${l}` })),
    pieges: Object.fromEntries(plans.map(([, p], i) => [lettres[i], p]).filter(([, p]) => p !== null)),
    aide: 'plan-au-sujet-regle',
  };
}

export function serie(graine = Date.now()) {
  const t = outils(graine);
  const problematiques = t.melanger(PROBLEMATIQUES).slice(0, 2).map(([sujet, bonne, reformulation, fermee]) => libre(
    t.melanger,
    'problematique',
    `Sujet : « ${sujet} »`,
    bonne,
    [[reformulation, 'pb-reformulation'], [fermee, 'pb-question-fermee']],
  ));
  const [plan, type] = t.au(PLANS_TYPES);
  const typeDePlan = {
    consigne: 'type-de-plan',
    question: plan,
    bonne: type,
    choix: Object.keys(TYPES).map((c) => ({ cle: c, libelle: TYPES[c] })),
    pieges: Object.fromEntries(Object.keys(TYPES).filter((c) => c !== type).map((c) => [c, `plan-${type}`])),
    aide: 'type-de-plan-regle',
  };
  const plans = t.melanger(PLANS_SUJETS).slice(0, 2).map((p) => planAuSujet(t, p));
  const exemples = t.melanger(EXEMPLES).slice(0, 2).map(([argument, bon, faux]) => libre(
    t.melanger,
    'exemple',
    `Argument : « ${argument} »`,
    bon,
    faux,
  ));
  const [phrase, bon, faux] = t.au(CONNECTEURS);
  return t.melanger([
    ...problematiques,
    typeDePlan,
    ...plans,
    ...exemples,
    libre(t.melanger, 'connecteur', phrase, bon, faux),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  problematique: 'Quelle problématique pose vraiment le problème de ce sujet ?',
  'problematique-regle': 'Une bonne problématique fait apparaître une tension : deux réponses possibles, qui semblent s’opposer, et qu’il faudra examiner.',
  'pb-reformulation': 'Cette question redit le sujet avec d’autres mots : elle ne montre pas où est le problème. Fais apparaître la tension entre deux réponses possibles.',
  'pb-question-fermee': 'Cette question se règle par un fait, ou par un oui évident : il n’y a rien à débattre. Une problématique ouvre une vraie discussion.',

  'type-de-plan': 'De quel type de plan s’agit-il ?',
  'type-de-plan-regle': 'Regarde comment les parties s’enchaînent : elles s’opposent puis se dépassent, elles explorent plusieurs aspects, ou elles vont du constat aux causes et aux remèdes.',
  'plan-dialectique': 'Les parties s’opposent, avec mais, pourtant, cependant, avant qu’une dernière partie dépasse le débat : c’est un plan dialectique.',
  'plan-thematique': 'Les parties ne s’opposent pas : chacune explore un aspect différent de la même question. C’est un plan thématique.',
  'plan-analytique': 'On part d’un constat, on en cherche les causes, puis les conséquences ou les remèdes : c’est un plan analytique.',

  'plan-au-sujet': 'Lequel de ces plans répond vraiment au sujet ?',
  'plan-au-sujet-regle': 'Un bon plan répond à la question posée, partie après partie, et chaque partie fait avancer la réflexion.',
  'plan-hors-sujet': 'Ce plan parle du même domaine, mais pas de la question posée : il est hors sujet. Reprends les mots-clés du sujet, chaque partie doit y répondre.',
  'plan-paraphrase': 'Ce plan suit l’œuvre dans l’ordre de l’histoire : il résume au lieu de discuter. Une dissertation s’organise par idées.',
  'plan-redite': 'Les trois parties disent la même chose avec d’autres mots : la réflexion n’avance pas. Chaque partie doit apporter une idée nouvelle.',

  exemple: 'Quel exemple prouve vraiment cet argument ?',
  'exemple-regle': 'Un bon exemple est précis, une œuvre, une scène, un passage, et il prouve exactement l’argument qu’il accompagne.',
  'exemple-vague': 'C’est une généralité, pas un exemple : il n’y a rien de précis à analyser. Appuie-toi sur une œuvre, une scène, un passage.',
  'exemple-autre-idee': 'L’exemple est précis, mais il illustre une autre idée que celle de l’argument : il doit prouver exactement ce que tu avances.',

  connecteur: 'Quel connecteur enchaîne correctement ces deux idées ?',
  'connecteur-regle': 'Cherche le lien entre les deux idées : concession, opposition, cause, conséquence, ajout, exemple ou conclusion. Puis choisis le connecteur qui le dit.',
  'connecteur-cause': 'Car, en effet, parce que annoncent une cause. Vérifie que la suite explique bien pourquoi.',
  'connecteur-consequence': 'Donc, ainsi, c’est pourquoi annoncent une conséquence. Vérifie que la suite découle bien de ce qui précède.',
  'connecteur-opposition': 'Mais, pourtant, cependant, au contraire marquent une opposition. Y a-t-il vraiment une opposition entre les deux idées ?',
  'connecteur-ajout': 'De plus, en outre ajoutent une idée qui va dans le même sens. Ici, les deux idées vont-elles dans le même sens ?',
  'connecteur-exemple': 'Par exemple annonce un cas précis qui illustre l’idée. Ici, la suite est-elle un exemple, ou un bilan ?',
  'connecteur-conclusion': 'En somme, en définitive annoncent un bilan. Ici, la suite tire-t-elle une conclusion, ou donne-t-elle un cas précis ?',
};
