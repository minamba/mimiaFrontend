/**
 * UN OU DES ? — CHAQUE ÉTIQUETTE SE FAIT LIRE. Camara, le 21/09/2026 : « le
 * professeur de français ne lit pas les propositions ». Le haut-parleur fait
 * dire l'étiquette sans la choisir ; « fleurs » se dit comme « fleur » ; et
 * quand l'enfant a écouté les deux formes, Adrien lui fait remarquer que c'est
 * pareil — une seule fois par partie.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnOuDes from '../components/jeux/UnOuDes';
import { motADire, NOMS, serie } from '../lib/jeux/unOuDes';
import { repliquesUnOuDes, toutesLesRepliques } from '../lib/jeux/voix/repliques';

const mockDire = jest.fn();
jest.mock('../lib/jeux/voix/useVoixJeu', () => ({
  __esModule: true,
  default: () => ({
    dire: mockDire, parle: false, muet: false, reecouter: jest.fn(), basculerMuet: jest.fn(),
  }),
}));

const GRAINE = 2024;
const cles = (appel) => [appel].flat().map((r) => r.cle);

beforeEach(() => {
  mockDire.mockClear();
  jest.spyOn(Date, 'now').mockReturnValue(GRAINE);
});
afterEach(() => { jest.restoreAllMocks(); });

describe('ce qu’on entend', () => {
  it('le nom se dit sans son s : « fleurs » comme « fleur »', () => {
    expect(motADire('fleurs')).toEqual({ sorte: 'nom', mot: 'fleur' });
    expect(motADire('fleur')).toEqual({ sorte: 'nom', mot: 'fleur' });
    expect(repliquesUnOuDes.mot('fleurs')).toEqual(repliquesUnOuDes.mot('fleur'));
    expect(motADire('des')).toEqual({ sorte: 'petit-mot', mot: 'des' });
  });

  it('chaque mot du jeu a sa voix, chez Adrien', () => {
    const toutes = Object.values(toutesLesRepliques()).flat().map((r) => r.cle);
    ['un', 'une', 'des', ...NOMS.map((n) => n.nom)].forEach((m) => {
      expect(toutes).toContain(repliquesUnOuDes.mot(m).cle);
    });
    expect(toutes).toContain('unoudes/pareil');
  });
});

describe('à l’écran', () => {
  it('écouter une étiquette la fait dire, sans la choisir', async () => {
    const m = serie(GRAINE)[0];
    render(<UnOuDes onQuitter={jest.fn()} />);
    mockDire.mockClear();

    await userEvent.click(screen.getByRole('button', { name: `Écouter « ${m.petitsMots[0]} »` }));
    expect(cles(mockDire.mock.calls[0][0])).toEqual([repliquesUnOuDes.mot(m.petitsMots[0]).cle]);
    expect(screen.getByRole('button', { name: m.petitsMots[0] })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('button', { name: /C’est prêt/ })).not.toBeInTheDocument();
  });

  it('les deux formes écoutées : « c’est pareil », une seule fois par partie', async () => {
    const m = serie(GRAINE)[0];
    render(<UnOuDes onQuitter={jest.fn()} />);
    mockDire.mockClear();

    const [a, b] = m.formes;
    await userEvent.click(screen.getByRole('button', { name: `Écouter « ${a} »` }));
    await userEvent.click(screen.getByRole('button', { name: `Écouter « ${b} »` }));
    expect(cles(mockDire.mock.calls[1][0])).toEqual([repliquesUnOuDes.mot(b).cle, 'unoudes/pareil']);

    // Réécouter ne le redit pas.
    await userEvent.click(screen.getByRole('button', { name: `Écouter « ${a} »` }));
    expect(cles(mockDire.mock.calls[2][0])).toEqual([repliquesUnOuDes.mot(a).cle]);
  });
});
