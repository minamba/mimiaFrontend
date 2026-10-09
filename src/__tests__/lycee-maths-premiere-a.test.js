/**
 * LES JEUX DE MATHS DE 1re, LOT A — cinq modules de Nora : les automatismes
 * (1re générale et 1re technologique), les suites, le second degré, la
 * dérivation, l'exponentielle.
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun autre choix ne doit
 * être juste lui aussi. Les expressions (« 3x² − 2x », « −7/(x − 3)² »,
 * « (x + 1)eˣ ») sont lues par un petit évaluateur écrit ici ; les dérivées
 * sont vérifiées par une différence finie.
 */

import * as automatismes from '../lib/jeux/lycee/automatismes';
import * as suites from '../lib/jeux/lycee/suites';
import * as secondDegre from '../lib/jeux/lycee/second-degre';
import * as derivation from '../lib/jeux/lycee/derivation';
import * as exponentielle from '../lib/jeux/lycee/exponentielle';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['automatismes', automatismes],
  ['suites', suites],
  ['second-degre', secondDegre],
  ['derivation', derivation],
  ['exponentielle', exponentielle],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur classe (colonne NIVEAU). */
const CODES = {
  MATH_1RE_AUTO_TAUX_APPLIQUER: 'PREMIERE',
  MATH_1RE_AUTO_TAUX_CALCULER: 'PREMIERE',
  MATH_1RE_AUTO_TAUX_SUCCESSIFS: 'PREMIERE',
  MATH_1RE_AUTO_TAUX_RECIPROQUE: 'PREMIERE',
  MATH_1RE_AUTO_PRODUIT_NUL: 'PREMIERE',
  MATH_1RE_AUTO_SIGNE: 'PREMIERE',
  MATH_1RE_AUTO_CALCUL_LITTERAL: 'PREMIERE',
  MATH_1RE_AUTO_GRAPH_EQUATION: 'PREMIERE',
  MATH_1RE_AUTO_GRAPH_SIGNE: 'PREMIERE',
  MATH_1RE_AUTO_DROITE_LIRE: 'PREMIERE',
  MATH_1RE_AUTO_COEFF_DIRECTEUR: 'PREMIERE',
  MATH_1RE_PROBA_COND: 'PREMIERE',
  MATH_1RE_AUTO_PROBA_NOTATIONS: 'PREMIERE',
  MATH_1TEC_AUTO_TAUX_APPLIQUER: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_EVOLUTION: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_TAUX_SUCCESSIFS: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_TAUX_RECIPROQUE: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_PRODUIT_NUL: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_SIGNE: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_ALGEBRE: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_GRAPHIQUE: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_GRAPH_SIGNE: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_DROITE_LIRE: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_COEFF_DIRECTEUR: 'PREMIERE_TECHNO',
  MATH_1TEC_PROB_CONDITION: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_PROBA_NOTATIONS: 'PREMIERE_TECHNO',
  MATH_1RE_SUITES_NOTION: 'PREMIERE',
  MATH_1RE_SUITES_TERMES: 'PREMIERE',
  MATH_1RE_SUITES_ARITH: 'PREMIERE',
  MATH_1RE_SUITES_GEO: 'PREMIERE',
  MATH_1RE_SUITES_VARIATION: 'PREMIERE',
  MATH_1RE_SUITES_MODELE: 'PREMIERE',
  MATH_1RE_TRINOME_RACINES: 'PREMIERE',
  MATH_1RE_TRINOME_SIGNE: 'PREMIERE',
  MATH_1RE_TRINOME_FORME: 'PREMIERE',
  MATH_1RE_TRINOME_FACTORISER: 'PREMIERE',
  MATH_1RE_TRINOME_DEUX_RACINES: 'PREMIERE',
  MATH_1RE_DERIV_GRAPHIQUE: 'PREMIERE',
  MATH_1RE_DERIV_NOMBRE: 'PREMIERE',
  MATH_1RE_DERIV_REFERENCE: 'PREMIERE',
  MATH_1RE_DERIV_FONCTION: 'PREMIERE',
  MATH_1RE_DERIV_VARIATION: 'PREMIERE',
  MATH_1RE_EXP: 'PREMIERE',
  MATH_1RE_EXP_ETUDE: 'PREMIERE',
  MATH_1RE_EXP_DERIVEE: 'PREMIERE',
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
      // Une clé que la partie ne propose pas tombe sur la règle de la consigne.
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

  it('plusieurs sortes de manches dans une partie', () => {
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
    fiche.competences.forEach((c) => expect([c, CODES[c]]).toEqual([c, classe]));
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

  it('aucun piège ne porte le nom d’une consigne : la phrase dite serait la mauvaise', () => {
    const parties = module.CLASSES.flatMap((c) => graines.flatMap((g) => module.serie(g, c)));
    const consignes = new Set(parties.map((m) => m.consigne));
    const pieges = parties.flatMap((m) => Object.values(m.pieges));
    expect(pieges.filter((p) => consignes.has(p))).toEqual([]);
  });

  it('chaque phrase est un texte fixe : clé en kebab-case, aucun chiffre, aucun « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim().length).toBeGreaterThan(0);
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté/i);
      // Ce qui se dit ne porte pas de notation : ni « f′ », ni « Δ », ni exposant.
      expect(texte).not.toMatch(/[′'²³ⁿˣΔ√∈≤≥×÷]/);
      // Typographie française : une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

/* ------------------------------------------------- un petit évaluateur */

const EXPOSANTS = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', ˣ: 'x', ⁿ: 'n',
};

/**
 * Évalue « 3x² − 2x + 1 », « (2x + 1)/(x − 3) », « 5/(2√x) », « −2e^(−2x) »,
 * « 6 × 4ⁿ » : les priorités, la multiplication sous-entendue, les exposants.
 */
function evaluer(texte, env = {}) {
  const s = String(texte)
    .replace(/ /g, '')
    .replace(/uₙ/g, 'u')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻ˣⁿ]+/g, (m) => `^(${m.split('').map((c) => EXPOSANTS[c]).join('')})`)
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '.');
  const jetons = s.match(/\d+(?:\.\d+)?|[a-z]|√|[-+*/^()]/g);
  let i = 0;
  const voir = () => jetons[i];
  const prendre = () => {
    i += 1;
    return jetons[i - 1];
  };
  const debutDeFacteur = (j) => j !== undefined && (/^[\d.a-z(]/.test(j) || j === '√');
  function atome() {
    const j = prendre();
    if (j === '(') {
      const v = somme(); // eslint-disable-line no-use-before-define
      if (prendre() !== ')') throw new Error(`parenthèse dans ${texte}`);
      return v;
    }
    if (j === '√') return Math.sqrt(atome());
    if (/^\d/.test(j)) return Number(j);
    if (j === 'e' && !('e' in env)) return Math.E;
    if (j in env) return env[j];
    throw new Error(`« ${j} » inconnu dans ${texte}`);
  }
  function puissance() {
    const base = atome();
    if (voir() === '^') {
      prendre();
      return base ** unaire(); // eslint-disable-line no-use-before-define
    }
    return base;
  }
  function unaire() {
    if (voir() === '-') {
      prendre();
      return -unaire();
    }
    return puissance();
  }
  function produit() {
    let v = unaire();
    for (;;) {
      const j = voir();
      if (j === '*' || j === '/') {
        prendre();
        const w = unaire();
        v = j === '*' ? v * w : v / w;
      } else if (debutDeFacteur(j)) {
        v *= unaire();
      } else {
        return v;
      }
    }
  }
  function somme() {
    let v = produit();
    while (voir() === '+' || voir() === '-') {
      const op = prendre();
      const w = produit();
      v = op === '+' ? v + w : v - w;
    }
    return v;
  }
  const v = somme();
  if (i !== jetons.length) throw new Error(`fin inattendue dans ${texte}`);
  return v;
}

const fonction = (texte, variable = 'x') => (x) => evaluer(texte, { [variable]: x });

/** Égalité à une tolérance relative. */
const proche = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

const POINTS = [-2.31, -0.77, 0.537, 1.291, 2.383, 3.719];
const POSITIFS = [0.537, 1.291, 2.383, 3.719, 4.147];

/** Deux expressions en x égales partout. */
const memeFonction = (f, g, points = POINTS) => points.every((x) => proche(f(x), g(x), 1e-9));
/** Égalité relative pure, pour des exponentielles qui peuvent être minuscules. */
const procheRel = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));

