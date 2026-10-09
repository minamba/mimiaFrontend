/**
 * LES PROBABILITÉS — seconde.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_2DE_PROBA_EVENEMENTS, MATH_2DE_PROBA_MODELE.
 *
 * CINQ SORTES DE MANCHES (2 + 1 + 3 + 2) :
 *   - LA FORMULE P(A ∪ B) = P(A) + P(B) − P(A ∩ B), dans les deux sens. LES
 *     PIÈGES : additionner sans retirer l'intersection, multiplier (le
 *     produit ne vaut que pour des événements indépendants, hors programme
 *     de seconde), retourner la formule et trouver une probabilité négative ;
 *   - LE CONTRAIRE : P(Ā) = 1 − P(A), A ∩ Ā = ∅, A ∪ Ā certain ;
 *   - LE TABLEAU CROISÉ (effectifs écrits ligne par ligne) : P(L ∩ C),
 *     P(L ∪ C), P(C). LES PIÈGES : diviser par l'effectif d'une ligne,
 *     compter deux fois l'intersection, ne prendre qu'une case de la
 *     colonne, diviser par les cas défavorables. Réponses en fractions
 *     « cas favorables / cas possibles », non simplifiées, comme on les lit ;
 *   - LES ÉVÉNEMENTS comme ensembles d'issues (un dé, une urne) : A ∩ B,
 *     A ∪ B, Ā. LES PIÈGES : « et » pris pour « ou », retirer les issues
 *     communes de la réunion, le contraire de « ≥ k » qui garderait k.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'probabilites-seconde', titre: 'Les probabilités', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Les probabilités',
    accroche: 'Réunion, intersection, contraire.',
    competences: ['MATH_2DE_PROBA_EVENEMENTS', 'MATH_2DE_PROBA_MODELE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Un nombre à la française : virgule décimale, vrai signe moins. */
function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',').replace('-', '−');
}
/** Des centièmes entiers : 35 → « 0,35 ». */
const dec = (c) => nb(c / 100);

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

const alterne = (k) => (k % 2 ? k : -k);

/* ---------------------------------------------- la formule de la réunion */

function formule(t, sorte) {
  let pA;
  let pB;
  let pI;
  let pU;
  do {
    pA = 5 * t.entre(4, 14);
    pB = 5 * t.entre(3, 12);
    pI = 5 * t.entre(1, 8);
    pU = pA + pB - pI;
  } while (pI >= Math.min(pA, pB) || pU > 95);
  const produit = nb((pA * pB) / 10000);
  if (sorte === 'union') {
    return manche(t.melanger, {
      consigne: 'formule-union',
      question: `P(A) = ${dec(pA)}\nP(B) = ${dec(pB)}\nP(A ∩ B) = ${dec(pI)}\nP(A ∪ B) = ?`,
      bonne: dec(pU),
      pieges: [[dec(pA + pB), 'union-sans-intersection'], [produit, 'union-pas-produit']],
      voisin: (k) => dec(pU + 5 * alterne(k)),
    });
  }
  return manche(t.melanger, {
    consigne: 'formule-inter',
    question: `P(A) = ${dec(pA)}\nP(B) = ${dec(pB)}\nP(A ∪ B) = ${dec(pU)}\nP(A ∩ B) = ?`,
    bonne: dec(pI),
    pieges: [[produit, 'intersection-pas-produit'], [dec(-pI), 'formule-a-l-envers']],
    voisin: (k) => dec(pI + 5 * k),
  });
}

/* ----------------------------------------------------------- le contraire */

function contraire(t) {
  let p;
  do {
    p = t.entre(12, 88);
  } while (p === 50);
  const sorte = t.au(['direct', 'direct', 'inter', 'union']);
  const voisin = (k) => dec(p + 3 * k);
  if (sorte === 'inter') {
    return manche(t.melanger, {
      consigne: 'contraire',
      question: `P(A) = ${dec(p)}\nP(A ∩ Ā) = ?`,
      bonne: '0',
      pieges: [[nb((p * (100 - p)) / 10000), 'contraire-incompatible'], ['1', 'inter-ou-union']],
      voisin,
    });
  }
  if (sorte === 'union') {
    return manche(t.melanger, {
      consigne: 'contraire',
      question: `P(A) = ${dec(p)}\nP(A ∪ Ā) = ?`,
      bonne: '1',
      pieges: [['0', 'union-ou-inter'], [dec(100 - p), 'contraire-tout']],
      voisin,
    });
  }
  const renverse = t.au([true, false]);
  return manche(t.melanger, {
    consigne: 'contraire',
    question: renverse ? `P(Ā) = ${dec(p)}\nP(A) = ?` : `P(A) = ${dec(p)}\nP(Ā) = ?`,
    bonne: dec(100 - p),
    pieges: [[dec(p), 'contraire-un-moins']],
    voisin: (k) => dec(((100 - p + 10 * k) % 100) || 5),
  });
}

