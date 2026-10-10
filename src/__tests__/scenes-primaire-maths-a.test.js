import {
  act, fireEvent, render, within,
} from '@testing-library/react';
import * as calcul from '../lib/jeux/calculMental';
import * as operations from '../lib/jeux/operationsCM2';
import * as grands from '../lib/jeux/grandsNombres';
import * as nombresCM2 from '../lib/jeux/nombresCM2';
import * as fractions from '../lib/jeux/fractionsCM1';
import * as fractionsCM2 from '../lib/jeux/fractionsCM2';
import * as aires from '../lib/jeux/airesCM1';
import * as airesCM2 from '../lib/jeux/airesCM2';
import * as durees from '../lib/jeux/dureesCM1';
import * as dureesCM2 from '../lib/jeux/dureesCM2';
import * as mesures from '../lib/jeux/mesuresCM1';
import * as longueurs from '../lib/jeux/longueursCM2';
import * as suite from '../lib/jeux/suiteQuiContinue';
import * as recette from '../lib/jeux/recettePour8';
import * as recetteCM2 from '../lib/jeux/recetteCM2';
import { ChoixCalcul, QuestionCalcul, etapesDeLaRuse, poserSoustraction } from '../components/jeux/scenes/primaire-maths-a/SceneCalcul';
import { QuestionNombres, classesDe } from '../components/jeux/scenes/primaire-maths-a/SceneNombres';
import { QuestionFractions } from '../components/jeux/scenes/primaire-maths-a/SceneFractions';
import { QuestionAires } from '../components/jeux/scenes/primaire-maths-a/SceneAires';
import { ChoixDurees, QuestionDurees } from '../components/jeux/scenes/primaire-maths-a/SceneDurees';
import { QuestionMesures, placerDansLeTableau } from '../components/jeux/scenes/primaire-maths-a/SceneMesures';
import { ChoixSuite, QuestionSuite, regleDeLaSuite } from '../components/jeux/scenes/primaire-maths-a/SceneSuite';
import { QuestionRecette } from '../components/jeux/scenes/primaire-maths-a/SceneRecette';
import { enLettres } from '../lib/jeux/nombresEnLettres';

/**
 * LES SCÈNES DU GROUPE « PRIMAIRE-MATHS-A » (09/10/2026) : chaque jeu, chaque
 * classe (le CM1 et le CM2 ont souvent chacun leur module), vingt-cinq
 * parties, chaque manche — avant et après la réponse, sans exception, avec le
 * texte entier de la question à l'écran ; et des réponses qui restent des
 * boutons à leur libellé.
 */

const graines = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);
const net = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();

/** [nom, [[module, classe]…], dessin de la question, réponses jouées autrement (ou rien)]. */
const JEUX = [
  ['le calcul malin', [[calcul, 'CM1'], [operations, 'CM2']], (m, t) => <QuestionCalcul m={m} termine={t} />, ChoixCalcul],
  ['les grands nombres', [[grands, 'CM1'], [nombresCM2, 'CM2']], (m, t) => <QuestionNombres m={m} termine={t} />, null],
  ['les fractions', [[fractions, 'CM1'], [fractionsCM2, 'CM2']], (m, t) => <QuestionFractions m={m} termine={t} />, null],
  ['les aires', [[aires, 'CM1'], [airesCM2, 'CM2']], (m, t) => <QuestionAires m={m} termine={t} />, null],
  ['les durées', [[durees, 'CM1'], [dureesCM2, 'CM2']], (m, t) => <QuestionDurees m={m} termine={t} />, ChoixDurees],
  ['les mesures', [[mesures, 'CM1'], [longueurs, 'CM2']], (m, t) => <QuestionMesures m={m} termine={t} />, null],
  ['la suite qui continue', [[suite, 'CM1']], (m, t) => <QuestionSuite m={m} termine={t} />, ChoixSuite],
  ['la recette pour 8', [[recette, 'CM1'], [recetteCM2, 'CM2']], (m, t) => <QuestionRecette m={m} termine={t} />, null],
];

const CAS = JEUX.flatMap(([nom, modules, question, Choix]) => modules.map(([module, classe]) => [nom, classe, module, question, Choix]));

