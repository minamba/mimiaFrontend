/**
 * AJUSTER UN NUAGE DE POINTS — Nora, voie professionnelle (1re et terminale pro).
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (colonne NIVEAU de competences-lycee.txt) :
 *   1re pro : MATH_1PRO_STAT_NUAGE, MATH_1PRO_STAT_AJUSTEMENT,
 *             MATH_1PRO_STAT_INTERPOLER, MATH_1PRO_STAT_PERTINENCE
 *   Tle pro : MATH_TPRO_STAT_AJUSTEMENT, MATH_TPRO_STAT_EXPLOITER
 *   (rien en 2de pro : le fichier n'y a aucun code d'ajustement.)
 *
 * Des relevés d'entreprise, année après année, donnés dans un petit tableau ;
 * x est le rang de l'année (x = 1 la première année).
 *
 * LES SORTES DE MANCHES :
 *   - LE POINT MOYEN G(x̄ ; ȳ) : LES PIÈGES, le milieu entre la plus petite et
 *     la plus grande valeur au lieu de la moyenne, les coordonnées inversées ;
 *   - LE COEFFICIENT DIRECTEUR de la droite passant par G et un point (1re) :
 *     LES PIÈGES, Δx/Δy, oublier de diviser par Δx ;
 *   - L'ORDONNÉE À L'ORIGINE b, la droite passant par G (1re) : LES PIÈGES,
 *     b = ȳ + a x̄, b = ȳ − a ;
 *   - LA PRÉVISION pour une année : LES PIÈGES, se tromper de rang (2028 − 2020
 *     au lieu de 2028 − 2020 + 1), échanger a et b ;
 *   - LE SEUIL : pour quel rang la droite prévoit-elle telle valeur ? (Tle)
 *     LES PIÈGES, remplacer x au lieu de résoudre, ajouter b au lieu de le
 *     retrancher ;
 *   - INTERPOLATION OU EXTRAPOLATION ;
 *   - LA PRÉVISION LA PLUS FIABLE (Tle) : à l'intérieur des relevés, pas au-delà ;
 *   - LA PRÉVISION LOINTAINE : fragile, jamais exacte.
 *
 * LE DESSIN (09/10/2026) : le point moyen porte un `visuel`, le nuage des
 * relevés du tableau (sans G, qu'on cherche) ; le coefficient directeur, les
 * points G et P et la droite qui les joint ; la prévision et le seuil, la
 * droite d'ajustement de la question. Rien pour l'ordonnée à l'origine (la
 * droite couperait l'axe juste à la valeur cherchée), ni pour les questions
 * de fiabilité, qui n'ont pas de relevés à placer.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'ajuster-un-nuage', titre: 'Ajuster un nuage de points', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  PREMIERE_PRO: {
    titre: 'Ajuster un nuage de points',
    accroche: 'Point moyen, droite et prévisions.',
    competences: ['MATH_1PRO_STAT_NUAGE', 'MATH_1PRO_STAT_AJUSTEMENT', 'MATH_1PRO_STAT_INTERPOLER', 'MATH_1PRO_STAT_PERTINENCE'],
  },
  TERMINALE_PRO: {
    titre: 'Ajuster un nuage de points',
    accroche: 'Prévoir, et savoir quand se méfier.',
    competences: ['MATH_TPRO_STAT_AJUSTEMENT', 'MATH_TPRO_STAT_EXPLOITER'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/* --------------------------------------------------------------- outils */

/** Un nombre à la française : virgule, vrai signe moins, sans zéro inutile. */
export function nb(x) {
  const r = Math.round(x * 1e6) / 1e6;
  if (r === 0) return '0';
  const s = String(Math.abs(r)).replace('.', ',');
  return r < 0 ? `−${s}` : s;
}

/** « 2,4x + 31 », « −1,5x + 80 », « x − 3 ». */
export function droite(a, b) {
  let debut = `${nb(a)}x`;
  if (a === 1) debut = 'x';
  if (a === -1) debut = '−x';
  if (b === 0) return debut;
  return `${debut} ${b < 0 ? '−' : '+'} ${nb(Math.abs(b))}`;
}

const point = (nom, x, y) => `${nom}(${nb(x)} ; ${nb(y)})`;

const cartes = (liste) => liste.map((c) => ({ cle: c, libelle: c }));

