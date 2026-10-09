/**
 * L'ESCAPE GAME DE PHYSIQUE-CHIMIE DU COLLÈGE — Yann, de la 5e à la 3e. Une
 * histoire par classe, six cadenas dans l'ordre du récit ; seuls les choix
 * sont mélangés, et les nombres tirés au hasard.
 *
 * 5e — LE LABORATOIRE DU PROFESSEUR VOLTA (code BECHER)
 *   1. le sucre dans l'eau : dissolution, pas fusion (PC_5E_MAT_SOLUBILITE) ;
 *   2. la glace fond dans un flacon fermé : la masse se conserve (PC_5E_MAT_MASSE) ;
 *   3. homogène, hétérogène, ou corps pur ? (PC_5E_MAT_MELANGES) ;
 *   4. un fil mal placé : le court-circuit (PC_5E_ENER_COURT) ;
 *   5. source primaire ou objet diffusant — la Lune (PC_5E_SIG_SOURCES) ;
 *   6. le volume d'une pièce par déplacement d'eau (PC_5E_MAT_VOLUME).
 *
 * 4e — LA BASE LUNAIRE (code APOLLO)
 *   1. voltmètre en dérivation, ampèremètre en série (PC_4E_ENER_TENSION) ;
 *   2. U = R × I, l'intensité donnée en mA (PC_4E_ENER_OHM) ;
 *   3. P = m × g sur la Lune : le poids n'est pas la masse (PC_4E_MOUV_POIDS) ;
 *   4. le son ne traverse pas le vide (PC_4E_SIG_SON) ;
 *   5. écrire une formule : H₂O, CO₂, CH₄, NH₃ (PC_4E_MAT_FORMULES) ;
 *   6. ρ = m ÷ V (PC_4E_MAT_MASSE_VOLUMIQUE).
 *
 * 3e — LE BIDON SANS ÉTIQUETTE DE L'USINE DE RECYCLAGE (code CUIVRE)
 *   1. pH : acide ou basique (PC_3E_MAT_PH) ;
 *   2. test à la soude : Cu²⁺ bleu, Fe²⁺ vert, Fe³⁺ rouille (PC_3E_MAT_TESTS) ;
 *   3. métal + acide chlorhydrique → dihydrogène (PC_3E_MAT_METAUX) ;
 *   4. un atome qui perd des électrons devient un ion positif (PC_3E_MAT_IONS) ;
 *   5. E = P × t en kWh (PC_3E_ENER_CONSOMMATION) ;
 *   6. Ec = ½ × m × v² (PC_3E_ENER_FORMES).
 *
 * Les pièges sont les erreurs réelles des élèves : « le sucre a fondu »,
 * « la Lune est une source de lumière », « on entend dans l'espace », « mon
 * poids est de 80 kg », oublier de convertir les mA ou les W, oublier le carré.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-physique-chimie', titre: 'Escape game de physique-chimie', matiereCode: 'PHYSIQUE_CHIMIE' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Le laboratoire du professeur Volta',
    accroche: 'Un laboratoire fermé, six énigmes à résoudre.',
    intro: 'Le professeur Volta a disparu en laissant son laboratoire verrouillé par six cadenas. Chacun cache une expérience : résous-les toutes pour retrouver son carnet.',
    fin: 'Le code BECHER ouvre l’armoire : le carnet du professeur Volta est à toi.',
    competences: [
      'PC_5E_MAT_SOLUBILITE',
      'PC_5E_MAT_MASSE',
      'PC_5E_MAT_MELANGES',
      'PC_5E_ENER_COURT',
      'PC_5E_SIG_SOURCES',
      'PC_5E_MAT_VOLUME',
    ],
  },
  QUATRIEME: {
    titre: 'Panne sur la base lunaire',
    accroche: 'Une base sur la Lune, six pannes à réparer.',
    intro: 'Sur la base lunaire Séléné, le courant faiblit et la radio s’est tue. Répare les six systèmes, un par cadenas, avant la nuit lunaire.',
    fin: 'Le code APOLLO relance la base : Séléné a retrouvé l’énergie et la radio.',
    competences: [
      'PC_4E_ENER_TENSION',
      'PC_4E_ENER_OHM',
      'PC_4E_MOUV_POIDS',
      'PC_4E_SIG_SON',
      'PC_4E_MAT_FORMULES',
      'PC_4E_MAT_MASSE_VOLUMIQUE',
    ],
  },
  TROISIEME: {
    titre: 'Le bidon sans étiquette',
    accroche: 'Une usine en alerte, des bidons à identifier.',
    intro: 'Dans une usine de recyclage des métaux, des bidons sans étiquette fuient et l’alarme a coupé la chaîne. Identifie leur contenu, puis relance les machines : six cadenas t’en séparent.',
    fin: 'Le code CUIVRE relance la chaîne : l’usine tourne de nouveau, en sécurité.',
    competences: [
      'PC_3E_MAT_PH',
      'PC_3E_MAT_TESTS',
      'PC_3E_MAT_METAUX',
      'PC_3E_MAT_IONS',
      'PC_3E_ENER_CONSOMMATION',
      'PC_3E_ENER_FORMES',
    ],
  },
};

export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 6;

/** Un nombre écrit à la française : virgule décimale, espace entre les milliers. */
export function nombre(x) {
  const r = Math.round(x * 1000) / 1000;
  const [ent, dec] = String(r).split('.');
  const e = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return dec ? `${e},${dec}` : e;
}

