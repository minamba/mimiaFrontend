/**
 * Le catalogue des planches à importer, matière par matière, du CP à la
 * terminale.
 *
 * CE QUE CE FICHIER EST, ET CE QU'IL N'EST PAS
 * -------------------------------------------
 * Ce n'est PAS une bibliothèque de dessins : il n'y a pas une seule ligne de
 * SVG ici. C'est une liste d'EMPLACEMENTS — « il faudrait une planche de
 * l'Empire romain à son apogée, pour la sixième » — que l'administration
 * affiche et qu'un agent viendra remplir.
 *
 * La SVT est traitée à part, dans `schemasSvt.js` : ses trente-huit figures
 * sont dessinées à la main, vérifiées une par une, et s'affichent même sans
 * planche. C'est l'exception, née de l'ordre dans lequel on a travaillé, pas
 * un modèle à reproduire — dessiner une carte de l'Empire romain au trait
 * n'aurait aucun sens.
 *
 * POURQUOI UN EMPLACEMENT VIDE NE CASSE RIEN
 * -----------------------------------------
 * Une clé d'ici n'entre dans la consigne du professeur QUE si sa planche a été
 * importée : c'est le relevé des légendes, construit côté serveur à partir de
 * ce qui existe vraiment en base, qui la lui annonce. Tant que la planche
 * manque, le professeur ne connaît pas la clé, ne l'écrit pas, et dessine à
 * main levée comme il l'a toujours fait.
 *
 * On peut donc déclarer les cent trente emplacements d'un coup et les remplir
 * dans n'importe quel ordre, sans jamais laisser un tableau vide devant un
 * élève.
 *
 * LA CLÉ COMMENCE PAR LE PRÉFIXE DE SA MATIÈRE
 * -------------------------------------------
 * `hg-empire-romain`, `pc-circuit-serie`. C'est ce préfixe qui regroupe les
 * lignes dans l'administration, et c'est aussi ce qui garantit qu'une clé de
 * français ne collisionnera jamais avec une clé de maths.
 */

/**
 * Sciences et technologie — CP à 6e.
 *
 * La matière des petits : le vivant, la matière, le ciel, les objets. Presque
 * tout y est observable, donc presque tout y gagne à être vu plutôt que décrit.
 */
const SCIENCES = [
  { cle: 'sc-parties-plante', titre: 'Les parties d’une plante à fleurs', niveau: 'CP' },
  { cle: 'sc-cinq-sens', titre: 'Les cinq sens et leurs organes', niveau: 'CP' },
  { cle: 'sc-cycle-vie-plante', titre: 'De la graine à la plante', niveau: 'CP' },
  { cle: 'sc-jour-nuit', titre: 'L’alternance du jour et de la nuit', niveau: 'CE1' },
  { cle: 'sc-dents', titre: 'Les dents et leur brossage', niveau: 'CE1' },
  { cle: 'sc-cycle-vie-animal', titre: 'Le cycle de vie d’un animal', niveau: 'CE1' },
  { cle: 'sc-saisons', titre: 'Les quatre saisons et l’inclinaison de la Terre', niveau: 'CE2' },
  { cle: 'sc-etats-eau', titre: 'Les trois états de l’eau', niveau: 'CE2' },
  { cle: 'sc-squelette', titre: 'Le squelette humain', niveau: 'CE2' },
  { cle: 'sc-articulations-muscles', titre: 'Muscles et articulations', niveau: 'CE2' },
  { cle: 'sc-systeme-solaire', titre: 'Le système solaire', niveau: 'CM1' },
  { cle: 'sc-phases-lune', titre: 'Les phases de la Lune', niveau: 'CM1' },
  { cle: 'sc-chaine-alimentaire', titre: 'Une chaîne alimentaire', niveau: 'CM1' },
  { cle: 'sc-circuit-simple', titre: 'Un circuit électrique simple', niveau: 'CM1' },
  { cle: 'sc-cycle-eau', titre: 'Le cycle de l’eau', niveau: 'CM2' },
  { cle: 'sc-groupes-aliments', titre: 'Les groupes d’aliments', niveau: 'CM2' },
  { cle: 'sc-volcan', titre: 'La coupe d’un volcan', niveau: 'CM2' },
  { cle: 'sc-seisme', titre: 'Un séisme : foyer, épicentre, ondes', niveau: 'CM2' },
  { cle: 'sc-classification-vivant', titre: 'La classification du vivant', niveau: '6e' },
  { cle: 'sc-objet-technique', titre: 'Les fonctions d’un objet technique', niveau: '6e' },
  { cle: 'sc-cycle-vie-objet', titre: 'Le cycle de vie d’un objet', niveau: '6e' },
  { cle: 'sc-levier', titre: 'Le levier et le point d’appui', niveau: '6e' },
];

