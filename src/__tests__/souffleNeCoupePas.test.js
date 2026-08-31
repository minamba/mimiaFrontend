/**
 * UN SOUPIR NE COUPE PAS LA PAROLE DU PROFESSEUR.
 *
 * Relevé en séance : « je fais pas parlé, juste j'ai respiré fort ou fait un
 * soupirement, la voix du professeur coupe ». Un soupir est FORT et SOUTENU :
 * il passait les deux tests précédents — volume et durée — sans difficulté, et
 * monter le seuil de volume n'aurait rien réglé, un soupir étant aussi fort
 * qu'un mot.
 *
 * Ce qui sépare les deux est le VOISEMENT. Une voyelle est périodique : l'onde
 * repasse par zéro à la fréquence du son. Un souffle est un bruit large bande,
 * qui y repasse dix à vingt fois plus souvent.
 *
 * Ces tests portent donc sur des signaux SYNTHÉTIQUES : une sinusoïde pour la
 * voyelle, un bruit pour le souffle, à la MÊME intensité. C'est la seule façon
 * d'isoler le critère qu'on vient d'ajouter — avec du vrai son, on ne saurait
 * jamais lequel des trois tests a tranché.
 */

import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

/** Cent millisecondes de son. */
const DUREE = FREQUENCE / 10;

let socketOuverte;
let capture;

class FausseSocket {
  constructor() { this.readyState = 1; this.envois = []; socketOuverte = this; }

  send() {}

  close() { this.readyState = 3; }
}

FausseSocket.OPEN = 1;

const respirer = async () => { for (let i = 0; i < 30; i += 1) await Promise.resolve(); };

/**
 * Une voyelle : une sinusoïde à 200 Hz, la fondamentale d'une voix.
 * Elle repasse par zéro 400 fois par seconde, soit 0,017 par échantillon.
 */
const voyelle = (amplitude = 0.1) => {
  const bloc = new Float32Array(DUREE);
  for (let i = 0; i < DUREE; i += 1) {
    bloc[i] = amplitude * Math.sin((2 * Math.PI * 200 * i) / FREQUENCE);
  }
  return bloc;
};

/**
 * Un souffle : du bruit large bande, à la MÊME amplitude moyenne qu'une voix.
 *
 * Le générateur est déterministe — un test qui échoue une fois sur dix ne dit
 * rien de ce qu'il protège.
 */
const souffle = (amplitude = 0.16) => {
  const bloc = new Float32Array(DUREE);
  let graine = 12345;
  for (let i = 0; i < DUREE; i += 1) {
    graine = (graine * 1103515245 + 12345) % 2147483648;
    bloc[i] = ((graine / 2147483648) * 2 - 1) * amplitude;
  }
  return bloc;
};

/** Du silence, pour retomber entre deux essais. */
const silence = () => new Float32Array(DUREE);

beforeEach(() => {
  jest.useFakeTimers();
  socketOuverte = null;
  capture = null;

  global.WebSocket = FausseSocket;
  global.navigator.mediaDevices = {
    getUserMedia: () => Promise.resolve({ getTracks: () => [{ stop() {} }] }),
  };
  global.URL.createObjectURL = () => 'blob:faux';
  global.URL.revokeObjectURL = () => {};

  global.AudioContext = class {
    constructor() {
      this.sampleRate = FREQUENCE;
      this.destination = { connect() {} };
      this.audioWorklet = { addModule: () => Promise.resolve() };
    }

    createMediaStreamSource() { return { connect() {} }; }

    createGain() { return { gain: {}, connect() { return { connect() {} }; } }; }

    resume() { return Promise.resolve(); }

    close() { return Promise.resolve(); }
  };

  global.AudioWorkletNode = class {
    constructor() { this.port = { onmessage: null }; capture = this; }

    connect() { return { connect() {} }; }
  };

  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

/** Fait passer une seconde de ce son, par blocs de cent millisecondes. */
const emettre = (horloge, faireUnBloc, depuis = 0) => {
  for (let i = 1; i <= 10; i += 1) {
    horloge.mockReturnValue(depuis + i * 100);
    capture.port.onmessage({ data: faireUnBloc() });
  }
  return depuis + 1000;
};

const ouvrir = async (onVoix) => {
  ecouteTempsReel.ecouter({ conversationId: 1, onVoix });
  await respirer();
  return jest.spyOn(performance, 'now').mockReturnValue(0);
};

test('un soupir d’une seconde, aussi fort qu’un mot, ne coupe rien', async () => {
  const onVoix = jest.fn();
  const horloge = await ouvrir(onVoix);

  emettre(horloge, souffle);

  expect(onVoix).not.toHaveBeenCalled();
});

test('une voyelle, elle, coupe la parole', async () => {
  const onVoix = jest.fn();
  const horloge = await ouvrir(onVoix);

  emettre(horloge, voyelle);

  expect(onVoix).toHaveBeenCalled();
});

test('un souffle qui précède la parole ne l’empêche pas de couper', async () => {
  // Le cas réel : il inspire, puis il parle. Le souffle ne doit ni déclencher
  // l'interruption, ni empêcher celle que la parole mérite ensuite.
  const onVoix = jest.fn();
  const horloge = await ouvrir(onVoix);

  const apresSouffle = emettre(horloge, souffle);
  expect(onVoix).not.toHaveBeenCalled();

  emettre(horloge, voyelle, apresSouffle);
  expect(onVoix).toHaveBeenCalled();
});

test('une parole mêlée de consonnes sourdes coupe quand même', async () => {
  // Une phrase n'est pas voisée de bout en bout : le « s » de « stop », le
  // « ch » de « chut » sont eux aussi du bruit. Exiger la perfection ferait
  // retomber le compteur à chaque sifflante, et l'élève ne pourrait plus
  // jamais couper son professeur.
  const onVoix = jest.fn();
  const horloge = await ouvrir(onVoix);

  // Deux blocs voisés pour un bloc sourd : le rapport d'une parole ordinaire.
  for (let i = 1; i <= 9; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: i % 3 === 0 ? souffle() : voyelle() });
  }

  expect(onVoix).toHaveBeenCalled();
});

test('le silence remet le compteur à plat', async () => {
  // Sans cette remise à zéro, une succession de souffles séparés par des blancs
  // finirait par accumuler assez de durée pour couper.
  const onVoix = jest.fn();
  const horloge = await ouvrir(onVoix);

  let t = 0;
  for (let essai = 0; essai < 5; essai += 1) {
    horloge.mockReturnValue(t += 100);
    capture.port.onmessage({ data: souffle() });
    horloge.mockReturnValue(t += 100);
    capture.port.onmessage({ data: silence() });
  }

  expect(onVoix).not.toHaveBeenCalled();
});
