/**
 * LES JEUX DE MATHS DE SECONDE — huit modules : intervalles, puissances et
 * racines, fonctions de référence, équation de droite, vecteurs,
 * probabilités, statistiques, Python.
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun autre choix ne doit
 * être juste lui aussi. Pour Python, un petit interpréteur indépendant
 * exécute le programme écrit dans la question.
 *
 * Pas d'`expect` dans un `if` : les écarts sont collectés dans un tableau,
 * qui doit rester vide.
 */

import * as intervalles from '../lib/jeux/lycee/intervalles-et-inegalites';
import * as puissances from '../lib/jeux/lycee/puissances-et-racines-lycee';
import * as fonctions from '../lib/jeux/lycee/fonctions-de-reference';
import * as droite from '../lib/jeux/lycee/equation-de-droite';
import * as vecteurs from '../lib/jeux/lycee/vecteurs-et-coordonnees';
import * as probas from '../lib/jeux/lycee/probabilites-seconde';
import * as stats from '../lib/jeux/lycee/statistiques-seconde';
import * as python from '../lib/jeux/lycee/python-variable';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['intervalles-et-inegalites', intervalles],
  ['puissances-et-racines-lycee', puissances],
  ['fonctions-de-reference', fonctions],
  ['equation-de-droite', droite],
  ['vecteurs-et-coordonnees', vecteurs],
  ['probabilites-seconde', probas],
  ['statistiques-seconde', stats],
  ['python-variable', python],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur colonne NIVEAU, recopiés tels quels. */
const CODES = {
  MATH_2DE_INTERVALLES: 'SECONDE',
  MATH_2DE_LOGIQUE_ENSEMBLES: 'SECONDE',
  MATH_2DE_PUISSANCES: 'SECONDE',
  MATH_2DE_FONC_CARRE: 'SECONDE',
  MATH_2DE_FONC_VARIATION: 'SECONDE',
  MATH_2DE_FONC_AFFINE: 'SECONDE',
  MATH_2DE_DROITES: 'SECONDE',
  MATH_2DE_VECTEURS: 'SECONDE',
  MATH_2DE_REPERAGE: 'SECONDE',
  MATH_2DE_COLINEARITE: 'SECONDE',
  MATH_2DE_PROBA_EVENEMENTS: 'SECONDE',
  MATH_2DE_PROBA_MODELE: 'SECONDE',
  MATH_2DE_STAT_INDICATEURS: 'SECONDE',
  MATH_2DE_ALGO_PYTHON: 'SECONDE',
};

/** [module, classe, le module] pour chaque classe de chaque module. */
const CAS = MODULES.flatMap(([nom, module]) => module.CLASSES.map((classe) => [nom, classe, module]));

describe.each(CAS)('%s en %s', (_, classe, module) => {
  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, classe);
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        m.choix.forEach((c) => {
          expect(String(c.libelle).length).toBeGreaterThan(0);
          expect(String(c.libelle)).not.toMatch(/null|undefined|NaN|Infinity|e[+-]\d/);
        });
        expect(m.question).not.toMatch(/null|undefined|NaN|Infinity/);
        Object.keys(m.pieges ?? {}).forEach((k) => {
          expect(cles).toContain(k);
          expect(k).not.toBe(String(m.bonne));
        });
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(m.aide === undefined || Boolean(module.PHRASES[m.aide])).toBe(true);
      expect(module.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      expect(module.verdict(m, '§')).toBe(`${m.consigne}-regle`);
      m.choix.forEach((c) => {
        const s = module.verdict(m, c.cle);
        const phrase = module.PHRASES[s] ?? '';
        expect(s === 'juste').toBe(String(c.cle) === String(m.bonne));
        expect(s === 'juste' || (phrase.length > 0 && !/raté|faux/i.test(phrase))).toBe(true);
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, classe)).toEqual(module.serie(77, classe));
    expect(module.serie(1758000123456, classe)).toEqual(module.serie(1758000123456, classe));
  });

  it('la classe a son titre, son accroche et ses compétences officielles', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    fiche.competences.forEach((c) => expect([c, CODES[c]]).toEqual([c, classe]));
  });
});

describe.each(MODULES)('%s : la famille et les phrases', (cle, module) => {
  it('la famille porte sa clé, et la seule classe est la seconde', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'MATHS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    expect(module.CLASSES).toEqual(['SECONDE']);
    expect(module.MANCHES).toBe(8);
    expect(module.bilan(8)).toBeTruthy();
  });

  it('chaque phrase est un texte fixe : clé en kebab-case, aucun chiffre, aucun « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim().length).toBeGreaterThan(0);
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté/i);
      // Typographie française : une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });

  it('plusieurs sortes de manches dans chaque partie', () => {
    graines.forEach((g) => {
      const sortes = new Set(module.serie(g, 'SECONDE').map((m) => m.consigne));
      expect(sortes.size).toBeGreaterThanOrEqual(4);
    });
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module) => graines.flatMap((g) => module.serie(g, 'SECONDE'));
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/** « −2,5 » → −2.5 ; « 325 000 » → 325000. */
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/[\s ]/g, '').replace(',', '.'));
const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

/**
 * Pour chaque manche de la consigne : `attendu(m)` rend la valeur juste,
 * `lire(choix)` celle d'un choix, `egal` les compare. La bonne réponse doit
 * valoir l'attendu, aucun autre choix ne le doit. Rend la liste des écarts.
 */
function ecarts(module, consigne, attendu, lire, egal = (a, b) => a === b) {
  const liste = toutes(module).filter((m) => m.consigne === consigne);
  const fautes = [];
  if (liste.length === 0) fautes.push(`aucune manche « ${consigne} »`);
  liste.forEach((m) => {
    const juste = attendu(m);
    if (!egal(lire(m.bonne), juste)) fautes.push(`${m.question} → ${m.bonne}, attendu ${juste}`);
    autres(m).forEach((c) => {
      if (egal(lire(c), juste)) fautes.push(`${m.question} → le choix ${c} est juste lui aussi`);
    });
  });
  return fautes;
}

