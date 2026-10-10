import { outils } from '../outils.js';
import { anneeDe, enCapitales, rangDe } from './reglages.js';
import { MOTS_SECRETS } from './donnees/motsSecrets.js';

/**
 * LE MOT SECRET — Camara, le 09/10/2026 (modèle Genially « Secret word ») :
 * une roue de lettres ; pour la lettre tirée, une définition, et un mot qui
 * commence par elle à trouver « avec le compte à rebours ; la difficulté en
 * fonction de la classe ; à la fin du chrono, si l'enfant n'a pas répondu,
 * son de mauvaise réponse, et on passe au mot suivant ».
 *
 * DIX LETTRES PAR PARTIE, tirées parmi celles de l'année et jouées dans
 * l'ordre de l'alphabet, comme on fait le tour de la roue. Au CP et au CE1,
 * trois mots proposés, qui commencent tous par la lettre (sinon la réponse se
 * devinerait à l'initiale) ; ensuite, on écrit — accents et majuscules libres.
 */
export const PHRASES = {
  consigne: 'Lis la définition, et trouve le mot qui commence par la lettre, avant la fin du temps !',
  bravo: 'Bravo, c’est le bon mot !',
  temps: 'Trop tard ! Voici le mot, et on passe au suivant.',
  fin: 'Bravo, tu as fait le tour de la roue !',
};

export const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const MANCHES = 10;

export const parChoix = (niveau) => rangDe(niveau) <= 2;

/** Les secondes par mot : moins en grandissant, et moins encore en défi. */
export function secondesParMot(niveau, defi = false) {
  const rang = rangDe(niveau);
  const base = rang <= 2 ? 40 : rang <= 5 ? 35 : 30;
  return defi ? Math.round(base * 0.6) : base;
}

const initiale = (mot) => enCapitales(mot)[0];

/** Le mot proposé est-il le bon ? Sans accents, sans majuscules, sans espaces autour. */
export const estLeMot = (propose, mot) => enCapitales(String(propose).trim()) === enCapitales(mot);

/** Une partie : dix manches `{ lettre, mot, definition, choix }`, dans l'ordre de l'alphabet. */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const liste = MOTS_SECRETS[anneeDe(niveau)] ?? MOTS_SECRETS.CP;
  const tirees = o.melanger(liste).slice(0, MANCHES).sort((a, b) => a.lettre.localeCompare(b.lettre));
  // Pour les choix du CP et du CE1 : des mots de la même initiale, pris dans toutes les années.
  const tous = Object.values(MOTS_SECRETS).flat();
  return tirees.map(({ lettre, mot, definition }) => {
    const voisins = o.melanger(tous.filter((e) => e.mot !== mot && initiale(e.mot) === initiale(mot)).map((e) => e.mot));
    // Faute de deux mots de la même initiale, on complète avec d'autres : au
    // CP, on ne bascule jamais vers l'écriture.
    const autres = o.melanger(tous.filter((e) => e.mot !== mot).map((e) => e.mot));
    const pieges = [...new Set([...voisins, ...autres])].slice(0, 2);
    return {
      lettre: lettre.toUpperCase(),
      mot,
      definition,
      choix: parChoix(niveau) ? o.melanger([mot, ...pieges]) : null,
    };
  });
}
