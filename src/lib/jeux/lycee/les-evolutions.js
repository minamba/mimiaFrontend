/**
 * LES ÉVOLUTIONS — 1re et terminale technologiques (Nora).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   1re techno : MATH_1TEC_AUTO_EVOLUTION, MATH_1TEC_AUTO_TAUX_APPLIQUER,
 *                MATH_1TEC_AUTO_TAUX_SUCCESSIFS, MATH_1TEC_AUTO_TAUX_RECIPROQUE
 *   Tle techno : MATH_TTEC_EXPO_TAUX_MOYEN, MATH_TTEC_AUTO_EVOLUTION
 *
 * EN 1re TECHNO (sept sortes de manches, mélangées) :
 *   - LE TAUX entre deux valeurs. LES PIÈGES : diviser l'écart par la valeur
 *     d'arrivée, donner l'écart lui-même (la variation absolue) pour un taux,
 *     ou, quand cet écart dépasse 100, le coefficient pris pour le taux ;
 *   - LE COEFFICIENT MULTIPLICATEUR, dans les deux sens. LES PIÈGES : oublier
 *     le « 1 + » (0,07 pour une hausse de 7 %), lire 7 % comme 0,7, se tromper
 *     de sens (1,15 pour une baisse), lire 0,85 comme −85 % ;
 *   - APPLIQUER UN TAUX : valeur finale, valeur de départ. LES PIÈGES :
 *     ajouter le pourcentage comme des euros, donner la variation seule,
 *     appliquer le taux opposé pour revenir en arrière ;
 *   - LES ÉVOLUTIONS SUCCESSIVES. LES PIÈGES : additionner les taux, oublier
 *     d'enlever 1 au coefficient global ;
 *   - L'ÉVOLUTION RÉCIPROQUE (arrondie à 0,01 %). LES PIÈGES : le taux
 *     opposé, la bonne valeur avec le mauvais sens ;
 *   - LES INDICES BASE 100 : calculer un indice ; passer d'un indice à
 *     l'autre. LES PIÈGES : donner le taux pour l'indice, inverser le
 *     quotient, compter l'écart en points comme des pour cent, partir de la
 *     base au lieu de l'an dernier.
 *
 * EN TERMINALE TECHNO (quatre sortes) :
 *   - LE TAUX MOYEN d'une évolution globale sur n années (racine n-ième),
 *     arrondi au dixième ou au centième, la précision est dite. LES PIÈGES :
 *     diviser le taux global par n, élever à la puissance n ;
 *   - LE TAUX MOYEN de deux ou trois évolutions données. LES PIÈGES : la
 *     moyenne arithmétique des taux, l'évolution globale ;
 *   - L'ÉVOLUTION GLOBALE d'un taux répété. LES PIÈGES : n fois le taux,
 *     oublier d'enlever 1 ;
 *   - ADDITIF ↔ MULTIPLICATIF : « multiplié par 2,5 », « divisé par 4 »,
 *     « +150 % ».
 *
 * Toutes les bonnes réponses sont calculées ici ; un piège qui tomberait sur
 * la bonne réponse est écarté (il serait juste), et les tirages des taux
 * moyens sont refaits tant qu'un piège arrondi égale la bonne réponse.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'les-evolutions', titre: 'Les évolutions', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE_TECHNO: {
    titre: 'Les évolutions',
    accroche: 'Taux, coefficients, indices, réciproques.',
    competences: [
      'MATH_1TEC_AUTO_EVOLUTION', 'MATH_1TEC_AUTO_TAUX_APPLIQUER',
      'MATH_1TEC_AUTO_TAUX_SUCCESSIFS', 'MATH_1TEC_AUTO_TAUX_RECIPROQUE',
    ],
  },
  TERMINALE_TECHNO: {
    titre: 'Les évolutions',
    accroche: 'Le taux moyen, sans diviser par n.',
    competences: ['MATH_TTEC_EXPO_TAUX_MOYEN', 'MATH_TTEC_AUTO_EVOLUTION'],
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

/** « 4,5 », « 25 000 » : un nombre à la française, sans zéro inutile. */
function nombre(x) {
  const v = net(x);
  const [ent, dec] = String(Math.abs(v)).split('.');
  return `${v < 0 ? '−' : ''}${grouper(ent)}${dec ? `,${dec}` : ''}`;
}

