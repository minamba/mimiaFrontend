/**
 * JOINDRE DES FICHIERS À UN SIGNALEMENT — Camara, le 03/11/2026 : des captures d'écran
 * et d'autres documents, depuis le bouton « Signaler » du parent.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoutonSignalement from '../components/BoutonSignalement';
import * as api from '../lib/api/signalementsApi';
import {
  PIECES_MAX, TAILLE_MAX, ajouterAuxPieces, refusPiece, tailleLisible,
} from '../lib/signalementPieces';

jest.mock('../lib/api/signalementsApi');

const fichier = (nom, taille = 10) => {
  const f = new File(['x'], nom);
  Object.defineProperty(f, 'size', { value: taille });
  return f;
};

describe('les règles', () => {
  test.each(['a.png', 'a.JPG', 'a.jpeg', 'a.pdf', 'a.docx', 'a.xlsx', 'a.zip'])('%s passe', (nom) => {
    expect(refusPiece(fichier(nom))).toBeNull();
  });

  test.each(['a.svg', 'a.html', 'a.exe', 'a.js', 'sans-extension'])('%s est refusé', (nom) => {
    expect(refusPiece(fichier(nom))).toMatch(/pas accepté/);
  });

  test('vide ou trop gros', () => {
    expect(refusPiece(fichier('a.png', 0))).toMatch(/vide/);
    expect(refusPiece(fichier('a.png', TAILLE_MAX + 1))).toMatch(/10 Mo/);
    expect(refusPiece(fichier('a.png', TAILLE_MAX))).toBeNull();
  });

  test('pas de doublon, et pas plus que la limite', () => {
    const a = fichier('a.png');
    expect(ajouterAuxPieces([a], [fichier('a.png')]).liste).toHaveLength(1);

    const beaucoup = Array.from({ length: PIECES_MAX + 2 }, (_, i) => fichier(`${i}.png`));
    const { liste, refus } = ajouterAuxPieces([], beaucoup);
    expect(liste).toHaveLength(PIECES_MAX);
    expect(refus).toHaveLength(2);
  });

  test('une taille lisible', () => {
    expect(tailleLisible(2048)).toBe('2 Ko');
    expect(tailleLisible(3 * 1024 * 1024)).toBe('3,0 Mo');
  });
});

describe('le bouton « Signaler »', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.creerSignalement.mockResolvedValue({ data: { id: 42 } });
    api.joindrePieceSignalement.mockResolvedValue({});
  });

  const remplir = async () => {
    await userEvent.click(screen.getByRole('button', { name: /Signaler/ }));
    await userEvent.type(screen.getByLabelText('Description'), 'La voix a changé.');
  };

  test('le signalement part d’abord, ses fichiers ensuite', async () => {
    render(<BoutonSignalement />);
    await remplir();

    const capture = new File(['x'], 'capture.png', { type: 'image/png' });
    await userEvent.upload(screen.getByLabelText(/Captures d’écran/), capture);
    expect(screen.getByText(/capture\.png/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

    await screen.findByText('Message envoyé');
    expect(api.joindrePieceSignalement).toHaveBeenCalledWith(42, capture);
  });

  test('sans fichier, rien de plus ne part', async () => {
    render(<BoutonSignalement />);
    await remplir();
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

    await screen.findByText('Message envoyé');
    expect(api.joindrePieceSignalement).not.toHaveBeenCalled();
  });

  test('un fichier non joint est dit, le message reste envoyé', async () => {
    api.joindrePieceSignalement.mockRejectedValue(new Error('refus'));
    render(<BoutonSignalement />);
    await remplir();

    await userEvent.upload(screen.getByLabelText(/Captures d’écran/), new File(['x'], 'capture.png'));
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }));

    await screen.findByText('Message envoyé');
    expect(screen.getByRole('alert')).toHaveTextContent('capture.png');
  });

  test('on retire un fichier avant l’envoi', async () => {
    render(<BoutonSignalement />);
    await remplir();

    await userEvent.upload(screen.getByLabelText(/Captures d’écran/), new File(['x'], 'capture.png'));
    await userEvent.click(screen.getByRole('button', { name: 'Retirer capture.png' }));

    await waitFor(() => expect(screen.queryByText(/capture\.png/)).not.toBeInTheDocument());
  });
});
