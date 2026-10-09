/**
 * LES JEUX DE MATHS DU COLLÈGE, LOT B — sept modules, de la 6e à la 3e :
 * la bonne parenthèse, le crible, les fractions, la recette, le diagramme,
 * le tour du jardin, solides et patrons.
 *
 * Même épreuve que le CM2 : soixante parties par module ET par classe. Puis
 * l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun piège ne doit être
 * juste lui aussi.
 */

import * as parenthese from '../lib/jeux/college/bonne-parenthese';
import * as crible from '../lib/jeux/college/crible-college';
import * as fractions from '../lib/jeux/college/fractions-college';
import * as recette from '../lib/jeux/college/recette-college';
import * as diagramme from '../lib/jeux/college/diagramme-college';
import * as jardin from '../lib/jeux/college/tour-du-jardin-college';
import * as solides from '../lib/jeux/college/solides-et-patrons';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['bonne-parenthese', parenthese],
  ['crible-college', crible],
  ['fractions-college', fractions],
  ['recette-college', recette],
  ['diagramme-college', diagramme],
  ['tour-du-jardin-college', jardin],
  ['solides-et-patrons', solides],
];

/** Les codes de `competences-college.txt` dont ce lot a besoin, recopiés tels quels. */
const CODES = new Set([
  'MATH_6E_CALC_PRIORITES', 'MATH_5E_PRIORITES',
  'MATH_6E_DIVISIBILITE', 'MATH_5E_DIVISIBILITE',
  'MATH_3E_ARITH_DIVISEURS', 'MATH_3E_ARITH_PREMIERS', 'MATH_3E_FRAC_IRRED',
  'MATH_6E_FRAC_SENS', 'MATH_6E_FRAC_EGALES', 'MATH_6E_FRAC_COMPARER',
  'MATH_5E_FRAC_ADD', 'MATH_5E_FRAC_MULT', 'MATH_4E_FRAC_OPERATIONS',
  'MATH_6E_PROP_RECONNAITRE', 'MATH_6E_PROP_COEFF', 'MATH_6E_PROP_POURCENT', 'MATH_6E_PROP_ECHELLE',
  'MATH_5E_PROP_QUATRIEME', 'MATH_5E_PROP_POURCENT', 'MATH_5E_PROP_ECHELLE',
  'MATH_4E_PROP_VITESSE', 'MATH_4E_PROP_POURCENT', 'MATH_4E_MES_COMPOSEES',
  'MATH_6E_DATA_TABLEAU', 'MATH_6E_DATA_GRAPHIQUE',
  'MATH_5E_STAT_EFFECTIFS', 'MATH_5E_STAT_MOYENNE',
  'MATH_4E_STAT_MOY_POND', 'MATH_4E_STAT_MEDIANE', 'MATH_3E_STAT_QUARTILES',
  'MATH_6E_MES_PERIMETRE', 'MATH_6E_MES_AIRE', 'MATH_6E_MES_VOLUME',
  'MATH_5E_MES_AIRE_PARAL', 'MATH_5E_MES_AIRE_DISQUE', 'MATH_5E_MES_VOLUME', 'MATH_5E_MES_CONVERSION',
  'MATH_3E_MES_SPHERE', 'MATH_3E_MES_COMPOSEES',
  'MATH_6E_GEO_SOLIDES', 'MATH_4E_GEO_SOLIDES', 'MATH_4E_MES_VOLUME',
]);

const PREFIXE = {
  SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_',
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

  it('la classe a son titre, son accroche et ses compétences officielles', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    fiche.competences.forEach((c) => {
      expect(CODES.has(c)).toBe(true);
      expect(c).toContain(PREFIXE[classe]);
    });
  });
});

