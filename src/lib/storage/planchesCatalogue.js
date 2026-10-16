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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'sc-parties-du-corps', titre: 'Les parties du corps', niveau: 'CP' },
  { cle: 'sc-besoins-plante', titre: 'Ce dont une plante a besoin', niveau: 'CP' },
  { cle: 'sc-lavage-mains', titre: 'Bien se laver les mains', niveau: 'CP' },
  { cle: 'sc-croissance-humaine', titre: 'Les étapes de la vie humaine', niveau: 'CP' },
  { cle: 'sc-horloge', titre: 'Lire l’heure sur une horloge', niveau: 'CE1' },
  { cle: 'sc-plan-quartier', titre: 'Le plan d’un quartier', niveau: 'CE1' },
  { cle: 'sc-dissolution', titre: 'Ce qui se dissout, ce qui ne se dissout pas', niveau: 'CE1' },
  { cle: 'sc-air-matiere', titre: 'L’air est de la matière', niveau: 'CE2' },
  { cle: 'sc-milieu-mare', titre: 'La mare et ses habitants', niveau: 'CE2' },
  { cle: 'sc-dentures-animaux', titre: 'Les dentures et le régime alimentaire', niveau: 'CE2' },
  { cle: 'sc-decantation-filtration', titre: 'Décantation et filtration', niveau: 'CM1' },
  { cle: 'sc-station-meteo', titre: 'Les instruments de la station météo', niveau: 'CM1' },
  { cle: 'sc-fleur-pollinisation', titre: 'La fleur et la pollinisation', niveau: 'CM1' },
  { cle: 'sc-sources-energie', titre: 'Les sources d’énergie', niveau: 'CM1' },
  { cle: 'sc-appareil-digestif', titre: 'Le trajet des aliments', niveau: 'CM2' },
  { cle: 'sc-respiration-circulation', titre: 'Respirer et faire circuler le sang', niveau: 'CM2' },
  { cle: 'sc-reseau-alimentaire', titre: 'Un réseau alimentaire de la forêt', niveau: 'CM2' },
  { cle: 'sc-chaine-conversion-energie', titre: 'De l’éolienne à la lampe', niveau: 'CM2' },
  { cle: 'sc-microscope', titre: 'Le microscope', niveau: '6e' },
  { cle: 'sc-cellules-observees', titre: 'Des cellules observées au microscope', niveau: '6e' },
  { cle: 'sc-reproduction-asexuee', titre: 'Le fraisier se reproduit par stolons', niveau: '6e' },
  { cle: 'sc-etats-particules', titre: 'Les particules dans les trois états', niveau: '6e' },
  { cle: 'sc-symboles-electriques', titre: 'Du circuit réel au schéma normalisé', niveau: '6e' },
  { cle: 'sc-reseau-informatique', titre: 'Le trajet d’une information sur Internet', niveau: '6e' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'pc-ombres', titre: 'L’ombre propre et l’ombre portée', niveau: '5e' },
  { cle: 'pc-chronophotographie-mouvements', titre: 'Mouvements uniforme, accéléré et ralenti', niveau: '5e' },
  { cle: 'pc-pictogrammes-danger', titre: 'Les pictogrammes de danger', niveau: '5e' },
  { cle: 'pc-branchement-multimetre', titre: 'Brancher un ampèremètre et un voltmètre', niveau: '4e' },
  { cle: 'pc-caracteristique-ohm', titre: 'La caractéristique d’un conducteur ohmique', niveau: '4e' },
  { cle: 'pc-oscillogramme-son', titre: 'Un son à l’oscilloscope : période et amplitude', niveau: '4e' },
  { cle: 'pc-diagramme-interactions', titre: 'Le diagramme objet-interactions', niveau: '4e' },
  { cle: 'pc-energies-chute', titre: 'Énergie cinétique, de position et mécanique lors d’une chute', niveau: '3e' },
  { cle: 'pc-preparation-solution', titre: 'Préparer une solution : dissolution et dilution', niveau: '3e' },
  { cle: 'pc-image-lentille', titre: 'Construire l’image donnée par une lentille convergente', niveau: '2de' },
  { cle: 'pc-niveaux-energie', titre: 'Diagramme de niveaux d’énergie et spectres de raies', niveau: '1re' },
  { cle: 'pc-synthese-couleurs', titre: 'Synthèse additive et synthèse soustractive', niveau: '1re' },
  { cle: 'pc-spectre-infrarouge', titre: 'Lire un spectre infrarouge', niveau: '1re' },
  { cle: 'pc-onde-progressive', titre: 'Une onde progressive périodique', niveau: '1re' },
  { cle: 'pc-spectre-absorption-etalonnage', titre: 'Spectre d’absorption et droite d’étalonnage', niveau: '1re' },
  { cle: 'pc-transferts-thermiques', titre: 'Les modes de transfert thermique', niveau: '1re' },
  { cle: 'pc-oreille-audition', titre: 'L’oreille et la perception d’un son', niveau: '1re' },
  { cle: 'pc-tension-arterielle', titre: 'La mesure de la tension artérielle', niveau: '1re' },
  { cle: 'pc-ampoule-decanter', titre: 'L’extraction par ampoule à décanter', niveau: '1re' },
  { cle: 'pc-liaison-peptidique', titre: 'Acides α-aminés et liaison peptidique', niveau: '1re' },
  { cle: 'pc-lois-kepler', titre: 'Les lois de Kepler', niveau: 'Tle' },
  { cle: 'pc-poussee-archimede', titre: 'La poussée d’Archimède', niveau: 'Tle' },
  { cle: 'pc-courbe-titrage', titre: 'Courbes de titrage pH-métrique et conductimétrique', niveau: 'Tle' },
  { cle: 'pc-suivi-cinetique', titre: 'Le suivi cinétique d’une transformation', niveau: 'Tle' },
  { cle: 'pc-mecanisme-reactionnel', titre: 'Un mécanisme réactionnel en flèches courbes', niveau: 'Tle' },
  { cle: 'pc-decroissance-radioactive', titre: 'La décroissance radioactive et la demi-vie', niveau: 'Tle' },
  { cle: 'pc-enantiomeres', titre: 'Énantiomères : représentations de Cram et de Fischer', niveau: 'Tle' },
  { cle: 'pc-echographie', titre: 'Le principe de l’échographie', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'math-horloge', titre: 'Lire l’heure sur une horloge', niveau: 'CP' },
  { cle: 'math-dizaines-unites', titre: 'Les dizaines et les unités', niveau: 'CP' },
  { cle: 'math-quadrillage-deplacement', titre: 'Se repérer et se déplacer sur un quadrillage', niveau: 'CP' },
  { cle: 'math-multiplication-rangees', titre: 'La multiplication en rangées', niveau: 'CP' },
  { cle: 'math-perpendiculaires-paralleles', titre: 'Angle droit, perpendiculaires et parallèles', niveau: 'CE2' },
  { cle: 'math-tableau-conversion', titre: 'Le tableau de conversion des longueurs et des masses', niveau: 'CE2' },
  { cle: 'math-tableau-numeration', titre: 'Le tableau de numération, des millions aux millièmes', niveau: 'CM1' },
  { cle: 'math-division-posee', titre: 'La division posée', niveau: 'CM1' },
  { cle: 'math-droite-segment', titre: 'Droite, segment et demi-droite', niveau: '6e' },
  { cle: 'math-cercle', titre: 'Le cercle et son vocabulaire', niveau: '6e' },
  { cle: 'math-rapporteur', titre: 'Mesurer un angle au rapporteur', niveau: '6e' },
  { cle: 'math-diagramme-circulaire', titre: 'Le diagramme circulaire', niveau: '6e' },
  { cle: 'math-angles-paralleles-secante', titre: 'Angles alternes-internes et correspondants', niveau: '5e' },
  { cle: 'math-droite-relatifs', titre: 'Les nombres relatifs sur une droite graduée', niveau: '5e' },
  { cle: 'math-theoreme-milieux', titre: 'Le théorème des milieux', niveau: '4e' },
  { cle: 'math-pyramide-cone-sections', titre: 'La pyramide, le cône et leurs sections', niveau: '4e' },
  { cle: 'math-distributivite-aires', titre: 'La distributivité et les identités remarquables en aires', niveau: '4e' },
  { cle: 'math-latitude-longitude', titre: 'Latitude et longitude sur la sphère terrestre', niveau: '3e' },
  { cle: 'math-image-antecedent', titre: 'Lire une image et un antécédent sur une courbe', niveau: '3e' },
  { cle: 'math-ensembles-nombres', titre: 'Les ensembles de nombres N, Z, D, Q et R', niveau: '2de' },
  { cle: 'math-intervalles', titre: 'Les intervalles sur la droite réelle', niveau: '2de' },
  { cle: 'math-fonctions-reference', titre: 'Les courbes des fonctions de référence', niveau: '2de' },
  { cle: 'math-resolution-graphique', titre: 'Résoudre graphiquement f(x) = k et f(x) < k', niveau: '2de' },
  { cle: 'math-tableau-signes', titre: 'Un tableau de signes', niveau: '2de' },
  { cle: 'math-signe-trinome', titre: 'Le signe du trinôme selon a et Δ', niveau: '1re' },
  { cle: 'math-produit-scalaire-projection', titre: 'Le produit scalaire par projection orthogonale', niveau: '1re' },
  { cle: 'math-al-kashi', titre: 'La formule d’Al-Kashi dans un triangle quelconque', niveau: '1re' },
  { cle: 'math-asymptotes', titre: 'Limites et asymptotes d’une courbe', niveau: 'Tle' },
  { cle: 'math-valeurs-intermediaires', titre: 'Le théorème des valeurs intermédiaires', niveau: 'Tle' },
  { cle: 'math-convexite', titre: 'Convexité et point d’inflexion', niveau: 'Tle' },
  { cle: 'math-sinus-cosinus', titre: 'Les courbes des fonctions sinus et cosinus', niveau: 'Tle' },
  { cle: 'math-triangle-pascal', titre: 'Le triangle de Pascal', niveau: 'Tle' },
  { cle: 'math-droites-plans-espace', titre: 'Droites et plans de l’espace dans un cube', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'fr-lettres-et-sons', titre: 'Les lettres et leurs sons', niveau: 'CP' },
  { cle: 'fr-anatomie-phrase', titre: 'Une phrase : majuscule, mots et point', niveau: 'CP' },
  { cle: 'fr-chaine-accords', titre: 'La chaîne des accords dans le groupe nominal', niveau: 'CE1' },
  { cle: 'fr-article-dictionnaire', titre: 'Lire un article de dictionnaire', niveau: 'CE1' },
  { cle: 'fr-construction-mot', titre: 'Préfixe, radical, suffixe : la construction d’un mot', niveau: 'CM1' },
  { cle: 'fr-temps-composes', titre: 'Auxiliaire et participe passé : les temps composés', niveau: 'CM1' },
  { cle: 'fr-poeme-theatre-recit', titre: 'Poème, scène de théâtre, récit : trois mises en page', niveau: 'CM1' },
  { cle: 'fr-anatomie-article-presse', titre: 'Un article de presse et sa source', niveau: 'CM1' },
  { cle: 'fr-phrase-simple-complexe', titre: 'Phrase simple, phrase complexe : une proposition par verbe', niveau: 'CM2' },
  { cle: 'fr-mise-en-page-lettre', titre: 'La mise en page d’une lettre', niveau: 'CM2' },
  { cle: 'fr-auteur-narrateur-personnage', titre: 'Auteur, narrateur, personnage', niveau: 'CM2' },
  { cle: 'fr-ponctuation-dialogue', titre: 'La ponctuation du dialogue', niveau: '6e' },
  { cle: 'fr-lecture-image', titre: 'Décrire une image : plans, cadrage et lignes de force', niveau: '6e' },
  { cle: 'fr-voyage-ulysse', titre: 'Le voyage d’Ulysse', niveau: '6e' },
  { cle: 'fr-liens-propositions', titre: 'Juxtaposition, coordination, subordination', niveau: '5e' },
  { cle: 'fr-voix-active-passive', titre: 'De la voix active à la voix passive', niveau: '5e' },
  { cle: 'fr-roue-circonstancielles', titre: 'La roue des circonstancielles', niveau: '4e' },
  { cle: 'fr-hesitation-fantastique', titre: 'Étrange, fantastique, merveilleux : l’hésitation', niveau: '4e' },
  { cle: 'fr-structure-argumentation', titre: 'Thèse, arguments, exemples : l’édifice argumentatif', niveau: '4e' },
  { cle: 'fr-plan-commentaire', titre: 'Le plan d’un commentaire littéraire', niveau: '2de' },
  { cle: 'fr-trois-unites', titre: 'La règle des trois unités', niveau: '2de' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'hg-elements-carte', titre: 'Les éléments d’une carte : titre, légende, orientation, échelle', niveau: 'CM1' },
  { cle: 'hg-frise-siecles', titre: 'La frise des siècles, avant et après Jésus-Christ', niveau: 'CM1' },
  { cle: 'hg-gaule-conquete-romaine', titre: 'La Gaule et la conquête romaine', niveau: 'CM1' },
  { cle: 'hg-symboles-republique', titre: 'Les symboles de la République française', niveau: 'CM1' },
  { cle: 'hg-chateau-fort', titre: 'Le château fort au Moyen Âge', niveau: 'CM1' },
  { cle: 'hg-societe-ordres', titre: 'La société d’ordres à la veille de 1789', niveau: 'CM1' },
  { cle: 'hg-frise-regimes-politiques', titre: 'La frise des régimes politiques de la France depuis 1789', niveau: 'CM2' },
  { cle: 'hg-frise-xxe-siecle', titre: 'La frise du XXe siècle', niveau: 'CM2' },
  { cle: 'hg-europe-napoleonienne', titre: 'L’Europe napoléonienne en 1811', niveau: 'CM2' },
  { cle: 'hg-reseaux-transport-france', titre: 'Les réseaux de transport en France', niveau: 'CM2' },
  { cle: 'hg-industrialisation-europe', titre: 'L’Europe industrielle vers 1900', niveau: 'CM2' },
  { cle: 'hg-peuplement-neolithique', titre: 'Le peuplement de la Terre et les foyers du Néolithique', niveau: '6e' },
  { cle: 'hg-croissant-fertile', titre: 'Le Croissant fertile et la Mésopotamie', niveau: '6e' },
  { cle: 'hg-democratie-athenienne', titre: 'Les institutions de la démocratie athénienne', niveau: '6e' },
  { cle: 'hg-naissance-monotheismes', titre: 'Judaïsme et christianisme : naissance et diffusion', niveau: '6e' },
  { cle: 'hg-rome-chine-han', titre: 'L’Empire romain et la Chine des Han', niveau: '6e' },
  { cle: 'hg-reperes-physiques-monde', titre: 'Les grands repères physiques de la planète', niveau: '6e' },
  { cle: 'hg-expansion-islam', titre: 'L’expansion de l’islam (622-750)', niveau: '5e' },
  { cle: 'hg-commerce-medieval', titre: 'Les routes du commerce médiéval', niveau: '5e' },
  { cle: 'hg-domaine-royal', titre: 'La formation du royaume de France', niveau: '5e' },
  { cle: 'hg-europe-religieuse-xvie', titre: 'L’Europe des religions au XVIe siècle', niveau: '5e' },
  { cle: 'hg-versailles-plan', titre: 'Versailles, palais et jardins de Louis XIV', niveau: '5e' },
  { cle: 'hg-alea-vulnerabilite-risque', titre: 'Aléa, vulnérabilité et risque', niveau: '5e' },
  { cle: 'hg-idh-monde', titre: 'Les inégalités de développement dans le monde', niveau: '5e' },
  { cle: 'hg-transition-demographique', titre: 'La transition démographique', niveau: '5e' },
  { cle: 'hg-migrations-internationales', titre: 'Les grands flux migratoires dans le monde', niveau: '4e' },
  { cle: 'hg-routes-maritimes', titre: 'Routes maritimes, canaux et détroits', niveau: '4e' },
  { cle: 'hg-frise-suffrage', titre: 'La frise de la conquête du droit de vote en France', niveau: '4e' },
  { cle: 'hg-institutions-ve-republique', titre: 'Les institutions de la Ve République', niveau: '3e' },
  { cle: 'hg-seconde-guerre-mondiale-monde', titre: 'La Seconde Guerre mondiale, un conflit planétaire', niveau: '3e' },
  { cle: 'hg-france-occupee', titre: 'La France occupée (1940-1944)', niveau: '3e' },
  { cle: 'hg-berlin-divise', titre: 'L’Allemagne et Berlin divisés', niveau: '3e' },
  { cle: 'hg-europe-apres-1991', titre: 'L’Europe après la fin de l’URSS', niveau: '3e' },
  { cle: 'hg-mediterranee-medievale', titre: 'La Méditerranée au temps des croisades', niveau: '2de' },
  { cle: 'hg-revolutions-1848', titre: 'Le printemps des peuples en 1848', niveau: '1re' },
  { cle: 'hg-organisation-territoriale', titre: 'L’organisation territoriale de la République', niveau: '1re' },
  { cle: 'hg-chine-recompositions', titre: 'Les recompositions spatiales de la Chine', niveau: '1re' },
  { cle: 'hg-onu-organisation', titre: 'L’organisation des Nations unies', niveau: 'Tle' },
  { cle: 'hg-fabrique-loi', titre: 'Le parcours d’une loi', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'an-fetes', titre: 'Les fêtes du monde anglophone', niveau: 'CP' },
  { cle: 'an-animaux', titre: 'Les animaux familiers', niveau: 'CP' },
  { cle: 'an-famille', titre: 'L’arbre généalogique de la famille', niveau: 'CE1' },
  { cle: 'an-corps-vetements', titre: 'Le corps et les vêtements', niveau: 'CE1' },
  { cle: 'an-salle-de-classe', titre: 'La salle de classe et les matières', niveau: 'CE2' },
  { cle: 'an-calendrier', titre: 'Les jours, les mois et les saisons', niveau: 'CE2' },
  { cle: 'an-maison', titre: 'La maison et ses pièces', niveau: 'CM1' },
  { cle: 'an-ville', titre: 'La ville et les itinéraires', niveau: 'CM2' },
  { cle: 'an-aliments', titre: 'Les aliments : dénombrables et indénombrables', niveau: '5e' },
  { cle: 'an-discours-rapporte', titre: 'Le discours rapporté et la concordance des temps', niveau: '3e' },
  { cle: 'an-phrases-en-if', titre: 'Les trois types de phrases en if', niveau: '3e' },
  { cle: 'an-aires-americaines', titre: 'Les aires anglophones des Amériques', niveau: '1re' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'svt-micro-organismes', titre: 'Les micro-organismes', niveau: '5e' },
  { cle: 'svt-villosite-intestinale', titre: 'La villosité intestinale et l’absorption', niveau: '5e' },
  { cle: 'svt-coeur', titre: 'Le cœur en coupe', niveau: '5e' },
  { cle: 'svt-cycle-roches', titre: 'Le cycle des roches', niveau: '4e' },
  { cle: 'svt-carte-plaques', titre: 'Les plaques lithosphériques, séismes et volcans', niveau: '4e' },
  { cle: 'svt-axe-gonadotrope', titre: 'Le contrôle hormonal des organes reproducteurs', niveau: '4e' },
  { cle: 'svt-cycles-ovarien-uterin', titre: 'Les cycles ovarien et utérin', niveau: '4e' },
  { cle: 'svt-contraception', titre: 'Où agissent les moyens de contraception', niveau: '4e' },
  { cle: 'svt-arbre-phylogenetique', titre: 'Un arbre de parenté', niveau: '3e' },
  { cle: 'svt-traces-glaciaires', titre: 'Les traces d’un ancien glacier', niveau: '3e' },
  { cle: 'svt-caryotype', titre: 'Le caryotype humain', niveau: '3e' },
  { cle: 'svt-piege-petrolier', titre: 'La formation d’un gisement de pétrole', niveau: '2de' },
  { cle: 'svt-cycle-cellulaire', titre: 'Le cycle cellulaire et la quantité d’ADN', niveau: '1re' },
  { cle: 'svt-reaction-inflammatoire', titre: 'La réaction inflammatoire aiguë', niveau: '1re' },
  { cle: 'svt-anticorps', titre: 'La structure d’un anticorps', niveau: '1re' },
  { cle: 'svt-arbre-genealogique', titre: 'Un arbre généalogique', niveau: '1re' },
  { cle: 'svt-anomalies-magnetiques', titre: 'Les anomalies magnétiques autour d’une dorsale', niveau: '1re' },
  { cle: 'svt-ondes-sismiques-globe', titre: 'Les ondes sismiques révèlent l’intérieur du globe', niveau: '1re' },
  { cle: 'svt-point-chaud', titre: 'Un point chaud et son alignement de volcans', niveau: '1re' },
  { cle: 'svt-cortex-moteur', titre: 'L’encéphale et ses aires', niveau: 'Tle' },
  { cle: 'svt-neurone-potentiel', titre: 'Le neurone et le potentiel d’action', niveau: 'Tle' },
  { cle: 'svt-muscle-sarcomere', titre: 'Du muscle au sarcomère', niveau: 'Tle' },
  { cle: 'svt-mitochondrie', titre: 'La mitochondrie et la production d’ATP', niveau: 'Tle' },
  { cle: 'svt-axe-stress', titre: 'La réponse de l’organisme au stress', niveau: 'Tle' },
  { cle: 'svt-coupe-feuille', titre: 'La feuille en coupe : surfaces d’échange', niveau: 'Tle' },
  { cle: 'svt-fleur-coupe', titre: 'La fleur en coupe et la fécondation', niveau: 'Tle' },
  { cle: 'svt-chloroplaste', titre: 'Le chloroplaste et la photosynthèse', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'es-familia', titre: 'La famille', niveau: '5e' },
  { cle: 'es-hora', titre: 'Dire l’heure en espagnol', niveau: '5e' },
  { cle: 'es-aula', titre: 'La salle de classe', niveau: '5e' },
  { cle: 'es-cuerpo', titre: 'Le corps et le visage', niveau: '5e' },
  { cle: 'es-ofrenda', titre: 'L’autel du jour des Morts', niveau: '5e' },
  { cle: 'es-ciudad', titre: 'La ville et l’itinéraire', niveau: '4e' },
  { cle: 'es-machu-picchu', titre: 'Le site du Machu Picchu', niveau: '4e' },
  { cle: 'es-tiempos-pasado', titre: 'Les temps du passé dans le récit', niveau: '3e' },
  { cle: 'es-relieve-espana', titre: 'Le relief et les fleuves de l’Espagne', niveau: '2de' },
  { cle: 'es-comparativos', titre: 'Comparatifs et superlatifs', niveau: '2de' },
  { cle: 'es-hace-dentro-de', titre: 'Se situer dans le temps : hace, desde hace, dentro de', niveau: 'Tle' },
  { cle: 'es-comercio-triangular', titre: 'Le commerce triangulaire', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'bph-niveaux-organisation', titre: 'Les niveaux d’organisation du corps humain', niveau: '1re' },
  { cle: 'bph-plans-de-coupe', titre: 'Les plans de coupe anatomiques', niveau: '1re' },
  { cle: 'bph-cavites-corps', titre: 'Les cavités du corps', niveau: '1re' },
  { cle: 'bph-tissus', titre: 'Tissu épithélial et tissu conjonctif', niveau: '1re' },
  { cle: 'bph-tissu-nodal', titre: 'Le tissu nodal du cœur', niveau: '1re' },
  { cle: 'bph-vaisseaux-sanguins', titre: 'Artère, veine et capillaire', niveau: '1re' },
  { cle: 'bph-baroreflexe', titre: 'La régulation de la fréquence cardiaque', niveau: '1re' },
  { cle: 'bph-atherome', titre: 'La formation d’une plaque d’athérome', niveau: '1re' },
  { cle: 'bph-paroi-digestive', titre: 'La paroi du tube digestif', niveau: '1re' },
  { cle: 'bph-squelette', titre: 'Squelette axial et squelette appendiculaire', niveau: '1re' },
  { cle: 'bph-articulation-synoviale', titre: 'Une articulation mobile', niveau: '1re' },
  { cle: 'bph-systeme-nerveux', titre: 'Système nerveux central et périphérique', niveau: '1re' },
  { cle: 'bph-moelle-epiniere', titre: 'La moelle épinière en coupe', niveau: '1re' },
  { cle: 'bph-placenta', titre: 'Le placenta et les échanges mère-fœtus', niveau: 'Tle' },
  { cle: 'bph-organes-lymphoides', titre: 'Les organes lymphoïdes', niveau: 'Tle' },
  { cle: 'bph-frottis-sanguin', titre: 'Les éléments figurés du sang', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'biotech-microscope-optique', titre: 'Le microscope optique et ses réglages', niveau: '1re' },
  { cle: 'biotech-coloration-gram', titre: 'La coloration de Gram', niveau: '1re' },
  { cle: 'biotech-formes-bacteries', titre: 'Formes et groupements des bactéries', niveau: '1re' },
  { cle: 'biotech-isolement-quadrants', titre: 'L’isolement par la méthode des quadrants', niveau: '1re' },
  { cle: 'biotech-autoclave', titre: 'L’autoclave', niveau: '1re' },
  { cle: 'biotech-dilutions-decimales', titre: 'Dilutions décimales et dénombrement', niveau: '1re' },
  { cle: 'biotech-micropipette', titre: 'La micropipette', niveau: '1re' },
  { cle: 'biotech-glucose', titre: 'Le D-glucose en Fischer et en Haworth', niveau: '1re' },
  { cle: 'biotech-membrane-plasmique', titre: 'La membrane plasmique', niveau: '1re' },
  { cle: 'biotech-cellule-ultrastructure', titre: 'La cellule eucaryote au microscope électronique', niveau: '1re' },
  { cle: 'biotech-compartiments-liquidiens', titre: 'Les compartiments liquidiens', niveau: '1re' },
  { cle: 'biotech-appareil-urinaire', titre: 'L’appareil urinaire', niveau: '1re' },
  { cle: 'biotech-reabsorption-tubulaire', titre: 'La réabsorption du glucose et de l’eau dans le tubule', niveau: '1re' },
  { cle: 'biotech-mode-action-hormones', titre: 'Hormones hydrophiles et hydrophobes', niveau: '1re' },
  { cle: 'biotech-gametogenese', titre: 'La gamétogenèse : spermatogenèse et ovogenèse', niveau: '1re' },
  { cle: 'biotech-chromatographie-ions', titre: 'La chromatographie d’échange d’ions', niveau: '1re' },
  { cle: 'biotech-structure-bacterie', titre: 'La bactérie et sa paroi', niveau: 'Tle' },
  { cle: 'biotech-cycles-viraux', titre: 'La structure d’un virus et ses cycles', niveau: 'Tle' },
  { cle: 'biotech-courbe-croissance', titre: 'La courbe de croissance bactérienne', niveau: 'Tle' },
  { cle: 'biotech-antibiogramme', titre: 'Un antibiogramme', niveau: 'Tle' },
  { cle: 'biotech-types-respiratoires', titre: 'Les types respiratoires en gélose profonde', niveau: 'Tle' },
  { cle: 'biotech-cinetique-michaelis', titre: 'La cinétique enzymatique de Michaelis', niveau: 'Tle' },
  { cle: 'biotech-electrophorese', titre: 'L’électrophorèse sur gel', niveau: 'Tle' },
  { cle: 'biotech-clonage-plasmide', titre: 'Le clonage d’un gène dans un plasmide', niveau: 'Tle' },
  { cle: 'biotech-cycle-azote', titre: 'Le cycle de l’azote', niveau: 'Tle' },
];

