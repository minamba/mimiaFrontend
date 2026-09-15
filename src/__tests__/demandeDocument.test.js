/**
 * LA BALISE [DEMANDE_DOCUMENT] : ni lue ni affichée, elle allume le trombone
 * et la caméra pour que l'élève sache où répondre quand le professeur lui
 * demande un devoir, un contrôle ou un exercice fait sur le cahier.
 */

import { demandeDocument, decouper, texteParle } from '../lib/storage/ardoise';

test('la balise est détectée quand le professeur la pose', () => {
  expect(demandeDocument('Envoie-moi une photo de ton devoir. [DEMANDE_DOCUMENT]')).toBe(true);
});

test('un message ordinaire, sans balise, ne déclenche rien', () => {
  expect(demandeDocument('On continue les fractions ?')).toBe(false);
  expect(demandeDocument('')).toBe(false);
  expect(demandeDocument(null)).toBe(false);
  expect(demandeDocument(undefined)).toBe(false);
});

test("la balise ne s'affiche pas dans la bulle de l'élève", () => {
  const message = 'Envoie-moi une photo de ton devoir.\n[DEMANDE_DOCUMENT]';
  const segments = decouper(message);

  expect(segments.map((s) => s.contenu).join(' ')).not.toMatch(/DEMANDE_DOCUMENT/);
  expect(segments.map((s) => s.contenu).join(' ')).toMatch(/photo de ton devoir/);
});

test("la balise n'est jamais prononcée par la voix", () => {
  const message = 'Envoie-moi une photo de ton devoir. [DEMANDE_DOCUMENT]';
  expect(texteParle(message)).not.toMatch(/DEMANDE_DOCUMENT/);
  expect(texteParle(message)).toMatch(/photo de ton devoir/);
});
