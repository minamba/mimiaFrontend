/**
 * LE PARTAGE — 6e, Nora. La division, euclidienne puis décimale.
 *
 * COMPÉTENCES : MATH_6E_CALC_DIV_EUCL, MATH_6E_CALC_DIV_DEC.
 *
 * QUATRE SORTES DE MANCHES :
 *   - QUOTIENT ET RESTE (2) : 157 ÷ 6. LE PIÈGE : un reste plus grand que le
 *     diviseur ; et un quotient qui ne redonne pas le dividende ;
 *   - LE ZÉRO DU QUOTIENT (1) : 624 ÷ 6 = 104. LE PIÈGE : oublier le zéro (14) ;
 *   - JUSQU'APRÈS LA VIRGULE (3) : 17 ÷ 4 = 4,25. LE PIÈGE : écrire le reste
 *     après la virgule (4,1), ou s'arrêter au quotient entier ;
 *   - UN DÉCIMAL PAR UN ENTIER (2) : 9,6 ÷ 4 = 2,4. LE PIÈGE : la virgule
 *     oubliée ou mal placée au quotient.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'partage-college', titre: 'Le partage', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le partage',
    accroche: 'Quotient, reste, et après la virgule.',
    competences: ['MATH_6E_CALC_DIV_EUCL', 'MATH_6E_CALC_DIV_DEC'],
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

/** « q = 26, r = 1 ». */
const qr = (q, r) => `q = ${q}, r = ${r}`;

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // Quotient et reste.
  for (let i = 0; i < 2; i += 1) {
    const d = entre(3, 9);
    const q = entre(12, 99);
    const r = entre(1, d - 1);
    const n = d * q + r;
    liste.push(construire(melanger, 'quotient-reste', `${n} ÷ ${d} : quotient et reste ?`, qr(q, r),
      [[qr(q - 1, r + d), 'reste-trop-grand'], [qr(q + 1, r), 'verifier-division']],
      (k) => qr(q, (r + k) % d === r ? r + d : (r + k) % d)));
  }

  // Le zéro du quotient : q = a0b.
  {
    const d = entre(2, 9);
    const a = entre(1, 9);
    const b = entre(1, 9);
    const q = 100 * a + b;
    const r = entre(0, d - 1);
    const n = d * q + r;
    liste.push(construire(melanger, 'quotient-reste', `${ecrire(n)} ÷ ${d} : quotient et reste ?`, qr(q, r),
      [[qr(10 * a + b, r), 'zero-quotient'], [qr(q - 1, r + d), 'reste-trop-grand']],
      (k) => qr(q + 10 * k, r)));
  }

  // Jusqu'après la virgule : d divise 1 000, la division s'arrête.
  for (let i = 0; i < 3; i += 1) {
    const d = au([2, 4, 5, 8]);
    let n;
    do { n = entre(d + 1, 99); } while (n % d === 0);
    const q = Math.floor(n / d);
    const r = n % d;
    liste.push(construire(melanger, 'division-decimale', `${n} ÷ ${d} = ?`, ecrire((n * 1000) / d, -3),
      [[`${q},${r}`, 'reste-virgule'], [String(q), 'continuer-division']],
      (k) => ecrire((n * 1000) / d + k * 100, -3)));
  }

  // Un décimal par un entier : (d × y) dixièmes ÷ d = y dixièmes.
  for (let i = 0; i < 2; i += 1) {
    let d;
    let y;
    do {
      d = entre(3, 9);
      y = entre(11, 99);
    } while (y % 10 === 0 || (d * y) % 10 === 0);
    liste.push(construire(melanger, 'decimal-par-entier', `${ecrire(d * y, -1)} ÷ ${d} = ?`, ecrire(y, -1),
      [[ecrire(y), 'virgule-quotient'], [ecrire(y, -2), 'virgule-quotient']],
      (k) => ecrire(y + k, -1)));
  }

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'quotient-reste': 'Effectue la division euclidienne : trouve le quotient et le reste.',
  'division-decimale': 'Pousse cette division au-delà de la virgule, jusqu’à un reste nul.',
  'decimal-par-entier': 'Divise ce nombre décimal par ce nombre entier.',

  'reste-trop-grand': 'Le reste doit toujours être plus petit que le diviseur : sinon, le diviseur y tient encore une fois.',
  'verifier-division': 'Vérifie toujours : le diviseur fois le quotient, plus le reste, doit redonner le dividende.',
  'zero-quotient': 'Quand le diviseur ne tient pas dans le nombre abaissé, écris un zéro au quotient avant d’abaisser le chiffre suivant.',
  'reste-virgule': 'Le reste n’est pas la partie après la virgule : place la virgule au quotient, abaisse un zéro et continue la division.',
  'continuer-division': 'Le reste n’est pas nul : la division n’est pas finie. Place la virgule au quotient, abaisse un zéro et continue.',
  'virgule-quotient': 'Quand tu abaisses le chiffre des dixièmes, écris la virgule au quotient : le quotient a des dixièmes, lui aussi.',

  'quotient-reste-regle': 'Le diviseur fois le quotient, plus le reste, redonne le dividende, et le reste est plus petit que le diviseur.',
  'division-decimale-regle': 'Après le quotient entier, place la virgule, abaisse un zéro, et continue jusqu’à un reste nul.',
  'decimal-par-entier-regle': 'Divise comme d’habitude, et place la virgule au quotient au moment d’abaisser les dixièmes.',
};
