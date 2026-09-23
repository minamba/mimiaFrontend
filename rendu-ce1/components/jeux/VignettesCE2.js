const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VignetteBouteilles = VignetteBouteilles;
exports.VignetteComplements = VignetteComplements;
exports.VignetteDiagramme = VignetteDiagramme;
exports.VignetteDuree = VignetteDuree;
exports.VignetteJardin = VignetteJardin;
exports.VignetteMiroir = VignetteMiroir;
exports.VignettePartage = VignettePartage;
exports.VignetteRuban = VignetteRuban;
exports.VignetteSujet = VignetteSujet;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\VignettesCE2.js";
/**
 * LES APERÇUS DES NOUVEAUX JEUX DU CE2, sur leurs cartes de la ludothèque —
 * en attendant leurs couvertures. Même règle que les autres vignettes : un
 * dessin qui dit le geste du jeu.
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
  taille = 15,
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
    lineNumber: 16,
    columnNumber: 3
  }
}, children);
function VignettePartage() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Des bonbons partag\xE9s dans trois assiettes",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 5
    }
  }, [22, 66, 110].map(x => /*#__PURE__*/React.createElement("ellipse", {
    key: x,
    cx: x,
    cy: "44",
    rx: "18",
    ry: "7",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 33
    }
  })), [16, 28, 60, 72, 104, 116].map(x => /*#__PURE__*/React.createElement("circle", {
    key: x,
    cx: x,
    cy: "38",
    r: "5",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 46
    }
  })), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 20,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 7
    }
  }, "12 \xF7 3"));
}
function VignetteRuban() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Un m\xE8tre ruban : 1 m = 100 cm",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "34",
    width: "116",
    height: "16",
    rx: "3",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 24,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 33,
      columnNumber: 7
    }
  }, "1 m = 100 cm"));
}
function VignetteJardin() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Un jardin rectangulaire et sa cl\xF4ture",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "30",
    y: "14",
    width: "72",
    height: "36",
    rx: "2",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 10,
    taille: 11,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42,
      columnNumber: 7
    }
  }, "6 m"), /*#__PURE__*/React.createElement(Texte, {
    x: 116,
    y: 36,
    taille: 11,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 43,
      columnNumber: 7
    }
  }, "3 m"));
}
function VignetteDuree() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "De 9 h 40 \xE0 10 h 15",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 50,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Texte, {
    x: 34,
    y: 36,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51,
      columnNumber: 7
    }
  }, "9 h 40"), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 36,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 52,
      columnNumber: 7
    }
  }, "\u2192"), /*#__PURE__*/React.createElement(Texte, {
    x: 100,
    y: 36,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53,
      columnNumber: 7
    }
  }, "10 h 15"));
}
function VignetteBouteilles() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Deux bouteilles : 1 L et 75 cL",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 60,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "28",
    y: "12",
    width: "22",
    height: "42",
    rx: "6",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 61,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "82",
    y: "12",
    width: "22",
    height: "42",
    rx: "6",
    className: "jeu-vignette__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 62,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement(Texte, {
    x: 39,
    y: 60,
    taille: 10,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 63,
      columnNumber: 7
    }
  }, "1 L"), /*#__PURE__*/React.createElement(Texte, {
    x: 93,
    y: 60,
    taille: 10,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 64,
      columnNumber: 7
    }
  }, "75 cL"));
}
function VignetteMiroir() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Une figure et son axe de sym\xE9trie",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 71,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "40,50 92,50 92,28 66,10 40,28",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 72,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: "66",
    y1: "4",
    x2: "66",
    y2: "58",
    className: "jeu-vignette__trait",
    strokeDasharray: "4 3",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 73,
      columnNumber: 7
    }
  }));
}
function VignetteDiagramme() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Un diagramme en barres",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80,
      columnNumber: 5
    }
  }, [[24, 30], [48, 14], [72, 38], [96, 22]].map(([x, y]) => /*#__PURE__*/React.createElement("rect", {
    key: x,
    x: x,
    y: y,
    width: "16",
    height: 54 - y,
    rx: "2",
    className: "jeu-vignette__jeton",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 82,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("line", {
    x1: "16",
    y1: "54",
    x2: "120",
    y2: "54",
    className: "jeu-vignette__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 84,
      columnNumber: 7
    }
  }));
}
function VignetteComplements() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "O\xF9 ? Quand ? Comment ?",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 91,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Texte, {
    x: 26,
    y: 38,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 92,
      columnNumber: 7
    }
  }, "O\xF9 ?"), /*#__PURE__*/React.createElement(Texte, {
    x: 70,
    y: 38,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 93,
      columnNumber: 7
    }
  }, "Quand ?"), /*#__PURE__*/React.createElement(Texte, {
    x: 114,
    y: 38,
    taille: 12,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 94,
      columnNumber: 7
    }
  }, "Comment ?"));
}
function VignetteSujet() {
  return /*#__PURE__*/React.createElement(Cadre, {
    label: "Les enfants de la classe jouent",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 101,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 26,
    taille: 12,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 102,
      columnNumber: 7
    }
  }, "Les enfants de la classe"), /*#__PURE__*/React.createElement(Texte, {
    x: 66,
    y: 48,
    taille: 14,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 103,
      columnNumber: 7
    }
  }, "jouent"));
}