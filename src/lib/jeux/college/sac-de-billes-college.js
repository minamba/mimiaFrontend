/**
 * LE SAC DE BILLES DU COLLÈGE — les probabilités, de la 5e à la 3e.
 * Professeure : Nora (mathématiques).
 *
 * TOUTES LES RÉPONSES SONT DES FRACTIONS IRRÉDUCTIBLES, calculées ici à
 * partir des billes du sac ou des faces du dé (jamais recopiées).
 *
 * PAR CLASSE (trois sortes de manches, 3 + 3 + 2, mélangées) :
 *   5e — la probabilité d'une couleur ; impossible, certain ou possible ; ce
 *        qui ne peut pas être une probabilité ;
 *   4e — un dé à 6, 8, 10, 12 ou 20 faces ; l'événement contraire ; retrouver
 *        un nombre de billes à partir d'une probabilité ;
 *   3e — deux tirages AVEC remise, deux tirages SANS remise (l'arbre), deux
 *        pièces ou deux dés lancés ensemble.
 *
 * LES PIÈGES : diviser par les défavorables au lieu du total ; « une chance
 * sur trois » parce qu'il y a trois couleurs (l'équiprobabilité imaginée) ;
 * le contraire pris pour l'inverse ; additionner le long d'un chemin de
 * l'arbre ; oublier qu'une bille gardée manque au second tirage ; les trois
 * « issues » pile-pile, pile-face, face-face (l'erreur de d'Alembert) ; les
 * onze sommes de deux dés prises pour également probables.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'sac-de-billes-college', titre: 'Le sac de billes', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  CINQUIEME: {
    titre: 'Le sac de billes',
    accroche: 'Le hasard, et ses chances.',
    competences: ['MATH_5E_PROBA_INTRO'],
  },
  QUATRIEME: {
    titre: 'Le sac de billes',
    accroche: 'Calcule tes chances avant de tirer.',
    competences: ['MATH_4E_PROBA_CALCUL'],
  },
  TROISIEME: {
    titre: 'Deux tirages',
    accroche: 'Avec ou sans remise : fais l’arbre.',
    competences: ['MATH_3E_PROBA_DEUX'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

const pgcd = (a, b) => (b === 0 ? Math.abs(a) : pgcd(b, a % b));
/** « 3/8 », toujours irréductible ; « 1 » ou « 0 » si la fraction est entière. */
export function frac(n, d) {
  const g = pgcd(n, d) || 1;
  const [a, b] = [n / g, d / g];
  return b === 1 ? `${a}` : `${a}/${b}`;
}

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

/** Des voisins de la bonne fraction : on agrandit le dénominateur. */
const voisinDe = (n, d) => (i) => frac(n, d + i); // n/(d+i) : toujours nouveau, toujours entre 0 et 1

const COULEURS = [
  { une: 'rouge', des: 'rouges' },
  { une: 'bleue', des: 'bleues' },
  { une: 'verte', des: 'vertes' },
  { une: 'jaune', des: 'jaunes' },
];

const enum2 = (liste) => (liste.length === 2 ? `${liste[0]} et ${liste[1]}` : `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}`);

/* ------------------------------------------------------------------ 5e */

function couleur(o) {
  const { entre, au, melanger } = o;
  const k = au([2, 3, 3]);
  const teintes = melanger(COULEURS).slice(0, k);
  const nombres = teintes.map(() => entre(1, 9));
  const total = nombres.reduce((a, b) => a + b, 0);
  const i = entre(0, k - 1);
  const c = nombres[i];
  // « 1 bille rouge », « 3 billes rouges » : l'accord suit le nombre.
  const contenu = teintes.map((t, j) => {
    const n = nombres[j];
    const teinte = n > 1 ? t.des : t.une;
    if (j > 0) return `${n} ${teinte}`;
    return `${n} ${n > 1 ? 'billes' : 'bille'} ${teinte}`;
  });
  return faire(melanger, 'proba-simple',
    `Un sac contient ${enum2(contenu)}.\nOn tire une bille au hasard.\nProbabilité de tirer une ${teintes[i].une} ?`, frac(c, total), [
      [frac(1, k), 'proba-couleurs'],
      [frac(c, total - c), 'proba-sur-total'],
    ], voisinDe(c, total));
}

