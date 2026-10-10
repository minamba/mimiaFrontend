import { outils } from '../outils.js';
import { anneeDe, enCapitales, rangDe } from './reglages.js';
import { MOTS_DE_PASSE } from './donnees/motsDePasse.js';

/**
 * LE MOT DE PASSE — Camara, le 09/10/2026 (modèle Genially « Password
 * challenge ») : trois indices d'un seul mot, un mot secret qu'ils ont en
 * commun, à trouver avant la fin du temps.
 *
 * TROIS NIVEAUX DE QUATRE MOTS, chacun sur un thème tiré parmi les six de
 * l'année (`donnees/motsDePasse.js`). Le premier indice est donné ; ouvrir
 * les deux autres coûte des points : 3 points avec un indice, 2 avec deux,
 * 1 avec trois.
 *
 * AU CP ET AU CE1, ON CHOISIT AU LIEU D'ÉCRIRE : trois mots proposés. Écrire
 * « parapluie » sans faute n'est pas ce qu'on mesure ici. Ensuite, on écrit ;
 * les accents et les majuscules ne comptent pas.
 */
export const PHRASES = {
  consigne: 'Trouve le mot secret que cachent les indices. Moins tu ouvres d’indices, plus tu gagnes de points !',
  bravo: 'Bravo, tu as trouvé le mot secret !',
  dommage: 'Le temps est écoulé ! Voici le mot secret.',
  fin: 'Bravo, la partie est finie !',
};

export const NIVEAUX = 3;
export const MOTS_PAR_NIVEAU = 4;

/** Choisir parmi trois mots plutôt qu'écrire : au CP et au CE1. */
export const parChoix = (niveau) => rangDe(niveau) <= 2;

/** Les secondes pour chaque mot : moins en défi. */
export function secondesParMot(niveau, defi = false) {
  const base = rangDe(niveau) <= 2 ? 60 : 45;
  return defi ? Math.round(base * 0.55) : base;
}

/** Les points d'un mot trouvé, selon les indices ouverts. */
export const points = (indicesOuverts) => Math.max(1, 4 - indicesOuverts);

/** Le mot proposé est-il le bon ? Sans accents, sans majuscules, sans espaces autour. */
export const estLeMot = (propose, mot) => enCapitales(String(propose).trim()) === enCapitales(mot);

/**
 * Une partie : douze manches `{ niveau, theme, mot, indices, choix }` —
 * `choix` (trois mots de la même année) seulement au CP et au CE1.
 */
export function serie(graine = Date.now(), niveau = 'CP') {
  const o = outils(graine);
  const themes = MOTS_DE_PASSE[anneeDe(niveau)] ?? MOTS_DE_PASSE.CP;
  const tous = themes.flatMap((t) => t.mots.map((m) => m.mot));
  const choisis = o.melanger(themes).slice(0, NIVEAUX);
  return choisis.flatMap((t, n) => o.melanger(t.mots).slice(0, MOTS_PAR_NIVEAU).map(({ mot, indices }) => ({
    niveau: n + 1,
    theme: t.theme,
    mot,
    indices,
    choix: parChoix(niveau) ? o.melanger([mot, ...o.melanger(tous.filter((x) => x !== mot)).slice(0, 2)]) : null,
  })));
}
