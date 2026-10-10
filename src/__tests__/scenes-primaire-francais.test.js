/**
 * LES SCÈNES DES JEUX DE FRANÇAIS DU CM1 ET DU CM2 (09/10/2026) — voir
 * `components/jeux/scenes/primaire-francais/`. Pour chaque jeu, chaque classe,
 * 25 graines : la scène se dessine avant et après la réponse sans erreur, le
 * texte entier de la question reste à l'écran, rien n'est un bouton ni un
 * « status » dans la question (l'écran commun les compte), et les réponses
 * jouées autrement restent des boutons qui portent leur libellé.
 */
/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   une scène se vérifie sur son dessin : son texte, ses classes, ses attributs. */
import {
  act, cleanup, fireEvent, render, screen, within,
} from '@testing-library/react';
import { SCENES } from '../components/jeux/scenes/primaire-francais';
import { marqueDe } from '../components/jeux/scenes/primaire-francais/Temps';
import * as accords from '../lib/jeux/accordsCM1';
import * as attribut from '../lib/jeux/attributCM2';
import * as image from '../lib/jeux/commeUneImage';
import * as sens from '../lib/jeux/sensFigureCM2';
import * as complementsCM1 from '../lib/jeux/complementsCM1';
import * as complementsCM2 from '../lib/jeux/complementsCM2';
import * as homophonesCM1 from '../lib/jeux/homophonesCM1';
import * as homophonesCM2 from '../lib/jeux/homophonesCM2';
import * as liaison from '../lib/jeux/motsDeLiaison';
import * as passe from '../lib/jeux/passeComposeCM1';
import * as participe from '../lib/jeux/participeAvoirCM2';
import * as phrasesCM1 from '../lib/jeux/phrasesCM1';
import * as phrasesCM2 from '../lib/jeux/phrasesCM2';
import * as genres from '../lib/jeux/poemeTheatreRecit';
import * as narrateur from '../lib/jeux/narrateurCM2';
import * as pronom from '../lib/jeux/aQuiLePronom';
import * as tempsCM1 from '../lib/jeux/tempsCM1';
import * as tempsCM2 from '../lib/jeux/tempsCM2';
import * as vocabulaireCM1 from '../lib/jeux/vocabulaireCM1';
import * as vocabulaireCM2 from '../lib/jeux/vocabulaireCM2';

/** [clé de la scène, [module, classe]…] — un écran sert parfois le CM1 et le CM2. */
const JEUX = [
  ['a-qui-le-pronom', [[pronom, 'CM1']]],
  ['accords-cm1', [[accords, 'CM1'], [attribut, 'CM2']]],
  ['comme-une-image', [[image, 'CM1'], [sens, 'CM2']]],
  ['complements-cm1', [[complementsCM1, 'CM1'], [complementsCM2, 'CM2']]],
  ['homophones-cm1', [[homophonesCM1, 'CM1'], [homophonesCM2, 'CM2']]],
  ['mots-de-liaison', [[liaison, 'CM1']]],
  ['passe-compose-cm1', [[passe, 'CM1'], [participe, 'CM2']]],
  ['phrases-cm1', [[phrasesCM1, 'CM1'], [phrasesCM2, 'CM2']]],
  ['poeme-theatre-recit', [[genres, 'CM1'], [narrateur, 'CM2']]],
  ['temps-cm1', [[tempsCM1, 'CM1'], [tempsCM2, 'CM2']]],
  ['vocabulaire-cm1', [[vocabulaireCM1, 'CM1'], [vocabulaireCM2, 'CM2']]],
];

const normaliser = (t) => String(t).replace(/\s+/g, ' ').trim();

/** Toutes les manches de 25 parties, sans les doublons. */
function manches(module, classe) {
  const vues = new Map();
  for (let g = 0; g < 25; g += 1) {
    module.serie(g * 7919 + 13, classe).forEach((m) => vues.set(JSON.stringify(m), m));
  }
  return [...vues.values()];
}

afterEach(cleanup);