/**
 * Physique-Chimie — 5e à terminale.
 *
 * La matière la plus dépendante des planches après l'histoire-géographie : un
 * montage de laboratoire ou un circuit se reconnaissent à leur allure
 * normalisée, et un schéma approximatif y induit en erreur plus qu'il n'aide.
 */
const PHYSIQUE_CHIMIE = [
  { cle: 'pc-symboles-electriques', titre: 'Les symboles normalisés d’électricité', niveau: '5e' },
  { cle: 'pc-circuit-serie', titre: 'Un circuit en série', niveau: '5e' },
  { cle: 'pc-circuit-derivation', titre: 'Un circuit en dérivation', niveau: '5e' },
  { cle: 'pc-etats-matiere', titre: 'Les trois états et les changements d’état', niveau: '5e' },
  { cle: 'pc-filtration', titre: 'Un montage de filtration', niveau: '5e' },
  { cle: 'pc-distillation', titre: 'Un montage de distillation', niveau: '5e' },
  { cle: 'pc-chromatographie', titre: 'Une chromatographie sur papier', niveau: '5e' },
  { cle: 'pc-atome', titre: 'Le modèle de l’atome', niveau: '4e' },
  { cle: 'pc-molecule-eau', titre: 'La molécule d’eau', niveau: '4e' },
  { cle: 'pc-electrolyse-eau', titre: 'L’électrolyse de l’eau', niveau: '4e' },
  { cle: 'pc-aimant-champ', titre: 'Les lignes de champ d’un aimant', niveau: '4e' },
  { cle: 'pc-lentille-convergente', titre: 'Une lentille convergente et son foyer', niveau: '4e' },
  { cle: 'pc-refraction', titre: 'La réfraction de la lumière', niveau: '4e' },
  { cle: 'pc-prisme', titre: 'La décomposition de la lumière blanche', niveau: '4e' },
  { cle: 'pc-eclipses', titre: 'Éclipse de Soleil et éclipse de Lune', niveau: '4e' },
  { cle: 'pc-propagation-son', titre: 'La propagation d’un son', niveau: '4e' },
  { cle: 'pc-tableau-periodique', titre: 'La classification périodique des éléments', niveau: '3e' },
  { cle: 'pc-tests-ions', titre: 'Les tests d’identification des ions', niveau: '3e' },
  { cle: 'pc-pile', titre: 'Une pile électrochimique', niveau: '3e' },
  { cle: 'pc-poids-vecteur', titre: 'Le poids d’un objet, représenté par un vecteur', niveau: '3e' },
  { cle: 'pc-chaine-energetique', titre: 'Une chaîne énergétique', niveau: '3e' },
  { cle: 'pc-couches-electroniques', titre: 'Les couches électroniques', niveau: '2de' },
  { cle: 'pc-schema-lewis', titre: 'Le schéma de Lewis d’une molécule', niveau: '2de' },
  { cle: 'pc-formules-organiques', titre: 'Les formules d’une molécule organique', niveau: '2de' },
  { cle: 'pc-spectre-electromagnetique', titre: 'Le spectre des ondes électromagnétiques', niveau: '2de' },
  { cle: 'pc-echelle-ph', titre: 'L’échelle de pH', niveau: '1re' },
  { cle: 'pc-titrage', titre: 'Un montage de titrage', niveau: '1re' },
  { cle: 'pc-chauffage-reflux', titre: 'Un chauffage à reflux', niveau: '1re' },
  { cle: 'pc-mouvement-vecteurs', titre: 'Vitesse et accélération d’un mobile', niveau: '1re' },
  { cle: 'pc-chute-parabolique', titre: 'Le mouvement parabolique d’un projectile', niveau: 'Tle' },
  { cle: 'pc-circuit-rc', titre: 'La charge d’un condensateur', niveau: 'Tle' },
  { cle: 'pc-diffraction-interferences', titre: 'Diffraction et interférences', niveau: 'Tle' },
  { cle: 'pc-effet-doppler', titre: 'L’effet Doppler', niveau: 'Tle' },
  { cle: 'pc-lunette-astronomique', titre: 'Une lunette astronomique', niveau: 'Tle' },
];