/** Les événements d'un dé à six faces : un texte et la liste des faces qui le réalisent. */
function evenementDe(o) {
  const { entre, au } = o;
  const faces = [1, 2, 3, 4, 5, 6];
  const sorte = au(['egal', 'inf', 'sup', 'pair', 'sac']);
  if (sorte === 'egal') {
    const k = entre(1, 9);
    return [`On lance un dé à six faces, numérotées de 1 à 6.\n« Obtenir ${k} » est un événement :`, faces.filter((x) => x === k).length, 6];
  }
  if (sorte === 'inf') {
    const k = entre(1, 8);
    return [`On lance un dé à six faces, numérotées de 1 à 6.\n« Obtenir un nombre inférieur ou égal à ${k} » est un événement :`, faces.filter((x) => x <= k).length, 6];
  }
  if (sorte === 'sup') {
    const k = entre(0, 7);
    return [`On lance un dé à six faces, numérotées de 1 à 6.\n« Obtenir un nombre strictement supérieur à ${k} » est un événement :`, faces.filter((x) => x > k).length, 6];
  }
  if (sorte === 'pair') {
    return ['On lance un dé à six faces, numérotées de 1 à 6.\n« Obtenir un nombre pair » est un événement :', 3, 6];
  }
  const [a, b] = au([[COULEURS[0], COULEURS[1]], [COULEURS[2], COULEURS[3]], [COULEURS[1], COULEURS[2]]]);
  const n = entre(3, 9);
  const meme = au([true, false]);
  return [`Un sac ne contient que ${n} billes ${a.des}.\n« Tirer une bille ${meme ? a.une : b.une} » est un événement :`, meme ? n : 0, n];
}

const ISSUES = ['impossible', 'certain', 'possible, pas certain'];

function evenement(o) {
  const { melanger } = o;
  const [question, favorables, total] = evenementDe(o);
  let bonne = 'possible, pas certain';
  let phrase = 'evenement-possible';
  if (favorables === 0) { bonne = 'impossible'; phrase = 'evenement-impossible'; }
  if (favorables === total) { bonne = 'certain'; phrase = 'evenement-certain'; }
  const pieges = {};
  ISSUES.filter((c) => c !== bonne).forEach((c) => { pieges[c] = phrase; });
  return {
    consigne: 'evenement', question, choix: melanger(ISSUES).map((c) => ({ cle: c, libelle: c })), bonne, pieges,
  };
}

function pasUneProba(o) {
  const { entre, au, melanger } = o;
  const d = entre(3, 9);
  const intrus = au([
    frac(d + entre(1, 4), d),
    `1,${entre(1, 9)}`,
    `−0,${entre(1, 9)}`,
    `−1/${entre(2, 9)}`,
  ]);
  let n = entre(1, d - 1);
  while (pgcd(n, d) !== 1) n -= 1;
  const valides = melanger([au(['0', '1']), `${n}/${d}`, `0,${entre(1, 9)}${au(['', '5'])}`]).slice(0, 2);
  const paires = valides.map((v) => [v, { 0: 'proba-zero', 1: 'proba-un' }[v] ?? 'proba-valide']);
  return faire(melanger, 'pas-une-proba', 'Laquelle de ces valeurs ne peut pas être une probabilité ?', intrus, paires, () => '1/2');
}

/* ------------------------------------------------------------------ 4e */

const PREMIERS = [2, 3, 5, 7, 11, 13, 17, 19];
const EVENEMENTS = [
  ['un nombre pair', () => (x) => x % 2 === 0],
  ['un nombre impair', () => (x) => x % 2 === 1],
  ['un multiple de 3', () => (x) => x % 3 === 0],
  ['un multiple de 4', () => (x) => x % 4 === 0],
  ['un nombre premier', () => (x) => PREMIERS.includes(x)],
  ['un nombre strictement supérieur à K', (k) => (x) => x > k],
  ['un nombre inférieur ou égal à K', (k) => (x) => x <= k],
];

function de(o) {
  const { entre, au, melanger } = o;
  for (;;) {
    const f = au([6, 8, 10, 12, 20]);
    const [texte, faire1] = au(EVENEMENTS);
    const k = entre(2, f - 2);
    const test = faire1(k);
    const c = Array.from({ length: f }, (_, i) => i + 1).filter(test).length;
    if (c >= 2 && c < f) {
      const ev = texte.replace('K', String(k));
      return faire(melanger, 'proba-simple',
        `On lance un dé équilibré à ${f} faces, numérotées de 1 à ${f}.\nProbabilité d'obtenir ${ev} ?`, frac(c, f), [
          [frac(1, f), 'proba-une-issue'],
          [frac(c, f - c), 'proba-sur-total'],
        ], voisinDe(c, f));
    }
  }
}

const CONTEXTES = [
  ['La probabilité qu’il pleuve demain est', 'Probabilité qu’il ne pleuve pas ?'],
  ['La probabilité que le bus soit en retard est', 'Probabilité qu’il soit à l’heure ?'],
  ['La probabilité de gagner à ce jeu est', 'Probabilité de ne pas gagner ?'],
];

