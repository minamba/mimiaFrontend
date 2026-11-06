/**
 * LE TEMPS QUI RESTE, SUR « MES ENFANTS » — Camara, le 01/11/2026.
 */
import { render, screen } from '@testing-library/react';
import ResteForfait from '../components/ResteForfait';
import { getMonQuota } from '../lib/api/abonnementApi';

// Comme les autres tests de l'application : le routeur réduit à un lien.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

jest.mock('../lib/api/abonnementApi', () => ({
  getMonQuota: jest.fn(),
}));

const afficher = () => render(<ResteForfait />);

describe('ResteForfait', () => {
  it('affiche les heures restantes avec un lien vers l’onglet du forfait', async () => {
    getMonQuota.mockResolvedValue({
      status: 200,
      data: { offreLibelle: 'Famille', minutesRestantes: 1424, partConsommee: 0.01 },
    });

    afficher();

    const lien = await screen.findByRole('link', { name: /Famille.*23 h 44.*Voir mon forfait/ });
    expect(lien).toHaveAttribute('href', '/profil?onglet=forfait');
    expect(lien).toHaveClass('reste-forfait--normal');
  });

  it('passe à l’ambre sous 20 % du pot', async () => {
    getMonQuota.mockResolvedValue({
      status: 200,
      data: { offreLibelle: 'Famille', minutesRestantes: 30, partConsommee: 0.9 },
    });

    afficher();

    expect(await screen.findByRole('link')).toHaveClass('reste-forfait--bas');
  });

  it('n’affiche rien sans abonnement ni en cas d’erreur', async () => {
    getMonQuota.mockResolvedValue({ status: 204, data: '' });
    const { container, unmount } = afficher();
    await Promise.resolve();
    expect(container).toBeEmptyDOMElement();
    unmount();

    getMonQuota.mockRejectedValue(new Error('réseau'));
    const second = afficher();
    await Promise.resolve();
    expect(second.container).toBeEmptyDOMElement();
  });
});
