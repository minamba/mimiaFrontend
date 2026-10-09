/**
 * LES LISTES EN PYTHON — Nora, 1re générale, 1re et terminale technologiques.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   1re générale    : MATH_1RE_ALGO_LISTE_GENERER, MATH_1RE_ALGO_LISTE_MANIPULER,
 *                     MATH_1RE_ALGO_LISTE_PARCOURIR
 *   1re techno      : MATH_1TEC_ALGO_LISTE, MATH_1TEC_ALGO_LISTE_MANIP
 *   terminale techno : MATH_TTEC_ALGO_LISTE
 *
 * LE PROGRAMME EST DANS LA QUESTION, une ligne par `\n`, indenté de quatre
 * espaces (l'écran doit garder les espaces de début de ligne). La question
 * est toujours « qu'affiche ce programme ? » ; la réponse est écrite comme
 * Python l'affiche (« [1, 3, 5] », « 7 »), ou « IndexError ».
 *
 * LA RÉPONSE EST CALCULÉE ICI, en JavaScript, sur les mêmes données que le
 * programme ; le test la recalcule avec son propre petit interpréteur Python,
 * qui lit le texte du programme. Les pièges sont les erreurs des élèves :
 *   - LES INDICES : compter à partir de un, confondre l'indice et la valeur,
 *     les indices négatifs pris depuis le début, sortir de la liste ;
 *   - LA LONGUEUR et RANGE : range(a, b) s'arrête AVANT b, range(b) commence
 *     à zéro ;
 *   - EN COMPRÉHENSION : la borne de fin incluse, l'expression oubliée, zéro
 *     oublié parmi les multiples ;
 *   - PAR AJOUTS SUCCESSIFS : un tour de trop ou de moins, la valeur de départ
 *     oubliée ;
 *   - MODIFIER : insérer au lieu de remplacer, le décalage d'indice ;
 *   - SUPPRIMER : remove retire une VALEUR (la première rencontrée), pop un
 *     INDICE (le dernier par défaut) et renvoie l'élément retiré ;
 *   - PARCOURIR : les valeurs ou les indices, l'accumulateur, l'inégalité
 *     stricte, compter ou additionner.
 * Pas de nombre négatif dans les listes : Python l'écrirait avec un tiret.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'listes-python', titre: 'Les listes en Python', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE: {
    titre: 'Les listes en Python',
    accroche: 'Créer, parcourir, modifier une liste.',
    competences: ['MATH_1RE_ALGO_LISTE_GENERER', 'MATH_1RE_ALGO_LISTE_MANIPULER', 'MATH_1RE_ALGO_LISTE_PARCOURIR'],
  },
  PREMIERE_TECHNO: {
    titre: 'Les listes en Python',
    accroche: 'Indices, append, range : que s’affiche-t-il ?',
    competences: ['MATH_1TEC_ALGO_LISTE', 'MATH_1TEC_ALGO_LISTE_MANIP'],
  },
  TERMINALE_TECHNO: {
    titre: 'Les listes en Python',
    accroche: 'Générer, parcourir, manipuler une liste.',
    competences: ['MATH_TTEC_ALGO_LISTE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Une liste écrite comme Python l'affiche. */
export const py = (liste) => `[${liste.join(', ')}]`;

