/**
 * LE COMPTE À REBOURS DES ESCAPE GAMES — Camara, le 07/10/2026.
 * À zéro : en défi, la page reçoit la fin de partie ; en tranquille, l'élève
 * finit quand même. Une durée par classe.
 */
import { act, render, screen } from '@testing-library/react';
import {
  DUREE_ESCAPE, cadran, dureeEscape, enMinutes, resteMs,
} from '../lib/jeux/college/chrono.js';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import { DEFI, TRANQUILLE } from '../lib/jeux/coeurs';
import { ECRANS_COLLEGE } from '../components/jeux/JeuxCollege';
import FinDuDefi from '../components/jeux/FinDuDefi';

describe('le chrono, en calcul', () => {
  it('donne une durée par classe, plus longue en 6e qu’en 3e', () => {
    expect(dureeEscape('SIXIEME')).toBe(7 * 60);
    expect(dureeEscape('CINQUIEME')).toBe(6 * 60);
    expect(dureeEscape('QUATRIEME')).toBe(5 * 60);
    expect(dureeEscape('TROISIEME')).toBe(5 * 60);
    expect(dureeEscape('INCONNUE')).toBe(Math.max(...Object.values(DUREE_ESCAPE)));
  });

  it('compte à rebours sans jamais passer sous zéro', () => {
    expect(resteMs(600, 1000, 1000)).toBe(600000);
    expect(resteMs(600, 1000, 61000)).toBe(540000);
    expect(resteMs(600, 1000, 10 ** 9)).toBe(0);
  });

  it('s’affiche comme un minuteur, et la durée en mots courts', () => {
    expect(cadran(600000)).toBe('10:00');
    expect(cadran(65000)).toBe('1:05');
    expect(cadran(400)).toBe('0:01');
    expect(cadran(0)).toBe('0:00');
    expect(enMinutes(492000)).toBe('8 min 12 s');
    expect(enMinutes(45000)).toBe('45 s');
    expect(enMinutes(600000)).toBe('10 min');
  });
});

describe('le chrono, à l’écran', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const Jeu = ECRANS_COLLEGE['escape-maths'];
  const jouer = (mode, terminerDefi = jest.fn()) => {
    render(
      <FournirJeu value={{
        jeuCle: 'escape-maths', niveau: 'TROISIEME', mode, coeursMax: mode === DEFI ? 3 : 0, rejouerPartie: jest.fn(), terminerDefi,
      }}
      >
        <Jeu onQuitter={jest.fn()} matiereCode="MATHS" niveau="TROISIEME" />
      </FournirJeu>,
    );
    return terminerDefi;
  };

  it('annonce la durée et la règle du mode, et part de la durée de la classe', () => {
    jouer(TRANQUILLE);
    expect(screen.getByText(/Tu as 5 minutes pour ouvrir les six cadenas/)).toBeInTheDocument();
    expect(screen.getByText(/tu pourras quand même finir/)).toBeInTheDocument();
    expect(screen.getByRole('timer')).toHaveTextContent('5:00');
    act(() => { jest.advanceTimersByTime(61000); });
    expect(screen.getByRole('timer')).toHaveTextContent('3:59');
  });

  it('en tranquille, à zéro : « temps écoulé », et la partie continue', () => {
    const terminerDefi = jouer(TRANQUILLE);
    act(() => { jest.advanceTimersByTime(5 * 60 * 1000 + 500); });
    expect(screen.getByRole('timer')).toHaveTextContent('0:00');
    expect(screen.getByText(/Temps écoulé : finis quand même/)).toBeInTheDocument();
    expect(terminerDefi).not.toHaveBeenCalled();
    expect(screen.getByRole('list', { name: 'Choisis ta réponse' })).toBeInTheDocument();
  });

  it('en défi, à zéro : la page reçoit la fin, une seule fois, avec les cadenas ouverts', () => {
    const terminerDefi = jouer(DEFI);
    expect(screen.getByText(/l’alarme gagne/)).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(5 * 60 * 1000 + 500); });
    act(() => { jest.advanceTimersByTime(2000); });
    expect(terminerDefi).toHaveBeenCalledTimes(1);
    expect(terminerDefi).toHaveBeenCalledWith({
      reussies: 0, questions: 0, raison: 'temps', total: 6,
    });
  });
});

describe('la fin du défi, quand le temps est écoulé', () => {
  it('parle de cadenas et de temps, pas de cœurs', () => {
    render(
      <FinDuDefi coeursMax={3} reussies={2} questions={2} raison="temps" total={6} onRefaire={jest.fn()} onTranquille={jest.fn()} onQuitter={jest.fn()} />,
    );
    expect(screen.getAllByText('Le temps est écoulé !').length).toBeGreaterThan(0);
    expect(screen.getByRole('status')).toHaveTextContent('2cadenas ouvertssur 6');
    expect(screen.queryByText(/cœur/)).toBeNull();
  });

  it('garde son texte de cœurs sans raison', () => {
    render(
      <FinDuDefi coeursMax={3} reussies={2} questions={4} onRefaire={jest.fn()} onTranquille={jest.fn()} onQuitter={jest.fn()} />,
    );
    expect(screen.getAllByText('Le défi s’arrête ici !').length).toBeGreaterThan(0);
    expect(screen.getByText(/te rendent un cœur/)).toBeInTheDocument();
  });
});
