const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
var _fractionsCM = require("./fractionsCM1.js");
/**
 * LES FRACTIONS DU CM2 — les parts de pizza au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_FRAC_INTRO     — « Comprendre le sens d'une fraction simple »
 *   MATH_CM2_FRAC_DECIMALES — « Utiliser les fractions décimales »
 *
 * TROIS SORTES DE MANCHES :
 *   - DE LA VIRGULE À LA FRACTION (3) : 0,35 = 35/100. Pièges : 35/10 (un
 *     zéro de moins) et 3/5 (les chiffres pris pour une fraction) ;
 *   - DIXIÈMES ET CENTIÈMES ENSEMBLE (3) : 3/10 + 4/100 = 0,34. LE PIÈGE :
 *     ajouter les numérateurs comme s'ils avaient le même dénominateur (0,07) ;
 *   - LA PLUS GRANDE PART (2) : 1/3 ou 1/5 ? LE PIÈGE : le plus grand
 *     dénominateur. Plus on partage, plus les parts sont petites.
 */

const MANCHES = exports.MANCHES = 8;
const net = x => Math.round(x * 1000) / 1000;
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  const vus = new Set();
  while (liste.length < 3) {
    const n = entre(12, 98);
    if (n % 10 !== 0 && !vus.has(n)) {
      vus.add(n);
      const bonne = `${n}/100`;
      const dix = `${n}/10`;
      const chiffres = `${Math.floor(n / 10)}/${n % 10}`;
      liste.push({
        consigne: 'vers-fraction',
        question: `${(0, _fractionsCM.virgule)(n / 100)} = ?`,
        bonne,
        choix: melanger([bonne, dix, chiffres]).map(c => ({
          cle: c,
          libelle: c
        })),
        pieges: {
          [dix]: 'fraction-zero',
          [chiffres]: 'fraction-chiffres'
        }
      });
    }
  }
  for (let i = 0; i < 3; i += 1) {
    const d = entre(1, 9);
    const c = entre(1, 9);
    const bonne = (0, _fractionsCM.virgule)(net(d / 10 + c / 100));
    const memes = (0, _fractionsCM.virgule)(net((d + c) / 100));
    const colles = (0, _fractionsCM.virgule)(net((d + c) / 10));
    liste.push({
      consigne: 'somme',
      question: `${d}/10 + ${c}/100 = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [memes, colles], k => (0, _fractionsCM.virgule)(net(d / 10 + c / 100 + k / 10)))).map(x => ({
        cle: x,
        libelle: x
      })),
      pieges: {
        [memes]: 'somme-rang',
        [colles]: 'somme-rang'
      }
    });
  }
  const denominateurs = melanger([2, 3, 4, 5, 6, 8, 10]);
  for (let i = 0; i < 2; i += 1) {
    const [a, b] = [denominateurs[2 * i], denominateurs[2 * i + 1]];
    const petit = Math.min(a, b);
    const grand = Math.max(a, b);
    liste.push({
      consigne: 'plus-grande-part',
      question: `1/${a}   ou   1/${b} ?`,
      bonne: `1/${petit}`,
      choix: melanger([`1/${a}`, `1/${b}`]).map(x => ({
        cle: x,
        libelle: x
      })),
      pieges: {
        [`1/${grand}`]: 'part-denominateur'
      }
    });
  }
  return melanger(liste);
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (cle === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  'vers-fraction': 'Écris ce nombre à virgule comme une fraction décimale.',
  somme: 'Combien font ces dixièmes et ces centièmes ensemble ?',
  'plus-grande-part': 'Laquelle de ces deux parts est la plus grande ?',
  'fraction-zero': 'Deux chiffres après la virgule, ce sont des centièmes : on écrit sur cent.',
  'fraction-chiffres': 'Les chiffres ne se séparent pas : tout le nombre après la virgule va en haut, et en bas, dix ou cent.',
  'vers-fraction-regle': 'Un chiffre après la virgule, sur dix ; deux chiffres, sur cent.',
  'somme-rang': 'Les dixièmes et les centièmes ne s’ajoutent pas entre eux : les dixièmes vont au premier rang après la virgule, les centièmes au deuxième.',
  'somme-regle': 'Écris les dixièmes au premier rang après la virgule, et les centièmes au deuxième.',
  'part-denominateur': 'Plus on partage en parts nombreuses, plus chaque part est petite : un tiers est plus grand qu’un cinquième.'
};