describe.each(MODULES)('%s : la famille et les phrases', (cle, module) => {
  it('la famille porte sa clé, et les classes sont celles du collège', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'MATHS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    module.CLASSES.forEach((c) => expect(Object.keys(PREFIXE)).toContain(c));
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
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));
const parConsigne = (module, classe, consigne) => toutes(module, classe).filter((m) => m.consigne === consigne);

/** Tous les nombres d'un texte : « 2,5 », « 25 000 » (espace fine), « 12 ». */
const lire = (s) => (String(s).match(/\d[\d ]*(?:,\d+)?/g) || [])
  .map((x) => Number(x.replace(/ /g, '').replace(',', '.')));
const valeur = (s) => lire(s)[0];
const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/**
 * Une vérification faite dans une branche (une sorte de manche parmi
 * d'autres) : le message dit laquelle a échoué.
 */
const verifier = (vrai, message) => expect({ message, vrai }).toEqual({ message, vrai: true });

/** La bonne réponse vaut l'attendu, et aucun autre choix ne le vaut. */
function seuleJuste(m, attendu, lecture = valeur) {
  expect(proche(lecture(m.bonne), attendu)).toBe(true);
  autres(m).forEach((c) => expect(proche(lecture(c), attendu)).toBe(false));
}

/** Un arrondi au dixième : la bonne réponse l'est exactement, aucun autre choix n'en est assez près. */
function arrondiJuste(m, exact) {
  expect(m.bonne).toBe((Math.round(exact * 10) / 10).toFixed(1).replace('.', ','));
  autres(m).forEach((c) => expect(Math.abs(valeur(c) - exact)).toBeGreaterThan(0.05));
}

/** « 36π » → 36. */
const coefPi = (s) => {
  expect(s).toMatch(/π$/);
  return valeur(s);
};

const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));
const estPremier = (n) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};

/* ------------------------- un petit calculateur, avec les priorités -------- */

/** Évalue « 3 × (5 + 2 × 4) », avec des entiers ou des fractions « a/b » (rendues en [n, d]). */
function evaluer(expression) {
  const jetons = expression.replace(/=\s*\?.*$/, '').match(/\d+\/\d+|\d+|[+×÷()−]/g);
  let i = 0;
  const reduire = ([n, d]) => {
    const g = pgcd(Math.abs(n), Math.abs(d));
    return [n / g, d / g];
  };
  const ops = {
    '+': ([a, b], [c, d]) => reduire([a * d + b * c, b * d]),
    '−': ([a, b], [c, d]) => reduire([a * d - b * c, b * d]),
    '×': ([a, b], [c, d]) => reduire([a * c, b * d]),
    '÷': ([a, b], [c, d]) => reduire([a * d, b * c]),
  };
  function somme() {
    let v = produit(); // eslint-disable-line no-use-before-define
    while (jetons[i] === '+' || jetons[i] === '−') {
      const op = jetons[i];
      i += 1;
      v = ops[op](v, produit()); // eslint-disable-line no-use-before-define
    }
    return v;
  }
  function facteur() {
    const j = jetons[i];
    i += 1;
    if (j === '(') {
      const v = somme();
      i += 1;
      return v;
    }
    const [n, d = 1] = j.split('/').map(Number);
    return reduire([n, d]);
  }
  function produit() {
    let v = facteur();
    while (jetons[i] === '×' || jetons[i] === '÷') {
      const op = jetons[i];
      i += 1;
      v = ops[op](v, facteur());
    }
    return v;
  }
  return somme();
}
const enNombre = ([n, d]) => n / d;
const fraction = (s) => {
  const [n, d = 1] = String(s).split('/').map(Number);
  return [n, d];
};
const memeValeur = ([a, b], [c, d]) => a * d === b * c;

describe('la bonne parenthèse : le calcul juste, et un seul', () => {
  it('le petit calculateur connaît lui-même les priorités', () => {
    expect(enNombre(evaluer('7 + 4 × 3 = ?'))).toBe(19);
    expect(enNombre(evaluer('20 − (8 − 3) = ?'))).toBe(15);
    expect(enNombre(evaluer('2 × (5 + (9 − 4)) = ?'))).toBe(20);
    expect(enNombre(evaluer('20 − 5 + 3 = ?'))).toBe(18);
  });

  it.each(parenthese.CLASSES)('en %s : chaque calcul a pour réponse le vrai résultat, entier et positif', (classe) => {
    toutes(parenthese, classe).filter((m) => m.consigne !== 'premier').forEach((m) => {
      const attendu = enNombre(evaluer(m.question));
      expect(Number.isInteger(attendu) && attendu > 0).toBe(true);
      seuleJuste(m, attendu, Number);
    });
  });

  /** Le premier calcul : dans la parenthèse la plus intérieure, la multiplication ou la division d'abord. */
  function premierCalcul(expression) {
    const interieures = expression.match(/\(([^()]*)\)/);
    const zone = interieures ? interieures[1] : expression;
    const jetons = zone.match(/\d+|[+×÷−]/g);
    let k = jetons.findIndex((j) => j === '×' || j === '÷');
    if (k < 0) k = 1;
    return `${jetons[k - 1]} ${jetons[k]} ${jetons[k + 1]}`;
  }

  it.each(parenthese.CLASSES)('en %s : le premier calcul est le bon', (classe) => {
    parConsigne(parenthese, classe, 'premier').forEach((m) => {
      expect(m.bonne).toBe(premierCalcul(m.question));
    });
  });

  it('le piège du moins devant la parenthèse est bien nommé', () => {
    parConsigne(parenthese, 'CINQUIEME', 'moins-devant').forEach((m) => {
      const phrases = Object.values(m.pieges);
      phrases.forEach((p) => expect(['moins-devant-parenthese', 'meme-niveau']).toContain(p));
    });
  });
});

