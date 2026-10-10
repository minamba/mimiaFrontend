import { outils } from '../outils.js';
import { rangDe } from './reglages.js';
import { PAYS, SOSIES } from './donnees/drapeaux.js';

/**
 * LE DÉFI DES DRAPEAUX — Camara, le 09/10/2026 (modèle Genially « Flags
 * challenge ») : « quand le temps est écoulé, on passe au drapeau suivant,
 * avec le son de mauvaise réponse si l'enfant n'a rien mis ».
 *
 * UN CHRONO PAR DRAPEAU, pas pour la partie : le défi raccourcit ce temps.
 * Les drapeaux s'ouvrent avec l'année (niveaux 1 à 4 de `donnees/drapeaux.js`),
 * et deux drapeaux SOSIES (Tchad et Roumanie…) ne sont jamais proposés
 * ensemble : la question serait injuste.
 */
export const PHRASES = {
  consigne: 'De quel pays est ce drapeau ? Réponds avant la fin du temps !',
  bravo: 'Bravo, la partie est finie !',
};

export const MANCHES = 10;

/** Le niveau de drapeaux le plus difficile ouvert à l'année. */
export function niveauMax(niveau) {
  const rang = rangDe(niveau);
  if (rang <= 2) return 1;
  if (rang <= 5) return 2;
  if (rang <= 9) return 3;
  return 4;
}

/** Les secondes par drapeau : moins en grandissant, et moins encore en défi. */
export function secondesParDrapeau(niveau, defi = false) {
  const rang = rangDe(niveau);
  const base = rang <= 2 ? 20 : rang <= 5 ? 15 : 12;
  return defi ? Math.max(7, Math.round(base * 0.6)) : base;
}

const sosiesDe = (code) => new Set(SOSIES.filter((g) => g.includes(code)).flat());

/** Une partie : dix drapeaux, chacun avec ses propositions (3, puis 4 dès la 6e). */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const rang = rangDe(niveau);
  const max = niveauMax(niveau);
  const ouverts = PAYS.filter((p) => p.niveau <= max);
  // Les drapeaux de l'année d'abord, puis ceux d'avant pour compléter.
  const duNiveau = o.melanger(ouverts.filter((p) => p.niveau === max));
  const avant = o.melanger(ouverts.filter((p) => p.niveau < max));
  const tires = [...duNiveau.slice(0, 6), ...avant].slice(0, MANCHES);
  const reste = duNiveau.slice(6);
  while (tires.length < MANCHES && reste.length) tires.push(reste.shift());
  const nbChoix = rang <= 5 ? 3 : 4;

  return o.melanger(tires).map((pays) => {
    const interdits = sosiesDe(pays.code);
    // Au collège et au lycée, des voisins du même continent : c'est plus dur.
    const candidats = o.melanger(ouverts.filter((p) => p.code !== pays.code && !interdits.has(p.code)));
    const proches = rang >= 6 ? candidats.filter((p) => p.continent === pays.continent) : [];
    const pieges = [];
    [...proches, ...candidats].forEach((p) => {
      if (pieges.length >= nbChoix - 1 || pieges.includes(p)) return;
      if (pieges.some((q) => sosiesDe(q.code).has(p.code))) return;
      pieges.push(p);
    });
    return { pays, choix: o.melanger([pays, ...pieges]) };
  });
}
