/**
 * L'ESCAPE GAME DE SVT DU LYCÉE — Inès, de la 2de à la terminale, dans les
 * trois voies. Une histoire par classe, celle que raconte son illustration
 * (`src/assets/Jeux/<classe>/SVT/<titre>.png`), et six cadenas dans l'ordre du
 * récit ; seuls les choix sont mélangés, et certaines étapes tirent une
 * variante ou des nombres (calculés ici).
 *
 * LES CLASSES SANS SVT : la SVT n'est enseignée ni en voie technologique ni
 * en voie professionnelle. Leur escape game est un jeu de culture
 * scientifique, bâti sur les notions de la 2de commune (codes SV_2DE_) :
 * contextes concrets (bassin d'élevage, serre, potager, sol), phrases courtes.
 *
 * 2de — L'ÉNIGME DE LA MARE (code ROSEAU)
 *   1. les trois échelles de la biodiversité (SV_2DE_VIV_BIODIVERSITE) ;
 *   2. membrane, cytoplasme, ADN : ce que toute cellule possède (SV_2DE_VIV_CELLULE) ;
 *   3. complémentarité des bases : %G = (100 − 2 × %A) ÷ 2 (SV_2DE_VIV_ADN) ;
 *   4. l'élodée : dioxygène à la lumière, dioxyde de carbone dans le noir (SV_2DE_VIV_METABOLISME) ;
 *   5. producteurs et consommateurs de la mare (SV_2DE_VIV_ECOSYSTEME) ;
 *   6. paludisme et dengue : agent, vecteur, prévention (SV_2DE_CORPS_PATHOGENES).
 *
 * 2de pro — LE JARDIN SOUS SURVEILLANCE (code TOMATE)
 *   1. les échelles de la biodiversité (SV_2DE_VIV_BIODIVERSITE) ;
 *   2. photosynthèse et respiration (SV_2DE_VIV_METABOLISME) ;
 *   3. pourquoi l'engrais : les récoltes exportent les sels minéraux (SV_2DE_VIV_AGROSYSTEME) ;
 *   4. un témoin qui ne diffère que d'un facteur (SV_2DE_METH_DEMARCHE) ;
 *   5. une moyenne (SV_2DE_METH_STATISTIQUE) ;
 *   6. le moustique tigre et l'eau stagnante (SV_2DE_CORPS_PATHOGENES).
 *
 * 1re — LE SECRET DES CELLULES (code GENOME)
 *   1. l'enzyme : catalyseur spécifique, protéine dénaturable (SV_1RE_VIV_ENZYMES) ;
 *   2. trois nucléotides par acide aminé (SV_1RE_GEN_EXPRESSION) ;
 *   3. mutation silencieuse, faux-sens, non-sens (SV_1RE_GEN_MUTATIONS) ;
 *   4. les trois échelles du phénotype, la drépanocytose (SV_1RE_GEN_PHENOTYPE) ;
 *   5. mutations et cancer (SV_1RE_SANTE_MUTATION) ;
 *   6. mitose et réplication semi-conservative (SV_1RE_GEN_MITOSE).
 *
 * 1re techno — L'ALERTE DU BASSIN VIVANT (code BASSIN)
 *   1. l'eutrophisation : les algues prolifèrent (SV_2DE_VIV_ECOSYSTEME) ;
 *   2. les décomposeurs respirent et consomment le dioxygène (SV_2DE_VIV_METABOLISME) ;
 *   3. une moyenne (SV_2DE_METH_STATISTIQUE) ;
 *   4. cellule végétale : paroi et chloroplastes (SV_2DE_VIV_CELLULE) ;
 *   5. agrosystème et écosystème naturel (SV_2DE_VIV_AGROSYSTEME) ;
 *   6. les échelles de la biodiversité (SV_2DE_VIV_BIODIVERSITE).
 *
 * 1re pro — LA TRACE DANS LA SERRE (code RACINE)
 *   1. l'engrais en trop dans la rivière (SV_2DE_VIV_ECOSYSTEME) ;
 *   2. un témoin qui ne diffère que d'un facteur (SV_2DE_METH_DEMARCHE) ;
 *   3. les racines puisent l'eau et les sels minéraux (SV_2DE_VIV_METABOLISME) ;
 *   4. pas de chloroplastes dans la racine (SV_2DE_VIV_CELLULE) ;
 *   5. une moyenne (SV_2DE_METH_STATISTIQUE) ;
 *   6. les bourdons pollinisent la serre (SV_2DE_VIV_AGROSYSTEME).
 *
 * Terminale — LA FAILLE DES ORIGINES (code FAILLE)
 *   1. superposition et recoupement (SV_TLE_TERRE_ARCHIVES) ;
 *   2. le rift : un continent qui s'étire (SV_TLE_TERRE_OPHIOLITES) ;
 *   3. les cyanobactéries et le dioxygène de l'atmosphère (SV_TLE_TERRE_ATMOSPHERE) ;
 *   4. Hardy-Weinberg : q = √(part des homozygotes récessifs) (SV_TLE_GEN_POPULATION) ;
 *   5. la dérive génétique (SV_TLE_GEN_DERIVE) ;
 *   6. l'espèce : l'interfécondité (SV_TLE_GEN_ESPECE).
 *
 * Terminale techno — LE VIVANT EN ÉQUILIBRE (code VIVANT)
 *   1. photosynthèse et respiration (SV_2DE_VIV_METABOLISME) ;
 *   2. les nitrates bouclent le cycle de la matière (SV_2DE_VIV_ECOSYSTEME) ;
 *   3. la sédimentation (SV_2DE_TERRE_EROSION) ;
 *   4. les échelles de la biodiversité (SV_2DE_VIV_BIODIVERSITE) ;
 *   5. débit cardiaque = FC × VES (SV_2DE_CORPS_EFFORT) ;
 *   6. le microbiote (SV_2DE_CORPS_MICROBIOTE).
 *
 * Terminale pro — LE SECRET DU SOL (code ARGILE)
 *   1. le sol, une ressource lente à se refaire (SV_2DE_TERRE_RESSOURCES) ;
 *   2. les racines retiennent le sol (SV_2DE_TERRE_EROSION) ;
 *   3. les décomposeurs de l'humus (SV_2DE_VIV_ECOSYSTEME) ;
 *   4. la bactérie n'a pas de noyau (SV_2DE_VIV_CELLULE) ;
 *   5. le pourcentage d'eau d'un échantillon (SV_2DE_METH_STATISTIQUE) ;
 *   6. le compost entretient le sol (SV_2DE_VIV_AGROSYSTEME).
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-svt-lycee', titre: 'Escape game de SVT', matiereCode: 'SVT' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'L’énigme de la mare',
    accroche: 'Six énigmes au bord de la mare.',
    intro: 'Au bord d’une mare protégée, l’observatoire des naturalistes est fermé : leur épuisette, leur loupe et leurs bocaux sont restés sur le ponton. Six cadenas gardent la clé de l’observatoire : chacun pose une énigme sur le vivant de la mare.',
    fin: 'Le code ROSEAU ouvre l’observatoire : l’énigme de la mare est résolue.',
    competences: [
      'SV_2DE_VIV_BIODIVERSITE',
      'SV_2DE_VIV_CELLULE',
      'SV_2DE_VIV_ADN',
      'SV_2DE_VIV_METABOLISME',
      'SV_2DE_VIV_ECOSYSTEME',
      'SV_2DE_CORPS_PATHOGENES',
    ],
  },
  SECONDE_PRO: {
    titre: 'Le jardin sous surveillance',
    accroche: 'Un potager sur le toit, un bac qui fane.',
    intro: 'Sur le toit d’un immeuble, le potager partagé est sous surveillance : station météo, cuve d’eau de pluie, flacons d’analyse. Un bac fane et la récolte est menacée : ouvre les six cadenas du jardin pour comprendre.',
    fin: 'Le code TOMATE ouvre le local du jardin : le potager est sauvé.',
    competences: [
      'SV_2DE_VIV_BIODIVERSITE',
      'SV_2DE_VIV_METABOLISME',
      'SV_2DE_VIV_AGROSYSTEME',
      'SV_2DE_METH_DEMARCHE',
      'SV_2DE_METH_STATISTIQUE',
      'SV_2DE_CORPS_PATHOGENES',
    ],
  },
  PREMIERE: {
    titre: 'Le secret des cellules',
    accroche: 'Voyage au cœur d’une cellule, six cadenas.',
    intro: 'Te voilà à l’échelle d’une molécule, au cœur d’une cellule : mitochondries, réticulum, vésicules qui glissent le long du cytosquelette, et au loin le noyau qui brille. Six cadenas te séparent de son secret : ouvre-les en biologiste.',
    fin: 'Le code GENOME révèle le secret des cellules : chacune garde et transmet le même génome.',
    competences: [
      'SV_1RE_VIV_ENZYMES',
      'SV_1RE_GEN_EXPRESSION',
      'SV_1RE_GEN_MUTATIONS',
      'SV_1RE_GEN_PHENOTYPE',
      'SV_1RE_SANTE_MUTATION',
      'SV_1RE_GEN_MITOSE',
    ],
  },
  PREMIERE_TECHNO: {
    titre: 'L’alerte du bassin vivant',
    accroche: 'Une eau brune envahit le bassin.',
    intro: 'Dans une station d’élevage au bord d’un lac, les bassins vivants abritent poissons et plantes aquatiques. L’alarme vient de sonner : une eau brune envahit le canal. Ouvre les six cadenas pour comprendre l’alerte et sauver le bassin.',
    fin: 'Le code BASSIN coupe l’alarme : le bassin vivant respire de nouveau.',
    competences: [
      'SV_2DE_VIV_ECOSYSTEME',
      'SV_2DE_VIV_METABOLISME',
      'SV_2DE_METH_STATISTIQUE',
      'SV_2DE_VIV_CELLULE',
      'SV_2DE_VIV_AGROSYSTEME',
      'SV_2DE_VIV_BIODIVERSITE',
    ],
  },
  PREMIERE_PRO: {
    titre: 'La trace dans la serre',
    accroche: 'Une trace dans la rigole : remonte-la.',
    intro: 'Dans une grande serre de production, une trace colorée court le long de la rigole, et des plants jaunissent sur leurs tablettes. Remonte la trace : six cadenas, six questions sur la vie des plantes.',
    fin: 'Le code RACINE ferme la vanne : la serre retrouve son équilibre.',
    competences: [
      'SV_2DE_VIV_ECOSYSTEME',
      'SV_2DE_METH_DEMARCHE',
      'SV_2DE_VIV_METABOLISME',
      'SV_2DE_VIV_CELLULE',
      'SV_2DE_METH_STATISTIQUE',
      'SV_2DE_VIV_AGROSYSTEME',
    ],
  },
  TERMINALE: {
    titre: 'La faille des origines',
    accroche: 'Une vallée s’ouvre, des espèces naissent.',
    intro: 'Au bord d’un immense canyon, une station de géologues domine une vallée qui s’ouvre, où fument encore des volcans. Les carottes de roche, l’ambre et les carnets racontent l’origine des paysages et des espèces : six cadenas en gardent le secret.',
    fin: 'Le code FAILLE ouvre le dernier carnet : la faille des origines a livré son histoire.',
    competences: [
      'SV_TLE_TERRE_ARCHIVES',
      'SV_TLE_TERRE_OPHIOLITES',
      'SV_TLE_TERRE_ATMOSPHERE',
      'SV_TLE_GEN_POPULATION',
      'SV_TLE_GEN_DERIVE',
      'SV_TLE_GEN_ESPECE',
    ],
  },
  TERMINALE_TECHNO: {
    titre: 'Le vivant en équilibre',
    accroche: 'Sous le dôme, un équilibre fragile.',
    intro: 'Sous un immense dôme de verre, un écosystème tient en équilibre : murs végétaux, bassins, colonne de filtration et mangrove. Six cadenas protègent la salle de contrôle : chacun interroge cet équilibre du vivant.',
    fin: 'Le code VIVANT ouvre la salle de contrôle : l’équilibre du dôme est assuré.',
    competences: [
      'SV_2DE_VIV_METABOLISME',
      'SV_2DE_VIV_ECOSYSTEME',
      'SV_2DE_TERRE_EROSION',
      'SV_2DE_VIV_BIODIVERSITE',
      'SV_2DE_CORPS_EFFORT',
      'SV_2DE_CORPS_MICROBIOTE',
    ],
  },
  TERMINALE_PRO: {
    titre: 'Le secret du sol',
    accroche: 'Couche après couche, perce le sol.',
    intro: 'Sous l’abri de la station agricole, des colonnes de terre attendent l’analyse ; à côté, une tranchée ouvre le sol jusqu’à la roche, et un filet d’eau ruisselle sur le talus. Six cadenas gardent le secret du sol : perce-le, couche après couche.',
    fin: 'Le code ARGILE ouvre le dernier coffre : le secret du sol est percé.',
    competences: [
      'SV_2DE_TERRE_RESSOURCES',
      'SV_2DE_TERRE_EROSION',
      'SV_2DE_VIV_ECOSYSTEME',
      'SV_2DE_VIV_CELLULE',
      'SV_2DE_METH_STATISTIQUE',
      'SV_2DE_VIV_AGROSYSTEME',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Un nombre écrit à la française : virgule décimale, espace entre les milliers. */