function contraire(o) {
  const { entre, au, melanger } = o;
  const q = entre(3, 12);
  let p = entre(1, q - 1);
  while (pgcd(p, q) !== 1 || 2 * p === q) p = p === 1 ? q - 1 : p - 1;
  const [avant, apres] = au(CONTEXTES);
  return faire(melanger, 'contraire', `${avant} ${p}/${q}.\n${apres}`, frac(q - p, q), [
    [frac(q, p), 'contraire-inverse'],
    [frac(p, q), 'contraire-meme'],
  ], voisinDe(q - p, q));
}

function effectif(o) {
  const { entre, au, melanger } = o;
  const q = entre(3, 8);
  let p = entre(1, q - 1);
  while (pgcd(p, q) !== 1) p -= 1;
  const m = entre(2, 6);
  const t = au(COULEURS);
  return faire(melanger, 'effectif',
    `Un sac contient ${q * m} billes.\nLa probabilité de tirer une bille ${t.une} est ${p}/${q}.\nCombien y a-t-il de billes ${t.des} ?`, String(p * m), [
      [String(q * m - p * m), 'effectif-contraire'],
      [String(p), 'effectif-numerateur'],
    ], (i) => String(p * m + i));
}

/* ------------------------------------------------------------------ 3e */

function tirage(o, remise) {
  const { entre, au, melanger } = o;
  const [a, b] = au([[COULEURS[0], COULEURS[1]], [COULEURS[2], COULEURS[3]], [COULEURS[1], COULEURS[3]]]);
  const r = entre(2, 7);
  const s = entre(2, 7);
  const n = r + s;
  const sorte = au(['deux', 'deux', 'puis']);
  const intro = `Un sac contient ${r} billes ${a.des} et ${s} ${b.des}.\n${remise
    ? 'On tire une bille, on la remet, puis on en tire une deuxième.'
    : 'On tire une bille, on la garde, puis on en tire une deuxième.'}`;
  const consigne = remise ? 'tirage-avec-remise' : 'tirage-sans-remise';
  if (sorte === 'deux') {
    const avec = frac(r * r, n * n);
    const sans = frac(r * (r - 1), n * (n - 1));
    return faire(melanger, consigne, `${intro}\nProbabilité de tirer deux billes ${a.des} ?`, remise ? avec : sans, [
      [remise ? sans : avec, remise ? 'avec-remise' : 'sans-remise'],
      [remise ? frac(2 * r, n) : frac(r * (n - 1) + (r - 1) * n, n * (n - 1)), 'arbre-multiplier'],
    ], remise ? voisinDe(r * r, n * n) : voisinDe(r * (r - 1), n * (n - 1)));
  }
  const avec = frac(r * s, n * n);
  const sans = frac(r * s, n * (n - 1));
  return faire(melanger, consigne, `${intro}\nProbabilité de tirer une ${a.une}, puis une ${b.une} ?`, remise ? avec : sans, [
    [remise ? sans : avec, remise ? 'avec-remise' : 'sans-remise'],
    [remise ? frac(2 * r * s, n * n) : frac(2 * r * s, n * (n - 1)), 'ordre-deux-chemins'],
  ], remise ? voisinDe(r * s, n * n) : voisinDe(r * s, n * (n - 1)));
}

function deuxEpreuves(o) {
  const { entre, au, melanger } = o;
  if (au([true, false])) {
    if (au([true, false])) {
      return faire(melanger, 'deux-epreuves', 'On lance deux pièces équilibrées.\nProbabilité d’obtenir une fois pile et une fois face ?', '1/2', [
        [frac(1, 3), 'issues-ordre'],
        [frac(1, 4), 'deux-chemins'],
      ], () => '3/4');
    }
    return faire(melanger, 'deux-epreuves', 'On lance deux pièces équilibrées.\nProbabilité d’obtenir deux fois face ?', '1/4', [
      [frac(1, 3), 'issues-ordre'],
      [frac(1, 2), 'arbre-multiplier'],
    ], () => '3/4');
  }
  const somme = entre(3, 11);
  let c = 0;
  for (let x = 1; x <= 6; x += 1) for (let y = 1; y <= 6; y += 1) if (x + y === somme) c += 1;
  return faire(melanger, 'deux-epreuves',
    `On lance deux dés équilibrés à six faces et on additionne les deux résultats.\nProbabilité d’obtenir une somme de ${somme} ?`, frac(c, 36), [
      [frac(1, 11), 'issues-somme'],
      [frac(1, 36), 'issues-plusieurs'],
    ], voisinDe(c, 36));
}

/* ------------------------------------------------------------- la série */

const fois = (n, f, o) => Array.from({ length: n }, () => f(o));

