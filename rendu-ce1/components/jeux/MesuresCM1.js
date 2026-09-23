const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/mesuresCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/longueursCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\MesuresCM1.js";
/**
 * LES MASSES ET LES CONTENANCES DU CM1 — le mètre ruban au CM1, à l'écran. Toute la règle vit dans `mesuresCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'mesures-cm1',
  classe: 'jeu--ruban',
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
      prefixe: 'longueurs-cm2'
    }
  }
});