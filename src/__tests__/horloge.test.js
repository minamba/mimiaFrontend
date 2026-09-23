/**
 * L'HORLOGE — le sixième jeu de Mimia, pour le CP.
 *
 * Ce qui se vérifie : que le jeu vise la vraie difficulté — savoir LAQUELLE
 * des deux aiguilles donne l'heure —, que l'erreur se nomme, et qu'au réglage
 * rien ne se gagne sans l'annoncer.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Horloge from '../components/jeux/Horloge';
import {
  bilan, ecrire, estDemie, MANCHES, MANCHES_LECTURE, PHRASES, propositions, serie,
  verdictLecture, verdictReglage,
} from '../lib/jeux/horloge';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('la série d’une partie', () => {
  it('quatre manches de lecture, puis quatre de réglage', () => {
    const liste = serie(1);
    expect(liste).toHaveLength(MANCHES);
    liste.forEach((m, i) => expect(m.mode).toBe(i < MANCHES_LECTURE ? 'lecture' : 'reglage'));
  });

  /** Les deux aiguilles se superposent à 12 heures : le piège n'aurait plus de sens. */
  it('la lecture ne montre jamais 12 heures', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'lecture')
      .forEach((m) => expect(m.heure).not.toBe(12)));
  });

  /** LE PIÈGE DU JEU : « 12 heures », ce que lit l'enfant qui regarde la grande aiguille. */
  it('la lecture propose toujours la bonne heure et « 12 heures », parmi quatre heures différentes', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'lecture').forEach((m) => {
      expect(new Set(m.choix).size).toBe(4);
      expect(m.choix).toContain(m.heure);
      expect(m.choix).toContain(12);
    }));
  });

  it('les autres propositions sont des voisines, sans faire le tour du cadran', () => {
    for (let h = 1; h <= 11; h += 1) {
      propositions(h, Math.random).filter((x) => x !== h && x !== 12).forEach((x) => {
        expect(Math.abs(x - h)).toBeLessThanOrEqual(2);
        expect(x).toBeGreaterThanOrEqual(1);
        expect(x).toBeLessThanOrEqual(11);
      });
    }
  });

  /** Laisser une aiguille en place donnerait la moitié de la réponse. */
  it('au réglage, les deux aiguilles partent d’une position fausse', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'reglage').forEach((m) => {
      expect(m.depart.petite).not.toBe(m.heure);
      expect(m.depart.grande).not.toBe(12);
    }));
  });

  it('jamais la même heure deux fois d’affilée, et la même graine redonne la même série', () => {
    graines.forEach((g) => {
      const l = serie(g);
      for (let i = 1; i < l.length; i += 1) expect(l[i].heure).not.toBe(l[i - 1].heure);
    });
    expect(serie(7)).toEqual(serie(7));
  });
});

