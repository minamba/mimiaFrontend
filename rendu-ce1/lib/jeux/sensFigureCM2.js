const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = exports.EXPRESSIONS = exports.EMPLOIS = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * SENS PROPRE, SENS FIGURÉ — comme une image au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_SENS — « Distinguer sens propre et sens figuré, et les
 *                       niveaux de langue »
 *
 * DEUX SORTES DE MANCHES :
 *   - PROPRE OU FIGURÉ ? (4) : « la bague est en or » (propre), « elle a un
 *     cœur d'or » (figuré) ;
 *   - L'EXPRESSION (4) : « avoir un poil dans la main » veut dire être
 *     paresseux. LE PIÈGE, comme au CM1 : le prendre au pied de la lettre.
 * Les niveaux de langue sont au jeu « Contraires et jumeaux » du CM2.
 */

const MANCHES = exports.MANCHES = 8;

/** [phrase, mot, propre ou figuré]. */
const EMPLOIS = exports.EMPLOIS = [['La bague est en or.', 'or', 'propre'], ['Elle a un cœur d’or.', 'or', 'figure'], ['La corde du puits est solide.', 'corde', 'propre'], ['Il pleut des cordes.', 'cordes', 'figure'], ['Le feu de camp brûle toute la nuit.', 'brûle', 'propre'], ['Il brûle d’impatience.', 'brûle', 'figure'], ['La mule porte de lourds sacs.', 'mule', 'propre'], ['Tu es une vraie tête de mule !', 'mule', 'figure'], ['Le lac est gelé en hiver.', 'gelé', 'propre'], ['Le public est resté de glace.', 'glace', 'figure']];

/** [expression, son sens, au pied de la lettre, un contresens]. */
const EXPRESSIONS = exports.EXPRESSIONS = [['Avoir un poil dans la main', 'Être paresseux', 'Avoir des poils sur les mains', 'Être très fort'], ['Tomber dans les pommes', 'S’évanouir', 'Tomber dans un panier de pommes', 'Aimer beaucoup les fruits'], ['Coûter les yeux de la tête', 'Coûter très cher', 'Faire mal aux yeux', 'Ne rien coûter'], ['Avoir la tête dans les nuages', 'Être distrait', 'Être très grand', 'Être très attentif'], ['Mettre la main à la pâte', 'Aider, participer', 'Faire un gâteau', 'Refuser de travailler'], ['Avoir le cœur sur la main', 'Être généreux', 'Avoir mal au cœur', 'Être avare'], ['Donner sa langue au chat', 'Renoncer à trouver', 'Nourrir son chat', 'Trouver la réponse']];
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  const emplois = [...melanger(EMPLOIS.filter(([,, s]) => s === 'propre')).slice(0, 2), ...melanger(EMPLOIS.filter(([,, s]) => s === 'figure')).slice(0, 2)].map(([phrase, mot, sens]) => ({
    consigne: 'emploi',
    question: `« ${phrase} » Le mot « ${mot} » est employé…`,
    bonne: sens,
    choix: [{
      cle: 'propre',
      libelle: 'au sens propre'
    }, {
      cle: 'figure',
      libelle: 'au sens figuré'
    }]
  }));
  const expressions = melanger(EXPRESSIONS).slice(0, 4).map(([question, bonne, lettre, contresens]) => ({
    consigne: 'expression',
    question: `« ${question} »`,
    bonne,
    choix: melanger([bonne, lettre, contresens]).map(c => ({
      cle: c,
      libelle: c
    })),
    pieges: {
      [lettre]: 'expression-lettre',
      [contresens]: 'expression-contresens'
    }
  }));
  return melanger([...emplois, ...expressions]);
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'emploi') return `emploi-${m.bonne}`;
  return m.pieges[cle];
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  emploi: 'Ce mot est-il employé au sens propre, ou au sens figuré ?',
  expression: 'Que veut dire cette expression ?',
  'emploi-propre': 'Ici, le mot désigne vraiment la chose : c’est son sens propre, le premier.',
  'emploi-figure': 'Ici, le mot ne désigne pas vraiment la chose : c’est une image. C’est le sens figuré.',
  'expression-lettre': 'Une expression ne se prend pas au pied de la lettre : elle dit autre chose, par une image.',
  'expression-contresens': 'C’est presque le contraire. Imagine la scène : qu’est-ce que l’image veut montrer ?'
};