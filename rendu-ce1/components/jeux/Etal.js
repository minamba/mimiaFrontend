const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Monnaie = Monnaie;
exports.Produit = Produit;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Etal.js";
/**
 * LES DESSINS DE « LA MARCHANDE » — les produits, les pièces, le billet.
 *
 * Le décor du marché est une image ; tout ce qui se manipule est dessiné ici,
 * pour la même raison que les œufs de la boîte de 10 : une image de pièce ne
 * se pose pas sur un comptoir.
 *
 * LES QUATRE PRODUITS SONT CEUX DES ARDOISES du décor — pomme, banane,
 * tomate, carotte. Dessinés gros et sans détail : ils font une trentaine de
 * pixels à l'écran, et un enfant doit les reconnaître en une seconde.
 */

const DESSINS = {
  pomme: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    className: "produit__chair produit__chair--pomme",
    d: "M12 9 C 6 9 3 14 3 19 C 3 25 7 31 12 31 C 14 31 15 30 16 30 C 17 30 18 31 20 31 C 25 31 29 25 29 19 C 29 14 26 9 20 9 C 18 9 17 10 16 10 C 15 10 14 9 12 9 Z",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "produit__tige",
    d: "M16 10 V5",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "produit__feuille",
    d: "M16 6 C 20 2 25 4 24 8 C 23 11 18 10 16 6 Z",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  })),
  banane: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    className: "produit__chair produit__chair--banane",
    d: "M5 10 C 5 22 12 30 24 30 C 28 30 30 28 30 26 C 30 24 28 24 25 24 C 16 24 10 18 10 10 C 10 7 9 6 7 6 C 5 6 5 8 5 10 Z",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "produit__tige",
    d: "M6 7 V4",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 7
    }
  })),
  tomate: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    className: "produit__chair produit__chair--tomate",
    cx: "16",
    cy: "21",
    r: "11",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 34,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "produit__feuille",
    d: "M16 10 l-6 -3 M16 10 l6 -3 M16 10 v-4 M16 10 l-3 -5 M16 10 l3 -5",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 35,
      columnNumber: 7
    }
  })),
  carotte: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    className: "produit__chair produit__chair--carotte",
    d: "M16 32 L9 13 C 12 11 20 11 23 13 Z",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "produit__feuille",
    d: "M16 12 v-7 M16 9 l-5 -5 M16 9 l5 -5",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42,
      columnNumber: 7
    }
  }))
};

/** Un produit de l'étal. Décoratif : son nom est dit par la consigne. */
function Produit({
  cle
}) {
  const dessin = DESSINS[cle];
  if (!dessin) return null;
  return /*#__PURE__*/React.createElement("svg", {
    className: "produit",
    viewBox: "0 0 32 36",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53,
      columnNumber: 5
    }
  }, dessin);
}

/**
 * UNE PIÈCE OU UN BILLET.
 *
 * LA VALEUR EST ÉCRITE DESSUS, comme sur la vraie monnaie — et c'est ce qui
 * relie le nombre écrit à la quantité qu'il vaut. Un CP ne reconnaît pas
 * encore une pièce à sa taille ; il lit « 2 ».
 *
 * LE BILLET A UNE AUTRE FORME ET UNE AUTRE COULEUR : on doit voir du premier
 * coup d'œil que ce n'est pas une pièce, sans quoi « 5 » ne serait qu'un rond
 * de plus.
 */
function Monnaie({
  valeur,
  genre
}) {
  if (genre === 'billet') {
    return /*#__PURE__*/React.createElement("svg", {
      className: "monnaie monnaie--billet",
      viewBox: "0 0 64 38",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 73,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("rect", {
      className: "billet__papier",
      x: "2",
      y: "2",
      width: "60",
      height: "34",
      rx: "5",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 74,
        columnNumber: 9
      }
    }), /*#__PURE__*/React.createElement("rect", {
      className: "billet__cadre",
      x: "7",
      y: "7",
      width: "50",
      height: "24",
      rx: "3",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 75,
        columnNumber: 9
      }
    }), /*#__PURE__*/React.createElement("text", {
      className: "monnaie__valeur",
      x: "32",
      y: "25",
      textAnchor: "middle",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 76,
        columnNumber: 9
      }
    }, valeur, " \u20AC"));
  }
  return /*#__PURE__*/React.createElement("svg", {
    className: "monnaie monnaie--piece",
    viewBox: "0 0 44 44",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 82,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    className: "piece__tranche",
    cx: "22",
    cy: "22",
    r: "20",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 83,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "piece__centre",
    cx: "22",
    cy: "22",
    r: "14",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 84,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    className: "monnaie__valeur",
    x: "22",
    y: "28",
    textAnchor: "middle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 85,
      columnNumber: 7
    }
  }, valeur));
}