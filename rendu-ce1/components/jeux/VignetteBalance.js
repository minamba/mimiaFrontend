const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteBalance;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteBalance.js";
/**
 * L'APERÇU DE « LA BALANCE », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Une balance qui penche du côté du petit objet — le
 * piège du jeu, en un dessin.
 */
function VignetteBalance() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Une balance qui penche du c\xF4t\xE9 du petit objet",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "66",
    y1: "12",
    x2: "66",
    y2: "56",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "26",
    y1: "8",
    x2: "106",
    y2: "20",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "26",
    x2: "40",
    y2: "26",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "92",
    y1: "38",
    x2: "116",
    y2: "38",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "28",
    cy: "16",
    r: "9",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "104",
    cy: "33",
    r: "4",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }));
}