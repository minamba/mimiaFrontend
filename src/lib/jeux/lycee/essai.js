/**
 * L'ESSAI — le français de 1re technologique (Adrien).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   FR_1TEC_ECR_ESSAI              — « Rédiger un essai sur la question que le
 *                                     texte partage avec l'œuvre… »
 *   FR_1TEC_ECR_ETAYER_ESSAI       — « Appuyer l'essai sur l'œuvre et les textes
 *                                     étudiés, ses lectures et sa culture… »
 *   FR_1TEC_ECR_RELATIONS_LOGIQUES — « Exprimer la condition, la cause, la
 *                                     conséquence, le but, la comparaison,
 *                                     l'opposition et la concession »
 *
 * QUATRE SORTES DE MANCHES (3 + 2 + 1 + 2) :
 *   - LE RÔLE (3) : un petit essai de cinq phrases (thèse, argument, exemple,
 *     contre-argument, réfutation) ; une phrase est désignée, quel est son
 *     rôle ? LES PIÈGES : l'exemple pris pour un argument, l'argument pour la
 *     thèse, et surtout la concession (« Certes… ») prise pour la thèse de
 *     l'auteur, la réfutation prise pour un simple argument ;
 *   - LE CONNECTEUR (2) : cause, conséquence, but, condition, comparaison,
 *     opposition, concession. L'erreur dit ce qu'annonce le connecteur choisi ;
 *   - LA QUESTION POSÉE (1) : à quelle question le texte répond-il ? LES
 *     PIÈGES : la question de fait (elle a une réponse, elle ne se discute
 *     pas), la question trop vaste, la question à côté ;
 *   - L'APPUI (2) : comment s'appuyer sur l'œuvre étudiée, ses lectures, sa
 *     culture. Générique : aucune œuvre n'est nommée. LES PIÈGES : raconter
 *     l'œuvre au lieu de s'en servir, la généralité « tout le monde sait »,
 *     la citation plaquée sans explication.
 * Les textes sont écrits pour le jeu : des opinions argumentées, aucun fait
 * daté ni aucune attribution.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'essai', titre: 'L’essai', matiereCode: 'FRANCAIS' };

export const PAR_CLASSE = {
  PREMIERE_TECHNO: {
    titre: 'L’essai',
    accroche: 'Thèse, preuves, objection : construis.',
    competences: ['FR_1TEC_ECR_ESSAI', 'FR_1TEC_ECR_ETAYER_ESSAI', 'FR_1TEC_ECR_RELATIONS_LOGIQUES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

export const ROLES = {
  these: 'La thèse',
  argument: 'Un argument',
  exemple: 'Un exemple',
  contre: 'Un contre-argument',
  refutation: 'Une réfutation',
};
/** L'ordre des phrases dans chaque petit essai. */
export const ORDRE = ['these', 'argument', 'exemple', 'contre', 'refutation'];

