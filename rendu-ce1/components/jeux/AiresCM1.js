const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/airesCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/airesCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\AiresCM1.js";
const CASE = 34;

/** La figure en carreaux, sur un quadrillage un peu plus grand qu'elle. */
function Quadrillage({
  figure
}) {
  const l = figure.l + 2;
  const h = figure.h + 2;
  return /*#__PURE__*/React.createElement("svg", {
    className: "aires__quadrillage",
    viewBox: `0 0 ${l * CASE} ${h * CASE}`,
    role: "img",
    "aria-label": "Une figure sur un quadrillage",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12,
      columnNumber: 5
    }
  }, Array.from({
    length: l + 1
  }, (_, x) => /*#__PURE__*/React.createElement("line", {
    key: `x${x}`,
    x1: x * CASE,
    y1: 0,
    x2: x * CASE,
    y2: h * CASE,
    className: "aires__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 9
    }
  })), Array.from({
    length: h + 1
  }, (_, y) => /*#__PURE__*/React.createElement("line", {
    key: `y${y}`,
    x1: 0,
    y1: y * CASE,
    x2: l * CASE,
    y2: y * CASE,
    className: "aires__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 9
    }
  })), figure.cases.map(([x, y]) => /*#__PURE__*/React.createElement("rect", {
    key: `${x}.${y}`,
    x: (x + 1) * CASE,
    y: (y + 1) * CASE,
    width: CASE,
    height: CASE,
    className: "aires__case",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 9
    }
  })));
}

/**
 * LES AIRES DU CM1 — le tour du jardin au CM1, à l'écran. La figure est
 * dessinée ; le rectangle se dit en mots. Toute la règle vit dans
 * `airesCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'aires-cm1',
  classe: 'jeu--jardin',
  rendreQuestion: m => m.figure ? /*#__PURE__*/React.createElement(Quadrillage, {
    figure: m.figure,
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 35,
      columnNumber: 38
    }
  }) : /*#__PURE__*/React.createElement("p", {
    className: "phrase-a-trou",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 35,
      columnNumber: 74
    }
  }, m.question),
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'aires-cm2'
    }
  }
});