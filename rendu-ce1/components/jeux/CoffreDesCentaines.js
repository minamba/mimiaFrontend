const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = CoffreDesCentaines;
var _react = require("react");
var _coffreDesCentaines = require("../../lib/jeux/coffreDesCentaines");
var _nombresEnLettres = require("../../lib/jeux/nombresEnLettres");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _GrandsNombres = _interopRequireDefault(require("./GrandsNombres"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\CoffreDesCentaines.js";
const VIDE = {
  milliers: 0,
  centaines: 0,
  dizaines: 0,
  unites: 0
};
const TITRES = {
  milliers: 'Milliers',
  centaines: 'Centaines',
  dizaines: 'Dizaines',
  unites: 'Unités'
};
const PIECES = {
  milliers: 'bloc',
  centaines: 'plaque',
  dizaines: 'barre',
  unites: 'cube'
};
/** Le nom de chaque pièce avec son article : « un cube », pas « une cube ». */
const UNE = {
  bloc: 'un bloc',
  plaque: 'une plaque',
  barre: 'une barre',
  cube: 'un cube'
};

/**
 * LE COFFRE DES CENTAINES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `coffreDesCentaines.js`, y compris pourquoi le
 * nombre à construire est écrit en lettres.
 *
 * LE COFFRE A TROIS CASES, UNE PAR COLONNE, et chaque case a ses deux
 * boutons : ajouter une pièce, en retirer une. On ne glisse rien — même
 * raison que les autres jeux. Le nom de la colonne est écrit au-dessus : au
 * CE1, « centaines » se lit, et c'est le mot qu'on veut qu'il retienne.
 *
 * LE NOMBRE CONSTRUIT N'EST PAS AFFICHÉ pendant qu'on construit : il serait
 * la réponse. Il apparaît une fois juste, avec sa décomposition.
 */
function CoffreDesCentainesAvantCM1({
  onQuitter,
  matiereCode,
  niveau = 'CE1'
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _coffreDesCentaines.serie)(graine, niveau), [graine, niveau]);
  const ce2 = niveau === 'CE2';
  const [manche, setManche] = (0, _react.useState)(0);
  const [coffre, setCoffre] = (0, _react.useState)(VIDE);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [fausses, setFausses] = (0, _react.useState)([]);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const construire = courante.mode === 'construire';
  const juste = (resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'juste';
  const montrer = !juste && ratees >= _coffreDesCentaines.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = construire ? _repliques.repliquesCoffre.construire(courante.nombre) : _repliques.repliquesCoffre.consigneLire;
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const changer = (0, _react.useCallback)((colonne, delta) => {
    if (termine) return;
    setResultat(null);
    setCoffre(c => ({
      ...c,
      [colonne]: Math.max(0, Math.min(_coffreDesCentaines.MAX_PAR_COLONNE, c[colonne] + delta))
    }));
  }, [termine]);
  const conclure = (0, _react.useCallback)(r => {
    setResultat(r);
    if (r.sens === 'juste') {
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = ratees + 1;
    setRatees(suivantes);
    const aide = ce2 ? _repliques.repliquesCoffre.aideCE2 : _repliques.repliquesCoffre.aide;
    dire(suivantes >= _coffreDesCentaines.ESSAIS_AVANT_AIDE ? aide : _repliques.repliquesCoffre.erreur(r.sens, r.colonne));
  }, [manche, ratees, dire, ce2]);
  const annoncer = (0, _react.useCallback)(() => {
    conclure((0, _coffreDesCentaines.verdictConstruire)(coffre, courante.nombre, niveau));
  }, [coffre, courante.nombre, conclure, niveau]);
  const lire = (0, _react.useCallback)(choix => {
    if (termine) return;
    const r = (0, _coffreDesCentaines.verdictLire)(choix, courante.nombre, niveau);
    if (r.sens !== 'juste') setFausses(f => [...f, choix]);
    conclure(r);
  }, [termine, courante.nombre, conclure, niveau]);
  const suivante = (0, _react.useCallback)(() => {
    if (juste && ratees === 0) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _coffreDesCentaines.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setCoffre(VIDE);
    setResultat(null);
    setFausses([]);
    setRatees(0);
  }, [manche, juste, ratees]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setCoffre(VIDE);
    setResultat(null);
    setFausses([]);
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
        lineNumber: 134,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 135,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 136,
        columnNumber: 27
      }
    }, "sur ", _coffreDesCentaines.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 138,
        columnNumber: 9
      }
    }, (0, _coffreDesCentaines.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 140,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 141,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 144,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }

  // À la lecture, et quand on montre la réponse, le coffre porte le nombre.
  const montre = !construire || montrer ? (0, _coffreDesCentaines.decomposer)(courante.nombre) : coffre;
  const {
    milliers: m,
    centaines: c,
    dizaines: d,
    unites: u
  } = (0, _coffreDesCentaines.decomposer)(courante.nombre);
  return /*#__PURE__*/React.createElement("div", {
    className: `jeu jeu--scene jeu--coffre${ce2 ? ' jeu--coffre-ce2' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 159,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_coffreDesCentaines.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.nombre}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 166,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 173,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 175,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "coffre",
    role: "group",
    "aria-label": "Le coffre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 7
    }
  }, (0, _coffreDesCentaines.colonnes)(niveau).map(({
    cle
  }) => {
    const fautive = (resultat === null || resultat === void 0 ? void 0 : resultat.colonne) === cle && !termine;
    return /*#__PURE__*/React.createElement("div", {
      key: cle,
      className: `coffre__case${fautive ? ' est-fautive' : ''}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 182,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "coffre__titre",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 183,
        columnNumber: 15
      }
    }, TITRES[cle]), /*#__PURE__*/React.createElement("div", {
      className: `coffre__pieces coffre__pieces--${PIECES[cle]}`,
      "aria-label": `${montre[cle]} ${TITRES[cle].toLowerCase()}`,
      role: "img",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 184,
        columnNumber: 15
      }
    }, Array.from({
      length: montre[cle]
    }, (_, i) =>
    /*#__PURE__*/
    // Des pièces identiques : la place est la seule identité.
    // eslint-disable-next-line react/no-array-index-key
    React.createElement(Piece, {
      key: i,
      sorte: PIECES[cle],
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 192,
        columnNumber: 19
      }
    }))), construire && !termine && /*#__PURE__*/React.createElement("div", {
      className: "coffre__boutons",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 196,
        columnNumber: 17
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "coffre__bouton",
      onClick: () => changer(cle, -1),
      disabled: coffre[cle] === 0,
      "aria-label": `Retirer ${UNE[PIECES[cle]]}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 197,
        columnNumber: 19
      }
    }, "\u2212"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "coffre__bouton",
      onClick: () => changer(cle, 1),
      disabled: coffre[cle] >= _coffreDesCentaines.MAX_PAR_COLONNE,
      "aria-label": `Ajouter ${UNE[PIECES[cle]]}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 206,
        columnNumber: 19
      }
    }, "+")));
  })), !construire && !termine && /*#__PURE__*/React.createElement("ul", {
    className: "scene__choix",
    "aria-label": "Quel nombre ?",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 223,
      columnNumber: 9
    }
  }, courante.choix.map(n => /*#__PURE__*/React.createElement("li", {
    key: n,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 225,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `scene__carte${fausses.includes(n) ? ' est-fausse' : ''}`,
    onClick: () => lire(n),
    disabled: fausses.includes(n),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 226,
      columnNumber: 15
    }
  }, n)))), resultat && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 240,
      columnNumber: 9
    }
  }, (0, _coffreDesCentaines.phraseErreur)(resultat.sens, resultat.colonne)), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 244,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 245,
      columnNumber: 23
    }
  }, ce2 ? _coffreDesCentaines.PHRASES.aideCE2 : _coffreDesCentaines.PHRASES.aide), /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 246,
      columnNumber: 11
    }
  }, courante.nombre, " = ", ce2 ? `${m * 1000} + ` : '', c * 100, " + ", d * 10, " + ", u, /*#__PURE__*/React.createElement("br", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 248,
      columnNumber: 13
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "coffre__lettres",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 249,
      columnNumber: 13
    }
  }, (0, _nombresEnLettres.enLettres)(courante.nombre))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 251,
      columnNumber: 11
    }
  }, "Continuer")), construire && !termine && !resultat && coffre.milliers + coffre.centaines + coffre.dizaines + coffre.unites > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 258,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"));
}

