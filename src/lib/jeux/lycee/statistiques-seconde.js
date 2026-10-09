/**
 * LES STATISTIQUES — seconde.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL : MATH_2DE_STAT_INDICATEURS.
 *
 * SEPT SORTES DE MANCHES (1 + 1 + 1 + 1 + 1 + 1 + 2) :
 *   - LA MOYENNE : LES PIÈGES, la médiane, le milieu entre la plus petite et
 *     la plus grande valeur ;
 *   - LA MOYENNE PONDÉRÉE : LES PIÈGES, oublier les effectifs, diviser par
 *     le nombre de valeurs au lieu de l'effectif total ;
 *   - LA MÉDIANE d'une série non rangée : LES PIÈGES, la valeur du milieu sans
 *     ranger, une seule des deux valeurs centrales, la moyenne ;
 *   - LES QUARTILES (définition du lycée : Q1 est la plus petite valeur telle
 *     qu'au moins 25 % des valeurs lui soient inférieures ou égales, rang
 *     n/4 arrondi À L'ENTIER SUPÉRIEUR ; effectifs qui ne sont pas multiples
 *     de 4 pour que l'arrondi compte). LES PIÈGES : arrondir le rang vers le
 *     bas, Q1 pour Q3, la médiane ;
 *   - L'ÉCART TYPE calculé sur une série symétrique m − d / m + d (il vaut
 *     exactement d) : LES PIÈGES, la variance, l'étendue ;
 *   - LA DISPERSION comparée : même moyenne mais étalements différents, ou une
 *     série décalée d'une constante (même écart type) ;
 *   - LA TRANSFORMATION AFFINE a x + b : la moyenne devient a m + b, l'écart
 *     type |a| s. LES PIÈGES : oublier b ou a, ajouter avant de multiplier,
 *     ajouter b à l'écart type, un écart type négatif.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'statistiques-seconde', titre: 'Les statistiques', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Les statistiques',
    accroche: 'Moyenne, médiane, quartiles, écart type.',
    competences: ['MATH_2DE_STAT_INDICATEURS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** Un nombre à la française : virgule décimale, vrai signe moins. */
function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  return String(Object.is(r, -0) ? 0 : r).replace('.', ',').replace('-', '−');
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

const alterne = (k) => (k % 2 ? k : -k);
const somme = (l) => l.reduce((s, x) => s + x, 0);
const range = (l) => [...l].sort((a, b) => a - b);
const liste = (l) => l.map(nb).join(' ; ');

