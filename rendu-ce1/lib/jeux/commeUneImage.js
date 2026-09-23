const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.OUTILS = exports.MANCHES = exports.IMAGES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * COMME UNE IMAGE — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LECT_POESIE — « Repérer une comparaison ou une image dans un texte »
 *
 * UNE IMAGE DE POÈTE, TROIS FAÇONS DE LA COMPRENDRE. Les vers sont écrits
 * pour le jeu. LE PIÈGE DU CM1, C'EST DE PRENDRE L'IMAGE AU PIED DE LA
 * LETTRE : « ses yeux brillaient comme des étoiles » ne met pas d'étoiles
 * dans les yeux. Le second piège dit le contraire de l'image.
 * Deux manches sur huit demandent le MOT-OUTIL de la comparaison (comme,
 * pareil à, tel…).
 */

const MANCHES = exports.MANCHES = 8;

/** [image, ce qu'elle veut dire, au pied de la lettre, le contraire]. */
const IMAGES = exports.IMAGES = [['Ses yeux brillaient comme deux étoiles.', 'Ses yeux brillaient très fort.', 'Il avait des étoiles dans les yeux.', 'Ses yeux étaient ternes.'], ['La lune est un ballon posé sur le toit.', 'La lune est ronde et semble toute proche.', 'Quelqu’un a posé un ballon sur le toit.', 'La lune est toute petite et lointaine.'], ['Le vent hurle comme un loup dans la nuit.', 'Le vent souffle fort, avec un bruit effrayant.', 'Un loup hurle dans la nuit.', 'Le vent est doux et silencieux.'], ['La neige a posé son manteau blanc sur la ville.', 'La neige recouvre toute la ville.', 'Quelqu’un a oublié un manteau blanc en ville.', 'La neige a fondu partout.'], ['Le soleil, pareil à une orange, se couche sur la mer.', 'Le soleil est rond et orangé.', 'Une orange tombe dans la mer.', 'Le soleil est blanc et froid.'], ['Mon cœur est un oiseau qui s’envole.', 'Je me sens léger et joyeux.', 'Un oiseau sort de ma poitrine.', 'Je me sens lourd et triste.'], ['La rivière chante entre les pierres.', 'L’eau fait un bruit doux et joyeux.', 'La rivière connaît des chansons.', 'La rivière est silencieuse.'], ['Les arbres, tels des géants, gardent la forêt.', 'Les arbres sont très grands.', 'Des géants surveillent la forêt.', 'Les arbres sont tout petits.']];

/** [vers, mot-outil, deux autres mots du vers]. */
const OUTILS = exports.OUTILS = [['Ses yeux brillaient comme deux étoiles.', 'comme', ['brillaient', 'deux']], ['Le soleil, pareil à une orange, se couche.', 'pareil à', ['soleil', 'se couche']], ['Les arbres, tels des géants, gardent la forêt.', 'tels', ['arbres', 'gardent']], ['Le vent hurle comme un loup.', 'comme', ['hurle', 'loup']], ['La mer ressemble à un grand miroir.', 'ressemble à', ['mer', 'grand']]];
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  const images = melanger(IMAGES).slice(0, 6).map(([question, bonne, lettre, contraire]) => ({
    consigne: 'sens',
    question,
    bonne,
    choix: melanger([bonne, lettre, contraire]).map(c => ({
      cle: c,
      libelle: c
    })),
    pieges: {
      [lettre]: 'lettre',
      [contraire]: 'contraire'
    }
  }));
  const outilsTires = melanger(OUTILS).slice(0, 2).map(([question, bonne, autres]) => ({
    consigne: 'outil',
    question,
    bonne,
    choix: melanger([bonne, ...autres]).map(c => ({
      cle: c,
      libelle: c
    }))
  }));
  return melanger([...images, ...outilsTires]);
}
function verdict(m, cle) {
  var _m$pieges$cle, _m$pieges;
  if (cle === m.bonne) return 'juste';
  return (_m$pieges$cle = (_m$pieges = m.pieges) === null || _m$pieges === void 0 ? void 0 : _m$pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : 'outil-regle';
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  sens: 'Que veut dire cette image de poète ?',
  outil: 'Quel mot sert à comparer, dans ce vers ?',
  lettre: 'C’est une image : on ne la prend pas au pied de la lettre. Cherche ce que les deux choses ont en commun.',
  contraire: 'Relis l’image : elle dit presque le contraire. Qu’ont en commun les deux choses comparées ?',
  'outil-regle': 'Le mot qui compare relie les deux choses : comme, pareil à, tel, ressemble à.'
};