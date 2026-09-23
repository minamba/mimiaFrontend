const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CourseDesTables;
var _react = require("react");
var _courseDesTables = require("../../lib/jeux/courseDesTables");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _CalculMental = _interopRequireDefault(require("./CalculMental"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\CourseDesTables.js";
/**
 * LA COURSE DES TABLES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `courseDesTables.js`, y compris pourquoi il n'y a
 * pas de chronomètre.
 *
 * UNE CARTE TOUCHÉE EST UNE RÉPONSE : il n'y a qu'un résultat à trouver,
 * rien à assembler, donc rien à annoncer — comme les mots éclair.
 *
 * LA PISTE EST LE SCORE : dix cases, la voiture avance d'une case par bonne
 * réponse du premier coup. L'enfant voit sa course avancer, pas un nombre.
 */
function CourseDesTablesAvantCM1({
  onQuitter,
  matiereCode,
  niveau = 'CE1'
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _courseDesTables.serie)(graine, niveau), [graine, niveau]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [trouve, setTrouve] = (0, _react.useState)(false);
  const [avance, setAvance] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const {
    a,
    b
  } = courante;
  const montrer = !trouve && fautes.length >= _courseDesTables.ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laQuestion = courante.jumelle ? _repliques.repliquesCourse.jumelle(a, b) : _repliques.repliquesCourse.question(a, b);
  (0, _react.useEffect)(() => {
    if (!fini) dire(manche === 0 ? [_repliques.repliquesCourse.consigne, laQuestion] : laQuestion);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laQuestion.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(avance, _courseDesTables.MANCHES));
  }, [fini, avance, dire]);
  const choisir = (0, _react.useCallback)(r => {
    if (termine) return;
    if (r === a * b) {
      setTrouve(true);
      if (fautes.length === 0) setAvance(n => n + 1);
      dire(_repliques.commun.bravo(manche));
      return;
    }
    setFautes(f => [...f, r]);
    dire(courante.jumelle ? _repliques.repliquesCourse.rappelJumelle : _repliques.repliquesCourse.methode(a, b));
  }, [termine, a, b, fautes.length, courante.jumelle, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (manche + 1 >= _courseDesTables.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setTrouve(false);
  }, [manche]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setTrouve(false);
    setAvance(0);
    setFini(false);
  }, []);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 84,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 85,
        columnNumber: 9
      }
    }, avance, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 86,
        columnNumber: 20
      }
    }, "sur ", _courseDesTables.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 88,
        columnNumber: 9
      }
    }, (0, _courseDesTables.bilan)(avance)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 90,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 91,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--course",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 103,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 104,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 108,
      columnNumber: 7
    }
  }, _courseDesTables.PHRASES.consigne, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laQuestion,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "course__piste",
    role: "img",
    "aria-label": `Ta voiture a avancé de ${avance} cases sur ${_courseDesTables.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 114,
      columnNumber: 7
    }
  }, Array.from({
    length: _courseDesTables.MANCHES
  }, (_, i) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement("span", {
    key: i,
    className: `course__case${i < avance ? ' est-parcourue' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 117,
      columnNumber: 11
    }
  })), /*#__PURE__*/React.createElement(Arrivee, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 119,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "course__voiture",
    style: {
      left: `calc(${avance / _courseDesTables.MANCHES * 100}% * 0.9)`
    },
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 120,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement(Voiture, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 125,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "course__question",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 130,
      columnNumber: 7
    }
  }, courante.jumelle && /*#__PURE__*/React.createElement("p", {
    className: "course__modele",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 11
    }
  }, courante.modele[0], " \xD7 ", courante.modele[1], " = ", a * b), /*#__PURE__*/React.createElement("p", {
    className: "course__calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 9
    }
  }, a, " \xD7 ", b, " = ", termine ? /*#__PURE__*/React.createElement("strong", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 137,
      columnNumber: 34
    }
  }, a * b) : '?')), !termine && /*#__PURE__*/React.createElement("ul", {
    className: "scene__choix",
    "aria-label": "Choisis le r\xE9sultat",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 142,
      columnNumber: 9
    }
  }, courante.choix.map(r => /*#__PURE__*/React.createElement("li", {
    key: r,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 144,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `scene__carte${fautes.includes(r) ? ' est-fausse' : ''}`,
    onClick: () => choisir(r),
    disabled: fautes.includes(r),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 145,
      columnNumber: 15
    }
  }, r)))), fautes.length > 0 && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 159,
      columnNumber: 9
    }
  }, courante.jumelle ? _courseDesTables.PHRASES.jumelle : (0, _courseDesTables.methode)(a, b)), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 165,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 167,
      columnNumber: 13
    }
  }, courante.jumelle ? _courseDesTables.PHRASES.jumelle : (0, _courseDesTables.methode)(a, b)), trouve && /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 22
    }
  }, fautes.length === 0 ? 'Vroum ! Une case de plus.' : 'Trouvé !'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 172,
      columnNumber: 11
    }
  }, "Continuer")));
}

/**
 * LA VOITURE ET L'ARRIVÉE SONT DESSINÉES, pas des émojis : sur certains
 * écrans l'émoji de course sortait minuscule, et la voiture est tout le score.
 */
function Voiture() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 30",
    className: "course__dessin-voiture",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 20 L10 12 L24 10 L34 3 L48 4 L56 12 L61 14 L61 21 L4 22 Z",
    fill: "#e63946",
    stroke: "#9b1c27",
    strokeWidth: "1.5",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 188,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M28 10 L35 5 L46 5.5 L51 11 Z",
    fill: "#cfeaf8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "22",
    r: "6",
    fill: "#2c2c36",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 190,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "48",
    cy: "22",
    r: "6",
    fill: "#2c2c36",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 191,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "22",
    r: "2.4",
    fill: "#b8bec8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 192,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "48",
    cy: "22",
    r: "2.4",
    fill: "#b8bec8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 7
    }
  }));
}
function Arrivee() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 28",
    className: "course__arrivee",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 200,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "3",
    y1: "2",
    x2: "3",
    y2: "27",
    stroke: "#fff",
    strokeWidth: "2",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 201,
      columnNumber: 7
    }
  }), [0, 1, 2, 3].map(l => [0, 1, 2].map(c => /*#__PURE__*/React.createElement("rect", {
    key: `${l}-${c}`,
    x: 4 + c * 6,
    y: 2 + l * 4,
    width: "6",
    height: "4",
    fill: (l + c) % 2 ? '#111' : '#fff',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 203,
      columnNumber: 9
    }
  }))));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `CalculMental.js` ; il lit la classe. */
function CourseDesTables({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_CalculMental.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 211,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(CourseDesTablesAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 211,
      columnNumber: 95
    }
  }));
}