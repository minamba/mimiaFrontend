const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CombienDeTemps;
var temps = _interopRequireWildcard(require("../../lib/jeux/combienDeTemps"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _DureesCM = _interopRequireDefault(require("./DureesCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\CombienDeTemps.js";
/**
 * COMBIEN DE TEMPS ?, À L'ÉCRAN — l'heure de début, l'heure de fin, trois
 * durées ; une fois trouvée, le chemin par l'heure pile. Toute la règle vit
 * dans `combienDeTemps.js`.
 */
const REGLE = {
  MANCHES: temps.MANCHES,
  serie: temps.serie,
  bilan: temps.bilan,
  consigne: () => _repliques.repliquesDuree.consigne,
  choix: m => m.choix.map(d => ({
    cle: d,
    libelle: temps.ecrireDuree(d)
  })),
  verdict: temps.verdict,
  erreur: (m, sens) => _repliques.repliquesDuree.erreur(sens),
  aide: () => _repliques.repliquesDuree.erreur('naif')
};
function CombienDeTempsAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--duree",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("div", {
      className: "duree",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 29,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "duree__activite",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 11
      }
    }, m.activite), /*#__PURE__*/React.createElement("div", {
      className: "duree__heures",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "duree__heure",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 41
      }
    }, "commence \xE0"), temps.ecrireHeure(m.debut)), /*#__PURE__*/React.createElement("span", {
      className: "duree__fleche",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 33,
        columnNumber: 13
      }
    }, "\u2192"), /*#__PURE__*/React.createElement("p", {
      className: "duree__heure",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 34,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 34,
        columnNumber: 41
      }
    }, "finit \xE0"), temps.ecrireHeure(m.fin))), termine && /*#__PURE__*/React.createElement("ol", {
      className: "duree__etapes",
      "aria-label": "Le chemin par l\u2019heure pile",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 37,
        columnNumber: 13
      }
    }, temps.etapes(m).map(e => /*#__PURE__*/React.createElement("li", {
      key: e.de,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 39,
        columnNumber: 17
      }
    }, temps.ecrireHeure(e.de), " \u2192 ", temps.ecrireHeure(e.a), " : ", /*#__PURE__*/React.createElement("strong", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 40,
        columnNumber: 74
      }
    }, temps.ecrireDuree(e.a - e.de)))), /*#__PURE__*/React.createElement("li", {
      className: "duree__total",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 43,
        columnNumber: 15
      }
    }, "En tout : ", /*#__PURE__*/React.createElement("strong", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 43,
        columnNumber: 54
      }
    }, temps.ecrireDuree(m.bonne))))),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 24,
      columnNumber: 5
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `DureesCM1.js` ; il lit la classe. */
function CombienDeTemps({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_DureesCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(CombienDeTempsAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54,
      columnNumber: 92
    }
  }));
}