/**
 * LES JEUX DE MATHS DE TERMINALE, LOT A — quatre modules : limites et
 * continuité, le logarithme, primitives et intégrales, la loi binomiale
 * (terminale générale et terminale technologique).
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module (un petit évaluateur
 * d'expressions lit « 2x e^(x²) », « ln 3 × ln 4 », « (x² + 1)³/3 »…), et
 * aucun autre choix ne doit être juste lui aussi.
 */

import * as limites from '../lib/jeux/lycee/limites-et-continuite';
import * as logarithme from '../lib/jeux/lycee/logarithme';
import * as primitives from '../lib/jeux/lycee/primitives-et-integrales';
import * as binomiale from '../lib/jeux/lycee/loi-binomiale';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['limites-et-continuite', limites],
  ['logarithme', logarithme],
  ['primitives-et-integrales', primitives],
  ['loi-binomiale', binomiale],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur classe (colonne NIVEAU). */
const CODES = {
  MATH_TLE_SUITES_LIMITE: 'TERMINALE',
  MATH_TLE_SUITES_CONV: 'TERMINALE',
  MATH_TLE_FONC_LIMITE: 'TERMINALE',
  MATH_TLE_CONTINUITE: 'TERMINALE',
  MATH_TLE_DERIV_COMPOSEE: 'TERMINALE',
  MATH_TLE_LOG: 'TERMINALE',
  MATH_TLE_PRIMITIVES: 'TERMINALE',
  MATH_TLE_INTEGRALE: 'TERMINALE',
  MATH_TLE_BINOMIALE: 'TERMINALE',
  MATH_TLE_VA_SOMME: 'TERMINALE',
  MATH_TTEC_VA_BINOMIALE: 'TERMINALE_TECHNO',
  MATH_TTEC_VA_ESPERANCE: 'TERMINALE_TECHNO',
};

const CLASSES_LYCEE = ['SECONDE', 'PREMIERE', 'TERMINALE', 'PREMIERE_TECHNO', 'TERMINALE_TECHNO',
  'SECONDE_PRO', 'PREMIERE_PRO', 'TERMINALE_PRO'];

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
          expect(String(c.libelle)).not.toMatch(/null|undefined|NaN|Infinity/);
        });
        expect(m.question).toBeTruthy();
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

  it('les manches sont variées : au moins quatre sortes par partie', () => {
    graines.forEach((g) => {
      const sortes = new Set(module.serie(g, classe).map((m) => m.consigne));
      expect(sortes.size).toBeGreaterThanOrEqual(4);
    });
  });

  it('la classe a son titre, son accroche et ses compétences officielles, de SA classe', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    fiche.competences.forEach((c) => expect({ c, classe: CODES[c] }).toEqual({ c, classe }));
  });
});

describe.each(MODULES)('%s : la famille et les phrases', (cle, module) => {
  it('la famille porte sa clé, et les classes sont celles du lycée', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'MATHS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    module.CLASSES.forEach((c) => expect(CLASSES_LYCEE).toContain(c));
    expect(module.MANCHES).toBe(8);
    expect(module.bilan(8)).toBeTruthy();
  });

  it('chaque phrase est un texte fixe : clé en kebab-case, aucun chiffre, aucun « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim().length).toBeGreaterThan(0);
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté/i);
      // Pas de notation : ni prime, ni symbole, ni exposant.
      expect(texte).not.toMatch(/[′'=∞√∫ⁿ²³ˣ^]/);
      // Typographie française : une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));
const parConsigne = (module, classe, consigne) => toutes(module, classe).filter((m) => m.consigne === consigne);
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));
const proche = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/**
 * Les écarts sont collectés, puis vérifiés d'un coup : jamais d'`expect`
 * dans une branche.
 */
function ecarts() {
  const liste = [];
  return {
    noter: (vrai, message) => { if (!vrai) liste.push(message); },
    liste,
  };
}

/** La bonne réponse est l'attendu (en texte), et aucun autre choix ne l'est. */
function seuleEgale(e, m, attendu) {
  e.noter(m.bonne === attendu, `${m.question} : ${m.bonne} au lieu de ${attendu}`);
  autres(m).forEach((c) => e.noter(c !== attendu, `${m.question} : ${c} aussi juste`));
}

/* ------------------------------------------------ un petit évaluateur ------ */

const EXPOSANTS = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', 'ˣ': 'x',
};

