/**
 * [A_ECOUTER] ET LE TABLEAU (14/11/2026) — Camara : « il faut qu'il n'apparaisse pas au tableau non plus », puis
 * « oui fais-le » pour la balise posée par le professeur lui-même.
 */
import { masquerPourLEcran, masquerBaliseAEcouter, masquerNombreAuTableau } from '../lib/reponseADictee';
import { texteParle } from '../lib/storage/ardoise';

describe('la balise [A_ECOUTER]', () => {
  test('affichée 🔊, dite en entier', () => {
    const texte = 'Écoute bien : [A_ECOUTER]soixante-dix-huit[/A_ECOUTER]. À toi !';
    expect(masquerPourLEcran(texte)).toBe('Écoute bien : 🔊. À toi !');
    expect(texteParle(texte)).toBe('Écoute bien : soixante-dix-huit. À toi !');
  });

  test('en flux : rien ne fuit, ni le nombre commencé ni le début de balise', () => {
    expect(masquerBaliseAEcouter('Écoute bien : [A_ECOUTER]soix')).toBe('Écoute bien : 🔊');
    expect(masquerBaliseAEcouter('Écoute bien : [A_ECO')).toBe('Écoute bien : ');
    expect(texteParle('Écoute bien : [A_ECO')).toBe('Écoute bien : ');
  });

  test('au tableau aussi', () => {
    expect(masquerPourLEcran('Je te le mets ici. [ARDOISE] [A_ECOUTER]65[/A_ECOUTER] [/ARDOISE]'))
      .toBe('Je te le mets ici. [ARDOISE] 🔊 [/ARDOISE]');
  });
});

describe('un nombre seul au tableau pendant une dictée', () => {
  test.each([
    ['Je te dis un autre nombre. [ARDOISE] soixante-cinq [/ARDOISE] Écris-le.', '[ARDOISE] 🔊 [/ARDOISE]'],
    ['Écoute bien et écris ce nombre. [ARDOISE] 60 [/ARDOISE]', '[ARDOISE] 🔊 [/ARDOISE]'],
    ['Je le redis : [ARDOISE] « soixante-dix-huit » [/ARDOISE]', '[ARDOISE] 🔊 [/ARDOISE]'],
  ])('caché : « %s »', (texte, attendu) => {
    expect(masquerNombreAuTableau(texte)).toContain(attendu);
  });

  test.each([
    // Conversion : l'élève n'y lit pas sa réponse.
    'Je te dis : [ARDOISE] 81 [/ARDOISE] Tu me l’écris en lettres.',
    'Écoute bien : [ARDOISE] soixante [/ARDOISE] Écris-le en chiffres.',
    // Pas une dictée : une question sur le nombre affiché.
    'Écris le nombre qui vient juste après. [ARDOISE] 42 [/ARDOISE]',
    'Range-les du plus petit au plus grand. [ARDOISE] 2 981     2 819     2 918 [/ARDOISE]',
    // Plus qu'un nombre au tableau.
    'Écoute bien la consigne. [ARDOISE] Encadre 16,8 entre deux nombres entiers consécutifs [/ARDOISE]',
  ])('laissé : « %s »', (texte) => {
    expect(masquerNombreAuTableau(texte)).toBe(texte);
  });
});
