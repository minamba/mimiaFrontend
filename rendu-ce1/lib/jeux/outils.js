const React = require('react');
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bilan = bilan;
exports.outils = outils;
exports.suite = suite;
exports.troisChoix = troisChoix;
/**
 * LES OUTILS COMMUNS DES JEUX DU CM1 — Camara, le 21/09/2026 : « fais tout ».
 *
 * Chaque jeu du CP au CE2 recopie son tirage, son mélange et son mot de la
 * fin. Les jeux du CM1 les prennent ici : même tirage reproductible (voir la
 * note de `boiteDeDix.js`), même mot de la fin que partout ailleurs.
 */

/** Un tirage reproductible : la même graine redonne la même partie. */
function suite(graine) {
  let etat = graine % 2147483647;
  if (etat <= 0) etat += 2147483646;
  return () => {
    etat = etat * 16807 % 2147483647;
    return (etat - 1) / 2147483646;
  };
}

/** Les petits outils d'un tirage : un entier entre deux bornes, un élément, un mélange. */
function outils(graine) {
  const tirer = suite(graine);
  const entre = (a, b) => a + Math.floor(tirer() * (b - a + 1));
  const au = liste => liste[Math.floor(tirer() * liste.length)];
  const melanger = liste => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i -= 1) {
      const j = Math.floor(tirer() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie;
  };
  return {
    tirer,
    entre,
    au,
    melanger
  };
}

/** Le mot de la fin — le même dans tous les jeux. */
function bilan(duPremierCoup, manches) {
  if (duPremierCoup === manches) return 'Sans une seule erreur. Bravo !';
  if (duPremierCoup >= manches - 2) return 'Presque parfait !';
  if (duPremierCoup >= manches / 2) return 'C’est de mieux en mieux !';
  return 'Tu y arrives. On recommence ?';
}

/**
 * Trois choix différents : la bonne réponse et des pièges, sans doublon, et
 * complétés par des voisins si deux pièges se confondent.
 */
function troisChoix(bonne, pieges, voisin) {
  const liste = [bonne];
  pieges.forEach(p => {
    if (liste.length < 3 && !liste.includes(p)) liste.push(p);
  });
  let k = 1;
  while (liste.length < 3) {
    const v = voisin(k);
    if (!liste.includes(v)) liste.push(v);
    k += 1;
  }
  return liste;
}