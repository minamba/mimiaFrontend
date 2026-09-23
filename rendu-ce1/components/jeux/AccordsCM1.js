const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/accordsCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/attributCM2"));
var _complementsCM = require("../../lib/jeux/complementsCM1");
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\AccordsCM1.js";
/**
 * LES ACCORDS À DISTANCE DU CM1 — les accords au CM1, à l'écran. Toute la
 * règle vit dans `accordsCM1.js`. Au CM2 (`attributCM2.js`), le groupe à
 * reconnaître est surligné.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'accords-cm1',
  classe: 'jeu--unoudes',
  rendreQuestion: m => {
    if (!m.phrase) return /*#__PURE__*/React.createElement("p", {
      className: "phrase-a-trou",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 16,
        columnNumber: 27
      }
    }, m.question);
    const [avant, groupe, apres] = (0, _complementsCM.decouper)(m.phrase);
    return /*#__PURE__*/React.createElement("p", {
      className: "phrase-a-trou",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 18,
        columnNumber: 12
      }
    }, avant, /*#__PURE__*/React.createElement("mark", {
      className: "surligne",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 18,
        columnNumber: 48
      }
    }, groupe), apres);
  },
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'attribut-cm2'
    }
  }
});