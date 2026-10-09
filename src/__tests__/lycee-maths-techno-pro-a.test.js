/**
 * LES JEUX DE MATHS DU LYCÉE, VOIES TECHNOLOGIQUE ET PROFESSIONNELLE, LOT A —
 * quatre modules de Nora : les évolutions (1re et Tle techno), fonctions et
 * paraboles (1re et Tle techno), intérêts et pourcentages (2de, 1re et Tle pro),
 * proportions et grandeurs (2de, 1re et Tle pro).
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun piège ne doit être
 * juste lui aussi. Les écarts sont collectés, puis on vérifie qu'il n'y en a
 * aucun (pas d'`expect` dans un `if`).
 */

import * as evolutions from '../lib/jeux/lycee/les-evolutions';
import * as paraboles from '../lib/jeux/lycee/fonctions-et-paraboles';
import * as interets from '../lib/jeux/lycee/interets-et-pourcentages';
import * as proportions from '../lib/jeux/lycee/proportions-et-grandeurs';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['les-evolutions', evolutions],
  ['fonctions-et-paraboles', paraboles],
  ['interets-et-pourcentages', interets],
  ['proportions-et-grandeurs', proportions],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur colonne NIVEAU, recopiés tels quels. */
const CLASSE_DU_CODE = {
  MATH_1TEC_AUTO_EVOLUTION: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_TAUX_APPLIQUER: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_TAUX_SUCCESSIFS: 'PREMIERE_TECHNO',
  MATH_1TEC_AUTO_TAUX_RECIPROQUE: 'PREMIERE_TECHNO',
  MATH_1TEC_PARABOLE_ASSOCIER: 'PREMIERE_TECHNO',
  MATH_1TEC_PARABOLE_ELEMENTS: 'PREMIERE_TECHNO',
  MATH_1TEC_POLY_RACINES: 'PREMIERE_TECHNO',
  MATH_1TEC_DERIV_CALCULER: 'PREMIERE_TECHNO',
  MATH_1TEC_DERIV_VARIATIONS: 'PREMIERE_TECHNO',
  MATH_1TEC_DERIV_TANGENTE: 'PREMIERE_TECHNO',
  MATH_TTEC_EXPO_TAUX_MOYEN: 'TERMINALE_TECHNO',
  MATH_TTEC_AUTO_EVOLUTION: 'TERMINALE_TECHNO',
  // Le seul code de terminale techno sur l'étude d'une fonction et de sa dérivée.
  MATH_TTEC_INVERSE: 'TERMINALE_TECHNO',
  MATH_2PRO_PROP_COMMERCE: 'SECONDE_PRO',
  MATH_2PRO_PROP_FACTURE: 'SECONDE_PRO',
  MATH_2PRO_PROP_INTERET: 'SECONDE_PRO',
  MATH_2PRO_PROP_PLACEMENT: 'SECONDE_PRO',
  MATH_2PRO_GEO_GRANDEURS: 'SECONDE_PRO',
  MATH_1PRO_SUITE_MODELISER: 'PREMIERE_PRO',
  MATH_1PRO_SUITE_RECONNAITRE: 'PREMIERE_PRO',
  MATH_1PRO_SUITE_TERME: 'PREMIERE_PRO',
  // Proportions et grandeurs en 1re pro : aucun code de proportionnalité ni de
  // grandeurs composées dans le fichier ; le plus proche de la classe, les grandeurs d'un solide.
  MATH_1PRO_GEO_ESPACE: 'PREMIERE_PRO',
  // Proportions et grandeurs en Tle pro : les grandeurs à échelle logarithmique (décibels, pH).
  MATH_TPRO_LOG_DECIMAL: 'TERMINALE_PRO',
  MATH_TPRO_LOG_DUREE: 'TERMINALE_PRO',
  MATH_TPRO_EXPO_TAUX: 'TERMINALE_PRO',
  MATH_TPRO_SUITE_SOMME: 'TERMINALE_PRO',
  MATH_TPRO_EXPO_FONCTION: 'TERMINALE_PRO',
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

  it('la classe a son titre, son accroche et ses compétences officielles, de SA classe', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    fiche.competences.forEach((c) => expect({ c, classe: CLASSE_DU_CODE[c] }).toEqual({ c, classe }));
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
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|faux/i);
      // Typographie française : une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });

  it('chaque piège et chaque règle pointe vers une phrase', () => {
    const manquantes = [];
    module.CLASSES.forEach((classe) => graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      Object.values(m.pieges ?? {}).forEach((p) => { if (!module.PHRASES[p]) manquantes.push(p); });
    })));
    expect(manquantes).toEqual([]);
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));

