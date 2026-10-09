/**
 * L'ESCAPE GAME DE PHYSIQUE-CHIMIE DU LYCÉE — Yann, de la 2de à la terminale,
 * dans les trois voies. Une histoire par classe, celle que raconte son
 * illustration (`src/assets/Jeux/<classe>/Physique-chimie/<titre>.png`), et
 * six cadenas dans l'ordre du récit ; seuls les choix sont mélangés, et les
 * nombres tirés au hasard. Chaque bonne réponse est calculée ici.
 *
 * LES CLASSES SANS PROGRAMME PROPRE : la physique-chimie de la voie
 * technologique s'appuie sur les codes ST2S (PREMIERE_ST2S, TERMINALE_ST2S),
 * celle de la voie professionnelle sur les notions de 2de (PC_2DE_) : un jeu
 * de culture scientifique, contextes d'atelier et de chantier, calculs simples.
 *
 * 2de — LE SIGNAL DU LABORATOIRE (code PRISME)
 *   1. le prisme : n₁ sin i₁ = n₂ sin i₂, ou la dispersion (PC_2DE_SIG_REFRACTION) ;
 *   2. corps pur ou mélange : le palier d'ébullition (PC_2DE_CHIM_ESPECES) ;
 *   3. n = m ÷ M (PC_2DE_CHIM_MOLE) ;
 *   4. dilution : V₀ = C₁ × V₁ ÷ C₀ (PC_2DE_CHIM_CONCENTRATION) ;
 *   5. le réactif limitant, coefficients compris (PC_2DE_CHIM_TRANSFO) ;
 *   6. U = R × I au capteur, milliampères convertis (PC_2DE_SIG_ELECTRIQUE).
 *
 * 2de pro — LA PANNE DE L'ATELIER (code MOTEUR)
 *   1. un fil coupé dans un circuit en série (PC_2DE_SIG_ELECTRIQUE) ;
 *   2. l'ampèremètre se branche en série (PC_2DE_METH_PROTOCOLE) ;
 *   3. U = R × I avec des milliampères (PC_2DE_METH_HOMOGENEITE) ;
 *   4. les électrons d'un ion : Z − charge (PC_2DE_CHIM_ENTITES) ;
 *   5. la sonde CTN (PC_2DE_SIG_CAPTEUR) ;
 *   6. un objet immobile : les forces se compensent (PC_2DE_MOUV_INERTIE).
 *
 * 1re — LA RÉACTION DISPARUE (code VIOLET)
 *   1. couleur perçue = complémentaire de la couleur absorbée (PC_1RE_ONDES_COULEURS) ;
 *   2. étalonnage : C = A ÷ k (PC_1RE_CHIM_COMPOSITION) ;
 *   3. oxydation ou réduction (PC_1RE_CHIM_OXYDO) ;
 *   4. avancement maximal, coefficients compris (PC_1RE_CHIM_AVANCEMENT) ;
 *   5. titrage par le permanganate : n(Fe²⁺) = 5 n(MnO₄⁻) (PC_1RE_CHIM_DOSAGE) ;
 *   6. loi de Mariotte : p₁V₁ = p₂V₂ (PC_1RE_MOUV_STATIQUE).
 *
 * 1re techno — L'ÉNERGIE INTROUVABLE (code JOULES)
 *   1. combustion complète : CO₂ et H₂O (PCS1_COMBUSTION_HYDROLYSE) ;
 *   2. P = F ÷ S, centimètres carrés convertis (PCS1_PRESSION) ;
 *   3. conduction, convection, rayonnement (PCS1_TRANSFERTS_THERMIQUES) ;
 *   4. tension sinusoïdale : U_max = U_eff × √2, ou f = 1 ÷ T (PCS1_TENSION_SECTEUR) ;
 *   5. disjoncteur différentiel, électrisation (PCS1_RISQUE_ELECTRIQUE) ;
 *   6. bilan d'énergie : reçue = utile + chaleur (PCS1_BILAN_MUSCLE, le bilan
 *      énergétique de la classe, appliqué ici à l'alternateur).
 *
 * 1re pro — LE CIRCUIT DU CHANTIER (code EOLIEN)
 *   1. le voltmètre se branche en dérivation (PC_2DE_METH_PROTOCOLE) ;
 *   2. I = U ÷ R (PC_2DE_SIG_ELECTRIQUE) ;
 *   3. mAh → Ah (PC_2DE_METH_HOMOGENEITE) ;
 *   4. la photorésistance (PC_2DE_SIG_CAPTEUR) ;
 *   5. v = d ÷ t, minutes converties (PC_2DE_MOUV_VITESSE) ;
 *   6. P = m × g (PC_2DE_MOUV_FORCES).
 *
 * Terminale — L'ORBITE DU SIGNAL PERDU (code ORBITE)
 *   1. troisième loi de Kepler (PC_TLE_MOUV_KEPLER) ;
 *   2. rendement des panneaux photovoltaïques (PC_TLE_ONDES_PHOTOELEC) ;
 *   3. Q = C × U (PC_TLE_ELEC_CONDENSATEUR) ;
 *   4. diffraction : θ = λ ÷ a (PC_TLE_ONDES_DIFFRACTION) ;
 *   5. modèle ondulatoire ou particulaire (PC_TLE_ONDES_DUALITE) ;
 *   6. effet Doppler (PC_TLE_ONDES_DOPPLER).
 *
 * Terminale techno — LE SPECTRE INVISIBLE (code PHOTON)
 *   1. domaine d'une radiation selon λ (CBPHT_ONDES_RAYONS_X) ;
 *   2. UVA et UVB, indice de protection (CBPHT_PROTECTION_SOLAIRE) ;
 *   3. l'ozone, protecteur là-haut, nocif au sol (CBPHT_OZONE_GES) ;
 *   4. étalonnage : C = A ÷ k (CBPHT_DOSAGE_ETALONNAGE) ;
 *   5. radiographie et radiothérapie (CBPHT_RADIOGRAPHIE) ;
 *   6. la période d'un traceur radioactif (CBPHT_DEMI_VIE).
 *
 * Terminale pro — LA CHALEUR SOUS CONTRÔLE (code KELVIN)
 *   1. T = 1 ÷ f en millisecondes (PC_2DE_SIG_SON) ;
 *   2. loi des nœuds (PC_2DE_SIG_ELECTRIQUE) ;
 *   3. P = m × g (PC_2DE_MOUV_FORCES) ;
 *   4. la sonde de platine : θ = (R − 100) ÷ 0,385 (PC_2DE_SIG_CAPTEUR) ;
 *   5. T = θ + 273,15 (PC_2DE_METH_HOMOGENEITE) ;
 *   6. le palier de changement d'état (PC_2DE_CHIM_ESPECES).
 *
 * Les pièges sont les erreurs réelles des lycéens : rapport des angles au lieu
 * du rapport des sinus, « limpide donc pur », le plus petit nombre de moles
 * pris pour le réactif limitant, les milliampères non convertis, la couleur
 * absorbée prise pour la couleur perçue, le coefficient cinq du mauvais côté,
 * la valeur efficace prise pour le sommet, le fusible qui protégerait les
 * personnes, l'énergie « détruite », la masse prise pour le poids, la fente
 * plus étroite qui étalerait moins, Doppler à l'envers, la température
 * négative en kelvins…
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-physique-chimie-lycee', titre: 'Escape game de physique-chimie', matiereCode: 'PHYSIQUE_CHIMIE' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Le signal du laboratoire',
    accroche: 'Un faisceau, deux prismes, six cadenas.',
    intro: 'Le soir, dans le laboratoire plongé dans le noir, un faisceau s’allume sur le banc d’optique : il traverse deux prismes et vient frapper un ballon de solution turquoise. Ce signal cache un message : ouvre les six cadenas du banc pour le lire.',
    fin: 'Le code PRISME s’affiche sur le capteur : le signal du laboratoire est enfin lu.',
    competences: [
      'PC_2DE_SIG_REFRACTION',
      'PC_2DE_CHIM_ESPECES',
      'PC_2DE_CHIM_MOLE',
      'PC_2DE_CHIM_CONCENTRATION',
      'PC_2DE_CHIM_TRANSFO',
      'PC_2DE_SIG_ELECTRIQUE',
    ],
  },
  SECONDE_PRO: {
    titre: 'La panne de l’atelier',
    accroche: 'Le moteur est en panne : trouve pourquoi.',
    intro: 'Sur l’établi de l’atelier, le moteur électrique ne tourne plus : générateur, interrupteur, appareil de mesure, tout est branché, mais rien ne bouge. Six cadenas te séparent de la réparation : trouve la panne, étape par étape.',
    fin: 'Le code MOTEUR relance la machine : la panne de l’atelier est réparée.',
    competences: [
      'PC_2DE_SIG_ELECTRIQUE',
      'PC_2DE_METH_PROTOCOLE',
      'PC_2DE_METH_HOMOGENEITE',
      'PC_2DE_CHIM_ENTITES',
      'PC_2DE_SIG_CAPTEUR',
      'PC_2DE_MOUV_INERTIE',
    ],
  },
  PREMIERE: {
    titre: 'La réaction disparue',
    accroche: 'Le violet s’efface : retrouve la réaction.',
    intro: 'Dans un laboratoire de montagne, une chimiste a laissé son expérience en plan : des cristaux violets se dissolvent, une ampoule goutte au-dessus d’un bécher, et la couleur s’efface à chaque goutte. Retrouve la réaction disparue : six cadenas, six raisonnements de chimiste.',
    fin: 'Le code VIOLET ouvre le carnet de la chimiste : la réaction disparue est retrouvée.',
    competences: [
      'PC_1RE_ONDES_COULEURS',
      'PC_1RE_CHIM_COMPOSITION',
      'PC_1RE_CHIM_OXYDO',
      'PC_1RE_CHIM_AVANCEMENT',
      'PC_1RE_CHIM_DOSAGE',
      'PC_1RE_MOUV_STATIQUE',
    ],
  },
  PREMIERE_TECHNO: {
    titre: 'L’énergie introuvable',
    accroche: 'Où est passée l’énergie de la centrale ?',
    intro: 'Dans la petite centrale du lycée, la chaudière rougeoie, la vapeur fait tourner la turbine et l’alternateur produit du courant. Pourtant, au bout de la chaîne, une partie de l’énergie manque : suis-la de cadenas en cadenas pour la retrouver.',
    fin: 'Le code JOULES boucle le bilan : l’énergie introuvable était partie en chaleur.',
    competences: [
      'PCS1_COMBUSTION_HYDROLYSE',
      'PCS1_PRESSION',
      'PCS1_TRANSFERTS_THERMIQUES',
      'PCS1_TENSION_SECTEUR',
      'PCS1_RISQUE_ELECTRIQUE',
      'PCS1_BILAN_MUSCLE',
    ],
  },
  PREMIERE_PRO: {
    titre: 'Le circuit du chantier',
    accroche: 'Une éolienne, une lampe, six cadenas.',
    intro: 'Dans le bungalow du chantier, une petite éolienne charge une batterie qui allume une lampe. Avant que la pelleteuse ne reprenne le travail, le chef de chantier te confie le circuit : six cadenas à ouvrir pour le valider.',
    fin: 'Le code EOLIEN valide le circuit : le chantier peut reprendre.',
    competences: [
      'PC_2DE_METH_PROTOCOLE',
      'PC_2DE_SIG_ELECTRIQUE',
      'PC_2DE_METH_HOMOGENEITE',
      'PC_2DE_SIG_CAPTEUR',
      'PC_2DE_MOUV_VITESSE',
      'PC_2DE_MOUV_FORCES',
    ],
  },
  TERMINALE: {
    titre: 'L’orbite du signal perdu',
    accroche: 'Un satellite muet à retrouver en orbite.',
    intro: 'À bord d’une station en orbite, l’équipe a perdu le contact avec un petit satellite. Le laser de liaison est prêt, la Terre tourne sous la coupole : six cadenas, six raisonnements de physicien pour retrouver le signal.',
    fin: 'Le code ORBITE rétablit la liaison : le signal perdu est retrouvé.',
    competences: [
      'PC_TLE_MOUV_KEPLER',
      'PC_TLE_ONDES_PHOTOELEC',
      'PC_TLE_ELEC_CONDENSATEUR',
      'PC_TLE_ONDES_DIFFRACTION',
      'PC_TLE_ONDES_DUALITE',
      'PC_TLE_ONDES_DOPPLER',
    ],
  },
  TERMINALE_TECHNO: {
    titre: 'Le spectre invisible',
    accroche: 'Au-delà du violet, ce que l’œil ne voit pas.',
    intro: 'Dans le laboratoire d’optique d’un centre d’imagerie médicale, le prisme étale la lumière en arc-en-ciel sur l’écran. Mais le capteur placé au-delà des couleurs s’affole : une partie du spectre reste invisible. Explore-la, cadenas après cadenas.',
    fin: 'Le code PHOTON éclaire l’écran : le spectre invisible n’a plus de secret.',
    competences: [
      'CBPHT_ONDES_RAYONS_X',
      'CBPHT_PROTECTION_SOLAIRE',
      'CBPHT_OZONE_GES',
      'CBPHT_DOSAGE_ETALONNAGE',
      'CBPHT_RADIOGRAPHIE',
      'CBPHT_DEMI_VIE',
    ],
  },
  TERMINALE_PRO: {
    titre: 'La chaleur sous contrôle',
    accroche: 'Échangeur, compresseur : garde le froid.',
    intro: 'Dans la salle des machines, l’échangeur de chaleur se couvre de givre d’un côté et brûle de l’autre, le compresseur vibre et les manomètres s’agitent. Six cadenas pour reprendre la main sur l’installation.',
    fin: 'Le code KELVIN stabilise l’installation : la chaleur est sous contrôle.',
    competences: [
      'PC_2DE_SIG_SON',
      'PC_2DE_SIG_ELECTRIQUE',
      'PC_2DE_MOUV_FORCES',
      'PC_2DE_SIG_CAPTEUR',
      'PC_2DE_METH_HOMOGENEITE',
      'PC_2DE_CHIM_ESPECES',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Un nombre écrit à la française : virgule décimale, espace entre les milliers, vrai signe moins. */
