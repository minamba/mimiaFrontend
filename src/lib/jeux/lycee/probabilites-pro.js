/**
 * LES PROBABILITÉS — Nora, voie professionnelle (2de et 1re pro).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (colonne NIVEAU de competences-lycee.txt) :
 *   2de pro : MATH_2PRO_PROB_CALCULER, MATH_2PRO_PROB_ESTIMER, MATH_2PRO_PROB_FLUCTUATION
 *   1re pro : MATH_1PRO_PROB_ARBRE, MATH_1PRO_PROB_CONDITION
 *
 * EN 2de PRO (5 sortes) — fractions irréductibles, fréquences décimales :
 *   - LA PROBABILITÉ SIMPLE (k défectueuses sur N) : LES PIÈGES, diviser par
 *     les autres cas (k / (N − k)), donner la probabilité du contraire ;
 *   - LA FRÉQUENCE pour estimer une probabilité : LES PIÈGES, diviser par cent,
 *     le contraire ;
 *   - LA TAILLE DE L'ÉCHANTILLON : le plus grand donne l'estimation la plus sûre ;
 *   - LE TABLEAU À DOUBLE ENTRÉE, une case (« machine A et défectueuse ») : LE
 *     PIÈGE, diviser par le total de la ligne ou de la colonne ;
 *   - LE TABLEAU, une marge (« défectueuse ») : LES PIÈGES, ne prendre qu'une
 *     case, diviser par les autres cas.
 *
 * EN 1re PRO (4 sortes) — arbre pondéré et conditionnement :
 *   - UN CHEMIN DE L'ARBRE, P(A ∩ D) ou P(A ∩ D̄) : LES PIÈGES, donner la seule
 *     branche conditionnelle, additionner au lieu de multiplier, suivre la
 *     branche du contraire ;
 *   - LES PROBABILITÉS TOTALES, P(D) : LES PIÈGES, additionner les
 *     conditionnelles sans les pondérer, en faire la moyenne simple ;
 *   - LA PROBABILITÉ CONDITIONNELLE dans un tableau : LES PIÈGES, inverser la
 *     condition (P sachant A contre P sachant B), diviser par le total général ;
 *   - LE TABLEAU, une case : comme en 2de.
 *
 * EN TERMINALE PRO (4 sortes) — « et », « ou », « ni », « au moins un » :
 *   Tle pro : MATH_TPRO_LOGIQUE. Le fichier n'a, en terminale pro, AUCUN code
 *   de probabilités (seulement des statistiques) : c'est le code de la classe
 *   le plus proche (vocabulaire ensembliste et connecteurs logiques : la
 *   réunion, l'intersection, le contraire), et c'est ce que le jeu travaille.
 *   - LA RÉUNION, P(A ∪ B) = P(A) + P(B) − P(A ∩ B) : LES PIÈGES, additionner
 *     sans retirer l'intersection, la retirer deux fois (« ou » exclusif),
 *     donner l'intersection (« et » pour « ou ») ;
 *   - NI L'UN NI L'AUTRE, 1 − P(A ∪ B) : LES PIÈGES, oublier l'intersection,
 *     prendre le contraire de « et », donner P(A ∪ B) lui-même ;
 *   - « OU » DANS UN TABLEAU : ligne + colonne − case. LES PIÈGES, compter la
 *     case deux fois, ne prendre que la case, la retirer deux fois ;
 *   - AU MOINS UN de deux événements indépendants, 1 − (1 − p)(1 − p′) : LES
 *     PIÈGES, additionner, multiplier (« les deux »), donner « aucun » ;
 *   - et une case du tableau (« et »), comme en 2de, pour l'opposer à « ou ».
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'probabilites-pro', titre: 'Les probabilités', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE_PRO: {
    titre: 'Les probabilités',
    accroche: 'Le hasard, chiffré pour de vrai.',
    competences: ['MATH_2PRO_PROB_CALCULER', 'MATH_2PRO_PROB_ESTIMER', 'MATH_2PRO_PROB_FLUCTUATION'],
  },
  PREMIERE_PRO: {
    titre: 'Les probabilités',
    accroche: 'Arbres pondérés et probabilités sachant.',
    competences: ['MATH_1PRO_PROB_ARBRE', 'MATH_1PRO_PROB_CONDITION'],
  },
  TERMINALE_PRO: {
    titre: 'Les probabilités',
    accroche: 'Et, ou, ni, au moins un : sans se tromper.',
    competences: ['MATH_TPRO_LOGIQUE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* --------------------------------------------------------------- outils */