describe.each(CAS)('%s (%s)', (_, classe, module, question, Choix) => {
  const manches = graines.flatMap((g) => module.serie(g, classe));

  it('chaque manche se dessine avant et après la réponse, et sa question reste à l’écran', () => {
    manches.forEach((m) => {
      [false, true].forEach((termine) => {
        const { container, unmount } = render(<>{question(m, termine, termine ? { trouve: true } : {})}</>);
        // Jamais de rendu vide ; et le texte entier de la question (la figure en carreaux n'en a pas).
        expect(container).not.toBeEmptyDOMElement();
        expect(net(container.textContent)).toContain(net(m.question ?? ''));
        unmount();
      });
    });
  });

  it('l’explication se déroule jusqu’au bout, sans exception, la question toujours là', () => {
    jest.useFakeTimers();
    manches.slice(0, 40).forEach((m) => {
      const { container, unmount } = render(<>{question(m, true, { trouve: true })}</>);
      act(() => { jest.advanceTimersByTime(30000); });
      expect(net(container.textContent)).toContain(net(m.question ?? ''));
      unmount();
    });
    jest.useRealTimers();
  });

  if (Choix) {
    it('chaque réponse est un bouton à son libellé, qui répond', () => {
      manches.forEach((m) => {
        const choisir = jest.fn();
        const { container, unmount } = render(<Choix m={m} choix={m.choix} fautes={[]} choisir={choisir} objet="gemme" />);
        expect(within(container).getAllByRole('button')).toHaveLength(m.choix.length);
        m.choix.forEach((c) => {
          const bouton = within(container).getByRole('button', { name: String(c.libelle) });
          fireEvent.click(bouton);
          expect(choisir).toHaveBeenLastCalledWith(c.cle);
        });
        unmount();
      });
    });

    it('une réponse fausse reste barrée et ne se clique plus', () => {
      const m = module.serie(13, classe)[0];
      const faute = m.choix.find((c) => String(c.cle) !== String(m.bonne));
      const { container } = render(<Choix m={m} choix={m.choix} fautes={[faute.cle]} choisir={jest.fn()} objet="gemme" />);
      const bouton = within(container).getByRole('button', { name: String(faute.libelle) });
      expect(bouton).toBeDisabled();
      expect(bouton.className).toMatch(/est-fausse/);
    });
  }
});

describe('les explications disent juste', () => {
  it('la ruse du calcul malin retombe toujours sur le produit', () => {
    graines.forEach((g) => calcul.serie(g).forEach((m) => {
      const [n, f] = m.question.match(/\d+/g).map(Number);
      const etapes = etapesDeLaRuse(n, f);
      expect(etapes).toHaveLength(2);
      expect(etapes[1].calcul.endsWith(`= ${m.bonne}`)).toBe(true);
    }));
  });

  it('la soustraction posée écrit le bon résultat', () => {
    graines.forEach((g) => operations.serie(g).filter((m) => m.consigne === 'soustraction').forEach((m) => {
      const [a, b] = m.question.match(/\d+/g).map(Number);
      expect(Number(poserSoustraction(a, b).map((c) => c.ecrit).join(''))).toBe(m.bonne);
    }));
  });

  it('les classes d’un grand nombre se lisent comme le nombre entier', () => {
    graines.forEach((g) => grands.serie(g).forEach((m) => {
      expect(classesDe(m.bonne).map((c) => c.dit).filter(Boolean).join(' ')).toBe(enLettres(m.bonne));
    }));
  });

  it('le tableau de conversion retombe sur la bonne mesure', () => {
    [mesures, longueurs].forEach((module) => graines.forEach((g) => module.serie(g).forEach((m) => {
      const t = placerDansLeTableau(m.question);
      expect(t).not.toBeNull();
      expect(t.resultat).toBe(m.bonne);
    })));
  });

  it('la règle de chaque suite donne la bonne réponse', () => {
    graines.forEach((g) => suite.serie(g).forEach((m) => {
      const r = regleDeLaSuite(m.question);
      expect(r).not.toBeNull();
      expect(String(r.suivant)).toBe(String(m.bonne));
    }));
  });
});
