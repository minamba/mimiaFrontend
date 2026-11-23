/**
 * SIGNALEMENT #69 (23/11/2026) — « La moyenne de tes 1 matière. »
 *
 * Adam : un bac blanc avec UNE seule matière affichait sous sa barre globale « La moyenne de tes 1 matière. ».
 * La même tournure existait sous la barre de la préparation à l'examen (« tes 1 épreuve »).
 *
 * Ici, sur les vrais composants :
 * 1. fiche de l'examen blanc, une matière → « La moyenne de ta matière. », jamais « tes 1 » ;
 * 2. fiche de l'examen blanc, deux matières → « La moyenne de tes 2 matières. » (inchangé) ;
 * 3. préparation à l'examen, une épreuve → « La moyenne de ton épreuve. ».
 */

import { render, screen } from '@testing-library/react';
import ExamenBlancFiche from '../components/ExamenBlancFiche';
import PreparationExamen from '../components/PreparationExamen';

const ETAT = {
  referentiel: { matieres: [] },
  eleves: { liste: [] },
  auth: { estAdmin: false },
};

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '36', examenId: '6' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ hash: '' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 36, prenom: 'Test', niveau: 'Tle' }),
  accueilEleve: (id) => `/eleves/${id}/matieres`,
}));

jest.mock('../lib/api/elevesApi', () => new Proxy({}, {
  get: () => () => Promise.resolve({ data: [] }),
}));

const mockExamen = { courant: null };
jest.mock('../lib/api/examensBlancsApi', () => ({
  getExamenBlanc: () => Promise.resolve({ data: mockExamen.courant }),
  retirerMatiereExamenBlanc: () => Promise.resolve({}),
  supprimerExamenBlanc: () => Promise.resolve({}),
}));

const dansJours = (n) => `${new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)}T00:00:00`;

const matiere = (id, libelle) => ({
  id,
  matiereId: id,
  matiereLibelle: libelle,
  controleId: null,
  programmeValide: false,
  documents: [],
  dossiers: [],
  dossiersAJour: true,
  preparation: null,
});

/** Le bac blanc 6 d'Adam : une seule matière. */
const bacBlanc = (...matieres) => ({
  id: 6,
  type: 'bac',
  libelle: 'Bac blanc',
  dateExamen: dansJours(17),
  effacementLe: dansJours(60),
  heureExamen: null,
  pourcent: 0,
  matieres,
});

test('fiche de l’examen blanc à une seule matière : « La moyenne de ta matière. »', async () => {
  mockExamen.courant = bacBlanc(matiere(1, 'Philosophie'));

  render(<ExamenBlancFiche />);

  expect(await screen.findByText('La moyenne de ta matière.')).toBeInTheDocument();
  expect(screen.queryByText(/tes 1 /)).not.toBeInTheDocument();
});

test('fiche de l’examen blanc à deux matières : le pluriel est inchangé', async () => {
  mockExamen.courant = bacBlanc(matiere(1, 'Philosophie'), matiere(2, 'Mathématiques'));

  render(<ExamenBlancFiche />);

  expect(await screen.findByText('La moyenne de tes 2 matières.')).toBeInTheDocument();
});

test('préparation à l’examen à une seule épreuve : « La moyenne de ton épreuve. »', () => {
  const examen = {
    code: 'BAC_2027',
    libelle: 'Bac',
    titreSection: 'Préparation au bac',
    session: 2027,
    pourcent: 12,
    epreuves: [{
      code: 'BAC_2027_PHILO',
      libelle: 'Bac de philosophie',
      pourcent: 12,
      matieres: [{
        matiereId: 1,
        code: 'PHILO',
        libelle: 'Philosophie',
        profPrenom: 'Inès',
        nombrePreparations: 0,
        preparation: { pourcent: 12, perimetreConnu: true, total: 10, acquises: 1, notions: [] },
      }],
    }],
  };

  render(<PreparationExamen eleveId="36" examen={examen} onPreparer={jest.fn()} />);

  expect(screen.getByText('La moyenne de ton épreuve.')).toBeInTheDocument();
  expect(screen.queryByText(/tes 1 /)).not.toBeInTheDocument();
});
