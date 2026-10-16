/**
 * LA LOUPE AU DOIGT — Camara, le 11/10/2026 : « si le doigt sort de l'écran la
 * loupe remonte tout en haut… sur mobile c'est injouable », et « la loupe de
 * Où sur Terre est excellente, c'est comme ça qu'elle doit être ». Centrée sous
 * le doigt, dans l'image ; le doigt sort, elle disparaît ; relâcher dehors
 * n'accuse pas.
 */
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import SceneALoupe from '../components/jeux/bonus/histoire/SceneALoupe';

// L'image occupe 100 → 500 en x, 200 → 425 en y.
const RECT = {
  left: 100, top: 200, right: 500, bottom: 425, width: 400, height: 225, x: 100, y: 200,
};

// jsdom ne connaît pas PointerEvent : l'événement perd pointerType et passerait
// pour une souris. On pose les champs du doigt à la main.
function doigt(cadre, type, x, y) {
  const evenement = createEvent[type](cadre);
  Object.entries({ pointerType: 'touch', pointerId: 7, clientX: x, clientY: y, button: 0 })
    .forEach(([cle, valeur]) => Object.defineProperty(evenement, cle, { value: valeur }));
  return evenement;
}

function monter() {
  const onAccuser = jest.fn();
  render(<SceneALoupe src="scene.webp" description="Une agora" actif onAccuser={onAccuser} />);
  const cadre = screen.getByRole('application');
  cadre.getBoundingClientRect = () => RECT;
  // Le verre est décoratif (aria-hidden) : aucun rôle ne le désigne, on le cherche par sa classe.
  // eslint-disable-next-line testing-library/no-node-access
  const verre = () => cadre.querySelector('.hg-loupe__verre');
  const geste = (type, x, y) => fireEvent(cadre, doigt(cadre, type, x, y));
  return { onAccuser, verre, geste, cadre };
}

describe('la loupe au doigt', () => {
  it('se centre sous le doigt, dans l’image', () => {
    const { verre, geste, cadre } = monter();
    geste('pointerDown', 300, 312.5);
    expect(verre()).not.toBeNull();
    expect(verre().style.left).toBe('50%');
    expect(verre().style.top).toBe('50%');
    expect(verre().style.transform).toBe('translate(-50%, -50%)');
    // Le verre est DANS le cadre, qui le coupe à ses bords.
    expect(cadre.contains(verre())).toBe(true);
  });

  it('disparaît quand le doigt sort de l’image, au lieu de sauter en haut, et revient s’il rentre', () => {
    const { verre, geste } = monter();
    geste('pointerDown', 300, 300);
    [[50, 300], [600, 300], [300, 900], [0, 0]].forEach(([x, y]) => {
      geste('pointerMove', x, y);
      expect(verre()).toBeNull();
    });
    geste('pointerMove', 200, 250);
    expect(verre().style.left).toBe('25%');
  });

  it('relâché hors de l’image, n’accuse pas ; relâché dedans, accuse là où il est', () => {
    const { onAccuser, geste } = monter();
    geste('pointerDown', 300, 300);
    geste('pointerMove', 0, 0);
    geste('pointerUp', 0, 0);
    expect(onAccuser).not.toHaveBeenCalled();

    geste('pointerDown', 300, 300);
    geste('pointerUp', 400, 312.5);
    expect(onAccuser).toHaveBeenCalledWith(75, 50);
  });
});
