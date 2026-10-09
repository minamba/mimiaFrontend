/**
 * LES JEUX DE MATHÉMATIQUES DU COLLÈGE, LOT D — fonctions, angles, repérage,
 * équations, Pythagore, Thalès, trigonométrie, racines carrées, le globe.
 * Professeure : Nora. Neuf modules purs, chacun joué soixante fois par classe.
 *
 * Les tests d'exactitude ne relisent pas le module : ils REPRENNENT la
 * question affichée, refont le calcul, et vérifient que la bonne réponse est
 * juste et qu'aucun autre choix ne l'est.
 */

import * as machine from '../lib/jeux/college/machine-a-fonctions.js';
import * as angles from '../lib/jeux/college/chasseur-d-angles.js';
import * as navale from '../lib/jeux/college/bataille-navale.js';
import * as balance from '../lib/jeux/college/balance-des-equations.js';
import * as echelle from '../lib/jeux/college/echelle-contre-le-mur.js';
import * as photo from '../lib/jeux/college/photo-agrandie.js';
import * as toboggan from '../lib/jeux/college/pente-du-toboggan.js';
import * as racine from '../lib/jeux/college/racine-cachee.js';
import * as globe from '../lib/jeux/college/le-globe.js';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes utiles de competences-college.txt, recopiés tels quels. */
const COMPETENCES = new Set([
  'MATH_5E_FONC_NOTION',
  'MATH_3E_FONC_NOTION', 'MATH_3E_FONC_LINEAIRE', 'MATH_3E_FONC_AFFINE', 'MATH_3E_FONC_GRAPHIQUE',
  'MATH_5E_GEO_ANGLES', 'MATH_5E_GEO_TRI_ANGLES', 'MATH_5E_GEO_TRI_INEG',
  'MATH_5E_GEO_REPERAGE',
  'MATH_4E_EQUATION', 'MATH_4E_PROB_EQUATION', 'MATH_3E_EQ_PRODUIT', 'MATH_3E_EQ_PROBLEME',
  'MATH_4E_PYTHAGORE', 'MATH_4E_PYTHAGORE_REC',
  'MATH_4E_MILIEUX', 'MATH_4E_THALES_INTRO', 'MATH_3E_THALES', 'MATH_3E_THALES_REC', 'MATH_3E_AGRANDISSEMENT',
  'MATH_4E_COSINUS', 'MATH_3E_TRIGO',
  'MATH_3E_RACINE',
  'MATH_3E_REPERAGE',
]);
const MARQUE = {
  SIXIEME: '_6E_', CINQUIEME: '_5E_', QUATRIEME: '_4E_', TROISIEME: '_3E_',
};

const toutes = (module, niveau) => graines.flatMap((g) => module.serie(g, niveau));
/** Les choix faux d'une manche. */
const fausses = (m) => m.choix.filter((c) => String(c.cle) !== String(m.bonne));

// ------------------------------------------------------------------ outils de relecture

/** « −3,5 » → -3.5 ; « 25/3 » → 8.333… */
const num = (s) => {
  const t = s.replace(/−/g, '-').replace(',', '.');
  if (t.includes('/')) {
    const [n, d] = t.split('/').map(Number);
    return n / d;
  }
  return Number(t);
};
const NOMBRE = /−?\d+(?:,\d+)?(?:\/\d+)?/g;
const nombres = (s) => (String(s).match(NOMBRE) || []).map(num);
/** Le premier nombre d'un libellé. */
const valeur = (lib) => nombres(lib)[0];
const proche = (a, b) => Math.abs(a - b) < 1e-9;
const auDixieme = (x) => Math.round(x * 10) / 10;
const memes = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** « 3x − 2 », « −x », « 2x + 5 », « 7 » → [a, b]. */
function affine(s) {
  const t = s.trim();
  if (!t.includes('x')) return [0, num(t)];
  const r = t.match(/^(−?\d*)x(?: ([+−]) (\d+))?$/);
  if (!r) throw new Error(`expression illisible : ${s}`);
  let a = 1;
  if (r[1] === '−') a = -1;
  else if (r[1] !== '') a = num(r[1]);
  const b = r[2] ? (r[2] === '+' ? 1 : -1) * Number(r[3]) : 0;
  return [a, b];
}

/** Un programme « × 3, puis + 4 » appliqué à x. */
function programme(texte, x) {
  return texte.split(', puis ').reduce((v, etape) => {
    const [op, n] = etape.trim().split(' ');
    return op === '×' ? v * Number(n) : v + Number(n);
  }, x);
}

