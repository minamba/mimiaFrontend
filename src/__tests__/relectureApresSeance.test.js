/**
 * SIGNALEMENT #65 (23/11/2026) — LA CARTE DU BREVET BLANC JUSTE APRÈS « QUITTER ».
 *
 * Adam : « carte à 30 % mais pastille "Pas encore prêt" », alors que la page de l'examen blanc (et l'API) disaient
 * « Bientôt prêt » quelques secondes plus tard ; la carte ne changeait qu'après un rechargement.
 *
 * CAUSE : « Quitter » dépose la séance dans une file ; le professeur la conclut EN ARRIÈRE-PLAN (appel au modèle) et
 * c'est cette conclusion qui écrit le verdict. L'accueil, monté avant, ne se relisait qu'au retour d'onglet ou de
 * focus — jamais lors d'une navigation interne.
 *
 * Ces tests montent la VRAIE grille de l'accueil, avec une API dont le verdict change après le montage, comme en
 * production : sans sortie de séance notée, aucune relecture (et la carte reste fausse — c'est le bug) ; avec, la
 * pastille suit le serveur sans rechargement.
 */

import { act, render, screen } from '@testing-library/react';
import GrilleMatieres from '../components/GrilleMatieres';
import {
  noterSortieDeSeance, relecturesRestantes, RELECTURES_MS,
} from '../lib/storage/sortieDeSeance';

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
  useParams: () => ({ eleveId: '33' }),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ hash: '' }),
}));

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 33, prenom: 'Test', niveau: '3e' }),
  accueilEleve: (id) => `/eleves/${id}/matieres`,
}));

jest.mock('../lib/api/elevesApi', () => new Proxy({}, {
  get: () => jest.fn().mockResolvedValue({ data: [] }),
}));

jest.mock('../lib/api/examensBlancsApi', () => ({
  getExamensBlancs: jest.fn(),
  getTypeExamenBlanc: jest.fn().mockResolvedValue({ data: { type: 'brevet', libelle: 'Brevet blanc' } }),
}));

jest.mock('../lib/actions/referentielActions', () => ({ chargerReferentiel: () => ({ type: 'x' }) }));
jest.mock('../lib/actions/elevesActions', () => ({ chargerEleves: () => ({ type: 'x' }) }));
jest.mock('../lib/api/reglagesApi', () => ({ getReglagesPublics: jest.fn().mockResolvedValue({ data: {} }) }));
jest.mock('../lib/storage/fluxReglages', () => ({ demarrerFluxReglages: () => () => {} }));
jest.mock('../lib/storage/styleSite', () => ({
  appliquerBlueSky: () => {},
  blueSkyEnregistre: () => false,
  saisonEnregistree: () => null,
  saisonValide: () => null,
}));

const { getExamensBlancs, getTypeExamenBlanc } = require('../lib/api/examensBlancsApi');
const { getReglagesPublics } = require('../lib/api/reglagesApi');

/** Le brevet blanc d'Adam : Maths + Français, le 10/12 — ici dans 17 jours, pour rester « à venir ». */
const brevet = (statutMaths) => {
  const date = new Date(Date.now() + 17 * 86400000).toISOString().slice(0, 10);
  return {
    id: 1,
    type: 'brevet',
    libelle: 'Brevet blanc',
    dateExamen: `${date}T00:00:00`,
    heureExamen: null,
    pourcent: 30,
    matieres: [
      {
        id: 11, matiereId: 1, matiereLibelle: 'Mathématiques', controleId: 501, programmeValide: true,
        documents: [], dossiers: [],
        preparation: { pourcent: 60, perimetreConnu: true, pretStatut: statutMaths, commence: true, notions: [] },
      },
      {
        id: 12, matiereId: 2, matiereLibelle: 'Français', controleId: null, programmeValide: false,
        documents: [], dossiers: [], preparation: null,
      },
    ],
  };
};

/** Le serveur : « Pas encore prêt » au premier appel (le verdict d'avant), « Bientôt prêt » une fois la séance conclue. */
const serveurQuiConclutApres = () => {
  let appels = 0;
  getExamensBlancs.mockImplementation(() => {
    appels += 1;
    return Promise.resolve({ data: [brevet(appels === 1 ? 'pas-pret' : 'bientot')] });
  });
};

const vider = async () => { await act(async () => { await Promise.resolve(); }); };

beforeEach(() => {
  jest.useFakeTimers();
  window.sessionStorage.clear();
  getExamensBlancs.mockReset();
  // CRA remet les mocks à zéro avant chaque test : les réponses fixes se reposent ici.
  getTypeExamenBlanc.mockResolvedValue({ data: { type: 'brevet', libelle: 'Brevet blanc' } });
  getReglagesPublics.mockResolvedValue({ data: {} });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('sortieDeSeance', () => {
  test('sans sortie notée, aucune relecture', () => {
    expect(relecturesRestantes()).toEqual([]);
  });

  test('juste après la sortie, toutes les relectures restent', () => {
    noterSortieDeSeance(1000);
    expect(relecturesRestantes(1000)).toEqual(RELECTURES_MS);
  });

  test('les délais se comptent depuis la sortie, et s’arrêtent après 90 s', () => {
    noterSortieDeSeance(0);
    expect(relecturesRestantes(12000)).toEqual([3000, 13000, 28000, 48000, 78000]);
    expect(relecturesRestantes(90000)).toEqual([]);
    expect(relecturesRestantes(600000)).toEqual([]);
  });

  test('une sortie « dans le futur » (horloge changée) ne déclenche rien', () => {
    noterSortieDeSeance(50000);
    expect(relecturesRestantes(10000)).toEqual([]);
  });

  test('une valeur illisible ne déclenche rien', () => {
    window.sessionStorage.setItem('mimia.seance.sortie', 'n’importe quoi');
    expect(relecturesRestantes()).toEqual([]);
  });
});

describe('la carte du brevet blanc sur l’accueil (#65)', () => {
  test('après « Quitter », la pastille suit le verdict écrit en arrière-plan, sans rechargement', async () => {
    serveurQuiConclutApres();
    noterSortieDeSeance();

    render(<GrilleMatieres />);
    await vider();

    // Le retour sur l'accueil : le verdict d'avant, comme sur la capture 11 d'Adam.
    expect(await screen.findByText('Pas encore prêt')).toBeInTheDocument();

    // La conclusion est arrivée côté serveur : la première relecture (3 s) la montre.
    await act(async () => { jest.advanceTimersByTime(3000); });
    await vider();

    expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
    expect(screen.queryByText('Pas encore prêt')).not.toBeInTheDocument();
  });

  test('les relectures s’arrêtent après 90 s', async () => {
    serveurQuiConclutApres();
    noterSortieDeSeance();

    render(<GrilleMatieres />);
    await vider();
    await act(async () => { jest.advanceTimersByTime(90000); });
    await vider();
    const apres90 = getExamensBlancs.mock.calls.length;

    // 1 au montage + 8 relectures.
    expect(apres90).toBe(1 + RELECTURES_MS.length);

    await act(async () => { jest.advanceTimersByTime(600000); });
    expect(getExamensBlancs.mock.calls.length).toBe(apres90);
  });

  test('une visite ordinaire (pas de sortie de séance) ne relit rien de plus', async () => {
    serveurQuiConclutApres();

    render(<GrilleMatieres />);
    await vider();
    expect(await screen.findByText('Pas encore prêt')).toBeInTheDocument();

    await act(async () => { jest.advanceTimersByTime(120000); });
    await vider();

    expect(getExamensBlancs).toHaveBeenCalledTimes(1);
  });
});