describe('le crible : divisibilité, nombres premiers, PGCD', () => {
  it('un seul nombre est divisible, un seul est diviseur, un seul est multiple', () => {
    ['SIXIEME', 'CINQUIEME'].forEach((classe) => {
      toutes(crible, classe).forEach((m) => {
        const n = valeur(m.question);
        const cles = m.choix.map((c) => Number(c.cle));
        let justes = null;
        if (m.consigne === 'divisible-par' || m.consigne === 'multiple') justes = cles.filter((c) => c % n === 0);
        if (m.consigne === 'critere' || m.consigne === 'diviseur') justes = cles.filter((c) => n % c === 0);
        if (m.consigne === 'nombre-premier') justes = cles.filter(estPremier);
        if (justes) verifier(justes.length === 1 && justes[0] === Number(m.bonne), `${m.question} : ${justes}`);
      });
    });
  });

  it('les critères tiennent : 3 et 9 par la somme des chiffres, 4 par les deux derniers', () => {
    parConsigne(crible, 'SIXIEME', 'divisible-par').forEach((m) => {
      const d = valeur(m.question);
      const n = Number(m.bonne);
      const sommeChiffres = String(n).split('').reduce((a, c) => a + Number(c), 0);
      if (d === 3 || d === 9) verifier(sommeChiffres % d === 0, `${n} par ${d}`);
      if (d === 4) verifier((n % 100) % 4 === 0, `${n} par 4`);
    });
  });

  it('le nombre de diviseurs est compté juste', () => {
    parConsigne(crible, 'CINQUIEME', 'nombre-diviseurs').forEach((m) => {
      const n = valeur(m.question);
      let compte = 0;
      for (let d = 1; d <= n; d += 1) if (n % d === 0) compte += 1;
      seuleJuste(m, compte, Number);
    });
  });

  it('le PGCD est le plus grand diviseur commun', () => {
    parConsigne(crible, 'TROISIEME', 'pgcd').forEach((m) => {
      const [a, b] = lire(m.question);
      seuleJuste(m, pgcd(a, b), Number);
    });
  });

  const PUISSANCES = {
    '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6,
  };
  /** « 2³ × 3 × 5 » → [2, 2, 2, 3, 5]. */
  const facteurs = (s) => s.split(' × ').flatMap((f) => {
    const [, base, exp] = f.match(/^(\d+)([²³⁴⁵⁶]?)$/);
    return Array(exp ? PUISSANCES[exp] : 1).fill(Number(base));
  });

  it('la décomposition est faite de facteurs premiers dont le produit redonne le nombre ; les pièges, non', () => {
    parConsigne(crible, 'TROISIEME', 'decomposition').forEach((m) => {
      const n = valeur(m.question);
      const juste = (s) => {
        const f = facteurs(s);
        return f.every(estPremier) && f.reduce((a, b) => a * b, 1) === n;
      };
      expect(juste(m.bonne)).toBe(true);
      autres(m).forEach((c) => expect(juste(c)).toBe(false));
    });
  });

  it('la fraction irréductible vaut la fraction de départ et ne se simplifie plus ; aucun piège ne fait les deux', () => {
    parConsigne(crible, 'TROISIEME', 'irreductible').forEach((m) => {
      const [a, b] = lire(m.question);
      const juste = (s) => {
        const [n, d] = fraction(s);
        return memeValeur([n, d], [a, b]) && pgcd(n, d) === 1;
      };
      expect(juste(m.bonne)).toBe(true);
      autres(m).forEach((c) => expect(juste(c)).toBe(false));
    });
  });
});

