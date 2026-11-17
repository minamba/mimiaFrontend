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
 *   si             le sélecteur d'une porte de la page. Absente (jeux éteints, fiches
 *                  fermées), toutes les étapes de sa visite se sautent avec elle ;
 *   scene          l'écran de démonstration affiché : 'cours', ou la visite d'une porte
 *                  ('carte', 'calendrier', 'fiches', 'podcasts', 'jeux' : l'ordre de Camara,
 *                  16/11/2026) ;
 *   vue            ce que cet écran montre : tout s'en déduit, il ne garde rien ;
 *   fenetre        'duree' ou 'casque' : la fenêtre que l'étape éclaire. Le parent l'ouvre
 *                  en cliquant à l'aller ; « Précédent » la remet en place au retour ;
 *   composant      'micro' : la bulle porte le test du micro.
 */

/** Ce que porte la démonstration du cours : présente, elle est à l'écran. */
export const SELECTEUR_DEMO = '[data-tuto-demo]';

export const ETAPES = [
  {
    id: 'bienvenue',
    titre: 'Bienvenue sur Mimia',
    texte: 'Je vous montre comment tout fonctionne, page par page. Installez-vous avec votre enfant et suivez les bulles : vous pouvez revenir en arrière ou passer le tutoriel à tout moment.',
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
    texte: 'La carte montre les progrès de votre enfant, matière par matière : ce qu’il maîtrise déjà, et ce qui reste à travailler. Elle présente aussi tout le programme scolaire de l’année. Entrons pour la voir.',
    suivant: 'Entrer',
  },
  {
    id: 'carte-score',
    si: '[data-tuto="carte"]',
    scene: 'carte',
    cible: '[data-tuto="demo-carte-score"]',
    optionnelle: true,
    titre: 'Le chiffre à regarder',
    texte: 'En haut, le nombre de notions que votre enfant maîtrise dans le programme de sa classe, et la part du chemin parcourue. La carte se met à jour après chaque cours, et le félicite quand il a maîtrisé une nouvelle notion.',
  },
  {
    id: 'carte-matiere',
    si: '[data-tuto="carte"]',
    scene: 'carte',
    cible: '[data-tuto="demo-carte-matiere"]',
    optionnelle: true,
    titre: 'Une ligne par matière',
    texte: 'Chaque matière dit combien de notions sont acquises sur le total de l’année. Un clic la déplie ou la replie : les notions y sont rangées par domaine.',
  },
  {
    id: 'carte-etats',
    si: '[data-tuto="carte"]',
    scene: 'carte',
    cible: '[data-tuto="demo-carte-notions"]',
    optionnelle: true,
    titre: 'Quatre états, écrits en toutes lettres',
    texte: 'Acquise : la notion tient. En cours : il y travaille. À revoir : il l’a déjà vue, mais elle ne tient pas encore. À découvrir : il ne l’a pas encore travaillée, et ce n’est pas un retard.',
  },
  {
    id: 'carte-avant',
    si: '[data-tuto="carte"]',
    scene: 'carte',
    cible: '[data-tuto="demo-carte-avant"]',
    optionnelle: true,
    titre: 'Les années précédentes',
    texte: 'Le professeur remonte parfois à une notion d’une classe d’avant, là où ça bloque. Ces notions restent à votre enfant, rangées ici à part, sans se mélanger au programme de l’année.',
  },
  {
    id: 'calendrier',
    cible: '[data-tuto="calendrier"]',
    optionnelle: true,
    titre: 'Mon calendrier',
    texte: 'Le calendrier réunit ses cours passés, ses contrôles à venir et les vacances scolaires. Vous voyez d’un coup d’œil quand il a travaillé. Entrons pour le détailler.',
    suivant: 'Entrer',
  },
  {
    id: 'cal-decompte',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-decompte"]',
    optionnelle: true,
    titre: 'Le compte à rebours',
    texte: 'Le temps qu’il reste avant les prochaines vacances, ou avant la rentrée quand il y est déjà.',
  },
  {
    id: 'cal-legende',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-legende"]',
    optionnelle: true,
    titre: 'La légende',
    texte: 'Elle rappelle ce que veut dire chaque marque de la grille. Voyons-les une par une.',
  },
  {
    id: 'cal-vacances',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-vacances"]',
    optionnelle: true,
    titre: 'Les vacances',
    texte: 'Les jours en violet sont les vacances scolaires de sa zone. Elles viennent de l’académie renseignée sur sa fiche : sans académie, elles n’apparaissent pas.',
  },
  {
    id: 'cal-coche',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-coche"]',
    optionnelle: true,
    titre: 'La coche verte : un cours effectué',
    texte: 'Elle veut dire que votre enfant a eu cours ce jour-là. Il n’y a qu’une coche par jour, même après plusieurs cours : le détail se lit en ouvrant le jour.',
  },
  {
    id: 'cal-evaluation',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-evaluation"]',
    optionnelle: true,
    titre: 'Le stylo : une évaluation',
    texte: 'Il veut dire que votre enfant a passé une évaluation ce jour-là, avec son professeur. Sa note se lit en ouvrant le jour.',
  },
  {
    id: 'cal-controle',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-controle"]',
    optionnelle: true,
    titre: '« Contrôle » : un contrôle à venir',
    texte: 'L’étiquette orange marque un contrôle que vous avez noté. La case ressort encore davantage le jour même.',
  },
  {
    id: 'cal-aujourdhui',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-aujourdhui"]',
    optionnelle: true,
    titre: 'Aujourd’hui',
    texte: 'Le contour orange marque le jour où vous êtes.',
  },
  {
    id: 'cal-mois',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-mois"]',
    optionnelle: true,
    titre: 'Changer de mois',
    texte: 'Les flèches passent au mois d’avant ou d’après : on remonte dans ce qui a été fait, et on regarde ce qui arrive.',
  },
  {
    id: 'cal-jour',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    cible: '[data-tuto="demo-cal-jour"]',
    optionnelle: true,
    titre: 'Chaque jour s’ouvre',
    texte: 'Un clic sur un jour du mois ouvre son détail, même sur un jour vide. Ouvrons celui-ci.',
  },
  {
    id: 'cal-seances',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'jour',
    cible: '[data-tuto="demo-cal-seances"]',
    optionnelle: true,
    titre: 'Les cours de la journée',
    texte: 'Chaque cours a sa ligne : la matière, la durée choisie et l’heure.',
  },
  {
    id: 'cal-notes',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'jour',
    cible: '[data-tuto="demo-cal-notes"]',
    optionnelle: true,
    titre: 'Les évaluations de la journée',
    texte: 'La matière, la note sur vingt et l’heure.',
  },
  {
    id: 'cal-ajouter',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'jour',
    cible: '[data-tuto="demo-cal-ajouter"]',
    optionnelle: true,
    titre: 'Ajouter un contrôle',
    texte: 'Un contrôle est annoncé à l’école ? Ouvrez le jour où il aura lieu et cliquez ici. Voyons ce formulaire.',
  },
  {
    id: 'cal-dictee',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'formulaire',
    cible: '[data-tuto="demo-cal-dictee"]',
    optionnelle: true,
    titre: 'Le plus simple : le dire',
    texte: 'Touchez le micro et dites la phrase d’un bloc. Matière, date, heure et sujet se remplissent tout seuls.',
  },
  {
    id: 'cal-champs',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'formulaire',
    cible: '[data-tuto="demo-cal-champs"]',
    optionnelle: true,
    titre: 'Ou le remplir à la main',
    texte: 'Seule la matière est obligatoire ici : la date est celle du jour ouvert. Le sujet et l’heure peuvent attendre, le professeur les demandera en cours.',
  },
  {
    id: 'cal-cours',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'formulaire',
    cible: '[data-tuto="demo-cal-cours"]',
    optionnelle: true,
    titre: 'Le cours du contrôle',
    texte: 'Joignez la leçon si vous l’avez : photo, PDF, Word, Excel ou PowerPoint. Le professeur prépare le contrôle en la suivant, puis ajoute ce qui manque du programme. Sans cours, il suit le programme officiel.',
  },
  {
    id: 'cal-ajoute',
    si: '[data-tuto="calendrier"]',
    scene: 'calendrier',
    vue: 'ajoute',
    cible: '[data-tuto="demo-cal-ajoute"]',
    optionnelle: true,
    titre: 'Le voici au calendrier',
    texte: 'Le jour porte maintenant l’étiquette du contrôle. En ouvrant ce jour, on arrive à sa fiche : le programme, l’avancement et le bouton pour le préparer avec le professeur.',
  },
  {
    id: 'fiches',
    cible: '[data-tuto="fiches"]',
    optionnelle: true,
    titre: 'Mes fiches de révision',
    texte: 'Votre enfant importe un cours de l’école, en photo ou en PDF, et reçoit des fiches de révision faites à partir de sa leçon. Il peut aussi s’auto-évaluer avec des flash cards ou un quiz. Entrons pour tout voir.',
    suivant: 'Entrer',
  },
  {
    id: 'fiches-quota',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    cible: '[data-tuto="demo-fiches-quota"]',
    optionnelle: true,
    titre: 'Ses cours du mois',
    texte: 'Chaque enfant peut importer dix cours par mois. Un cours compte pour un, même s’il donne plusieurs fiches, et pour deux s’il dépasse dix pages. Au-delà, vous pouvez acheter des crédits dans Mon compte, Mon forfait.',
  },
  {
    id: 'fiches-liste',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    cible: '[data-tuto="demo-fiches-liste"]',
    optionnelle: true,
    titre: 'Ses fiches, rangées par matière',
    texte: 'Chaque carte est un cours : le nombre de fiches, leur type, et le bouton « Me tester ». « Compléter » ajoute les pages suivantes du même chapitre.',
  },
  {
    id: 'fiches-creer',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    cible: '[data-tuto="demo-fiches-creer"]',
    optionnelle: true,
    titre: 'Créer une fiche',
    texte: 'Tout commence ici. Voyons ce qui s’ouvre.',
  },
  {
    id: 'fiches-mode',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'mode',
    cible: '.fch-mode__choix',
    optionnelle: true,
    titre: 'Deux façons de créer',
    texte: 'À partir d’un cours : votre enfant importe sa leçon de l’école. Libre : il écrit ou dicte ce qu’il veut réviser. Regardons les deux.',
  },
  {
    id: 'fiches-matiere',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'cours',
    cible: '[data-tuto="demo-fiches-matiere"]',
    optionnelle: true,
    titre: 'À partir d’un cours : la matière',
    texte: 'D’abord, il choisit la matière de son cours. La fiche y sera rangée.',
  },
  {
    id: 'fiches-types',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'cours',
    cible: '[data-tuto="demo-fiches-types"]',
    optionnelle: true,
    titre: 'Le type de fiche',
    texte: 'Ensuite, la forme qu’il préfère : l’essentiel, une carte mentale, des questions et réponses… Chaque type se montre en miniature, et « Voir un exemple » l’ouvre en grand.',
  },
  {
    id: 'fiches-import',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'cours',
    cible: '[data-tuto="demo-fiches-import"]',
    optionnelle: true,
    titre: 'Importer le cours',
    texte: 'Enfin, sa leçon : un fichier, ou le QR code pour la photographier avec un téléphone. Sur téléphone, il la prend directement en photo.',
  },
  {
    id: 'fiches-libre',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'libre',
    cible: '[data-tuto="demo-fiches-libre"]',
    optionnelle: true,
    titre: 'Le mode libre',
    texte: 'Mêmes choix de matière et de type, mais pas de document : il écrit ou dicte sa leçon, ses notes, ou simplement le sujet, comme « les fractions ».',
  },
  {
    id: 'fiches-notions',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'notions',
    cible: '[data-tuto="demo-fiches-notions"]',
    optionnelle: true,
    titre: 'Une fiche par notion',
    texte: 'Mimia lit le cours et repère ses notions. Votre enfant décoche ce qu’il ne veut pas réviser : toutes ensemble, elles ne comptent que pour un seul cours.',
  },
  {
    id: 'fiches-feuille',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'fiche',
    cible: '[data-tuto="demo-fiches-feuille"]',
    optionnelle: true,
    titre: 'La fiche de révision',
    texte: 'La voici, faite à partir de sa leçon, sur une vraie feuille : définitions, exemples, ce qu’il faut retenir et les pièges à éviter.',
  },
  {
    id: 'fiches-sommaire',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'fiche',
    cible: '[data-tuto="demo-fiches-sommaire"]',
    optionnelle: true,
    titre: 'Passer d’une notion à l’autre',
    texte: 'La liste des notions du cours : un clic, et il va directement à la fiche qui l’intéresse.',
  },
  {
    id: 'fiches-actions',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'fiche',
    cible: '[data-tuto="demo-fiches-actions"]',
    optionnelle: true,
    titre: 'Imprimer ou se tester',
    texte: 'Il imprime une fiche ou l’enregistre en PDF, seule ou avec toutes celles du cours. Et « Me tester » lance l’entraînement.',
  },
  {
    id: 'tester-jeux',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'tester-jeux',
    cible: '[data-tuto="demo-tester-jeux"]',
    optionnelle: true,
    titre: 'Flash cards ou quiz',
    texte: 'Deux façons de s’entraîner sur ses fiches, sur une seule ou sur tout le cours.',
  },
  {
    id: 'tester-modes',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'tester-modes',
    cible: '[data-tuto="demo-tester-modes"]',
    optionnelle: true,
    titre: 'Tranquille ou challenge',
    texte: 'Tranquille : sans chrono. Challenge : dix secondes par carte ou vingt par question, avec des points et des séries.',
  },
  {
    id: 'carte-question',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'carte-question',
    cible: '[data-tuto="demo-tester-carte"]',
    optionnelle: true,
    titre: 'La flash card : la question',
    texte: 'Une question sur une carte. Votre enfant cherche la réponse dans sa tête, puis touche la carte pour la retourner.',
  },
  {
    id: 'carte-reponse',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'carte-reponse',
    cible: '[data-tuto="demo-tester-carte"]',
    optionnelle: true,
    titre: 'La flash card : la réponse',
    texte: 'La réponse apparaît, et il dit lui-même s’il savait, ou si c’est à revoir.',
  },
  {
    id: 'quiz',
    si: '[data-tuto="fiches"]',
    scene: 'fiches',
    vue: 'quiz',
    cible: '[data-tuto="demo-tester-quiz"]',
    optionnelle: true,
    titre: 'Le quiz',
    texte: 'Quatre réponses, une seule est la bonne. Le quiz corrige aussitôt et explique pourquoi. À la fin, votre enfant voit son score, et peut revoir ce qu’il a raté.',
  },
  {
    // MES PODCASTS — Camara, le 16/11/2026 : « il faut intégrer l'étape du podcast ». Après les fiches, sur le même
    // modèle : la porte, puis sa visite. Le module éteint (Admin › Modes), la carte n'existe pas : tout se saute.
    id: 'podcasts',
    cible: '[data-tuto="podcasts"]',
    optionnelle: true,
    titre: 'Mes podcasts',
    texte: 'Votre enfant transforme un cours, un sujet ou même un livre en épisodes audio, lus par la voix de son professeur : à écouter partout, avant un contrôle ou dans les transports. Entrons pour voir.',
    suivant: 'Entrer',
  },
  {
    id: 'podcasts-liste',
    si: '[data-tuto="podcasts"]',
    scene: 'podcasts',
    cible: '[data-tuto="demo-podcasts-liste"]',
    optionnelle: true,
    titre: 'Ses podcasts du mois',
    texte: 'Chaque carte est un cours devenu podcast, avec son nombre d’épisodes. La jauge compte les podcasts du mois ; au-delà, vous pouvez acheter des crédits dans Mon compte, Mon forfait.',
  },
  {
    id: 'podcasts-mode',
    si: '[data-tuto="podcasts"]',
    scene: 'podcasts',
    vue: 'mode',
    cible: '.pod-mode__choix',
    optionnelle: true,
    titre: 'Trois façons de commencer',
    texte: 'À partir d’un cours : il importe sa leçon. Libre : il écrit ou dicte un sujet. À partir d’un livre : il en donne le titre, et son professeur le lui résume, partie par partie.',
  },
  {
    id: 'podcasts-episodes',
    si: '[data-tuto="podcasts"]',
    scene: 'podcasts',
    vue: 'episodes',
    cible: '[data-tuto="demo-podcasts-episodes"]',
    optionnelle: true,
    titre: 'Un épisode par notion',
    texte: 'Mimia lit le cours et propose un épisode de quelques minutes par notion. Votre enfant décoche ce qu’il ne veut pas écouter.',
  },
  {
    id: 'podcasts-lecteur',
    si: '[data-tuto="podcasts"]',
    scene: 'podcasts',
    vue: 'lecteur',
    cible: '[data-tuto="demo-podcasts-lecteur"]',
    optionnelle: true,
    titre: 'Son professeur lui lit le cours',
    texte: 'Chaque épisode est lu par la voix du professeur de la matière. « Lire en même temps » affiche le texte : la phrase dite s’éclaire, et le texte défile tout seul.',
  },
  {
    id: 'podcasts-tout',
    si: '[data-tuto="podcasts"]',
    scene: 'podcasts',
    vue: 'lecteur',
    cible: '[data-tuto="demo-podcasts-tout"]',
    optionnelle: true,
    titre: 'Tout écouter d’une traite',
    texte: '« Tout écouter » enchaîne les épisodes, l’un après l’autre. Quand le téléchargement est proposé, ils s’emportent aussi en MP3, un par un ou réunis en un seul fichier.',
  },
  {
    id: 'jeux',
    cible: '[data-tuto="jeux"]',
    optionnelle: true,
    titre: 'Mes jeux',
    texte: 'Des jeux liés aux notions du cours, pas des jeux pour passer le temps : à la mesure de sa classe, ils font réviser ce qu’il apprend en s’amusant. Son professeur peut aussi lui en proposer un à la fin du cours, en fonction de la notion étudiée. Entrons pour les voir.',
    suivant: 'Entrer',
  },
  {
    id: 'jeux-frise',
    si: '[data-tuto="jeux"]',
    scene: 'jeux',
    vue: 'liste',
    cible: '[data-tuto="demo-jeux-frise"]',
    optionnelle: true,
    titre: 'Une porte par classe',
    texte: 'Chaque portail est une classe, et celle de votre enfant est marquée. Il peut rejouer aux jeux des classes d’avant ; celles d’après restent fermées.',
  },
  {
    id: 'jeux-matiere',
    si: '[data-tuto="jeux"]',
    scene: 'jeux',
    vue: 'liste',
    cible: '[data-tuto="demo-jeux-matiere"]',
    optionnelle: true,
    titre: 'Des jeux rangés par matière',
    texte: 'Ils suivent le programme de sa classe : voici les vrais jeux de son année. Pendant l’essai, deux jeux de mathématiques sont ouverts ; les autres sont réservés aux familles abonnées.',
  },
  {
    id: 'jeux-escape',
    si: '[data-tuto="jeux"]',
    scene: 'jeux',
    vue: 'liste',
    cible: '[data-tuto="demo-jeux-escape"]',
    optionnelle: true,
    titre: 'Les escape games',
    texte: 'Ce badge signale un escape game : des énigmes sur les notions de sa classe, pour ouvrir les cadenas et sortir de la salle.',
  },
  {
    id: 'jeux-bonus',
    si: '[data-tuto="jeux"]',
    scene: 'jeux',
    vue: 'liste',
    cible: '[data-tuto="demo-jeux-bonus"]',
    optionnelle: true,
    titre: 'Les jeux bonus',
    texte: 'Ceux-là sont là pour le plaisir de jouer : ils ne sont pas liés aux notions de cours.',
  },
  {
    id: 'jeux-tranquille',
    si: '[data-tuto="jeux"]',
    scene: 'jeux',
    vue: 'modes',
    cible: '[data-tuto="demo-jeux-tranquille"]',
    optionnelle: true,
    titre: 'Jouer tranquillement',
    texte: 'Avant la partie, votre enfant choisit son mode. En mode tranquille, il prend son temps, sans cœurs à perdre.',
  },
  {
    id: 'jeux-defi',
    si: '[data-tuto="jeux"]',
    scene: 'jeux',
    vue: 'modes',
    cible: '[data-tuto="demo-jeux-defi"]',
    optionnelle: true,
    titre: 'Le mode défi',
    texte: 'Il part avec des cœurs selon sa classe, et chaque erreur en coûte un. Son meilleur score est gardé : il joue contre lui-même, il n’y a pas de classement.',
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
    fenetre: 'duree',
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
    fenetre: 'casque',
    cible: '.casque-option--oui',
    optionnelle: true,
    titre: 'Le mode casque',
    texte: 'Avec un casque ou des écouteurs, le micro reste à l’écoute même quand le professeur parle : votre enfant peut lui couper la parole à tout moment, comme dans une vraie conversation. C’est le mode le plus confortable.',
  },
  {
    id: 'haut-parleur',
    fenetre: 'casque',
    cible: '.casque-option:not(.casque-option--oui)',
    optionnelle: true,
    titre: 'Le mode haut-parleur',
    texte: 'Sans casque, le micro entendrait la voix du professeur et croirait que c’est votre enfant qui parle. Il devient donc sourd tant que le professeur parle : il faut attendre qu’il ait fini pour répondre. La question est posée à chaque cours : choisissez selon ce que vous avez ce jour-là.',
  },
  {
    id: 'casque-choix',
    fenetre: 'casque',
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

/**
 * LE TUTORIEL DE LA FICHE — Camara, le 08/11/2026 : court et à part, sur la VRAIE fiche.
 * Il arrive quand elle a quelque chose à montrer, après un premier cours : c'est lire ses
 * vraies données qui l'apprend au parent. Une section absente se saute (pas de bilan,
 * pas encore de progression).
 */
export const ETAPES_FICHE = [
  {
    id: 'fiche-annee',
    cible: '[data-tuto="fiche-annee"]',
    optionnelle: true,
    titre: 'L’année que vous regardez',
    texte: 'Tout ce que montre cette fiche porte sur une année scolaire : chiffres, notions, évaluations et séances. Quand votre enfant aura passé plusieurs années sur Mimia, un clic passera de l’une à l’autre.',
  },
  {
    id: 'fiche-bilan',
    cible: '[data-tuto="fiche-bilan"]',
    optionnelle: true,
    titre: 'Le bilan de la semaine',
    texte: 'Un résumé de sa semaine, le même que celui du courriel. Vous pouvez le lire ici à tout moment, et le télécharger en PDF.',
  },
  {
    // LA PREMIÈRE BARRE DE LA PAGE : la même revient en tête de chaque section.
    id: 'fiche-navigation',
    cible: '.raccourcis-fiche',
    optionnelle: true,
    titre: 'Aller directement à une section',
    texte: 'Cette barre vous évite de faire défiler toute la fiche : un clic, et vous êtes à la section voulue. Elle revient en tête de chaque section : le bouton allumé montre où vous êtes, et « En haut » ramène au début de la fiche.',
  },
  {
    id: 'fiche-competences',
    cible: '[data-tuto="fiche-competences"]',
    optionnelle: true,
    titre: 'Où il a besoin d’aide',
    texte: 'Les points fragiles et les compétences acquises, toutes matières confondues. Juste en dessous : ce qui est en cours d’acquisition, et ce qui reste à confirmer. Le pourcentage de chaque notion dit où en est sa maîtrise.',
  },
  {
    id: 'fiche-progression',
    cible: '[data-tuto="fiche-progression"]',
    optionnelle: true,
    titre: 'Sa progression',
    texte: 'Matière par matière : l’évolution de ses notes dans le temps, et où en est la maîtrise de chaque notion aujourd’hui.',
  },
  {
    id: 'fiche-evaluations',
    cible: '[data-tuto="fiche-evaluations"]',
    optionnelle: true,
    titre: 'Ses évaluations',
    texte: 'Chaque évaluation passée avec son professeur : la note, le sujet et sa remarque. « Voir la copie » ouvre ce que votre enfant a répondu.',
  },
  {
    id: 'fiche-seances',
    cible: '[data-tuto="fiche-seances"]',
    optionnelle: true,
    titre: 'Ses séances et leurs comptes rendus',
    texte: 'Le professeur écrit un compte rendu à la fin de chaque séance : ce qui a été travaillé et ce qu’il reste à reprendre. « Voir le rapport » l’ouvre en entier. Le bouton « Voir le tuto » relance ces explications quand vous voulez.',
  },
  {
    // LA DERNIÈRE, COMME DANS LA PAGE. Elle n'existe que pour certains enfants : sans elle,
    // `si` fait des séances la dernière bulle, et le moteur y met « Terminer ».
    id: 'fiche-orientation',
    si: '.projet-orientation',
    cible: '.projet-orientation',
    optionnelle: true,
    titre: 'Son orientation',
    texte: 'Les séances avec la conseillère d’orientation sont à part des cours. Vous y lisez le projet de votre enfant, ce qu’elle a observé à chaque séance, et son rapport d’orientation, à déplier. Avec l’accord de votre enfant, ses professeurs tiennent compte de ce projet.',
  },
];

/**
 * LE TUTORIEL DE « VOS ENFANTS » — Camara, le 17/11/2026 : « quand un parent s'inscrit, il faut un tuto rapide sur la
 * page Mes enfants pour expliquer à quoi servent les boutons, et surtout ceux des cartes ; une description succincte
 * suffit ». Une bulle par bouton, une phrase ou deux. Les cibles sont celles de la PREMIÈRE carte ; une absente se saute
 * (Administration pour un parent, l'ajout quand la formule est complète).
 */
export const ETAPES_ENFANTS = [
  {
    id: 'enfants-forfait',
    cible: '.page--enfants-illu .reste-forfait',
    optionnelle: true,
    titre: 'Votre forfait',
    texte: 'Les heures de cours qu’il reste à votre famille ce mois-ci, partagées entre vos enfants. « Voir mon forfait » ouvre le détail, les recharges et l’abonnement.',
  },
  {
    id: 'enfants-carte',
    cible: '.page--enfants-illu .eleve-case .eleve-carte__haut',
    optionnelle: true,
    titre: 'La carte de votre enfant',
    texte: 'Son portrait, sa classe et son âge. Juste en dessous, la dernière fois qu’il a travaillé.',
  },
  {
    id: 'enfants-cours',
    cible: '.page--enfants-illu .eleve-case .eleve-carte__action',
    optionnelle: true,
    titre: 'Ses cours',
    texte: 'Ouvre son espace : ses professeurs, ses cartes, ses fiches et ses jeux. C’est là qu’il choisit un professeur et commence un cours.',
  },
  {
    id: 'enfants-calendrier',
    cible: '.page--enfants-illu .eleve-case .eleve-bandeau--calendrier',
    optionnelle: true,
    titre: 'Son calendrier',
    texte: 'Ses cours passés, ses évaluations, ses contrôles à venir et les vacances scolaires, jour par jour.',
  },
  {
    id: 'enfants-fiche',
    cible: '.page--enfants-illu .eleve-case .eleve-bandeau--fiche',
    optionnelle: true,
    titre: 'Sa fiche',
    texte: 'Son suivi : ce qu’il maîtrise, ce qui reste fragile, ses notes et les comptes rendus de ses professeurs.',
  },
  {
    id: 'enfants-code',
    cible: '.page--enfants-illu .eleve-case .eleve-bandeau--code',
    optionnelle: true,
    titre: 'Son code',
    texte: 'Le code qu’il tape pour se connecter seul, sur son propre appareil, sans votre mot de passe.',
  },
  {
    id: 'enfants-ajout',
    cible: '.page--enfants-illu .eleve-ajout',
    optionnelle: true,
    titre: 'Ajouter un enfant',
    texte: 'Pour créer le profil d’un autre enfant, selon ce que permet votre formule.',
  },
  {
    id: 'enfants-compte',
    cible: '.page--enfants-illu .page__bouton-compte',
    optionnelle: true,
    titre: 'Mon compte',
    texte: 'Vos informations, votre abonnement et vos factures.',
  },
  {
    id: 'enfants-avis',
    cible: '.page--enfants-illu .page__entete-actions .bouton-avis',
    optionnelle: true,
    titre: 'Votre avis',
    texte: 'Une idée, un souci, un compliment : écrivez-nous, nous lisons tout.',
  },
  {
    id: 'enfants-revoir',
    cible: '[data-tuto="revoir-enfants"]',
    optionnelle: true,
    titre: 'Revoir le tutoriel',
    texte: 'Ce bouton relance ces explications quand vous voulez.',
    suivant: 'Terminer',
  },
];

/**
 * « PASSER L'ÉTAPE » — Camara, le 08/11/2026. « Suivant » passe déjà une bulle : ce bouton
 * saute la partie entière. Une partie, c'est une porte et sa visite, ou le cours, du choix
 * du professeur à la sortie de la démonstration. Le reste tient en une bulle : rien à sauter.
 */
const PORTES = ['carte', 'calendrier', 'fiches', 'podcasts', 'jeux'];
const DEBUT_DU_COURS = ETAPES.findIndex((e) => e.id === 'professeur');
const FIN_DU_COURS = ETAPES.findIndex((e) => e.id === 'quitter');

export function partieDe(index) {
  const etape = ETAPES[index];
  if (!etape) return null;
  if (etape.si) return etape.scene;
  if (PORTES.includes(etape.id)) return etape.id;
  return index >= DEBUT_DU_COURS && index <= FIN_DU_COURS ? 'cours' : null;
}

/** La première étape après cette partie, ou null : hors partie, ou plus rien après. */
export function apresLaPartie(index) {
  const partie = partieDe(index);
  if (!partie) return null;

  let suite = index + 1;
  while (partieDe(suite) === partie) suite += 1;
  return suite < ETAPES.length ? suite : null;
}

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
