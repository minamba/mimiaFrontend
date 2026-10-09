/**
 * L'ESCAPE GAME DE SCIENCES DE LA 6e — Yann. La base martienne Arès s'est
 * mise en sommeil : six cadenas à ouvrir pour la rallumer et appeler la Terre.
 *
 * SIX ÉTAPES, DANS L'ORDRE DU RÉCIT (on ne mélange que les choix) :
 *   1. le réservoir — nommer un changement d'état (SC_6E_MAT_ETATS) ; pièges :
 *      le changement inverse, et la dissolution prise pour une fusion ;
 *   2. l'eau de fonte — la masse se conserve, le volume change
 *      (SC_6E_MAT_MASSE_VOLUME) ; pièges : « la masse baisse », « elle monte » ;
 *   3. la serre — au microscope, des cellules (SC_6E_VIV_CELLULE) ; pièges :
 *      « des atomes », « une plante n'a pas de cellules » ;
 *   4. le drone — v = d ÷ t (SC_6E_MAT_MOUVEMENT) ; pièges : multiplier,
 *      se tromper d'unité ;
 *   5. le tableau électrique — le symbole normalisé (SC_6E_ENERGIE_CIRCUIT) ;
 *      pièges : le symbole d'un autre dipôle, le dessin réaliste ;
 *   6. la Terre dans le hublot — saisons ou phases de la Lune
 *      (SC_6E_TERRE_SOLAIRE) ; pièges : « la Terre est plus proche du Soleil
 *      en été », « l'ombre de la Terre cache la Lune ».
 *
 * Les nombres sont tirés et les réponses calculées ici, jamais recopiées.
 */

import { bilan as bilanCommun, outils } from '../outils.js';

export const FAMILLE = { cle: 'escape-sciences', titre: 'Escape game : la base martienne', matiereCode: 'SCIENCES' };