const ERREUR = 'IndexError';

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche : le programme, la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
function manche(melanger, {
  consigne, lignes, bonne, pieges = [], voisin,
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
    consigne, question: lignes.join('\n'), choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
}

/** n entiers distincts entre min et max, dans un ordre quelconque. */
function distincts(t, n, min, max) {
  const vus = new Set();
  const liste = [];
  while (liste.length < n) {
    const v = t.entre(min, max);
    if (!vus.has(v)) {
      vus.add(v);
      liste.push(v);
    }
  }
  return liste;
}

const intervalle = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
const sans = (liste, i) => liste.filter((_, j) => j !== i);
const avec = (liste, i, v) => liste.map((x, j) => (j === i ? v : x));
const inserer = (liste, i, v) => [...liste.slice(0, i), v, ...liste.slice(i)];
/** Un voisin d'une liste : son dernier élément décalé. */
const voisinListe = (liste) => (k) => py([...liste.slice(0, -1), liste[liste.length - 1] + k]);
const voisinEntier = (n) => (k) => String(n + k);

/** « range(4) » ou « range(2, 6) ». */
const range = (a, b) => (a === 0 ? `range(${b})` : `range(${a}, ${b})`);

/** Les expressions en k : le texte Python, et son calcul. */
const EXPRESSIONS = [
  ['2 * k + 1', (k) => 2 * k + 1],
  ['k * k', (k) => k * k],
  ['3 * k', (k) => 3 * k],
  ['k + 5', (k) => k + 5],
  ['10 - k', (k) => 10 - k],
  ['2 * k', (k) => 2 * k],
];

/* ------------------------------------------------------------ les indices */

function indice(t) {
  const n = t.entre(5, 6);
  const L = distincts(t, n, 1, 40);
  const debut = `L = ${py(L)}`;
  const r = t.tirer();
  const voisin = (k) => String(Math.max(...L) + k);
  if (r < 0.5) {
    const i = t.entre(1, n - 1);
    return manche(t.melanger, {
      consigne: 'indice',
      lignes: [debut, `print(L[${i}])`],
      bonne: L[i],
      pieges: [[L[i - 1], 'indices-depuis-zero'], [i, 'indice-ou-valeur']],
      voisin,
    });
  }
  if (r < 0.8) {
    const k = t.entre(1, 3);
    return manche(t.melanger, {
      consigne: 'indice',
      lignes: [debut, `print(L[-${k}])`],
      bonne: L[n - k],
      pieges: [[L[k - 1], 'indice-negatif'], [L[k], 'indice-negatif']],
      voisin,
    });
  }
  return manche(t.melanger, {
    consigne: 'indice',
    lignes: [debut, `print(L[${n}])`],
    bonne: ERREUR,
    pieges: [[L[n - 1], 'dernier-indice'], [L[0], 'pas-de-tour']],
    voisin,
  });
}

/* --------------------------------------------------- la longueur et range */

function longueur(t) {
  const a = t.au([0, 0, 1, 2, 3]);
  const b = a + t.entre(3, 8);
  const [texte] = t.au(EXPRESSIONS);
  const lignes = t.tirer() < 0.5
    ? [`L = [${texte} for k in ${range(a, b)}]`, 'print(len(L))']
    : ['L = []', `for k in ${range(a, b)}:`, `    L.append(${texte})`, 'print(len(L))'];
  const bonne = b - a;
  return manche(t.melanger, {
    consigne: 'longueur',
    lignes,
    bonne,
    pieges: [
      [bonne + 1, 'range-exclut-la-fin'],
      a === 0 ? [bonne - 1, 'range-commence-a-zero'] : [b, 'range-commence'],
    ],
    voisin: voisinEntier(bonne + 1),
  });
}

/* ------------------------------------------------------ en compréhension */

function comprehension(t) {
  if (t.tirer() < 0.3) {
    const m = t.entre(2, 5);
    const b = m * t.entre(3, 4);
    const multiples = intervalle(0, b).filter((k) => k % m === 0);
    return manche(t.melanger, {
      consigne: 'comprehension',
      lignes: [`L = [k for k in range(${b}) if k % ${m} == 0]`, 'print(L)'],
      bonne: py(multiples),
      pieges: [[py(multiples.slice(1)), 'zero-est-multiple'], [py([...multiples, b]), 'range-exclut-la-fin']],
      voisin: voisinListe(multiples),
    });
  }
  const a = t.au([0, 0, 1, 2]);
  const b = a + t.entre(3, 5);
  const [texte, f] = t.au(EXPRESSIONS);
  const bonne = intervalle(a, b).map(f);
  return manche(t.melanger, {
    consigne: 'comprehension',
    lignes: [`L = [${texte} for k in ${range(a, b)}]`, 'print(L)'],
    bonne: py(bonne),
    pieges: [
      [py(intervalle(a, b + 1).map(f)), 'range-exclut-la-fin'],
      a === 0
        ? [py(intervalle(1, b + 1).map(f)), 'range-commence-a-zero']
        : [py(intervalle(a, b)), 'appliquer-l-expression'],
    ],
    voisin: voisinListe(bonne),
  });
}

/* ------------------------------------------------ par ajouts successifs */

function ajouts(t) {
  const fois = t.tirer() < 0.4;
  const c = fois ? t.entre(2, 3) : t.entre(2, 9);
  const n = t.entre(2, 4);
  const a = t.entre(1, 6);
  const L = [a];
  for (let i = 0; i < n; i += 1) L.push(fois ? L[L.length - 1] * c : L[L.length - 1] + c);
  return manche(t.melanger, {
    consigne: 'ajouts',
    lignes: [`L = [${a}]`, `for i in range(${n}):`, `    L.append(L[-1] ${fois ? '*' : '+'} ${c})`, 'print(L)'],
    bonne: py(L),
    pieges: [[py(L.slice(0, -1)), 'compter-les-tours'], [py(L.slice(1)), 'valeur-initiale']],
    voisin: voisinListe(L),
  });
}

/* ----------------------------------------------------------- modifier */

function modification(t) {
  const n = t.entre(4, 5);
  const L = distincts(t, n, 1, 30);
  const v = t.entre(31, 60);
  if (t.tirer() < 0.7) {
    const i = t.entre(1, n - 1);
    const bonne = avec(L, i, v);
    return manche(t.melanger, {
      consigne: 'modification',
      lignes: [`L = ${py(L)}`, `L[${i}] = ${v}`, 'print(L)'],
      bonne: py(bonne),
      pieges: [[py(avec(L, i - 1, v)), 'indices-depuis-zero'], [py(inserer(L, i, v)), 'affecter-pas-inserer']],
      voisin: voisinListe(bonne),
    });
  }
  const bonne = avec(L, n - 1, v);
  return manche(t.melanger, {
    consigne: 'modification',
    lignes: [`L = ${py(L)}`, `L[-1] = ${v}`, 'print(L)'],
    bonne: py(bonne),
    pieges: [[py(avec(L, 0, v)), 'indice-negatif'], [py([...L, v]), 'affecter-pas-inserer']],
    voisin: voisinListe(bonne),
  });
}

/* ----------------------------------------------------------- supprimer */

function supprimer(t) {
  const sorte = t.au(['doublon', 'valeur', 'pop', 'pop-dernier']);
  if (sorte === 'doublon') {
    // v apparaît deux fois, pas côte à côte : remove ne retire que la première.
    const autres = distincts(t, 4, 1, 20);
    const v = autres.pop();
    const p1 = t.entre(0, 2);
    const p2 = t.entre(p1 + 2, 4);
    const L = [];
    let j = 0;
    for (let i = 0; i < 5; i += 1) {
      if (i === p1 || i === p2) L.push(v);
      else {
        L.push(autres[j]);
        j += 1;
      }
    }
    const bonne = sans(L, p1);
    return manche(t.melanger, {
      consigne: 'supprimer',
      lignes: [`L = ${py(L)}`, `L.remove(${v})`, 'print(L)'],
      bonne: py(bonne),
      pieges: [[py(L.filter((x) => x !== v)), 'remove-premier-seulement'], [py(sans(L, p2)), 'remove-premier-seulement']],
      voisin: voisinListe(bonne),
    });
  }
  if (sorte === 'valeur' || sorte === 'pop') {
    // Une valeur qui est aussi un indice valable, ailleurs dans la liste.
    let L;
    let v;
    let ou;
    do {
      L = distincts(t, 5, 0, 9);
      v = t.entre(0, 4);
      ou = L.indexOf(v);
    } while (ou === -1 || ou === v);
    if (sorte === 'valeur') {
      const bonne = sans(L, ou);
      return manche(t.melanger, {
        consigne: 'supprimer',
        lignes: [`L = ${py(L)}`, `L.remove(${v})`, 'print(L)'],
        bonne: py(bonne),
        pieges: [[py(sans(L, v)), 'remove-valeur-pas-indice']],
        voisin: voisinListe(bonne),
      });
    }
    const bonne = sans(L, v);
    return manche(t.melanger, {
      consigne: 'supprimer',
      lignes: [`L = ${py(L)}`, `L.pop(${v})`, 'print(L)'],
      bonne: py(bonne),
      pieges: [[py(sans(L, ou)), 'pop-indice-pas-valeur'], [v >= 1 ? py(sans(L, v - 1)) : null, 'indices-depuis-zero']],
      voisin: voisinListe(bonne),
    });
  }
  const L = distincts(t, t.entre(4, 5), 1, 30);
  const n = L.length;
  return manche(t.melanger, {
    consigne: 'supprimer',
    lignes: [`L = ${py(L)}`, 'x = L.pop()', 'print(x)'],
    bonne: L[n - 1],
    pieges: [[L[0], 'pop-sans-argument'], [L[n - 2], 'pop-renvoie']],
    voisin: (k) => String(Math.max(...L) + k),
  });
}

/* ----------------------------------------------------------- parcourir */

function parcours(t) {
  const sorte = t.au(['valeurs', 'indices', 'compter']);
  if (sorte === 'compter') {
    const plusGrands = (liste, borne) => liste.filter((x) => x > borne);
    let L;
    let m;
    do {
      L = distincts(t, t.entre(5, 6), 1, 15);
      m = L[t.entre(0, L.length - 1)];
    } while (plusGrands(L, m).length === 0);
    const plus = plusGrands(L, m);
    const bonne = plus.length;
    return manche(t.melanger, {
      consigne: 'parcours',
      lignes: ['c = 0', `L = ${py(L)}`, 'for x in L:', `    if x > ${m}:`, '        c = c + 1', 'print(c)'],
      bonne,
      pieges: [[bonne + 1, 'inegalite-stricte'], [plus.reduce((s, x) => s + x, 0), 'compter-pas-additionner']],
      voisin: voisinEntier(bonne + 1),
    });
  }
  const L = distincts(t, t.entre(4, 5), 1, 20);
  const n = L.length;
  const somme = L.reduce((s, x) => s + x, 0);
  const indices = (n * (n - 1)) / 2;
  if (sorte === 'valeurs') {
    return manche(t.melanger, {
      consigne: 'parcours',
      lignes: ['s = 0', `L = ${py(L)}`, 'for x in L:', '    s = s + x', 'print(s)'],
      bonne: somme,
      pieges: [[indices, 'valeurs-pas-indices'], [L[n - 1], 'accumulateur']],
      voisin: voisinEntier(somme),
    });
  }
  return manche(t.melanger, {
    consigne: 'parcours',
    lignes: ['s = 0', `L = ${py(L)}`, 'for i in range(len(L)):', '    s = s + L[i]', 'print(s)'],
    bonne: somme,
    pieges: [[indices, 'indice-et-valeur'], [somme - L[0], 'range-commence-a-zero']],
    voisin: voisinEntier(somme),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  if (!PAR_CLASSE[niveau]) return serie(graine, CLASSES[0]);
  const t = outils(graine);
  const huitieme = t.au([comprehension, supprimer, parcours, indice]);
  return t.melanger([
    indice(t), longueur(t), comprehension(t), ajouts(t),
    modification(t), supprimer(t), parcours(t), huitieme(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  indice: 'Qu’affiche ce programme ? Attention aux indices.',
  longueur: 'Combien d’éléments contient cette liste ?',
  comprehension: 'Quelle liste ce programme construit-il ?',
  ajouts: 'Suis la boucle tour par tour : quelle liste obtient-on ?',
  modification: 'Qu’affiche ce programme après la modification ?',
  supprimer: 'Qu’affiche ce programme après la suppression ?',
  parcours: 'Suis la boucle : quelle valeur s’affiche ?',

  'indices-depuis-zero': 'En Python, les indices commencent à zéro : l’indice un désigne le deuxième élément.',
  'indice-ou-valeur': 'Entre les crochets, c’est un indice, une position : on affiche l’élément qui se trouve à cette position.',
  'indice-negatif': 'Les indices négatifs partent de la fin : moins un, c’est le dernier élément ; moins deux, l’avant-dernier.',
  'dernier-indice': 'Le dernier indice est la longueur moins un : à l’indice égal à la longueur, il n’y a plus rien, et Python lève une erreur.',
  'pas-de-tour': 'Python ne revient pas au début de la liste : un indice trop grand provoque une erreur.',
  'range-exclut-la-fin': 'Range s’arrête juste avant la borne de fin : celle-ci n’est jamais atteinte.',
  'range-commence-a-zero': 'Avec une seule borne, range commence à zéro.',
  'range-commence': 'Range de a à b donne b moins a valeurs : on commence à a, et on s’arrête avant b.',
  'zero-est-multiple': 'Range commence à zéro, et zéro est multiple de tout entier : il fait partie de la liste.',
  'appliquer-l-expression': 'Chaque élément est l’expression calculée pour k, pas k lui-même.',
  'compter-les-tours': 'Compte les tours : range de n fait n tours, donc n ajouts, en plus de la valeur de départ.',
  'valeur-initiale': 'La liste ne part pas de rien : la valeur de départ reste en première position.',
  'affecter-pas-inserer': 'Une affectation remplace l’élément à cette position : elle n’ajoute rien, la longueur ne change pas.',
  'remove-premier-seulement': 'Remove retire seulement la première occurrence de la valeur, en partant du début.',
  'remove-valeur-pas-indice': 'Remove prend une valeur, pas un indice : on cherche ce nombre dans la liste, et on le retire.',
  'pop-indice-pas-valeur': 'Pop prend un indice, pas une valeur : on retire l’élément qui se trouve à cette position.',
  'pop-sans-argument': 'Sans argument, pop retire le dernier élément, pas le premier.',
  'pop-renvoie': 'Pop renvoie l’élément qu’il vient de retirer : c’est lui qui est rangé dans x.',
  'valeurs-pas-indices': 'Quand la boucle parcourt directement la liste, la variable prend les valeurs des éléments, pas leurs indices.',
  'indice-et-valeur': 'Ici, i parcourt les indices, mais on ajoute L de i, c’est-à-dire l’élément à cette position.',
  accumulateur: 'La variable s accumule : à chaque tour, on lui ajoute un élément. Elle ne garde pas seulement le dernier.',
  'inegalite-stricte': 'L’inégalité est stricte : un élément égal à la borne ne compte pas.',
  'compter-pas-additionner': 'On ajoute un à c à chaque élément qui convient : on compte les éléments, on ne les additionne pas.',

  'indice-regle': 'Les indices vont de zéro à la longueur moins un ; les négatifs partent de la fin.',
  'longueur-regle': 'Range de a à b donne b moins a valeurs ; range de n en donne n.',
  'comprehension-regle': 'Fais varier k dans le range, sans la borne de fin, et calcule l’expression pour chaque k.',
  'ajouts-regle': 'Écris la liste après chaque tour : chaque tour ajoute un élément à la fin.',
  'modification-regle': 'L’affectation remplace l’élément à l’indice donné, en comptant depuis zéro.',
  'supprimer-regle': 'Remove retire une valeur, la première rencontrée ; pop retire un indice, le dernier par défaut.',
  'parcours-regle': 'Suis la boucle tour par tour, en notant la valeur de chaque variable.',
};
