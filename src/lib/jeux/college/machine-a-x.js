/**
 * LA MACHINE À X — le calcul littéral, de la 5e à la 3e.
 * Professeure : Nora (mathématiques).
 *
 * LES EXPRESSIONS SONT DES POLYNÔMES calculés ici ([constante, x, x²]),
 * multipliés et réduits par le code, puis écrits à la française
 * (« 3x² − 5x + 2 »). Une réponse n'est jamais recopiée ; le test le vérifie
 * en évaluant la question et chaque choix pour plusieurs valeurs de x.
 *
 * PAR CLASSE (trois sortes de manches, 3 + 3 + 2, mélangées) :
 *   5e — réduire (3x + 5 + 2x − 1, 3x × 2x), substituer une valeur, tester
 *        une égalité ;
 *   4e — distributivité simple, double distributivité, factoriser simple ;
 *   3e — développer avec les identités remarquables, factoriser avec elles,
 *        factoriser par un facteur commun entre parenthèses.
 *
 * LES PIÈGES : 3x + 2x = 5x², les x ajoutés aux nombres, 2x lu « vingt-trois »
 * quand x = 3, x² pris pour 2x, le second terme oublié par la distributivité,
 * les termes croisés oubliés, (a + b)² = a² + b², le moins devant une
 * parenthèse qui ne change qu'un signe, le facteur commun écrit deux fois.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'machine-a-x', titre: 'La machine à x', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'La machine à x',
    accroche: 'Une lettre à la place d’un nombre.',
    competences: ['MATH_5E_LITT_EXPRESSION', 'MATH_5E_LITT_SUBSTITUER'],
  },
  QUATRIEME: {
    titre: 'La machine à x',
    accroche: 'Développe, puis factorise.',
    competences: ['MATH_4E_LITT_DEVELOPPER', 'MATH_4E_LITT_FACTORISER'],
  },
  TROISIEME: {
    titre: 'La machine à x',
    accroche: 'Identités remarquables, dans les deux sens.',
    competences: ['MATH_3E_LITT_REMARQUABLE', 'MATH_3E_LITT_FACTORISER'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const rel = (n) => (n < 0 ? `−${-n}` : `${n}`);
const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));

/** [c, b, a] → « ax² + bx + c », à la française. */
export function poly(p) {
  const termes = [[p[2] ?? 0, 'x²'], [p[1] ?? 0, 'x'], [p[0] ?? 0, '']].filter(([c]) => c !== 0);
  if (!termes.length) return '0';
  return termes.map(([c, v], i) => {
    const abs = Math.abs(c);
    const corps = v && abs === 1 ? v : `${abs}${v}`;
    if (i === 0) return c < 0 ? `−${corps}` : corps;
    return c < 0 ? ` − ${corps}` : ` + ${corps}`;
  }).join('');
}
/** « 3x − 5 » */
const lin = (a, b) => poly([b, a, 0]);
/** Le produit de deux polynômes. */
function fois(p, q) {
  const r = [0, 0, 0, 0, 0];
  p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
  return r;
}
const plus = (p, q) => [0, 1, 2].map((i) => (p[i] ?? 0) + (q[i] ?? 0));
const moins = (p, q) => [0, 1, 2].map((i) => (p[i] ?? 0) - (q[i] ?? 0));

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

function nonNul(entre, a, b) {
  let v = 0;
  while (v === 0) v = entre(a, b);
  return v;
}
/** « + 5 » ou « − 5 » */
const signe = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);

/* ------------------------------------------------------------------ 5e */

function reduire(o) {
  const { entre, au, melanger } = o;
  if (au([true, true, false])) {
    const a = entre(2, 9);
    const c = entre(2, 9);
    const b = entre(1, 9);
    const d = nonNul(entre, -9, 9);
    return faire(melanger, 'reduire', `${a}x + ${b} + ${c}x ${signe(d)}`, poly([b + d, a + c, 0]), [
      [poly([b + d, 0, a + c]), 'reduire-carre'],
      [poly([0, a + b + c + d, 0]), 'reduire-melange'],
    ], (i) => poly([b + d + i, a + c, 0]));
  }
  const a = entre(2, 9);
  const b = entre(2, 9);
  return faire(melanger, 'reduire', `${a}x × ${b}x`, poly([0, 0, a * b]), [
    [poly([0, a * b, 0]), 'produit-carre'],
    [poly([0, 0, a + b]), 'produit-additionner'],
  ], (i) => poly([0, 0, a * b + i]));
}

