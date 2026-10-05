/**
 * L'ONGLET « ANTHROPIC / OPENAI ».
 *
 * Trois garanties : l'état s'écrit en toutes lettres (jamais la couleur
 * seule), un crédit épuisé mène au rechargement, et « Vérifier maintenant »
 * affiche ce que la nouvelle vérification a constaté.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import FournisseursIA, { ilYA, tonJauge } from '../components/FournisseursIA';
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

/**
 * LES JAUGES DE QUOTA DE GOOGLE — Camara, le 28/09/2026 : « une barre de
 * progression de 0 à 100 % pour voir où j'en suis ». Elles ne s'affichent que
 * sur la carte qui en porte, et le rouge arrive AVANT le plafond.
 */
const gemini = (surcharge = {}) => ({
  code: 'gemini',
  nom: 'Google Gemini',
  usage: 'La voix des professeurs quand l’interrupteur « Voix Gemini » est allumé.',
  lienFacturation: 'https://console.cloud.google.com/billing',
  modele: 'gemini-3.8-flash-lite-tts',
  statut: 'ok',
  dureeMs: 100,
  verifieLe: il(10),
  statutDepuis: il(60),
  dernierSuccesLe: il(10),
  jauges: [
    { cle: 'jour', libelle: 'Requêtes aujourd’hui', utilise: 93, limite: 100, remiseLe: '2026-09-29T07:00:00Z' },
    { cle: 'minute', libelle: 'Requêtes cette minute', utilise: 3, limite: 10, remiseLe: null },
    { cle: 'jetons', libelle: 'Jetons d’entrée cette minute', utilise: 7500, limite: 10000, remiseLe: null },
  ],
  refusDuJour: 2,
  ...surcharge,
});

test('la couleur d’une jauge prévient avant le plafond', () => {
  expect(tonJauge(0.5)).toBe('vert');
  expect(tonJauge(0.7)).toBe('ambre');
  expect(tonJauge(0.89)).toBe('ambre');
  expect(tonJauge(0.9)).toBe('rouge');
  expect(tonJauge(1)).toBe('rouge');
});

test('la carte de Google montre ses trois jauges, les refus du jour et la remise à zéro', async () => {
  getFournisseurs.mockResolvedValue({ data: [anthropic(), openai({ statut: 'ok' }), gemini()] });

  render(<FournisseursIA />);

  const barres = await screen.findAllByRole('progressbar');
  expect(barres).toHaveLength(3);
  expect(screen.getByRole('progressbar', { name: 'Requêtes aujourd’hui' })).toHaveAttribute('aria-valuenow', '93');
  expect(screen.getByRole('progressbar', { name: 'Requêtes cette minute' })).toHaveAttribute('aria-valuenow', '30');
  expect(screen.getByRole('progressbar', { name: 'Jetons d’entrée cette minute' })).toHaveAttribute('aria-valuenow', '75');

  expect(screen.getByText(/2 refus aujourd'hui/)).toBeInTheDocument();
  expect(screen.getByText(/remise à zéro à/)).toBeInTheDocument();
  expect(screen.getByText(/Les trois fournisseurs fonctionnent/)).toBeInTheDocument();
});

test('une carte sans jauges n’en dessine aucune', async () => {
  getFournisseurs.mockResolvedValue({ data: [anthropic(), openai({ statut: 'ok' })] });

  render(<FournisseursIA />);

  await screen.findAllByText('Fonctionne');
  expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
});

test('quota du jour atteint : la carte n’est plus verte, et dit jusqu’à quand la voix passe par OpenAI', async () => {
  getFournisseurs.mockResolvedValue({
    data: [anthropic(), openai({ statut: 'ok' }), gemini({
      statut: 'quota_atteint',
      codeHttp: 429,
      codeErreur: 'RESOURCE_EXHAUSTED',
      detail: 'Quota du jour atteint (100 requêtes) : la voix des professeurs passe par OpenAI jusqu’à 09:00.',
      bloqueJusqua: '2026-09-29T07:00:00Z',
    })],
  });

  render(<FournisseursIA />);

  expect(await screen.findByText('Quota atteint')).toBeInTheDocument();
  expect(screen.getByText(/la voix des professeurs passe par OpenAI jusqu'à/)).toBeInTheDocument();
  expect(screen.getByText(/Google Gemini a atteint son quota/)).toBeInTheDocument();
  expect(screen.getByRole('article', { name: 'Google Gemini' })).toHaveClass('fournisseur--attention');
});
