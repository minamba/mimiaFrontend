import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TarifsFournisseurs, { enDollars } from '../components/TarifsFournisseurs';
import { getTarifs, modifierTarif } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({
  getTarifs: jest.fn(),
  modifierTarif: jest.fn(),
  // FournisseursIA importe aussi ces deux-là.
  getFournisseurs: jest.fn(),
  verifierFournisseurs: jest.fn(),
}));

const sonnet = {
  id: 1, fournisseur: 'anthropic', modele: 'claude-sonnet-5', usage: 'Les professeurs.',
  prixEntree: 2, prixSortie: 10, prixMinute: null,
  prixEntreeApplique: 2, prixSortieApplique: 10, prixMinuteApplique: null,
  dateMiseAJour: '2026-09-19T00:00:00', derniereVerification: null, statut: 'a_jour',
};
const transcription = {
  id: 5, fournisseur: 'openai', modele: 'gpt-transcribe', usage: 'Le micro.',
  prixEntree: null, prixSortie: null, prixMinute: 0.0045,
  prixEntreeApplique: null, prixSortieApplique: null, prixMinuteApplique: null,
  dateMiseAJour: '2026-09-19T00:00:00', derniereVerification: null, statut: 'non_compte',
};

describe('TarifsFournisseurs', () => {
  beforeEach(() => {
    getTarifs.mockResolvedValue({ data: [sonnet, transcription] });
    modifierTarif.mockReset();
  });

  it('écrit les prix à la française', () => {
    expect(enDollars(2)).toBe('2 $');
    expect(enDollars(0.015)).toBe('0,015 $');
    expect(enDollars(null)).toBe('—');
  });

  it('le statut est la date de mise à jour, et la veille pas encore passée se dit', async () => {
    render(<TarifsFournisseurs />);
    expect(await screen.findByText('claude-sonnet-5')).toBeInTheDocument();
    expect(screen.getByText('Mis à jour le 19/09/2026')).toBeInTheDocument();
    expect(screen.getByText('pas encore')).toBeInTheDocument();
    expect(screen.queryByText(/Appliquer/)).not.toBeInTheDocument();
  });

  it('dit « non compté » pour la transcription d’OpenAI', async () => {
    render(<TarifsFournisseurs />);
    await screen.findByText('claude-sonnet-5');
    fireEvent.click(screen.getByRole('tab', { name: 'OpenAI' }));
    expect(screen.getByText('gpt-transcribe')).toBeInTheDocument();
    expect(screen.getByText('non compté')).toBeInTheDocument();
  });

  it('corrige un prix à la main, virgule acceptée, et affiche la nouvelle date', async () => {
    modifierTarif.mockResolvedValue({ data: { ...sonnet, prixEntree: 2.5, dateMiseAJour: '2026-09-20T08:00:00' } });
    render(<TarifsFournisseurs />);
    await screen.findByText('claude-sonnet-5');

    fireEvent.click(screen.getByRole('button', { name: 'Corriger à la main' }));
    fireEvent.change(screen.getByLabelText('Entrée ($ / million)'), { target: { value: '2,5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(modifierTarif).toHaveBeenCalledWith(1, { prixEntree: 2.5, prixSortie: 10, prixMinute: null }));
    expect(await screen.findByText('Mis à jour le 20/09/2026')).toBeInTheDocument();
  });
});