/* ------------------------------------------------------ les intervalles */

const borne = (s) => {
  if (s === '−∞') return -Infinity;
  if (s === '+∞') return Infinity;
  return num(s);
};
/** « ]−3 ; 5] » → { a, g (fermé à gauche), b, d (fermé à droite) }. */
function lireIv(s) {
  const m = String(s).match(/^([[\]])(\S+) ; (\S+)([[\]])$/);
  if (!m) return null;
  return {
    a: borne(m[2]), g: m[1] === '[', b: borne(m[3]), d: m[4] === ']',
  };
}
const cleIv = (I) => (I ? `${I.a}|${I.g}|${I.b}|${I.d}` : 'illisible');

function interIv(I, J) {
  const [a, g] = I.a > J.a ? [I.a, I.g] : J.a > I.a ? [J.a, J.g] : [I.a, I.g && J.g]; // eslint-disable-line no-nested-ternary
  const [b, d] = I.b < J.b ? [I.b, I.d] : J.b < I.b ? [J.b, J.d] : [I.b, I.d && J.d]; // eslint-disable-line no-nested-ternary
  return {
    a, g, b, d,
  };
}
function unionIv(I, J) {
  const [a, g] = I.a < J.a ? [I.a, I.g] : J.a < I.a ? [J.a, J.g] : [I.a, I.g || J.g]; // eslint-disable-line no-nested-ternary
  const [b, d] = I.b > J.b ? [I.b, I.d] : J.b > I.b ? [J.b, J.d] : [I.b, I.d || J.d]; // eslint-disable-line no-nested-ternary
  return {
    a, g, b, d,
  };
}

describe('intervalles et inégalités : l’intervalle juste, et un seul', () => {
  const parCle = (attendu) => (m) => cleIv(attendu(m));
  const lire = (s) => cleIv(lireIv(s));

  it('écrire en intervalle', () => {
    const attendu = (m) => {
      let r = m.question.match(/tels que (\S+) (<|≤) x (<|≤) (\S+)$/);
      if (r) {
        return {
          a: num(r[1]), g: r[2] === '≤', b: num(r[4]), d: r[3] === '≤',
        };
      }
      r = m.question.match(/tels que x (<|≤|>|≥) (\S+)$/);
      const v = num(r[2]);
      if (r[1] === '>' || r[1] === '≥') {
        return {
          a: v, g: r[1] === '≥', b: Infinity, d: false,
        };
      }
      return {
        a: -Infinity, g: false, b: v, d: r[1] === '≤',
      };
    };
    expect(ecarts(intervalles, 'ecrire-intervalle', parCle(attendu), lire)).toEqual([]);
  });

  it('intersection et réunion', () => {
    const deux = (m) => {
      const r = m.question.match(/^I = (.+) et J = (.+)\n/);
      return [lireIv(r[1]), lireIv(r[2])];
    };
    const recouvrent = toutes(intervalles).filter((m) => m.consigne === 'reunion').filter((m) => {
      const [I, J] = deux(m);
      return !(I.a < J.b && J.a < I.b);
    });
    expect(recouvrent).toEqual([]);
    expect(ecarts(intervalles, 'intersection', parCle((m) => interIv(...deux(m))), lire)).toEqual([]);
    expect(ecarts(intervalles, 'reunion', parCle((m) => unionIv(...deux(m))), lire)).toEqual([]);
  });

  it('la valeur absolue, une distance', () => {
    const attendu = (m) => {
      const r = m.question.match(/\|x ([−+]) (\d+)\| (<|≤) (\d+)$/);
      const c = r[1] === '−' ? Number(r[2]) : -Number(r[2]);
      const rayon = Number(r[4]);
      return {
        a: c - rayon, g: r[3] === '≤', b: c + rayon, d: r[3] === '≤',
      };
    };
    expect(ecarts(intervalles, 'valeur-absolue', parCle(attendu), lire)).toEqual([]);
  });

  it('le centre et le rayon', () => {
    const attendu = (m) => {
      const I = lireIv(m.question.split(' est ')[0]);
      return `${(I.a + I.b) / 2}|${(I.b - I.a) / 2}`;
    };
    const lireCR = (s) => {
      const r = s.match(/^c = (\S+) ; r = (\S+)$/);
      return `${num(r[1])}|${num(r[2])}`;
    };
    expect(ecarts(intervalles, 'centre-rayon', attendu, lireCR)).toEqual([]);
  });

  it('encadrer k x + m, en renversant l’ordre si k est négatif', () => {
    const attendu = (m) => {
      const r = m.question.match(/^x ∈ (.+)\nÀ quel intervalle appartient (\S+)x ([+−]) (\d+) \?$/);
      const I = lireIv(r[1]);
      const k = num(r[2]);
      const c = r[3] === '+' ? Number(r[4]) : -Number(r[4]);
      const [fa, fb] = [k * I.a + c, k * I.b + c];
      return k > 0 ? {
        a: fa, g: I.g, b: fb, d: I.d,
      } : {
        a: fb, g: I.d, b: fa, d: I.g,
      };
    };
    expect(ecarts(intervalles, 'encadrer', parCle(attendu), lire)).toEqual([]);
  });
});

/* -------------------------------------------- puissances et racines */

const EXPOSANTS = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};
const exposant = (s) => Number([...s].map((c) => EXPOSANTS[c]).join(''));
/** « 1/8 » → 0.125 ; « −8 » → −8 ; « √25 » → 5 ; « 5√2 » → 7.07… */
function valeur(s) {
  const t = String(s);
  let r = t.match(/^(\S+)\/(\S+)$/);
  if (r) return num(r[1]) / num(r[2]);
  r = t.match(/^(\d*)√(\d+)$/);
  if (r) return (r[1] ? Number(r[1]) : 1) * Math.sqrt(Number(r[2]));
  return num(t);
}
/** Un nombre décimal écrit « 0,00042 » ou « 4,2 » → [chiffres significatifs, exposant de dix]. */
function decimal(s) {
  const [ent, frac = ''] = String(s).replace(/[\s ]/g, '').split(',');
  let chiffres = (ent + frac).replace(/^0+/, '');
  let e = -frac.length;
  while (chiffres.endsWith('0')) {
    chiffres = chiffres.slice(0, -1);
    e += 1;
  }
  return [chiffres, e];
}