/* ------------------------------------------------------ le tableau croisé */

const CONTEXTES = [
  {
    intro: 'Les élèves d’un lycée',
    lignes: ['filles', 'garçons'],
    L: 'F',
    evL: 'l’élève est une fille',
    colonnes: ['demi-pensionnaires', 'externes'],
    C: 'D',
    evC: 'l’élève est demi-pensionnaire',
  },
  {
    intro: 'Les adhérents d’un club de sport',
    lignes: ['mineurs', 'majeurs'],
    L: 'M',
    evL: 'l’adhérent est mineur',
    colonnes: ['en compétition', 'en loisir'],
    C: 'C',
    evC: 'l’adhérent fait de la compétition',
  },
];

function tableau(t, sorte) {
  const x = t.au(CONTEXTES);
  const [n11, n12, n21, n22] = [t.entre(5, 60), t.entre(5, 60), t.entre(5, 60), t.entre(5, 60)];
  const T = n11 + n12 + n21 + n22;
  const lignes = [
    `${x.intro} (${T} au total) :`,
    `${x.lignes[0]} : ${n11} ${x.colonnes[0]}, ${n12} ${x.colonnes[1]}`,
    `${x.lignes[1]} : ${n21} ${x.colonnes[0]}, ${n22} ${x.colonnes[1]}`,
    'On en choisit un au hasard.',
    `${x.L} : « ${x.evL} » ; ${x.C} : « ${x.evC} »`,
  ];
  const Ltot = n11 + n12;
  const Ctot = n11 + n21;
  const union = Ltot + Ctot - n11;
  const f = (n, d) => `${n}/${d}`;
  let demande;
  let bonne;
  let num;
  let pieges;
  if (sorte === 'inter') {
    demande = `P(${x.L} ∩ ${x.C}) = ?`;
    [bonne, num] = [f(n11, T), n11];
    pieges = [[f(n11, Ltot), 'intersection-sur-total'], [f(union, T), 'inter-ou-union']];
  } else if (sorte === 'union') {
    demande = `P(${x.L} ∪ ${x.C}) = ?`;
    [bonne, num] = [f(union, T), union];
    pieges = [[f(Ltot + Ctot, T), 'union-sans-intersection'], [f(n11, T), 'union-ou-inter']];
  } else {
    demande = `P(${x.C}) = ?`;
    [bonne, num] = [f(Ctot, T), Ctot];
    pieges = [[f(n11, T), 'total-de-colonne'], [f(Ctot, T - Ctot), 'cas-possibles']];
  }
  return manche(t.melanger, {
    consigne: 'tableau-croise',
    question: [...lignes, demande].join('\n'),
    bonne,
    pieges,
    voisin: (k) => f(num + alterne(k), T),
  });
}

/* ---------------------------------------------- les événements, ensembles */

const UNIVERS = [
  { intro: 'On lance un dé à six faces.', n: 6, sujet: 'le résultat' },
  { intro: 'Une urne contient dix boules numérotées de 1 à 10 ; on en tire une.', n: 10, sujet: 'le numéro' },
];

/** Les événements possibles d'un univers de 1 à n : [texte, test, sorte]. */
function evenements(n) {
  const liste = [
    ['est pair', (x) => x % 2 === 0, 'parite'],
    ['est impair', (x) => x % 2 === 1, 'parite'],
    ['est un multiple de 3', (x) => x % 3 === 0, 'multiple'],
  ];
  for (let k = 2; k < n; k += 1) {
    liste.push([`est supérieur ou égal à ${k}`, (x) => x >= k, 'sup', k]);
    liste.push([`est inférieur ou égal à ${k}`, (x) => x <= k, 'inf', k]);
  }
  return liste;
}

const ens = (s) => (s.length ? `{${s.join(' ; ')}}` : '∅');

