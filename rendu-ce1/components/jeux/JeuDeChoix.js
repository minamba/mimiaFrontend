const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESSAIS_AVANT_AIDE = void 0;
exports.default = JeuDeChoix;
var _react = require("react");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\JeuDeChoix.js";
/**
 * L'ÉCRAN COMMUN DES JEUX « UNE QUESTION, DES CHOIX » — a ou à, les types de
 * phrases, la roue des verbes, contraires et jumeaux. Camara, le 21/09/2026 :
 * « code vraiment tout ». Quatre jeux qui ne diffèrent que par leur contenu
 * partagent donc un seul écran ; chacun lui confie sa RÈGLE (le module pur)
 * et la façon de montrer sa question.
 *
 * LA RÈGLE FOURNIT :
 *   serie(graine), MANCHES, bilan(n), consigne(m), choix(m) → [{ cle, libelle }],
 *   verdict(m, cle) → 'juste' ou le nom de l'erreur, erreur(m, sens) et
 *   aide(m) → des répliques { cle, texte }.
 *
 * LES RÈGLES DE TOUS LES JEUX VALENT ICI : un choix touché est une réponse ;
 * l'erreur se nomme et donne une méthode, jamais « raté » ; le choix faux
 * reste barré ; au bout de deux erreurs, on montre la réponse et on continue.
 */
const ESSAIS_AVANT_AIDE = exports.ESSAIS_AVANT_AIDE = 2;
function JeuDeChoix({
  onQuitter,
  matiereCode,
  regle,
  classe,
  rendreQuestion,
  rendreApres
}) {
  var _fautes;
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => regle.serie(graine), [regle, graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [sens, setSens] = (0, _react.useState)(null);
  const [trouve, setTrouve] = (0, _react.useState)(false);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const montrer = !trouve && fautes.length >= ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = regle.consigne(courante);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup, regle.MANCHES));
  }, [fini, duPremierCoup, dire, regle.MANCHES]);
  const choisir = (0, _react.useCallback)(cle => {
    if (termine) return;
    const s = regle.verdict(courante, cle);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup(n => n + 1);
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, cle];
    setFautes(suivantes);
    setSens(s);
    const aide = suivantes.length >= ESSAIS_AVANT_AIDE ? regle.aide(courante) : null;
    dire(aide !== null && aide !== void 0 ? aide : regle.erreur(courante, s));
  }, [termine, regle, courante, fautes, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (manche + 1 >= regle.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setSens(null);
    setTrouve(false);
  }, [manche, regle.MANCHES]);
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
        lineNumber: 95,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 96,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 97,
        columnNumber: 27
      }
    }, "sur ", regle.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 99,
        columnNumber: 9
      }
    }, regle.bilan(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 101,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 105,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const aide = montrer ? regle.aide(courante) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: `jeu jeu--scene ${classe}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 116,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 117,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${regle.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 121,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    // eslint-disable-next-line react/no-array-index-key
    key: i,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 123,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 131,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 133,
      columnNumber: 9
    }
  })), rendreQuestion(courante, termine, {
    derniereFaute: (_fautes = fautes[fautes.length - 1]) !== null && _fautes !== void 0 ? _fautes : null,
    trouve,
    montrer
  }), !termine && /*#__PURE__*/React.createElement("ul", {
    className: "scene__choix",
    "aria-label": "Choisis ta r\xE9ponse",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 9
    }
  }, regle.choix(courante).map(({
    cle,
    libelle
  }) => /*#__PURE__*/React.createElement("li", {
    key: cle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 143,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `scene__carte${fautes.includes(cle) ? ' est-fausse' : ''}`,
    onClick: () => choisir(cle),
    disabled: fautes.includes(cle),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 144,
      columnNumber: 15
    }
  }, libelle)))), sens && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 157,
      columnNumber: 28
    }
  }, regle.erreur(courante, sens).texte), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 9
    }
  }, aide && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 161,
      columnNumber: 20
    }
  }, aide.texte), rendreApres ? rendreApres(courante) : null, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 163,
      columnNumber: 11
    }
  }, "Continuer")));
}