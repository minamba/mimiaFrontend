const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REGLES = exports.MANCHES = exports.GROUPES = exports.ESSAIS_AVANT_AIDE = exports.AIDE = void 0;
exports.bilan = bilan;
exports.consigne = consigne;
exports.groupe = void 0;
exports.serie = serie;
exports.verdict = verdict;
/**
 * FÉMININ ET PLURIEL — « Un ou des ? » au CE2.
 *
 * Voulu par Camara le 21/09/2026 : les jeux du CP et du CE1 qui s'y prêtent
 * gagnent un niveau CE2.
 *
 * COMPÉTENCE DU RÉFÉRENTIEL (déjà en base, mot pour mot) :
 *   FR_CE2_LANG_FEMININ — « Former le féminin et le pluriel des noms et des
 *   adjectifs »
 *
 * LE JEU. Un groupe nominal — « un cheval noir » — et une consigne : au
 * pluriel, ou au féminin. L'enfant choisit la forme du nom, puis celle de
 * l'adjectif, et annonce.
 *
 * LE CE2 DÉPASSE LE « + s » DU CP : les noms en -al (chevaux), en -eau et -eu
 * (bateaux, jeux), les exceptions en -ou (bijoux), ceux qui ne bougent pas
 * (souris, nez) ; au féminin, la consonne doublée (chatte), -euse, -ère,
 * -rice. LES LEURRES SONT LES ERREURS VRAISEMBLABLES — « chevals », « chate »,
 * « boulangere » —, jamais des formes absurdes.
 *
 * L'ERREUR DONNE UN MODÈLE (« pense à un château, des châteaux »), sans épeler,
 * PRIS HORS DU JEU — sinon il donnerait la réponse de la manche :
 * une règle qu'on retrouve sur un mot connu se retient mieux qu'une liste de
 * lettres, et une voix la dit sans buter.
 *
 * LE NOM EST JUGÉ AVANT L'ADJECTIF : c'est lui qui commande l'accord.
 */

