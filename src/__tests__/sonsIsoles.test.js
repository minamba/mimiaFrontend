/**
 * LES SONS QUE LE MICRO NE SAIT PAS ÉCRIRE — Camara, le 03/11/2026, CP : Adrien demande
 * « ffff », l'enfant le fait, le transcripteur rend un texte vide, et chacun attend l'autre.
 */
import { demandeSonTenu } from '../lib/storage/tourEleve';

describe('le professeur a-t-il demandé un son tenu ?', () => {
  test.each([
    'Souffle fort : ffff !',
    'Dis « FFFFFF » pour m’aider.',
    'Fais le serpent : sssss.',
    'Ferme la bouche et dis mmm.',
    'Essaie chchch, comme le train.',
    'zzz',
  ])('oui : %s', (texte) => {
    expect(demandeSonTenu(texte)).toBe(true);
  });

  test.each([
    'Dis le son fu.',
    'Quel est le mot ? Offrir.',
    'Hmm, c’est bien, continue.',
    'Combien font 2 et 3 ?',
    'Bravo pour ton effort, tu progresses.',
    '',
    null,
    undefined,
  ])('non : %s', (texte) => {
    expect(demandeSonTenu(texte)).toBe(false);
  });
});
