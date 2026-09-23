/**
 * LA BALANCE — le septième jeu de Mimia, pour le CP.
 *
 * Ce qui se vérifie :
 *
 * 1. QUE LA TAILLE MENT, pour qu'on ne puisse réussir qu'en pesant : ranger
 *    les objets par leur taille donne toujours un rangement faux.
 *
 * 2. QUE LA BALANCE EST UN OUTIL, pas un affichage de la réponse — Camara,
 *    le 21/09/2026 : « il n'y a pas de réflexion, l'enfant voit celui qui
 *    tire vers le bas directement ». Au départ, elle est vide : c'est
 *    l'enfant qui choisit quoi peser.
 *
 * 3. QUE L'ERREUR NOMME UNE PAIRE, et qu'on ne gagne rien sans l'annoncer.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Balance from '../components/jeux/Balance';
import {
  avecArticle, bilan, BOITE_POIDS, estPiege, grammes, inclinaison, MANCHES, MANCHES_RANGER, objet,
  OBJETS, ordreJuste, PHRASES, PHRASES_CE1, plusLourdQue, resultatCE1, serie, verdictGrammes,
  verdictPeser, verdictRanger,
} from '../lib/jeux/balance';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 80 }, (_, i) => i + 1);

describe('les objets', () => {
  /** LE PIÈGE DU JEU : sans lui, la taille suffirait à ranger. */
  it('le plus gros est le plus léger, et le plus petit le plus lourd', () => {
    const parTaille = [...OBJETS].sort((a, b) => b.taille - a.taille);
    const parMasse = [...OBJETS].sort((a, b) => b.masse - a.masse);
    expect(parTaille[0].masse).toBe(1);
    expect(parTaille[parTaille.length - 1]).toBe(parMasse[0]);
  });

  it('les masses sont toutes différentes, et tiennent sur un plateau', () => {
    expect(new Set(OBJETS.map((o) => o.masse)).size).toBe(OBJETS.length);
    OBJETS.forEach((o) => expect(o.masse).toBeLessThanOrEqual(8));
  });

  it('un cube d’écart se voit, dix ne renversent pas le dessin', () => {
    expect(inclinaison(3, 3)).toBe(0);
    expect(inclinaison(3, 4)).toBe(5);
    expect(inclinaison(0, 10)).toBe(14);
  });
});

describe('la série d’une partie', () => {
  it('quatre manches à ranger, puis quatre à mesurer', () => {
    const l = serie(1);
    expect(l).toHaveLength(MANCHES);
    l.forEach((m, i) => expect(m.mode).toBe(i < MANCHES_RANGER ? 'ranger' : 'peser'));
  });

  /** On ne peut pas ranger juste en regardant les tailles. */
  it('à chaque rangement, ranger par la taille serait faux', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'ranger').forEach((m) => {
      expect(m.table).toHaveLength(3);
      const parTaille = [...m.table].sort((a, b) => objet(a).taille - objet(b).taille);
      expect(verdictRanger(parTaille).sens).toBe('inverse');
    }));
  });

  it('chaque rangement contient au moins un piège, et la table n’est jamais déjà rangée', () => {
    graines.forEach((g) => serie(g).filter((m) => m.mode === 'ranger').forEach(({ table }) => {
      const [a, b, c] = table.map(objet);
      expect(estPiege(a, b) || estPiege(a, c) || estPiege(b, c)).toBe(true);
      expect(table).not.toEqual(ordreJuste(table));
    }));
  });

  it('on ne mesure jamais un objet d’un seul cube, ni le même deux fois de suite', () => {
    graines.forEach((g) => {
      const l = serie(g).filter((m) => m.mode === 'peser');
      l.forEach((m) => expect(objet(m.objet).masse).toBeGreaterThanOrEqual(2));
      l.slice(1).forEach((m, i) => expect(m.objet).not.toBe(l[i].objet));
    });
  });

  it('la même graine redonne la même série', () => {
    expect(serie(7)).toEqual(serie(7));
  });
});

