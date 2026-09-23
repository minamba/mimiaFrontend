const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VOIES = exports.PHRASES = exports.MANCHES = void 0;
exports.bilan = bilan;
exports.graduations = graduations;
exports.serie = serie;
exports.verdict = verdict;
exports.voieDe = voieDe;
/**
 * LE TRAIN DES NOMBRES — le troisième jeu de Mimia, pour le CP.
 *
 * Voulu par Camara le 21/09/2026. Une voie ferrée graduée, quelques bornes
 * écrites, et un wagon numéroté à accrocher au bon endroit.
 *
 * COMPÉTENCES DU RÉFÉRENTIEL (celles qui sont déjà en base, mot pour mot) :
 *   - MATH_CP_NUM_DEMI_DROITE — « Placer un nombre sur une demi-droite
 *                                graduée »
 *   - MATH_CP_NUM_SIGNES      — « Comparer et encadrer avec les signes
 *                                =, < et > »
 *   - MATH_CP_NUM_100         — « Lire, écrire et comparer les nombres
 *                                jusqu'à 100 »
 *
 * LA COMPARAISON N'EST PAS UN EXERCICE À CÔTÉ, ELLE EST DANS LE GESTE. Quand
 * l'enfant accroche son wagon trop loin, on ne lui dit pas « faux » : on lui
 * dit « trop loin », et il recule. Comparer deux nombres, c'est exactement ce
 * qu'il vient de faire — sans qu'on ait eu à écrire un seul signe < ou >.
 *
 * TROIS PALIERS, ET C'EST LA VOIE QUI CHANGE, PAS LA RÈGLE :
 *
 *   0 → 10 de 1 en 1   (repères 0, 5, 10)   — la demi-droite qu'il connaît
 *   0 → 20 de 1 en 1   (repères 0, 10, 20)  — la même, deux fois plus longue
 *   0 → 100 de 10 en 10 (repères 0, 50, 100) — les dizaines, au programme
 *
 * LES REPÈRES SONT ÉCRITS, LE RESTE NON. Tout graduer reviendrait à demander
 * de retrouver un nombre déjà affiché : il n'y aurait plus rien à placer. Sans
 * aucun repère, il n'y aurait rien pour se repérer. Trois bornes — le début,
 * le milieu, la fin — c'est ce qu'on donne en classe, et c'est ce qui rend le
 * milieu utile.
 */

/** Huit manches, comme les deux autres jeux : la durée d'attention d'un CP. */
const MANCHES = exports.MANCHES = 8;

/**
 * Les trois voies, dans l'ordre où on les rencontre.
 *
 * `depuis` est la première manche qui l'emploie. La voie s'allonge quand
 * l'enfant a compris le geste, jamais avant.
 */
const VOIES = exports.VOIES = [{
  depuis: 0,
  max: 10,
  pas: 1,
  reperes: [0, 5, 10]
}, {
  depuis: 3,
  max: 20,
  pas: 1,
  reperes: [0, 10, 20]
}, {
  depuis: 6,
  max: 100,
  pas: 10,
  reperes: [0, 50, 100]
}];

/** Un tirage reproductible — voir la note de `boiteDeDix.js`. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** La voie employée à cette manche. */
function voieDe(manche) {
  return VOIES.reduce((choisie, voie) => manche >= voie.depuis ? voie : choisie, VOIES[0]);
}

/** Toutes les graduations d'une voie, bornes comprises. */
function graduations(voie) {
  const liste = [];
  for (let n = 0; n <= voie.max; n += voie.pas) liste.push(n);
  return liste;
}

/**
 * LA SÉRIE D'UNE PARTIE.
 *
 * DEUX RÈGLES DE TIRAGE :
 *
 * 1. JAMAIS UN REPÈRE. Demander de placer 5 sur une voie où « 5 » est déjà
 *    écrit ne demande rien : il suffit de viser le chiffre. Le nombre à
 *    placer est toujours entre deux bornes écrites.
 *
 * 2. JAMAIS DEUX FOIS LE MÊME NOMBRE D'AFFILÉE, pour la raison des deux autres
 *    jeux : sans cette garde, l'enfant rejoue le même geste sans plus compter.
 */
function serie(graine = Date.now(), manches = MANCHES) {
  const tirer = suite(graine);
  const liste = [];
  for (let i = 0; i < manches; i += 1) {
    const voie = voieDe(i);
    const possibles = graduations(voie).filter(n => !voie.reperes.includes(n));
    let nombre;
    do {
      nombre = possibles[Math.floor(tirer() * possibles.length)];
    } while (liste.length > 0 && nombre === liste[liste.length - 1].nombre);
    liste.push({
      nombre,
      voie
    });
  }
  return liste;
}

/**
 * Ce que dit un wagon posé au mauvais endroit.
 *
 * ON NOMME LE SENS DE L'ERREUR, jamais « raté » — et ici ce nom EST la
 * compétence : « trop loin » et « pas assez loin », c'est plus grand et plus
 * petit. L'enfant compare sans savoir qu'il compare.
 */
function verdict(pose, nombre) {
  if (pose === nombre) return 'juste';
  return pose > nombre ? 'trop-loin' : 'pas-assez-loin';
}

/**
 * Le mot de la fin, d'après le nombre de wagons accrochés du premier coup.
 *
 * Même mesure que les deux autres jeux : tout finit par être trouvé puisqu'on
 * peut réessayer ; ce qui compte, c'est le premier essai.
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
const PHRASES = exports.PHRASES = {
  consigne: 'Où s’arrête le wagon ?',
  tropLoin: 'C’est trop loin !',
  pasAssezLoin: 'Ce n’est pas assez loin.'
};