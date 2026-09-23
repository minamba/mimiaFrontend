const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ChantierDesFormes;
var _react = require("react");
var _chantierDesFormes = require("../../lib/jeux/chantierDesFormes");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\ChantierDesFormes.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/chantier.webp';
/**
 * LE CHANTIER DES FORMES, À L'ÉCRAN.
 *
 * Toute la règle vit dans `chantierDesFormes.js`, y compris pourquoi un carré
 * sur la pointe est une pièce à trouver et pourquoi un carré n'est jamais
 * posé quand on demande les rectangles.
 *
 * LA CONSIGNE EST DITE, ET N'A PLUS DE DESSIN — Camara, le 21/09/2026. Le
 * dessin de la forme demandée donnait la réponse : l'enfant comparait deux
 * images sans avoir à savoir ce que veut dire « rectangle ». C'est maintenant
 * Nora qui le dit, et c'est le mot qu'il faut relier à la forme.
 *
 * L'ENFANT CHOISIT, PUIS ANNONCE — la leçon des paquets de dix. Rien ne se
 * juge avant « C'est prêt ! » : sans ça, il suffirait de cliquer les pièces
 * une à une jusqu'à ce que le jeu s'allume.
 *
 * LES PIÈCES N'ONT PAS DE NOM POUR LES LECTEURS D'ÉCRAN, seulement un
 * numéro. Les nommer « triangle renversé » donnerait la réponse : le jeu est
 * par nature visuel, c'est la forme qu'on apprend à reconnaître.
 *
 * TOUTES LES PIÈCES SONT DES CONTOURS, AUCUNE N'EST PLEINE. Une forme ouverte
 * ne peut pas être remplie — SVG la refermerait pour la peindre. Si les
 * pièces fermées étaient pleines et les ouvertes en trait seul, l'enfant
 * reconnaîtrait les faux amis à leur allure, sans regarder s'ils sont fermés.
 *
 * ON CLIQUE, ON NE GLISSE PAS — même raison que les quatre autres jeux.
 *
 * LE DÉCOR EST UNE IMAGE, LES PIÈCES SONT DESSINÉES — la règle des quatre
 * autres jeux. L'affiche et les planches du chantier montrent les quatre
 * formes, mais SANS LEUR NOM : elles ne donnent donc pas la réponse, puisque
 * c'est le mot entendu qu'il faut relier à la forme.
 */
