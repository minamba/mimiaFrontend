/**
 * SIGNALEMENT #65 v2 (23/11/2026) — LES RELECTURES APRÈS « QUITTER » SONT VRAIMENT SILENCIEUSES.
 *
 * Contrôle d'Omar sur la v1 : une relecture ratée (500, coupure, délai) remplaçait toute la fiche de l'examen blanc
 * par « Cet examen blanc n'a pas pu être chargé. » (test E), vidait les cartes de l'accueil (test D) ou affichait un
 * bandeau définitif sur la fiche d'un contrôle. Une réponse arrivée après qu'on a quitté la page s'écrivait quand même.
 *
 * Ici :
 * 1. le hook : `vivant()` passe à faux au démontage et au changement de clé ; démontée, la page ne fait plus d'appel ;
 * 2. accueil ET fiche de l'examen blanc ET fiche d'un contrôle : relecture en échec puis réussie → aucun écran
 *    d'erreur, les cartes restent, puis le nouveau verdict s'affiche ; une erreur de CHARGEMENT s'efface au succès ;
 * 3. « Mes contrôles » : la réponse d'une relecture partie sur un onglet qu'on a quitté est ignorée ;
 * 4. la sortie est notée par Chat sur TOUS les chemins qui déposent la séance dans la file de conclusion.
 */

import fs from 'fs';
import path from 'path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import useRelectureApresSeance from '../lib/hooks/useRelectureApresSeance';
import {
  noterSortieDeSeance, relecturesRestantes, sortirDeSeance,
} from '../lib/storage/sortieDeSeance';

// ------------------------------------------------------------------ simulacres

const ETAT = {
  referentiel: { matieres: [] },
  eleves: { liste: [] },
  auth: { estAdmin: false },
};

let mockParams = { eleveId: '33' };

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => mockParams,
  useNavigate: () => mockNaviguer,
  useLocation: () => ({ hash: '' }),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

const mockNaviguer = jest.fn();

jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 33, prenom: 'Test', niveau: '3e' }),
  accueilEleve: (id) => `/eleves/${id}/matieres`,
}));

// Les appels qu'on pilote ; tout le reste de l'API élève répond « rien ».
const mockApi = {};
jest.mock('../lib/api/elevesApi', () => new Proxy({}, {
  get: (_, nom) => mockApi[nom] ?? (() => Promise.resolve({ data: [] })),
}));

jest.mock('../lib/api/examensBlancsApi', () => ({
  getExamensBlancs: (...a) => mockApi.getExamensBlancs(...a),
  getTypeExamenBlanc: () => Promise.resolve({ data: { type: 'brevet', libelle: 'Brevet blanc' } }),
  getExamenBlanc: (...a) => mockApi.getExamenBlanc(...a),
  retirerMatiereExamenBlanc: () => Promise.resolve({}),
  supprimerExamenBlanc: () => Promise.resolve({}),
}));

jest.mock('../lib/actions/referentielActions', () => ({ chargerReferentiel: () => ({ type: 'x' }) }));
jest.mock('../lib/actions/elevesActions', () => ({ chargerEleves: () => ({ type: 'x' }) }));
jest.mock('../lib/api/reglagesApi', () => ({ getReglagesPublics: () => Promise.resolve({ data: {} }) }));
jest.mock('../lib/storage/fluxReglages', () => ({ demarrerFluxReglages: () => () => {} }));
jest.mock('../lib/storage/styleSite', () => ({
  appliquerBlueSky: () => {},
  blueSkyEnregistre: () => false,
  saisonEnregistree: () => null,
  saisonValide: () => null,
}));

// ------------------------------------------------------------------ données

const dansJours = (n) => `${new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)}T00:00:00`;

/** Le brevet blanc d'Adam (Maths + Français). */
const brevet = (statutMaths) => ({
  id: 1,
  type: 'brevet',
  libelle: 'Brevet blanc',
  dateExamen: dansJours(17),
  effacementLe: dansJours(60),
  heureExamen: null,
  pourcent: 30,
  matieres: [
    {
      id: 11, matiereId: 1, matiereLibelle: 'Mathématiques', controleId: 501, programmeValide: true,
      documents: [], dossiers: [], dossiersAJour: true,
      preparation: { pourcent: 60, perimetreConnu: true, pretStatut: statutMaths, commence: true, notions: [] },
    },
    {
      id: 12, matiereId: 2, matiereLibelle: 'Français', controleId: null, programmeValide: false,
      documents: [], dossiers: [], dossiersAJour: true, preparation: null,
    },
  ],
});

