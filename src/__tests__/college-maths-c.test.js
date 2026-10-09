/**
 * LES JEUX DE MATHS DU COLLÈGE, LOT C — Nora, de la 6e à la 3e.
 *
 * Sept modules : le miroir (transformations), le robot (algorithmique), le
 * sac de billes (probabilités), la tour des puissances, la machine à x
 * (calcul littéral), l'ascenseur (opérations sur les relatifs) et la droite
 * des relatifs. Pour chacun, et pour chaque classe qu'il couvre, soixante
 * parties : la forme des manches, les phrases, la reproductibilité, puis
 * l'EXACTITUDE — chaque bonne réponse est recalculée ici, à partir de la
 * question affichée, par un calcul indépendant de celui du module, et aucun
 * piège ne doit être juste lui aussi.
 */

import * as miroir from '../lib/jeux/college/miroir-college';
import * as robot from '../lib/jeux/college/robot-college';
import * as billes from '../lib/jeux/college/sac-de-billes-college';
import * as puissances from '../lib/jeux/college/tour-des-puissances';
import * as machine from '../lib/jeux/college/machine-a-x';
import * as ascenseur from '../lib/jeux/college/ascenseur-des-relatifs';
import * as droite from '../lib/jeux/college/droite-des-relatifs';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes du référentiel (competences-college.txt, mathématiques) que ce lot peut citer. */
const COMPETENCES = new Set([
  'MATH_6E_ALG_INCONNUE', 'MATH_6E_ALG_MOTIFS', 'MATH_6E_ALGO_DEPLACEMENT', 'MATH_6E_GEO_VOCABULAIRE',
  'MATH_6E_GEO_PERPENDICULAIRE', 'MATH_6E_GEO_PARALLELE', 'MATH_6E_GEO_SYMETRIE',
  'MATH_5E_ALGO_BOUCLE', 'MATH_5E_GEO_SYM_CENTRALE', 'MATH_5E_GEO_PARALLELO', 'MATH_5E_PROBA_INTRO',
  'MATH_5E_REL_SENS', 'MATH_5E_REL_ADD', 'MATH_5E_LITT_EXPRESSION', 'MATH_5E_LITT_SUBSTITUER', 'MATH_5E_PUISSANCES',
  'MATH_4E_ALGO_CONDITION', 'MATH_4E_TRANSLATION', 'MATH_4E_PROBA_CALCUL', 'MATH_4E_PUISSANCES', 'MATH_4E_PUISS_DIX',
  'MATH_4E_REL_MULT', 'MATH_4E_LITT_DEVELOPPER', 'MATH_4E_LITT_FACTORISER',
  'MATH_3E_ALGO_FONCTION', 'MATH_3E_ROTATION', 'MATH_3E_HOMOTHETIE', 'MATH_3E_VECTEURS', 'MATH_3E_PROBA_DEUX',
  'MATH_3E_PUISSANCES', 'MATH_3E_LITT_REMARQUABLE', 'MATH_3E_LITT_FACTORISER',
]);
const PREFIXE = {
  SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_',
};

/** [nom, module, clé de famille attendue]. */
const MODULES = [
  ['le miroir', miroir, 'miroir-college'],
  ['le robot', robot, 'robot-college'],
  ['le sac de billes', billes, 'sac-de-billes-college'],
  ['la tour des puissances', puissances, 'tour-des-puissances'],
  ['la machine à x', machine, 'machine-a-x'],
  ['l’ascenseur', ascenseur, 'ascenseur-des-relatifs'],
  ['la droite des relatifs', droite, 'droite-des-relatifs'],
];
const JEUX = MODULES.flatMap(([nom, module]) => module.CLASSES.map((classe) => [`${nom} — ${classe}`, module, classe]));

/* ---------------------------------------------------------------- le contrat */

