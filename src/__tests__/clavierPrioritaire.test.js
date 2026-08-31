/**
 * LE CHAMP APPARTIENT À CELUI QUI L'A REMPLI.
 *
 * Relevé en séance, une fois sur deux : « j'écris et d'un coup tout s'efface
 * dans ce que j'ai écrit ». La voix et le clavier écrivaient dans le MÊME
 * champ, et la voix ne regardait jamais ce qui s'y trouvait déjà.
 *
 * Ces tests portent sur la moitié testable sans monter le chat : l'émission du
 * micro se coupe quand l'élève tape, et elle reprend sans tronquer son premier
 * mot. Les trois verrous d'affichage et d'envoi vivent dans Chat.js.
 */

import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

let socketOuverte;
let capture;

class FausseSocket {
  constructor() {
    this.readyState = 1;
    this.envois = [];
    socketOuverte = this;
  }

  send(charge) { this.envois.push(charge); }

  close() { this.readyState = 3; }

  /** Le son transmis, en nombre de trames binaires. */
  get trames() { return this.envois.filter((e) => typeof e !== 'string').length; }

  get ordres() {
    return this.envois.filter((e) => typeof e === 'string').map((e) => JSON.parse(e).type);
  }
}

FausseSocket.OPEN = 1;

const respirer = async () => {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
};

const bloc = (amplitude) => new Float32Array(FREQUENCE / 10).fill(amplitude);

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

const ouvrir = async (rappels = {}) => {
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1, ...rappels });
  await respirer();
  return ecoute;
};

test('en pause, plus une seule trame ne part', async () => {
  const ecoute = await ouvrir();
  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);

  capture.port.onmessage({ data: bloc(0.1) });
  const avant = socketOuverte.trames;
  expect(avant).toBeGreaterThan(0);

  ecoute.suspendre(true);

  // Il tape, et il parle par-dessus : rien ne doit sortir.
  horloge.mockReturnValue(100);
  capture.port.onmessage({ data: bloc(0.1) });
  horloge.mockReturnValue(200);
  capture.port.onmessage({ data: bloc(0.1) });

  expect(socketOuverte.trames).toBe(avant);
});

test('en pause, aucune fin de tour n’est réclamée', async () => {
  const onSilence = jest.fn();
  const ecoute = await ouvrir({ onSilence });
  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);

  // Il parlait, puis il se met à taper au milieu de sa phrase.
  capture.port.onmessage({ data: bloc(0.1) });
  ecoute.suspendre(true);

  // Le silence qui suit ne doit RIEN déclencher : sans cette remise à zéro,
  // on aurait réclamé la transcription d'un tour qu'on vient d'abandonner.
  horloge.mockReturnValue(3000);
  capture.port.onmessage({ data: bloc(0) });

  expect(socketOuverte.ordres).not.toContain('fin_tour');
  expect(onSilence).not.toHaveBeenCalled();
});

test('la reprise ne tronque pas le premier mot', async () => {
  const ecoute = await ouvrir();
  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);

  ecoute.suspendre(true);

  // Pendant la pause, le son continue d'alimenter la réserve. C'est elle qui
  // porte l'avance : sans elle, la reprise couperait la première syllabe,
  // exactement comme au démarrage.
  for (let i = 1; i <= 3; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0) });
  }

  const pendant = socketOuverte.trames;

  ecoute.suspendre(false);
  horloge.mockReturnValue(400);
  capture.port.onmessage({ data: bloc(0.1) });

  // Plus d'une trame : le bloc courant, PRÉCÉDÉ de l'avance gardée en réserve.
  expect(socketOuverte.trames - pendant).toBeGreaterThan(1);
});

test('suspendre deux fois de suite ne change rien', async () => {
  // `taper` est appelé à CHAQUE frappe : sans ce court-circuit, chaque lettre
  // remettrait le tour à zéro et désarmerait le chien de garde.
  const ecoute = await ouvrir();
  jest.spyOn(performance, 'now').mockReturnValue(0);

  ecoute.suspendre(true);
  ecoute.suspendre(true);
  ecoute.suspendre(true);

  capture.port.onmessage({ data: bloc(0.1) });
  expect(socketOuverte.trames).toBe(0);
});
