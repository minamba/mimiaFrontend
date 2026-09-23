const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Balance;
var _react = require("react");
var _balance = require("../../lib/jeux/balance");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Balance.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/balance.webp';
/**
 * LA BALANCE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `balance.js`, y compris pourquoi on range au lieu
 * de demander « lequel est le plus lourd ? ».
 *
 * UNE MANCHE DE RANGEMENT A DEUX TEMPS, et c'est l'enfant qui passe de l'un
 * à l'autre :
 *
 *   1. PESER. Il touche un objet sur la table : il va sur la balance, à
 *      gauche puis à droite. Il touche un objet sur un plateau : il revient
 *      sur la table. Il pèse autant de paires qu'il veut.
 *
 *   2. RANGER. Il touche les objets du plus léger au plus lourd ; ils se
 *      posent dans trois cases. Une case touchée rend son objet. Il peut
 *      toujours revenir peser.
 *
 * AU MESURAGE, DEUX BOUTONS — poser un cube, en reprendre un — et l'annonce.
 * La balance bouge à chaque cube : c'est elle qui répond, pas le jeu.
 *
 * ON TOUCHE, ON NE GLISSE PAS — même raison que les autres jeux.
 *
 * LE DÉCOR EST UNE IMAGE, LA BALANCE EST DESSINÉE — la règle des autres
 * jeux. La terrasse libre au centre du décor porte la balance.
 *
 * AU CE1, LA BOÎTE DE POIDS remplace les cubes au mesurage : toucher un poids
 * de la boîte le pose sur le plateau, toucher un poids posé le range. La
 * boîte n'a que ses cinq poids — voir `balance.js`.
 */
