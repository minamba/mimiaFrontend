/**
 * LE DÉBAT D'IDÉES — le français de terminale professionnelle (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_TPRO_ORAL_DEBAT   — « Prendre part à un débat d'idées en formulant sa
 *                           pensée »
 *   FR_TPRO_ORAL_REAGIR  — « S'adapter à son interlocuteur, relancer et
 *                           préciser sa pensée »
 *   FR_TPRO_ECR_NUANCER  — « Nuancer son point de vue et envisager les
 *                           arguments contraires »
 *
 * CINQ SORTES DE MANCHES (1 + 2 + 2 + 2 + 1) :
 *   - LA POSITION (1) : sur un sujet de débat, quelle intervention formule
 *     une position ? LES PIÈGES : la réponse floue (« ça dépend »), l'avis
 *     sans raison (« un point c'est tout »), le hors-sujet ;
 *   - RÉFUTER (2) : un camarade avance une idée ; quelle réponse la réfute
 *     poliment ? LES PIÈGES : l'attaque contre la personne, le désaccord sans
 *     argument, l'argument dit sur un ton agressif ;
 *   - NUANCER (2) : quelle phrase nuance la position ? LES PIÈGES : la
 *     généralisation (« toujours, tous »), l'abandon de sa position, le
 *     retournement vers la position contraire ;
 *   - ARGUMENT OU OPINION (2) : un avis justifié par une raison est un
 *     argument ; un avis affirmé sans raison n'est qu'une opinion ;
 *   - L'ARGUMENT FALLACIEUX (1) : nommer le procédé (attaque personnelle,
 *     généralisation abusive, appel à la popularité, fausse autorité, fausse
 *     alternative, pente glissante). Deux exemples au moins par procédé.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'debat-idees', titre: 'Le débat d’idées', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  TERMINALE_PRO: {
    titre: 'Le débat d’idées',
    accroche: 'Défendre, réfuter, nuancer.',
    competences: ['FR_TPRO_ORAL_DEBAT', 'FR_TPRO_ORAL_REAGIR', 'FR_TPRO_ECR_NUANCER'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** [sujet, la position argumentée, la réponse floue, l'avis sans raison, le hors-sujet]. */
export const POSITIONS = [
  [
    'Faut-il interdire le téléphone portable au lycée ?',
    'Je suis pour l’interdire en classe, parce qu’il détourne l’attention ; mais pas pendant les pauses.',
    'C’est compliqué, il y a du pour et du contre, chacun voit les choses à sa façon.',
    'Je suis contre, un point c’est tout.',
    'Les téléphones coûtent de plus en plus cher.',
  ],
  [
    'Les stages en entreprise devraient-ils durer plus longtemps ?',
    'Je pense qu’ils devraient être plus longs, car on n’apprend vraiment un métier qu’en le pratiquant.',
    'Bof, ça dépend des gens, on ne peut pas savoir.',
    'Oui, il faut qu’ils soient plus longs, voilà.',
    'Mon entreprise de stage est loin de chez moi.',
  ],
  [
    'Faut-il rendre le vote obligatoire ?',
    'Je n’y suis pas favorable : un vote forcé risque d’être fait au hasard, sans conviction.',
    'Il y a des arguments des deux côtés, je n’en sais trop rien.',
    'Non, je suis contre, c’est mon avis.',
    'Les bureaux de vote ferment le soir.',
  ],
  [
    'Faut-il interdire les réseaux sociaux aux plus jeunes ?',
    'Je suis plutôt pour, car les plus jeunes sont très exposés au harcèlement en ligne.',
    'Pour certains oui, pour d’autres non, c’est relatif.',
    'Évidemment que oui, ça me paraît normal.',
    'J’ai créé mon premier compte l’an dernier.',
  ],
  [
    'Le travail du dimanche devrait-il se généraliser ?',
    'Je suis contre, car le dimanche est souvent le seul jour où toute une famille peut se retrouver.',
    'C’est un vaste débat, il faudrait voir.',
    'Non, parce que non.',
    'Beaucoup de magasins ferment tard le samedi.',
  ],
  [
    'Faut-il apprendre à programmer dès l’école ?',
    'Oui, car comprendre comment fonctionne un programme aide à ne pas subir les outils numériques.',
    'Peut-être, peut-être pas, tout dépend.',
    'Oui, il le faut, c’est tout.',
    'Mon ordinateur est trop lent.',
  ],
  [
    'Faut-il réduire la place de la voiture en ville ?',
    'Je suis pour, parce que moins de voitures, c’est moins de bruit et un air plus respirable.',
    'Chacun a ses raisons, difficile de trancher.',
    'Oui, je suis pour, c’est évident.',
    'J’aimerais passer mon permis cette année.',
  ],
];

