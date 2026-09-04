/**
 * LE BANDEAU D'INFORMATION.
 *
 * CE QUE CES TESTS PROTÈGENT
 * --------------------------
 * Un bandeau annonce une maintenance ou un incident : c'est le seul canal qui
 * atteint tout le monde en une seconde, y compris les visiteurs sans compte.
 *
 * IL NE SE FERME PAS, et c'est la règle que le premier test tient. Une croix
 * de fermeture ferait de l'affichage une option du visiteur : celui qui ferme
 * distraitement l'annonce d'une maintenance se présentera pendant la coupure
 * sans savoir pourquoi rien ne marche. Le bandeau s'éteint dans
 * l'administration, quand l'information n'est plus vraie, pour tout le monde
 * en même temps.
 *
 * Cette règle est fragile parce qu'elle est INVISIBLE : rien à l'écran ne dit
 * qu'une croix a été retirée volontairement, et elle reviendrait au premier
 * qui trouve le bandeau envahissant. D'où un test qui l'écrit.
 *
 * L'AUTRE DÉFAUT PROTÉGÉ est la bande vide : une barre de couleur sans texte
 * en haut du site se lit comme un défaut d'affichage, pas comme une annonce.
 * Le serveur refuse déjà un bandeau allumé sans message ; c'est la seconde
 * garde, du côté du navigateur.
 */

import { render, screen } from '@testing-library/react';
import BandeauInfo from '../components/BandeauInfo';

let mockMessage = null;

jest.mock('../lib/storage/modeTest', () => ({
  useBandeau: () => mockMessage,
}));

beforeEach(() => {
  mockMessage = null;
});

test('le bandeau ne propose AUCUN moyen de le fermer', () => {
  mockMessage = 'Maintenance dimanche de 8h à 10h.';

  render(<BandeauInfo />);

  // Aucun bouton, quel qu'en soit le libellé : c'est plus fort que de
  // chercher une croix précise, et ça résiste à un renommage.
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('le message s’affiche tel qu’il a été écrit', () => {
  mockMessage = 'Maintenance dimanche de 8h à 10h.';

  render(<BandeauInfo />);

  expect(screen.getByText('Maintenance dimanche de 8h à 10h.')).toBeInTheDocument();
});

test('sans message, rien ne s’affiche', () => {
  const { container } = render(<BandeauInfo />);

  expect(container).toBeEmptyDOMElement();
});

test('un message vide ne dessine pas une bande sans texte', () => {
  mockMessage = '';

  const { container } = render(<BandeauInfo />);

  expect(container).toBeEmptyDOMElement();
});

test('il est annoncé sans interrompre la lecture en cours', () => {
  // `status` et non `alert` : un lecteur d'écran doit le signaler quand il en
  // a l'occasion. Le bandeau informe, il n'y a rien à faire dans la seconde —
  // et une annonce qui coupe la phrase en cours est plus gênante qu'utile.
  mockMessage = 'Maintenance dimanche de 8h à 10h.';

  render(<BandeauInfo />);

  expect(screen.getByRole('status')).toBeInTheDocument();
});
