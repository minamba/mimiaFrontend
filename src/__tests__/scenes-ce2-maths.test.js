/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin (la mascotte, le décor, la fête) : des
   classes, que les requêtes par rôle ne voient pas. */
/**
 * LES SCÈNES DU GROUPE « CE2-MATHS » (09/10/2026) — le tour du jardin,
 * combien de temps, les bouteilles, le miroir et le diagramme. Pour chaque
 * jeu, 25 graines, chaque manche : la scène se dessine avant et après la
 * réponse sans exception, garde ses données à l'écran, et ses réponses
 * restent des boutons à leur libellé qui appellent `choisir(cle)`. Puis
 * chaque écran : la mascotte attend, encourage à l'erreur, fait la fête à la
 * réussite ; et l'explication animée finit sur la bonne réponse.
 */

import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import * as jardin from '../lib/jeux/tourDuJardin';
import * as temps from '../lib/jeux/combienDeTemps';
import * as b from '../lib/jeux/bouteilles';
import * as miroir from '../lib/jeux/miroir';
import * as diag from '../lib/jeux/diagramme';
import TourDuJardin, { REGLE as REGLE_JARDIN } from '../components/jeux/TourDuJardin';
import CombienDeTemps, { REGLE as REGLE_TEMPS } from '../components/jeux/CombienDeTemps';
import Bouteilles, { REGLE as REGLE_BOUTEILLES } from '../components/jeux/Bouteilles';
import Miroir, { REGLE as REGLE_MIROIR } from '../components/jeux/Miroir';
import Diagramme, { REGLE as REGLE_DIAGRAMME } from '../components/jeux/Diagramme';
import { QuestionJardin } from '../components/jeux/scenes/ce2-maths/SceneJardin';
import { QuestionTemps } from '../components/jeux/scenes/ce2-maths/SceneTemps';
import { QuestionBouteilles } from '../components/jeux/scenes/ce2-maths/SceneBouteilles';
import { QuestionMiroir } from '../components/jeux/scenes/ce2-maths/SceneMiroir';
import { QuestionDiagramme } from '../components/jeux/scenes/ce2-maths/SceneDiagramme';

const normaliser = (t) => String(t).replace(/\s+/g, ' ').trim();
/** Le nom accessible d'un bouton-réponse : son libellé (à la comparaison des bouteilles, suivi de la contenance). */
const nomDe = (m, { cle, libelle }) => (m.mode === 'comparer' && m.recipients
  ? `${libelle} ${b.ecrire(m.recipients.find((r) => r.nom === cle).cl)}`
  : String(libelle));
const graines = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);

