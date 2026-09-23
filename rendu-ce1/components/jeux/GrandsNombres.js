const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var gn = _interopRequireWildcard(require("../../lib/jeux/grandsNombres"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/nombresCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\GrandsNombres.js";
/**
 * LES GRANDS NOMBRES — le coffre du CM1, à l'écran. Le nombre à lire ou à
 * écrire, gros, et trois écritures. Toute la règle vit dans
 * `grandsNombres.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: gn,
  prefixe: 'grands-nombres',
  classe: 'jeu--coffre',
  rendreQuestion: m => /*#__PURE__*/React.createElement("p", {
    className: "grands__nombre",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 26
    }
  }, m.question),
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'nombres-cm2'
    }
  }
});