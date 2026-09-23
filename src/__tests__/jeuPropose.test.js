/**
 * LA BALISE DU JEU PROPOSÉ — Camara, le 23/09/2026.
 *
 * `[JEU]CE1/course-des-tables[/JEU]` : ni lue, ni affichée, et lisible par le
 * front pour dessiner la carte. Trois choses à garantir, et chacune a déjà
 * fait défaut à une autre balise : l'identifiant s'extrait, la balise
 * disparaît de l'écran comme de la voix, et une balise coupée par le flux ne
 * s'affiche pas.
 */

import {
  jeuPropose, decouper, texteParle, aQuelqueChoseAMontrer,
} from '../lib/storage/ardoise';

const MESSAGE = 'Bon travail sur les tables. Pour t’entraîner, fais une partie de '
  + 'La course des tables dans Mes jeux. À bientôt !\n[JEU]CE1/course-des-tables[/JEU]\n[FIN_SEANCE]';

describe('le jeu proposé par le professeur', () => {
  it('s’extrait de la balise, classe et clé', () => {
    expect(jeuPropose(MESSAGE)).toEqual({ classe: 'CE1', cle: 'course-des-tables' });
  });

  it('tolère les espaces et la casse, et garde la dernière occurrence', () => {
    expect(jeuPropose('[jeu] cp/boite-de-dix [/jeu]')).toEqual({ classe: 'CP', cle: 'boite-de-dix' });
    expect(jeuPropose('[JEU]CP/marchande[/JEU] puis [JEU]CE2/le-miroir[/JEU]'))
      .toEqual({ classe: 'CE2', cle: 'le-miroir' });
  });

  it('vaut null sans balise, et sur une balise mal formée', () => {
    expect(jeuPropose('À bientôt !')).toBeNull();
    expect(jeuPropose(null)).toBeNull();
    expect(jeuPropose('[JEU]course-des-tables[/JEU]')).toBeNull();
  });

  it('ne s’affiche pas : la phrase du professeur reste, la balise part', () => {
    const affiche = decouper(MESSAGE).map((s) => s.contenu).join('');

    expect(affiche).toContain('fais une partie de La course des tables');
    expect(affiche).not.toContain('[JEU]');
    expect(affiche).not.toContain('course-des-tables');
  });

  it('ne se dit pas non plus', () => {
    const dit = texteParle(MESSAGE);

    expect(dit).toContain('À bientôt');
    expect(dit).not.toContain('JEU');
    expect(dit).not.toContain('CE1/');
  });

  it('un message qui ne porte que la balise n’ouvre pas de bulle vide', () => {
    expect(aQuelqueChoseAMontrer('[JEU]CE1/course-des-tables[/JEU]')).toBe(false);
  });

  it('une balise coupée par le flux ne s’affiche pas le temps qu’elle arrive', () => {
    const affiche = decouper('À bientôt !\n[JEU]CE1/cour').map((s) => s.contenu).join('');

    expect(affiche).toBe('À bientôt !\n');
  });
});
