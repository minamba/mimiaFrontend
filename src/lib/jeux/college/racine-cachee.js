/**
 * LA RACINE CACHÉE — les racines carrées, en 3e.
 * Professeure : Nora (mathématiques).
 *
 * TROIS SORTES DE MANCHES (3 + 3 + 2, mélangées) :
 *   - LA RACINE EXACTE (3) : la racine d'un carré parfait, d'un décimal
 *     (√0,49), et le carré d'une racine, (√7)². Pièges : la moitié au lieu
 *     de la racine, la racine négative, la virgule mal placée, le carré pris
 *     pour un double ;
 *   - L'ENCADREMENT (3) : √50 entre deux entiers consécutifs. Pièges : les
 *     carrés donnés au lieu de leurs racines, la moitié ;
 *   - LA SOMME (2) : LE PIÈGE du chapitre, √(a + b) n'est pas √a + √b.
 *     Les couples sont choisis pour que a + b soit aussi un carré parfait :
 *     les deux calculs tombent juste, et différents.
 */

import { bilan as bilanCommun, outils, troisChoix } from '../outils.js';

export const FAMILLE = { cle: 'racine-cachee', titre: 'La racine cachée', matiereCode: 'MATHS' };

export const PAR_CLASSE = {
  TROISIEME: {
    titre: 'La racine cachée',
    accroche: 'Quel nombre, au carré, donne celui-ci ?',
    competences: ['MATH_3E_RACINE'],
  },
};
export const CLASSES = Object.keys(PAR_CLASSE);

export const MANCHES = 8;

/** « −12 », « 0,7 » : le signe moins typographique et la virgule. */
const nb = (x) => {
  const r = Math.round(x * 10000) / 10000;
  return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
};

/** Deux carrés parfaits dont la somme est encore un carré parfait (triplets de Pythagore). */
export const COUPLES = [[9, 16], [36, 64], [25, 144], [81, 144], [64, 225], [144, 256], [16, 9], [64, 36], [144, 25], [225, 64]];

/** Une manche : la bonne réponse, ses pièges (jamais justes), et des voisins s'il en manque. */
function monter(melanger, consigne, question, bonne, pieges, voisin) {
  const faux = pieges.filter(([v]) => v !== bonne);
  const cles = troisChoix(bonne, faux.map(([v]) => v), voisin);
  const lesPieges = {};
  faux.forEach(([v, phrase]) => {
    if (cles.includes(v) && !(v in lesPieges)) lesPieges[v] = phrase;
  });
  return {
    consigne, question, bonne, choix: melanger(cles).map((c) => ({ cle: c, libelle: c })), pieges: lesPieges,
  };
}

function racineExacte({ entre, melanger }, sorte) {
  if (sorte === 'entier') {
    const r = entre(4, 15);
    return monter(melanger, 'racine-exacte', `√${r * r} = ?`, nb(r), [
      [nb((r * r) / 2), 'racine-pas-moitie'],
      [nb(-r), 'racine-positive'],
    ], (k) => nb(r + k));
  }
  if (sorte === 'decimal') {
    const r = entre(2, 9);
    return monter(melanger, 'racine-exacte', `√${nb((r * r) / 100)} = ?`, nb(r / 10), [
      [nb(r / 100), 'verifier-au-carre'],
      [nb((r * r) / 200), 'racine-pas-moitie'],
    ], (k) => nb((r + k) / 10));
  }
  const n = melanger([2, 3, 5, 6, 7, 10, 11, 13])[0];
  return monter(melanger, 'carre-racine', `(√${n})² = ?`, nb(n), [
    [nb(n * n), 'carre-de-racine'],
    [nb(2 * n), 'carre-pas-double'],
  ], (k) => nb(n + k));
}