// ---------------------------------------------------------------- 5e

const MELANGES = [
  { nom: 'de l’eau boueuse', bonne: 'Hétérogène' },
  { nom: 'de l’eau et de l’huile', bonne: 'Hétérogène' },
  { nom: 'de l’eau salée', bonne: 'Homogène' },
  { nom: 'de l’eau sucrée', bonne: 'Homogène' },
];

const SOURCES_PRIMAIRES = ['Une bougie allumée', 'Le Soleil', 'Une lampe allumée'];
const DIFFUSANTS = ['Une feuille blanche', 'Un mur blanc', 'La page d’un livre'];

const COURTS_CIRCUITS = [
  {
    question: 'Pile et lampe en série. Un fil relie les deux bornes de la lampe. Que fait la lampe ?',
    bonne: 'Elle s’éteint',
    pieges: { 'Elle brille plus fort': 'court-plus-fort', 'Rien ne change': 'court-rien' },
  },
  {
    question: 'Un fil relie directement les deux bornes de la pile. Que se passe-t-il ?',
    bonne: 'La pile chauffe : danger',
    pieges: { 'Rien : un fil ne consomme rien': 'court-danger', 'La pile se recharge': 'court-recharge' },
  },
];

const CINQUIEME = [
  ({ au }) => ({
    recit: 'Sur la paillasse, un bécher d’eau et un mot du professeur : « J’y ai versé une cuillerée. » On ne voit plus rien dans l’eau.',
    question: `Le ${au(['sucre', 'sel'])} versé dans l’eau n’est plus visible. Que s’est-il passé ?`,
    bonne: 'Il s’est dissous',
    pieges: { 'Il a fondu': 'dissolution-fusion', 'Il a disparu': 'dissolution-disparu' },
  }),
  ({ entre }) => {
    const M = entre(150, 400);
    const k = entre(10, 40);
    return {
      recit: 'Sur la balance, un flacon bouché rempli de glaçons. Le professeur a noté sa masse avant de partir.',
      question: `Flacon bouché avec ses glaçons : ${nombre(M)} g. Une fois toute la glace fondue, la balance indique ?`,
      bonne: `${nombre(M)} g`,
      pieges: { [`${nombre(M - k)} g`]: 'masse-diminue', [`${nombre(M + k)} g`]: 'masse-augmente' },
    };
  },
  ({ au }) => {
    const m = au(MELANGES);
    const pieges = { 'Un corps pur': 'melange-corps-pur' };
    pieges[m.bonne === 'Homogène' ? 'Hétérogène' : 'Homogène'] = 'melange-voir';
    return {
      recit: 'Une rangée de flacons étiquetés « À classer ». Le cadenas suivant demande la nature de l’un d’eux.',
      question: `Dans ce flacon, ${m.nom}. Qu’est-ce que c’est ?`,
      bonne: m.bonne,
      pieges,
    };
  },
  ({ au }) => ({
    recit: 'Le circuit qui commande la porte du fond a été trafiqué : un fil de cuivre dépasse là où il ne devrait pas.',
    ...au(COURTS_CIRCUITS),
  }),
  ({ au }) => {
    const bonne = au(SOURCES_PRIMAIRES);
    const pieges = { 'La Lune': 'source-lune', [au(DIFFUSANTS)]: 'source-diffusant' };
    return {
      recit: 'La lumière s’éteint. Sur le mur, une affiche : « Qui produit sa propre lumière ? »',
      question: 'Lequel est une source primaire de lumière ?',
      bonne,
      pieges,
    };
  },
  ({ entre }) => {
    const v1 = entre(2, 7) * 10;
    const dv = entre(4, 25);
    const v2 = v1 + dv;
    return {
      recit: 'La dernière serrure attend une petite pièce de métal au volume exact. Tu la plonges dans une éprouvette graduée.',
      question: `Éprouvette : ${nombre(v1)} mL d’eau, puis ${nombre(v2)} mL avec la pièce. Volume de la pièce ?`,
      bonne: `${nombre(dv)} mL`,
      pieges: { [`${nombre(v2)} mL`]: 'volume-total', [`${nombre(dv)} g`]: 'volume-unite' },
    };
  },
];

