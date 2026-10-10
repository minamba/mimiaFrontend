/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte entier, ses boutons-réponses. */
import { render, fireEvent } from '@testing-library/react';
import SCENES from '../components/jeux/scenes/groupes/lycee-francais';
import { decouper } from '../components/jeux/scenes/lycee-francais/Versification';
import { TRAVAIL } from '../components/jeux/scenes/lycee-francais/FiguresDeStyle';
import * as questionDeGrammaire from '../lib/jeux/lycee/question-de-grammaire';
import * as figuresDeStyle from '../lib/jeux/lycee/figures-de-style-lycee';
import * as versification from '../lib/jeux/lycee/versification';
import * as mouvements from '../lib/jeux/lycee/mouvements-litteraires';
import * as genresEtRegistres from '../lib/jeux/lycee/genres-et-registres';
import * as phraseEtEffets from '../lib/jeux/lycee/phrase-et-effets';
import * as argumenter from '../lib/jeux/lycee/argumenter';
import * as vocabulaireAnalyse from '../lib/jeux/lycee/vocabulaire-analyse';
import * as dissertation from '../lib/jeux/lycee/dissertation';
import * as explicationLineaire from '../lib/jeux/lycee/explication-lineaire';
import * as procedesEtEffets from '../lib/jeux/lycee/procedes-et-effets';
import * as cultureLitteraire from '../lib/jeux/lycee/culture-litteraire';
import * as essai from '../lib/jeux/lycee/essai';
import * as contraction from '../lib/jeux/lycee/contraction';
import * as debatIdees from '../lib/jeux/lycee/debat-idees';
import * as ecritProfessionnel from '../lib/jeux/lycee/ecrit-professionnel';
import * as groupementTextes from '../lib/jeux/lycee/groupement-textes';

/**
 * LES SCÈNES DU FRANÇAIS AU LYCÉE (09/10/2026) — voir `scenes/lycee-francais/`.
 * Pour chaque jeu, chaque classe, 25 parties : la scène se dessine avant et
 * après la réponse sans planter, le texte ENTIER de la question reste à
 * l'écran, et une mécanique propre garde un bouton par réponse, à son
 * libellé, qui appelle `choisir(cle)` et se grise une fois écarté.
 */

const MODULES = [
  questionDeGrammaire, figuresDeStyle, versification, mouvements, genresEtRegistres, phraseEtEffets,
  argumenter, vocabulaireAnalyse, dissertation, explicationLineaire, procedesEtEffets, cultureLitteraire,
  essai, contraction, debatIdees, ecritProfessionnel, groupementTextes,
];

const normal = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const sansCrochets = (s) => String(s).replace(/\[([^\]]+)\]/g, '$1');
const GRAINES = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);

/** Toutes les manches d'un module : chaque classe, chaque graine. */
const manchesDe = (mod) => mod.CLASSES.flatMap((classe) => GRAINES.flatMap((g) => mod.serie(g, classe)));

/** Les paires (jeu, classe), pour un test par classe. */
const PAR_CLASSE = MODULES.flatMap((mod) => mod.CLASSES.map((classe) => [mod.FAMILLE.cle, classe, mod]));

/** Les jeux qui jouent leurs réponses autrement (cloches, feuilles, flacons…). */
const AVEC_CHOIX = MODULES.filter((mod) => SCENES[mod.FAMILLE.cle]?.choix).map((mod) => [mod.FAMILLE.cle, mod]);

/** Le bouton d'une réponse : son libellé exact d'abord (« bien que » est dans « si bien que »). */
const boutonDe = (boutons, libelle) => boutons.find((b) => normal(b.querySelector('[class$="__libelle"]')?.textContent) === normal(libelle))
  ?? boutons.find((b) => normal(b.textContent).includes(normal(libelle)));

test('les dix-sept jeux du groupe ont leur scène', () => {
  expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((mod) => mod.FAMILLE.cle).sort());
});

test('les formes de réponses sont préfixées par la clé du jeu', () => {
  const formes = Object.entries(SCENES).filter(([, scene]) => scene.objets);
  formes.forEach(([cle, scene]) => expect(scene.objets).toBe(`sc-${cle}`));
});

test('au moins un tiers des jeux joue ses réponses autrement', () => {
  expect(AVEC_CHOIX.length * 3).toBeGreaterThanOrEqual(MODULES.length);
});

test('le gué de la versification compte chaque vers comme le module', () => {
  versification.VERS.forEach(([vers, , n]) => {
    expect([vers, decouper(vers)?.syllabes.length]).toEqual([vers, n]);
  });
});

test('chaque phrase des figures de style sait où sa figure travaille', () => {
  figuresDeStyle.EXEMPLES.forEach(([phrase]) => {
    const morceaux = TRAVAIL[phrase] ?? [];
    expect([phrase, morceaux.length > 0]).toEqual([phrase, true]);
    morceaux.forEach(([bout]) => expect([phrase, phrase.includes(bout)]).toEqual([phrase, true]));
  });
});

test.each(PAR_CLASSE)('%s, %s : chaque manche se dessine, avant et après la réponse, texte entier', (cle, classe, mod) => {
  const scene = SCENES[cle];
  GRAINES.forEach((graine) => {
    mod.serie(graine, classe).forEach((m) => {
      const attendu = normal(sansCrochets(m.question));

      [false, true].forEach((termine) => {
        const view = render(<>{scene.question(m, termine, termine ? { trouve: true } : {})}</>);
        expect(normal(view.container.textContent)).toContain(attendu);
        view.unmount();
      });

      render(<>{scene.apres?.(m) ?? null}</>).unmount();
    });
  });
});

test.each(AVEC_CHOIX)('%s : un bouton par réponse, à son libellé, qui choisit sa clé', (cle, mod) => {
  const scene = SCENES[cle];
  manchesDe(mod).forEach((m) => {
    const choisir = jest.fn();
    const view = render(<>{scene.choix({
      m, choix: m.choix, fautes: [], choisir, objet: scene.objets,
    })}</>);
    const boutons = [...view.container.querySelectorAll('button')];
    expect(boutons).toHaveLength(m.choix.length);
    m.choix.forEach((c, i) => {
      const bouton = boutonDe(boutons, c.libelle);
      expect(bouton.disabled).toBe(false);
      fireEvent.click(bouton);
      expect(choisir).toHaveBeenNthCalledWith(i + 1, c.cle);
    });
    view.unmount();

    // Une réponse écartée reste un bouton, mais grisé.
    const faute = m.choix.find((c) => String(c.cle) !== String(m.bonne));
    const { container, unmount } = render(<>{scene.choix({
      m, choix: m.choix, fautes: [faute.cle], choisir: jest.fn(), objet: scene.objets,
    })}</>);
    expect(boutonDe([...container.querySelectorAll('button')], faute.libelle).disabled).toBe(true);
    unmount();
  });
});
