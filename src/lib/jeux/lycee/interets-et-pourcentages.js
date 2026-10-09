/**
 * INTÉRÊTS ET POURCENTAGES — 2de et 1re professionnelles (Nora).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   2de pro : MATH_2PRO_PROP_COMMERCE, MATH_2PRO_PROP_FACTURE,
 *             MATH_2PRO_PROP_INTERET, MATH_2PRO_PROP_PLACEMENT
 *   1re pro : MATH_1PRO_SUITE_MODELISER, MATH_1PRO_SUITE_RECONNAITRE,
 *             MATH_1PRO_SUITE_TERME — le référentiel n'a pas de code de
 *             pourcentages en 1re pro : les placements y sont modélisés par
 *             des suites (intérêts simples : arithmétique ; composés :
 *             géométrique).
 *
 * EN 2de PRO (sept sortes de manches, dans des situations de commerce,
 * d'atelier et de salaire) :
 *   - LA REMISE, LA TVA (HT → TTC et TTC → HT), L'AUGMENTATION DE SALAIRE.
 *     LES PIÈGES : retirer le pourcentage comme des euros, donner la remise
 *     ou la taxe seule, retirer 20 % du TTC pour retrouver le HT ;
 *   - LE TAUX DE REMISE. LES PIÈGES : l'écart en euros pris pour un taux,
 *     diviser par le prix payé ;
 *   - LES INTÉRÊTS SIMPLES ET LA VALEUR ACQUISE, en années ou en mois. LES
 *     PIÈGES : oublier la durée, compter les mois comme des années,
 *     confondre intérêts et valeur acquise ;
 *   - LE PLACEMENT : retrouver le taux ou le capital. LES PIÈGES : le taux
 *     sur toute la durée, oublier la durée.
 *
 * EN 1re PRO (trois sortes) :
 *   - LE CAPITAL ACQUIS, à intérêts simples ou composés. LES PIÈGES :
 *     confondre les deux modèles, un an de moins ;
 *   - RECONNAÎTRE une suite arithmétique, géométrique, ou ni l'une ni
 *     l'autre, sur trois capitaux successifs ;
 *   - LA RAISON de la suite des capitaux. LES PIÈGES : le modèle, le taux
 *     pris pour la raison, oublier le « 1 + ».
 *
 * EN TERMINALE PRO (quatre sortes) — logarithme, exponentielle, sommes :
 *   Tle pro : MATH_TPRO_LOG_DUREE, MATH_TPRO_EXPO_TAUX, MATH_TPRO_SUITE_SOMME,
 *             MATH_TPRO_EXPO_FONCTION
 *   - LA DURÉE D'UN PLACEMENT à intérêts composés (doubler, tripler,
 *     atteindre une somme) : le premier entier n tel que C × qⁿ ≥ objectif.
 *     LES PIÈGES : le calcul à intérêts simples, un an de moins (arrondir la
 *     solution vers le bas) ;
 *   - LE TAUX ANNUEL MOYEN d'une évolution globale sur n années, au centième
 *     de pour cent. LES PIÈGES : diviser le taux global par n, élever le
 *     coefficient à la puissance n au lieu de un sur n ;
 *   - LE TOTAL ÉPARGNÉ par des versements en progression arithmétique. LES
 *     PIÈGES : le dernier versement seul, oublier de diviser par deux ;
 *   - LE CAPITAL C(x) = C₀ × qˣ au bout de x années. LES PIÈGES : le modèle
 *     à intérêts simples, un an de moins.
 *
 * Tout est calculé ici, au centime ; un piège qui tomberait sur la bonne
 * réponse est écarté.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'interets-et-pourcentages', titre: 'Intérêts et pourcentages', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE_PRO: {
    titre: 'Intérêts et pourcentages',
    accroche: 'Remises, TVA, intérêts simples.',
    competences: [
      'MATH_2PRO_PROP_COMMERCE', 'MATH_2PRO_PROP_FACTURE',
      'MATH_2PRO_PROP_INTERET', 'MATH_2PRO_PROP_PLACEMENT',
    ],
  },
  PREMIERE_PRO: {
    titre: 'Intérêts et pourcentages',
    accroche: 'Simples ou composés : quelle suite ?',
    competences: ['MATH_1PRO_SUITE_MODELISER', 'MATH_1PRO_SUITE_RECONNAITRE', 'MATH_1PRO_SUITE_TERME'],
  },
  TERMINALE_PRO: {
    titre: 'Intérêts et pourcentages',
    accroche: 'Taux moyen, durée d’un placement, sommes.',
    competences: ['MATH_TPRO_LOG_DUREE', 'MATH_TPRO_EXPO_TAUX', 'MATH_TPRO_SUITE_SOMME', 'MATH_TPRO_EXPO_FONCTION'],
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

/** Un montant arrondi au centime : « 12 € », « 7,50 € ». Null s'il n'est pas positif. */
function euros(x) {
  const c = Math.round(net(x * 100));
  if (!(c > 0)) return null;
  if (c % 100 === 0) return `${nombre(c / 100)}${NB}€`;
  const [ent, d] = (c / 100).toFixed(2).split('.');
  return `${grouper(ent)},${d}${NB}€`;
}