/** [thèse, argument, exemple, contre-argument, réfutation] : un petit essai, dans l'ordre. */
export const ESSAIS = [
  [
    'Le travail en groupe devrait occuper une vraie place au lycée.',
    'En effet, il apprend à confronter ses idées et à se répartir les tâches, ce que demande toute vie professionnelle.',
    'Lors d’un exposé à quatre, chacun doit écouter les autres et défendre sa part devant la classe.',
    'Certes, certains élèves laissent les autres travailler à leur place.',
    'Mais il suffit d’évaluer aussi chacun individuellement pour que personne ne puisse se cacher derrière le groupe.',
  ],
  [
    'Le livre papier garde toute sa valeur à l’heure des écrans.',
    'D’abord, on lit plus attentivement une page que rien ne vient interrompre.',
    'Sur un téléphone, une seule notification suffit à couper une lecture au milieu d’un chapitre.',
    'On objectera que la liseuse permet d’emporter des centaines de livres.',
    'Pourtant, emporter beaucoup de livres ne garantit pas de mieux en lire un seul.',
  ],
  [
    'Chacun devrait pratiquer une activité artistique, même sans talent particulier.',
    'Car créer, c’est apprendre à exprimer ce que l’on ressent autrement qu’avec les mots de tous les jours.',
    'Un adolescent timide qui rejoint une troupe de théâtre amateur apprend peu à peu à prendre la parole.',
    'Certes, tout le monde n’a pas le temps d’ajouter une activité à ses journées.',
    'Mais une heure par semaine suffit, et ce temps-là n’est jamais perdu.',
  ],
  [
    'Voyager forme la jeunesse.',
    'En effet, se confronter à d’autres coutumes oblige à remettre en question ses habitudes.',
    'Un lycéen parti en échange scolaire découvre qu’on peut organiser autrement ses repas, ses horaires et sa vie de famille.',
    'On dira que les voyages coûtent cher et ne sont pas accessibles à tous.',
    'Pourtant, découvrir une autre région ou accueillir un correspondant étranger coûte peu et ouvre déjà l’esprit.',
  ],
  [
    'La publicité destinée aux enfants devrait être strictement encadrée.',
    'Car un jeune enfant ne distingue pas encore bien un message qui informe d’un message qui veut vendre.',
    'Une publicité pour des céréales sucrées, glissée au milieu d’un dessin animé, peut suffire à déclencher une demande insistante au supermarché.',
    'Certes, la publicité finance une partie des programmes pour la jeunesse.',
    'Mais protéger la santé et le jugement des enfants compte davantage que l’équilibre financier d’une chaîne.',
  ],
  [
    'Les réseaux sociaux appauvrissent le débat public.',
    'En effet, ils récompensent les messages courts et choquants plutôt que les raisonnements nuancés.',
    'Une phrase sortie de son contexte peut circuler des milliers de fois, quand l’explication complète passe inaperçue.',
    'On objectera qu’ils donnent la parole à ceux qu’on n’entendait jamais.',
    'Pourtant, avoir la parole ne sert à rien si personne ne prend le temps d’écouter.',
  ],
  [
    'Apprendre par cœur reste utile.',
    'D’abord, ce que l’on sait par cœur, on peut le mobiliser vite, sans avoir à le chercher.',
    'Un élève qui connaît ses tables de multiplication peut se concentrer sur le raisonnement d’un problème plutôt que sur le calcul.',
    'Certes, on peut tout retrouver en quelques secondes sur internet.',
    'Mais encore faut-il savoir quoi chercher, et cela suppose des connaissances déjà en tête.',
  ],
  [
    'L’erreur est une étape nécessaire pour apprendre.',
    'En effet, comprendre pourquoi on s’est trompé permet de ne plus refaire la même faute.',
    'Un apprenti cuisinier qui rate une sauce apprend, en cherchant la cause, à mieux régler sa cuisson.',
    'On objectera que l’erreur coûte cher dans certains métiers.',
    'Mais c’est justement pour cela qu’on s’entraîne en formation, là où une erreur ne met personne en danger.',
  ],
  [
    'S’engager dans une association est une excellente école de citoyenneté.',
    'Car on y apprend à décider à plusieurs, à respecter des règles communes et à rendre des comptes.',
    'Dans un club sportif, un jeune trésorier doit présenter les dépenses de l’année à tous les membres.',
    'Certes, cet engagement prend du temps sur les études.',
    'Mais l’organisation qu’il exige profite souvent aux études elles-mêmes.',
  ],
  [
    'Il faut redonner de la place à la nature en ville.',
    'En effet, les arbres rafraîchissent les rues pendant les fortes chaleurs.',
    'Une cour d’école goudronnée devient brûlante en juin, alors qu’une cour plantée d’arbres reste supportable.',
    'On objectera que les espaces verts coûtent cher à entretenir.',
    'Pourtant, ce coût reste modeste comparé à celui des dégâts de la chaleur sur la santé.',
  ],
];

/**
 * [phrase à trou, le bon connecteur, [[connecteur à écarter, la relation qu'il exprime], …]].
 * Chaque connecteur écarté rend la phrase illogique (et souvent incorrecte).
 */