function vocabulaire(t, quoi) {
  const u = t.au(UNIVERS);
  const issues = Array.from({ length: u.n }, (_, i) => i + 1);
  const evts = evenements(u.n);
  const partie = (test) => issues.filter(test);
  const toggle = (s, k) => {
    const x = ((k - 1) % u.n) + 1;
    return s.includes(x) ? s.filter((y) => y !== x) : [...s, x].sort((a, b) => a - b);
  };
  if (quoi === 'contraire') {
    const [texte, test, , k] = t.au(evts.filter((e) => e[2] === 'sup' || e[2] === 'inf'));
    const bonne = partie((x) => !test(x));
    const avecBorne = partie((x) => !test(x) || x === k);
    return manche(t.melanger, {
      consigne: 'evenements',
      question: `${u.intro}\nA : « ${u.sujet} ${texte} »\nĀ = ?`,
      bonne: ens(bonne),
      pieges: [[ens(avecBorne), 'contraire-strict']],
      voisin: (j) => ens(toggle(bonne, j + 1)),
    });
  }
  let A;
  let B;
  let SA;
  let SB;
  do {
    [A, B] = [t.au(evts), t.au(evts)];
    [SA, SB] = [partie(A[1]), partie(B[1])];
  } while (ens(SA) === ens(SB) || A[2] === B[2]);
  const inter = SA.filter((x) => SB.includes(x));
  const union = issues.filter((x) => SA.includes(x) || SB.includes(x));
  const sym = union.filter((x) => !inter.includes(x));
  const entete = `${u.intro}\nA : « ${u.sujet} ${A[0]} »\nB : « ${u.sujet} ${B[0]} »`;
  if (quoi === 'inter') {
    return manche(t.melanger, {
      consigne: 'evenements',
      question: `${entete}\nA ∩ B = ?`,
      bonne: ens(inter),
      pieges: [[ens(union), 'inter-ou-union']],
      voisin: (j) => ens(toggle(inter, j)),
    });
  }
  return manche(t.melanger, {
    consigne: 'evenements',
    question: `${entete}\nA ∪ B = ?`,
    bonne: ens(union),
    pieges: [[ens(inter), 'union-ou-inter'], [ens(sym), 'union-garde-les-deux']],
    voisin: (j) => ens(toggle(union, j)),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  const [v1, v2] = t.melanger(['inter', 'union', 'contraire']);
  return t.melanger([
    formule(t, 'union'), formule(t, 'inter'),
    contraire(t),
    tableau(t, 'inter'), tableau(t, 'union'), tableau(t, 'marge'),
    vocabulaire(t, v1), vocabulaire(t, v2),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'formule-union': 'Calcule la probabilité de A union B.',
  'formule-inter': 'Retrouve la probabilité de A inter B à partir des autres.',
  contraire: 'Pense à l’événement contraire pour répondre.',
  'tableau-croise': 'Lis le tableau croisé et calcule la probabilité demandée.',
  evenements: 'Écris l’événement demandé comme un ensemble d’issues.',

  'union-sans-intersection': 'Additionner les deux probabilités compte deux fois l’intersection : il faut la retirer une fois.',
  'union-pas-produit': 'La probabilité de A union B, c’est P de A plus P de B moins P de A inter B, pas un produit.',
  'intersection-pas-produit': 'Le produit ne vaut que pour des événements indépendants, ce qu’on ne sait pas ici : utilise la formule de la réunion à l’envers.',
  'formule-a-l-envers': 'Une probabilité n’est jamais négative : P de A inter B égale P de A plus P de B moins P de A union B.',
  'contraire-un-moins': 'La probabilité du contraire, c’est un moins la probabilité de l’événement.',
  'contraire-incompatible': 'A et son contraire ne peuvent pas se produire en même temps : leur intersection est vide, de probabilité nulle.',
  'contraire-tout': 'A ou son contraire, c’est toujours vrai : cet événement est certain.',
  'inter-ou-union': 'Tu as pris la réunion. L’intersection, c’est « et » : seulement ce qui est dans les deux à la fois.',
  'union-ou-inter': 'Tu as pris l’intersection. La réunion, c’est « ou » : ce qui est dans l’un, dans l’autre, ou dans les deux.',
  'intersection-sur-total': 'On choisit au hasard dans tout l’effectif : divise par le total, pas par le total d’une ligne.',
  'total-de-colonne': 'L’événement concerne toute la colonne : additionne les deux cases de la colonne.',
  'cas-possibles': 'Une probabilité, c’est le nombre de cas favorables divisé par le nombre total de cas, pas par les cas défavorables.',
  'union-garde-les-deux': 'Les issues communes aux deux événements font aussi partie de la réunion : ne les retire pas.',
  'contraire-strict': 'Le contraire de « supérieur ou égal », c’est « strictement inférieur », et inversement : la borne change de camp.',

  'formule-union-regle': 'P de A union B égale P de A plus P de B moins P de A inter B.',
  'formule-inter-regle': 'Retourne la formule : P de A inter B égale P de A plus P de B moins P de A union B.',
  'contraire-regle': 'Un événement et son contraire ont des probabilités dont la somme vaut un.',
  'tableau-croise-regle': 'Compte les cas favorables dans le tableau, puis divise par l’effectif total.',
  'evenements-regle': 'Liste les issues de chaque événement, puis garde celles qui conviennent : « et » pour l’intersection, « ou » pour la réunion.',
};
