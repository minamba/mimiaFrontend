/**
 * EN VUE ÉLÈVE, LA LISTE DES ÉLÈVES EST L'ENFANT LUI-MÊME — Camara, le
 * 30/09/2026 : une maman, « mon fils parle et le micro ne marche pas, ou une
 * fois sur dix », et des 403 sur `/eleves` dans la console en vue élève.
 *
 * `GET /eleves` est la liste du PARENT, fermée à une session enfant. Les
 * écrans y cherchaient l'élève ; en vue élève elle revenait vide, et la séance
 * tournait sans élève — l'effet de fin de réponse, qui prononce la dernière
 * phrase et vide le lecteur, s'arrêtait net.
 *
 * Ce que ces tests protègent :
 * 1. En session enfant, charger les élèves n'appelle PAS le serveur, et rend
 *    l'enfant de la session — âge compris, pour le ton de la voix.
 * 2. Hors session enfant, rien ne change : on appelle le serveur.
 */

import { runSaga, stdChannel } from 'redux-saga';
import elevesSaga from '../lib/sagas/elevesSaga';
import { chargerEleves, ELEVES_LOAD_SUCCESS } from '../lib/actions/elevesActions';
import { eleveDeLaSession, ouvrirSessionEleve, fermerSessionEleve } from '../lib/storage/sessionEleve';
import { getEleves } from '../lib/api/elevesApi';

jest.mock('../lib/api/elevesApi', () => ({
  getEleves: jest.fn(),
  addEleve: jest.fn(),
  updateEleve: jest.fn(),
}));

async function charger() {
  const actions = [];
  const canal = stdChannel();
  const tache = runSaga({
    channel: canal,
    dispatch: (action) => { actions.push(action); canal.put(action); },
    getState: () => ({}),
  }, elevesSaga);

  canal.put(chargerEleves());
  for (let i = 0; i < 20; i += 1) await Promise.resolve(); // eslint-disable-line no-await-in-loop
  tache.cancel();
  return actions;
}

beforeEach(() => {
  window.localStorage.clear();
  getEleves.mockReset();
});

test('l’enfant de la session, sous la forme d’un profil, âge compris', () => {
  ouvrirSessionEleve({
    jeton: 'j',
    eleve: {
      id: 23, prenom: 'Mins', niveauLibelle: 'CP', niveauCycle: 'Primaire', niveauCode: 'CP', age: 6,
    },
  });

  expect(eleveDeLaSession()).toEqual({
    id: 23, prenom: 'Mins', niveauLibelle: 'CP', niveauCycle: 'Primaire', niveauCode: 'CP', age: 6,
  });
});

test('une session ouverte avant l’âge (API d’avant) reste valable, sans âge', () => {
  window.localStorage.setItem('mimia.session-eleve', JSON.stringify({
    jeton: 'j', eleveId: 23, prenom: 'Mins', niveau: 'CP', cycle: 'Primaire', niveauCode: 'CP',
  }));

  const enfant = eleveDeLaSession();
  expect(enfant.id).toBe(23);
  expect(enfant).not.toHaveProperty('age');
});

test('en session enfant, charger les élèves n’appelle pas le serveur et rend l’enfant', async () => {
  ouvrirSessionEleve({ jeton: 'j', eleve: { id: 23, prenom: 'Mins', niveauLibelle: 'CP', age: 6 } });

  const actions = await charger();

  expect(getEleves).not.toHaveBeenCalled();
  expect(actions).toContainEqual({
    type: ELEVES_LOAD_SUCCESS,
    payload: [expect.objectContaining({ id: 23, prenom: 'Mins', age: 6 })],
  });
});

test('hors session enfant, rien ne change : le serveur donne la liste du parent', async () => {
  fermerSessionEleve();
  getEleves.mockResolvedValue({ data: [{ id: 1, prenom: 'Léa' }, { id: 2, prenom: 'Tom' }] });

  const actions = await charger();

  expect(getEleves).toHaveBeenCalledTimes(1);
  expect(actions).toContainEqual({ type: ELEVES_LOAD_SUCCESS, payload: [{ id: 1, prenom: 'Léa' }, { id: 2, prenom: 'Tom' }] });
});