export function nombre(x) {
  const r = Math.round(Math.abs(x) * 1000) / 1000;
  const [ent, dec] = String(r).split('.');
  const e = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const signe = x < 0 && r !== 0 ? '−' : '';
  return `${signe}${dec ? `${e},${dec}` : e}`;
}

/** Trois chiffres significatifs, comme en chimie : 0,0600 ; 0,167. */
const sig3 = (x) => x.toPrecision(3).replace('.', ',');

/** Deux décimales : un indice de réfraction, 1,50. */
const deux = (x) => x.toFixed(2).replace('.', ',');

/** Une décimale : un angle mesuré au rapporteur, 28,1. */
const uneDecimale = (x) => x.toFixed(1).replace('.', ',');

/** Une mesure de volume à la burette : 12,0 mL. */
const burette = (v) => v.toFixed(1).replace('.', ',');

const sinus = (degres) => Math.sin((degres * Math.PI) / 180);

// ---------------------------------------------------------------- 2de

/** Masses molaires (g/mol) : glucose C₆H₁₂O₆, chlorure de sodium NaCl, saccharose C₁₂H₂₂O₁₁, caféine C₈H₁₀N₄O₂. */
const POUDRES = [
  { nom: 'glucose', M: 180 },
  { nom: 'chlorure de sodium', M: 58.5 },
  { nom: 'saccharose', M: 342 },
  { nom: 'caféine', M: 194 },
];

/**
 * Trois réactions qui dégagent un gaz, où le réactif de coefficient 2 (les
 * ions H⁺) est en plus grande quantité ET pourtant limitant : le piège du
 * « plus petit nombre de moles ». `y` a le coefficient 1, `x` le coefficient 2.
 */
const REACTIONS = [
  { equation: 'Zn + 2 H⁺ → Zn²⁺ + H₂', y: 'Zn', nomY: 'Le zinc Zn' },
  { equation: 'Mg + 2 H⁺ → Mg²⁺ + H₂', y: 'Mg', nomY: 'Le magnésium Mg' },
  { equation: 'CaCO₃ + 2 H⁺ → Ca²⁺ + CO₂ + H₂O', y: 'CaCO₃', nomY: 'Le carbonate de calcium CaCO₃' },
];

const SECONDE = [
  ({ au }) => {
    if (au([true, false])) {
      const n = au([1.45, 1.5, 1.52, 1.6]);
      const i1 = au([30, 40, 45, 50, 60]);
      const i2 = Math.round(((Math.asin(sinus(i1) / n) * 180) / Math.PI) * 10) / 10;
      return {
        recit: 'Le faisceau de la lanterne entre dans le premier prisme et s’y brise. Rapporteur en main, tu relèves les angles de part et d’autre de la normale.',
        question: `Le rayon passe de l’air (n = 1,00) au verre du prisme. Angle d’incidence : ${i1}° ; angle de réfraction : ${uneDecimale(i2)}°. Indice du verre ?`,
        bonne: deux(sinus(i1) / sinus(i2)),
        pieges: { [deux(i1 / i2)]: 'refraction-angles', [deux(sinus(i2) / sinus(i1))]: 'refraction-inverse' },
      };
    }
    return {
      recit: 'Le second prisme étale la lumière blanche en arc-en-ciel sur la paillasse. Un seul détail compte : quelle couleur s’écarte le plus du trajet d’origine.',
      question: 'Lumière blanche à travers un prisme de verre : quelle radiation est la plus déviée ?',
      bonne: 'Le violet',
      pieges: { 'Le rouge': 'dispersion-rouge', 'Toutes autant': 'dispersion-egale' },
    };
  },
  ({ au }) => {
    const pur = au([true, false]);
    return {
      recit: 'Près du ballon, un flacon sans étiquette : le solvant de la solution. Tu en chauffes quelques millilitres, thermomètre plongé dans le liquide.',
      question: pur
        ? 'Liquide limpide et incolore. Sous pression normale, sa température reste fixée à 78 °C pendant toute l’ébullition. C’est… ?'
        : 'Liquide limpide et incolore. Sous pression normale, sa température monte de 80 °C à 95 °C pendant l’ébullition. C’est… ?',
      bonne: pur ? 'Un corps pur' : 'Un mélange',
      pieges: pur
        ? { 'Un mélange': 'espece-palier', 'De l’eau': 'espece-eau' }
        : { 'Un corps pur': 'espece-limpide', 'De l’eau': 'espece-eau' },
    };
  },
  ({ au }) => {
    const p = au(POUDRES);
    const n = au([0.1, 0.2, 0.25, 0.4, 0.5, 2]);
    const m = n * p.M;
    return {
      recit: 'Sur la balance, une coupelle de la poudre qui a servi à préparer la solution du ballon. L’étiquette du pot donne sa masse molaire.',
      question: `Sur la coupelle : ${nombre(m)} g de ${p.nom} (M = ${nombre(p.M)} g/mol). Quantité de matière ?`,
      bonne: `${nombre(n)} mol`,
      pieges: { [`${nombre(m * p.M)} mol`]: 'mole-produit', [`${nombre(p.M / m)} mol`]: 'mole-inverse' },
    };
  },
  ({ au }) => {
    const c1m = au([10, 20, 50, 100]);
    const f = au([4, 5, 10, 20, 25]);
    const vf = au([50, 100, 200, 250, 500]);
    const c1 = c1m / 1000;
    const c0 = (c1m * f) / 1000;
    const v0 = vf / f;
    return {
      recit: 'La solution du ballon est trop concentrée : le faisceau s’y éteint au lieu de la traverser. Il faut la diluer, et la fiole jaugée est prête.',
      question: `Solution mère : C₀ = ${nombre(c0)} mol/L. On veut ${nombre(vf)} mL de solution fille à C₁ = ${nombre(c1)} mol/L. Volume de solution mère à prélever ?`,
      bonne: `${nombre(v0)} mL`,
      pieges: { [`${nombre(vf * f)} mL`]: 'dilution-inverse', [`${nombre(vf - v0)} mL`]: 'dilution-eau' },
    };
  },
  ({ au, entre }) => {
    const r = au(REACTIONS);
    const ny = entre(2, 6);
    const nx = entre(ny + 1, 2 * ny - 1);
    return {
      recit: 'Le ballon est relié par un tube coudé à une éprouvette : une réaction y dégage un gaz. Avant de relancer le montage, il faut savoir quel réactif s’épuisera le premier.',
      question: `${r.equation}. n(${r.y}) = ${nombre(ny / 100)} mol ; n(H⁺) = ${nombre(nx / 100)} mol. Réactif limitant ?`,
      bonne: 'Les ions H⁺',
      pieges: { [r.nomY]: 'limitant-coefficients', 'Aucun : mélange stœchiométrique': 'limitant-stoechio' },
    };
  },
  ({ au }) => {
    const r = au([100, 150, 220, 330, 470]);
    const i = au([5, 10, 12, 15, 20]);
    return {
      recit: 'Au bout du banc, le faisceau tombe sur un capteur : une photorésistance branchée dans un circuit. Le message s’affichera quand tu auras trouvé la tension à ses bornes.',
      question: `Photorésistance éclairée : R = ${r} Ω ; elle est traversée par I = ${i} mA. Tension à ses bornes ?`,
      bonne: `${nombre((r * i) / 1000)} V`,
      pieges: { [`${nombre(r * i)} V`]: 'ohm-milli', [`${nombre(r / (i / 1000))} V`]: 'ohm-diviser' },
    };
  },
];

