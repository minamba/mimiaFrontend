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
 * LE PARTICIPE PASSÉ AVEC AVOIR — le sujet qui s'éloigne au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_PP_AVOIR — « Accorder le participe passé employé avec avoir »
 *
 * LA RÈGLE DU CM2 : avec avoir, le participe ne s'accorde JAMAIS avec le
 * sujet ; il s'accorde avec le COD, SEULEMENT SI LE COD EST PLACÉ AVANT.
 *   « Les pommes que j'ai cueillies » (que = les pommes, avant) ;
 *   « J'ai cueilli des pommes » (le COD est après : pas d'accord).
 * Les trois pièges : accorder avec le SUJET, accorder avec un COD placé
 * APRÈS, oublier l'accord avec un COD placé AVANT.
 */

const MANCHES = exports.MANCHES = 8;

/** [phrase, infinitif, bonne forme, { forme fausse: sa faute }]. */
const PHRASES_A_ACCORDER = exports.PHRASES_A_ACCORDER = [['Les pommes que j’ai ___ sont rouges.', 'cueillir', 'cueillies', {
  cueilli: 'avant-oubli',
  cueillis: 'genre'
}], ['J’ai ___ des pommes.', 'cueillir', 'cueilli', {
  cueillies: 'apres'
}], ['Ces lettres, je les ai ___ hier.', 'écrire', 'écrites', {
  écrit: 'avant-oubli',
  écrits: 'genre'
}], ['Elles ont ___ toute la journée.', 'chanter', 'chanté', {
  chantées: 'sujet'
}], ['La chanson qu’il a ___ était belle.', 'choisir', 'choisie', {
  choisi: 'avant-oubli',
  choisies: 'nombre'
}], ['Mes parents ont ___ une maison.', 'acheter', 'acheté', {
  achetée: 'apres',
  achetés: 'sujet'
}], ['Les dessins que tu as ___ sont beaux.', 'faire', 'faits', {
  fait: 'avant-oubli',
  faites: 'genre'
}], ['Nos amies ont ___ leurs devoirs.', 'finir', 'fini', {
  finies: 'sujet',
  finis: 'apres'
}], ['Cette histoire, je l’ai ___ deux fois.', 'lire', 'lue', {
  lu: 'avant-oubli',
  lus: 'genre'
}], ['Les filles ont ___ le train.', 'prendre', 'pris', {
  prises: 'sujet'
}]];
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  // Autant de COD placés avant que de phrases sans accord.
  const avant = melanger(PHRASES_A_ACCORDER.filter(([,,, f]) => Object.values(f).includes('avant-oubli'))).slice(0, 4);
  const sans = melanger(PHRASES_A_ACCORDER.filter(([,,, f]) => !Object.values(f).includes('avant-oubli'))).slice(0, 4);
  return melanger([...avant, ...sans]).map(([phrase, infinitif, bonne, fautes]) => ({
    consigne: 'accorder',
    question: `${phrase} (${infinitif})`,
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
  accorder: 'Avec l’auxiliaire avoir : faut-il accorder le participe ?',
  sujet: 'Avec avoir, le participe ne s’accorde jamais avec le sujet. Cherche le COD : où est-il ?',
  apres: 'Le COD est placé après le verbe : avec avoir, on n’accorde pas.',
  'avant-oubli': 'Le COD est placé avant le verbe : avec avoir, le participe s’accorde avec lui. Qu’est-ce qui a été fait ?',
  genre: 'L’accord est bon, mais regarde le genre du COD : masculin ou féminin ?',
  nombre: 'L’accord est bon, mais regarde le nombre du COD : un seul, ou plusieurs ?'
};