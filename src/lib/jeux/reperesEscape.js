/* eslint-disable */
/**
 * LES OBJETS À FOUILLER DANS CHAQUE SALLE D'ESCAPE GAME — FICHIER GÉNÉRÉ
 * (09/10/2026, salles 2 et 3 le 11/10/2026), à régénérer si un décor change.
 *
 * Pour chaque histoire (« <clé du jeu>|<classe> »), six objets RÉELS du décor
 * — un par cadenas, dans l'ordre du récit — et la porte de sortie, repérés à
 * l'œil sur l'image (1400 × 788) : x et y en pourcentage, au centre de l'objet.
 * Une histoire absente d'ici prend des places par défaut (`JeuxCollege.js`).
 *
 * `salles` (11/10/2026) : les TROIS salles de l'histoire — { nom, objets[2],
 * passage }. La salle 1 est le décor d'origine, avec ses deux premiers objets ;
 * les salles 2 et 3 ont leur propre image. Le passage de la salle 3 est la
 * sortie. `objets` et `porte` restent pour une histoire jouée dans une seule salle.
 *
 * LE PASSAGE DE LA SALLE 1 MÈNE À LA SALLE 2 (11/10/2026) : il reprenait
 * d'abord l'ancienne porte de sortie (« l'entrée de l'entrepôt » ouvrait sur
 * une ruelle). 21 passages ont été choisis à nouveau sur le décor, et New York
 * (4e) a une salle 1 neuve, le musée ; 12 autres salles 1 neuves le même jour. Scripts : scratchpad/anim/
 * fusionner-reperes.mjs puis corriger-salles1.mjs — la fusion seule écraserait
 * ces corrections.
 */