function jetons(texte) {
  const s = texte.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') {
      i += 1;
    } else if (/\d/.test(c)) {
      let j = i;
      while (j < s.length && /[\d,]/.test(s[j])) j += 1;
      out.push({ t: 'n', v: Number(s.slice(i, j).replace(',', '.')) });
      i = j;
    } else if (EXPOSANTS[c] !== undefined) {
      let e = '';
      while (i < s.length && EXPOSANTS[s[i]] !== undefined) {
        e += EXPOSANTS[s[i]];
        i += 1;
      }
      out.push({ t: 'sup', v: e });
    } else if (s.startsWith('ln', i)) {
      out.push({ t: 'ln' });
      i += 2;
    } else if ('xe()+-*/^'.includes(c)) {
      out.push({ t: c });
      i += 1;
    } else {
      throw new Error(`« ${c} » illisible dans « ${texte} »`);
    }
  }
  return out;
}

/** « 2x e^(x²) » → la fonction x ↦ 2x·exp(x²). Multiplication implicite, ln, exposants. */
function compiler(texte) {
  const js = jetons(texte);
  let i = 0;
  const voir = () => js[i];
  const prendre = () => {
    i += 1;
    return js[i - 1];
  };
  const debutFacteur = (j) => j && ['n', 'x', 'e', 'ln', '('].includes(j.t);
  let somme;
  function primaire() {
    const j = prendre();
    if (!j) throw new Error(`fin inattendue dans « ${texte} »`);
    if (j.t === 'n') return () => j.v;
    if (j.t === 'x') return (x) => x;
    if (j.t === 'e') return () => Math.E;
    if (j.t === '(') {
      const f = somme();
      if (prendre()?.t !== ')') throw new Error(`parenthèse dans « ${texte} »`);
      return f;
    }
    if (j.t === 'ln') {
      const g = primaire();
      return (x) => Math.log(g(x));
    }
    throw new Error(`« ${j.t} » inattendu dans « ${texte} »`);
  }
  function puissance() {
    let f = primaire();
    for (;;) {
      const j = voir();
      const base = f;
      if (j && j.t === 'sup') {
        prendre();
        const e = compiler(j.v);
        f = (x) => base(x) ** e(x);
      } else if (j && j.t === '^') {
        prendre();
        const e = primaire();
        f = (x) => base(x) ** e(x);
      } else {
        return f;
      }
    }
  }
  function unaire() {
    if (voir() && voir().t === '-') {
      prendre();
      const g = unaire();
      return (x) => -g(x);
    }
    return puissance();
  }
  function terme() {
    let f = unaire();
    for (;;) {
      const j = voir();
      const a = f;
      if (j && (j.t === '*' || j.t === '/')) {
        prendre();
        const g = unaire();
        f = j.t === '*' ? (x) => a(x) * g(x) : (x) => a(x) / g(x);
      } else if (debutFacteur(j)) {
        const g = puissance();
        f = (x) => a(x) * g(x);
      } else {
        return f;
      }
    }
  }
  somme = () => {
    let f = terme();
    while (voir() && (voir().t === '+' || voir().t === '-')) {
      const op = prendre().t;
      const g = terme();
      const a = f;
      f = op === '+' ? (x) => a(x) + g(x) : (x) => a(x) - g(x);
    }
    return f;
  };
  const f = somme();
  if (i !== js.length) throw new Error(`reste illisible dans « ${texte} »`);
  return f;
}
const val = (texte) => compiler(texte)(0);

