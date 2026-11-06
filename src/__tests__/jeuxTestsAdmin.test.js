/**
 * L'ONGLET « JEUX DE TESTS » — Camara, le 04/11/2026.
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. La liste générale : section, classe, titres, auteur, statut coloré.
 *   2. La section filtre les classes, et un jeu neuf s'ouvre sur son premier test.
 *   3. Le nombre de tests donne autant de lignes, 1 par défaut.
 *   4. Sur une ligne : le statut change depuis la liste, et le statut du jeu suit.
 *   5. L'œil montre le test, le crayon le modifie (date au calendrier), la corbeille confirme.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JeuxTestsAdmin, { matieresDeLaClasse, nomDuJeu } from '../components/JeuxTestsAdmin';
import * as api from '../lib/api/jeuxTestsApi';
import { getMatieres, getNiveaux } from '../lib/api/referentielApi';

jest.mock('../lib/api/jeuxTestsApi', () => ({
  getJeuxTests: jest.fn(),
  getJeuTest: jest.fn(),
  creerJeuTest: jest.fn(),
  modifierJeuTest: jest.fn(),
  supprimerJeuTest: jest.fn(),
  ajouterTestAuJeu: jest.fn(),
  modifierTestDuJeu: jest.fn(),
  supprimerTestDuJeu: jest.fn(),
  ajouterLigneDeTest: jest.fn(),
  modifierLigneDeTest: jest.fn(),
  changerStatutLigneDeTest: jest.fn(),
  supprimerLigneDeTest: jest.fn(),
}));

jest.mock('../lib/api/referentielApi', () => ({
  getNiveaux: jest.fn(),
  getMatieres: jest.fn(),
}));

// La bibliothèque dessine sur un canvas, absent ici : on regarde ce qu'on lui donne.
const mockPdf = { options: null, texte: null, echec: false };
jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: () => {
    const chaine = {
      set: (options) => { mockPdf.options = options; return chaine; },
      from: (page) => { mockPdf.texte = page.textContent; mockPdf.html = page.innerHTML; return chaine; },
      save: () => (mockPdf.echec ? Promise.reject(new Error('canvas')) : Promise.resolve()),
    };
    return chaine;
  },
}));

const NIVEAUX = [
  { id: 4, code: 'CM1', libelle: 'CM1', cycle: 'Primaire', ordre: 4, groupe: 'École élémentaire', selectionnable: true },
  { id: 9, code: 'TROISIEME', libelle: '3e', cycle: 'College', ordre: 9, groupe: 'Collège', selectionnable: true },
  { id: 12, code: 'TERMINALE', libelle: 'Terminale', cycle: 'Lycee', ordre: 12, groupe: 'Lycée général', selectionnable: true },
  { id: 77, code: 'PREMIERE_TECHNO', libelle: 'Tronc commun', cycle: 'Lycee', ordre: 11, groupe: 'Lycée techno', selectionnable: false },
];

const MATIERES = [
  { id: 1, code: 'FRANCAIS', libelle: 'Français', ordre: 1, niveauOrdreMin: 1, niveauOrdreMax: 12 },
  { id: 2, code: 'PHILO', libelle: 'Philosophie', ordre: 2, niveauOrdreMin: 12, niveauOrdreMax: 12 },
];

const ligne = (id, statut = 'a_tester', plus = {}) => ({
  id,
  testId: 5,
  competence: `Compétence ${id}`,
  statut,
  dateCreation: '2026-11-04T10:00:00',
  dateEffectuee: null,
  commentaire: null,
  ...plus,
});

const jeuOuvert = (lignes, statut = 'non_demarre') => ({
  id: 1,
  section: 'elementaire',
  niveauCode: 'CM1',
  classe: 'CM1',
  auteur: 'Camara Minamba',
  dateCreation: '2026-11-04T10:00:00',
  statut,
  titres: ['Les fractions'],
  nombreLignes: lignes.length,
  nombreOk: lignes.filter((l) => l.statut === 'ok').length,
  tests: [{
    id: 5, jeuId: 1, titre: 'Les fractions', matiereCode: 'FRANCAIS', matiere: 'Français', lignes,
  }],
});

const LISTE = [
  {
    id: 1, section: 'elementaire', classe: 'CM1', auteur: 'Camara Minamba', dateCreation: '2026-11-04T10:00:00', statut: 'non_demarre', titres: ['Les fractions', 'La dictée'], nombreLignes: 2, nombreOk: 0, tests: [],
  },
  {
    id: 2, section: 'college', classe: '3e', auteur: 'admin@mimia.fr', statut: 'en_cours', titres: ['Thalès'], nombreLignes: 2, nombreOk: 1, tests: [],
  },
  {
    id: 3, section: 'lycee', classe: 'Terminale', auteur: 'Camara Minamba', statut: 'ok', titres: ['Dissertation'], nombreLignes: 1, nombreOk: 1, tests: [],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  getNiveaux.mockResolvedValue({ data: NIVEAUX });
  getMatieres.mockResolvedValue({ data: MATIERES });
  api.getJeuxTests.mockResolvedValue({ data: LISTE });
});

/** Ouvre le jeu ; les blocs sont repliés par défaut (05/11/2026), donc on déplie le premier sauf demande contraire. */
const ouvrirLePremierJeu = async (jeu, { deplier = true } = {}) => {
  api.getJeuTest.mockResolvedValue({ data: jeu });
  render(<JeuxTestsAdmin />);
  await userEvent.click(await screen.findByRole('button', { name: 'Ouvrir le jeu de test Élémentaire CM1' }));
  await screen.findByRole('heading', { name: 'Les fractions' });
  const bouton = screen.queryByRole('button', { name: 'Déplier le test Les fractions' });
  if (deplier && bouton) await userEvent.click(bouton);
};

