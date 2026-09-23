const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PaquetsDeDix;
var _react = require("react");
var _paquetsDeDix = require("../../lib/jeux/paquetsDeDix");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\PaquetsDeDix.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/paquet_10_bg.webp';
/**
 * LES PAQUETS DE DIX, À L'ÉCRAN.
 *
 * Toute la règle vit dans `paquetsDeDix.js`, y compris pourquoi dix bûchettes
 * deviennent toujours un paquet.
 *
 * L'ENFANT ANNONCE QUAND IL A FINI, et c'est le cœur du jeu — Camara, le
 * 21/09/2026 : « comment je sais que j'ai bon ou pas bon ? ». La première
 * version se contentait d'allumer la victoire dès que le compte tombait
 * juste. Deux défauts, dont un grave :
 *
 *   - Tant qu'on était en dessous, RIEN ne se disait. L'enfant qui pensait
 *     avoir fini restait devant un écran muet, sans savoir s'il s'était
 *     trompé ou s'il lui manquait seulement une bûchette.
 *
 *   - Surtout, ON NE POUVAIT PAS SE TROMPER. En ajoutant une bûchette à la
 *     fois, on passait forcément par le bon nombre, et le jeu s'allumait tout
 *     seul. C'est exactement le reproche fait à la première boîte de 10.
 *
 * Avec l'annonce, l'enfant s'engage AVANT de voir le résultat : c'est ce qui
 * sépare « poser des bûchettes » de « préparer trente-trois bûchettes ». Et la
 * réponse nomme le sens de l'erreur, comme le train nomme « trop loin » et
 * « pas assez loin » — jamais un simple « raté ».
 *
 * DES BÛCHETTES, PARCE QUE LE DÉCOR EN EST PLEIN — même règle que les prix de
 * la marchande, qui viennent des ardoises de son stand. Le tableau de la
 * classe annonce « 1 dizaine = 10 » au-dessus d'un fagot lié de raphia, et il
 * y en a un autre posé sur le bureau. Un jeu qui poserait des jetons ronds
 * là-dessus contredirait son propre dessin. C'est aussi le matériel que
 * l'enfant a dans les mains en classe.
 *
 * DIX BÛCHETTES FONT EXACTEMENT LA LARGEUR D'UN PAQUET, au dessin près : le
 * fagot n'est pas un symbole de dix, c'est dix bûchettes qu'on peut compter.
 *
 * ON CLIQUE, ON NE GLISSE PAS — même raison que les trois autres jeux : le
 * glisser-déposer échoue sur un trackpad, sur un écran tactile mal calibré,
 * et il est inaccessible au clavier.
 *
 * CE QUI EST POSÉ EST LUI-MÊME LE BOUTON DE REPRISE : cliquer un paquet ou
 * une bûchette déjà là la retire, même geste que les pièces de la marchande.
 */