// ---------------------------------------------------------------- 4e

const MESURES = [
  {
    question: 'Mesurer la tension aux bornes de la lampe : quel appareil, branché comment ?',
    bonne: 'Voltmètre, en dérivation',
    pieges: { 'Ampèremètre, en série': 'mesure-appareil', 'Voltmètre, en série': 'mesure-voltmetre' },
  },
  {
    question: 'Mesurer l’intensité qui traverse la lampe : quel appareil, branché comment ?',
    bonne: 'Ampèremètre, en série',
    pieges: { 'Voltmètre, en dérivation': 'mesure-appareil', 'Ampèremètre, en dérivation': 'mesure-amperemetre' },
  },
];

const MOLECULES = [
  {
    nom: 'd’eau', atomes: '2 atomes d’hydrogène (H) et 1 atome d’oxygène (O)', bonne: 'H₂O', indice: 'HO₂', un: 'H₂O₁',
  },
  {
    nom: 'de dioxyde de carbone', atomes: '1 atome de carbone (C) et 2 atomes d’oxygène (O)', bonne: 'CO₂', indice: 'C₂O', un: 'C₁O₂',
  },
  {
    nom: 'de méthane', atomes: '1 atome de carbone (C) et 4 atomes d’hydrogène (H)', bonne: 'CH₄', indice: 'C₄H', un: 'C₁H₄',
  },
  {
    nom: 'd’ammoniac', atomes: '1 atome d’azote (N) et 3 atomes d’hydrogène (H)', bonne: 'NH₃', indice: 'N₃H', un: 'N₁H₃',
  },
];

/** Masses volumiques en dixièmes de g/cm³ : aluminium 2,7 ; zinc 7,1 ; fer 7,9 ; argent 10,5. */
const METAUX = [27, 71, 79, 105];

