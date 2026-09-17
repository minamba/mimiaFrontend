/**
 * QUAND L'AJOUT D'UN ENFANT EST REFUSÉ, AUCUN CHEMIN N'Y MÈNE — Camara, le
 * 18/09/2026 : « j'ai créé un compte, je lui ai empêché de pouvoir ajouter un
 * enfant, mais la fenêtre d'ajout d'enfant est toujours là ».
 *
 * POURQUOI LE DÉFAUT EST PASSÉ, ET CE QUE CE FICHIER CHANGE
 * --------------------------------------------------------
 * Le droit retiré était bien vérifié — côté serveur, dans l'encadré
 * d'explication, et sur la tuile « + Ajouter un enfant » de la grille. Il
 * restait DEUX chemins ouverts, et aucun test ne regardait les écrans :
 *
 *   1. LE BLOC D'ACCUEIL D'UN COMPTE SANS AUCUN ENFANT. Un compte neuf ne voit
 *      jamais la grille — il voit « Créez le profil de votre enfant » avec son
 *      bouton, qui ne demandait rien à personne. C'est exactement le cas de
 *      Camara : un compte qu'on vient de créer.
 *   2. L'ADRESSE DU FORMULAIRE. Une page a une adresse, et une adresse se tape,
 *      se met en favori et traîne dans un historique.
 *
 * Les tests d'avant ne couvraient que `QuotaEnfants`, c'est-à-dire le message
 * de refus — jamais les écrans qui décident de le montrer. Un composant juste
 * ne fait pas un écran juste.
 */

import { render, screen } from '@testing-library/react';
import ListeEleves from '../components/ListeEleves';
import FormulaireEleve from '../components/FormulaireEleve';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, state, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useNavigate: () => () => {},
}));

let mockEleves = [];
let mockCapacite = { actuels: 0, maximum: 3, peutAjouter: true, droitRetire: false };

const mockDispatch = () => {};

jest.mock('react-redux', () => ({
  useSelector: (selecteur) => selecteur({
    eleves: { liste: mockEleves, loading: false, error: null, submitting: false, success: false },
    auth: { estAdmin: false },
    referentiel: { niveaux: [{ id: 1, libelle: 'CP', lv2Possible: false }], academies: [], loading: false },
  }),
  useDispatch: () => mockDispatch,
}));

jest.mock('../lib/actions/elevesActions', () => ({
  chargerEleves: () => ({ type: 'test/charger' }),
  selectionnerEleve: () => ({ type: 'test/selectionner' }),
  submitEleve: () => ({ type: 'test/submit' }),
  resetEleve: () => ({ type: 'test/reset' }),
}));

jest.mock('../lib/actions/referentielActions', () => ({
  chargerReferentiel: () => ({ type: 'test/referentiel' }),
}));

jest.mock('../lib/api/abonnementApi', () => ({
  getCapaciteEnfants: () => Promise.resolve({ data: mockCapacite }),
}));

jest.mock('../lib/api/elevesApi', () => ({
  getCodeEleve: () => Promise.resolve({ data: { code: 'K7P2QX', suspendu: false } }),
}));

const ENFANT = { id: 1, prenom: 'Bilal', niveauLibelle: '3e', age: 14, derniereActivite: null };

const REFUS = { actuels: 0, maximum: 3, peutAjouter: false, droitRetire: true };
const PLEIN = { actuels: 1, maximum: 1, peutAjouter: false, droitRetire: false, offreLibelle: 'Solo' };

beforeEach(() => {
  mockEleves = [];
  mockCapacite = { actuels: 0, maximum: 3, peutAjouter: true, droitRetire: false };
});

describe('« Vos enfants »', () => {
  test('compte NEUF et droit retiré : aucune invitation à créer un profil', async () => {
    mockCapacite = REFUS;
    render(<ListeEleves />);

    expect(await screen.findByText(/n’est pas autorisé sur ce compte/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /créer le premier profil/i })).toBeNull();
    expect(screen.queryByText(/créez le profil de votre enfant/i)).toBeNull();
  });

  test('compte neuf et droit intact : l’invitation est bien là', async () => {
    render(<ListeEleves />);

    expect(await screen.findByRole('link', { name: /créer le premier profil/i }))
      .toHaveAttribute('href', '/eleves/nouveau');
  });

  test('avec des enfants et le droit retiré : pas de tuile d’ajout', async () => {
    mockEleves = [ENFANT];
    mockCapacite = { ...REFUS, actuels: 1 };

    render(<ListeEleves />);

    expect(await screen.findByText(/n’est pas autorisé sur ce compte/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ajouter un enfant/i })).toBeNull();
  });

  test('avec des enfants et le droit intact : la tuile est là', async () => {
    mockEleves = [ENFANT];
    mockCapacite = { actuels: 1, maximum: 3, peutAjouter: true, droitRetire: false };

    render(<ListeEleves />);

    expect(await screen.findByRole('link', { name: /ajouter un enfant/i })).toBeInTheDocument();
  });
});

describe('Le formulaire, atteint par son adresse', () => {
  test('droit retiré : pas de formulaire, et la raison à la place', async () => {
    mockCapacite = REFUS;
    render(<FormulaireEleve />);

    expect(await screen.findByText(/n’est pas autorisé sur ce compte/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/prénom/i)).toBeNull();
  });

  test('formule pleine : même garde, mais l’autre message', async () => {
    mockCapacite = PLEIN;
    render(<FormulaireEleve />);

    expect(await screen.findByText(/formule Solo couvre 1 enfant/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/prénom/i)).toBeNull();
  });

  test('droit intact : le formulaire s’affiche', async () => {
    render(<FormulaireEleve />);

    expect(await screen.findByLabelText(/prénom/i)).toBeInTheDocument();
  });
});