const BANQUES = {
  CINQUIEME: (o) => [...fois(3, couleur, o), ...fois(3, evenement, o), ...fois(2, pasUneProba, o)],
  QUATRIEME: (o) => [...fois(3, de, o), ...fois(3, contraire, o), ...fois(2, effectif, o)],
  TROISIEME: (o) => [...fois(3, (x) => tirage(x, true), o), ...fois(3, (x) => tirage(x, false), o), ...fois(2, deuxEpreuves, o)],
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
  // 5e et 4e
  'proba-simple': 'Quelle est la probabilité de cet événement ?',
  'proba-sur-total': 'Une probabilité, c’est le nombre d’issues favorables divisé par le nombre total d’issues, et non par le nombre d’issues défavorables.',
  'proba-couleurs': 'Les couleurs n’ont pas toutes la même chance : ce sont les billes qu’on compte, pas les couleurs.',
  'proba-une-issue': 'Plusieurs faces réalisent cet événement : compte-les toutes, pas une seule.',
  'proba-simple-regle': 'Compte les issues favorables, divise par le nombre total d’issues, puis simplifie la fraction.',
  evenement: 'Cet événement est-il impossible, certain, ou seulement possible ?',
  'evenement-impossible': 'Regarde toutes les issues : aucune ne réalise cet événement, il est donc impossible.',
  'evenement-certain': 'Regarde toutes les issues : chacune réalise cet événement, il est donc certain.',
  'evenement-possible': 'Certaines issues réalisent cet événement, d’autres non : il est possible, sans être certain.',
  'evenement-regle': 'Passe en revue toutes les issues : aucune ne convient, c’est impossible ; toutes conviennent, c’est certain ; sinon, c’est possible.',
  'pas-une-proba': 'Laquelle de ces valeurs ne peut pas être une probabilité ?',
  'proba-zero': 'Une probabilité de zéro, c’est celle d’un événement impossible : elle existe bien.',
  'proba-un': 'Une probabilité de un, c’est celle d’un événement certain : elle existe bien.',
  'proba-valide': 'Ce nombre est compris entre zéro et un : il peut être une probabilité. Cherche celui qui est plus grand que un, ou négatif.',
  'pas-une-proba-regle': 'Une probabilité est toujours comprise entre zéro et un.',
  contraire: 'Quelle est la probabilité de l’événement contraire ?',
  'contraire-inverse': 'L’événement contraire ne s’obtient pas en retournant la fraction : les deux probabilités font un à elles deux. Calcule un moins la probabilité.',
  'contraire-meme': 'Ça, c’est la probabilité de l’événement lui-même : celle du contraire est ce qui manque pour arriver à un.',
  'contraire-regle': 'La probabilité de l’événement contraire, c’est un moins la probabilité de l’événement.',
  effectif: 'Combien y a-t-il de billes de cette couleur ?',
  'effectif-contraire': 'Ce nombre-là, ce sont les autres billes : la probabilité donne la part des billes de la couleur demandée.',
  'effectif-numerateur': 'La fraction ne donne pas directement le nombre de billes : prends cette fraction du nombre total de billes.',
  'effectif-regle': 'Multiplie le nombre total de billes par la probabilité : c’est le nombre de billes de cette couleur.',
  // 3e
  'tirage-avec-remise': 'La bille est remise dans le sac : quelle est la probabilité ?',
  'tirage-sans-remise': 'La bille est gardée : quelle est la probabilité ?',
  'arbre-multiplier': 'Sur un arbre, on multiplie les probabilités le long d’un chemin : on ne les additionne pas.',
  'avec-remise': 'La bille est remise dans le sac : au deuxième tirage, le sac est exactement le même qu’au premier.',
  'sans-remise': 'La bille n’est pas remise : au deuxième tirage, il y a une bille de moins dans le sac, et une de moins de la couleur déjà tirée.',
  'ordre-deux-chemins': 'On demande un ordre précis, d’abord une couleur puis l’autre : un seul chemin de l’arbre compte.',
  'tirage-avec-remise-regle': 'Fais l’arbre : le sac ne change pas d’un tirage à l’autre, et on multiplie le long du chemin.',
  'tirage-sans-remise-regle': 'Fais l’arbre : au second tirage, enlève la bille déjà tirée, puis multiplie le long du chemin.',
  'deux-epreuves': 'Deux lancers en même temps : quelle est la probabilité ?',
  'issues-ordre': 'Les issues ne sont pas aussi probables les unes que les autres : pile puis face, et face puis pile, sont deux issues différentes. Fais l’arbre.',
  'deux-chemins': 'Deux chemins de l’arbre mènent à cet événement : pile puis face, et face puis pile. Additionne-les.',
  'issues-somme': 'Les sommes possibles ne sont pas toutes aussi probables : compte les couples de dés qui donnent cette somme, sur trente-six couples.',
  'issues-plusieurs': 'Plusieurs couples de dés donnent cette somme : compte-les tous, par exemple dans un tableau à double entrée.',
  'deux-epreuves-regle': 'Fais l’arbre ou le tableau de toutes les issues, compte celles qui conviennent, et divise par le total.',
};
