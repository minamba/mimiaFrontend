/**
 * L'ASCENSEUR — calculer avec les nombres relatifs, en 5e et en 4e.
 * Professeure : Nora (mathématiques).
 *
 * PAR CLASSE (trois sortes de manches, 3 + 3 + 2, mélangées) :
 *   5e — additionner deux relatifs, soustraire deux relatifs (ajouter
 *        l'opposé), et les problèmes : l'ascenseur qui monte ou descend sous
 *        le rez-de-chaussée, l'écart entre deux températures ;
 *   4e — multiplier deux relatifs, un produit de plusieurs facteurs ou une
 *        expression avec priorités, diviser deux relatifs.
 *
 * Les nombres s'écrivent comme au tableau de 5e : (−7) + (+3). Les résultats
 * s'écrivent sans « + » (7, −4). Tout est calculé ici.
 *
 * LES PIÈGES : ajouter les distances quand les signes sont contraires, le
 * signe du résultat pris au hasard, (+4) − (−6) = −2 (l'opposé oublié),
 * l'écart de −4 à 3 compté 1, la règle des signes, les signes moins comptés de
 * travers dans un long produit, l'addition faite avant la multiplication.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'ascenseur-des-relatifs', titre: 'L’ascenseur', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'L’ascenseur',
    accroche: 'Monter, descendre : les relatifs.',
    competences: ['MATH_5E_REL_ADD'],
  },
  QUATRIEME: {
    titre: 'L’ascenseur des signes',
    accroche: 'Moins par moins, ça fait plus.',
    competences: ['MATH_4E_REL_MULT'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −7 », « 3 » */
const rel = (n) => (n < 0 ? `−${-n}` : `${n}`);
/** « (−7) », « (+3) » */
const par = (n) => (n < 0 ? `(−${-n})` : `(+${n})`);

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

/** Le piège d'une somme a + b : selon les signes, on ajoute ou on retranche les distances de travers. */
function piegesSomme(a, b) {
  const s = a + b;
  if (Math.sign(a) !== Math.sign(b)) {
    const plusLoin = Math.abs(a) > Math.abs(b) ? Math.sign(a) : Math.sign(b);
    return [
      [rel(plusLoin * (Math.abs(a) + Math.abs(b))), 'relatifs-signes-contraires'],
      [rel(-s), 'relatifs-signe'],
    ];
  }
  return [
    [rel(-s), 'relatifs-meme-signe'],
    [rel(Math.sign(a) * Math.abs(Math.abs(a) - Math.abs(b))), 'relatifs-soustraire-distances'],
  ];
}

/* ------------------------------------------------------------------ 5e */

function addition(o) {
  const { entre, melanger } = o;
  const a = nonNul(entre, -12, 12);
  const b = nonNul(entre, -12, 12);
  return faire(melanger, 'addition-relatifs', `${par(a)} + ${par(b)} = ?`, rel(a + b), piegesSomme(a, b), (i) => rel(a + b + i));
}

function soustraction(o) {
  const { entre, melanger } = o;
  const a = nonNul(entre, -12, 12);
  const b = nonNul(entre, -12, 12);
  return faire(melanger, 'soustraction-relatifs', `${par(a)} − ${par(b)} = ?`, rel(a - b), [
    [rel(a + b), 'soustraire-oppose'],
    [rel(b - a), 'relatifs-signe'],
  ], (i) => rel(a - b + i));
}

function probleme(o) {
  const { entre, au, melanger } = o;
  if (au([true, true, false])) {
    const depart = nonNul(entre, -5, 5);
    const monte = au([true, false]);
    const pas = entre(2, 8);
    const fin = monte ? depart + pas : depart - pas;
    const question = `L’ascenseur est au niveau ${rel(depart)}.\nIl ${monte ? 'monte' : 'descend'} de ${pas} étages.\nÀ quel niveau arrive-t-il ?`;
    return faire(melanger, 'ascenseur', question, rel(fin), [
      [rel(monte ? depart - pas : depart + pas), 'monter-descendre'],
      [rel(-fin), 'niveau-signe'],
    ], (i) => rel(fin + i));
  }
  const froid = -entre(1, 9);
  const chaud = entre(1, 12);
  const ecart = chaud - froid;
  return faire(melanger, 'ecart-temperature',
    `Le matin, il fait ${rel(froid)} °C.\nL’après-midi, il fait ${chaud} °C.\nDe combien de degrés la température a-t-elle monté ?`, String(ecart), [
      [String(Math.abs(chaud + froid)), 'ecart-relatifs'],
      [rel(-ecart), 'ecart-positif'],
    ], (i) => String(ecart + i));
}

/* ------------------------------------------------------------------ 4e */

function produit(o) {
  const { entre, melanger } = o;
  const a = nonNul(entre, -12, 12);
  const b = nonNul(entre, -12, 12);
  const x = Math.abs(a) === 1 ? 2 * a : a;
  const y = Math.abs(b) === 1 ? 3 * b : b;
  return faire(melanger, 'produit-relatifs', `${par(x)} × ${par(y)} = ?`, rel(x * y), [
    [rel(-x * y), 'regle-signes'],
    [rel(x + y), 'produit-additionner'],
  ], (i) => rel(x * y + i * Math.sign(x * y)));
}