/** Un arrondi affiché avec sa précision : « 6,30 » au centième. Toujours positif. */
function fixe(x, dec) {
  const [ent, d] = Math.abs(x).toFixed(dec).split('.');
  return `${grouper(ent)}${d ? `,${d}` : ''}`;
}

/** « +25 % », « −4 % », « 0 % » ; arrondi à `dec` décimales si `dec` est donné. */
function pourcent(x, dec) {
  const corps = dec === undefined ? nombre(Math.abs(x)) : fixe(x, dec);
  const nul = /^[0,]+$/.test(corps.replace(new RegExp(FINE, 'g'), ''));
  let signe = '';
  if (!nul) signe = x > 0 ? '+' : '−';
  return `${signe}${corps}${NB}%`;
}

/** Un montant arrondi au centime : « 12 € », « 7,50 € ». */
function euros(x) {
  const c = Math.round(net(x * 100));
  if (!(c > 0)) return null;
  if (c % 100 === 0) return `${nombre(c / 100)}${NB}€`;
  const [ent, d] = (c / 100).toFixed(2).split('.');
  return `${grouper(ent)},${d}${NB}€`;
}

const avec = (x, unite) => (unite === '€' ? euros(x) : `${nombre(x)}${NB}${unite}`);

/** « une hausse de 7 % », « une baisse de 20 % ». */
const evolution = (p) => (p > 0 ? `une hausse de ${nombre(p)}${NB}%` : `une baisse de ${nombre(-p)}${NB}%`);
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------------------------------------------------------- 1re techno */

const CONTEXTES = [
  ['Le prix d’un scooter', '€'],
  ['Le loyer d’un studio', '€'],
  ['L’effectif d’un lycée', 'élèves'],
  ['La production d’un atelier', 'pièces'],
  ['Le nombre d’adhérents d’un club', 'adhérents'],
];
const TAUX = [-40, -30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75];

function taux(t) {
  const [quoi, unite] = t.au(CONTEXTES);
  const depart = 20 * t.entre(3, 90);
  const p = t.au(TAUX);
  const arrivee = net((depart * (100 + p)) / 100);
  const ecart = net(arrivee - depart);
  const surArrivee = Math.round((ecart / arrivee) * 1000) / 10;
  return manche(t.melanger, {
    consigne: 'taux',
    question: `${quoi} passe de ${avec(depart, unite)} à ${avec(arrivee, unite)}. Taux d’évolution ?`,
    bonne: pourcent(p),
    // L'écart pris pour un taux ; s'il dépasse cent, le « taux » serait absurde : le coefficient pris pour le taux.
    pieges: [
      [pourcent(surArrivee), 'diviser-par-depart'],
      Math.abs(ecart) < 100 ? [pourcent(ecart), 'variation-absolue'] : [pourcent(100 + p), 'coefficient-moins-un'],
    ],
    voisin: (k) => pourcent(p + 5 * k),
  });
}

function coefficient(t) {
  const sorte = t.au(['hausse', 'baisse', 'lire']);
  if (sorte === 'lire') {
    let p;
    do {
      p = t.entre(-60, 90);
    } while (p === 0 || p === -50);
    const k = net(1 + p / 100);
    return manche(t.melanger, {
      consigne: 'coefficient',
      question: `Multiplier par ${nombre(k)} : quelle évolution ?`,
      bonne: pourcent(p),
      pieges: [
        [pourcent(p > 0 ? 100 + p : -(100 + p)), 'lire-le-coefficient'],
        [pourcent(-p), 'sens-du-coefficient'],
      ],
      voisin: (j) => pourcent(p + 10 * j),
    });
  }
  const p = t.entre(1, 60);
  if (sorte === 'hausse') {
    return manche(t.melanger, {
      consigne: 'coefficient',
      question: `${majuscule(evolution(p))} : par combien multiplie-t-on ?`,
      bonne: nombre(1 + p / 100),
      pieges: [
        [nombre(p / 100), 'coefficient-un-plus-t'],
        p < 10 ? [nombre(1 + p / 10), 'pourcentage-en-decimal'] : [nombre(1 - p / 100), 'sens-du-coefficient'],
      ],
      voisin: (j) => nombre(1 + (p + j) / 100),
    });
  }
  return manche(t.melanger, {
    consigne: 'coefficient',
    question: `${majuscule(evolution(-p))} : par combien multiplie-t-on ?`,
    bonne: nombre(1 - p / 100),
    pieges: [[nombre(1 + p / 100), 'sens-du-coefficient'], [nombre(p / 100), 'coefficient-un-plus-t']],
    voisin: (j) => nombre(1 - (p + j) / 100),
  });
}

