import { render, screen, fireEvent, act } from '@testing-library/react';
import ApercuParent from '../components/ApercuParent';

/**
 * LE CARROUSEL DU SUIVI PARENT.
 *
 * Relevé par Camara le 12/09/2026 : « je ne vois pas les trois onglets », puis
 * « le carrousel fait bouger la page ». D'où les flèches, le défilement
 * automatique, et les trois écrans empilés — que ces tests tiennent.
 *
 * LES TROIS VOLETS SONT TOUJOURS DANS LE DOM : c'est ce qui fige la hauteur de
 * la carte. On ne peut donc pas vérifier qu'un écran est parti, seulement
 * lequel est OUVERT — d'où `.est-ouvert` plutôt que `queryByText`.
 */

/** La clé du volet actuellement visible. */
const ouvert = (conteneur) =>
  conteneur.querySelector('.apercu__volet.est-ouvert')?.dataset.volet;

test('chaque onglet ouvre son écran, et referme le précédent', () => {
  const { container } = render(<ApercuParent />);

  expect(ouvert(container)).toBe('semaine');

  fireEvent.click(screen.getByRole('tab', { name: /Sa progression/ }));
  expect(ouvert(container)).toBe('progression');

  fireEvent.click(screen.getByRole('tab', { name: /Ses séances/ }));
  expect(ouvert(container)).toBe('seances');

  fireEvent.click(screen.getByRole('tab', { name: /Cette semaine/ }));
  expect(ouvert(container)).toBe('semaine');
});

test('un seul écran est ouvert à la fois', () => {
  const { container } = render(<ApercuParent />);

  expect(container.querySelectorAll('.apercu__volet.est-ouvert')).toHaveLength(1);

  // Et les trois restent montés : c'est ce qui empêche la page de sauter.
  expect(container.querySelectorAll('.apercu__volet')).toHaveLength(3);
});

test('l’onglet ouvert est annoncé, pas seulement coloré', () => {
  render(<ApercuParent />);

  const progression = screen.getByRole('tab', { name: /Sa progression/ });
  expect(progression.getAttribute('aria-selected')).toBe('false');

  fireEvent.click(progression);
  expect(progression.getAttribute('aria-selected')).toBe('true');
});

test('les flèches tournent en boucle, dans les deux sens', () => {
  const { container } = render(<ApercuParent />);

  // Reculer depuis le PREMIER écran mène au dernier : on ne reste jamais
  // bloqué à un bout, et la flèche n'est jamais inerte.
  fireEvent.click(screen.getByRole('button', { name: 'Écran précédent' }));
  expect(ouvert(container)).toBe('seances');

  // Et avancer depuis le dernier ramène au premier.
  fireEvent.click(screen.getByRole('button', { name: 'Écran suivant' }));
  expect(ouvert(container)).toBe('semaine');
});

describe('le défilement automatique', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('fait défiler les écrans tout seul', () => {
    const { container } = render(<ApercuParent />);
    expect(ouvert(container)).toBe('semaine');

    act(() => { jest.advanceTimersByTime(6000); });
    expect(ouvert(container)).toBe('progression');
  });

  test('S’ARRÊTE DÈS QUE LE PARENT PREND LA MAIN, ET NE REPART PAS', () => {
    // La règle qui rend le composant supportable : un carrousel qui reprend
    // après un clic emporte l'écran qu'on était en train de lire.
    const { container } = render(<ApercuParent />);

    fireEvent.click(screen.getByRole('tab', { name: /Cette semaine/ }));

    act(() => { jest.advanceTimersByTime(60000); });
    expect(ouvert(container)).toBe('semaine');
  });
});
