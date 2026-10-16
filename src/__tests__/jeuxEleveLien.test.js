/**
 * ARRIVER SUR « MES JEUX » PAR LA CARTE DU PROFESSEUR — Camara, le 23/09/2026.
 *
 * `?classe=CE1&jeu=course-des-tables` doit ouvrir le jeu directement, à cette
 * classe. Et les mêmes gardes que la frise valent ici : une classe au-dessus
 * de la sienne ne s'ouvre pas, un jeu inconnu non plus — la page s'ouvre alors
 * comme d'habitude, sans erreur.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import JeuxEleve from '../components/JeuxEleve';

const ETAT = { eleves: { liste: [] } };

let mockRecherche = '';

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(mockRecherche)],
}));

// Un enfant de CE2, connecté avec son code.
jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 24, prenom: 'Lina', niveau: 'CE2', niveauCode: 'CE2', cycle: 'Primaire' }),
}));

// LE FORFAIT DE LA FAMILLE (16/10/2026) : ouvert par défaut ; un test le ferme.
let mockAcces = { ouvert: true, motif: null };
jest.mock('../lib/hooks/useAccesForfait', () => ({
  __esModule: true,
  ...jest.requireActual('../lib/hooks/useAccesForfait'),
  default: () => mockAcces,
}));

// Les jeux parlent : on fait taire la voix, ce n'est pas elle qu'on teste.
jest.mock('../lib/jeux/voix/useVoixJeu', () => () => ({
  dire: () => {}, couper: () => {}, muet: false, basculerMuet: () => {}, relire: () => {},
}));

beforeEach(() => { mockAcces = { ouvert: true, motif: null }; });

describe('sans vrai forfait (16/10/2026)', () => {
  it('la carte du professeur n’ouvre pas le jeu : elle dit qu’il faut être abonné', () => {
    mockAcces = { ouvert: false, motif: 'essai' };
    mockRecherche = 'classe=CE1&jeu=course-des-tables';
    render(<JeuxEleve />);

    expect(screen.queryByRole('button', { name: /Revenir aux jeux/ })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Il faut être abonné pour jouer');
    expect(screen.getByRole('dialog')).toHaveTextContent('Demande à tes parents');
  });

  it('les jeux sont grisés ; un clic explique au lieu de lancer', () => {
    mockAcces = { ouvert: false, motif: 'sans-forfait' };
    mockRecherche = '';
    render(<JeuxEleve />);

    expect(screen.getByText('Les jeux sont réservés aux familles abonnées.')).toBeInTheDocument();
    const cartes = screen.getAllByRole('button', { name: /réservé aux familles abonnées/ });
    expect(cartes.length).toBeGreaterThan(0);

    fireEvent.click(cartes[0]);
    expect(screen.getByRole('dialog')).toHaveTextContent('Il faut être abonné pour jouer');
    expect(screen.queryByRole('button', { name: /Revenir aux jeux/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'D’accord' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('le lien vers un jeu précis', () => {
  it('ouvre le jeu demandé, à la classe demandée, quand elle est ouverte', () => {
    mockRecherche = 'classe=CE1&jeu=course-des-tables';
    render(<JeuxEleve />);

    // Le jeu remplace la grille : son bouton de sortie est là, la frise non.
    expect(screen.getByRole('button', { name: /Revenir aux jeux/ })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Choisir une classe/ })).not.toBeInTheDocument();
  });

  it('ignore une classe au-dessus de la sienne : la page s’ouvre normalement', () => {
    mockRecherche = 'classe=CM2&jeu=coffre-des-centaines';
    render(<JeuxEleve />);

    expect(screen.getByRole('navigation', { name: /Choisir une classe/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revenir aux jeux/ })).not.toBeInTheDocument();
  });

  it('ignore un jeu qui n’existe pas à cette classe', () => {
    mockRecherche = 'classe=CE1&jeu=le-robot';
    render(<JeuxEleve />);

    expect(screen.getByRole('navigation', { name: /Choisir une classe/ })).toBeInTheDocument();
  });

  it('sans paramètres, rien ne change', () => {
    mockRecherche = '';
    render(<JeuxEleve />);

    expect(screen.getByRole('navigation', { name: /Choisir une classe/ })).toBeInTheDocument();
  });
});

// REVENIR LÀ OÙ L'ON ÉTAIT — Camara, le 08/10/2026 : fermer un jeu renvoyait
// en haut de la liste. La page doit revenir à sa position d'avant, et le focus
// sur la carte du jeu qu'on vient de quitter.
describe('le retour à la liste', () => {
  it('revient à la position d’avant l’ouverture, sur la carte du jeu', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    mockRecherche = '';
    const scrollTo = jest.fn();
    const scrollToAvant = window.scrollTo;
    window.scrollTo = scrollTo;
    Object.defineProperty(window, 'scrollY', { value: 1234, configurable: true });

    try {
      const { container } = render(<JeuxEleve />);
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const carte = container.querySelector('[data-jeu]');
      const cle = carte.getAttribute('data-jeu');
      await userEvent.click(carte);
      await userEvent.click(screen.getAllByRole('button', { name: /Revenir aux jeux/ })[0]);

      expect(scrollTo).toHaveBeenCalledWith({ top: 1234, behavior: 'auto' });
      // La liste a été remontée : la carte est un nouvel élément, on la retrouve par sa clé.
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      expect(container.querySelector(`[data-jeu="${cle}"]`)).toHaveFocus();
    } finally {
      window.scrollTo = scrollToAvant;
    }
  });
});
