/**
 * LES SCÈNES DU GROUPE « college-maths-b » (09/10/2026) — voir
 * `components/jeux/scenes/groupes/college-maths-b.js`.
 *
 * Pour chaque jeu, chaque classe, vingt-cinq parties : la question se dessine
 * avant et après la réponse sans planter, son texte entier reste à l'écran,
 * et, si le jeu joue ses réponses à sa façon, chacune est un bouton à son
 * libellé qui appelle `choisir(cle)`.
 */
import { fireEvent, render, within } from '@testing-library/react';
import SCENES from '../components/jeux/scenes/groupes/college-maths-b';
import * as solides from '../lib/jeux/college/solides-et-patrons';
import * as diagramme from '../lib/jeux/college/diagramme-college';
import * as robot from '../lib/jeux/college/robot-college';
import * as droite from '../lib/jeux/college/droite-des-relatifs';
import * as ascenseur from '../lib/jeux/college/ascenseur-des-relatifs';
import * as machineX from '../lib/jeux/college/machine-a-x';
import * as machineF from '../lib/jeux/college/machine-a-fonctions';
import * as tour from '../lib/jeux/college/tour-des-puissances';
import * as angles from '../lib/jeux/college/chasseur-d-angles';
import * as navale from '../lib/jeux/college/bataille-navale';
import * as billes from '../lib/jeux/college/sac-de-billes-college';
import * as balance from '../lib/jeux/college/balance-des-equations';
import * as echelle from '../lib/jeux/college/echelle-contre-le-mur';
import * as photo from '../lib/jeux/college/photo-agrandie';
import * as toboggan from '../lib/jeux/college/pente-du-toboggan';
import * as racine from '../lib/jeux/college/racine-cachee';
import * as globe from '../lib/jeux/college/le-globe';

const MODULES = [
  solides, diagramme, robot, droite, ascenseur, machineX, machineF, tour, angles,
  navale, billes, balance, echelle, photo, toboggan, racine, globe,
];

const GRAINES = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);
const net = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

it('le registre couvre les dix-sept jeux du groupe, et eux seuls', () => {
  expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((m) => m.FAMILLE.cle).sort());
});

it('chaque forme de réponse est préfixée par la clé de son jeu', () => {
  const formes = Object.entries(SCENES).filter(([, scene]) => scene.objets);
  formes.forEach(([cle, scene]) => expect(scene.objets).toBe(`sc-${cle}`));
});

describe.each(MODULES.filter((m) => SCENES[m.FAMILLE.cle]).map((m) => [m.FAMILLE.cle, m]))('%s', (cle, module) => {
  const scene = SCENES[cle];

  it.each(module.CLASSES)('en %s : chaque manche se dessine, avant et après la réponse', (classe) => {
    GRAINES.forEach((graine) => {
      module.serie(graine, classe).forEach((m) => {
        [[false, {}], [true, { trouve: true }], [true, { montrer: true }]].forEach(([termine, extra]) => {
          const { container, unmount } = render(<>{scene.question(m, termine, extra)}</>);
          expect(net(container.textContent)).toContain(net(m.question));
          expect(container.innerHTML.length).toBeGreaterThan(0);
          unmount();
        });
        if (scene.apres) {
          const { unmount } = render(<>{scene.apres(m)}</>);
          unmount();
        }
      });
    });
  });

  if (scene.choix) {
    it.each(module.CLASSES)('en %s : chaque réponse est un bouton à son libellé', (classe) => {
      GRAINES.slice(0, 8).forEach((graine) => {
        module.serie(graine, classe).forEach((m) => {
          const choisir = jest.fn();
          const choix = m.choix.map((c) => ({ ...c }));
          const { container, unmount } = render(<>{scene.choix({
            m, choix, fautes: [], choisir, objet: scene.objets ?? 'gemme',
          })}</>);
          const boutons = within(container).getAllByRole('button');
          expect(boutons).toHaveLength(choix.length);
          choix.forEach(({ cle: k, libelle }, i) => {
            const bouton = boutons.find((b) => net(b.textContent) === net(libelle));
            expect(bouton).toBeTruthy();
            expect(bouton.getAttribute('type')).toBe('button');
            fireEvent.click(bouton);
            expect(choisir).toHaveBeenNthCalledWith(i + 1, k);
          });
          unmount();
          // Une réponse ratée est désactivée.
          const view = render(<>{scene.choix({
            m, choix, fautes: [choix[0].cle], choisir: jest.fn(), objet: 'gemme',
          })}</>);
          const lesBoutons = within(view.container).getAllByRole('button');
          const faux = lesBoutons.find((b) => net(b.textContent) === net(choix[0].libelle));
          expect(faux.disabled).toBe(true);
          view.unmount();
        });
      });
    });
  }
});
