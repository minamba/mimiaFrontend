/**
 * LE STYLE CHANGE SUR TOUS LES APPAREILS, SANS RECHARGEMENT — Camara, le
 * 16/09/2026 : « quand j'active Blue Sky, ça ne change pas sur tous les
 * ordinateurs et mobiles de manière instantanée », puis « il faut que ça
 * marche dans les deux sens ».
 *
 * Ces tests tiennent les deux sens sur le VRAI `modeTest` et le VRAI
 * `fluxReglages` — seule la route publique et `EventSource` sont remplacés.
 * Ce qui est vérifié n'est pas qu'une fonction a été appelée, mais que
 * l'attribut que lit App.css apparaît puis disparaît.
 */

let mockDrapeaux = { blueSky: false };

jest.mock('../lib/api/reglagesApi', () => ({
  getReglagesPublics: () => Promise.resolve({ data: mockDrapeaux }),
}));

const racine = document.documentElement;

/** Le flux du navigateur, remplacé : on garde la main pour annoncer. */
class FauxFlux {
  constructor(url) {
    this.url = url;
    this.ferme = false;
    // 1 = ouvert, 2 = définitivement fermé, comme dans la spécification. Les
    // tests qui simulent un refus du serveur le passent à 2 eux-mêmes.
    this.readyState = 1;
    FauxFlux.dernier = this;
  }

  close() {
    this.ferme = true;
    this.readyState = 2;
  }
}

/** Laisse les promesses déjà résolues se dérouler. */
const ticks = async (n = 8) => {
  for (let i = 0; i < n; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

beforeEach(() => {
  jest.resetModules();

  racine.removeAttribute('data-da');
  window.localStorage.clear();

  FauxFlux.dernier = null;
  window.EventSource = FauxFlux;
});

test('le flux s’ouvre une seule fois, sur la route publique', async () => {
  const { oublierReglages } = require('../lib/storage/modeTest');

  oublierReglages();
  await ticks();

  expect(FauxFlux.dernier).toBeTruthy();
  expect(FauxFlux.dernier.url).toMatch(/\/reglages\/flux$/);

  const premier = FauxFlux.dernier;
  oublierReglages();
  await ticks();

  // Une relecture n'ouvre pas une seconde écoute : un onglet, un flux.
  expect(FauxFlux.dernier).toBe(premier);
});

test('ALLUMÉ : l’annonce du serveur pose le style sans rechargement', async () => {
  mockDrapeaux = { blueSky: false };
  const { oublierReglages } = require('../lib/storage/modeTest');

  oublierReglages();
  await ticks();
  expect(racine.getAttribute('data-da')).toBeNull();

  // L'administrateur allume Blue Sky : le serveur annonce la clé, le
  // navigateur relit — et trouve la nouvelle valeur.
  mockDrapeaux = { blueSky: true };
  FauxFlux.dernier.onmessage({ data: '{"cle":"BLUE_SKY"}' });
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');
});

test('ÉTEINT : la même annonce retire le style', async () => {
  mockDrapeaux = { blueSky: true };
  const { oublierReglages } = require('../lib/storage/modeTest');

  oublierReglages();
  await ticks();
  expect(racine.getAttribute('data-da')).toBe('blue-sky');

  mockDrapeaux = { blueSky: false };
  FauxFlux.dernier.onmessage({ data: '{"cle":"BLUE_SKY"}' });
  await ticks();

  expect(racine.getAttribute('data-da')).toBeNull();
});

test('le retour sur l’onglet relit, même sans annonce', async () => {
  // Le cas du téléphone : l'écran s'éteint, le système coupe la connexion,
  // et l'onglet revient des heures plus tard avec un style périmé.
  mockDrapeaux = { blueSky: false };
  const { oublierReglages } = require('../lib/storage/modeTest');

  oublierReglages();
  await ticks();

  mockDrapeaux = { blueSky: true };
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible', configurable: true,
  });
  document.dispatchEvent(new Event('visibilitychange'));
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');
});

