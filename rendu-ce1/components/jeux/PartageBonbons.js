const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PartageBonbons;
var partage = _interopRequireWildcard(require("../../lib/jeux/partageBonbons"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PartageBonbons.js";
/**
 * LE PARTAGE DES BONBONS, À L'ÉCRAN — le tas de bonbons, les assiettes des
 * amis ; une fois la réponse trouvée, les bonbons se rangent dans les
 * assiettes, et le reste reste à côté. Toute la règle vit dans
 * `partageBonbons.js`.
 */
const REGLE = {
  MANCHES: partage.MANCHES,
  serie: partage.serie,
  bilan: partage.bilan,
  consigne: () => _repliques.repliquesPartage.consigne,
  choix: m => m.choix.map(c => ({
    cle: c.cle,
    libelle: partage.ecrire(c)
  })),
  verdict: partage.verdict,
  erreur: (m, sens) => _repliques.repliquesPartage.erreur(sens),
  aide: () => _repliques.repliquesPartage.erreur('partage')
};
const COULEURS = ['#e63946', '#f4a261', '#2a9d8f', '#8d5bd6', '#e9c46a'];
function PartageBonbons(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--partage",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("div", {
      className: "partage",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "partage__enonce",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("strong", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 13
      }
    }, m.bonbons, " bonbons"), " pour ", /*#__PURE__*/React.createElement("strong", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 55
      }
    }, m.amis, " amis"), "."), !termine && /*#__PURE__*/React.createElement("div", {
      className: "partage__tas",
      role: "img",
      "aria-label": `${m.bonbons} bonbons`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 36,
        columnNumber: 13
      }
    }, Array.from({
      length: m.bonbons
    }, (_, i) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement(Bonbon, {
      key: i,
      couleur: COULEURS[i % COULEURS.length],
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 39,
        columnNumber: 17
      }
    }))), /*#__PURE__*/React.createElement("ul", {
      className: "partage__assiettes",
      "aria-label": `${m.amis} assiettes`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 43,
        columnNumber: 11
      }
    }, Array.from({
      length: m.amis
    }, (_, a) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement("li", {
      key: a,
      className: "partage__assiette",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 46,
        columnNumber: 15
      }
    }, termine && Array.from({
      length: m.bonne.q
    }, (_, i) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement(Bonbon, {
      key: i,
      couleur: COULEURS[(a + i) % COULEURS.length],
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 49,
        columnNumber: 19
      }
    }))))), termine && m.bonne.r > 0 && /*#__PURE__*/React.createElement("p", {
      className: "partage__reste",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 55,
        columnNumber: 13
      }
    }, "Il en reste ", m.bonne.r, " :", ' ', Array.from({
      length: m.bonne.r
    }, (_, i) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement(Bonbon, {
      key: i,
      couleur: COULEURS[i % COULEURS.length],
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 59,
        columnNumber: 17
      }
    })))),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 5
    }
  }));
}

/** Un bonbon emballé : un rond, deux papillotes. */
function Bonbon({
  couleur
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: "partage__bonbon",
    viewBox: "0 0 40 20",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 72,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4 L10 10 L2 16 Z",
    fill: couleur,
    opacity: "0.7",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 73,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M38 4 L30 10 L38 16 Z",
    fill: couleur,
    opacity: "0.7",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 74,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "10",
    r: "9",
    fill: couleur,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 75,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "17",
    cy: "7",
    r: "2.5",
    fill: "#fff",
    opacity: "0.6",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 76,
      columnNumber: 7
    }
  }));
}