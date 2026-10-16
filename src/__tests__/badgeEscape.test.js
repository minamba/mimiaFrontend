/**
 * LE BADGE DES ESCAPE GAMES — Camara, le 11/10/2026 : « un badge indiquant que
 * le jeu est un escape game », sur tous les escape games, et seulement sur eux.
 */
import { render, screen, within } from '@testing-library/react';
import JeuxEleve from '../components/JeuxEleve';
import { JEUX, selonLaClasse } from '../lib/jeux/catalogue';
import { MODULES_COLLEGE } from '../lib/jeux/college/index.js';
import { MODULES_LYCEE } from '../lib/jeux/lycee/index.js';

const ETAT = { eleves: { liste: [] } };

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (choisir) => choisir(ETAT),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
  useParams: () => ({ eleveId: '24' }),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams('')],
}));

// Un enfant de 3e, connecté avec son code.
jest.mock('../lib/storage/sessionEleve', () => ({
  sessionEleve: () => ({ jeton: 'x', eleveId: 24, prenom: 'Sami', niveau: '3e', niveauCode: 'TROISIEME', cycle: 'College' }),
}));

jest.mock('../lib/jeux/voix/useVoixJeu', () => () => ({
  dire: () => {}, couper: () => {}, muet: false, basculerMuet: () => {}, relire: () => {},
}));

const ESCAPES = new Set([...MODULES_COLLEGE, ...MODULES_LYCEE].filter((m) => m.ESCAPE).map((m) => m.FAMILLE.cle));

describe('le drapeau escape du catalogue', () => {
  it('marque chaque escape game, à chacune de ses classes, et aucun autre jeu', () => {
    const marques = new Set(JEUX.filter((j) => j.escape).map((j) => j.cle));
    expect(marques).toEqual(ESCAPES);
    JEUX.filter((j) => ESCAPES.has(j.cle)).forEach((j) => j.niveaux.forEach((n) => {
      expect(selonLaClasse(j, n).escape).toBe(true);
    }));
  });
});

describe('le badge sur la carte', () => {
  it('apparaît sur les six escape games de la 3e, et sur eux seuls', () => {
    render(<JeuxEleve />);
    const cartes = screen.getAllByRole('button').filter((b) => b.classList.contains('jeu-carte'));
    const avecBadge = cartes.filter((c) => within(c).queryByText('Escape game'));
    const attendues = cartes.filter((c) => ESCAPES.has(c.dataset.jeu));
    expect(attendues).toHaveLength(6);
    expect(avecBadge).toEqual(attendues);
  });
});
