const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LE CRIBLE — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_NUM_MULTIPLES — « Reconnaître les multiples de 2, de 5 et de 10 »
 *
 * TROIS NOMBRES, UN SEUL PASSE AU CRIBLE. Au CM1, trois critères, et tous
 * regardent le DERNIER CHIFFRE :
 *   - multiple de 2 : il est pair ;
 *   - multiple de 5 : il vaut 0 ou 5 ;
 *   - multiple de 10 : il vaut 0. LE PIÈGE : un nombre qui finit par 5.
 * Deux manches de plus sur les tables (6, 7, 8) : là, le dernier chiffre ne
 * suffit plus, on cherche dans la table. Les critères par 3 et par 9 ne sont
 * pas au programme du CM1.
 */

const MANCHES = exports.MANCHES = 8;
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];

  /** Un nombre qui passe, et deux qui ne passent pas — tirés par `faux`. */
  const manche = (consigne, bon, faux) => {
    const bonne = bon();
    const leurres = new Map();
    while (leurres.size < 2) {
      const [n, sens] = faux();
      if (n !== bonne && !leurres.has(n)) leurres.set(n, sens);
    }
    liste.push({
      consigne,
      question: consigne.startsWith('table') ? `Un multiple de ${consigne.slice(5)} ?` : `Un multiple de ${consigne.slice(3)} ?`,
      bonne,
      choix: melanger([bonne, ...leurres.keys()]).map(c => ({
        cle: c,
        libelle: String(c)
      })),
      pieges: Object.fromEntries(leurres)
    });
  };
  [0, 1].forEach(() => manche('par2', () => 2 * entre(20, 240), () => [2 * entre(20, 240) + 1, 'par2-regle']));
  [0, 1].forEach(() => manche('par5', () => 5 * entre(10, 90), () => [10 * entre(5, 40) + entre(1, 4), 'par5-regle']));
  [0, 1].forEach(() => manche('par10', () => 10 * entre(5, 60), () => entre(0, 1) ? [10 * entre(5, 60) + 5, 'par10-cinq'] : [10 * entre(5, 60) + entre(1, 4), 'par10-regle']));
  [6, 7, 8].slice(entre(0, 1)).slice(0, 2).forEach(t => manche(`table${t}`, () => t * entre(4, 12), () => [t * entre(4, 12) + (entre(0, 1) ? 1 : -1) * entre(1, 2), 'table-regle']));
  return melanger(liste);
}
function verdict(m, c) {
  if (Number(c) === m.bonne) return 'juste';
  return m.pieges[c];
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  par2: 'Lequel de ces nombres est un multiple de deux ?',
  par5: 'Lequel de ces nombres est un multiple de cinq ?',
  par10: 'Lequel de ces nombres est un multiple de dix ?',
  table6: 'Lequel de ces nombres est un multiple de six ?',
  table7: 'Lequel de ces nombres est un multiple de sept ?',
  table8: 'Lequel de ces nombres est un multiple de huit ?',
  'par2-regle': 'Un multiple de deux finit par un chiffre pair : zéro, deux, quatre, six ou huit.',
  'par5-regle': 'Un multiple de cinq finit par zéro ou par cinq.',
  'par10-cinq': 'Un multiple de dix finit par zéro. Cinq, ça ne suffit pas : c’est un multiple de cinq.',
  'par10-regle': 'Un multiple de dix finit par zéro.',
  'table-regle': 'Cherche dans la table : ce nombre tombe-t-il juste, sans reste ?'
};