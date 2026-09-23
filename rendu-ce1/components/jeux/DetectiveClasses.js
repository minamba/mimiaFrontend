const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DetectiveClasses;
var _react = require("react");
var _detectiveDuVerbe = require("../../lib/jeux/detectiveDuVerbe");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\DetectiveClasses.js";
const ESSAIS_AVANT_AIDE = 2;

/**
 * LE DÉTECTIVE DES CLASSES — le détective du verbe au CE2, à l'écran.
 *
 * Toute la règle vit dans `detectiveDuVerbe.js`, section « le CE2 ».
 *
 * CHAQUE MOT EST UN BOUTON ; un mot faux reste barré, avec sous lui
 * l'étiquette de sa classe — l'erreur apprend quelque chose même quand elle
 * est une erreur. Le bon mot, une fois trouvé, porte la sienne en vert.
 */
function DetectiveClasses({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _detectiveDuVerbe.serieCE2)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [trouve, setTrouve] = (0, _react.useState)(null);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const {
    phrase: indice,
    cible
  } = manches[manche];
  const p = _detectiveDuVerbe.PHRASES_CE2[indice];
  const montrer = trouve === null && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve !== null || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesDetective.consigneClasse(cible);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const toucher = (0, _react.useCallback)(i => {
    if (termine) return;
    if (p.classes[i] === cible) {
      setTrouve(i);
      if (fautes.length === 0) setDuPremierCoup(n => n + 1);
      dire(_repliques.commun.bravo(manche));
      return;
    }
    setFautes(f => [...f, i]);
    dire([_repliques.repliquesDetective.estUn(p.classes[i]), _repliques.repliquesDetective.definition(cible)]);
  }, [termine, p, cible, fautes.length, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (manche + 1 >= _detectiveDuVerbe.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setTrouve(null);
  }, [manche]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setTrouve(null);
    setDuPremierCoup(0);
    setFini(false);
  }, []);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 82,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 83,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 84,
        columnNumber: 27
      }
    }, "sur ", _detectiveDuVerbe.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 86,
        columnNumber: 9
      }
    }, (0, _detectiveDuVerbe.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 88,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 89,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 92,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const derniere = fautes[fautes.length - 1];
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--detective",
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
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_detectiveDuVerbe.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 108,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    // eslint-disable-next-line react/no-array-index-key
    key: i,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 120,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "detective__phrase",
    "aria-label": "La phrase",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 123,
      columnNumber: 7
    }
  }, p.mots.map((mot, i) => {
    const faux = fautes.includes(i);
    const bon = trouve === i || montrer && p.classes[i] === cible;
    return /*#__PURE__*/React.createElement("button", {
      // Les mots d'une phrase peuvent se répéter : la place est l'identité.
      // eslint-disable-next-line react/no-array-index-key
      key: i,
      type: "button",
      className: `detective__mot${faux ? ' est-faux' : ''}${bon ? ' est-montre' : ''}`,
      onClick: () => toucher(i),
      disabled: termine || faux,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 128,
        columnNumber: 13
      }
    }, mot, (faux || bon) && p.classes[i] !== 'autre' && /*#__PURE__*/React.createElement("span", {
      className: "detective__etiquette",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 139,
        columnNumber: 17
      }
    }, _detectiveDuVerbe.NOMS_CLASSES[p.classes[i]].replace(/^une? /, '')));
  })), derniere !== undefined && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 9
    }
  }, _detectiveDuVerbe.PHRASES_CLASSES.estUn(p.classes[derniere]), " ", _detectiveDuVerbe.PHRASES_CLASSES.definition[cible]), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 23
    }
  }, _detectiveDuVerbe.PHRASES_CLASSES.definition[cible]), trouve !== null && /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 31
    }
  }, "Bien vu, d\xE9tective\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 11
    }
  }, "Continuer")));
}