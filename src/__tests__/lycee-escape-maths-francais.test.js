/**
 * LES ESCAPE GAMES DE MATHS ET DE FRANÇAIS DU LYCÉE — Nora et Adrien. Même
 * épreuve que les escape games du collège : soixante parties par classe, une
 * bonne réponse parmi des choix distincts, une méthode pour chaque erreur ;
 * puis ce qui fait un escape game (six cadenas dans l'ordre du récit, le code
 * qui se construit) ; enfin l'exactitude : chaque réponse de maths RECALCULÉE
 * depuis la question affichée (par une autre voie que le module quand c'est
 * possible : comptage, simulation, méthode de Simpson), et chaque phrase de
 * français relue (la bonne réponse n'est jamais aussi un piège).
 */

import * as escapeMaths from '../lib/jeux/lycee/escape-maths-lycee';
import * as escapeFrancais from '../lib/jeux/lycee/escape-francais-lycee';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes utilisés et leur classe, recopiés de competences-lycee.txt (hors du dépôt) : la colonne NIVEAU fait foi. */
const COMPETENCES = {
  MATH_2DE_CALC_LITTERAL: 'SECONDE',
  MATH_2DE_SIGNE: 'SECONDE',
  MATH_2DE_DROITES: 'SECONDE',
  MATH_2DE_REPERAGE: 'SECONDE',
  MATH_2DE_PROBA_EVENEMENTS: 'SECONDE',
  MATH_2DE_ALGO_PYTHON: 'SECONDE',
  MATH_1RE_AUTO_TAUX_SUCCESSIFS: 'PREMIERE',
  MATH_1RE_AUTO_TAUX_RECIPROQUE: 'PREMIERE',
  MATH_1RE_TRINOME_RACINES: 'PREMIERE',
  MATH_1RE_DERIV_FONCTION: 'PREMIERE',
  MATH_1RE_SUITES_ARITH: 'PREMIERE',
  MATH_1RE_SUITES_GEO: 'PREMIERE',
  MATH_1RE_PROBA_COND: 'PREMIERE',
  MATH_1RE_AUTO_PROBA_NOTATIONS: 'PREMIERE',
  MATH_1RE_EXP: 'PREMIERE',
  MATH_TLE_FONC_LIMITE: 'TERMINALE',
  MATH_TLE_LOG: 'TERMINALE',
  MATH_TLE_PRIMITIVES: 'TERMINALE',
  MATH_TLE_INTEGRALE: 'TERMINALE',
  MATH_TLE_BINOMIALE: 'TERMINALE',
  MATH_TLE_DENOMBR_KUPLETS: 'TERMINALE',
  MATH_TLE_DENOMBR_PERMUTATIONS: 'TERMINALE',
  MATH_TLE_DENOMBR_COMBINAISONS: 'TERMINALE',
  MATH_TLE_ORTHOGONALITE: 'TERMINALE',
  MATH_TLE_PLAN_CARTESIEN: 'TERMINALE',
  FR_2DE_LECT_PROCEDES: 'SECONDE',
  FR_2DE_LECT_POESIE: 'SECONDE',
  FR_2DE_LECT_MOUVEMENT: 'SECONDE',
  FR_2DE_LANG_NEGATION: 'SECONDE',
  FR_2DE_LANG_INTERROGATION: 'SECONDE',
  FR_2DE_LANG_LEXIQUE: 'SECONDE',
  FR_1RE_LANG_SUBORDINATION: 'PREMIERE',
  FR_1RE_LANG_NEGATION: 'PREMIERE',
  FR_1RE_LANG_INTERROGATION: 'PREMIERE',
  FR_1RE_METH_GRAMMAIRE: 'PREMIERE',
  FR_1RE_METH_LINEAIRE: 'PREMIERE',
  FR_1RE_LECT_THEATRE: 'PREMIERE',
  FR_1TEC_LANG_CIRCONSTANCIELLES: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_NEGATION: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_INTERROGATION: 'PREMIERE_TECHNO',
  FR_1TEC_ECR_RELATIONS_LOGIQUES: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_ACQUIS_SECONDE: 'PREMIERE_TECHNO',
  FR_1TEC_LANG_LEXIQUE: 'PREMIERE_TECHNO',
};

