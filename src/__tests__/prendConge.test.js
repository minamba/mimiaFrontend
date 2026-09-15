import { prendConge, demandeArret } from '../lib/storage/ardoise';

/**
 * L'AU REVOIR MUTUEL FERME LA SÉANCE, MÊME SANS [FIN_SEANCE].
 *
 * Relevé par Camara le 11/09/2026 : « OK, à la prochaine » — « À bientôt
 * Bilal ! On reprendra la fin de la dictée du chat au prochain cours. » — et
 * la séance restait ouverte jusqu'à la fin du minuteur.
 */

describe('prendConge', () => {
  test('LE CAS RELEVÉ : l\'adieu en première phrase, le prochain cours en dernière', () => {
    expect(prendConge(
      'À bientôt Bilal ! On reprendra la fin de la dictée du chat au prochain cours.',
    )).toBe(true);
  });

  test('l\'adieu en dernière phrase', () => {
    expect(prendConge('Bon travail aujourd\'hui. Bonne soirée Bilal !')).toBe(true);
  });

  test('un adieu après une virgule compte', () => {
    expect(prendConge('Parfait, à bientôt !')).toBe(true);
  });

  test('« salut » ne compte pas : il dit aussi bonjour', () => {
    expect(prendConge('Salut Bilal ! Content de te revoir. On reprend la dictée ?')).toBe(false);
  });

  test('une mention en passant ne compte pas', () => {
    expect(prendConge(
      'La dernière fois qu’on s’est dit à bientôt, tu avais bien progressé. '
      + 'Reprenons où on en était.',
    )).toBe(false);
  });

  test('un message de cours ordinaire ne compte pas', () => {
    expect(prendConge('Exactement, "dormait" avec un T. Tu vois pourquoi ?')).toBe(false);
  });

  test('la balise de fin ne gêne pas la lecture', () => {
    expect(prendConge('À bientôt Bilal ![FIN_SEANCE]')).toBe(true);
  });

  test('les entrées vides sont sans danger', () => {
    expect(prendConge('')).toBe(false);
    expect(prendConge(null)).toBe(false);
  });
});

describe('la corroboration de l\'élève', () => {
  test('« OK, à la prochaine » annonce bien un départ', () => {
    expect(demandeArret('OK, à la prochaine.')).toBe(true);
  });
});
