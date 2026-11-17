import { SONS_ANGLAIS, sonDuMot, sonAnglaisTrouve } from '../lib/imagesSonsAnglais';
import { MOTS_ANGLAIS, imageDuMotAnglais, motsAnglaisJusquA } from '../lib/imagesMotsAnglais';

const juste = (contenu) => ({ role: 'user', contenu, sonJuste: true });
const question = (contenu) => ({ role: 'assistant', contenu });
const eleve = (niveauCode) => ({ niveauCode });

describe('les images des sons de l\'anglais', () => {
  it('a 66 sons, un fichier chacun', () => {
    expect(SONS_ANGLAIS).toHaveLength(66);
    expect(new Set(SONS_ANGLAIS.map((s) => s.son)).size).toBe(66);
  });

  it('montre le son du mot que le professeur a dicté, une fois jugé juste', () => {
    const trouve = sonAnglaisTrouve(
      juste("J'ai entendu le mot chip."),
      question('Le son sh. Voici le prochain mot. [EN]ship[/EN]'),
      eleve('CE1'),
    );
    expect(trouve).toEqual({ mot: 'ship', image: '/images-sons-en/sh.webp', type: 'son' });
  });

  it('montre le mot prononcé seul', () => {
    // Hors de l'exercice des sons, l'image du mot (07/11/2026) ; dans l'exercice des sons, celle du son.
    expect(sonAnglaisTrouve(juste('Cat.'), question('Dis [EN]cat[/EN].'), eleve('CP'))?.image).toBe('/images-mots-en/cat.webp');
    expect(sonAnglaisTrouve(juste('Cat.'), question('Le son a. Dis [EN]cat[/EN].'), eleve('CP'))?.image).toBe('/images-sons-en/a.webp');
  });

  it('ne montre rien sur une réponse fausse, un mot sans image ou hors de l\'élémentaire', () => {
    expect(sonAnglaisTrouve({ ...juste('cat'), sonJuste: false }, null, eleve('CP'))).toBeNull();
    expect(sonAnglaisTrouve(juste('xylophone'), null, eleve('CP'))).toBeNull();
    expect(sonAnglaisTrouve(juste('cat'), null, eleve('6E'))).toBeNull();
    expect(sonAnglaisTrouve(juste('I like cats'), null, eleve('CP'))).toBeNull();
  });

  it('les mots ont leur image (07/11/2026) : celle du mot, sauf dans l\'exercice des sons', () => {
    expect(MOTS_ANGLAIS).toHaveLength(242);
    expect(sonAnglaisTrouve(juste("J'ai entendu le mot apple."), question('Voici le prochain mot. [EN]apple[/EN]'), eleve('CP')))
      .toEqual({ mot: 'apple', image: '/images-mots-en/apple.webp', type: 'mot-anglais' });
    expect(sonAnglaisTrouve(juste("J'ai entendu le mot ship."), question('Le son sh. Voici le prochain mot. [EN]ship[/EN]'), eleve('CE1'))?.image)
      .toBe('/images-sons-en/sh.webp');
    expect(imageDuMotAnglais('Santa')).toBe('/images-mots-en/santa.webp');
    expect(motsAnglaisJusquA('CE1')).toHaveLength(116);
  });

  it('un mot à deux images prend le son de la classe', () => {
    expect(sonDuMot('duck', 'CP').son).toBe('d');
    expect(sonDuMot('duck', 'CE1').son).toBe('ck');
    expect(sonDuMot('car', 'CE2').son).toBe('c');
    expect(sonDuMot('car', 'CM1').son).toBe('ar');
    expect(sonDuMot('moon', 'CM2').son).toBe('oo-long');
    expect(sonDuMot('kite', 'CM1').son).toBe('i_e');
  });
});
