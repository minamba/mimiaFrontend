/**
 * LA FICHE D'UNE ÉPREUVE, VUE DE L'ENFANT — Camara, le 15/11/2026 : « garde la tête des vrais professeurs, il faut
 * que ça s'adapte à chaque matière en examen ».
 *
 * 1. Un bloc par matière de l'épreuve, chacun avec le PORTRAIT DE SON PROFESSEUR (l'avatar pris dans les matières de
 *    l'enfant), « avec … », ses domaines dépliables et son bouton, qui ouvre la séance de CETTE matière.
 * 2. Une épreuve à une seule matière : un seul bloc, bouton sans « avec … ».
 * 3. Le parent garde l'ancienne vue.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EpreuveFiche, { traitDuDomaine } from '../components/EpreuveFiche';
import { getEpreuve, getMatieresEleve } from '../lib/api/elevesApi';
import { sessionEleve } from '../lib/storage/sessionEleve';

const mockNaviguer = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => mockNaviguer,
  useParams: () => ({ eleveId: '9', epreuveCode: 'DNB_2027_SCIENCES' }),
}));
jest.mock('../lib/api/elevesApi', () => ({ getEpreuve: jest.fn(), getMatieresEleve: jest.fn() }));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: jest.fn() }));
jest.mock('../components/Avatar', () => function Avatar({ nom }) { return <span data-testid="portrait">{nom}</span>; });

const notion = (id, domaine, etat = 'nouvelle') => ({ id, libelle: `Notion ${id}`, domaine, etat, pourcent: 0 });
const matiere = (matiereId, libelle, profPrenom, notions, nombrePreparations = 0) => ({
  matiereId, code: libelle.toUpperCase(), libelle, profPrenom, nombrePreparations,
  preparation: { pourcent: 4, perimetreConnu: true, notions },
});

const SCIENCES = {
  code: 'DNB_2027_SCIENCES', libelle: 'Brevet de sciences', examenLibelle: 'Brevet', session: 2027, pourcent: 2,
  description: '1 h · coefficient 2', remarque: 'La technologie n’est pas encore couverte.',
  matieres: [
    matiere(5, 'Physique-Chimie', 'Yann', [notion(1, 'L’énergie'), notion(2, 'L’énergie', 'acquise')]),
    matiere(6, 'SVT', 'Inès', [notion(3, 'La planète Terre')], 1),
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionEleve.mockReturnValue({ eleveId: 9 });
  getEpreuve.mockResolvedValue({ data: SCIENCES });
  getMatieresEleve.mockResolvedValue({
    data: [
      { id: 5, profAvatar: 'yann', profCouleur: '#3b82f6' },
      { id: 6, profAvatar: 'ines', profCouleur: '#22c55e' },
    ],
  });
});

test('un bloc par matière, avec le vrai portrait de son professeur et son bouton', async () => {
  render(<EpreuveFiche />);

  expect(await screen.findByRole('heading', { level: 1, name: 'Brevet de sciences' })).toBeInTheDocument();
  expect(screen.getByText(/Brevet 2027/)).toBeInTheDocument();

  const portraits = await screen.findAllByTestId('portrait');
  expect(portraits.map((p) => p.textContent)).toEqual(['yann', 'ines']);

  expect(screen.getByRole('heading', { level: 2, name: /Physique-Chimie\s+avec Yann/ })).toBeInTheDocument();
  expect(screen.getByText('1 acquise sur 2')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: /Commencer à réviser avec Yann/ }));
  expect(mockNaviguer).toHaveBeenCalledWith('/eleves/9/matieres/5/chat?mode=examen&epreuve=DNB_2027_SCIENCES');
  expect(screen.getByRole('button', { name: /Continuer la préparation avec Inès/ })).toBeInTheDocument();
});

test('une épreuve à une seule matière : un bloc, un bouton sans « avec … »', async () => {
  getEpreuve.mockResolvedValue({
    data: { ...SCIENCES, libelle: 'Brevet de français', matieres: [matiere(2, 'Français', 'Adrien', [notion(9, 'Lecture')])] },
  });
  getMatieresEleve.mockResolvedValue({ data: [{ id: 2, profAvatar: 'adrien' }] });
  render(<EpreuveFiche />);

  expect(await screen.findByTestId('portrait')).toHaveTextContent('adrien');
  expect(screen.getByRole('button', { name: 'Commencer à réviser' })).toBeInTheDocument();
});

test('sans portrait connu, le bloc s’affiche quand même, sans portrait', async () => {
  getMatieresEleve.mockRejectedValue(new Error('réseau'));
  render(<EpreuveFiche />);

  expect(await screen.findByRole('heading', { level: 1, name: 'Brevet de sciences' })).toBeInTheDocument();
  expect(screen.queryByTestId('portrait')).not.toBeInTheDocument();
});

test('le parent garde l’ancienne vue', async () => {
  sessionEleve.mockReturnValue(null);
  render(<EpreuveFiche />);

  expect(await screen.findByRole('heading', { level: 1, name: 'Brevet de sciences' })).toBeInTheDocument();
  expect(screen.queryByTestId('portrait')).not.toBeInTheDocument();
  expect(getMatieresEleve).not.toHaveBeenCalled();
});

test('une icône au trait par domaine, une étoile par défaut', () => {
  expect(traitDuDomaine('L’énergie')).toMatch(/^M13 2/);
  expect(traitDuDomaine('Un domaine inconnu')).toBe(traitDuDomaine('autre chose'));
});