/** g est la dérivée de f : différence finie centrée. */
function estDerivee(f, g, points = POSITIFS) {
  const h = 1e-5;
  return points.every((x) => proche((f(x + h) - f(x - h)) / (2 * h), g(x), 1e-5));
}
const deriveeEn = (f, x) => {
  const h = 1e-5;
  return (f(x + h) - f(x - h)) / (2 * h);
};

/** « −5/2 », « 3 », « 0,375 », « 35 000 » → nombre. */
function rationnel(s) {
  const t = String(s).trim().replace(/ /g, '').replace(/−/g, '-').replace(',', '.');
  if (t.includes('/')) {
    const [n, d] = t.split('/').map(Number);
    return n / d;
  }
  return Number(t);
}
/** « +30 % », « −4 % » → 30, −4 ; « 112,50 € » → 112,5. */
const nombre = (s) => rationnel(String(s).replace(/[+%€\s ]/g, ''));
/** Les nombres d'un texte, signés : « A(−2 ; 5) » → [−2, 5]. */
const nombres = (s) => (String(s).replace(/ /g, '').match(/[−-]?\d+(?:,\d+)?/g) || []).map(rationnel);
/** « {−5/2 ; 3} » → [−2,5, 3] */
const elements = (s) => s.replace(/[{}]/g, '').split(' ; ').map(rationnel);

