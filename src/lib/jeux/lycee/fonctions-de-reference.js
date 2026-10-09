/**
 * LES FONCTIONS DE RÉFÉRENCE — seconde : carré, inverse, racine carrée, cube.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL : MATH_2DE_FONC_CARRE, MATH_2DE_FONC_VARIATION.
 *
 * CINQ SORTES DE MANCHES (2 + 2 + 2 + 1 + 1) :
 *   - LES VARIATIONS sur un intervalle. LES PIÈGES : la fonction carré
 *     « croissante » sur les négatifs, monotone sur un intervalle qui contient
 *     zéro ; la fonction inverse « croissante » ; la fonction cube qui
 *     décroîtrait sur les négatifs ;
 *   - COMPARER LES IMAGES, en lettres : si 0 < a < b, alors… ; si a < 0 < b,
 *     on ne peut pas comparer a² et b², mais on peut comparer 1/a et 1/b
 *     (signes contraires) — le piège « on ne peut pas conclure » ;
 *   - COMPARER DEUX NOMBRES sans les calculer : (−3,2)² et (−2,7)²,
 *     1/2,3 et 1/2,7… ;
 *   - LIRE UN EXTREMUM dans un tableau de variations écrit en texte. LES
 *     PIÈGES : donner l'abscisse au lieu de la valeur, oublier qu'un extremum
 *     peut être atteint à une borne, confondre minimum et maximum ;
 *   - L'EXTREMUM DE LA FONCTION CARRÉ sur un intervalle qui contient zéro :
 *     le minimum est zéro ; le maximum, à la borne la plus éloignée de zéro.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'fonctions-de-reference', titre: 'Les fonctions de référence', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SECONDE: {
    titre: 'Les fonctions de référence',
    accroche: 'Carré, inverse, racine, cube : leur sens.',
    competences: ['MATH_2DE_FONC_CARRE', 'MATH_2DE_FONC_VARIATION'],
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

/** Une manche à choix fixes : `fautes` donne la phrase de chaque mauvaise réponse. */
function mancheFixe(melanger, {
  consigne, question, libelles, bonne, fautes,
}) {
  const pieges = {};
  libelles.forEach((l) => {
    if (l !== bonne) pieges[l] = fautes[l];
  });
  return {
    consigne, question, choix: cartes(melanger(libelles)), bonne, pieges,
  };
}

const NOMS = {
  carre: 'la fonction carré',
  inverse: 'la fonction inverse',
  racine: 'la fonction racine carrée',
  cube: 'la fonction cube',
};

/** L'image écrite : a² , 1/a, √a, a³ — avec des parenthèses autour d'un négatif. */
function image(f, v) {
  const p = v.startsWith('−') ? `(${v})` : v;
  if (f === 'carre') return `${p}²`;
  if (f === 'cube') return `${p}³`;
  if (f === 'inverse') return `1/${p}`;
  return `√${v}`;
}

/* --------------------------------------------------------- les variations */

const SENS = { c: 'Croissante', d: 'Décroissante', n: 'Ni croissante ni décroissante' };

