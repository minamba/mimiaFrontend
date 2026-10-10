/**
 * LES ILLUSTRATIONS DES JEUX DE MESURES ET DE SOLIDES — 09/10/2026.
 *
 * Pour le tour du jardin, les solides et patrons, la géométrie de l'atelier et
 * la géométrie dans l'espace : tout `visuel` est de la donnée bien formée,
 * chacune de ses cotes (sauf « ? ») se lit dans la question, et le visuel ne
 * change rien au tirage (même graine, même partie).
 *
 * La géométrie dans l'espace n'a aucun visuel, et c'est voulu : vecteurs,
 * plans et droites en coordonnées ne se dessinent pas avec les formes du
 * dessinateur.
 */
import { erreursDuVisuel } from '../lib/jeux/visuels';
import * as jardin from '../lib/jeux/college/tour-du-jardin-college';
import * as solides from '../lib/jeux/college/solides-et-patrons';
import * as atelier from '../lib/jeux/lycee/geometrie-atelier';
import * as espace from '../lib/jeux/lycee/geometrie-espace';

const AVEC_VISUEL = [jardin, solides, atelier];
const MODULES = [...AVEC_VISUEL, espace];
const GRAINES = Array.from({ length: 40 }, (_, i) => 1000 + i * 37);

/** Toutes les manches d'un module : toutes classes, toutes graines. */
const manches = (mod) => mod.CLASSES.flatMap((classe) => GRAINES.flatMap((g) => mod.serie(g, classe)));

describe.each(MODULES.map((m) => [m.FAMILLE.cle, m]))('%s', (cle, mod) => {
  test('chaque visuel est de la donnée valide', () => {
    manches(mod).filter((m) => m.visuel).forEach((m) => {
      expect({ question: m.question, erreurs: erreursDuVisuel(m.visuel) }).toEqual({ question: m.question, erreurs: [] });
    });
  });

  test('chaque cote connue se lit dans la question', () => {
    manches(mod).filter((m) => m.visuel).forEach((m) => {
      const { angle = {} } = m.visuel;
      const textes = [...Object.values(m.visuel.cotes ?? {}), angle.valeur, angle.A, angle.B, angle.C].filter((c) => c && c !== '?');
      textes.forEach((c) => expect({ question: m.question, cote: c, lue: m.question.includes(c) }).toEqual({ question: m.question, cote: c, lue: true }));
    });
  });

  test('le visuel ne touche pas au tirage : même graine, même partie', () => {
    mod.CLASSES.forEach((classe) => {
      expect(mod.serie(4242, classe)).toEqual(mod.serie(4242, classe));
    });
  });
});

test.each(AVEC_VISUEL.map((m) => [m.FAMILLE.cle, m]))('%s : au moins une manche porte un visuel', (cle, mod) => {
  expect(manches(mod).some((m) => m.visuel)).toBe(true);
});

test('la géométrie de l’atelier illustre toutes ses manches', () => {
  expect(manches(atelier).every((m) => m.visuel)).toBe(true);
});

test('la géométrie dans l’espace reste sans visuel', () => {
  expect(manches(espace).some((m) => m.visuel)).toBe(false);
});