export function nombre(x) {
  const r = Math.round(x * 1000) / 1000;
  const [ent, dec] = String(r).split('.');
  const e = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec ? `${e},${dec}` : e;
}

// ---------------------------------------------------------------- outils partagés

const ECHELLES = { genetique: 'Diversité génétique', especes: 'Diversité des espèces', ecosystemes: 'Diversité des écosystèmes' };

/** Une observation → sa bonne échelle, les deux autres en pièges. */
const echelle = (o) => {
  const pieges = {};
  Object.keys(ECHELLES).filter((k) => k !== o.bonne).forEach((k) => { pieges[ECHELLES[k]] = `biodiv-${k}`; });
  return { question: `${o.texte} À quelle échelle de la biodiversité ?`, bonne: ECHELLES[o.bonne], pieges };
};

/**
 * Cinq mesures autour d'une moyenne `m`, écarts symétriques mélangés : la
 * moyenne tombe juste, la somme et l'étendue sont les pièges.
 */
const cinqMesures = ({ au, melanger }, moyennes, ecarts) => {
  const m = au(moyennes);
  const valeurs = melanger(au(ecarts)).map((d) => Math.round((m + d) * 10) / 10);
  const etendue = Math.max(...valeurs) - Math.min(...valeurs);
  return {
    liste: valeurs.map(nombre).join(' ; '),
    m,
    somme: valeurs.reduce((s, v) => s + v, 0),
    etendue,
  };
};

const NOIR = {
  question: 'Plante verte placée dans l’obscurité. Quel gaz sa feuille rejette-t-elle ?',
  bonne: 'Du dioxyde de carbone',
  pieges: { 'Du dioxygène': 'metabo-lumiere', 'Aucun gaz': 'metabo-respiration' },
};

const PATHOGENES = [
  {
    question: 'Le paludisme se transmet par la piqûre d’un moustique. Quel est l’agent pathogène ?',
    bonne: 'Un parasite unicellulaire',
    pieges: { 'Le moustique lui-même': 'vecteur-agent', 'Un virus': 'paludisme-virus' },
  },
  {
    question: 'La dengue est due à un virus transmis par la piqûre d’un moustique. Quelle mesure freine l’épidémie ?',
    bonne: 'Supprimer les eaux stagnantes',
    pieges: { 'Prendre des antibiotiques': 'virus-antibiotique', 'Ne plus toucher les malades': 'dengue-contact' },
  },
];

// ---------------------------------------------------------------- 2de

const OBS_MARE = [
  { texte: 'Au bord de la mare, des escargots de la même espèce portent des coquilles de couleurs différentes, dues à des allèles différents.', bonne: 'genetique' },
  { texte: 'D’un seul coup d’épuisette, les naturalistes recensent une trentaine d’espèces d’insectes aquatiques.', bonne: 'especes' },
  { texte: 'De la mare à la roselière, puis à la prairie humide et au bois, les milieux se succèdent.', bonne: 'ecosystemes' },
];

/** La chaîne de la mare : algues microscopiques → daphnies → épinoches → héron. */
const MAILLONS = [
  { qui: 'les algues microscopiques', role: 'producteur' },
  { qui: 'les daphnies', role: 'primaire' },
  { qui: 'les épinoches', role: 'secondaire' },
];
const ROLES = { producteur: 'Des producteurs', primaire: 'Des consommateurs primaires', secondaire: 'Des consommateurs secondaires' };