/** Un nombre à la française : virgule, sans zéro inutile. */
export function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  if (r === 0) return '0';
  const s = String(Math.abs(r)).replace('.', ',');
  return r < 0 ? `−${s}` : s;
}

export const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));

/** « 3/20 », irréductible ; null si le quotient n'est pas strictement entre 0 et 1. */
export function irred(n, d) {
  if (n <= 0 || d <= 0 || n >= d) return null;
  const g = pgcd(n, d);
  return `${n / g}/${d / g}`;
}

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && v !== undefined && String(v) !== b);
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

/** Un voisin d'une fraction n/d : (n + k)/d, irréductible, encore une probabilité. */
function voisinFraction(n, d, k) {
  for (let j = k; j < k + 2 * d; j += 1) {
    const v = irred(n + j, d) ?? irred(n - j, d);
    if (v) return v;
  }
  return `${k}/${d + k}`;
}

const minuscule = (s) => s[0].toLowerCase() + s.slice(1);

/* ------------------------------------------------------------- 2de pro */

const LOTS = [
  {
    texte: (n, k) => `Un carton contient ${n} ampoules, dont ${k} défectueuses.\nOn en prend une au hasard.`,
    oui: 'Probabilité qu’elle soit défectueuse ?',
    non: 'Probabilité qu’elle ne soit pas défectueuse ?',
  },
  {
    texte: (n, k) => `Un lot de ${n} carreaux contient ${k} carreaux fêlés.\nOn en prend un au hasard.`,
    oui: 'Probabilité qu’il soit fêlé ?',
    non: 'Probabilité qu’il ne soit pas fêlé ?',
  },
  {
    texte: (n, k) => `Sur ${n} clients d’un garage, ${k} viennent pour une vidange.\nOn choisit un client au hasard.`,
    oui: 'Probabilité qu’il vienne pour une vidange ?',
    non: 'Probabilité qu’il ne vienne pas pour une vidange ?',
  },
];

function simple2(t) {
  const n = t.entre(12, 60);
  const k = t.entre(2, Math.floor((n - 1) / 2));
  const lot = t.au(LOTS);
  const contraire = t.entre(0, 2) === 0;
  const [fav, autre] = contraire ? [n - k, k] : [k, n - k];
  return manche(t.melanger, {
    consigne: 'proba-simple',
    question: `${lot.texte(n, k)}\n${contraire ? lot.non : lot.oui}`,
    bonne: irred(fav, n),
    pieges: t.melanger([[irred(fav, autre), 'total-des-cas'], [irred(autre, n), 'evenement-contraire']]),
    voisin: (j) => voisinFraction(fav, n, j),
  });
}

const CONTROLES = [
  (n, k) => `Contrôle qualité : sur ${n} boulons tirés au hasard, ${k} sont non conformes.\nProbabilité estimée qu’un boulon soit non conforme ?`,
  (n, k) => `Un service après-vente note que, sur ${n} appels, ${k} concernent une panne.\nProbabilité estimée qu’un appel concerne une panne ?`,
  (n, k) => `Sur ${n} colis expédiés, ${k} sont arrivés en retard.\nProbabilité estimée qu’un colis arrive en retard ?`,
];

function frequence2(t) {
  const n = t.au([50, 125, 200, 250, 500, 1000]);
  const k = t.entre(2, Math.min(99, Math.floor((n * 3) / 10)));
  const f = k / n;
  return manche(t.melanger, {
    consigne: 'frequence',
    question: t.au(CONTROLES)(n, k),
    bonne: nb(f),
    pieges: t.melanger([[nb(k / 100), 'frequence-sur-effectif'], [nb(1 - f), 'evenement-contraire']]),
    voisin: (j) => nb((k + j) / n),
  });
}

function echantillon2(t) {
  const petit = t.entre(2, 9) * 10;
  const grand = t.entre(2, 9) * 1000;
  const aPetit = t.entre(0, 1) === 1;
  const [nA, nB] = aPetit ? [petit, grand] : [grand, petit];
  const bonne = aPetit ? 'Celle de B' : 'Celle de A';
  return manche(t.melanger, {
    consigne: 'echantillon',
    question: `Pour estimer la part de pièces défectueuses, l’atelier A en contrôle ${nA} et l’atelier B en contrôle ${nB}.\nQuelle estimation est la plus fiable ?`,
    bonne,
    pieges: [[aPetit ? 'Celle de A' : 'Celle de B', 'taille-echantillon'], ['Elles se valent', 'taille-echantillon']],
    voisin: () => 'On ne peut pas savoir',
  });
}

