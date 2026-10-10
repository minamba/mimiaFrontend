/**
 * LES DESSINS DE L'ANALYSE AU LYCÉE — Camara, le 09/10/2026 : « rends-les plus
 * visuels selon le thème ». Intégrales, nuages, suites, limites, logarithme et
 * exponentielle : chaque `visuel` est une donnée valide que le dessinateur sait
 * tracer, chaque module en porte au moins un, et la même graine redonne
 * exactement la même partie, dessin compris.
 */
import { render } from '@testing-library/react';
import Visuel from '../components/jeux/Visuel';
import { erreursDuVisuel } from '../lib/jeux/visuels';
import * as primitives from '../lib/jeux/lycee/primitives-et-integrales';
import * as nuage from '../lib/jeux/lycee/ajuster-un-nuage';
import * as suites from '../lib/jeux/lycee/suites';
import * as limites from '../lib/jeux/lycee/limites-et-continuite';
import * as logarithme from '../lib/jeux/lycee/logarithme';
import * as exponentielle from '../lib/jeux/lycee/exponentielle';

const MODULES = [primitives, nuage, suites, limites, logarithme, exponentielle];
const GRAINES = Array.from({ length: 40 }, (_, i) => 1 + i * 104729);

describe.each(MODULES.map((m) => [m.FAMILLE.cle, m]))('%s', (_, m) => {
  it.each(m.CLASSES)('%s : chaque dessin est une donnée valide, et il y en a', (classe) => {
    let dessins = 0;
    GRAINES.forEach((g) => {
      m.serie(g, classe).forEach((manche) => {
        if (!manche.visuel) return;
        dessins += 1;
        expect([manche.consigne, erreursDuVisuel(manche.visuel)]).toEqual([manche.consigne, []]);
        // Rien que des données : pas une fonction, pas un NaN dans la fenêtre.
        expect(JSON.parse(JSON.stringify(manche.visuel))).toEqual(manche.visuel);
      });
    });
    expect(dessins).toBeGreaterThan(0);
  });

  it.each(m.CLASSES)('%s : la même graine redonne le même dessin', (classe) => {
    GRAINES.slice(0, 10).forEach((g) => {
      expect(m.serie(g, classe)).toEqual(m.serie(g, classe));
    });
  });

  it('chaque dessin se trace sans planter', () => {
    m.CLASSES.forEach((classe) => {
      GRAINES.slice(0, 5).forEach((g) => {
        m.serie(g, classe).filter((manche) => manche.visuel).forEach((manche) => {
          const { container, unmount } = render(<Visuel visuel={manche.visuel} />);
          expect(container.innerHTML).toContain('<svg');
          expect(container.innerHTML).not.toContain('NaN');
          unmount();
        });
      });
    });
  });
});