const SECONDE = [
  ({ au }) => ({
    recit: 'Premier cadenas, sur la porte de l’observatoire : les notes de terrain des naturalistes, à classer.',
    ...echelle(au(OBS_MARE)),
  }),
  () => ({
    recit: 'Sous la loupe, puis au microscope, une goutte d’eau de la mare : une bactérie nage près d’une cellule de feuille d’élodée.',
    question: 'Qu’a la bactérie en commun avec la cellule de feuille d’élodée ?',
    bonne: 'Membrane, cytoplasme et ADN',
    pieges: { 'Un noyau': 'cellule-noyau', 'Des chloroplastes': 'cellule-chloroplaste' },
  }),
  ({ entre }) => {
    let a = entre(15, 34);
    if (a === 25) a = 35;
    return {
      recit: 'Le séquenceur portable des naturalistes a lu l’ADN de cette bactérie, mais l’écran n’affiche plus qu’une ligne.',
      question: `ADN de la bactérie : ${a} % d’adénine (A). Pourcentage de guanine (G) ?`,
      bonne: `${50 - a} %`,
      pieges: { [`${a} %`]: 'adn-paires', [`${100 - a} %`]: 'adn-complement' },
    };
  },
  ({ au }) => (au([true, false])
    ? { recit: 'Sur le ponton, un bocal est resté sous un linge opaque toute la nuit, une branche d’élodée à l’intérieur.', ...NOIR }
    : {
      recit: 'Dans un autre bocal, en plein soleil, de fines bulles montent le long d’une branche d’élodée.',
      question: 'Élodée bien éclairée : de quoi sont surtout faites les bulles qui montent de ses feuilles ?',
      bonne: 'Du dioxygène',
      pieges: { 'Du dioxyde de carbone': 'metabo-bulles', 'De la vapeur d’eau': 'metabo-vapeur' },
    }),
  ({ au }) => {
    const m = au(MAILLONS);
    const pieges = {};
    Object.keys(ROLES).filter((k) => k !== m.role).forEach((k) => { pieges[ROLES[k]] = `chaine-${k}`; });
    return {
      recit: 'Dans le bac blanc, l’épuisette a ramené des algues, des daphnies et une épinoche. Un héron guette depuis les roseaux.',
      question: `Dans la mare : algues microscopiques → daphnies → épinoches → héron. Que sont ${m.qui} ?`,
      bonne: ROLES[m.role],
      pieges,
    };
  },
  ({ au }) => ({
    recit: 'Au crépuscule, des moustiques s’élèvent des eaux calmes. Sur le mur de l’observatoire, une affiche de prévention est à moitié effacée.',
    ...au(PATHOGENES),
  }),
];

// ---------------------------------------------------------------- 2de pro

const OBS_JARDIN = [
  { texte: 'Sur le toit poussent des tomates cerises, cœur-de-bœuf et noires : une seule espèce, mais des allèles différents.', bonne: 'genetique' },
  { texte: 'Abeilles, bourdons, syrphes et papillons : une dizaine d’espèces viennent butiner le potager.', bonne: 'especes' },
  { texte: 'Du toit-jardin à la rivière, puis au bois de la colline, les milieux se succèdent.', bonne: 'ecosystemes' },
];

const SECONDE_PRO = [
  ({ au }) => ({
    recit: 'Premier relevé du carnet de surveillance : ce qui vit sur le toit.',
    ...echelle(au(OBS_JARDIN)),
  }),
  ({ au }) => (au([true, false])
    ? { recit: 'La nuit, les capteurs de gaz posés dans les bacs continuent d’enregistrer.', ...NOIR }
    : {
      recit: 'En plein midi, le capteur de gaz posé sur le bac de salades enregistre.',
      question: 'Feuilles de salade en plein soleil : quel gaz leur photosynthèse rejette-t-elle ?',
      bonne: 'Du dioxygène',
      pieges: { 'Du dioxyde de carbone': 'photo-produit', 'Aucun gaz': 'photo-aucun' },
    }),
  () => ({
    recit: 'Sur l’étagère du local, des sacs d’engrais. Le jardinier en ajoute à chaque saison.',
    question: 'Pourquoi apporte-t-on de l’engrais aux bacs du potager ?',
    bonne: 'Les récoltes emportent les sels minéraux',
    pieges: { 'Les plantes mangent la terre': 'engrais-terre', 'L’engrais remplace l’eau d’arrosage': 'engrais-eau' },
  }),
  () => ({
    recit: 'Dans le dernier bac, les tomates fanent : le goutte-à-goutte semble bouché. Encore faut-il le prouver.',
    question: 'Pour prouver que ces plants fanent par manque d’eau, à quoi les comparer ?',
    bonne: 'Des plants pareils, bien arrosés',
    pieges: { 'Des salades arrosées, à l’ombre': 'temoin-plusieurs', 'Les mêmes plants, une semaine plus tard': 'temoin-temps' },
  }),
  (o) => {
    const r = cinqMesures(o, [1.8, 2, 2.2, 2.4, 2.5], [[-0.3, -0.1, 0, 0.1, 0.3], [-0.4, -0.2, 0, 0.2, 0.4], [-0.2, -0.1, 0, 0.1, 0.2]]);
    return {
      recit: 'Sur la balance du local, la récolte des plants en bonne santé. Combien chaque plant donne-t-il ?',
      question: `Récolte de cinq plants de tomates (kg) : ${r.liste}. Masse moyenne par plant ?`,
      bonne: `${nombre(r.m)} kg`,
      pieges: { [`${nombre(r.somme)} kg`]: 'moyenne-somme', [`${nombre(r.etendue)} kg`]: 'moyenne-etendue' },
    };
  },
  () => ({
    recit: 'Dernier cadenas : la cuve d’eau de pluie est restée ouverte, et des larves de moustique tigre y nagent.',
    question: 'Le moustique tigre peut transmettre la dengue, due à un virus. Sur le toit, comment freiner sa prolifération ?',
    bonne: 'Couvrir la cuve d’eau de pluie',
    pieges: { 'Prendre des antibiotiques': 'virus-antibiotique', 'Ne plus toucher les malades': 'dengue-contact' },
  }),
];

// ---------------------------------------------------------------- 1re

const ENZYMES = [
  {
    question: 'L’amylase hydrolyse l’amidon, mais pas la cellulose, faite elle aussi de glucose. Pourquoi ?',
    bonne: 'Son site actif est spécifique',
    pieges: { 'Elle s’est épuisée sur l’amidon': 'enzyme-consommee', 'Il en faudrait davantage': 'enzyme-quantite' },
  },
  {
    question: 'Chauffée à 90 °C puis refroidie, une enzyme humaine ne catalyse plus rien. Pourquoi ?',
    bonne: 'Elle a été dénaturée',
    pieges: { 'Elle a été tuée': 'enzyme-vivante', 'Elle s’est épuisée': 'enzyme-consommee' },
  },
];

/** Code génétique vérifié : GAA, GAG → acide glutamique ; GUG → valine ; CAG → glutamine ; UAG → stop. */
const MUTATIONS = [
  {
    question: 'Codon de l’ARNm GAA changé en GAG (GAA et GAG : acide glutamique). Effet sur la protéine ?',
    bonne: 'Aucun changement',
    pieges: { 'Un acide aminé changé': 'mutation-redondance', 'Une protéine raccourcie': 'mutation-stop' },
  },
  {
    question: 'Codon de l’ARNm GAG changé en GUG (GAG : acide glutamique ; GUG : valine). Effet sur la protéine ?',
    bonne: 'Un acide aminé changé',
    pieges: { 'Aucun changement': 'mutation-codon', 'Une protéine raccourcie': 'mutation-stop' },
  },
  {
    question: 'Codon de l’ARNm CAG changé en UAG (CAG : glutamine ; UAG : codon stop). Effet sur la protéine ?',
    bonne: 'Une protéine raccourcie',
    pieges: { 'Aucun changement': 'mutation-codon', 'Un acide aminé changé': 'mutation-non-sens' },
  },
];

const PHENOTYPES = [
  { texte: 'Les molécules d’hémoglobine s’assemblent en longues fibres.', echelle: 'moleculaire' },
  { texte: 'Les globules rouges se déforment en faucille.', echelle: 'cellulaire' },
  { texte: 'La personne est vite essoufflée et fatiguée à l’effort.', echelle: 'macroscopique' },
];
const NIVEAUX_PHENOTYPE = { moleculaire: 'Moléculaire', cellulaire: 'Cellulaire', macroscopique: 'Macroscopique' };

