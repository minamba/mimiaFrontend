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
  expect(api.reabonner).toHaveBeenCalledWith('abc');
});

test('un lien sans jeton ou abîmé le dit, sans rien appeler d’autre', async () => {
  ouvrir('');
  expect(screen.getByText('Ce lien n’est pas valide')).toBeInTheDocument();
  expect(api.lireDesabonnement).not.toHaveBeenCalled();
});
