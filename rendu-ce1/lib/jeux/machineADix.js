const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PHRASES = exports.MANCHES_SORTIE = exports.MANCHES = exports.ESSAIS_AVANT_AIDE = exports.ERREURS = void 0;
exports.bilan = bilan;
exports.reponse = exports.facteurDe = void 0;
exports.serie = serie;
exports.verdict = verdict;
/**
 * LA MACHINE À DIX — le quatrième nouveau jeu de maths du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE1_MULT_DIX — « Multiplier un nombre par 10 »
 *
 * LE JEU. Une machine multiplie par dix ce qu'on y met.
 *
 *   1. CE QUI SORT (5 manches) : un nombre entre, l'enfant choisit ce qui
 *      sort. D'abord des nombres à un chiffre (7 → 70), puis à deux (23 →
 *      230).
 *
 *   2. CE QUI EST ENTRÉ (3 manches) : un nombre sort, l'enfant choisit ce
 *      qu'on avait mis dedans. Remonter la machine oblige à comprendre ce
 *      qu'elle fait, au lieu d'appliquer une recette.
 *
 * LES PIÈGES DU CE1 :
 *   - ajouter dix au lieu de multiplier (7 → 17) ;
 *   - écrire deux zéros (7 → 700).
 *
 * LA RÈGLE DITE EST CELLE DU SENS, PAS LA RECETTE : « chaque unité devient
 * une dizaine ». « On ajoute un zéro » viendra tout seul — mais un enfant
 * qui n'a que la recette l'appliquera un jour à 2,5.
 *
 * AU CE2, LA MACHINE À CENT — Camara, le 21/09/2026. Compétence :
 *   MATH_CE2_MULT_DIX_CENT — « Multiplier un nombre entier par 10 ou par 100 »
 * Une manche sur deux passe par la machine à cent. Les pièges changent de
 * sens : « + 100 », et UN seul zéro au lieu de deux.
 */

const MANCHES = exports.MANCHES = 8;
const MANCHES_SORTIE = exports.MANCHES_SORTIE = 5;
const ESSAIS_AVANT_AIDE = exports.ESSAIS_AVANT_AIDE = 2;

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}
function serie(graine = Date.now(), niveau = 'CE1') {
  const tirer = suite(graine);
  const entre = (min, max) => min + Math.floor(tirer() * (max - min + 1));
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const vus = new Set();
  const liste = [];
  for (let i = 0; i < MANCHES; i += 1) {
    let n;
    do {
      // Un chiffre pour commencer, deux ensuite ; au retour, de tout.
      if (i < 3) n = entre(2, 9);else if (i < MANCHES_SORTIE) n = entre(11, 99);else n = tirer() < 0.5 ? entre(2, 9) : entre(11, 99);
    } while (vus.has(n) || n % 10 === 0);
    vus.add(n);

    // Au CE2, une manche sur deux passe par la machine à cent.
    const facteur = niveau === 'CE2' && i % 2 === 1 ? 100 : 10;
    const sort = n * facteur;
    if (i < MANCHES_SORTIE) {
      const piegeZeros = facteur === 10 ? n * 100 : n * 10;
      liste.push({
        mode: 'sortie',
        entree: n,
        facteur,
        choix: melanger([sort, n + facteur, piegeZeros])
      });
    } else {
      liste.push({
        mode: 'entree',
        entree: n,
        facteur,
        choix: melanger([n, sort, sort / 10 === n ? sort - facteur : sort / 10])
      });
    }
  }
  return liste;
}

/** La bonne réponse d'une manche. */
const facteurDe = m => {
  var _m$facteur;
  return (_m$facteur = m.facteur) !== null && _m$facteur !== void 0 ? _m$facteur : 10;
};
exports.facteurDe = facteurDe;
const reponse = m => m.mode === 'sortie' ? m.entree * facteurDe(m) : m.entree;

/** Ce que vaut un nombre choisi : juste, ou le piège. */
exports.reponse = reponse;
function verdict(choix, m) {
  if (choix === reponse(m)) return 'juste';
  if (m.mode === 'entree') return 'remonter';
  if (facteurDe(m) === 100) return choix === m.entree + 100 ? 'plus-cent' : 'un-zero';
  return choix === m.entree + 10 ? 'plus-dix' : 'deux-zeros';
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
  sortie: 'La machine multiplie par dix. Qu’est-ce qui sort ?',
  entree: 'Ce nombre est sorti de la machine. Qu’est-ce qu’on avait mis dedans ?',
  plusDix: 'La machine ne rajoute pas dix : chaque unité devient une dizaine.',
  deuxZeros: 'C’est trop : fois dix, chaque unité devient une dizaine, pas une centaine.',
  remonter: 'Mets ce nombre dans la machine dans ta tête : que sortirait-il ?',
  aide: 'Regarde : chaque unité est devenue une dizaine.',
  sortieCent: 'La machine multiplie par cent. Qu’est-ce qui sort ?',
  entreeCent: 'Ce nombre est sorti de la machine à cent. Qu’est-ce qu’on avait mis dedans ?',
  plusCent: 'La machine ne rajoute pas cent : chaque unité devient une centaine.',
  unZero: 'Fois cent, chaque unité devient une centaine : il faut deux zéros.',
  aideCent: 'Regarde : chaque unité est devenue une centaine.'
};
const ERREURS = exports.ERREURS = {
  'plus-dix': 'plusDix',
  'deux-zeros': 'deuxZeros',
  remonter: 'remonter',
  'plus-cent': 'plusCent',
  'un-zero': 'unZero'
};