function variations(t) {
  const f = t.au(['carre', 'carre', 'inverse', 'racine', 'cube']);
  const zone = {
    carre: t.au(['neg', 'pos', 'mixte']), inverse: t.au(['neg', 'pos']), racine: 'pos', cube: t.au(['neg', 'pos', 'mixte']),
  }[f];
  const demi = t.entre(0, 2) === 0;
  let I;
  if (zone === 'neg') {
    if (demi) I = f === 'inverse' ? ']−∞ ; 0[' : ']−∞ ; 0]';
    else {
      const a = -t.entre(4, 9);
      const b = a + t.entre(1, -a - (f === 'inverse' ? 1 : 0));
      I = `[${nb(a)} ; ${nb(b)}]`;
    }
  } else if (zone === 'pos') {
    if (demi) I = f === 'inverse' ? ']0 ; +∞[' : '[0 ; +∞[';
    else {
      const a = t.entre(f === 'inverse' ? 1 : 0, 5);
      I = `[${nb(a)} ; ${nb(a + t.entre(1, 6))}]`;
    }
  } else if (demi && f === 'cube') {
    I = ']−∞ ; +∞['; // la fonction cube : sur tout ℝ
  } else {
    I = `[${nb(-t.entre(1, 7))} ; ${nb(t.entre(1, 7))}]`;
  }
  let juste;
  let fautes;
  if (f === 'carre' && zone === 'mixte') {
    juste = 'n';
    fautes = { c: 'carre-change-en-zero', d: 'carre-change-en-zero' };
  } else if (f === 'carre' && zone === 'neg') {
    juste = 'd';
    fautes = { c: 'carre-decroit-avant-zero', n: 'monotone-sur-l-intervalle' };
  } else if (f === 'carre') {
    juste = 'c';
    fautes = { d: 'carre-croit-apres-zero', n: 'monotone-sur-l-intervalle' };
  } else if (f === 'inverse') {
    juste = 'd';
    fautes = { c: 'inverse-decroissante', n: 'monotone-sur-l-intervalle' };
  } else if (f === 'racine') {
    juste = 'c';
    fautes = { d: 'racine-croissante', n: 'racine-croissante' };
  } else {
    juste = 'c';
    fautes = { d: 'cube-croissante', n: 'cube-croissante' };
  }
  const parLibelle = {};
  Object.entries(fautes).forEach(([k, p]) => { parLibelle[SENS[k]] = p; });
  return mancheFixe(t.melanger, {
    consigne: 'variations',
    question: `Sur ${I}, ${NOMS[f]} est…`,
    libelles: Object.values(SENS),
    bonne: SENS[juste],
    fautes: parLibelle,
  });
}

/* ----------------------------------------- comparer les images, en lettres */

/** [fonction, condition, relation juste : '<', '>' ou '?', faute pour '<', pour '>', pour '?']. */
const CAS = [
  ['carre', '0 < a < b', '<', null, 'carre-croit-apres-zero', 'monotone-conclut'],
  ['carre', 'a < b < 0', '>', 'carre-decroit-avant-zero', null, 'monotone-conclut'],
  ['carre', 'a < 0 < b', '?', 'carre-signes-contraires', 'carre-signes-contraires', null],
  ['inverse', '0 < a < b', '>', 'inverse-decroissante', null, 'monotone-conclut'],
  ['inverse', 'a < b < 0', '>', 'inverse-decroissante', null, 'monotone-conclut'],
  ['inverse', 'a < 0 < b', '<', null, 'inverse-signes', 'inverse-signes'],
  ['cube', 'a < b < 0', '<', null, 'cube-croissante', 'cube-croissante'],
  ['cube', 'a < 0 < b', '<', null, 'cube-croissante', 'cube-croissante'],
  ['racine', '0 ≤ a < b', '<', null, 'racine-croissante', 'monotone-conclut'],
];

const PAS_DE_CONCLUSION = 'On ne peut pas conclure';

function comparerLettres(t, cas) {
  const [f, condition, juste, fInf, fSup, fRien] = cas;
  const [ia, ib] = [image(f, 'a'), image(f, 'b')];
  const lib = { '<': `${ia} < ${ib}`, '>': `${ia} > ${ib}`, '?': PAS_DE_CONCLUSION };
  return mancheFixe(t.melanger, {
    consigne: 'comparer-images',
    question: `On sait que ${condition}.\nQue dire de ${ia} et ${ib} ?`,
    libelles: Object.values(lib),
    bonne: lib[juste],
    fautes: { [lib['<']]: fInf, [lib['>']]: fSup, [lib['?']]: fRien },
  });
}

/* ------------------------------------------ comparer deux nombres précis */

