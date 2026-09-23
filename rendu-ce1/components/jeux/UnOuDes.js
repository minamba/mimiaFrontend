const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = UnOuDes;
var _react = require("react");
var _unOuDes = require("../../lib/jeux/unOuDes");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _AccordsCE = _interopRequireDefault(require("./AccordsCE2"));
var _AccordsCM = _interopRequireDefault(require("./AccordsCM1"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\UnOuDes.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/uneoudes.webp';
/**
 * UN OU DES ?, À L'ÉCRAN.
 *
 * Toute la règle vit dans `unOuDes.js`, y compris pourquoi Adrien ne dit
 * jamais l'étiquette.
 *
 * DEUX RANGÉES DE CHOIX, UNE PAR CASE DE L'ÉTIQUETTE : le petit mot, puis le
 * nom. Toucher un choix le pose dans sa case ; en toucher un autre le
 * remplace. L'enfant annonce quand les deux cases sont remplies — la leçon
 * des paquets de dix.
 *
 * LE S DU PLURIEL EST MIS EN VALEUR sur l'étiquette juste : c'est la lettre
 * que le jeu apprend à écrire, et la seule qu'on ne peut pas entendre.
 *
 * LE DÉCOR EST UNE SALLE DE JEUX : l'ardoise et l'étiquette se posent sur le
 * mur clair du milieu.
 */
/** Au CE2, le féminin et le pluriel des groupes — voir `AccordsCE2.js`. */
function UnOuDesAvantCM1({
  niveau,
  ...props
}) {
  return niveau === 'CE2' ? /*#__PURE__*/React.createElement(_AccordsCE.default, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 29
    }
  })) : /*#__PURE__*/React.createElement(UnOuDesCP, Object.assign({}, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 57
    }
  }));
}
function UnOuDesCP({
  onQuitter,
  matiereCode
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _unOuDes.serie)(graine), [graine]);
  const [manche, setManche] = (0, _react.useState)(0);
  const [petitMot, setPetitMot] = (0, _react.useState)(null);
  const [forme, setForme] = (0, _react.useState)(null);
  const [resultat, setResultat] = (0, _react.useState)(null);
  const [ratees, setRatees] = (0, _react.useState)(0);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  // Les formes du nom que l'enfant a écoutées dans cette manche, et si Adrien
  // a déjà fait remarquer que « c'est pareil » dans cette partie.
  const [entendus, setEntendus] = (0, _react.useState)([]);
  const [pareilDit, setPareilDit] = (0, _react.useState)(false);
  const courante = manches[manche];
  const leNom = (0, _unOuDes.nom)(courante.nom);
  const juste = (resultat === null || resultat === void 0 ? void 0 : resultat.sens) === 'juste';
  const montrer = !juste && ratees >= _unOuDes.ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = _repliques.repliquesUnOuDes.consigne;
  (0, _react.useEffect)(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup, _unOuDes.MANCHES));
  }, [fini, duPremierCoup, dire]);
  const poserPetitMot = (0, _react.useCallback)(m => {
    if (termine) return;
    setResultat(null);
    setPetitMot(m);
  }, [termine]);
  const poserForme = (0, _react.useCallback)(f => {
    if (termine) return;
    setResultat(null);
    setForme(f);
  }, [termine]);

  /**
   * ÉCOUTER UNE ÉTIQUETTE, SANS LA CHOISIR. Quand l'enfant a écouté les deux
   * formes du nom — « fleur », puis « fleurs » —, Adrien ajoute que c'est
   * pareil : une fois par partie. Voir la note de `unOuDes.js`.
   */
  const ecouter = (0, _react.useCallback)((etiquetteChoisie, estNom) => {
    const mot = _repliques.repliquesUnOuDes.mot(etiquetteChoisie);
    if (!estNom) {
      dire(mot);
      return;
    }
    const suivants = entendus.includes(etiquetteChoisie) ? entendus : [...entendus, etiquetteChoisie];
    setEntendus(suivants);
    const lesDeux = courante.formes.every(f => suivants.includes(f));
    if (lesDeux && !pareilDit) {
      setPareilDit(true);
      dire([mot, _repliques.repliquesUnOuDes.pareil]);
    } else {
      dire(mot);
    }
  }, [entendus, courante, pareilDit, dire]);
  const annoncer = (0, _react.useCallback)(() => {
    const r = (0, _unOuDes.verdict)(petitMot, forme, courante);
    if (r.sens === 'juste') {
      dire(_repliques.commun.bravo(manche));
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      if (suivantes >= _unOuDes.ESSAIS_AVANT_AIDE) dire(_repliques.repliquesUnOuDes.aide);else if (r.sens === 'nombre') dire(_repliques.repliquesUnOuDes.nombre(r.pluriel));else dire(_repliques.repliquesUnOuDes.accord(r.pluriel));
    }
    setResultat(r);
  }, [petitMot, forme, courante, manche, ratees, dire]);
  const suivante = (0, _react.useCallback)(() => {
    if (propre && juste) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _unOuDes.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setPetitMot(null);
    setForme(null);
    setResultat(null);
    setRatees(0);
    setPropre(true);
    setEntendus([]);
  }, [manche, propre, juste]);
  const rejouer = (0, _react.useCallback)(() => {
    setGraine(Date.now());
    setManche(0);
    setPetitMot(null);
    setForme(null);
    setResultat(null);
    setRatees(0);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
    setEntendus([]);
    setPareilDit(false);
  }, []);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 151,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 152,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 153,
        columnNumber: 27
      }
    }, "sur ", _unOuDes.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 155,
        columnNumber: 9
      }
    }, (0, _unOuDes.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 157,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 158,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 161,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }
  let message = null;
  if (resultat && !termine) {
    if (resultat.sens === 'nombre') message = resultat.pluriel ? _unOuDes.PHRASES.nombreDes : _unOuDes.PHRASES.nombreUn;else message = resultat.pluriel ? _unOuDes.PHRASES.accordDes : _unOuDes.PHRASES.accordUn;
  }

  // Ce que porte l'étiquette : le choix de l'enfant, ou la bonne réponse.
  const [motAffiche, formeAffichee] = montrer ? (0, _unOuDes.etiquette)(courante).split(' ') : [petitMot, forme];
  const pluriel = courante.combien > 1;
  const faute = resultat && !termine ? resultat.sens : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--unoudes",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 183,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_unOuDes.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 184,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.nom}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 186,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 193,
      columnNumber: 7
    }
  }, _unOuDes.PHRASES.consigne, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: laConsigne,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 195,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: `unoudes__image${pluriel ? ' est-pluriel' : ''}`,
    role: "img"
    // Le nombre d'objets, sans l'étiquette : la lire donnerait la réponse.
    ,
    "aria-label": `${courante.combien} fois l’image : ${leNom.nom}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 199,
      columnNumber: 7
    }
  }, Array.from({
    length: courante.combien
  }, (_, i) =>
  /*#__PURE__*/
  // Des copies du même objet : la place est la seule identité.
  // eslint-disable-next-line react/no-array-index-key
  React.createElement("span", {
    key: i,
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 11
    }
  }, leNom.image))), /*#__PURE__*/React.createElement("p", {
    className: `unoudes__etiquette${juste || montrer ? ' est-juste' : ''}`,
    "aria-label": "L\u2019\xE9tiquette",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 213,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: `unoudes__case${motAffiche ? ' est-pleine' : ''}${faute === 'nombre' ? ' est-fautive' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 214,
      columnNumber: 9
    }
  }, motAffiche !== null && motAffiche !== void 0 ? motAffiche : '…'), /*#__PURE__*/React.createElement("span", {
    className: `unoudes__case unoudes__case--nom${formeAffichee ? ' est-pleine' : ''}${faute === 'accord' ? ' est-fautive' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 217,
      columnNumber: 9
    }
  }, formeAffichee && (juste || montrer) && pluriel ? /*#__PURE__*/React.createElement(React.Fragment, null, leNom.nom, /*#__PURE__*/React.createElement("strong", {
    className: "unoudes__s",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 219,
      columnNumber: 28
    }
  }, "s")) : formeAffichee !== null && formeAffichee !== void 0 ? formeAffichee : '…')), !termine && /*#__PURE__*/React.createElement("div", {
    className: "unoudes__choix",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 225,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("ul", {
    className: "unoudes__rangee",
    "aria-label": "Le petit mot",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 226,
      columnNumber: 11
    }
  }, courante.petitsMots.map(m => /*#__PURE__*/React.createElement("li", {
    key: m,
    className: "unoudes__place",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 228,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `unoudes__tuile${petitMot === m ? ' est-choisie' : ''}`,
    onClick: () => poserPetitMot(m),
    "aria-pressed": petitMot === m,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 229,
      columnNumber: 17
    }
  }, m), /*#__PURE__*/React.createElement(BoutonEcouter, {
    mot: m,
    onEcouter: () => ecouter(m, false),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 237,
      columnNumber: 17
    }
  })))), /*#__PURE__*/React.createElement("ul", {
    className: "unoudes__rangee",
    "aria-label": "Le nom",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 241,
      columnNumber: 11
    }
  }, courante.formes.map(f => /*#__PURE__*/React.createElement("li", {
    key: f,
    className: "unoudes__place",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 243,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `unoudes__tuile${forme === f ? ' est-choisie' : ''}`,
    onClick: () => poserForme(f),
    "aria-pressed": forme === f,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 244,
      columnNumber: 17
    }
  }, f), /*#__PURE__*/React.createElement(BoutonEcouter, {
    mot: f,
    onEcouter: () => ecouter(f, true),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 252,
      columnNumber: 17
    }
  }))))), message && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 259,
      columnNumber: 19
    }
  }, message), montrer && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 262,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "unoudes__aide",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 263,
      columnNumber: 11
    }
  }, _unOuDes.PHRASES.aide), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 264,
      columnNumber: 11
    }
  }, "Continuer")), juste && /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 271,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 272,
      columnNumber: 11
    }
  }, "Bien \xE9crit\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 273,
      columnNumber: 11
    }
  }, "Continuer")), !termine && petitMot && forme && !resultat && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 280,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 285,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"));
}

/**
 * Le haut-parleur d'une étiquette : il la fait dire, il ne la choisit pas.
 * C'est un bouton à part, pour qu'écouter ne soit jamais répondre.
 */
function BoutonEcouter({
  mot,
  onEcouter
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "unoudes__ecouter",
    onClick: onEcouter,
    "aria-label": `Écouter « ${mot} »`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 298,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 299,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 9.5h3.5L12 5.5v13l-4.5-4H4z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 300,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11",
    fill: "none",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 301,
      columnNumber: 9
    }
  })));
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `AccordsCM1.js` ; il lit la classe. */
function UnOuDes({
  niveau,
  ...props
}) {
  return niveau === 'CM1' || niveau === 'CM2' ? /*#__PURE__*/React.createElement(_AccordsCM.default, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 309,
      columnNumber: 49
    }
  })) : /*#__PURE__*/React.createElement(UnOuDesAvantCM1, Object.assign({
    niveau: niveau
  }, props, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 309,
      columnNumber: 93
    }
  }));
}