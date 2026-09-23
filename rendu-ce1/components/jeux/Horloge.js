const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Horloge;
var _react = require("react");
var _horloge = require("../../lib/jeux/horloge");
var _repliques = require("../../lib/jeux/voix/repliques");
var _useVoixJeu = _interopRequireDefault(require("../../lib/jeux/voix/useVoixJeu"));
var _BoutonsVoix = _interopRequireDefault(require("./BoutonsVoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Horloge.js";
const decor = 'file:///C:/Users/daryu/Documents/React-projects/school_ia/src/assets/Jeux/CP/horloge.webp';
/**
 * L'HORLOGE, À L'ÉCRAN.
 *
 * Toute la règle vit dans `horloge.js`, y compris pourquoi « 12 heures » est
 * toujours proposé à la lecture.
 *
 * RÉGLER, C'EST DEUX GESTES : choisir une aiguille, puis toucher le nombre où
 * la poser. On ne fait pas tourner une aiguille au doigt — le glisser échoue
 * sur un trackpad et reste inaccessible au clavier, même raison que les
 * autres jeux. Choisir l'aiguille AVANT est justement la compétence : savoir
 * laquelle des deux donne l'heure.
 *
 * LES AIGUILLES S'ARRÊTENT AVANT LES NOMBRES : la grande passait sur le 12
 * et le 9, et un enfant qui doit lire le nombre montré ne doit pas le
 * trouver barré.
 *
 * LES DEUX AIGUILLES NE SE DISTINGUENT PAS QUE PAR LA COULEUR : la petite est
 * courte et épaisse, la grande longue et fine, comme sur une vraie horloge.
 * La couleur aide, elle ne porte pas seule la différence.
 *
 * LE DÉCOR EST UNE IMAGE, L'HORLOGE EST DESSINÉE — la règle des autres jeux.
 * Le mur du décor est libre au centre, et c'est là que se pose le cadran.
 * L'horloge murale peinte à droite montre 10 h 10 : elle n'est pas une
 * heure juste, et ne peut donc jamais souffler la réponse d'une manche.
 *
 * AU CE1, LES AIGUILLES SONT LIÉES COMME SUR UNE VRAIE HORLOGE : l'enfant pose
 * la petite sur le 3 et la grande sur le 6, et la petite glisse d'elle-même à
 * mi-chemin du 4. Il voit ce qu'il lira ensuite : à la demie, la petite est
 * ENTRE deux nombres. Au CP, elles restent indépendantes — la grande part
 * n'importe où, et une petite qui se décalerait avec elle troublerait un
 * enfant qui apprend à la poser sur un nombre.
 */
function Horloge({
  onQuitter,
  matiereCode,
  niveau = 'CP'
}) {
  const [graine, setGraine] = (0, _react.useState)(() => Date.now());
  const manches = (0, _react.useMemo)(() => (0, _horloge.serie)(graine, _horloge.MANCHES, niveau), [graine, niveau]);
  const ce1 = niveau === 'CE1';
  const [manche, setManche] = (0, _react.useState)(0);
  const [reponse, setReponse] = (0, _react.useState)(null);
  const [aiguilles, setAiguilles] = (0, _react.useState)(() => {
    var _manches$0$depart;
    return (_manches$0$depart = manches[0].depart) !== null && _manches$0$depart !== void 0 ? _manches$0$depart : null;
  });
  const [choisie, setChoisie] = (0, _react.useState)(null);
  const [annonce, setAnnonce] = (0, _react.useState)(null);
  const [propre, setPropre] = (0, _react.useState)(true);
  const [duPremierCoup, setDuPremierCoup] = (0, _react.useState)(0);
  const [fini, setFini] = (0, _react.useState)(false);
  const courante = manches[manche];
  const lecture = courante.mode === 'lecture';
  const sens = lecture ? reponse === null ? null : (0, _horloge.verdictLecture)(reponse, courante.heure) : annonce;
  const juste = sens === 'juste';
  const voix = (0, _useVoixJeu.default)(matiereCode);
  const {
    dire
  } = voix;
  const laConsigne = lecture ? _repliques.repliquesHorloge.consigneLecture : _repliques.repliquesHorloge.consigneReglage(courante.heure);

  // CE QUE DIT NORA EN DÉBUT DE MANCHE : la consigne, puis, à la lecture,
  // les quatre réponses une à une — le bouton nommé s'éclaire —, et au
  // réglage, l'indice qui dit comment s'y prendre. Un CP ne lit ni les
  // réponses ni l'indice : sans la voix, ils ne lui disent rien.
  const aDire = lecture ? [laConsigne, ...courante.choix.map(_repliques.repliquesHorloge.heure)] : [laConsigne, _repliques.repliquesHorloge.indice];
  (0, _react.useEffect)(() => {
    if (!fini) dire(aDire);
    // La clé suffit : les objets sont refaits à chaque rendu, la clé non.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [laConsigne.cle, manche, graine, fini, dire]);
  (0, _react.useEffect)(() => {
    if (fini) dire(_repliques.commun.note(duPremierCoup));
  }, [fini, duPremierCoup, dire]);
  const repondre = (0, _react.useCallback)(s => {
    if (s === 'juste') dire(_repliques.commun.bravo(manche));else {
      setPropre(false);
      dire(_repliques.repliquesHorloge.erreur(s));
    }
  }, [manche, dire]);
  const lire = (0, _react.useCallback)(heure => {
    if (juste) return;
    setReponse(heure);
    repondre((0, _horloge.verdictLecture)(heure, courante.heure));
  }, [juste, courante.heure, repondre]);
  const poser = (0, _react.useCallback)(nombre => {
    if (juste || !choisie) return;
    setAnnonce(null);
    setAiguilles(a => ({
      ...a,
      [choisie]: nombre
    }));
  }, [juste, choisie]);
  const annoncer = (0, _react.useCallback)(() => {
    const s = (0, _horloge.verdictReglage)(aiguilles, courante.heure);
    setAnnonce(s);
    repondre(s);
  }, [aiguilles, courante.heure, repondre]);
  const suivante = (0, _react.useCallback)(() => {
    var _manches$depart;
    if (propre) setDuPremierCoup(n => n + 1);
    if (manche + 1 >= _horloge.MANCHES) {
      setFini(true);
      return;
    }
    setManche(manche + 1);
    setReponse(null);
    setAiguilles((_manches$depart = manches[manche + 1].depart) !== null && _manches$depart !== void 0 ? _manches$depart : null);
    setChoisie(null);
    setAnnonce(null);
    setPropre(true);
  }, [manche, manches, propre]);
  const rejouer = (0, _react.useCallback)(() => {
    var _serie$0$depart;
    const g = Date.now();
    setGraine(g);
    setManche(0);
    setReponse(null);
    setAiguilles((_serie$0$depart = (0, _horloge.serie)(g, _horloge.MANCHES, niveau)[0].depart) !== null && _serie$0$depart !== void 0 ? _serie$0$depart : null);
    setChoisie(null);
    setAnnonce(null);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
  }, [niveau]);
  if (fini) {
    return /*#__PURE__*/React.createElement("div", {
      className: "jeu jeu--fini",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 144,
        columnNumber: 7
      }
    }, /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-score",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 145,
        columnNumber: 9
      }
    }, duPremierCoup, " ", /*#__PURE__*/React.createElement("span", {
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 146,
        columnNumber: 27
      }
    }, "sur ", _horloge.MANCHES)), /*#__PURE__*/React.createElement("p", {
      className: "jeu__bilan-mot",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 148,
        columnNumber: 9
      }
    }, (0, _horloge.bilan)(duPremierCoup)), /*#__PURE__*/React.createElement("div", {
      className: "jeu__actions",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 150,
        columnNumber: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn--principal",
      onClick: rejouer,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 151,
        columnNumber: 11
      }
    }, "Rejouer"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn-ghost",
      onClick: onQuitter,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 154,
        columnNumber: 11
      }
    }, "Revenir aux jeux")));
  }

  // Ce que montre le cadran. À la lecture, la petite est sur l'heure — ou
  // entre deux nombres à la demie ; au réglage CE1, elle suit la grande.
  let montre = aiguilles;
  if (lecture) montre = {
    petite: courante.heure,
    grande: (0, _horloge.estDemie)(courante.heure) ? 6 : 12
  };else if (ce1) montre = {
    ...aiguilles,
    petite: aiguilles.petite + aiguilles.grande % 12 / 12
  };
  const bouge = !lecture && (aiguilles.petite !== courante.depart.petite || aiguilles.grande !== courante.depart.grande);
  return /*#__PURE__*/React.createElement("div", {
    className: "jeu jeu--horloge",
    style: {
      backgroundImage: `url(${decor})`
    },
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 171,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "jeu__quitter",
    onClick: onQuitter,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 172,
      columnNumber: 7
    }
  }, "\u2190 Revenir aux jeux"), /*#__PURE__*/React.createElement("ol", {
    className: "jeu__manches",
    "aria-label": `Manche ${manche + 1} sur ${_horloge.MANCHES}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 176,
      columnNumber: 7
    }
  }, manches.map((m, i) => /*#__PURE__*/React.createElement("li", {
    key: `${m.heure}-${i}`,
    className: `jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 178,
      columnNumber: 11
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "jeu__consigne",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 185,
      columnNumber: 7
    }
  }, laConsigne.texte, /*#__PURE__*/React.createElement(_BoutonsVoix.default, {
    voix: voix,
    consigne: aDire,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 187,
      columnNumber: 9
    }
  })), /*#__PURE__*/React.createElement(Cadran, {
    aiguilles: montre,
    choisie: lecture ? null : choisie,
    onPoser: lecture || juste ? null : poser,
    heureDite: lecture ? null : courante.heure,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 190,
      columnNumber: 7
    }
  }), !lecture && !juste && /*#__PURE__*/React.createElement("div", {
    className: "horloge__outils",
    role: "group",
    "aria-label": "Choisis une aiguille",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 198,
      columnNumber: 9
    }
  }, ['petite', 'grande'].map(a => /*#__PURE__*/React.createElement("button", {
    key: a,
    type: "button",
    className: `horloge__outil horloge__outil--${a}`,
    "aria-pressed": choisie === a,
    onClick: () => setChoisie(a),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 200,
      columnNumber: 13
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 40 16",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 207,
      columnNumber: 15
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: a === 'petite' ? 4 : 6,
    width: a === 'petite' ? 24 : 36,
    height: a === 'petite' ? 8 : 4,
    rx: "3",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 208,
      columnNumber: 17
    }
  })), a === 'petite' ? 'Petite aiguille' : 'Grande aiguille'))), !lecture && !juste && !choisie && /*#__PURE__*/React.createElement("p", {
    className: "horloge__indice",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 217,
      columnNumber: 9
    }
  }, _horloge.PHRASES.indice), lecture && !juste && /*#__PURE__*/React.createElement("div", {
    className: "horloge__reponses",
    role: "group",
    "aria-label": "Choisis l\u2019heure",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 221,
      columnNumber: 9
    }
  }, courante.choix.map(h => /*#__PURE__*/React.createElement("button", {
    key: h,
    type: "button",
    className: `horloge__reponse${reponse === h ? ' est-refusee' : ''}${voix.enCours === _repliques.repliquesHorloge.heure(h).cle ? ' est-lue' : ''}`,
    onClick: () => lire(h),
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 223,
      columnNumber: 13
    }
  }, (0, _horloge.ecrire)(h)))), sens && !juste && /*#__PURE__*/React.createElement("p", {
    className: "jeu__trop",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 235,
      columnNumber: 26
    }
  }, _horloge.PHRASES[CLE_PHRASE[sens]]), juste ? /*#__PURE__*/React.createElement("div", {
    className: "jeu__gagne",
    role: "status",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 238,
      columnNumber: 9
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "jeu__gagne-calcul",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 239,
      columnNumber: 11
    }
  }, (0, _horloge.ecrire)(courante.heure)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: suivante,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 240,
      columnNumber: 11
    }
  }, "Continuer")) : !lecture && bouge && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn--principal",
    onClick: annoncer,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 245,
      columnNumber: 9
    }
  }, "C\u2019est pr\xEAt\xA0!"));
}