describe.each(MODULES)('%s : la famille', (_, module, cle) => {
  it('se présente : clé, matière, une entrée par classe, des compétences du référentiel', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'MATHS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    expect(module.CLASSES.length).toBeGreaterThan(0);
    module.CLASSES.forEach((classe) => {
      const p = module.PAR_CLASSE[classe];
      expect(PREFIXE[classe]).toBeTruthy();
      expect(p.titre.trim()).toBeTruthy();
      expect(p.accroche.trim()).toBeTruthy();
      expect(p.accroche.length).toBeLessThanOrEqual(45);
      expect(p.competences.length).toBeGreaterThan(0);
      p.competences.forEach((c) => {
        expect(COMPETENCES.has(c)).toBe(true);
        expect(c).toContain(PREFIXE[classe]);
      });
    });
    expect(module.MANCHES).toBe(8);
    expect(module.bilan(module.MANCHES)).toBeTruthy();
  });

  it('ses phrases sont fixes : clés en kebab-case, aucun chiffre, jamais « raté », la typographie française', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(typeof texte).toBe('string');
      expect(texte.trim()).toBeTruthy();
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
      // Une espace avant « ? ! : ; ».
      expect(texte).not.toMatch(/[^\s  ][?!:;]/);
    });
  });
});

describe.each(JEUX)('%s', (_, module, classe) => {
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
        expect(m.question.trim()).toBeTruthy();
        m.choix.forEach((c) => {
          expect(String(c.libelle).trim()).toBeTruthy();
          expect(String(c.libelle).length).toBeLessThanOrEqual(30);
        });
        Object.keys(m.pieges).forEach((k) => {
          expect(k).not.toBe(String(m.bonne));
          expect(cles).toContain(k);
        });
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    const fautes = [];
    graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      const dites = [m.consigne, `${m.consigne}-regle`, ...(m.aide ? [m.aide] : [])];
      dites.forEach((k) => { if (!module.PHRASES[k]) fautes.push(`phrase absente : ${k}`); });
      m.choix.forEach((c) => {
        const s = module.verdict(m, c.cle);
        const bonne = String(c.cle) === String(m.bonne);
        if (bonne && s !== 'juste') fautes.push(`la bonne réponse ${c.cle} n'est pas jugée juste`);
        if (!bonne && (!module.PHRASES[s] || /raté/i.test(module.PHRASES[s]))) fautes.push(`erreur sans phrase : ${s}`);
      });
    }));
    expect(fautes).toEqual([]);
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, classe)).toEqual(module.serie(77, classe));
    expect(module.serie(1758000104729, classe)).toEqual(module.serie(1758000104729, classe));
  });

  it('les manches sont variées : plusieurs sortes par partie', () => {
    graines.slice(0, 10).forEach((g) => {
      const sortes = new Set(module.serie(g, classe).map((m) => m.consigne));
      expect(sortes.size).toBeGreaterThanOrEqual(2);
    });
  });
});

/* ------------------------------------------------- un calculateur indépendant */

const SUP = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-',
};

/**
 * Évalue une écriture affichée : « −3(2x − 5) », « (x + 2)²(4x + 4) »,
 * « 4,5 × 10⁻³ », « (−12) ÷ (+3) ». Multiplication implicite, signes moins
 * typographiques, exposants en exposant, variables d'une lettre.
 */
function evaluer(texte, env = {}) {
  const s = texte
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (e) => `^(${[...e].map((c) => SUP[c]).join('')})`)
    .replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, '');
  let i = 0;
  const voir = () => s[i];
  let somme;
  const nombre = () => {
    let j = i;
    while (j < s.length && /[0-9.]/.test(s[j])) j += 1;
    const v = Number(s.slice(i, j));
    i = j;
    return v;
  };
  const atome = () => {
    const c = voir();
    if (c === '(') {
      i += 1;
      const v = somme();
      if (voir() !== ')') throw new Error(`parenthèse attendue dans « ${texte} »`);
      i += 1;
      return v;
    }
    if (c === '-') { i += 1; return -atome(); }
    if (/[0-9.]/.test(c)) return nombre();
    if (/[a-z]/.test(c)) {
      i += 1;
      if (!(c in env)) throw new Error(`variable ${c} inconnue dans « ${texte} »`);
      return env[c];
    }
    throw new Error(`« ${c} » inattendu dans « ${texte} »`);
  };
  const puissance = () => {
    const v = atome();
    if (voir() === '^') { i += 1; return v ** atome(); }
    return v;
  };
  const facteur = () => {
    const c = voir();
    if (c === '-') { i += 1; return -facteur(); }
    if (c === '+') { i += 1; return facteur(); }
    let v = puissance();
    while (voir() === '(' || (voir() && /[a-z]/.test(voir()))) v *= puissance();
    return v;
  };
  const produit = () => {
    let v = facteur();
    while (voir() === '*' || voir() === '/') {
      const op = voir();
      i += 1;
      const w = facteur();
      v = op === '*' ? v * w : v / w;
    }
    return v;
  };
  somme = () => {
    let v = produit();
    while (voir() === '+' || voir() === '-') {
      const op = voir();
      i += 1;
      const w = produit();
      v = op === '+' ? v + w : v - w;
    }
    return v;
  };
  const v = somme();
  if (i !== s.length) throw new Error(`fin inattendue dans « ${texte} » (${s.slice(i)})`);
  return v;
}