const MANCHES = exports.MANCHES = 8;
const ESSAIS_AVANT_AIDE = exports.ESSAIS_AVANT_AIDE = 3;
const GROUPES = exports.GROUPES = [
// Au pluriel.
{
  sens: 'pluriel',
  depart: 'un cheval noir',
  det: 'des',
  nom: 'chevaux',
  adj: 'noirs',
  nomsFaux: ['chevals', 'cheval'],
  adjsFaux: ['noir', 'noires'],
  regleNom: 'al',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'un bateau rapide',
  det: 'des',
  nom: 'bateaux',
  adj: 'rapides',
  nomsFaux: ['bateaus', 'bateau'],
  adjsFaux: ['rapide', 'rapidex'],
  regleNom: 'eau',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'un journal amusant',
  det: 'des',
  nom: 'journaux',
  adj: 'amusants',
  nomsFaux: ['journals', 'journal'],
  adjsFaux: ['amusant', 'amusantes'],
  regleNom: 'al',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'un gâteau délicieux',
  det: 'des',
  nom: 'gâteaux',
  adj: 'délicieux',
  nomsFaux: ['gâteaus', 'gâteau'],
  adjsFaux: ['délicieuxs', 'délicieuses'],
  regleNom: 'eau',
  regleAdj: 'x'
}, {
  sens: 'pluriel',
  depart: 'un jeu nouveau',
  det: 'des',
  nom: 'jeux',
  adj: 'nouveaux',
  nomsFaux: ['jeus', 'jeu'],
  adjsFaux: ['nouveau', 'nouveaus'],
  regleNom: 'eu',
  regleAdj: 'aux'
}, {
  sens: 'pluriel',
  depart: 'un oiseau bleu',
  det: 'des',
  nom: 'oiseaux',
  adj: 'bleus',
  nomsFaux: ['oiseaus', 'oiseau'],
  adjsFaux: ['bleu', 'bleux'],
  regleNom: 'eau',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'un animal sauvage',
  det: 'des',
  nom: 'animaux',
  adj: 'sauvages',
  nomsFaux: ['animals', 'animal'],
  adjsFaux: ['sauvage', 'sauvagex'],
  regleNom: 'al',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'une souris grise',
  det: 'des',
  nom: 'souris',
  adj: 'grises',
  nomsFaux: ['sourises', 'sourix'],
  adjsFaux: ['grise', 'gris'],
  regleNom: 'sz',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'un nez rouge',
  det: 'des',
  nom: 'nez',
  adj: 'rouges',
  nomsFaux: ['nezs', 'nes'],
  adjsFaux: ['rouge', 'rougex'],
  regleNom: 'sz',
  regleAdj: 's'
}, {
  sens: 'pluriel',
  depart: 'un bijou brillant',
  det: 'des',
  nom: 'bijoux',
  adj: 'brillants',
  nomsFaux: ['bijous', 'bijou'],
  adjsFaux: ['brillant', 'brillantes'],
  regleNom: 'ou',
  regleAdj: 's'
},
// Au féminin.
{
  sens: 'feminin',
  depart: 'un chat gris',
  det: 'une',
  nom: 'chatte',
  adj: 'grise',
  nomsFaux: ['chate', 'chat'],
  adjsFaux: ['gris', 'grisse'],
  regleNom: 'double',
  regleAdj: 'e'
}, {
  sens: 'feminin',
  depart: 'un chanteur joyeux',
  det: 'une',
  nom: 'chanteuse',
  adj: 'joyeuse',
  nomsFaux: ['chanteure', 'chantrice'],
  adjsFaux: ['joyeux', 'joyeuxe'],
  regleNom: 'euse',
  regleAdj: 'euse'
}, {
  sens: 'feminin',
  depart: 'un boulanger gentil',
  det: 'une',
  nom: 'boulangère',
  adj: 'gentille',
  nomsFaux: ['boulangere', 'boulangeuse'],
  adjsFaux: ['gentile', 'gentil'],
  regleNom: 'ere',
  regleAdj: 'lle'
}, {
  sens: 'feminin',
  depart: 'un lion courageux',
  det: 'une',
  nom: 'lionne',
  adj: 'courageuse',
  nomsFaux: ['lione', 'lion'],
  adjsFaux: ['courageux', 'courageuxe'],
  regleNom: 'double',
  regleAdj: 'euse'
}, {
  sens: 'feminin',
  depart: 'un ami content',
  det: 'une',
  nom: 'amie',
  adj: 'contente',
  nomsFaux: ['ami', 'amise'],
  adjsFaux: ['content', 'contentte'],
  regleNom: 'e',
  regleAdj: 'e'
}, {
  sens: 'feminin',
  depart: 'un acteur connu',
  det: 'une',
  nom: 'actrice',
  adj: 'connue',
  nomsFaux: ['acteuse', 'acteure'],
  adjsFaux: ['connu', 'connuse'],
  regleNom: 'rice',
  regleAdj: 'e'
}, {
  sens: 'feminin',
  depart: 'un voisin poli',
  det: 'une',
  nom: 'voisine',
  adj: 'polie',
  nomsFaux: ['voisinne', 'voisin'],
  adjsFaux: ['poli', 'polle'],
  regleNom: 'e',
  regleAdj: 'e'
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

/** Huit groupes : cinq au pluriel, trois au féminin, mêlés ; les formes mélangées. */
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
  const pluriels = melanger(GROUPES.filter(g => g.sens === 'pluriel')).slice(0, 5);
  const feminins = melanger(GROUPES.filter(g => g.sens === 'feminin')).slice(0, 3);
  return melanger([...pluriels, ...feminins]).map(g => ({
    groupe: GROUPES.indexOf(g),
    noms: melanger([g.nom, ...g.nomsFaux]),
    adjs: melanger([g.adj, ...g.adjsFaux])
  }));
}
const groupe = i => GROUPES[i];

/** Juste, ou la règle du nom, ou celle de l'adjectif. */
exports.groupe = groupe;
function verdict(g, nom, adj) {
  if (nom !== g.nom) return `nom-${g.regleNom}`;
  if (adj !== g.adj) return `adj-${g.regleAdj}`;
  return 'juste';
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
function consigne(g) {
  return `Écris au ${g.sens === 'pluriel' ? 'pluriel' : 'féminin'} : ${g.depart}.`;
}
const REGLES = exports.REGLES = {
  'nom-al': 'Pense à un hôpital, des hôpitaux : ces noms-là changent au pluriel.',
  'nom-eau': 'Pense à un château, des châteaux : ces noms-là prennent un x.',
  'nom-eu': 'Pense à un cheveu, des cheveux : ces noms-là prennent un x.',
  'nom-ou': 'Pense à un genou, des genoux : c’est une exception à retenir.',
  'nom-sz': 'Ce nom finit déjà par s ou par z : il ne change pas au pluriel.',
  'nom-double': 'Pense à un chien, une chienne : au féminin, la dernière lettre se double.',
  'nom-euse': 'Pense à un danseur, une danseuse.',
  'nom-ere': 'Pense à un fermier, une fermière : un accent apparaît.',
  'nom-rice': 'Pense à un directeur, une directrice.',
  'nom-e': 'Au féminin, ce nom prend simplement un e.',
  'adj-s': 'L’adjectif s’accorde avec le nom : au pluriel, il prend un s.',
  'adj-x': 'Cet adjectif finit déjà par x : il ne change pas au pluriel.',
  'adj-aux': 'Pense à un frère jumeau, des frères jumeaux.',
  'adj-e': 'L’adjectif s’accorde avec le nom : au féminin, il prend un e.',
  'adj-euse': 'Pense à heureux, heureuse.',
  'adj-lle': 'Pense à pareil, pareille : au féminin, le l se double.'
};
const AIDE = exports.AIDE = 'Regarde : le nom change, et l’adjectif s’accorde avec lui.';