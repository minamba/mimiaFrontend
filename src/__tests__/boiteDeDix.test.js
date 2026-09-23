/**
 * LA BOÎTE DE 10 — le premier jeu de Mimia, pour le CP.
 *
 * CE FICHIER EXISTE PARCE QUE SA PREMIÈRE VERSION A PASSÉ TOUS SES TESTS EN
 * N'ENSEIGNANT RIEN. Camara, le 21/09/2026 : « il est impossible de se
 * tromper ». L'enfant bouchait les trous d'une boîte qui en comptait dix —
 * remplir ÉTAIT la réponse. Mes tests vérifiaient que la mécanique
 * fonctionnait, jamais qu'elle demandait quelque chose.
 *
 * On vérifie donc d'abord ce qui rend le jeu utile : qu'on PUISSE se tromper,
 * que l'erreur dise dans quel sens, et que les mauvaises réponses soient assez
 * proches pour qu'on ne les écarte pas d'un coup d'œil.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BoiteDeDix from '../components/jeux/BoiteDeDix';
import {
  ALVEOLES, alveoles, bilan, gagnee, MANCHES, PREMIERE_MASQUEE,
  PROPOSITIONS, propositions, serie, verdict,
} from '../lib/jeux/boiteDeDix';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const tirage = () => { let n = 0; return () => { n += 0.37; return n % 1; }; };

describe('on peut se tromper — ce que la première version ne permettait pas', () => {
  it('chaque manche propose quatre paniers, dont un seul est juste', () => {
    serie(11).forEach(({ depart, manque, choix }) => {
      expect(choix).toHaveLength(PROPOSITIONS);
      expect(choix).toContain(manque);
      expect(choix.filter((v) => gagnee(depart, v))).toHaveLength(1);
    });
  });

  /**
   * DES VOISINES, PAS DU HASARD. Proposer 4, 1, 8 et 9 pour un complément de
   * 4 se devine sans compter : les trois autres sont grossièrement fausses.
   */
  it('les mauvaises réponses sont proches de la bonne', () => {
    for (let graine = 1; graine <= 30; graine += 1) {
      serie(graine).forEach(({ manque, choix }) => {
        choix.forEach((valeur) => {
          expect(Math.abs(valeur - manque)).toBeLessThanOrEqual(PROPOSITIONS - 1);
        });
      });
    }
  });

  it('jamais deux fois le même panier, et toujours entre 1 et 9', () => {
    [1, 4, 5, 9].forEach((manque) => {
      const choix = propositions(manque, tirage());

      expect(new Set(choix).size).toBe(PROPOSITIONS);
      choix.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(9);
      });
    });
  });

  /**
   * L'ERREUR DIT DANS QUEL SENS. « Trop » et « pas assez » sont deux
   * informations différentes, et ce sont elles qui permettent de corriger.
   * « Raté » n'apprendrait rien.
   */
  it('l’erreur dit trop ou pas assez, jamais seulement « raté »', () => {
    expect(verdict(6, 4)).toBe('juste');
    expect(verdict(6, 5)).toBe('trop');
    expect(verdict(6, 2)).toBe('pas-assez');
  });
});

describe('la série d’une partie', () => {
  it('donne huit manches — deux à quatre minutes, l’attention d’un CP', () => {
    expect(serie(1)).toHaveLength(MANCHES);
  });

  it('chaque manche se complète bien jusqu’à dix', () => {
    serie(42).forEach(({ depart, manque }) => {
      expect(depart + manque).toBe(ALVEOLES);
      expect(depart).toBeGreaterThanOrEqual(1);
      expect(depart).toBeLessThanOrEqual(9);
    });
  });

  /**
   * ON COMMENCE FACILE : un enfant qui rate sa première manche referme le jeu.
   */
  it('les deux premières manches sont les plus faciles', () => {
    for (let graine = 1; graine <= 40; graine += 1) {
      const [un, deux] = serie(graine);
      expect(un.manque).toBeLessThanOrEqual(5);
      expect(deux.manque).toBeLessThanOrEqual(5);
    }
  });

  it('ne répète jamais le même départ d’une manche à la suivante', () => {
    for (let graine = 1; graine <= 60; graine += 1) {
      const liste = serie(graine);
      for (let i = 1; i < liste.length; i += 1) {
        expect(liste[i].depart).not.toBe(liste[i - 1].depart);
      }
    }
  });

  /**
   * LA BOÎTE SE FERME À MI-PARCOURS : on ne compte plus les alvéoles vides, on
   * se souvient. C'est le passage du comptage au fait mémorisé, l'enjeu de
   * l'année de CP.
   */
  it('la boîte s’ouvre au début et se ferme ensuite', () => {
    const liste = serie(3);

    expect(liste.slice(0, PREMIERE_MASQUEE).every((m) => !m.masquee)).toBe(true);
    expect(liste.slice(PREMIERE_MASQUEE).every((m) => m.masquee)).toBe(true);
  });

  it('la même graine redonne la même série', () => {
    expect(serie(7)).toEqual(serie(7));
    expect(serie(7)).not.toEqual(serie(8));
  });
});

