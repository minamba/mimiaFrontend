const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var gn = _interopRequireWildcard(require("./grandsNombres.js"));
var _outils = require("./outils.js");
/**
 * LES GRANDS NOMBRES DU CM2 — le coffre des centaines au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_NUM_ENTIERS — « Lire, écrire et comparer les nombres entiers »
 *
 * LIRE ET ÉCRIRE comme au CM1 (quatre manches, prises à `grandsNombres.js`),
 * puis COMPARER (quatre manches) : lequel est le plus grand ? Deux pièges :
 *   - LE PREMIER CHIFFRE : 980 500 semble plus grand que 1 204 000, parce
 *     qu'il commence par 9. On compte d'abord les chiffres ;
 *   - LA CLASSE D'À CÔTÉ : à longueur égale, on compare chiffre par chiffre
 *     en partant de la gauche, pas le dernier.
 */

const MANCHES = exports.MANCHES = 8;
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const lire = gn.serie(graine).slice(0, 4);
  const comparer = [];
  while (comparer.length < 4) {
    // Le plus grand : sept chiffres, qui commence petit.
    const bonne = entre(1, 3) * 1000000 + entre(0, 999) * 1000 + entre(0, 999);
    // Six chiffres, qui commence par 9 : le piège du premier chiffre.
    const long = 900000 + entre(0, 99999);
    // Sept chiffres aussi, mais un chiffre plus petit dans la classe des mille.
    const mille = Math.floor(bonne / 1000) % 1000;
    const voisin = mille >= 100 ? bonne - 100000 : null;
    if (voisin !== null && voisin !== long) {
      comparer.push({
        consigne: 'comparer',
        question: 'Lequel est le plus grand ?',
        bonne,
        choix: melanger([bonne, long, voisin]).map(c => ({
          cle: c,
          libelle: gn.enChiffres(c)
        })),
        pieges: {
          [long]: 'premier-chiffre',
          [voisin]: 'chiffre-a-chiffre'
        }
      });
    }
  }
  return melanger([...lire, ...comparer]);
}
function verdict(m, cle) {
  if (m.consigne !== 'comparer') return gn.verdict(m, cle);
  if (Number(cle) === m.bonne) return 'juste';
  return m.pieges[cle];
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  ...gn.PHRASES,
  comparer: 'Lequel de ces nombres est le plus grand ?',
  'premier-chiffre': 'Compte d’abord les chiffres : le nombre qui en a le plus est le plus grand, même s’il commence petit.',
  'chiffre-a-chiffre': 'Ils ont autant de chiffres : compare-les un par un, en partant de la gauche.'
};