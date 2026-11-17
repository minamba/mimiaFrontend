/**
 * « APPUIE ET PARLE », AU CP (12/11/2026) : au CP, le bouton par défaut ; le parent peut remettre les mains libres ;
 * à « J'ai fini », tout ce qui a été dit part d'un coup.
 */
import {
  CLE_MAINS_LIBRES, CLE_MAINS_LIBRES_CP, estClasseCP, mainsLibresAuDepart, texteDeFinDeParole,
} from '../lib/storage/appuiPourParler';

const stockage = (valeurs) => (cle) => (cle in valeurs ? valeurs[cle] : null);

describe('le CP, et lui seul', () => {
  test.each([['CP', true], ['cp', true], [' CP ', true], ['CE1', false], ['6e', false], [null, false], [undefined, false]])(
    '%s → %s',
    (classe, attendu) => expect(estClasseCP(classe)).toBe(attendu),
  );
});

describe('au départ', () => {
  test('au CP, jamais touché : le bouton', () => {
    expect(mainsLibresAuDepart(true, stockage({}))).toBe(false);
  });

  test('au CP, le parent a remis les mains libres : elles restent', () => {
    expect(mainsLibresAuDepart(true, stockage({ [CLE_MAINS_LIBRES_CP]: '1' }))).toBe(true);
  });

  test('au CP, le choix des grands frères ne compte pas', () => {
    expect(mainsLibresAuDepart(true, stockage({ [CLE_MAINS_LIBRES]: '1' }))).toBe(false);
  });

  test('hors CP, rien ne change : mains libres sauf si on les a éteintes', () => {
    expect(mainsLibresAuDepart(false, stockage({}))).toBe(true);
    expect(mainsLibresAuDepart(false, stockage({ [CLE_MAINS_LIBRES]: '0' }))).toBe(false);
    expect(mainsLibresAuDepart(false, stockage({ [CLE_MAINS_LIBRES_CP]: '0' }))).toBe(true);
  });

  test('stockage illisible : le défaut de chaque classe', () => {
    const casse = () => { throw new Error('bloqué'); };
    expect(mainsLibresAuDepart(true, casse)).toBe(false);
    expect(mainsLibresAuDepart(false, casse)).toBe(true);
  });
});

describe('à « J’ai fini »', () => {
  test('ce qui est assemblé et le provisoire partent ensemble', () => {
    expect(texteDeFinDeParole({ assemble: 'Je dois réviser', partiel: 'les nombres jusqu’à 59' }))
      .toBe('Je dois réviser les nombres jusqu’à 59');
  });

  test('un provisoire déjà repris ne part pas deux fois', () => {
    expect(texteDeFinDeParole({ assemble: 'Seize', partiel: 'Seize', partielConsomme: true })).toBe('Seize');
  });

  test('rien de dit, mais du texte tapé : il part', () => {
    expect(texteDeFinDeParole({ tapee: true, saisie: ' trente ' })).toBe('trente');
  });

  test('rien du tout : rien ne part', () => {
    expect(texteDeFinDeParole({})).toBe('');
  });
});
