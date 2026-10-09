/**
 * LE DIAGRAMME — lire et résumer des données, de la 6e à la 3e.
 *
 * Aucun dessin : les tableaux et les diagrammes sont DÉCRITS en texte dans la
 * question (les valeurs, les angles, les graduations).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_DATA_TABLEAU, MATH_6E_DATA_GRAPHIQUE
 *   5e : MATH_5E_STAT_EFFECTIFS, MATH_5E_STAT_MOYENNE
 *   4e : MATH_4E_STAT_MOY_POND, MATH_4E_STAT_MEDIANE
 *   3e : MATH_3E_STAT_QUARTILES
 *
 * EN 6e (3 + 3 + 2) :
 *   - LE TABLEAU À DOUBLE ENTRÉE : LES PIÈGES, se tromper de ligne ou de
 *     colonne, oublier une ligne dans un total ;
 *   - LE DIAGRAMME CIRCULAIRE (angles) : LES PIÈGES, donner l'angle pour
 *     l'effectif, compter le disque pour 180° ;
 *   - LE DIAGRAMME EN BARRES : un écart (le piège : additionner), une barre
 *     entre deux graduations (le piège : lire le trait d'à côté).
 *
 * EN 5e (3 + 3 + 2) :
 *   - LA MOYENNE : LES PIÈGES, oublier de diviser, prendre le milieu entre la
 *     plus petite et la plus grande valeur ;
 *   - LA FRÉQUENCE : LES PIÈGES, donner l'effectif, diviser à l'envers ;
 *   - L'EFFECTIF À PARTIR D'UNE FRÉQUENCE : LE PIÈGE, diviser au lieu de multiplier.
 *
 * EN 4e (3 + 3 + 2) : LA MOYENNE PONDÉRÉE (piège : oublier les coefficients),
 * LA MÉDIANE (piège : ne pas ranger la série), L'ÉTENDUE.
 *
 * EN 3e (3 + 3 + 2) : LA MÉDIANE, LES QUARTILES (le rang se calcule et
 * s'arrondit à l'entier SUPÉRIEUR ; piège : arrondir en dessous, donner la
 * médiane), L'ÉTENDUE.
 *
 * QUARTILES, CONVENTION DU COLLÈGE : Q1 est la plus petite valeur de la série
 * rangée telle qu'au moins un quart des valeurs lui soient inférieures ou
 * égales, soit la valeur de rang n/4 arrondi à l'entier supérieur ; Q3, celle
 * de rang 3n/4 arrondi à l'entier supérieur.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'diagramme-college', titre: 'Le diagramme', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le diagramme',
    accroche: 'Lire un tableau et un diagramme.',
    competences: ['MATH_6E_DATA_TABLEAU', 'MATH_6E_DATA_GRAPHIQUE'],
  },
  CINQUIEME: {
    titre: 'Le diagramme',
    accroche: 'Moyenne, effectifs et fréquences.',
    competences: ['MATH_5E_STAT_EFFECTIFS', 'MATH_5E_STAT_MOYENNE'],
  },
  QUATRIEME: {
    titre: 'Le diagramme',
    accroche: 'Moyenne pondérée, médiane, étendue.',
    competences: ['MATH_4E_STAT_MOY_POND', 'MATH_4E_STAT_MEDIANE'],
  },
  TROISIEME: {
    titre: 'Le diagramme',
    accroche: 'Médiane, quartiles et étendue.',
    competences: ['MATH_3E_STAT_QUARTILES'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

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

/** « 12,5 » : un nombre à la française. */
const nombre = (x) => String(net(x)).replace('.', ',');

/** Un décimal qui s'écrit avec au plus deux chiffres après la virgule. */
const court = (x) => Number.isInteger(net(x * 100));
const siCourt = (x) => (court(x) ? nombre(x) : null);

const somme = (liste) => liste.reduce((a, b) => a + b, 0);
const range = (liste) => [...liste].sort((a, b) => a - b);

export function mediane(liste) {
  const r = range(liste);
  const n = r.length;
  return n % 2 ? r[(n - 1) / 2] : (r[n / 2 - 1] + r[n / 2]) / 2;
}

