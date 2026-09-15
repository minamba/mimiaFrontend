import { langueTranscription } from '../lib/storage/langueTranscription';

/**
 * LA RECONNAISSANCE DU NAVIGATEUR NE SAIT PAS ÊTRE BILINGUE.
 *
 * Le 06/09/2026, un élève d'anglais a répondu « cat » ; réglée sur le
 * français, la reconnaissance l'a rendu « carte », et le professeur a
 * corrigé une réponse pourtant juste. Ce fichier protège l'arbitrage inverse :
 * en cours de langue, on règle la reconnaissance sur la langue qu'on évalue,
 * pas sur le français.
 */
describe('langueTranscription', () => {
  it('règle le français par défaut, matière inconnue ou absente', () => {
    expect(langueTranscription('MATHS')).toBe('fr-FR');
    expect(langueTranscription('HISTOIRE_GEO')).toBe('fr-FR');
    expect(langueTranscription(undefined)).toBe('fr-FR');
    expect(langueTranscription(null)).toBe('fr-FR');
    expect(langueTranscription('')).toBe('fr-FR');
  });

  it('règle la langue étudiée pour chaque cours de langue', () => {
    expect(langueTranscription('ANGLAIS')).toBe('en-US');
    expect(langueTranscription('ESPAGNOL')).toBe('es-ES');
    expect(langueTranscription('ALLEMAND')).toBe('de-DE');
    expect(langueTranscription('ITALIEN')).toBe('it-IT');
    expect(langueTranscription('CHINOIS')).toBe('zh-CN');
  });

  it("n'est pas sensible à la casse du code matière", () => {
    expect(langueTranscription('anglais')).toBe('en-US');
    expect(langueTranscription('Anglais')).toBe('en-US');
  });
});
