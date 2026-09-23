const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.avecArticle = exports.PHRASES = exports.MANCHES = void 0;
exports.bilan = bilan;
exports.ecrire = ecrire;
exports.serie = serie;
exports.verdict = verdict;
/**
 * LES BOUTEILLES — le quatrième nouveau jeu de maths du CE2.
 *
 * Voulu par Camara le 21/09/2026.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE2_MES_CONTENANCE — « Comparer et mesurer des contenances »
 *
 * TROIS SORTES DE MANCHES :
 *   1. CONVERTIR (3) : 1 L = ? cL, 2 L 50 cL = ? cL, 300 cL = ? L.
 *   2. COMPARER (3) : trois récipients, lequel contient le plus ? Le piège :
 *      le plus grand NOMBRE — 80 cL paraît plus que 1 L.
 *   3. REMPLIR (2) : combien de verres de 25 cL remplit une bouteille de 1 L ?
 *
 * LA SEULE ÉGALITÉ À RETENIR, ET CE QUE L'ERREUR RAPPELLE : un litre, c'est
 * cent centilitres. Tout le reste se déduit.
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

/** « 1 L 20 cL », « 75 cL », « 2 L » : une contenance écrite. */
function ecrire(cl) {
  const l = Math.floor(cl / 100);
  const reste = cl % 100;
  if (l === 0) return `${reste} cL`;
  return reste === 0 ? `${l} L` : `${l} L ${reste} cL`;
}
const RECIPIENTS = ['bouteille', 'carafe', 'bidon', 'pichet', 'gourde', 'arrosoir'];

/** « la carafe », « le bidon », « l’arrosoir ». */
const ARTICLES = {
  bouteille: 'la ',
  carafe: 'la ',
  bidon: 'le ',
  pichet: 'le ',
  gourde: 'la ',
  arrosoir: 'l’'
};
const avecArticle = nom => `${ARTICLES[nom]}${nom}`;
exports.avecArticle = avecArticle;
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
  const liste = [];

  // 1. Convertir.
  const l1 = entre(1, 5);
  liste.push({
    mode: 'convertir',
    question: `${l1} L = ? cL`,
    unite: 'cL',
    bonne: l1 * 100,
    choix: melanger([l1 * 100, l1 * 10, l1 * 1000]),
    sens: 'litre'
  });
  const l2 = entre(1, 3);
  const c2 = 5 * entre(2, 19);
  liste.push({
    mode: 'convertir',
    question: `${l2} L ${c2} cL = ? cL`,
    unite: 'cL',
    bonne: l2 * 100 + c2,
    choix: melanger([l2 * 100 + c2, l2 + c2, Number(`${l2}0${c2}`.slice(-4))]),
    sens: 'compose'
  });
  const l3 = entre(2, 6);
  liste.push({
    mode: 'convertir',
    question: `${l3 * 100} cL = ? L`,
    unite: 'L',
    bonne: l3,
    choix: melanger([l3, l3 * 10, l3 * 100]),
    sens: 'litre'
  });

  // 2. Comparer : trois récipients, un piège au plus grand nombre.
  for (let k = 0; k < 3; k += 1) {
    const grand = 100 + 10 * entre(0, 5);
    const piege = 10 * entre(6, 9);
    const petit = 10 * entre(2, 5);
    const noms = melanger(RECIPIENTS).slice(0, 3);
    const recipients = melanger([{
      nom: noms[0],
      cl: grand
    }, {
      nom: noms[1],
      cl: piege
    }, {
      nom: noms[2],
      cl: petit
    }]);
    liste.push({
      mode: 'comparer',
      recipients,
      bonne: noms[0],
      piege: noms[1],
      choix: recipients.map(r => r.nom),
      sens: 'nombre'
    });
  }

  // 3. Remplir : un verre, une bouteille.
  [[25, 100], [20, 100], [50, 200], [25, 150]].sort(() => tirer() - 0.5).slice(0, 2).forEach(([verre, bouteille]) => {
    const n = bouteille / verre;
    liste.push({
      mode: 'remplir',
      verre,
      bouteille,
      question: `Combien de verres de ${verre} cL dans ${ecrire(bouteille)} ?`,
      unite: 'verres',
      bonne: n,
      choix: melanger([n, verre, n + 1]),
      sens: 'verres'
    });
  });
  return liste;
}
function verdict(m, choix) {
  return choix === m.bonne ? 'juste' : m.sens;
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
  convertir: 'Quelle est la même quantité, dans l’autre unité ?',
  comparer: 'Quel récipient contient le plus ?',
  remplir: 'Combien de verres pour vider la bouteille ?',
  litre: 'Un litre, c’est cent centilitres.',
  compose: 'Change d’abord les litres en centilitres, puis ajoute les centilitres.',
  nombre: 'Le plus grand nombre n’est pas forcément le plus : mets tout en centilitres.',
  verres: 'Compte combien de fois le verre entre dans la bouteille.'
};