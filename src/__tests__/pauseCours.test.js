/* eslint-disable testing-library/no-node-access */
/**
 * LE COURS EN PAUSE — Camara, le 03/11/2026 : le chrono s'arrête, la voix se fige
 * et reprend au même endroit, et un rechargement ne lève pas la pause.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import PauseCours from '../components/PauseCours';
import { SELECTEUR_FENETRES } from '../lib/storage/verrouDefilement';
import {
  departDeLaSeance, ecouleDepuisLeDepart, leverPause, pauseEnregistree, poserPause,
} from '../lib/storage/departSeance';
import { voixService } from '../lib/storage/voixService';

const SEANCE = { eleveId: '24', matiereId: '7', seance: 1 };
const MINUTE = 60 * 1000;
const HEURE = 60 * MINUTE;

describe('le temps de la séance', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-11-03T17:00:00Z'));
  });

  afterEach(() => jest.useRealTimers());

  test('le compteur s’arrête à la pause, et repart exactement de là', () => {
    departDeLaSeance(SEANCE);

    jest.setSystemTime(Date.now() + 10 * MINUTE);
    poserPause(SEANCE);
    expect(pauseEnregistree(SEANCE)).toBe(true);

    // Vingt minutes de goûter : rien ne bouge, même à la relecture après un F5.
    jest.setSystemTime(Date.now() + 20 * MINUTE);
    expect(ecouleDepuisLeDepart(SEANCE)).toBe(600);

    expect(leverPause(SEANCE)).toBe(20 * MINUTE);
    expect(pauseEnregistree(SEANCE)).toBe(false);
    expect(ecouleDepuisLeDepart(SEANCE)).toBe(600);

    jest.setSystemTime(Date.now() + MINUTE);
    expect(ecouleDepuisLeDepart(SEANCE)).toBe(660);
  });

  test('le départ recalculé après la pause reste celui de la même séance', () => {
    const depart = departDeLaSeance(SEANCE);

    jest.setSystemTime(Date.now() + 5 * MINUTE);
    poserPause(SEANCE);
    expect(departDeLaSeance(SEANCE)).toBe(depart);

    jest.setSystemTime(Date.now() + 5 * MINUTE);
    leverPause(SEANCE);
    expect(departDeLaSeance(SEANCE)).toBe(depart + 5 * MINUTE);
  });

  test('poser deux fois garde le début de la première pause', () => {
    departDeLaSeance(SEANCE);
    poserPause(SEANCE);

    jest.setSystemTime(Date.now() + 3 * MINUTE);
    poserPause(SEANCE);

    jest.setSystemTime(Date.now() + 2 * MINUTE);
    expect(leverPause(SEANCE)).toBe(5 * MINUTE);
  });

  test('une pause abandonnée depuis plus de six heures ne reprend pas', () => {
    departDeLaSeance(SEANCE);
    poserPause(SEANCE);

    jest.setSystemTime(Date.now() + 7 * HEURE);

    expect(pauseEnregistree(SEANCE)).toBe(false);
    expect(ecouleDepuisLeDepart(SEANCE)).toBe(0);
  });

  test('une longue séance avec pause ne se périme pas à cause de la pause', () => {
    departDeLaSeance(SEANCE);

    jest.setSystemTime(Date.now() + 30 * MINUTE);
    poserPause(SEANCE);

    // Cinq heures quarante-cinq de pause : départ à plus de six heures, pause à moins.
    jest.setSystemTime(Date.now() + 5 * HEURE + 45 * MINUTE);
    expect(pauseEnregistree(SEANCE)).toBe(true);
    expect(ecouleDepuisLeDepart(SEANCE)).toBe(1800);
  });

  test('la pause d’une autre séance ne compte pas', () => {
    departDeLaSeance(SEANCE);
    poserPause(SEANCE);

    expect(pauseEnregistree({ ...SEANCE, matiereId: '8' })).toBe(false);
    expect(leverPause({ ...SEANCE, matiereId: '8' })).toBe(0);
  });
});

describe('la voix', () => {
  const contexteDeTest = () => ({
    state: 'running',
    currentTime: 0,
    suspend: jest.fn(function suspendre() {
      this.state = 'suspended';
      return Promise.resolve();
    }),
    resume: jest.fn(function reveiller() {
      this.state = 'running';
      return Promise.resolve();
    }),
  });

  test('elle se fige sans rien jeter, et reprend avec un clic', () => {
    const lecteur = voixService.creerLecteur();
    const contexte = contexteDeTest();
    lecteur.contexte = contexte;
    lecteur.file = [{ texte: 'La suite de la phrase.' }];

    lecteur.mettreEnPause();

    expect(contexte.suspend).toHaveBeenCalledTimes(1);
    expect(lecteur.file).toHaveLength(1);

    lecteur.reprendreApresPause();

    expect(contexte.resume).toHaveBeenCalledTimes(1);
    expect(lecteur.enPause).toBe(false);
  });

  test('en pause, rien ne réveille le son, ni ne réclame un clic', () => {
    const lecteur = voixService.creerLecteur();
    const contexte = contexteDeTest();
    const surBlocage = jest.fn();
    lecteur.contexte = contexte;
    lecteur.surBlocage = surBlocage;

    lecteur.mettreEnPause();
    lecteur.obtenirContexte();

    expect(contexte.resume).not.toHaveBeenCalled();
    expect(surBlocage).not.toHaveBeenCalled();
  });

  test('la fin de la voix n’est pas annoncée pendant la pause, ni en pleine reprise', async () => {
    const lecteur = voixService.creerLecteur();
    const contexte = contexteDeTest();
    const ecouteurs = [];
    contexte.addEventListener = (_, f) => ecouteurs.push(f);
    contexte.removeEventListener = () => {};
    lecteur.contexte = contexte;
    lecteur.mettreEnPause();

    let finie = false;
    const attente = lecteur.attendreJusqua(0.02, lecteur.jeton).then(() => { finie = true; });

    await Promise.resolve();
    expect(finie).toBe(false);

    // Le graphe repart : il reste 20 ms de son programmé, on les attend encore.
    lecteur.reprendreApresPause();
    ecouteurs.forEach((f) => f());
    await Promise.resolve();
    expect(finie).toBe(false);

    await attente;
    expect(finie).toBe(true);
  });

  test('une boucle en attente de reprise s’en va si la voix est coupée', async () => {
    const lecteur = voixService.creerLecteur();
    lecteur.mettreEnPause();

    let liberee = false;
    lecteur.attendreLaReprise().then(() => { liberee = true; });

    lecteur.arreter();
    await Promise.resolve();

    expect(liberee).toBe(true);
  });
});

describe('l’écran de pause', () => {
  test('il ne propose que reprendre ou quitter, et fige la page', () => {
    const onReprendre = jest.fn();
    const onQuitter = jest.fn();
    render(<PauseCours onReprendre={onReprendre} onQuitter={onQuitter} />);

    const reprendre = screen.getByRole('button', { name: /Reprendre le cours/ });
    expect(reprendre).toHaveFocus();

    fireEvent.click(reprendre);
    expect(onReprendre).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Quitter le cours' }));
    expect(onQuitter).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('dialog', { name: 'Cours en pause' }).matches(SELECTEUR_FENETRES)).toBe(true);
  });
});