const TABLEAUX = [
  {
    titre: 'Pièces produites dans un atelier.', lignes: ['Machine A', 'Machine B'], colonnes: ['Conforme', 'Défectueuse'], tirage: 'On prend une pièce au hasard.',
  },
  {
    titre: 'Salariés d’une entreprise.', lignes: ['Atelier', 'Bureau'], colonnes: ['Temps plein', 'Temps partiel'], tirage: 'On choisit un salarié au hasard.',
  },
  {
    titre: 'Interventions d’un garage.', lignes: ['Vidange', 'Freinage'], colonnes: ['Payée', 'En attente'], tirage: 'On choisit une intervention au hasard.',
  },
  {
    titre: 'Élèves d’un lycée professionnel.', lignes: ['Seconde', 'Terminale'], colonnes: ['Externe', 'Demi-pensionnaire'], tirage: 'On choisit un élève au hasard.',
  },
];

/** Un tableau d'effectifs 2 × 2, ses totaux, et son texte. */
function tableauEffectifs(t) {
  const modele = t.au(TABLEAUX);
  const n = [[t.entre(5, 60), t.entre(5, 60)], [t.entre(5, 60), t.entre(5, 60)]];
  const ligne = [n[0][0] + n[0][1], n[1][0] + n[1][1]];
  const colonne = [n[0][0] + n[1][0], n[0][1] + n[1][1]];
  const total = ligne[0] + ligne[1];
  const texte = `${modele.titre}\n— | ${modele.colonnes.join(' | ')}\n`
    + `${modele.lignes[0]} | ${n[0][0]} | ${n[0][1]}\n${modele.lignes[1]} | ${n[1][0]} | ${n[1][1]}\n${modele.tirage}`;
  return {
    modele, n, ligne, colonne, total, texte,
  };
}

function tableauEt(t) {
  const tab = tableauEffectifs(t);
  const i = t.entre(0, 1);
  const j = t.entre(0, 1);
  const c = tab.n[i][j];
  return manche(t.melanger, {
    consigne: 'tableau-et',
    question: `${tab.texte}\nProbabilité de « ${minuscule(tab.modele.lignes[i])} et ${minuscule(tab.modele.colonnes[j])} » ?`,
    bonne: irred(c, tab.total),
    pieges: t.melanger([[irred(c, tab.ligne[i]), 'tout-l-effectif'], [irred(c, tab.colonne[j]), 'tout-l-effectif']]),
    voisin: (k) => voisinFraction(c, tab.total, k),
  });
}

function tableauMarge(t) {
  const tab = tableauEffectifs(t);
  const j = t.entre(0, 1);
  const i = t.entre(0, 1);
  const m = tab.colonne[j];
  return manche(t.melanger, {
    consigne: 'tableau-marge',
    question: `${tab.texte}\nProbabilité de « ${minuscule(tab.modele.colonnes[j])} » ?`,
    bonne: irred(m, tab.total),
    pieges: t.melanger([[irred(tab.n[i][j], tab.total), 'une-seule-case'], [irred(m, tab.total - m), 'total-des-cas']]),
    voisin: (k) => voisinFraction(m, tab.total, k),
  });
}

/* ------------------------------------------------------------- 1re pro */

const ARBRES = [
  'A : machine A, B : machine B, D : pièce défectueuse.',
  'A : fournisseur A, B : fournisseur B, D : composant à renvoyer.',
  'A : équipe de jour, B : équipe de nuit, D : pièce à reprendre.',
  'A : vente en magasin, B : vente en ligne, D : produit retourné.',
];

/** Un arbre pondéré : P(A), P(B), P sachant A de D, P sachant B de D, en centièmes. */
function arbre(t) {
  const pA = t.entre(4, 16) * 5;
  let dA;
  let dB;
  do {
    dA = t.entre(1, 20);
    dB = t.entre(1, 20);
  } while (dA === dB);
  const c = (x) => nb(x / 100);
  const texte = `${t.au(ARBRES)}\nArbre pondéré :\nA (${c(pA)}) → D (${c(dA)}) ou D̄ (${c(100 - dA)})\nB (${c(100 - pA)}) → D (${c(dB)}) ou D̄ (${c(100 - dB)})`;
  return {
    pA, pB: 100 - pA, dA, dB, texte,
  };
}

