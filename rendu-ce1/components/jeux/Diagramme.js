const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Diagramme;
var diag = _interopRequireWildcard(require("../../lib/jeux/diagramme"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _TableauxCM = _interopRequireDefault(require("./TableauxCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Diagramme.js";
/**
 * LE DIAGRAMME, À L'ÉCRAN — un diagramme en barres dessiné, sa question, trois
 * réponses. Toute la règle vit dans `diagramme.js`.
 *
 * LES VALEURS NE SONT PAS ÉCRITES SUR LES BARRES : les lire sur l'axe est la
 * compétence. Elles apparaissent une fois la réponse trouvée.
 */
const REGLE = {
  MANCHES: diag.MANCHES,
  serie: diag.serie,
  bilan: diag.bilan,
  consigne: () => _repliques.repliquesDiagramme.consigne,
  choix: m => m.choix.map(c => ({
    cle: c,
    libelle: String(c)
  })),
  verdict: diag.verdict,
  erreur: (m, sens) => _repliques.repliquesDiagramme.erreur(sens),
  aide: () => null
};
function DiagrammeAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--diagramme",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("div", {
      className: "diagramme",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement(Barres, {
      m: m,
      termine: termine,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 11
      }
    }), /*#__PURE__*/React.createElement("p", {
      className: "diagramme__question",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 11
      }
    }, m.question)),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 5
    }
  }));
}
const COULEURS = ['#e76f51', '#f4a261', '#2a9d8f', '#5b6bd6'];
function Barres({
  m,
  termine
}) {
  const haut = 14;
  const y = v => 150 - v / haut * 130;
  return /*#__PURE__*/React.createElement("svg", {
    className: "diagramme__dessin",
    viewBox: "0 0 280 190",
    role: "img",
    "aria-label": m.titre,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 46,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("text", {
    x: "150",
    y: "12",
    textAnchor: "middle",
    className: "diagramme__titre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 47,
      columnNumber: 7
    }
  }, m.titre), Array.from({
    length: haut / 2 + 1
  }, (_, k) => {
    const v = k * 2;
    return /*#__PURE__*/React.createElement("g", {
      key: v,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 51,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("line", {
      x1: "34",
      y1: y(v),
      x2: "270",
      y2: y(v),
      className: "diagramme__grille",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 52,
        columnNumber: 13
      }
    }), /*#__PURE__*/React.createElement("text", {
      x: "28",
      y: y(v) + 4,
      textAnchor: "end",
      className: "diagramme__graduation",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 53,
        columnNumber: 13
      }
    }, v));
  }), m.valeurs.map((v, i) => {
    const x = 50 + i * 56;
    return /*#__PURE__*/React.createElement("g", {
      key: m.noms[i],
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 60,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: x,
      y: y(v),
      width: "36",
      height: 150 - y(v),
      rx: "3",
      fill: COULEURS[i],
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 61,
        columnNumber: 13
      }
    }), /*#__PURE__*/React.createElement("text", {
      x: x + 18,
      y: "166",
      textAnchor: "middle",
      className: "diagramme__nom",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 62,
        columnNumber: 13
      }
    }, m.noms[i]), termine && /*#__PURE__*/React.createElement("text", {
      x: x + 18,
      y: y(v) - 4,
      textAnchor: "middle",
      className: "diagramme__valeur",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 63,
        columnNumber: 25
      }
    }, v));
  }), /*#__PURE__*/React.createElement("line", {
    x1: "34",
    y1: "150",
    x2: "270",
    y2: "150",
    className: "diagramme__axe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 67,
      columnNumber: 7
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `TableauxCM1.js` ; il lit la classe. */
function Diagramme({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_TableauxCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 74,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(DiagrammeAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 74,
      columnNumber: 94
    }
  }));
}