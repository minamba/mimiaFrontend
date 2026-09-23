const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteDeux;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteDeux.js";
/**
 * L'APERÇU DE « DEUX PAR DEUX », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Deux assiettes : l'une avec ses biscuits, l'autre sous
 * sa cloche — la question du jeu, en un dessin.
 */
function VignetteDeux() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Deux assiettes, l'une avec trois biscuits, l'autre sous une cloche",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ellipse", {
    cx: "34",
    cy: "46",
    rx: "28",
    ry: "10",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), [22, 34, 46].map(x => /*#__PURE__*/React.createElement("circle", {
    key: x,
    cx: x,
    cy: "42",
    r: "5",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 32
    }
  })), /*#__PURE__*/React.createElement("ellipse", {
    cx: "98",
    cy: "46",
    rx: "28",
    ry: "10",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M72 46 Q72 14 98 14 Q124 14 124 46 Z",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "98",
    cy: "11",
    r: "3",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 7
    }
  }));
}