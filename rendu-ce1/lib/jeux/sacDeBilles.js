const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = exports.COULEURS = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LE SAC DE BILLES — un jeu du CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_PROBA_ALEATOIRE   — « Reconnaître une expérience aléatoire et ses
 *                                issues possibles »
 *   MATH_CM1_PROBA_VOCABULAIRE — « Employer impossible, possible, certain,
 *                                probable »
 *
 * UN SAC, DES BILLES DE COULEUR ; on tire sans regarder. Trois questions :
 *   - IMPOSSIBLE, POSSIBLE OU CERTAIN ? (3) : une couleur absente, présente,
 *     ou la seule du sac ;
 *   - LE PLUS DE CHANCES (3) : la couleur la plus nombreuse. Le piège : la
 *     moins nombreuse ;
 *   - COMBIEN DE CHANCES SUR… ? (2) : 3 rouges sur 8 billes → « 3 sur 8 ».
 *     LE PIÈGE : « 3 sur 5 », comparer aux autres billes au lieu du total.
 * L'écran dessine le sac (`SacDeBilles.js`).
 */

const MANCHES = exports.MANCHES = 8;
const COULEURS = exports.COULEURS = ['rouge', 'bleue', 'verte', 'jaune'];
const total = sac => Object.values(sac).reduce((a, b) => a + b, 0);
function serie(graine = Date.now()) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  melanger(['impossible', 'possible', 'certain']).forEach(reponse => {
    const [c1, c2, c3] = melanger(COULEURS);
    const sac = reponse === 'certain' ? {
      [c1]: entre(4, 8)
    } : {
      [c1]: entre(2, 5),
      [c2]: entre(2, 5)
    };
    const demandee = reponse === 'impossible' ? c3 : reponse === 'possible' ? au([c1, c2]) : c1;
    liste.push({
      consigne: 'vocabulaire',
      sac,
      question: `Tirer une bille ${demandee}, c’est…`,
      bonne: reponse,
      choix: ['impossible', 'possible', 'certain'].map(c => ({
        cle: c,
        libelle: c
      }))
    });
  });
  for (let i = 0; i < 3; i += 1) {
    const [c1, c2, c3] = melanger(COULEURS);
    const [a, b, c] = melanger([entre(6, 8), entre(3, 4), 1]);
    const sac = {
      [c1]: a,
      [c2]: b,
      [c3]: c
    };
    const plus = Object.keys(sac).find(k => sac[k] === Math.max(a, b, c));
    const moins = Object.keys(sac).find(k => sac[k] === 1);
    liste.push({
      consigne: 'plus',
      sac,
      question: 'Quelle couleur as-tu le plus de chances de tirer ?',
      bonne: plus,
      choix: Object.keys(sac).map(k => ({
        cle: k,
        libelle: k
      })),
      pieges: {
        [moins]: 'plus-moins'
      }
    });
  }
  for (let i = 0; i < 2; i += 1) {
    const [c1, c2] = melanger(COULEURS);
    const n = entre(2, 5);
    // Jamais autant d'autres billes que de billes demandées : les choix se confondraient.
    const autres = n + entre(1, 3);
    const sac = {
      [c1]: n,
      [c2]: autres
    };
    const tout = total(sac);
    const bonne = `${n} sur ${tout}`;
    const faux = `${n} sur ${autres}`;
    const envers = `${autres} sur ${tout}`;
    liste.push({
      consigne: 'sur',
      sac,
      question: `Combien de chances de tirer une bille ${c1} ?`,
      bonne,
      choix: melanger([bonne, faux, envers]).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [faux]: 'sur-total',
        [envers]: 'sur-couleur'
      }
    });
  }
  return liste;
}
function verdict(m, cle) {
  var _m$pieges$cle, _m$pieges;
  if (cle === m.bonne) return 'juste';
  if (m.consigne === 'vocabulaire') return `vocabulaire-${m.bonne}`;
  return (_m$pieges$cle = (_m$pieges = m.pieges) === null || _m$pieges === void 0 ? void 0 : _m$pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  vocabulaire: 'Tu tires une bille sans regarder. Impossible, possible, ou certain ?',
  plus: 'Tu tires une bille sans regarder. Quelle couleur a le plus de chances de sortir ?',
  sur: 'Tu tires une bille sans regarder. Combien de chances as-tu ?',
  'vocabulaire-impossible': 'Il n’y a aucune bille de cette couleur dans le sac : c’est impossible.',
  'vocabulaire-possible': 'Il y en a, mais pas seulement : ça peut arriver, ou pas. C’est possible.',
  'vocabulaire-certain': 'Toutes les billes du sac sont de cette couleur : c’est certain.',
  'plus-moins': 'C’est la couleur la moins nombreuse : elle a le moins de chances de sortir.',
  'plus-regle': 'Compte les billes de chaque couleur : la plus nombreuse a le plus de chances.',
  'sur-total': 'On compare au nombre total de billes dans le sac, toutes couleurs ensemble.',
  'sur-couleur': 'Compte seulement les billes de la couleur demandée, puis le total du sac.',
  'sur-regle': 'Le nombre de billes de la couleur, sur le nombre total de billes.'
};