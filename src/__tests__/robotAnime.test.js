/**
 * LE ROBOT REJOUE LE PROGRAMME TOUCHÉ — Camara, le 22/09/2026 : « montrer le
 * chemin qu'on a choisi et faire déplacer le robot case par case ». Un
 * programme faux finit sur une croix ; le bon allume l'étoile.
 */

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Robot, { chemin } from '../components/jeux/Robot';
import { serie } from '../lib/jeux/robot';

jest.mock('../lib/jeux/voix/useVoixJeu', () => ({
  __esModule: true,
  default: () => ({
    dire: jest.fn(), parle: false, muet: false, reecouter: jest.fn(), basculerMuet: jest.fn(),
  }),
}));

const GRAINE = 2024;

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Date, 'now').mockReturnValue(GRAINE);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('le chemin du robot', () => {
  it('suit les flèches case par case', () => {
    expect(chemin([0, 0], '→→↓').cases).toEqual([[0, 0], [1, 0], [2, 0], [2, 1]]);
  });

  it('déplie la boucle du CM2', () => {
    expect(chemin([0, 5], '2|→↑').cases).toEqual([[0, 5], [1, 5], [1, 4], [2, 4], [2, 3]]);
  });

  it('s’arrête au bord plutôt que de sortir', () => {
    const t = chemin([0, 0], '↑→');
    expect(t.sorti).toBe(true);
    expect(t.cases).toEqual([[0, 0]]);
  });
});

describe('à l’écran', () => {
  const pasFinis = (m, programme) => act(() => {
    jest.advanceTimersByTime(500 * (chemin(m.depart, programme).cases.length + 1));
  });

  it('un programme faux : le robot le rejoue et s’arrête sur une croix', async () => {
    const m = serie(GRAINE)[0];
    const { container } = render(<Robot onQuitter={jest.fn()} niveau="CM1" />);
    const faux = m.choix.find((c) => c.cle !== m.bonne);

    userEvent.click(screen.getByRole('button', { name: faux.libelle }));
    pasFinis(m, faux.cle);
    expect(container.querySelector('.robot__croix')).toBeInTheDocument();
    expect(container.querySelector('.robot__gagne')).not.toBeInTheDocument();
  });

  it('le bon programme : le robot arrive sur l’étoile, qui s’allume', async () => {
    const m = serie(GRAINE)[0];
    const { container } = render(<Robot onQuitter={jest.fn()} niveau="CM1" />);
    const bon = m.choix.find((c) => c.cle === m.bonne);

    userEvent.click(screen.getByRole('button', { name: bon.libelle }));
    pasFinis(m, bon.cle);
    expect(container.querySelector('.robot__gagne')).toBeInTheDocument();
    expect(container.querySelector('.robot__croix')).not.toBeInTheDocument();
  });
});
