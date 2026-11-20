/**
 * SIGNALEMENT #50 (20/11/2026) : tableau « entièrement vide » pendant la lecture des nombres. La carte du nombre était
 * rendue, mais son entrée partait d'une opacité 0 (délai + `both`) : sans animation qui tourne, rien de visible.
 * Ce qu'il faut lire au tableau ne doit jamais dépendre d'une animation pour apparaître.
 */
import fs from 'fs';
import path from 'path';

const css = fs.readFileSync(path.join(__dirname, '..', 'App.css'), 'utf8');

const bloc = (selecteur) => {
  const debut = css.indexOf(`${selecteur} {`);
  if (debut < 0) return null;
  return css.slice(debut, css.indexOf('}', debut) + 1);
};

describe("l'image à lire au tableau reste visible sans animation", () => {
  test('la carte du tableau a sa propre entrée', () => {
    expect(bloc('.image-mot--tableau')).toMatch(/animation:\s*image-mot-tableau-arrive\b/);
  });

  test("cette entrée n'a ni délai ni remplissage qui figerait l'état de départ", () => {
    const regle = bloc('.image-mot--tableau').match(/animation:\s*([^;]+);/)[1];
    expect(regle).not.toMatch(/\b(both|backwards)\b/);
    // Une seule durée : pas de délai.
    expect(regle.match(/\d*\.?\d+m?s\b/g)).toHaveLength(1);
  });

  test("ses images clés ne touchent pas l'opacité", () => {
    const debut = css.indexOf('@keyframes image-mot-tableau-arrive');
    expect(debut).toBeGreaterThan(-1);
    const fin = css.indexOf('\n}', debut);
    expect(css.slice(debut, fin)).not.toMatch(/opacity/);
  });
});