/** Des valeurs toutes différentes, entre deux bornes. */
function distinctes({ melanger }, n, min, max) {
  return melanger(Array.from({ length: max - min + 1 }, (_, i) => min + i)).slice(0, n);
}

/* ---------------------------------------------------------------- 6e */

const ACTIVITES = [
  ['foot', 'du foot'],
  ['danse', 'de la danse'],
  ['judo', 'du judo'],
  ['tennis', 'du tennis'],
  ['natation', 'de la natation'],
];

function tableau6(sorte, t) {
  const activites = t.melanger(ACTIVITES).slice(0, 3);
  const filles = distinctes(t, 3, 2, 15);
  const garcons = distinctes(t, 3, 2, 15);
  const ligne = (nom, valeurs) => `${nom} : ${activites.map(([a], i) => `${a} ${valeurs[i]}`).join(', ')}.`;
  const tableau = `${ligne('Filles', filles)} ${ligne('Garçons', garcons)}`;
  const j = t.entre(0, 2);
  const autre = (j + 1 + t.entre(0, 1)) % 3;
  const [, du] = activites[j];
  if (sorte === 'case') {
    const fille = t.au([true, false]);
    const [ici, la] = fille ? [filles, garcons] : [garcons, filles];
    return manche(t.melanger, {
      consigne: 'tableau',
      question: `${tableau} Combien de ${fille ? 'filles' : 'garçons'} font ${du} ?`,
      bonne: ici[j],
      pieges: [[la[j], 'ligne-colonne'], [ici[autre], 'ligne-colonne']],
      voisin: (k) => ici[j] + k,
    });
  }
  if (sorte === 'colonne') {
    return manche(t.melanger, {
      consigne: 'tableau',
      question: `${tableau} Combien d’élèves font ${du} en tout ?`,
      bonne: filles[j] + garcons[j],
      pieges: [[t.au([filles[j], garcons[j]]), 'additionner-la-colonne'], [filles[j] + garcons[autre], 'ligne-colonne']],
      voisin: (k) => filles[j] + garcons[j] + k,
    });
  }
  const total = somme(filles) + somme(garcons);
  return manche(t.melanger, {
    consigne: 'tableau',
    question: `${tableau} Combien d’élèves en tout ?`,
    bonne: total,
    pieges: [[t.au([somme(filles), somme(garcons)]), 'total-tout']],
    voisin: (k) => total + k,
  });
}

