/**
 * LES NEUF NOUVEAUX JEUX DU CE2 — Camara, le 21/09/2026. Le contenu d'abord :
 * chaque bonne réponse est juste, chaque piège est bien l'erreur annoncée,
 * trois choix différents. Puis chaque écran : un choix faux nomme l'erreur,
 * le bon fait continuer.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Bouteilles from '../components/jeux/Bouteilles';
import CombienDeTemps from '../components/jeux/CombienDeTemps';
import Diagramme from '../components/jeux/Diagramme';
import MetreRuban from '../components/jeux/MetreRuban';
import Miroir from '../components/jeux/Miroir';
import OuQuandComment from '../components/jeux/OuQuandComment';
import PartageBonbons from '../components/jeux/PartageBonbons';
import SujetEloigne from '../components/jeux/SujetEloigne';
import TourDuJardin from '../components/jeux/TourDuJardin';
import * as bouteilles from '../lib/jeux/bouteilles';
import * as duree from '../lib/jeux/combienDeTemps';
import * as diagramme from '../lib/jeux/diagramme';
import * as ruban from '../lib/jeux/metreRuban';
import * as miroir from '../lib/jeux/miroir';
import * as oqc from '../lib/jeux/ouQuandComment';
import * as partage from '../lib/jeux/partageBonbons';
import * as sujet from '../lib/jeux/sujetEloigne';
import * as jardin from '../lib/jeux/tourDuJardin';
import { jeuxDeLaClasse } from '../lib/jeux/catalogue';

const graines = Array.from({ length: 60 }, (_, i) => i + 1);

afterEach(() => { jest.restoreAllMocks(); });

/** Trois choix différents dont la bonne réponse, pour chaque manche de chaque graine. */
const troisChoix = (serie, bonne = (m) => m.bonne, cle = (c) => c) => {
  graines.forEach((g) => serie(g).forEach((m) => {
    const cles = m.choix.map(cle);
    expect(new Set(cles).size).toBe(3);
    expect(cles).toContain(cle(bonne(m)));
  }));
};

describe('le mètre ruban', () => {
  it('trois choix différents, et la bonne conversion', () => {
    troisChoix(ruban.serie);
    graines.forEach((g) => ruban.serie(g).filter((m) => m.sorte === 'vers-petite').forEach((m) => {
      expect(m.bonne % ruban.RELATIONS[m.relation].facteur).toBe(0);
    }));
  });

  it('les nombres collés sont le piège des longueurs composées', () => {
    graines.forEach((g) => ruban.serie(g).filter((m) => m.sorte === 'composee').forEach((m) => {
      expect(m.choix.some((c) => c > m.bonne * 5)).toBe(true);
    }));
    expect(ruban.ecrire(6000)).toBe('6 000');
  });
});

describe('le tour du jardin', () => {
  it('le périmètre est la somme des côtés, et les pièges ne le sont pas', () => {
    troisChoix(jardin.serie);
    expect(jardin.perimetre({ forme: 'rectangle', a: 5, b: 3 })).toBe(16);
    const m = { forme: 'rectangle', a: 5, b: 3, bonne: 16, oubli: 8, produit: 15 };
    expect(jardin.verdict(m, 8)).toBe('cotes-caches');
    expect(jardin.verdict(m, 15)).toBe('produit');
  });
});

describe('combien de temps ?', () => {
  it('la durée, et ses deux pièges', () => {
    troisChoix(duree.serie);
    const m = { debut: 9 * 60 + 40, fin: 10 * 60 + 15, bonne: 35, naif: 85, cent: 75 };
    expect(duree.verdict(m, 75)).toBe('cent');
    expect(duree.verdict(m, 85)).toBe('naif');
    expect(duree.etapes(m).map((e) => e.a - e.de)).toEqual([20, 15]);
    expect(duree.ecrireHeure(605)).toBe('10 h 05');
    expect(duree.ecrireDuree(75)).toBe('1 h 15 min');
  });
});

describe('les bouteilles', () => {
  it('trois choix différents ; à la comparaison, le piège a le plus grand nombre', () => {
    troisChoix(bouteilles.serie);
    graines.forEach((g) => bouteilles.serie(g).filter((m) => m.mode === 'comparer').forEach((m) => {
      const bon = m.recipients.find((r) => r.nom === m.bonne);
      const piege = m.recipients.find((r) => r.nom === m.piege);
      expect(bon.cl).toBeGreaterThan(piege.cl);
      expect(piege.cl).toBeGreaterThan(bon.cl % 100);
    }));
    expect(bouteilles.ecrire(120)).toBe('1 L 20 cL');
  });
});

describe('le miroir', () => {
  it('chaque figure est symétrique par rapport à son axe', () => {
    miroir.FIGURES.forEach((f) => {
      const reflet = f.points.map(([x, y]) => (f.axe === 'v' ? `${200 - x},${y}` : `${x},${160 - y}`));
      const points = new Set(f.points.map((p) => p.join(',')));
      reflet.forEach((p) => expect(points.has(p)).toBe(true));
    });
  });

  it('le coin droit du triangle est bien droit', () => {
    graines.forEach((g) => miroir.serie(g).filter((m) => m.mode === 'angle').forEach((m) => {
      const [p, a, b] = m.sommets.map((s) => s.point);
      const produit = (a[0] - p[0]) * (b[0] - p[0]) + (a[1] - p[1]) * (b[1] - p[1]);
      expect(Math.abs(produit)).toBe(0);
    }));
  });
});

