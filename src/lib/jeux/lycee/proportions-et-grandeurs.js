/**
 * PROPORTIONS ET GRANDEURS — voie professionnelle : 2de, 1re et terminale (Nora).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (colonne NIVEAU de competences-lycee.txt) :
 *   2de pro : MATH_2PRO_PROP_COMMERCE (prix et coûts par proportionnalité),
 *             MATH_2PRO_GEO_GRANDEURS (longueurs, aires, volumes et leurs unités).
 *   1re pro : MATH_1PRO_GEO_ESPACE (grandeurs d'un solide : contenances,
 *             remplissages). Le fichier n'a, en 1re pro, AUCUN code de
 *             proportionnalité ni de grandeurs composées : c'est le plus proche.
 *   Tle pro : MATH_TPRO_LOG_DECIMAL (le logarithme décimal et ses propriétés,
 *             appliqué aux grandeurs à échelle logarithmique : décibels, pH).
 *             Pas de code de proportionnalité non plus en terminale pro.
 *
 * EN 2de PRO, SIX SORTES DE MANCHES, dans des situations d'atelier, de
 * chantier, de livraison et de boutique :
 *   - LA QUATRIÈME PROPORTIONNELLE (câble, peinture, beurre, heures payées).
 *     LES PIÈGES : ajouter l'écart au lieu de multiplier, le rapport à
 *     l'envers ;
 *   - L'ÉCHELLE d'un plan, dans les deux sens. LES PIÈGES : oublier de
 *     convertir les centimètres en mètres, multiplier au lieu de diviser ;
 *   - LES CONVERSIONS : mètres cubes et litres, mètres carrés et centimètres
 *     carrés, kilogrammes et tonnes. LES PIÈGES : un zéro par rang pour une
 *     aire ou un volume ;
 *   - LES DURÉES : heures décimales ↔ heures et minutes. LE PIÈGE : une heure
 *     de cent minutes ;
 *   - LES VITESSES : vitesse, distance, durée. LES PIÈGES : 45 min lues
 *     0,45 h, multiplier au lieu de diviser ;
 *   - LES DÉBITS : remplir une cuve, un débit horaire. LES PIÈGES : oublier
 *     que 1 m³ = 1 000 L, des minutes lues comme des heures, un débit par
 *     minute pris pour un débit par heure.
 *
 * EN 1re PRO, UN CRAN AU-DESSUS : des grandeurs composées, en plusieurs étapes.
 *   - REMPLIR UNE CUVE : le volume d'un pavé, en litres, puis la durée au
 *     débit de la pompe. LES PIÈGES : un mètre cube pris pour cent litres,
 *     des minutes lues comme des heures (150 min → « 1 h 50 min ») ;
 *   - UN DÉBIT EN m³/h à partir de L/min. LES PIÈGES : oublier les soixante
 *     minutes de l'heure, oublier les mille litres du mètre cube ;
 *   - m/s ↔ km/h. LE PIÈGE : oublier le facteur 3,6, ou le prendre à l'envers ;
 *   - LA VITESSE MOYENNE sur deux étapes. LE PIÈGE : la moyenne des vitesses ;
 *   - L'AIRE RÉELLE d'une pièce sur un plan. LES PIÈGES : appliquer l'échelle
 *     à l'aire au lieu de son carré, cent centimètres carrés pour un mètre carré ;
 *   - LA CONTENANCE d'un bac aux dimensions en m et en cm. LES PIÈGES :
 *     multiplier sans convertir, des centimètres cubes pris pour des litres ;
 *   - LE COÛT DE MAIN-D'ŒUVRE d'une durée en heures et minutes. LE PIÈGE :
 *     2 h 15 min lu 2,15 h.
 *
 * EN TERMINALE PRO, LES GRANDEURS À ÉCHELLE LOGARITHMIQUE :
 *   - DES MACHINES IDENTIQUES ensemble (L + 10 log n). LES PIÈGES : additionner
 *     les décibels, croire que le niveau ne bouge pas ;
 *   - UN ÉCART DE DÉCIBELS → le facteur d'intensité (10 dB = × 10), et
 *     L'INVERSE. LE PIÈGE : lire l'échelle comme si elle était proportionnelle ;
 *   - LE pH d'une concentration a × 10⁻ᵏ. LES PIÈGES : oublier le signe moins,
 *     oublier le log de a, l'ajouter au lieu de le retrancher ;
 *   - LE pH QUAND LA CONCENTRATION est divisée ou multipliée par une puissance
 *     de dix. LES PIÈGES : le sens, multiplier le pH.
 *
 * Tout est calculé ici ; un piège qui tomberait sur la bonne réponse est écarté.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'proportions-et-grandeurs', titre: 'Proportions et grandeurs', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE_PRO: {
    titre: 'Proportions et grandeurs',
    accroche: 'Proportions, échelles, unités, débits.',
    competences: ['MATH_2PRO_PROP_COMMERCE', 'MATH_2PRO_GEO_GRANDEURS'],
  },
  PREMIERE_PRO: {
    titre: 'Proportions et grandeurs',
    accroche: 'Débits, vitesses, plans, en plusieurs temps.',
    competences: ['MATH_1PRO_GEO_ESPACE'],
  },
  TERMINALE_PRO: {
    titre: 'Proportions et grandeurs',
    accroche: 'Décibels et pH : l’échelle logarithmique.',
    competences: ['MATH_TPRO_LOG_DECIMAL'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Espace insécable, devant une unité ; espace fine, entre les milliers. */
