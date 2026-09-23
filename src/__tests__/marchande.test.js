/**
 * LA MARCHANDE — le deuxième jeu de Mimia, pour le CP.
 *
 * On vérifie d'abord ce qui rend le jeu utile, comme pour la boîte de 10 :
 * qu'on puisse se tromper, que l'erreur dise dans quel sens, et que ce qu'on
 * demande à l'enfant reste dans ce que le CP sait faire.
 *
 * ET UNE CHOSE PROPRE À CE JEU : les prix viennent du décor. Les ardoises du
 * stand annoncent pommes 2 €, bananes 1 €, tomates 3 €, carottes 1 €, peintes
 * dans l'image. Si le code s'en écarte, le jeu contredit son propre dessin —
 * l'enfant lit « 2 € » sur l'ardoise et on lui en réclame cinq.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Marchande from '../components/jeux/Marchande';
import {
  bilan, billetPour, commande, commandeCE1, consigneCE1, MANCHES, MONNAIE, PHRASES_CE1,
  prix, PRODUITS, serie, serieCE1, somme, verdict,
} from '../lib/jeux/marchande';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

describe('les prix viennent du décor', () => {
  it('ce sont exactement les quatre ardoises du stand', () => {
    expect(PRODUITS.map((p) => [p.nom, p.prix])).toEqual([
      ['banane', 1], ['carotte', 1], ['pomme', 2], ['tomate', 3],
    ]);
  });

  /**
   * AUCUN CENTIME, ET C'EST LE PROGRAMME QUI LE DIT : lire un prix à virgule
   * est une compétence de CE2. Au CP, on paie en euros entiers.
   */
  it('aucun prix n’a de centimes', () => {
    PRODUITS.forEach((p) => expect(Number.isInteger(p.prix)).toBe(true));
  });

  it('la bourse porte des pièces ET un billet, comme le dit le programme', () => {
    expect(MONNAIE.map((m) => m.valeur)).toEqual([1, 2, 5]);
    expect(MONNAIE.some((m) => m.genre === 'billet')).toBe(true);
  });
});

describe('la série d’une partie', () => {
  it('donne huit manches', () => {
    expect(serie(1)).toHaveLength(MANCHES);
  });

  /**
   * ON COMMENCE PAR UN SEUL PRODUIT : une pièce suffit, et l'enfant comprend
   * le geste avant qu'on lui demande de compter.
   */
  it('les deux premières manches ne demandent qu’un produit', () => {
    for (let graine = 1; graine <= 30; graine += 1) {
      const [un, deux] = serie(graine);
      expect(un.achats).toHaveLength(1);
      expect(deux.achats).toHaveLength(1);
    }
  });

  /**
   * DEUX PRODUITS DIFFÉRENTS ENSUITE. « Une pomme et une pomme » se dit
   * « deux pommes » et deviendrait une multiplication — ce n'est pas ce qu'on
   * travaille ici.
   */
  it('ne demande jamais deux fois le même produit dans une commande', () => {
    for (let graine = 1; graine <= 30; graine += 1) {
      serie(graine).forEach(({ achats }) => {
        expect(new Set(achats.map((p) => p.cle)).size).toBe(achats.length);
      });
    }
  });

  it('ne répète jamais le même total d’une manche à la suivante', () => {
    for (let graine = 1; graine <= 60; graine += 1) {
      const liste = serie(graine);
      for (let i = 1; i < liste.length; i += 1) {
        expect(liste[i].total).not.toBe(liste[i - 1].total);
      }
    }
  });

  // Le total doit rester payable avec la bourse, et dans ce qu'un CP manipule.
  it('les totaux restent entre 1 et 6 euros', () => {
    for (let graine = 1; graine <= 40; graine += 1) {
      serie(graine).forEach(({ achats, total }) => {
        expect(total).toBe(achats.reduce((s, p) => s + p.prix, 0));
        expect(total).toBeGreaterThanOrEqual(1);
        expect(total).toBeLessThanOrEqual(6);
      });
    }
  });

  it('la même graine redonne la même série', () => {
    expect(serie(7)).toEqual(serie(7));
    expect(serie(7)).not.toEqual(serie(8));
  });
});