function Balance({
  onQuitter,
  matiereCode,
  niveau = 'CP'
}) {
  var _droite$masse, _droite, _gauche$masse, _gauche;
  // Au CE1 comme au CE2, on mesure avec des poids marqués ; seule la boîte
  // change. `ce1` veut donc dire ici « avec des poids », CE2 compris.
  const ce2 = niveau === 'CE2';
  const ce1 = niveau === 'CE1' || ce2;
  const BOITE_POIDS = (0, _balance.boiteDe)(niveau);
  const resultatPoids = ce2 ? _balance.resultatCE2 : _balance.resultatCE1;
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _balance.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [phase, setPhase] = (0, _react.useState)('peser');
  const [surBalance, setSurBalance] = (0, _react.useState)([null, null]);
  const [rangement, setRangement] = (0, _react.useState)([]);
  const [plein, setPlein] = (0, _react.useState)(false);
  const [cubes, setCubes] = (0, _react.useState)(0);
  // Au CE1 : les poids posés, par leur place dans la boîte (deux 200 g se
  // distinguent ainsi l'un de l'autre).
  const [poids, setPoids] = (0, _react.useState)([]);
  const [annonce, setAnnonce] = (0, _react.useState)(null);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const ranger = courante.mode === 'ranger';
  const juste = (annonce === null || annonce === void 0 ? void 0 : annonce.sens) === 'juste' || annonce === 'juste';
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  let laConsigne;
  if (!ranger) {
    laConsigne = ce1 ? _repliques.repliquesBalance.consignePeserCE1(courante.objet) : _repliques.repliquesBalance.consignePeser(courante.objet);
  } else if (phase === 'ranger') laConsigne = _repliques.repliquesBalance.consigneRanger;else laConsigne = _repliques.repliquesBalance.consigneComparer;
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);

  // ---------------------------------------------------------- ranger

  const peserObjet = (0, _react.useCallback)(cle => {
    if (juste) return;
    setAnnonce(null);
    const [g, d] = surBalance;
    if (!g) setSurBalance([cle, d]);else if (!d) setSurBalance([g, cle]);else {
      setPlein(true);
      dire(_repliques.repliquesBalance.plein);
      return;
    }
    setPlein(false);
  }, [juste, surBalance, dire]);
  const retirer = (0, _react.useCallback)(cote => {
    if (juste) return;
    setPlein(false);
    setSurBalance(([g, d]) => cote === 'gauche' ? [null, d] : [g, null]);
  }, [juste]);
  const passerAuRangement = (0, _react.useCallback)(() => {
    setSurBalance([null, null]);
    setPlein(false);
    setPhase('ranger');
  }, []);
  const revenirPeser = (0, _react.useCallback)(() => {
    setRangement([]);
    setAnnonce(null);
    setPhase('peser');
  }, []);
  const placer = (0, _react.useCallback)(cle => {
    if (juste) return;
    setAnnonce(null);
    setRangement(r => r.length >= 3 ? r : [...r, cle]);
  }, [juste]);
  const deplacer = (0, _react.useCallback)(i => {
    if (juste) return;
    setAnnonce(null);
    setRangement(r => r.filter((_, k) => k !== i));
  }, [juste]);
  const annoncerRangement = (0, _react.useCallback)(() => {
    const v = (0, _balance.verdictRanger)(rangement);
    setAnnonce(v);
    if (v.sens === 'juste') dire(_repliques.commun.bravo(manche));else {
      setPropre(false);
      dire(_repliques.repliquesBalance.plusLourdQue(v.lourd, v.leger));
    }
  }, [rangement, manche, dire]);

  // ---------------------------------------------------------- mesurer

  const poser = (0, _react.useCallback)(delta => {
    if (juste) return;
    setAnnonce(null);
    setCubes(n => Math.max(0, Math.min(_balance.CUBES_MAX, n + delta)));
  }, [juste]);
  const basculerPoids = (0, _react.useCallback)(place => {
    if (juste) return;
    setAnnonce(null);
    setPoids(p => p.includes(place) ? p.filter(x => x !== place) : [...p, place]);
  }, [juste]);
  const grammesPoses = poids.reduce((somme, place) => somme + BOITE_POIDS[place], 0);
  const annoncerMesure = (0, _react.useCallback)(() => {
    const s = ce1 ? (0, _balance.verdictGrammes)(poids.map(place => BOITE_POIDS[place]), courante.objet, niveau) : (0, _balance.verdictPeser)(cubes, courante.objet);
    setAnnonce(s);
    if (s === 'juste') {
      // Le bravo, puis la mesure dite en entier : « La pomme pèse 3 cubes. »
      dire([_repliques.commun.bravo(manche), ce1 ? _repliques.repliquesBalance.resultatPoids(courante.objet, niveau) : _repliques.repliquesBalance.resultat(courante.objet)]);
    } else {
      setPropre(false);
      dire(ce1 ? _repliques.repliquesBalance.erreurCE1(s) : _repliques.repliquesBalance.erreur(s));
    }
  }, [ce1, poids, cubes, courante.objet, manche, dire, niveau, BOITE_POIDS]);

  // ---------------------------------------------------------- la partie

  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _balance.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPhase('peser');
    setSurBalance([null, null]);
    setRangement([]);
    setPlein(false);
    setCubes(0);
    setPoids([]);
    setAnnonce(null);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPhase('peser');
    setSurBalance([null, null]);
    setRangement([]);
    setPlein(false);
    setCubes(0);
    setPoids([]);
    setAnnonce(null);
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
        lineNumber: 217,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 218,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 219,
        columnNumber: 27
      }
    }, "sur ", _balance.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 221,
        columnNumber: 9
      }
    }, (0, _balance.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 223,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 224,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 227,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }

  // Ce que montre la balance.
  let gauche = null;
  let droite = null;
  if (ranger) {
    gauche = surBalance[0] && (0, _balance.objet)(surBalance[0]);
    droite = surBalance[1] && (0, _balance.objet)(surBalance[1]);
  } else {
    gauche = (0, _balance.objet)(courante.objet);
  }
  let contrepoids = cubes;
  if (ranger) contrepoids = (_droite$masse = (_droite = droite) === null || _droite === void 0 ? void 0 : _droite.masse) !== null && _droite$masse !== void 0 ? _droite$masse : 0;else if (ce1) contrepoids = grammesPoses / (0, _balance.grammesParCube)(niveau);
  const angle = (0, _balance.inclinaison)((_gauche$masse = (_gauche = gauche) === null || _gauche === void 0 ? void 0 : _gauche.masse) !== null && _gauche$masse !== void 0 ? _gauche$masse : 0, contrepoids);

  // Ce qui reste sur la table.
  const sorti = phase === 'peser' ? surBalance : rangement;
  const table = ranger ? courante.table.filter(c => !sorti.includes(c)) : [];
  let message = null;
  if ((annonce === null || annonce === void 0 ? void 0 : annonce.sens) === 'inverse') message = _repliques.repliquesBalance.plusLourdQue(annonce.lourd, annonce.leger).texte;else if (annonce === 'manque' || annonce === 'trop') message = (ce1 ? _balance.PHRASES_CE1 : _balance.PHRASES)[annonce];else if (plein) message = _balance.PHRASES.plein;
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--balance",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 259,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 260,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_balance.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 264,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.mode}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 266,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 273,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 275,
      columnNumber: 9
    }
  })), (!ranger || phase === 'peser') && /*#__PURE__*/React.createElement(Plateaux, {
    angle: angle,
    gauche: gauche,
    droite: droite,
    cubes: ranger || ce1 ? null : cubes,
    poids: !ranger && ce1 ? poids.map(place => BOITE_POIDS[place]) : null,
    onRetirer: ranger && !juste ? retirer : null,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 279,
      columnNumber: 9
    }
  }), ranger && phase === 'ranger' && /*#__PURE__*/React.createElement("ol", {
    className: "balance__cases",
    "aria-label": "Du plus l\xE9ger au plus lourd",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 290,
      columnNumber: 9
    }
  }, [0, 1, 2].map(i => {
    const cle = rangement[i];
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      className: "balance__case-li",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 294,
        columnNumber: 15
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `balance__case${cle ? ' est-remplie' : ''}`,
      onClick: () => cle && deplacer(i),
      disabled: !cle || juste,
      "aria-label": cle ? `Case ${i + 1} : ${(0, _balance.avecArticle)((0, _balance.objet)(cle))}, la reprendre` : `Case ${i + 1}, vide`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 295,
        columnNumber: 17
      }
    }, cle && /*#__PURE__*/React.createElement(Vignette, {
      cle: cle,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 302,
        columnNumber: 27
      }
    })), /*#__PURE__*/React.createElement("span", {
      className: "balance__case-etiquette",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 304,
        columnNumber: 17
      }
    }, i === 0 && 'le plus léger', i === 2 && 'le plus lourd'));
  })), ranger && !juste && table.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "balance__table",
    role: "group",
    "aria-label": "Les objets sur la table",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 315,
      columnNumber: 9
    }
  }, table.map(cle => /*#__PURE__*/React.createElement("button", {
    key: cle,
    type: "button",
    className: "balance__objet",
    onClick: () => phase === 'peser' ? peserObjet(cle) : placer(cle),
    "aria-label": (0, _balance.avecArticle)((0, _balance.objet)(cle)),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 317,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(Vignette, {
    cle: cle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 324,
      columnNumber: 15
    }
  })))), !ranger && !juste && ce1 && /*#__PURE__*/React.createElement("div", {
    className: "balance__poids-zone",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 331,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "balance__boite",
    role: "group",
    "aria-label": "La bo\xEEte de poids",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 332,
      columnNumber: 11
    }
  }, BOITE_POIDS.map((g, place) => /*#__PURE__*/React.createElement("button", {
    // Deux poids de même valeur : la place dans la boîte les distingue.
    // eslint-disable-next-line react/no-array-index-key
    key: place,
    type: "button",
    className: `balance__poids balance__poids--${g}${poids.includes(place) ? ' est-pose' : ''}`,
    onClick: () => basculerPoids(place),
    "aria-pressed": poids.includes(place),
    "aria-label": poids.includes(place) ? `Reprendre ${g} grammes` : `Poser ${g} grammes`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 334,
      columnNumber: 15
    }
  }, (0, _balance.etiquettePoids)(g))))), !ranger && !juste && !ce1 && /*#__PURE__*/React.createElement("div", {
    className: "balance__actions",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 352,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "balance__bouton",
    onClick: () => poser(1),
    disabled: cubes >= _balance.CUBES_MAX,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 353,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "balance__cube-icone",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 354,
      columnNumber: 13
    }
  }), "Poser un cube"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "balance__bouton",
    onClick: () => poser(-1),
    disabled: cubes === 0,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 357,
      columnNumber: 11
    }
  }, "Reprendre un cube")), message && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 363,
      columnNumber: 19
    }
  }, message), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 366,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 367,
      columnNumber: 11
    }
  }, ranger && 'Bien rangé !', !ranger && (ce1 ? resultatPoids(courante.objet) : (0, _balance.resultat)(courante.objet))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 371,
      columnNumber: 11
    }
  }, "Continuer")), !juste && /*#__PURE__*/React.createElement("div", {
    className: "balance__actions",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 378,
      columnNumber: 9
    }
  }, ranger && phase === 'peser' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: passerAuRangement,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 380,
      columnNumber: 13
    }
  }, "J\u2019ai pes\xE9, je range"), ranger && phase === 'ranger' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "balance__bouton",
    onClick: revenirPeser,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 385,
      columnNumber: 13
    }
  }, "Peser encore"), ranger && phase === 'ranger' && rangement.length === 3 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncerRangement,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 390,
      columnNumber: 13
    }
  }, "C\u2019est pr\xEAt\xA0!"), !ranger && (ce1 ? poids.length > 0 : cubes > 0) && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncerMesure,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 395,
      columnNumber: 13
    }
  }, "C\u2019est pr\xEAt\xA0!")));
}

