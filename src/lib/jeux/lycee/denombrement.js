/**
 * LE DÉNOMBREMENT — terminale générale, Nora (mathématiques).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (classe TERMINALE) :
 *   MATH_TLE_DENOMBR_REPRESENTER, MATH_TLE_DENOMBR_PRINCIPES,
 *   MATH_TLE_DENOMBR_KUPLETS, MATH_TLE_DENOMBR_PERMUTATIONS,
 *   MATH_TLE_DENOMBR_COMBINAISONS, MATH_TLE_DENOMBR_PASCAL
 *
 * DIX SORTES DE MANCHES (huit par partie, mélangées) :
 *   - QUEL MODÈLE ? une situation écrite à la main : k-uplet (ordre et
 *     répétition), arrangement (ordre, sans répétition) ou combinaison (ni
 *     ordre ni répétition). LES PIÈGES : l'ordre compte ou pas, la répétition
 *     est permise ou pas ;
 *   - LES PRINCIPES : un menu (on multiplie) ou un choix unique entre deux
 *     listes (on additionne). LE PIÈGE : se tromper de principe ;
 *   - LES k-UPLETS : nᵏ. LES PIÈGES : n × k, kⁿ, l'arrangement ;
 *   - LES ARRANGEMENTS : un podium, un bureau, un tirage sans remise. LES
 *     PIÈGES : C(n, k) (l'ordre compte !), nᵏ, n! ;
 *   - LES PERMUTATIONS : n!. LES PIÈGES : nⁿ, 1 + 2 + … + n ;
 *   - LES COMBINAISONS : C(n, k). LES PIÈGES : l'arrangement, nᵏ ;
 *   - LES CHEMINS ET LES MOTS : C(a + b, a). LES PIÈGES : (a + b)!, 2^(a+b) ;
 *   - LE TRIANGLE DE PASCAL : C(n + 1, k) à partir de la ligne n. LES
 *     PIÈGES : les mauvais voisins, le produit, la ligne du dessus ;
 *   - LA SYMÉTRIE : C(n, n − k) = C(n, k). LES PIÈGES : C(n − k, k), et un
 *     complément mal calculé ;
 *   - LES PARTIES : 2ⁿ. LES PIÈGES : oublier l'ensemble vide, n², n!.
 *
 * Toutes les réponses sont calculées ; un piège qui tomberait sur la bonne
 * valeur est écarté.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'denombrement', titre: 'Le dénombrement', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TERMINALE: {
    titre: 'Le dénombrement',
    accroche: 'L’ordre compte-t-il ? Et la répétition ?',
    competences: [
      'MATH_TLE_DENOMBR_REPRESENTER', 'MATH_TLE_DENOMBR_PRINCIPES', 'MATH_TLE_DENOMBR_KUPLETS',
      'MATH_TLE_DENOMBR_PERMUTATIONS', 'MATH_TLE_DENOMBR_COMBINAISONS', 'MATH_TLE_DENOMBR_PASCAL',
    ],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* ------------------------------------------------------------- calculs */

export const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
/** Le nombre de k-uplets d'éléments distincts : n × (n − 1) × … (k facteurs). */
export const arr = (n, k) => (k > n ? null : fact(n) / fact(n - k));
export const comb = (n, k) => (k < 0 || k > n ? 0 : Math.round(fact(n) / (fact(k) * fact(n - k))));

