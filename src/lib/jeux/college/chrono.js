/**
 * LE COMPTE À REBOURS DES ESCAPE GAMES — Camara, le 07/10/2026, devant la
 * chambre forte : l'intro promettait « avant la fin du compte à rebours », et
 * il n'y en avait pas. « Le mieux, ce n'est pas de corriger le texte, mais de
 * mettre le compte à rebours. »
 *
 * SES TROIS CHOIX, le même jour :
 *   - sur TOUS les escape games, de la 6e à la 3e ;
 *   - une durée par classe (ci-dessous) ;
 *   - à zéro, SELON LE MODE : en défi, l'alarme gagne et la partie s'arrête ;
 *     en tranquille, l'élève finit quand même — même règle que les cœurs, la
 *     pression reste un choix (voir `coeurs.js`).
 *
 * CE FICHIER N'EST PAS UN JEU : `college/index.js` liste ses modules un par
 * un, il ne parcourt pas le dossier.
 */

/** La durée des six cadenas, en secondes, selon la classe. */
export const DUREE_ESCAPE = {
  // Le 09/10/2026, Camara : « 10 minutes c'est trop facile, 11 minutes même ».
  // Serré : ~50 s par cadenas, lecture de l'histoire comprise — sans hésiter,
  // on finit ; au début c'était 12 min en 6e, 11 en 5e, 10 au-delà.
  SIXIEME: 7 * 60,
  CINQUIEME: 6 * 60,
  QUATRIEME: 5 * 60,
  TROISIEME: 5 * 60,
  SECONDE: 5 * 60,
  PREMIERE: 5 * 60,
  PREMIERE_TECHNO: 5 * 60,
  TERMINALE: 5 * 60,
  SECONDE_PRO: 5 * 60,
  PREMIERE_PRO: 5 * 60,
  TERMINALE_TECHNO: 5 * 60,
  TERMINALE_PRO: 5 * 60,
};

/** La durée d'une classe ; une classe inconnue prend la plus longue. */
export function dureeEscape(niveau) {
  return DUREE_ESCAPE[niveau] ?? Math.max(...Object.values(DUREE_ESCAPE));
}

/** Ce qui reste, en millisecondes, jamais négatif. */
export function resteMs(dureeSecondes, debut, maintenant) {
  return Math.max(0, dureeSecondes * 1000 - (maintenant - debut));
}

/** « 9:05 » : minutes et secondes, comme un minuteur. Arrondi à la seconde supérieure. */
export function cadran(ms) {
  const s = Math.ceil(Math.max(0, ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** « 8 min 12 s », « 45 s », « 10 min » : une durée écoulée, en toutes lettres courtes. */
export function enMinutes(ms) {
  const s = Math.round(Math.max(0, ms) / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  if (min === 0) return `${sec} s`;
  return sec === 0 ? `${min} min` : `${min} min ${String(sec).padStart(2, '0')} s`;
}
