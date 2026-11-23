/**
 * SIGNALEMENT #69 v2 (23/11/2026) — les phrases jumelles de « La moyenne de tes 1 matière. »
 *
 * Omar (contrôle de 375f57b) : deux phrases construites « vos/les {n} » restaient fautives avec n = 1 :
 * la modale de suppression du compte (« Le profil de vos 1 enfant ») et le bouton des fiches
 * (« Voir les 1 autre »). La recherche des motifs « tes/vos/les/ses {n} » dans tout `src/` en a trouvé trois de plus :
 * le bouton des compétences de la fiche de l'enfant (« Voir les 1 autre »), le message du scan par téléphone
 * (« les 1 premiers ont été gardés ») et la confirmation de suppression d'un parent dans l'administration
 * (« ses 1 profil(s) »).
 *
 * Chaque phrase est montée sur le VRAI composant avec n = 1, n = 2 et n = 0 (quand 0 peut s'afficher).
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SuppressionCompte from '../components/SuppressionCompte';
import Fiches from '../components/Fiches';
import FicheEleve from '../components/FicheEleve';
import ScanMobile from '../components/ScanMobile';
import ExamenBlancFiche from '../components/ExamenBlancFiche';
import { getFiches } from '../lib/api/elevesApi';
import { lireScanMobile } from '../lib/api/scanMobileApi';

const ETAT = {
  referentiel: { matieres: [{ id: 1, libelle: 'Mathématiques' }] },
  eleves: { liste: [{ id: 36, prenom: 'Test' }] },
  auth: { estAdmin: false },
};

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '36', matiereId: '1', examenId: '6', jeton: 'abc123' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ hash: '' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 36, prenom: 'Test', niveau: 'Tle' }),
  accueilEleve: (id) => `/eleves/${id}/matieres`,
}));

jest.mock('../lib/api/elevesApi', () => {
  const getFiches = jest.fn();
  return new Proxy({}, {
    get: (_cible, nom) => (nom === 'getFiches' ? getFiches : () => Promise.resolve({ data: [] })),
  });
});

jest.mock('../lib/api/profilApi', () => ({ supprimerMonCompte: jest.fn() }));

jest.mock('../lib/api/adminApi', () => ({ getApercuBilan: jest.fn(), envoyerBilan: jest.fn() }));

jest.mock('../lib/api/scanMobileApi', () => ({
  lireScanMobile: jest.fn(),
  envoyerScanMobile: jest.fn(),
  terminerScanMobile: jest.fn(),
}));

const mockExamen = { courant: null };
jest.mock('../lib/api/examensBlancsApi', () => ({
  getExamenBlanc: () => Promise.resolve({ data: mockExamen.courant }),
  retirerMatiereExamenBlanc: () => Promise.resolve({}),
  supprimerExamenBlanc: () => Promise.resolve({}),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

/* ------------------------------------------------------------------------------------------------------------------
 * 1. La modale de suppression du compte (SuppressionCompte.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('suppression du compte : le profil des enfants', () => {
  const ouvrir = async (nombreEnfants) => {
    render(<SuppressionCompte nombreEnfants={nombreEnfants} onSupprime={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Supprimer mon compte' }));
  };

  test('un enfant : « Le profil de votre enfant », jamais « vos 1 enfant »', async () => {
    await ouvrir(1);
    expect(screen.getByText('Le profil de votre enfant')).toBeInTheDocument();
    expect(screen.queryByText(/vos 1 /)).not.toBeInTheDocument();
  });

  test('deux enfants : « Les profils de vos 2 enfants »', async () => {
    await ouvrir(2);
    expect(screen.getByText('Les profils de vos 2 enfants')).toBeInTheDocument();
  });

  test('aucun enfant : « Les profils de vos enfants », sans nombre', async () => {
    await ouvrir(0);
    expect(screen.getByText('Les profils de vos enfants')).toBeInTheDocument();
    expect(screen.queryByText(/vos 0 /)).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 2. Le bouton qui déplie les fiches d'un domaine (Fiches.js, 8 fiches visibles par domaine)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('fiches d’une matière : le bouton « voir la suite »', () => {
  const fiches = (n) => Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    notion: `Notion ${i + 1}`,
    domaine: 'Nombres et calculs',
    apercu: 'Aperçu',
    contenu: 'Contenu',
    acquise: false,
    dateMiseAJour: '2026-11-20T10:00:00Z',
  }));

  const monter = async (n) => {
    getFiches.mockResolvedValue({ data: fiches(n) });
    render(<Fiches />);
    expect(await screen.findByText('Notion 1')).toBeInTheDocument();
  };

  test('une fiche cachée : « Voir l’autre », jamais « Voir les 1 autre »', async () => {
    await monter(9);
    expect(screen.getByRole('button', { name: /^Voir l'autre/ })).toBeInTheDocument();
    expect(screen.queryByText(/les 1 /)).not.toBeInTheDocument();
  });

  test('deux fiches cachées : « Voir les 2 autres »', async () => {
    await monter(10);
    expect(screen.getByRole('button', { name: /^Voir les 2 autres/ })).toBeInTheDocument();
  });

  test('aucune fiche cachée : pas de bouton', async () => {
    await monter(8);
    expect(screen.queryByRole('button', { name: /^Voir / })).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 3. Le bouton des compétences de la fiche de l'enfant (FicheEleve.js, 8 compétences visibles par liste)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('fiche de l’enfant : le bouton des compétences', () => {
  const competences = (n) => Array.from({ length: n }, (_, i) => ({
    competenceId: i + 1,
    libelle: `Compétence ${i + 1}`,
    score: 0.3,
    matiereLibelle: 'Mathématiques',
    niveauLibelle: '3e',
    domaine: 'Nombres et calculs',
    nombreObservations: 2,
  }));

  const monter = (n) => render(
    <FicheEleve
      enPage
      fiche={{
        id: 36,
        prenom: 'Test',
        nom: 'Essai',
        age: 14,
        sexe: 2,
        niveauCode: 'TROISIEME',
        niveauLibelle: '3e',
        niveauCycle: 'College',
        dateCreation: '2026-09-01T10:00:00Z',
        derniereActivite: '2026-11-20T10:00:00Z',
        nombreRequetes: 120,
        nombreCours: 3,
        competencesEvaluees: n,
        dernierCours: null,
        matieres: [],
        dernieresSeances: [],
        lacunes: competences(n),
        totalFragiles: n,
        acquises: [],
        enCours: [],
        aConfirmer: [],
        progression: [],
        evaluations: { elements: [], total: 0, suite: null },
        rapports: { elements: [], total: 0, suite: null },
      }}
      chargement={false}
      erreur={null}
      onFermer={() => {}}
      chargerEvaluations={jest.fn()}
      chargerRapports={jest.fn()}
    />,
  );

  test('une compétence cachée : « Voir l’autre »', () => {
    monter(9);
    expect(screen.getByRole('button', { name: "Voir l'autre" })).toBeInTheDocument();
    expect(screen.queryByText(/les 1 /)).not.toBeInTheDocument();
  });

  test('deux compétences cachées : « Voir les 2 autres »', () => {
    monter(10);
    expect(screen.getByRole('button', { name: 'Voir les 2 autres' })).toBeInTheDocument();
  });

  test('aucune compétence cachée : pas de bouton', () => {
    monter(8);
    expect(screen.queryByRole('button', { name: /^Voir l/ })).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 4. Le scan par téléphone : au plus 6 documents (ScanMobile.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('scan par téléphone : documents en trop', () => {
  const pdf = (n) => Array.from({ length: n }, (_, i) => new File([String(i)], `page${i + 1}.pdf`, { type: 'application/pdf' }));

  const monter = async () => {
    lireScanMobile.mockResolvedValue({ data: { profPrenom: 'Nora', matiere: 'Mathématiques', dejaEnvoye: false } });
    render(<ScanMobile />);
    await screen.findByRole('heading', { name: 'Envoie ta copie à Nora' });
  };

  test('une seule place restante : « seul le premier a été gardé », jamais « les 1 premiers »', async () => {
    await monter();
    await userEvent.upload(screen.getByLabelText(/Importer un document/), pdf(5));
    await userEvent.upload(screen.getByLabelText(/Importer un document/), pdf(2));

    expect(await screen.findByText(/seul le premier a été gardé/)).toBeInTheDocument();
    expect(screen.queryByText(/les 1 premiers/)).not.toBeInTheDocument();
  });

  test('deux places restantes : « les 2 premiers ont été gardés »', async () => {
    await monter();
    await userEvent.upload(screen.getByLabelText(/Importer un document/), pdf(4));
    await userEvent.upload(screen.getByLabelText(/Importer un document/), pdf(3));

    expect(await screen.findByText(/les 2 premiers ont été gardés/)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------------------------------------------------
 * 5. La fiche de l'examen blanc sans matière (cas 0 du correctif #69) : pas de « ta matière »
 * ---------------------------------------------------------------------------------------------------------------- */
