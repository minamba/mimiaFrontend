const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES_A_ACCORDER = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES ACCORDS À DISTANCE DU CM1 — les accords au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_GN_ELOIGNE — « Accorder dans le groupe nominal quand l'adjectif
 *                            est éloigné du nom »
 *
 * AU CM1, L'ADJECTIF S'ÉLOIGNE DE SON NOM : « les fillettes, fatiguées par la
 * longue marche », « le chat de mes voisines est noir ». Entre les deux, un
 * autre nom attend l'élève. LE PIÈGE DU CM1, C'EST D'ACCORDER AVEC LE NOM LE
 * PLUS PROCHE ; les deux autres sont le genre et le nombre.
 */

const MANCHES = exports.MANCHES = 8;

/** [phrase, bonne forme, { forme fausse: sa faute }]. */
const PHRASES_A_ACCORDER = exports.PHRASES_A_ACCORDER = [['Les fillettes, ___ par la longue marche, s’assoient.', 'fatiguées', {
  fatiguée: 'proche',
  fatigués: 'genre'
}], ['Le chat de mes voisines est ___.', 'noir', {
  noires: 'proche',
  noire: 'genre'
}], ['Les feuilles du vieux chêne sont ___.', 'tombées', {
  tombé: 'proche',
  tombés: 'genre'
}], ['La maison de mes grands-parents est ___.', 'grande', {
  grands: 'proche',
  grand: 'genre'
}], ['Les enfants, ___ de leur victoire, chantent.', 'fiers', {
  fière: 'proche',
  fier: 'nombre'
}], ['Les gâteaux de ma tante sont ___.', 'délicieux', {
  délicieuse: 'proche',
  délicieuses: 'genre'
}], ['Ces lunettes de soleil sont ___.', 'neuves', {
  neuf: 'proche',
  neuve: 'nombre'
}], ['Les murs de la classe sont ___.', 'blancs', {
  blanche: 'proche',
  blanc: 'nombre'
}], ['Ma sœur, ___ par le bruit des voitures, se réveille.', 'surprise', {
  surprises: 'proche',
  surpris: 'genre'
}], ['Les roses du jardin sont ___.', 'fanées', {
  fané: 'proche',
  fanés: 'genre'
}], ['Le panier de pommes est ___.', 'plein', {
  pleines: 'proche',
  pleine: 'genre'
}], ['Les nuages, ___ par le vent du nord, filent vite.', 'poussés', {
  poussé: 'proche',
  poussées: 'genre'
}]];
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  return melanger(PHRASES_A_ACCORDER).slice(0, MANCHES).map(([question, bonne, fautes]) => ({
    consigne: 'accorder',
    question,
    bonne,
    choix: melanger([bonne, ...Object.keys(fautes)]).map(c => ({
      cle: c,
      libelle: c
    })),
    pieges: fautes
  }));
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return m.pieges[cle];
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  accorder: 'Choisis l’adjectif bien accordé. Attention, il est loin de son nom !',
  proche: 'Tu as accordé avec le nom le plus proche. Demande-toi qui est décrit : c’est avec ce nom-là qu’on accorde.',
  genre: 'Le nombre est bon, mais regarde le genre du nom décrit : masculin ou féminin ?',
  nombre: 'Le genre est bon, mais regarde le nombre du nom décrit : un seul, ou plusieurs ?'
};