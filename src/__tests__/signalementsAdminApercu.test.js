/* eslint-disable testing-library/no-node-access */
/**
 * L'APERÇU, LES COMMENTAIRES ET L'ÉTAT DANS LA LISTE — Camara, le 03/11/2026.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignalementsAdmin from '../components/SignalementsAdmin';
import * as api from '../lib/api/adminApi';

jest.mock('../lib/api/adminApi');
jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({ auth: { utilisateur: { email: 'camara@exemple.fr' } } }),
}));
jest.mock('../lib/hooks/useEvenementsAdmin', () => ({ useEvenementsAdmin: () => {} }));

const DESCRIPTION = `Instabilité de la voix du professeur virtuel. ${'À deux reprises, Adrien a changé de voix. '.repeat(4)}`;
const SIGNALEMENT = {
  id: 16,
  parentMail: 'hilda@exemple.fr',
  categorie: 'PROFESSEUR',
  description: DESCRIPTION,
  etat: 'nouveau',
  dateCreation: '2026-11-02T16:20:29Z',
  nombreCommentaires: 1,
};
const NOTE = {
  id: 3, signalementId: 16, auteurMail: 'ceo@mimia.fr', texte: 'Vu avec Google.', dateCreation: '2026-11-03T10:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  api.getSignalements.mockResolvedValue({ data: [SIGNALEMENT] });
  api.getCommentairesSignalement.mockResolvedValue({ data: [NOTE] });
  api.getPiecesSignalement.mockResolvedValue({ data: [] });
  global.URL.createObjectURL = jest.fn(() => 'blob:apercu');
  global.URL.revokeObjectURL = jest.fn();
});

const ouvrirApercu = async () => {
  render(<SignalementsAdmin />);
  await userEvent.click(await screen.findByRole('button', { name: /Aperçu/ }));
  return screen.findByRole('dialog');
};

describe('l’état, changé depuis la liste', () => {
  test('le choix envoie tout le signalement, avec le nouvel état', async () => {
    api.modifierSignalement.mockResolvedValue({ data: { ...SIGNALEMENT, etat: 'en_cours' } });
    render(<SignalementsAdmin />);

    const choix = await screen.findByRole('combobox', { name: /État du signalement de hilda/ });
    await userEvent.selectOptions(choix, 'en_cours');

    expect(api.modifierSignalement).toHaveBeenCalledWith(16, {
      categorie: 'PROFESSEUR', description: DESCRIPTION, etat: 'en_cours',
    });
    await waitFor(() => expect(choix).toHaveValue('en_cours'));
  });

  test('un échec le ramène à l’état réel, et le dit', async () => {
    api.modifierSignalement.mockRejectedValue({ response: { data: { message: 'Refusé.' } } });
    render(<SignalementsAdmin />);

    const choix = await screen.findByRole('combobox', { name: /État du signalement de hilda/ });
    await userEvent.selectOptions(choix, 'traite');

    expect(await screen.findByText('Refusé.')).toBeInTheDocument();
    expect(choix).toHaveValue('nouveau');
  });
});

describe('la ligne du signalement', () => {
  test('le bouton ne dit qu’« Aperçu » ; le reste est écrit sous la description', async () => {
    api.getSignalements.mockResolvedValue({
      data: [{ ...SIGNALEMENT, nombrePieces: 2, nombreCommentaires: 1 }],
    });
    render(<SignalementsAdmin />);

    expect(await screen.findByRole('button', { name: 'Aperçu' })).toHaveTextContent(/^Aperçu$/);
    expect(screen.getByText('2 fichiers · 1 commentaire')).toBeInTheDocument();
  });

  test('sans rien de joint, pas de ligne vide', async () => {
    api.getSignalements.mockResolvedValue({
      data: [{ ...SIGNALEMENT, nombrePieces: 0, nombreCommentaires: 0 }],
    });
    render(<SignalementsAdmin />);
    await screen.findByRole('button', { name: 'Aperçu' });

    expect(document.querySelector('.signalement-ligne__joint')).not.toBeInTheDocument();
  });
});

describe('l’aperçu', () => {
  test('il montre le message entier, sans passer par « Modifier »', async () => {
    const fenetre = await ouvrirApercu();

    expect(within(fenetre).getByText(DESCRIPTION.trim())).toBeInTheDocument();
    expect(await within(fenetre).findByText('Vu avec Google.')).toBeInTheDocument();
  });

  test('« Modifier » y mène au formulaire, avec les commentaires en bas', async () => {
    const fenetre = await ouvrirApercu();
    await within(fenetre).findByText('Vu avec Google.');

    // Le dernier : le premier est celui du commentaire.
    const boutons = within(fenetre).getAllByRole('button', { name: 'Modifier' });
    await userEvent.click(boutons[boutons.length - 1]);

    expect(screen.getByRole('heading', { name: 'Modifier le signalement' })).toBeInTheDocument();
    expect(await screen.findByText('Vu avec Google.')).toBeInTheDocument();
  });

  test('Échap la referme', async () => {
    await ouvrirApercu();
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('les commentaires', () => {
  test('on en ajoute, et le compteur de la liste suit', async () => {
    api.ajouterCommentaireSignalement.mockResolvedValue({
      data: { ...NOTE, id: 4, texte: 'Relancé.' },
    });
    const fenetre = await ouvrirApercu();
    await within(fenetre).findByText('Vu avec Google.');

    await userEvent.type(within(fenetre).getByRole('textbox', { name: 'Ajouter un commentaire' }), '  Relancé.  ');
    await userEvent.click(within(fenetre).getByRole('button', { name: 'Ajouter le commentaire' }));

    expect(api.ajouterCommentaireSignalement).toHaveBeenCalledWith(16, 'Relancé.');
    expect(await screen.findByText('2 commentaires')).toBeInTheDocument();
  });

  test('un commentaire vide ne part pas', async () => {
    const fenetre = await ouvrirApercu();
    expect(within(fenetre).getByRole('button', { name: 'Ajouter le commentaire' })).toBeDisabled();
  });

  test('on le modifie', async () => {
    api.modifierCommentaireSignalement.mockResolvedValue({
      data: { ...NOTE, texte: 'Corrigé.', dateMiseAJour: '2026-11-03T11:00:00Z' },
    });
    const fenetre = await ouvrirApercu();
    const note = (await within(fenetre).findByText('Vu avec Google.')).closest('li');

    await userEvent.click(within(note).getByRole('button', { name: 'Modifier' }));

    const champ = within(note).getByRole('textbox', { name: 'Modifier le commentaire' });
    await userEvent.clear(champ);
    await userEvent.type(champ, 'Corrigé.');
    await userEvent.click(within(note).getByRole('button', { name: 'Enregistrer' }));

    expect(api.modifierCommentaireSignalement).toHaveBeenCalledWith(16, 3, 'Corrigé.');
    expect(await within(fenetre).findByText(/modifié le/)).toBeInTheDocument();
    expect(within(fenetre).getByText('Corrigé.', { selector: 'p' })).toBeInTheDocument();
  });

  test('on le supprime, après confirmation', async () => {
    api.supprimerCommentaireSignalement.mockResolvedValue({});
    const fenetre = await ouvrirApercu();
    const note = (await within(fenetre).findByText('Vu avec Google.')).closest('li');

    await userEvent.click(within(note).getByRole('button', { name: 'Supprimer' }));
    expect(api.supprimerCommentaireSignalement).not.toHaveBeenCalled();

    await userEvent.click(within(note).getByRole('button', { name: 'Confirmer' }));

    expect(api.supprimerCommentaireSignalement).toHaveBeenCalledWith(16, 3);
    await waitFor(() => expect(within(fenetre).queryByText('Vu avec Google.')).not.toBeInTheDocument());
    expect(screen.queryByText(/^\d+ commentaires?$/)).not.toBeInTheDocument();
  });

  test('une erreur se dit, et le texte saisi reste', async () => {
    api.ajouterCommentaireSignalement.mockRejectedValue(new Error('réseau'));
    const fenetre = await ouvrirApercu();
    await within(fenetre).findByText('Vu avec Google.');

    const champ = within(fenetre).getByRole('textbox', { name: 'Ajouter un commentaire' });
    await userEvent.type(champ, 'Relancé.');
    await userEvent.click(within(fenetre).getByRole('button', { name: 'Ajouter le commentaire' }));

    expect(await within(fenetre).findByText("Le commentaire n'a pas pu être ajouté.")).toBeInTheDocument();
    expect(champ).toHaveValue('Relancé.');
  });
});

describe('les fichiers joints', () => {
  const CAPTURE = {
    id: 7, signalementId: 16, nom: 'capture.png', typeMime: 'image/png', taille: 2048, estImage: true,
  };
  const RAPPORT = {
    id: 8, signalementId: 16, nom: 'rapport.pdf', typeMime: 'application/pdf', taille: 3 * 1024 * 1024, estImage: false,
  };

  beforeEach(() => {
    api.getPiecesSignalement.mockResolvedValue({ data: [CAPTURE, RAPPORT] });
    api.getFichierPieceSignalement.mockResolvedValue({ data: new Blob(['x']) });
  });

  test('l’aperçu montre les images et propose de télécharger', async () => {
    const fenetre = await ouvrirApercu();

    const image = await within(fenetre).findByRole('img', { name: 'capture.png' });
    expect(image).toHaveAttribute('src', 'blob:apercu');
    expect(api.getFichierPieceSignalement).toHaveBeenCalledWith(16, 7);

    // Un document n'est pas chargé tant qu'on ne le demande pas.
    expect(api.getFichierPieceSignalement).not.toHaveBeenCalledWith(16, 8);
    expect(within(fenetre).getByText(/rapport\.pdf/)).toBeInTheDocument();
    expect(within(fenetre).getByText(/3,0 Mo/)).toBeInTheDocument();

    const clic = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await userEvent.click(within(fenetre).getByRole('button', { name: 'Télécharger rapport.pdf' }));

    await waitFor(() => expect(api.getFichierPieceSignalement).toHaveBeenCalledWith(16, 8));
    await waitFor(() => expect(clic).toHaveBeenCalled());
    clic.mockRestore();
  });

  test('l’aperçu ne fait que lire : ni ajout ni suppression', async () => {
    const fenetre = await ouvrirApercu();
    await within(fenetre).findByRole('img', { name: 'capture.png' });

    expect(within(fenetre).queryByRole('button', { name: /Supprimer capture/ })).not.toBeInTheDocument();
    expect(within(fenetre).queryByLabelText(/Ajouter des captures/)).not.toBeInTheDocument();
  });

  test('sans fichier, l’aperçu n’affiche pas de section vide', async () => {
    api.getPiecesSignalement.mockResolvedValue({ data: [] });
    const fenetre = await ouvrirApercu();
    await within(fenetre).findByText('Vu avec Google.');

    expect(within(fenetre).queryByText('Fichiers joints')).not.toBeInTheDocument();
  });

  test('« Modifier » permet d’ajouter et de supprimer', async () => {
    api.ajouterPieceSignalement.mockResolvedValue({
      data: { ...RAPPORT, id: 9, nom: 'autre.pdf' },
    });
    api.supprimerPieceSignalement.mockResolvedValue({});
    render(<SignalementsAdmin />);

    await userEvent.click(await screen.findByRole('button', { name: 'Modifier' }));
    await screen.findByText(/rapport\.pdf/);

    const fichier = new File(['x'], 'autre.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText(/Ajouter des captures/), fichier);

    expect(api.ajouterPieceSignalement).toHaveBeenCalledWith(16, fichier);
    expect(await screen.findByText(/autre\.pdf/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Supprimer rapport.pdf' }));
    expect(api.supprimerPieceSignalement).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    expect(api.supprimerPieceSignalement).toHaveBeenCalledWith(16, 8);
    await waitFor(() => expect(screen.queryByText(/rapport\.pdf/)).not.toBeInTheDocument());
  });

  test('le refus du serveur s’affiche', async () => {
    api.getPiecesSignalement.mockResolvedValue({ data: [] });
    api.ajouterPieceSignalement.mockRejectedValue({ response: { data: { message: 'Ce fichier n\'est pas une image valide.' } } });
    render(<SignalementsAdmin />);

    await userEvent.click(await screen.findByRole('button', { name: 'Modifier' }));
    await userEvent.upload(await screen.findByLabelText(/Ajouter des captures/), new File(['x'], 'faux.png', { type: 'image/png' }));

    expect(await screen.findByText("Ce fichier n'est pas une image valide.")).toBeInTheDocument();
  });
});