export const CONNECTEURS = [
  ['… le texte soit court, sa contraction demande une lecture très attentive.', 'Bien que', [['Parce que', 'lien-cause'], ['Afin que', 'lien-but']]],
  ['Cite un passage précis de l’œuvre … le lecteur voie d’où vient ton analyse.', 'pour que', [['bien que', 'lien-concession'], ['parce que', 'lien-cause']]],
  ['… tu ne nuances jamais ta thèse, ton essai paraîtra caricatural.', 'Si', [['Bien que', 'lien-concession'], ['Afin que', 'lien-but']]],
  ['Cette réfutation est convaincante, … elle répond précisément à l’objection.', 'car', [['pourtant', 'lien-opposition'], ['mais', 'lien-opposition']]],
  ['L’auteur multiplie les exemples, … son propos reste très concret.', 'c’est pourquoi', [['pourtant', 'lien-opposition'], ['bien que', 'lien-concession']]],
  ['… un bon avocat, l’auteur d’un essai doit prévoir les objections.', 'Comme', [['Parce qu’', 'lien-cause'], ['Bien qu’', 'lien-concession']]],
  ['Il a relu son essai deux fois … il ne reste aucune faute.', 'pour qu’', [['bien qu’', 'lien-concession'], ['parce qu’', 'lien-cause']]],
  ['Le premier texte voit dans le progrès technique une libération ; le second, …, y voit une menace.', 'au contraire', [['par conséquent', 'lien-consequence'], ['en effet', 'lien-cause']]],
  ['Les arguments vont du plus faible au plus fort, … le lecteur est convaincu à la fin.', 'si bien que', [['bien que', 'lien-concession'], ['à moins que', 'lien-condition']]],
  ['L’essai doit être nuancé, … la question posée n’a pas de réponse simple.', 'puisque', [['pourtant', 'lien-opposition'], ['afin que', 'lien-but']]],
  ['… l’objection paraît solide, on peut la réfuter.', 'Même si', [['Puisque', 'lien-cause'], ['Pour que', 'lien-but']]],
];

/** [court texte, la question qu'il pose, une question de fait, une question trop vaste, une question à côté]. */
export const QUESTIONS = [
  [
    'On répète aux jeunes qu’il faut choisir tôt un métier. Mais à quinze ans, sait-on vraiment ce que l’on aimera faire toute sa vie ? Bien des adultes ont changé de voie, et s’en félicitent.',
    'Faut-il choisir son métier très jeune ?',
    'À quel âge entre-t-on au lycée ?',
    'Qu’est-ce que le bonheur ?',
    'Quels métiers recrutent le plus ?',
  ],
  [
    'Les objets connectés promettent de nous faciliter la vie : la montre compte nos pas, le réfrigérateur passe commande. Mais à force de tout confier aux machines, ne risquons-nous pas d’oublier des savoir-faire élémentaires ?',
    'La technique nous rend-elle moins autonomes ?',
    'Combien de pas fait-on en une journée ?',
    'Qu’est-ce que la nature humaine ?',
    'Un réfrigérateur connecté est-il un bon achat ?',
  ],
  [
    'Dans les fables, les animaux parlent et agissent comme des hommes. Ce détour amuse, mais il permet surtout de dénoncer les défauts humains sans viser personne directement. Le rire devient alors une arme.',
    'Peut-on critiquer la société en la faisant rire ?',
    'Combien de fables compte un recueil ?',
    'Qu’est-ce que la littérature ?',
    'Les animaux sont-ils intelligents ?',
  ],
  [
    'Chacun peut aujourd’hui publier son avis sur un restaurant, un film ou un livre. Cette liberté est précieuse. Mais un avis donné en quelques secondes vaut-il l’analyse d’un critique qui a pris le temps de comparer ?',
    'Tous les avis se valent-ils ?',
    'Sur quel site publier un avis sur un restaurant ?',
    'Qu’est-ce que la liberté ?',
    'Faut-il aller plus souvent au cinéma ?',
  ],
  [
    'On oppose souvent le travail manuel au travail intellectuel, comme si l’un était plus noble que l’autre. Pourtant, réparer un moteur exige de réfléchir, et rédiger un rapport exige de la méthode.',
    'Le travail intellectuel vaut-il mieux que le travail manuel ?',
    'Combien coûte la réparation d’un moteur ?',
    'Pourquoi l’homme existe-t-il ?',
    'Comment rédige-t-on un rapport de stage ?',
  ],
  [
    'Le progrès médical a allongé la vie. Mais vivre plus longtemps, est-ce forcément vivre mieux ? Encore faut-il que ces années gagnées soient vécues en bonne santé, et entourées.',
    'Une vie plus longue est-elle une vie meilleure ?',
    'Combien d’années vit-on en moyenne en France ?',
    'Qu’est-ce que la science ?',
    'Comment devient-on médecin ?',
  ],
  [
    'Les jeux vidéo sont souvent accusés d’isoler les joueurs. Pourtant, beaucoup se jouent en équipe, avec des amis ou des inconnus, et obligent à communiquer sans cesse.',
    'Les jeux vidéo isolent-ils ceux qui y jouent ?',
    'Quel jeu vidéo s’est le mieux vendu ?',
    'Qu’est-ce que le jeu ?',
    'Les jeux vidéo coûtent-ils trop cher ?',
  ],
];

