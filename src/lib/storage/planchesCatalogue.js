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
 * On peut donc déclarer tous les emplacements d'un coup et les remplir dans
 * n'importe quel ordre, sans jamais laisser un tableau vide devant un élève.
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
  { cle: 'sc-thermometre', titre: 'Lire un thermomètre', niveau: 'CP' },
  { cle: 'sc-balance-masse', titre: 'Comparer des masses avec une balance', niveau: 'CP' },
  { cle: 'sc-types-mouvement', titre: 'Les différents types de mouvement', niveau: 'CM1' },
  { cle: 'sc-signal-information', titre: 'D’un signal à une information', niveau: 'CM1' },
  { cle: 'sc-terre-active', titre: 'La Terre, une planète active', niveau: 'CM1' },
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
  { cle: 'pc-signal-information', titre: 'D’un signal à une information', niveau: '5e' },
  { cle: 'pc-echelles-univers', titre: 'Du kilomètre à l’année-lumière', niveau: '4e' },
  { cle: 'pc-effet-de-serre', titre: 'L’effet de serre', niveau: '3e' },
  { cle: 'pc-transformation-nucleaire', titre: 'Une transformation nucléaire', niveau: '2de' },
  { cle: 'pc-capteur', titre: 'Le principe d’un capteur', niveau: '2de' },
  { cle: 'pc-pression-fluide', titre: 'La pression dans un fluide au repos', niveau: '1re' },
  { cle: 'pc-synthese-organique', titre: 'Les étapes d’une synthèse organique', niveau: 'Tle' },
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
  { cle: 'math-schema-barres', titre: 'Le schéma en barres pour modéliser un problème', niveau: 'CP' },
  { cle: 'math-solides-usuels', titre: 'Les solides usuels : cube, pavé, boule, cylindre', niveau: 'CP' },
  { cle: 'math-monnaie', titre: 'Les pièces et les billets en euros', niveau: 'CP' },
  { cle: 'math-fraction-tout', titre: 'La fraction, une part d’un tout', niveau: 'CE1' },
  { cle: 'math-diagramme-barres', titre: 'Le diagramme en barres', niveau: 'CE1' },
  { cle: 'math-bande-unite', titre: 'Placer une fraction sur une bande-unité graduée', niveau: 'CE2' },
  { cle: 'math-contenances', titre: 'Les unités de contenance, du millilitre à l’hectolitre', niveau: 'CM1' },
  { cle: 'math-angles-comparer', titre: 'Comparer des angles', niveau: 'CM1' },
  { cle: 'math-tableau-proportionnalite', titre: 'Le tableau de proportionnalité', niveau: 'CM1' },
  { cle: 'math-probabilites-issues', titre: 'Les issues d’une expérience aléatoire', niveau: 'CM1' },
  { cle: 'math-nombre-inconnu', titre: 'Représenter un nombre inconnu', niveau: 'CM2' },
  { cle: 'math-ensembles', titre: 'Appartenance, inclusion, réunion, intersection', niveau: '2de' },
  { cle: 'math-taux-evolution', titre: 'Taux d’évolution, taux successifs et taux réciproque', niveau: '1re' },
  { cle: 'math-nuage-ajustement', titre: 'Le nuage de points et son ajustement affine', niveau: '1re' },
  { cle: 'math-lineaire-exponentiel', titre: 'Croissance linéaire et croissance exponentielle', niveau: '1re' },
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
  { cle: 'fr-synonymes-antonymes', titre: 'Synonymes, antonymes et familles de mots', niveau: 'CM1' },
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
  { cle: 'hg-empires-xvie', titre: 'Le monde au temps de Charles Quint et de Soliman', niveau: '5e' },
  { cle: 'hg-etats-unis-territoire', titre: 'Le territoire des États-Unis et la mondialisation', niveau: '4e' },
  { cle: 'hg-afrique-ensembles', titre: 'Les grands ensembles géographiques africains', niveau: '4e' },
  { cle: 'hg-unification-nations', titre: 'L’unification de l’Italie et de l’Allemagne', niveau: '1re' },
  { cle: 'hg-europe-1919', titre: 'L’Europe redessinée par les traités de 1919', niveau: '1re' },
  { cle: 'hg-crise-1929', titre: 'La crise de 1929 et sa propagation', niveau: 'Tle' },
  { cle: 'hg-elargissements-ue', titre: 'Les élargissements successifs de l’Union européenne', niveau: 'Tle' },
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
  { cle: 'an-pronoms', titre: 'Les pronoms personnels, possessifs et réfléchis', niveau: '6e' },
  { cle: 'an-irlande', titre: 'L’Irlande : repères géographiques et historiques', niveau: '4e' },
  { cle: 'an-commonwealth', titre: 'Le Commonwealth et ses membres', niveau: '2de' },
];

