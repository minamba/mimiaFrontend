/**
 * LA DROITE DES RELATIFS — repérer, comparer et ranger des relatifs, en 5e.
 * Professeure : Nora (mathématiques).
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - COMPARER (3) : le plus grand, ou le plus petit, de deux relatifs —
 *     deux négatifs (entiers ou à une décimale), ou un négatif et un positif ;
 *   - REPÉRER (3) : l'abscisse d'un point sur une droite graduée de 2 en 2,
 *     de 5 en 5, de 10 en 10 ou de 0,5 en 0,5, ou l'arrivée d'un point qu'on
 *     déplace vers la droite ou vers la gauche ;
 *   - RANGER (2) : quatre relatifs dans l'ordre croissant ou décroissant.
 *
 * LE PIÈGE DE LA 5e : −7 > −3, parce que 7 > 3. Puis : ranger selon la
 * distance à zéro, compter les graduations sans leur valeur, oublier que la
 * gauche de zéro est négative.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'droite-des-relatifs', titre: 'La droite des relatifs', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'La droite des relatifs',
    accroche: 'À gauche de zéro, tout est négatif.',
    competences: ['MATH_5E_REL_SENS'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −3,5 » : signe moins typographique et virgule. */
const rel = (n) => (n < 0 ? `−${String(-n).replace('.', ',')}` : String(n).replace('.', ','));
/** Arrondi au dixième, pour que 0,1 + 0,2 reste 0,3. */
const net = (x) => Math.round(x * 10) / 10;

function faire(melanger, consigne, question, bonne, paires, voisin, extra = {}) {
  const liste = troisChoix(bonne, paires.map(([k]) => k), voisin);
  const pieges = {};
  paires.forEach(([k, p]) => {
    if (k !== bonne && liste.includes(k) && !(k in pieges)) pieges[k] = p;
  });
  return {
    consigne, question, choix: melanger(liste).map((c) => ({ cle: c, libelle: c })), bonne, pieges, ...extra,
  };
}

function comparer(o) {
  const { entre, au, melanger } = o;
  const sorte = au(['negatifs', 'negatifs', 'decimaux', 'signes']);
  let a;
  let b;
  if (sorte === 'negatifs') {
    a = -entre(1, 15);
    b = -entre(1, 14);
    if (b <= a) b -= 1; // deux nombres différents
  } else if (sorte === 'decimaux') {
    // Même partie entière, dixièmes différents : −3,4 et −3,7.
    const u = entre(1, 9);
    const t1 = entre(1, 9);
    let t2 = entre(1, 8);
    if (t2 >= t1) t2 += 1;
    a = -net(u + t1 / 10);
    b = -net(u + t2 / 10);
  } else {
    a = -entre(5, 15);
    b = entre(1, 4);
  }
  const grand = au([true, false]);
  const bonne = grand ? Math.max(a, b) : Math.min(a, b);
  const autre = bonne === a ? b : a;
  const phrase = sorte === 'signes' ? 'comparer-signe' : 'comparer-negatifs';
  return {
    consigne: grand ? 'plus-grand' : 'plus-petit',
    question: `${rel(a)}   ou   ${rel(b)} ?`,
    choix: melanger([rel(a), rel(b)]).map((c) => ({ cle: c, libelle: c })),
    bonne: rel(bonne),
    pieges: { [rel(autre)]: phrase },
  };
}

function reperer(o) {
  const { entre, au, melanger } = o;
  if (au([true, true, false])) {
    const pas = au([2, 5, 10, 0.5]);
    const n = entre(2, 8);
    const gauche = au([true, true, false]);
    const x = net((gauche ? -1 : 1) * n * pas);
    const question = `Sur une droite graduée, chaque graduation vaut ${rel(pas)}.\nLe point A est ${n} graduations à ${gauche ? 'gauche' : 'droite'} de zéro.\nAbscisse de A ?`;
    return faire(melanger, 'abscisse', question, rel(x), [
      [rel((gauche ? -1 : 1) * n), 'abscisse-pas'],
      [rel(-x), 'abscisse-gauche'],
    ], (i) => rel(net(x + i * pas)));
  }
  const depart = -entre(1, 9);
  const versDroite = au([true, false]);
  const d = entre(2, 12);
  const fin = versDroite ? depart + d : depart - d;
  const question = `Le point A a pour abscisse ${rel(depart)}.\nLe point B est ${d} unités à ${versDroite ? 'droite' : 'gauche'} de A.\nAbscisse de B ?`;
  return faire(melanger, 'deplacer', question, rel(fin), [
    [rel(versDroite ? depart - d : depart + d), 'droite-gauche'],
    [rel(versDroite ? d : -d), 'abscisse-depart'],
  ], (i) => rel(fin + i));
}

