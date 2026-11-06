/**
 * LA BOÎTE AUX LETTRES EN BAS À GAUCHE — Camara, le 20/10/2026 : un badge des
 * non lus, une respiration à l'arrivée d'un courriel, un clic qui mène aux mails.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import BoutonMails from '../components/BoutonMails';
import { getCompteursMessagerie } from '../lib/api/adminApi';

const mockNaviguer = jest.fn();
let mockChemin = '/eleves';
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNaviguer,
  useLocation: () => ({ pathname: mockChemin }),
}));
jest.mock('../lib/api/adminApi', () => ({ getCompteursMessagerie: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockChemin = '/eleves';
});

it('affiche le nombre de non lus et mène aux mails', async () => {
  getCompteursMessagerie.mockResolvedValue({ data: { nonLus: 3 } });
  render(<BoutonMails />);

  const bouton = await screen.findByRole('button', { name: 'Mes mails — 3 non lus' });
  expect(bouton).toHaveTextContent('3');
  expect(getCompteursMessagerie).toHaveBeenCalledWith('moi');

  fireEvent.click(bouton);
  expect(mockNaviguer).toHaveBeenCalledWith('/admin?onglet=mails&boite=moi');
});

it('respire quand un courriel arrive, jusqu’au clic', async () => {
  getCompteursMessagerie.mockResolvedValue({ data: { nonLus: 0 } });
  render(<BoutonMails />);
  const bouton = await screen.findByRole('button', { name: 'Mes mails' });
  expect(bouton).not.toHaveClass('est-nouveau');

  act(() => {
    window.dispatchEvent(new CustomEvent('mimia:nouveau-mail', { detail: { boite: 'moi', nonLus: 1, messages: [{ id: 9 }] } }));
  });
  expect(bouton).toHaveClass('est-nouveau');
  expect(bouton).toHaveTextContent('1');

  fireEvent.click(bouton);
  expect(bouton).not.toHaveClass('est-nouveau');
});

it('suit la messagerie ouverte, et se tait sans boîte connectée', async () => {
  getCompteursMessagerie.mockRejectedValue({ response: { status: 409 } });
  render(<BoutonMails />);
  await waitFor(() => expect(getCompteursMessagerie).toHaveBeenCalled());
  expect(screen.getByRole('button', { name: 'Mes mails' })).not.toHaveTextContent(/\d/);

  act(() => { window.dispatchEvent(new CustomEvent('mimia:non-lus', { detail: { boite: 'moi', nonLus: 5 } })); });
  expect(screen.getByRole('button', { name: 'Mes mails — 5 non lus' })).toBeInTheDocument();

  // La boîte du support ne compte pas pour cette icône.
  act(() => { window.dispatchEvent(new CustomEvent('mimia:non-lus', { detail: { boite: 'support', nonLus: 40 } })); });
  expect(screen.getByRole('button', { name: 'Mes mails — 5 non lus' })).toBeInTheDocument();
});

it('se cache pendant une séance', () => {
  getCompteursMessagerie.mockResolvedValue({ data: { nonLus: 2 } });
  mockChemin = '/eleves/4/matieres/2/chat';
  const { container } = render(<BoutonMails />);
  expect(container).toBeEmptyDOMElement();
});

it('le bouclier mène à l’administration', async () => {
  getCompteursMessagerie.mockResolvedValue({ data: { nonLus: 0 } });
  render(<BoutonMails />);
  fireEvent.click(await screen.findByRole('button', { name: 'Administration' }));
  expect(mockNaviguer).toHaveBeenCalledWith('/admin');
});
