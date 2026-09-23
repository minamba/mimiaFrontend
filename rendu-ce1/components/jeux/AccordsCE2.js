const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AccordsCE2;
var _react = require("react");
var _accordsCE = require("../../lib/jeux/accordsCE2");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\AccordsCE2.js";
/**
 * FÉMININ ET PLURIEL — « Un ou des ? » au CE2, à l'écran.
 *
 * Toute la règle vit dans `accordsCE2.js`.
 *
 * MÊME GESTE QUE AU CP : une étiquette à deux cases, une rangée de choix par
 * case, et l'annonce. Le déterminant est donné (« des », « une ») : c'est lui
 * qui dit ce qu'il faut accorder.
 */
function AccordsCE2({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _accordsCE.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [nom, setNom] = (0, _react.useState)(null);
  const [adj, setAdj] = (0, _react.useState)(null);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const g = (0, _accordsCE.groupe)(courante.groupe);
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= _accordsCE.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesAccords.consigne(courante.groupe);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const poser = (0, _react.useCallback)((quoi, valeur) => {
    if (termine) return;
    setResultat(null);
    if (quoi === 'nom') setNom(valeur);else setAdj(valeur);
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _accordsCE.verdict)(g, nom, adj);
    setResultat(r);
    if (r === 'juste') {
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    dire(suivantes >= _accordsCE.ESSAIS_AVANT_AIDE ? _repliques.repliquesAccords.aide : _repliques.repliquesAccords.regle(r));
  }, [g, nom, adj, manche, ratees, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (juste && ratees === 0) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _accordsCE.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setNom(null);
    setAdj(null);
    setResultat(null);
    setRatees(0);
  }, [manche, juste, ratees]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setNom(null);
    setAdj(null);
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
    }, "sur ", _accordsCE.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 99,
        columnNumber: 9
      }
    }, (0, _accordsCE.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
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
  const [nomAffiche, adjAffiche] = montrer ? [g.nom, g.adj] : [nom, adj];
  const fauteNom = (resultat === null || resultat === void 0 ? void 0 : resultat.startsWith('nom-')) && !termine;
  const fauteAdj = (resultat === null || resultat === void 0 ? void 0 : resultat.startsWith('adj-')) && !termine;
  const rangee = (quoi, formes, choisie) => /*#__PURE__*/React.createElement("ul", {
    className: "unoudes__rangee",
    "aria-label": quoi === 'nom' ? 'Le nom' : 'L’adjectif',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 5
    }
  }, formes.map(f => /*#__PURE__*/React.createElement("li", {
    key: f,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 120,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `unoudes__tuile${choisie === f ? ' est-choisie' : ''}`,
    onClick: () => poser(quoi, f),
    "aria-pressed": choisie === f,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 121,
      columnNumber: 11
    }
  }, f))));
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--unoudes",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_accordsCE.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: m.groupe,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 142,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 151,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "accords__depart",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `accords__sens accords__sens--${g.sens}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 9
    }
  }, g.sens === 'pluriel' ? 'au pluriel' : 'au féminin'), g.depart), /*#__PURE__*/React.createElement("p", {
    className: `unoudes__etiquette${termine ? ' est-juste' : ''}`,
    "aria-label": "Le groupe \xE0 \xE9crire",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 159,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "unoudes__case est-pleine",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 9
    }
  }, g.det), /*#__PURE__*/React.createElement("span", {
    className: `unoudes__case unoudes__case--nom${nomAffiche ? ' est-pleine' : ''}${fauteNom ? ' est-fautive' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 161,
      columnNumber: 9
    }
  }, nomAffiche !== null && nomAffiche !== void 0 ? nomAffiche : '…'), /*#__PURE__*/React.createElement("span", {
    className: `unoudes__case unoudes__case--nom${adjAffiche ? ' est-pleine' : ''}${fauteAdj ? ' est-fautive' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 9
    }
  }, adjAffiche !== null && adjAffiche !== void 0 ? adjAffiche : '…')), !termine && /*#__PURE__*/React.createElement("div", {
    className: "unoudes__choix",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 170,
      columnNumber: 9
    }
  }, rangee('nom', courante.noms, nom), rangee('adj', courante.adjs, adj)), resultat && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 176,
      columnNumber: 32
    }
  }, _accordsCE.REGLES[resultat]), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 179,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 180,
      columnNumber: 23
    }
  }, _accordsCE.AIDE), juste && /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 181,
      columnNumber: 21
    }
  }, "Bien accord\xE9\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 182,
      columnNumber: 11
    }
  }, "Continuer")), !termine && nom && adj && !resultat && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"));
}