const pc = (x) => `${nombre(x)}${NB}%`;

/* ---------------------------------------------------------------- 2de pro */

const ARTICLES = [
  'Une perceuse', 'Une caisse à outils', 'Un casque de chantier',
  'Une paire de chaussures de sécurité', 'Un lot de pinceaux', 'Une blouse de travail',
];
const REMISES = [5, 10, 15, 20, 25, 30, 40];

function remise(t) {
  const prix = t.entre(45, 300);
  const r = t.au(REMISES);
  const paye = (prix * (100 - r)) / 100;
  return manche(t.melanger, {
    consigne: 'remise',
    question: `${t.au(ARTICLES)} à ${euros(prix)}, remise de ${pc(r)}. Prix à payer ?`,
    bonne: euros(paye),
    pieges: [[euros(prix - r), 'pourcentage-pas-euros'], [euros((prix * r) / 100), 'part-pas-total']],
    voisin: (k) => euros(paye + k),
  });
}

function tva(versHt, t) {
  const taux = t.au([20, 20, 10, 5.5]);
  const ht = taux === 5.5 ? 2 * t.entre(10, 150) : t.entre(20, 400);
  const ttc = net((ht * (100 + taux)) / 100);
  if (versHt) {
    return manche(t.melanger, {
      consigne: 'tva',
      question: `Prix TTC : ${euros(ttc)}, TVA à ${pc(taux)}. Prix hors taxe ?`,
      bonne: euros(ht),
      pieges: [[euros(ttc * (1 - taux / 100)), 'ht-diviser'], [euros(ttc - taux), 'pourcentage-pas-euros']],
      voisin: (k) => euros(ht + k),
    });
  }
  return manche(t.melanger, {
    consigne: 'tva',
    question: `Prix hors taxe : ${euros(ht)}, TVA à ${pc(taux)}. Prix TTC ?`,
    bonne: euros(ttc),
    pieges: [[euros(ht + taux), 'pourcentage-pas-euros'], [euros((ht * taux) / 100), 'part-pas-total']],
    voisin: (k) => euros(ttc + k),
  });
}

function augmentation(t) {
  const salaire = 10 * t.entre(140, 260);
  const a = t.au([1, 1.5, 2, 2.5, 3, 4, 5]);
  const nouveau = net((salaire * (100 + a)) / 100);
  return manche(t.melanger, {
    consigne: 'augmentation',
    question: `Un salaire de ${euros(salaire)} augmente de ${pc(a)}. Nouveau salaire ?`,
    bonne: euros(nouveau),
    pieges: [[euros(salaire + a), 'pourcentage-pas-euros'], [euros((salaire * a) / 100), 'part-pas-total']],
    voisin: (k) => euros(nouveau + 10 * k),
  });
}

