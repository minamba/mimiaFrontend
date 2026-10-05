/**
 * LA LIAISON D'ÉCOUTE PENDANT LES SILENCES, ET QUAND ON LUI DIT NON —
 * Camara, le 28/09/2026 : « énormément de soucis de connexion », surtout avec
 * un enfant de CP qui réfléchit longtemps ; et, après avoir quitté puis repris
 * le cours, « des problèmes de connexion qui s'enchaînaient toutes les
 * secondes, l'enfant parlait mais rien ne partait ».
 *
 * Ce que ces tests protègent :
 *
 * 1. LE BATTEMENT : pendant un silence, le navigateur demande toutes les vingt
 *    secondes si la liaison vit ; deux battements sans réponse, et il rappelle
 *    SANS bandeau — l'enfant n'a rien perdu, il n'a rien à savoir.
 * 2. UN SIGNE DE VIE DU RELAIS (« attente ») suffit : le chien de garde ne
 *    conclut pas à une oreille morte pour un tour que le serveur a reçu.
 * 3. UN REFUS DÉFINITIF s'arrête là : ni rappel, ni boucle. L'appelant est
 *    prévenu une fois, avec le mot pour l'élève.
 * 4. CHAQUE COUPURE LAISSE UN RELEVÉ, pour qu'on sache enfin pourquoi.
 */

import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';
import { mesurerEcoute } from '../lib/api/mesuresApi';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

jest.mock('../lib/api/mesuresApi', () => ({
  mesurerEcoute: jest.fn(),
  mesurerMicro: jest.fn(),
}));

const FREQUENCE = 24000;
const BATTEMENT_MS = 20000;
const SANS_RETOUR_MS = 8000;

const sockets = [];
let capture;

class FausseSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1;
    this.envois = [];
    this.fermee = false;
    sockets.push(this);
  }

  send(charge) {
    if (this.readyState !== 1) throw new Error('envoi sur une liaison qui n’est pas ouverte');
    this.envois.push(charge);
  }

  close() {
    this.fermee = true;
    this.readyState = 3;
  }

  ouvrir() { this.onopen?.(); }

  couper(code = 1006, reason = '') {
    this.readyState = 3;
    this.onclose?.({ code, reason });
  }

  repondre(charge) { this.onmessage?.({ data: JSON.stringify(charge) }); }

  get ordres() {
    return this.envois
      .filter((envoi) => typeof envoi === 'string')
      .map((envoi) => JSON.parse(envoi).type);
  }
}

FausseSocket.OPEN = 1;

const derniere = () => sockets[sockets.length - 1];

const respirer = async () => {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
};

const bloc = (amplitude) => new Float32Array(FREQUENCE / 10).fill(amplitude);

let horloge;

const parler = (n, depuis = 0) => {
  for (let i = depuis; i < depuis + n; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.1) });
  }
};

const setaire = (a) => {
  horloge.mockReturnValue(a);
  capture.port.onmessage({ data: bloc(0) });
};

