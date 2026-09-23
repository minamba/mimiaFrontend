const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/vocabulaireCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/vocabulaireCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
/**
 * LE VOCABULAIRE DU CM1 — contraires et jumeaux au CM1, à l'écran. Toute la règle vit dans `vocabulaireCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'vocabulaire-cm1',
  classe: 'jeu--contraires',
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'vocabulaire-cm2'
    }
  }
});