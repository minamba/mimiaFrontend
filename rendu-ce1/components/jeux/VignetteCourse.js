const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteCourse;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteCourse.js";
/**
 * L'APERÇU DE « LA COURSE DES TABLES », sur sa carte de la ludothèque : une
 * piste, une voiture, et un calcul.
 */
function VignetteCourse() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Une piste de course et le calcul 3 fois 4",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "42",
    width: "120",
    height: "10",
    rx: "5",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "6",
    y: "42",
    width: "54",
    height: "10",
    rx: "5",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "60",
    cy: "47",
    r: "7",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "66",
    y: "28",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 18
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }, "3 \xD7 4"));
}