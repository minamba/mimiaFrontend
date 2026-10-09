/**
 * LES JEUX DE MATHS DU LYCÉE, LOT « PREMIÈRE B » — cinq modules : le produit
 * scalaire, les probabilités conditionnelles, les variables aléatoires, vrai
 * faux réciproque, les listes en Python.
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun piège ne doit être
 * juste lui aussi. Pour la logique, les propositions sont re-vérifiées par
 * balayage numérique ; pour Python, les programmes sont EXÉCUTÉS par un petit
 * interpréteur écrit ici, qui ne lit que le texte du programme.
 */

import * as scalaire from '../lib/jeux/lycee/produit-scalaire';
import * as conditionnelles from '../lib/jeux/lycee/probabilites-conditionnelles';
import * as va from '../lib/jeux/lycee/variables-aleatoires';
import * as logique from '../lib/jeux/lycee/vrai-faux-reciproque';
import * as listes from '../lib/jeux/lycee/listes-python';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['produit-scalaire', scalaire],
  ['probabilites-conditionnelles', conditionnelles],
  ['variables-aleatoires', va],
  ['vrai-faux-reciproque', logique],
  ['listes-python', listes],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur colonne NIVEAU. */
const CODES = {
  MATH_1RE_SCAL_DEFINITION: 'PREMIERE',
  MATH_1RE_SCAL_ORTHOGONAL: 'PREMIERE',
  MATH_1RE_SCAL_APPLICATION: 'PREMIERE',
  MATH_1RE_SCAL_PROPRIETES: 'PREMIERE',
  MATH_1RE_PROBA_COND: 'PREMIERE',
  MATH_1RE_AUTO_PROBA_NOTATIONS: 'PREMIERE',
  MATH_1RE_PROBA_ARBRE: 'PREMIERE',
  MATH_1RE_PROBA_INDEP: 'PREMIERE',
  MATH_1RE_PROBA_DEUX_EPREUVES: 'PREMIERE',
  MATH_1RE_VA_NOTATIONS: 'PREMIERE',
  MATH_1RE_VA_LOI: 'PREMIERE',
  MATH_1RE_VA_ESPERANCE: 'PREMIERE',
  MATH_1RE_VA_LINEARITE: 'PREMIERE',
  MATH_1RE_VA_PROBLEME: 'PREMIERE',
  MATH_1TEC_VA_LOI: 'PREMIERE_TECHNO',
  MATH_1TEC_VA_ESPERANCE: 'PREMIERE_TECHNO',
  MATH_1RE_LOG_IMPLICATION: 'PREMIERE',
  MATH_1RE_LOGIQUE_CONTRAPOSEE: 'PREMIERE',
  MATH_1RE_LOG_CONTRE_EXEMPLE: 'PREMIERE',
  MATH_1RE_LOG_NECESSAIRE: 'PREMIERE',
  MATH_1RE_LOGIQUE_QUANTIF: 'PREMIERE',
  MATH_1RE_LOG_CONNECTEURS: 'PREMIERE',
  MATH_1RE_LOG_STATUT: 'PREMIERE',
  MATH_1TEC_LOG_RECIPROQUE: 'PREMIERE_TECHNO',
  MATH_1TEC_LOG_CONTRE_EXEMPLE: 'PREMIERE_TECHNO',
  MATH_1TEC_LOG_NECESSAIRE: 'PREMIERE_TECHNO',
  MATH_1TEC_LOGIQUE: 'PREMIERE_TECHNO',
  MATH_1TEC_LOG_STATUT: 'PREMIERE_TECHNO',
  MATH_1RE_ALGO_LISTE_GENERER: 'PREMIERE',
  MATH_1RE_ALGO_LISTE_MANIPULER: 'PREMIERE',
  MATH_1RE_ALGO_LISTE_PARCOURIR: 'PREMIERE',
  MATH_1TEC_ALGO_LISTE: 'PREMIERE_TECHNO',
  MATH_1TEC_ALGO_LISTE_MANIP: 'PREMIERE_TECHNO',
  MATH_TTEC_ALGO_LISTE: 'TERMINALE_TECHNO',
};

const CLASSES_LYCEE = [
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

  it('les manches sont variées : plusieurs sortes par partie', () => {
    graines.forEach((g) => {
      const sortes = new Set(module.serie(g, classe).map((m) => m.consigne));
      expect(sortes.size).toBeGreaterThanOrEqual(4);
    });
  });

  it('la classe a son titre, son accroche et ses compétences officielles, de la bonne classe', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    const ecarts = fiche.competences.filter((c) => CODES[c] !== classe);
    expect(ecarts).toEqual([]);
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
      // Typographie française : une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/\S[?!:;]/);
    });
  });

  it('chaque phrase sert : consigne, piège ou règle d’une consigne', () => {
    const servies = new Set();
    module.CLASSES.forEach((classe) => graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      servies.add(m.consigne);
      servies.add(`${m.consigne}-regle`);
      Object.values(m.pieges ?? {}).forEach((p) => servies.add(p));
    })));
    const inutiles = Object.keys(module.PHRASES).filter((k) => !servies.has(k));
    expect(inutiles).toEqual([]);
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));
const parConsigne = (module, classe, consigne) => toutes(module, classe).filter((m) => m.consigne === consigne);
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/** « −2,5 » → −2.5. */
const nombre = (s) => Number(String(s).replace(/−/g, '-').replace(',', '.'));
/** Tous les nombres d'un texte, signe moins typographique compris. */
const lire = (s) => (String(s).match(/−?\d+(?:,\d+)?/g) || []).map(nombre);
const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

