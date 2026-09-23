const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Bouteilles;
var b = _interopRequireWildcard(require("../../lib/jeux/bouteilles"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Bouteilles.js";
/**
 * LES BOUTEILLES, À L'ÉCRAN — une conversion, trois récipients à comparer, ou
 * des verres à remplir. Toute la règle vit dans `bouteilles.js`.
 *
 * À LA COMPARAISON, LES RÉCIPIENTS ONT TOUS LA MÊME TAILLE : dessinés à leur
 * contenance, ils donneraient la réponse sans lire les étiquettes.
 */
const REGLE = {
  MANCHES: b.MANCHES,
  serie: b.serie,
  bilan: b.bilan,
  consigne: m => _repliques.repliquesBouteilles.consigne(m.mode),
  choix: m => m.choix.map(c => ({
    cle: c,
    libelle: m.mode === 'comparer' ? b.avecArticle(c) : `${c} ${m.unite === 'verres' ? 'verres' : m.unite}`
  })),
  verdict: b.verdict,
  erreur: (m, sens) => _repliques.repliquesBouteilles.erreur(sens),
  aide: () => _repliques.repliquesBouteilles.erreur('litre')
};
function Bouteilles(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--bouteilles",
    rendreQuestion: (m, termine) => {
      if (m.mode === 'comparer') {
        return /*#__PURE__*/React.createElement("ul", {
          className: "bouteilles__rangee",
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 35,
            columnNumber: 13
          }
        }, m.recipients.map(r => /*#__PURE__*/React.createElement("li", {
          key: r.nom,
          className: `bouteilles__recipient${termine && r.nom === m.bonne ? ' est-bon' : ''}`,
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 37,
            columnNumber: 17
          }
        }, /*#__PURE__*/React.createElement(Bouteille, {
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 38,
            columnNumber: 19
          }
        }), /*#__PURE__*/React.createElement("span", {
          className: "bouteilles__nom",
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 39,
            columnNumber: 19
          }
        }, r.nom), /*#__PURE__*/React.createElement("span", {
          className: "bouteilles__etiquette",
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 40,
            columnNumber: 19
          }
        }, b.ecrire(r.cl)), termine && /*#__PURE__*/React.createElement("span", {
          className: "bouteilles__cl",
          __self: this,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 41,
            columnNumber: 31
          }
        }, "= ", r.cl, " cL"))));
      }
      return /*#__PURE__*/React.createElement("p", {
        className: "bouteilles__question",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 48,
          columnNumber: 11
        }
      }, !termine && m.question, termine && m.mode === 'remplir' && `${m.bonne} verres de ${m.verre} cL remplissent ${b.ecrire(m.bouteille)}.`, termine && m.mode !== 'remplir' && m.question.replace('?', String(m.bonne)));
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 5
    }
  }));
}

/** Une bouteille dessinée, toujours de la même taille. */
function Bouteille() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "bouteilles__dessin",
    viewBox: "0 0 40 80",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 62,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "15",
    y: "2",
    width: "10",
    height: "10",
    rx: "2",
    className: "bouteilles__bouchon",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 63,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 12 h12 v8 q10 6 10 18 v34 q0 6 -6 6 h-20 q-6 0 -6 -6 v-34 q0 -12 10 -18 z",
    className: "bouteilles__verre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 64,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 44 h28 v28 q0 6 -6 6 h-16 q-6 0 -6 -6 z",
    className: "bouteilles__eau",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 65,
      columnNumber: 7
    }
  }));
}