const CANCERS = [
  {
    question: 'Les UV du soleil augmentent le risque de cancer de la peau. Pourquoi ?',
    bonne: 'Ils provoquent des mutations de l’ADN',
    pieges: { 'Ils transmettent un virus': 'cancer-virus', 'Ils brûlent la peau sans toucher l’ADN': 'cancer-brulure' },
  },
  {
    question: 'En général, une seule mutation suffit-elle à rendre une cellule cancéreuse ?',
    bonne: 'Non : il en faut plusieurs, accumulées',
    pieges: { 'Oui, une seule suffit toujours': 'cancer-une-seule', 'Un cancer ne vient jamais de mutations': 'cancer-sans-mutation' },
  },
];

const MITOSES = [
  {
    question: 'Une cellule humaine a 46 chromosomes. Après une mitose, chaque cellule fille en a… ?',
    bonne: '46',
    pieges: { 23: 'mitose-moitie', 92: 'mitose-double' },
  },
  {
    question: 'Avant la mitose, l’ADN se réplique. Chaque nouvelle molécule d’ADN contient… ?',
    bonne: 'Un brin ancien et un brin nouveau',
    pieges: { 'Deux brins nouveaux': 'replication-conservative', 'Des morceaux anciens et nouveaux mêlés': 'replication-dispersive' },
  },
];

const PREMIERE = [
  ({ au }) => ({
    recit: 'Le long des rails du cytosquelette glissent des vésicules dorées, chargées d’enzymes. Avant d’aller plus loin, comprends comment elles travaillent.',
    ...au(ENZYMES),
  }),
  ({ entre }) => {
    const aa = entre(20, 60) * 6;
    return {
      recit: 'Sur le réticulum, des ribosomes enfilent des acides aminés : une protéine se construit sous tes yeux, lue sur un ARN messager.',
      question: `L’ARNm d’une enzyme est traduit en une chaîne de ${aa} acides aminés. Nucléotides traduits, codon stop non compté ?`,
      bonne: nombre(3 * aa),
      pieges: { [nombre(aa)]: 'codon-un', [nombre(aa / 3)]: 'codon-diviser' },
    };
  },
  ({ au }) => ({
    recit: 'Te voici aux portes du noyau. Dans un gène, un seul nucléotide a changé : une mutation. Que devient la protéine ?',
    ...au(MUTATIONS),
  }),
  ({ au }) => {
    const p = au(PHENOTYPES);
    const pieges = {};
    Object.keys(NIVEAUX_PHENOTYPE).filter((k) => k !== p.echelle).forEach((k) => { pieges[NIVEAUX_PHENOTYPE[k]] = `phenotype-${k}`; });
    return {
      recit: 'Une mutation du gène de l’hémoglobine cause la drépanocytose. Ses effets se lisent à plusieurs échelles, de la molécule à la personne.',
      question: `Drépanocytose : « ${p.texte} » À quelle échelle du phénotype ?`,
      bonne: NIVEAUX_PHENOTYPE[p.echelle],
      pieges,
    };
  },
  ({ au }) => ({
    recit: 'Dans une cellule voisine, la division ne s’arrête plus : son ADN a accumulé des mutations.',
    ...au(CANCERS),
  }),
  ({ au }) => ({
    recit: 'Dernier cadenas, au cœur du noyau : la cellule s’apprête à se diviser. Voici son secret, celui de toutes les cellules.',
    ...au(MITOSES),
  }),
];

// ---------------------------------------------------------------- 1re techno

const OBS_BASSIN = [
  { texte: 'Dans l’aquarium, des poissons de la même espèce ont des écailles de teintes différentes, dues à des allèles différents.', bonne: 'genetique' },
  { texte: 'Après l’alerte, l’équipe recense une vingtaine d’espèces de plantes aquatiques dans les bassins.', bonne: 'especes' },
  { texte: 'Du bassin au lac, puis à la forêt de la colline, les milieux se succèdent.', bonne: 'ecosystemes' },
];

const PREMIERE_TECHNO = [
  () => ({
    recit: 'Le rejet brun qui envahit le canal est chargé de nitrates et de phosphates. Que va-t-il déclencher ?',
    question: 'Nitrates et phosphates en excès arrivent dans le canal. Que se passe-t-il d’abord ?',
    bonne: 'Les algues prolifèrent',
    pieges: { 'Les poissons grossissent plus vite': 'eutro-poissons', 'Rien : ce sont des sels naturels': 'eutro-naturel' },
  }),
  () => ({
    recit: 'Les algues en excès meurent et tombent au fond ; des bactéries s’en nourrissent. Et les poissons viennent respirer en surface.',
    question: 'En décomposant les algues mortes, les bactéries respirent. Dans l’eau, elles… ?',
    bonne: 'Consomment le dioxygène',
    pieges: { 'Produisent du dioxygène': 'respiration-produit', 'N’échangent aucun gaz': 'respiration-aucun' },
  }),
  (o) => {
    const r = cinqMesures(o, [3, 3.5, 4, 4.5], [[-1, -0.5, 0, 0.5, 1], [-0.8, -0.4, 0, 0.4, 0.8], [-0.6, -0.2, 0, 0.2, 0.6]]);
    return {
      recit: 'Les sondes du canal mesurent le dioxygène dissous. Il faut une valeur pour le rapport d’alerte.',
      question: `Dioxygène dissous relevé par cinq sondes (mg/L) : ${r.liste}. Moyenne ?`,
      bonne: `${nombre(r.m)} mg/L`,
      pieges: { [`${nombre(r.somme)} mg/L`]: 'moyenne-somme', [`${nombre(r.etendue)} mg/L`]: 'moyenne-etendue' },
    };
  },
  () => ({
    recit: 'Pour épurer l’eau, l’équipe compte sur les lentilles d’eau des bassins plantés. Au microscope, une de leurs cellules, à côté d’une cellule de poisson.',
    question: 'Qu’a la cellule de lentille d’eau que n’a pas la cellule de poisson ?',
    bonne: 'Une paroi et des chloroplastes',
    pieges: { 'Un noyau': 'cellule-noyau-commun', 'De l’ADN': 'cellule-adn-commun' },
  }),
  () => ({
    recit: 'Le rapport d’alerte doit expliquer pourquoi ce bassin d’élevage réagit autrement qu’un lac.',
    question: 'Le bassin d’élevage de poissons est un agrosystème. Qu’est-ce qui le distingue d’un lac naturel ?',
    bonne: 'L’humain y apporte la nourriture et récolte les poissons',
    pieges: { 'Aucun être vivant n’y décompose la matière': 'agro-decomposeurs', 'Il fonctionne sans lumière': 'agro-lumiere' },
  }),
  ({ au }) => ({
    recit: 'L’eau redevient claire. Dernier cadenas : faire l’inventaire du vivant revenu dans les bassins.',
    ...echelle(au(OBS_BASSIN)),
  }),
];

// ---------------------------------------------------------------- 1re pro

const PREMIERE_PRO = [
  () => ({
    recit: 'Dans la rigole, une trace colorée : l’eau d’arrosage emporte l’engrais en trop vers la rivière.',
    question: 'L’engrais en trop rejoint la rivière. Quel risque ?',
    bonne: 'Les algues prolifèrent',
    pieges: { 'Les poissons grossissent plus vite': 'eutro-poissons', 'Aucun : c’est naturel': 'eutro-naturel' },
  }),
  () => ({
    recit: 'Sur une tablette, des plants jaunissent. Trop d’engrais ? Il faut le prouver.',
    question: 'Pour prouver que ces plants jaunissent à cause de l’engrais, à quoi les comparer ?',
    bonne: 'Des plants pareils, sans excès d’engrais',
    pieges: { 'D’autres plantes, au soleil': 'temoin-plusieurs', 'Les mêmes plants, plus tard': 'temoin-temps' },
  }),
  () => ({
    recit: 'Dans les tubes transparents de la tablette, on voit les racines plonger dans le terreau.',
    question: 'Par leurs racines, les plants puisent… ?',
    bonne: 'De l’eau et des sels minéraux',
    pieges: { 'Leur nourriture toute faite': 'racine-nourriture', 'Le dioxyde de carbone': 'racine-co2' },
  }),
  () => ({
    recit: 'Au microscope du local, une fine coupe de racine.',
    question: 'Une cellule de racine : qu’est-ce qu’elle n’a pas, contrairement à une cellule de feuille ?',
    bonne: 'Des chloroplastes',
    pieges: { 'Un noyau': 'racine-noyau', 'Une membrane': 'racine-membrane' },
  }),
  (o) => {
    const r = cinqMesures(o, [12, 15, 18, 20], [[-3, -1, 0, 1, 3], [-2, -1, 0, 1, 2], [-4, -2, 0, 2, 4]]);
    return {
      recit: 'Le serriste mesure les plants sains de la tablette voisine, pour comparer.',
      question: `Hauteur de cinq plants (cm) : ${r.liste}. Hauteur moyenne ?`,
      bonne: `${nombre(r.m)} cm`,
      pieges: { [`${nombre(r.somme)} cm`]: 'moyenne-somme', [`${nombre(r.etendue)} cm`]: 'moyenne-etendue' },
    };
  },
  () => ({
    recit: 'Dernier cadenas : au fond de la serre, une petite ruche en carton bourdonne.',
    question: 'Dans la serre fermée, le serriste installe une ruche de bourdons. Pourquoi ?',
    bonne: 'Pour polliniser les fleurs',
    pieges: { 'Pour manger les pucerons': 'bourdon-pucerons', 'Pour fabriquer du miel à vendre': 'bourdon-miel' },
  }),
];

