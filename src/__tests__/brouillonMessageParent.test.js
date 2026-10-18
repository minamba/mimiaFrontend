import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import MessageParent from '../components/MessageParent';
import * as api from '../lib/api/adminApi';

/*
 * LE BROUILLON D'« ÉCRIRE À UN PARENT » — Camara, le 17/10/2026 : tant que le
 * message n'est pas parti, il est gardé dans « Ma boîte › Brouillons », d'où un
 * clic le rouvre ici.
 */
jest.mock('../lib/api/adminApi');

beforeEach(() => {
  jest.clearAllMocks();
  api.getModelesMail.mockResolvedValue({ data: [] });
  api.enregistrerBrouillon.mockResolvedValue({ status: 200, data: { id: 31 } });
  api.supprimerMessages.mockResolvedValue({ data: { supprimes: 1 } });
});

afterEach(() => jest.useRealTimers());

it('le message en cours s’enregistre en brouillon, puis met à jour le même', async () => {
  render(<MessageParent parents={[]} />);
  await screen.findByLabelText('Objet du courriel');

  jest.useFakeTimers();
  fireEvent.change(screen.getByLabelText('Adresse e-mail du destinataire'), { target: { value: 'hilda@exemple.fr' } });
  fireEvent.change(screen.getByLabelText('Objet du courriel'), { target: { value: 'Votre inscription' } });
  await act(async () => { jest.advanceTimersByTime(1600); });

  expect(api.enregistrerBrouillon).toHaveBeenCalledWith({
    messageOrigine: null, id: null, destinataire: 'hilda@exemple.fr', sujet: 'Votre inscription', titre: '', texte: '', avecPieces: false,
  }, 'moi');

  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Bonjour Hilda' } });
  await act(async () => { jest.advanceTimersByTime(1600); });
  jest.useRealTimers();

  await waitFor(() => expect(api.enregistrerBrouillon).toHaveBeenLastCalledWith(
    expect.objectContaining({ id: 31, texte: 'Bonjour Hilda' }), 'moi'));
  expect(await screen.findByText(/Brouillon enregistré à/)).toBeInTheDocument();
});

it('un brouillon choisi dans « Brouillons » rouvre le formulaire, et s’efface à l’envoi', async () => {
  api.getBrouillonLibre.mockResolvedValue({
    data: { id: 31, destinataire: 'hilda@exemple.fr', sujet: 'Votre inscription', titre: '', texte: 'Bonjour Hilda', dateModification: '2026-10-17T10:00:00Z' },
  });
  api.envoyerMailParent.mockResolvedValue({ data: { redirection: null } });
  const repris = jest.fn();
  render(<MessageParent parents={[]} brouillonAReprendre={{ identifiant: 31 }} onBrouillonRepris={repris} />);

  expect(await screen.findByDisplayValue('Bonjour Hilda')).toBeInTheDocument();
  expect(screen.getByLabelText('Adresse e-mail du destinataire')).toHaveValue('hilda@exemple.fr');
  expect(api.getBrouillonLibre).toHaveBeenCalledWith(31, 'moi');
  expect(repris).toHaveBeenCalled();

  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à ce parent' }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer l’envoi/ }));

  await waitFor(() => expect(api.supprimerMessages).toHaveBeenCalledWith([31], 'moi', 'brouillons'));
});

