/**
 * LES PARENTS DERRIÈRE LES BARRES (12/11/2026) : sous « Entrées et sorties », qui a pris un abonnement, demandé une
 * résiliation, ou dont la résiliation a pris effet — nom, prénom, mail.
 */
import { render, screen, fireEvent, within } from '@testing-library/react';
import Frequentation from '../components/Frequentation';
import * as adminApi from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi');
jest.mock('../lib/hooks/useEvenementsAdmin', () => ({ useEvenementsAdmin: () => {} }));
jest.mock('../components/Graphique', () => () => <div data-testid="graphique" />);

beforeEach(() => {
  adminApi.getSerieVisites.mockResolvedValue({ data: { points: [], visiteurs: 0 } });
  adminApi.getAbonnementsFenetre.mockResolvedValue({ data: [] });
  adminApi.getTunnel.mockResolvedValue({ data: null });
  adminApi.getMouvementsAbonnements.mockResolvedValue({
    data: [
      { type: 'abonnement', date: '2026-11-12T09:30:00', parentId: 1, prenom: 'Vanessa', nom: 'Martin', mail: 'vanessa@exemple.fr', offre: 'Famille' },
      { type: 'demande', date: '2026-11-11T17:00:00', parentId: 2, prenom: 'Djenny', nom: 'Libomi', mail: 'djenny@exemple.fr', offre: 'Solo' },
      { type: 'resiliation', date: '2026-11-10T08:00:00', parentId: 3, prenom: null, nom: null, mail: 'x@exemple.fr', offre: 'Solo' },
    ],
  });
});

test('la liste montre le parent, son mail et le mouvement', async () => {
  render(<Frequentation />);

  const liste = await screen.findByRole('region', { name: 'Parents concernés' });
  expect(within(liste).getByText('Vanessa Martin')).toBeInTheDocument();
  expect(within(liste).getByRole('link', { name: 'djenny@exemple.fr' })).toHaveAttribute('href', 'mailto:djenny@exemple.fr');
  expect(within(liste).getByText('Sans nom')).toBeInTheDocument();
  expect(within(liste).getAllByText('Abonnement payant').length).toBeGreaterThan(0);
});

test('le filtre ne garde qu’un type de mouvement', async () => {
  render(<Frequentation />);

  const liste = await screen.findByRole('region', { name: 'Parents concernés' });
  fireEvent.click(within(liste).getByRole('button', { name: 'Demande de résiliation' }));

  expect(within(liste).getByText('Djenny Libomi')).toBeInTheDocument();
  expect(within(liste).queryByText('Vanessa Martin')).not.toBeInTheDocument();
});

test('une panne de la liste ne fait pas tomber la page', async () => {
  adminApi.getMouvementsAbonnements.mockRejectedValue(new Error('panne'));
  render(<Frequentation />);

  expect(await screen.findByText('Aucun mouvement sur cette période.')).toBeInTheDocument();
  expect(screen.queryByText("La fréquentation n'a pas pu être chargée.")).not.toBeInTheDocument();
});
