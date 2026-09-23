const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TransformerPhrase;
var negation = _interopRequireWildcard(require("../../lib/jeux/phraseQuiDitNon"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\TransformerPhrase.js";
/**
 * TRANSFORMER UNE PHRASE — la phrase qui dit non, au CE2, à l'écran. La
 * phrase de départ, la forme demandée, trois transformations. Toute la règle
 * vit dans `phraseQuiDitNon.js`, section « le CE2 » ; l'écran est celui des
 * jeux à choix.
 */
const REGLE = {
  MANCHES: 9,
  serie: negation.serieCE2,
  bilan: n => negation.bilan(n, 9),
  consigne: m => _repliques.repliquesNegation.consigneCE2(m.forme),
  choix: m => m.choix.map(c => ({
    cle: c.texte,
    libelle: c.texte
  })),
  verdict: (m, texte) => {
    var _m$choix$find$faute;
    return (_m$choix$find$faute = m.choix.find(c => c.texte === texte).faute) !== null && _m$choix$find$faute !== void 0 ? _m$choix$find$faute : 'juste';
  },
  erreur: (m, faute) => _repliques.repliquesNegation.erreurCE2(faute),
  aide: () => null
};
const NOMS = {
  negative: 'négative',
  interrogative: 'interrogative',
  exclamative: 'exclamative'
};
function TransformerPhrase(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--non jeu--transformer",
    rendreQuestion: m => /*#__PURE__*/React.createElement("p", {
      className: "non__oui",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "non__marque",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 11
      }
    }, NOMS[m.forme]), " ", negation.phrase(m.phrase).mots.join(' ')),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 5
    }
  }));
}