/** « 3/8 », « −0,7 », « 1 024 », « 27 cm », « 65° » → un nombre. */
function nombre(t) {
  const s = String(t).replace(/ cm²| cm|°/g, '').replace(/−/g, '-').replace(/,/g, '.').replace(/\s/g, '');
  if (s.includes('/')) {
    const [a, b] = s.split('/').map(Number);
    return a / b;
  }
  return Number(s);
}
const egaux = (a, b) => a === b || Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));
const points = (t) => [...t.matchAll(/\((−?\d+) ; (−?\d+)\)/g)].map((x) => [nombre(x[1]), nombre(x[2])]);
const pt = ([x, y]) => `(${x < 0 ? `−${-x}` : x} ; ${y < 0 ? `−${-y}` : y})`;
const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/** La bonne réponse vaut `attendu`, et aucun autre choix ne le vaut. */
const seulJuste = (m, attendu, lire = nombre) => egaux(lire(m.bonne), attendu)
  && autres(m).every((c) => !egaux(lire(c), attendu));
/** La bonne réponse est exactement `attendu`, et aucun autre choix ne l'est. */
const seulEgal = (m, attendu) => m.bonne === attendu && autres(m).every((c) => c !== attendu);

/**
 * Passe chaque manche au contrôle ; rend la liste des manches fautives,
 * lisibles (la question, la réponse donnée pour bonne) — vide si tout est juste.
 */
const fautives = (manches, controle) => manches
  .filter((m) => !controle(m))
  .map((m) => `[${m.consigne}] ${m.question.replace(/\n/g, ' | ')} → ${m.bonne}`);

/* ------------------------------------------------------------- le miroir */

/** Le quadrilatère PQSR, quel que soit le sommet de départ ou le sens du tour. */
const memeTour = (nom, juste) => {
  const tours = [];
  for (let k = 0; k < 4; k += 1) {
    const r = juste.slice(k) + juste.slice(0, k);
    tours.push(r, [...r].reverse().join(''));
  }
  return tours.includes(nom);
};
const parallelogramme = (m) => {
  const [p, q, r, s] = m.question.includes('vecteurs')
    ? m.question.match(/vecteurs ([A-Z])([A-Z]) et ([A-Z])([A-Z])/).slice(1)
    : m.question.match(/transforme ([A-Z]) en ([A-Z]) transforme ([A-Z]) en ([A-Z])/).slice(1);
  const juste = `${p}${q}${s}${r}`;
  return memeTour(m.bonne, juste) && autres(m).every((c) => !memeTour(c, juste));
};