function substituer(o) {
  const { entre, au, melanger } = o;
  const v = entre(2, 9);
  if (au([true, false])) {
    const a = entre(2, 9);
    const b = entre(1, 9);
    const r = a * v + b;
    return faire(melanger, 'substituer', `Pour x = ${v} :\n${a}x + ${b}`, String(r), [
      [String(10 * a + v + b), 'substituer-juxtaposer'],
      [String(a + v + b), 'substituer-ajouter'],
    ], (i) => String(r + i));
  }
  const a = au([1, 2, 3, 4, 5]);
  const b = entre(1, 9);
  const r = a * v * v + b;
  const pieges = [[String(a * 2 * v + b), 'carre-double']];
  if (a > 1) pieges.push([String(a * a * v * v + b), 'priorite-carre']);
  return faire(melanger, 'substituer', `Pour x = ${v} :\n${a === 1 ? '' : a}x² + ${b}`, String(r), pieges, (i) => String(r + i));
}

function tester(o) {
  const { entre, au, melanger } = o;
  const v = entre(1, 6);
  const a = entre(1, 9);
  let c = entre(1, 9);
  if (c === a) c = a === 9 ? 8 : a + 1;
  const b = entre(0, 9);
  const vraie = au([true, false]);
  const e = a * v + b - c * v + (vraie ? 0 : nonNul(entre, -3, 3));
  const bonne = vraie ? 'vraie' : 'fausse';
  return {
    consigne: 'tester-egalite',
    question: `Pour x = ${v} :\n${lin(a, b)} = ${lin(c, e)}`,
    choix: melanger(['vraie', 'fausse']).map((k) => ({ cle: k, libelle: k })),
    bonne,
    pieges: { [vraie ? 'fausse' : 'vraie']: 'egalite-tester' },
  };
}

/* ------------------------------------------------------------------ 4e */

/** « −3 », « x », « 2x », « −x » : le facteur devant la parenthèse. */
const facteur = (m, deg) => {
  if (deg === 0) return rel(m);
  if (m === 1) return 'x';
  if (m === -1) return '−x';
  return `${rel(m)}x`;
};

function developper(o) {
  const { entre, au, melanger } = o;
  const deg = au([0, 0, 1]);
  const m = deg === 0 ? nonNul(entre, -9, 9) : nonNul(entre, -4, 4);
  const k = deg === 0 && Math.abs(m) === 1 ? 2 * m : m;
  const F = deg === 0 ? [k] : [0, k];
  const a = entre(1, 5);
  const b = nonNul(entre, -9, 9);
  const bonne = fois(F, [b, a]);
  const premier = fois(F, [0, a]);
  return faire(melanger, 'developper', `${facteur(k, deg)}(${lin(a, b)})`, poly(bonne), [
    [poly(plus(premier, [b])), 'distribuer-tout'],
    [poly(moins(premier, fois(F, [b]))), 'distribuer-signe'],
  ], (i) => poly(plus(bonne, [i])));
}

function double(o) {
  const { entre, au, melanger } = o;
  const a = au([1, 1, 2, 3]);
  const c = au([1, 1, 2]);
  const b = nonNul(entre, -7, 7);
  let d = nonNul(entre, -7, 7);
  if (a * d + b * c === 0) d = d === 7 ? 6 : d + 1;
  if (d === 0) d = 1;
  if (a * d + b * c === 0) d += 1;
  const bonne = fois([b, a], [d, c]);
  return faire(melanger, 'double', `(${lin(a, b)})(${lin(c, d)})`, poly(bonne), [
    [poly([b * d, 0, a * c]), 'double-distributivite'],
    [poly([-b * d, a * d + b * c, a * c]), 'double-signe'],
  ], (i) => poly(plus(bonne, [0, i])));
}

function factoriser(o) {
  const { entre, au, melanger } = o;
  if (au([true, true, false])) {
    const k = entre(2, 9);
    let a = entre(1, 9);
    const b = nonNul(entre, -9, 9);
    while (pgcd(a, b) !== 1) a -= 1;
    return faire(melanger, 'factoriser', poly([k * b, k * a, 0]), `${k}(${lin(a, b)})`, [
      [`${k}(${lin(a, k * b)})`, 'factoriser-diviser-tout'],
      [`${k}(${lin(a, -b)})`, 'factoriser-signe'],
    ], (i) => `${k + i}(${lin(a, b)})`);
  }
  let a = entre(1, 9);
  const b = nonNul(entre, -9, 9);
  while (pgcd(a, b) !== 1) a -= 1;
  // Le piège : x(3x + 5x), le x du second terme oublié dans la division.
  const garde = `x(${lin(a, 0)} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x)`;
  return faire(melanger, 'factoriser', poly([0, b, a]), `x(${lin(a, b)})`, [
    [garde, 'factoriser-diviser-tout'],
    [`x(${lin(a, -b)})`, 'factoriser-signe'],
  ], (i) => `x(${lin(a + i, b)})`);
}

/* ------------------------------------------------------------------ 3e */

