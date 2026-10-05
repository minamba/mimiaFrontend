/**
 * GEMINI DANS L'ADMINISTRATION — Camara, le 28/09/2026 : « tout ce qu'on a mis
 * en place pour OpenAI, je veux pareil pour Gemini », et « il faut préciser
 * OpenAI GPT ou Gemini pour qu'on puisse voir la différence ».
 *
 * Ce que ces tests protègent :
 * 1. LE NOM D'UNE VOIX dans le coût : on lit le fournisseur et la version,
 *    jamais un identifiant technique quand on sait mieux.
 * 2. LE RÉSUMÉ DE L'ONGLET compte les fournisseurs suivis — un fournisseur
 *    sans clé ne compte pas — et ne crie pas à la coupure quand seul Google
 *    tombe : la voix repasse alors par OpenAI.
 */

import { nomVoix } from '../lib/nomVoix';
import { resumer } from '../components/FournisseursIA';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: {} }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve(null),
}));

describe('le nom lisible d’une voix', () => {
  test('Gemini Flash-Lite, Gemini Flash', () => {
    expect(nomVoix({ fournisseur: 'gemini', modele: 'gemini-3.8-flash-lite-tts' })).toBe('Google Gemini Flash-Lite');
    expect(nomVoix({ fournisseur: 'gemini', modele: 'gemini-3.8-flash-tts' })).toBe('Google Gemini Flash');
  });

  test('OpenAI, et son secours', () => {
    expect(nomVoix({ fournisseur: 'openai', modele: 'gpt-4o-mini-tts' })).toBe('OpenAI GPT-4o-mini');
    expect(nomVoix({ fournisseur: 'openai', modele: 'tts-1' })).toBe('OpenAI TTS-1 (secours)');
  });

  test('un modèle inconnu s’affiche tel quel, sans nom inventé', () => {
    expect(nomVoix({ fournisseur: 'openai', modele: 'gpt-5-voice' })).toBe('OpenAI gpt-5-voice');
    expect(nomVoix({ fournisseur: 'autre', modele: 'voix-x' })).toBe('voix-x');
  });
});

const etat = (code, statut) => ({ code, statut });

describe('le résumé de l’onglet des fournisseurs', () => {
  test('trois fournisseurs qui marchent : « les trois »', () => {
    expect(resumer([etat('anthropic', 'ok'), etat('openai', 'ok'), etat('gemini', 'ok')]))
      .toBe('Les trois fournisseurs fonctionnent.');
  });

  test('un fournisseur sans clé ne compte pas', () => {
    expect(resumer([etat('anthropic', 'ok'), etat('openai', 'ok'), etat('gemini', 'non_configure')]))
      .toBe('Les deux fournisseurs fonctionnent.');
  });

  test('Google seul en panne : la voix repasse par OpenAI, rien n’est coupé', () => {
    expect(resumer([etat('anthropic', 'ok'), etat('openai', 'ok'), etat('gemini', 'credit_epuise')]))
      .toMatch(/repasse par OpenAI/);
  });

  test('une autre panne bloquante reste une coupure', () => {
    expect(resumer([etat('anthropic', 'credit_epuise'), etat('openai', 'ok'), etat('gemini', 'ok')]))
      .toMatch(/une partie du produit est coupée/);
  });
});

test('Google au quota du jour : pas de vert, et le résumé le dit sans parler de coupure', () => {
  const texte = resumer([etat('anthropic', 'ok'), etat('openai', 'ok'), etat('gemini', 'quota_atteint')]);
  expect(texte).toBe('Google Gemini a atteint son quota : la voix des professeurs passe par OpenAI.');
});
