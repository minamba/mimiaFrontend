/**
 * UNE PARTIE LANCÉE EST UNE ACTIVITÉ — Camara, le 11/10/2026 : un enfant qui ne
 * faisait que jouer gardait une « dernière activité » figée. La partie lancée
 * le signale au serveur, seulement quand c'est l'enfant qui joue.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JeuxEleve from '../components/JeuxEleve';
import { noterActivite } from '../lib/api/elevesApi';

let mockSession = null;

jest.mock('../lib/api/elevesApi', () => ({
  ...jest.requireActual('../lib/api/elevesApi'),
  noterActivite: jest.fn(() => Promise.resolve()),
}));

jest.mock('../lib/hooks/useAccesForfait', () => ({
  __esModule: true,
  ...jest.requireActual('../lib/hooks/useAccesForfait'),
  default: () => ({ ouvert: true, motif: null }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir({
    eleves: { liste: [{ id: 24, prenom: 'Lina', niveauCode: 'CE2', niveauLibelle: 'CE2', niveauCycle: 'Primaire' }] },
  }),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams('classe=CE1&jeu=course-des-tables')],
}));

jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => mockSession }));

jest.mock('../lib/jeux/voix/useVoixJeu', () => () => ({
  dire: () => {}, couper: () => {}, muet: false, basculerMuet: () => {}, relire: () => {},
}));

async function lancerUnePartie() {
  render(<JeuxEleve />);
  await userEvent.click(screen.getByRole('button', { name: /^Jouer tranquillement/ }));
}

describe('la dernière activité', () => {
  beforeEach(() => noterActivite.mockImplementation(() => Promise.resolve()));

  it('avance quand l’enfant, connecté avec son code, lance une partie', async () => {
    mockSession = { jeton: 'x', eleveId: 24, prenom: 'Lina', niveau: 'CE2', niveauCode: 'CE2', cycle: 'Primaire' };
    await lancerUnePartie();
    expect(noterActivite).toHaveBeenCalledWith('24');
  });

  it('ne bouge pas quand c’est le parent qui essaie le jeu', async () => {
    mockSession = null;
    await lancerUnePartie();
    expect(noterActivite).not.toHaveBeenCalled();
  });
});
