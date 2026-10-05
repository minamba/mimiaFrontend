/**
 * UN ÉCHO EST UNE COPIE, PAS UNE RÉPONSE — Camara, le 30/09/2026 : deux
 * familles sur haut-parleurs, « le micro ne marche qu'une fois sur dix ». Une
 * réponse faite des mots de la question passait pour un retour d'enceinte.
 *
 * Ce que ces tests protègent :
 * 1. Le vrai retour d'enceinte — la fin de la phrase du professeur, mot pour
 *    mot — est toujours reconnu.
 * 2. Une réponse qui REPREND les mots du professeur, dans un autre ordre ou
 *    avec les siens, n'est jamais un écho.
 * 3. Les gardes d'avant restent : trop court, trop tard, rien dit.
 */

import { estUnEcho } from '../lib/storage/echo';

const PROF = "Bonjour Miyah ! Contente de te retrouver. On a un peu de temps devant nous "
  + "aujourd'hui. Tu veux qu'on reprenne la dictée là où on l'avait laissée, ou tu "
  + "préfères qu'on fasse autre chose pour commencer ?";

const maintenant = () => Date.now();

describe('le vrai retour d’enceinte', () => {
  test('la fin de la phrase du professeur, mot pour mot', () => {
    expect(estUnEcho("ou tu préfères qu'on fasse autre chose pour commencer", PROF, maintenant())).toBe(true);
  });

  test('les quatre derniers mots, sans accents ni ponctuation', () => {
    expect(estUnEcho('autre chose pour commencer', PROF, maintenant())).toBe(true);
  });

  test('la phrase presque entière — micro ouvert au casque sur de vrais haut-parleurs', () => {
    expect(estUnEcho('on a un peu de temps devant nous aujourd hui tu veux qu on reprenne la dictée', PROF, maintenant())).toBe(true);
  });

  test('une longue capture avec un mot trébuché reste un écho', () => {
    expect(estUnEcho("tu veux qu'on reprenne la dictée la ou on l'avait laissée ou tu préfères qu'on face autre chose", PROF, maintenant())).toBe(true);
  });
});

describe('une réponse d’enfant faite des mots de la question', () => {
  test('« on reprend la dictée là où on l’avait laissée » n’est pas un écho', () => {
    // Sept mots sur huit sont ceux du professeur, mais pas dans son ordre.
    expect(estUnEcho("on reprend la dictée là où on l'avait laissée", PROF, maintenant())).toBe(false);
  });

  test('« je veux qu’on fasse autre chose » n’est pas un écho', () => {
    expect(estUnEcho("je veux qu'on fasse autre chose", PROF, maintenant())).toBe(false);
  });

  test('« oui la dictée là où on l’avait laissée s’il te plaît » n’est pas un écho', () => {
    expect(estUnEcho("oui la dictée là où on l'avait laissée s'il te plaît", PROF, maintenant())).toBe(false);
  });

  test('un morceau du MILIEU répété mot pour mot n’est pas un écho : sur haut-parleurs, le micro était sourd à ce moment-là', () => {
    expect(estUnEcho("la dictée là où on l'avait laissée", PROF, maintenant())).toBe(false);
  });
});

describe('les gardes', () => {
  test('trop court pour conclure', () => {
    expect(estUnEcho('autre chose pour', PROF, maintenant())).toBe(false);
  });

  test('trop tard : l’élève a eu le temps de formuler', () => {
    expect(estUnEcho("ou tu préfères qu'on fasse autre chose pour commencer", PROF, maintenant() - 7000)).toBe(false);
  });

  test('rien dit par le professeur, ou pas d’horodatage', () => {
    expect(estUnEcho('une phrase de quatre mots', '', maintenant())).toBe(false);
    expect(estUnEcho('une phrase de quatre mots', PROF, null)).toBe(false);
  });
});
