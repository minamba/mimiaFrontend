/**
 * LES RACCOURCIS DE LA FICHE DE L'ÉLÈVE — Camara, le 11/10/2026 : sous les
 * chiffres, toutes les sections ; en tête de chaque section, « ↑ En haut » et
 * les autres.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import RaccourcisFiche from '../components/RaccourcisFiche';

const SECTIONS = [
  { id: 'fiche-dernier-cours', libelle: 'Dernier cours' },
  { id: 'fiche-evaluations', libelle: 'Évaluations' },
  { id: 'fiche-orientation', libelle: 'Orientation', orientation: true },
];

test('sous les chiffres : toutes les sections, pas de « En haut »', () => {
  render(<RaccourcisFiche sections={SECTIONS} />);

  expect(screen.getAllByRole('button')).toHaveLength(3);
  expect(screen.queryByRole('button', { name: /En haut/ })).not.toBeInTheDocument();
});

test('en tête d’une section : « En haut », et la section où l’on est allumée', () => {
  render(<RaccourcisFiche sections={SECTIONS} courante="fiche-evaluations" />);

  expect(screen.getByRole('button', { name: /En haut/ })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Évaluations' })).toHaveAttribute('aria-current', 'location');
  expect(screen.getByRole('button', { name: 'Orientation' })).not.toHaveAttribute('aria-current');
});

test('un bouton fait défiler jusqu’à sa section', () => {
  const cible = document.createElement('div');
  cible.id = 'fiche-orientation';
  cible.scrollIntoView = jest.fn();
  document.body.appendChild(cible);

  render(<RaccourcisFiche sections={SECTIONS} />);
  fireEvent.click(screen.getByRole('button', { name: 'Orientation' }));

  expect(cible.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  cible.remove();
});
