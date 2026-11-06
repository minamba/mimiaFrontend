/**
 * LES ÉTAPES DU TUTORIEL — voulu par Camara le 02/11/2026 : « tout est sombre,
 * on voit juste, sous forme de bulle, où l'enfant doit cliquer ».
 *
 * ÉCRITES POUR LE PARENT : « c'est le parent qui lit de toute façon, en primaire
 * il sera à côté de son enfant ». D'où le vouvoiement et « votre enfant ».
 *
 * Une étape, ce sont des données et rien d'autre :
 *
 *   titre, texte   ce que dit la bulle ;
 *   titreDepuis    le sélecteur d'un titre de la page, repris tel quel par la bulle.
 *                  Ce que la page ne dit pas de la même façon pour tous (l'examen de
 *                  cet enfant) ne se réécrit pas ici : on le lit. `titre` sert de repli ;
 *   cible          le sélecteur de ce qu'on éclaire (aucune : bulle au centre) ;
 *   optionnelle    la cible peut ne pas exister : ni jeux, ni fiches, ni examen
 *                  selon la classe et les réglages. L'étape se saute en silence ;
 *   ouverte        le clic passe à travers le trou. Sans elle, on éclaire sans
 *                  laisser toucher : le parent lit, puis clique sur « Suivant » ;
 *   attend         sélecteur dont l'APPARITION fait passer à la suite ;
 *   attendFin      sélecteur dont la DISPARITION fait passer à la suite ;
 *   scene          'cours' : l'écran de démonstration est affiché ;
 *   composant      'micro' : la bulle porte le test du micro.
 */

/** Ce que porte la démonstration du cours : présente, elle est à l'écran. */
export const SELECTEUR_DEMO = '[data-tuto-demo]';

