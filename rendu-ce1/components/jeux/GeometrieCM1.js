const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var regle = _interopRequireWildcard(require("../../lib/jeux/geometrieCM1"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/geometrieCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\GeometrieCM1.js";
const rad = d => d * Math.PI / 180;

/** Un angle : deux demi-droites qui partent du même sommet. */
function Angle({
  angle,
  rotation
}) {
  const [cx, cy, r] = [70, 130, 110];
  const bout = a => [cx + r * Math.cos(rad(-(rotation + a))), cy + r * Math.sin(rad(-(rotation + a)))];
  const [x1, y1] = bout(0);
  const [x2, y2] = bout(angle);
  return /*#__PURE__*/React.createElement("svg", {
    className: "geo__dessin",
    viewBox: "0 0 200 180",
    role: "img",
    "aria-label": "Un angle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: cx,
    y1: cy,
    x2: x1,
    y2: y1,
    className: "geo__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 15,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: cx,
    y1: cy,
    x2: x2,
    y2: y2,
    className: "geo__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 16,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: 4,
    className: "geo__point",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 17,
      columnNumber: 7
    }
  }));
}

/** Deux droites : la seconde tournée de `ecart` degrés (0 : parallèle, décalée). */
function Droites({
  rotation,
  ecart
}) {
  const trait = (angle, dx, dy) => {
    const [c, s] = [Math.cos(rad(angle)), Math.sin(rad(angle))];
    return {
      x1: 100 + dx - 90 * c,
      y1: 90 + dy - 90 * s,
      x2: 100 + dx + 90 * c,
      y2: 90 + dy + 90 * s
    };
  };
  const decale = ecart === 0 ? 34 : 0;
  const n = [-Math.sin(rad(rotation)) * decale, Math.cos(rad(rotation)) * decale];
  return /*#__PURE__*/React.createElement("svg", {
    className: "geo__dessin",
    viewBox: "0 0 200 180",
    role: "img",
    "aria-label": "Deux droites",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("line", Object.assign({}, trait(rotation, -n[0], -n[1]), {
    className: "geo__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 7
    }
  })), /*#__PURE__*/React.createElement("line", Object.assign({}, trait(rotation + ecart, n[0], n[1]), {
    className: "geo__trait geo__trait--second",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 33,
      columnNumber: 7
    }
  })));
}
const C = 22;

/** Une moitié de figure en carreaux ; `droite` la place à droite de l'axe. */
function Moitie({
  cases,
  droite
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: "geo__moitie",
    viewBox: `0 0 ${regle.LARGEUR * C} ${regle.HAUTEUR * C}`,
    role: "img",
    "aria-label": "Une moiti\xE9 de figure",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 43,
      columnNumber: 5
    }
  }, Array.from({
    length: regle.LARGEUR * regle.HAUTEUR
  }, (_, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: i % regle.LARGEUR * C,
    y: Math.floor(i / regle.LARGEUR) * C,
    width: C,
    height: C,
    className: "aires__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 45,
      columnNumber: 9
    }
  })), cases.map(([x, y]) => /*#__PURE__*/React.createElement("rect", {
    key: `${x}.${y}`,
    x: x * C,
    y: y * C,
    width: C,
    height: C,
    className: droite ? 'geo__case geo__case--reflet' : 'geo__case',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 48,
      columnNumber: 9
    }
  })));
}
function Miroir({
  gauche
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "geo__miroir",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 56,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Moitie, {
    cases: gauche,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 57,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "geo__axe",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 58,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "geo__vide",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 59,
      columnNumber: 7
    }
  }, "?"));
}

/** Les figures usuelles du CM2, dessinées à plat. */
const SOMMETS = {
  carre: '55,35 135,35 135,115 55,115',
  rectangle: '25,50 175,50 175,125 25,125',
  losange: '100,15 155,90 100,165 45,90',
  parallelogramme: '55,50 175,50 145,130 25,130',
  'triangle-rectangle': '45,30 45,145 165,145',
  'triangle-equilateral': '100,25 170,146 30,146',
  'triangle-isocele': '100,20 140,150 60,150'
};
function Figure({
  figure
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: "geo__dessin",
    viewBox: "0 0 200 180",
    role: "img",
    "aria-label": "Une figure",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 77,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("polygon", {
    points: SOMMETS[figure],
    className: "geo__figure",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 78,
      columnNumber: 7
    }
  }));
}
function Question(m) {
  if (m.consigne === 'angle' || m.consigne === 'mesure') return /*#__PURE__*/React.createElement(Angle, {
    angle: m.angle,
    rotation: m.rotation,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 84,
      columnNumber: 65
    }
  });
  if (m.consigne === 'figure') return /*#__PURE__*/React.createElement(Figure, {
    figure: m.figure,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 85,
      columnNumber: 39
    }
  });
  if (m.consigne === 'droites') return /*#__PURE__*/React.createElement(Droites, {
    rotation: m.rotation,
    ecart: m.ecart,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 86,
      columnNumber: 40
    }
  });
  return /*#__PURE__*/React.createElement(Miroir, {
    gauche: m.gauche,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 87,
      columnNumber: 10
    }
  });
}

/**
 * LA GÉOMÉTRIE DU CM1 — le miroir au CM1, à l'écran. Angles, droites et
 * figures se dessinent ici ; toute la règle vit dans `geometrieCM1.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'geometrie-cm1',
  classe: 'jeu--miroir',
  rendreQuestion: Question,
  rendreChoix: (c, m) => m.consigne === 'miroir' ? /*#__PURE__*/React.createElement(Moitie, {
    cases: m.moities[c.cle],
    droite: true,
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 99,
      columnNumber: 53
    }
  }) : c.libelle,
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'geometrie-cm2'
    }
  }
});