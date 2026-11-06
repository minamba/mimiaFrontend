/* eslint-disable testing-library/no-node-access -- le tutoriel vise les éléments par leur repère. */
/**
 * LE TUTORIEL — Camara, le 02/11/2026. On monte la vraie page de l'enfant, et on
 * suit le parcours du parent : premier passage, bulles, durée, casque, cours de
 * démonstration, sortie, fin. Le point qui ne doit jamais céder : pendant le
 * tutoriel, on n'entre pas dans un vrai cours.
 */
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import GrilleMatieres from '../components/GrilleMatieres';
import Tutoriel from '../components/tutoriel/Tutoriel';
import { ETAPES, avancement, titreDeLEtape } from '../lib/tutoriel/etapes';
import { SELECTEUR_FENETRES } from '../lib/storage/verrouDefilement';

const ETAT = {
  referentiel: { matieres: [] },
  eleves: {
    liste: [{
      id: 24, prenom: 'Ahmed', niveauLibelle: 'CE1', niveauCycle: 'Primaire',
    }],
  },
  auth: { estAdmin: false },
};

const mockNavigate = jest.fn();
let mockSession = null;

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ hash: '' }),
}));

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => mockSession,
  accueilEleve: (id) => `/eleves/${id}/matieres`,
}));

jest.mock('../lib/api/elevesApi', () => new Proxy({}, {
  get: (cible, nom) => (nom === 'getMatieresEleve'
    ? jest.fn().mockResolvedValue({
      data: [{
        id: 7, code: 'MATHS', libelle: 'Mathématiques', active: true, profPrenom: 'Nora', profAvatar: 'nora',
      }],
    })
    : jest.fn().mockResolvedValue({ data: [] })),
}));

jest.mock('../lib/api/profilApi', () => ({
  getProfil: jest.fn(),
  marquerTutorielVu: jest.fn(),
}));

jest.mock('../lib/hooks/useAccesForfait', () => ({
  __esModule: true,
  default: () => ({ ouvert: true, motif: null }),
  fichesConsultables: () => true,
  messageForfait: () => '',
}));

jest.mock('../lib/actions/referentielActions', () => ({ chargerReferentiel: () => ({ type: 'x' }) }));
jest.mock('../lib/actions/elevesActions', () => ({ chargerEleves: () => ({ type: 'x' }) }));
jest.mock('../lib/api/reglagesApi', () => ({
  getReglagesPublics: () => Promise.resolve({ data: {} }),
}));
jest.mock('../lib/storage/fluxReglages', () => ({ demarrerFluxReglages: () => () => {} }));
jest.mock('../lib/storage/styleSite', () => ({
  appliquerBlueSky: () => {},
  blueSkyEnregistre: () => false,
  saisonEnregistree: () => null,
  saisonValide: () => null,
}));

const { getProfil, marquerTutorielVu } = require('../lib/api/profilApi');

// Dans la bulle seulement : la page a aussi son propre titre « Mes contrôles ».
const titre = (texte) => screen.findByText(texte, { selector: '.tuto__titre' }, { timeout: 4000 });
const suivant = () => fireEvent.click(screen.getByRole('button', { name: /^(Suivant|Commencer)$/ }));

beforeEach(() => {
  mockSession = null;
  mockNavigate.mockClear();
  marquerTutorielVu.mockReset();
  marquerTutorielVu.mockResolvedValue({});
  getProfil.mockReset();
  Element.prototype.scrollIntoView = jest.fn();

  // jsdom ne mesure rien : tout y serait de taille nulle, donc hors de l'écran.
  Element.prototype.getBoundingClientRect = () => ({
    top: 100, bottom: 200, left: 10, right: 110, width: 100, height: 100,
  });
});

test('un parent qui ne l’a jamais vu le voit, et il est noté vu aussitôt', async () => {
  getProfil.mockResolvedValue({ data: { tutorielVu: false } });
  render(<GrilleMatieres />);

  expect(await titre('Bienvenue sur Mimia')).toBeInTheDocument();
  expect(marquerTutorielVu).toHaveBeenCalledTimes(1);
});

test('un parent qui l’a déjà vu ne le voit pas, mais garde le bouton, qui le rejoue', async () => {
  getProfil.mockResolvedValue({ data: { tutorielVu: true } });
  render(<GrilleMatieres />);

  const bouton = await screen.findByRole('button', { name: /Voir le tuto/ });
  await waitFor(() => expect(getProfil).toHaveBeenCalled());
  expect(screen.queryByRole('heading', { name: 'Bienvenue sur Mimia' })).not.toBeInTheDocument();

  fireEvent.click(bouton);
  expect(await titre('Bienvenue sur Mimia')).toBeInTheDocument();

  // Rejouer ne touche pas à la date : la première reste.
  expect(marquerTutorielVu).not.toHaveBeenCalled();
});

