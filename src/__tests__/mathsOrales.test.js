/**
 * LES MATHS DITES À VOIX HAUTE, ÉCRITES EN MATHS — Camara, le 26/09/2026.
 *
 * Remontée d'un parent : Syan répond « x est égal moins cinq » à l'oral, et la
 * transcription l'écrit en toutes lettres. Le professeur attend « x = -5 ».
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. Le cas du parent, mot pour mot.
 *   2. Les expressions d'un cours de collège et de lycée.
 *   3. SURTOUT, CE QUI NE DOIT PAS BOUGER : une phrase ordinaire qui contient
 *      « moins », « fois », « un » ou « plus » n'est pas une expression.
 */

import { ecrireEnMaths, estMatiereMaths } from '../lib/storage/mathsOrales';

describe('le cas remonté par le parent', () => {
  test('« x est égal moins cinq » s’écrit x = -5, et le reste de la phrase ne bouge pas', () => {
    expect(ecrireEnMaths('Faire une double distributivité. x est égal moins cinq.'))
      .toBe('Faire une double distributivité. x = -5.');
  });

  test('avec « à », sans accent, ou déjà en chiffres', () => {
    expect(ecrireEnMaths('x est égal à moins cinq')).toBe('x = -5');
    expect(ecrireEnMaths('x egal a moins 5')).toBe('x = -5');
    expect(ecrireEnMaths('x égale -5')).toBe('x = -5');
  });
});

describe('les expressions d’un cours de maths', () => {
  test.each([
    ['x plus cinq égale zéro', 'x + 5 = 0'],
    ['x moins trois égal zéro', 'x - 3 = 0'],
    ['deux x plus trois égale onze', '2x + 3 = 11'],
    ['trois fois quatre égale douze', '3 × 4 = 12'],
    ['douze divisé par quatre égale trois', '12 ÷ 4 = 3'],
    ['x au carré égale seize', 'x² = 16'],
    ['a au cube plus b', 'a³ + b'],
    ['deux virgule cinq fois quatre égale dix', '2,5 × 4 = 10'],
    ['x est inférieur à soixante-dix', 'x < 70'],
    ['y est supérieur ou égal à quatre-vingt-dix', 'y ≥ 90'],
    ['vingt et un moins un égale vingt', '21 - 1 = 20'],
    ['x égal trois cent vingt-cinq', 'x = 325'],
    ['deux mille vingt-six moins deux mille égale vingt-six', '2026 - 2000 = 26'],
  ])('« %s » → %s', (dit, ecrit) => {
    expect(ecrireEnMaths(dit)).toBe(ecrit);
  });

  test('deux égalités dans la même phrase', () => {
    expect(ecrireEnMaths('x égal trois, y égal quatre')).toBe('x = 3, y = 4');
  });

  test('une expression au milieu d’une phrase', () => {
    expect(ecrireEnMaths('Je pense que x égale deux mais je ne suis pas sûr'))
      .toBe('Je pense que x = 2 mais je ne suis pas sûr');
  });
});

describe('ce qui NE doit PAS bouger', () => {
  test.each([
    'au moins cinq élèves',
    'je l’ai fait deux fois',
    'c’est un exercice difficile',
    'il y a trois pommes',
    'il a plus de temps que moi',
    'fais un plus grand dessin',
    'la réponse est cinq',
    'moins cinq',
    'Faire une double distributivité.',
    'je n’ai pas compris',
    '',
  ])('« %s »', (phrase) => {
    expect(ecrireEnMaths(phrase)).toBe(phrase);
  });

  test('ce qui est déjà écrit en symboles reste tel quel', () => {
    expect(ecrireEnMaths('x=-5')).toBe('x=-5');
  });
});

describe('la matière', () => {
  test('les maths seulement — du CP à la terminale, le code est MATHS', () => {
    expect(estMatiereMaths('MATHS')).toBe(true);
    expect(estMatiereMaths('maths')).toBe(true);
    expect(estMatiereMaths('PHYSIQUE_CHIMIE')).toBe(false);
    expect(estMatiereMaths('FRANCAIS')).toBe(false);
    expect(estMatiereMaths(null)).toBe(false);
  });
});