describe('la liste générale', () => {
  test('montre la section, la classe, les titres, l’auteur, la date de création et le statut de chaque jeu', async () => {
    render(<JeuxTestsAdmin />);

    const lignes = within(await screen.findByRole('table')).getAllByRole('row');
    expect(lignes).toHaveLength(4);

    const premiere = within(lignes[1]);
    expect(premiere.getByText('Élémentaire')).toBeInTheDocument();
    expect(premiere.getByText('CM1')).toBeInTheDocument();
    expect(premiere.getByText('Les fractions · La dictée')).toBeInTheDocument();
    expect(premiere.getByText('Camara Minamba')).toBeInTheDocument();
    expect(premiere.getByText('04/11/2026')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Créé le' })).toBeInTheDocument();
  });

  test('non démarré en gris, en cours en orange, OK en vert', async () => {
    render(<JeuxTestsAdmin />);

    expect(await screen.findByText('Non démarré')).toHaveClass('jeux-tests__badge--non_demarre');
    expect(screen.getByText('En cours')).toHaveClass('jeux-tests__badge--en_cours');
    expect(screen.getByText('OK')).toHaveClass('jeux-tests__badge--ok');
  });

  test('supprimer un jeu demande de confirmer', async () => {
    api.supprimerJeuTest.mockResolvedValue({});
    render(<JeuxTestsAdmin />);

    await userEvent.click(await screen.findByRole('button', { name: 'Supprimer le jeu de test Collège 3e' }));
    expect(api.supprimerJeuTest).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(api.supprimerJeuTest).toHaveBeenCalledWith(2);
    await waitFor(() => expect(screen.queryByText('Thalès')).not.toBeInTheDocument());
  });
});

describe('créer un jeu de test', () => {
  test('le formulaire a un bouton de retour, et « Annuler » revient aussi à la liste', async () => {
    render(<JeuxTestsAdmin />);

    await userEvent.click(await screen.findByRole('button', { name: 'Ajouter un nouveau jeu de test' }));
    await userEvent.click(screen.getByRole('button', { name: '← Tous les jeux de test' }));
    expect(await screen.findByRole('table')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un nouveau jeu de test' }));
    const annuler = screen.getByRole('button', { name: 'Annuler' });
    expect(annuler).toHaveClass('jeux-tests__bouton--annuler');

    await userEvent.click(annuler);
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(api.creerJeuTest).not.toHaveBeenCalled();
  });

  test('la section filtre les classes, sans tronc commun, et le jeu neuf s’ouvre sur son premier test', async () => {
    api.creerJeuTest.mockResolvedValue({ data: { id: 8 } });
    api.getJeuTest.mockResolvedValue({
      data: {
        id: 8, section: 'college', niveauCode: 'TROISIEME', classe: '3e', auteur: 'Camara', dateCreation: '2026-11-04T10:00:00', statut: 'non_demarre', nombreLignes: 0, nombreOk: 0, titres: [], tests: [],
      },
    });

    render(<JeuxTestsAdmin />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ajouter un nouveau jeu de test' }));

    const classe = screen.getByLabelText('Classe');
    expect(classe).toBeDisabled();

    await userEvent.selectOptions(screen.getByLabelText('Section'), 'lycee');
    expect(within(classe).queryByRole('option', { name: 'Tronc commun' })).not.toBeInTheDocument();
    expect(within(classe).getByRole('option', { name: 'Terminale' })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Section'), 'college');
    expect(within(classe).queryByRole('option', { name: 'Terminale' })).not.toBeInTheDocument();

    await userEvent.selectOptions(classe, '9');
    expect(screen.getByRole('button', { name: 'Créer le jeu de test' })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Titre'), '  Grille de tests 3e  ');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le jeu de test' }));

    expect(api.creerJeuTest).toHaveBeenCalledWith(9, 'Grille de tests 3e');
    expect(await screen.findByRole('heading', { name: 'Nouveau test' })).toBeInTheDocument();
  });
});

describe('le titre du jeu', () => {
  test('la liste montre le titre du jeu, et les titres des tests pour un jeu d’avant le champ', () => {
    expect(nomDuJeu({ titre: ' Grille de tests CP ', titres: ['Test Math'] })).toBe('Grille de tests CP');
    expect(nomDuJeu({ titre: '', titres: ['Test Math', 'Lecture'] })).toBe('Test Math · Lecture');
    expect(nomDuJeu({ titres: [] })).toBe('');
  });

  test('la modification montre le titre actuel et l’enregistre avec la classe', async () => {
    api.getJeuxTests.mockResolvedValue({
      data: [{ ...LISTE[0], niveauCode: 'CM1', titre: 'Grille CM1' }],
    });
    api.modifierJeuTest.mockResolvedValue({ data: { ...LISTE[0], niveauCode: 'CM1', titre: 'Grille CM1 v2' } });

    render(<JeuxTestsAdmin />);
    expect(await screen.findByText('Grille CM1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /^Modifier le jeu de test/ }));
    const titre = screen.getByLabelText('Titre');
    expect(titre).toHaveValue('Grille CM1');

    await userEvent.clear(titre);
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDisabled();
    await userEvent.type(titre, 'Grille CM1 v2');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(api.modifierJeuTest).toHaveBeenCalledWith(1, 4, 'Grille CM1 v2');
  });
});

describe('replier un bloc de test', () => {
  test('replié à l’ouverture : le titre et le nombre de lignes ; « Déplier » montre les lignes, « Replier » les cache', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10), ligne(11)]), { deplier: false });

    expect(screen.queryByText('Compétence 10')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Les fractions' })).toBeInTheDocument();
    expect(screen.getByText('2 lignes')).toBeInTheDocument();

    const deplier = screen.getByRole('button', { name: 'Déplier le test Les fractions' });
    expect(deplier).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(deplier);
    expect(screen.getByText('Compétence 11')).toBeInTheDocument();

    const replier = screen.getByRole('button', { name: 'Replier le test Les fractions' });
    expect(replier).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(replier);
    expect(screen.queryByText('Compétence 10')).not.toBeInTheDocument();
  });

  test('ajouter une ligne à un bloc replié le déplie : la nouvelle ligne se voit', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]), { deplier: false });
    api.ajouterLigneDeTest.mockResolvedValue({ data: jeuOuvert([ligne(10), ligne(12)]) });

    await userEvent.click(screen.getByRole('button', { name: /Ajouter une ligne/ }));

    expect(await screen.findByText('Compétence 12')).toBeInTheDocument();
  });
});

