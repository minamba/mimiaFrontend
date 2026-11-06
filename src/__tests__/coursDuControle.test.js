/**
 * LE COURS DE L'ÉLÈVE, IMPORTÉ AVEC SON CONTRÔLE — Camara, le 26/09/2026.
 *
 * Remontée d'un parent : pour préparer un contrôle, le professeur doit avoir
 * en tête la leçon de l'élève et en suivre la trame. Sans cours, rien ne
 * change — il prépare avec le programme officiel.
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. À LA CRÉATION, le cours part APRÈS le contrôle, sur son numéro.
 *   2. UN DOCUMENT REFUSÉ NE FAIT PAS PERDRE LE CONTRÔLE : la fenêtre reste
 *      ouverte et dit ce qui n'est pas passé.
 *   3. SANS COURS, la création est exactement celle d'avant.
 *   4. UN CONTRÔLE EXISTANT montre son cours, et on peut en retirer une page.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ControleForm from '../components/ControleForm';
import CoursDuControle from '../components/CoursDuControle';
import {
  ajouterCoursControle, creerControle, getCoursControle, getFichierCoursControle,
  getTexteCoursControle, supprimerCoursControle,
} from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({
  creerControle: jest.fn(),
  modifierControle: jest.fn(),
  ajouterCoursControle: jest.fn(),
  getCoursControle: jest.fn(),
  supprimerCoursControle: jest.fn(),
  creerScanCoursControle: jest.fn(),
  etatScanCoursControle: jest.fn(),
  getFichierCoursControle: jest.fn(),
  getTexteCoursControle: jest.fn(),
}));

jest.mock('../lib/storage/ecouteService', () => ({
  ecouteService: { supporte: false, ecouter: jest.fn() },
}));

const MATIERES = [{ id: 1, libelle: 'Mathématiques', active: true }];

// Un PDF : la réduction d'image ne s'applique pas, le fichier part tel quel.
const LECON = () => new File(['%PDF-1.4'], 'lecon-thales.pdf', { type: 'application/pdf' });

beforeEach(() => {
  jest.clearAllMocks();
  creerControle.mockResolvedValue({ data: { id: 42 } });
  ajouterCoursControle.mockResolvedValue({ data: { id: 7, nomFichier: 'lecon-thales.pdf', lu: false } });
  getCoursControle.mockResolvedValue({ data: [] });
  supprimerCoursControle.mockResolvedValue({});
});

const monterFormulaire = (props = {}) => render(
  <ControleForm
    eleveId="9"
    matieres={MATIERES}
    jour={new Date(2026, 9, 5)}
    onEnregistre={jest.fn()}
    onAnnule={jest.fn()}
    {...props}
  />,
);

test('à la création, le cours attend puis part APRÈS le contrôle, sur son numéro', async () => {
  const onEnregistre = jest.fn();
  monterFormulaire({ onEnregistre });

  await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');
  await userEvent.upload(screen.getByLabelText(/Importer mon cours/), LECON());

  expect(await screen.findByText('lecon-thales.pdf')).toBeInTheDocument();
  expect(screen.getByText('Sera envoyé avec le contrôle')).toBeInTheDocument();
  expect(ajouterCoursControle).not.toHaveBeenCalled();

  await waitFor(() => expect(screen.getByRole('button', { name: 'Ajouter le contrôle' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Ajouter le contrôle' }));

  await waitFor(() => expect(onEnregistre).toHaveBeenCalled());
  expect(creerControle).toHaveBeenCalledTimes(1);
  expect(ajouterCoursControle).toHaveBeenCalledWith('9', 42, expect.objectContaining({ name: 'lecon-thales.pdf' }));
});

test('un document refusé ne fait pas perdre le contrôle : la fenêtre reste ouverte et le dit', async () => {
  ajouterCoursControle.mockRejectedValue({ response: { data: { message: 'Ce fichier est trop lourd.' } } });
  const onEnregistre = jest.fn();
  monterFormulaire({ onEnregistre });

  await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');
  await userEvent.upload(screen.getByLabelText(/Importer mon cours/), LECON());
  await screen.findByText('lecon-thales.pdf');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ajouter le contrôle' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Ajouter le contrôle' }));

  expect(await screen.findByText(/Le contrôle est ajouté, mais un document n’est pas passé : Ce fichier est trop lourd\./))
    .toBeInTheDocument();
  expect(onEnregistre).not.toHaveBeenCalled();

  // La fenêtre continue sur le contrôle créé : plus de seconde création.
  expect(screen.getByRole('button', { name: 'Terminer' })).toBeInTheDocument();
});

test('sans cours, la création est celle d’avant', async () => {
  const onEnregistre = jest.fn();
  monterFormulaire({ onEnregistre });

  await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ajouter le contrôle' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Ajouter le contrôle' }));

  await waitFor(() => expect(onEnregistre).toHaveBeenCalled());
  expect(ajouterCoursControle).not.toHaveBeenCalled();
});

test('un contrôle existant montre son cours, lu ou en lecture, et on peut en retirer une page', async () => {
  getCoursControle.mockResolvedValue({
    data: [
      { id: 1, nomFichier: 'page1.jpg', lu: true },
      { id: 2, nomFichier: 'page2.jpg', lu: true },
    ],
  });

  render(<CoursDuControle eleveId="9" controleId={42} />);

  expect(await screen.findByText('page1.jpg')).toBeInTheDocument();
  expect(screen.getAllByText('Lu par ton professeur')).toHaveLength(2);

  await userEvent.click(screen.getByRole('button', { name: 'Retirer page1.jpg' }));

  expect(supprimerCoursControle).toHaveBeenCalledWith('9', 42, 1);
  await waitFor(() => expect(screen.queryByText('page1.jpg')).not.toBeInTheDocument());
  expect(screen.getByText('page2.jpg')).toBeInTheDocument();
});

test('sur un contrôle existant, un fichier part tout de suite', async () => {
  render(<CoursDuControle eleveId="9" controleId={42} />);

  await userEvent.upload(screen.getByLabelText(/Importer mon cours/), LECON());

  await waitFor(() => expect(ajouterCoursControle).toHaveBeenCalledWith('9', 42, expect.any(File)));
  expect(await screen.findByText('En lecture…')).toBeInTheDocument();
});

/*
 * L'APERÇU DU DOCUMENT PAR L'ÉLÈVE — Camara, le 04/11/2026 : « je veux aussi que
 * l'enfant puisse consulter le document ». Le fichier est sur le serveur une
 * semaine après le contrôle, puis effacé : l'aperçu disparaît avec lui.
 */
