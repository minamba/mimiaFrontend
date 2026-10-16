/**
 * LES FICHES DE RÉVISION DANS « MON FORFAIT » — Camara, le 16/10/2026 :
 * l'achat des packs se fait dans le compte du parent, dans un encadré À PART
 * des heures de cours.
 *
 * CE QUI SE TESTE ICI
 * -------------------
 * 1. L'encadré dit la réserve de la famille et les fiches du mois de chaque
 *    enfant.
 * 2. Acheter passe par une confirmation qui dit que les fiches n'expirent
 *    pas, puis part au paiement (ou crédite un compte exempté et se relit).
 * 3. Module éteint : rien ne s'affiche.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FichesDuForfait from '../components/FichesDuForfait';
import { acheterFiches, getFichesFamille } from '../lib/api/abonnementApi';

jest.mock('../lib/api/abonnementApi', () => ({
  getFichesFamille: jest.fn(),
  acheterFiches: jest.fn(),
}));

let mockOuvert = true;
jest.mock('../lib/storage/modeTest', () => ({ useFichesRevision: () => mockOuvert }));

// Le forfait des heures n'est pas rendu ici : seules ses briques réutilisées.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useLocation: () => ({ search: '' }),
}));

const famille = (credits = 0) => ({
  credits,
  maximum: 20,
  remiseLe: '2026-11-06T00:00:00Z',
  enfants: [
    { id: 1, prenom: 'Bilal', utilisees: 7 },
    { id: 2, prenom: 'Zakariya', utilisees: 20 },
  ],
  packs: [
    { code: 'FICHES10', libelle: '10 fiches de révision', fiches: 10, prixCentimes: 599 },
    { code: 'FICHES20', libelle: '20 fiches de révision', fiches: 20, prixCentimes: 999 },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  mockOuvert = true;
});

it('dit les crédits de la famille et les cours du mois de chaque enfant', async () => {
  getFichesFamille.mockResolvedValue({ data: famille(12) });
  render(<FichesDuForfait />);

  expect(await screen.findByText('Fiches de révision')).toBeInTheDocument();
  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByText('crédits')).toBeInTheDocument();
  expect(screen.getByText(/20 cours par enfant et par mois · remis à zéro le 6 novembre/)).toBeInTheDocument();
  expect(screen.getByText('Bilal')).toBeInTheDocument();
  expect(screen.getByText('7 / 20 cours')).toBeInTheDocument();
  expect(screen.getByText('20 / 20 cours')).toBeInTheDocument();
});

it('achète un pack après une confirmation qui dit qu’un crédit vaut un cours', async () => {
  getFichesFamille.mockResolvedValue({ data: famille(0) });
  // Compte exempté : crédité sans paiement, l'encadré se relit.
  acheterFiches.mockResolvedValue({ data: { credits: 10 } });
  render(<FichesDuForfait />);

  fireEvent.click(await screen.findByRole('button', { name: /\+10 crédits/ }));
  expect(screen.getByRole('dialog')).toHaveTextContent('1 crédit = 1 cours importé');

  fireEvent.click(screen.getByRole('button', { name: /Confirmer/ }));
  await waitFor(() => expect(acheterFiches).toHaveBeenCalledWith('FICHES10'));
  await waitFor(() => expect(getFichesFamille).toHaveBeenCalledTimes(2));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('dit pourquoi le paiement ne s’ouvre pas', async () => {
  getFichesFamille.mockResolvedValue({ data: famille(0) });
  acheterFiches.mockRejectedValue({ response: { data: { message: 'Le paiement est momentanément indisponible.' } } });
  render(<FichesDuForfait />);

  fireEvent.click(await screen.findByRole('button', { name: /\+20 crédits/ }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer/ }));

  expect(await screen.findByText('Le paiement est momentanément indisponible.')).toBeInTheDocument();
});

it('en essai : l’encadré est masqué, rien à acheter', async () => {
  getFichesFamille.mockResolvedValue({ data: { ...famille(0), forfait: false, motif: 'essai' } });
  const { container } = render(<FichesDuForfait />);

  await waitFor(() => expect(getFichesFamille).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
  expect(screen.queryByRole('button', { name: /crédits/ })).not.toBeInTheDocument();
});

it('module éteint : rien', () => {
  mockOuvert = false;
  const { container } = render(<FichesDuForfait />);

  expect(container).toBeEmptyDOMElement();
  expect(getFichesFamille).not.toHaveBeenCalled();
});