/** [propos du camarade, la réfutation polie, l'attaque personnelle, le désaccord sans argument, le ton agressif]. */
export const REFUTATIONS = [
  [
    'Les jeux vidéo rendent violent.',
    'Je comprends ton inquiétude, mais un jeu reste une fiction : la plupart des joueurs font très bien la différence avec la réalité.',
    'Tu dis ça parce que tu n’as jamais tenu une manette.',
    'Je ne suis pas d’accord avec toi.',
    'N’importe quoi ! Ouvre les yeux, un jeu, c’est une fiction !',
  ],
  [
    'Le bac pro ne mène nulle part.',
    'Je ne partage pas ton avis : après un bac pro, on peut entrer directement dans un métier ou poursuivre en BTS.',
    'Tu répètes ce que disent tes parents, sans réfléchir.',
    'Moi, je ne vois pas les choses comme ça.',
    'Ridicule ! Il y a plein de BTS après un bac pro, renseigne-toi un peu !',
  ],
  [
    'Lire ne sert à rien quand on a internet.',
    'Je vois ce que tu veux dire, pourtant un livre demande une attention suivie que permettent rarement quelques lignes lues en ligne.',
    'Évidemment, toi, tu n’ouvres jamais un livre.',
    'Je pense le contraire, voilà tout.',
    'Tu racontes vraiment n’importe quoi, internet ne remplace pas un roman !',
  ],
  [
    'Il faut supprimer les devoirs à la maison.',
    'C’est un point de vue défendable, mais refaire seul un exercice permet de vérifier qu’on a vraiment compris.',
    'Tu dis ça parce que tu ne les fais jamais.',
    'Je ne suis pas d’accord avec ça.',
    'Arrête un peu ! Sans devoirs, personne ne réviserait, c’est évident !',
  ],
  [
    'Le télétravail rend les gens moins efficaces.',
    'Ce n’est pas toujours vrai : sans trajets ni interruptions, certains se concentrent même mieux chez eux.',
    'Tu n’as jamais travaillé, comment pourrais-tu le savoir ?',
    'Non, je ne pense pas.',
    'Mais c’est absurde ! Sans trajets, on travaille mieux, voyons !',
  ],
  [
    'Les influenceurs donnent de bons conseils.',
    'Certains, peut-être, mais beaucoup sont payés par les marques dont ils parlent : leur avis n’est donc pas neutre.',
    'Tu les crois parce que tu passes ta vie sur ton téléphone.',
    'Ça ne me convainc pas.',
    'Il faut vraiment manquer de recul pour croire ça ! Ils sont payés par les marques !',
  ],
  [
    'La voiture est indispensable, les transports en commun sont trop lents.',
    'À la campagne, peut-être ; mais en ville, avec les embouteillages, le bus ou le tram sont souvent plus rapides.',
    'Tu dis ça parce que tes parents te conduisent partout.',
    'Je ne vois pas les choses de cette façon.',
    'Mais enfin, réveille-toi ! En ville, le tram va plus vite que toi !',
  ],
  [
    'L’art contemporain, c’est n’importe quoi.',
    'Je comprends qu’il puisse dérouter, mais beaucoup d’œuvres cherchent justement à nous faire réfléchir sur ce qu’est l’art.',
    'Tu ne connais rien à l’art, alors laisse parler les autres.',
    'Je ne suis pas de ton avis.',
    'Quelle bêtise ! Ces œuvres font réfléchir, voyons !',
  ],
];