/**
 * Tous les emplacements, dans l'ordre où les matières apparaissent à l'écran.
 *
 * La SVT n'y figure pas : ses figures viennent de `schemasSvt.js`, où elles
 * portent en plus leur dessin.
 */

/**
 * SVT — les quelques planches qu’un dessin ne remplace pas.
 *
 * Les trente-huit figures de `schemasSvt.js` sont dessinées et s’affichent
 * sans rien importer. Les quatre ci-dessous ne le peuvent pas : une échelle
 * des temps géologiques ou un cycle de transmission tracés au trait seraient
 * faux, et une figure fausse est pire que pas de figure.
 */
const SVT = [
  { cle: 'svt-temps-geologiques', titre: 'L’échelle des temps géologiques', niveau: '4e' },
  { cle: 'svt-planetes', titre: 'Planètes telluriques et planètes gazeuses', niveau: '4e' },
  { cle: 'svt-cycle-vectoriel', titre: 'Le cycle de transmission d’une maladie vectorielle', niveau: '2de' },
  { cle: 'svt-enzyme', titre: 'L’action d’une enzyme sur son substrat', niveau: '1re' },
];
/**
 * Espagnol — LV2, de la 5e à la terminale (14/09/2026).
 *
 * Même logique que l'anglais : des tableaux de langue qu'on veut voir d'un
 * bloc, et les repères géographiques et historiques du monde hispanique. Les
 * lieux et les dates suivent l'axe culturel propre à l'espagnol à chaque
 * niveau — le Mexique en 5e, l'Andalousie en 4e, 1492 en 3e, l'espace andin
 * en première, les métissages en terminale.
 */
const ESPAGNOL = [
  { cle: 'es-monde-hispanophone', titre: 'Le monde hispanophone', niveau: '5e' },
  { cle: 'es-espagne-communautes', titre: 'L’Espagne et ses communautés autonomes', niveau: '5e' },
  { cle: 'es-amerique-latine', titre: 'Les pays d’Amérique latine', niveau: '5e' },
  { cle: 'es-mexique', titre: 'Le Mexique : repères géographiques', niveau: '5e' },
  { cle: 'es-accentuation', titre: 'L’accent tonique et l’accent écrit en espagnol', niveau: '5e' },
  { cle: 'es-ser-estar', titre: 'Ser et estar : leurs emplois', niveau: '5e' },
  { cle: 'es-present-indicatif', titre: 'Le présent de l’indicatif espagnol et les diphtongues', niveau: '5e' },
  { cle: 'es-andalousie', titre: 'L’Andalousie : repères géographiques et historiques', niveau: '4e' },
  { cle: 'es-passe-simple', titre: 'Le passé simple espagnol', niveau: '4e' },
  { cle: 'es-pronoms-enclise', titre: 'Les pronoms personnels espagnols et l’enclise', niveau: '4e' },
  { cle: 'es-1492', titre: '1492 : la fin de la Reconquista et le voyage de Colomb', niveau: '3e' },
  { cle: 'es-subjonctif', titre: 'Le subjonctif présent espagnol', niveau: '3e' },
  { cle: 'es-institutions-espagne', titre: 'Les institutions de l’Espagne', niveau: '2de' },
  { cle: 'es-espace-andin', titre: 'L’espace andin et la cordillère des Andes', niveau: '1re' },
  { cle: 'es-guerre-civile', titre: 'La guerre civile espagnole et le franquisme', niveau: 'Tle' },
];

/**
 * LES SPÉCIALITÉS DES SÉRIES TECHNOLOGIQUES (14/09/2026).
 *
 * Seulement ce qui MANQUE. Ces matières empruntent déjà les figures de la SVT
 * et les planches de physique-chimie qui leur servent — voir
 * `EmpruntsDePlanches` côté serveur. Chaque ligne ci-dessous est une notion
 * nommée par leur programme officiel, qu'aucune figure existante ne montre.
 */

/** ST2S — biologie et physiopathologie humaines. */
const BIOLOGIE_HUMAINE = [
  { cle: 'bph-revolution-cardiaque', titre: 'La révolution cardiaque et l’électrocardiogramme', niveau: '1re' },
  { cle: 'bph-spirogramme', titre: 'Le spirogramme : volumes et capacités pulmonaires', niveau: '1re' },
  { cle: 'bph-saturation-hemoglobine', titre: 'La courbe de saturation de l’hémoglobine', niveau: '1re' },
  { cle: 'bph-nephron', titre: 'Le néphron et la formation de l’urine', niveau: 'Tle' },
];