function mediane(l) {
  const s = range(l);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/* ------------------------------------------------------------ la moyenne */

function moyenneSimple(t) {
  let vals;
  let n;
  do {
    n = t.entre(5, 8);
    vals = Array.from({ length: n }, () => t.entre(4, 20));
  } while (somme(vals) % n !== 0);
  const moy = somme(vals) / n;
  return manche(t.melanger, {
    consigne: 'moyenne',
    question: `Série : ${liste(vals)}\nMoyenne ?`,
    bonne: nb(moy),
    pieges: [
      [nb(mediane(vals)), 'moyenne-pas-mediane'],
      [nb((Math.min(...vals) + Math.max(...vals)) / 2), 'moyenne-pas-milieu'],
    ],
    voisin: (k) => nb(moy + alterne(k)),
  });
}

function moyennePonderee(t) {
  let v;
  let e;
  let E;
  do {
    const v1 = t.entre(6, 10);
    const v2 = v1 + t.entre(1, 4);
    v = [v1, v2, v2 + t.entre(1, 4)];
    e = [t.entre(1, 6), t.entre(1, 6), t.entre(1, 6)];
    E = somme(e);
  } while (![4, 5, 10, 20].includes(E) || somme(v) % 3 !== 0);
  const S = v[0] * e[0] + v[1] * e[1] + v[2] * e[2];
  return manche(t.melanger, {
    consigne: 'moyenne-ponderee',
    question: `Valeurs : ${liste(v)}\nEffectifs : ${liste(e)}\nMoyenne ?`,
    bonne: nb(S / E),
    pieges: [
      [nb(somme(v) / 3), 'moyenne-sans-effectifs'],
      [S % 3 === 0 ? nb(S / 3) : null, 'diviser-par-effectif-total'],
    ],
    voisin: (k) => nb(S / E + alterne(k)),
  });
}

/* ------------------------------------------------------------ la médiane */

function laMediane(t) {
  const n = t.entre(7, 10);
  const vals = [];
  while (vals.length < n) {
    const x = t.entre(1, 30);
    if (!vals.includes(x)) vals.push(x);
  }
  const med = mediane(vals);
  const nonRange = n % 2 ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2;
  const s = range(vals);
  const autres = [];
  if (n % 2 === 0) autres.push([nb(s[n / 2 - 1]), 'mediane-paire']);
  if ((somme(vals) * 100) % n === 0) autres.push([nb(somme(vals) / n), 'mediane-pas-moyenne']);
  return manche(t.melanger, {
    consigne: 'mediane',
    question: `Série : ${liste(vals)}\nMédiane ?`,
    bonne: nb(med),
    pieges: [[nb(nonRange), 'ranger-d-abord'], ...t.melanger(autres)],
    voisin: (k) => nb(med + alterne(k)),
  });
}

/* ---------------------------------------------------------- les quartiles */

function quartiles(t) {
  const n = t.au([9, 10, 11, 13, 14, 15]);
  const s = [t.entre(2, 10)];
  while (s.length < n) s.push(s[s.length - 1] + t.entre(1, 4));
  const q1 = s[Math.ceil(n / 4) - 1];
  const q3 = s[Math.ceil((3 * n) / 4) - 1];
  const premier = t.au([true, false]);
  const bonne = premier ? q1 : q3;
  const rangBas = premier ? s[Math.floor(n / 4) - 1] : s[Math.floor((3 * n) / 4) - 1];
  return manche(t.melanger, {
    consigne: 'quartile',
    question: `Série rangée (${n} valeurs) :\n${liste(s)}\n${premier ? 'Premier quartile Q1' : 'Troisième quartile Q3'} ?`,
    bonne: nb(bonne),
    pieges: [
      [nb(rangBas), 'rang-du-quartile'],
      ...t.melanger([[nb(premier ? q3 : q1), 'premier-ou-troisieme'], [nb(mediane(s)), 'quartile-pas-mediane']]),
    ],
    voisin: (k) => nb(bonne + alterne(k)),
  });
}

/* ---------------------------------------------------------- l'écart type */

function ecartType(t) {
  const m = t.entre(8, 15);
  const d = t.entre(3, 6);
  const h = t.entre(2, 3);
  const vals = t.melanger([...Array(h).fill(m - d), ...Array(h).fill(m + d)]);
  return manche(t.melanger, {
    consigne: 'ecart-type',
    question: `Série : ${liste(vals)}\nMoyenne : ${nb(m)}\nÉcart type ?`,
    bonne: nb(d),
    pieges: [[nb(d * d), 'ecart-type-racine'], [nb(2 * d), 'ecart-type-pas-etendue']],
    voisin: (k) => nb(d + alterne(k)),
  });
}

const SERREES = [[-1, 0, 0, 0, 1], [-2, -1, 0, 1, 2], [-1, -1, 0, 1, 1]];
const ETALEES = [[-4, -2, 0, 2, 4], [-5, -3, 0, 3, 5], [-6, -1, 0, 1, 6], [-3, -3, 0, 3, 3]];
const [SA, SB, MEME] = ['Série A', 'Série B', 'Le même'];

function dispersion(t) {
  const m = t.entre(8, 14);
  const serieDe = (ecarts, c = 0) => t.melanger(ecarts.map((x) => m + x + c));
  let A;
  let B;
  let bonne;
  let pieges;
  if (t.au([true, true, false])) {
    const [serree, etalee] = [serieDe(t.au(SERREES)), serieDe(t.au(ETALEES))];
    const aGagne = t.au([true, false]);
    [A, B] = aGagne ? [etalee, serree] : [serree, etalee];
    bonne = aGagne ? SA : SB;
    pieges = { [aGagne ? SB : SA]: 'dispersion-ecart-type', [MEME]: 'meme-moyenne-pas-meme-ecart' };
  } else {
    const ecarts = t.au([...SERREES, ...ETALEES]);
    A = serieDe(ecarts);
    B = serieDe(ecarts, t.entre(3, 9));
    bonne = MEME;
    pieges = { [SA]: 'decalage-ecart-type', [SB]: 'decalage-ecart-type' };
  }
  return {
    consigne: 'dispersion',
    question: `A : ${liste(A)}\nB : ${liste(B)}\nQuelle série a le plus grand écart type ?`,
    choix: cartes([SA, SB, MEME]),
    bonne,
    pieges,
  };
}

/* ------------------------------------------------ la transformation affine */

function transformation(t, quoi) {
  const m = t.entre(8, 15);
  const s = t.entre(2, 5);
  const a = quoi === 'moyenne' ? t.au([2, 3]) : t.au([2, 3, -2, -3]);
  let b;
  do {
    b = t.entre(-5, 9);
  } while (b === 0 || (quoi !== 'moyenne' && b < 0));
  const operation = `On multiplie chaque valeur par ${nb(a)}, puis on ${b > 0 ? 'ajoute' : 'retire'} ${Math.abs(b)}.`;
  const entete = `Une série a pour moyenne ${nb(m)} et pour écart type ${nb(s)}.\n${operation}`;
  if (quoi === 'moyenne') {
    const bonne = a * m + b;
    return manche(t.melanger, {
      consigne: 'transformation',
      question: `${entete}\nNouvelle moyenne ?`,
      bonne: nb(bonne),
      pieges: t.melanger([
        [nb(a * m), 'ajout-oublie'],
        [nb(m + b), 'multiplication-oubliee'],
        [nb(a * (m + b)), 'ordre-de-la-transformation'],
      ]),
      voisin: (k) => nb(bonne + alterne(k)),
    });
  }
  const bonne = Math.abs(a) * s;
  const pieges = t.melanger([[nb(bonne + b), 'ecart-type-sans-ajout'], [nb(s), 'ecart-type-multiplie']]);
  return manche(t.melanger, {
    consigne: 'transformation',
    question: `${entete}\nNouvel écart type ?`,
    bonne: nb(bonne),
    pieges: a < 0 ? [[nb(a * s), 'ecart-type-positif'], ...pieges] : pieges,
    voisin: (k) => nb(bonne + k),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  return t.melanger([
    moyenneSimple(t), moyennePonderee(t),
    laMediane(t), quartiles(t),
    ecartType(t), dispersion(t),
    transformation(t, 'moyenne'), transformation(t, 'ecart'),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  moyenne: 'Calcule la moyenne de cette série.',
  'moyenne-ponderee': 'Calcule la moyenne de cette série, en tenant compte des effectifs.',
  mediane: 'Trouve la médiane de cette série.',
  quartile: 'Trouve le quartile demandé dans cette série rangée.',
  'ecart-type': 'Calcule l’écart type de cette série.',
  dispersion: 'Compare la dispersion de ces deux séries.',
  transformation: 'Toutes les valeurs ont été transformées : déduis-en le nouvel indicateur.',

  'moyenne-pas-mediane': 'Ça, c’est la médiane. La moyenne, c’est la somme des valeurs divisée par leur nombre.',
  'moyenne-pas-milieu': 'La moyenne n’est pas le milieu entre la plus petite et la plus grande valeur : additionne toutes les valeurs, puis divise par leur nombre.',
  'moyenne-sans-effectifs': 'Chaque valeur compte autant de fois que son effectif : multiplie chaque valeur par son effectif avant d’additionner.',
  'diviser-par-effectif-total': 'Divise par l’effectif total, la somme des effectifs, pas par le nombre de valeurs différentes.',
  'ranger-d-abord': 'Pour la médiane, on range d’abord les valeurs dans l’ordre croissant.',
  'mediane-paire': 'Avec un nombre pair de valeurs, la médiane est la moyenne des deux valeurs du milieu.',
  'mediane-pas-moyenne': 'Ça, c’est la moyenne. La médiane partage la série rangée en deux moitiés de même effectif.',
  'rang-du-quartile': 'Le rang du premier quartile, c’est le quart de l’effectif arrondi à l’entier supérieur ; pour le troisième, les trois quarts, arrondis de même.',
  'premier-ou-troisieme': 'Le premier quartile est dans le bas de la série, le troisième dans le haut.',
  'quartile-pas-mediane': 'Ça, c’est la médiane : un quartile partage la série en quarts, pas en moitiés.',
  'ecart-type-racine': 'Ça, c’est la variance. L’écart type est sa racine carrée.',
  'ecart-type-pas-etendue': 'Ça, c’est l’étendue. L’écart type mesure la dispersion autour de la moyenne.',
  'dispersion-ecart-type': 'L’écart type mesure la dispersion autour de la moyenne : la série la plus étalée a le plus grand.',
  'meme-moyenne-pas-meme-ecart': 'Même moyenne ne veut pas dire même dispersion : regarde à quel point les valeurs s’écartent de la moyenne.',
  'decalage-ecart-type': 'Ajouter le même nombre à toutes les valeurs déplace la série sans l’étaler : l’écart type ne change pas.',
  'ajout-oublie': 'Tu as multiplié la moyenne, mais oublié le nombre à ajouter : la moyenne subit la même transformation que les valeurs.',
  'multiplication-oubliee': 'Tu as ajouté le nombre, mais oublié de multiplier : la moyenne subit la même transformation que les valeurs.',
  'ordre-de-la-transformation': 'On multiplie d’abord, puis on ajoute : respecte l’ordre de la transformation.',
  'ecart-type-sans-ajout': 'Ajouter un nombre ne change pas l’écart type : seule la multiplication compte.',
  'ecart-type-multiplie': 'Multiplier toutes les valeurs étale la série : l’écart type est multiplié aussi.',
  'ecart-type-positif': 'Un écart type n’est jamais négatif : on le multiplie par la valeur absolue du coefficient.',

  'moyenne-regle': 'Additionne toutes les valeurs, puis divise par leur nombre.',
  'moyenne-ponderee-regle': 'Somme des valeurs multipliées par leurs effectifs, divisée par l’effectif total.',
  'mediane-regle': 'Range la série, puis prends la valeur du milieu, ou la moyenne des deux valeurs du milieu.',
  'quartile-regle': 'Calcule le rang, le quart ou les trois quarts de l’effectif arrondis à l’entier supérieur, puis lis la valeur à ce rang.',
  'ecart-type-regle': 'L’écart type est la racine carrée de la moyenne des carrés des écarts à la moyenne.',
  'dispersion-regle': 'Plus les valeurs s’écartent de leur moyenne, plus l’écart type est grand.',
  'transformation-regle': 'La moyenne subit la transformation entière ; l’écart type n’est multiplié que par la valeur absolue du coefficient.',
};
