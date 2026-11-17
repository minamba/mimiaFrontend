/**
 * LA FIGURE CONSTRUITE PAR L'ÉCRAN (11/11/2026) : le professeur nomme, l'écran calcule. Une perpendiculaire est à
 * 90°, une parallèle l'est vraiment, un segment de 5 cm mesure 5 cm.
 */
import { render } from '@testing-library/react';
import Schema from '../components/Schema';
import {
  construireFigure, envelopperFigures, estUneFigure, lignesIncomprises, simplifierLigne, svgDeFigure,
} from '../lib/figureGeo';
import { analyserSchema, estUnSchema } from '../lib/storage/schemaSvg';
import { decouper, extraireArdoises, texteParle, ardoiseOuverte } from '../lib/storage/ardoise';

const proche = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
const lignePar = (figure, nom) => figure.lignes.get(`(${nom})`);

const PROGRAMME_AIMELINE = `[FIGURE]
point A
point B
droite (AB)
point C
perpendiculaire à (AB) passant par C : (d)
parallèle à (AB) passant par C : (d')
intersection de (d) et (AB) : H
[/FIGURE]`;

describe('la géométrie est exacte', () => {
  const figure = construireFigure(PROGRAMME_AIMELINE);
  const ab = figure.lignes.get('(AB)');
  const d = lignePar(figure, 'd');
  const dPrime = lignePar(figure, "d'");

  test('rien d’ignoré', () => expect(figure.ignorees).toEqual([]));

  test('A, B et C ne sont pas alignés', () => {
    const { A, B, C } = Object.fromEntries(figure.points);
    const aire = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
    expect(Math.abs(aire)).toBeGreaterThan(1);
  });

  test('(d) est perpendiculaire à (AB) et passe par C', () => {
    expect(proche(ab.d.x * d.d.x + ab.d.y * d.d.y, 0)).toBe(true);
    expect(d.p).toEqual(figure.points.get('C'));
  });

  test('(d\') est parallèle à (AB)', () => {
    expect(proche(ab.d.x * dPrime.d.y - ab.d.y * dPrime.d.x, 0)).toBe(true);
  });

  test('H est sur (AB) et sur (d), et l’angle droit est codé en H', () => {
    const { A, H, C } = Object.fromEntries(figure.points);
    const surAB = (H.x - A.x) * ab.d.y - (H.y - A.y) * ab.d.x;
    expect(proche(surAB, 0)).toBe(true);
    expect(proche((H.x - C.x) * d.d.y - (H.y - C.y) * d.d.x, 0)).toBe(true);
    expect(figure.anglesDroits).toHaveLength(1);
    expect(dist(figure.anglesDroits[0].sommet, H)).toBeLessThan(1e-6);
  });
});

