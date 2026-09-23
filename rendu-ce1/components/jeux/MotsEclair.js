const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MotsEclair;
var _react = require("react");
var _motsEclair = require("../../lib/jeux/motsEclair");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\MotsEclair.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/mot_eclaire.webp';

/**
 * LES MOTS ÉCLAIR, À L'ÉCRAN.
 *
 * Toute la règle vit dans `motsEclair.js`, y compris pourquoi c'est l'enfant
 * qui déclenche l'éclair.
 *
 * TROIS TEMPS PAR MANCHE : l'éclair attend qu'on le touche ; le mot passe ;
 * les trois cartes apparaissent. UNE CARTE TOUCHÉE EST UNE RÉPONSE : il n'y
 * a qu'un mot à trouver, pas de train à remplir, donc rien à annoncer.
 *
 * ADRIEN NE DIT JAMAIS LE MOT AVANT LE CHOIX : l'enfant le retrouverait à
 * l'oreille. Il le dit après, une fois trouvé ou montré — c'est ce qui lie
 * la forme écrite au mot entendu.
 *
 * LE DÉCOR MONTRE DES MOTS QUI VOLENT (« chat », « avion »…) : le cadre de
 * l'éclair est donc OPAQUE dans ses trois temps, pour qu'aucun mot du décor
 * ne se lise à la place du mot à retrouver.
 */
function MotsEclair({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _motsEclair.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [temps, setTemps] = (0, _react.useState)('attente');
  const [revu, setRevu] = (0, _react.useState)(false);
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [trouve, setTrouve] = (0, _react.useState)(false);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const montrer = !trouve && fautes.length >= _motsEclair.ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesEclair.consigne;
  (0, _react.useEffect)(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup, _motsEclair.MANCHES));
  }, [fini, duPremierCoup, dire]);

  // L'ÉCLAIR S'ÉTEINT TOUT SEUL, après un coup d'œil.
  (0, _react.useEffect)(() => {
    if (temps !== 'eclair') return undefined;
    const t = setTimeout(() => setTemps('choix'), (0, _motsEclair.dureeEclair)(manche));
    return () => clearTimeout(t);
  }, [temps, manche]);
  const eclairer = (0, _react.useCallback)(() => setTemps('eclair'), []);
  const revoir = (0, _react.useCallback)(() => {
    setRevu(true);
    setTemps('eclair');
  }, []);
  const choisir = (0, _react.useCallback)(carte => {
    if (termine || temps !== 'choix') return;
    if (carte === courante.mot) {
      setTrouve(true);
      dire([_repliques.commun.bravo(manche), _repliques.repliquesEclair.mot(courante.mot)]);
      return;
    }
    const suivantes = [...fautes, carte];
    setFautes(suivantes);
    if (suivantes.length >= _motsEclair.ESSAIS_AVANT_AIDE) dire([_repliques.repliquesEclair.aide, _repliques.repliquesEclair.mot(courante.mot)]);else dire(_repliques.repliquesEclair.erreur);
  }, [termine, temps, courante.mot, fautes, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (trouve && fautes.length === 0) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _motsEclair.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setTemps('attente');
    setRevu(false);
    setFautes([]);
    setTrouve(false);
  }, [manche, trouve, fautes.length]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setTemps('attente');
    setRevu(false);
    setFautes([]);
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
        lineNumber: 111,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 112,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 113,
        columnNumber: 27
      }
    }, "sur ", _motsEclair.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 115,
        columnNumber: 9
      }
    }, (0, _motsEclair.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 117,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 118,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 121,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const erreur = fautes.length > 0 && !termine;
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--eclair",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_motsEclair.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 133,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.mot}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 142,
      columnNumber: 7
    }
  }, _motsEclair.PHRASES.consigne, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 144,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: `eclair__cadre eclair__cadre--${temps}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 7
    }
  }, temps === 'attente' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "eclair__declencheur",
    onClick: eclairer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 151,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 152,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M13.5 2 5 13.5h6L9.5 22 19 9.5h-6.2z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 15
    }
  })), /*#__PURE__*/React.createElement("span", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 13
    }
  }, "Montre le mot")), temps === 'eclair' && /*#__PURE__*/React.createElement("p", {
    className: "eclair__mot",
    "aria-live": "assertive",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 11
    }
  }, courante.mot), temps === 'choix' && (termine ? /*#__PURE__*/React.createElement("p", {
    className: "eclair__mot eclair__mot--pose",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 11
    }
  }, courante.mot) : /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "eclair__revoir",
    onClick: revoir,
    disabled: revu,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 166,
      columnNumber: 11
    }
  }, revu ? 'Tu l’as déjà revu' : 'Revoir le mot'))), temps === 'choix' && /*#__PURE__*/React.createElement("ul", {
    className: "eclair__cartes",
    "aria-label": "Quel mot as-tu vu ?",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 173,
      columnNumber: 9
    }
  }, courante.cartes.map(c => {
    const fausse = fautes.includes(c);
    const bonne = termine && c === courante.mot;
    return /*#__PURE__*/React.createElement("li", {
      key: c,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 178,
        columnNumber: 15
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `eclair__carte${fausse ? ' est-fausse' : ''}${bonne ? ' est-bonne' : ''}`,
      onClick: () => choisir(c),
      disabled: termine || fausse,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 179,
        columnNumber: 17
      }
    }, c));
  })), erreur && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 18
    }
  }, _motsEclair.PHRASES.erreur), montrer && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 196,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "eclair__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 197,
      columnNumber: 11
    }
  }, _motsEclair.PHRASES.aide), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 198,
      columnNumber: 11
    }
  }, "Continuer")), trouve && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 205,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 206,
      columnNumber: 11
    }
  }, "Vu\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 207,
      columnNumber: 11
    }
  }, "Continuer")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 213,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"));
}