const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PHRASES = exports.NOMBRES_CE2 = exports.NOMBRES = exports.MAX_PAR_COLONNE = exports.MANCHES_CONSTRUIRE = exports.MANCHES = exports.ESSAIS_AVANT_AIDE = exports.COLONNES_CE2 = exports.COLONNES = void 0;
exports.bilan = bilan;
exports.colonnes = void 0;
exports.consigneConstruire = consigneConstruire;
exports.decomposer = decomposer;
exports.leurres = leurres;
exports.leurresCE2 = leurresCE2;
exports.nombres = void 0;
exports.phraseErreur = phraseErreur;
exports.recomposer = recomposer;
exports.serie = serie;
exports.verdictConstruire = verdictConstruire;
exports.verdictLire = verdictLire;
var _nombresEnLettres = require("./nombresEnLettres.js");
/**
 * LE COFFRE DES CENTAINES — le premier nouveau jeu de maths du CE1.
 *
 * Voulu par Camara le 21/09/2026 : « code vraiment tout, je testerai tous les
 * jeux de CE1 à la fin ».
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CE1_NUM_DECOMPOSER — « Décomposer en centaines, dizaines et unités »
 *   MATH_CE1_NUM_1000       — « Lire, écrire et comparer les nombres jusqu'à
 *                              1000 »
 *
 * C'EST LA SUITE DES PAQUETS DE DIX : au CP, dix bûchettes font un paquet ;
 * au CE1, dix paquets font une plaque de cent. Le matériel est celui des
 * classes — la plaque (cent), la barre (dix), le cube (un).
 *
 * DEUX MOITIÉS DE PARTIE, LES DEUX SENS :
 *
 *   1. CONSTRUIRE (4 manches). Le nombre est écrit EN LETTRES — « trois cent
 *      quarante-deux » — et Nora le dit. L'enfant met dans le coffre les
 *      plaques, barres et cubes qu'il faut, puis annonce. Écrit en chiffres,
 *      il suffirait de recopier chaque chiffre dans sa colonne ; en lettres,
 *      il faut LIRE le nombre, et c'est la compétence.
 *
 *   2. LIRE LE COFFRE (4 manches). Le coffre est rempli ; l'enfant choisit
 *      parmi trois nombres écrits en chiffres.
 *
 * LE ZÉRO EST LE PIÈGE DU CE1 : « deux cent cinq » s'écrit 205, pas 25. Un
 * nombre sur deux porte donc un zéro, en dizaines ou en unités, et à la
 * lecture l'un des leurres est toujours le nombre écrit sans son zéro ou
 * avec les chiffres échangés.
 *
 * L'ERREUR NOMME UNE COLONNE : « il manque des dizaines », « il y a trop de
 * centaines ». Jamais « raté ».
 *
 * AU CE2, UNE CASE DE PLUS : LES MILLIERS — Camara, le 21/09/2026. Compétence :
 *   MATH_CE2_NUM_10000 — « Lire, écrire et comparer les nombres jusqu'à
 *   10 000 »
 * Le gros cube de mille rejoint la plaque, la barre et le cube. Les pièges
 * restent les mêmes, un cran plus loin : le zéro (3 080 et non 380) et les
 * chiffres échangés.
 */

const MANCHES = exports.MANCHES = 8;
const MANCHES_CONSTRUIRE = exports.MANCHES_CONSTRUIRE = 4;
const ESSAIS_AVANT_AIDE = exports.ESSAIS_AVANT_AIDE = 3;
const MAX_PAR_COLONNE = exports.MAX_PAR_COLONNE = 9;

/** Les trois colonnes, de la plus grande à la plus petite. */
const COLONNES = exports.COLONNES = [{
  cle: 'centaines',
  valeur: 100,
  piece: 'plaque'
}, {
  cle: 'dizaines',
  valeur: 10,
  piece: 'barre'
}, {
  cle: 'unites',
  valeur: 1,
  piece: 'cube'
}];

/** Au CE2, les milliers en tête. */
const COLONNES_CE2 = exports.COLONNES_CE2 = [{
  cle: 'milliers',
  valeur: 1000,
  piece: 'bloc'
}, ...COLONNES];
const colonnes = niveau => niveau === 'CE2' ? COLONNES_CE2 : COLONNES;

/**
 * LES NOMBRES À CONSTRUIRE — une liste relue, pas un tirage : chacun est dit
 * par Nora, donc enregistré. La moitié porte un zéro.
 */
exports.colonnes = colonnes;
const NOMBRES = exports.NOMBRES = [342, 205, 470, 518, 136, 609, 257, 380, 703, 160, 925, 431, 812, 290, 107, 654, 768, 350, 501, 243, 876, 419, 630, 195, 902, 327, 560, 408];

/** Les nombres du CE2 : quatre chiffres, et un zéro dans la moitié d'entre eux. */
const NOMBRES_CE2 = exports.NOMBRES_CE2 = [3480, 2057, 1306, 4512, 7020, 5634, 8105, 2749, 6300, 1275, 9041, 3862, 4708, 2193, 5016, 7354, 1620, 8437, 3009, 6581, 2460, 9173, 4035, 1853, 7502, 5249, 6907, 3316];

/** La liste d'une classe. */
const nombres = niveau => niveau === 'CE2' ? NOMBRES_CE2 : NOMBRES;

