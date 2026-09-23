const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PHRASES = exports.MANCHES = void 0;
exports.bilan = bilan;
exports.cotes = cotes;
exports.perimetre = void 0;
exports.serie = serie;
exports.verdict = verdict;
/**
 * LE TOUR DU JARDIN — le deuxième nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_MES_PERIMETRE — « Calculer le périmètre d'un polygone »
 *
 * LE JEU. Un jardin dessiné — rectangle, carré, triangle ou pentagone —, la
 * longueur de chaque côté écrite dessus. Combien de mètres de clôture pour en
 * faire le tour ? L'enfant choisit parmi trois.
 *
 * LES PIÈGES DU CE2 :
 *   - OUBLIER DES CÔTÉS : sur un rectangle, deux longueurs sont écrites et
 *     l'enfant n'additionne que celles-là (3 + 5 = 8 au lieu de 16) ;
 *   - MULTIPLIER : longueur × largeur, c'est l'aire — une autre grandeur, pour
 *     plus tard.
 *
 * SUR LE RECTANGLE, DEUX CÔTÉS SEULEMENT PORTENT LEUR LONGUEUR, comme dans les
 * manuels : savoir que les côtés opposés sont égaux fait partie du calcul.
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

/** Les côtés d'une figure, dans l'ordre du tour. */
function cotes(f) {
  if (f.forme === 'rectangle') return [f.a, f.b, f.a, f.b];
  if (f.forme === 'carre') return [f.a, f.a, f.a, f.a];
  return f.cotes;
}
const perimetre = f => cotes(f).reduce((s, c) => s + c, 0);

/**
 * Huit jardins : deux rectangles, deux carrés, deux triangles, deux
 * pentagones — et pour chacun, le bon périmètre et deux pièges.
 */
exports.perimetre = perimetre;
function serie(graine = Date.now()) {
  const tirer = suite(graine);
  const entre = (a, b) => a + Math.floor(tirer() * (b - a + 1));
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const figures = [];
  for (let k = 0; k < 2; k += 1) {
    let a;
    let b;
    do {
      a = entre(3, 9);
      b = entre(2, 8);
    } while (a === b);
    figures.push({
      forme: 'rectangle',
      a,
      b
    });
    figures.push({
      forme: 'carre',
      a: entre(2, 9)
    });
    figures.push({
      forme: 'triangle',
      cotes: [entre(3, 8), entre(3, 8), entre(3, 8)]
    });
    figures.push({
      forme: 'pentagone',
      cotes: [entre(2, 6), entre(2, 6), entre(2, 6), entre(2, 6), entre(2, 6)]
    });
  }
  return melanger(figures).map(f => {
    const bon = perimetre(f);
    let oubli;
    let produit;
    if (f.forme === 'rectangle') {
      oubli = f.a + f.b;
      produit = f.a * f.b;
    } else if (f.forme === 'carre') {
      oubli = f.a;
      produit = f.a * f.a;
    } else {
      oubli = bon - f.cotes[f.cotes.length - 1];
      produit = bon + f.cotes[0];
    }
    const pieges = [...new Set([oubli, produit].filter(x => x !== bon))];
    while (pieges.length < 2) pieges.push(bon + pieges.length + 2);
    return {
      ...f,
      bonne: bon,
      choix: melanger([bon, ...pieges]),
      oubli,
      produit
    };
  });
}

/** Juste, ou le piège : des côtés oubliés, ou une multiplication. */
function verdict(m, choix) {
  if (choix === m.bonne) return 'juste';
  if (choix === m.oubli) return m.forme === 'rectangle' || m.forme === 'carre' ? 'cotes-caches' : 'oubli';
  if (choix === m.produit) return m.forme === 'rectangle' || m.forme === 'carre' ? 'produit' : 'double';
  return 'oubli';
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
  consigne: 'Combien de mètres de clôture pour faire le tour du jardin ?',
  'cotes-caches': 'Tu n’as pas compté tous les côtés : les côtés d’en face ont la même longueur.',
  oubli: 'Il manque un côté. Fais le tour complet, en ajoutant chaque côté.',
  produit: 'Pour faire le tour, on additionne les côtés, on ne les multiplie pas.',
  double: 'Tu as compté un côté deux fois. Fais le tour une seule fois.'
};