function chemin1(t) {
  const a = arbre(t);
  const parA = t.entre(0, 1) === 1;
  const [p, d] = parA ? [a.pA, a.dA] : [a.pB, a.dB];
  const nom = parA ? 'A' : 'B';
  const contraire = t.entre(0, 2) === 0;
  if (contraire) {
    return manche(t.melanger, {
      consigne: 'arbre-chemin',
      question: `${a.texte}\nP(${nom} ∩ D̄) ?`,
      bonne: nb((p * (100 - d)) / 10000),
      pieges: t.melanger([[nb((100 - d) / 100), 'branche-conditionnelle'], [nb((p * d) / 10000), 'chemin-contraire']]),
      voisin: (k) => nb((p * (100 - d) + 100 * k) / 10000),
    });
  }
  return manche(t.melanger, {
    consigne: 'arbre-chemin',
    question: `${a.texte}\nP(${nom} ∩ D) ?`,
    bonne: nb((p * d) / 10000),
    pieges: t.melanger([[nb(d / 100), 'branche-conditionnelle'], [nb((p + d) / 100), 'multiplier-les-branches']]),
    voisin: (k) => nb((p * d + 100 * k) / 10000),
  });
}

function totale1(t) {
  const a = arbre(t);
  const juste = (a.pA * a.dA + a.pB * a.dB) / 10000;
  return manche(t.melanger, {
    consigne: 'proba-totale',
    question: `${a.texte}\nP(D) ?`,
    bonne: nb(juste),
    pieges: t.melanger([[nb((a.dA + a.dB) / 100), 'ponderer-les-branches'], [nb((a.dA + a.dB) / 200), 'moyenne-non-ponderee']]),
    voisin: (k) => nb(juste + k / 100),
  });
}

function condition1(t) {
  const tab = tableauEffectifs(t);
  const i = t.entre(0, 1);
  const j = t.entre(0, 1);
  const c = tab.n[i][j];
  const surLigne = t.entre(0, 1) === 1;
  const ligne = minuscule(tab.modele.lignes[i]);
  const colonne = minuscule(tab.modele.colonnes[j]);
  const [evenement, condition] = surLigne ? [colonne, ligne] : [ligne, colonne];
  const [effCondition, effEvenement] = surLigne ? [tab.ligne[i], tab.colonne[j]] : [tab.colonne[j], tab.ligne[i]];
  return manche(t.melanger, {
    consigne: 'condition-tableau',
    question: `${tab.texte}\nProbabilité de « ${evenement} » sachant « ${condition} » ?`,
    bonne: irred(c, effCondition),
    pieges: t.melanger([[irred(c, effEvenement), 'condition-inversee'], [irred(c, tab.total), 'intersection-ou-condition']]),
    voisin: (k) => voisinFraction(c, effCondition, k),
  });
}

/* ------------------------------------------------------------- Tle pro */

const EVENEMENTS = [
  {
    texte: 'On prend au hasard une pièce produite par un atelier.\nA : « elle a un défaut de peinture » ; B : « elle a un défaut de soudure ».',
    ni: 'Probabilité qu’elle n’ait aucun des deux défauts ?',
  },
  {
    texte: 'On choisit au hasard un client d’un magasin de bricolage.\nA : « il achète un outil » ; B : « il achète de la peinture ».',
    ni: 'Probabilité qu’il n’achète ni outil ni peinture ?',
  },
  {
    texte: 'On choisit au hasard un véhicule entré au garage.\nA : « il a besoin de pneus » ; B : « il a besoin de plaquettes de frein ».',
    ni: 'Probabilité qu’il n’ait besoin ni de pneus ni de plaquettes ?',
  },
];

/** P(A), P(B), P(A ∩ B) en centièmes, avec P(A ∪ B) ≤ 0,9. */
function deuxEvenements(t) {
  let a;
  let b;
  let c;
  do {
    a = t.entre(10, 60);
    b = t.entre(10, 60);
    c = t.entre(2, Math.min(a, b) - 2);
  } while (a + b - c > 90);
  const ev = t.au(EVENEMENTS);
  const c100 = (x) => nb(x / 100);
  return {
    a, b, c, ev, texte: `${ev.texte}\nP(A) = ${c100(a)} ; P(B) = ${c100(b)} ; P(A ∩ B) = ${c100(c)}.`,
  };
}