function identite(o) {
  const { entre, au, melanger } = o;
  const k = au([1, 1, 2, 3]);
  const a = entre(1, 9);
  const tete = k === 1 ? 'x' : `${k}x`;
  const sorte = au(['somme', 'difference', 'produit']);
  if (sorte === 'somme') {
    return faire(melanger, 'identite', `(${tete} + ${a})²`, poly([a * a, 2 * k * a, k * k]), [
      [poly([a * a, 0, k * k]), 'identite-double-produit'],
      k === 1 ? [poly([a * a, a, 1]), 'identite-deux-fois'] : [poly([a * a, 2 * k * a, k]), 'carre-coefficient'],
    ], (i) => poly([a * a + i, 2 * k * a, k * k]));
  }
  if (sorte === 'difference') {
    return faire(melanger, 'identite', `(${tete} − ${a})²`, poly([a * a, -2 * k * a, k * k]), [
      [poly([-a * a, 0, k * k]), 'identite-double-produit'],
      [poly([a * a, 2 * k * a, k * k]), 'identite-signe'],
    ], (i) => poly([a * a + i, -2 * k * a, k * k]));
  }
  return faire(melanger, 'identite', `(${tete} + ${a})(${tete} − ${a})`, poly([-a * a, 0, k * k]), [
    [poly([a * a, 0, k * k]), 'identite-difference'],
    [poly([a * a, -2 * k * a, k * k]), 'identite-confusion'],
  ], (i) => poly([-a * a - i, 0, k * k]));
}

function factoriserRemarquable(o) {
  const { entre, au, melanger } = o;
  const sorte = au(['difference', 'difference', 'somme', 'ecart']);
  if (sorte === 'difference') {
    const k = au([1, 1, 2, 3, 4, 5]);
    let a = entre(2, 9);
    while (pgcd(k, a) !== 1) a += 1;
    const tete = k === 1 ? 'x' : `${k}x`;
    const carre = k === 1 ? 'x' : `${k * k}x`;
    return faire(melanger, 'factoriser-remarquable', poly([-a * a, 0, k * k]), `(${tete} − ${a})(${tete} + ${a})`, [
      [`(${tete} − ${a})²`, 'factoriser-difference'],
      [`(${carre} − ${a * a})(${carre} + ${a * a})`, 'factoriser-racine'],
    ], (i) => `(${tete} − ${a + i})(${tete} + ${a + i})`);
  }
  const a = entre(1, 9);
  const s = sorte === 'somme' ? 1 : -1;
  return faire(melanger, 'factoriser-remarquable', poly([a * a, 2 * s * a, 1]), `(${lin(1, s * a)})²`, [
    [`(${lin(1, -s * a)})²`, 'factoriser-signe-carre'],
    [`(x + ${a})(x − ${a})`, 'factoriser-identite'],
  ], (i) => `(${lin(1, s * (a + i))})²`);
}

function facteurCommun(o) {
  const { entre, au, melanger } = o;
  const a = nonNul(entre, -6, 6);
  const retire = au([true, true, false]);
  for (;;) {
    const p = entre(2, 6);
    const r = entre(1, 5);
    const q = nonNul(entre, -7, 7);
    const s = nonNul(entre, -7, 7);
    const P = retire ? p - r : p + r;
    const Q = retire ? q - s : q + s;
    if (P > 0 && Q !== 0 && pgcd(P, Q) === 1 && (!retire || q + s !== Q)) {
      const commun = `(${lin(1, a)})`;
      const question = `${commun}(${lin(p, q)}) ${retire ? '−' : '+'} ${commun}(${lin(r, s)})`;
      const pieges = [[`${commun}²(${lin(P, Q)})`, 'facteur-une-fois']];
      if (retire) pieges.unshift([`${commun}(${lin(P, q + s)})`, 'factoriser-moins']);
      return faire(melanger, 'facteur-commun', question, `${commun}(${lin(P, Q)})`, pieges,
        (i) => `${commun}(${lin(P + i, Q)})`);
    }
  }
}

/* ------------------------------------------------------------- la série */