describe('les mesures sont tenues', () => {
  test('segment [AB] de 5 cm', () => {
    const f = construireFigure('[FIGURE]\nsegment [AB] de 5 cm\n[/FIGURE]');
    expect(proche(dist(f.points.get('A'), f.points.get('B')), 5)).toBe(true);
  });

  test('triangle de côtés 5, 4 et 3 (rectangle en C)', () => {
    const f = construireFigure('triangle ABC de côtés AB = 5, BC = 4, AC = 3');
    const { A, B, C } = Object.fromEntries(f.points);
    expect(proche(dist(A, B), 5)).toBe(true);
    expect(proche(dist(B, C), 4)).toBe(true);
    expect(proche(dist(A, C), 3)).toBe(true);
  });

  test('triangle rectangle en A : l’angle en A est droit', () => {
    const f = construireFigure('triangle ABC rectangle en A');
    const { A, B, C } = Object.fromEntries(f.points);
    expect(proche((B.x - A.x) * (C.x - A.x) + (B.y - A.y) * (C.y - A.y), 0)).toBe(true);
    expect(f.anglesDroits).toHaveLength(1);
  });

  test('triangle équilatéral', () => {
    const f = construireFigure('triangle ABC équilatéral');
    const { A, B, C } = Object.fromEntries(f.points);
    expect(proche(dist(A, B), dist(B, C))).toBe(true);
    expect(proche(dist(A, B), dist(A, C))).toBe(true);
  });

  test('rectangle ABCD de longueur 5 et de largeur 3', () => {
    const f = construireFigure('rectangle ABCD de longueur 5 et de largeur 3');
    const { A, B, C, D } = Object.fromEntries(f.points);
    expect(proche(dist(A, B), 5)).toBe(true);
    expect(proche(dist(B, C), 3)).toBe(true);
    expect(proche(dist(A, C), Math.hypot(5, 3))).toBe(true);
    expect(proche(dist(C, D), 5)).toBe(true);
    expect(f.anglesDroits).toHaveLength(4);
  });

  test('cercle de centre O passant par A', () => {
    const f = construireFigure('point O\npoint A\ncercle de centre O passant par A');
    expect(proche(f.cercles[0].rayon, dist(f.points.get('O'), f.points.get('A')))).toBe(true);
  });

  test('milieu, avec son codage', () => {
    const f = construireFigure('segment [AB] de 6 cm\nmilieu de [AB] : I');
    const { A, B, I } = Object.fromEntries(f.points);
    expect(proche(dist(A, I), 3)).toBe(true);
    expect(proche(dist(I, B), 3)).toBe(true);
    expect(f.codages).toHaveLength(2);
  });

  test('symétrique par rapport à une droite et par rapport à un point', () => {
    const f = construireFigure("point A (0 ; 0)\npoint B (4 ; 0)\ndroite (AB)\npoint M (1 ; 2)\nsymétrique de M par rapport à (AB) : M'\nsymétrique de M par rapport à A : N");
    expect(f.points.get("M'")).toEqual({ x: 1, y: -2 });
    expect(f.points.get('N')).toEqual({ x: -1, y: -2 });
  });

  test('coordonnées données', () => {
    const f = construireFigure('point A (2 ; 3)\npoint B(1,5, -2)');
    expect(f.points.get('A')).toEqual({ x: 2, y: 3 });
  });
});

describe('l’exemple du prompt : Thalès', () => {
  test('E est sur (AC) et (DE) est parallèle à (BC)', () => {
    const f = construireFigure('triangle ABC\npoint D sur (AB)\nparallèle à (BC) passant par D : (d)\nintersection de (d) et (AC) : E');
    expect(f.ignorees).toEqual([]);
    const { A, B, C, D, E } = Object.fromEntries(f.points);
    const aligne = (p, q, r) => proche((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x), 0, 1e-6);
    expect(aligne(A, D, B)).toBe(true);
    expect(aligne(A, E, C)).toBe(true);
    expect(proche((E.x - D.x) * (C.y - B.y) - (E.y - D.y) * (C.x - B.x), 0, 1e-6)).toBe(true);
  });
});

describe('le garde-fou : les tournures du professeur sont comprises', () => {
  test.each([
    ['1. Place le point A', 'point A'],
    ['- Trace la droite AB', 'droite (AB)'],
    ['On trace la droite passant par A et B.', 'droite (AB)'],
    ['Trace le segment AB', 'segment [AB]'],
    ['(AB)', 'droite (AB)'],
    ['[AB] = 5 cm', 'segment [AB] = 5 cm'],
    ['AB = 5 cm', 'segment [AB] de 5 cm'],
    ['A(2;3)', 'point A(2;3)'],
    ['(d) ⊥ (AB) passant par C', 'perpendiculaire à (AB) passant par C : (d)'],
    ['(d) // (AB) passant par C', 'parallèle à (AB) passant par C : (d)'],
    ['(d) perpendiculaire à (AB) en C', 'perpendiculaire à (AB) passant par C : (d)'],
    ['Trace la perpendiculaire à (AB) en C : (d)', 'perpendiculaire à (AB) passant par C : (d)'],
    ['I est le milieu de [AB]', 'milieu de [AB] : I'],
    ['H = intersection de (d) et (AB)', 'intersection de (d) et (AB) : H'],
    ['(d) et (AB) se coupent en H', 'intersection de (d) et (AB) : H'],
    ["M' est le symétrique de M par rapport à (d)", "symétrique de M par rapport à (d) : M'"],
    ['Trace le cercle C de centre O, de rayon 3 cm', 'cercle de centre O de rayon 3 cm'],
  ])('« %s »', (ecrit, attendu) => {
    expect(simplifierLigne(ecrit)).toBe(attendu);
  });

  test('un programme écrit librement se dessine en entier', () => {
    const f = construireFigure(`1. Place les points A, B et C.
2. Trace la droite AB.
3. (d) ⊥ (AB) passant par C
4. (d') // (AB) passant par C
5. (d) et (AB) se coupent en H.`);
    expect(f.ignorees).toEqual([]);
    expect(f.anglesDroits).toHaveLength(1);
    expect(f.points.has('H')).toBe(true);
  });
});