/** ST2S — physique-chimie pour la santé : la vision. */
const PHYSIQUE_CHIMIE_SANTE = [
  { cle: 'pc-oeil-defauts-vision', titre: 'L’œil et la correction des défauts de la vision', niveau: '1re' },
];

/** STL — biochimie, biologie et biotechnologies. */
const BIOTECHNOLOGIES = [
  { cle: 'biotech-spectrophotometre', titre: 'Le principe du spectrophotomètre : loi de Beer-Lambert', niveau: '1re' },
  { cle: 'biotech-hematimetre', titre: 'Le comptage de cellules à l’hématimètre', niveau: '1re' },
  { cle: 'biotech-pcr', titre: 'Les cycles de la PCR', niveau: 'Tle' },
  { cle: 'biotech-elisa', titre: 'Le principe d’un test ELISA', niveau: 'Tle' },
];

/** STL — sciences physiques et chimiques en laboratoire. */
const SPCL = [
  { cle: 'spcl-courbe-ph-metrique', titre: 'Une courbe de dosage pH-métrique', niveau: '1re' },
  { cle: 'spcl-chaine-mesure', titre: 'Une chaîne de mesure : capteur, conditionneur, convertisseur', niveau: '1re' },
  { cle: 'spcl-spectre-rmn', titre: 'Un spectre de RMN du proton', niveau: 'Tle' },
];

/**
 * LES SPÉCIALITÉS DE LA VOIE GÉNÉRALE (14/09/2026) — les figures que chaque
 * programme appelle, proposées par la lecture de son texte officiel.
 */

/** Histoire-géographie, géopolitique et sciences politiques. */
const HGGSP = [
  { cle: 'hggsp-frontieres-corees', titre: 'La frontière entre les deux Corée', niveau: '1re' },
  { cle: 'hggsp-frontieres-schengen', titre: 'Espace Schengen et frontières extérieures de l’Union européenne', niveau: '1re' },
  { cle: 'hggsp-puissance-routes-soie', titre: 'Les nouvelles routes de la Soie', niveau: '1re' },
  { cle: 'hggsp-puissance-etats-unis', titre: 'Points d’appui et zones d’influence des États-Unis', niveau: '1re' },
  { cle: 'hggsp-religions-inde-pakistan', titre: 'Inde et Pakistan : religions et tensions géopolitiques', niveau: '1re' },
  { cle: 'hggsp-mer-zones-maritimes', titre: 'Mer territoriale, ZEE et haute mer selon Montego Bay', niveau: 'Tle' },
  { cle: 'hggsp-guerre-moyen-orient', titre: 'Conflits et tentatives de paix au Moyen-Orient', niveau: 'Tle' },
  { cle: 'hggsp-memoire-lieux-genocide', titre: 'Lieux de mémoire du génocide des Juifs et des Tsiganes', niveau: 'Tle' },
  { cle: 'hggsp-patrimoine-unesco', titre: 'La répartition du patrimoine mondial de l’Unesco', niveau: 'Tle' },
  { cle: 'hggsp-connaissance-cyberespace', titre: 'Le cyberespace entre réseaux et territoires : câbles et centres de données', niveau: 'Tle' },
];

/** Sciences économiques et sociales. */
const SES = [
  { cle: 'ses-marche-equilibre-surplus', titre: 'Équilibre offre-demande et surplus', niveau: '1re' },
  { cle: 'ses-marche-taxe-forfaitaire', titre: 'Effet d’une taxe forfaitaire sur l’équilibre', niveau: '1re' },
  { cle: 'ses-monopole-equilibre', titre: 'Équilibre du monopole et perte d’efficacité', niveau: '1re' },
  { cle: 'ses-monnaie-bilans-credit', titre: 'Création monétaire : bilans d’une banque et d’une entreprise', niveau: '1re' },
  { cle: 'ses-croissance-sources-pgf', titre: 'Sources de la croissance : facteurs et productivité globale', niveau: 'Tle' },
  { cle: 'ses-mobilite-destinee-recrutement', titre: 'Table de mobilité : destinée et recrutement', niveau: 'Tle' },
  { cle: 'ses-inegalites-lorenz-gini', titre: 'Courbe de Lorenz et coefficient de Gini', niveau: 'Tle' },
  { cle: 'ses-environnement-instruments', titre: 'Instruments face aux externalités environnementales', niveau: 'Tle' },
];

