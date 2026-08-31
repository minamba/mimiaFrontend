/**
 * Le départ de la séance survit à un rechargement, mais pas à n'importe quoi.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Le chronomètre partait de l'instant du montage. Un F5 le remettait à zéro —
 * et avec lui le temps restant annoncé au professeur, qui cessait donc de
 * conclure ; la séance terminée redevenait en cours ; l'évaluation des
 * compétences, déclenchée à la clôture, ne partait jamais.
 *
 * La correction doit distinguer trois gestes que rien ne sépare de l'extérieur :
 * rafraîchir la page, relancer une séance, et revenir le lendemain. Chacun a
 * son test.
 */

import {
  departDeLaSeance, ecouleDepuisLeDepart, oublierLeDepart,
} from '../lib/storage/departSeance';

const SEANCE = { eleveId: 3, matiereId: 7, seance: 0 };

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

test('un rechargement reprend le même départ', () => {
  const premier = departDeLaSeance(SEANCE);

  // Le composant remonte : même élève, même matière, même numéro de séance.
  const apresF5 = departDeLaSeance(SEANCE);

  expect(apresF5).toBe(premier);
});

test('relancer une séance repart de zéro', () => {
  const premier = departDeLaSeance(SEANCE);

  // `seance` est le compteur de relances : c'est LUI qui distingue « je
  // rafraîchis » de « je recommence ».
  jest.spyOn(Date, 'now').mockReturnValue(premier + 60_000);
  const relance = departDeLaSeance({ ...SEANCE, seance: 1 });

  expect(relance).toBeGreaterThan(premier);
});

test('changer de matière repart de zéro', () => {
  const premier = departDeLaSeance(SEANCE);

  jest.spyOn(Date, 'now').mockReturnValue(premier + 30_000);
  const autre = departDeLaSeance({ ...SEANCE, matiereId: 9 });

  expect(autre).toBeGreaterThan(premier);
});

test('un départ trop vieux est ignoré', () => {
  // SANS CETTE PÉREMPTION, une séance abandonnée hier reprendrait son décompte
  // aujourd'hui : l'enfant ouvrirait son cours sur un chronomètre déjà épuisé,
  // et le professeur conclurait avant d'avoir commencé.
  const hier = departDeLaSeance(SEANCE);

  jest.spyOn(Date, 'now').mockReturnValue(hier + 7 * 60 * 60 * 1000);
  const aujourdhui = departDeLaSeance(SEANCE);

  expect(aujourdhui).toBeGreaterThan(hier);
});

test('quitter le cours efface le départ', () => {
  const premier = departDeLaSeance(SEANCE);
  oublierLeDepart();

  jest.spyOn(Date, 'now').mockReturnValue(premier + 5_000);
  const retour = departDeLaSeance(SEANCE);

  expect(retour).toBeGreaterThan(premier);
});

describe('le temps déjà écoulé, lu sans rien écrire', () => {
  test("rend l'écart depuis le départ enregistré", () => {
    const depart = departDeLaSeance(SEANCE);

    jest.spyOn(Date, 'now').mockReturnValue(depart + 125_000);

    expect(ecouleDepuisLeDepart(SEANCE)).toBe(125);
  });

  test("n'écrit rien quand rien n'est enregistré", () => {
    // C'EST LA RAISON D'ÊTRE DE CETTE FONCTION. Elle est appelée pendant le
    // rendu du composant, pour savoir si la séance était déjà finie au
    // chargement. Écrire pendant un rendu poserait un départ à l'instant même,
    // et la séance paraîtrait neuve à chaque rechargement — exactement le
    // défaut qu'on corrige.
    expect(ecouleDepuisLeDepart(SEANCE)).toBe(0);
    expect(window.localStorage.getItem('mimia.seance.depart')).toBeNull();
  });

  test('rend zéro pour une autre séance', () => {
    departDeLaSeance(SEANCE);

    expect(ecouleDepuisLeDepart({ ...SEANCE, seance: 2 })).toBe(0);
    expect(ecouleDepuisLeDepart({ ...SEANCE, matiereId: 99 })).toBe(0);
  });

  test('rend zéro pour un départ périmé', () => {
    const depart = departDeLaSeance(SEANCE);

    jest.spyOn(Date, 'now').mockReturnValue(depart + 7 * 60 * 60 * 1000);

    expect(ecouleDepuisLeDepart(SEANCE)).toBe(0);
  });
});

test('un stockage indisponible ne casse pas la séance', () => {
  // Navigation privée, quota plein, réglage strict : la séance doit avoir lieu
  // quand même. On retombe simplement sur l'ancien comportement.
  jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
    throw new Error('stockage refusé');
  });
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => {
    throw new Error('stockage refusé');
  });

  const avant = Date.now();
  const depart = departDeLaSeance(SEANCE);

  expect(depart).toBeGreaterThanOrEqual(avant);
});
