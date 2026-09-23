/**
 * COMPLÉMENT DU VERBE OU COMPLÉMENT DE PHRASE — où, quand, comment au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_COMPL_PHRASE — « Distinguer les compléments du verbe des
 *                               compléments de phrase »
 *
 * UN GROUPE SURLIGNÉ, DEUX RÉPONSES. Le test : le complément de phrase se
 * DÉPLACE et se SUPPRIME ; le complément du verbe, non. LE PIÈGE DU CM2 :
 * « Il va [à Paris] » dit un lieu, mais on ne peut pas l'enlever — c'est un
 * complément du verbe ; « Il travaille [à Paris] », si.
 * La phrase est dessinée comme au CM1 (`ComplementsCM1.js`).
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [phrase avec le groupe entre crochets, verbe ou phrase, le lieu qui trompe]. */
export const PHRASES_A_ANALYSER = [
  ['Léa mange [une pomme].', 'verbe', false],
  ['Tom parle [à sa sœur].', 'verbe', false],
  ['Nous pensons [à nos vacances].', 'verbe', false],
  ['Il va [à Paris].', 'verbe', true],
  ['Elle habite [à Lyon].', 'verbe', true],
  ['[Chaque matin], Léa mange une pomme.', 'phrase', false],
  ['Tom parle [dans la cour].', 'phrase', false],
  ['Il travaille [à Paris].', 'phrase', false],
  ['[Pendant les vacances], nous lisons beaucoup.', 'phrase', false],
  ['Le chat dort [sur le canapé].', 'phrase', false],
];

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  const verbe = melanger(PHRASES_A_ANALYSER.filter(([, f]) => f === 'verbe')).slice(0, 4);
  const phrase = melanger(PHRASES_A_ANALYSER.filter(([, f]) => f === 'phrase')).slice(0, 4);
  return melanger([...verbe, ...phrase]).map(([texte, fonction, lieu]) => ({
    consigne: 'fonction',
    phrase: texte,
    question: texte.replace(/[[\]]/g, ''),
    bonne: fonction,
    lieu,
    choix: [{ cle: 'verbe', libelle: 'Complément du verbe' }, { cle: 'phrase', libelle: 'Complément de phrase' }],
  }));
}

export function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  if (m.lieu) return 'regle-lieu';
  return `regle-${m.bonne}`;
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  fonction: 'Ce groupe complète-t-il le verbe, ou toute la phrase ? Essaie de le déplacer, puis de l’enlever.',
  'regle-verbe': 'Si on l’enlève, la phrase perd son sens, et on ne peut pas le déplacer : c’est un complément du verbe.',
  'regle-phrase': 'On peut le déplacer en tête de phrase, ou l’enlever : la phrase tient toujours. C’est un complément de phrase.',
  'regle-lieu': 'Il dit un lieu, mais essaie de l’enlever : la phrase ne tient plus. C’est le verbe qui en a besoin : complément du verbe.',
};
