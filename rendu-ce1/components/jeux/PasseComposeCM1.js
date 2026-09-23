const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/passeComposeCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/participeAvoirCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
/**
 * LE PASSÉ COMPOSÉ AVEC ÊTRE — le sujet qui s’éloigne au CM1, à l'écran. Toute la règle vit dans `passeComposeCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'passe-compose-cm1',
  classe: 'jeu--sujet',
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'participe-avoir-cm2'
    }
  }
});