/**
 * UNE LECTURE RATÉE SE RETENTE AVANT D'OUVRIR — 15/11/2026. Un parent en essai, sur téléphone, avait tous les jeux
 * de la classe de son enfant ouverts : une seule erreur de lecture du forfait ouvrait tout pour la durée de la page.
 */
import { renderHook, act } from '@testing-library/react';
import useAccesForfait from '../lib/hooks/useAccesForfait';
import { getAccesForfait } from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({ getAccesForfait: jest.fn() }));

beforeEach(() => { jest.useFakeTimers(); getAccesForfait.mockReset(); });
afterEach(() => { jest.useRealTimers(); });

const attendre = async (ms) => {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
  if (ms) await act(async () => { jest.advanceTimersByTime(ms); });
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
};

test('deux échecs puis la réponse : on reste « on ne sait pas », puis l’essai est fermé', async () => {
  getAccesForfait
    .mockRejectedValueOnce(new Error('réseau'))
    .mockRejectedValueOnce(new Error('503'))
    .mockResolvedValueOnce({ data: { ouvert: false, motif: 'essai' } });

  const { result } = renderHook(() => useAccesForfait(24));
  await attendre();
  expect(result.current.ouvert).toBeNull();

  await attendre(1000);
  expect(result.current.ouvert).toBeNull();

  await attendre(2000);
  expect(result.current).toMatchObject({ ouvert: false, motif: 'essai' });
  expect(getAccesForfait).toHaveBeenCalledTimes(3);
});

test('quatre échecs : on ouvre, comme avant', async () => {
  getAccesForfait.mockRejectedValue(new Error('panne'));

  const { result } = renderHook(() => useAccesForfait(24));
  await attendre();
  await attendre(1000);
  await attendre(2000);
  expect(result.current.ouvert).toBeNull();
  await attendre(4000);
  expect(result.current.ouvert).toBe(true);
  expect(getAccesForfait).toHaveBeenCalledTimes(4);
});