function quotient(o) {
  const { entre, melanger } = o;
  const b = nonNul(entre, -9, 9);
  const q = nonNul(entre, -9, 9);
  const d = Math.abs(b) === 1 ? 2 * b : b;
  const r = Math.abs(q) === 1 ? 3 * q : q;
  return faire(melanger, 'quotient-relatifs', `${par(d * r)} ÷ ${par(d)} = ?`, rel(r), [
    [rel(-r), 'regle-signes'],
  ], (i) => rel(r + i));
}

function plusieurs(o) {
  const { entre, au, melanger } = o;
  if (au([true, false])) {
    const n = entre(3, 4);
    const facteurs = Array.from({ length: n }, () => nonNul(entre, -6, 6));
    if (facteurs.filter((f) => f < 0).length < 2) facteurs[0] = -Math.abs(facteurs[0]);
    if (facteurs.filter((f) => f < 0).length < 2) facteurs[1] = -Math.abs(facteurs[1]);
    const p = facteurs.reduce((t, f) => t * f, 1);
    return faire(melanger, 'plusieurs-facteurs', `${facteurs.map(par).join(' × ')} = ?`, rel(p), [
      [rel(-p), 'nombre-de-signes-moins'],
    ], (i) => rel(p + i * Math.sign(p)));
  }
  const a = nonNul(entre, -9, 9);
  const b = nonNul(entre, -6, 6);
  const c = -entre(2, 6);
  const v = a + b * c;
  return faire(melanger, 'calcul-priorites', `${rel(a)} + ${rel(b)} × ${par(c)} = ?`.replace('+ −', '− '), rel(v), [
    [rel((a + b) * c), 'priorite-relatifs'],
    [rel(a - b * c), 'regle-signes'],
  ], (i) => rel(v + i));
}

/* ------------------------------------------------------------- la série */

const fois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  CINQUIEME: (o) => [...fois(3, addition, o), ...fois(3, soustraction, o), ...fois(2, probleme, o)],
  QUATRIEME: (o) => [...fois(3, produit, o), ...fois(3, plusieurs, o), ...fois(2, quotient, o)],
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
  'addition-relatifs': 'Calcule cette somme de nombres relatifs.',
  'relatifs-signes-contraires': 'Les deux nombres sont de signes contraires : on soustrait les distances à zéro, et on garde le signe de celui qui est le plus loin de zéro.',
  'relatifs-meme-signe': 'Deux nombres de même signe : on ajoute les distances à zéro, et on garde leur signe commun.',
  'relatifs-soustraire-distances': 'Deux nombres de même signe s’ajoutent vraiment : leurs distances à zéro s’additionnent.',
  'relatifs-signe': 'Vérifie le signe : dans une somme, le résultat prend le signe du nombre le plus éloigné de zéro.',
  'addition-relatifs-regle': 'Même signe : ajoute les distances à zéro. Signes contraires : soustrais-les, et garde le signe du plus éloigné de zéro.',
  'soustraction-relatifs': 'Calcule cette différence de nombres relatifs.',
  'soustraire-oppose': 'Soustraire un nombre, c’est ajouter son opposé : retrancher un nombre négatif revient à ajouter un nombre positif.',
  'soustraction-relatifs-regle': 'Transforme la soustraction en addition de l’opposé, puis calcule la somme.',
  ascenseur: 'À quel niveau arrive l’ascenseur ?',
  'monter-descendre': 'Monter, c’est ajouter ; descendre, c’est retrancher. Pars bien du niveau de départ.',
  'niveau-signe': 'Sous le rez-de-chaussée, les niveaux sont négatifs ; au-dessus, ils sont positifs : regarde de quel côté de zéro tu arrives.',
  'ascenseur-regle': 'Pars du niveau de départ, et compte les étages un par un, en passant par zéro si besoin.',
  'ecart-temperature': 'De combien la température a-t-elle monté ?',
  'ecart-relatifs': 'Pour aller d’une température négative à une température positive, on passe par zéro : on ajoute les deux distances à zéro.',
  'ecart-positif': 'La température a monté : l’écart se compte de la plus basse à la plus haute, et c’est un nombre positif.',
  'ecart-temperature-regle': 'L’écart, c’est la plus haute température moins la plus basse.',
  // 4e
  'produit-relatifs': 'Calcule ce produit de nombres relatifs.',
  'regle-signes': 'Règle des signes : deux nombres de même signe donnent un résultat positif ; deux nombres de signes contraires, un résultat négatif.',
  'produit-additionner': 'C’est une multiplication : on multiplie les distances à zéro, on ne les ajoute pas.',
  'produit-relatifs-regle': 'Multiplie les distances à zéro, puis applique la règle des signes.',
  'quotient-relatifs': 'Calcule ce quotient de nombres relatifs.',
  'quotient-relatifs-regle': 'Divise les distances à zéro, puis applique la même règle des signes que pour le produit.',
  'plusieurs-facteurs': 'Calcule ce produit de plusieurs facteurs.',
  'nombre-de-signes-moins': 'Compte les facteurs négatifs : un nombre pair de signes moins donne un résultat positif ; un nombre impair, un résultat négatif.',
  'plusieurs-facteurs-regle': 'Compte les facteurs négatifs pour trouver le signe, puis multiplie les distances à zéro.',
  'calcul-priorites': 'Calcule en respectant les priorités.',
  'priorite-relatifs': 'La multiplication passe avant l’addition, même avec des nombres négatifs.',
  'calcul-priorites-regle': 'Fais d’abord la multiplication, avec la règle des signes, puis l’addition.',
};
