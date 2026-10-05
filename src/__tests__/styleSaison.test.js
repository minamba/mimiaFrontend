/**
 * LES DÉCLINAISONS DE BLUE SKY — Camara, le 29/09/2026 : soldes d'été, soldes
 * d'hiver, French Days, Black Friday, « dans la même carte que Blue Sky ».
 *
 * Ce que ces tests protègent :
 * 1. UNE DÉCLINAISON N'EXISTE PAS SANS BLUE SKY : éteint, elle tombe.
 * 2. UNE VALEUR INCONNUE NE POSE RIEN — une faute de frappe côté serveur ne
 *    doit pas laisser le site dans un état que le CSS ne connaît pas.
 * 3. L'APPAREIL S'EN SOUVIENT, pour le premier affichage suivant (index.html).
 */

import {
  appliquerBlueSky, saisonEnregistree, saisonValide, SAISONS,
} from '../lib/storage/styleSite';

const racine = () => document.documentElement;

beforeEach(() => {
  window.localStorage.clear();
  racine().removeAttribute('data-da');
  racine().removeAttribute('data-saison');
});

test('les cinq déclinaisons, dans l’ordre de l’administration', () => {
  expect(SAISONS.map((s) => s.cle)).toEqual(['soldes-ete', 'soldes-hiver', 'french-days', 'black-friday', 'back-to-school']);
});

test('Blue Sky avec une déclinaison : les deux attributs sont posés, et retenus', () => {
  appliquerBlueSky(true, 'black-friday');

  expect(racine().getAttribute('data-da')).toBe('blue-sky');
  expect(racine().getAttribute('data-saison')).toBe('black-friday');
  expect(window.localStorage.getItem('mimia_saison')).toBe('black-friday');
  expect(saisonEnregistree()).toBe('black-friday');
});

test('Blue Sky éteint : la déclinaison tombe avec lui', () => {
  appliquerBlueSky(true, 'soldes-ete');
  appliquerBlueSky(false, 'soldes-ete');

  expect(racine().hasAttribute('data-da')).toBe(false);
  expect(racine().hasAttribute('data-saison')).toBe(false);
  expect(saisonEnregistree()).toBeNull();
});

test('retour au Blue Sky classique : la déclinaison s’efface, Blue Sky reste', () => {
  appliquerBlueSky(true, 'french-days');
  appliquerBlueSky(true, null);

  expect(racine().getAttribute('data-da')).toBe('blue-sky');
  expect(racine().hasAttribute('data-saison')).toBe(false);
});

test('une valeur inconnue ne pose rien', () => {
  expect(saisonValide('soldes-printemps')).toBeNull();

  appliquerBlueSky(true, 'soldes-printemps');
  expect(racine().getAttribute('data-da')).toBe('blue-sky');
  expect(racine().hasAttribute('data-saison')).toBe(false);

  window.localStorage.setItem('mimia_saison', '<script>');
  expect(saisonEnregistree()).toBeNull();
});
