/**
 * LE TRAIN DES NOMBRES — le troisième jeu de Mimia, pour le CP.
 *
 * Ce qui se vérifie ici n'est pas « ça marche » mais « ça demande quelque
 * chose », comme pour les deux autres jeux : on ne demande jamais de placer un
 * nombre déjà écrit sur la voie, l'erreur dit dans quel sens, et la voie
 * s'allonge seulement quand le geste est acquis.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrainDesNombres from '../components/jeux/TrainDesNombres';
import {
  bilan, graduations, MANCHES, serie, verdict, voieDe, VOIES,
} from '../lib/jeux/trainDesNombres';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

describe('la voie', () => {
  it('s’allonge à mesure de la partie, et par paliers', () => {
    expect(voieDe(0).max).toBe(10);
    expect(voieDe(2).max).toBe(10);
    expect(voieDe(3).max).toBe(20);
    expect(voieDe(5).max).toBe(20);
    expect(voieDe(6).max).toBe(100);
    expect(voieDe(7).max).toBe(100);
  });

  it('la dernière voie compte de dix en dix — les dizaines sont au programme', () => {
    expect(graduations(VOIES[2])).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it('chaque voie porte trois repères : le début, le milieu, la fin', () => {
    VOIES.forEach((voie) => {
      expect(voie.reperes).toHaveLength(3);
      expect(voie.reperes[0]).toBe(0);
      expect(voie.reperes[2]).toBe(voie.max);
      expect(voie.reperes[1]).toBe(voie.max / 2);
    });
  });
});

describe('la série d’une partie', () => {
  it('donne huit manches', () => {
    expect(serie(1)).toHaveLength(MANCHES);
  });

  /**
   * LE CŒUR DU JEU : on ne demande JAMAIS un nombre déjà écrit sur la voie.
   * Placer « 5 » là où « 5 » est imprimé ne demande rien — il suffit de viser
   * le chiffre, et il n'y a plus rien à estimer.
   */
  it('ne demande jamais de placer un nombre déjà écrit', () => {
    for (let graine = 1; graine <= 40; graine += 1) {
      serie(graine).forEach(({ nombre, voie }) => {
        expect(voie.reperes).not.toContain(nombre);
      });
    }
  });

  it('le nombre demandé tombe toujours sur une graduation de sa voie', () => {
    for (let graine = 1; graine <= 40; graine += 1) {
      serie(graine).forEach(({ nombre, voie }) => {
        expect(graduations(voie)).toContain(nombre);
      });
    }
  });

  it('ne répète jamais le même nombre d’une manche à la suivante', () => {
    for (let graine = 1; graine <= 60; graine += 1) {
      const liste = serie(graine);
      for (let i = 1; i < liste.length; i += 1) {
        expect(liste[i].nombre).not.toBe(liste[i - 1].nombre);
      }
    }
  });

  it('la même graine redonne la même série', () => {
    expect(serie(7)).toEqual(serie(7));
    expect(serie(7)).not.toEqual(serie(8));
  });
});

/**
 * LA COMPARAISON EST DANS LE GESTE, pas dans un exercice à côté. « Trop loin »
 * et « pas assez loin », c'est plus grand et plus petit : l'enfant compare
 * sans qu'on ait écrit un seul signe < ou >.
 */
describe('l’erreur dit dans quel sens', () => {
  it('nomme le sens plutôt que de dire « raté »', () => {
    expect(verdict(7, 7)).toBe('juste');
    expect(verdict(9, 7)).toBe('trop-loin');
    expect(verdict(4, 7)).toBe('pas-assez-loin');
  });

  it('le mot de la fin change avec le nombre de réussites', () => {
    expect(bilan(8)).toMatch(/Bravo/);
    expect(bilan(2)).toMatch(/recommence/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  it('montre la voie, ses trois repères écrits, et le wagon à placer', () => {
    jest.spyOn(Date, 'now').mockReturnValue(77);
    const [premiere] = serie(77);

    render(<TrainDesNombres onQuitter={jest.fn()} />);

    expect(screen.getByLabelText(`Wagon numéro ${premiere.nombre}`)).toBeInTheDocument();

    premiere.voie.reperes.forEach((r) => {
      expect(screen.getByRole('button', { name: `Arrêt ${r}` })).toBeInTheDocument();
    });
  });

  it('le bon arrêt accroche le wagon et permet de continuer', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(77);
    const [premiere] = serie(77);

    render(<TrainDesNombres onQuitter={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', {
      name: `Arrêt entre les repères, position ${premiere.nombre}`,
    }));

    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('un arrêt trop loin le dit, et on peut réessayer', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(77);
    const [premiere] = serie(77);
    const trop = graduations(premiere.voie).find(
      (n) => n > premiere.nombre && !premiere.voie.reperes.includes(n),
    );

    render(<TrainDesNombres onQuitter={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', {
      name: `Arrêt entre les repères, position ${trop}`,
    }));

    expect(screen.getByRole('status')).toHaveTextContent('C’est trop loin !');
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<TrainDesNombres onQuitter={onQuitter} />);

    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('le train dans la ludothèque', () => {
  it('est proposé au CP, et nulle part ailleurs', () => {
    expect(jeuxDeLaClasse('CP').map((j) => j.cle)).toContain('train-des-nombres');
    expect(jeuxDeLaClasse('CE1').map((j) => j.cle)).not.toContain('train-des-nombres');
  });

  it('déclare les trois compétences du référentiel qu’il travaille', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'train-des-nombres');

    expect(jeu.competences).toEqual([
      'MATH_CP_NUM_DEMI_DROITE', 'MATH_CP_NUM_SIGNES', 'MATH_CP_NUM_100',
    ]);
  });
});