/**
 * Mathématiques — CP à terminale.
 *
 * La matière où la planche importe le MOINS : une figure de géométrie est
 * géométrique, et le professeur la trace juste. Ce qu'on liste ici, ce sont
 * les figures canoniques — celles qu'un élève doit reconnaître au premier coup
 * d'œil parce qu'elles ont une forme convenue.
 */
const MATHS = [
  { cle: 'math-droite-graduee', titre: 'La droite graduée', niveau: 'CP' },
  { cle: 'math-table-pythagore', titre: 'La table de Pythagore', niveau: 'CE2' },
  { cle: 'math-fractions', titre: 'Les fractions représentées en parts', niveau: 'CM1' },
  { cle: 'math-solides-patrons', titre: 'Les solides usuels et leurs patrons', niveau: 'CM2' },
  { cle: 'math-angles', titre: 'Les types d’angles', niveau: '6e' },
  { cle: 'math-triangles', titre: 'Les triangles particuliers', niveau: '6e' },
  { cle: 'math-quadrilateres', titre: 'Les quadrilatères usuels', niveau: '6e' },
  { cle: 'math-symetrie-axiale', titre: 'La symétrie axiale', niveau: '6e' },
  { cle: 'math-perimetre-aire', titre: 'Périmètre et aire des figures usuelles', niveau: '6e' },
  { cle: 'math-repere', titre: 'Le repère du plan', niveau: '5e' },
  { cle: 'math-symetrie-centrale', titre: 'La symétrie centrale', niveau: '5e' },
  { cle: 'math-pythagore', titre: 'Le théorème de Pythagore', niveau: '4e' },
  { cle: 'math-thales', titre: 'Le théorème de Thalès', niveau: '4e' },
  { cle: 'math-trigonometrie-triangle', titre: 'Sinus, cosinus et tangente dans le triangle rectangle', niveau: '3e' },
  { cle: 'math-transformations', titre: 'Translation, rotation et homothétie', niveau: '3e' },
  { cle: 'math-fonction-affine', titre: 'La droite d’une fonction affine', niveau: '3e' },
  { cle: 'math-arbre-probabilites', titre: 'Un arbre de probabilités', niveau: '3e' },
  { cle: 'math-vecteurs', titre: 'Les vecteurs du plan', niveau: '2de' },
  { cle: 'math-parabole', titre: 'La parabole d’une fonction du second degré', niveau: '2de' },
  { cle: 'math-tableau-variation', titre: 'Un tableau de variation', niveau: '2de' },
  { cle: 'math-diagramme-boite', titre: 'Le diagramme en boîte', niveau: '2de' },
  { cle: 'math-cercle-trigonometrique', titre: 'Le cercle trigonométrique', niveau: '1re' },
  { cle: 'math-derivee-tangente', titre: 'La tangente et le nombre dérivé', niveau: '1re' },
  { cle: 'math-suite-escalier', titre: 'Une suite représentée en escalier', niveau: '1re' },
  { cle: 'math-exponentielle-logarithme', titre: 'Les courbes de l’exponentielle et du logarithme', niveau: 'Tle' },
  { cle: 'math-integrale-aire', titre: 'L’intégrale comme aire sous la courbe', niveau: 'Tle' },
  { cle: 'math-loi-normale', titre: 'La courbe de la loi normale', niveau: 'Tle' },
];

