const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Caisse;
var _react = require("react");
var _marchande = require("../../lib/jeux/marchande");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _Etal = require("./Etal");
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Caisse.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/marchande.webp';
/**
 * LA CAISSE — la marchande du CE1, à l'écran.
 *
 * Toute la règle vit dans `marchande.js`, section « le CE1 ».
 *
 * MÊME DÉCOR, MÊMES PIÈCES, MÊME GESTE QUE LE CP : poser une pièce sur le
 * comptoir, la reprendre d'un clic. Ce qui change est le sens : l'argent va
 * cette fois de l'enfant vers le client, et il l'annonce quand il a fini.
 *
 * LE PRIX N'EST PAS ÉCRIT : le calculer est la première moitié de la
 * compétence. Chaque produit porte son prix à l'unité, comme l'ardoise du
 * stand, et il est dessiné autant de fois qu'on l'achète.
 */
function Caisse({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _marchande.serieCE1)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [posees, setPosees] = (0, _react.useState)([]);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const rendu = (0, _marchande.somme)(posees);
  const juste = resultat === 'juste';
  const montrer = !juste && ratees >= _marchande.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesMarchande.consigneCE1(courante.lignes);
  const aDire = [laConsigne, _repliques.repliquesMarchande.rendre];
  (0, _react.useEffect)(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const poser = (0, _react.useCallback)(valeur => {
    if (termine) return;
    setResultat(null);
    setPosees(p => [...p, valeur]);
  }, [termine]);
  const reprendre = (0, _react.useCallback)(index => {
    if (termine) return;
    setResultat(null);
    setPosees(p => p.filter((_, i) => i !== index));
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _marchande.verdict)(posees, courante.rendu);
    setResultat(r);
    if (r === 'juste') {
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    if (suivantes >= _marchande.ESSAIS_AVANT_AIDE) dire(_repliques.repliquesMarchande.aideRendu);else dire(r === 'trop' ? _repliques.repliquesMarchande.rendTrop : _repliques.repliquesMarchande.rendPasAssez);
  }, [posees, courante.rendu, manche, ratees, dire]);
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
        lineNumber: 107,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 108,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 109,
        columnNumber: 27
      }
    }, "sur ", _marchande.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 111,
        columnNumber: 9
      }
    }, (0, _marchande.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 113,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 114,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 117,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }

  // Le calcul du prix, écrit comme on le pose : « 2 + 2 + 3 = 7 € ».
  const calculPrix = courante.lignes.flatMap(l => Array.from({
    length: l.quantite
  }, () => l.produit.prix)).join(' + ');
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--marche jeu--caisse",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 131,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_marchande.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.total}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 138,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 145,
      columnNumber: 7
    }
  }, laConsigne.texte, " ", _marchande.PHRASES_CE1.rendre, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: aDire,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "caisse__vente",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 150,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("ul", {
    className: "etal",
    "aria-label": "Ce que le client ach\xE8te",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 9
    }
  }, courante.lignes.map(l => /*#__PURE__*/React.createElement("li", {
    key: l.produit.cle,
    className: "etal__article",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "caisse__produits",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 15
    }
  }, Array.from({
    length: l.quantite
  }, (_, i) =>
  /*#__PURE__*/
  // Des copies du même produit : la place est la seule identité.
  // eslint-disable-next-line react/no-array-index-key
  React.createElement(_Etal.Produit, {
    key: i,
    cle: l.produit.cle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 19
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "etal__prix",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 163,
      columnNumber: 15
    }
  }, l.produit.prix, " \u20AC l\u2019une")))), /*#__PURE__*/React.createElement("div", {
    className: "caisse__billet",
    "aria-label": `Le client te donne ${courante.billet} euros`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 169,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "caisse__legende",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 170,
      columnNumber: 11
    }
  }, "Le client te donne"), /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: courante.billet,
    genre: "billet",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("div", {
    className: "comptoir",
    role: "group",
    "aria-label": `Tu rends ${rendu} euros`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 176,
      columnNumber: 7
    }
  }, posees.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "comptoir__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 11
    }
  }, "Pose la monnaie \xE0 rendre ici") : posees.map((valeur, i) => /*#__PURE__*/React.createElement("button", {
    key: `${valeur}-${i}`,
    type: "button",
    className: "comptoir__piece",
    onClick: () => reprendre(i),
    disabled: termine,
    "aria-label": `Reprendre ${valeur} euro${valeur > 1 ? 's' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 181,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: valeur,
    genre: valeur === 5 ? 'billet' : 'piece',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 15
    }
  })))), resultat && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 196,
      columnNumber: 9
    }
  }, resultat === 'trop' ? _marchande.PHRASES_CE1.trop : _marchande.PHRASES_CE1.pasAssez), termine ? /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 202,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "caisse__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 203,
      columnNumber: 23
    }
  }, _marchande.PHRASES_CE1.aide), /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 204,
      columnNumber: 11
    }
  }, calculPrix, " = ", courante.total, " \u20AC", /*#__PURE__*/React.createElement("br", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 206,
      columnNumber: 13
    }
  }), courante.billet, " \u2212 ", courante.total, " = ", courante.rendu, " \u20AC"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 209,
      columnNumber: 11
    }
  }, "Continuer")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "bourse",
    role: "group",
    "aria-label": "Ta caisse",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 215,
      columnNumber: 11
    }
  }, _marchande.MONNAIE.map(({
    valeur,
    genre
  }) => /*#__PURE__*/React.createElement("button", {
    key: valeur,
    type: "button",
    className: "bourse__piece",
    onClick: () => poser(valeur),
    "aria-label": `Rendre ${valeur} euro${valeur > 1 ? 's' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 217,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: valeur,
    genre: genre,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 224,
      columnNumber: 17
    }
  })))), posees.length > 0 && !resultat && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 230,
      columnNumber: 13
    }
  }, "C\u2019est rendu\xA0!")));
}