export const REPERES_ESCAPE = {
  'escape-anglais-lycee|PREMIERE': {
    objets: [
      { x: 15, y: 14, nom: "la lampe de bureau" },
      { x: 42, y: 14, nom: "le pylône d’antenne" },
      { x: 55, y: 28, nom: "le microphone" },
      { x: 30, y: 72, nom: "le casque" },
      { x: 14, y: 30, nom: "le magnétophone à bandes" },
      { x: 85, y: 12, nom: "le phare" },
    ],
    porte: { x: 72, y: 35, nom: "la grande fenêtre" },
    salles: [
      {
        nom: "Le studio de Harbor Light",
        objets: [{ x: 9, y: 26, nom: "la lampe de bureau" }, { x: 34, y: 18, nom: "le pylône d’antenne" }],
        passage: { x: 89, y: 70, nom: "la porte de l’escalier de la cave" },
      },
      {
        nom: "La cave du générateur",
        objets: [{ x: 25, y: 65, nom: "le générateur de secours" }, { x: 83, y: 32, nom: "le téléphone mural" }],
        passage: { x: 58, y: 40, nom: "le couloir vers la porte des archives" },
      },
      {
        nom: "Les archives de la station",
        objets: [{ x: 14, y: 55, nom: "le magnétophone à bandes" }, { x: 75, y: 8, nom: "le voyant rouge" }],
        passage: { x: 68, y: 48, nom: "la porte vitrée vers la terrasse du phare" },
      },
    ],
  },
  'escape-anglais-lycee|PREMIERE_PRO': {
    objets: [
      { x: 16, y: 55, nom: "le triporteur rouge" },
      { x: 27, y: 32, nom: "les étagères de l’entrepôt" },
      { x: 37, y: 48, nom: "le triporteur vert" },
      { x: 51, y: 48, nom: "la charrette aux colis" },
      { x: 91, y: 43, nom: "le verrou du portail" },
      { x: 82, y: 88, nom: "la clé en laiton" },
    ],
    porte: { x: 79, y: 40, nom: "le portail" },
    salles: [
      {
        nom: "La cour des coursiers",
        objets: [{ x: 16, y: 55, nom: "le triporteur rouge" }, { x: 27, y: 32, nom: "les étagères de l’entrepôt" }],
        passage: { x: 79, y: 40, nom: "le portail, vers Canal Street" },
      },
      {
        nom: "Canal Street",
        objets: [{ x: 24, y: 50, nom: "la barrière du pont fermé" }, { x: 84, y: 60, nom: "le colis fragile" }],
        passage: { x: 76, y: 37, nom: "le pont de briques enjambant le canal, vers la ruelle derrière le portail" },
      },
      {
        nom: "La ruelle derrière le portail",
        objets: [{ x: 22, y: 55, nom: "le cadenas ouvert" }, { x: 86, y: 80, nom: "la clé en laiton" }],
        passage: { x: 9, y: 30, nom: "le portail refermé et le crochet des clés" },
      },
    ],
  },
  'escape-anglais-lycee|PREMIERE_TECHNO': {
    objets: [
      { x: 88, y: 15, nom: "la lampe d’alarme orange" },
      { x: 9, y: 35, nom: "le réservoir d’eau" },
      { x: 22, y: 54, nom: "la vanne rouge" },
      { x: 45, y: 70, nom: "le bac de salades" },
      { x: 54, y: 32, nom: "le ventilateur" },
      { x: 85, y: 60, nom: "les plants de tomates fanés" },
    ],
    porte: { x: 57, y: 64, nom: "le bout de l’allée" },
    salles: [
      {
        nom: "La serre en alerte",
        objets: [{ x: 88, y: 15, nom: "la lampe d’alarme orange" }, { x: 9, y: 35, nom: "le réservoir d’eau" }],
        passage: { x: 57, y: 64, nom: "l’allée, vers la salle des pompes" },
      },
      {
        nom: "La salle des pompes",
        objets: [{ x: 18, y: 60, nom: "la pompe B" }, { x: 89, y: 49, nom: "la tablette du superviseur" }],
        passage: { x: 68, y: 38, nom: "la rampe de béton vers la zone B" },
      },
      {
        nom: "La zone B au soleil couchant",
        objets: [{ x: 17, y: 38, nom: "le grand ventilateur" }, { x: 82, y: 22, nom: "les arroseurs de la zone B" }],
        passage: { x: 50, y: 48, nom: "la porte vitrée au bout de l’allée" },
      },
    ],
  },
  'escape-anglais-lycee|SECONDE': {
    objets: [
      { x: 84, y: 10, nom: "le phare" },
      { x: 8, y: 28, nom: "les casiers à homards" },
      { x: 18, y: 11, nom: "le hangar bleu" },
      { x: 36, y: 12, nom: "la maison rouge" },
      { x: 86, y: 50, nom: "le bateau bleu" },
      { x: 26, y: 62, nom: "la bitte d’amarrage" },
    ],
    porte: { x: 64, y: 35, nom: "les portes de l’écluse" },
    salles: [
      {
        nom: "Le port à marée basse",
        objets: [{ x: 84, y: 10, nom: "le phare" }, { x: 8, y: 28, nom: "les casiers à homards" }],
        passage: { x: 29, y: 42, nom: "les marches, vers la ruelle du port" },
      },
      {
        nom: "La ruelle du port",
        objets: [{ x: 28, y: 38, nom: "la porte du hangar bleu" }, { x: 92, y: 30, nom: "la fenêtre aux cartes postales" }],
        passage: { x: 60, y: 58, nom: "le passage voûté sous la halle au poisson, vers le quai de l’écluse" },
      },
      {
        nom: "Le quai de l’écluse",
        objets: [{ x: 14, y: 38, nom: "le panneau d’affichage" }, { x: 90, y: 68, nom: "la bitte d’amarrage" }],
        passage: { x: 62, y: 40, nom: "les portes de l’écluse vers la mer" },
      },
    ],
  },
  'escape-anglais-lycee|SECONDE_PRO': {
    objets: [
      { x: 58, y: 48, nom: "le vélo bleu" },
      { x: 22, y: 62, nom: "l’établi" },
      { x: 93, y: 24, nom: "les casiers à cadenas" },
      { x: 42, y: 12, nom: "l’étagère de bocaux" },
      { x: 42, y: 32, nom: "la boîte à outils bleue" },
      { x: 87, y: 55, nom: "la pompe à vélo" },
    ],
    porte: { x: 79, y: 35, nom: "la porte ouverte" },
    salles: [
      {
        nom: "L’atelier de vélos",
        objets: [{ x: 58, y: 48, nom: "le vélo bleu" }, { x: 22, y: 62, nom: "l’établi" }],
        passage: { x: 79, y: 35, nom: "la porte ouverte, vers la réserve des pièces" },
      },
      {
        nom: "La réserve des pièces",
        objets: [{ x: 26, y: 30, nom: "l’affiche de sécurité" }, { x: 90, y: 48, nom: "les étagères de pièces" }],
        passage: { x: 72, y: 52, nom: "l’escalier de bois vers le bureau" },
      },
      {
        nom: "Le bureau de la patronne",
        objets: [{ x: 40, y: 38, nom: "l’ordinateur allumé" }, { x: 88, y: 68, nom: "la boîte de la pompe" }],
        passage: { x: 72, y: 60, nom: "le casier rouge en bas de l’escalier" },
      },
    ],
  },
  'escape-anglais-lycee|TERMINALE': {
    objets: [
      { x: 91, y: 35, nom: "les sommets enneigés" },
      { x: 17, y: 65, nom: "la caisse métallique" },
      { x: 45, y: 18, nom: "la station météo" },
      { x: 15, y: 25, nom: "la porte de la station" },
      { x: 82, y: 60, nom: "la trappe ouverte" },
      { x: 49, y: 82, nom: "le câble débranché" },
    ],
    porte: { x: 48, y: 49, nom: "l’escalier métallique" },
    salles: [
      {
        nom: "L’arrivée en Arctique",
        objets: [{ x: 91, y: 35, nom: "les sommets enneigés" }, { x: 17, y: 65, nom: "la caisse métallique" }],
        passage: { x: 14, y: 25, nom: "la porte ouverte de la station, vers la salle des capteurs" },
      },
      {
        nom: "La salle des capteurs",
        objets: [{ x: 16, y: 52, nom: "la console des capteurs" }, { x: 86, y: 30, nom: "les ordinateurs allumés" }],
        passage: { x: 60, y: 68, nom: "la trappe ouverte dans le plancher, vers la soute du câble" },
      },
      {
        nom: "La soute du câble",
        objets: [{ x: 19, y: 61, nom: "le journal de bord" }, { x: 78, y: 80, nom: "le câble débranché" }],
        passage: { x: 63, y: 30, nom: "l’escalier métallique remontant vers les écrans" },
      },
    ],
  },
  'escape-anglais-lycee|TERMINALE_PRO': {
    objets: [
      { x: 41, y: 15, nom: "le feu rouge" },
      { x: 25, y: 55, nom: "le boîtier électrique" },
      { x: 85, y: 40, nom: "le train à quai" },
      { x: 37, y: 88, nom: "le tournevis rouge" },
      { x: 10, y: 22, nom: "la vieille armoire métallique" },
      { x: 72, y: 64, nom: "la voie ferrée" },
    ],
    porte: { x: 60, y: 36, nom: "la passerelle au loin" },
    salles: [
      {
        nom: "Le quai 3",
        objets: [{ x: 41, y: 15, nom: "le feu rouge" }, { x: 25, y: 55, nom: "le boîtier électrique" }],
        passage: { x: 27, y: 30, nom: "le local technique au bout du quai" },
      },
      {
        nom: "Le local technique du quai",
        objets: [{ x: 16, y: 58, nom: "le haut-parleur d’annonces" }, { x: 92, y: 60, nom: "la boîte à outils ouverte" }],
        passage: { x: 71, y: 40, nom: "l’escalier de la passerelle" },
      },
      {
        nom: "La passerelle au couchant",
        objets: [{ x: 16, y: 58, nom: "le gilet de sécurité orange" }, { x: 93, y: 62, nom: "le signal au bout du quai" }],
        passage: { x: 80, y: 22, nom: "l’escalier descendant vers le train" },
      },
    ],
  },
  'escape-anglais-lycee|TERMINALE_TECHNO': {
    objets: [
      { x: 49, y: 19, nom: "le dôme de Saint-Paul" },
      { x: 20, y: 22, nom: "l’abri du tram" },
      { x: 28, y: 10, nom: "le feu de signalisation" },
      { x: 65, y: 17, nom: "la tour du Shard" },
      { x: 22, y: 50, nom: "la borne lumineuse" },
      { x: 30, y: 80, nom: "le boîtier ouvert" },
    ],
    porte: { x: 56, y: 42, nom: "la voie du tram" },
    salles: [
      {
        nom: "L’arrêt de tram éteint",
        objets: [{ x: 49, y: 19, nom: "le dôme de Saint-Paul" }, { x: 20, y: 22, nom: "l’abri du tram" }],
        passage: { x: 8, y: 14, nom: "l’immeuble de verre de l’entreprise, vers la salle de contrôle" },
      },
      {
        nom: "La salle de contrôle",
        objets: [{ x: 22, y: 66, nom: "le poste de l’opérateur" }, { x: 85, y: 30, nom: "la baie vitrée sur le Shard" }],
        passage: { x: 50, y: 40, nom: "la porte de l’escalier de service, vers le boîtier de jonction 12" },
      },
      {
        nom: "Le boîtier de jonction 12",
        objets: [{ x: 20, y: 68, nom: "la radio de chantier" }, { x: 92, y: 38, nom: "le boîtier de jonction ouvert" }],
        passage: { x: 62, y: 36, nom: "la rampe remontant vers la voie du tram" },
      },
    ],
  },
  'escape-anglais|CINQUIEME': {
    objets: [
      { x: 34, y: 25, nom: "la tour de gauche" },
      { x: 16, y: 47, nom: "la jarre en terre" },
      { x: 44, y: 62, nom: "le muret de pierres" },
      { x: 10, y: 68, nom: "la lanterne" },
      { x: 60, y: 19, nom: "la fenêtre éclairée" },
      { x: 63, y: 80, nom: "la grande pierre grise" },
    ],
    porte: { x: 8, y: 25, nom: "l’arche en ruine" },
    salles: [
      {
        nom: "Les abords du château",
        objets: [{ x: 34, y: 25, nom: "la tour de gauche" }, { x: 16, y: 47, nom: "la jarre en terre" }],
        passage: { x: 8, y: 25, nom: "l’arche en ruine, vers la cuisine du château" },
      },
      {
        nom: "La cuisine du château",
        objets: [{ x: 10, y: 42, nom: "le chandelier éteint" }, { x: 86, y: 80, nom: "le billet sur la table" }],
        passage: { x: 59, y: 32, nom: "l’escalier de pierre en colimaçon, au fond, vers la chambre haute de la tour" },
      },
      {
        nom: "La chambre haute de la tour",
        objets: [{ x: 16, y: 25, nom: "la carte des trois tours" }, { x: 89, y: 42, nom: "la vieille horloge" }],
        passage: { x: 71, y: 60, nom: "la porte basse et l’escalier qui descend vers le lac" },
      },
    ],
  },
  'escape-anglais|QUATRIEME': {
    objets: [
      { x: 13, y: 57, nom: "le cadre vide" },
      { x: 26, y: 19, nom: "la lampe du hangar" },
      { x: 38, y: 66, nom: "la caisse à roulettes" },
      { x: 66, y: 48, nom: "le réverbère" },
      { x: 86, y: 30, nom: "le gratte-ciel illuminé" },
      { x: 89, y: 80, nom: "les bittes d’amarrage" },
    ],
    porte: { x: 25, y: 50, nom: "l’entrée de l’entrepôt" },
    salles: [
      {
        nom: "La salle du tableau volé",
        objets: [{ x: 15, y: 26, nom: "le cadre vide" }, { x: 78, y: 68, nom: "la lampe torche du gardien" }],
        passage: { x: 69, y: 28, nom: "la fenêtre brisée qui donne sur la ruelle" },
      },
      {
        nom: "La ruelle enneigée",
        objets: [{ x: 12, y: 11, nom: "la caméra de sécurité" }, { x: 86, y: 82, nom: "les empreintes dans la neige" }],
        passage: { x: 72, y: 53, nom: "l’escalier du métro au coin de la rue" },
      },
      {
        nom: "Le quai du métro",
        objets: [{ x: 16, y: 69, nom: "le journal sur le banc" }, { x: 92, y: 60, nom: "le téléphone allumé" }],
        passage: { x: 32, y: 36, nom: "l’escalier de sortie vers les quais de l’Hudson" },
      },
    ],
  },
  'escape-anglais|SIXIEME': {
    objets: [
      { x: 13, y: 50, nom: "la cabine téléphonique rouge" },
      { x: 23, y: 10, nom: "le grand réverbère" },
      { x: 72, y: 80, nom: "la grille du quai" },
      { x: 57, y: 42, nom: "le Parlement" },
      { x: 78, y: 28, nom: "la tour de Big Ben" },
      { x: 25, y: 81, nom: "le petit coffre" },
    ],
    porte: { x: 47, y: 55, nom: "le pont de Westminster" },
    salles: [
      {
        nom: "La rue de King’s Cross",
        objets: [{ x: 13, y: 50, nom: "la cabine téléphonique rouge" }, { x: 23, y: 10, nom: "le grand réverbère" }],
        passage: { x: 32, y: 60, nom: "la promenade vers le musée" },
      },
      {
        nom: "Le grand hall du musée",
        objets: [{ x: 10, y: 51, nom: "l’uniforme du garde royal" }, { x: 46, y: 42, nom: "le squelette de dinosaure" }],
        passage: { x: 89, y: 57, nom: "la porte à battants vers la boutique du musée, à droite" },
      },
      {
        nom: "La boutique du musée",
        objets: [{ x: 17, y: 76, nom: "le comptoir de la boutique" }, { x: 91, y: 53, nom: "la vieille carte postale" }],
        passage: { x: 69, y: 38, nom: "la porte vitrée du fond, ouverte sur Big Ben illuminé" },
      },
    ],
  },
  'escape-anglais|TROISIEME': {
    objets: [
      { x: 24, y: 21, nom: "le vaisseau à l’écran" },
      { x: 24, y: 69, nom: "l’écran de gauche" },
      { x: 46, y: 77, nom: "l’écran du milieu" },
      { x: 78, y: 36, nom: "la fusée sur son pas de tir" },
      { x: 87, y: 67, nom: "les écrans de droite" },
      { x: 39, y: 20, nom: "la lune" },
    ],
    porte: { x: 60, y: 22, nom: "la baie vitrée" },
    salles: [
      {
        nom: "La salle de contrôle",
        objets: [{ x: 46, y: 23, nom: "le vaisseau à l’écran" }, { x: 29, y: 26, nom: "l’écran de gauche" }],
        passage: { x: 10, y: 45, nom: "la porte vitrée de la salle de briefing" },
      },
      {
        nom: "La salle de briefing",
        objets: [{ x: 14, y: 58, nom: "le poste radio" }, { x: 89, y: 29, nom: "le tableau des deux plans" }],
        passage: { x: 69, y: 33, nom: "la passerelle vitrée vers la salle de presse" },
      },
      {
        nom: "La salle de presse",
        objets: [{ x: 21, y: 76, nom: "la pile de journaux" }, { x: 86, y: 51, nom: "le télex du dernier message" }],
        passage: { x: 31, y: 33, nom: "la porte vitrée ouverte sur l’aube de Houston" },
      },
    ],
  },
  'escape-francais-lycee|PREMIERE': {
    objets: [
      { x: 42, y: 62, nom: "la malle aux serrures" },
      { x: 16, y: 52, nom: "le buffet sculpté" },
      { x: 13, y: 30, nom: "la sphère armillaire" },
      { x: 91, y: 45, nom: "les plumes d’écrivain" },
      { x: 74, y: 52, nom: "le fauteuil" },
      { x: 45, y: 22, nom: "l’oranger" },
    ],
    porte: { x: 64, y: 25, nom: "la porte-fenêtre" },
    salles: [
      {
        nom: "Le salon de l’écrivain",
        objets: [{ x: 49, y: 67, nom: "la malle aux serrures" }, { x: 7, y: 66, nom: "le buffet sculpté" }],
        passage: { x: 86, y: 45, nom: "la porte du cabinet de travail" },
      },
      {
        nom: "Le cabinet de travail",
        objets: [{ x: 12, y: 62, nom: "le pupitre à écrire" }, { x: 90, y: 50, nom: "le brouillon raturé" }],
        passage: { x: 72, y: 30, nom: "l'escalier de bois vers le grenier" },
      },
      {
        nom: "Le grenier des manuscrits",
        objets: [{ x: 22, y: 68, nom: "le manuscrit de théâtre" }, { x: 88, y: 40, nom: "la bibliothèque du grenier" }],
        passage: { x: 47, y: 12, nom: "la lucarne ouverte sur le jardin" },
      },
    ],
  },
  'escape-francais-lycee|PREMIERE_TECHNO': {
    objets: [
      { x: 26, y: 82, nom: "le pupitre de commande" },
      { x: 12, y: 67, nom: "la lampe orange" },
      { x: 56, y: 37, nom: "le grand rouleau de papier" },
      { x: 73, y: 55, nom: "la colonne de la rotative" },
      { x: 19, y: 15, nom: "la fenêtre au clair de lune" },
      { x: 47, y: 63, nom: "le rouleau du bas" },
    ],
    porte: { x: 24, y: 62, nom: "l’escalier métallique" },
    salles: [
      {
        nom: "Le hall de la rotative",
        objets: [{ x: 26, y: 82, nom: "le pupitre de commande" }, { x: 12, y: 67, nom: "la lampe orange" }],
        passage: { x: 24, y: 62, nom: "l’escalier métallique, vers la salle de rédaction" },
      },
      {
        nom: "La salle de rédaction",
        objets: [{ x: 25, y: 68, nom: "le bureau du rédacteur en chef" }, { x: 83, y: 82, nom: "la machine à écrire" }],
        passage: { x: 80, y: 25, nom: "le monte-charge de fer au fond, vers l'atelier de composition" },
      },
      {
        nom: "L'atelier de composition",
        objets: [{ x: 15, y: 25, nom: "le casier des petites annonces" }, { x: 85, y: 78, nom: "la casse typographique" }],
        passage: { x: 73, y: 35, nom: "la porte de livraison entrouverte sur la rue" },
      },
    ],
  },
  'escape-francais-lycee|SECONDE': {
    objets: [
      { x: 43, y: 71, nom: "le pupitre éclairé" },
      { x: 10, y: 30, nom: "le grand rideau rouge" },
      { x: 44, y: 18, nom: "la sphère dorée" },
      { x: 29, y: 75, nom: "le fauteuil rouge" },
      { x: 90, y: 78, nom: "la grande malle" },
      { x: 74, y: 25, nom: "l’étoile dorée" },
    ],
    porte: { x: 64, y: 35, nom: "l’escalier de scène" },
    salles: [
      {
        nom: "La scène et les coulisses",
        objets: [{ x: 43, y: 71, nom: "le pupitre éclairé" }, { x: 10, y: 30, nom: "le grand rideau rouge" }],
        passage: { x: 64, y: 35, nom: "l’escalier de scène, vers le foyer des artistes" },
      },
      {
        nom: "Le foyer des artistes",
        objets: [{ x: 20, y: 20, nom: "la galerie de portraits" }, { x: 85, y: 60, nom: "le pupitre du metteur en scène" }],
        passage: { x: 57, y: 30, nom: "la porte vitrée vers l'escalier de la régie" },
      },
      {
        nom: "La cabine de régie",
        objets: [{ x: 15, y: 68, nom: "le carnet de la régie" }, { x: 53, y: 12, nom: "la devise gravée" }],
        passage: { x: 88, y: 48, nom: "l'escalier de fer vers la salle et la sortie" },
      },
    ],
  },
  'escape-francais|CINQUIEME': {
    objets: [
      { x: 29, y: 18, nom: "la bannière de gauche" },
      { x: 53, y: 59, nom: "l’autel doré" },
      { x: 93, y: 60, nom: "le bouclier fleurdelisé" },
      { x: 20, y: 65, nom: "le coffre en bois" },
      { x: 87, y: 30, nom: "l’étagère aux vases" },
      { x: 40, y: 27, nom: "le grand vitrail" },
    ],
    porte: { x: 62, y: 28, nom: "l’arcade du fond" },
    salles: [
      {
        nom: "La chapelle du manuscrit",
        objets: [{ x: 12, y: 44, nom: "la bannière de gauche" }, { x: 42, y: 58, nom: "l’autel doré" }],
        passage: { x: 84, y: 50, nom: "la porte latérale, vers la salle d’armes" },
      },
      {
        nom: "La salle d’armes",
        objets: [{ x: 19, y: 56, nom: "l’écu aux armes du roi" }, { x: 84, y: 53, nom: "la couronne sur son coussin" }],
        passage: { x: 41, y: 38, nom: "la porte cloutée à ferrures vers l’escalier de la tour" },
      },
      {
        nom: "Le sommet de la tour",
        objets: [{ x: 14, y: 32, nom: "la cloche de la tour" }, { x: 89, y: 51, nom: "l’enluminure dorée" }],
        passage: { x: 56, y: 71, nom: "l’escalier qui redescend vers la cour aux torches" },
      },
    ],
  },
  'escape-francais|QUATRIEME': {
    objets: [
      { x: 43, y: 62, nom: "le coffre aux cadenas" },
      { x: 15, y: 62, nom: "la cage à oiseaux" },
      { x: 42, y: 27, nom: "la lanterne suspendue" },
      { x: 79, y: 42, nom: "le grand miroir" },
      { x: 14, y: 22, nom: "la lucarne" },
      { x: 47, y: 43, nom: "l’urne en laiton" },
    ],
    porte: { x: 66, y: 33, nom: "la fenêtre ronde" },
    salles: [
      {
        nom: "Le grenier",
        objets: [{ x: 43, y: 62, nom: "le coffre aux cadenas" }, { x: 15, y: 62, nom: "la cage à oiseaux" }],
        passage: { x: 88, y: 90, nom: "la trappe de l’escalier, dans le plancher, vers la chambre de la grand-tante" },
      },
      {
        nom: "La chambre de la grand-tante",
        objets: [{ x: 14, y: 71, nom: "la page recollée" }, { x: 33, y: 72, nom: "la plume et l’encrier" }],
        passage: { x: 57, y: 38, nom: "la porte entrouverte vers le salon aux portraits" },
      },
      {
        nom: "Le salon aux portraits",
        objets: [{ x: 16, y: 16, nom: "le portrait des deux sœurs" }, { x: 82, y: 67, nom: "la boîte de jeu aux couleurs" }],
        passage: { x: 77, y: 32, nom: "le vieux miroir ovale entrouvert comme une porte, au fond" },
      },
    ],
  },
  'escape-francais|SIXIEME': {
    objets: [
      { x: 10, y: 38, nom: "l’étagère de gauche" },
      { x: 16, y: 74, nom: "la grande table de lecture" },
      { x: 88, y: 40, nom: "l’étagère de droite" },
      { x: 50, y: 28, nom: "le grand vitrail" },
      { x: 88, y: 77, nom: "la table de droite" },
      { x: 19, y: 15, nom: "la bannière violette" },
    ],
    porte: { x: 70, y: 60, nom: "la grande porte ouverte" },
    salles: [
      {
        nom: "La salle de lecture",
        objets: [{ x: 10, y: 38, nom: "l’étagère de gauche" }, { x: 16, y: 74, nom: "la grande table de lecture" }],
        passage: { x: 70, y: 60, nom: "la grande porte ouverte, vers la réserve des dictionnaires" },
      },
      {
        nom: "La réserve des dictionnaires",
        objets: [{ x: 14, y: 38, nom: "le dictionnaire qui brille" }, { x: 84, y: 48, nom: "la guirlande de lettres lumineuses" }],
        passage: { x: 53, y: 42, nom: "l’escalier en colimaçon de fer forgé vers la loge du gardien" },
      },
      {
        nom: "La loge du gardien",
        objets: [{ x: 27, y: 80, nom: "le registre du gardien" }, { x: 82, y: 42, nom: "le médaillon gravé de la grande porte" }],
        passage: { x: 91, y: 67, nom: "la grande porte de chêne, sortie de la bibliothèque" },
      },
    ],
  },
  'escape-francais|TROISIEME': {
    objets: [
      { x: 9, y: 67, nom: "le banc de velours" },
      { x: 21, y: 47, nom: "le vase sur colonne" },
      { x: 60, y: 35, nom: "le grand cadre vide" },
      { x: 64, y: 72, nom: "le cordon rouge" },
      { x: 8, y: 30, nom: "la grande fenêtre" },
      { x: 86, y: 11, nom: "le cadre du haut" },
    ],
    porte: { x: 83, y: 50, nom: "la porte ouverte" },
    salles: [
      {
        nom: "La galerie du tableau",
        objets: [{ x: 9, y: 67, nom: "le banc de velours" }, { x: 21, y: 47, nom: "le vase sur colonne" }],
        passage: { x: 83, y: 50, nom: "la porte ouverte, vers le bureau du commissaire" },
      },
      {
        nom: "Le bureau du commissaire",
        objets: [{ x: 19, y: 36, nom: "le tableau d’affichage épinglé" }, { x: 79, y: 60, nom: "le magnétophone des témoins" }],
        passage: { x: 86, y: 34, nom: "le couloir de service vers les réserves du musée" },
      },
      {
        nom: "Les réserves du musée",
        objets: [{ x: 20, y: 65, nom: "la machine à écrire du procès-verbal" }, { x: 88, y: 67, nom: "le dossier scellé du rapport" }],
        passage: { x: 74, y: 41, nom: "la porte de sortie entrouverte sur le parvis du musée" },
      },
    ],
  },
  'escape-histoire-geo-lycee|PREMIERE': {
    objets: [
      { x: 6, y: 80, nom: "la boîte en fer" },
      { x: 18, y: 13, nom: "la lanterne" },
      { x: 55, y: 35, nom: "le boîtier de signal" },
      { x: 42, y: 58, nom: "les leviers rouges" },
      { x: 82, y: 45, nom: "le train au loin" },
      { x: 21, y: 86, nom: "le pupitre au jeton" },
    ],
    porte: { x: 76, y: 63, nom: "le garde-corps du balcon" },
    salles: [
      {
        nom: "Le poste d'aiguillage",
        objets: [{ x: 6, y: 80, nom: "la boîte en fer" }, { x: 18, y: 13, nom: "la lanterne" }],
        passage: { x: 76, y: 63, nom: "le balcon et son escalier, vers le bureau du chef de gare" },
      },
      {
        nom: "Le bureau du chef de gare",
        objets: [{ x: 16, y: 22, nom: "le cadre photographique" }, { x: 80, y: 72, nom: "la pile de journaux reliés" }],
        passage: { x: 68, y: 40, nom: "la porte vitrée, vers le wagon de l'enquête" },
      },
      {
        nom: "Le wagon de l'enquête",
        objets: [{ x: 17, y: 70, nom: "le journal sur la banquette" }, { x: 82, y: 78, nom: "le dossier de l'historienne" }],
        passage: { x: 71, y: 38, nom: "la porte du wagon ouverte sur le quai" },
      },
    ],
  },
  'escape-histoire-geo-lycee|PREMIERE_PRO': {
    objets: [
      { x: 82, y: 60, nom: "la péniche" },
      { x: 30, y: 54, nom: "le vase bleu et blanc" },
      { x: 23, y: 38, nom: "l’amphore orange" },
      { x: 92, y: 45, nom: "le pont de pierre" },
      { x: 53, y: 42, nom: "le train de conteneurs" },
      { x: 66, y: 23, nom: "le conteneur suspendu" },
    ],
    porte: { x: 23, y: 10, nom: "l’arche de pierre" },
    salles: [
      {
        nom: "Le quai du musée",
        objets: [{ x: 82, y: 60, nom: "la péniche" }, { x: 30, y: 54, nom: "le vase bleu et blanc" }],
        passage: { x: 23, y: 10, nom: "l’arche de pierre, vers la salle d'exposition" },
      },
      {
        nom: "La salle d'exposition",
        objets: [{ x: 14, y: 62, nom: "la chemise rouge pliée" }, { x: 90, y: 55, nom: "le tableau des cloches sur le chevalet" }],
        passage: { x: 68, y: 40, nom: "la porte coulissante vers le terminal à conteneurs" },
      },
      {
        nom: "Le poste de contrôle du terminal",
        objets: [{ x: 28, y: 55, nom: "le pupitre de commande du portique" }, { x: 88, y: 75, nom: "la boîte de monnaie du docker" }],
        passage: { x: 70, y: 62, nom: "la passerelle métallique vers le quai" },
      },
    ],
  },
  'escape-histoire-geo-lycee|PREMIERE_TECHNO': {
    objets: [
      { x: 29, y: 27, nom: "la caisse suspendue" },
      { x: 50, y: 24, nom: "la cabine de la grue" },
      { x: 35, y: 50, nom: "le wagon de bois" },
      { x: 60, y: 53, nom: "le chariot de charbon" },
      { x: 80, y: 40, nom: "la grande roue dentée" },
      { x: 77, y: 78, nom: "les grosses chaînes" },
    ],
    porte: { x: 69, y: 42, nom: "la porte de l’entrepôt" },
    salles: [
      {
        nom: "Les quais sous la grue",
        objets: [{ x: 29, y: 27, nom: "la caisse suspendue" }, { x: 50, y: 24, nom: "la cabine de la grue" }],
        passage: { x: 69, y: 42, nom: "la porte de l’entrepôt" },
      },
      {
        nom: "L'entrepôt de brique",
        objets: [{ x: 13, y: 65, nom: "la chaîne brisée" }, { x: 78, y: 78, nom: "le plan déroulé" }],
        passage: { x: 50, y: 32, nom: "l'escalier de fer vers la passerelle du vapeur" },
      },
      {
        nom: "La timonerie du vapeur",
        objets: [{ x: 10, y: 62, nom: "le journal du crieur" }, { x: 78, y: 68, nom: "la carte des routes" }],
        passage: { x: 62, y: 55, nom: "la passerelle de débarquement vers le quai" },
      },
    ],
  },
  'escape-histoire-geo-lycee|SECONDE': {
    objets: [
      { x: 12, y: 52, nom: "la grande amphore" },
      { x: 94, y: 42, nom: "le ballot de cordes" },
      { x: 37, y: 22, nom: "la sphère armillaire" },
      { x: 42, y: 58, nom: "le coffre cerclé" },
      { x: 60, y: 71, nom: "la longue-vue" },
      { x: 52, y: 18, nom: "la rose des vents" },
    ],
    porte: { x: 78, y: 36, nom: "la fenêtre sur le port" },
    salles: [
      {
        nom: "La salle de veille",
        objets: [{ x: 12, y: 52, nom: "la grande amphore" }, { x: 94, y: 42, nom: "le ballot de cordes" }],
        passage: { x: 78, y: 36, nom: "le balcon ouvert sur le port, vers la bibliothèque de la gardienne" },
      },
      {
        nom: "La bibliothèque de la gardienne",
        objets: [{ x: 12, y: 48, nom: "le lutrin au feuillet" }, { x: 82, y: 82, nom: "le parchemin scellé" }],
        passage: { x: 67, y: 45, nom: "l'escalier en colimaçon vers la lanterne" },
      },
      {
        nom: "La lanterne du phare",
        objets: [{ x: 27, y: 52, nom: "la longue-vue de cuivre" }, { x: 91, y: 58, nom: "le graphique aux deux courbes" }],
        passage: { x: 72, y: 45, nom: "la porte ouverte sur la galerie extérieure" },
      },
    ],
  },
  'escape-histoire-geo-lycee|SECONDE_PRO': {
    objets: [
      { x: 91, y: 30, nom: "les amphores" },
      { x: 89, y: 78, nom: "le panier de poivre" },
      { x: 12, y: 40, nom: "les voiliers du port" },
      { x: 74, y: 86, nom: "le cageot de fèves" },
      { x: 30, y: 72, nom: "la charrette de ballots" },
      { x: 64, y: 15, nom: "le vieil aqueduc" },
    ],
    porte: { x: 47, y: 60, nom: "l’escalier de pierre" },
    salles: [
      {
        nom: "L'entrepôt du marchand",
        objets: [{ x: 91, y: 30, nom: "les amphores" }, { x: 89, y: 78, nom: "le panier de poivre" }],
        passage: { x: 47, y: 60, nom: "l’escalier de pierre, vers la cale du voilier" },
      },
      {
        nom: "La cale du voilier",
        objets: [{ x: 22, y: 55, nom: "le rouleau de soie" }, { x: 82, y: 75, nom: "le sac de fèves de cacao" }],
        passage: { x: 68, y: 35, nom: "l'échelle, vers la capitainerie de la jetée" },
      },
      {
        nom: "La capitainerie de la jetée",
        objets: [{ x: 18, y: 65, nom: "la liasse de lettres" }, { x: 85, y: 78, nom: "la carte marine du port" }],
        passage: { x: 57, y: 45, nom: "la porte vitrée ouverte sur la jetée" },
      },
    ],
  },
  'escape-histoire-geo-lycee|TERMINALE': {
    objets: [
      { x: 8, y: 38, nom: "le touret de câbles" },
      { x: 58, y: 32, nom: "le cargo" },
      { x: 36, y: 86, nom: "la bitte d’amarrage" },
      { x: 94, y: 28, nom: "les grues du port" },
      { x: 31, y: 16, nom: "le pylône" },
      { x: 80, y: 52, nom: "le câble flottant" },
    ],
    porte: { x: 22, y: 38, nom: "la porte de la station" },
    salles: [
      {
        nom: "La plage des câbles",
        objets: [{ x: 8, y: 38, nom: "le touret de câbles" }, { x: 58, y: 32, nom: "le cargo" }],
        passage: { x: 22, y: 38, nom: "la porte de la station, vers la salle des archives" },
      },
      {
        nom: "La salle des archives",
        objets: [{ x: 12, y: 27, nom: "l'écran des archives" }, { x: 70, y: 80, nom: "le classeur des dépêches" }],
        passage: { x: 68, y: 33, nom: "la porte blindée vers la salle de contrôle" },
      },
      {
        nom: "La salle de contrôle",
        objets: [{ x: 20, y: 55, nom: "le téléscripteur" }, { x: 85, y: 22, nom: "la carte lumineuse des routes" }],
        passage: { x: 61, y: 30, nom: "la porte de la station ouverte sur l'extérieur" },
      },
    ],
  },
  'escape-histoire-geo-lycee|TERMINALE_PRO': {
    objets: [
      { x: 57, y: 25, nom: "la raffinerie" },
      { x: 10, y: 48, nom: "la table d’orientation" },
      { x: 31, y: 34, nom: "l’appareil sur trépied" },
      { x: 84, y: 27, nom: "le port aux grues" },
      { x: 51, y: 75, nom: "le bac de terre brune" },
      { x: 78, y: 57, nom: "le viaduc de l’autoroute" },
    ],
    porte: { x: 12, y: 22, nom: "l’abri en bois" },
    salles: [
      {
        nom: "Le belvédère",
        objets: [{ x: 57, y: 25, nom: "la raffinerie" }, { x: 10, y: 48, nom: "la table d’orientation" }],
        passage: { x: 40, y: 62, nom: "le sentier qui descend, vers la salle du conseil" },
      },
      {
        nom: "La salle du conseil",
        objets: [{ x: 27, y: 18, nom: "le portrait officiel" }, { x: 82, y: 75, nom: "la maquette du port" }],
        passage: { x: 75, y: 32, nom: "la porte-fenêtre vers l'escalier du bureau d'études" },
      },
      {
        nom: "Le laboratoire du bureau d'études",
        objets: [{ x: 25, y: 58, nom: "les bacs de sable" }, { x: 85, y: 35, nom: "la carte marine" }],
        passage: { x: 57, y: 35, nom: "la porte vitrée vers la terrasse" },
      },
    ],
  },
  'escape-histoire-geo-lycee|TERMINALE_TECHNO': {
    objets: [
      { x: 30, y: 48, nom: "la vanne de gauche" },
      { x: 48, y: 36, nom: "la passerelle de l’écluse" },
      { x: 46, y: 62, nom: "la chute d’eau" },
      { x: 65, y: 44, nom: "le treuil rouge" },
      { x: 90, y: 52, nom: "la grande roue rouge" },
      { x: 61, y: 23, nom: "le pont au loin" },
    ],
    porte: { x: 13, y: 28, nom: "la porte fortifiée" },
    salles: [
      {
        nom: "Le barrage frontière",
        objets: [{ x: 30, y: 48, nom: "la vanne de gauche" }, { x: 48, y: 36, nom: "la passerelle de l’écluse" }],
        passage: { x: 13, y: 28, nom: "la porte fortifiée, vers la maison de l'éclusier" },
      },
      {
        nom: "La maison de l'éclusier",
        objets: [{ x: 32, y: 22, nom: "la photographie encadrée" }, { x: 90, y: 55, nom: "la coupure de presse épinglée" }],
        passage: { x: 66, y: 42, nom: "la porte basse vers le couloir du poste de douane" },
      },
      {
        nom: "La salle des douanes",
        objets: [{ x: 18, y: 72, nom: "le journal plié" }, { x: 83, y: 45, nom: "la lunette vers le viaduc" }],
        passage: { x: 37, y: 22, nom: "la porte fortifiée ouverte sur l'autre rive" },
      },
    ],
  },
  'escape-histoire-geo|CINQUIEME': {
    objets: [
      { x: 64, y: 64, nom: "le globe terrestre" },
      { x: 11, y: 73, nom: "le grand coffre cerclé" },
      { x: 6, y: 21, nom: "les pots de l’étagère" },
      { x: 19, y: 12, nom: "la lanterne suspendue" },
      { x: 71, y: 88, nom: "la boussole" },
      { x: 80, y: 35, nom: "les voiliers" },
    ],
    porte: { x: 15, y: 42, nom: "l’arche du couloir" },
    salles: [
      {
        nom: "Le scriptorium",
        objets: [{ x: 16, y: 47, nom: "la carte sur le pupitre" }, { x: 86, y: 71, nom: "le grand coffre cerclé de fer" }],
        passage: { x: 71, y: 33, nom: "l’arche ouverte sur le cloître" },
      },
      {
        nom: "Le cloître",
        objets: [{ x: 40, y: 36, nom: "la tapisserie de l’hommage" }, { x: 93, y: 48, nom: "les rouleaux de drap" }],
        passage: { x: 74, y: 55, nom: "la porte basse de pierre vers la crypte" },
      },
      {
        nom: "La crypte des reliques",
        objets: [{ x: 7, y: 38, nom: "l’étendard aux fleurs de lys" }, { x: 86, y: 47, nom: "la carte de la cité sur le lac" }],
        passage: { x: 61, y: 48, nom: "l’escalier de pierre vers le jardin de l’abbaye" },
      },
    ],
  },
  'escape-histoire-geo|QUATRIEME': {
    objets: [
      { x: 6, y: 53, nom: "le globe de gauche" },
      { x: 33, y: 40, nom: "l’armoire de chêne" },
      { x: 11, y: 28, nom: "le chandelier" },
      { x: 76, y: 42, nom: "la vue des usines" },
      { x: 90, y: 14, nom: "le drapeau tricolore" },
      { x: 82, y: 80, nom: "le bureau de droite" },
    ],
    porte: { x: 56, y: 42, nom: "la porte-fenêtre en arche" },
    salles: [
      {
        nom: "La salle de lecture des Archives",
        objets: [{ x: 10, y: 51, nom: "le globe de gauche" }, { x: 48, y: 42, nom: "l’armoire de chêne" }],
        passage: { x: 83, y: 40, nom: "la double porte de la salle des cartes" },
      },
      {
        nom: "La salle des cartes",
        objets: [{ x: 19, y: 38, nom: "la gravure de la Bastille" }, { x: 79, y: 71, nom: "la carte des mines" }],
        passage: { x: 64, y: 28, nom: "l’escalier de fer en spirale, vers la réserve des journaux" },
      },
      {
        nom: "La réserve des journaux",
        objets: [{ x: 14, y: 29, nom: "l’affiche de 1870" }, { x: 85, y: 66, nom: "le journal de 1898" }],
        passage: { x: 68, y: 38, nom: "la porte cochère entrouverte sur la cour pavée" },
      },
    ],
  },
  'escape-histoire-geo|SIXIEME': {
    objets: [
      { x: 8, y: 63, nom: "la vitrine des outils de pierre" },
      { x: 15, y: 35, nom: "la peinture rupestre" },
      { x: 61, y: 54, nom: "la vitrine aux amphores" },
      { x: 68, y: 30, nom: "la grande colonne" },
      { x: 36, y: 42, nom: "l’olivier" },
      { x: 86, y: 11, nom: "la rosace du plafond" },
    ],
    porte: { x: 86, y: 52, nom: "l’arche du fond" },
    salles: [
      {
        nom: "La galerie des origines",
        objets: [{ x: 8, y: 63, nom: "la vitrine des outils de pierre" }, { x: 15, y: 35, nom: "la peinture rupestre" }],
        passage: { x: 86, y: 52, nom: "l’arche du fond, vers la galerie antique" },
      },
      {
        nom: "La galerie antique",
        objets: [{ x: 19, y: 29, nom: "la maquette de l’Acropole" }, { x: 75, y: 71, nom: "la maquette de Rome" }],
        passage: { x: 70, y: 28, nom: "l’arche de marbre sculptée vers la rotonde" },
      },
      {
        nom: "La rotonde de la sortie",
        objets: [{ x: 24, y: 33, nom: "la statue de Jupiter" }, { x: 88, y: 53, nom: "le globe lumineux" }],
        passage: { x: 63, y: 53, nom: "la grande porte de bronze du musée, entrouverte" },
      },
    ],
  },
  'escape-histoire-geo|TROISIEME': {
    objets: [
      { x: 14, y: 48, nom: "la grande vitrine de gauche" },
      { x: 24, y: 56, nom: "la petite vitrine de gauche" },
      { x: 40, y: 53, nom: "la vitrine près de l’arche" },
      { x: 62, y: 53, nom: "la vitrine sous l’arche" },
      { x: 79, y: 55, nom: "la petite vitrine de droite" },
      { x: 94, y: 55, nom: "la grande vitrine de droite" },
    ],
    porte: { x: 52, y: 30, nom: "l’arche" },
    salles: [
      {
        nom: "La galerie des vitrines",
        objets: [{ x: 25, y: 60, nom: "la grande vitrine de gauche" }, { x: 8, y: 40, nom: "la petite vitrine de gauche" }],
        passage: { x: 74, y: 33, nom: "la porte dérobée, vers la chambre clandestine" },
      },
      {
        nom: "La chambre clandestine",
        objets: [{ x: 11, y: 42, nom: "le vieux poste de radio" }, { x: 88, y: 43, nom: "la presse clandestine" }],
        passage: { x: 64, y: 33, nom: "le couloir sombre vers la salle de la réconciliation" },
      },
      {
        nom: "La salle de la réconciliation",
        objets: [{ x: 22, y: 24, nom: "la photographie de Verdun" }, { x: 86, y: 70, nom: "le drapeau rouge plié" }],
        passage: { x: 75, y: 33, nom: "la porte vitrée ouverte sur l’esplanade aux drapeaux" },
      },
    ],
  },
  'escape-maths-lycee|PREMIERE': {
    objets: [
      { x: 52, y: 10, nom: "les panneaux solaires" },
      { x: 22, y: 42, nom: "la Terre" },
      { x: 55, y: 26, nom: "le grand bras métallique" },
      { x: 57, y: 45, nom: "les deux bonbonnes" },
      { x: 91, y: 50, nom: "la trappe ronde" },
      { x: 93, y: 84, nom: "le réservoir en bas" },
    ],
    porte: { x: 75, y: 52, nom: "le sas lumineux" },
    salles: [
      {
        nom: "Le module d'observation",
        objets: [{ x: 52, y: 10, nom: "les panneaux solaires" }, { x: 22, y: 42, nom: "la Terre" }],
        passage: { x: 75, y: 52, nom: "le sas lumineux, vers la coursive technique" },
      },
      {
        nom: "La coursive technique",
        objets: [{ x: 20, y: 32, nom: "la console du moteur" }, { x: 90, y: 55, nom: "les réserves d'oxygène" }],
        passage: { x: 62, y: 40, nom: "le sas rond vers le module de commande" },
      },
      {
        nom: "Le module de commande",
        objets: [{ x: 27, y: 37, nom: "les combinaisons spatiales" }, { x: 85, y: 62, nom: "le tableau des moteurs" }],
        passage: { x: 46, y: 37, nom: "le sas lumineux vers les moteurs" },
      },
    ],
  },
  'escape-maths-lycee|SECONDE': {
    objets: [
      { x: 10, y: 60, nom: "la grande baie de gauche" },
      { x: 23, y: 40, nom: "la baie rouge et bleue" },
      { x: 38, y: 32, nom: "la baie rouge du fond" },
      { x: 62, y: 32, nom: "la baie bleue du fond" },
      { x: 77, y: 40, nom: "la baie rouge de droite" },
      { x: 89, y: 60, nom: "la grande baie de droite" },
    ],
    porte: { x: 50, y: 85, nom: "la passerelle d’entrée" },
    salles: [
      {
        nom: "La salle des baies",
        objets: [{ x: 10, y: 60, nom: "la grande baie de gauche" }, { x: 23, y: 40, nom: "la baie rouge et bleue" }],
        passage: { x: 50, y: 85, nom: "la passerelle d’entrée, vers la salle de supervision" },
      },
      {
        nom: "La salle de supervision",
        objets: [{ x: 22, y: 17, nom: "l'écran du journal" }, { x: 72, y: 80, nom: "le plan de la salle" }],
        passage: { x: 77, y: 37, nom: "la trappe ouverte vers la galerie des câbles" },
      },
      {
        nom: "La galerie des câbles",
        objets: [{ x: 22, y: 45, nom: "les deux portes blindées" }, { x: 82, y: 60, nom: "le terminal Python" }],
        passage: { x: 65, y: 35, nom: "l'échelle vers la trappe de sortie" },
      },
    ],
  },
  'escape-maths-lycee|TERMINALE': {
    objets: [
      { x: 20, y: 45, nom: "la grande roue chiffrée" },
      { x: 54, y: 61, nom: "la sphère armillaire" },
      { x: 45, y: 85, nom: "la rosace du sol" },
      { x: 94, y: 80, nom: "la sphère de droite" },
      { x: 92, y: 39, nom: "la lune" },
      { x: 89, y: 11, nom: "le satellite" },
    ],
    porte: { x: 46, y: 50, nom: "l’arche" },
    salles: [
      {
        nom: "Le cabinet des cryptographes",
        objets: [{ x: 20, y: 45, nom: "la grande roue chiffrée" }, { x: 54, y: 61, nom: "la sphère armillaire" }],
        passage: { x: 46, y: 50, nom: "l’arche, vers la salle des machines à calculer" },
      },
      {
        nom: "La salle des machines à calculer",
        objets: [{ x: 15, y: 22, nom: "le tableau à la courbe" }, { x: 90, y: 52, nom: "l'urne des tirages" }],
        passage: { x: 70, y: 40, nom: "l'escalier en spirale vers la coupole" },
      },
      {
        nom: "La coupole de l'observatoire",
        objets: [{ x: 22, y: 52, nom: "le coffre à roulettes" }, { x: 85, y: 35, nom: "le télescope vers le satellite" }],
        passage: { x: 50, y: 48, nom: "l'arche ouverte sur la terrasse" },
      },
    ],
  },
  'escape-maths|CINQUIEME': {
    objets: [
      { x: 15, y: 68, nom: "le manomètre" },
      { x: 31, y: 40, nom: "le caisson du moteur" },
      { x: 40, y: 68, nom: "le caisson du bas" },
      { x: 86, y: 60, nom: "la barre rouge" },
      { x: 83, y: 38, nom: "le tableau des cadrans" },
      { x: 94, y: 72, nom: "la grosse pompe" },
    ],
    porte: { x: 72, y: 44, nom: "la porte ronde blindée" },
    salles: [
      {
        nom: "La salle des machines",
        objets: [{ x: 15, y: 68, nom: "le manomètre" }, { x: 31, y: 40, nom: "le caisson du moteur" }],
        passage: { x: 72, y: 44, nom: "la porte ronde blindée, vers la soute et la barre" },
      },
      {
        nom: "La soute et la barre",
        objets: [{ x: 14, y: 48, nom: "la porte de la soute à la craie" }, { x: 75, y: 56, nom: "la plaque du gouvernail" }],
        passage: { x: 46, y: 38, nom: "l’échelle verticale vers le poste de pilotage" },
      },
      {
        nom: "Le poste de pilotage",
        objets: [{ x: 12, y: 29, nom: "les quatre capteurs de température" }, { x: 82, y: 61, nom: "la commande du ballast" }],
        passage: { x: 52, y: 19, nom: "l’écoutille ouverte du kiosque, vers la surface" },
      },
    ],
  },
  'escape-maths|QUATRIEME': {
    objets: [
      { x: 7, y: 30, nom: "l’étagère de flacons" },
      { x: 23, y: 36, nom: "l’armoire métallique" },
      { x: 91, y: 45, nom: "la paillasse de droite" },
      { x: 50, y: 25, nom: "le réacteur rose" },
      { x: 21, y: 58, nom: "la vitre de protection" },
      { x: 50, y: 67, nom: "le bouton rouge" },
    ],
    porte: { x: 71, y: 28, nom: "l’escalier métallique" },
    salles: [
      {
        nom: "Le laboratoire principal",
        objets: [{ x: 7, y: 30, nom: "l’étagère de flacons" }, { x: 23, y: 36, nom: "l’armoire métallique" }],
        passage: { x: 71, y: 28, nom: "l’escalier métallique, vers la réserve de chimie" },
      },
      {
        nom: "La réserve de chimie",
        objets: [{ x: 19, y: 60, nom: "la balance à plateaux" }, { x: 84, y: 57, nom: "l’échelle de travers" }],
        passage: { x: 50, y: 41, nom: "le couloir aux gros tuyaux vers l’atelier des robots" },
      },
      {
        nom: "L’atelier des robots",
        objets: [{ x: 14, y: 56, nom: "le robot coursier" }, { x: 88, y: 69, nom: "la boîte de fioles" }],
        passage: { x: 72, y: 33, nom: "le sas rouge à hublot, sortie du laboratoire" },
      },
    ],
  },
  'escape-maths|SIXIEME': {
    objets: [
      { x: 63, y: 73, nom: "les rochers du rivage" },
      { x: 12, y: 61, nom: "les piles de pièces d’or" },
      { x: 8, y: 83, nom: "la caisse en bois" },
      { x: 15, y: 12, nom: "le drapeau rouge déchiré" },
      { x: 82, y: 40, nom: "l’épave du navire" },
      { x: 18, y: 42, nom: "le coffre aux cadenas" },
    ],
    porte: { x: 88, y: 70, nom: "le chemin de la plage" },
    salles: [
      {
        nom: "La plage de l’île",
        objets: [{ x: 63, y: 73, nom: "les rochers du rivage" }, { x: 12, y: 61, nom: "les piles de pièces d’or" }],
        passage: { x: 80, y: 38, nom: "l’épave du navire" },
      },
      {
        nom: "La cale du navire",
        objets: [{ x: 18, y: 62, nom: "le tonneau couvert de pièces d’or" }, { x: 86, y: 30, nom: "la carte de l’île" }],
        passage: { x: 59, y: 38, nom: "la trappe et l’échelle, vers la grotte du trésor" },
      },
      {
        nom: "La grotte du trésor",
        objets: [{ x: 17, y: 28, nom: "la voile déchirée" }, { x: 82, y: 63, nom: "le coffre gravé" }],
        passage: { x: 46, y: 25, nom: "l’ouverture de la grotte sur le lagon ensoleillé" },
      },
    ],
  },
  'escape-maths|TROISIEME': {
    objets: [
      { x: 52, y: 39, nom: "le volant de la porte" },
      { x: 18, y: 17, nom: "l’applique de gauche" },
      { x: 6, y: 30, nom: "les coffres de gauche" },
      { x: 11, y: 75, nom: "le tiroir de lingots" },
      { x: 90, y: 70, nom: "la table aux lingots" },
      { x: 85, y: 45, nom: "les coffres de droite" },
    ],
    porte: { x: 40, y: 56, nom: "la porte blindée" },
    salles: [
      {
        nom: "La chambre forte",
        objets: [{ x: 52, y: 39, nom: "le volant de la porte" }, { x: 18, y: 17, nom: "l’applique de gauche" }],
        passage: { x: 40, y: 56, nom: "la porte blindée, vers la salle des guichets" },
      },
      {
        nom: "La salle des guichets",
        objets: [{ x: 14, y: 55, nom: "le guichet de location" }, { x: 82, y: 48, nom: "la roue de boules" }],
        passage: { x: 61, y: 38, nom: "la grille coulissante entrouverte vers le poste de garde" },
      },
      {
        nom: "Le poste de garde",
        objets: [{ x: 16, y: 74, nom: "le registre du gardien" }, { x: 88, y: 33, nom: "la grille du conduit d’aération" }],
        passage: { x: 94, y: 14, nom: "le conduit d’aération ouvert, en haut à droite" },
      },
    ],
  },
  'escape-physique-chimie-lycee|PREMIERE': {
    objets: [
      { x: 8, y: 20, nom: "les flacons de l’étagère" },
      { x: 47, y: 30, nom: "la hotte vitrée" },
      { x: 30, y: 10, nom: "l’ampoule de coulée" },
      { x: 6, y: 70, nom: "le pot de cristaux" },
      { x: 32, y: 52, nom: "le bécher violet" },
      { x: 59, y: 62, nom: "l’erlenmeyer" },
    ],
    porte: { x: 72, y: 20, nom: "la grande fenêtre" },
    salles: [
      {
        nom: "Le laboratoire de montagne",
        objets: [{ x: 7, y: 27, nom: "les flacons de l’étagère" }, { x: 62, y: 38, nom: "la hotte vitrée" }],
        passage: { x: 89, y: 47, nom: "la porte de la salle de pesée" },
      },
      {
        nom: "La salle de pesée",
        objets: [{ x: 16, y: 26, nom: "l’ampoule de coulée" }, { x: 88, y: 55, nom: "le pot de cristaux" }],
        passage: { x: 55, y: 52, nom: "l’escalier de bois vers la terrasse" },
      },
      {
        nom: "La terrasse des sommets",
        objets: [{ x: 16, y: 58, nom: "le bécher violet" }, { x: 85, y: 57, nom: "l’erlenmeyer" }],
        passage: { x: 41, y: 56, nom: "le portillon de bois vers le sentier" },
      },
    ],
  },
  'escape-physique-chimie-lycee|PREMIERE_PRO': {
    objets: [
      { x: 45, y: 28, nom: "la petite éolienne" },
      { x: 84, y: 60, nom: "l’ampoule" },
      { x: 64, y: 60, nom: "la batterie" },
      { x: 33, y: 27, nom: "le boîtier électrique" },
      { x: 83, y: 30, nom: "la pelleteuse" },
      { x: 71, y: 33, nom: "le tas de blocs" },
    ],
    porte: { x: 20, y: 35, nom: "la porte vitrée" },
    salles: [
      {
        nom: "Le bungalow du chantier",
        objets: [{ x: 45, y: 28, nom: "la petite éolienne" }, { x: 84, y: 60, nom: "l’ampoule" }],
        passage: { x: 20, y: 35, nom: "la porte vitrée, vers le conteneur-atelier" },
      },
      {
        nom: "Le conteneur-atelier",
        objets: [{ x: 15, y: 57, nom: "la batterie" }, { x: 82, y: 27, nom: "le boîtier électrique" }],
        passage: { x: 53, y: 42, nom: "les portes de tôle ouvertes sur la cour" },
      },
      {
        nom: "La cour du chantier",
        objets: [{ x: 22, y: 40, nom: "la pelleteuse" }, { x: 85, y: 55, nom: "le tas de blocs" }],
        passage: { x: 47, y: 47, nom: "le portail grillagé ouvert sur la route" },
      },
    ],
  },
  'escape-physique-chimie-lycee|PREMIERE_TECHNO': {
    objets: [
      { x: 13, y: 33, nom: "la chaudière rougeoyante" },
      { x: 32, y: 59, nom: "le manomètre" },
      { x: 40, y: 17, nom: "le grand tuyau de cuivre" },
      { x: 85, y: 57, nom: "l’alternateur" },
      { x: 28, y: 78, nom: "le bloc à ailettes" },
      { x: 65, y: 55, nom: "la grande turbine" },
    ],
    porte: { x: 80, y: 28, nom: "la grande baie vitrée" },
    salles: [
      {
        nom: "La chaufferie",
        objets: [{ x: 10, y: 40, nom: "la chaudière rougeoyante" }, { x: 63, y: 33, nom: "le manomètre" }],
        passage: { x: 88, y: 45, nom: "la porte de la galerie des conduites" },
      },
      {
        nom: "La galerie des conduites",
        objets: [{ x: 18, y: 42, nom: "le grand tuyau de cuivre" }, { x: 82, y: 40, nom: "l’alternateur" }],
        passage: { x: 59, y: 45, nom: "la porte grillagée en métal au fond, vers la salle de turbine" },
      },
      {
        nom: "La salle de turbine",
        objets: [{ x: 12, y: 58, nom: "l’armoire électrique" }, { x: 85, y: 40, nom: "la grande turbine" }],
        passage: { x: 43, y: 50, nom: "la grande baie vitrée vers la cour" },
      },
    ],
  },
  'escape-physique-chimie-lycee|SECONDE': {
    objets: [
      { x: 41, y: 47, nom: "le premier prisme" },
      { x: 26, y: 28, nom: "le porte-tubes" },
      { x: 10, y: 53, nom: "la lanterne" },
      { x: 82, y: 42, nom: "le ballon turquoise" },
      { x: 94, y: 38, nom: "l’éprouvette" },
      { x: 56, y: 87, nom: "le boîtier à filtres" },
    ],
    porte: { x: 52, y: 20, nom: "l’armoire vitrée" },
    salles: [
      {
        nom: "Le banc d'optique",
        objets: [{ x: 41, y: 47, nom: "le premier prisme" }, { x: 26, y: 28, nom: "le porte-tubes" }],
        passage: { x: 52, y: 20, nom: "la porte vitrée de la réserve, vers la salle de préparation" },
      },
      {
        nom: "La salle de préparation",
        objets: [{ x: 23, y: 48, nom: "la balance de précision" }, { x: 61, y: 72, nom: "la fiole jaugée" }],
        passage: { x: 70, y: 30, nom: "la porte à hublot vers la salle des montages" },
      },
      {
        nom: "La salle des montages",
        objets: [{ x: 22, y: 45, nom: "le montage à gaz" }, { x: 75, y: 75, nom: "le circuit à photorésistance" }],
        passage: { x: 78, y: 32, nom: "la porte de secours entrouverte sur le couloir" },
      },
    ],
  },
  'escape-physique-chimie-lycee|SECONDE_PRO': {
    objets: [
      { x: 47, y: 67, nom: "le fil rouge coupé" },
      { x: 54, y: 40, nom: "l’ampèremètre à aiguille" },
      { x: 35, y: 50, nom: "le boîtier à interrupteur" },
      { x: 86, y: 28, nom: "l’étagère à bacs" },
      { x: 80, y: 47, nom: "le moteur électrique" },
      { x: 10, y: 43, nom: "le générateur" },
    ],
    porte: { x: 58, y: 11, nom: "la fenêtre de l’atelier" },
    salles: [
      {
        nom: "L’établi de l’atelier",
        objets: [{ x: 47, y: 67, nom: "le fil rouge coupé" }, { x: 54, y: 40, nom: "l’ampèremètre à aiguille" }],
        passage: { x: 85, y: 20, nom: "les étagères de la réserve, au fond" },
      },
      {
        nom: "La réserve des pièces",
        objets: [{ x: 15, y: 30, nom: "le boîtier à interrupteur" }, { x: 85, y: 45, nom: "l’étagère à bacs" }],
        passage: { x: 56, y: 40, nom: "la porte coulissante de tôle au fond, vers la salle des machines" },
      },
      {
        nom: "La salle des machines",
        objets: [{ x: 18, y: 50, nom: "le moteur électrique" }, { x: 82, y: 55, nom: "le générateur" }],
        passage: { x: 63, y: 32, nom: "le rideau métallique relevé vers la cour" },
      },
    ],
  },
  'escape-physique-chimie-lycee|TERMINALE': {
    objets: [
      { x: 24, y: 29, nom: "le satellite" },
      { x: 94, y: 46, nom: "l’armoire vitrée" },
      { x: 86, y: 66, nom: "l’émetteur laser" },
      { x: 58, y: 50, nom: "la lentille de réglage" },
      { x: 75, y: 53, nom: "la paillasse du fond" },
      { x: 68, y: 39, nom: "la Terre" },
    ],
    porte: { x: 42, y: 49, nom: "la coursive du fond" },
    salles: [
      {
        nom: "La coupole d’observation",
        objets: [{ x: 22, y: 36, nom: "le satellite" }, { x: 92, y: 51, nom: "l’armoire vitrée" }],
        passage: { x: 74, y: 42, nom: "le sas du module optique" },
      },
      {
        nom: "Le module optique",
        objets: [{ x: 23, y: 45, nom: "l’émetteur laser" }, { x: 78, y: 42, nom: "la lentille de réglage" }],
        passage: { x: 60, y: 38, nom: "le sas circulaire vers la salle de contrôle" },
      },
      {
        nom: "La salle de contrôle",
        objets: [{ x: 18, y: 52, nom: "la paillasse du fond" }, { x: 85, y: 25, nom: "la Terre" }],
        passage: { x: 35, y: 25, nom: "la coursive du fond vers la capsule de retour" },
      },
    ],
  },
  'escape-physique-chimie-lycee|TERMINALE_PRO': {
    objets: [
      { x: 20, y: 59, nom: "le compresseur bleu" },
      { x: 42, y: 40, nom: "les ventilateurs" },
      { x: 32, y: 50, nom: "la cuve grise" },
      { x: 90, y: 45, nom: "le gros tuyau de cuivre" },
      { x: 73, y: 10, nom: "le grand manomètre" },
      { x: 62, y: 50, nom: "l’échangeur givré" },
    ],
    porte: { x: 15, y: 33, nom: "la grande fenêtre" },
    salles: [
      {
        nom: "La salle des machines",
        objets: [{ x: 20, y: 59, nom: "le compresseur bleu" }, { x: 42, y: 40, nom: "les ventilateurs" }],
        passage: { x: 72, y: 88, nom: "la grille d’accès au sous-sol, vers le local des cuves" },
      },
      {
        nom: "Le local des cuves",
        objets: [{ x: 25, y: 48, nom: "la cuve grise" }, { x: 43, y: 18, nom: "le gros tuyau de cuivre" }],
        passage: { x: 84, y: 40, nom: "l’escalier métallique, vers la chambre de l’échangeur" },
      },
      {
        nom: "La chambre de l’échangeur",
        objets: [{ x: 15, y: 38, nom: "le grand manomètre" }, { x: 83, y: 42, nom: "l’échangeur givré" }],
        passage: { x: 63, y: 50, nom: "la porte en arche vers la passerelle extérieure" },
      },
    ],
  },
  'escape-physique-chimie-lycee|TERMINALE_TECHNO': {
    objets: [
      { x: 67, y: 38, nom: "l’écran irisé" },
      { x: 23, y: 10, nom: "les flacons de l’étagère" },
      { x: 88, y: 40, nom: "l’écran blanc de droite" },
      { x: 44, y: 42, nom: "le prisme" },
      { x: 11, y: 38, nom: "la source lumineuse" },
      { x: 12, y: 78, nom: "les filtres colorés" },
    ],
    porte: { x: 93, y: 13, nom: "la vitrine du fond" },
    salles: [
      {
        nom: "Le banc d’optique",
        objets: [{ x: 57, y: 31, nom: "l’écran irisé" }, { x: 14, y: 14, nom: "les flacons de l’étagère" }],
        passage: { x: 86, y: 44, nom: "la porte vitrée de la salle d’analyse" },
      },
      {
        nom: "La salle d’analyse",
        objets: [{ x: 87, y: 28, nom: "l’écran blanc de droite" }, { x: 14, y: 53, nom: "le prisme" }],
        passage: { x: 54, y: 37, nom: "la porte battante, vers la salle de radiologie" },
      },
      {
        nom: "La salle de radiologie",
        objets: [{ x: 36, y: 25, nom: "la radiographie sur le négatoscope" }, { x: 83, y: 52, nom: "les filtres colorés" }],
        passage: { x: 90, y: 22, nom: "la porte ouverte vers le couloir" },
      },
    ],
  },
  'escape-physique-chimie|CINQUIEME': {
    objets: [
      { x: 66, y: 64, nom: "le bécher" },
      { x: 25, y: 62, nom: "la cloche de verre" },
      { x: 7, y: 70, nom: "les tubes à essai" },
      { x: 40, y: 58, nom: "la bobine de cuivre" },
      { x: 15, y: 13, nom: "la lampe suspendue" },
      { x: 60, y: 48, nom: "la colonne graduée" },
    ],
    porte: { x: 42, y: 35, nom: "l’escalier" },
    salles: [
      {
        nom: "Le laboratoire de Volta",
        objets: [{ x: 66, y: 64, nom: "le bécher" }, { x: 25, y: 62, nom: "la cloche de verre" }],
        passage: { x: 42, y: 35, nom: "l’escalier, vers la réserve des flacons" },
      },
      {
        nom: "La réserve des flacons",
        objets: [{ x: 10, y: 55, nom: "les tubes à essai" }, { x: 82, y: 36, nom: "la bobine de cuivre" }],
        passage: { x: 60, y: 50, nom: "l’escalier de pierre derrière la porte de fer, vers la cave des mesures" },
      },
      {
        nom: "La cave des mesures",
        objets: [{ x: 60, y: 13, nom: "la lampe suspendue" }, { x: 84, y: 50, nom: "la colonne graduée" }],
        passage: { x: 64, y: 44, nom: "l’armoire de chêne cadenassée au fond" },
      },
    ],
  },
  'escape-physique-chimie|QUATRIEME': {
    objets: [
      { x: 32, y: 44, nom: "le module à dôme" },
      { x: 12, y: 66, nom: "les écrans de gauche" },
      { x: 19, y: 83, nom: "le fauteuil de gauche" },
      { x: 77, y: 40, nom: "l’antenne parabolique" },
      { x: 88, y: 67, nom: "les écrans de droite" },
      { x: 64, y: 62, nom: "le conteneur de stockage" },
    ],
    porte: { x: 50, y: 87, nom: "la trappe du sol" },
    salles: [
      {
        nom: "Le module d’énergie",
        objets: [{ x: 32, y: 44, nom: "le module à dôme" }, { x: 12, y: 66, nom: "les écrans de gauche" }],
        passage: { x: 50, y: 87, nom: "la trappe du sol, vers le sas de sortie" },
      },
      {
        nom: "Le sas de sortie",
        objets: [{ x: 50, y: 72, nom: "la balance du sas" }, { x: 83, y: 20, nom: "l’antenne parabolique" }],
        passage: { x: 37, y: 40, nom: "l’écoutille ronde à volant rouge, vers la soute de maintenance" },
      },
      {
        nom: "La soute de maintenance",
        objets: [{ x: 24, y: 30, nom: "l’écran du recycleur d’air" }, { x: 86, y: 55, nom: "le conteneur de stockage" }],
        passage: { x: 45, y: 67, nom: "la trappe du sol entrouverte" },
      },
    ],
  },
  'escape-physique-chimie|TROISIEME': {
    objets: [
      { x: 9, y: 80, nom: "le bidon bleu" },
      { x: 22, y: 78, nom: "le bidon rouge" },
      { x: 89, y: 72, nom: "le bidon bleu de droite" },
      { x: 64, y: 12, nom: "la grosse molécule bleue" },
      { x: 21, y: 30, nom: "la cuve jaune" },
      { x: 65, y: 50, nom: "le tapis roulant" },
    ],
    porte: { x: 58, y: 34, nom: "l’allée du fond" },
    salles: [
      {
        nom: "L’entrepôt des bidons",
        objets: [{ x: 9, y: 80, nom: "le bidon bleu" }, { x: 22, y: 78, nom: "le bidon rouge" }],
        passage: { x: 58, y: 34, nom: "l’allée du fond, vers l’atelier d’analyse" },
      },
      {
        nom: "L’atelier d’analyse",
        objets: [{ x: 15, y: 62, nom: "le bidon d’acide qui mousse" }, { x: 86, y: 40, nom: "le modèle d’atome" }],
        passage: { x: 61, y: 42, nom: "la porte coulissante en tôle grise, vers le hall des machines" },
      },
      {
        nom: "Le hall des machines",
        objets: [{ x: 18, y: 22, nom: "le compteur de la cuve jaune" }, { x: 85, y: 75, nom: "le chariot de tri" }],
        passage: { x: 60, y: 52, nom: "le portail roulant du quai au bout de l’allée" },
      },
    ],
  },
  'escape-sciences|SIXIEME': {
    objets: [
      { x: 82, y: 66, nom: "les deux réservoirs" },
      { x: 60, y: 33, nom: "le dôme du fond" },
      { x: 72, y: 45, nom: "la serre vitrée" },
      { x: 8, y: 70, nom: "le gros rocher" },
      { x: 25, y: 55, nom: "les panneaux solaires" },
      { x: 81, y: 17, nom: "l’antenne parabolique" },
    ],
    porte: { x: 94, y: 61, nom: "le sas d’entrée" },
    salles: [
      {
        nom: "La salle des réservoirs",
        objets: [{ x: 18, y: 40, nom: "les deux réservoirs" }, { x: 90, y: 67, nom: "la balance de contrôle" }],
        passage: { x: 67, y: 44, nom: "l’écoutille ouverte sur la serre" },
      },
      {
        nom: "La serre martienne",
        objets: [{ x: 14, y: 60, nom: "le microscope" }, { x: 80, y: 65, nom: "le drone d’exploration" }],
        passage: { x: 41, y: 44, nom: "l’écoutille étanche au fond de la serre, vers le poste de commandement" },
      },
      {
        nom: "Le poste de commandement",
        objets: [{ x: 12, y: 35, nom: "le tableau électrique" }, { x: 90, y: 68, nom: "la console radio" }],
        passage: { x: 40, y: 40, nom: "le sas d’entrée à deux volants" },
      },
    ],
  },
  'escape-svt-lycee|PREMIERE': {
    objets: [
      { x: 42, y: 73, nom: "la vésicule dorée" },
      { x: 46, y: 58, nom: "le réticulum" },
      { x: 94, y: 39, nom: "la mitochondrie de droite" },
      { x: 32, y: 22, nom: "les vésicules vertes" },
      { x: 13, y: 40, nom: "la grande mitochondrie" },
      { x: 68, y: 30, nom: "le noyau" },
    ],
    porte: { x: 79, y: 84, nom: "l’ouverture du tunnel" },
    salles: [
      {
        nom: "Le cytoplasme",
        objets: [{ x: 42, y: 73, nom: "la vésicule dorée" }, { x: 46, y: 58, nom: "le réticulum" }],
        passage: { x: 79, y: 84, nom: "l’ouverture du tunnel" },
      },
      {
        nom: "Le tunnel du cytosquelette",
        objets: [{ x: 80, y: 60, nom: "la mitochondrie de droite" }, { x: 12, y: 28, nom: "les vésicules vertes" }],
        passage: { x: 63, y: 23, nom: "le pore nucléaire au fond du tunnel, vers la chambre du noyau" },
      },
      {
        nom: "La chambre du noyau",
        objets: [{ x: 25, y: 32, nom: "la grande mitochondrie" }, { x: 65, y: 28, nom: "le noyau" }],
        passage: { x: 90, y: 50, nom: "l’ouverture du tunnel hors de la cellule" },
      },
    ],
  },
  'escape-svt-lycee|PREMIERE_PRO': {
    objets: [
      { x: 43, y: 82, nom: "la rigole" },
      { x: 76, y: 44, nom: "les jeunes plants" },
      { x: 18, y: 26, nom: "les tubes à racines" },
      { x: 41, y: 51, nom: "le tuyau d’écoulement" },
      { x: 90, y: 70, nom: "les bacs noirs" },
      { x: 93, y: 22, nom: "les fleurs roses" },
    ],
    porte: { x: 57, y: 42, nom: "l’allée du fond" },
    salles: [
      {
        nom: "La serre de production",
        objets: [{ x: 43, y: 82, nom: "la rigole" }, { x: 76, y: 44, nom: "les jeunes plants" }],
        passage: { x: 57, y: 42, nom: "l’allée du fond, vers le local technique" },
      },
      {
        nom: "Le local technique",
        objets: [{ x: 15, y: 30, nom: "les tubes à racines" }, { x: 37, y: 34, nom: "le microscope" }],
        passage: { x: 62, y: 38, nom: "la porte vitrée vers la serre aux fleurs" },
      },
      {
        nom: "La serre aux fleurs",
        objets: [{ x: 18, y: 78, nom: "les bacs noirs" }, { x: 90, y: 17, nom: "la petite ruche" }],
        passage: { x: 60, y: 45, nom: "l’allée du fond vers la grande porte ouverte" },
      },
    ],
  },
  'escape-svt-lycee|PREMIERE_TECHNO': {
    objets: [
      { x: 68, y: 75, nom: "l’eau brune du canal" },
      { x: 22, y: 40, nom: "le grand aquarium" },
      { x: 72, y: 55, nom: "la petite cascade" },
      { x: 92, y: 70, nom: "le bassin aux lentilles" },
      { x: 50, y: 30, nom: "l’aquarium du fond" },
      { x: 89, y: 43, nom: "les herbes aquatiques" },
    ],
    porte: { x: 78, y: 22, nom: "la baie ouverte sur le lac" },
    salles: [
      {
        nom: "Le canal d’élevage",
        objets: [{ x: 68, y: 75, nom: "l’eau brune du canal" }, { x: 22, y: 40, nom: "le grand aquarium" }],
        passage: { x: 63, y: 42, nom: "les bassins du fond, vers la serre" },
      },
      {
        nom: "La serre des bassins",
        objets: [{ x: 17, y: 38, nom: "la petite cascade" }, { x: 82, y: 62, nom: "le bassin aux lentilles" }],
        passage: { x: 62, y: 35, nom: "la passerelle vers le hall des aquariums" },
      },
      {
        nom: "Le hall des aquariums",
        objets: [{ x: 85, y: 28, nom: "l’aquarium du fond" }, { x: 22, y: 65, nom: "les herbes aquatiques" }],
        passage: { x: 50, y: 32, nom: "la baie ouverte sur le lac" },
      },
    ],
  },
  'escape-svt-lycee|SECONDE': {
    objets: [
      { x: 41, y: 18, nom: "la longue-vue" },
      { x: 24, y: 74, nom: "la loupe" },
      { x: 63, y: 53, nom: "les nénuphars" },
      { x: 29, y: 60, nom: "le grand bocal" },
      { x: 8, y: 70, nom: "le bac blanc" },
      { x: 93, y: 62, nom: "les fleurs violettes" },
    ],
    porte: { x: 22, y: 20, nom: "l’observatoire en bois" },
    salles: [
      {
        nom: "Le ponton des naturalistes",
        objets: [{ x: 41, y: 18, nom: "la longue-vue" }, { x: 24, y: 74, nom: "la loupe" }],
        passage: { x: 80, y: 36, nom: "la berge sous les saules, au bord de la mare" },
      },
      {
        nom: "La berge sous l’auvent",
        objets: [{ x: 72, y: 85, nom: "les nénuphars" }, { x: 11, y: 50, nom: "le grand bocal" }],
        passage: { x: 65, y: 52, nom: "le sentier de planches vers l’observatoire" },
      },
      {
        nom: "La cabane d’observation",
        objets: [{ x: 22, y: 70, nom: "le bac blanc" }, { x: 68, y: 20, nom: "l’affiche des moustiques" }],
        passage: { x: 86, y: 40, nom: "la porte arrière vers la clairière" },
      },
    ],
  },
  'escape-svt-lycee|SECONDE_PRO': {
    objets: [
      { x: 92, y: 28, nom: "la station météo" },
      { x: 52, y: 36, nom: "les plants de tomates" },
      { x: 50, y: 58, nom: "le bac de salades" },
      { x: 82, y: 55, nom: "le bac fané" },
      { x: 26, y: 80, nom: "les flacons d’analyse" },
      { x: 21, y: 25, nom: "la cuve verte" },
    ],
    porte: { x: 43, y: 14, nom: "la cage d’escalier" },
    salles: [
      {
        nom: "Le toit potager",
        objets: [{ x: 92, y: 28, nom: "la station météo" }, { x: 52, y: 36, nom: "les plants de tomates" }],
        passage: { x: 43, y: 14, nom: "la porte du bâtiment, vers la serre du toit" },
      },
      {
        nom: "La serre du toit",
        objets: [{ x: 20, y: 45, nom: "le bac de salades" }, { x: 85, y: 50, nom: "le bac fané" }],
        passage: { x: 57, y: 30, nom: "la porte du local technique" },
      },
      {
        nom: "Le local du jardin",
        objets: [{ x: 12, y: 50, nom: "la balance et sa récolte" }, { x: 82, y: 55, nom: "la cuve verte" }],
        passage: { x: 58, y: 35, nom: "la porte de la cage d’escalier" },
      },
    ],
  },
  'escape-svt-lycee|TERMINALE': {
    objets: [
      { x: 86, y: 42, nom: "la paroi du canyon" },
      { x: 90, y: 22, nom: "le volcan fumant" },
      { x: 9, y: 27, nom: "l’étagère de carottes" },
      { x: 78, y: 54, nom: "le lac turquoise" },
      { x: 25, y: 30, nom: "le théodolite" },
      { x: 23, y: 75, nom: "le bloc d’ambre" },
    ],
    porte: { x: 43, y: 47, nom: "l’escalier en bois" },
    salles: [
      {
        nom: "La terrasse du canyon",
        objets: [{ x: 86, y: 42, nom: "la paroi du canyon" }, { x: 90, y: 22, nom: "le volcan fumant" }],
        passage: { x: 43, y: 47, nom: "l’escalier en bois, vers la salle des carottes" },
      },
      {
        nom: "La salle des carottes",
        objets: [{ x: 15, y: 35, nom: "l’étagère de carottes" }, { x: 88, y: 25, nom: "le lac turquoise" }],
        passage: { x: 47, y: 38, nom: "l’escalier en bois vers le plateau" },
      },
      {
        nom: "Le plateau isolé",
        objets: [{ x: 15, y: 38, nom: "le théodolite" }, { x: 85, y: 67, nom: "le bloc d’ambre" }],
        passage: { x: 55, y: 32, nom: "le pont de cordes vers l’autre bord" },
      },
    ],
  },
  'escape-svt-lycee|TERMINALE_PRO': {
    objets: [
      { x: 82, y: 55, nom: "les couches du sol" },
      { x: 58, y: 62, nom: "le filet d’eau" },
      { x: 90, y: 28, nom: "les racines" },
      { x: 13, y: 30, nom: "les colonnes de terre" },
      { x: 20, y: 47, nom: "les plateaux d’échantillons" },
      { x: 33, y: 58, nom: "le bidon blanc" },
    ],
    porte: { x: 31, y: 30, nom: "l’ouverture vers les champs" },
    salles: [
      {
        nom: "La tranchée du talus",
        objets: [{ x: 82, y: 55, nom: "les couches du sol" }, { x: 58, y: 62, nom: "le filet d’eau" }],
        passage: { x: 17, y: 33, nom: "l’abri en bois aux colonnes de terre" },
      },
      {
        nom: "L’abri des colonnes",
        objets: [{ x: 18, y: 45, nom: "les racines" }, { x: 88, y: 35, nom: "les colonnes de terre" }],
        passage: { x: 68, y: 40, nom: "la porte verte du laboratoire" },
      },
      {
        nom: "Le laboratoire agricole",
        objets: [{ x: 20, y: 65, nom: "les plateaux d’échantillons" }, { x: 90, y: 72, nom: "le bidon blanc" }],
        passage: { x: 68, y: 40, nom: "l’ouverture vers les champs" },
      },
    ],
  },
  'escape-svt-lycee|TERMINALE_TECHNO': {
    objets: [
      { x: 40, y: 25, nom: "le mur végétal" },
      { x: 14, y: 30, nom: "la colonne de filtration" },
      { x: 93, y: 50, nom: "la mangrove" },
      { x: 66, y: 72, nom: "le bac de plantes" },
      { x: 75, y: 33, nom: "la passerelle" },
      { x: 21, y: 53, nom: "la vanne rouge" },
    ],
    porte: { x: 64, y: 50, nom: "le passage du fond" },
    salles: [
      {
        nom: "Le dôme de verre",
        objets: [{ x: 40, y: 25, nom: "le mur végétal" }, { x: 14, y: 30, nom: "la colonne de filtration" }],
        passage: { x: 64, y: 50, nom: "le passage du fond, vers la mangrove du dôme" },
      },
      {
        nom: "La mangrove du dôme",
        objets: [{ x: 18, y: 45, nom: "la mangrove" }, { x: 85, y: 38, nom: "le bac de plantes" }],
        passage: { x: 55, y: 22, nom: "l’escalier en colimaçon vers la galerie haute" },
      },
      {
        nom: "La galerie haute",
        objets: [{ x: 35, y: 65, nom: "la passerelle" }, { x: 82, y: 55, nom: "la vanne rouge" }],
        passage: { x: 17, y: 25, nom: "le passage du fond vers la salle de contrôle" },
      },
    ],
  },
  'escape-svt|CINQUIEME': {
    objets: [
      { x: 23, y: 62, nom: "la capsule" },
      { x: 66, y: 80, nom: "les grandes villosités" },
      { x: 17, y: 17, nom: "le microbe violet" },
      { x: 31, y: 83, nom: "le globule rouge" },
      { x: 47, y: 64, nom: "la bulle dorée" },
      { x: 37, y: 24, nom: "le petit virus bleu" },
    ],
    porte: { x: 81, y: 27, nom: "le bout lumineux du tunnel" },
    salles: [
      {
        nom: "La tartine et l’intestin",
        objets: [{ x: 23, y: 62, nom: "la capsule" }, { x: 66, y: 80, nom: "les grandes villosités" }],
        passage: { x: 81, y: 27, nom: "le bout lumineux du tunnel, vers la rivière de sang" },
      },
      {
        nom: "La rivière de sang",
        objets: [{ x: 15, y: 45, nom: "la colonie de microbes violets" }, { x: 78, y: 57, nom: "le globule rouge" }],
        passage: { x: 43, y: 22, nom: "l’artère rouge qui s’enfonce au fond, vers le muscle et la cuisine" },
      },
      {
        nom: "Le muscle et la cuisine",
        objets: [{ x: 18, y: 28, nom: "la bulle dorée" }, { x: 88, y: 32, nom: "la bouteille de lait" }],
        passage: { x: 94, y: 18, nom: "la porte du réfrigérateur grande ouverte" },
      },
    ],
  },
  'escape-svt|QUATRIEME': {
    objets: [
      { x: 17, y: 40, nom: "la fenêtre du poste" },
      { x: 91, y: 60, nom: "l’antenne de droite" },
      { x: 35, y: 65, nom: "les caisses de matériel" },
      { x: 74, y: 57, nom: "la coulée de lave" },
      { x: 15, y: 82, nom: "les rochers noirs" },
      { x: 8, y: 10, nom: "le radar" },
    ],
    porte: { x: 15, y: 62, nom: "l’escalier métallique" },
    salles: [
      {
        nom: "Devant le poste de contrôle",
        objets: [{ x: 17, y: 40, nom: "la fenêtre du poste" }, { x: 91, y: 60, nom: "l’antenne de droite" }],
        passage: { x: 15, y: 62, nom: "l’escalier métallique, vers l’atelier des roches" },
      },
      {
        nom: "L’atelier des roches",
        objets: [{ x: 18, y: 68, nom: "les deux échantillons de roche" }, { x: 86, y: 74, nom: "la pince à échantillons" }],
        passage: { x: 36, y: 35, nom: "l’échelle de fer vers la terrasse" },
      },
      {
        nom: "La terrasse d’observation",
        objets: [{ x: 14, y: 58, nom: "la boîte à insectes" }, { x: 91, y: 38, nom: "l’écran du radar" }],
        passage: { x: 62, y: 72, nom: "l’escalier métallique vers la vallée" },
      },
    ],
  },
  'escape-svt|TROISIEME': {
    objets: [
      { x: 9, y: 82, nom: "la boîte de culture" },
      { x: 94, y: 77, nom: "les flacons de sang" },
      { x: 6, y: 62, nom: "le microscope" },
      { x: 21, y: 74, nom: "les tubes à essai" },
      { x: 57, y: 38, nom: "la colonne d’ADN" },
      { x: 93, y: 37, nom: "la cuve aux bactéries" },
    ],
    porte: { x: 34, y: 46, nom: "l’escalier" },
    salles: [
      {
        nom: "La salle des cultures",
        objets: [{ x: 9, y: 82, nom: "la boîte de culture" }, { x: 94, y: 77, nom: "les flacons de sang" }],
        passage: { x: 34, y: 46, nom: "l’escalier, vers la salle d’analyse" },
      },
      {
        nom: "La salle d’analyse",
        objets: [{ x: 10, y: 45, nom: "le microscope" }, { x: 86, y: 63, nom: "le portoir de tubes à essai" }],
        passage: { x: 63, y: 40, nom: "le sas de décontamination translucide, vers le confinement des souches" },
      },
      {
        nom: "Le confinement des souches",
        objets: [{ x: 20, y: 30, nom: "la double hélice d’ADN" }, { x: 87, y: 35, nom: "la cuve aux bactéries" }],
        passage: { x: 58, y: 42, nom: "la porte blindée à hublot de la salle des échantillons" },
      },
    ],
  },
};