/** Le verdict, vers la phrase qui le dit. */
const CLE_PHRASE = {
  aiguilles: 'aiguilles',
  'plus-tard': 'plusTard',
  'plus-tot': 'plusTot',
  inversees: 'inversees',
  grande: 'grande',
  petite: 'petite',
  demie: 'demie',
  entre: 'entre',
  pleine: 'pleine',
  'grande-demie': 'grandeDemie'
};

/**
 * LE CADRAN : douze nombres, deux aiguilles. Au réglage, chaque nombre est un
 * bouton — posé en HTML par-dessus le dessin, pour qu'il soit une vraie cible
 * au clavier et au lecteur d'écran.
 */
function Cadran({
  aiguilles,
  choisie,
  onPoser,
  heureDite
}) {
  const nombres = Array.from({
    length: 12
  }, (_, i) => i + 1);
  const position = (n, rayon) => {
    const a = n / 12 * 2 * Math.PI;
    return {
      x: 100 + rayon * Math.sin(a),
      y: 100 - rayon * Math.cos(a)
    };
  };
  const angle = n => n % 12 * 30;
  const libelle = heureDite ? `Horloge : la petite aiguille est sur le ${Math.floor(aiguilles.petite)}, la grande sur le ${aiguilles.grande}` : 'Horloge';
  return /*#__PURE__*/React.createElement("div", {
    className: "cadran",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 288,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 200",
    role: "img",
    "aria-label": libelle,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 289,
      columnNumber: 7
    }
  }, /*#__PURE__*/React.createElement("circle", {
    className: "cadran__fond",
    cx: "100",
    cy: "100",
    r: "96",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 290,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "cadran__bord",
    cx: "100",
    cy: "100",
    r: "96",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 291,
      columnNumber: 9
    }
  }), Array.from({
    length: 60
  }, (_, i) => {
    const a = i / 60 * 2 * Math.PI;
    const long = i % 5 === 0;
    const r1 = long ? 86 : 89;
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      className: long ? 'cadran__trait cadran__trait--heure' : 'cadran__trait',
      x1: 100 + r1 * Math.sin(a),
      y1: 100 - r1 * Math.cos(a),
      x2: 100 + 92 * Math.sin(a),
      y2: 100 - 92 * Math.cos(a),
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 297,
        columnNumber: 13
      }
    });
  }), !onPoser && nombres.map(n => {
    const p = position(n, 72);
    return /*#__PURE__*/React.createElement("text", {
      key: n,
      className: "cadran__nombre",
      x: p.x,
      y: p.y,
      textAnchor: "middle",
      dominantBaseline: "central",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 310,
        columnNumber: 13
      }
    }, n);
  }), /*#__PURE__*/React.createElement("line", {
    className: `cadran__aiguille cadran__aiguille--grande${choisie === 'grande' ? ' est-choisie' : ''}`,
    x1: "100",
    y1: "100",
    x2: "100",
    y2: "42",
    transform: `rotate(${angle(aiguilles.grande)} 100 100)`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 316,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("line", {
    className: `cadran__aiguille cadran__aiguille--petite${choisie === 'petite' ? ' est-choisie' : ''}`,
    x1: "100",
    y1: "100",
    x2: "100",
    y2: "62",
    transform: `rotate(${angle(aiguilles.petite)} 100 100)`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 321,
      columnNumber: 9
    }
  }), /*#__PURE__*/React.createElement("circle", {
    className: "cadran__axe",
    cx: "100",
    cy: "100",
    r: "7",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 326,
      columnNumber: 9
    }
  })), onPoser && nombres.map(n => {
    const p = position(n, 72);
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      type: "button",
      className: "cadran__cible",
      style: {
        left: `${p.x / 2}%`,
        top: `${p.y / 2}%`
      },
      onClick: () => onPoser(n),
      "aria-label": `Le ${n}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 332,
        columnNumber: 11
      }
    }, n);
  }));
}