/** Numérique et sciences informatiques. */
const NSI = [
  { cle: 'nsi-von-neumann-machine', titre: 'Architecture de von Neumann', niveau: '1re' },
  { cle: 'nsi-client-serveur-http', titre: 'Requête et réponse HTTP entre client et serveur', niveau: '1re' },
  { cle: 'nsi-arbre-parcours', titre: 'Arbre binaire et ses quatre parcours', niveau: 'Tle' },
  { cle: 'nsi-abr-insertion', titre: 'Insertion dans un arbre binaire de recherche', niveau: 'Tle' },
  { cle: 'nsi-graphe-representations', titre: 'Un graphe, sa matrice d’adjacence et ses listes de successeurs', niveau: 'Tle' },
  { cle: 'nsi-pile-file', titre: 'Pile (LIFO) et file (FIFO)', niveau: 'Tle' },
  { cle: 'nsi-routage-rip-ospf', titre: 'Réseau routé : nombre de sauts ou coût des liens', niveau: 'Tle' },
  { cle: 'nsi-bdd-cles', titre: 'Deux relations liées par une clef étrangère', niveau: 'Tle' },
];

/** Sciences de l'ingénieur. */
const SI = [
  { cle: 'si-effort-flux-puissance', titre: 'Grandeurs effort et flux de chaque énergie', niveau: '1re' },
  { cle: 'si-chaine-puissance', titre: 'Chaîne de puissance : alimenter, moduler, convertir, transmettre', niveau: '1re' },
  { cle: 'si-sysml-exigences-cas', titre: 'Diagramme d’exigences et cas d’utilisation SysML', niveau: '1re' },
  { cle: 'si-graphe-liaisons', titre: 'Graphe des liaisons et des actions mécaniques', niveau: '1re' },
  { cle: 'si-trame-encapsulation', titre: 'Trame et encapsulation d’un protocole réseau', niveau: '1re' },
  { cle: 'si-asservissement-boucle', titre: 'Système asservi en boucle fermée avec correcteur proportionnel', niveau: 'Tle' },
  { cle: 'si-trois-realites-ecarts', titre: 'Écarts entre cahier des charges, système virtuel et système réel', niveau: 'Tle' },
  { cle: 'si-etats-transitions', titre: 'Diagramme d’états-transitions d’un objet à événements discrets', niveau: 'Tle' },
];

/** Éducation physique, pratiques et culture sportives. */
const EPPCS = [
  { cle: 'eppcs-filieres-energetiques', titre: 'Les trois filières énergétiques et la durée de l’effort', niveau: '1re' },
  { cle: 'eppcs-dimensions-sante', titre: 'Les trois dimensions de la santé', niveau: '1re' },
  { cle: 'eppcs-organisation-sport-france', titre: 'Du mouvement olympique au club : l’organisation du sport en France', niveau: 'Tle' },
  { cle: 'eppcs-evolution-apsa', titre: 'Ce qui fait évoluer une activité sportive : matériaux, pratiquants, règlement', niveau: 'Tle' },
];

/**
 * LES DIX-HUIT MATIÈRES QUI N'AVAIENT AUCUN EMPLACEMENT (14/09/2026).
 *
 * Relevées par l'audit du 14/09/2026 : ni figure, ni emplacement, ni emprunt.
 * Chaque ligne suit un chapitre nommé par leur référentiel (fichiers
 * `Referentiels/Techno` et `Referentiels/Generale` côté serveur). Les planches
 * sont importées à la main depuis l'administration — plus par l'agent n8n.
 *
 * LES ŒUVRES SOUS DROITS SONT ÉCARTÉES. Le corpus limitatif d'arts plastiques
 * cite aussi Gursky et Louise Bourgeois : aucune reproduction libre n'existe,
 * seules les œuvres du domaine public ont un emplacement.
 */

