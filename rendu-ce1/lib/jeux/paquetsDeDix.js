const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PHRASES = exports.MANCHES = exports.CIBLE_MIN = exports.CIBLE_MAX = void 0;
exports.bilan = bilan;
exports.consigne = consigne;
exports.decomposer = decomposer;
exports.serie = serie;
exports.verdict = verdict;
/**
 * LES PAQUETS DE DIX — le quatrième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026. Un nombre à préparer, deux gestes pour y
 * arriver : ajouter un paquet de dix, ou ajouter une bûchette.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   MATH_CP_NUM_DECOMPOSER — « Décomposer un nombre en dizaines et unités »
 *
 * DES BÛCHETTES, PARCE QUE LE DÉCOR EN EST PLEIN — même règle que les prix de
 * la marchande, qui viennent des ardoises de son stand. Le tableau de la
 * classe annonce « 1 dizaine = 10 » au-dessus d'un fagot lié de raphia. C'est
 * aussi le matériel que l'enfant manipule vraiment en classe.
 *
 * LE TOTAL N'EST JAMAIS ÉCRIT EN CHIFFRES, même règle que la marchande : le
 * calculer est le jeu. Ce qui se voit, ce sont les paquets et les bûchettes
 * posés — à l'enfant de savoir où il en est.
 *
 * ET C'EST LUI QUI ANNONCE AVOIR FINI. Rien ne se juge avant. Sans cette
 * annonce, il suffisait d'ajouter une bûchette à la fois pour passer
 * forcément par le bon nombre : le jeu s'allumait tout seul et on ne pouvait
 * pas se tromper — le reproche fait à la première boîte de 10.
 *
 * DIX BÛCHETTES DEVIENNENT TOUJOURS UN PAQUET, automatiquement, dès la
 * dixième. Ce n'est pas une facilité : c'est la règle qu'on enseigne — dix
 * unités valent une dizaine — rendue visible au moment où elle se produit,
 * plutôt qu'énoncée à part. Il ne peut donc jamais y avoir dix bûchettes
 * libres en même temps à l'écran : ce qui sort du jeu est toujours une
 * décomposition correcte, unités comprises entre 0 et 9.
 *
 * CETTE RÈGLE REND AUSSI LES PAQUETS PLUS RAPIDES QUE LES BÛCHETTES SEULES,
 * sans l'imposer. Préparer trente-quatre bûchettes une par une fonctionne —
 * avec trois passages automatiques en paquet en chemin — mais poser trois
 * paquets et quatre bûchettes revient au même nombre en sept gestes au lieu
 * de trente-quatre. Le jeu ne force pas le chemin court, il le rend évident.
 */

const MANCHES = exports.MANCHES = 8;

/** Les cibles possibles : deux chiffres, de 11 à 99. En dessous de 11, un
 * seul paquet suffirait toujours et la dizaine ne se joue plus — ce serait
 * revenir à compter jusqu'à dix, la leçon de « la boîte de 10 ». */
const CIBLE_MIN = exports.CIBLE_MIN = 11;
const CIBLE_MAX = exports.CIBLE_MAX = 99;

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
 * Décompose un nombre en dizaines et unités — la forme canonique, unités
 * toujours entre 0 et 9. Sert de référence, notamment aux tests.
 */
function decomposer(nombre) {
  return {
    paquets: Math.floor(nombre / 10),
    unites: nombre % 10
  };
}

/**
 * LA SÉRIE D'UNE PARTIE.
 *
 * Jamais deux fois la même cible d'affilée, même règle que les trois autres
 * jeux : sans cette garde, l'enfant reconstruit le même nombre sans plus
 * réfléchir.
 */
function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const liste = [];
  for (let i = 0; i < manches; i += 1) {
    let cible;
    do {
      cible = CIBLE_MIN + Math.floor(tirer() * (CIBLE_MAX - CIBLE_MIN + 1));
    } while (liste.length > 0 && cible === liste[liste.length - 1]);
    liste.push(cible);
  }
  return liste;
}

/**
 * Ce que vaut une réponse annoncée, comparée à la cible.
 *
 * LES DEUX SENS SE DISENT, « il y en a trop » et « il n'y en a pas assez »,
 * comme le train dit « trop loin » et « pas assez loin ». Jamais « raté » :
 * le mot doit dire quoi faire ensuite.
 *
 * MAIS SEULEMENT SUR ANNONCE. Pendant la construction, être en dessous de la
 * cible est l'état NORMAL — le signaler à chaque geste reviendrait à harceler
 * l'enfant pour quelque chose qui va de soi, et donnerait au passage la
 * réponse à qui avance d'une bûchette à la fois.
 */
function verdict(paquets, unites, cible) {
  const total = paquets * 10 + unites;
  if (total === cible) return 'juste';
  return total > cible ? 'trop' : 'pas-assez';
}

/**
 * Le mot de la fin, d'après le nombre de cibles atteintes du premier coup.
 *
 * Même mesure que les trois autres jeux : tout finit par être trouvé puisqu'on
 * peut corriger et réannoncer ; ce qui compte, c'est la PREMIÈRE annonce.
 * Construire, défaire et refaire avant de se décider ne coûte rien — c'est
 * même ce qu'on veut voir.
 */
function bilan(duPremierCoup, manches = MANCHES) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * LES PHRASES DU JEU, ÉCRITES ET DITES.
 *
 * Elles vivent ici et non dans l'écran pour n'exister qu'en un exemplaire :
 * l'écran affiche ce texte, et la professeure le dit mot pour mot, depuis un
 * enregistrement fait à partir de lui. Changer une phrase ici sans relancer
 * `scripts/voix-jeux.mjs` fait tomber un test : l'écrit et l'oral ne
 * peuvent pas se séparer en silence. Voir `voix/repliques.js`.
 */
function consigne(cible) {
  return `Prépare ${cible} bûchettes, en paquets de dix.`;
}
const PHRASES = exports.PHRASES = {
  trop: 'Il y en a trop. Reprends un paquet ou une bûchette.',
  pasAssez: 'Il n’y en a pas assez. Ajoute encore.'
};