const COURT = {
  SECONDE: '2de', PREMIERE: '1re', PREMIERE_TECHNO: '1tec', TERMINALE: 'tle',
};

const JEUX = [
  ['escape-maths-lycee', escapeMaths, 'MATHS', /^MATH_/, ['SECONDE', 'PREMIERE', 'TERMINALE']],
  ['escape-francais-lycee', escapeFrancais, 'FRANCAIS', /^FR_/, ['SECONDE', 'PREMIERE', 'PREMIERE_TECHNO']],
];

describe.each(JEUX)('%s', (cle, jeu, matiere, prefixeMatiere, classes) => {
  it('se décrit : famille, escape game, six cadenas, ses trois classes', () => {
    expect(jeu.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: matiere });
    expect(jeu.ESCAPE).toBe(true);
    expect(jeu.MANCHES).toBe(6);
    expect(jeu.CLASSES).toEqual(classes);
    expect(jeu.bilan(6)).toBe('Sans une seule erreur. Bravo !');
    expect(jeu.bilan(1)).toBe('Tu y arrives. On recommence ?');
  });

  it('chaque phrase est fixe : aucun chiffre, une clé en kebab-case, jamais « raté » ni « faux »', () => {
    Object.entries(jeu.PHRASES).forEach(([c, texte]) => {
      expect(c).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
    });
  });

  describe.each(jeu.CLASSES.map((n) => [n]))('%s', (niveau) => {
    it('la classe a son titre, son accroche, son décor, sa fin, et des compétences officielles de la classe', () => {
      const c = jeu.PAR_CLASSE[niveau];
      expect(c.titre.trim()).not.toBe('');
      expect(c.accroche.trim()).not.toBe('');
      expect(c.accroche.length).toBeLessThanOrEqual(45);
      expect(c.intro.trim()).not.toBe('');
      expect(c.intro).not.toMatch(/rebours|minute|chrono|temps/i);
      expect(c.fin.trim()).not.toBe('');
      expect(c.competences.length).toBeGreaterThan(0);
      c.competences.forEach((code) => {
        expect(code).toMatch(prefixeMatiere);
        expect(COMPETENCES[code]).toBe(niveau);
      });
    });

    it('chaque partie a six étapes, et chaque étape sa bonne réponse parmi des choix différents', () => {
      graines.forEach((g) => {
        const serie = jeu.serie(g, niveau);
        expect(serie).toHaveLength(jeu.MANCHES);
        serie.forEach((m) => {
          const cles = m.choix.map((x) => String(x.cle));
          expect(new Set(cles).size).toBe(cles.length);
          expect(cles.length).toBeGreaterThanOrEqual(2);
          expect(cles.length).toBeLessThanOrEqual(4);
          expect(cles).toContain(String(m.bonne));
          m.choix.forEach((x) => expect(String(x.libelle).trim()).not.toBe(''));
          expect(m.question.trim()).not.toBe('');
        });
      });
    });

    it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
      graines.forEach((g) => jeu.serie(g, niveau).forEach((m) => {
        expect(jeu.PHRASES[m.consigne]).toBeTruthy();
        expect(jeu.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
        expect(m.aide === undefined || Boolean(jeu.PHRASES[m.aide])).toBe(true);
        Object.values(m.pieges).forEach((p) => expect(jeu.PHRASES[p]).toBeTruthy());
        expect(jeu.verdict(m, m.bonne)).toBe('juste');
        m.choix.filter((x) => String(x.cle) !== String(m.bonne)).forEach((x) => {
          const s = jeu.verdict(m, x.cle);
          expect(jeu.PHRASES[s]).toBeTruthy();
          expect(jeu.PHRASES[s]).not.toMatch(/raté/i);
        });
        expect(jeu.PHRASES[jeu.verdict(m, 'une-cle-inconnue')]).toBeTruthy();
      }));
    });

    it('les six étapes suivent le récit : consignes dans l’ordre, code qui se construit', () => {
      graines.forEach((g) => {
        const serie = jeu.serie(g, niveau);
        const pieces = [];
        serie.forEach((m, i) => {
          expect(m.consigne).toBe(`${COURT[niveau]}-etape-${i + 1}`);
          expect(m.recit.trim()).not.toBe('');
          expect(m.cadenas.total).toBe(6);
          expect(m.cadenas.avant).toEqual(pieces);
          expect(m.cadenas.piece).toMatch(/^[0-9A-Z]$/);
          pieces.push(m.cadenas.piece);
        });
      });
    });

    it('la même graine redonne la même partie', () => {
      expect(jeu.serie(77, niveau)).toEqual(jeu.serie(77, niveau));
      expect(jeu.serie(1758000104729, niveau)).toEqual(jeu.serie(1758000104729, niveau));
    });
  });
});