describe('puissances et racines : le calcul juste, et un seul', () => {
  it('les règles des puissances', () => {
    // « a » seul : l'exposant 1, qui ne s'écrit pas.
    const expo = (s) => (s === '' ? 1 : exposant(s));
    const attendu = (m) => {
      let r = m.question.match(/^[ax](\S*) × [ax](\S*) = \?$/);
      if (r) return expo(r[1]) + expo(r[2]);
      r = m.question.match(/^[ax](\S*) ÷ [ax](\S*) = \?$/);
      if (r) return expo(r[1]) - expo(r[2]);
      r = m.question.match(/^\([ax](\S+)\)(\S+) = \?$/);
      return expo(r[1]) * expo(r[2]);
    };
    const lire = (s) => {
      const r = s.match(/^[ax](\S*)$/);
      return r ? expo(r[1]) : 'illisible';
    };
    expect(ecarts(puissances, 'regles-puissances', attendu, lire)).toEqual([]);
  });

  it('l’exposant négatif', () => {
    const attendu = (m) => {
      const r = m.question.match(/^(\d+)(\S+) = \?$/);
      return Number(r[1]) ** exposant(r[2]);
    };
    expect(ecarts(puissances, 'puissance-negative', attendu, valeur, proche)).toEqual([]);
  });

  it('simplifier une racine : la bonne valeur, et sous la racine le plus petit entier', () => {
    const sansCarre = (n) => {
      for (let d = 2; d * d <= n; d += 1) if (n % (d * d) === 0) return false;
      return true;
    };
    const carre = (s) => {
      const r = s.match(/^(\d*)√(\d+)$/);
      const c = r[1] ? Number(r[1]) : 1;
      return c * c * Number(r[2]);
    };
    expect(ecarts(puissances, 'simplifier-racine', (m) => Number(m.question.match(/^√(\d+)/)[1]), carre)).toEqual([]);
    const pasSimplifiees = toutes(puissances).filter((m) => m.consigne === 'simplifier-racine')
      .filter((m) => !sansCarre(Number(m.bonne.split('√')[1])));
    expect(pasSimplifiees).toEqual([]);
  });

  it('calculer avec des racines', () => {
    const attendu = (m) => {
      const r = m.question.match(/^√(\d+) ([+×]) √(\d+) = \?$/);
      const [a, b] = [Math.sqrt(Number(r[1])), Math.sqrt(Number(r[3]))];
      return r[2] === '+' ? a + b : a * b;
    };
    expect(ecarts(puissances, 'racines', attendu, valeur, proche)).toEqual([]);
  });

  it('l’écriture scientifique : la bonne valeur ET un facteur entre 1 et 10', () => {
    const attendu = (m) => decimal(m.question.replace(/ = \?$/, '')).join('e');
    const lire = (s) => {
      const r = s.match(/^(\S+) × 10(\S+)$/);
      if (!/^[1-9](,\d+)?$/.test(r[1])) return 'pas scientifique';
      const [ch, e] = decimal(r[1]);
      return `${ch}e${e + exposant(r[2])}`;
    };
    expect(ecarts(puissances, 'scientifique', attendu, lire)).toEqual([]);
  });
});

/* -------------------------------------------- les fonctions de référence */

const FONCTIONS = {
  'la fonction carré': (x) => x * x,
  'la fonction inverse': (x) => 1 / x,
  'la fonction racine carrée': (x) => Math.sqrt(x),
  'la fonction cube': (x) => x * x * x,
};
const DOMAINE = {
  'la fonction carré': () => true,
  'la fonction inverse': (x) => x !== 0,
  'la fonction racine carrée': (x) => x >= 0,
  'la fonction cube': () => true,
};

/** « (−3,2)² », « 2,7² », « 1/(−2,3) », « 1/2,3 », « 1,5³ », « √7,3 » → sa valeur. */
function image(s) {
  const t = s.trim();
  let r = t.match(/^\(?([^()²³]+)\)?²$/);
  if (r) return num(r[1]) ** 2;
  r = t.match(/^\(?([^()²³]+)\)?³$/);
  if (r) return num(r[1]) ** 3;
  r = t.match(/^1\/\(?([^()]+)\)?$/);
  if (r) return 1 / num(r[1]);
  r = t.match(/^√(.+)$/);
  return Math.sqrt(num(r[1]));
}

