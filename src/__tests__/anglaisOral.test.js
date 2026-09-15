import { decouper, texteParle, DEBUT_ECOUTE, FIN_ECOUTE } from '../lib/storage/ardoise';

/**
 * L'ÉCOUTE EN LANGUE ÉTUDIÉE.
 *
 * Ce qu'on protège ici tient en une phrase : le passage à écouter s'ENTEND
 * sans jamais se VOIR. Si le texte s'affiche, l'élève le lit au lieu de
 * l'écouter et l'exercice de compréhension orale disparaît — c'est
 * exactement la raison pour laquelle la dictée obéit déjà à cette règle.
 *
 * Le second point protégé est plus fin : les bornes doivent survivre dans le
 * texte prononcé, sous forme de caractères de contrôle, sinon la voix ne
 * sait pas quel passage lire dans quelle langue et lit tout au registre
 * habituel.
 *
 * UNE BALISE PAR LANGUE, MÊME MÉCANIQUE POUR TOUTES : les deux premiers
 * groupes ci-dessous testent l'anglais ([EN]) puis le français ([FR]),
 * pour vérifier que ce n'est pas un cas particulier de l'anglais.
 */
describe.each([
  ['anglais', 'EN', 'en', 'The cat is on the table.'],
  ['français', 'FR', 'fr', 'Léa se lève tôt et part à l’école.'],
])('écoute orale (%s)', (nomLangue, balise, code, phrase) => {
  const message = `Écoute bien. [${balise}]${phrase}[/${balise}]` + ' Qu’as-tu compris ?';

  it('ne montre jamais le texte à écouter à l’écran', () => {
    const affiche = decouper(message)
      .map((s) => s.texte ?? s.contenu ?? '')
      .join(' ');

    expect(affiche).toContain('Écoute bien');
    expect(affiche).toContain('Qu’as-tu compris');
    expect(affiche).not.toContain(phrase);
    expect(affiche).not.toContain(`[${balise}]`);
  });

  it('garde le texte à écouter dans ce qui est prononcé', () => {
    const parle = texteParle(message);

    expect(parle).toContain(phrase);
    expect(parle).not.toContain(`[${balise}]`);
    expect(parle).not.toContain(`[/${balise}]`);
  });

  it('borne le passage pour la voix quand on le demande', () => {
    const parle = texteParle(message, { bornes: true });

    expect(parle).toContain(DEBUT_ECOUTE[code]);
    expect(parle).toContain(FIN_ECOUTE);

    // La borne encadre le passage, et rien d'autre : ce qui précède reste
    // au registre habituel, sans quoi l'annonce partirait avec la consigne
    // de langue.
    const debut = parle.indexOf(DEBUT_ECOUTE[code]);
    const fin = parle.indexOf(FIN_ECOUTE);

    expect(parle.slice(0, debut)).toContain('Écoute bien');
    expect(parle.slice(debut, fin)).toContain(phrase);
    expect(parle.slice(fin)).toContain('compris');
  });

  it('tolère un bloc encore ouvert pendant le flux', () => {
    // Le message arrive par fragments : la fermeture n'est pas encore là, et
    // le texte ne doit surtout pas apparaître en attendant.
    const partiel = `Écoute bien. [${balise}]${phrase.slice(0, 10)}`;

    const affiche = decouper(partiel)
      .map((s) => s.texte ?? s.contenu ?? '')
      .join(' ');

    expect(affiche).not.toContain(phrase.slice(0, 10));
  });
});

it('laisse un message sans écoute parfaitement intact', () => {
  const simple = 'On revoit le prétérit aujourd’hui.';

  expect(texteParle(simple, { bornes: true })).not.toContain(DEBUT_ECOUTE.en);
  expect(texteParle(simple, { bornes: true })).not.toContain(DEBUT_ECOUTE.fr);
  expect(texteParle(simple)).toContain('prétérit');
});
