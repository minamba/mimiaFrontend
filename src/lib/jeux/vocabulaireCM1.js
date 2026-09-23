/**
 * LE VOCABULAIRE DU CM1 — contraires et jumeaux au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_FAMILLES      — « Utiliser les familles de mots, les préfixes
 *                               et les suffixes »
 *   FR_CM1_LANG_VOC_SYNONYMES — « Employer synonymes et antonymes à bon escient »
 *
 * TROIS SORTES DE MANCHES :
 *   - LE PRÉFIXE CONTRAIRE (3) : possible → impossible. Le piège : la mauvaise
 *     lettre (inpossible) — devant p, b, m, « in » devient « im » ; devant l,
 *     « il » ; devant r, « ir » ;
 *   - LE SUFFIXE -MENT (2) : lent → lentement. Le piège : le masculin
 *     (lentment) — on part du féminin ; et le nom de la famille (lenteur) ;
 *   - LE SYNONYME (3) : content → joyeux. Pièges : le CONTRAIRE, et un mot de
 *     la même FAMILLE qui ne veut pas dire la même chose.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [mot, bon contraire, contraire mal écrit]. */
export const PREFIXES = [
  ['possible', 'impossible', 'inpossible'],
  ['poli', 'impoli', 'inpoli'],
  ['patient', 'impatient', 'inpatient'],
  ['buvable', 'imbuvable', 'inbuvable'],
  ['lisible', 'illisible', 'inlisible'],
  ['légal', 'illégal', 'inlégal'],
  ['régulier', 'irrégulier', 'inrégulier'],
  ['réel', 'irréel', 'inréel'],
  ['visible', 'invisible', 'imvisible'],
  ['connu', 'inconnu', 'imconnu'],
];

/** [adjectif, adverbe, adverbe tiré du masculin, nom de la famille]. */
export const SUFFIXES = [
  ['lent', 'lentement', 'lentment', 'lenteur'],
  ['doux', 'doucement', 'douxment', 'douceur'],
  ['heureux', 'heureusement', 'heureuxment', 'bonheur'],
  ['joyeux', 'joyeusement', 'joyeuxment', 'joie'],
  ['léger', 'légèrement', 'légerment', 'légèreté'],
  ['fier', 'fièrement', 'fierment', 'fierté'],
  ['sérieux', 'sérieusement', 'sérieuxment', 'sérieux'],
];

/** [mot, synonyme, contraire, même famille]. */
export const SYNONYMES = [
  ['content', 'joyeux', 'triste', 'contentement'],
  ['grand', 'immense', 'petit', 'grandir'],
  ['commencer', 'débuter', 'finir', 'commencement'],
  ['crier', 'hurler', 'chuchoter', 'cri'],
  ['beau', 'joli', 'laid', 'beauté'],
  ['peur', 'frayeur', 'courage', 'peureux'],
  ['rapide', 'vif', 'lent', 'rapidement'],
  ['triste', 'malheureux', 'gai', 'tristesse'],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const liste = [];
  melanger(PREFIXES).slice(0, 3).forEach(([mot, bonne, faux]) => {
    // Le troisième choix : un autre préfixe de contraire, qui ne donne pas un vrai mot.
    const leurre = `dé${mot}`;
    liste.push({
      consigne: 'prefixe', question: `Le contraire de « ${mot} »`, bonne,
      choix: melanger([bonne, faux, leurre]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [faux]: 'prefixe-lettre', [leurre]: 'prefixe-autre' },
    });
  });
  // « sérieux » : le nom et l'adjectif s'écrivent pareil, on ne le propose pas en piège de famille.
  melanger(SUFFIXES.filter((s) => s[0] !== s[3])).slice(0, 2).forEach(([mot, bonne, faux, nom]) => {
    liste.push({
      consigne: 'suffixe', question: `« ${mot} » → un mot en -ment`, bonne,
      choix: melanger([bonne, faux, nom]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [faux]: 'suffixe-feminin', [nom]: 'suffixe-nom' },
    });
  });
  melanger(SYNONYMES).slice(0, 3).forEach(([mot, bonne, contraire, famille]) => {
    liste.push({
      consigne: 'synonyme', question: `Un synonyme de « ${mot} »`, bonne,
      choix: melanger([bonne, contraire, famille]).map((c) => ({ cle: c, libelle: c })),
      pieges: { [contraire]: 'synonyme-contraire', [famille]: 'synonyme-famille' },
    });
  });
  return melanger(liste);
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges[cle];
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  prefixe: 'Forme le contraire de ce mot avec un préfixe.',
  suffixe: 'Transforme ce mot en un mot qui finit par ment.',
  synonyme: 'Trouve le mot qui veut dire la même chose.',
  'prefixe-lettre': 'Le préfixe change selon la lettre qui suit : devant p, b ou m, on écrit i m ; devant l, i l ; devant r, i r.',
  'prefixe-autre': 'Ce préfixe-là ne donne pas un vrai mot. Pour dire le contraire, on utilise ici in, ou l’une de ses formes.',
  'suffixe-feminin': 'On part du féminin de l’adjectif, puis on ajoute ment : lente, lentement.',
  'suffixe-nom': 'Ce mot est un nom de la même famille. On cherche un mot qui finit par ment.',
  'synonyme-contraire': 'C’est le contraire ! Un synonyme veut dire la même chose.',
  'synonyme-famille': 'Ce mot est de la même famille, mais il ne veut pas dire la même chose. Un synonyme peut prendre sa place dans la phrase.',
};
