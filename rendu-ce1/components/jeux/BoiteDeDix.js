const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = BoiteDeDix;
var _react = require("react");
var _boiteDeDix = require("../../lib/jeux/boiteDeDix");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _Oeufs = require("./Oeufs");
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\BoiteDeDix.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/boite_de_10.webp';
/**
 * LA BOÎTE DE 10, À L'ÉCRAN.
 *
 * Toute la règle vit dans `boiteDeDix.js`, y compris l'histoire de sa
 * première version — celle où il était impossible de se tromper.
 *
 * L'ENFANT CHOISIT UN PANIER, il ne bouche pas des trous. Il voit la boîte à
 * œufs entamée, quatre paniers en dessous, et il doit désigner celui qui la
 * complète exactement. Il s'engage avant de voir le résultat : c'est ce qui
 * fait la différence entre remplir et compléter.
 *
 * LE DÉCOR EST UNE IMAGE, LE JEU EST DESSINÉ — Camara, le 21/09/2026, décor
 * de ferme généré à l'appui. Une image de boîte à œufs ne se remplirait pas :
 * la scène est en fond, la boîte et les paniers sont en vectoriel par-dessus.
 *
 * AUCUNE LECTURE OBLIGATOIRE — la contrainte du CP, et elle a décidé du
 * reste. Une boîte entamée et des barres de longueurs différentes : le geste
 * est évident sans un mot. La phrase affichée est là pour l'adulte qui
 * regarde par-dessus l'épaule.
 *
 * ON CLIQUE, ON NE GLISSE PAS. Le glisser-déposer échoue sur un trackpad, sur
 * un écran tactile mal calibré, et il est inaccessible au clavier.
 */
function BoiteDeDix({
  onQuitter,
  matiereCode
}) {
  // La graine ne change qu'au démarrage d'une partie : sans ça, le moindre
  // rendu retirerait la série sous les pieds de l'enfant.
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _boiteDeDix.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [essai, setEssai] = (0, _react.useState)(null);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const juste = essai !== null && (0, _boiteDeDix.gagnee)(courante.depart, essai);

  // LA VOIX DE LA PROFESSEURE : la consigne à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesBoite.consigne(courante.masquee);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const choisir = (0, _react.useCallback)(valeur => {
    if (juste) return;
    setEssai(valeur);
    if (!(0, _boiteDeDix.gagnee)(courante.depart, valeur)) setPropre(false);
    const s = (0, _boiteDeDix.verdict)(courante.depart, valeur);
    if (s === 'juste') dire(_repliques.commun.bravo(manche));else dire(s === 'trop' ? _repliques.repliquesBoite.trop : _repliques.repliquesBoite.manque);
  }, [courante.depart, juste, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _boiteDeDix.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setEssai(null);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setEssai(null);
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
        lineNumber: 100,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 101,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 27
      }
    }, "sur ", _boiteDeDix.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 104,
        columnNumber: 9
      }
    }, (0, _boiteDeDix.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 106,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 107,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 110,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }

  // UN ESSAI FAUX SE MONTRE DANS LA BOÎTE, il ne se contente pas d'un
  // message : l'enfant doit VOIR qu'il en reste, ou que ça déborde. C'est le
  // dessin qui corrige, pas la phrase.
  const poses = essai !== null && essai !== void 0 ? essai : 0;
  const sens = essai === null ? null : (0, _boiteDeDix.verdict)(courante.depart, essai);
  const cases = (0, _boiteDeDix.alveoles)(courante.depart, Math.min(poses, 10 - courante.depart), courante.masquee && !juste);
  const enTrop = Math.max(0, courante.depart + poses - 10);
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--ferme",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 128,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_boiteDeDix.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.depart}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 134,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 143,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement(_Oeufs.BoiteAOeufs, {
    cases: cases,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 146,
      columnNumber: 7
    }
  }), enTrop > 0 && /*#__PURE__*/React.createElement("div", {
    className: "oeufs-debord",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 151,
      columnNumber: 9
    }
  }, Array.from({
    length: enTrop
  }, (_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "oeufs-debord__oeuf",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 13
    }
  }))), !juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__paniers",
    role: "group",
    "aria-label": "Choisis un panier d\u2019\u0153ufs",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 159,
      columnNumber: 9
    }
  }, courante.choix.map(valeur => /*#__PURE__*/React.createElement("button", {
    key: valeur,
    type: "button",
    className: `panier-choix${essai === valeur ? ' est-refusee' : ''}`,
    onClick: () => choisir(valeur),
    "aria-label": `Panier de ${valeur} œuf${valeur > 1 ? 's' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 161,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(_Oeufs.PanierDOeufs, {
    nombre: valeur,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 168,
      columnNumber: 15
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "panier-choix__nombre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 169,
      columnNumber: 15
    }
  }, valeur)))), sens === 'trop' && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 179,
      columnNumber: 9
    }
  }, _boiteDeDix.PHRASES.trop), sens === 'pas-assez' && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 182,
      columnNumber: 9
    }
  }, _boiteDeDix.PHRASES.manque), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 186,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 11
    }
  }, courante.depart, " + ", courante.manque, " = 10"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 190,
      columnNumber: 11
    }
  }, "Continuer")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 196,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"));
}