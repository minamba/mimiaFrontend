const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DeuxParDeux;
var _react = require("react");
var _deuxParDeux = require("../../lib/jeux/deuxParDeux");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\DeuxParDeux.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/2par2.webp';
/**
 * DEUX PAR DEUX, À L'ÉCRAN.
 *
 * Toute la règle vit dans `deuxParDeux.js`, y compris pourquoi l'une des
 * assiettes est sous une cloche.
 *
 * NORA LIT LA QUESTION PUIS LES QUATRE RÉPONSES, et le bouton qu'elle nomme
 * s'éclaire — le même mécanisme que l'horloge.
 *
 * LA BONNE RÉPONSE SE MONTRE AUSSITÔT : au double, la cloche se lève sur les
 * biscuits cachés ; à la moitié, la grande assiette se partage en deux. Ce
 * qu'on vient de calculer, l'enfant le voit se vérifier.
 *
 * LE DÉCOR EST UNE IMAGE, LES ASSIETTES SONT DESSINÉES — la règle des autres
 * jeux. L'esplanade de la fête foraine, au centre, porte la table.
 */
function DeuxParDeux({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _deuxParDeux.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [choix, setChoix] = (0, _react.useState)(null);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const double = courante.mode === 'double';
  const sens = choix === null ? null : (0, _deuxParDeux.verdict)(choix, courante);
  const juste = sens === 'juste';
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = double ? _repliques.repliquesDeux.consigneDouble : _repliques.repliquesDeux.consigneMoitie;
  const aDire = [laConsigne, ...courante.choix.map(_repliques.repliquesDeux.nombre)];
  (0, _react.useEffect)(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const repondre = (0, _react.useCallback)(valeur => {
    if (juste) return;
    setChoix(valeur);
    const s = (0, _deuxParDeux.verdict)(valeur, courante);
    if (s === 'juste') {
      dire([_repliques.commun.bravo(manche), _repliques.repliquesDeux.resultat(courante.mode, courante.n)]);
    } else {
      setPropre(false);
      dire(_repliques.repliquesDeux.erreur(s));
    }
  }, [juste, courante, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(k => k + 1);
    if (manche + 1 >= _deuxParDeux.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setChoix(null);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setChoix(null);
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
        lineNumber: 92,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 93,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 94,
        columnNumber: 27
      }
    }, "sur ", _deuxParDeux.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 96,
        columnNumber: 9
      }
    }, (0, _deuxParDeux.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 98,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 99,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 102,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const message = sens && !juste ? _deuxParDeux.PHRASES[CLE_PHRASE[sens]] : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--deux",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 113,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 114,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_deuxParDeux.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 118,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.mode}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 120,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 127,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: aDire,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 129,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement(Table, {
    mode: courante.mode,
    n: courante.n,
    devoile: juste,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 132,
      columnNumber: 7
    }
  }), !juste && /*#__PURE__*/React.createElement("div", {
    className: "deux__reponses",
    role: "group",
    "aria-label": "Choisis ta r\xE9ponse",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 135,
      columnNumber: 9
    }
  }, courante.choix.map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    type: "button",
    className: `deux__reponse${choix === v ? ' est-refusee' : ''}${voix.enCours === _repliques.repliquesDeux.nombre(v).cle ? ' est-lue' : ''}`,
    onClick: () => repondre(v),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 137,
      columnNumber: 13
    }
  }, v))), message && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 19
    }
  }, message), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 152,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 153,
      columnNumber: 11
    }
  }, double ? (0, _deuxParDeux.resultatDouble)(courante.n) : (0, _deuxParDeux.resultatMoitie)(courante.n)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 156,
      columnNumber: 11
    }
  }, "Continuer")));
}
const CLE_PHRASE = {
  oubli: 'oubli',
  tout: 'tout',
  trop: 'trop',
  'pas-assez': 'pasAssez'
};

// ------------------------------------------------------------- le dessin

/**
 * Les places d'une petite assiette : deux rangs de cinq au plus. Rangés, ils
 * se comptent bien — c'est voulu ici : l'assiette visible est celle qu'on
 * doit compter.
 */
function placesPetite(cx, n) {
  return Array.from({
    length: n
  }, (_, i) => {
    const rang = Math.floor(i / 5);
    const dansRang = Math.min(5, n - rang * 5);
    const col = i % 5;
    const rangs = Math.ceil(n / 5);
    return {
      x: cx + (col - (dansRang - 1) / 2) * 25,
      y: 124 + (rang - (rangs - 1) / 2) * 26
    };
  });
}

/**
 * LES PLACES DE LA GRANDE ASSIETTE, EN DÉSORDRE : une grille bousculée, et un
 * ordre de remplissage fixe qui éparpille les biscuits. Rangés par deux, ils
 * donneraient la moitié toute faite.
 */
