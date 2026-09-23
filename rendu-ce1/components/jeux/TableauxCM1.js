const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/tableauxCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/tableauxCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\TableauxCM1.js";
const capitale = mot => mot[0].toUpperCase() + mot.slice(1);

/** Le CM2 : une seule ligne de données, celle qu'il faut mettre en diagramme. */
function Donnees({
  m
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tableau__cadre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "tableau",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 11,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("caption", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12,
      columnNumber: 9
    }
  }, `${capitale(m.fruit)} vendues au marché`), /*#__PURE__*/React.createElement("thead", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("tr", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 11
    }
  }, regle.JOURS.map(j => /*#__PURE__*/React.createElement("th", {
    key: j,
    scope: "col",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 39
    }
  }, capitale(j))))), /*#__PURE__*/React.createElement("tbody", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("tr", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 11
    }
  }, m.valeurs.map((v, j) => /*#__PURE__*/React.createElement("td", {
    key: regle.JOURS[j],
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 40
    }
  }, v))))));
}

/** Un diagramme en barres : une barre par jour, graduée de 0 à 20. */
function Barres({
  valeurs
}) {
  const h = v => v * 4;
  return /*#__PURE__*/React.createElement("svg", {
    className: "tableau__barres",
    viewBox: "0 0 150 110",
    role: "img",
    "aria-label": `Un diagramme : ${valeurs.join(', ')}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 5
    }
  }, [0, 5, 10, 15, 20].map(g => /*#__PURE__*/React.createElement("g", {
    key: g,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: 22,
    y1: 95 - h(g),
    x2: 146,
    y2: 95 - h(g),
    className: "tableau__grille",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: 16,
    y: 99 - h(g),
    className: "tableau__graduation",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 11
    }
  }, g))), valeurs.map((v, j) => /*#__PURE__*/React.createElement("rect", {
    key: regle.JOURS[j],
    x: 30 + j * 30,
    y: 95 - h(v),
    width: 20,
    height: h(v),
    rx: 3,
    className: "tableau__barre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 36,
      columnNumber: 9
    }
  })), regle.JOURS.map((jour, j) => /*#__PURE__*/React.createElement("text", {
    key: jour,
    x: 40 + j * 30,
    y: 107,
    className: "tableau__jour",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 39,
      columnNumber: 9
    }
  }, jour.slice(0, 2))));
}

/** Le tableau à double entrée : les fruits en lignes, les jours en colonnes. */
function Tableau({
  m
}) {
  if (m.consigne === 'diagramme') return /*#__PURE__*/React.createElement(Donnees, {
    m: m,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 47,
      columnNumber: 42
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "tableau__cadre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "tableau",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 50,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("caption", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51,
      columnNumber: 9
    }
  }, "Fruits vendus au march\xE9"), /*#__PURE__*/React.createElement("thead", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 52,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("tr", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement("td", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54,
      columnNumber: 13
    }
  }), regle.JOURS.map(j => /*#__PURE__*/React.createElement("th", {
    key: j,
    scope: "col",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 55,
      columnNumber: 37
    }
  }, capitale(j))))), /*#__PURE__*/React.createElement("tbody", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 58,
      columnNumber: 9
    }
  }, regle.FRUITS.map((f, i) => /*#__PURE__*/React.createElement("tr", {
    key: f,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 60,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("th", {
    scope: "row",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 61,
      columnNumber: 15
    }
  }, capitale(f)), m.tableau[i].map((v, j) => /*#__PURE__*/React.createElement("td", {
    key: regle.JOURS[j],
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 62,
      columnNumber: 43
    }
  }, v)))))), /*#__PURE__*/React.createElement("p", {
    className: "phrase-a-trou",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 67,
      columnNumber: 7
    }
  }, m.question));
}

/**
 * LES TABLEAUX DU CM1 — le diagramme au CM1, à l'écran. Toute la règle vit
 * dans `tableauxCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'tableaux-cm1',
  classe: 'jeu--diagramme',
  rendreQuestion: m => /*#__PURE__*/React.createElement(Tableau, {
    m: m,
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80,
      columnNumber: 26
    }
  }),
  rendreChoix: (c, m) => m.consigne === 'diagramme' ? /*#__PURE__*/React.createElement(Barres, {
    valeurs: m.barres[c.cle],
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 81,
      columnNumber: 56
    }
  }) : c.libelle,
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'tableaux-cm2'
    }
  }
});