test('un enfant connecté avec son code ne déclenche rien tout seul', async () => {
  mockSession = {
    jeton: 'x', eleveId: 24, prenom: 'Ahmed', niveau: 'CE1',
  };
  render(<GrilleMatieres />);

  await screen.findByRole('button', { name: /Voir le tuto/ });
  expect(getProfil).not.toHaveBeenCalled();
});

test('« Passer » referme tout, à tout moment', async () => {
  getProfil.mockResolvedValue({ data: { tutorielVu: false } });
  render(<GrilleMatieres />);

  await titre('Bienvenue sur Mimia');
  fireEvent.click(screen.getByRole('button', { name: 'Passer le tutoriel' }));

  expect(screen.queryByRole('dialog', { name: 'Tutoriel de Mimia' })).not.toBeInTheDocument();
});

test('le parcours complet : jamais de vrai cours', async () => {
  getProfil.mockResolvedValue({ data: { tutorielVu: false } });
  render(<GrilleMatieres />);

  await titre('Bienvenue sur Mimia');
  suivant();

  // Le micro : on peut passer sans l'avoir testé.
  await titre('D’abord, le micro');
  expect(screen.getByRole('button', { name: /Tester mon micro/ })).toBeInTheDocument();
  suivant();

  await titre('Ma carte');
  suivant();
  await titre('Mon calendrier');
  suivant();

  // Le clic sur la vraie carte ouvre la vraie fenêtre des durées.
  await titre('Un professeur par matière');
  fireEvent.click(document.querySelector('[data-tuto="professeur"]'));

  await titre('La durée du cours');
  fireEvent.click(screen.getByRole('button', { name: /25/ }));

  await titre('Le mode casque');
  suivant();
  await titre('Le mode haut-parleur');
  suivant();

  await titre('À vous de choisir');
  fireEvent.click(document.querySelector('.casque-option--oui'));

  // On entre dans la démonstration, pas dans un cours.
  await titre('Vous voici en cours');
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(document.querySelector('[data-tuto-demo]')).toBeInTheDocument();
  expect(document.querySelector('[data-tuto="demo-chrono"]')).toHaveTextContent('25:00');
  suivant();

  await titre('Le temps restant');
  suivant();
  await titre('La pause');
  suivant();
  await titre('La détection automatique de la voix');
  suivant();
  await titre('Envoyer un document');
  suivant();
  await titre('L’appareil photo');
  suivant();
  await titre('Le scanner');
  suivant();
  await titre('Le tableau');
  suivant();

  await titre('Quitter le cours');
  fireEvent.click(document.querySelector('[data-tuto="demo-quitter"]'));

  await titre('Mes contrôles');
  expect(document.querySelector('[data-tuto-demo]')).not.toBeInTheDocument();
  suivant();

  // Pas d'examen pour cette classe : l'étape se saute toute seule.
  await titre('Revoir le tutoriel');
  expect(screen.getByRole('progressbar', { name: 'Avancée du tutoriel' }))
    .toHaveAttribute('aria-valuenow', '100');

  fireEvent.click(screen.getByRole('button', { name: 'Terminer' }));
  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: 'Tutoriel de Mimia' })).not.toBeInTheDocument();
  });

  expect(mockNavigate).not.toHaveBeenCalled();
}, 40000);

test('sans tutoriel, le choix du casque ouvre bien le vrai cours', async () => {
  getProfil.mockResolvedValue({ data: { tutorielVu: true } });
  render(<GrilleMatieres />);

  fireEvent.click(await screen.findByRole('button', { name: /Mathématiques/ }));
  fireEvent.click(await screen.findByRole('button', { name: /25/ }));
  fireEvent.click(document.querySelector('.casque-option--oui'));

  expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('/eleves/24/matieres/7/chat?duree=25&casque=1'));
});

test('le tutoriel ne fige pas la page : il doit pouvoir la faire défiler', () => {
  render(<Tutoriel onFin={() => {}} />);

  // Le verrou global fige la page dès qu'un élément répond à ce sélecteur. C'est ce
  // qui rendait « Mes contrôles » inatteignable en 3e, où il est loin sous l'écran.
  expect(screen.getByRole('dialog', { name: 'Tutoriel de Mimia' }).matches(SELECTEUR_FENETRES)).toBe(false);
});

