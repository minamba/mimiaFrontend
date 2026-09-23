const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/commeUneImage"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/sensFigureCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
/**
 * COMME UNE IMAGE — un jeu du CM1, à l'écran. Toute la règle vit dans `commeUneImage.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'comme-une-image',
  classe: 'jeu--image',
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'sens-figure-cm2'
    }
  }
});