/** Un entier à la française : « 35 960 », séparé par une espace fine insécable. */
export function nombre(x) {
  const s = String(Math.abs(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return x < 0 ? `−${s}` : s;
}

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/**
 * Une manche numérique : la bonne valeur, ses pièges nommés (une valeur
 * égale à la bonne est écartée), des voisins si les pièges manquent.
 */
function manche(t, {
  consigne, question, bonne, pieges = [], voisin,
}) {
  const b = nombre(bonne);
  const valides = t.melanger(pieges).filter(([v]) => v !== null && Number.isFinite(v) && v > 0 && v !== bonne);
  const liste = troisChoix(b, valides.map(([v]) => nombre(v)), (k) => nombre(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = nombre(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  return {
    consigne, question, choix: cartes(t.melanger(liste)), bonne: b, pieges: table,
  };
}

/* ------------------------------------------------------ quel modèle ? */

const MODELES = {
  kuplet: 'k-uplet : nᵏ',
  arrangement: 'Arrangement',
  combinaison: 'Combinaison',
};

/** [situation, le bon modèle] — écrites à la main, une seule lecture possible. */
export const SITUATIONS = [
  ['Un code de carte bancaire à 4 chiffres.', 'kuplet'],
  ['On lance 3 fois une pièce et on note la suite des pile ou face.', 'kuplet'],
  ['On tire successivement 3 boules avec remise, en notant l’ordre.', 'kuplet'],
  ['Les réponses cochées à un QCM de 10 questions, 4 choix par question.', 'kuplet'],
  ['Un mot de passe de 6 caractères, répétitions permises.', 'kuplet'],
  ['Le podium (or, argent, bronze) d’une course de 10 coureurs.', 'arrangement'],
  ['On tire successivement 3 boules sans remise, en notant l’ordre.', 'arrangement'],
  ['Élire un président et un vice-président parmi 20 personnes.', 'arrangement'],
  ['Remettre 3 prix différents à 3 des 25 élèves d’une classe.', 'arrangement'],
  ['Un mot de 4 lettres toutes différentes, pris dans l’alphabet.', 'arrangement'],
  ['Une main de 5 cartes tirée d’un jeu de 32 cartes.', 'combinaison'],
  ['On tire simultanément 3 boules d’une urne de 10 boules.', 'combinaison'],
  ['Choisir 2 délégués, sans rôle particulier, dans une classe de 30.', 'combinaison'],
  ['Cocher 5 numéros parmi 49 sur une grille de loto.', 'combinaison'],
  ['Les poignées de main entre 8 personnes, chaque paire une seule fois.', 'combinaison'],
  ['Former un groupe de 4 élèves parmi 12.', 'combinaison'],
];

/** La phrase d'un mauvais modèle : [le bon][celui qu'on a choisi]. */
const ERREUR_DE_MODELE = {
  kuplet: { arrangement: 'repetition-permise', combinaison: 'ordre-compte' },
  arrangement: { kuplet: 'sans-repetition', combinaison: 'ordre-compte' },
  combinaison: { arrangement: 'ordre-ne-compte-pas', kuplet: 'ordre-ne-compte-pas' },
};

function modele([situation, bon], t) {
  return {
    consigne: 'quel-modele',
    question: `${situation}\nQuel modèle pour compter ?`,
    choix: t.melanger(Object.entries(MODELES).map(([cle, libelle]) => ({ cle, libelle }))),
    bonne: bon,
    pieges: ERREUR_DE_MODELE[bon],
  };
}

/* ------------------------------------------------------- les principes */

function principes(t) {
  if (t.entre(0, 1) === 0) {
    const [a, b, c] = [t.entre(2, 6), t.entre(3, 8), t.entre(2, 6)];
    return manche(t, {
      consigne: 'principes',
      question: `Un menu propose ${a} entrées, ${b} plats et ${c} desserts. Combien de menus entrée-plat-dessert ?`,
      bonne: a * b * c,
      pieges: [[a + b + c, 'principe-multiplicatif'], [a * b + c, 'principe-multiplicatif']],
      voisin: (k) => a * b * c + k * a,
    });
  }
  const [a, b] = [t.entre(3, 9), t.entre(3, 9)];
  return manche(t, {
    consigne: 'principes',
    question: `Ce soir, on regarde un seul film, parmi ${a} comédies et ${b} drames. Combien de choix ?`,
    bonne: a + b,
    pieges: [[a * b, 'principe-additif']],
    voisin: (k) => a + b + k,
  });
}

/* --------------------------------------------------------- les k-uplets */

const KUPLETS = [
  (t) => {
    const [k, n] = [t.entre(3, 4), t.entre(4, 10)];
    return [n, k, `Un cadenas a ${k} molettes, chacune portant ${n} symboles. Combien de réglages possibles ?`];
  },
  (t) => {
    const [k, n] = [t.entre(2, 4), t.au([4, 6, 8])];
    return [n, k, `On lance ${k} fois un dé à ${n} faces et on note la suite des résultats. Combien de suites possibles ?`];
  },
  (t) => {
    const [k, n] = [t.entre(2, 4), t.entre(3, 6)];
    return [n, k, `Combien de mots de ${k} lettres, avec ou sans sens, écrits avec un alphabet de ${n} lettres, répétitions permises ?`];
  },
  (t) => {
    const [k, n] = [t.entre(3, 5), t.entre(3, 4)];
    return [n, k, `Un QCM compte ${k} questions, à ${n} réponses chacune ; on coche une réponse par question. Combien de grilles possibles ?`];
  },
];

function kuplets(t) {
  const [n, k, question] = t.au(KUPLETS)(t);
  return manche(t, {
    consigne: 'k-uplets',
    question,
    bonne: n ** k,
    pieges: [[n * k, 'puissance-pas-produit'], [k ** n, 'puissance-a-l-envers'], [arr(n, k), 'repetition-permise']],
    voisin: (j) => n ** k + j * n,
  });
}

/* ----------------------------------------------------- les arrangements */

const ARRANGEMENTS = [
  (t) => {
    const n = t.entre(5, 10);
    return [n, 3, `${n} coureurs prennent le départ. Combien de podiums (or, argent, bronze) possibles ?`];
  },
  (t) => {
    const n = t.entre(5, 10);
    return [n, 3, `Une association de ${n} membres élit un président, un trésorier et un secrétaire, trois personnes différentes. Combien de bureaux possibles ?`];
  },
  (t) => {
    const [k, n] = [t.entre(2, 4), t.entre(6, 10)];
    return [n, k, `On tire successivement et sans remise ${k} boules d’une urne de ${n} boules numérotées, en notant l’ordre. Combien de tirages ?`];
  },
];

function arrangements(t) {
  const [n, k, question] = t.au(ARRANGEMENTS)(t);
  return manche(t, {
    consigne: 'arrangements',
    question,
    bonne: arr(n, k),
    pieges: [[comb(n, k), 'ordre-compte'], [n ** k, 'sans-repetition'], [fact(n), 'pas-tous-ranges']],
    voisin: (j) => arr(n, k) + j * n,
  });
}

/* ----------------------------------------------------- les permutations */

/** Des mots aux lettres toutes différentes. */
export const MOTS_DISTINCTS = ['MATHS', 'CHIEN', 'PRIME', 'LIVRE', 'ROUGE', 'NUAGE', 'PLAGE', 'BLEU', 'JARDIN', 'CARTON'];

function permutations(t) {
  const sorte = t.entre(0, 2);
  let n;
  let question;
  if (sorte === 0) {
    n = t.entre(4, 8);
    question = `De combien de façons peut-on ranger ${n} livres différents sur une étagère ?`;
  } else if (sorte === 1) {
    n = t.entre(4, 8);
    question = `De combien de façons ${n} amis peuvent-ils se placer en file indienne ?`;
  } else {
    const mot = t.au(MOTS_DISTINCTS);
    n = mot.length;
    question = `Combien d’anagrammes, avec ou sans sens, du mot ${mot} ?`;
  }
  return manche(t, {
    consigne: 'permutations',
    question,
    bonne: fact(n),
    pieges: [[n ** n, 'sans-repetition'], [(n * (n + 1)) / 2, 'factorielle-produit']],
    voisin: (j) => fact(n) + j * n,
  });
}

/* ----------------------------------------------------- les combinaisons */

const COMBINAISONS = [
  (t) => {
    const [k, n] = [t.entre(2, 3), t.entre(10, 30)];
    return [n, k, `Dans une classe de ${n} élèves, on choisit ${k} délégués, sans rôle particulier. Combien de choix ?`];
  },
  (t) => {
    const k = t.entre(2, 5);
    return [32, k, `Combien de mains de ${k} cartes peut-on tirer d’un jeu de 32 cartes ?`];
  },
  (t) => {
    const [k, n] = [t.entre(2, 4), t.entre(6, 12)];
    return [n, k, `On tire simultanément ${k} boules d’une urne de ${n} boules. Combien de tirages ?`];
  },
  (t) => {
    const [k, n] = [t.entre(3, 5), t.entre(8, 14)];
    return [n, k, `On forme une équipe de ${k} joueurs parmi ${n}. Combien d’équipes possibles ?`];
  },
];

function combinaisons(t) {
  const [n, k, question] = t.au(COMBINAISONS)(t);
  return manche(t, {
    consigne: 'combinaisons',
    question,
    bonne: comb(n, k),
    pieges: [[arr(n, k), 'ordre-ne-compte-pas'], [n ** k, 'sans-repetition']],
    voisin: (j) => comb(n, k) + j * n,
  });
}

/* ------------------------------------------------- les chemins, les mots */

function chemins(t) {
  let a;
  let b;
  let question;
  if (t.entre(0, 1) === 0) {
    [a, b] = [t.entre(2, 5), t.entre(2, 5)];
    question = `Sur un quadrillage, on va de A à B en ${a} pas vers la droite et ${b} pas vers le haut, dans un ordre quelconque. Combien de chemins ?`;
  } else {
    const n = t.entre(5, 9);
    a = t.entre(2, n - 2);
    b = n - a;
    question = `Combien de mots de ${n} lettres contiennent exactement ${a} fois la lettre A, les autres lettres étant des B ?`;
  }
  return manche(t, {
    consigne: 'chemins',
    question,
    bonne: comb(a + b, a),
    pieges: [[fact(a + b), 'pas-identiques'], [2 ** (a + b), 'nombre-impose']],
    voisin: (j) => comb(a + b, a) + j,
  });
}

/* ------------------------------------------------ le triangle de Pascal */

function pascal(t) {
  const n = t.entre(4, 8);
  const k = t.entre(2, n - 1);
  const ligne = Array.from({ length: n + 1 }, (_, i) => comb(n, i));
  return manche(t, {
    consigne: 'pascal',
    question: `Ligne n = ${n} du triangle de Pascal :\n${ligne.join('   ')}\nCombien vaut C(${n + 1}, ${k}) ?`,
    bonne: comb(n + 1, k),
    pieges: [
      [comb(n, k) + comb(n, k + 1), 'pascal-voisins'],
      [comb(n, k - 1) * comb(n, k), 'pascal-additionner'],
      [comb(n, k), 'pascal-ligne'],
    ],
    voisin: (j) => comb(n + 1, k) + j,
  });
}

/** C(n, n − k), à chercher parmi des coefficients écrits C(…, …). */
function symetrie(t) {
  const n = t.entre(12, 20);
  const k = t.entre(2, 4);
  const ecrit = (a, b) => `C(${a}, ${b})`;
  const bonne = ecrit(n, k);
  const pieges = [[ecrit(n - k, k), 'symetrie-meme-n'], [ecrit(n, k + 1), 'symetrie-n-moins-k']];
  const liste = troisChoix(bonne, pieges.map(([c]) => c), (j) => ecrit(n, k + 1 + j));
  return {
    consigne: 'symetrie',
    question: `Quel coefficient est égal à C(${n}, ${n - k}) ?`,
    choix: cartes(t.melanger(liste)),
    bonne,
    pieges: Object.fromEntries(pieges),
  };
}

/* ---------------------------------------------------------- les parties */

function parties(t) {
  const n = t.entre(3, 8);
  const question = t.entre(0, 1) === 0
    ? `Une pizzeria propose ${n} garnitures ; on en choisit autant qu’on veut, même aucune. Combien de pizzas différentes ?`
    : `Combien de parties compte un ensemble à ${n} éléments ?`;
  return manche(t, {
    consigne: 'parties',
    question,
    bonne: 2 ** n,
    pieges: [[2 ** n - 1, 'partie-vide'], [n * n, 'deux-puissance-n'], [fact(n), 'parties-sans-ordre']],
    voisin: (j) => 2 ** n + j,
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  const [s1, s2] = t.melanger(SITUATIONS);
  const liste = [
    modele(s1, t), modele(s2, t),
    principes(t),
    kuplets(t),
    t.entre(0, 1) === 0 ? arrangements(t) : permutations(t),
    t.entre(0, 1) === 0 ? combinaisons(t) : chemins(t),
    t.entre(0, 1) === 0 ? pascal(t) : symetrie(t),
    parties(t),
  ];
  return t.melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'quel-modele': 'L’ordre compte-t-il ? La répétition est-elle permise ? Choisis le bon modèle.',
  principes: 'Faut-il additionner ou multiplier ? Compte les possibilités.',
  'k-uplets': 'Compte ces listes ordonnées, où la répétition est permise.',
  arrangements: 'Compte ces listes ordonnées d’éléments tous différents.',
  permutations: 'De combien de façons peut-on ranger tout le monde ?',
  combinaisons: 'Compte ces choix, où l’ordre ne compte pas.',
  chemins: 'Compte ces chemins, ou ces mots : il suffit de choisir des places.',
  pascal: 'Utilise la relation de Pascal pour trouver ce coefficient.',
  symetrie: 'Trouve le coefficient binomial qui a la même valeur.',
  parties: 'Compte toutes les façons de choisir des éléments, en nombre quelconque.',

  'repetition-permise': 'Ici, un même élément peut revenir : chaque place a toujours toutes ses possibilités. C’est n puissance k, pas un arrangement.',
  'ordre-compte': 'Ici, l’ordre compte : changer l’ordre donne un autre résultat. Ce n’est pas une combinaison.',
  'sans-repetition': 'Ici, un élément ne peut pas servir deux fois : le nombre de possibilités baisse d’une place à l’autre.',
  'ordre-ne-compte-pas': 'Ici, l’ordre ne compte pas : un groupe reste le même groupe, quel que soit l’ordre de ses membres. C’est une combinaison.',
  'principe-multiplicatif': 'On choisit une entrée ET un plat ET un dessert : on multiplie les nombres de possibilités.',
  'principe-additif': 'On choisit un seul film, dans l’une OU l’autre liste : les deux listes ne se mélangent pas, on additionne.',
  'puissance-pas-produit': 'Chaque place offre n possibilités, et il y a k places : on multiplie n par lui-même k fois. C’est une puissance, pas un produit par k.',
  'puissance-a-l-envers': 'La base, c’est le nombre de possibilités par place ; l’exposant, le nombre de places. Ne les inverse pas.',
  'pas-tous-ranges': 'On ne range pas tout le monde : seules les premières places comptent. Arrête le produit après autant de facteurs que de places.',
  'factorielle-produit': 'Factorielle n, c’est un produit : n fois n moins un, et ainsi de suite jusqu’à un. On multiplie, on n’additionne pas.',
  'pas-identiques': 'Les pas vers la droite sont identiques entre eux, tout comme les lettres A : les permuter ne change rien. Il suffit de choisir leurs places.',
  'nombre-impose': 'Le nombre de chaque pas, ou de chaque lettre, est imposé : on choisit seulement leurs places parmi toutes. C’est une combinaison.',
  'pascal-voisins': 'Le coefficient de la ligne suivante est la somme des deux nombres situés juste au-dessus : celui de même rang et celui qui le précède.',
  'pascal-additionner': 'La relation de Pascal est une somme : on additionne les deux voisins du dessus, on ne les multiplie pas.',
  'pascal-ligne': 'On demande un coefficient de la ligne suivante : additionne les deux voisins du dessus.',
  'symetrie-meme-n': 'Choisir ceux qu’on garde, c’est choisir ceux qu’on laisse : le nombre total reste le même, seul le nombre choisi devient son complément.',
  'symetrie-n-moins-k': 'Le complément se calcule exactement : le total moins le nombre choisi. Vérifie ta soustraction.',
  'partie-vide': 'L’ensemble vide est une partie aussi : ne l’oublie pas. Chaque élément est pris ou laissé, d’où deux puissance n.',
  'deux-puissance-n': 'Chaque élément a deux possibilités, pris ou laissé : on multiplie deux par lui-même autant de fois qu’il y a d’éléments.',
  'parties-sans-ordre': 'Une partie n’a pas d’ordre : on ne range pas les éléments, on décide seulement, pour chacun, s’il est pris ou laissé.',

  'quel-modele-regle': 'Deux questions : l’ordre compte-t-il, la répétition est-elle permise ? Ordre et répétition : n puissance k. Ordre sans répétition : arrangement. Ni l’un ni l’autre : combinaison.',
  'principes-regle': 'Un choix ET un autre : on multiplie. Un choix dans une liste OU dans une autre, sans élément commun : on additionne.',
  'k-uplets-regle': 'Chaque place offre toutes les possibilités : on multiplie n par lui-même autant de fois qu’il y a de places.',
  'arrangements-regle': 'n possibilités pour la première place, une de moins pour la suivante, et on s’arrête après autant de facteurs que de places.',
  'permutations-regle': 'Ranger n éléments distincts : n possibilités pour la première place, une de moins à chaque place. C’est factorielle n.',
  'combinaisons-regle': 'Sans ordre : on compte les listes ordonnées, puis on divise par le nombre de façons de ranger les éléments choisis. C’est k parmi n.',
  'chemins-regle': 'Un chemin, c’est un mot de droites et de hauts : on choisit les places des pas vers la droite parmi tous les pas.',
  'pascal-regle': 'Relation de Pascal : un coefficient de la ligne suivante est la somme des deux coefficients au-dessus de lui.',
  'symetrie-regle': 'Choisir k éléments parmi n, c’est aussi choisir les n moins k qu’on laisse : les deux coefficients sont égaux.',
  'parties-regle': 'Pour chaque élément, deux possibilités : pris ou laissé. On obtient deux puissance n parties, ensemble vide compris.',
};