/** Ce que l'enfant doit lire à l'écran, pour chaque jeu. */
const JEUX = [
  {
    cle: 'tour-du-jardin',
    Ecran: TourDuJardin,
    regle: REGLE_JARDIN,
    serie: jardin.serie,
    Question: QuestionJardin,
    prefixe: 'sc-tour-du-jardin-ce2',
    donnees: (m) => [`${jardin.cotes(m)[0]} m`],
    finale: (m) => `= ${m.bonne} m`,
    cm: true,
  },
  {
    cle: 'combien-de-temps',
    Ecran: CombienDeTemps,
    regle: REGLE_TEMPS,
    serie: temps.serie,
    Question: QuestionTemps,
    prefixe: 'sc-combien-de-temps-ce2',
    donnees: (m) => [m.activite, temps.ecrireHeure(m.debut), temps.ecrireHeure(m.fin)],
    finale: (m) => `En tout : ${temps.ecrireDuree(m.bonne)}`,
    cm: true,
  },
  {
    cle: 'les-bouteilles',
    Ecran: Bouteilles,
    regle: REGLE_BOUTEILLES,
    serie: b.serie,
    Question: QuestionBouteilles,
    prefixe: 'sc-les-bouteilles-ce2',
    donnees: (m) => (m.mode === 'comparer' ? [] : [m.question]),
    finale: (m) => (m.mode === 'comparer' ? `= ${m.recipients.find((r) => r.nom === m.bonne).cl} cL` : String(m.bonne)),
    cm: false,
  },
  {
    cle: 'le-miroir',
    Ecran: Miroir,
    regle: REGLE_MIROIR,
    serie: miroir.serie,
    Question: QuestionMiroir,
    prefixe: 'sc-le-miroir-ce2',
    donnees: () => ['A', 'B', 'C'],
    finale: (m) => (m.mode === 'axe' ? `le long de ${m.bonne}` : `Le coin ${m.bonne}`),
    cm: true,
  },
  {
    cle: 'le-diagramme',
    Ecran: Diagramme,
    regle: REGLE_DIAGRAMME,
    serie: diag.serie,
    Question: QuestionDiagramme,
    prefixe: 'sc-le-diagramme-ce2',
    donnees: (m) => [m.question, m.titre, ...m.noms],
    finale: (m) => String(m.bonne),
    cm: true,
  },
];

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe.each(JEUX)('la scène « $cle »', ({
  regle, serie, Question, prefixe, donnees,
}) => {
  it('chaque manche de 25 parties se dessine avant et après la réponse, ses données à l’écran', () => {
    graines.forEach((g) => serie(g).forEach((m) => {
      [false, true].forEach((termine) => {
        const extra = termine ? { trouve: true, derniereFaute: null, montrer: false } : {};
        const { container, unmount } = render(<>{<Question m={m} termine={termine} extra={extra} />}</>);
        const texte = normaliser(container.textContent);
        donnees(m).forEach((d) => expect(texte).toContain(normaliser(d)));
        expect(container.querySelector(`.${prefixe}__mascotte`)).not.toBeNull();
        expect(container.querySelector(`.${prefixe}__decor`)).not.toBeNull();
        unmount();
      });
    }));
  });

  it('les réponses sont des boutons à leur libellé, qui appellent choisir(cle)', () => {
    graines.slice(0, 8).forEach((g) => serie(g).forEach((m) => {
      const choix = regle.choix(m);
      const choisir = jest.fn();
      const { unmount } = render(<>{regle.rendreLesChoix({
        m, choix, fautes: [], choisir, objet: 'gemme',
      })}</>);
      expect(screen.getAllByRole('button')).toHaveLength(choix.length);
      choix.forEach(({ cle, libelle }) => {
        const bouton = screen.getByRole('button', { name: nomDe(m, { cle, libelle }) });
        fireEvent.click(bouton);
        expect(choisir).toHaveBeenLastCalledWith(cle);
      });
      unmount();

      // Un choix faux reste barré et ne se prend plus.
      const fautif = choix[0];
      const { unmount: demonter } = render(<>{regle.rendreLesChoix({
        m, choix, fautes: [fautif.cle], choisir: jest.fn(), objet: 'gemme',
      })}</>);
      const barre = screen.getByRole('button', { name: nomDe(m, fautif) });
      expect(barre).toBeDisabled();
      expect(barre.className).toContain('est-fausse');
      demonter();
    }));
  });

  it('avant la réponse, rien n’est montré de la réponse dans la scène', () => {
    graines.slice(0, 5).forEach((g) => serie(g).forEach((m) => {
      const { container, unmount } = render(<Question m={m} termine={false} extra={{}} />);
      expect(container.querySelector('[role="status"]')).toBeNull();
      expect(container.querySelector('.est-bon, .est-axe, .est-compte, .est-la')).toBeNull();
      unmount();
    }));
  });
});

describe.each(JEUX)('l’explication animée de « $cle »', ({ serie, Question, finale }) => {
  it('finit sur la bonne réponse', () => {
    jest.useFakeTimers();
    serie(2024).forEach((m) => {
      const { container, unmount } = render(<Question m={m} termine extra={{ trouve: true }} />);
      for (let k = 0; k < 40; k += 1) act(() => { jest.advanceTimersByTime(1000); });
      expect(normaliser(container.textContent)).toContain(normaliser(finale(m)));
      unmount();
    });
  });
});

describe.each(JEUX)('l’écran « $cle »', ({
  Ecran, regle, serie, prefixe, cm,
}) => {
  beforeEach(() => { jest.spyOn(Date, 'now').mockReturnValue(2024); });

  it('au CE2 : la mascotte attend, encourage à l’erreur, fait la fête à la réussite', () => {
    const { container } = render(<Ecran niveau="CE2" onQuitter={jest.fn()} matiereCode="MATHS" />);
    expect(container.querySelector(`.${prefixe}__mascotte.est-attend`)).not.toBeNull();
    const m = serie(2024)[0];
    const choix = regle.choix(m);
    const faux = choix.find((c) => regle.verdict(m, c.cle) !== 'juste');
    const bon = choix.find((c) => regle.verdict(m, c.cle) === 'juste');
    fireEvent.click(screen.getByRole('button', { name: nomDe(m, faux) }));
    expect(container.querySelector(`.${prefixe}__mascotte.est-encourage`)).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: nomDe(m, bon) }));
    expect(container.querySelector(`.${prefixe}__mascotte.est-fete`)).not.toBeNull();
    expect(container.querySelector('.sc-ce2-maths__fete')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  if (cm) {
    it.each(['CM1', 'CM2'])('au %s, l’écran du cycle 3 se rend toujours', (niveau) => {
      const { container } = render(<Ecran niveau={niveau} onQuitter={jest.fn()} matiereCode="MATHS" />);
      expect(container.textContent.length).toBeGreaterThan(0);
    });
  }
});
