const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteUnOuDes;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteUnOuDes.js";
/**
 * L'APERÇU DE « UN OU DES ? », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Un rond seul, trois ronds, et le s du pluriel.
 */
function VignetteUnOuDes() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Un objet seul, et trois objets avec un s",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 9,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "22",
    cy: "31",
    r: "11",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "44",
    y1: "10",
    x2: "44",
    y2: "52",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "62",
    cy: "22",
    r: "9",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "84",
    cy: "22",
    r: "9",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "73",
    cy: "42",
    r: "9",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "112",
    y: "42",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 26
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 7
    }
  }, "s"));
}