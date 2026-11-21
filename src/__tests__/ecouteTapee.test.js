/**
 * L'ÉCOUTE DES MOTS ET LA RÉPÉTITION EN LANGUE, TAPÉES AU CLAVIER — contrôle d'Omar sur le #57 v2, accord de Min's
 * (21/11/2026, 16 h : « oui faut modifier l'écran pour compter 3 essais au lieu de 5 »).
 *
 * « Deux! » tapé pour « [EN]Two[/EN]. Qu'as-tu entendu ? » n'avait aucun verdict à l'écran : la bulle restait « Deux! »
 * et l'essai n'était pas compté. Le serveur juge désormais la saisie comme le micro, et renvoie son verdict dans le flux
 * AVANT la réponse, avec le mécanisme du #49 :
 *   - écoute des mots : `{"type":"verdict","sonJuste":false,"contenu":"J'ai entendu le mot deux."}` → « Mauvaise écoute » ;
 *   - répétition en langue : `{"type":"verdict","sonJuste":false,"contenu":"J'ai répété : Bleu!"}` → « On réessaie ».
 *
 * CE QUE CES TESTS PROTÈGENT (aucun code d'écran ne change : c'est le contrat entre le serveur et l'écran)
 *   1. Le flux passe ces verdicts à `onVerdict`, et la bulle envoyée les prend.
 *   2. La bulle écrit « Mauvaise écoute » / « Bonne écoute » pour l'écoute, « On réessaie » pour la répétition — jamais
 *      « Bonne prononciation » ni le texte brut.
 *   3. Après rechargement (message relu du serveur avec `sonJuste`), même affichage.
 */

import { render, screen } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';
import chatReducer from '../lib/reducers/chatReducer';
import { envoyerMessage, VERDICT_ELEVE } from '../lib/actions/chatActions';
import { envoyerMessageStream } from '../lib/api/chatApi';
import VerdictSon, { estVerdictDEcoute, MAUVAISE_ECOUTE, BONNE_ECOUTE, ON_REESSAIE } from '../components/VerdictSon';
import { estVerdictDeLecture } from '../lib/lectureDImage';

jest.mock('../lib/api/httpClient', () => ({
  __esModule: true,
  default: {},
  API_BASE_URL: 'http://serveur',
  enTeteAuth: () => Promise.resolve('Eleve jeton-de-test'),
}));

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

// Ce que la bulle de l'élève affiche (même choix que Chat.js : VerdictSon dès que sonJuste est un booléen).
const bulle = (message) => render(
  <VerdictSon juste={message.sonJuste} ecoute={estVerdictDEcoute(message.contenu)} lecture={estVerdictDeLecture(message.contenu)} />,
);

const apresEnvoi = (tape, verdict) => chatReducer(
  chatReducer(
    { messages: [{ id: 3, role: 'assistant', contenu: 'Voici le prochain mot.\n\n[EN]Two[/EN]\n\nQu\'as-tu entendu ?' }], reponseEnCours: '' },
    envoyerMessage(7, tape),
  ),
  { type: VERDICT_ELEVE, payload: verdict },
);

test('le flux passe le verdict d\'une écoute tapée à onVerdict', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(fluxDe(
    'data: {"type":"verdict","sonJuste":false,"contenu":"J\'ai entendu le mot deux."}\n\n'
    + 'data: {"type":"delta","texte":"Ça, c\'est le sens en français !"}\n\n'
    + 'data: {"type":"fin"}\n\n',
  ));
  const onVerdict = jest.fn();
  const onDelta = jest.fn();
  await envoyerMessageStream(7, 'Deux!', { onVerdict, onDelta });
  expect(onVerdict).toHaveBeenCalledWith(false, "J'ai entendu le mot deux.");
  expect(onDelta).toHaveBeenCalledWith("Ça, c'est le sens en français !");
  fetchMock.mockRestore();
});

test('écoute des mots tapée, traduction : la bulle dit « Mauvaise écoute »', () => {
  const etat = apresEnvoi('Deux!', { sonJuste: false, contenu: "J'ai entendu le mot deux." });
  const message = etat.messages[etat.messages.length - 1];
  expect(message).toMatchObject({ role: 'user', sonJuste: false, contenu: "J'ai entendu le mot deux.", verdictServeur: true });
  bulle(message);
  expect(screen.getByRole('status')).toHaveTextContent(MAUVAISE_ECOUTE);
  expect(screen.queryByText(/Deux!/)).toBeNull();
});

test('écoute des mots tapée, bonne réponse : « Bonne écoute »', () => {
  const etat = apresEnvoi('two', { sonJuste: true, contenu: "J'ai entendu le mot two." });
  bulle(etat.messages[etat.messages.length - 1]);
  expect(screen.getByRole('status')).toHaveTextContent(BONNE_ECOUTE);
});

test('répétition en langue tapée, traduction : « On réessaie », sans le texte tapé', () => {
  const etat = apresEnvoi('Bleu!', { sonJuste: false, contenu: "J'ai répété : Bleu!" });
  const message = etat.messages[etat.messages.length - 1];
  expect(message).toMatchObject({ sonJuste: false, contenu: "J'ai répété : Bleu!", verdictServeur: true });
  bulle(message);
  expect(screen.getByRole('status')).toHaveTextContent(ON_REESSAIE);
  expect(screen.queryByText(/Bonne prononciation|Mauvaise écoute/)).toBeNull();
});

test('après rechargement (message relu du serveur), le même verdict', () => {
  bulle({ id: 41, role: 'user', contenu: "J'ai entendu le mot deux.", sonJuste: false });
  expect(screen.getByRole('status')).toHaveTextContent(MAUVAISE_ECOUTE);
});

test('après rechargement, la répétition marquée reste « On réessaie »', () => {
  bulle({ id: 42, role: 'user', contenu: "J'ai répété : Bleu!", sonJuste: false });
  expect(screen.getByRole('status')).toHaveTextContent(ON_REESSAIE);
});
