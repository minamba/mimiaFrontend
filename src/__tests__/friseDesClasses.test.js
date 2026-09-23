/**
 * LA FRISE DES CLASSES — Camara, le 23/09/2026.
 *
 * Ce qui se teste ici n'est pas l'allure de la piste, c'est la RÈGLE : quelle
 * classe s'ouvre, laquelle se verrouille, et pour qui. Une erreur de rang ne
 * se voit pas à l'écran — elle ouvre les jeux de 3e à un CE1, ou refuse à un
 * lycéen ceux de sa propre classe.
 *
 * LES VINGT-SIX CODES sont énumérés parce qu'ils viennent de la base
 * (`ReferentielSeeder`) : si une voie est ajoutée là-bas sans l'être ici, son
 * élève n'a plus de rang, et la frise s'ouvre en grand pour lui.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FRISE, frisePourLaClasse, rangDeLaClasse } from '../lib/jeux/frise';
import FriseDesClasses from '../components/jeux/FriseDesClasses';

describe('le rang d’une classe', () => {
  it('va de 1 au CP à 12 en terminale', () => {
    expect(FRISE.map((e) => e.rang)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(rangDeLaClasse('CP')).toBe(1);
    expect(rangDeLaClasse('CM2')).toBe(5);
    expect(rangDeLaClasse('TERMINALE')).toBe(12);
  });

  it('range les vingt-six classes de la base sur les douze années', () => {
    const attendu = {
      CP: 1, CE1: 2, CE2: 3, CM1: 4, CM2: 5,
      SIXIEME: 6, CINQUIEME: 7, QUATRIEME: 8, TROISIEME: 9, TROISIEME_PREPA: 9,
      SECONDE: 10, SECONDE_PRO: 10,
      PREMIERE: 11, PREMIERE_TECHNO: 11, PREMIERE_PRO: 11,
      PREMIERE_STMG: 11, PREMIERE_ST2S: 11, PREMIERE_STL: 11,
      TERMINALE: 12, TERMINALE_TECHNO: 12, TERMINALE_PRO: 12,
      TERMINALE_STMG: 12, TERMINALE_ST2S: 12, TERMINALE_STL: 12,
    };

    expect(Object.keys(attendu)).toHaveLength(24);
    Object.entries(attendu).forEach(([code, rang]) => {
      expect([code, rangDeLaClasse(code)]).toEqual([code, rang]);
    });
  });

  it('lit aussi le libellé, pour les sessions ouvertes avant le code', () => {
    expect(rangDeLaClasse('6e')).toBe(6);
    expect(rangDeLaClasse('3e prépa-métiers')).toBe(9);
    expect(rangDeLaClasse('Seconde générale et technologique')).toBe(10);
    expect(rangDeLaClasse('Première STMG')).toBe(11);
    expect(rangDeLaClasse('Terminale professionnelle')).toBe(12);
  });

  it('ne devine rien quand le libellé n’apprend rien', () => {
    expect(rangDeLaClasse('')).toBeNull();
    expect(rangDeLaClasse(null)).toBeNull();
    expect(rangDeLaClasse('BTS')).toBeNull();
  });
});

describe('ce qui s’ouvre et ce qui se verrouille', () => {
  const codes = (etapes, filtre) => etapes.filter(filtre).map((e) => e.court);

  it('un CM1 garde les classes d’avant et bute sur le CM2', () => {
    const etapes = frisePourLaClasse('CM1');

    expect(codes(etapes, (e) => !e.verrouillee)).toEqual(['CP', 'CE1', 'CE2', 'CM1']);
    expect(codes(etapes, (e) => e.verrouillee)[0]).toBe('CM2');
    expect(codes(etapes, (e) => e.sienne)).toEqual(['CM1']);
  });

  it('un lycéen de voie professionnelle a tout le collège ouvert', () => {
    const etapes = frisePourLaClasse('PREMIERE_PRO');

    expect(codes(etapes, (e) => e.verrouillee)).toEqual(['Tle']);
    expect(codes(etapes, (e) => e.sienne)).toEqual(['1re']);
  });

  it('une classe inconnue n’enferme personne', () => {
    const etapes = frisePourLaClasse(null);

    expect(codes(etapes, (e) => e.verrouillee)).toEqual([]);
    expect(codes(etapes, (e) => e.sienne)).toEqual([]);
  });

  it('une classe ouverte sans jeu n’est PAS une classe verrouillée', () => {
    // Un enfant de 3e : sa classe est ouverte, mais ses jeux ne sont pas
    // écrits. Le confondre avec un cadenas lui dirait qu'il n'a pas le niveau
    // de sa propre année.
    const etapes = frisePourLaClasse('TROISIEME', (code) => code === 'CM2');
    const troisieme = etapes.find((e) => e.court === '3e');

    expect(troisieme.verrouillee).toBe(false);
    expect(troisieme.desJeux).toBe(false);
    expect(etapes.find((e) => e.court === 'CM2').desJeux).toBe(true);
  });
});

describe('la piste à l’écran', () => {
  const etapes = frisePourLaClasse('CE2', () => true);

  it('un clic sur une classe ouverte la choisit, sans message', () => {
    const choisir = jest.fn();
    render(<FriseDesClasses etapes={etapes} choisie="CE2" onChoisir={choisir} />);

    fireEvent.click(screen.getByRole('button', { name: /CP/ }));

    expect(choisir).toHaveBeenCalledWith('CP');
    expect(screen.queryByText(/pas encore le niveau/i)).not.toBeInTheDocument();
  });

  it('un clic sur un cadenas explique, et ne change pas de classe', () => {
    const choisir = jest.fn();
    render(<FriseDesClasses etapes={etapes} choisie="CE2" onChoisir={choisir} />);

    fireEvent.click(screen.getByRole('button', { name: /CM2/ }));

    expect(choisir).not.toHaveBeenCalled();
    expect(screen.getByText(/pas encore le niveau pour débloquer ces jeux/i)).toBeInTheDocument();
  });

  it('le cadenas reste un bouton : il répond au clic au lieu de se taire', () => {
    render(<FriseDesClasses etapes={etapes} choisie="CE2" onChoisir={jest.fn()} />);
    const verrouille = screen.getByRole('button', { name: /Tle/ });

    expect(verrouille).not.toBeDisabled();
    expect(verrouille).toHaveAttribute('aria-disabled', 'true');
  });
});
