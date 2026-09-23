const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES_A_RELIER = exports.PHRASES = exports.MANCHES = exports.FAMILLES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES MOTS DE LIAISON — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_ECR_CONNECTEURS — « Employer des connecteurs de temps et de logique »
 *
 * DEUX MORCEAUX DE PHRASE, UN MOT POUR LES RELIER. Quatre familles :
 *   - la CAUSE (car, parce que) : la raison vient après ;
 *   - la CONSÉQUENCE (donc, c’est pourquoi) : le résultat vient après ;
 *   - l'OPPOSITION (mais, pourtant) : la suite surprend ;
 *   - le TEMPS (ensuite, enfin) : ça se passe après.
 * Trois connecteurs de familles différentes sont proposés. L'erreur dit ce
 * qu'annonce le mot choisi — c'est là que l'élève voit que ça ne colle pas.
 */

const MANCHES = exports.MANCHES = 8;
const FAMILLES = exports.FAMILLES = {
  cause: ['car', 'parce que'],
  // « alors » dit aussi le temps : il rendrait deux réponses justes.
  consequence: ['donc', 'c’est pourquoi'],
  opposition: ['mais', 'pourtant'],
  temps: ['ensuite', 'enfin']
};
const familleDe = mot => Object.keys(FAMILLES).find(f => FAMILLES[f].includes(mot));

/** [phrase à trou, bon connecteur]. */
const PHRASES_A_RELIER = exports.PHRASES_A_RELIER = [['Il pleuvait très fort, ___ nous sommes restés à la maison.', 'donc'], ['Le chien aboie ___ il a entendu un bruit.', 'parce que'], ['J’ai beaucoup couru, ___ je n’ai pas gagné la course.', 'mais'], ['Mets ton manteau ___ il fait froid dehors.', 'car'], ['Il faisait nuit, ___ Léo n’avait pas peur.', 'pourtant'], ['Le réveil n’a pas sonné, ___ je suis arrivé en retard.', 'c’est pourquoi'], ['D’abord, épluche les pommes ; ___, coupe-les en morceaux.', 'ensuite'], ['Nous avons marché pendant des heures. ___, le village est apparu.', 'Enfin'], ['Elle a révisé toute la soirée, ___ elle connaît sa leçon.', 'donc'], ['Tom est tombé ___ il ne regardait pas devant lui.', 'parce que'], ['Le gâteau est beau, ___ il n’a pas de goût.', 'mais'], ['Prends ton parapluie, ___ le ciel est tout gris.', 'car']];
function serie(graine = Date.now()) {
  const {
    au,
    melanger
  } = (0, _outils.outils)(graine);
  return melanger(PHRASES_A_RELIER).slice(0, MANCHES).map(([question, bonne]) => {
    const majuscule = bonne[0] === bonne[0].toUpperCase();
    const famille = familleDe(bonne.toLowerCase());
    const autres = melanger(Object.keys(FAMILLES).filter(f => f !== famille)).slice(0, 2).map(f => au(FAMILLES[f])).map(mot => majuscule ? mot[0].toUpperCase() + mot.slice(1) : mot);
    return {
      consigne: 'relier',
      question,
      bonne,
      choix: melanger([bonne, ...autres]).map(c => ({
        cle: c,
        libelle: c
      }))
    };
  });
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return `annonce-${familleDe(cle.toLowerCase())}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  relier: 'Quel mot relie le mieux les deux morceaux de la phrase ?',
  'annonce-cause': 'Car et parce que annoncent une raison. Est-ce que la suite explique pourquoi ?',
  'annonce-consequence': 'Donc et c’est pourquoi annoncent un résultat. Est-ce que la suite est la conséquence de ce qui précède ?',
  'annonce-opposition': 'Mais et pourtant annoncent une surprise, le contraire de ce qu’on attendait. Est-ce le cas ici ?',
  'annonce-temps': 'Ensuite et enfin disent ce qui vient après, dans le temps. Est-ce le cas ici ?'
};