function tauxDeRemise(t) {
  const prix = 20 * t.entre(2, 20);
  const r = t.au(REMISES);
  const paye = (prix * (100 - r)) / 100;
  const ecart = prix - paye;
  return manche(t.melanger, {
    consigne: 'taux-de-remise',
    question: `Prix affiché : ${euros(prix)}. Prix payé après remise : ${euros(paye)}. Taux de remise ?`,
    bonne: pc(r),
    pieges: [[pc(ecart), 'ecart-pas-taux'], [pc(Math.round((ecart / paye) * 1000) / 10), 'remise-sur-prix-affiche']],
    voisin: (k) => pc(r + 5 * k),
  });
}

const TAUX_PLACEMENT = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
const EPARGNANTS = ['Un artisan', 'Une boulangère', 'Un salarié', 'Une auto-entrepreneuse', 'Un commerçant'];

function interets(sorte, t) {
  let capital;
  let taux;
  let mois;
  let duree;
  let i;
  do {
    capital = 100 * t.entre(5, 60);
    taux = t.au(TAUX_PLACEMENT);
    mois = t.au([true, false]);
    duree = mois ? t.au([3, 4, 6, 8, 9, 18]) : t.entre(2, 8);
    i = mois ? (capital * taux * duree) / 1200 : (capital * taux * duree) / 100;
  } while (!Number.isInteger(net(i * 100)));
  const unAn = (capital * taux) / 100;
  const commeDesAnnees = (capital * taux * duree) / 100;
  const debut = `${t.au(EPARGNANTS)} place ${euros(capital)} à ${pc(taux)} par an, à intérêts simples, pendant ${duree} ${mois ? 'mois' : 'ans'}.`;
  if (sorte === 'interets') {
    return manche(t.melanger, {
      consigne: 'interets-simples',
      question: `${debut} Intérêts ?`,
      bonne: euros(i),
      pieges: mois
        ? [[euros(commeDesAnnees), 'mois-en-annees'], [euros(unAn), 'multiplier-par-duree']]
        : [[euros(unAn), 'multiplier-par-duree'], [euros(capital + i), 'interet-pas-valeur-acquise']],
      voisin: (k) => euros(i + k),
    });
  }
  return manche(t.melanger, {
    consigne: 'valeur-acquise',
    question: `${debut} Valeur acquise ?`,
    bonne: euros(capital + i),
    pieges: [
      [euros(i), 'valeur-acquise-capital'],
      mois ? [euros(capital + commeDesAnnees), 'mois-en-annees'] : [euros(capital + unAn), 'multiplier-par-duree'],
    ],
    voisin: (k) => euros(capital + i + k),
  });
}

function placement(sorte, t) {
  const capital = 100 * t.entre(5, 60);
  const taux = t.au(TAUX_PLACEMENT);
  const duree = t.entre(2, 8);
  const i = (capital * taux * duree) / 100;
  if (sorte === 'taux') {
    return manche(t.melanger, {
      consigne: 'placement',
      question: `À intérêts simples, ${euros(capital)} placés pendant ${duree} ans ont rapporté ${euros(i)}. Taux annuel ?`,
      bonne: pc(taux),
      pieges: [[pc(taux * duree), 'taux-annuel']],
      voisin: (k) => pc(taux + k / 2),
    });
  }
  return manche(t.melanger, {
    consigne: 'placement',
    question: `À ${pc(taux)} par an, à intérêts simples, un placement a rapporté ${euros(i)} en ${duree} ans. Capital placé ?`,
    bonne: euros(capital),
    pieges: [[euros((i * 100) / taux), 'multiplier-par-duree']],
    voisin: (k) => euros(capital + 100 * k),
  });
}

/* ---------------------------------------------------------------- 1re pro */

