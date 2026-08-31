/**
 * LES DEUX ANNONCES DE DICTÉE SONT DITES PAR L'APPLICATION.
 *
 * POURQUOI ELLES NE SONT PLUS DEMANDÉES AU PROFESSEUR
 * ---------------------------------------------------
 * Sa consigne les lui réclamait, en toutes lettres, avec la séquence complète
 * en exemple et la raison : l'élève au cahier ne regarde pas l'écran, il n'a
 * que la voix. Il ne les a pas dites — dictée du 31 août, API relancée seize
 * minutes plus tôt avec la nouvelle consigne, aucune des deux phrases. Septième
 * règle de dictée ignorée.
 *
 * L'application, elle, SAIT où la dictée commence et finit : c'est elle qui
 * pose les bornes. Elle dit donc les deux phrases, et il n'y a plus rien à
 * espérer de personne.
 *
 * CE QUE CES TESTS TIENNENT, ET QU'UNE RELECTURE NE VOIT PAS
 * ----------------------------------------------------------
 * Deux choses, et les deux sont des ORDRES :
 *
 * 1. l'ouverture se dit à la voix NORMALE, avant la bascule en mode dictée ;
 * 2. la fermeture se dit AVANT la pause de la dernière phrase, pas après.
 *
 * Dans les deux cas, la version fautive produit exactement les mêmes
 * événements, dans une autre suite. Seule l'oreille les distingue — en séance,
 * une fois le mal fait.
 */

import { voixService } from '../lib/storage/voixService';
import { DEBUT_DICTEE, FIN_DICTEE } from '../lib/storage/ardoise';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

let horloge;
let evenements;
let prononces;

class FausseSource {
  constructor() { this.buffer = null; }

  connect() {}

  start() { evenements.push('audio'); }

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

  createBufferSource() { return new FausseSource(); }

  resume() { return Promise.resolve(); }
}

/** Un peu de PCM : le contenu n'importe pas, seul l'ordonnancement compte. */
const pcm = () => new Uint8Array(4000);

function fluxDe(blocs) {
  let i = 0;
  return {
    getReader: () => ({
      read: () => Promise.resolve(
        i < blocs.length ? { done: false, value: blocs[i++] } : { done: true },
      ),
    }),
  };
}

/**
 * Fait avancer le temps — les DEUX à la fois.
 *
 * `attendreJusqua` calcule son délai sur l'horloge AUDIO, puis dort en temps
 * RÉEL. Avancer l'une sans les autres laisse la boucle endormie : on pilote
 * donc les minuteurs, et l'horloge du faux contexte suit au même pas.
 */
const attendre = async (condition, tours = 600) => {
  for (let i = 0; i < tours; i += 1) {
    if (condition()) return;
    horloge += 1;
    jest.advanceTimersByTime(1000);
    for (let k = 0; k < 6; k += 1) await Promise.resolve();
  }
};

beforeEach(() => {
  jest.useFakeTimers();
  horloge = 0;
  evenements = [];
  prononces = [];

  window.AudioContext = FauxContexte;
  global.AbortController = class { constructor() { this.signal = {}; } abort() {} };

  // On retient CE QUI EST ENVOYÉ À LA SYNTHÈSE : c'est la seule preuve qu'une
  // phrase a bien été prononcée, et par qui.
  global.fetch = jest.fn((url, options) => {
    const charge = JSON.parse(options.body);
    prononces.push({ texte: charge.texte, dictee: Boolean(charge.dictee) });
    return Promise.resolve({ ok: true, status: 200, body: fluxDe([pcm()]) });
  });

  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  delete global.fetch;
});

/** Un message de professeur avec sa dictée dedans. */
const dicter = (lecteur) => {
  lecteur.alimenter(
    `On fait une petite dictée.${DEBUT_DICTEE}Le chat dort. La nuit tombe.${FIN_DICTEE}`
    + ' Prends ton temps.',
  );
  lecteur.terminer();
};

test("l'ouverture et la fermeture sont prononcées, sans rien demander au professeur", async () => {
  const lecteur = voixService.creerLecteur();
  dicter(lecteur);

  await attendre(() => prononces.length >= 5);
  lecteur.arreter();

  const textes = prononces.map((p) => p.texte);

  expect(textes).toContain('Je commence. Première phrase.');
  expect(textes).toContain("Voilà, c'était la dernière phrase.");

  // ET ELLES ENCADRENT LA DICTÉE, sans quoi elles ne veulent rien dire : une
  // ouverture prononcée après la première phrase arriverait trop tard.
  const ouverture = textes.indexOf('Je commence. Première phrase.');
  const fermeture = textes.indexOf("Voilà, c'était la dernière phrase.");
  const premiereDictee = prononces.findIndex((p) => p.dictee);
  const derniereDictee = prononces.map((p) => p.dictee).lastIndexOf(true);

  expect(ouverture).toBeLessThan(premiereDictee);
  expect(fermeture).toBeGreaterThan(derniereDictee);
});

test("l'ouverture se dit à la voix normale, pas au débit de dictée", async () => {
  // Elle est mise en file AVANT la bascule. Après, elle partirait avec
  // `dictee: true` : lente, hachée, et suivie du silence d'écriture — l'élève
  // se mettrait à écrire « Je commence, première phrase ».
  const lecteur = voixService.creerLecteur();
  dicter(lecteur);

  await attendre(() => prononces.length >= 5);
  lecteur.arreter();

  const ouverture = prononces.find((p) => p.texte === 'Je commence. Première phrase.');
  const fermeture = prononces.find((p) => p.texte === "Voilà, c'était la dernière phrase.");

  expect(ouverture.dictee).toBe(false);
  expect(fermeture.dictee).toBe(false);

  // Et les phrases du texte, elles, partent bien en mode dictée.
  expect(prononces.filter((p) => p.dictee).map((p) => p.texte))
    .toEqual(['Le chat dort.', 'La nuit tombe.']);
});

test('la pause de la dernière phrase tombe APRÈS la fermeture, pas avant', async () => {
  const lecteur = voixService.creerLecteur();
  lecteur.surPauseDictee = (active) => { if (active) evenements.push('pause'); };

  dicter(lecteur);

  await attendre(() => evenements.filter((e) => e === 'audio').length >= 5);

  // Cinq passages avant la fermeture de la boucle : l'annonce du professeur,
  // l'ouverture, les deux phrases dictées, la fermeture.
  const audios = evenements.filter((e) => e === 'audio').length;
  expect(audios).toBeGreaterThanOrEqual(5);

  // La pause qui suit la PREMIÈRE phrase dictée est bien là : sans elle,
  // l'élève n'aurait pas le temps d'écrire avant la suivante.
  expect(evenements).toContain('pause');

  // C'EST LA SEULE ASSERTION QUI DISTINGUE LES DEUX VERSIONS : la dernière
  // phrase dictée et la fermeture s'enchaînent SANS silence entre elles.
  // Avant le correctif, la séquence était « audio, pause, audio » — les mêmes
  // événements, dans un autre ordre.
  const derniere = evenements.lastIndexOf('audio');
  expect(evenements[derniere - 1]).toBe('audio');

  // Et la pause n'est pas perdue : elle tombe APRÈS la fermeture, pendant que
  // l'élève écrit sa dernière phrase.
  await attendre(() => evenements.lastIndexOf('pause') > derniere);
  lecteur.arreter();

  expect(evenements.lastIndexOf('pause')).toBeGreaterThan(derniere);
});
