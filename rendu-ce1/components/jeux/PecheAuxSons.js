const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PecheAuxSons;
var _react = require("react");
var _pecheAuxSons = require("../../lib/jeux/pecheAuxSons");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PecheAuxSons.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/son.webp';

/**
 * LA PÊCHE AUX SONS, À L'ÉCRAN.
 *
 * Toute la règle vit dans `pecheAuxSons.js`, y compris pourquoi « loup » est
 * un leurre dans la manche du son « u ».
 *
 * AU DÉBUT DE CHAQUE MANCHE, ADRIEN DIT LE SON PUIS NOMME LES SIX IMAGES, et
 * le poisson qu'il nomme s'éclaire — le mécanisme de l'horloge. Chaque
 * poisson garde un haut-parleur pour réentendre son mot : un enfant qui
 * hésite doit pouvoir réécouter autant qu'il veut, c'est tout le jeu.
 *
 * L'ENFANT PÊCHE, PUIS ANNONCE — la leçon des paquets de dix : sans l'annonce,
 * il suffirait de toucher les poissons un à un jusqu'à ce que le jeu s'allume.
 *
 * LE JEU NE MARCHE PAS SANS SON. La voix coupée garde le haut-parleur de
 * chaque poisson et celui de la consigne : ce sont des demandes de l'enfant.
 *
 * LE DÉCOR EST UN FOND MARIN : les poissons nagent dans la mer elle-même,
 * sans mare dessinée par-dessus.
 */
function PecheAuxSons({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _pecheAuxSons.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [peches, setPeches] = (0, _react.useState)([]);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const leSon = (0, _pecheAuxSons.son)(courante.son);
  const juste = (resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'juste';
  const montrer = !juste && ratees >= _pecheAuxSons.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesPeche.consigne(courante.son);
  const aDire = [laConsigne, ...courante.poissons.map(p => _repliques.repliquesPeche.nom(p.mot))];
  (0, _react.useEffect)(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const basculer = (0, _react.useCallback)(cle => {
    if (termine) return;
    setResultat(null);
    setPeches(p => p.includes(cle) ? p.filter(x => x !== cle) : [...p, cle]);
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _pecheAuxSons.verdict)(peches, courante.poissons);
    if (r.sens === 'juste') {
      dire(_repliques.commun.bravo(manche));
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      if (suivantes >= _pecheAuxSons.ESSAIS_AVANT_AIDE) dire(_repliques.repliquesPeche.aide);else if (r.sens === 'manque') dire(_repliques.repliquesPeche.manque);
      // UNE ERREUR, ET SON MOT REDIT : l'enfant entend à nouveau le mot fautif,
      // juste après qu'on lui a dit d'écouter encore.
      else dire([_repliques.repliquesPeche.intrus(r.erreurs.length), ...r.erreurs.map(_repliques.repliquesPeche.nom)]);
    }
    setResultat(r);
  }, [peches, courante.poissons, manche, ratees, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre && juste) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _pecheAuxSons.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPeches([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
  }, [manche, propre, juste]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPeches([]);
    setResultat(null);
    setRatees(0);
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
        lineNumber: 114,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 115,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 116,
        columnNumber: 27
      }
    }, "sur ", _pecheAuxSons.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 118,
        columnNumber: 9
      }
    }, (0, _pecheAuxSons.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 120,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 121,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 124,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  let message = null;
  if ((resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'manque' && !montrer) message = _pecheAuxSons.PHRASES.manque;else if ((resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'intrus' && !montrer) {
    message = resultat.erreurs.length > 1 ? _pecheAuxSons.PHRASES.intrusPluriel : _pecheAuxSons.PHRASES.intrus;
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--peche",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 139,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_pecheAuxSons.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.son}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 142,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "peche__lettre",
    "aria-label": `Le son ${leSon.lettre}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 151,
      columnNumber: 7
    }
  }, leSon.lettre), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 7
    }
  }, laConsigne.texte.replace(/« /g, '« ').replace(/ »/g, ' »'), /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: aDire,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 157,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("ul", {
    className: "peche__mare",
    "aria-label": "La mare aux poissons",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 7
    }
  }, courante.poissons.map((p, i) => {
    const m = (0, _pecheAuxSons.mot)(p.mot);
    const peche = peches.includes(p.mot);
    const fautif = resultat === null || resultat === void 0 ? void 0 : resultat.erreurs.includes(p.mot);
    const montre = montrer && p.cible;
    const lu = voix.enCours === _repliques.repliquesPeche.nom(p.mot).cle;
    return /*#__PURE__*/React.createElement("li", {
      key: p.mot,
      className: `peche__place${peche ? ' est-peche' : ''}${fautif ? ' est-fautif' : ''}${montre ? ' est-montre' : ''}${lu ? ' est-lu' : ''}`,
      style: {
        '--nage': `${i % 3 * 0.6}s`
      },
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 168,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "peche__poisson",
      onClick: () => basculer(p.mot),
      disabled: termine,
      "aria-pressed": peche,
      "aria-label": `${m.mot}${peche ? ', pêché' : ''}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 173,
        columnNumber: 15
      }
    }, /*#__PURE__*/React.createElement(Poisson, {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 181,
        columnNumber: 17
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "peche__image",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 182,
        columnNumber: 17
      }
    }, m.image)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "peche__ecouter",
      onClick: () => voix.reecouter(_repliques.repliquesPeche.nom(p.mot)),
      "aria-label": `Écouter : ${m.mot}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 184,
        columnNumber: 15
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 190,
        columnNumber: 17
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 9h4l5-4v14l-5-4H4z",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 191,
        columnNumber: 19
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 8.5a4.5 4.5 0 0 1 0 7",
      className: "voix-jeu__onde",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 192,
        columnNumber: 19
      }
    }))));
  })), message && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 200,
      columnNumber: 19
    }
  }, message), montrer && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 203,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "peche__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 204,
      columnNumber: 11
    }
  }, _pecheAuxSons.PHRASES.aide), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 205,
      columnNumber: 11
    }
  }, "Continuer")), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 212,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 213,
      columnNumber: 11
    }
  }, "Belle p\xEAche\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 214,
      columnNumber: 11
    }
  }, "Continuer")), !termine && peches.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 221,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 226,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"));
}

/** Un poisson : un corps, une queue, un œil — l'image se pose sur le corps. */
function Poisson() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "peche__corps",
    viewBox: "0 0 140 90",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 236,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    className: "peche__queue",
    d: "M104 45 L136 20 Q128 45 136 70 Z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 237,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("ellipse", {
    className: "peche__chair",
    cx: "60",
    cy: "45",
    rx: "54",
    ry: "38",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 238,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "peche__nageoire",
    d: "M50 10 Q66 0 80 12 Z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 239,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "peche__oeil",
    cx: "22",
    cy: "36",
    r: "5",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 240,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "peche__reflet",
    cx: "20.5",
    cy: "34.5",
    r: "1.6",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 241,
      columnNumber: 7
    }
  }));
}