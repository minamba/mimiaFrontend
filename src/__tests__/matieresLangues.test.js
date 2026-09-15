import { estMatiereLangue } from '../lib/matieresLangues';
import { LANGUES_ETUDIEES } from '../lib/storage/langueTranscription';
import { DEBUT_ECOUTE } from '../lib/storage/ardoise';

/**
 * TOUT LE SYSTÈME DE DICTÉE EST GLOBAL AUX LANGUES — exigé par Camara le
 * 11/09/2026 : « si je vais en anglais demander une dictée, je veux que ça
 * fonctionne de la même manière qu'en français ».
 *
 * Ce que ce test tient : les listes ne peuvent plus diverger. Une langue
 * ajoutée à la reconnaissance vocale sans sa balise d'écoute — ou l'inverse —
 * fait échouer ce test, au lieu d'arriver en séance avec la moitié des
 * mécanismes.
 */
test('chaque langue étudiée porte les dictées, et a sa balise d\'écoute', () => {
  const codeParMatiere = {
    ANGLAIS: 'en',
    ESPAGNOL: 'es',
    ALLEMAND: 'de',
    ITALIEN: 'it',
    CHINOIS: 'zh',
    LLCER_ANGLAIS: 'en',
    AMC: 'en',
    LLCER_ESPAGNOL: 'es',
  };

  Object.keys(LANGUES_ETUDIEES).forEach((matiere) => {
    expect(estMatiereLangue(matiere)).toBe(true);
    expect(DEBUT_ECOUTE[codeParMatiere[matiere]]).toBeTruthy();
  });

  // Le français aussi, bien qu'il ne soit pas une langue « étudiée » au sens
  // de la reconnaissance vocale.
  expect(estMatiereLangue('FRANCAIS')).toBe(true);
  expect(DEBUT_ECOUTE.fr).toBeTruthy();
});

test('le français et les langues étrangères connues sont reconnus', () => {
  expect(estMatiereLangue('FRANCAIS')).toBe(true);
  expect(estMatiereLangue('ANGLAIS')).toBe(true);
  expect(estMatiereLangue('espagnol')).toBe(true);
});

test('une matière qui n’est pas une langue ne l’est pas', () => {
  expect(estMatiereLangue('MATHEMATIQUES')).toBe(false);
  expect(estMatiereLangue('HISTOIRE_GEO')).toBe(false);
});

test('les entrées vides ou absentes sont sans danger', () => {
  expect(estMatiereLangue('')).toBe(false);
  expect(estMatiereLangue(null)).toBe(false);
  expect(estMatiereLangue(undefined)).toBe(false);
});
