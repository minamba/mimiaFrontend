import { aLaSeconde } from '../lib/utils/duree';

describe('aLaSeconde — le temps réel en cours, à la seconde près', () => {
  it('écrit les secondes seules sous la minute', () => {
    expect(aLaSeconde(0)).toBe('0 s');
    expect(aLaSeconde(12)).toBe('12 s');
  });

  it('écrit minutes et secondes sous l’heure', () => {
    // Le 18/09 relevé en base : 2 994 s.
    expect(aLaSeconde(2994)).toBe('49 min 54 s');
    expect(aLaSeconde(60)).toBe('1 min 00 s');
  });

  it('écrit heures, minutes et secondes au-delà', () => {
    expect(aLaSeconde(3932)).toBe('1 h 05 min 32 s');
    expect(aLaSeconde(3600)).toBe('1 h 00 min 00 s');
  });

  it('ne rend jamais une durée négative ni NaN', () => {
    expect(aLaSeconde(-5)).toBe('0 s');
    expect(aLaSeconde(undefined)).toBe('0 s');
  });
});