describe('les fractions : la valeur juste, et un seul choix qui la vaut', () => {
  const seuleEgale = (m, attendu) => {
    expect(memeValeur(fraction(m.bonne), attendu)).toBe(true);
    autres(m).forEach((c) => expect(memeValeur(fraction(c), attendu)).toBe(false));
  };

  it('en 6e : le sens, les fractions égales, la simplification, la comparaison', () => {
    toutes(fractions, 'SIXIEME').forEach((m) => {
      if (m.consigne === 'sens') {
        const [total, pris] = lire(m.question);
        seuleEgale(m, [total - pris, total]);
        verifier(fraction(m.bonne)[1] === total, m.question);
      } else if (m.consigne === 'egales') {
        const [a, b] = lire(m.question);
        seuleEgale(m, [a, b]);
        verifier(m.bonne !== `${a}/${b}`, m.question);
      } else if (m.consigne === 'simplifier') {
        const [a, b] = lire(m.question);
        seuleEgale(m, [a, b]);
        verifier(fraction(m.bonne)[1] < b, m.question);
      } else {
        const [g, d] = m.question.replace(' ?', '').split(/\s+ou\s+/).map(fraction);
        const plusGrande = enNombre(g) > enNombre(d) ? g : d;
        verifier(!memeValeur(g, d) && m.bonne === plusGrande.join('/'), m.question);
      }
    });
  });

  it('en 5e : sommes, produits, même dénominateur — dénominateurs multiples l’un de l’autre', () => {
    toutes(fractions, 'CINQUIEME').forEach((m) => {
      if (m.consigne === 'meme-denominateur') {
        const [a, b, d] = lire(m.question);
        seuleEgale(m, [a, b]);
        verifier(fraction(m.bonne)[1] === d, m.question);
      } else {
        seuleEgale(m, evaluer(m.question));
        if (m.consigne === 'additionner') {
          const [, b, , d] = lire(m.question);
          verifier(d % b === 0, m.question);
        }
      }
    });
  });

  it('en 4e : les quatre opérations, résultat irréductible', () => {
    toutes(fractions, 'QUATRIEME').forEach((m) => {
      seuleEgale(m, evaluer(m.question));
      const [n, d] = fraction(m.bonne);
      expect(pgcd(n, d)).toBe(1);
    });
  });

  it('diviser par 2/3, c’est multiplier par 3/2', () => {
    expect(evaluer('5/4 ÷ 2/3 = ?')).toEqual([15, 8]);
    expect(evaluer('1/2 + 3/4 × 2/5 = ?')).toEqual([4, 5]);
  });
});