function PaquetsDeDix({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _paquetsDeDix.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [paquets, setPaquets] = (0, _react.useState)(0);
  const [unites, setUnites] = (0, _react.useState)(0);

  // LA RÉPONSE ANNONCÉE, ou `null` tant que l'enfant construit encore. C'est
  // elle qui décide de tout ce qui s'affiche : rien ne se juge avant qu'il
  // ait dit qu'il avait fini.
  const [annonce, setAnnonce] = (0, _react.useState)(null);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const cible = manches[manche];
  const juste = annonce === 'juste';
  const pose = paquets > 0 || unites > 0;

  // LA VOIX DE LA PROFESSEURE : la consigne à chaque manche, la note à la
  // fin. Voir `voix/useVoixJeu.js`.
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesPaquets.consigne(cible);
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const ajouterPaquet = (0, _react.useCallback)(() => {
    if (juste) return;
    setAnnonce(null);
    setPaquets(paquets + 1);
  }, [juste, paquets]);
  const ajouterBuchette = (0, _react.useCallback)(() => {
    if (juste) return;
    setAnnonce(null);

    // DIX BÛCHETTES DEVIENNENT UN PAQUET — voir la note du module.
    if (unites === 9) {
      setPaquets(paquets + 1);
      setUnites(0);
      return;
    }
    setUnites(unites + 1);
  }, [juste, paquets, unites]);
  const reprendrePaquet = (0, _react.useCallback)(() => {
    if (juste || paquets === 0) return;
    setAnnonce(null);
    setPaquets(paquets - 1);
  }, [juste, paquets]);
  const reprendreBuchette = (0, _react.useCallback)(() => {
    if (juste || unites === 0) return;
    setAnnonce(null);
    setUnites(unites - 1);
  }, [juste, unites]);

  /**
   * « C'EST PRÊT ! » — le seul moment où le jeu répond.
   *
   * Une annonce fausse coûte la manche au tableau final, jamais la manche
   * elle-même : on corrige et on réannonce autant de fois qu'il faut.
   */
  const annoncer = (0, _react.useCallback)(() => {
    const sens = (0, _paquetsDeDix.verdict)(paquets, unites, cible);
    if (sens !== 'juste') setPropre(false);
    setAnnonce(sens);
    if (sens === 'juste') dire(_repliques.commun.bravo(manche));else dire(sens === 'trop' ? _repliques.repliquesPaquets.trop : _repliques.repliquesPaquets.pasAssez);
  }, [paquets, unites, cible, manche, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _paquetsDeDix.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPaquets(0);
    setUnites(0);
    setAnnonce(null);
    setPropre(true);
  }, [manche, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPaquets(0);
    setUnites(0);
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
        lineNumber: 163,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 164,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 165,
        columnNumber: 27
      }
    }, "sur ", _paquetsDeDix.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 167,
        columnNumber: 9
      }
    }, (0, _paquetsDeDix.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 169,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 170,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 173,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--paquets",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 182,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 183,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_paquetsDeDix.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 7
    }
  }, manches.map((c, i) => /*#__PURE__*/React.createElement("li", {
    key: `${c}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 189,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 196,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 198,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "paquets__zone",
    role: "group",
    "aria-label": pose ? `${paquets} paquet${paquets > 1 ? 's' : ''} de dix et ${unites} bûchette${unites > 1 ? 's' : ''}` : 'Rien de posé pour l’instant',
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 203,
      columnNumber: 7
    }
  }, !pose && /*#__PURE__*/React.createElement("p", {
    className: "paquets__vide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 213,
      columnNumber: 11
    }
  }, "Pose tes paquets et tes b\xFBchettes ici"), Array.from({
    length: paquets
  }, (_, i) => /*#__PURE__*/React.createElement("button", {
    key: `paquet-${i}`,
    type: "button",
    className: "paquets__paquet",
    onClick: reprendrePaquet,
    disabled: juste,
    "aria-label": "Reprendre un paquet de dix",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 217,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement(Paquet, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 225,
      columnNumber: 13
    }
  }))), Array.from({
    length: unites
  }, (_, i) => /*#__PURE__*/React.createElement("button", {
    key: `buchette-${i}`,
    type: "button",
    className: "paquets__buchette",
    onClick: reprendreBuchette,
    disabled: juste,
    "aria-label": "Reprendre une b\xFBchette",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 230,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement(Buchette, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 238,
      columnNumber: 13
    }
  })))), annonce === 'trop' && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 246,
      columnNumber: 9
    }
  }, _paquetsDeDix.PHRASES.trop), annonce === 'pas-assez' && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 249,
      columnNumber: 9
    }
  }, _paquetsDeDix.PHRASES.pasAssez), juste ? /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 253,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 254,
      columnNumber: 11
    }
  }, paquets, " paquet", paquets > 1 ? 's' : '', unites > 0 ? ` et ${unites} bûchette${unites > 1 ? 's' : ''}` : ''), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 258,
      columnNumber: 11
    }
  }, "Continuer")) : /*#__PURE__*/React.createElement("div", {
    className: "paquets__barre",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 263,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "paquets__actions",
    role: "group",
    "aria-label": "Ajouter \xE0 ce qui est pos\xE9",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 264,
      columnNumber: 11
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "paquets__ajouter",
    onClick: ajouterPaquet,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 265,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(Paquet, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 266,
      columnNumber: 15
    }
  }), "Un paquet de dix"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "paquets__ajouter",
    onClick: ajouterBuchette,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 269,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement(Buchette, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 270,
      columnNumber: 15
    }
  }), "Une b\xFBchette")), pose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal paquets__annoncer",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 279,
      columnNumber: 13
    }
  }, "C\u2019est pr\xEAt\xA0!")));
}

/**
 * UN PAQUET DE DIX : dix bûchettes liées par un lien de raphia.
 *
 * Les dix bûchettes sont VRAIMENT dessinées, pas suggérées : l'enfant qui
 * doute peut les compter. Un fagot opaque ne serait qu'un symbole de dix,
 * et il faudrait le croire sur parole.
 */
function Paquet() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "paquet",
    viewBox: "0 0 62 48",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 298,
      columnNumber: 5
    }
  }, Array.from({
    length: 10
  }, (_, i) => /*#__PURE__*/React.createElement("g", {
    key: i,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 300,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("rect", {
    className: "buchette__corps",
    x: 1.4 + i * 6,
    y: "4",
    width: "4.4",
    height: "40",
    rx: "2.2",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 301,
      columnNumber: 11
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "buchette__reflet",
    x: 2.4 + i * 6,
    y: "8",
    width: "1.4",
    height: "11",
    rx: "0.7",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 302,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("rect", {
    className: "paquet__lien",
    x: "0",
    y: "17",
    width: "62",
    height: "10",
    rx: "2",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 306,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "paquet__lien-ombre",
    x: "0",
    y: "24",
    width: "62",
    height: "3",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 307,
      columnNumber: 7
    }
  }));
}

/** Une bûchette seule, pas encore liée dans un paquet. */
function Buchette() {
  return /*#__PURE__*/React.createElement("svg", {
    className: "buchette",
    viewBox: "0 0 14 48",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 315,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    className: "buchette__corps",
    x: "2",
    y: "4",
    width: "10",
    height: "40",
    rx: "5",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 316,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("rect", {
    className: "buchette__reflet",
    x: "4.2",
    y: "9",
    width: "2.6",
    height: "13",
    rx: "1.3",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 317,
      columnNumber: 7
    }
  }));
}