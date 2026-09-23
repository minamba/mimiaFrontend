const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES_A_TROU = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES HOMOPHONES DU CM2 — a ou à au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_HOMOPHONES — « Distinguer ou et où, leur et leurs, quel,
 *                             quelle et qu'elle »
 *
 * UNE PHRASE À TROU, DES MOTS QUI SE PRONONCENT PAREIL. Chaque phrase n'a
 * qu'une réponse. En début de phrase, les choix prennent la majuscule. Le
 * truc de la bonne réponse vient en cas d'erreur :
 *   ou → ou bien ; où → un lieu, un moment ; leur (devant un verbe) → lui ;
 *   leurs → plusieurs choses ; quel, quelle → le nom qui suit ; qu'elle →
 *   qu'il.
 */

const MANCHES = exports.MANCHES = 8;
const GROUPES = {
  'ou-ou': ['ou', 'où'],
  'leur-leurs': ['leur', 'leurs'],
  quel: ['quel', 'quelle', 'qu’elle']
};

/** [phrase à trou, bonne réponse en minuscules]. */
const PHRASES_A_TROU = exports.PHRASES_A_TROU = {
  'ou-ou': [['Tu veux du jus ___ de l’eau ?', 'ou'], ['Pile ___ face ?', 'ou'], ['On ira au parc ___ à la piscine.', 'ou'], ['Je sais ___ tu as caché le trésor.', 'où'], ['___ vas-tu si vite ?', 'où'], ['La ville ___ j’habite est au bord de la mer.', 'où']],
  'leur-leurs': [['Les enfants rangent ___ cartables.', 'leurs'], ['Mes voisins promènent ___ deux chiens.', 'leurs'], ['Ils ont perdu toutes ___ clés.', 'leurs'], ['Je ___ donne un gâteau.', 'leur'], ['Dis-___ bonjour de ma part.', 'leur'], ['Les oiseaux construisent ___ nid dans le cerisier.', 'leur']],
  quel: [['___ heure est-il ?', 'quelle'], ['___ histoire incroyable !', 'quelle'], ['___ livre préfères-tu ?', 'quel'], ['___ beau temps aujourd’hui !', 'quel'], ['Je pense ___ viendra demain.', 'qu’elle'], ['Il faut ___ se dépêche.', 'qu’elle']]
};
const NOM = {
  ou: 'ou',
  où: 'ou-lieu',
  leur: 'leur',
  leurs: 'leurs',
  quel: 'quel',
  quelle: 'quelle',
  'qu’elle': 'qu-elle'
};
const majuscule = mot => mot[0].toUpperCase() + mot.slice(1);
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  const tirees = [...melanger(PHRASES_A_TROU['ou-ou']).slice(0, 3).map(p => ['ou-ou', p]), ...melanger(PHRASES_A_TROU['leur-leurs']).slice(0, 2).map(p => ['leur-leurs', p]), ...melanger(PHRASES_A_TROU.quel).slice(0, 3).map(p => ['quel', p])];
  return melanger(tirees).map(([groupe, [question, bonne]]) => {
    const debut = question.startsWith('___');
    const ecrire = mot => debut ? majuscule(mot) : mot;
    return {
      consigne: groupe,
      question,
      bonne: ecrire(bonne),
      regle: NOM[bonne],
      choix: GROUPES[groupe].map(c => ({
        cle: ecrire(c),
        libelle: ecrire(c)
      }))
    };
  });
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return `regle-${m.regle}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  'ou-ou': 'Ou, ou où ? Choisis le bon mot.',
  'leur-leurs': 'Leur, ou leurs ? Choisis le bon mot.',
  quel: 'Quel, quelle, ou qu’elle ? Choisis le bon mot.',
  'regle-ou': 'Ici, on pourrait dire ou bien : c’est ou, sans accent.',
  'regle-ou-lieu': 'Ici, on parle d’un lieu, ou on pose la question où : c’est où, avec un accent.',
  'regle-leur': 'Ici, devant un verbe, on pourrait dire lui : leur ne prend jamais de s. Ou bien il n’y a qu’une seule chose à eux.',
  'regle-leurs': 'Ici, il y a plusieurs choses à eux, et le nom est au pluriel : leurs prend un s.',
  'regle-quel': 'Ici, le mot va avec un nom masculin : c’est quel.',
  'regle-quelle': 'Ici, le mot va avec un nom féminin : c’est quelle.',
  'regle-qu-elle': 'Ici, on peut dire qu’il à la place : c’est qu’elle, avec une apostrophe.'
};