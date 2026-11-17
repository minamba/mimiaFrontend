/**
 * L'AVIS « SUR TÉLÉPHONE » (12/11/2026) : sur mobile, à l'arrivée sur les matières, une fois par visite, jamais par-dessus
 * le tutoriel.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import AvisMobile, { estUnTelephone } from '../components/AvisMobile';

const fenetre = ({ ua = 'Mozilla/5.0 (Windows NT 10.0)', tactile = false, largeur = 1280 } = {}) => ({
  navigator: { userAgent: ua },
  matchMedia: () => ({ matches: tactile }),
  innerWidth: largeur,
  screen: { width: largeur },
});

describe('un téléphone ?', () => {
  test('iPhone, Android mobile : oui', () => {
    expect(estUnTelephone(fenetre({ ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' }))).toBe(true);
    expect(estUnTelephone(fenetre({ ua: 'Mozilla/5.0 (Linux; Android 14) Mobile Safari' }))).toBe(true);
  });

  test('ordinateur : non ; tablette Android (sans « Mobile ») en grand écran : non', () => {
    expect(estUnTelephone(fenetre())).toBe(false);
    expect(estUnTelephone(fenetre({ ua: 'Mozilla/5.0 (Linux; Android 14; Tab)', tactile: true, largeur: 1024 }))).toBe(false);
  });

  test('écran tactile étroit qui se dit ordinateur : oui', () => {
    expect(estUnTelephone(fenetre({ tactile: true, largeur: 390 }))).toBe(true);
  });
});

describe('la fenêtre', () => {
  const uaOrigine = navigator.userAgent;
  const telephone = () => Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone)', configurable: true });

  beforeEach(() => { sessionStorage.clear(); telephone(); });
  afterEach(() => Object.defineProperty(window.navigator, 'userAgent', { value: uaOrigine, configurable: true }));

  test('s’affiche sur téléphone, et se ferme', () => {
    render(<AvisMobile />);
    expect(screen.getByRole('dialog')).toHaveTextContent('application mobile');
    fireEvent.click(screen.getByRole('button', { name: 'J’ai compris' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('une fois par visite', () => {
    const { unmount } = render(<AvisMobile />);
    fireEvent.click(screen.getByRole('button', { name: 'J’ai compris' }));
    unmount();
    render(<AvisMobile />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('jamais par-dessus le tutoriel, mais après lui', () => {
    const { rerender } = render(<AvisMobile masque />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<AvisMobile masque={false} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('rien sur ordinateur', () => {
    Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0)', configurable: true });
    render(<AvisMobile />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
