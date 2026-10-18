import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Messagerie from '../components/Messagerie';
import {
  getMessages, getMessage, supprimerMessages, getBrouillonPour, enregistrerBrouillon, getCompteursMessagerie,
} from '../lib/api/adminApi';

/*
 * LES TROIS DOSSIERS DE LA MESSAGERIE — Camara, le 17/10/2026 : « Boîte de
 * réception », « Messages envoyés », « Brouillons » ; supprimer un message ou
 * toute la page ; dix messages par page ; une réponse non envoyée est gardée
 * en brouillon.
 */
jest.mock('../lib/api/adminApi', () => ({
  getMessages: jest.fn(),
  getMessage: jest.fn(),
  marquerMessageLu: jest.fn(),
  repondreMessage: jest.fn(),
  deconnecterBoite: jest.fn(),
  connecterBoite: jest.fn(),
  supprimerMessages: jest.fn(),
  getBrouillonPour: jest.fn(),
  enregistrerBrouillon: jest.fn(),
  getCompteursMessagerie: jest.fn(),
}));

// Le formulaire d'« Écrire à un parent » a ses propres tests : ici, on vérifie
// seulement qu'il s'ouvre, et sur quel brouillon.
jest.mock('../components/MessageParent', () => function MessageParentFactice({ brouillonAReprendre, boite }) {
  return <p>Formulaire de rédaction {brouillonAReprendre?.identifiant ?? 'vide'} depuis {boite}</p>;
});

const recu = (id, sujet) => ({
  identifiant: id, deNom: 'Hilda', deAdresse: 'hilda@exemple.fr', sujet, extrait: '…', date: '2026-10-17T10:00:00Z', lu: true, aUnBrouillon: false,
});

