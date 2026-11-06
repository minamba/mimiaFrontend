/**
 * OÙ EN SONT LES DESCRIPTIONS — Camara, le 20/10/2026 : « je suis à l'aveugle »,
 * puis « la matière en cours et la planche en cours, avec un lien ».
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ProgressionPlanches from '../components/ProgressionPlanches';
import { getFilesPlanches, relancerDescriptionsPlanches } from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi', () => ({ getFilesPlanches: jest.fn(), relancerDescriptionsPlanches: jest.fn() }));

const files = (aDecrire, aCartographier) => ({
  data: {
    aDecrire: Array.from({ length: aDecrire }, (_, i) => ({ cle: i === 0 ? 'svt-coeur' : `d-${i}` })),
    aCartographier: Array.from({ length: aCartographier }, (_, i) => ({ cle: `c-${i}` })),
    aCrediter: [],
  },
});

beforeEach(() => jest.clearAllMocks());

it('montre les deux barres, puis prévient quand tout est fait', async () => {
  jest.useFakeTimers();
  getFilesPlanches.mockResolvedValueOnce(files(363, 400)).mockResolvedValue(files(0, 0));
  const fini = jest.fn();
  render(<ProgressionPlanches totalLegendees={863} onFini={fini} />);

  expect(await screen.findByText('Descriptions')).toBeInTheDocument();
  expect(screen.getByText('500')).toBeInTheDocument();
  // Les cartes : le total moins les DEUX files (une planche à décrire attend aussi sa carte).
  expect(screen.getByText('100')).toBeInTheDocument();

  await act(async () => { jest.advanceTimersByTime(20000); });
  await waitFor(() => expect(fini).toHaveBeenCalled());
  expect(screen.queryByText('Descriptions')).not.toBeInTheDocument();
  jest.useRealTimers();
});

it('nomme la planche en cours, sa matière, et l’ouvre', async () => {
  getFilesPlanches.mockResolvedValue(files(3, 2));
  const ouvrir = jest.fn();
  render(
    <ProgressionPlanches
      totalLegendees={863}
      decrire={(cle) => (cle === 'svt-coeur' ? { titre: 'Le cœur', matiere: 'SVT' } : { titre: cle, matiere: 'Autre' })}
      onOuvrir={ouvrir}
    />,
  );

  expect(await screen.findByText('Le cœur')).toBeInTheDocument();
  expect(screen.getByText('SVT')).toBeInTheDocument();
  expect(screen.getByText('c-0')).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole('button', { name: 'Voir la planche →' })[0]);
  expect(ouvrir).toHaveBeenCalledWith('svt-coeur');
});

it('le bouton relance la tâche de fond', async () => {
  getFilesPlanches.mockResolvedValue(files(10, 10));
  relancerDescriptionsPlanches.mockResolvedValue({});
  render(<ProgressionPlanches totalLegendees={863} />);

  fireEvent.click(await screen.findByRole('button', { name: 'Relancer les descriptions' }));
  await waitFor(() => expect(relancerDescriptionsPlanches).toHaveBeenCalled());
  expect(await screen.findByText('Tâche de fond relancée.')).toBeInTheDocument();
});

it('rien à faire, rien d’affiché', async () => {
  getFilesPlanches.mockResolvedValue(files(0, 0));
  const { container } = render(<ProgressionPlanches totalLegendees={863} />);
  await waitFor(() => expect(getFilesPlanches).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});
