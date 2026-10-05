/**
 * UN « SALUT MINS ! » NE PART PAS SEUL — Camara, le 04/10/2026 : « dans le
 * bonjour, quand il m'a dit salut Mins, il l'a répété plusieurs fois ».
 *
 * La garde du serveur contre la redite ne surveille pas un texte de moins de
 * cinq mots. Le bonjour, que le flux laisse seul un instant, attend donc la
 * phrase suivante pour partir avec elle.
 */

import { voixService, nombreDeMots } from '../lib/storage/voixService';

describe('les mots que compte la garde', () => {
  test('la ponctuation et les lettres seules ne comptent pas', () => {
    expect(nombreDeMots('Salut Mins !')).toBe(2);
    expect(nombreDeMots("D'accord, je choisis pour toi !")).toBe(5);
    expect(nombreDeMots('1.')).toBe(0);
  });
});

describe('un groupe de moins de cinq mots attend la suite', () => {
  let lecteur;
  let envois;

  beforeEach(() => {
    jest.useFakeTimers();
    lecteur = voixService.creerLecteur();
    envois = [];
    lecteur.enfiler = (texte) => envois.push(texte);
  });

  afterEach(() => jest.useRealTimers());

  test('le bonjour ne part pas pendant la pause du flux', () => {
    lecteur.alimenter('Salut Mins ! ');
    jest.advanceTimersByTime(2500);

    expect(envois).toEqual([]);
  });

  test('il part avec la phrase suivante, en un seul envoi', () => {
    lecteur.alimenter('Salut Mins ! ');
    jest.advanceTimersByTime(2500);
    lecteur.alimenter("Alors, sur quoi on travaille aujourd'hui ? ");

    expect(envois).toEqual(["Salut Mins ! Alors, sur quoi on travaille aujourd'hui ?"]);
  });

  test('si rien ne vient, il se dit quand même', () => {
    lecteur.alimenter('Salut Mins ! ');
    jest.advanceTimersByTime(5000);

    expect(envois).toEqual(['Salut Mins !']);
  });

  test('la fin du message n’attend jamais', () => {
    lecteur.alimenter("D'accord !");
    lecteur.terminer();

    expect(envois).toEqual(["D'accord !"]);
  });
});