const NB = ' ';
const FINE = ' ';

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && String(v) !== b);
  const liste = troisChoix(b, valides.map(([v]) => String(v)), (k) => String(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = String(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  return {
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
}

const net = (x) => Math.round(x * 1e6) / 1e6;
const grouper = (ent) => (ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, FINE) : ent);

/** « 4,5 », « 25 000 » : un nombre à la française. */
function nombre(x) {
  const v = net(x);
  const [ent, dec] = String(Math.abs(v)).split('.');
  return `${v < 0 ? '−' : ''}${grouper(ent)}${dec ? `,${dec}` : ''}`;
}

/** Un nombre et son unité, sans coupure. Null s'il n'est pas positif. */
const avec = (x, unite) => (net(x) > 0 ? `${nombre(x)}${NB}${unite}` : null);

/** Un montant arrondi au centime : « 12 € », « 7,50 € ». */
function euros(x) {
  const c = Math.round(net(x * 100));
  if (!(c > 0)) return null;
  if (c % 100 === 0) return `${nombre(c / 100)}${NB}€`;
  const [ent, d] = (c / 100).toFixed(2).split('.');
  return `${grouper(ent)},${d}${NB}€`;
}

/** « 2 h 30 min », « 2 h », « 45 min » à partir d'un nombre entier de minutes. */
function hm(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}${NB}min`;
  return m === 0 ? `${h}${NB}h` : `${h}${NB}h ${m}${NB}min`;
}

/** Des heures et des minutes écrites telles quelles : « 1 h 50 min ». */
const hmBrut = (h, m) => (m === 0 ? `${h}${NB}h` : `${h}${NB}h ${m}${NB}min`);

const unDixieme = (x) => Number.isInteger(net(x * 10));

/* ------------------------------------------------- quatrième proportionnelle */

const SITUATIONS = [
  {
    // Le prix d'un mètre de câble, en euros.
    unites: [0.8, 1.2, 1.5, 2.4, 3.6, 4.5],
    question: (q1, v1, q2) => `${q1}${NB}m de câble coûtent ${euros(v1)}. Prix de ${q2}${NB}m ?`,
    valeur: euros,
  },
  {
    // Les mètres carrés couverts par un litre de peinture.
    unites: [8, 10, 12],
    question: (q1, v1, q2) => `${q1}${NB}L de peinture couvrent ${avec(v1, 'm²')}. Surface couverte par ${q2}${NB}L ?`,
    valeur: (x) => avec(Math.round(x * 10) / 10, 'm²'),
  },
  {
    // Les grammes de beurre d'une tarte.
    unites: [80, 100, 120, 150],
    question: (q1, v1, q2) => `Pour ${q1} tartes, il faut ${avec(v1, 'g')} de beurre. Pour ${q2} tartes ?`,
    valeur: (x) => avec(Math.round(x * 10) / 10, 'g'),
  },
  {
    // Le salaire horaire d'un apprenti.
    unites: [6.9, 7.25, 8.5, 9.6, 10.15],
    question: (q1, v1, q2) => `Pour ${q1}${NB}h de travail, un apprenti touche ${euros(v1)}. Pour ${q2}${NB}h ?`,
    valeur: euros,
  },
];

function quatrieme(t) {
  const s = t.au(SITUATIONS);
  const u = t.au(s.unites);
  const q1 = t.entre(2, 9);
  let q2 = t.entre(2, 15);
  if (q2 === q1) q2 += 3;
  const v1 = net(q1 * u);
  const bonne = net(q2 * u);
  return manche(t.melanger, {
    consigne: 'quatrieme',
    question: s.question(q1, v1, q2),
    bonne: s.valeur(bonne),
    pieges: [
      [s.valeur(v1 + q2 - q1), 'ajouter-l-ecart'],
      [s.valeur((v1 * q1) / q2), 'rapport-a-l-envers'],
    ],
    voisin: (k) => s.valeur(bonne + k * u),
  });
}

/* ----------------------------------------------------------------- échelle */

const ECHELLES = [20, 50, 100, 200, 250, 500];

function echelle(versLeReel, t) {
  const e = t.au(ECHELLES);
  if (versLeReel) {
    const plan = t.entre(4, 50) / 2;
    const reel = (plan * e) / 100;
    return manche(t.melanger, {
      consigne: 'echelle',
      question: `Plan à l’échelle 1/${e} : un mur y mesure ${avec(plan, 'cm')}. Longueur réelle ?`,
      bonne: avec(reel, 'm'),
      pieges: [[avec(plan * e, 'm'), 'convertir-cm-en-m'], [avec((plan * e) / 10, 'm'), 'convertir-cm-en-m']],
      voisin: (k) => avec(reel + k, 'm'),
    });
  }
  let reel;
  let plan;
  do {
    reel = t.entre(4, 60) / 2;
    plan = (reel * 100) / e;
  } while (!Number.isInteger(net(plan * 100)));
  return manche(t.melanger, {
    consigne: 'echelle',
    question: `Plan à l’échelle 1/${e} : une pièce mesure ${avec(reel, 'm')} en vrai. Longueur sur le plan ?`,
    bonne: avec(plan, 'cm'),
    pieges: [[avec(reel * e, 'cm'), 'diviser-par-l-echelle'], [avec(reel / e, 'cm'), 'convertir-m-en-cm']],
    voisin: (k) => avec(plan + k, 'cm'),
  });
}

/* ------------------------------------------------------------- conversions */

function conversion(sorte, t) {
  if (sorte === 'metres-cubes') {
    const v = t.entre(3, 95) / 10;
    return manche(t.melanger, {
      consigne: 'conversion',
      question: `Une cuve contient ${avec(v, 'm³')}. Combien de litres ?`,
      bonne: avec(v * 1000, 'L'),
      pieges: [[avec(v * 100, 'L'), 'litre-decimetre-cube'], [avec(v * 10, 'L'), 'litre-decimetre-cube']],
      voisin: (k) => avec(v * 1000 * (k + 1) * 10, 'L'),
    });
  }
  if (sorte === 'litres') {
    const l = 25 * t.entre(2, 80);
    return manche(t.melanger, {
      consigne: 'conversion',
      question: `Un réservoir contient ${avec(l, 'L')}. Combien de mètres cubes ?`,
      bonne: avec(l / 1000, 'm³'),
      pieges: [[avec(l / 100, 'm³'), 'litre-decimetre-cube'], [avec(l / 10, 'm³'), 'litre-decimetre-cube']],
      voisin: (k) => avec(l / (1000 * 10 ** k), 'm³'),
    });
  }
  if (sorte === 'aire') {
    const a = t.entre(12, 95) / 10;
    return manche(t.melanger, {
      consigne: 'conversion',
      question: `Une plaque de ${avec(a, 'm²')} : combien de centimètres carrés ?`,
      bonne: avec(a * 10000, 'cm²'),
      pieges: [[avec(a * 100, 'cm²'), 'aire-carre'], [avec(a * 1000, 'cm²'), 'aire-carre']],
      voisin: (k) => avec(a * 10000 * 10 ** k, 'cm²'),
    });
  }
  const kg = 50 * t.entre(3, 90);
  return manche(t.melanger, {
    consigne: 'conversion',
    question: `Une palette pèse ${avec(kg, 'kg')}. Combien de tonnes ?`,
    bonne: avec(kg / 1000, 't'),
    pieges: [[avec(kg / 100, 't'), 'masse-tonne'], [avec(kg / 10, 't'), 'masse-tonne']],
    voisin: (k) => avec(kg / (1000 * 10 ** k), 't'),
  });
}

/* ------------------------------------------------------------------ durées */

const PARTS_D_HEURE = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
const MINUTES_RONDES = [6, 12, 15, 18, 24, 30, 36, 45, 48, 54];

function duree(versMinutes, t) {
  const h = t.entre(1, 5);
  if (versMinutes) {
    const part = t.au(PARTS_D_HEURE);
    const decimal = net(h + part);
    const minutes = Math.round(part * 60);
    const lues = Math.round(part * 100);
    return manche(t.melanger, {
      consigne: 'duree',
      question: `Un chantier dure ${avec(decimal, 'h')}. En heures et minutes ?`,
      bonne: hmBrut(h, minutes),
      pieges: [[hmBrut(h, lues), 'heures-decimales'], [`${Math.round(decimal * 100)}${NB}min`, 'heures-decimales']],
      voisin: (k) => hmBrut(h, minutes + 5 * k),
    });
  }
  const m = t.au(MINUTES_RONDES);
  return manche(t.melanger, {
    consigne: 'duree',
    question: `Une intervention dure ${h}${NB}h ${m}${NB}min. En heures décimales ?`,
    bonne: avec(h + m / 60, 'h'),
    pieges: [[avec(h + m / 100, 'h'), 'heures-decimales'], [avec((60 * h + m) / 100, 'h'), 'heures-decimales']],
    voisin: (k) => avec(h + m / 60 + k / 10, 'h'),
  });
}

/* ---------------------------------------------------------------- vitesses */

function vitesse(sorte, t) {
  if (sorte === 'vitesse') {
    let v;
    let m;
    let d;
    do {
      v = t.entre(20, 90);
      m = t.au([15, 20, 30, 40, 45, 50, 75, 80, 90]);
      d = (v * m) / 60;
    } while (!unDixieme(d));
    return manche(t.melanger, {
      consigne: 'vitesse',
      question: `Un livreur parcourt ${avec(d, 'km')} en ${m}${NB}min. Vitesse moyenne ?`,
      bonne: avec(v, 'km/h'),
      pieges: [
        [avec(Math.round((d / (m / 100)) * 10) / 10, 'km/h'), 'heures-decimales'],
        [avec(Math.round(((d * m) / 60) * 10) / 10, 'km/h'), 'vitesse-distance-sur-temps'],
      ],
      voisin: (k) => avec(v + 5 * k, 'km/h'),
    });
  }
  if (sorte === 'distance') {
    let v;
    let h;
    let m;
    let d;
    do {
      v = t.entre(30, 110);
      h = t.entre(1, 3);
      m = t.au([10, 15, 20, 30, 40, 45, 50]);
      d = v * (h + m / 60);
    } while (!unDixieme(d));
    return manche(t.melanger, {
      consigne: 'vitesse',
      question: `Un camion roule à ${v}${NB}km/h pendant ${h}${NB}h ${m}${NB}min. Distance parcourue ?`,
      bonne: avec(d, 'km'),
      pieges: [
        [avec(v * (h + m / 100), 'km'), 'heures-decimales'],
        [avec(Math.round((v / (h + m / 60)) * 10) / 10, 'km'), 'vitesse-distance-sur-temps'],
      ],
      voisin: (k) => avec(d + 10 * k, 'km'),
    });
  }
  let v;
  let total;
  let d;
  do {
    v = t.au([40, 45, 50, 60, 72, 80, 90]);
    total = 60 * t.entre(1, 3) + t.au([6, 12, 15, 18, 24, 30]);
    d = (v * total) / 60;
  } while (!Number.isInteger(d));
  // La durée en heures décimales, lue comme des heures et des minutes : 2,5 h → « 2 h 50 min ».
  const heures = Math.floor(total / 60);
  const lues = Math.round(((total % 60) / 60) * 100);
  return manche(t.melanger, {
    consigne: 'vitesse',
    question: `Un trajet de ${avec(d, 'km')} à ${v}${NB}km/h de moyenne. Durée ?`,
    bonne: hm(total),
    pieges: [[hmBrut(heures, lues), 'heures-decimales']],
    voisin: (k) => hm(total + 5 * k),
  });
}

/* ------------------------------------------------------------------ débits */

const DEBITS = [10, 12, 15, 20, 25, 30, 40, 50];
const DUREES_POMPE = [100, 105, 110, 120, 125, 130, 135, 140, 145, 150, 155];

function debit(sorte, t) {
  if (sorte === 'remplir') {
    const q = t.au(DEBITS);
    const total = t.au(DUREES_POMPE);
    const v = (q * total) / 1000;
    return manche(t.melanger, {
      consigne: 'debit',
      question: `Une pompe débite ${q}${NB}L/min. Durée pour remplir une cuve de ${avec(v, 'm³')} ?`,
      bonne: hm(total),
      pieges: [
        [hmBrut(Math.floor(total / 100), total % 100), 'minutes-en-heures'],
        [avec(v / q, 'min'), 'litre-decimetre-cube'],
      ],
      voisin: (k) => hm(total + 10 * k),
    });
  }
  const v = t.au([6, 8, 10, 12, 15, 18, 20, 24, 30]);
  const m = t.au([2, 3, 4, 5, 6]);
  return manche(t.melanger, {
    consigne: 'debit',
    question: `Un robinet remplit un seau de ${v}${NB}L en ${m}${NB}min. Débit en L/h ?`,
    bonne: avec((60 * v) / m, 'L/h'),
    pieges: [[avec(Math.round((v / m) * 100) / 100, 'L/h'), 'debit-par-heure'], [avec(v * m, 'L/h'), 'debit-quotient']],
    voisin: (k) => avec((60 * v) / m + 30 * k, 'L/h'),
  });
}

/* ------------------------------------------- 1re pro : grandeurs composées */

const LONGUEURS_CUVE = [1.2, 1.5, 2, 2.5, 3];
const LARGEURS_CUVE = [0.8, 1, 1.2, 1.5, 2];
const HAUTEURS_CUVE = [0.5, 0.8, 1, 1.2, 1.5];
const DEBITS_POMPE = [20, 25, 30, 40, 50, 60, 75, 80, 100];

/** Le volume d'une cuve en pavé, puis la durée pour la remplir. */
function remplirCuve(t) {
  let lo;
  let la;
  let h;
  let q;
  let total;
  do {
    lo = t.au(LONGUEURS_CUVE);
    la = t.au(LARGEURS_CUVE);
    h = t.au(HAUTEURS_CUVE);
    q = t.au(DEBITS_POMPE);
    total = Math.round(lo * la * h * 1000) / q;
    // Une durée entière, d'au moins cent minutes, dont la lecture « à la centaine » reste une heure valide.
  } while (!Number.isInteger(total) || total < 100 || total > 600 || total % 100 >= 60);
  return manche(t.melanger, {
    consigne: 'debit',
    question: `Une cuve en forme de pavé mesure ${avec(lo, 'm')} × ${avec(la, 'm')} × ${avec(h, 'm')}. Une pompe la remplit à ${q}${NB}L/min. Durée du remplissage ?`,
    bonne: hm(total),
    pieges: [
      [hmBrut(Math.floor(total / 100), total % 100), 'minutes-en-heures'],
      [avec(total / 10, 'min'), 'litre-decimetre-cube'],
    ],
    voisin: (k) => hm(total + 10 * k),
  });
}

const DEBITS_MINUTE = [50, 100, 125, 150, 200, 250, 300, 400, 500, 750];

/** Un débit en litres par minute, converti en mètres cubes par heure. */
function debitHoraire(t) {
  const q = t.au(DEBITS_MINUTE);
  const bonne = (q * 60) / 1000;
  return manche(t.melanger, {
    consigne: 'debit',
    question: `Une pompe de chantier débite ${q}${NB}L/min. Son débit en m³/h ?`,
    bonne: avec(bonne, 'm³/h'),
    pieges: [[avec(q / 1000, 'm³/h'), 'debit-par-heure'], [avec(q * 60, 'm³/h'), 'litre-decimetre-cube']],
    voisin: (k) => avec(bonne + k, 'm³/h'),
  });
}

const VITESSES_CHARIOT = [0.5, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5];

/** Des mètres par seconde aux kilomètres par heure, ou l'inverse. */
function metresParSeconde(versKmh, t) {
  if (versKmh) {
    let v;
    let s;
    do {
      v = t.au(VITESSES_CHARIOT);
      s = t.au([10, 20, 30, 40, 50, 60]);
    } while (!Number.isInteger(net(v * s)));
    const bonne = v * 3.6;
    return manche(t.melanger, {
      consigne: 'vitesse',
      question: `Un chariot filoguidé parcourt ${nombre(v * s)}${NB}m en ${s}${NB}s. Sa vitesse en km/h ?`,
      bonne: avec(bonne, 'km/h'),
      pieges: [[avec(v, 'km/h'), 'metres-par-seconde'], [avec(Math.round((v / 3.6) * 100) / 100, 'km/h'), 'metres-par-seconde']],
      voisin: (k) => avec(bonne + k, 'km/h'),
    });
  }
  const ms = t.au([5, 10, 15, 20, 25, 30]);
  const v = ms * 3.6;
  return manche(t.melanger, {
    consigne: 'vitesse',
    question: `Un camion roule à ${nombre(v)}${NB}km/h. Sa vitesse en m/s ?`,
    bonne: avec(ms, 'm/s'),
    pieges: [[avec(v * 3.6, 'm/s'), 'metres-par-seconde'], [avec((v * 1000) / 60, 'm/s'), 'metres-par-seconde']],
    voisin: (k) => avec(ms + 5 * k, 'm/s'),
  });
}

const VITESSES_ETAPE = [30, 40, 45, 50, 60, 80, 90];
const DISTANCES_ETAPE = [10, 15, 20, 30, 40, 45, 60];

/** Deux étapes à deux vitesses : la vitesse moyenne n'est pas la moyenne des vitesses. */
function vitesseMoyenne(t) {
  let d1;
  let v1;
  let d2;
  let v2;
  let minutes;
  let vm;
  do {
    d1 = t.au(DISTANCES_ETAPE);
    v1 = t.au(VITESSES_ETAPE);
    d2 = t.au(DISTANCES_ETAPE);
    v2 = t.au(VITESSES_ETAPE);
    minutes = (60 * d1) / v1 + (60 * d2) / v2;
    vm = ((d1 + d2) * 60) / minutes;
    // Des étapes de durées différentes, sinon la moyenne des vitesses serait juste.
  } while (v1 === v2 || (d1 * v2 === d2 * v1) || !Number.isInteger(net(minutes)) || !unDixieme(vm)
    || Math.abs(vm - (v1 + v2) / 2) < 0.5);
  return manche(t.melanger, {
    consigne: 'vitesse',
    question: `Une livreuse roule ${d1}${NB}km à ${v1}${NB}km/h, puis ${d2}${NB}km à ${v2}${NB}km/h. Vitesse moyenne sur tout le trajet ?`,
    bonne: avec(vm, 'km/h'),
    pieges: [[avec((v1 + v2) / 2, 'km/h'), 'moyenne-des-vitesses']],
    voisin: (k) => avec(vm + 4 * k, 'km/h'),
  });
}

/** L'aire réelle d'une pièce mesurée sur un plan : l'échelle s'applique à chaque longueur. */
function echelleAire(t) {
  const e = t.au([20, 50, 100, 200]);
  const a = t.entre(4, 16);
  let b = t.entre(3, 12);
  if (b === a) b += 1;
  const aire = (a * b * e * e) / 10000;
  return manche(t.melanger, {
    consigne: 'echelle',
    question: `Plan à l’échelle 1/${e} : une pièce y mesure ${a}${NB}cm sur ${b}${NB}cm. Aire réelle ?`,
    bonne: avec(aire, 'm²'),
    pieges: [[avec((a * b * e) / 10000, 'm²'), 'echelle-aire'], [avec((a * b * e * e) / 100, 'm²'), 'aire-carre']],
    voisin: (k) => avec(aire * 10 ** k, 'm²'),
  });
}

/** La contenance d'un bac dont les dimensions sont en mètres et en centimètres. */
function contenanceBac(t) {
  const lo = t.au([0.8, 1, 1.2, 1.5, 2]);
  const la = t.au([30, 40, 50, 60]);
  const h = t.au([20, 25, 30, 40, 50]);
  // En décimètres : (10 lo) × (la / 10) × (h / 10) litres.
  const litres = (lo * la * h) / 10;
  return manche(t.melanger, {
    consigne: 'conversion',
    question: `Un bac mesure ${avec(lo, 'm')} × ${la}${NB}cm × ${h}${NB}cm. Contenance en litres ?`,
    bonne: avec(litres, 'L'),
    pieges: [[avec(lo * la * h, 'L'), 'meme-unite'], [avec(lo * 100 * la * h, 'L'), 'litre-decimetre-cube']],
    voisin: (k) => avec(litres * 10 ** -k, 'L'),
  });
}

const TAUX_HORAIRES = [28, 32, 35, 38, 42, 45, 48, 55];

/** Le coût d'une intervention : la durée en heures décimales, fois le taux horaire. */
function coutMainDOeuvre(t) {
  const h = t.entre(1, 4);
  const m = t.au(MINUTES_RONDES);
  const taux = t.au(TAUX_HORAIRES);
  const bonne = (h + m / 60) * taux;
  return manche(t.melanger, {
    consigne: 'quatrieme',
    question: `Une intervention dure ${h}${NB}h ${m}${NB}min ; la main-d’œuvre est facturée ${euros(taux)} de l’heure. Coût de la main-d’œuvre ?`,
    bonne: euros(bonne),
    pieges: [[euros((h + m / 100) * taux), 'heures-decimales'], [euros(((60 * h + m) / 100) * taux), 'heures-decimales']],
    voisin: (k) => euros(bonne + 5 * k),
  });
}

function seriePremiere(t) {
  return [
    remplirCuve(t), debitHoraire(t),
    metresParSeconde(t.au([true, false]), t), vitesseMoyenne(t),
    echelleAire(t), contenanceBac(t), coutMainDOeuvre(t),
    t.au([remplirCuve, echelleAire, contenanceBac, coutMainDOeuvre])(t),
  ];
}

/* ------------------------------- terminale pro : les échelles logarithmiques */

const EXPOSANTS = {
  0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
};
/** « 10⁻⁵ ». */
const dixPuissanceMoins = (k) => `10⁻${String(k).split('').map((c) => EXPOSANTS[c]).join('')}`;

/** Un pH au dixième, toujours avec sa décimale : « 4,7 », « 5,0 », « −4,7 ». */
const auDixieme = (x) => `${x < 0 ? '−' : ''}${Math.abs(Math.round(x * 10) / 10).toFixed(1).replace('.', ',')}`;

const MACHINES = [2, 3, 4, 5, 8, 10];

/** n machines identiques : le niveau gagne 10 log n décibels. */
function decibelsSources(t) {
  const niveau = t.entre(60, 90);
  const n = t.au(MACHINES);
  const total = niveau + Math.round(10 * Math.log10(n));
  return manche(t.melanger, {
    consigne: 'decibels',
    question: `Une machine seule produit un niveau sonore de ${niveau}${NB}dB. Niveau de ${n} machines identiques en marche ensemble, arrondi à l’unité ?`,
    bonne: `${total}${NB}dB`,
    pieges: [[`${n * niveau}${NB}dB`, 'decibels-ne-s-ajoutent-pas'], [`${niveau}${NB}dB`, 'decibels-ne-s-ajoutent-pas']],
    voisin: (k) => `${total + k}${NB}dB`,
  });
}

/** Un écart de niveaux, en dizaines de décibels : l'intensité est multipliée par une puissance de dix. */
function decibelsFacteur(t) {
  const depart = t.entre(40, 80);
  const m = t.entre(1, 4);
  const fois = (x) => `× ${nombre(x)}`;
  return manche(t.melanger, {
    consigne: 'decibels',
    question: `Le niveau sonore d’un atelier passe de ${depart}${NB}dB à ${depart + 10 * m}${NB}dB. Par combien son intensité sonore est-elle multipliée ?`,
    bonne: fois(10 ** m),
    pieges: [[fois(10 * m), 'echelle-logarithmique'], [fois(m), 'echelle-logarithmique']],
    voisin: (k) => fois(10 ** (m + k)),
  });
}

/** Une intensité multipliée : le niveau gagne 10 log du facteur. */
function decibelsEcart(t) {
  const f = t.au([2, 10, 100, 1000]);
  const gain = Math.round(10 * Math.log10(f));
  return manche(t.melanger, {
    consigne: 'decibels',
    question: `L’intensité sonore d’une machine est multipliée par ${nombre(f)}. De combien de décibels son niveau augmente-t-il${f === 2 ? ', arrondi à l’unité' : ''} ?`,
    bonne: `${gain}${NB}dB`,
    pieges: [[`${nombre(f)}${NB}dB`, 'echelle-logarithmique'], [`${nombre(Math.round(Math.log10(f) * 10) / 10)}${NB}dB`, 'echelle-logarithmique']],
    voisin: (k) => `${gain + 10 * k}${NB}dB`,
  });
}

/** Le pH d'une concentration a × 10⁻ᵏ : k − log a. */
function phConcentration(t) {
  const k = t.entre(2, 12);
  const a = t.au([1, 1, 2, 3, 4, 5, 6, 8]);
  const ph = k - Math.log10(a);
  const concentration = a === 1 ? dixPuissanceMoins(k) : `${a} × ${dixPuissanceMoins(k)}`;
  return manche(t.melanger, {
    consigne: 'ph',
    question: `Une solution a une concentration en ions H₃O⁺ de ${concentration}${NB}mol/L. Son pH, arrondi au dixième ?`,
    bonne: auDixieme(ph),
    pieges: [
      [auDixieme(-ph), 'ph-signe-moins'],
      [a === 1 ? null : auDixieme(k), 'log-du-produit'],
      [a === 1 ? null : auDixieme(k + Math.log10(a)), 'log-du-produit'],
    ],
    voisin: (j) => auDixieme(ph + j),
  });
}

/** La concentration divisée ou multipliée par 10ᵐ : le pH bouge de m. */
function phVariation(t) {
  const m = t.entre(1, 3);
  const divisee = t.au([true, false]);
  const augmente = `Il augmente de ${m}`;
  const diminue = `Il diminue de ${m}`;
  return manche(t.melanger, {
    consigne: 'ph',
    question: `La concentration en ions H₃O⁺ d’une solution est ${divisee ? 'divisée' : 'multipliée'} par ${nombre(10 ** m)}. Que devient son pH ?`,
    bonne: divisee ? augmente : diminue,
    pieges: [
      [divisee ? diminue : augmente, 'ph-signe-moins'],
      [`Il est ${divisee ? 'divisé' : 'multiplié'} par ${nombre(10 ** m)}`, 'echelle-logarithmique'],
    ],
    voisin: (k) => `Il ${divisee ? 'augmente' : 'diminue'} de ${m + k}`,
  });
}

function serieTerminale(t) {
  return [
    decibelsSources(t), decibelsSources(t),
    decibelsFacteur(t), decibelsEcart(t),
    phConcentration(t), phConcentration(t), phVariation(t),
    t.au([decibelsFacteur, decibelsEcart, phVariation])(t),
  ];
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  if (niveau === 'PREMIERE_PRO') return t.melanger(seriePremiere(t));
  if (niveau === 'TERMINALE_PRO') return t.melanger(serieTerminale(t));
  const [c1, c2] = t.melanger(['metres-cubes', 'litres', 'aire', 'masse']);
  const liste = [
    quatrieme(t), quatrieme(t),
    echelle(t.au([true, false]), t),
    conversion(c1, t), conversion(c2, t),
    duree(t.au([true, false]), t),
    vitesse(t.au(['vitesse', 'distance', 'duree']), t),
    debit(t.au(['remplir', 'horaire']), t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  quatrieme: 'C’est une situation de proportionnalité : trouve la quatrième proportionnelle.',
  echelle: 'Utilise l’échelle du plan, et surveille les unités.',
  conversion: 'Convertis dans l’unité demandée.',
  duree: 'Passe des heures décimales aux heures et minutes, ou l’inverse.',
  vitesse: 'Vitesse, distance, durée : prends la bonne relation, avec la durée en heures.',
  debit: 'Travaille avec le débit, en surveillant les unités.',

  'ajouter-l-ecart': 'En proportionnalité, on n’ajoute pas l’écart : on multiplie. Passe par la valeur pour une unité.',
  'rapport-a-l-envers': 'Ton rapport est à l’envers : quand la quantité augmente, le résultat augmente aussi. Multiplie par la nouvelle quantité, divise par l’ancienne.',
  'convertir-cm-en-m': 'Le calcul avec l’échelle donne des centimètres : divise par cent pour avoir des mètres.',
  'diviser-par-l-echelle': 'Du réel vers le plan, on rapetisse : divise la longueur réelle par le nombre de l’échelle.',
  'convertir-m-en-cm': 'La longueur réelle est en mètres : convertis-la en centimètres, en multipliant par cent, avant de diviser.',
  'litre-decimetre-cube': 'Un litre, c’est un décimètre cube, et un mètre cube vaut mille litres.',
  'aire-carre': 'Pour une aire, chaque rang d’unité compte deux zéros : un mètre carré vaut dix mille centimètres carrés.',
  'masse-tonne': 'Une tonne vaut mille kilogrammes : divise par mille.',
  'heures-decimales': 'Une heure compte soixante minutes, pas cent : une demi-heure, c’est zéro virgule cinq heure, soit trente minutes.',
  'vitesse-distance-sur-temps': 'La vitesse, c’est la distance divisée par la durée ; la distance, c’est la vitesse multipliée par la durée.',
  'minutes-en-heures': 'Pour passer des minutes aux heures, on divise par soixante, pas par cent.',
  'debit-par-heure': 'Ce débit est par minute : une heure compte soixante minutes, multiplie par soixante.',
  'debit-quotient': 'Un débit, c’est un volume divisé par une durée, pas multiplié.',

  'quatrieme-regle': 'Calcule la valeur pour une unité, puis multiplie par la quantité demandée.',
  'echelle-regle': 'Longueur réelle égale longueur sur le plan fois le nombre de l’échelle, dans la même unité ; convertis ensuite.',
  'conversion-regle': 'Longueur : un zéro par rang ; aire : deux ; volume : trois. Et un mètre cube vaut mille litres.',
  'duree-regle': 'Multiplie la partie décimale par soixante pour avoir des minutes ; divise des minutes par soixante pour avoir des heures.',
  'vitesse-regle': 'Distance égale vitesse fois durée, avec la durée en heures décimales.',
  'debit-regle': 'Volume égale débit fois durée : convertis volumes et durées dans les unités du débit.',

  // 1re pro : les grandeurs composées.
  'metres-par-seconde': 'Un mètre par seconde, c’est trois virgule six kilomètres par heure : une heure compte trois mille six cents secondes, un kilomètre mille mètres. Des mètres par seconde aux kilomètres par heure, on multiplie ; dans l’autre sens, on divise.',
  'moyenne-des-vitesses': 'La vitesse moyenne n’est pas la moyenne des vitesses : calcule la durée de chaque étape, puis divise la distance totale par la durée totale.',
  'echelle-aire': 'Sur un plan, les longueurs sont multipliées par le nombre de l’échelle, mais les aires par son carré : passe d’abord chaque longueur en vraie grandeur, puis multiplie.',
  'meme-unite': 'Avant de multiplier, mets les trois longueurs dans la même unité, en décimètres de préférence : un décimètre cube, c’est un litre.',

  // Terminale pro : les échelles logarithmiques.
  decibels: 'Le niveau sonore se mesure en décibels, sur une échelle logarithmique : raisonne en puissances de dix.',
  ph: 'Calcule avec le pH, l’opposé du logarithme décimal de la concentration en ions oxonium.',
  'decibels-ne-s-ajoutent-pas': 'Les décibels ne s’additionnent pas : ce sont les intensités qui s’ajoutent. Avec n machines identiques, le niveau gagne dix fois le logarithme de n ; deux machines, environ trois décibels de plus.',
  'echelle-logarithmique': 'Sur une échelle logarithmique, on compte les puissances de dix : une intensité multipliée par dix, c’est dix décibels de plus ; une concentration multipliée par dix, une unité de pH en moins.',
  'ph-signe-moins': 'Le pH, c’est moins le logarithme de la concentration : pour une concentration plus petite que un, il est positif, et quand la concentration baisse, le pH monte.',
  'log-du-produit': 'Le logarithme d’un produit est la somme des logarithmes : le log de a fois dix puissance moins k vaut log a moins k ; le pH en est l’opposé.',
  'decibels-regle': 'Niveau sonore : dix fois le logarithme décimal du rapport des intensités. Une intensité multipliée par dix, c’est dix décibels de plus.',
  'ph-regle': 'Le pH vaut moins le logarithme décimal de la concentration en ions oxonium : une concentration divisée par dix, c’est un pH augmenté de un.',
};
