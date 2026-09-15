/**
 * LA BALISE [DICTEE_CORRIGEE] : ni lue ni affichée, comme [FICHE] et
 * [EVALUATION] — elle sert à archiver la dictée dans « Mes dictées », pas à
 * s'afficher dans le fil.
 */

import { decouper, texteParle, contientCorrectionDictee } from '../lib/storage/ardoise';

const message = [
  'Bravo, ta copie est corrigée !',
  '[DICTEE_CORRIGEE]',
  'titre: Les accords du participe passé',
  'dicte:',
  'Les enfants ont joué dans le jardin.',
  'copie:',
  'Les enfants on joués dans le jardin.',
  'remarque:',
  'Attention aux terminaisons du passé composé.',
  '[/DICTEE_CORRIGEE]',
].join('\n');

test("le bloc ne s'affiche pas dans la bulle de l'élève", () => {
  const segments = decouper(message);
  const affiche = segments.map((s) => s.contenu).join(' ');

  expect(affiche).not.toMatch(/DICTEE_CORRIGEE/);
  expect(affiche).not.toMatch(/participe passé/);
  expect(affiche).toMatch(/corrigée/);
});

test("le bloc n'est jamais prononcé par la voix", () => {
  const parle = texteParle(message);

  expect(parle).not.toMatch(/DICTEE_CORRIGEE/);
  expect(parle).not.toMatch(/participe passé/);
  expect(parle).toMatch(/corrigée/);
});

/**
 * CE QUI CLÔT UNE DICTÉE, C'EST LA CORRECTION — PAS L'ENVOI DE LA COPIE.
 *
 * Relevé le 11/09/2026 : l'élève rend sa copie sans avoir retenu la dernière
 * phrase, le professeur la relit, et l'écran redemandait « comment veux-tu
 * écrire cette dictée ? » au milieu de celle qui était en cours — en repartant
 * sur une copie vide.
 */
describe('contientCorrectionDictee', () => {
  test('reconnaît le message qui porte la correction', () => {
    expect(contientCorrectionDictee(message)).toBe(true);
  });

  test('une relecture de phrase ne clôt rien', () => {
    const relecture = [
      "Il te manquait la fin. Écoute bien, je te la redis :",
      '\u0001Nous avons repeint les volets.\u0002',
    ].join('\n');

    expect(contientCorrectionDictee(relecture)).toBe(false);
  });

  test('une dictée qui commence ne clôt rien non plus', () => {
    expect(contientCorrectionDictee('\u0001Les enfants ont joué.\u0002')).toBe(false);
  });

  test('ne casse pas sur une absence de texte', () => {
    expect(contientCorrectionDictee(null)).toBe(false);
    expect(contientCorrectionDictee(undefined)).toBe(false);
    expect(contientCorrectionDictee('')).toBe(false);
  });
});