// jsdom n'a pas toujours `PointerEvent` : sans lui, les coordonnées du geste se perdent.
beforeAll(() => {
  if (!window.PointerEvent) {
    window.PointerEvent = class PointerEvent extends window.MouseEvent {
      constructor(type, init = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    };
  }
});

describe('chaque jeu de français du primaire a sa scène', () => {
  it('les onze écrans sont branchés', () => {
    expect(Object.keys(SCENES).sort()).toEqual(JEUX.map(([cle]) => cle).sort());
  });

  it('au moins un tiers des jeux joue ses réponses autrement', () => {
    const autrement = Object.values(SCENES).filter((s) => typeof s.choix === 'function');
    expect(autrement.length).toBeGreaterThanOrEqual(Math.ceil(JEUX.length / 3));
  });
});

describe.each(JEUX)('%s', (cle, modules) => {
  const scene = SCENES[cle];

  it.each(modules.map(([module, classe]) => [classe, module]))('%s : la question, avant et après la réponse', (classe, module) => {
    manches(module, classe).forEach((m) => {
      const texte = normaliser(String(m.question).replace(/[[\]]/g, ''));
      [false, true].forEach((termine) => {
        const { container, unmount } = render(<>{scene.question(m, termine, termine ? { trouve: true } : {})}</>);
        expect(normaliser(container.textContent)).toContain(texte);
        // L'écran commun compte ses boutons et son « status » : la question n'en a pas.
        expect(container.querySelector('button')).toBeNull();
        expect(container.querySelector('[role="status"]')).toBeNull();
        unmount();
      });
      if (scene.apres) render(<>{scene.apres(m)}</>);
      cleanup();
    });
  });

  if (scene.choix) {
    it.each(modules.map(([module, classe]) => [classe, module]))('%s : chaque réponse est un bouton qui porte son libellé', (classe, module) => {
      manches(module, classe).forEach((m) => {
        const choisir = jest.fn();
        render(<>{scene.choix({
          m, choix: m.choix, fautes: [], choisir, objet: 'bulle',
        })}</>);
        expect(screen.getAllByRole('button')).toHaveLength(m.choix.length);
        m.choix.forEach((c) => {
          const bouton = screen.getByRole('button', { name: String(c.libelle) });
          fireEvent.click(bouton);
          expect(choisir).toHaveBeenLastCalledWith(c.cle);
        });
        cleanup();

        // Une réponse fausse reste là, barrée et éteinte.
        const faute = m.choix[0].cle;
        render(<>{scene.choix({
          m, choix: m.choix, fautes: [faute], choisir: jest.fn(), objet: 'bulle',
        })}</>);
        const barre = screen.getByRole('button', { name: String(m.choix[0].libelle) });
        expect(barre).toBeDisabled();
        expect(barre.className).toMatch(/est-fausse/);
        cleanup();
      });
    });
  }
});

describe('les mécaniques', () => {
  it('glisser une étiquette sur le trou, c’est répondre ; la lâcher ailleurs, non', () => {
    const m = accords.serie(13, 'CM1')[0];
    const choisir = jest.fn();
    const scene = SCENES['accords-cm1'];
    render(
      <div className="jeu">
        {scene.question(m, false, {})}
        {scene.choix({
          m, choix: m.choix, fautes: [], choisir, objet: 'bulle',
        })}
      </div>,
    );
    const cible = document.querySelector('.sc-accords-cm1__cible');
    cible.getBoundingClientRect = () => ({
      left: 100, right: 160, top: 100, bottom: 140, width: 60, height: 40,
    });
    const bouton = screen.getByRole('button', { name: m.choix[1].libelle });
    const geste = (x, y) => {
      fireEvent.pointerDown(bouton, {
        pointerId: 1, button: 0, clientX: 0, clientY: 0,
      });
      fireEvent.pointerMove(bouton, { pointerId: 1, clientX: x, clientY: y });
      fireEvent.pointerUp(bouton, { pointerId: 1, clientX: x, clientY: y });
      fireEvent.click(bouton);
    };
    geste(400, 400);
    expect(choisir).not.toHaveBeenCalled();
    geste(120, 120);
    expect(choisir).toHaveBeenCalledTimes(1);
    expect(choisir).toHaveBeenCalledWith(m.choix[1].cle);
  });

  it('le cadran : l’aiguille vise la forme survolée', () => {
    const m = tempsCM1.serie(13, 'CM1')[0];
    const { container } = render(<>{SCENES['temps-cm1'].choix({
      m, choix: m.choix, fautes: [], choisir: jest.fn(), objet: 'bulle',
    })}</>);
    const aiguille = container.querySelector('.sc-temps-cm1__aiguille');
    expect(aiguille.className).toMatch(/est-libre/);
    fireEvent.mouseEnter(screen.getByRole('button', { name: m.choix[0].libelle }));
    expect(aiguille.className).not.toMatch(/est-libre/);
  });

  it('les temps : la marque allumée est la bonne', () => {
    expect(marqueDe('ils chantaient', 'imparfait').slice(0, 3)).toEqual(['ils chant', 'aient', '']);
    expect(marqueDe('il ira', 'futur').slice(0, 3)).toEqual(['il i', 'ra', '']);
    expect(marqueDe('ils sont allés', 'passe-compose')).toEqual(['ils ', 'sont', ' allés', 'auxiliaire au présent']);
    expect(marqueDe('il chanterait', 'conditionnel')[1]).toBe('rait');
    expect(marqueDe('il chante', 'present')).toBeNull();
  });

  it('simple ou complexe : les verbes conjugués s’allument un par un, après la réponse seulement', () => {
    jest.useFakeTimers();
    const m = phrasesCM2.serie(13, 'CM2').find((x) => x.question === 'Elle rit, il chante, nous dansons.')
      ?? { consigne: 'compter', question: 'Elle rit, il chante, nous dansons.', bonne: 'complexe', choix: [] };
    const { container, rerender } = render(<>{SCENES['phrases-cm1'].question(m, false, {})}</>);
    expect(container.querySelectorAll('.est-allume')).toHaveLength(0);
    rerender(<>{SCENES['phrases-cm1'].question(m, true, { trouve: true })}</>);
    act(() => { jest.advanceTimersByTime(600); });
    expect(container.querySelectorAll('.est-allume')).toHaveLength(1);
    // Un pas à la fois : chaque verbe allumé programme le suivant.
    for (let k = 0; k < 4; k += 1) act(() => { jest.advanceTimersByTime(800); });
    expect(container.querySelectorAll('.est-allume')).toHaveLength(3);
    expect(within(container).getByText(/3 verbes conjugués/)).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('le pronom : on remplace, on relit — et la réponse ne se montre pas avant', () => {
    // La manche du renard et du corbeau, faite comme `serie` la fait.
    const [texte, bonne, autres] = pronom.TEXTES[0];
    const m = {
      consigne: 'reprise', texte, question: texte.replace(/[[\]]/g, ''), bonne, choix: [bonne, ...autres].map((c) => ({ cle: c, libelle: c })),
    };
    const { container, rerender } = render(<>{SCENES['a-qui-le-pronom'].question(m, false, {})}</>);
    expect(container.querySelector('.est-bonne')).toBeNull();
    expect(container.querySelector('mark.surligne')).not.toBeNull();
    rerender(<>{SCENES['a-qui-le-pronom'].question(m, true, { trouve: true })}</>);
    expect(container.querySelector('.est-bonne').textContent).toBe('corbeau');
    expect(container.textContent).toContain('Le corbeau tenait un fromage dans son bec.');
  });

  it('le trou garde ses tirets dans le texte, même rempli', () => {
    const m = homophonesCM1.serie(13, 'CM1')[0];
    const { container } = render(<>{SCENES['homophones-cm1'].question(m, true, { trouve: true })}</>);
    const trou = container.querySelector('.sc-primaire-francais__trou');
    expect(trou.getAttribute('data-mot')).toBe(m.bonne);
    expect(trou.textContent).toBe('___');
  });
});
