/**
 * LE TEXTE ARRIVE DÉJÀ RECOLLÉ — ET C'EST UNE LEÇON PAYÉE CHER.
 *
 * Le fournisseur envoie des DELTAS : « singulier » arrive en « sing », « uli »,
 * « er ». Il a d'abord fallu s'en apercevoir — le navigateur prenait chaque
 * delta pour la transcription entière, et le professeur recevait « ulier ».
 *
 * Le recollage a alors été posé ICI, et c'était le mauvais endroit. Le filtre
 * d'écho du vocabulaire vit sur le serveur, et il ne voyait donc que des
 * miettes de moins de trente caractères : elles passaient une par une, et
 * c'est le navigateur qui les rassemblait en une liste de vocabulaire
 * entière — envoyée au professeur, en boucle, sous le nom de l'élève.
 *
 * Le recollage vit désormais là où le vocabulaire est connu. Ce que ces tests
 * protègent, c'est le CONTRAT qui en découle : le navigateur ne recolle plus
 * rien, et un texte vide est un ordre d'effacement.
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
  constructor() { this.readyState = 1; this.envois = []; socketOuverte = this; }

  send(charge) { this.envois.push(charge); }

  close() { this.readyState = 3; }

  repondre(charge) { this.onmessage?.({ data: JSON.stringify(charge) }); }

  get ordres() {
    return this.envois.filter((e) => typeof e === 'string').map((e) => JSON.parse(e).type);
  }
}

FausseSocket.OPEN = 1;

const respirer = async () => { for (let i = 0; i < 30; i += 1) await Promise.resolve(); };
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

const dernier = (espion) => espion.mock.calls[espion.mock.calls.length - 1][0];

test('le navigateur ne recolle RIEN : il rend ce qu’on lui donne', async () => {
  // Recoller des deux côtés donnerait « sing », « singsinguli »,
  // « singsingulisingulier ». C'est la panne symétrique de celle qu'on vient
  // de corriger, et elle serait tout aussi invisible en relisant le code.
  const onPartiel = jest.fn();
  await ouvrir({ onPartiel });

  ['sing', 'singuli', 'singulier'].forEach((assemble) =>
    socketOuverte.repondre({ type: 'partiel', texte: assemble }));

  expect(dernier(onPartiel)).toBe('singulier');
  expect(onPartiel.mock.calls.map((c) => c[0])).toEqual(['sing', 'singuli', 'singulier']);
});

test('un partiel vide est un ordre d’effacement', async () => {
  // C'est ainsi que le serveur retire ce qu'il avait déjà laissé passer quand
  // il reconnaît un écho de vocabulaire : le début de la liste est sous le
  // seuil de longueur du filtre, et il est passé.
  const onPartiel = jest.fn();
  await ouvrir({ onPartiel });

  socketOuverte.repondre({ type: 'partiel', texte: 'Cours particulier, France.' });
  socketOuverte.repondre({ type: 'partiel', texte: '' });

  expect(dernier(onPartiel)).toBe('');
});

test('ce qu’on tient au moment du silence est le tour entier', async () => {
  // La course qui avait produit « ulier » en base : notre détection de silence
  // réclame la transcription avant le verdict du fournisseur, et ce qu'on
  // tient à cet instant est tout ce que le professeur recevra.
  const onPartiel = jest.fn();
  const onSilence = jest.fn();
  await ouvrir({ onPartiel, onSilence });

  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);
  capture.port.onmessage({ data: bloc(0.1) });

  socketOuverte.repondre({ type: 'partiel', texte: 'singulier' });

  horloge.mockReturnValue(2000);
  capture.port.onmessage({ data: bloc(0) });

  expect(socketOuverte.ordres).toContain('fin_tour');
  expect(onSilence).toHaveBeenCalled();
  expect(dernier(onPartiel)).toBe('singulier');
});

test('le verdict du fournisseur passe intact', async () => {
  const onFinal = jest.fn();
  await ouvrir({ onFinal });

  // Deux secondes de parole avant le verdict : un tour est maintenant
  // confronté à la DURÉE de son audio, et « Les photos sont féminines. » ne
  // peut pas sortir du silence.
  const horloge = jest.spyOn(performance, 'now');
  for (let i = 0; i < 20; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.1) });
  }

  socketOuverte.repondre({ type: 'partiel', texte: 'les photos' });
  socketOuverte.repondre({ type: 'final', texte: 'Les photos sont féminines.' });

  expect(onFinal).toHaveBeenCalledWith('Les photos sont féminines.');
});