describe('la boîte', () => {
  it('remplit de gauche à droite, le départ puis l’enfant', () => {
    expect(alveoles(3, 2)).toEqual([
      'depart', 'depart', 'depart', 'pose', 'pose',
      'vide', 'vide', 'vide', 'vide', 'vide',
    ]);
  });

  // Fermée, elle cache les alvéoles VIDES et elles seules : sans les œufs
  // déjà là, il n'y aurait plus de question du tout.
  it('fermée, elle couvre les alvéoles vides mais montre les œufs', () => {
    expect(alveoles(3, 0, true)).toEqual([
      'depart', 'depart', 'depart',
      'masque', 'masque', 'masque', 'masque', 'masque', 'masque', 'masque',
    ]);
  });

  it('le mot de la fin change avec le nombre de réussites', () => {
    expect(bilan(8)).toMatch(/Bravo/);
    expect(bilan(7)).toMatch(/Presque/);
    expect(bilan(2)).toMatch(/recommence/);
  });
});

describe('le jeu à l’écran', () => {
  // La graine est fixée dans plusieurs cas : on la rend après chacun, sinon
  // le hasard resterait figé pour tout le fichier.
  afterEach(() => { jest.restoreAllMocks(); });

  const paniers = () => screen.getAllByRole('button', { name: /Panier de/ });

  const panierDe = (n) => screen.getByRole('button', {
    name: new RegExp(`^Panier de ${n} œufs?$`),
  });

  it('affiche la boîte à œufs et quatre paniers à choisir', () => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
    const [premiere] = serie(12345);

    render(<BoiteDeDix onQuitter={jest.fn()} />);

    // La boîte s'annonce avec ce qu'elle contient : c'est la seule chose de
    // cet écran qu'un enfant qui ne lit pas encore puisse « entendre ».
    expect(screen.getByRole('img', {
      name: new RegExp(`Boîte de dix, ${premiere.depart} œufs`),
    })).toBeInTheDocument();

    expect(paniers()).toHaveLength(PROPOSITIONS);
  });

  /**
   * LE CŒUR DU JEU : un panier trop petit ne gagne pas, et il dit pourquoi.
   *
   * LA GRAINE EST FIXÉE pour que la manche soit connue d'avance — sinon on ne
   * saurait pas quel panier est faux, et le test devrait deviner.
   */
  it('un panier trop petit laisse la boîte incomplète et le dit', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
    const [premiere] = serie(12345);
    const tropPetit = premiere.choix.find((v) => v < premiere.manque);

    render(<BoiteDeDix onQuitter={jest.fn()} />);
    await userEvent.click(panierDe(tropPetit));

    expect(screen.getByRole('status')).toHaveTextContent('Il en manque encore.');
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();
  });

  it('un panier trop grand déborde, et le dit aussi', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
    const [premiere] = serie(12345);
    const tropGrand = premiere.choix.find((v) => v > premiere.manque);

    render(<BoiteDeDix onQuitter={jest.fn()} />);
    await userEvent.click(panierDe(tropGrand));

    expect(screen.getByRole('status')).toHaveTextContent('Il y en a trop !');
  });

  it('le bon panier affiche l’addition et permet de continuer', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(12345);
    const [premiere] = serie(12345);

    render(<BoiteDeDix onQuitter={jest.fn()} />);
    await userEvent.click(panierDe(premiere.manque));

    expect(screen.getByText(`${premiere.depart} + ${premiere.manque} = 10`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<BoiteDeDix onQuitter={onQuitter} />);

    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

/**
 * UN CM2 NE DOIT JAMAIS VOIR UN JEU DE CP. Se voir proposer « pour les
 * petits » fait refermer la page pour de bon.
 */
describe('la ludothèque est construite pour la classe', () => {
  it('la boîte de 10 n’est proposée qu’au CP', () => {
    expect(jeuxDeLaClasse('CP').map((j) => j.cle)).toContain('boite-de-dix');
    // Le CM2 a ses jeux depuis le 21/09/2026 ; le collège, pas encore.
    expect(jeuxDeLaClasse('6E')).toHaveLength(0);
    expect(jeuxDeLaClasse('TERMINALE')).toHaveLength(0);
  });

  it('une classe inconnue ne montre rien plutôt que tout', () => {
    expect(jeuxDeLaClasse(null)).toHaveLength(0);
    expect(jeuxDeLaClasse('')).toHaveLength(0);
    expect(jeuxDeLaClasse('CM3')).toHaveLength(0);
  });

  it('chaque jeu déclare les compétences du référentiel qu’il travaille', () => {
    jeuxDeLaClasse('CP').forEach((jeu) => {
      expect(jeu.competences.length).toBeGreaterThan(0);
      jeu.competences.forEach((code) => expect(code).toMatch(/^[A-Z]+_[A-Z0-9]+_/));
    });
  });
});