/** STMG — sciences de gestion et numérique (1re) et volet gestion de terminale. */
const SCIENCES_GESTION = [
  { cle: 'sgn-donnee-connaissance', titre: 'De la donnée à l’information et à la connaissance', niveau: '1re' },
  { cle: 'sgn-processus-gestion', titre: 'Un processus de gestion schématisé, de la commande à la facturation', niveau: '1re' },
  { cle: 'sgn-bilan-compte-resultat', titre: 'Le bilan et le compte de résultat simplifiés', niveau: '1re' },
  { cle: 'sgn-seuil-rentabilite', titre: 'Le seuil de rentabilité et le point mort', niveau: '1re' },
  { cle: 'sgn-tableau-bord', titre: 'Un tableau de bord et ses indicateurs de performance', niveau: '1re' },
  { cle: 'sgn-frng-bfr-tresorerie', titre: 'Fonds de roulement, besoin en fonds de roulement et trésorerie nette', niveau: 'Tle' },
  { cle: 'sgn-diagramme-flux', titre: 'Un diagramme des flux de données entre acteurs', niveau: 'Tle' },
  { cle: 'sgn-flux-tendus-pousses', titre: 'Flux tendus et flux poussés dans une chaîne logistique', niveau: 'Tle' },
  { cle: 'sgn-cout-complet', titre: 'Du coût d’achat au coût de revient : la méthode du coût complet', niveau: 'Tle' },
  { cle: 'sgn-processus-achat', titre: 'Les étapes du processus d’achat du consommateur', niveau: 'Tle' },
];

/** STMG — management (1re) et volet management de terminale. */
const MANAGEMENT = [
  { cle: 'mgt-fonctions-management', titre: 'Les fonctions du management : prévoir, organiser, animer, contrôler', niveau: '1re' },
  { cle: 'mgt-categories-organisations', titre: 'Entreprise privée, organisation publique, organisation de la société civile', niveau: '1re' },
  { cle: 'mgt-parties-prenantes', titre: 'L’organisation et ses parties prenantes', niveau: '1re' },
  { cle: 'mgt-demarche-strategique', titre: 'Les étapes de la démarche stratégique', niveau: '1re' },
  { cle: 'mgt-diagnostic-swot', titre: 'Diagnostic interne et externe : forces, faiblesses, opportunités, menaces', niveau: '1re' },
  { cle: 'mgt-chaine-valeur', titre: 'La chaîne de valeur de Porter', niveau: '1re' },
  { cle: 'mgt-strategies-generiques', titre: 'Domination par les coûts ou différenciation', niveau: '1re' },
  { cle: 'mgt-structures-organigramme', titre: 'Organigrammes : structures hiérarchique, fonctionnelle, divisionnelle', niveau: 'Tle' },
  { cle: 'mgt-taylorisme-toyotisme', titre: 'Taylorisme et toyotisme, deux organisations du travail', niveau: 'Tle' },
  { cle: 'mgt-styles-direction', titre: 'Les styles de direction : autoritaire, paternaliste, consultatif, participatif', niveau: 'Tle' },
  { cle: 'mgt-pyramide-maslow', titre: 'La pyramide des besoins de Maslow et la motivation', niveau: 'Tle' },
];

/** STMG — droit et économie. */
const DROIT_ECONOMIE = [
  { cle: 'droiteco-hierarchie-normes', titre: 'La hiérarchie des normes', niveau: '1re' },
  { cle: 'droiteco-organisation-juridictionnelle', titre: 'L’organisation juridictionnelle française', niveau: '1re' },
  { cle: 'droiteco-proces-civil-penal', titre: 'Les étapes d’un procès civil et d’un procès pénal', niveau: '1re' },
  { cle: 'droiteco-personnes-juridiques', titre: 'Personnes physiques et personnes morales', niveau: '1re' },
  { cle: 'droiteco-circuit-economique', titre: 'Le circuit économique : ménages, entreprises, État, banques, reste du monde', niveau: '1re' },
  { cle: 'droiteco-partage-valeur-ajoutee', titre: 'Le partage de la valeur ajoutée', niveau: '1re' },
  { cle: 'droiteco-equilibre-marche', titre: 'Le prix d’équilibre sur un marché concurrentiel', niveau: '1re' },
  { cle: 'droiteco-modes-financement', titre: 'Autofinancement, financement direct et financement indirect', niveau: '1re' },
  { cle: 'droiteco-responsabilite-civile', titre: 'Fait générateur, dommage et lien de causalité', niveau: 'Tle' },
  { cle: 'droiteco-population-active', titre: 'Population active, emploi et chômage', niveau: 'Tle' },
  { cle: 'droiteco-balance-commerciale', titre: 'La balance des biens et services', niveau: 'Tle' },
  { cle: 'droiteco-chaine-valeur-mondiale', titre: 'La chaîne de valeur mondiale d’un produit', niveau: 'Tle' },
];

