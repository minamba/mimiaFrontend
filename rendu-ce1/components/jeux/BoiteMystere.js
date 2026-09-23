const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/boiteMystere"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/boiteCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\BoiteMystere.js";
/**
 * LE SCHÉMA EN BARRES DU CM2. « De plus que » : deux barres égales, la plus
 * longue porte en plus l'écart. « Fois plus que » : une part pour le moins
 * cher, plusieurs parts égales pour l'autre. L'accolade porte le total ; la
 * part cherchée porte un « ? ».
 */
function Schema({
  schema
}) {
  const [premier, second] = schema.noms;
  const parts = (n, extra) => /*#__PURE__*/React.createElement("span", {
    className: "schema__barre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 5
    }
  }, Array.from({
    length: n
  }, (_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "schema__part",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 44
    }
  }, "?")), extra != null && /*#__PURE__*/React.createElement("span", {
    className: "schema__part schema__part--ecart",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 25
    }
  }, extra));
  return /*#__PURE__*/React.createElement("div", {
    className: "schema",
    role: "img",
    "aria-label": `Un schéma en barres ; ${schema.total} en tout`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 20,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "schema__ligne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "schema__nom",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 9
    }
  }, premier), schema.sorte === 'plus' ? parts(1, schema.ecart) : parts(schema.fois)), /*#__PURE__*/React.createElement("div", {
    className: "schema__ligne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "schema__nom",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 9
    }
  }, second), parts(1)), /*#__PURE__*/React.createElement("p", {
    className: "schema__total",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 7
    }
  }, `${schema.total}${schema.sorte === 'fois' ? ' €' : ''} en tout`));
}

/**
 * LA BOÎTE MYSTÈRE — un jeu du CM1, à l'écran. Toute la règle vit dans
 * `boiteMystere.js` ; au CM2, dans `boiteCM2.js`, qui ajoute le schéma.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'boite-mystere',
  classe: 'jeu--mystere',
  rendreQuestion: m => m.schema ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", {
    className: "texte-a-lire",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 45,
      columnNumber: 9
    }
  }, m.question), /*#__PURE__*/React.createElement(Schema, {
    schema: m.schema,
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 46,
      columnNumber: 9
    }
  })) : /*#__PURE__*/React.createElement("p", {
    className: "grands__nombre",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 7
    }
  }, m.question),
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'boite-cm2'
    }
  }
});