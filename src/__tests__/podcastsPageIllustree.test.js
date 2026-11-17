/* eslint-disable testing-library/no-container, testing-library/no-node-access -- les classes et variables de la mise en page illustrée sont ce qui se vérifie ici. */
/**
 * LA PAGE D'UN PODCAST, ILLUSTRÉE — Camara, le 15/11/2026 : la maquette, avec la scène de la matière, la vraie tête du
 * professeur et un style qui suit la matière. Vue de l'enfant seulement.
 *
 * CE QUI SE TESTE ICI
 * 1. L'enfant : la bannière (matière, titre, résumé, les trois boutons « Tout… » dedans), la scène et la palette de
 *    la matière sur la racine, le portrait du professeur de l'épisode, l'onde décorative.
 * 2. Une matière sans scène : la bannière reste, sans scène.
 * 3. Les boutons gardent leur action (« Tout écouter » enchaîne).
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CoursPodcast from '../components/podcasts/CoursPodcast';
import { getAudioEpisode, getCoursPodcast } from '../lib/api/mesPodcastsApi';

jest.mock('../lib/api/mesPodcastsApi', () => ({
  getAudioEpisode: jest.fn(),
  getCoursPodcast: jest.fn(),
  demanderEpisodes: jest.fn(),
}));
jest.mock('../lib/storage/modeTest', () => ({ usePodcasts: () => true, usePodcastsTelechargement: () => true }));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => ({ eleveId: 7 }) }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({ eleveId: '7', coursId: '42' }),
}));
jest.mock('../components/Avatar', () => function Avatar({ nom, taille }) {
  return <span data-testid="portrait">{`${nom}-${taille}`}</span>;
});

const episode = (id, rang) => ({
  id, notionRang: rang, notionTotal: 2, titre: `Épisode ${rang}`, duree: 120, voix: 'salim', prof: 'Salim',
  paragraphes: ['Un.'],
});

const cours = (code, libelle) => ({
  id: 42, matiereId: 3, matiereCode: code, matiereLibelle: libelle, titre: 'La Première Guerre mondiale',
  etat: 'pret', episodes: [episode(1, 1), episode(2, 2)],
});

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:episode');
  global.URL.revokeObjectURL = jest.fn();
});

beforeEach(() => {
  getAudioEpisode.mockResolvedValue({ data: new Blob(['x']) });
});

test('l’enfant voit la bannière de la matière, et la vraie tête du professeur', async () => {
  getCoursPodcast.mockResolvedValue({ data: cours('HISTOIRE_GEO', 'Histoire-Géographie') });
  const { container } = render(<CoursPodcast />);

  expect(await screen.findByRole('heading', { name: 'La Première Guerre mondiale' })).toHaveClass('podx-banniere__titre');
  const racine = container.querySelector('.mf-page');
  expect(racine).toHaveClass('page-decor-enfant', 'podx', 'podx--scene');
  expect(racine.style.getPropertyValue('--podx-scene')).toMatch(/histoire_geo/);
  expect(racine.style.getPropertyValue('--carte-bord')).not.toBe('');

  const banniere = container.querySelector('.podx-banniere');
  expect(banniere).toHaveTextContent('Histoire-Géographie');
  expect(banniere).toHaveTextContent('2 épisodes');
  expect(banniere.querySelector('.pod-tout')).not.toBeNull();
  expect(banniere).toHaveTextContent('Tout télécharger');
  expect(banniere).toHaveTextContent('Un seul fichier MP3');

  expect(screen.getAllByTestId('portrait')[0]).toHaveTextContent('salim-92');
  expect(container.querySelectorAll('.podx-lecteur .podx-onde')).toHaveLength(2);
});

test('une matière sans scène : la bannière reste, sans scène', async () => {
  getCoursPodcast.mockResolvedValue({ data: cours('INCONNUE', 'Option facultative') });
  const { container } = render(<CoursPodcast />);

  await screen.findByRole('heading', { name: 'La Première Guerre mondiale' });
  expect(container.querySelector('.mf-page')).not.toHaveClass('podx--scene');
  expect(container.querySelector('.podx-banniere')).not.toBeNull();
});

test('« Tout écouter » relance le premier épisode depuis la bannière', async () => {
  getCoursPodcast.mockResolvedValue({ data: cours('HISTOIRE_GEO', 'Histoire-Géographie') });
  render(<CoursPodcast />);

  await screen.findByRole('heading', { name: 'La Première Guerre mondiale' });
  await waitFor(() => expect(getAudioEpisode).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: /Tout écouter/ }));
  // Le lecteur du premier épisode repart de zéro (nouvelle clé) : il redemande son audio, en lecture automatique.
  await waitFor(() => expect(getAudioEpisode).toHaveBeenCalledTimes(3));
  expect(getAudioEpisode).toHaveBeenLastCalledWith('7', 1, expect.any(Boolean));
});
