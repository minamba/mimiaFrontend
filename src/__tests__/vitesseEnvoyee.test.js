import { voixService } from '../lib/storage/voixService';
import { DEBUT_ECOUTE, FIN_ECOUTE } from '../lib/storage/ardoise';

/**
 * LA VITESSE CHOISIE PART VRAIMENT AVEC LE PASSAGE.
 *
 * Relevé par Camara le 12/09/2026 : « j'ai mis très lent et rapide, la vitesse
 * est la même ». Ce test tient le seul bout de la chaîne que le navigateur
 * gouverne : ce qu'il ENVOIE à la synthèse. Si la vitesse est bien dans la
 * requête, le défaut est ailleurs — et ce test le dira une fois pour toutes.
 */

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

let horloge;
let envois;

class FausseSource {
  connect(suite) { return suite; }

  start() {}

  stop() {}
}

class FauxContexte {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }

  get currentTime() { return horloge; }

  createBuffer(canaux, longueur, frequence) {
    const donnees = new Float32Array(longueur);
    return { donnees, duration: longueur / frequence, getChannelData: () => donnees };
  }

  createBiquadFilter() {
    return { type: null, frequency: { value: 0 }, connect: (suite) => suite };
  }

  createGain() {
    return {
      gain: {
        value: 1,
        cancelScheduledValues() {},
        setValueAtTime() {},
        linearRampToValueAtTime() {},
      },
      connect: (suite) => suite,
    };
  }

  createBufferSource() { return new FausseSource(); }

  resume() { return Promise.resolve(); }
}

const fluxDe = (blocs) => {
  let i = 0;
  return {
    getReader: () => ({
      read: () => Promise.resolve(
        i < blocs.length ? { done: false, value: blocs[i++] } : { done: true },
      ),
    }),
  };
};

const attendre = async (condition, tours = 400) => {
  for (let i = 0; i < tours; i += 1) {
    if (condition()) return;
    horloge += 1;
    jest.advanceTimersByTime(1000);
    for (let k = 0; k < 6; k += 1) await Promise.resolve();
  }
};

beforeEach(() => {
  jest.useFakeTimers();
  horloge = 0;
  envois = [];

  window.AudioContext = FauxContexte;
  global.AbortController = class { constructor() { this.signal = {}; } abort() {} };

  global.fetch = jest.fn((url, options) => {
    envois.push(JSON.parse(options.body));
    return Promise.resolve({ ok: true, status: 200, body: fluxDe([new Uint8Array(4000)]) });
  });

  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete global.fetch;
});

const dire = async (lecteur, texte) => {
  lecteur.alimenter(texte);
  lecteur.terminer();
  await attendre(() => envois.length >= 2);
  lecteur.arreter();
};

test('le passage à écouter part avec la vitesse choisie', async () => {
  const lecteur = voixService.creerLecteur();
  lecteur.vitesseEcoute = 'tres_lent';

  await dire(
    lecteur,
    `Écoute bien.${DEBUT_ECOUTE.en}The cat is sleeping on the table.${FIN_ECOUTE}`,
  );

  const passage = envois.find((e) => e.langue === 'en');

  expect(passage).toBeTruthy();
  expect(passage.vitesse).toBe('tres_lent');
});

test('l\'explication en français garde le débit habituel', async () => {
  const lecteur = voixService.creerLecteur();
  lecteur.vitesseEcoute = 'rapide';

  await dire(
    lecteur,
    `Écoute bien.${DEBUT_ECOUTE.en}The cat sleeps.${FIN_ECOUTE}`,
  );

  const annonce = envois.find((e) => !e.langue);

  expect(annonce).toBeTruthy();
  expect(annonce.vitesse).toBeNull();
});

test('sans choix, la vitesse reste « normal »', async () => {
  const lecteur = voixService.creerLecteur();

  await dire(lecteur, `Écoute.${DEBUT_ECOUTE.es}El gato duerme.${FIN_ECOUTE}`);

  expect(envois.find((e) => e.langue === 'es').vitesse).toBe('normal');
});
