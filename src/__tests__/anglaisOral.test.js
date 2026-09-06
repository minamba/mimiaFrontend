import { decouper, texteParle, DEBUT_ANGLAIS, FIN_ANGLAIS } from '../lib/storage/ardoise';

/**
 * L'ANGLAIS PRONONCÉ.
 *
 * Ce qu'on protège ici tient en une phrase : le passage anglais s'ENTEND sans
 * jamais se VOIR. Si le texte s'affiche, l'élève le lit au lieu de l'écouter
 * et l'exercice de compréhension orale disparaît — c'est exactement la raison
 * pour laquelle la dictée obéit déjà à cette règle.
 *
 * Le second point protégé est plus fin : les bornes doivent survivre dans le
 * texte prononcé, sous forme de caractères de contrôle, sinon la voix ne sait
 * pas quel passage lire en anglais et lit tout en français.
 */
describe('anglais oral', () => {
  const message = 'Écoute bien. [EN]The cat is on the table.[/EN] Qu’as-tu compris ?';

  it('ne montre jamais le texte anglais à l’écran', () => {
    const affiche = decouper(message)
      .map((s) => s.texte ?? s.contenu ?? '')
      .join(' ');

    expect(affiche).toContain('Écoute bien');
    expect(affiche).toContain('Qu’as-tu compris');
    expect(affiche).not.toContain('The cat is on the table');
    expect(affiche).not.toContain('[EN]');
  });

  it('garde le texte anglais dans ce qui est prononcé', () => {
    const parle = texteParle(message);

    expect(parle).toContain('The cat is on the table');
    expect(parle).not.toContain('[EN]');
    expect(parle).not.toContain('[/EN]');
  });

  it('borne le passage pour la voix quand on le demande', () => {
    const parle = texteParle(message, { bornes: true });

    expect(parle).toContain(DEBUT_ANGLAIS);
    expect(parle).toContain(FIN_ANGLAIS);

    // La borne encadre l'anglais, et rien d'autre : ce qui précède reste
    // français, sans quoi l'annonce partirait avec la consigne de langue.
    const debut = parle.indexOf(DEBUT_ANGLAIS);
    const fin = parle.indexOf(FIN_ANGLAIS);

    expect(parle.slice(0, debut)).toContain('Écoute bien');
    expect(parle.slice(debut, fin)).toContain('The cat is on the table');
    expect(parle.slice(fin)).toContain('compris');
  });

  it('tolère un bloc encore ouvert pendant le flux', () => {
    // Le message arrive par fragments : la fermeture n'est pas encore là, et
    // le texte ne doit surtout pas apparaître en attendant.
    const partiel = 'Écoute bien. [EN]The cat is on';

    const affiche = decouper(partiel)
      .map((s) => s.texte ?? s.contenu ?? '')
      .join(' ');

    expect(affiche).not.toContain('The cat is on');
  });

  it('laisse un message sans anglais parfaitement intact', () => {
    const simple = 'On revoit le prétérit aujourd’hui.';

    expect(texteParle(simple, { bornes: true })).not.toContain(DEBUT_ANGLAIS);
    expect(texteParle(simple)).toContain('prétérit');
  });
});
