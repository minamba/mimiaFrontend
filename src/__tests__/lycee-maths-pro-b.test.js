/**
 * LES JEUX DE MATHS DE LA VOIE PROFESSIONNELLE, LOT B — Nora : lire un
 * graphique, les probabilités, la géométrie de l'atelier, ajuster un nuage.
 *
 * Même épreuve que le collège : soixante parties par module ET par classe.
 * Puis l'exactitude : chaque bonne réponse est RECALCULÉE ici à partir de la
 * question affichée, sans passer par le module, et aucun autre choix ne doit
 * être juste lui aussi. Les écarts sont collectés, puis on vérifie qu'il n'y
 * en a aucun (pas d'`expect` dans un `if`).
 */

import * as graphique from '../lib/jeux/lycee/lire-un-graphique';
import * as probabilites from '../lib/jeux/lycee/probabilites-pro';
import * as geometrie from '../lib/jeux/lycee/geometrie-atelier';
import * as nuage from '../lib/jeux/lycee/ajuster-un-nuage';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

const MODULES = [
  ['lire-un-graphique', graphique],
  ['probabilites-pro', probabilites],
  ['geometrie-atelier', geometrie],
  ['ajuster-un-nuage', nuage],
];

/** Les codes de `competences-lycee.txt` dont ce lot a besoin, avec leur colonne NIVEAU, recopiés tels quels. */
const CODES = {
  MATH_2PRO_ALG_GRAPHIQUE: 'SECONDE_PRO',
  MATH_2PRO_LOGIQUE_INTERVALLE: 'SECONDE_PRO',
  MATH_2PRO_PROB_CALCULER: 'SECONDE_PRO',
  MATH_2PRO_PROB_ESTIMER: 'SECONDE_PRO',
  MATH_2PRO_PROB_FLUCTUATION: 'SECONDE_PRO',
  MATH_2PRO_GEO_GRANDEURS: 'SECONDE_PRO',
  MATH_2PRO_GEO_THEOREMES: 'SECONDE_PRO',
  MATH_1PRO_DERIV_CALCULER: 'PREMIERE_PRO',
  MATH_1PRO_DERIV_VARIATIONS: 'PREMIERE_PRO',
  MATH_1PRO_DERIV_EXTREMUM: 'PREMIERE_PRO',
  MATH_1PRO_PROB_ARBRE: 'PREMIERE_PRO',
  MATH_1PRO_PROB_CONDITION: 'PREMIERE_PRO',
  MATH_1PRO_GEO_ESPACE: 'PREMIERE_PRO',
  MATH_1PRO_STAT_NUAGE: 'PREMIERE_PRO',
  MATH_1PRO_STAT_AJUSTEMENT: 'PREMIERE_PRO',
  MATH_1PRO_STAT_INTERPOLER: 'PREMIERE_PRO',
  MATH_1PRO_STAT_PERTINENCE: 'PREMIERE_PRO',
  MATH_TPRO_POLY3_DERIVEE: 'TERMINALE_PRO',
  MATH_TPRO_POLY3_VARIATIONS: 'TERMINALE_PRO',
  MATH_TPRO_POLY3_EXPLOITER: 'TERMINALE_PRO',
  MATH_TPRO_TRIGO_TRIANGLE: 'TERMINALE_PRO',
  MATH_TPRO_STAT_AJUSTEMENT: 'TERMINALE_PRO',
  MATH_TPRO_STAT_EXPLOITER: 'TERMINALE_PRO',
  // Les probabilités en terminale pro : le fichier n'y a AUCUN code de probabilités.
  // Le plus proche de la classe : le vocabulaire ensembliste et les connecteurs
  // logiques (« et », « ou », le contraire), exactement ce que le jeu y travaille.
  MATH_TPRO_LOGIQUE: 'TERMINALE_PRO',
};

const VOIE_PRO = ['SECONDE_PRO', 'PREMIERE_PRO', 'TERMINALE_PRO'];

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

  it('la partie mélange plusieurs sortes de manches', () => {
    const sortes = new Set(graines.flatMap((g) => module.serie(g, classe).map((m) => m.consigne)));
    expect(sortes.size).toBeGreaterThanOrEqual(3);
  });

  it('la classe a son titre, son accroche et ses compétences officielles, de la bonne classe', () => {
    const fiche = module.PAR_CLASSE[classe];
    expect(fiche.titre).toBeTruthy();
    expect(fiche.accroche).toBeTruthy();
    expect(fiche.accroche.length).toBeLessThanOrEqual(45);
    expect(fiche.competences.length).toBeGreaterThan(0);
    fiche.competences.forEach((c) => expect([c, CODES[c]]).toEqual([c, classe]));
  });
});

