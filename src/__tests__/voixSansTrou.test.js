/**
 * PAS DE TROU AU MILIEU D'UNE RÉPONSE — Camara, le 28/09/2026 : « pas de
 * coupures ni de saccades dans la façon de parler des professeurs ».
 *
 * La première phrase est courte et se dit vite ; la suivante n'était envoyée à
 * la synthèse qu'à 260 caractères reçus. Quand la synthèse n'avait pas le
 * temps, le professeur se taisait au milieu de sa réponse, puis reprenait.
 *
 * Ce que ces tests protègent :
 * 1. QUAND LA VOIX VA MANQUER DE SON, la phrase complète en attente part tout
 *    de suite, même courte — sans attendre 260 caractères ni le filet.
 * 2. QUAND IL RESTE DU SON, rien ne change : on attend le groupe entier, pour
 *    garder une vraie intonation.
 */

import { voixService } from '../lib/storage/voixService';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

let horloge;
let programmes;

class FausseSource {
  constructor() { this.buffer = null; }

  connect(suite) { return suite; }

  start(instant) { programmes.push({ instant, duree: this.buffer.duration }); }

  stop() {}
}

class FauxContexte {
  constructor() {
    this.state = 'running';
    this.destination = {};
  }

  get currentTime() { return horloge; }

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

/** Des octets PCM : `echantillons` échantillons de 16 bits. */
function pcm(echantillons) {
  return new Uint8Array(echantillons * 2);
}

/** Une synthèse qui rend, d'un bloc, `secondes` de son par passage. */
function synthese(secondes) {
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
            return Promise.resolve({ done: false, value: pcm(secondes * FREQUENCE) });
          },
        }),
      },
    });
  });
}

const attendre = async (condition, maxMs = 300) => {
  const debut = Date.now();
  while (!condition() && Date.now() - debut < maxMs) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, 5); });
  }
};

const PREMIERE = 'Bonjour Sanaba, aujourd’hui on va travailler les additions ensemble. ';
const SECONDE = 'Prends ton ardoise et écris le nombre neuf. ';

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

test('quand la voix va manquer de son, la phrase suivante part sans attendre 260 caractères', async () => {
  // Une seconde de son par passage : la première phrase sera finie bien avant
  // que 260 caractères n'arrivent.
  global.fetch = synthese(1);
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter(PREMIERE);
  await attendre(() => programmes.length >= 1);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // La deuxième phrase, courte, arrive : il reste ~1 s de son programmé.
  lecteur.alimenter(SECONDE);
  await attendre(() => global.fetch.mock.calls.length >= 2, 150);

  // Partie tout de suite — pas dans 400 ms (le filet), pas à 260 caractères.
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(JSON.parse(global.fetch.mock.calls[1][1].body).texte).toMatch(/ardoise/);

  lecteur.arreter();
});

test('quand il reste du son, on attend le groupe entier, comme avant', async () => {
  // Dix secondes de son par passage : aucune urgence.
  global.fetch = synthese(10);
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter(PREMIERE);
  await attendre(() => programmes.length >= 1);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  lecteur.alimenter(SECONDE);
  await attendre(() => global.fetch.mock.calls.length >= 2, 150);

  // Toujours une seule synthèse : la phrase attend ses 260 caractères — ou le
  // filet de 400 ms, qui n'est pas encore tombé.
  expect(global.fetch).toHaveBeenCalledTimes(1);

  lecteur.arreter();
});

/**
 * LE FLUX QUI ARRIVE AU COMPTE-GOUTTES — Camara, le 28/09/2026, avec le
 * professeur d'informatique : « il dit une lettre, ça coupe, puis un temps
 * d'attente indéterminé ». Chaque morceau reçu était joué à l'instant, même
 * de cinquante millisecondes. Après un trou, on ré-accumule une seconde.
 */
function fluxManuel() {
  const attentes = [];
  const reponses = [];
  let index = 0;

  return {
    fetch: jest.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: () => {
            const i = index++;
            if (reponses[i]) return Promise.resolve(reponses[i]);
            return new Promise((r) => { attentes[i] = r; });
          },
        }),
      },
    })),
    rendre(valeur) {
      const i = reponses.length;
      const reponse = valeur === null ? { done: true } : { done: false, value: valeur };
      reponses.push(reponse);
      if (attentes[i]) attentes[i](reponse);
    },
  };
}