/** [question, la bonne réponse, [[réponse à écarter, la méthode], …]] : s'appuyer sur l'œuvre et sa culture. */
export const APPUIS = [
  [
    'Ton argument : « La lecture permet de vivre d’autres vies. » Quel appui le sert le mieux ?',
    'Un passage précis d’un roman lu, expliqué en une phrase',
    [['Le résumé complet de l’œuvre étudiée', 'appui-resume'], ['« Tout le monde sait que lire est utile. »', 'appui-generalite']],
  ],
  [
    'Comment utiliser une citation de l’œuvre dans ton essai ?',
    'La citer brièvement, puis l’expliquer au service de l’argument',
    [['La recopier longuement, sans commentaire', 'appui-citation-plaquee'], ['La mettre seule en conclusion', 'appui-place']],
  ],
  [
    'Où se place l’exemple tiré de l’œuvre étudiée ?',
    'Juste après l’argument qu’il illustre',
    [['Seul, dans l’introduction', 'appui-place'], ['Dans un paragraphe à part, à la fin', 'appui-place']],
  ],
  [
    'Sur quoi ton essai doit-il s’appuyer ?',
    'L’œuvre étudiée, tes lectures et ta culture personnelle',
    [['Uniquement tes goûts personnels', 'appui-gouts'], ['Uniquement le texte à contracter', 'appui-un-seul-texte']],
  ],
  [
    'Dans un essai, ton avis personnel…',
    'doit être justifié par des arguments et des exemples',
    [['suffit à convaincre, s’il est sincère', 'appui-gouts'], ['est interdit', 'appui-avis-permis']],
  ],
  [
    'Ton argument : « Le rire peut dénoncer une injustice. » Quel appui le sert le mieux ?',
    'Une scène comique précise, et ce qu’elle dénonce',
    [['« Le rire, c’est bon pour la santé. »', 'appui-hors-sujet'], ['L’histoire de la pièce, acte par acte', 'appui-resume']],
  ],
  [
    'Un film vu récemment éclaire ton argument. Peux-tu t’en servir ?',
    'Oui, s’il est précis et relié à l’argument',
    [['Non, seuls les livres comptent', 'appui-un-seul-texte'], ['Oui, en racontant tout le film', 'appui-resume']],
  ],
  [
    'Quel exemple est le plus solide pour un essai ?',
    'Un exemple précis, tiré d’une œuvre ou d’un fait connu',
    [['« On voit souvent des gens qui… »', 'appui-generalite'], ['« Moi, je pense que c’est comme ça. »', 'appui-gouts']],
  ],
];

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