test.each([
  ['Préparation au brevet'],
  ['Préparation au bac de français et de maths'],
  ['Préparation au bac général'],
  ['Préparation au bac technologique (STMG)'],
])('après le cours, contrôles puis examen, et la bulle porte le titre de la page : %s', async (examen) => {
  // Les longs trajets : toutes les étapes absentes se sautent une à une.
  const titreLointain = (texte) => screen.findByText(
    texte,
    { selector: '.tuto__titre' },
    { timeout: 20000 },
  );

  render(
    <>
      <section id="mes-controles"><h2>Mes contrôles</h2></section>
      <section id="preparation-examen"><h2>{examen}</h2></section>
      <Tutoriel onFin={() => {}} />
    </>,
  );

  suivant();
  await titre('D’abord, le micro');
  suivant();

  await titreLointain('Vous voici en cours');
  suivant();

  await titreLointain('Mes contrôles');
  suivant();

  expect(await titre(examen)).toBeInTheDocument();
}, 40000);

test('sans titre dans la page, la bulle garde le sien', () => {
  const etape = ETAPES.find((e) => e.id === 'examen');

  expect(titreDeLEtape(etape)).toBe('La préparation à l’examen');
  expect(etape.texte).not.toMatch(/brevet|bac/i);
});

test('une cible sous l’écran : pas de bulle perdue, on l’y amène, puis on l’éclaire', async () => {
  const rectangleNormal = Element.prototype.getBoundingClientRect;
  let enBas = true;

  // « Ma carte », loin sous l'écran, comme « Mes contrôles » sur une page de 3e.
  Element.prototype.getBoundingClientRect = () => (enBas
    ? {
      top: 3000, bottom: 3100, left: 10, right: 110, width: 100, height: 100,
    }
    : {
      top: 100, bottom: 200, left: 10, right: 110, width: 100, height: 100,
    });

  render(
    <>
      <a href="/carte" data-tuto="carte">Ma carte</a>
      <Tutoriel onFin={() => {}} />
    </>,
  );

  suivant();
  await titre('D’abord, le micro');
  suivant();

  // Tant qu'elle est hors de l'écran, sa bulle n'existe pas.
  await waitFor(() => {
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });
  expect(screen.queryByText('Ma carte', { selector: '.tuto__titre' })).not.toBeInTheDocument();

  // Le défilement doux n'a rien donné : on y va d'un coup.
  await waitFor(() => {
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  }, { timeout: 2000 });

  enBas = false;
  expect(await titre('Ma carte')).toBeInTheDocument();

  Element.prototype.getBoundingClientRect = rectangleNormal;
});

test('une cible qui ne vient jamais à l’écran fait sauter l’étape : jamais d’écran noir', async () => {
  // « Ma carte » reste hors de l'écran quoi qu'on fasse ; les suivantes n'existent pas.
  Element.prototype.getBoundingClientRect = () => ({
    top: 3000, bottom: 3100, left: 10, right: 110, width: 100, height: 100,
  });

  render(
    <>
      <a href="/carte" data-tuto="carte">Ma carte</a>
      <Tutoriel onFin={() => {}} />
    </>,
  );

  suivant();
  await titre('D’abord, le micro');
  suivant();

  await waitFor(() => {
    expect(screen.getByRole('progressbar', { name: 'Avancée du tutoriel' }).getAttribute('aria-valuenow'))
      .not.toBe(String(avancement(2)));
  }, { timeout: 4000 });
}, 10000);

test('la conseillère d’orientation est présentée avant le choix du professeur', () => {
  const ordre = ETAPES.map((e) => e.id);
  expect(ordre.indexOf('conseillere')).toBeLessThan(ordre.indexOf('professeur'));

  // Elle ne parle pas de la classe : la bulle n'apparaît que là où la carte existe,
  // et « à partir de la 3e » ne dit rien au parent d'un élève de terminale.
  const { texte } = ETAPES.find((e) => e.id === 'conseillere');
  expect(texte).toMatch(/Son rôle/);
  expect(texte).toMatch(/Son objectif/);
  expect(texte).not.toMatch(/\b3e\b|seconde|\bbac\b/);
});

test('la barre de progression va de 0 à 100 %', () => {
  expect(avancement(0)).toBe(0);
  expect(avancement(ETAPES.length - 1)).toBe(100);
  expect(avancement(99)).toBe(100);
});
