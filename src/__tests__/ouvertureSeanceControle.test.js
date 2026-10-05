/**
 * UNE SÉANCE DE CONTRÔLE PASSE PAR LES DEUX QUESTIONS D'AVANT COURS —
 * Camara, le 26/09/2026 : « pour faire le point sur un contrôle, on rentre
 * directement dans le cours sans savoir si l'enfant a un casque ».
 *
 * La durée, puis le casque, comme depuis l'accueil ; la séance s'ouvre avec
 * les deux réponses dans l'adresse, et le mode du contrôle.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ControleFiche from '../components/ControleFiche';
import { getControle, getMatieresEleve } from '../lib/api/elevesApi';

const mockNaviguer = jest.fn();

jest.mock('../lib/api/elevesApi', () => ({
  getControle: jest.fn(),
  getMatieresEleve: jest.fn(),
  supprimerControle: jest.fn(),
  creerControle: jest.fn(),
  modifierControle: jest.fn(),
  getCoursControle: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('react-redux', () => ({
  useSelector: (lire) => lire({ auth: { estAdmin: false } }),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '9', controleId: '42' }),
  useSearchParams: () => [new URLSearchParams('')],
  useNavigate: () => mockNaviguer,
}));

const CONTROLE = (surcharges) => ({
  id: 42,
  matiereId: 1,
  matiereLibelle: 'Mathématiques',
  sujet: 'Théorème de Thalès',
  dateControle: '2026-09-20T00:00:00',
  heureControle: null,
  nombrePreparations: 0,
  dernierePreparationLe: null,
  bilanLe: null,
  preparation: {
    pourcent: 0, perimetreConnu: false, total: 0, acquises: 0, notions: [],
  },
  ...surcharges,
});

beforeEach(() => {
  jest.clearAllMocks();
  getMatieresEleve.mockResolvedValue({ data: [{ id: 1, active: true, profPrenom: 'Nora' }] });
});

test('« Faire le point » demande la durée, puis le casque, puis ouvre le bilan', async () => {
  getControle.mockResolvedValue({ data: CONTROLE({ joursRestants: -3 }) });
  render(<ControleFiche />);

  await userEvent.click(await screen.findByRole('button', { name: 'Faire le point sur ce contrôle' }));

  // La durée d'abord — rien ne s'ouvre encore.
  expect(screen.getByText('Combien de temps aujourd\'hui ?')).toBeInTheDocument();
  expect(mockNaviguer).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /25/ }));

  // Puis le casque.
  expect(screen.getByText('Tu as un casque ou des écouteurs ?')).toBeInTheDocument();
  expect(mockNaviguer).not.toHaveBeenCalled();

  await userEvent.click(screen.getByRole('button', { name: /Oui, j’ai un casque/ }));

  expect(mockNaviguer).toHaveBeenCalledWith(
    '/eleves/9/matieres/1/chat?duree=25&casque=1&mode=bilan&controleId=42',
  );
});

test('« Préparer ce contrôle » passe par les mêmes questions', async () => {
  getControle.mockResolvedValue({ data: CONTROLE({ joursRestants: 4 }) });
  render(<ControleFiche />);

  await userEvent.click(await screen.findByRole('button', { name: 'Préparer ce contrôle' }));
  await userEvent.click(screen.getByRole('button', { name: /35/ }));
  await userEvent.click(screen.getByRole('button', { name: /Non, haut-parleur/ }));

  expect(mockNaviguer).toHaveBeenCalledWith(
    '/eleves/9/matieres/1/chat?duree=35&casque=0&mode=controle&controleId=42',
  );
});

test('annuler au casque ne lance rien', async () => {
  getControle.mockResolvedValue({ data: CONTROLE({ joursRestants: -3 }) });
  render(<ControleFiche />);

  await userEvent.click(await screen.findByRole('button', { name: 'Faire le point sur ce contrôle' }));
  await userEvent.click(screen.getByRole('button', { name: /25/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Annuler' }));

  expect(screen.queryByText('Tu as un casque ou des écouteurs ?')).not.toBeInTheDocument();
  expect(mockNaviguer).not.toHaveBeenCalled();
});
