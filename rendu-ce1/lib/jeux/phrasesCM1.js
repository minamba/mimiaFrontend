const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.TYPES = exports.PHRASES_A_CLASSER = exports.PHRASES = exports.MANCHES = void 0;
exports.etiquette = etiquette;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES TYPES ET LES FORMES DE PHRASES DU CM1 — transformer la phrase au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_TYPES  — « Identifier les trois types de phrases et les
 *                        transformer »
 *   FR_CM1_LANG_FORMES — « Identifier et employer les formes négative et
 *                        exclamative »
 *
 * LE PROGRAMME DU CM1 COMPTE TROIS TYPES — déclaratif, interrogatif,
 * impératif — et range l'EXCLAMATIVE parmi les FORMES, avec la négative.
 * « Je n'ai jamais vu ça ! » est donc déclarative, négative ET exclamative.
 * (Le jeu du CE1 disait encore « phrase exclamative » : c'était son niveau.)
 *
 * TROIS ÉTIQUETTES : la bonne ; la même sans (ou avec) la négation ; et, pour
 * une phrase exclamative, la même sans le point d'exclamation — sinon, un
 * autre type. L'erreur dit quoi regarder. Les négations ne sont pas toutes
 * « ne… pas » : « ne… jamais », « ne… plus », « personne ne ».
 */

const MANCHES = exports.MANCHES = 8;
const TYPES = exports.TYPES = {
  declarative: 'Déclarative',
  interrogative: 'Interrogative',
  imperative: 'Impérative'
};

/** [phrase, type, négative, exclamative]. */
const PHRASES_A_CLASSER = exports.PHRASES_A_CLASSER = [['Ne viens-tu pas avec nous ?', 'interrogative', true, false], ['Tu viens avec nous ?', 'interrogative', false, false], ['Est-ce que tu n’as plus faim ?', 'interrogative', true, false], ['Ne cours pas dans le couloir.', 'imperative', true, false], ['Range ta chambre avant le dîner.', 'imperative', false, false], ['Ferme vite cette fenêtre !', 'imperative', false, true], ['Il ne pleut jamais dans ce désert.', 'declarative', true, false], ['Personne ne répond au téléphone.', 'declarative', true, false], ['Le train arrive à midi.', 'declarative', false, false], ['Comme tu as grandi !', 'declarative', false, true], ['Je n’ai jamais vu une chose pareille !', 'declarative', true, true], ['Quel beau dessin tu as fait !', 'declarative', false, true]];
const cle = (type, neg, excl) => `${type}.${neg ? 'neg' : 'aff'}.${excl ? 'excl' : 'non'}`;

/** « Déclarative, négative et exclamative ». */
function etiquette(c) {
  const [type, neg, excl] = c.split('.');
  const formes = [neg === 'neg' ? 'négative' : 'affirmative', ...(excl === 'excl' ? ['exclamative'] : [])];
  return `${TYPES[type]}, ${formes.join(' et ')}`;
}
function serie(graine = Date.now()) {
  const {
    au,
    melanger
  } = (0, _outils.outils)(graine);
  return melanger(PHRASES_A_CLASSER).slice(0, MANCHES).map(([question, type, neg, excl]) => {
    const bonne = cle(type, neg, excl);
    const negation = cle(type, !neg, excl);
    const troisieme = excl ? cle(type, neg, false) : cle(au(Object.keys(TYPES).filter(t => t !== type)), neg, excl);
    return {
      consigne: 'classer',
      question,
      bonne,
      choix: melanger([bonne, negation, troisieme]).map(c => ({
        cle: c,
        libelle: etiquette(c)
      })),
      pieges: {
        [negation]: neg ? 'forme-negative' : 'forme-affirmative',
        [troisieme]: excl ? 'forme-exclamative' : `type-${type}`
      }
    };
  });
}
function verdict(m, c) {
  if (c === m.bonne) return 'juste';
  return m.pieges[c];
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  classer: 'Quel est le type de cette phrase, et quelle est sa forme ?',
  'forme-negative': 'Cherche les deux petits mots de la négation : ne pas, ne jamais, ne plus. Cette phrase est négative.',
  'forme-affirmative': 'Il n’y a pas de négation dans cette phrase : elle est affirmative.',
  'forme-exclamative': 'Regarde la fin : le point d’exclamation montre une émotion. La phrase est aussi exclamative.',
  'type-declarative': 'Cette phrase raconte ou explique quelque chose : elle est déclarative.',
  'type-interrogative': 'Cette phrase pose une question : elle est interrogative.',
  'type-imperative': 'Cette phrase donne un ordre ou un conseil, sans sujet : elle est impérative.'
};