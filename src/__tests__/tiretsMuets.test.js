import { prononcable } from '../lib/storage/voixService';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: {} }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve(''),
}));

/**
 * LES TIRETS SONT MUETS EN COURS DE LANGUE.
 *
 * Relevé par Camara le 11/09/2026 : « "Le lit", exactement - "il courut se
 * cacher sous le lit" » a été lu « … exactement MOINS il courut… ».
 */

const enLangue = (texte) => prononcable(texte, { langue: true });

describe('en cours de langue', () => {
  test('LE CAS RELEVÉ : un tiret isolé ne se dit pas « moins »', () => {
    const dit = enLangue('"Le lit", exactement - "il courut se cacher sous le lit".');

    expect(dit).not.toMatch(/moins/);
    expect(dit).toMatch(/exactement,/);
  });

  test('une suite de tirets ne se dit pas', () => {
    expect(enLangue('il se cacha sous le ----- ')).not.toMatch(/[-‐–—]|moins/);
  });

  test('un tiret de liste ou de dialogue en tête de ligne ne se dit pas', () => {
    const dit = enLangue('- Viens ici !\n- Non.');

    expect(dit).not.toMatch(/moins/);
    expect(dit).toMatch(/^Viens ici/);
  });

  test('les mots composés restent entiers', () => {
    expect(enLangue('peut-être')).toBe('peut-être');
    expect(enLangue('le week-end')).toBe('le week-end');
  });

  test('l\'épellation reste lettre par lettre', () => {
    expect(enLangue('on écrit a-i-t ?')).toMatch(/a, i, t/);
  });

  test('les tirets typographiques aussi', () => {
    expect(enLangue('Il partit – sans un mot.')).not.toMatch(/moins|–/);
    expect(enLangue('Il partit — sans un mot.')).not.toMatch(/moins|—/);
  });
});

describe('ailleurs', () => {
  test('en maths, « 5 - 3 » reste « cinq moins trois »', () => {
    expect(prononcable('5 - 3 = 2')).toMatch(/5 moins 3 égale 2/);
  });

  test('un cadratin n\'est un « moins » dans aucune matière', () => {
    expect(prononcable('Il reste une étape — la plus dure.')).not.toMatch(/moins/);
  });
});
