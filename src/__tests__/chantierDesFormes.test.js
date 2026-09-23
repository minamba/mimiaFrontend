/**
 * LE CHANTIER DES FORMES — le cinquième jeu de Mimia, pour le CP.
 *
 * Trois choses se vérifient ici, dans cet ordre d'importance :
 *
 * 1. LE CONTENU EST JUSTE. Les carrés sont vraiment carrés, les rectangles
 *    vraiment allongés, et on ne pose jamais de carré quand on demande les
 *    rectangles — un carré en est un, et la question n'aurait plus de
 *    bonne réponse au CP.
 *
 * 2. LE JEU DEMANDE QUELQUE CHOSE. Les formes sortent du manuel au deuxième
 *    palier, les faux amis arrivent au troisième, et la couleur ne dit
 *    jamais la forme.
 *
 * 3. RIEN NE SE GAGNE SANS L'ANNONCER, la leçon des paquets de dix.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChantierDesFormes from '../components/jeux/ChantierDesFormes';
import {
  bilan, ESSAIS_AVANT_AIDE, MANCHES, message, modele, MODELES, niveauDe, serie, TAILLE_TAS, verdict,
} from '../lib/jeux/chantierDesFormes';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const sommets = (points) => points.split(' ').map((p) => p.split(',').map(Number));
const cotes = (points) => {
  const s = sommets(points);
  return s.map(([x, y], i) => {
    const [x2, y2] = s[(i + 1) % s.length];
    return Math.hypot(x2 - x, y2 - y);
  });
};

describe('les modèles de pièces', () => {
  it('les carrés ont quatre côtés égaux', () => {
    MODELES.filter((m) => m.famille === 'carre').forEach((m) => {
      const c = cotes(m.trace.points);
      expect(c).toHaveLength(4);
      c.forEach((longueur) => expect(longueur).toBeCloseTo(c[0], 5));
    });
  });

  /**
   * UN RECTANGLE PRESQUE CARRÉ SERAIT UNE QUESTION DE MESURE. Le CP ne mesure
   * pas encore les côtés : il doit voir d'un coup d'œil que c'est allongé.
   */
  it('les rectangles sont au moins 1,8 fois plus longs que larges', () => {
    MODELES.filter((m) => m.famille === 'rectangle').forEach((m) => {
      const [a, b] = cotes(m.trace.points);
      expect(Math.max(a, b) / Math.min(a, b)).toBeGreaterThanOrEqual(1.8);
    });
  });

  it('les triangles ont trois sommets', () => {
    MODELES.filter((m) => m.famille === 'triangle' && m.trace.type === 'polygone').forEach((m) => {
      expect(sommets(m.trace.points)).toHaveLength(3);
    });
  });

  it('chaque faux ami dit pourquoi il n’en est pas un', () => {
    MODELES.filter((m) => m.piege).forEach((m) => {
      expect(m.raison).toBeTruthy();
      expect(m.niveau).toBe(3);
    });
  });

  it('chaque forme a un faux ami qui l’imite', () => {
    ['carre', 'rectangle', 'triangle', 'cercle'].forEach((famille) => {
      expect(MODELES.some((m) => m.piege && m.imite === famille)).toBe(true);
    });
  });
});

