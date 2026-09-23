const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = BoutonsVoix;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\BoutonsVoix.js";
/**
 * LES DEUX BOUTONS DE LA VOIX, posés au bout de la consigne de chaque jeu.
 *
 * RÉÉCOUTER, D'ABORD. Un enfant de six ans qui ne lit pas encore n'a que la
 * voix pour savoir ce qu'on lui demande : s'il était distrait quand elle a
 * parlé, il doit pouvoir la faire revenir, autant de fois qu'il veut.
 *
 * COUPER, ENSUITE. Une salle de classe, une bibliothèque, un frère qui dort :
 * la voix doit pouvoir se taire, et le rester d'une partie à l'autre.
 *
 * Rien ne s'affiche si la matière n'a pas de voix : un bouton qui ne produit
 * aucun son serait pire que pas de bouton.
 */
function BoutonsVoix({
  voix,
  consigne
}) {
  if (!voix.parle) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: "voix-jeu",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "voix-jeu__bouton",
    onClick: () => voix.reecouter(consigne),
    "aria-label": "R\xE9\xE9couter la consigne",
    title: "R\xE9\xE9couter la consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 9h4l5-4v14l-5-4H4z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 27,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 8.5a4.5 4.5 0 0 1 0 7",
    className: "voix-jeu__onde",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.5 6a8 8 0 0 1 0 12",
    className: "voix-jeu__onde",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "voix-jeu__bouton voix-jeu__bouton--muet",
    onClick: voix.basculerMuet,
    "aria-pressed": voix.muet,
    "aria-label": voix.muet ? 'Remettre la voix' : 'Couper la voix',
    title: voix.muet ? 'Remettre la voix' : 'Couper la voix',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 33,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 9h4l5-4v14l-5-4H4z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42,
      columnNumber: 11
    }
  }), voix.muet ? /*#__PURE__*/React.createElement("path", {
    d: "M16 9l6 6M22 9l-6 6",
    className: "voix-jeu__onde",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 44,
      columnNumber: 15
    }
  }) : /*#__PURE__*/React.createElement("path", {
    d: "M16 8.5a4.5 4.5 0 0 1 0 7",
    className: "voix-jeu__onde",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 45,
      columnNumber: 15
    }
  }))));
}