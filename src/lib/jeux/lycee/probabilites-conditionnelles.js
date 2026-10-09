/**
 * LES PROBABILITÉS CONDITIONNELLES — Nora, 1re générale (spécialité).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   MATH_1RE_PROBA_COND, MATH_1RE_AUTO_PROBA_NOTATIONS, MATH_1RE_PROBA_ARBRE,
 *   MATH_1RE_PROBA_INDEP, MATH_1RE_PROBA_DEUX_EPREUVES
 *
 * L'ARBRE EST DÉCRIT EN TEXTE : « P(A) = 0,3 ; P_A(B) = 0,6 ; P_Ā(B) = 0,2 ».
 * P_A(B) se lit « probabilité de B sachant A ». Les probabilités sont des
 * dixièmes ou des centièmes, calculées en ENTIERS (centièmes) pour qu'aucun
 * arrondi ne se glisse ; les quotients (inverser un conditionnement) sont
 * arrondis au centième, et la question le dit.
 *
 * HUIT SORTES DE MANCHES, une de chaque, mélangées :
 *   - P(A ∩ B) ou P(Ā ∩ B) sur l'arbre. LES PIÈGES : la branche seule, la
 *     somme au lieu du produit, P(A) au lieu de P(Ā) ;
 *   - LES PROBABILITÉS TOTALES. LES PIÈGES : un seul chemin, les branches non
 *     pondérées ;
 *   - INVERSER UN CONDITIONNEMENT SUR L'ARBRE, P_B(A). LES PIÈGES : P_A(B)
 *     (LA confusion), P(A ∩ B) sans diviser par P(B) ;
 *   - P_B(A) ou P_A(B) avec P(A), P(B) et P(A ∩ B). LES PIÈGES : diviser par
 *     la mauvaise probabilité, ne pas diviser ;
 *   - LA NOTATION : « parmi les internes, 30 % font du sport », est-ce P_I(S),
 *     P_S(I) ou P(I ∩ S) ? Banque de contextes écrite à la main ;
 *   - L'INDÉPENDANCE : A et B sont-ils indépendants ? LE PIÈGE : croire que
 *     des événements incompatibles sont indépendants ;
 *   - CALCULER AVEC L'INDÉPENDANCE : P(A ∩ B) = P(A) × P(B), et P(A ∪ B).
 *     LES PIÈGES : additionner, confondre ∩ et ∪, oublier de retirer
 *     l'intersection ;
 *   - DEUX ÉPREUVES INDÉPENDANTES : exactement un succès, deux succès, au
 *     moins un. LES PIÈGES : un seul des deux ordres, l'événement contraire
 *     mal choisi.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = {
  cle: 'probabilites-conditionnelles', titre: 'Les probabilités conditionnelles', matiereCode: 'MATHS',
};

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Les probabilités conditionnelles',
    accroche: 'Arbres, sachant que, indépendance.',
    competences: [
      'MATH_1RE_PROBA_COND', 'MATH_1RE_AUTO_PROBA_NOTATIONS', 'MATH_1RE_PROBA_ARBRE',
      'MATH_1RE_PROBA_INDEP', 'MATH_1RE_PROBA_DEUX_EPREUVES',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const A_BARRE = 'Ā';

/** Une probabilité donnée en centièmes entiers : « 0,18 », « 0,2 », « 1 », « 0 ». */
export function cent(k) {
  if (k === 0) return '0';
  if (k === 100) return '1';
  return (k / 100).toFixed(2).replace(/0+$/, '').replace('.', ',');
}
const dix = (k) => cent(10 * k);

/** Un quotient arrondi au centième, toujours avec deux décimales. */
export const auCentieme = (x) => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');

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

/** Des voisins d'une probabilité en centièmes, qui restent entre 0 et 1. */
const voisinCent = (bonne, pas = 3) => (k) => cent(bonne + k * pas <= 100 ? bonne + k * pas : bonne - k * pas);

/** Un piège en centièmes, gardé seulement s'il reste une probabilité. */
const proba = (k) => (k >= 0 && k <= 100 ? cent(k) : null);

/** L'arbre décrit en texte. */
const arbre = (a, b, c) => `P(A) = ${dix(a)} ; P_A(B) = ${dix(b)} ; P_${A_BARRE}(B) = ${dix(c)}.`;

/** Un arbre : P(A), P_A(B), P_Ā(B) en dixièmes, les deux branches différentes. */
function tirerArbre(t) {
  const a = t.entre(1, 9);
  const b = t.entre(1, 9);
  let c;
  do {
    c = t.entre(1, 9);
  } while (c === b);
  return [a, b, c];
}