/** STL — sciences physiques et chimiques en laboratoire. */
const SPCL = [
  { cle: 'spcl-courbe-ph-metrique', titre: 'Une courbe de dosage pH-métrique', niveau: '1re' },
  { cle: 'spcl-chaine-mesure', titre: 'Une chaîne de mesure : capteur, conditionneur, convertisseur', niveau: '1re' },
  { cle: 'spcl-spectre-rmn', titre: 'Un spectre de RMN du proton', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'spcl-filtration-buchner', titre: 'La filtration sous vide sur Büchner', niveau: '1re' },
  { cle: 'spcl-purete-kofler-ccm', titre: 'Contrôler la pureté : banc Kofler et CCM', niveau: '1re' },
  { cle: 'spcl-cones-retine', titre: 'La rétine : cônes et bâtonnets', niveau: '1re' },
  { cle: 'spcl-appareil-photo', titre: 'Le modèle de l’appareil photographique', niveau: '1re' },
  { cle: 'spcl-loupe', titre: 'L’image donnée par une loupe', niveau: '1re' },
  { cle: 'spcl-pont-diviseur', titre: 'Le pont diviseur de tension', niveau: '1re' },
  { cle: 'spcl-montage-ali', titre: 'Le montage amplificateur à ALI', niveau: '1re' },
  { cle: 'spcl-can-quantum', titre: 'La conversion analogique-numérique', niveau: '1re' },
  { cle: 'spcl-hysteresis', titre: 'Régulation tout ou rien avec hystérésis', niveau: '1re' },
  { cle: 'spcl-distillation-fractionnee', titre: 'La distillation fractionnée', niveau: 'Tle' },
  { cle: 'spcl-diagramme-binaire', titre: 'Le diagramme binaire liquide-vapeur', niveau: 'Tle' },
  { cle: 'spcl-oscillations-amorties', titre: 'Oscillations libres et amorties', niveau: 'Tle' },
  { cle: 'spcl-courbe-resonance', titre: 'La courbe de résonance', niveau: 'Tle' },
  { cle: 'spcl-ondes-stationnaires', titre: 'Les ondes stationnaires sur une corde', niveau: 'Tle' },
  { cle: 'spcl-spectre-son', titre: 'Le spectre d’un son : fondamental et harmoniques', niveau: 'Tle' },
  { cle: 'spcl-fibre-optique', titre: 'La fibre optique et la réflexion totale', niveau: 'Tle' },
  { cle: 'spcl-polarimetre', titre: 'Polariseur, analyseur et polarimètre', niveau: 'Tle' },
  { cle: 'spcl-microscope-optique', titre: 'Le modèle du microscope', niveau: 'Tle' },
  { cle: 'spcl-telescope', titre: 'Le télescope de Newton', niveau: 'Tle' },
  { cle: 'spcl-boucle-regulation', titre: 'La boucle de régulation', niveau: 'Tle' },
  { cle: 'spcl-reponse-regulation', titre: 'La réponse d’une régulation à un échelon', niveau: 'Tle' },
  { cle: 'spcl-pompe-chaleur', titre: 'La pompe à chaleur', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'hggsp-institutions-ue', titre: 'Le fonctionnement des institutions de l’Union européenne', niveau: '1re' },
  { cle: 'hggsp-empire-ottoman', titre: 'L’essor et le déclin de l’Empire ottoman', niveau: '1re' },
  { cle: 'hggsp-russie-puissance', titre: 'La Russie et son « étranger proche » depuis 1991', niveau: '1re' },
  { cle: 'hggsp-francophonie', titre: 'La francophonie dans le monde', niveau: '1re' },
  { cle: 'hggsp-limes-rhenan', titre: 'Le limes rhénan, frontière de l’Empire romain', niveau: '1re' },
  { cle: 'hggsp-frontiere-germano-polonaise', titre: 'La frontière germano-polonaise de 1939 à 1990', niveau: '1re' },
  { cle: 'hggsp-espace-transfrontalier', titre: 'Un espace transfrontalier : le Luxembourg et ses voisins', niveau: '1re' },
  { cle: 'hggsp-frise-information', titre: 'Frise de l’histoire des médias, de l’imprimerie à Internet', niveau: '1re' },
  { cle: 'hggsp-etats-religions-monde', titre: 'Les relations entre États et religions dans le monde', niveau: '1re' },
  { cle: 'hggsp-frise-conquete-spatiale', titre: 'Frise de la conquête de l’espace', niveau: 'Tle' },
  { cle: 'hggsp-orbites-espace', titre: 'Les orbites autour de la Terre', niveau: 'Tle' },
  { cle: 'hggsp-chine-mers', titre: 'La Chine à la conquête des mers', niveau: 'Tle' },
  { cle: 'hggsp-europe-westphalie', titre: 'L’Europe après les traités de Westphalie (1648)', niveau: 'Tle' },
  { cle: 'hggsp-israel-palestine', titre: 'Israël et les territoires palestiniens depuis 1947', niveau: 'Tle' },
  { cle: 'hggsp-frise-justice-internationale', titre: 'Frise de la justice pénale internationale', niveau: 'Tle' },
  { cle: 'hggsp-frise-sommets-climat', titre: 'Frise des sommets de la Terre et des COP', niveau: 'Tle' },
  { cle: 'hggsp-climat-europe-courbe', titre: 'Les fluctuations du climat en Europe, du Moyen Âge au XIXe siècle', niveau: 'Tle' },
  { cle: 'hggsp-parcs-nationaux-usa', titre: 'Les parcs nationaux des États-Unis', niveau: 'Tle' },
  { cle: 'hggsp-bassin-minier-nord', titre: 'Le bassin minier du Nord-Pas-de-Calais, patrimoine mondial', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'ses-deplacement-courbes', titre: 'Déplacement sur la courbe et déplacement de la courbe', niveau: '1re' },
  { cle: 'ses-cout-marginal-offre', titre: 'Coût marginal, prix et courbe d’offre', niveau: '1re' },
  { cle: 'ses-structures-marche', titre: 'Des marchés plus ou moins concurrentiels', niveau: '1re' },
  { cle: 'ses-dilemme-prisonnier', titre: 'Le dilemme du prisonnier appliqué à un oligopole', niveau: '1re' },
  { cle: 'ses-externalite-negative', titre: 'L’externalité négative : coût privé et coût social', niveau: '1re' },
  { cle: 'ses-classification-biens', titre: 'Biens privés, communs, de club et collectifs', niveau: '1re' },
  { cle: 'ses-circuit-financement', titre: 'Le financement de l’économie : direct et indirect', niveau: '1re' },
  { cle: 'ses-fonds-pretables', titre: 'Le marché des fonds prêtables', niveau: '1re' },
  { cle: 'ses-transmission-politique-monetaire', titre: 'La transmission de la politique monétaire', niveau: '1re' },
  { cle: 'ses-nomenclature-pcs', titre: 'La nomenclature des PCS', niveau: '1re' },
  { cle: 'ses-carriere-deviante', titre: 'L’étiquetage et la carrière déviante', niveau: '1re' },
  { cle: 'ses-halo-chomage', titre: 'Chômage, halo et sous-emploi', niveau: 'Tle' },
  { cle: 'ses-marche-travail-salaire-minimum', titre: 'Salaire minimum et chômage sur le marché du travail', niveau: 'Tle' },
  { cle: 'ses-fluctuations-activite', titre: 'Les fluctuations de l’activité économique', niveau: 'Tle' },
  { cle: 'ses-bulle-speculative', titre: 'La formation et l’éclatement d’une bulle spéculative', niveau: 'Tle' },
  { cle: 'ses-transmission-crise', titre: 'De la crise financière à la crise économique', niveau: 'Tle' },
  { cle: 'ses-destruction-creatrice', titre: 'La destruction créatrice', niveau: 'Tle' },
  { cle: 'ses-zone-euro-marche-unique', titre: 'Le marché unique et la zone euro', niveau: 'Tle' },
  { cle: 'ses-structure-socioprofessionnelle', titre: 'L’évolution de la structure socioprofessionnelle', niveau: 'Tle' },
  { cle: 'ses-classes-marx-weber', titre: 'Classes sociales chez Marx et stratification chez Weber', niveau: 'Tle' },
  { cle: 'ses-polarisation-emplois', titre: 'La polarisation des emplois', niveau: 'Tle' },
  { cle: 'ses-massification-scolaire', titre: 'Massification et démocratisation scolaire', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'nsi-octet-bases', titre: 'Un octet : poids des bits, base 2 et base 16', niveau: '1re' },
  { cle: 'nsi-complement-a-deux', titre: 'La roue du complément à deux', niveau: '1re' },
  { cle: 'nsi-flottant-ieee754', titre: 'Un nombre flottant : signe, exposant, mantisse', niveau: '1re' },
  { cle: 'nsi-portes-logiques', titre: 'Les portes logiques et le demi-additionneur', niveau: '1re' },
  { cle: 'nsi-tris-insertion-selection', titre: 'Tri par insertion et tri par sélection, étape par étape', niveau: '1re' },
  { cle: 'nsi-dichotomie', titre: 'La recherche dichotomique', niveau: '1re' },
  { cle: 'nsi-k-plus-proches-voisins', titre: 'Les k plus proches voisins', niveau: '1re' },
  { cle: 'nsi-encapsulation-tcp-ip', titre: 'Les couches TCP/IP et l’encapsulation', niveau: '1re' },
  { cle: 'nsi-bit-alterne', titre: 'Le protocole du bit alterné', niveau: '1re' },
  { cle: 'nsi-reseau-local', titre: 'Les constituants d’un réseau', niveau: '1re' },
  { cle: 'nsi-arborescence-droits', titre: 'Arborescence des fichiers et droits d’accès', niveau: '1re' },
  { cle: 'nsi-frise-informatique', titre: 'Frise de l’histoire de l’informatique', niveau: '1re' },
  { cle: 'nsi-liste-chainee', titre: 'La liste chaînée', niveau: 'Tle' },
  { cle: 'nsi-pile-appels-recursion', titre: 'La pile d’appels d’une fonction récursive', niveau: 'Tle' },
  { cle: 'nsi-tri-fusion', titre: 'Le tri fusion : diviser pour régner', niveau: 'Tle' },
  { cle: 'nsi-complexites', titre: 'Comparer les coûts : log n, n, n log n, n²', niveau: 'Tle' },
  { cle: 'nsi-parcours-graphe', titre: 'Parcours en profondeur et en largeur d’un graphe', niveau: 'Tle' },
  { cle: 'nsi-etats-processus', titre: 'Les états d’un processus et l’interblocage', niveau: 'Tle' },
  { cle: 'nsi-systeme-sur-puce', titre: 'Un système sur puce', niveau: 'Tle' },
  { cle: 'nsi-chiffrement-https', titre: 'Chiffrement symétrique, asymétrique et HTTPS', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'si-chaine-information', titre: 'Chaîne d’information : acquérir, traiter, communiquer', niveau: '1re' },
  { cle: 'si-liaisons-normalisees', titre: 'Les liaisons mécaniques normalisées', niveau: '1re' },
  { cle: 'si-bielle-manivelle', titre: 'Le schéma cinématique d’un système bielle-manivelle', niveau: '1re' },
  { cle: 'si-diagramme-blocs-internes', titre: 'Le diagramme de blocs internes SysML', niveau: '1re' },
  { cle: 'si-lois-kirchhoff', titre: 'Nœuds et mailles : les lois de Kirchhoff', niveau: '1re' },
  { cle: 'si-pont-en-h', titre: 'Le pont en H : moduler et inverser le sens d’un moteur', niveau: '1re' },
  { cle: 'si-bilan-pertes-sankey', titre: 'Le diagramme des pertes d’une chaîne de puissance', niveau: '1re' },
  { cle: 'si-champ-vitesses', titre: 'Le champ des vitesses d’un solide', niveau: '1re' },
  { cle: 'si-isolement-statique', titre: 'Isoler un solide : le bilan des actions mécaniques', niveau: 'Tle' },
  { cle: 'si-cone-frottement', titre: 'Le cône de frottement de Coulomb', niveau: 'Tle' },
  { cle: 'si-charges-ouvrage', titre: 'Charges permanentes et d’exploitation sur un ouvrage', niveau: 'Tle' },
  { cle: 'si-modulation-numerique', titre: 'Modulation d’amplitude et de fréquence d’un signal numérique', niveau: 'Tle' },
  { cle: 'si-architecture-objets-connectes', titre: 'L’architecture d’un réseau d’objets connectés', niveau: 'Tle' },
  { cle: 'si-reponses-modeles', titre: 'Réponses d’un gain pur, d’un intégrateur et d’un premier ordre', niveau: 'Tle' },
  { cle: 'si-intelligence-artificielle', titre: 'Une intelligence artificielle vue comme entrées et sorties', niveau: 'Tle' },
  { cle: 'si-transferts-thermiques', titre: 'Conduction, convection, rayonnement', niveau: 'Tle' },
];

