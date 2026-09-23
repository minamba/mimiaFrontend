const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteSyllabes;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteSyllabes.js";
/**
 * L'APERÇU DE « L'ATELIER DES SYLLABES », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Deux wagons pleins, un vide — la situation du jeu.
 */
function VignetteSyllabes() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Un train de trois wagons : ra, di, et un wagon vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 9,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "18",
    width: "36",
    height: "28",
    rx: "6",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "48",
    y: "18",
    width: "36",
    height: "28",
    rx: "6",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "90",
    y: "18",
    width: "36",
    height: "28",
    rx: "6",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "50",
    r: "5",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "32",
    cy: "50",
    r: "5",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "58",
    cy: "50",
    r: "5",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "74",
    cy: "50",
    r: "5",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "100",
    cy: "50",
    r: "5",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "116",
    cy: "50",
    r: "5",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "24",
    y: "38",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 15,
      fill: '#fff'
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 7
    }
  }, "ra"), /*#__PURE__*/React.createElement("text", {
    x: "66",
    y: "38",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 15,
      fill: '#fff'
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25,
      columnNumber: 7
    }
  }, "di"));
}