/* -------------------------------------------------------- l'intersection */

function intersection(t) {
  const [a, b, c] = tirerArbre(t);
  if (t.tirer() < 0.6) {
    const bonne = a * b;
    return manche(t.melanger, {
      consigne: 'intersection',
      question: `${arbre(a, b, c)}   P(A ∩ B) = ?`,
      bonne: cent(bonne),
      pieges: [[cent(10 * b), 'intersection-produit'], [proba(10 * (a + b)), 'multiplier-le-long']],
      voisin: voisinCent(bonne),
    });
  }
  const bonne = (10 - a) * c;
  return manche(t.melanger, {
    consigne: 'intersection',
    question: `${arbre(a, b, c)}   P(${A_BARRE} ∩ B) = ?`,
    bonne: cent(bonne),
    pieges: [[cent(10 * c), 'intersection-produit'], [cent(a * c), 'complementaire']],
    voisin: voisinCent(bonne),
  });
}

/* ------------------------------------------------- les probabilités totales */

function totales(t) {
  const [a, b, c] = tirerArbre(t);
  const bonne = a * b + (10 - a) * c;
  return manche(t.melanger, {
    consigne: 'totales',
    question: `${arbre(a, b, c)}   P(B) = ?`,
    bonne: cent(bonne),
    pieges: [
      [cent(a * b), 'les-deux-chemins'],
      [proba(10 * (b + c)), 'ponderer-les-branches'],
      [proba(a * (b + c)), 'complementaire'],
    ],
    voisin: voisinCent(bonne),
  });
}

/* ----------------------------------------- inverser le conditionnement */

/**
 * n / d tombe-t-il pile sur un demi-centième (0,375) ? On écarte ces tirages :
 * l'arrondi y dépendrait de la convention, et la calculatrice hésiterait.
 */
const demiCentieme = (n, d) => (1000 * n) % d === 0 && ((1000 * n) / d) % 10 === 5;

/** Les pièges d'un quotient arrondi : écartés s'ils tombent trop près de la valeur exacte. */
const loinDe = (exact) => ([v]) => v !== null && Math.abs(v - exact) > 0.01;

function bayes(t) {
  let a;
  let b;
  let c;
  do {
    [a, b, c] = tirerArbre(t);
  } while (demiCentieme(a * b, a * b + (10 - a) * c));
  const inter = a * b;
  const exact = inter / (inter + (10 - a) * c);
  return manche(t.melanger, {
    consigne: 'bayes',
    question: `${arbre(a, b, c)}   P_B(A) = ? (au centième)`,
    bonne: auCentieme(exact),
    pieges: [[b / 10, 'conditionnement-inverse'], [inter / 100, 'diviser-par-p-de-b']]
      .filter(loinDe(exact))
      .map(([v, phrase]) => [auCentieme(v), phrase]),
    voisin: (k) => auCentieme(exact + (exact + 0.04 * k <= 1 ? 0.04 * k : -0.04 * k)),
  });
}

function inverser(t) {
  let pa;
  let pb;
  let x;
  let inter;
  const versA = t.tirer() < 0.5;
  do {
    pb = t.entre(2, 8);
    x = t.entre(1, 9);
    inter = pb * x;
    pa = t.entre(1, 9);
  } while (
    pa === pb || 10 * pa < inter || 10 * pa + 10 * pb - inter > 100
    || demiCentieme(inter, 10 * (versA ? pb : pa))
  );
  // P_B(A) = P(A ∩ B) / P(B) ; P_A(B) = P(A ∩ B) / P(A).
  const exact = versA ? inter / (10 * pb) : inter / (10 * pa);
  const inverse = versA ? inter / (10 * pa) : inter / (10 * pb);
  return manche(t.melanger, {
    consigne: 'inverser',
    question: `P(A) = ${dix(pa)} ; P(B) = ${dix(pb)} ; P(A ∩ B) = ${cent(inter)}.   ${versA ? 'P_B(A)' : 'P_A(B)'} = ? (au centième)`,
    bonne: auCentieme(exact),
    pieges: [[inverse, 'conditionnement-inverse'], [inter / 100, 'intersection-pas-conditionnelle']]
      .filter(loinDe(exact))
      .map(([v, phrase]) => [auCentieme(v), phrase]),
    voisin: (k) => auCentieme(exact + (exact + 0.04 * k <= 1 ? 0.04 * k : -0.04 * k)),
  });
}

/* ------------------------------------------------------------ la notation */

