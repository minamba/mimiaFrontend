/**
 * LA DROITE DES FRACTIONS — 6e, Nora. Nouveau jeu.
 *
 * COMPÉTENCES : MATH_6E_FRAC_REPERER, MATH_6E_FRAC_QUOTIENT, MATH_6E_FRAC_ADD.
 *
 * QUATRE SORTES DE MANCHES (la graduation est décrite en texte) :
 *   - PLACER UNE FRACTION (3) : trois traits partagent l'unité, le point est
 *     sur le septième trait : 7/4. Pièges : prendre le nombre de TRAITS pour
 *     dénominateur (7/3), renverser la fraction (4/7) ;
 *   - LA FRACTION EST UN QUOTIENT (2) : 7/4 = 1,75. Pièges : 7,4 (la barre
 *     prise pour une virgule), 1,3 (le reste écrit après la virgule) ;
 *   - LE NOMBRE QUI MANQUE (1) : 3 × ? = 7, c'est 7/3. Pièges : 3/7, et 4
 *     (une soustraction au lieu d'une division) ;
 *   - ADDITIONNER (2) : 3/7 + 2/7 = 5/7. LE PIÈGE : additionner aussi les
 *     dénominateurs (5/14).
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'droite-des-fractions', titre: 'La droite des fractions', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La droite des fractions',
    accroche: 'Placer, diviser, additionner.',
    competences: ['MATH_6E_FRAC_REPERER', 'MATH_6E_FRAC_QUOTIENT', 'MATH_6E_FRAC_ADD'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const ESP = ' ';

/** m × 10^e, écrit à la française : « 3 450,25 ». */
function ecrire(m, e = 0) {
  const a = Math.abs(m);
  let entier;
  let decimales = '';
  if (e >= 0) {
    entier = String(a * 10 ** e);
  } else {
    const p = 10 ** -e;
    entier = String(Math.floor(a / p));
    decimales = String(a % p).padStart(-e, '0').replace(/0+$/, '');
  }
  entier = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ESP);
  return `${m < 0 ? '−' : ''}${entier}${decimales ? `,${decimales}` : ''}`;
}

function construire(melanger, consigne, question, bonne, pieges, voisin) {
  const vus = [bonne];
  const gardes = [];
  pieges.forEach(([c, phrase]) => {
    if (!vus.includes(c)) { vus.push(c); gardes.push([c, phrase]); }
  });
  const choix = troisChoix(bonne, gardes.map(([c]) => c), voisin);
  return {
    consigne,
    question,
    bonne,
    choix: melanger(choix).map((c) => ({ cle: c, libelle: c })),
    pieges: Object.fromEntries(gardes.filter(([c]) => choix.includes(c))),
  };
}

const ordinal = (n) => (n === 1 ? '1er' : `${n}e`);

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // Placer une fraction : d − 1 traits entre 0 et 1, le point sur le n-ième trait.
  for (let i = 0; i < 3; i += 1) {
    const d = entre(3, 8);
    let n;
    do { n = entre(1, 3 * d - 1); } while (n % d === 0);
    liste.push(construire(melanger, 'placer-fraction',
      `Entre 0 et 1, ${d - 1} traits partagent l’unité. M est sur le ${ordinal(n)} trait après 0. M = ?`,
      `${n}/${d}`,
      [[`${n}/${d - 1}`, 'traits-ou-parts'], [`${d}/${n}`, 'fraction-inversee']],
      (k) => `${n + k}/${d}`));
  }

  // La fraction est un quotient : d divise 1 000, l'écriture décimale s'arrête.
  for (let i = 0; i < 2; i += 1) {
    const d = au([2, 4, 5, 8]);
    let n;
    do { n = entre(d + 1, 5 * d); } while (n % d === 0);
    const q = Math.floor(n / d);
    const r = n % d;
    const bonne = ecrire((n * 1000) / d, -3);
    liste.push(construire(melanger, 'fraction-quotient', `${n}/${d} = ?`, bonne,
      [[`${n},${d}`, 'fraction-virgule'], [`${q},${r}`, 'reste-virgule']],
      (k) => ecrire((n * 1000) / d + k * 100, -3)));
  }

  // Le nombre qui manque : b × ? = a.
  {
    const b = entre(2, 9);
    let a;
    do { a = entre(b + 1, 4 * b); } while (a % b === 0);
    liste.push(construire(melanger, 'quotient-ecrit', `${b} × ? = ${a}`, `${a}/${b}`,
      [[`${b}/${a}`, 'fraction-inversee-produit'], [String(a - b), 'soustraire-ou-diviser']],
      (k) => `${a + k}/${b}`));
  }

  // Additionner deux fractions de même dénominateur.
  for (let i = 0; i < 2; i += 1) {
    const d = entre(3, 12);
    let n1;
    let n2;
    do {
      n1 = entre(1, d - 1);
      n2 = entre(1, d - 1);
    } while (n1 + n2 === d);
    liste.push(construire(melanger, 'addition-fractions', `${n1}/${d} + ${n2}/${d} = ?`, `${n1 + n2}/${d}`,
      [[`${n1 + n2}/${2 * d}`, 'additionner-denominateurs']],
      (k) => `${n1 + n2 + k}/${d}`));
  }

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'placer-fraction': 'Quelle fraction repère le point M sur la demi-droite graduée ?',
  'fraction-quotient': 'Écris cette fraction comme un nombre décimal : la barre est une division.',
  'quotient-ecrit': 'Quel nombre, multiplié par le premier, donne le résultat ?',
  'addition-fractions': 'Additionne ces deux fractions de même dénominateur.',

  'traits-ou-parts': 'Le dénominateur, c’est le nombre de parts égales dans une unité, pas le nombre de traits : il y a toujours une part de plus que de traits.',
  'fraction-inversee': 'En bas, le nombre de parts dans une unité ; en haut, le nombre de parts que l’on compte depuis zéro.',
  'fraction-virgule': 'La barre de fraction n’est pas une virgule : c’est une division du numérateur par le dénominateur.',
  'reste-virgule': 'Le reste n’est pas la partie décimale : continue la division après la virgule, en abaissant des zéros.',
  'fraction-inversee-produit': 'Le résultat va en haut, le nombre par lequel on multiplie va en bas.',
  'soustraire-ou-diviser': 'On cherche un facteur, pas un écart : c’est une division, et elle s’écrit avec une fraction.',
  'additionner-denominateurs': 'Les parts gardent la même taille : on additionne les numérateurs, et le dénominateur ne change pas.',

  'placer-fraction-regle': 'Compte les parts dans une unité pour le dénominateur, puis les parts depuis zéro pour le numérateur.',
  'fraction-quotient-regle': 'Divise le numérateur par le dénominateur, et pousse la division après la virgule.',
  'quotient-ecrit-regle': 'Le nombre qui, multiplié par un nombre, donne un résultat, c’est le résultat divisé par ce nombre : une fraction.',
  'addition-fractions-regle': 'Compte les parts : ajoute les numérateurs, garde le dénominateur.',
};
