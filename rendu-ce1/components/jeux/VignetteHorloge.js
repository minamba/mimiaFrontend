const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignetteHorloge;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignetteHorloge.js";
/**
 * L'APERÇU DE « L'HORLOGE », sur sa carte de la ludothèque.
 *
 * Même règle que les autres vignettes : c'est la seule chose de la carte
 * qu'un CP puisse lire. Un cadran qui montre 3 heures : la petite aiguille sur
 * le 3, la grande sur le 12.
 */
function VignetteHorloge() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Une horloge qui montre trois heures",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "66",
    cy: "31",
    r: "27",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), [0, 3, 6, 9].map(h => {
    const a = h / 12 * 2 * Math.PI;
    return /*#__PURE__*/React.createElement("circle", {
      key: h,
      cx: 66 + 21 * Math.sin(a),
      cy: 31 - 21 * Math.cos(a),
      r: "2",
      className: "jeu-vignette__jeton",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 20,
        columnNumber: 11
      }
    });
  }), /*#__PURE__*/React.createElement("line", {
    x1: "66",
    y1: "31",
    x2: "66",
    y2: "11",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "66",
    y1: "31",
    x2: "80",
    y2: "31",
    className: "jeu-vignette__trait",
    style: {
      strokeWidth: 5
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 7
    }
  }));
}