const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES_A_COMPTER = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var cm1 = _interopRequireWildcard(require("./phrasesCM1.js"));
var _outils = require("./outils.js");
/**
 * PHRASE SIMPLE, PHRASE COMPLEXE — transformer la phrase au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_TYPES           — « Identifier les types et les formes de
 *                                  phrases et les transformer »
 *   FR_CM2_LANG_SIMPLE_COMPLEXE — « Différencier phrase simple et phrase
 *                                  complexe »
 *
 * DEUX SORTES DE MANCHES :
 *   - SIMPLE OU COMPLEXE ? (5) : on compte les VERBES CONJUGUÉS. Un seul :
 *     simple. Deux ou plus : complexe. LE PIÈGE : les infinitifs et les
 *     phrases longues — « Le petit chat noir de la voisine dort sur le
 *     canapé » est simple ; « Il veut partir » aussi ;
 *   - TYPES ET FORMES (3), comme au CM1 (`phrasesCM1.js`).
 */

const MANCHES = exports.MANCHES = 8;

/** [phrase, simple ou complexe, le piège qu'elle tend]. */
const PHRASES_A_COMPTER = exports.PHRASES_A_COMPTER = [['Le petit chat noir de la voisine dort sur le canapé.', 'simple', 'longue'], ['Pendant les longues vacances d’été, nous allons chez nos cousins.', 'simple', 'longue'], ['Léo veut partir à la mer.', 'simple', 'infinitif'], ['Elle aime lire et dessiner.', 'simple', 'infinitif'], ['Il pleut.', 'simple', null], ['Il pleut, alors nous restons à la maison.', 'complexe', null], ['Je mange quand j’ai faim.', 'complexe', 'courte'], ['Le chien aboie et le chat s’enfuit.', 'complexe', null], ['Tom sait que sa sœur viendra.', 'complexe', 'courte'], ['Elle rit, il chante, nous dansons.', 'complexe', 'courte']];
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  const simples = melanger(PHRASES_A_COMPTER.filter(([, s]) => s === 'simple')).slice(0, 3);
  const complexes = melanger(PHRASES_A_COMPTER.filter(([, s]) => s === 'complexe')).slice(0, 2);
  const compter = [...simples, ...complexes].map(([question, bonne, piege]) => ({
    consigne: 'compter',
    question,
    bonne,
    piege,
    choix: [{
      cle: 'simple',
      libelle: 'Phrase simple'
    }, {
      cle: 'complexe',
      libelle: 'Phrase complexe'
    }]
  }));
  const types = cm1.serie(graine).slice(0, 3);
  return melanger([...compter, ...types]);
}
function verdict(m, cle) {
  if (m.consigne !== 'compter') return cm1.verdict(m, cle);
  if (cle === m.bonne) return 'juste';
  if (m.piege === 'infinitif') return 'compter-infinitif';
  if (m.piege === 'longue') return 'compter-longue';
  return `compter-${m.bonne}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  ...cm1.PHRASES,
  compter: 'Cette phrase est-elle simple, ou complexe ? Compte ses verbes conjugués.',
  'compter-simple': 'Il n’y a qu’un seul verbe conjugué : c’est une phrase simple.',
  'compter-complexe': 'Il y a plusieurs verbes conjugués, chacun avec son sujet : c’est une phrase complexe.',
  'compter-infinitif': 'Un verbe à l’infinitif ne compte pas : il n’y a qu’un verbe conjugué. C’est une phrase simple.',
  'compter-longue': 'Une phrase longue n’est pas forcément complexe : compte les verbes conjugués. Ici, il n’y en a qu’un.'
};