/** ST2S — sciences et techniques sanitaires et sociales. */
const SANITAIRE_SOCIAL = [
  { cle: 'stss-determinants-sante', titre: 'Les déterminants de santé, du modèle de Dahlgren et Whitehead', niveau: '1re' },
  { cle: 'stss-protection-sociale', titre: 'Sécurité sociale, complémentaires et aide sociale', niveau: '1re' },
  { cle: 'stss-regime-general', titre: 'Le régime général de la Sécurité sociale et ses branches', niveau: '1re' },
  { cle: 'stss-processus-exclusion', titre: 'De la précarité à l’exclusion, un processus', niveau: '1re' },
  { cle: 'stss-pyramide-ages', titre: 'La pyramide des âges de la population française', niveau: '1re' },
  { cle: 'stss-modes-intervention-sante', titre: 'Promotion, éducation, prévention : les modes d’intervention en santé', niveau: '1re' },
  { cle: 'stss-demarche-etude', titre: 'Les étapes d’une démarche d’étude', niveau: '1re' },
  { cle: 'stss-systeme-sante', titre: 'L’organisation du système de santé : État, ARS, établissements, professionnels', niveau: 'Tle' },
  { cle: 'stss-demarche-projet', titre: 'La démarche de projet : diagnostic, plan d’actions, mise en œuvre, évaluation', niveau: 'Tle' },
  { cle: 'stss-veille-sanitaire', titre: 'Un système de veille sanitaire : signalement, alerte, réponse', niveau: 'Tle' },
];

/** Philosophie — terminale. Peu de figures : une matière d'arguments. */
const PHILOSOPHIE = [
  { cle: 'philo-allegorie-caverne', titre: 'L’allégorie de la caverne', niveau: 'Tle' },
  { cle: 'philo-frise-auteurs', titre: 'Frise chronologique des auteurs du programme', niveau: 'Tle' },
  { cle: 'philo-structure-dissertation', titre: 'Introduction, parties, transitions, conclusion : la structure d’une dissertation', niveau: 'Tle' },
  { cle: 'philo-appareil-psychique', titre: 'Le ça, le moi et le surmoi', niveau: 'Tle' },
  { cle: 'philo-reperes-programme', titre: 'Les repères du programme, couple par couple', niveau: 'Tle' },
];

/** Humanités, littérature et philosophie. */
const HLP = [
  { cle: 'hlp-parties-discours', titre: 'Exorde, narration, confirmation, péroraison : les parties du discours', niveau: '1re' },
  { cle: 'hlp-geocentrisme-heliocentrisme', titre: 'Du géocentrisme à l’héliocentrisme', niveau: '1re' },
  { cle: 'hlp-grandes-decouvertes', titre: 'Les grandes découvertes et les nouveaux mondes', niveau: '1re' },
  { cle: 'hlp-perspective-renaissance', titre: 'La perspective de la Renaissance : point de fuite et lignes de fuite', niveau: '1re' },
  { cle: 'hlp-frise-romantisme-avant-gardes', titre: 'Du romantisme aux avant-gardes du XXe siècle', niveau: 'Tle' },
];

/** LLCER anglais — ce que la spécialité ajoute aux planches d'anglais. */
const LLCER_ANGLAIS = [
  { cle: 'llceran-frise-litterature', titre: 'Frise de la littérature anglophone, du théâtre élisabéthain au postmodernisme', niveau: '1re' },
  { cle: 'llceran-frankenstein-frontispice', titre: 'Le frontispice de Frankenstein (1831)', niveau: '1re' },
  { cle: 'llceran-empire-britannique', titre: 'L’Empire britannique à son apogée', niveau: '1re' },
  { cle: 'llceran-frontiere-ouest', titre: 'La conquête de l’Ouest et la frontière américaine', niveau: 'Tle' },
  { cle: 'llceran-migrations-etats-unis', titre: 'Les vagues d’immigration vers les États-Unis', niveau: 'Tle' },
];

/** LLCER anglais, monde contemporain. */
const AMC = [
  { cle: 'amc-parlement-britannique', titre: 'Le système parlementaire britannique', niveau: '1re' },
  { cle: 'amc-institutions-etats-unis', titre: 'Les institutions fédérales des États-Unis et la séparation des pouvoirs', niveau: '1re' },
  { cle: 'amc-commonwealth', titre: 'Les pays du Commonwealth', niveau: '1re' },
  { cle: 'amc-college-electoral', titre: 'L’élection présidentielle américaine et le collège électoral', niveau: '1re' },
  { cle: 'amc-nations-royaume-uni', titre: 'Les quatre nations du Royaume-Uni et la dévolution', niveau: 'Tle' },
  { cle: 'amc-frontiere-mexique', titre: 'La frontière entre les États-Unis et le Mexique', niveau: 'Tle' },
  { cle: 'amc-anglais-monde', titre: 'L’anglais dans le monde : langue officielle, seconde, étrangère', niveau: 'Tle' },
  { cle: 'amc-alliances-defense', titre: 'L’Otan et l’alliance Five Eyes', niveau: 'Tle' },
];

