/**
 * LE PROFESSEUR DIT TOUT SON MESSAGE, PAS SEULEMENT LE DÉBUT.
 *
 * CE QUI EST ARRIVÉ
 * -----------------
 * En séance, la voix s'arrêtait au bout d'une ou deux phrases pendant que le
 * texte, lui, continuait de s'écrire à l'écran. Deux relevés, deux fois le même
 * point d'arrêt : juste après le premier GROUPE de phrases.
 *
 * Les phrases sont regroupées avant d'être envoyées à la synthèse — le premier
 * groupe court pour répondre vite (40 caractères), les suivants longs pour que
 * la prosodie se déroule (260). Un message de taille ordinaire dépasse donc le
 * premier seuil, et n'atteint jamais le second : tout ce qui suit reste en
 * attente et ne part qu'au `terminer()` de fin de flux.
 *
 * Ce test rejoue un vrai message, morceau par morceau comme le réseau le livre,
 * et vérifie qu'À LA FIN tout a été prononcé. Il ne teste pas le son : il
 * compare le texte envoyé à la synthèse au texte d'origine.
 */

import { voixService } from '../lib/storage/voixService';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { disponible: true } }) },
  API_BASE_URL: '',
  enTeteAuth: () => Promise.resolve('Bearer jeton-de-test'),
}));

// Le vrai message de la séance, celui dont la voix s'est arrêtée après « 0,3 ».
const MESSAGE =
  'Salut Bilal ! On vient de trouver 1,26 pour 4,2 fois 0,3. '
  + 'Petite question pour vérifier : à peu près combien ça devrait faire, '
  + 'si tu arrondis 4,2 à 4 et 0,3 à… enfin, un ordre de grandeur rapide ?';

/** Doit rester aligné sur SILENCE_GROUPE dans voixService. */
const SILENCE_GROUPE_TEST = 400;

let demandes;

// L'HORLOGE DOIT AVANCER, SINON LE TEST MENT.
//
// `attendreJusqua` convertit un instant du graphe audio en délai réel. Avec un
// `currentTime` figé à zéro, chaque attente durait la longueur du passage et
// rien ne s'était encore produit quand on regardait — le test échouait pour la
// mauvaise raison. Elle suit donc le temps réel, comme le vrai contexte.
let depart;

class FauxContexte {
  constructor() { this.state = 'running'; this.destination = {}; }
  get currentTime() { return (Date.now() - depart) / 1000; }
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
    return { buffer: null, connect: (suite) => suite, start() {}, stop() {} };
  }
  resume() { return Promise.resolve(); }
}

beforeEach(() => {
  demandes = [];
  depart = Date.now();
  window.AudioContext = FauxContexte;
  global.AbortController = class { constructor() { this.signal = {}; } abort() {} };

  // Chaque appel note le texte demandé et rend un peu de PCM.
  global.fetch = jest.fn((url, options) => {
    demandes.push(JSON.parse(options.body).texte);

    const octets = new Uint8Array(4000);
    let rendu = false;

    return Promise.resolve({
      ok: true,
      status: 200,
      body: {
        getReader: () => ({
          read: () => Promise.resolve(
            rendu ? { done: true } : ((rendu = true), { done: false, value: octets }),
          ),
        }),
      },
    });
  });
});

afterEach(() => {
  lecteurs.splice(0).forEach((l) => l.arreter());
  jest.restoreAllMocks();
  delete global.fetch;
});

const souffler = (ms = 0) => new Promise((r) => setTimeout(r, ms));

/**
 * Attend que la synthèse se taise vraiment.
 *
 * DEUX PIÈGES, RENCONTRÉS L'UN APRÈS L'AUTRE.
 *
 * Un passage se télécharge pendant que le précédent joue : entre les deux, le
 * compteur ne bouge pas un instant sans que rien ne soit fini. Conclure au
 * premier relevé identique déclarait le message tronqué alors qu'il ne l'était
 * pas.
 *
 * Et le filet de fin ne part qu'après SILENCE_GROUPE. Une fenêtre plus courte
 * que lui conclut forcément avant qu'il n'ait parlé — le test échouait en
 * accusant le code de ce que sa propre impatience avait produit.
 *
 * La fenêtre d'immobilité doit donc être plus longue que le filet.
 */
async function attendreLeSilence() {
  const PAS = 100;
  const IMMOBILE = Math.ceil((SILENCE_GROUPE_TEST * 2) / PAS);

  let dernier = -1;
  let stable = 0;

  for (let i = 0; i < 60; i += 1) {
    stable = demandes.length === dernier ? stable + 1 : 0;
    if (stable >= IMMOBILE && demandes.length > 0) return;

    dernier = demandes.length;
    await souffler(PAS);
  }
}