describe('le paiement', () => {
  it('additionne ce qui est posé', () => {
    expect(somme([])).toBe(0);
    expect(somme([1, 2, 2])).toBe(5);
  });

  /**
   * L'ERREUR DIT DANS QUEL SENS, jamais seulement « raté » : c'est ce qui
   * permet de corriger. Même leçon que la boîte de 10.
   */
  it('dit s’il manque ou si c’est trop', () => {
    expect(verdict([1, 2], 3)).toBe('juste');
    expect(verdict([5], 3)).toBe('trop');
    expect(verdict([1], 3)).toBe('pas-assez');
  });

  // Plusieurs chemins mènent à la même somme : c'est voulu, et c'est ce que
  // le billet de 5 € apporte.
  it('accepte tous les chemins vers la bonne somme', () => {
    expect(verdict([5], 5)).toBe('juste');
    expect(verdict([2, 2, 1], 5)).toBe('juste');
    expect(verdict([1, 1, 1, 1, 1], 5)).toBe('juste');
  });

  /**
   * LA COMMANDE EST ÉCRITE POUR ÊTRE DITE : un CP ne la lit pas, mais elle
   * part aux lecteurs d'écran et servira de consigne parlée.
   */
  it('se dit en toutes lettres', () => {
    expect(commande([PRODUITS[2]])).toBe('une pomme');
    expect(commande([PRODUITS[2], PRODUITS[0]])).toBe('une pomme et une banane');
  });

  it('le mot de la fin change avec le nombre de réussites', () => {
    expect(bilan(8)).toMatch(/Bravo/);
    expect(bilan(2)).toMatch(/recommence/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const poser = (valeur) => screen.getByRole('button', {
    name: new RegExp(`^Poser ${valeur} euros?$`),
  });

  it('montre la commande avec le prix de chaque produit, jamais le total', () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = serie(2024);

    render(<Marchande onQuitter={jest.fn()} />);

    premiere.achats.forEach((p) => {
      expect(screen.getAllByText(`${p.prix} €`).length).toBeGreaterThan(0);
    });

    // Le total n'est écrit nulle part tant que ce n'est pas payé : le
    // calculer est le jeu.
    expect(screen.queryByText(new RegExp(`= ${premiere.total} €`))).not.toBeInTheDocument();
  });

  it('payer la somme exacte remercie et permet de continuer', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const [premiere] = serie(2024);

    render(<Marchande onQuitter={jest.fn()} />);

    for (let i = 0; i < premiere.total; i += 1) {
      await userEvent.click(poser(1));
    }

    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  /**
   * TROP PAYER N'EST PAS UNE PUNITION : on le dit, et l'enfant reprend sa
   * pièce. Interdire le retour en arrière transformerait une erreur de
   * comptage en échec définitif.
   */
  it('trop payer se dit, et la pièce se reprend', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);

    render(<Marchande onQuitter={jest.fn()} />);

    await userEvent.click(poser(5));
    await userEvent.click(poser(5));

    expect(screen.getByRole('status')).toHaveTextContent('C’est trop !');

    const reprises = screen.getAllByRole('button', { name: /^Reprendre 5 euros$/ });
    await userEvent.click(reprises[0]);

    expect(screen.getAllByRole('button', { name: /^Reprendre 5 euros$/ })).toHaveLength(1);
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<Marchande onQuitter={onQuitter} />);

    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('la marchande dans la ludothèque', () => {
  it('est proposée au CP et au CE1, et nulle part ailleurs', () => {
    expect(jeuxDeLaClasse('CP').map((j) => j.cle)).toContain('marchande');
    expect(jeuxDeLaClasse('CE1').find((j) => j.cle === 'marchande').competences)
      .toEqual(['MATH_CE1_MES_MONNAIE']);
    expect(jeuxDeLaClasse('CM1').map((j) => j.cle)).not.toContain('marchande');
  });

  it('déclare les compétences du référentiel qu’elle travaille', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'marchande');

    expect(jeu.competences).toEqual(['MATH_CP_MES_MONNAIE', 'MATH_CP_PROB_UNE_ETAPE']);
  });
});

/**
 * LA CAISSE DU CE1 : calculer un prix, puis rendre la monnaie. Les prix restent
 * ceux des ardoises ; il y a toujours quelque chose à rendre ; et rien ne se
 * gagne sans l'annoncer.
 */
describe('la caisse du CE1', () => {
  const graines = Array.from({ length: 80 }, (_, i) => i + 1);

  it('deux manches d’un seul produit, puis deux produits différents dont un pris deux fois', () => {
    graines.forEach((g) => serieCE1(g).forEach((m, i) => {
      if (i < 2) {
        expect(m.lignes).toHaveLength(1);
        expect([2, 3]).toContain(m.lignes[0].quantite);
      } else {
        expect(m.lignes).toHaveLength(2);
        expect(m.lignes[0].produit.cle).not.toBe(m.lignes[1].produit.cle);
        expect(Math.max(...m.lignes.map((l) => l.quantite))).toBe(2);
      }
    }));
  });

  it('le client tend le plus petit billet qui dépasse le prix : il y a toujours à rendre', () => {
    graines.forEach((g) => serieCE1(g).forEach((m) => {
      expect(m.total).toBe(prix(m.lignes));
      expect(m.billet).toBeGreaterThan(m.total);
      expect([5, 10, 20].filter((b) => b > m.total)[0]).toBe(m.billet);
      expect(m.rendu).toBe(m.billet - m.total);
      expect(m.rendu).toBeGreaterThan(0);
      expect(m.rendu).toBeLessThanOrEqual(10);
    }));
  });

  it('jamais deux fois le même prix d’affilée', () => {
    graines.forEach((g) => {
      const l = serieCE1(g);
      for (let i = 1; i < l.length; i += 1) expect(l[i].total).not.toBe(l[i - 1].total);
    });
  });

  it('la commande se dit en toutes lettres, accordée', () => {
    const [pomme, tomate] = [PRODUITS.find((x) => x.cle === 'pomme'), PRODUITS.find((x) => x.cle === 'tomate')];
    const lignes = [{ produit: pomme, quantite: 2 }, { produit: tomate, quantite: 1 }];
    expect(commandeCE1(lignes)).toBe('deux pommes et une tomate');
    expect(prix(lignes)).toBe(7);
    expect(billetPour(7)).toBe(10);
    expect(consigneCE1(lignes)).toBe('Je voudrais deux pommes et une tomate. Voici un billet de 10 euros.');
  });

  it('à l’écran : rendre trop est nommé, et la bonne monnaie annoncée fait continuer', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    render(<Marchande onQuitter={jest.fn()} niveau="CE1" />);
    const m = serieCE1(2024)[0];

    // Trop : la monnaie juste plus un euro, rendue euro par euro.
    for (let i = 0; i <= m.rendu; i += 1) {
      await userEvent.click(screen.getByRole('button', { name: 'Rendre 1 euro' }));
    }
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /C’est rendu/ }));
    expect(screen.getByRole('status')).toHaveTextContent(PHRASES_CE1.trop);

    await userEvent.click(screen.getAllByRole('button', { name: 'Reprendre 1 euro' })[0]);
    await userEvent.click(screen.getByRole('button', { name: /C’est rendu/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});
