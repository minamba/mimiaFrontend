/**
 * À PARTIR DE SOLO — Camara, le 15/11/2026 : podcasts et conseillère fermés en essai et avec Starter (« il faut minimum
 * l'abonnement Solo »), et « le bouton est visible mais l'utilisateur est bloqué avec un message ».
 *
 * CE QUI SE TESTE ICI
 * 1. L'espace parent : « Mes podcasts » reste dans le menu ; pour Starter, le clic ouvre la fenêtre au lieu de la page.
 *    Pour une autre formule, le clic suit le lien.
 * 2. Les pages, si on y arrive quand même (lien gardé, adresse tapée) : la liste dit pourquoi, rien d'autre ; la page
 *    de création aussi (refus du serveur pour le parent).
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { EspaceFichesContext } from '../lib/mesFiches/espaceFiches';
import EspaceParent from '../components/espaceParent/EspaceParent';
import MesPodcasts from '../components/podcasts/MesPodcasts';
import NouveauPodcast from '../components/podcasts/NouveauPodcast';
import httpClient from '../lib/api/httpClient';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

let mockEspace = null;
jest.mock('../lib/hooks/useEspaceParent', () => ({ __esModule: true, default: () => mockEspace }));
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  NavLink: ({ to, children, className, ...reste }) => (
    <a href={to} className={typeof className === 'function' ? className({ isActive: false }) : className} {...reste}>{children}</a>
  ),
  Navigate: () => null,
  useParams: () => ({}),
  useNavigate: () => jest.fn(),
}));
jest.mock('../lib/hooks/useAccesForfait', () => ({ __esModule: true, default: () => ({ ouvert: null, motif: null }) }));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => null }));
jest.mock('../components/PieceJointe', () => ({ TYPES_ACCEPTES: 'image/png', reduire: (f) => Promise.resolve(f) }));
jest.mock('../components/ScanMobileModale', () => () => null);
jest.mock('../components/Avatar', () => function Avatar({ nom }) { return <span>{`avatar-${nom}`}</span>; });

const MESSAGE = 'Il faut au minimum l’abonnement Solo pour accéder aux podcasts. Choisissez la formule Solo ou une formule supérieure.';

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  const refus = { response: { status: 403, data: { message: MESSAGE, nonInclus: true } } };
  httpClient.get.mockImplementation((url) => {
    if (url === '/parents/moi/mes-podcasts') return Promise.resolve({ data: { actif: true, forfait: false, nonInclus: true, cours: [] } });
    if (url.startsWith('/parents/moi/mes-podcasts/')) return Promise.reject(refus);
    if (url === '/parents/moi/categories') return Promise.resolve({ data: [] });
    return Promise.resolve({ data: {} });
  });
});

describe('le menu de l’espace parent', () => {
  it('Starter : le bouton reste, le clic ouvre la fenêtre', () => {
    mockEspace = { fiches: true, podcasts: true, podcastsInclus: false };
    render(<EspaceParent><p>page</p></EspaceParent>);

    const lien = screen.getByRole('link', { name: /Mes podcasts/ });
    expect(lien).toBeInTheDocument();

    // Le lien n'est pas suivi : l'événement est annulé.
    expect(fireEvent.click(lien)).toBe(false);
    const fenetre = screen.getByRole('dialog', { name: 'À partir de la formule Solo' });
    expect(fenetre).toHaveTextContent(MESSAGE);
    expect(screen.getByRole('link', { name: 'Voir les formules' })).toHaveAttribute('href', '/tarifs');

    fireEvent.click(screen.getByRole('button', { name: 'D’accord' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('une autre formule : le clic suit le lien', () => {
    mockEspace = { fiches: true, podcasts: true, podcastsInclus: true };
    render(<EspaceParent><p>page</p></EspaceParent>);

    expect(fireEvent.click(screen.getByRole('link', { name: /Mes podcasts/ }))).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('les pages, si on y arrive quand même', () => {
  it('la liste dit pourquoi, sans bouton de création ni jauge', async () => {
    render(<EspaceFichesContext.Provider value><MesPodcasts /></EspaceFichesContext.Provider>);

    expect(await screen.findByText('Les podcasts sont réservés à partir de la formule Solo.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Créer un podcast/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/pas encore de podcast/)).not.toBeInTheDocument();
  });

  it('la création aussi, sur le refus du serveur', async () => {
    render(<EspaceFichesContext.Provider value><NouveauPodcast /></EspaceFichesContext.Provider>);

    expect(await screen.findByText('Les podcasts sont réservés à partir de la formule Solo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir les formules' })).toHaveAttribute('href', '/tarifs');
  });
});

describe('le message, selon qui lit et ce qui est fermé', () => {
  const { messageSolo } = jest.requireActual('../components/podcasts/PodcastsNonInclus');

  it('podcasts et conseillère, enfant et parent', () => {
    expect(messageSolo(true, 'podcasts')).toBe('Il faut au minimum l’abonnement Solo pour accéder aux podcasts. Demande à tes parents.');
    expect(messageSolo(false, 'conseillere')).toBe(
      'Il faut au minimum l’abonnement Solo pour parler avec la conseillère d’orientation. Choisissez la formule Solo ou une formule supérieure.',
    );
  });
});

describe('la conseillère pendant l’essai', () => {
  // eslint-disable-next-line global-require
  const { ChoixDuree } = require('../components/OuvertureSeance');
  const maelle = { code: 'ORIENTATION', profPrenom: 'Maëlle' };
  const note = /Ensuite, elle est incluse uniquement\s+à partir de l’abonnement Solo/;

  it('l’ouverture de sa séance dit qu’elle n’est incluse qu’à partir de Solo', () => {
    render(<ChoixDuree matiere={maelle} essai onValider={() => {}} onAnnuler={() => {}} />);
    expect(screen.getByText(note)).toBeInTheDocument();
  });

  it('rien de tel hors essai, ni pour un autre professeur', () => {
    const { unmount } = render(<ChoixDuree matiere={maelle} onValider={() => {}} onAnnuler={() => {}} />);
    expect(screen.queryByText(note)).not.toBeInTheDocument();
    unmount();
    render(<ChoixDuree matiere={{ code: 'MATHS', profPrenom: 'Nora' }} essai onValider={() => {}} onAnnuler={() => {}} />);
    expect(screen.queryByText(note)).not.toBeInTheDocument();
  });
});