function capitalAcquis(composes, t) {
  const capital = 100 * t.entre(5, 50);
  const taux = t.au(TAUX_PLACEMENT);
  const duree = t.entre(2, 6);
  const q = 1 + taux / 100;
  const simple = capital * (1 + (duree * taux) / 100);
  const compose = capital * q ** duree;
  const question = `Un capital de ${euros(capital)} est placé à ${pc(taux)} par an, à intérêts ${composes ? 'composés' : 'simples'}. Capital au bout de ${duree} ans ?`;
  if (composes) {
    return manche(t.melanger, {
      consigne: 'capital-acquis',
      question,
      bonne: euros(compose),
      pieges: [[euros(simple), 'simples-pas-composes'], [euros(capital * q ** (duree - 1)), 'rang-du-terme']],
      voisin: (k) => euros(compose + k),
    });
  }
  return manche(t.melanger, {
    consigne: 'capital-acquis',
    question,
    bonne: euros(simple),
    pieges: [
      [euros(compose), 'composes-pas-simples'],
      [euros(capital * (1 + ((duree - 1) * taux) / 100)), 'rang-du-terme'],
    ],
    voisin: (k) => euros(simple + k),
  });
}

const MODELES = [
  { cle: 'arithmetique', libelle: 'Arithmétique' },
  { cle: 'geometrique', libelle: 'Géométrique' },
  { cle: 'ni-l-une-ni-l-autre', libelle: 'Ni l’une ni l’autre' },
];
const PIEGE_DU_MODELE = {
  arithmetique: 'ecarts-constants',
  geometrique: 'quotients-constants',
  'ni-l-une-ni-l-autre': 'ni-ecarts-ni-quotients',
};

function reconnaitre(sorte, t) {
  const capital = 100 * t.entre(10, 50);
  const p = t.au([2, 3, 4, 5, 10]);
  const r = (capital * p) / 100;
  let termes;
  if (sorte === 'arithmetique') termes = [capital, capital + r, capital + 2 * r];
  else if (sorte === 'geometrique') termes = [capital, capital * (1 + p / 100), capital * (1 + p / 100) ** 2];
  else {
    let r2;
    do {
      r2 = r + 10 * t.entre(1, 10);
      // Géométrique si (C + r)² = C (C + r + r2) : on l'écarte.
    } while ((capital + r) ** 2 === capital * (capital + r + r2));
    termes = [capital, capital + r, capital + r + r2];
  }
  const pieges = {};
  MODELES.forEach(({ cle }) => { if (cle !== sorte) pieges[cle] = PIEGE_DU_MODELE[sorte]; });
  return {
    consigne: 'reconnaitre-suite',
    question: `Capital en fin d’année, trois années de suite : ${termes.map((x) => euros(x)).join(' ; ')}. Quel modèle ?`,
    choix: MODELES.map((m) => ({ ...m })),
    bonne: sorte,
    pieges,
  };
}

function raison(composes, t) {
  const capital = 100 * t.entre(5, 60);
  const taux = t.au(TAUX_PLACEMENT);
  const r = `r = ${nombre((capital * taux) / 100)}`;
  const q = `q = ${nombre(1 + taux / 100)}`;
  const question = `${euros(capital)} placés à ${pc(taux)} par an, à intérêts ${composes ? 'composés' : 'simples'}. Raison de la suite des capitaux ?`;
  if (composes) {
    return manche(t.melanger, {
      consigne: 'raison',
      question,
      bonne: q,
      pieges: [[`q = ${nombre(taux / 100)}`, 'coefficient-un-plus-t'], [r, 'simples-pas-composes']],
      voisin: (k) => `q = ${nombre(1 + (taux + k) / 100)}`,
    });
  }
  return manche(t.melanger, {
    consigne: 'raison',
    question,
    bonne: r,
    pieges: [[q, 'composes-pas-simples'], [`r = ${nombre(taux)}`, 'raison-en-euros']],
    voisin: (k) => `r = ${nombre((capital * taux) / 100 + 10 * k)}`,
  });
}

/* ---------------------------------------------------------- terminale pro */

/** « 6,27 % », « −2,60 % » : un taux au centième, toujours avec ses deux décimales. */
function pc2(x) {
  const v = Math.round(x * 100) / 100;
  return `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(2).replace('.', ',')}${NB}%`;
}

/** Près d'un arrondi à mi-chemin, on retire : la bonne réponse serait ambiguë. */
const presDuMilieu = (x) => Math.abs((Math.abs(x * 100) % 1) - 0.5) < 1e-3;

