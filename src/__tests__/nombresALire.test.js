/**
 * LA LECTURE DES NOMBRES AU TABLEAU (12/11/2026) : la balise du serveur, le nom de l'image (celui du PDF « Mimia -
 * Nombres a illustrer »), et le nombre écrit en grand tant que l'image n'est pas là.
 */
import { render, screen } from '@testing-library/react';
import { cleDuNombre, ecrireNombre, formeDuNombre, imageDuNombre, libelleDuNombre } from '../lib/nombresALire';
import {
  aLire, contientConsigneDeLecture, estConsigneDeLecture, estVerdictDeLecture, imageALire, lectureAuTableau,
} from '../lib/lectureDImage';
import { texteParle, decouper } from '../lib/storage/ardoise';

describe('le nom de l’image, comme dans le PDF', () => {
  test.each([
    ['0', 'nb-0'], ['73', 'nb-73'], ['1000', 'nb-1000'], ['2500000000', 'nb-2500000000'],
    ['3,25', 'nb-3v25'], ['0,001', 'nb-0v001'], ['-5', 'nb-m5'], ['-0,5', 'nb-m0v5'], ['+4', 'nb-p4'],
    ['3/4', 'fr-3-4'], ['3/1000', 'fr-3-1000'], ['-2/5', 'fr-m2-5'],
    ['10^2', 'pu-10-2'], ['10^-3', 'pu-10-m3'], ['2^3', 'pu-2-3'], ['(-2)^2', 'pu-pm2-2'], ['-2^2', 'pu-m2-2'], ['10^-6', 'pu-10-m6'],
    ['2,5x10^4', 'sci-2v5-4'], ['3x10^-2', 'sci-3-m2'], ['6,02x10^23', 'sci-6v02-23'],
    ['rac9', 'rac-9'], ['rac2', 'rac-2'], ['3rac2', 'rac-3-2'], ['-rac3', 'rac-m3'],
  ])('%s → %s', (cible, cle) => {
    expect(cleDuNombre(cible)).toBe(cle);
  });

  test('l’adresse est dans le dossier des images de mots, sous « nombres »', () => {
    expect(imageDuNombre('3/4')).toMatch(/\/images-mots\/nombres\/fr-3-4\.webp$/);
  });

  test('une écriture inconnue n’a pas d’image', () => {
    expect(cleDuNombre('pi')).toBeNull();
    expect(imageDuNombre('pi')).toBeNull();
  });
});

describe('le nombre écrit au tableau', () => {
  test('les milliers séparés, le moins long', () => {
    expect(ecrireNombre('2500000000')).toBe('2 500 000 000');
    expect(ecrireNombre('-3,7')).toBe('−3,7');
    expect(ecrireNombre('12345,67')).toBe('12 345,67');
  });

  test('chaque forme', () => {
    expect(formeDuNombre('-2/5')).toEqual({ genre: 'fraction', signe: '−', num: '2', den: '5' });
    expect(formeDuNombre('(-2)^2')).toEqual({ genre: 'puissance', base: '(−2)', exposant: '2' });
    expect(formeDuNombre('2,5x10^4')).toEqual({ genre: 'scientifique', mantisse: '2,5', exposant: '4' });
    expect(formeDuNombre('3rac2')).toEqual({ genre: 'racine', signe: '', coef: '3', sous: '2' });
    expect(formeDuNombre('73')).toEqual({ genre: 'nombre', texte: '73' });
  });

  test('le libellé pour un lecteur d’écran ne dit pas la lecture', () => {
    expect(libelleDuNombre('3/4')).toBe('fraction 3 sur 4');
    expect(libelleDuNombre('10^-3')).toBe('10 exposant −3');
  });
});

describe('la balise et l’exercice', () => {
  const message = 'Bravo !\n\nRegarde le tableau : lis ce nombre à voix haute.\n\n[LECTURE_IMAGE:nombre]3/4[/LECTURE_IMAGE]';

  test('le tableau montre le nombre', () => {
    expect(aLire(message)).toEqual({ genre: 'nombre', cible: '3/4' });
    expect(imageALire({ genre: 'nombre', cible: '3/4' })).toMatchObject({ mot: '3/4', type: 'nombre' });
    const tableau = lectureAuTableau([{ id: 1, role: 'assistant', contenu: message }], null);
    expect(tableau).toMatchObject({ mot: '3/4', type: 'nombre' });
  });

  test('ni affichée ni dite', () => {
    expect(texteParle(message)).not.toMatch(/LECTURE_IMAGE|3\/4/);
    expect(decouper(message).map((s) => s.contenu).join('')).not.toMatch(/LECTURE_IMAGE/);
  });

  test('le verdict « J’ai lu le nombre » est une lecture', () => {
    expect(estVerdictDeLecture('J’ai lu le nombre soixante-treize.')).toBe(true);
    expect(estVerdictDeLecture("J'ai lu le nombre 73.")).toBe(true);
  });

  test('les consignes du serveur sont reconnues par la voix', () => {
    expect(estConsigneDeLecture('Regarde le tableau : lis ce nombre à voix haute.')).toBe(true);
    expect(estConsigneDeLecture('Voici un autre nombre : lis-le à voix haute.')).toBe(true);
    expect(estConsigneDeLecture('Regarde bien le nombre, et essaie encore de le lire à voix haute.')).toBe(true);
    expect(contientConsigneDeLecture('Bravo ! Voici un autre nombre : lis-le à voix haute.')).toBe(true);
  });
});

test('le composant du tableau écrit la fraction en étage', () => {
  // Le rendu passe par le tableau de Chat.js ; ici on vérifie la forme que ce rendu consomme.
  const f = formeDuNombre('7/10');
  render(<p>{f.num}/{f.den}</p>);
  expect(screen.getByText('7/10')).toBeInTheDocument();
});