describe('ajouter un test', () => {
  const ouvrirLAjout = async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));
    await userEvent.click(screen.getByRole('button', { name: 'Ajouter un test' }));
  };

  test('par défaut une ligne ; avec 5 il y en a 5, et ce qui est écrit part avec elles', async () => {
    api.ajouterTestAuJeu.mockResolvedValue({ data: jeuOuvert([ligne(10)]) });
    await ouvrirLAjout();

    expect(screen.getByLabelText('Nombre de tests à faire')).toHaveValue(1);
    expect(screen.getAllByPlaceholderText('Compétence / test à réaliser')).toHaveLength(1);

    await userEvent.type(screen.getByLabelText('Titre'), ' Lecture ');
    await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');

    const nombre = screen.getByLabelText('Nombre de tests à faire');
    await userEvent.clear(nombre);
    await userEvent.type(nombre, '5');
    expect(screen.getAllByPlaceholderText('Compétence / test à réaliser')).toHaveLength(5);

    await userEvent.type(screen.getByLabelText('Compétence / test à réaliser 1'), 'Lire une syllabe');
    await userEvent.click(screen.getByRole('button', { name: 'Créer 5 lignes' }));

    await waitFor(() => expect(api.ajouterTestAuJeu).toHaveBeenCalledWith(1, {
      titre: 'Lecture',
      matiereId: 1,
      nombre: 5,
      competences: ['Lire une syllabe', '', '', '', ''],
    }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Nouveau test' })).not.toBeInTheDocument());
  });

  test('un nombre hors bornes ne part pas', async () => {
    await ouvrirLAjout();

    await userEvent.type(screen.getByLabelText('Titre'), 'Lecture');
    await userEvent.selectOptions(screen.getByLabelText('Matière'), '1');

    const nombre = screen.getByLabelText('Nombre de tests à faire');
    await userEvent.clear(nombre);
    await userEvent.type(nombre, '51');

    expect(screen.queryByPlaceholderText('Compétence / test à réaliser')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Créer' }));
    expect(api.ajouterTestAuJeu).not.toHaveBeenCalled();
  });

  test('ne propose que les matières au programme de la classe', async () => {
    await ouvrirLAjout();

    const matiere = screen.getByLabelText('Matière');
    expect(within(matiere).getByRole('option', { name: 'Français' })).toBeInTheDocument();
    expect(within(matiere).queryByRole('option', { name: 'Philosophie' })).not.toBeInTheDocument();
  });

  test('une matière déjà choisie reste proposée même hors de la classe', () => {
    const cm1 = NIVEAUX[0];

    expect(matieresDeLaClasse(MATIERES, cm1).map((m) => m.code)).toEqual(['FRANCAIS']);
    expect(matieresDeLaClasse(MATIERES, cm1, 'PHILO').map((m) => m.code)).toEqual(['FRANCAIS', 'PHILO']);
  });
});

describe('l’export en PDF', () => {
  beforeEach(() => {
    mockPdf.options = null;
    mockPdf.texte = null;
    mockPdf.html = null;
    mockPdf.echec = false;
  });

  test('le PDF porte le jeu, ses tests et toutes leurs lignes, et un nom lisible', async () => {
    await ouvrirLePremierJeu(jeuOuvert([
      ligne(10, 'ko', { dateEffectuee: '2026-11-03T00:00:00', commentaire: 'Le bouton ne répond pas' }),
      ligne(11, 'a_tester', { competence: '' }),
    ], 'en_cours'));

    await userEvent.click(screen.getByRole('button', { name: 'Exporter en PDF' }));

    await waitFor(() => expect(mockPdf.texte).not.toBeNull());
    expect(mockPdf.texte).toContain('Élémentaire · CM1');
    expect(mockPdf.texte).toContain('En cours');
    expect(mockPdf.texte).toContain('Camara Minamba');
    expect(mockPdf.texte).toContain('Les fractions');
    expect(mockPdf.texte).toContain('Français');
    expect(mockPdf.texte).toContain('Compétence 10');
    expect(mockPdf.texte).toContain('KO');
    expect(mockPdf.texte).toContain('03/11/2026');
    expect(mockPdf.texte).toContain('Le bouton ne répond pas');
    expect(mockPdf.texte).toContain('À renseigner');

    expect(mockPdf.options.filename).toMatch(/^Mimia--Elementaire-CM1_\d{4}-\d{2}-\d{2}_Jeu-de-test\.pdf$/);
    expect(mockPdf.options.jsPDF.orientation).toBe('landscape');
    expect(mockPdf.options.pagebreak.avoid).toContain('.jeu-pdf__ligne');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Exporter en PDF' })).toBeEnabled());
  });

  test('un texte saisi reste du texte dans le PDF, jamais du HTML', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10, 'a_tester', { commentaire: '<img src=x onerror=alert(1)>' })]));

    await userEvent.click(screen.getByRole('button', { name: 'Exporter en PDF' }));

    await waitFor(() => expect(mockPdf.html).not.toBeNull());
    expect(mockPdf.html).toContain('&lt;img src=x');
    expect(mockPdf.html).not.toContain('<img src=x');
  });

  test('un échec le dit, et le bouton revient', async () => {
    mockPdf.echec = true;
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));

    await userEvent.click(screen.getByRole('button', { name: 'Exporter en PDF' }));

    expect(await screen.findByText(/Le PDF n'a pas pu être créé/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exporter en PDF' })).toBeEnabled();
  });

  test('depuis la liste : le jeu complet est relu, sans ouvrir sa fiche', async () => {
    api.getJeuTest.mockResolvedValue({ data: jeuOuvert([ligne(10)]) });
    render(<JeuxTestsAdmin />);

    await userEvent.click(await screen.findByRole('button', { name: 'Exporter en PDF le jeu de test Collège 3e' }));

    expect(api.getJeuTest).toHaveBeenCalledWith(2);
    await waitFor(() => expect(mockPdf.texte).not.toBeNull());
    expect(mockPdf.texte).toContain('Compétence 10');
    expect(screen.getByRole('heading', { name: 'Jeux de tests' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Exporter en PDF le jeu de test Collège 3e' })).toBeEnabled());
  });

  test('depuis la liste : un échec le dit, et un jeu sans test n’a pas de bouton actif', async () => {
    api.getJeuxTests.mockResolvedValue({
      data: [...LISTE, {
        id: 4, section: 'lycee', classe: '2de', auteur: 'Camara', statut: 'non_demarre', titres: [], nombreLignes: 0, nombreOk: 0, tests: [],
      }],
    });
    api.getJeuTest.mockRejectedValue(new Error('réseau'));
    render(<JeuxTestsAdmin />);

    expect(await screen.findByRole('button', { name: 'Exporter en PDF le jeu de test Lycée 2de' })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Exporter en PDF le jeu de test Collège 3e' }));

    expect(await screen.findByText(/Le PDF n'a pas pu être créé/)).toBeInTheDocument();
    expect(mockPdf.texte).toBeNull();
  });

  test('un jeu sans test n’a rien à exporter', async () => {
    api.getJeuTest.mockResolvedValue({ data: { ...jeuOuvert([]), tests: [] } });
    render(<JeuxTestsAdmin />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ouvrir le jeu de test Élémentaire CM1' }));

    expect(await screen.findByRole('button', { name: 'Exporter en PDF' })).toBeDisabled();
  });
});

describe('les lignes d’un test', () => {
  test('le statut se change depuis la liste, et le statut du jeu suit', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10), ligne(11)]));
    expect(screen.getByText('Non démarré')).toBeInTheDocument();

    const choix = screen.getByRole('combobox', { name: 'Statut de Compétence 10' });
    expect(within(choix).getAllByRole('option').map((o) => o.textContent))
      .toEqual(['À tester', 'En cours de test', 'OK', 'KO']);
    expect(choix).toHaveValue('a_tester');

    api.changerStatutLigneDeTest.mockResolvedValue({
      data: jeuOuvert([ligne(10, 'ko'), ligne(11)], 'en_cours'),
    });
    await userEvent.selectOptions(choix, 'ko');

    expect(api.changerStatutLigneDeTest).toHaveBeenCalledWith(1, 10, 'ko');
    expect(await screen.findByText('En cours')).toHaveClass('jeux-tests__badge--en_cours');
    expect(screen.getByRole('combobox', { name: 'Statut de Compétence 10' })).toHaveClass('jeux-tests__statut--ko');
  });

  test('un statut refusé revient de lui-même et le motif s’affiche', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));
    api.changerStatutLigneDeTest.mockRejectedValue({ response: { data: { message: 'Cette ligne n’existe plus.' } } });

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Statut de Compétence 10' }), 'ok');

    expect(await screen.findByText('Cette ligne n’existe plus.')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Statut de Compétence 10' })).toHaveValue('a_tester');
  });

  test('l’œil montre le test, avec la date telle qu’elle a été choisie', async () => {
    await ouvrirLePremierJeu(jeuOuvert([
      ligne(10, 'ko', { dateEffectuee: '2026-11-03T00:00:00', commentaire: 'Le bouton ne répond pas' }),
    ], 'en_cours'));

    await userEvent.click(screen.getByRole('button', { name: 'Aperçu de Compétence 10' }));

    const fenetre = within(screen.getByRole('dialog'));
    expect(fenetre.getByRole('heading', { name: 'Les fractions' })).toBeInTheDocument();
    expect(fenetre.getByText('Élémentaire · CM1')).toBeInTheDocument();
    expect(fenetre.getByText('Compétence 10')).toBeInTheDocument();
    expect(fenetre.getByText('KO')).toHaveClass('jeux-tests__puce--ko');
    expect(fenetre.getByText('03/11/2026')).toBeInTheDocument();
    expect(fenetre.getByText('Le bouton ne répond pas')).toBeInTheDocument();
    expect(api.modifierLigneDeTest).not.toHaveBeenCalled();

    await userEvent.click(fenetre.getByRole('button', { name: 'Fermer' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('le crayon modifie la ligne : compétence, statut, date au calendrier, commentaire', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));
    api.modifierLigneDeTest.mockResolvedValue({ data: jeuOuvert([ligne(10, 'ok')]) });

    await userEvent.click(screen.getByRole('button', { name: 'Modifier Compétence 10' }));

    const date = screen.getByLabelText('Date du test effectué');
    expect(date).toHaveAttribute('type', 'date');

    await userEvent.clear(screen.getByLabelText('Compétence / test à réaliser'));
    await userEvent.type(screen.getByLabelText('Compétence / test à réaliser'), ' Comparer ');
    await userEvent.selectOptions(screen.getByLabelText('Statut'), 'ok');
    await userEvent.type(date, '2026-11-04');
    await userEvent.type(screen.getByLabelText('Commentaire'), 'RAS');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(api.modifierLigneDeTest).toHaveBeenCalledWith(1, 10, {
      competence: 'Comparer',
      statut: 'ok',
      dateEffectuee: '2026-11-04',
      commentaire: 'RAS',
    }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  test('une date et un commentaire vides partent à null', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10, 'ok', { dateEffectuee: '2026-11-04T00:00:00', commentaire: 'x' })]));
    api.modifierLigneDeTest.mockResolvedValue({ data: jeuOuvert([ligne(10)]) });

    await userEvent.click(screen.getByRole('button', { name: 'Modifier Compétence 10' }));
    await userEvent.clear(screen.getByLabelText('Date du test effectué'));
    await userEvent.clear(screen.getByLabelText('Commentaire'));
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(api.modifierLigneDeTest).toHaveBeenCalledWith(1, 10, expect.objectContaining({
      dateEffectuee: null,
      commentaire: null,
    })));
  });

  test('la corbeille confirme avant de supprimer', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10), ligne(11)]));
    api.supprimerLigneDeTest.mockResolvedValue({ data: jeuOuvert([ligne(11)]) });

    await userEvent.click(screen.getByRole('button', { name: 'Supprimer Compétence 10' }));
    expect(api.supprimerLigneDeTest).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    expect(api.supprimerLigneDeTest).toHaveBeenCalledWith(1, 10);
    await waitFor(() => expect(screen.queryByText('Compétence 10')).not.toBeInTheDocument());
  });

  test('une compétence vide se lit « À renseigner » et garde ses boutons', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10, 'a_tester', { competence: '' })]));

    expect(screen.getByText('À renseigner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modifier ligne 1' })).toBeInTheDocument();
  });

  test('le titre et la matière d’un test se modifient, sans toucher au nombre de lignes', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));
    api.modifierTestDuJeu.mockResolvedValue({ data: jeuOuvert([ligne(10)]) });

    await userEvent.click(screen.getByRole('button', { name: 'Modifier le test Les fractions' }));

    expect(screen.queryByLabelText('Nombre de tests à faire')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Matière')).toHaveValue('1');

    const titre = screen.getByLabelText('Titre');
    await userEvent.clear(titre);
    await userEvent.type(titre, 'Fractions');
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => expect(api.modifierTestDuJeu).toHaveBeenCalledWith(1, 5, { titre: 'Fractions', matiereId: 1 }));
  });

  test('« Ajouter une ligne » ajoute une ligne au test', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));
    api.ajouterLigneDeTest.mockResolvedValue({ data: jeuOuvert([ligne(10), ligne(11)]) });

    await userEvent.click(screen.getByRole('button', { name: 'Ajouter une ligne' }));

    expect(api.ajouterLigneDeTest).toHaveBeenCalledWith(1, 5);
    expect(await screen.findByText('Compétence 11')).toBeInTheDocument();
  });

  test('le retour recharge la liste : le statut y est à jour', async () => {
    await ouvrirLePremierJeu(jeuOuvert([ligne(10)]));
    expect(api.getJeuxTests).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: '← Tous les jeux de test' }));

    await waitFor(() => expect(api.getJeuxTests).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('heading', { name: 'Jeux de tests' })).toBeInTheDocument();
  });
});
