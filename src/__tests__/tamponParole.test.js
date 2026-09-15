/**
 * LA MÉMOIRE TAMPON DE LA PAROLE : rien de ce que dit l'élève ne se perd.
 *
 * Voulue par Camara le 13/09/2026, après une séance de pertes : « quand le
 * professeur a un problème et que "Je t'écoute" revient, les premières phrases
 * que je dis ne sont jamais prises en compte ». Et la règle qu'il a posée :
 * tout ce que dit l'enfant va dans une mémoire tampon, et ne part que quand la
 * liaison est prête — si elle se coupe, rien n'est perdu, tout part quand elle
 * revient.
 *
 * Ce que ces tests protègent, et qu'aucun essai en séance ne montre avant qu'il
 * soit trop tard :
 *
 * 1. LA PAROLE DITE AVANT L'OUVERTURE part en entier — l'ancienne amorce n'en
 *    gardait que quatre secondes, et effaçait le début pour garder la fin ;
 * 2. UNE COUPURE PENDANT QU'IL PARLE ne coûte pas une syllabe ;
 * 3. UN TOUR PARTI SANS VERDICT est renvoyé sur la liaison suivante — envoyer
 *    n'est pas livrer ;
 * 4. UN TOUR QUI A EU SON VERDICT n'est PAS renvoyé ;
 * 5. SOURD RESTE SOURD, même pendant une coupure : la voix du professeur
 *    n'entre jamais dans la mémoire ;
 * 6. LA MÉMOIRE A UN PLAFOND, et elle garde la parole la plus récente.
 *
 * La fausse liaison REFUSE tout envoi tant qu'elle n'est pas ouverte : si le
 * module envoyait trop tôt, le test échouerait au lieu de passer en silence.
 */

import { ecouteTempsReel } from '../lib/storage/ecouteTempsReel';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

const FREQUENCE = 24000;

/** Le premier délai de rappel, tel qu'il est réglé dans le module. */
const PREMIER_RAPPEL_MS = 300;

const sockets = [];
let capture;

class FausseSocket {
  constructor(url) {
    this.url = url;
    this.readyState = FausseSocket.etatInitial;
    this.envois = [];
    this.fermee = false;
    sockets.push(this);
  }

  send(charge) {
    // UNE LIAISON FERMÉE REFUSE L'ENVOI — comme un vrai WebSocket, qui lève
    // une exception. C'est ce qui rend ces tests sévères.
    if (this.readyState !== FausseSocket.OPEN) {
      throw new Error('envoi sur une liaison qui n’est pas ouverte');
    }
    this.envois.push(charge);
  }

  close() {
    this.fermee = true;
    this.readyState = 3;
  }

  ouvrir() {
    this.readyState = FausseSocket.OPEN;
    this.onopen?.();
  }

  couper() {
    this.readyState = 3;
    this.onclose?.({ code: 1006, reason: '' });
  }

  repondre(charge) {
    this.onmessage?.({ data: JSON.stringify(charge) });
  }

  get trames() {
    return this.envois.filter((envoi) => typeof envoi !== 'string').length;
  }

  get ordres() {
    return this.envois
      .filter((envoi) => typeof envoi === 'string')
      .map((envoi) => JSON.parse(envoi).type);
  }
}

FausseSocket.OPEN = 1;
FausseSocket.etatInitial = 1;

const derniere = () => sockets[sockets.length - 1];

const respirer = async () => {
  for (let i = 0; i < 30; i += 1) await Promise.resolve();
};

/** Un dixième de seconde de son, à l'amplitude voulue. */
const bloc = (amplitude) => new Float32Array(FREQUENCE / 10).fill(amplitude);

let horloge;

/** Il parle `n` dixièmes de seconde, à partir de `depuis` dixièmes. */
const parler = (n, depuis = 0) => {
  for (let i = depuis; i < depuis + n; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.1) });
  }
};

/** Il se tait assez longtemps pour que le tour soit clos. */
const setaire = (a) => {
  horloge.mockReturnValue(a);
  capture.port.onmessage({ data: bloc(0) });
};

const rappeler = async () => {
  jest.advanceTimersByTime(PREMIER_RAPPEL_MS);
  await respirer();
};

