/**
 * MES COURRIELS — Camara, le 17/10/2026 : un parent désabonné peut se réabonner
 * depuis Mon compte › Paramètres, sans avoir à retrouver un ancien courriel.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MesCourriels } from '../components/MonProfil';
import { getCourriels, choisirCourriel } from '../lib/api/profilApi';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir({ eleves: { liste: [] }, referentiel: { niveaux: [], academies: [] }, profil: {} }),
}));
jest.mock('../lib/api/profilApi', () => ({
  getCourriels: jest.fn(),
  choisirCourriel: jest.fn(),
}));

describe('Mes courriels', () => {
  beforeEach(() => {
    getCourriels.mockResolvedValue({
      data: [
        { categorie: 'diffusion', abonne: true },
        { categorie: 'avis', abonne: false },
        { categorie: 'relance', abonne: true },
        { categorie: 'rappels', abonne: true },
      ],
    });
    choisirCourriel.mockResolvedValue({});
  });

  it('montre chaque catégorie et son état', async () => {
    render(<MesCourriels />);
    expect(await screen.findByRole('switch', { name: 'Les demandes d’avis' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('switch', { name: 'Recevoir les offres et nouveautés par email' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/arrivent toujours/)).toBeInTheDocument();
  });

  it('se réabonne d’un clic', async () => {
    render(<MesCourriels />);
    fireEvent.click(await screen.findByRole('switch', { name: 'Les demandes d’avis' }));

    await waitFor(() => expect(choisirCourriel).toHaveBeenCalledWith('avis', true));
    await waitFor(() => expect(screen.getByRole('switch', { name: 'Les demandes d’avis' })).toHaveAttribute('aria-checked', 'true'));
  });

  // LE CONSENTEMENT AUX OFFRES (19/11/2026) : l'interrupteur se coupe et se rallume depuis l'espace parent.
  it('retire puis redonne son accord aux offres par email', async () => {
    render(<MesCourriels />);
    const offres = await screen.findByRole('switch', { name: 'Recevoir les offres et nouveautés par email' });

    fireEvent.click(offres);
    await waitFor(() => expect(choisirCourriel).toHaveBeenCalledWith('diffusion', false));
    await waitFor(() => expect(offres).toHaveAttribute('aria-checked', 'false'));

    fireEvent.click(offres);
    await waitFor(() => expect(choisirCourriel).toHaveBeenLastCalledWith('diffusion', true));
    await waitFor(() => expect(offres).toHaveAttribute('aria-checked', 'true'));
  });
});