/** Une équation « 3x + 5 = 2x − 1 » vérifiée en x. */
const verifie = (equation, x) => {
  const [g, d] = equation.split(' = ').map(affine);
  return proche(g[0] * x + g[1], d[0] * x + d[1]);
};
/** « x = 25/3 » → 8.333… */
const solution = (lib) => num(lib.replace('x = ', ''));
/** Une équation écrite comme au tableau, « 2x + 2(x + 3) = 26 », évaluée en x. */
const evalue = (equation, x) => {
  const js = (s) => s.replace(/−/g, '-').replace(/(\d)x/g, '$1*x').replace(/(\d|x)\(/g, '$1*(');
  const [g, d] = equation.split(' = ').map((s) => new Function('x', `return ${js(s)};`)); // eslint-disable-line no-new-func
  return proche(g(x), d(x));
};

// ------------------------------------------------------------------ la relecture, module par module
// Chaque fonction lit la question affichée et rend `juste(cle)` : ce choix est-il exact ?

function relireMachine(m) {
  const q = m.question;
  if (m.consigne === 'programme-sortie') {
    const [, prog, x] = q.match(/Programme : (.+)\. On entre (\d+)/);
    return (lib) => valeur(lib) === programme(prog, Number(x));
  }
  if (m.consigne === 'programme-entree') {
    const [, prog, n] = q.match(/Programme : (.+)\. Il sort (\d+)/);
    return (lib) => programme(prog, valeur(lib)) === Number(n);
  }
  if (m.consigne === 'quelle-fonction') {
    const paires = [...q.matchAll(/(\d+) → (\d+)/g)].map((r) => [Number(r[1]), Number(r[2])]);
    return (lib) => paires.length === 3 && paires.every(([e, s]) => programme(lib, e) === s);
  }
  if (m.consigne === 'image' || m.consigne === 'antecedent') {
    const [, expr, v] = q.match(/f\(x\) = (.+)\. (?:Image|Antécédent) de (−?\d+)/);
    const [a, b] = affine(expr);
    if (m.consigne === 'image') return (lib) => valeur(lib) === a * num(v) + b;
    return (lib) => a * valeur(lib) + b === num(v);
  }
  if (m.consigne === 'lineaire') {
    const [x1, y1, x2] = nombres(q);
    return (lib) => valeur(lib) === (y1 / x1) * x2;
  }
  const [x1, y1, x2, y2] = nombres(q);
  const a = (y2 - y1) / (x2 - x1);
  return (lib) => memes(affine(lib), [a, y1 - a * x1]);
}

function relireAngles(m) {
  const q = m.question;
  if (m.consigne === 'angle-egal') {
    const attendu = /NON parallèles/.test(q) ? angles.ON_NE_SAIT_PAS : `${nombres(q)[0]}°`;
    return (lib) => lib === attendu;
  }
  if (m.consigne === 'somme-triangle') {
    const n = nombres(q);
    const attendu = /isocèle/.test(q) ? (180 - n[0]) / 2 : 180 - n[0] - n[1];
    return (lib) => attendu > 0 && valeur(lib) === attendu;
  }
  const [a, b, c] = nombres(q).sort((x, y) => x - y);
  let attendu = 'oui';
  if (c === a + b) attendu = 'aplati';
  if (c > a + b) attendu = 'non';
  return (cle) => cle === attendu;
}

const lireChemin = (s) => {
  const r = s.match(/(\d+) à (droite|gauche), (\d+) en (haut|bas)/);
  return [(r[2] === 'droite' ? 1 : -1) * Number(r[1]), (r[4] === 'haut' ? 1 : -1) * Number(r[3])];
};
const lirePoint = (s) => {
  const r = s.match(/\((−?\d+) ; (−?\d+)\)/);
  return [num(r[1]), num(r[2])];
};

function relireNavale(m) {
  const q = m.question;
  if (m.consigne === 'lire-point') return (lib) => memes(lirePoint(lib), lireChemin(q));
  if (m.consigne === 'placer-point') return (lib) => memes(lireChemin(lib), lirePoint(q));
  if (m.consigne === 'quadrant') {
    const [x, y] = lirePoint(q);
    const attendu = `En ${y > 0 ? 'haut' : 'bas'} à ${x > 0 ? 'droite' : 'gauche'}`;
    return (cle) => m.choix.find((c) => c.cle === cle).libelle === attendu;
  }
  const [x, y] = lirePoint(q);
  const [dx, dy] = lireChemin(q);
  return (lib) => memes(lirePoint(lib), [x + dx, y + dy]);
}

function relireBalance(m) {
  const q = m.question;
  const n = nombres(q);
  if (m.consigne === 'resoudre' || m.consigne === 'deux-membres') return (lib) => verifie(q, solution(lib));
  if (m.consigne === 'produit-nul') {
    const facteurs = [...q.matchAll(/\(([^)]+)\)/g)].map((r) => affine(r[1]));
    const produit = (x) => facteurs.reduce((p, [a, b]) => p * (a * x + b), 1);
    return (lib) => facteurs.length === 2 && lib.split(' ou ').every((s) => proche(produit(solution(s)), 0));
  }
  if (m.consigne === 'mise-en-equation') {
    let s;
    if (/Je pense/.test(q)) s = (n[2] - n[1]) / n[0];
    else if (/Tom/.test(q)) s = (n[1] - n[0]) / 2;
    else s = (n[1] - 2 * n[0]) / 4;
    return (lib) => Number.isInteger(s) && s > 0 && evalue(lib, s);
  }
  if (/fois un nombre/.test(q)) {
    const [a, b, c, d] = n;
    return (lib) => proche(a * valeur(lib) + b, c * valeur(lib) + d);
  }
  if (/rectangle/.test(q)) {
    const [b, p] = n;
    return (lib) => proche(2 * (2 * valeur(lib) + b), p);
  }
  const [a, b, c] = n;
  return (lib) => proche(a * valeur(lib) + b, c);
}