/** Éducation physique, pratiques et culture sportives. */
const EPPCS = [
  { cle: 'eppcs-filieres-energetiques', titre: 'Les trois filières énergétiques et la durée de l’effort', niveau: '1re' },
  { cle: 'eppcs-dimensions-sante', titre: 'Les trois dimensions de la santé', niveau: '1re' },
  { cle: 'eppcs-organisation-sport-france', titre: 'Du mouvement olympique au club : l’organisation du sport en France', niveau: 'Tle' },
  { cle: 'eppcs-evolution-apsa', titre: 'Ce qui fait évoluer une activité sportive : matériaux, pratiquants, règlement', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'eppcs-articulation-genou', titre: 'Le genou : os, ligaments, tendons, cartilage', niveau: '1re' },
  { cle: 'eppcs-qualites-physiques', titre: 'Les cinq qualités physiques', niveau: '1re' },
  { cle: 'eppcs-zones-intensite', titre: 'Les zones d’intensité de l’effort', niveau: '1re' },
  { cle: 'eppcs-structure-seance', titre: 'La structure d’une séance : échauffement, corps, retour au calme', niveau: '1re' },
  { cle: 'eppcs-surcompensation', titre: 'La surcompensation : progresser grâce à la récupération', niveau: '1re' },
  { cle: 'eppcs-champs-apprentissage', titre: 'Les cinq champs d’apprentissage', niveau: 'Tle' },
  { cle: 'eppcs-biomecanique-saut', titre: 'La biomécanique d’un saut', niveau: 'Tle' },
  { cle: 'eppcs-terrain-tactique', titre: 'Le terrain de sport collectif et ses principes tactiques', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'sgn-schema-communication', titre: 'Le schéma de la communication', niveau: '1re' },
  { cle: 'sgn-repartition-valeur-ajoutee', titre: 'La répartition de la valeur ajoutée entre les acteurs', niveau: '1re' },
  { cle: 'sgn-cout-travail', titre: 'Du salaire net au coût global du travail', niveau: '1re' },
  { cle: 'sgn-systeme-information', titre: 'Le système d’information d’une organisation', niveau: '1re' },
  { cle: 'sgn-paid-owned-earned', titre: 'Les médias payés, possédés et gagnés', niveau: 'Tle' },
  { cle: 'sgn-carte-positionnement', titre: 'Segmentation, ciblage et carte de positionnement', niveau: 'Tle' },
  { cle: 'sgn-cycle-vie-produit', titre: 'Le cycle de vie d’un produit', niveau: 'Tle' },
  { cle: 'sgn-gamme-produits', titre: 'La gamme : largeur et profondeur', niveau: 'Tle' },
  { cle: 'sgn-circuits-distribution', titre: 'Les circuits de distribution', niveau: 'Tle' },
  { cle: 'sgn-marche-tripartite', titre: 'Le modèle de gratuité du marché tripartite', niveau: 'Tle' },
  { cle: 'sgn-soldes-intermediaires', titre: 'Les soldes intermédiaires de gestion', niveau: 'Tle' },
  { cle: 'sgn-remboursement-emprunt', titre: 'Amortissements constants et annuités constantes', niveau: 'Tle' },
  { cle: 'sgn-partie-double', titre: 'La partie double et les comptes en T', niveau: 'Tle' },
  { cle: 'sgn-mecanisme-tva', titre: 'Le mécanisme de la TVA', niveau: 'Tle' },
  { cle: 'sgn-processus-comptable', titre: 'Le processus comptable, de la pièce aux états financiers', niveau: 'Tle' },
  { cle: 'sgn-affectation-resultat', titre: 'L’affectation du résultat', niveau: 'Tle' },
  { cle: 'sgn-remuneration-globale', titre: 'Les composantes de la rémunération globale', niveau: 'Tle' },
  { cle: 'sgn-processus-recrutement', titre: 'Les étapes du processus de recrutement', niveau: 'Tle' },
  { cle: 'sgn-schema-relationnel', titre: 'Un schéma relationnel de base de données', niveau: 'Tle' },
  { cle: 'sgn-architecture-reseau', titre: 'L’architecture d’un réseau d’entreprise', niveau: 'Tle' },
  { cle: 'sgn-acces-ressource-distante', titre: 'L’accès à une ressource distante', niveau: 'Tle' },
  { cle: 'sgn-diagramme-gantt', titre: 'La planification d’un projet : diagramme de Gantt', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'mgt-organisation-systeme', titre: 'L’organisation vue comme un système', niveau: '1re' },
  { cle: 'mgt-niveaux-decision', titre: 'Décisions stratégiques, tactiques et opérationnelles', niveau: '1re' },
  { cle: 'mgt-pestel', titre: 'Le diagnostic externe : le modèle PESTEL', niveau: '1re' },
  { cle: 'mgt-cinq-forces-porter', titre: 'Les cinq forces concurrentielles de Porter', niveau: '1re' },
  { cle: 'mgt-matrice-bcg', titre: 'Les domaines d’activité stratégique et la matrice BCG', niveau: '1re' },
  { cle: 'mgt-strategies-globales', titre: 'Spécialisation, diversification et intégration', niveau: '1re' },
  { cle: 'mgt-modalites-croissance', titre: 'Croissance interne, externe et partenariats', niveau: '1re' },
  { cle: 'mgt-echelons-action-publique', titre: 'Les échelons de l’action publique', niveau: '1re' },
  { cle: 'mgt-roue-deming', titre: 'La roue de Deming et l’amélioration continue', niveau: 'Tle' },
  { cle: 'mgt-mecanismes-coordination', titre: 'Les mécanismes de coordination de Mintzberg', niveau: 'Tle' },
  { cle: 'mgt-modele-economique', titre: 'Le modèle économique d’une organisation', niveau: 'Tle' },
  { cle: 'mgt-herzberg', titre: 'Facteurs d’hygiène et facteurs de motivation de Herzberg', niveau: 'Tle' },
  { cle: 'mgt-cluster-territoire', titre: 'Un cluster : l’organisation dans son territoire', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'droiteco-patrimoine-droits', titre: 'Le patrimoine et la classification des droits', niveau: '1re' },
  { cle: 'droiteco-classification-biens', titre: 'La classification des biens', niveau: '1re' },
  { cle: 'droiteco-attributs-propriete', titre: 'Les attributs du droit de propriété', niveau: '1re' },
  { cle: 'droiteco-modes-preuve', titre: 'Actes juridiques, faits juridiques et modes de preuve', niveau: '1re' },
  { cle: 'droiteco-mesures-protection', titre: 'Les mesures de protection des majeurs', niveau: '1re' },
  { cle: 'droiteco-valeur-ajoutee-pib', titre: 'De la valeur ajoutée au PIB', niveau: '1re' },
  { cle: 'droiteco-revenu-disponible', titre: 'Du revenu primaire au revenu disponible', niveau: '1re' },
  { cle: 'droiteco-structures-marche', titre: 'Concurrence, oligopole et monopole', niveau: '1re' },
  { cle: 'droiteco-couts-moyen-marginal', titre: 'Coût moyen et coût marginal', niveau: '1re' },
  { cle: 'droiteco-marche-financier', titre: 'Le marché financier : primaire et secondaire', niveau: '1re' },
  { cle: 'droiteco-patrimoine-entrepreneur', titre: 'Le patrimoine de l’entrepreneur individuel', niveau: 'Tle' },
  { cle: 'droiteco-validite-contrat', titre: 'Les conditions de validité du contrat et leurs sanctions', niveau: 'Tle' },
  { cle: 'droiteco-regimes-responsabilite', titre: 'Les régimes de responsabilité extracontractuelle', niveau: 'Tle' },
  { cle: 'droiteco-travail-temporaire', titre: 'La relation de travail temporaire', niveau: 'Tle' },
  { cle: 'droiteco-rupture-contrat-travail', titre: 'Les modes de rupture du contrat de travail', niveau: 'Tle' },
  { cle: 'droiteco-deficit-dette', titre: 'Déficit public et dette publique', niveau: 'Tle' },
  { cle: 'droiteco-politiques-economiques', titre: 'Les politiques économiques de l’État', niveau: 'Tle' },
  { cle: 'droiteco-accords-regionaux', titre: 'La régionalisation des échanges dans le monde', niveau: 'Tle' },
  { cle: 'droiteco-developpement-durable', titre: 'Les trois piliers du développement durable', niveau: 'Tle' },
  { cle: 'droiteco-economie-circulaire', titre: 'L’économie circulaire', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'stss-dimensions-sante', titre: 'Les dimensions de la santé', niveau: '1re' },
  { cle: 'stss-instances-socialisation', titre: 'Les instances de socialisation', niveau: '1re' },
  { cle: 'stss-incidence-prevalence', titre: 'Incidence et prévalence', niveau: '1re' },
  { cle: 'stss-echantillonnage', titre: 'Population, échantillon et méthodes d’échantillonnage', niveau: '1re' },
  { cle: 'stss-gradient-social-sante', titre: 'Le gradient social de santé', niveau: '1re' },
  { cle: 'stss-inegalites-territoriales-sante', titre: 'Les inégalités territoriales de santé en France', niveau: '1re' },
  { cle: 'stss-elaboration-politique', titre: 'De l’identification d’un problème à la politique publique', niveau: 'Tle' },
  { cle: 'stss-frise-politiques-sante', titre: 'Frise des politiques de santé en France', niveau: 'Tle' },
  { cle: 'stss-frise-politiques-sociales', titre: 'Frise des politiques sociales en France', niveau: 'Tle' },
  { cle: 'stss-parcours-soins', titre: 'Le parcours de soins coordonné', niveau: 'Tle' },
  { cle: 'stss-offre-soins-graduee', titre: 'L’offre de soins graduée sur un territoire', niveau: 'Tle' },
  { cle: 'stss-acteurs-action-sociale', titre: 'Les acteurs et financeurs de l’action sociale', niveau: 'Tle' },
];

