/**
 * UNE DICTÉE DE MOTS AU CLAVIER, MOT PAR MOT — relevé par Camara le
 * 01/11/2026 : « le deuxième mot est toujours répété deux fois ». On rejoue la
 * dictée dans le banc d'essai de la voix, Entrée après chaque mot, et on
 * compte ce qui est prononcé et ce qui est joué.
 */
import { voixService } from '../lib/storage/voixService';
import { DEBUT_DICTEE, FIN_DICTEE } from '../lib/storage/ardoise';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

let horloge;
let prononces;
let demarrages;

class FausseSource {
  constructor() { this.buffer = null; }

  connect(suite) { return suite; }

  start() { demarrages.push(this.buffer?.duration ?? 0); }

  stop() {}
}

class FauxContexte {
  constructor() { this.state = 'running'; this.destination = {}; }

  get currentTime() { return horloge; }

  createBuffer(canaux, longueur, frequence) {
    const donnees = new Float32Array(longueur);
    return { donnees, duration: longueur / frequence, getChannelData: () => donnees };
  }

  createBiquadFilter() { return { type: null, frequency: { value: 0 }, connect: (suite) => suite }; }

  createGain() {
    return {
      gain: { value: 1, cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {} },
      connect: (suite) => suite,
    };
  }

  createBufferSource() { return new FausseSource(); }

  resume() { return Promise.resolve(); }
}

function fluxDe(blocs) {
  let i = 0;
  return {
    getReader: () => ({
      read: () => Promise.resolve(i < blocs.length ? { done: false, value: blocs[i++] } : { done: true }),
    }),
  };
}

const attendre = async (condition, tours = 200) => {
  for (let i = 0; i < tours; i += 1) {
    if (condition()) return;
    horloge += 1;
    jest.advanceTimersByTime(1000);
    for (let k = 0; k < 6; k += 1) await Promise.resolve();
  }
};

// Un son d'une longueur propre à chaque texte : on reconnaît ce qui est joué.
const dureeDe = (texte) => (2000 + texte.length * 100) / 2 / 24000;
const MOTS = ['un.', 'deux.', 'trois.'];

beforeEach(() => {
  jest.useFakeTimers();
  horloge = 0;
  prononces = [];
  demarrages = [];
  window.AudioContext = FauxContexte;
  global.AbortController = class { constructor() { this.signal = {}; } abort() {} };
  global.fetch = jest.fn((url, options) => {
    const charge = JSON.parse(options.body);
    prononces.push(charge.texte);
    return Promise.resolve({
      ok: true, status: 200, body: fluxDe([new Uint8Array(2000 + charge.texte.length * 100)]),
    });
  });
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete global.fetch;
});

const lecteurAuClavier = () => {
  const lecteur = voixService.creerLecteur();
  lecteur.configurer({ age: 6, niveau: 'CP' });
  lecteur.supportDictee = 'clavier';
  lecteur.dicteeDeMots = true;
  return lecteur;
};

const dicter = (lecteur) => {
  lecteur.alimenter(`Tu l’écris où ?\n\n${DEBUT_DICTEE}\nun.\ndeux.\ntrois.\n${FIN_DICTEE}`);
  lecteur.terminer();
};

const verifier = () => {
  expect(prononces.filter((t) => MOTS.includes(t))).toEqual(MOTS);
  expect(prononces).toContain('Je commence. Premier mot.');
  expect(prononces).toContain("Voilà, c'était le dernier mot.");
  MOTS.forEach((mot) => {
    expect(demarrages.filter((d) => Math.abs(d - dureeDe(mot)) < 1e-6)).toHaveLength(1);
  });
};

test('l’enfant valide quand la voix l’attend : chaque mot une seule fois', async () => {
  const lecteur = lecteurAuClavier();
  const pauses = [];
  lecteur.surPauseDictee = (active) => { pauses.push(active); };
  dicter(lecteur);

  for (let n = 1; n <= MOTS.length; n += 1) {
    // eslint-disable-next-line no-await-in-loop
    await attendre(() => prononces.filter((t) => MOTS.includes(t)).length >= n
      && pauses.filter(Boolean).length >= n);
    lecteur.noterCopie(n, n);
  }

  await attendre(() => prononces.some((t) => t.startsWith("C'est fini")));
  verifier();
});

test('l’enfant valide AVANT la fin de la pause : chaque mot une seule fois', async () => {
  const lecteur = lecteurAuClavier();
  lecteur.surPauseDictee = () => {};
  dicter(lecteur);

  for (let n = 1; n <= MOTS.length; n += 1) {
    // Dès que le mot est demandé à la synthèse — avant même d'être entendu.
    // eslint-disable-next-line no-await-in-loop
    await attendre(() => prononces.filter((t) => MOTS.includes(t)).length >= n);
    lecteur.noterCopie(n, n);
  }

  await attendre(() => prononces.some((t) => t.startsWith("C'est fini")));
  verifier();
});

test('le texte arrive en deux morceaux, coupé après le deuxième mot : chaque mot une seule fois', async () => {
  const lecteur = lecteurAuClavier();
  lecteur.surPauseDictee = () => {};

  lecteur.alimenter(`Tu l’écris où ?\n\n${DEBUT_DICTEE}\nun.\ndeux.`);
  jest.advanceTimersByTime(2000);
  await Promise.resolve();
  lecteur.alimenter(`\ntrois.\n${FIN_DICTEE}`);
  lecteur.terminer();

  for (let n = 1; n <= MOTS.length; n += 1) {
    // eslint-disable-next-line no-await-in-loop
    await attendre(() => prononces.filter((t) => MOTS.includes(t)).length >= n);
    lecteur.noterCopie(n, n);
  }

  await attendre(() => prononces.some((t) => t.startsWith("C'est fini")));
  verifier();
});
