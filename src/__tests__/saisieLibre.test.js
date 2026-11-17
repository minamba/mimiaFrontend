import { ajouterDicte } from '../components/mesFiches/SaisieLibre';

describe('la dictée d’une fiche libre s’ajoute au texte', () => {
  it('à la suite, avec une espace', () => {
    expect(ajouterDicte('', ' Le théorème ')).toBe('Le théorème');
    expect(ajouterDicte('Le théorème', 'de Pythagore')).toBe('Le théorème de Pythagore');
    expect(ajouterDicte('Le théorème ', 'de Pythagore')).toBe('Le théorème de Pythagore');
  });

  it('un morceau vide ne change rien', () => {
    expect(ajouterDicte('Les fractions', '  ')).toBe('Les fractions');
    expect(ajouterDicte('Les fractions', null)).toBe('Les fractions');
  });
});
