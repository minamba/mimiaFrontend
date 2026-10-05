/**
 * UN POINT N'EST PAS TOUJOURS UNE FIN DE PHRASE — Camara, le 28/09/2026 :
 * « toutes les coupures que j'ai détectées sont avec le professeur
 * d'informatique ». Lui seul dit « 0.2 + 0.1 n'est pas égal à 0.3 » ou
 * « liste.append(x) » : chaque point y passait pour une fin de phrase, et la
 * synthèse recevait des bribes de deux caractères — « il dit une lettre, ça
 * coupe ».
 *
 * Ce que ces tests protègent :
 * 1. UN POINT SANS BLANC DERRIÈRE ne coupe pas : le nombre, le nom de
 *    méthode, la version restent dans leur phrase.
 * 2. EN FIN DE TAMPON, une phrase finie sur une lettre part tout de suite ;
 *    finie sur un chiffre, elle attend le fragment suivant.
 * 3. UNE BRIBE SEULE (« 1. ») n'est pas dite seule : le filet patiente une
 *    fois, et elle part avec la suite.
 * 4. L'ÉCRAN dit « écrit au tableau » tant qu'une ardoise est ouverte.
 */

import { voixService } from '../lib/storage/voixService';
import { ardoiseOuverte } from '../lib/storage/ardoise';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

class FausseSource {
  constructor() { this.buffer = null; }

  connect(suite) { return suite; }

  start() {}

  stop() {}
}

class FauxContexte {
  constructor() {
    this.state = 'running';
    this.destination = {};
    this.currentTime = 0;
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

  resume() { return Promise.resolve(); }
}

/** Une synthèse qui rend dix secondes de son d'un bloc : aucune urgence. */
function synthese() {
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
            return Promise.resolve({ done: false, value: new Uint8Array(10 * FREQUENCE * 2) });
          },
        }),
      },
    });
  });
}

const textesEnvoyes = () => global.fetch.mock.calls.map((appel) => JSON.parse(appel[1].body).texte);

const attendre = async (condition, maxMs = 300) => {
  const debut = Date.now();
  while (!condition() && Date.now() - debut < maxMs) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, 5); });
  }
};

const pause = (ms) => new Promise((r) => { setTimeout(r, ms); });

beforeEach(() => {
  window.AudioContext = FauxContexte;
  global.fetch = synthese();
  global.AbortController = class {
    constructor() { this.signal = {}; }

    abort() {}
  };
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

test('« 0.2 + 0.1 n’est pas égal à 0.3 » est une seule phrase, pas quatre bribes', async () => {
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter('Retiens bien ceci : 0.2 + 0.1 n’est pas égal à 0.3 en Python. ');
  await attendre(() => global.fetch.mock.calls.length >= 1, 800);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(textesEnvoyes()[0]).toMatch(/0\.2 .*0\.1 .*0\.3 en Python\./);

  lecteur.arreter();
});

test('« liste.append(x) » et « Python 3.12 » ne coupent pas la phrase', async () => {
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter('Tu écris liste.append(x) pour ajouter x à la fin, comme en Python 3.12 tout simplement. ');
  await attendre(() => global.fetch.mock.calls.length >= 1, 800);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(textesEnvoyes()[0]).toMatch(/liste\.append\(x\).*3\.12 tout simplement\./);

  lecteur.arreter();
});

test('en fin de tampon, une phrase finie sur une lettre part ; finie sur un chiffre, elle attend', async () => {
  const lecteur = voixService.creerLecteur();

  // Devant une ardoise qui s'ouvre, le texte prononçable s'arrête net après
  // « ça. » : cette phrase doit se dire tout de suite.
  lecteur.alimenter('Regarde bien ce que je pose au tableau, et compare avec ça.');
  await attendre(() => global.fetch.mock.calls.length >= 1, 800);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(textesEnvoyes()[0]).toMatch(/compare avec ça\.$/);

  // « à 0. » : c'est presque toujours le début de « 0.3 ». On attend.
  lecteur.alimenter('Et là, on obtient exactement la valeur qui vaut à peu près 0.');
  await pause(500);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  lecteur.alimenter('3 comme prévu. ');
  await attendre(() => global.fetch.mock.calls.length >= 2, 800);
  expect(textesEnvoyes()[1]).toMatch(/0\.3 comme prévu\./);

  lecteur.arreter();
});

test('« 1. » laissé seul n’est pas prononcé seul : le filet patiente, puis tout part ensemble', async () => {
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter('1. ');
  await pause(600); // au-delà du filet ordinaire (400 ms)
  expect(global.fetch).not.toHaveBeenCalled();

  lecteur.alimenter('Ouvre le fichier et lis la première ligne. ');
  await attendre(() => global.fetch.mock.calls.length >= 1, 800);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(textesEnvoyes()[0]).toMatch(/^1\. Ouvre le fichier/);

  lecteur.arreter();
});

test('une bribe vraiment seule finit par partir : le filet ne patiente qu’une fois', async () => {
  const lecteur = voixService.creerLecteur();

  // Moins de cinq mots : depuis le 04/10/2026 la bribe attend plus longtemps
  // la phrase suivante (voir MOTS_SURVEILLES) — mais toujours une seule fois.
  lecteur.alimenter('Bien. ');
  await attendre(() => global.fetch.mock.calls.length >= 1, 5500);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(textesEnvoyes()[0]).toBe('Bien.');

  lecteur.arreter();
}, 9000);

test('l’écran sait quand le professeur écrit au tableau', () => {
  expect(ardoiseOuverte('Regarde. [ARDOISE]\ndef f(x):\n    return x')).toBe(true);
  expect(ardoiseOuverte('Regarde. [ARDOISE]\ndef f(x):\n    return x\n[/ARDOISE] Voilà.')).toBe(false);
  expect(ardoiseOuverte('Deux : [ARDOISE]a[/ARDOISE] puis [ARDOISE]b')).toBe(true);
  expect(ardoiseOuverte('Sans tableau du tout.')).toBe(false);
  expect(ardoiseOuverte('')).toBe(false);
  expect(ardoiseOuverte(null)).toBe(false);
});