/** Tous les nombres d'un texte : « 2,5 », « 25 000 » (espace fine), « −4 ». */
const lire = (s) => (String(s).match(/[−-]?\d[\d ]*(?:,\d+)?/g) || [])
  .map((x) => Number(x.replace(/ /g, '').replace('−', '-').replace(',', '.')));
const valeur = (s) => lire(s)[0];
const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/** La bonne réponse vaut l'attendu, et aucun autre choix ne le vaut. */
function seuleJuste(ecarts, m, attendu, lecture = valeur) {
  if (!proche(lecture(m.bonne), attendu)) ecarts.push(`${m.question} → ${m.bonne}, attendu ${attendu}`);
  autres(m).forEach((c) => {
    if (proche(lecture(c), attendu)) ecarts.push(`${m.question} → le piège ${c} est juste aussi`);
  });
}

/** Un arrondi à `dec` décimales : la bonne réponse l'est, aucun autre choix n'est assez près. */
function arrondiJuste(ecarts, m, exact, dec) {
  const demi = 10 ** -dec / 2;
  if (Math.abs(valeur(m.bonne) - exact) > demi + 1e-9) ecarts.push(`${m.question} → ${m.bonne}, exact ${exact}`);
  autres(m).forEach((c) => {
    if (Math.abs(valeur(c) - exact) < demi - 1e-9) ecarts.push(`${m.question} → le piège ${c} est juste aussi`);
  });
}

/** La bonne réponse satisfait la condition, et elle seule. */
function seuleQui(ecarts, m, condition) {
  if (!condition(String(m.bonne))) ecarts.push(`${m.question} → ${m.bonne} ne convient pas`);
  autres(m).forEach((c) => { if (condition(c)) ecarts.push(`${m.question} → le piège ${c} convient aussi`); });
}

/* ---------------------------------------------------------- les évolutions */

/** « une hausse de 20 % » → 20 ; « une baisse de 20 % » → −20, dans l'ordre du texte. */
const evolutionsLues = (q) => [...q.matchAll(/(hausse|baisse) de ([\d,]+)/g)]
  .map(([, sens, p]) => (sens === 'hausse' ? 1 : -1) * Number(p.replace(',', '.')));