const TAUX_COMPOSES = [1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6];
const OBJECTIFS = [{ f: 2, mot: 'doublé' }, { f: 3, mot: 'triplé' }, { f: 1.25 }, { f: 1.5 }];

/** Le premier entier n tel que C × qⁿ atteigne l'objectif : n ≥ log f / log q. */
function dureePlacement(t) {
  let capital;
  let taux;
  let objectif;
  let x;
  do {
    capital = 100 * t.entre(10, 80);
    taux = t.au(TAUX_COMPOSES);
    objectif = t.au(OBJECTIFS);
    x = Math.log10(objectif.f) / Math.log10(1 + taux / 100);
    // Une solution qui tomberait pile sur un entier rendrait « le premier entier » ambigu.
  } while (Math.abs(x - Math.round(x)) < 1e-6 || x > 40);
  const n = Math.ceil(x);
  const simples = Math.ceil(net(((objectif.f - 1) * 100) / taux));
  const but = objectif.mot ? `aura-t-il ${objectif.mot}` : `atteindra-t-il ${euros(capital * objectif.f)}`;
  return manche(t.melanger, {
    consigne: 'duree-placement',
    question: `Un capital de ${euros(capital)} est placé à ${pc(taux)} par an, à intérêts composés. Au bout de combien d’années ${but} ?`,
    bonne: `${n} ans`,
    pieges: [[`${simples} ans`, 'simples-pas-composes'], [`${n - 1} ans`, 'premier-entier-qui-depasse']],
    voisin: (k) => `${n + k} ans`,
  });
}

const SUJETS_EVOLUTION = [
  'Le chiffre d’affaires d’un garage', 'Le prix d’une machine-outil',
  'Le nombre de clients d’une boulangerie', 'La production d’un atelier',
];

/** Le taux annuel moyen : (coefficient global)^(1/n) − 1. */
function tauxMoyen(t) {
  let hausse;
  let g;
  let n;
  let exact;
  do {
    hausse = t.au([true, true, false]);
    g = hausse ? t.au([10, 12, 15, 20, 25, 30, 40, 50]) : t.au([5, 8, 10, 15, 20, 25]);
    n = t.entre(2, 6);
    exact = ((1 + ((hausse ? 1 : -1) * g) / 100) ** (1 / n) - 1) * 100;
  } while (presDuMilieu(exact));
  const s = hausse ? 1 : -1;
  const c = 1 + (s * g) / 100;
  return manche(t.melanger, {
    consigne: 'taux-moyen',
    question: `${t.au(SUJETS_EVOLUTION)} a ${hausse ? 'augmenté' : 'baissé'} de ${pc(g)} en ${n} ans. Taux d’évolution annuel moyen, arrondi à 0,01${NB}% ?`,
    bonne: pc2(exact),
    pieges: [[pc2((s * g) / n), 'coefficient-global'], [pc2((c ** n - 1) * 100), 'coefficient-global']],
    voisin: (k) => pc2(exact + s * (k / 2)),
  });
}

const EPARGNANTS_TLE = ['Une apprentie', 'Un apprenti', 'Une jeune salariée', 'Un jeune salarié'];

/** Des versements en progression arithmétique : n (u₁ + uₙ) / 2. */
function sommeVersements(t) {
  const u1 = 5 * t.entre(4, 20);
  const r = 5 * t.entre(1, 4);
  const n = t.au([6, 10, 12, 15, 18, 24]);
  const un = u1 + (n - 1) * r;
  const total = (n * (u1 + un)) / 2;
  return manche(t.melanger, {
    consigne: 'somme-versements',
    question: `${t.au(EPARGNANTS_TLE)} met de côté ${euros(u1)} le premier mois, puis, chaque mois, ${euros(r)} de plus que le mois précédent. Total épargné au bout de ${n} mois ?`,
    bonne: euros(total),
    pieges: [[euros(un), 'somme-des-termes'], [euros(n * (u1 + un)), 'somme-des-termes']],
    voisin: (k) => euros(total + 10 * k),
  });
}

