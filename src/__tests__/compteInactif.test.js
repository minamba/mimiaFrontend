import { compteInactif } from '../lib/hooks/useAccesForfait';

/**
 * COMPTE INACTIF (17/11/2026) : seul un compte SANS cours possible est bloqué (« Aucun abonnement en cours », boutons
 * grisés). L'essai garde ses cours jusqu'à la dernière seconde ; un abonnement en cours aussi.
 */
test('l’essai et l’abonnement en cours ne sont jamais « inactifs »', () => {
  expect(compteInactif({ ouvert: false, motif: 'essai' })).toBe(false);
  expect(compteInactif({ ouvert: true, motif: null })).toBe(false);
  // Pas encore chargé : on ne bloque rien.
  expect(compteInactif({ ouvert: null, motif: null })).toBe(false);
});

test('sans abonnement ou en pause, le compte est inactif', () => {
  expect(compteInactif({ ouvert: false, motif: 'sans-forfait' })).toBe(true);
  expect(compteInactif({ ouvert: false, motif: 'pause' })).toBe(true);
});
