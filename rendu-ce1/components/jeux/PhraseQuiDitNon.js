const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PhraseQuiDitNon;
var _react = require("react");
var _phraseQuiDitNon = require("../../lib/jeux/phraseQuiDitNon");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _TransformerPhrase = _interopRequireDefault(require("./TransformerPhrase"));
var _PhrasesCM = _interopRequireDefault(require("./PhrasesCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PhraseQuiDitNon.js";
/**
 * LA PHRASE QUI DIT NON, À L'ÉCRAN.
 *
 * Toute la règle vit dans `phraseQuiDitNon.js`.
 *
 * DEUX GESTES, DANS L'ORDRE DE L'ÉCRITURE : choisir « ne » ou « n' » puis
 * toucher un espace entre deux mots ; ensuite toucher l'espace de « pas ».
 * Toucher un mot posé le retire. Chaque espace est un vrai bouton — pas de
 * glisser, même raison que les autres jeux.
 */
/** Au CE2, on transforme la phrase — voir `TransformerPhrase.js`. */
function PhraseQuiDitNonAvantCM1({
  niveau,
  ...props
}) {
  return niveau === 'CE2' ? /*#__PURE__*/React.createElement(_TransformerPhrase.default, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 29
    }
  })) : /*#__PURE__*/React.createElement(PhraseQuiDitNonCE1, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 23,
      columnNumber: 64
    }
  }));
}
function PhraseQuiDitNonCE1({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _phraseQuiDitNon.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [forme, setForme] = (0, _react.useState)(null);
  const [ne, setNe] = (0, _react.useState)(null);
  const [pas, setPas] = (0, _react.useState)(null);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const p = (0, _phraseQuiDitNon.phrase)(manches[manche]);
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= _phraseQuiDitNon.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesNegation.consigne;
  (0, _react.useEffect)(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  // Ce que l'enfant pose maintenant : « ne » tant qu'il n'est pas posé, puis « pas ».
  const aPoser = ne === null ? 'ne' : pas === null ? 'pas' : null;
  const poserDans = (0, _react.useCallback)(espace => {
    if (termine) return;
    setResultat(null);
    if (aPoser === 'ne' && forme) setNe(espace);else if (aPoser === 'pas' && espace !== ne) setPas(espace);
  }, [termine, aPoser, forme, ne]);
  const retirer = (0, _react.useCallback)(quoi => {
    if (termine) return;
    setResultat(null);
    if (quoi === 'ne') {
      setNe(null);
      setForme(null);
    } else setPas(null);
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _phraseQuiDitNon.verdict)(p, {
      ne,
      pas,
      forme
    });
    setResultat(r);
    if (r === 'juste') {
      dire([_repliques.commun.bravo(manche), _repliques.repliquesNegation.phrase(manches[manche])]);
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    dire(suivantes >= _phraseQuiDitNon.ESSAIS_AVANT_AIDE ? _repliques.repliquesNegation.aide : _repliques.repliquesNegation.erreur(r));
  }, [p, ne, pas, forme, manche, manches, ratees, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (juste && ratees === 0) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _phraseQuiDitNon.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setForme(null);
    setNe(null);
    setPas(null);
    setResultat(null);
    setRatees(0);
  }, [manche, juste, ratees]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setForme(null);
    setNe(null);
    setPas(null);
    setResultat(null);
    setRatees(0);
    setDuPremierCoup(0);
    setFini(false);
  }, []);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 112,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 113,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 114,
        columnNumber: 27
      }
    }, "sur ", _phraseQuiDitNon.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 116,
        columnNumber: 9
      }
    }, (0, _phraseQuiDitNon.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 118,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 119,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 122,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }

  /** Un espace entre deux mots : vide et touchable, ou portant ne / pas. */
  const espace = k => {
    if (ne === k) {
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "non__pose non__pose--ne",
        onClick: () => retirer('ne'),
        disabled: termine,
        "aria-label": `Retirer ${forme}`,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 134,
          columnNumber: 9
        }
      }, forme);
    }
    if (pas === k) {
      return /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "non__pose non__pose--pas",
        onClick: () => retirer('pas'),
        disabled: termine,
        "aria-label": "Retirer pas",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 141,
          columnNumber: 9
        }
      }, "pas");
    }
    if (termine || !aPoser || aPoser === 'ne' && !forme) return /*#__PURE__*/React.createElement("span", {
      className: "non__espace non__espace--fixe",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 146,
        columnNumber: 67
      }
    });
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "non__espace",
      onClick: () => poserDans(k),
      "aria-label": `Poser ${aPoser === 'ne' ? forme : 'pas'} ici`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 148,
        columnNumber: 7
      }
    });
  };
  const fautif = resultat && !termine;
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--non",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_phraseQuiDitNon.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: m,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 162,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 169,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "non__oui",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 174,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "non__marque",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 174,
      columnNumber: 31
    }
  }, "oui"), " ", p.mots.join(' ')), /*#__PURE__*/React.createElement("p", {
    className: `non__phrase${fautif ? ' est-fautive' : ''}`,
    "aria-label": "La phrase \xE0 \xE9crire",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 176,
      columnNumber: 7
    }
  }, termine ? /*#__PURE__*/React.createElement("span", {
    className: "non__finale",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 11
    }
  }, (0, _phraseQuiDitNon.negative)(p)) : /*#__PURE__*/React.createElement(React.Fragment, null, espace(0), p.mots.map((mot, i) =>
  /*#__PURE__*/
  // Les mots peuvent se répéter : la place est l'identité.
  // eslint-disable-next-line react/no-array-index-key
  React.createElement(_react.Fragment, {
    key: i,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 185,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "non__mot",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 186,
      columnNumber: 17
    }
  }, mot), espace(i + 1))))), !termine && aPoser === 'ne' && /*#__PURE__*/React.createElement("div", {
    className: "non__etiquettes",
    role: "group",
    "aria-label": "Choisis ne ou n\u2019",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 195,
      columnNumber: 9
    }
  }, ['ne', 'n’'].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    type: "button",
    className: `scene__carte non__etiquette${forme === f ? ' est-choisie' : ''}`,
    onClick: () => setForme(f),
    "aria-pressed": forme === f,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 197,
      columnNumber: 13
    }
  }, f))), !termine && aPoser === 'pas' && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 211,
      columnNumber: 9
    }
  }, "Maintenant, touche l\u2019espace o\xF9 poser \xAB pas \xBB."), fautif && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 214,
      columnNumber: 18
    }
  }, _phraseQuiDitNon.PHRASES[resultat]), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 217,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 218,
      columnNumber: 23
    }
  }, _phraseQuiDitNon.PHRASES.aide), /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 219,
      columnNumber: 11
    }
  }, "La phrase dit non\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 220,
      columnNumber: 11
    }
  }, "Continuer")), !termine && ne !== null && pas !== null && !resultat && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 227,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `PhrasesCM1.js` ; il lit la classe. */
function PhraseQuiDitNon({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_PhrasesCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 237,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(PhraseQuiDitNonAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 237,
      columnNumber: 93
    }
  }));
}