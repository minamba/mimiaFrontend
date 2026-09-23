const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = exports.PHRASES = exports.MANCHES = void 0;
exports.serie = serie;
exports.verdict = verdict;
var _outils = require("./outils.js");
/**
 * LES PROBLÈMES DE DURÉE DU CM2 — combien de temps ? au CM2.
 *
 * Voulu par Camara le 21/09/2026 : « attaque le CM2 ».
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM2_MES_DUREE — « Résoudre un problème impliquant des durées »
 *
 * AU CM1, ON AVANÇAIT DANS LE TEMPS ; AU CM2, ON RECULE ET ON MESURE :
 *   - L'HEURE DE DÉPART (3) : le film finit à 16 h 20 et dure 1 h 45 ; il a
 *     commencé à 14 h 35. LE PIÈGE : « 14 h 75 », la soustraction faite comme
 *     avec des centaines ;
 *   - LA DURÉE ENTRE DEUX HEURES (3) : de 14 h 45 à 16 h 20, 1 h 35. LE
 *     PIÈGE : 1 h 75 (1620 − 1445, comme des nombres ordinaires) ;
 *   - PAR-DESSUS MINUIT OU D'UN JOUR À L'AUTRE (2) : du lundi 9 h au mardi
 *     11 h, 26 heures. Le piège : oublier le jour entier.
 */

const MANCHES = exports.MANCHES = 8;
const heure = min => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
const duree = min => min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${min % 60} min`;
function serie(graine = Date.now()) {
  const {
    entre,
    au,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];

  // Des minutes qui obligent à « emprunter » une heure.
  const tirer = () => {
    const fin = entre(10, 21) * 60 + 5 * entre(0, 6);
    const d = 60 * entre(1, 2) + 5 * entre(7, 11);
    return [fin - d, fin, d];
  };
  for (let i = 0; i < 3; i += 1) {
    const [debut, fin, d] = tirer();
    const bonne = heure(debut);
    // 16 h 20 − 1 h 45 fait « en centaines » : 1620 − 145 = 1475 → 14 h 75.
    const centaine = String(Math.floor(fin / 60) * 100 + fin % 60 - (Math.floor(d / 60) * 100 + d % 60));
    const faux = `${centaine.slice(0, -2)} h ${centaine.slice(-2)}`;
    const retenue = heure(debut + 60);
    liste.push({
      consigne: 'depart',
      question: `Le film finit à ${heure(fin)} et dure ${duree(d)}. À quelle heure a-t-il commencé ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [faux, retenue], k => heure(debut - 10 * k))).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [faux]: 'cent',
        [retenue]: 'depart-heure'
      }
    });
  }
  for (let i = 0; i < 3; i += 1) {
    const [debut, fin, d] = tirer();
    const bonne = duree(d);
    const brut = Math.floor(fin / 60) * 100 + fin % 60 - (Math.floor(debut / 60) * 100 + debut % 60);
    const faux = `${Math.floor(brut / 100)} h ${brut % 100} min`;
    const plus = duree(d + 60);
    liste.push({
      consigne: 'ecart',
      question: `De ${heure(debut)} à ${heure(fin)}, combien de temps ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [faux, plus], k => duree(d + 10 * k))).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [faux]: 'cent',
        [plus]: 'ecart-heure'
      }
    });
  }
  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
  for (let i = 0; i < 2; i += 1) {
    const j = au([0, 1, 2, 3]);
    const h1 = entre(7, 12);
    const h2 = entre(h1 + 1, 18);
    const bonne = `${24 + h2 - h1} h`;
    const oubli = `${h2 - h1} h`;
    const double = `${48 + h2 - h1} h`;
    liste.push({
      consigne: 'jours',
      question: `Du ${jours[j]} ${h1} h au ${jours[j + 1]} ${h2} h, combien d’heures ?`,
      bonne,
      choix: melanger([bonne, oubli, double]).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [oubli]: 'jours-oubli',
        [double]: 'jours-regle'
      }
    });
  }
  return melanger(liste);
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (cle === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  depart: 'Remonte le temps : à quelle heure est-ce que ça a commencé ?',
  ecart: 'Combien de temps s’est-il passé entre ces deux heures ?',
  jours: 'Combien d’heures entre ces deux moments ?',
  cent: 'Les heures ne se calculent pas comme des centaines : une heure, c’est soixante minutes. Passe par l’heure pile.',
  'depart-heure': 'Vérifie les heures : ajoute la durée à ton heure de départ, tu dois retomber sur l’heure de fin.',
  'depart-regle': 'Recule d’abord des heures, puis des minutes, en passant par l’heure pile.',
  'ecart-heure': 'Compte les heures pleines une par une, puis les minutes qui restent.',
  'ecart-regle': 'Avance jusqu’à l’heure pile, puis compte les heures, puis les minutes qui restent.',
  'jours-oubli': 'On a changé de jour : une journée entière, c’est vingt-quatre heures de plus.',
  'jours-regle': 'Du premier jour au lendemain, même heure : vingt-quatre heures. Puis ajoute ce qui reste.'
};