describe('la recette : chaque réponse recalculée', () => {
  /** « 7,50 € », « 2 h 30 min » → un nombre (les durées en heures). */
  const duree = (s) => {
    const [h, mn] = lire(s);
    return h + mn / 60;
  };

  it('en 6e : proportionnalité, coefficient, pourcentage, échelle', () => {
    toutes(recette, 'SIXIEME').forEach((m) => {
      const n = lire(m.question);
      if (m.consigne === 'proportionnel') {
        const [x1, x2, x3, y1, y2, y3] = n;
        const prop = y2 * x1 === y1 * x2 && y3 * x1 === y1 * x3;
        verifier(m.bonne === (prop ? 'oui' : 'non'), m.question);
      } else if (m.consigne === 'coefficient') {
        const [a, b, pa] = n;
        seuleJuste(m, (pa * b) / a);
      } else if (m.consigne === 'pourcentage') {
        const [p, q] = n;
        seuleJuste(m, (p * q) / 100);
      } else {
        const [, echelle, l] = n;
        seuleJuste(m, (l * echelle) / 100);
      }
    });
  });

  it('en 5e : quatrième proportionnelle, pourcentages, cartes', () => {
    toutes(recette, 'CINQUIEME').forEach((m) => {
      const n = lire(m.question);
      if (m.consigne === 'quatrieme' && /agrandi/.test(m.question)) {
        const [l, lo, , lo2] = n;
        seuleJuste(m, (l * lo2) / lo);
      } else if (m.consigne === 'quatrieme') {
        const [a, prix, b] = n;
        seuleJuste(m, (prix * b) / a);
      } else if (/soldé/.test(m.question)) {
        const [prix, p] = n;
        seuleJuste(m, (prix * (100 - p)) / 100);
      } else if (/élèves sur/.test(m.question)) {
        const [part, total] = n;
        seuleJuste(m, (part * 100) / total);
      } else {
        const [, echelle, l] = n;
        seuleJuste(m, (l * echelle) / 100000);
      }
    });
  });

  it('en 4e : vitesses, pourcentages enchaînés, grandeurs composées', () => {
    toutes(recette, 'QUATRIEME').forEach((m) => {
      const n = lire(m.question);
      if (/Un train/.test(m.question)) {
        const [v, h, mn] = n;
        seuleJuste(m, v * (h + mn / 60));
      } else if (/cycliste/.test(m.question)) {
        const [d, h, mn] = n;
        seuleJuste(m, d / (h + mn / 60));
      } else if (/Combien de temps/.test(m.question)) {
        const [d, v] = n;
        seuleJuste(m, d / v, duree);
      } else if (/puis baisse/.test(m.question)) {
        const [prix, p] = n;
        seuleJuste(m, prix * (1 + p / 100) * (1 - p / 100));
        verifier(valeur(m.bonne) < prix, m.question);
      } else if (/puis de/.test(m.question)) {
        const [a, b] = n;
        seuleJuste(m, ((1 + a / 100) * (1 + b / 100) - 1) * 100);
      } else if (/multiplier par/.test(m.question)) {
        const [p] = n;
        seuleJuste(m, /^Baisser/.test(m.question) ? 1 - p / 100 : 1 + p / 100);
      } else if (/robinet/.test(m.question)) {
        const [q, h, mn] = n;
        seuleJuste(m, q * (60 * h + mn));
      } else if (/radiateur/.test(m.question)) {
        const [p, h, mn] = n;
        seuleJuste(m, p * (h + mn / 60));
      } else {
        const [v] = n;
        seuleJuste(m, (v * 1000) / 3600);
      }
    });
  });

  it('+20 % puis −20 % ne ramène jamais au prix de départ', () => {
    parConsigne(recette, 'QUATRIEME', 'pourcentages')
      .filter((m) => /puis baisse/.test(m.question))
      .forEach((m) => {
        const [prix] = lire(m.question);
        const piege = autres(m).find((c) => proche(valeur(c), prix));
        expect(piege).toBeTruthy();
        expect(recette.verdict(m, piege)).toBe('hausse-baisse-pas-nulle');
      });
  });
});

describe('le diagramme : chaque lecture et chaque indicateur recalculés', () => {
  /** « foot 4, danse 9, judo 3 » → { foot: 4, danse: 9, judo: 3 }. */
  const releve = (texte) => Object.fromEntries(texte.split(', ').map((x) => {
    const [, nom, v] = x.match(/^(.+?) (\d+)°?$/);
    return [nom, Number(v)];
  }));
  const somme = (l) => l.reduce((a, b) => a + b, 0);
  const rangee = (l) => [...l].sort((a, b) => a - b);
  const mediane = (l) => {
    const r = rangee(l);
    const k = r.length;
    return k % 2 ? r[(k - 1) / 2] : (r[k / 2 - 1] + r[k / 2]) / 2;
  };
  /** Le quartile par sa définition : la plus petite valeur qui laisse au moins la part voulue en dessous. */
  const quartile = (l, part) => rangee(l).find((v) => l.filter((x) => x <= v).length >= part * l.length);
  /** La série d'une question « Série : 3 ; 8 ; 1. Médiane ? ». */
  const serieDe = (q) => lire(q.split(':')[1].split('.')[0]);

  it('en 6e : tableau à double entrée, diagramme circulaire, barres', () => {
    toutes(diagramme, 'SIXIEME').forEach((m) => {
      if (m.consigne === 'tableau') {
        const [, f, g] = m.question.match(/Filles : (.*?)\. Garçons : (.*?)\./);
        const [filles, garcons] = [releve(f), releve(g)];
        const cas = m.question.match(/Combien de (filles|garçons) font (?:du|de la) (\S+) \?/);
        const colonne = m.question.match(/Combien d’élèves font (?:du|de la) (\S+) en tout \?/);
        let attendu = somme(Object.values(filles)) + somme(Object.values(garcons));
        if (cas) attendu = (cas[1] === 'filles' ? filles : garcons)[cas[2]];
        if (colonne) attendu = filles[colonne[1]] + garcons[colonne[1]];
        seuleJuste(m, attendu);
      } else if (m.consigne === 'circulaire') {
        const [, total, secteurs, activite] = m.question.match(/de (\d+) élèves : (.*?)\. Combien d’élèves font (?:du|de la) (\S+) \?/);
        const angles = releve(secteurs);
        verifier(somme(Object.values(angles)) === 360, m.question);
        seuleJuste(m, (Number(total) * angles[activite]) / 360);
      } else if (/dépasse/.test(m.question)) {
        const [, jours, a, b] = m.question.match(/: (.*?)\. De combien la barre de (\S+) dépasse-t-elle celle de (\S+) \?/);
        const v = releve(jours);
        verifier(v[a] > v[b], m.question);
        seuleJuste(m, v[a] - v[b]);
      } else {
        const [, , bas, haut] = lire(m.question);
        seuleJuste(m, (bas + haut) / 2);
      }
    });
  });

  it('en 5e : moyenne, fréquence, effectif', () => {
    toutes(diagramme, 'CINQUIEME').forEach((m) => {
      const n = lire(m.question);
      if (m.consigne === 'moyenne') seuleJuste(m, somme(n) / n.length);
      if (m.consigne === 'frequence') seuleJuste(m, n[1] / n[0]);
      if (m.consigne === 'effectif') seuleJuste(m, n[0] * n[1]);
    });
  });

  it('en 4e et en 3e : moyenne pondérée, médiane, quartiles, étendue', () => {
    ['QUATRIEME', 'TROISIEME'].forEach((classe) => toutes(diagramme, classe).forEach((m) => {
      if (m.consigne === 'ponderee') {
        const [v1, c1, v2, c2, v3, c3] = lire(m.question);
        seuleJuste(m, (v1 * c1 + v2 * c2 + v3 * c3) / (c1 + c2 + c3));
      } else if (m.consigne === 'mediane') {
        seuleJuste(m, mediane(serieDe(m.question)));
      } else if (m.consigne === 'etendue') {
        const s = serieDe(m.question);
        seuleJuste(m, Math.max(...s) - Math.min(...s));
      } else {
        const s = serieDe(m.question);
        verifier(s.join() === rangee(s).join(), m.question);
        seuleJuste(m, quartile(s, /Premier/.test(m.question) ? 1 / 4 : 3 / 4));
      }
    }));
  });
});