/** LLCER espagnol — ce que la spécialité ajoute aux planches d'espagnol. */
const LLCER_ESPAGNOL = [
  { cle: 'llceres-langues-espagne', titre: 'Les langues de l’Espagne : castillan, catalan, basque, galicien', niveau: '1re' },
  { cle: 'llceres-chemin-saint-jacques', titre: 'Les chemins de Saint-Jacques-de-Compostelle', niveau: '1re' },
  { cle: 'llceres-al-andalus', titre: 'Al-Andalus et la Reconquista', niveau: '1re' },
  { cle: 'llceres-langues-amerindiennes', titre: 'Quechua, nahuatl, guarani : les langues amérindiennes', niveau: '1re' },
  { cle: 'llceres-frise-litterature', titre: 'Frise de la littérature hispanique, du Siècle d’or au réalisme magique', niveau: 'Tle' },
  { cle: 'llceres-independances', titre: 'Les indépendances de l’Amérique latine au XIXe siècle', niveau: 'Tle' },
  { cle: 'llceres-civilisations-precolombiennes', titre: 'Aztèques, Mayas et Incas', niveau: 'Tle' },
  { cle: 'llceres-frontiere-mexique', titre: 'La frontière entre le Mexique et les États-Unis', niveau: 'Tle' },
];

/** LLCA latin. */
const LLCA_LATIN = [
  { cle: 'latin-empire-romain', titre: 'L’Empire romain à son apogée', niveau: '1re' },
  { cle: 'latin-forum-romain', titre: 'Le plan du forum romain', niveau: '1re' },
  { cle: 'latin-frise-rome', titre: 'Royauté, République, Empire : frise chronologique de Rome', niveau: '1re' },
  { cle: 'latin-dieux-romains', titre: 'Les principaux dieux romains et leurs attributs', niveau: '1re' },
  { cle: 'latin-exil-ovide', titre: 'De Rome à Tomi, le trajet de l’exil d’Ovide', niveau: 'Tle' },
  { cle: 'latin-sites-mediterranee', titre: 'Les grands sites archéologiques romains de Méditerranée', niveau: 'Tle' },
];

/** LLCA grec. */
const LLCA_GREC = [
  { cle: 'grec-monde-grec', titre: 'Le monde grec et ses colonies en Méditerranée', niveau: '1re' },
  { cle: 'grec-acropole', titre: 'Le plan de l’Acropole d’Athènes', niveau: '1re' },
  { cle: 'grec-democratie-athenienne', titre: 'Les institutions de la démocratie athénienne', niveau: '1re' },
  { cle: 'grec-alphabet', titre: 'L’alphabet grec', niveau: '1re' },
  { cle: 'grec-empire-alexandre', titre: 'L’empire d’Alexandre le Grand', niveau: '1re' },
  { cle: 'grec-theatre-grec', titre: 'Orchestra, skênê, theatron : le plan d’un théâtre grec', niveau: 'Tle' },
];

/** Arts plastiques. */
const ARTS_PLASTIQUES = [
  { cle: 'artspla-perspective', titre: 'Perspective linéaire et point de fuite', niveau: '1re' },
  { cle: 'artspla-cercle-chromatique', titre: 'Couleurs primaires, secondaires et complémentaires', niveau: '1re' },
  { cle: 'artspla-ready-made', titre: 'Fontaine de Marcel Duchamp, un ready-made', niveau: '1re' },
  { cle: 'artspla-frise-mouvements', titre: 'Frise des mouvements artistiques du XXe siècle', niveau: '1re' },
  { cle: 'artspla-vernet-toulon', titre: 'La ville et la rade de Toulon de Joseph Vernet (1756)', niveau: 'Tle' },
  { cle: 'artspla-giambologna-apennin', titre: 'Le Colosse de l’Apennin de Giambologna', niveau: 'Tle' },
];

/** Histoire des arts. */
const HISTOIRE_ARTS = [
  { cle: 'hda-ordres-architecture', titre: 'Les ordres d’architecture : dorique, ionique, corinthien', niveau: '1re' },
  { cle: 'hda-plan-eglise', titre: 'Le plan d’une église romane et d’une cathédrale gothique', niveau: '1re' },
  { cle: 'hda-frise-periodes', titre: 'Frise des grandes périodes de l’histoire de l’art', niveau: '1re' },
  { cle: 'hda-notre-dame-fleche', titre: 'Notre-Dame de Paris et la flèche de Viollet-le-Duc', niveau: 'Tle' },
  { cle: 'hda-paris-capitale-arts', titre: 'Paris, capitale des arts : Montmartre et Montparnasse', niveau: 'Tle' },
];