const MONTANTS = [
  ['Un loyer', 'Nouveau loyer'],
  ['Un salaire', 'Nouveau salaire'],
  ['Un abonnement', 'Nouvel abonnement'],
  ['Une facture d’énergie', 'Nouvelle facture'],
];

function appliquer(sorte, t) {
  const depart = 20 * t.entre(3, 90);
  const p = t.au(TAUX);
  const arrivee = net((depart * (100 + p)) / 100);
  if (sorte === 'finale') {
    const [sujet, nouveau] = t.au(MONTANTS);
    return manche(t.melanger, {
      consigne: 'appliquer',
      question: `${sujet} de ${euros(depart)} ${p > 0 ? 'augmente' : 'baisse'} de ${nombre(Math.abs(p))}${NB}%. ${nouveau} ?`,
      bonne: euros(arrivee),
      pieges: [
        [euros(depart + p), 'pourcentage-pas-euros'],
        [euros(Math.abs(arrivee - depart)), 'part-pas-total'],
      ],
      voisin: (k) => euros(arrivee + 10 * k),
    });
  }
  return manche(t.melanger, {
    consigne: 'appliquer',
    question: `Après ${evolution(p)}, un prix vaut ${euros(arrivee)}. Prix de départ ?`,
    bonne: euros(depart),
    pieges: [
      [euros(arrivee * (1 - p / 100)), 'reciproque-pas-oppose'],
      [euros(arrivee - p), 'pourcentage-pas-euros'],
    ],
    voisin: (k) => euros(depart + 10 * k),
  });
}

const PAS = [-30, -20, -10, 10, 20, 30, 40, 50];

function successives(t) {
  const a = t.au(PAS);
  const b = t.au(PAS);
  const g = net(a + b + (a * b) / 100);
  return manche(t.melanger, {
    consigne: 'successives',
    question: `${majuscule(evolution(a))}, puis ${evolution(b)}. Évolution globale ?`,
    bonne: pourcent(g),
    pieges: [[pourcent(a + b), 'taux-ne-s-additionnent-pas'], [pourcent(100 + g), 'coefficient-moins-un']],
    voisin: (k) => pourcent(g + k),
  });
}

const RECIPROQUES = [-50, -40, -25, -20, -10, 10, 20, 25, 50, 100];

function reciproque(t) {
  const p = t.au(RECIPROQUES);
  const r = Math.round((100 / (100 + p) - 1) * 10000) / 100;
  return manche(t.melanger, {
    consigne: 'reciproque',
    question: `Après ${evolution(p)}, quelle évolution ramène à la valeur de départ ? (à 0,01${NB}% près)`,
    bonne: pourcent(r),
    pieges: [[pourcent(-p), 'reciproque-pas-oppose'], [pourcent(-r), 'sens-de-la-reciproque']],
    voisin: (k) => pourcent(r + k),
  });
}

const FREQUENTATIONS = ['visiteurs', 'clients', 'colis livrés', 'repas servis'];
const INDICES_DEPART = [80, 110, 120, 125, 150, 160, 200, 250];
const PAS_INDICE = [-20, -10, 5, 10, 20, 25];