function encadrement({ entre, melanger }) {
  let n = entre(10, 150);
  while (Number.isInteger(Math.sqrt(n))) n = entre(10, 150);
  const r = Math.floor(Math.sqrt(n));
  const h = Math.floor(n / 2);
  return monter(melanger, 'encadrement', `√${n} est compris entre…`, `${r} et ${r + 1}`, [
    [`${r * r} et ${(r + 1) * (r + 1)}`, 'encadrer-racines'],
    [`${h} et ${h + 1}`, 'racine-pas-moitie'],
  ], (k) => `${r + k} et ${r + k + 1}`);
}

function somme({ au, melanger }) {
  const [a, b] = au(COUPLES);
  const [ra, rb, rs] = [Math.sqrt(a), Math.sqrt(b), Math.sqrt(a + b)];
  if (au(['separees', 'ensemble']) === 'separees') {
    return monter(melanger, 'somme-racines', `√${a} + √${b} = ?`, nb(ra + rb), [
      [nb(rs), 'somme-racines-separees'],
      [nb(a + b), 'oublier-racine'],
    ], (k) => nb(ra + rb + k));
  }
  return monter(melanger, 'somme-racines', `√(${a} + ${b}) = ?`, nb(rs), [
    [nb(ra + rb), 'racine-somme'],
    [nb(a + b), 'oublier-racine'],
  ], (k) => nb(rs + k));
}

function troisieme(o) {
  const liste = [];
  o.melanger(['entier', 'decimal', 'carre']).forEach((sorte) => liste.push(racineExacte(o, sorte)));
  for (let i = 0; i < 3; i += 1) liste.push(encadrement(o));
  for (let i = 0; i < 2; i += 1) liste.push(somme(o));
  return liste;
}

const BANQUES = { TROISIEME: troisieme };

export function serie(graine = Date.now(), niveau = 'TROISIEME') {
  const o = outils(graine);
  const banque = BANQUES[niveau] ?? BANQUES[CLASSES[0]];
  return o.melanger(banque(o));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges?.[cle] ?? `${m.consigne}-regle`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  // Les consignes.
  'racine-exacte': 'Quelle est la racine carrée de ce nombre ?',
  'carre-racine': 'Que vaut le carré de cette racine ?',
  encadrement: 'Entre quels entiers consécutifs se cache cette racine ?',
  'somme-racines': 'Calcule, en regardant bien ce qui est sous la racine.',

  // Les erreurs, chacune avec sa méthode.
  'racine-pas-moitie': 'La racine carrée n’est pas la moitié : c’est le nombre positif qui, multiplié par lui-même, redonne le nombre.',
  'racine-positive': 'Une racine carrée est toujours positive : on prend le nombre positif dont le carré donne le nombre.',
  'verifier-au-carre': 'Vérifie en élevant ta réponse au carré : tu dois retrouver exactement le nombre sous la racine.',
  'carre-de-racine': 'Le carré et la racine carrée se défont l’un l’autre : le carré de la racine d’un nombre positif, c’est ce nombre.',
  'carre-pas-double': 'Élever au carré, c’est multiplier un nombre par lui-même, pas par deux.',
  'encadrer-racines': 'Ces deux carrés encadrent le nombre ; la racine, elle, se trouve entre leurs racines.',
  'racine-somme': 'La racine d’une somme n’est pas la somme des racines : calcule d’abord ce qui est sous la racine, puis prends la racine.',
  'somme-racines-separees': 'Ici, chaque nombre a sa propre racine : calcule chaque racine séparément, puis ajoute-les.',
  'oublier-racine': 'Le signe racine ne s’efface pas : il faut calculer la racine carrée, pas garder le nombre.',

  // Les replis.
  'racine-exacte-regle': 'Cherche le nombre positif qui, multiplié par lui-même, donne le nombre sous la racine.',
  'carre-racine-regle': 'Le carré de la racine d’un nombre positif redonne ce nombre.',
  'encadrement-regle': 'Cherche les deux carrés parfaits consécutifs qui entourent le nombre, puis prends leurs racines.',
  'somme-racines-regle': 'Sous une même racine, on calcule d’abord ; avec deux racines, on calcule chacune.',
};
