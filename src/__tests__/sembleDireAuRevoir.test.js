/**
 * LE FILET CONTRE LE DOUBLE AU REVOIR : quand le professeur dit adieu en
 * mots mais oublie [FIN_SEANCE], l'annonce automatique d'échéance ne doit
 * pas repartir derrière et le faire dire une seconde fois.
 */

import { sembleDireAuRevoir } from '../lib/storage/ardoise';

test('un vrai au revoir, sans la balise, est reconnu', () => {
  expect(sembleDireAuRevoir(
    'Bon travail sur les fractions aujourd’hui. La prochaine fois on '
    + 'attaquera les additions. À bientôt Bilal !',
  )).toBe(true);

  expect(sembleDireAuRevoir('Prends soin de toi, à la prochaine fois !')).toBe(true);
  expect(sembleDireAuRevoir('Bonne journée Bilal, et bon courage pour la suite.')).toBe(true);
});

test('une mention en passant, pas en fin de message, ne déclenche rien', () => {
  expect(sembleDireAuRevoir(
    'La dernière fois qu’on s’est dit à bientôt, tu avais bien progressé. '
    + 'Reprenons où on en était : montre-moi ton exercice.',
  )).toBe(false);
});

test('un message ordinaire ne déclenche rien', () => {
  expect(sembleDireAuRevoir('Regarde bien "posé" : est-ce que son COD est placé avant ou après ?')).toBe(false);
});

test('les entrées vides ou absentes sont sans danger', () => {
  expect(sembleDireAuRevoir('')).toBe(false);
  expect(sembleDireAuRevoir(null)).toBe(false);
  expect(sembleDireAuRevoir(undefined)).toBe(false);
});