describe('les fonctions de référence : le sens de variation juste, et un seul', () => {
  it('les variations, vérifiées point par point sur l’intervalle', () => {
    const attendu = (m) => {
      const r = m.question.match(/^Sur (.+), (la fonction .+) est…$/);
      const I = lireIv(r[1]);
      const f = FONCTIONS[r[2]];
      const [a, b] = [Math.max(I.a, -50), Math.min(I.b, 50)];
      const points = Array.from({ length: 401 }, (_, i) => a + ((b - a) * i) / 400)
        .filter((x) => DOMAINE[r[2]](x) && (x !== I.a || I.g) && (x !== I.b || I.d));
      const v = points.map(f);
      const monte = v.every((y, i) => i === 0 || y > v[i - 1]);
      const descend = v.every((y, i) => i === 0 || y < v[i - 1]);
      if (monte) return 'Croissante';
      if (descend) return 'Décroissante';
      return 'Ni croissante ni décroissante';
    };
    expect(ecarts(fonctions, 'variations', attendu, (s) => s)).toEqual([]);
  });

  it('comparer les images en lettres, sur tous les couples qui vérifient la condition', () => {
    const VALEURS = [-10, -5, -3, -2, -1.5, -1, -0.5, -0.1, 0, 0.1, 0.5, 1, 1.5, 2, 3, 5, 10];
    const verifie = (condition, a, b) => {
      const j = condition.split(' ');
      const val = (x) => ({ a, b }[x] ?? Number(x));
      for (let i = 1; i < j.length; i += 2) {
        const [g, d] = [val(j[i - 1]), val(j[i + 1])];
        if (j[i] === '<' && !(g < d)) return false;
        if (j[i] === '≤' && !(g <= d)) return false;
      }
      return true;
    };
    const attendu = (m) => {
      const r = m.question.match(/^On sait que (.+)\.\nQue dire de (\S+) et (\S+) \?$/);
      const forme = r[2];
      const f = {
        'a²': (x) => x * x, '1/a': (x) => 1 / x, 'a³': (x) => x * x * x, '√a': (x) => Math.sqrt(x),
      }[forme];
      const couples = VALEURS.flatMap((a) => VALEURS.map((b) => [a, b])).filter(([a, b]) => verifie(r[1], a, b));
      if (couples.length < 5) return 'trop peu de couples';
      if (couples.every(([a, b]) => f(a) < f(b))) return `${r[2]} < ${r[3]}`;
      if (couples.every(([a, b]) => f(a) > f(b))) return `${r[2]} > ${r[3]}`;
      return 'On ne peut pas conclure';
    };
    expect(ecarts(fonctions, 'comparer-images', attendu, (s) => s)).toEqual([]);
  });

  it('comparer deux nombres précis', () => {
    const attendu = (m) => {
      const [g, d] = m.question.split('…').map(image);
      return g < d ? '<' : '>';
    };
    expect(ecarts(fonctions, 'comparer-nombres', attendu, (s) => s)).toEqual([]);
    // Le petit lecteur d'images connaît ses formes.
    expect(image('(−3,2)²')).toBeCloseTo(10.24);
    expect(image('1/(−2,5)')).toBeCloseTo(-0.4);
    expect(image('1,5³')).toBeCloseTo(3.375);
    expect(image('√6,25')).toBeCloseTo(2.5);
  });

  it('l’extremum lu dans un tableau de variations', () => {
    const attendu = (m) => {
      const l = m.question.split('\n');
      const xs = l[1].replace('x : ', '').split(' | ').map(num);
      const fs = l[2].replace('f(x) : ', '').split(/ [↗↘] /).map(num);
      const sens = l[2].match(/[↗↘]/g);
      // Le tableau est cohérent : chaque flèche dit vrai.
      if (sens.some((s, i) => (s === '↗') !== (fs[i + 1] > fs[i])) || xs.some((x, i) => i > 0 && x <= xs[i - 1])) return 'tableau incohérent';
      return /minimum/.test(l[3]) ? Math.min(...fs) : Math.max(...fs);
    };
    expect(ecarts(fonctions, 'extremum-tableau', attendu, num)).toEqual([]);
  });

  it('l’extremum de la fonction carré sur un intervalle', () => {
    const attendu = (m) => {
      const r = m.question.match(/^Sur (.+), le (minimum|maximum) de la fonction carré \?$/);
      const I = lireIv(r[1]);
      const bornes = [I.a * I.a, I.b * I.b];
      if (r[2] === 'maximum') return Math.max(...bornes);
      return I.a <= 0 && I.b >= 0 ? 0 : Math.min(...bornes);
    };
    expect(ecarts(fonctions, 'extremum-carre', attendu, num)).toEqual([]);
  });
});

/* ------------------------------------------------- l'équation de droite */

const points = (s) => [...s.matchAll(/([A-D])\((\S+) ; (\S+)\)/g)].reduce((o, r) => ({ ...o, [r[1]]: [num(r[2]), num(r[3])] }), {});
/** « y = −2x + 3 » → [−2, 3] ; « y = 4 » → [0, 4]. */
function lireDroite(s) {
  const t = s.replace(/^\(d\) : /, '').replace(/^y = /, '');
  if (!t.includes('x')) return [0, num(t)];
  const [avant, apres] = t.split('x');
  let m = num(avant);
  if (avant === '') m = 1;
  if (avant === '−') m = -1;
  const p = apres.trim() === '' ? 0 : num(apres.replace(/\s/g, ''));
  return [m, p];
}
/** « −x + 3y = −1 » → [−1, 3, −1]. */
function lireLineaire(s) {
  const r = s.match(/^(−?\d*)x ([+−]) (\d*)y = (\S+)$/);
  const coef = (c) => {
    if (c === '' || c === '−') return c === '' ? 1 : -1;
    return num(c);
  };
  const b = coef(r[3]) * (r[2] === '+' ? 1 : -1);
  return [coef(r[1]), b, num(r[4])];
}
const lireCouple = (s) => {
  const r = String(s).match(/^\((\S+) ; (\S+)\)$/);
  return r ? [num(r[1]), num(r[2])] : null;
};
const memeCouple = (u, v) => Boolean(u && v) && proche(u[0], v[0]) && proche(u[1], v[1]);

