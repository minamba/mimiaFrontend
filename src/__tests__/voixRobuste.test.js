/**
 * LE PROFESSEUR « PARLE » SANS UN SON, POUR TOUJOURS — Camara, le 28/09/2026 :
 * « j'ai redémarré l'API, je suis rentré en cours d'anglais, le message de
 * bienvenue apparaît mais je n'entends rien, et "Le professeur parle" reste
 * plus d'une minute. Je comprends pas pourquoi des fois ça fait ça. »
 *
 * Trois façons d'en arriver là, chacune protégée ici :
 * 1. LA SONDE DU SERVEUR DE VOIX ratée une fois (API en train de redémarrer)
 *    condamnait toute la page à la voix du navigateur. Un échec ne vaut plus
 *    que dix secondes.
 * 2. LA VOIX DU NAVIGATEUR peut ne jamais dire « end » : un chien de garde
 *    passe à la suite.
 * 3. LE GRAPHE AUDIO ENDORMI (pas de clic sur la page) figeait l'horloge, et
 *    la boucle dormait de plus en plus longtemps à chaque morceau. Elle
 *    attend maintenant le réveil du graphe, et l'écran le dit.
 */

const mockGet = jest.fn();

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: (...args) => mockGet(...args) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

let programmes;
let horloge;

class FausseSource {
  constructor() { this.buffer = null; }

  connect(suite) { return suite; }

  start(instant) { programmes.push({ instant, duree: this.buffer.duration }); }

  stop() {}
}

function fauxContexte({ state = 'running' } = {}) {
  const ecouteurs = new Set();
  return class {
    constructor() {
      this.state = state;
      this.destination = {};
    }

    get currentTime() { return horloge; }

    addEventListener(type, f) { ecouteurs.add(f); }

    removeEventListener(type, f) { ecouteurs.delete(f); }

    reveiller() {
      this.state = 'running';
      ecouteurs.forEach((f) => f());
    }

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
          value: 1, cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {},
        },
        connect: (suite) => suite,
      };
    }

    createBufferSource() { return new FausseSource(); }

    // Comme Chrome sans geste : ni refus, ni reprise — une promesse en suspens.
    resume() { return this.state === 'running' ? Promise.resolve() : new Promise(() => {}); }
  };
}

function synthese(secondes) {
  return jest.fn(() => {
    let lu = false;
    return Promise.resolve({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: () => {
            if (lu) return Promise.resolve({ done: true });
            lu = true;
            return Promise.resolve({ done: false, value: new Uint8Array(secondes * FREQUENCE * 2) });
          },
        }),
      },
    });
  });
}

const attendre = async (condition, maxMs = 300) => {
  const debut = Date.now();
  while (!condition() && Date.now() - debut < maxMs) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, 5); });
  }
};

/** Un service tout neuf : la sonde du serveur n'a pas encore parlé. */
function serviceNeuf() {
  let service;
  jest.isolateModules(() => {
    // eslint-disable-next-line global-require
    service = require('../lib/storage/voixService').voixService;
  });
  return service;
}

beforeEach(() => {
  programmes = [];
  horloge = 0;
  mockGet.mockReset();
  window.AudioContext = fauxContexte();
  global.AbortController = class {
    constructor() { this.signal = {}; }

    abort() {}
  };
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
  delete window.speechSynthesis;
  delete window.SpeechSynthesisUtterance;
});

test('une sonde ratée ne condamne pas la séance : dix secondes plus tard, on redemande', async () => {
  const maintenant = jest.spyOn(Date, 'now');
  const t0 = 1_000_000;
  maintenant.mockReturnValue(t0);

  mockGet.mockRejectedValueOnce(new Error('connexion refusée'));
  global.fetch = synthese(1);
  const service = serviceNeuf();
  const lecteur = service.creerLecteur();

  // L'API redémarre : la sonde échoue, la phrase part au repli (muet ici).
  lecteur.dire('Bonjour, on commence.');
  await attendre(() => !lecteur.enLecture, 500);
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(global.fetch).not.toHaveBeenCalled();

  // Cinq secondes plus tard : on n'insiste pas encore.
  maintenant.mockReturnValue(t0 + 5000);
  lecteur.dire('Deuxième phrase.');
  await attendre(() => !lecteur.enLecture, 500);
  expect(mockGet).toHaveBeenCalledTimes(1);

  // Onze secondes : l'API est revenue, la voix du serveur aussi.
  maintenant.mockReturnValue(t0 + 11000);
  mockGet.mockResolvedValueOnce({ data: { disponible: true } });
  lecteur.dire('Troisième phrase, avec la vraie voix.');
  await attendre(() => programmes.length >= 1, 1000);

  expect(mockGet).toHaveBeenCalledTimes(2);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  lecteur.arreter();
});

test('la voix du navigateur qui ne finit jamais est bornée : le professeur ne « parle » pas pour toujours', async () => {
  const cancel = jest.fn();
  window.speechSynthesis = { speak: jest.fn(), cancel, getVoices: () => [] };
  window.SpeechSynthesisUtterance = class { constructor(texte) { this.text = texte; } };

  mockGet.mockRejectedValue(new Error('connexion refusée'));
  const service = serviceNeuf();
  const lecteur = service.creerLecteur();
  const silences = [];
  lecteur.auSilence = () => silences.push(1);

  lecteur.dire('Salut !'); // 7 caractères : 4 s + 0,9 s de garde

  await attendre(() => window.speechSynthesis.speak.mock.calls.length >= 1, 500);
  expect(lecteur.estOccupe()).toBe(true);

  await attendre(() => silences.length >= 1, 7000);
  expect(silences).toHaveLength(1);
  expect(cancel).toHaveBeenCalled();
  expect(lecteur.estOccupe()).toBe(false);
}, 10000);

test('graphe audio endormi : l’écran le dit, la boucle attend le réveil, puis tout part', async () => {
  window.AudioContext = fauxContexte({ state: 'suspended' });
  mockGet.mockResolvedValue({ data: { disponible: true } });
  global.fetch = synthese(3);
  const service = serviceNeuf();
  const lecteur = service.creerLecteur();
  const blocages = [];
  const silences = [];
  lecteur.surBlocage = () => blocages.push(1);
  lecteur.auSilence = () => silences.push(1);

  lecteur.dire('Une phrase que personne n’entend tant que la page n’a pas été cliquée.');

  // Le premier morceau est programmé, puis la boucle s'arrête d'attendre l'heure.
  await attendre(() => programmes.length >= 1, 1000);
  await attendre(() => blocages.length >= 1, 1500);
  expect(blocages.length).toBeGreaterThanOrEqual(1);
  expect(silences).toHaveLength(0);

  // Le clic de l'élève réveille le graphe : la boucle reprend, le son
  // programmé se joue (l'horloge avance enfin), et elle finit.
  horloge = 3.1;
  lecteur.contexte.reveiller();
  await attendre(() => silences.length >= 1, 1500);
  expect(silences).toHaveLength(1);

  lecteur.arreter();
});