function reunionT(t) {
  const {
    a, b, c, texte,
  } = deuxEvenements(t);
  return manche(t.melanger, {
    consigne: 'proba-ou',
    question: `${texte}\nP(A ∪ B) ?`,
    bonne: nb((a + b - c) / 100),
    pieges: t.melanger([
      [a + b < 100 ? nb((a + b) / 100) : null, 'ou-retirer-intersection'],
      [nb((a + b - 2 * c) / 100), 'ou-inclusif'],
      [nb(c / 100), 'et-ou'],
    ]),
    voisin: (k) => nb((a + b - c - k) / 100),
  });
}

function niNiT(t) {
  const {
    a, b, c, ev, texte,
  } = deuxEvenements(t);
  return manche(t.melanger, {
    consigne: 'proba-ou',
    question: `${texte}\n${ev.ni}`,
    bonne: nb((100 - a - b + c) / 100),
    pieges: t.melanger([
      [a + b < 100 ? nb((100 - a - b) / 100) : null, 'ou-retirer-intersection'],
      [nb((100 - c) / 100), 'contraire-de-ou'],
      [nb((a + b - c) / 100), 'evenement-contraire'],
    ]),
    voisin: (k) => nb((100 - a - b + c + k) / 100),
  });
}

function tableauOuT(t) {
  const tab = tableauEffectifs(t);
  const i = t.entre(0, 1);
  const j = t.entre(0, 1);
  const c = tab.n[i][j];
  const union = tab.ligne[i] + tab.colonne[j];
  return manche(t.melanger, {
    consigne: 'proba-ou',
    question: `${tab.texte}\nProbabilité de « ${minuscule(tab.modele.lignes[i])} ou ${minuscule(tab.modele.colonnes[j])} » ?`,
    bonne: irred(union - c, tab.total),
    pieges: t.melanger([
      [irred(union, tab.total), 'ou-retirer-intersection'],
      [irred(c, tab.total), 'et-ou'],
      [irred(union - 2 * c, tab.total), 'ou-inclusif'],
    ]),
    voisin: (k) => voisinFraction(union - c, tab.total, k),
  });
}

const AU_MOINS_UN = [
  (p, q) => `Deux machines tombent en panne indépendamment l’une de l’autre. Dans la journée, la machine A tombe en panne avec la probabilité ${p}, la machine B avec la probabilité ${q}.\nProbabilité qu’au moins une des deux tombe en panne ?`,
  (p, q) => `Deux fournisseurs livrent indépendamment l’un de l’autre. Le premier livre en retard avec la probabilité ${p}, le second avec la probabilité ${q}.\nProbabilité qu’au moins une des deux livraisons soit en retard ?`,
  (p, q) => `Une pièce passe deux contrôles indépendants. Le premier la refuse avec la probabilité ${p}, le second avec la probabilité ${q}.\nProbabilité qu’au moins un des deux contrôles la refuse ?`,
];

