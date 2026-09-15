/**
 * LE MODE « BLUE SKY » : UN INTERRUPTEUR QUI DOIT POUVOIR REVENIR EN ARRIÈRE.
 *
 * Voulu par Camara le 15/09/2026 pour faire tester le nouveau style et revenir
 * à l'ancien quand il veut. Trois garanties :
 *   1. allumé, le site porte l'attribut que App.css lit, et reste en sombre ;
 *   2. éteint, l'attribut disparaît et le parent retrouve SON thème ;
 *   3. le choix est retenu pour le prochain chargement (voir public/index.html).
 */

import { appliquerBlueSky, blueSkyEnregistre } from '../lib/storage/styleSite';

const racine = document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  racine.removeAttribute('data-da');
  racine.setAttribute('data-theme', 'dark');
});

test('allumé : l’attribut est posé, le sombre imposé, le choix retenu', () => {
  window.localStorage.setItem('mimia_theme', 'light');

  appliquerBlueSky(true);

  expect(racine.getAttribute('data-da')).toBe('blue-sky');
  expect(racine.getAttribute('data-theme')).toBe('dark');
  expect(blueSkyEnregistre()).toBe(true);
});

test('éteint : l’ancien style revient, avec le thème clair que le parent avait choisi', () => {
  window.localStorage.setItem('mimia_theme', 'light');
  appliquerBlueSky(true);

  appliquerBlueSky(false);

  expect(racine.hasAttribute('data-da')).toBe(false);
  expect(racine.getAttribute('data-theme')).toBe('light');
  expect(blueSkyEnregistre()).toBe(false);
});
