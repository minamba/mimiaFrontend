/**
 * LA COMMANDE VOCALE « PHOTO » : reconnue quand l'élève la dit, ignorée
 * partout où le mot apparaît dans une phrase ordinaire.
 *
 * Rien ne signalerait une dérive de ce filtre autrement qu'en séance : un
 * élève qui répond « une photo » à une question de cours déclencherait une
 * capture inexistante, ou l'inverse — la commande dite clairement ne
 * partirait jamais. D'où ces tests.
 */

import { estCommandePhoto } from '../lib/storage/commandePhoto';

test('le mot seul, dans ses variantes naturelles, est reconnu', () => {
  expect(estCommandePhoto('Photo')).toBe(true);
  expect(estCommandePhoto('photo')).toBe(true);
  expect(estCommandePhoto('PHOTO')).toBe(true);
  expect(estCommandePhoto('Photo.')).toBe(true);
  expect(estCommandePhoto('Photo !')).toBe(true);
  expect(estCommandePhoto('Prends la photo')).toBe(true);
  expect(estCommandePhoto('une photo')).toBe(true);
  expect(estCommandePhoto('Photo s’il te plaît')).toBe(true);
  expect(estCommandePhoto("Photo s'il te plait")).toBe(true);
});

test('une phrase ordinaire qui contient « photo » ne déclenche rien', () => {
  expect(estCommandePhoto('il y a une photo dans mon livre')).toBe(false);
  expect(estCommandePhoto('je préfère la deuxième photo')).toBe(false);
  expect(estCommandePhoto('est-ce que je peux prendre une photo plus tard')).toBe(false);
});

test('une phrase sans le mot ne déclenche jamais', () => {
  expect(estCommandePhoto("J'ai fini d'écrire.")).toBe(false);
  expect(estCommandePhoto('Attends, je réfléchis.')).toBe(false);
});

test('les entrées vides ou absentes sont sans danger', () => {
  expect(estCommandePhoto('')).toBe(false);
  expect(estCommandePhoto('   ')).toBe(false);
  expect(estCommandePhoto(null)).toBe(false);
  expect(estCommandePhoto(undefined)).toBe(false);
});