describe('l’aperçu du cours par l’élève (04/11/2026)', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:apercu');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('une image consultable a un bouton Aperçu qui l’affiche ; un fichier effacé n’en a plus', async () => {
    getCoursControle.mockResolvedValue({
      data: [
        { id: 1, nomFichier: 'page1.jpg', lu: true, consultable: true, purge: false, genre: 'image' },
        { id: 2, nomFichier: 'ancienne.jpg', lu: true, consultable: false, purge: true, genre: 'image' },
      ],
    });
    getFichierCoursControle.mockResolvedValue({ data: new Blob(['img'], { type: 'image/jpeg' }) });

    render(<CoursDuControle eleveId="9" controleId={42} />);

    expect(await screen.findByText('page1.jpg')).toBeInTheDocument();
    expect(screen.getByText('Effacé une semaine après le contrôle')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aperçu de ancienne.jpg' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Aperçu de page1.jpg' }));

    expect(getFichierCoursControle).toHaveBeenCalledWith('9', 42, 1);
    expect(await screen.findByRole('img', { name: 'page1.jpg' })).toHaveAttribute('src', 'blob:apercu');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('un document Word montre le texte que le professeur lit, et se télécharge', async () => {
    getCoursControle.mockResolvedValue({
      data: [{ id: 3, nomFichier: 'lecon.docx', lu: true, consultable: true, purge: false, genre: 'word' }],
    });
    getTexteCoursControle.mockResolvedValue({ data: { texte: 'Le théorème de Thalès', lu: true, illisible: false } });

    render(<CoursDuControle eleveId="9" controleId={42} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aperçu de lecon.docx' }));

    expect(getTexteCoursControle).toHaveBeenCalledWith('9', 42, 3);
    expect(await screen.findByText('Le théorème de Thalès')).toBeInTheDocument();
    expect(getFichierCoursControle).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Télécharger' })).toBeInTheDocument();
  });

  test('un fichier purgé entre-temps le dit au lieu d’un cadre vide', async () => {
    getCoursControle.mockResolvedValue({
      data: [{ id: 4, nomFichier: 'cours.pdf', lu: true, consultable: true, purge: false, genre: 'pdf' }],
    });
    getFichierCoursControle.mockRejectedValue({ response: { status: 410 } });

    render(<CoursDuControle eleveId="9" controleId={42} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aperçu de cours.pdf' }));

    expect(await screen.findByRole('status')).toHaveTextContent('effacé une semaine après le contrôle');
    expect(screen.queryByRole('button', { name: 'Télécharger' })).not.toBeInTheDocument();
  });
});
