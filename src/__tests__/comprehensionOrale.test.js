/**
 * LA BALISE [COMPREHENSION_ORALE] : ni lue ni affichée, comme [DICTEE_CORRIGEE]
 * — elle sert à archiver l'exercice dans « Mes compréhensions orales », pas à
 * s'afficher dans le fil.
 *
 * Cas réel du 10/09/2026 : le bloc s'affichait en clair dans la bulle de
 * l'élève, parce que la constante avait été ajoutée à `ardoise.js` sans être
 * inscrite dans la liste des blocs retirés par `retirerMarqueurs`.
 */

import { decouper, texteParle } from '../lib/storage/ardoise';

const message = [
  "Bonne compréhension, Bilal !",
  '[COMPREHENSION_ORALE]',
  'titre: Compréhension d\'un court récit au passé',
  'langue: en',
  'passage:',
  'Last weekend, Tom went to the park with his dog.',
  'comprehension:',
  'Bilal a identifié le début, puis a retrouvé le détail après une réécoute.',
  'remarque:',
  'Bonne compréhension globale.',
  '[/COMPREHENSION_ORALE]',
].join('\n');

test("le bloc ne s'affiche pas dans la bulle de l'élève", () => {
  const segments = decouper(message);
  const affiche = segments.map((s) => s.contenu).join(' ');

  expect(affiche).not.toMatch(/COMPREHENSION_ORALE/);
  expect(affiche).not.toMatch(/Last weekend/);
  expect(affiche).toMatch(/Bonne compréhension, Bilal/);
});

test("le bloc n'est jamais prononcé par la voix", () => {
  const parle = texteParle(message);

  expect(parle).not.toMatch(/COMPREHENSION_ORALE/);
  expect(parle).not.toMatch(/Last weekend/);
  expect(parle).toMatch(/Bonne compréhension, Bilal/);
});
