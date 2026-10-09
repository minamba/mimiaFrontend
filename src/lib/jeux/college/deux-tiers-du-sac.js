/**
 * LES DEUX TIERS DU SAC — 6e, Nora. Nouveau jeu.
 *
 * COMPÉTENCE : MATH_6E_FRAC_QUANTITE.
 *
 * TROIS SORTES DE MANCHES :
 *   - LA FRACTION D'UNE QUANTITÉ (4) : les 2/3 de 24 billes = 16. Pièges :
 *     s'arrêter à une seule part (8), inverser les rôles du numérateur et du
 *     dénominateur (36) ;
 *   - CE QUI RESTE (2) : on mange les 3/8 de 40 bonbons, il en reste 25.
 *     Pièges : répondre la part mangée (15), une seule part (5) ;
 *   - QUELLE FRACTION ? (2) : 12 élèves sur 30 → 12/30. Pièges : 30/12, et la
 *     partie rapportée à ce qui reste (12/18).
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'deux-tiers-du-sac', titre: 'Les deux tiers du sac', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  SIXIEME: {
    titre: 'Les deux tiers du sac',
    accroche: 'Prendre une fraction d’une quantité.',
    competences: ['MATH_6E_FRAC_QUANTITE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

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

const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));

/** Les quantités : la phrase affichée selon la fraction et le total. */
const QUANTITES = [
  (f, N) => `Les ${f} d’un sac de ${N} billes : combien de billes ?`,
  (f, N) => `Les ${f} d’un paquet de ${N} bonbons : combien de bonbons ?`,
  (f, N) => `Les ${f} de ${N} € : combien d’euros ?`,
  (f, N) => `Les ${f} d’un livre de ${N} pages : combien de pages ?`,
  (f, N) => `Les ${f} d’un trajet de ${N} km : combien de kilomètres ?`,
];

const RESTES = [
  (f, N) => `On mange les ${f} d’un paquet de ${N} bonbons. Combien en reste-t-il ?`,
  (f, N) => `On dépense les ${f} de ${N} €. Combien d’euros reste-t-il ?`,
  (f, N) => `On a lu les ${f} d’un livre de ${N} pages. Combien de pages reste-t-il ?`,
];

const PARTIES = [
  (P, N) => `${P} élèves sur ${N} ont un chat. Quelle fraction de la classe ?`,
  (P, N) => `${P} billes rouges dans un sac de ${N} billes. Quelle fraction est rouge ?`,
  (P, N) => `${P} jours de pluie sur ${N} jours. Quelle fraction de ces jours ?`,
];

/** Une fraction n/d irréductible, avec n entre 2 et d − 1. */
function fraction(entre, denominateurs) {
  let n;
  let d;
  do {
    d = denominateurs[entre(0, denominateurs.length - 1)];
    n = entre(2, d - 1);
  } while (pgcd(n, d) !== 1);
  return [n, d];
}

// eslint-disable-next-line no-unused-vars
export function serie(graine = Date.now(), niveau = 'SIXIEME') {
  const { entre, melanger } = outils(graine);
  const liste = [];

  // La fraction d'une quantité : trois quantités, et une heure en minutes.
  const quantites = melanger(QUANTITES).slice(0, 3);
  quantites.forEach((phrase) => {
    const [n, d] = fraction(entre, [3, 4, 5, 6, 7, 8, 9, 10]);
    const k = entre(2, 12);
    const N = d * k;
    const pieges = [[String(k), 'une-part-seulement']];
    if ((N * d) % n === 0) pieges.push([String((N * d) / n), 'roles-inverses']);
    liste.push(construire(melanger, 'fraction-de', phrase(`${n}/${d}`, N), String(n * k), pieges,
      (j) => String(n * k + j * k)));
  });
  {
    const [n, d] = fraction(entre, [3, 4, 5, 6, 10, 12]);
    const k = 60 / d;
    const pieges = [[String(k), 'une-part-seulement']];
    if ((60 * d) % n === 0) pieges.push([String((60 * d) / n), 'roles-inverses']);
    liste.push(construire(melanger, 'fraction-de', `Les ${n}/${d} d’une heure : combien de minutes ?`, String(n * k), pieges,
      (j) => String(n * k + j * 5)));
  }

  // Ce qui reste.
  melanger(RESTES).slice(0, 2).forEach((phrase) => {
    let n;
    let d;
    do {
      d = entre(3, 10);
      n = entre(1, d - 1);
    } while (pgcd(n, d) !== 1 || 2 * n === d);
    const k = entre(2, 10);
    const N = d * k;
    liste.push(construire(melanger, 'reste', phrase(`${n}/${d}`, N), String((d - n) * k),
      [[String(n * k), 'reste-ou-part'], [String(k), 'une-part-seulement']],
      (j) => String((d - n) * k + j)));
  });

  // Quelle fraction ?
  melanger(PARTIES).slice(0, 2).forEach((phrase) => {
    const N = entre(12, 36);
    let P;
    do { P = entre(2, N - 2); } while (2 * P === N);
    liste.push(construire(melanger, 'quelle-fraction', phrase(P, N), `${P}/${N}`,
      [[`${N}/${P}`, 'fraction-inversee'], [`${P}/${N - P}`, 'partie-sur-reste']],
      (j) => `${P + j}/${N}`));
  });

  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  'fraction-de': 'Calcule cette fraction de la quantité.',
  reste: 'Une fraction est partie : combien en reste-t-il ?',
  'quelle-fraction': 'Quelle fraction du tout cette partie représente-t-elle ?',

  'une-part-seulement': 'Tu as trouvé une seule part. Divise par le dénominateur, puis multiplie par le numérateur pour prendre toutes les parts demandées.',
  'roles-inverses': 'Le dénominateur dit en combien de parts on partage, le numérateur combien de parts on prend : on divise par le dénominateur.',
  'reste-ou-part': 'On te demande ce qui reste, pas ce qui est parti : enlève la part prise du total.',
  'fraction-inversee': 'La partie va en haut, le tout va en bas.',
  'partie-sur-reste': 'En bas, on écrit le tout, pas ce qui reste à côté de la partie.',

  'fraction-de-regle': 'Divise la quantité par le dénominateur, puis multiplie par le numérateur.',
  'reste-regle': 'Calcule la part prise, puis retire-la du total.',
  'quelle-fraction-regle': 'La fraction s’écrit : la partie en haut, le tout en bas.',
};
