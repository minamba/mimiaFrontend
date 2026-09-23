const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AtelierDesSyllabes;
var _react = require("react");
var _atelierDesSyllabes = require("../../lib/jeux/atelierDesSyllabes");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\AtelierDesSyllabes.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/syllabe.webp';

/**
 * L'ATELIER DES SYLLABES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `atelierDesSyllabes.js`, y compris pourquoi les
 * étiquettes ne parlent qu'après deux erreurs, et pourquoi « Écoute en
 * syllabes » ne donne pas la réponse.
 *
 * TOUCHER UNE ÉTIQUETTE LA MONTE DANS LE PREMIER WAGON VIDE ; toucher un
 * wagon plein la fait redescendre. Pas de glisser-déposer : sur une tablette,
 * un doigt de six ans lâche l'étiquette en route.
 *
 * L'ENFANT REMPLIT, PUIS ANNONCE — la leçon des paquets de dix : le train
 * plein ne se juge pas tout seul, sinon il suffirait d'essayer toutes les
 * étiquettes jusqu'à ce que le jeu s'allume.
 *
 * LE DÉCOR EST UN STUDIO : le train roule sur le parquet, devant le grand
 * mur clair du milieu.
 */
function AtelierDesSyllabes({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _atelierDesSyllabes.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [poses, setPoses] = (0, _react.useState)([]);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const leMot = (0, _atelierDesSyllabes.mot)(courante.mot);
  const wagons = leMot.syllabes.length;
  const juste = (resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'juste';
  const montrer = !juste && ratees >= _atelierDesSyllabes.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  // Après deux erreurs, les étiquettes parlent — voir la note du module.
  const parlantes = !termine && ratees >= _atelierDesSyllabes.SYLLABES_PARLANTES;

  // Ce que porte chaque wagon : l'étiquette posée, ou rien.
  const dansWagons = Array.from({
    length: wagons
  }, (_, i) => {
    const id = poses[i];
    return id === undefined || id === null ? null : courante.etiquettes.find(e => e.id === id);
  });
  const plein = dansWagons.every(Boolean);
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const leMotDit = _repliques.repliquesSyllabes.mot(courante.mot);
  const aDire = [_repliques.repliquesSyllabes.consigne, leMotDit];
  // Le mot syllabe par syllabe : « mou… ton ».
  const enSyllabes = leMot.syllabes.map(_repliques.repliquesSyllabes.son);
  (0, _react.useEffect)(() => {
    if (!fini) dire(manche === 0 ? aDire : leMotDit);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leMotDit.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const monter = (0, _react.useCallback)(id => {
    if (termine) return;
    setResultat(null);
    setPoses(p => {
      const suivant = [...p];
      const libre = Array.from({
        length: wagons
      }, (_, i) => i).find(i => suivant[i] == null);
      if (libre === undefined) return p;
      suivant[libre] = id;
      return suivant;
    });
  }, [termine, wagons]);
  const descendre = (0, _react.useCallback)(i => {
    if (termine) return;
    setResultat(null);
    setPoses(p => {
      const suivant = [...p];
      suivant[i] = null;
      return suivant;
    });
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _atelierDesSyllabes.verdict)(dansWagons.map(e => e.texte), courante.mot);
    if (r.sens === 'juste') {
      dire([_repliques.commun.bravo(manche), leMotDit]);
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      // La deuxième erreur ouvre les haut-parleurs des étiquettes : Adrien le dit.
      const ouvre = suivantes === _atelierDesSyllabes.SYLLABES_PARLANTES ? [_repliques.repliquesSyllabes.sonsOuverts] : [];
      if (suivantes >= _atelierDesSyllabes.ESSAIS_AVANT_AIDE) dire([_repliques.repliquesSyllabes.aide, leMotDit]);else if (r.sens === 'ordre') dire([_repliques.repliquesSyllabes.ordre, leMotDit, ...ouvre]);else dire([_repliques.repliquesSyllabes.faux(r.erreurs.length), leMotDit, ...ouvre]);
    }
    setResultat(r);
  }, [dansWagons, courante.mot, manche, ratees, dire, leMotDit]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre && juste) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _atelierDesSyllabes.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPoses([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
  }, [manche, propre, juste]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPoses([]);
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
        lineNumber: 140,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 141,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 142,
        columnNumber: 27
      }
    }, "sur ", _atelierDesSyllabes.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 144,
        columnNumber: 9
      }
    }, (0, _atelierDesSyllabes.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 146,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 147,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 150,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  let message = null;
  if ((resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'ordre' && !montrer) message = _atelierDesSyllabes.PHRASES.ordre;else if ((resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'faux' && !montrer) {
    message = resultat.erreurs.length > 1 ? _atelierDesSyllabes.PHRASES.fauxPluriel : _atelierDesSyllabes.PHRASES.faux;
  }

  // Après trois essais, le train montre la bonne réponse, wagon par wagon.
  const affiche = montrer ? leMot.syllabes : dansWagons.map(e => {
    var _e$texte;
    return (_e$texte = e === null || e === void 0 ? void 0 : e.texte) !== null && _e$texte !== void 0 ? _e$texte : null;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--syllabes",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 168,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_atelierDesSyllabes.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 169,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.mot}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 7
    }
  }, _atelierDesSyllabes.PHRASES.consigne, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: aDire,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 180,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "syllabes__modele",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 184,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "syllabes__image",
    role: "img",
    "aria-label": leMot.mot,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 185,
      columnNumber: 9
    }
  }, leMot.image), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "syllabes__ecouter",
    onClick: () => voix.reecouter(leMotDit),
    "aria-label": "R\xE9\xE9couter le mot",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 186,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 192,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 9h4l5-4v14l-5-4H4z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 13
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M16 8.5a4.5 4.5 0 0 1 0 7",
    className: "voix-jeu__onde",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 194,
      columnNumber: 13
    }
  })))), !termine && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "syllabes__en-syllabes",
    onClick: () => dire(enSyllabes),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 201,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "syllabes__mains",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 202,
      columnNumber: 11
    }
  }, "\uD83D\uDC4F"), "\xC9coute en syllabes"), /*#__PURE__*/React.createElement("ol", {
    className: "syllabes__train",
    "aria-label": "Le train des syllabes",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 207,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("li", {
    className: "syllabes__loco",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "syllabes__cheminee",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 209,
      columnNumber: 11
    }
  })), affiche.map((texte, i) => {
    const fautif = (resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'faux' && resultat.erreurs.includes(i) && !montrer;
    return (
      /*#__PURE__*/
      // Un wagon par syllabe, et l'ordre compte : la clé est la place.
      // eslint-disable-next-line react/no-array-index-key
      React.createElement("li", {
        key: i,
        className: "syllabes__place",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 216,
          columnNumber: 13
        }
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: `syllabes__wagon${texte ? ' est-plein' : ''}${fautif ? ' est-fautif' : ''}${juste || montrer ? ' est-juste' : ''}`,
        onClick: () => descendre(i),
        disabled: !texte || termine,
        "aria-label": texte ? `Wagon ${i + 1} : ${texte}` : `Wagon ${i + 1}, vide`,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 217,
          columnNumber: 15
        }
      }, texte))
    );
  })), juste && /*#__PURE__*/React.createElement("p", {
    className: "syllabes__mot-lu",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 231,
      columnNumber: 17
    }
  }, leMot.mot), /*#__PURE__*/React.createElement("ul", {
    className: "syllabes__etiquettes",
    "aria-label": "Les syllabes",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 233,
      columnNumber: 7
    }
  }, courante.etiquettes.map(e => {
    const posee = poses.includes(e.id);
    return /*#__PURE__*/React.createElement("li", {
      key: e.id,
      className: "syllabes__place-etiquette",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 237,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `syllabes__etiquette${posee ? ' est-posee' : ''}`,
      onClick: () => monter(e.id),
      disabled: posee || termine || plein,
      "aria-label": posee ? `${e.texte}, dans un wagon` : e.texte,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 238,
        columnNumber: 15
      }
    }, e.texte), parlantes && /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "syllabes__son",
      onClick: () => dire(_repliques.repliquesSyllabes.son(e.texte)),
      "aria-label": `Écouter « ${e.texte} »`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 249,
        columnNumber: 17
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 24 24",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 255,
        columnNumber: 19
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 9.5h3.5L12 5.5v13l-4.5-4H4z",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 256,
        columnNumber: 21
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
      fill: "none",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 257,
        columnNumber: 21
      }
    }))));
  })), message && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 266,
      columnNumber: 19
    }
  }, message), montrer && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 269,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "syllabes__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 270,
      columnNumber: 11
    }
  }, _atelierDesSyllabes.PHRASES.aide), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 271,
      columnNumber: 11
    }
  }, "Continuer")), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 278,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 279,
      columnNumber: 11
    }
  }, "Bien lu\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 280,
      columnNumber: 11
    }
  }, "Continuer")), !termine && plein && !resultat && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 289,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 294,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"));
}