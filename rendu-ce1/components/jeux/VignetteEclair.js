const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteEclair;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteEclair.js";
/**
 * L'APERÇU DES « MOTS ÉCLAIR », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Un éclair, et un mot qui passe.
 */
function VignetteEclair() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Un \xE9clair et le mot dans",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 9,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M30 4 12 34h13l-5 24 22-34H29z",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "54",
    y: "14",
    width: "70",
    height: "34",
    rx: "8",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "89",
    y: "38",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 18
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }, "dans"));
}