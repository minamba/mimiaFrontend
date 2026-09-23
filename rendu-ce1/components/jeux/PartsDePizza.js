const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PartsDePizza;
var _react = require("react");
var _partsDePizza = require("../../lib/jeux/partsDePizza");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _FractionsCM = _interopRequireDefault(require("./FractionsCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PartsDePizza.js";
/**
 * LES PARTS DE PIZZA, À L'ÉCRAN.
 *
 * Toute la règle vit dans `partsDePizza.js`, y compris pourquoi les pizzas
 * n'apparaissent qu'après la comparaison.
 *
 * UNE FRACTION TOUCHÉE EST UNE RÉPONSE — une seule à trouver, rien à
 * assembler. Les fractions s'écrivent comme au tableau, un nombre sur
 * l'autre, jamais « 3/4 » : c'est la forme que l'enfant apprend à lire.
 */
function PartsDePizzaAvantCM1({
  onQuitter,
  matiereCode,
  niveau = 'CE1'
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _partsDePizza.serie)(graine, niveau), [graine, niveau]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [fautes, setFautes] = (0, _react.useState)([]);
  const [sens, setSens] = (0, _react.useState)(null);
  const [trouve, setTrouve] = (0, _react.useState)(false);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const {
    mode
  } = courante;
  const montrer = !trouve && fautes.length >= _partsDePizza.ESSAIS_AVANT_AIDE;
  const termine = trouve || montrer;
  const bonne = (0, _partsDePizza.reponse)(courante);
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesPizza.consigne(mode);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const choisir = (0, _react.useCallback)(f => {
    if (termine) return;
    const s = (0, _partsDePizza.verdict)(f, courante);
    if (s === 'juste') {
      setTrouve(true);
      setSens(null);
      if (fautes.length === 0) setDuPremierCoup(n => n + 1);
      dire(_repliques.commun.bravo(manche));
      return;
    }
    const suivantes = [...fautes, (0, _partsDePizza.cle)(f)];
    setFautes(suivantes);
    setSens(s);
    dire(suivantes.length >= _partsDePizza.ESSAIS_AVANT_AIDE ? _repliques.repliquesPizza.aide : _repliques.repliquesPizza.erreur(s));
  }, [termine, courante, fautes, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (manche + 1 >= _partsDePizza.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setFautes([]);
    setSens(null);
    setTrouve(false);
  }, [manche]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setFautes([]);
    setSens(null);
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
        lineNumber: 90,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 91,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 92,
        columnNumber: 27
      }
    }, "sur ", _partsDePizza.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 9
      }
    }, (0, _partsDePizza.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 96,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 97,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 100,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--scene jeu--pizza",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 109,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_partsDePizza.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 114,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    // eslint-disable-next-line react/no-array-index-key
    key: i,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 116,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 124,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 126,
      columnNumber: 9
    }
  })), mode === 'lire' && /*#__PURE__*/React.createElement(Pizzas, Object.assign({}, courante.fraction, {
    grande: true,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 131,
      columnNumber: 27
    }
  })), mode === 'egaler' && /*#__PURE__*/React.createElement("div", {
    className: "pizza__addition",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement(Pizza, Object.assign({}, courante.modele, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 136,
      columnNumber: 11
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "pizza__signe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 137,
      columnNumber: 11
    }
  }, "="), /*#__PURE__*/React.createElement(Pizza, {
    n: termine ? courante.fraction.n : 0,
    d: courante.fraction.d,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 138,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "pizza__calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 139,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement(Fraction, Object.assign({}, courante.modele, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 140,
      columnNumber: 13
    }
  })), " =", termine ? /*#__PURE__*/React.createElement(Fraction, Object.assign({}, bonne, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 24
    }
  })) : /*#__PURE__*/React.createElement(Fraction, {
    n: "?",
    d: courante.fraction.d,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 141,
      columnNumber: 50
    }
  }))), mode === 'comparer' && termine && /*#__PURE__*/React.createElement("div", {
    className: "pizza__rangee",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 9
    }
  }, courante.choix.map(f => /*#__PURE__*/React.createElement(Pizza, Object.assign({
    key: (0, _partsDePizza.cle)(f)
  }, f, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 148,
      columnNumber: 38
    }
  })))), mode === 'additionner' && /*#__PURE__*/React.createElement("div", {
    className: "pizza__addition",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement(Pizza, Object.assign({}, courante.termes[0], {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 11
    }
  })), /*#__PURE__*/React.createElement("span", {
    className: "pizza__signe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 11
    }
  }, "+"), /*#__PURE__*/React.createElement(Pizza, Object.assign({}, courante.termes[1], {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 11
    }
  })), termine && bonne.n > bonne.d && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "pizza__signe",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 159,
      columnNumber: 15
    }
  }, "="), /*#__PURE__*/React.createElement(Pizzas, Object.assign({}, bonne, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 160,
      columnNumber: 15
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "pizza__calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 163,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement(Fraction, Object.assign({}, courante.termes[0], {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 13
    }
  })), " + ", /*#__PURE__*/React.createElement(Fraction, Object.assign({}, courante.termes[1], {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 52
    }
  })), " =", termine ? /*#__PURE__*/React.createElement(Fraction, Object.assign({}, bonne, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 165,
      columnNumber: 24
    }
  })) : ' ?')), !termine && /*#__PURE__*/React.createElement("ul", {
    className: "scene__choix",
    "aria-label": "Choisis la fraction",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 9
    }
  }, courante.choix.map(f => /*#__PURE__*/React.createElement("li", {
    key: (0, _partsDePizza.cle)(f),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 173,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `scene__carte pizza__choix${fautes.includes((0, _partsDePizza.cle)(f)) ? ' est-fausse' : ''}`,
    onClick: () => choisir(f),
    disabled: fautes.includes((0, _partsDePizza.cle)(f)),
    "aria-label": `${f.n} sur ${f.d}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 174,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement(Fraction, Object.assign({}, f, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 181,
      columnNumber: 17
    }
  })))))), sens && !termine && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 188,
      columnNumber: 28
    }
  }, _partsDePizza.PHRASES[_partsDePizza.ERREURS[sens]]), termine && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 191,
      columnNumber: 9
    }
  }, montrer && /*#__PURE__*/React.createElement("p", {
    className: "scene__bulle",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 192,
      columnNumber: 23
    }
  }, _partsDePizza.PHRASES.aide), /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul pizza__reponse",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement(Fraction, Object.assign({}, bonne, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 194,
      columnNumber: 13
    }
  }))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 196,
      columnNumber: 11
    }
  }, "Continuer")));
}

/** Une fraction écrite comme au tableau : un nombre sur l'autre. */
function Fraction({
  n,
  d
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "fraction",
    "aria-label": `${n} sur ${d}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "fraction__haut",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 209,
      columnNumber: 7
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    className: "fraction__bas",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 210,
      columnNumber: 7
    }
  }, d));
}

