/**
 * MON ESPACE PARENT — Camara, le 16/10/2026 : « un bouton à droite de Mon
 * compte, un menu avec Mes fiches de révision ; pas lié aux enfants ; le
 * parent crée ses propres catégories ; visible seulement des parents qui en
 * ont le droit ».
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import EspaceParent from '../components/espaceParent/EspaceParent';
import MesFiches from '../components/mesFiches/MesFiches';
import NouveauCours from '../components/mesFiches/NouveauCours';
import Navbar from '../components/Navbar';
import * as api from '../lib/api/mesFichesApi';
import * as espaceApi from '../lib/api/espaceParentApi';

jest.mock('../lib/api/mesFichesApi');
jest.mock('../lib/api/espaceParentApi', () => ({
  __esModule: true,
  ...jest.requireActual('../lib/api/espaceParentApi'),
  getEspaceParent: jest.fn(),
  getCategories: jest.fn(),
  creerCategorie: jest.fn(),
  modifierCategorie: jest.fn(),
  supprimerCategorie: jest.fn(),
}));
jest.mock('../lib/api/elevesApi', () => ({ getMatieresEleve: jest.fn(), getAccesForfait: jest.fn() }));
jest.mock('../lib/api/sessionEleveApi', () => ({ fermerSession: jest.fn() }));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  NavLink: ({ to, children, className }) => (
    <a href={to} className={typeof className === 'function' ? className({ isActive: true }) : className}>{children}</a>
  ),
  Navigate: ({ to }) => <p>Redirection vers {to}</p>,
  useParams: () => ({}),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/espace-parent/fiches' }),
  useSearchParams: () => [new URLSearchParams()],
}));
jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({
    auth: { authentifie: true, estAdmin: false, utilisateur: { given_name: 'Camara', email: 'c@mimia.fr' } },
    eleves: { liste: [] },
  }),
  useDispatch: () => jest.fn(),
}));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => null, fermerSessionEleve: jest.fn() }));
jest.mock('../lib/storage/modeTest', () => ({ useModeTest: () => false, useBesoinsParticuliers: () => false }));
jest.mock('../components/PieceJointe', () => ({ TYPES_ACCEPTES: 'image/png,application/pdf', reduire: (f) => Promise.resolve(f) }));
jest.mock('../components/ScanMobileModale', () => () => null);

const QUOTA_PARENT = {
  parent: true, sansLimite: false, utilisees: 0, maximum: 0, restantes: 0, credits: 4, disponibles: 4,
  remiseLe: '2026-11-01T00:00:00Z', packs: [],
  limites: { sansLimite: false, pagesMax: 20, piecesMax: 20, tailleFichierMax: 5242880, notionsMax: 8 },
};

const COURS = [{
  id: 1, matiereId: null, matiereLibelle: 'Anglais pro', matiereCode: null, categorieId: 3, categorieCouleur: '#2563EB',
  titre: 'Les e-mails professionnels', etat: 'pret', type: 'classique', dateCreation: '2026-10-16T08:00:00Z',
  fiches: [{ id: 9, type: 'classique', titre: 'Formules de politesse' }],
}, {
  id: 2, matiereId: null, matiereLibelle: null, matiereCode: null, categorieId: null, categorieCouleur: null,
  titre: 'Notes en vrac', etat: 'pret', type: 'express', dateCreation: '2026-10-15T08:00:00Z',
  fiches: [{ id: 10, type: 'express', titre: 'En bref' }],
}];

beforeEach(() => {
  jest.clearAllMocks();
  espaceApi.getEspaceParent.mockResolvedValue({ data: { fiches: true, sansLimite: false, actif: true } });
  espaceApi.getCategories.mockResolvedValue({ data: [{ id: 3, libelle: 'Anglais pro', couleur: '#2563EB', ordre: 1, nombreCours: 1 }] });
  api.getMesFiches.mockResolvedValue({
    data: {
      actif: true, forfait: true, quota: QUOTA_PARENT,
      categories: [{ id: 3, libelle: 'Anglais pro', couleur: '#2563EB', ordre: 1, nombreCours: 1 }],
      cours: COURS,
    },
  });
  api.getQuota.mockResolvedValue({ data: QUOTA_PARENT });
});

describe('le bouton de la barre', () => {
  it('« Mon espace parent » pour un parent qui a le droit', async () => {
    render(<Navbar />);
    expect(await screen.findByRole('link', { name: /Mon espace parent/ })).toHaveAttribute('href', '/espace-parent');
  });

  it('rien sans le droit', async () => {
    espaceApi.getEspaceParent.mockResolvedValue({ data: { fiches: false, sansLimite: false, actif: true } });
    render(<Navbar />);
    await screen.findByLabelText('Mon compte');
    await Promise.resolve();
    expect(screen.queryByRole('link', { name: /Mon espace parent/ })).not.toBeInTheDocument();
  });
});

describe('l’espace', () => {
  it('sans le droit, renvoie vers « Mes enfants »', async () => {
    espaceApi.getEspaceParent.mockResolvedValue({ data: { fiches: false, sansLimite: false, actif: true } });
    render(<EspaceParent><MesFiches /></EspaceParent>);
    expect(await screen.findByText('Redirection vers /eleves')).toBeInTheDocument();
  });

  it('un menu, un item : « Mes fiches personnelles »', async () => {
    render(<EspaceParent><MesFiches /></EspaceParent>);
    const menu = await screen.findByRole('complementary', { name: 'Mon espace parent' });
    expect(within(menu).getByRole('link', { name: /Mes fiches personnelles/ })).toHaveAttribute('href', '/espace-parent/fiches');
    expect(within(menu).getAllByRole('link')).toHaveLength(1);
  });

  it('ses fiches, rangées par SES catégories, à ses adresses, sans lien vers les enfants', async () => {
    render(<EspaceParent><MesFiches /></EspaceParent>);

    expect(await screen.findByRole('heading', { name: /Anglais pro/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sans catégorie/ })).toBeInTheDocument();
    expect(screen.getByText('Votre espace parent')).toBeInTheDocument();
    expect(screen.queryByText('← Mes matières')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Les e-mails professionnels/ })[0]).toHaveAttribute('href', '/espace-parent/fiches/cours/1');
    expect(screen.getByRole('link', { name: /Compléter le cours « Les e-mails professionnels »/ })).toHaveAttribute('href', '/espace-parent/fiches/nouvelle?complement=1');
    expect(api.getMesFiches).toHaveBeenCalledWith('parent');

    // Ses crédits à la place de la jauge du mois d'un enfant.
    expect(screen.getByText(/4 crédits/)).toBeInTheDocument();
    expect(screen.queryByRole('meter')).not.toBeInTheDocument();
  });

  it('un administrateur n’a ni crédits ni jauge à lire', async () => {
    api.getMesFiches.mockResolvedValue({
      data: { actif: true, forfait: true, quota: { ...QUOTA_PARENT, sansLimite: true }, categories: [], cours: COURS },
    });
    render(<EspaceParent><MesFiches /></EspaceParent>);
    await screen.findByRole('heading', { name: /Anglais pro/ });
    expect(screen.queryByText(/crédits? de fiches/)).not.toBeInTheDocument();
  });

  it('il crée une catégorie depuis « Mes catégories »', async () => {
    espaceApi.creerCategorie.mockResolvedValue({ data: { id: 4, libelle: 'Code de la route', couleur: '#16A34A', ordre: 2, nombreCours: 0 } });
    render(<EspaceParent><MesFiches /></EspaceParent>);

    fireEvent.click(await screen.findByRole('button', { name: /Mes catégories/ }));
    fireEvent.change(screen.getByLabelText('Nom de la nouvelle catégorie'), { target: { value: 'Code de la route' } });
    fireEvent.click(screen.getByLabelText('Couleur #16A34A'));
    fireEvent.click(screen.getByRole('button', { name: 'Créer' }));

    expect(await screen.findByText('Code de la route')).toBeInTheDocument();
    expect(espaceApi.creerCategorie).toHaveBeenCalledWith('Code de la route', '#16A34A');
  });
});

describe('la création', () => {
  it('il choisit une de SES catégories (ou aucune), sans scanner au téléphone', async () => {
    render(<EspaceParent><NouveauCours /></EspaceParent>);

    expect(await screen.findByText('Choisissez une catégorie')).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: 'Anglais pro' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Sans catégorie' })).toBeInTheDocument();
    expect(screen.queryByText(/Scanner avec mon téléphone/)).not.toBeInTheDocument();
    // Un adulte : tous les types, même ceux que le CP n'a pas.
    expect(screen.getByRole('radio', { name: /Fiche méthode/ })).toBeInTheDocument();
  });
});