function relireEchelle(m) {
  const q = m.question;
  if (m.consigne === 'reciproque') {
    const cotes = [...q.matchAll(/([A-Z]{2}) = (\d+) cm/g)].map((r) => [r[1], Number(r[2])]);
    cotes.sort((p, r) => p[1] - r[1]);
    const [[, a], [, b], [grand, c]] = cotes;
    const nom = q.match(/Triangle ([A-Z]{3})/)[1];
    const sommet = nom.split('').find((l) => !grand.includes(l));
    const attendu = a * a + b * b === c * c ? `Rectangle en ${sommet}` : 'Pas rectangle';
    return (lib) => lib === attendu;
  }
  const [x, y] = nombres(q);
  const longueur = m.consigne === 'hypotenuse' ? Math.sqrt(x * x + y * y) : Math.sqrt(x * x - y * y);
  const attendu = /valeur exacte/.test(q) ? longueur : auDixieme(longueur);
  return (lib) => proche(valeur(lib), attendu);
}

function relirePhoto(m) {
  const q = m.question;
  const n = nombres(q);
  if (m.consigne === 'reciproque-thales') {
    const [am, ab, an, ac] = n;
    return (cle) => cle === (am * ac === an * ab ? 'oui' : 'non');
  }
  let attendu;
  if (m.consigne === 'milieux') {
    const [A, B, C] = q.match(/Dans ([A-Z]{3})/)[1].split('');
    if (/parallèle/.test(q)) return (lib) => q.includes(`[${A}${B}]`) && lib === `(${B}${C})`;
    attendu = /IJ = \?/.test(q) ? n[0] / 2 : 2 * n[0];
  } else if (m.consigne === 'proportionnalite') {
    const [am, ab, bc] = n;
    attendu = (bc * am) / ab;
  } else if (m.consigne === 'photo') {
    const [l, L, , l2] = n;
    attendu = (L * l2) / l;
  } else if (m.consigne === 'thales') {
    const [am, ab, x] = n;
    attendu = /AC = \?/.test(q) ? (x * ab) / am : (x * am) / ab;
  } else {
    const [mesure, k] = n;
    attendu = /cm³/.test(q) ? mesure * k ** 3 : mesure * k ** 2;
  }
  return (lib) => proche(valeur(lib), attendu);
}

