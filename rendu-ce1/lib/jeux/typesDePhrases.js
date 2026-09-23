const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TYPES = exports.PHRASES_JEU = exports.PHRASES = exports.MANCHES = void 0;
exports.bilan = bilan;
exports.serie = serie;
exports.signe = void 0;
exports.verdict = verdict;
/**
 * RACONTE, QUESTION OU ORDRE ? — le deuxième nouveau jeu de français du CE1.
 *
 * Voulu par Camara le 21/09/2026 (proposé sous le nom « Point, question ou
 * ordre ? »).
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE1_LANG_TYPES — « Distinguer les phrases déclarative, interrogative et
 *   impérative »
 *
 * LE JEU. Une phrase écrite SANS SON SIGNE DE FIN ; l'enfant dit si elle
 * raconte, si elle pose une question, ou si elle donne un ordre. Le signe
 * n'est montré qu'une fois la réponse trouvée.
 *
 * ON CHOISIT UN TYPE, PAS UN SIGNE : un ordre peut finir par un point
 * (« Range ta chambre. ») comme par un point d'exclamation. Demander « . ou
 * ! » apprendrait une fausse règle. Les indices sont ceux du CE1 : un mot
 * qui interroge (où, qui, quel, pourquoi, est-ce que), un sujet après le
 * verbe (« Aimes-tu »), ou PERSONNE devant le verbe (« Ferme la porte »).
 *
 * ADRIEN NE LIT PAS LA PHRASE : son intonation donnerait la réponse, et la
 * compétence est de la reconnaître à l'écrit.
 */

const MANCHES = exports.MANCHES = 9;
const TYPES = exports.TYPES = [{
  cle: 'raconte',
  libelle: 'Elle raconte',
  signe: '.'
}, {
  cle: 'question',
  libelle: 'Elle pose une question',
  signe: '?'
}, {
  cle: 'ordre',
  libelle: 'Elle donne un ordre',
  signe: '.'
}];
const PHRASES_JEU = exports.PHRASES_JEU = [{
  texte: 'Le chat dort sur le lit',
  type: 'raconte'
}, {
  texte: 'Nous partons en vacances demain',
  type: 'raconte'
}, {
  texte: 'Il pleut depuis ce matin',
  type: 'raconte'
}, {
  texte: 'Ma sœur aime les bonbons',
  type: 'raconte'
}, {
  texte: 'Le bus arrive à huit heures',
  type: 'raconte'
}, {
  texte: 'J’ai lu un beau livre',
  type: 'raconte'
}, {
  texte: 'Où est ton cartable',
  type: 'question'
}, {
  texte: 'Est-ce que tu viens jouer',
  type: 'question'
}, {
  texte: 'Quel âge as-tu',
  type: 'question'
}, {
  texte: 'Aimes-tu les pommes',
  type: 'question'
}, {
  texte: 'Pourquoi le ciel est-il bleu',
  type: 'question'
}, {
  texte: 'Qui a mangé le gâteau',
  type: 'question'
}, {
  texte: 'Range ta chambre',
  type: 'ordre'
}, {
  texte: 'Ferme la porte',
  type: 'ordre'
}, {
  texte: 'Viens ici tout de suite',
  type: 'ordre'
}, {
  texte: 'Mange ta soupe',
  type: 'ordre'
}, {
  texte: 'Écoute bien la maîtresse',
  type: 'ordre'
}, {
  texte: 'Lave-toi les mains',
  type: 'ordre'
}];

/** Le signe de fin de chaque phrase, une fois trouvée. */
const signe = p => p.type === 'question' ? '?' : '.';

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
exports.signe = signe;
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Neuf phrases, trois de chaque type, mêlées. */
function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  return melanger(TYPES.flatMap(t => melanger(PHRASES_JEU.filter(p => p.type === t.cle)).slice(0, 3)));
}
function verdict(p, choix) {
  return choix === p.type ? 'juste' : p.type;
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
  consigne: 'Lis la phrase. Est-ce qu’elle raconte, pose une question, ou donne un ordre ?',
  // L'indice, du côté du type qu'il fallait trouver.
  raconte: 'Cette phrase dit ce qui se passe : elle raconte. Elle finit par un point.',
  question: 'Cette phrase attend une réponse : c’est une question. Elle finit par un point d’interrogation.',
  ordre: 'Cette phrase dit à quelqu’un quoi faire, et il n’y a personne devant le verbe : c’est un ordre.'
};