test('après un trou en plein passage, les bribes sont retenues puis jouées d’un bloc', async () => {
  const flux = fluxManuel();
  global.fetch = flux.fetch;
  const lecteur = voixService.creerLecteur();
  const trous = [];
  lecteur.surTrou = (s) => trous.push(s);

  lecteur.dire('Un passage assez long pour être diffusé au fil de l’eau, morceau par morceau.');

  // Une seconde de son : jouée tout de suite (au-delà de l'amorce).
  flux.rendre(pcm(FREQUENCE));
  await attendre(() => programmes.length >= 1);
  expect(programmes).toHaveLength(1);

  // Le son est épuisé depuis deux secondes quand une bribe de 50 ms arrive.
  horloge = 3.1;
  flux.rendre(pcm(FREQUENCE / 20));
  // Le lecteur dort jusqu'à 0,4 s avant la fin du son programmé, en temps
  // réel : il faut lui laisser ce temps avant qu'il lise la bribe.
  await attendre(() => trous.length >= 1, 2000);
  expect(programmes).toHaveLength(1); // retenue, pas jouée seule
  expect(trous[0]).toBeGreaterThan(1.5);

  // Trois autres bribes : toujours rien — moins d'une seconde en réserve.
  flux.rendre(pcm(FREQUENCE / 20));
  flux.rendre(pcm(FREQUENCE / 20));
  flux.rendre(pcm(FREQUENCE / 20));
  await new Promise((r) => { setTimeout(r, 30); });
  expect(programmes).toHaveLength(1);

  // La réserve atteint une seconde : tout part d'un bloc, bord à bord.
  flux.rendre(pcm(FREQUENCE));
  await attendre(() => programmes.length >= 6, 2000);
  expect(programmes).toHaveLength(6);
  expect(programmes[1].instant).toBeGreaterThanOrEqual(3.1);
  for (let i = 2; i < 6; i += 1) {
    expect(programmes[i].instant).toBeCloseTo(programmes[i - 1].instant + programmes[i - 1].duree, 5);
  }

  flux.rendre(null);
  lecteur.arreter();
});

/**
 * LA RÉSERVE DE SON SE COMPTE SUR TOUT CE QUI EST EN ROUTE — Camara, le
 * 28/09/2026, en local : « après "sort en premier", un très long silence, puis
 * tout ce qu'il a dit derrière était saccadé, avec de longs temps de pause ».
 * La réserve ne comptait que le son programmé, soit toujours moins d'une
 * demi-seconde : chaque phrase partait seule à la synthèse, et la synthèse
 * mettait ce jour-là jusqu'à sept secondes à répondre.
 */
const TROISIEME = 'Ensuite tu ajoutes le nombre trois à ta liste, puis tu recommences. ';
const QUATRIEME = 'Et pour finir, tu affiches le résultat au tableau, tout simplement. ';

test('deux phrases se préparent d’avance, pas une seule', async () => {
  global.fetch = synthese(10);
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter(PREMIERE);
  await attendre(() => programmes.length >= 1);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // Trois passages de plus en file : deux se téléchargent pendant que le
  // premier joue, le troisième attend son tour.
  lecteur.dire(SECONDE);
  lecteur.dire(TROISIEME);
  lecteur.dire(QUATRIEME);
  await attendre(() => global.fetch.mock.calls.length >= 3, 300);

  expect(global.fetch).toHaveBeenCalledTimes(3);

  lecteur.arreter();
});

test('la réserve compte le son reçu mais pas encore programmé : on attend le groupe', async () => {
  // Dix secondes de son, dont quelques dixièmes seulement sont programmés à
  // la fois : la réserve, elle, vaut bien dix secondes.
  global.fetch = synthese(10);
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter(PREMIERE);
  await attendre(() => programmes.length >= 1);

  lecteur.alimenter(SECONDE);
  lecteur.alimenter(TROISIEME);
  await attendre(() => global.fetch.mock.calls.length >= 2, 250);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(lecteur.sonRestant()).toBeGreaterThan(5);

  lecteur.arreter();
});

