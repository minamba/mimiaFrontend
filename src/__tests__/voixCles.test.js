/**
 * UNE CLÉ, UN FICHIER, UNE PHRASE. Deux répliques qui partageraient une clé
 * s'écraseraient au même enregistrement : l'une des deux dirait le texte de
 * l'autre. Le 21/09/2026, les six terminaisons de la roue des verbes sont
 * tombées sur la même clé — ce test l'aurait vu tout de suite.
 */

import { toutesLesRepliques } from '../lib/jeux/voix/repliques';

describe('les clés des voix', () => {
  it('chaque clé est unique chez chaque professeur', () => {
    Object.values(toutesLesRepliques()).forEach((repliques) => {
      const cles = repliques.map((r) => r.cle);
      const doubles = cles.filter((c, i) => cles.indexOf(c) !== i);
      expect(doubles).toEqual([]);
    });
  });

  it('une clé ne porte ni accent, ni espace, ni apostrophe', () => {
    Object.values(toutesLesRepliques()).forEach((repliques) => {
      repliques.forEach((r) => expect(r.cle).toMatch(/^[a-z0-9/.-]+$/));
    });
  });
});
