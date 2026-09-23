const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LE CALCUL MENTAL DU CM1 — la course des tables au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_CALC_MENTAL — « Calculer mentalement sur les nombres entiers »
 *
 * AU CM1, ON NE RÉCITE PLUS, ON S'Y PREND BIEN. Cinq multiplications qui ont
 * chacune leur ruse :
 *   × 9  = × 10, moins une fois le nombre ;
 *   × 11 = × 10, plus une fois le nombre ;
 *   × 20 = × 2, puis × 10 ;
 *   × 25 = le quart de × 100 ;
 *   × 50 = la moitié de × 100.
 * LES PIÈGES SONT LES RUSES À MOITIÉ FAITES : × 10 sans le retrait (ou sans
 * l'ajout), × 100 sans la moitié. L'erreur rappelle la ruse — la phrase dite
 * ne porte jamais le calcul du jour, elle vaut pour toutes les manches.
 */

const MANCHES = exports.MANCHES = 10;
const RUSES = [9, 11, 20, 25, 50];
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const facteurs = melanger([...RUSES, ...RUSES]);
  return facteurs.map(f => {
    // × 25 et × 50 : des nombres qui se partagent bien.
    const n = f === 25 ? 4 * entre(2, 12) + entre(0, 1) * 2 : f === 50 ? 2 * entre(6, 24) : entre(12, 48);
    const bonne = n * f;
    const pieges = {
      9: [n * 10, n * 10 - 9],
      11: [n * 10, n * 10 + 11],
      20: [n * 2, n * 200],
      25: [n * 100, n * 100 / 2],
      50: [n * 100, n * 5]
    }[f];
    const noms = {
      9: ['fois9-oubli', 'fois9-neuf'],
      11: ['fois11-oubli', 'fois11-onze'],
      20: ['fois20-dix', 'fois20-cent'],
      25: ['fois25-quart', 'fois25-moitie'],
      50: ['fois50-moitie', 'fois50-dix']
    }[f];
    const choix = (0, _outils.troisChoix)(bonne, pieges, k => bonne + k * f);
    return {
      consigne: 'calcul',
      facteur: f,
      question: `${n} × ${f} = ?`,
      bonne,
      choix: melanger(choix).map(c => ({
        cle: c,
        libelle: String(c)
      })),
      pieges: {
        [pieges[0]]: noms[0],
        [pieges[1]]: noms[1]
      }
    };
  });
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (Number(cle) === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `fois${m.facteur}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  calcul: 'Calcule de tête, avec une ruse.',
  fois9: 'Fois neuf, c’est fois dix, moins une fois le nombre.',
  'fois9-oubli': 'Tu as fait fois dix. Il reste à retirer une fois le nombre.',
  'fois9-neuf': 'Après fois dix, on retire le nombre lui-même, pas neuf.',
  fois11: 'Fois onze, c’est fois dix, plus une fois le nombre.',
  'fois11-oubli': 'Tu as fait fois dix. Il reste à ajouter une fois le nombre.',
  'fois11-onze': 'Après fois dix, on ajoute le nombre lui-même, pas onze.',
  fois20: 'Fois vingt, c’est le double, puis fois dix.',
  'fois20-dix': 'Tu as fait le double. Il reste à multiplier par dix.',
  'fois20-cent': 'Le double, puis fois dix : pas fois cent.',
  fois25: 'Fois vingt-cinq, c’est fois cent, puis le quart.',
  'fois25-quart': 'Tu as fait fois cent. Il reste à prendre le quart.',
  'fois25-moitie': 'La moitié, ce serait fois cinquante. Pour vingt-cinq, on prend le quart.',
  fois50: 'Fois cinquante, c’est fois cent, puis la moitié.',
  'fois50-moitie': 'Tu as fait fois cent. Il reste à prendre la moitié.',
  'fois50-dix': 'Fois cent, puis la moitié : pas fois dix.'
};