/** Le capital C(x) = C₀ × qˣ au bout de x années. */
function capitalExpo(t) {
  let capital;
  let taux;
  let x;
  let bonne;
  do {
    capital = 100 * t.entre(10, 60);
    taux = t.au([1.5, 2, 2.5, 3, 3.5, 4, 5]);
    x = t.entre(6, 15);
    bonne = capital * (1 + taux / 100) ** x;
  } while (presDuMilieu(bonne));
  const q = 1 + taux / 100;
  return manche(t.melanger, {
    consigne: 'capital-acquis',
    question: `Un capital placé à intérêts composés vaut C(x) = ${nombre(capital)} × ${nombre(q)}ˣ euros au bout de x années. Capital au bout de ${x} ans ?`,
    bonne: euros(bonne),
    pieges: [
      [euros(capital * (1 + (x * taux) / 100)), 'simples-pas-composes'],
      [euros(capital * q ** (x - 1)), 'rang-du-terme'],
    ],
    voisin: (k) => euros(bonne + 10 * k),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  let liste;
  if (niveau === 'TERMINALE_PRO') {
    liste = [
      dureePlacement(t), dureePlacement(t),
      tauxMoyen(t), tauxMoyen(t),
      sommeVersements(t), sommeVersements(t),
      capitalExpo(t),
      t.au([dureePlacement, tauxMoyen, sommeVersements])(t),
    ];
  } else if (niveau === 'PREMIERE_PRO') {
    liste = [
      capitalAcquis(true, t), capitalAcquis(true, t),
      capitalAcquis(false, t), capitalAcquis(false, t),
      reconnaitre(t.au(['arithmetique', 'geometrique', 'ni-l-une-ni-l-autre']), t),
      reconnaitre(t.au(['arithmetique', 'geometrique']), t),
      raison(true, t), raison(false, t),
    ];
  } else {
    const commerce = [remise, (x) => tva(false, x), (x) => tva(true, x), augmentation];
    liste = [
      ...t.melanger(commerce).slice(0, 3).map((f) => f(t)),
      tauxDeRemise(t),
      interets('interets', t), interets('valeur', t),
      placement(t.au(['taux', 'capital']), t),
      t.au([...commerce, tauxDeRemise])(t),
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
  remise: 'Calcule le prix à payer après la remise.',
  tva: 'Passe du prix hors taxe au prix toutes taxes comprises, ou l’inverse.',
  augmentation: 'Calcule le nouveau salaire après l’augmentation.',
  'taux-de-remise': 'Retrouve le taux de remise qui a été appliqué.',
  'interets-simples': 'Calcule les intérêts simples de ce placement.',
  'valeur-acquise': 'Calcule la valeur acquise : le capital plus les intérêts.',
  placement: 'Retrouve ce qui manque dans ce placement.',
  'capital-acquis': 'Calcule le capital au bout de cette durée, selon le type d’intérêts.',
  'reconnaitre-suite': 'Arithmétique, géométrique, ou ni l’une ni l’autre ?',
  raison: 'Donne la raison de la suite des capitaux.',

  'pourcentage-pas-euros': 'Un pourcentage n’est pas un montant en euros : calcule d’abord ce pourcentage du prix, ou multiplie par le coefficient.',
  'part-pas-total': 'Tu as calculé la remise, la taxe ou la hausse seule : retire-la du montant de départ, ou ajoute-la.',
  'ht-diviser': 'Pour revenir au prix hors taxe, on divise le prix toutes taxes comprises par le coefficient : retirer le pourcentage ne suffit pas.',
  'ecart-pas-taux': 'L’écart en euros n’est pas un taux : divise-le par le prix affiché, puis multiplie par cent.',
  'remise-sur-prix-affiche': 'Le taux de remise se calcule sur le prix affiché, pas sur le prix payé.',
  'multiplier-par-duree': 'Les intérêts simples sont proportionnels à la durée : capital fois taux fois durée en années.',
  'interet-pas-valeur-acquise': 'Ça, c’est la valeur acquise. Les intérêts seuls, c’est capital fois taux fois durée.',
  'valeur-acquise-capital': 'Ce sont les intérêts seuls : la valeur acquise, c’est le capital plus les intérêts.',
  'mois-en-annees': 'La durée est en mois : divise-la par douze pour l’avoir en années.',
  'taux-annuel': 'C’est le taux sur toute la durée : divise-le par le nombre d’années pour avoir le taux annuel.',
  'simples-pas-composes': 'À intérêts composés, les intérêts rapportent à leur tour : on multiplie chaque année par le coefficient, la suite est géométrique.',
  'composes-pas-simples': 'À intérêts simples, on ajoute chaque année le même intérêt, calculé sur le capital de départ : la suite est arithmétique.',
  'rang-du-terme': 'Compte bien les années : au bout de n ans, on a appliqué n fois l’évolution, pas une de moins.',
  'ecarts-constants': 'Les écarts entre deux termes consécutifs sont égaux : la suite est arithmétique.',
  'quotients-constants': 'Les écarts grandissent, mais le quotient de deux termes consécutifs reste le même : la suite est géométrique.',
  'ni-ecarts-ni-quotients': 'Ni les écarts ni les quotients entre termes consécutifs ne restent constants : la suite n’est ni arithmétique ni géométrique.',
  'raison-en-euros': 'La raison est l’intérêt ajouté chaque année, en euros : capital fois taux.',
  'coefficient-un-plus-t': 'La raison est le coefficient multiplicateur : un plus le taux en écriture décimale.',

  'remise-regle': 'Prix à payer : prix affiché fois un moins le taux de remise.',
  'tva-regle': 'Prix toutes taxes comprises : prix hors taxe fois un plus le taux de TVA. Pour revenir en arrière, on divise.',
  'augmentation-regle': 'Nouveau salaire : ancien salaire fois un plus le taux d’augmentation.',
  'taux-de-remise-regle': 'Taux de remise : remise en euros divisée par le prix affiché, fois cent.',
  'interets-simples-regle': 'Intérêts simples : capital fois taux annuel fois durée en années.',
  'valeur-acquise-regle': 'Valeur acquise : capital plus intérêts, et les intérêts valent capital fois taux fois durée.',
  'placement-regle': 'Pars de la formule : intérêts égale capital fois taux fois durée, et isole ce que l’on cherche.',
  'capital-acquis-regle': 'Intérêts simples : on ajoute chaque année le même intérêt. Intérêts composés : on multiplie chaque année par le même coefficient.',
  'reconnaitre-suite-regle': 'Un écart constant : arithmétique. Un quotient constant : géométrique.',
  'raison-regle': 'Intérêts simples : la raison est l’intérêt annuel. Intérêts composés : c’est le coefficient multiplicateur.',

  // Terminale pro.
  'duree-placement': 'Trouve au bout de combien d’années le placement atteint son objectif.',
  'taux-moyen': 'Calcule le taux d’évolution annuel moyen.',
  'somme-versements': 'Calcule le total épargné : c’est la somme des termes d’une suite arithmétique.',
  'premier-entier-qui-depasse': 'À ce nombre d’années, l’objectif n’est pas encore atteint : on arrondit la solution à l’entier supérieur, jamais en dessous.',
  'coefficient-global': 'Passe par le coefficient multiplicateur global : élève-le à la puissance un sur n, puis enlève un. Diviser le taux par n ne suffit pas.',
  'somme-des-termes': 'Le total, c’est la somme de tous les versements, pas le dernier seul : nombre de termes fois la moyenne du premier et du dernier, donc divisé par deux.',
  'duree-placement-regle': 'Cherche le plus petit entier n tel que le capital fois un plus t, puissance n, atteigne l’objectif : résous avec le logarithme décimal, puis arrondis à l’entier supérieur.',
  'taux-moyen-regle': 'Taux moyen : le coefficient global, à la puissance un sur n, moins un, en pourcentage.',
  'somme-versements-regle': 'Somme de termes consécutifs d’une suite arithmétique : nombre de termes fois premier terme plus dernier terme, divisé par deux.',
};