/** [position, sa nuance, la généralisation, l'abandon, le retournement]. */
export const NUANCES = [
  [
    'Les écrans nuisent aux études.',
    'Les écrans peuvent nuire aux études, surtout quand on les utilise tard le soir.',
    'Les écrans détruisent toujours les études de tous les élèves.',
    'Finalement, je ne sais pas, chacun pense ce qu’il veut.',
    'Les écrans sont excellents pour les études.',
  ],
  [
    'Le stage est la meilleure façon d’apprendre un métier.',
    'Le stage est souvent une excellente façon d’apprendre, à condition d’être bien encadré.',
    'Seul le stage apprend un métier ; les cours ne servent jamais à rien.',
    'Bon, au fond, je n’ai pas vraiment d’avis là-dessus.',
    'Le stage ne sert à rien pour apprendre un métier.',
  ],
  [
    'Les réseaux sociaux isolent les jeunes.',
    'Les réseaux sociaux peuvent isoler certains jeunes, même s’ils permettent aussi de garder le lien avec des amis éloignés.',
    'Les réseaux sociaux isolent tous les jeunes, sans exception.',
    'Bref, je laisse tomber, c’est trop compliqué.',
    'Les réseaux sociaux n’isolent jamais personne.',
  ],
  [
    'Le sport est bon pour la santé.',
    'Le sport est bon pour la santé, à condition de le pratiquer sans excès.',
    'Plus on fait de sport, plus on est en bonne santé, sans aucune limite.',
    'Peu importe, chacun fait comme il veut.',
    'Le sport est mauvais pour la santé.',
  ],
  [
    'La publicité manipule les consommateurs.',
    'La publicité cherche souvent à influencer nos choix, même si elle informe aussi sur les produits.',
    'Toute publicité ment toujours à tout le monde.',
    'En fait, je préfère ne rien dire.',
    'La publicité ne cherche jamais à influencer personne.',
  ],
  [
    'Le travail en équipe est plus efficace.',
    'Le travail en équipe est souvent plus efficace, surtout quand les rôles sont bien répartis.',
    'Le travail en équipe est toujours plus efficace, quelle que soit la tâche.',
    'Je ne sais plus trop, ça m’est égal.',
    'Le travail en équipe est moins efficace que le travail seul.',
  ],
  [
    'Les jeunes ne s’intéressent pas à la politique.',
    'Beaucoup de jeunes se méfient des partis, mais bon nombre s’engagent pour des causes précises.',
    'Aucun jeune ne s’intéresse à la politique, jamais.',
    'Laisse tomber, ce n’est pas important.',
    'Les jeunes se passionnent pour la politique.',
  ],
  [
    'L’argent ne fait pas le bonheur.',
    'L’argent ne suffit pas à rendre heureux, même s’il évite bien des soucis.',
    'L’argent rend toujours malheureux ceux qui en ont.',
    'Je n’en sais rien, c’est trop personnel.',
    'L’argent fait le bonheur, c’est évident.',
  ],
];

/** Des avis sans raison : de simples opinions. */
export const OPINIONS = [
  'Le rap, c’est la meilleure musique du monde.',
  'Les cours commencent beaucoup trop tôt.',
  'Ce film est complètement nul.',
  'Il faudrait supprimer les notes.',
  'Le football est le plus beau des sports.',
  'Les vacances d’été devraient être plus courtes.',
  'Les tatouages, c’est moche.',
  'Il faut absolument voir cette série.',
];

/** Des avis justifiés par une raison : des arguments. */
export const ARGUMENTS = [
  'Les cours commencent trop tôt, car les adolescents ont besoin de beaucoup de sommeil le matin.',
  'Il faudrait supprimer les notes, puisqu’elles découragent les élèves en difficulté au lieu de les aider à progresser.',
  'Le covoiturage est une bonne solution, car il réduit à la fois les frais et la pollution.',
  'Apprendre une langue étrangère est utile : cela ouvre davantage d’offres d’emploi.',
  'Les vacances d’été devraient être plus courtes, parce qu’en deux mois, beaucoup d’élèves oublient une partie de ce qu’ils ont appris.',
  'Le stage est indispensable, car il fait découvrir les vraies contraintes d’un métier.',
  'Il faut limiter la vitesse en ville, car un piéton heurté à faible vitesse a bien plus de chances de survivre.',
  'Le vélo convient mieux à la ville, puisqu’il ne rejette aucun gaz polluant.',
];

export const NATURES = { argument: 'Un argument', opinion: 'Une simple opinion' };

export const SOPHISMES = {
  attaque: 'Une attaque personnelle',
  generalisation: 'Une généralisation abusive',
  popularite: 'Un appel à la popularité',
  autorite: 'Une fausse autorité',
  dilemme: 'Une fausse alternative',
  pente: 'Une pente glissante',
};