/** Une manche à choix : la bonne réponse, ses pièges nommés, des voisins si deux se confondent. */
function manche(melanger, {
  consigne, question, bonne, pieges = [], voisin, visuel,
}) {
  const b = String(bonne);
  const valides = pieges.filter(([v]) => v !== null && v !== undefined && String(v) !== b);
  const liste = troisChoix(b, valides.map(([v]) => String(v)), (k) => String(voisin(k)));
  const table = {};
  valides.forEach(([v, phrase]) => {
    const c = String(v);
    if (liste.includes(c) && !(c in table)) table[c] = phrase;
  });
  const m = {
    consigne, question, choix: cartes(melanger(liste)), bonne: b, pieges: table,
  };
  if (visuel) m.visuel = visuel;
  return m;
}

/**
 * Le dessin : un repère de x = 0 à xmax qui contient ces ordonnées, avec de
 * l'air. Le zéro des y n'y est pas forcé : des relevés de 60 à 90 resteraient
 * écrasés en haut d'un repère qui partirait de 0.
 */
function repere(xmax, ys, extra = {}) {
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const air = Math.max(2, (hi - lo) * 0.15);
  return {
    type: 'courbe',
    fenetre: {
      xmin: 0, xmax, ymin: Math.floor(lo - air), ymax: Math.ceil(hi + air),
    },
    ...extra,
  };
}

/** La droite y = ax + b dans un repère de 0 à xmax, ses deux bouts en vue. */
const avecDroite = (a, b, xmax, ys = [], extra = {}) => repere(xmax, [b, a * xmax + b, ...ys], { droite: { a, b }, ...extra });

const SERIES = [
  { titre: 'Chiffre d’affaires d’un garage (k€)', monte: true },
  { titre: 'Consommation électrique d’un atelier (MWh)', monte: false },
  { titre: 'Apprentis accueillis par une entreprise', monte: true },
  { titre: 'Pièces rebutées par une ligne de production', monte: false },
  { titre: 'Colis livrés par un dépôt (milliers)', monte: true },
];

/** Un quotient a/b décimal à deux chiffres au plus, écrit sans arrondi. */
const decimalExact = (a, b) => b !== 0 && (a * 100) % b === 0;

/* ------------------------------------------------------- les manches */

function pointMoyen(t) {
  const serie = t.au(SERIES);
  const n = t.entre(4, 5);
  const xs = Array.from({ length: n }, (_, k) => k + 1);
  const a = t.entre(2, 9) * (serie.monte ? 1 : -1);
  const b = serie.monte ? t.entre(30, 80) : t.entre(60, 100);
  let ys;
  do {
    ys = xs.map((x) => a * x + b + t.entre(-3, 3));
  } while (new Set(ys).size < n);
  const somme = (l) => l.reduce((s, v) => s + v, 0);
  const xm = somme(xs) / n;
  const ym = somme(ys) / n;
  const milieu = (Math.min(...ys) + Math.max(...ys)) / 2;
  return manche(t.melanger, {
    consigne: 'point-moyen',
    question: `${serie.titre}.\nRang de l’année x : ${xs.join(' | ')}\ny : ${ys.map(nb).join(' | ')}\nPoint moyen G ?`,
    bonne: point('G', xm, ym),
    pieges: t.melanger([[point('G', xm, milieu), 'moyenne-pas-milieu'], [point('G', ym, xm), 'coordonnees-ordre']]),
    voisin: (k) => point('G', xm, ym + k),
    visuel: repere(n + 1, ys, { nuage: xs.map((x, i) => [x, ys[i]]) }),
  });
}

function coefficient(t) {
  let dx;
  let dy;
  do {
    dx = t.entre(2, 5);
    dy = t.entre(1, 20) * (t.entre(0, 1) ? 1 : -1);
  } while (Math.abs(dx) === Math.abs(dy) || !decimalExact(dy, dx) || !decimalExact(dx, dy));
  const xg = t.entre(2, 4);
  const yg = t.entre(25, 80);
  return manche(t.melanger, {
    consigne: 'coefficient',
    question: `${t.au(SERIES).titre}.\nLa droite d’ajustement passe par le point moyen ${point('G', xg, yg)} et par ${point('P', xg + dx, yg + dy)}.\nCoefficient directeur a ?`,
    bonne: nb(dy / dx),
    pieges: t.melanger([[nb(dx / dy), 'coefficient-directeur'], [nb(dy), 'diviser-par-ecart']]),
    voisin: (k) => nb(dy / dx + k),
    // La droite par G et P : y = yG + a (x − xG).
    visuel: avecDroite(dy / dx, yg - (dy / dx) * xg, xg + dx + 1, [yg, yg + dy], {
      points: [{ x: xg, y: yg, etiquette: 'G' }, { x: xg + dx, y: yg + dy, etiquette: 'P' }],
    }),
  });
}

