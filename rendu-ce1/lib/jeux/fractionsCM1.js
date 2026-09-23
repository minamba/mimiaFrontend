const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
exports.virgule = void 0;
var _outils = require("./outils.js");
/**
 * LES FRACTIONS DU CM1 — les parts de pizza au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_FRAC_SENS      — « Comprendre et écrire une fraction simple »
 *   MATH_CM1_FRAC_SUP_UN    — « Écrire une fraction supérieure à 1 comme un
 *                             entier et une fraction »
 *   MATH_CM1_FRAC_OPERATEUR — « Calculer une fraction d’une quantité »
 *   MATH_CM1_DEC_FRACTIONS  — « Passer d’une fraction décimale à une écriture à
 *                             virgule »
 *
 * TROIS SORTES DE MANCHES :
 *   - DÉCOMPOSER (3) : 7/4 = 1 + 3/4. Piège : 7/4 = 7 + 4, ou 1 + 4/3.
 *   - PRENDRE UNE FRACTION D'UNE QUANTITÉ (3) : les 3/4 de 12 bonbons = 9.
 *     Pièges : 12 ÷ 4 = 3 (on s'arrête en route), 12 − 3.
 *   - ÉCRIRE À VIRGULE (2) : 7/10 = 0,7 ; 35/100 = 0,35. Pièges : 7,10 et le
 *     zéro mal placé (0,07).
 */

const MANCHES = exports.MANCHES = 8;

/** « 0,35 » : une écriture à virgule, à la française. */
const virgule = x => String(x).replace('.', ',');
exports.virgule = virgule;
function serie(graine = Date.now()) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];

  // Décomposer : n/d = e + r/d.
  for (let i = 0; i < 3; i += 1) {
    const d = au([2, 3, 4, 5, 6]);
    const e = entre(1, 3);
    const r = entre(1, d - 1);
    const n = e * d + r;
    const bonne = `${e} + ${r}/${d}`;
    liste.push({
      consigne: 'decomposer',
      question: `${n}/${d} = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [`${n} + ${d}`, `${e} + ${d}/${r}`], k => `${e + k} + ${r}/${d}`)).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [`${n} + ${d}`]: 'decomposer-somme',
        [`${e} + ${d}/${r}`]: 'decomposer-envers'
      }
    });
  }

  // Une fraction d'une quantité : les a/d de q.
  for (let i = 0; i < 3; i += 1) {
    // Jamais « les 1/2 de… » : au moins deux parts à prendre.
    const d = au([3, 4, 5]);
    const a = entre(2, d - 1);
    const part = entre(2, 6);
    const q = d * part;
    const bonne = a * part;
    liste.push({
      consigne: 'operateur',
      question: `Les ${a}/${d} de ${q} bonbons = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [part, q - a], k => bonne + k)).map(c => ({
        cle: c,
        libelle: String(c)
      })),
      pieges: {
        [part]: 'operateur-partie',
        [q - a]: 'operateur-moins'
      }
    });
  }

  // Écrire à virgule : des dixièmes, puis des centièmes.
  const dixiemes = entre(1, 9);
  const centiemes = entre(11, 99);
  [[dixiemes, 10], [centiemes, 100]].forEach(([n, d]) => {
    const bonne = virgule(n / d);
    const faux = d === 10 ? virgule(n / 100) : virgule(n / 1000);
    liste.push({
      consigne: 'virgule',
      question: `${n}/${d} = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [`${n},${d}`, faux], k => virgule(n / d + k))).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [`${n},${d}`]: 'virgule-colle',
        [faux]: 'virgule-zero'
      }
    });
  });
  return liste;
}

/** Juste, ou le piège nommé ; à défaut, la règle de la sorte de manche. */
function verdict(m, cle) {
  var _m$pieges$cle;
  if (String(cle) === String(m.bonne)) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  decomposer: 'Écris cette fraction comme un nombre entier et une fraction.',
  operateur: 'Calcule cette fraction de la quantité.',
  virgule: 'Écris cette fraction avec une virgule.',
  'decomposer-somme': 'On n’ajoute pas le haut et le bas : cherche combien de fois le bas tient dans le haut.',
  'decomposer-envers': 'La fraction qui reste garde le même nombre en bas.',
  'decomposer-regle': 'Combien d’entiers entiers, puis combien de parts qui restent ?',
  'operateur-partie': 'Tu as trouvé une seule part. Prends-en autant qu’en dit le nombre du haut.',
  'operateur-moins': 'On ne soustrait pas : partage d’abord, puis prends le bon nombre de parts.',
  'operateur-regle': 'Partage la quantité en parts égales, puis prends le bon nombre de parts.',
  'virgule-colle': 'On ne recopie pas la fraction : dix, c’est un chiffre après la virgule, cent, deux chiffres.',
  'virgule-zero': 'Compte les zéros du nombre du bas : autant de chiffres après la virgule.',
  'virgule-regle': 'Sur dix, un chiffre après la virgule ; sur cent, deux chiffres.'
};