beforeEach(() => {
  jest.useFakeTimers();
  sockets.length = 0;
  capture = null;
  mesurerEcoute.mockClear();

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

  horloge = jest.spyOn(performance, 'now').mockReturnValue(0);
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
  derniere().ouvrir();
  return ecoute;
};

// --------------------------------------------------------------------- tests

test('pendant un silence, un battement toutes les vingt secondes — et le pong le rassure', async () => {
  const onOreilleMorte = jest.fn();
  await ouvrir({ onOreilleMorte });
  const liaison = derniere();

  expect(liaison.ordres).toEqual([]);

  jest.advanceTimersByTime(BATTEMENT_MS);
  expect(liaison.ordres).toEqual(['ping']);

  liaison.repondre({ type: 'pong' });

  jest.advanceTimersByTime(BATTEMENT_MS);
  expect(liaison.ordres).toEqual(['ping', 'ping']);
  liaison.repondre({ type: 'pong' });

  // Une liaison qui répond ne se fait jamais rappeler, si longtemps que ce soit.
  jest.advanceTimersByTime(BATTEMENT_MS);
  liaison.repondre({ type: 'pong' });
  expect(sockets).toHaveLength(1);
  expect(liaison.fermee).toBe(false);
  expect(onOreilleMorte).not.toHaveBeenCalled();
});

test('deux battements sans réponse : on rappelle SANS bandeau, l’enfant n’a rien perdu', async () => {
  const onOreilleMorte = jest.fn();
  await ouvrir({ onOreilleMorte });
  const liaison = derniere();

  jest.advanceTimersByTime(BATTEMENT_MS); // ping 1, sans réponse
  jest.advanceTimersByTime(BATTEMENT_MS); // ping 2, sans réponse
  expect(liaison.fermee).toBe(false);

  jest.advanceTimersByTime(BATTEMENT_MS); // troisième battement : la liaison est muette
  await respirer();

  expect(liaison.fermee).toBe(true);
  expect(onOreilleMorte).not.toHaveBeenCalled();

  // Le rappel part tout seul.
  jest.advanceTimersByTime(300);
  await respirer();
  expect(sockets).toHaveLength(2);

  expect(mesurerEcoute).toHaveBeenCalledWith(expect.objectContaining({ cause: 'battement' }));
});

test('un signe de vie du relais (« attente ») suffit au chien de garde', async () => {
  const onOreilleMorte = jest.fn();
  await ouvrir({ onOreilleMorte });
  const liaison = derniere();

  parler(5);
  setaire(2000);
  expect(liaison.ordres).toEqual(['fin_tour']);

  // Le serveur a reçu l'ordre mais n'a rien à transcrire : il le dit.
  liaison.repondre({ type: 'attente' });

  jest.advanceTimersByTime(SANS_RETOUR_MS + 1000);
  expect(onOreilleMorte).not.toHaveBeenCalled();
  expect(liaison.fermee).toBe(false);
  expect(sockets).toHaveLength(1);
});

test('un refus définitif arrête tout : pas de rappel, l’appelant prévenu une fois', async () => {
  const onErreur = jest.fn();
  const onFermeture = jest.fn();
  await ouvrir({ onErreur, onFermeture });
  const liaison = derniere();

  liaison.repondre({
    type: 'erreur', message: 'Il n’y a plus d’heures de cours pour aujourd’hui.', definitif: true, cause: 'refus',
  });
  liaison.couper(1008, 'refus');

  jest.advanceTimersByTime(60000);
  await respirer();

  expect(onErreur).toHaveBeenCalledTimes(1);
  expect(onErreur).toHaveBeenCalledWith('Il n’y a plus d’heures de cours pour aujourd’hui.', true);
  expect(onFermeture).toHaveBeenCalledTimes(1);
  expect(sockets).toHaveLength(1);
  expect(mesurerEcoute).toHaveBeenCalledWith(expect.objectContaining({ cause: 'refus' }));
});

test('une fermeture par le code 1008 seul, sans le message, s’arrête aussi', async () => {
  const onErreur = jest.fn();
  await ouvrir({ onErreur });

  derniere().couper(1008, 'refus');
  jest.advanceTimersByTime(60000);
  await respirer();

  expect(onErreur).toHaveBeenCalledWith(expect.stringMatching(/micro n'est pas disponible/), true);
  expect(sockets).toHaveLength(1);
});

test('une coupure ordinaire laisse un relevé avec son code, et rappelle comme avant', async () => {
  const onOreilleMorte = jest.fn();
  await ouvrir({ onOreilleMorte });

  derniere().couper(1006, '');
  jest.advanceTimersByTime(300);
  await respirer();

  expect(sockets).toHaveLength(2);
  expect(onOreilleMorte).not.toHaveBeenCalled();
  expect(mesurerEcoute).toHaveBeenCalledWith(expect.objectContaining({ cause: 'fermeture', code: 1006 }));
});
