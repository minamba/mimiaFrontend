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
 * LES DURÉES DU CM1 — combien de temps ? au CM1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CM1_MES_DUREE — « Calculer avec des durées »
 *
 * TROIS SORTES DE MANCHES :
 *   - L'HEURE DE FIN (4) : 14 h 35 et 1 h 50 de film → 16 h 25 ;
 *   - DES MINUTES AUX SECONDES (2) : 2 min 30 s → 150 s ;
 *   - DES MINUTES AUX HEURES (2) : 135 min → 2 h 15 min.
 * LE PIÈGE DU CM1, C'EST LA BASE CENT : on compte les minutes comme des
 * centimes — « 15 h 85 », « 230 s », « 1 h 35 ». L'erreur rappelle que
 * soixante fait une heure (ou une minute).
 */

const MANCHES = exports.MANCHES = 8;
const heure = min => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
const duree = min => min < 60 ? `${min} min` : min % 60 === 0 ? `${min / 60} h` : `${Math.floor(min / 60)} h ${min % 60} min`;
function serie(graine = Date.now()) {
  const {
    entre,
    melanger
  } = (0, _outils.outils)(graine);
  const liste = [];

  // L'heure de fin : les minutes débordent toujours, sinon pas de piège.
  for (let i = 0; i < 4; i += 1) {
    const h = entre(8, 19);
    const m = 5 * entre(5, 11);
    const dh = entre(0, 2);
    const dm = 5 * entre(Math.ceil((65 - m) / 5), 11);
    const fin = h * 60 + m + dh * 60 + dm;
    const bonne = heure(fin);
    const centaine = `${h + dh} h ${m + dm}`;
    const sansDebord = heure(fin - 60);
    liste.push({
      consigne: 'fin',
      question: `Départ à ${heure(h * 60 + m)}, trajet de ${duree(dh * 60 + dm)}. Arrivée à ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [centaine, sansDebord], k => heure(fin + 10 * k))).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [centaine]: 'fin-soixante',
        [sansDebord]: 'fin-retenue'
      }
    });
  }

  // Des minutes aux secondes.
  for (let i = 0; i < 2; i += 1) {
    const mi = entre(1, 4);
    const s = 5 * entre(2, 11);
    const bonne = `${mi * 60 + s} s`;
    const cent = `${mi * 100 + s} s`;
    const oubli = `${mi + s} s`;
    liste.push({
      consigne: 'secondes',
      question: `${mi} min ${s} s = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [cent, oubli], k => `${mi * 60 + s + 10 * k} s`)).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [cent]: 'secondes-cent',
        [oubli]: 'secondes-oubli'
      }
    });
  }

  // Des minutes aux heures.
  for (let i = 0; i < 2; i += 1) {
    const total = 60 * entre(2, 3) + 5 * entre(1, 11);
    const bonne = duree(total);
    const cent = total % 100 === 0 ? `${total / 100} h` : `${Math.floor(total / 100)} h ${total % 100} min`;
    liste.push({
      consigne: 'heures',
      question: `${total} min = ?`,
      bonne,
      choix: melanger((0, _outils.troisChoix)(bonne, [cent], k => duree(total + 60 * k))).map(c => ({
        cle: c,
        libelle: c
      })),
      pieges: {
        [cent]: 'heures-cent'
      }
    });
  }
  return liste;
}
function verdict(m, cle) {
  var _m$pieges$cle;
  if (cle === m.bonne) return 'juste';
  return (_m$pieges$cle = m.pieges[cle]) !== null && _m$pieges$cle !== void 0 ? _m$pieges$cle : `${m.consigne}-regle`;
}
const bilan = n => (0, _outils.bilan)(n, MANCHES);
exports.bilan = bilan;
const PHRASES = exports.PHRASES = {
  fin: 'À quelle heure arrive-t-on ?',
  secondes: 'Combien de secondes en tout ?',
  heures: 'Écris cette durée en heures et en minutes.',
  'fin-soixante': 'Une heure, c’est soixante minutes : au-delà, on passe à l’heure suivante.',
  'fin-retenue': 'Les minutes ont dépassé soixante : n’oublie pas l’heure de plus.',
  'fin-regle': 'Ajoute d’abord les heures, puis les minutes, et fais une heure avec soixante minutes.',
  'secondes-cent': 'Une minute, c’est soixante secondes, pas cent.',
  'secondes-oubli': 'Change d’abord les minutes en secondes : une minute, soixante secondes.',
  'secondes-regle': 'Chaque minute vaut soixante secondes ; ajoute les secondes qui restent.',
  'heures-cent': 'Une heure, c’est soixante minutes, pas cent.',
  'heures-regle': 'Combien de fois soixante minutes ? Ce sont les heures ; le reste, ce sont les minutes.'
};