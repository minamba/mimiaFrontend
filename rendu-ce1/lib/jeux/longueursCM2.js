const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verdict = exports.serie = exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
var _mesuresCM = require("./mesuresCM1.js");
var _outils = require("./outils.js");
/**
 * LES LONGUEURS DU CM2 — le mètre ruban au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_MES_LONGUEUR — « Utiliser les unités de longueur »
 *
 * LA MÊME MÉCANIQUE QUE LES MASSES DU CM1 (`mesuresCM1.js`), sur toute la
 * table des longueurs, du kilomètre au millimètre. Les pièges sont les mêmes :
 * un zéro de trop ou de moins, et le mauvais sens.
 */

const MANCHES = exports.MANCHES = 8;

/** [grande unité, petite unité, combien de petites dans une grande]. */
const GRANDES = [['km', 'm', 1000], ['km', 'hm', 10], ['hm', 'm', 100], ['dam', 'm', 10]];
const PETITES = [['m', 'cm', 100], ['m', 'mm', 1000], ['cm', 'mm', 10], ['m', 'dm', 10], ['dm', 'cm', 10]];
const serie = (graine = Date.now()) => (0, _mesuresCM.serieDe)(graine, [GRANDES, PETITES]);
exports.serie = serie;
const verdict = exports.verdict = _mesuresCM.verdict;
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = _mesuresCM.PHRASES;