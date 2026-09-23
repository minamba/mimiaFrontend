const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PrixAVirgule;
var _react = require("react");
var _marchande = require("../../lib/jeux/marchande");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _Etal = require("./Etal");
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PrixAVirgule.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/marchande.webp';
/**
 * LES PRIX À VIRGULE — la marchande du CE2, à l'écran.
 *
 * Toute la règle vit dans `marchande.js`, section « le CE2 ».
 *
 * MÊME MARCHÉ, MÊME GESTE QUE LE CP : poser des pièces sur le comptoir, en
 * reprendre d'un clic. Ce qui change : l'étiquette a une virgule, la bourse
 * a des centimes, et l'enfant annonce qu'il a payé.
 */
function PrixAVirgule({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _marchande.serieCE2)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [posees, setPosees] = (0, _react.useState)([]);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= _marchande.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesMarchande.consigneCE2;
  (0, _react.useEffect)(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const poser = (0, _react.useCallback)(c => {
    if (termine) return;
    setResultat(null);
    setPosees(p => [...p, c]);
  }, [termine]);
  const reprendre = (0, _react.useCallback)(i => {
    if (termine) return;
    setResultat(null);
    setPosees(p => p.filter((_, k) => k !== i));
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _marchande.verdictCE2)(posees, courante.prix);
    setResultat(r);
    if (r === 'juste') {
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    dire(suivantes >= _marchande.ESSAIS_AVANT_AIDE ? _repliques.repliquesMarchande.aideCE2 : _repliques.repliquesMarchande.erreurCE2(r));
  }, [posees, courante.prix, manche, ratees, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (juste && ratees === 0) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _marchande.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPosees([]);
    setResultat(null);
    setRatees(0);
  }, [manche, juste, ratees]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPosees([]);
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
        lineNumber: 97,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 98,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 99,
        columnNumber: 27
      }
    }, "sur ", _marchande.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 101,
        columnNumber: 9
      }
    }, (0, _marchande.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 103,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 104,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 107,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const paye = (0, _marchande.somme)(posees);
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--marche jeu--caisse",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 119,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_marchande.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 123,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.prix}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 125,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 134,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "etal__article prix__produit",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 138,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement(_Etal.Produit, {
    cle: courante.produit.cle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 139,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "prix__etiquette",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 9
    }
  }, (0, _marchande.ecrirePrix)(courante.prix))), /*#__PURE__*/React.createElement("div", {
    className: "comptoir",
    role: "group",
    "aria-label": "Ce que tu as pos\xE9",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 143,
      columnNumber: 7
    }
  }, posees.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "comptoir__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 145,
      columnNumber: 11
    }
  }, "Pose ton argent ici") : posees.map((c, i) => /*#__PURE__*/React.createElement("button", {
    // Des pièces identiques : la place est la seule identité.
    // eslint-disable-next-line react/no-array-index-key
    key: `${c}-${i}`,
    type: "button",
    className: "comptoir__piece",
    onClick: () => reprendre(i),
    disabled: termine,
    "aria-label": `Reprendre ${(0, _marchande.ecrirePiece)(c)}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 148,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: (0, _marchande.ecrirePiece)(c),
    genre: "piece",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 158,
      columnNumber: 15
    }
  })))), resultat && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 165,
      columnNumber: 9
    }
  }, _marchande.PHRASES_CE2[resultat]), termine ? /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 169,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "caisse__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 170,
      columnNumber: 23
    }
  }, _marchande.PHRASES_CE2.aide), /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 11
    }
  }, (0, _marchande.ecrirePrix)(courante.prix), " = ", (0, _marchande.prixEnMots)(courante.prix)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 174,
      columnNumber: 11
    }
  }, "Continuer")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "bourse",
    role: "group",
    "aria-label": "Ton porte-monnaie",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 180,
      columnNumber: 11
    }
  }, _marchande.MONNAIE_CE2.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    type: "button",
    className: `bourse__piece${c < 100 ? ' bourse__piece--centimes' : ''}`,
    onClick: () => poser(c),
    "aria-label": `Poser ${(0, _marchande.ecrirePiece)(c)}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 182,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: (0, _marchande.ecrirePiece)(c),
    genre: "piece",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 17
    }
  })))), posees.length > 0 && !resultat && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 195,
      columnNumber: 13
    }
  }, "C\u2019est pay\xE9\xA0!")), /*#__PURE__*/React.createElement("span", {
    className: "visuellement-cache",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 201,
      columnNumber: 7
    }
  }, "Tu as pos\xE9 ", paye, " centimes."));
}