const OPS = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '≥': (a, b) => a >= b,
  '≤': (a, b) => a <= b,
};
/** Compare deux nombres à la tolérance près : −1, 0 ou 1. */
const comparer = (a, b) => (proche(a, b, 1e-9) ? 0 : Math.sign(a - b));
const vrai = (op, a, b) => OPS[op](comparer(a, b), 0);

/** « x ≤ 5/2 » → un prédicat. */
function condition(texte) {
  const [, op, v] = texte.match(/^x ([<>≤≥]) (.+)$/);
  const borne = rationnel(v);
  return (x) => vrai(op, x, borne);
}
/** « ]−∞ ; −2] ∪ [3 ; +∞[ » → un prédicat. */
function intervalles(texte) {
  const morceaux = texte.split(' ∪ ').map((m) => {
    const [, g, a, b, d] = m.match(/^([\][])(.+) ; (.+)([\][])$/);
    const lo = a === '−∞' ? -Infinity : rationnel(a);
    const hi = b === '+∞' ? Infinity : rationnel(b);
    return (x) => (g === '[' ? x >= lo : x > lo) && (d === ']' ? x <= hi : x < hi);
  });
  return (x) => morceaux.some((f) => f(x));
}
/** Une grille fine, qui passe par tous les entiers et toutes les fractions de dénominateur ≤ 6. */
const GRILLE = Array.from({ length: 2401 }, (_, k) => -20 + k / 60);
const memeEnsemble = (p, q) => GRILLE.every((x) => p(x) === q(x));

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/**
 * Le juge d'une manche : `juste(choix)` dit si un choix est vrai. La bonne
 * réponse doit l'être, aucun autre choix ne doit l'être. On collecte les
 * écarts au lieu d'un `expect` dans une branche.
 */
function juger(ecarts, m, fabrique) {
  let ok;
  try {
    const juste = fabrique(m);
    ok = juste(String(m.bonne)) && autres(m).every((c) => !juste(c));
  } catch {
    ok = false;
  }
  if (!ok) ecarts.push(`${m.consigne} — ${m.question} → ${m.bonne} parmi ${m.choix.map((c) => c.cle).join(' | ')}`);
}

/** Les juges d'un module : un par consigne. Une consigne sans juge est un écart. */
function verifierModule(module, classe, juges) {
  const ecarts = [];
  toutes(module, classe).forEach((m) => {
    const juge = juges[m.consigne];
    if (!juge) ecarts.push(`pas de juge pour ${m.consigne}`);
    else juger(ecarts, m, juge);
  });
  return ecarts;
}

it('l’évaluateur connaît les priorités, les exposants et la multiplication sous-entendue', () => {
  expect(evaluer('3x² − 2x + 1', { x: 2 })).toBe(9);
  expect(evaluer('−x²', { x: 3 })).toBe(-9);
  expect(evaluer('−7/(x − 3)²', { x: 4 })).toBe(-7);
  expect(evaluer('(2x + 1)(x² − 3)', { x: 2 })).toBe(5);
  expect(evaluer('5/(2√x)', { x: 4 })).toBe(1.25);
  expect(evaluer('2⁷')).toBe(128);
  expect(evaluer('e⁻³ × e³')).toBeCloseTo(1, 12);
  expect(evaluer('(x + 1)eˣ', { x: 0 })).toBe(1);
  expect(evaluer('−2e^(−2x)', { x: 0 })).toBe(-2);
  expect(evaluer('6 × 4ⁿ', { n: 2 })).toBe(96);
  expect(evaluer('3x × e^(3x − 1)', { x: 1 / 3 })).toBe(1);
  expect(evaluer('2uₙ − 1', { u: 5 })).toBe(9);
  expect(intervalles(']−∞ ; −2] ∪ [3 ; +∞[')(-2)).toBe(true);
  expect(intervalles(']−2 ; 3[')(3)).toBe(false);
});

/* ------------------------------------------------------- les automatismes */