// ------------------------------------------------------------- le dessin

const PIVOT = {
  x: 160,
  y: 58
};
const BRAS = 108;
const SUSPENTE = 52;

/** Le point où pend un plateau, au bout du fléau incliné. */
function bout(cote, angle) {
  const a = angle * Math.PI / 180;
  const s = cote === 'gauche' ? -1 : 1;
  return {
    x: PIVOT.x + s * BRAS * Math.cos(a),
    y: PIVOT.y + s * BRAS * Math.sin(a)
  };
}

/**
 * LA BALANCE : un fléau qui penche, deux plateaux qui restent à plat. Au
 * rangement, un objet posé sur un plateau est un bouton qui le rend à la
 * table.
 */
function Plateaux({
  angle,
  gauche,
  droite,
  cubes,
  poids,
  onRetirer
}) {
  const g = bout('gauche', angle);
  const d = bout('droite', angle);
  const pg = {
    x: g.x,
    y: g.y + SUSPENTE
  };
  const pd = {
    x: d.x,
    y: d.y + SUSPENTE
  };
  const cibles = [...(gauche ? [{
    o: gauche,
    p: pg,
    cote: 'gauche'
  }] : []), ...(droite ? [{
    o: droite,
    p: pd,
    cote: 'droite'
  }] : [])];
  return /*#__PURE__*/React.createElement("div", {
    className: "balance",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 438,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 320 240",
    role: "img",
    "aria-label": libelle(angle, gauche, droite, cubes, poids),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 439,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("path", {
    className: "balance__pied",
    d: "M122 228 h76 l-14 -16 h-48 Z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 440,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "balance__colonne",
    x: "155",
    y: PIVOT.y,
    width: "10",
    height: "156",
    rx: "4",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 441,
      columnNumber: 9
    }
  }), [g, d].map((p, i) => /*#__PURE__*/React.createElement("g", {
    key: i,
    className: "balance__cote",
    style: {
      transform: `translate(${p.x}px, ${p.y}px)`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 444,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement("line", {
    className: "balance__fil",
    x1: "0",
    y1: "0",
    x2: "-34",
    y2: SUSPENTE,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 445,
      columnNumber: 13
    }
  }), /*#__PURE__*/React.createElement("line", {
    className: "balance__fil",
    x1: "0",
    y1: "0",
    x2: "34",
    y2: SUSPENTE,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 446,
      columnNumber: 13
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "balance__plateau",
    d: `M-46 ${SUSPENTE} Q0 ${SUSPENTE + 16} 46 ${SUSPENTE} Z`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 447,
      columnNumber: 13
    }
  }))), /*#__PURE__*/React.createElement("g", {
    className: "balance__fleau",
    style: {
      transform: `rotate(${angle}deg)`,
      transformOrigin: `${PIVOT.x}px ${PIVOT.y}px`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 451,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: PIVOT.x - BRAS - 4,
    y: PIVOT.y - 4,
    width: 2 * BRAS + 8,
    height: "8",
    rx: "4",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 452,
      columnNumber: 11
    }
  })), /*#__PURE__*/React.createElement("circle", {
    className: "balance__axe",
    cx: PIVOT.x,
    cy: PIVOT.y,
    r: "8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 454,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("g", {
    className: "balance__cote",
    style: {
      transform: `translate(${pg.x}px, ${pg.y}px)`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 456,
      columnNumber: 9
    }
  }, gauche && /*#__PURE__*/React.createElement(Objet, {
    cle: gauche.cle,
    taille: gauche.taille,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 457,
      columnNumber: 22
    }
  })), /*#__PURE__*/React.createElement("g", {
    className: "balance__cote",
    style: {
      transform: `translate(${pd.x}px, ${pd.y}px)`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 459,
      columnNumber: 9
    }
  }, droite && /*#__PURE__*/React.createElement(Objet, {
    cle: droite.cle,
    taille: droite.taille,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 460,
      columnNumber: 22
    }
  }), cubes !== null && /*#__PURE__*/React.createElement(Cubes, {
    nombre: cubes,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 461,
      columnNumber: 30
    }
  }), poids && /*#__PURE__*/React.createElement(Poids, {
    valeurs: poids,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 462,
      columnNumber: 21
    }
  }))), onRetirer && cibles.map(({
    o,
    p,
    cote
  }) => /*#__PURE__*/React.createElement("button", {
    key: cote,
    type: "button",
    className: "balance__cible",
    style: {
      left: `${p.x / 320 * 100}%`,
      top: `${(p.y - 24) / 240 * 100}%`
    },
    onClick: () => onRetirer(cote),
    "aria-label": `Reprendre ${(0, _balance.avecArticle)(o)}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 467,
      columnNumber: 9
    }
  })));
}
function libelle(angle, gauche, droite, cubes, poids) {
  const bas = angle === 0 ? null : angle > 0 ? 'droite' : 'gauche';
  const g = gauche ? gauche.nom : 'rien';
  let d = droite ? droite.nom : 'rien';
  if (cubes !== null) d = `${cubes} cube${cubes > 1 ? 's' : ''}`;
  if (poids) d = `${poids.reduce((a, b) => a + b, 0)} grammes`;
  return `Balance : ${g} à gauche, ${d} à droite. ${bas ? `Le plateau de ${bas} descend.` : 'La balance est droite.'}`;
}

/**
 * UN OBJET HORS DE LA BALANCE, à sa taille relative : sur la table comme dans
 * les cases, le ballon reste le plus gros. C'est ce qui garde le piège.
 */
function Vignette({
  cle
}) {
  const {
    taille
  } = (0, _balance.objet)(cle);
  return /*#__PURE__*/React.createElement("svg", {
    className: "balance__vignette",
    viewBox: "-31 -64 62 67",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 496,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement(Objet, {
    cle: cle,
    taille: taille,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 497,
      columnNumber: 7
    }
  }));
}

/** Les cubes posés, en pile de quatre par rang. */
function Cubes({
  nombre
}) {
  return /*#__PURE__*/React.createElement("g", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 505,
      columnNumber: 5
    }
  }, Array.from({
    length: nombre
  }, (_, i) => {
    const rang = Math.floor(i / 4);
    const dans = i % 4;
    const parRang = Math.min(4, nombre - rang * 4);
    const x = (dans - (parRang - 1) / 2) * 17;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      transform: `translate(${x} ${-8 - rang * 16})`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 512,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("rect", {
      className: "balance__cube",
      x: "-8",
      y: "-8",
      width: "16",
      height: "16",
      rx: "2.5",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 513,
        columnNumber: 13
      }
    }), /*#__PURE__*/React.createElement("rect", {
      className: "balance__cube-reflet",
      x: "-5.5",
      y: "-5.5",
      width: "6",
      height: "4",
      rx: "1",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 514,
        columnNumber: 13
      }
    }));
  }));
}

/**
 * LES POIDS POSÉS, côte à côte : plus un poids est lourd, plus il est gros,
 * comme les poids de laiton de la classe — et chacun porte sa valeur.
 */
function Poids({
  valeurs
}) {
  const largeurs = valeurs.map(g => {
    if (g >= 1000) return 36;
    if (g >= 500) return 30;
    return g >= 200 ? 24 : 18;
  });
  const total = largeurs.reduce((a, b) => a + b + 3, -3);
  let x = -total / 2;
  return /*#__PURE__*/React.createElement("g", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 535,
      columnNumber: 5
    }
  }, valeurs.map((g, i) => {
    const l = largeurs[i];
    const h = l;
    const centre = x + l / 2;
    x += l + 3;
    return (
      /*#__PURE__*/
      // Des poids de même valeur se ressemblent : la place est l'identité.
      // eslint-disable-next-line react/no-array-index-key
      React.createElement("g", {
        key: i,
        transform: `translate(${centre} 0)`,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 544,
          columnNumber: 11
        }
      }, /*#__PURE__*/React.createElement("rect", {
        className: "balance__poids-corps",
        x: -l / 2,
        y: -h,
        width: l,
        height: h,
        rx: "3",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 545,
          columnNumber: 13
        }
      }), /*#__PURE__*/React.createElement("rect", {
        className: "balance__poids-bouton",
        x: -l / 6,
        y: -h - 5,
        width: l / 3,
        height: "6",
        rx: "2",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 546,
          columnNumber: 13
        }
      }), /*#__PURE__*/React.createElement("text", {
        className: "balance__poids-valeur",
        x: "0",
        y: -h / 2 + 3,
        textAnchor: "middle",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 547,
          columnNumber: 13
        }
      }, g >= 1000 ? '1 kg' : g))
    );
  }));
}

/** Un objet posé : dessiné le bas à 0, à l'échelle de sa taille. */
function Objet({
  cle,
  taille
}) {
  return /*#__PURE__*/React.createElement("g", {
    transform: `scale(${taille})`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 558,
      columnNumber: 5
    }
  }, DESSINS[cle]);
}
const DESSINS = {
  ballon: /*#__PURE__*/React.createElement("g", {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 566,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "0",
    cy: "-24",
    r: "24",
    fill: "#3a86d4",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 567,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 -40 Q-2 -46 8 -42",
    stroke: "#bfe0ff",
    strokeWidth: "4",
    fill: "none",
    strokeLinecap: "round",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 568,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-4 -1 L0 -4 L4 -1 Z",
    fill: "#2a6aae",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 569,
      columnNumber: 7
    }
  })),
  balle: /*#__PURE__*/React.createElement("g", {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 573,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "0",
    cy: "-20",
    r: "20",
    fill: "#c9df3b",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 574,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-18 -30 Q-4 -20 -18 -10",
    stroke: "#fff",
    strokeWidth: "3",
    fill: "none",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 575,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18 -30 Q4 -20 18 -10",
    stroke: "#fff",
    strokeWidth: "3",
    fill: "none",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 576,
      columnNumber: 7
    }
  })),
  pomme: /*#__PURE__*/React.createElement("g", {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 580,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 -38 C-26 -46 -30 -8 -12 -1 C-6 1 -3 -2 0 -2 C3 -2 6 1 12 -1 C30 -8 26 -46 0 -38 Z",
    fill: "#e0443a",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 581,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M0 -38 Q2 -46 5 -50",
    stroke: "#6b4a2a",
    strokeWidth: "3",
    fill: "none",
    strokeLinecap: "round",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 582,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 -44 Q14 -52 20 -44 Q12 -40 4 -44 Z",
    fill: "#4aa34d",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 583,
      columnNumber: 7
    }
  })),
  conserve: /*#__PURE__*/React.createElement("g", {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 587,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "-18",
    y: "-44",
    width: "36",
    height: "44",
    rx: "3",
    fill: "#aeb8c4",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 588,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "-18",
    y: "-32",
    width: "36",
    height: "20",
    fill: "#e76f51",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 589,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "0",
    cy: "-44",
    rx: "18",
    ry: "4",
    fill: "#cfd7e0",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 590,
      columnNumber: 7
    }
  })),
  livre: /*#__PURE__*/React.createElement("g", {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 594,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "-26",
    y: "-18",
    width: "52",
    height: "18",
    rx: "2",
    fill: "#2f5fa8",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 595,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "-22",
    y: "-14",
    width: "46",
    height: "10",
    fill: "#fdf6e7",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 596,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    x: "-26",
    y: "-18",
    width: "6",
    height: "18",
    rx: "2",
    fill: "#244a85",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 597,
      columnNumber: 7
    }
  })),
  // UN GALET, PAS UN DÔME : arrondi de partout, une ombre dessous, des
  // mouchetures. À plat sur son dessous, il ressemblait à une tache grise.
  caillou: /*#__PURE__*/React.createElement("g", {
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 603,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M-24 -6 C-28 -22 -12 -36 4 -34 C22 -32 30 -18 24 -6 C20 2 -18 3 -24 -6 Z",
    fill: "#7d8591",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 604,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-22 -8 C-12 0 14 0 22 -8 C18 -1 -16 1 -22 -8 Z",
    fill: "#5f6672",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 605,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M-10 -26 Q0 -31 10 -27",
    stroke: "#b3bbc6",
    strokeWidth: "4",
    fill: "none",
    strokeLinecap: "round",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 606,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "-9",
    cy: "-14",
    r: "2",
    fill: "#636a75",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 607,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "-17",
    r: "1.6",
    fill: "#636a75",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 608,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "-9",
    r: "1.4",
    fill: "#636a75",
    __self: void 0,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 609,
      columnNumber: 7
    }
  }))
};