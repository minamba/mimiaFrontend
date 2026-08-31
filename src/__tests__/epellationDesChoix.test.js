/**
 * « ON ÉCRIT AVAIT OU AVAIENT ? » EST UNE QUESTION SANS QUESTION.
 *
 * Prononcée à voix haute, elle est littéralement « on écrit X ou X ? ». L'élève
 * au casque, les yeux sur sa copie, n'a aucun moyen de savoir ce qu'on lui
 * demande de choisir — il entend deux fois le même mot, et il l'a dit.
 *
 * La consigne du professeur le lui demande. Il a épelé dans son EXPLICATION —
 * « "avait" se termine par a-i-t, "avaient" par a-i-e-n-t » — puis a posé la
 * question sans épeler. Or c'est la question qui décide.
 *
 * CE QUE CES TESTS PROTÈGENT SURTOUT, C'EST L'AUTRE SENS. Le motif touche à ce
 * que le professeur PRONONCE : trop large, il épellerait au milieu d'une
 * explication, d'un exemple, d'une histoire. Un professeur qui se met à dicter
 * des lettres sans raison est bien pire qu'une question ambiguë.
 */

import { epelerLesChoix } from '../lib/storage/epellation';

describe('le choix entre deux homophones devient audible', () => {
  test('avait ou avaient', () => {
    const dit = epelerLesChoix("Est-ce qu'on écrit avait ou avaient ?");

    expect(dit).toContain('avait, a-i-t');
    expect(dit).toContain('avaient, a-i-e-n-t');
  });

  test('la règle vaut pour TOUS les verbes, sans liste', () => {
    // C'est une règle sur les terminaisons, pas un dictionnaire : aucun verbe
    // n'est énuméré nulle part.
    expect(epelerLesChoix('chantait ou chantaient ?')).toContain('chantait, a-i-t');
    expect(epelerLesChoix('finissaient ou finissait ?')).toContain('finissaient, a-i-e-n-t');
  });

  test('mangé, manger, mangez', () => {
    expect(epelerLesChoix('Tu écris mangé ou manger ?')).toContain('mangé, e accent aigu');
    expect(epelerLesChoix('Tu écris mangé ou manger ?')).toContain('manger, e-r');
    expect(epelerLesChoix('On met manger ou mangez ?')).toContain('mangez, e-z');
  });

  test('parti, partie, partis, parties', () => {
    expect(epelerLesChoix('parti ou partie ?')).toContain('parti, i,');
    expect(epelerLesChoix('parti ou partie ?')).toContain('partie, i-e');
    expect(epelerLesChoix('partis ou parties ?')).toContain('parties, i-e-s');
  });

  test('les guillemets du professeur ne gênent pas', () => {
    const dit = epelerLesChoix('Est-ce qu\'on écrit "avait" ou "avaient" ?');
    expect(dit).toContain('a-i-t');
    expect(dit).toContain('a-i-e-n-t');
  });
});

describe("ce à quoi on ne touche pas", () => {
  test('un exemple qui contient les deux formes reste intact', () => {
    // LE CAS QUI JUSTIFIE TOUT L'ÉTROITESSE DU MOTIF. Un professeur de français
    // construit des phrases avec les deux formes. Épeler ici serait absurde —
    // et c'est ce qu'aurait fait un simple « les deux mots sont dans la phrase ».
    const phrase = 'Il avait un chien et ils avaient un chat.';
    expect(epelerLesChoix(phrase)).toBe(phrase);
  });

  test('deux verbes différents ne sont pas des homophones', () => {
    // « chantait ou dansait » n'a rien d'ambigu à l'oreille : ce sont deux mots
    // distincts, pas deux orthographes du même.
    const phrase = 'Il chantait ou dansait, je ne sais plus.';
    expect(epelerLesChoix(phrase)).toBe(phrase);
  });

  test('la même terminaison des deux côtés ne pose aucune question', () => {
    const phrase = 'Ils chantaient ou dansaient ensemble.';
    expect(epelerLesChoix(phrase)).toBe(phrase);
  });

  test('une phrase ordinaire traverse sans une lettre de plus', () => {
    const phrase = 'On va faire un exercice ou deux, comme tu veux.';
    expect(epelerLesChoix(phrase)).toBe(phrase);
  });

  test("ce qui est DÉJÀ épelé ne l'est pas deux fois", () => {
    // Le professeur qui suit sa consigne s'entendrait sinon dire
    // « avait, a-i-t, a-i-t ».
    const phrase = 'On écrit avait, a-i-t, ou avaient, a-i-e-n-t ?';
    expect(epelerLesChoix(phrase)).toBe(phrase);
  });

  test('un texte vide ou sans « ou » ne coûte rien', () => {
    expect(epelerLesChoix('')).toBe('');
    expect(epelerLesChoix(null)).toBe(null);
    expect(epelerLesChoix('Bravo, c’est exactement ça.')).toBe('Bravo, c’est exactement ça.');
  });
});
