const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = exports.FIGURES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var cm1 = _interopRequireWildcard(require("./geometrieCM1.js"));
var _outils = require("./outils.js");
/**
 * LA GÉOMÉTRIE DU CM2 — le miroir au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_MES_ANGLE           — « Comparer et mesurer des angles »
 *   MATH_CM2_GEO_FIGURES         — « Reconnaître les figures usuelles »
 *   MATH_CM2_GEO_PERPENDICULAIRE — « Reconnaître droites perpendiculaires et
 *                                   parallèles »
 *   MATH_CM2_GEO_SYMETRIE        — « Construire le symétrique d'une figure »
 *
 * QUATRE SORTES DE MANCHES, toutes dessinées par `GeometrieCM1.js` :
 *   - MESURER L'ANGLE (3) : 45°, 120°… LE PIÈGE DU RAPPORTEUR : lire la
 *     mauvaise graduation, 180° moins la bonne mesure ;
 *   - NOMMER LA FIGURE (3) : carré, rectangle, losange, parallélogramme,
 *     triangles rectangle, isocèle, équilatéral. Les pièges sont ses
 *     voisines — le carré et le losange, le rectangle et le parallélogramme ;
 *   - DEUX DROITES (1) et LE MIROIR (1), repris du CM1 (`geometrieCM1.js`).
 */

const MANCHES = exports.MANCHES = 8;
const FIGURES = exports.FIGURES = {
  carre: 'Un carré',
  rectangle: 'Un rectangle',
  losange: 'Un losange',
  parallelogramme: 'Un parallélogramme',
  'triangle-rectangle': 'Un triangle rectangle',
  'triangle-isocele': 'Un triangle isocèle',
  'triangle-equilateral': 'Un triangle équilatéral'
};

/** Les deux figures avec lesquelles chacune se confond. */
const VOISINES = {
  carre: ['losange', 'rectangle'],
  rectangle: ['carre', 'parallelogramme'],
  losange: ['carre', 'parallelogramme'],
  parallelogramme: ['rectangle', 'losange'],
  'triangle-rectangle': ['triangle-isocele', 'triangle-equilateral'],
  'triangle-isocele': ['triangle-equilateral', 'triangle-rectangle'],
  'triangle-equilateral': ['triangle-isocele', 'triangle-rectangle']
};
const MESURES = [30, 45, 60, 120, 135, 150];
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  melanger(MESURES).slice(0, 3).forEach(a => {
    const bonne = `${a}°`;
    const rapporteur = `${180 - a}°`;
    const autre = a === 90 ? '60°' : '90°';
    liste.push({
      consigne: 'mesure',
      angle: a,
      rotation: entre(0, 3) * 15,
      bonne,
      choix: melanger([bonne, rapporteur, autre]).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [rapporteur]: 'mesure-rapporteur',
        [autre]: 'mesure-droit'
      }
    });
  });
  melanger(Object.keys(FIGURES)).slice(0, 3).forEach(f => {
    liste.push({
      consigne: 'figure',
      figure: f,
      bonne: f,
      choix: melanger([f, ...VOISINES[f]]).map(c => ({
        cle: c,
        libelle: FIGURES[c]
      }))
    });
  });

  // Une manche de droites et une de miroir, telles que les tire le CM1.
  const duCM1 = cm1.serie(graine);
  liste.push(duCM1.find(m => m.consigne === 'droites'));
  liste.push(duCM1.find(m => m.consigne === 'miroir'));
  return melanger(liste);
}
function verdict(m, cle) {
  if (m.consigne === 'droites' || m.consigne === 'miroir') return cm1.verdict(m, cle);
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'figure') return `figure-${m.bonne}`;
  return m.pieges[cle];
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  droites: cm1.PHRASES.droites,
  miroir: cm1.PHRASES.miroir,
  'droites-perpendiculaires': cm1.PHRASES['droites-perpendiculaires'],
  'droites-paralleles': cm1.PHRASES['droites-paralleles'],
  'droites-secantes': cm1.PHRASES['droites-secantes'],
  'miroir-glisse': cm1.PHRASES['miroir-glisse'],
  'miroir-bas': cm1.PHRASES['miroir-bas'],
  mesure: 'Combien mesure cet angle ?',
  figure: 'Quelle est cette figure ?',
  'mesure-rapporteur': 'Attention à la graduation du rapporteur : il en a deux. Cet angle est-il plus petit ou plus grand qu’un angle droit ?',
  'mesure-droit': 'Compare avec l’angle droit, quatre-vingt-dix degrés : celui-ci est plus fermé, ou plus ouvert ?',
  'figure-carre': 'Quatre côtés égaux et quatre angles droits : c’est un carré.',
  'figure-rectangle': 'Quatre angles droits, mais des côtés de deux longueurs : c’est un rectangle.',
  'figure-losange': 'Quatre côtés égaux, mais pas d’angle droit : c’est un losange.',
  'figure-parallelogramme': 'Des côtés opposés parallèles deux à deux, sans angle droit : c’est un parallélogramme.',
  'figure-triangle-rectangle': 'Ce triangle a un angle droit : c’est un triangle rectangle.',
  'figure-triangle-isocele': 'Ce triangle a deux côtés égaux, pas trois : c’est un triangle isocèle.',
  'figure-triangle-equilateral': 'Ce triangle a ses trois côtés égaux : c’est un triangle équilatéral.'
};