/* eslint-disable testing-library/no-container, testing-library/no-node-access -- décors et classes de mise en page, sans rôle accessible à interroger */
/**
 * « MA CARTE » ILLUSTRÉE — Camara, le 15/11/2026 : la page de l'enfant d'après sa maquette. L'enfant voit la bannière,
 * la pastille et le décor de chaque matière connue, le chapeau des années ; une matière sans décor garde sa pastille
 * de couleur ; le parent garde l'ancienne page. Le fonctionnement (comptes, dépliage) ne change pas.
 */
import { render, screen } from '@testing-library/react';
import Progression from '../components/Progression';
import { getProgression } from '../lib/api/elevesApi';
import { decorDeMatiere, decorDAnnee } from '../lib/carteIllustree';

jest.mock('../lib/api/elevesApi', () => ({ getProgression: jest.fn() }));
jest.mock('react-router-dom', () => ({ useParams: () => ({ eleveId: '9' }), useNavigate: () => jest.fn() }));

let mockEnfant = null;
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => mockEnfant }));

const notion = (id, matiere, autreNiveau = false) => ({
  id, libelle: `Notion ${id}`, domaine: 'D', matiere, etat: 'acquise', niveau: '6e', niveauOrdre: 6, autreNiveau,
});

const donnees = {
  acquises: 2, total: 4, acquisesAutresAnnees: 1, nouvelles: [], niveau: '2e',
  matieres: [
    { matiereId: 1, libelle: 'Mathématiques', couleur: '#0ea5e9', total: 2, acquises: 1, competences: [notion(1, 'Mathématiques'), notion(2, 'Mathématiques', true)] },
    { matiereId: 2, libelle: 'Option facultative', couleur: '#e8562f', total: 2, acquises: 1, competences: [notion(3, 'SES')] },
  ],
};

beforeEach(() => {
  getProgression.mockResolvedValue({ data: donnees });
});

test('la vue de l’enfant : bannière illustrée, pastille et décor des matières connues, repli pour les autres', async () => {
  mockEnfant = { eleveId: 9 };
  const { container } = render(<Progression />);

  expect(await screen.findByRole('heading', { name: 'Ma carte' })).toHaveClass('carte-illustree__titre');
  expect(container.querySelector('.page-decor-enfant.carte-illustree')).not.toBeNull();

  const maths = screen.getByText('Mathématiques', { selector: 'summary strong' }).closest('details');
  expect(maths.style.getPropertyValue('--decor')).toMatch(/rangee-maths/);
  expect(maths.querySelector('img.parcours__icone')).not.toBeNull();

  const ses = screen.getByText('Option facultative').closest('details');
  expect(ses.style.getPropertyValue('--decor')).toBe('');
  expect(ses.querySelector('.parcours__pastille')).not.toBeNull();

  // Les années précédentes : le chapeau et un décor.
  const annee = container.querySelector('.parcours__matiere--annee');
  expect(annee.querySelector('img.parcours__icone')).not.toBeNull();
  expect(annee.style.getPropertyValue('--decor')).toMatch(/rangee-annee/);
});

test('la vue du parent ne change pas', async () => {
  mockEnfant = null;
  const { container } = render(<Progression />);
  await screen.findByRole('heading', { name: 'Ma carte' });
  expect(container.querySelector('.carte-illustree')).toBeNull();
  expect(container.querySelector('.bandeau-page')).not.toBeNull();
});

test('les univers reconnus d’après le libellé', () => {
  expect(decorDeMatiere('Anglais')).not.toBeNull();
  expect(decorDeMatiere('Langues, littératures et cultures étrangères - anglais')).toEqual(decorDeMatiere('Anglais'));
  expect(decorDeMatiere('Histoire-géographie, géopolitique et sciences politiques')).toEqual(decorDeMatiere('Histoire-Géographie'));
  expect(decorDeMatiere('Français')).not.toBeNull();
  // Depuis le 15/11/2026, toutes les matières de la base ont leur univers (carteIllustreeUnivers) : seule une
  // matière inconnue reste sans décor.
  expect(decorDeMatiere('Option facultative')).toBeNull();
  expect(decorDAnnee('CM2', 0)).toMatch(/cm2/);
  expect(decorDAnnee('2de', 1)).toBeTruthy();
});