// ---------------------------------------------------------------- terminale

const DATATIONS = [
  {
    question: 'Un filon de basalte traverse trois couches de calcaire. Ce filon est… ?',
    bonne: 'Plus récent que les couches',
    pieges: { 'Plus ancien que les couches': 'archives-recoupement', 'Du même âge que la couche du bas': 'archives-meme-age' },
  },
  {
    question: 'Trois couches horizontales, non déformées, empilées. La couche du bas est… ?',
    bonne: 'La plus ancienne',
    pieges: { 'La plus récente': 'archives-superposition', 'Impossible à dire sans âge chiffré': 'archives-sans-chiffre' },
  },
];

const TERMINALE = [
  ({ au }) => ({
    recit: 'Depuis la station perchée au bord du canyon, les parois montrent des couches empilées, recoupées par endroits de filons sombres.',
    ...au(DATATIONS),
  }),
  () => ({
    recit: 'Au fond de la vallée, le sol s’est effondré entre deux grandes failles, et des volcans crachent leur lave.',
    question: 'Failles normales, fossé d’effondrement, volcans de basalte : que signent-ils ?',
    bonne: 'Un étirement : le continent se déchire',
    pieges: { 'Un raccourcissement de la croûte': 'rift-raccourcissement', 'Une collision de continents': 'rift-collision' },
  }),
  () => ({
    recit: 'Sur les étagères de la station, des carottes de roche ; l’une d’elles renferme des stromatolites, parmi les plus anciennes traces de vie.',
    question: 'Les cyanobactéries des stromatolites ont enrichi l’atmosphère primitive en… ?',
    bonne: 'Dioxygène',
    pieges: { 'Dioxyde de carbone': 'stromato-co2', Diazote: 'stromato-azote' },
  }),
  ({ au }) => {
    const q = au([1, 2, 3, 4]); // en dixièmes
    return {
      recit: 'Sur un bord de la faille vit une population de lézards. Certains ont des écailles claires, dues à un allèle récessif a.',
      question: `Population à l’équilibre de Hardy-Weinberg : ${q * q} % des lézards ont les écailles claires [a]. Fréquence de l’allèle a ?`,
      bonne: nombre(q / 10),
      pieges: { [nombre((q * q) / 100)]: 'hw-carre', [nombre(1 - q / 10)]: 'hw-p' },
    };
  },
  () => ({
    recit: 'Sur un plateau que la faille a isolé, quelques dizaines de lézards seulement. Leur carnet de suivi montre un allèle qui disparaît.',
    question: 'Dans cette petite population, un allèle sans effet sur la survie disparaît par hasard en quelques générations. C’est… ?',
    bonne: 'La dérive génétique',
    pieges: { 'La sélection naturelle': 'derive-selection', 'Une mutation': 'derive-mutation' },
  }),
  () => ({
    recit: 'Dernier carnet : des milliers de générations plus tard, les lézards des deux bords de la faille se retrouvent.',
    question: 'Pourquoi parle-t-on désormais de deux espèces de lézards ?',
    bonne: 'Elles ne donnent plus de descendants fertiles ensemble',
    pieges: { 'Elles n’ont plus la même couleur': 'espece-ressemblance', 'Elles vivent de part et d’autre de la faille': 'espece-lieu' },
  }),
];

// ---------------------------------------------------------------- terminale techno

const OBS_DOME = [
  { texte: 'Sous le dôme, des fougères de la même espèce ont des frondes de formes différentes, dues à des allèles différents.', bonne: 'genetique' },
  { texte: 'Sur le mur végétal, les botanistes recensent plus de deux cents espèces de plantes.', bonne: 'especes' },
  { texte: 'Du bassin d’eau douce à la mangrove, puis à la forêt des pitons, les milieux se succèdent.', bonne: 'ecosystemes' },
];

const TERMINALE_TECHNO = [
  ({ au }) => (au([true, false])
    ? { recit: 'La nuit tombe sur le dôme. Les capteurs de gaz du mur végétal continuent d’enregistrer.', ...NOIR }
    : {
      recit: 'Midi sous le dôme : la lumière inonde le mur végétal, et le capteur de gaz enregistre.',
      question: 'Sous le dôme éclairé, la photosynthèse des plantes l’emporte sur leur respiration. Quel gaz rejettent-elles ?',
      bonne: 'Du dioxygène',
      pieges: { 'Du dioxyde de carbone': 'photo-produit', 'Aucun gaz': 'photo-aucun' },
    }),
  () => ({
    recit: 'Dans la grande colonne de graviers, l’eau des bassins est filtrée avant d’arroser le mur végétal.',
    question: 'Dans la colonne, des bactéries transforment les déchets des poissons en nitrates. À quoi servent ces nitrates ?',
    bonne: 'D’engrais aux plantes',
    pieges: { 'De nourriture aux poissons': 'cycle-poissons', 'À rien : ce sont des déchets': 'cycle-dechets' },
  }),
  () => ({
    recit: 'Au fond du dôme, une mangrove plonge ses racines dans l’eau, et la vase s’accumule à leurs pieds.',
    question: 'Les racines de la mangrove freinent le courant. Les particules que l’eau transporte… ?',
    bonne: 'Se déposent : c’est la sédimentation',
    pieges: { 'Se dissolvent dans l’eau': 'sediment-dissoute', 'Accélèrent et repartent': 'sediment-accelere' },
  }),
  ({ au }) => ({
    recit: 'Inventaire du dôme : la richesse du vivant fait sa stabilité.',
    ...echelle(au(OBS_DOME)),
  }),
  ({ entre, au }) => {
    const fc = entre(12, 18) * 10;
    const ves = au([80, 100, 120, 125, 150]);
    return {
      recit: 'Le soigneur grimpe la passerelle au pas de course. Au cadenas suivant, sa montre affiche les mesures de son cœur.',
      question: `Fréquence cardiaque : ${fc} battements/min ; volume d’éjection systolique : ${ves} mL. Débit cardiaque ?`,
      bonne: `${nombre((fc * ves) / 1000)} L/min`,
      pieges: { [`${nombre(fc * ves)} L/min`]: 'effort-convertir', [`${nombre(ves / 1000)} L/min`]: 'effort-debit' },
    };
  },
  () => ({
    recit: 'Dernier cadenas : un équilibre du vivant que tu portes en toi.',
    question: 'Comme le dôme, ton intestin abrite un écosystème : le microbiote. Ces milliards de bactéries… ?',
    bonne: 'T’aident à digérer et à te défendre',
    pieges: { 'Sont toutes dangereuses': 'microbiote-danger', 'Sont absentes si l’on est en bonne santé': 'microbiote-absent' },
  }),
];

// ---------------------------------------------------------------- terminale pro

