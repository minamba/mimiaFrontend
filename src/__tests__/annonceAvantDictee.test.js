/**
 * L'ANNONCE AVANT LE CHOIX, LA DICTÉE APRÈS — Camara, le 01/11/2026 : « le
 * professeur me propose oralement de saisir au clavier ou sur mon cahier après
 * que j'ai fait mon choix dans la fenêtre ; ça devrait se faire avant ».
 */
import { annonceAvantDictee } from '../lib/storage/etatDictee';
import { texteParle, DEBUT_DICTEE } from '../lib/storage/ardoise';

const message = 'D’accord Zakariya, on repart sur les nombres de un à cinq ! '
  + 'Tu l’écris sur ton cahier ou au clavier ?\n\n[DICTEE]\nun.\ndeux.\ntrois.\n[/DICTEE]';

describe('annonceAvantDictee', () => {
  it('rend la phrase qui pose la question, sans un mot de la dictée', () => {
    const annonce = annonceAvantDictee(texteParle(message, { bornes: true }));

    expect(annonce).toContain('Tu l’écris sur ton cahier ou au clavier ?');
    expect(annonce).not.toContain('deux');
    expect(annonce).not.toContain(DEBUT_DICTEE);
  });

  it('ne rend rien quand le message commence par la dictée', () => {
    expect(annonceAvantDictee(texteParle('[DICTEE] un. deux. [/DICTEE]', { bornes: true }))).toBe('');
  });

  it('ne rend rien tant que la dictée n’a pas commencé — l’autre chemin parle', () => {
    expect(annonceAvantDictee('Tu l’écris sur ton cahier ou au clavier ?')).toBe('');
    expect(annonceAvantDictee(undefined)).toBe('');
  });
});
