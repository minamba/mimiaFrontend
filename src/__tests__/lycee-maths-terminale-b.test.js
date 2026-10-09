/**
 * LES JEUX DE MATHS DE TERMINALE, LOT B — quatre modules : le dénombrement,
 * la géométrie dans l'espace, la convexité, la récurrence.
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun autre choix ne doit
 * être juste lui aussi. Les banques écrites à la main (la convexité des
 * fonctions de référence, les preuves par récurrence) sont vérifiées par le
 * calcul quand c'est possible.
 */

import * as denombrement from '../lib/jeux/lycee/denombrement';
import * as espace from '../lib/jeux/lycee/geometrie-espace';
import * as convexite from '../lib/jeux/lycee/convexite';
import * as recurrence from '../lib/jeux/lycee/recurrence';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['denombrement', denombrement],
  ['geometrie-espace', espace],
  ['convexite', convexite],
  ['recurrence', recurrence],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur colonne NIVEAU. */
const CODES = {
  MATH_TLE_DENOMBR_REPRESENTER: 'TERMINALE',
  MATH_TLE_DENOMBR_PRINCIPES: 'TERMINALE',
  MATH_TLE_DENOMBR_KUPLETS: 'TERMINALE',
  MATH_TLE_DENOMBR_PERMUTATIONS: 'TERMINALE',
  MATH_TLE_DENOMBR_COMBINAISONS: 'TERMINALE',
  MATH_TLE_DENOMBR_PASCAL: 'TERMINALE',
  MATH_TLE_VECT_ESPACE: 'TERMINALE',
  MATH_TLE_PARAMETRIQUE: 'TERMINALE',
  MATH_TLE_PLAN_CARTESIEN: 'TERMINALE',
  MATH_TLE_SCAL_ESPACE: 'TERMINALE',
  MATH_TLE_ORTHOGONALITE: 'TERMINALE',
  MATH_TLE_DROITES_PLANS: 'TERMINALE',
  MATH_TLE_CONVEXITE: 'TERMINALE',
  MATH_TLE_RECURRENCE: 'TERMINALE',
};

