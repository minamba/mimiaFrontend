const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AOuA;
var aOuA = _interopRequireWildcard(require("../../lib/jeux/aOuA"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _HomophonesCM = _interopRequireDefault(require("./HomophonesCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\AOuA.js";
/**
 * A OU À ? ET OU EST ?, À L'ÉCRAN — la phrase à trou, les deux mots, et la
 * preuve par « avait » ou « était » une fois la phrase juste. Toute la règle
 * vit dans `aOuA.js` ; l'écran est celui des jeux à choix.
 */
/** La règle d'une classe : au CE2, son/sont et on/ont. */
const regle = niveau => ({
  MANCHES: aOuA.MANCHES,
  serie: graine => aOuA.serie(graine, niveau),
  bilan: aOuA.bilan,
  consigne: _repliques.repliquesAOuA.consigne,
  choix: p => aOuA.paire(p).map(mot => ({
    cle: mot,
    libelle: mot
  })),
  verdict: aOuA.verdict,
  // L'erreur donne la méthode du mot qu'il fallait écrire.
  erreur: (p, bon) => _repliques.repliquesAOuA.methode(bon),
  aide: p => _repliques.repliquesAOuA.methode(p.bon)
});
const REGLES = {
  CE1: regle('CE1'),
  CE2: regle('CE2')
};
function AOuAAvantCM1({
  niveau = 'CE1',
  ...props
}) {
  var _REGLES$niveau;
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: (_REGLES$niveau = REGLES[niveau]) !== null && _REGLES$niveau !== void 0 ? _REGLES$niveau : REGLES.CE1
    // Au CE2, son/sont a son propre décor : voir `.jeu--aoua-ce2`.
    ,
    classe: niveau === 'CE2' ? 'jeu--aoua jeu--aoua-ce2' : 'jeu--aoua',
    rendreQuestion: (p, termine) => /*#__PURE__*/React.createElement("p", {
      className: "phrase-a-trou",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 9
      }
    }, p.avant, ' ', /*#__PURE__*/React.createElement("span", {
      className: `phrase-a-trou__trou${termine ? ' est-rempli' : ''}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 35,
        columnNumber: 11
      }
    }, termine ? p.bon : '…'), ' ', p.apres),
    rendreApres: p => {
      // LA PREUVE : avec le verbe, le remplacement fait une vraie phrase.
      const verbe = aOuA.VERBES.includes(p.bon);
      return /*#__PURE__*/React.createElement("p", {
        className: "scene__bulle",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 43,
          columnNumber: 11
        }
      }, verbe ? /*#__PURE__*/React.createElement(React.Fragment, null, "Preuve : ", /*#__PURE__*/React.createElement("em", {
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 45,
          columnNumber: 28
        }
      }, aOuA.avecRemplacant(p))) : /*#__PURE__*/React.createElement(React.Fragment, null, "\xAB ", aOuA.remplacant(p), " \xBB ne marche pas ici : ce n\u2019est pas le verbe."));
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 27,
      columnNumber: 5
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `HomophonesCM1.js` ; il lit la classe. */
function AOuA({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_HomophonesCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 56,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(AOuAAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 56,
      columnNumber: 96
    }
  }));
}