const CONTROLE = (sujet, statut = 'pas-pret') => ({
  id: 42,
  matiereId: 1,
  matiereLibelle: 'Mathématiques',
  sujet,
  dateControle: dansJours(5),
  joursRestants: 5,
  nombrePreparations: 1,
  preparation: {
    pourcent: 60, perimetreConnu: true, total: 3, acquises: 1, notions: [], pretStatut: statut,
  },
});

const PANNE = () => Promise.reject(Object.assign(new Error('500'), { response: { status: 500 } }));

/** Une suite de réponses, une par appel ; la dernière se répète. */
const suite = (...reponses) => {
  let i = 0;
  return jest.fn(() => {
    const r = reponses[Math.min(i, reponses.length - 1)];
    i += 1;
    return r();
  });
};
const ok = (data) => () => Promise.resolve({ data });

/** Une promesse qu'on résout à la main : la réponse « en vol ». */
const enVol = () => {
  let resoudre;
  const promesse = new Promise((r) => { resoudre = r; });
  return { promesse, resoudre };
};

const vider = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); };
const avancer = async (ms) => { await act(async () => { jest.advanceTimersByTime(ms); }); await vider(); };

beforeEach(() => {
  jest.useFakeTimers();
  window.sessionStorage.clear();
  mockParams = { eleveId: '33' };
  mockNaviguer.mockReset();
  Object.keys(mockApi).forEach((k) => delete mockApi[k]);
});

afterEach(() => {
  jest.useRealTimers();
});

// ------------------------------------------------------------------ 1. le hook

function Sonde({ cle, relire }) {
  useRelectureApresSeance(relire, cle);
  return null;
}