/** Les contextes : deux événements, et trois façons de donner un pourcentage. */
export const CONTEXTES = [
  {
    e: ['I', 'S'],
    qui: 'un élève',
    defs: 'I : « l’élève est interne » ; S : « l’élève fait du sport »',
    sachantA: 'Dans un lycée, parmi les internes, {x} % font du sport.',
    sachantB: 'Dans un lycée, parmi les élèves qui font du sport, {x} % sont internes.',
    et: 'Dans un lycée, {x} % des élèves sont internes et font du sport.',
  },
  {
    e: ['M', 'T'],
    qui: 'une personne',
    defs: 'M : « la personne est malade » ; T : « son test est positif »',
    sachantA: 'Pour un dépistage, parmi les personnes malades, {x} % ont un test positif.',
    sachantB: 'Pour un dépistage, parmi les personnes au test positif, {x} % sont malades.',
    et: 'Pour un dépistage, {x} % des personnes sont malades et ont un test positif.',
  },
  {
    e: ['N', 'D'],
    qui: 'une pièce',
    defs: 'N : « la pièce est fabriquée de nuit » ; D : « elle est défectueuse »',
    sachantA: 'Dans une usine, parmi les pièces fabriquées de nuit, {x} % sont défectueuses.',
    sachantB: 'Dans une usine, parmi les pièces défectueuses, {x} % ont été fabriquées de nuit.',
    et: 'Dans une usine, {x} % des pièces sont fabriquées de nuit et défectueuses.',
  },
  {
    e: ['J', 'L'],
    qui: 'une personne',
    defs: 'J : « la personne a moins de vingt-cinq ans » ; L : « elle lit un quotidien »',
    sachantA: 'Dans une ville, parmi les moins de vingt-cinq ans, {x} % lisent un quotidien.',
    sachantB: 'Dans une ville, parmi les lecteurs d’un quotidien, {x} % ont moins de vingt-cinq ans.',
    et: 'Dans une ville, {x} % des habitants ont moins de vingt-cinq ans et lisent un quotidien.',
  },
  {
    e: ['V', 'R'],
    qui: 'un jour de l’année',
    defs: 'V : « il y a du vent » ; R : « le ferry est en retard »',
    sachantA: 'Les jours de vent, le ferry est en retard dans {x} % des cas.',
    sachantB: 'Les jours où le ferry est en retard, il y a du vent dans {x} % des cas.',
    et: 'Il y a du vent et le ferry est en retard pendant {x} % des jours.',
  },
];

function notation(t) {
  const ctx = t.au(CONTEXTES);
  const [A, B] = ctx.e;
  const x = 5 * t.entre(1, 19);
  const sorte = t.au(['sachantA', 'sachantB', 'et']);
  const pAB = `P_${A}(${B})`;
  const pBA = `P_${B}(${A})`;
  const inter = `P(${A} ∩ ${B})`;
  let bonne;
  let pieges;
  if (sorte === 'sachantA') {
    bonne = pAB;
    pieges = { [pBA]: 'parmi-donne-la-condition', [inter]: 'parmi-pas-intersection' };
  } else if (sorte === 'sachantB') {
    bonne = pBA;
    pieges = { [pAB]: 'parmi-donne-la-condition', [inter]: 'parmi-pas-intersection' };
  } else {
    bonne = inter;
    pieges = { [pAB]: 'intersection-sans-parmi', [pBA]: 'intersection-sans-parmi' };
  }
  return {
    consigne: 'notation',
    question: `${ctx[sorte].replace('{x}', String(x))} On choisit ${ctx.qui} au hasard. ${ctx.defs}. Que représente ${cent(x)} ?`,
    choix: cartes(t.melanger([pAB, pBA, inter])),
    bonne,
    pieges,
  };
}

/* -------------------------------------------------------- l'indépendance */

const OUI = 'Oui';
const NON = 'Non';
const SAIS_PAS = 'On ne peut pas savoir';

function independance(t) {
  let a;
  let b;
  let inter;
  let sorte;
  do {
    a = t.entre(1, 9);
    b = t.entre(1, 9);
    const r = t.tirer();
    sorte = r < 0.5 ? 'oui' : (r < 0.75 ? 'incompatibles' : 'non');
    if (sorte === 'oui') inter = a * b;
    else if (sorte === 'incompatibles') inter = 0;
    else inter = a * b + (t.tirer() < 0.5 ? -1 : 1) * t.entre(1, 9);
  } while (
    inter < 0 || inter > 10 * Math.min(a, b) || 10 * (a + b) - inter > 100
    || (sorte !== 'oui' && inter === a * b) || (sorte === 'non' && inter === 0)
  );
  const bonne = sorte === 'oui' ? OUI : NON;
  const autre = sorte === 'oui' ? NON : OUI;
  return {
    consigne: 'independance',
    question: `P(A) = ${dix(a)} ; P(B) = ${dix(b)} ; P(A ∩ B) = ${cent(inter)}. A et B sont-ils indépendants ?`,
    choix: cartes([OUI, NON, SAIS_PAS]),
    bonne,
    pieges: {
      [autre]: sorte === 'incompatibles' ? 'incompatibles-pas-independants' : 'independance-produit',
      [SAIS_PAS]: 'independance-on-peut-savoir',
    },
  };
}

