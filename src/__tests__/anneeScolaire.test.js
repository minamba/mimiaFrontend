/**
 * LA BASCULE AU 1er AOÛT — la même règle que `AnneeScolaire.cs` côté serveur.
 * Si l'une des deux change, l'autre doit changer avec : le badge du site et
 * le titre de l'administration doivent dire la même année.
 */

import { anneeScolaireCourante, libelleProgrammes } from '../lib/storage/anneeScolaire';

test('de septembre à juillet, on est dans l’année scolaire commencée en septembre', () => {
  expect(anneeScolaireCourante(new Date(2026, 8, 13))).toBe('2026-2027'); // 13 septembre 2026
  expect(anneeScolaireCourante(new Date(2027, 0, 15))).toBe('2026-2027'); // 15 janvier 2027
  expect(anneeScolaireCourante(new Date(2027, 6, 31))).toBe('2026-2027'); // 31 juillet 2027
});

test('le 1er août, on passe à l’année suivante — sans toucher au code', () => {
  expect(anneeScolaireCourante(new Date(2027, 7, 1))).toBe('2027-2028'); // 1er août 2027
  expect(anneeScolaireCourante(new Date(2028, 7, 1))).toBe('2028-2029');
});

test('le libellé du badge porte l’année, et rien d’autre', () => {
  expect(libelleProgrammes(new Date(2026, 8, 13))).toBe('Programmes officiels 2026-2027');
});
