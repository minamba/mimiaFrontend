/**
 * LA BALISE [EVALUATION_CORRIGEE] : ni lue ni affichée.
 *
 * Voulue par Camara le 13/09/2026 : quand le temps manque à la fin d'une
 * évaluation, le professeur donne la note tout de suite et remet la correction
 * au cours suivant. Ce bloc dit que cette correction a enfin eu lieu — ou que
 * l'élève a préféré passer à autre chose.
 *
 * Il ne contient qu'un NUMÉRO, et c'est ce qui le rend dangereux à oublier :
 * « quatorze » prononcé au milieu d'une phrase du professeur ne veut rien dire
 * pour un enfant, et un « 14 » affiché brut ressemble à une note sortie de
 * nulle part.
 */

import { decouper, texteParle } from '../lib/storage/ardoise';

const message = [
  'On a bien repris tes deux erreurs, tu vois pourquoi maintenant.',
  '[EVALUATION_CORRIGEE]14[/EVALUATION_CORRIGEE]',
].join('\n');

const affiche = () => decouper(message).map((s) => s.contenu).join(' ');

test('le bloc ne s’affiche pas dans la bulle de l’élève', () => {
  expect(affiche()).not.toMatch(/EVALUATION_CORRIGEE/);
  expect(affiche()).toMatch(/repris tes deux erreurs/);
});

test('le bloc n’est jamais prononcé par la voix', () => {
  const parle = texteParle(message);

  expect(parle).not.toMatch(/EVALUATION_CORRIGEE/);
  expect(parle).toMatch(/repris tes deux erreurs/);
});

test('le numéro de l’évaluation ne fuit ni à l’écran ni à la voix', () => {
  expect(affiche()).not.toMatch(/14/);
  expect(texteParle(message)).not.toMatch(/14/);
});
