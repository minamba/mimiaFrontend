/**
 * LA BONNE PARENTHÈSE — les priorités opératoires, en 6e et en 5e.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL :
 *   6e : MATH_6E_CALC_PRIORITES — « Appliquer les priorités opératoires »
 *   5e : MATH_5E_PRIORITES      — « Calculer avec les priorités et les parenthèses »
 *
 * EN 6e (3 + 3 + 2) :
 *   - LES PRIORITÉS (3) : 7 + 4 × 3. LE PIÈGE : calculer de gauche à droite
 *     (33 au lieu de 19). Et 20 − 5 + 3 : addition et soustraction se font
 *     dans l'ordre, le piège est de faire l'addition d'abord ;
 *   - LES PARENTHÈSES (3) : (7 + 4) × 3. LE PIÈGE : les oublier ;
 *   - LE PREMIER CALCUL (2) : dans 8 + 6 × 4 − 3, lequel fait-on d'abord ?
 *
 * EN 5e (3 + 3 + 2) :
 *   - LES PARENTHÈSES IMBRIQUÉES (3) : 3 × (5 + 2 × 4). LES PIÈGES : oublier la
 *     priorité À L'INTÉRIEUR de la parenthèse, ou ignorer la parenthèse
 *     intérieure ;
 *   - LE MOINS DEVANT UNE PARENTHÈSE (3) : 20 − (8 − 3) = 15, pas 9 ;
 *   - LE PREMIER CALCUL (2), avec une parenthèse dans une parenthèse.
 *
 * Toutes les réponses sont des entiers positifs, calculés ici.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'bonne-parenthese', titre: 'La bonne parenthèse', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La bonne parenthèse',
    accroche: 'Qui passe en premier : × ou + ?',
    competences: ['MATH_6E_CALC_PRIORITES'],
  },
  CINQUIEME: {
    titre: 'La bonne parenthèse',
    accroche: 'Des parenthèses dans les parenthèses.',
    competences: ['MATH_5E_PRIORITES'],
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

const positif = (x) => (Number.isInteger(x) && x > 0 ? x : null);

/* ---------------------------------------------------------------- 6e */

function priorite6(sorte, { entre }) {
  if (sorte === 'plus-fois') {
    const [a, b, c] = [entre(2, 20), entre(2, 9), entre(2, 9)];
    return { question: `${a} + ${b} × ${c} = ?`, bonne: a + b * c, pieges: [[(a + b) * c, 'gauche-a-droite']] };
  }
  if (sorte === 'moins-fois') {
    const [b, c] = [entre(2, 9), entre(2, 9)];
    const a = b * c + entre(1, 30);
    return { question: `${a} − ${b} × ${c} = ?`, bonne: a - b * c, pieges: [[(a - b) * c, 'gauche-a-droite']] };
  }
  if (sorte === 'plus-divise') {
    const c = entre(2, 9);
    const b = c * entre(2, 9);
    const a = c * entre(1, 9);
    return { question: `${a} + ${b} ÷ ${c} = ?`, bonne: a + b / c, pieges: [[positif((a + b) / c), 'gauche-a-droite']] };
  }
  // 'meme-niveau' : a − b + c, dans l'ordre.
  const [b, c] = [entre(2, 15), entre(2, 15)];
  const a = b + c + entre(1, 20);
  return { question: `${a} − ${b} + ${c} = ?`, bonne: a - b + c, pieges: [[a - (b + c), 'meme-niveau']] };
}

function parentheses6(sorte, { entre }) {
  if (sorte === 'somme-fois') {
    const [a, b, c] = [entre(2, 12), entre(2, 12), entre(2, 9)];
    return { question: `(${a} + ${b}) × ${c} = ?`, bonne: (a + b) * c, pieges: [[a + b * c, 'oublier-parentheses']] };
  }
  if (sorte === 'fois-somme') {
    const [a, b, c] = [entre(2, 9), entre(2, 12), entre(2, 12)];
    return { question: `${a} × (${b} + ${c}) = ?`, bonne: a * (b + c), pieges: [[a * b + c, 'oublier-parentheses']] };
  }
  if (sorte === 'fois-difference') {
    const c = entre(1, 8);
    const b = c + entre(2, 9);
    const a = entre(2, 9);
    return { question: `${a} × (${b} − ${c}) = ?`, bonne: a * (b - c), pieges: [[positif(a * b - c), 'oublier-parentheses']] };
  }
  // 'difference-divise' : (a − b) ÷ c, avec b et a − b multiples de c.
  const c = entre(2, 6);
  const m = entre(2, 6);
  const q = entre(2, 9);
  const a = c * (q + m);
  const b = c * m;
  return { question: `(${a} − ${b}) ÷ ${c} = ?`, bonne: q, pieges: [[positif(a - m), 'oublier-parentheses']] };
}

