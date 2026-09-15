import { render, screen } from '@testing-library/react';
import LecteurAudio from '../components/LecteurAudio';

/**
 * LE LECTEUR AUDIO DE LA PAGE D'ACCUEIL.
 *
 * Il remplace les contrôles natifs, qui ne s'habillent pas de la même façon
 * d'un navigateur à l'autre. En les remplaçant, on prend la responsabilité de
 * ce qu'ils offraient gratuitement : un nom pour chaque commande, et le
 * pilotage au clavier. C'est ce que ces tests tiennent.
 */

test('chaque commande dit ce qu’elle fait', () => {
  render(<LecteurAudio src="extrait.mp3" libelle="un extrait en anglais" />);

  // Pas « bouton » ni « play » : ce que la commande fait, et sur quoi.
  expect(screen.getByRole('button', { name: 'Écouter un extrait en anglais' })).toBeTruthy();
  expect(screen.getByRole('slider', { name: 'Position dans un extrait en anglais' })).toBeTruthy();
});

test('la barre reste un vrai champ, donc utilisable au clavier', () => {
  render(<LecteurAudio src="extrait.mp3" libelle="un extrait" />);

  // Un `input[type=range]` apporte les flèches, Début et Fin sans une ligne
  // de code. Le jour où il deviendrait un `div`, tout cela disparaîtrait en
  // silence — d'où cette vérification.
  const barre = screen.getByRole('slider', { name: /Position dans/ });

  expect(barre.tagName).toBe('INPUT');
  expect(barre.type).toBe('range');
});

test('le son se règle et se coupe', () => {
  render(<LecteurAudio src="extrait.mp3" libelle="un extrait" />);

  // Ce que le lecteur natif offrait et qu'il fallait reprendre en le
  // remplaçant : un extrait s'écoute souvent dans une pièce partagée.
  expect(screen.getByRole('button', { name: 'Couper le son' })).toBeTruthy();

  const son = screen.getByRole('slider', { name: 'Niveau du son' });
  expect(son.type).toBe('range');
  expect(son.value).toBe('1');
});

test('une durée inconnue ne s’invente pas', () => {
  render(<LecteurAudio src="extrait.mp3" libelle="un extrait" />);

  // Aucun média n'est chargé ici : la durée est inconnue. Afficher « 0:00 »
  // annoncerait un extrait vide ; on écrit qu'on ne sait pas encore.
  expect(screen.getByText(/--:--/)).toBeTruthy();
});
