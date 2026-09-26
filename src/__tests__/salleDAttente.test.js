/**
 * LA SALLE D'ATTENTE — Camara, le 25/09/2026 : « mettre les personnes dans une
 * file d'attente si le serveur ne supporte pas ».
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Quatre règles qu'on ne pourra pas éprouver en vrai avant le jour d'affluence
 * — c'est-à-dire le jour où il sera trop tard pour s'apercevoir qu'elles ont
 * cédé :
 *
 *   1. TANT QUE LA SALLE EST ÉTEINTE, RIEN NE SE PASSE. Aucun appel au
 *      démarrage, aucun écran, aucun billet. C'est ce qui permet de laisser le
 *      dispositif en place toute l'année sans rien coûter — et le jour où
 *      quelqu'un ajoute « juste une petite vérification au chargement », ce
 *      test doit tomber.
 *
 *   2. LE REFUS DU SERVEUR SUFFIT À ARMER LA FILE. Le billet arrive avec le
 *      503 : l'écran doit s'afficher sans un aller-retour de plus, au moment
 *      précis où le serveur n'en supporterait pas un de plus.
 *
 *   3. LE BILLET REPART SUR CHAQUE APPEL. Sans l'en-tête, celui qui a fait la
 *      queue se fait refouler indéfiniment : il ne sortirait jamais de la
 *      file, quelle que soit la place disponible.
 *
 *   4. ON N'ANNONCE PAS UNE ATTENTE QU'ON NE CONNAÎT PAS. Tant que le serveur
 *      n'a pas vu assez de gens sortir, il renvoie `null` — et l'écran ne doit
 *      alors afficher aucune durée plutôt qu'un chiffre inventé.
 */

import { render, screen, act } from '@testing-library/react';

import VerrouAffluence from '../components/VerrouAffluence';
import {
  enTeteBillet, etatSalle, signalerAffluence,
} from '../lib/affluence/salleDAttente';

let mockChemin = '/';

// Convention de la maison : le routeur est simulé, pas monté.
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockChemin }),
}));

// Le style « Blue Sky » est lu par l'écran d'attente ; il n'est pas le sujet.
jest.mock('../lib/storage/modeTest', () => ({ useBlueSky: () => false }));

const BILLET = '8f14e45f-ceea-467a-9f42-0b3c9d1a2b3c';

beforeEach(() => {
  jest.useFakeTimers();
  window.sessionStorage.clear();
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ salle: true, admis: false, rang: 5, devant: 4, rappelDans: 3 }) }));
});

afterEach(() => {
  // La file garde un minuteur en vie : sans cette purge, un test en armerait
  // le suivant et les échecs deviendraient impossibles à situer.
  act(() => { jest.runOnlyPendingTimers(); });
  jest.useRealTimers();
  delete global.fetch;
});

describe('tant que la salle est éteinte', () => {
  test('aucun billet n’est pris, et rien n’est demandé au serveur', () => {
    expect(enTeteBillet()).toBe('');
    expect(etatSalle().enFile).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('le verrou laisse passer le site', () => {
    render(<VerrouAffluence><p>Le site</p></VerrouAffluence>);

    expect(screen.getByText('Le site')).toBeInTheDocument();
    expect(screen.queryByText(/file d.attente/i)).not.toBeInTheDocument();
  });
});

describe('quand le serveur refuse faute de place', () => {
  test('le rang s’affiche à la place du site, sans appel supplémentaire', () => {
    render(<VerrouAffluence><p>Le site</p></VerrouAffluence>);

    act(() => {
      signalerAffluence({
        code: 'AFFLUENCE', billet: BILLET, rang: 347, devant: 346, rappelDans: 12,
      });
    });

    expect(screen.queryByText('Le site')).not.toBeInTheDocument();
    expect(screen.getByText('347')).toBeInTheDocument();
    expect(screen.getByText('346 personnes devant vous')).toBeInTheDocument();

    // LE BILLET ÉTAIT DANS LE REFUS : rien n'a eu à être redemandé.
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('le billet est conservé, et repart sur les appels suivants', () => {
    act(() => { signalerAffluence({ billet: BILLET, rang: 2, devant: 1, rappelDans: 3 }); });

    expect(enTeteBillet()).toBe(BILLET);
  });

  test('aucune durée n’est annoncée tant que le serveur ne la connaît pas', () => {
    render(<VerrouAffluence><p>Le site</p></VerrouAffluence>);

    act(() => {
      signalerAffluence({ billet: BILLET, rang: 9, devant: 8, attenteSecondes: null, rappelDans: 6 });
    });

    expect(screen.queryByText(/attente estimée/i)).not.toBeInTheDocument();
  });

  test('la durée s’affiche dès que le serveur la donne, et jamais en secondes', () => {
    render(<VerrouAffluence><p>Le site</p></VerrouAffluence>);

    act(() => {
      signalerAffluence({ billet: BILLET, rang: 9, devant: 8, attenteSecondes: 130, rappelDans: 6 });
    });

    expect(screen.getByText(/attente estimée/i)).toBeInTheDocument();
    expect(screen.getByText('environ 3 minutes')).toBeInTheDocument();
  });

  test('« vous êtes le prochain » remplace « 0 personne devant vous »', () => {
    render(<VerrouAffluence><p>Le site</p></VerrouAffluence>);

    act(() => { signalerAffluence({ billet: BILLET, rang: 1, devant: 0, rappelDans: 3 }); });

    expect(screen.getByText('Vous êtes le prochain')).toBeInTheDocument();
  });
});

describe('la relance', () => {
  test('le serveur fixe le rythme, et le navigateur ne devance pas l’heure', async () => {
    act(() => { signalerAffluence({ billet: BILLET, rang: 5, devant: 4, rappelDans: 10 }); });

    // Bien avant l'heure dite : personne ne doit avoir bougé.
    act(() => { jest.advanceTimersByTime(9_000); });
    expect(global.fetch).not.toHaveBeenCalled();

    // LE DÉCALAGE ALÉATOIRE VA JUSQU'À +30 % : on laisse passer la fenêtre
    // entière. C'est lui qui empêche mille navigateurs de revenir à la même
    // seconde, et c'est pour cela qu'on ne teste pas une heure exacte.
    act(() => { jest.advanceTimersByTime(5_000); });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toContain('/affluence/billet');
    expect(global.fetch.mock.calls[0][0]).toContain(BILLET);
  });

  test('admis, l’écran rend la main au site', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ salle: true, admis: true, billet: BILLET }) }));

    render(<VerrouAffluence><p>Le site</p></VerrouAffluence>);

    act(() => { signalerAffluence({ billet: BILLET, rang: 1, devant: 0, rappelDans: 3 }); });
    expect(screen.queryByText('Le site')).not.toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    expect(screen.getByText('Le site')).toBeInTheDocument();
  });
});

describe('les adresses qui restent ouvertes', () => {
  test('le retour du serveur d’identité n’est jamais couvert par la file', () => {
    mockChemin = '/callback';

    render(<VerrouAffluence><p>Retour de connexion</p></VerrouAffluence>);

    act(() => { signalerAffluence({ billet: BILLET, rang: 99, devant: 98, rappelDans: 6 }); });

    // COUVRIR CETTE PAGE LAISSERAIT LA SESSION À MOITIÉ ÉTABLIE, et le
    // visiteur reviendrait se connecter en boucle sans jamais aboutir.
    expect(screen.getByText('Retour de connexion')).toBeInTheDocument();

    mockChemin = '/';
  });
});
