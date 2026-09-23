const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/calculMental"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/operationsCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\CalculMental.js";
/**
 * LE CALCUL MENTAL DU CM1 — la course des tables au CM1, à l'écran. Toute la règle vit dans `calculMental.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'calcul-mental',
  classe: 'jeu--course',
  rendreQuestion: m => /*#__PURE__*/React.createElement("p", {
    className: "grands__nombre",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 12,
      columnNumber: 26
    }
  }, m.question),
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'operations-cm2'
    }
  }
});