/**
 * LE RETOUR RAMÈNE À SA SECTION, PAS EN HAUT DE LA PAGE.
 *
 * Camara, le 20/09/2026 : revenu des contrôles passés ou du détail d'une
 * épreuve, il retombait tout en haut d'une page longue et devait refaire le
 * chemin. L'ancre de l'adresse porte la destination ; le crochet attend que la
 * section existe, puisqu'elle n'arrive qu'avec ses données.
 */

import { render } from '@testing-library/react';
import { act } from 'react';
import useAncreSection from '../lib/hooks/useAncreSection';

let mockHash = '';

jest.mock('react-router-dom', () => ({
  useLocation: () => ({ hash: mockHash }),
}));

function Page() {
  useAncreSection();
  return null;
}

/** Une section posée dans le document, comme le ferait la page une fois chargée. */
const poser = (id) => {
  const section = document.createElement('section');
  section.id = id;
  section.scrollIntoView = jest.fn();
  document.body.appendChild(section);
  return section;
};

beforeEach(() => {
  mockHash = '';
  document.body.innerHTML = '';
  jest.useFakeTimers();
  // `requestAnimationFrame` de jsdom n'avance pas avec les faux minuteurs.
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((f) => setTimeout(f, 16));
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('sans ancre, rien n’est déplacé', () => {
  const section = poser('mes-controles');

  render(<Page />);
  act(() => { jest.advanceTimersByTime(1000); });

  expect(section.scrollIntoView).not.toHaveBeenCalled();
});

test('la section déjà présente reçoit le défilement', () => {
  mockHash = '#mes-controles';
  const section = poser('mes-controles');

  render(<Page />);

  expect(section.scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
});

/**
 * LE CAS QUI COMPTE : au premier rendu la page n'a que son squelette, et la
 * section n'apparaît qu'une fois les contrôles revenus du serveur.
 */
test('la section qui arrive plus tard est attendue', () => {
  mockHash = '#preparation-examen';

  render(<Page />);

  act(() => { jest.advanceTimersByTime(300); });
  const section = poser('preparation-examen');
  act(() => { jest.advanceTimersByTime(100); });

  expect(section.scrollIntoView).toHaveBeenCalled();
});

test('au-delà de trois secondes, on renonce', () => {
  mockHash = '#preparation-examen';

  render(<Page />);

  act(() => { jest.advanceTimersByTime(4000); });
  const section = poser('preparation-examen');
  act(() => { jest.advanceTimersByTime(1000); });

  expect(section.scrollIntoView).not.toHaveBeenCalled();
});

/** L'enfant qui fait défiler lui-même garde la main. */
test('un défilement à la molette annule la recherche', () => {
  mockHash = '#mes-controles';

  render(<Page />);

  act(() => { window.dispatchEvent(new Event('wheel')); });
  const section = poser('mes-controles');
  act(() => { jest.advanceTimersByTime(1000); });

  expect(section.scrollIntoView).not.toHaveBeenCalled();
});
