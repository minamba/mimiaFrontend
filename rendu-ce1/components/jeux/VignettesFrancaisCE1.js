const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VignetteAOuA = VignetteAOuA;
exports.VignetteContraires = VignetteContraires;
exports.VignetteDetective = VignetteDetective;
exports.VignetteNegation = VignetteNegation;
exports.VignetteRoue = VignetteRoue;
exports.VignetteTypes = VignetteTypes;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignettesFrancaisCE1.js";
/**
 * LES APERÇUS DES SIX JEUX DE FRANÇAIS DU CE1, sur leurs cartes de la
 * ludothèque — en attendant leurs couvertures. Même règle que les autres
 * vignettes : un dessin qui dit le geste du jeu.
 */

const Cadre = ({
  label,
  children
}) => /*#__PURE__*/React.createElement("svg", {
  className: "jeu-vignette",
  viewBox: "0 0 132 62",
  role: "img",
  "aria-label": label,
  __self: void 0,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 8,
    columnNumber: 3
  }
}, children);
const Texte = ({
  x,
  y,
  taille = 17,
  children
}) => /*#__PURE__*/React.createElement("text", {
  x: x,
  y: y,
  textAnchor: "middle",
  className: "jeu-vignette__chiffre",
  style: {
    fontSize: taille
  },
  __self: void 0,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 14,
    columnNumber: 3
  }
}, children);
function VignetteAOuA() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "a ou \xE0, et ou est",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "14",
    width: "52",
    height: "34",
    rx: "8",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "72",
    y: "14",
    width: "52",
    height: "34",
    rx: "8",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 34,
    y: 37,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 7
    }
  }, "a"), /*#__PURE__*/React.createElement(Texte, {
    x: 98,
    y: 37,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 7
    }
  }, "\xE0"));
}
function VignetteTypes() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Point, point d\u2019interrogation, ordre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Texte, {
    x: 24,
    y: 40,
    taille: 26,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 7
    }
  }, "."), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 40,
    taille: 26,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 7
    }
  }, "?"), /*#__PURE__*/React.createElement(Texte, {
    x: 108,
    y: 40,
    taille: 26,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 33,
      columnNumber: 7
    }
  }, "!"));
}
function VignetteContraires() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "grand, le contraire de petit",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Texte, {
    x: 34,
    y: 37,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 7
    }
  }, "grand"), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 37,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42,
      columnNumber: 7
    }
  }, "\u2194"), /*#__PURE__*/React.createElement(Texte, {
    x: 100,
    y: 37,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 43,
      columnNumber: 7
    }
  }, "petit"));
}
function VignetteRoue() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Une roue de pronoms et le verbe chanter",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 50,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "30",
    cy: "31",
    r: "24",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M30 31 L30 7 A24 24 0 0 1 47 14 Z",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 52,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 92,
    y: 37,
    taille: 15,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53,
      columnNumber: 7
    }
  }, "nous \u2026ons"));
}
function VignetteDetective() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Une loupe sur le verbe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 60,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "40",
    cy: "28",
    r: "16",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 61,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "52",
    y1: "40",
    x2: "64",
    y2: "52",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 62,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 40,
    y: 33,
    taille: 13,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 63,
      columnNumber: 7
    }
  }, "verbe"), /*#__PURE__*/React.createElement(Texte, {
    x: 100,
    y: 37,
    taille: 15,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 64,
      columnNumber: 7
    }
  }, "sujet"));
}
function VignetteNegation() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "ne et pas autour du verbe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 71,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Texte, {
    x: 26,
    y: 37,
    taille: 16,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 72,
      columnNumber: 7
    }
  }, "ne"), /*#__PURE__*/React.createElement("rect", {
    x: "44",
    y: "18",
    width: "44",
    height: "28",
    rx: "7",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 73,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 108,
    y: 37,
    taille: 16,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 74,
      columnNumber: 7
    }
  }, "pas"));
}