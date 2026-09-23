const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/recettePour8"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/recetteCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
/**
 * LA RECETTE POUR 8 — un jeu du CM1, à l'écran. Toute la règle vit dans `recettePour8.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'recette-pour-8',
  classe: 'jeu--recette',
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'recette-cm2'
    }
  }
});