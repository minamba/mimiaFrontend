/**
 * SIGNALEMENT #73 — décision de Min's du 24/11/2026 : « Prêt pour l'épreuve », jamais « Prêt pour le contrôle », sur un
 * examen blanc. La carte (ExamenBlancCarte, lot #73 v2 de Mins) passe déjà `cible="epreuve"` ; la PAGE de l'examen blanc
 * (ExamenBlancFiche, une pastille par matière dont le programme est validé) disait encore « Prêt pour le contrôle ».
 *
 * Ici, sur le vrai composant :
 * 1. matière au programme validé, statut « pret » → « Prêt pour l'épreuve », jamais « Prêt pour le contrôle » ;
 * 2. les autres statuts gardent leur libellé (« Bientôt prêt », « Pas encore prêt ») : seul le mot du verdict change ;
 * 3. programme pas encore validé → aucune pastille (inchangé).
 */

import { render, screen } from '@testing-library/react';
import ExamenBlancFiche from '../components/ExamenBlancFiche';

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

const matiere = (id, libelle, pretStatut, programmeValide = true) => ({
  id,
  matiereId: id,
  matiereLibelle: libelle,
  controleId: 100 + id,
  programmeValide,
  documents: [],
  dossiers: [],
  dossiersAJour: true,
  preparation: programmeValide
    ? { pourcent: 80, perimetreConnu: true, pretStatut, pretObservation: null, notions: [] }
    : null,
});

const bacBlanc = (...matieres) => ({
  id: 6,
  type: 'bac',
  libelle: 'Bac blanc',
  dateExamen: dansJours(17),
  effacementLe: dansJours(60),
  heureExamen: null,
  pourcent: 80,
  matieres,
});

test('page de l’examen blanc : « Prêt pour l’épreuve », jamais « Prêt pour le contrôle »', async () => {
  mockExamen.courant = bacBlanc(matiere(1, 'Philosophie', 'pret'));

  render(<ExamenBlancFiche />);

  expect(await screen.findByText('Prêt pour l’épreuve')).toBeInTheDocument();
  expect(screen.queryByText('Prêt pour le contrôle')).not.toBeInTheDocument();
});

test('page de l’examen blanc : les autres statuts gardent leur libellé', async () => {
  mockExamen.courant = bacBlanc(
    matiere(1, 'Philosophie', 'bientot'),
    matiere(2, 'Mathématiques', 'pas-pret'),
    matiere(3, 'Physique-chimie', 'pret'),
  );

  render(<ExamenBlancFiche />);

  expect(await screen.findByText('Bientôt prêt')).toBeInTheDocument();
  expect(screen.getByText('Pas encore prêt')).toBeInTheDocument();
  expect(screen.getByText('Prêt pour l’épreuve')).toBeInTheDocument();
  expect(screen.queryByText(/Prêt pour le contrôle/)).not.toBeInTheDocument();
});

test('page de l’examen blanc : programme pas encore validé → aucune pastille', async () => {
  mockExamen.courant = bacBlanc(matiere(1, 'Philosophie', null, false));

  render(<ExamenBlancFiche />);

  expect(await screen.findByText('Philosophie')).toBeInTheDocument();
  for (const libelle of [/Prêt pour/, 'Bientôt prêt', 'Pas encore prêt', 'Révision pas commencée']) {
    expect(screen.queryByText(libelle)).not.toBeInTheDocument();
  }
});
