/**
 * LES SCÈNES DU GROUPE « LYCÉE, MATHS B » (09/10/2026) — voir
 * `components/jeux/scenes/groupes/lycee-maths-b.js`. Pour chaque jeu, chaque
 * classe, 25 graines et chaque manche :
 *   - la question se dessine avant et après la réponse, sans exception ;
 *   - son texte entier reste à l'écran ;
 *   - rien ne s'annonce comme un « statut » (l'écran commun en a déjà un) ;
 *   - des réponses jouées autrement restent des boutons à leur libellé, et un
 *     clic choisit la bonne clé ; une réponse fausse est désactivée.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses classes, ses attributs. */
import {
  cleanup, fireEvent, render, screen,
} from '@testing-library/react';
import SCENES from '../components/jeux/scenes/groupes/lycee-maths-b';
import * as limites from '../lib/jeux/lycee/limites-et-continuite';
import * as logarithme from '../lib/jeux/lycee/logarithme';
import * as primitives from '../lib/jeux/lycee/primitives-et-integrales';
import * as binomiale from '../lib/jeux/lycee/loi-binomiale';
import * as denombrement from '../lib/jeux/lycee/denombrement';
import * as espace from '../lib/jeux/lycee/geometrie-espace';
import * as convexite from '../lib/jeux/lycee/convexite';
import * as recurrence from '../lib/jeux/lycee/recurrence';
import * as evolutions from '../lib/jeux/lycee/les-evolutions';
import * as paraboles from '../lib/jeux/lycee/fonctions-et-paraboles';
import * as interets from '../lib/jeux/lycee/interets-et-pourcentages';
import * as proportions from '../lib/jeux/lycee/proportions-et-grandeurs';
import * as graphique from '../lib/jeux/lycee/lire-un-graphique';
import * as probabilites from '../lib/jeux/lycee/probabilites-pro';
import * as atelier from '../lib/jeux/lycee/geometrie-atelier';
import * as nuage from '../lib/jeux/lycee/ajuster-un-nuage';

const MODULES = [
  limites, logarithme, primitives, binomiale, denombrement, espace, convexite, recurrence,
  evolutions, paraboles, interets, proportions, graphique, probabilites, atelier, nuage,
];

const normaliser = (s) => String(s).replace(/\s+/g, ' ').trim();

/** Toutes les manches d'un module : chaque classe, 25 graines. */
const toutesLesManches = (module, classe) => Array.from({ length: 25 }, (_, g) => module.serie(g * 7919 + 13, classe)).flat();

afterEach(cleanup);

it('chaque jeu du groupe a sa scène, et rien que ceux-là', () => {
  expect(Object.keys(SCENES).sort()).toEqual(MODULES.map((m) => m.FAMILLE.cle).sort());
});

it('les formes de réponses sont préfixées par la clé du jeu', () => {
  const objets = Object.entries(SCENES).filter(([, s]) => s.objets).map(([cle, s]) => [s.objets, `sc-${cle}`]);
  objets.forEach(([objet, attendu]) => expect(objet).toBe(attendu));
});

it('au moins un tiers des jeux jouent leurs réponses autrement', () => {
  expect(Object.values(SCENES).filter((s) => s.choix).length * 3).toBeGreaterThanOrEqual(MODULES.length);
});

describe.each(MODULES.map((module) => [module.FAMILLE.cle, module]))('%s', (cle, module) => {
  const scene = SCENES[cle];

  it.each(module.CLASSES)('%s : chaque manche se dessine, avant et après la réponse, avec sa question entière', (classe) => {
    const manquantes = [];
    const statuts = [];
    toutesLesManches(module, classe).forEach((m) => {
      [[false, {}], [true, { trouve: true }]].forEach(([termine, extra]) => {
        const { container, unmount } = render(<>{scene.question(m, termine, extra)}</>);
        if (!normaliser(container.textContent).includes(normaliser(m.question))) manquantes.push(m.question);
        if (container.querySelector('[role="status"]')) statuts.push(m.question);
        unmount();
      });
    });
    expect(manquantes).toEqual([]);
    expect(statuts).toEqual([]);
  });
});

/* Les jeux qui jouent leurs réponses autrement (radeaux, bacs, dominos…). */
const AVEC_CHOIX = MODULES.filter((module) => SCENES[module.FAMILLE.cle].choix);

describe.each(AVEC_CHOIX.map((module) => [module.FAMILLE.cle, module]))('%s, ses réponses', (cle, module) => {
  const scene = SCENES[cle];

  it.each(module.CLASSES)('%s : chaque réponse est un bouton à son libellé, qui choisit sa clé', (classe) => {
    const ecarts = [];
    toutesLesManches(module, classe).forEach((m) => {
      const choisir = jest.fn();
      const { unmount } = render(<>{scene.choix({
        m, choix: m.choix, fautes: [], choisir, objet: 'gemme',
      })}</>);
      const boutons = screen.getAllByRole('button');
      if (boutons.length !== m.choix.length) ecarts.push(`${m.question} : ${boutons.length} boutons`);
      m.choix.forEach(({ cle: c, libelle }) => {
        const bouton = screen.getByRole('button', { name: String(libelle) });
        if (bouton.getAttribute('type') !== 'button' || bouton.disabled) ecarts.push(`${libelle} : mauvais bouton`);
        fireEvent.click(bouton);
        if (choisir.mock.calls[choisir.mock.calls.length - 1]?.[0] !== c) ecarts.push(`${libelle} : mauvaise clé`);
      });
      unmount();
    });
    expect(ecarts).toEqual([]);
  });

  it('une réponse fausse reste là, barrée et désactivée', () => {
    const m = module.serie(42, module.CLASSES[0])[0];
    const fausse = m.choix.find((c) => String(c.cle) !== String(m.bonne));
    const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
    const choisir = jest.fn();
    render(<>{scene.choix({
      m, choix: m.choix, fautes: [fausse.cle], choisir, objet: 'gemme',
    })}</>);
    const bouton = screen.getByRole('button', { name: String(fausse.libelle) });
    expect(bouton).toBeDisabled();
    expect(bouton.className).toMatch(/est-fausse/);
    fireEvent.click(screen.getByRole('button', { name: String(bonne.libelle) }));
    expect(choisir).toHaveBeenCalledWith(bonne.cle);
  });
});

/*
 * DANS LE VRAI ÉCRAN DU JEU : une réponse fausse nomme l'erreur (un seul
 * « statut » à l'écran), la bonne affiche l'explication et « Continuer ».
 */
describe('dans l’écran du jeu', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(MODULES.map((module) => [module.FAMILLE.cle, module]))('%s : une faute, puis la bonne réponse', (cle, module) => {
    // eslint-disable-next-line global-require
    const { ECRANS_COLLEGE } = require('../components/jeux/JeuxCollege');
    jest.spyOn(Date, 'now').mockReturnValue(2024);
    const niveau = module.CLASSES[0];
    const m = module.serie(2024, niveau)[0];
    const Jeu = ECRANS_COLLEGE[cle];
    const { container } = render(<Jeu onQuitter={jest.fn()} matiereCode={module.FAMILLE.matiereCode} niveau={niveau} />);
    const bonne = m.choix.find((c) => String(c.cle) === String(m.bonne));
    const fausse = m.choix.find((c) => String(c.cle) !== String(m.bonne));
    fireEvent.click(screen.getByRole('button', { name: String(fausse.libelle) }));
    expect(screen.getByRole('status')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: String(bonne.libelle) }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
    expect(container.querySelector(`.sc-${cle}__explication`)).not.toBeNull();
  });
});
