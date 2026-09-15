const CLE = 'mimia_theme';

/**
 * Le thème mémorisé sur cet appareil, ou 'dark' par défaut.
 *
 * SOMBRE PAR DÉFAUT, MÊME SANS PRÉFÉRENCE ENREGISTRÉE. Le produit ne suit
 * plus `prefers-color-scheme` : un parent dont le système est en clair verra
 * quand même Mimia en sombre tant qu'il n'a pas choisi autrement dans
 * « Mes paramètres ». Voir `public/index.html` pour l'amorçage qui applique
 * ce même choix avant le premier rendu, et `src/App.css` pour la bascule des
 * jetons de couleur elle-même.
 */
export function themeEnregistre() {
  try {
    return window.localStorage.getItem(CLE) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Pose l'attribut que App.css lit pour choisir sa palette.
 *
 * LE STYLE « BLUE SKY » IMPOSE LE SOMBRE — voir `styleSite.js`. Le choix du
 * parent reste mémorisé et reprend dès que l'administration éteint le mode.
 */
export function appliquerTheme(theme) {
  const blueSky = document.documentElement.getAttribute('data-da') === 'blue-sky';

  document.documentElement.setAttribute(
    'data-theme', !blueSky && theme === 'light' ? 'light' : 'dark');
}

/**
 * Le choix du parent : appliqué immédiatement, et mémorisé pour ses
 * prochaines visites sur cet appareil.
 *
 * La mémorisation peut échouer (navigation privée, stockage plein) sans que
 * le choix lui-même échoue : l'écran change quand même, seule la prochaine
 * visite retombera sur le sombre.
 */
export function definirTheme(theme) {
  const valeur = theme === 'light' ? 'light' : 'dark';

  try {
    window.localStorage.setItem(CLE, valeur);
  } catch {
    // Le thème s'applique quand même pour la session en cours.
  }

  appliquerTheme(valeur);
}
