import { render, screen } from '@testing-library/react';
import { LegendeErreurs, ContenuTableau } from '../components/ComparaisonDictee';

/**
 * LA LÉGENDE DES ERREURS — voulue par Camara le 11/09/2026 : un enfant doit
 * comprendre seul où est son erreur et où est la correction.
 */

describe('LegendeErreurs', () => {
  test('explique la copie, la dictée et le numéro qui les relie', () => {
    render(<LegendeErreurs variante="feuille" />);

    expect(screen.getByText('Comment lire tes erreurs')).toBeTruthy();
    expect(screen.getByText(/ce que tu as écrit/i)).toBeTruthy();
    expect(screen.getByText(/ce qu’il fallait écrire/i)).toBeTruthy();
    expect(screen.getByText(/même numéro, même erreur/i)).toBeTruthy();
  });

  test('les exemples sont dits exemples : ils ne viennent pas de sa dictée', () => {
    render(<LegendeErreurs variante="feuille" trous />);
    expect(screen.getAllByText('Exemple')).toHaveLength(4);
  });

  test('le signe ‸ ne s\'explique que s\'il y en a un', () => {
    const { rerender } = render(<LegendeErreurs variante="feuille" />);
    expect(screen.queryByText(/mot oublié/)).toBeNull();

    rerender(<LegendeErreurs variante="feuille" trous />);
    expect(screen.getByText(/mot oublié/)).toBeTruthy();
  });
});

describe('le tableau', () => {
  test('en séance, pas de légende : le professeur explique les badges', () => {
    // Décidé par Camara le 11/09/2026 — la légende reste dans « Mes dictées ».
    const { container } = render(
      <ContenuTableau contenu={'La dictée\nLe chat dort.\n\nTa copie\nle chat dor'} />,
    );

    expect(screen.queryByText('Comment lire tes erreurs')).toBeNull();

    // Les badges, eux, sont bien là.
    expect(container.querySelector('.compare__badge')).toBeTruthy();
  });

  test('un tableau ordinaire reste tel quel, sans légende', () => {
    render(<ContenuTableau contenu="3 + 4 = 7" />);
    expect(screen.getByText('3 + 4 = 7')).toBeTruthy();
    expect(screen.queryByText('Comment lire tes erreurs')).toBeNull();
  });
});
