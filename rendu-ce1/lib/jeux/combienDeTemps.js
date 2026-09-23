const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PHRASES = exports.MANCHES = void 0;
exports.bilan = bilan;
exports.ecrireHeure = exports.ecrireDuree = void 0;
exports.etapes = etapes;
exports.serie = serie;
exports.verdict = verdict;
/**
 * COMBIEN DE TEMPS ? — le troisième nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_MES_DUREE — « Calculer une durée en heures et minutes »
 *
 * LE JEU. Une activité commence à une heure, finit à une autre : combien de
 * temps a-t-elle duré ? L'enfant choisit parmi trois durées.
 *
 * LES DEUX ERREURS DU CE2, PROPOSÉES EXPRÈS :
 *   - SOUSTRAIRE CHAQUE MORCEAU À PART : de 9 h 40 à 10 h 15, « 1 h et 25 min »
 *     (10 − 9 et 40 − 15) ;
 *   - COMPTER CENT MINUTES DANS L'HEURE : 10 h 15 − 9 h 40 fait 1015 − 940 =
 *     75 minutes.
 * LA MÉTHODE DE LA CLASSE EST DE PASSER PAR L'HEURE PILE — 9 h 40 → 10 h, puis
 * 10 h → 10 h 15 —, et c'est ce que le jeu montre une fois la réponse
 * trouvée.
 */

const MANCHES = exports.MANCHES = 8;

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** « 9 h 40 », « 10 h » : une heure écrite comme sur le cahier. */
const ecrireHeure = min => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
};

/** « 45 min », « 1 h 15 min », « 2 h » : une durée. */
exports.ecrireHeure = ecrireHeure;
const ecrireDuree = min => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};
exports.ecrireDuree = ecrireDuree;
const ACTIVITES = ['Le film', 'La piscine', 'Le goûter', 'La promenade', 'Le match', 'L’atelier', 'Le spectacle', 'La visite'];

/**
 * Huit durées : trois dans la même heure pour commencer, puis cinq qui
 * passent l'heure pile — c'est là que naissent les deux erreurs.
 */
function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const entre = (a, b) => a + Math.floor(tirer() * (b - a + 1));
  const liste = [];
  const vus = new Set();
  for (let i = 0; i < MANCHES; i += 1) {
    let debut;
    let fin;
    let naif;
    let cent;
    do {
      const h = entre(8, 16);
      if (i < 3) {
        const m1 = 5 * entre(0, 6);
        const m2 = m1 + 5 * entre(3, 11 - m1 / 5);
        debut = h * 60 + m1;
        fin = h * 60 + Math.min(m2, 55);
      } else {
        const m1 = 5 * entre(7, 11);
        const m2 = 5 * entre(1, 9);
        debut = h * 60 + m1;
        fin = (h + entre(1, 2)) * 60 + m2;
      }
      const dh = Math.floor(fin / 60) - Math.floor(debut / 60);
      naif = dh * 60 + Math.abs(fin % 60 - debut % 60);
      const vers100 = x => Math.floor(x / 60) * 100 + x % 60;
      cent = vers100(fin) - vers100(debut);
    } while (fin <= debut || vus.has(`${debut}-${fin}`));
    vus.add(`${debut}-${fin}`);
    const bonne = fin - debut;
    const pieges = [...new Set([naif, cent].filter(x => x !== bonne && x > 0))];
    while (pieges.length < 2) pieges.push(bonne + 10 * (pieges.length + 1));
    const choix = [bonne, ...pieges];
    for (let k = choix.length - 1; k > 0; k -= 1) {
      const j = Math.floor(tirer() * (k + 1));
      [choix[k], choix[j]] = [choix[j], choix[k]];
    }
    liste.push({
      activite: ACTIVITES[i % ACTIVITES.length],
      debut,
      fin,
      bonne,
      naif,
      cent,
      choix
    });
  }
  return liste;
}

/** Juste, ou l'erreur : morceaux soustraits à part, ou cent minutes dans l'heure. */
function verdict(m, choix) {
  if (choix === m.bonne) return 'juste';
  if (choix === m.cent) return 'cent';
  return 'naif';
}

/** Le chemin par l'heure pile : « 9 h 40 → 10 h : 20 min ; 10 h → 10 h 15 : 15 min ». */
function etapes(m) {
  const pile = Math.ceil(m.debut / 60) * 60;
  if (pile >= m.fin || pile === m.debut) return [{
    de: m.debut,
    a: m.fin
  }];
  const res = [{
    de: m.debut,
    a: pile
  }];
  if (m.fin - pile >= 60) res.push({
    de: pile,
    a: Math.floor(m.fin / 60) * 60
  });
  if (m.fin % 60 !== 0) res.push({
    de: Math.floor(m.fin / 60) * 60,
    a: m.fin
  });
  return res;
}

/** Le mot de la fin — le même dans tous les jeux. */
function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES. Elles vivent ici pour n'exister qu'en
 * un exemplaire : voir `voix/repliques.js`.
 */
const PHRASES = exports.PHRASES = {
  consigne: 'Combien de temps cela a-t-il duré ?',
  naif: 'On ne soustrait pas les minutes à part : passe par l’heure pile, puis ajoute.',
  cent: 'Attention : dans une heure, il y a soixante minutes, pas cent.'
};