function ordonnee(t) {
  let a10;
  do a10 = t.entre(5, 60) * (t.entre(0, 2) ? 1 : -1); while (Math.abs(a10) === 10);
  const a = a10 / 10;
  const xg10 = t.au([20, 25, 30, 35, 40]);
  const xg = xg10 / 10;
  const yg = t.entre(25, 90);
  const produit = (a10 * xg10) / 100;
  return manche(t.melanger, {
    consigne: 'ordonnee',
    question: `${t.au(SERIES).titre}.\nLa droite d’ajustement y = ${nb(a)}x + b passe par le point moyen ${point('G', xg, yg)}.\nValeur de b ?`,
    bonne: nb(yg - produit),
    pieges: t.melanger([[nb(yg + produit), 'isoler-b'], [nb(yg - a), 'a-fois-x']]),
    voisin: (k) => nb(yg - produit + k),
  });
}

function prevision(t) {
  const serie = t.au(SERIES);
  const a10 = t.entre(5, 60) * (serie.monte ? 1 : -1);
  const a = a10 / 10;
  const b = t.entre(serie.monte ? 20 : 120, serie.monte ? 80 : 200);
  const debut = t.entre(2015, 2020);
  const rang = t.entre(7, 10);
  const annee = debut + rang - 1;
  const valeur = (r) => (a10 * r) / 10 + b;
  return manche(t.melanger, {
    consigne: 'prevision',
    question: `${serie.titre}.\nAjustement : y = ${droite(a, b)}, avec x le rang de l’année (x = 1 en ${debut}).\nPrévision pour ${annee} ?`,
    bonne: nb(valeur(rang)),
    pieges: t.melanger([[nb(valeur(rang - 1)), 'rang-de-l-annee'], [nb(b * rang + a), 'coefficient-et-ordonnee']]),
    voisin: (k) => nb(valeur(rang) + k),
    // Toujours jusqu'à x = 11 : une fenêtre taillée sur le rang le soufflerait.
    visuel: avecDroite(a, b, 11),
  });
}

function seuil(t) {
  const serie = t.au(SERIES.filter((s) => s.monte));
  const a = t.au([0.25, 0.5, 0.8, 1.25, 2, 2.5, 4, 5]);
  const b = t.entre(10, 80);
  const x0 = t.entre(7, 15);
  const y = a * x0 + b;
  return manche(t.melanger, {
    consigne: 'seuil',
    question: `${serie.titre}.\nAjustement : y = ${droite(a, b)}, avec x le rang de l’année.\nPour quel rang x prévoit-on y = ${nb(y)} ?`,
    bonne: nb(x0),
    pieges: t.melanger([[nb(a * y + b), 'equation-inverse'], [nb((y + b) / a), 'isoler-x']]),
    voisin: (k) => nb(x0 + k),
    // Toujours jusqu'à x = 20 : une fenêtre taillée sur x0 soufflerait la réponse.
    visuel: avecDroite(a, b, 20),
  });
}

const INTER = 'Une interpolation';
const EXTRA = 'Une extrapolation';

function interpolation(t) {
  const serie = t.au(SERIES);
  const n = t.entre(5, 8);
  const dedans = t.entre(0, 1) === 1;
  const x = dedans ? t.entre(1, n - 1) + 0.5 : n + t.entre(1, 12);
  return {
    consigne: 'interpolation',
    question: `${serie.titre}.\nRelevés pour x allant de 1 à ${n} (rang de l’année).\nEstimer y pour x = ${nb(x)} avec la droite d’ajustement, c’est :`,
    choix: cartes(t.melanger([INTER, EXTRA])),
    bonne: dedans ? INTER : EXTRA,
    pieges: dedans ? { [EXTRA]: 'interpolation-dedans' } : { [INTER]: 'extrapolation-dehors' },
  };
}

function plusFiable(t) {
  const serie = t.au(SERIES);
  const n = t.entre(5, 8);
  const dedans = `x = ${nb(t.entre(1, n - 1) + 0.5)}`;
  const proche = `x = ${n + t.entre(2, 4)}`;
  const loin = `x = ${n + t.entre(20, 40)}`;
  return {
    consigne: 'plus-fiable',
    question: `${serie.titre}.\nRelevés pour x allant de 1 à ${n} (rang de l’année), ajustés par une droite.\nQuelle estimation est la plus fiable ?`,
    choix: cartes(t.melanger([dedans, proche, loin])),
    bonne: dedans,
    pieges: { [proche]: 'extrapolation-proche', [loin]: 'extrapolation-lointaine' },
  };
}

const FRAGILE = 'Très fragile';

