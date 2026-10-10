import { fireEvent, render, within } from '@testing-library/react';
import { computeAccessibleName } from 'dom-accessibility-api';
import SCENES from '../components/jeux/scenes/groupes/college-francais-a';
import * as detectiveDesClasses from '../lib/jeux/college/detective-des-classes';
import * as codOuCoi from '../lib/jeux/college/cod-ou-coi';
import * as roueDesVerbes from '../lib/jeux/college/roue-des-verbes-college';
import * as decorOuAction from '../lib/jeux/college/decor-ou-action';
import * as homophones from '../lib/jeux/college/homophones-college';
import * as participePasse from '../lib/jeux/college/participe-passe-college';
import * as simpleOuComplexe from '../lib/jeux/college/simple-ou-complexe';
import * as leMotJuste from '../lib/jeux/college/le-mot-juste';
import * as schemaNarratif from '../lib/jeux/college/schema-narratif';
import * as quiRaconte from '../lib/jeux/college/qui-raconte-college';
import * as dieuxEtHeros from '../lib/jeux/college/dieux-et-heros';
import * as quiParle from '../lib/jeux/college/qui-parle';
import * as triDesSubordonnees from '../lib/jeux/college/tri-des-subordonnees';
import * as actifOuPassif from '../lib/jeux/college/actif-ou-passif';

/**
 * LES SCÈNES DU GROUPE « COLLÈGE, FRANÇAIS A » (09/10/2026) : pour chaque jeu,
 * chaque classe, 25 parties, chaque manche — la scène se dessine avant et
 * après la réponse sans rien casser, garde la question entière à l'écran, et
 * ses réponses jouées autrement restent des boutons à leur libellé.
 */

const MODULES = [
  detectiveDesClasses, codOuCoi, roueDesVerbes, decorOuAction, homophones, participePasse,
  simpleOuComplexe, leMotJuste, schemaNarratif, quiRaconte, dieuxEtHeros, quiParle,
  triDesSubordonnees, actifOuPassif,
];

const normaliser = (t) => String(t).replace(/\s+/g, ' ').trim();
const sansCrochets = (t) => String(t).replace(/\[([^\]]+)\]/g, '$1');

it('chaque jeu du groupe a sa scène, et rien d’autre', () => {
  expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((mod) => mod.FAMILLE.cle).sort());
});

it('les objets des réponses portent le préfixe du jeu', () => {
  const objets = Object.entries(SCENES).filter(([, scene]) => scene.objets);
  expect(objets.map(([cle, scene]) => scene.objets === `sc-${cle}`)).not.toContain(false);
});

describe.each(MODULES.map((mod) => [mod.FAMILLE.cle, mod]))('%s', (cle, mod) => {
  const scene = SCENES[cle];

  it.each(mod.CLASSES)('en %s : la question reste entière, avant et après la réponse', (classe) => {
    for (let g = 0; g < 25; g += 1) {
      mod.serie(g * 7919 + 13, classe).forEach((m) => {
        const attendu = normaliser(sansCrochets(m.question));
        [[false, {}], [true, { trouve: true }]].forEach(([termine, extra]) => {
          const { container, unmount } = render(<>{scene.question(m, termine, extra)}</>);
          expect(normaliser(container.textContent)).toContain(attendu);
          if (termine && scene.apres) render(<>{scene.apres(m)}</>).unmount();
          unmount();
        });
      });
    }
  });

  if (scene?.choix) {
    it.each(mod.CLASSES)('en %s : un bouton par réponse, à son libellé, qui choisit', (classe) => {
      for (let g = 0; g < 25; g += 1) {
        mod.serie(g * 7919 + 13, classe).forEach((m) => {
          const choisir = jest.fn();
          const { container, unmount } = render(<>{scene.choix({
            m, choix: m.choix, fautes: [], choisir, objet: scene.objets ?? 'bulle',
          })}</>);
          const boutons = within(container).getAllByRole('button');
          expect(boutons).toHaveLength(m.choix.length);
          // L'ordre à l'écran peut suivre le dessin (un chemin, une roue) : on cherche chaque réponse par son nom.
          const noms = boutons.map((b) => normaliser(computeAccessibleName(b)));
          m.choix.forEach((c) => {
            const libelle = normaliser(c.libelle);
            const i = noms.indexOf(libelle) >= 0 ? noms.indexOf(libelle) : noms.findIndex((n) => n.includes(libelle));
            expect(i).toBeGreaterThanOrEqual(0);
            fireEvent.click(boutons[i]);
            expect(choisir).toHaveBeenLastCalledWith(c.cle);
          });
          unmount();
        });
      }
    });

    it.each(mod.CLASSES)('en %s : une réponse fausse est désactivée', (classe) => {
      const m = mod.serie(4242, classe)[0];
      const faute = m.choix.find((c) => c.cle !== m.bonne).cle;
      const choisir = jest.fn();
      const { container } = render(<>{scene.choix({
        m, choix: m.choix, fautes: [faute], choisir, objet: scene.objets ?? 'bulle',
      })}</>);
      const boutons = within(container).getAllByRole('button');
      const libelle = normaliser(m.choix.find((c) => c.cle === faute).libelle);
      const fautif = boutons.find((b) => normaliser(computeAccessibleName(b)) === libelle)
        ?? boutons.find((b) => normaliser(computeAccessibleName(b)).includes(libelle));
      expect(fautif).toBeDisabled();
      expect(boutons.filter((b) => !b.disabled)).toHaveLength(m.choix.length - 1);
    });
  }
});
