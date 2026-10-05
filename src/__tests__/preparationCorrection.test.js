/**
 * « NORA PRÉPARE LA CORRECTION DE TA COPIE… » — Camara, le 26/09/2026.
 *
 * Syan a attendu plus d'une minute devant une bulle vide, a cru à une panne,
 * et en reparlant a coupé la réponse. La fenêtre dit ce qui se passe, et :
 *   1. ne s'ouvre qu'après une seconde — une réponse rapide ne la fait pas
 *      clignoter ;
 *   2. se ferme seule dès que la correction commence.
 */

import { act, render, screen } from '@testing-library/react';
import PreparationCorrection, { DELAI_OUVERTURE } from '../components/PreparationCorrection';

beforeEach(() => { jest.useFakeTimers(); });
afterEach(() => { jest.useRealTimers(); });

test('rien pendant la première seconde, puis la fenêtre, avec le prénom du professeur', () => {
  render(<PreparationCorrection visible profPrenom="Nora" />);

  expect(screen.queryByText(/prépare la correction/)).not.toBeInTheDocument();

  act(() => { jest.advanceTimersByTime(DELAI_OUVERTURE); });

  expect(screen.getByText(/Nora prépare la correction de ta copie/)).toBeInTheDocument();
  expect(screen.getByRole('status')).toBeInTheDocument();
});

test('elle se ferme seule dès que la correction commence', () => {
  const { rerender } = render(<PreparationCorrection visible profPrenom="Nora" />);
  act(() => { jest.advanceTimersByTime(DELAI_OUVERTURE); });
  expect(screen.getByText(/prépare la correction/)).toBeInTheDocument();

  rerender(<PreparationCorrection visible={false} profPrenom="Nora" />);

  expect(screen.queryByText(/prépare la correction/)).not.toBeInTheDocument();
});

test('une réponse rapide ne la fait jamais apparaître', () => {
  const { rerender } = render(<PreparationCorrection visible profPrenom="Nora" />);
  act(() => { jest.advanceTimersByTime(DELAI_OUVERTURE / 2); });

  rerender(<PreparationCorrection visible={false} profPrenom="Nora" />);
  act(() => { jest.advanceTimersByTime(DELAI_OUVERTURE * 2); });

  expect(screen.queryByText(/prépare la correction/)).not.toBeInTheDocument();
});