/** [argument fallacieux, le procédé]. */
export const FALLACIEUX = [
  ['Ne l’écoute pas parler d’économie : il n’a même pas son bac.', 'attaque'],
  ['Sa proposition pour la cantine est forcément mauvaise : elle arrive toujours en retard.', 'attaque'],
  ['Mon voisin s’est fait voler son scooter devant la gare : cette ville est remplie de voleurs.', 'generalisation'],
  ['J’ai eu un professeur de maths qui expliquait mal : les professeurs de maths expliquent tous mal.', 'generalisation'],
  ['Deux de mes amis ont échoué au permis dans cette auto-école : elle ne vaut rien.', 'generalisation'],
  ['Cette marque de baskets est forcément la meilleure : tout le monde au lycée en porte.', 'popularite'],
  ['Des millions de personnes regardent cette émission, donc elle est de qualité.', 'popularite'],
  ['Ce footballeur célèbre affirme que cette boisson rend plus intelligent : c’est donc vrai.', 'autorite'],
  ['Une actrice très connue dit que ce régime guérit tout ; elle doit avoir raison.', 'autorite'],
  ['Soit tu viens à cette soirée, soit on ne se parle plus.', 'dilemme'],
  ['Soit on interdit complètement les voitures en ville, soit on accepte de respirer un air toxique.', 'dilemme'],
  ['Si on autorise les casquettes en classe, bientôt on viendra en pyjama, puis plus personne ne respectera aucune règle.', 'pente'],
  ['Si tu échoues à ce contrôle, tu rateras ton année, puis ton examen, et tu ne trouveras jamais de travail.', 'pente'],
];

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);

  const positions = melanger(POSITIONS).slice(0, 1).map(([sujet, bonne, floue, sansRaison, horsSujet]) => ({
    consigne: 'position',
    question: `Sujet du débat : « ${sujet} »`,
    bonne,
    choix: cartes(melanger([bonne, floue, sansRaison, horsSujet])),
    pieges: { [floue]: 'position-floue', [sansRaison]: 'position-sans-raison', [horsSujet]: 'position-hors-sujet' },
    aide: 'position-regle',
  }));

  const refutations = melanger(REFUTATIONS).slice(0, 2).map(([propos, bonne, attaque, sansArgument, agressif]) => ({
    consigne: 'refuter',
    question: `Un camarade affirme : « ${propos} »`,
    bonne,
    choix: cartes(melanger([bonne, attaque, sansArgument, agressif])),
    pieges: { [attaque]: 'refuter-attaque', [sansArgument]: 'refuter-sans-argument', [agressif]: 'refuter-ton' },
    aide: 'refuter-regle',
  }));

  const nuances = melanger(NUANCES).slice(0, 2).map(([position, bonne, absolu, abandon, contraire]) => ({
    consigne: 'nuancer',
    question: `Ta position : « ${position} »`,
    bonne,
    choix: cartes(melanger([bonne, absolu, abandon, contraire])),
    pieges: { [absolu]: 'nuancer-absolu', [abandon]: 'nuancer-abandon', [contraire]: 'nuancer-contraire' },
    aide: 'nuancer-regle',
  }));

  const natures = melanger([
    ...melanger(ARGUMENTS).slice(0, 1).map((p) => [p, 'argument']),
    ...melanger(OPINIONS).slice(0, 1).map((p) => [p, 'opinion']),
  ]).map(([phrase, nature]) => ({
    consigne: 'argument-ou-opinion',
    question: `« ${phrase} »`,
    bonne: nature,
    choix: Object.keys(NATURES).map((cle) => ({ cle, libelle: NATURES[cle] })),
    pieges: nature === 'argument' ? { opinion: 'nature-argument' } : { argument: 'nature-opinion' },
    aide: 'argument-ou-opinion-regle',
  }));

  const fallacieux = melanger(FALLACIEUX).slice(0, 1).map(([phrase, procede]) => {
    const autres = melanger(Object.keys(SOPHISMES).filter((s) => s !== procede)).slice(0, 2);
    return {
      consigne: 'fallacieux',
      question: `« ${phrase} »`,
      bonne: procede,
      choix: melanger([procede, ...autres]).map((cle) => ({ cle, libelle: SOPHISMES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, `sophisme-${procede}`])),
      aide: 'fallacieux-regle',
    };
  });

  return melanger([...positions, ...refutations, ...nuances, ...natures, ...fallacieux]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  position: 'Sur ce sujet, quelle intervention formule clairement une position ?',
  refuter: 'Quelle réponse réfute cette idée, poliment et avec un argument ?',
  nuancer: 'Quelle phrase nuance ta position, sans l’abandonner ?',
  'argument-ou-opinion': 'Cette phrase est-elle un argument, ou une simple opinion ?',
  fallacieux: 'Cet argument est fallacieux. Quel procédé utilise-t-il ?',

  'position-floue': 'Dire « ça dépend » ou « il y a du pour et du contre », c’est ne pas prendre position. Dans un débat, on dit clairement ce qu’on pense, quitte à nuancer ensuite.',
  'position-sans-raison': 'Tu as bien une position, mais aucune raison pour la soutenir. Ajoute toujours un « parce que » : sans argument, personne ne peut être convaincu.',
  'position-hors-sujet': 'Cette phrase ne répond pas à la question posée. Relis le sujet, et dis si tu es pour ou contre, et pourquoi.',
  'position-regle': 'Une bonne prise de position tient en deux temps : ce que tu penses, clairement, puis pourquoi, avec un argument.',

  'refuter-attaque': 'Cette réponse attaque la personne, pas son idée. On réfute un argument, jamais celui qui le défend.',
  'refuter-sans-argument': 'Dire qu’on n’est pas d’accord ne réfute rien. Il faut montrer pourquoi l’idée ne tient pas, avec un argument.',
  'refuter-ton': 'L’argument est là, mais le ton est agressif. Dans un débat, on reconnaît d’abord le point de vue de l’autre, puis on le contredit calmement.',
  'refuter-regle': 'Pour réfuter poliment : reconnais l’idée de l’autre, puis oppose-lui un argument précis, sans jamais viser la personne.',

  'nuancer-absolu': 'Avec « toujours », « tous » ou « jamais », tu durcis ta position au lieu de la nuancer. Nuancer, c’est préciser dans quels cas elle est vraie.',
  'nuancer-abandon': 'Ici, tu abandonnes ta position. Nuancer ne veut pas dire renoncer : on garde son idée en reconnaissant ses limites.',
  'nuancer-contraire': 'Cette phrase défend la position contraire. Nuancer, c’est garder ton idée en la précisant, pas la retourner.',
  'nuancer-regle': 'Pour nuancer, garde ta position et ajoute une limite : « souvent », « à condition que », « même si ».',

  'nature-argument': 'Cette phrase donne une raison, souvent après « car », « puisque » ou « parce que » : elle justifie l’avis. C’est un argument.',
  'nature-opinion': 'Cette phrase affirme un avis, mais ne dit pas pourquoi. Pose-toi la question « pourquoi ? » : si rien ne répond, c’est une simple opinion.',
  'argument-ou-opinion-regle': 'Une opinion dit ce qu’on pense ; un argument dit pourquoi on le pense. Cherche la raison.',

  'sophisme-attaque': 'C’est une attaque personnelle : on rejette l’idée à cause de celui qui la défend, sans examiner l’idée elle-même.',
  'sophisme-generalisation': 'C’est une généralisation abusive : on tire une règle pour tous à partir d’un ou deux cas seulement.',
  'sophisme-popularite': 'C’est un appel à la popularité : qu’une chose plaise à beaucoup de monde ne prouve pas qu’elle soit bonne ou vraie.',
  'sophisme-autorite': 'C’est une fausse autorité : la personne citée est célèbre, mais elle n’est pas compétente dans ce domaine.',
  'sophisme-dilemme': 'C’est une fausse alternative : on ne propose que deux choix extrêmes, comme s’il n’existait aucune autre possibilité.',
  'sophisme-pente': 'C’est une pente glissante : on enchaîne des conséquences de plus en plus graves, sans prouver qu’elles suivront.',
  'fallacieux-regle': 'Un argument fallacieux a l’air logique mais trompe. Demande-toi sur quoi il s’appuie vraiment : une personne, quelques cas, la foule, une célébrité, deux choix seulement, ou une suite de catastrophes ?',
};