const TERMINALE_PRO = [
  () => ({
    recit: 'La tranchée montre le sol en couches : l’humus sombre en haut, puis la terre rousse, les cailloux et la roche.',
    question: 'Il faut souvent des siècles pour former quelques centimètres de sol. Le sol est donc… ?',
    bonne: 'Une ressource lente à se refaire',
    pieges: { 'Une ressource qui se refait chaque année': 'sol-annee', 'Une ressource inépuisable': 'sol-inepuisable' },
  }),
  () => ({
    recit: 'Un filet d’eau ruisselle sur le talus et emporte la terre nue, mais pas celle du haut, couverte d’herbe.',
    question: 'L’eau ruisselle sur le talus. Qu’est-ce qui retient le sol, en haut ?',
    bonne: 'Les racines des plantes',
    pieges: { 'Les cailloux du bas': 'erosion-cailloux', 'L’eau qui s’infiltre': 'erosion-eau' },
  }),
  () => ({
    recit: 'Dans la couche du haut, l’humus : des feuilles mortes à moitié décomposées, et des vers de terre.',
    question: 'Dans l’humus, qui transforme les feuilles mortes en sels minéraux ?',
    bonne: 'Les décomposeurs : vers, champignons, bactéries',
    pieges: { 'Les racines des plantes': 'sol-racines', 'La pluie, à elle seule': 'sol-pluie' },
  }),
  () => ({
    recit: 'Au microscope de la station, une goutte de terre diluée : des bactéries du sol, par milliers.',
    question: 'Les bactéries du sol : qu’est-ce qu’elles n’ont pas, contrairement aux cellules de racine ?',
    bonne: 'Un noyau',
    pieges: { 'De l’ADN': 'bacterie-adn', 'Une membrane': 'bacterie-membrane' },
  }),
  ({ au }) => {
    const humide = au([200, 500, 600]);
    const p = au([10, 20, 25, 30, 40]);
    const eau = (humide * p) / 100;
    return {
      recit: 'Sur la table, un échantillon de terre sort de l’étuve. Combien d’eau contenait-il ?',
      question: `Terre humide : ${humide} g. Après séchage à l’étuve : ${humide - eau} g. Pourcentage d’eau ?`,
      bonne: `${p} %`,
      pieges: { [`${100 - p} %`]: 'humidite-sec', [`${eau} %`]: 'humidite-masse' },
    };
  },
  () => ({
    recit: 'Dernier cadenas : l’agriculteur voisin demande conseil pour garder sa terre fertile.',
    question: 'Pour garder un sol fertile, que peut faire l’agriculteur ?',
    bonne: 'Enfouir du compost',
    pieges: { 'Laisser le sol nu tout l’hiver': 'sol-nu', 'Brûler les restes de récolte': 'sol-brulis' },
  }),
];

