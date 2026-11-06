/**
 * LE VERDICT D'UN SON À LA PLACE DU TEXTE — Camara, le 04/11/2026 : « pendant un
 * exercice de syllabes, rien n'est écrit quand l'enfant parle ; quand il répond,
 * "Bonne prononciation" en vert », et le même soir, après son essai : plus de rouge, un son
 * non reconnu se dit « On réessaie », car l'outil refuse aussi de bonnes réponses.
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. Le composant écrit exactement ces deux libellés, et rien du son dit.
 *   2. Le message de l'élève porte le verdict dès son affichage local, pas
 *      seulement au rechargement : c'est le réducteur qui le garde.
 *   3. Le verdict part au serveur avec le message (corps de la requête).
 */

import { render, screen } from '@testing-library/react';
import VerdictSon, { BONNE_ECOUTE, MAUVAISE_ECOUTE, estVerdictDEcoute, BONNE_PRONONCIATION, ON_REESSAIE } from '../components/VerdictSon';
import chatReducer from '../lib/reducers/chatReducer';
import { envoyerMessage, MESSAGE_SEND_REQUEST } from '../lib/actions/chatActions';
import { envoyerMessageStream } from '../lib/api/chatApi';
import { jouerSonDuVerdict, SURDITE_MS } from '../lib/storage/sonDuVerdict';
import { bruitage } from '../lib/jeux/bruitages';

jest.mock('../lib/jeux/bruitages', () => ({ bruitage: jest.fn() }));

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

describe('le son du verdict (04/11/2026)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    bruitage.mockClear();
  });

  afterEach(() => jest.useRealTimers());

  test('juste : le son des bonnes réponses ; non reconnu : celui des mauvaises', () => {
    jouerSonDuVerdict({ juste: true });
    expect(bruitage).toHaveBeenLastCalledWith('bonne');

    jouerSonDuVerdict({ juste: false });
    expect(bruitage).toHaveBeenLastCalledWith('mauvaise');
  });

  test('le bouton qui coupe le son du cours le coupe aussi, sans toucher au micro', () => {
    const ecoute = { suspendre: jest.fn() };
    jouerSonDuVerdict({ juste: true, muet: true, sansCasque: true, ecoute });

    expect(bruitage).not.toHaveBeenCalled();
    expect(ecoute.suspendre).not.toHaveBeenCalled();
  });

  test('sans casque, le micro est sourd le temps du son, puis se rouvre', () => {
    const ecoute = { suspendre: jest.fn() };
    jouerSonDuVerdict({ juste: true, sansCasque: true, ecoute });

    expect(ecoute.suspendre).toHaveBeenCalledWith(true, false);

    jest.advanceTimersByTime(SURDITE_MS);
    expect(ecoute.suspendre).toHaveBeenLastCalledWith(false);
  });

  test('sans casque, il reste sourd si le professeur a pris la parole entre-temps', () => {
    const ecoute = { suspendre: jest.fn() };
    jouerSonDuVerdict({ juste: true, sansCasque: true, ecoute, professeurParle: () => true });

    jest.advanceTimersByTime(SURDITE_MS);
    expect(ecoute.suspendre).toHaveBeenCalledTimes(1);
  });

  test('sans casque, la pause du clavier continue après le son', () => {
    const ecoute = { suspendre: jest.fn() };
    jouerSonDuVerdict({ juste: false, sansCasque: true, ecoute, eleveTape: () => true });

    jest.advanceTimersByTime(SURDITE_MS);
    expect(ecoute.suspendre).toHaveBeenLastCalledWith(true);
  });

  test('avec un casque, le micro ne bouge pas', () => {
    const ecoute = { suspendre: jest.fn() };
    jouerSonDuVerdict({ juste: true, sansCasque: false, ecoute });

    expect(bruitage).toHaveBeenCalledWith('bonne');
    expect(ecoute.suspendre).not.toHaveBeenCalled();
  });
});

test('juste : « Bonne prononciation » ; non reconnu : « On réessaie », jamais de reproche ni le son', () => {
  const { rerender } = render(<VerdictSon juste />);
  expect(screen.getByRole('status')).toHaveTextContent(BONNE_PRONONCIATION);
  expect(screen.getByRole('status')).toHaveClass('verdict-son--juste');

  rerender(<VerdictSon juste={false} />);
  expect(screen.getByRole('status')).toHaveTextContent(ON_REESSAIE);
  expect(screen.queryByText(/mauvaise/i)).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveClass('verdict-son--faux');
  expect(screen.queryByText(/\bbo\b/)).not.toBeInTheDocument();
});

test('le message local porte le verdict, et un message ordinaire n’en a pas', () => {
  const etat = { messages: [], streaming: false, error: null, reponseEnCours: '' };

  const avecVerdict = chatReducer(etat, envoyerMessage(1, 'bo', null, null, null, null, false));
  expect(avecVerdict.messages[0]).toMatchObject({ role: 'user', contenu: 'bo', sonJuste: false });

  const juste = chatReducer(etat, envoyerMessage(1, 'bo', null, null, null, null, true));
  expect(juste.messages[0].sonJuste).toBe(true);

  const ordinaire = chatReducer(etat, { type: MESSAGE_SEND_REQUEST, payload: { conversationId: 1, contenu: 'bonjour' } });
  expect(ordinaire.messages[0].sonJuste).toBeNull();
});

test('le verdict part dans le corps de la requête, avec le son jugé', async () => {
  // jsdom n'a pas de TextDecoder : celui de Node fait l'affaire pour un flux vide.
  // eslint-disable-next-line global-require
  global.TextDecoder = global.TextDecoder ?? require('util').TextDecoder;
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    body: { getReader: () => ({ read: () => Promise.resolve({ done: true }), closed: Promise.resolve() }) },
  });

  await envoyerMessageStream(7, 'bo', { sonJuste: true, secondesRestantes: 600 });

  const corps = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(corps).toMatchObject({ contenu: 'bo', sonJuste: true, secondesRestantes: 600 });

  fetchMock.mockRestore();
});

test('l’écoute des mots a ses propres mots', () => {
  const { rerender } = render(<VerdictSon juste ecoute />);
  expect(screen.getByRole('status')).toHaveTextContent(BONNE_ECOUTE);
  rerender(<VerdictSon juste={false} ecoute />);
  expect(screen.getByRole('status')).toHaveTextContent(MAUVAISE_ECOUTE);
  expect(estVerdictDEcoute("J'ai entendu le mot riz.")).toBe(true);
  expect(estVerdictDEcoute("J'ai entendu la syllabe tu.")).toBe(true);
  expect(estVerdictDEcoute('riz')).toBe(false);
  expect(estVerdictDEcoute('/ipo/')).toBe(false);
});
