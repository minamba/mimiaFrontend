/**
 * LA LOUPE DES CENTIÈMES — 6e, Nora. Suite de la règle des dixièmes du CM2.
 *
 * COMPÉTENCES : MATH_6E_NUM_DEMI_DROITE, MATH_6E_NUM_ARRONDI.
 *
 * TROIS SORTES DE MANCHES (tout se calcule en millièmes, en entiers) :
 *   - LA GRADUATION (3) : de 5,2 à 5,3 partagé en dix, le point est à quatre
 *     graduations : 5,24. LE PIÈGE : se tromper de pas (5,6 ou 5,204) ;
 *   - ENCADRER (2) : à l'unité ou au dixième. Pièges : la mauvaise précision,
 *     un encadrement qui ne contient pas le nombre ;
 *   - ARRONDIR (3) : à l'unité, au dixième, au centième. Pièges : tronquer au
 *     lieu d'arrondir (ou l'inverse), arrondir au mauvais rang.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'loupe-college', titre: 'La loupe des centièmes', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'La loupe des centièmes',
    accroche: 'Graduer, encadrer, arrondir.',
    competences: ['MATH_6E_NUM_DEMI_DROITE', 'MATH_6E_NUM_ARRONDI'],
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

/** Des millièmes, écrits à la française. */
const mil = (v) => ecrire(v, -3);

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

const PRECISIONS = {
  unite: { p: 1000, nom: 'à l’unité' },
  dixieme: { p: 100, nom: 'au dixième' },
  centieme: { p: 10, nom: 'au centième' },
};
/** Le rang où l'on se trompe le plus souvent, pour chaque précision. */
const MAUVAIS_RANG = { unite: 'dixieme', dixieme: 'centieme', centieme: 'dixieme' };

/** Arrondi d'un nombre de millièmes au pas p (le chiffre suivant décide, cinq monte). */
const arrondi = (x, p) => Math.floor((x + p / 2) / p) * p;

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, au, melanger } = outils(graine);
  const liste = [];

  // La graduation : de A à B, dix parts égales ; M est k graduations après A.
  for (let i = 0; i < 3; i += 1) {
    const unite = au([true, false]);
    const a = unite ? entre(0, 20) * 1000 : entre(0, 20) * 1000 + entre(0, 8) * 100;
    const ecart = unite ? 1000 : 100;
    const pas = ecart / 10;
    const k = entre(2, 9);
    const bonne = mil(a + k * pas);
    liste.push(construire(melanger, 'graduation',
      `De ${mil(a)} à ${mil(a + ecart)} : dix parts égales. M est ${k} graduations après ${mil(a)}. Abscisse de M ?`,
      bonne,
      [[mil(a + k * ecart), 'pas-graduation'], [mil(a + (k * pas) / 10), 'pas-graduation']],
      (j) => mil(a + (k + j) * pas)));
  }

  // Encadrer à l'unité ou au dixième : x = e,dc.
  for (let i = 0; i < 2; i += 1) {
    const e = entre(1, 50);
    const d = entre(1, 8);
    const x = e * 1000 + d * 100 + entre(1, 9) * 10;
    const paire = (lo, hi) => `${mil(lo)} et ${mil(hi)}`;
    const lu = e * 1000;
    const ld = e * 1000 + d * 100;
    if (au([true, false])) {
      liste.push(construire(melanger, 'encadrer', `Encadre ${mil(x)} à l’unité.`, paire(lu, lu + 1000),
        [[paire(ld, ld + 100), 'encadrer-precision'], [paire(lu - 1000, lu), 'encadrer-dedans']],
        (k) => paire(lu + k * 1000, lu + (k + 1) * 1000)));
    } else {
      liste.push(construire(melanger, 'encadrer', `Encadre ${mil(x)} au dixième.`, paire(ld, ld + 100),
        [[paire(lu, lu + 1000), 'encadrer-precision'], [paire(ld - 100, ld), 'encadrer-dedans']],
        (k) => paire(ld + k * 100, ld + (k + 1) * 100)));
    }
  }

  // Arrondir : x = e,abc, avec a et b entre 1 et 8 (jamais de retenue qui ferait « 8,0 »).
  melanger(['unite', 'dixieme', 'centieme']).forEach((cle) => {
    const x = entre(1, 99) * 1000 + entre(1, 8) * 100 + entre(1, 8) * 10 + entre(1, 9);
    const { p, nom } = PRECISIONS[cle];
    const juste = arrondi(x, p);
    const bas = Math.floor(x / p) * p;
    const autre = juste === bas ? bas + p : bas;
    const rang = arrondi(x, PRECISIONS[MAUVAIS_RANG[cle]].p);
    liste.push(construire(melanger, 'arrondir', `Arrondi de ${mil(x)} ${nom} ?`, mil(juste),
      [[mil(autre), 'arrondi-chiffre-suivant'], [mil(rang), 'arrondi-rang']],
      (k) => mil(juste + (k + 1) * p)));
  });

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  graduation: 'Trouve l’abscisse du point M sur la demi-droite graduée.',
  encadrer: 'Encadre ce nombre entre deux valeurs qui se suivent, à la précision demandée.',
  arrondir: 'Arrondis ce nombre à la précision demandée.',

  'pas-graduation': 'Une graduation vaut l’écart entre les deux repères, divisé par le nombre de parts. Ensuite, compte les graduations.',
  'encadrer-precision': 'Regarde la précision demandée : à l’unité, deux nombres entiers ; au dixième, un seul chiffre après la virgule.',
  'encadrer-dedans': 'Le nombre doit se trouver entre les deux bornes : la première plus petite que lui, la seconde plus grande.',
  'arrondi-chiffre-suivant': 'Regarde le chiffre juste après le rang demandé : de zéro à quatre, on garde ; de cinq à neuf, on monte d’un cran.',
  'arrondi-rang': 'Relis la précision : à l’unité, aucun chiffre après la virgule ; au dixième, un seul ; au centième, deux.',

  'graduation-regle': 'Calcule d’abord ce que vaut une graduation, puis avance d’autant de graduations que demandé.',
  'encadrer-regle': 'Les deux bornes se suivent à la précision demandée, et le nombre est entre elles.',
  'arrondir-regle': 'L’arrondi est la valeur la plus proche à la précision demandée : regarde le chiffre suivant pour choisir.',
};
