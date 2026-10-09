/**
 * LES GRANDS NOMBRES — 6e, Nora. Suite du coffre des centaines du CM2.
 *
 * COMPÉTENCES : MATH_6E_NUM_ENTIERS, MATH_6E_NUM_DECIMAUX.
 *
 * QUATRE SORTES DE MANCHES :
 *   - LE PLUS GRAND DÉCIMAL (3) : 3,7 ou 3,654 ? LE PIÈGE : croire que le
 *     nombre qui a le plus de chiffres après la virgule est le plus grand ;
 *   - LE PLUS GRAND ENTIER (2) : LE PIÈGE : le nombre qui commence par 9 mais
 *     a un chiffre de moins ;
 *   - CHIFFRE OU NOMBRE (2) : le chiffre des milliers de 4 507 382 est 7, le
 *     nombre de milliers est 4 507. Pièges : confondre les deux, glisser d'un rang ;
 *   - DE PART ET D'AUTRE DE LA VIRGULE (1) : centièmes contre centaines,
 *     dixièmes contre dizaines.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'grands-nombres-college', titre: 'Les grands nombres', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Les grands nombres',
    accroche: 'Lire, comparer et ranger les nombres.',
    competences: ['MATH_6E_NUM_ENTIERS', 'MATH_6E_NUM_DECIMAUX'],
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

/** Une manche : la bonne réponse, des pièges sans doublon, complétés par des voisins. */
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

const RANGS = [
  { p: 2, nom: 'centaines' },
  { p: 3, nom: 'milliers' },
  { p: 4, nom: 'dizaines de mille' },
  { p: 5, nom: 'centaines de mille' },
];