/** Les juges des automatismes : la réponse se recalcule à partir de la question. */
const JUGES_AUTOMATISMES = {
  coefficient: (m) => {
    const [p] = nombres(m.question);
    const attendu = m.question.startsWith('Augmenter') ? 1 + p / 100 : 1 - p / 100;
    return (c) => proche(nombre(c), attendu);
  },
  'valeur-finale': (m) => {
    const [v0, p] = nombres(m.question);
    const attendu = v0 * (1 + (m.question.includes('augmente') ? p : -p) / 100);
    return (c) => proche(nombre(c), Math.round(attendu * 100) / 100);
  },
  'valeur-initiale': (m) => {
    const [p, vf] = nombres(m.question);
    const attendu = vf / (1 + (m.question.includes('hausse') ? p : -p) / 100);
    return (c) => proche(nombre(c), attendu);
  },
  taux: (m) => {
    const [v0, v1] = nombres(m.question);
    return (c) => proche(nombre(c), (100 * (v1 - v0)) / v0);
  },
  successives: (m) => {
    const [t1, t2] = [...m.question.matchAll(/(hausse|baisse) de (\d+)/g)]
      .map(([, sens, t]) => (sens === 'hausse' ? 1 : -1) * Number(t));
    return (c) => proche(nombre(c), ((1 + t1 / 100) * (1 + t2 / 100) - 1) * 100);
  },
  reciproque: (m) => {
    const [t0] = nombres(m.question);
    const t = m.question.includes('augmente') ? t0 : -t0;
    return (c) => proche(nombre(c), (1 / (1 + t / 100) - 1) * 100);
  },
  'pourcentage-de': (m) => {
    const [p, n] = nombres(m.question);
    return (c) => proche(nombre(c), (p * n) / 100);
  },
  'proportion-de-proportion': (m) => {
    const [p1, p2] = nombres(m.question);
    return (c) => proche(nombre(c), (p1 * p2) / 100);
  },
  developper: (m) => {
    const f = fonction(m.question.replace('Développe : ', ''));
    return (c) => memeFonction(f, fonction(c));
  },
  factoriser: (m) => {
    const f = fonction(m.question.replace('Factorise : ', ''));
    return (c) => memeFonction(f, fonction(c));
  },
  puissances: (m) => {
    const v = evaluer(m.question.replace(' = ?', ''));
    return (c) => proche(evaluer(c), v);
  },
  fractions: (m) => {
    const v = evaluer(m.question.replace(' = ?', ''));
    return (c) => proche(rationnel(c), v);
  },
  equation: (m) => {
    const [gauche, droite] = m.question.replace('Résous : ', '').split(' = ');
    return (c) => proche(evaluer(gauche, { x: rationnel(c.replace('x = ', '')) }), rationnel(droite));
  },
  inequation: (m) => {
    const [, expr, op] = m.question.match(/^Résous : (.+) ([<>≤≥]) 0$/);
    const solution = (x) => vrai(op, evaluer(expr, { x }), 0);
    return (c) => memeEnsemble(condition(c), solution);
  },
  'produit-nul': (m) => {
    const f = fonction(m.question.replace('Résous : ', '').replace(' = 0', ''));
    // Deux facteurs affines distincts : exactement deux racines.
    return (c) => {
      const xs = elements(c);
      return xs.length === 2 && xs.every((x) => proche(f(x), 0));
    };
  },
  'image-antecedent': (m) => {
    const [X, Y] = nombres(m.question);
    return (c) => {
      let a;
      let b;
      let r = c.match(/^f\((.+)\) = (.+)$/);
      if (r) [a, b] = [r[1], r[2]];
      r = c.match(/^(.+) est l’image de (.+)$/);
      if (r) [b, a] = [r[1], r[2]];
      r = c.match(/^(.+) est un antécédent de (.+)$/);
      if (r) [a, b] = [r[1], r[2]];
      return rationnel(a) === X && rationnel(b) === Y;
    };
  },
  'coefficient-directeur': (m) => {
    const [x1, y1, x2, y2] = nombres(m.question);
    return (c) => proche(rationnel(c), (y2 - y1) / (x2 - x1));
  },
  'equation-droite': (m) => {
    const [, b, x, y] = nombres(m.question);
    const pente = (y - b) / x;
    return (c) => memeFonction(fonction(c.replace('y = ', '')), (t) => pente * t + b);
  },
  'signe-lu': (m) => {
    const [x1, x2] = nombres(m.question.match(/abscisses en (.+) et en ([^ ;]+)/).slice(1).join(' '));
    const dessus = /au-dessus de cet axe entre/.test(m.question);
    const [, op] = m.question.match(/f\(x\) ([<>≤≥]) 0/);
    const f = (x) => {
      if (x === x1 || x === x2) return 0;
      const dedans = x > x1 && x < x2;
      return dedans === dessus ? 1 : -1;
    };
    return (c) => memeEnsemble(intervalles(c), (x) => OPS[op](f(x), 0));
  },
  'equation-lue': (m) => {
    const [x1, x2] = nombres(m.question.match(/d’abscisses (.+) et (.+)\. /).slice(1).join(' '));
    return (c) => {
      const xs = elements(c);
      return xs.length === 2 && xs[0] === Math.min(x1, x2) && xs[1] === Math.max(x1, x2);
    };
  },
  conditionnelle: (m) => {
    const [pA, inter] = nombres(m.question.replace('P(A ∩ B)', 'P(AB)'));
    return (c) => proche(rationnel(c), inter / pA);
  },
  'tableau-croise': (m) => {
    const [, g, s] = nombres(m.question);
    return (c) => proche(rationnel(c), s / g);
  },
  heures: (m) => {
    const [v] = nombres(m.question);
    return (c) => {
      const [h, min] = nombres(c);
      return min < 60 && proche(h + min / 60, v);
    };
  },
  'aire-volume': (m) => {
    const [, v, de, vers] = m.question.match(/^(.+) (m²|m³) = \? (cm²|dm²|L)$/);
    const facteur = { 'm²cm²': 10000, 'm²dm²': 100, 'm³L': 1000 }[de + vers];
    return (c) => proche(rationnel(c), rationnel(v) * facteur);
  },
  vitesse: (m) => {
    const [v] = nombres(m.question);
    return (c) => proche(rationnel(c), v / 3.6);
  },
};

