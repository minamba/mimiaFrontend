const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RoueDesVerbes;
var roue = _interopRequireWildcard(require("../../lib/jeux/roueDesVerbes"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _TempsCM = _interopRequireDefault(require("./TempsCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\RoueDesVerbes.js";
/**
 * LA ROUE DES VERBES, À L'ÉCRAN — une roue des huit pronoms, arrêtée sur l'un
 * d'eux, le verbe à l'infinitif, et trois formes. Toute la règle vit dans
 * `roueDesVerbes.js`.
 */
const regle = niveau => ({
  MANCHES: roue.MANCHES,
  serie: graine => roue.serie(graine, niveau),
  bilan: roue.bilan,
  consigne: () => niveau === 'CE2' ? _repliques.repliquesRoue.consigneCE2 : _repliques.repliquesRoue.consigne,
  choix: m => m.choix.map(f => ({
    cle: f,
    libelle: f
  })),
  verdict: roue.verdict,
  erreur: (m, sens) => _repliques.repliquesRoue.regle(sens),
  aide: m => _repliques.repliquesRoue.regle(roue.verdict(m, ''))
});
const REGLES = {
  CE1: regle('CE1'),
  CE2: regle('CE2')
};
function RoueDesVerbesAvantCM1({
  niveau = 'CE1',
  ...props
}) {
  var _REGLES$niveau;
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: (_REGLES$niveau = REGLES[niveau]) !== null && _REGLES$niveau !== void 0 ? _REGLES$niveau : REGLES.CE1,
    classe: "jeu--roue",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("div", {
      className: "roue__scene",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement(Roue, {
      pronom: m.pronom,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31,
        columnNumber: 11
      }
    }), /*#__PURE__*/React.createElement("p", {
      className: "roue__question",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 32,
        columnNumber: 11
      }
    }, m.temps && /*#__PURE__*/React.createElement("span", {
      className: `roue__moment roue__moment--${m.temps}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 35,
        columnNumber: 15
      }
    }, roue.TEMPS.find(t => t.cle === m.temps).moment), /*#__PURE__*/React.createElement("span", {
      className: "roue__verbe",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 39,
        columnNumber: 13
      }
    }, m.verbe), /*#__PURE__*/React.createElement("span", {
      className: "roue__phrase",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 40,
        columnNumber: 13
      }
    }, termine ? roue.avecPronom(m.pronom, roue.forme(m.verbe, m.pronom, m.temps)) : `${m.pronom} …`))),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 25,
      columnNumber: 5
    }
  }));
}

/** La roue : huit parts, une par pronom, et la flèche sur celui du tirage. */
function Roue({
  pronom
}) {
  const n = roue.PRONOMS.length;
  const i = roue.PRONOMS.indexOf(pronom);
  // La roue tourne pour amener le pronom tiré sous la flèche, en haut.
  const angle = -((i + 0.5) / n) * 360;
  return /*#__PURE__*/React.createElement("svg", {
    className: "roue",
    viewBox: "-60 -66 120 126",
    role: "img",
    "aria-label": `La roue s’est arrêtée sur « ${pronom} »`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 57,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("g", {
    style: {
      transform: `rotate(${angle}deg)`
    },
    className: "roue__disque",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 58,
      columnNumber: 7
    }
  }, roue.PRONOMS.map((p, k) => {
    const a0 = k / n * 2 * Math.PI - Math.PI / 2;
    const a1 = (k + 1) / n * 2 * Math.PI - Math.PI / 2;
    const am = (a0 + a1) / 2;
    return /*#__PURE__*/React.createElement("g", {
      key: p,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 64,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: `M0 0 L${54 * Math.cos(a0)} ${54 * Math.sin(a0)} A54 54 0 0 1 ${54 * Math.cos(a1)} ${54 * Math.sin(a1)} Z`,
      className: `roue__part${p === pronom ? ' est-tiree' : ''}${k % 2 ? ' roue__part--b' : ''}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 65,
        columnNumber: 15
      }
    }), /*#__PURE__*/React.createElement("text", {
      x: 36 * Math.cos(am),
      y: 36 * Math.sin(am),
      textAnchor: "middle",
      dominantBaseline: "central",
      className: "roue__pronom"
      // TOUJOURS DROIT : la roue tourne, ses mots non — « snou », à
      // l'envers en bas de la roue, un enfant de sept ans ne le lit pas.
      ,
      transform: `rotate(${-angle} ${36 * Math.cos(am)} ${36 * Math.sin(am)})`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 69,
        columnNumber: 15
      }
    }, p));
  })), /*#__PURE__*/React.createElement("circle", {
    r: "8",
    className: "roue__axe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 85,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-7 -64 L7 -64 L0 -52 Z",
    className: "roue__fleche",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 86,
      columnNumber: 7
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `TempsCM1.js` ; il lit la classe. */
function RoueDesVerbes({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_TempsCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 93,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(RoueDesVerbesAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 93,
      columnNumber: 91
    }
  }));
}