describe('la série d’une partie', () => {
  const graines = Array.from({ length: 80 }, (_, i) => i + 1);

  it('donne huit manches de six pièces', () => {
    const liste = serie(1);
    expect(liste).toHaveLength(MANCHES);
    liste.forEach((m) => expect(m.pieces).toHaveLength(TAILLE_TAS));
  });

  it('demande deux ou trois pièces, jamais une', () => {
    graines.forEach((g) => serie(g).forEach(({ pieces }) => {
      const n = pieces.filter((p) => p.cible).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(3);
    }));
  });

  it('les pièces à trouver sont bien de la forme demandée, sans faux ami', () => {
    graines.forEach((g) => serie(g).forEach(({ famille, pieces }) => {
      pieces.filter((p) => p.cible).forEach((p) => {
        expect(modele(p.modele).famille).toBe(famille);
        expect(modele(p.modele).piege).toBeFalsy();
      });
    }));
  });

  it('aucun intrus n’est de la forme demandée', () => {
    graines.forEach((g) => serie(g).forEach(({ famille, pieces }) => {
      pieces.filter((p) => !p.cible).forEach((p) => {
        expect(modele(p.modele).famille).not.toBe(famille);
      });
    }));
  });

  /** LA RÈGLE QUI PROTÈGE LE CONTENU : voir la note de `serie`. */
  it('ne pose jamais de carré quand on demande les rectangles', () => {
    graines.forEach((g) => serie(g)
      .filter(({ famille }) => famille === 'rectangle')
      .forEach(({ pieces }) => {
        pieces.forEach((p) => {
          const m = modele(p.modele);
          expect(m.famille === 'carre' || m.imite === 'carre').toBe(false);
        });
      }));
  });

  /**
   * DEUX CARRÉS PARMI QUATRE RECTANGLES ne compareraient qu'une forme à une
   * autre : les intrus viennent d'au moins deux formes différentes.
   */
  it('les intrus viennent d’au moins deux formes différentes', () => {
    graines.forEach((g) => serie(g).forEach(({ pieces }) => {
      const familles = pieces
        .filter((p) => !p.cible && !modele(p.modele).piege)
        .map((p) => modele(p.modele).famille);
      expect(new Set(familles).size).toBeGreaterThanOrEqual(2);
    }));
  });

  /** SINON L'ENFANT TRIERAIT PAR COULEUR, sans regarder la forme. */
  it('six couleurs différentes dans chaque tas', () => {
    graines.forEach((g) => serie(g).forEach(({ pieces }) => {
      expect(new Set(pieces.map((p) => p.couleur)).size).toBe(TAILLE_TAS);
    }));
  });

  it('au deuxième palier, une pièce à trouver sort du manuel', () => {
    graines.forEach((g) => serie(g).forEach(({ famille, niveau, pieces }) => {
      if (niveau < 2 || famille === 'cercle') return;
      expect(pieces.some((p) => p.cible && modele(p.modele).niveau === 2)).toBe(true);
    }));
  });

  it('au premier palier, rien ne sort du manuel', () => {
    graines.forEach((g) => serie(g).forEach(({ niveau, pieces }) => {
      if (niveau !== 1) return;
      pieces.forEach((p) => expect(modele(p.modele).niveau).toBe(1));
    }));
  });

  it('au troisième palier, un faux ami se glisse dans le tas', () => {
    graines.forEach((g) => serie(g).forEach(({ famille, niveau, pieces }) => {
      if (niveau !== 3) return;
      expect(pieces.some((p) => modele(p.modele).imite === famille)).toBe(true);
    }));
  });

  it('les paliers se suivent : deux manches, trois manches, trois manches', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map(niveauDe)).toEqual([1, 1, 2, 2, 2, 3, 3, 3]);
  });

  it('ne demande jamais la même forme deux fois d’affilée', () => {
    graines.forEach((g) => {
      const liste = serie(g);
      for (let i = 1; i < liste.length; i += 1) {
        expect(liste[i].famille).not.toBe(liste[i - 1].famille);
      }
    });
  });

  it('la même graine redonne la même série', () => {
    expect(serie(7)).toEqual(serie(7));
    expect(serie(7)).not.toEqual(serie(8));
  });
});

describe('ce que vaut une annonce', () => {
  const pieces = [
    { id: 'a', modele: 'triangle', cible: true },
    { id: 'b', modele: 'triangle-renverse', cible: true },
    { id: 'c', modele: 'carre', cible: false },
    { id: 'd', modele: 'triangle-ouvert', cible: false },
  ];

  it('juste seulement avec toutes les pièces, et rien qu’elles', () => {
    expect(verdict(['a', 'b'], pieces).sens).toBe('juste');
    expect(verdict(['b', 'a'], pieces).sens).toBe('juste');
  });

  it('dit qu’il en manque, sans dire laquelle', () => {
    const r = verdict(['a'], pieces);
    expect(r.sens).toBe('manque');
    expect(r.erreurs).toEqual([]);
    expect(message(r, 'triangle', pieces)).toBe('Il en manque. Cherche encore.');
  });

  /** L'intrus passe avant l'oubli : voir la note de `verdict`. */
  it('un intrus choisi l’emporte sur une pièce oubliée, et il est désigné', () => {
    const r = verdict(['a', 'c'], pieces);
    expect(r.sens).toBe('intrus');
    expect(r.erreurs).toEqual(['c']);
    expect(message(r, 'triangle', pieces)).toBe('Celle-ci n’est pas un triangle.');
  });

  it('un faux ami choisi dit ce qui lui manque', () => {
    const r = verdict(['a', 'b', 'd'], pieces);
    expect(message(r, 'triangle', pieces)).toBe('Cette forme n’est pas fermée.');
  });

  it('plusieurs intrus se disent au pluriel', () => {
    const r = verdict(['c', 'd'], pieces);
    expect(message(r, 'triangle', pieces)).toBe('Celles-ci ne sont pas des triangles.');
  });

  it('le mot de la fin change avec le nombre de réussites', () => {
    expect(bilan(8)).toMatch(/Bravo/);
    expect(bilan(2)).toMatch(/recommence/);
  });
});