// ---------------------------------------------------------------- 2de pro

/** Numéros atomiques vérifiés : aluminium 13, fer 26, cuivre 29, zinc 30. */
const IONS = [
  { ion: 'Cu²⁺', atome: 'de cuivre', Z: 29, charge: 2 },
  { ion: 'Fe²⁺', atome: 'de fer', Z: 26, charge: 2 },
  { ion: 'Fe³⁺', atome: 'de fer', Z: 26, charge: 3 },
  { ion: 'Zn²⁺', atome: 'de zinc', Z: 30, charge: 2 },
  { ion: 'Al³⁺', atome: 'd’aluminium', Z: 13, charge: 3 },
];

const SECONDE_PRO = [
  () => ({
    recit: 'Premier indice : sur l’établi, un fil rouge est coupé net, ses brins de cuivre à l’air.',
    question: 'Circuit en série : générateur, interrupteur fermé, ampèremètre, moteur. Un fil est coupé. Le courant… ?',
    bonne: 'Ne passe plus nulle part',
    pieges: { 'Passe jusqu’à la coupure': 'serie-coupure', 'Passe encore dans le moteur': 'serie-moteur' },
  }),
  () => ({
    recit: 'Le fil est réparé. Pour vérifier que le courant arrive au moteur, tu prends l’ampèremètre à aiguille.',
    question: 'Pour mesurer l’intensité du courant qui traverse le moteur, l’ampèremètre se branche… ?',
    bonne: 'En série avec le moteur',
    pieges: { 'En dérivation, aux bornes du moteur': 'amperemetre-derivation', 'À la place du moteur': 'appareil-remplacer' },
  }),
  ({ au }) => {
    const r = au([10, 22, 47, 68, 100]);
    const i = au([100, 150, 200, 250, 500]);
    return {
      recit: 'Dans le boîtier de commande, une résistance a noirci. Pour savoir si elle a trop chauffé, il faut la tension à ses bornes.',
      question: `Résistance du boîtier : R = ${r} Ω ; I = ${i} mA. Tension à ses bornes ?`,
      bonne: `${nombre((r * i) / 1000)} V`,
      pieges: { [`${nombre(r * i)} V`]: 'ohm-milli', [`${nombre(r / (i / 1000))} V`]: 'ohm-diviser' },
    };
  },
  ({ au }) => {
    const e = au(IONS);
    return {
      recit: 'Sur l’étagère, des pièces métalliques se sont oxydées : à leur surface, des atomes ont perdu des électrons et sont devenus des ions.',
      question: `L’atome ${e.atome} a Z = ${e.Z}. Combien d’électrons possède l’ion ${e.ion} ?`,
      bonne: String(e.Z - e.charge),
      pieges: { [String(e.Z + e.charge)]: 'ion-gagne', [String(e.Z)]: 'ion-neutre' },
    };
  },
  () => ({
    recit: 'Une sonde collée sur le moteur coupe tout s’il surchauffe. C’est une CTN, une thermistance : il faut savoir comment elle réagit.',
    question: 'Sonde CTN collée sur le moteur : quand le moteur chauffe, sa résistance… ?',
    bonne: 'Diminue',
    pieges: { Augmente: 'ctn-sens', 'Ne change pas': 'capteur-fixe' },
  }),
  () => ({
    recit: 'Dernier contrôle avant de relancer : le moteur doit être bien posé sur son socle, sans bouger.',
    question: 'Le moteur, vissé sur son socle, est immobile sur l’établi. Les forces qui s’exercent sur lui… ?',
    bonne: 'Se compensent',
    pieges: { 'Il n’y en a aucune': 'repos-aucune', 'Seul son poids agit': 'repos-poids' },
  }),
];

// ---------------------------------------------------------------- 1re

/** Couleurs complémentaires (synthèse additive) : vert ↔ magenta, rouge ↔ cyan, bleu ↔ jaune. */
const COULEURS = [
  { absorbee: 'vert', percue: 'Magenta' },
  { absorbee: 'rouge', percue: 'Cyan' },
  { absorbee: 'bleu', percue: 'Jaune' },
];

/** Demi-équations vérifiées (charges et atomes) des titrages au permanganate. */
const DEMI_EQUATIONS = [
  { equation: 'MnO₄⁻ + 8 H⁺ + 5 e⁻ → Mn²⁺ + 4 H₂O', qui: 'l’ion permanganate', bonne: 'Une réduction' },
  { equation: 'Fe²⁺ → Fe³⁺ + e⁻', qui: 'l’ion fer (II)', bonne: 'Une oxydation' },
  { equation: 'H₂C₂O₄ → 2 CO₂ + 2 H⁺ + 2 e⁻', qui: 'l’acide oxalique', bonne: 'Une oxydation' },
];

/** MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O : charges 17 = 17, atomes équilibrés. */
const TITRAGE = 'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O';

const PREMIERE = [
  ({ au }) => {
    const c = au(COULEURS);
    return {
      recit: 'Les cristaux violets teintent l’eau du bécher, et d’autres flacons colorés s’alignent sur l’étagère. D’abord, comprendre d’où vient la couleur d’une solution.',
      question: `Éclairée en lumière blanche, une solution absorbe surtout le ${c.absorbee}. Couleur perçue ?`,
      bonne: c.percue,
      pieges: { [c.absorbee[0].toUpperCase() + c.absorbee.slice(1)]: 'couleur-absorbee', Noire: 'couleur-noire' },
    };
  },
  ({ au }) => {
    const k = au([1.5, 2, 2.5]);
    const a = au([0.3, 0.45, 0.6, 0.75, 0.9]);
    return {
      recit: 'Combien de permanganate reste-t-il dans le bécher ? Tu passes un échantillon au spectrophotomètre, la courbe d’étalonnage sous les yeux.',
      question: `Étalonnage : A = k × C, avec k = ${nombre(k)} L/mmol. L’échantillon a une absorbance A = ${nombre(a)}. Concentration ?`,
      bonne: `${nombre(a / k)} mmol/L`,
      pieges: { [`${nombre(a * k)} mmol/L`]: 'absorbance-produit', [`${nombre(k / a)} mmol/L`]: 'absorbance-inverse' },
    };
  },
  ({ au }) => {
    const e = au(DEMI_EQUATIONS);
    const pieges = { 'Un échange de protons': 'oxydo-protons' };
    pieges[e.bonne === 'Une oxydation' ? 'Une réduction' : 'Une oxydation'] = 'oxydo-electrons';
    return {
      recit: 'Goutte à goutte, la solution violette tombe dans le bécher et sa couleur s’efface : le permanganate réagit. Le carnet de la chimiste est ouvert sur une demi-équation.',
      question: `${e.equation}. Que subit ${e.qui} ?`,
      bonne: e.bonne,
      pieges,
    };
  },
  ({ entre }) => {
    const a = entre(1, 3);
    const b = entre(a + 1, 5 * a - 1);
    return {
      recit: 'Sur la page suivante, un tableau d’avancement à moitié rempli : la chimiste voulait savoir jusqu’où la réaction pouvait aller.',
      question: `${TITRAGE}, ions H⁺ en excès. n(MnO₄⁻) = ${a} mmol ; n(Fe²⁺) = ${b} mmol. Avancement maximal ?`,
      bonne: `${nombre(b / 5)} mmol`,
      pieges: { [`${a} mmol`]: 'avancement-plus-petit', [`${b} mmol`]: 'avancement-coefficient' },
    };
  },
  ({ au }) => {
    const c = au([0.01, 0.02]);
    const va = au([10, 20]);
    const ve = au([8, 10, 12, 14, 15, 16]);
    return {
      recit: 'Voilà donc la réaction disparue : un titrage. Tant que les ions fer réagissent, le violet s’efface ; dès qu’il n’y en a plus, la teinte persiste.',
      question: `${TITRAGE}. Prise d’essai : ${burette(va)} mL d’ions Fe²⁺ ; permanganate à ${sig3(c)} mol/L ; équivalence à ${burette(ve)} mL. Concentration en Fe²⁺ ?`,
      bonne: `${sig3((5 * c * ve) / va)} mol/L`,
      pieges: {
        [`${sig3((c * ve) / va)} mol/L`]: 'dosage-coefficient',
        [`${sig3((c * ve) / (5 * va))} mol/L`]: 'dosage-coefficient-inverse',
      },
    };
  },
  ({ au }) => {
    const p1 = au([80, 90]);
    const v2 = au([100, 120, 160, 200]);
    const r = au([1.25, 1.5, 2]);
    const v1 = v2 * r;
    return {
      recit: 'Dernier indice : l’erlenmeyer bouché garde le dioxyde de carbone dégagé par l’acide oxalique. Ici, en montagne, la pression de l’air est plus faible qu’au bord de la mer.',
      question: `Gaz enfermé : V₁ = ${nombre(v1)} mL sous p₁ = ${p1} kPa. Comprimé à température constante jusqu’à V₂ = ${v2} mL. Pression p₂ ?`,
      bonne: `${nombre(p1 * r)} kPa`,
      pieges: { [`${nombre(p1 / r)} kPa`]: 'mariotte-inverse', [`${p1} kPa`]: 'mariotte-fixe' },
    };
  },
];