function premier6(sorte, { entre }) {
  if (sorte === 'sans-parenthese') {
    const [a, b, c, d] = [entre(2, 20), entre(2, 9), entre(2, 9), entre(1, 9)];
    return {
      question: `${a} + ${b} × ${c} − ${d}`,
      bonne: `${b} × ${c}`,
      pieges: [[`${a} + ${b}`, 'gauche-a-droite'], [`${c} − ${d}`, 'premier-multiplication']],
    };
  }
  if (sorte === 'division') {
    const c = entre(2, 9);
    const b = c * entre(2, 9);
    const a = b + entre(2, 20);
    const d = entre(2, 9);
    return {
      question: `${a} − ${b} ÷ ${c} + ${d}`,
      bonne: `${b} ÷ ${c}`,
      pieges: [[`${a} − ${b}`, 'gauche-a-droite'], [`${c} + ${d}`, 'premier-multiplication']],
    };
  }
  // 'avec-parenthese'
  const [a, b, c, d] = [entre(2, 9), entre(2, 9), entre(2, 9), entre(1, 9)];
  return {
    question: `${a} × (${b} + ${c}) − ${d}`,
    bonne: `${b} + ${c}`,
    pieges: [[`${a} × ${b}`, 'oublier-parentheses'], [`${c} − ${d}`, 'premier-regle']],
  };
}

/* ---------------------------------------------------------------- 5e */

function imbriquees5(sorte, { entre }) {
  if (sorte === 'fois-somme-produit') {
    const [a, b, c, d] = [entre(2, 6), entre(2, 9), entre(2, 5), entre(2, 5)];
    return {
      question: `${a} × (${b} + ${c} × ${d}) = ?`,
      bonne: a * (b + c * d),
      pieges: [[a * (b + c) * d, 'priorite-dans-parentheses'], [a * b + c * d, 'oublier-parentheses']],
    };
  }
  if (sorte === 'plus-fois-somme') {
    const [a, b, c, d, e] = [entre(2, 12), entre(2, 5), entre(1, 6), entre(2, 4), entre(2, 4)];
    return {
      question: `${a} + ${b} × (${c} + ${d} × ${e}) = ?`,
      bonne: a + b * (c + d * e),
      pieges: [[(a + b) * (c + d * e), 'gauche-a-droite'], [a + b * (c + d) * e, 'priorite-dans-parentheses']],
    };
  }
  if (sorte === 'fois-moins-moins') {
    const d = entre(1, 5);
    const c = d + entre(2, 6);
    const b = c + entre(1, 8);
    const a = entre(2, 6);
    return {
      question: `${a} × (${b} − (${c} − ${d})) = ?`,
      bonne: a * (b - (c - d)),
      pieges: [[positif(a * (b - c - d)), 'parenthese-interieure']],
    };
  }
  // 'moins-moins-fois'
  const [b, c] = [entre(2, 9), entre(1, 9)];
  const a = b + c + entre(1, 9);
  const d = entre(2, 6);
  return {
    question: `(${a} − (${b} − ${c})) × ${d} = ?`,
    bonne: (a - (b - c)) * d,
    pieges: [[positif((a - b - c) * d), 'parenthese-interieure']],
  };
}

function moins5(sorte, { entre }) {
  const [b, c] = [entre(2, 20), entre(2, 15)];
  const a = b + c + entre(1, 30);
  if (sorte === 'moins-difference') {
    const [g, p] = [Math.max(b, c), Math.min(b, c)];
    if (g === p) return moins5('moins-somme', { entre });
    return { question: `${a} − (${g} − ${p}) = ?`, bonne: a - (g - p), pieges: [[a - g - p, 'moins-devant-parenthese']] };
  }
  if (sorte === 'moins-somme') {
    return { question: `${a} − (${b} + ${c}) = ?`, bonne: a - (b + c), pieges: [[a - b + c, 'moins-devant-parenthese']] };
  }
  if (sorte === 'moins-plus') {
    return { question: `${a} − ${b} + ${c} = ?`, bonne: a - b + c, pieges: [[a - (b + c), 'meme-niveau']] };
  }
  // 'moins-moins' : a − b − c, dans l'ordre.
  const [g, p] = [Math.max(b, c), Math.min(b, c)];
  if (g === p) return moins5('moins-plus', { entre });
  return { question: `${a} − ${g} − ${p} = ?`, bonne: a - g - p, pieges: [[a - (g - p), 'meme-niveau']] };
}

