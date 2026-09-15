/**
 * LES CLASSES DANS UNE LISTE DE CHOIX — séries technologiques comprises.
 *
 * Deux garanties : une classe qui ne se choisit plus (« Terminale
 * technologique — série à préciser ») ne se propose jamais, sauf à l'enfant
 * qui y est déjà ; et les classes se rangent sous le groupe que donne le
 * serveur.
 */

import {
  grouperClasses,
  serieAPreciser,
  specialitesDeLaClasse,
  basculerSpecialite,
  specialitesAEnvoyer,
} from '../lib/niveauxScolaires';

const NIVEAUX = [
  { id: 9, code: 'TROISIEME', libelle: '3e', cycle: 'College', groupe: 'Collège', selectionnable: true },
  { id: 12, code: 'TERMINALE', libelle: 'Terminale générale', cycle: 'Lycee', groupe: 'Lycée général et technologique', selectionnable: true },
  { id: 17, code: 'TERMINALE_TECHNO', libelle: 'Terminale technologique — série à préciser', cycle: 'Lycee', groupe: 'Lycée technologique', selectionnable: false },
  { id: 20, code: 'TERMINALE_STMG', libelle: 'Terminale STMG', cycle: 'Lycee', groupe: 'Lycée technologique', selectionnable: true },
];

test('une classe sans série ne se propose pas', () => {
  const codes = grouperClasses(NIVEAUX).flatMap(([, classes]) => classes.map((c) => c.code));

  expect(codes).toEqual(['TROISIEME', 'TERMINALE', 'TERMINALE_STMG']);
});

test('les classes se rangent sous le groupe du serveur, dans l’ordre', () => {
  expect(grouperClasses(NIVEAUX).map(([groupe]) => groupe))
    .toEqual(['Collège', 'Lycée général et technologique', 'Lycée technologique']);
});

test('la classe actuelle de l’enfant reste visible, même sans série', () => {
  const codes = grouperClasses(NIVEAUX, 17).flatMap(([, classes]) => classes.map((c) => c.code));

  expect(codes).toContain('TERMINALE_TECHNO');
  expect(serieAPreciser(NIVEAUX, 17)).toBe(true);
  expect(serieAPreciser(NIVEAUX, 20)).toBe(false);
});

/*
 * LES SPÉCIALITÉS — trois en première générale, deux en terminale, aucune
 * ailleurs. Le serveur dit combien et lesquelles ; le navigateur n'envoie
 * jamais plus, ni une spécialité qu'il n'a pas proposée.
 */
const SPES = [
  { code: 'MATHS', libelle: 'Mathématiques' },
  { code: 'SVT', libelle: 'Sciences de la vie et de la Terre' },
  { code: 'SES', libelle: 'Sciences économiques et sociales' },
];

const LYCEE = [
  { id: 11, code: 'PREMIERE', nombreSpecialites: 3, specialitesPossibles: SPES },
  { id: 12, code: 'TERMINALE', nombreSpecialites: 2, specialitesPossibles: SPES },
  { id: 20, code: 'TERMINALE_STMG', nombreSpecialites: 0, specialitesPossibles: [] },
];

test('les spécialités n’existent qu’en première et terminale générales', () => {
  expect(specialitesDeLaClasse(LYCEE, 11).nombre).toBe(3);
  expect(specialitesDeLaClasse(LYCEE, 12).nombre).toBe(2);
  expect(specialitesDeLaClasse(LYCEE, 20)).toEqual({ nombre: 0, possibles: [] });
  expect(specialitesDeLaClasse(LYCEE, '').nombre).toBe(0);
});

test('en terminale, une troisième spécialité ne se coche pas', () => {
  const deux = basculerSpecialite(basculerSpecialite([], 'MATHS', 2), 'SVT', 2);

  expect(deux).toEqual(['MATHS', 'SVT']);
  expect(basculerSpecialite(deux, 'SES', 2)).toEqual(['MATHS', 'SVT']);
  expect(basculerSpecialite(deux, 'MATHS', 2)).toEqual(['SVT']);
});

test('passer de première en terminale n’envoie que deux spécialités proposées', () => {
  const terminale = specialitesDeLaClasse(LYCEE, 12);

  expect(specialitesAEnvoyer(['MATHS', 'INCONNUE', 'SVT', 'SES'], terminale)).toEqual(['MATHS', 'SVT']);
  expect(specialitesAEnvoyer(['MATHS'], specialitesDeLaClasse(LYCEE, 20))).toEqual([]);
});

test('un serveur plus ancien, sans groupe, range encore par cycle', () => {
  const anciens = [{ id: 1, libelle: 'CP', cycle: 'Primaire' }];

  expect(grouperClasses(anciens)).toEqual([['Primaire', anciens]]);
});
