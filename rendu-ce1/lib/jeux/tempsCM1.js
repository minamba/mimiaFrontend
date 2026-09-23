const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.VERBES = exports.TEMPS = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES QUATRE TEMPS DU CM1 — la roue des verbes au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM1_LANG_TEMPS_SIMPLES — « Conjuguer aux quatre temps simples de
 *                               l'indicatif »
 *
 * UN VERBE, UN SUJET (il ou ils), UN TEMPS DEMANDÉ ; trois formes proposées.
 * Le passé simple ne se demande qu'à la 3e personne, comme le programme.
 * LES PIÈGES SONT LES AUTRES TEMPS DU MÊME VERBE, plus la bonne forme à la
 * mauvaise personne. L'erreur nomme ce que l'élève a choisi : « ça, c'est
 * l'imparfait ».
 *
 * « Il finit » est à la fois présent et passé simple : une forme qui répond
 * aussi juste n'est jamais proposée comme piège (voir `troisChoix`).
 */

const MANCHES = exports.MANCHES = 8;
const TEMPS = exports.TEMPS = ['present', 'imparfait', 'futur', 'passe-simple'];
const NOM_TEMPS = {
  present: 'au présent',
  imparfait: 'à l’imparfait',
  futur: 'au futur',
  'passe-simple': 'au passé simple'
};

/** Pour chaque verbe : [il, ils] à chaque temps. */
const VERBES = exports.VERBES = {
  chanter: {
    present: ['chante', 'chantent'],
    imparfait: ['chantait', 'chantaient'],
    futur: ['chantera', 'chanteront'],
    'passe-simple': ['chanta', 'chantèrent']
  },
  marcher: {
    present: ['marche', 'marchent'],
    imparfait: ['marchait', 'marchaient'],
    futur: ['marchera', 'marcheront'],
    'passe-simple': ['marcha', 'marchèrent']
  },
  finir: {
    present: ['finit', 'finissent'],
    imparfait: ['finissait', 'finissaient'],
    futur: ['finira', 'finiront'],
    'passe-simple': ['finit', 'finirent']
  },
  grandir: {
    present: ['grandit', 'grandissent'],
    imparfait: ['grandissait', 'grandissaient'],
    futur: ['grandira', 'grandiront'],
    'passe-simple': ['grandit', 'grandirent']
  },
  être: {
    present: ['est', 'sont'],
    imparfait: ['était', 'étaient'],
    futur: ['sera', 'seront'],
    'passe-simple': ['fut', 'furent']
  },
  avoir: {
    present: ['a', 'ont'],
    imparfait: ['avait', 'avaient'],
    futur: ['aura', 'auront'],
    'passe-simple': ['eut', 'eurent']
  },
  aller: {
    present: ['va', 'vont'],
    imparfait: ['allait', 'allaient'],
    futur: ['ira', 'iront'],
    'passe-simple': ['alla', 'allèrent']
  },
  faire: {
    present: ['fait', 'font'],
    imparfait: ['faisait', 'faisaient'],
    futur: ['fera', 'feront'],
    'passe-simple': ['fit', 'firent']
  },
  prendre: {
    present: ['prend', 'prennent'],
    imparfait: ['prenait', 'prenaient'],
    futur: ['prendra', 'prendront'],
    'passe-simple': ['prit', 'prirent']
  },
  venir: {
    present: ['vient', 'viennent'],
    imparfait: ['venait', 'venaient'],
    futur: ['viendra', 'viendront'],
    'passe-simple': ['vint', 'vinrent']
  },
  dire: {
    present: ['dit', 'disent'],
    imparfait: ['disait', 'disaient'],
    futur: ['dira', 'diront'],
    'passe-simple': ['dit', 'dirent']
  }
};
function serie(graine = Date.now()) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const temps = melanger([...TEMPS, ...TEMPS]);
  const verbes = melanger(Object.keys(VERBES));
  return temps.map((t, i) => {
    const verbe = verbes[i % verbes.length];
    const p = entre(0, 1);
    const formes = VERBES[verbe];
    const bonne = formes[t][p];
    // Le piège de personne, puis deux autres temps — jamais une forme qui serait juste aussi.
    const candidats = [[formes[t][1 - p], 'personne'], ...melanger(TEMPS.filter(x => x !== t)).map(x => [formes[x][p], x])].filter(([f]) => f !== bonne);
    const pieges = {};
    const choix = [bonne];
    [candidats[0], au([candidats[1], candidats[2]]), ...candidats.slice(1)].forEach(([f, sens]) => {
      if (choix.length < 3 && !choix.includes(f)) {
        choix.push(f);
        pieges[f] = sens;
      }
    });
    return {
      consigne: t,
      question: `${p ? 'Ils' : 'Il'} … (${verbe}), ${NOM_TEMPS[t]}`,
      bonne,
      choix: melanger(choix).map(c => ({
        cle: c,
        libelle: `${p ? 'ils' : 'il'} ${c}`
      })),
      pieges
    };
  });
}
function verdict(m, cle) {
  if (cle === m.bonne) return 'juste';
  return `choisi-${m.pieges[cle]}`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  present: 'Conjugue ce verbe au présent.',
  imparfait: 'Conjugue ce verbe à l’imparfait.',
  futur: 'Conjugue ce verbe au futur.',
  'passe-simple': 'Conjugue ce verbe au passé simple.',
  'choisi-personne': 'Le temps est bon, mais regarde le sujet : un seul, ou plusieurs ?',
  'choisi-present': 'Ça, c’est le présent. Regarde bien le temps demandé.',
  'choisi-imparfait': 'Ça, c’est l’imparfait, avec ses terminaisons en ait et aient. Regarde bien le temps demandé.',
  'choisi-futur': 'Ça, c’est le futur, avec son r avant la fin. Regarde bien le temps demandé.',
  'choisi-passe-simple': 'Ça, c’est le passé simple, le temps des histoires. Regarde bien le temps demandé.'
};