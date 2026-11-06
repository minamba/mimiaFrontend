/**
 * L'ÉTABLISSEMENT À LA CRÉATION DE L'ENFANT — Camara, le 18/10/2026.
 *
 * 1. Le champ n'apparaît qu'à partir de la 3e (rang 9), comme la conseillère
 *    d'orientation — jamais en 4e, ni au primaire.
 * 2. L'enregistrement se fait EN DEUX TEMPS : le profil d'abord, pour obtenir
 *    l'identifiant de l'enfant, puis l'établissement avec cet identifiant.
 *    Un échec du second temps ne défait pas la création.
 */
import { runSaga, stdChannel } from 'redux-saga';
import elevesSaga from '../lib/sagas/elevesSaga';
import { submitEleve, ELEVE_SUBMIT_SUCCESS, ELEVE_SUBMIT_FAILURE } from '../lib/actions/elevesActions';
import { addEleve, definirEtablissement } from '../lib/api/elevesApi';
import { classeAvecConseillere } from '../components/ChoixEtablissement';

jest.mock('../lib/api/elevesApi', () => ({
  getEleves: jest.fn(),
  addEleve: jest.fn(),
  updateEleve: jest.fn(),
  definirEtablissement: jest.fn(),
}));

async function soumettre(payload) {
  const actions = [];
  const canal = stdChannel();
  const tache = runSaga({
    channel: canal,
    dispatch: (action) => { actions.push(action); canal.put(action); },
    getState: () => ({}),
  }, elevesSaga);

  canal.put(submitEleve(payload));
  for (let i = 0; i < 30; i += 1) await Promise.resolve(); // eslint-disable-line no-await-in-loop
  tache.cancel();
  return actions;
}

beforeEach(() => {
  addEleve.mockReset();
  definirEtablissement.mockReset();
});

describe('à partir de la 3e seulement', () => {
  const NIVEAUX = [
    { id: 1, ordre: 1 }, { id: 8, ordre: 8 }, { id: 9, ordre: 9 },
    { id: 12, ordre: 12 }, { id: 40, ordre: 11, code: 'PREMIERE_STMG' },
  ];

  it('3e, lycée et voies du lycée : oui ; 4e et primaire : non', () => {
    expect(classeAvecConseillere(NIVEAUX, 9)).toBe(true);
    expect(classeAvecConseillere(NIVEAUX, '12')).toBe(true);
    expect(classeAvecConseillere(NIVEAUX, 40)).toBe(true);
    expect(classeAvecConseillere(NIVEAUX, 8)).toBe(false);
    expect(classeAvecConseillere(NIVEAUX, 1)).toBe(false);
    expect(classeAvecConseillere(NIVEAUX, '')).toBe(false);
  });
});

describe('la création en deux temps', () => {
  it('crée le profil, puis enregistre l’établissement avec l’identifiant reçu', async () => {
    addEleve.mockResolvedValue({ data: { id: 77, prenom: 'Kamel' } });
    definirEtablissement.mockResolvedValue({
      data: { etablissement: { uai: '0750001A', nom: 'Collège Test', commune: 'Paris' } },
    });

    const actions = await soumettre({ prenom: 'Kamel', niveauScolaireId: 9, etablissementUai: '0750001A' });

    // Le profil part SANS le code : sa route ne le connaît pas.
    expect(addEleve).toHaveBeenCalledWith({ prenom: 'Kamel', niveauScolaireId: 9 });
    expect(definirEtablissement).toHaveBeenCalledWith(77, '0750001A');
    expect(actions.find((a) => a.type === ELEVE_SUBMIT_SUCCESS).payload).toEqual({
      id: 77, prenom: 'Kamel', etablissementUai: '0750001A', etablissementLibelle: 'Collège Test', etablissementCommune: 'Paris',
    });
  });

  it('sans établissement choisi, une seule requête', async () => {
    addEleve.mockResolvedValue({ data: { id: 78 } });
    await soumettre({ prenom: 'Lina', niveauScolaireId: 8, etablissementUai: null });

    expect(addEleve).toHaveBeenCalledTimes(1);
    expect(definirEtablissement).not.toHaveBeenCalled();
  });

  it('l’annuaire en panne : l’enfant est créé quand même', async () => {
    addEleve.mockResolvedValue({ data: { id: 79 } });
    definirEtablissement.mockRejectedValue(new Error('502'));

    const actions = await soumettre({ prenom: 'Sam', niveauScolaireId: 10, etablissementUai: '0750001A' });

    expect(actions.some((a) => a.type === ELEVE_SUBMIT_SUCCESS)).toBe(true);
    expect(actions.some((a) => a.type === ELEVE_SUBMIT_FAILURE)).toBe(false);
  });
});
