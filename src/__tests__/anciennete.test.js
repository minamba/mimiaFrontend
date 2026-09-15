import { anciennete } from '../components/FicheEleve';

/**
 * L'âge d'une mesure de maîtrise.
 *
 * Le score ne bouge qu'à une observation : une notion montée à 85 % en
 * septembre affichait encore 85 % en juin, présentée au parent comme une
 * mesure de la veille. Ce qui se périme, c'est ce qu'on SAIT — pas ce que
 * l'enfant sait — donc on n'annonce jamais qu'il a oublié, seulement depuis
 * quand plus personne ne l'a vu faire.
 */

const ilYA = (jours) => new Date(Date.now() - jours * 86400000).toISOString();

describe('anciennete', () => {
  test('se tait tant que la mesure est fraîche', () => {
    expect(anciennete(ilYA(0))).toBeNull();
    expect(anciennete(ilYA(30))).toBeNull();
    expect(anciennete(ilYA(89))).toBeNull();
  });

  test('parle passé le délai de péremption', () => {
    expect(anciennete(ilYA(91))).toBe('3 mois');
    expect(anciennete(ilYA(150))).toBe('5 mois');
  });

  test('bascule sur l\'année plutôt que d\'annoncer « 13 mois »', () => {
    expect(anciennete(ilYA(400))).toBe("plus d'un an");
  });

  test('une date absente ne fait rien afficher', () => {
    expect(anciennete(null)).toBeNull();
    expect(anciennete(undefined)).toBeNull();
  });
});
