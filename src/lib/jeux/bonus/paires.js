import { outils } from '../outils.js';
import { anneeDe, rangDe } from './reglages.js';
import { FAMILLES, IMAGES } from './donnees/paires.js';

/**
 * LES PAIRES — Camara, le 09/10/2026 (modèle Genially « Jeu de paires
 * d'images »), avec un chrono « comme ça il y a un challenge ».
 *
 * LES DEUX SORTES DE PAIRES (choix de Camara) : au CP et au CE1, deux images
 * identiques — de la mémoire pure ; ensuite, des paires QUI APPRENNENT : un
 * calcul et son résultat, un mot et son contraire, son synonyme, sa
 * traduction anglaise, un auteur et son œuvre (`donnees/paires.js`).
 *
 * UNE CARTE NE SE MARIE QU'À SA PARTENAIRE : chaque paire porte un numéro, et
 * deux cartes vont ensemble si et seulement si elles portent le même.
 */
export const PHRASES = {
  consigne: 'Retourne les cartes deux par deux, et retrouve toutes les paires.',
  'consigne-familles': 'Retourne les cartes deux par deux : chaque carte a une seule partenaire.',
  bravo: 'Bravo, tu as retrouvé toutes les paires !',
  dommage: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

/** Le nombre de paires d'une partie, selon l'année. */
export function nombreDePaires(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 1) return 6;
  if (rang <= 3) return 8;
  if (rang <= 5) return 9;
  return 10;
}

/** Des calculs et leur résultat, tous différents, à la mesure de l'année. */
function pairesDeCalcul(o, rang, n) {
  const paires = [];
  const resultats = new Set();
  let essais = 0;
  while (paires.length < n && essais < 2000) {
    essais += 1;
    let texte;
    let valeur;
    if (rang <= 3) {
      const a = o.entre(2, 20); const b = o.entre(2, 20);
      [texte, valeur] = [`${a} + ${b}`, a + b];
    } else if (rang <= 5) {
      const a = o.entre(2, 10); const b = o.entre(2, 10);
      [texte, valeur] = [`${a} × ${b}`, a * b];
    } else {
      const a = o.entre(2, 12); const b = o.entre(2, 9); const c = o.entre(2, 9);
      [texte, valeur] = [`${a} + ${b} × ${c}`, a + b * c];
    }
    if (resultats.has(valeur)) continue;
    resultats.add(valeur);
    paires.push([texte, String(valeur)]);
  }
  return { titre: 'Le calcul et son résultat', paires };
}

/**
 * Une partie : le titre de la famille et les cartes mélangées, chacune
 * `{ id, paire, texte, emoji }`. `emoji` marque une carte dessinée.
 */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const rang = rangDe(niveau);
  const n = nombreDePaires(niveau);
  let titre;
  let paires;

  if (rang <= 2) {
    titre = 'Les images jumelles';
    paires = o.melanger(IMAGES).slice(0, n).map(({ emoji, nom }) => [{ emoji, nom }, { emoji, nom }]);
  } else {
    const familles = [...(FAMILLES[anneeDe(niveau)] ?? []), ...(rang <= 9 ? [pairesDeCalcul(o, rang, n)] : [])];
    const famille = familles.length ? o.au(familles) : pairesDeCalcul(o, rang, n);
    titre = famille.titre;
    paires = o.melanger(famille.paires).slice(0, n).map((p) => p.map((t) => {
      // Un émoji seul est une carte dessinée ; le reste, du texte.
      const dessin = /^\p{Extended_Pictographic}️?$/u.test(t);
      return dessin ? { emoji: t, nom: '' } : { texte: t };
    }));
  }

  const cartes = paires.flatMap((p, i) => p.map((face) => ({ paire: i, ...face })));
  return {
    titre,
    jumelles: rang <= 2,
    cartes: o.melanger(cartes).map((c, i) => ({ id: i, ...c })),
  };
}

/** Deux cartes vont-elles ensemble ? */
export const vontEnsemble = (a, b) => a.id !== b.id && a.paire === b.paire;