test('examen blanc sans matière : aucune phrase « La moyenne de ta matière. »', async () => {
  mockExamen.courant = {
    id: 6,
    type: 'bac',
    libelle: 'Bac blanc',
    dateExamen: '2026-12-10T00:00:00',
    effacementLe: '2027-01-30T00:00:00',
    heureExamen: null,
    pourcent: 0,
    matieres: [],
  };

  render(<ExamenBlancFiche />);

  await waitFor(() => expect(screen.getByText(/Bac blanc du/)).toBeInTheDocument());
  expect(screen.queryByText(/La moyenne de/)).not.toBeInTheDocument();
});

/* ------------------------------------------------------------------------------------------------------------------
 * 6. La confirmation de suppression d'un parent dans l'administration (Admin.js)
 * ---------------------------------------------------------------------------------------------------------------- */
describe('administration : confirmation de suppression d’un parent', () => {
  // Chargé ici seulement : l'écran d'administration n'a rien à faire dans les autres cas.
  // eslint-disable-next-line global-require
  const { libelleSuppressionParent } = require('../components/Admin');

  test('un profil : « et son profil », jamais « ses 1 profil(s) »', () => {
    expect(libelleSuppressionParent({ mail: 'parent@exemple.invalid', nombreEleves: 1, formule: null }))
      .toBe('le compte parent@exemple.invalid et son profil');
  });

  test('deux profils : « et ses 2 profils »', () => {
    expect(libelleSuppressionParent({ mail: 'parent@exemple.invalid', nombreEleves: 2, formule: 'Essentiel' }))
      .toBe('le compte parent@exemple.invalid et ses 2 profils, en résiliant son abonnement Essentiel chez Stripe');
  });

  test('aucun profil : rien d’annoncé', () => {
    expect(libelleSuppressionParent({ mail: 'parent@exemple.invalid', nombreEleves: 0, formule: null }))
      .toBe('le compte parent@exemple.invalid');
  });
});