/** Un nombre, colonne par colonne : 342 → { centaines: 3, dizaines: 4, unites: 2 }. */
exports.nombres = nombres;
function decomposer(n) {
  return {
    milliers: Math.floor(n / 1000),
    centaines: Math.floor(n / 100) % 10,
    dizaines: Math.floor(n / 10) % 10,
    unites: n % 10
  };
}
function recomposer({
  milliers = 0,
  centaines,
  dizaines,
  unites
}) {
  return milliers * 1000 + centaines * 100 + dizaines * 10 + unites;
}

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/**
 * LES TROIS NOMBRES PROPOSÉS À LA LECTURE : le bon, et deux leurres qui sont
 * les erreurs d'un enfant de sept ans.
 *   - dizaines et unités échangées : 342 → 324 ;
 *   - le zéro oublié ou déplacé : 205 → 25 ou 250 ; sans zéro, les centaines
 *     et les dizaines échangées : 342 → 432.
 */
function leurres(n) {
  const {
    centaines: c,
    dizaines: d,
    unites: u
  } = decomposer(n);
  const candidats = [recomposer({
    centaines: c,
    dizaines: u,
    unites: d
  })];
  if (d === 0) candidats.push(c * 10 + u, recomposer({
    centaines: c,
    dizaines: u,
    unites: 0
  }));else if (u === 0) candidats.push(c * 10 + d, recomposer({
    centaines: c,
    dizaines: 0,
    unites: d
  }));
  candidats.push(recomposer({
    centaines: d || c,
    dizaines: c,
    unites: u
  }), n + 100, n - 10);
  const choisis = [];
  candidats.forEach(x => {
    if (choisis.length < 2 && x !== n && x > 0 && x < 1000 && !choisis.includes(x)) choisis.push(x);
  });
  return choisis;
}

/**
 * LES LEURRES DU CE2 : un chiffre voisin échangé avec le suivant, et le zéro
 * oublié ou déplacé — 3 480 lu 348 ou 3 408.
 */
function leurresCE2(n) {
  const chiffres = String(n).split('');
  const candidats = [];
  const zero = chiffres.indexOf('0', 1);
  if (zero > 0) {
    candidats.push(Number(chiffres.filter((_, i) => i !== zero).join('')));
    const deplace = [...chiffres];
    const voisin = zero === chiffres.length - 1 ? zero - 1 : zero + 1;
    [deplace[zero], deplace[voisin]] = [deplace[voisin], deplace[zero]];
    candidats.push(Number(deplace.join('')));
  }
  for (let i = chiffres.length - 2; i >= 0; i -= 1) {
    const e = [...chiffres];
    [e[i], e[i + 1]] = [e[i + 1], e[i]];
    if (e[0] !== '0') candidats.push(Number(e.join('')));
  }
  // Au cas où deux chiffres voisins sont égaux : un millier de trop.
  candidats.push(n + 1000 < 10000 ? n + 1000 : n - 1000);
  const choisis = [];
  candidats.forEach(x => {
    if (choisis.length < 2 && x !== n && x > 0 && !choisis.includes(x)) choisis.push(x);
  });
  return choisis;
}

/**
 * LA SÉRIE D'UNE PARTIE : huit nombres différents de la liste, quatre à
 * construire puis quatre à lire. À la lecture, les trois propositions sont
 * mélangées.
 */
function serie(graine = Date.now(), niveau = 'CE1') {
  const tirer = suite(graine);
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  const leurresDe = niveau === 'CE2' ? leurresCE2 : leurres;
  return melanger(nombres(niveau)).slice(0, MANCHES).map((n, i) => i < MANCHES_CONSTRUIRE ? {
    mode: 'construire',
    nombre: n
  } : {
    mode: 'lire',
    nombre: n,
    choix: melanger([n, ...leurresDe(n)])
  });
}

/**
 * Ce que vaut un coffre construit : la première colonne fausse, de la plus
 * grande à la plus petite, et son sens.
 */
function verdictConstruire(coffre, n, niveau = 'CE1') {
  const attendu = decomposer(n);
  const faute = colonnes(niveau).find(c => coffre[c.cle] !== attendu[c.cle]);
  if (!faute) return {
    sens: 'juste'
  };
  return {
    sens: coffre[faute.cle] < attendu[faute.cle] ? 'plus' : 'moins',
    colonne: faute.cle
  };
}

/** Ce que vaut un nombre choisi à la lecture : la première colonne qui diffère. */
function verdictLire(choix, n, niveau = 'CE1') {
  if (choix === n) return {
    sens: 'juste'
  };
  const a = decomposer(choix);
  const b = decomposer(n);
  return {
    sens: 'relire',
    colonne: colonnes(niveau).find(c => a[c.cle] !== b[c.cle]).cle
  };
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
function consigneConstruire(n) {
  return `Mets dans le coffre le nombre ${(0, _nombresEnLettres.enLettres)(n)}.`;
}
const NOMS = {
  milliers: 'milliers',
  centaines: 'centaines',
  dizaines: 'dizaines',
  unites: 'unités'
};
function phraseErreur(sens, colonne) {
  if (sens === 'plus') return `Il manque des ${NOMS[colonne]}.`;
  if (sens === 'moins') return `Il y a trop de ${NOMS[colonne]}.`;
  return `Compte encore les ${NOMS[colonne]}.`;
}
const PHRASES = exports.PHRASES = {
  consigneLire: 'Quel nombre est dans le coffre ?',
  aide: 'Regarde : une plaque vaut cent, une barre vaut dix, un cube vaut un.',
  aideCE2: 'Regarde : un gros cube vaut mille, une plaque cent, une barre dix, un petit cube un.'
};