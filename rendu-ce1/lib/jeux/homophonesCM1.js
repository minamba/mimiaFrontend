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
 * LES HOMOPHONES DU CM1 — a ou à au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_CE_SE — « Distinguer ce et se, ces et ses, la, là et l'a »
 *
 * UNE PHRASE À TROU, LES MOTS QUI SE PRONONCENT PAREIL. Toutes les phrases
 * n'admettent qu'une réponse : pour « ces » et « ses », qui se confondent
 * souvent au sens, « -ci » ou « -là » désigne, et un possesseur nommé
 * possède. L'erreur donne le TRUC DE REMPLACEMENT de la bonne réponse :
 * se → me, ces → ces…-là, ses → les siens, là → ici, l'a → l'avait.
 */

const MANCHES = exports.MANCHES = 8;
const GROUPES = {
  'ce-se': ['ce', 'se'],
  'ces-ses': ['ces', 'ses'],
  'la-la-la': ['la', 'là', 'l’a']
};

/** [phrase à trou, bonne réponse]. */
const PHRASES_A_TROU = exports.PHRASES_A_TROU = {
  'ce-se': [['Regarde ___ chien qui court.', 'ce'], ['___ matin, il pleut très fort.', 'ce'], ['Je voudrais ___ livre rouge.', 'ce'], ['___ gâteau est délicieux.', 'ce'], ['Le chat ___ lave la patte.', 'se'], ['Elle ___ lève tôt le dimanche.', 'se'], ['Les enfants ___ cachent sous la table.', 'se'], ['Mon frère ___ brosse les dents.', 'se']],
  'ces-ses': [['___ nuages-là annoncent la pluie.', 'ces'], ['___ bottes-ci sont trop petites.', 'ces'], ['Tu vois ___ oiseaux-là, sur le toit ?', 'ces'], ['Julie met ___ lunettes pour lire.', 'ses'], ['Papa cherche ___ clés partout.', 'ses'], ['Le hérisson hérisse ___ piquants.', 'ses'], ['Léo range ___ propres jouets.', 'ses']],
  'la-la-la': [['Ferme ___ porte, s’il te plaît.', 'la'], ['Cette chanson, je ___ connais par cœur.', 'la'], ['Pose ton sac ___, près de la porte.', 'là'], ['Le chat est ___, derrière le rideau.', 'là'], ['Le chien a trouvé l’os : il ___ enterré.', 'l’a'], ['Cette lettre, Paul ___ écrite hier.', 'l’a']]
};

/** Les clés des phrases : sans accent ni apostrophe. */
const NOM = {
  ce: 'ce',
  se: 'se',
  ces: 'ces',
  ses: 'ses',
  la: 'la',
  là: 'la-lieu',
  'l’a': 'l-a'
};
function serie(graine = Date.now()) {
  const {
    melanger
  } = (0, _outils.outils)(graine);
  const tirees = [...melanger(PHRASES_A_TROU['ce-se']).slice(0, 3).map(p => ['ce-se', p]), ...melanger(PHRASES_A_TROU['ces-ses']).slice(0, 2).map(p => ['ces-ses', p]), ...melanger(PHRASES_A_TROU['la-la-la']).slice(0, 3).map(p => ['la-la-la', p])];
  return melanger(tirees).map(([groupe, [question, bonne]]) => ({
    consigne: groupe,
    question,
    bonne,
    choix: GROUPES[groupe].map(c => ({
      cle: c,
      libelle: c
    }))
  }));
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return `regle-${NOM[m.bonne]}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  'ce-se': 'Ce ou se ? Choisis le bon mot.',
  'ces-ses': 'Ces ou ses ? Choisis le bon mot.',
  'la-la-la': 'La, là, ou l’a ? Choisis le bon mot.',
  'regle-ce': 'Ici, il y a un nom juste après : c’est ce, qui montre, comme dans ce chien-là.',
  'regle-se': 'Ici, il y a un verbe : c’est se. Essaie avec je : je me lave.',
  'regle-ces': 'Ici, on montre : c’est ces, comme dans ces nuages-là.',
  'regle-ses': 'Ici, ce sont les siens, à lui ou à elle : c’est ses.',
  'regle-la': 'Ici, c’est la sans accent : devant un nom, ou pour remplacer un nom féminin.',
  'regle-la-lieu': 'Ici, on dit où : là, avec un accent. On pourrait dire ici.',
  'regle-l-a': 'Ici, on peut dire l’avait : c’est l’a, avec une apostrophe.'
};