function independanceCalcul(t) {
  const a = t.entre(1, 9);
  const b = t.entre(1, 9);
  const union = 10 * (a + b) - a * b;
  const debut = `A et B sont indépendants ; P(A) = ${dix(a)} et P(B) = ${dix(b)}.`;
  if (t.tirer() < 0.5) {
    return manche(t.melanger, {
      consigne: 'independance-calcul',
      question: `${debut}   P(A ∩ B) = ?`,
      bonne: cent(a * b),
      pieges: [[proba(10 * (a + b)), 'intersection-pas-somme'], [cent(union), 'union-ou-intersection']],
      voisin: voisinCent(a * b),
    });
  }
  return manche(t.melanger, {
    consigne: 'independance-calcul',
    question: `${debut}   P(A ∪ B) = ?`,
    bonne: cent(union),
    pieges: [[proba(10 * (a + b)), 'union-retirer-intersection'], [cent(a * b), 'union-ou-intersection']],
    voisin: voisinCent(union),
  });
}

/* --------------------------------------------- deux épreuves indépendantes */

export const EPREUVES = [
  {
    intro: 'Un archer atteint la cible avec une probabilité de {p}. Il tire deux flèches, de façon indépendante.',
    succes: 'd’atteindre la cible',
  },
  {
    intro: 'Une pièce truquée tombe sur pile avec une probabilité de {p}. On la lance deux fois.',
    succes: 'd’obtenir pile',
  },
  {
    intro: 'Une joueuse réussit un lancer franc avec une probabilité de {p}. Elle en tire deux, de façon indépendante.',
    succes: 'de réussir le lancer',
  },
  {
    intro: 'Dans une urne, la proportion de boules rouges est {p}. On tire une boule, on la remet, et on recommence.',
    succes: 'de tirer une boule rouge',
  },
];

