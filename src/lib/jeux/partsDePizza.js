/**
 * LES PARTS DE PIZZA — le troisième nouveau jeu de maths du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE1_FRAC_SENS     — « Comprendre, lire et écrire une fraction d'un
 *                             tout »
 *   MATH_CE1_FRAC_COMPARER — « Comparer des fractions de même dénominateur »
 *   MATH_CE1_FRAC_ADD      — « Additionner et soustraire des fractions de
 *                             même dénominateur »
 *
 * TROIS TEMPS, UN PAR COMPÉTENCE :
 *
 *   1. LIRE (3 manches). Une pizza coupée en parts égales, certaines garnies.
 *      L'enfant choisit l'écriture de la part garnie parmi trois.
 *
 *   2. COMPARER (3 manches). Deux fractions écrites, même dénominateur.
 *      L'enfant touche la plus grande ; les pizzas apparaissent ensuite pour
 *      lui montrer pourquoi. Elles ne sont pas montrées AVANT : on verrait la
 *      plus grosse part sans lire les fractions.
 *
 *   3. ADDITIONNER (2 manches). « 1/4 + 2/4 », trois résultats proposés.
 *
 * LES PIÈGES SONT CEUX DU CE1, PROPOSÉS EXPRÈS :
 *   - compter les parts vides au lieu des garnies (3/4 lu 1/4) ;
 *   - écrire la fraction à l'envers (3/4 écrit 4/3) ;
 *   - additionner aussi les nombres du bas (1/4 + 2/4 = 3/8) — l'erreur la
 *     plus fréquente, et la plus instructive à nommer.
 *
 * LA SOUSTRACTION N'EST PAS TRAVAILLÉE ICI : la compétence la nomme, mais un
 * seul jeu ne peut pas tout porter sans devenir un examen. Elle reste à un
 * prochain temps de ce jeu, ou à un autre.
 *
 * DES PIZZAS COUPÉES EN 2, 3, 4, 6 ou 8 : les partages qu'un enfant a déjà
 * vus sur une vraie pizza.
 *
 * AU CE2 — Camara, le 21/09/2026. Compétences :
 *   MATH_CE2_FRAC_SUP_UN   — « Lire et écrire des fractions, y compris
 *                             supérieures à 1 »
 *   MATH_CE2_FRAC_EGALITES — « Établir des égalités entre fractions simples »
 *   MATH_CE2_FRAC_ADD      — « Additionner et soustraire des fractions »
 * Les trois temps deviennent : LIRE des fractions qui dépassent une pizza
 * (5/4 : une pizza entière et un quart), ÉGALER (1/2 = 2/4 : la même part,
 * coupée plus fin), et ADDITIONNER jusqu'au-delà d'une pizza. Le piège
 * propre au CE2 : ne compter que les parts de la dernière pizza (5/4 lu 1/4).
 */

export const MANCHES = 8;
export const MANCHES_LIRE = 3;
export const MANCHES_COMPARER = 3;
export const ESSAIS_AVANT_AIDE = 2;
export const PARTS = [2, 3, 4, 6, 8];

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;

  return () => {
    etat = (etat * 16807) % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Une fraction, écrite comme on la compare : « 3/4 ». */
export const cle = ({ n, d }) => `${n}/${d}`;

/**
 * LES ÉGALITÉS DU CE2 : une fraction, la même coupée plus fin. Écrites à la
 * main : ce sont celles du programme — demis, tiers, quarts, et leurs doubles.
 */
export const EGALITES = [
  [{ n: 1, d: 2 }, { n: 2, d: 4 }], [{ n: 1, d: 2 }, { n: 3, d: 6 }], [{ n: 1, d: 2 }, { n: 4, d: 8 }],
  [{ n: 1, d: 3 }, { n: 2, d: 6 }], [{ n: 2, d: 3 }, { n: 4, d: 6 }], [{ n: 1, d: 4 }, { n: 2, d: 8 }],
  [{ n: 3, d: 4 }, { n: 6, d: 8 }],
];

export function serie(graine = Date.now(), niveau = 'CE1') {
  if (niveau === 'CE2') return serieCE2(graine);
  const tirer = suite(graine);
  const entre = (min, max) => min + Math.floor(tirer() * (max - min + 1));
  const au = (liste) => liste[Math.floor(tirer() * liste.length)];
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };

  const liste = [];
  for (let i = 0; i < MANCHES; i += 1) {
    if (i < MANCHES_LIRE) {
      // Jamais la moitié exacte : la part garnie et la part vide seraient la
      // même fraction, et le piège des parts vides n'existerait pas.
      let d;
      let n;
      do { d = au([3, 4, 6, 8]); n = entre(1, d - 1); } while (2 * n === d);
      const choix = melanger([{ n, d }, { n: d - n, d }, { n: d, d: n }]);
      liste.push({ mode: 'lire', fraction: { n, d }, choix });
    } else if (i < MANCHES_LIRE + MANCHES_COMPARER) {
      const d = au([3, 4, 6, 8]);
      const a = entre(1, d - 1);
      let b;
      do { b = entre(1, d - 1); } while (b === a);
      liste.push({ mode: 'comparer', choix: [{ n: a, d }, { n: b, d }] });
    } else {
      const d = au([4, 6, 8]);
      const a = entre(1, d - 2);
      const b = entre(1, d - 1 - a);
      const somme = { n: a + b, d };
      const pieges = [{ n: a + b, d: 2 * d }, { n: a + b + 1 <= d ? a + b + 1 : a + b - 1, d }];
      liste.push({
        mode: 'additionner', termes: [{ n: a, d }, { n: b, d }], fraction: somme, choix: melanger([somme, ...pieges]),
      });
    }
  }
  return liste;
}

