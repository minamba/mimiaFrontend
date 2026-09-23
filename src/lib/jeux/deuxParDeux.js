/**
 * DEUX PAR DEUX — le huitième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CP_CALC_DOUBLE — « Connaître les doubles et les moitiés jusqu'à 20 »
 *
 * LE PLAN RANGEAIT AUSSI LE SENS DE LA MULTIPLICATION ET LE PROBLÈME
 * MULTIPLICATIF SOUS CE JEU. Deux assiettes, c'est deux groupes seulement :
 * « 6 et 6 » reste une addition de deux nombres égaux. Le sens de la
 * multiplication demande des groupes en nombre quelconque, et un vrai
 * problème à lire. MATH_CP_MULT_SENS et MATH_CP_PROB_MULT restent ouvertes
 * pour un autre jeu, et ne sont PAS déclarées ici.
 *
 * DEUX MOITIÉS DE PARTIE, LES DEUX SENS DE LA COMPÉTENCE :
 *
 *   1. LE DOUBLE (4 manches). Deux assiettes. Sur l'une, les biscuits se
 *      voient ; l'autre est sous une cloche, et Nora dit qu'il y en a
 *      autant. « Combien de biscuits en tout ? »
 *
 *   2. LA MOITIÉ (4 manches). Une grande assiette de biscuits à partager en
 *      deux, autant de chaque côté. « Combien sur chaque assiette ? »
 *
 * POURQUOI UNE CLOCHE. Si les deux assiettes se voyaient, l'enfant
 * compterait tous les biscuits un par un, et le double ne servirait à rien.
 * La cloche l'oblige à se servir de ce qu'il sait : « 6 et 6, c'est 12 ».
 * À LA MOITIÉ, pour la même raison, les biscuits sont posés en désordre sur
 * la grande assiette, jamais rangés par deux : des paires toutes faites
 * donneraient la réponse.
 *
 * LES QUATRE RÉPONSES SONT LUES PAR NORA, comme à l'horloge : un CP ne lit
 * pas encore « 12 » sur un bouton aussi vite qu'il l'entend.
 *
 * L'ERREUR SE NOMME. Au double, l'erreur de fond est d'oublier ce qui est
 * sous la cloche — de ne compter qu'une assiette ; à la moitié, de répondre
 * par le total, sans partager. Chacune a sa phrase.
 */

export const MANCHES = 8;
export const MANCHES_DOUBLE = 4;

/** Le nombre d'une assiette : de 2 à 10, pour des totaux jusqu'à 20. */
const MIN = 2;
const MAX = 10;

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LES QUATRE RÉPONSES PROPOSÉES.
 *
 * Au double de n : le bon total, n (une seule assiette comptée — le piège),
 * et deux voisins du total. À la moitié de 2n : n, 2n (le total non partagé
 * — le piège), et deux voisins de n. Tout reste entre 1 et 20.
 */
export function propositions(mode, n, tirer) {
  const [bon, piege, voisins] = mode === 'double'
    ? [2 * n, n, [2 * n - 2, 2 * n + 2, 2 * n - 1, 2 * n + 1]]
    : [n, 2 * n, [n - 1, n + 1, n - 2, n + 2]];

  const autres = voisins.filter((x) => x >= 1 && x <= 20 && x !== bon && x !== piege);
  const liste = [bon, piege, autres[0], autres[1]];
  for (let i = liste.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/**
 * LA SÉRIE D'UNE PARTIE : quatre doubles, puis quatre moitiés, jamais le même
 * nombre deux fois d'affilée.
 */
export function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const liste = [];

  for (let i = 0; i < manches; i += 1) {
    const mode = i < MANCHES_DOUBLE ? 'double' : 'moitie';
    let n;
    do {
      n = MIN + Math.floor(tirer() * (MAX - MIN + 1));
    } while (liste.length > 0 && n === liste[liste.length - 1].n);

    liste.push({ mode, n, choix: propositions(mode, n, tirer) });
  }

  return liste;
}

/** La bonne réponse d'une manche. */
export function reponse({ mode, n }) {
  return mode === 'double' ? 2 * n : n;
}

/**
 * Ce que vaut la réponse choisie.
 *
 * `oubli` : au double, n'avoir compté qu'une assiette. `tout` : à la moitié,
 * avoir donné le total sans partager. Sinon, le sens de l'erreur.
 */
export function verdict(choix, manche) {
  const bon = reponse(manche);
  if (choix === bon) return 'juste';
  if (manche.mode === 'double' && choix === manche.n) return 'oubli';
  if (manche.mode === 'moitie' && choix === 2 * manche.n) return 'tout';
  return choix > bon ? 'trop' : 'pas-assez';
}

/** Le mot de la fin — le même dans tous les jeux. */
export function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
export function resultatDouble(n) {
  return `${n} et ${n}, ça fait ${2 * n}.`;
}

export function resultatMoitie(n) {
  return `La moitié de ${2 * n}, c’est ${n}.`;
}

export const PHRASES = {
  consigneDouble: 'Sous la cloche, il y en a autant. Combien de biscuits en tout ?',
  consigneMoitie: 'On partage en deux, autant sur chaque assiette. Combien sur chaque assiette ?',
  oubli: 'Tu n’as compté qu’une assiette : il y en a autant sous la cloche.',
  tout: 'Ça, ce sont tous les biscuits. Il faut les partager en deux.',
  trop: 'C’est trop.',
  pasAssez: 'Ce n’est pas assez.',
};
