const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/regleDesDixiemes"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/decimauxCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\RegleDesDixiemes.js";
/**
 * Une règle coupée en dix, la flèche sur un trait : d'un entier au suivant
 * (dixièmes, CM1), ou d'un dixième au suivant (centièmes, la loupe du CM2).
 */
function Regle({
  gauche,
  droite,
  position,
  unite
}) {
  const x = k => 20 + k * 30;
  return /*#__PURE__*/React.createElement("svg", {
    className: "dixiemes__regle",
    viewBox: "0 0 340 90",
    role: "img",
    "aria-label": `Une règle de ${gauche} à ${droite}, coupée en ${unite}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: x(0),
    y1: 50,
    x2: x(10),
    y2: 50,
    className: "geo__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 7
    }
  }), Array.from({
    length: 11
  }, (_, k) => /*#__PURE__*/React.createElement("line", {
    key: k,
    x1: x(k),
    y1: k % 10 === 0 ? 36 : 42,
    x2: x(k),
    y2: k % 10 === 0 ? 64 : 58,
    className: "geo__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("text", {
    x: x(0),
    y: 84,
    className: "dixiemes__nombre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }, gauche), /*#__PURE__*/React.createElement("text", {
    x: x(10),
    y: 84,
    className: "dixiemes__nombre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18,
      columnNumber: 7
    }
  }, droite), /*#__PURE__*/React.createElement("path", {
    d: `M ${x(position)} 32 l -8 -14 h 16 z`,
    className: "dixiemes__fleche",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 19,
      columnNumber: 7
    }
  }));
}
function Question(m) {
  if (m.consigne === 'regle') {
    return /*#__PURE__*/React.createElement(Regle, {
      gauche: m.debut,
      droite: m.debut + 1,
      position: m.dixiemes,
      unite: "dixi\xE8mes",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 26,
        columnNumber: 12
      }
    });
  }
  if (m.consigne === 'loupe') return /*#__PURE__*/React.createElement(Regle, {
    gauche: m.gauche,
    droite: m.droite,
    position: m.pas,
    unite: "centi\xE8mes",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 38
    }
  });
  return /*#__PURE__*/React.createElement("p", {
    className: "grands__nombre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 10
    }
  }, m.question);
}

/**
 * LA RÈGLE DES DIXIÈMES — à l'écran. Toute la règle vit dans
 * `regleDesDixiemes.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'regle-des-dixiemes',
  classe: 'jeu--dixiemes',
  rendreQuestion: Question,
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'decimaux-cm2'
    }
  }
});