const QUATRIEME = [
  ({ au }) => ({
    recit: 'Dans le module d’énergie, la lampe de secours éclaire à peine. Avant de réparer, il faut mesurer.',
    ...au(MESURES),
  }),
  ({ entre, au }) => {
    const r = entre(2, 6) * 10;
    const k = au([1, 2, 4, 5]);
    const ma = k * 100;
    const ampere = ma / 1000;
    const u = r * ampere;
    return {
      recit: 'Le radiateur de la cabine est une résistance. La plaque est rayée : il manque la tension.',
      question: `R = ${nombre(r)} Ω ; I = ${nombre(ma)} mA. Tension U ?`,
      bonne: `${nombre(u)} V`,
      pieges: { [`${nombre(r * ma)} V`]: 'ohm-convertir', [`${nombre(r / ampere)} V`]: 'ohm-diviser' },
    };
  },
  ({ entre }) => {
    const m = entre(6, 15) * 10;
    const p = (m * 16) / 10;
    return {
      recit: 'Tu enfiles ta combinaison pour sortir réparer l’antenne. La balance du sas affiche ta masse, équipement compris.',
      question: `Ta masse : ${nombre(m)} kg. Sur la Lune, g = 1,6 N/kg. Ton poids P ?`,
      bonne: `${nombre(p)} N`,
      pieges: { [`${nombre(m)} kg`]: 'poids-masse', [`${nombre(p)} kg`]: 'poids-unite' },
    };
  },
  () => ({
    recit: 'Dehors, ta radio grésille puis se tait. Ta coéquipière est à dix mètres, de l’autre côté de l’antenne.',
    question: 'Sans radio, peut-elle t’entendre si tu cries ?',
    bonne: 'Non : le son ne traverse pas le vide',
    pieges: { 'Oui, comme sur Terre': 'son-vide', 'Oui, mais plus lentement': 'son-lent' },
  }),
  ({ au }) => {
    const mol = au(MOLECULES);
    return {
      recit: 'Le recycleur d’air affiche une alerte : il faut entrer la formule d’une molécule pour le relancer.',
      question: `Une molécule ${mol.nom} : ${mol.atomes}. Sa formule ?`,
      bonne: mol.bonne,
      pieges: { [mol.indice]: 'formule-indice', [mol.un]: 'formule-un' },
    };
  },
  ({ entre, au }) => {
    const rho10 = au(METAUX);
    const v = entre(1, 5) * 10;
    const m = (rho10 * v) / 10;
    const rho = m / v;
    return {
      recit: 'Pour réparer le sas, il faut une pièce du bon métal. Le tableau de la réserve : aluminium 2,7 ; zinc 7,1 ; fer 7,9 ; argent 10,5 (en g/cm³).',
      question: `Pièce : m = ${nombre(m)} g ; V = ${nombre(v)} cm³. Sa masse volumique ?`,
      bonne: `${nombre(rho)} g/cm³`,
      pieges: { [`${nombre(m * v)} g/cm³`]: 'mv-produit', [`${nombre(rho)} kg/m³`]: 'mv-unite' },
    };
  },
];

// ---------------------------------------------------------------- 3e

const SUP = { 1: '', 2: '²', 3: '³' };
const ion = (symbole, n, signe) => `${symbole}${SUP[n]}${signe}`;

const ATOMES = [
  { nom: 'de zinc', symbole: 'Zn', n: 2, perd: true },
  { nom: 'de cuivre', symbole: 'Cu', n: 2, perd: true },
  { nom: 'de magnésium', symbole: 'Mg', n: 2, perd: true },
  { nom: 'de sodium', symbole: 'Na', n: 1, perd: true },
  { nom: 'd’aluminium', symbole: 'Al', n: 3, perd: true },
  { nom: 'de chlore', symbole: 'Cl', n: 1, perd: false },
  { nom: 'd’oxygène', symbole: 'O', n: 2, perd: false },
];

const PRECIPITES = [
  { couleur: 'bleu', bonne: 'Cu²⁺' },
  { couleur: 'vert', bonne: 'Fe²⁺' },
  { couleur: 'rouille', bonne: 'Fe³⁺' },
];