function indice(sorte, t) {
  if (sorte === 'calcul') {
    let i;
    do {
      i = t.entre(70, 140);
    } while (i === 100);
    const v0 = 100 * t.entre(5, 90);
    const v1 = (v0 * i) / 100;
    const quoi = t.au(FREQUENTATIONS);
    return manche(t.melanger, {
      consigne: 'indice',
      question: `Année de base (indice 100) : ${nombre(v0)} ${quoi}. Cette année : ${nombre(v1)} ${quoi}. Indice de cette année ?`,
      bonne: nombre(i),
      pieges: [[nombre(i - 100), 'indice-pas-taux'], [nombre(Math.round(100000 / i) / 10), 'indice-a-l-envers']],
      voisin: (k) => nombre(i + k),
    });
  }
  const i1 = t.au(INDICES_DEPART);
  const p = t.au(PAS_INDICE);
  const i2 = net((i1 * (100 + p)) / 100);
  return manche(t.melanger, {
    consigne: 'indice',
    question: `Indices (base 100) : ${nombre(i1)} l’an dernier, ${nombre(i2)} cette année. Évolution sur un an ?`,
    bonne: pourcent(p),
    pieges: [[pourcent(i2 - i1), 'points-pas-pourcentage'], [pourcent(i2 - 100), 'base-pas-annee']],
    voisin: (k) => pourcent(p + 5 * k),
  });
}

/* ---------------------------------------------------------- terminale techno */

const GLOBAUX = [10, 15, 20, 25, 30, 40, 50, 60, 80, 100, -10, -15, -20, -25, -30, -40];
const SUJETS = [
  'Le chiffre d’affaires d’une entreprise',
  'La population d’une ville',
  'Le prix moyen du mètre carré',
  'Le nombre d’abonnés d’un service',
];
const precision = (dec) => `(arrondi à ${dec === 1 ? '0,1' : '0,01'}${NB}%)`;

function tauxMoyen(t) {
  let g;
  let n;
  let dec;
  let bonne;
  let divise;
  let puissance;
  do {
    g = t.au(GLOBAUX);
    n = Math.abs(g) >= 50 ? t.entre(2, 5) : t.entre(2, 10);
    dec = t.au([1, 2]);
    const c = 1 + g / 100;
    bonne = pourcent((c ** (1 / n) - 1) * 100, dec);
    divise = pourcent(g / n, dec);
    puissance = pourcent((c ** n - 1) * 100, dec);
  } while (bonne === divise || bonne === puissance);
  const sujet = t.au(SUJETS);
  return manche(t.melanger, {
    consigne: 'taux-moyen',
    question: `${sujet} ${g > 0 ? 'a augmenté' : 'a baissé'} de ${nombre(Math.abs(g))}${NB}% en ${n} ans. Taux annuel moyen ? ${precision(dec)}`,
    bonne,
    pieges: [[divise, 'diviser-le-taux'], [puissance, 'puissance-pas-racine']],
    voisin: (k) => pourcent(((1 + g / 100) ** (1 / n) - 1) * 100 + k, dec),
  });
}

function moyenEtapes(t) {
  let liste;
  let bonne;
  let moyenne;
  let global;
  do {
    const k = t.au([2, 3]);
    liste = Array.from({ length: k }, () => {
      const v = t.entre(-8, 15);
      return v === 0 ? 4 : v;
    });
    const c = liste.reduce((acc, p) => acc * (1 + p / 100), 1);
    bonne = pourcent((c ** (1 / liste.length) - 1) * 100, 2);
    moyenne = pourcent(liste.reduce((a, b) => a + b, 0) / liste.length, 2);
    global = pourcent((c - 1) * 100, 2);
  } while (new Set(liste).size === 1 || bonne === moyenne || bonne === global);
  const duree = liste.length === 2 ? 'deux' : 'trois';
  const c = liste.reduce((acc, p) => acc * (1 + p / 100), 1);
  return manche(t.melanger, {
    consigne: 'taux-moyen',
    question: `Sur ${duree} ans, un chiffre d’affaires évolue de ${liste.map((p) => pourcent(p)).join(' ; ')}. Taux annuel moyen ? ${precision(2)}`,
    bonne,
    pieges: [[moyenne, 'moyenne-arithmetique'], [global, 'global-pas-moyen']],
    voisin: (k) => pourcent((c ** (1 / liste.length) - 1) * 100 + k / 10, 2),
  });
}

const REPETES = ['un loyer', 'une production', 'un prix', 'une population'];

