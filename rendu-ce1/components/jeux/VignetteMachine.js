const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteMachine;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteMachine.js";
/**
 * L'APERÇU DE « LA MACHINE À DIX », sur sa carte de la ludothèque : un 7
 * entre, un 70 sort.
 */
function VignetteMachine() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Une machine : 7 entre, 70 sort",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 7,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("text", {
    x: "16",
    y: "38",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 18
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 7
    }
  }, "7"), /*#__PURE__*/React.createElement("rect", {
    x: "34",
    y: "12",
    width: "56",
    height: "38",
    rx: "8",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: "62",
    y: "37",
    textAnchor: "middle",
    className: "jeu-vignette__chiffre",
    style: {
      fontSize: 15,
      fill: '#fff'
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }, "\xD7 10"), /*#__PURE__*/React.createElement("text", {
    x: "114",
    y: "38",
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
  }, "70"));
}