test('quand la réserve fond entre deux phrases, le groupe part à temps, sans attendre la phrase suivante', async () => {
  // Trois secondes de son : la réserve passe sous 2,5 s pendant la lecture,
  // sans qu'aucune nouvelle phrase n'arrive. Le réveil doit envoyer le groupe.
  global.fetch = synthese(3);
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter(PREMIERE);
  await attendre(() => programmes.length >= 1);
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // Une seconde de son s'écoule : il en reste deux — sous le seuil.
  lecteur.alimenter(SECONDE);
  horloge = 1.2;
  await attendre(() => global.fetch.mock.calls.length >= 2, 1500);

  expect(global.fetch).toHaveBeenCalledTimes(2);

  lecteur.arreter();
});

test('la voix a rattrapé le texte : la phrase suivante part sans attendre 260 caractères', async () => {
  global.fetch = synthese(1);
  const lecteur = voixService.creerLecteur();

  lecteur.alimenter(PREMIERE);
  await attendre(() => programmes.length >= 1);

  // Le son est fini depuis longtemps, la boucle s'est arrêtée.
  horloge = 5;
  await attendre(() => !lecteur.enLecture, 1500);

  lecteur.alimenter(SECONDE);
  await attendre(() => global.fetch.mock.calls.length >= 2, 300);
  expect(global.fetch).toHaveBeenCalledTimes(2);

  lecteur.arreter();
});

test('la fin du flux joue ce qui est retenu, même sous une seconde', async () => {
  const flux = fluxManuel();
  global.fetch = flux.fetch;
  const lecteur = voixService.creerLecteur();

  lecteur.dire('Une phrase qui finit sur une bribe.');
  flux.rendre(pcm(FREQUENCE));
  await attendre(() => programmes.length >= 1);

  horloge = 3;
  flux.rendre(pcm(FREQUENCE / 20));
  flux.rendre(null);
  await attendre(() => programmes.length >= 2, 2000);
  expect(programmes).toHaveLength(2);

  lecteur.arreter();
});

/**
 * LA REQUÊTE DOUBLÉE — Camara, le 28/09/2026 : « une pause plus longue que
 * prévu à un moment donné ». Douze appels mesurés : onze sous 1,3 s, un à
 * 7 s. Passé 1,5 s sans son, la même requête repart à côté et la première
 * réponse gagne.
 */
function syntheseAvecLatences(latencesMs) {
  let appel = 0;
  return jest.fn(() => {
    const latence = latencesMs[Math.min(appel, latencesMs.length - 1)];
    appel += 1;
    let lu = false;
    return new Promise((r) => { setTimeout(r, latence); }).then(() => ({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: () => {
            if (lu) return Promise.resolve({ done: true });
            lu = true;
            return Promise.resolve({ done: false, value: pcm(2 * FREQUENCE) });
          },
        }),
      },
    }));
  });
}

test('une synthèse qui traîne est doublée après 1,5 s, et la première réponse gagne', async () => {
  // Première requête : 7 s. La seconde, lancée à 1,5 s, répond en 300 ms.
  global.fetch = syntheseAvecLatences([7000, 300]);
  const lecteur = voixService.creerLecteur();
  const doublons = [];
  lecteur.surDoublon = () => doublons.push(1);

  lecteur.dire('Une phrase dont la synthèse tarde beaucoup trop.');

  await attendre(() => programmes.length >= 1, 3000);
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(doublons).toHaveLength(1);
  expect(programmes).toHaveLength(1);

  lecteur.arreter();
});

test('une synthèse qui répond en moins de 1,5 s n’est jamais doublée', async () => {
  global.fetch = syntheseAvecLatences([700]);
  const lecteur = voixService.creerLecteur();

  lecteur.dire('Une phrase dont la synthèse répond normalement.');

  await attendre(() => programmes.length >= 1, 2000);
  await new Promise((r) => { setTimeout(r, 1000); });
  expect(global.fetch).toHaveBeenCalledTimes(1);

  lecteur.arreter();
});
