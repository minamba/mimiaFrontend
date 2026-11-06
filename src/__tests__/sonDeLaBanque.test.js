/**
 * LE SON DE LA BANQUE SE JOUE, ET SANS FILTRE — Camara, le 05/11/2026 : « il annonce
 * la syllabe et l'audio doit se lancer tout seul ». Le serveur répond l'en-tête
 * X-Son-Banque : le son part vers la sortie directe, pas vers les passe-bas.
 */

import { voixService } from '../lib/storage/voixService';
import { texteParle } from '../lib/storage/ardoise';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

let horloge;
let demarrees;
let requetes;
let destination;

const noeud = (nom) => {
  const n = { nom, suites: [], connect(suite) { this.suites.push(suite); return suite; } };
  return n;
};

class FausseSource {
  constructor() { this.buffer = null; this.noeud = noeud('source'); }
  connect(suite) { return this.noeud.connect(suite); }
  start() { demarrees.push(this); }
  stop() {}
}

class FauxContexte {
  constructor() {
    this.state = 'running';
    destination = noeud('destination');
    this.destination = destination;
    this.sampleRate = 24000;
  }
  get currentTime() { return horloge; }
  createBuffer(canaux, longueur, frequence) {
    const donnees = new Float32Array(longueur);
    return { donnees, duration: longueur / frequence, getChannelData: () => donnees };
  }
  createBiquadFilter() { return Object.assign(noeud('filtre'), { type: null, frequency: { value: 0 } }); }
  createGain() {
    return Object.assign(noeud('gain'), {
      gain: { value: 1, cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {} },
    });
  }
  createAnalyser() { return Object.assign(noeud('analyseur'), { fftSize: 0, getByteTimeDomainData() {} }); }
  createBufferSource() { return new FausseSource(); }
  resume() { return Promise.resolve(); }
}

function fluxDe(blocs) {
  let i = 0;
  return { getReader: () => ({ read: () => Promise.resolve(i < blocs.length ? { done: false, value: blocs[i++] } : { done: true }) }) };
}

const attendre = async (condition, tours = 400) => {
  for (let i = 0; i < tours; i += 1) {
    if (condition()) return;
    horloge += 1;
    jest.advanceTimersByTime(1000);
    for (let k = 0; k < 6; k += 1) await Promise.resolve();
  }
};

/** Le chemin d'une source jusqu'à la destination : passe-t-il par un filtre ? */
const passeParUnFiltre = (source) => {
  const vus = new Set();
  const marcher = (n) => {
    if (!n || vus.has(n)) return false;
    vus.add(n);
    if (n.nom === 'filtre') return true;
    return (n.suites ?? []).some(marcher);
  };
  return marcher(source.noeud);
};
const atteintLaDestination = (source) => {
  const vus = new Set();
  const marcher = (n) => {
    if (!n || vus.has(n)) return false;
    vus.add(n);
    if (n === destination) return true;
    return (n.suites ?? []).some(marcher);
  };
  return marcher(source.noeud);
};

beforeEach(() => {
  jest.useFakeTimers();
  horloge = 0;
  demarrees = [];
  requetes = [];
  window.AudioContext = FauxContexte;
  global.AbortController = class { constructor() { this.signal = {}; } abort() {} };
  global.fetch = jest.fn((url, options) => {
    const charge = JSON.parse(options.body);
    requetes.push(charge);
    const banque = charge.langue === 'fr' && charge.texte === 'bi';
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: { get: (nom) => (banque && nom === 'X-Son-Banque' ? '1' : null) },
      body: fluxDe(banque ? [new Uint8Array(38400), new Uint8Array(28000)] : [new Uint8Array(40000)]),
    });
  });
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete global.fetch;
});

test("l'annonce passe par le filtre, la syllabe de la banque non, et les deux se jouent", async () => {
  const lecteur = voixService.creerLecteur();
  lecteur.configurer({ avatar: 'adrien', age: 7 });
  // Comme Chat.js : le texte passe par texteParle, qui change la balise en bornes de langue.
  lecteur.alimenter(texteParle("Voici la prochaine syllabe.\n\n[FR]bi[/FR]\n\nQu'as-tu entendu ?", { bornes: true }));
  lecteur.terminer();

  await attendre(() => requetes.length >= 3 && demarrees.length >= 4);
  lecteur.arreter();

  expect(requetes.map((r) => [r.texte, r.langue])).toEqual([
    ['Voici la prochaine syllabe.', null],
    ['bi', 'fr'],
    ["Qu'as-tu entendu ?", null],
  ]);

  const annonce = demarrees[0];
  const syllabe = demarrees.slice(1, 3);
  expect(atteintLaDestination(annonce)).toBe(true);
  expect(passeParUnFiltre(annonce)).toBe(true);
  expect(syllabe.length).toBeGreaterThanOrEqual(2);
  syllabe.forEach((s) => {
    expect(atteintLaDestination(s)).toBe(true);
    expect(passeParUnFiltre(s)).toBe(false);
  });
});
