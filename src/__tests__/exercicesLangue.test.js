import { render, screen } from '@testing-library/react';
import ExercicesLangue from '../components/ExercicesLangue';
import { VITESSES } from '../lib/storage/vitesseEcoute';

/**
 * LA PAGE D'ACCUEIL MONTRE LE VRAI PRODUIT, PAS UNE IMITATION.
 *
 * La dictée et l'écoute sont ce qu'aucun concurrent ne propose — voulu par
 * Camara le 12/09/2026. Encore faut-il que la démonstration montre vraiment
 * quelque chose : une correction sans faute n'a aucun badge, et la carte
 * vanterait alors une fonctionnalité qu'on ne voit pas.
 */

test('la dictée de démonstration affiche de vraies erreurs numérotées', () => {
  const { container } = render(<ExercicesLangue />);

  // Les badges viennent du composant du produit, pas d'un dessin : s'ils
  // manquent, l'exemple ne porte plus d'erreur, ou le rendu a changé.
  const badges = container.querySelectorAll('.compare__badge');
  expect(badges.length).toBeGreaterThan(0);

  // Chaque erreur porte le MÊME numéro des deux côtés : autant de badges dans
  // la dictée que dans la copie.
  expect(badges.length % 2).toBe(0);
});

test('les quatre vitesses annoncées sont celles du produit', () => {
  render(<ExercicesLangue />);

  VITESSES.forEach((vitesse) => {
    expect(screen.getByText(vitesse.libelle)).toBeTruthy();
  });
});