describe('le diagramme', () => {
  it('trois choix différents, et au moins une barre entre deux traits', () => {
    troisChoix(diagramme.serie);
    graines.forEach((g) => diagramme.serie(g).forEach((m) => {
      expect(m.valeurs.some((v) => v % 2 === 1)).toBe(true);
    }));
    graines.forEach((g) => diagramme.serie(g).filter((m) => m.sorte === 'total').forEach((m) => {
      expect(m.bonne).toBe(m.valeurs.reduce((a, b) => a + b, 0));
    }));
  });
});

describe('le partage des bonbons', () => {
  it('le partage est juste, avec un reste dans trois manches', () => {
    troisChoix(partage.serie, (m) => ({ ...m.bonne, cle: `${m.bonne.q}-${m.bonne.r}` }), (c) => c.cle);
    graines.forEach((g) => {
      const l = partage.serie(g);
      l.forEach((m) => {
        expect(m.bonne.q * m.amis + m.bonne.r).toBe(m.bonbons);
        expect(m.bonne.r).toBeLessThan(m.amis);
      });
      expect(l.filter((m) => m.bonne.r > 0)).toHaveLength(3);
    });
    expect(partage.ecrire({ q: 3, r: 1 })).toBe('3 chacun, il en reste 1');
  });
});

describe('où, quand, comment ?', () => {
  it('trois phrases de chaque sorte', () => {
    graines.forEach((g) => {
      const l = oqc.serie(g);
      oqc.QUESTIONS.forEach((q) => expect(l.filter((p) => p.type === q.cle)).toHaveLength(3));
    });
  });
});

describe('le sujet qui s’éloigne', () => {
  it('le leurre du nom le plus proche est toujours là', () => {
    graines.forEach((g) => sujet.serie(g).forEach((p) => {
      expect(p.choix).toContain(p.proche);
      expect(p.avant.startsWith(p.sujet)).toBe(true);
    }));
    expect(sujet.verdict(sujet.PHRASES_JEU[0], 'joue')).toBe('proche');
  });
});

describe('les écrans du CE2', () => {
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  const cas = [
    ['le mètre ruban', MetreRuban, () => ruban.serie(2024)[0], (m) => `${ruban.ecrire(m.bonne)} ${m.unite}`, (m) => m.choix.filter((c) => c !== m.bonne).map((c) => `${ruban.ecrire(c)} ${m.unite}`)[0]],
    ['le tour du jardin', TourDuJardin, () => jardin.serie(2024)[0], (m) => `${m.bonne} m`, (m) => `${m.choix.find((c) => c !== m.bonne)} m`],
    ['combien de temps', CombienDeTemps, () => duree.serie(2024)[0], (m) => duree.ecrireDuree(m.bonne), (m) => duree.ecrireDuree(m.choix.find((c) => c !== m.bonne))],
    ['les bouteilles', Bouteilles, () => bouteilles.serie(2024)[0], (m) => `${m.bonne} ${m.unite}`, (m) => `${m.choix.find((c) => c !== m.bonne)} ${m.unite}`],
    ['le miroir', Miroir, () => miroir.serie(2024)[0], (m) => m.bonne, (m) => m.choix.find((c) => c !== m.bonne)],
    ['le diagramme', Diagramme, () => diagramme.serie(2024)[0], (m) => String(m.bonne), (m) => String(m.choix.find((c) => c !== m.bonne))],
    ['le partage', PartageBonbons, () => partage.serie(2024)[0], (m) => partage.ecrire(m.bonne), (m) => partage.ecrire(m.choix.find((c) => c.cle !== `${m.bonne.q}-${m.bonne.r}`))],
    ['où, quand, comment', OuQuandComment, () => oqc.serie(2024)[0], (p) => oqc.QUESTIONS.find((q) => q.cle === p.type).libelle, (p) => oqc.QUESTIONS.find((q) => q.cle !== p.type).libelle],
    ['le sujet qui s’éloigne', SujetEloigne, () => sujet.serie(2024)[0], (p) => p.bon, (p) => p.proche],
  ];

  it.each(cas)('%s : un choix faux nomme l’erreur, le bon fait continuer', async (_, Jeu, premiere, bon, faux) => {
    render(<Jeu onQuitter={jest.fn()} matiereCode="MATHS" />);
    const m = premiere();
    await userEvent.click(screen.getByRole('button', { name: faux(m) }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: bon(m) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('les neuf jeux sont dans la ludothèque du CE2, et seulement du CE2', () => {
    const cles = ['partage-des-bonbons', 'metre-ruban', 'tour-du-jardin', 'combien-de-temps', 'les-bouteilles',
      'le-miroir', 'le-diagramme', 'ou-quand-comment', 'sujet-qui-s-eloigne'];
    const ce2 = jeuxDeLaClasse('CE2').map((j) => j.cle);
    cles.forEach((c) => expect(ce2).toContain(c));
    const ce1 = jeuxDeLaClasse('CE1').map((j) => j.cle);
    cles.forEach((c) => expect(ce1).not.toContain(c));
  });
});
