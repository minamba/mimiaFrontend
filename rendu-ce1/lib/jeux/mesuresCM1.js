const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serie = exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serieDe = serieDe;
exports.verdict = verdict;
var _outils = require("./outils.js");
var _fractionsCM = require("./fractionsCM1.js");
/**
 * LES MASSES ET LES CONTENANCES DU CM1 — le mètre ruban au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_MES_CONVERSION — « Convertir longueurs, masses et contenances »
 *   MATH_CM1_MES_CONTENANCE — « Utiliser les unités de contenance, du
 *                             millilitre à l’hectolitre »
 *
 * UNE CONVERSION, TROIS ÉCRITURES. La méthode est celle du tableau : chaque
 * unité vaut dix fois la suivante. LES PIÈGES EN SORTENT :
 *   - un ZÉRO de trop ou de moins (on a sauté ou oublié une colonne) ;
 *   - le MAUVAIS SENS (on a multiplié au lieu de diviser).
 */

const MANCHES = exports.MANCHES = 8;

/** [grande unité, petite unité, combien de petites dans une grande]. */
const MASSES = [['kg', 'g', 1000], ['g', 'mg', 1000], ['t', 'kg', 1000], ['kg', 'hg', 10]];
const CONTENANCES = [['L', 'cL', 100], ['L', 'mL', 1000], ['hL', 'L', 100], ['L', 'dL', 10], ['dL', 'mL', 100]];

/** Les calculs à virgule sans les bavures des flottants. */
const net = x => Math.round(x * 1000) / 1000;

/** Une série de conversions, tirées tour à tour dans chaque table (voir `longueursCM2.js`). */
function serieDe(graine, tables) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  for (let i = 0; i < MANCHES; i += 1) {
    const [grande, petite, f] = au(tables[i % tables.length]);
    const versPetite = i % 4 < 2;
    let depart;
    let bonne;
    if (versPetite) {
      // 3 kg, ou 2,5 L : un nombre entier, ou une demi-unité.
      depart = entre(0, 2) === 0 ? entre(2, 9) + 0.5 : entre(2, 9);
      bonne = net(depart * f);
    } else {
      depart = entre(2, 9) * f + (entre(0, 1) ? f / 2 : 0);
      if (!Number.isInteger(depart)) depart = entre(2, 9) * f;
      bonne = net(depart / f);
    }
    const [de, vers] = versPetite ? [grande, petite] : [petite, grande];
    const autreSens = versPetite ? net(depart / f) : net(depart * f);
    const unZero = net(bonne * 10);
    const pieges = [unZero, autreSens];
    const choix = (0, _outils.troisChoix)(bonne, pieges, k => net(bonne / 10 ** k));
    liste.push({
      consigne: versPetite ? 'vers-petite' : 'vers-grande',
      question: `${(0, _fractionsCM.virgule)(depart)} ${de} = ? ${vers}`,
      bonne,
      choix: melanger(choix).map(c => ({
        cle: c,
        libelle: `${(0, _fractionsCM.virgule)(c)} ${vers}`
      })),
      pieges: {
        [unZero]: 'zero',
        [autreSens]: 'sens'
      }
    });
  }
  return liste;
}
const serie = (graine = Date.now()) => serieDe(graine, [MASSES, CONTENANCES]);
exports.serie = serie;
function verdict(m, cle) {
  var _m$pieges$cle;
  if (Number(cle) === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : 'zero';
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  'vers-petite': 'Convertis dans la plus petite unité.',
  'vers-grande': 'Convertis dans la plus grande unité.',
  zero: 'Compte les colonnes du tableau entre les deux unités : une colonne, c’est un zéro.',
  sens: 'Vers une unité plus petite, il en faut plus ; vers une plus grande, il en faut moins.'
};