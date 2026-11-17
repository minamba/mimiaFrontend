/* eslint-disable testing-library/no-node-access -- le tutoriel vise les éléments par leur repère. */
/**
 * LE TUTORIEL DE LA FICHE — Camara, le 08/11/2026 : une fois par compte parent, sur la
 * vraie fiche, quand elle a quelque chose à montrer.
 */
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import PageEleve from '../components/PageEleve';
import { getFicheEleve } from '../lib/api/elevesApi';
import { getProfil, marquerTutorielFicheVu } from '../lib/api/profilApi';
import { sessionEleve } from '../lib/storage/sessionEleve';
import { ETAPES_FICHE } from '../lib/tutoriel/etapes';

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: null, hash: '' }),
}));

jest.mock('../lib/api/elevesApi', () => new Proxy({}, {
  get: (cache, nom) => {
    if (!cache[nom]) cache[nom] = jest.fn().mockResolvedValue({ data: {} }); // eslint-disable-line no-param-reassign
    return cache[nom];
  },
}));
jest.mock('../lib/api/adminApi', () => ({ getApercuBilan: jest.fn(), envoyerBilan: jest.fn() }));
jest.mock('../lib/api/profilApi', () => ({ getProfil: jest.fn(), marquerTutorielFicheVu: jest.fn() }));
jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: jest.fn() }));
jest.mock('../components/ProgressionMatiere', () => ({ __esModule: true, default: () => <p>Une progression</p> }));
jest.mock('../components/tutoriel/TestMicro', () => ({ __esModule: true, default: () => null }));

const page = (elements) => ({ elements, total: elements.length, suite: null });

const fiche = (autres = {}) => ({
  id: 24,
  prenom: 'Ahmed',
  nom: 'B.',
  age: 9,
  sexe: 2,
  nombreCours: 3,
  nombreRequetes: 40,
  competencesEvaluees: 2,
  classes: [{ niveauScolaireId: 2, libelle: 'CE1', courante: true }],
  matieres: [],
  lacunes: [],
  enCours: [],
  acquises: [],
  aConfirmer: [],
  dernieresSeances: [],
  progression: [{ matiereId: 7 }],
  evaluations: page([{ id: 1, note: 15, matiereLibelle: 'Mathématiques', profPrenom: 'Nora' }]),
  rapports: page([{ id: 2, matiereLibelle: 'Mathématiques' }]),
  ...autres,
});

const titre = (texte) => screen.findByText(texte, { selector: '.tuto__titre' }, { timeout: 4000 });

const monter = async ({ donnees = fiche(), profil = { tutorielFicheVu: false } } = {}) => {
  getFicheEleve.mockResolvedValue({ data: donnees });
  getProfil.mockResolvedValue({ data: profil });
  render(<PageEleve />);
  await screen.findByRole('heading', { name: /Ahmed/ });
};

beforeEach(() => {
  jest.clearAllMocks();
  sessionEleve.mockReturnValue(null);
  marquerTutorielFicheVu.mockResolvedValue({});
  Element.prototype.scrollIntoView = jest.fn();
  Element.prototype.getBoundingClientRect = () => ({
    top: 100, bottom: 200, left: 10, right: 110, width: 100, height: 100,
  });
  window.matchMedia = window.matchMedia ?? (() => ({
    matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {},
  }));
});

describe('quand il se lance', () => {
  test('un parent qui ne l’a jamais vu, sur une fiche avec un cours : il se lance, noté vu aussitôt', async () => {
    await monter();

    expect(await titre('L’année que vous regardez')).toBeInTheDocument();
    expect(marquerTutorielFicheVu).toHaveBeenCalledTimes(1);
  });

  test('déjà vu : rien, et le bouton le rejoue sans toucher à la date', async () => {
    await monter({ profil: { tutorielFicheVu: true } });
    await waitFor(() => expect(getProfil).toHaveBeenCalled());
    expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Voir le tuto/ }));

    expect(await titre('L’année que vous regardez')).toBeInTheDocument();
    expect(marquerTutorielFicheVu).not.toHaveBeenCalled();
  });

  test('aucun cours encore : il attend, et rien n’est noté', async () => {
    await monter({ donnees: fiche({ nombreCours: 0 }) });

    expect(getProfil).not.toHaveBeenCalled();
    expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument();
    expect(marquerTutorielFicheVu).not.toHaveBeenCalled();
  });

  test('un enfant connecté : ni lancement, ni bouton, ni profil demandé', async () => {
    sessionEleve.mockReturnValue({ jeton: 'x', eleveId: 24 });
    await monter();

    expect(getProfil).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Voir le tuto/ })).not.toBeInTheDocument();
  });

  test('une API plus ancienne que le front ne le lance pas', async () => {
    await monter({ profil: { tutorielVu: true } });
    await waitFor(() => expect(getProfil).toHaveBeenCalled());

    expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument();
    expect(marquerTutorielFicheVu).not.toHaveBeenCalled();
  });

  test('un profil en panne laisse la fiche tranquille', async () => {
    getFicheEleve.mockResolvedValue({ data: fiche() });
    getProfil.mockRejectedValue(new Error('panne'));
    render(<PageEleve />);

    await screen.findByRole('heading', { name: /Ahmed/ });
    await waitFor(() => expect(getProfil).toHaveBeenCalled());
    expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument();
  });
});