/**
 * Français — CP à première.
 *
 * Le français s'arrête en première : les épreuves anticipées closent la
 * matière, et promettre une figure de terminale serait promettre une année qui
 * n'existe pas.
 *
 * Ce sont des schémas d'organisation — une structure de récit, un tableau de
 * conjugaison, une frise de mouvements — pas des illustrations.
 */
const FRANCAIS = [
  { cle: 'fr-alphabet-cursive', titre: 'L’alphabet en cursive', niveau: 'CP' },
  { cle: 'fr-frise-temps', titre: 'La frise des temps du passé, présent et futur', niveau: 'CM1' },
  { cle: 'fr-types-phrases', titre: 'Les types et les formes de phrases', niveau: 'CM2' },
  { cle: 'fr-classes-grammaticales', titre: 'Les classes de mots', niveau: '6e' },
  { cle: 'fr-schema-narratif', titre: 'Le schéma narratif', niveau: '6e' },
  { cle: 'fr-fonctions-phrase', titre: 'Les fonctions dans la phrase', niveau: '5e' },
  { cle: 'fr-versification', titre: 'Vers, strophes et rimes', niveau: '4e' },
  { cle: 'fr-figures-style', titre: 'Les principales figures de style', niveau: '4e' },
  { cle: 'fr-points-de-vue', titre: 'Les points de vue narratifs', niveau: '4e' },
  { cle: 'fr-paroles-rapportees', titre: 'Les paroles rapportées', niveau: '4e' },
  { cle: 'fr-schema-actanciel', titre: 'Le schéma actanciel', niveau: '3e' },
  { cle: 'fr-genres-litteraires', titre: 'Les genres littéraires', niveau: '2de' },
  { cle: 'fr-frise-mouvements', titre: 'La frise des mouvements littéraires', niveau: '2de' },
  { cle: 'fr-espace-theatral', titre: 'L’espace théâtral', niveau: '2de' },
  { cle: 'fr-registres', titre: 'Les registres littéraires', niveau: '2de' },
  { cle: 'fr-plan-dissertation', titre: 'Le plan d’une dissertation', niveau: '1re' },
];

/**
 * Histoire-Géographie — CP à terminale.
 *
 * LA matière des planches. Une carte ne se dessine pas de mémoire : ni le
 * professeur ni l'élève ne sauraient placer la Méditerranée au trait, et un
 * contour approximatif enseigne une géographie fausse. Chaque ligne ici est
 * un document qu'un manuel imprime.
 */
