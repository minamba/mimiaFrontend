/**
 * TOUS LES ÉPISODES DANS UN SEUL MP3 — Camara, le 15/11/2026 : « fusionner tous les audios pour n'en avoir qu'un seul à
 * télécharger ». L'encodeur est remplacé par un compteur d'échantillons : on vérifie l'ordre, le silence entre deux
 * épisodes (et pas avant le premier), et le refus d'épisodes à des fréquences différentes. Le vrai assemblage a été
 * mesuré à part sur les 5 épisodes de Thalès (1 146,8 s = 1 141 s + 4 × 1,5 s ; voix audible).
 */
import { creerFusion, SILENCE_ENTRE_EPISODES } from '../lib/podcasts/mp3';

const mockRecus = [];
jest.mock('@breezystack/lamejs', () => ({
  Mp3Encoder: class {
    encodeBuffer(bloc) { mockRecus.push(...bloc); return new Int8Array(1); }

    flush() { return new Int8Array(0); }
  },
}));

/** Un WAV PCM 16 bits mono de `valeurs`, à `frequence`. */
function wav(valeurs, frequence = 1000) {
  const tampon = new ArrayBuffer(44 + valeurs.length * 2);
  const v = new DataView(tampon);
  const ecrire = (pos, t) => [...t].forEach((c, i) => v.setUint8(pos + i, c.charCodeAt(0)));
  ecrire(0, 'RIFF'); v.setUint32(4, 36 + valeurs.length * 2, true); ecrire(8, 'WAVE');
  ecrire(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, frequence, true); v.setUint32(28, frequence * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ecrire(36, 'data'); v.setUint32(40, valeurs.length * 2, true);
  valeurs.forEach((x, i) => v.setInt16(44 + i * 2, x, true));
  return { arrayBuffer: async () => tampon };
}

beforeEach(() => { mockRecus.length = 0; });

test('les épisodes bout à bout, un silence entre deux, aucun avant le premier', async () => {
  const f = creerFusion();
  await f.ajouter(wav([1, 2, 3]));
  await f.ajouter(wav([4, 5]));
  const mp3 = f.finir();

  const silence = Math.round(1000 * SILENCE_ENTRE_EPISODES);
  expect(mockRecus).toEqual([1, 2, 3, ...new Array(silence).fill(0), 4, 5]);
  expect(mp3.type).toBe('audio/mpeg');
});

test('des épisodes à des fréquences différentes sont refusés', async () => {
  const f = creerFusion();
  await f.ajouter(wav([1], 1000));
  await expect(f.ajouter(wav([2], 2000))).rejects.toThrow(/fréquences/);
});

test('rien à assembler : une erreur, pas un fichier vide', () => {
  expect(() => creerFusion().finir()).toThrow();
});
