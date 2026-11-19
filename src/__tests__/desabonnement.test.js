import { fireEvent, render, screen } from '@testing-library/react';
import Desabonnement from '../components/Desabonnement';
import * as api from '../lib/api/desabonnementApi';

jest.mock('../lib/api/desabonnementApi');

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const ouvrir = (recherche) => {
  window.history.pushState({}, '', `/desabonnement${recherche}`);
  return render(<Desabonnement />);
};

test('ouvrir le lien lit seulement : rien n’est désabonné sans clic', async () => {
  api.lireDesabonnement.mockResolvedValue({ data: { libelle: 'les demandes d’avis', desabonne: false } });

  ouvrir('?jeton=abc');

  expect(await screen.findByText('Ne plus recevoir les demandes d’avis ?')).toBeInTheDocument();
  expect(api.lireDesabonnement).toHaveBeenCalledWith('abc');
  expect(api.confirmerDesabonnement).not.toHaveBeenCalled();
});

test('le bouton désabonne, puis on peut revenir sur son choix', async () => {
  api.lireDesabonnement.mockResolvedValue({ data: { libelle: 'les demandes d’avis', desabonne: false } });
  api.confirmerDesabonnement.mockResolvedValue({ data: { desabonne: true } });
  api.reabonner.mockResolvedValue({ data: { desabonne: false } });

  ouvrir('?jeton=abc');

  fireEvent.click(await screen.findByRole('button', { name: 'Ne plus recevoir ces messages' }));
  expect(await screen.findByText('C’est noté.')).toBeInTheDocument();
  expect(api.confirmerDesabonnement).toHaveBeenCalledWith('abc');

  fireEvent.click(screen.getByRole('button', { name: 'Je me suis trompé, me réabonner' }));
  expect(await screen.findByText(/vous recevez de nouveau les demandes d’avis/)).toBeInTheDocument();
  // Hors offres, le lien suffit : pas de jeton d'annulation.
  expect(api.reabonner).toHaveBeenCalledWith('abc', undefined);
});

// LES OFFRES (retour d'Omar, 19/11/2026) : se réabonner, c'est consentir — pas avec le seul lien d'un vieux courriel.
const OFFRES = { libelle: 'les offres et nouveautés de Mimia', commerciale: true };

test('offres : juste après la désinscription, « me réabonner » envoie le jeton d’annulation', async () => {
  api.lireDesabonnement.mockResolvedValue({ data: { ...OFFRES, desabonne: false } });
  api.confirmerDesabonnement.mockResolvedValue({ data: { desabonne: true, jetonAnnulation: 'annul' } });
  api.reabonner.mockResolvedValue({ data: { desabonne: false } });

  ouvrir('?jeton=abc');

  fireEvent.click(await screen.findByRole('button', { name: 'Ne plus recevoir ces messages' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Je me suis trompé, me réabonner' }));

  expect(await screen.findByText(/vous recevez de nouveau les offres/)).toBeInTheDocument();
  expect(api.reabonner).toHaveBeenCalledWith('abc', 'annul');
});

test('offres : un lien déjà utilisé ne propose pas de se réabonner, il mène à l’espace parent', async () => {
  api.lireDesabonnement.mockResolvedValue({ data: { ...OFFRES, desabonne: true } });

  ouvrir('?jeton=abc');

  expect(await screen.findByText('C’est noté.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Je me suis trompé, me réabonner' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ouvrir mon espace parent' })).toHaveAttribute('href', '/profil?onglet=parametres');
  expect(api.reabonner).not.toHaveBeenCalled();
});

test('offres : délai d’annulation dépassé (403), on le dit et on mène à l’espace parent', async () => {
  api.lireDesabonnement.mockResolvedValue({ data: { ...OFFRES, desabonne: false } });
  api.confirmerDesabonnement.mockResolvedValue({ data: { desabonne: true, jetonAnnulation: 'annul' } });
  api.reabonner.mockRejectedValue({ response: { status: 403 } });

  ouvrir('?jeton=abc');

  fireEvent.click(await screen.findByRole('button', { name: 'Ne plus recevoir ces messages' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Je me suis trompé, me réabonner' }));

  expect(await screen.findByText(/Le délai pour annuler depuis cette page est passé/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ouvrir mon espace parent' })).toBeInTheDocument();
});

test('un lien sans jeton ou abîmé le dit, sans rien appeler d’autre', async () => {
  ouvrir('');
  expect(screen.getByText('Ce lien n’est pas valide')).toBeInTheDocument();
  expect(api.lireDesabonnement).not.toHaveBeenCalled();
});