const TROISIEME = [
  ({ au }) => {
    const ph = au([1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13]);
    const bonne = ph < 7 ? 'Acide' : 'Basique';
    return {
      recit: 'Le premier bidon fuit sur le sol. Tu y trempes un papier pH, gants et lunettes en place.',
      question: `Le papier indique pH = ${ph}. Cette solution est… ?`,
      bonne,
      pieges: { [bonne === 'Acide' ? 'Basique' : 'Acide']: 'ph-sens', Neutre: 'ph-neutre' },
    };
  },
  ({ au }) => {
    const p = au(PRECIPITES);
    const pieges = {};
    PRECIPITES.filter((x) => x !== p).forEach((x) => {
      pieges[x.bonne] = p.bonne.startsWith('Fe') && x.bonne.startsWith('Fe') ? 'test-fer' : 'test-couleurs';
    });
    return {
      recit: 'Dans le deuxième bidon, une solution d’ions métalliques. Quelques gouttes de soude, et un précipité apparaît.',
      question: `Soude ajoutée : précipité ${p.couleur}. Quel ion contient la solution ?`,
      bonne: p.bonne,
      pieges,
    };
  },
  ({ au }) => ({
    recit: 'Le troisième bidon contient de l’acide chlorhydrique. Des copeaux de métal y sont tombés : ça mousse.',
    question: `${au(['Fer', 'Zinc'])} et acide chlorhydrique : le gaz dégagé détone à l’approche d’une flamme. Lequel ?`,
    bonne: 'Le dihydrogène',
    pieges: { 'Le dioxygène': 'gaz-dioxygene', 'Le dioxyde de carbone': 'gaz-dioxyde-carbone' },
  }),
  ({ au }) => {
    const a = au(ATOMES);
    const signe = a.perd ? '⁺' : '⁻';
    const inverse = a.perd ? '⁻' : '⁺';
    const autre = a.n === 1 ? 2 : a.n - 1;
    return {
      recit: 'Sur le tableau de l’atelier, une fiche explique comment un atome devient un ion.',
      question: `Un atome ${a.nom} ${a.perd ? 'perd' : 'gagne'} ${a.n === 1 ? 'un électron' : `${a.n} électrons`}. Quel ion se forme ?`,
      bonne: ion(a.symbole, a.n, signe),
      pieges: { [ion(a.symbole, a.n, inverse)]: 'ion-signe', [ion(a.symbole, autre, signe)]: 'ion-nombre' },
    };
  },
  ({ entre }) => {
    const p = entre(1, 6) * 500;
    const t = entre(2, 8);
    const e = (p * t) / 1000;
    return {
      recit: 'Les bidons sont identifiés. Avant de relancer, le chef d’atelier veut savoir ce qu’a consommé le chauffage de la nuit.',
      question: `Radiateur : P = ${nombre(p)} W ; durée : ${nombre(t)} h. Énergie consommée ?`,
      bonne: `${nombre(e)} kWh`,
      pieges: { [`${nombre(p * t)} kWh`]: 'conso-convertir', [`${nombre(e)} kW`]: 'conso-unite' },
    };
  },
  ({ entre }) => {
    const m = entre(1, 10) * 20;
    const v = entre(2, 6);
    return {
      recit: 'Le chariot de tri redémarre et file vers le quai. Le dernier cadenas veut son énergie cinétique.',
      question: `Chariot : m = ${nombre(m)} kg ; v = ${nombre(v)} m/s. Énergie cinétique ?`,
      bonne: `${nombre((m * v * v) / 2)} J`,
      pieges: { [`${nombre((m * v) / 2)} J`]: 'ec-carre', [`${nombre(m * v * v)} J`]: 'ec-demi' },
    };
  },
];