/** Philosophie — terminale. Peu de figures : une matière d'arguments. */
const PHILOSOPHIE = [
  { cle: 'philo-allegorie-caverne', titre: 'L’allégorie de la caverne', niveau: 'Tle' },
  { cle: 'philo-frise-auteurs', titre: 'Frise chronologique des auteurs du programme', niveau: 'Tle' },
  { cle: 'philo-structure-dissertation', titre: 'Introduction, parties, transitions, conclusion : la structure d’une dissertation', niveau: 'Tle' },
  { cle: 'philo-appareil-psychique', titre: 'Le ça, le moi et le surmoi', niveau: 'Tle' },
  { cle: 'philo-reperes-programme', titre: 'Les repères du programme, couple par couple', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'philo-ligne-divisee', titre: 'La ligne divisée de Platon', niveau: 'Tle' },
  { cle: 'philo-refutabilite', titre: 'Induction et réfutation : ce qui fait une science', niveau: 'Tle' },
  { cle: 'philo-contrat-social', titre: 'De l’état de nature à l’État : le contrat social', niveau: 'Tle' },
  { cle: 'philo-carte-notions', titre: 'Les notions et les trois perspectives', niveau: 'Tle' },
  { cle: 'philo-problematisation', titre: 'De la question au problème', niveau: 'Tle' },
  { cle: 'philo-explication-texte', titre: 'Expliquer un texte : thèse, mouvements, enjeu', niveau: 'Tle' },
];

