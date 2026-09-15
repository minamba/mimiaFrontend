import { appliquerTheme, themeEnregistre } from './theme';

/**
 * LE STYLE DU SITE : « Blue Sky » ou le sombre d'origine.
 *
 * Voulu par Camara le 15/09/2026 : le style de la page de maintenance (fond
 * bleu de marque, verre dépoli, accents corail) étendu à tout le site, pour le
 * faire tester — et pouvoir revenir à l'ancien quand il le veut.
 *
 * DÉCIDÉ PAR L'ADMINISTRATION, POUR TOUS LES VISITEURS : c'est le réglage
 * `BLUE_SKY`, lu avec les autres drapeaux publics (voir `modeTest.js`). Il pose
 * `data-da="blue-sky"` sur <html>, et App.css habille tout ce qui suit.
 *
 * MÉMORISÉ SUR L'APPAREIL, MAIS SEULEMENT POUR LE PREMIER AFFICHAGE.
 * `public/index.html` relit cette mémoire avant le CSS : sans elle, chaque
 * chargement montrerait l'ancien style une fraction de seconde, le temps que
 * les réglages reviennent du serveur. C'est toujours le serveur qui a le
 * dernier mot.
 *
 * BLUE SKY IMPOSE LE SOMBRE. Ses couleurs sont faites pour le bleu de marque,
 * et les règles propres au thème clair y poseraient des fonds blancs. Le choix
 * du parent n'est pas perdu : il reprend dès que le mode s'éteint.
 */
const CLE = 'mimia_style';

export const BLUE_SKY = 'blue-sky';

/** Le dernier style connu sur cet appareil. */
export function blueSkyEnregistre() {
  try {
    return window.localStorage.getItem(CLE) === BLUE_SKY;
  } catch {
    return false;
  }
}

/** Applique le style décidé par le serveur, et le retient pour le prochain chargement. */
export function appliquerBlueSky(actif) {
  const racine = document.documentElement;

  if (actif) {
    racine.setAttribute('data-da', BLUE_SKY);
  } else {
    racine.removeAttribute('data-da');
  }

  // APRÈS l'attribut : `appliquerTheme` le lit pour savoir s'il doit imposer
  // le sombre, ou rendre au parent le thème qu'il avait choisi.
  appliquerTheme(themeEnregistre());

  try {
    if (actif) window.localStorage.setItem(CLE, BLUE_SKY);
    else window.localStorage.removeItem(CLE);
  } catch {
    // Le style s'applique quand même pour cette visite.
  }
}
