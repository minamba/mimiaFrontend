const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignettePizza;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignettePizza.js";
/**
 * L'APERÇU DES « PARTS DE PIZZA », sur sa carte de la ludothèque : une pizza
 * coupée en quatre, trois parts garnies, et la fraction 3/4.
 */
function VignettePizza() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Une pizza en quatre parts, trois garnies : trois quarts",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "34",
    cy: "31",
    r: "25",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M34 31 L34 6 A25 25 0 1 1 9 31 Z",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "94",
    y: "26",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 18
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }, "3"), /*#__PURE__*/React.createElement("line", {
    x1: "84",
    y1: "31",
    x2: "104",
    y2: "31",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "94",
    y: "50",
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
  }, "4"));
}