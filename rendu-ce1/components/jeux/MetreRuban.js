const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MetreRuban;
var ruban = _interopRequireWildcard(require("../../lib/jeux/metreRuban"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _MesuresCM = _interopRequireDefault(require("./MesuresCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\MetreRuban.js";
/**
 * LE MÈTRE RUBAN, À L'ÉCRAN — la longueur à convertir sur un ruban dessiné,
 * trois réponses. Toute la règle vit dans `metreRuban.js`.
 */
const REGLE = {
  MANCHES: ruban.MANCHES,
  serie: ruban.serie,
  bilan: ruban.bilan,
  consigne: () => _repliques.repliquesRuban.consigne,
  choix: m => m.choix.map(n => ({
    cle: n,
    libelle: `${ruban.ecrire(n)} ${m.unite}`
  })),
  verdict: ruban.verdict,
  erreur: (m, sens) => _repliques.repliquesRuban.erreur(sens),
  aide: m => _repliques.repliquesRuban.erreur(m.relation)
};
function MetreRubanAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--ruban",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("div", {
      className: "ruban",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 28,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("svg", {
      className: "ruban__dessin",
      viewBox: "0 0 300 40",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 29,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: "0",
      y: "8",
      width: "300",
      height: "24",
      rx: "4",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 13
      }
    }), Array.from({
      length: 31
    }, (_, i) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement("line", {
      key: i,
      x1: i * 10,
      y1: "8",
      x2: i * 10,
      y2: i % 5 === 0 ? 22 : 16,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 15
      }
    }))), /*#__PURE__*/React.createElement("p", {
      className: "ruban__question",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 36,
        columnNumber: 11
      }
    }, termine ? m.question.replace('?', ruban.ecrire(m.bonne)) : m.question.replace(/\d{4,}/g, x => ruban.ecrire(Number(x))))),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 5
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `MesuresCM1.js` ; il lit la classe. */
function MetreRuban({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_MesuresCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(MetreRubanAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 93
    }
  }));
}