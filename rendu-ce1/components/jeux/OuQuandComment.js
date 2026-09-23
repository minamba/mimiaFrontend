const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = OuQuandComment;
var oqc = _interopRequireWildcard(require("../../lib/jeux/ouQuandComment"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _ComplementsCM = _interopRequireDefault(require("./ComplementsCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\OuQuandComment.js";
/**
 * OÙ, QUAND, COMMENT ?, À L'ÉCRAN — la phrase, le groupe surligné, trois
 * questions. Toute la règle vit dans `ouQuandComment.js`.
 */
const REGLE = {
  MANCHES: oqc.MANCHES,
  serie: oqc.serie,
  bilan: oqc.bilan,
  consigne: () => _repliques.repliquesComplements.consigne,
  choix: () => oqc.QUESTIONS.map(({
    cle,
    libelle
  }) => ({
    cle,
    libelle
  })),
  verdict: oqc.verdict,
  erreur: (p, type) => _repliques.repliquesComplements.indice(type),
  aide: p => _repliques.repliquesComplements.indice(p.type)
};
function OuQuandCommentAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--complements",
    rendreQuestion: (p, termine) => /*#__PURE__*/React.createElement("p", {
      className: "phrase-a-trou",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 28,
        columnNumber: 9
      }
    }, p.avant, p.avant && ' ', /*#__PURE__*/React.createElement("mark", {
      className: `complement${termine ? ` complement--${p.type}` : ''}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 11
      }
    }, p.groupe), p.apres.startsWith(',') || p.apres === '.' ? '' : ' ', p.apres),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 5
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `ComplementsCM1.js` ; il lit la classe. */
function OuQuandComment({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_ComplementsCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(OuQuandCommentAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 97
    }
  }));
}