/**
 * LE TOUR OUBLIÉ AU CLAVIER — remonté par un parent le 26/10/2026 : l'enfant
 * efface la transcription, réécrit, envoie… et le professeur recevait l'ancien
 * texte ET le nouveau, ou deux messages. Quand l'écran dit « oublie le tour en
 * cours », ce qui revient encore du relais pour cette parole-là est ignoré,
 * jusqu'à ce que le micro entende une NOUVELLE prise de parole.
 */
import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;
const sockets = [];
let capture;

class FausseSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1;
    this.envois = [];
    sockets.push(this);
  }

  send(charge) { this.envois.push(charge); }

  close() { this.readyState = 3; }

  repondre(charge) { this.onmessage?.({ data: JSON.stringify(charge) }); }

  get trames() { return this.envois.filter((envoi) => typeof envoi !== 'string').length; }
}

// Le relais compare au vrai WebSocket.OPEN : sans lui, rien ne part et le
// verdict est jugé impossible (aucun son transmis).
FausseSocket.OPEN = 1;

const derniere = () => sockets[sockets.length - 1];
const respirer = async () => { for (let i = 0; i < 30; i += 1) await Promise.resolve(); };
const bloc = (amplitude) => new Float32Array(FREQUENCE / 10).fill(amplitude);
let horloge;

const parler = (n, depuis = 0) => {
  for (let i = depuis; i < depuis + n; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.1) });
  }
};
const setaire = (a) => { horloge.mockReturnValue(a); capture.port.onmessage({ data: bloc(0) }); };

beforeEach(() => {
  jest.useFakeTimers();
  sockets.length = 0;
  capture = null;
  global.WebSocket = FausseSocket;
  global.navigator.mediaDevices = { getUserMedia: () => Promise.resolve({ getTracks: () => [{ stop() {} }] }) };
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
  return ecoute;
};

test('un verdict qui revient après « oublie le tour » est ignoré ; la parole suivante compte à nouveau', async () => {
  const onFinal = jest.fn();
  const onPartiel = jest.fn();
  const ecoute = await ouvrir({ onFinal, onPartiel });

  // Première phrase, tranchée normalement.
  parler(20);
  setaire(3000);
  derniere().repondre({ type: 'final', texte: 'trois quarts' });
  expect(onFinal).toHaveBeenCalledTimes(1);

  // Deuxième phrase : il parle, puis reprend la main au clavier avant le verdict.
  parler(20, 40);
  setaire(7000);
  ecoute.oublierLeTourEnCours();

  derniere().repondre({ type: 'partiel', texte: 'non en fait' });
  derniere().repondre({ type: 'final', texte: 'deux tiers' });
  expect(onPartiel).not.toHaveBeenCalled();
  expect(onFinal).toHaveBeenCalledTimes(1);

  // Il reparle : ce tour-là est entendu.
  parler(20, 80);
  setaire(11000);
  derniere().repondre({ type: 'final', texte: 'la suite' });
  expect(onFinal).toHaveBeenCalledTimes(2);
  expect(onFinal).toHaveBeenLastCalledWith('la suite');
});

test('oublier le tour jette la parole encore en attente de départ', async () => {
  const onFinal = jest.fn();
  // La liaison n'est pas prête : la parole s'accumule dans la file.
  const Classe = global.WebSocket;
  global.WebSocket = class extends Classe { constructor(url) { super(url); this.readyState = 0; } };
  const ecoute = await ouvrir({ onFinal });

  parler(20);
  setaire(3000);
  expect(derniere().envois).toHaveLength(0);
  expect(ecoute.transcriptionEnCours()).toBe(true);

  ecoute.oublierLeTourEnCours();
  expect(ecoute.transcriptionEnCours()).toBe(false);

  derniere().readyState = 1;
  derniere().onopen?.();
  expect(derniere().trames).toBe(0);
});

describe('le son que le micro ne sait pas écrire (03/11/2026)', () => {
  test('du son est parti et le verdict est vide : l’écran est prévenu, avec la durée de ce tour', async () => {
    const onSonSansTexte = jest.fn();
    const onFinal = jest.fn();
    await ouvrir({ onSonSansTexte, onFinal });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: '' });

    expect(onSonSansTexte).toHaveBeenCalledTimes(1);
    expect(onSonSansTexte.mock.calls[0][0]).toBeGreaterThan(1);
    expect(onFinal).not.toHaveBeenCalled();

    // Le tour d'après repart de zéro : il n'hérite pas de ce son.
    derniere().repondre({ type: 'final', texte: '' });
    expect(onSonSansTexte.mock.calls[1][0]).toBe(0);
  });

  test('un verdict écrit ne le prévient pas', async () => {
    const onSonSansTexte = jest.fn();
    await ouvrir({ onSonSansTexte });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: 'fu' });

    expect(onSonSansTexte).not.toHaveBeenCalled();
  });

  test('un tour oublié au clavier ne le prévient pas', async () => {
    const onSonSansTexte = jest.fn();
    const ecoute = await ouvrir({ onSonSansTexte });

    parler(15);
    setaire(3000);
    ecoute.oublierLeTourEnCours();
    derniere().repondre({ type: 'final', texte: '' });

    expect(onSonSansTexte).not.toHaveBeenCalled();
  });
});

describe('le texte qui vient de la voix, au primaire (04/11/2026)', () => {
  test('« ba » vérifié sur la voix est une réponse, pas une hésitation', async () => {
    const onFinal = jest.fn();
    await ouvrir({ onFinal });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: 'ba', son: true });

    expect(onFinal).toHaveBeenCalledWith('ba', { son: true, juste: null });
  });

  // LE VERDICT VOYAGE AVEC LE TEXTE — Camara, le 04/11/2026 : l'écran en fait
  // « Bonne prononciation » ou « On réessaie », et n'écrit pas le son lui-même.
  test('le verdict de la voix arrive avec le texte : juste ou faux', async () => {
    const onFinal = jest.fn();
    await ouvrir({ onFinal });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: 'bo', son: true, juste: true });
    derniere().repondre({ type: 'final', texte: 'po', son: true, juste: false });

    expect(onFinal).toHaveBeenNthCalledWith(1, 'bo', { son: true, juste: true });
    expect(onFinal).toHaveBeenNthCalledWith(2, 'po', { son: true, juste: false });
  });

  test('un texte ordinaire arrive seul, sans verdict', async () => {
    const onFinal = jest.fn();
    await ouvrir({ onFinal });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: 'Je crois que c est un verbe.' });

    expect(onFinal).toHaveBeenCalledTimes(1);
    expect(onFinal.mock.calls[0]).toEqual(['Je crois que c est un verbe.']);
  });

  test('« ba » venu du micro reste une hésitation, comme avant', async () => {
    const onFinal = jest.fn();
    await ouvrir({ onFinal });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: 'ba' });

    expect(onFinal).not.toHaveBeenCalled();
  });

  test('un « ffff » vérifié sur la voix part comme un tour normal', async () => {
    const onFinal = jest.fn();
    const onSonSansTexte = jest.fn();
    await ouvrir({ onFinal, onSonSansTexte });

    parler(15);
    setaire(3000);
    derniere().repondre({ type: 'final', texte: 'ffff', son: true });

    expect(onFinal).toHaveBeenCalledWith('ffff', { son: true, juste: null });
    expect(onSonSansTexte).not.toHaveBeenCalled();
  });
});
