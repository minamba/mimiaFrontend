const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/aQuiLePronom"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\AQuiLePronom.js";
/**
 * À QUI RENVOIE LE PRONOM ? — à l'écran. Le mot à suivre est en couleur.
 * Toute la règle vit dans `aQuiLePronom.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'a-qui-le-pronom',
  classe: 'jeu--pronom',
  rendreQuestion: m => {
    const [avant, mot, apres] = regle.decouper(m.texte);
    return /*#__PURE__*/React.createElement("p", {
      className: "texte-a-lire",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 14,
        columnNumber: 12
      }
    }, avant, /*#__PURE__*/React.createElement("mark", {
      className: "surligne",
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 14,
        columnNumber: 47
      }
    }, mot), apres);
  }
});