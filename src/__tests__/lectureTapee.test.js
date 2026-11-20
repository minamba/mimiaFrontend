/**
 * LA LECTURE EN IMAGES TAPÉE AU CLAVIER — signalement #49 (Adam, 20/11/2026) : « son » écrit devant la carte « poisson »
 * recevait « Bravo… essaie encore », « pa » était validé, « lit » refusé pour « lit », la carte ne changeait jamais.
 *
 * Le serveur juge désormais la saisie comme le micro, et renvoie son verdict dans le flux AVANT la réponse
 * (`{"type":"verdict","sonJuste":…,"contenu":"J'ai lu la syllabe son."}`).
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. Le flux lit l'événement « verdict » et le passe à `onVerdict`, sans casser les fragments.
 *   2. Le réducteur pose le verdict sur la bulle que l'élève vient d'envoyer, et seulement elle.
 *   3. Le tableau montre le dessin du mot une fois la lecture tapée jugée juste (comme au micro).
 */

import { TextEncoder, TextDecoder } from 'util';
import chatReducer from '../lib/reducers/chatReducer';
import { envoyerMessage, VERDICT_ELEVE, MESSAGE_DELTA } from '../lib/actions/chatActions';
import { envoyerMessageStream } from '../lib/api/chatApi';
import { lectureAuTableau, estVerdictDeLecture } from '../lib/lectureDImage';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

// jsdom n'a ni l'un ni l'autre ; le navigateur, si.
global.TextEncoder = global.TextEncoder ?? TextEncoder;
global.TextDecoder = global.TextDecoder ?? TextDecoder;

const fluxDe = (texte) => {
  const octets = new TextEncoder().encode(texte);
  let lu = false;
  return {
    ok: true,
    body: {
      getReader: () => ({
        read: () => {
          if (lu) return Promise.resolve({ done: true });
          lu = true;
          return Promise.resolve({ done: false, value: octets });
        },
        closed: Promise.resolve(),
      }),
    },
  };
};

test('le flux passe le verdict à onVerdict, puis les fragments', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(fluxDe(
    'data: {"type":"verdict","sonJuste":false,"contenu":"J\'ai lu la syllabe pa."}\n\n'
    + 'data: {"type":"delta","texte":"Courage !"}\n\n'
    + 'data: {"type":"fin"}\n\n',
  ));
  const onVerdict = jest.fn();
  const onDelta = jest.fn();

  await envoyerMessageStream(7, 'pa', { onVerdict, onDelta });

  expect(onVerdict).toHaveBeenCalledWith(false, "J'ai lu la syllabe pa.");
  expect(onDelta).toHaveBeenCalledWith('Courage !');
  fetchMock.mockRestore();
});

test('un verdict « mot entier » (null) arrive tel quel', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(fluxDe(
    'data: {"type":"verdict","sonJuste":null,"contenu":"J\'ai lu la syllabe en disant le mot entier poisson."}\n\n',
  ));
  const onVerdict = jest.fn();
  await envoyerMessageStream(7, 'poisson', { onVerdict });
  expect(onVerdict).toHaveBeenCalledWith(null, "J'ai lu la syllabe en disant le mot entier poisson.");
  fetchMock.mockRestore();
});

describe('la bulle de l\'élève prend le verdict du serveur', () => {
  const avecEnvoi = (contenu) => chatReducer(
    { messages: [{ id: 3, role: 'assistant', contenu: 'Regarde le tableau.\n\n[LECTURE_IMAGE:syllabe]son[/LECTURE_IMAGE]' }], reponseEnCours: '' },
    envoyerMessage(7, contenu),
  );

  test('juste : « Bonne lecture » (sonJuste vrai, texte du serveur, son à jouer)', () => {
    const etat = chatReducer(avecEnvoi('son'), { type: VERDICT_ELEVE, payload: { sonJuste: true, contenu: "J'ai lu la syllabe son." } });
    const bulle = etat.messages[etat.messages.length - 1];
    expect(bulle).toMatchObject({ role: 'user', sonJuste: true, contenu: "J'ai lu la syllabe son.", verdictServeur: true });
    expect(estVerdictDeLecture(bulle.contenu)).toBe(true);
  });

  test('faux : « On réessaie »', () => {
    const etat = chatReducer(avecEnvoi('pa'), { type: VERDICT_ELEVE, payload: { sonJuste: false, contenu: "J'ai lu la syllabe pa." } });
    expect(etat.messages[etat.messages.length - 1]).toMatchObject({ sonJuste: false, contenu: "J'ai lu la syllabe pa." });
  });

  test('mot entier : ni juste ni faux', () => {
    const etat = chatReducer(avecEnvoi('poisson'), {
      type: VERDICT_ELEVE, payload: { sonJuste: null, contenu: "J'ai lu la syllabe en disant le mot entier poisson." },
    });
    expect(etat.messages[etat.messages.length - 1].sonJuste).toBeNull();
  });

  test('pas de bulle élève toute fraîche : rien ne change', () => {
    const etat = { messages: [{ id: 12, role: 'user', contenu: 'son' }], reponseEnCours: '' };
    expect(chatReducer(etat, { type: VERDICT_ELEVE, payload: { sonJuste: true, contenu: 'x' } })).toBe(etat);
  });

  test('la réponse du professeur continue de s\'écrire après le verdict', () => {
    let etat = chatReducer(avecEnvoi('son'), { type: VERDICT_ELEVE, payload: { sonJuste: true, contenu: "J'ai lu la syllabe son." } });
    etat = chatReducer(etat, { type: MESSAGE_DELTA, payload: 'Bravo !' });
    expect(etat.reponseEnCours).toBe('Bravo !');
  });
});

test('un mot tapé juste : le tableau montre son dessin, comme au micro', () => {
  const messages = [
    { id: 1, role: 'assistant', contenu: 'Regarde le tableau : lis ce mot à voix haute.\n\n[LECTURE_IMAGE:mot]lit[/LECTURE_IMAGE]' },
    { id: -2, role: 'user', contenu: "J'ai lu le mot lit.", sonJuste: true },
  ];
  const montre = lectureAuTableau(messages, { niveauCode: 'CP' });
  expect(montre?.cle).toMatch(/-lu$/);
});
