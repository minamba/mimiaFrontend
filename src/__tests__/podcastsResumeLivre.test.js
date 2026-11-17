/**
 * LE RÉSUMÉ DE LIVRE EN PODCAST — Camara, le 15/11/2026 : « un troisième choix, Résumé de livre ; l'enfant écrit ou
 * dicte le nom du livre ». Décisions du même jour : le professeur de français par défaut (modifiable), le titre et
 * l'auteur facultatif, un seul podcast compté.
 *
 * CE QUI SE TESTE ICI
 * 1. La fenêtre de choix montre trois cartes pour les podcasts, deux pour les fiches.
 * 2. Le choix « Résumé de livre » présélectionne le français ; le bouton attend un titre.
 * 3. Créer envoie le titre et l'auteur, puis le cours part à la lecture.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChoixModeFiche, { MODE_LIVRE } from '../components/mesFiches/ChoixModeFiche';
import NouveauPodcast, { estLeFrancais } from '../components/podcasts/NouveauPodcast';
import {
  creerCoursPodcast, ecrireLivrePodcast, envoyerCoursPodcast, getQuotaPodcasts,
} from '../lib/api/mesPodcastsApi';
import { getMatieresEleve } from '../lib/api/elevesApi';

jest.mock('../lib/api/mesPodcastsApi', () => ({
  getQuotaPodcasts: jest.fn(),
  creerCoursPodcast: jest.fn(),
  ecrireLivrePodcast: jest.fn(),
  ecrireTextePodcast: jest.fn(),
  envoyerCoursPodcast: jest.fn(),
  modifierCoursPodcast: jest.fn(),
  supprimerCoursPodcast: jest.fn(),
  ajouterPagePodcast: jest.fn(),
  supprimerPagePodcast: jest.fn(),
  creerScanPodcast: jest.fn(),
  etatScanPodcast: jest.fn(),
}));

const mockNaviguer = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '7' }),
  useNavigate: () => mockNaviguer,
}));
jest.mock('../lib/api/elevesApi', () => ({ getMatieresEleve: jest.fn() }));
jest.mock('../lib/hooks/useAccesForfait', () => ({
  __esModule: true,
  default: () => ({ ouvert: true, motif: null }),
}));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => ({ eleveId: 7 }) }));
jest.mock('../components/PieceJointe', () => ({ TYPES_ACCEPTES: 'image/png', reduire: (f) => Promise.resolve(f) }));
jest.mock('../components/ScanMobileModale', () => () => null);

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  getQuotaPodcasts.mockResolvedValue({
    data: { utilisees: 0, maximum: 10, restantes: 10, credits: 0, disponibles: 10, packs: [], limites: {} },
  });
  getMatieresEleve.mockResolvedValue({
    data: [
      { id: 1, code: 'MATHS', libelle: 'Mathématiques', active: true, profPrenom: 'Nora' },
      { id: 2, code: 'FRANCAIS', libelle: 'Français', active: true, profPrenom: 'Léa' },
    ],
  });
  creerCoursPodcast.mockResolvedValue({ data: { id: 42 } });
  ecrireLivrePodcast.mockResolvedValue({ data: {} });
  envoyerCoursPodcast.mockResolvedValue({ data: {} });
});

describe('la fenêtre de choix', () => {
  it('trois cartes pour les podcasts, deux pour les fiches', () => {
    const choisir = jest.fn();
    const { unmount } = render(<ChoixModeFiche module="podcasts" onChoisir={choisir} onFermer={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /À partir d’un livre/ }));
    expect(choisir).toHaveBeenCalledWith(MODE_LIVRE);
    unmount();

    render(<ChoixModeFiche onChoisir={() => {}} onFermer={() => {}} />);
    expect(screen.queryByRole('button', { name: /À partir d’un livre/ })).not.toBeInTheDocument();
  });

  it('reconnaît la matière de français', () => {
    expect(estLeFrancais({ code: 'FRANCAIS' })).toBe(true);
    expect(estLeFrancais({ code: 'X', libelle: 'Français' })).toBe(true);
    expect(estLeFrancais({ code: 'MATHS', libelle: 'Mathématiques' })).toBe(false);
  });
});

describe('créer un résumé de livre', () => {
  it('le français est choisi d’avance, puis le titre et l’auteur partent avec le cours', async () => {
    render(<NouveauPodcast />);

    fireEvent.click(await screen.findByRole('button', { name: /À partir d’un livre/ }));

    await waitFor(() => expect(screen.getByRole('radio', { name: /Français/ })).toHaveAttribute('aria-checked', 'true'));
    const creer = screen.getByRole('button', { name: 'Créer mon podcast' });
    expect(creer).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Le titre du livre'), { target: { value: 'Le Petit Prince' } });
    fireEvent.change(screen.getByLabelText('L’auteur du livre'), { target: { value: 'Saint-Exupéry' } });
    expect(creer).toBeEnabled();

    fireEvent.click(creer);

    await waitFor(() => expect(envoyerCoursPodcast).toHaveBeenCalledWith('7', 42));
    expect(creerCoursPodcast).toHaveBeenCalledWith('7', 2, null);
    expect(ecrireLivrePodcast).toHaveBeenCalledWith('7', 42, 'Le Petit Prince', 'Saint-Exupéry');
    expect(mockNaviguer).toHaveBeenCalledWith('/eleves/7/mes-podcasts/cours/42');
  });
});