export const ETAPES = [
  {
    id: 'bienvenue',
    titre: 'Bienvenue sur Mimia',
    texte: 'En quelques minutes, je vous montre comment tout fonctionne. Installez-vous avec votre enfant : suivez simplement les bulles, le reste de l’écran est dans l’ombre.',
    suivant: 'Commencer',
  },
  {
    id: 'micro',
    titre: 'D’abord, le micro',
    texte: 'Votre enfant parle à ses professeurs à voix haute : il faut donc que le micro soit branché et que le navigateur ait le droit de s’en servir. Vérifions-le ensemble.',
    composant: 'micro',
  },
  {
    id: 'carte',
    cible: '[data-tuto="carte"]',
    optionnelle: true,
    titre: 'Ma carte',
    texte: 'La carte montre les progrès de votre enfant, matière par matière : ce qu’il maîtrise déjà, et ce qui reste à travailler. Elle présente aussi tout le programme scolaire de l’année.',
  },
  {
    id: 'calendrier',
    cible: '[data-tuto="calendrier"]',
    optionnelle: true,
    titre: 'Mon calendrier',
    texte: 'Le calendrier réunit ses cours passés, ses contrôles à venir et les vacances scolaires. Vous voyez d’un coup d’œil quand il a travaillé.',
  },
  {
    id: 'jeux',
    cible: '[data-tuto="jeux"]',
    optionnelle: true,
    titre: 'Mes jeux',
    texte: 'Des jeux liés aux notions du cours, pas des jeux pour passer le temps : à la mesure de sa classe, ils font réviser ce qu’il apprend en s’amusant. Son professeur peut aussi lui en proposer un à la fin du cours, en fonction de la notion étudiée.',
  },
  {
    id: 'fiches',
    cible: '[data-tuto="fiches"]',
    optionnelle: true,
    titre: 'Mes fiches de révision',
    texte: 'Votre enfant importe un cours de l’école, en photo ou en PDF, et reçoit des fiches de révision faites à partir de sa leçon. Il peut aussi s’auto-évaluer avec des flashcards ou un quiz.',
  },
  {
    // À partir de la 3e seulement : la carte n'existe pas avant, ni quand le module
    // est éteint, et l'étape se saute alors toute seule (Camara, le 03/11/2026).
    id: 'conseillere',
    cible: '[data-tuto="conseillere"]',
    optionnelle: true,
    titre: 'La conseillère d’orientation',
    texte: 'Son rôle : aider votre enfant à réfléchir à sa voie, à ses études et à son métier, à partir de ses points forts et des formations proches de chez lui. Son objectif : qu’il choisisse en connaissance de cause. Vous retrouvez un rapport après chaque séance.',
  },
  {
    id: 'professeur',
    cible: '[data-tuto="professeur"]',
    optionnelle: true,
    ouverte: true,
    attend: '.modale__boite--duree',
    titre: 'Un professeur par matière',
    texte: 'Chaque carte est un professeur, qui se souvient de votre enfant d’un cours à l’autre. Cliquez sur celle-ci pour voir comment on entre en cours.',
    action: 'Cliquez sur la carte',
  },
  {
    id: 'durees',
    cible: '.modale__boite--duree .durees',
    optionnelle: true,
    ouverte: true,
    attend: '.modale__boite--casque',
    titre: 'La durée du cours',
    texte: 'Avant chaque cours, votre enfant choisit son temps : de 15 minutes pour une seule notion, jusqu’à 45 minutes pour un chapitre entier. Le professeur adapte son cours et prévient cinq minutes avant la fin.',
    action: 'Choisissez une durée',
  },
  {
    id: 'casque',
    cible: '.casque-option--oui',
    optionnelle: true,
    titre: 'Le mode casque',
    texte: 'Avec un casque ou des écouteurs, le micro reste à l’écoute même quand le professeur parle : votre enfant peut lui couper la parole à tout moment, comme dans une vraie conversation. C’est le mode le plus confortable.',
  },
  {
    id: 'haut-parleur',
    cible: '.casque-option:not(.casque-option--oui)',
    optionnelle: true,
    titre: 'Le mode haut-parleur',
    texte: 'Sans casque, le micro entendrait la voix du professeur et croirait que c’est votre enfant qui parle. Il devient donc sourd tant que le professeur parle : il faut attendre qu’il ait fini pour répondre. La question est posée à chaque cours : choisissez selon ce que vous avez ce jour-là.',
  },
  {
    id: 'casque-choix',
    cible: '.casque-choix',
    optionnelle: true,
    ouverte: true,
    attendFin: '.modale__boite--casque',
    titre: 'À vous de choisir',
    texte: 'Choisissez un mode pour entrer dans le cours. Rassurez-vous : c’est une démonstration, rien n’est décompté de votre forfait.',
    action: 'Choisissez un mode',
  },
  {
    id: 'cours',
    scene: 'cours',
    titre: 'Vous voici en cours',
    texte: 'C’est une démonstration : le professeur ne parle pas, et rien n’est décompté de votre forfait. Voyons chaque bouton, un par un.',
  },
  {
    id: 'chrono',
    scene: 'cours',
    cible: '[data-tuto="demo-chrono"]',
    titre: 'Le temps restant',
    texte: 'Dans un vrai cours, ce compteur défile jusqu’à la fin de la durée choisie. Ici, il est arrêté.',
  },
  {
    id: 'pause',
    scene: 'cours',
    cible: '[data-tuto="demo-pause"]',
    titre: 'La pause',
    texte: 'Besoin de s’arrêter ? Ce bouton met le cours en pause : le temps s’arrête et rien n’est décompté de votre forfait. Le professeur et le micro se taisent, et on ne peut plus rien écrire. « Reprendre » relance le cours là où il en était. Il n’est pas proposé pendant un contrôle noté.',
  },
  {
    id: 'detection',
    scene: 'cours',
    cible: '[data-tuto="demo-detection"]',
    titre: 'La détection automatique de la voix',
    texte: 'Allumée, votre enfant parle quand il veut, sans toucher à rien : le micro l’entend et envoie ses phrases tout seul. Éteinte, il clique sur le micro pour parler. Allumée, c’est le plus simple.',
  },
  {
    id: 'piece-jointe',
    scene: 'cours',
    cible: '[data-tuto="demo-piece-jointe"]',
    titre: 'Envoyer un document',
    texte: 'Le trombone envoie une image ou un PDF déjà sur l’appareil : un exercice, une leçon, une liste de mots. Le professeur le lit et s’en sert.',
  },
  {
    id: 'camera',
    scene: 'cours',
    cible: '[data-tuto="demo-camera"]',
    titre: 'L’appareil photo',
    texte: 'Il allume la caméra de l’appareil. Votre enfant montre sa page, et il lui suffit de dire « Photo » pour la prendre et l’envoyer.',
  },
  {
    id: 'scanner',
    scene: 'cours',
    cible: '[data-tuto="demo-scanner"]',
    titre: 'Le scanner',
    texte: 'Sur ordinateur, il affiche un QR code : on photographie la copie avec son téléphone, sans s’y connecter. Sur téléphone ou tablette, il ouvre directement l’appareil photo.',
  },
  {
    id: 'tableau',
    scene: 'cours',
    cible: '[data-tuto="demo-tableau"]',
    titre: 'Le tableau',
    texte: 'Le professeur y écrit ses explications, ses calculs et ses schémas pendant qu’il parle, comme en classe. Ce qu’il écrit y reste jusqu’à ce qu’il écrive autre chose. Sur téléphone, il s’ouvre avec le bouton « Afficher le tableau ».',
  },
  {
    id: 'quitter',
    scene: 'cours',
    cible: '[data-tuto="demo-quitter"]',
    ouverte: true,
    attendFin: SELECTEUR_DEMO,
    titre: 'Quitter le cours',
    texte: 'À la fin, ou s’il doit partir plus tôt, votre enfant clique ici. Le professeur écrit alors un compte rendu que vous retrouvez sur sa fiche. Cliquez pour sortir de la démonstration.',
    action: 'Cliquez sur Quitter',
  },
  {
    id: 'controles',
    cible: '#mes-controles',
    optionnelle: true,
    titre: 'Mes contrôles',
    texte: 'Avec « Ajouter un contrôle », notez ici les contrôles annoncés à l’école, avec le cours en photo si vous l’avez. Le professeur prépare votre enfant sur cette leçon, le rappelle à l’approche de la date, et vous voyez où il en est dans ses révisions.',
  },
  {
    id: 'examen',
    cible: '#preparation-examen',
    optionnelle: true,
    // LE TITRE DE L'EXAMEN DE CET ENFANT — Camara, le 03/11/2026 : « Préparation au
    // brevet » en 3e, « au bac de français et de maths » en 1re, « au bac général » ou
    // « technologique (STMG) » en terminale. Le serveur le sait, la section l'affiche.
    titreDepuis: '#preparation-examen h2',
    titre: 'La préparation à l’examen',
    texte: 'C’est l’année de son examen : votre enfant retrouve ici ses épreuves, et voit où il en est dans chacune. Chaque bouton lance une séance de préparation avec le professeur de la matière.',
  },
  {
    id: 'bouton',
    cible: '[data-tuto="revoir"]',
    optionnelle: true,
    titre: 'Revoir le tutoriel',
    texte: 'Ce bouton relance ces explications quand vous voulez. Vous savez tout : choisissez un professeur, et bon cours !',
    suivant: 'Terminer',
  },
];

/** Le titre de la bulle : celui que porte la page s'il y en a un, sinon le sien. */
export function titreDeLEtape(etape) {
  const lu = etape.titreDepuis && document.querySelector(etape.titreDepuis)?.textContent?.trim();
  return lu || etape.titre;
}

/** La part accomplie, de 0 à 100 : la dernière étape affiche 100 %. */
export function avancement(index, total = ETAPES.length) {
  if (total <= 1) return 100;
  const borne = Math.min(Math.max(index, 0), total - 1);
  return Math.round((borne / (total - 1)) * 100);
}