describe('les dossiers de la messagerie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
  });

  it('les trois onglets, et « Messages envoyés » montre le destinataire', async () => {
    getMessages.mockImplementation((boite, dossier) => Promise.resolve({
      data: dossier === 'envoyes'
        ? { configuree: true, total: 1, messages: [{ identifiant: 7, aNom: 'Paul Martin', aAdresse: 'paul@exemple.fr', sujet: 'Re : Inscription', date: '2026-10-17T10:00:00Z', lu: true }] }
        : { configuree: true, total: 1, nonLus: 0, messages: [recu(1, 'Inscription')] },
    }));
    render(<Messagerie boite="support" />);

    expect(await screen.findByText('Inscription')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /^Messages envoyés/ }));

    expect(await screen.findByText('Paul Martin')).toBeInTheDocument();
    expect(getMessages).toHaveBeenLastCalledWith('support', 'envoyes', 1);
    expect(screen.getByRole('tab', { name: /^Messages envoyés/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('tout sélectionner puis supprimer : la page part à la corbeille', async () => {
    getMessages.mockResolvedValue({ data: { configuree: true, total: 2, messages: [recu(1, 'Un'), recu(2, 'Deux')] } });
    supprimerMessages.mockResolvedValue({ data: { supprimes: 2 } });
    render(<Messagerie boite="support" />);

    fireEvent.click(await screen.findByLabelText('Tout sélectionner'));
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer (2)' }));

    await waitFor(() => expect(supprimerMessages).toHaveBeenCalledWith([1, 2], 'support', 'reception'));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('corbeille'));
  });

  it('dix par page : la page 2 se demande au serveur', async () => {
    getMessages.mockResolvedValue({ data: { configuree: true, total: 23, messages: [recu(1, 'Un')] } });
    render(<Messagerie boite="support" />);

    const pages = await screen.findByRole('navigation', { name: 'Pages du dossier' });
    fireEvent.click(within(pages).getByRole('button', { name: 'Page 2' }));

    await waitFor(() => expect(getMessages).toHaveBeenLastCalledWith('support', 'reception', 2));
    expect(within(pages).getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  it('une réponse commencée est gardée en brouillon', async () => {
    getMessages.mockResolvedValue({ data: { configuree: true, total: 1, messages: [recu(5, 'Question')] } });
    getMessage.mockResolvedValue({ data: { ...recu(5, 'Question'), html: null, texte: 'Bonjour' } });
    enregistrerBrouillon.mockResolvedValue({ data: {} });
    render(<Messagerie boite="support" />);

    fireEvent.click(await screen.findByText('Question'));
    const champ = await screen.findByLabelText('Votre réponse');

    jest.useFakeTimers();
    fireEvent.change(champ, { target: { value: 'Bonjour Hilda' } });
    await act(async () => { jest.advanceTimersByTime(1600); });
    jest.useRealTimers();

    await waitFor(() => expect(enregistrerBrouillon).toHaveBeenCalledWith(
      { messageOrigine: 5, destinataire: 'hilda@exemple.fr', sujet: 'Re : Question', texte: 'Bonjour Hilda' }, 'support'));
    expect(await screen.findByText(/Brouillon enregistré à/)).toBeInTheDocument();
  });

  it('un brouillon rouvre le message et sa réponse en cours', async () => {
    getMessages.mockImplementation((boite, dossier) => Promise.resolve({
      data: dossier === 'brouillons'
        ? { configuree: true, total: 1, messages: [{ identifiant: 40, messageOrigine: 5, aAdresse: 'hilda@exemple.fr', sujet: 'Re : Question', extrait: 'Bonjour', date: '2026-10-17T10:00:00Z', lu: true }] }
        : { configuree: true, total: 0, messages: [] },
    }));
    getMessage.mockResolvedValue({ data: { ...recu(5, 'Question'), html: null, texte: 'Une question' } });
    getBrouillonPour.mockResolvedValue({ data: { id: 40, texte: 'Bonjour Hilda, voici', dateModification: '2026-10-17T10:05:00Z' } });
    render(<Messagerie boite="support" />);

    fireEvent.click(await screen.findByRole('tab', { name: /^Brouillons/ }));
    fireEvent.click(await screen.findByText('Re : Question'));

    expect(await screen.findByLabelText('Votre réponse')).toHaveValue('Bonjour Hilda, voici');
    expect(getMessage).toHaveBeenCalledWith(5, false, 'support', 'reception');
  });

  it('« Écrire un nouveau message » ouvre la fenêtre de rédaction', async () => {
    getMessages.mockResolvedValue({ data: { configuree: true, adresse: 'camara@mimia.fr', total: 0, messages: [] } });
    render(<Messagerie />);

    fireEvent.click(await screen.findByRole('button', { name: 'Écrire un nouveau message' }));
    const fenetre = screen.getByRole('dialog', { name: 'Nouveau message' });
    expect(within(fenetre).getByText('Formulaire de rédaction vide depuis moi')).toBeInTheDocument();

    fireEvent.click(within(fenetre).getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('depuis la boîte Support, le nouveau message part du support', async () => {
    getMessages.mockResolvedValue({ data: { configuree: true, total: 0, messages: [] } });
    render(<Messagerie boite="support" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Écrire un nouveau message' }));
    const fenetre = screen.getByRole('dialog', { name: 'Nouveau message' });
    expect(within(fenetre).getByRole('heading', { name: 'Nouveau message du support' })).toBeInTheDocument();
    expect(within(fenetre).getByText('Formulaire de rédaction vide depuis support')).toBeInTheDocument();
  });

  it('un brouillon d’« Écrire à un parent » se reprend dans la fenêtre de rédaction', async () => {
    getMessages.mockImplementation((boite, dossier) => Promise.resolve({
      data: dossier === 'brouillons'
        ? { configuree: true, total: 1, messages: [{ identifiant: 31, messageOrigine: null, aAdresse: 'hilda@exemple.fr', sujet: 'Votre inscription', extrait: '', date: '2026-10-17T10:00:00Z', lu: true }] }
        : { configuree: true, total: 0, messages: [] },
    }));
    render(<Messagerie />);

    fireEvent.click(await screen.findByRole('tab', { name: /^Brouillons/ }));
    fireEvent.click(await screen.findByText('Votre inscription'));

    expect(await screen.findByText('Formulaire de rédaction 31 depuis moi')).toBeInTheDocument();
    expect(getMessage).not.toHaveBeenCalled();
  });

  it('les onglets portent leurs pastilles : non lus, envoyés, brouillons', async () => {
    getMessages.mockResolvedValue({ data: { configuree: true, total: 12, nonLus: 3, messages: [recu(1, 'Un')] } });
    getCompteursMessagerie.mockResolvedValue({ data: { reception: 12, nonLus: 3, envoyes: 40, brouillons: 2 } });
    render(<Messagerie boite="support" />);

    expect(await within(screen.getByRole('tab', { name: /Brouillons/ })).findByText('2')).toBeInTheDocument();
    expect(within(screen.getByRole('tab', { name: /Messages envoyés/ })).getByText('40')).toBeInTheDocument();
    expect(within(screen.getByRole('tab', { name: /Boîte de réception/ })).getByText('3')).toBeInTheDocument();
  });
});
