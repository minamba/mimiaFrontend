/**
 * LES COURRIELS QUI ARRIVENT — Camara, le 19/10/2026 : une notification en bas
 * à droite, avec une petite cloche, et un clic qui ouvre la boîte.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import NotificationsMail from '../components/NotificationsMail';
import { sonnerCloche } from '../lib/sons/cloche';

const mockNaviguer = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNaviguer }));

let mockEcouteur = null;
jest.mock('../lib/hooks/useEvenementsAdmin', () => ({
  useEvenementsAdmin: (fn) => { mockEcouteur = fn; },
}));

jest.mock('../lib/sons/cloche', () => ({ preparerCloche: jest.fn(), sonnerCloche: jest.fn() }));

const COURRIEL = {
  type: 'mail',
  boite: 'moi',
  nonLus: 3,
  messages: [{ id: 41, deNom: 'Sophie Martin', deAdresse: 'sophie@exemple.fr', sujet: 'Question sur le forfait', extrait: 'Bonjour, je voulais savoir…' }],
};

beforeEach(() => {
  jest.useFakeTimers();
  mockNaviguer.mockReset();
  sonnerCloche.mockReset();
});
afterEach(() => jest.useRealTimers());

it('un courriel arrivé : la carte, la cloche, et l’événement relayé à la page', () => {
  const relaye = jest.fn();
  window.addEventListener('mimia:nouveau-mail', relaye);
  render(<NotificationsMail />);

  act(() => { mockEcouteur('mail', COURRIEL); });

  expect(screen.getByText('Nouveau mail')).toBeInTheDocument();
  expect(screen.getByText('Sophie Martin')).toBeInTheDocument();
  expect(screen.getByText('Question sur le forfait')).toBeInTheDocument();
  expect(sonnerCloche).toHaveBeenCalledTimes(1);
  expect(relaye).toHaveBeenCalledTimes(1);
  window.removeEventListener('mimia:nouveau-mail', relaye);
});

it('un clic ouvre la boîte ; la carte s’efface seule après dix secondes', () => {
  render(<NotificationsMail />);
  act(() => { mockEcouteur('mail', COURRIEL); });

  fireEvent.click(screen.getByText('Question sur le forfait'));
  expect(mockNaviguer).toHaveBeenCalledWith('/admin?onglet=mails&boite=moi');
  expect(screen.queryByText('Question sur le forfait')).not.toBeInTheDocument();

  act(() => { mockEcouteur('mail', { ...COURRIEL, messages: [{ ...COURRIEL.messages[0], id: 42 }] }); });
  expect(screen.getByText('Question sur le forfait')).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(10001); });
  expect(screen.queryByText('Question sur le forfait')).not.toBeInTheDocument();
});

it('la souris sur la carte l’arrête ; elle repart avec le temps qui restait', () => {
  render(<NotificationsMail />);
  act(() => { mockEcouteur('mail', COURRIEL); });
  const carte = screen.getByRole('status');

  act(() => { jest.advanceTimersByTime(6000); });
  fireEvent.mouseEnter(carte);
  act(() => { jest.advanceTimersByTime(30000); });
  expect(screen.getByText('Question sur le forfait')).toBeInTheDocument();

  fireEvent.mouseLeave(carte);
  act(() => { jest.advanceTimersByTime(3900); });
  expect(screen.getByText('Question sur le forfait')).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('Question sur le forfait')).not.toBeInTheDocument();
});

it('les autres événements d’administration ne sonnent pas', () => {
  render(<NotificationsMail />);
  act(() => { mockEcouteur('signalement', { type: 'signalement' }); });

  expect(sonnerCloche).not.toHaveBeenCalled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
