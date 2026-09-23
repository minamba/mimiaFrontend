const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Miroir;
var miroir = _interopRequireWildcard(require("../../lib/jeux/miroir"));
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _GeometrieCM = _interopRequireDefault(require("./GeometrieCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Miroir.js";
/**
 * LE MIROIR, À L'ÉCRAN — une figure et trois lignes, ou un triangle et ses
 * trois coins. Toute la règle vit dans `miroir.js`.
 *
 * UNE FOIS L'AXE TROUVÉ, IL S'ÉCLAIRE en pointillé vert, comme le pli d'une
 * feuille. Une fois l'angle droit trouvé, le petit carré de l'équerre s'y pose.
 */
const REGLE = {
  MANCHES: miroir.MANCHES,
  serie: miroir.serie,
  bilan: miroir.bilan,
  consigne: m => _repliques.repliquesMiroir.consigne(m.mode),
  choix: m => m.choix.map(l => ({
    cle: l,
    libelle: l
  })),
  verdict: miroir.verdict,
  erreur: (m, sens) => _repliques.repliquesMiroir.erreur(sens),
  aide: () => null
};
function MiroirAvantCM1(props) {
  return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
    regle: REGLE,
    classe: "jeu--miroir",
    rendreQuestion: (m, termine) => m.mode === 'axe' ? /*#__PURE__*/React.createElement(Axe, {
      m: m,
      termine: termine,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 59
      }
    }) : /*#__PURE__*/React.createElement(Angle, {
      m: m,
      termine: termine,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 30,
        columnNumber: 93
      }
    }),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 5
    }
  }));
}
function Axe({
  m,
  termine
}) {
  const points = m.points.map(p => p.join(',')).join(' ');
  return /*#__PURE__*/React.createElement("svg", {
    className: "miroir__dessin",
    viewBox: "0 0 200 165",
    role: "img",
    "aria-label": "Une figure et trois lignes, A, B et C",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 38,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: points,
    className: "miroir__figure",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 39,
      columnNumber: 7
    }
  }), m.traces.map(t => /*#__PURE__*/React.createElement("g", {
    key: t.lettre,
    className: `miroir__trace${termine && t.sorte === 'axe' ? ' est-axe' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 41,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: t.points[0][0],
    y1: t.points[0][1],
    x2: t.points[1][0],
    y2: t.points[1][1],
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 42,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: t.points[0][0] + 6,
    y: t.points[0][1] + 12,
    className: "miroir__lettre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 43,
      columnNumber: 11
    }
  }, t.lettre))));
}
function Angle({
  m,
  termine
}) {
  const [droit, ...autres] = m.sommets;
  const pts = m.sommets.map(s => s.point.join(',')).join(' ');
  // Le petit carré de l'équerre, tourné vers l'intérieur du triangle.
  const [x, y] = droit.point;
  const sx = Math.sign(autres[0].point[0] - x) || Math.sign(autres[1].point[0] - x);
  const sy = Math.sign(autres[1].point[1] - y) || Math.sign(autres[0].point[1] - y);
  const c = 14;
  return /*#__PURE__*/React.createElement("svg", {
    className: "miroir__dessin",
    viewBox: "0 0 200 165",
    role: "img",
    "aria-label": "Un triangle et ses trois coins, A, B et C",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 59,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: pts,
    className: "miroir__figure miroir__figure--triangle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 60,
      columnNumber: 7
    }
  }), termine && /*#__PURE__*/React.createElement("path", {
    d: `M${x + sx * c} ${y} L${x + sx * c} ${y + sy * c} L${x} ${y + sy * c}`,
    className: "miroir__equerre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 62,
      columnNumber: 9
    }
  }), m.sommets.map(s => {
    const [px, py] = s.point;
    const dx = px < 100 ? -12 : 12;
    const dy = py < 80 ? -8 : 14;
    return /*#__PURE__*/React.createElement("text", {
      key: s.lettre,
      x: px + dx,
      y: py + dy,
      textAnchor: "middle",
      className: "miroir__lettre",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 68,
        columnNumber: 16
      }
    }, s.lettre);
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `GeometrieCM1.js` ; il lit la classe. */
function Miroir({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_GeometrieCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 76,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(MiroirAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 76,
      columnNumber: 95
    }
  }));
}