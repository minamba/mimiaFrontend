/**
 * LES PAQUETS DE DIX — le quatrième jeu de Mimia, pour le CP.
 *
 * Même exigence que les trois autres : ce qui se vérifie, c'est que le jeu
 * demande quelque chose.
 *
 * LE TEST QUI COMPTE LE PLUS ICI est « rien ne se gagne sans l'annoncer ».
 * La première version allumait la victoire dès que le compte tombait juste,
 * et on pouvait donc gagner à tous les coups en ajoutant une bûchette à la
 * fois. C'est le reproche fait à la première boîte de 10, et il ne doit pas
 * revenir sans qu'un test le voie.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaquetsDeDix from '../components/jeux/PaquetsDeDix';
import {
  bilan, decomposer, MANCHES, serie, verdict,
} from '../lib/jeux/paquetsDeDix';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

describe('décomposer un nombre', () => {
  it('donne des dizaines et des unités, unités toujours sous dix', () => {
    expect(decomposer(34)).toEqual({ paquets: 3, unites: 4 });
    expect(decomposer(40)).toEqual({ paquets: 4, unites: 0 });
    expect(decomposer(9)).toEqual({ paquets: 0, unites: 9 });
  });
});

describe('la série d’une partie', () => {
  it('donne huit manches', () => {
    expect(serie(1)).toHaveLength(MANCHES);
  });

  /**
   * EN DESSOUS DE ONZE, UN SEUL PAQUET SUFFIRAIT TOUJOURS : la dizaine ne se
   * jouerait plus. La cible reste à deux chiffres.
   */
  it('les cibles restent entre 11 et 99', () => {
    for (let graine = 1; graine <= 60; graine += 1) {
      serie(graine).forEach((cible) => {
        expect(cible).toBeGreaterThanOrEqual(11);
        expect(cible).toBeLessThanOrEqual(99);
      });
    }
  });

  it('ne répète jamais la même cible d’une manche à la suivante', () => {
    for (let graine = 1; graine <= 60; graine += 1) {
      const liste = serie(graine);
      for (let i = 1; i < liste.length; i += 1) {
        expect(liste[i]).not.toBe(liste[i - 1]);
      }
    }
  });

  it('la même graine redonne la même série', () => {
    expect(serie(7)).toEqual(serie(7));
    expect(serie(7)).not.toEqual(serie(8));
  });
});

describe('ce que vaut une réponse annoncée', () => {
  it('dit juste seulement à l’exact compte, paquets et bûchettes combinés', () => {
    expect(verdict(3, 4, 34)).toBe('juste');
    // Un autre chemin vers le même total est tout aussi juste : ce qui
    // compte est la somme, pas la façon dont elle a été posée.
    expect(verdict(1, 24, 34)).toBe('juste');
  });

  it('nomme le sens de l’erreur dans les deux cas', () => {
    expect(verdict(2, 3, 34)).toBe('pas-assez');
    expect(verdict(4, 0, 34)).toBe('trop');
    expect(verdict(3, 5, 34)).toBe('trop');
  });

  it('le mot de la fin change avec le nombre de réussites', () => {
    expect(bilan(8)).toMatch(/Bravo/);
    expect(bilan(2)).toMatch(/recommence/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const ajouterPaquet = () => screen.getByRole('button', { name: 'Un paquet de dix' });
  const ajouterBuchette = () => screen.getByRole('button', { name: 'Une bûchette' });
  const annoncer = () => screen.getByRole('button', { name: /C’est prêt/ });

  it('montre la cible et un plateau vide au départ', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = serie(2024);

    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    expect(screen.getByText(`Prépare ${premiere} bûchettes, en paquets de dix.`)).toBeInTheDocument();
    expect(screen.getByText('Pose tes paquets et tes bûchettes ici')).toBeInTheDocument();
  });

  /** On n'annonce pas un plateau vide : ce ne serait pas une réponse. */
  it('ne propose d’annoncer qu’une fois quelque chose posé', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /C’est prêt/ })).not.toBeInTheDocument();

    await userEvent.click(ajouterBuchette());
    expect(annoncer()).toBeInTheDocument();
  });

  /**
   * LE TEST QUI TIENT TOUT LE JEU. Le bon compte est posé, mais tant qu'il
   * n'est pas annoncé, rien n'est gagné. Sans cette garde, on gagne à tous
   * les coups en avançant d'une bûchette à la fois.
   */
  it('rien ne se gagne sans l’annoncer, même avec le bon compte posé', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = serie(2024);
    const { paquets, unites } = decomposer(premiere);

    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    for (let i = 0; i < paquets; i += 1) await userEvent.click(ajouterPaquet());
    for (let i = 0; i < unites; i += 1) await userEvent.click(ajouterBuchette());

    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(annoncer());
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('annoncer trop peu le dit, et on peut compléter', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    // Une seule bûchette ne peut atteindre aucune cible à deux chiffres.
    await userEvent.click(ajouterBuchette());
    await userEvent.click(annoncer());

    expect(screen.getByRole('status')).toHaveTextContent('Il n’y en a pas assez.');
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    // Le message s'efface dès qu'on reprend la construction.
    await userEvent.click(ajouterBuchette());
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('annoncer trop le dit, et un paquet se reprend', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    // Dix paquets valent cent, ce qui dépasse toute cible : elles restent
    // toutes sous la barre des cent, à deux chiffres.
    for (let i = 0; i < 10; i += 1) await userEvent.click(ajouterPaquet());
    await userEvent.click(annoncer());

    expect(screen.getByRole('status')).toHaveTextContent('Il y en a trop.');

    await userEvent.click(screen.getAllByRole('button', { name: 'Reprendre un paquet de dix' })[0]);
    expect(screen.getAllByRole('button', { name: 'Reprendre un paquet de dix' })).toHaveLength(9);
  });

  /**
   * LE CŒUR DE LA RÈGLE : dix bûchettes ne restent jamais posées en même
   * temps — le dixième clic les transforme en un paquet de plus.
   */
  it('dix bûchettes deviennent un paquet, automatiquement', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<PaquetsDeDix onQuitter={jest.fn()} />);

    for (let i = 0; i < 10; i += 1) await userEvent.click(ajouterBuchette());

    expect(screen.queryAllByRole('button', { name: 'Reprendre une bûchette' })).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Reprendre un paquet de dix' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<PaquetsDeDix onQuitter={onQuitter} />);

    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('les paquets de dix dans la ludothèque', () => {
  it('sont proposés au CP, et nulle part ailleurs', () => {
    expect(jeuxDeLaClasse('CP').map((j) => j.cle)).toContain('paquets-de-dix');
    expect(jeuxDeLaClasse('CE1').map((j) => j.cle)).not.toContain('paquets-de-dix');
  });

  it('déclarent la compétence du référentiel qu’ils travaillent', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'paquets-de-dix');

    expect(jeu.competences).toEqual(['MATH_CP_NUM_DECOMPOSER']);
  });
});
