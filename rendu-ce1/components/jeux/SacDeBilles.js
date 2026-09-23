const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/sacDeBilles"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/billesCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\SacDeBilles.js";
/** Le sac ouvert et ses billes — on les voit, mais on tire sans regarder. */
function Sac({
  sac,
  nom
}) {
  const billes = Object.entries(sac).flatMap(([couleur, n]) => Array(n).fill(couleur));
  const description = Object.entries(sac).filter(([, n]) => n > 0).map(([c, n]) => `${n} ${c}${n > 1 ? 's' : ''}`).join(', ');
  return /*#__PURE__*/React.createElement("div", {
    className: "billes__sac",
    role: "img",
    "aria-label": `${nom ? `Le sac ${nom}` : 'Dans le sac'} : ${description}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 10,
      columnNumber: 5
    }
  }, nom && /*#__PURE__*/React.createElement("span", {
    className: "billes__nom",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 11,
      columnNumber: 15
    }
  }, nom), billes.map((c, i) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement("span", {
    key: i,
    className: `billes__bille billes__bille--${c}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 9
    }
  })));
}

/**
 * LE SAC DE BILLES — à l'écran. Toute la règle vit dans `sacDeBilles.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'sac-de-billes',
  classe: 'jeu--billes',
  rendreQuestion: m => /*#__PURE__*/React.createElement(React.Fragment, null, m.sac && /*#__PURE__*/React.createElement(Sac, {
    sac: m.sac,
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 29,
      columnNumber: 17
    }
  }), m.sacs && /*#__PURE__*/React.createElement("div", {
    className: "billes__deux",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement(Sac, {
    sac: m.sacs.a,
    nom: "A",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement(Sac, {
    sac: m.sacs.b,
    nom: "B",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 33,
      columnNumber: 11
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "phrase-a-trou",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 36,
      columnNumber: 7
    }
  }, m.question)),
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'billes-cm2'
    }
  }
});