/** Cinéma-audiovisuel. */
const CINEMA_AUDIOVISUEL = [
  { cle: 'cav-echelle-plans', titre: 'L’échelle des plans, du plan d’ensemble au très gros plan', niveau: '1re' },
  { cle: 'cav-mouvements-camera', titre: 'Panoramique, travelling, plongée et contre-plongée', niveau: '1re' },
  { cle: 'cav-regle-180-degres', titre: 'La règle des 180 degrés et le champ-contrechamp', niveau: '1re' },
  { cle: 'cav-fabrication-film', titre: 'Écriture, tournage, montage, diffusion : la fabrication d’un film', niveau: '1re' },
  { cle: 'cav-frise-cinema', titre: 'Frise de l’histoire du cinéma, du muet au numérique', niveau: '1re' },
];

/** Musique. */
const MUSIQUE = [
  { cle: 'musique-portee-notes', titre: 'La portée, les clés et les notes', niveau: '1re' },
  { cle: 'musique-familles-instruments', titre: 'Les familles d’instruments de l’orchestre', niveau: '1re' },
  { cle: 'musique-disposition-orchestre', titre: 'La disposition de l’orchestre symphonique', niveau: '1re' },
  { cle: 'musique-frise-periodes', titre: 'Frise des périodes musicales, du Moyen Âge au XXe siècle', niveau: 'Tle' },
  { cle: 'musique-notation-medievale', titre: 'La notation musicale médiévale et l’Ars nova', niveau: 'Tle' },
  { cle: 'musique-forme-concerto', titre: 'Le concerto classique et ses trois mouvements', niveau: 'Tle' },
];

/** Théâtre. */
const THEATRE = [
  { cle: 'theatre-scene-italienne', titre: 'Plateau, cintres, coulisses, salle : la scène à l’italienne', niveau: '1re' },
  { cle: 'theatre-theatre-antique', titre: 'Le théâtre antique : orchestra, skênê et gradins', niveau: '1re' },
  { cle: 'theatre-reperes-plateau', titre: 'Cour et jardin, lointain et face : se repérer au plateau', niveau: '1re' },
  { cle: 'theatre-frise-histoire', titre: 'Frise de l’histoire du théâtre, de l’Antiquité à aujourd’hui', niveau: 'Tle' },
];

/** Danse. */
const DANSE = [
  { cle: 'danse-kinesphere-laban', titre: 'La kinésphère et les directions de Laban', niveau: '1re' },
  { cle: 'danse-procedes-composition', titre: 'Unisson, canon, contrepoint, accumulation', niveau: '1re' },
  { cle: 'danse-notations-mouvement', titre: 'Feuillet, Benesh, Labanotation : noter le mouvement', niveau: 'Tle' },
];

/** Arts du cirque. */
const ARTS_CIRQUE = [
  { cle: 'cirque-piste-chapiteau', titre: 'La piste et le chapiteau', niveau: '1re' },
  { cle: 'cirque-familles-disciplines', titre: 'Les familles de disciplines du cirque', niveau: '1re' },
  { cle: 'cirque-figures-jonglage', titre: 'Cascade, fontaine, douche : les figures de base du jonglage', niveau: 'Tle' },
];

export const EMPLACEMENTS = [
  ...SCIENCES,
  ...PHYSIQUE_CHIMIE,
  ...PHYSIQUE_CHIMIE_SANTE,
  ...MATHS,
  ...FRANCAIS,
  ...HISTOIRE_GEO,
  ...ANGLAIS,
  ...ESPAGNOL,
  ...SVT,
  ...BIOLOGIE_HUMAINE,
  ...BIOTECHNOLOGIES,
  ...SPCL,
  ...HGGSP,
  ...SES,
  ...NSI,
  ...SI,
  ...EPPCS,
  ...SCIENCES_GESTION,
  ...MANAGEMENT,
  ...DROIT_ECONOMIE,
  ...SANITAIRE_SOCIAL,
  ...PHILOSOPHIE,
  ...HLP,
  ...LLCER_ANGLAIS,
  ...AMC,
  ...LLCER_ESPAGNOL,
  ...LLCA_LATIN,
  ...LLCA_GREC,
  ...ARTS_PLASTIQUES,
  ...HISTOIRE_ARTS,
  ...CINEMA_AUDIOVISUEL,
  ...MUSIQUE,
  ...THEATRE,
  ...DANSE,
  ...ARTS_CIRQUE,
];
