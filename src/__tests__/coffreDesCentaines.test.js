/**
 * LE COFFRE DES CENTAINES — décomposer, lire et écrire les nombres jusqu'à
 * 1000, au CE1.
 *
 * Ce qui se vérifie : les nombres s'écrivent juste en lettres, le zéro est
 * bien le piège du jeu, l'erreur nomme une colonne, et rien ne se gagne sans
 * l'annoncer.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoffreDesCentaines from '../components/jeux/CoffreDesCentaines';
import {
  consigneConstruire, decomposer, leurres, MANCHES, MANCHES_CONSTRUIRE, NOMBRES, phraseErreur,
  serie, verdictConstruire, verdictLire,
} from '../lib/jeux/coffreDesCentaines';
import { enLettres } from '../lib/jeux/nombresEnLettres';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('les nombres en lettres', () => {
  it.each([
    [0, 'zéro'], [17, 'dix-sept'], [21, 'vingt et un'], [71, 'soixante et onze'],
    [80, 'quatre-vingts'], [81, 'quatre-vingt-un'], [99, 'quatre-vingt-dix-neuf'],
    [100, 'cent'], [101, 'cent un'], [200, 'deux cents'], [205, 'deux cent cinq'],
    [342, 'trois cent quarante-deux'], [580, 'cinq cent quatre-vingts'],
    [999, 'neuf cent quatre-vingt-dix-neuf'],
  ])('%i s’écrit « %s »', (n, lettres) => {
    expect(enLettres(n)).toBe(lettres);
  });
});

describe('la liste et la série', () => {
  it('des nombres à trois chiffres, sans doublon, dont la moitié porte un zéro', () => {
    expect(new Set(NOMBRES).size).toBe(NOMBRES.length);
    NOMBRES.forEach((n) => { expect(n).toBeGreaterThanOrEqual(100); expect(n).toBeLessThan(1000); });
    const avecZero = NOMBRES.filter((n) => String(n).includes('0'));
    expect(avecZero.length).toBeGreaterThanOrEqual(NOMBRES.length / 2);
  });

  it('quatre à construire, puis quatre à lire, huit nombres différents', () => {
    graines.forEach((g) => {
      const l = serie(g);
      expect(l).toHaveLength(MANCHES);
      expect(new Set(l.map((m) => m.nombre)).size).toBe(MANCHES);
      l.forEach((m, i) => expect(m.mode).toBe(i < MANCHES_CONSTRUIRE ? 'construire' : 'lire'));
    });
  });

  it('à la lecture, trois nombres différents dont le bon, et le zéro déplacé comme leurre', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'lire').forEach((m) => {
      expect(m.choix).toHaveLength(3);
      expect(new Set(m.choix).size).toBe(3);
      expect(m.choix).toContain(m.nombre);
    }));
    expect(leurres(205)).toEqual([250, 25]);
    expect(leurres(342)).toContain(324);
  });
});

describe('l’erreur nomme une colonne', () => {
  it('au coffre : la plus grande colonne fausse, et son sens', () => {
    expect(verdictConstruire(decomposer(342), 342)).toEqual({ sens: 'juste' });
    expect(verdictConstruire({ centaines: 3, dizaines: 2, unites: 2 }, 342)).toEqual({ sens: 'plus', colonne: 'dizaines' });
    expect(verdictConstruire({ centaines: 4, dizaines: 4, unites: 2 }, 342)).toEqual({ sens: 'moins', colonne: 'centaines' });
    expect(phraseErreur('plus', 'dizaines')).toBe('Il manque des dizaines.');
  });

  it('à la lecture : la colonne où le nombre choisi diffère', () => {
    expect(verdictLire(25, 205)).toEqual({ sens: 'relire', colonne: 'centaines' });
    expect(verdictLire(250, 205)).toEqual({ sens: 'relire', colonne: 'dizaines' });
    expect(phraseErreur('relire', 'unites')).toBe('Compte encore les unités.');
  });
});

describe('le coffre à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('le nombre est écrit en lettres, et rien ne se gagne sans l’annoncer', async () => {
    render(<CoffreDesCentaines onQuitter={jest.fn()} />);
    const n = serie(2024)[0].nombre;
    expect(screen.getByText(consigneConstruire(n))).toBeInTheDocument();

    const { centaines, dizaines, unites } = decomposer(n);
    const ajouter = async (piece, fois) => {
      for (let i = 0; i < fois; i += 1) {
        await userEvent.click(screen.getByRole('button', { name: `Ajouter ${piece}` }));
      }
    };
    await ajouter('une plaque', centaines);
    await ajouter('une barre', dizaines + 1);
    await ajouter('un cube', unites);
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Il y a trop de dizaines.');

    await userEvent.click(screen.getByRole('button', { name: 'Retirer une barre' }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });
});

describe('le coffre dans la ludothèque', () => {
  it('est un jeu de maths du CE1, et du CE1 seulement', () => {
    const jeu = jeuxDeLaClasse('CE1').find((j) => j.cle === 'coffre-des-centaines');
    expect(jeu.competences).toEqual(['MATH_CE1_NUM_DECOMPOSER', 'MATH_CE1_NUM_1000']);
    expect(jeuxDeLaClasse('CP').map((j) => j.cle)).not.toContain('coffre-des-centaines');
  });
});
