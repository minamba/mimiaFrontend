/**
 * CE QUI EST EXIGÉ À LA CRÉATION D'UN CONTRÔLE, ET CE QUI NE L'EST PAS.
 *
 * Deux champs seulement : la matière et la date. Sans matière, aucun
 * professeur ne peut le préparer ; sans date, le contrôle n'a aucun jour où
 * s'accrocher et rien ne peut décompter les jours restants.
 *
 * Le sujet et l'heure, eux, se complètent en parlant avec le professeur. Les
 * exiger ferait renoncer l'enfant qui ne sait pas encore ce qu'il y aura
 * dessus — c'est-à-dire le cas le plus fréquent.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ControleForm from '../components/ControleForm';
import { creerControle } from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({
  creerControle: jest.fn(),
  modifierControle: jest.fn(),
}));

jest.mock('../lib/storage/ecouteService', () => ({
  ecouteService: { supporte: false, ecouter: jest.fn() },
}));

const MATIERES = [
  { id: 1, libelle: 'Mathématiques', active: true },
  { id: 2, libelle: 'Français', active: true },
];

beforeEach(() => {
  jest.clearAllMocks();
  creerControle.mockResolvedValue({ data: {} });
});

const monter = (props = {}) => render(
  <ControleForm
    eleveId="9"
    matieres={MATIERES}
    jour={null}
    onEnregistre={jest.fn()}
    onAnnule={jest.fn()}
    {...props}
  />,
);

test('aucune matière n’est choisie d’avance', () => {
  monter();

  // Pré-sélectionner la première rendait le champ impossible à manquer… et
  // surtout impossible à voir : on validait sans regarder, et le contrôle
  // atterrissait en mathématiques par hasard.
  expect(screen.getByLabelText('Matière')).toHaveValue('');
});

test('sans matière ni date, rien n’est envoyé et les deux manques sont dits', async () => {
  monter();

  await userEvent.click(screen.getByRole('button', { name: /Ajouter le contrôle/ }));

  expect(screen.getByText('Choisis la matière du contrôle.')).toBeInTheDocument();
  expect(screen.getByText('Indique la date du contrôle.')).toBeInTheDocument();
  expect(creerControle).not.toHaveBeenCalled();
});

test('le message disparaît dès que l’enfant corrige', async () => {
  monter();

  await userEvent.click(screen.getByRole('button', { name: /Ajouter le contrôle/ }));
  expect(screen.getByText('Choisis la matière du contrôle.')).toBeInTheDocument();

  await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');

  // Un message rouge qui reste après correction donne l'impression que le
  // formulaire est cassé.
  expect(screen.queryByText('Choisis la matière du contrôle.')).not.toBeInTheDocument();
});

test('la matière et la date suffisent : ni sujet ni heure ne sont exigés', async () => {
  monter();

  await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');
  await userEvent.type(screen.getByLabelText(/Date du contrôle/), '2026-09-20');

  await userEvent.click(screen.getByRole('button', { name: /Ajouter le contrôle/ }));

  await waitFor(() => expect(creerControle).toHaveBeenCalledTimes(1));

  expect(creerControle).toHaveBeenCalledWith('9', expect.objectContaining({
    matiereId: 1,
    dateControle: '2026-09-20',
    sujet: null,
    heureControle: null,
  }));
});

/**
 * LA MATIÈRE SE FIGE À LA CRÉATION. En changer après coup viderait le
 * programme du contrôle et laisserait les séances de préparation déjà faites
 * rattachées au professeur d'une autre matière. S'être trompé se répare en
 * supprimant, pas en déplaçant — et l'écran le dit.
 */
test('à la modification, la matière est verrouillée et l’écran explique pourquoi', () => {
  monter({
    controle: {
      id: 42, matiereId: 1, sujet: 'Les fractions',
      dateControle: '2026-09-20T00:00:00', heureControle: null,
    },
  });

  expect(screen.getByLabelText('Matière')).toBeDisabled();
  expect(screen.getByText(/La matière ne se change pas/)).toBeInTheDocument();
  expect(screen.getByText(/supprime ce contrôle/)).toBeInTheDocument();
});

test('l’heure saisie part avec ses secondes, comme le serveur les attend', async () => {
  monter();

  await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');
  await userEvent.type(screen.getByLabelText(/Date du contrôle/), '2026-09-20');
  await userEvent.type(screen.getByLabelText(/Heure/), '14:30');

  await userEvent.click(screen.getByRole('button', { name: /Ajouter le contrôle/ }));

  await waitFor(() => expect(creerControle).toHaveBeenCalled());

  expect(creerControle.mock.calls[0][1].heureControle).toBe('14:30:00');
});
