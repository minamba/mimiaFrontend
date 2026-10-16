/**
 * LA PAGINATION — Camara, le 12/10/2026 : dix éléments par page, sur les
 * rapports d'orientation et les sections de la fiche (sauf les compétences).
 */

import { fireEvent, render, renderHook, act, screen } from '@testing-library/react';
import Pagination, { usePage } from '../components/Pagination';
import ProjetOrientationFiche from '../components/ProjetOrientationFiche';

const liste = (n) => Array.from({ length: n }, (_, i) => i + 1);

describe('usePage', () => {
  test('dix par page, et la dernière page porte le reste', () => {
    const { result } = renderHook(() => usePage(liste(23)));
    expect(result.current.pages).toBe(3);
    expect(result.current.visibles).toEqual(liste(10));

    act(() => result.current.allerA(2));
    expect(result.current.visibles).toEqual([21, 22, 23]);
  });

  test('une liste vide tient en une page', () => {
    const { result } = renderHook(() => usePage(undefined));
    expect(result.current.pages).toBe(1);
    expect(result.current.visibles).toEqual([]);
  });
});

describe('Pagination', () => {
  test('rien à paginer : rien d’affiché', () => {
    render(<Pagination page={0} pages={1} onPage={() => {}} />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('la page courante est allumée, les flèches suivent', () => {
    const onPage = jest.fn();
    render(<Pagination page={0} pages={3} onPage={onPage} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Précédent/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Suivant/ }));
    expect(onPage).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPage).toHaveBeenCalledWith(2);
  });

  test('beaucoup de pages : la première, la dernière, les voisines', () => {
    render(<Pagination page={9} pages={20} onPage={() => {}} />);
    ['Page 1', 'Page 9', 'Page 10', 'Page 11', 'Page 20'].forEach((nom) => {
      expect(screen.getByRole('button', { name: nom })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: 'Page 5' })).not.toBeInTheDocument();
  });
});

test('les séances avec Maëlle, dix par page sur la fiche', () => {
  const observations = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    dateCreation: new Date(Date.UTC(2026, 9, 1 + i, 10)).toISOString(),
    travaille: `séance ${i + 1}`,
    remarque: `observation ${i + 1}`,
  }));

  render(<ProjetOrientationFiche projet={null} rapports={[]} observations={observations} />);

  expect(screen.getByText('Ses séances avec Maëlle (12)')).toBeInTheDocument();
  expect(screen.getByText('observation 12')).toBeInTheDocument();
  expect(screen.queryByText('observation 1')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
  expect(screen.getByText('observation 1')).toBeInTheDocument();
});