describe('l’erreur nomme une paire', () => {
  it('un rangement juste va du plus léger au plus lourd', () => {
    expect(verdictRanger(['ballon', 'pomme', 'caillou']).sens).toBe('juste');
  });

  it('la première paire dans le mauvais ordre est désignée', () => {
    expect(verdictRanger(['caillou', 'ballon', 'pomme'])).toEqual({ sens: 'inverse', lourd: 'caillou', leger: 'ballon' });
    expect(verdictRanger(['ballon', 'caillou', 'pomme'])).toEqual({ sens: 'inverse', lourd: 'caillou', leger: 'pomme' });
  });

  it('la phrase s’accorde avec l’objet', () => {
    expect(plusLourdQue('pomme', 'ballon')).toBe('La pomme est plus lourde que le ballon.');
    expect(plusLourdQue('livre', 'pomme')).toBe('Le livre est plus lourd que la pomme.');
  });

  it('au mesurage : juste, trop ou pas assez', () => {
    expect(verdictPeser(3, 'pomme')).toBe('juste');
    expect(verdictPeser(5, 'pomme')).toBe('trop');
    expect(verdictPeser(1, 'pomme')).toBe('manque');
  });

  it('le mot de la fin est celui des autres jeux', () => {
    expect(bilan(8)).toMatch(/Bravo/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  const bouton = (cle) => screen.getByRole('button', { name: avecArticle(objet(cle)) });

  const ranger = async (ordre) => {
    for (const cle of ordre) await userEvent.click(bouton(cle));
  };

  it('au départ, la balance est vide : c’est l’enfant qui choisit quoi peser', () => {
    render(<Balance onQuitter={jest.fn()} />);
    expect(screen.getByRole('img', { name: /rien à gauche, rien à droite/ })).toBeInTheDocument();
  });

  it('peser deux objets les pose sur la balance, un troisième est refusé', async () => {
    render(<Balance onQuitter={jest.fn()} />);
    const [a, b, c] = serie(GRAINE)[0].table;

    await userEvent.click(bouton(a));
    await userEvent.click(bouton(b));
    expect(screen.getByRole('img', { name: new RegExp(`${objet(a).nom} à gauche, ${objet(b).nom} à droite`) })).toBeInTheDocument();

    await userEvent.click(bouton(c));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.plein);

    await userEvent.click(screen.getByRole('button', { name: `Reprendre ${avecArticle(objet(a))}` }));
    expect(screen.getByRole('img', { name: /rien à gauche/ })).toBeInTheDocument();
  });

  it('un rangement faux nomme une paire ; le bon, annoncé, fait continuer', async () => {
    render(<Balance onQuitter={jest.fn()} />);
    const { table } = serie(GRAINE)[0];
    const bon = ordreJuste(table);

    await userEvent.click(screen.getByRole('button', { name: /J’ai pesé, je range/ }));
    await ranger([...bon].reverse());
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(/est plus lourde? que/);

    // On vide les cases, et on range juste.
    for (let i = 0; i < 3; i += 1) {
      await userEvent.click(screen.getAllByRole('button', { name: /la reprendre/ })[0]);
    }
    await ranger(bon);
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('au mesurage, rien ne se gagne sans l’annoncer', async () => {
    render(<Balance onQuitter={jest.fn()} />);
    const s = serie(GRAINE);
    for (let i = 0; i < MANCHES_RANGER; i += 1) {
      await userEvent.click(screen.getByRole('button', { name: /J’ai pesé, je range/ }));
      await ranger(ordreJuste(s[i].table));
      await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    }
    const { masse } = objet(s[MANCHES_RANGER].objet);

    await userEvent.click(screen.getByRole('button', { name: 'Poser un cube' }));
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES.manque);

    for (let i = 1; i < masse; i += 1) await userEvent.click(screen.getByRole('button', { name: 'Poser un cube' }));
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('au CE1, on mesure avec la boîte de poids, et rien ne se gagne sans l’annoncer', async () => {
    render(<Balance onQuitter={jest.fn()} niveau="CE1" />);
    const s = serie(GRAINE);
    for (let i = 0; i < MANCHES_RANGER; i += 1) {
      await userEvent.click(screen.getByRole('button', { name: /J’ai pesé, je range/ }));
      await ranger(ordreJuste(s[i].table));
      await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    }
    const cle = s[MANCHES_RANGER].objet;
    expect(screen.queryByRole('button', { name: 'Poser un cube' })).not.toBeInTheDocument();

    // Un poids de 100 g : jamais assez, l'objet le plus léger à mesurer pèse 200 g.
    await userEvent.click(screen.getAllByRole('button', { name: 'Poser 100 grammes' })[0]);
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES_CE1.manque);

    // On range le 100 g, puis on pose la bonne combinaison.
    await userEvent.click(screen.getByRole('button', { name: 'Reprendre 100 grammes' }));
    for (const g of combinaison(grammes(cle))) {
      await userEvent.click(screen.getAllByRole('button', { name: `Poser ${g} grammes` })[0]);
    }
    await userEvent.click(screen.getByRole('button', { name: /C’est prêt/ }));
    expect(screen.getByText(resultatCE1(cle))).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<Balance onQuitter={onQuitter} />);
    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('la balance dans la ludothèque', () => {
  it('est proposée au CP, avec la seule compétence qu’elle travaille', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'balance');
    expect(jeu.competences).toEqual(['MATH_CP_MES_MASSE']);
    expect(jeuxDeLaClasse('CE1').find((j) => j.cle === 'balance').competences).toEqual(['MATH_CE1_MES_MASSE']);
    expect(jeuxDeLaClasse('CM1').map((j) => j.cle)).not.toContain('balance');
  });
});

/** Une combinaison de la boîte qui fait ce poids — la plus courte, en commençant par les gros. */
function combinaison(cible) {
  const restants = [...BOITE_POIDS];
  const pris = [];
  let reste = cible;
  restants.forEach((g) => {
    if (g <= reste) { pris.push(g); reste -= g; }
  });
  return reste === 0 ? pris : null;
}

/**
 * LA BALANCE DU CE1 : des grammes, et une boîte de poids limitée. Chaque objet
 * à mesurer doit pouvoir s'équilibrer avec la boîte, et jamais en ne posant
 * que des 100 g.
 */
describe('la balance du CE1', () => {
  it('cent grammes par cube : l’ordre des masses ne change pas', () => {
    OBJETS.forEach((o) => expect(grammes(o.cle)).toBe(o.masse * 100));
  });

  it('chaque objet à mesurer s’équilibre avec la boîte de poids', () => {
    OBJETS.filter((o) => o.masse >= 2).forEach((o) => {
      const c = combinaison(grammes(o.cle));
      expect(c).not.toBeNull();
      expect(verdictGrammes(c, o.cle)).toBe('juste');
    });
  });

  it('la boîte n’a que deux poids de 100 g : 600 g oblige à prendre le 500 g', () => {
    expect(BOITE_POIDS.filter((g) => g === 100)).toHaveLength(2);
    expect(combinaison(600)).toContain(500);
  });

  it('trop et pas assez se nomment', () => {
    expect(verdictGrammes([100], 'pomme')).toBe('manque');
    expect(verdictGrammes([500], 'pomme')).toBe('trop');
    expect(resultatCE1('pomme')).toBe('La pomme pèse 300 grammes.');
  });
});