// ---------------------------------------------------------------- 1re techno

const COMBUSTIBLES = [
  'Dans la chaudière, la biomasse brûle ; on modélise sa combustion complète par celle du glucose C₆H₁₂O₆ dans le dioxygène. Produits ?',
  'La chaudière d’appoint brûle du méthane CH₄. Combustion complète dans le dioxygène : produits ?',
];

const TRANSFERTS = [
  { texte: 'Tu poses la main sur un tuyau de cuivre brûlant : ta main chauffe aussitôt.', mode: 'conduction' },
  { texte: 'L’air chauffé au contact de l’échangeur s’élève et réchauffe tout le hall.', mode: 'convection' },
  { texte: 'À deux mètres du hublot de la chaudière, tu sens sa chaleur sur ton visage, sans rien toucher, alors que l’air autour reste frais.', mode: 'rayonnement' },
];

const MODES = { conduction: 'La conduction', convection: 'La convection', rayonnement: 'Le rayonnement' };

const PREMIERE_TECHNO = [
  ({ au }) => ({
    recit: 'Tout commence dans la chaudière, où rougeoie la flamme. Avant de suivre l’énergie, il faut savoir ce que produit cette combustion.',
    question: au(COMBUSTIBLES),
    bonne: 'CO₂ et H₂O',
    pieges: { 'CO et H₂O': 'combustion-incomplete', 'CO₂ seulement': 'combustion-eau' },
  }),
  ({ au }) => {
    const p = au([100, 150, 200, 250, 300, 400]); // kPa
    const s = au([10, 20, 25, 40, 50]); // cm²
    const f = (p * s) / 10; // N : p × 1 000 × s × 10⁻⁴
    return {
      recit: 'La vapeur file vers la turbine. Sur la conduite, le manomètre frémit et le clapet de sécurité vibre : quelle pression supporte-t-il ?',
      question: `La vapeur appuie sur le clapet de sécurité : F = ${nombre(f)} N sur S = ${s} cm². Pression exercée ?`,
      bonne: `${nombre(p)} kPa`,
      pieges: { [`${nombre(f / s)} Pa`]: 'pression-cm2', [`${nombre(p / 100)} kPa`]: 'pression-cm2-cent' },
    };
  },
  ({ au }) => {
    const t = au(TRANSFERTS);
    const pieges = {};
    Object.keys(MODES).filter((k) => k !== t.mode).forEach((k) => { pieges[MODES[k]] = `transfert-${k}`; });
    return {
      recit: 'Une partie de l’énergie s’échappe en chaleur, tout le long des tuyaux de cuivre. Par où s’en va-t-elle ?',
      question: `${t.texte} Quel mode de transfert thermique ?`,
      bonne: MODES[t.mode],
      pieges,
    };
  },
  ({ au }) => {
    if (au([true, false])) {
      const ueff = au([230, 400]);
      return {
        recit: 'L’alternateur tourne. Sur l’oscilloscope branché à sa sortie, une belle sinusoïde.',
        question: `Tension efficace : ${ueff} V. Valeur maximale de la tension sur l’oscillogramme, au volt près ?`,
        bonne: `${Math.round(ueff * Math.SQRT2)} V`,
        pieges: { [`${ueff} V`]: 'secteur-efficace', [`${Math.round(ueff / Math.SQRT2)} V`]: 'secteur-diviser' },
      };
    }
    const t = au([10, 20, 25, 40, 50]);
    return {
      recit: 'L’alternateur tourne. Sur l’oscilloscope branché à sa sortie, une belle sinusoïde.',
      question: `Sur l’oscillogramme, une période de la tension dure ${t} ms. Fréquence ?`,
      bonne: `${nombre(1000 / t)} Hz`,
      pieges: { [`${t} Hz`]: 'frequence-periode', [`${nombre(1 / t)} Hz`]: 'frequence-milli' },
    };
  },
  ({ au }) => (au([true, false])
    ? {
      recit: 'Dans l’armoire électrique, un voyant clignote : un défaut d’isolement. Il faut savoir qui protège les techniciens.',
      question: 'Un défaut met sous tension la carcasse métallique de l’alternateur, reliée à la terre. Qu’est-ce qui coupe le courant pour protéger les personnes ?',
      bonne: 'Le disjoncteur différentiel',
      pieges: { 'Le fusible': 'risque-fusible', 'La prise de terre seule': 'risque-terre-seule' },
    }
    : {
      recit: 'Dans l’armoire électrique, un câble est dénudé. Le rapport d’incident est resté ouvert sur la console.',
      question: 'Un technicien a touché un câble dénudé : le courant a traversé son corps, sans gravité. C’est… ?',
      bonne: 'Une électrisation',
      pieges: { 'Une électrocution': 'risque-electrocution', 'Un court-circuit': 'risque-court-circuit' },
    }),
  ({ au }) => {
    const recue = au([200, 400, 500, 800, 1000]);
    const perte = (recue * au([5, 10, 15, 20])) / 100;
    return {
      recit: 'Dernier cadenas, à la sortie de l’alternateur : le compteur affiche moins d’énergie que la turbine n’en a fourni. L’énergie introuvable est là.',
      question: `L’alternateur reçoit ${nombre(recue)} kJ de la turbine et fournit ${nombre(recue - perte)} kJ d’énergie électrique. L’énergie manquante ?`,
      bonne: `${nombre(perte)} kJ, en chaleur`,
      pieges: { [`${nombre(perte)} kJ, détruits`]: 'bilan-detruite', 'Aucune : le rendement vaut 100 %': 'bilan-parfait' },
    };
  },
];

// ---------------------------------------------------------------- 1re pro

const PREMIERE_PRO = [
  () => ({
    recit: 'Sur la table du bungalow, la petite éolienne tourne dans le courant d’air de la porte. Produit-elle vraiment une tension ?',
    question: 'Pour mesurer la tension que produit l’éolienne, le voltmètre se branche… ?',
    bonne: 'En dérivation, à ses bornes',
    pieges: { 'En série, dans le circuit': 'voltmetre-serie', 'À la place de la lampe': 'appareil-remplacer' },
  }),
  ({ au }) => {
    const u = au([6, 12, 24]);
    const r = au([4, 8, 16, 48]);
    return {
      recit: 'La lampe du bungalow s’allume. Quel courant la traverse ?',
      question: `Lampe en fonctionnement : U = ${u} V ; R = ${r} Ω. Intensité du courant ?`,
      bonne: `${nombre(u / r)} A`,
      pieges: { [`${nombre(u * r)} A`]: 'ohm-produit', [`${nombre(r / u)} A`]: 'ohm-inverse' },
    };
  },
  ({ au }) => {
    const c = au([1200, 2000, 2400, 3500, 5000]);
    return {
      recit: 'Entre l’éolienne et la lampe, une batterie stocke l’énergie pour la nuit. Son étiquette est en milliampères-heures.',
      question: `La batterie affiche ${nombre(c)} mAh. Sa capacité en ampères-heures ?`,
      bonne: `${nombre(c / 1000)} Ah`,
      pieges: { [`${nombre(c / 100)} Ah`]: 'milli-cent', [`${nombre(c * 1000)} Ah`]: 'milli-multiplier' },
    };
  },
  () => ({
    recit: 'La lampe doit s’allumer seule à la nuit tombée. Un petit capteur, sur le rebord de la fenêtre, surveille la lumière.',
    question: 'Une photorésistance commande la lampe. Quand l’éclairement baisse, sa résistance… ?',
    bonne: 'Augmente',
    pieges: { Diminue: 'ldr-sens', 'Ne change pas': 'capteur-fixe' },
  }),
  ({ au }) => {
    const v = au([0.5, 1.5, 2, 2.5]); // m/s
    const t = au([1, 2, 4]); // min
    const d = v * 60 * t;
    return {
      recit: 'Dehors, la pelleteuse reprend sa route vers le tas de blocs. Le chef de chantier chronomètre son trajet.',
      question: `La pelleteuse parcourt ${nombre(d)} m en ${t} min. Vitesse moyenne en m/s ?`,
      bonne: `${nombre(v)} m/s`,
      pieges: { [`${nombre(d / t)} m/s`]: 'vitesse-minutes', [`${nombre((60 * t) / d)} m/s`]: 'vitesse-inverse' },
    };
  },
  ({ au }) => {
    const m = au([200, 250, 400, 500, 800]);
    return {
      recit: 'Dernier cadenas : la pelleteuse soulève un bloc de béton. Personne ne passe dessous, mais il faut connaître la force qui le tire vers le sol.',
      question: `Un bloc de béton de ${m} kg pend au bras de la pelleteuse ; g = 9,8 N/kg. Son poids ?`,
      bonne: `${nombre(m * 9.8)} N`,
      pieges: { [`${m} N`]: 'poids-masse', [`${nombre(m / 9.8)} N`]: 'poids-diviser' },
    };
  },
];

// ---------------------------------------------------------------- terminale

const VUES_DE_LA_LUMIERE = [
  { texte: 'Passé par une fente fine, le faisceau donne sur l’écran une tache centrale entourée de taches plus faibles.', modele: 'ondulatoire' },
  { texte: 'Deux faisceaux superposés donnent des franges alternativement brillantes et sombres.', modele: 'ondulatoire' },
  { texte: 'Le signal est si faible que le détecteur enregistre des impacts un par un.', modele: 'particulaire' },
  { texte: 'La lumière arrache des électrons au métal du capteur, mais seulement au-delà d’une certaine fréquence.', modele: 'particulaire' },
];