/**
 * LA SÉRIE DU CE2 : trois fractions à lire dont au moins deux dépassent une
 * pizza, trois égalités, deux additions dont la somme peut dépasser une pizza.
 */
function serieCE2(graine) {
  const tirer = suite(graine);
  const entre = (min, max) => min + Math.floor(tirer() * (max - min + 1));
  const au = (liste) => liste[Math.floor(tirer() * liste.length)];
  const melanger = (liste) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };

  const liste = [];
  for (let i = 0; i < MANCHES_LIRE; i += 1) {
    // Au-delà d'une pizza, jamais un nombre rond de pizzas : il reste une part.
    // Le tirage recommence AVEC la pizza : coupée en deux, une seule part ne
    // peut être que la moitié — la boucle tournait sans fin.
    let d;
    let n;
    do {
      d = au([2, 3, 4, 6]);
      n = i === 0 ? entre(1, d - 1) : entre(d + 1, 2 * d - 1);
    } while (2 * n === d);
    const reste = n > d ? { n: n - d, d } : { n: d - n, d };
    liste.push({ mode: 'lire', fraction: { n, d }, choix: melanger([{ n, d }, reste, { n: d, d: n }]) });
  }
  melanger(EGALITES).slice(0, MANCHES_COMPARER).forEach(([a, b]) => {
    const piege1 = { n: a.n, d: b.d };
    const piege2 = { n: b.n + 1 <= b.d ? b.n + 1 : b.n - 1, d: b.d };
    liste.push({ mode: 'egaler', modele: a, fraction: b, choix: melanger([b, piege1, piege2]) });
  });
  for (let i = 0; i < MANCHES - MANCHES_LIRE - MANCHES_COMPARER; i += 1) {
    const d = au([3, 4, 6]);
    const a = entre(1, d - 1);
    const b = entre(1, d - 1);
    const somme = { n: a + b, d };
    const choix = melanger([somme, { n: a + b, d: 2 * d }, { n: a + b + 1, d }]);
    liste.push({ mode: 'additionner', termes: [{ n: a, d }, { n: b, d }], fraction: somme, choix });
  }
  return liste;
}

/** La bonne réponse d'une manche. */
export function reponse(manche) {
  if (manche.mode === 'comparer') {
    const [x, y] = manche.choix;
    return x.n > y.n ? x : y;
  }
  return manche.fraction;
}

/**
 * Ce que vaut une fraction choisie : juste, ou le nom du piège où l'on est
 * tombé.
 */
export function verdict(choix, manche) {
  const bonne = reponse(manche);
  if (choix.n === bonne.n && choix.d === bonne.d) return 'juste';
  if (manche.mode === 'lire') {
    if (choix.d !== bonne.d) return 'envers';
    return bonne.n > bonne.d ? 'reste' : 'vides';
  }
  if (manche.mode === 'egaler') return 'egaler';
  if (manche.mode === 'comparer') return 'comparer';
  return choix.d !== bonne.d ? 'bas' : 'compter';
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
export const PHRASES = {
  lire: 'Quelle part de la pizza est garnie ?',
  comparer: 'Quelle fraction est la plus grande ? Touche-la.',
  additionner: 'Combien de pizza en tout ?',
  vides: 'Tu as compté les parts vides. On compte les parts garnies.',
  envers: 'En bas, on écrit en combien de parts la pizza est coupée.',
  comparerErreur: 'Les parts ont la même taille : la plus grande fraction est celle qui en a le plus.',
  bas: 'On ajoute des parts, pas des pizzas : le nombre du bas ne change pas.',
  compter: 'Compte toutes les parts ensemble.',
  aide: 'Regarde les pizzas : voici la bonne réponse.',
  egaler: 'Quelle fraction est égale ? C’est la même part, coupée plus fin.',
  reste: 'Tu n’as compté que la dernière pizza. Compte toutes les parts garnies.',
  egalerErreur: 'Deux fois plus de parts, deux fois plus petites : il en faut deux fois plus.',
};

export const ERREURS = {
  vides: 'vides', envers: 'envers', comparer: 'comparerErreur', bas: 'bas', compter: 'compter',
  reste: 'reste', egaler: 'egalerErreur',
};