describe('l’évaluateur du test sait lire', () => {
  it('les écritures des modules', () => {
    expect(val('ln 3 + ln 4')).toBeCloseTo(Math.log(12), 12);
    expect(val('3 ln 2')).toBeCloseTo(Math.log(8), 12);
    expect(val('(ln 2)³')).toBeCloseTo(Math.log(2) ** 3, 12);
    expect(val('ln(e⁵)')).toBeCloseTo(5, 12);
    expect(val('e^(ln 3)')).toBeCloseTo(3, 12);
    expect(val('1/ln 5')).toBeCloseTo(1 / Math.log(5), 12);
    expect(val('−ln 5')).toBeCloseTo(-Math.log(5), 12);
    expect(val('1 − 0,7⁴')).toBeCloseTo(1 - 0.7 ** 4, 12);
    expect(val('−7/3')).toBeCloseTo(-7 / 3, 12);
    expect(compiler('2x e^(x²)')(1.5)).toBeCloseTo(3 * Math.exp(2.25), 9);
    expect(compiler('−e^(−2x)/2')(1)).toBeCloseTo(-Math.exp(-2) / 2, 12);
    expect(compiler('4x(2x² + 3)³/4')(1)).toBeCloseTo(125, 9);
    expect(compiler('x³ e^(−x)')(2)).toBeCloseTo(8 * Math.exp(-2), 12);
    expect(compiler('eˣ / x³')(2)).toBeCloseTo(Math.exp(2) / 8, 12);
    expect(compiler('x ln x')(2)).toBeCloseTo(2 * Math.log(2), 12);
    expect(compiler('−3x² + 2x − 1')(2)).toBe(-9);
  });
});

/** « f(x) = … » : la fonction, sans la précision du domaine. */
const fonctionDe = (question) => compiler(question.split('\n')[0].replace(/^f\(x\) = /, '').replace(/, (sur|pour) .*$/, ''));

const derivee = (F, x) => {
  const h = 1e-5 * Math.max(1, Math.abs(x));
  return (F(x + h) - F(x - h)) / (2 * h);
};

/** Simpson, exact pour les polynômes de degré trois. */
function simpson(f, a, b, n = 200) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let k = 1; k < n; k += 1) s += (k % 2 ? 4 : 2) * f(a + k * h);
  return (s * h) / 3;
}

const nombre = (s) => Number(String(s).replace(/−/g, '-').replace(',', '.'));
const lireEntier = (s) => nombre(s);

/* ======================================================== limites ====== */