const NOTATIONS = [
  [/^Le segment d'extrémités ([A-Z]) et ([A-Z])/, (r) => `[${r[1]}${r[2]}]`],
  [/^La droite qui passe par ([A-Z]) et ([A-Z])/, (r) => `(${r[1]}${r[2]})`],
  [/^La demi-droite d'origine ([A-Z]) qui passe par ([A-Z])/, (r) => `[${r[1]}${r[2]})`],
  [/^La longueur du segment \[([A-Z])([A-Z])\]/, (r) => `${r[1]}${r[2]}`],
];

const CONTROLES_MIROIR = {
  'symetrie-axiale': (m) => {
    const [[ax, ay], [x, y]] = points(m.question);
    const verticale = m.question.includes('verticale');
    const image = verticale ? [2 * ax - x, y] : [x, 2 * ay - y];
    // À la même distance de l'axe, de l'autre côté.
    const memeDistance = verticale ? image[0] - ax === ax - x : image[1] - ay === ay - y;
    return memeDistance && seulEgal(m, pt(image));
  },
  droites: (m) => {
    const rel = [...m.question.matchAll(/ (⊥|\/\/) /g)].map((r) => r[1]);
    return m.bonne === (rel[0] === rel[1] ? 'parallèles' : 'perpendiculaires');
  },
  notation: (m) => {
    const [motif, ecrire] = NOTATIONS.find(([re]) => re.test(m.question));
    return seulEgal(m, ecrire(m.question.match(motif)));
  },
  'symetrie-centrale': (m) => {
    const [[a, b], [x, y]] = points(m.question);
    return seulEgal(m, pt([2 * a - x, 2 * b - y]));
  },
  parallelogramme: (m) => {
    if (m.question.includes('AB =')) {
      const ab = Number(m.question.match(/AB = (\d+)/)[1]);
      const bc = Number(m.question.match(/BC = (\d+)/)[1]);
      return seulJuste(m, m.question.includes('CD =') ? ab : bc);
    }
    const a = Number(m.question.match(/mesure (\d+)°/)[1]);
    return seulJuste(m, m.question.includes('en C =') ? a : 180 - a);
  },
  diagonales: (m) => seulJuste(m, Number(m.question.match(/AC = (\d+)/)[1]) / 2),
  translation: (m) => {
    const [b, c, a] = points(m.question);
    return seulEgal(m, pt([a[0] + c[0] - b[0], a[1] + c[1] - b[1]]));
  },
  'translation-parallelogramme': parallelogramme,
  'translation-mesure': (m) => seulJuste(m, nombre(m.question.split('\n')[1].match(/(\d+) ?(cm²|cm|°)/)[1])),
  rotation: (m) => {
    const [[a, b], [x, y]] = points(m.question);
    const [dx, dy] = [x - a, y - b];
    const horaire = m.question.includes('dans le sens des aiguilles');
    const image = horaire ? [a + dy, b - dx] : [a - dy, b + dx];
    // Un quart de tour : un angle droit au centre, la même distance.
    const droit = dx * (image[0] - a) + dy * (image[1] - b) === 0;
    const distance = (image[0] - a) ** 2 + (image[1] - b) ** 2 === dx ** 2 + dy ** 2;
    return droit && distance && seulEgal(m, pt(image));
  },
  'homothetie-point': (m) => {
    const k = nombre(m.question.match(/rapport (−?\d+)/)[1]);
    const [, [x, y]] = points(m.question);
    return seulEgal(m, pt([k * x, k * y]));
  },
  'homothetie-mesure': (m) => {
    const k = nombre(m.question.match(/rapport (−?\d+)/)[1]);
    const v = Number(m.question.match(/de (\d+) cm/)[1]);
    return seulJuste(m, m.question.includes('cm²') ? k * k * v : Math.abs(k) * v);
  },
  'homothetie-taille': (m) => {
    const k = Math.abs(nombre(m.question.match(/rapport (−?[\d,]+)/)[1]));
    if (k > 1) return m.bonne === 'agrandit la figure';
    if (k < 1) return m.bonne === 'réduit la figure';
    return m.bonne === 'garde la taille';
  },
  vecteur: (m) => {
    const [a, b, p] = points(m.question);
    return seulEgal(m, pt([p[0] + b[0] - a[0], p[1] + b[1] - a[1]]));
  },
};

describe('le miroir : chaque image est recalculée', () => {
  it.each(miroir.CLASSES)('%s', (classe) => {
    const manches = toutes(miroir, classe);
    expect(manches.every((m) => CONTROLES_MIROIR[m.consigne])).toBe(true);
    expect(fautives(manches, (m) => CONTROLES_MIROIR[m.consigne](m))).toEqual([]);
  });
});

/* -------------------------------------------------------------- le robot */

/** Un second interprète, écrit à part : il lit le programme AFFICHÉ, ligne à ligne. */
function lireProgramme(texte) {
  const lignes = texte.split('\n').map((l) => l.trim()).filter(Boolean);
  const defs = {};
  const racine = [];
  const pile = [{ corps: racine }];
  const ici = () => pile[pile.length - 1].corps;
  const ouvrir = (bloc, corps) => { ici().push(bloc); pile.push({ bloc, corps }); };
  const SENS = {
    monter: ['y', ''], descendre: ['y', '−'], 'aller à droite': ['x', ''], 'aller à gauche': ['x', '−'],
  };
  let question = null;
  lignes.forEach((l) => {
    let r;
    if ((r = l.match(/^définir (\w+) \((\w)\)$/))) {
      defs[r[1]] = { param: r[2], corps: [] };
      pile.push({ corps: defs[r[1]].corps });
    } else if (/^fin (définir|répéter|si)$/.test(l)) {
      pile.pop();
    } else if ((r = l.match(/^répéter (\d+) fois$/))) {
      const b = { t: 'n', n: Number(r[1]), corps: [] };
      ouvrir(b, b.corps);
    } else if ((r = l.match(/^répéter jusqu'à ce que (.+)$/))) {
      const b = { t: 'jusqua', c: r[1], corps: [] };
      ouvrir(b, b.corps);
    } else if ((r = l.match(/^si (.+) alors$/))) {
      const b = { t: 'si', c: r[1], alors: [], sinon: [] };
      ouvrir(b, b.alors);
    } else if (l === 'sinon') {
      const haut = pile.pop();
      pile.push({ bloc: haut.bloc, corps: haut.bloc.sinon });
    } else if ((r = l.match(/^mettre (\w) à (.+)$/))) {
      ici().push({ t: 'mettre', v: r[1], e: r[2] });
    } else if ((r = l.match(/^ajouter (.+) à (\w)$/))) {
      ici().push({ t: 'ajouter', v: r[2], e: r[1] });
    } else if ((r = l.match(/^aller à x : (−?\d+) y : (−?\d+)$/))) {
      ici().push({ t: 'mettre', v: 'x', e: r[1] }, { t: 'mettre', v: 'y', e: r[2] });
    } else if ((r = l.match(/^(monter|descendre|aller à droite|aller à gauche) de (\d+)$/))) {
      ici().push({ t: 'ajouter', v: SENS[r[1]][0], e: `${SENS[r[1]][1]}${r[2]}` });
    } else if ((r = l.match(/^Le lutin part de \((\d+) ; (\d+)\)\.$/))) {
      racine.push({ t: 'mettre', v: 'x', e: r[1] }, { t: 'mettre', v: 'y', e: r[2] });
    } else if ((r = l.match(/^Que vaut (\w) à la fin \?$/))) {
      [, question] = r;
    } else if (/^Où arrive/.test(l)) {
      question = 'lutin';
    } else if ((r = l.match(/^(\w+) \((.+)\)$/)) && defs[r[1]]) {
      ici().push({ t: 'appel', nom: r[1], e: r[2] });
    } else {
      throw new Error(`ligne inconnue : « ${l} »`);
    }
  });
  if (pile.length !== 1 || !question) throw new Error(`programme mal fermé : ${texte}`);

  const env = {};
  const vrai = (c) => {
    let r;
    if ((r = c.match(/^(\w) est pair$/))) return env[r[1]] % 2 === 0;
    if ((r = c.match(/^(\w) est impair$/))) return Math.abs(env[r[1]] % 2) === 1;
    const [a, op, b] = c.split(/ ([<>]) /);
    return op === '>' ? evaluer(a, env) > evaluer(b, env) : evaluer(a, env) < evaluer(b, env);
  };
  let pas = 0;
  const run = (corps) => corps.forEach((i) => {
    pas += 1;
    if (pas > 10000) throw new Error('programme sans fin');
    if (i.t === 'mettre') env[i.v] = evaluer(i.e, env);
    else if (i.t === 'ajouter') env[i.v] += evaluer(i.e, env);
    else if (i.t === 'n') for (let k = 0; k < i.n; k += 1) run(i.corps);
    else if (i.t === 'jusqua') while (!vrai(i.c)) run(i.corps);
    else if (i.t === 'si') run(vrai(i.c) ? i.alors : i.sinon);
    else {
      const d = defs[i.nom];
      env[d.param] = evaluer(i.e, env);
      run(d.corps);
    }
  });
  run(racine);
  return question === 'lutin' ? pt([env.x, env.y]) : env[question];
}

const controleRobot = (m) => {
  if (m.consigne === 'inconnue') {
    const [a, b, r] = m.question.match(/\d+/g).map(Number);
    const refait = (n) => (m.question.includes('ajoute') ? n * a + b : n * a - b);
    return refait(nombre(m.bonne)) === r && autres(m).every((c) => refait(nombre(c)) !== r);
  }
  if (m.consigne === 'motifs') {
    const [, u1, , u2, , u3, n] = m.question.match(/\d+/g).map(Number);
    return u3 - u2 === u2 - u1 && seulJuste(m, u1 + (n - 1) * (u2 - u1));
  }
  const attendu = lireProgramme(m.question);
  return typeof attendu === 'string' ? seulEgal(m, attendu) : seulJuste(m, attendu);
};

describe('le robot : chaque programme est rejoué par un second interprète', () => {
  it.each(robot.CLASSES)('%s', (classe) => {
    expect(fautives(toutes(robot, classe), controleRobot)).toEqual([]);
  });

  it('les programmes sont bien écrits : chaque bloc ouvert se ferme', () => {
    const manches = robot.CLASSES.flatMap((classe) => toutes(robot, classe));
    const ouverts = (q) => (q.match(/^\s*(répéter|si |définir)/gm) ?? []).length;
    const fermes = (q) => (q.match(/^\s*fin (répéter|si|définir)$/gm) ?? []).length;
    expect(fautives(manches, (m) => ouverts(m.question) === fermes(m.question))).toEqual([]);
  });

  it('le second interprète sait lire un programme', () => {
    const programme = 'mettre s à 0\nrépéter 3 fois\n    répéter 2 fois\n        ajouter 5 à s\n    fin répéter\nfin répéter\nQue vaut s à la fin ?';
    expect(lireProgramme(programme)).toBe(30);
  });
});

/* ------------------------------------------------------- le sac de billes */

const SINGULIER = {
  rouges: 'rouge', bleues: 'bleue', vertes: 'verte', jaunes: 'jaune',
};
const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));
const irreductible = (f) => {
  if (!f.includes('/')) return true;
  const [a, b] = f.replace('−', '').split('/').map(Number);
  return b > 1 && pgcd(a, b) === 1;
};
/** Le sac décrit sur la première ligne : { rouge: 3, bleue: 5, … }. */
function sac(question) {
  const contenu = {};
  [...question.split('\n')[0].matchAll(/(\d+) (?:billes? )?(rouges?|bleues?|vertes?|jaunes?)/g)].forEach(([, n, c]) => {
    contenu[SINGULIER[c] ?? c] = Number(n);
  });
  return contenu;
}
/** Le nombre de faces d'un dé à f faces qui réalisent l'événement écrit. */
function favorables(texte, f) {
  const faces = Array.from({ length: f }, (_, i) => i + 1);
  const premier = (x) => x > 1 && faces.slice(1, x - 1).every((d) => x % d !== 0);
  const cas = [
    [/un nombre pair/, () => (x) => x % 2 === 0],
    [/un nombre impair/, () => (x) => x % 2 === 1],
    [/un nombre premier/, () => premier],
    [/multiple de (\d+)/, (k) => (x) => x % k === 0],
    [/strictement supérieur à (\d+)/, (k) => (x) => x > k],
    [/inférieur ou égal à (\d+)/, (k) => (x) => x <= k],
    [/Obtenir (\d+) »/, (k) => (x) => x === k],
  ];
  const [re, critere] = cas.find(([motif]) => motif.test(texte));
  const r = texte.match(re);
  return faces.filter(critere(Number(r[1]))).length;
}

const deuxTirages = (m) => {
  const contenu = sac(m.question);
  const total = Object.values(contenu).reduce((a, b) => a + b, 0);
  const remise = m.question.includes('on la remet');
  // Le second tirage : le même sac, ou le sac privé de la bille tirée.
  const deux = (a, b) => (contenu[a] / total) * ((contenu[b] - (!remise && a === b ? 1 : 0)) / (total - (remise ? 0 : 1)));
  const meme = m.question.match(/deux billes (\w+) \?/);
  if (meme) return seulJuste(m, deux(SINGULIER[meme[1]], SINGULIER[meme[1]]));
  const [, a, b] = m.question.match(/tirer une (\w+), puis une (\w+) \?/);
  return seulJuste(m, deux(a, b));
};

const CONTROLES_BILLES = {
  'proba-simple': (m) => {
    if (m.question.includes('dé')) {
      const f = Number(m.question.match(/à (\d+) faces/)[1]);
      return seulJuste(m, favorables(m.question.split('\n')[1], f) / f);
    }
    const contenu = sac(m.question);
    const total = Object.values(contenu).reduce((a, b) => a + b, 0);
    return seulJuste(m, contenu[m.question.match(/tirer une (\w+) \?/)[1]] / total);
  },
  evenement: (m) => {
    let n;
    let total = 6;
    if (m.question.startsWith('Un sac')) {
      const contenu = sac(m.question);
      [total] = Object.values(contenu);
      n = contenu[m.question.match(/Tirer une bille (\w+) »/)[1]] ?? 0;
    } else {
      n = favorables(m.question, 6);
    }
    if (n === 0) return m.bonne === 'impossible';
    if (n === total) return m.bonne === 'certain';
    return m.bonne === 'possible, pas certain';
  },
  'pas-une-proba': (m) => {
    const v = nombre(m.bonne);
    return (v < 0 || v > 1) && autres(m).every((c) => nombre(c) >= 0 && nombre(c) <= 1);
  },
  contraire: (m) => seulJuste(m, 1 - nombre(m.question.match(/est (\d+\/\d+)/)[1])),
  effectif: (m) => {
    const total = Number(m.question.match(/contient (\d+) billes/)[1]);
    const n = total * nombre(m.question.match(/est (\d+\/\d+)/)[1]);
    return egaux(n, Math.round(n)) && seulJuste(m, n);
  },
  'tirage-avec-remise': deuxTirages,
  'tirage-sans-remise': deuxTirages,
  'deux-epreuves': (m) => {
    if (m.question.includes('pièces')) return seulJuste(m, m.question.includes('une fois pile et une fois face') ? 2 / 4 : 1 / 4);
    const s = Number(m.question.match(/somme de (\d+)/)[1]);
    let n = 0;
    for (let a = 1; a <= 6; a += 1) for (let b = 1; b <= 6; b += 1) if (a + b === s) n += 1;
    return seulJuste(m, n / 36);
  },
};

describe('le sac de billes : chaque probabilité est recomptée, en fraction irréductible', () => {
  it.each(billes.CLASSES)('%s', (classe) => {
    const manches = toutes(billes, classe);
    expect(manches.every((m) => CONTROLES_BILLES[m.consigne])).toBe(true);
    expect(fautives(manches, (m) => CONTROLES_BILLES[m.consigne](m))).toEqual([]);
    expect(fautives(manches, (m) => irreductible(m.bonne))).toEqual([]);
  });
});

/* -------------------------------------------------- la tour des puissances */

const avant = (q) => q.replace(/ = \?$/, '');
const estScientifique = (t) => /^[1-9](,\d+)? × 10[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+$/.test(t);

const controlePuissance = (m) => {
  if (m.consigne === 'scientifique') {
    const v = nombre(m.question.match(/de (.+) \?/)[1]);
    // Un piège peut valoir le même nombre (45 × 10³), mais n'est jamais une écriture scientifique.
    return estScientifique(m.bonne) && egaux(evaluer(m.bonne), v)
      && autres(m).every((c) => !(estScientifique(c) && egaux(evaluer(c), v)));
  }
  if (m.consigne === 'comparer-scientifique') {
    const max = Math.max(...m.choix.map((c) => evaluer(c.cle)));
    return evaluer(m.bonne) === max && autres(m).every((c) => evaluer(c) < max);
  }
  const sci = ['produit-scientifique', 'quotient-scientifique'].includes(m.consigne);
  return (!sci || estScientifique(m.bonne)) && seulJuste(m, evaluer(avant(m.question)), evaluer);
};

describe('la tour des puissances : chaque calcul est refait', () => {
  it.each(puissances.CLASSES)('%s', (classe) => {
    expect(fautives(toutes(puissances, classe), controlePuissance)).toEqual([]);
  });

  it('le calculateur du test lit les exposants comme au tableau', () => {
    expect(evaluer('2³')).toBe(8);
    expect(evaluer('−3²')).toBe(-9);
    expect(evaluer('(−3)²')).toBe(9);
    expect(egaux(evaluer('4,5 × 10⁻³'), 0.0045)).toBe(true);
  });
});

/* -------------------------------------------------------- la machine à x */

const VALEURS = [-3, -1, 0, 2, 5, 7];
const memeExpression = (a, b) => VALEURS.every((x) => egaux(evaluer(a, { x }), evaluer(b, { x })));

const controleMachine = (m) => {
  if (m.consigne === 'substituer' || m.consigne === 'tester-egalite') {
    const x = Number(m.question.match(/x = (\d+)/)[1]);
    const expr = m.question.split('\n')[1];
    if (m.consigne === 'substituer') return seulJuste(m, evaluer(expr, { x }));
    const [g, d] = expr.split(' = ');
    return m.bonne === (evaluer(g, { x }) === evaluer(d, { x }) ? 'vraie' : 'fausse');
  }
  // Factoriser rend un produit ; développer et réduire rendent une somme sans parenthèses.
  const forme = /factoris|facteur/.test(m.consigne) ? /^(\d+|x)?\(/.test(m.bonne) : !/[()]/.test(m.bonne);
  return forme && memeExpression(m.bonne, m.question) && autres(m).every((c) => !memeExpression(c, m.question));
};

describe('la machine à x : chaque égalité est vérifiée pour plusieurs valeurs de x', () => {
  it.each(machine.CLASSES)('%s', (classe) => {
    expect(fautives(toutes(machine, classe), controleMachine)).toEqual([]);
  });

  it('le calculateur du test sait lire les écritures du jeu', () => {
    expect(evaluer('−3(2x − 5)', { x: 2 })).toBe(3);
    expect(evaluer('(x + 2)²(4x + 4)', { x: 1 })).toBe(72);
    expect(evaluer('x(3x + 5x)', { x: 2 })).toBe(32);
    expect(evaluer('7x × 9x', { x: 1 })).toBe(63);
  });
});

/* ------------------------------------------------------------ l’ascenseur */

const controleAscenseur = (m) => {
  if (m.consigne === 'ascenseur') {
    const depart = nombre(m.question.match(/niveau (−?\d+)/)[1]);
    const pas = Number(m.question.match(/de (\d+) étages/)[1]);
    return seulJuste(m, m.question.includes('monte') ? depart + pas : depart - pas);
  }
  if (m.consigne === 'ecart-temperature') {
    const [froid, chaud] = [...m.question.matchAll(/(−?\d+) °C/g)].map((r) => nombre(r[1]));
    return seulJuste(m, chaud - froid);
  }
  return seulJuste(m, evaluer(avant(m.question)));
};

describe('l’ascenseur : chaque calcul de relatifs est refait', () => {
  it.each(ascenseur.CLASSES)('%s', (classe) => {
    expect(fautives(toutes(ascenseur, classe), controleAscenseur)).toEqual([]);
  });
});

/* --------------------------------------------------- la droite des relatifs */

const controleDroite = (m) => {
  if (m.consigne === 'plus-grand' || m.consigne === 'plus-petit') {
    const [a, b] = m.question.replace(' ?', '').split(/\s+ou\s+/).map(nombre);
    return seulJuste(m, m.consigne === 'plus-grand' ? Math.max(a, b) : Math.min(a, b));
  }
  if (m.consigne === 'abscisse') {
    const pas = nombre(m.question.match(/vaut ([\d,]+)/)[1]);
    const n = Number(m.question.match(/(\d+) graduations/)[1]);
    return seulJuste(m, (m.question.includes('à gauche') ? -1 : 1) * n * pas);
  }
  if (m.consigne === 'deplacer') {
    const depart = nombre(m.question.match(/abscisse (−?\d+)/)[1]);
    const d = Number(m.question.match(/(\d+) unités/)[1]);
    return seulJuste(m, m.question.includes('à droite') ? depart + d : depart - d);
  }
  const nombres = m.question.replace('Range : ', '').split(' ; ').map(nombre);
  const croissant = m.consigne === 'ranger-croissant';
  const bienRange = (t) => {
    const v = t.split(croissant ? ' < ' : ' > ').map(nombre);
    return v.length === nombres.length
      && [...v].sort((x, y) => x - y).join() === [...nombres].sort((x, y) => x - y).join()
      && v.every((x, i) => i === 0 || (croissant ? v[i - 1] < x : v[i - 1] > x));
  };
  return bienRange(m.bonne) && autres(m).every((c) => !bienRange(c));
};

describe('la droite des relatifs : comparer, repérer, ranger', () => {
  it.each(droite.CLASSES)('%s', (classe) => {
    expect(fautives(toutes(droite, classe), controleDroite)).toEqual([]);
  });
});
