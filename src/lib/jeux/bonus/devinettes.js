import { outils } from '../outils.js';
import { anneeDe, enCapitales, rangDe } from './reglages.js';
import { VOCABULAIRE } from './donnees/vocabulaire.js';
import { PHRASES_A_DEVINER } from './donnees/phrases.js';

/**
 * DEVINE LE MOT ET DEVINE LA PHRASE — Camara, le 09/10/2026 (modèles Genially
 * « Guess the word » et « Guess the phrase »). Le même ressort : un texte
 * caché, des lettres proposées une à une, un indice, et un nombre d'erreurs
 * permis.
 *
 * PAS DE POTENCE : le pendu dessiné n'est pas une image pour des enfants de
 * six ans. Pas de dessin non plus (Camara, le 09/10/2026 : le bonhomme de
 * neige qui le remplaçait décentrait le jeu) : les erreurs se comptent.
 *
 * UNE LETTRE COUVRE SES ACCENTS : proposer E découvre aussi É, È, Ê ; O
 * découvre le Œ de « cœur » avec le E qui suit dans la case d'après.
 */
export const PHRASES_MOT = {
  consigne: 'Devine le mot, lettre par lettre. Lis bien l’indice !',
  bravo: 'Bravo, tu as trouvé le mot !',
  dommage: 'Dommage, tu n’as pas trouvé le mot. Tu feras mieux la prochaine fois, c’est certain.',
  fin: 'Bravo, la partie est finie !',
  temps: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

export const PHRASES_PHRASE = {
  consigne: 'Devine la phrase, lettre par lettre. L’indice peut t’aider.',
  bravo: 'Bravo, tu as trouvé la phrase !',
  dommage: 'Dommage, tu n’as pas réussi à trouver la phrase. Tu feras mieux la prochaine fois, c’est certain.',
  fin: 'Bravo, la partie est finie !',
  temps: 'Le temps est écoulé ! Tu feras mieux la prochaine fois, c’est certain.',
};

/** Les vingt-six lettres du clavier. */
export const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * Le texte découpé en cases : chaque caractère d'origine, sa lettre « nue »
 * (celle qu'on propose) — null pour un espace, une apostrophe, une virgule.
 * « œ » donne deux cases, O et E, comme dans les mots mêlés.
 */
export function cases(texte) {
  const resultat = [];
  [...String(texte)].forEach((car) => {
    const nu = enCapitales(car);
    if (/^[A-Z]+$/.test(nu)) {
      [...nu].forEach((lettre, i) => resultat.push({ car: i === 0 && nu.length === 1 ? car.toUpperCase() : lettre, lettre }));
    } else {
      resultat.push({ car, lettre: null });
    }
  });
  return resultat;
}

/** Les lettres à trouver (sans doublon). */
export const lettresDe = (texte) => [...new Set(cases(texte).map((c) => c.lettre).filter(Boolean))];

/** Les erreurs : les lettres proposées absentes du texte. */
export const erreursDe = (texte, proposees) => proposees.filter((l) => !lettresDe(texte).includes(l)).length;

/** Tout est découvert ? */
export const estTrouve = (texte, proposees) => lettresDe(texte).every((l) => proposees.includes(l));

/** Les erreurs permises : six pour un mot ; pour une phrase, moins à mesure qu'on grandit. */
export function erreursPermises(jeu, niveau) {
  if (jeu === 'mot') return 6;
  const rang = rangDe(niveau);
  if (rang <= 3) return 5;
  if (rang <= 5) return 4;
  return 3;
}

/** Une partie de Devine le mot : cinq mots de l'année, avec leur indice. */
export function serieMots(graine = Date.now(), niveau = 'CP') {
  const { melanger } = outils(graine);
  const liste = VOCABULAIRE[anneeDe(niveau)] ?? VOCABULAIRE.CP;
  return melanger(liste).slice(0, 5).map(({ mot, indice }) => ({ texte: mot, indice }));
}

/** Une partie de Devine la phrase : trois phrases de l'année, avec leur indice. */
export function seriePhrases(graine = Date.now(), niveau = 'CP') {
  const { melanger } = outils(graine);
  const liste = PHRASES_A_DEVINER[anneeDe(niveau)] ?? PHRASES_A_DEVINER.CP;
  return melanger(liste).slice(0, 3).map(({ phrase, indice }) => ({ texte: phrase, indice }));
}