describe('les automatismes : chaque réponse recalculée, et une seule juste', () => {
  it.each(automatismes.CLASSES)('en %s', (classe) => {
    expect(verifierModule(automatismes, classe, JUGES_AUTOMATISMES)).toEqual([]);
  });

  it.each(automatismes.CLASSES)('en %s : trois manches de taux d’évolution, cinq du reste', (classe) => {
    const TAUX = ['coefficient', 'valeur-finale', 'valeur-initiale', 'taux', 'successives', 'reciproque'];
    graines.forEach((g) => {
      const n = automatismes.serie(g, classe).filter((m) => TAUX.includes(m.consigne)).length;
      expect(n).toBe(3);
    });
  });

  it('les grands pièges sont là et nommés : +20 % puis −20 %, la réciproque de +25 %', () => {
    const tout = automatismes.CLASSES.flatMap((c) => toutes(automatismes, c));
    const allerRetour = tout.filter((m) => m.consigne === 'successives' && Object.values(m.pieges).includes('hausse-baisse-pas-nulle'));
    expect(allerRetour.length).toBeGreaterThan(0);
    allerRetour.forEach((m) => expect(m.pieges[`0${' '}%`]).toBe('hausse-baisse-pas-nulle'));
    const reciproques = tout.filter((m) => m.consigne === 'reciproque');
    expect(reciproques.length).toBeGreaterThan(0);
    reciproques.forEach((m) => expect(Object.values(m.pieges)).toContain('reciproque-pas-oppose'));
  });
});

/* ---------------------------------------------------------------- les suites */

const lireIndice = (s) => Number(s.replace(/[₀-₉]/g, (c) => String(c.charCodeAt(0) - 0x2080)));

/** Les premiers termes d'une suite définie par la question (explicite ou par récurrence). */
function termes(question, combien = 7) {
  let r = question.match(/u₀ = (\S+) et uₙ₊₁ = ([^.]+)/);
  if (r) {
    const f = fonction(r[2], 'u');
    const t = [rationnel(r[1])];
    while (t.length < combien) t.push(f(t[t.length - 1]));
    return t;
  }
  r = question.match(/uₙ = ([^.]+)/);
  if (r) {
    const f = fonction(r[1], 'n');
    return Array.from({ length: combien }, (_, n) => f(n));
  }
  r = question.match(/est (arithmétique|géométrique) de raison (\S+), avec u₀ = ([^.]+)\./);
  const [raison, u0] = [rationnel(r[2]), rationnel(r[3])];
  return Array.from({ length: combien }, (_, n) => (r[1] === 'arithmétique' ? u0 + n * raison : u0 * raison ** n));
}

const fmt = (x) => (x < 0 ? `−${-x}` : `${x}`);

function natureDe(t) {
  const d = t.slice(1).map((v, i) => v - t[i]);
  if (d.every((x) => proche(x, d[0]))) return `arithmétique, r = ${fmt(d[0])}`;
  if (t.every((v) => v !== 0)) {
    const q = t.slice(1).map((v, i) => v / t[i]);
    if (q.every((x) => proche(x, q[0]))) return `géométrique, q = ${fmt(q[0])}`;
  }
  return 'ni arithmétique ni géométrique';
}

function sensDe(t) {
  const d = t.slice(1).map((v, i) => v - t[i]);
  if (d.every((x) => x > 0)) return 'croissante';
  if (d.every((x) => x < 0)) return 'décroissante';
  return 'ni croissante ni décroissante';
}