const TERMINALE = [
  ({ au }) => {
    const t = au([1.5, 2, 3, 4]);
    const k = au([4, 9]);
    const racine = Math.sqrt(k);
    return {
      recit: 'Le satellite perdu ne répond plus. On sait seulement qu’il tourne sur une orbite circulaire plus haute que celle d’un satellite connu : quand repassera-t-il ?',
      question: `Satellite A : orbite circulaire, période ${nombre(t)} h. Satellite B : orbite circulaire de rayon ${k} fois plus grand, autour de la Terre. Période de B ?`,
      bonne: `${nombre(t * k * racine)} h`,
      pieges: { [`${nombre(t * k)} h`]: 'kepler-proportion', [`${nombre(t * k * k)} h`]: 'kepler-carre' },
    };
  },
  ({ au }) => {
    const s = au([2, 4, 5]); // m²
    const eta = au([20, 25, 30]); // %
    const pe = (1360 * s * eta) / 100;
    return {
      recit: 'Pourquoi s’est-il tu ? Ses panneaux solaires sont peut-être en cause : la télémétrie de ses derniers jours de vie arrive à l’écran.',
      question: `Panneaux du satellite : S = ${s} m² ; puissance solaire reçue : 1 360 W/m² ; puissance électrique fournie : ${nombre(pe)} W. Rendement ?`,
      bonne: `${eta} %`,
      pieges: { [`${nombre(10000 / eta)} %`]: 'rendement-inverse', [`${nombre(s * eta)} %`]: 'rendement-surface' },
    };
  },
  ({ au }) => {
    const c = au([10, 47, 100, 220, 470]); // µF
    const u = au([5, 9, 12, 24]); // V
    return {
      recit: 'Pour réveiller le satellite, l’émetteur laser doit tirer une impulsion puissante. Il la puise dans un condensateur, qu’on charge.',
      question: `Condensateur de l’émetteur : C = ${c} µF, chargé sous U = ${u} V. Charge stockée ?`,
      bonne: `${nombre(c * u)} µC`,
      pieges: { [`${nombre(c / u)} µC`]: 'condensateur-diviser', [`${nombre(c * u)} C`]: 'condensateur-micro' },
    };
  },
  ({ au }) => {
    if (au([true, false])) {
      const lambda = au([532, 633]); // nm
      const a = au([0.1, 0.2, 0.5]); // mm
      return {
        recit: 'Le faisceau traverse la fente de réglage avant de partir vers l’espace. S’il s’étale trop, il manquera le satellite.',
        question: `Faisceau laser : λ = ${lambda} nm ; fente de largeur a = ${nombre(a)} mm. Écart angulaire de diffraction ?`,
        bonne: `${nombre(lambda / a / 1000)} mrad`,
        pieges: { [`${nombre(lambda / a)} mrad`]: 'diffraction-unites', [`${nombre((a * 1e6) / lambda)} rad`]: 'diffraction-inverse' },
      };
    }
    return {
      recit: 'Le faisceau traverse la fente de réglage avant de partir vers l’espace. S’il s’étale trop, il manquera le satellite.',
      question: 'Pour que le faisceau s’étale moins en route vers le satellite, la fente doit être… ?',
      bonne: 'Plus large',
      pieges: { 'Plus étroite': 'diffraction-etroite', 'Peu importe sa largeur': 'diffraction-sans-effet' },
    };
  },
  ({ au }) => {
    const v = au(VUES_DE_LA_LUMIERE);
    const ondulatoire = v.modele === 'ondulatoire';
    return {
      recit: 'Le laser est tiré. Sur les écrans de contrôle, la lumière se montre tantôt onde, tantôt grains : il faut choisir le bon modèle pour lire chaque mesure.',
      question: `${v.texte} Quel modèle de la lumière l’explique ?`,
      bonne: ondulatoire ? 'Le modèle ondulatoire' : 'Le modèle particulaire',
      pieges: ondulatoire ? { 'Le modèle particulaire': 'dualite-particule' } : { 'Le modèle ondulatoire': 'dualite-onde' },
    };
  },
  ({ au }) => {
    const eloigne = au([true, false]);
    return {
      recit: eloigne
        ? 'Le signal revient enfin ! Mais sa fréquence n’est pas tout à fait celle d’émission : en ce moment, le satellite s’éloigne de la station.'
        : 'Le signal revient enfin ! Mais sa fréquence n’est pas tout à fait celle d’émission : en ce moment, le satellite se rapproche de la station.',
      question: eloigne
        ? 'La source s’éloigne du récepteur. La fréquence reçue est… ?'
        : 'La source se rapproche du récepteur. La fréquence reçue est… ?',
      bonne: eloigne ? 'Plus basse qu’à l’émission' : 'Plus haute qu’à l’émission',
      pieges: {
        [eloigne ? 'Plus haute qu’à l’émission' : 'Plus basse qu’à l’émission']: 'doppler-sens',
        'La même : seule l’intensité change': 'doppler-intensite',
      },
    };
  },
];

// ---------------------------------------------------------------- terminale techno

/** Domaines, longueurs d'onde dans le vide : X ≲ 10 nm < UV < 400 nm ≤ visible ≤ 800 nm < IR. */
const DOMAINES = { x: 'Rayons X', uv: 'Ultraviolet', visible: 'Visible', ir: 'Infrarouge' };
const LONGUEURS = [
  { l: 0.1, domaine: 'x' }, { l: 1, domaine: 'x' },
  { l: 200, domaine: 'uv' }, { l: 250, domaine: 'uv' }, { l: 300, domaine: 'uv' }, { l: 350, domaine: 'uv' },
  { l: 450, domaine: 'visible' }, { l: 550, domaine: 'visible' }, { l: 650, domaine: 'visible' },
  { l: 900, domaine: 'ir' }, { l: 1500, domaine: 'ir' }, { l: 3000, domaine: 'ir' },
];

/** Périodes : technétium 99m ≈ 6 h, iode 131 ≈ 8 jours, fluor 18 ≈ 110 min. */
const TRACEURS = [
  { nom: 'au technétium 99m', t: 6, unite: 'h' },
  { nom: 'à l’iode 131', t: 8, unite: 'jours' },
  { nom: 'au fluor 18', t: 110, unite: 'min' },
];

const TERMINALE_TECHNO = [
  ({ au }) => {
    const r = au(LONGUEURS);
    const pieges = {};
    Object.keys(DOMAINES).filter((k) => k !== r.domaine).forEach((k) => { pieges[DOMAINES[k]] = `domaine-${k}`; });
    return {
      recit: 'Au-delà du violet et au-delà du rouge, l’écran reste noir, et pourtant le capteur mesure quelque chose. À quel domaine appartient ce rayonnement ?',
      question: `Le capteur mesure une radiation de longueur d’onde λ = ${nombre(r.l)} nm. Domaine ?`,
      bonne: DOMAINES[r.domaine],
      pieges,
    };
  },
  ({ au }) => (au([true, false])
    ? {
      recit: 'Sur le banc, une plaque de verre enduite de crème solaire arrête une partie du rayonnement invisible. Le flacon est posé à côté.',
      question: 'Le flacon de crème solaire affiche un indice de protection élevé. Contre quels rayons protège-t-il d’abord ?',
      bonne: 'Les UVB',
      pieges: { 'Les UVA': 'solaire-uva', 'Les infrarouges': 'solaire-ir' },
    }
    : {
      recit: 'Sur le banc, une plaque de verre enduite de crème solaire arrête une partie du rayonnement invisible. Encore faut-il savoir quels ultraviolets sont les plus dangereux.',
      question: 'UVA ou UVB : lesquels ont la longueur d’onde la plus courte, et transportent le plus d’énergie ?',
      bonne: 'Les UVB',
      pieges: { 'Les UVA': 'uv-energie', 'Ils sont identiques': 'uv-identiques' },
    }),
  ({ au }) => (au([true, false])
    ? {
      recit: 'Une fiche est punaisée au-dessus du banc : « Les ultraviolets du Soleil, qui les arrête avant le sol ? »',
      question: 'Dans la haute atmosphère, la couche d’ozone… ?',
      bonne: 'Absorbe une grande partie des UV solaires',
      pieges: { 'Produit le dioxygène de l’air': 'ozone-oxygene', 'Est un polluant à éliminer': 'ozone-polluant' },
    }
    : {
      recit: 'Une alerte s’affiche sur l’écran du laboratoire : pic de pollution à l’ozone en ville, cet après-midi.',
      question: 'Au niveau du sol, en été, l’ozone formé par la pollution… ?',
      bonne: 'Irrite les voies respiratoires',
      pieges: { 'Protège des UV': 'ozone-protecteur', 'Est sans effet sur la santé': 'ozone-inoffensif' },
    }),
  ({ au }) => {
    const k = au([1.5, 2, 2.5]);
    const a = au([0.3, 0.45, 0.6, 0.75, 0.9]);
    return {
      recit: 'Le prisme sert aussi à doser : le spectrophotomètre choisit la bonne couleur et mesure combien l’échantillon en absorbe.',
      question: `Étalonnage d’un colorant : A = k × C, avec k = ${nombre(k)} L/mmol. Échantillon : A = ${nombre(a)}. Concentration ?`,
      bonne: `${nombre(a / k)} mmol/L`,
      pieges: { [`${nombre(a * k)} mmol/L`]: 'absorbance-produit', [`${nombre(k / a)} mmol/L`]: 'absorbance-inverse' },
    };
  },
  ({ au }) => (au([true, false])
    ? {
      recit: 'Dans la salle voisine, une radiographie est accrochée au négatoscope. Les rayons X, eux aussi, sont invisibles.',
      question: 'Sur une radiographie, les os apparaissent en blanc. Pourquoi ?',
      bonne: 'Ils absorbent davantage les rayons X',
      pieges: { 'Ils émettent de la lumière': 'radio-emission', 'Les rayons X les traversent mieux': 'radio-traverse' },
    }
    : {
      recit: 'Dans la salle voisine, deux appareils à rayons X : l’un fait des images, l’autre soigne.',
      question: 'Radiographie ou radiothérapie : laquelle vise à détruire des cellules ?',
      bonne: 'La radiothérapie',
      pieges: { 'La radiographie': 'radio-diagnostic', 'Les deux': 'radio-les-deux' },
    }),
  ({ au }) => {
    const tr = au(TRACEURS);
    const n = au([3, 4, 5]);
    return {
      recit: 'Dernier cadenas : un traceur radioactif, injecté pour l’imagerie, émet un rayonnement que l’œil ne verra jamais. Combien en restera-t-il ?',
      question: `Traceur ${tr.nom} : on prend t½ = ${tr.t} ${tr.unite}. Fraction des noyaux initiaux restant au bout de ${n * tr.t} ${tr.unite} ?`,
      bonne: `1/${2 ** n}`,
      pieges: { [`1/${2 * n}`]: 'demi-vie-puissance', 'Plus aucun noyau': 'demi-vie-tout' },
    };
  },
];

