const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/homophonesCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/homophonesCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
/**
 * LES HOMOPHONES DU CM1 — a ou à au CM1, à l'écran. Toute la règle vit dans `homophonesCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'homophones-cm1',
  classe: 'jeu--aoua',
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'homophones-cm2'
    }
  }
});