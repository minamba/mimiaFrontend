/**
 * UNE ÉPELLATION SE LIT LETTRE PAR LETTRE.
 *
 * POURQUOI CE TRAITEMENT EXISTE
 * -----------------------------
 * « Est-ce qu'on écrit "avait" ou "avaient" ? », posée à voix haute, est
 * littéralement « est-ce qu'on écrit X ou X ? » : l'élève entend deux fois le
 * même son. Le professeur de langue épelle donc ce qui les sépare — « avait,
 * a-i-t, ou avaient, a-i-e-n-t ».
 *
 * Encore faut-il que la synthèse ne lise pas « a-i-e-n-t » comme un mot. Les
 * virgules l'y obligent.
 *
 * CE QUE CES TESTS PROTÈGENT SURTOUT, C'EST L'AUTRE SENS. Un motif trop large
 * hacherait « peut-être » en « p, e, u, t, ê, t, r, e » — et le professeur se
 * mettrait à épeler la moitié de ses phrases. C'est le genre de dégât qui ne
 * se voit pas en relisant : il ne s'entend qu'en séance.
 */

import { voixService } from '../lib/storage/voixService';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

/**
 * Ce qui part vraiment à la synthèse.
 *
 * `prononcable` n'est pas exporté — et c'est bien ainsi, c'est un détail
 * interne. On l'observe donc par le seul endroit qui compte : le texte envoyé.
 */
const parle = async (texte) => {
  const envoyes = [];

  global.fetch = jest.fn((url, options) => {
    envoyes.push(JSON.parse(options.body).texte);
    return Promise.resolve({ ok: true, status: 200, body: fluxVide() });
  });

  const lecteur = voixService.creerLecteur();
  lecteur.dire(texte);

  // La mise en file est synchrone, l'appel réseau ne l'est pas : sans ces
  // tours de boucle, on lirait le tableau avant que rien n'y soit entré.
  for (let i = 0; i < 30; i += 1) await Promise.resolve();

  lecteur.arreter();
  return envoyes.join(' ');
};

const fluxVide = () => ({
  getReader: () => ({ read: () => Promise.resolve({ done: true }) }),
});

beforeEach(() => {
  window.AudioContext = class {
    constructor() { this.state = 'running'; this.destination = {}; }

    get currentTime() { return 0; }

    createBuffer(c, l, f) {
      const d = new Float32Array(l);
      return { donnees: d, duration: l / f, getChannelData: () => d };
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

  createBufferSource() { return { connect: (suite) => suite, start() {}, stop() {} }; }

    resume() { return Promise.resolve(); }
  };

  global.AbortController = class { constructor() { this.signal = {}; } abort() {} };
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

test('les lettres épelées sont séparées, pour être entendues une par une', async () => {
  const dit = await parle("On écrit avait, a-i-t, ou avaient, a-i-e-n-t ?");

  expect(dit).toContain('a, i, t');
  expect(dit).toContain('a, i, e, n, t');
  expect(dit).not.toContain('a-i-e-n-t');
});

test('deux lettres suffisent — mangé, e accent aigu, ou manger, e-r', async () => {
  const dit = await parle('Tu écris mangé ou manger, e-r ?');

  expect(dit).toContain('e, r');
});

describe("ce qui ne doit surtout PAS être haché", () => {
  test.each([
    ['Ça va peut-être marcher.', 'peut-être'],
    ['C’est le livre de sa grand-mère.', 'grand-mère'],
    ['Est-ce qu’il a compris ?', 'Est-ce'],
    ['Où est-il allé ?', 'est-il'],
    ['Pourquoi y a-t-il un s ?', 'a-t-il'],
    ['Vas-y, essaie encore.', 'Vas-y'],
  ])('%j garde « %s » intact', async (phrase, mot) => {
    const dit = await parle(phrase);
    await Promise.resolve();

    expect(dit).toContain(mot);
  });
});