// ---------------------------------------------------------------- terminale pro

const PALIERS = [
  { question: 'Dans le bac, de la glace d’eau pure fond sous pression normale. Pendant la fusion, sa température… ?', bonne: 'Reste à 0 °C' },
  { question: 'Dans le ballon d’appoint, de l’eau pure bout sous pression normale. Pendant l’ébullition, sa température… ?', bonne: 'Reste à 100 °C' },
];

const TERMINALE_PRO = [
  ({ au }) => {
    const f = au([25, 50, 100, 200, 250]);
    return {
      recit: 'Le compresseur bleu vibre sur son socle, et son bourdonnement envahit la salle. Pour vérifier qu’il tourne à son régime, on mesure sa vibration.',
      question: `Le compresseur vibre à f = ${f} Hz. Période de cette vibration ?`,
      bonne: `${nombre(1000 / f)} ms`,
      pieges: { [`${nombre(1 / f)} ms`]: 'periode-convertir', [`${f} ms`]: 'frequence-periode' },
    };
  },
  ({ au }) => {
    const i = au([0.5, 1.2, 1.5, 2, 2.5, 3]);
    return {
      recit: 'Derrière l’échangeur, les deux ventilateurs de refroidissement tournent ensemble. Le câble qui les alimente chauffe-t-il trop ?',
      question: `Deux ventilateurs identiques, branchés en dérivation, sont chacun traversés par ${nombre(i)} A. Intensité dans la branche principale ?`,
      bonne: `${nombre(2 * i)} A`,
      pieges: { [`${nombre(i)} A`]: 'noeuds-meme', [`${nombre(i / 2)} A`]: 'noeuds-moitie' },
    };
  },
  ({ au }) => {
    const m = au([150, 300, 450, 600, 1000]);
    return {
      recit: 'La cuve d’eau glacée repose sur quatre pieds. Avant de la déplacer, il faut connaître la force qui la tire vers le sol.',
      question: `La cuve pleine a une masse de ${nombre(m)} kg ; g = 9,8 N/kg. Son poids ?`,
      bonne: `${nombre(m * 9.8)} N`,
      pieges: { [`${nombre(m)} N`]: 'poids-masse', [`${nombre(m / 9.8)} N`]: 'poids-diviser' },
    };
  },
  ({ au }) => {
    const theta = au([10, 20, 40, 50, 60, 80]);
    const r = 100 + 0.385 * theta;
    return {
      recit: 'Une sonde de platine plonge dans l’eau qui sort de l’échangeur. L’afficheur ne donne qu’une résistance : à toi de la traduire.',
      question: `Sonde de platine : 100 Ω à 0 °C, et sa résistance augmente de 0,385 Ω par degré. Elle affiche ${nombre(r)} Ω. Température de l’eau ?`,
      bonne: `${theta} °C`,
      pieges: { [`${nombre(r - 100)} °C`]: 'sonde-pente', [`${nombre(r / 0.385)} °C`]: 'sonde-zero' },
    };
  },
  ({ au }) => {
    const theta = au([4, 5, 6, 7, 12]);
    return {
      recit: 'Le cahier de réglage de l’installation donne toutes ses températures en kelvins. Il faut convertir celle de l’eau glacée.',
      question: `L’eau glacée sort de l’échangeur à ${theta} °C. Sa température en kelvins ?`,
      bonne: `${nombre(theta + 273.15)} K`,
      pieges: { [`${nombre(theta - 273.15)} K`]: 'kelvin-signe', [`${theta} K`]: 'kelvin-meme' },
    };
  },
  ({ au }) => {
    const p = au(PALIERS);
    const autre = p.bonne === 'Reste à 0 °C' ? 'Reste à 100 °C' : 'Reste à 0 °C';
    return {
      recit: 'Dernier cadenas : un changement d’état, celui qui permet de stocker le froid ou de le produire. Sa température, il faut la prévoir.',
      question: p.question,
      bonne: p.bonne,
      pieges: { 'Monte peu à peu': 'palier-monte', [autre]: 'palier-autre' },
    };
  },
];

