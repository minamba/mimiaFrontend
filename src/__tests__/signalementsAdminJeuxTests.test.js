/**
 * LES SIGNALEMENTS DES ADMINISTRATEURS, RELIÉS AUX JEUX DE TEST — Camara, le 05/11/2026.
 *
 *   1. Le bouton à côté du bouclier : catégorie, description, et le rattachement (compétence, jeu, bloc).
 *   2. « Créer un nouveau jeu de test » : le jeu, puis un test réduit au titre et à la matière, une seule ligne.
 *   3. L'onglet « Signalements Admin » : sa liste, avec le jeu et la ligne de chacun.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoutonSignalementAdmin from '../components/BoutonSignalementAdmin';
import SignalementsAdmin from '../components/SignalementsAdmin';
import JeuxTestsAdmin from '../components/JeuxTestsAdmin';
import * as admin from '../lib/api/adminApi';
import * as jeuxApi from '../lib/api/jeuxTestsApi';
import * as referentiel from '../lib/api/referentielApi';

jest.mock('../lib/api/adminApi', () => ({
  creerSignalementAdmin: jest.fn(),
  ajouterPieceSignalement: jest.fn(),
  getSignalements: jest.fn(),
  getSignalementsAdmin: jest.fn(),
  creerSignalement: jest.fn(),
  modifierSignalement: jest.fn(),
  supprimerSignalement: jest.fn(),
  getPiecesSignalement: jest.fn(() => Promise.resolve({ data: [] })),
  getCommentairesSignalement: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('../lib/api/jeuxTestsApi', () => ({
  getJeuxTests: jest.fn(),
  getJeuTest: jest.fn(),
  creerJeuTest: jest.fn(),
  modifierJeuTest: jest.fn(),
  ajouterTestAuJeu: jest.fn(),
}));

jest.mock('../lib/api/referentielApi', () => ({ getNiveaux: jest.fn(), getMatieres: jest.fn() }));

jest.mock('../lib/hooks/useEvenementsAdmin', () => ({ useEvenementsAdmin: () => {} }));
jest.mock('react-redux', () => ({ useSelector: () => ({}) }));

const JEU = {
  id: 7, titre: 'Grille de tests CP', section: 'elementaire', niveauCode: 'CP', classe: 'CP', titres: ['Test Français'],
  tests: [{ id: 21, titre: 'Test Français', matiere: 'Français', matiereCode: 'FRANCAIS', lignes: [] }],
};

beforeEach(() => {
  jest.clearAllMocks();
  referentiel.getNiveaux.mockResolvedValue({
    data: [{ id: 1, code: 'CP', libelle: 'CP', cycle: 'Primaire', ordre: 1, groupe: 'École élémentaire', selectionnable: true }],
  });
  referentiel.getMatieres.mockResolvedValue({
    data: [{ id: 3, code: 'FRANCAIS', libelle: 'Français', ordre: 1, niveauOrdreMin: 1, niveauOrdreMax: 12 }],
  });
  admin.getPiecesSignalement.mockResolvedValue({ data: [] });
  admin.getCommentairesSignalement.mockResolvedValue({ data: [] });
  jeuxApi.getJeuxTests.mockResolvedValue({ data: [JEU] });
  jeuxApi.getJeuTest.mockResolvedValue({ data: JEU });
  admin.creerSignalementAdmin.mockResolvedValue({ data: { id: 99 } });
});

const ouvrir = async () => {
  render(<BoutonSignalementAdmin />);
  await userEvent.click(screen.getByRole('button', { name: 'Signalement admin' }));
};

describe('le bouton à côté du bouclier', () => {
  test('sans jeu de test : le signalement part seul', async () => {
    await ouvrir();
    await userEvent.type(screen.getByLabelText('Description'), 'La voix coupe la syllabe');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(admin.creerSignalementAdmin).toHaveBeenCalledWith({
      categorie: 'TECHNIQUE', description: 'La voix coupe la syllabe', competence: '', jeuId: null, testId: null,
    });
    expect(await screen.findByText('Signalement enregistré')).toBeInTheDocument();
  });

  test('relié : le jeu montre ses blocs ; sans bloc ni compétence, le clic dit ce qui manque', async () => {
    await ouvrir();
    await userEvent.type(screen.getByLabelText('Description'), 'La syllabe change toute seule');
    await userEvent.selectOptions(await screen.findByLabelText('Jeu de test'), '7');

    const bloc = await screen.findByLabelText('Bloc');
    expect(await within(bloc).findByRole('option', { name: 'Test Français · Français' })).toBeInTheDocument();

    const enregistrer = screen.getByRole('button', { name: 'Enregistrer' });
    expect(enregistrer).toBeEnabled();
    await userEvent.click(enregistrer);
    expect(screen.getByRole('alert')).toHaveTextContent('Choisis le bloc du jeu de test.');

    await userEvent.selectOptions(bloc, '21');
    await userEvent.click(enregistrer);
    expect(screen.getByRole('alert')).toHaveTextContent('Remplis « Compétence / test à réaliser »');
    expect(screen.getByLabelText('Compétence / test à réaliser')).toHaveFocus();
    expect(admin.creerSignalementAdmin).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText('Compétence / test à réaliser'), 'Rester sur les syllabes');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(admin.creerSignalementAdmin).toHaveBeenCalledWith({
      categorie: 'TECHNIQUE', description: 'La syllabe change toute seule', competence: 'Rester sur les syllabes', jeuId: 7, testId: 21,
    });
    expect(await screen.findByText(/bloc « Test Français », en statut KO/)).toBeInTheDocument();
  });

  test('un nouveau jeu de test : le jeu, puis un test d’une seule ligne, et le signalement s’y relie', async () => {
    jeuxApi.creerJeuTest.mockResolvedValue({
      data: { id: 8, titre: 'Bugs CP', section: 'elementaire', niveauCode: 'CP', classe: 'CP', tests: [] },
    });
    jeuxApi.ajouterTestAuJeu.mockResolvedValue({
      data: {
        id: 8, titre: 'Bugs CP', section: 'elementaire', niveauCode: 'CP', classe: 'CP',
        tests: [{ id: 30, titre: 'Test Syllabes', matiere: 'Français', lignes: [{ id: 300, competence: '' }] }],
      },
    });
    jeuxApi.getJeuTest.mockImplementation((id) => Promise.resolve({
      data: id === 8
        ? { id: 8, titre: 'Bugs CP', classe: 'CP', tests: [{ id: 30, titre: 'Test Syllabes', matiere: 'Français', lignes: [] }] }
        : JEU,
    }));

    await ouvrir();
    await userEvent.click(screen.getByRole('button', { name: 'Créer un nouveau jeu de test' }));

    const fenetre = await screen.findByRole('dialog', { name: 'Nouveau jeu de test' });
    await userEvent.type(within(fenetre).getByLabelText('Titre'), 'Bugs CP');
    await userEvent.selectOptions(within(fenetre).getByLabelText('Section'), 'elementaire');
    await userEvent.selectOptions(within(fenetre).getByLabelText('Classe'), '1');
    await userEvent.click(within(fenetre).getByRole('button', { name: 'Créer le jeu de test' }));
    expect(jeuxApi.creerJeuTest).toHaveBeenCalledWith(1, 'Bugs CP');

    expect(await within(fenetre).findByRole('heading', { name: 'Ajouter un test' })).toBeInTheDocument();
    expect(within(fenetre).queryByLabelText(/Nombre/)).not.toBeInTheDocument();
    await userEvent.type(within(fenetre).getByLabelText('Titre'), 'Test Syllabes');
    await userEvent.selectOptions(within(fenetre).getByLabelText('Matière'), '3');
    await userEvent.click(within(fenetre).getByRole('button', { name: 'Créer le test' }));

    expect(jeuxApi.ajouterTestAuJeu).toHaveBeenCalledWith(8, { titre: 'Test Syllabes', matiereId: 3, nombre: 1, competences: [''] });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Nouveau jeu de test' })).not.toBeInTheDocument());
    expect(screen.getByLabelText('Jeu de test')).toHaveValue('8');
    expect(await screen.findByLabelText('Bloc')).toHaveValue('30');
  });
});

describe('l’onglet « Signalements Admin »', () => {
  test('sa liste, avec le jeu de test et la ligne de chacun', async () => {
    admin.getSignalementsAdmin.mockResolvedValue({
      data: [{
        id: 1, estAdmin: true, parentMail: 'ceo@mimia.fr', categorie: 'TECHNIQUE', description: 'La syllabe change',
        etat: 'nouveau', dateCreation: '2026-11-05T20:00:00', nombrePieces: 0, nombreCommentaires: 0, ligneDeTestId: 300,
        test: { ligneId: 300, jeuTitre: 'Grille de tests CP', classe: 'CP', testTitre: 'Test Français', competence: 'Rester sur les syllabes', statut: 'ko' },
      }],
    });

    render(<SignalementsAdmin admin />);

    expect(await screen.findByRole('heading', { name: 'Signalements Admin' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Jeu de test' })).toBeInTheDocument();
    expect(screen.getByText('Grille de tests CP › Test Français')).toBeInTheDocument();
    expect(screen.getByText('Rester sur les syllabes · KO')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ajouter un signalement' })).not.toBeInTheDocument();
    expect(admin.getSignalements).not.toHaveBeenCalled();
  });

  test('le jeu de test est un lien : un clic ouvre le jeu sur la ligne du signalement', async () => {
    admin.getSignalementsAdmin.mockResolvedValue({
      data: [{
        id: 1, estAdmin: true, parentMail: 'ceo@mimia.fr', categorie: 'TECHNIQUE', description: 'La syllabe change',
        etat: 'nouveau', dateCreation: '2026-11-05T20:00:00', nombrePieces: 0, nombreCommentaires: 0, ligneDeTestId: 300,
        test: { ligneId: 300, jeuId: 7, testId: 21, jeuTitre: 'Grille de tests CP', classe: 'CP', testTitre: 'Test Français', competence: 'Rester sur les syllabes', statut: 'ko' },
      }],
    });
    const ouvrir = jest.fn();

    render(<SignalementsAdmin admin onOuvrirJeu={ouvrir} />);
    const lien = await screen.findByRole('link', { name: 'Grille de tests CP › Test Français' });
    expect(lien).toHaveAttribute('href', '/admin?onglet=jeux_tests&jeu=7&ligne=300');

    await userEvent.click(lien);
    expect(ouvrir).toHaveBeenCalledWith(7, 300);
  });

  test('« Modifier » : la compétence et la description partent ensemble, pour la ligne du jeu de test', async () => {
    admin.getSignalementsAdmin.mockResolvedValue({
      data: [{
        id: 1, estAdmin: true, parentMail: 'ceo@mimia.fr', categorie: 'TECHNIQUE', description: 'La syllabe change',
        etat: 'nouveau', dateCreation: '2026-11-05T20:00:00', nombrePieces: 0, nombreCommentaires: 0, ligneDeTestId: 300,
        competence: 'Rester sur les syllabes',
        test: { ligneId: 300, jeuTitre: 'Grille de tests CP', classe: 'CP', testTitre: 'Test Français', competence: 'Rester sur les syllabes', statut: 'ko' },
      }],
    });
    admin.modifierSignalement.mockResolvedValue({ data: {} });

    render(<SignalementsAdmin admin />);
    await userEvent.click(await screen.findByRole('button', { name: 'Modifier' }));

    const competence = screen.getByLabelText('Compétence / test à réaliser');
    expect(competence).toHaveValue('Rester sur les syllabes');
    await userEvent.clear(competence);
    await userEvent.type(competence, 'Ne pas changer de syllabe');
    await userEvent.clear(screen.getByLabelText('Description'));
    await userEvent.type(screen.getByLabelText('Description'), 'Elle change encore');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(admin.modifierSignalement).toHaveBeenCalledWith(1, {
      categorie: 'TECHNIQUE', description: 'Elle change encore', etat: 'nouveau', competence: 'Ne pas changer de syllabe',
    });
  });
});

describe('l’onglet « Jeux de tests » ouvert depuis un signalement', () => {
  test('le jeu s’ouvre, le bloc se déplie et la ligne est mise en évidence', async () => {
    const jeu = {
      ...JEU,
      nombreOk: 0, nombreLignes: 2, statut: 'en_cours', auteur: 'ceo@mimia.fr', dateCreation: '2026-11-05T20:00:00',
      tests: [{
        id: 21, titre: 'Test Français', matiere: 'Français', matiereCode: 'FRANCAIS',
        lignes: [
          { id: 299, competence: 'Lire une syllabe', statut: 'ok', dateCreation: '2026-11-05T20:00:00' },
          { id: 300, competence: 'Rester sur les syllabes', statut: 'ko', commentaire: 'La syllabe change', dateCreation: '2026-11-05T20:00:00' },
        ],
      }],
    };
    jeuxApi.getJeuTest.mockResolvedValue({ data: jeu });
    const vue = jest.fn();

    render(<JeuxTestsAdmin cible={{ jeuId: 7, ligneId: 300, cle: 1 }} onCibleVue={vue} />);

    const ligne = await screen.findByText('Rester sur les syllabes');
    expect(jeuxApi.getJeuTest).toHaveBeenCalledWith(7);
    expect(vue).toHaveBeenCalled();
    expect(ligne.closest('tr')).toHaveClass('jeux-tests__ligne--ciblee');
    expect(screen.getByText('Lire une syllabe').closest('tr')).not.toHaveClass('jeux-tests__ligne--ciblee');
  });
});
