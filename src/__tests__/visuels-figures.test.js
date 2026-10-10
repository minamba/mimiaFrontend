/**
 * LES ILLUSTRATIONS DES JEUX DE GÉOMÉTRIE — 09/10/2026.
 *
 * Pour chaque module, chaque classe et une quarantaine de graines : tout
 * `visuel` est de bonnes données (`erreursDuVisuel` vide), ne contient aucune
 * fonction, au moins une manche du module est dessinée, et ce qui est écrit
 * sur le dessin vient de la question (« ? » pour ce qu'on cherche).
 */
import { erreursDuVisuel } from '../lib/jeux/visuels';
import * as rapporteur from '../lib/jeux/college/rapporteur';
import * as detective from '../lib/jeux/college/detective-des-figures';
import * as chasseur from '../lib/jeux/college/chasseur-d-angles';
import * as echelle from '../lib/jeux/college/echelle-contre-le-mur';
import * as photo from '../lib/jeux/college/photo-agrandie';
import * as pente from '../lib/jeux/college/pente-du-toboggan';
import * as racine from '../lib/jeux/college/racine-cachee';
import * as produitScalaire from '../lib/jeux/lycee/produit-scalaire';

const MODULES = [rapporteur, detective, chasseur, echelle, photo, pente, racine, produitScalaire];
const GRAINES = Array.from({ length: 40 }, (_, i) => 1009 + i * 7919);

/** Vrai si une valeur, à n'importe quelle profondeur, est une fonction. */
const contientUneFonction = (v) => typeof v === 'function'
  || (v !== null && typeof v === 'object' && Object.values(v).some(contientUneFonction));

/** Tous les textes écrits sur un dessin : cotes, et valeurs des angles. */
const textes = (v) => {
  const a = v.angle ?? {};
  return [
    ...Object.values(v.cotes ?? {}),
    ...[a.valeur, a.valeur1, a.valeur2, a.A, a.B, a.C].filter(Boolean),
    ...(v.angles ?? []).map((x) => x.valeur),
  ];
};

const toutes = (mod) => mod.CLASSES.flatMap((classe) => GRAINES.flatMap((g) => mod.serie(g, classe)));

describe.each(MODULES.map((m) => [m.FAMILLE.cle, m]))('%s', (cle, mod) => {
  test.each(mod.CLASSES)('%s : des visuels valides', (classe) => {
    let dessinees = 0;
    GRAINES.forEach((g) => {
      mod.serie(g, classe).forEach((m) => {
        if (!m.visuel) return;
        dessinees += 1;
        expect({ question: m.question, erreurs: erreursDuVisuel(m.visuel) }).toEqual({ question: m.question, erreurs: [] });
        expect(contientUneFonction(m.visuel)).toBe(false);
      });
    });
    expect(dessinees).toBeGreaterThan(0);
  });

  test('la même graine redonne le même dessin', () => {
    mod.CLASSES.forEach((classe) => {
      expect(mod.serie(424242, classe)).toEqual(mod.serie(424242, classe));
    });
  });

  test('ce qui est écrit sur le dessin (hors « ? ») vient de la question', () => {
    toutes(mod).filter((m) => m.visuel).forEach((m) => {
      textes(m.visuel).filter((t) => t !== '?').forEach((t) => {
        expect(m.question).toContain(t.replace(/ (cm²|cm|m)$/, ''));
      });
    });
  });
});

describe('les valeurs du dessin sont celles de la question', () => {
  test('une seule grandeur cherchée par dessin (deux côtés pour deux carrés)', () => {
    [detective, chasseur, echelle, photo, racine].forEach((mod) => {
      toutes(mod).filter((m) => m.visuel).forEach((m) => {
        expect(textes(m.visuel).filter((t) => t === '?')).toHaveLength(m.visuel.forme === 'deux-carres' ? 2 : 1);
      });
    });
  });

  test('le rapporteur dessine l’angle de la question', () => {
    toutes(rapporteur).filter((m) => m.visuel?.forme === 'angle').forEach((m) => {
      const mesure = `${m.visuel.angle.mesure}°`;
      expect(m.consigne === 'lire-angle' ? m.bonne : m.question).toContain(mesure);
      expect(m.visuel.angle.valeur).toBe(m.consigne === 'lire-angle' ? '?' : mesure);
    });
  });

  test('l’angle partagé : les deux mesures font l’angle entier de la question', () => {
    toutes(rapporteur).filter((m) => m.consigne === 'angle-partage').forEach((m) => {
      const { mesure1, mesure2 } = m.visuel.angle;
      expect(mesure1 + mesure2).toBe(m.question.includes('droit') ? 90 : 180);
      expect(m.bonne).toBe(`${mesure2}°`);
    });
  });

  test('la sécante : droites parallèles dessinées seulement si la question le dit', () => {
    toutes(chasseur).filter((m) => m.consigne === 'angle-egal').forEach((m) => {
      expect(m.visuel.forme).toBe('secante');
      expect(m.visuel.paralleles !== false).toBe(!m.question.includes('NON'));
    });
  });

  test('les lettres du dessin sont celles de la question', () => {
    [...toutes(pente), ...toutes(photo), ...toutes(echelle)].filter((m) => m.visuel?.noms).forEach((m) => {
      m.visuel.noms.forEach((n) => expect(m.question).toContain(n));
    });
  });

  test('le toboggan à chaque manche, le papillon quand la question le décrit', () => {
    toutes(pente).forEach((m) => expect(m.visuel.forme).toBe('toboggan'));
    toutes(photo).filter((m) => m.consigne === 'thales').forEach((m) => {
      expect(Boolean(m.visuel.papillon)).toBe(m.question.includes('se coupent en A'));
    });
  });
});