describe('les évolutions : chaque réponse recalculée', () => {
  it('en 1re techno : taux, coefficients, valeurs, successives, réciproques, indices', () => {
    const ecarts = [];
    toutes(evolutions, 'PREMIERE_TECHNO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (m.consigne === 'taux') {
        const [v0, v1] = n;
        seuleJuste(ecarts, m, ((v1 - v0) / v0) * 100);
      } else if (m.consigne === 'coefficient' && /^Multiplier par/.test(q)) {
        seuleJuste(ecarts, m, (n[0] - 1) * 100);
      } else if (m.consigne === 'coefficient') {
        seuleJuste(ecarts, m, 1 + evolutionsLues(q)[0] / 100);
      } else if (m.consigne === 'appliquer' && /Prix de départ/.test(q)) {
        const p = evolutionsLues(q)[0];
        const [, v1] = n;
        seuleJuste(ecarts, m, v1 / (1 + p / 100));
      } else if (m.consigne === 'appliquer') {
        const [v0, p] = n;
        seuleJuste(ecarts, m, v0 * (1 + ((/augmente/.test(q) ? 1 : -1) * p) / 100));
      } else if (m.consigne === 'successives') {
        const [a, b] = evolutionsLues(q);
        seuleJuste(ecarts, m, ((1 + a / 100) * (1 + b / 100) - 1) * 100);
      } else if (m.consigne === 'reciproque') {
        const p = evolutionsLues(q)[0];
        arrondiJuste(ecarts, m, (1 / (1 + p / 100) - 1) * 100, 2);
      } else if (/Année de base/.test(q)) {
        const [, v0, v1] = n;
        seuleJuste(ecarts, m, (100 * v1) / v0);
      } else {
        const [, i1, i2] = n;
        seuleJuste(ecarts, m, (i2 / i1 - 1) * 100);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en Tle techno : taux moyens, évolutions globales, additif et multiplicatif', () => {
    const ecarts = [];
    const precision = (q) => (/0,01/.test(q) ? 2 : 1);
    toutes(evolutions, 'TERMINALE_TECHNO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (m.consigne === 'taux-moyen' && /en \d+ ans/.test(q)) {
        const [g, annees] = n;
        const c = 1 + ((/a baissé/.test(q) ? -1 : 1) * g) / 100;
        arrondiJuste(ecarts, m, (c ** (1 / annees) - 1) * 100, precision(q));
      } else if (m.consigne === 'taux-moyen') {
        const taux = n.slice(0, -1);
        const c = taux.reduce((acc, p) => acc * (1 + p / 100), 1);
        arrondiJuste(ecarts, m, (c ** (1 / taux.length) - 1) * 100, 2);
      } else if (m.consigne === 'taux-global') {
        const [annees, p] = n;
        const c = (1 + ((/baisse/.test(q) ? -1 : 1) * p) / 100) ** annees;
        arrondiJuste(ecarts, m, (c - 1) * 100, precision(q));
      } else if (/multipliée par [\d,]+\./.test(q)) {
        seuleJuste(ecarts, m, (n[0] - 1) * 100);
      } else if (/divisée par/.test(q)) {
        seuleJuste(ecarts, m, (1 / n[0] - 1) * 100);
      } else {
        seuleJuste(ecarts, m, 1 + n[0] / 100);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('la précision dite est celle de la réponse, et le taux moyen n’est jamais le taux divisé par n', () => {
    const ecarts = [];
    toutes(evolutions, 'TERMINALE_TECHNO')
      .filter((m) => m.consigne !== 'additif-multiplicatif')
      .forEach((m) => {
        const dec = /0,01/.test(m.question) ? 2 : 1;
        if (!new RegExp(`,\\d{${dec}} %$`).test(m.bonne)) ecarts.push(`${m.question} → ${m.bonne}`);
      });
    expect(ecarts).toEqual([]);
  });
});

/* ------------------------------------------------- fonctions et paraboles */

/** « 2x³ − 5x² + 3x − 7 » → [−7, 3, −5, 2] (indice = degré). Les constantes répétées s'ajoutent. */
function polyLu(s) {
  const coefs = [0, 0, 0, 0];
  const texte = s.replace(/\s/g, '').replace(/−/g, '-');
  (texte.match(/[+-]?[^+-]+/g) || []).forEach((terme) => {
    const r = terme.match(/^([+-]?)(\d*)(x([²³])?)?$/);
    if (!r || (!r[3] && r[2] === '')) throw new Error(`terme illisible : ${terme} dans ${s}`);
    let degre = 0;
    if (r[3]) degre = { '²': 2, '³': 3 }[r[4]] ?? 1;
    coefs[degre] += (r[1] === '-' ? -1 : 1) * (r[2] === '' ? 1 : Number(r[2]));
  });
  return coefs;
}

/** « −2(x + 1)(x − 3) » → { a: −2, racines: [−1, 3] }. */
function factoLu(s) {
  const r = s.match(/^(−?\d*)(\(x [+−] \d+\)|x)(\(x [+−] \d+\)|x)$/);
  if (!r) throw new Error(`forme factorisée illisible : ${s}`);
  let a = Number(r[1].replace('−', '-'));
  if (r[1] === '') a = 1;
  if (r[1] === '−') a = -1;
  const racine = (f) => {
    if (f === 'x') return 0;
    const [, signe, v] = f.match(/\(x ([+−]) (\d+)\)/);
    return signe === '−' ? Number(v) : -Number(v);
  };
  return { a, racines: [racine(r[2]), racine(r[3])].sort((x, y) => x - y) };
}

/** a(x − r)(x − s) développé, en coefficients [c, b, a, 0]. */
const developpe = ({ a, racines: [r, s] }) => [a * r * s, -a * (r + s), a, 0];
const image = (coefs, x) => coefs.reduce((acc, c, k) => acc + c * x ** k, 0);
const deriveDe = (coefs) => [coefs[1], 2 * coefs[2], 3 * coefs[3], 0];
const memes = (p, q) => p.every((c, k) => c === q[k]);
const ent = (x) => (x < 0 ? `−${-x}` : `${x}`);

/** « f(x) = … . » → les coefficients de f, qu'il soit développé ou factorisé. */
function fonctionLue(q) {
  const expr = q.match(/^f\(x\) = (.+?)\. /)[1];
  return /\(/.test(expr) ? developpe(factoLu(expr)) : polyLu(expr);
}

describe('fonctions et paraboles : chaque réponse recalculée', () => {
  it('associer, lire, l’axe, la dérivée, les variations, la tangente', () => {
    const ecarts = [];
    toutes(paraboles, 'PREMIERE_TECHNO').forEach((m) => {
      const q = m.question;
      const haut = /vers le haut/.test(q);
      if (m.consigne === 'associer' && /de sommet \(0 ;/.test(q)) {
        const c = Number(q.match(/de sommet \(0 ; (−?\d+)\)/)[1].replace('−', '-'));
        seuleQui(ecarts, m, (x) => {
          const p = polyLu(x);
          return p[1] === 0 && p[3] === 0 && p[0] === c && (p[2] > 0) === haut;
        });
      } else if (m.consigne === 'associer' && /coupe l’axe/.test(q)) {
        const [r, s] = lire(q.match(/abscisses en (.+)\. Son/)[1]).sort((x, y) => x - y);
        seuleQui(ecarts, m, (x) => {
          const f = factoLu(x);
          return f.racines[0] === r && f.racines[1] === s && (f.a > 0) === haut;
        });
      } else if (m.consigne === 'associer') {
        const [x0, y0] = lire(q.match(/point \((.+)\)/)[1]);
        seuleQui(ecarts, m, (x) => {
          const p = polyLu(x);
          return p[0] === 0 && p[1] === 0 && p[3] === 0 && p[2] * x0 * x0 === y0;
        });
      } else if (m.consigne === 'lire' && /Racines/.test(q)) {
        const f = fonctionLue(q);
        const zeros = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].filter((x) => image(f, x) === 0);
        seuleQui(ecarts, m, (x) => memes(lire(x).sort((u, v) => u - v), zeros) && lire(x).length === zeros.length);
      } else if (m.consigne === 'lire' && /Sommet/.test(q)) {
        const f = fonctionLue(q);
        const xs = -f[1] / (2 * f[2]);
        seuleQui(ecarts, m, (x) => memes(lire(x), [xs, image(f, xs)]));
      } else if (m.consigne === 'lire') {
        const f = fonctionLue(q);
        const zone = q.match(/∈ (.+) \?$/)[1];
        const [b1, b2] = lire(zone);
        let x0 = (b1 + b2) / 2;
        if (/\+∞/.test(zone)) x0 = b1 + 1;
        if (/−∞/.test(zone)) x0 = b1 - 1;
        seuleQui(ecarts, m, (x) => x === (image(f, x0) > 0 ? 'positif' : 'negatif'));
      } else if (m.consigne === 'axe') {
        const f = fonctionLue(q);
        seuleQui(ecarts, m, (x) => x === `x = ${ent(-f[1] / (2 * f[2]))}`);
      } else if (m.consigne === 'derivee') {
        const d = deriveDe(fonctionLue(q));
        seuleQui(ecarts, m, (x) => memes(polyLu(x), d));
      } else if (m.consigne === 'variations') {
        const f = fonctionLue(q);
        const decroissante = /décroissante/.test(q);
        let attendu;
        if (f[3] === 0) {
          // f′(x) = 2a x + b : négative à gauche de −b/2a si a > 0.
          const s = -f[1] / (2 * f[2]);
          attendu = (f[2] > 0) === decroissante ? `]−∞ ; ${ent(s)}]` : `[${ent(s)} ; +∞[`;
        } else {
          // f′(x) = A x² + B x + C, du signe de A hors des racines.
          const [C, B, A] = deriveDe(f);
          const delta = B * B - 4 * A * C;
          const [p, r] = [(-B - Math.sqrt(delta)) / (2 * A), (-B + Math.sqrt(delta)) / (2 * A)].sort((u, v) => u - v);
          // Entre les racines, f′ a le signe de −A : la seule variation sur un intervalle borné.
          if ((A > 0) !== decroissante) ecarts.push(`${q} : sens demandé sur deux intervalles`);
          attendu = `[${ent(p)} ; ${ent(r)}]`;
        }
        seuleQui(ecarts, m, (x) => x === attendu);
      } else {
        const f = fonctionLue(q);
        const x0 = lire(q.match(/abscisse (.+) \?$/)[1])[0];
        const pente = image(deriveDe(f), x0);
        const ordonnee = image(f, x0) - pente * x0;
        seuleQui(ecarts, m, (x) => {
          const droite = polyLu(x.replace(/^y = /, ''));
          return droite[1] === pente && droite[0] === ordonnee && droite[2] === 0 && droite[3] === 0;
        });
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('le lecteur de polynômes lit ce qu’il faut', () => {
    expect(polyLu('2x³ − 5x² + 3x − 7')).toEqual([-7, 3, -5, 2]);
    expect(polyLu('−x² + 4')).toEqual([4, 0, -1, 0]);
    expect(polyLu('6x² − 10x + 3 − 7')).toEqual([-4, -10, 6, 0]);
    expect(factoLu('−2(x + 1)(x − 3)')).toEqual({ a: -2, racines: [-1, 3] });
    expect(developpe(factoLu('(x − 1)(x − 5)'))).toEqual([5, -6, 1, 0]);
  });
});

/* ----------------------------------------------- intérêts et pourcentages */

describe('intérêts et pourcentages : chaque réponse recalculée', () => {
  it('en 2de pro : remises, TVA, salaires, intérêts simples, placements', () => {
    const ecarts = [];
    toutes(interets, 'SECONDE_PRO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (m.consigne === 'remise') {
        const [prix, r] = n;
        seuleJuste(ecarts, m, prix * (1 - r / 100));
      } else if (m.consigne === 'tva' && /^Prix TTC/.test(q)) {
        const [ttc, t] = n;
        seuleJuste(ecarts, m, ttc / (1 + t / 100));
      } else if (m.consigne === 'tva') {
        const [ht, t] = n;
        seuleJuste(ecarts, m, ht * (1 + t / 100));
      } else if (m.consigne === 'augmentation') {
        const [s, a] = n;
        seuleJuste(ecarts, m, s * (1 + a / 100));
      } else if (m.consigne === 'taux-de-remise') {
        const [prix, paye] = n;
        seuleJuste(ecarts, m, ((prix - paye) / prix) * 100);
      } else if (m.consigne === 'interets-simples' || m.consigne === 'valeur-acquise') {
        const [c, t, d] = n;
        const i = (c * t * d) / (100 * (/mois/.test(q) ? 12 : 1));
        seuleJuste(ecarts, m, m.consigne === 'interets-simples' ? i : c + i);
      } else if (/Taux annuel/.test(q)) {
        const [c, d, i] = n;
        seuleJuste(ecarts, m, (i * 100) / (c * d));
      } else {
        const [t, i, d] = n;
        seuleJuste(ecarts, m, (i * 100) / (t * d));
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en 1re pro : capital acquis, modèle de suite, raison', () => {
    const ecarts = [];
    toutes(interets, 'PREMIERE_PRO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      const composes = /composés/.test(q);
      if (m.consigne === 'capital-acquis') {
        const [c, t, d] = n;
        if (composes) arrondiJuste(ecarts, m, c * (1 + t / 100) ** d, 2);
        else seuleJuste(ecarts, m, c * (1 + (t * d) / 100));
      } else if (m.consigne === 'reconnaitre-suite') {
        const [u0, u1, u2] = n.map((x) => Math.round(x * 100));
        let attendu = 'ni-l-une-ni-l-autre';
        if (u1 - u0 === u2 - u1) attendu = 'arithmetique';
        else if (u1 * u1 === u0 * u2) attendu = 'geometrique';
        seuleQui(ecarts, m, (x) => x === attendu);
      } else {
        const [c, t] = n;
        const attendu = composes ? ['q', 1 + t / 100] : ['r', (c * t) / 100];
        seuleQui(ecarts, m, (x) => x.startsWith(`${attendu[0]} =`) && proche(valeur(x), attendu[1]));
      }
    });
    expect(ecarts).toEqual([]);
  });
});

/* ----------------------------------------------- proportions et grandeurs */

/** « 2 h 30 min » → 150 ; « 45 min » → 45 ; « 0,125 min » → 0,125. */
const minutesLues = (s) => {
  const h = String(s).match(/(\d+) h/);
  const mn = String(s).match(/([\d,]+) min/);
  return (h ? 60 * Number(h[1]) : 0) + (mn ? Number(mn[1].replace(',', '.')) : 0);
};

describe('proportions et grandeurs : chaque réponse recalculée', () => {
  it('en 2de pro : proportionnalité, échelles, conversions, durées, vitesses, débits', () => {
    const ecarts = [];
    toutes(proportions, 'SECONDE_PRO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (m.consigne === 'quatrieme') {
        const [q1, v1, q2] = n;
        seuleJuste(ecarts, m, (v1 * q2) / q1);
      } else if (m.consigne === 'echelle' && /Longueur réelle/.test(q)) {
        const [, e, plan] = n;
        seuleJuste(ecarts, m, (plan * e) / 100);
      } else if (m.consigne === 'echelle') {
        const [, e, reel] = n;
        seuleJuste(ecarts, m, (reel * 100) / e);
      } else if (m.consigne === 'conversion' && /litres/.test(q)) {
        seuleJuste(ecarts, m, n[0] * 1000);
      } else if (m.consigne === 'conversion' && /mètres cubes/.test(q)) {
        seuleJuste(ecarts, m, n[0] / 1000);
      } else if (m.consigne === 'conversion' && /centimètres carrés/.test(q)) {
        seuleJuste(ecarts, m, n[0] * 10000);
      } else if (m.consigne === 'conversion') {
        seuleJuste(ecarts, m, n[0] / 1000);
      } else if (m.consigne === 'duree' && /heures et minutes/.test(q)) {
        seuleJuste(ecarts, m, n[0] * 60, minutesLues);
      } else if (m.consigne === 'duree') {
        const [h, mn] = n;
        seuleJuste(ecarts, m, h + mn / 60);
      } else if (/Vitesse moyenne/.test(q)) {
        const [d, mn] = n;
        seuleJuste(ecarts, m, d / (mn / 60));
      } else if (/Distance/.test(q)) {
        const [v, h, mn] = n;
        seuleJuste(ecarts, m, v * (h + mn / 60));
      } else if (m.consigne === 'vitesse') {
        const [d, v] = n;
        seuleJuste(ecarts, m, (d / v) * 60, minutesLues);
      } else if (/remplir/.test(q)) {
        const [debit, volume] = n;
        seuleJuste(ecarts, m, (volume * 1000) / debit, minutesLues);
      } else {
        const [v, mn] = n;
        seuleJuste(ecarts, m, (60 * v) / mn);
      }
    });
    expect(ecarts).toEqual([]);
  });
});

/* ------------------------------------------------------------------------ */
/* Les classes ajoutées : 1re et Tle pro, Tle techno. Même exigence.        */
/* ------------------------------------------------------------------------ */

/** « 6,27 % » : exactement deux décimales. */
const deuxDecimales = (s) => /,\d\d\s%$/.test(String(s));

describe('proportions et grandeurs, les classes suivantes : chaque réponse recalculée', () => {
  it('en 1re pro : cuves, débits, vitesses, plans, contenances, main-d’œuvre', () => {
    const ecarts = [];
    toutes(proportions, 'PREMIERE_PRO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (/Durée du remplissage/.test(q)) {
        const [lo, la, h, debit] = n;
        seuleJuste(ecarts, m, (lo * la * h * 1000) / debit, minutesLues);
      } else if (/en m³\/h/.test(q)) {
        seuleJuste(ecarts, m, (n[0] * 60) / 1000);
      } else if (/en km\/h/.test(q)) {
        const [d, s] = n;
        seuleJuste(ecarts, m, (d / s) * 3.6);
      } else if (/en m\/s/.test(q)) {
        seuleJuste(ecarts, m, (n[0] * 1000) / 3600);
      } else if (/Vitesse moyenne/.test(q)) {
        const [d1, v1, d2, v2] = n;
        seuleJuste(ecarts, m, (d1 + d2) / (d1 / v1 + d2 / v2));
      } else if (/Aire réelle/.test(q)) {
        const [, e, a, b] = n;
        seuleJuste(ecarts, m, ((a * e) / 100) * ((b * e) / 100));
      } else if (/Contenance/.test(q)) {
        const [lo, la, h] = n;
        // En décimètres : un décimètre cube, un litre.
        seuleJuste(ecarts, m, lo * 10 * (la / 10) * (h / 10));
      } else if (/main-d’œuvre/.test(q)) {
        const [h, mn, taux] = n;
        seuleJuste(ecarts, m, (h + mn / 60) * taux);
      } else {
        ecarts.push(`question inconnue : ${q}`);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en 1re pro : la vitesse moyenne n’est jamais la moyenne des vitesses', () => {
    const ecarts = [];
    toutes(proportions, 'PREMIERE_PRO').filter((m) => /Vitesse moyenne/.test(m.question)).forEach((m) => {
      const [, v1, , v2] = lire(m.question);
      if (proche(valeur(m.bonne), (v1 + v2) / 2)) ecarts.push(m.question);
    });
    expect(ecarts).toEqual([]);
  });

  it('en Tle pro : décibels et pH', () => {
    const ecarts = [];
    const EXPOSANT = {
      '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    };
    toutes(proportions, 'TERMINALE_PRO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (/machines identiques/.test(q)) {
        const [niveau, combien] = n;
        // Les intensités s'ajoutent : n fois l'intensité d'une machine, en décibels.
        arrondiJuste(ecarts, m, 10 * Math.log10(combien * 10 ** (niveau / 10)), 0);
      } else if (/passe de/.test(q)) {
        const [d1, d2] = n;
        seuleJuste(ecarts, m, 10 ** ((d2 - d1) / 10));
      } else if (/intensité sonore d’une machine est multipliée/.test(q)) {
        arrondiJuste(ecarts, m, 10 * Math.log10(n[0]), 0);
      } else if (/Que devient son pH/.test(q)) {
        const puissance = Math.round(Math.log10(n[0]));
        if (10 ** puissance !== n[0]) ecarts.push(`${q} : pas une puissance de dix`);
        const attendu = `Il ${/divisée/.test(q) ? 'augmente' : 'diminue'} de ${puissance}`;
        seuleQui(ecarts, m, (x) => x === attendu);
      } else if (/Son pH/.test(q)) {
        const r = q.match(/de (?:(\d+) × )?10⁻([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/);
        const a = r[1] ? Number(r[1]) : 1;
        const k = Number(r[2].split('').map((c) => EXPOSANT[c]).join(''));
        arrondiJuste(ecarts, m, -Math.log10(a * 10 ** -k), 1);
        if (!/^\d+,\d$/.test(m.bonne)) ecarts.push(`${q} → ${m.bonne} : une décimale attendue`);
      } else {
        ecarts.push(`question inconnue : ${q}`);
      }
    });
    expect(ecarts).toEqual([]);
  });
});

describe('intérêts et pourcentages en Tle pro : chaque réponse recalculée', () => {
  it('durées de placement, taux moyens, sommes, capital exponentiel', () => {
    const ecarts = [];
    toutes(interets, 'TERMINALE_PRO').forEach((m) => {
      const q = m.question;
      const n = lire(q);
      if (m.consigne === 'duree-placement') {
        const [c, taux] = n;
        let cible = n[2];
        if (/doublé/.test(q)) cible = 2 * c;
        if (/triplé/.test(q)) cible = 3 * c;
        // On capitalise année après année jusqu'à l'objectif.
        let annees = 0;
        let v = c;
        while (v < cible) {
          v *= 1 + taux / 100;
          annees += 1;
        }
        if (Math.abs(v - cible) < 1e-6) ecarts.push(`${q} : objectif atteint pile, ambigu`);
        seuleJuste(ecarts, m, annees);
      } else if (m.consigne === 'taux-moyen') {
        const [g, annees] = n;
        const coefficient = 1 + ((/baissé/.test(q) ? -1 : 1) * g) / 100;
        arrondiJuste(ecarts, m, (coefficient ** (1 / annees) - 1) * 100, 2);
        if (!m.choix.every((c) => deuxDecimales(c.libelle))) ecarts.push(`${q} : précisions différentes`);
      } else if (m.consigne === 'somme-versements') {
        const [u1, r, mois] = n;
        let total = 0;
        for (let k = 0; k < mois; k += 1) total += u1 + k * r;
        seuleJuste(ecarts, m, total);
      } else if (m.consigne === 'capital-acquis') {
        const [c, q0, x] = n;
        arrondiJuste(ecarts, m, c * q0 ** x, 2);
      } else {
        ecarts.push(`consigne inconnue : ${m.consigne}`);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('les pièges des intérêts composés et du taux moyen sont nommés', () => {
    const nommes = new Set(toutes(interets, 'TERMINALE_PRO').flatMap((m) => Object.values(m.pieges)));
    ['simples-pas-composes', 'premier-entier-qui-depasse', 'coefficient-global', 'somme-des-termes', 'rang-du-terme']
      .forEach((p) => expect(nommes).toContain(p));
  });
});

/** « x² + 4x − 8/x » → le polynôme [c, b, a, 0], et les coefficients de 1/x et de 1/x². */
function hyperboleLue(s) {
  const p = [0, 0, 0, 0];
  let inv = 0;
  let inv2 = 0;
  const texte = s.replace(/\s/g, '').replace(/−/g, '-');
  (texte.match(/[+-]?[^+-]+/g) || []).forEach((terme) => {
    const r = terme.match(/^([+-]?)(\d+)\/x(²?)$/);
    if (!r) {
      polyLu(terme).forEach((c, k) => { p[k] += c; });
      return;
    }
    const v = (r[1] === '-' ? -1 : 1) * Number(r[2]);
    if (r[3]) inv2 += v;
    else inv += v;
  });
  return { p, inv, inv2 };
}

describe('fonctions et paraboles en Tle techno : chaque réponse recalculée', () => {
  it('le lecteur d’hyperboles lit ce qu’il faut', () => {
    expect(hyperboleLue('x² + 4x − 8/x')).toEqual({ p: [0, 4, 1, 0], inv: -8, inv2: 0 });
    expect(hyperboleLue('−27/x + 3')).toEqual({ p: [3, 0, 0, 0], inv: -27, inv2: 0 });
    expect(hyperboleLue('2x + 5 − 4/x²')).toEqual({ p: [5, 2, 0, 0], inv: 0, inv2: -4 });
  });

  it('dérivées, variations, coût moyen minimal, tangentes', () => {
    const ecarts = [];
    toutes(paraboles, 'TERMINALE_TECHNO').forEach((m) => {
      const q = m.question;
      if (!/x > 0|sur \]0 ; \+∞\[/.test(q)) ecarts.push(`${q} : domaine absent`);
      if (m.consigne === 'minimum') {
        const f = hyperboleLue(q.match(/C\(x\) = (.+)\. Coût/)[1]);
        const cout = (x) => image(f.p, x) + f.inv / x;
        // Le minimum sur ]0 ; +∞[ : là où a − b/x² s'annule, x = √(b/a).
        const k = Math.sqrt(f.inv / f.p[1]);
        if (!Number.isInteger(k)) ecarts.push(`${q} : minimum hors des entiers`);
        [k / 2, k - 0.1, k + 0.1, 2 * k].forEach((x) => {
          if (cout(x) < cout(k)) ecarts.push(`${q} : ${k} n’est pas le minimum`);
        });
        seuleJuste(ecarts, m, cout(k));
        return;
      }
      const f = hyperboleLue(q.match(/^f\(x\) = (.+) sur/)[1]);
      if (m.consigne === 'derivee') {
        const d = deriveDe(f.p);
        seuleQui(ecarts, m, (x) => {
          const lu = hyperboleLue(x);
          return memes(lu.p, d) && lu.inv === 0 && lu.inv2 === -f.inv;
        });
      } else if (m.consigne === 'variations') {
        const fp = (x) => image(deriveDe(f.p), x) - f.inv / (x * x);
        const k = Math.sqrt(f.inv / f.p[1]);
        if (!Number.isInteger(k) || fp(k) !== 0) ecarts.push(`${q} : f′ ne s’annule pas en un entier`);
        if (Math.sign(fp(k / 2)) === Math.sign(fp(2 * k))) ecarts.push(`${q} : f′ ne change pas de signe`);
        const decroissante = /décroissante/.test(q);
        const attendu = (fp(k / 2) < 0) === decroissante ? `]0 ; ${k}]` : `[${k} ; +∞[`;
        seuleQui(ecarts, m, (x) => x === attendu);
      } else if (m.consigne === 'tangente') {
        const x0 = Number(q.match(/abscisse (\d+) \?$/)[1]);
        const y0 = image(f.p, x0) + f.inv / x0;
        const pente = image(deriveDe(f.p), x0) - f.inv / (x0 * x0);
        seuleQui(ecarts, m, (x) => {
          const droite = polyLu(x.replace(/^y = /, ''));
          return droite[1] === pente && droite[0] === y0 - pente * x0 && droite[2] === 0 && droite[3] === 0;
        });
      } else {
        ecarts.push(`consigne inconnue : ${m.consigne}`);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('le signe moins de la dérivée de 1/x est un piège nommé', () => {
    const nommes = new Set(toutes(paraboles, 'TERMINALE_TECHNO').flatMap((m) => Object.values(m.pieges)));
    ['signe-derivee-inverse', 'x-carre-racine', 'valeur-pas-position', 'constante-derivee-nulle']
      .forEach((p) => expect(nommes).toContain(p));
  });
});
