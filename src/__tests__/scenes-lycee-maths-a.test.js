import { fireEvent, render, within } from '@testing-library/react';
import SCENES from '../components/jeux/scenes/groupes/lycee-maths-a';
import * as automatismes from '../lib/jeux/lycee/automatismes';
import * as intervalles from '../lib/jeux/lycee/intervalles-et-inegalites';
import * as puissances from '../lib/jeux/lycee/puissances-et-racines-lycee';
import * as fonctionsDeReference from '../lib/jeux/lycee/fonctions-de-reference';
import * as equationDeDroite from '../lib/jeux/lycee/equation-de-droite';
import * as vecteurs from '../lib/jeux/lycee/vecteurs-et-coordonnees';
import * as probabilitesSeconde from '../lib/jeux/lycee/probabilites-seconde';
import * as statistiquesSeconde from '../lib/jeux/lycee/statistiques-seconde';
import * as suites from '../lib/jeux/lycee/suites';
import * as secondDegre from '../lib/jeux/lycee/second-degre';
import * as derivation from '../lib/jeux/lycee/derivation';
import * as exponentielle from '../lib/jeux/lycee/exponentielle';
import * as produitScalaire from '../lib/jeux/lycee/produit-scalaire';
import * as probabilitesConditionnelles from '../lib/jeux/lycee/probabilites-conditionnelles';
import * as variablesAleatoires from '../lib/jeux/lycee/variables-aleatoires';
import * as vraiFauxReciproque from '../lib/jeux/lycee/vrai-faux-reciproque';
import * as listesPython from '../lib/jeux/lycee/listes-python';
import { listesPasAPas } from '../components/jeux/scenes/lycee-maths-a/listesPasAPas';

/**
 * LES SCÈNES DU GROUPE « LYCÉE, MATHS A » (09/10/2026) : pour chaque jeu,
 * chaque classe, 25 parties, chaque manche — la scène se dessine avant et
 * après la réponse sans casser, garde le texte entier de la question, et ses
 * réponses (quand elle les joue à sa façon) restent des boutons qui répondent.
 */
const MODULES = [
  automatismes, intervalles, puissances, fonctionsDeReference, equationDeDroite, vecteurs,
  probabilitesSeconde, statistiquesSeconde, suites, secondDegre, derivation, exponentielle,
  produitScalaire, probabilitesConditionnelles, variablesAleatoires, vraiFauxReciproque, listesPython,
];

const normal = (t) => String(t).replace(/\s+/g, ' ').trim();

/** Toutes les manches d'un module : chaque classe, 25 graines. */
const manchesDe = (mod) => mod.CLASSES.flatMap((classe) => Array.from(
  { length: 25 },
  (_, g) => mod.serie(g * 7919 + 13, classe),
).flat());

test('le registre a une scène pour chacun des 17 jeux du groupe, et rien d’autre', () => {
  expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((mod) => mod.FAMILLE.cle).sort());
});

test('les formes de réponses sont préfixées par la clé du jeu', () => {
  const objets = Object.entries(SCENES).filter(([, scene]) => scene.objets);
  objets.forEach(([cle, scene]) => expect(scene.objets).toBe(`sc-${cle}`));
});

test('au moins un tiers des jeux joue ses réponses autrement', () => {
  expect(Object.values(SCENES).filter((scene) => scene.choix).length).toBeGreaterThanOrEqual(6);
});

test('vrai, faux, réciproque garde les buzzers de l’écran commun', () => {
  expect(SCENES['vrai-faux-reciproque'].choix).toBeUndefined();
});

describe.each(MODULES.map((mod) => [mod.FAMILLE.cle, mod]))('%s', (cle, mod) => {
  const scene = SCENES[cle];

  test('chaque manche se dessine, avant et après la réponse, avec sa question entière', () => {
    manchesDe(mod).forEach((m) => {
      const { container: avant, unmount: fermerAvant } = render(<>{scene.question(m, false, {})}</>);
      expect(normal(avant.textContent)).toContain(normal(m.question));
      fermerAvant();

      const { container: apres, unmount: fermerApres } = render(<>{scene.question(m, true, { trouve: true })}</>);
      expect(normal(apres.textContent)).toContain(normal(m.question));
      fermerApres();

      const dessous = (scene.apres ?? (() => null))(m);
      const { unmount: fermerDessous } = render(<>{dessous}</>);
      fermerDessous();
    });
  });
});

describe.each(MODULES.filter((mod) => SCENES[mod.FAMILLE.cle]?.choix).map((mod) => [mod.FAMILLE.cle, mod]))('%s joue ses réponses', (cle, mod) => {
  const scene = SCENES[cle];

  test('un bouton par réponse, nommé par son libellé, qui répond au clic', () => {
    manchesDe(mod).forEach((m) => {
      const choisir = jest.fn();
      const { container, unmount } = render(<>{scene.choix({
        m, choix: m.choix, fautes: [], choisir, objet: 'gemme',
      })}</>);
      const boutons = within(container).getAllByRole('button');
      expect(boutons).toHaveLength(m.choix.length);
      m.choix.forEach((c, i) => {
        expect(normal(boutons[i].textContent)).toContain(normal(c.libelle));
        fireEvent.click(boutons[i]);
        expect(choisir).toHaveBeenLastCalledWith(c.cle);
      });
      unmount();
    });
  });

  test('une réponse écartée est désactivée et barrée', () => {
    const m = mod.serie(13, mod.CLASSES[0])[0];
    const choisir = jest.fn();
    const { container } = render(<>{scene.choix({
      m, choix: m.choix, fautes: [m.choix[0].cle], choisir, objet: 'gemme',
    })}</>);
    const boutons = within(container).getAllByRole('button');
    expect(boutons[0]).toBeDisabled();
    expect(boutons[0].className).toContain('est-fausse');
    fireEvent.click(boutons[0]);
    expect(choisir).not.toHaveBeenCalled();
  });
});

test('l’étal des listes rejoue chaque programme et retrouve l’affichage du module', () => {
  listesPython.CLASSES.forEach((classe) => {
    for (let g = 0; g < 25; g += 1) {
      listesPython.serie(g * 7919 + 13, classe).forEach((m) => {
        const { sorties } = listesPasAPas(m.question);
        expect(sorties[sorties.length - 1]).toBe(m.bonne);
      });
    }
  });
});
