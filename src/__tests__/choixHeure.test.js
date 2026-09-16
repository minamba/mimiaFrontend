import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChoixHeure, { lireHeure } from '../components/ChoixHeure';

/**
 * L'HEURE D'UN CONTRÔLE SUR UNE HORLOGE — voulu par Camara le 16/09/2026 :
 * l'heure d'abord sur le cadran, les minutes ensuite. La valeur reste
 * « HH:mm » : c'est ce que la voix remplit et ce que le serveur reçoit.
 */

function Enveloppe({ initiale = '' }) {
  const [valeur, setValeur] = useState(initiale);
  return (
    <>
      <span id="lib">Heure</span>
      <ChoixHeure id="h" valeur={valeur} onChange={setValeur} labelledBy="lib" />
      <output data-testid="valeur">{valeur}</output>
    </>
  );
}

test('lireHeure comprend « HH:mm » et rejette le reste', () => {
  expect(lireHeure('11:20')).toEqual({ heure: 11, minute: 20 });
  expect(lireHeure('14:30:00')).toEqual({ heure: 14, minute: 30 });
  expect(lireHeure('')).toBeNull();
  expect(lireHeure(null)).toBeNull();
  expect(lireHeure('25:00')).toBeNull();
});

test('au départ : le cadran des heures, et aucune heure', () => {
  render(<Enveloppe />);

  expect(screen.getByText('Pas d’heure précise')).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Les heures' })).toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Les minutes' })).not.toBeInTheDocument();
});

test('le cadran montre 12 heures dehors et 13 à 00 dedans', () => {
  render(<Enveloppe />);

  expect(screen.getByRole('button', { name: '12 h' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '9 h' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '14 h' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '0 h' })).toBeInTheDocument();
});

test('toucher 14 puis 30 donne « 14:30 », en passant par le cadran des minutes', async () => {
  render(<Enveloppe />);

  await userEvent.click(screen.getByRole('button', { name: '14 h' }));
  expect(screen.getByTestId('valeur')).toHaveTextContent('14:00');
  expect(screen.getByRole('group', { name: 'Les minutes' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: '30 min' }));
  expect(screen.getByTestId('valeur')).toHaveTextContent('14:30');
  expect(screen.getByRole('button', { name: '30 min' })).toHaveAttribute('aria-pressed', 'true');
});

test('le résumé permet de revenir sur l’heure', async () => {
  render(<Enveloppe initiale="09:30" />);

  // Ouvert sur une valeur existante : cadran des heures, 9 marqué.
  expect(screen.getByRole('button', { name: '9 h' })).toHaveAttribute('aria-pressed', 'true');

  await userEvent.click(screen.getByRole('button', { name: /Changer les minutes/ }));
  expect(screen.getByRole('group', { name: 'Les minutes' })).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /Changer l’heure/ }));
  expect(screen.getByRole('group', { name: 'Les heures' })).toBeInTheDocument();
});

test('une heure dictée hors des multiples de 5 est gardée telle quelle', async () => {
  // « J'ai contrôle à 9 h 05 » : le résumé le dit, et le cadran des minutes
  // ne la remplace pas par 05 arrondi ailleurs.
  render(<Enveloppe initiale="09:05" />);

  expect(screen.getByRole('button', { name: /actuellement 05/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /Changer les minutes/ }));
  expect(screen.getByRole('button', { name: '5 min' })).toHaveAttribute('aria-pressed', 'true');
});

test('« Effacer » remet l’heure à vide et revient aux heures', async () => {
  render(<Enveloppe initiale="11:00" />);

  await userEvent.click(screen.getByRole('button', { name: /Changer les minutes/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Effacer' }));

  expect(screen.getByTestId('valeur')).toHaveTextContent('');
  expect(screen.getByText('Pas d’heure précise')).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'Les heures' })).toBeInTheDocument();
});

test('le groupe porte le libellé du champ', () => {
  render(<Enveloppe />);
  expect(screen.getByRole('group', { name: 'Heure' })).toBeInTheDocument();
});