describe.each(MODULES)('%s : la famille et les phrases', (cle, module) => {
  it('la famille porte sa clé, et les classes sont celles de la voie professionnelle', () => {
    expect(module.FAMILLE).toEqual(expect.objectContaining({ cle, matiereCode: 'MATHS' }));
    expect(module.FAMILLE.titre).toBeTruthy();
    expect(module.CLASSES).toEqual(Object.keys(module.PAR_CLASSE));
    module.CLASSES.forEach((c) => expect(VOIE_PRO).toContain(c));
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

  it('chaque piège nommé par une partie a sa phrase', () => {
    const manquantes = [];
    module.CLASSES.forEach((classe) => graines.forEach((g) => module.serie(g, classe).forEach((m) => {
      Object.values(m.pieges ?? {}).forEach((p) => {
        if (!module.PHRASES[p]) manquantes.push(p);
      });
    })));
    expect(manquantes).toEqual([]);
  });
});

/* ------------------------------------------------------------------------ */
/* L'exactitude : tout est recalculé ici, à partir de la question affichée. */
/* ------------------------------------------------------------------------ */

const toutes = (module, classe) => graines.flatMap((g) => module.serie(g, classe));

/** « −1 234,5 » → −1234.5 (signe moins typographique, espace fine des milliers). */
const num = (s) => Number(String(s).trim().replace(/ /g, '').replace('−', '-').replace(',', '.'));

/** Tous les nombres d'un texte, positifs (le signe est lu à part quand il compte). */
const nombres = (s) => (String(s).match(/\d[\d ]*(?:,\d+)?/g) || []).map(num);

/** Tous les nombres signés d'un texte (« −3 » collé). */
const signes = (s) => (String(s).match(/−?\d[\d ]*(?:,\d+)?/g) || []).map(num);

const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
const autres = (m) => m.choix.map((c) => String(c.cle)).filter((c) => c !== String(m.bonne));

/** Une manche à réponse exacte : la bonne vaut l'attendu, aucun autre choix ne le vaut. */
function seuleJuste(ecarts, m, attendu, lecture = num) {
  if (!proche(lecture(m.bonne), attendu)) ecarts.push(`${m.question} → ${m.bonne}, attendu ${attendu}`);
  autres(m).forEach((c) => {
    if (proche(lecture(c), attendu)) ecarts.push(`${m.question} → le piège ${c} est juste aussi`);
  });
}

/** Une manche arrondie : la bonne est l'arrondi, avec d décimales ; aucun autre choix ne l'est. */
function arrondiJuste(ecarts, m, exact, d) {
  const demi = 0.5 * 10 ** -d;
  const decimales = (String(m.bonne).split(',')[1] || '').length;
  if (decimales !== d) ecarts.push(`${m.question} → ${m.bonne} : ${d} décimales attendues`);
  if (Math.abs(num(m.bonne) - exact) > demi + 1e-9) ecarts.push(`${m.question} → ${m.bonne}, exact ${exact}`);
  autres(m).forEach((c) => {
    if (Math.abs(num(c) - exact) <= demi + 1e-9) ecarts.push(`${m.question} → le piège ${c} est juste aussi (${exact})`);
  });
}

/* ------------------------------------------------------- lire un graphique */

/** « 3x² − 5x + 2 » → [2, −5, 3] (coefficients par degré croissant). */
function lirePoly(s) {
  const coefs = [0, 0, 0, 0];
  s.trim().replace(/ − /g, ' + −').split(' + ').forEach((terme) => {
    const m = terme.match(/^(−?)([\d,]*)(x([²³]?))?$/);
    if (!m) throw new Error(`terme illisible : « ${terme} » dans « ${s} »`);
    const degre = m[3] ? { '': 1, '²': 2, '³': 3 }[m[4]] : 0;
    const v = m[2] ? num(m[2]) : 1;
    coefs[degre] += m[1] ? -v : v;
  });
  return coefs;
}
const deriver = (c) => [c[1], 2 * c[2], 3 * c[3], 0];
const evaluerPoly = (c, x) => c.reduce((s, v, k) => s + v * x ** k, 0);
const memePoly = (a, b) => a.every((v, k) => proche(v, b[k]));
const ligneDe = (question, debut) => question.split('\n').find((l) => l.startsWith(debut));
const rangee = (ligne) => ligne.split(' : ')[1].split(' | ').map(num);

/** Les trois points de la courbe décrite, et le sens de chaque morceau. */
function lireCourbe(question) {
  const points = [...question.matchAll(/\((−?\d+) ; (−?\d+)\)/g)].map((p) => [num(p[1]), num(p[2])]);
  const sens = [...question.matchAll(/(monte|descend) jusqu’au/g)].map((s) => s[1]);
  return { points, sens };
}

describe('lire un graphique : chaque réponse recalculée', () => {
  it('le lecteur de polynômes lit ce qu’on écrit', () => {
    expect(lirePoly('3x² − 5x + 2')).toEqual([2, -5, 3, 0]);
    expect(lirePoly('−x³ + 2,5x − 7')).toEqual([-7, 2.5, 0, -1]);
    expect(lirePoly(graphique.poly([-2, 0, 1, -4]))).toEqual([-4, 1, 0, -2]);
  });

  it('en 2de pro : images, antécédents, intervalles, extremums', () => {
    const ecarts = [];
    toutes(graphique, 'SECONDE_PRO').forEach((m) => {
      const q = m.question;
      if (m.consigne === 'image' || m.consigne === 'antecedent') {
        const xs = rangee(ligneDe(q, 'x : '));
        const ys = rangee(ligneDe(q, 'f(x) : '));
        const v = num(q.match(/de (\S+) par f/)[1]);
        if (new Set(ys).size !== ys.length) ecarts.push(`${q} : deux images égales`);
        const attendu = m.consigne === 'image' ? ys[xs.indexOf(v)] : xs[ys.indexOf(v)];
        seuleJuste(ecarts, m, attendu);
        return;
      }
      const { points, sens } = lireCourbe(q);
      const ys = points.map((p) => p[1]);
      const monte = (k) => sens[k] === 'monte';
      // Chaque morceau va bien dans le sens annoncé.
      [0, 1].forEach((k) => {
        if ((ys[k + 1] > ys[k]) !== monte(k)) ecarts.push(`${q} : sens incohérent`);
      });
      if (m.consigne === 'croissance') {
        const veut = /croissante \?$/.test(q) && !/décroissante \?$/.test(q);
        const k = monte(0) === veut ? 0 : 1;
        const [a, b] = [points[k][0], points[k + 1][0]];
        const lu = m.bonne.match(/^\[(\S+) ; (\S+)\]$/);
        if (!lu || num(lu[1]) !== a || num(lu[2]) !== b) ecarts.push(`${q} → ${m.bonne}, attendu [${a} ; ${b}]`);
        return;
      }
      const maximum = /^Maximum|maximale \?$/m.test(q);
      const extreme = maximum ? Math.max(...ys) : Math.min(...ys);
      if (m.consigne === 'extremum') seuleJuste(ecarts, m, extreme);
      else seuleJuste(ecarts, m, points[ys.indexOf(extreme)][0]);
    });
    expect(ecarts).toEqual([]);
  });

  it('en 1re pro : dérivées, tangentes, sens de variation, bénéfice maximal', () => {
    const ecarts = [];
    toutes(graphique, 'PREMIERE_PRO').forEach((m) => {
      const q = m.question;
      if (m.consigne === 'derivee') {
        const f = lirePoly(q.match(/^f\(x\) = (.+)$/m)[1]);
        const d = deriver(f);
        if (!memePoly(lirePoly(m.bonne), d)) ecarts.push(`${q} → ${m.bonne}`);
        autres(m).forEach((c) => { if (memePoly(lirePoly(c), d)) ecarts.push(`${q} → ${c} juste aussi`); });
      } else if (m.consigne === 'tangente') {
        const [[xa, ya], [xb, yb]] = [...q.matchAll(/\((−?[\d,]+) ; (−?[\d,]+)\)/g)].map((p) => [num(p[1]), num(p[2])]);
        seuleJuste(ecarts, m, (yb - ya) / (xb - xa));
      } else if (m.consigne === 'sens-variation') {
        const d = lirePoly(q.match(/^f′\(x\) = (.+) sur/m)[1]);
        const [lo, hi] = q.match(/sur \[(\S+) ; (\S+)\]/).slice(1).map(num);
        const [sLo, sHi] = [evaluerPoly(d, lo), evaluerPoly(d, hi)];
        if (sLo === 0 || sHi === 0) ecarts.push(`${q} : la dérivée s’annule à une borne`);
        let attendu;
        if (sLo > 0 && sHi > 0) attendu = 'croissante';
        else if (sLo < 0 && sHi < 0) attendu = 'décroissante';
        else attendu = sLo < 0 ? 'décroissante puis croissante' : 'croissante puis décroissante';
        if (m.bonne !== attendu) ecarts.push(`${q} → ${m.bonne}, attendu ${attendu}`);
      } else {
        const b = lirePoly(q.match(/^B\(x\) = (.+) est le bénéfice/m)[1]);
        const x0 = -b[1] / (2 * b[2]);
        if (!(b[2] < 0) || !Number.isInteger(x0)) ecarts.push(`${q} : pas de maximum entier`);
        seuleJuste(ecarts, m, m.consigne === 'sommet' ? x0 : evaluerPoly(b, x0));
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en terminale pro : dérivées, nombres dérivés, variations, tableaux exploités', () => {
    const ecarts = [];
    toutes(graphique, 'TERMINALE_PRO').forEach((m) => {
      const q = m.question;
      if (m.consigne === 'derivee-degre-trois') {
        const d = deriver(lirePoly(q.match(/^f\(x\) = (.+)$/m)[1]));
        if (!memePoly(lirePoly(m.bonne), d)) ecarts.push(`${q} → ${m.bonne}`);
        autres(m).forEach((c) => { if (memePoly(lirePoly(c), d)) ecarts.push(`${q} → ${c} juste aussi`); });
      } else if (m.consigne === 'nombre-derive') {
        const d = deriver(lirePoly(q.match(/^f\(x\) = (.+)$/m)[1]));
        const x0 = num(q.match(/^f′\((\S+)\) = \?$/m)[1]);
        seuleJuste(ecarts, m, evaluerPoly(d, x0));
      } else if (m.consigne === 'variations-trinome') {
        const expr = q.match(/^f′\(x\) = (.+) sur/m)[1];
        const racines = [...expr.matchAll(/\(x ([−+]) (\d+)\)/g)].map((r) => (r[1] === '−' ? 1 : -1) * num(r[2]));
        if (expr.replace(/\([^)]*\)/g, '').includes('x')) racines.push(0);
        const tete = expr.match(/^(−?\d*)/)[1];
        let k = num(tete);
        if (tete === '') k = 1;
        if (tete === '−') k = -1;
        const fp = (x) => k * (x - racines[0]) * (x - racines[1]);
        const [lo, hi] = q.match(/sur \[(\S+) ; (\S+)\]/).slice(1).map(num);
        const [r1, r2] = [...racines].sort((a, b) => a - b);
        if (racines.length !== 2 || !(lo < r1 && r1 < r2 && r2 < hi)) ecarts.push(`${q} : racines mal placées`);
        const attendu = [(lo + r1) / 2, (r1 + r2) / 2, (r2 + hi) / 2].map((x) => (fp(x) > 0 ? '↗' : '↘')).join(' ');
        if (m.bonne !== attendu) ecarts.push(`${q} → ${m.bonne}, attendu ${attendu}`);
      } else {
        const ligne = q.split('\n').find((l) => l.startsWith('f('));
        const valeurs = [...ligne.matchAll(/f\((\d+)\) = (\d+)/g)].map((p) => num(p[2]));
        const fleches = ligne.match(/[↗↘]/g);
        fleches.forEach((f, i) => {
          if ((valeurs[i + 1] > valeurs[i]) !== (f === '↗')) ecarts.push(`${q} : flèche incohérente`);
        });
        const maximum = /^Maximum/m.test(q);
        seuleJuste(ecarts, m, maximum ? Math.max(...valeurs) : Math.min(...valeurs));
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('les pièges classiques sont bien nommés', () => {
    const m = toutes(graphique, 'PREMIERE_PRO').find((x) => x.consigne === 'derivee'
      && Object.values(x.pieges).includes('derivee-oubli-facteur'));
    expect(m).toBeTruthy();
    const piege = Object.keys(m.pieges).find((k) => m.pieges[k] === 'derivee-oubli-facteur');
    const f = lirePoly(m.question.match(/^f\(x\) = (.+)$/m)[1]);
    // L'élève a baissé l'exposant sans multiplier : a x² + b x + c → a x + b.
    expect(lirePoly(piege)).toEqual([f[1], f[2], 0, 0]);
  });
});

/* ---------------------------------------------------------- probabilités */

/** « 3/20 » → [3, 20]. */
const fraction = (s) => String(s).split('/').map(Number);
const pgcd = (a, b) => (b === 0 ? a : pgcd(b, a % b));

/** La bonne réponse est la fraction n/d, irréductible ; aucun autre choix ne la vaut. */
function fractionJuste(ecarts, m, n, d) {
  const [a, b] = fraction(m.bonne);
  if (a * d !== b * n) ecarts.push(`${m.question} → ${m.bonne}, attendu ${n}/${d}`);
  if (pgcd(a, b) !== 1) ecarts.push(`${m.question} → ${m.bonne} n’est pas irréductible`);
  autres(m).forEach((c) => {
    const [x, y] = fraction(c);
    if (x * d === y * n) ecarts.push(`${m.question} → le piège ${c} est juste aussi`);
  });
}

/** Le tableau à double entrée d'une question : lignes, colonnes, effectifs. */
function lireTableau(question) {
  const lignes = question.split('\n');
  const k = lignes.findIndex((l) => l.startsWith('— | '));
  const colonnes = lignes[k].split(' | ').slice(1).map((c) => c.toLowerCase());
  const rangs = [lignes[k + 1], lignes[k + 2]].map((l) => l.split(' | '));
  return {
    colonnes,
    lignes: rangs.map((r) => r[0].toLowerCase()),
    n: rangs.map((r) => r.slice(1).map(Number)),
  };
}

/** L'effectif d'un événement (une ligne ou une colonne), et sa case avec un autre. */
function effectif(tab, nom) {
  const i = tab.lignes.indexOf(nom);
  if (i >= 0) return tab.n[i][0] + tab.n[i][1];
  const j = tab.colonnes.indexOf(nom);
  return tab.n[0][j] + tab.n[1][j];
}
function croisement(tab, a, b) {
  const [ligne, colonne] = tab.lignes.includes(a) ? [a, b] : [b, a];
  return tab.n[tab.lignes.indexOf(ligne)][tab.colonnes.indexOf(colonne)];
}

/** L'arbre pondéré d'une question : P(A), P sachant A de D, P(B), P sachant B de D. */
function lireArbre(question) {
  const branche = (nom) => {
    const l = question.split('\n').find((x) => x.startsWith(`${nom} (`));
    const [p, d, nonD] = nombres(l);
    return { p, d, nonD };
  };
  return { A: branche('A'), B: branche('B') };
}

describe('les probabilités : chaque réponse recalculée', () => {
  it('en 2de pro : cas favorables, fréquences, échantillons, tableaux', () => {
    const ecarts = [];
    toutes(probabilites, 'SECONDE_PRO').forEach((m) => {
      const q = m.question;
      if (m.consigne === 'proba-simple') {
        const [n, k] = nombres(q);
        const contraire = /ne (soit|vienne) pas/.test(q);
        fractionJuste(ecarts, m, contraire ? n - k : k, n);
      } else if (m.consigne === 'frequence') {
        const [n, k] = nombres(q);
        seuleJuste(ecarts, m, k / n);
      } else if (m.consigne === 'echantillon') {
        const [nA, nB] = nombres(q);
        const attendu = nA > nB ? 'Celle de A' : 'Celle de B';
        if (m.bonne !== attendu || nA === nB) ecarts.push(`${q} → ${m.bonne}`);
      } else {
        const tab = lireTableau(q);
        const total = effectif(tab, tab.lignes[0]) + effectif(tab, tab.lignes[1]);
        const evenement = q.match(/« (.+) »/)[1].toLowerCase();
        if (m.consigne === 'tableau-et') {
          const [a, b] = evenement.split(' et ');
          fractionJuste(ecarts, m, croisement(tab, a, b), total);
        } else {
          fractionJuste(ecarts, m, effectif(tab, evenement), total);
        }
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en 1re pro : arbres pondérés, probabilités totales, conditionnelles', () => {
    const ecarts = [];
    toutes(probabilites, 'PREMIERE_PRO').forEach((m) => {
      const q = m.question;
      if (m.consigne === 'arbre-chemin' || m.consigne === 'proba-totale') {
        const arbre = lireArbre(q);
        ['A', 'B'].forEach((nom) => {
          if (!proche(arbre[nom].d + arbre[nom].nonD, 1)) ecarts.push(`${q} : branches de ${nom} sans total un`);
        });
        if (!proche(arbre.A.p + arbre.B.p, 1)) ecarts.push(`${q} : P(A) + P(B) ≠ 1`);
        if (m.consigne === 'proba-totale') {
          seuleJuste(ecarts, m, arbre.A.p * arbre.A.d + arbre.B.p * arbre.B.d);
        } else {
          const [, nom, barre] = q.match(/P\(([AB]) ∩ D(̄?)\) \?$/);
          const b = arbre[nom];
          seuleJuste(ecarts, m, b.p * (barre ? b.nonD : b.d));
        }
      } else {
        const tab = lireTableau(q);
        const total = effectif(tab, tab.lignes[0]) + effectif(tab, tab.lignes[1]);
        if (m.consigne === 'condition-tableau') {
          const [evenement, condition] = q.match(/« (.+) » sachant « (.+) »/).slice(1).map((x) => x.toLowerCase());
          fractionJuste(ecarts, m, croisement(tab, evenement, condition), effectif(tab, condition));
        } else {
          const [a, b] = q.match(/« (.+) »/)[1].toLowerCase().split(' et ');
          fractionJuste(ecarts, m, croisement(tab, a, b), total);
        }
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en terminale pro : réunion, ni l’un ni l’autre, « ou » dans un tableau, au moins un', () => {
    const ecarts = [];
    toutes(probabilites, 'TERMINALE_PRO').forEach((m) => {
      const q = m.question;
      if (m.consigne === 'au-moins-un') {
        if (!/indépenda/.test(q)) ecarts.push(`${q} : l’indépendance n’est pas dite`);
        const [p, r] = nombres(q);
        seuleJuste(ecarts, m, 1 - (1 - p) * (1 - r));
      } else if (/P\(A ∩ B\) = /.test(q)) {
        const [pa, pb, pab] = q.match(/P\(A\) = (\S+) ; P\(B\) = (\S+) ; P\(A ∩ B\) = (\S+)\./).slice(1).map(num);
        const union = pa + pb - pab;
        if (!(pab < Math.min(pa, pb) && union < 1)) ecarts.push(`${q} : probabilités incohérentes`);
        seuleJuste(ecarts, m, /P\(A ∪ B\) \?$/.test(q) ? union : 1 - union);
      } else {
        const tab = lireTableau(q);
        const total = effectif(tab, tab.lignes[0]) + effectif(tab, tab.lignes[1]);
        const evenement = q.match(/« (.+) »/)[1].toLowerCase();
        if (m.consigne === 'tableau-et') {
          const [a, b] = evenement.split(' et ');
          fractionJuste(ecarts, m, croisement(tab, a, b), total);
        } else {
          const [a, b] = evenement.split(' ou ');
          fractionJuste(ecarts, m, effectif(tab, a) + effectif(tab, b) - croisement(tab, a, b), total);
        }
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('en terminale pro : les confusions entre « et », « ou » et le contraire sont nommées', () => {
    const nommes = new Set(toutes(probabilites, 'TERMINALE_PRO').flatMap((m) => Object.values(m.pieges)));
    ['ou-retirer-intersection', 'ou-inclusif', 'et-ou', 'contraire-de-ou', 'evenement-contraire']
      .forEach((p) => expect(nommes).toContain(p));
  });

  it('P sachant A n’est jamais confondue avec P sachant B sans que le piège le dise', () => {
    const pieges = toutes(probabilites, 'PREMIERE_PRO')
      .filter((m) => m.consigne === 'condition-tableau')
      .flatMap((m) => Object.values(m.pieges));
    expect(pieges).toContain('condition-inversee');
    pieges.forEach((p) => expect(['condition-inversee', 'intersection-ou-condition']).toContain(p));
  });
});

/* ---------------------------------------------------------- géométrie */

const RAD = Math.PI / 180;

describe('la géométrie de l’atelier : chaque mesure recalculée', () => {
  it('en 2de pro : aires, volumes, Pythagore, trigonométrie', () => {
    const ecarts = [];
    toutes(geometrie, 'SECONDE_PRO').forEach((m) => {
      const q = m.question;
      const n = nombres(q);
      if (/rectangulaire mesure/.test(q)) seuleJuste(ecarts, m, n[0] * n[1]);
      else if (/plateau/.test(q)) arrondiJuste(ecarts, m, Math.PI * (n[0] / 2) ** 2, 2);
      else if (/dalle/.test(q)) seuleJuste(ecarts, m, (n[0] * n[1] * n[2]) / 100);
      else if (/cuve cylindrique/.test(q)) arrondiJuste(ecarts, m, Math.PI * (n[0] / 2) ** 2 * n[1] * 1000, 0);
      else if (/échelle/.test(q)) arrondiJuste(ecarts, m, Math.sqrt(n[0] ** 2 - n[1] ** 2), 2);
      else if (/écharpe/.test(q)) arrondiJuste(ecarts, m, Math.hypot(n[0], n[1]), 2);
      else if (/angle de/.test(q)) arrondiJuste(ecarts, m, n[0] * Math.sin(n[1] * RAD), 2);
      else if (/monte de/.test(q)) arrondiJuste(ecarts, m, Math.atan(n[0] / n[1]) / RAD, 1);
      else ecarts.push(`question inconnue : ${q}`);
    });
    expect(ecarts).toEqual([]);
  });

  it('en 1re pro : cône, boule, diagonale, tôle', () => {
    const ecarts = [];
    toutes(geometrie, 'PREMIERE_PRO').forEach((m) => {
      const n = nombres(m.question);
      if (m.consigne === 'cone') arrondiJuste(ecarts, m, (Math.PI * n[0] ** 2 * n[1]) / 3, 2);
      else if (m.consigne === 'boule') arrondiJuste(ecarts, m, (4 / 3) * Math.PI * n[0] ** 3, 2);
      else if (m.consigne === 'diagonale') arrondiJuste(ecarts, m, Math.hypot(n[0], n[1], n[2]), 2);
      else arrondiJuste(ecarts, m, 2 * Math.PI * n[0] * n[1], 2);
    });
    expect(ecarts).toEqual([]);
  });

  it('en terminale pro : Al-Kashi et la loi des sinus', () => {
    const ecarts = [];
    toutes(geometrie, 'TERMINALE_PRO').forEach((m) => {
      const q = m.question;
      const n = nombres(q);
      if (m.consigne === 'al-kashi-cote') {
        const [c, b, A] = n;
        arrondiJuste(ecarts, m, Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A * RAD)), 2);
      } else if (m.consigne === 'al-kashi-angle') {
        const [a, b, c] = n;
        if (!(a < b + c && b < a + c && c < a + b)) ecarts.push(`${q} : pas un triangle`);
        arrondiJuste(ecarts, m, Math.acos((b * b + c * c - a * a) / (2 * b * c)) / RAD, 1);
      } else {
        const [a, A, B] = n;
        const C = 180 - A - B;
        if (!(C > 0)) ecarts.push(`${q} : angles impossibles`);
        // BC est en face de Â, AC en face de B̂, AB en face de Ĉ.
        const oppose = /Longueur AC/.test(q) ? B : C;
        arrondiJuste(ecarts, m, (a * Math.sin(oppose * RAD)) / Math.sin(A * RAD), 2);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('Al-Kashi redonne Pythagore à angle droit, et la loi des sinus le triangle équilatéral', () => {
    expect(Math.sqrt(9 + 16 - 24 * Math.cos(90 * RAD))).toBeCloseTo(5, 9);
    expect((7 * Math.sin(60 * RAD)) / Math.sin(60 * RAD)).toBeCloseTo(7, 9);
  });
});

/* ---------------------------------------------------------- nuage */

/** « y = 2,4x + 31 » → [2.4, 31]. */
function lireDroite(question) {
  const d = question.match(/y = (−?)([\d,]*)x(?: ([+−]) ([\d,]+))?/);
  const a = (d[1] ? -1 : 1) * (d[2] ? num(d[2]) : 1);
  const b = d[3] ? (d[3] === '−' ? -1 : 1) * num(d[4]) : 0;
  return [a, b];
}
/** « G(3 ; 49,8) » → [3, 49.8]. */
const lirePoint = (s, nom) => {
  const p = String(s).match(new RegExp(`${nom}\\((−?[\\d,]+) ; (−?[\\d,]+)\\)`));
  return [num(p[1]), num(p[2])];
};

describe('ajuster un nuage : chaque réponse recalculée', () => {
  it.each(nuage.CLASSES)('en %s : point moyen, droite, prévisions, fiabilité', (classe) => {
    const ecarts = [];
    toutes(nuage, classe).forEach((m) => {
      const q = m.question;
      if (m.consigne === 'point-moyen') {
        const xs = rangee(ligneDe(q, 'Rang de l’année x : '));
        const ys = rangee(ligneDe(q, 'y : '));
        const moyenne = (l) => l.reduce((s, v) => s + v, 0) / l.length;
        const g = [moyenne(xs), moyenne(ys)];
        const juste = (s) => {
          const [x, y] = lirePoint(s, 'G');
          return proche(x, g[0]) && proche(y, g[1]);
        };
        if (!juste(m.bonne)) ecarts.push(`${q} → ${m.bonne}`);
        autres(m).forEach((c) => { if (juste(c)) ecarts.push(`${q} → ${c} juste aussi`); });
      } else if (m.consigne === 'coefficient') {
        const [xg, yg] = lirePoint(q, 'G');
        const [xp, yp] = lirePoint(q, 'P');
        seuleJuste(ecarts, m, (yp - yg) / (xp - xg));
      } else if (m.consigne === 'ordonnee') {
        const a = num(q.match(/y = (−?[\d,]+)x \+ b/)[1]);
        const [xg, yg] = lirePoint(q, 'G');
        seuleJuste(ecarts, m, yg - a * xg);
      } else if (m.consigne === 'prevision') {
        const [a, b] = lireDroite(q);
        const debut = num(q.match(/x = 1 en (\d+)/)[1]);
        const annee = num(q.match(/Prévision pour (\d+)/)[1]);
        seuleJuste(ecarts, m, a * (annee - debut + 1) + b);
      } else if (m.consigne === 'seuil') {
        const [a, b] = lireDroite(q);
        const y = num(q.match(/prévoit-on y = (\S+) \?/)[1]);
        seuleJuste(ecarts, m, (y - b) / a);
      } else if (m.consigne === 'interpolation') {
        const n = num(q.match(/de 1 à (\d+)/)[1]);
        const x = num(q.match(/pour x = (\S+) avec/)[1]);
        const attendu = x >= 1 && x <= n ? 'Une interpolation' : 'Une extrapolation';
        if (m.bonne !== attendu) ecarts.push(`${q} → ${m.bonne}`);
      } else if (m.consigne === 'plus-fiable') {
        const n = num(q.match(/de 1 à (\d+)/)[1]);
        const dedans = m.choix.map((c) => c.cle).filter((c) => {
          const x = num(c.replace('x = ', ''));
          return x >= 1 && x <= n;
        });
        if (dedans.length !== 1 || dedans[0] !== m.bonne) ecarts.push(`${q} → ${m.bonne}`);
      } else {
        const [debut, fin, cible] = nombres(q);
        if (m.bonne !== 'Très fragile' || !(cible - fin >= 10) || !(fin > debut)) ecarts.push(`${q} → ${m.bonne}`);
      }
    });
    expect(ecarts).toEqual([]);
  });

  it('le lecteur de droites lit ce qu’on écrit', () => {
    expect(lireDroite('y = 2,4x + 31')).toEqual([2.4, 31]);
    expect(lireDroite('y = −x − 3')).toEqual([-1, -3]);
    expect(lireDroite(`y = ${nuage.droite(-1.5, 80)}`)).toEqual([-1.5, 80]);
  });

  it('le piège du rang de l’année est bien nommé', () => {
    const manches = toutes(nuage, 'TERMINALE_PRO').filter((m) => m.consigne === 'prevision');
    const nommes = manches.flatMap((m) => Object.values(m.pieges));
    expect(nommes).toContain('rang-de-l-annee');
    const ecarts = [];
    manches.forEach((m) => {
      const [a, b] = lireDroite(m.question);
      const debut = num(m.question.match(/x = 1 en (\d+)/)[1]);
      const annee = num(m.question.match(/Prévision pour (\d+)/)[1]);
      const piege = Object.keys(m.pieges).find((k) => m.pieges[k] === 'rang-de-l-annee');
      if (piege && !proche(num(piege), a * (annee - debut) + b)) ecarts.push(`${m.question} → ${piege}`);
    });
    expect(ecarts).toEqual([]);
  });
});

// Les nombres signés servent aux lectures futures ; on vérifie qu'ils lisent bien.
it('les lecteurs de nombres lisent la typographie française', () => {
  expect(num('−1 234,5')).toBe(-1234.5);
  expect(nombres('BC = 7 m, Â = 60°')).toEqual([7, 60]);
  expect(signes('f(−2) = −3,5')).toEqual([-2, -3.5]);
});
