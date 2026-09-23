const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/complementsCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/complementsCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\ComplementsCM1.js";
/**
 * LES COMPLÉMENTS DU CM1 — où, quand, comment au CM1, à l'écran. Le groupe
 * à analyser est surligné. Toute la règle vit dans `complementsCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'complements-cm1',
  classe: 'jeu--complements',
  rendreQuestion: m => {
    const [avant, groupe, apres] = regle.decouper(m.phrase);
    return /*#__PURE__*/React.createElement("p", {
      className: "phrase-a-trou",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 15,
        columnNumber: 12
      }
    }, avant, /*#__PURE__*/React.createElement("mark", {
      className: "surligne",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 15,
        columnNumber: 48
      }
    }, groupe), apres);
  },
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'complements-cm2'
    }
  }
});