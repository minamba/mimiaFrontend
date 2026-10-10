/**
 * LE DESSINATEUR DES QUESTIONS — Camara, le 09/10/2026 : « une boule animée
 * avec ses dimensions ». Chaque forme se dessine sans planter, ses cotes
 * s'affichent, et le validateur refuse ce qui n'est pas de la donnée.
 */
import { render } from '@testing-library/react';
import Visuel from '../components/jeux/Visuel';
import { erreursDuVisuel, valeur } from '../lib/jeux/visuels';

const SOLIDES = [
  { forme: 'boule', cotes: { rayon: '6 cm' } },
  { forme: 'cube', cotes: { cote: '4 cm' } },
  { forme: 'pave', cotes: { longueur: '5 cm', largeur: '3 cm', hauteur: '?' } },
  { forme: 'cylindre', cotes: { rayon: '2 m', hauteur: '5 m' } },
  { forme: 'cone', cotes: { rayon: '3 cm', hauteur: '4 cm' } },
  { forme: 'pyramide', cotes: { cote: '6 cm', hauteur: '9 cm' } },
  { forme: 'prisme', cotes: { base: '4 cm', hauteur: '3 cm', longueur: '10 cm' } },
  { forme: 'prisme', angleDroit: true, cotes: { base: '3 m', hauteur: '4 m', longueur: '8 m' } },
  { forme: 'boule', cotes: { diametre: '12 cm' } },
  { forme: 'cylindre', cotes: { diametre: '1,2 m', hauteur: '2 m' } },
  { forme: 'pave', cotes: { longueur: '4 m', largeur: '3 m', hauteur: '12 m', diagonale: '?' } },
  { forme: 'pyramide', cotes: { longueur: '6 cm', largeur: '4 cm', hauteur: '9 cm' } },
].map((s) => ({ type: 'solide', ...s }));

const FIGURES = [
  { forme: 'triangle-rectangle', cotes: { horizontal: '3 cm', vertical: '4 cm', hypotenuse: '?' }, noms: ['A', 'B', 'C'] },
  { forme: 'echelle', cotes: { vertical: '?', horizontal: '1,5 m', hypotenuse: '4 m' } },
  { forme: 'toboggan', cotes: { hypotenuse: '5 m' }, angle: { sommet: 'bas', valeur: '30°' } },
  { forme: 'triangle', cotes: { base: '8 cm', hauteur: '5 cm' } },
  { forme: 'triangle-quelconque', cotes: { AB: '5 cm', AC: '7 cm', BC: '?' }, angle: { A: '60°' } },
  { forme: 'rectangle', cotes: { longueur: '3 m', largeur: '2 m', diagonale: '?' } },
  { forme: 'rectangle', cotes: { longueur: '7 m', largeur: '4 m' } },
  { forme: 'carre', cotes: { aire: '49 cm²', cote: '?' } },
  { forme: 'parallelogramme', cotes: { base: '6 cm', hauteur: '3 cm' } },
  { forme: 'trapeze', cotes: { grandeBase: '9 cm', petiteBase: '5 cm', hauteur: '4 cm' } },
  { forme: 'disque', cotes: { rayon: '3 cm' } },
  { forme: 'angle', angle: { mesure: 70, valeur: '?' }, rapporteur: true },
  { forme: 'thales', cotes: { AM: '3 cm', AB: '9 cm', MN: '2 cm', BC: '?' } },
  { forme: 'thales', papillon: true, noms: ['O', 'R', 'S', 'T', 'U'], cotes: { AM: '2 cm', AB: '5 cm', MN: '?' } },
  { forme: 'angles-adjacents', angle: { mesure1: 35, mesure2: 55, valeur1: '35°', valeur2: '?' } },
  { forme: 'secante', angles: [{ point: 1, coin: 'se', valeur: '65°' }, { point: 2, coin: 'no', valeur: '?' }] },
  { forme: 'deux-carres', cotes: { aire1: '9 cm²', aire2: '4 cm²', cote1: '?', cote2: '?' } },
  { forme: 'disque', cotes: { rayon: '3 cm', diametre: '?' } },
  { forme: 'angle', angle: { mesure: 120, valeur: '2π/3' }, cotes: { u: '‖u‖ = 3', v: '‖v‖ = 2' } },
].map((f) => ({ type: 'figure', ...f }));

const COURBES = [
  { fenetre: { xmin: -3, xmax: 3, ymin: -2, ymax: 9 }, fonctions: [{ forme: 'poly', coefs: [1, 0, 1] }], points: [{ x: 0, y: 1, etiquette: 'S' }] },
  { fenetre: { xmin: 0, xmax: 4, ymin: 0, ymax: 20 }, fonctions: [{ forme: 'exp' }], tangente: { x: 0, y: 1, pente: 1 } },
  { fenetre: { xmin: 0, xmax: 4, ymin: -2, ymax: 2 }, fonctions: [{ forme: 'ln' }], aire: { fonction: 0, a: 1, b: 3 } },
  { fenetre: { xmin: 0, xmax: 6, ymin: 0, ymax: 40 }, suite: [1, 2, 4, 8, 16, 32] },
  { fenetre: { xmin: 0, xmax: 10, ymin: 0, ymax: 10 }, nuage: [[1, 2], [2, 3], [4, 5]], droite: { a: 0.8, b: 1 } },
  { fenetre: { xmin: -4, xmax: 4, ymin: -3, ymax: 3 }, fonctions: [{ forme: 'morceaux', points: [[-4, 1], [0, -2], [4, 2]] }, { forme: 'inverse' }] },
].map((c) => ({ type: 'courbe', ...c }));

describe('le dessinateur', () => {
  it.each([...SOLIDES, ...FIGURES, ...COURBES].map((v) => [`${v.type} ${v.forme ?? ''}`, v]))('%s : valide, et se dessine', (_, v) => {
    expect(erreursDuVisuel(v)).toEqual([]);
    const { container } = render(<Visuel visuel={v} />);
    expect(container.innerHTML).toContain('<svg');
    Object.values(v.cotes ?? {}).forEach((texte) => {
      expect(container.textContent).toContain(texte);
    });
  });

  it('sans visuel, rien', () => {
    const { container } = render(<Visuel visuel={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('le validateur refuse une fonction écrite en JavaScript, une fenêtre vide, une forme inconnue', () => {
    expect(erreursDuVisuel({ type: 'courbe', fenetre: { xmin: 0, xmax: 1, ymin: 0, ymax: 1 }, fonctions: [(x) => x] })).not.toEqual([]);
    expect(erreursDuVisuel({ type: 'courbe', fenetre: { xmin: 1, xmax: 1, ymin: 0, ymax: 1 } })).not.toEqual([]);
    expect(erreursDuVisuel({ type: 'solide', forme: 'tore', cotes: {} })).not.toEqual([]);
    expect(erreursDuVisuel({ type: 'solide', forme: 'boule', cotes: { rayon: 6 } })).not.toEqual([]);
  });

  it('les fonctions décrites en données se calculent', () => {
    expect(valeur({ forme: 'poly', coefs: [1, -3, 2] }, 2)).toBe(3);
    expect(valeur({ forme: 'affine', a: 2, b: -1 }, 3)).toBe(5);
    expect(valeur({ forme: 'ln' }, -1)).toBeNaN();
    expect(valeur({ forme: 'morceaux', points: [[0, 0], [2, 4]] }, 1)).toBe(2);
  });
});