describe('ce que l’écran n’a pas su dessiner remonte', () => {
  const message = "Voici.\n[ARDOISE]\n[FIGURE]\npoint A\npoint B\ntrace un joli angle de 60° en A\ndroite (AB)\n[/FIGURE]\n[/ARDOISE]";

  test('telle que le professeur l’a écrite', () => {
    expect(lignesIncomprises(message)).toEqual(['trace un joli angle de 60° en A']);
  });

  test('rien quand tout est compris, ou sans figure', () => {
    expect(lignesIncomprises('[FIGURE]\npoint A\n[/FIGURE]')).toEqual([]);
    expect(lignesIncomprises('Bonjour')).toEqual([]);
  });
});

describe('une ligne incomprise n’arrête rien', () => {
  test('elle est ignorée, la figure se dessine', () => {
    const f = construireFigure('point A\nfais un joli dessin\npoint B\nsegment [AB]');
    expect(f.ignorees).toEqual(['fais un joli dessin']);
    expect(f.points.size).toBe(2);
  });
});

describe('le dessin', () => {
  test('un SVG que l’assainisseur garde : droites, angle droit, croix, noms', () => {
    const svg = svgDeFigure(PROGRAMME_AIMELINE);
    expect(svg.startsWith('<svg')).toBe(true);

    const arbre = analyserSchema(PROGRAMME_AIMELINE);
    expect(arbre).not.toBeNull();
    const balises = JSON.stringify(arbre);
    expect(balises).toContain('"balise":"line"');
    expect(balises).toContain('"balise":"polyline"');
    expect(balises).toContain('"balise":"path"');
    ['A', 'B', 'C', 'H', '(d)', "(d')"].forEach((nom) => expect(balises).toContain(`"${nom}"`));
  });

  test('le composant du tableau la dessine', () => {
    const { container } = render(<Schema contenu={PROGRAMME_AIMELINE} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const noms = [...svg.querySelectorAll('text')].map((t) => t.textContent);
    expect(noms).toEqual(expect.arrayContaining(['A', 'B', 'C', 'H', '(d)', "(d')"]));
    expect(svg.querySelectorAll('line').length).toBeGreaterThanOrEqual(3);
  });

  test('c’est un schéma du tableau', () => {
    expect(estUneFigure(PROGRAMME_AIMELINE)).toBe(true);
    expect(estUnSchema(PROGRAMME_AIMELINE)).toBe(true);
  });
});

describe('au tableau, jamais dans la voix', () => {
  const message = `Voici ta figure.\n[ARDOISE]\n${PROGRAMME_AIMELINE}\n[/ARDOISE]\nRegarde bien l'angle en H.`;

  test('le tableau reçoit la figure', () => {
    const [contenu] = extraireArdoises(message);
    expect(estUneFigure(contenu)).toBe(true);
  });

  test('la voix ne lit aucune commande', () => {
    const dit = texteParle(message);
    expect(dit).not.toMatch(/perpendiculaire|point A|FIGURE/);
    expect(dit).toContain('Voici ta figure.');
  });

  test('une figure posée hors du tableau y est rangée', () => {
    const horsTableau = `Voici ta figure.\n${PROGRAMME_AIMELINE}\nÀ toi.`;
    expect(envelopperFigures(horsTableau)).toContain('[ARDOISE][FIGURE]');
    expect(estUneFigure(extraireArdoises(horsTableau)[0])).toBe(true);
    expect(texteParle(horsTableau)).not.toMatch(/perpendiculaire/);
    expect(decouper(horsTableau).filter((s) => s.type === 'texte').map((s) => s.contenu).join('')).not.toMatch(/point A/);
  });

  test('pendant le flux, une figure pas encore refermée ne se dit pas', () => {
    const enCours = 'Je te la trace.\n[FIGURE]\npoint A\npoint B\nperpendic';
    expect(texteParle(enCours)).not.toMatch(/point|perpendic/);
    expect(ardoiseOuverte(enCours)).toBe(true);
  });
});
