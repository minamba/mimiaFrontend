/**
 * LE GLOBE — se repérer sur la sphère terrestre, en 3e.
 * Professeure : Nora (mathématiques).
 *
 * Les coordonnées s'écrivent LATITUDE PUIS LONGITUDE : « 40° N ; 30° O »
 * (N, S, E, O : nord, sud, est, ouest). La latitude se compte depuis
 * l'équateur, jusqu'à 90° ; la longitude depuis le méridien de Greenwich,
 * jusqu'à 180°.
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - LIRE (3) : la position est dite en mots (et pas toujours dans l'ordre
 *     latitude puis longitude) ; on l'écrit en coordonnées. Pièges : les
 *     deux nombres échangés, le nord pris pour le sud, l'est pour l'ouest ;
 *   - LE VOYAGE (3) : un avion part d'un point et vole vers le nord, le sud,
 *     l'est ou l'ouest. Pièges : changer la mauvaise coordonnée, se tromper
 *     de sens (surtout quand on passe l'équateur ou Greenwich) ;
 *   - LES NOTIONS (2) : équateur, méridien de Greenwich, parallèles et
 *     méridiens, valeurs maximales.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'le-globe', titre: 'Le globe', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'Le globe',
    accroche: 'La latitude d’abord, puis la longitude.',
    competences: ['MATH_3E_REPERAGE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Latitude signée : positive au nord, négative au sud. « 40° N », « 0° ». */
export const latitude = (l) => (l === 0 ? '0°' : `${Math.abs(l)}° ${l > 0 ? 'N' : 'S'}`);
/** Longitude signée : positive à l'est, négative à l'ouest. « 30° O ». */
export const longitude = (g) => (g === 0 ? '0°' : `${Math.abs(g)}° ${g > 0 ? 'E' : 'O'}`);
/** « 40° N ; 30° O » : la latitude d'abord. */
export const coord = (l, g) => `${latitude(l)} ; ${longitude(g)}`;

/** Une manche : la bonne réponse, ses pièges (jamais justes), et des voisins s'il en manque. */
function monter(melanger, consigne, question, bonne, pieges, voisin) {
  const faux = pieges.filter(([v]) => v !== bonne);
  const cles = troisChoix(bonne, faux.map(([v]) => v), voisin);
  const lesPieges = {};
  faux.forEach(([v, phrase]) => {
    if (cles.includes(v) && !(v in lesPieges)) lesPieges[v] = phrase;
  });
  return {
    consigne, question, bonne, choix: melanger(cles).map((c) => ({ cle: c, libelle: c })), pieges: lesPieges,
  };
}

const signe = (entre, v) => (entre(0, 1) ? v : -v);

function lire({ entre, au, melanger }) {
  let l; let g;
  do {
    l = signe(entre, 5 * entre(1, 16));
    g = signe(entre, 5 * entre(1, 17));
  } while (Math.abs(l) === Math.abs(g));
  const parties = melanger([
    `${Math.abs(l)}° au ${l > 0 ? 'nord' : 'sud'} de l’équateur`,
    `${Math.abs(g)}° à l’${g > 0 ? 'est' : 'ouest'} du méridien de Greenwich`,
  ]);
  const inverse = au(['nord-sud', 'est-ouest']);
  return monter(
    melanger,
    'lire-globe',
    `Le navire est à ${parties[0]}, et à ${parties[1]}. Ses coordonnées ?`,
    coord(l, g),
    [
      [`${Math.abs(g)}° ${l > 0 ? 'N' : 'S'} ; ${Math.abs(l)}° ${g > 0 ? 'E' : 'O'}`, 'latitude-d-abord'],
      inverse === 'nord-sud' ? [coord(-l, g), 'nord-sud'] : [coord(l, -g), 'est-ouest'],
    ],
    (k) => coord(l + 5 * k * Math.sign(l), g),
  );
}

const DIRECTIONS = {
  nord: ['latitude', 1], sud: ['latitude', -1], est: ['longitude', 1], ouest: ['longitude', -1],
};
const VERS = {
  nord: 'vers le nord', sud: 'vers le sud', est: 'vers l’est', ouest: 'vers l’ouest',
};

function voyage({ entre, au, melanger }) {
  // Toutes les positions (la bonne et celles des pièges) restent de vraies
  // coordonnées : jamais sur l'équateur ni sur Greenwich, ni au-delà de 80°
  // de latitude ou de 170° de longitude.
  const dedans = ([lat, lon]) => lat !== 0 && lon !== 0 && Math.abs(lat) <= 80 && Math.abs(lon) <= 170;
  let l; let g; let dir; let d; let arrivee; let mauvaisAxe; let mauvaisSens;
  do {
    l = signe(entre, 5 * entre(1, 12));
    g = signe(entre, 5 * entre(1, 30));
    dir = au(Object.keys(DIRECTIONS));
    d = 5 * entre(2, 8);
    const [axe, sens] = DIRECTIONS[dir];
    if (axe === 'latitude') {
      arrivee = [l + sens * d, g];
      mauvaisAxe = [l, g + sens * d];
      mauvaisSens = [l - sens * d, g];
    } else {
      arrivee = [l, g + sens * d];
      mauvaisAxe = [l + sens * d, g];
      mauvaisSens = [l, g - sens * d];
    }
  } while (![arrivee, mauvaisAxe, mauvaisSens].every(dedans));
  const [axe] = DIRECTIONS[dir];
  const [l2, g2] = arrivee;
  const pieges = [
    [coord(...mauvaisAxe), axe === 'latitude' ? 'nord-sud-latitude' : 'est-ouest-longitude'],
    [coord(...mauvaisSens), axe === 'latitude' ? 'sens-nord-sud' : 'sens-est-ouest'],
  ];
  return monter(
    melanger,
    'voyage-globe',
    `Un avion part de ${coord(l, g)} et vole de ${d}° ${VERS[dir]}. Où arrive-t-il ?`,
    coord(l2, g2),
    pieges,
    (k) => coord(l2, g2 + 5 * k * Math.sign(g2)),
  );
}

