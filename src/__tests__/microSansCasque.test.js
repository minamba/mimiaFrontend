/**
 * LE DEMI-DUPLEX, POUR UN ÉLÈVE SANS CASQUE.
 *
 * Le micro reste normalement ouvert pendant que le professeur parle : c'est ce
 * qui permet de l'interrompre. Sur un haut-parleur, ce micro ouvert capte la
 * voix du professeur, la transcrit, et la lui renvoie comme une interruption —
 * il se coupe alors lui-même, en boucle, et le cours devient inutilisable.
 *
 * La parade tient à deux signaux du lecteur, et c'est leur ORDRE qui compte :
 *
 * 1. `auDebutDeParole` doit partir AVANT la première syllabe. Une microseconde
 *    après, le début du mot est déjà entré dans le micro — et un seul mot suffit
 *    à déclencher l'interruption qu'on cherche à empêcher.
 *
 * 2. `auSilence` doit partir APRÈS le dernier son, sans quoi le micro rouvrirait
 *    sur la fin de la phrase et le problème reviendrait par l'autre bout.
 *
 * Ces deux règles ne s'entendent qu'en séance, sur un vrai haut-parleur, et
 * elles se perdraient au premier remaniement du lecteur sans que rien ne le
 * signale. D'où ce test.
 */

import { voixService } from '../lib/storage/voixService';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

// ----------------------------------------------------------- graphe audio feint
//
// On ne teste pas le son mais la CHRONOLOGIE : chaque événement s'inscrit dans
// le même journal, dans l'ordre où il se produit.

let journal;
let horloge;

class FausseSource {
  connect(suite) { return suite; }

  start() {
    journal.push('son');
  }

  stop() {}
}

class FauxContexte {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }

  get currentTime() {
    return horloge;
  }

  createBuffer(canaux, longueur, frequence) {
    const donnees = new Float32Array(longueur);
    return { donnees, duration: longueur / frequence, getChannelData: () => donnees };
  }

/**
   * Le robinet de coupure. Les tests ne mesurent pas le fondu — ils
   * vérifient l'ordonnancement — mais le graphe doit exister, sans quoi
   * `programmer` échoue avant même de programmer quoi que ce soit.
   */
/**
   * Le passe-bas de sortie. Les tests ne mesurent pas le filtrage — ils
   * verifient l ordonnancement — mais le noeud doit exister, sinon le graphe
   * ne se construit pas.
   */
  createBiquadFilter() {
    return { type: null, frequency: { value: 0 }, connect: (suite) => suite };
  }

  createGain() {
    return {
      gain: {
        value: 1,
        cancelScheduledValues() {},
        setValueAtTime() {},
        linearRampToValueAtTime() {},
      },
      connect: (suite) => suite,
    };
  }

  createBufferSource() {
    return new FausseSource();
  }

  resume() {
    return Promise.resolve();
  }
}

function pcm(valeurs) {
  const octets = new Uint8Array(valeurs.length * 2);
  const vue = new DataView(octets.buffer);
  valeurs.forEach((v, i) => vue.setInt16(i * 2, v, true));
  return octets;
}

function fluxDe(blocs) {
  let i = 0;
  return {
    getReader: () => ({
      read: () =>
        Promise.resolve(i < blocs.length ? { done: false, value: blocs[i++] } : { done: true }),
    }),
  };
}

const attendre = async (condition, tours = 200) => {
  for (let i = 0; i < tours; i += 1) {
    if (condition()) return;
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

beforeEach(() => {
  journal = [];
  horloge = 0;
  window.AudioContext = FauxContexte;
  global.AbortController = class {
    constructor() { this.signal = {}; }
    abort() {}
  };
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

// --------------------------------------------------------------------- tests

test('annonce la reprise de parole AVANT le premier son', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      body: fluxDe([pcm(new Array(8000).fill(500))]),
    }),
  );

  const lecteur = voixService.creerLecteur();
  lecteur.auDebutDeParole = () => journal.push('micro fermé');
  lecteur.auSilence = () => journal.push('micro rouvert');

  lecteur.dire('Bonjour, nous allons voir les fractions.');

  await attendre(() => journal.includes('son'));
  lecteur.arreter();

  // L'ordre, et rien d'autre : le micro doit être fermé quand le premier
  // échantillon part vers les haut-parleurs.
  expect(journal.indexOf('micro fermé')).toBeGreaterThanOrEqual(0);
  expect(journal.indexOf('micro fermé')).toBeLessThan(journal.indexOf('son'));
});

test('ne réclame la fermeture qu’une fois par prise de parole', async () => {
  // Deux blocs réseau : le lecteur programme deux morceaux, mais la PAROLE est
  // la même. Une fermeture par bloc rouvrirait puis refermerait le micro au
  // milieu d'une phrase, ce qui hacherait la transcription de l'élève.
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      body: fluxDe([
        pcm(new Array(8000).fill(500)),
        pcm(new Array(8000).fill(-500)),
      ]),
    }),
  );

  const lecteur = voixService.creerLecteur();
  lecteur.auDebutDeParole = () => journal.push('micro fermé');

  lecteur.dire('Une phrase découpée en deux par le réseau.');

  await attendre(() => journal.filter((e) => e === 'son').length >= 2);
  lecteur.arreter();

  expect(journal.filter((e) => e === 'micro fermé')).toHaveLength(1);
});
