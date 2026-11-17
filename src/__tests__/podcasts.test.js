/**
 * LES PODCASTS DE L'ÉLÈVE — Camara, le 15/11/2026.
 *
 * CE QUI SE TESTE ICI
 * 1. Le lecteur : la durée lisible, et le paragraphe éclairé suit le temps de l'épisode.
 * 2. La page d'un podcast : les notions arrivent toutes cochées, l'enfant en décoche, et demande ses épisodes.
 * 3. Les épisodes prêts s'affichent dans l'ordre des notions, avec le professeur qui les lit.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { duree, paragrapheAuTemps } from '../components/podcasts/LecteurEpisode';
import CoursPodcast from '../components/podcasts/CoursPodcast';
import { demanderEpisodes, getCoursPodcast, getAudioEpisode } from '../lib/api/mesPodcastsApi';

jest.mock('../lib/api/mesPodcastsApi', () => ({
  getCoursPodcast: jest.fn(),
  demanderEpisodes: jest.fn(),
  getAudioEpisode: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '7', coursId: '42' }),
}));

jest.mock('../lib/storage/modeTest', () => ({ usePodcastsTelechargement: () => false }));

jest.mock('../components/Avatar', () => function Avatar({ nom, parle }) {
  return <span data-testid="avatar">{`${nom}${parle ? ' parle' : ''}`}</span>;
});

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:episode');
  global.URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  getAudioEpisode.mockResolvedValue({ data: new Blob(['x']) });
});

describe('le lecteur', () => {
  it('écrit une durée en minutes et secondes', () => {
    expect(duree(0)).toBe('0:00');
    expect(duree(65)).toBe('1:05');
    expect(duree(NaN)).toBe('0:00');
  });

  it('éclaire le paragraphe que la voix est en train de dire', () => {
    const paragraphes = ['Court.', 'Un paragraphe bien plus long que le premier, qui prend du temps à dire.', 'Fin.'];
    expect(paragrapheAuTemps(paragraphes, 0, 60)).toBe(0);
    expect(paragrapheAuTemps(paragraphes, 30, 60)).toBe(1);
    expect(paragrapheAuTemps(paragraphes, 59, 60)).toBe(2);
    expect(paragrapheAuTemps([], 10, 60)).toBe(-1);
  });
});

describe('la page d’un podcast', () => {
  it('les notions arrivent toutes cochées ; on en décoche une et on demande les épisodes', async () => {
    getCoursPodcast.mockResolvedValue({
      data: {
        id: 42, matiereLibelle: 'Mathématiques', matiereCode: 'MATHS', titre: 'Les fractions', etat: 'notions',
        notions: [{ titre: 'Lire une fraction' }, { titre: 'Comparer des fractions' }, { titre: 'Additionner' }],
        notionsDemandees: [], episodes: [],
      },
    });
    demanderEpisodes.mockResolvedValue({});

    render(<CoursPodcast />);

    expect(await screen.findByText('Choisis tes épisodes')).toBeInTheDocument();
    const cases = screen.getAllByRole('checkbox');
    expect(cases.every((c) => c.checked)).toBe(true);

    fireEvent.click(cases[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Créer mes 2 épisodes' }));
    await waitFor(() => expect(demanderEpisodes).toHaveBeenCalledWith('7', '42', [1, 3]));
  });

  it('les épisodes prêts, dans l’ordre des notions, lus par le professeur', async () => {
    getCoursPodcast.mockResolvedValue({
      data: {
        id: 42, matiereLibelle: 'Mathématiques', matiereCode: 'MATHS', titre: 'Les fractions', etat: 'pret',
        notions: [{ titre: 'A' }, { titre: 'B' }], notionsDemandees: [1, 2],
        episodes: [
          { id: 2, titre: 'Comparer', notionRang: 2, notionTotal: 2, duree: 200, voix: 'nora', prof: 'Nora', paragraphes: ['…'] },
          { id: 1, titre: 'Lire', notionRang: 1, notionTotal: 2, duree: 180, voix: 'nora', prof: 'Nora', paragraphes: ['…'] },
        ],
      },
    });

    render(<CoursPodcast />);

    const titres = await screen.findAllByText(/^(Lire|Comparer)$/);
    expect(titres.map((t) => t.textContent)).toEqual(['Lire', 'Comparer']);
    expect(screen.getByText('2 épisodes · 6:20 d’écoute')).toBeInTheDocument();
    expect(screen.getAllByText(/avec Nora/)).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Tout écouter/ })).toBeInTheDocument();
    await waitFor(() => expect(getAudioEpisode).toHaveBeenCalledTimes(2));
  });
});
