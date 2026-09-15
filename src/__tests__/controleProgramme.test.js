/**
 * LA BALISE [CONTROLE_PROGRAMME] : ni lue ni affichée, comme [FICHE] et
 * [EVALUATION_PREVUE] — elle sert à archiver le contrôle dans le calendrier
 * de l'élève, pas à s'afficher dans le fil.
 */

import { decouper, texteParle } from '../lib/storage/ardoise';

const message = [
  "D'accord, je note ça pour qu'on s'entraîne.",
  '[CONTROLE_PROGRAMME]',
  'sujet: les fractions, addition et simplification',
  'date: 2026-09-20',
  'heure: 14:00',
  '[/CONTROLE_PROGRAMME]',
].join('\n');

test("le bloc ne s'affiche pas dans la bulle de l'élève", () => {
  const segments = decouper(message);
  const affiche = segments.map((s) => s.contenu).join(' ');

  expect(affiche).not.toMatch(/CONTROLE_PROGRAMME/);
  expect(affiche).not.toMatch(/fractions/);
  expect(affiche).toMatch(/je note ça/);
});

test("le bloc n'est jamais prononcé par la voix", () => {
  const parle = texteParle(message);

  expect(parle).not.toMatch(/CONTROLE_PROGRAMME/);
  expect(parle).not.toMatch(/fractions/);
  expect(parle).toMatch(/je note ça/);
});
