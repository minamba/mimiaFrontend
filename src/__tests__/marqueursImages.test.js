import { retirerMarqueurImage } from '../lib/storage/marqueursImages';

test('retirer une image efface son marqueur et fait reculer les suivants', () => {
  const texte = 'Début [image:1] milieu [image:2] fin [image:3]';

  expect(retirerMarqueurImage(texte, 2)).toBe('Début [image:1] milieu  fin [image:2]');
});

test('les images placées avant restent à leur rang', () => {
  expect(retirerMarqueurImage('[image:1][image:2]', 3)).toBe('[image:1][image:2]');
});

test('un marqueur répété est traité partout', () => {
  expect(retirerMarqueurImage('[image:2] puis [image:2]', 1)).toBe('[image:1] puis [image:1]');
});

test('un texte vide reste vide', () => {
  expect(retirerMarqueurImage('', 1)).toBe('');
  expect(retirerMarqueurImage(undefined, 1)).toBe('');
});
