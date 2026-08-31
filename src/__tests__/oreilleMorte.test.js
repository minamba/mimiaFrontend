/**
 * L'OREILLE MORTE : une liaison ouverte au bout de laquelle plus rien ne répond.
 *
 * Relevé en séance, et c'est la panne la plus déroutante de toutes : « on
 * dirait que mon micro est en mute alors qu'il l'est pas ». Le champ restait
 * vide PENDANT que l'élève parlait — donc rien ne revenait, pas même une
 * transcription provisoire.
 *
 * Une WebSocket peut rester parfaitement ouverte alors que ce qu'il y a au
 * bout ne répond plus. Le navigateur continuait alors d'y déverser du son pour
 * le reste du cours, l'onde bleue allumée, avec « Je t'écoute… » à l'écran.
 * Aucune erreur, aucune fermeture, aucun moyen de s'en rendre compte.
 *
 * Ce que ces tests protègent : dès qu'on a RÉCLAMÉ une transcription, le
 * silence du serveur n'est plus une attente, c'est une panne — et on raccroche
 * pour que l'appelant rebâtisse une écoute.
 *
 * Ce filet ne joue qu'en panne, donc jamais pendant le développement : sans
 * ces tests, il pourrait être cassé pendant des mois sans que rien ne le dise,
 * et on ne s'en apercevrait qu'à l'endroit précis où il devait sauver la
 * séance.
 */

import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

/** Le délai du chien de garde, tel qu'il est réglé dans le module. */
const SANS_RETOUR_MS = 8000;

// ------------------------------------------------------- navigateur feint
//
// On ne teste ni le son ni le réseau : on teste QUI décide que l'oreille est
// morte, et quand. Tout le reste est réduit au strict nécessaire.

let socketOuverte;

class FausseSocket {
  constructor() {
    this.readyState = 1;
    this.envois = [];
    this.fermee = false;
    socketOuverte = this;
  }

  send(charge) { this.envois.push(charge); }

  close() { this.fermee = true; this.readyState = 3; }

  /** Le serveur répond : n'importe quel message vaut signe de vie. */
  repondre(charge) { this.onmessage?.({ data: JSON.stringify(charge) }); }

  /** Ce qu'on a annoncé au serveur, hors audio. */
  get ordres() {
    return this.envois
      .filter((envoi) => typeof envoi === 'string')
      .map((envoi) => JSON.parse(envoi).type);
  }
}

FausseSocket.OPEN = 1;

let capture;

/** Rend la main assez de fois pour que la mise en place asynchrone s'achève. */
const respirer = async () => {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
};

/** Un bloc audio d'un dixième de seconde, à l'amplitude voulue. */
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

/**
 * Ouvre une écoute et fait vivre un tour de parole complet : l'élève parle,
 * puis se tait assez longtemps pour qu'on réclame la transcription.
 */
const unTourDeParole = async (rappels) => {
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1, ...rappels });
  await respirer();

  const horloge = jest.spyOn(performance, 'now');

  // IL PARLE DEUX SECONDES, ET LA DURÉE COMPTE DÉSORMAIS.
  //
  // Un tour est confronté à la DURÉE de son audio : une phrase de trente
  // caractères rendue sur cent millisecondes est refusée, et elle a raison de
  // l être. Ce banc teste le relais, pas la vraisemblance — il lui manquait
  // simplement du son.
  for (let i = 0; i < 20; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.1) });
  }

  // Il se tait. Au-delà du seuil, on annonce nous-mêmes la fin du tour.
  horloge.mockReturnValue(4000);
  capture.port.onmessage({ data: bloc(0) });

  return ecoute;
};

test("le tour de parole réclamé sans réponse fait raccrocher, et l'appelant est prévenu", async () => {
  const onFermeture = jest.fn();
  await unTourDeParole({ onFermeture });

  // La demande est bien partie : c'est elle qui rend le silence anormal.
  expect(socketOuverte.ordres).toContain('fin_tour');

  // Juste avant l'échéance, on patiente encore : une transcription lente
  // n'est pas une panne, et raccrocher à tort coûte une session.
  jest.advanceTimersByTime(SANS_RETOUR_MS - 1);
  expect(onFermeture).not.toHaveBeenCalled();
  expect(socketOuverte.fermee).toBe(false);

  jest.advanceTimersByTime(1);

  // Raccroché, ET annoncé. L'annonce est le seul point qui compte : sans
  // elle, on aurait remplacé un micro qui tourne dans le vide par un micro
  // éteint en silence — la même séance perdue, en plus discret.
  expect(socketOuverte.fermee).toBe(true);
  expect(onFermeture).toHaveBeenCalledTimes(1);
});

test('une transcription qui revient désarme le chien de garde', async () => {
  const onFermeture = jest.fn();
  const onFinal = jest.fn();
  await unTourDeParole({ onFermeture, onFinal });

  socketOuverte.repondre({ type: 'final', texte: 'Je crois que c est au pluriel.' });

  jest.advanceTimersByTime(SANS_RETOUR_MS * 3);

  expect(onFinal).toHaveBeenCalledWith('Je crois que c est au pluriel.');
  expect(onFermeture).not.toHaveBeenCalled();
  expect(socketOuverte.fermee).toBe(false);
});

test('un tour rendu vide est un signe de vie comme un autre', async () => {
  // Le relais fonctionne, l'élève a soufflé dans son micro : le fournisseur
  // rend un tour vide. Raccrocher là-dessus rouvrirait une session à chaque
  // bruit de chaise — c'est le faux positif qui coûte le plus cher.
  const onFermeture = jest.fn();
  await unTourDeParole({ onFermeture });

  socketOuverte.repondre({ type: 'final', texte: '' });

  jest.advanceTimersByTime(SANS_RETOUR_MS * 3);
  expect(onFermeture).not.toHaveBeenCalled();
});

test("l'arrêt volontaire n'annonce aucune panne", async () => {
  // L'élève coupe son micro pendant qu'un tour attend sa transcription. Le
  // minuteur court toujours : s'il n'était pas éteint, il annoncerait une
  // panne huit secondes après une fermeture parfaitement normale — et le
  // micro se rouvrirait tout seul, sans que personne l'ait demandé.
  const onFermeture = jest.fn();
  const ecoute = await unTourDeParole({ onFermeture });

  ecoute.arreter();
  jest.advanceTimersByTime(SANS_RETOUR_MS * 3);

  expect(onFermeture).not.toHaveBeenCalled();
});