/** Un nombre aux chiffres tous différents, sans zéro en tête. */
function chiffresDifferents(melanger, longueur) {
  const c = melanger([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, longueur);
  if (c[0] === 0) [c[0], c[1]] = [c[1], c[0]];
  return c;
}

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // Le plus grand décimal : e,a contre e,(a-1)xy et e,(a-2)z — en millièmes.
  for (let i = 0; i < 3; i += 1) {
    const e = entre(1, 30);
    const a = entre(3, 8);
    const bonne = ecrire(e * 1000 + a * 100, -3);
    const long = ecrire(e * 1000 + (a - 1) * 100 + entre(1, 9) * 10 + entre(1, 9), -3);
    const moyen = ecrire(e * 1000 + (a - 2) * 100 + entre(1, 9) * 10, -3);
    liste.push(construire(melanger, 'plus-grand-decimal', 'Le plus grand nombre ?', bonne,
      [[long, 'plus-de-chiffres'], [moyen, 'plus-de-chiffres']],
      (k) => ecrire(e * 1000 + (a - 1) * 100 + k, -3)));
  }

  // Le plus grand entier : sept chiffres contre six chiffres qui commencent par 9.
  for (let i = 0; i < 2; i += 1) {
    const f = entre(1, 4);
    const s = entre(1, 9);
    const bonne = f * 1e6 + s * 1e5 + entre(0, 99999);
    const neuf = 9 * 1e5 + entre(0, 99999);
    const voisin = f * 1e6 + (s - 1) * 1e5 + entre(0, 99999);
    liste.push(construire(melanger, 'plus-grand-entier', 'Le plus grand nombre ?', ecrire(bonne),
      [[ecrire(neuf), 'premier-chiffre'], [ecrire(voisin), 'rang-par-rang']],
      (k) => ecrire(bonne - k * 1e5)));
  }

  // Chiffre ou nombre : une fois chacun.
  ['chiffre', 'nombre'].forEach((mode) => {
    const n = Number(chiffresDifferents(melanger, 7).join(''));
    const { p, nom } = au(RANGS);
    const chiffre = Math.floor(n / 10 ** p) % 10;
    const nombre = Math.floor(n / 10 ** p);
    if (mode === 'chiffre') {
      const dessous = Math.floor(n / 10 ** (p - 1)) % 10;
      liste.push(construire(melanger, 'chiffre-des', `Le chiffre des ${nom} dans ${ecrire(n)} ?`, String(chiffre),
        [[ecrire(nombre), 'chiffre-ou-nombre'], [String(dessous), 'rang-voisin']],
        (k) => String((chiffre + k) % 10)));
    } else {
      const deTrop = Math.floor(n / 10 ** (p - 1));
      liste.push(construire(melanger, 'nombre-de', `Le nombre de ${nom} dans ${ecrire(n)} ?`, ecrire(nombre),
        [[String(chiffre), 'nombre-ou-chiffre'], [ecrire(deTrop), 'rang-voisin']],
        (k) => ecrire(nombre + k)));
    }
  });

  // De part et d'autre de la virgule : d1 d2 d3 d4 , d5 d6.
  {
    const c = chiffresDifferents(melanger, 6);
    // Un zéro final ne s'écrirait pas : on le remonte dans la partie entière.
    if (c[5] === 0) [c[5], c[3]] = [c[3], c[5]];
    const x = Number(c.join(''));
    if (au([true, false])) {
      liste.push(construire(melanger, 'chiffre-decimal', `Le chiffre des centièmes dans ${ecrire(x, -2)} ?`, String(c[5]),
        [[String(c[1]), 'centaines-centiemes'], [String(c[4]), 'rang-voisin']],
        (k) => String((c[5] + k) % 10)));
    } else {
      liste.push(construire(melanger, 'chiffre-decimal', `Le chiffre des dixièmes dans ${ecrire(x, -2)} ?`, String(c[4]),
        [[String(c[2]), 'dizaines-dixiemes'], [String(c[5]), 'rang-voisin']],
        (k) => String((c[4] + k) % 10)));
    }
  }

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'plus-grand-decimal': 'Lequel de ces nombres décimaux est le plus grand ?',
  'plus-grand-entier': 'Lequel de ces grands nombres est le plus grand ?',
  'chiffre-des': 'Quel chiffre occupe ce rang ?',
  'nombre-de': 'Combien ce nombre contient-il de paquets de ce rang, en tout ?',
  'chiffre-decimal': 'Repère la virgule, puis trouve le chiffre de ce rang.',

  'plus-de-chiffres': 'Le nombre le plus long n’est pas forcément le plus grand : compare la partie entière, puis les dixièmes, puis les centièmes, rang par rang.',
  'premier-chiffre': 'Compte d’abord les chiffres : le nombre qui en a le plus est le plus grand, même s’il commence par un petit chiffre.',
  'rang-par-rang': 'Même nombre de chiffres : compare rang par rang, en partant de la gauche.',
  'chiffre-ou-nombre': 'On demande le chiffre : un seul chiffre, celui qui occupe ce rang. Le nombre de, c’est ce chiffre avec tous ceux de sa gauche.',
  'nombre-ou-chiffre': 'On demande le nombre, pas le chiffre : prends le chiffre de ce rang avec tous ceux qui sont à sa gauche.',
  'rang-voisin': 'Compte les rangs depuis les unités, par classes de trois : unités, mille, millions. Après la virgule : dixièmes, puis centièmes.',
  'centaines-centiemes': 'Les centaines sont à gauche de la virgule ; les centièmes sont à droite, au deuxième rang après elle.',
  'dizaines-dixiemes': 'Les dizaines sont à gauche de la virgule ; les dixièmes sont juste à droite d’elle.',

  'plus-grand-decimal-regle': 'Compare d’abord les parties entières, puis les dixièmes, puis les centièmes.',
  'plus-grand-entier-regle': 'Le nombre qui a le plus de chiffres est le plus grand ; à égalité, compare rang par rang depuis la gauche.',
  'chiffre-des-regle': 'Repère le rang demandé en comptant depuis les unités, et lis le seul chiffre qui s’y trouve.',
  'nombre-de-regle': 'Le nombre de centaines ou de milliers, c’est tout ce qui s’écrit à gauche de ce rang, ce rang compris.',
  'chiffre-decimal-regle': 'Après la virgule viennent les dixièmes, puis les centièmes ; avant elle, les unités, les dizaines, les centaines.',
};