const nFois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  CINQUIEME: (o) => [...nFois(3, reduire, o), ...nFois(3, substituer, o), ...nFois(2, tester, o)],
  QUATRIEME: (o) => [...nFois(3, developper, o), ...nFois(3, double, o), ...nFois(2, factoriser, o)],
  TROISIEME: (o) => [...nFois(3, identite, o), ...nFois(3, factoriserRemarquable, o), ...nFois(2, facteurCommun, o)],
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
  // 5e
  reduire: 'Réduis cette expression.',
  'reduire-carre': 'Additionner des x ne fait pas de x au carré : trois x plus deux x, c’est cinq x.',
  'reduire-melange': 'Les termes en x et les nombres seuls ne s’ajoutent pas entre eux : regroupe les x d’un côté, les nombres de l’autre.',
  'produit-carre': 'x fois x, c’est x au carré : multiplie les nombres entre eux, et les x entre eux.',
  'produit-additionner': 'Dans un produit, on multiplie les nombres entre eux, on ne les additionne pas.',
  'reduire-regle': 'Regroupe les termes de même nature : les x avec les x, les nombres avec les nombres.',
  substituer: 'Remplace x par sa valeur, puis calcule.',
  'substituer-juxtaposer': 'Entre le nombre et la lettre, il y a un signe fois caché : deux x, c’est deux fois x.',
  'substituer-ajouter': 'Le nombre collé à x le multiplie, il ne s’y ajoute pas.',
  'carre-double': 'x au carré, c’est x fois x, et non deux fois x.',
  'priorite-carre': 'Le carré ne porte que sur x : calcule d’abord x au carré, puis multiplie par le nombre devant.',
  'substituer-regle': 'Remplace x par sa valeur en rétablissant les signes fois, puis respecte les priorités.',
  'tester-egalite': 'Cette égalité est-elle vraie pour cette valeur de x ?',
  'egalite-tester': 'Calcule chaque membre séparément avec la valeur de x : l’égalité est vraie seulement si les deux résultats sont égaux.',
  'tester-egalite-regle': 'Calcule le membre de gauche, puis celui de droite, et compare.',
  // 4e
  developper: 'Développe et réduis.',
  'distribuer-tout': 'Le facteur devant la parenthèse multiplie chaque terme de la parenthèse, le second aussi.',
  'distribuer-signe': 'Applique la règle des signes à chaque produit : plus par moins donne moins, moins par moins donne plus.',
  'developper-regle': 'Multiplie le facteur par chaque terme de la parenthèse, en suivant la règle des signes.',
  double: 'Développe ce produit de deux parenthèses.',
  'double-distributivite': 'Chaque terme de la première parenthèse multiplie chaque terme de la seconde : il y a quatre produits, pas deux.',
  'double-signe': 'Le nombre seul du résultat est le produit des deux nombres seuls, avec la règle des signes.',
  'double-regle': 'Fais les quatre produits, en suivant la règle des signes, puis réduis.',
  factoriser: 'Factorise cette expression.',
  'factoriser-diviser-tout': 'Le facteur commun se retire de chaque terme : divise chaque terme par ce facteur.',
  'factoriser-signe': 'Vérifie en développant : les signes dans la parenthèse doivent redonner exactement l’expression de départ.',
  'factoriser-regle': 'Trouve ce qui est commun aux deux termes, mets-le devant, et écris dans la parenthèse ce qui reste de chaque terme.',
  // 3e
  identite: 'Développe avec une identité remarquable.',
  'identite-double-produit': 'Le carré d’une somme ou d’une différence a trois termes : n’oublie pas le double produit, deux fois a fois b.',
  'identite-deux-fois': 'Le terme du milieu est le double produit : deux fois le premier terme fois le second.',
  'carre-coefficient': 'Le nombre devant x est élevé au carré lui aussi : le carré de trois x, c’est neuf x au carré.',
  'identite-signe': 'Dans le carré d’une différence, le double produit est précédé d’un signe moins ; le dernier carré, lui, est positif.',
  'identite-difference': 'Une somme fois une différence donne une différence de deux carrés : le second carré est retranché.',
  'identite-confusion': 'Ce n’est pas un carré : une somme fois une différence donne la différence des carrés, sans double produit.',
  'identite-regle': 'Reconnais l’identité : carré d’une somme, carré d’une différence, ou somme fois différence, puis applique sa formule.',
  'factoriser-remarquable': 'Factorise avec une identité remarquable.',
  'factoriser-difference': 'Une différence de deux carrés se factorise en somme fois différence, pas en carré.',
  'factoriser-racine': 'Prends les racines carrées : il faut retrouver ce qui, mis au carré, donne chacun des deux termes.',
  'factoriser-identite': 'Trois termes, dont un double produit : c’est le carré d’une somme ou d’une différence, pas une somme fois une différence.',
  'factoriser-signe-carre': 'Regarde le signe du double produit : positif, c’est le carré d’une somme ; négatif, le carré d’une différence.',
  'factoriser-remarquable-regle': 'Deux carrés séparés par un moins : somme fois différence. Trois termes avec un double produit : le carré d’une somme ou d’une différence.',
  'facteur-commun': 'Factorise en trouvant le facteur commun.',
  'factoriser-moins': 'Le signe moins s’applique à toute la seconde parenthèse : chacun de ses termes change de signe.',
  'facteur-une-fois': 'Le facteur commun s’écrit une seule fois devant : on le met en évidence, on ne le multiplie pas par lui-même.',
  'facteur-commun-regle': 'Repère la parenthèse commune, écris-la une fois devant, puis rassemble dans une seconde parenthèse ce qui reste, sans oublier les signes.',
};
