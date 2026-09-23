const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TypesDePhrases;
var types = _interopRequireWildcard(require("../../lib/jeux/typesDePhrases"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\TypesDePhrases.js";
/**
 * RACONTE, QUESTION OU ORDRE ?, À L'ÉCRAN — la phrase sans son signe de fin,
 * les trois types, et le signe qui apparaît une fois la réponse trouvée.
 * Toute la règle vit dans `typesDePhrases.js`.
 */
const REGLE = {
  MANCHES: types.MANCHES,
  serie: types.serie,
  bilan: types.bilan,
  consigne: () => _repliques.repliquesTypes.consigne,
  choix: () => types.TYPES.map(({
    cle,
    libelle
  }) => ({
    cle,
    libelle
  })),
  verdict: types.verdict,
  erreur: (p, bon) => _repliques.repliquesTypes.indice(bon),
  aide: p => _repliques.repliquesTypes.indice(p.type)
};
function TypesDePhrases(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--types",
    rendreQuestion: (p, termine) => /*#__PURE__*/React.createElement("p", {
      className: "phrase-a-trou",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 28,
        columnNumber: 9
      }
    }, p.texte, /*#__PURE__*/React.createElement("span", {
      className: `phrase-a-trou__trou phrase-a-trou__trou--signe${termine ? ' est-rempli' : ''}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 11
      }
    }, termine ? types.signe(p) : '…')),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 5
    }
  }));
}