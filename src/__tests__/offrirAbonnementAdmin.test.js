/**
 * OFFRIR UN ABONNEMENT (13/11/2026) : l'administrateur choisit la formule, la durée (ou sans fin), écrit un motif, et
 * décide lui-même si le parent est prévenu. Un refus du serveur (abonnement payant en cours) s'affiche tel quel.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OffrirAbonnementAdmin from '../components/OffrirAbonnementAdmin';
import * as abonnementApi from '../lib/api/abonnementApi';
import * as adminApi from '../lib/api/adminApi';

jest.mock('../lib/api/abonnementApi');
jest.mock('../lib/api/adminApi');

const parent = { id: 7, prenom: 'Vanessa', nom: 'Martin', mail: 'vanessa@exemple.fr' };

beforeEach(() => {
  abonnementApi.getOffres.mockResolvedValue({
    // La forme réelle de GET /abonnements/offres.
    data: {
      formules: [
        { code: 'ESSAI', libelle: 'Essai', estEssai: true, nombreEnfantsMax: 1, heuresPot: 0.5 },
        { code: 'SOLO', libelle: 'Solo', estEssai: false, nombreEnfantsMax: 1, heuresPot: 8 },
        { code: 'DUO', libelle: 'Duo', estEssai: false, nombreEnfantsMax: 2, heuresPot: 16 },
      ],
      recharges: [],
    },
  });
  adminApi.offrirAbonnement.mockResolvedValue({ data: {} });
});

test('l’essai ne se propose pas ; la première formule payante est choisie', async () => {
  render(<OffrirAbonnementAdmin parent={parent} onFermer={() => {}} />);
  const formule = await screen.findByLabelText('Formule');
  expect(formule).toHaveValue('SOLO');
  expect(screen.queryByRole('option', { name: /Essai/ })).toBeNull();
});

test('offrir envoie formule, durée, motif et le choix du courriel', async () => {
  const onOffert = jest.fn();
  const onFermer = jest.fn();
  render(<OffrirAbonnementAdmin parent={parent} onFermer={onFermer} onOffert={onOffert} />);

  fireEvent.change(await screen.findByLabelText('Formule'), { target: { value: 'DUO' } });
  fireEvent.change(screen.getByLabelText('Durée'), { target: { value: '6' } });
  const bouton = screen.getByRole('button', { name: 'Offrir' });
  expect(bouton).toBeDisabled(); // pas de motif, pas d'envoi
  fireEvent.change(screen.getByLabelText('Motif (obligatoire)'), { target: { value: '  Partenariat école  ' } });
  fireEvent.click(screen.getByLabelText('Prévenir le parent par courriel'));
  fireEvent.click(bouton);

  await waitFor(() => expect(onFermer).toHaveBeenCalled());
  expect(adminApi.offrirAbonnement).toHaveBeenCalledWith(7, {
    codeOffre: 'DUO', mois: 6, motif: 'Partenariat école', prevenirLeParent: true,
  });
  expect(onOffert).toHaveBeenCalled();
});

test('sans fin : aucune durée envoyée ; le courriel n’est pas coché par défaut', async () => {
  render(<OffrirAbonnementAdmin parent={parent} onFermer={() => {}} />);
  await screen.findByLabelText('Formule');
  fireEvent.change(screen.getByLabelText('Durée'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Motif (obligatoire)'), { target: { value: 'Ambassadeur' } });
  fireEvent.click(screen.getByRole('button', { name: 'Offrir' }));

  await waitFor(() => expect(adminApi.offrirAbonnement).toHaveBeenCalled());
  expect(adminApi.offrirAbonnement.mock.calls[0][1]).toMatchObject({ mois: null, prevenirLeParent: false });
});

test('un refus du serveur s’affiche et la fenêtre reste ouverte', async () => {
  adminApi.offrirAbonnement.mockRejectedValue({
    response: { status: 400, data: { message: 'Ce parent a un abonnement payant en cours.' } },
  });
  const onFermer = jest.fn();
  render(<OffrirAbonnementAdmin parent={parent} onFermer={onFermer} />);
  await screen.findByLabelText('Formule');
  fireEvent.change(screen.getByLabelText('Motif (obligatoire)'), { target: { value: 'Geste' } });
  fireEvent.click(screen.getByRole('button', { name: 'Offrir' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('abonnement payant en cours');
  expect(onFermer).not.toHaveBeenCalled();
});
