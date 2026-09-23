const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.SITUATIONS = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES PROBABILITÉS DU CM2 — le sac de billes au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_PROBA_COMPARER — « Comparer la probabilité de deux événements »
 *   MATH_CM2_PROBA_EQUI     — « Reconnaître une situation d’équiprobabilité »
 *
 * DEUX SORTES DE MANCHES :
 *   - DEUX SACS (4) : dans lequel a-t-on le plus de chances de tirer une
 *     rouge ? LE PIÈGE DU CM2 : choisir le sac qui a le plus de rouges, sans
 *     regarder combien il a de billes en tout. Parfois, c'est autant ;
 *   - AUTANT DE CHANCES ? (4) : un dé, une pièce, une roue, un sac. Chaque
 *     issue a-t-elle la même chance ?
 * `SacDeBilles.js` dessine les deux sacs.
 */

const MANCHES = exports.MANCHES = 8;

/** [situation, première issue, seconde issue, la bonne : 'a', 'b' ou 'autant']. */
const SITUATIONS = exports.SITUATIONS = [['On lance un dé à six faces.', 'Faire 6', 'Faire 2', 'autant'], ['On lance une pièce.', 'Pile', 'Face', 'autant'], ['Une roue a 4 cases rouges et 1 case bleue.', 'Tomber sur rouge', 'Tomber sur bleu', 'a'], ['Un sac contient 5 billes rouges et 5 billes vertes.', 'Tirer une rouge', 'Tirer une verte', 'autant'], ['Un sac contient 2 billes rouges et 6 billes vertes.', 'Tirer une rouge', 'Tirer une verte', 'b'], ['On lance un dé à six faces.', 'Faire un nombre pair', 'Faire 6', 'a'], ['Une roue a 3 cases jaunes et 3 cases bleues.', 'Tomber sur jaune', 'Tomber sur bleu', 'autant'], ['On tire une carte parmi 10 cartes numérotées de 1 à 10.', 'Tirer le 1', 'Tirer le 10', 'autant']];
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  const cas = melanger(['a', 'b', 'autant', 'autant'].concat(entre(0, 1) ? ['a'] : ['b'])).slice(0, 4);
  cas.forEach(bonne => {
    // Le meilleur sac a MOINS de rouges ; à égalité, le grand sac en a plus.
    const [pr, pt] = bonne === 'autant' ? [1, 2] : [entre(2, 3), 4];
    const petitRouges = pr;
    const petitTotal = pt;
    const f = entre(2, 3);
    const grandTotal = petitTotal * f;
    const grandRouges = bonne === 'autant' ? petitRouges * f : petitRouges + 1;
    const [sacA, sacB] = bonne === 'b' ? [[grandRouges, grandTotal], [petitRouges, petitTotal]] : [[petitRouges, petitTotal], [grandRouges, grandTotal]];
    const sac = ([r, t]) => ({
      rouge: r,
      bleue: t - r
    });
    const plusDeRouges = sacA[0] > sacB[0] ? 'a' : 'b';
    liste.push({
      consigne: 'deux-sacs',
      sacs: {
        a: sac(sacA),
        b: sac(sacB)
      },
      question: 'Dans quel sac a-t-on le plus de chances de tirer une bille rouge ?',
      bonne,
      choix: [{
        cle: 'a',
        libelle: 'Le sac A'
      }, {
        cle: 'b',
        libelle: 'Le sac B'
      }, {
        cle: 'autant',
        libelle: 'Autant de chances'
      }],
      pieges: {
        [plusDeRouges]: 'sacs-nombre'
      }
    });
  });
  melanger(SITUATIONS).slice(0, 4).forEach(([question, a, b, bonne]) => {
    liste.push({
      consigne: 'equi',
      question,
      bonne,
      choix: [{
        cle: 'a',
        libelle: a
      }, {
        cle: 'b',
        libelle: b
      }, {
        cle: 'autant',
        libelle: 'Autant de chances'
      }]
    });
  });
  return melanger(liste);
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'deux-sacs') return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : m.bonne === 'autant' ? 'sacs-autant' : 'sacs-regle';
  return m.bonne === 'autant' ? 'equi-autant' : 'equi-plus';
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  'deux-sacs': 'Deux sacs de billes. Dans lequel as-tu le plus de chances de tirer une rouge ?',
  equi: 'Qu’est-ce qui a le plus de chances d’arriver ? Ou est-ce autant ?',
  'sacs-nombre': 'Ce sac a plus de rouges, mais aussi plus de billes en tout. Compare les rouges au total de chaque sac.',
  'sacs-autant': 'Compare les rouges au total : dans les deux sacs, c’est la même part. Les chances sont les mêmes.',
  'sacs-regle': 'Pour chaque sac, combien de rouges sur combien de billes ? La plus grande part gagne.',
  'equi-autant': 'Chaque issue a exactement la même chance : c’est une situation d’équiprobabilité.',
  'equi-plus': 'Compte les cases, les faces ou les billes de chaque issue : celle qui en a le plus a plus de chances.'
};