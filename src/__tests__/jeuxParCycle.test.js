/**
 * LES JEUX S'OUVRENT CYCLE PAR CYCLE — Camara, le 20/09/2026.
 *
 * Trois interrupteurs d'administration, et un enfant n'est concerné que par
 * celui de son cycle. Les jeux du primaire — très visuels, à manipuler — ne
 * ressemblent pas à ceux du lycée et n'arriveront pas en même temps : un
 * drapeau unique aurait forcé à tout ouvrir ou tout fermer.
 *
 * On passe par la VRAIE lecture des réglages publics, en ne remplaçant que
 * l'appel réseau : c'est la correspondance cycle → drapeau qu'on vérifie, et
 * elle ne vaut que si elle part de ce que le serveur envoie réellement.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { getReglagesPublics } from '../lib/api/reglagesApi';
import { oublierReglages, useJeuxOuverts } from '../lib/storage/modeTest';

jest.mock('../lib/api/reglagesApi', () => ({ getReglagesPublics: jest.fn() }));
jest.mock('../lib/storage/fluxReglages', () => ({ demarrerFluxReglages: () => () => {} }));
jest.mock('../lib/storage/styleSite', () => ({
  appliquerBlueSky: () => {},
  blueSkyEnregistre: () => false,
}));

const repondre = (jeux) => getReglagesPublics.mockResolvedValue({
  data: { jeuxPrimaire: false, jeuxCollege: false, jeuxLycee: false, ...jeux },
});

beforeEach(() => {
  jest.clearAllMocks();
  // Une réponse par défaut AVANT tout : `oublierReglages` relance aussitôt
  // une lecture, et sans mock prêt elle appellerait `.then` sur `undefined`.
  repondre({});
});

/**
 * Chaque cas repart d'une lecture neuve : les réglages sont retenus le temps
 * d'une session, et sans cet oubli le premier test déciderait pour les autres.
 */
const ouvert = async (cycle, jeux) => {
  repondre(jeux);
  oublierReglages();

  const { result } = renderHook(() => useJeuxOuverts(cycle));
  await waitFor(() => expect(getReglagesPublics).toHaveBeenCalled());
  return result;
};

test('un enfant du primaire n’ouvre que la porte du primaire', async () => {
  const result = await ouvert('Primaire', { jeuxPrimaire: true });
  await waitFor(() => expect(result.current).toBe(true));
});

test('le même réglage ne montre rien à un collégien', async () => {
  const result = await ouvert('College', { jeuxPrimaire: true });
  await waitFor(() => expect(getReglagesPublics).toHaveBeenCalled());
  expect(result.current).toBe(false);
});

test('le lycée a son propre interrupteur', async () => {
  const result = await ouvert('Lycee', { jeuxLycee: true });
  await waitFor(() => expect(result.current).toBe(true));
});

// Le serveur écrit « College » et « Lycee » sans accent ; la comparaison ne
// doit pas dépendre de la casse pour autant.
test('la casse du cycle n’a pas d’importance', async () => {
  const result = await ouvert('COLLEGE', { jeuxCollege: true });
  await waitFor(() => expect(result.current).toBe(true));
});

/**
 * UN CYCLE INCONNU FERME LA PORTE : profil incomplet, API plus ancienne,
 * enfant dont la classe n'a pas été renseignée. Mieux vaut un bouton manquant
 * qu'un bouton qui n'ouvre sur rien.
 */
test('un cycle absent ou inconnu ne montre rien, même tout allumé', async () => {
  const tout = { jeuxPrimaire: true, jeuxCollege: true, jeuxLycee: true };

  const sans = await ouvert(undefined, tout);
  const inconnu = await ouvert('Superieur', tout);

  await waitFor(() => expect(getReglagesPublics).toHaveBeenCalled());
  expect(sans.current).toBe(false);
  expect(inconnu.current).toBe(false);
});

/**
 * L'ÉTAT DE DÉPART — avant toute réponse du serveur, les trois portes sont
 * fermées (voir `PAR_DEFAUT` dans `modeTest.js`).
 *
 * PAS DE TEST ICI, ET C'EST DÉLIBÉRÉ. Le vérifier demanderait un module remis
 * à neuf : `oublierReglages` relance une lecture mais GARDE les dernières
 * valeurs connues le temps qu'elle revienne, si bien qu'un tel cas hériterait
 * de l'état du précédent et passerait pour une mauvaise raison. Le registre
 * de modules de Jest ne se laisse pas isoler proprement ici. La garantie qui
 * compte vraiment — une porte ne s'ouvre QUE sur son cycle — est couverte par
 * les cinq cas ci-dessus, et le cas « cycle inconnu » couvre le pire scénario
 * réel : un profil sans classe renseignée.
 */

/**
 * LE CAS DE ZAKARIYA, le 21/09/2026 : un CP en session enfant, l'interrupteur
 * « Primaire » allumé, et pas de bouton.
 *
 * Ce test rejoue la chaîne entière du côté enfant : sa session ne porte que le
 * libellé de sa classe, le cycle s'en déduit, et le drapeau décide. Si le
 * bouton manque alors que ce test passe, c'est que le navigateur n'a pas
 * rechargé — pas que la règle est fausse.
 */
test('un CP en session enfant ouvre bien la porte du primaire', async () => {
  const { cycleDuNiveau } = require('../lib/niveauCycle');

  const result = await ouvert(cycleDuNiveau('CP'), { jeuxPrimaire: true });
  await waitFor(() => expect(result.current).toBe(true));
});

test('et le même enfant ne profite pas de l’interrupteur du collège', async () => {
  const { cycleDuNiveau } = require('../lib/niveauCycle');

  const result = await ouvert(cycleDuNiveau('CP'), { jeuxCollege: true });
  await waitFor(() => expect(getReglagesPublics).toHaveBeenCalled());
  expect(result.current).toBe(false);
});

/**
 * UNE LECTURE RATÉE NE DOIT PAS REFERMER LA PORTE — Camara, le 21/09/2026 :
 * « pourquoi le bouton des jeux disparaît tout le temps ? ».
 *
 * Le chemin d'échec renvoyait les valeurs PAR DÉFAUT et notifiait tout le
 * monde : le temps d'une requête ratée — un onglet qui revient de veille, une
 * seconde de réseau — les jeux se refermaient, l'offre de lancement
 * disparaissait, le style repartait à zéro. On garde désormais ce qu'on
 * savait.
 */
test('un échec réseau ne referme pas une porte déjà ouverte', async () => {
  const result = await ouvert('Primaire', { jeuxPrimaire: true });
  await waitFor(() => expect(result.current).toBe(true));

  // La relecture suivante échoue — exactement ce qui se passe au réveil d'un
  // onglet ou sur une coupure d'une seconde.
  getReglagesPublics.mockRejectedValue(new Error('réseau'));
  oublierReglages();

  await waitFor(() => expect(getReglagesPublics).toHaveBeenCalledTimes(2));
  expect(result.current).toBe(true);
});