const CLASSES_DU_LYCEE = [
  'SECONDE', 'PREMIERE', 'TERMINALE', 'PREMIERE_TECHNO', 'TERMINALE_TECHNO',
  'SECONDE_PRO', 'PREMIERE_PRO', 'TERMINALE_PRO',
];

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

  it('la classe a son titre, son accroche et ses compétences officielles, de cette classe', () => {
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
    module.CLASSES.forEach((c) => expect(CLASSES_DU_LYCEE).toContain(c));
    expect(module.MANCHES).toBe(8);
    expect(module.bilan(8)).toBeTruthy();
  });

  it('chaque phrase est un texte fixe : clé en kebab-case, aucun chiffre, aucun « raté »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim().length).toBeGreaterThan(0);
      expect([k, texte]).not.toEqual([k, expect.stringMatching(/\d/)]);
      expect(texte).not.toMatch(/raté/i);
      // Typographie française : une espace avant « ? ! : ; ».
      expect([k, texte]).not.toEqual([k, expect.stringMatching(/\S[?!:;]/)]);
    });
  });

  it('plusieurs sortes de manches dans une partie', () => {
    graines.slice(0, 10).forEach((g) => {
      const sortes = new Set(module.serie(g).map((m) => m.consigne));
      expect(sortes.size).toBeGreaterThanOrEqual(5);
    });
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module) => graines.flatMap((g) => module.serie(g, 'TERMINALE'));
const parConsigne = (module, consigne) => toutes(module).filter((m) => m.consigne === consigne);
const cles = (m) => m.choix.map((c) => String(c.cle));

/** « −12 » → −12 ; « 35 960 » → 35960. */
const entier = (s) => Number(String(s).replace(/[\s ]/g, '').replace(/−/g, '-'));

/**
 * Chaque choix est jugé par `juste(cle)` : la bonne réponse doit l'être, et
 * elle seule. Les écarts sont collectés, puis on vérifie qu'il n'y en a aucun.
 */
function seuleJuste(m, juste, ecarts) {
  cles(m).forEach((c) => {
    const j = juste(c);
    if (j !== (c === String(m.bonne))) ecarts.push({ question: m.question, choix: c, bonne: m.bonne, juste: j });
  });
}

/** Lit une manche avec une liste de [motif, calcul] ; aucun motif reconnu : écart. */
function lire(m, motifs, ecarts) {
  const trouve = motifs.find(([motif]) => motif.test(m.question));
  if (!trouve) {
    ecarts.push({ illisible: m.question });
    return null;
  }
  return trouve[1](...m.question.match(trouve[0]).slice(1).map(Number));
}

/* ------------------------------------------------------------ dénombrement */

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const C = (n, k) => (k < 0 || k > n ? 0 : Math.round(fact(n) / (fact(k) * fact(n - k))));
const A = (n, k) => fact(n) / fact(n - k);

const DENOMBREMENT = {
  principes: [
    [/propose (\d+) entrées, (\d+) plats et (\d+) desserts/, (a, b, c) => a * b * c],
    [/parmi (\d+) comédies et (\d+) drames/, (a, b) => a + b],
  ],
  'k-uplets': [
    [/a (\d+) molettes, chacune portant (\d+) symboles/, (k, n) => n ** k],
    [/On lance (\d+) fois un dé à (\d+) faces/, (k, n) => n ** k],
    [/mots de (\d+) lettres, avec ou sans sens, écrits avec un alphabet de (\d+) lettres/, (k, n) => n ** k],
    [/compte (\d+) questions, à (\d+) réponses chacune/, (k, n) => n ** k],
  ],
  arrangements: [
    [/^(\d+) coureurs prennent le départ\. Combien de podiums/, (n) => A(n, 3)],
    [/association de (\d+) membres élit un président, un trésorier et un secrétaire/, (n) => A(n, 3)],
    [/sans remise (\d+) boules d’une urne de (\d+) boules/, (k, n) => A(n, k)],
  ],
  permutations: [
    [/ranger (\d+) livres différents/, (n) => fact(n)],
    [/façons (\d+) amis peuvent-ils se placer en file/, (n) => fact(n)],
  ],
  combinaisons: [
    [/classe de (\d+) élèves, on choisit (\d+) délégués/, (n, k) => C(n, k)],
    [/mains de (\d+) cartes peut-on tirer d’un jeu de (\d+) cartes/, (k, n) => C(n, k)],
    [/simultanément (\d+) boules d’une urne de (\d+) boules/, (k, n) => C(n, k)],
    [/équipe de (\d+) joueurs parmi (\d+)/, (k, n) => C(n, k)],
  ],
  chemins: [
    [/en (\d+) pas vers la droite et (\d+) pas vers le haut/, (a, b) => C(a + b, a)],
    [/mots de (\d+) lettres contiennent exactement (\d+) fois la lettre A/, (n, a) => C(n, a)],
  ],
  pascal: [[/Combien vaut C\((\d+), (\d+)\) \?/, (n, k) => C(n, k)]],
  parties: [
    [/propose (\d+) garnitures/, (n) => 2 ** n],
    [/ensemble à (\d+) éléments/, (n) => 2 ** n],
  ],
};

describe('le dénombrement : chaque compte est refait ici', () => {
  it.each(Object.keys(DENOMBREMENT))('%s', (consigne) => {
    const ecarts = [];
    // Les anagrammes ont leur propre épreuve, plus bas.
    const manches = parConsigne(denombrement, consigne).filter((m) => !/anagrammes/.test(m.question));
    expect(manches.length).toBeGreaterThan(0);
    manches.forEach((m) => {
      const attendu = lire(m, DENOMBREMENT[consigne], ecarts);
      if (attendu !== null) seuleJuste(m, (c) => entier(c) === attendu, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('les anagrammes : un mot aux lettres toutes différentes, n! anagrammes', () => {
    const ecarts = [];
    parConsigne(denombrement, 'permutations').filter((m) => /anagrammes/.test(m.question)).forEach((m) => {
      const mot = m.question.match(/du mot ([A-Z]+)/)[1];
      if (new Set(mot).size !== mot.length) ecarts.push({ lettresRepetees: mot });
      seuleJuste(m, (c) => entier(c) === fact(mot.length), ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('le triangle de Pascal affiché est juste', () => {
    const ecarts = [];
    parConsigne(denombrement, 'pascal').forEach((m) => {
      const [, n, ligne] = m.question.match(/Ligne n = (\d+) du triangle de Pascal :\n([^\n]+)\n/);
      const attendu = Array.from({ length: Number(n) + 1 }, (_, i) => C(Number(n), i)).join(' ');
      if (ligne.trim().split(/\s+/).join(' ') !== attendu) ecarts.push({ n, ligne });
    });
    expect(ecarts).toEqual([]);
  });

  it('la symétrie : seul le bon coefficient a la même valeur', () => {
    const ecarts = [];
    const valeur = (s) => {
      const [, n, k] = s.match(/C\((\d+), (\d+)\)/).map(Number);
      return C(n, k);
    };
    parConsigne(denombrement, 'symetrie').forEach((m) => {
      const attendu = valeur(m.question);
      seuleJuste(m, (c) => valeur(c) === attendu, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('quel modèle : chaque modèle a ses situations, et la bonne n’est jamais un piège', () => {
    const modeles = new Set(denombrement.SITUATIONS.map(([, m]) => m));
    expect([...modeles].sort()).toEqual(['arrangement', 'combinaison', 'kuplet']);
    parConsigne(denombrement, 'quel-modele').forEach((m) => {
      expect(Object.keys(m.pieges)).not.toContain(m.bonne);
      expect(Object.keys(m.pieges).sort()).toEqual(cles(m).filter((c) => c !== m.bonne).sort());
    });
  });
});

/* ------------------------------------------------------------------ espace */

const nombre = (s) => Number(String(s).trim().replace(/−/g, '-'));
const triplet = (s) => s.replace(/[()]/g, '').split(';').map((x) => (x.trim() === 'm' ? 'm' : nombre(x)));
const point = (nom, q) => triplet(q.match(new RegExp(`${nom}(\\([^)]*\\))`))[1]);

/** « 1 + 2t » → [1, 2] ; « −t » → [0, −1] ; « 5 » → [5, 0]. */
function affine(s, p) {
  const e = s.replace(/\s/g, '').replace(/−/g, '-');
  if (!e.includes(p)) return [Number(e), 0];
  const [, c, k] = e.slice(0, e.indexOf(p)).match(/^(.*?)([+-]?\d*)$/);
  const coef = { '': 1, '+': 1, '-': -1 }[k] ?? Number(k);
  return [c === '' ? 0 : Number(c), coef];
}

/** Une droite « d : x = … ; y = … ; z = … (t ∈ ℝ) » → [point, vecteur]. */
function droite(ligne) {
  const [, x, y, z, p] = ligne.match(/x = (.+?) ; y = (.+?) ; z = (.+?) \((\w) ∈ ℝ\)/);
  const [ax, ay, az] = [affine(x, p), affine(y, p), affine(z, p)];
  return [[ax[0], ay[0], az[0]], [ax[1], ay[1], az[1]]];
}

/** « 2x − y + 3z − 4 = 0 » → [2, −1, 3, −4]. */
function equation(s) {
  const e = s.replace(/= 0.*$/, '').replace(/\s/g, '').replace(/−/g, '-');
  const coefs = [0, 0, 0, 0];
  e.match(/[+-]?[^+-]+/g).forEach((terme) => {
    const i = 'xyz'.indexOf(terme.slice(-1));
    if (i < 0) coefs[3] += Number(terme);
    else {
      const k = terme.slice(0, -1);
      coefs[i] += { '': 1, '+': 1, '-': -1 }[k] ?? Number(k);
    }
  });
  return coefs;
}

const scal = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const vect = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const nul = (u) => u.every((x) => x === 0);
const colin = (u, v) => nul(vect(u, v));
const moins = (u, v) => u.map((x, i) => x - v[i]);
const egaux = (u, v) => u.every((x, i) => x === v[i]);

describe('la géométrie dans l’espace : chaque réponse est vérifiée ici', () => {
  it('un point sur une droite : la bonne valeur de t, ou aucune', () => {
    const ecarts = [];
    parConsigne(espace, 'point-droite').forEach((m) => {
      const [A0, u] = droite(m.question.split('\n')[0]);
      const M = point('M', m.question);
      const donne = (t) => egaux(A0.map((x, i) => x + t * u[i]), M);
      const tx = (M[0] - A0[0]) / u[0];
      seuleJuste(m, (c) => (c.startsWith('Aucune') ? !donne(tx) : donne(nombre(c.replace('t =', '')))), ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('le vecteur normal : colinéaire aux coefficients, et lui seul', () => {
    const ecarts = [];
    parConsigne(espace, 'vecteur-normal').forEach((m) => {
      const n = equation(m.question.split('\n')[0].replace('P : ', '')).slice(0, 3);
      seuleJuste(m, (c) => {
        const v = triplet(c);
        return !nul(v) && colin(v, n);
      }, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('l’équation du plan : le bon vecteur normal ET le point dedans', () => {
    const ecarts = [];
    parConsigne(espace, 'equation-plan').forEach((m) => {
      const A0 = point('A', m.question);
      const n = point('n', m.question);
      seuleJuste(m, (c) => {
        const e = equation(c);
        return colin(e.slice(0, 3), n) && scal(e.slice(0, 3), A0) + e[3] === 0;
      }, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('un point du plan : il vérifie l’équation, et lui seul', () => {
    const ecarts = [];
    parConsigne(espace, 'point-plan').forEach((m) => {
      const e = equation(m.question.split('\n')[0].replace('P : ', ''));
      seuleJuste(m, (c) => scal(e.slice(0, 3), triplet(c)) + e[3] === 0, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('l’orthogonalité : le produit scalaire s’annule pour la bonne valeur de m seulement', () => {
    const ecarts = [];
    parConsigne(espace, 'orthogonal').forEach((m) => {
      const u = point('u', m.question);
      const v = point('v', m.question);
      seuleJuste(m, (c) => scal(u.map((x) => (x === 'm' ? nombre(c.replace('m =', '')) : x)), v) === 0, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('deux droites : parallèles, sécantes ou non coplanaires, recalculé', () => {
    const ecarts = [];
    parConsigne(espace, 'positions').forEach((m) => {
      const [l1, l2] = m.question.split('\n');
      const [A0, u] = droite(l1);
      const [B, v] = droite(l2);
      const AB = moins(B, A0);
      let vraie;
      if (colin(u, v)) vraie = colin(AB, u) ? 'confondues' : 'paralleles';
      else vraie = scal(vect(u, v), AB) === 0 ? 'secantes' : 'non-coplanaires';
      if (vraie !== m.bonne) ecarts.push({ question: m.question, bonne: m.bonne, vraie });
    });
    expect(ecarts).toEqual([]);
  });

  it('trois vecteurs : la combinaison annoncée est la seule juste, ou ils ne sont pas coplanaires', () => {
    const ecarts = [];
    const coef = (k) => ({ '': 1, '+': 1, '-': -1 }[k] ?? Number(k));
    parConsigne(espace, 'coplanaires').forEach((m) => {
      const [u, v, w] = ['u', 'v', 'w'].map((nom) => point(nom, m.question));
      seuleJuste(m, (c) => {
        if (c === 'Non') return scal(vect(u, v), w) !== 0;
        const e = c.replace('Oui : w = ', '').replace(/\s/g, '').replace(/−/g, '-');
        const r = e.match(/^([+-]?\d*)u(?:([+-]\d*)v)?$/);
        const s = e.match(/^([+-]?\d*)v$/);
        const [a, b] = r ? [coef(r[1]), r[2] === undefined ? 0 : coef(r[2])] : [0, coef(s[1])];
        return egaux(u.map((x, i) => a * x + b * v[i]), w);
      }, ecarts);
    });
    expect(ecarts).toEqual([]);
  });
});

/* --------------------------------------------------------------- convexité */

/** « 2x³ − 3x² + x − 5 » → { 3: 2, 2: −3, 1: 1, 0: −5 }. */
function polynome(s) {
  const e = s.replace(/\s/g, '').replace(/−/g, '-').replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
  const p = {};
  if (e === '0') return p;
  e.match(/[+-]?[^+-]+/g).forEach((terme) => {
    let degre = 0;
    let k = terme;
    if (terme.includes('x')) {
      const [avant, apres] = terme.split('x');
      degre = apres ? Number(apres.replace('^', '')) : 1;
      k = avant;
    }
    const coef = { '': 1, '+': 1, '-': -1 }[k] ?? Number(k);
    p[degre] = (p[degre] ?? 0) + coef;
  });
  Object.keys(p).forEach((d) => { if (p[d] === 0) delete p[d]; });
  return p;
}
const deriverP = (p) => {
  const q = {};
  Object.entries(p).forEach(([d, k]) => { if (Number(d) > 0) q[Number(d) - 1] = k * Number(d); });
  return q;
};
const evaluer = (p, x) => Object.entries(p).reduce((s, [d, k]) => s + k * x ** Number(d), 0);
const memePolynome = (p, q) => JSON.stringify(Object.entries(p).sort()) === JSON.stringify(Object.entries(q).sort());
const fDe = (m) => polynome(m.question.split('\n')[0].replace(/^f\(x\) = /, ''));

/** Le signe d'une fonction sur des points : '+', '−' ou '±'. */
function signe(f, points) {
  const valeurs = points.map(f);
  if (valeurs.every((y) => y >= 0)) return '+';
  if (valeurs.every((y) => y <= 0)) return '−';
  return '±';
}
const pas = (a, b, n = 400) => Array.from({ length: n + 1 }, (_, i) => a + ((b - a) * i) / n);
const INTERVALLES = {
  ℝ: pas(-10, 10),
  ']0 ; +∞[': pas(0.01, 20),
  '[0 ; +∞[': pas(0, 20),
  ']−∞ ; 0[': pas(-20, -0.01),
  '[−π/2 ; π/2]': pas(-Math.PI / 2, Math.PI / 2),
  '[0 ; π]': pas(0, Math.PI),
};
const ALLURE = { '+': 'convexe', '−': 'concave', '±': 'ni' };

/** Les dérivées secondes de la banque, recalculées à la main. */
const SECONDES = {
  'x² + 1': (x) => x * x + 1,
  'eˣ': (x) => Math.exp(x),
  'e^(−x)': (x) => Math.exp(-x),
  '1/x²': (x) => 1 / (x * x),
  '4 + cos x': (x) => 4 + Math.cos(x),
  'x⁴ + 3': (x) => x ** 4 + 3,
  '6x': (x) => 6 * x,
  '1/x': (x) => 1 / x,
  '−2': () => -2,
  '−x² − 1': (x) => -x * x - 1,
  '−eˣ': (x) => -Math.exp(x),
  '−1/x²': (x) => -1 / (x * x),
  'sin x − 2': (x) => Math.sin(x) - 2,
  '−6x': (x) => -6 * x,
  'x − 1': (x) => x - 1,
  'x³': (x) => x ** 3,
  'cos x': (x) => Math.cos(x),
  'eˣ − 1': (x) => Math.exp(x) - 1,
  'ln x': (x) => Math.log(x),
  'x² − 4': (x) => x * x - 4,
};

/** Les fonctions de référence et leur dérivée seconde, calculée à la main. */
const REFERENCES = {
  'x ↦ x²': () => 2,
  'x ↦ eˣ': (x) => Math.exp(x),
  'x ↦ e^(−x)': (x) => Math.exp(-x),
  'x ↦ x⁴': (x) => 12 * x * x,
  'x ↦ x³': (x) => 6 * x,
  'x ↦ 1/x': (x) => 2 / x ** 3,
  'x ↦ ln x': (x) => -1 / (x * x),
  'x ↦ √x': (x) => -1 / (4 * x ** 1.5),
  'x ↦ −x²': () => -2,
  'x ↦ cos x': (x) => -Math.cos(x),
  'x ↦ sin x': (x) => -Math.sin(x),
};

/** Le lien avec les dérivées : ce qu'on peut conclure, écrit ici indépendamment. */
const LIENS = {
  'f′ est croissante sur I.': 'convexe',
  'f′ est décroissante sur I.': 'concave',
  'f″(x) ≥ 0 pour tout x de I.': 'convexe',
  'f″(x) ≤ 0 pour tout x de I.': 'concave',
  'La courbe de f est au-dessus de toutes ses tangentes sur I.': 'convexe',
  'La courbe de f est au-dessus de toutes ses cordes sur I.': 'concave',
  'f est croissante sur I.': 'rien',
  'f′(x) ≥ 0 pour tout x de I.': 'rien',
  'f′(x) ≤ 0 pour tout x de I.': 'rien',
};

describe('la convexité : chaque réponse est vérifiée ici', () => {
  it('la dérivée seconde : dérivée deux fois, et aucun piège n’est égal', () => {
    const ecarts = [];
    parConsigne(convexite, 'derivee-seconde').forEach((m) => {
      const f2 = deriverP(deriverP(fDe(m)));
      seuleJuste(m, (c) => memePolynome(polynome(c), f2), ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('convexe sur un intervalle : le signe de f″ sur [a ; b]', () => {
    const ecarts = [];
    parConsigne(convexite, 'convexe-sur').forEach((m) => {
      const f2 = deriverP(deriverP(fDe(m)));
      const [, a, b] = m.question.match(/Sur \[(−?\d+) ; (−?\d+)\]/).map(nombre);
      const vraie = ALLURE[signe((x) => evaluer(f2, x), pas(a, b))];
      // Jamais de racine de f″ au bord : convexe ou concave au sens strict.
      const auBord = [a, b].some((x) => evaluer(f2, x) === 0);
      if (vraie !== m.bonne || auBord) ecarts.push({ question: m.question, bonne: m.bonne, vraie });
    });
    expect(ecarts).toEqual([]);
  });

  it('le point d’inflexion d’une cubique : là où f″ s’annule', () => {
    const ecarts = [];
    parConsigne(convexite, 'inflexion').forEach((m) => {
      const f = fDe(m);
      const r = -(f[2] ?? 0) / (3 * f[3]);
      seuleJuste(m, (c) => nombre(c.replace('x =', '')) === r, ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('les points d’inflexion, f″ factorisée : là où elle change de signe', () => {
    const ecarts = [];
    parConsigne(convexite, 'points-inflexion').forEach((m) => {
      const e = m.question.split('\n')[0].replace('f″(x) = ', '');
      const [, k] = e.match(/^([^(]*)\(/);
      const coef = { '': 1, '−': -1 }[k] ?? nombre(k);
      const facteurs = [...e.matchAll(/\(x ([−+]) (\d+)\)(²?)/g)].map(([, s, r, carre]) => [s === '−' ? Number(r) : -Number(r), carre ? 2 : 1]);
      const f2 = (x) => facteurs.reduce((p, [r, mult]) => p * (x - r) ** mult, coef);
      const inflexions = facteurs.map(([r]) => r).filter((r) => Math.sign(f2(r - 0.25)) !== Math.sign(f2(r + 0.25)));
      const ensemble = (c) => [...c.matchAll(/x = (−?\d+)/g)].map(([, v]) => nombre(v)).sort((a, b) => a - b);
      const vraies = [...inflexions].sort((a, b) => a - b);
      seuleJuste(m, (c) => JSON.stringify(ensemble(c)) === JSON.stringify(vraies), ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('la banque des dérivées secondes : le signe annoncé est le vrai', () => {
    const ecarts = [];
    convexite.SECONDES.forEach(([f2, intervalle, s]) => {
      const vrai = SECONDES[f2] ? signe(SECONDES[f2], INTERVALLES[intervalle]) : 'inconnue';
      if (vrai !== s) ecarts.push({ f2, intervalle, annonce: s, vrai });
    });
    expect(ecarts).toEqual([]);
  });

  it('la courbe et ses tangentes, ou ses cordes', () => {
    const ecarts = [];
    parConsigne(convexite, 'position-courbe').forEach((m) => {
      const [, f2, intervalle] = m.question.match(/^f″\(x\) = (.+) sur (.+)\.\n/);
      const s = signe(SECONDES[f2], INTERVALLES[intervalle]);
      const tangentes = /ses tangentes/.test(m.question);
      let vraie = 'aucun';
      if (s !== '±') vraie = (s === '+') === tangentes ? 'dessus' : 'dessous';
      if (vraie !== m.bonne) ecarts.push({ question: m.question, bonne: m.bonne, vraie });
    });
    expect(ecarts).toEqual([]);
  });

  it('les fonctions de référence : l’allure annoncée est celle du signe de f″', () => {
    const ecarts = [];
    convexite.REFERENCES.forEach(([fonction, intervalle, allure]) => {
      const f2 = REFERENCES[fonction];
      const vraie = f2 ? ALLURE[signe(f2, INTERVALLES[intervalle])] : 'inconnue';
      if (vraie !== allure) ecarts.push({ fonction, intervalle, allure, vraie });
    });
    parConsigne(convexite, 'reference').forEach((m) => {
      expect(Object.keys(m.pieges)).not.toContain(m.bonne);
    });
    expect(ecarts).toEqual([]);
  });

  it('le lien avec les dérivées : la conclusion annoncée est la bonne', () => {
    const ecarts = [];
    convexite.LIENS.forEach(([hypothese, conclusion]) => {
      if (LIENS[hypothese] !== conclusion) ecarts.push({ hypothese, conclusion });
    });
    parConsigne(convexite, 'lien-derivee').forEach((m) => {
      expect(Object.keys(m.pieges)).not.toContain(m.bonne);
    });
    expect(ecarts).toEqual([]);
  });
});

/* -------------------------------------------------------------- récurrence */

const INDICES = '₀₁₂₃₄₅₆₇₈₉';
const indice = (s) => Number(s.split('').map((c) => INDICES.indexOf(c)).join(''));
const coefU = (k) => ({ '': 1, '−': -1 }[k] ?? nombre(k));

/** « u₀ = 2 et uₙ₊₁ = 3uₙ − 1. » ou « … = uₙ + 2n − 3. » → [u₀, suivant(u, n)]. */
function suite(q) {
  const u0 = nombre(q.match(/^u₀ = (−?\d+) et/)[1]);
  const aff = q.match(/uₙ₊₁ = (−?\d*)uₙ(?: ([+−]) (\d+))?\.\n/);
  const ind = q.match(/uₙ₊₁ = uₙ \+ (\d*)n(?: ([+−]) (\d+))?\.\n/);
  if (ind) {
    const c = ind[1] === '' ? 1 : Number(ind[1]);
    const e = ind[2] ? (ind[2] === '−' ? -1 : 1) * Number(ind[3]) : 0; // eslint-disable-line no-nested-ternary
    return [u0, (u, n) => u + c * n + e];
  }
  const p = coefU(aff[1]);
  const b = aff[2] ? (aff[2] === '−' ? -1 : 1) * Number(aff[3]) : 0; // eslint-disable-line no-nested-ternary
  return [u0, (u) => p * u + b];
}
const lesTermes = (u0, suivant, N) => {
  const u = [u0];
  for (let n = 0; n < N; n += 1) u.push(suivant(u[n], n));
  return u;
};

/** « uₙ = 2 × 3ⁿ − 1 », « uₙ = 3ⁿ⁺¹ + 2 », « uₙ = 4n − 3 » → n ↦ valeur. */
function formule(s) {
  const g = s.match(/^uₙ = (?:(−?\d+) × )?(\d+)(ⁿ⁺¹|ⁿ)(?: ([+−]) (\d+))?$/);
  if (g) {
    const m = g[1] ? nombre(g[1]) : 1;
    const l = g[4] ? (g[4] === '−' ? -1 : 1) * Number(g[5]) : 0; // eslint-disable-line no-nested-ternary
    const decalage = g[3] === 'ⁿ⁺¹' ? 1 : 0;
    return (n) => m * Number(g[2]) ** (n + decalage) + l;
  }
  const a = s.match(/^uₙ = (\d*)n(?: ([+−]) (\d+))?$/);
  if (!a) return () => NaN;
  const r = a[1] === '' ? 1 : Number(a[1]);
  const c = a[2] ? (a[2] === '−' ? -1 : 1) * Number(a[3]) : 0; // eslint-disable-line no-nested-ternary
  return (n) => r * n + c;
}

/**
 * Les preuves de la banque, revérifiées par le calcul. Pour chacune : ce qui
 * cloche vraiment, et les faits qui le prouvent.
 */
const tous = (de, a, f) => Array.from({ length: a - de + 1 }, (_, i) => de + i).every(f);
const PREUVES = {
  'P(n) : 3ⁿ est pair.': ['initialisation', () => 3 ** 0 % 2 === 1 && tous(0, 10, (n) => (3 * 2 * n) % 2 === 0)],
  'P(n) : 4ⁿ + 1 est divisible par 3.': ['initialisation',
    () => (4 ** 0 + 1) % 3 !== 0 && tous(0, 10, (n) => 4 * (4 ** n + 1) - 3 === 4 ** (n + 1) + 1)],
  'P(n) : 1 + 2 + … + n = n(n + 1)/2 + 1, pour n ≥ 1.': ['initialisation',
    () => 1 !== (1 * 2) / 2 + 1 && tous(1, 20, (n) => (n * (n + 1)) / 2 + 1 + n + 1 === ((n + 1) * (n + 2)) / 2 + 1)],
  'P(n) : uₙ = 2ⁿ − 1.': ['initialisation',
    () => 1 !== 2 ** 0 - 1 && tous(0, 20, (n) => 2 * (2 ** n - 1) + 1 === 2 ** (n + 1) - 1)],
  'P(n) : uₙ ≤ 2.': ['heredite', () => 1 <= 2 && 3 - 0 > 1], // u = 0 ≤ 2, et pourtant 3 − u = 3 > 1.
  // L'initialisation tient, l'inégalité de l'hérédité est fausse en n = 1, et P(2) elle-même est fausse.
  'P(n) : 2ⁿ > n², pour n ≥ 1.': ['heredite', () => {
    const P = (n) => 2 ** n > n * n;
    return P(1) && !(2 * 1 * 1 >= (1 + 1) ** 2) && !P(2);
  }],
  'P(n) : 7ⁿ − 1 est divisible par 6.': ['heredite',
    () => (7 ** 0 - 1) % 6 === 0 && tous(0, 10, (n) => 7 * (7 ** n - 1) !== 7 ** (n + 1) - 1)],
  'P(n) : 5ⁿ − 1 est divisible par 4.': ['heredite', () => (5 ** 0 - 1) % 4 === 0],
  'P(n) : 10ⁿ − 1 est divisible par 9.': ['rien',
    () => tous(0, 12, (n) => (10 ** n - 1) % 9 === 0 && 10 * (10 ** n - 1) + 9 === 10 ** (n + 1) - 1)],
  'P(n) : 2ⁿ ≥ n + 1.': ['rien', () => tous(0, 40, (n) => 2 ** n >= n + 1 && 2 * n + 2 >= n + 2)],
  'P(n) : 0 ≤ uₙ ≤ 2.': ['rien', () => lesTermes(0, (u) => Math.sqrt(u + 2), 60).every((u) => u >= 0 && u <= 2)],
  'P(n) : uₙ = 2ⁿ⁺¹ − 1.': ['rien', () => lesTermes(1, (u) => 2 * u + 1, 20).every((u, n) => u === 2 ** (n + 1) - 1)],
  'P(n) : n² + n est pair.': ['rien',
    () => tous(0, 50, (n) => (n * n + n) % 2 === 0 && (n + 1) ** 2 + (n + 1) === n * n + n + 2 * (n + 1))],
};

describe('la récurrence : chaque réponse est vérifiée ici', () => {
  it('les preuves de la banque : ce qui cloche est confirmé par le calcul', () => {
    const ecarts = [];
    recurrence.PREUVES.forEach(([texte, cloche]) => {
      const cle = texte.split('\n').find((l) => l.startsWith('P(n) :'));
      const [attendu, verifie] = PREUVES[cle] ?? ['inconnue', () => false];
      if (attendu !== cloche || !verifie()) ecarts.push({ cle, cloche, attendu });
    });
    expect(ecarts).toEqual([]);
  });

  it('la preuve qui cloche : la bonne réponse n’est jamais un piège', () => {
    parConsigne(recurrence, 'preuve').forEach((m) => {
      expect(Object.keys(m.pieges)).not.toContain(m.bonne);
      expect(Object.keys(m.pieges).sort()).toEqual(cles(m).filter((c) => c !== m.bonne).sort());
    });
  });

  it.each(['etapes', 'propriete'])('%s : la bonne réponse n’est jamais un piège', (consigne) => {
    const manches = parConsigne(recurrence, consigne);
    expect(manches.length).toBeGreaterThan(0);
    manches.forEach((m) => {
      expect(Object.keys(m.pieges)).not.toContain(m.bonne);
      expect(Object.keys(m.pieges).sort()).toEqual(cles(m).filter((c) => c !== m.bonne).sort());
    });
  });

  it('calculer un terme : refait de proche en proche', () => {
    const ecarts = [];
    parConsigne(recurrence, 'terme').forEach((m) => {
      const [u0, suivant] = suite(m.question);
      const N = indice(m.question.match(/Combien vaut u([₀-₉]+) \?/)[1]);
      const u = lesTermes(u0, suivant, N);
      seuleJuste(m, (c) => nombre(c) === u[N], ecarts);
    });
    expect(ecarts).toEqual([]);
  });

  it('conjecturer : la bonne formule colle aux sept premiers termes, aucune autre', () => {
    const ecarts = [];
    parConsigne(recurrence, 'conjecture').forEach((m) => {
      const [u0, suivant] = suite(m.question);
      const u = lesTermes(u0, suivant, 6);
      seuleJuste(m, (c) => u.every((x, n) => formule(c)(n) === x), ecarts);
    });
    expect(ecarts).toEqual([]);
  });
});