function comparerNombres(t) {
  const [f, signe] = t.au([
    ['carre', -1], ['carre', 1], ['inverse', -1], ['inverse', 1], ['cube', -1], ['cube', 1], ['racine', 1],
  ]);
  const u = signe * t.entre(10, 99);
  let v;
  do {
    v = signe * t.entre(10, 99);
  } while (v === u);
  const valeur = {
    carre: (x) => x * x, cube: (x) => x * x * x, inverse: (x) => 1 / x, racine: (x) => Math.sqrt(x),
  }[f];
  const juste = valeur(u) < valeur(v) ? '<' : '>';
  const faute = {
    carre: signe < 0 ? 'carre-decroit-avant-zero' : 'carre-croit-apres-zero',
    inverse: 'inverse-decroissante',
    cube: 'cube-croissante',
    racine: 'racine-croissante',
  }[f];
  return mancheFixe(t.melanger, {
    consigne: 'comparer-nombres',
    question: `${image(f, nb(u / 10))}   …   ${image(f, nb(v / 10))}`,
    libelles: ['<', '>'],
    bonne: juste,
    fautes: { '<': faute, '>': faute },
  });
}

/* ------------------------------------------- l'extremum dans un tableau */

function extremumTableau(t) {
  const x0 = t.entre(-6, 0);
  const x1 = x0 + t.entre(1, 4);
  const x2 = x1 + t.entre(1, 4);
  const creux = t.au([true, false]);
  let p;
  let q;
  let r;
  do {
    q = t.entre(-6, 6);
    p = creux ? q + t.entre(1, 8) : q - t.entre(1, 8);
    r = creux ? q + t.entre(1, 8) : q - t.entre(1, 8);
  } while (p === r);
  const demande = t.au(['minimum', 'maximum']);
  const [f1, f2] = creux ? ['↘', '↗'] : ['↗', '↘'];
  const question = `Tableau de variations de f :\nx : ${nb(x0)} | ${nb(x1)} | ${nb(x2)}\n`
    + `f(x) : ${nb(p)} ${f1} ${nb(q)} ${f2} ${nb(r)}\nLe ${demande} de f sur [${nb(x0)} ; ${nb(x2)}] ?`;
  const auSommet = (creux && demande === 'minimum') || (!creux && demande === 'maximum');
  const borneHaute = p > r ? [p, x0] : [r, x2];
  const borneBasse = p < r ? [p, x0] : [r, x2];
  let bonne;
  let pieges;
  if (auSommet) {
    bonne = q;
    pieges = [[x1, 'valeur-ou-abscisse'], [creux ? borneHaute[0] : borneBasse[0], 'minimum-ou-maximum']];
  } else {
    const [v, x] = creux ? borneHaute : borneBasse;
    bonne = v;
    pieges = [[x, 'valeur-ou-abscisse'], ...t.melanger([
      [creux ? borneBasse[0] : borneHaute[0], 'extremum-aux-bornes'],
      [q, 'minimum-ou-maximum'],
    ])];
  }
  return manche(t.melanger, {
    consigne: 'extremum-tableau',
    question,
    bonne: nb(bonne),
    pieges: pieges.map(([v, ph]) => [nb(v), ph]),
    voisin: (k) => nb(bonne + (k % 2 ? k : -k)),
  });
}

/* --------------------------------------- l'extremum de la fonction carré */