// ------------------------------------------------------ l'exactitude des maths

const INDICES = '₀₁₂₃₄₅₆₇₈₉';
const EXPOSANTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const nombre = (s) => Number(String(s).replace('−', '-'));
const nombres = (q) => (q.match(/−?\d+/g) || []).map(nombre);
const lireIndice = (s) => Number([...s].map((c) => INDICES.indexOf(c)).join(''));
const lireExposant = (s) => (s.startsWith('⁻') ? -1 : 1) * Number([...s.replace('⁻', '')].map((c) => EXPOSANTS.indexOf(c)).join(''));
const factorielle = (n) => (n <= 1 ? 1 : n * factorielle(n - 1));

/** Un polynôme écrit à la française (« 2x² − x + 3 », « x − 2y + z − 4 ») → { 'x²': 2, x: −1, 1: 3 }. */
function lirePolynome(s) {
  const coefs = {};
  const t = s.replace(/\s/g, '').replace(/−/g, '-');
  (t.match(/[+-]?[^+-]+/g) || []).forEach((terme) => {
    const [, signe, chiffres, variable] = terme.match(/^([+-]?)(\d*)(x²|x|y|z)?$/);
    const cle = variable || '1';
    coefs[cle] = (coefs[cle] || 0) + (signe === '-' ? -1 : 1) * (chiffres === '' ? 1 : Number(chiffres));
  });
  return coefs;
}
/** La fonction d'un polynôme en x. */
const fonction = (coefs) => (x) => (coefs['x²'] || 0) * x * x + (coefs.x || 0) * x + (coefs['1'] || 0);
/** Un carré parfait, et sa racine. */
const racine = (n) => {
  const r = Math.round(Math.sqrt(n));
  expect(r * r).toBe(n);
  return r;
};

