const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DetectiveDuVerbe;
var _react = require("react");
var _detectiveDuVerbe = require("../../lib/jeux/detectiveDuVerbe");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _DetectiveClasses = _interopRequireDefault(require("./DetectiveClasses"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\DetectiveDuVerbe.js";
const ESSAIS_AVANT_AIDE = 2;

/**
 * LE DÉTECTIVE DU VERBE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `detectiveDuVerbe.js`.
 *
 * CHAQUE MOT DE LA PHRASE EST UN BOUTON. Au premier temps on cherche le
 * verbe, au second le sujet ; un mot faux reste barré le temps de la
 * question. Le verbe trouvé est souligné en rouge, le sujet en bleu — les
 * couleurs de la classe — et chacun garde aussi son étiquette écrite dessous,
 * pour ne pas reposer sur la couleur seule.
 *
 * LA MANCHE COMPTE « DU PREMIER COUP » si le verbe ET le sujet ont été
 * trouvés sans erreur.
 */
/** Au CE2, le détective enquête sur les classes de mots — voir `DetectiveClasses.js`. */
function DetectiveDuVerbe({
  niveau,
  ...props
}) {
  return niveau === 'CE2' ? /*#__PURE__*/React.createElement(_DetectiveClasses.default, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 29
    }
  })) : /*#__PURE__*/React.createElement(DetectiveVerbeSujet, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 28,
      columnNumber: 63
    }
  }));
}
function DetectiveVerbeSujet({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _detectiveDuVerbe.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [temps, setTemps] = (0, _react.useState)('verbe');
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const p = (0, _detectiveDuVerbe.phrase)(manches[manche]);
  const montrer = fautes.length >= ESSAIS_AVANT_AIDE;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = temps === 'verbe' ? _repliques.repliquesDetective.consigneVerbe : _repliques.repliquesDetective.sujet(p);
  (0, _react.useEffect)(() => {
    if (!fini && temps !== 'fini') dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const toucher = (0, _react.useCallback)(i => {
    if (temps === 'fini') return;
    const bon = temps === 'verbe' ? (0, _detectiveDuVerbe.estVerbe)(p, i) : (0, _detectiveDuVerbe.estSujet)(p, i);
    if (bon) {
      setFautes([]);
      if (temps === 'verbe') setTemps('sujet');else {
        setTemps('fini');
        dire(_repliques.commun.bravo(manche));
      }
      return;
    }
    setPropre(false);
    setFautes(f => [...f, i]);
    dire(temps === 'verbe' ? _repliques.repliquesDetective.erreurVerbe : _repliques.repliquesDetective.erreurSujet);
  }, [temps, p, manche, dire]);

  // Au bout de deux erreurs, on montre le bon mot et on passe au temps suivant.
  const passer = (0, _react.useCallback)(() => {
    setFautes([]);
    setTemps(t => t === 'verbe' ? 'sujet' : 'fini');
  }, []);
  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _detectiveDuVerbe.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setTemps('verbe');
    setFautes([]);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setTemps('verbe');
    setFautes([]);
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
        lineNumber: 106,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 107,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 108,
        columnNumber: 27
      }
    }, "sur ", _detectiveDuVerbe.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 110,
        columnNumber: 9
      }
    }, (0, _detectiveDuVerbe.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 112,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 113,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 116,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const verbeTrouve = temps !== 'verbe';
  const sujetTrouve = temps === 'fini';
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--detective",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 128,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 129,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_detectiveDuVerbe.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 133,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: m,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 142,
      columnNumber: 7
    }
  }, temps === 'fini' ? 'Bien joué, détective !' : laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 144,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "detective__phrase",
    "aria-label": "La phrase",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 7
    }
  }, p.mots.map((mot, i) => {
    const verbe = verbeTrouve && (0, _detectiveDuVerbe.estVerbe)(p, i);
    const sujet = sujetTrouve && (0, _detectiveDuVerbe.estSujet)(p, i);
    const montre = montrer && (temps === 'verbe' ? (0, _detectiveDuVerbe.estVerbe)(p, i) : (0, _detectiveDuVerbe.estSujet)(p, i));
    return /*#__PURE__*/React.createElement("button", {
      // Les mots d'une phrase peuvent se répéter : la place est l'identité.
      // eslint-disable-next-line react/no-array-index-key
      key: i,
      type: "button",
      className: `detective__mot${verbe ? ' est-verbe' : ''}${sujet ? ' est-sujet' : ''}${fautes.includes(i) ? ' est-faux' : ''}${montre ? ' est-montre' : ''}`,
      onClick: () => toucher(i),
      disabled: temps === 'fini' || fautes.includes(i) || montrer || verbe,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 153,
        columnNumber: 13
      }
    }, mot, verbe && /*#__PURE__*/React.createElement("span", {
      className: "detective__etiquette",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 163,
        columnNumber: 25
      }
    }, "verbe"), sujet && i === p.sujet[0] && /*#__PURE__*/React.createElement("span", {
      className: "detective__etiquette",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 164,
        columnNumber: 45
      }
    }, "sujet"));
  })), fautes.length > 0 && !montrer && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 9
    }
  }, temps === 'verbe' ? _detectiveDuVerbe.PHRASES.erreurVerbe : _detectiveDuVerbe.PHRASES.erreurSujet), montrer && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 175,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 176,
      columnNumber: 11
    }
  }, "Regarde : ", temps === 'verbe' ? 'voici le verbe.' : 'voici le sujet.'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: passer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 177,
      columnNumber: 11
    }
  }, "Continuer")), temps === 'fini' && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 184,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 185,
      columnNumber: 11
    }
  }, (0, _detectiveDuVerbe.questionSujet)(p).replace(' Touche le sujet.', ''), ' ', /*#__PURE__*/React.createElement("strong", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 18
    }
  }, p.sujet.map(i => p.mots[i].replace(/[,.]$/, '')).join(' '))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 11
    }
  }, "Continuer")));
}