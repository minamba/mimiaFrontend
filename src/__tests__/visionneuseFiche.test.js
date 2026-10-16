import { fireEvent, render, screen } from '@testing-library/react';
import Visionneuse from '../components/mesFiches/Visionneuse';
import { EXEMPLES_FICHES } from '../lib/mesFiches/exemples';

/*
 * LA FICHE EN GRAND — Camara, le 16/10/2026 : « un bouton suivant /
 * précédent pour passer d'une fiche à l'autre » sans fermer la fenêtre.
 */
const fiche = EXEMPLES_FICHES[0];

// jsdom n'a pas d'événement de pointeur : sans lui, ni position ni type de doigt.
if (typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = class extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId;
      this.pointerType = init.pointerType;
    }
  };
}

describe('la visionneuse des fiches', () => {
  afterEach(() => {
    document.documentElement.classList.remove('fdr-grand');
    document.body.style.overflow = '';
  });

  it('passe à la fiche suivante ou précédente, aux boutons et au clavier', () => {
    const precedente = jest.fn();
    const suivante = jest.fn();
    render(
      <Visionneuse
        fiche={fiche}
        position={{ rang: 2, total: 4 }}
        onPrecedente={precedente}
        onSuivante={suivante}
        onFermer={() => {}}
      />,
    );

    expect(screen.getByText('2 / 4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Suivante/ }));
    fireEvent.click(screen.getByRole('button', { name: /Précédente/ }));
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(suivante).toHaveBeenCalledTimes(2);
    expect(precedente).toHaveBeenCalledTimes(2);
  });

  it('au bout de la liste, le bouton est grisé et la flèche du clavier ne fait rien', () => {
    render(
      <Visionneuse fiche={fiche} position={{ rang: 4, total: 4 }} onPrecedente={jest.fn()} onSuivante={null} onFermer={() => {}} />,
    );

    expect(screen.getByRole('button', { name: /Suivante/ })).toBeDisabled();
    expect(() => fireEvent.keyDown(document, { key: 'ArrowRight' })).not.toThrow();
  });

  it('vue en entier, un geste vif de côté passe à la voisine ; zoomée, le doigt la déplace', () => {
    const precedente = jest.fn();
    const suivante = jest.fn();
    render(
      <Visionneuse fiche={fiche} position={{ rang: 2, total: 4 }} onPrecedente={precedente} onSuivante={suivante} onFermer={() => {}} />,
    );
    // Le geste part de la fiche elle-même : il remonte jusqu'à la scène.
    const scene = screen.getByRole('heading', { level: 2, name: fiche.titre });
    const glisser = (de, a, dy = 0) => {
      fireEvent.pointerDown(scene, { pointerId: 1, pointerType: 'touch', clientX: de, clientY: 300 });
      fireEvent.pointerMove(scene, { pointerId: 1, pointerType: 'touch', clientX: a, clientY: 300 + dy });
      fireEvent.pointerUp(scene, { pointerId: 1, pointerType: 'touch', clientX: a, clientY: 300 + dy });
    };

    glisser(300, 120);
    expect(suivante).toHaveBeenCalledTimes(1);
    glisser(100, 300);
    expect(precedente).toHaveBeenCalledTimes(1);
    // Surtout vertical : on déplaçait la fiche.
    glisser(300, 220, 200);
    expect(suivante).toHaveBeenCalledTimes(1);

    // Zoomée : le même geste la déplace, sans changer de fiche.
    fireEvent.click(screen.getByRole('button', { name: 'Zoomer' }));
    glisser(300, 120);
    expect(suivante).toHaveBeenCalledTimes(1);
  });

  it('une seule fiche : pas de navigation', () => {
    render(<Visionneuse fiche={fiche} position={{ rang: 1, total: 1 }} onFermer={() => {}} />);
    expect(screen.queryByRole('navigation', { name: 'Fiches' })).not.toBeInTheDocument();
  });

  it('rend la page à la fermeture, même après avoir changé de fiche', () => {
    document.body.style.overflow = 'auto';
    const { rerender, unmount } = render(
      <Visionneuse fiche={fiche} position={{ rang: 1, total: 2 }} onSuivante={() => {}} onFermer={() => {}} />,
    );
    expect(document.body.style.overflow).toBe('hidden');

    // Le parent rend de nouveaux gestes à chaque fiche : la page doit rester gelée, puis être rendue.
    rerender(
      <Visionneuse fiche={EXEMPLES_FICHES[1]} position={{ rang: 2, total: 2 }} onPrecedente={() => {}} onFermer={() => {}} />,
    );
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('auto');
    expect(document.documentElement).not.toHaveClass('fdr-grand');
  });
});