/** La réponse recalculée depuis la question affichée, étape par étape. */
const RECALCUL = {
  // ----- 2de
  '2de-etape-1': (q) => {
    const [, k, s, a] = q.match(/^\((\d*)x ([+−]) (\d+)\)²/);
    const kk = k === '' ? 1 : Number(k);
    const sg = s === '−' ? -1 : 1;
    // Le développement complet, terme à terme, comparé à ce qui est affiché.
    const b = 2 * kk * sg * Number(a);
    const c = Number(a) ** 2;
    return q.endsWith('b = ?') ? b : c;
  },
  '2de-etape-2': (q) => {
    const racines = [...q.matchAll(/\(x ([+−]) (\d+)\)/g)].map(([, s, n]) => (s === '−' ? Number(n) : -Number(n)));
    const large = q.includes('≤');
    let compte = 0;
    for (let x = -50; x <= 50; x += 1) {
      const p = (x - racines[0]) * (x - racines[1]);
      if (large ? p <= 0 : p < 0) compte += 1;
    }
    return compte;
  },
  '2de-etape-3': (q) => {
    const deux = q.match(/A\((−?\d+) ; (−?\d+)\) et B\((−?\d+) ; (−?\d+)\)/);
    if (deux) {
      const [xa, ya, xb, yb] = deux.slice(1).map(nombre);
      return (yb - ya) / (xb - xa);
    }
    const [, m, x, y] = q.match(/y = (−?\d*)x \+ p passe par A\((−?\d+) ; (−?\d+)\)/);
    const pente = m === '' ? 1 : m === '−' ? -1 : nombre(m);
    return nombre(y) - pente * nombre(x);
  },
  '2de-etape-4': (q) => {
    const [xa, ya, xb, yb] = nombres(q);
    return racine((xb - xa) ** 2 + (yb - ya) ** 2);
  },
  '2de-etape-5': (q) => {
    const [a, b, c] = nombres(q);
    return a + b - c;
  },
  '2de-etape-6': (q) => {
    const [, x, y] = q.match(/range\((\d+)(?:, (\d+))?\)/);
    const [debut, fin] = y === undefined ? [0, Number(x)] : [Number(x), Number(y)];
    if (q.includes('s = s + i')) {
      let s = 0;
      for (let i = debut; i < fin; i += 1) s += i;
      return s;
    }
    let v = Number(q.match(/^x = (\d+)/)[1]);
    for (let i = debut; i < fin; i += 1) v *= 2;
    return v;
  },
  // ----- 1re
  '1re-etape-1': (q) => {
    const n = nombres(q);
    if (q.startsWith('Une hausse')) return Math.round((1 + n[0] / 100) * (1 - n[1] / 100) * 10000 - 10000) / 100;
    if (q.includes('d’entre eux')) return (n[0] * n[1]) / 100;
    // Taux réciproque : la hausse qui ramène au départ.
    return Math.round((1 / (1 - n[0] / 100) - 1) * 10000) / 100;
  },
  '1re-etape-2': (q) => {
    const f = lirePolynome(q.slice(q.lastIndexOf(' de ') + 4, -2));
    if (q.startsWith('Discriminant')) return (f.x || 0) ** 2 - 4 * f['x²'] * (f['1'] || 0);
    const p = fonction(f);
    const racines = [];
    for (let x = -50; x <= 50; x += 1) if (p(x) === 0) racines.push(x);
    expect(racines).toHaveLength(2);
    return Math.max(...racines);
  },
  '1re-etape-3': (q) => {
    const k = nombre(q.match(/f′\((−?\d+)\)/)[1]);
    const produit = q.match(/^f\(x\) = \((.+)\)\((.+)\)\. /);
    const f = produit
      ? ((u, v) => (x) => u(x) * v(x))(fonction(lirePolynome(produit[1])), fonction(lirePolynome(produit[2])))
      : fonction(lirePolynome(q.match(/^f\(x\) = (.+)\. f′/)[1]));
    // Pour un polynôme de degré deux, le taux d'accroissement symétrique est exactement le nombre dérivé.
    return (f(k + 1) - f(k - 1)) / 2;
  },
  '1re-etape-4': (q) => {
    const [, sorte, depart, valeur, raison, rang] = q.match(/^\([uv]ₙ\) (arithmétique|géométrique) : [uv]([₀-₉]+) = (−?\d+), raison (−?\d+)\. [uv]([₀-₉]+) = \?$/);
    let terme = nombre(valeur);
    for (let i = lireIndice(depart); i < lireIndice(rang); i += 1) {
      terme = sorte === 'arithmétique' ? terme + nombre(raison) : terme * nombre(raison);
    }
    return terme;
  },
  '1re-etape-5': (q) => {
    const [total, pilotes, ingenieurs, lesDeux] = nombres(q);
    expect(total).toBe(100);
    return (100 * lesDeux) / (q.includes('un pilote') ? pilotes : ingenieurs);
  },
  '1re-etape-6': (q) => {
    const produit = q.match(/^e([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+) × e([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+) ÷ e([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+) = eⁿ/);
    if (produit) {
      const [a, b, c] = produit.slice(1).map(lireExposant);
      return a + b - c;
    }
    const [, a, b] = q.match(/^\(e([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) = eⁿ/);
    return lireExposant(a) * lireExposant(b);
  },
  // ----- terminale
  'tle-etape-1': (q) => {
    const [, num, den] = q.match(/de \((.+)\)\/\((.+)\) \?$/);
    const f = fonction(lirePolynome(num));
    const g = fonction(lirePolynome(den));
    return Math.round(f(1e9) / g(1e9)) + 0;
  },
  'tle-etape-2': (q) => {
    const somme = q.match(/^ln\((\d+)\) \+ ln\((\d+)\) − ln\((\d+)\) = ln\(n\)/);
    if (somme) {
      const [a, b, c] = somme.slice(1).map(Number);
      return Math.round(Math.exp(Math.log(a) + Math.log(b) - Math.log(c)));
    }
    const [, k, a] = q.match(/^(\d+) ln\((\d+)\) = ln\(n\)/);
    return Math.round(Math.exp(Number(k) * Math.log(Number(a))));
  },
  'tle-etape-3': (q) => {
    const [, bas, haut, integrande] = q.match(/^∫([₀-₉]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+) \((.+)\) dx = \?$/);
    const [a, b] = [lireIndice(bas), lireExposant(haut)];
    const f = fonction(lirePolynome(integrande));
    // La méthode de Simpson est exacte pour un polynôme de degré un.
    return ((b - a) / 6) * (f(a) + 4 * f((a + b) / 2) + f(b));
  },
  'tle-etape-4': (q) => {
    const [, n, p] = q.match(/B\((\d+) ; ([\d,]+)\)/);
    const P = Math.round(Number(p.replace(',', '.')) * 100);
    if (q.endsWith('E(X) = ?')) return (Number(n) * P) / 100;
    return (Number(n) * P * (100 - P)) / 10000;
  },
  'tle-etape-5': (q) => {
    if (q.includes('répétitions permises')) {
      const [k, n] = nombres(q);
      return n ** k;
    }
    if (q.includes('rôles différents')) {
      const [n, k] = nombres(q);
      let a = 1;
      for (let i = 0; i < k; i += 1) a *= n - i;
      return a;
    }
    const [k, n] = nombres(q);
    let a = 1;
    for (let i = 0; i < k; i += 1) a *= n - i;
    return a / factorielle(k);
  },
  'tle-etape-6': (q) => {
    const vecteurs = q.match(/u\((−?\d+) ; (−?\d+) ; m\) et v\((−?\d+) ; (−?\d+) ; (−?\d+)\)/);
    if (vecteurs) {
      const [a, b, d, e, f] = vecteurs.slice(1).map(nombre);
      return -(a * d + b * e) / f;
    }
    const [, equation, x, y] = q.match(/^Plan P : (.+) = 0\. A\((−?\d+) ; (−?\d+) ; z\)/);
    const p = lirePolynome(equation);
    return -((p.x || 0) * nombre(x) + (p.y || 0) * nombre(y) + (p['1'] || 0)) / p.z;
  },
};

describe('escape-maths-lycee : chaque réponse recalculée depuis la question', () => {
  describe.each(escapeMaths.CLASSES.map((n) => [n]))('%s', (niveau) => {
    it('la bonne réponse est le vrai résultat, la pièce son chiffre des unités, et aucun autre choix n’est juste', () => {
      const ecarts = [];
      graines.forEach((g) => escapeMaths.serie(g, niveau).forEach((m) => {
        const juste = RECALCUL[m.consigne](m.question);
        if (!Number.isInteger(juste)) ecarts.push(['pas entier', m.question, juste]);
        if (nombre(m.bonne) !== juste) ecarts.push(['bonne', m.question, m.bonne, juste]);
        if (m.cadenas.piece !== String(Math.abs(juste) % 10)) ecarts.push(['pièce', m.question, m.cadenas.piece]);
        m.choix.filter((x) => x.cle !== m.bonne).forEach((x) => {
          if (nombre(x.cle) === juste) ecarts.push(['autre choix juste', m.question, x.cle]);
        });
        Object.keys(m.pieges).forEach((p) => {
          if (p === m.bonne || nombre(p) === juste) ecarts.push(['piège juste', m.question, p]);
        });
      }));
      expect(ecarts).toEqual([]);
    });
  });

  it('les pourcentages restent des pourcentages : jamais plus de cent pour une probabilité ou une part', () => {
    const ecarts = [];
    ['SECONDE', 'PREMIERE'].forEach((niveau) => graines.forEach((g) => escapeMaths.serie(g, niveau)
      .filter((m) => /P\(A ∪ B\)|d’entre eux|probabilité qu’il/.test(m.question))
      .forEach((m) => m.choix.forEach((x) => {
        if (nombre(x.cle) > 100 || nombre(x.cle) < 0) ecarts.push([m.question, x.cle]);
      }))));
    expect(ecarts).toEqual([]);
  });

  it('les pièges qui font le jeu apparaissent vraiment', () => {
    const vus = new Set(escapeMaths.CLASSES
      .flatMap((n) => graines.flatMap((g) => escapeMaths.serie(g, n)))
      .flatMap((m) => Object.values(m.pieges)));
    ['identite-signe', 'identite-double-produit', 'signe-bornes-incluses', 'signe-bornes-exclues',
      'coeff-ordre', 'distance-somme', 'distance-racine', 'union-intersection', 'range-exclut',
      'taux-additionner', 'taux-reciproque', 'proportion-additionner', 'delta-signe', 'racines-signe',
      'derivee-image', 'derivee-produit', 'suite-rang', 'suite-geo-arith', 'proba-cond-inverse',
      'exp-quotient', 'exp-produit', 'exp-puissance', 'limite-constantes', 'limite-degres', 'ln-somme',
      'ln-quotient', 'ln-puissance', 'integrale-borne-inf', 'primitive-moitie', 'binomiale-echecs',
      'variance-esperance', 'kuplets-distincts', 'arrangement-ordre', 'combinaison-ordre',
      'orthogonal-signe', 'plan-signe', 'plan-diviser'].forEach((p) => expect(vus).toContain(p));
  });

  it('chaque phrase de piège sert vraiment', () => {
    const vus = new Set(escapeMaths.CLASSES
      .flatMap((n) => graines.flatMap((g) => escapeMaths.serie(g, n)))
      .flatMap((m) => [m.consigne, `${m.consigne}-regle`, ...Object.values(m.pieges)]));
    expect(Object.keys(escapeMaths.PHRASES).filter((c) => !vus.has(c))).toEqual([]);
  });
});

// --------------------------------------------------- l'exactitude du français

describe('escape-francais-lycee : des banques relues', () => {
  it('chaque phrase de chaque banque : une seule bonne réponse, jamais aussi un piège, et chaque piège a sa phrase', () => {
    Object.entries(escapeFrancais.BANQUES).forEach(([, etapes]) => {
      expect(etapes).toHaveLength(6);
      etapes.forEach((banque) => {
        expect(banque.length).toBeGreaterThanOrEqual(2);
        banque.forEach(({ question, bonne, pieges }) => {
          expect(question.trim()).not.toBe('');
          expect(Object.keys(pieges).length).toBeGreaterThanOrEqual(1);
          expect(Object.keys(pieges).length).toBeLessThanOrEqual(3);
          expect(Object.keys(pieges)).not.toContain(bonne);
          Object.values(pieges).forEach((p) => expect(escapeFrancais.PHRASES[p]).toBeTruthy());
        });
      });
    });
  });

  it('dans une même étape, les questions ne se répètent pas', () => {
    Object.values(escapeFrancais.BANQUES).forEach((etapes) => etapes.forEach((banque) => {
      const questions = banque.map((x) => x.question);
      expect(new Set(questions).size).toBe(questions.length);
    }));
  });

  it('les six lettres forment le mot de la classe, que la fin affiche', () => {
    escapeFrancais.CLASSES.forEach((niveau) => {
      const mot = escapeFrancais.MOTS[niveau];
      expect(mot).toHaveLength(6);
      expect(escapeFrancais.PAR_CLASSE[niveau].fin).toContain(mot);
      graines.forEach((g) => {
        const serie = escapeFrancais.serie(g, niveau);
        expect(serie.map((m) => m.cadenas.piece).join('')).toBe(mot);
        serie.forEach((m) => {
          expect(Object.keys(m.pieges)).not.toContain(m.bonne);
          expect(m.choix.map((x) => x.cle).sort()).toEqual([m.bonne, ...Object.keys(m.pieges)].sort());
        });
      });
    });
  });

  it('chaque phrase de chaque banque finit par sortir', () => {
    escapeFrancais.CLASSES.forEach((niveau) => {
      const vues = new Set(graines.flatMap((g) => escapeFrancais.serie(g, niveau).map((m) => m.question)));
      escapeFrancais.BANQUES[niveau].flat().forEach(({ question }) => expect(vues).toContain(question));
    });
  });

  it('chaque phrase de piège sert vraiment', () => {
    const utiles = new Set(Object.entries(escapeFrancais.BANQUES).flatMap(([niveau, etapes]) => etapes.flatMap((banque, i) => [
      `${COURT[niveau]}-etape-${i + 1}`, `${COURT[niveau]}-etape-${i + 1}-regle`,
      ...banque.flatMap((x) => Object.values(x.pieges)),
    ])));
    expect(Object.keys(escapeFrancais.PHRASES).filter((c) => !utiles.has(c))).toEqual([]);
  });
});
