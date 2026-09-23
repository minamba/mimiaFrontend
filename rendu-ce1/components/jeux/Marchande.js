const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Marchande;
var _react = require("react");
var _marchande = require("../../lib/jeux/marchande");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _Caisse = _interopRequireDefault(require("./Caisse"));
var _PrixAVirgule = _interopRequireDefault(require("./PrixAVirgule"));
var _Etal = require("./Etal");
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Marchande.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/marchande.webp';
/**
 * LA MARCHANDE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `marchande.js`, y compris pourquoi les prix ne se
 * tirent pas au hasard.
 *
 * L'ENFANT POSE DES PIÈCES SUR LE COMPTOIR jusqu'à la somme exacte. Il peut
 * reprendre une pièce d'un clic : au CP, se reprendre fait partie du calcul,
 * et interdire le retour en arrière transformerait une erreur de comptage en
 * échec définitif.
 *
 * PAS DE BOUTON « PAYER ». La somme juste EST la réponse — dès qu'elle est
 * atteinte, la marchande remercie. Une étape de confirmation n'apprendrait
 * rien à un enfant de six ans, et lui ferait croire qu'il peut payer faux.
 *
 * AUCUNE LECTURE OBLIGATOIRE : les produits sont dessinés, leur prix est
 * écrit en chiffres sur l'ardoise, et la monnaie porte sa valeur. La phrase de
 * la marchande est là pour l'adulte, et pour la voix quand elle sera branchée.
 */
/**
 * LA CLASSE CHOISIT LE JEU : au CP, on paie ; au CE1, on tient la caisse et
 * on rend la monnaie — voir `Caisse.js` ; au CE2, on lit un prix à virgule
 * — voir `PrixAVirgule.js`.
 */
function Marchande({
  niveau,
  ...props
}) {
  if (niveau === 'CE1') return /*#__PURE__*/React.createElement(_Caisse.default, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 38,
      columnNumber: 32
    }
  }));
  if (niveau === 'CE2') return /*#__PURE__*/React.createElement(_PrixAVirgule.default, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 39,
      columnNumber: 32
    }
  }));
  return /*#__PURE__*/React.createElement(MarchandeCP, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 10
    }
  }));
}
function MarchandeCP({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _marchande.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [posees, setPosees] = (0, _react.useState)([]);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const paye = (0, _marchande.somme)(posees);
  const sens = (0, _marchande.verdict)(posees, courante.total);
  const juste = sens === 'juste';

  // LA VOIX DE LA PROFESSEURE : la commande à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesMarchande.consigne(courante.achats);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  // LA RÉPONSE SE DIT AU MOMENT OÙ ELLE CHANGE : la somme devient juste, ou
  // elle devient trop grosse. Tant qu'on reste « trop », on ne le répète
  // pas à chaque pièce posée en plus.
  (0, _react.useEffect)(() => {
    if (sens === 'juste') dire(_repliques.commun.bravo(manche));else if (sens === 'trop') dire(_repliques.repliquesMarchande.trop);
  }, [sens, manche, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const poser = (0, _react.useCallback)(valeur => {
    if (juste) return;
    setPosees(actuelles => {
      const suivantes = [...actuelles, valeur];
      if ((0, _marchande.somme)(suivantes) !== courante.total) setPropre(false);
      return suivantes;
    });
  }, [courante.total, juste]);
  const reprendre = (0, _react.useCallback)(index => {
    if (juste) return;
    setPosees(actuelles => actuelles.filter((_, i) => i !== index));
  }, [juste]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _marchande.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPosees([]);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPosees([]);
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
        lineNumber: 121,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 122,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 123,
        columnNumber: 27
      }
    }, "sur ", _marchande.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 125,
        columnNumber: 9
      }
    }, (0, _marchande.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 127,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 128,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 131,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--marche",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_marchande.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 145,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.total}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("ul", {
    className: "etal",
    "aria-label": "Ce que tu dois payer",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 162,
      columnNumber: 7
    }
  }, courante.achats.map((p, i) => /*#__PURE__*/React.createElement("li", {
    key: `${p.cle}-${i}`,
    className: "etal__article",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement(_Etal.Produit, {
    cle: p.cle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 165,
      columnNumber: 13
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "etal__prix",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 166,
      columnNumber: 13
    }
  }, p.prix, " \u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "comptoir",
    role: "group",
    "aria-label": `Tu as posé ${paye} euros`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 173,
      columnNumber: 7
    }
  }, posees.length === 0 ? /*#__PURE__*/React.createElement("p", {
    className: "comptoir__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 175,
      columnNumber: 11
    }
  }, "Pose ton argent ici") : posees.map((valeur, i) => /*#__PURE__*/React.createElement("button", {
    key: `${valeur}-${i}`,
    type: "button",
    className: "comptoir__piece",
    onClick: () => reprendre(i),
    disabled: juste,
    "aria-label": `Reprendre ${valeur} euro${valeur > 1 ? 's' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: valeur,
    genre: valeur === 5 ? 'billet' : 'piece',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 186,
      columnNumber: 15
    }
  })))), sens === 'trop' && !juste && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 9
    }
  }, _marchande.PHRASES.trop), juste ? /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 197,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 198,
      columnNumber: 11
    }
  }, courante.achats.map(p => p.prix).join(' + '), " = ", courante.total, " \u20AC"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 201,
      columnNumber: 11
    }
  }, "Continuer")) : /*#__PURE__*/React.createElement("div", {
    className: "bourse",
    role: "group",
    "aria-label": "Ton porte-monnaie",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 206,
      columnNumber: 9
    }
  }, _marchande.MONNAIE.map(({
    valeur,
    genre
  }) => /*#__PURE__*/React.createElement("button", {
    key: valeur,
    type: "button",
    className: "bourse__piece",
    onClick: () => poser(valeur),
    "aria-label": `Poser ${valeur} euro${valeur > 1 ? 's' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(_Etal.Monnaie, {
    valeur: valeur,
    genre: genre,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 215,
      columnNumber: 15
    }
  })))));
}