const RAD = Math.PI / 180;
/** Le rapport, sa réciproque en degrés, le côté du haut, le côté du bas. */
const FONCTIONS = {
  sin: [(a) => Math.sin(a * RAD), (x) => Math.asin(x) / RAD, 'opp', 'hyp'],
  cos: [(a) => Math.cos(a * RAD), (x) => Math.acos(x) / RAD, 'adj', 'hyp'],
  tan: [(a) => Math.tan(a * RAD), (x) => Math.atan(x) / RAD, 'opp', 'adj'],
};
const quelle = (r1, r2) => Object.keys(FONCTIONS).find((f) => [FONCTIONS[f][2], FONCTIONS[f][3]].sort().join() === [r1, r2].sort().join());
/** Le rôle d'un côté vu depuis l'angle étudié. */
const roles = (q) => {
  const P = q.match(/rectangle en ([A-Z])/)[1];
  const [W, V] = q.match(/[Aa]ngle ([A-Z]{3})/)[1].split('');
  return (seg) => {
    if (seg.includes(P) && seg.includes(V)) return 'adj';
    if (seg.includes(P) && seg.includes(W)) return 'opp';
    return 'hyp';
  };
};

function relireToboggan(m) {
  const q = m.question;
  const role = roles(q);
  if (m.consigne === 'cosinus-rapport') {
    return (lib) => memes(lib.split('/').map(role), ['adj', 'hyp']);
  }
  if (m.consigne === 'choisir-rapport') {
    const [, connu, cherche] = q.match(/et ([A-Z]{2}) ; on cherche ([A-Z]{2})/);
    return (cle) => cle === quelle(role(connu), role(cherche));
  }
  if (m.consigne === 'cosinus-longueur' || m.consigne === 'trigo-longueur') {
    const a = Number(q.match(/= (\d+)°/)[1]);
    const [, seg, s] = q.match(/([A-Z]{2}) = (\d+) cm/);
    const cherche = q.match(/([A-Z]{2}) ≈/)[1];
    const [rapport, , haut] = FONCTIONS[quelle(role(seg), role(cherche))];
    const attendu = auDixieme(role(cherche) === haut ? Number(s) * rapport(a) : Number(s) / rapport(a));
    return (lib) => proche(valeur(lib), attendu);
  }
  const donnees = [...q.matchAll(/([A-Z]{2}) = (\d+) cm/g)].map((r) => [role(r[1]), Number(r[2])]);
  const [, arc, haut] = FONCTIONS[quelle(donnees[0][0], donnees[1][0])];
  const [h, b] = donnees[0][0] === haut ? [donnees[0][1], donnees[1][1]] : [donnees[1][1], donnees[0][1]];
  return (lib) => lib === `${Math.round(arc(h / b))}°`;
}

