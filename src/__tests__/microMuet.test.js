/**
 * LE MICRO EST OUVERT MAIS N'ENTEND RIEN — Camara, le 16/09/2026 : trois
 * familles, trois PC, « comme si leur micro était en mute », casque ou
 * haut-parleur, et rien à reproduire sur son Mac, son PC ni son téléphone.
 *
 * Le cas exact : `getUserMedia` RÉUSSIT, mais le flux ne contient que du
 * silence — accès micro refusé au navigateur dans Windows, antivirus, mauvais
 * périphérique par défaut, casque Bluetooth sur le mauvais profil. Le moteur
 * principal ne disait rien : l'icône allumée, et personne de prévenu.
 *
 * Ce que ces tests protègent : le navigateur PRÉVIENT l'élève, par écrit, sans
 * couper l'écoute — et un relevé part au serveur dans tous les cas, sains
 * compris, pour que ce qui ne se reproduit pas ici se lise dans les logs.
 */

import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';
import { mesurerMicro } from '../lib/api/mesuresApi';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

jest.mock('../lib/api/mesuresApi', () => ({ mesurerMicro: jest.fn() }));

const FREQUENCE = 24000;

/** Le délai du chien de garde, tel qu'il est réglé dans le module. */
const DELAI_MUET_MS = 8000;

class FausseSocket {
  constructor() { this.readyState = 1; }

  send() {}

  close() { this.readyState = 3; }
}

FausseSocket.OPEN = 1;

let capture;

const respirer = async () => {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
};

/** Un bloc audio d'un dixième de seconde, à l'amplitude voulue. */
const bloc = (amplitude) => new Float32Array(FREQUENCE / 10).fill(amplitude);

/** Une piste de micro telle que le navigateur la rend, muette ou non. */
const piste = ({ muted = false, label = 'Microphone (Realtek High Definition Audio)' } = {}) => ({
  muted,
  label,
  readyState: 'live',
  getSettings: () => ({ sampleRate: 48000 }),
  stop() {},
});

const fluxAvec = (p) => ({ getTracks: () => [p], getAudioTracks: () => [p] });

beforeEach(() => {
  jest.useFakeTimers();
  capture = null;

  global.WebSocket = FausseSocket;
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
    constructor() {
      this.port = { onmessage: null };
      capture = this;
    }

    connect() { return { connect() {} }; }
  };

  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('une piste muette aux yeux du système prévient, même si du son semble passer', async () => {
  global.navigator.mediaDevices = {
    getUserMedia: () => Promise.resolve(fluxAvec(piste({ muted: true }))),
  };

  const onMuet = jest.fn();
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1, onMuet });
  await respirer();

  for (let i = 0; i < 10; i += 1) capture.port.onmessage({ data: bloc(0.1) });

  // Pas un mot avant l'échéance : un enfant qui cherche ses mots n'est pas
  // un micro en panne.
  jest.advanceTimersByTime(DELAI_MUET_MS - 1);
  expect(onMuet).not.toHaveBeenCalled();

  jest.advanceTimersByTime(1);

  expect(onMuet).toHaveBeenCalledTimes(1);
  expect(onMuet.mock.calls[0][0]).toMatchObject({
    muet: true,
    pisteMuette: true,
    peripherique: 'Microphone (Realtek High Definition Audio)',
    frequencePiste: 48000,
    frequenceContexte: FREQUENCE,
  });

  // Le relevé part, avec de quoi comparer : le navigateur et les fréquences.
  expect(mesurerMicro).toHaveBeenCalledTimes(1);
  expect(mesurerMicro.mock.calls[0][0]).toMatchObject({ muet: true, pisteMuette: true });

  ecoute.arreter();
});

test('un flux qui ne contient que du silence est déclaré muet', async () => {
  global.navigator.mediaDevices = {
    getUserMedia: () => Promise.resolve(fluxAvec(piste())),
  };

  const onMuet = jest.fn();
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1, onMuet });
  await respirer();

  // Du « son » très en dessous de tout bruit de fond réel : un micro mort.
  for (let i = 0; i < 10; i += 1) capture.port.onmessage({ data: bloc(0.0001) });

  jest.advanceTimersByTime(DELAI_MUET_MS);

  expect(onMuet).toHaveBeenCalledTimes(1);
  expect(onMuet.mock.calls[0][0]).toMatchObject({ muet: true, pisteMuette: false });
  expect(onMuet.mock.calls[0][0].niveauMax).toBeLessThan(0.0005);

  ecoute.arreter();
});

test('un micro vivant qui n’entend qu’un bruit de fond ne dérange personne — mais se signale', async () => {
  global.navigator.mediaDevices = {
    getUserMedia: () => Promise.resolve(fluxAvec(piste())),
  };

  const onMuet = jest.fn();
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1, onMuet });
  await respirer();

  // Un bruit de pièce : au-dessus du seuil de micro mort, en dessous de la
  // voix. C'est ce qu'un vrai micro donne quand personne ne parle.
  for (let i = 0; i < 10; i += 1) capture.port.onmessage({ data: bloc(0.002) });

  jest.advanceTimersByTime(DELAI_MUET_MS);

  expect(onMuet).not.toHaveBeenCalled();

  // Le relevé sain part quand même : c'est en comparant les machines qui
  // marchent à celles qui ne marchent pas qu'on trouve la différence.
  expect(mesurerMicro).toHaveBeenCalledTimes(1);
  expect(mesurerMicro.mock.calls[0][0]).toMatchObject({ muet: false, pisteMuette: false });

  ecoute.arreter();
});

test('un micro refusé fait remonter le nom de l’erreur', async () => {
  global.navigator.mediaDevices = {
    getUserMedia: () => Promise.reject({ name: 'NotAllowedError' }),
  };

  const onErreur = jest.fn();
  const onMuet = jest.fn();
  ecouteTempsReel.ecouter({ conversationId: 1, onErreur, onMuet });
  await respirer();

  expect(onErreur).toHaveBeenCalledTimes(1);
  expect(mesurerMicro).toHaveBeenCalledWith({ erreur: 'NotAllowedError' });

  // Pas de chien de garde sur une écoute qui n'a jamais démarré.
  jest.advanceTimersByTime(DELAI_MUET_MS);
  expect(onMuet).not.toHaveBeenCalled();
});