/**
 * PLUS D'UNE PIZZA : 5/4, c'est une pizza entière garnie et un quart d'une
 * seconde. Chaque pizza reste coupée en `d` : c'est ce qui permet de compter
 * les cinq quarts.
 */
function Pizzas({
  n,
  d,
  grande
}) {
  if (n <= d) return /*#__PURE__*/React.createElement(Pizza, {
    n: n,
    d: d,
    grande: grande,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 221,
      columnNumber: 22
    }
  });
  const pleines = Math.floor(n / d);
  const reste = n % d;
  return /*#__PURE__*/React.createElement("div", {
    className: "pizza__rangee",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 225,
      columnNumber: 5
    }
  }, Array.from({
    length: pleines
  }, (_, i) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement(Pizza, {
    key: i,
    n: d,
    d: d,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 228,
      columnNumber: 9
    }
  })), reste > 0 && /*#__PURE__*/React.createElement(Pizza, {
    n: reste,
    d: d,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 230,
      columnNumber: 21
    }
  }));
}

/**
 * UNE PIZZA COUPÉE EN `d` PARTS ÉGALES, dont `n` garnies. Les parts vides
 * restent de la pâte : la pizza entière est toujours visible, c'est « le
 * tout » dont la fraction est une partie.
 */
function Pizza({
  n,
  d,
  grande
}) {
  const r = 46;
  const part = i => {
    const a0 = i / d * 2 * Math.PI - Math.PI / 2;
    const a1 = (i + 1) / d * 2 * Math.PI - Math.PI / 2;
    const x0 = 50 + r * Math.cos(a0);
    const y0 = 50 + r * Math.sin(a0);
    const x1 = 50 + r * Math.cos(a1);
    const y1 = 50 + r * Math.sin(a1);
    return `M50 50 L${x0} ${y0} A${r} ${r} 0 ${1 / d > 0.5 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  return /*#__PURE__*/React.createElement("svg", {
    className: `pizza${grande ? ' pizza--grande' : ''}`,
    viewBox: "0 0 100 100",
    role: "img",
    "aria-label": `Une pizza coupée en ${d} parts, ${n} garnie${n > 1 ? 's' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 252,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "50",
    cy: "50",
    r: "49",
    className: "pizza__croute",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 258,
      columnNumber: 7
    }
  }), Array.from({
    length: d
  }, (_, i) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement("path", {
    key: i,
    d: part(i),
    className: i < n ? 'pizza__garnie' : 'pizza__vide',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 261,
      columnNumber: 9
    }
  })), Array.from({
    length: n
  }, (_, i) => {
    const a = (i + 0.5) / d * 2 * Math.PI - Math.PI / 2;
    return (
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      React.createElement("circle", {
        key: i,
        cx: 50 + 27 * Math.cos(a),
        cy: 50 + 27 * Math.sin(a),
        r: "5",
        className: "pizza__rondelle",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 267,
          columnNumber: 11
        }
      })
    );
  }));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `FractionsCM1.js` ; il lit la classe. */
function PartsDePizza({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_FractionsCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 276,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(PartsDePizzaAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 276,
      columnNumber: 95
    }
  }));
}