const HISTOIRE_GEO = [
  // Repères du premier degré
  { cle: 'hg-planisphere', titre: 'Le planisphère : continents et océans', niveau: 'CE2' },
  { cle: 'hg-frise-grandes-periodes', titre: 'La frise des grandes périodes historiques', niveau: 'CE2' },
  { cle: 'hg-france-relief', titre: 'Le relief de la France', niveau: 'CM1' },
  { cle: 'hg-france-fleuves', titre: 'Les fleuves de France', niveau: 'CM1' },
  { cle: 'hg-france-regions', titre: 'Les régions françaises', niveau: 'CM1' },
  { cle: 'hg-france-climats', titre: 'Les climats de la France', niveau: 'CM2' },

  // Antiquité et Moyen Âge
  { cle: 'hg-egypte-nil', titre: 'L’Égypte ancienne et la vallée du Nil', niveau: '6e' },
  { cle: 'hg-grece-antique', titre: 'Le monde grec antique', niveau: '6e' },
  { cle: 'hg-empire-romain', titre: 'L’Empire romain à son apogée', niveau: '6e' },
  { cle: 'hg-densite-population-monde', titre: 'La répartition de la population mondiale', niveau: '6e' },
  { cle: 'hg-empire-carolingien', titre: 'L’empire de Charlemagne', niveau: '5e' },
  { cle: 'hg-seigneurie', titre: 'Une seigneurie médiévale', niveau: '5e' },
  { cle: 'hg-grandes-decouvertes', titre: 'Les grandes découvertes', niveau: '5e' },
  { cle: 'hg-zones-climatiques', titre: 'Les zones climatiques du monde', niveau: '5e' },

  // Temps modernes et XIXe
  { cle: 'hg-commerce-triangulaire', titre: 'Le commerce triangulaire', niveau: '4e' },
  { cle: 'hg-frise-revolution', titre: 'La frise de la Révolution française', niveau: '4e' },
  { cle: 'hg-europe-1815', titre: 'L’Europe après le congrès de Vienne', niveau: '4e' },
  { cle: 'hg-empires-coloniaux-1914', titre: 'Les empires coloniaux en 1914', niveau: '4e' },
  { cle: 'hg-flux-mondialisation', titre: 'Les grands flux de la mondialisation', niveau: '4e' },

  // XXe siècle
  { cle: 'hg-premiere-guerre-mondiale', titre: 'Les fronts de la Première Guerre mondiale', niveau: '3e' },
  { cle: 'hg-europe-nazie', titre: 'L’Europe sous domination nazie', niveau: '3e' },
  { cle: 'hg-guerre-froide', titre: 'Le monde bipolaire de la guerre froide', niveau: '3e' },
  { cle: 'hg-decolonisation', titre: 'La décolonisation', niveau: '3e' },
  { cle: 'hg-aires-urbaines-france', titre: 'Les aires urbaines françaises', niveau: '3e' },
  { cle: 'hg-espaces-productifs', titre: 'Les espaces productifs français', niveau: '3e' },
  { cle: 'hg-france-outre-mer', titre: 'La France d’outre-mer', niveau: '3e' },
  { cle: 'hg-union-europeenne', titre: 'L’Union européenne et ses élargissements', niveau: '3e' },

  // Lycée
  { cle: 'hg-metropolisation', titre: 'La métropolisation', niveau: '1re' },
  { cle: 'hg-zee-france', titre: 'La zone économique exclusive française', niveau: 'Tle' },
  { cle: 'hg-puissances-mondiales', titre: 'Les puissances dans le monde d’aujourd’hui', niveau: 'Tle' },
];

/**
 * Anglais — CP à terminale.
 *
 * Deux familles seulement : des tableaux de langue qu'on veut voir d'un bloc
 * (les temps, les irréguliers, les modaux) et des cartes du monde anglophone.
 * Le reste de la matière est de l'oral, et un schéma n'y apporte rien.
 */
const ANGLAIS = [
  { cle: 'an-prepositions-lieu', titre: 'Les prépositions de lieu', niveau: 'CM1' },
  { cle: 'an-heure', titre: 'Dire l’heure en anglais', niveau: 'CM2' },
  { cle: 'an-alphabet-phonetique', titre: 'L’alphabet phonétique anglais', niveau: '6e' },
  { cle: 'an-royaume-uni', titre: 'Le Royaume-Uni et l’Irlande', niveau: '6e' },
  { cle: 'an-union-jack', titre: 'L’Union Jack et sa composition', niveau: '6e' },
  { cle: 'an-monde-anglophone', titre: 'Le monde anglophone', niveau: '6e' },
  { cle: 'an-frise-temps', titre: 'La frise des temps anglais', niveau: '5e' },
  { cle: 'an-verbes-irreguliers', titre: 'Les verbes irréguliers', niveau: '5e' },
  { cle: 'an-comparatif-superlatif', titre: 'Comparatif et superlatif', niveau: '5e' },
  { cle: 'an-etats-unis', titre: 'Les États-Unis et leurs États', niveau: '4e' },
  { cle: 'an-modaux', titre: 'Les auxiliaires modaux', niveau: '4e' },
  { cle: 'an-institutions-uk', titre: 'Les institutions britanniques', niveau: '2de' },
  { cle: 'an-institutions-us', titre: 'Les institutions américaines', niveau: '2de' },
];

/**
 * Tous les emplacements, dans l'ordre où les matières apparaissent à l'écran.
 *
 * La SVT n'y figure pas : ses figures viennent de `schemasSvt.js`, où elles
 * portent en plus leur dessin.
 */
export const EMPLACEMENTS = [
  ...SCIENCES,
  ...PHYSIQUE_CHIMIE,
  ...MATHS,
  ...FRANCAIS,
  ...HISTOIRE_GEO,
  ...ANGLAIS,
];
