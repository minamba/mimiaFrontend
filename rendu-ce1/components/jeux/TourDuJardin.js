const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TourDuJardin;
var jardin = _interopRequireWildcard(require("../../lib/jeux/tourDuJardin"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _AiresCM = _interopRequireDefault(require("./AiresCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\TourDuJardin.js";
/**
 * LE TOUR DU JARDIN, À L'ÉCRAN — le jardin dessiné, ses côtés écrits, trois
 * longueurs de clôture. Toute la règle vit dans `tourDuJardin.js`.
 */
const REGLE = {
  MANCHES: jardin.MANCHES,
  serie: jardin.serie,
  bilan: jardin.bilan,
  consigne: () => _repliques.repliquesJardin.consigne,
  choix: m => m.choix.map(n => ({
    cle: n,
    libelle: `${n} m`
  })),
  verdict: jardin.verdict,
  erreur: (m, sens) => _repliques.repliquesJardin.erreur(sens),
  aide: () => null
};
function TourDuJardinAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--jardin",
    rendreQuestion: (m, termine) => /*#__PURE__*/React.createElement("div", {
      className: "jardin",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 28,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement(Jardin, {
      figure: m,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 29,
        columnNumber: 11
      }
    }), termine && /*#__PURE__*/React.createElement("p", {
      className: "jardin__calcul",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 31,
        columnNumber: 13
      }
    }, jardin.cotes(m).join(' + '), " = ", m.bonne, " m")),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 5
    }
  }));
}

/** Les sommets de chaque forme, dans un carré de 200 sur 160. */
function sommets(f) {
  if (f.forme === 'rectangle') return [[20, 30], [180, 30], [180, 130], [20, 130]];
  if (f.forme === 'carre') return [[50, 20], [150, 20], [150, 120], [50, 120]];
  if (f.forme === 'triangle') return [[100, 15], [180, 140], [20, 140]];
  return [[100, 12], [180, 68], [150, 145], [50, 145], [20, 68]];
}

/**
 * LE JARDIN : de l'herbe, une clôture, et une longueur sur chaque côté — sauf
 * les côtés d'en face du rectangle, que l'enfant doit déduire.
 */
function Jardin({
  figure
}) {
  const pts = sommets(figure);
  const longueurs = jardin.cotes(figure);
  const visible = i => figure.forme !== 'rectangle' || i < 2;
  const etiquettes = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    // L'étiquette est poussée vers l'extérieur de la figure.
    const cx = 100;
    const cy = 80;
    const dx = mx - cx;
    const dy = my - cy;
    const d = Math.hypot(dx, dy) || 1;
    return {
      x: mx + dx / d * 16,
      y: my + dy / d * 16,
      texte: `${longueurs[i]} m`,
      i
    };
  });
  return /*#__PURE__*/React.createElement("svg", {
    className: "jardin__dessin",
    viewBox: "-20 -10 240 180",
    role: "img",
    "aria-label": `Un jardin en forme de ${figure.forme}, côtés : ${longueurs.join(', ')} mètres`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 68,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: pts.map(p => p.join(',')).join(' '),
    className: "jardin__herbe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 69,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("polygon", {
    points: pts.map(p => p.join(',')).join(' '),
    className: "jardin__cloture",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70,
      columnNumber: 7
    }
  }), figure.forme === 'carre' && /*#__PURE__*/React.createElement("text", {
    x: "100",
    y: "75",
    textAnchor: "middle",
    className: "jardin__note",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 71,
      columnNumber: 36
    }
  }, "4 c\xF4t\xE9s \xE9gaux"), etiquettes.filter(e => visible(e.i) && (figure.forme !== 'carre' || e.i === 0)).map(e => /*#__PURE__*/React.createElement("text", {
    key: e.i,
    x: e.x,
    y: e.y,
    textAnchor: "middle",
    dominantBaseline: "central",
    className: "jardin__longueur",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 73,
      columnNumber: 9
    }
  }, e.texte)));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `AiresCM1.js` ; il lit la classe. */
function TourDuJardin({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_AiresCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 81,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(TourDuJardinAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 81,
      columnNumber: 91
    }
  }));
}