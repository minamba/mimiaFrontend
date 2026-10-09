/**
 * LES JEUX DE MATHS DU COLLÈGE, LOT A — onze modules de 6e, Nora.
 * Même épreuve que le CM2 (soixante parties chacun), puis, pour chaque jeu,
 * la bonne réponse RECALCULÉE à partir de la question affichée, et chaque
 * piège vérifié faux.
 */

import * as grandsNombres from '../lib/jeux/college/grands-nombres-college';
import * as loupe from '../lib/jeux/college/loupe-college';
import * as operations from '../lib/jeux/college/operations-college';
import * as partage from '../lib/jeux/college/partage-college';
import * as calculMental from '../lib/jeux/college/calcul-mental-college';
import * as droite from '../lib/jeux/college/droite-des-fractions';
import * as deuxTiers from '../lib/jeux/college/deux-tiers-du-sac';
import * as metre from '../lib/jeux/college/metre-ruban-college';
import * as temps from '../lib/jeux/college/combien-de-temps-college';
import * as rapporteur from '../lib/jeux/college/rapporteur';
import * as detective from '../lib/jeux/college/detective-des-figures';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les compétences de 6e en maths, copiées de competences-college.txt. */
const COMPETENCES = [
  'MATH_6E_ALG_INCONNUE', 'MATH_6E_ALG_MOTIFS', 'MATH_6E_ALGO_DEPLACEMENT',
  'MATH_6E_GEO_VOCABULAIRE', 'MATH_6E_GEO_PERPENDICULAIRE', 'MATH_6E_GEO_PARALLELE',
  'MATH_6E_GEO_CERCLE', 'MATH_6E_GEO_TRIANGLES', 'MATH_6E_GEO_QUADRILATERES',
  'MATH_6E_GEO_SYMETRIE', 'MATH_6E_GEO_CONSTRUCTION', 'MATH_6E_GEO_SOLIDES',
  'MATH_6E_PROP_RECONNAITRE', 'MATH_6E_PROP_COEFF', 'MATH_6E_PROP_POURCENT', 'MATH_6E_PROP_ECHELLE',
  'MATH_6E_DATA_TABLEAU', 'MATH_6E_DATA_GRAPHIQUE',
  'MATH_6E_MES_LONGUEUR', 'MATH_6E_MES_MASSE', 'MATH_6E_MES_DUREE', 'MATH_6E_MES_PERIMETRE',
  'MATH_6E_MES_AIRE', 'MATH_6E_MES_VOLUME', 'MATH_6E_MES_ANGLE', 'MATH_6E_MES_DISTANCE',
  'MATH_6E_NUM_ENTIERS', 'MATH_6E_NUM_DECIMAUX', 'MATH_6E_NUM_DEMI_DROITE', 'MATH_6E_NUM_ARRONDI',
  'MATH_6E_CALC_ADD', 'MATH_6E_CALC_MULT', 'MATH_6E_CALC_DIV_EUCL', 'MATH_6E_CALC_DIV_DEC',
  'MATH_6E_CALC_MENTAL', 'MATH_6E_CALC_PRIORITES', 'MATH_6E_DIVISIBILITE',
  'MATH_6E_FRAC_SENS', 'MATH_6E_FRAC_REPERER', 'MATH_6E_FRAC_EGALES', 'MATH_6E_FRAC_COMPARER',
  'MATH_6E_FRAC_ADD', 'MATH_6E_FRAC_QUANTITE', 'MATH_6E_FRAC_QUOTIENT',
];

