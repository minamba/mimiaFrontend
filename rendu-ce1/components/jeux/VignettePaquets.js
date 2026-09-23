const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = VignettePaquets;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignettePaquets.js";
/**
 * L'APERÇU DES « PAQUETS DE DIX », sur sa carte de la ludothèque.
 *
 * Il ne sert plus tant que le jeu a sa couverture illustrée — la carte n'en
 * affiche qu'une des deux. Il reste le repli, et il doit donc rester vrai :
 * des bûchettes, comme le décor et comme le jeu, jamais des jetons ronds.
 *
 * Le dessin montre un paquet déjà lié et trois bûchettes encore libres : la
 * situation du jeu, pas une illustration de dizaines en général.
 */
function VignettePaquets() {
  const buchette = (x, classe) => /*#__PURE__*/React.createElement("rect", {
    key: x,
    x: x,
    y: "14",
    width: "5",
    height: "34",
    rx: "2.5",
    className: classe,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 5
    }
  });
  return /*#__PURE__*/React.createElement("svg", {
    className: "jeu-vignette",
    viewBox: "0 0 132 62",
    role: "img",
    "aria-label": "Un paquet de dix b\xFBchettes li\xE9, et trois b\xFBchettes libres",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 5
    }
  }, Array.from({
    length: 10
  }, (_, i) => buchette(8 + i * 7, 'jeu-vignette__jeton')), /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "26",
    width: "72",
    height: "8",
    rx: "2",
    className: "jeu-vignette__boite",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25,
      columnNumber: 7
    }
  }), [96, 108, 120].map(x => buchette(x, 'jeu-vignette__jeton')));
}