describe('le tour du jardin : périmètres, aires, volumes, conversions', () => {
  const UNITES = {
    'mm²': 1e-6, 'cm²': 1e-4, 'dm²': 1e-2, 'm²': 1, 'cm³': 1e-6, 'dm³': 1e-3, 'm³': 1, L: 1e-3,
  };

  it('en 6e : périmètre, aire, volume du pavé', () => {
    toutes(jardin, 'SIXIEME').forEach((m) => {
      const n = lire(m.question);
      let attendu;
      if (m.consigne === 'perimetre') {
        if (/^Carré/.test(m.question)) attendu = 4 * n[0];
        else if (/^Triangle/.test(m.question)) attendu = somme3(n);
        else attendu = 2 * (n[0] + n[1]);
      } else if (m.consigne === 'aire') {
        attendu = /^Rectangle/.test(m.question) ? n[0] * n[1] : (n[0] * n[1]) / 2;
      } else {
        attendu = n[0] * n[1] * n[2];
      }
      seuleJuste(m, attendu);
    });
  });
  function somme3([a, b, c]) { return a + b + c; }

  it('en 5e : parallélogramme, disque, prisme, cylindre, conversions', () => {
    toutes(jardin, 'CINQUIEME').forEach((m) => {
      const n = lire(m.question);
      if (m.consigne === 'aire') {
        const [b, , h] = n;
        seuleJuste(m, /^Parallélogramme/.test(m.question) ? b * h : (b * h) / 2);
      } else if (m.consigne === 'disque' && /diamètre/.test(m.question)) {
        const r = n[0] / 2;
        arrondiJuste(m, Math.PI * r * r);
      } else if (m.consigne === 'disque') {
        seuleJuste(m, 2 * n[0], coefPi);
      } else if (/^Prisme/.test(m.question)) {
        const [a, b, h] = n;
        seuleJuste(m, (a * b * h) / 2);
      } else if (/^Cylindre/.test(m.question)) {
        const [r, h] = n;
        seuleJuste(m, Math.round(Math.PI * r * r * h));
      } else {
        const [, de, vers] = m.question.match(/^[\d ,]+ (\S+) = \? (\S+)$/);
        seuleJuste(m, (n[0] * UNITES[de]) / UNITES[vers]);
      }
    });
  });

  it('en 3e : sphère, boule, grandeurs composées', () => {
    toutes(jardin, 'TROISIEME').forEach((m) => {
      const n = lire(m.question);
      if (m.consigne === 'sphere' && /π \?$/.test(m.question)) {
        seuleJuste(m, 4 * n[0] ** 2, coefPi);
      } else if (m.consigne === 'sphere') {
        arrondiJuste(m, 4 * Math.PI * n[0] ** 2);
      } else if (m.consigne === 'boule' && /unité/.test(m.question)) {
        seuleJuste(m, Math.round((4 / 3) * Math.PI * n[0] ** 3));
      } else if (m.consigne === 'boule') {
        const r = /diamètre/.test(m.question) ? n[0] / 2 : n[0];
        seuleJuste(m, (4 * r ** 3) / 3, coefPi);
      } else if (/km\/h = \?/.test(m.question)) {
        seuleJuste(m, (n[0] * 1000) / 3600);
      } else if (/m\/s = \?/.test(m.question)) {
        seuleJuste(m, (n[0] * 3600) / 1000);
      } else {
        seuleJuste(m, (n[0] * 3600) / 1000);
      }
    });
  });
});