describe('l’équation de droite : la réponse juste, et une seule', () => {
  it('le lecteur d’équations sait lire', () => {
    expect(lireDroite('y = −x + 3')).toEqual([-1, 3]);
    expect(lireDroite('y = 2x − 5')).toEqual([2, -5]);
    expect(lireDroite('y = 4x')).toEqual([4, 0]);
    expect(lireDroite('y = −7')).toEqual([0, -7]);
    expect(lireLineaire('−x − 3y = −1')).toEqual([-1, -3, -1]);
    expect(lireLineaire('2x + y = 7')).toEqual([2, 1, 7]);
  });

  it('le coefficient directeur', () => {
    const attendu = (m) => {
      const { A, B } = points(m.question);
      return (B[1] - A[1]) / (B[0] - A[0]);
    };
    expect(ecarts(droite, 'coefficient-directeur', attendu, valeur, proche)).toEqual([]);
  });

  it('l’ordonnée à l’origine', () => {
    const attendu = (m) => {
      const coef = num(m.question.match(/coefficient directeur (\S+) passe/)[1]);
      const { A } = points(m.question);
      return A[1] - coef * A[0];
    };
    expect(ecarts(droite, 'ordonnee-origine', attendu, num, proche)).toEqual([]);
  });

  it('l’équation réduite : elle passe par A et par B', () => {
    const passe = (m, s) => {
      const { A, B } = points(m.question);
      const [a, b] = lireDroite(s);
      return proche(a * A[0] + b, A[1]) && proche(a * B[0] + b, B[1]);
    };
    const fautes = [];
    toutes(droite).filter((m) => m.consigne === 'equation-reduite').forEach((m) => {
      if (!passe(m, m.bonne)) fautes.push(`${m.question} → ${m.bonne}`);
      autres(m).forEach((c) => { if (passe(m, c)) fautes.push(`${m.question} → ${c} juste aussi`); });
    });
    expect(fautes).toEqual([]);
  });

  it('les parallèles : même coefficient, autre droite', () => {
    const fautes = [];
    const liste = toutes(droite).filter((m) => m.consigne === 'paralleles');
    expect(liste.length).toBeGreaterThan(0);
    liste.forEach((m) => {
      const [md, pd] = lireDroite(m.question.split('\n')[0]);
      const parallele = (s) => {
        const [a, b] = lireDroite(s);
        return a === md && b !== pd;
      };
      if (!parallele(m.bonne)) fautes.push(`${m.question} → ${m.bonne}`);
      autres(m).forEach((c) => { if (lireDroite(c)[0] === md) fautes.push(`${m.question} → ${c} parallèle aussi`); });
    });
    expect(fautes).toEqual([]);
  });

  it('le système : la bonne réponse vérifie les deux équations, aucune autre', () => {
    const fautes = [];
    toutes(droite).filter((m) => m.consigne === 'systeme').forEach((m) => {
      const [e1, e2] = m.question.split('\n').slice(0, 2).map(lireLineaire);
      const solution = (s) => {
        const [x, y] = lireCouple(s);
        return e1[0] * x + e1[1] * y === e1[2] && e2[0] * x + e2[1] * y === e2[2];
      };
      if (e1[0] * e2[1] - e1[1] * e2[0] === 0) fautes.push(`${m.question} : pas une solution unique`);
      if (!solution(m.bonne)) fautes.push(`${m.question} → ${m.bonne}`);
      autres(m).forEach((c) => { if (solution(c)) fautes.push(`${m.question} → ${c} juste aussi`); });
    });
    expect(fautes).toEqual([]);
  });
});

/* ------------------------------------------------ vecteurs et coordonnées */

describe('vecteurs et coordonnées : la réponse juste, et une seule', () => {
  it('les coordonnées du vecteur AB', () => {
    const attendu = (m) => {
      const { A, B } = points(m.question);
      return [B[0] - A[0], B[1] - A[1]];
    };
    expect(ecarts(vecteurs, 'coordonnees-vecteur', attendu, lireCouple, memeCouple)).toEqual([]);
  });

  it('la somme et k u − v', () => {
    const attendu = (m) => {
      const r = m.question.match(/u\((\S+) ; (\S+)\) et v\((\S+) ; (\S+)\)\nCoordonnées de (\d*)u ([+−]) v \?$/);
      const [a, b, c, d] = [r[1], r[2], r[3], r[4]].map(num);
      const k = r[5] === '' ? 1 : Number(r[5]);
      const s = r[6] === '+' ? 1 : -1;
      return [k * a + s * c, k * b + s * d];
    };
    expect(ecarts(vecteurs, 'combinaison', attendu, lireCouple, memeCouple)).toEqual([]);
  });

  it('le milieu', () => {
    const attendu = (m) => {
      const { A, B } = points(m.question);
      return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    };
    expect(ecarts(vecteurs, 'milieu', attendu, lireCouple, memeCouple)).toEqual([]);
  });

  it('la distance', () => {
    const attendu = (m) => {
      const { A, B } = points(m.question);
      return Math.hypot(B[0] - A[0], B[1] - A[1]);
    };
    expect(ecarts(vecteurs, 'distance', attendu, valeur, proche)).toEqual([]);
  });

  it('la valeur de m qui rend colinéaires', () => {
    const fautes = [];
    toutes(vecteurs).filter((m) => m.consigne === 'colineaire-valeur').forEach((m) => {
      const r = m.question.match(/u\((\S+) ; m\) et v\((\S+) ; (\S+)\)/);
      const [a, c, d] = [r[1], r[2], r[3]].map(num);
      const det = (x) => a * d - x * c;
      if (det(num(m.bonne)) !== 0) fautes.push(`${m.question} → ${m.bonne}`);
      autres(m).forEach((x) => { if (det(num(x)) === 0) fautes.push(`${m.question} → ${x} juste aussi`); });
    });
    expect(fautes).toEqual([]);
  });

  it('colinéaires ou non : le déterminant', () => {
    const attendu = (m) => {
      const r = m.question.match(/u\((\S+) ; (\S+)\) et v\((\S+) ; (\S+)\)/);
      const [a, b, c, d] = [r[1], r[2], r[3], r[4]].map(num);
      return a * d - b * c === 0 ? 'Colinéaires' : 'Pas colinéaires';
    };
    expect(ecarts(vecteurs, 'colineaire-test', attendu, (s) => s)).toEqual([]);
  });

  it('le parallélogramme : vecteur AB = vecteur DC', () => {
    const fautes = [];
    toutes(vecteurs).filter((m) => m.consigne === 'parallelogramme').forEach((m) => {
      const { A, B, C } = points(m.question);
      const convient = (s) => {
        const D = lireCouple(s);
        return B[0] - A[0] === C[0] - D[0] && B[1] - A[1] === C[1] - D[1];
      };
      if (!convient(m.bonne)) fautes.push(`${m.question} → ${m.bonne}`);
      autres(m).forEach((c) => { if (convient(c)) fautes.push(`${m.question} → ${c} juste aussi`); });
    });
    expect(fautes).toEqual([]);
  });
});

/* ------------------------------------------------------ les probabilités */