export const ESCAPE = true;

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La base martienne',
    accroche: 'Six cadenas pour rallumer la base sur Mars.',
    intro: 'La base Arès, sur Mars, s’est mise en sommeil pendant la tempête de poussière. Ouvre ses six cadenas en scientifique pour la rallumer et appeler la Terre.',
    fin: 'Le code ORBITE rallume la base : la Terre a reçu ton message.',
    competences: [
      'SC_6E_MAT_ETATS',
      'SC_6E_MAT_MASSE_VOLUME',
      'SC_6E_VIV_CELLULE',
      'SC_6E_MAT_MOUVEMENT',
      'SC_6E_ENERGIE_CIRCUIT',
      'SC_6E_TERRE_SOLAIRE',
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

const ETATS = [
  {
    question: 'La glace du réservoir devient de l’eau liquide. Quel changement d’état ?',
    bonne: 'La fusion',
    pieges: { 'La solidification': 'etat-sens', 'La dissolution': 'etat-dissolution' },
  },
  {
    question: 'L’eau d’un tuyau devient de la glace dans le froid. Quel changement d’état ?',
    bonne: 'La solidification',
    pieges: { 'La fusion': 'etat-sens', 'La dissolution': 'etat-dissolution' },
  },
  {
    question: 'L’eau liquide chauffée devient de la vapeur. Quel changement d’état ?',
    bonne: 'La vaporisation',
    pieges: { 'La liquéfaction': 'etat-sens', 'La fusion': 'etat-noms' },
  },
];

const ECHANTILLONS = ['un morceau de feuille de laitue', 'une fine peau d’oignon', 'une feuille d’élodée'];

const SYMBOLES = {
  lampe: { nom: 'la lampe', symbole: 'Un cercle barré d’une croix', dessin: 'Une ampoule dessinée' },
  moteur: { nom: 'le moteur', symbole: 'Un cercle avec la lettre M', dessin: 'Un moteur dessiné' },
  pile: { nom: 'la pile', symbole: 'Un grand trait et un petit trait', dessin: 'Une pile dessinée' },
};

const CIEL = [
  {
    question: 'Pourquoi y a-t-il des saisons sur Terre ?',
    bonne: 'L’axe de la Terre est incliné',
    pieges: { 'La Terre s’approche du Soleil en été': 'saisons-distance', 'Le Soleil chauffe plus fort en été': 'saisons-soleil' },
  },
  {
    question: 'Pourquoi la Lune change-t-elle d’aspect au fil du mois ?',
    bonne: 'On voit plus ou moins sa face éclairée',
    pieges: { 'L’ombre de la Terre la cache': 'phases-ombre', 'Des nuages passent devant elle': 'phases-nuages' },
  },
];

const ETAPES = [
  ({ au }) => ({
    recit: 'Le sas s’ouvre sur la salle des réservoirs, glaciale. Un écran clignote : « État de l’eau ? »',
    ...au(ETATS),
  }),
  ({ entre }) => {
    const m = entre(4, 20) * 50;
    const k = m / 10;
    return {
      recit: 'La glace du réservoir a fini de fondre dans sa cuve fermée. La balance de contrôle attend ta réponse.',
      question: `Glace dans la cuve : ${nombre(m)} g. Masse de l’eau liquide après fusion ?`,
      bonne: `${nombre(m)} g`,
      pieges: { [`${nombre(m - k)} g`]: 'masse-diminue', [`${nombre(m + k)} g`]: 'masse-augmente' },
    };
  },
  ({ au }) => ({
    recit: 'Dans la serre, les laitues ont tenu bon. Le microscope est réglé sur un échantillon.',
    question: `Au microscope, ${au(ECHANTILLONS)} : que vois-tu ?`,
    bonne: 'Des cellules',
    pieges: { 'Des atomes': 'cellule-atomes', 'Aucune cellule : c’est une plante': 'cellule-plante' },
  }),
  ({ entre }) => {
    const v = entre(2, 10);
    const t = entre(3, 12);
    const d = v * t;
    return {
      recit: 'Le drone d’exploration revient du cratère. Son enregistreur a noté la distance et la durée du vol.',
      question: `Le drone parcourt ${nombre(d)} m en ${nombre(t)} s. Sa vitesse moyenne ?`,
      bonne: `${nombre(d / t)} m/s`,
      pieges: { [`${nombre(d * t)} m/s`]: 'vitesse-produit', [`${nombre(d / t)} km/h`]: 'vitesse-unite' },
    };
  },
  ({ au }) => {
    const dipole = au(Object.keys(SYMBOLES));
    const autre = au(Object.keys(SYMBOLES).filter((x) => x !== dipole));
    return {
      recit: 'Au tableau électrique, le schéma du circuit est effacé par endroits. Il faut le redessiner aux normes.',
      question: `Sur un schéma normalisé, comment dessine-t-on ${SYMBOLES[dipole].nom} ?`,
      bonne: SYMBOLES[dipole].symbole,
      pieges: { [SYMBOLES[autre].symbole]: 'symbole-confondu', [SYMBOLES[dipole].dessin]: 'symbole-dessin' },
    };
  },
  ({ au }) => ({
    recit: 'L’antenne est réparée. Par le hublot, la Terre brille ; l’ordinateur pose sa dernière question avant d’émettre.',
    ...au(CIEL),
  }),
];

const CODE = ['O', 'R', 'B', 'I', 'T', 'E'];

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const o = outils(graine);
  const prefixe = { SIXIEME: '6e' }[niveau] ?? '6e';
  return ETAPES.map((etape, i) => {
    const { recit, question, bonne, pieges } = etape(o);
    return {
      consigne: `${prefixe}-etape-${i + 1}`,
      recit,
      question,
      choix: o.melanger([bonne, ...Object.keys(pieges)]).map((c) => ({ cle: c, libelle: c })),
      bonne,
      pieges,
      cadenas: { avant: CODE.slice(0, i), piece: CODE[i], total: MANCHES },
    };
  });
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  '6e-etape-1': 'Premier cadenas : nomme le changement d’état qui se produit dans le réservoir.',
  '6e-etape-2': 'Deuxième cadenas : trouve la masse de l’eau obtenue.',
  '6e-etape-3': 'Troisième cadenas : dis ce que montre le microscope.',
  '6e-etape-4': 'Quatrième cadenas : calcule la vitesse moyenne du drone.',
  '6e-etape-5': 'Cinquième cadenas : retrouve le bon symbole du schéma électrique.',
  '6e-etape-6': 'Dernier cadenas : choisis l’explication juste, celle d’un astronome.',

  'etat-sens': 'Tu as trouvé le changement inverse : regarde l’état du début, puis l’état de la fin.',
  'etat-dissolution': 'Une dissolution, c’est un solide qui se disperse dans un liquide, comme le sucre dans l’eau. Ici, l’eau seule change d’état.',
  'etat-noms': 'Fusion : de solide à liquide. Solidification : de liquide à solide. Vaporisation : de liquide à gaz. Liquéfaction : de gaz à liquide.',
  'masse-diminue': 'En fondant, la glace change de volume, mais pas de masse : la cuve est fermée, rien ne se perd.',
  'masse-augmente': 'L’eau liquide n’est pas plus lourde que la glace dont elle vient : rien n’est entré dans la cuve, la masse reste la même.',
  'cellule-atomes': 'Les atomes sont bien trop petits pour un microscope du collège : ce qu’il montre, ce sont les cellules, briques de tout être vivant.',
  'cellule-plante': 'Une plante est un être vivant : comme un animal, elle est faite de cellules.',
  'vitesse-produit': 'La vitesse, c’est la distance divisée par la durée : on divise, on ne multiplie pas.',
  'vitesse-unite': 'Des mètres divisés par des secondes donnent des mètres par seconde : l’unité suit le calcul.',
  'symbole-confondu': 'Chaque dipôle a son symbole : la lampe, un cercle barré d’une croix ; le moteur, un cercle avec la lettre M ; la pile, un grand trait et un petit trait.',
  'symbole-dessin': 'Un schéma normalisé ne dessine pas l’objet tel qu’il est : il utilise un symbole simple, le même pour tout le monde.',
  'saisons-distance': 'La distance au Soleil change très peu, et la Terre en est même au plus près en janvier : les saisons viennent de l’inclinaison de son axe.',
  'saisons-soleil': 'Le Soleil brille autant toute l’année. En été, l’axe penché de la Terre fait arriver ses rayons plus droits sur notre hémisphère.',
  'phases-ombre': 'L’ombre de la Terre ne touche la Lune que pendant une éclipse. Les phases viennent de la part de sa face éclairée par le Soleil que l’on voit depuis la Terre.',
  'phases-nuages': 'Les nuages ne suivent pas le calendrier de la Lune : ses phases viennent de la part de sa face éclairée par le Soleil que l’on voit depuis la Terre.',
};
