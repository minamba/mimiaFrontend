/**
 * LA JUSTIFICATION D'UN VERDICT, EN PARAGRAPHES.
 *
 * Relevé par Camara le 14/09/2026 : la revue du programme arrivait en un seul
 * pavé. Ces tests gardent ce qui la rend lisible, et ce qui ne doit pas
 * changer pour les justifications déjà enregistrées d'un seul bloc.
 */

import { render, screen } from '@testing-library/react';
import JustificationProfesseur from '../components/JustificationProfesseur';

const EN_PARAGRAPHES = [
  'Tu as bien avancé, mais tout le programme n’est pas encore tenu.',
  'Calcul littéral — développer et factoriser, c’est tenu : tu l’as fait seul.',
  'Fonctions — en cours : tu confonds encore image et antécédent.',
].join('\n\n');

test('une ligne vide sépare deux paragraphes, et le nom du domaine passe en gras', () => {
  const { container } = render(
    <JustificationProfesseur texte={EN_PARAGRAPHES} signature=" — Nora, le 14 septembre" />,
  );

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- on compte des paragraphes, qui n'ont pas de rôle propre.
  expect(container.querySelectorAll('p')).toHaveLength(3);

  expect(screen.getByText('Calcul littéral').tagName).toBe('STRONG');
  expect(screen.getByText('Fonctions').tagName).toBe('STRONG');

  // Le deux-points DANS le paragraphe fait partie du texte : il n'est pas perdu.
  expect(screen.getByText(/tu confonds encore image et antécédent/)).toBeInTheDocument();
});

test('la signature suit le dernier paragraphe, une seule fois', () => {
  render(<JustificationProfesseur texte={EN_PARAGRAPHES} signature=" — Nora, le 14 septembre" />);

  const signatures = screen.getAllByText('— Nora, le 14 septembre', { exact: false });
  expect(signatures).toHaveLength(1);
  expect(signatures[0].closest('p')).toHaveTextContent(/^Fonctions/);
});

test('une ancienne justification d’un seul bloc s’affiche telle quelle, sans gras', () => {
  const { container } = render(
    <JustificationProfesseur texte="Tu es presque prêt — la réciproque de Thalès reste à consolider." />,
  );

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- idem.
  expect(container.querySelectorAll('p')).toHaveLength(1);
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- aucun nom de domaine à mettre en gras.
  expect(container.querySelector('strong')).toBeNull();
});

test('un texte vide ne rend rien', () => {
  const { container } = render(<JustificationProfesseur texte="   " />);

  expect(container).toBeEmptyDOMElement();
});
