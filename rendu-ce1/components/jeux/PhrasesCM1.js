const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/phrasesCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/phrasesCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
/**
 * LES TYPES ET LES FORMES DU CM1 — transformer la phrase au CM1, à l'écran. Toute la règle vit dans `phrasesCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'phrases-cm1',
  classe: 'jeu--non jeu--transformer',
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'phrases-cm2'
    }
  }
});