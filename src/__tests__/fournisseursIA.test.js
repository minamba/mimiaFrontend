/**
 * L'ONGLET « ANTHROPIC / OPENAI ».
 *
 * Trois garanties : l'état s'écrit en toutes lettres (jamais la couleur
 * seule), un crédit épuisé mène au rechargement, et « Vérifier maintenant »
 * affiche ce que la nouvelle vérification a constaté.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import FournisseursIA, { ilYA } from '../components/FournisseursIA';
import { getFournisseurs, verifierFournisseurs } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({
  getFournisseurs: jest.fn(),
  verifierFournisseurs: jest.fn(),
}));

const il = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

const anthropic = (surcharge = {}) => ({
  code: 'anthropic',
  nom: 'Anthropic',
  usage: 'Claude : les professeurs en séance.',
  lienFacturation: 'https://console.anthropic.com/settings/billing',
  modele: 'claude-haiku-4-5',
  statut: 'ok',
  dureeMs: 420,
  verifieLe: il(3),
  statutDepuis: il(90),
  dernierSuccesLe: il(3),
  ...surcharge,
});

const openai = (surcharge = {}) => ({
  code: 'openai',
  nom: 'OpenAI',
  usage: 'La voix des professeurs et le micro.',
  lienFacturation: 'https://platform.openai.com/settings/organization/billing/overview',
  modele: 'gpt-4o-mini-tts',
  statut: 'credit_epuise',
  codeHttp: 429,
  // La vraie réponse du 14/09/2026 : `type` insufficient_quota, `code` celui-ci.
  codeErreur: 'credit_balance_exhausted',
  detail: 'You have no credits remaining.',
  verifieLe: il(2),
  statutDepuis: il(40),
  dernierSuccesLe: null,
  ...surcharge,
});

test('un crédit épuisé est écrit en toutes lettres et mène au rechargement', async () => {
  getFournisseurs.mockResolvedValue({ data: [anthropic(), openai()] });

  render(<FournisseursIA />);

  expect(await screen.findByText('Crédit épuisé')).toBeInTheDocument();
  expect(screen.getByText('Fonctionne')).toBeInTheDocument();
  expect(screen.getByText(/Un fournisseur refuse de travailler/)).toBeInTheDocument();
  expect(screen.getByText('429 · credit_balance_exhausted')).toBeInTheDocument();

  const recharger = screen.getByRole('link', { name: /Recharger le compte/ });
  expect(recharger).toHaveAttribute('href', expect.stringContaining('platform.openai.com'));
});

test('« Vérifier maintenant » affiche le nouvel état', async () => {
  getFournisseurs.mockResolvedValue({ data: [anthropic(), openai()] });
  verifierFournisseurs.mockResolvedValue({
    data: [anthropic(), openai({ statut: 'ok', codeHttp: null, codeErreur: null, detail: null, dureeMs: 610 })],
  });

  render(<FournisseursIA />);
  await screen.findByText('Crédit épuisé');

  fireEvent.click(screen.getByRole('button', { name: 'Vérifier maintenant' }));

  expect(await screen.findByText('Les deux fournisseurs fonctionnent.')).toBeInTheDocument();
  expect(verifierFournisseurs).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Crédit épuisé')).not.toBeInTheDocument();
  expect(screen.getAllByText('Fonctionne')).toHaveLength(2);
});

test('le temps écoulé se lit comme on le dit', () => {
  const maintenant = Date.now();
  expect(ilYA(null, maintenant)).toBe('jamais');
  expect(ilYA(new Date(maintenant - 20000).toISOString(), maintenant)).toBe("à l'instant");
  expect(ilYA(new Date(maintenant - 12 * 60000).toISOString(), maintenant)).toBe('il y a 12 min');
  expect(ilYA(new Date(maintenant - 3 * 3600000).toISOString(), maintenant)).toBe('il y a 3 h');
});
