const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.sansRetenue = sansRetenue;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES OPÉRATIONS POSÉES DU CM2 — la course des tables au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_CALC_ADD_SOUS — « Poser une addition et une soustraction »
 *   MATH_CM2_CALC_MULT     — « Poser une multiplication »
 *   MATH_CM2_CALC_DIV      — « Poser une division euclidienne »
 *
 * UN JEU À CHOIX NE FAIT PAS POSER : il fait reconnaître le bon résultat
 * parmi ceux que donnent les fautes classiques de l'opération posée.
 *   - LA SOUSTRACTION (3) : 523 − 187. LE PIÈGE : dans chaque colonne, le
 *     petit chiffre ôté du grand, sans retenue (464) ;
 *   - LA MULTIPLICATION (3) : 34 × 26. LE PIÈGE : le décalage oublié sur la
 *     deuxième ligne (34 × 6 + 34 × 2) ;
 *   - LA DIVISION (2) : 157 divisé par 12, quotient et reste. LE PIÈGE : un
 *     reste plus grand que le diviseur.
 */

const MANCHES = exports.MANCHES = 8;

/** 523 − 187 « sans retenue » : chaque colonne, le grand chiffre moins le petit. */
function sansRetenue(a, b) {
  const x = String(a);
  const y = String(b).padStart(x.length, '0');
  return Number([...x].map((c, i) => Math.abs(Number(c) - Number(y[i]))).join(''));
}
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  while (liste.length < 3) {
    const a = entre(300, 999);
    const b = entre(101, a - 50);
    const bonne = a - b;
    const faux = sansRetenue(a, b);
    if (faux !== bonne) {
      liste.push({
        consigne: 'soustraction',
        question: `${a} − ${b} = ?`,
        bonne,
        choix: melanger((0, _outils.troisChoix)(bonne, [faux], k => bonne + (k % 2 ? 10 * k : -10 * k))).map(c => ({
          cle: c,
          libelle: String(c)
        })),
        pieges: {
          [faux]: 'soustraction-retenue'
        }
      });
    }
  }
  for (let i = 0; i < 3; i += 1) {
    const a = entre(23, 89);
    const b = entre(13, 49);
    const bonne = a * b;
    const decalage = a * (b % 10) + a * Math.floor(b / 10);
    const unite = a * (b % 10);
    liste.push({
      consigne: 'multiplication',
      question: `${a} × ${b} = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [decalage, unite], k => bonne + 10 * k)).map(c => ({
        cle: c,
        libelle: String(c)
      })),
      pieges: {
        [decalage]: 'multiplication-decalage',
        [unite]: 'multiplication-ligne'
      }
    });
  }
  for (let i = 0; i < 2; i += 1) {
    const d = entre(6, 15);
    const q = entre(11, 29);
    const r = entre(1, d - 1);
    const n = d * q + r;
    const bonne = `${q} reste ${r}`;
    const grand = `${q - 1} reste ${r + d}`;
    const autre = `${q + 1} reste ${Math.max(0, r - 1)}`;
    liste.push({
      consigne: 'division',
      question: `${n} divisé par ${d}`,
      bonne,
      choix: melanger([bonne, grand, autre]).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [grand]: 'division-reste',
        [autre]: 'division-regle'
      }
    });
  }
  return melanger(liste);
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (String(cle) === String(m.bonne)) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  soustraction: 'Pose la soustraction dans ta tête, ou sur ton cahier : quel est le bon résultat ?',
  multiplication: 'Pose la multiplication : quel est le bon résultat ?',
  division: 'Pose la division : quel est le quotient, et quel est le reste ?',
  'soustraction-retenue': 'Quand le chiffre du haut est trop petit, on ne retourne pas la soustraction : on prend une dizaine au voisin, c’est la retenue.',
  'soustraction-regle': 'Colonne par colonne, en partant des unités, sans oublier les retenues.',
  'multiplication-decalage': 'La deuxième ligne multiplie par les dizaines : on la décale d’un rang, avec un zéro au bout.',
  'multiplication-ligne': 'Tu n’as fait qu’une ligne. Multiplie aussi par le chiffre des dizaines, puis ajoute les deux lignes.',
  'multiplication-regle': 'Une ligne pour les unités, une ligne décalée pour les dizaines, puis on ajoute.',
  'division-reste': 'Le reste doit toujours être plus petit que le diviseur : sinon, on peut encore en mettre une fois de plus.',
  'division-regle': 'Vérifie : le diviseur fois le quotient, plus le reste, doit redonner le nombre de départ.'
};