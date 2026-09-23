const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/poemeTheatreRecit"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/narrateurCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PoemeTheatreRecit.js";
/**
 * POÈME, THÉÂTRE OU RÉCIT ? — à l'écran. L'extrait garde sa forme, retours
 * à la ligne compris : c'est elle qui donne la réponse. Toute la règle vit
 * dans `poemeTheatreRecit.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'poeme-theatre-recit',
  classe: 'jeu--genres',
  rendreQuestion: m => /*#__PURE__*/React.createElement("blockquote", {
    className: "texte-a-lire texte-a-lire--forme",
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
      prefixe: 'narrateur-cm2'
    }
  }
});