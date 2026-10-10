/**
 * LES SCÈNES DU GROUPE « COLLEGE-FRANCAIS-B » (09/10/2026) — treize jeux de
 * français du collège, chacun dans son univers (voir
 * `components/jeux/scenes/groupes/college-francais-b.js`). Pour chaque jeu,
 * chaque classe, vingt-cinq graines et chaque manche :
 *   - la question se dessine avant ET après la réponse, sans exception ;
 *   - le texte entier de la question reste à l'écran (sans les crochets) ;
 *   - avant la réponse, la bonne réponse n'apparaît nulle part (sauf si la
 *     question la contient déjà) ;
 *   - les réponses jouées autrement restent des boutons à leur libellé, qui
 *     appellent `choisir(cle)`, et une réponse fausse est désactivée.
 * Puis les données propres à certaines scènes : le décompte de chaque vers,
 * les ponts de « Si j'étais… », la tour de « Thèse, argument ou exemple ? ».
 */

import { fireEvent, render, screen } from '@testing-library/react';
import SCENES from '../components/jeux/scenes/groupes/college-francais-b';
import { compterDecompte, decompteFidele, versDe } from '../components/jeux/scenes/college-francais-b/CompteurDeSyllabes';
import { analyser } from '../components/jeux/scenes/college-francais-b/SiJEtais';
import { sansLeMot } from '../components/jeux/scenes/college-francais-b/commun';
import * as accords from '../lib/jeux/college/les-accords-college.js';
import * as image from '../lib/jeux/college/comme-une-image-college.js';
import * as theatre from '../lib/jeux/college/poeme-theatre-college.js';
import * as rire from '../lib/jeux/college/pourquoi-on-rit.js';
import * as chevalier from '../lib/jeux/college/le-chevalier.js';
import * as syllabes from '../lib/jeux/college/compteur-de-syllabes.js';
import * as registre from '../lib/jeux/college/quel-registre.js';
import * as info from '../lib/jeux/college/info-ou-opinion.js';
import * as siJetais from '../lib/jeux/college/si-j-etais.js';
import * as sur from '../lib/jeux/college/sur-ou-pas-sur.js';
import * as fautes from '../lib/jeux/college/chasse-aux-fautes.js';
import * as these from '../lib/jeux/college/these-argument-exemple.js';
import * as nonDit from '../lib/jeux/college/ce-qui-n-est-pas-dit.js';

const MODULES = [accords, image, theatre, rire, chevalier, syllabes, registre, info, siJetais, sur, fautes, these, nonDit];

const GRAINES = Array.from({ length: 25 }, (_, g) => g * 7919 + 13);

const normaliser = (t) => String(t ?? '').replace(/\s+/g, ' ').trim();
const sansCrochets = (t) => String(t ?? '').replace(/\[([^\]]+)\]/g, '$1');

/** Toutes les manches d'un module pour une classe, sur les vingt-cinq graines. */
const manchesDe = (module, classe) => GRAINES.flatMap((g) => module.serie(g, classe));

test('le groupe déclare ses treize jeux, et rien d’autre', () => {
  expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((mod) => mod.FAMILLE.cle).sort());
});

test('au moins un tiers des jeux jouent leurs réponses autrement', () => {
  const autrement = Object.values(SCENES).filter((s) => typeof s.choix === 'function');
  expect(autrement.length * 3).toBeGreaterThanOrEqual(MODULES.length);
});