function circulaire6(t) {
  const activites = t.melanger(ACTIVITES).slice(0, 3);
  let angles;
  do {
    angles = [30 * t.entre(1, 8), 30 * t.entre(1, 8)];
    angles.push(360 - angles[0] - angles[1]);
  } while (angles[2] < 30 || new Set(angles).size < 3);
  const n = 12 * t.entre(2, 5);
  const i = t.entre(0, 2);
  const effectif = (n * angles[i]) / 360;
  const description = activites.map(([a], k) => `${a} ${angles[k]}°`).join(', ');
  return manche(t.melanger, {
    consigne: 'circulaire',
    question: `Diagramme circulaire de ${n} élèves : ${description}. Combien d’élèves font ${activites[i][1]} ?`,
    bonne: effectif,
    pieges: [[angles[i], 'angle-pas-effectif'], [(n * angles[i]) / 180, 'tour-complet']],
    voisin: (k) => effectif + k,
  });
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
const OBJETS_BARRES = ['vélos', 'trottinettes', 'livres empruntés', 'visiteurs'];

function barres6(sorte, t) {
  if (sorte === 'ecart') {
    const jours = JOURS.slice(0, 4);
    const valeurs = distinctes(t, 4, 3, 20);
    const [i, j] = t.melanger([0, 1, 2, 3]);
    const [g, p] = valeurs[i] > valeurs[j] ? [i, j] : [j, i];
    const description = jours.map((jour, k) => `${jour} ${valeurs[k]}`).join(', ');
    return manche(t.melanger, {
      consigne: 'barres',
      question: `Diagramme en barres des ${t.au(OBJETS_BARRES)} : ${description}. De combien la barre de ${jours[g]} dépasse-t-elle celle de ${jours[p]} ?`,
      bonne: valeurs[g] - valeurs[p],
      pieges: [[valeurs[g] + valeurs[p], 'ecart-soustraire']],
      voisin: (k) => valeurs[g] - valeurs[p] + k,
    });
  }
  const pas = t.au([2, 4, 10, 20]);
  const k = t.entre(1, 6);
  const objet = t.au(OBJETS_BARRES);
  return manche(t.melanger, {
    consigne: 'barres',
    question: `Diagramme en barres, axe gradué de ${pas} en ${pas}. La barre des ${objet} s’arrête juste au milieu, entre ${k * pas} et ${(k + 1) * pas}. Combien de ${objet} ?`,
    bonne: k * pas + pas / 2,
    pieges: [[k * pas, 'lire-entre-graduations'], [(k + 1) * pas, 'lire-entre-graduations']],
    voisin: (j) => k * pas + pas / 2 + j,
  });
}

/* ---------------------------------------------------------------- 5e */

function moyenne5(t) {
  const n = t.entre(4, 5);
  const notes = Array.from({ length: n }, () => t.entre(5, 19));
  const m = somme(notes) / n;
  return manche(t.melanger, {
    consigne: 'moyenne',
    question: `Notes : ${notes.join(' ; ')}. Moyenne ?`,
    bonne: nombre(m),
    pieges: [
      [somme(notes), 'diviser-par-effectif'],
      [nombre((Math.min(...notes) + Math.max(...notes)) / 2), 'moyenne-pas-milieu'],
    ],
    voisin: (k) => nombre(m + k),
  });
}

const MOYENS = [['à vélo', 'vélo'], ['à pied', 'à pied'], ['en bus', 'bus'], ['en voiture', 'voiture']];

function frequence5(t) {
  const total = t.au([20, 25, 40, 50]);
  const part = t.entre(1, total - 1);
  const [comment, nom] = t.au(MOYENS);
  return manche(t.melanger, {
    consigne: 'frequence',
    question: `Sur ${total} élèves, ${part} viennent ${comment}. Fréquence de « ${nom} », en écriture décimale ?`,
    bonne: nombre(part / total),
    pieges: [[part, 'effectif-pas-frequence'], [siCourt(total / part), 'frequence-inverse']],
    voisin: (k) => nombre((part + k) / total),
  });
}

const FREQUENCES = [0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8];

function effectif5(t) {
  let f;
  let n;
  do {
    f = t.au(FREQUENCES);
    n = t.entre(20, 36);
  } while (!Number.isInteger(net(n * f)));
  const e = net(n * f);
  return manche(t.melanger, {
    consigne: 'effectif',
    question: `Classe de ${n} élèves ; fréquence des demi-pensionnaires : ${nombre(f)}. Combien d’élèves sont demi-pensionnaires ?`,
    bonne: e,
    pieges: [[siCourt(n / f), 'effectif-multiplier'], [nombre(f * 100), 'frequence-pas-effectif']],
    voisin: (k) => e + k,
  });
}

/* ---------------------------------------------------------------- 4e */

function ponderee4(t) {
  // Une moyenne à un chiffre après la virgule au plus, des coefficients qui
  // ne sont pas tous égaux, et une moyenne simple qui s'écrit et qui diffère :
  // le piège « oublier les coefficients » est toujours là.
  const tirage = () => {
    const notes = distinctes(t, 3, 4, 19);
    const coefs = [t.entre(1, 4), t.entre(1, 4), t.entre(1, 4)];
    const total = notes[0] * coefs[0] + notes[1] * coefs[1] + notes[2] * coefs[2];
    return {
      notes, coefs, total, m: total / somme(coefs), simple: somme(notes) / 3,
    };
  };
  let essai = tirage();
  while (
    !Number.isInteger(net(essai.m * 10)) || new Set(essai.coefs).size === 1
    || !court(essai.simple) || net(essai.simple) === net(essai.m)
  ) essai = tirage();
  const {
    notes, coefs, total, m, simple,
  } = essai;
  const parTrois = total / 3;
  return manche(t.melanger, {
    consigne: 'ponderee',
    question: `Notes : ${notes.map((v, i) => `${v} (coefficient ${coefs[i]})`).join(' ; ')}. Moyenne ?`,
    bonne: nombre(m),
    pieges: [[siCourt(simple), 'oublier-coefficients'], [siCourt(parTrois), 'diviser-par-coefficients']],
    voisin: (k) => nombre(m + k),
  });
}

function mediane4(n, t) {
  // La série n'est pas rangée, et son milieu « brut » n'est pas la médiane :
  // le piège « ne pas ranger » est toujours là.
  const milieu = (s) => (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2);
  let serieBrute = distinctes(t, n, 1, 30);
  while (milieu(serieBrute) === mediane(serieBrute)) serieBrute = distinctes(t, n, 1, 30);
  const med = mediane(serieBrute);
  const r = range(serieBrute);
  const pieges = [[nombre(milieu(serieBrute)), 'ranger-d-abord']];
  if (n % 2 === 0) pieges.push([nombre(r[n / 2 - 1]), 'mediane-pair']);
  pieges.push([siCourt(somme(serieBrute) / n), 'mediane-pas-moyenne']);
  // Une place à côté : la valeur qui suit la médiane dans la série rangée.
  pieges.push([nombre(r[Math.floor(n / 2) + 1]), 'mediane-rang']);
  return manche(t.melanger, {
    consigne: 'mediane',
    question: `Série : ${serieBrute.join(' ; ')}. Médiane ?`,
    bonne: nombre(med),
    pieges,
    voisin: (k) => nombre(med + k),
  });
}

function etendue(t) {
  const n = t.entre(6, 9);
  const serieBrute = distinctes(t, n, 2, 40);
  const max = Math.max(...serieBrute);
  const min = Math.min(...serieBrute);
  const ecartBords = Math.abs(serieBrute[n - 1] - serieBrute[0]);
  return manche(t.melanger, {
    consigne: 'etendue',
    question: `Série : ${serieBrute.join(' ; ')}. Étendue ?`,
    bonne: max - min,
    pieges: [[ecartBords, 'etendue-extremes'], [max, 'etendue-ecart']],
    voisin: (k) => max - min + k,
  });
}

/* ---------------------------------------------------------------- 3e */

function quartile3(troisieme, t) {
  const n = t.au([9, 10, 11, 13, 14, 15]);
  const r = range(distinctes(t, n, 1, 40));
  const part = troisieme ? 3 : 1;
  const rang = Math.ceil((part * n) / 4);
  const rangBas = Math.floor((part * n) / 4);
  return manche(t.melanger, {
    consigne: 'quartile',
    question: `Série rangée : ${r.join(' ; ')}. ${troisieme ? 'Troisième' : 'Premier'} quartile ?`,
    bonne: r[rang - 1],
    pieges: [[r[rangBas - 1], 'rang-quartile'], [nombre(mediane(r)), 'quartile-pas-mediane']],
    voisin: (k) => r[rang - 1] + k,
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  let liste;
  if (niveau === 'TROISIEME') {
    liste = [
      mediane4(t.au([9, 11]), t), mediane4(t.au([10, 12]), t), mediane4(t.entre(9, 12), t),
      quartile3(false, t), quartile3(true, t), quartile3(t.au([true, false]), t),
      etendue(t), etendue(t),
    ];
  } else if (niveau === 'QUATRIEME') {
    liste = [
      ponderee4(t), ponderee4(t), ponderee4(t),
      mediane4(7, t), mediane4(8, t), mediane4(t.au([7, 9]), t),
      etendue(t), etendue(t),
    ];
  } else if (niveau === 'CINQUIEME') {
    liste = [
      moyenne5(t), moyenne5(t), moyenne5(t),
      frequence5(t), frequence5(t), frequence5(t),
      effectif5(t), effectif5(t),
    ];
  } else {
    liste = [
      ...t.melanger(['case', 'colonne', 'total']).map((s) => tableau6(s, t)),
      circulaire6(t), circulaire6(t), circulaire6(t),
      barres6('ecart', t), barres6('graduation', t),
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
  tableau: 'Lis bien ce tableau, puis réponds.',
  circulaire: 'Lis ce diagramme circulaire : combien d’élèves ?',
  barres: 'Lis ce diagramme en barres.',
  moyenne: 'Calcule la moyenne de ces notes.',
  frequence: 'Calcule cette fréquence.',
  effectif: 'Retrouve l’effectif à partir de la fréquence.',
  ponderee: 'Calcule la moyenne, en tenant compte des coefficients.',
  mediane: 'Trouve la médiane de cette série.',
  quartile: 'Trouve ce quartile.',
  etendue: 'Calcule l’étendue de cette série.',

  'ligne-colonne': 'Croise la bonne ligne et la bonne colonne : la ligne du groupe, la colonne de l’activité.',
  'additionner-la-colonne': 'Pour un total d’activité, additionne les filles ET les garçons.',
  'total-tout': 'En tout, c’est toutes les cases du tableau : les filles et les garçons.',
  'angle-pas-effectif': 'Ce nombre est un angle, pas un nombre d’élèves : le disque entier, trois cent soixante degrés, représente tous les élèves.',
  'tour-complet': 'Le disque entier fait trois cent soixante degrés, pas cent quatre-vingts.',
  'ecart-soustraire': 'De combien dépasse, c’est un écart : on soustrait la petite valeur de la grande.',
  'lire-entre-graduations': 'La barre s’arrête au milieu, entre deux traits : la valeur est à mi-chemin, pas sur un trait.',
  'diviser-par-effectif': 'Tu as fait la somme : divise-la maintenant par le nombre de valeurs.',
  'moyenne-pas-milieu': 'La moyenne n’est pas le milieu entre la plus petite et la plus grande : additionne toutes les valeurs, puis divise par leur nombre.',
  'effectif-pas-frequence': 'Ça, c’est l’effectif. La fréquence, c’est l’effectif divisé par l’effectif total.',
  'frequence-inverse': 'Divise dans le bon sens : l’effectif de la catégorie divisé par l’effectif total, ce qui donne un nombre plus petit que un.',
  'effectif-multiplier': 'Pour retrouver l’effectif, on multiplie l’effectif total par la fréquence : on ne divise pas.',
  'frequence-pas-effectif': 'Ce nombre est la fréquence en pourcentage, pas un nombre d’élèves : multiplie l’effectif total par la fréquence.',
  'oublier-coefficients': 'Chaque note compte autant de fois que son coefficient : multiplie chaque note par son coefficient.',
  'diviser-par-coefficients': 'Divise par la somme des coefficients, pas par le nombre de notes.',
  'ranger-d-abord': 'Range d’abord la série dans l’ordre croissant : la médiane est au milieu de la série rangée.',
  'mediane-pair': 'Avec un nombre pair de valeurs, la médiane est à mi-chemin entre les deux valeurs du milieu.',
  'mediane-rang': 'La médiane laisse autant de valeurs avant elle qu’après elle dans la série rangée : compte-les.',
  'mediane-pas-moyenne':'La médiane n’est pas la moyenne : c’est la valeur du milieu de la série rangée.',
  'etendue-extremes': 'Cherche la plus grande et la plus petite valeur dans toute la série, pas au début et à la fin.',
  'etendue-ecart': 'L’étendue est un écart : la plus grande valeur moins la plus petite.',
  'rang-quartile': 'Le rang d’un quartile s’arrondit toujours à l’entier supérieur.',
  'quartile-pas-mediane': 'La médiane coupe la série en deux ; un quartile la coupe au quart ou aux trois quarts.',

  'tableau-regle': 'Repère la ligne et la colonne qui répondent à la question, puis lis ou additionne.',
  'circulaire-regle': 'L’effectif d’un secteur, c’est l’effectif total fois l’angle, divisé par trois cent soixante.',
  'barres-regle': 'Lis la hauteur de chaque barre sur l’axe, puis calcule.',
  'moyenne-regle': 'Additionne toutes les valeurs, puis divise par le nombre de valeurs.',
  'frequence-regle': 'La fréquence, c’est l’effectif divisé par l’effectif total.',
  'effectif-regle': 'Multiplie l’effectif total par la fréquence.',
  'ponderee-regle': 'Multiplie chaque note par son coefficient, additionne, puis divise par la somme des coefficients.',
  'mediane-regle': 'Range la série, puis prends la valeur du milieu ; s’il y en a deux, prends leur moyenne.',
  'quartile-regle': 'Pour le premier quartile, calcule un quart de l’effectif ; pour le troisième, trois quarts. Arrondis à l’entier supérieur : c’est le rang dans la série rangée.',
  'etendue-regle': 'La plus grande valeur moins la plus petite.',
};
