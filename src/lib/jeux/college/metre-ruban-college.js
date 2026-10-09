/**
 * LE MÈTRE RUBAN — 6e, Nora. Suite du mètre ruban du primaire.
 *
 * COMPÉTENCES : MATH_6E_MES_LONGUEUR, MATH_6E_MES_MASSE.
 *
 * TROIS SORTES DE MANCHES, une par tableau de conversion :
 *   - LES LONGUEURS (3) : km, hm, dam, m, dm, cm, mm ;
 *   - LES MASSES (3) : kg, hg, dag, g, dg, cg, mg ;
 *   - LES CONTENANCES (2) : hL, daL, L, dL, cL, mL.
 * Les pièges sont les mêmes partout : se tromper d'un rang dans le tableau,
 * et convertir dans le mauvais sens (le nombre rapetisse alors qu'il devait
 * grandir). Tout se calcule en entiers : une mantisse et une puissance de dix.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'metre-ruban-college', titre: 'Le mètre ruban', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Le mètre ruban',
    accroche: 'Longueurs, masses, contenances.',
    competences: ['MATH_6E_MES_LONGUEUR', 'MATH_6E_MES_MASSE'],
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

/** Chaque unité et sa puissance de dix par rapport à l'unité de base. */
export const TABLEAUX = {
  longueur: [['km', 3], ['hm', 2], ['dam', 1], ['m', 0], ['dm', -1], ['cm', -2], ['mm', -3]],
  masse: [['kg', 3], ['hg', 2], ['dag', 1], ['g', 0], ['dg', -1], ['cg', -2], ['mg', -3]],
  contenance: [['hL', 2], ['daL', 1], ['L', 0], ['dL', -1], ['cL', -2], ['mL', -3]],
};

const SORTES = [['longueur', 'convertir-longueur', 3], ['masse', 'convertir-masse', 3], ['contenance', 'convertir-contenance', 2]];

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, melanger } = outils(graine);
  const liste = [];

  SORTES.forEach(([tableau, consigne, combien]) => {
    const unites = TABLEAUX[tableau];
    for (let i = 0; i < combien; i += 1) {
      let a;
      let b;
      do {
        a = entre(0, unites.length - 1);
        b = entre(0, unites.length - 1);
      } while (a === b || Math.abs(a - b) > 3);
      const [de, pDe] = unites[a];
      const [vers, pVers] = unites[b];
      let m;
      do { m = entre(12, 999); } while (m % 10 === 0);
      const k = entre(0, 2);
      const saut = pDe - pVers;
      const e = -k + saut;
      const plusOuMoins = entre(0, 1) ? 1 : -1;
      liste.push(construire(melanger, consigne, `${ecrire(m, -k)} ${de} = ? ${vers}`, ecrire(m, e),
        [[ecrire(m, e + plusOuMoins), 'compter-rangs'], [ecrire(m, -k - saut), 'sens-conversion']],
        (j) => ecrire(m, e - plusOuMoins * j)));
    }
  });

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'convertir-longueur': 'Convertis cette longueur dans l’unité demandée.',
  'convertir-masse': 'Convertis cette masse dans l’unité demandée.',
  'convertir-contenance': 'Convertis cette contenance dans l’unité demandée.',

  'compter-rangs': 'Place le chiffre des unités dans la colonne de l’unité de départ, puis compte les colonnes jusqu’à l’unité d’arrivée : un rang par colonne.',
  'sens-conversion': 'Vers une unité plus petite, le nombre devient plus grand ; vers une unité plus grande, il devient plus petit.',

  'convertir-longueur-regle': 'Écris le nombre dans le tableau des longueurs, puis déplace la virgule jusqu’à la colonne de l’unité demandée.',
  'convertir-masse-regle': 'Écris le nombre dans le tableau des masses, puis déplace la virgule jusqu’à la colonne de l’unité demandée.',
  'convertir-contenance-regle': 'Écris le nombre dans le tableau des contenances, puis déplace la virgule jusqu’à la colonne de l’unité demandée.',
};