const HISTOIRES = {
  SECONDE: { prefixe: '2de', code: ['P', 'R', 'I', 'S', 'M', 'E'], etapes: SECONDE },
  SECONDE_PRO: { prefixe: '2pro', code: ['M', 'O', 'T', 'E', 'U', 'R'], etapes: SECONDE_PRO },
  PREMIERE: { prefixe: '1re', code: ['V', 'I', 'O', 'L', 'E', 'T'], etapes: PREMIERE },
  PREMIERE_TECHNO: { prefixe: '1tec', code: ['J', 'O', 'U', 'L', 'E', 'S'], etapes: PREMIERE_TECHNO },
  PREMIERE_PRO: { prefixe: '1pro', code: ['E', 'O', 'L', 'I', 'E', 'N'], etapes: PREMIERE_PRO },
  TERMINALE: { prefixe: 'tle', code: ['O', 'R', 'B', 'I', 'T', 'E'], etapes: TERMINALE },
  TERMINALE_TECHNO: { prefixe: 'ttec', code: ['P', 'H', 'O', 'T', 'O', 'N'], etapes: TERMINALE_TECHNO },
  TERMINALE_PRO: { prefixe: 'tpro', code: ['K', 'E', 'L', 'V', 'I', 'N'], etapes: TERMINALE_PRO },
};

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const o = outils(graine);
  const h = HISTOIRES[niveau] ?? HISTOIRES.SECONDE;
  return h.etapes.map((etape, i) => {
    const {
      recit, question, bonne, pieges,
    } = etape(o);
    return {
      consigne: `${h.prefixe}-etape-${i + 1}`,
      recit,
      question,
      choix: o.melanger([bonne, ...Object.keys(pieges)]).map((c) => ({ cle: c, libelle: c })),
      bonne,
      pieges,
      cadenas: { avant: h.code.slice(0, i), piece: h.code[i], total: MANCHES },
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // 2de — les consignes
  '2de-etape-1': 'Premier cadenas : applique les lois de la réfraction au prisme.',
  '2de-etape-2': 'Deuxième cadenas : dis si le liquide du flacon est un corps pur ou un mélange.',
  '2de-etape-3': 'Troisième cadenas : calcule la quantité de matière de la poudre.',
  '2de-etape-4': 'Quatrième cadenas : trouve le volume de solution mère à prélever pour la dilution.',
  '2de-etape-5': 'Cinquième cadenas : trouve le réactif limitant.',
  '2de-etape-6': 'Dernier cadenas : calcule la tension aux bornes du capteur.',
  // 2de pro — les consignes
  '2pro-etape-1': 'Premier cadenas : dis ce que devient le courant quand un fil est coupé.',
  '2pro-etape-2': 'Deuxième cadenas : branche correctement l’ampèremètre.',
  '2pro-etape-3': 'Troisième cadenas : calcule la tension aux bornes de la résistance.',
  '2pro-etape-4': 'Quatrième cadenas : compte les électrons de l’ion.',
  '2pro-etape-5': 'Cinquième cadenas : dis comment réagit la sonde quand le moteur chauffe.',
  '2pro-etape-6': 'Dernier cadenas : fais le bilan des forces sur le moteur immobile.',
  // 1re — les consignes
  '1re-etape-1': 'Premier cadenas : trouve la couleur perçue de la solution.',
  '1re-etape-2': 'Deuxième cadenas : déduis la concentration de l’absorbance.',
  '1re-etape-3': 'Troisième cadenas : dis ce que subit l’espèce de la demi-équation.',
  '1re-etape-4': 'Quatrième cadenas : calcule l’avancement maximal.',
  '1re-etape-5': 'Cinquième cadenas : exploite l’équivalence du titrage.',
  '1re-etape-6': 'Dernier cadenas : applique la loi de Mariotte au gaz de l’erlenmeyer.',
  // 1re techno — les consignes
  '1tec-etape-1': 'Premier cadenas : trouve les produits de la combustion complète.',
  '1tec-etape-2': 'Deuxième cadenas : calcule la pression sur le clapet.',
  '1tec-etape-3': 'Troisième cadenas : reconnais le mode de transfert thermique.',
  '1tec-etape-4': 'Quatrième cadenas : exploite l’oscillogramme de la tension.',
  '1tec-etape-5': 'Cinquième cadenas : réponds en technicien qui connaît le risque électrique.',
  '1tec-etape-6': 'Dernier cadenas : fais le bilan d’énergie de l’alternateur.',
  // 1re pro — les consignes
  '1pro-etape-1': 'Premier cadenas : branche correctement le voltmètre.',
  '1pro-etape-2': 'Deuxième cadenas : calcule l’intensité du courant dans la lampe.',
  '1pro-etape-3': 'Troisième cadenas : convertis la capacité de la batterie.',
  '1pro-etape-4': 'Quatrième cadenas : dis comment réagit la photorésistance.',
  '1pro-etape-5': 'Cinquième cadenas : calcule la vitesse de la pelleteuse.',
  '1pro-etape-6': 'Dernier cadenas : calcule le poids du bloc de béton.',
  // terminale — les consignes
  'tle-etape-1': 'Premier cadenas : applique la troisième loi de Kepler.',
  'tle-etape-2': 'Deuxième cadenas : calcule le rendement des panneaux solaires.',
  'tle-etape-3': 'Troisième cadenas : calcule la charge stockée dans le condensateur.',
  'tle-etape-4': 'Quatrième cadenas : tiens compte de la diffraction du faisceau.',
  'tle-etape-5': 'Cinquième cadenas : choisis le bon modèle de la lumière.',
  'tle-etape-6': 'Dernier cadenas : prévois la fréquence reçue grâce à l’effet Doppler.',
  // terminale techno — les consignes
  'ttec-etape-1': 'Premier cadenas : situe la radiation dans le spectre.',
  'ttec-etape-2': 'Deuxième cadenas : distingue les ultraviolets A et B.',
  'ttec-etape-3': 'Troisième cadenas : dis le rôle de l’ozone.',
  'ttec-etape-4': 'Quatrième cadenas : déduis la concentration de l’absorbance.',
  'ttec-etape-5': 'Cinquième cadenas : explique l’usage des rayons X.',
  'ttec-etape-6': 'Dernier cadenas : applique la période radioactive du traceur.',
  // terminale pro — les consignes
  'tpro-etape-1': 'Premier cadenas : calcule la période de vibration du compresseur.',
  'tpro-etape-2': 'Deuxième cadenas : applique la loi des nœuds aux ventilateurs.',
  'tpro-etape-3': 'Troisième cadenas : calcule le poids de la cuve.',
  'tpro-etape-4': 'Quatrième cadenas : traduis la résistance de la sonde en température.',
  'tpro-etape-5': 'Cinquième cadenas : convertis la température en kelvins.',
  'tpro-etape-6': 'Dernier cadenas : prévois la température pendant le changement d’état.',

  // les erreurs — réfraction et dispersion
  'refraction-angles': 'La loi de Snell-Descartes relie les sinus des angles, pas les angles eux-mêmes : l’indice vaut le sinus de l’incidence divisé par le sinus de la réfraction.',
  'refraction-inverse': 'Le verre est plus réfringent que l’air : son indice dépasse un. Mets le sinus de l’angle d’incidence au numérateur.',
  'dispersion-rouge': 'L’indice du verre est plus grand pour les courtes longueurs d’onde : le violet est le plus dévié, le rouge le moins.',
  'dispersion-egale': 'Si toutes les couleurs étaient déviées autant, le prisme ne les séparerait pas. L’indice du verre dépend de la longueur d’onde : le violet est le plus dévié.',
  // les erreurs — espèces et solutions
  'espece-palier': 'Une température qui reste constante pendant tout le changement d’état, c’est la signature d’un corps pur ; celle d’un mélange varie.',
  'espece-limpide': 'Limpide ne veut pas dire pur : une eau salée l’est aussi. Une température qui varie pendant l’ébullition signe un mélange.',
  'espece-eau': 'Incolore ne veut pas dire de l’eau : sous la pression normale, l’eau pure bout à cent degrés, et sa température ne bouge pas pendant toute l’ébullition.',
  'mole-produit': 'La quantité de matière, c’est la masse divisée par la masse molaire : des grammes divisés par des grammes par mole donnent des moles.',
  'mole-inverse': 'La division est à l’envers : la masse va au numérateur, la masse molaire au dénominateur. Vérifie avec les unités.',
  'dilution-inverse': 'Une dilution fait baisser la concentration : on prélève moins que le volume final. Le volume à prélever, c’est le volume final divisé par le facteur de dilution.',
  'dilution-eau': 'Ce volume-là, c’est celui de l’eau à ajouter. On prélève d’abord la solution mère : le volume final divisé par le facteur de dilution.',
  'limitant-coefficients': 'Le plus petit nombre de moles ne suffit pas : divise chaque quantité par son coefficient dans l’équation, et le plus petit quotient désigne le réactif limitant.',
  'limitant-stoechio': 'Le mélange est stœchiométrique quand les quantités divisées par leurs coefficients sont égales. Ici, elles diffèrent : l’un des réactifs s’épuise en premier.',
  // les erreurs — circuits et mesures
  'ohm-milli': 'Dans la loi d’Ohm, l’intensité s’exprime en ampères : convertis d’abord les milliampères, mille milliampères font un ampère.',
  'ohm-diviser': 'La loi d’Ohm multiplie : la tension vaut la résistance fois l’intensité. En divisant, on n’obtient pas une tension.',
  'ohm-produit': 'Pour trouver l’intensité, on divise la tension par la résistance. En multipliant, on n’obtient pas des ampères.',
  'ohm-inverse': 'La division est à l’envers : l’intensité vaut la tension divisée par la résistance, pas l’inverse.',
  'serie-coupure': 'Dans un circuit en série, il n’y a qu’une seule boucle : une coupure l’ouvre, et le courant s’arrête partout, avant comme après la coupure.',
  'serie-moteur': 'Le moteur est dans la même boucle que le fil coupé : la boucle est ouverte, aucun courant ne le traverse.',
  'amperemetre-derivation': 'Un ampèremètre mesure le courant qui le traverse : il se branche en série, dans la boucle du moteur. C’est le voltmètre qui se branche en dérivation.',
  'voltmetre-serie': 'Un voltmètre mesure une différence entre deux points : il se branche en dérivation, aux bornes du dipôle. C’est l’ampèremètre qui se branche en série.',
  'appareil-remplacer': 'Un appareil de mesure ne remplace jamais le dipôle : il mesure le circuit tel qu’il fonctionne. Ampèremètre en série, voltmètre en dérivation.',
  'milli-cent': 'Milli veut dire millième : mille milliampères-heures font un ampère-heure. On divise par mille, pas par cent.',
  'milli-multiplier': 'On passe d’une petite unité à une grande : le nombre doit diminuer. Divise par mille.',
  'noeuds-meme': 'En dérivation, le courant de la branche principale se partage entre les branches : il vaut la somme des intensités des branches. C’est la loi des nœuds.',
  'noeuds-moitie': 'Le courant se partage en arrivant au nœud : chaque branche en reçoit une part. La branche principale porte donc la somme des deux, pas la moitié.',
  // les erreurs — capteurs
  'ctn-sens': 'Une thermistance CTN a un coefficient de température négatif : quand la température monte, sa résistance diminue.',
  'ldr-sens': 'Une photorésistance conduit mieux à la lumière : sa résistance baisse quand l’éclairement augmente, et monte dans le noir.',
  'capteur-fixe': 'Un capteur sert justement à traduire une grandeur physique en grandeur électrique : sa résistance varie avec ce qu’il mesure.',
  'sonde-pente': 'L’écart à cent ohms est en ohms, pas en degrés : divise-le par la hausse de résistance par degré pour obtenir la température.',
  'sonde-zero': 'À zéro degré, la sonde vaut déjà cent ohms : retire d’abord ces cent ohms, puis divise ce qui reste par la hausse par degré.',
  // les erreurs — atomes et ions
  'ion-gagne': 'Un ion positif a perdu des électrons : il en a moins que l’atome, autant de moins que l’indique sa charge. On retranche, on n’ajoute pas.',
  'ion-neutre': 'L’atome est neutre, mais l’ion porte une charge : un ion positif a perdu autant d’électrons que l’indique sa charge.',
  // les erreurs — forces et mouvement
  'repos-aucune': 'Immobile ne veut pas dire sans force : son poids l’attire vers le bas, l’établi le pousse vers le haut. Ces forces se compensent.',
  'repos-poids': 'Si seul son poids agissait, le moteur tomberait : l’établi exerce une force vers le haut qui compense le poids.',
  'poids-masse': 'La masse, en kilogrammes, n’est pas le poids : le poids est une force, en newtons, qui vaut la masse multipliée par g.',
  'poids-diviser': 'Le poids vaut la masse multipliée par g, pas divisée : un objet plus lourd a un poids plus grand.',
  'vitesse-minutes': 'Une vitesse en mètres par seconde demande une durée en secondes : convertis d’abord les minutes, une minute fait soixante secondes.',
  'vitesse-inverse': 'La vitesse, c’est la distance divisée par la durée, pas l’inverse : plus on va loin dans le même temps, plus on va vite.',
  // les erreurs — couleurs et absorbance
  'couleur-absorbee': 'Une solution absorbe une couleur et laisse passer les autres : on voit la couleur complémentaire de celle qui est absorbée, pas celle-là.',
  'couleur-noire': 'La solution n’absorbe qu’une partie de la lumière blanche : le reste passe, et donne la couleur complémentaire de celle qui est absorbée.',
  'absorbance-produit': 'L’absorbance est proportionnelle à la concentration : pour retrouver la concentration, divise l’absorbance par le coefficient, ne multiplie pas.',
  'absorbance-inverse': 'La division est à l’envers : la concentration vaut l’absorbance divisée par le coefficient de la droite d’étalonnage.',
  // les erreurs — oxydoréduction, avancement, titrage
  'oxydo-electrons': 'Perdre des électrons, c’est une oxydation ; en gagner, c’est une réduction. Regarde de quel côté de la flèche se trouvent les électrons.',
  'oxydo-protons': 'Une demi-équation qui échange des électrons relève de l’oxydoréduction. Un échange de protons, c’est une réaction acide-base.',
  'avancement-plus-petit': 'Le plus petit nombre de moles ne donne pas l’avancement maximal : divise chaque quantité par son coefficient, et prends le plus petit quotient.',
  'avancement-coefficient': 'Il faut cinq ions fer pour un ion permanganate : la quantité d’ions fer se divise par cinq avant de la comparer à celle du permanganate.',
  'dosage-coefficient': 'À l’équivalence, les réactifs ont été versés dans les proportions de l’équation : il faut cinq ions fer pour un ion permanganate. Multiplie par cinq.',
  'dosage-coefficient-inverse': 'Le coefficient est du mauvais côté : un ion permanganate réagit avec cinq ions fer, il y a donc cinq fois plus d’ions fer que de permanganate versé.',
  'mariotte-inverse': 'À température constante, la pression et le volume varient en sens contraire : un gaz comprimé voit sa pression augmenter, pas baisser.',
  'mariotte-fixe': 'Le gaz est le même, mais sa pression change : à température constante, le produit de la pression par le volume reste constant.',
  // les erreurs — combustion, pression, chaleur
  'combustion-incomplete': 'Le monoxyde de carbone, toxique, signe une combustion incomplète, quand le dioxygène manque. Une combustion complète donne du dioxyde de carbone et de l’eau.',
  'combustion-eau': 'Le combustible contient aussi de l’hydrogène : il ne disparaît pas, il forme de l’eau. Une combustion complète donne du dioxyde de carbone et de l’eau.',
  'pression-cm2': 'Une pression en pascals demande une surface en mètres carrés : un centimètre carré vaut un dix-millième de mètre carré.',
  'pression-cm2-cent': 'Un centimètre carré n’est pas un centième de mètre carré : c’est un dix-millième, car on élève un centième au carré.',
  'transfert-conduction': 'La conduction demande un contact direct : la chaleur passe de proche en proche dans la matière. Cherche s’il y a contact, mouvement d’un fluide, ou rien entre les deux.',
  'transfert-convection': 'La convection, c’est un fluide, air ou eau, qui se déplace et emporte la chaleur avec lui. Cherche s’il y a contact, mouvement d’un fluide, ou rien entre les deux.',
  'transfert-rayonnement': 'Le rayonnement transporte l’énergie sans contact et sans fluide, comme la chaleur du Soleil. Cherche s’il y a contact, mouvement d’un fluide, ou rien entre les deux.',
  // les erreurs — tension sinusoïdale et sécurité
  'secteur-efficace': 'La valeur efficace n’est pas le sommet de la courbe : pour une tension sinusoïdale, la valeur maximale vaut la valeur efficace multipliée par racine de deux.',
  'secteur-diviser': 'C’est l’inverse : le sommet de la courbe dépasse la valeur efficace. On multiplie par racine de deux, on ne divise pas.',
  'frequence-periode': 'La période et la fréquence ne sont pas la même grandeur : l’une est l’inverse de l’autre, la période s’exprimant en secondes.',
  'frequence-milli': 'Une fréquence en hertz s’obtient avec une période en secondes : convertis d’abord les millisecondes, mille millisecondes font une seconde.',
  'periode-convertir': 'La période est l’inverse de la fréquence, en secondes. Pour l’avoir en millisecondes, multiplie par mille.',
  'risque-fusible': 'Le fusible protège l’installation contre les surintensités, comme un court-circuit. Une fuite de courant par une personne est trop faible pour le faire fondre : c’est le disjoncteur différentiel qui la détecte.',
  'risque-terre-seule': 'La prise de terre offre un chemin au courant de fuite, mais elle ne coupe rien. C’est le disjoncteur différentiel qui détecte cette fuite et ouvre le circuit.',
  'risque-electrocution': 'L’électrocution, c’est une électrisation mortelle. Quand le courant traverse le corps sans tuer, on parle d’électrisation.',
  'risque-court-circuit': 'Un court-circuit relie directement les deux bornes d’une source, sans passer par un récepteur. Ici, le courant traverse le corps du technicien : c’est une électrisation.',
  // les erreurs — bilan d'énergie
  'bilan-detruite': 'L’énergie ne se détruit jamais, elle se convertit : ce qui manque au bilan électrique est parti en chaleur, dans les frottements et l’échauffement des bobinages.',
  'bilan-parfait': 'Aucun convertisseur ne rend toute l’énergie reçue : l’énergie reçue égale l’énergie utile plus l’énergie dissipée en chaleur. Fais la différence.',
  // les erreurs — orbite, panneaux, condensateur
  'kepler-proportion': 'La période n’est pas proportionnelle au rayon : c’est son carré qui est proportionnel au cube du rayon.',
  'kepler-carre': 'Le carré de la période est proportionnel au cube du rayon : la période varie comme le rayon puissance trois demis, pas comme son carré.',
  'rendement-inverse': 'Le rendement compare ce qui sort à ce qui entre : puissance électrique divisée par puissance lumineuse reçue. Il ne dépasse jamais cent pour cent.',
  'rendement-surface': 'Mille trois cent soixante watts, c’est pour un seul mètre carré : multiplie par la surface des panneaux pour obtenir la puissance lumineuse reçue.',
  'condensateur-diviser': 'La charge d’un condensateur est proportionnelle à la tension : elle vaut la capacité multipliée par la tension, pas divisée.',
  'condensateur-micro': 'La capacité est en microfarads : la charge sort donc en microcoulombs, pas en coulombs. Garde le préfixe jusqu’au bout.',
  // les erreurs — diffraction, dualité, Doppler
  'diffraction-unites': 'Avant de diviser, exprime la longueur d’onde et la largeur dans la même unité : un nanomètre vaut un milliardième de mètre, un millimètre un millième.',
  'diffraction-inverse': 'L’écart angulaire vaut la longueur d’onde divisée par la largeur de la fente, pas l’inverse : plus la fente est étroite, plus la lumière s’étale.',
  'diffraction-etroite': 'Plus la fente est étroite, plus la diffraction étale le faisceau : l’écart angulaire vaut la longueur d’onde divisée par la largeur.',
  'diffraction-sans-effet': 'La largeur compte : l’écart angulaire vaut la longueur d’onde divisée par la largeur de l’ouverture. Une ouverture plus large étale moins la lumière.',
  'dualite-onde': 'Des impacts un par un, des électrons arrachés au-delà d’un seuil de fréquence : cela s’explique par des photons, avec le modèle particulaire.',
  'dualite-particule': 'Diffraction et interférences sont des phénomènes d’onde : on les décrit avec le modèle ondulatoire.',
  'doppler-sens': 'Quand la source s’éloigne, les ondes reçues s’étirent et la fréquence baisse ; quand elle se rapproche, la fréquence monte.',
  'doppler-intensite': 'Dès que la source et le récepteur se rapprochent ou s’éloignent, la fréquence reçue change : c’est l’effet Doppler, pas une simple affaire d’intensité.',
  // les erreurs — le spectre invisible
  'domaine-x': 'Les rayons X ont des longueurs d’onde bien plus courtes, de l’ordre du nanomètre ou moins. Repère : le visible va d’environ quatre cents à huit cents nanomètres.',
  'domaine-uv': 'Les ultraviolets se situent juste sous le violet, entre une dizaine et quatre cents nanomètres. Repère : le visible va d’environ quatre cents à huit cents nanomètres.',
  'domaine-visible': 'Notre œil ne voit qu’entre environ quatre cents et huit cents nanomètres. Compare la longueur d’onde à ces deux bornes.',
  'domaine-ir': 'Les infrarouges commencent au-delà du rouge, vers huit cents nanomètres. Repère : le visible va d’environ quatre cents à huit cents nanomètres.',
  'solaire-uva': 'L’indice de protection mesure surtout l’efficacité contre les UVB, responsables des coups de soleil. La protection contre les UVA s’indique à part, par un logo.',
  'solaire-ir': 'Les infrarouges chauffent la peau, mais ne causent pas les coups de soleil. L’indice de protection vise les ultraviolets, d’abord les UVB.',
  'uv-energie': 'Les UVB ont une longueur d’onde plus courte que les UVA ; plus la longueur d’onde est courte, plus le rayonnement transporte d’énergie.',
  'uv-identiques': 'Les UVA et les UVB n’occupent pas la même bande : les UVB, plus courts, sont plus énergétiques et brûlent la peau.',
  'ozone-oxygene': 'Le dioxygène de l’air vient de la photosynthèse. L’ozone de la haute atmosphère, lui, absorbe une grande partie des ultraviolets du Soleil.',
  'ozone-polluant': 'Là-haut, l’ozone nous protège en absorbant les ultraviolets. Il n’est nocif qu’au niveau du sol, où on le respire.',
  'ozone-protecteur': 'Au sol, l’ozone est trop peu abondant pour filtrer les ultraviolets, et on le respire : c’est un polluant irritant. Il ne protège que dans la haute atmosphère.',
  'ozone-inoffensif': 'L’ozone est un gaz oxydant : respiré lors des pics de pollution, il irrite les bronches et les yeux.',
  'radio-emission': 'Les os n’émettent rien : ils arrêtent davantage les rayons X que les tissus mous. Derrière eux, le détecteur reçoit moins de rayons, et l’image reste claire.',
  'radio-traverse': 'C’est l’inverse : les rayons X traversent facilement les tissus mous, mais les os, plus denses, les absorbent davantage.',
  'radio-diagnostic': 'La radiographie sert au diagnostic : une faible dose de rayons X fait une image. La radiothérapie, elle, concentre de fortes doses pour détruire des cellules cancéreuses.',
  'radio-les-deux': 'Seule la radiothérapie cherche à détruire des cellules, avec de fortes doses ciblées. La radiographie se contente d’une faible dose pour faire une image.',
  'demi-vie-tout': 'Chaque demi-vie divise par deux ce qui reste, pas ce qu’il y avait au départ : il reste toujours une fraction des noyaux.',
  'demi-vie-puissance': 'Chaque demi-vie divise par deux ce qui reste : après trois demi-vies, il reste un huitième, pas un sixième. On divise par deux autant de fois qu’il y a de demi-vies.',
  // les erreurs — températures
  'kelvin-signe': 'Une température en kelvins n’est jamais négative : le zéro absolu vaut zéro kelvin. On ajoute deux cent soixante-treize virgule quinze, on ne retranche pas.',
  'kelvin-meme': 'Le kelvin et le degré Celsius ont le même écart entre deux graduations, mais pas le même zéro : ajoute deux cent soixante-treize virgule quinze.',
  'palier-monte': 'Pendant le changement d’état d’un corps pur, toute l’énergie reçue sert à changer d’état : la température reste constante, c’est le palier.',
  'palier-autre': 'Chaque changement d’état a sa propre température : sous pression normale, l’eau pure fond à zéro degré et bout à cent degrés.',
};
