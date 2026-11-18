/**
 * LES PODCASTS DE L'ESPACE PARENT — Camara, le 15/11/2026 : « dans mon espace parent je veux aussi la fonctionnalité
 * podcast ». Décisions du même jour : le parent CHOISIT la voix ; les règles de ses fiches (même droit, crédits de la
 * famille, administrateur sans limite).
 *
 * CE QUI SE TESTE ICI
 * 1. L'API vise `/parents/moi/mes-podcasts` et envoie la catégorie et la voix (sans catégorie = null).
 * 2. La page de création du parent : ses catégories, puis la voix ; le contenu reste fermé tant qu'il n'a pas choisi
 *    les deux ; créer envoie la catégorie et la voix, puis mène à son podcast dans son espace.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EspaceFichesContext } from '../lib/mesFiches/espaceFiches';
import NouveauPodcast from '../components/podcasts/NouveauPodcast';
import httpClient from '../lib/api/httpClient';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockNaviguer = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({}),
  useNavigate: () => mockNaviguer,
}));
jest.mock('../lib/hooks/useAccesForfait', () => ({ compteInactif: ({ ouvert, motif } = {}) => ouvert === false && motif !== 'essai', __esModule: true, default: () => ({ ouvert: null, motif: null }) }));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => null }));
jest.mock('../components/PieceJointe', () => ({ TYPES_ACCEPTES: 'image/png', reduire: (f) => Promise.resolve(f) }));
jest.mock('../components/ScanMobileModale', () => () => null);
jest.mock('../components/Avatar', () => function Avatar({ nom }) { return <span>{`avatar-${nom}`}</span>; });

const { creerCoursPodcast, modifierCoursPodcast } = jest.requireActual('../lib/api/mesPodcastsApi');

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  httpClient.get.mockImplementation((url) => {
    if (url === '/parents/moi/categories') return Promise.resolve({ data: [{ id: 5, libelle: 'Cuisine', couleur: '#e8562f' }] });
    if (url === '/parents/moi/mes-podcasts/professeurs') {
      return Promise.resolve({ data: [{ avatar: 'salim', prenom: 'Salim', matieres: ['Histoire-Géographie'] }, { avatar: 'nora', prenom: 'Nora', matieres: ['Mathématiques'] }] });
    }
    if (url === '/parents/moi/mes-podcasts/quota') return Promise.resolve({ data: { parent: true, sansLimite: true, limites: {} } });
    return Promise.resolve({ data: {} });
  });
  httpClient.post.mockImplementation((url) => Promise.resolve({ data: url.endsWith('/cours') ? { id: 77 } : {} }));
  httpClient.put.mockResolvedValue({ data: {} });
});

describe('l’API du parent', () => {
  it('vise son espace, avec la catégorie et la voix', () => {
    creerCoursPodcast('parent', 5, 'salim');
    expect(httpClient.post).toHaveBeenCalledWith('/parents/moi/mes-podcasts/cours', { categorieId: 5, prof: 'salim' });

    modifierCoursPodcast('parent', 77, 'aucune', 'nora');
    expect(httpClient.put).toHaveBeenCalledWith('/parents/moi/mes-podcasts/cours/77', { categorieId: null, prof: 'nora' });

    creerCoursPodcast(7, 3);
    expect(httpClient.post).toHaveBeenCalledWith('/eleves/7/mes-podcasts/cours', { matiereId: 3 });
  });
});

describe('créer un podcast dans l’espace parent', () => {
  it('catégorie, puis voix, puis le sujet ; la création porte les deux choix', async () => {
    render(
      <EspaceFichesContext.Provider value>
        <NouveauPodcast />
      </EspaceFichesContext.Provider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /^Libre/ }));
    expect(screen.getByText('Choisissez une catégorie')).toBeInTheDocument();

    const creer = screen.getByRole('button', { name: 'Créer mon podcast' });
    fireEvent.click(await screen.findByRole('radio', { name: /Cuisine/ }));
    fireEvent.click(await screen.findByRole('radio', { name: /Salim/ }));

    fireEvent.change(screen.getByLabelText('Ce que vous voulez réviser'), { target: { value: 'Les sauces de base' } });
    expect(creer).toBeEnabled();
    fireEvent.click(creer);

    await waitFor(() => expect(mockNaviguer).toHaveBeenCalledWith('/espace-parent/podcasts/cours/77'));
    expect(httpClient.post).toHaveBeenCalledWith('/parents/moi/mes-podcasts/cours', { categorieId: 5, prof: 'salim' });
    expect(httpClient.put).toHaveBeenCalledWith('/parents/moi/mes-podcasts/cours/77/texte', { texte: 'Les sauces de base' });
    expect(httpClient.post).toHaveBeenCalledWith('/parents/moi/mes-podcasts/cours/77/envoyer');
  });

  it('sans voix choisie, le contenu reste fermé', async () => {
    render(
      <EspaceFichesContext.Provider value>
        <NouveauPodcast />
      </EspaceFichesContext.Provider>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /^Libre/ }));
    fireEvent.click(await screen.findByRole('radio', { name: /Cuisine/ }));
    expect(screen.getByRole('button', { name: 'Créer mon podcast' })).toBeDisabled();
  });
});
