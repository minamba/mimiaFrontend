const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = exports.JOURS = exports.FRUITS = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES TABLEAUX DU CM1 — le diagramme au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_DATA_TABLEAU — « Lire et compléter un tableau »
 *
 * UN TABLEAU À DOUBLE ENTRÉE : les fruits vendus au marché, jour par jour.
 * Trois questions :
 *   - LIRE UNE CASE (4) : au croisement d'une ligne et d'une colonne. Le piège :
 *     la case d'à côté ;
 *   - LE TOTAL D'UN JOUR (2) : toute la colonne. Pièges : une seule case, ou
 *     toute la LIGNE au lieu de la colonne ;
 *   - LE JOUR OÙ L'ON EN A VENDU LE PLUS (2) : dans une ligne. Le piège : le
 *     jour où l'on a vendu le plus de fruits EN TOUT.
 */

const MANCHES = exports.MANCHES = 8;
const FRUITS = exports.FRUITS = ['pommes', 'poires', 'prunes'];
const JOURS = exports.JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi'];
function tableau(entre) {
  return FRUITS.map(() => JOURS.map(() => entre(3, 29)));
}
const colonne = (t, j) => t.reduce((s, ligne) => s + ligne[j], 0);
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  while (liste.length < 4) {
    const t = tableau(entre);
    const f = entre(0, 2);
    const j = entre(0, 3);
    const bonne = t[f][j];
    const voisin = t[f][j === 3 ? 2 : j + 1];
    const dessous = t[(f + 1) % 3][j];
    if (new Set([bonne, voisin, dessous]).size === 3) {
      liste.push({
        consigne: 'lire',
        tableau: t,
        question: `Combien de ${FRUITS[f]} le ${JOURS[j]} ?`,
        bonne,
        choix: melanger([bonne, voisin, dessous]).map(c => ({
          cle: c,
          libelle: String(c)
        })),
        pieges: {
          [voisin]: 'croisement',
          [dessous]: 'croisement'
        }
      });
    }
  }
  while (liste.length < 6) {
    const t = tableau(entre);
    const j = entre(0, 3);
    const f = entre(0, 2);
    const bonne = colonne(t, j);
    const ligne = t[f].reduce((a, b) => a + b, 0);
    const une = t[f][j];
    if (new Set([bonne, ligne, une]).size === 3) {
      liste.push({
        consigne: 'total',
        tableau: t,
        question: `Combien de fruits le ${JOURS[j]}, en tout ?`,
        bonne,
        choix: melanger((0, _outils.troisChoix)(bonne, [ligne, une], k => bonne + k)).map(c => ({
          cle: c,
          libelle: String(c)
        })),
        pieges: {
          [ligne]: 'total-ligne',
          [une]: 'total-une'
        }
      });
    }
  }
  while (liste.length < MANCHES) {
    const t = tableau(entre);
    const f = entre(0, 2);
    const max = Math.max(...t[f]);
    const jours = [0, 1, 2, 3];
    const bonne = t[f].indexOf(max);
    const totaux = jours.map(j => colonne(t, j));
    const leurre = totaux.indexOf(Math.max(...totaux));
    // Une seule bonne réponse, et un leurre qui en diffère.
    if (t[f].filter(v => v === max).length === 1 && leurre !== bonne) {
      const autre = jours.find(j => j !== bonne && j !== leurre);
      liste.push({
        consigne: 'plus',
        tableau: t,
        question: `Quel jour a-t-on vendu le plus de ${FRUITS[f]} ?`,
        bonne: JOURS[bonne],
        choix: melanger([bonne, leurre, autre]).map(j => ({
          cle: JOURS[j],
          libelle: JOURS[j]
        })),
        pieges: {
          [JOURS[leurre]]: 'plus-tout'
        }
      });
    }
  }
  return liste;
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (String(cle) === String(m.bonne)) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  lire: 'Lis le tableau : trouve la bonne case.',
  total: 'Combien en tout ce jour-là ?',
  plus: 'Quel jour en a-t-on vendu le plus ?',
  croisement: 'Suis la ligne du fruit et la colonne du jour : la réponse est là où elles se croisent.',
  'lire-regle': 'Suis la ligne du fruit et la colonne du jour jusqu’à leur croisement.',
  'total-ligne': 'Tu as ajouté toute une ligne, les jours d’un seul fruit. Ici, on ajoute la colonne du jour.',
  'total-une': 'Ce n’est qu’un seul fruit. Ajoute toutes les cases de la colonne du jour.',
  'total-regle': 'Ajoute toutes les cases de la colonne du jour.',
  'plus-tout': 'Ce jour-là, on a vendu le plus de fruits en tout. Regarde seulement la ligne du fruit demandé.',
  'plus-regle': 'Parcours la ligne du fruit et cherche le plus grand nombre.'
};