beforeEach(() => {
  jest.useFakeTimers();
  sockets.length = 0;
  FausseSocket.etatInitial = 1;
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
    constructor() { this.port = { onmessage: null }; capture = this; }

    connect() { return { connect() {} }; }
  };

  horloge = jest.spyOn(performance, 'now').mockReturnValue(0);
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const ouvrir = async (rappels = {}) => {
  const ecoute = ecouteTempsReel.ecouter({ conversationId: 1, ...rappels });
  await respirer();
  return ecoute;
};

// --------------------------------------------------------------------- tests

test('la parole dite avant que la liaison soit prête part EN ENTIER, dans l’ordre', async () => {
  FausseSocket.etatInitial = 0;
  await ouvrir();

  // SIX SECONDES : l'ancienne amorce n'en gardait que quatre, et effaçait le
  // début de la phrase pour garder la fin.
  parler(60);
  setaire(8000);

  // Rien n'est parti : la liaison n'est pas prête.
  expect(derniere().envois).toHaveLength(0);

  derniere().ouvrir();

  // Tout est parti, et la fin de tour en DERNIER — derrière le son qu'elle clôt.
  expect(derniere().trames).toBe(60);
  expect(derniere().ordres).toEqual(['fin_tour']);
  expect(typeof derniere().envois[derniere().envois.length - 1]).toBe('string');
});

test('une coupure pendant qu’il parle ne coûte pas une syllabe', async () => {
  await ouvrir();
  const premiere = derniere();

  parler(10);
  expect(premiere.trames).toBe(10);

  // La liaison tombe au milieu de sa phrase, et il continue de parler.
  premiere.couper();
  parler(10, 10);
  setaire(4000);

  // L'écoute n'est pas défaite : elle rappelle le serveur toute seule.
  await rappeler();
  expect(sockets).toHaveLength(2);

  derniere().ouvrir();

  // Les dix trames parties sur la liaison morte — perdues avec elle chez le
  // fournisseur — puis les dix dites pendant la coupure, puis la fin de tour.
  expect(derniere().trames).toBe(20);
  expect(derniere().ordres).toEqual(['fin_tour']);
});

test('un tour parti sans verdict est renvoyé sur la liaison suivante', async () => {
  await ouvrir();
  const premiere = derniere();

  parler(20);
  setaire(4000);
  expect(premiere.ordres).toEqual(['fin_tour']);

  // ENVOYER N'EST PAS LIVRER : la liaison tombe avant que le verdict revienne.
  premiere.couper();
  await rappeler();
  derniere().ouvrir();

  expect(derniere().trames).toBe(20);
  expect(derniere().ordres).toEqual(['fin_tour']);
});

test('un tour qui a eu son verdict n’est PAS renvoyé', async () => {
  const onFinal = jest.fn();
  await ouvrir({ onFinal });
  const premiere = derniere();

  parler(20);
  setaire(4000);

  premiere.repondre({ type: 'final', texte: 'Je crois que c est au pluriel.' });
  expect(onFinal).toHaveBeenCalledWith('Je crois que c est au pluriel.');

  premiere.couper();
  await rappeler();
  derniere().ouvrir();

  // Renvoyer un tour transcrit le ferait arriver deux fois au professeur.
  expect(derniere().envois).toHaveLength(0);
});

test('sourd reste sourd pendant une coupure : la voix du professeur n’entre pas en mémoire', async () => {
  const ecoute = await ouvrir();

  derniere().couper();

  // Le professeur parle, sans casque, fort et longtemps — pendant la coupure.
  ecoute.suspendre(true, false);
  for (let i = 0; i < 20; i += 1) {
    horloge.mockReturnValue(i * 100);
    capture.port.onmessage({ data: bloc(0.2) });
  }
  ecoute.suspendre(false);

  await rappeler();
  derniere().ouvrir();

  expect(derniere().envois).toHaveLength(0);
});

test('la mémoire a un plafond, et elle garde la parole la plus récente', async () => {
  FausseSocket.etatInitial = 0;
  await ouvrir();

  // Deux minutes et demie sans liaison, à parler sans interruption.
  parler(1500);

  derniere().ouvrir();

  // Deux minutes au plus : au-delà, c'est une séance perdue, pas une coupure.
  expect(derniere().trames).toBe(1200);
});

/**
 * LA PANNE DU RELAIS — le cas exact relevé par Camara : « quand le professeur
 * a un problème et que "Je t'écoute" revient, mes premières phrases ne sont
 * jamais prises en compte ».
 *
 * Le serveur envoie « La transcription est indisponible » PUIS ferme. Ce
 * message remontait au chat, qui détruisait l'écoute : la mémoire tampon
 * partait avec elle. Un premier jet de la mémoire tampon avait ce trou — ces
 * tests-ci passaient tous, et l'enfant perdait quand même sa phrase.
 */
test('une erreur du relais ne vide pas la mémoire : le tour repart sur une liaison neuve', async () => {
  const onErreur = jest.fn();
  const onOreilleMorte = jest.fn();
  await ouvrir({ onErreur, onOreilleMorte });
  const premiere = derniere();

  parler(20);
  setaire(4000);
  expect(premiere.ordres).toEqual(['fin_tour']);

  // Le serveur annonce la panne, puis ferme — dans cet ordre-là.
  premiere.repondre({ type: 'erreur', message: 'La transcription est indisponible.' });
  premiere.couper();

  // RIEN DE FATAL N'EST REMONTÉ : le chat aurait détruit l'écoute, et la
  // mémoire avec. La panne est seulement annoncée, une fois.
  expect(onErreur).not.toHaveBeenCalled();
  expect(onOreilleMorte).toHaveBeenCalledTimes(1);

  // L'enfant continue de parler pendant qu'on rappelle.
  parler(10, 50);
  setaire(9000);

  await rappeler();

  // UN seul rappel : la fermeture qui suit l'erreur arrive sur une liaison
  // déjà remplacée, et n'en programme pas un second.
  expect(sockets).toHaveLength(2);

  derniere().ouvrir();

  // Les 20 trames du tour resté sans verdict, le bloc de silence gardé
  // d'avance devant sa nouvelle phrase, puis ses 10 trames — et les deux fins
  // de tour, chacune derrière le son qu'elle clôt.
  expect(derniere().trames).toBe(31);
  expect(derniere().ordres).toEqual(['fin_tour', 'fin_tour']);
});

test('un relais qui échoue à chaque fois finit par laisser la main au navigateur', async () => {
  // Sans ce plafond, une erreur remettait le compteur à zéro et l'écoute
  // rappelait indéfiniment un serveur en panne — l'enfant sans micro, pour
  // toujours, sans jamais basculer sur le moteur du navigateur.
  const onErreur = jest.fn();
  await ouvrir({ onErreur });

  for (let essai = 0; essai < 25 && onErreur.mock.calls.length === 0; essai += 1) {
    derniere().repondre({ type: 'erreur', message: 'La transcription est indisponible.' });
    jest.advanceTimersByTime(5000);
    // eslint-disable-next-line no-await-in-loop
    await respirer();
  }

  expect(onErreur).toHaveBeenCalledTimes(1);
});

/**
 * LE GROS ENVOI ENCORE EN ROUTE — la seconde moitié du défaut du 13/09/2026.
 *
 * Après une coupure, la mémoire tampon rend d'un coup cinquante secondes de
 * parole. `send` accepte tout à l'instant ; le réseau met longtemps à
 * l'acheminer. Le chien de garde partait dès l'appel, concluait à une panne au
 * bout de huit secondes, coupait l'envoi — et recommençait à la reconnexion.
 */
test('un envoi encore en route ne passe pas pour une oreille morte', async () => {
  const onOreilleMorte = jest.fn();
  await ouvrir({ onOreilleMorte });
  const liaison = derniere();

  // Deux mégaoctets et demi attendent encore dans le navigateur.
  liaison.bufferedAmount = 2400000;

  parler(20);
  setaire(4000);
  expect(liaison.ordres).toEqual(['fin_tour']);

  // Trente secondes d'acheminement : ce n'est PAS une panne, le serveur n'a
  // simplement pas encore tout reçu.
  jest.advanceTimersByTime(30000);
  expect(onOreilleMorte).not.toHaveBeenCalled();
  expect(liaison.fermee).toBe(false);

  // Tout est parti. À partir de là seulement, le serveur a huit secondes.
  liaison.bufferedAmount = 0;
  jest.advanceTimersByTime(250);

  jest.advanceTimersByTime(8000 - 1);
  expect(onOreilleMorte).not.toHaveBeenCalled();

  jest.advanceTimersByTime(1);
  expect(onOreilleMorte).toHaveBeenCalledTimes(1);
});

/**
 * PLUSIEURS PHRASES PENDANT UNE COUPURE — et la première n'est pas sacrifiée.
 *
 * Le plafond de quatre tours en attente de verdict faisait perdre leur MESURE
 * aux plus anciens : le premier verdict revenu était jugé contre la durée d'un
 * tour bien plus court, et jeté comme une phrase inventée. Six tours de
 * longueurs différentes, pour que la confusion se voie.
 */
test('une longue coupure de plusieurs phrases : chacune garde sa mesure et arrive', async () => {
  const onFinal = jest.fn();
  await ouvrir({ onFinal });

  derniere().couper();

  // Une longue première phrase, puis cinq réponses courtes.
  const longueurs = [30, 5, 5, 5, 5, 5];
  let debut = 0;

  longueurs.forEach((n) => {
    parler(n, debut);
    setaire((debut + n) * 100 + 1000);
    debut += n + 20;
  });

  await rappeler();
  derniere().ouvrir();

  expect(derniere().ordres).toHaveLength(6);

  // Les verdicts reviennent dans l'ordre. La première phrase fait 46
  // caractères pour plus de trois secondes de parole : un débit tout à fait
  // humain — à condition d'être jugée contre SA durée.
  derniere().repondre({ type: 'final', texte: 'Je crois que les deux droites sont parallèles.' });
  for (let i = 0; i < 5; i += 1) derniere().repondre({ type: 'final', texte: 'oui' });

  expect(onFinal).toHaveBeenCalledTimes(6);
  expect(onFinal.mock.calls[0][0]).toBe('Je crois que les deux droites sont parallèles.');
});

/**
 * CE QUE L'ÉCOUTE DIT AU CHAT : un texte est-il encore en route ?
 *
 * C'est la seule source qui le sache. Sans elle, le chat envoyait une
 * justification coupée en deux — relevé du 13/09/2026, voir
 * `envoiApresTranscription`.
 */
describe('transcription en cours', () => {
  test('vraie entre l’ordre de transcription et le verdict, fausse ensuite', async () => {
    const ecoute = await ouvrir();

    expect(ecoute.transcriptionEnCours()).toBe(false);

    parler(20);
    setaire(4000);

    // L'ordre est parti, le texte n'est pas revenu : l'envoi doit attendre.
    expect(ecoute.transcriptionEnCours()).toBe(true);

    derniere().repondre({ type: 'final', texte: 'Je crois que c est au pluriel.' });

    expect(ecoute.transcriptionEnCours()).toBe(false);
  });

  test('un verdict écarté libère aussi l’envoi : l’attente ne reste pas bloquée', async () => {
    const ecoute = await ouvrir();

    parler(20);
    setaire(4000);

    // Une hésitation seule est écartée — mais elle EST revenue.
    derniere().repondre({ type: 'final', texte: 'euh' });

    expect(ecoute.transcriptionEnCours()).toBe(false);
  });

  test('une fin de tour encore gardée pendant une coupure compte comme en route', async () => {
    const ecoute = await ouvrir();

    derniere().couper();
    parler(20);
    setaire(4000);

    expect(ecoute.transcriptionEnCours()).toBe(true);
  });
});

/**
 * LE CAS EXACT DU 13/09/2026 : « toute ma justification, cinq ou six lignes,
 * s'est écrite puis effacée, et ensuite il a envoyé un bout de phrase ».
 *
 * Le fournisseur clôt le bout de phrase lui-même et renvoie son texte AVANT
 * notre ordre de fin de tour ; le serveur écarte alors notre ordre, et aucun
 * texte ne lui répond. Avec l'ancien appariement, cette durée orpheline de
 * trois secondes était associée au texte suivant — la justification de
 * vingt-cinq secondes —, qui était jugé impossible, jeté et effacé.
 */
test('une fin de tour orpheline ne fait plus jeter la justification qui suit', async () => {
  const onFinal = jest.fn();
  const onPartiel = jest.fn();
  const ecoute = await ouvrir({ onFinal, onPartiel });
  const liaison = derniere();

  const LA_JUSTIFICATION = 'Alors pour la réciproque on compare AD sur AB et AE sur AC, '
    + 'trois sur neuf ça fait un tiers et quatre sur douze ça fait aussi un tiers, '
    + 'les deux rapports sont égaux donc les droites DE et BC sont parallèles, '
    + 'et en plus les points sont dans le même ordre sur les deux droites.';

  // Le bout de phrase, trois secondes. Le fournisseur le clôt lui-même et
  // renvoie son texte PENDANT la pause, avant notre ordre.
  parler(30);
  horloge.mockReturnValue(3200);
  liaison.repondre({ type: 'final', texte: 'Alors, comme D appartient à AB et E à' });

  // Notre ordre part quand même : le serveur l'écartera, aucun texte ne
  // lui répondra jamais.
  setaire(4000);

  // Vingt-cinq secondes de justification, puis le silence et son texte.
  parler(250, 50);
  setaire(31000);
  liaison.repondre({ type: 'final', texte: LA_JUSTIFICATION });

  // La justification ARRIVE, et rien n'est effacé derrière elle.
  expect(onFinal).toHaveBeenCalledWith(LA_JUSTIFICATION);
  expect(onPartiel).not.toHaveBeenCalledWith('');

  // Et plus rien n'est en route : l'ordre orphelin ne retient pas l'envoi.
  expect(ecoute.transcriptionEnCours()).toBe(false);
});
