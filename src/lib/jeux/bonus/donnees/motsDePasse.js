/*
 * Mots de passe des jeux bonus, écrit le 09/10/2026 pour les jeux bonus
 * « Le mot de passe ».
 *
 * MOTS_DE_PASSE : 6 thèmes par classe, 4 mots par thème. Chaque mot secret
 * vient avec trois indices d'un seul mot, du plus vague au plus précis (le
 * troisième est le plus parlant). Aucun indice ne contient le mot secret ni
 * un mot de sa famille ; minuscules, accents justes, ni espace, ni trait
 * d'union, ni apostrophe.
 */

export const MOTS_DE_PASSE = {
  CP: [
    {
      theme: 'Les animaux de la maison',
      mots: [
        { mot: 'chat', indices: ['moustaches', 'ronronner', 'miauler'] },
        { mot: 'chien', indices: ['niche', 'os', 'aboyer'] },
        { mot: 'poisson', indices: ['eau', 'bocal', 'nageoires'] },
        { mot: 'lapin', indices: ['oreilles', 'terrier', 'carotte'] },
      ],
    },
    {
      theme: 'Les fruits',
      mots: [
        { mot: 'pomme', indices: ['rouge', 'verger', 'compote'] },
        { mot: 'banane', indices: ['jaune', 'peau', 'singe'] },
        { mot: 'fraise', indices: ['été', 'rouge', 'chantilly'] },
        { mot: 'orange', indices: ['ronde', 'couleur', 'jus'] },
      ],
    },
    {
      theme: "À l'école",
      mots: [
        { mot: 'école', indices: ['cartable', 'maîtresse', 'récréation'] },
        { mot: 'cahier', indices: ['écrire', 'lignes', 'carreaux'] },
        { mot: 'crayon', indices: ['dessiner', 'mine', 'tailler'] },
        { mot: 'gomme', indices: ['petite', 'erreur', 'effacer'] },
      ],
    },
    {
      theme: 'Le corps',
      mots: [
        { mot: 'main', indices: ['cinq', 'gant', 'doigts'] },
        { mot: 'nez', indices: ['visage', 'mouchoir', 'narines'] },
        { mot: 'pied', indices: ['marcher', 'chaussette', 'orteils'] },
        { mot: 'oreille', indices: ['tête', 'boucle', 'entendre'] },
      ],
    },
    {
      theme: 'La maison',
      mots: [
        { mot: 'lit', indices: ['chambre', 'oreiller', 'dormir'] },
        { mot: 'porte', indices: ['ouvrir', 'clé', 'poignée'] },
        { mot: 'table', indices: ['pieds', 'manger', 'nappe'] },
        { mot: 'fenêtre', indices: ['voir', 'rideaux', 'vitre'] },
      ],
    },
    {
      theme: 'Le temps qu’il fait',
      mots: [
        { mot: 'soleil', indices: ['jaune', 'chaud', 'briller'] },
        { mot: 'pluie', indices: ['nuage', 'mouillé', 'gouttes'] },
        { mot: 'neige', indices: ['froid', 'blanche', 'bonhomme'] },
        { mot: 'arbre', indices: ['forêt', 'branches', 'tronc'] },
      ],
    },
  ],

  CE1: [
    {
      theme: 'Les animaux de la ferme',
      mots: [
        { mot: 'vache', indices: ['prairie', 'lait', 'meuh'] },
        { mot: 'cochon', indices: ['rose', 'boue', 'groin'] },
        { mot: 'poule', indices: ['plumes', 'picorer', 'œufs'] },
        { mot: 'mouton', indices: ['troupeau', 'berger', 'laine'] },
      ],
    },
    {
      theme: 'Les métiers',
      mots: [
        { mot: 'boulanger', indices: ['matin', 'farine', 'baguette'] },
        { mot: 'pompier', indices: ['échelle', 'camion', 'incendie'] },
        { mot: 'médecin', indices: ['malade', 'ordonnance', 'stéthoscope'] },
        { mot: 'facteur', indices: ['vélo', 'boîte', 'courrier'] },
      ],
    },
    {
      theme: 'Les saisons',
      mots: [
        { mot: 'hiver', indices: ['écharpe', 'froid', 'neige'] },
        { mot: 'été', indices: ['chaleur', 'vacances', 'juillet'] },
        { mot: 'automne', indices: ['marrons', 'champignons', 'octobre'] },
        { mot: 'printemps', indices: ['oiseaux', 'fleurs', 'bourgeons'] },
      ],
    },
    {
      theme: 'Dans la cuisine',
      mots: [
        { mot: 'casserole', indices: ['cuisson', 'couvercle', 'bouillir'] },
        { mot: 'fourchette', indices: ['couvert', 'dents', 'piquer'] },
        { mot: 'gâteau', indices: ['four', 'bougies', 'anniversaire'] },
        { mot: 'soupe', indices: ['légumes', 'cuillère', 'bol'] },
      ],
    },
    {
      theme: 'Les jouets',
      mots: [
        { mot: 'ballon', indices: ['rond', 'gonfler', 'foot'] },
        { mot: 'poupée', indices: ['jouet', 'robe', 'bébé'] },
        { mot: 'puzzle', indices: ['image', 'assembler', 'pièces'] },
        { mot: 'toupie', indices: ['bois', 'pointe', 'tourner'] },
      ],
    },
    {
      theme: 'Les transports',
      mots: [
        { mot: 'vélo', indices: ['roues', 'guidon', 'pédales'] },
        { mot: 'bateau', indices: ['mer', 'port', 'voile'] },
        { mot: 'avion', indices: ['ciel', 'ailes', 'aéroport'] },
        { mot: 'train', indices: ['gare', 'wagons', 'rails'] },
      ],
    },
  ],

  CE2: [
    {
      theme: 'Les animaux sauvages',
      mots: [
        { mot: 'lion', indices: ['savane', 'roi', 'crinière'] },
        { mot: 'éléphant', indices: ['gris', 'défenses', 'trompe'] },
        { mot: 'girafe', indices: ['taches', 'grande', 'cou'] },
        { mot: 'serpent', indices: ['écailles', 'siffler', 'ramper'] },
      ],
    },
    {
      theme: 'Le jardin',
      mots: [
        { mot: 'fleur', indices: ['tige', 'pétales', 'bouquet'] },
        { mot: 'graine', indices: ['petite', 'semer', 'germer'] },
        { mot: 'potager', indices: ['bêche', 'arroser', 'légumes'] },
        { mot: 'escargot', indices: ['lent', 'bave', 'coquille'] },
      ],
    },
    {
      theme: 'Les sports',
      mots: [
        { mot: 'football', indices: ['équipe', 'gardien', 'but'] },
        { mot: 'natation', indices: ['bonnet', 'bassin', 'piscine'] },
        { mot: 'tennis', indices: ['balle', 'filet', 'raquette'] },
        { mot: 'judo', indices: ['ceinture', 'tatami', 'kimono'] },
      ],
    },
    {
      theme: 'Le ciel et l’espace',
      mots: [
        { mot: 'lune', indices: ['nuit', 'croissant', 'cratères'] },
        { mot: 'étoile', indices: ['ciel', 'briller', 'filante'] },
        { mot: 'fusée', indices: ['espace', 'astronaute', 'décoller'] },
        { mot: 'planète', indices: ['ronde', 'orbite', 'mars'] },
      ],
    },
    {
      theme: 'Les émotions',
      mots: [
        { mot: 'joie', indices: ['heureux', 'rire', 'sourire'] },
        { mot: 'peur', indices: ['noir', 'monstre', 'trembler'] },
        { mot: 'colère', indices: ['rouge', 'crier', 'fâché'] },
        { mot: 'tristesse', indices: ['larmes', 'chagrin', 'pleurer'] },
      ],
    },
    {
      theme: 'Les vêtements',
      mots: [
        { mot: 'chapeau', indices: ['tête', 'paille', 'melon'] },
        { mot: 'pull', indices: ['laine', 'manches', 'tricot'] },
        { mot: 'botte', indices: ['pied', 'caoutchouc', 'flaque'] },
        { mot: 'pyjama', indices: ['rayures', 'nuit', 'dormir'] },
      ],
    },
  ],

  CM1: [
    {
      theme: 'Les paysages de France',
      mots: [
        { mot: 'montagne', indices: ['altitude', 'sommet', 'alpes'] },
        { mot: 'fleuve', indices: ['courant', 'embouchure', 'loire'] },
        { mot: 'île', indices: ['mer', 'entourée', 'corse'] },
        { mot: 'capitale', indices: ['ville', 'gouvernement', 'paris'] },
      ],
    },
    {
      theme: 'Au temps des châteaux forts',
      mots: [
        { mot: 'château', indices: ['seigneur', 'douves', 'donjon'] },
        { mot: 'chevalier', indices: ['armure', 'écuyer', 'tournoi'] },
        { mot: 'grotte', indices: ['sombre', 'peintures', 'lascaux'] },
        { mot: 'roi', indices: ['palais', 'trône', 'couronne'] },
      ],
    },
    {
      theme: 'Les sciences',
      mots: [
        { mot: 'aimant', indices: ['fer', 'pôle', 'attirer'] },
        { mot: 'volcan', indices: ['cratère', 'lave', 'éruption'] },
        { mot: 'squelette', indices: ['corps', 'crâne', 'os'] },
        { mot: 'thermomètre', indices: ['fièvre', 'degrés', 'température'] },
      ],
    },
    {
      theme: 'La mer',
      mots: [
        { mot: 'baleine', indices: ['géante', 'mammifère', 'bleue'] },
        { mot: 'marée', indices: ['lune', 'basse', 'haute'] },
        { mot: 'phare', indices: ['rochers', 'tour', 'lumière'] },
        { mot: 'coquillage', indices: ['plage', 'nacre', 'oreille'] },
      ],
    },
    {
      theme: 'La musique',
      mots: [
        { mot: 'piano', indices: ['instrument', 'blanches', 'touches'] },
        { mot: 'guitare', indices: ['bois', 'six', 'cordes'] },
        { mot: 'tambour', indices: ['peau', 'baguettes', 'battre'] },
        { mot: 'chanson', indices: ['paroles', 'couplet', 'refrain'] },
      ],
    },
    {
      theme: 'Les contes',
      mots: [
        { mot: 'sorcière', indices: ['potion', 'chaudron', 'balai'] },
        { mot: 'dragon', indices: ['écailles', 'ailes', 'flammes'] },
        { mot: 'fée', indices: ['vœu', 'magie', 'baguette'] },
        { mot: 'loup', indices: ['forêt', 'hurler', 'chaperon'] },
      ],
    },
  ],

  CM2: [
    {
      theme: 'La langue française',
      mots: [
        { mot: 'verbe', indices: ['action', 'infinitif', 'conjuguer'] },
        { mot: 'adjectif', indices: ['nom', 'accorder', 'qualificatif'] },
        { mot: 'dictionnaire', indices: ['mots', 'alphabet', 'définitions'] },
        { mot: 'phrase', indices: ['sujet', 'point', 'majuscule'] },
      ],
    },
    {
      theme: 'Les mathématiques',
      mots: [
        { mot: 'triangle', indices: ['figure', 'côtés', 'équilatéral'] },
        { mot: 'fraction', indices: ['partage', 'numérateur', 'dénominateur'] },
        { mot: 'périmètre', indices: ['mesure', 'tour', 'contour'] },
        { mot: 'division', indices: ['reste', 'partager', 'quotient'] },
      ],
    },
    {
      theme: 'Le corps humain',
      mots: [
        { mot: 'cœur', indices: ['sang', 'pompe', 'battements'] },
        { mot: 'poumon', indices: ['air', 'souffle', 'respirer'] },
        { mot: 'cerveau', indices: ['tête', 'neurones', 'penser'] },
        { mot: 'estomac', indices: ['ventre', 'repas', 'digestion'] },
      ],
    },
    {
      theme: "L'histoire",
      mots: [
        { mot: 'révolution', indices: ['liberté', 'peuple', 'bastille'] },
        { mot: 'pharaon', indices: ['égypte', 'momie', 'pyramide'] },
        { mot: 'gaulois', indices: ['druide', 'romains', 'vercingétorix'] },
        { mot: 'république', indices: ['vote', 'président', 'marianne'] },
      ],
    },
    {
      theme: "L'environnement",
      mots: [
        { mot: 'recyclage', indices: ['tri', 'poubelle', 'déchets'] },
        { mot: 'pollution', indices: ['air', 'fumée', 'usines'] },
        { mot: 'énergie', indices: ['puissance', 'solaire', 'éolienne'] },
        { mot: 'forêt', indices: ['bois', 'bûcheron', 'arbres'] },
      ],
    },
    {
      theme: 'Les inventions',
      mots: [
        { mot: 'ampoule', indices: ['lumière', 'électricité', 'edison'] },
        { mot: 'roue', indices: ['ronde', 'tourner', 'pneu'] },
        { mot: 'imprimerie', indices: ['livres', 'presse', 'gutenberg'] },
        { mot: 'téléphone', indices: ['appeler', 'sonnerie', 'portable'] },
      ],
    },
  ],

  SIXIEME: [
    {
      theme: 'La mythologie grecque',
      mots: [
        { mot: 'olympe', indices: ['montagne', 'dieux', 'zeus'] },
        { mot: 'cyclope', indices: ['géant', 'œil', 'ulysse'] },
        { mot: 'héros', indices: ['courage', 'exploits', 'hercule'] },
        { mot: 'labyrinthe', indices: ['couloirs', 'dédale', 'minotaure'] },
      ],
    },
    {
      theme: 'Habiter le monde',
      mots: [
        { mot: 'métropole', indices: ['habitants', 'banlieue', 'agglomération'] },
        { mot: 'littoral', indices: ['tourisme', 'côte', 'rivage'] },
        { mot: 'désert', indices: ['sable', 'dunes', 'sahara'] },
        { mot: 'campagne', indices: ['champs', 'villages', 'rural'] },
      ],
    },
    {
      theme: 'Le vivant',
      mots: [
        { mot: 'cellule', indices: ['vivant', 'microscope', 'noyau'] },
        { mot: 'respiration', indices: ['dioxygène', 'branchies', 'poumons'] },
        { mot: 'germination', indices: ['graine', 'eau', 'plantule'] },
        { mot: 'fossile', indices: ['roche', 'ancien', 'empreinte'] },
      ],
    },
    {
      theme: 'La grammaire',
      mots: [
        { mot: 'pronom', indices: ['remplacer', 'personnel', 'il'] },
        { mot: 'conjugaison', indices: ['temps', 'verbes', 'bescherelle'] },
        { mot: 'synonyme', indices: ['mot', 'sens', 'équivalent'] },
        { mot: 'antonyme', indices: ['mot', 'opposé', 'contraire'] },
      ],
    },
    {
      theme: "L'Antiquité",
      mots: [
        { mot: 'colonne', indices: ['temple', 'marbre', 'chapiteau'] },
        { mot: 'démocratie', indices: ['citoyens', 'vote', 'athènes'] },
        { mot: 'papyrus', indices: ['écriture', 'roseau', 'égypte'] },
        { mot: 'théâtre', indices: ['scène', 'masques', 'tragédie'] },
      ],
    },
    {
      theme: 'Classer les animaux',
      mots: [
        { mot: 'mammifère', indices: ['vertébré', 'poils', 'allaiter'] },
        { mot: 'insecte', indices: ['antennes', 'fourmi', 'six'] },
        { mot: 'oiseau', indices: ['bec', 'plumes', 'nid'] },
        { mot: 'reptile', indices: ['écailles', 'lézard', 'ramper'] },
      ],
    },
  ],

  CINQUIEME: [
    {
      theme: 'Le Moyen Âge',
      mots: [
        { mot: 'cathédrale', indices: ['gothique', 'vitraux', 'évêque'] },
        { mot: 'seigneur', indices: ['fief', 'vassal', 'château'] },
        { mot: 'monastère', indices: ['moines', 'prière', 'abbaye'] },
        { mot: 'paysan', indices: ['champs', 'récolte', 'serf'] },
      ],
    },
    {
      theme: 'La physique-chimie',
      mots: [
        { mot: 'mélange', indices: ['eau', 'hétérogène', 'homogène'] },
        { mot: 'circuit', indices: ['fil', 'pile', 'interrupteur'] },
        { mot: 'masse', indices: ['peser', 'kilogramme', 'balance'] },
        { mot: 'ombre', indices: ['opaque', 'silhouette', 'soleil'] },
      ],
    },
    {
      theme: 'Les récits',
      mots: [
        { mot: 'roman', indices: ['livre', 'auteur', 'chapitres'] },
        { mot: 'fable', indices: ['animaux', 'morale', 'fontaine'] },
        { mot: 'poème', indices: ['vers', 'rimes', 'strophes'] },
        { mot: 'conte', indices: ['merveilleux', 'autrefois', 'perrault'] },
      ],
    },
    {
      theme: 'Ressources et populations',
      mots: [
        { mot: 'pétrole', indices: ['énergie', 'puits', 'baril'] },
        { mot: 'population', indices: ['croissance', 'démographie', 'habitants'] },
        { mot: 'agriculture', indices: ['élevage', 'tracteur', 'récoltes'] },
        { mot: 'ressource', indices: ['richesse', 'exploiter', 'naturelle'] },
      ],
    },
    {
      theme: 'Les arts',
      mots: [
        { mot: 'peinture', indices: ['couleurs', 'toile', 'pinceau'] },
        { mot: 'sculpture', indices: ['marbre', 'ciseau', 'statue'] },
        { mot: 'orchestre', indices: ['symphonie', 'musiciens', 'chef'] },
        { mot: 'cinéma', indices: ['salle', 'écran', 'film'] },
      ],
    },
    {
      theme: 'Les mathématiques',
      mots: [
        { mot: 'pourcentage', indices: ['soldes', 'taux', 'réduction'] },
        { mot: 'symétrie', indices: ['pliage', 'miroir', 'axe'] },
        { mot: 'angle', indices: ['droit', 'degrés', 'rapporteur'] },
        { mot: 'moyenne', indices: ['somme', 'diviser', 'notes'] },
      ],
    },
  ],

  QUATRIEME: [
    {
      theme: 'Le siècle des Lumières',
      mots: [
        { mot: 'philosophe', indices: ['raison', 'encyclopédie', 'voltaire'] },
        { mot: 'constitution', indices: ['loi', 'droits', 'fondamentale'] },
        { mot: 'privilège', indices: ['avantage', 'clergé', 'noblesse'] },
        { mot: 'citoyen', indices: ['nation', 'droits', 'vote'] },
      ],
    },
    {
      theme: 'La chimie',
      mots: [
        { mot: 'molécule', indices: ['formule', 'liaison', 'atomes'] },
        { mot: 'combustion', indices: ['bougie', 'dioxygène', 'flamme'] },
        { mot: 'atome', indices: ['particule', 'noyau', 'électrons'] },
        { mot: 'réaction', indices: ['produits', 'transformation', 'chimique'] },
      ],
    },
    {
      theme: 'La littérature',
      mots: [
        { mot: 'nouvelle', indices: ['court', 'récit', 'maupassant'] },
        { mot: 'personnage', indices: ['fiction', 'rôle', 'héros'] },
        { mot: 'narrateur', indices: ['voix', 'focalisation', 'raconter'] },
        { mot: 'lettre', indices: ['enveloppe', 'correspondance', 'épistolaire'] },
      ],
    },
    {
      theme: 'Les mathématiques',
      mots: [
        { mot: 'équation', indices: ['résoudre', 'membre', 'inconnue'] },
        { mot: 'pythagore', indices: ['triangle', 'théorème', 'hypoténuse'] },
        { mot: 'puissance', indices: ['carré', 'cube', 'exposant'] },
        { mot: 'probabilité', indices: ['chance', 'dé', 'hasard'] },
      ],
    },
    {
      theme: 'Le corps et le vivant',
      mots: [
        { mot: 'neurone', indices: ['nerveux', 'message', 'synapse'] },
        { mot: 'intestin', indices: ['digestion', 'absorption', 'grêle'] },
        { mot: 'reproduction', indices: ['fécondation', 'ovule', 'spermatozoïde'] },
        { mot: 'bactérie', indices: ['microbe', 'unicellulaire', 'antibiotique'] },
      ],
    },
    {
      theme: "L'art et la culture",
      mots: [
        { mot: 'opéra', indices: ['chant', 'livret', 'ténor'] },
        { mot: 'musée', indices: ['exposition', 'tableaux', 'louvre'] },
        { mot: 'portrait', indices: ['peintre', 'visage', 'joconde'] },
        { mot: 'photographie', indices: ['image', 'objectif', 'appareil'] },
      ],
    },
  ],

  TROISIEME: [
    {
      theme: 'Le monde au XXe siècle',
      mots: [
        { mot: 'europe', indices: ['continent', 'union', 'bruxelles'] },
        { mot: 'suffrage', indices: ['vote', 'femmes', 'universel'] },
        { mot: 'télévision', indices: ['écran', 'programmes', 'chaînes'] },
        { mot: 'satellite', indices: ['antenne', 'orbite', 'spoutnik'] },
      ],
    },
    {
      theme: 'La vie citoyenne',
      mots: [
        { mot: 'laïcité', indices: ['religions', 'neutralité', 'séparation'] },
        { mot: 'justice', indices: ['loi', 'tribunal', 'juge'] },
        { mot: 'élection', indices: ['candidat', 'urne', 'scrutin'] },
        { mot: 'devise', indices: ['république', 'égalité', 'fraternité'] },
      ],
    },
    {
      theme: 'La physique',
      mots: [
        { mot: 'vitesse', indices: ['distance', 'durée', 'radar'] },
        { mot: 'gravitation', indices: ['attraction', 'pomme', 'newton'] },
        { mot: 'tension', indices: ['pile', 'électrique', 'volt'] },
        { mot: 'ion', indices: ['atome', 'charge', 'électrons'] },
      ],
    },
    {
      theme: 'La langue et le discours',
      mots: [
        { mot: 'métaphore', indices: ['figure', 'image', 'comparaison'] },
        { mot: 'argument', indices: ['débat', 'thèse', 'convaincre'] },
        { mot: 'subjonctif', indices: ['mode', 'souhait', 'que'] },
        { mot: 'éloquence', indices: ['parole', 'discours', 'orateur'] },
      ],
    },
    {
      theme: 'Les territoires français',
      mots: [
        { mot: 'frontière', indices: ['pays', 'limite', 'douane'] },
        { mot: 'tourisme', indices: ['visiteurs', 'hôtels', 'vacances'] },
        { mot: 'région', indices: ['territoire', 'conseil', 'bretagne'] },
        { mot: 'autoroute', indices: ['trafic', 'voies', 'péage'] },
      ],
    },
    {
      theme: 'La Terre et le vivant',
      mots: [
        { mot: 'gène', indices: ['hérédité', 'chromosome', 'adn'] },
        { mot: 'séisme', indices: ['secousse', 'faille', 'richter'] },
        { mot: 'vaccin', indices: ['injection', 'immunité', 'pasteur'] },
        { mot: 'climat', indices: ['températures', 'saisons', 'réchauffement'] },
      ],
    },
  ],

  SECONDE: [
    {
      theme: 'Poésie et théâtre',
      mots: [
        { mot: 'alexandrin', indices: ['vers', 'syllabes', 'douze'] },
        { mot: 'comédie', indices: ['rire', 'farce', 'molière'] },
        { mot: 'sonnet', indices: ['poème', 'quatorze', 'tercets'] },
        { mot: 'dramaturge', indices: ['auteur', 'pièces', 'corneille'] },
      ],
    },
    {
      theme: 'Les grandes idées',
      mots: [
        { mot: 'conscience', indices: ['esprit', 'soi', 'cogito'] },
        { mot: 'vérité', indices: ['réel', 'exactitude', 'mensonge'] },
        { mot: 'bonheur', indices: ['plaisir', 'sérénité', 'épicure'] },
        { mot: 'utopie', indices: ['rêve', 'idéale', 'société'] },
      ],
    },
    {
      theme: 'De Rome à la Renaissance',
      mots: [
        { mot: 'humanisme', indices: ['renaissance', 'montaigne', 'érasme'] },
        { mot: 'empire', indices: ['territoire', 'rome', 'auguste'] },
        { mot: 'explorateur', indices: ['découvertes', 'caravelle', 'colomb'] },
        { mot: 'réforme', indices: ['église', 'protestants', 'luther'] },
      ],
    },
    {
      theme: 'Les sciences de la vie',
      mots: [
        { mot: 'biodiversité', indices: ['richesse', 'écosystème', 'espèces'] },
        { mot: 'chlorophylle', indices: ['pigment', 'vert', 'feuilles'] },
        { mot: 'chromosome', indices: ['paires', 'gènes', 'caryotype'] },
        { mot: 'évolution', indices: ['espèces', 'sélection', 'darwin'] },
      ],
    },
    {
      theme: 'La physique-chimie',
      mots: [
        { mot: 'spectre', indices: ['couleurs', 'raies', 'prisme'] },
        { mot: 'solution', indices: ['eau', 'mélange', 'concentration'] },
        { mot: 'mouvement', indices: ['vitesse', 'trajectoire', 'référentiel'] },
        { mot: 'isotope', indices: ['noyau', 'neutrons', 'carbone'] },
      ],
    },
    {
      theme: "L'économie",
      mots: [
        { mot: 'marché', indices: ['prix', 'offre', 'demande'] },
        { mot: 'chômage', indices: ['travail', 'sans', 'emploi'] },
        { mot: 'monnaie', indices: ['pièces', 'billets', 'euro'] },
        { mot: 'entreprise', indices: ['production', 'salariés', 'patron'] },
      ],
    },
  ],

  PREMIERE: [
    {
      theme: 'Mouvements littéraires',
      mots: [
        { mot: 'romantisme', indices: ['passion', 'lyrisme', 'hugo'] },
        { mot: 'classicisme', indices: ['règles', 'bienséance', 'racine'] },
        { mot: 'tirade', indices: ['théâtre', 'réplique', 'longue'] },
        { mot: 'rhétorique', indices: ['discours', 'art', 'persuasion'] },
      ],
    },
    {
      theme: 'Les mathématiques',
      mots: [
        { mot: 'dérivée', indices: ['fonction', 'pente', 'tangente'] },
        { mot: 'suite', indices: ['terme', 'raison', 'arithmétique'] },
        { mot: 'polynôme', indices: ['second', 'degré', 'discriminant'] },
        { mot: 'vecteur', indices: ['direction', 'sens', 'norme'] },
      ],
    },
    {
      theme: "L'histoire politique",
      mots: [
        { mot: 'monarchie', indices: ['roi', 'absolue', 'constitutionnelle'] },
        { mot: 'parlement', indices: ['lois', 'députés', 'assemblée'] },
        { mot: 'usine', indices: ['machines', 'ouvriers', 'industrie'] },
        { mot: 'presse', indices: ['information', 'journaux', 'quotidiens'] },
      ],
    },
    {
      theme: 'Les sciences de la vie et de la Terre',
      mots: [
        { mot: 'anticorps', indices: ['défense', 'antigène', 'lymphocytes'] },
        { mot: 'mutation', indices: ['changement', 'adn', 'allèle'] },
        { mot: 'tectonique', indices: ['plaques', 'dorsale', 'subduction'] },
        { mot: 'méiose', indices: ['division', 'chromosomes', 'gamètes'] },
      ],
    },
    {
      theme: 'La physique-chimie',
      mots: [
        { mot: 'onde', indices: ['propagation', 'longueur', 'fréquence'] },
        { mot: 'oxydation', indices: ['électrons', 'réduction', 'rouille'] },
        { mot: 'champ', indices: ['vecteur', 'gravitationnel', 'magnétique'] },
        { mot: 'dosage', indices: ['concentration', 'équivalence', 'burette'] },
      ],
    },
    {
      theme: 'Économie et société',
      mots: [
        { mot: 'inflation', indices: ['monnaie', 'hausse', 'prix'] },
        { mot: 'opinion', indices: ['avis', 'sondage', 'publique'] },
        { mot: 'croissance', indices: ['économie', 'production', 'pib'] },
        { mot: 'assurance', indices: ['contrat', 'risque', 'sinistre'] },
      ],
    },
  ],

  TERMINALE: [
    {
      theme: 'La philosophie',
      mots: [
        { mot: 'inconscient', indices: ['rêve', 'psychanalyse', 'freud'] },
        { mot: 'liberté', indices: ['choix', 'autonomie', 'arbitre'] },
        { mot: 'devoir', indices: ['obligation', 'morale', 'kant'] },
        { mot: 'raison', indices: ['pensée', 'logique', 'discernement'] },
      ],
    },
    {
      theme: 'Les mathématiques',
      mots: [
        { mot: 'intégrale', indices: ['courbe', 'aire', 'primitive'] },
        { mot: 'logarithme', indices: ['exponentielle', 'népérien', 'ln'] },
        { mot: 'matrice', indices: ['tableau', 'lignes', 'colonnes'] },
        { mot: 'asymptote', indices: ['infini', 'limite', 'droite'] },
      ],
    },
    {
      theme: 'Le monde d’aujourd’hui',
      mots: [
        { mot: 'gouvernance', indices: ['pouvoir', 'institutions', 'onu'] },
        { mot: 'mémoire', indices: ['souvenir', 'oubli', 'commémoration'] },
        { mot: 'patrimoine', indices: ['héritage', 'monuments', 'unesco'] },
        { mot: 'migration', indices: ['flux', 'déplacement', 'exil'] },
      ],
    },
    {
      theme: 'Les sciences',
      mots: [
        { mot: 'entropie', indices: ['chaos', 'thermodynamique', 'désordre'] },
        { mot: 'relativité', indices: ['temps', 'espace', 'einstein'] },
        { mot: 'quantique', indices: ['particules', 'physique', 'planck'] },
        { mot: 'enzyme', indices: ['protéine', 'catalyseur', 'substrat'] },
      ],
    },
    {
      theme: 'Littérature et idées',
      mots: [
        { mot: 'absurde', indices: ['illogique', 'camus', 'sisyphe'] },
        { mot: 'engagement', indices: ['cause', 'militer', 'sartre'] },
        { mot: 'ironie', indices: ['moquerie', 'décalage', 'antiphrase'] },
        { mot: 'mélancolie', indices: ['tristesse', 'baudelaire', 'spleen'] },
      ],
    },
    {
      theme: 'Économie et société',
      mots: [
        { mot: 'inégalité', indices: ['écart', 'revenus', 'injustice'] },
        { mot: 'innovation', indices: ['progrès', 'technologie', 'nouveauté'] },
        { mot: 'numérique', indices: ['données', 'internet', 'digital'] },
        { mot: 'solidarité', indices: ['partage', 'fraternité', 'entraide'] },
      ],
    },
  ],
};