test('éteint par l’administration : aucune écoute, mais on relit quand même', async () => {
  // LE COUPE-CIRCUIT. Ce qui est vérifié n'est pas qu'un drapeau est lu, mais
  // qu'AUCUNE connexion longue n'est ouverte — et que le site continue
  // pourtant de suivre les changements de style.
  jest.useFakeTimers();
  mockDrapeaux = { blueSky: false, fluxSse: false };

  const { oublierReglages } = require('../lib/storage/modeTest');
  const { arreterFluxReglages } = require('../lib/storage/fluxReglages');

  oublierReglages();
  await ticks();

  expect(FauxFlux.dernier).toBeNull();

  mockDrapeaux = { blueSky: true, fluxSse: false };
  jest.advanceTimersByTime(60_000);
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');

  arreterFluxReglages();
  jest.useRealTimers();
});

test('rallumé : le temps réel reprend sans rechargement', async () => {
  jest.useFakeTimers();
  mockDrapeaux = { blueSky: false, fluxSse: false };

  const { oublierReglages } = require('../lib/storage/modeTest');
  const { arreterFluxReglages } = require('../lib/storage/fluxReglages');

  oublierReglages();
  await ticks();
  expect(FauxFlux.dernier).toBeNull();

  // L'administrateur rallume : la relecture périodique le découvre, et
  // l'onglet reprend son écoute sans que personne recharge la page.
  mockDrapeaux = { blueSky: false, fluxSse: true };
  jest.advanceTimersByTime(60_000);
  await ticks();

  expect(FauxFlux.dernier).toBeTruthy();

  // Et cette écoute fonctionne vraiment : une annonce change le style.
  mockDrapeaux = { blueSky: true, fluxSse: true };
  FauxFlux.dernier.onmessage({ data: '{"cle":"BLUE_SKY"}' });
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');

  arreterFluxReglages();
  jest.useRealTimers();
});

test('refus du serveur : on bascule au repli au lieu de marteler', async () => {
  // Un serveur saturé répond 503, un serveur déployé avant cette route répond
  // 404 : dans les deux cas `EventSource` ferme et ne retentera JAMAIS. Un
  // seul échec doit donc suffire à basculer — attendre cinq échecs qui ne
  // viendront pas laisserait l'onglet sans flux et sans relecture.
  jest.useFakeTimers();
  mockDrapeaux = { blueSky: false };

  const { oublierReglages } = require('../lib/storage/modeTest');
  const { arreterFluxReglages } = require('../lib/storage/fluxReglages');

  oublierReglages();
  await ticks();

  FauxFlux.dernier.readyState = 2;
  FauxFlux.dernier.onerror();

  mockDrapeaux = { blueSky: true };
  jest.advanceTimersByTime(60_000);
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');

  arreterFluxReglages();
  jest.useRealTimers();
});

test('coupure passagère : on laisse le navigateur se reconnecter', async () => {
  jest.useFakeTimers();
  mockDrapeaux = { blueSky: false };

  const { oublierReglages } = require('../lib/storage/modeTest');
  const { arreterFluxReglages } = require('../lib/storage/fluxReglages');

  oublierReglages();
  await ticks();

  // 0 = reconnexion en cours. Le navigateur s'en charge : installer en plus
  // une relecture par minute ferait doublon avec le flux pour toute la vie de
  // l'onglet, alors qu'une coupure de réseau dure quelques secondes.
  mockDrapeaux = { blueSky: true };
  FauxFlux.dernier.readyState = 0;
  FauxFlux.dernier.onerror();

  jest.advanceTimersByTime(60_000);
  await ticks();

  expect(racine.getAttribute('data-da')).toBeNull();

  // Et à la reconnexion, le flux reprend son office.
  FauxFlux.dernier.onmessage({ data: '{"cle":"BLUE_SKY"}' });
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');

  arreterFluxReglages();
  jest.useRealTimers();
});

test('sans EventSource, on relit périodiquement plutôt que jamais', async () => {
  jest.useFakeTimers();
  delete window.EventSource;

  mockDrapeaux = { blueSky: false };
  const { oublierReglages } = require('../lib/storage/modeTest');
  const { arreterFluxReglages } = require('../lib/storage/fluxReglages');

  oublierReglages();
  await ticks();

  mockDrapeaux = { blueSky: true };
  jest.advanceTimersByTime(60_000);
  await ticks();

  expect(racine.getAttribute('data-da')).toBe('blue-sky');

  arreterFluxReglages();
  jest.useRealTimers();
});
