/**
 * À QUI RENVOIE LE PRONOM ? — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LECT_REPRISES — « Identifier à qui renvoient les pronoms et les
 *                          reprises »
 *
 * DEUX PHRASES, UN MOT MIS EN VALEUR : « il », « elle », « l' », « le
 * vieil homme »… À qui renvoie-t-il ? Les textes sont écrits pour le jeu. Les
 * pièges : le PREMIER nom venu, et le nom LE PLUS PROCHE — les deux réflexes
 * d'un lecteur pressé. L'erreur donne la méthode : remplacer le mot par
 * chacun des noms, et garder celui qui a du sens.
 */

import { bilan as bilanCommun, outils } from './outils.js';

export const MANCHES = 8;

/** [texte avec le mot entre crochets, bonne réponse, deux autres noms du texte]. */
export const TEXTES = [
  ['Le renard aperçut le corbeau sur sa branche. [Il] tenait un fromage dans son bec.', 'le corbeau', ['le renard', 'le fromage']],
  ['Léa a prêté son vélo à Tom. [Elle] lui a demandé d’en prendre soin.', 'Léa', ['Tom', 'le vélo']],
  ['Le chat guettait la souris. Soudain, [il] bondit hors de sa cachette.', 'le chat', ['la souris', 'la cachette']],
  ['Maman a acheté une tarte. Nous [l’] avons mangée au dessert.', 'la tarte', ['maman', 'le dessert']],
  ['Le capitaine regarda la mer déchaînée. [Le vieux marin] n’avait jamais vu une telle tempête.', 'le capitaine', ['la mer', 'la tempête']],
  ['Paul a perdu ses clés dans le jardin. Il [les] a cherchées jusqu’au soir.', 'les clés', ['Paul', 'le jardin']],
  ['La maîtresse félicita Inès. [Cette élève] avait fait de gros progrès.', 'Inès', ['la maîtresse', 'les progrès']],
  ['Le chien de Julie aboie quand le facteur passe. [Il] n’aime pas les inconnus.', 'le chien', ['le facteur', 'Julie']],
  ['Hugo a écrit une lettre à sa grand-mère. [Elle] la lira demain matin.', 'la grand-mère', ['la lettre', 'Hugo']],
  ['Le lion s’approcha de la rivière. [Le roi des animaux] avait soif.', 'le lion', ['la rivière', 'les animaux']],
];

/** « … [Il] tenait … » → ['…', 'Il', 'tenait …']. */
export const decouper = (texte) => {
  const [avant, reste] = texte.split('[');
  const [mot, apres] = reste.split(']');
  return [avant, mot, apres];
};

export function serie(graine = Date.now()) {
  const { melanger } = outils(graine);
  return melanger(TEXTES).slice(0, MANCHES).map(([texte, bonne, autres]) => ({
    consigne: 'reprise',
    texte,
    question: texte.replace(/[[\]]/g, ''),
    bonne,
    choix: melanger([bonne, ...autres]).map((c) => ({ cle: c, libelle: c })),
  }));
}

export function verdict(m, cle) {
  return cle === m.bonne ? 'juste' : 'remplacer';
}

export const bilan = (n) => bilanCommun(n, MANCHES);

export const PHRASES = {
  reprise: 'À qui, ou à quoi, renvoie le mot en couleur ?',
  remplacer: 'Remplace le mot en couleur par ce nom, et relis la phrase : a-t-elle encore du sens ? Essaie les autres noms.',
};