function relireRacine(m) {
  const q = m.question;
  if (m.consigne === 'encadrement') {
    const n = valeur(q);
    return (lib) => {
      const [a, b] = nombres(lib);
      return b === a + 1 && a * a < n && n < b * b;
    };
  }
  let attendu;
  if (m.consigne === 'racine-exacte') attendu = Math.sqrt(num(q.match(/√(\S+) =/)[1]));
  else if (m.consigne === 'carre-racine') attendu = valeur(q);
  else {
    const [a, b] = nombres(q);
    attendu = /√\(/.test(q) ? Math.sqrt(a + b) : Math.sqrt(a) + Math.sqrt(b);
  }
  return (lib) => proche(valeur(lib), attendu);
}

/** « 40° N ; 30° O » → [40, -30]. */
const lireCoord = (s) => {
  const [lat, lon] = s.split(' ; ');
  const v = (t, plus) => (t === '0°' ? 0 : (t.endsWith(plus) ? 1 : -1) * parseInt(t, 10));
  return [v(lat, 'N'), v(lon, 'E')];
};
const NOTIONS = {
  'Tous les points de latitude 0° forment…': 'L’équateur',
  'Tous les points de longitude 0° forment…': 'Le méridien de Greenwich',
  'Quelle est la latitude du pôle Nord ?': '90° N',
  'Les points qui ont la même latitude forment…': 'Un parallèle',
  'Les points qui ont la même longitude forment…': 'Un méridien',
  'La longitude d’un point va au plus jusqu’à…': '180° E ou O',
  'La latitude d’un point va au plus jusqu’à…': '90° N ou S',
};

function relireGlobe(m) {
  const q = m.question;
  if (m.consigne === 'notions-globe') return (lib) => lib === NOTIONS[q];
  if (m.consigne === 'lire-globe') {
    const lat = q.match(/(\d+)° au (nord|sud)/);
    const lon = q.match(/(\d+)° à l’(est|ouest)/);
    const attendu = [(lat[2] === 'nord' ? 1 : -1) * Number(lat[1]), (lon[2] === 'est' ? 1 : -1) * Number(lon[1])];
    return (lib) => /^\d+° [NS] ; \d+° [EO]$/.test(lib) && memes(lireCoord(lib), attendu);
  }
  const depart = lireCoord(q.match(/part de (.+ ; \d+° [EO])/)[1]);
  const [, d, dir] = q.match(/de (\d+)° vers (le nord|le sud|l’est|l’ouest)/);
  const pas = Number(d);
  const attendu = {
    'le nord': [depart[0] + pas, depart[1]],
    'le sud': [depart[0] - pas, depart[1]],
    'l’est': [depart[0], depart[1] + pas],
    'l’ouest': [depart[0], depart[1] - pas],
  }[dir];
  return (lib) => Math.abs(attendu[0]) <= 90 && Math.abs(attendu[1]) <= 180 && memes(lireCoord(lib), attendu);
}

/** [nom, module, clé attendue, relecture]. */
const MODULES = [
  ['la machine à fonctions', machine, 'machine-a-fonctions', relireMachine],
  ['le chasseur d’angles', angles, 'chasseur-d-angles', relireAngles],
  ['la bataille navale', navale, 'bataille-navale', relireNavale],
  ['la balance des équations', balance, 'balance-des-equations', relireBalance],
  ['l’échelle contre le mur', echelle, 'echelle-contre-le-mur', relireEchelle],
  ['la photo agrandie', photo, 'photo-agrandie', relirePhoto],
  ['la pente du toboggan', toboggan, 'pente-du-toboggan', relireToboggan],
  ['la racine cachée', racine, 'racine-cachee', relireRacine],
  ['le globe', globe, 'le-globe', relireGlobe],
];
/** [nom, classe, module, relecture] : chaque module, dans chacune de ses classes. */
const CAS = MODULES.flatMap(([nom, module, , relire]) => module.CLASSES.map((niveau) => [nom, niveau, module, relire]));

// ------------------------------------------------------------------ le contrat, partout

describe.each(CAS)('%s, en %s', (_, niveau, module, relire) => {
  it('chaque partie a ses manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, niveau);
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        expect(m.question).toBeTruthy();
        m.choix.forEach((c) => expect(String(c.libelle)).toBeTruthy());
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => module.serie(g, niveau).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(module.PHRASES[`${m.consigne}-regle`]).toBeTruthy();
      expect(m.aide === undefined || Boolean(module.PHRASES[m.aide])).toBe(true);
      expect(Object.keys(m.pieges)).not.toContain(String(m.bonne));
      expect(module.verdict(m, m.bonne)).toBe('juste');
      fausses(m).forEach((c) => {
        const s = module.verdict(m, c.cle);
        expect(module.PHRASES[s]).toBeTruthy();
        expect(module.PHRASES[s]).not.toMatch(/raté|\bfaux\b/i);
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, niveau)).toEqual(module.serie(77, niveau));
    expect(module.serie(1758000104729, niveau)).toEqual(module.serie(1758000104729, niveau));
  });

  it('la classe a son titre, son accroche et ses compétences, toutes au référentiel et de la bonne classe', () => {
    const { titre, accroche, competences } = module.PAR_CLASSE[niveau];
    expect(titre).toBeTruthy();
    expect(accroche).toBeTruthy();
    expect(accroche.length).toBeLessThanOrEqual(45);
    expect(competences.length).toBeGreaterThan(0);
    competences.forEach((c) => {
      expect(COMPETENCES.has(c)).toBe(true);
      expect(c).toContain(MARQUE[niveau]);
    });
  });

  it('exactitude : la question recalculée donne la bonne réponse, et aucun autre choix n’est juste', () => {
    toutes(module, niveau).forEach((m) => {
      const juste = relire(m);
      expect([m.question, m.bonne, juste(m.bonne)]).toEqual([m.question, m.bonne, true]);
      expect([m.question, fausses(m).filter((c) => juste(c.cle)).map((c) => c.cle)]).toEqual([m.question, []]);
    });
  });
});

describe.each(MODULES)('%s : le module', (_, module, cle) => {
  it('se décrit lui-même', () => {
    expect(module.FAMILLE.cle).toBe(cle);
    expect(module.FAMILLE.matiereCode).toBe('MATHS');
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.MANCHES).toBe(8);
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    expect(module.bilan(8)).toBe('Sans une seule erreur. Bravo !');
  });

  it('ses phrases sont fixes : aucun chiffre, des clés en kebab-case, l’espace avant « ? ! : ; »', () => {
    Object.entries(module.PHRASES).forEach(([k, phrase]) => {
      expect(k).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(phrase).not.toMatch(/\d/);
      expect(phrase).not.toMatch(/[^\s  ][?!:;]/);
    });
  });

  it('chaque classe mélange plusieurs sortes de manches', () => {
    module.CLASSES.forEach((niveau) => {
      const sortes = new Set(module.serie(5, niveau).map((m) => m.consigne));
      expect(sortes.size).toBeGreaterThanOrEqual(3);
    });
  });
});