/** Humanités, littérature et philosophie. */
const HLP = [
  { cle: 'hlp-parties-discours', titre: 'Exorde, narration, confirmation, péroraison : les parties du discours', niveau: '1re' },
  { cle: 'hlp-geocentrisme-heliocentrisme', titre: 'Du géocentrisme à l’héliocentrisme', niveau: '1re' },
  { cle: 'hlp-grandes-decouvertes', titre: 'Les grandes découvertes et les nouveaux mondes', niveau: '1re' },
  { cle: 'hlp-perspective-renaissance', titre: 'La perspective de la Renaissance : point de fuite et lignes de fuite', niveau: '1re' },
  { cle: 'hlp-frise-romantisme-avant-gardes', titre: 'Du romantisme aux avant-gardes du XXe siècle', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'hlp-genres-discours', titre: 'Judiciaire, délibératif, épidictique : les trois genres de discours', niveau: '1re' },
  { cle: 'hlp-ethos-logos-pathos', titre: 'Ethos, logos, pathos : le triangle rhétorique', niveau: '1re' },
  { cle: 'hlp-cinq-operations-rhetorique', titre: 'Les cinq opérations de la rhétorique', niveau: '1re' },
  { cle: 'hlp-lunette-microscope', titre: 'La lunette de Galilée et le microscope', niveau: '1re' },
  { cle: 'hlp-chaine-des-etres', titre: 'La grande chaîne des êtres', niveau: '1re' },
  { cle: 'hlp-carte-avant-gardes', titre: 'La carte des avant-gardes européennes', niveau: 'Tle' },
];