const JUGES_SUITES = {
  recurrence: (m) => {
    const [, u0, rel, n] = m.question.match(/^u₀ = (\S+) et uₙ₊₁ = (.+)\. u([₀-₉]+) = \?$/);
    const f = fonction(rel, 'u');
    let v = rationnel(u0);
    for (let k = 0; k < lireIndice(n); k += 1) v = f(v);
    return (c) => proche(rationnel(c), v);
  },
  'terme-suivant': (m) => {
    const f = fonction(m.question.match(/uₙ = (.+)\. uₙ₊₁/)[1], 'n');
    return (c) => [0, 1, 2, 5, 9].every((n) => proche(evaluer(c, { n }), f(n + 1)));
  },
  arithmetique: (m) => {
    const [, r, p, up, n] = m.question.match(/raison (\S+), et u([₀-₉]+) = (\S+)\. u([₀-₉]+) = \?/);
    return (c) => proche(rationnel(c), rationnel(up) + (lireIndice(n) - lireIndice(p)) * rationnel(r));
  },
  geometrique: (m) => {
    const [, q, p, up, n] = m.question.match(/raison (\S+), et u([₀-₉]+) = (\S+)\. u([₀-₉]+) = \?/);
    return (c) => proche(rationnel(c), rationnel(up) * rationnel(q) ** (lireIndice(n) - lireIndice(p)));
  },
  raison: (m) => {
    const [, i, ui, j, uj] = m.question.match(/u([₀-₉]+) = (\S+) et u([₀-₉]+) = ([^.]+)\./);
    const [a, b] = [rationnel(ui), rationnel(uj)];
    const attendu = m.question.includes('arithmétique')
      ? (b - a) / (lireIndice(j) - lireIndice(i))
      : b / a;
    return (c) => proche(rationnel(c), attendu);
  },
  nature: (m) => {
    const attendu = natureDe(termes(m.question));
    return (c) => c === attendu;
  },
  somme: (m) => {
    let total = 0;
    const r = m.question.match(/u₀ = (\d+) et r = (\d+)\. .* u([₀-₉]+) = \?/);
    if (r) {
      for (let k = 0; k <= lireIndice(r[3]); k += 1) total += Number(r[1]) + k * Number(r[2]);
    } else {
      // « 1 + 2 + 3 + … + 50 » ou « 1 + 3 + 3² + … + 3⁶ » : le motif des termes, jusqu'au dernier.
      const t = m.question.replace(' = ?', '').split(' + ');
      const dernier = t[t.length - 1];
      if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(dernier)) {
        const q = Number(t[1]);
        const n = Math.round(Math.log(evaluer(dernier)) / Math.log(q));
        for (let k = 0; k <= n; k += 1) total += q ** k;
      } else {
        for (let k = 1; k <= Number(dernier); k += 1) total += k;
      }
    }
    return (c) => proche(rationnel(c), total);
  },
  variation: (m) => {
    const attendu = sensDe(termes(m.question));
    return (c) => c === attendu;
  },
};

describe('les suites : chaque réponse recalculée, et une seule juste', () => {
  it('le calcul des termes et de la nature, ici même', () => {
    expect(natureDe([1, 3, 7, 15])).toBe('ni arithmétique ni géométrique');
    expect(natureDe([5, 10, 20, 40])).toBe('géométrique, q = 2');
    expect(natureDe([4, 1, -2])).toBe('arithmétique, r = −3');
    expect(sensDe(termes('(uₙ) est géométrique de raison 2, avec u₀ = −3. Sens de variation ?'))).toBe('décroissante');
  });

  it.each(suites.CLASSES)('en %s', (classe) => {
    expect(verifierModule(suites, classe, JUGES_SUITES)).toEqual([]);
  });

  it('le piège du premier terme négatif est bien là : q = 2 et u₀ < 0, la suite décroît', () => {
    const cas = toutes(suites, 'PREMIERE').filter((m) => m.consigne === 'variation'
      && Object.values(m.pieges).includes('signe-premier-terme'));
    expect(cas.length).toBeGreaterThan(0);
  });
});

/* ----------------------------------------------------------- le second degré */

/** Les coefficients d'un trinôme écrit sous n'importe quelle forme. */
function coefficients(texte) {
  const f = fonction(texte);
  const c = f(0);
  const a = (f(1) + f(-1)) / 2 - c;
  const b = (f(1) - f(-1)) / 2;
  // On vérifie que c'est bien un trinôme ; sinon le juge échoue, et l'écart est noté.
  if (!memeFonction(f, (x) => a * x * x + b * x + c)) throw new Error(`pas un trinôme : ${texte}`);
  return [a, b, c];
}