describe('l’erreur se nomme', () => {
  it('à la lecture : les aiguilles, ou plus tôt, ou plus tard', () => {
    expect(verdictLecture(7, 7)).toBe('juste');
    expect(verdictLecture(12, 7)).toBe('aiguilles');
    expect(verdictLecture(6, 7)).toBe('plus-tard');
    expect(verdictLecture(8, 7)).toBe('plus-tot');
  });

  it('au réglage : les aiguilles inversées passent avant tout', () => {
    expect(verdictReglage({ petite: 7, grande: 12 }, 7)).toBe('juste');
    expect(verdictReglage({ petite: 12, grande: 7 }, 7)).toBe('inversees');
    expect(verdictReglage({ petite: 7, grande: 3 }, 7)).toBe('grande');
    expect(verdictReglage({ petite: 5, grande: 12 }, 7)).toBe('petite');
  });

  it('le mot de la fin est celui des autres jeux', () => {
    expect(bilan(8)).toMatch(/Bravo/);
    expect(bilan(2)).toMatch(/recommence/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  const partie = () => serie(GRAINE);

  /** Avance jusqu'à la première manche de réglage, en répondant juste. */
  const allerAuReglage = async () => {
    for (let i = 0; i < MANCHES_LECTURE; i += 1) {
      const h = partie()[i].heure;
      await userEvent.click(screen.getByRole('button', { name: `${h} heure${h > 1 ? 's' : ''}` }));
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    }
  };

  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  it('lire la grande aiguille est nommé, et la bonne heure fait continuer', async () => {
    render(<Horloge onQuitter={jest.fn()} />);
    const h = partie()[0].heure;

    await userEvent.click(screen.getByRole('button', { name: '12 heures' }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.aiguilles);

    await userEvent.click(screen.getByRole('button', { name: `${h} heure${h > 1 ? 's' : ''}` }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('au réglage, on choisit une aiguille avant de toucher un nombre', async () => {
    render(<Horloge onQuitter={jest.fn()} />);
    await allerAuReglage();

    // Sans aiguille choisie, toucher un nombre ne fait rien.
    await userEvent.click(screen.getByRole('button', { name: 'Le 5' }));
    expect(screen.queryByRole('button', { name: /C’est prêt/ })).not.toBeInTheDocument();
  });

  it('rien ne se gagne sans l’annoncer, et la grande aiguille oubliée est nommée', async () => {
    render(<Horloge onQuitter={jest.fn()} />);
    await allerAuReglage();
    const h = partie()[MANCHES_LECTURE].heure;

    await userEvent.click(screen.getByRole('button', { name: 'Petite aiguille' }));
    await userEvent.click(screen.getByRole('button', { name: `Le ${h}` }));
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.grande);

    await userEvent.click(screen.getByRole('button', { name: 'Grande aiguille' }));
    await userEvent.click(screen.getByRole('button', { name: 'Le 12' }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<Horloge onQuitter={onQuitter} />);
    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('l’horloge dans la ludothèque', () => {
  it('est proposée au CP et au CE1, chacun avec sa compétence', () => {
    const cp = jeuxDeLaClasse('CP').find((j) => j.cle === 'horloge');
    expect(cp.competences).toEqual(['MATH_CP_MES_TEMPS']);
    const ce1 = jeuxDeLaClasse('CE1').find((j) => j.cle === 'horloge');
    expect(ce1.competences).toEqual(['MATH_CE1_MES_HEURE']);
    expect(jeuxDeLaClasse('CE2').map((j) => j.cle)).not.toContain('horloge');
  });
});

/**
 * AU CE1, LA DEMI-HEURE. Le CP ne doit pas en voir une seule, et le CE1 doit
 * rencontrer les deux pièges de la demie.
 */
describe('l’horloge du CE1', () => {
  it('le CP ne voit que des heures entières, comme avant', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      expect(estDemie(m.heure)).toBe(false);
      (m.choix ?? []).forEach((c) => expect(estDemie(c)).toBe(false));
    }));
  });

  it('trois demies sur quatre dans chaque moitié de partie', () => {
    graines.forEach((g) => {
      const l = serie(g, MANCHES, 'CE1');
      expect(l.slice(0, 4).filter((m) => estDemie(m.heure))).toHaveLength(3);
      expect(l.slice(4).filter((m) => estDemie(m.heure))).toHaveLength(3);
    });
  });

  it('une demie propose ses deux pièges : l’heure seule et la demie suivante', () => {
    graines.forEach((g) => serie(g, MANCHES, 'CE1')
      .filter((m) => m.mode === 'lecture' && estDemie(m.heure))
      .forEach((m) => {
        expect(m.choix).toHaveLength(4);
        expect(new Set(m.choix).size).toBe(4);
        expect(m.choix).toContain(m.heure);
        expect(m.choix).toContain(Math.floor(m.heure));
        expect(m.choix.map((c) => verdictLecture(c, m.heure))).toContain('entre');
      }));
  });

  it('au réglage, la grande aiguille ne part ni du 12 ni du 6', () => {
    graines.forEach((g) => serie(g, MANCHES, 'CE1').filter((m) => m.mode === 'reglage').forEach((m) => {
      expect([6, 12]).not.toContain(m.depart.grande);
    }));
  });

  it('chaque piège de la demie a son nom', () => {
    expect(verdictLecture(3.5, 3.5)).toBe('juste');
    expect(verdictLecture(3, 3.5)).toBe('demie');
    expect(verdictLecture(4.5, 3.5)).toBe('entre');
    expect(verdictLecture(1.5, 12.5)).toBe('entre');
    expect(verdictLecture(3.5, 3)).toBe('pleine');
    expect(verdictReglage({ petite: 3, grande: 6 }, 3.5)).toBe('juste');
    expect(verdictReglage({ petite: 3, grande: 12 }, 3.5)).toBe('grande-demie');
    expect(verdictReglage({ petite: 6, grande: 3 }, 3.5)).toBe('inversees');
    expect(verdictReglage({ petite: 4, grande: 6 }, 3.5)).toBe('petite');
  });

  it('s’écrit en toutes lettres, au singulier pour une heure', () => {
    expect(ecrire(3.5)).toBe('3 heures et demie');
    expect(ecrire(1.5)).toBe('1 heure et demie');
    expect(ecrire(7)).toBe('7 heures');
  });

  it('à l’écran, une demie se lit parmi quatre réponses', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<Horloge onQuitter={jest.fn()} niveau="CE1" />);
    const m = serie(2024, MANCHES, 'CE1')[0];
    m.choix.forEach((c) => expect(screen.getByRole('button', { name: ecrire(c) })).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: ecrire(m.heure) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});