it('l’aperçu d’« Écrire à un parent » demande la signature de l’expéditeur', async () => {
  api.apercuDiffusion.mockResolvedValue({ data: '<p>courriel</p>' });
  window.open = jest.fn();
  global.URL.createObjectURL = jest.fn(() => 'blob:apercu');
  global.URL.revokeObjectURL = jest.fn();
  render(<MessageParent parents={[]} />);

  fireEvent.change(await screen.findByLabelText('Objet du courriel'), { target: { value: 'Bonjour' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Un mot' } });
  fireEvent.click(screen.getByRole('button', { name: 'Voir l’aperçu' }));

  await waitFor(() => expect(api.apercuDiffusion).toHaveBeenCalledWith(
    expect.objectContaining({ sujet: 'Bonjour', texte: 'Un mot' }), { signature: true, boite: 'moi' }));
});

it('l’adresse d’envoi s’affiche au-dessus du formulaire', async () => {
  api.getEtatBoite.mockResolvedValue({ data: { connectee: true, adresse: 'minamba.camara@mimia.fr' } });
  render(<MessageParent parents={[]} />);
  expect(await screen.findByText('minamba.camara@mimia.fr')).toBeInTheDocument();
  expect(screen.getByText('Envoyé depuis votre boîte')).toBeInTheDocument();
});

it('sans boîte connectée, la carte le dit et propose de la connecter', async () => {
  api.getEtatBoite.mockResolvedValue({ data: { connectee: false, code: 'a_configurer' } });
  const connecter = jest.fn();
  render(<MessageParent parents={[]} onConnecterBoite={connecter} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Connecter ma boîte' }));
  expect(connecter).toHaveBeenCalled();
});

it('depuis la boîte Support : la carte dit support@mimia.fr et l’envoi part du support', async () => {
  api.envoyerMailParent.mockResolvedValue({ data: { redirection: null } });
  render(<MessageParent parents={[]} boite="support" />);

  expect(await screen.findByText('support@mimia.fr')).toBeInTheDocument();
  expect(screen.getByText('Signé « L’équipe Mimia »')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Adresse e-mail du destinataire'), { target: { value: 'hilda@exemple.fr' } });
  fireEvent.change(screen.getByLabelText('Objet du courriel'), { target: { value: 'Bonjour' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Un mot du support' } });
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer à ce parent' }));
  fireEvent.click(screen.getByRole('button', { name: /Confirmer l’envoi/ }));

  await waitFor(() => expect(api.envoyerMailParent).toHaveBeenCalledWith(
    expect.objectContaining({ destinataire: 'hilda@exemple.fr' }), 'support'));
});

it('une image ajoutée est gardée avec le brouillon', async () => {
  api.remplacerPiecesBrouillon.mockResolvedValue({ data: [] });
  const { container } = render(<MessageParent parents={[]} />);
  await screen.findByLabelText('Objet du courriel');

  fireEvent.change(screen.getByLabelText('Objet du courriel'), { target: { value: 'Avec une image' } });
  const image = new File(['png'], 'affiche.png', { type: 'image/png' });
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  fireEvent.change(container.querySelector('input[type="file"][accept="image/*"]'), { target: { files: [image] } });

  await waitFor(() => expect(api.remplacerPiecesBrouillon).toHaveBeenCalledWith(31, [image], [], 'moi'), { timeout: 3000 });
  expect(api.enregistrerBrouillon).toHaveBeenCalledWith(expect.objectContaining({ avecPieces: true }), 'moi');
});

it('un brouillon rouvert retrouve ses images', async () => {
  api.getBrouillonLibre.mockResolvedValue({
    data: {
      id: 31, destinataire: 'hilda@exemple.fr', sujet: 'Avec une image', titre: '', texte: 'Voici [image:1]',
      dateModification: '2026-10-18T10:00:00Z',
      pieces: [{ id: 5, genre: 'Image', rang: 1, nomFichier: 'affiche.png', typeMime: 'image/png', taille: 3 }],
    },
  });
  api.getPieceBrouillon.mockResolvedValue({ data: new Blob(['png'], { type: 'image/png' }) });
  render(<MessageParent parents={[]} brouillonAReprendre={{ identifiant: 31 }} />);

  expect(await screen.findByText(/affiche.png/)).toBeInTheDocument();
  expect(api.getPieceBrouillon).toHaveBeenCalledWith(31, 5, 'moi');
  expect(api.remplacerPiecesBrouillon).not.toHaveBeenCalled();
});