const HISTOIRES = {
  CINQUIEME: { prefixe: '5e', code: ['B', 'E', 'C', 'H', 'E', 'R'], etapes: CINQUIEME },
  QUATRIEME: { prefixe: '4e', code: ['A', 'P', 'O', 'L', 'L', 'O'], etapes: QUATRIEME },
  TROISIEME: { prefixe: '3e', code: ['C', 'U', 'I', 'V', 'R', 'E'], etapes: TROISIEME },
};

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
  const o = outils(graine);
  const h = HISTOIRES[niveau] ?? HISTOIRES.CINQUIEME;
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
  // 5e — les consignes
  '5e-etape-1': 'Premier cadenas : dis ce qu’est devenue la poudre versée dans l’eau.',
  '5e-etape-2': 'Deuxième cadenas : prévois ce qu’indiquera la balance.',
  '5e-etape-3': 'Troisième cadenas : dis quelle sorte de mélange contient le flacon.',
  '5e-etape-4': 'Quatrième cadenas : un fil est mal placé dans le circuit. Dis ce qui se passe.',
  '5e-etape-5': 'Cinquième cadenas : trouve l’objet qui produit sa propre lumière.',
  '5e-etape-6': 'Dernier cadenas : trouve le volume de la pièce de métal.',
  // 5e — les erreurs
  'dissolution-fusion': 'Fondre, c’est passer de l’état solide à l’état liquide en chauffant, comme la glace. Dans l’eau, le solide se dissout : il se disperse dans le liquide.',
  'dissolution-disparu': 'Il n’a pas disparu : il s’est dispersé dans l’eau, et la balance indique toujours la même masse totale.',
  'masse-diminue': 'En fondant, la glace change de volume, mais pas de masse : le flacon est bouché, rien ne se perd.',
  'masse-augmente': 'L’eau liquide n’est pas plus lourde que la glace dont elle vient : rien n’est entré dans le flacon, la masse reste la même.',
  'melange-voir': 'Homogène : on ne distingue plus les constituants à l’œil nu. Hétérogène : on en voit au moins deux.',
  'melange-corps-pur': 'Dès qu’il y a deux constituants, c’est un mélange, même s’il est limpide comme de l’eau pure.',
  'court-plus-fort': 'Le courant prend le chemin du fil, sans obstacle, et ne passe presque plus par la lampe : elle s’éteint.',
  'court-rien': 'Un fil branché aux bornes d’un dipôle le court-circuite : le courant passe par le fil, et la lampe s’éteint.',
  'court-danger': 'Sans rien pour freiner le courant, la pile débite un courant très intense : elle chauffe, et peut provoquer un incendie.',
  'court-recharge': 'Un fil ne rend aucune énergie à la pile : il la vide très vite, et le courant intense la fait chauffer.',
  'source-lune': 'La Lune ne produit pas de lumière : elle diffuse celle qu’elle reçoit du Soleil.',
  'source-diffusant': 'Un objet diffusant renvoie la lumière qu’il reçoit ; une source primaire produit elle-même sa lumière.',
  'volume-total': 'Le niveau final compte l’eau et la pièce : retire le volume d’eau du départ pour garder celui de la pièce.',
  'volume-unite': 'Un volume s’exprime en millilitres ou en centimètres cubes ; le gramme mesure une masse.',

  // 4e — les consignes
  '4e-etape-1': 'Premier cadenas : choisis le bon appareil et le bon branchement.',
  '4e-etape-2': 'Deuxième cadenas : calcule la tension avec la loi d’Ohm.',
  '4e-etape-3': 'Troisième cadenas : calcule ton poids sur la Lune.',
  '4e-etape-4': 'Quatrième cadenas : dis si le son peut voyager jusqu’à ta coéquipière.',
  '4e-etape-5': 'Cinquième cadenas : écris la formule de la molécule.',
  '4e-etape-6': 'Dernier cadenas : calcule la masse volumique de la pièce.',
  // 4e — les erreurs
  'mesure-appareil': 'La tension se mesure au voltmètre, l’intensité à l’ampèremètre : choisis l’appareil d’après la grandeur.',
  'mesure-voltmetre': 'Le voltmètre se branche en dérivation, aux deux bornes du dipôle ; c’est l’ampèremètre qui se place en série.',
  'mesure-amperemetre': 'L’ampèremètre se branche en série, dans la boucle, pour que tout le courant le traverse ; en dérivation, il ferait un court-circuit.',
  'ohm-convertir': 'Convertis d’abord l’intensité en ampères (mille milliampères font un ampère), puis multiplie par la résistance.',
  'ohm-diviser': 'La loi d’Ohm multiplie : la tension est égale à la résistance multipliée par l’intensité.',
  'poids-masse': 'Le poids n’est pas la masse. La masse, en kilogrammes, reste la même partout ; le poids, en newtons, est la masse multipliée par g.',
  'poids-unite': 'Un poids est une force : il s’exprime en newtons, jamais en kilogrammes.',
  'son-vide': 'Le son a besoin de matière pour se propager, de l’air, de l’eau ou un solide : dans le vide de la Lune, il ne passe pas.',
  'son-lent': 'Sans air, le son ne va pas plus lentement : il ne se propage pas du tout. C’est pour cela que les astronautes se parlent par radio.',
  'formule-indice': 'L’indice s’écrit en bas, juste après le symbole de l’atome qu’il compte.',
  'formule-un': 'Quand il n’y a qu’un atome d’une sorte, on n’écrit pas d’indice : le symbole seul suffit.',
  'mv-produit': 'La masse volumique, c’est la masse divisée par le volume : on divise, on ne multiplie pas.',
  'mv-unite': 'Des grammes divisés par des centimètres cubes donnent des grammes par centimètre cube : l’unité suit le calcul.',

  // 3e — les consignes
  '3e-etape-1': 'Premier cadenas : dis si la solution du bidon est acide ou basique.',
  '3e-etape-2': 'Deuxième cadenas : reconnais l’ion grâce à la couleur du précipité.',
  '3e-etape-3': 'Troisième cadenas : nomme le gaz qui se dégage.',
  '3e-etape-4': 'Quatrième cadenas : écris l’ion qui se forme.',
  '3e-etape-5': 'Cinquième cadenas : calcule l’énergie consommée par le radiateur.',
  '3e-etape-6': 'Dernier cadenas : calcule l’énergie cinétique du chariot.',
  // 3e — les erreurs
  'ph-sens': 'Sous sept, une solution est acide ; au-dessus de sept, elle est basique.',
  'ph-neutre': 'Neutre, c’est un pH égal à sept, celui de l’eau pure : compare le pH à sept.',
  'test-fer': 'Avec la soude, l’ion fer deux donne un précipité vert ; l’ion fer trois, un précipité couleur rouille.',
  'test-couleurs': 'Avec la soude, un précipité bleu signe l’ion cuivre ; vert, l’ion fer deux ; rouille, l’ion fer trois.',
  'gaz-dioxygene': 'Le dioxygène ravive une bûchette incandescente ; le gaz qui détone à la flamme, c’est le dihydrogène.',
  'gaz-dioxyde-carbone': 'Le dioxyde de carbone trouble l’eau de chaux ; le gaz qui détone à la flamme, c’est le dihydrogène.',
  'ion-signe': 'Un électron porte une charge négative : en perdre rend l’ion positif, en gagner le rend négatif.',
  'ion-nombre': 'La charge de l’ion compte les électrons perdus ou gagnés, un par un.',
  'conso-convertir': 'Convertis avant de calculer : la puissance en kilowatts, la durée en heures, et l’énergie sort en kilowattheures.',
  'conso-unite': 'Le kilowatt mesure une puissance ; une énergie consommée s’exprime en kilowattheures, la puissance multipliée par la durée.',
  'ec-carre': 'L’énergie cinétique, c’est la moitié de la masse multipliée par la vitesse au carré : n’oublie pas d’élever la vitesse au carré.',
  'ec-demi': 'N’oublie pas la moitié : l’énergie cinétique vaut la masse multipliée par le carré de la vitesse, le tout divisé par deux.',
};