const PREFIXES = { SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_' };

/** [nom, module, clé attendue]. */
const JEUX = [
  ['les grands nombres', grandsNombres, 'grands-nombres-college'],
  ['la loupe des centièmes', loupe, 'loupe-college'],
  ['les opérations posées', operations, 'operations-college'],
  ['le partage', partage, 'partage-college'],
  ['le calcul mental', calculMental, 'calcul-mental-college'],
  ['la droite des fractions', droite, 'droite-des-fractions'],
  ['les deux tiers du sac', deuxTiers, 'deux-tiers-du-sac'],
  ['le mètre ruban', metre, 'metre-ruban-college'],
  ['combien de temps', temps, 'combien-de-temps-college'],
  ['le rapporteur', rapporteur, 'rapporteur'],
  ['le détective des figures', detective, 'detective-des-figures'],
];

const CAS = JEUX.flatMap(([nom, module, cle]) => module.CLASSES.map((classe) => [`${nom} (${classe})`, module, cle, classe]));

describe.each(CAS)('%s', (_, module, cle, classe) => {
  it('la famille est en règle', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'MATHS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.MANCHES).toBe(8);
    expect(module.ESCAPE).toBeUndefined();
  });

  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, classe);
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => c.cle);
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(m.bonne);
        expect(typeof m.question).toBe('string');
        expect(m.question).toBeTruthy();
        m.choix.forEach((c) => expect(c.libelle).toBeTruthy());
        Object.keys(m.pieges ?? {}).forEach((p) => {
          expect(p).not.toBe(m.bonne);
          expect(cles).toContain(p);
        });
      });
    });
  });

  it('plusieurs sortes de manches dans une partie', () => {
    graines.forEach((g) => {
      expect(new Set(module.serie(g, classe).map((m) => m.consigne)).size).toBeGreaterThanOrEqual(3);
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(m.aide === undefined || Boolean(module.PHRASES[m.aide])).toBe(true);
      expect(module.verdict(m, m.bonne)).toBe('juste');
      m.choix.filter((c) => c.cle !== m.bonne).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté|faux\b/i);
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, classe)).toEqual(module.serie(77, classe));
    expect(module.serie(1758000123456, classe)).toEqual(module.serie(1758000123456, classe));
  });

  it('la fiche de la classe est remplie, avec des compétences du référentiel', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    fiche.competences.forEach((c) => {
      expect(COMPETENCES).toContain(c);
      expect(c).toContain(PREFIXES[classe]);
    });
  });

  it('les phrases sont fixes : aucun chiffre, des clés en kebab-case', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte).not.toMatch(/\d/);
      expect(texte.trim()).toBe(texte);
    });
  });

  it('le mot de la fin', () => {
    expect(module.bilan(module.MANCHES)).toBeTruthy();
    expect(module.bilan(0)).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé à partir de la question affichée. */
/* ------------------------------------------------------------------ */

const toutes = (module) => graines.flatMap((g) => module.serie(g, 'SIXIEME'));
const sorte = (module, consigne) => toutes(module).filter((m) => m.consigne === consigne);
const pieges = (m) => m.choix.map((c) => c.cle).filter((c) => c !== m.bonne);

/** « 3 450,25 » → 3450.25. */
const lire = (s) => Number(String(s).replace(/[\s ]/g, '').replace('−', '-').replace(',', '.'));
const NOMBRE = '[\\d\\u00a0]+(?:,\\d+)?';
const proche = (a, b) => Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
const valeurFraction = (f) => {
  const [n, d] = f.split('/').map(Number);
  return n / d;
};

describe('les grands nombres : exactitude', () => {
  it('le plus grand l’est vraiment, et seul', () => {
    [...sorte(grandsNombres, 'plus-grand-decimal'), ...sorte(grandsNombres, 'plus-grand-entier')].forEach((m) => {
      const b = lire(m.bonne);
      pieges(m).forEach((p) => expect(lire(p)).toBeLessThan(b));
    });
  });

  it('le piège du plus grand décimal a plus de chiffres après la virgule', () => {
    sorte(grandsNombres, 'plus-grand-decimal').forEach((m) => {
      Object.keys(m.pieges).forEach((p) => expect(p.split(',')[1].length).toBeGreaterThan(m.bonne.split(',')[1].length));
    });
  });

  const PUISSANCES = {
    centaines: 2, milliers: 3, 'dizaines de mille': 4, 'centaines de mille': 5, dixièmes: -1, centièmes: -2,
  };

  it('le chiffre et le nombre d’un rang', () => {
    [...sorte(grandsNombres, 'chiffre-des'), ...sorte(grandsNombres, 'chiffre-decimal')].forEach((m) => {
      const [, rang, n] = m.question.match(new RegExp(`^Le chiffre des (.+) dans (${NOMBRE}) \\?$`));
      const centiemes = Math.round(lire(n) * 100);
      const chiffre = Math.floor(centiemes / 10 ** (PUISSANCES[rang] + 2)) % 10;
      expect(m.bonne).toBe(String(chiffre));
      pieges(m).forEach((p) => expect(p).not.toBe(String(chiffre)));
    });
    sorte(grandsNombres, 'nombre-de').forEach((m) => {
      const [, rang, n] = m.question.match(new RegExp(`^Le nombre de (.+) dans (${NOMBRE}) \\?$`));
      const nombre = Math.floor(lire(n) / 10 ** PUISSANCES[rang]);
      expect(lire(m.bonne)).toBe(nombre);
      pieges(m).forEach((p) => expect(lire(p)).not.toBe(nombre));
    });
  });
});

describe('la loupe des centièmes : exactitude', () => {
  it('l’abscisse sur la graduation', () => {
    sorte(loupe, 'graduation').forEach((m) => {
      const [, a, b, k] = m.question.match(new RegExp(`^De (${NOMBRE}) à (${NOMBRE}) : dix parts égales\\. M est (\\d+) graduations après`));
      const attendu = lire(a) + (Number(k) * (lire(b) - lire(a))) / 10;
      expect(proche(lire(m.bonne), attendu)).toBe(true);
      pieges(m).forEach((p) => expect(proche(lire(p), attendu)).toBe(false));
    });
  });

  it('l’encadrement contient le nombre, à la bonne précision', () => {
    sorte(loupe, 'encadrer').forEach((m) => {
      const [, x, prec] = m.question.match(new RegExp(`^Encadre (${NOMBRE}) (à l’unité|au dixième)\\.$`));
      const pas = prec === 'à l’unité' ? 1 : 0.1;
      const valide = (c) => {
        const [lo, hi] = c.split(' et ').map(lire);
        const multiple = proche(Math.round(lo / pas) * pas, lo);
        return lo < lire(x) && lire(x) < hi && proche(hi - lo, pas) && multiple;
      };
      expect(valide(m.bonne)).toBe(true);
      pieges(m).forEach((p) => expect(valide(p)).toBe(false));
    });
  });

  it('l’arrondi', () => {
    const PAS = { 'à l’unité': 1000, 'au dixième': 100, 'au centième': 10 };
    sorte(loupe, 'arrondir').forEach((m) => {
      const [, x, prec] = m.question.match(new RegExp(`^Arrondi de (${NOMBRE}) (.+) \\?$`));
      const milliemes = Math.round(lire(x) * 1000);
      const attendu = (Math.round(milliemes / PAS[prec]) * PAS[prec]) / 1000;
      expect(proche(lire(m.bonne), attendu)).toBe(true);
      pieges(m).forEach((p) => expect(proche(lire(p), attendu)).toBe(false));
    });
  });
});

describe('les opérations posées : exactitude', () => {
  it('somme, différence, produit', () => {
    toutes(operations).forEach((m) => {
      const [, a, op, b] = m.question.match(new RegExp(`^(${NOMBRE}) ([+−×]) (${NOMBRE}) = \\?$`));
      const x = lire(a);
      const y = lire(b);
      const attendu = { '+': x + y, '−': x - y, '×': x * y }[op];
      expect(proche(lire(m.bonne), attendu)).toBe(true);
      pieges(m).forEach((p) => expect(proche(lire(p), attendu)).toBe(false));
    });
  });

  it('l’addition piège bien les parties décimales collées', () => {
    sorte(operations, 'addition').forEach((m) => {
      expect(Object.values(m.pieges)).toContain('virgule-sous-virgule');
    });
  });
});

describe('le partage : exactitude', () => {
  it('quotient et reste : b × q + r = a, et r < b ; jamais pour un piège', () => {
    sorte(partage, 'quotient-reste').forEach((m) => {
      const [, a, b] = m.question.match(new RegExp(`^(${NOMBRE}) ÷ (\\d+) : quotient et reste \\?$`));
      const valide = (c) => {
        const [q, r] = c.match(/\d+/g).map(Number);
        return Number(b) * q + r === lire(a) && r < Number(b);
      };
      expect(valide(m.bonne)).toBe(true);
      pieges(m).forEach((p) => expect(valide(p)).toBe(false));
    });
  });

  it('les divisions décimales', () => {
    [...sorte(partage, 'division-decimale'), ...sorte(partage, 'decimal-par-entier')].forEach((m) => {
      const [, a, b] = m.question.match(new RegExp(`^(${NOMBRE}) ÷ (\\d+) = \\?$`));
      const attendu = lire(a) / Number(b);
      expect(proche(lire(m.bonne), attendu)).toBe(true);
      pieges(m).forEach((p) => expect(proche(lire(p), attendu)).toBe(false));
    });
  });
});

describe('le calcul mental : exactitude', () => {
  it('les calculs exacts', () => {
    [...sorte(calculMental, 'nombre-proche'), ...sorte(calculMental, 'fois-cinq')].forEach((m) => {
      const [a, b] = m.question.match(/\d+/g).map(Number);
      expect(lire(m.bonne)).toBe(a * b);
      pieges(m).forEach((p) => expect(lire(p)).not.toBe(a * b));
    });
  });

  it('l’ordre de grandeur est le choix le plus proche du vrai produit', () => {
    sorte(calculMental, 'ordre-de-grandeur').forEach((m) => {
      const [, a, b] = m.question.match(new RegExp(`^(${NOMBRE}) × (${NOMBRE}) ≈ \\?$`));
      const vrai = lire(a) * lire(b);
      const ecart = (c) => Math.abs(Math.log(lire(c) / vrai));
      pieges(m).forEach((p) => expect(ecart(m.bonne)).toBeLessThan(ecart(p)));
      expect(ecart(m.bonne)).toBeLessThan(Math.log(1.5));
    });
  });
});

describe('la droite des fractions : exactitude', () => {
  it('placer une fraction : n-ième trait, traits + 1 parts', () => {
    sorte(droite, 'placer-fraction').forEach((m) => {
      const [, traits, n] = m.question.match(/^Entre 0 et 1, (\d+) traits partagent l’unité\. M est sur le (\d+)(?:er|e) trait après 0\./);
      const attendu = Number(n) / (Number(traits) + 1);
      expect(m.bonne).toBe(`${n}/${Number(traits) + 1}`);
      pieges(m).forEach((p) => expect(proche(valeurFraction(p), attendu)).toBe(false));
    });
  });

  it('la fraction est un quotient', () => {
    sorte(droite, 'fraction-quotient').forEach((m) => {
      const [n, d] = m.question.match(/\d+/g).map(Number);
      expect(proche(lire(m.bonne), n / d)).toBe(true);
      pieges(m).forEach((p) => expect(proche(lire(p), n / d)).toBe(false));
    });
    sorte(droite, 'quotient-ecrit').forEach((m) => {
      const [b, a] = m.question.match(/\d+/g).map(Number);
      const valeur = (c) => (c.includes('/') ? valeurFraction(c) : Number(c));
      expect(proche(b * valeur(m.bonne), a)).toBe(true);
      pieges(m).forEach((p) => expect(proche(b * valeur(p), a)).toBe(false));
    });
  });

  it('additionner : même dénominateur gardé', () => {
    sorte(droite, 'addition-fractions').forEach((m) => {
      const [n1, d1, n2, d2] = m.question.match(/\d+/g).map(Number);
      expect(d1).toBe(d2);
      expect(m.bonne).toBe(`${n1 + n2}/${d1}`);
      pieges(m).forEach((p) => expect(proche(valeurFraction(p), (n1 + n2) / d1)).toBe(false));
    });
  });
});

describe('les deux tiers du sac : exactitude', () => {
  it('la fraction d’une quantité, et ce qui reste', () => {
    [...sorte(deuxTiers, 'fraction-de'), ...sorte(deuxTiers, 'reste')].forEach((m) => {
      const [, n, d] = m.question.match(/(\d+)\/(\d+)/).map(Number);
      const apres = m.question.slice(m.question.indexOf('/') + String(d).length + 1);
      const N = apres.includes('heure') ? 60 : Number(apres.match(/\d+/)[0]);
      const prise = (N * n) / d;
      const attendu = m.consigne === 'reste' ? N - prise : prise;
      expect(Number.isInteger(attendu)).toBe(true);
      expect(Number(m.bonne)).toBe(attendu);
      pieges(m).forEach((p) => expect(Number(p)).not.toBe(attendu));
    });
  });

  it('quelle fraction : la partie sur le tout', () => {
    sorte(deuxTiers, 'quelle-fraction').forEach((m) => {
      const [P, N] = m.question.match(/\d+/g).map(Number);
      expect(m.bonne).toBe(`${P}/${N}`);
      pieges(m).forEach((p) => expect(proche(valeurFraction(p), P / N)).toBe(false));
    });
  });
});

describe('le mètre ruban : exactitude', () => {
  const PUISSANCE = {
    km: 3, hm: 2, dam: 1, m: 0, dm: -1, cm: -2, mm: -3,
    kg: 3, hg: 2, dag: 1, g: 0, dg: -1, cg: -2, mg: -3,
    hL: 2, daL: 1, L: 0, dL: -1, cL: -2, mL: -3,
  };
  it('chaque conversion, et dans la bonne famille d’unités', () => {
    toutes(metre).forEach((m) => {
      const [, x, de, vers] = m.question.match(new RegExp(`^(${NOMBRE}) (\\w+) = \\? (\\w+)$`));
      expect(de.slice(-1).toLowerCase()).toBe(vers.slice(-1).toLowerCase());
      const attendu = lire(x) * 10 ** (PUISSANCE[de] - PUISSANCE[vers]);
      expect(proche(lire(m.bonne), attendu)).toBe(true);
      pieges(m).forEach((p) => expect(proche(lire(p), attendu)).toBe(false));
    });
  });
});

describe('combien de temps : exactitude', () => {
  /** « 8 h 05 » → 485 ; null si les minutes dépassent 59. */
  const horaire = (s) => {
    const [h, mn] = s.match(/^(\d+) h (\d\d)$/).slice(1).map(Number);
    return mn < 60 ? h * 60 + mn : null;
  };
  /** « 2 h 35 min » ou « 35 min » → 155 ; null si les minutes dépassent 59. */
  const duree = (s) => {
    const t = s.match(/^(?:(\d+) h )?(\d+) min$/);
    const h = Number(t[1] ?? 0);
    const mn = Number(t[2]);
    return mn < 60 ? h * 60 + mn : null;
  };

  it('la durée entre deux horaires', () => {
    sorte(temps, 'duree-entre').forEach((m) => {
      const [, a, b] = m.question.match(/^Départ (\d+ h \d\d), arrivée (\d+ h \d\d)\. Durée \?$/);
      const attendu = horaire(b) - horaire(a);
      expect(duree(m.bonne)).toBe(attendu);
      pieges(m).forEach((p) => expect(duree(p)).not.toBe(attendu));
    });
  });

  it('l’heure d’arrivée', () => {
    sorte(temps, 'heure-arrivee').forEach((m) => {
      const [, a, d] = m.question.match(/^Départ (\d+ h \d\d), durée (.+)\. Arrivée \?$/);
      const attendu = horaire(a) + duree(d);
      expect(attendu).toBeLessThan(24 * 60);
      expect(horaire(m.bonne)).toBe(attendu);
      pieges(m).forEach((p) => expect(horaire(p)).not.toBe(attendu));
    });
  });

  it('les conversions de durées', () => {
    sorte(temps, 'convertir-duree').forEach((m) => {
      const [, x, unite] = m.question.match(new RegExp(`^(${NOMBRE}) (h|min) = \\?$`));
      const attendu = unite === 'h' ? Math.round(lire(x) * 60) : lire(x);
      expect(proche(lire(x) * (unite === 'h' ? 60 : 1), attendu)).toBe(true);
      expect(duree(m.bonne)).toBe(attendu);
      pieges(m).forEach((p) => expect(duree(p)).not.toBe(attendu));
    });
  });
});

describe('le rapporteur : exactitude', () => {
  it('on lit sur l’échelle qui part de zéro sur le premier côté', () => {
    sorte(rapporteur, 'lire-angle').forEach((m) => {
      const [, zero, int, ext] = m.question.match(/le 0 de l’échelle (intérieure|extérieure)\. \[OB\] passe par (\d+) sur l’échelle intérieure et (\d+) sur l’échelle extérieure/);
      expect(Number(int) + Number(ext)).toBe(180);
      const attendu = `${zero === 'intérieure' ? int : ext}°`;
      expect(m.bonne).toBe(attendu);
      expect(Object.keys(m.pieges)).toContain(`${180 - Number(attendu.slice(0, -1))}°`);
    });
  });

  it('aigu, droit ou obtus', () => {
    sorte(rapporteur, 'nature-angle').forEach((m) => {
      const a = Number(m.question.match(/\d+/)[0]);
      const attendu = a === 90 ? 'droit' : (a < 90 ? 'aigu' : 'obtus');
      expect(a).toBeGreaterThan(0);
      expect(a).toBeLessThan(180);
      expect(m.bonne).toBe(attendu);
    });
  });

  it('l’angle partagé', () => {
    sorte(rapporteur, 'angle-partage').forEach((m) => {
      const entier = m.question.includes('angle droit') ? 90 : 180;
      const a = Number(m.question.match(/(\d+)°/)[1]);
      expect(m.bonne).toBe(`${entier - a}°`);
      pieges(m).forEach((p) => expect(p).not.toBe(`${entier - a}°`));
    });
  });
});

describe('le détective des figures : exactitude', () => {
  /** Relu indépendamment du module : le nom le plus précis, et TOUS les noms vrais. */
  const TRIANGLES = {
    'Deux côtés de même longueur, le troisième plus court.': ['isocele', ['isocele']],
    'Trois côtés de même longueur.': ['equilateral', ['equilateral', 'isocele']],
    'Un angle droit, et les deux côtés de cet angle de même longueur.': ['rectangle-isocele', ['rectangle-isocele', 'rectangle', 'isocele']],
    'Un angle droit, et trois côtés de longueurs toutes différentes.': ['rectangle', ['rectangle']],
  };
  /** Côtés ou angles donnés : on classe par le calcul. */
  const classer = (texte) => {
    const n = texte.match(/\d+/g).map(Number);
    const egaux = new Set(n).size;
    if (texte.startsWith('Côtés')) {
      const [a, b, c] = [...n].sort((x, y) => x - y);
      expect(a + b).toBeGreaterThan(c);
      const droit = a * a + b * b === c * c;
      if (egaux === 1) return ['equilateral', ['equilateral', 'isocele']];
      if (egaux === 2) return droit ? ['rectangle-isocele', ['rectangle-isocele', 'rectangle', 'isocele']] : ['isocele', ['isocele']];
      return droit ? ['rectangle', ['rectangle']] : ['quelconque', ['quelconque']];
    }
    if (n.length === 1) return n[0] === 60 ? ['equilateral', ['equilateral', 'isocele']] : null;
    expect(n.reduce((s, x) => s + x, 0)).toBe(180);
    const droit = n.includes(90);
    if (egaux === 1) return ['equilateral', ['equilateral', 'isocele']];
    if (egaux === 2) return droit ? ['rectangle-isocele', ['rectangle-isocele', 'rectangle', 'isocele']] : ['isocele', ['isocele']];
    return droit ? ['rectangle', ['rectangle']] : ['quelconque', ['quelconque']];
  };

  it('chaque triangle de la banque a le bon nom, et ses pièges sont des noms faux', () => {
    detective.BANQUE_TRIANGLES.forEach((t) => {
      const [bonne, vrais] = TRIANGLES[t.texte] ?? classer(t.texte);
      expect(t.bonne).toBe(bonne);
      t.faux.forEach((f) => expect(vrais).not.toContain(f));
    });
  });

  const QUADRILATERES = {
    'Quatre côtés de même longueur, aucun angle droit.': ['losange', ['losange', 'parallelogramme']],
    'Quatre angles droits, deux côtés voisins de longueurs différentes.': ['rectangle', ['rectangle', 'parallelogramme']],
    'Côtés opposés parallèles, aucun angle droit, deux côtés voisins de longueurs différentes.': ['parallelogramme', ['parallelogramme']],
    'Diagonales qui se coupent en leur milieu, perpendiculaires, de longueurs différentes.': ['losange', ['losange', 'parallelogramme']],
    'Diagonales qui se coupent en leur milieu, de même longueur, non perpendiculaires.': ['rectangle', ['rectangle', 'parallelogramme']],
    'Diagonales qui se coupent en leur milieu, de longueurs différentes, non perpendiculaires.': ['parallelogramme', ['parallelogramme']],
  };

  it('chaque quadrilatère de la banque a le bon nom, et ses pièges sont des noms faux', () => {
    detective.BANQUE_QUADRILATERES.forEach((q) => {
      const [bonne, vrais] = QUADRILATERES[q.texte];
      expect(q.bonne).toBe(bonne);
      q.faux.forEach((f) => expect(vrais).not.toContain(f));
    });
  });

  const VRAIES = {
    'un losange': ['diag-perp', 'cotes-egaux', 'cotes-paralleles', 'diag-milieu'],
    'un rectangle': ['diag-egales', 'angles-droits', 'cotes-paralleles', 'diag-milieu', 'un-angle-droit'],
    'un parallélogramme': ['diag-milieu', 'cotes-paralleles'],
    'un carré': ['diag-perp', 'diag-egales', 'diag-milieu', 'angles-droits', 'cotes-egaux', 'cotes-paralleles', 'un-angle-droit', 'diag-perp-egales'],
  };

  it('toujours vrai : la bonne l’est pour toute la famille, les pièges ne le sont pas', () => {
    sorte(detective, 'propriete-toujours').forEach((m) => {
      const figure = m.question.match(/^Toujours vrai pour (.+) \?$/)[1];
      expect(VRAIES[figure]).toContain(m.bonne);
      pieges(m).forEach((p) => expect(VRAIES[figure]).not.toContain(p));
    });
  });

  it('les manches jouées reprennent la banque', () => {
    sorte(detective, 'quel-triangle').forEach((m) => {
      const [bonne] = TRIANGLES[m.question] ?? classer(m.question);
      expect(m.bonne).toBe(bonne);
    });
    sorte(detective, 'quel-quadrilatere').forEach((m) => {
      expect(m.bonne).toBe(QUADRILATERES[m.question][0]);
    });
  });

  it('rayon et diamètre', () => {
    sorte(detective, 'cercle-mesure').forEach((m) => {
      const x = lire(m.question.match(new RegExp(`(${NOMBRE}) cm`))[1]);
      const attendu = m.question.includes('rayon de') ? 2 * x : x / 2;
      const cm = (c) => lire(c.replace(' cm', ''));
      expect(proche(cm(m.bonne), attendu)).toBe(true);
      pieges(m).forEach((p) => expect(proche(cm(p), attendu)).toBe(false));
    });
  });

  it('dedans, dessus, dehors : on compare au rayon', () => {
    sorte(detective, 'cercle-position').forEach((m) => {
      const [, sorteDonnee, l, d] = m.question.match(/de (rayon|diamètre) (\d+) cm\. OM = (\d+) cm/);
      const r = sorteDonnee === 'rayon' ? Number(l) : Number(l) / 2;
      const attendu = Number(d) === r ? 'sur' : (Number(d) < r ? 'interieur' : 'exterieur');
      expect(m.bonne).toBe(attendu);
    });
  });
});