/**
 * Les lecteurs créés par un test, arrêtés à la fin QUOI QU'IL ARRIVE.
 *
 * Un `arreter()` en fin de test ne s'exécute pas si l'assertion précédente a
 * échoué : le lecteur survivait avec son filet armé, qui se déclenchait pendant
 * le test SUIVANT et lui comptait une demande venue de nulle part. Un échec en
 * provoquait ainsi un second, sans rapport.
 */
const lecteurs = [];

function creerLecteur() {
  const lecteur = voixService.creerLecteur();
  lecteurs.push(lecteur);
  return lecteur;
}

test('tout le message finit par être envoyé à la synthèse', async () => {
  const lecteur = creerLecteur();

  // Livré par petits morceaux, comme le fait le flux du modèle.
  for (let i = 0; i < MESSAGE.length; i += 12) {
    lecteur.alimenter(MESSAGE.slice(i, i + 12));
    await souffler();
  }

  // Fin du flux : ce qui reste en attente doit partir.
  lecteur.terminer();

  await attendreLeSilence();

  const dit = demandes.join(' ').replace(/\s+/g, ' ').trim();
  const attendu = MESSAGE.replace(/\s+/g, ' ').trim();

  // On compare les MOTS : le regroupement peut déplacer une espace, il ne doit
  // jamais perdre un mot.
  expect(dit.split(' ').length).toBe(attendu.split(' ').length);
  expect(dit).toBe(attendu);

  lecteur.arreter();
});

test('dit tout le message MÊME SI la fin de flux ne se signale jamais', async () => {
  // LE CAS RÉELLEMENT OBSERVÉ EN SÉANCE.
  //
  // `terminer()` vient d'un effet React protégé par quatre conditions. Quand
  // l'une d'elles ne se réalise pas, il n'est jamais appelé — et la fin du
  // message restait alors en attente pour toujours : le professeur prononçait
  // sa première phrase et se taisait, pendant que le texte continuait de
  // s'écrire à l'écran.
  //
  // Ce test ne l'appelle donc PAS. Le silence du flux doit suffire.
  const lecteur = creerLecteur();

  for (let i = 0; i < MESSAGE.length; i += 12) {
    lecteur.alimenter(MESSAGE.slice(i, i + 12));
    await souffler();
  }

  await attendreLeSilence();

  const dit = demandes.join(' ').replace(/\s+/g, ' ').trim();
  const attendu = MESSAGE.replace(/\s+/g, ' ').trim();

  expect(dit).toBe(attendu);

  lecteur.arreter();
});

test('ne coupe jamais un mot en deux, même si le flux marque une pause', async () => {
  // LE DÉFAUT QU'A CRÉÉ LE FILET LUI-MÊME.
  //
  // Le modèle ne débite pas à vitesse constante : il lui arrive de marquer une
  // pause en plein milieu d'un mot. Le filet vidait alors le tampon — la phrase
  // en cours, coupée là où le flux s'était arrêté — et la synthèse recevait
  // « trou » pour « trouver ». Le professeur le prononçait tel quel.
  const lecteur = creerLecteur();

  lecteur.alimenter('On additionne les deux nombres. Puis on va trou');
  await souffler(SILENCE_GROUPE_TEST * 2); // la pause fautive, en plein mot
  lecteur.alimenter('ver le résultat exact ?');

  lecteur.terminer();
  await attendreLeSilence();

  // Aucun passage ne doit se terminer au milieu d'un mot. Un passage légitime
  // finit sur une ponctuation forte — ou est le dernier, celui que `terminer()`
  // libère et qui peut légitimement finir sans point.
  demandes.slice(0, -1).forEach((passage) => {
    expect(passage.trim()).toMatch(/[.!?…]$/);
  });

  expect(demandes.join(' ')).not.toMatch(/trou\s*$/m);
  expect(demandes.join(' ').replace(/\s+/g, ' ')).toContain('trouver le résultat');
});

test("le filet ne parle pas après une interruption", async () => {
  // Si l'élève coupe la parole, ce qui restait en attente ne doit surtout pas
  // ressortir une demi-seconde plus tard : le professeur reprendrait sa phrase
  // là où on l'a arrêté, ce qu'on cherche précisément à éviter.
  const lecteur = creerLecteur();

  lecteur.alimenter('Première phrase courte. Et une suite qui reste en attente');
  await souffler();

  const avant = demandes.length;
  lecteur.arreter();

  await souffler(SILENCE_GROUPE_TEST * 3);

  expect(demandes.length).toBe(avant);
});
