const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TABLES_CE2 = exports.TABLES = exports.PHRASES = exports.MANCHES = exports.JUMELLES = exports.ESSAIS_AVANT_AIDE = void 0;
exports.bilan = bilan;
exports.methode = methode;
exports.propositions = propositions;
exports.question = question;
exports.questionJumelle = questionJumelle;
exports.serie = serie;
exports.tablesDe = void 0;
/**
 * LA COURSE DES TABLES — le deuxième nouveau jeu de maths du CE1.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE1_TABLES_BASE       — « Connaître les tables de 2, 3, 4 et 5 »
 *   MATH_CE1_MULT_COMMUTATIVE  — « Savoir que la multiplication est
 *                                 commutative »
 *
 * LE JEU. Dix questions, une voiture sur une piste de dix cases. Chaque
 * bonne réponse du premier coup la fait avancer d'une case ; après une
 * erreur, elle reste où elle est — on ne recule jamais, un enfant de sept ans
 * n'a pas à perdre ce qu'il a gagné.
 *
 * PAS DE CHRONOMÈTRE. « Connaître » ses tables, c'est répondre sans compter
 * sur ses doigts, mais un compte à rebours met un enfant qui hésite en
 * échec au moment précis où il réfléchit. La course, c'est la piste.
 *
 * DEUX QUESTIONS SUR DIX SONT DES JUMELLES : « 4 × 3 = 12. Et 3 × 4 ? ».
 * Elles reprennent un calcul déjà trouvé dans la partie, nombres échangés :
 * c'est la commutativité, montrée plutôt qu'énoncée. Un enfant qui recompte
 * au lieu de reconnaître le même résultat n'a pas encore compris la règle.
 *
 * LES LEURRES SONT DES ERREURS DE CE1 : le résultat voisin dans la table
 * (3 × 4 → 9 ou 15, un cran à côté), et l'addition au lieu de la
 * multiplication (3 × 4 → 7).
 *
 * L'ERREUR DONNE UNE MÉTHODE, pas la réponse : « Compte de 3 en 3. »
 *
 * AU CE2, TOUTES LES TABLES, jusqu'à 9 × 10 — Camara, le 21/09/2026.
 * Compétence : MATH_CE2_TABLES — « Connaître toutes les tables de
 * multiplication ». Même piste, mêmes jumelles, mêmes leurres.
 */

const MANCHES = exports.MANCHES = 10;
const TABLES = exports.TABLES = [2, 3, 4, 5];
const TABLES_CE2 = exports.TABLES_CE2 = [2, 3, 4, 5, 6, 7, 8, 9];
const tablesDe = niveau => niveau === 'CE2' ? TABLES_CE2 : TABLES;
exports.tablesDe = tablesDe;
const ESSAIS_AVANT_AIDE = exports.ESSAIS_AVANT_AIDE = 2;

/** Les places des deux questions jumelles dans la partie. */
const JUMELLES = exports.JUMELLES = [4, 8];

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Les trois résultats proposés : le bon, un voisin dans la table, et l'addition. */
function propositions(a, b, tirer) {
  const r = a * b;
  const table = Math.min(a, b);
  const voisin = tirer() < 0.5 && r - table > 0 ? r - table : r + table;
  const autres = [voisin, a + b, r + 1, r - 1].filter((x, i, l) => x > 0 && x !== r && l.indexOf(x) === i);
  const liste = [r, autres[0], autres[1]];
  for (let i = liste.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [liste[i], liste[j]] = [liste[j], liste[i]];
  }
  return liste;
}

/**
 * LA SÉRIE D'UNE PARTIE : huit calculs différents, des quatre tables, de
 * 2 × 2 à 5 × 10 — « fois 1 » ne demande rien —, et deux jumelles aux
 * places prévues, prises parmi les calculs déjà posés dont les deux nombres
 * diffèrent.
 */
function serie(graine = Date.now(), niveau = 'CE1') {
  const tirer = suite(graine);
  const faits = [];
  tablesDe(niveau).forEach(a => {
    for (let b = 2; b <= 10; b += 1) faits.push([a, b]);
  });
  for (let i = faits.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1));
    [faits[i], faits[j]] = [faits[j], faits[i]];
  }
  const liste = [];
  let k = 0;
  for (let i = 0; i < MANCHES; i += 1) {
    if (JUMELLES.includes(i)) {
      const deja = liste.filter(m => !m.jumelle && m.a !== m.b);
      const modele = deja[Math.floor(tirer() * deja.length)];
      liste.push({
        a: modele.b,
        b: modele.a,
        jumelle: true,
        modele: [modele.a, modele.b],
        choix: propositions(modele.b, modele.a, tirer)
      });
    } else {
      const [a, b] = faits[k];
      k += 1;
      liste.push({
        a,
        b,
        jumelle: false,
        choix: propositions(a, b, tirer)
      });
    }
  }
  return liste;
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
function question(a, b) {
  return `${a} fois ${b} ?`;
}
function questionJumelle(a, b) {
  return `${b} fois ${a}, ça fait ${a * b}. Et ${a} fois ${b} ?`;
}

/**
 * La méthode : compter de a en a, avec le plus petit des deux nombres — c'est
 * le plus court chemin, et la multiplication le permet.
 */
function methode(a, b) {
  const pas = Math.min(a, b);
  return `Compte de ${pas} en ${pas}.`;
}
const PHRASES = exports.PHRASES = {
  consigne: 'Choisis le bon résultat : chaque bonne réponse fait avancer ta voiture.',
  jumelle: 'Quand on échange les deux nombres, le résultat ne change pas.'
};