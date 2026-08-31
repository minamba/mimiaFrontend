/**
 * La synthèse vocale lue AU FIL DE L'EAU.
 *
 * Ce que ces tests protègent tient en une phrase : le serveur diffuse le PCM
 * par blocs, et le navigateur doit les jouer à mesure plutôt que d'attendre le
 * dernier octet. Trois choses peuvent casser sans qu'on l'entende en relisant
 * le code — et deux d'entre elles ne s'entendraient qu'à l'oreille, en séance.
 *
 * 1. LE REPORT D'OCTET ORPHELIN. Un bloc du réseau n'a aucune raison de finir
 *    au milieu d'un échantillon 16 bits. S'il finit sur un octet impair et
 *    qu'on ne reporte pas cet octet sur le bloc suivant, poids fort et poids
 *    faible s'inversent pour tout le reste du passage : ce n'est plus une voix,
 *    c'est du bruit blanc. Aucune exception, aucun log, juste du bruit.
 *
 * 2. LE DÉPART ANTICIPÉ. Si la première syllabe n'est programmée qu'une fois le
 *    flux terminé, tout le bénéfice est perdu et rien ne le signale : ça
 *    marche, c'est juste lent — l'état exact d'où l'on vient.
 *
 * 3. L'ORDRE. Le passage suivant se télécharge pendant que le courant joue. Si
 *    ses morceaux pouvaient être programmés en avance, une réponse rapide
 *    passerait devant une lente et le professeur parlerait dans le désordre.
 */

import { voixService } from '../lib/storage/voixService';

// La sonde « le serveur a-t-il une clé ? » n'est faite qu'UNE fois par module,
// et sa réponse est mémorisée. Elle doit donc répondre à chaque test, sans
// dépendre d'un mock qu'un `restoreAllMocks` remettrait à zéro entre-temps.
jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

// ----------------------------------------------------------- graphe audio feint
//
// On ne teste pas le son, on teste l'ORDONNANCEMENT. Ce faux graphe retient
// donc ce qui a été programmé, et à quel instant.

let horloge;
let programmes;

class FausseSource {
  constructor() {
    this.buffer = null;
  }

  connect() {}

  start(instant) {
    programmes.push({ instant, echantillons: Array.from(this.buffer.donnees) });
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
    return {
      donnees,
      duration: longueur / frequence,
      getChannelData: () => donnees,
    };
  }

  createBufferSource() {
    return new FausseSource();
  }

  resume() {
    return Promise.resolve();
  }
}

/** Un flux qui rend les blocs demandés, puis se termine. */
function fluxDe(blocs) {
  let i = 0;
  return {
    getReader: () => ({
      read: () =>
        Promise.resolve(
          i < blocs.length ? { done: false, value: blocs[i++] } : { done: true },
        ),
    }),
  };
}

/** Des octets PCM dont on peut vérifier la valeur après coup. */
function pcm(valeurs) {
  const octets = new Uint8Array(valeurs.length * 2);
  const vue = new DataView(octets.buffer);
  valeurs.forEach((v, i) => vue.setInt16(i * 2, v, true));
  return octets;
}

beforeEach(() => {
  horloge = 0;
  programmes = [];
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

test("recolle un échantillon coupé en deux par le découpage du réseau", async () => {
  // Trois échantillons, mais le premier bloc s'arrête au milieu du deuxième.
  const tout = pcm([1000, -2000, 3000]);

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      body: fluxDe([tout.slice(0, 3), tout.slice(3)]),
    }),
  );

  const lecteur = voixService.creerLecteur();
  lecteur.dire('peu importe');

  await attendre(() => programmes.length >= 2);
  lecteur.arreter();

  const rendus = programmes.flatMap((p) => p.echantillons);

  // Les valeurs doivent ressortir intactes. Sans le report de l'octet
  // orphelin, la deuxième vaudrait n'importe quoi — et surtout pas -2000.
  expect(rendus.length).toBe(3);
  expect(Math.round(rendus[0] * 0x8000)).toBe(1000);
  expect(Math.round(rendus[1] * 0x8000)).toBe(-2000);
  expect(Math.round(rendus[2] * 0x8000)).toBe(3000);
});

test('programme le premier morceau sans attendre la fin du flux', async () => {
  let rendreLeSecond;
  const attenteDuSecond = new Promise((r) => { rendreLeSecond = r; });

  const premier = pcm(new Array(8000).fill(500)); // 16 000 octets : au-delà de l'amorce
  const second = pcm(new Array(8000).fill(-500));

  let appel = 0;
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: () => {
            appel += 1;
            if (appel === 1) return Promise.resolve({ done: false, value: premier });
            if (appel === 2) return attenteDuSecond.then(() => ({ done: false, value: second }));
            return Promise.resolve({ done: true });
          },
        }),
      },
    }),
  );

  const lecteur = voixService.creerLecteur();
  lecteur.dire('peu importe');

  // LE POINT DU TEST : du son est programmé alors que le flux n'est pas fini.
  await attendre(() => programmes.length >= 1);
  expect(programmes.length).toBe(1);

  rendreLeSecond();
  await attendre(() => programmes.length >= 2);

  // Et le second s'enchaîne exactement là où le premier s'arrête.
  const finDuPremier = programmes[0].instant + 8000 / FREQUENCE;
  expect(programmes[1].instant).toBeCloseTo(finDuPremier, 5);

  lecteur.arreter();
});

test("ne programme rien quand l'élève a coupé", async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      body: fluxDe([pcm(new Array(8000).fill(500))]),
    }),
  );

  const lecteur = voixService.creerLecteur();
  lecteur.dire('peu importe');
  lecteur.arreter();

  await new Promise((r) => setTimeout(r, 40));
  expect(programmes.length).toBe(0);
});

/** Attend qu'une condition devienne vraie, sans dormir plus que nécessaire. */
async function attendre(condition, limite = 1500) {
  const debut = Date.now();
  while (!condition()) {
    if (Date.now() - debut > limite) throw new Error("condition jamais atteinte");
    await new Promise((r) => setTimeout(r, 5));
  }
}
