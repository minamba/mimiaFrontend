const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MachineADix;
var _react = require("react");
var _machineADix = require("../../lib/jeux/machineADix");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\MachineADix.js";
/**
 * LA MACHINE À DIX, À L'ÉCRAN.
 *
 * Toute la règle vit dans `machineADix.js`.
 *
 * LA MACHINE EST DESSINÉE AVEC SES DEUX BOUCHES : l'entrée à gauche, la
 * sortie à droite, « × 10 » sur le capot. Le nombre connu est posé dans sa
 * bouche, l'autre porte un point d'interrogation jusqu'à la bonne réponse.
 *
 * UN NOMBRE TOUCHÉ EST UNE RÉPONSE — une seule à trouver.
 */
function MachineADix({
  onQuitter,
  matiereCode,
  niveau = 'CE1'
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _machineADix.serie)(graine, niveau), [graine, niveau]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [sens, setSens] = (0, _react.useState)(null);
  const [trouve, setTrouve] = (0, _react.useState)(false);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const sortie = courante.mode === 'sortie';
  const montrer = !trouve && fautes.length >= _machineADix.ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const facteur = (0, _machineADix.facteurDe)(courante);
  const laConsigne = _repliques.repliquesMachine.consigne(courante.mode, facteur);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const choisir = (0, _react.useCallback)(n => {
    if (termine) return;
    const s = (0, _machineADix.verdict)(n, courante);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup(x => x + 1);
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, n];
    setFautes(suivantes);
    setSens(s);
    dire(suivantes.length >= _machineADix.ESSAIS_AVANT_AIDE ? _repliques.repliquesMachine.aide(facteur) : _repliques.repliquesMachine.erreur(s));
  }, [termine, courante, fautes, manche, dire, facteur]);
  const suivante = (0, _react.useCallback)(() => {
    if (manche + 1 >= _machineADix.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setSens(null);
    setTrouve(false);
  }, [manche]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setSens(null);
    setTrouve(false);
    setDuPremierCoup(0);
    setFini(false);
  }, []);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 90,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 91,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 92,
        columnNumber: 27
      }
    }, "sur ", _machineADix.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 9
      }
    }, (0, _machineADix.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 96,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 97,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 100,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const entree = courante.entree;
  const sort = entree * facteur;
  const inconnu = /*#__PURE__*/React.createElement("span", {
    className: "machine__inconnu",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 19
    }
  }, "?");
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--machine",
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
    "aria-label": `Manche ${manche + 1} sur ${_machineADix.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.entree}-${i}`,
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
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 129,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "machine",
    role: "img",
    "aria-label": sortie ? `${entree} entre dans la machine` : `${sort} sort de la machine`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "machine__bouche",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 133,
      columnNumber: 9
    }
  }, sortie || termine ? entree : inconnu), /*#__PURE__*/React.createElement("span", {
    className: "machine__fleche",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 134,
      columnNumber: 9
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "machine__corps",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "machine__engrenage",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 11
    }
  }, "\u2699"), /*#__PURE__*/React.createElement("span", {
    className: "machine__capot",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 137,
      columnNumber: 11
    }
  }, "\xD7 ", facteur)), /*#__PURE__*/React.createElement("span", {
    className: "machine__fleche",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 139,
      columnNumber: 9
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "machine__bouche machine__bouche--sortie",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 9
    }
  }, !sortie || termine ? sort : inconnu)), !termine && /*#__PURE__*/React.createElement("ul", {
    className: "scene__choix",
    "aria-label": "Choisis le nombre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 144,
      columnNumber: 9
    }
  }, courante.choix.map(n => /*#__PURE__*/React.createElement("li", {
    key: n,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 146,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `scene__carte${fautes.includes(n) ? ' est-fausse' : ''}`,
    onClick: () => choisir(n),
    disabled: fautes.includes(n),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 15
    }
  }, n)))), sens && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 28
    }
  }, _machineADix.PHRASES[_machineADix.ERREURS[sens]]), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 163,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 23
    }
  }, facteur === 100 ? _machineADix.PHRASES.aideCent : _machineADix.PHRASES.aide), /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 165,
      columnNumber: 11
    }
  }, entree, " \xD7 ", facteur, " = ", sort), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 166,
      columnNumber: 11
    }
  }, "Continuer")), /*#__PURE__*/React.createElement("span", {
    className: "visuellement-cache",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 172,
      columnNumber: 7
    }
  }, termine ? `La réponse était ${(0, _machineADix.reponse)(courante)}.` : ''));
}