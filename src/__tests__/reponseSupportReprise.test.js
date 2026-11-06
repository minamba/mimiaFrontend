/**
 * L'ENFANT SE REPREND — Camara, le 01/11/2026 : « Sur mon clavier, sur,
 * pardon, pardon, sur mon cahier. » La réponse n'était pas lue : la carte
 * restait ouverte, la phrase partait au professeur, et la dictée démarrait
 * sans support enregistré — ni cahier ouvert, ni fenêtre de photo.
 */
import { lireReponseSupportEcrit, CAHIER, CLAVIER } from '../lib/storage/supportEcrit';

describe('lireReponseSupportEcrit — quand les deux supports sont nommés', () => {
  it('retient le dernier nommé : l’enfant s’est corrigé', () => {
    expect(lireReponseSupportEcrit('Sur mon clavier, sur, pardon, pardon, sur mon cahier.')).toBe(CAHIER);
    expect(lireReponseSupportEcrit('Au cahier… non, au clavier !')).toBe(CLAVIER);
    expect(lireReponseSupportEcrit('pas le cahier, plutôt le clavier')).toBe(CLAVIER);
  });

  it('ne retient pas un support nié', () => {
    expect(lireReponseSupportEcrit('Le clavier, pas le cahier.')).toBe(CLAVIER);
    expect(lireReponseSupportEcrit('Sur mon cahier, pas sur le clavier.')).toBe(CAHIER);
  });

  it('garde les réponses simples comme avant', () => {
    expect(lireReponseSupportEcrit('Sur mon cahier.')).toBe(CAHIER);
    expect(lireReponseSupportEcrit('Au clavier')).toBe(CLAVIER);
    expect(lireReponseSupportEcrit('je sais pas')).toBeUndefined();
  });
});
