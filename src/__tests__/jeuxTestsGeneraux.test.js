/**
 * « TESTS GÉNÉRAUX » DANS LES JEUX DE TESTS — Min's, le 22/11/2026.
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. « Nouveau jeu de test » : la section « Tests Généraux » n'a qu'une classe, « Tests Généraux », et le jeu part
 *      sans classe du référentiel (`section = generaux`).
 *   2. Un bloc d'un jeu de tests généraux : CATÉGORIE au lieu de MATIÈRE. Liste = exemples + catégories déjà employées
 *      (sans doublon), et « + Nouvelle catégorie… » ouvre une saisie libre.
 *   3. Les blocs se regroupent par catégorie ; l'en-tête dit « Tests Généraux » une seule fois.
 *   4. Le signalement admin : « Créer un nouveau jeu de test » en Tests Généraux demande une catégorie.
 *   5. Un signalement admin sans ligne de test (ex. #62) se rattache après coup à un bloc, depuis « Modifier ».
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JeuxTestsAdmin from '../components/JeuxTestsAdmin';
import BoutonSignalementAdmin, { libelleJeu } from '../components/BoutonSignalementAdmin';
import SignalementsAdmin from '../components/SignalementsAdmin';
import * as api from '../lib/api/jeuxTestsApi';
import * as admin from '../lib/api/adminApi';
import { getMatieres, getNiveaux } from '../lib/api/referentielApi';
import {
  CATEGORIES_DE_DEPART, categoriesProposees, regrouperParMatiere, sectionEtClasse,
} from '../lib/jeuxTests';

jest.mock('../lib/api/jeuxTestsApi', () => ({
  getJeuxTests: jest.fn(),
  getJeuTest: jest.fn(),
  getCategoriesTests: jest.fn(),
  creerJeuTest: jest.fn(),
  modifierJeuTest: jest.fn(),
  supprimerJeuTest: jest.fn(),
  ajouterTestAuJeu: jest.fn(),
  modifierTestDuJeu: jest.fn(),
  supprimerTestDuJeu: jest.fn(),
  ajouterLigneDeTest: jest.fn(),
  modifierLigneDeTest: jest.fn(),
  changerStatutLigneDeTest: jest.fn(),
  deplacerLigneDeTest: jest.fn(),
  supprimerLigneDeTest: jest.fn(),
}));

jest.mock('../lib/api/adminApi', () => ({
  creerSignalementAdmin: jest.fn(),
  rattacherSignalementAuJeu: jest.fn(),
  ajouterPieceSignalement: jest.fn(),
  getSignalements: jest.fn(),
  getSignalementsAdmin: jest.fn(),
  creerSignalement: jest.fn(),
  modifierSignalement: jest.fn(),
  supprimerSignalement: jest.fn(),
  getPiecesSignalement: jest.fn(() => Promise.resolve({ data: [] })),
  getCommentairesSignalement: jest.fn(() => Promise.resolve({ data: [] })),
}));

jest.mock('../lib/api/referentielApi', () => ({ getNiveaux: jest.fn(), getMatieres: jest.fn() }));
jest.mock('../lib/hooks/useEvenementsAdmin', () => ({ useEvenementsAdmin: () => {} }));
jest.mock('react-redux', () => ({ useSelector: () => ({}) }));

const NIVEAUX = [
  { id: 1, code: 'CP', libelle: 'CP', cycle: 'Primaire', ordre: 1, groupe: 'École élémentaire', selectionnable: true },
];
const MATIERES = [
  { id: 3, code: 'FRANCAIS', libelle: 'Français', ordre: 1, niveauOrdreMin: 1, niveauOrdreMax: 12 },
];

const JEU_GENERAUX = {
  id: 40,
  titre: 'Compte et abonnements',
  section: 'generaux',
  niveauCode: 'GENERAUX',
  classe: 'Tests Généraux',
  auteur: 'Adam',
  dateCreation: '2026-11-22T09:00:00',
  statut: 'en_cours',
  titres: ['Ajout d’enfant', 'Formule pleine'],
  nombreLignes: 2,
  nombreOk: 0,
  tests: [
    {
      id: 51, jeuId: 40, titre: 'Ajout d’enfant', matiereCode: 'categorie', matiere: 'Compte parent',
      lignes: [{ id: 501, testId: 51, competence: 'Un admin ajoute un 5e enfant', statut: 'ko', dateCreation: '2026-11-22T09:00:00' }],
    },
    {
      id: 52, jeuId: 40, titre: 'Formule pleine', matiereCode: 'categorie', matiere: 'Abonnements',
      lignes: [{ id: 502, testId: 52, competence: 'La formule la plus large ne mène plus aux tarifs', statut: 'a_tester', dateCreation: '2026-11-22T09:00:00' }],
    },
  ],
};

const JEU_CP = {
  id: 7, titre: 'Grille de tests CP', section: 'elementaire', niveauCode: 'CP', classe: 'CP', titres: ['Test Français'],
  tests: [{ id: 21, titre: 'Test Français', matiere: 'Français', matiereCode: 'FRANCAIS', lignes: [] }],
};

beforeEach(() => {
  jest.clearAllMocks();
  getNiveaux.mockResolvedValue({ data: NIVEAUX });
  getMatieres.mockResolvedValue({ data: MATIERES });
  api.getJeuxTests.mockResolvedValue({ data: [JEU_GENERAUX, JEU_CP] });
  api.getJeuTest.mockImplementation((id) => Promise.resolve({ data: id === 40 ? JEU_GENERAUX : JEU_CP }));
  api.getCategoriesTests.mockResolvedValue({ data: ['Compte parent', 'abonnements', 'Paiement'] });
  admin.getPiecesSignalement.mockResolvedValue({ data: [] });
  admin.getCommentairesSignalement.mockResolvedValue({ data: [] });
});

describe('les petites règles', () => {
  test('les catégories proposées : exemples + employées, sans doublon à la casse près, par ordre alphabétique', () => {
    const liste = categoriesProposees(['Compte parent', 'abonnements', 'Paiement']);
    expect(liste).toContain('Paiement');
    expect(liste.filter((c) => c.toLowerCase() === 'abonnements')).toHaveLength(1);
    CATEGORIES_DE_DEPART.forEach((c) => expect(liste.map((x) => x.toLowerCase())).toContain(c.toLowerCase()));
    expect([...liste].sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))).toEqual(liste);
  });

  test('les blocs se regroupent par catégorie (même code « categorie » pour toutes)', () => {
    const groupes = regrouperParMatiere([
      { id: 1, matiereCode: 'categorie', matiere: 'UX' },
      { id: 2, matiereCode: 'categorie', matiere: 'Admin' },
      { id: 3, matiereCode: 'categorie', matiere: 'ux' },
    ]);
    expect(groupes.map((g) => g.matiere)).toEqual(['Admin', 'UX']);
    expect(groupes[1].tests.map((t) => t.id)).toEqual([1, 3]);
  });

  test('« Tests Généraux » ne se répète pas', () => {
    expect(sectionEtClasse(JEU_GENERAUX)).toBe('Tests Généraux');
    expect(sectionEtClasse(JEU_CP)).toBe('Élémentaire · CP');
    expect(libelleJeu(JEU_GENERAUX)).toBe('Compte et abonnements — Tests Généraux');
    expect(libelleJeu(JEU_CP)).toBe('Grille de tests CP — Élémentaire CP');
  });
});

describe('créer un jeu de tests généraux', () => {
  test('la section « Tests Généraux » n’a qu’une classe, « Tests Généraux », et le jeu part sans classe du référentiel', async () => {
    api.creerJeuTest.mockResolvedValue({ data: { ...JEU_GENERAUX, id: 41, tests: [] } });
    render(<JeuxTestsAdmin />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ajouter un nouveau jeu de test' }));
    const section = screen.getByLabelText('Section');
    expect(within(section).getByRole('option', { name: 'Tests Généraux' })).toBeInTheDocument();

    await userEvent.selectOptions(section, 'generaux');
    const classe = screen.getByLabelText('Classe');
    expect(classe).toBeEnabled();
    expect(within(classe).getAllByRole('option').map((o) => o.textContent)).toEqual(['Tests Généraux']);
    expect(classe).toHaveDisplayValue('Tests Généraux');

    await userEvent.type(screen.getByLabelText('Titre'), '  Compte et abonnements ');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le jeu de test' }));

    expect(api.creerJeuTest).toHaveBeenCalledWith(0, 'Compte et abonnements', 'generaux');
  });

  test('la liste générale montre « Tests Généraux » en section et en classe', async () => {
    render(<JeuxTestsAdmin />);
    const lignes = within(await screen.findByRole('table')).getAllByRole('row');
    const premiere = within(lignes[1]);
    expect(premiere.getAllByText('Tests Généraux')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Ouvrir le jeu de test Tests Généraux' })).toBeInTheDocument();
  });
});

describe('un bloc des tests généraux', () => {
  const ouvrir = async () => {
    render(<JeuxTestsAdmin />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ouvrir le jeu de test Tests Généraux' }));
    await screen.findByRole('heading', { name: 'Formule pleine' });
  };

  test('l’en-tête dit « Tests Généraux » une fois, et les blocs sont rangés par catégorie', async () => {
    await ouvrir();
    expect(screen.getByText(/^Tests Généraux · Adam/)).toBeInTheDocument();
    const groupes = screen.getAllByRole('heading', { level: 3 }).filter((h) => h.className.includes('groupe-titre'));
    expect(groupes.map((h) => h.textContent.replace(/\d+ tests?$/, ''))).toEqual(['Abonnements', 'Compte parent']);
  });

  test('« Ajouter un test » propose une CATÉGORIE (pas de matière), et une catégorie choisie dans la liste part au serveur', async () => {
    api.ajouterTestAuJeu.mockResolvedValue({ data: JEU_GENERAUX });
    await ouvrir();

    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un test' }));
    expect(screen.queryByLabelText('Matière')).not.toBeInTheDocument();

    const categorie = await screen.findByLabelText('Catégorie');
    await waitFor(() => expect(within(categorie).getByRole('option', { name: 'Paiement' })).toBeInTheDocument());
    const options = within(categorie).getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(expect.arrayContaining(['UX', 'Admin', 'Technique', 'Compte parent', '+ Nouvelle catégorie…']));
    expect(options.filter((o) => o.toLowerCase() === 'abonnements')).toHaveLength(1);
    expect(options).not.toContain('Français');

    await userEvent.type(screen.getByLabelText('Titre'), 'Paiement refusé');
    await userEvent.selectOptions(categorie, 'Paiement');
    await userEvent.click(screen.getByRole('button', { name: 'Créer 1 ligne' }));

    await waitFor(() => expect(api.ajouterTestAuJeu).toHaveBeenCalledWith(40, {
      titre: 'Paiement refusé', categorie: 'Paiement', nombre: 1, competences: [''],
    }));
    // La liste des catégories est relue : la nouvelle y sera.
    await waitFor(() => expect(api.getCategoriesTests).toHaveBeenCalledTimes(2));
  });

  test('« + Nouvelle catégorie… » ouvre une saisie libre, et « Choisir dans la liste » y revient', async () => {
    api.ajouterTestAuJeu.mockResolvedValue({ data: JEU_GENERAUX });
    await ouvrir();
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un test' }));

    await userEvent.selectOptions(await screen.findByLabelText('Catégorie'), '+ Nouvelle catégorie…');
    const libre = screen.getByLabelText('Catégorie');
    expect(libre.tagName).toBe('INPUT');
    expect(libre).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Choisir dans la liste' }));
    expect(screen.getByLabelText('Catégorie').tagName).toBe('SELECT');

    await userEvent.selectOptions(screen.getByLabelText('Catégorie'), '+ Nouvelle catégorie…');
    await userEvent.type(screen.getByLabelText('Catégorie'), 'Connexion');
    await userEvent.type(screen.getByLabelText('Titre'), 'Mot de passe oublié');
    await userEvent.click(screen.getByRole('button', { name: 'Créer 1 ligne' }));

    await waitFor(() => expect(api.ajouterTestAuJeu).toHaveBeenCalledWith(40, {
      titre: 'Mot de passe oublié', categorie: 'Connexion', nombre: 1, competences: [''],
    }));
  });

  test('sans catégorie, rien ne part et le formulaire le dit', async () => {
    await ouvrir();
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un test' }));
    await userEvent.type(screen.getByLabelText('Titre'), 'Sans catégorie');

    // Le champ est obligatoire : on contourne la validation du navigateur pour voir le message de l'écran.
    screen.getByLabelText('Catégorie').removeAttribute('required');
    await userEvent.click(screen.getByRole('button', { name: 'Créer 1 ligne' }));

    expect(await screen.findByText('Choisis une catégorie, ou écris-en une nouvelle.')).toBeInTheDocument();
    expect(api.ajouterTestAuJeu).not.toHaveBeenCalled();
  });

  test('modifier un bloc garde sa catégorie, et l’envoie à la place de la matière', async () => {
    api.modifierTestDuJeu.mockResolvedValue({ data: JEU_GENERAUX });
    await ouvrir();

    await userEvent.click(screen.getByRole('button', { name: 'Modifier le test Formule pleine' }));
    expect(screen.getByLabelText('Catégorie')).toHaveDisplayValue('Abonnements');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(api.modifierTestDuJeu).toHaveBeenCalledWith(40, 52, { titre: 'Formule pleine', categorie: 'Abonnements' }));
  });
});

describe('le signalement admin', () => {
  test('« Créer un nouveau jeu de test » en Tests Généraux : le bloc demande une catégorie', async () => {
    api.creerJeuTest.mockResolvedValue({ data: { ...JEU_GENERAUX, id: 42, titre: 'Bugs hors cours', tests: [] } });
    api.ajouterTestAuJeu.mockResolvedValue({
      data: { ...JEU_GENERAUX, id: 42, tests: [{ id: 60, titre: 'Ajout d’enfant', matiereCode: 'categorie', matiere: 'Compte parent', lignes: [] }] },
    });

    render(<BoutonSignalementAdmin />);
    await userEvent.click(screen.getByRole('button', { name: 'Signalement admin' }));
    await userEvent.click(screen.getByRole('button', { name: 'Créer un nouveau jeu de test' }));

    const fenetre = screen.getByRole('dialog', { name: 'Nouveau jeu de test' });
    await userEvent.type(within(fenetre).getByLabelText('Titre'), 'Bugs hors cours');
    await userEvent.selectOptions(within(fenetre).getByLabelText('Section'), 'generaux');
    await userEvent.click(within(fenetre).getByRole('button', { name: 'Créer le jeu de test' }));
    expect(api.creerJeuTest).toHaveBeenCalledWith(0, 'Bugs hors cours', 'generaux');

    expect(await within(fenetre).findByText(/son titre et sa catégorie/)).toBeInTheDocument();
    expect(within(fenetre).queryByLabelText('Matière')).not.toBeInTheDocument();
    await userEvent.type(within(fenetre).getByLabelText('Titre'), 'Ajout d’enfant');
    const creer = within(fenetre).getByRole('button', { name: 'Créer le test' });
    expect(creer).toBeDisabled();

    await waitFor(() => expect(within(fenetre).getByRole('option', { name: 'Compte parent' })).toBeInTheDocument());
    await userEvent.selectOptions(within(fenetre).getByLabelText('Catégorie'), 'Compte parent');
    await userEvent.click(creer);

    expect(api.ajouterTestAuJeu).toHaveBeenCalledWith(42, {
      titre: 'Ajout d’enfant', categorie: 'Compte parent', nombre: 1, competences: [''],
    });
  });

  test('un signalement admin sans ligne de test se rattache à un bloc depuis « Modifier » (ex. #62)', async () => {
    admin.getSignalementsAdmin.mockResolvedValue({
      data: [{
        id: 62, estAdmin: true, parentMail: 'ceo@mimia.fr', categorie: 'AUTRE', description: 'La formule la plus large mène aux tarifs',
        etat: 'en_cours', dateCreation: '2026-11-22T07:00:00', nombrePieces: 0, nombreCommentaires: 0, ligneDeTestId: null, competence: null, test: null,
      }],
    });
    admin.modifierSignalement.mockResolvedValue({ data: {} });
    admin.rattacherSignalementAuJeu.mockResolvedValue({ data: {} });

    render(<SignalementsAdmin admin />);
    await userEvent.click(await screen.findByRole('button', { name: 'Modifier' }));

    const groupe = screen.getByRole('group', { name: 'Rattacher à un jeu de test' });
    expect(within(groupe).getByText(/n’est relié à aucun jeu de test/)).toBeInTheDocument();

    const jeu = within(groupe).getByLabelText('Jeu de test');
    await waitFor(() => expect(within(jeu).getByRole('option', { name: 'Compte et abonnements — Tests Généraux' })).toBeInTheDocument());
    await userEvent.selectOptions(jeu, '40');

    const bloc = await within(groupe).findByLabelText('Bloc');
    await waitFor(() => expect(within(bloc).getByRole('option', { name: 'Formule pleine · Abonnements' })).toBeInTheDocument());
    await userEvent.selectOptions(bloc, '52');

    // Sans compétence : l'écran le dit, rien ne part.
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByText(/Remplis « Compétence \/ test à réaliser »/)).toBeInTheDocument();
    expect(admin.modifierSignalement).not.toHaveBeenCalled();

    await userEvent.type(within(groupe).getByLabelText('Compétence / test à réaliser'), 'La formule pleine ne mène plus aux tarifs');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(admin.rattacherSignalementAuJeu).toHaveBeenCalledWith(62, {
      jeuId: 40, testId: 52, competence: 'La formule pleine ne mène plus aux tarifs',
    }));
    expect(admin.modifierSignalement).toHaveBeenCalledWith(62, expect.objectContaining({
      competence: 'La formule pleine ne mène plus aux tarifs', etat: 'en_cours',
    }));
  });

  test('un signalement déjà relié à une ligne existante ne propose pas de rattachement', async () => {
    admin.getSignalementsAdmin.mockResolvedValue({
      data: [{
        id: 1, estAdmin: true, parentMail: 'ceo@mimia.fr', categorie: 'TECHNIQUE', description: 'La syllabe change',
        etat: 'nouveau', dateCreation: '2026-11-05T20:00:00', nombrePieces: 0, nombreCommentaires: 0, ligneDeTestId: 300,
        competence: 'Rester sur les syllabes',
        test: { ligneId: 300, jeuTitre: 'Grille de tests CP', classe: 'CP', testTitre: 'Test Français', competence: 'Rester sur les syllabes', statut: 'ko' },
      }],
    });
    render(<SignalementsAdmin admin />);
    await userEvent.click(await screen.findByRole('button', { name: 'Modifier' }));

    expect(screen.queryByRole('group', { name: 'Rattacher à un jeu de test' })).not.toBeInTheDocument();
    expect(api.getJeuxTests).not.toHaveBeenCalled();
  });
});