/**
 * UNE PIÈCE DU MATÉRIEL : la plaque de cent (dix sur dix), la barre de dix, le
 * cube. La plaque et la barre laissent voir leurs cubes — c'est ce qui dit
 * qu'une barre VAUT dix cubes.
 */
function Piece({
  sorte
}) {
  // LE GROS CUBE DE MILLE : dix plaques empilées, dessiné en volume.
  if (sorte === 'bloc') {
    return /*#__PURE__*/React.createElement("svg", {
      className: "coffre__piece coffre__piece--bloc",
      viewBox: "0 0 60 60",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 275,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 16 L44 16 L44 56 L4 56 Z",
      className: "coffre__bloc-face",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 276,
        columnNumber: 9
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M4 16 L16 4 L56 4 L44 16 Z",
      className: "coffre__bloc-dessus",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 277,
        columnNumber: 9
      }
    }), /*#__PURE__*/React.createElement("path", {
      d: "M44 16 L56 4 L56 44 L44 56 Z",
      className: "coffre__bloc-cote",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 278,
        columnNumber: 9
      }
    }));
  }
  if (sorte === 'plaque') {
    return /*#__PURE__*/React.createElement("svg", {
      className: "coffre__piece coffre__piece--plaque",
      viewBox: "0 0 50 50",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 284,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "1",
      width: "48",
      height: "48",
      rx: "2",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 285,
        columnNumber: 9
      }
    }), Array.from({
      length: 9
    }, (_, i) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement("g", {
      key: i,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 288,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("line", {
      x1: 1 + (i + 1) * 4.8,
      y1: "1",
      x2: 1 + (i + 1) * 4.8,
      y2: "49",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 289,
        columnNumber: 13
      }
    }), /*#__PURE__*/React.createElement("line", {
      x1: "1",
      y1: 1 + (i + 1) * 4.8,
      x2: "49",
      y2: 1 + (i + 1) * 4.8,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 290,
        columnNumber: 13
      }
    }))));
  }
  if (sorte === 'barre') {
    return /*#__PURE__*/React.createElement("svg", {
      className: "coffre__piece coffre__piece--barre",
      viewBox: "0 0 8 50",
      "aria-hidden": "true",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 298,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("rect", {
      x: "1",
      y: "1",
      width: "6",
      height: "48",
      rx: "1.5",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 299,
        columnNumber: 9
      }
    }), Array.from({
      length: 9
    }, (_, i) =>
    /*#__PURE__*/
    // eslint-disable-next-line react/no-array-index-key
    React.createElement("line", {
      key: i,
      x1: "1",
      y1: 1 + (i + 1) * 4.8,
      x2: "7",
      y2: 1 + (i + 1) * 4.8,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 302,
        columnNumber: 11
      }
    })));
  }
  return /*#__PURE__*/React.createElement("svg", {
    className: "coffre__piece coffre__piece--cube",
    viewBox: "0 0 10 10",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 308,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1",
    y: "1",
    width: "8",
    height: "8",
    rx: "1.5",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 309,
      columnNumber: 7
    }
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `GrandsNombres.js` ; il lit la classe. */
function CoffreDesCentaines({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_GrandsNombres.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 316,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(CoffreDesCentainesAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 316,
      columnNumber: 96
    }
  }));
}