describe('solides et patrons', () => {
  /** Recompté à la main : [faces, arêtes, sommets]. */
  const COMPTES = {
    'Un cube': [6, 12, 8],
    'Un pavé droit': [6, 12, 8],
    'Un prisme droit à base triangulaire': [5, 9, 6],
    'Un prisme droit à base hexagonale': [8, 18, 12],
    'Une pyramide à base carrée': [5, 8, 5],
    'Une pyramide à base triangulaire': [4, 6, 4],
    'Une pyramide à base hexagonale': [7, 12, 7],
  };
  const COTES = {
    triangulaire: 3, carrée: 4, pentagonale: 5, hexagonale: 6, octogonale: 8,
  };
  const RANG = { faces: 0, arêtes: 1, sommets: 2 };

  it('chaque solide vérifie la relation d’Euler, et le module compte comme nous', () => {
    solides.SOLIDES.forEach((s) => {
      expect(s.faces + s.sommets - s.aretes).toBe(2);
      expect([s.faces, s.aretes, s.sommets]).toEqual(COMPTES[s.nom]);
    });
  });

  it('en 6e : faces, arêtes, sommets recomptés ; jamais deux noms justes à la fois', () => {
    toutes(solides, 'SIXIEME').forEach((m) => {
      if (m.consigne === 'compter') {
        const [, nom, element] = m.question.match(/^(.+) : combien d(?:e |’)(faces|arêtes|sommets) \?$/);
        seuleJuste(m, COMPTES[nom][RANG[element]], Number);
      } else {
        const cles = m.choix.map((c) => c.cle);
        // Un cube est un pavé droit, un pavé droit est un prisme droit.
        verifier(!(m.bonne === 'Cube' && cles.includes('Pavé droit')), m.question);
        verifier(!(['Cube', 'Pavé droit'].includes(m.bonne) && cles.includes('Prisme droit')), m.question);
      }
    });
  });

  it('en 4e : volumes de la pyramide et du cône, faces de la pyramide, sections', () => {
    toutes(solides, 'QUATRIEME').forEach((m) => {
      const n = lire(m.question);
      if (m.consigne === 'volume' && /^Cône/.test(m.question)) {
        const [d, h] = n;
        seuleJuste(m, ((d / 2) ** 2 * h) / 3, coefPi);
      } else if (m.consigne === 'volume') {
        const [a, b, c] = n;
        const v = /carrée/.test(m.question) ? (a * a * b) / 3 : (a * b * c) / 3;
        seuleJuste(m, v, Number);
      } else if (m.consigne === 'pyramide') {
        const [, base, element] = m.question.match(/base (\S+) : combien d(?:e |’)(faces|arêtes|sommets) \?$/);
        const c = COTES[base];
        seuleJuste(m, [c + 1, 2 * c, c + 1][RANG[element]], Number);
      } else {
        let attendu = 'Un triangle';
        if (/parallèle/.test(m.question)) {
          if (/^Un cône/.test(m.question)) attendu = 'Un disque';
          else if (/carrée/.test(m.question)) attendu = 'Un carré';
          else if (/hexagonale/.test(m.question)) attendu = 'Un hexagone';
        }
        verifier(m.bonne === attendu && !autres(m).includes(attendu), m.question);
      }
    });
  });
});