/** LLCER anglais — ce que la spécialité ajoute aux planches d'anglais. */
const LLCER_ANGLAIS = [
  { cle: 'llceran-frise-litterature', titre: 'Frise de la littérature anglophone, du théâtre élisabéthain au postmodernisme', niveau: '1re' },
  { cle: 'llceran-frankenstein-frontispice', titre: 'Le frontispice de Frankenstein (1831)', niveau: '1re' },
  { cle: 'llceran-empire-britannique', titre: 'L’Empire britannique à son apogée', niveau: '1re' },
  { cle: 'llceran-frontiere-ouest', titre: 'La conquête de l’Ouest et la frontière américaine', niveau: 'Tle' },
  { cle: 'llceran-migrations-etats-unis', titre: 'Les vagues d’immigration vers les États-Unis', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'llceran-plans-cinema', titre: 'L’échelle des plans et les angles de vue', niveau: '1re' },
  { cle: 'llceran-composition-image', titre: 'Lire la composition d’une image fixe', niveau: '1re' },
  { cle: 'llceran-decor-gothique', titre: 'Le décor gothique et ses conventions', niveau: '1re' },
  { cle: 'llceran-utopies-dystopies', titre: 'Utopies et dystopies : les grandes œuvres', niveau: '1re' },
  { cle: 'llceran-voyage-du-heros', titre: 'Le voyage du héros', niveau: 'Tle' },
  { cle: 'llceran-triangle-rhetorique', titre: 'Le triangle rhétorique', niveau: 'Tle' },
  { cle: 'llceran-debat-codifie', titre: 'La disposition d’un débat codifié', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'amc-systemes-educatifs', titre: 'Les systèmes éducatifs britannique et américain', niveau: '1re' },
  { cle: 'amc-bill-of-rights', titre: 'La Déclaration des droits américaine', niveau: '1re' },
  { cle: 'amc-expansion-territoriale', titre: 'L’expansion territoriale des États-Unis', niveau: 'Tle' },
  { cle: 'amc-parcs-nationaux', titre: 'Les parcs nationaux américains', niveau: 'Tle' },
  { cle: 'amc-gentrification', titre: 'Le cycle de la gentrification', niveau: 'Tle' },
  { cle: 'amc-frontiere-ue', titre: 'Le Royaume-Uni et ses frontières avec l’Union européenne', niveau: 'Tle' },
  { cle: 'amc-peuples-autochtones', titre: 'Les peuples autochtones du monde anglophone', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'llceres-planos-cine', titre: 'Les plans et les angles de vue au cinéma', niveau: '1re' },
  { cle: 'llceres-ruta-quijote', titre: 'La route de Don Quichotte', niveau: '1re' },
  { cle: 'llceres-viaje-guevara', titre: 'Le voyage d’Ernesto Guevara en Amérique du Sud (1952)', niveau: '1re' },
  { cle: 'llceres-dictaduras', titre: 'Les dictatures du monde hispanique au XXe siècle', niveau: '1re' },
  { cle: 'llceres-revolucion-mexicana', titre: 'La révolution mexicaine (1910-1920)', niveau: 'Tle' },
  { cle: 'llceres-estrecho-gibraltar', titre: 'Le détroit de Gibraltar', niveau: 'Tle' },
];

