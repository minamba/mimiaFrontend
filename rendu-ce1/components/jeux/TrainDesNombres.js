const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TrainDesNombres;
var _react = require("react");
var _trainDesNombres = require("../../lib/jeux/trainDesNombres");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\TrainDesNombres.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/train_bg.webp';
/**
 * LE TRAIN DES NOMBRES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `trainDesNombres.js`, y compris pourquoi seules
 * trois graduations portent leur nombre.
 *
 * L'ENFANT CLIQUE UNE TRAVERSE, il n'y fait pas glisser un wagon. Le
 * glisser-déposer échoue sur un trackpad, sur un écran tactile mal calibré, et
 * il est inaccessible au clavier — trois façons de perdre un enfant de six ans
 * sur un geste qui n'est pas la leçon.
 *
 * LE DÉCOR EST UNE IMAGE, LE JEU EST DESSINÉ : la voie graduée et le wagon
 * sont en vectoriel, posés sur le quai de la gare.
 *
 * LA LOCOMOTIVE EST GARÉE SUR LE ZÉRO, pas à côté de la voie. Posée à gauche
 * de la demi-droite, elle devait esquiver le banc et la valise du quai, ce qui
 * poussait toute la graduation vers la droite et la décentrait. À l'arrêt
 * zéro, elle ne prend aucune place et dit la même chose : c'est d'ici que
 * part la demi-droite. Elle laisse passer les clics, pour ne pas transformer
 * une borne en zone morte.
 */
function TrainDesNombres({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _trainDesNombres.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [pose, setPose] = (0, _react.useState)(null);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const arrets = (0, _react.useMemo)(() => (0, _trainDesNombres.graduations)(courante.voie), [courante.voie]);
  const sens = pose === null ? null : (0, _trainDesNombres.verdict)(pose, courante.nombre);
  const juste = sens === 'juste';

  // LA VOIX DE LA PROFESSEURE : la consigne à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  (0, _react.useEffect)(() => {
    if (!fini) dire(_repliques.repliquesTrain.consigne);
  }, [manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const accrocher = (0, _react.useCallback)(valeur => {
    if (juste) return;
    setPose(valeur);
    if (valeur !== courante.nombre) setPropre(false);
    const s = (0, _trainDesNombres.verdict)(valeur, courante.nombre);
    if (s === 'juste') dire(_repliques.commun.bravo(manche));else dire(s === 'trop-loin' ? _repliques.repliquesTrain.tropLoin : _repliques.repliquesTrain.pasAssezLoin);
  }, [courante.nombre, juste, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _trainDesNombres.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPose(null);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPose(null);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
  }, []);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 95,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 96,
        columnNumber: 27
      }
    }, "sur ", _trainDesNombres.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 98,
        columnNumber: 9
      }
    }, (0, _trainDesNombres.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 100,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 101,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 104,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--train",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 113,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 114,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_trainDesNombres.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.nombre}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 120,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 127,
      columnNumber: 7
    }
  }, _trainDesNombres.PHRASES.consigne, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: _repliques.repliquesTrain.consigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 129,
      columnNumber: 9
    }
  })), !juste && /*#__PURE__*/React.createElement("div", {
    className: "train__wagon-attente",
    "aria-label": `Wagon numéro ${courante.nombre}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement(Wagon, {
    nombre: courante.nombre,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 11
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "voie",
    role: "group",
    "aria-label": "La voie ferr\xE9e",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("ul", {
    className: "voie__arrets",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 9
    }
  }, arrets.map(valeur => {
    const repere = courante.voie.reperes.includes(valeur);
    const ici = juste && valeur === courante.nombre;
    return /*#__PURE__*/React.createElement("li", {
      key: valeur,
      className: "voie__arret",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 147,
        columnNumber: 15
      }
    }, ici && /*#__PURE__*/React.createElement("span", {
      className: "voie__wagon-pose",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 149,
        columnNumber: 19
      }
    }, /*#__PURE__*/React.createElement(Wagon, {
      nombre: courante.nombre,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 150,
        columnNumber: 21
      }
    })), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `traverse${repere ? ' est-repere' : ''}${pose === valeur && !juste ? ' est-refusee' : ''}`,
      onClick: () => accrocher(valeur),
      disabled: juste,
      "aria-label": repere ? `Arrêt ${valeur}` : `Arrêt entre les repères, position ${valeur}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 154,
        columnNumber: 17
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "traverse__trait",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 161,
        columnNumber: 19
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "traverse__nombre",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 164,
        columnNumber: 19
      }
    }, repere ? valeur : '')), valeur === 0 && /*#__PURE__*/React.createElement("span", {
      className: "voie__locomotive",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 168,
        columnNumber: 19
      }
    }, /*#__PURE__*/React.createElement(Locomotive, {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 169,
        columnNumber: 21
      }
    })));
  })), /*#__PURE__*/React.createElement("span", {
    className: "voie__rail",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 177,
      columnNumber: 9
    }
  })), sens === 'trop-loin' && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 181,
      columnNumber: 9
    }
  }, _trainDesNombres.PHRASES.tropLoin), sens === 'pas-assez-loin' && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 184,
      columnNumber: 9
    }
  }, _trainDesNombres.PHRASES.pasAssezLoin), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 188,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 11
    }
  }, courante.nombre), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 190,
      columnNumber: 11
    }
  }, "Continuer")));
}

/** La locomotive, à l'arrêt sur le zéro. */
function Locomotive() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "locomotive",
    viewBox: "0 0 84 60",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 202,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    className: "locomotive__corps",
    x: "6",
    y: "18",
    width: "54",
    height: "26",
    rx: "6",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 203,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "locomotive__cabine",
    x: "44",
    y: "6",
    width: "30",
    height: "38",
    rx: "6",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 204,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "locomotive__vitre",
    x: "52",
    y: "13",
    width: "15",
    height: "13",
    rx: "3",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 205,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "locomotive__cheminee",
    x: "12",
    y: "6",
    width: "12",
    height: "14",
    rx: "3",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 206,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "locomotive__roue",
    cx: "22",
    cy: "50",
    r: "9",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 207,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "locomotive__roue",
    cx: "58",
    cy: "50",
    r: "9",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 7
    }
  }));
}

/** Le wagon, avec son numéro peint sur le flanc. */
function Wagon({
  nombre
}) {
  return /*#__PURE__*/React.createElement("svg", {
    className: "wagon",
    viewBox: "0 0 76 56",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 216,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    className: "wagon__caisse",
    x: "4",
    y: "6",
    width: "68",
    height: "34",
    rx: "6",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 217,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "wagon__plaque",
    x: "14",
    y: "12",
    width: "48",
    height: "22",
    rx: "4",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 218,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("text", {
    className: "wagon__nombre",
    x: "38",
    y: "30",
    textAnchor: "middle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 219,
      columnNumber: 7
    }
  }, nombre), /*#__PURE__*/React.createElement("circle", {
    className: "wagon__roue",
    cx: "20",
    cy: "46",
    r: "8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 220,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "wagon__roue",
    cx: "56",
    cy: "46",
    r: "8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 221,
      columnNumber: 7
    }
  }));
}