// ------------------------------------------------------------------ les pièges qui font chaque jeu

/** Les manches d'une sorte, avec le choix qui porte telle phrase d'erreur. */
const avecPiege = (module, niveau, consigne, phrase) => toutes(module, niveau)
  .filter((m) => m.consigne === consigne)
  .map((m) => [m, Object.keys(m.pieges).find((k) => m.pieges[k] === phrase)])
  .filter(([, piege]) => piege !== undefined);

describe('les pièges qui font chaque jeu', () => {
  it('la machine : le piège de l’image est bien l’antécédent', () => {
    const cas = avecPiege(machine, 'TROISIEME', 'image', 'pris-antecedent');
    expect(cas.length).toBeGreaterThan(0);
    cas.forEach(([m, piege]) => {
      const [, expr, v] = m.question.match(/f\(x\) = (.+)\. Image de (−?\d+)/);
      const [a, b] = affine(expr);
      expect(a * valeur(piege) + b).toBe(num(v));
    });
  });

  it('la bataille navale : le piège est l’abscisse et l’ordonnée inversées', () => {
    const cas = avecPiege(navale, 'CINQUIEME', 'lire-point', 'abscisse-d-abord');
    expect(cas.length).toBeGreaterThan(0);
    cas.forEach(([m, piege]) => expect(lirePoint(piege)).toEqual(lireChemin(m.question).reverse()));
  });

  it('l’échelle : pour un côté de l’angle droit, le piège a additionné au lieu de soustraire', () => {
    const cas = avecPiege(echelle, 'QUATRIEME', 'cote-angle-droit', 'soustraire-pour-un-cote');
    expect(cas.length).toBe(graines.length * 3);
    cas.forEach(([m, piege]) => {
      const [x, y] = nombres(m.question);
      expect(valeur(piege)).toBe(auDixieme(Math.sqrt(x * x + y * y)));
    });
  });

  it('l’échelle : « valeur exacte » donne un entier, « arrondi au dixième » un chiffre après la virgule', () => {
    const calculs = toutes(echelle, 'QUATRIEME').filter((m) => m.consigne !== 'reciproque');
    calculs.filter((m) => /valeur exacte/.test(m.question)).forEach((m) => expect(m.bonne).toMatch(/^\d+ cm$/));
    calculs.filter((m) => !/valeur exacte/.test(m.question)).forEach((m) => {
      expect(m.question).toMatch(/arrondi au dixième/);
      expect(m.bonne).toMatch(/^\d+,\d (cm|m)$/);
    });
  });

  it('la photo : la réciproque garde le piège des écarts égaux', () => {
    const cas = avecPiege(photo, 'TROISIEME', 'reciproque-thales', 'rapports-pas-differences');
    expect(cas.length).toBeGreaterThan(0);
    cas.forEach(([m]) => {
      const [am, ab, an, ac] = nombres(m.question);
      expect(ab - am).toBe(ac - an);
      expect(m.bonne).toBe('non');
    });
  });

  it('le toboggan : la précision est toujours dite', () => {
    ['QUATRIEME', 'TROISIEME'].forEach((niveau) => toutes(toboggan, niveau)
      .filter((m) => /≈/.test(m.question))
      .forEach((m) => expect(m.question).toMatch(/\(arrondi au (dixième|degré)\)$/)));
  });

  it('la racine : √(a + b) = √a + √b est toujours le piège des sommes', () => {
    const sommes = toutes(racine, 'TROISIEME').filter((m) => m.consigne === 'somme-racines');
    expect(sommes.length).toBe(graines.length * 2);
    sommes.forEach((m) => {
      const phrases = Object.values(m.pieges);
      expect(phrases.includes('racine-somme') || phrases.includes('somme-racines-separees')).toBe(true);
      const [a, b] = nombres(m.question);
      expect(Number.isInteger(Math.sqrt(a + b))).toBe(true);
    });
  });

  it('le globe : la banque des notions est entière et relue', () => {
    expect(globe.NOTIONS.map((n) => [n.question, n.bonne])).toEqual(Object.entries(NOTIONS));
  });
});
