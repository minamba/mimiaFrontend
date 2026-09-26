/**
 * LA FIN DE PARTIE COMMUNE AUX VINGT-TROIS JEUX — Camara, le 26/09.
 *
 * CE QUE CES TESTS PROTÈGENT
 *   1. LES ÉTOILES NE DESCENDENT JAMAIS À ZÉRO : finir une partie vaut déjà
 *      une étoile. Un écran vide d'étoiles dirait « tu as échoué » à l'enfant
 *      qui a le plus besoin de revenir.
 *   2. LES DEUX PORTES — rejouer et revenir aux jeux — restent là.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FinDePartie, { etoilesDuScore } from '../components/jeux/FinDePartie';

jest.mock('../lib/storage/sessionEleve', () => ({ sessionEleve: () => null }));

const fin = (props) => render(
  <FinDePartie score={5} total={8} mot="C’est de mieux en mieux !" onRejouer={() => {}} onQuitter={() => {}} {...props} />,
);

describe('les étoiles', () => {
  test('jamais zéro, même sans une bonne réponse', () => {
    expect(etoilesDuScore(0, 10)).toBe(1);
    expect(etoilesDuScore(2, 10)).toBe(1);
  });

  test('deux à partir de six sur dix, trois à partir de neuf', () => {
    expect(etoilesDuScore(6, 10)).toBe(2);
    expect(etoilesDuScore(8, 10)).toBe(2);
    expect(etoilesDuScore(9, 10)).toBe(3);
    expect(etoilesDuScore(10, 10)).toBe(3);
  });

  test('elles s’annoncent à qui ne voit pas l’écran', () => {
    fin({ score: 10, total: 10 });
    expect(screen.getByRole('img', { name: '3 étoiles sur 3' })).toBeInTheDocument();
  });
});

describe('l’écran', () => {
  test('le score, la phrase du jeu, et « Parfait ! » au sans-faute', () => {
    fin({ score: 10, total: 10 });

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/de mieux en mieux/i)).toBeInTheDocument();
    expect(screen.getByText('Parfait !', { selector: '.choix-mode__question-texte' })).toBeInTheDocument();
  });

  test('les deux portes', async () => {
    const onRejouer = jest.fn();
    const onQuitter = jest.fn();
    fin({ onRejouer, onQuitter });

    await userEvent.click(screen.getByRole('button', { name: /rejouer/i }));
    expect(onRejouer).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: /revenir aux jeux/i }));
    expect(onQuitter).toHaveBeenCalled();
  });
});
