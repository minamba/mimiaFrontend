/**
 * LE MICRO SE TAIT PENDANT QUE LE PROFESSEUR PARLE — SANS CASQUE SEULEMENT.
 *
 * Sur un haut-parleur, un micro ouvert capte la voix du professeur, la
 * transcrit, et la renvoie comme une interruption : il se coupe lui-même, en
 * boucle, et le champ de l'élève se remplit de mots qu'il n'a pas dits.
 *
 * La pause existait déjà, pour le clavier. Elle GARDE alors les 300 dernières
 * millisecondes captées, afin que la reprise ne mange pas la première syllabe
 * de l'élève. Réutilisée telle quelle pendant une explication, cette même
 * réserve aurait rapporté la fin de la phrase du PROFESSEUR et l'aurait collée
 * en tête du tour suivant — la boucle revenue par la porte de service.
 *
 * D'où le second paramètre de `suspendre`, et d'où ces tests : les deux motifs
 * de pause se ressemblent au point qu'un remaniement les confondrait, et la
 * confusion ne s'entendrait qu'en séance, sur un vrai haut-parleur.
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

const ouvrir = async () => {
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1 });
  await respirer();
  return ecoute;
};

// --------------------------------------------------------------------- tests

test('pendant une explication, la voix du professeur ne part jamais', async () => {
  const ecoute = await ouvrir();
  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);

  // Le professeur prend la parole : le micro se ferme, sans garder d'avance.
  ecoute.suspendre(true, false);

  const avant = socketOuverte.trames;

  // Sa voix entre par le haut-parleur, fort et longuement.
  for (let i = 1; i <= 6; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.2) });
  }

  expect(socketOuverte.trames).toBe(avant);
});

test('à la reprise, la fin de la phrase du professeur n’est pas rapportée', async () => {
  const ecoute = await ouvrir();
  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);

  ecoute.suspendre(true, false);

  // Six blocs de voix du professeur pendant la pause. Ils alimentent la
  // réserve, comme n'importe quel son capté.
  for (let i = 1; i <= 6; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.2) });
  }

  const pendant = socketOuverte.trames;

  // Le professeur se tait, le micro rouvre, l'élève parle.
  ecoute.suspendre(false);
  horloge.mockReturnValue(700);
  capture.port.onmessage({ data: bloc(0.1) });

  // UNE SEULE TRAME : celle de l'élève. Si la réserve avait été transmise, il
  // y en aurait plusieurs — et les premières porteraient la voix du
  // professeur, que le transcripteur attribuerait à l'élève.
  expect(socketOuverte.trames - pendant).toBe(1);
});

test('la pause du clavier, elle, garde toujours son avance', async () => {
  // La régression qu'on ne veut PAS introduire en corrigeant l'autre cas : ces
  // 300 ms-là ne contiennent que le bruit de la pièce, et les jeter couperait
  // la première syllabe de l'élève qui repose son clavier pour parler.
  const ecoute = await ouvrir();
  const horloge = jest.spyOn(performance, 'now').mockReturnValue(0);

  ecoute.suspendre(true);

  for (let i = 1; i <= 3; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0) });
  }

  const pendant = socketOuverte.trames;

  ecoute.suspendre(false);
  horloge.mockReturnValue(400);
  capture.port.onmessage({ data: bloc(0.1) });

  expect(socketOuverte.trames - pendant).toBeGreaterThan(1);
});