describe('useRelectureApresSeance', () => {
  test('démontée, la page ne fait plus aucun appel', async () => {
    noterSortieDeSeance();
    const relire = jest.fn();

    const { unmount } = render(<Sonde cle="a" relire={relire} />);
    await avancer(3000);
    expect(relire).toHaveBeenCalledTimes(1);

    unmount();
    await avancer(120000);
    expect(relire).toHaveBeenCalledTimes(1);
  });

  test('vivant() est vrai pendant la vie de la page, faux après son démontage', async () => {
    noterSortieDeSeance();
    let vivant = null;

    const { unmount } = render(<Sonde cle="a" relire={(v) => { vivant = v; }} />);
    await avancer(3000);
    expect(vivant()).toBe(true);

    unmount();
    expect(vivant()).toBe(false);
  });

  test('vivant() passe à faux quand la clé change (autre fiche) : la réponse de l’ancienne est ignorable', async () => {
    noterSortieDeSeance();
    const recus = [];

    const { rerender } = render(<Sonde cle="examen-1" relire={(v) => recus.push(v)} />);
    await avancer(3000);
    rerender(<Sonde cle="examen-2" relire={(v) => recus.push(v)} />);

    expect(recus[0]()).toBe(false);
  });

  test('sans sortie de séance, aucun minuteur', async () => {
    const relire = jest.fn();
    render(<Sonde cle="a" relire={relire} />);
    await avancer(120000);
    expect(relire).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------------ 2. accueil

describe('accueil (GrilleMatieres) : relecture en échec puis réussie', () => {
  // eslint-disable-next-line global-require
  const GrilleMatieres = require('../components/GrilleMatieres').default;

  test('l’échec ne vide ni les contrôles ni les examens blancs ; la réussite suivante montre le verdict', async () => {
    noterSortieDeSeance();
    mockApi.getControles = suite(ok([CONTROLE('Les fractions')]), PANNE, ok([CONTROLE('Les fractions')]));
    mockApi.getExamensBlancs = suite(ok([brevet('pas-pret')]), PANNE, ok([brevet('bientot')]));
    mockApi.getExamen = suite(ok({ examen: null }), PANNE, ok({ examen: null }));

    render(<GrilleMatieres />);
    await vider();
    expect(await screen.findByText('Les fractions')).toBeInTheDocument();
    expect(screen.getAllByText('Pas encore prêt').length).toBeGreaterThan(0);

    // 3 s : la relecture rate partout.
    await avancer(3000);
    expect(mockApi.getControles).toHaveBeenCalledTimes(2);
    expect(mockApi.getExamensBlancs).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Les fractions')).toBeInTheDocument();
    expect(screen.queryByText(/Pas encore de contrôle prévu/)).not.toBeInTheDocument();
    expect(screen.getAllByText('Pas encore prêt').length).toBeGreaterThan(0);

    // 6 s : elle réussit, la conclusion est arrivée.
    await avancer(3000);
    expect(screen.getByText('Les fractions')).toBeInTheDocument();
    expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
  });

  test('démontée, l’accueil ne relit plus rien (aucun appel en 2 min)', async () => {
    noterSortieDeSeance();
    mockApi.getControles = suite(ok([]));
    mockApi.getExamensBlancs = suite(ok([brevet('pas-pret')]));
    mockApi.getExamen = suite(ok({ examen: null }));

    const { unmount } = render(<GrilleMatieres />);
    await vider();
    unmount();
    await avancer(120000);

    expect(mockApi.getControles).toHaveBeenCalledTimes(1);
    expect(mockApi.getExamensBlancs).toHaveBeenCalledTimes(1);
    expect(mockApi.getExamen).toHaveBeenCalledTimes(1);
  });
});

// ------------------------------------------------------------------ 2 bis. fiche de l'examen blanc (test E d'Omar)

describe('fiche de l’examen blanc : relecture en échec puis réussie', () => {
  // eslint-disable-next-line global-require
  const ExamenBlancFiche = require('../components/ExamenBlancFiche').default;

  beforeEach(() => { mockParams = { eleveId: '33', examenId: '1' }; });

  test('l’échec ne remplace pas la page ; la réussite suivante montre le verdict', async () => {
    noterSortieDeSeance();
    mockApi.getExamenBlanc = suite(ok(brevet('pas-pret')), PANNE, ok(brevet('bientot')));

    render(<ExamenBlancFiche />);
    expect(await screen.findByText('Pas encore prêt')).toBeInTheDocument();

    await avancer(3000);
    expect(mockApi.getExamenBlanc).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/n’a pas pu être chargé/)).not.toBeInTheDocument();
    expect(screen.getByText('Pas encore prêt')).toBeInTheDocument();

    await avancer(3000);
    expect(screen.queryByText(/n’a pas pu être chargé/)).not.toBeInTheDocument();
    expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
  });

  test('une erreur de chargement s’efface dès qu’une relecture réussit', async () => {
    noterSortieDeSeance();
    mockApi.getExamenBlanc = suite(PANNE, ok(brevet('bientot')));

    render(<ExamenBlancFiche />);
    expect(await screen.findByText('Cet examen blanc n’a pas pu être chargé.')).toBeInTheDocument();

    await avancer(3000);
    expect(screen.queryByText(/n’a pas pu être chargé/)).not.toBeInTheDocument();
    expect(screen.getByText('Bientôt prêt')).toBeInTheDocument();
  });

  test('un 404 en relecture renvoie toujours aux contrôles (examen supprimé)', async () => {
    noterSortieDeSeance();
    mockApi.getExamenBlanc = suite(
      ok(brevet('pas-pret')),
      () => Promise.reject(Object.assign(new Error('404'), { response: { status: 404 } })),
    );

    render(<ExamenBlancFiche />);
    await screen.findByText('Pas encore prêt');
    await avancer(3000);

    expect(mockNaviguer).toHaveBeenCalledWith('/eleves/33/matieres#mes-controles', { replace: true });
  });

  test('la réponse d’une relecture arrivée APRÈS le départ de la fiche est ignorée', async () => {
    noterSortieDeSeance();
    const vol = enVol();
    mockApi.getExamenBlanc = suite(
      ok(brevet('pas-pret')),
      () => vol.promesse,
    );

    const { unmount } = render(<ExamenBlancFiche />);
    await screen.findByText('Pas encore prêt');
    await avancer(3000);
    unmount();

    // Un 404 tardif ne doit plus faire naviguer une page qu'on a quittée.
    await act(async () => {
      vol.resoudre(Promise.reject(Object.assign(new Error('404'), { response: { status: 404 } })));
    });
    await vider();
    expect(mockNaviguer).not.toHaveBeenCalled();
  });
});

// ------------------------------------------------------------------ 2 ter. fiche d'un contrôle

describe('fiche d’un contrôle : relecture en échec puis réussie', () => {
  // eslint-disable-next-line global-require
  const ControleFiche = require('../components/ControleFiche').default;

  beforeEach(() => { mockParams = { eleveId: '33', controleId: '42' }; });

  test('l’échec n’affiche aucun bandeau ; la fiche reste', async () => {
    noterSortieDeSeance();
    mockApi.getControle = suite(ok(CONTROLE('Les fractions')), PANNE, ok(CONTROLE('Les fractions')));

    render(<ControleFiche />);
    expect((await screen.findAllByText(/Les fractions/)).length).toBeGreaterThan(0);

    await avancer(3000);
    expect(mockApi.getControle).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(/n'a pas pu être chargé/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Les fractions/).length).toBeGreaterThan(0);

    await avancer(3000);
    expect(screen.queryByText(/n'a pas pu être chargé/)).not.toBeInTheDocument();
  });

  test('une erreur de chargement s’efface dès qu’une relecture réussit', async () => {
    noterSortieDeSeance();
    mockApi.getControle = suite(PANNE, ok(CONTROLE('Les fractions')));

    render(<ControleFiche />);
    expect(await screen.findByText("Ce contrôle n'a pas pu être chargé.")).toBeInTheDocument();

    await avancer(3000);
    expect(screen.queryByText(/n'a pas pu être chargé/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Les fractions/).length).toBeGreaterThan(0);
  });
});

// ------------------------------------------------------------------ 3. « Mes contrôles » : l'onglet a changé

describe('« Mes contrôles » (ControlesEleve)', () => {
  // eslint-disable-next-line global-require
  const ControlesEleve = require('../components/ControlesEleve').default;

  test('une relecture partie sur « À venir » ne remplit pas « Passés »', async () => {
    noterSortieDeSeance();
    const vol = enVol();
    let appelsAvenir = 0;
    mockApi.getControles = jest.fn((_, onglet) => {
      if (onglet === 'passes') return Promise.resolve({ data: [CONTROLE('Contrôle passé')] });
      appelsAvenir += 1;
      return appelsAvenir === 1 ? Promise.resolve({ data: [CONTROLE('Contrôle à venir')] }) : vol.promesse;
    });
    mockApi.getExamensBlancs = suite(ok([]));

    render(<ControlesEleve />);
    expect(await screen.findByText('Contrôle à venir')).toBeInTheDocument();

    // 3 s : la relecture part sur « À venir »… puis l'enfant passe sur « Passés » avant qu'elle revienne.
    await avancer(3000);
    fireEvent.click(screen.getByRole('tab', { name: 'Passés' }));
    expect(await screen.findByText('Contrôle passé')).toBeInTheDocument();

    await act(async () => { vol.resoudre({ data: [CONTROLE('Contrôle à venir')] }); });
    await vider();

    expect(screen.getByText('Contrôle passé')).toBeInTheDocument();
    expect(screen.queryByText('Contrôle à venir')).not.toBeInTheDocument();
  });

  test('une relecture ratée ne fait apparaître aucun bandeau et garde la liste', async () => {
    noterSortieDeSeance();
    mockApi.getControles = suite(ok([CONTROLE('Contrôle à venir')]), PANNE);
    mockApi.getExamensBlancs = suite(ok([]), PANNE);

    render(<ControlesEleve />);
    expect(await screen.findByText('Contrôle à venir')).toBeInTheDocument();

    await avancer(3000);
    expect(screen.getByText('Contrôle à venir')).toBeInTheDocument();
    expect(screen.queryByText(/n'ont pas pu être chargés/)).not.toBeInTheDocument();
  });
});

// ------------------------------------------------------------------ 4. la sortie notée par Chat

describe('la sortie de séance est notée par Chat', () => {
  test('sortirDeSeance note l’heure AVANT de prévenir le serveur, et rend sa réponse', async () => {
    let noteeAuMomentDeLAppel = null;
    const prevenir = jest.fn((id) => {
      noteeAuMomentDeLAppel = relecturesRestantes().length > 0;
      return Promise.resolve({ id });
    });

    const reponse = await sortirDeSeance(prevenir, 77);

    expect(prevenir).toHaveBeenCalledWith(77);
    expect(noteeAuMomentDeLAppel).toBe(true);
    expect(reponse).toEqual({ id: 77 });
  });

  test('même si le serveur refuse, la sortie reste notée (la conclusion a pu partir)', async () => {
    await expect(sortirDeSeance(() => Promise.reject(new Error('coupure')), 77)).rejects.toThrow('coupure');
    expect(relecturesRestantes().length).toBeGreaterThan(0);
  });

  test('Chat.js : chaque appel qui dépose la séance dans la file de conclusion passe par sortirDeSeance', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'components', 'Chat.js'), 'utf8');

    // « Quitter », l'au revoir, « Encore une séance ».
    expect(source.match(/sortirDeSeance\(quitterCours, conversation\.id\)/g)).toHaveLength(3);
    // L'échéance du forfait (`MarquerSortieAsync` côté serveur).
    expect(source.match(/sortirDeSeance\(terminerForfait, conversation\.id\)/g)).toHaveLength(1);
    // L'onglet fermé (`MarquerFermetureAsync`).
    expect(source.match(/sortirDeSeance\(signalerFermeture, conversation\.id\)/g)).toHaveLength(1);

    // Aucun appel direct qui l'oublierait.
    expect(source).not.toMatch(/[^(\w]quitterCours\(/);
    expect(source).not.toMatch(/[^(\w]terminerForfait\(/);
    expect(source).not.toMatch(/[^(\w]signalerFermeture\(/);
  });
});