/** Les notions : une banque écrite à la main, une seule réponse défendable chaque fois. */
export const NOTIONS = [
  {
    question: 'Tous les points de latitude 0° forment…',
    bonne: 'L’équateur',
    pieges: [['Le méridien de Greenwich', 'latitude-equateur'], ['Le pôle Nord', 'latitude-equateur']],
  },
  {
    question: 'Tous les points de longitude 0° forment…',
    bonne: 'Le méridien de Greenwich',
    pieges: [['L’équateur', 'longitude-greenwich'], ['Le pôle Sud', 'longitude-greenwich']],
  },
  {
    question: 'Quelle est la latitude du pôle Nord ?',
    bonne: '90° N',
    pieges: [['0°', 'latitude-equateur'], ['180° N', 'latitude-max']],
  },
  {
    question: 'Les points qui ont la même latitude forment…',
    bonne: 'Un parallèle',
    pieges: [['Un méridien', 'parallele-meridien']],
  },
  {
    question: 'Les points qui ont la même longitude forment…',
    bonne: 'Un méridien',
    pieges: [['Un parallèle', 'parallele-meridien']],
  },
  {
    question: 'La longitude d’un point va au plus jusqu’à…',
    bonne: '180° E ou O',
    pieges: [['90° E ou O', 'longitude-max'], ['360° E ou O', 'longitude-max']],
  },
  {
    question: 'La latitude d’un point va au plus jusqu’à…',
    bonne: '90° N ou S',
    pieges: [['180° N ou S', 'latitude-max'], ['360° N ou S', 'latitude-max']],
  },
];

function notion(n, melanger) {
  return {
    consigne: 'notions-globe',
    question: n.question,
    bonne: n.bonne,
    choix: melanger([n.bonne, ...n.pieges.map(([p]) => p)]).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(n.pieges),
  };
}

function troisieme(o) {
  const liste = [];
  for (let i = 0; i < 3; i += 1) liste.push(lire(o));
  for (let i = 0; i < 3; i += 1) liste.push(voyage(o));
  o.melanger(NOTIONS).slice(0, 2).forEach((n) => liste.push(notion(n, o.melanger)));
  return liste;
}

const BANQUES = { TROISIEME: troisieme };

export function serie(graine = Date.now(), niveau = 'TROISIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES[CLASSES[0]];
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // Les consignes.
  'lire-globe': 'Quelles sont les coordonnées de ce navire ?',
  'voyage-globe': 'L’avion se déplace sur le globe. Où arrive-t-il ?',
  'notions-globe': 'Réfléchis à la façon dont on se repère sur le globe.',

  // Les erreurs, chacune avec sa méthode.
  'latitude-d-abord': 'On écrit d’abord la latitude, au nord ou au sud de l’équateur, puis la longitude, à l’est ou à l’ouest de Greenwich.',
  'nord-sud': 'Relis de quel côté de l’équateur se trouve le navire : vers le pôle Nord, c’est le nord ; vers le pôle Sud, c’est le sud.',
  'est-ouest': 'Relis de quel côté du méridien de Greenwich se trouve le navire : l’est et l’ouest se comptent depuis lui.',
  'nord-sud-latitude': 'Aller vers le nord ou vers le sud change la latitude ; c’est vers l’est ou l’ouest que la longitude change.',
  'est-ouest-longitude': 'Aller vers l’est ou vers l’ouest change la longitude ; c’est vers le nord ou le sud que la latitude change.',
  'sens-nord-sud': 'Vers le nord, une latitude nord augmente et une latitude sud diminue ; vers le sud, c’est l’inverse. Si tu passes l’équateur, tu changes d’hémisphère.',
  'sens-est-ouest': 'Vers l’est, une longitude est augmente et une longitude ouest diminue ; vers l’ouest, c’est l’inverse. Si tu passes Greenwich, tu changes de côté.',
  'latitude-equateur': 'La latitude se compte depuis l’équateur : sur l’équateur, elle vaut zéro ; aux pôles, quatre-vingt-dix degrés.',
  'longitude-greenwich': 'La longitude se compte depuis le méridien de Greenwich, qui va d’un pôle à l’autre : sur lui, elle vaut zéro.',
  'latitude-max': 'De l’équateur à un pôle, il y a un quart de tour : la latitude va jusqu’à quatre-vingt-dix degrés, nord ou sud.',
  'longitude-max': 'Depuis Greenwich, on fait un demi-tour vers l’est ou vers l’ouest : la longitude va jusqu’à cent quatre-vingts degrés.',
  'parallele-meridien': 'Un parallèle relie les points de même latitude et tourne comme l’équateur ; un méridien relie les points de même longitude, d’un pôle à l’autre.',

  // Les replis.
  'lire-globe-regle': 'Écris la latitude, nord ou sud, puis la longitude, est ou ouest.',
  'voyage-globe-regle': 'Vers le nord ou le sud, seule la latitude change ; vers l’est ou l’ouest, seule la longitude change.',
  'notions-globe-regle': 'La latitude se compte depuis l’équateur, la longitude depuis le méridien de Greenwich.',
};
