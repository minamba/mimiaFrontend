/**
 * LES BRUITAGES DES JEUX — Camara, le 09/10/2026 : good.mp3 à chaque bonne
 * réponse, bad.mp3 à chaque mauvaise. Chaque écran qui juge une réponse est
 * aussi celui qui affiche les cœurs : un jeu écrit demain qui oublierait ses
 * bruitages tomberait ici, au lieu de rester muet en silence.
 */
import fs from 'fs';
import path from 'path';
import { bruitage } from '../lib/jeux/bruitages';

const DOSSIER = path.join(__dirname, '..', 'components', 'jeux');
const ECRANS = fs.readdirSync(DOSSIER)
  .filter((f) => f.endsWith('.js'))
  .filter((f) => fs.readFileSync(path.join(DOSSIER, f), 'utf8').includes('<Coeurs'));

describe('les bruitages des réponses', () => {
  it('trouve bien les écrans qui jugent', () => {
    expect(ECRANS.length).toBeGreaterThanOrEqual(23);
  });

  it.each(ECRANS)('%s sonne la bonne et la mauvaise réponse', (f) => {
    const source = fs.readFileSync(path.join(DOSSIER, f), 'utf8');
    expect(source).toContain("bruitage('bonne')");
    expect(source).toContain("bruitage('mauvaise')");
  });

  it('sans moteur audio, un bruitage ne fait rien et ne plante pas', () => {
    expect(() => bruitage('bonne')).not.toThrow();
    expect(() => bruitage('inconnu')).not.toThrow();
  });
});