/** LLCA latin. */
const LLCA_LATIN = [
  { cle: 'latin-empire-romain', titre: 'L’Empire romain à son apogée', niveau: '1re' },
  { cle: 'latin-forum-romain', titre: 'Le plan du forum romain', niveau: '1re' },
  { cle: 'latin-frise-rome', titre: 'Royauté, République, Empire : frise chronologique de Rome', niveau: '1re' },
  { cle: 'latin-dieux-romains', titre: 'Les principaux dieux romains et leurs attributs', niveau: '1re' },
  { cle: 'latin-exil-ovide', titre: 'De Rome à Tomi, le trajet de l’exil d’Ovide', niveau: 'Tle' },
  { cle: 'latin-sites-mediterranee', titre: 'Les grands sites archéologiques romains de Méditerranée', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'latin-institutions-republique', titre: 'Les institutions de la République romaine', niveau: '1re' },
  { cle: 'latin-plan-ville-romaine', titre: 'Le plan d’une ville romaine', niveau: '1re' },
  { cle: 'latin-homme-vitruvien', titre: 'L’homme de Vitruve, de Léonard au Modulor', niveau: '1re' },
  { cle: 'latin-guerres-puniques', titre: 'Rome contre Carthage : les guerres puniques', niveau: '1re' },
  { cle: 'latin-phrase-analysee', titre: 'Analyser une phrase latine avant de traduire', niveau: '1re' },
  { cle: 'latin-theatre-romain', titre: 'Le plan d’un théâtre romain', niveau: 'Tle' },
];

/** LLCA grec. */
const LLCA_GREC = [
  { cle: 'grec-monde-grec', titre: 'Le monde grec et ses colonies en Méditerranée', niveau: '1re' },
  { cle: 'grec-acropole', titre: 'Le plan de l’Acropole d’Athènes', niveau: '1re' },
  { cle: 'grec-democratie-athenienne', titre: 'Les institutions de la démocratie athénienne', niveau: '1re' },
  { cle: 'grec-alphabet', titre: 'L’alphabet grec', niveau: '1re' },
  { cle: 'grec-empire-alexandre', titre: 'L’empire d’Alexandre le Grand', niveau: '1re' },
  { cle: 'grec-theatre-grec', titre: 'Orchestra, skênê, theatron : le plan d’un théâtre grec', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'grec-guerres-mediques', titre: 'Les guerres médiques', niveau: '1re' },
  { cle: 'grec-guerre-peloponnese', titre: 'Athènes contre Sparte : la guerre du Péloponnèse', niveau: '1re' },
  { cle: 'grec-plan-hippodamien', titre: 'Milet et le plan d’Hippodamos', niveau: '1re' },
  { cle: 'grec-ecole-athenes', titre: 'L’École d’Athènes de Raphaël', niveau: 'Tle' },
  { cle: 'grec-temple-grec', titre: 'L’élévation d’un temple grec', niveau: 'Tle' },
  { cle: 'grec-sanctuaire-delphes', titre: 'Le sanctuaire de Delphes', niveau: 'Tle' },
  { cle: 'grec-theogonie', titre: 'La Théogonie : la généalogie des dieux', niveau: 'Tle' },
  { cle: 'grec-atrides', titre: 'Les Atrides, une famille maudite', niveau: 'Tle' },
  { cle: 'grec-histoires-vraies', titre: 'L’itinéraire des Histoires vraies de Lucien', niveau: 'Tle' },
];

/** Arts plastiques. */
const ARTS_PLASTIQUES = [
  { cle: 'artspla-perspective', titre: 'Perspective linéaire et point de fuite', niveau: '1re' },
  { cle: 'artspla-cercle-chromatique', titre: 'Couleurs primaires, secondaires et complémentaires', niveau: '1re' },
  { cle: 'artspla-ready-made', titre: 'Fontaine de Marcel Duchamp, un ready-made', niveau: '1re' },
  { cle: 'artspla-frise-mouvements', titre: 'Frise des mouvements artistiques du XXe siècle', niveau: '1re' },
  { cle: 'artspla-vernet-toulon', titre: 'La ville et la rade de Toulon de Joseph Vernet (1756)', niveau: 'Tle' },
  { cle: 'artspla-giambologna-apennin', titre: 'Le Colosse de l’Apennin de Giambologna', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'artspla-composition', titre: 'La composition d’une œuvre : lignes de force et plans', niveau: '1re' },
  { cle: 'artspla-systemes-perspectifs', titre: 'Les autres façons de représenter l’espace', niveau: '1re' },
  { cle: 'artspla-ombre-lumiere', titre: 'Lumière et ombre sur un volume', niveau: '1re' },
  { cle: 'artspla-dispositifs-presentation', titre: 'Cadre, socle, cimaise : présenter une œuvre', niveau: '1re' },
  { cle: 'artspla-plan-exposition', titre: 'Le plan d’une exposition', niveau: 'Tle' },
  { cle: 'artspla-maman-bourgeois', titre: 'Maman de Louise Bourgeois', niveau: 'Tle' },
  { cle: 'artspla-gursky-99-cent', titre: 'La composition de 99 Cent d’Andreas Gursky', niveau: 'Tle' },
];

/** Histoire des arts. */
const HISTOIRE_ARTS = [
  { cle: 'hda-ordres-architecture', titre: 'Les ordres d’architecture : dorique, ionique, corinthien', niveau: '1re' },
  { cle: 'hda-plan-eglise', titre: 'Le plan d’une église romane et d’une cathédrale gothique', niveau: '1re' },
  { cle: 'hda-frise-periodes', titre: 'Frise des grandes périodes de l’histoire de l’art', niveau: '1re' },
  { cle: 'hda-notre-dame-fleche', titre: 'Notre-Dame de Paris et la flèche de Viollet-le-Duc', niveau: 'Tle' },
  { cle: 'hda-paris-capitale-arts', titre: 'Paris, capitale des arts : Montmartre et Montparnasse', niveau: 'Tle' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'hda-coupe-cathedrale', titre: 'La coupe d’une cathédrale gothique', niveau: '1re' },
  { cle: 'hda-cartel-oeuvre', titre: 'Le cartel d’une œuvre', niveau: '1re' },
  { cle: 'hda-coulisses-musee', titre: 'Les coulisses d’un musée', niveau: '1re' },
  { cle: 'hda-marche-art', titre: 'Les acteurs du marché de l’art', niveau: '1re' },
  { cle: 'hda-orchestre-symphonique', titre: 'Le plan de l’orchestre symphonique', niveau: '1re' },
  { cle: 'hda-immeuble-haussmannien', titre: 'La coupe d’un immeuble haussmannien', niveau: 'Tle' },
];

/** Cinéma-audiovisuel. */
const CINEMA_AUDIOVISUEL = [
  { cle: 'cav-echelle-plans', titre: 'L’échelle des plans, du plan d’ensemble au très gros plan', niveau: '1re' },
  { cle: 'cav-mouvements-camera', titre: 'Panoramique, travelling, plongée et contre-plongée', niveau: '1re' },
  { cle: 'cav-regle-180-degres', titre: 'La règle des 180 degrés et le champ-contrechamp', niveau: '1re' },
  { cle: 'cav-fabrication-film', titre: 'Écriture, tournage, montage, diffusion : la fabrication d’un film', niveau: '1re' },
  { cle: 'cav-frise-cinema', titre: 'Frise de l’histoire du cinéma, du muet au numérique', niveau: '1re' },
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'cav-eclairage-trois-points', titre: 'L’éclairage en trois points', niveau: '1re' },
  { cle: 'cav-profondeur-de-champ', titre: 'La profondeur de champ', niveau: '1re' },
  { cle: 'cav-son-in-hors-champ-off', titre: 'Son in, hors champ et off', niveau: '1re' },
  { cle: 'cav-raccords-montage', titre: 'Les raccords au montage', niveau: '1re' },
  { cle: 'cav-storyboard', titre: 'Une page de storyboard', niveau: '1re' },
  { cle: 'cav-plateau-studio', titre: 'Un plateau de tournage en studio', niveau: '1re' },
  { cle: 'cav-chaine-economique', titre: 'Production, distribution, exploitation : la vie économique d’un film', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'theatre-rapports-scene-salle', titre: 'Frontal, bifrontal, quadrifrontal : les rapports scène-salle', niveau: '1re' },
  { cle: 'theatre-plan-lumiere', titre: 'Le plan lumière d’un plateau', niveau: '1re' },
  { cle: 'theatre-scene-medievale', titre: 'La scène simultanée du Moyen Âge', niveau: '1re' },
  { cle: 'theatre-quatrieme-mur', titre: 'Quatrième mur et distanciation', niveau: '1re' },
  { cle: 'theatre-equipe-creation', titre: 'L’équipe de création d’un spectacle', niveau: '1re' },
  { cle: 'theatre-captation-cameras', titre: 'Une captation : ce que voient les caméras', niveau: 'Tle' },
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
  // D’APRÈS LE RÉFÉRENTIEL (13/10/2026) : les notions qu’un schéma sert vraiment
  // et que rien ne couvrait encore. Chacune aura sa version muette.
  { cle: 'cirque-agres-aeriens', titre: 'Les agrès aériens', niveau: '1re' },
  { cle: 'cirque-portes-acrobatiques', titre: 'Porteur et voltigeur : les portés acrobatiques', niveau: '1re' },
  { cle: 'cirque-securite', titre: 'Le dispositif de sécurité', niveau: '1re' },
  { cle: 'cirque-objets-jonglage', titre: 'Les objets du jongleur', niveau: 'Tle' },
  { cle: 'cirque-espaces-de-jeu', titre: 'Piste, frontal, espace public : choisir l’espace de jeu', niveau: 'Tle' },
];

