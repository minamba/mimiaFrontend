const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decouper = exports.bilan = exports.PHRASES_A_ANALYSER = exports.PHRASES = exports.MANCHES = exports.FONCTIONS = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES COMPLÉMENTS DU CM1 — où, quand, comment au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_COD_COI — « Distinguer le complément d'objet direct et indirect »
 *
 * UNE PHRASE, UN GROUPE SURLIGNÉ, TROIS FONCTIONS : COD, COI, ou complément
 * circonstanciel. Le groupe est écrit entre crochets dans la phrase ; l'écran
 * le surligne. Les trois tests :
 *   - COD : il répond à « quoi ? » ou « qui ? » juste après le verbe ;
 *   - COI : il se relie au verbe par un petit mot, « à » ou « de » ;
 *   - CIRCONSTANCIEL : il se déplace ou se supprime, et dit où, quand, comment.
 * L'erreur donne le test de la bonne réponse.
 */

const MANCHES = exports.MANCHES = 8;
const FONCTIONS = exports.FONCTIONS = {
  cod: 'COD',
  coi: 'COI',
  cc: 'Complément circonstanciel'
};

/** [phrase avec le groupe entre crochets, fonction]. */
const PHRASES_A_ANALYSER = exports.PHRASES_A_ANALYSER = [['Léa mange [une pomme].', 'cod'], ['J’ai rencontré [ta sœur] au marché.', 'cod'], ['Maman lit [le journal].', 'cod'], ['Paul regarde [les étoiles].', 'cod'], ['Le chien obéit [à son maître].', 'coi'], ['Tom parle [de ses vacances].', 'coi'], ['Il pense [à son voyage].', 'coi'], ['Elle se souvient [de cette journée].', 'coi'], ['Nous partirons [demain matin].', 'cc'], ['Les oiseaux chantent [dans le jardin].', 'cc'], ['[Chaque soir], je lis une histoire.', 'cc'], ['Le vent souffle [très fort].', 'cc']];

/** « Léa mange [une pomme]. » → ['Léa mange ', 'une pomme', '.']. */
const decouper = phrase => {
  const [avant, reste] = phrase.split('[');
  const [groupe, apres] = reste.split(']');
  return [avant, groupe, apres];
};
exports.decouper = decouper;
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  const parFonction = f => melanger(PHRASES_A_ANALYSER.filter(([, x]) => x === f));
  const tirees = [...parFonction('cod').slice(0, 3), ...parFonction('coi').slice(0, 3), ...parFonction('cc').slice(0, 2)];
  return melanger(tirees).map(([phrase, fonction]) => ({
    consigne: 'fonction',
    phrase,
    question: phrase.replace(/[[\]]/g, ''),
    bonne: fonction,
    choix: Object.entries(FONCTIONS).map(([cle, libelle]) => ({
      cle,
      libelle
    }))
  }));
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return `regle-${m.bonne}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  fonction: 'Quelle est la fonction du groupe surligné ?',
  'regle-cod': 'Pose la question quoi, ou qui, juste après le verbe, sans petit mot : ce groupe est un COD.',
  'regle-coi': 'Ce groupe est relié au verbe par un petit mot, à ou de : c’est un COI.',
  'regle-cc': 'Ce groupe peut se déplacer ou disparaître, et il dit où, quand ou comment : c’est un complément circonstanciel.'
};