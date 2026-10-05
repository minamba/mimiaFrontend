/**
 * UNE NOTE DE L'APPLICATION RECOPIÉE PAR LE PROFESSEUR — Camara, le 04/10/2026.
 *
 * Le serveur soufflait au professeur, dans son historique, le texte d'une
 * dictée remise au tableau, entre crochets et « à ne jamais recopier ». À la
 * deuxième reprise, il l'a recopié entier dans sa réponse : affiché, et lu à
 * voix haute en anglais. Le serveur ne le lui souffle plus de cette façon ;
 * l'écran, lui, ne doit ni afficher ni dire un tel bloc — même ouvert, en
 * plein flux.
 */

import { decouper, texteParle } from '../lib/storage/ardoise';

const NOTE = "[Ajouté par l'application : l'écran affiche au tableau la dictée n° 26 du 12/09/2026, "
  + 'avec ses erreurs surlignées.\nLa dictée\nYesterday, Sarah and her brother went to the park.\n\n'
  + 'Ta copie\nyersteday Sarah her brother went to the park]';

const MESSAGE = `Salut Bilal ! Je te la remets au tableau.\n\n[DICTEE_AU_TABLEAU]26[/DICTEE_AU_TABLEAU]\n${NOTE}\n\nMaintenant regarde la deuxième ligne.`;

/** Tout ce que l'écran rend d'un message, à plat. */
const affiche = (texte) => JSON.stringify(decouper(texte));

test('la note ne s’affiche pas', () => {
  const rendu = affiche(MESSAGE);

  expect(rendu).toContain('Je te la remets au tableau.');
  expect(rendu).toContain('Maintenant regarde la deuxième ligne.');
  expect(rendu).not.toContain('Ajouté par l');
  expect(rendu).not.toContain('Yesterday');
});

test('la note ne se dit pas', () => {
  const parle = texteParle(MESSAGE);

  expect(parle).toContain('Je te la remets au tableau.');
  expect(parle).toContain('Maintenant regarde la deuxième ligne.');
  expect(parle).not.toContain('Yesterday');
  expect(parle).not.toContain('yersteday');
});

test('un bloc encore ouvert, en plein flux, ne laisse rien passer', () => {
  const enCours = "Je te la remets au tableau.\n\n[Ajouté par l'application : l'écran affiche la dictée\nLa dictée\nYesterday, Sarah";

  expect(texteParle(enCours)).toContain('Je te la remets au tableau.');
  expect(texteParle(enCours)).not.toContain('Yesterday');
  expect(affiche(enCours)).not.toContain('Yesterday');
});
