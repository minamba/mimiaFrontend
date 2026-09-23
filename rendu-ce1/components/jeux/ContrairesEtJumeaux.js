const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ContrairesEtJumeaux;
var cj = _interopRequireWildcard(require("../../lib/jeux/contrairesEtJumeaux"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _VocabulaireCM = _interopRequireDefault(require("./VocabulaireCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\ContrairesEtJumeaux.js";
/**
 * CONTRAIRES ET JUMEAUX, À L'ÉCRAN — le mot, la question, trois choix. Toute
 * la règle vit dans `contrairesEtJumeaux.js`.
 */
const regle = niveau => ({
  MANCHES: cj.MANCHES,
  serie: graine => cj.serie(graine, niveau),
  bilan: cj.bilan,
  consigne: _repliques.repliquesContraires.question,
  choix: m => m.choix.map(mot => ({
    cle: mot,
    libelle: mot
  })),
  verdict: cj.verdict,
  erreur: (m, sens) => _repliques.repliquesContraires.erreur(m, sens),
  aide: () => null
});
const REGLES = {
  CE1: regle('CE1'),
  CE2: regle('CE2')
};

/** Le signe entre les deux mots : ↔ pour un contraire, = pour un jumeau, ⋯ pour une famille. */
const LIEN = {
  contraire: '↔',
  jumeau: '=',
  famille: '⋯'
};
function ContrairesEtJumeauxAvantCM1({
  niveau = 'CE1',
  ...props
}) {
  var _REGLES$niveau;
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: (_REGLES$niveau = REGLES[niveau]) !== null && _REGLES$niveau !== void 0 ? _REGLES$niveau : REGLES.CE1,
    classe: "jeu--contraires",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("p", {
      className: "contraires__paire",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "contraires__mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 11
      }
    }, m.mot), /*#__PURE__*/React.createElement("span", {
      className: "contraires__lien",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 34,
        columnNumber: 11
      }
    }, LIEN[m.demande]), /*#__PURE__*/React.createElement("span", {
      className: `contraires__mot${termine ? ' est-trouve' : ' est-vide'}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 35,
        columnNumber: 11
      }
    }, termine ? cj.reponse(m) : '?')),
    rendreApres: m => {
      if (m.demande === 'jumeau') return /*#__PURE__*/React.createElement("p", {
        className: "scene__bulle",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 41,
          columnNumber: 44
        }
      }, cj.PHRASES.jumeaux);
      if (m.demande === 'famille') return /*#__PURE__*/React.createElement("p", {
        className: "scene__bulle",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 42,
          columnNumber: 45
        }
      }, cj.PHRASES.familles);
      return null;
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 27,
      columnNumber: 5
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `VocabulaireCM1.js` ; il lit la classe. */
function ContrairesEtJumeaux({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_VocabulaireCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(ContrairesEtJumeauxAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51,
      columnNumber: 97
    }
  }));
}