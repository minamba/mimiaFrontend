/**
 * LE PASSAGE D'ÉCOUTE SE LIT D'UNE TRAITE — Camara, le 04/10/2026 : au casque,
 * un bruit capté par le micro coupait le professeur en pleine compréhension
 * orale. Le lecteur annonce donc le passage à l'écran, qui rend le micro
 * sourd, et ne le rend qu'une fois le dernier son joué.
 */

import { voixService } from '../lib/storage/voixService';

describe('le lecteur annonce le passage d’écoute', () => {
  let lecteur;
  let signaux;

  beforeEach(() => {
    jest.useFakeTimers();
    lecteur = voixService.creerLecteur();
    signaux = [];
    lecteur.surEcoute = (oui) => signaux.push(oui);
  });

  afterEach(() => jest.useRealTimers());

  test('le début du passage est signalé tout de suite, et une seule fois', () => {
    lecteur.signalerEcoute(true);
    lecteur.signalerEcoute(true);

    expect(signaux).toEqual([true]);
    expect(lecteur.ecouteEnCours).toBe(true);
  });

  test('la fin attend que le son déjà programmé soit joué', () => {
    lecteur.signalerEcoute(true);
    lecteur.signalerEcoute(false, 3000);

    jest.advanceTimersByTime(2900);
    expect(lecteur.ecouteEnCours).toBe(true);

    jest.advanceTimersByTime(200);
    expect(signaux).toEqual([true, false]);
  });

  test('un second passage qui s’enchaîne annule la fin en attente', () => {
    lecteur.signalerEcoute(true);
    lecteur.signalerEcoute(false, 3000);
    lecteur.signalerEcoute(true);

    jest.advanceTimersByTime(5000);
    expect(signaux).toEqual([true]);
  });

  test('couper le professeur rend le micro aussitôt', () => {
    lecteur.signalerEcoute(true);
    lecteur.arreter();

    expect(signaux).toEqual([true, false]);
  });
});
