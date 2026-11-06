/**
 * QUAND C'EST À L'ÉLÈVE DE LE DIRE, LA BALISE SE TAIT — remonté par un parent le
 * 26/10/2026 : la voix prononçait la lettre en anglais dans la question même,
 * et donnait la réponse. Voir `neutraliserBalisesDeQuestion`.
 */
import { neutraliserBalisesDeQuestion } from '../lib/storage/ardoise';

describe('la balise d’écoute dans une question « comment dit-on »', () => {
  it('tombe quand la phrase demande de dire, prononcer ou épeler', () => {
    expect(neutraliserBalisesDeQuestion('Comment dit-on la lettre [EN]A[/EN] en anglais ?'))
      .toBe('Comment dit-on la lettre A en anglais ?');
    expect(neutraliserBalisesDeQuestion('Et toi, comment tu prononces [EN]H[/EN] ?'))
      .toBe('Et toi, comment tu prononces H ?');
    expect(neutraliserBalisesDeQuestion('Onze, comment ça se dit [ES]once[/ES] en espagnol ?'))
      .toBe('Onze, comment ça se dit once en espagnol ?');
    expect(neutraliserBalisesDeQuestion('Tu sais comment on dit [DE]Danke[/DE] ?'))
      .toBe('Tu sais comment on dit Danke ?');
  });

  it('reste quand le professeur montre, fait écouter ou demande le sens', () => {
    const relecture = 'Répète après moi : [EN]A[/EN].';
    expect(neutraliserBalisesDeQuestion(relecture)).toBe(relecture);

    const ecoute = 'Écoute bien, je te lis une phrase. [EN]The cat is sleeping on the table.[/EN] Qu’est-ce que tu as compris ?';
    expect(neutraliserBalisesDeQuestion(ecoute)).toBe(ecoute);

    const sens = 'Tu te souviens de ce que veut dire [EN]table[/EN] ?';
    expect(neutraliserBalisesDeQuestion(sens)).toBe(sens);

    const confirmation = 'Bravo, c’est ça : la lettre A se dit [EN]A[/EN].';
    expect(neutraliserBalisesDeQuestion(confirmation)).toBe(confirmation);
  });

  it('ne touche qu’à la phrase fautive dans un message qui en a plusieurs', () => {
    const texte = 'Écoute : [EN]B[/EN]. Maintenant, comment dit-on la lettre [EN]C[/EN] en anglais ? Ensuite on verra [EN]D[/EN].';
    expect(neutraliserBalisesDeQuestion(texte))
      .toBe('Écoute : [EN]B[/EN]. Maintenant, comment dit-on la lettre C en anglais ? Ensuite on verra [EN]D[/EN].');
  });

  it('rend un texte vide ou sans balise tel quel', () => {
    expect(neutraliserBalisesDeQuestion('')).toBe('');
    expect(neutraliserBalisesDeQuestion('Comment dit-on bonjour en anglais ?')).toBe('Comment dit-on bonjour en anglais ?');
  });
});
