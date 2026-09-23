const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chemin = chemin;
exports.default = void 0;
var _react = require("react");
var regle = _interopRequireWildcard(require("../../lib/jeux/robot"));
var regleCM2 = _interopRequireWildcard(require("../../lib/jeux/robotCM2"));
var _JeuSimple = _interopRequireDefault(require("./JeuSimple"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Robot.js";
const C = 44;
const PAS_MS = 420;

/** Les flèches d'un programme : « →→↑ » au CM1, « 3|→↑ » (une boucle) au CM2. */
const fleches = programme => programme.includes('|') ? regleCM2.deplier(programme) : [...programme];

/**
 * LE CHEMIN QUE SUIT LE ROBOT, case par case. S'il sortirait du quadrillage,
 * il s'arrête au bord : `sorti` le dit, pour l'expliquer à l'enfant.
 */
function chemin(depart, programme) {
  const cases = [depart];
  let [x, y] = depart;
  for (const f of fleches(programme)) {
    const [dx, dy] = regle.PAS[f];
    if (x + dx < 0 || y + dy < 0 || x + dx >= regle.TAILLE || y + dy >= regle.TAILLE) {
      return {
        cases,
        sorti: true
      };
    }
    x += dx;
    y += dy;
    cases.push([x, y]);
  }
  return {
    cases,
    sorti: false
  };
}
const moinsDeMouvement = () => {
  var _window$matchMedia, _window;
  return typeof window !== 'undefined' && ((_window$matchMedia = (_window = window).matchMedia) === null || _window$matchMedia === void 0 ? void 0 : _window$matchMedia.call(_window, '(prefers-reduced-motion: reduce)').matches);
};

/**
 * LE ROBOT REJOUE LE PROGRAMME TOUCHÉ — Camara, le 22/09/2026 : « montrer le
 * chemin qu'on a choisi et faire déplacer le robot case par case, pour que
 * l'enfant comprenne visuellement pourquoi c'est bon ou pas bon ». À chaque
 * programme touché, juste ou faux, le robot repart de sa case et avance d'un
 * pas toutes les 0,4 s en laissant sa trace. À l'arrivée : l'étoile s'allume
 * s'il l'atteint, sinon une croix marque où il s'est arrêté. Quand le jeu
 * montre la réponse, c'est le bon chemin qu'il rejoue. Moins d'animations
 * demandées : le chemin s'affiche d'un coup.
 */
function Terrain({
  depart,
  etoile,
  programme
}) {
  const cote = regle.TAILLE * C;
  const trajet = (0, _react.useMemo)(() => programme ? chemin(depart, programme) : null, [depart, programme]);
  const [pas, setPas] = (0, _react.useState)(0);
  (0, _react.useEffect)(() => {
    if (!trajet) return undefined;
    if (moinsDeMouvement()) {
      setPas(trajet.cases.length - 1);
      return undefined;
    }
    setPas(0);
    let n = 0;
    const minuteur = setInterval(() => {
      n += 1;
      setPas(n);
      if (n >= trajet.cases.length - 1) clearInterval(minuteur);
    }, PAS_MS);
    return () => clearInterval(minuteur);
  }, [trajet]);
  const centre = ([x, y]) => [x * C + C / 2, y * C + C / 2];
  const parcourues = trajet ? trajet.cases.slice(0, pas + 1) : [depart];
  const robot = parcourues[parcourues.length - 1];
  const arrive = trajet && pas >= trajet.cases.length - 1;
  const surEtoile = arrive && !trajet.sorti && robot[0] === etoile[0] && robot[1] === etoile[1];
  const rate = arrive && !surEtoile;
  return /*#__PURE__*/React.createElement("svg", {
    className: "robot__terrain",
    viewBox: `0 0 ${cote} ${cote}`,
    role: "img",
    "aria-label": "Un robot et une \xE9toile sur un quadrillage",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 73,
      columnNumber: 5
    }
  }, Array.from({
    length: regle.TAILLE ** 2
  }, (_, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: i % regle.TAILLE * C,
    y: Math.floor(i / regle.TAILLE) * C,
    width: C,
    height: C,
    className: "aires__trait",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 75,
      columnNumber: 9
    }
  })), trajet && parcourues.length > 1 && /*#__PURE__*/React.createElement("polyline", {
    points: parcourues.map(c => centre(c).join(',')).join(' '),
    className: `robot__trace${rate ? ' est-ratee' : ''}${surEtoile ? ' est-reussie' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80,
      columnNumber: 9
    }
  }), trajet && parcourues.slice(1).map((c, i) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement("circle", {
    key: i,
    cx: centre(c)[0],
    cy: centre(c)[1],
    r: 5,
    className: "robot__pas",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 87,
      columnNumber: 9
    }
  })), surEtoile && /*#__PURE__*/React.createElement("circle", {
    cx: centre(etoile)[0],
    cy: centre(etoile)[1],
    r: C / 2 - 3,
    className: "robot__gagne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 90,
      columnNumber: 21
    }
  }), /*#__PURE__*/React.createElement("text", {
    x: centre(etoile)[0],
    y: centre(etoile)[1],
    className: "robot__pion",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 91,
      columnNumber: 7
    }
  }, "\u2B50"), /*#__PURE__*/React.createElement("text", {
    x: centre(robot)[0],
    y: centre(robot)[1],
    className: "robot__pion robot__pion--robot",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 92,
      columnNumber: 7
    }
  }, "\uD83E\uDD16"), rate && /*#__PURE__*/React.createElement("g", {
    className: "robot__croix",
    transform: `translate(${centre(robot)[0] + C / 3}, ${centre(robot)[1] - C / 3})`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 96,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("circle", {
    r: 10,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 97,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-4 -4 L4 4 M4 -4 L-4 4",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 98,
      columnNumber: 11
    }
  })));
}

/** Le programme à rejouer : le bon s'il est trouvé ou montré, sinon le dernier faux. */
function programmeARejouer(m, etat) {
  if (!etat) return null;
  if (etat.trouve || etat.montrer) return m.bonne;
  return etat.derniereFaute;
}

/**
 * LE ROBOT — à l'écran. Toute la règle vit dans `robot.js`.
 */
var _default = exports.default = (0, _JeuSimple.default)({
  module: regle,
  prefixe: 'robot',
  classe: 'jeu--robot',
  rendreQuestion: (m, termine, etat) => {
    var _programmeARejouer;
    return /*#__PURE__*/React.createElement(Terrain
    // Une nouvelle manche, ou un autre programme touché : le robot repart.
    , {
      key: `${m.depart.join('.')}-${m.etoile.join('.')}-${(_programmeARejouer = programmeARejouer(m, etat)) !== null && _programmeARejouer !== void 0 ? _programmeARejouer : 'rien'}`,
      depart: m.depart,
      etoile: m.etoile,
      programme: programmeARejouer(m, etat),
      __self: void 0,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 120,
        columnNumber: 5
      }
    });
  },
  parNiveau: {
    CM2: {
      module: regleCM2,
      prefixe: 'robot-cm2'
    }
  }
});