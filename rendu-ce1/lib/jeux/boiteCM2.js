const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = exports.BOITE = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * L'ÉGALITÉ ET LE SCHÉMA EN BARRES — la boîte mystère au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_ALG_EGALITE  — « Comprendre le signe = comme une relation entre
 *                            deux quantités »
 *   MATH_CM2_ALG_INCONNUE — « Résoudre un problème mettant en jeu un nombre
 *                            inconnu »
 *   MATH_CM2_ALG_SCHEMA   — « Modéliser un problème par un schéma en barres »
 *
 * TROIS SORTES DE MANCHES :
 *   - LA BALANCE (3) : 17 + 8 = ▢ + 10 → 15. LE PIÈGE DU CM2 : lire « = »
 *     comme « ça donne », et écrire 25 ;
 *   - « DE PLUS QUE » (3) : Léa et Tom ont 50 billes ; Léa en a 12 de plus.
 *     Tom ? On retire l'écart, puis on partage : 19. Pièges : partager sans
 *     retirer (25), retirer sans partager (38) ;
 *   - « FOIS PLUS QUE » (2) : un livre coûte 3 fois un cahier ; ensemble
 *     24 €. Le cahier ? Quatre parts égales : 6. Le piège : trois parts (8).
 * Le schéma en barres est dessiné par `BoiteMystere.js`.
 */

const MANCHES = exports.MANCHES = 8;
const BOITE = exports.BOITE = '▢';
const PRENOMS = [['Léa', 'Tom'], ['Inès', 'Hugo'], ['Nina', 'Samir'], ['Zoé', 'Paul']];
const OBJETS = [['un livre', 'un cahier'], ['un vélo', 'un casque'], ['une veste', 'un bonnet']];
function serie(graine = Date.now()) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];
  for (let i = 0; i < 3; i += 1) {
    const a = entre(12, 48);
    const b = entre(6, 19);
    const c = entre(5, a + b - 5);
    const bonne = a + b - c;
    const resultat = a + b;
    const ajout = a + b + c;
    liste.push({
      consigne: 'balance',
      question: `${a} + ${b} = ${BOITE} + ${c}`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [resultat, ajout], k => bonne + k)).map(x => ({
        cle: x,
        libelle: String(x)
      })),
      pieges: {
        [resultat]: 'balance-resultat',
        [ajout]: 'balance-ajout'
      }
    });
  }
  for (let i = 0; i < 3; i += 1) {
    const [grand, petit] = au(PRENOMS);
    const p = entre(8, 30);
    const e = entre(4, 16);
    const total = 2 * p + e;
    const partage = total / 2;
    const oubli = total - e;
    const pieges = {
      [oubli]: 'plus-moitie'
    };
    if (Number.isInteger(partage)) pieges[partage] = 'plus-egal';
    liste.push({
      consigne: 'plus',
      question: `${grand} et ${petit} ont ${total} billes en tout. ${grand} en a ${e} de plus que ${petit}. Combien ${petit} en a-t-il ?`,
      schema: {
        sorte: 'plus',
        noms: [grand, petit],
        ecart: e,
        total
      },
      bonne: p,
      choix: melanger((0, _outils.troisChoix)(p, Object.keys(pieges).map(Number), k => p + e + k - 1)).map(x => ({
        cle: x,
        libelle: String(x)
      })),
      pieges
    });
  }
  for (let i = 0; i < 2; i += 1) {
    const [cher, petit] = au(OBJETS);
    const k = entre(2, 4);
    const c = entre(3, 12);
    const total = c * (k + 1);
    const trois = total / k;
    const pieges = Number.isInteger(trois) ? {
      [trois]: 'fois-parts'
    } : {};
    liste.push({
      consigne: 'fois',
      question: `${cher[0].toUpperCase()}${cher.slice(1)} coûte ${k} fois plus cher qu’${petit}. Ensemble, ils coûtent ${total} €. Combien coûte ${petit} ?`,
      schema: {
        sorte: 'fois',
        noms: [cher, petit],
        fois: k,
        total
      },
      bonne: c,
      choix: melanger((0, _outils.troisChoix)(c, [...Object.keys(pieges).map(Number), c * k], j => c + j)).map(x => ({
        cle: x,
        libelle: `${x} €`
      })),
      pieges: {
        ...pieges,
        [c * k]: 'fois-cher'
      }
    });
  }
  return melanger(liste);
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (Number(cle) === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  balance: 'Le signe égal dit que les deux côtés valent autant. Quel nombre manque ?',
  plus: 'Lis le problème et regarde le schéma. Quel est le nombre cherché ?',
  fois: 'Lis le problème et regarde le schéma. Quel est le prix cherché ?',
  'balance-resultat': 'Le signe égal ne veut pas dire « ça donne » : les deux côtés doivent valoir autant. Il faut ajouter le nombre de droite et retomber sur le même total.',
  'balance-ajout': 'On n’ajoute pas tout : cherche ce qu’il faut mettre avec le nombre de droite pour égaler le côté gauche.',
  'balance-regle': 'Calcule le côté gauche, puis cherche ce qui manque à droite.',
  'plus-egal': 'Ils n’ont pas autant l’un que l’autre. Retire d’abord ce que l’un a en plus, puis partage en deux.',
  'plus-moitie': 'Tu as retiré l’écart, c’est bien. Il reste deux parts égales : partage en deux.',
  'plus-regle': 'Sur le schéma : retire la partie en plus, puis partage le reste en deux parts égales.',
  'fois-parts': 'Compte les parts sur le schéma : le plus cher en fait plusieurs, et le moins cher une de plus. Partage le total entre toutes.',
  'fois-cher': 'Ça, c’est le prix de l’objet le plus cher. On cherche l’autre, qui ne fait qu’une part.',
  'fois-regle': 'Compte toutes les parts égales du schéma, puis partage le total.'
};