/**
 * LA CASE « SPÉCIALITÉS » DU PROFIL DE L'ENFANT.
 *
 * Deux garanties : elle n'existe que dans les classes qui ont des spécialités,
 * et une case de plus que la classe n'en permet ne se coche pas.
 */

import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChoixSpecialites from '../components/ChoixSpecialites';

const SPES = [
  { code: 'MATHS', libelle: 'Mathématiques' },
  { code: 'PHYSIQUE_CHIMIE', libelle: 'Physique-chimie' },
  { code: 'SVT', libelle: 'Sciences de la vie et de la Terre' },
];

function Enveloppe({ nombre }) {
  const [valeur, setValeur] = useState([]);
  return <ChoixSpecialites id="t" nombre={nombre} possibles={SPES} valeur={valeur} onChange={setValeur} />;
}

test('rien dans une classe sans spécialités', () => {
  const { container } = render(<Enveloppe nombre={0} />);

  expect(container).toBeEmptyDOMElement();
});

test('en terminale, deux cases cochées bloquent la troisième', async () => {
  render(<Enveloppe nombre={2} />);

  await userEvent.click(screen.getByLabelText('Mathématiques'));
  await userEvent.click(screen.getByLabelText('Physique-chimie'));

  expect(screen.getByLabelText('Sciences de la vie et de la Terre')).toBeDisabled();
  expect(screen.getByText(/2 sur 2 cochées/)).toBeInTheDocument();

  await userEvent.click(screen.getByLabelText('Mathématiques'));

  expect(screen.getByLabelText('Sciences de la vie et de la Terre')).toBeEnabled();
});

test('une spécialité de langue se trouve par son sigle, avec son nom officiel dessous', () => {
  const langues = [
    { code: 'LLCER_ESPAGNOL', libelle: 'LLCER espagnol', precision: 'Langues, littératures et cultures étrangères' },
  ];

  render(<ChoixSpecialites id="t" nombre={2} possibles={langues} valeur={[]} onChange={() => {}} />);

  expect(screen.getByRole('checkbox', { name: /LLCER espagnol/ })).toBeInTheDocument();
  expect(screen.getByText('Langues, littératures et cultures étrangères')).toBeInTheDocument();
});