const proba = (q, nom) => num(q.match(new RegExp(`P\\(${nom}\\) = (\\S+)`))[1]);

describe('les probabilités : la probabilité juste, et une seule', () => {
  it('la formule de la réunion, dans les deux sens', () => {
    const union = (m) => proba(m.question, 'A') + proba(m.question, 'B') - proba(m.question, 'A ∩ B');
    const inter = (m) => proba(m.question, 'A') + proba(m.question, 'B') - proba(m.question, 'A ∪ B');
    expect(ecarts(probas, 'formule-union', union, num, proche)).toEqual([]);
    expect(ecarts(probas, 'formule-inter', inter, num, proche)).toEqual([]);
    const horsBornes = toutes(probas).filter((m) => m.consigne.startsWith('formule'))
      .filter((m) => [m.bonne, ...m.question.match(/= (\d,\d+)/g).map((x) => x.slice(2))].some((x) => num(x) <= 0 || num(x) > 1));
    expect(horsBornes).toEqual([]);
  });

  it('le contraire', () => {
    const attendu = (m) => {
      const q = m.question;
      if (q.includes('P(A ∩ Ā)')) return 0;
      if (q.includes('P(A ∪ Ā)')) return 1;
      if (q.startsWith('P(Ā)')) return 1 - proba(q, 'Ā');
      return 1 - proba(q, 'A');
    };
    expect(ecarts(probas, 'contraire', attendu, num, proche)).toEqual([]);
  });

  it('le tableau croisé', () => {
    const attendu = (m) => {
      const l = m.question.split('\n');
      const T = Number(l[0].match(/\((\d+) au total\)/)[1]);
      const ligne = (s) => s.match(/: (\d+) .*, (\d+) /).slice(1).map(Number);
      const [[n11, n12], [n21, n22]] = [ligne(l[1]), ligne(l[2])];
      if (n11 + n12 + n21 + n22 !== T) return 'total faux';
      const [L, C] = l[4].match(/^(\S) : « .* » ; (\S) : « .* »$/).slice(1);
      const dans = {
        [L]: [true, true, false, false], [C]: [true, false, true, false],
      };
      const effectifs = [n11, n12, n21, n22];
      const demande = l[5].match(/^P\((.+)\) = \?$/)[1];
      let garde;
      if (demande === C) garde = dans[C];
      else if (demande === `${L} ∩ ${C}`) garde = dans[L].map((x, i) => x && dans[C][i]);
      else garde = dans[L].map((x, i) => x || dans[C][i]);
      return effectifs.reduce((s, n, i) => s + (garde[i] ? n : 0), 0) / T;
    };
    expect(ecarts(probas, 'tableau-croise', attendu, valeur, proche)).toEqual([]);
  });

  it('les événements, ensembles d’issues', () => {
    const predicat = (texte) => {
      let r = texte.match(/supérieur ou égal à (\d+)/);
      if (r) return (x) => x >= Number(r[1]);
      r = texte.match(/inférieur ou égal à (\d+)/);
      if (r) return (x) => x <= Number(r[1]);
      if (/multiple de 3/.test(texte)) return (x) => x % 3 === 0;
      if (/impair/.test(texte)) return (x) => x % 2 === 1;
      if (/pair/.test(texte)) return (x) => x % 2 === 0;
      throw new Error(texte);
    };
    const attendu = (m) => {
      const l = m.question.split('\n');
      const n = /six faces/.test(l[0]) ? 6 : Number(l[0].match(/de 1 à (\d+)/)[1]);
      const issues = Array.from({ length: n }, (_, i) => i + 1);
      const A = predicat(l[1]);
      const derniere = l[l.length - 1];
      let garde;
      if (derniere === 'Ā = ?') garde = (x) => !A(x);
      else {
        const B = predicat(l[2]);
        garde = derniere === 'A ∩ B = ?' ? (x) => A(x) && B(x) : (x) => A(x) || B(x);
      }
      return issues.filter(garde).join(',');
    };
    const lire = (s) => (s === '∅' ? '' : s.replace(/[{}]/g, '').split(' ; ').map(Number).sort((a, b) => a - b).join(','));
    expect(ecarts(probas, 'evenements', attendu, lire)).toEqual([]);
  });
});

/* ------------------------------------------------------ les statistiques */

const serieDe = (s) => s.split(' ; ').map(num);
const moyenneDe = (l) => l.reduce((a, b) => a + b, 0) / l.length;
const ecartTypeDe = (l) => {
  const m = moyenneDe(l);
  return Math.sqrt(moyenneDe(l.map((x) => (x - m) ** 2)));
};