function ChantierDesFormes({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _chantierDesFormes.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [choisies, setChoisies] = (0, _react.useState)([]);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const courante = manches[manche];
  const juste = (resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'juste';
  const laConsigne = _repliques.repliquesChantier.consigne(courante.famille);

  // L'AIDE, au bout de trois annonces fausses : les bonnes pièces sont
  // montrées, et on peut passer à la suite. Voir la note du module.
  const montrer = !juste && ratees >= _chantierDesFormes.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  // LA CONSIGNE SE DIT À CHAQUE MANCHE, dès qu'elle s'affiche.
  (0, _react.useEffect)(() => {
    if (!fini) dire(laConsigne);
    // La clé suffit : l'objet est refait à chaque rendu, sa clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);

  // LA NOTE, DITE PAR LA PROFESSEURE, quand la partie se termine.
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const basculer = (0, _react.useCallback)(id => {
    if (termine) return;
    setResultat(null);
    setChoisies(actuelles => actuelles.includes(id) ? actuelles.filter(x => x !== id) : [...actuelles, id]);
  }, [termine]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _chantierDesFormes.verdict)(choisies, courante.pieces);
    if (r.sens === 'juste') {
      dire(_repliques.commun.bravo(manche));
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      dire(suivantes >= _chantierDesFormes.ESSAIS_AVANT_AIDE ? _repliques.repliquesChantier.aide(courante.famille) : (0, _chantierDesFormes.erreur)(r, courante.famille, courante.pieces));
    }
    setResultat(r);
  }, [choisies, courante, manche, ratees, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre && juste) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _chantierDesFormes.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setChoisies([]);
    setResultat(null);
    setRatees(0);
    setPropre(true);
  }, [manche, propre, juste]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setChoisies([]);
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
        lineNumber: 131,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 132,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 133,
        columnNumber: 27
      }
    }, "sur ", _chantierDesFormes.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 135,
        columnNumber: 9
      }
    }, (0, _chantierDesFormes.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 137,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 138,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 141,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  const phrase = resultat && !juste && !montrer ? (0, _chantierDesFormes.message)(resultat, courante.famille, courante.pieces) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--chantier",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 155,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_chantierDesFormes.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 159,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.famille}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 161,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 168,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 170,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("ul", {
    className: "chantier__tas",
    "aria-label": "Le tas de pi\xE8ces",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 173,
      columnNumber: 7
    }
  }, courante.pieces.map((piece, i) => {
    const choisie = choisies.includes(piece.id);
    const fautive = resultat === null || resultat === void 0 ? void 0 : resultat.erreurs.includes(piece.id);
    const montree = montrer && piece.cible;
    return /*#__PURE__*/React.createElement("li", {
      key: piece.id,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 180,
        columnNumber: 13
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: `chantier__piece${choisie ? ' est-choisie' : ''}${fautive ? ' est-fautive' : ''}${montree ? ' est-montree' : ''}`,
      onClick: () => basculer(piece.id),
      disabled: termine,
      "aria-pressed": choisie,
      "aria-label": `Pièce ${i + 1}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 181,
        columnNumber: 15
      }
    }, /*#__PURE__*/React.createElement(Piece, {
      piece: piece,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 189,
        columnNumber: 17
      }
    })));
  })), phrase && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 196,
      columnNumber: 18
    }
  }, phrase), montrer && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 199,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "chantier__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 200,
      columnNumber: 11
    }
  }, (0, _chantierDesFormes.aide)(courante.famille)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 201,
      columnNumber: 11
    }
  }, "Continuer")), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 209,
      columnNumber: 11
    }
  }, choisies.length, " ", _chantierDesFormes.PLURIELS[courante.famille], "\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 212,
      columnNumber: 11
    }
  }, "Continuer")), !termine && choisies.length > 0 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 222,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"));
}

/** Une pièce du tas, dans sa couleur, sa taille et son orientation. */
function Piece({
  piece
}) {
  var _m$rotation;
  const m = (0, _chantierDesFormes.modele)(piece.modele);
  const rotation = (_m$rotation = m.rotation) !== null && _m$rotation !== void 0 ? _m$rotation : 0;
  return /*#__PURE__*/React.createElement("svg", {
    className: "forme",
    viewBox: "0 0 100 100",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 237,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("g", {
    transform: `rotate(${rotation} 50 50) translate(50 50) scale(${piece.taille}) translate(-50 -50)`,
    style: {
      stroke: piece.couleur
    }
    // Le trait ne doit pas maigrir avec la pièce : une petite forme au
    // trait fin paraîtrait plus légère, et la taille parlerait encore.
    ,
    strokeWidth: 7 / piece.taille,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 238,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement(Trace, {
    modele: m,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 245,
      columnNumber: 9
    }
  })));
}

/** Le tracé d'un modèle, en contour seul. */
function Trace({
  modele: m
}) {
  const {
    trace
  } = m;
  switch (trace.type) {
    case 'polygone':
      return /*#__PURE__*/React.createElement("polygon", {
        className: "forme__trait",
        points: trace.points,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 257,
          columnNumber: 14
        }
      });
    case 'ligne':
      return /*#__PURE__*/React.createElement("polyline", {
        className: "forme__trait",
        points: trace.points,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 259,
          columnNumber: 14
        }
      });
    case 'cercle':
      return /*#__PURE__*/React.createElement("circle", {
        className: "forme__trait",
        cx: "50",
        cy: "50",
        r: trace.r,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 261,
          columnNumber: 14
        }
      });
    case 'ellipse':
      return /*#__PURE__*/React.createElement("ellipse", {
        className: "forme__trait",
        cx: "50",
        cy: "50",
        rx: trace.rx,
        ry: trace.ry,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 263,
          columnNumber: 14
        }
      });
    default:
      return /*#__PURE__*/React.createElement("path", {
        className: "forme__trait",
        d: trace.d,
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 265,
          columnNumber: 14
        }
      });
  }
}