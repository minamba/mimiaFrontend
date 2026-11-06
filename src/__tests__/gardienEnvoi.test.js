/**
 * LE GARDIEN DE L'ENVOI AUTOMATIQUE — signalement de production du 03/11/2026 : en
 * détection automatique, des réponses restaient dans le champ jusqu'au clic.
 */
import {
  ATTENTE_TRANSCRIPTION_MAX_MS, GARDIEN_BRUIT_MS, GARDIEN_PAROLE_MS, GARDIEN_SILENCE_MS,
  gardienDoitEnvoyer,
} from '../lib/storage/tourEleve';

const coince = (reste = {}) => ({
  aDuTexte: true,
  minuteurArme: false,
  tapee: false,
  enPause: false,
  finie: false,
  depuisTexteMs: 0,
  parle: false,
  voixRecenteMs: Infinity,
  transcriptionEnCours: false,
  ...reste,
});

describe('il fait partir ce qui est coincé', () => {
  test('un provisoire sans verdict, dans le silence', () => {
    expect(gardienDoitEnvoyer(coince({ depuisTexteMs: GARDIEN_SILENCE_MS - 1 }))).toBe(false);
    expect(gardienDoitEnvoyer(coince({ depuisTexteMs: GARDIEN_SILENCE_MS }))).toBe(true);
  });

  test('l’envoi annulé par un bruit de fond qui ne s’arrête pas', () => {
    const bruit = { parle: true, voixRecenteMs: 60000 };

    expect(gardienDoitEnvoyer(coince({ ...bruit, depuisTexteMs: GARDIEN_BRUIT_MS - 1 }))).toBe(false);
    expect(gardienDoitEnvoyer(coince({ ...bruit, depuisTexteMs: GARDIEN_BRUIT_MS }))).toBe(true);
  });

  test('un micro qui n’a jamais entendu de voix compte pour du bruit', () => {
    expect(gardienDoitEnvoyer(coince({ parle: true, voixRecenteMs: undefined, depuisTexteMs: GARDIEN_BRUIT_MS }))).toBe(true);
  });
});

describe('il ne coupe personne', () => {
  test('un enfant qui explique, entre deux phrases rendues par le fournisseur', () => {
    const voix = { parle: true, voixRecenteMs: 100 };

    expect(gardienDoitEnvoyer(coince({ ...voix, depuisTexteMs: 15000 }))).toBe(false);
    expect(gardienDoitEnvoyer(coince({ ...voix, depuisTexteMs: GARDIEN_PAROLE_MS }))).toBe(true);
  });

  test('un morceau encore en route vers sa transcription', () => {
    const enRoute = { transcriptionEnCours: true };

    expect(gardienDoitEnvoyer(coince({ ...enRoute, depuisTexteMs: 8000 }))).toBe(false);
    expect(gardienDoitEnvoyer(coince({ ...enRoute, depuisTexteMs: ATTENTE_TRANSCRIPTION_MAX_MS }))).toBe(true);
  });
});

describe('il ne touche à rien de ce qui n’est pas coincé', () => {
  const longtemps = { depuisTexteMs: 600000 };

  test.each([
    ['un envoi déjà prévu', { minuteurArme: true }],
    ['un champ vide', { aDuTexte: false }],
    ['un texte tapé au clavier', { tapee: true }],
    ['un cours en pause', { enPause: true }],
    ['une séance finie', { finie: true }],
  ])('%s', (_, cas) => {
    expect(gardienDoitEnvoyer(coince({ ...longtemps, ...cas }))).toBe(false);
  });

  test('sans arguments, rien', () => {
    expect(gardienDoitEnvoyer()).toBe(false);
  });
});