describe('les statistiques : l’indicateur juste, et un seul', () => {
  it('la moyenne, simple et pondérée', () => {
    const simple = (m) => moyenneDe(serieDe(m.question.match(/^Série : (.+)\n/)[1]));
    expect(ecarts(stats, 'moyenne', simple, num, proche)).toEqual([]);
    const ponderee = (m) => {
      const v = serieDe(m.question.match(/Valeurs : (.+)\n/)[1]);
      const e = serieDe(m.question.match(/Effectifs : (.+)\n/)[1]);
      return v.reduce((s, x, i) => s + x * e[i], 0) / e.reduce((a, b) => a + b, 0);
    };
    expect(ecarts(stats, 'moyenne-ponderee', ponderee, num, proche)).toEqual([]);
  });

  it('la médiane', () => {
    const attendu = (m) => {
      const s = serieDe(m.question.match(/^Série : (.+)\n/)[1]).sort((a, b) => a - b);
      const n = s.length;
      return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    };
    expect(ecarts(stats, 'mediane', attendu, num, proche)).toEqual([]);
  });

  it('les quartiles, par leur définition : au moins un quart (ou trois quarts) des valeurs en dessous ou égales', () => {
    const attendu = (m) => {
      const l = m.question.split('\n');
      const s = serieDe(l[1]);
      if (s.some((x, i) => i > 0 && x < s[i - 1])) return 'série non rangée';
      const part = /Premier/.test(l[2]) ? 0.25 : 0.75;
      return s.find((v) => s.filter((x) => x <= v).length >= part * s.length);
    };
    expect(ecarts(stats, 'quartile', attendu, num, proche)).toEqual([]);
  });

  it('l’écart type', () => {
    const attendu = (m) => {
      const s = serieDe(m.question.match(/^Série : (.+)\n/)[1]);
      const moy = num(m.question.match(/Moyenne : (\S+)/)[1]);
      return proche(moyenneDe(s), moy) ? ecartTypeDe(s) : 'moyenne annoncée fausse';
    };
    expect(ecarts(stats, 'ecart-type', attendu, num, proche)).toEqual([]);
  });

  it('la dispersion comparée', () => {
    const attendu = (m) => {
      const [A, B] = m.question.split('\n').slice(0, 2).map((l) => serieDe(l.slice(4)));
      const [a, b] = [ecartTypeDe(A), ecartTypeDe(B)];
      if (proche(a, b)) return 'Le même';
      return a > b ? 'Série A' : 'Série B';
    };
    expect(ecarts(stats, 'dispersion', attendu, (s) => s)).toEqual([]);
  });

  it('la transformation affine', () => {
    const attendu = (m) => {
      const r = m.question.match(/moyenne (\S+) et pour écart type (\S+)\.\nOn multiplie chaque valeur par (\S+), puis on (ajoute|retire) (\d+)\.\n(Nouvelle moyenne|Nouvel écart type) \?$/);
      const [moy, et, a] = [r[1], r[2], r[3]].map(num);
      const b = (r[4] === 'ajoute' ? 1 : -1) * Number(r[5]);
      return r[6] === 'Nouvelle moyenne' ? a * moy + b : Math.abs(a) * et;
    };
    expect(ecarts(stats, 'transformation', attendu, num, proche)).toEqual([]);
  });
});

/* ---------------------------------------------------------- Python */

/**
 * UN PETIT INTERPRÉTEUR PYTHON, écrit pour ce test et indépendant du module :
 * entiers, variables, + − * // % **, comparaisons, print, for … in range(…),
 * while, if / elif / else, def / return. Il lit le texte de la question.
 */
