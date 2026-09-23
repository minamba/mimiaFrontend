const React = require('react');
"use strict";

var _interopRequireWildcard = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireWildcard.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var cm1 = _interopRequireWildcard(require("./tableauxCM1.js"));
var _outils = require("./outils.js");
/**
 * LES TABLEAUX ET LES DIAGRAMMES DU CM2 — le diagramme au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_DATA_TABLEAU    — « Lire les informations d'un tableau »
 *   MATH_CM2_DATA_DIAGRAMME  — « Construire un diagramme à partir de données »
 *
 * DEUX SORTES DE MANCHES :
 *   - LIRE LE TABLEAU (4), comme au CM1 (`tableauxCM1.js`) ;
 *   - LE BON DIAGRAMME (4) : les ventes d'un fruit, jour par jour ; trois
 *     diagrammes en barres proposés. Pièges : deux barres INVERSÉES (les jours
 *     mélangés), et une barre à la MAUVAISE HAUTEUR. Les diagrammes sont
 *     dessinés par `TableauxCM1.js`.
 */

const MANCHES = exports.MANCHES = 8;
function serie(graine = Date.now()) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const lire = cm1.serie(graine).filter(m => m.consigne === 'lire').slice(0, 4);
  const diagrammes = [];
  while (diagrammes.length < 4) {
    const valeurs = melanger([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]).slice(0, 4);
    const [i, j] = melanger([0, 1, 2, 3]).slice(0, 2);
    const ordre = [...valeurs];
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
    const hauteur = [...valeurs];
    const k = entre(0, 3);
    hauteur[k] = hauteur[k] > 10 ? hauteur[k] - 6 : hauteur[k] + 6;
    if (!valeurs.includes(hauteur[k])) {
      diagrammes.push({
        consigne: 'diagramme',
        fruit: au(cm1.FRUITS),
        valeurs,
        barres: {
          juste: valeurs,
          ordre,
          hauteur
        },
        bonne: 'juste',
        choix: melanger(['juste', 'ordre', 'hauteur']).map(c => ({
          cle: c,
          libelle: c
        }))
      });
    }
  }
  return melanger([...lire, ...diagrammes]);
}
function verdict(m, cle) {
  if (m.consigne !== 'diagramme') return cm1.verdict(m, cle);
  if (cle === m.bonne) return 'juste';
  return `diagramme-${cle}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  lire: cm1.PHRASES.lire,
  croisement: cm1.PHRASES.croisement,
  'lire-regle': cm1.PHRASES['lire-regle'],
  diagramme: 'Quel diagramme représente bien ce tableau ?',
  'diagramme-ordre': 'Les barres ont les bonnes hauteurs, mais pas dans le bon ordre : vérifie chaque jour.',
  'diagramme-hauteur': 'Une barre n’a pas la bonne hauteur : compare chaque barre au nombre du tableau.'
};