function ranger(o) {
  const { au, melanger } = o;
  const valeurs = melanger([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
  const nombres = [-valeurs[0], -valeurs[1], valeurs[2], valeurs[3]];
  const croissant = au([true, false]);
  const ordre = (liste) => (croissant ? liste : [...liste].reverse());
  const ecrire = (liste) => ordre(liste).map(rel).join(croissant ? ' < ' : ' > ');
  const juste = [...nombres].sort((x, y) => x - y);
  const distance = [...nombres].sort((x, y) => Math.abs(x) - Math.abs(y));
  const negatifs = [
    ...nombres.filter((x) => x < 0).sort((x, y) => y - x),
    ...nombres.filter((x) => x > 0).sort((x, y) => x - y),
  ];
  // Le sens inversé : le bon rangement lu à l'envers, sous le même signe.
  const inverse = [...ordre(juste)].reverse().map(rel).join(croissant ? ' < ' : ' > ');
  return faire(melanger, croissant ? 'ranger-croissant' : 'ranger-decroissant', `Range : ${melanger(nombres).map(rel).join(' ; ')}`, ecrire(juste), [
    [ecrire(distance), 'ranger-distance'],
    [ecrire(negatifs), 'ranger-negatifs'],
    [inverse, 'ranger-sens'],
  ], (i) => ecrire([...juste.slice(i % 4), ...juste.slice(0, i % 4)]));
}

/* ------------------------------------------------------------- la série */

const fois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  CINQUIEME: (o) => [...fois(3, comparer, o), ...fois(3, reperer, o), ...fois(2, ranger, o)],
};

export function serie(graine = Date.now(), niveau = 'CINQUIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES.CINQUIEME;
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'plus-grand': 'Lequel de ces deux nombres est le plus grand ?',
  'plus-petit': 'Lequel de ces deux nombres est le plus petit ?',
  'comparer-negatifs': 'Entre deux nombres négatifs, le plus grand est le plus proche de zéro : moins trois est plus grand que moins sept.',
  'comparer-signe': 'Un nombre positif est toujours plus grand qu’un nombre négatif, quelle que soit la distance à zéro.',
  'plus-grand-regle': 'Sur la droite graduée, le plus grand nombre est le plus à droite.',
  'plus-petit-regle': 'Sur la droite graduée, le plus petit nombre est le plus à gauche.',
  abscisse: 'Quelle est l’abscisse de ce point ?',
  'abscisse-pas': 'Une graduation ne vaut pas forcément un : multiplie le nombre de graduations par la valeur d’une graduation.',
  'abscisse-gauche': 'À gauche de zéro, les abscisses sont négatives ; à droite, elles sont positives.',
  'abscisse-regle': 'Multiplie le nombre de graduations par la valeur d’une graduation, et mets le signe moins si le point est à gauche de zéro.',
  deplacer: 'Où arrive ce point sur la droite graduée ?',
  'droite-gauche': 'Vers la droite, les nombres augmentent : on ajoute. Vers la gauche, ils diminuent : on retranche.',
  'abscisse-depart': 'Pars de l’abscisse du premier point, pas de zéro.',
  'deplacer-regle': 'Pars de l’abscisse de départ : ajoute si tu vas vers la droite, retranche si tu vas vers la gauche.',
  'ranger-croissant': 'Range ces nombres dans l’ordre croissant.',
  'ranger-decroissant': 'Range ces nombres dans l’ordre décroissant.',
  'ranger-distance': 'On ne range pas selon la distance à zéro : un nombre négatif est toujours plus petit qu’un nombre positif.',
  'ranger-negatifs': 'Entre deux nombres négatifs, le plus petit est le plus éloigné de zéro : moins cinq est plus petit que moins un.',
  'ranger-sens': 'Croissant, c’est du plus petit au plus grand ; décroissant, du plus grand au plus petit.',
  'ranger-croissant-regle': 'Place les nombres sur la droite graduée, et lis-les de gauche à droite.',
  'ranger-decroissant-regle': 'Place les nombres sur la droite graduée, et lis-les de droite à gauche.',
};