function tauxGlobal(t) {
  let m;
  let n;
  let dec;
  let bonne;
  let somme;
  let coef;
  do {
    m = t.entre(-6, 9);
    if (m === 0) m = 3;
    n = t.entre(3, 10);
    dec = t.au([1, 2]);
    const c = (1 + m / 100) ** n;
    bonne = pourcent((c - 1) * 100, dec);
    somme = pourcent(m * n, dec);
    coef = pourcent(c * 100, dec);
  } while (bonne === somme || bonne === coef);
  const quoi = t.au(REPETES);
  return manche(t.melanger, {
    consigne: 'taux-global',
    question: `Pendant ${n} ans, ${quoi} ${m > 0 ? 'augmente' : 'baisse'} de ${Math.abs(m)}${NB}% par an. Évolution globale ? ${precision(dec)}`,
    bonne,
    pieges: [[somme, 'taux-ne-s-additionnent-pas'], [coef, 'coefficient-moins-un']],
    voisin: (k) => pourcent(((1 + m / 100) ** n - 1) * 100 + k, dec),
  });
}

const MULTIPLIE = [1.2, 1.25, 1.5, 1.8, 2, 2.5, 3, 4, 0.4, 0.6, 0.75, 0.8, 0.9];
const DIVISE = [4, 5, 8, 10, 20, 25];
const HAUSSES = [80, 100, 120, 150, 200, 250, 300];