describe.each(MODULES.map((mod) => [mod.FAMILLE.cle, mod]))('%s', (cle, module) => {
  const scene = SCENES[cle];

  test('la scène a une question, et ses objets sont préfixés', () => {
    expect(typeof scene.question).toBe('function');
    expect(scene.objets === undefined || scene.objets === `sc-${cle}`).toBe(true);
  });

  test.each(module.CLASSES)('classe %s : chaque manche se dessine et garde sa question', (classe) => {
    manchesDe(module, classe).forEach((m) => {
      const attendu = normaliser(sansCrochets(m.question));
      const bonne = normaliser(m.choix.find((c) => c.cle === m.bonne)?.libelle ?? m.bonne);

      const view = render(<>{scene.question(m, false, {})}</>);
      const texteAvant = normaliser(view.container.textContent);
      expect(texteAvant).toContain(attendu);
      // Jamais la réponse avant la réponse (sauf si la question la porte déjà).
      expect(attendu.includes(bonne) || !texteAvant.includes(bonne)).toBe(true);
      view.unmount();

      const utils = render(<>{scene.question(m, true, { trouve: true })}</>);
      expect(normaliser(utils.container.textContent)).toContain(attendu);
      utils.unmount();

      // Le dessous de la question, s'il y en a un : sans exception.
      const { unmount } = render(<>{scene.apres ? scene.apres(m) : null}</>);
      unmount();
    });
  });

  test.each(module.CLASSES)('classe %s : chaque réponse est un bouton qui appelle choisir(cle)', (classe) => {
    // Les jeux sans `choix` gardent les boutons de l'écran commun : rien à vérifier ici.
    const manches = scene.choix ? manchesDe(module, classe) : [];
    manches.forEach((m, k) => {
      const choisir = jest.fn();
      const view = render(<>{scene.choix({
        m, choix: m.choix, fautes: [], choisir, objet: scene.objets ?? 'bulle',
      })}</>);
      const boutons = screen.getAllByRole('button');
      expect(boutons).toHaveLength(m.choix.length);
      m.choix.forEach(({ cle: c, libelle }) => {
        // Le vrai nom accessible, sur les premières manches (la requête est lente).
        // « leur » est dans « leurs » : parmi les candidats, le bouton au nom exact.
        const candidats = k < 16
          ? screen.getAllByRole('button', { name: (nom) => normaliser(nom).includes(normaliser(libelle)) })
          : boutons.filter((b) => normaliser(b.textContent).includes(normaliser(libelle)));
        const bouton = candidats.find((b) => normaliser(b.textContent) === normaliser(libelle)) ?? candidats[0];
        expect(bouton).toBeEnabled();
        fireEvent.click(bouton);
        expect(choisir).toHaveBeenLastCalledWith(c);
      });
      view.unmount();

      // Une réponse fausse : désactivée, et marquée.
      const fausse = m.choix.find((c) => c.cle !== m.bonne);
      const utils = render(<>{scene.choix({
        m, choix: m.choix, fautes: [fausse.cle], choisir: jest.fn(), objet: scene.objets ?? 'bulle',
      })}</>);
      const tous = screen.getAllByRole('button');
      const barre = tous.find((b) => normaliser(b.textContent) === normaliser(fausse.libelle))
        ?? tous.find((b) => normaliser(b.textContent).includes(normaliser(fausse.libelle)));
      expect(barre).toBeDisabled();
      expect(barre).toHaveClass('est-fausse');
      utils.unmount();
    });
  });
});

describe('les données propres aux scènes', () => {
  test('le compteur de syllabes connaît chaque vers du module, et son décompte tombe juste', () => {
    syllabes.VERS.forEach(([vers, , n]) => {
      expect(decompteFidele(vers)).toBe(true);
      expect(compterDecompte(vers)).toBe(n);
    });
  });

  test('le compteur retrouve le vers de chaque question à compter ou à nommer', () => {
    manchesDe(syllabes, 'QUATRIEME')
      .filter((m) => m.consigne === 'compter' || m.consigne === 'nommer')
      .forEach((m) => expect(compterDecompte(versDe(m.question))).not.toBeNull());
  });

  test('« Si j’étais… » retrouve l’hypothèse et le système de chaque manche', () => {
    manchesDe(siJetais, 'TROISIEME').forEach((m) => {
      const a = analyser(m);
      expect(a).not.toBeNull();
      // Le verbe qui manquait est bien celui de la bonne réponse.
      const attendu = { principale: a.verbePr, 'apres-si': a.verbeSi }[m.consigne] ?? m.bonne;
      expect(attendu).toBe(m.bonne);
    });
  });

  test('la tour de « Thèse, argument ou exemple ? » met la phrase indiquée à l’étage de la bonne réponse', () => {
    manchesDe(these, 'TROISIEME').filter((m) => m.consigne === 'role').forEach((m) => {
      const view = render(<>{SCENES['these-argument-exemple'].question(m, true, { trouve: true })}</>);
      const indiques = screen.getAllByRole('listitem').filter((li) => li.getAttribute('aria-current') === 'true');
      expect(indiques).toHaveLength(1);
      expect(indiques[0]).toHaveClass(`sc-these-argument-exemple__etage--${m.bonne}`);
      view.unmount();
    });
  });

  test('la phrase sans son mot qui juge redevient neutre et lisible', () => {
    expect(sansLeMot('« Heureusement, personne n’a été blessé. »', 'Heureusement')).toBe('Personne n’a été blessé.');
    expect(sansLeMot('« Le maire a pris une décision absurde hier soir. »', 'absurde')).toBe('Le maire a pris une décision hier soir.');
    expect(sansLeMot('« Il est probablement malade. »', 'probablement')).toBe('Il est malade.');
  });
});