function premier5(sorte, { entre }) {
  if (sorte === 'fois-plus-fois') {
    // a × (b + c × (d − e)) : on commence par d − e.
    let [a, b, c, d] = [entre(2, 9), entre(2, 9), entre(2, 9), entre(4, 12)];
    const e = entre(1, d - 2);
    if (a === c && b === d) a += 1;
    return {
      question: `${a} × (${b} + ${c} × (${d} − ${e}))`,
      bonne: `${d} − ${e}`,
      pieges: [[`${a} × ${b}`, 'oublier-parentheses'], [`${c} × ${d}`, 'parenthese-interieure']],
    };
  }
  // a − (b × (c + d) − e) : on commence par c + d.
  const [b, c, d] = [entre(2, 6), entre(1, 9), entre(1, 9)];
  const e = entre(1, b * (c + d) - 1);
  const a = b * (c + d) - e + entre(1, 20);
  return {
    question: `${a} − (${b} × (${c} + ${d}) − ${e})`,
    bonne: `${c} + ${d}`,
    pieges: [[`${a} − ${b}`, 'gauche-a-droite'], [`${b} × ${c}`, 'parenthese-interieure']],
  };
}

/* ------------------------------------------------------------ la partie */

function lot(t, consigne, nombre, sortes, fabrique) {
  const { melanger } = t;
  const choisies = melanger(sortes).slice(0, nombre);
  return choisies.map((sorte) => {
    const { question, bonne, pieges } = fabrique(sorte, t);
    const voisin = typeof bonne === 'number' ? (k) => bonne + k : (k) => `${k}`;
    return manche(melanger, {
      consigne, question, bonne, pieges, voisin,
    });
  });
}

export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const t = outils(graine);
  if (niveau === 'CINQUIEME') {
    return t.melanger([
      ...lot(t, 'imbriquees', 3, ['fois-somme-produit', 'plus-fois-somme', 'fois-moins-moins', 'moins-moins-fois'], imbriquees5),
      ...lot(t, 'moins-devant', 3, ['moins-difference', 'moins-somme', 'moins-plus', 'moins-moins'], moins5),
      ...lot(t, 'premier', 2, ['fois-plus-fois', 'moins-fois-plus'], premier5),
    ]);
  }
  return t.melanger([
    ...lot(t, 'priorites', 3, ['plus-fois', 'moins-fois', 'plus-divise', 'meme-niveau'], priorite6),
    ...lot(t, 'parentheses', 3, ['somme-fois', 'fois-somme', 'fois-difference', 'difference-divise'], parentheses6),
    ...lot(t, 'premier', 2, ['sans-parenthese', 'division', 'avec-parenthese'], premier6),
  ]);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  priorites: 'Calcule cette expression, dans le bon ordre.',
  parentheses: 'Calcule cette expression : attention aux parenthèses.',
  premier: 'Quel calcul fais-tu en premier ?',
  imbriquees: 'Calcule : une parenthèse peut en cacher une autre.',
  'moins-devant': 'Calcule cette expression, sans te laisser piéger par le signe moins.',

  'gauche-a-droite': 'La multiplication et la division passent avant l’addition et la soustraction, même si elles sont plus loin dans la ligne.',
  'meme-niveau': 'Entre additions et soustractions, sans parenthèses, on calcule de gauche à droite, dans l’ordre de lecture.',
  'oublier-parentheses': 'Les parenthèses passent avant tout : calcule d’abord ce qu’elles contiennent.',
  'premier-multiplication': 'Repère d’abord les multiplications et les divisions : ce sont elles qu’on calcule en premier.',
  'priorite-dans-parentheses': 'À l’intérieur des parenthèses aussi, la multiplication passe avant l’addition.',
  'parenthese-interieure': 'Commence par la parenthèse la plus intérieure, puis remonte vers l’extérieur.',
  'moins-devant-parenthese': 'Calcule d’abord la parenthèse, puis enlève son résultat entier : un moins devant une parenthèse retire tout ce qu’elle contient.',

  'priorites-regle': 'D’abord les multiplications et les divisions, ensuite les additions et les soustractions, de gauche à droite.',
  'parentheses-regle': 'D’abord ce qui est entre parenthèses, puis les multiplications, puis les additions.',
  'premier-regle': 'D’abord la parenthèse la plus intérieure ; sans parenthèse, d’abord la multiplication ou la division.',
  'imbriquees-regle': 'Commence par la parenthèse la plus intérieure, et respecte les priorités à chaque étape.',
  'moins-devant-regle': 'Calcule chaque parenthèse d’abord, puis les additions et les soustractions de gauche à droite.',
};