const GRILLE = (() => {
  // UNE SECOUSSE DE TROIS POINTS AU PLUS : assez pour casser les paires, pas
  // assez pour qu'un biscuit en chevauche un autre — un tas qu'on ne peut plus
  // compter ne se partage pas.
  const secousse = [[3, -2], [-2, 3], [1, 2], [-3, -1], [2, 3], [-1, -3], [3, 1]];
  const cases = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      const [dx, dy] = secousse[(c + r * 3) % secousse.length];
      cases.push({
        x: 200 + (c - 3) * 34 + dx,
        y: 122 + (r - 1) * 30 + dy
      });
    }
  }
  const ordre = [10, 3, 17, 7, 13, 0, 20, 5, 15, 1, 19, 8, 12, 4, 16, 9, 11, 2, 18, 6, 14];
  return ordre.map(i => cases[i]);
})();
function Table({
  mode,
  n,
  devoile
}) {
  const libelle = mode === 'double' ? `Deux assiettes. Sur l'une, ${n} biscuits. L'autre est sous une cloche${devoile ? `, et on voit ${n} biscuits` : ''}.` : devoile ? `Les biscuits partagés : ${n} sur chaque assiette.` : `Une grande assiette avec ${2 * n} biscuits à partager.`;
  return /*#__PURE__*/React.createElement("svg", {
    className: "deux__table",
    viewBox: "0 0 400 190",
    role: "img",
    "aria-label": libelle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 216,
      columnNumber: 5
    }
  }, mode === 'double' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Assiette, {
    cx: 100,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 219,
      columnNumber: 11
    }
  }), placesPetite(100, n).map((p, i) => /*#__PURE__*/React.createElement(Biscuit, Object.assign({
    key: `g${i}`
  }, p, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 220,
      columnNumber: 47
    }
  }))), /*#__PURE__*/React.createElement(Assiette, {
    cx: 300,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 221,
      columnNumber: 11
    }
  }), devoile && placesPetite(300, n).map((p, i) => /*#__PURE__*/React.createElement(Biscuit, Object.assign({
    key: `d${i}`
  }, p, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 222,
      columnNumber: 58
    }
  }))), /*#__PURE__*/React.createElement(Cloche, {
    cx: 300,
    levee: devoile,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 223,
      columnNumber: 11
    }
  })), mode === 'moitie' && !devoile && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ellipse", {
    className: "deux__assiette",
    cx: "200",
    cy: "122",
    rx: "176",
    ry: "64",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 229,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("ellipse", {
    className: "deux__assiette-fond",
    cx: "200",
    cy: "122",
    rx: "150",
    ry: "52",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 230,
      columnNumber: 11
    }
  }), GRILLE.slice(0, 2 * n).map((p, i) => /*#__PURE__*/React.createElement(Biscuit, Object.assign({
    key: i
  }, p, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 231,
      columnNumber: 49
    }
  })))), mode === 'moitie' && devoile && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Assiette, {
    cx: 100,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 237,
      columnNumber: 11
    }
  }), placesPetite(100, n).map((p, i) => /*#__PURE__*/React.createElement(Biscuit, Object.assign({
    key: `g${i}`
  }, p, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 238,
      columnNumber: 47
    }
  }))), /*#__PURE__*/React.createElement(Assiette, {
    cx: 300,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 239,
      columnNumber: 11
    }
  }), placesPetite(300, n).map((p, i) => /*#__PURE__*/React.createElement(Biscuit, Object.assign({
    key: `d${i}`
  }, p, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 240,
      columnNumber: 47
    }
  })))));
}
function Assiette({
  cx
}) {
  return /*#__PURE__*/React.createElement("g", {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 249,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ellipse", {
    className: "deux__assiette",
    cx: cx,
    cy: "124",
    rx: "88",
    ry: "44",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 250,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("ellipse", {
    className: "deux__assiette-fond",
    cx: cx,
    cy: "124",
    rx: "72",
    ry: "35",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 251,
      columnNumber: 7
    }
  }));
}

/** Un biscuit rond, et ses pépites. */
function Biscuit({
  x,
  y
}) {
  return /*#__PURE__*/React.createElement("g", {
    transform: `translate(${x} ${y})`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 259,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("circle", {
    className: "deux__biscuit",
    r: "11",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 260,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "deux__pepite",
    cx: "-4",
    cy: "-3",
    r: "1.8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 261,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "deux__pepite",
    cx: "4",
    cy: "-1",
    r: "1.6",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 262,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "deux__pepite",
    cx: "-1",
    cy: "4",
    r: "1.7",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 263,
      columnNumber: 7
    }
  }));
}

/** La cloche : elle cache l'assiette de droite, et se lève à la bonne réponse. */
function Cloche({
  cx,
  levee
}) {
  return /*#__PURE__*/React.createElement("g", {
    className: `deux__cloche${levee ? ' est-levee' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 271,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    className: "deux__cloche-dome",
    d: `M${cx - 84} 128 Q${cx - 84} 34 ${cx} 34 Q${cx + 84} 34 ${cx + 84} 128 Z`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 272,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "deux__cloche-reflet",
    d: `M${cx - 58} 104 Q${cx - 56} 62 ${cx - 22} 52`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 273,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "deux__cloche-bord",
    x: cx - 90,
    y: "124",
    width: "180",
    height: "9",
    rx: "4.5",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 274,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "deux__cloche-bouton",
    cx: cx,
    cy: "30",
    r: "8",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 275,
      columnNumber: 7
    }
  }));
}