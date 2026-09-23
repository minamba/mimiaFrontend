const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoiteAOeufs = BoiteAOeufs;
exports.PanierDOeufs = PanierDOeufs;
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\Oeufs.js";
/**
 * LES ŒUFS DE « LA BOÎTE DE 10 » — la boîte et les paniers.
 *
 * Camara, le 21/09/2026, décor généré à l'appui : « c'est possible d'avoir ce
 * visuel ? ». Le décor est une image ; TOUT CE QUI JOUE EST DESSINÉ ICI, en
 * vectoriel. C'est la seule façon d'avoir à la fois l'ambiance de son visuel
 * et un jeu qui répond : une image de boîte à œufs ne se remplit pas.
 *
 * POURQUOI DES ŒUFS PLUTÔT QUE DES JETONS. Une boîte de dix œufs, un enfant
 * de six ans la connaît — il en a une chez lui. « Il manque des œufs » se
 * comprend sans qu'on l'explique, là où « complète la boîte » demande déjà de
 * savoir ce qu'est une boîte de dix.
 *
 * NET À TOUTES LES TAILLES, et quelques kilo-octets : le décor pèse déjà
 * 128 Ko, ce n'est pas la peine d'y ajouter dix images d'œufs.
 */

/** Un œuf : une ellipse un peu plus étroite en haut, et son reflet. */
function Oeuf({
  x,
  y,
  r = 1
}) {
  return /*#__PURE__*/React.createElement("g", {
    transform: `translate(${x} ${y}) scale(${r})`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 21,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("path", {
    className: "oeuf__coque",
    d: "M0 -17 C 9 -17 14 -7 14 1 C 14 10 7 16 0 16 C -7 16 -14 10 -14 1 C -14 -7 -9 -17 0 -17 Z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("ellipse", {
    className: "oeuf__reflet",
    cx: "-4.5",
    cy: "-7",
    rx: "3.4",
    ry: "5",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 26,
      columnNumber: 7
    }
  }));
}

/**
 * LA BOÎTE À ŒUFS : deux rangées de cinq, jamais autre chose.
 *
 * C'est cette forme-là qu'on a sous les yeux dans une cuisine, et c'est elle
 * qui permet de LIRE la quantité sans compter — cinq en haut, le reste en bas.
 *
 * `masquee` rabat le couvercle sur les alvéoles VIDES seulement : les œufs
 * déjà là restent visibles, sans quoi il n'y aurait plus de question.
 */
function BoiteAOeufs({
  cases
}) {
  const largeur = 5 * 62 + 24;
  const hauteur = 2 * 62 + 24;
  return /*#__PURE__*/React.createElement("svg", {
    className: "oeufs-boite",
    viewBox: `0 0 ${largeur} ${hauteur}`,
    role: "img",
    "aria-label": `Boîte de dix, ${cases.filter(c => c !== 'vide' && c !== 'masque').length} œufs`,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 45,
      columnNumber: 5
    }
  }, /*#__PURE__*/React.createElement("rect", {
    className: "oeufs-boite__carton",
    x: "3",
    y: "3",
    width: largeur - 6,
    height: hauteur - 6,
    rx: "16",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 51,
      columnNumber: 7
    }
  }), cases.map((etat, i) => {
    const x = 12 + i % 5 * 62 + 31;
    const y = 12 + Math.floor(i / 5) * 62 + 31;
    return /*#__PURE__*/React.createElement("g", {
      key: i,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 61,
        columnNumber: 11
      }
    }, /*#__PURE__*/React.createElement("ellipse", {
      className: `oeufs-boite__alveole est-${etat}`,
      cx: x,
      cy: y,
      rx: "26",
      ry: "27",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 62,
        columnNumber: 13
      }
    }), (etat === 'depart' || etat === 'pose') && /*#__PURE__*/React.createElement(Oeuf, {
      x: x,
      y: y,
      r: 1.45,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 64,
        columnNumber: 15
      }
    }));
  }));
}

/**
 * UN PANIER D'ŒUFS — une des quantités proposées.
 *
 * LE CHIFFRE EST ÉCRIT À CÔTÉ DES ŒUFS, et c'est une idée du visuel de
 * Camara que je reprends : relier le nombre écrit à la quantité vue, c'est
 * une compétence du programme à part entière (« lire, écrire et comparer les
 * nombres jusqu'à 100 »). L'enfant qui compte les œufs y arrive ; celui qui
 * lit déjà le chiffre va plus vite. Les deux chemins mènent à la réponse.
 */
function PanierDOeufs({
  nombre
}) {
  // Les œufs se rangent en deux rangs dans le panier, comme ils tiendraient
  // vraiment : alignés, ils déborderaient au-delà de cinq.
  const haut = Math.ceil(nombre / 2);
  const bas = nombre - haut;
  const rang = (combien, y) => Array.from({
    length: combien
  }, (_, i) => /*#__PURE__*/React.createElement(Oeuf, {
    key: `${y}-${i}`,
    x: 30 + (i - (combien - 1) / 2) * 17,
    y: y,
    r: 0.62,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 89,
      columnNumber: 5
    }
  }));
  return /*#__PURE__*/React.createElement("svg", {
    className: "panier",
    viewBox: "0 0 60 56",
    "aria-hidden": "true",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 93,
      columnNumber: 5
    }
  }, rang(haut, 22), rang(bas, 30), /*#__PURE__*/React.createElement("path", {
    className: "panier__osier",
    d: "M8 28 h44 l-5 20 a4 4 0 0 1 -4 3 h-26 a4 4 0 0 1 -4 -3 Z",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 99,
      columnNumber: 7
    }
  }), /*#__PURE__*/React.createElement("path", {
    className: "panier__anse",
    d: "M8 28 h44",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 100,
      columnNumber: 7
    }
  }));
}