function deuxEpreuves(t) {
  const ctx = t.au(EPREUVES);
  const k = t.entre(2, 8);
  const q = 10 - k;
  const sorte = t.au(['une', 'deux', 'au-moins']);
  const debut = ctx.intro.replace('{p}', dix(k));
  if (sorte === 'une') {
    const bonne = 2 * k * q;
    return manche(t.melanger, {
      consigne: 'deux-epreuves',
      question: `${debut} Probabilité ${ctx.succes} exactement une fois ?`,
      bonne: cent(bonne),
      pieges: [[cent(k * q), 'les-deux-ordres'], [cent(k * k), 'exactement-une-fois']],
      voisin: voisinCent(bonne),
    });
  }
  if (sorte === 'deux') {
    const bonne = k * k;
    return manche(t.melanger, {
      consigne: 'deux-epreuves',
      question: `${debut} Probabilité ${ctx.succes} les deux fois ?`,
      bonne: cent(bonne),
      pieges: [[proba(20 * k), 'deux-epreuves-produit'], [cent(10 * k), 'deux-epreuves-produit']],
      voisin: voisinCent(bonne),
    });
  }
  const bonne = 100 - q * q;
  return manche(t.melanger, {
    consigne: 'deux-epreuves',
    question: `${debut} Probabilité ${ctx.succes} au moins une fois ?`,
    bonne: cent(bonne),
    pieges: [[cent(q * q), 'au-moins-un-contraire'], [cent(2 * k * q), 'au-moins-un-inclut-deux']],
    voisin: voisinCent(bonne),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  if (!PAR_CLASSE[niveau]) return serie(graine, CLASSES[0]);
  const t = outils(graine);
  return t.melanger([
    intersection(t), totales(t), bayes(t), inverser(t),
    notation(t), independance(t), independanceCalcul(t), deuxEpreuves(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  intersection: 'Lis l’arbre, et calcule la probabilité de cette intersection.',
  totales: 'Calcule la probabilité de B avec la formule des probabilités totales.',
  bayes: 'Inverse le conditionnement : calcule la probabilité de A sachant B.',
  inverser: 'Calcule cette probabilité conditionnelle.',
  notation: 'Que représente ce nombre ? Choisis la bonne notation.',
  independance: 'Ces deux événements sont-ils indépendants ?',
  'independance-calcul': 'Les événements sont indépendants : calcule.',
  'deux-epreuves': 'Deux épreuves indépendantes : calcule cette probabilité.',

  'intersection-produit': 'La branche seule donne une probabilité conditionnelle. Pour l’intersection, multiplie les probabilités le long du chemin.',
  'multiplier-le-long': 'Le long d’un chemin, on multiplie les probabilités : on ne les additionne pas.',
  complementaire: 'Pour la branche du contraire de A, prends la probabilité du contraire : un moins la probabilité de A.',
  'les-deux-chemins': 'B peut arriver par deux chemins, avec A et sans A : additionne les probabilités des deux chemins.',
  'ponderer-les-branches': 'Chaque branche sachant A ou sachant non A doit être multipliée par la probabilité de sa condition, avant d’additionner.',
  'conditionnement-inverse': 'Attention, ce n’est pas la même chose : la probabilité de B sachant A n’est pas celle de A sachant B. Divise l’intersection par la probabilité de la condition.',
  'diviser-par-p-de-b': 'Tu as l’intersection, mais il faut encore la diviser par la probabilité de la condition.',
  'intersection-pas-conditionnelle': 'Ça, c’est l’intersection. La probabilité sachant une condition, c’est l’intersection divisée par la probabilité de la condition.',
  'parmi-donne-la-condition': 'Le groupe dans lequel on compte le pourcentage, c’est la condition : c’est l’événement qui se met en indice, sous le P.',
  'parmi-pas-intersection': 'On parle d’un pourcentage parmi un groupe : c’est une probabilité conditionnelle, pas une intersection.',
  'intersection-sans-parmi': 'Ici, aucun groupe n’est pris comme référence : le pourcentage porte sur tout le monde, et les deux conditions à la fois. C’est une intersection.',
  'independance-produit': 'Deux événements sont indépendants quand la probabilité de leur intersection est égale au produit de leurs probabilités. Calcule le produit, et compare.',
  'incompatibles-pas-independants': 'Incompatibles ne veut pas dire indépendants : ici l’intersection est nulle, alors que le produit des probabilités ne l’est pas.',
  'independance-on-peut-savoir': 'Tu as tout ce qu’il faut : calcule le produit des deux probabilités, et compare-le à celle de l’intersection.',
  'intersection-pas-somme': 'Pour des événements indépendants, la probabilité qu’ils arrivent tous les deux est le produit, pas la somme.',
  'union-ou-intersection': 'Le symbole en U renversé se lit « et » : les deux à la fois. Le symbole en U se lit « ou » : au moins l’un des deux.',
  'union-retirer-intersection': 'Pour la réunion, ajoute les deux probabilités, puis retire celle de l’intersection, comptée deux fois.',
  'les-deux-ordres': 'Exactement un succès, ça peut être succès puis échec, ou échec puis succès : deux chemins, à additionner.',
  'exactement-une-fois': 'Ça, c’est deux succès. Exactement une fois, c’est un succès et un échec, dans un ordre ou dans l’autre.',
  'deux-epreuves-produit': 'Deux succès de suite : on multiplie les probabilités le long du chemin, une fois par épreuve.',
  'au-moins-un-contraire': 'Ça, c’est la probabilité de n’avoir aucun succès. Au moins un, c’est son contraire : un moins cette probabilité.',
  'au-moins-un-inclut-deux': 'Au moins une fois, cela comprend aussi les deux fois. Passe par le contraire : aucun succès.',

  'intersection-regle': 'Sur un arbre, la probabilité d’une intersection est le produit des probabilités le long du chemin.',
  'totales-regle': 'Additionne les probabilités des chemins qui mènent à B : avec A, et avec son contraire.',
  'bayes-regle': 'Calcule d’abord la probabilité de B par les probabilités totales, puis divise celle de A et B par celle de B.',
  'inverser-regle': 'La probabilité de l’un sachant l’autre, c’est l’intersection divisée par la probabilité de la condition.',
  'notation-regle': 'Repère le groupe de référence : s’il y en a un, c’est la condition, en indice. Sinon, c’est une intersection.',
  'independance-regle': 'Compare la probabilité de l’intersection au produit des deux probabilités.',
  'independance-calcul-regle': 'Indépendants : l’intersection vaut le produit. La réunion vaut la somme, moins l’intersection.',
  'deux-epreuves-regle': 'Fais l’arbre des deux épreuves, multiplie le long des chemins, et additionne les chemins qui conviennent.',
};
