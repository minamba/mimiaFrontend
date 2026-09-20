import { render, screen } from '@testing-library/react';
import DroitsAdmin from '../components/DroitsAdmin';
import { getOngletsAdmin } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({
  getOngletsAdmin: jest.fn(),
  definirOngletsAdmin: jest.fn(),
}));

describe('DroitsAdmin — les blocs de l’onglet Parents', () => {
  it('range coût et revenu sous leur propre titre, avec leur état', async () => {
    getOngletsAdmin.mockResolvedValue({
      data: { toutes: ['stats', 'parents', 'cout', 'revenu'], accordes: ['parents', 'revenu'] },
    });

    render(<DroitsAdmin parent={{ id: 4, prenom: 'Awa' }} onFermer={() => {}} />);

    expect(await screen.findByText('Blocs de l’onglet Parents')).toBeInTheDocument();
    expect(screen.getByLabelText('Ce que le produit me coûte')).not.toBeChecked();
    expect(screen.getByLabelText('Ce que le produit me rapporte')).toBeChecked();
  });
});