describe('limites et continuité : chaque limite recalculée', () => {
  const PINF = '+∞';
  const MINF = '−∞';
  const FI = 'forme indéterminée';

  const lireLimite = (s) => {
    if (s === PINF) return { inf: 1 };
    if (s === MINF) return { inf: -1 };
    if (s === '0⁺') return { zero: 1 };
    if (s === '0⁻') return { zero: -1 };
    return { reel: lireEntier(s) };
  };
  const inf = (s) => (s > 0 ? PINF : MINF);
  const signe = (l) => l.inf ?? l.zero ?? Math.sign(l.reel);

  /** Les règles du cours, réécrites ici. */
  function operation(f, op, g) {
    if (op === '+') {
      if (f.inf && g.inf) return f.inf === g.inf ? inf(f.inf) : FI;
      if (f.inf) return inf(f.inf);
      if (g.inf) return inf(g.inf);
      return null;
    }
    if (op === '×') {
      if ((f.inf && g.zero) || (f.zero && g.inf)) return FI;
      if (f.inf || g.inf) return inf(signe(f) * signe(g));
      return null;
    }
    if (f.inf && g.inf) return FI;
    if (f.reel !== undefined && g.inf) return '0';
    if (g.zero && (f.inf || f.reel)) return inf(signe(f) * g.zero);
    if (f.inf && g.reel) return inf(f.inf * Math.sign(g.reel));
    return null;
  }

  it('les opérations sur les limites', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'operations').forEach((m) => {
      const [, A, B] = m.question.match(/lim f = (\S+) et lim g = (\S+)\./);
      const [, op] = m.question.match(/lim \(f (\S) g\)/);
      seuleEgale(e, m, operation(lireLimite(A), op, lireLimite(B)));
    });
    expect(e.liste).toEqual([]);
  });

  /** La limite lue sur la fonction elle-même, très loin. */
  const lue = (v) => {
    if (v > 1e4) return PINF;
    if (v < -1e4) return MINF;
    return v;
  };
  const vaut = (libelle, attendu) => (typeof attendu === 'string'
    ? libelle === attendu
    : ![PINF, MINF, FI].includes(libelle) && proche(val(libelle), attendu, 1e-4));

  it('le terme dominant : la limite lue en ±10⁶', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'terme-dominant').forEach((m) => {
      const s = m.question.includes(`en ${MINF}`) ? -1 : 1;
      const attendu = lue(fonctionDe(m.question)(s * 1e6));
      e.noter(vaut(m.bonne, attendu), `${m.question} : ${m.bonne} pour ${attendu}`);
      autres(m).forEach((c) => e.noter(!vaut(c, attendu), `${m.question} : ${c} aussi juste`));
    });
    expect(e.liste).toEqual([]);
  });

  it('le polynôme donne vraiment une forme indéterminée par ses deux premiers termes', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'terme-dominant').filter((m) => !m.question.includes('/')).forEach((m) => {
      const s = m.question.includes(`en ${MINF}`) ? -1 : 1;
      const termes = m.question.split('\n')[0].replace('f(x) = ', '').match(/^(−?[^−+]+) ([−+] [^−+]+)/);
      const premier = compiler(termes[1])(s * 1e6);
      const second = compiler(termes[2].replace(/ /g, '').replace(/^[+]/, ''))(s * 1e6);
      e.noter(Math.sign(premier) !== Math.sign(second), m.question);
    });
    expect(e.liste).toEqual([]);
  });

  it('les croissances comparées : la limite lue numériquement', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'croissances').forEach((m) => {
      const [expression, ou] = m.question.split('\n');
      const f = compiler(expression.replace(/^lim /, ''));
      let x = -300;
      if (ou.includes(PINF)) x = /e/.test(expression) ? 300 : 1e12;
      if (ou.includes('en 0')) x = 1e-12;
      const v = f(x);
      let attendu = '0';
      if (v > 1e6) attendu = PINF;
      if (v < -1e6) attendu = MINF;
      e.noter(Math.abs(v) < 1e-3 || Math.abs(v) > 1e6, `${m.question} : ${v} indécis`);
      seuleEgale(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });

  it('le théorème des valeurs intermédiaires : les solutions comptées morceau par morceau', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'tvi').forEach((m) => {
      const morceaux = [...m.question.matchAll(/(décroît|croît) de (−?\d+) à (−?\d+)/g)]
        .map(([, sens, u, v]) => [sens, lireEntier(u), lireEntier(v)]);
      const k = lireEntier(m.question.match(/f\(x\) = (−?\d+)/)[1]);
      morceaux.forEach(([sens, u, v]) => e.noter((sens === 'croît') === (v > u), `${m.question} : sens`));
      const compte = morceaux.filter(([, u, v]) => (k - u) * (k - v) < 0).length;
      e.noter(morceaux.every(([, u, v]) => k !== u && k !== v), `${m.question} : k au bord`);
      seuleEgale(e, m, String(compte));
    });
    expect(e.liste).toEqual([]);
  });

  it('la suite géométrique', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'geometrique').forEach((m) => {
      const ligne = m.question.split('\n')[0];
      const affine = ligne.match(/^uₙ = (−?\d+) ([+−]) (\d+) × ([\d,]+)ⁿ$/);
      let attendu;
      if (affine) {
        const q = nombre(affine[4]);
        e.noter(q > 0 && q < 1, ligne);
        attendu = affine[1];
      } else {
        const q = nombre(ligne.match(/^uₙ = \(?(−?[\d,]+)\)?ⁿ$/)[1]);
        if (q > 1) attendu = PINF;
        else if (q > -1) attendu = '0';
        else attendu = 'pas de limite';
      }
      seuleEgale(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });

  it('la convergence : ce que disent les théorèmes du cours', () => {
    const e = ecarts();
    parConsigne(limites, 'TERMINALE', 'convergence').forEach((m) => {
      const q = m.question;
      let attendu;
      if (/croissante et majorée|décroissante et minorée/.test(q)) attendu = '(uₙ) converge';
      else if (/n’est pas majorée/.test(q)) attendu = 'lim uₙ = +∞';
      else if (/uₙ ≥ vₙ/.test(q)) attendu = 'lim uₙ = +∞';
      else if (/^Pour tout n, uₙ ≤ vₙ/.test(q)) attendu = 'On ne peut pas conclure';
      else attendu = `lim uₙ = ${q.match(/lim wₙ = (−?\d+)/)[1]}`;
      seuleEgale(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });
});

/* ===================================================== logarithme ====== */

describe('le logarithme : chaque réponse recalculée', () => {
  /** La valeur juste, et elle seule, parmi les choix (lus par l'évaluateur). */
  function seuleValeur(e, m, attendu, lire = val) {
    e.noter(proche(lire(m.bonne), attendu), `${m.question} : ${m.bonne} ≠ ${attendu}`);
    autres(m).forEach((c) => e.noter(!proche(lire(c), attendu), `${m.question} : ${c} aussi juste`));
  }

  it('les propriétés et les valeurs remarquables', () => {
    const e = ecarts();
    ['proprietes', 'valeurs'].forEach((consigne) => parConsigne(logarithme, 'TERMINALE', consigne).forEach((m) => {
      seuleValeur(e, m, val(m.question.replace(/ = \?$/, '')));
    }));
    expect(e.liste).toEqual([]);
  });

  /** « ]−∞ ; e²[ » → un test d'appartenance ; « ℝ » → tout. */
  function intervalle(texte) {
    if (texte === 'ℝ') return () => true;
    const [, g, a, b, d] = texte.match(/^([\][])(.+) ; (.+)([\][])$/);
    const borne = (s) => {
      if (s === '−∞') return -Infinity;
      if (s === '+∞') return Infinity;
      return val(s);
    };
    const [A, B] = [borne(a), borne(b)];
    return (x) => (g === '[' ? x >= A : x > A) && (d === ']' ? x <= B : x < B);
  }
  const GRILLE = Array.from({ length: 7001 }, (_, i) => -10 + i / 100);

  /** La bonne réponse décrit exactement l'ensemble ; chaque autre choix se trompe quelque part. */
  function seulEnsemble(e, m, dedans) {
    const juste = (texte) => {
      const appartient = intervalle(texte);
      return GRILLE.every((x) => appartient(x) === dedans(x));
    };
    e.noter(juste(m.bonne), `${m.question} : ${m.bonne}`);
    autres(m).forEach((c) => e.noter(!juste(c), `${m.question} : ${c} aussi juste`));
  }

  it('le domaine de ln(ax + b)', () => {
    const e = ecarts();
    parConsigne(logarithme, 'TERMINALE', 'domaine').forEach((m) => {
      const u = compiler(m.question.match(/^f\(x\) = ln\((.+)\)$/m)[1]);
      seulEnsemble(e, m, (x) => u(x) > 0);
    });
    expect(e.liste).toEqual([]);
  });

  it('les inéquations', () => {
    const e = ecarts();
    parConsigne(logarithme, 'TERMINALE', 'inequation').forEach((m) => {
      const [, gauche, sens, droite] = m.question.match(/^(ln x|eˣ) ([<>]) (−?\d+)$/m);
      const k = lireEntier(droite);
      const f = gauche === 'ln x' ? Math.log : Math.exp;
      const definie = (x) => gauche !== 'ln x' || x > 0;
      seulEnsemble(e, m, (x) => definie(x) && (sens === '<' ? f(x) < k : f(x) > k));
    });
    expect(e.liste).toEqual([]);
  });

  it('l’équation ln(ax + b) = ln(cx + d), domaine compris', () => {
    const e = ecarts();
    parConsigne(logarithme, 'TERMINALE', 'equation').forEach((m) => {
      const [, A, B] = m.question.match(/^ln\((.+)\) = ln\((.+)\)$/m);
      const [u, v] = [compiler(A), compiler(B)];
      const [a, b, c, d] = [u(1) - u(0), u(0), v(1) - v(0), v(0)];
      const x0 = (d - b) / (a - c);
      const attendu = u(x0) > 0 && v(x0) > 0 ? `x = ${x0 < 0 ? `−${-x0}` : x0}` : 'aucune solution';
      e.noter(Number.isInteger(x0), `${m.question} : ${x0}`);
      seuleEgale(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });

  it('les équations simples', () => {
    const e = ecarts();
    const lire = (s) => (s === 'aucune solution' ? NaN : val(s.replace(/^x = /, '')));
    parConsigne(logarithme, 'TERMINALE', 'equation-simple').forEach((m) => {
      const [, gauche, droite] = m.question.match(/^(ln x|eˣ) = (−?\d+)$/m);
      const k = lireEntier(droite);
      if (gauche === 'eˣ' && k <= 0) {
        seuleEgale(e, m, 'aucune solution');
      } else {
        seuleValeur(e, m, gauche === 'ln x' ? Math.exp(k) : Math.log(k), lire);
      }
    });
    expect(e.liste).toEqual([]);
  });

  it('la dérivée de ln u', () => {
    const e = ecarts();
    const X = [0.7, 1.4, 2.2, 3.1];
    parConsigne(logarithme, 'TERMINALE', 'derivee').forEach((m) => {
      const f = fonctionDe(m.question);
      const juste = (texte) => {
        const g = compiler(texte);
        return X.every((x) => proche(g(x), derivee(f, x), 1e-6));
      };
      e.noter(juste(m.bonne), `${m.question} : ${m.bonne}`);
      autres(m).forEach((c) => e.noter(!juste(c), `${m.question} : ${c} aussi juste`));
    });
    expect(e.liste).toEqual([]);
  });
});

/* ============================================ primitives et intégrales == */

describe('primitives et intégrales : chaque réponse recalculée', () => {
  it('une primitive : sa dérivée redonne f, et celle d’aucun piège', () => {
    const e = ecarts();
    const X = [0.6, 1.1, 1.7, 2.4];
    ['primitive', 'composee'].forEach((consigne) => parConsigne(primitives, 'TERMINALE', consigne).forEach((m) => {
      const f = fonctionDe(m.question);
      const juste = (texte) => {
        const F = compiler(texte);
        return X.every((x) => proche(derivee(F, x), f(x), 1e-5));
      };
      e.noter(juste(m.bonne), `${m.question} : ${m.bonne}`);
      autres(m).forEach((c) => e.noter(!juste(c), `${m.question} : ${c} aussi juste`));
    }));
    expect(e.liste).toEqual([]);
  });

  const BORNES = /∫ de (−?\d+) à (−?\d+) de/;

  /** La valeur juste, et elle seule. */
  function seuleValeur(e, m, attendu) {
    e.noter(proche(val(m.bonne), attendu), `${m.question} : ${m.bonne} ≠ ${attendu}`);
    autres(m).forEach((c) => e.noter(!proche(val(c), attendu), `${m.question} : ${c} aussi juste`));
  }

  it('l’intégrale, par la méthode de Simpson', () => {
    const e = ecarts();
    parConsigne(primitives, 'TERMINALE', 'integrale').forEach((m) => {
      const [, a, b] = m.question.match(BORNES);
      const f = compiler(m.question.match(/de \((.+)\) dx/)[1]);
      seuleValeur(e, m, simpson(f, lireEntier(a), lireEntier(b)));
    });
    expect(e.liste).toEqual([]);
  });

  it('l’aire : la fonction garde un signe, et l’aire est positive', () => {
    const e = ecarts();
    parConsigne(primitives, 'TERMINALE', 'aire').forEach((m) => {
      const f = fonctionDe(m.question);
      const [, a, b] = m.question.match(/x = (−?\d+) et x = (−?\d+)/);
      const [A, B] = [lireEntier(a), lireEntier(b)];
      const valeurs = Array.from({ length: 101 }, (_, k) => f(A + ((B - A) * k) / 100));
      e.noter(valeurs.every((v) => v > 0) || valeurs.every((v) => v < 0), `${m.question} : signe`);
      seuleValeur(e, m, simpson((x) => Math.abs(f(x)), A, B));
    });
    expect(e.liste).toEqual([]);
  });

  it('le signe de l’intégrale', () => {
    const e = ecarts();
    parConsigne(primitives, 'TERMINALE', 'signe').forEach((m) => {
      const positive = /continue et positive/.test(m.question);
      const [, a, b] = m.question.match(BORNES);
      const croissant = lireEntier(a) < lireEntier(b);
      seuleEgale(e, m, positive === croissant ? '≥ 0' : '≤ 0');
    });
    expect(e.liste).toEqual([]);
  });

  it('la valeur moyenne', () => {
    const e = ecarts();
    parConsigne(primitives, 'TERMINALE', 'moyenne').forEach((m) => {
      const f = fonctionDe(m.question);
      const [, a, b] = m.question.match(/sur \[(−?\d+) ; (−?\d+)\]/);
      const [A, B] = [lireEntier(a), lireEntier(b)];
      seuleValeur(e, m, simpson(f, A, B) / (B - A));
    });
    expect(e.liste).toEqual([]);
  });

  it('la linéarité et la relation de Chasles', () => {
    const e = ecarts();
    parConsigne(primitives, 'TERMINALE', 'linearite').forEach((m) => {
      const lignes = m.question.split('\n');
      const valeur = (l) => lireEntier(l.match(/= (−?\d+)$/)[1]);
      const bornes = (l) => l.match(BORNES).slice(1).map(lireEntier);
      let attendu;
      if (lignes[2].includes('g(x)')) {
        const [, alpha, s, beta] = lignes[2].match(/\((\d+)f\(x\) ([+−]) (\d*)g\(x\)\)/);
        const b = (s === '−' ? -1 : 1) * (beta === '' ? 1 : Number(beta));
        attendu = Number(alpha) * valeur(lignes[0]) + b * valeur(lignes[1]);
        e.noter(lignes[0].includes('f(x)') && lignes[1].includes('g(x)'), m.question);
      } else {
        const [[c, e1], [c2, d], [d2, e2]] = lignes.map(bornes);
        e.noter(c === c2 && d === d2 && e1 === e2 && c < d && d < e1, `${m.question} : bornes`);
        attendu = valeur(lignes[0]) - valeur(lignes[1]);
      }
      seuleValeur(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });
});

/* ================================================== la loi binomiale ==== */

describe('la loi binomiale : chaque réponse recalculée', () => {
  const C = (n, k) => {
    let c = 1;
    for (let i = 1; i <= k; i += 1) c = (c * (n - k + i)) / i;
    return c;
  };
  const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));
  const fractionTexte = (n, d) => (d / pgcd(n, d) === 1 ? `${n / pgcd(n, d)}` : `${n / pgcd(n, d)}/${d / pgcd(n, d)}`);
  /** « 0,3 » ou « 1/6 » → nombre. */
  const lireP = (s) => (s.includes('/') ? nombre(s.split('/')[0]) / nombre(s.split('/')[1]) : nombre(s));
  const loiDe = (question) => {
    const [, n, p] = question.match(/B\((\d+) ; ([\d,/]+)\)/);
    return [Number(n), lireP(p)];
  };

  it.each(binomiale.CLASSES)('en %s : reconnaître le schéma de Bernoulli', (classe) => {
    const e = ecarts();
    parConsigne(binomiale, classe, 'parametres').forEach((m) => {
      const q = m.question;
      let attendu;
      let r;
      if ((r = q.match(/On lance (\d+) fois un dé équilibré à six faces/))) attendu = `B(${r[1]} ; 1/6)`;
      else if ((r = q.match(/On lance (\d+) fois une pièce équilibrée/))) attendu = `B(${r[1]} ; 1/2)`;
      else if ((r = q.match(/(\d+) boules rouges et (\d+) boules bleues\.\nOn tire (\d+) boules, une à une, (AVEC|SANS) remise/))) {
        const [rouges, bleues, n] = [Number(r[1]), Number(r[2]), r[3]];
        attendu = r[4] === 'SANS' ? 'Pas une loi binomiale' : `B(${n} ; ${fractionTexte(rouges, rouges + bleues)})`;
      } else if ((r = q.match(/Un QCM a (\d+) questions, chacune avec (\d+) réponses dont une seule juste/))) attendu = `B(${r[1]} ; 1/${r[2]})`;
      else {
        r = q.match(/probabilité (0,\d)\.\nElle tire (\d+) fois, de façon indépendante\.\nX compte les tirs manqués/);
        attendu = `B(${r[2]} ; 0,${10 - Math.round(nombre(r[1]) * 10)})`;
      }
      seuleEgale(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });

  it('P(X = k) au millième : la bonne valeur arrondie, et aucun autre choix ne l’est', () => {
    const e = ecarts();
    parConsigne(binomiale, 'TERMINALE', 'probabilite').forEach((m) => {
      const [n, p] = loiDe(m.question);
      const k = Number(m.question.match(/P\(X = (\d+)\)/)[1]);
      const exact = C(n, k) * p ** k * (1 - p) ** (n - k);
      if (/millième/.test(m.question)) {
        const milliemes = exact * 1000;
        e.noter(Math.abs(milliemes - Math.floor(milliemes) - 0.5) > 1e-9, `${m.question} : arrondi ambigu`);
        const attendu = (Math.round(milliemes) / 1000).toFixed(3).replace('.', ',');
        seuleEgale(e, m, attendu);
      } else {
        e.noter(proche(val(m.bonne), exact), `${m.question} : ${m.bonne} ≠ ${exact}`);
        autres(m).forEach((c) => e.noter(!proche(val(c), exact), `${m.question} : ${c} aussi juste`));
      }
    });
    expect(e.liste).toEqual([]);
  });

  /** La valeur juste, et elle seule. */
  function seuleValeur(e, m, attendu) {
    e.noter(proche(val(m.bonne), attendu), `${m.question} : ${m.bonne} ≠ ${attendu}`);
    autres(m).forEach((c) => e.noter(!proche(val(c), attendu), `${m.question} : ${c} aussi juste`));
  }

  it.each(binomiale.CLASSES)('en %s : P(X = 0), P(X = n), P(X ≥ 1), l’espérance', (classe) => {
    const e = ecarts();
    toutes(binomiale, classe).forEach((m) => {
      if (!['extremes', 'au-moins-un', 'esperance', 'variance'].includes(m.consigne)) return;
      const [n, p] = loiDe(m.question);
      const k = (m.question.match(/P\(X = (\d+)\)/) || [])[1];
      let attendu;
      if (m.consigne === 'extremes') attendu = Number(k) === 0 ? (1 - p) ** n : p ** n;
      if (m.consigne === 'au-moins-un') attendu = 1 - (1 - p) ** n;
      if (m.consigne === 'esperance') attendu = n * p;
      if (m.consigne === 'variance') attendu = n * p * (1 - p);
      e.noter(m.consigne !== 'extremes' || Number(k) === 0 || Number(k) === n, m.question);
      seuleValeur(e, m, attendu);
    });
    expect(e.liste).toEqual([]);
  });

  it('l’écart type au centième (terminale techno)', () => {
    const e = ecarts();
    parConsigne(binomiale, 'TERMINALE_TECHNO', 'ecart-type').forEach((m) => {
      const [n, p] = loiDe(m.question);
      const sigma = Math.sqrt(n * p * (1 - p));
      seuleEgale(e, m, (Math.round(sigma * 100) / 100).toFixed(2).replace('.', ','));
      e.noter(autres(m).every((c) => Math.abs(nombre(c) - sigma) > 0.005), `${m.question} : un autre choix arrondit σ`);
    });
    expect(e.liste).toEqual([]);
  });

  it('les chemins à k succès : k parmi n', () => {
    const e = ecarts();
    parConsigne(binomiale, 'TERMINALE', 'chemins').forEach((m) => {
      const [, n, k] = m.question.match(/(\d+) épreuves[\s\S]*exactement (\d+) succès/);
      seuleEgale(e, m, String(C(Number(n), Number(k))));
    });
    expect(e.liste).toEqual([]);
  });

  it('la terminale techno n’a ni coefficient binomial à calculer, ni variance seule', () => {
    const consignes = new Set(toutes(binomiale, 'TERMINALE_TECHNO').map((m) => m.consigne));
    expect([...consignes].sort()).toEqual(['au-moins-un', 'ecart-type', 'esperance', 'extremes', 'parametres']);
  });
});