describe('le parcours', () => {
  const suivant = () => fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

  test('toutes les bulles, un seul parcours, puis la fiche', async () => {
    await monter();

    await titre('L’année que vous regardez');
    expect(screen.queryByRole('button', { name: 'Passer l’étape' })).not.toBeInTheDocument();
    suivant();
    await titre('Le bilan de la semaine');
    suivant();
    await titre('Aller directement à une section');
    suivant();
    await titre('Où il a besoin d’aide');
    suivant();
    await titre('Sa progression');
    suivant();
    await titre('Ses évaluations');
    suivant();
    await titre('Ses séances et leurs comptes rendus');
    expect(screen.getByRole('progressbar', { name: 'Avancée du tutoriel' })).toHaveAttribute('aria-valuenow', '100');

    fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));
    await waitFor(() => expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: /Ahmed/ })).toBeInTheDocument();
  }, 20000);

  test('« Précédent » ramène en arrière', async () => {
    await monter();

    await titre('L’année que vous regardez');
    suivant();
    await titre('Le bilan de la semaine');
    fireEvent.click(screen.getByRole('button', { name: 'Précédent' }));
    expect(await titre('L’année que vous regardez')).toBeInTheDocument();
  });

  test('une section absente se saute : pas de progression, pas de bulle', async () => {
    await monter({ donnees: fiche({ progression: [] }) });

    await titre('L’année que vous regardez');
    suivant();
    await titre('Le bilan de la semaine');
    suivant();
    await titre('Aller directement à une section');
    suivant();
    await titre('Où il a besoin d’aide');
    suivant();

    expect(await titre('Ses évaluations')).toBeInTheDocument();
  }, 20000);

  describe('l’orientation', () => {
    const jusquaLaFin = async () => {
      await titre('L’année que vous regardez');
      suivant();
      await titre('Le bilan de la semaine');
      suivant();
      await titre('Aller directement à une section');
      suivant();
      await titre('Où il a besoin d’aide');
      suivant();
      await titre('Sa progression');
      suivant();
      await titre('Ses évaluations');
      suivant();
    };

    test('l’enfant suivi par la conseillère : les séances, puis sa bulle pour finir', async () => {
      await monter({
        donnees: fiche({ projetOrientation: { objectif: 'Ingénieur', le: '2026-10-12T10:00:00Z', matieres: [] } }),
      });

      await jusquaLaFin();
      await titre('Ses séances et leurs comptes rendus');
      expect(screen.queryByRole('button', { name: 'Terminer' })).not.toBeInTheDocument();
      suivant();

      expect(await titre('Son orientation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Terminer' })).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: 'Avancée du tutoriel' })).toHaveAttribute('aria-valuenow', '100');
      expect(screen.queryByRole('button', { name: 'Passer le tutoriel' })).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));
      await waitFor(() => expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument());
    }, 20000);

    test('sans séance d’orientation : pas de bulle, et les séances restent la dernière', async () => {
      await monter();

      await jusquaLaFin();
      await titre('Ses séances et leurs comptes rendus');
      expect(screen.queryByText('Son orientation', { selector: '.tuto__titre' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Suivant' })).not.toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: 'Avancée du tutoriel' })).toHaveAttribute('aria-valuenow', '100');

      fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));
      await waitFor(() => expect(document.querySelector('.tuto__titre')).not.toBeInTheDocument());
    }, 20000);

    test('la conseillère n’est pas nommée : son prénom se lit en base', () => {
      const { texte } = ETAPES_FICHE.find((e) => e.id === 'fiche-orientation');
      expect(texte).not.toMatch(/Maëlle/);
    });
  });

  test('sans évaluation ni séance, les bulles éclairent le message qui l’explique', async () => {
    await monter({ donnees: fiche({ evaluations: page([]), rapports: page([]) }) });
    await titre('L’année que vous regardez');

    expect(document.querySelector('p[data-tuto="fiche-evaluations"]')).toBeInTheDocument();
    expect(document.querySelector('p[data-tuto="fiche-seances"]')).toBeInTheDocument();
  });

  test('chaque bulle trouve sa cible, et le parent y est vouvoyé', async () => {
    await monter();
    await titre('L’année que vous regardez');

    // L'orientation a ses propres tests : cet enfant-ci n'en a pas.
    ETAPES_FICHE.filter((e) => e.id !== 'fiche-orientation').forEach((etape) => {
      expect(document.querySelector(etape.cible)).toBeInTheDocument();
      expect(`${etape.titre} ${etape.texte}`).not.toMatch(/(?<!\p{L})(tu|ton|ta|tes|toi)(?!\p{L})/iu);
    });
  });
});