describe('le jeu à l’écran', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  const GRAINE = 2024;
  const premiere = () => serie(GRAINE)[0];
  const piece = (i) => screen.getByRole('button', { name: `Pièce ${i + 1}` });
  const annoncer = () => screen.getByRole('button', { name: /C’est prêt/ });

  const indices = (filtre) => premiere().pieces
    .map((p, i) => (filtre(p) ? i : -1))
    .filter((i) => i >= 0);

  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(GRAINE); });

  /**
   * LES PIÈCES NE SE NOMMENT PAS : un lecteur d'écran qui dirait « triangle
   * renversé » donnerait la réponse.
   */
  it('les pièces ne portent qu’un numéro, jamais leur forme', () => {
    render(<ChantierDesFormes onQuitter={jest.fn()} />);

    const noms = screen.getAllByRole('button', { name: /^Pièce \d$/ });
    expect(noms).toHaveLength(TAILLE_TAS);
  });

  it('ne propose d’annoncer qu’une fois une pièce choisie', async () => {
    render(<ChantierDesFormes onQuitter={jest.fn()} />);

    expect(screen.queryByRole('button', { name: /C’est prêt/ })).not.toBeInTheDocument();
    await userEvent.click(piece(0));
    expect(annoncer()).toBeInTheDocument();
  });

  it('rien ne se gagne sans l’annoncer, même avec les bonnes pièces choisies', async () => {
    render(<ChantierDesFormes onQuitter={jest.fn()} />);

    for (const i of indices((p) => p.cible)) await userEvent.click(piece(i));
    expect(screen.queryByRole('button', { name: 'Continuer' })).not.toBeInTheDocument();

    await userEvent.click(annoncer());
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('un intrus choisi est marqué, et le marquage s’efface quand on change', async () => {
    render(<ChantierDesFormes onQuitter={jest.fn()} />);

    const [intrus] = indices((p) => !p.cible);
    await userEvent.click(piece(intrus));
    await userEvent.click(annoncer());

    expect(piece(intrus)).toHaveClass('est-fautive');
    expect(screen.getByRole('status')).toBeInTheDocument();

    await userEvent.click(piece(intrus));
    expect(piece(intrus)).not.toHaveClass('est-fautive');
  });

  it('au bout de trois annonces fausses, les bonnes pièces sont montrées', async () => {
    render(<ChantierDesFormes onQuitter={jest.fn()} />);

    const [intrus] = indices((p) => !p.cible);
    for (let k = 0; k < ESSAIS_AVANT_AIDE; k += 1) {
      // Choisir, annoncer faux, puis désélectionner pour recommencer.
      await userEvent.click(piece(intrus));
      await userEvent.click(annoncer());
      if (k < ESSAIS_AVANT_AIDE - 1) await userEvent.click(piece(intrus));
    }

    indices((p) => p.cible).forEach((i) => expect(piece(i)).toHaveClass('est-montree'));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('on peut revenir aux jeux à tout moment', async () => {
    const onQuitter = jest.fn();
    render(<ChantierDesFormes onQuitter={onQuitter} />);

    await userEvent.click(screen.getByRole('button', { name: /Revenir aux jeux/ }));
    expect(onQuitter).toHaveBeenCalled();
  });
});

describe('le chantier dans la ludothèque', () => {
  it('est proposé au CP, et nulle part ailleurs', () => {
    expect(jeuxDeLaClasse('CP').map((j) => j.cle)).toContain('chantier-des-formes');
    expect(jeuxDeLaClasse('CE1').map((j) => j.cle)).not.toContain('chantier-des-formes');
  });

  /**
   * LE QUADRILLAGE N'EST PAS DÉCLARÉ : le jeu ne le travaille pas. Déclarer
   * une compétence qu'on ne travaille pas fausserait un jour les
   * recommandations faites à partir de ce catalogue.
   */
  it('déclare la seule compétence qu’il travaille', () => {
    const jeu = jeuxDeLaClasse('CP').find((j) => j.cle === 'chantier-des-formes');
    expect(jeu.competences).toEqual(['MATH_CP_GEO_FIGURES']);
  });
});
