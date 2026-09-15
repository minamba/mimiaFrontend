import {
  ouvreUneNouvelleDictee,
  phrases,
  texteDicteDepuis,
} from '../lib/storage/comparaisonDictee';

/**
 * Relevé le 11/09/2026 : l'élève laisse DEUX phrases de côté, le professeur
 * en repère une, la fait rattraper, et déclare la copie complète.
 */

const DICTE = [
  'Ce matin-là, Léa et son frère étaient partis très tôt.',
  'Les nuages laissaient place à un ciel dégagé.',
  'Ils ont ri de cette pluie inattendue.',
].join(' ');

describe('phrases', () => {
  test('découpe sur la ponctuation forte', () => {
    expect(phrases(DICTE)).toHaveLength(3);
  });

  test('ignore le vide et les espaces multiples', () => {
    expect(phrases('  ')).toEqual([]);
    expect(phrases(null)).toEqual([]);
  });
});

describe('texteDicteDepuis', () => {
  const message = (role, contenu) => ({ role, contenu });

  test('assemble les passages dictés dans l\'ordre', () => {
    const fil = [
      message('assistant', 'Allez.\n[DICTEE]\nPremière phrase ici.\n[/DICTEE]'),
      message('user', 'ok'),
      message('assistant', 'Suite.\n[DICTEE]\nDeuxième phrase là.\n[/DICTEE]'),
    ];

    expect(texteDicteDepuis(fil)).toBe('Première phrase ici. Deuxième phrase là.');
  });

  test('une phrase redite quatre fois ne compte qu\'une', () => {
    const redite = message('assistant', '[DICTEE]Ils ont ri de la pluie.[/DICTEE]');
    const fil = [redite, redite, redite, redite];

    expect(texteDicteDepuis(fil)).toBe('Ils ont ri de la pluie.');
  });

  test('une dictée déjà corrigée n\'entre pas dans la suivante', () => {
    const fil = [
      message('assistant', '[DICTEE]Ancienne dictée.[/DICTEE]'),
      message('assistant', 'Corrigé ![DICTEE_CORRIGEE]…[/DICTEE_CORRIGEE]'),
      message('assistant', '[DICTEE]Nouvelle dictée.[/DICTEE]'),
    ];

    expect(texteDicteDepuis(fil)).toBe('Nouvelle dictée.');
  });

  test('un fil sans dictée ne rend rien', () => {
    expect(texteDicteDepuis([message('assistant', 'Bonjour.')])).toBe('');
    expect(texteDicteDepuis(null)).toBe('');
  });
});

describe('ouvreUneNouvelleDictee', () => {
  const DEJA = 'Le chat noir dormait. Il ouvrit un oeil. Puis il se rendormit.';

  test('une relecture reste dans la même dictée', () => {
    expect(ouvreUneNouvelleDictee('Il ouvrit un oeil.', DEJA)).toBe(false);
  });

  test('une relecture partielle aussi', () => {
    expect(ouvreUneNouvelleDictee('Il ouvrit un oeil. Puis il se rendormit.', DEJA))
      .toBe(false);
  });

  test('un texte inédit ouvre une nouvelle dictée', () => {
    expect(ouvreUneNouvelleDictee('Le vent soufflait sur la plage.', DEJA)).toBe(true);
  });

  test('la toute première dictée en ouvre une', () => {
    expect(ouvreUneNouvelleDictee('Le chat noir dormait.', '')).toBe(true);
  });

  test('un message sans passage n\'ouvre rien', () => {
    expect(ouvreUneNouvelleDictee('', DEJA)).toBe(false);
  });
});