const HISTOIRES = {
  SECONDE: { prefixe: '2de', code: ['R', 'O', 'S', 'E', 'A', 'U'], etapes: SECONDE },
  SECONDE_PRO: { prefixe: '2pro', code: ['T', 'O', 'M', 'A', 'T', 'E'], etapes: SECONDE_PRO },
  PREMIERE: { prefixe: '1re', code: ['G', 'E', 'N', 'O', 'M', 'E'], etapes: PREMIERE },
  PREMIERE_TECHNO: { prefixe: '1tec', code: ['B', 'A', 'S', 'S', 'I', 'N'], etapes: PREMIERE_TECHNO },
  PREMIERE_PRO: { prefixe: '1pro', code: ['R', 'A', 'C', 'I', 'N', 'E'], etapes: PREMIERE_PRO },
  TERMINALE: { prefixe: 'tle', code: ['F', 'A', 'I', 'L', 'L', 'E'], etapes: TERMINALE },
  TERMINALE_TECHNO: { prefixe: 'ttec', code: ['V', 'I', 'V', 'A', 'N', 'T'], etapes: TERMINALE_TECHNO },
  TERMINALE_PRO: { prefixe: 'tpro', code: ['A', 'R', 'G', 'I', 'L', 'E'], etapes: TERMINALE_PRO },
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
  '2de-etape-1': 'Premier cadenas : dis à quelle échelle de la biodiversité se situe l’observation.',
  '2de-etape-2': 'Deuxième cadenas : trouve ce que toutes les cellules ont en commun.',
  '2de-etape-3': 'Troisième cadenas : utilise la complémentarité des bases de l’ADN.',
  '2de-etape-4': 'Quatrième cadenas : dis quel gaz rejette l’élodée.',
  '2de-etape-5': 'Cinquième cadenas : trouve la place de cet être vivant dans la chaîne alimentaire.',
  '2de-etape-6': 'Dernier cadenas : explique la maladie transmise par le moustique.',
  // 2de pro — les consignes
  '2pro-etape-1': 'Premier cadenas : dis à quelle échelle de la biodiversité se situe l’observation.',
  '2pro-etape-2': 'Deuxième cadenas : dis quel gaz rejettent les feuilles.',
  '2pro-etape-3': 'Troisième cadenas : explique pourquoi on ajoute de l’engrais.',
  '2pro-etape-4': 'Quatrième cadenas : choisis le bon témoin.',
  '2pro-etape-5': 'Cinquième cadenas : calcule la récolte moyenne.',
  '2pro-etape-6': 'Dernier cadenas : arrête le moustique tigre.',
  // 1re — les consignes
  '1re-etape-1': 'Premier cadenas : explique le comportement de l’enzyme.',
  '1re-etape-2': 'Deuxième cadenas : relie la longueur de la protéine à celle de l’ARN messager.',
  '1re-etape-3': 'Troisième cadenas : prévois l’effet de la mutation sur la protéine.',
  '1re-etape-4': 'Quatrième cadenas : situe l’observation parmi les échelles du phénotype.',
  '1re-etape-5': 'Cinquième cadenas : relie les mutations au cancer.',
  '1re-etape-6': 'Dernier cadenas : explique comment la cellule conserve son génome.',
  // 1re techno — les consignes
  '1tec-etape-1': 'Premier cadenas : prévois l’effet du rejet sur le canal.',
  '1tec-etape-2': 'Deuxième cadenas : explique pourquoi les poissons manquent d’air.',
  '1tec-etape-3': 'Troisième cadenas : calcule la moyenne des mesures.',
  '1tec-etape-4': 'Quatrième cadenas : distingue la cellule végétale de la cellule animale.',
  '1tec-etape-5': 'Cinquième cadenas : dis ce qui fait du bassin un agrosystème.',
  '1tec-etape-6': 'Dernier cadenas : dis à quelle échelle de la biodiversité se situe l’observation.',
  // 1re pro — les consignes
  '1pro-etape-1': 'Premier cadenas : dis ce que risque la rivière.',
  '1pro-etape-2': 'Deuxième cadenas : choisis le bon témoin.',
  '1pro-etape-3': 'Troisième cadenas : dis ce que puisent les racines.',
  '1pro-etape-4': 'Quatrième cadenas : observe la cellule de racine.',
  '1pro-etape-5': 'Cinquième cadenas : calcule la hauteur moyenne.',
  '1pro-etape-6': 'Dernier cadenas : explique le rôle des bourdons.',
  // terminale — les consignes
  'tle-etape-1': 'Premier cadenas : applique les principes de la datation relative.',
  'tle-etape-2': 'Deuxième cadenas : interprète les structures de la vallée.',
  'tle-etape-3': 'Troisième cadenas : retrace l’histoire de l’atmosphère.',
  'tle-etape-4': 'Quatrième cadenas : applique le modèle de Hardy-Weinberg.',
  'tle-etape-5': 'Cinquième cadenas : nomme ce mécanisme de l’évolution.',
  'tle-etape-6': 'Dernier cadenas : dis ce qui fait deux espèces.',
  // terminale techno — les consignes
  'ttec-etape-1': 'Premier cadenas : dis quel gaz rejettent les plantes du dôme.',
  'ttec-etape-2': 'Deuxième cadenas : suis le cycle de la matière dans les bassins.',
  'ttec-etape-3': 'Troisième cadenas : explique ce qui se passe au pied de la mangrove.',
  'ttec-etape-4': 'Quatrième cadenas : dis à quelle échelle de la biodiversité se situe l’observation.',
  'ttec-etape-5': 'Cinquième cadenas : calcule le débit cardiaque du soigneur.',
  'ttec-etape-6': 'Dernier cadenas : dis le rôle du microbiote.',
  // terminale pro — les consignes
  'tpro-etape-1': 'Premier cadenas : dis pourquoi le sol est précieux.',
  'tpro-etape-2': 'Deuxième cadenas : trouve ce qui retient le sol.',
  'tpro-etape-3': 'Troisième cadenas : trouve qui décompose les feuilles mortes.',
  'tpro-etape-4': 'Quatrième cadenas : observe la bactérie du sol.',
  'tpro-etape-5': 'Cinquième cadenas : calcule le pourcentage d’eau de la terre.',
  'tpro-etape-6': 'Dernier cadenas : garde le sol fertile.',

  // les erreurs — biodiversité
  'biodiv-genetique': 'La diversité génétique, ce sont des allèles différents chez des individus d’une même espèce. Regarde si l’on compare des individus, des espèces ou des milieux entiers.',
  'biodiv-especes': 'La diversité des espèces compte les espèces différentes d’un milieu. Regarde si l’on compare des individus, des espèces ou des milieux entiers.',
  'biodiv-ecosystemes': 'La diversité des écosystèmes compare des milieux entiers, comme une mare et un bois. Regarde si l’on compare des individus, des espèces ou des milieux.',
  // les erreurs — cellules
  'cellule-noyau': 'Une bactérie n’a pas de noyau : son ADN baigne dans le cytoplasme. Ce que toutes les cellules partagent, c’est une membrane, du cytoplasme et de l’ADN.',
  'cellule-chloroplaste': 'Les chloroplastes n’existent que dans les cellules chlorophylliennes des végétaux et des algues. Toutes les cellules, elles, ont une membrane, du cytoplasme et de l’ADN.',
  'cellule-noyau-commun': 'Les cellules animales et végétales ont toutes deux un noyau. Ce qui distingue la cellule végétale, c’est sa paroi et, dans les parties vertes, ses chloroplastes.',
  'cellule-adn-commun': 'Toutes les cellules possèdent de l’ADN, animales comme végétales. La cellule végétale se distingue par sa paroi et ses chloroplastes.',
  'racine-noyau': 'Les cellules de racine ont un noyau, comme celles de la feuille. Elles n’ont pas de chloroplastes : sous terre, pas de lumière, pas de photosynthèse.',
  'racine-membrane': 'Toute cellule a une membrane. Ce qui manque à la cellule de racine, ce sont les chloroplastes : sous terre, pas de photosynthèse.',
  'bacterie-adn': 'Les bactéries ont bien de l’ADN, comme toutes les cellules ; mais il baigne dans le cytoplasme, sans noyau.',
  'bacterie-membrane': 'Toute cellule a une membrane, bactérie comprise. Ce qui manque à la bactérie, c’est un noyau : son ADN baigne dans le cytoplasme.',
  // les erreurs — ADN
  'adn-paires': 'L’adénine s’associe à la thymine, la guanine à la cytosine : autant d’adénine que de thymine, autant de guanine que de cytosine.',
  'adn-complement': 'Le reste ne revient pas tout entier à la guanine : retire l’adénine et la thymine, présentes en même quantité, puis partage ce qui reste entre guanine et cytosine.',
  // les erreurs — photosynthèse et respiration
  'metabo-lumiere': 'Sans lumière, pas de photosynthèse : la feuille ne produit pas de dioxygène. Elle respire, et rejette du dioxyde de carbone.',
  'metabo-respiration': 'Une plante respire jour et nuit, comme toute cellule vivante. Dans le noir, seule la respiration a lieu : la feuille rejette du dioxyde de carbone.',
  'metabo-bulles': 'À la lumière, la photosynthèse l’emporte sur la respiration : la plante absorbe du dioxyde de carbone et rejette du dioxygène.',
  'metabo-vapeur': 'L’eau ne bout pas dans un bocal au soleil : ces bulles sont un gaz produit par la photosynthèse, le dioxygène.',
  'photo-produit': 'La photosynthèse consomme du dioxyde de carbone : elle le prend dans l’air pour fabriquer de la matière, et rejette du dioxygène.',
  'photo-aucun': 'La photosynthèse échange bien des gaz : elle absorbe du dioxyde de carbone et rejette du dioxygène.',
  'respiration-produit': 'Produire du dioxygène, c’est la photosynthèse. Les bactéries décomposeuses respirent : elles consomment du dioxygène et rejettent du dioxyde de carbone.',
  'respiration-aucun': 'Toute cellule vivante qui respire échange des gaz : elle consomme du dioxygène. C’est pour cela que les poissons manquent d’air.',
  'racine-nourriture': 'Une plante fabrique elle-même sa matière organique par photosynthèse. Ses racines ne puisent que de l’eau et des sels minéraux.',
  'racine-co2': 'Le dioxyde de carbone entre par les feuilles, depuis l’air. Les racines puisent de l’eau et des sels minéraux.',
  // les erreurs — écosystèmes et agrosystèmes
  'chaine-producteur': 'Un producteur fabrique sa matière organique grâce à la lumière, comme les algues. Celui-là mange d’autres êtres vivants : compte les maillons depuis les algues.',
  'chaine-primaire': 'Un consommateur primaire mange directement des producteurs. Compte les maillons depuis les algues : le premier produit, le deuxième mange les algues, le troisième mange le deuxième.',
  'chaine-secondaire': 'Un consommateur secondaire mange des consommateurs primaires. Compte les maillons depuis les algues : le premier produit, le deuxième mange les algues, le troisième mange le deuxième.',
  'eutro-poissons': 'Les poissons ne se nourrissent pas de ces sels minéraux. Ce sont les algues, qui les absorbent comme un engrais, qui prolifèrent d’abord.',
  'eutro-naturel': 'Naturels ou non, ces sels minéraux en excès agissent comme un engrais dans l’eau : les algues prolifèrent.',
  'cycle-poissons': 'Les poissons ne se nourrissent pas de nitrates. Ce sont les plantes qui les absorbent par leurs racines, comme un engrais : la matière circule en boucle.',
  'cycle-dechets': 'Rien ne se perd dans un écosystème : les nitrates sont des sels minéraux que les plantes absorbent. La matière circule en boucle.',
  'agro-decomposeurs': 'Des décomposeurs vivent aussi dans un bassin d’élevage : bactéries et champignons y recyclent la matière. Ce qui le distingue, ce sont les apports et les récoltes de l’humain.',
  'agro-lumiere': 'Un agrosystème dépend lui aussi de la lumière, captée par les algues et les plantes. Ce qui le distingue, ce sont les apports et les récoltes de l’humain.',
  'engrais-terre': 'Une plante ne mange pas la terre : elle y puise de l’eau et des sels minéraux, et fabrique sa matière par photosynthèse. Chaque récolte emporte une partie de ces sels.',
  'engrais-eau': 'L’engrais apporte des sels minéraux, pas de l’eau : il faut toujours arroser. On en ajoute parce que les récoltes emportent les sels minéraux du sol.',
  'bourdon-pucerons': 'Contre les pucerons, on lâche plutôt des coccinelles. Les bourdons, eux, butinent : ils transportent le pollen de fleur en fleur.',
  'bourdon-miel': 'Une colonie de bourdons fait très peu de miel. Dans une serre fermée, sans vent ni insectes, on l’installe pour polliniser les fleurs et obtenir des fruits.',
  // les erreurs — démarche et calculs
  'temoin-plusieurs': 'Un bon témoin ne diffère que par un seul facteur, celui que l’on teste. Si tu changes aussi la plante ou la lumière, tu ne sais plus quelle différence explique le résultat.',
  'temoin-temps': 'Attendre ne compare rien : il faut, au même moment, des plants identiques qui ne diffèrent que par le facteur testé.',
  'moyenne-somme': 'Ça, c’est le total. La moyenne partage ce total entre les mesures : divise la somme par leur nombre.',
  'moyenne-etendue': 'L’écart entre la plus grande et la plus petite valeur, c’est l’étendue. La moyenne, c’est la somme des valeurs divisée par leur nombre.',
  'humidite-sec': 'Ce pourcentage est celui de la terre sèche. L’eau, c’est la masse perdue au séchage, divisée par la masse humide, fois cent.',
  'humidite-masse': 'Ce nombre est une masse d’eau en grammes, pas un pourcentage : divise-la par la masse humide, puis multiplie par cent.',
  // les erreurs — maladies et santé
  'vecteur-agent': 'Le moustique n’est que le vecteur : il transporte l’agent pathogène d’une personne à l’autre. Celui du paludisme est un parasite unicellulaire, le plasmodium.',
  'paludisme-virus': 'Le paludisme n’est pas dû à un virus, mais à un parasite unicellulaire, le plasmodium, que le moustique transmet en piquant.',
  'virus-antibiotique': 'Les antibiotiques agissent sur les bactéries, jamais sur les virus. Contre la dengue, on prive le moustique de ses lieux de ponte.',
  'dengue-contact': 'La dengue ne se transmet pas par le toucher : il faut la piqûre d’un moustique. Supprimer les eaux stagnantes, c’est supprimer ses lieux de ponte.',
  'effort-convertir': 'Convertis le volume d’éjection en litres avant de multiplier : mille millilitres font un litre.',
  'effort-debit': 'Le volume d’éjection, c’est le sang d’un seul battement. Le débit cardiaque compte tous les battements d’une minute : multiplie par la fréquence cardiaque.',
  'microbiote-danger': 'La plupart de ces bactéries sont utiles : elles participent à la digestion et occupent la place que pourraient prendre des bactéries pathogènes.',
  'microbiote-absent': 'Tout le monde héberge un microbiote, et il va de pair avec la bonne santé : il aide à digérer et protège contre les pathogènes.',
  // les erreurs — enzymes, expression et mutations
  'enzyme-consommee': 'Une enzyme est un catalyseur : elle se retrouve intacte après la réaction, prête à recommencer. Elle ne s’use pas.',
  'enzyme-quantite': 'Plus d’enzyme accélère la réaction, mais ne change pas le substrat reconnu : le site actif n’a la forme que de son substrat.',
  'enzyme-vivante': 'Une enzyme est une protéine, pas un être vivant : elle ne meurt pas. La chaleur change sa forme, et son site actif ne reconnaît plus le substrat.',
  'codon-un': 'Un acide aminé est codé par un codon, c’est-à-dire trois nucléotides : multiplie le nombre d’acides aminés par trois.',
  'codon-diviser': 'L’ARN messager compte plus de nucléotides que la protéine n’a d’acides aminés : trois nucléotides par acide aminé, il faut donc multiplier par trois.',
  'mutation-redondance': 'Le code génétique est redondant : plusieurs codons codent le même acide aminé. Le nouveau codon code toujours le même : la protéine ne change pas.',
  'mutation-stop': 'Une protéine n’est raccourcie que si un codon stop apparaît. Ici, le nouveau codon code encore un acide aminé : lis le code génétique.',
  'mutation-codon': 'Traduis le nouveau codon avec le code génétique : s’il ne code plus le même acide aminé, ou s’il code un arrêt, la protéine change.',
  'mutation-non-sens': 'Le nouveau codon est un codon stop : la traduction s’arrête là, et la protéine est raccourcie.',
  'phenotype-moleculaire': 'Le phénotype moléculaire, c’est la protéine elle-même. Demande-toi si l’on décrit une molécule, une cellule ou tout l’organisme.',
  'phenotype-cellulaire': 'Le phénotype cellulaire décrit la forme ou le fonctionnement des cellules. Demande-toi si l’on décrit une molécule, une cellule ou tout l’organisme.',
  'phenotype-macroscopique': 'Le phénotype macroscopique se voit à l’échelle de l’organisme entier. Demande-toi si l’on décrit une molécule, une cellule ou tout l’organisme.',
  'cancer-virus': 'Les UV ne transportent aucun virus : ce sont des rayonnements qui abîment l’ADN et provoquent des mutations. Accumulées, elles peuvent rendre une cellule cancéreuse.',
  'cancer-brulure': 'Le coup de soleil n’est pas tout : les UV abîment aussi l’ADN des cellules de la peau, et ces mutations augmentent le risque de cancer.',
  'cancer-une-seule': 'Une cellule devient cancéreuse en accumulant plusieurs mutations, sur des gènes qui contrôlent la division. Une seule ne suffit pas, en général.',
  'cancer-sans-mutation': 'Un cancer naît bien d’altérations du génome : des mutations accumulées dans les gènes qui contrôlent la division cellulaire.',
  'mitose-moitie': 'Diviser par deux le nombre de chromosomes, c’est la méiose. La mitose donne deux cellules filles identiques à la cellule mère : quarante-six chromosomes chacune.',
  'mitose-double': 'Les chromosomes sont dupliqués avant la mitose, puis répartis entre les deux cellules filles : chacune retrouve le même nombre que la cellule mère.',
  'replication-conservative': 'La réplication est semi-conservative : chaque brin ancien sert de modèle à un brin nouveau. Chaque molécule fille garde un brin de la molécule mère.',
  'replication-dispersive': 'Les brins ne sont pas découpés en morceaux : chaque brin ancien reste entier et sert de modèle à un brin nouveau. La réplication est semi-conservative.',
  // les erreurs — la Terre et son histoire
  'archives-recoupement': 'Principe de recoupement : un filon qui traverse des couches est plus récent qu’elles, car elles existaient déjà quand il les a coupées.',
  'archives-meme-age': 'Le filon ne date pas de la couche d’où il part : il a traversé des couches déjà déposées, il est donc plus récent que toutes.',
  'archives-superposition': 'Principe de superposition : dans une série non déformée, chaque couche s’est déposée sur la précédente. La plus basse est la plus ancienne.',
  'archives-sans-chiffre': 'La datation relative ordonne les événements sans aucun âge chiffré : la superposition suffit à dire quelle couche est la plus ancienne.',
  'rift-raccourcissement': 'Un raccourcissement donne des plis et des failles inverses. Des failles normales et un fossé d’effondrement signent au contraire un étirement : un continent qui se fragmente.',
  'rift-collision': 'Une collision épaissit la croûte et dresse des montagnes, avec plis et failles inverses. Failles normales, effondrement et basaltes signent un rift, où le continent s’étire.',
  'stromato-co2': 'La photosynthèse consomme du dioxyde de carbone et rejette du dioxygène : c’est ainsi que les cyanobactéries ont enrichi l’atmosphère en dioxygène.',
  'stromato-azote': 'Le diazote de l’atmosphère vient surtout du dégazage des volcans. Les cyanobactéries, par photosynthèse, ont apporté le dioxygène.',
  'sediment-dissoute': 'Des grains de sable ou de vase ne se dissolvent pas : ils sont transportés tant que l’eau va vite, et se déposent quand elle ralentit.',
  'sediment-accelere': 'Le courant ralenti n’a plus la force de porter les particules : elles tombent et se déposent. C’est la sédimentation.',
  'sol-annee': 'Un sol se forme très lentement, par l’altération de la roche et la décomposition de la matière organique : il faut des siècles pour quelques centimètres.',
  'sol-inepuisable': 'Un sol perdu par l’érosion ne revient pas à l’échelle d’une vie : il faut des siècles pour quelques centimètres. C’est une ressource à protéger.',
  'erosion-cailloux': 'Les cailloux du bas ne retiennent pas la terre du haut. Ce sont les racines qui tiennent le sol, et la végétation qui freine l’eau.',
  'erosion-eau': 'L’eau qui ruisselle arrache les particules : c’est elle qui érode. Ce qui retient le sol, ce sont les racines des plantes.',
  'sol-racines': 'Les racines absorbent les sels minéraux, elles ne les fabriquent pas. Ce sont les décomposeurs, vers de terre, champignons et bactéries, qui transforment la matière morte.',
  'sol-pluie': 'La pluie ne décompose pas les feuilles à elle seule : ce sont des êtres vivants, les décomposeurs, qui les transforment en sels minéraux.',
  'sol-nu': 'Un sol nu, battu par la pluie, s’érode et s’appauvrit. Une couverture végétale le protège, et le compost lui rend de la matière organique.',
  'sol-brulis': 'Brûler les restes de récolte détruit la matière organique qui aurait nourri le sol. Le compost, lui, la rend au sol.',
  // les erreurs — génétique des populations et espèces
  'hw-carre': 'Ce pourcentage est celui des homozygotes récessifs : c’est le carré de la fréquence de l’allèle. Prends sa racine carrée.',
  'hw-p': 'Celle-là, c’est la fréquence de l’autre allèle, le dominant. L’allèle récessif a pour fréquence la racine carrée de la part d’homozygotes récessifs.',
  'derive-selection': 'La sélection naturelle trie les allèles selon l’avantage qu’ils donnent. Un allèle sans effet qui disparaît par hasard, dans une petite population, c’est la dérive génétique.',
  'derive-mutation': 'Une mutation crée un allèle nouveau ; elle n’en fait pas disparaître. Un allèle perdu par hasard dans une petite population, c’est la dérive génétique.',
  'espece-ressemblance': 'La couleur ne suffit pas : des individus d’une même espèce peuvent se ressembler peu. Le critère, c’est l’interfécondité : donner ensemble des descendants fertiles.',
  'espece-lieu': 'Vivre séparées ne fait pas deux espèces : il faut qu’elles ne puissent plus donner ensemble des descendants fertiles.',
};
