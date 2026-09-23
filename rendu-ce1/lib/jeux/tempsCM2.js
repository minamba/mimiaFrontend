const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.VERBES = exports.TEMPS = exports.PHRASES = exports.MANCHES = void 0;
exports.conjuguer = conjuguer;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES TEMPS COMPOSÉS ET LE CONDITIONNEL — la roue des verbes au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CM2_LANG_TEMPS_COMPOSES — « Conjuguer aux temps composés et au
 *                                 conditionnel présent »
 *
 * UN VERBE, UN SUJET (il ou ils), UN TEMPS : passé composé, plus-que-parfait,
 * futur antérieur ou conditionnel présent. Comme au CM1 (`tempsCM1.js`), les
 * pièges sont les autres temps du même verbe et la mauvaise personne ; au
 * CM2 s'y ajoute LE MAUVAIS AUXILIAIRE — « il a allé ».
 */

const MANCHES = exports.MANCHES = 8;
const TEMPS = exports.TEMPS = ['passe-compose', 'plus-que-parfait', 'futur-anterieur', 'conditionnel'];
const NOM_TEMPS = {
  'passe-compose': 'au passé composé',
  'plus-que-parfait': 'au plus-que-parfait',
  'futur-anterieur': 'au futur antérieur',
  conditionnel: 'au conditionnel présent'
};

/** [participe, auxiliaire, conditionnel il, conditionnel ils]. */
const VERBES = exports.VERBES = {
  chanter: ['chanté', 'avoir', 'chanterait', 'chanteraient'],
  finir: ['fini', 'avoir', 'finirait', 'finiraient'],
  prendre: ['pris', 'avoir', 'prendrait', 'prendraient'],
  faire: ['fait', 'avoir', 'ferait', 'feraient'],
  voir: ['vu', 'avoir', 'verrait', 'verraient'],
  être: ['été', 'avoir', 'serait', 'seraient'],
  avoir: ['eu', 'avoir', 'aurait', 'auraient'],
  aller: ['allé', 'être', 'irait', 'iraient'],
  venir: ['venu', 'être', 'viendrait', 'viendraient'],
  partir: ['parti', 'être', 'partirait', 'partiraient']
};
const AUX = {
  avoir: {
    'passe-compose': ['a', 'ont'],
    'plus-que-parfait': ['avait', 'avaient'],
    'futur-anterieur': ['aura', 'auront']
  },
  être: {
    'passe-compose': ['est', 'sont'],
    'plus-que-parfait': ['était', 'étaient'],
    'futur-anterieur': ['sera', 'seront']
  }
};

/** La forme d'un verbe à un temps, pour il (p = 0) ou ils (p = 1). */
function conjuguer(verbe, temps, p, auxiliaire = VERBES[verbe][1]) {
  const [participe,, condIl, condIls] = VERBES[verbe];
  if (temps === 'conditionnel') return p ? condIls : condIl;
  // Avec être, le participe s'accorde : ils sont allés.
  const accord = auxiliaire === 'être' && p ? 's' : '';
  return `${AUX[auxiliaire][temps][p]} ${participe}${accord}`;
}
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const temps = melanger([...TEMPS, ...TEMPS]);
  const verbes = melanger(Object.keys(VERBES));
  return temps.map((t, i) => {
    const verbe = verbes[i % verbes.length];
    const p = entre(0, 1);
    const bonne = conjuguer(verbe, t, p);
    const candidats = [];
    // Le mauvais auxiliaire, pour les verbes qui prennent être.
    if (VERBES[verbe][1] === 'être' && t !== 'conditionnel') candidats.push([conjuguer(verbe, t, p, 'avoir'), 'auxiliaire']);
    candidats.push([conjuguer(verbe, t, 1 - p), 'personne']);
    melanger(TEMPS.filter(x => x !== t)).forEach(x => candidats.push([conjuguer(verbe, x, p), x]));
    const choix = [bonne];
    const pieges = {};
    candidats.forEach(([f, sens]) => {
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
  'passe-compose': 'Conjugue ce verbe au passé composé.',
  'plus-que-parfait': 'Conjugue ce verbe au plus-que-parfait.',
  'futur-anterieur': 'Conjugue ce verbe au futur antérieur.',
  conditionnel: 'Conjugue ce verbe au conditionnel présent.',
  'choisi-auxiliaire': 'Ce verbe dit un mouvement : il se conjugue avec l’auxiliaire être, pas avoir.',
  'choisi-personne': 'Le temps est bon, mais regarde le sujet : un seul, ou plusieurs ?',
  'choisi-passe-compose': 'Ça, c’est le passé composé : l’auxiliaire au présent. Regarde bien le temps demandé.',
  'choisi-plus-que-parfait': 'Ça, c’est le plus-que-parfait : l’auxiliaire à l’imparfait. Regarde bien le temps demandé.',
  'choisi-futur-anterieur': 'Ça, c’est le futur antérieur : l’auxiliaire au futur. Regarde bien le temps demandé.',
  'choisi-conditionnel': 'Ça, c’est le conditionnel : un seul mot, avec le r du futur et la fin de l’imparfait. Regarde bien le temps demandé.'
};