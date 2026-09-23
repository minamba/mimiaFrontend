const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.perimetre = perimetre;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES AIRES DU CM1 — le tour du jardin au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_MES_AIRE — « Comparer et mesurer des aires »
 *
 * AU CE2, ON FAISAIT LE TOUR DU JARDIN ; AU CM1, ON LE RECOUVRE. Le piège
 * est donc tout trouvé : le PÉRIMÈTRE à la place de l'aire.
 *   - SUR LE QUADRILLAGE (5) : une figure en carreaux, droite ou en L ;
 *     combien de carreaux la couvrent ?
 *   - LE RECTANGLE (3) : « 6 carreaux sur 4 » — on multiplie. Pièges : le
 *     périmètre, et la somme des deux côtés.
 */

const MANCHES = exports.MANCHES = 8;

/** Le tour d'une figure en carreaux : chaque côté qui ne touche pas un autre carreau. */
function perimetre(cases) {
  const ici = new Set(cases.map(([x, y]) => `${x},${y}`));
  let tour = 0;
  cases.forEach(([x, y]) => {
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      if (!ici.has(`${x + dx},${y + dy}`)) tour += 1;
    });
  });
  return tour;
}

/** Un rectangle a × b, auquel on retire parfois un coin : une figure en L. */
function figure(entre) {
  const l = entre(3, 6);
  const h = entre(2, 4);
  const coupeL = entre(0, 1) ? entre(1, l - 2) : 0;
  const coupeH = coupeL ? entre(1, h - 1) : 0;
  const cases = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < l; x += 1) {
      if (!(x >= l - coupeL && y < coupeH)) cases.push([x, y]);
    }
  }
  return {
    l,
    h,
    cases
  };
}
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  while (liste.length < 5) {
    const f = figure(entre);
    const aire = f.cases.length;
    const tour = perimetre(f.cases);
    if (tour !== aire) {
      liste.push({
        consigne: 'quadrillage',
        figure: f,
        bonne: aire,
        choix: melanger((0, _outils.troisChoix)(aire, [tour], k => aire + (k % 2 ? k : -k))).map(c => ({
          cle: c,
          libelle: `${c} carreaux`
        })),
        pieges: {
          [tour]: 'perimetre'
        }
      });
    }
  }
  while (liste.length < MANCHES) {
    const a = entre(3, 9);
    const b = entre(2, 7);
    const aire = a * b;
    const tour = 2 * (a + b);
    if (a !== b && tour !== aire) {
      liste.push({
        consigne: 'rectangle',
        question: `Un rectangle de ${a} carreaux sur ${b} carreaux.`,
        bonne: aire,
        choix: melanger((0, _outils.troisChoix)(aire, [tour, a + b], k => aire + k * a)).map(c => ({
          cle: c,
          libelle: `${c} carreaux`
        })),
        pieges: {
          [tour]: 'perimetre',
          [a + b]: 'addition'
        }
      });
    }
  }
  return liste;
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (Number(cle) === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  quadrillage: 'Quelle est l’aire de cette figure ? Compte les carreaux qui la couvrent.',
  rectangle: 'Quelle est l’aire de ce rectangle ?',
  perimetre: 'Ça, c’est le tour de la figure, son périmètre. L’aire, ce sont les carreaux à l’intérieur.',
  addition: 'On n’ajoute pas les côtés : un rang de carreaux, autant de fois qu’il y a de rangs.',
  'quadrillage-regle': 'Compte les carreaux rang par rang, sans en oublier ni en compter deux fois.',
  'rectangle-regle': 'Multiplie la longueur par la largeur : un rang, autant de fois qu’il y a de rangs.'
};