const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var fr = _interopRequireWildcard(require("../../lib/jeux/fractionsCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/fractionsCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\FractionsCM1.js";
/**
 * LES FRACTIONS DU CM1 — les parts de pizza au CM1, à l'écran. La fraction ou
 * la quantité, trois réponses. Toute la règle vit dans `fractionsCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: fr,
  prefixe: 'fractions-cm1',
  classe: 'jeu--pizza',
  rendreQuestion: m => /*#__PURE__*/React.createElement("p", {
    className: "grands__nombre",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 13,
      columnNumber: 26
    }
  }, m.question),
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'fractions-cm2'
    }
  }
});