function executerPython(source) {
  const lignes = source.split('\n')
    .map((l) => ({ retrait: l.match(/^ */)[0].length, texte: l.trim() }))
    .filter((l) => l.texte !== '');
  let pos = 0;

  /** Le bloc indenté qui suit la ligne « texte » (retrait du parent : `retrait`). */
  function sousBloc(retrait, texte) {
    if (pos >= lignes.length || lignes[pos].retrait <= retrait) throw new Error(`bloc vide après « ${texte} »`);
    return bloc(lignes[pos].retrait); // eslint-disable-line no-use-before-define
  }

  function bloc(retrait) {
    const instructions = [];
    while (pos < lignes.length && lignes[pos].retrait === retrait) {
      const { texte } = lignes[pos];
      pos += 1;
      const corps = sousBloc.bind(null, retrait, texte);
      let r = texte.match(/^for (\w+) in range\((.*)\):$/);
      if (r) {
        instructions.push({
          sorte: 'for', variable: r[1], args: r[2], corps: corps(),
        });
      } else if ((r = texte.match(/^while (.+):$/))) { // eslint-disable-line no-cond-assign
        instructions.push({ sorte: 'while', condition: r[1], corps: corps() });
      } else if ((r = texte.match(/^if (.+):$/))) { // eslint-disable-line no-cond-assign
        const branches = [{ condition: r[1], corps: corps() }];
        let sinon = null;
        while (pos < lignes.length && lignes[pos].retrait === retrait && /^(elif .+|else):$/.test(lignes[pos].texte)) {
          const t = lignes[pos].texte;
          pos += 1;
          if (t === 'else:') sinon = corps();
          else branches.push({ condition: t.slice(5, -1), corps: corps() });
        }
        instructions.push({ sorte: 'if', branches, sinon });
      } else if ((r = texte.match(/^def (\w+)\((.*)\):$/))) { // eslint-disable-line no-cond-assign
        instructions.push({
          sorte: 'def', nom: r[1], parametres: r[2].split(',').map((p) => p.trim()).filter(Boolean), corps: corps(),
        });
      } else {
        instructions.push({ sorte: 'simple', texte });
      }
    }
    if (pos < lignes.length && lignes[pos].retrait > retrait) throw new Error(`retrait inattendu : ${lignes[pos].texte}`);
    return instructions;
  }

  const programme = bloc(0);
  if (pos !== lignes.length) throw new Error('programme mal indenté');
  const sorties = [];
  const globaux = {};
  const fonctionsDef = {};
  let pas = 0;

  /** Coupe « a, f(b, c) » en ses arguments de premier niveau. */
  function decouper(s) {
    const liste = [];
    let profondeur = 0;
    let courant = '';
    [...s].forEach((c) => {
      if (c === '(') profondeur += 1;
      if (c === ')') profondeur -= 1;
      if (c === ',' && profondeur === 0) {
        liste.push(courant);
        courant = '';
      } else courant += c;
    });
    if (courant.trim()) liste.push(courant);
    return liste.map((x) => x.trim());
  }

  function evaluer(expression, env) {
    const jetons = expression.match(/\d+|\w+|\*\*|\/\/|==|!=|<=|>=|[-+*%<>(),]/g);
    let i = 0;
    const voir = () => jetons[i];
    const prendre = () => {
      i += 1;
      return jetons[i - 1];
    };
    /* eslint-disable no-use-before-define */
    function comparaison() {
      let g = additif();
      while (['<', '>', '<=', '>=', '==', '!='].includes(voir())) {
        const op = prendre();
        const d = additif();
        g = {
          '<': g < d, '>': g > d, '<=': g <= d, '>=': g >= d, '==': g === d, '!=': g !== d,
        }[op];
      }
      return g;
    }
    function additif() {
      let v = multiplicatif();
      while (voir() === '+' || voir() === '-') {
        const op = prendre();
        const d = multiplicatif();
        v = op === '+' ? v + d : v - d;
      }
      return v;
    }
    function multiplicatif() {
      let v = unaire();
      while (['*', '//', '%'].includes(voir())) {
        const op = prendre();
        const d = unaire();
        if (op === '*') v *= d;
        else if (op === '//') v = Math.floor(v / d);
        else v = ((v % d) + d) % d;
      }
      return v;
    }
    function unaire() {
      if (voir() === '-') {
        prendre();
        return -unaire();
      }
      return puissance();
    }
    function puissance() {
      const base = atome();
      if (voir() === '**') {
        prendre();
        return base ** unaire();
      }
      return base;
    }
    function atome() {
      const j = prendre();
      if (/^\d+$/.test(j)) return Number(j);
      if (j === '(') {
        const v = comparaison();
        if (prendre() !== ')') throw new Error(`parenthèse attendue dans ${expression}`);
        return v;
      }
      if (voir() === '(') {
        prendre();
        const args = [];
        while (voir() !== ')') {
          args.push(comparaison());
          if (voir() === ',') prendre();
        }
        prendre();
        return appeler(j, args);
      }
      if (!(j in env)) throw new Error(`variable inconnue : ${j}`);
      return env[j];
    }
    /* eslint-enable no-use-before-define */
    const v = comparaison();
    if (i !== jetons.length) throw new Error(`expression mal lue : ${expression}`);
    return v;
  }

  function appeler(nom, args) {
    const f = fonctionsDef[nom];
    if (!f) throw new Error(`fonction inconnue : ${nom}`);
    const local = { ...globaux };
    f.parametres.forEach((p, k) => { local[p] = args[k]; });
    const r = executer(f.corps, local); // eslint-disable-line no-use-before-define
    return r ? r.valeur : null;
  }

  function executer(instructions, env) {
    for (let k = 0; k < instructions.length; k += 1) {
      pas += 1;
      if (pas > 100000) throw new Error('boucle sans fin');
      const ins = instructions[k];
      let r;
      if (ins.sorte === 'for') {
        const a = decouper(ins.args).map((x) => evaluer(x, env));
        const [debut, fin, saut] = a.length === 1 ? [0, a[0], 1] : [a[0], a[1], a[2] ?? 1];
        for (let v = debut; saut > 0 ? v < fin : v > fin; v += saut) {
          env[ins.variable] = v; // eslint-disable-line no-param-reassign
          r = executer(ins.corps, env);
          if (r) return r;
        }
      } else if (ins.sorte === 'while') {
        while (evaluer(ins.condition, env)) {
          r = executer(ins.corps, env);
          if (r) return r;
        }
      } else if (ins.sorte === 'if') {
        const branche = ins.branches.find((b) => evaluer(b.condition, env));
        const corps = branche ? branche.corps : ins.sinon;
        if (corps) {
          r = executer(corps, env);
          if (r) return r;
        }
      } else if (ins.sorte === 'def') {
        fonctionsDef[ins.nom] = ins;
      } else {
        const t = ins.texte;
        let m = t.match(/^print\((.*)\)$/);
        if (m) {
          sorties.push(decouper(m[1]).map((x) => String(evaluer(x, env))).join(' '));
        } else if ((m = t.match(/^return (.+)$/))) { // eslint-disable-line no-cond-assign
          return { valeur: evaluer(m[1], env) };
        } else if ((m = t.match(/^(\w+) ([-+*])= (.+)$/))) { // eslint-disable-line no-cond-assign
          const d = evaluer(m[3], env);
          // eslint-disable-next-line no-param-reassign
          env[m[1]] = { '+': env[m[1]] + d, '-': env[m[1]] - d, '*': env[m[1]] * d }[m[2]];
        } else if ((m = t.match(/^(\w+) = (.+)$/))) { // eslint-disable-line no-cond-assign
          env[m[1]] = evaluer(m[2], env); // eslint-disable-line no-param-reassign
        } else {
          throw new Error(`instruction inconnue : ${t}`);
        }
      }
    }
    return null;
  }

  executer(programme, globaux);
  return sorties.join('\n');
}

describe('Python : ce qu’affiche vraiment le programme, et un seul choix', () => {
  it('le petit interpréteur connaît son Python', () => {
    expect(executerPython('a = 3\nb = a + 2\na = 10\nprint(b)')).toBe('5');
    expect(executerPython('s = 0\nfor i in range(5):\n    s = s + i\nprint(s)')).toBe('10');
    expect(executerPython('s = 0\nfor i in range(1, 10, 3):\n    s += i\nprint(s)')).toBe('12');
    expect(executerPython('u = 1\nwhile u < 10:\n    u = u + 4\nprint(u)')).toBe('13');
    expect(executerPython('x = 7\nif x % 2 == 0:\n    y = 1\nelif x > 5:\n    y = 2\nelse:\n    y = 3\nprint(y)')).toBe('2');
    expect(executerPython('def f(x):\n    return 2 * x - 1\n\nprint(f(f(3)))')).toBe('9');
    expect(executerPython('print(17 // 5, 17 % 5, 2 ** 3 ** 2, -2 ** 2)')).toBe('3 2 512 -4');
    expect(executerPython('def g(n):\n    s = 0\n    for k in range(1, n + 1):\n        s = s + k\n    return s\n\nprint(g(4))')).toBe('10');
  });

  it.each(['affectation', 'boucle-for', 'boucle-while', 'condition', 'fonction', 'operateurs', 'boucle-et-test'])(
    '%s : la bonne réponse est l’affichage du programme, aucun piège ne l’est',
    (consigne) => {
      expect(ecarts(python, consigne, (m) => executerPython(m.question), String)).toEqual([]);
    },
  );

  it('les programmes sont du vrai Python : indentation de quatre espaces, pas d’eval', () => {
    const fautes = toutes(python).filter((m) => m.question.split('\n').some((l) => /^ +/.test(l) && l.match(/^ */)[0].length % 4 !== 0));
    expect(fautes).toEqual([]);
  });
});