export function serie(graine = Date.now()) {
  const { melanger, entre } = outils(graine);

  const roles = melanger(ESSAIS).slice(0, 3).map((texte) => {
    const i = entre(0, ORDRE.length - 1);
    const role = ORDRE[i];
    const autres = melanger(ORDRE.filter((r) => r !== role)).slice(0, 3);
    return {
      consigne: 'role',
      question: `${texte.join(' ')}\n\n→ « ${texte[i]} »`,
      bonne: role,
      choix: melanger([role, ...autres]).map((cle) => ({ cle, libelle: ROLES[cle] })),
      pieges: Object.fromEntries(autres.map((a) => [a, `role-${role}`])),
      aide: 'role-regle',
    };
  });

  const connecteurs = melanger(CONNECTEURS).slice(0, 2).map(([phrase, bon, faux]) => ({
    consigne: 'connecteur',
    question: phrase,
    bonne: bon,
    choix: cartes(melanger([bon, ...faux.map(([f]) => f)])),
    pieges: Object.fromEntries(faux),
    aide: 'connecteur-regle',
  }));

  const questions = melanger(QUESTIONS).slice(0, 1).map(([texte, bonne, fait, large, cote]) => ({
    consigne: 'question',
    question: texte,
    bonne,
    choix: cartes(melanger([bonne, fait, large, cote])),
    pieges: { [fait]: 'question-fait', [large]: 'question-large', [cote]: 'question-a-cote' },
    aide: 'question-regle',
  }));

  const appuis = melanger(APPUIS).slice(0, 2).map(([question, bonne, faux]) => ({
    consigne: 'appui',
    question,
    bonne,
    choix: cartes(melanger([bonne, ...faux.map(([f]) => f)])),
    pieges: Object.fromEntries(faux),
    aide: 'appui-regle',
  }));

  return melanger([...roles, ...connecteurs, ...questions, ...appuis]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  role: 'Dans cet extrait d’essai, quel rôle joue la phrase indiquée ?',
  connecteur: 'Quel connecteur exprime le lien logique juste ?',
  question: 'À quelle question ce texte cherche-t-il à répondre ?',
  appui: 'Comment appuyer ton essai sur tes lectures et ta culture ?',

  'role-these': 'La thèse est la position que l’auteur défend dans tout le texte. Toutes les autres phrases travaillent pour elle : elles la justifient, l’illustrent ou la protègent d’une objection.',
  'role-argument': 'L’argument justifie la thèse : il répond à la question « pourquoi ? ». Il reste général, et il est souvent introduit par « en effet », « car » ou « d’abord ».',
  'role-exemple': 'L’exemple est un cas précis et concret, une situation, un personnage, un lieu : il ne prouve rien seul, il illustre l’argument qui le précède.',
  'role-contre': 'Attention à la concession : avec « certes » ou « on objectera que », l’auteur donne la parole au camp d’en face. Ce n’est pas sa thèse, c’est l’objection qu’il va réfuter.',
  'role-refutation': 'La réfutation répond à l’objection qui précède, souvent avec « mais » ou « pourtant ». Ce n’est pas un argument de plus : elle montre pourquoi l’objection ne tient pas.',
  'role-regle': 'Repère d’abord la position défendue : c’est la thèse. Puis demande-toi pour chaque phrase : la justifie-t-elle, l’illustre-t-elle, lui objecte-t-elle quelque chose, ou répond-elle à cette objection ?',

  'lien-cause': 'Ce connecteur annonce une cause : la suite devrait expliquer pourquoi. Relis les deux idées : est-ce vraiment le lien entre elles ?',
  'lien-consequence': 'Ce connecteur annonce une conséquence : la suite devrait découler de ce qui précède. Est-ce le cas ici ?',
  'lien-opposition': 'Ce connecteur marque une opposition. Or les deux idées vont ici dans le même sens : cherche le lien qui les unit vraiment.',
  'lien-concession': 'Ce connecteur marque une concession : on admet un fait qui devrait empêcher la suite, mais la suite se produit quand même. Ce n’est pas le lien ici.',
  'lien-but': 'Ce connecteur annonce un but, ce que l’on cherche à obtenir. Demande-toi si la suite est vraiment un objectif.',
  'lien-condition': 'Ce connecteur pose une condition ou une exception. Vérifie que la phrase a encore un sens avec lui.',
  'connecteur-regle': 'Cherche d’abord le lien entre les deux idées : une cause, une conséquence, un but, une condition, une comparaison, une opposition ou une concession. Puis choisis le connecteur qui le dit, et vérifie le mode du verbe.',

  'question-fait': 'Cette question appelle une simple information : elle a une réponse, elle ne se discute pas. La question d’un essai, elle, admet des réponses opposées.',
  'question-large': 'Cette question est bien trop vaste : le texte n’y répond pas en entier. Cherche celle qui correspond exactement à son propos.',
  'question-a-cote': 'Le texte en parle peut-être au passage, mais ce n’est pas ce qu’il discute. Cherche la question à laquelle sa thèse répond.',
  'question-regle': 'Trouve d’abord la thèse du texte, puis transforme-la en question qu’on peut débattre : c’est la question posée.',

  'appui-resume': 'Raconter l’œuvre n’est pas s’en servir. Choisis un moment précis, et montre en une phrase ce qu’il prouve.',
  'appui-generalite': 'Une généralité comme « tout le monde sait » ne prouve rien. Un appui solide est précis : un passage, une scène, un fait que l’on peut vérifier.',
  'appui-citation-plaquee': 'Une citation qu’on n’explique pas ne sert à rien. Cite court, puis dis ce que la citation montre pour ton argument.',
  'appui-place': 'Un exemple vient juste après l’argument qu’il illustre : séparé de lui, il ne prouve plus rien.',
  'appui-gouts': 'Tes goûts ne suffisent pas à convaincre. Ton avis compte, mais il doit être justifié par des arguments et des exemples.',
  'appui-un-seul-texte': 'L’essai s’appuie sur l’œuvre étudiée, mais aussi sur tes autres lectures et ta culture personnelle, à condition d’être précis.',
  'appui-avis-permis': 'Dans l’essai, tu as le droit de donner ton avis, et c’est même attendu, à condition de le justifier.',
  'appui-hors-sujet': 'Cet appui ne parle pas de l’argument. Un exemple n’est utile que s’il prouve exactement ce que dit l’argument.',
  'appui-regle': 'Un bon appui est précis, tiré de l’œuvre, de tes lectures ou de ta culture, placé après l’argument et expliqué en une phrase.',
};