/**
 * Allemand — 13/10/2026 : la langue n'avait aucun emplacement. Un premier
 * jeu, sur le modèle de l'espagnol et de l'anglais, d'après son référentiel.
 * Les légendes sont écrites dans la langue.
 */
const ALLEMAND = [
  { cle: 'de-laender', titre: 'L’Allemagne et ses seize Länder', niveau: '5e' },
  { cle: 'de-familie', titre: 'La famille', niveau: '5e' },
  { cle: 'de-uhrzeit', titre: 'Dire l’heure en allemand', niveau: '5e' },
  { cle: 'de-klassenzimmer', titre: 'La salle de classe et le genre des noms', niveau: '5e' },
  { cle: 'de-koerper', titre: 'Le corps et le visage', niveau: '5e' },
  { cle: 'de-place-du-verbe', titre: 'La place du verbe dans la phrase allemande', niveau: '5e' },
  { cle: 'de-zeiten', titre: 'La frise des temps allemands', niveau: '4e' },
  { cle: 'de-kasus', titre: 'Les articles et les quatre cas', niveau: '4e' },
  { cle: 'de-pays-germanophones', titre: 'Les pays germanophones', niveau: '4e' },
  { cle: 'de-stadt', titre: 'La ville et l’itinéraire', niveau: '4e' },
  { cle: 'de-wetter', titre: 'La carte météo de l’Allemagne', niveau: '4e' },
  { cle: 'de-praepositionen', titre: 'Les prépositions et leur cas', niveau: '3e' },
  { cle: 'de-komposita', titre: 'Décomposer un mot composé', niveau: '3e' },
  { cle: 'de-deutschland-geteilt', titre: 'L’Allemagne et Berlin divisés (1949-1990)', niveau: '3e' },
  { cle: 'de-oberrhein', titre: 'La coopération franco-allemande sur le Rhin supérieur', niveau: '3e' },
  { cle: 'de-adjektivdeklination', titre: 'La déclinaison de l’adjectif épithète', niveau: 'Tle' },
];

/**
 * Italien — 13/10/2026 : la langue n'avait aucun emplacement. Un premier
 * jeu, sur le modèle de l'espagnol et de l'anglais, d'après son référentiel.
 * Les légendes sont écrites dans la langue.
 */
const ITALIEN = [
  { cle: 'it-regioni', titre: 'L’Italie et ses vingt régions', niveau: '5e' },
  { cle: 'it-roma', titre: 'Rome et ses monuments', niveau: '5e' },
  { cle: 'it-famiglia', titre: 'La famille', niveau: '5e' },
  { cle: 'it-casa', titre: 'La maison et ses pièces', niveau: '5e' },
  { cle: 'it-aula', titre: 'La salle de classe', niveau: '5e' },
  { cle: 'it-corpo', titre: 'Le corps et le visage', niveau: '5e' },
  { cle: 'it-ora', titre: 'Dire l’heure en italien', niveau: '5e' },
  { cle: 'it-articoli', titre: 'Les articles italiens', niveau: '5e' },
  { cle: 'it-preposizioni-articolate', titre: 'Les prépositions contractées', niveau: '5e' },
  { cle: 'it-citta', titre: 'La ville et l’itinéraire', niveau: '4e' },
  { cle: 'it-essere-avere', titre: 'Passé composé : essere ou avere ?', niveau: '4e' },
  { cle: 'it-firenze', titre: 'Florence, berceau de la Renaissance', niveau: '4e' },
  { cle: 'it-marco-polo', titre: 'Le voyage de Marco Polo', niveau: '4e' },
  { cle: 'it-emigrazione', titre: 'Les migrations italiennes', niveau: '3e' },
  { cle: 'it-risorgimento', titre: 'L’unité italienne (1848-1870)', niveau: '1re' },
];

/**
 * Chinois — 13/10/2026 : la langue n'avait aucun emplacement. Un premier
 * jeu, sur le modèle de l'espagnol et de l'anglais, d'après son référentiel.
 * Les légendes sont écrites dans la langue.
 */
const CHINOIS = [
  { cle: 'zh-monde-sinophone', titre: 'Le monde sinophone et les diasporas chinoises', niveau: '5e' },
  { cle: 'zh-traits', titre: 'Les traits de base des caractères', niveau: '5e' },
  { cle: 'zh-ordre-des-traits', titre: 'L’ordre des traits', niveau: '5e' },
  { cle: 'zh-cles', titre: 'Les clés des caractères', niveau: '5e' },
  { cle: 'zh-tons', titre: 'Les quatre tons du mandarin', niveau: '5e' },
  { cle: 'zh-pinyin', titre: 'Le tableau du pinyin', niveau: '5e' },
  { cle: 'zh-famille', titre: 'La famille', niveau: '5e' },
  { cle: 'zh-heure', titre: 'Dire l’heure en chinois', niveau: '5e' },
  { cle: 'zh-nombres-mains', titre: 'Compter avec les mains', niveau: '5e' },
  { cle: 'zh-classificateurs', titre: 'Les classificateurs', niveau: '5e' },
  { cle: 'zh-salle-de-classe', titre: 'La salle de classe', niveau: '5e' },
  { cle: 'zh-ordre-des-mots', titre: 'L’ordre des mots dans la phrase', niveau: '5e' },
  { cle: 'zh-fetes-lunaires', titre: 'Les fêtes du calendrier lunaire et le zodiaque', niveau: '5e' },
  { cle: 'zh-chine-reperes', titre: 'La Chine : fleuves, montagnes et grandes villes', niveau: '4e' },
  { cle: 'zh-routes-soie', titre: 'Les routes de la soie', niveau: '4e' },
  { cle: 'zh-taiwan', titre: 'Taïwan : repères géographiques', niveau: '3e' },
];

/**
 * Arabe — 13/10/2026 : la langue n'avait aucun emplacement. Un premier
 * jeu, sur le modèle de l'espagnol et de l'anglais, d'après son référentiel.
 * Les légendes sont écrites dans la langue.
 */
const ARABE = [
  { cle: 'ar-monde-arabe', titre: 'Les pays du monde arabe', niveau: '5e' },
  { cle: 'ar-maghreb', titre: 'Le Maghreb : Algérie, Maroc, Tunisie', niveau: '5e' },
  { cle: 'ar-alphabet', titre: 'L’alphabet arabe et les formes des lettres', niveau: '5e' },
  { cle: 'ar-sens-ecriture', titre: 'Le sens de l’écriture et les six lettres qui ne se lient pas', niveau: '5e' },
  { cle: 'ar-harakat', titre: 'Les voyelles brèves et les signes diacritiques', niveau: '5e' },
  { cle: 'ar-solaires-lunaires', titre: 'Lettres solaires et lettres lunaires', niveau: '5e' },
  { cle: 'ar-points-articulation', titre: 'Les points d’articulation des sons arabes', niveau: '5e' },
  { cle: 'ar-heure-chiffres', titre: 'L’heure et les chiffres indiens', niveau: '5e' },
  { cle: 'ar-famille', titre: 'La famille', niveau: '5e' },
  { cle: 'ar-corps', titre: 'Le corps et le visage', niveau: '5e' },
  { cle: 'ar-calligraphie', titre: 'Les styles de la calligraphie arabe', niveau: '5e' },
  { cle: 'ar-racine-schemes', titre: 'La racine et les schèmes', niveau: '4e' },
  { cle: 'ar-egypte-nil', titre: 'L’Égypte, le Soudan et le Nil', niveau: '4e' },
  { cle: 'ar-ibn-battuta', titre: 'Les voyages d’Ibn Baṭṭūṭa', niveau: '4e' },
  { cle: 'ar-liban-syrie', titre: 'Le Liban et la Syrie', niveau: '3e' },
  { cle: 'ar-peninsule-arabique', titre: 'Les sept pays de la péninsule Arabique', niveau: '2de' },
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
  ...ALLEMAND,
  ...ITALIEN,
  ...CHINOIS,
  ...ARABE,
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