function extremumCarre(t) {
  const a = -t.entre(1, 6);
  let b;
  do {
    b = t.entre(1, 6);
  } while (b === -a);
  const [petit, grand] = [Math.min(a * a, b * b), Math.max(a * a, b * b)];
  const demande = t.au(['minimum', 'maximum']);
  const bonne = demande === 'minimum' ? 0 : grand;
  const pieges = demande === 'minimum'
    ? [[petit, 'carre-passe-par-zero'], [grand, 'minimum-ou-maximum']]
    : t.melanger([
      [petit, 'compare-les-deux-bornes'],
      [0, 'minimum-ou-maximum'],
      [Math.max(-a, b), 'valeur-ou-abscisse'],
    ]);
  return manche(t.melanger, {
    consigne: 'extremum-carre',
    question: `Sur [${nb(a)} ; ${nb(b)}], le ${demande} de la fonction carré ?`,
    bonne: nb(bonne),
    pieges: pieges.map(([v, ph]) => [nb(v), ph]),
    voisin: (k) => nb(bonne + k),
  });
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) { // eslint-disable-line no-unused-vars
  const t = outils(graine);
  const [c1, c2] = t.melanger(CAS);
  return t.melanger([
    variations(t), variations(t),
    comparerLettres(t, c1), comparerLettres(t, c2),
    comparerNombres(t), comparerNombres(t),
    extremumTableau(t), extremumCarre(t),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  variations: 'Sur cet intervalle, comment varie cette fonction ?',
  'comparer-images': 'Que peut-on dire des images de a et de b ?',
  'comparer-nombres': 'Sans calculatrice, compare ces deux nombres grâce aux variations de la fonction.',
  'extremum-tableau': 'Lis le tableau de variations et trouve l’extremum demandé.',
  'extremum-carre': 'Trouve l’extremum demandé de la fonction carré sur cet intervalle.',

  'carre-decroit-avant-zero': 'Sur les nombres négatifs, la fonction carré est décroissante : elle renverse l’ordre. Pense à moins trois et moins deux.',
  'carre-croit-apres-zero': 'Sur les nombres positifs, la fonction carré est croissante : elle conserve l’ordre.',
  'carre-change-en-zero': 'La fonction carré descend jusqu’à zéro puis remonte : sur un intervalle qui contient zéro, elle n’est ni croissante ni décroissante.',
  'carre-signes-contraires': 'Si a est négatif et b positif, tout dépend de leurs distances à zéro : sans les valeurs, on ne peut pas conclure.',
  'monotone-sur-l-intervalle': 'Sur cet intervalle, la fonction garde un seul sens de variation : regarde de quel côté de zéro il se trouve.',
  'monotone-conclut': 'On peut conclure : sur cet intervalle, la fonction garde le même sens de variation.',
  'inverse-decroissante': 'La fonction inverse est décroissante sur chacun de ses deux intervalles : entre deux nombres de même signe, elle renverse l’ordre.',
  'inverse-signes': 'Un inverse a le signe de son nombre : l’inverse d’un négatif est négatif, celui d’un positif est positif.',
  'racine-croissante': 'La fonction racine carrée est croissante : elle conserve l’ordre.',
  'cube-croissante': 'La fonction cube est croissante sur tous les réels, négatifs compris : elle conserve toujours l’ordre.',
  'valeur-ou-abscisse': 'Un extremum est une valeur de f, lue sur la ligne des images, pas une valeur de x.',
  'extremum-aux-bornes': 'L’extremum peut être atteint à une borne : compare les deux valeurs des extrémités.',
  'minimum-ou-maximum': 'Le minimum est la plus petite valeur prise par f ; le maximum, la plus grande.',
  'carre-passe-par-zero': 'L’intervalle contient zéro, et le carré de zéro vaut zéro : c’est le minimum.',
  'compare-les-deux-bornes': 'Le maximum est atteint à la borne la plus éloignée de zéro : compare les carrés des deux bornes.',

  'variations-regle': 'Carré : décroissante sur les négatifs, croissante sur les positifs. Inverse : décroissante de chaque côté de zéro. Racine et cube : croissantes.',
  'comparer-images-regle': 'Une fonction croissante conserve l’ordre, une fonction décroissante le renverse ; ailleurs, on ne peut pas conclure.',
  'comparer-nombres-regle': 'Situe les deux nombres, puis applique le sens de variation de la fonction sur leur intervalle.',
  'extremum-tableau-regle': 'Compare toutes les valeurs de la ligne des images, celles des bornes comprises.',
  'extremum-carre-regle': 'Sur un intervalle qui contient zéro, le carré a pour minimum zéro, et pour maximum le carré de la borne la plus éloignée de zéro.',
};
