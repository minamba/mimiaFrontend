/**
 * L'ATELIER DES SYLLABES — ENTENDRE SANS LIRE À LA PLACE DE L'ENFANT. Camara,
 * le 22/09/2026 : « permettre à l'enfant d'entendre le son de chaque
 * syllabe ». « Écoute en syllabes » dit le mot syllabe par syllabe ; les
 * étiquettes ne parlent qu'après deux erreurs, et les écouter ne pose rien.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AtelierDesSyllabes from '../components/jeux/AtelierDesSyllabes';
import {
  mot, serie, SYLLABES_PARLANTES, toutesLesSyllabes,
} from '../lib/jeux/atelierDesSyllabes';
import { repliquesSyllabes, toutesLesRepliques } from '../lib/jeux/voix/repliques';

const mockDire = jest.fn();
jest.mock('../lib/jeux/voix/useVoixJeu', () => ({
  __esModule: true,
  default: () => ({
    dire: mockDire, parle: false, muet: false, reecouter: jest.fn(), basculerMuet: jest.fn(),
  }),
}));

const GRAINE = 2024;
const cles = (appel) => [appel].flat().map((r) => r.cle);
const dernierAppel = () => cles(mockDire.mock.calls[mockDire.mock.calls.length - 1][0]);

beforeEach(() => {
  mockDire.mockClear();
  jest.spyOn(Date, 'now').mockReturnValue(GRAINE);
});
afterEach(() => { jest.restoreAllMocks(); });

/** Remplit le train de leurres et l'annonce : une erreur. */
async function seTromper(leurres, n) {
  const wagons = mot(serie(GRAINE)[0].mot).syllabes.length;
  if (n > 0) {
    await userEvent.click(screen.getByRole('button', { name: /^Wagon 1 : / }));
    await userEvent.click(screen.getByRole('button', { name: leurres[wagons] }));
  } else {
    for (let i = 0; i < wagons; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(screen.getByRole('button', { name: leurres[i] }));
    }
  }
  await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
}

describe('les voix des syllabes', () => {
  it('chaque syllabe écrite du jeu, leurres compris, a sa voix chez Adrien', () => {
    const toutes = Object.values(toutesLesRepliques()).flat().map((r) => r.cle);
    toutesLesSyllabes().forEach((s) => expect(toutes).toContain(repliquesSyllabes.son(s).cle));
    expect(toutes).toContain('syllabes/sons-ouverts');
  });
});

describe('à l’écran', () => {
  it('« Écoute en syllabes » dit le mot syllabe par syllabe, dans l’ordre', async () => {
    const leMot = mot(serie(GRAINE)[0].mot);
    render(<AtelierDesSyllabes onQuitter={jest.fn()} />);
    mockDire.mockClear();

    await userEvent.click(screen.getByRole('button', { name: /Écoute en syllabes/ }));
    expect(dernierAppel()).toEqual(leMot.syllabes.map((s) => repliquesSyllabes.son(s).cle));
  });

  it('les étiquettes ne parlent qu’après deux erreurs, et Adrien l’annonce', async () => {
    const leMot = mot(serie(GRAINE)[0].mot);
    render(<AtelierDesSyllabes onQuitter={jest.fn()} />);
    expect(screen.queryAllByRole('button', { name: /^Écouter « / })).toHaveLength(0);

    await seTromper(leMot.leurres, 0);
    expect(screen.queryAllByRole('button', { name: /^Écouter « / })).toHaveLength(0);

    await seTromper(leMot.leurres, 1);
    expect(SYLLABES_PARLANTES).toBe(2);
    expect(dernierAppel()).toContain('syllabes/sons-ouverts');
    expect(screen.getAllByRole('button', { name: /^Écouter « / }).length).toBeGreaterThan(0);
  });

  it('écouter une syllabe la fait dire, sans la poser dans un wagon', async () => {
    const leMot = mot(serie(GRAINE)[0].mot);
    render(<AtelierDesSyllabes onQuitter={jest.fn()} />);
    await seTromper(leMot.leurres, 0);
    await seTromper(leMot.leurres, 1);
    await userEvent.click(screen.getByRole('button', { name: /^Wagon 1 : / }));
    mockDire.mockClear();

    const syllabe = leMot.syllabes[0];
    await userEvent.click(screen.getAllByRole('button', { name: `Écouter « ${syllabe} »` })[0]);
    expect(dernierAppel()).toEqual([repliquesSyllabes.son(syllabe).cle]);
    expect(screen.getByRole('button', { name: 'Wagon 1, vide' })).toBeInTheDocument();
  });
});
