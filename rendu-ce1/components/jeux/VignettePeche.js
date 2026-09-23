const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignettePeche;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignettePeche.js";
/**
 * L'APERÇU DE « LA PÊCHE AUX SONS », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Deux poissons, une ligne de pêche, et la lettre du
 * son — la situation du jeu.
 */
function VignettePeche() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Deux poissons, une ligne de p\xEAche, et la lettre ou",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "36",
    cy: "44",
    rx: "18",
    ry: "11",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M52 44 L62 36 L62 52 Z",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "88",
    cy: "44",
    rx: "18",
    ry: "11",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M104 44 L114 36 L114 52 Z",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "36",
    y1: "4",
    x2: "36",
    y2: "33",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "96",
    y: "22",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 18
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }, "ou"));
}