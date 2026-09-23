const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SujetEloigne;
var se = _interopRequireWildcard(require("../../lib/jeux/sujetEloigne"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _PasseComposeCM = _interopRequireDefault(require("./PasseComposeCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\SujetEloigne.js";
/**
 * LE SUJET QUI S'ÉLOIGNE, À L'ÉCRAN — la phrase à trou, trois formes du
 * verbe ; une fois trouvée, la question qui retrouve le sujet. Toute la règle
 * vit dans `sujetEloigne.js`.
 */
const REGLE = {
  MANCHES: se.MANCHES,
  serie: se.serie,
  bilan: se.bilan,
  consigne: () => _repliques.repliquesSujetEloigne.consigne,
  choix: p => p.choix.map(f => ({
    cle: f,
    libelle: f
  })),
  verdict: se.verdict,
  erreur: (p, sens) => _repliques.repliquesSujetEloigne.erreur(sens),
  aide: () => _repliques.repliquesSujetEloigne.erreur('proche')
};
function SujetEloigneAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--sujet",
    rendreQuestion: (p, termine) => {
      // Le sujet, surligné une fois la réponse trouvée.
      const reste = p.avant.slice(p.sujet.length);
      return /*#__PURE__*/React.createElement("p", {
        className: "phrase-a-trou",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 32,
          columnNumber: 11
        }
      }, termine ? /*#__PURE__*/React.createElement("mark", {
        className: "sujet__sujet",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 33,
          columnNumber: 24
        }
      }, p.sujet) : p.sujet, reste, ' ', /*#__PURE__*/React.createElement("span", {
        className: `phrase-a-trou__trou${termine ? ' est-rempli' : ''}`,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 35,
          columnNumber: 13
        }
      }, termine ? p.bon : '…'), ' ', p.apres);
    },
    rendreApres: p => /*#__PURE__*/React.createElement("p", {
      className: "scene__bulle",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 41,
        columnNumber: 9
      }
    }, se.question(p), " ", /*#__PURE__*/React.createElement("em", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 41,
        columnNumber: 54
      }
    }, p.sujet, ".")),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 5
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `PasseComposeCM1.js` ; il lit la classe. */
function SujetEloigne({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_PasseComposeCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(SujetEloigneAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 98
    }
  }));
}