/** La valeur d'un choix : « 10√2 », « −√3 », « m = −4 », « 57° », « 7,2 », « 3,5 € ». NaN pour un vecteur. */
function valeur(choix) {
  const s = String(choix).replace(/^m = /, '').replace(/[° €]/g, '').replace(/−/g, '-')
    .replace(',', '.');
  const r = s.match(/^(-?\d*)√(\d+)$/);
  if (r) {
    let k = Number(r[1]);
    if (r[1] === '') k = 1;
    if (r[1] === '-') k = -1;
    return k * Math.sqrt(Number(r[2]));
  }
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

/**
 * Collecte des écarts : chaque manche dont la bonne réponse ne vaut pas
 * l'attendu, ou dont un autre choix le vaut aussi. Jamais d'expect dans un if.
 */
function controler(manches, attendu, juste = (v, a) => proche(v, a)) {
  const ecarts = [];
  manches.forEach((m) => {
    const a = attendu(m);
    if (!juste(valeur(m.bonne), a, m.bonne)) ecarts.push(`${m.question} → ${m.bonne} au lieu de ${a}`);
    autres(m).forEach((c) => {
      if (juste(valeur(c), a, c)) ecarts.push(`${m.question} → le piège ${c} est juste aussi`);
    });
  });
  return ecarts;
}

/** Un arrondi : la bonne réponse l'est exactement, aucun autre choix n'est à moins d'un demi-pas. */
function arrondiJuste(manches, exact, decimales, unite = '') {
  const ecarts = [];
  const pas = 10 ** -decimales;
  manches.forEach((m) => {
    const x = exact(m);
    // Arrondi au plus proche, la moitié vers le haut (0,375 → 0,38).
    const attendu = `${(Math.round(x * 10 ** decimales) / 10 ** decimales).toFixed(decimales).replace('.', ',').replace('-', '−')}${unite}`;
    if (m.bonne !== attendu) ecarts.push(`${m.question} → ${m.bonne} au lieu de ${attendu}`);
    autres(m).forEach((c) => {
      if (Math.abs(valeur(c) - x) <= pas / 2) ecarts.push(`${m.question} → le piège ${c} est trop proche`);
    });
  });
  return ecarts;
}

/* ---------------------------------------------------- le produit scalaire */

describe('produit scalaire : chaque réponse recalculée', () => {
  const de = (consigne) => parConsigne(scalaire, 'PREMIERE', consigne);

  it('avec les coordonnées : xx′ + yy′', () => {
    expect(controler(de('coordonnees'), (m) => {
      const [a, b, c, d] = lire(m.question);
      return a * c + b * d;
    })).toEqual([]);
  });

  it('avec les normes et l’angle : ‖u‖ × ‖v‖ × cos θ', () => {
    expect(controler(de('normes-angle'), (m) => {
      const [, n1, n2, num, den] = m.question.match(/= (\d+), .*?= (\d+) et .*?= (\d*)π(?:\/(\d+))?/);
      const theta = (Number(num || 1) * Math.PI) / Number(den || 1);
      return Number(n1) * Number(n2) * Math.cos(theta);
    }, (v, a) => Math.abs(v - a) < 1e-9)).toEqual([]);
  });

  it('avec le projeté : ± AB × AH', () => {
    expect(controler(de('projete'), (m) => {
      const [, ab, ah] = m.question.match(/AB = (\d+), AH = (\d+), AC = (\d+)/).map(Number);
      return (m.question.includes('A est entre H et B') ? -1 : 1) * ab * ah;
    })).toEqual([]);
  });

  it('la polarisation', () => {
    expect(controler(de('polarisation'), (m) => {
      const [, a, b, signe, c] = m.question.match(/= (\d+), .*?= (\d+) et ‖.*? ([+−]) .*?‖ = (\d+)/);
      const [x, y, z] = [a, b, c].map(Number);
      return signe === '+' ? (z * z - x * x - y * y) / 2 : (x * x + y * y - z * z) / 2;
    })).toEqual([]);
  });

  it('le développement de ‖u ± v‖²', () => {
    expect(controler(de('developpement'), (m) => {
      const [, a, b, p, signe] = m.question.match(/= (\d+), .*?= (\d+) et .*?= (−?\d+)\.\s+‖.*? ([+−]) .*?‖² = \?/);
      const [x, y, s] = [a, b, p].map(nombre);
      return x * x + y * y + (signe === '+' ? 2 : -2) * s;
    })).toEqual([]);
  });

  it('l’orthogonalité : le produit scalaire s’annule pour la bonne valeur, et pour elle seule', () => {
    const ecarts = [];
    de('orthogonalite').forEach((m) => {
      const [, a, b, c] = m.question.match(/\((−?\d+) ; (−?\d+)\) et .*?\((−?\d+) ; m\)/).map(nombre);
      m.choix.forEach(({ cle }) => {
        const nul = a * c + b * valeur(cle) === 0;
        if (nul !== (cle === m.bonne)) ecarts.push(`${m.question} → ${cle}`);
      });
    });
    expect(ecarts).toEqual([]);
  });

  it('Al-Kashi pour une longueur, au dixième', () => {
    expect(arrondiJuste(de('al-kashi-longueur'), (m) => {
      const [, c, b, theta] = m.question.match(/AB = (\d+), AC = (\d+) et BÂC = (\d+)°/).map(Number);
      return Math.sqrt(b * b + c * c - 2 * b * c * Math.cos((theta * Math.PI) / 180));
    }, 1)).toEqual([]);
  });

  it('Al-Kashi pour un angle, au degré', () => {
    expect(arrondiJuste(de('al-kashi-angle'), (m) => {
      const [, c, b, a] = m.question.match(/AB = (\d+), AC = (\d+) et BC = (\d+)/).map(Number);
      return (Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180) / Math.PI;
    }, 0, '°')).toEqual([]);
  });
});

/* ------------------------------------------ les probabilités conditionnelles */

describe('probabilités conditionnelles : chaque réponse recalculée', () => {
  const de = (consigne) => parConsigne(conditionnelles, 'PREMIERE', consigne);
  /** « P(A) = 0,3 ; P_A(B) = 0,6 ; P_Ā(B) = 0,2. » → [0.3, 0.6, 0.2]. */
  const arbre = (q) => {
    const [, a, b, c] = q.match(/P\(A\) = ([\d,]+) ; P_A\(B\) = ([\d,]+) ; P_Ā\(B\) = ([\d,]+)\./);
    return [a, b, c].map(nombre);
  };
  const egal = (v, a) => Math.abs(v - a) < 1e-9;

  it('l’intersection : le produit le long du chemin', () => {
    expect(controler(de('intersection'), (m) => {
      const [a, b, c] = arbre(m.question);
      return m.question.includes('P(Ā ∩ B)') ? (1 - a) * c : a * b;
    }, egal)).toEqual([]);
  });

  it('les probabilités totales', () => {
    expect(controler(de('totales'), (m) => {
      const [a, b, c] = arbre(m.question);
      return a * b + (1 - a) * c;
    }, egal)).toEqual([]);
  });

  it('inverser le conditionnement sur l’arbre, au centième', () => {
    expect(arrondiJuste(de('bayes'), (m) => {
      const [a, b, c] = arbre(m.question);
      return (a * b) / (a * b + (1 - a) * c);
    }, 2)).toEqual([]);
  });

  it('P_B(A) ou P_A(B) avec l’intersection, au centième', () => {
    expect(arrondiJuste(de('inverser'), (m) => {
      const [, pa, pb, inter] = m.question.match(/P\(A\) = ([\d,]+) ; P\(B\) = ([\d,]+) ; P\(A ∩ B\) = ([\d,]+)\./).map(nombre);
      return inter / (m.question.includes('P_B(A) =') ? pb : pa);
    }, 2)).toEqual([]);
  });

  it('la notation : le groupe de référence est la condition', () => {
    // Ce qui suit « parmi les… » ou « les jours de… » : l'événement en indice.
    const conditionPremier = /parmi les internes|parmi les personnes malades|parmi les pièces fabriquées de nuit|parmi les moins de vingt-cinq ans|Les jours de vent/;
    const conditionSecond = /parmi les élèves qui font du sport|parmi les personnes au test positif|parmi les pièces défectueuses|parmi les lecteurs d’un quotidien|Les jours où le ferry est en retard/;
    const ecarts = [];
    de('notation').forEach((m) => {
      const [A, B] = [...m.question.matchAll(/([A-Z]) : «/g)].map((x) => x[1]);
      let attendu = `P(${A} ∩ ${B})`;
      if (conditionPremier.test(m.question)) attendu = `P_${A}(${B})`;
      if (conditionSecond.test(m.question)) attendu = `P_${B}(${A})`;
      if (m.bonne !== attendu) ecarts.push(`${m.question} → ${m.bonne}`);
    });
    expect(ecarts).toEqual([]);
  });

  it('l’indépendance : P(A ∩ B) = P(A) × P(B), et rien d’autre', () => {
    const ecarts = [];
    de('independance').forEach((m) => {
      const [a, b, inter] = lire(m.question);
      const attendu = Math.abs(inter - a * b) < 1e-9 ? 'Oui' : 'Non';
      if (m.bonne !== attendu) ecarts.push(`${m.question} → ${m.bonne}`);
    });
    expect(ecarts).toEqual([]);
  });

  it('calculer avec l’indépendance', () => {
    expect(controler(de('independance-calcul'), (m) => {
      const [a, b] = lire(m.question);
      return m.question.includes('P(A ∩ B) = ?') ? a * b : a + b - a * b;
    }, egal)).toEqual([]);
  });

  it('deux épreuves indépendantes', () => {
    expect(controler(de('deux-epreuves'), (m) => {
      const [p] = lire(m.question);
      if (m.question.includes('exactement une fois')) return 2 * p * (1 - p);
      if (m.question.includes('les deux fois')) return p * p;
      expect(m.question).toContain('au moins une fois');
      return 1 - (1 - p) * (1 - p);
    }, egal)).toEqual([]);
  });
});

/* -------------------------------------------------- les variables aléatoires */

/** Le tableau de la loi : [valeurs, probabilités] (null pour « ? »). */
function loi(question) {
  const ligne = (debut) => question.split('\n').find((l) => l.startsWith(debut)).split(' : ')[1].split(' | ');
  const xs = ligne('Valeurs de X').map(nombre);
  const ps = ligne('Probabilités').map((p) => (p === '?' ? null : nombre(p)));
  return [xs, ps];
}
const somme = (liste) => liste.reduce((s, x) => s + x, 0);
const egal = (v, a) => Math.abs(v - a) < 1e-9;

describe.each(va.CLASSES)('variables aléatoires en %s : chaque réponse recalculée', (classe) => {
  const de = (consigne) => parConsigne(va, classe, consigne);

  it('chaque loi affichée est une loi : probabilités positives, de somme un', () => {
    const ecarts = [];
    toutes(va, classe).filter((m) => m.question.includes('Valeurs de X')).forEach((m) => {
      const [xs, ps] = loi(m.question);
      if (xs.length !== ps.length) ecarts.push(m.question);
      if (!ps.includes(null) && !egal(somme(ps), 1)) ecarts.push(m.question);
      if (ps.some((p) => p !== null && (p <= 0 || p >= 1))) ecarts.push(m.question);
    });
    expect(ecarts).toEqual([]);
  });

  it('la probabilité manquante', () => {
    expect(controler(de('manquante'), (m) => 1 - somme(loi(m.question)[1].filter((p) => p !== null)), egal)).toEqual([]);
  });

  it('les notations P(X ≤ a)…', () => {
    expect(controler(de('notations'), (m) => {
      const [xs, ps] = loi(m.question);
      const [, op, a] = m.question.match(/P\(X ([≤<≥>]) (−?\d+)\) = \?/);
      const seuil = nombre(a);
      const ok = {
        '≤': (x) => x <= seuil, '<': (x) => x < seuil, '≥': (x) => x >= seuil, '>': (x) => x > seuil,
      }[op];
      return somme(ps.filter((_, i) => ok(xs[i])));
    }, egal)).toEqual([]);
  });

  it('la loi d’un jeu : l’urne', () => {
    expect(controler(de('urne'), (m) => {
      const [total, rouges, vertes, noires, gr, gv, perte] = lire(m.question);
      const [cible] = lire(m.question.split('P(X = ')[1]);
      expect(rouges + vertes + noires).toBe(total);
      const nombres = { [gr]: rouges, [gv]: vertes, [-perte]: noires };
      return nombres[cible] / total;
    }, egal)).toEqual([]);
  });

  it('l’espérance', () => {
    expect(controler(de('esperance'), (m) => {
      const [xs, ps] = loi(m.question);
      return somme(xs.map((x, i) => x * ps[i]));
    }, egal)).toEqual([]);
  });

  it('le jeu favorable, défavorable ou équitable', () => {
    const ecarts = [];
    de('favorable').forEach((m) => {
      const deux = m.question.includes('un 4 ou un 5');
      const nombres = lire(m.question.replace('six faces', '').replace(/un [4-6]/g, ''));
      const [g1, g2, perte] = nombres;
      const e = (g1 + (deux ? 2 : 1) * g2 - (deux ? 3 : 4) * perte) / 6;
      let attendu = 'Équitable';
      if (e > 1e-12) attendu = 'Favorable au joueur';
      if (e < -1e-12) attendu = 'Défavorable au joueur';
      if (m.bonne !== attendu) ecarts.push(`${m.question} → ${m.bonne}`);
    });
    expect(ecarts).toEqual([]);
  });

  it('le gain net, mise déduite', () => {
    expect(controler(de('gain-net'), (m) => {
      const [mise, g1, p1, g2, p2] = lire(m.question);
      return g1 * p1 + g2 * p2 - mise;
    }, egal)).toEqual([]);
  });

  it('la mise équitable', () => {
    expect(controler(de('mise'), (m) => {
      const [g1, p1, g2, p2] = lire(m.question);
      return g1 * p1 + g2 * p2;
    }, egal)).toEqual([]);
  });

  it('la variance, et l’espérance qui l’accompagne', () => {
    const ecarts = [];
    de('variance').forEach((m) => {
      const [xs, ps] = loi(m.question);
      const e = somme(xs.map((x, i) => x * ps[i]));
      const [eAffichee] = lire(m.question.split('E(X) = ')[1]);
      if (!egal(e, eAffichee)) ecarts.push(`${m.question} : E(X) affichée fausse`);
    });
    expect(ecarts).toEqual([]);
    expect(controler(de('variance'), (m) => {
      const [xs, ps] = loi(m.question);
      const e = somme(xs.map((x, i) => x * ps[i]));
      return somme(xs.map((x, i) => (x - e) ** 2 * ps[i]));
    }, egal)).toEqual([]);
  });

  it('la linéarité', () => {
    expect(controler(de('linearite'), (m) => {
      const [, quoi, v, a, signe, b] = m.question.match(/^([EV])\(X\) = (−?\d+)\.\s+[EV]\((−?\d+)X ([+−]) (\d+)\) = \?$/);
      const [x, coef, cste] = [nombre(v), nombre(a), nombre(b) * (signe === '+' ? 1 : -1)];
      return quoi === 'E' ? coef * x + cste : coef * coef * x;
    })).toEqual([]);
  });

  it('les classes ont leurs manches : la variance et la linéarité seulement en 1re générale', () => {
    const sortes = new Set(toutes(va, classe).map((m) => m.consigne));
    expect(sortes.has('variance')).toBe(classe === 'PREMIERE');
    expect(sortes.has('linearite')).toBe(classe === 'PREMIERE');
    expect(sortes.has('esperance')).toBe(true);
  });
});

/* ------------------------------------------------------- vrai, faux, réciproque */

/** Les propositions, et leur vérité sur un balayage : réels, entiers naturels, couples. */
const REELS = Array.from({ length: 161 }, (_, i) => -10 + i / 8);
const ENTIERS = Array.from({ length: 301 }, (_, i) => i);
const COUPLES = REELS.filter((_, i) => i % 4 === 0).flatMap((a) => REELS.filter((_, i) => i % 4 === 0).map((b) => [a, b]));
const DOMAINES = { 'x réel': REELS, 'n entier naturel': ENTIERS, 'a et b réels': COUPLES };

const PREDICATS = {
  'x = 3': (x) => x === 3,
  'x ≠ 3': (x) => x !== 3,
  'x² = 9': (x) => x * x === 9,
  'x² ≠ 9': (x) => x * x !== 9,
  'x > 2': (x) => x > 2,
  'x ≤ 2': (x) => x <= 2,
  'x > 1': (x) => x > 1,
  'x ≤ 1': (x) => x <= 1,
  'x² = 4': (x) => x * x === 4,
  'x² ≠ 4': (x) => x * x !== 4,
  'x = 2': (x) => x === 2,
  'x ≠ 2': (x) => x !== 2,
  'x < 3': (x) => x < 3,
  'x ≥ 3': (x) => x >= 3,
  'x² < 9': (x) => x * x < 9,
  'x² ≥ 9': (x) => x * x >= 9,
  'x ≥ 1': (x) => x >= 1,
  'x < 1': (x) => x < 1,
  'x² ≥ 1': (x) => x * x >= 1,
  'x² < 1': (x) => x * x < 1,
  'n est un multiple de 4': (n) => n % 4 === 0,
  'n n’est pas un multiple de 4': (n) => n % 4 !== 0,
  'n est pair': (n) => n % 2 === 0,
  'n est impair': (n) => n % 2 === 1,
  'n² est pair': (n) => (n * n) % 2 === 0,
  'n² est impair': (n) => (n * n) % 2 === 1,
  'n est divisible par 6': (n) => n % 6 === 0,
  'n n’est pas divisible par 6': (n) => n % 6 !== 0,
  'n est divisible par 3': (n) => n % 3 === 0,
  'n n’est pas divisible par 3': (n) => n % 3 !== 0,
  'n se termine par 5': (n) => n % 10 === 5,
  'n ne se termine pas par 5': (n) => n % 10 !== 5,
  'n est divisible par 5': (n) => n % 5 === 0,
  'n n’est pas divisible par 5': (n) => n % 5 !== 0,
  'ab = 0': ([a, b]) => a * b === 0,
  'ab ≠ 0': ([a, b]) => a * b !== 0,
  'a = 0': ([a]) => a === 0,
  'a ≠ 0': ([a]) => a !== 0,
  'a² = b²': ([a, b]) => a * a === b * b,
  'a² ≠ b²': ([a, b]) => a * a !== b * b,
  'a = b': ([a, b]) => a === b,
  'a ≠ b': ([a, b]) => a !== b,
};

/** La géométrie ne se balaie pas : théorèmes du cours, recopiés ici. [P ⇒ Q, Q ⇒ P]. */
const GEOMETRIE = {
  'ABCD est un carré ⇒ ABCD est un rectangle': [true, false],
  'ABC est rectangle en A ⇒ BC² = AB² + AC²': [true, true],
  'ABCD est un parallélogramme ⇒ [AC] et [BD] ont le même milieu': [true, true],
  'ABCD est un losange ⇒ (AC) et (BD) sont perpendiculaires': [true, false],
};
const NEGATION_GEOMETRIE = {
  'ABCD est un carré': 'ABCD n’est pas un carré',
  'ABCD est un rectangle': 'ABCD n’est pas un rectangle',
  'ABC est rectangle en A': 'ABC n’est pas rectangle en A',
  'BC² = AB² + AC²': 'BC² ≠ AB² + AC²',
  'ABCD est un parallélogramme': 'ABCD n’est pas un parallélogramme',
  '[AC] et [BD] ont le même milieu': '[AC] et [BD] n’ont pas le même milieu',
  'ABCD est un losange': 'ABCD n’est pas un losange',
  '(AC) et (BD) sont perpendiculaires': '(AC) et (BD) ne sont pas perpendiculaires',
};

/** « P ⇒ Q » est-elle vraie dans ce cadre ? */
function implique(cadre, p, q) {
  const cle = `${p} ⇒ ${q}`;
  const inverse = `${q} ⇒ ${p}`;
  if (cle in GEOMETRIE) return GEOMETRIE[cle][0];
  if (inverse in GEOMETRIE) return GEOMETRIE[inverse][1];
  expect(PREDICATS[p]).toBeDefined();
  expect(PREDICATS[q]).toBeDefined();
  return DOMAINES[cadre].every((v) => !PREDICATS[p](v) || PREDICATS[q](v));
}

/** B est-elle bien la négation de A ? */
function nie(cadre, a, b) {
  if (a in NEGATION_GEOMETRIE) return NEGATION_GEOMETRIE[a] === b;
  return DOMAINES[cadre].every((v) => PREDICATS[a](v) !== PREDICATS[b](v));
}

/** « « Si P, alors Q » (cadre) » → [P, Q, cadre]. */
const lireImplication = (q) => {
  const [, p, c, cadre] = q.match(/« Si (.+?), alors (.+?) » \((.+?)\)/);
  return [p, c, cadre];
};
const lireSi = (s) => s.match(/^Si (.+), alors (.+)$/).slice(1);

describe.each(logique.CLASSES)('vrai, faux, réciproque en %s : chaque réponse revérifiée', (classe) => {
  const de = (consigne) => parConsigne(logique, classe, consigne);

  it('la banque d’implications : chaque vérité annoncée est la vraie', () => {
    const ecarts = logique.IMPLICATIONS.filter((f) => implique(f.cadre, f.p, f.q) !== f.directe
      || implique(f.cadre, f.q, f.p) !== f.reciproque
      || !nie(f.cadre, f.p, f.nonP) || !nie(f.cadre, f.q, f.nonQ)).map((f) => f.p);
    expect(ecarts).toEqual([]);
    // Aucune implication fausse dans les deux sens : nécessaire ou suffisante a toujours un sens.
    expect(logique.IMPLICATIONS.filter((f) => !f.directe && !f.reciproque)).toEqual([]);
  });

  it('la réciproque échange, sans nier', () => {
    const ecarts = [];
    de('reciproque').forEach((m) => {
      const [p, q, cadre] = lireImplication(m.question);
      if (implique(cadre, p, q) && implique(cadre, q, p)) ecarts.push(`équivalence, les choix se confondent : ${m.question}`);
      if (m.bonne !== `Si ${q}, alors ${p}`) ecarts.push(m.question);
      autres(m).forEach((c) => { if (c === `Si ${q}, alors ${p}`) ecarts.push(c); });
    });
    expect(ecarts).toEqual([]);
  });

  it('la contraposée échange ET nie', () => {
    const ecarts = [];
    de('contraposee').forEach((m) => {
      const [p, q, cadre] = lireImplication(m.question);
      if (implique(cadre, p, q) && implique(cadre, q, p)) ecarts.push(`équivalence, les choix se confondent : ${m.question}`);
      const [h, c] = lireSi(m.bonne);
      if (!nie(cadre, q, h) || !nie(cadre, p, c)) ecarts.push(`${m.question} → ${m.bonne}`);
      autres(m).forEach((x) => {
        const [h2, c2] = lireSi(x);
        if (nie(cadre, q, h2) && nie(cadre, p, c2)) ecarts.push(`${m.question} → piège ${x} juste`);
      });
    });
    expect(ecarts).toEqual([]);
  });

  it('vraie ou fausse : implication, réciproque, contraposée', () => {
    const ecarts = [];
    de('verite').forEach((m) => {
      const [p, q, cadre] = lireImplication(m.question);
      let vraie = implique(cadre, p, q);
      if (m.question.includes('Sa réciproque')) vraie = implique(cadre, q, p);
      if (m.bonne !== (vraie ? 'Vraie' : 'Fausse')) ecarts.push(`${m.question} → ${m.bonne}`);
      // L'état annoncé de l'implication est juste.
      if (m.question.includes(' est vraie.') && !implique(cadre, p, q)) ecarts.push(m.question);
      if (m.question.includes(' est fausse.') && implique(cadre, p, q)) ecarts.push(m.question);
    });
    expect(ecarts).toEqual([]);
  });

  it('nécessaire, suffisante, ou les deux', () => {
    const ecarts = [];
    de('necessaire').forEach((m) => {
      const [, but, condition, cadre] = m.question.match(/Pour avoir « (.+?) », la condition « (.+?) » est… {3}\((.+)\)/);
      const suffit = implique(cadre, condition, but);
      const faut = implique(cadre, but, condition);
      let attendu = 'Nécessaire et suffisante';
      if (suffit && !faut) attendu = 'Suffisante, pas nécessaire';
      if (faut && !suffit) attendu = 'Nécessaire, pas suffisante';
      if (!suffit && !faut) attendu = '(aucune)';
      if (m.bonne !== attendu) ecarts.push(`${m.question} → ${m.bonne}`);
    });
    expect(ecarts).toEqual([]);
  });

  it('le contre-exemple contredit la proposition, les autres choix non', () => {
    const premier = (n) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every((d) => n % d !== 0);
    const couple = (s) => lire(s);
    const VERIFIE = {
      'Pour tout réel x, x² ≥ x.': (s) => nombre(s) ** 2 >= nombre(s),
      'Pour tout réel x, x² > 0.': (s) => nombre(s) ** 2 > 0,
      'Pour tout entier naturel n, n² + n + 41 est un nombre premier.': (s) => premier(nombre(s) ** 2 + nombre(s) + 41),
      'Pour tout réel x, √(x²) = x.': (s) => Math.sqrt(nombre(s) ** 2) === nombre(s),
      'Pour tout entier naturel n, 2ⁿ > n².': (s) => 2 ** nombre(s) > nombre(s) ** 2,
      'Pour tout réel x non nul, 1/x ≤ 1.': (s) => 1 / nombre(s) <= 1,
      'Pour tout réel x, si x² > 4, alors x > 2.': (s) => !(nombre(s) ** 2 > 4) || nombre(s) > 2,
      'Pour tout réel x, x³ ≥ x².': (s) => nombre(s) ** 3 >= nombre(s) ** 2,
      'Pour tous réels positifs a et b, √(a + b) = √a + √b.': (s) => {
        const [a, b] = couple(s);
        return Math.abs(Math.sqrt(a + b) - Math.sqrt(a) - Math.sqrt(b)) < 1e-12;
      },
      'Pour tout entier naturel n, n² − n est un multiple de 4.': (s) => (nombre(s) ** 2 - nombre(s)) % 4 === 0,
      'Pour tous réels a et b, (a + b)² = a² + b².': (s) => {
        const [a, b] = couple(s);
        return (a + b) ** 2 === a * a + b * b;
      },
    };
    const ecarts = [];
    de('contre-exemple').forEach((m) => {
      const verifie = VERIFIE[m.question];
      if (!verifie) {
        ecarts.push(`proposition inconnue du test : ${m.question}`);
        return;
      }
      if (verifie(m.bonne)) ecarts.push(`${m.question} → ${m.bonne} n’est pas un contre-exemple`);
      autres(m).forEach((c) => { if (!verifie(c)) ecarts.push(`${m.question} → ${c} en est un aussi`); });
    });
    expect(ecarts).toEqual([]);
    // Toute la banque, pas seulement ce que les graines ont tiré.
    const banque = [];
    logique.CONTRE_EXEMPLES.forEach((item) => {
      const verifie = VERIFIE[item.enonce];
      item.ce.forEach((c) => { if (!verifie || verifie(c)) banque.push(`${item.enonce} → ${c}`); });
      item.non.forEach(([c]) => { if (!verifie || !verifie(c)) banque.push(`${item.enonce} → ${c}`); });
    });
    expect(banque).toEqual([]);
  });

  it('la négation : la bonne, et seulement elle', () => {
    // Les connecteurs se vérifient sur une grille ; les quantificateurs, par la table du cours.
    const GRILLE = REELS.filter((_, i) => i % 2 === 0).flatMap((x) => REELS.filter((_, i) => i % 8 === 0).map((y) => [x, y]));
    const CONNECTEURS = {
      'x ≥ 2 et y ≥ 2': ([x, y]) => x >= 2 && y >= 2,
      'x < 2 ou y < 2': ([x, y]) => x < 2 || y < 2,
      'x < 2 et y < 2': ([x, y]) => x < 2 && y < 2,
      'x ≤ 2 ou y ≤ 2': ([x, y]) => x <= 2 || y <= 2,
      'n est pair ou n est un multiple de 3': ([n]) => n % 2 === 0 || n % 3 === 0,
      'n est impair et n n’est pas un multiple de 3': ([n]) => n % 2 !== 0 && n % 3 !== 0,
      'n est impair ou n n’est pas un multiple de 3': ([n]) => n % 2 !== 0 || n % 3 !== 0,
      'n est impair et n est un multiple de 3': ([n]) => n % 2 !== 0 && n % 3 === 0,
      'x < 0 ou x > 5': ([x]) => x < 0 || x > 5,
      'x ≥ 0 et x ≤ 5': ([x]) => x >= 0 && x <= 5,
      'x ≥ 0 ou x ≤ 5': ([x]) => x >= 0 || x <= 5,
      'x > 0 et x < 5': ([x]) => x > 0 && x < 5,
    };
    const ENTIERS_GRILLE = ENTIERS.map((n) => [n]);
    const QUANTIFIEES = {
      'Pour tout réel x, x² ≥ 0.': 'Il existe un réel x tel que x² < 0',
      'Il existe un entier n tel que n² = 2.': 'Pour tout entier n, n² ≠ 2',
      'Pour tout réel x, f(x) ≤ 5.': 'Il existe un réel x tel que f(x) > 5',
      'Tous les élèves de la classe ont la moyenne.': 'Au moins un élève n’a pas la moyenne',
      'Il existe un réel x tel que eˣ < 0.': 'Pour tout réel x, eˣ ≥ 0',
      'Pour tout entier n, n² + n est pair.': 'Il existe un entier n tel que n² + n soit impair',
      'Il existe un réel x tel que x² = −1.': 'Pour tout réel x, x² ≠ −1',
    };
    const ecarts = [];
    de('negation').forEach((m) => {
      const cite = m.question.match(/« (.+) »/);
      if (cite) {
        const enonce = CONNECTEURS[cite[1]];
        const grille = cite[1].startsWith('n ') ? ENTIERS_GRILLE : GRILLE;
        const estNegation = (s) => grille.every((v) => CONNECTEURS[s](v) !== enonce(v));
        if (!estNegation(m.bonne)) ecarts.push(`${m.question} → ${m.bonne}`);
        autres(m).forEach((c) => { if (estNegation(c)) ecarts.push(`${m.question} → piège ${c} juste`); });
      } else {
        if (classe === 'PREMIERE_TECHNO') ecarts.push(`quantificateur en 1re techno : ${m.question}`);
        if (QUANTIFIEES[m.question] !== m.bonne) ecarts.push(`${m.question} → ${m.bonne}`);
        // La bonne négation change le quantificateur.
        const dual = m.question.startsWith('Pour tout') || m.question.startsWith('Tous') ? /^(Il existe|Au moins)/ : /^Pour tout/;
        if (!dual.test(m.bonne)) ecarts.push(`${m.question} → ${m.bonne}`);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('le statut d’une lettre', () => {
    const ATTENDU = {
      'On résout l’équation 3x + 5 = 11. Ici, x est…': 'une inconnue',
      'La fonction f est définie sur ℝ par f(x) = x² + 1. Ici, x est…': 'une variable',
      'Pour chaque réel m, on trace la droite d’équation y = mx + 2. Ici, m est…': 'un paramètre',
      'On résout x² − mx + 1 = 0 selon les valeurs du réel m. Ici, m est…': 'un paramètre',
      'On résout x² − mx + 1 = 0 selon les valeurs du réel m. Ici, x est…': 'une inconnue',
      'La fonction g est définie sur [0 ; 10] par g(t) = 5t − 3. Ici, t est…': 'une variable',
      'On cherche l’entier n tel que 2n + 7 = 31. Ici, n est…': 'une inconnue',
      'Pour chaque réel a, on étudie la fonction x ↦ ax². Ici, a est…': 'un paramètre',
      'Pour chaque réel a, on étudie la fonction x ↦ ax². Ici, x est…': 'une variable',
    };
    const ecarts = de('statut').filter((m) => ATTENDU[m.question] !== m.bonne).map((m) => m.question);
    expect(ecarts).toEqual([]);
  });

  it('identité ou équation : une identité est vraie pour tous les x essayés', () => {
    const MEMBRES = {
      '(x + 1)² = x² + 2x + 1': [(x) => (x + 1) ** 2, (x) => x * x + 2 * x + 1],
      '(x + 1)² = 4': [(x) => (x + 1) ** 2, () => 4],
      'x² − 1 = (x − 1)(x + 1)': [(x) => x * x - 1, (x) => (x - 1) * (x + 1)],
      'x² − 1 = 0': [(x) => x * x - 1, () => 0],
      '2(x + 3) = 2x + 6': [(x) => 2 * (x + 3), (x) => 2 * x + 6],
      '2(x + 3) = x + 6': [(x) => 2 * (x + 3), (x) => x + 6],
      '(x − 2)² = x² − 4x + 4': [(x) => (x - 2) ** 2, (x) => x * x - 4 * x + 4],
      '(x − 2)² = x² + 4': [(x) => (x - 2) ** 2, (x) => x * x + 4],
      'x(x + 3) = x² + 3x': [(x) => x * (x + 3), (x) => x * x + 3 * x],
      '(x + 3)² = x² + 9': [(x) => (x + 3) ** 2, (x) => x * x + 9],
    };
    const ecarts = [];
    de('identite').forEach((m) => {
      const egalite = m.question.match(/« (.+) »/)[1];
      const [g, d] = MEMBRES[egalite] ?? [];
      if (!g) {
        ecarts.push(`égalité inconnue du test : ${egalite}`);
        return;
      }
      const partout = REELS.every((x) => Math.abs(g(x) - d(x)) < 1e-9);
      if (m.bonne !== (partout ? 'Une identité' : 'Une équation')) ecarts.push(`${egalite} → ${m.bonne}`);
    });
    expect(ecarts).toEqual([]);
  });
});

/* --------------------------------------------------------- les listes en Python */

/**
 * UN PETIT INTERPRÉTEUR PYTHON — juste ce qu'il faut : entiers, listes (en
 * extension et en compréhension), range, len, print, indices (négatifs
 * compris), append, remove, pop, for, if, + − * // % et les comparaisons.
 * Une erreur d'indice rend « IndexError », comme Python.
 */
class ErreurPython extends Error {}

function jetons(ligne) {
  const motif = /\s*(\d+|[A-Za-z_]\w*|==|!=|<=|>=|\/\/|[-+*%<>()[\]=,:.])/y;
  const liste = [];
  motif.lastIndex = 0;
  while (motif.lastIndex < ligne.length) {
    if (/^\s*$/.test(ligne.slice(motif.lastIndex))) break;
    const m = motif.exec(ligne);
    if (!m) throw new Error(`jeton illisible dans : ${ligne}`);
    liste.push(m[1]);
  }
  return liste;
}

function analyser(lignes) {
  let k = 0;
  function expression(js) {
    let i = 0;
    const voir = () => js[i];
    const prendre = (attendu) => {
      const j = js[i];
      if (attendu !== undefined && j !== attendu) throw new Error(`attendu ${attendu}, lu ${j}`);
      i += 1;
      return j;
    };
    function primaire() {
      const j = prendre();
      if (/^\d+$/.test(j)) return { n: Number(j) };
      if (j === '(') {
        const e = comparaison();
        prendre(')');
        return e;
      }
      if (j === '-') return { op: 'neg', a: postfixe(primaire()) };
      if (j === '[') {
        if (voir() === ']') {
          prendre(']');
          return { liste: [] };
        }
        const premier = comparaison();
        if (voir() === 'for') {
          prendre('for');
          const nom = prendre();
          prendre('in');
          const source = comparaison();
          let filtre = null;
          if (voir() === 'if') {
            prendre('if');
            filtre = comparaison();
          }
          prendre(']');
          return {
            compr: premier, nom, source, filtre,
          };
        }
        const elements = [premier];
        while (voir() === ',') {
          prendre(',');
          elements.push(comparaison());
        }
        prendre(']');
        return { liste: elements };
      }
      return { nom: j };
    }
    function postfixe(base) {
      let e = base;
      for (;;) {
        if (voir() === '[') {
          prendre('[');
          const ind = comparaison();
          prendre(']');
          e = { indice: e, ind };
        } else if (voir() === '(') {
          prendre('(');
          const args = [];
          while (voir() !== ')') {
            args.push(comparaison());
            if (voir() === ',') prendre(',');
          }
          prendre(')');
          e = { appel: e, args };
        } else if (voir() === '.') {
          prendre('.');
          e = { methode: prendre(), de: e };
        } else return e;
      }
    }
    function unaire() {
      return postfixe(primaire());
    }
    function produit() {
      let e = unaire();
      while (['*', '//', '%'].includes(voir())) e = { op: prendre(), a: e, b: unaire() };
      return e;
    }
    function sommeExpr() {
      let e = produit();
      while (['+', '-'].includes(voir())) e = { op: prendre(), a: e, b: produit() };
      return e;
    }
    function comparaison() {
      let e = sommeExpr();
      while (['==', '!=', '<', '>', '<=', '>='].includes(voir())) e = { op: prendre(), a: e, b: sommeExpr() };
      return e;
    }
    const e = comparaison();
    if (i !== js.length) throw new Error(`reste illisible : ${js.slice(i).join(' ')}`);
    return e;
  }
  const marge = (l) => l.match(/^ */)[0].length;
  function bloc(niveau) {
    const instructions = [];
    while (k < lignes.length && marge(lignes[k]) === niveau) {
      const js = jetons(lignes[k]);
      k += 1;
      if (js[0] === 'for') {
        const fin = js.lastIndexOf(':');
        instructions.push({
          pour: js[1], dans: expression(js.slice(3, fin)), corps: bloc(marge(lignes[k])),
        });
      } else if (js[0] === 'if') {
        instructions.push({ si: expression(js.slice(1, js.lastIndexOf(':'))), corps: bloc(marge(lignes[k])) });
      } else if (js.includes('=')) {
        const eg = js.indexOf('=');
        instructions.push({ cible: expression(js.slice(0, eg)), valeur: expression(js.slice(eg + 1)) });
      } else instructions.push({ expr: expression(js) });
    }
    if (k < lignes.length && marge(lignes[k]) > niveau) throw new Error(`indentation inattendue : ${lignes[k]}`);
    return instructions;
  }
  return bloc(0);
}

const ecrirePython = (v) => (Array.isArray(v) ? `[${v.map(ecrirePython).join(', ')}]` : String(v));

function executer(programme) {
  const env = {};
  const sortie = [];
  const position = (liste, i) => {
    const j = i < 0 ? liste.length + i : i;
    if (j < 0 || j >= liste.length) throw new ErreurPython('IndexError');
    return j;
  };
  function evaluer(e) {
    if ('n' in e) return e.n;
    if ('liste' in e) return e.liste.map(evaluer);
    if ('compr' in e) {
      const resultat = [];
      evaluer(e.source).forEach((v) => {
        env[e.nom] = v;
        if (!e.filtre || evaluer(e.filtre)) resultat.push(evaluer(e.compr));
      });
      return resultat;
    }
    if ('nom' in e) {
      if (!(e.nom in env)) throw new Error(`variable inconnue ${e.nom}`);
      return env[e.nom];
    }
    if ('indice' in e) {
      const liste = evaluer(e.indice);
      return liste[position(liste, evaluer(e.ind))];
    }
    if ('appel' in e) {
      const args = e.args.map(evaluer);
      if ('methode' in e.appel) {
        const liste = evaluer(e.appel.de);
        if (e.appel.methode === 'append') return liste.push(args[0]) && null;
        if (e.appel.methode === 'remove') {
          const j = liste.indexOf(args[0]);
          if (j === -1) throw new ErreurPython('ValueError');
          liste.splice(j, 1);
          return null;
        }
        if (e.appel.methode === 'pop') return liste.splice(position(liste, args.length ? args[0] : -1), 1)[0];
        throw new Error(`méthode inconnue ${e.appel.methode}`);
      }
      const f = e.appel.nom;
      if (f === 'range') {
        const [a, b] = args.length === 1 ? [0, args[0]] : args;
        return Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
      }
      if (f === 'len') return args[0].length;
      if (f === 'print') {
        sortie.push(ecrirePython(args[0]));
        return null;
      }
      throw new Error(`fonction inconnue ${f}`);
    }
    if (e.op === 'neg') return -evaluer(e.a);
    const [a, b] = [evaluer(e.a), evaluer(e.b)];
    switch (e.op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '//': return Math.floor(a / b);
      case '%': return ((a % b) + b) % b;
      case '==': return a === b;
      case '!=': return a !== b;
      case '<': return a < b;
      case '>': return a > b;
      case '<=': return a <= b;
      case '>=': return a >= b;
      default: throw new Error(`opération inconnue ${e.op}`);
    }
  }
  function lancer(instructions) {
    instructions.forEach((ins) => {
      if ('pour' in ins) {
        [...evaluer(ins.dans)].forEach((v) => {
          env[ins.pour] = v;
          lancer(ins.corps);
        });
      } else if ('si' in ins) {
        if (evaluer(ins.si)) lancer(ins.corps);
      } else if ('cible' in ins) {
        const v = evaluer(ins.valeur);
        if ('nom' in ins.cible) env[ins.cible.nom] = v;
        else {
          const liste = evaluer(ins.cible.indice);
          liste[position(liste, evaluer(ins.cible.ind))] = v;
        }
      } else evaluer(ins.expr);
    });
  }
  try {
    lancer(programme);
  } catch (err) {
    if (err instanceof ErreurPython) return err.message;
    throw err;
  }
  return sortie.join('\n');
}

const python = (texte) => executer(analyser(texte.split('\n')));

describe('le petit interpréteur Python lui-même', () => {
  it('donne ce que donnerait Python', () => {
    expect(python('L = [4, 9, 2]\nprint(L[-1])')).toBe('2');
    expect(python('L = [4, 9, 2]\nprint(L[3])')).toBe('IndexError');
    expect(python('L = [2 * k + 1 for k in range(4)]\nprint(L)')).toBe('[1, 3, 5, 7]');
    expect(python('L = [k for k in range(10) if k % 3 == 0]\nprint(L)')).toBe('[0, 3, 6, 9]');
    expect(python('L = [1]\nfor i in range(3):\n    L.append(L[-1] * 2)\nprint(L)')).toBe('[1, 2, 4, 8]');
    expect(python('L = [5, 3, 5, 1]\nL.remove(5)\nprint(L)')).toBe('[3, 5, 1]');
    expect(python('L = [5, 3, 8]\nL.pop(1)\nprint(L)')).toBe('[5, 8]');
    expect(python('L = [5, 3, 8]\nx = L.pop()\nprint(x)')).toBe('8');
    expect(python('c = 0\nL = [3, 8, 5]\nfor x in L:\n    if x > 4:\n        c = c + 1\nprint(c)')).toBe('2');
    expect(python('L = [7, 1]\nL[-1] = 9\nprint(L)')).toBe('[7, 9]');
  });
});

describe.each(listes.CLASSES)('listes en Python en %s : chaque programme exécuté', (classe) => {
  it('la bonne réponse est ce qu’affiche le programme, et aucun piège ne l’est', () => {
    const ecarts = [];
    toutes(listes, classe).forEach((m) => {
      const sortie = python(m.question);
      if (sortie !== m.bonne) ecarts.push(`${m.question}\n→ ${m.bonne} au lieu de ${sortie}`);
      autres(m).forEach((c) => { if (c === sortie) ecarts.push(`${m.question}\n→ le piège ${c} est juste`); });
    });
    expect(ecarts).toEqual([]);
  });

  it('les programmes ont deux à six lignes, indentées de quatre espaces', () => {
    const ecarts = [];
    toutes(listes, classe).forEach((m) => {
      const lignes = m.question.split('\n');
      if (lignes.length < 2 || lignes.length > 6) ecarts.push(m.question);
      lignes.forEach((l) => { if (l.match(/^ */)[0].length % 4 !== 0) ecarts.push(l); });
    });
    expect(ecarts).toEqual([]);
  });

  it('chaque sorte de manche apparaît', () => {
    const sortes = new Set(toutes(listes, classe).map((m) => m.consigne));
    ['indice', 'longueur', 'comprehension', 'ajouts', 'modification', 'supprimer', 'parcours']
      .forEach((s) => expect(sortes.has(s)).toBe(true));
  });
});