const JUGES_SECOND_DEGRE = {
  discriminant: (m) => {
    const [a, b, c] = coefficients(m.question.match(/f\(x\) = (.+), que vaut/)[1]);
    return (r) => proche(rationnel(r), b * b - 4 * a * c);
  },
  'nombre-racines': (m) => {
    const [a, b, c] = coefficients(m.question.match(/a (.+) \?$/)[1]);
    const delta = b * b - 4 * a * c;
    let attendu = 'deux racines';
    if (delta < 0) attendu = 'aucune racine';
    if (delta === 0) attendu = 'une seule racine';
    return (r) => r === attendu;
  },
  racines: (m) => {
    const texte = m.question.match(/^Résous (.+) = 0$/)[1];
    const [a, b, c] = coefficients(texte);
    const f = fonction(texte);
    const n = Math.sign(b * b - 4 * a * c) + 1;
    return (r) => {
      const xs = elements(r);
      return xs.length === n && new Set(xs).size === n && xs.every((x) => proche(f(x), 0));
    };
  },
  canonique: (m) => {
    const f = fonction(m.question.match(/^Forme canonique de (.+) \?$/)[1]);
    return (r) => /\)² /.test(`${r} `) && memeFonction(f, fonction(r));
  },
  sommet: (m) => {
    const texte = m.question.match(/f\(x\) = (.+) \?$/)[1];
    const [a, b] = coefficients(texte);
    const alpha = -b / (2 * a);
    const beta = fonction(texte)(alpha);
    return (r) => {
      const [x, y] = nombres(r);
      return proche(x, alpha) && proche(y, beta);
    };
  },
  signe: (m) => {
    const [, expr, op] = m.question.match(/^Résous (.+) ([<>≤≥]) 0$/);
    const f = fonction(expr);
    return (r) => memeEnsemble(intervalles(r), (x) => vrai(op, f(x), 0));
  },
  'somme-produit': (m) => {
    const [a, b, c] = coefficients(m.question.match(/^(.+) = 0 a deux/)[1]);
    if (b * b - 4 * a * c <= 0) throw new Error('pas deux racines');
    return (r) => {
      const [, s, p] = r.match(/^S = (.+) ; P = (.+)$/);
      return proche(rationnel(s), -b / a) && proche(rationnel(p), c / a);
    };
  },
  'deux-racines': (m) => {
    const [r1, r2] = nombres(m.question.match(/en (.+) et en (.+) \?$/).slice(1).join(' '));
    return (r) => memeFonction(fonction(r), (x) => (x - r1) * (x - r2));
  },
};

describe('le second degré : chaque réponse recalculée, et une seule juste', () => {
  it.each(secondDegre.CLASSES)('en %s', (classe) => {
    expect(verifierModule(secondDegre, classe, JUGES_SECOND_DEGRE)).toEqual([]);
  });

  it('le piège du signe de 4ac est toujours nommé', () => {
    toutes(secondDegre, 'PREMIERE').filter((m) => m.consigne === 'discriminant').forEach((m) => {
      expect(Object.values(m.pieges)).toContain('delta-signe');
    });
  });
});

/* -------------------------------------------------------------- la dérivation */

/** « f(x) = … ; f′(x) = ? » : la fonction de la question. */
const fDeLaQuestion = (q) => fonction(q.match(/^f\(x\) = (.+) ; /)[1]);

const deriver = (m) => {
  const f = fDeLaQuestion(m.question);
  return (r) => estDerivee(f, fonction(r));
};

/** La tangente : y = f′(a)(x − a) + f(a). */
const tangente = (a, fa, pente) => (r) => memeFonction(fonction(r.replace('y = ', '')), (x) => pente * (x - a) + fa);

const JUGES_DERIVATION = {
  usuelles: deriver,
  polynome: deriver,
  produit: deriver,
  quotient: deriver,
  'nombre-derive': (m) => {
    const f = fDeLaQuestion(m.question);
    const [x0] = nombres(m.question.match(/f′\((.+)\) = \?/)[1]);
    return (r) => proche(rationnel(r), Math.round(deriveeEn(f, x0) * 1e6) / 1e6);
  },
  'nombre-derive-lu': (m) => {
    const [x0, y0, x1, y1] = nombres(m.question);
    return (r) => proche(rationnel(r), (y1 - y0) / (x1 - x0));
  },
  tangente: (m) => {
    let r = m.question.match(/^f\((.+)\) = (.+) et f′\(.+\) = ([^.]+)\./);
    if (r) {
      const [a, fa, pente] = [r[1], r[2], r[3]].map(rationnel);
      return tangente(a, fa, pente);
    }
    r = m.question.match(/^f\(x\) = (.+) ; tangente au point d’abscisse (.+) \?$/);
    const f = fonction(r[1]);
    const a = rationnel(r[2]);
    return tangente(a, f(a), Math.round(deriveeEn(f, a) * 1e6) / 1e6);
  },
  variations: (m) => {
    const [, expr, A, B] = m.question.match(/^f′\(x\) = (.+)\. Sur \[(.+) ; (.+)\]/);
    const fp = fonction(expr);
    const [a, b] = [rationnel(A), rationnel(B)];
    const interieur = Array.from({ length: 19 }, (_, k) => a + ((k + 1) * (b - a)) / 20).map(fp);
    let attendu = null;
    if (interieur.every((v) => v > 0)) attendu = 'croissante';
    if (interieur.every((v) => v < 0)) attendu = 'décroissante';
    return (r) => r === attendu;
  },
};