/** Au moins un de deux événements indépendants : 1 − (1 − p)(1 − q), en dix-millièmes. */
function auMoinsUnT(t) {
  const p = t.entre(2, 30);
  const q = t.entre(2, 30);
  const aucun = (100 - p) * (100 - q);
  return manche(t.melanger, {
    consigne: 'au-moins-un',
    question: t.au(AU_MOINS_UN)(nb(p / 100), nb(q / 100)),
    bonne: nb((10000 - aucun) / 10000),
    pieges: t.melanger([
      [nb((p + q) / 100), 'ou-retirer-intersection'],
      [nb((p * q) / 10000), 'et-ou'],
      [nb(aucun / 10000), 'evenement-contraire'],
    ]),
    voisin: (k) => nb((10000 - aucun + 100 * k) / 10000),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  let liste;
  if (niveau === 'TERMINALE_PRO') {
    liste = [
      reunionT(t), reunionT(t), niNiT(t),
      tableauOuT(t), tableauOuT(t),
      auMoinsUnT(t), auMoinsUnT(t),
      tableauEt(t),
    ];
  } else if (niveau === 'PREMIERE_PRO') {
    liste = [
      chemin1(t), chemin1(t),
      totale1(t), totale1(t),
      condition1(t), condition1(t), condition1(t),
      tableauEt(t),
    ];
  } else {
    liste = [
      simple2(t), simple2(t),
      frequence2(t), frequence2(t),
      echantillon2(t),
      tableauEt(t), tableauMarge(t), t.entre(0, 1) ? tableauEt(t) : tableauMarge(t),
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
  'proba-simple': 'Calcule cette probabilité : cas favorables sur cas possibles.',
  frequence: 'Estime la probabilité à partir de la fréquence observée.',
  echantillon: 'Choisis l’estimation la plus fiable.',
  'tableau-et': 'Lis le tableau, et calcule la probabilité que les deux conditions soient réunies.',
  'tableau-marge': 'Lis le tableau, et calcule cette probabilité.',
  'arbre-chemin': 'Calcule la probabilité de ce chemin de l’arbre.',
  'proba-totale': 'Calcule la probabilité de cet événement, en suivant toutes les branches qui y mènent.',
  'condition-tableau': 'Calcule cette probabilité conditionnelle à partir du tableau.',

  'total-des-cas': 'Divise le nombre de cas favorables par le nombre total de cas possibles, pas par le nombre des autres cas.',
  'evenement-contraire': 'Relis l’événement demandé : c’est la probabilité de son contraire que tu as donnée, et les deux ensemble font un.',
  'frequence-sur-effectif': 'Une fréquence, c’est l’effectif observé divisé par le nombre total d’observations, pas par cent.',
  'taille-echantillon': 'Plus l’échantillon est grand, moins la fréquence fluctue : c’est le plus grand contrôle qui donne l’estimation la plus fiable.',
  'tout-l-effectif': 'On choisit dans tout l’effectif : divise par le total général, pas par le total d’une ligne ou d’une colonne.',
  'une-seule-case': 'L’événement regroupe toute une colonne : additionne ses cases avant de diviser par le total.',
  'branche-conditionnelle': 'Le nombre de la deuxième branche est une probabilité sachant la première : pour le chemin entier, multiplie les probabilités le long des branches.',
  'multiplier-les-branches': 'Le long d’un chemin, on multiplie les probabilités ; on ne les additionne pas.',
  'chemin-contraire': 'Suis la branche de l’événement demandé, pas celle de son contraire.',
  'ponderer-les-branches': 'Chaque chemin compte selon son poids : multiplie le long de chaque chemin qui mène à l’événement, puis additionne les résultats.',
  'moyenne-non-ponderee': 'Une simple moyenne ne suffit pas : les deux branches de départ n’ont pas le même poids.',
  'condition-inversee': 'Sachant un événement, on se restreint à lui : divise par l’effectif de la condition, pas par celui de l’événement cherché.',
  'intersection-ou-condition': 'Avec « sachant », on ne divise pas par le total général, mais par l’effectif de la condition.',

  'proba-simple-regle': 'Compte les cas favorables, puis divise par le nombre total de cas, et simplifie.',
  'frequence-regle': 'Divise l’effectif observé par le nombre total d’observations.',
  'echantillon-regle': 'Plus on fait d’observations, plus la fréquence se rapproche de la probabilité.',
  'tableau-et-regle': 'Prends la case où les deux conditions se croisent, et divise par le total général.',
  'tableau-marge-regle': 'Additionne la colonne de l’événement, et divise par le total général.',
  'arbre-chemin-regle': 'Multiplie les probabilités le long des branches du chemin.',
  'proba-totale-regle': 'Additionne les probabilités de tous les chemins qui mènent à l’événement.',
  'condition-tableau-regle': 'Divise l’effectif de la case par l’effectif total de la condition.',

  // Terminale pro.
  'proba-ou': 'Traduis « et », « ou », « ni », puis calcule cette probabilité.',
  'au-moins-un': 'Calcule la probabilité qu’au moins l’un des deux événements se produise.',
  'ou-retirer-intersection': 'En additionnant, tu comptes deux fois les cas où les deux se produisent ensemble : retire une fois la probabilité de A et B.',
  'ou-inclusif': 'En mathématiques, « ou » est inclusif : les cas où les deux se produisent comptent aussi. On ne retire l’intersection qu’une seule fois.',
  'et-ou': '« Et » exige les deux à la fois ; « ou » demande au moins l’un des deux. Relis l’événement demandé.',
  'contraire-de-ou': 'Le contraire de « A ou B », c’est « ni A ni B » : calcule d’abord la probabilité de A ou B, puis retire-la de un.',
  'proba-ou-regle': 'Probabilité de A ou B : P de A plus P de B, moins P de A et B. Et le contraire d’un événement a pour probabilité un moins la sienne.',
  'au-moins-un-regle': 'Pour « au moins un », passe par le contraire, « aucun » : avec des événements indépendants, multiplie les probabilités qu’ils n’arrivent pas, puis retire ce produit de un.',
};