function additif(t) {
  const sorte = t.au(['multiplie', 'divise', 'hausse']);
  if (sorte === 'multiplie') {
    const k = t.au(MULTIPLIE);
    const p = net((k - 1) * 100);
    return manche(t.melanger, {
      consigne: 'additif-multiplicatif',
      question: `Une grandeur est multipliée par ${nombre(k)}. Évolution en pourcentage ?`,
      bonne: pourcent(p),
      pieges: k > 1
        ? [[pourcent(k * 100), 'coefficient-moins-un'], [pourcent(k), 'lire-le-coefficient']]
        : [[pourcent(-k * 100), 'lire-le-coefficient'], [pourcent(-p), 'sens-du-coefficient']],
      voisin: (j) => pourcent(p + 10 * j),
    });
  }
  if (sorte === 'divise') {
    const d = t.au(DIVISE);
    const p = net((1 / d - 1) * 100);
    return manche(t.melanger, {
      consigne: 'additif-multiplicatif',
      question: `Une grandeur est divisée par ${d}. Évolution en pourcentage ?`,
      bonne: pourcent(p),
      pieges: [[pourcent(-100 / d), 'lire-le-coefficient'], [pourcent(-d * 100), 'diviser-par-l-inverse']],
      voisin: (j) => pourcent(p + 5 * j),
    });
  }
  const p = t.au(HAUSSES);
  return manche(t.melanger, {
    consigne: 'additif-multiplicatif',
    question: `Une hausse de ${p}${NB}% : la grandeur est multipliée par combien ?`,
    bonne: nombre(1 + p / 100),
    pieges: [[nombre(p / 100), 'coefficient-un-plus-t']],
    voisin: (j) => nombre(1 + p / 100 + j / 2),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  let liste;
  if (niveau === 'TERMINALE_TECHNO') {
    liste = [
      tauxMoyen(t), tauxMoyen(t), tauxMoyen(t),
      moyenEtapes(t), moyenEtapes(t),
      tauxGlobal(t), tauxGlobal(t),
      additif(t),
    ];
  } else {
    liste = [
      taux(t), coefficient(t),
      appliquer(t.au(['finale', 'initiale']), t), appliquer(t.au(['finale', 'initiale']), t),
      successives(t), reciproque(t),
      indice(t.au(['calcul', 'evolution']), t),
      t.au([taux, coefficient, successives, reciproque])(t),
    ];
  }
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  taux: 'Calcule le taux d’évolution entre ces deux valeurs.',
  coefficient: 'Fais le lien entre le taux d’évolution et le coefficient multiplicateur.',
  appliquer: 'Applique le taux d’évolution, dans le bon sens.',
  successives: 'Enchaîne ces deux évolutions : quelle est l’évolution globale ?',
  reciproque: 'Quelle évolution annule exactement celle-ci ?',
  indice: 'Travaille avec les indices en base cent.',
  'taux-moyen': 'Trouve le taux moyen qui, répété à chaque étape, donne la même évolution globale.',
  'taux-global': 'Le même taux, répété chaque année : quelle évolution au total ?',
  'additif-multiplicatif': 'Passe du coefficient multiplicateur au pourcentage, ou l’inverse.',

  'diviser-par-depart': 'Un taux d’évolution se calcule par rapport à la valeur de départ : divise l’écart par la valeur initiale, pas par la valeur finale.',
  'variation-absolue': 'L’écart entre les deux valeurs est une variation absolue, dans leur unité. Pour obtenir un taux, divise cet écart par la valeur de départ.',
  'coefficient-un-plus-t': 'Le coefficient multiplicateur, c’est un plus le taux en écriture décimale, négatif pour une baisse : n’oublie pas le un.',
  'pourcentage-en-decimal': 'Pour écrire un pourcentage en décimal, on divise par cent : sept pour cent, c’est zéro virgule zéro sept.',
  'sens-du-coefficient': 'Une hausse donne un coefficient plus grand que un, une baisse un coefficient plus petit que un.',
  'lire-le-coefficient': 'Le coefficient n’est pas le taux : enlève un au coefficient, puis multiplie par cent.',
  'coefficient-moins-un': 'Tu as donné le coefficient, pas l’évolution : enlève un, puis multiplie par cent.',
  'pourcentage-pas-euros': 'Un pourcentage n’est pas un montant : multiplie la valeur par le coefficient multiplicateur.',
  'part-pas-total': 'Tu as trouvé la variation seule : ajoute-la à la valeur de départ, ou retire-la, selon le sens.',
  'reciproque-pas-oppose': 'Revenir en arrière, ce n’est pas appliquer le taux opposé : on divise par le coefficient multiplicateur.',
  'sens-de-la-reciproque': 'Après une baisse, il faut remonter, et après une hausse, redescendre : la réciproque change de sens.',
  'taux-ne-s-additionnent-pas': 'Des taux successifs ne s’additionnent pas : on multiplie les coefficients multiplicateurs.',
  'indice-pas-taux': 'L’indice n’est pas le taux : c’est cent fois la valeur, divisée par la valeur de l’année de base.',
  'indice-a-l-envers': 'La valeur de l’année de base va au dénominateur : cent fois la nouvelle valeur, divisée par la valeur de base.',
  'points-pas-pourcentage': 'Un écart entre deux indices se compte en points, pas en pour cent : divise le nouvel indice par l’ancien.',
  'base-pas-annee': 'Ce taux part de l’année de base. Ici, on part de l’indice de l’an dernier : divise par lui.',
  'diviser-le-taux': 'Le taux moyen ne s’obtient pas en divisant par le nombre d’années : prends la racine n-ième du coefficient global, puis enlève un.',
  'puissance-pas-racine': 'Pour un taux moyen, on prend la racine n-ième du coefficient global, pas sa puissance.',
  'moyenne-arithmetique': 'La moyenne des taux ne convient pas : multiplie les coefficients, prends la racine n-ième, puis enlève un.',
  'diviser-par-l-inverse': 'Diviser une grandeur, c’est la multiplier par l’inverse du diviseur : prends cet inverse comme coefficient, puis enlève un.',
  'global-pas-moyen': 'C’est l’évolution globale. On demande le taux moyen par an : prends la racine n-ième du coefficient global.',

  'taux-regle': 'Taux d’évolution : valeur d’arrivée moins valeur de départ, le tout divisé par la valeur de départ.',
  'coefficient-regle': 'Coefficient multiplicateur : un plus le taux en écriture décimale.',
  'appliquer-regle': 'Pour aller vers l’arrivée, multiplie par le coefficient ; pour revenir au départ, divise par ce coefficient.',
  'successives-regle': 'Multiplie les coefficients multiplicateurs, puis enlève un pour retrouver le taux global.',
  'reciproque-regle': 'Le coefficient réciproque est l’inverse du coefficient : un divisé par le coefficient, puis enlève un.',
  'indice-regle': 'Un indice, c’est cent fois le quotient de la valeur par la valeur de l’année de base.',
  'taux-moyen-regle': 'Coefficient global, puis sa racine n-ième, puis enlève un : c’est le taux moyen.',
  'taux-global-regle': 'Élève le coefficient multiplicateur à la puissance du nombre d’années, puis enlève un.',
  'additif-multiplicatif-regle': 'Évolution en pourcentage égale coefficient moins un, multiplié par cent.',
};