describe('la dérivation : chaque réponse recalculée, et une seule juste', () => {
  it('la vérification par différence finie reconnaît une dérivée, et seulement elle', () => {
    expect(estDerivee(fonction('(2x + 1)/(x − 3)'), fonction('−7/(x − 3)²'))).toBe(true);
    expect(estDerivee(fonction('(2x + 1)/(x − 3)'), fonction('7/(x − 3)²'))).toBe(false);
    expect(estDerivee(fonction('3√x'), fonction('3/(2√x)'))).toBe(true);
  });

  it.each(derivation.CLASSES)('en %s', (classe) => {
    expect(verifierModule(derivation, classe, JUGES_DERIVATION)).toEqual([]);
  });

  it('le piège (uv)′ = u′v′ est toujours proposé pour un produit', () => {
    toutes(derivation, 'PREMIERE').filter((m) => m.consigne === 'produit').forEach((m) => {
      expect(Object.values(m.pieges)).toContain('produit-des-derivees');
    });
  });
});

/* ---------------------------------------------------------- l'exponentielle */

/** « LHS = ? » : deux expressions égales pour tout x (des exponentielles : égalité relative). */
const egalite = (m) => {
  const f = fonction(m.question.replace(' = ?', ''));
  return (r) => {
    const g = fonction(r);
    return POINTS.every((x) => procheRel(f(x), g(x)));
  };
};

/**
 * « (ax + b)e^(kx) … » : l'exponentielle est strictement positive (on le
 * vérifie sur la grille) ; le signe et les zéros sont ceux du facteur affine.
 */
function facteurAffine(question, motif) {
  const [, affine, exp, op] = question.match(motif);
  const h = fonction(exp);
  if (!GRILLE.every((x) => h(x) > 0)) throw new Error(`exponentielle non positive : ${exp}`);
  return [fonction(affine), op];
}

/** « Résous G op D » : la condition proposée a le même ensemble de solutions. */
const inequation = (m) => {
  const [, g, op, d] = m.question.match(/^Résous (.+) ([<>≤≥]) (.+)$/);
  const [fg, fd] = [fonction(g), fonction(d)];
  return (r) => memeEnsemble(condition(r), (x) => vrai(op, fg(x), fd(x)));
};

const JUGES_EXPONENTIELLE = {
  produit: egalite,
  quotient: egalite,
  puissance: egalite,
  inverse: egalite,
  'signe-toujours': (m) => {
    const f = fonction(m.question.match(/^Pour tout réel x, (.+) est…$/)[1]);
    const valeurs = GRILLE.map(f);
    let attendu = null;
    if (valeurs.every((v) => v > 0)) attendu = 'strictement positif';
    if (valeurs.every((v) => v < 0)) attendu = 'strictement négatif';
    return (r) => r === attendu;
  },
  'signe-equation': (m) => {
    const [g] = facteurAffine(m.question, /^Résous \((.+?)\)(e.+) = 0$/);
    // Un seul facteur affine, et une exponentielle qui ne s'annule jamais : une solution.
    return (r) => {
      const xs = elements(r);
      return xs.length === 1 && proche(g(xs[0]), 0);
    };
  },
  'signe-inequation': (m) => {
    const [g, op] = facteurAffine(m.question, /^Résous \((.+?)\)(e.+) ([<>≤≥]) 0$/);
    return (r) => memeEnsemble(condition(r), (x) => vrai(op, g(x), 0));
  },
  inequation,
  equation: (m) => {
    const [, g, d] = m.question.match(/^Résous (.+) = (.+)$/);
    const [fg, fd] = [fonction(g), fonction(d)];
    return (r) => {
      const x = rationnel(r.replace('x = ', ''));
      return procheRel(fg(x), fd(x));
    };
  },
  derivee: deriver,
  variation: (m) => {
    const f = fonction(m.question.match(/^f\(x\) = (.+)\. Sur ℝ/)[1]);
    const pentes = POINTS.map((x) => deriveeEn(f, x));
    let attendu = null;
    if (pentes.every((v) => v > 0)) attendu = 'croissante';
    if (pentes.every((v) => v < 0)) attendu = 'décroissante';
    return (r) => r === attendu;
  },
};

describe('l’exponentielle : chaque réponse recalculée, et une seule juste', () => {
  it.each(exponentielle.CLASSES)('en %s', (classe) => {
    expect(verifierModule(exponentielle, classe, JUGES_EXPONENTIELLE)).toEqual([]);
  });

  it('le piège e^(…) = 1 résolu comme … = 1 est bien nommé', () => {
    const cas = toutes(exponentielle, 'PREMIERE').filter((m) => / = 1$/.test(m.question));
    cas.forEach((m) => expect(Object.values(m.pieges)).toContain('exp-zero'));
  });
});
