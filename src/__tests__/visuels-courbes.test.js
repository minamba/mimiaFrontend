/**
 * LES COURBES DES JEUX DE FONCTIONS — le 09/10/2026. Six modules de Nora
 * portent désormais un `visuel` de type 'courbe' (voir `lib/jeux/visuels.js`) :
 * lire un graphique, les fonctions de référence, le second degré, la
 * dérivation, fonctions et paraboles, la convexité.
 *
 * Pour chaque module, chaque classe et quarante graines :
 *   - tout `visuel` est bien formé (`erreursDuVisuel` vide) et n'est fait que
 *     de données (un aller-retour JSON le redonne à l'identique) ;
 *   - au moins une manche par classe porte un dessin ;
 *   - chaque point marqué est sur une des courbes dessinées, ou sur la
 *     tangente (le point B d'une tangente à lire), et dans la fenêtre ;
 *   - la même graine redonne la même partie, dessin compris.
 */

import { erreursDuVisuel, valeur } from '../lib/jeux/visuels';
import * as lireUnGraphique from '../lib/jeux/lycee/lire-un-graphique';
import * as fonctionsDeReference from '../lib/jeux/lycee/fonctions-de-reference';
import * as secondDegre from '../lib/jeux/lycee/second-degre';
import * as derivation from '../lib/jeux/lycee/derivation';
import * as fonctionsEtParaboles from '../lib/jeux/lycee/fonctions-et-paraboles';
import * as convexite from '../lib/jeux/lycee/convexite';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 40 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['lire-un-graphique', lireUnGraphique],
  ['fonctions-de-reference', fonctionsDeReference],
  ['second-degre', secondDegre],
  ['derivation', derivation],
  ['fonctions-et-paraboles', fonctionsEtParaboles],
  ['convexite', convexite],
];

/** Toutes les manches d'un module, avec leur classe. */
const manchesDe = (module) => module.CLASSES.flatMap((classe) => graines.flatMap((g) => module.serie(g, classe).map((m) => [classe, m])));

/** Le point est-il sur une des courbes, ou sur la tangente ? */
function surUnTrait(v, p) {
  const surCourbe = (v.fonctions ?? []).some((f) => Math.abs(valeur(f, p.x) - p.y) < 0.01);
  const t = v.tangente;
  const surTangente = t && Math.abs(t.y + t.pente * (p.x - t.x) - p.y) < 0.01;
  return surCourbe || Boolean(surTangente);
}

describe.each(MODULES)('%s : les courbes', (nom, module) => {
  const manches = manchesDe(module);

  it('chaque dessin est bien formé, et fait de données seulement', () => {
    manches.filter(([, m]) => m.visuel).forEach(([, m]) => {
      expect(erreursDuVisuel(m.visuel)).toEqual([]);
      expect(m.visuel.type).toBe('courbe');
      expect(JSON.parse(JSON.stringify(m.visuel))).toEqual(m.visuel);
    });
  });

  it('au moins une manche par classe porte un dessin', () => {
    module.CLASSES.forEach((classe) => {
      expect(manches.some(([c, m]) => c === classe && m.visuel)).toBe(true);
    });
  });

  it('chaque point marqué est sur une courbe (ou sur la tangente), dans la fenêtre', () => {
    manches.filter(([, m]) => m.visuel?.points).forEach(([, m]) => {
      const w = m.visuel.fenetre;
      m.visuel.points.forEach((p) => {
        if (!surUnTrait(m.visuel, p)) throw new Error(`${nom} / ${m.consigne} : point (${p.x} ; ${p.y}) hors des courbes`);
        expect(p.x).toBeGreaterThanOrEqual(w.xmin);
        expect(p.x).toBeLessThanOrEqual(w.xmax);
        expect(p.y).toBeGreaterThanOrEqual(w.ymin);
        expect(p.y).toBeLessThanOrEqual(w.ymax);
      });
    });
  });

  it('la tangente touche la courbe au point annoncé', () => {
    manches.filter(([, m]) => m.visuel?.tangente).forEach(([, m]) => {
      const { x, y } = m.visuel.tangente;
      expect(m.visuel.fonctions.some((f) => Math.abs(valeur(f, x) - y) < 0.01)).toBe(true);
    });
  });

  it('la même graine redonne la même partie, dessin compris', () => {
    module.CLASSES.forEach((classe) => {
      graines.slice(0, 10).forEach((g) => expect(module.serie(g, classe)).toEqual(module.serie(g, classe)));
    });
  });
});

describe('ce qu’on cherche n’est pas marqué', () => {
  it('le sommet à trouver (second degré, paraboles) n’est pas un point du dessin', () => {
    manchesDe(secondDegre).filter(([, m]) => m.consigne === 'sommet' || m.consigne === 'canonique')
      .forEach(([, m]) => expect(m.visuel.points).toBeUndefined());
    manchesDe(fonctionsEtParaboles).filter(([, m]) => m.consigne === 'lire' && m.question.includes('Sommet'))
      .forEach(([, m]) => expect(m.visuel.points).toBeUndefined());
  });

  it('la tangente à écrire n’est pas tracée', () => {
    [derivation, fonctionsEtParaboles].forEach((module) => {
      manchesDe(module).filter(([, m]) => m.consigne === 'tangente')
        .forEach(([, m]) => expect(m.visuel?.tangente).toBeUndefined());
    });
  });
});

describe('les dessins des banques écrites à la main', () => {
  it('chaque fonction de référence de la convexité a sa courbe', () => {
    convexite.REFERENCES.forEach(([fonction, intervalle]) => {
      const v = convexite.dessinReference(fonction, intervalle);
      expect(v).not.toBeNull();
      expect(erreursDuVisuel(v)).toEqual([]);
    });
  });

  it('cos et sin, dessinés point par point, suivent bien cos et sin', () => {
    const cos = convexite.dessinReference('x ↦ cos x', '[−π/2 ; π/2]').fonctions[0];
    const sin = convexite.dessinReference('x ↦ sin x', '[0 ; π]').fonctions[0];
    [-1.2, -0.4, 0, 0.7, 1.3].forEach((x) => expect(Math.abs(valeur(cos, x) - Math.cos(x))).toBeLessThan(0.01));
    [0.2, 1, 1.6, 2.5, 3].forEach((x) => expect(Math.abs(valeur(sin, x) - Math.sin(x))).toBeLessThan(0.01));
  });
});
