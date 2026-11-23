/**
 * ÉMOTICÔNES ET TEXTES AÉRÉS DANS LES JEUX DE TESTS — Min's, le 23/11/2026.
 *
 * Adam réécrit les tests avec des émoticônes et un point par ligne (lignes vides comprises).
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. La cellule « Compétence / test à réaliser » du tableau garde ses retours à la ligne (`white-space: pre-wrap`,
 *      avec deux classes pour passer devant le `white-space: normal` des cartes sur téléphone).
 *   2. Le texte arrive dans la cellule tel que l'API l'a rendu : émoticônes composées et lignes vides, sans <br> ni
 *      texte recollé.
 *   3. « Modifier » → « Enregistrer » envoie le texte tapé à l'identique, avec le statut inchangé (le serveur ne
 *      redate plus la ligne dans ce cas).
 */
import fs from 'fs';
import path from 'path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JeuxTestsAdmin from '../components/JeuxTestsAdmin';
import * as api from '../lib/api/jeuxTestsApi';
import { getMatieres, getNiveaux } from '../lib/api/referentielApi';

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

jest.mock('../lib/api/referentielApi', () => ({ getNiveaux: jest.fn(), getMatieres: jest.fn() }));
jest.mock('../lib/hooks/useEvenementsAdmin', () => ({ useEvenementsAdmin: () => {} }));
jest.mock('react-redux', () => ({ useSelector: () => ({}) }));

const COMPETENCE = '🧪 Ouvre l\'examen blanc de maths\n\n✅ Le titre s\'affiche\n👉 Clique sur « Commencer »\n⏱️ Le minuteur démarre\n\n👨‍👩‍👧 Famille 🇫🇷';
const COMMENTAIRE = '🐞 KO au 2e essai\n\n1️⃣ Ouvrir\n2️⃣ Recharger la page';

const JEU = {
  id: 90,
  titre: '🧪 Examens blancs 🎓',
  section: 'generaux',
  niveauCode: 'GENERAUX',
  classe: 'Tests Généraux',
  auteur: 'Adam',
  dateCreation: '2026-11-23T09:00:00',
  statut: 'en_cours',
  titres: ['📝 Démarrage ✅'],
  nombreLignes: 1,
  nombreOk: 1,
  tests: [{
    id: 91, jeuId: 90, titre: '📝 Démarrage ✅', matiereCode: 'categorie', matiere: 'Examens blancs',
    lignes: [{
      id: 901, testId: 91, competence: COMPETENCE, commentaire: COMMENTAIRE, statut: 'ok',
      dateCreation: '2026-11-20T09:00:00', dateEffectuee: '2026-11-20T09:15:00',
    }],
  }],
};

beforeEach(() => {
  jest.clearAllMocks();
  getNiveaux.mockResolvedValue({ data: [] });
  getMatieres.mockResolvedValue({ data: [] });
  api.getJeuxTests.mockResolvedValue({ data: [JEU] });
  api.getJeuTest.mockResolvedValue({ data: JEU });
  api.getCategoriesTests.mockResolvedValue({ data: ['Examens blancs'] });
});

const ouvrirLeJeu = async () => {
  render(<JeuxTestsAdmin />);
  await userEvent.click(await screen.findByRole('button', { name: /^Ouvrir le jeu de test/ }));
  // Les blocs s'ouvrent repliés : on déplie celui du jeu.
  await userEvent.click(await screen.findByRole('button', { name: /Déplier/ }));
  return screen.findByRole('table');
};

test('la cellule de la compétence garde ses retours à la ligne, sur ordinateur comme sur téléphone', () => {
  const css = fs.readFileSync(path.join(__dirname, '../components/jeuxTestsAdmin.css'), 'utf8');
  expect(css).toMatch(/\.jeux-tests__lignes \.jeux-tests__cellule-competence\s*\{\s*white-space:\s*pre-wrap;\s*\}/);
  // La règle des cartes (téléphone) n'a qu'une classe : la nôtre, à deux classes, passe devant elle.
  expect(css).toMatch(/\.jeux-tests__lignes td\s*\{[^}]*white-space:\s*normal;/);
});

test('les émoticônes et les lignes vides arrivent dans la cellule à l\'identique', async () => {
  const tableau = await ouvrirLeJeu();

  // Une seule cellule, dont le texte est EXACTEMENT celui de l'API (le comparateur par défaut recollerait les espaces).
  const cellule = within(tableau).getByText(COMPETENCE, { normalizer: (texte) => texte });
  expect(cellule).toHaveClass('jeux-tests__cellule-competence');
  expect(cellule).toContainHTML(COMPETENCE); // texte brut avec ses « \n » : aucun <br> à la place
  expect(screen.getAllByText('📝 Démarrage ✅').length).toBeGreaterThan(0);
});

test('« Modifier » puis « Enregistrer » envoie le texte tapé à l\'identique, statut inchangé', async () => {
  api.modifierLigneDeTest.mockImplementation((id, ligneId, donnees) => Promise.resolve({
    data: { ...JEU, tests: [{ ...JEU.tests[0], lignes: [{ ...JEU.tests[0].lignes[0], ...donnees }] }] },
  }));
  await ouvrirLeJeu();

  await userEvent.click(screen.getByRole('button', { name: /^Modifier 🧪 Ouvre/ }));
  const champ = screen.getByLabelText('Compétence / test à réaliser');
  expect(champ.value).toBe(COMPETENCE);

  const nouveau = '🎯 Lancer l’examen blanc\n\n✅ Le titre s’affiche\n🔁 Recharger : le minuteur continue';
  // Saisie d'un bloc (fireEvent) : user-event 13 ne tape pas les émoticônes composées ni les retours de façon fiable.
  fireEvent.change(champ, { target: { value: nouveau } });
  await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

  expect(api.modifierLigneDeTest).toHaveBeenCalledWith(90, 901, { competence: nouveau, statut: 'ok', commentaire: COMMENTAIRE });
  const cellule = await within(await screen.findByRole('table')).findByText((_, el) => el?.classList?.contains('jeux-tests__cellule-competence') && el.textContent === nouveau);
  expect(cellule).toBeInTheDocument();
});