function lointaine(t) {
  const serie = t.au(SERIES);
  const debut = t.entre(2015, 2020);
  const fin = debut + t.entre(4, 6);
  const cible = fin + t.entre(15, 30);
  return {
    consigne: 'prevision-lointaine',
    question: `${serie.titre}.\nRelevés de ${debut} à ${fin}, ajustés par une droite.\nOn s’en sert pour prévoir la valeur de ${cible}. Cette prévision est :`,
    choix: cartes(t.melanger([FRAGILE, 'Fiable', 'Exacte'])),
    bonne: FRAGILE,
    pieges: { Fiable: 'extrapolation-lointaine', Exacte: 'ajustement-pas-exact' },
  };
}

/* ------------------------------------------------------------ la partie */

export function serie(graine = Date.now(), niveau = CLASSES[0]) {
  const t = outils(graine);
  let liste;
  if (niveau === 'TERMINALE_PRO') {
    liste = [
      pointMoyen(t),
      prevision(t), prevision(t),
      seuil(t), seuil(t),
      interpolation(t),
      plusFiable(t),
      lointaine(t),
    ];
  } else {
    liste = [
      pointMoyen(t), pointMoyen(t),
      coefficient(t),
      ordonnee(t),
      prevision(t), prevision(t),
      interpolation(t),
      lointaine(t),
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
  'point-moyen': 'Calcule les coordonnées du point moyen du nuage.',
  coefficient: 'Calcule le coefficient directeur de la droite d’ajustement.',
  ordonnee: 'Trouve l’ordonnée à l’origine de la droite d’ajustement.',
  prevision: 'Utilise la droite d’ajustement pour faire cette prévision.',
  seuil: 'Trouve pour quel rang la droite prévoit cette valeur.',
  interpolation: 'Interpolation ou extrapolation ?',
  'plus-fiable': 'Choisis l’estimation la plus fiable.',
  'prevision-lointaine': 'Juge la fiabilité de cette prévision.',

  'moyenne-pas-milieu': 'Le point moyen utilise la moyenne de toutes les valeurs, pas le milieu entre la plus petite et la plus grande.',
  'coordonnees-ordre': 'Un point s’écrit abscisse d’abord, ordonnée ensuite : la moyenne des x, puis celle des y.',
  'coefficient-directeur': 'Le coefficient directeur, c’est la variation des y divisée par la variation des x, pas l’inverse.',
  'diviser-par-ecart': 'Après la différence des y, divise par la différence des x.',
  'isoler-b': 'Pour isoler b, retranche a fois x des deux côtés : b égale y moins a fois x.',
  'a-fois-x': 'On retranche a multiplié par l’abscisse du point, pas a tout seul.',
  'rang-de-l-annee': 'Attention au rang : la première année a le rang un, donc le rang d’une année, c’est son écart avec la première année, plus un.',
  'coefficient-et-ordonnee': 'Dans y égale a x plus b, c’est a qui multiplie x ; b s’ajoute ensuite.',
  'equation-inverse': 'Ici, on connaît y et on cherche x : résous l’équation au lieu de remplacer x.',
  'isoler-x': 'Pour isoler x, retranche d’abord b, puis divise par a.',
  'interpolation-dedans': 'La valeur est entre la plus petite et la plus grande valeur relevée : c’est une interpolation.',
  'extrapolation-dehors': 'La valeur est en dehors de la plage des relevés : c’est une extrapolation.',
  'extrapolation-proche': 'Même un peu au-delà des relevés, on extrapole : une estimation à l’intérieur de la plage reste plus sûre.',
  'extrapolation-lointaine': 'Plus on s’éloigne des relevés, plus la prévision est fragile : rien ne dit que la tendance va durer.',
  'ajustement-pas-exact': 'Une droite d’ajustement résume une tendance : elle ne donne jamais une valeur exacte.',

  'point-moyen-regle': 'Fais la moyenne des x, puis la moyenne des y.',
  'coefficient-regle': 'Divise la différence des y par la différence des x.',
  'ordonnee-regle': 'Remplace x et y par les coordonnées du point moyen, puis isole b.',
  'prevision-regle': 'Trouve le rang de l’année, puis remplace x par ce rang dans l’équation.',
  'seuil-regle': 'Résous a x plus b égale la valeur visée : retranche b, puis divise par a.',
  'interpolation-regle': 'À l’intérieur de la plage des relevés, on interpole ; au-delà, on extrapole.',
  'plus-fiable-regle': 'Une estimation à l’intérieur des relevés est plus sûre qu’une prévision au-delà.',
  'prevision-lointaine-regle': 'Une prévision très loin des relevés suppose que la tendance dure : elle reste fragile.',
};
