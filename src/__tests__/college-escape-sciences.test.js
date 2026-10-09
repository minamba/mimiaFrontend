/**
 * LES ESCAPE GAMES DE SCIENCES DU COLLÈGE — Yann (sciences en 6e, physique-
 * chimie de la 5e à la 3e) et Inès (SVT de la 5e à la 3e). Même épreuve que
 * les jeux du CM2 : soixante parties par classe, une bonne réponse parmi des
 * choix distincts, une méthode pour chaque erreur ; puis ce qui fait un escape
 * game (six cadenas dans l'ordre du récit, le code qui se construit) et
 * l'exactitude : chaque calcul est refait ici à partir de la question.
 */

import * as sciences from '../lib/jeux/college/escape-sciences';
import * as physique from '../lib/jeux/college/escape-physique-chimie';
import * as svt from '../lib/jeux/college/escape-svt';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes de sciences, de physique-chimie et de SVT, recopiés de competences-college.txt (hors du dépôt). */
const COMPETENCES = new Set([
  'PC_5E_ENER_SOURCES', 'PC_5E_ENER_CIRCUIT', 'PC_5E_ENER_COURT', 'PC_5E_METH_SCHEMA',
  'PC_5E_METH_UNITES', 'PC_5E_METH_SECURITE', 'PC_5E_MOUV_RELATIF', 'PC_5E_MOUV_TRAJECTOIRE',
  'PC_5E_MAT_ETATS', 'PC_5E_MAT_MASSE', 'PC_5E_MAT_MELANGES', 'PC_5E_MAT_SOLUBILITE',
  'PC_5E_MAT_VOLUME', 'PC_5E_SIG_LUMIERE', 'PC_5E_SIG_SOURCES', 'PC_5E_SIG_INFORMATION',
  'PC_4E_ENER_TENSION', 'PC_4E_ENER_LOIS', 'PC_4E_ENER_OHM', 'PC_4E_ENER_PUISSANCE',
  'PC_4E_METH_TABLEAU', 'PC_4E_METH_CONVERSION', 'PC_4E_MOUV_VITESSE', 'PC_4E_MOUV_FORCES',
  'PC_4E_MOUV_POIDS', 'PC_4E_MAT_ATOMES', 'PC_4E_MAT_FORMULES', 'PC_4E_MAT_TRANSFO',
  'PC_4E_MAT_EQUATION', 'PC_4E_MAT_MASSE_VOLUMIQUE', 'PC_4E_MAT_PERIODIQUE', 'PC_4E_UNIV_STRUCTURE',
  'PC_4E_UNIV_DISTANCES', 'PC_4E_SIG_SON', 'PC_4E_SIG_FREQUENCE', 'PC_3E_ENER_FORMES',
  'PC_3E_ENER_CONSERVATION', 'PC_3E_ENER_CENTRALE', 'PC_3E_ENER_CONSOMMATION', 'PC_3E_ENER_RAYONNEMENT',
  'PC_3E_METH_GRAPHIQUE', 'PC_3E_METH_RESOUDRE', 'PC_3E_METH_ORDRE', 'PC_3E_MOUV_RELATIF',
  'PC_3E_MOUV_GRAVITATION', 'PC_3E_MOUV_BILAN', 'PC_3E_MAT_IONS', 'PC_3E_MAT_PH',
  'PC_3E_MAT_TESTS', 'PC_3E_MAT_METAUX', 'PC_3E_MAT_CONCENTRATION', 'PC_3E_MAT_EFFET_SERRE',
  'PC_3E_UNIV_MATIERE', 'PC_3E_MAT_RESSOURCES', 'PC_3E_SIG_LUMIERE', 'PC_3E_SIG_TRANSMISSION',
  'SC_6E_DEM_HYPOTHESE', 'SC_6E_DEM_PROTOCOLE', 'SC_6E_DEM_MESURE', 'SC_6E_DEM_GRAPHIQUE',
  'SC_6E_DEM_CONCLURE', 'SC_6E_TERRE_SOLAIRE', 'SC_6E_TERRE_RISQUES', 'SC_6E_TERRE_METEO',
  'SC_6E_VIV_CLASSIFICATION', 'SC_6E_VIV_CELLULE', 'SC_6E_VIV_NUTRITION', 'SC_6E_VIV_REPRODUCTION',
  'SC_6E_VIV_PEUPLEMENT', 'SC_6E_MAT_ETATS', 'SC_6E_MAT_MELANGES', 'SC_6E_MAT_MASSE_VOLUME',
  'SC_6E_MAT_MOUVEMENT', 'SC_6E_ENERGIE_FORMES', 'SC_6E_ENERGIE_CIRCUIT', 'SC_6E_ENERGIE_SECURITE',
  'SC_6E_TECH_BESOIN', 'SC_6E_TECH_MATERIAUX', 'SC_6E_TECH_ALGORITHME', 'SC_6E_TECH_RESEAU',
  'SC_6E_TECH_SIGNAL', 'SV_5E_TERRE_METEO', 'SV_5E_TERRE_EROSION', 'SV_5E_TERRE_RISQUE',
  'SV_5E_CORPS_DIGESTION', 'SV_5E_CORPS_ALIMENTATION', 'SV_5E_CORPS_HYGIENE', 'SV_5E_VIV_NUTRITION',
  'SV_5E_VIV_RESPIRATION', 'SV_5E_VIV_PLANTES', 'SV_5E_VIV_MICROORGANISMES', 'SV_5E_METH_DOCUMENT',
  'SV_5E_METH_GRAPHIQUE', 'SV_5E_METH_OBS_DEDUIT', 'SV_5E_METH_SCHEMA', 'SV_4E_TERRE_TECTONIQUE',
  'SV_4E_TERRE_PLAQUES', 'SV_4E_TERRE_ROCHES', 'SV_4E_TERRE_SOLAIRE', 'SV_4E_TERRE_ERES',
  'SV_4E_CORPS_PUBERTE', 'SV_4E_CORPS_REPRODUCTION', 'SV_4E_CORPS_CONTRACEPTION', 'SV_4E_CORPS_SYSTEME_NERVEUX',
  'SV_4E_VIV_REPRODUCTION', 'SV_4E_VIV_PEUPLEMENT', 'SV_4E_VIV_SELECTION', 'SV_4E_VIV_BIODIVERSITE',
  'SV_4E_VIV_ECOSYSTEME', 'SV_4E_METH_CONFRONTER', 'SV_4E_METH_HYPOTHESE', 'SV_4E_METH_CORRELATION',
  'SV_4E_METH_ECHELLE', 'SV_3E_TERRE_CLIMAT', 'SV_3E_TERRE_RESSOURCES', 'SV_3E_TERRE_PASSE',
  'SV_3E_TERRE_ECOSYSTEME', 'SV_3E_CORPS_IMMUNITE', 'SV_3E_CORPS_VACCINATION', 'SV_3E_CORPS_HORMONES',
  'SV_3E_CORPS_ADDICTIONS', 'SV_3E_CORPS_EFFORT', 'SV_3E_VIV_CHROMOSOMES', 'SV_3E_VIV_MITOSE',
  'SV_3E_VIV_MEIOSE', 'SV_3E_VIV_MUTATION', 'SV_3E_VIV_EVOLUTION', 'SV_3E_METH_ARGUMENTER',
  'SV_3E_METH_TABLEAU', 'SV_3E_METH_CRITIQUE',
]);

const PREFIXES = {
  SIXIEME: ['_6E_', '6e'], CINQUIEME: ['_5E_', '5e'], QUATRIEME: ['_4E_', '4e'], TROISIEME: ['_3E_', '3e'],
};

/** [nom, module, clé, matière, classes]. */
const MODULES = [
  ['les sciences de 6e', sciences, 'escape-sciences', 'SCIENCES', ['SIXIEME']],
  ['la physique-chimie', physique, 'escape-physique-chimie', 'PHYSIQUE_CHIMIE', ['CINQUIEME', 'QUATRIEME', 'TROISIEME']],
  ['les SVT', svt, 'escape-svt', 'SVT', ['CINQUIEME', 'QUATRIEME', 'TROISIEME']],
];

const CAS = MODULES.flatMap(([nom, module, , , classes]) => classes.map((niveau) => [nom, niveau, module]));

/** Les nombres d'un texte : espace des milliers retirée, virgule décimale lue. */
const nombres = (texte) => (texte.replace(/(\d)\s(?=\d)/g, '$1').match(/\d+(?:,\d+)?/g) || [])
  .map((x) => Number(x.replace(',', '.')));

/** Un libellé « 6 V » → { valeur: 6, unite: 'V' }. */
const mesure = (libelle) => {
  const propre = libelle.replace(/(\d)\s(?=\d)/g, '$1');
  const [, v, u] = propre.match(/^(\d+(?:,\d+)?)\s(.+)$/);
  return { valeur: Number(v.replace(',', '.')), unite: u };
};

const proche = (a, b) => Math.abs(a - b) < 1e-9;

describe.each(MODULES)('%s', (_, module, cle, matiere, classes) => {
  it('se décrit : sa famille, un escape game à six cadenas, ses classes', () => {
    expect(module.FAMILLE).toEqual({ cle, titre: expect.any(String), matiereCode: matiere });
    expect(module.FAMILLE.titre.trim()).not.toBe('');
    expect(module.ESCAPE).toBe(true);
    expect(module.MANCHES).toBe(6);
    expect(module.CLASSES).toEqual(classes);
    expect(module.bilan(6)).toBe('Sans une seule erreur. Bravo !');
    expect(module.bilan(0)).toBe('Tu y arrives. On recommence ?');
  });

  it('chaque phrase est fixe : aucun chiffre, une clé en kebab-case, jamais « raté » ni « faux »', () => {
    Object.entries(module.PHRASES).forEach(([k, texte]) => {
      expect(k).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(texte.trim()).not.toBe('');
      expect(texte).not.toMatch(/\d/);
      expect(texte).not.toMatch(/raté|\bfaux\b/i);
    });
  });

  it('chaque phrase enregistrée sert vraiment : aucune voix pour rien', () => {
    const dites = new Set();
    module.CLASSES.forEach((niveau) => graines.forEach((g) => module.serie(g, niveau).forEach((m) => {
      dites.add(m.consigne);
      m.choix.forEach((c) => { if (c.cle !== m.bonne) dites.add(module.verdict(m, c.cle)); });
    })));
    expect([...dites].sort()).toEqual(Object.keys(module.PHRASES).sort());
  });
});

describe.each(CAS)('%s — %s', (_, niveau, module) => {
  const [suffixe, prefixe] = PREFIXES[niveau];

  it('PAR_CLASSE : titre, accroche courte, intro, fin et compétences officielles de la classe', () => {
    const c = module.PAR_CLASSE[niveau];
    expect(c.titre.trim()).not.toBe('');
    expect(c.accroche.trim()).not.toBe('');
    expect(c.accroche.length).toBeLessThanOrEqual(45);
    expect(c.intro.trim()).not.toBe('');
    expect(c.fin.trim()).not.toBe('');
    expect(c.competences.length).toBeGreaterThan(0);
    c.competences.forEach((code) => {
      expect(COMPETENCES.has(code)).toBe(true);
      expect(code).toContain(suffixe);
    });
  });

  it('chaque partie a six manches, et chaque manche sa bonne réponse parmi des choix différents', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, niveau);
      expect(serie).toHaveLength(module.MANCHES);
      serie.forEach((m) => {
        const cles = m.choix.map((c) => String(c.cle));
        expect(new Set(cles).size).toBe(cles.length);
        expect(cles.length).toBeGreaterThanOrEqual(2);
        expect(cles.length).toBeLessThanOrEqual(4);
        expect(cles).toContain(String(m.bonne));
        expect(Object.keys(m.pieges)).not.toContain(String(m.bonne));
        m.choix.forEach((c) => expect(c.libelle.trim()).not.toBe(''));
        expect(m.question.trim()).not.toBe('');
      });
    });
  });

  it('la bonne réponse est juste, et chaque erreur a sa phrase — une méthode, jamais « raté »', () => {
    graines.forEach((g) => module.serie(g, niveau).forEach((m) => {
      expect(module.PHRASES[m.consigne]).toBeTruthy();
      expect(m.aide === undefined || Boolean(module.PHRASES[m.aide])).toBe(true);
      m.choix.forEach((c) => {
        const s = module.verdict(m, c.cle);
        const juste = String(c.cle) === String(m.bonne);
        expect(s).toBe(juste ? 'juste' : m.pieges[c.cle]);
        expect(juste || Boolean(module.PHRASES[s])).toBe(true);
        expect(juste ? '' : module.PHRASES[s]).not.toMatch(/raté/i);
      });
    }));
  });

  it('la même graine redonne la même partie', () => {
    expect(module.serie(77, niveau)).toEqual(module.serie(77, niveau));
    expect(module.serie(1758000000123, niveau)).toEqual(module.serie(1758000000123, niveau));
  });

  it('un escape game : six étapes dans l’ordre du récit, le code se construit pièce à pièce', () => {
    graines.forEach((g) => {
      const serie = module.serie(g, niveau);
      const pieces = [];
      serie.forEach((m, i) => {
        expect(m.consigne).toBe(`${prefixe}-etape-${i + 1}`);
        expect(m.recit.trim()).not.toBe('');
        expect(m.cadenas.total).toBe(6);
        expect(m.cadenas.avant).toEqual(pieces);
        expect(m.cadenas.piece).toMatch(/^[A-Z0-9]$/);
        pieces.push(m.cadenas.piece);
      });
      expect(pieces).toHaveLength(6);
      // Le code final est annoncé dans la phrase de fin.
      expect(module.PAR_CLASSE[niveau].fin).toContain(pieces.join(''));
    });
  });
});

describe('l’exactitude : chaque réponse est recalculée à partir de la question', () => {
  /** Toutes les manches d'une étape, sur les soixante graines. */
  const etape = (module, niveau, consigne) => graines
    .flatMap((g) => module.serie(g, niveau))
    .filter((m) => m.consigne === consigne);

  /** La bonne réponse vaut `attendu` dans l'unité `unite`, et aucun piège n'est aussi juste. */
  const verifier = (m, attendu, unite) => {
    const b = mesure(m.bonne);
    expect(b.unite).toBe(unite);
    expect(proche(b.valeur, attendu)).toBe(true);
    Object.keys(m.pieges).forEach((p) => {
      const x = mesure(p);
      expect(x.unite === unite && proche(x.valeur, attendu)).toBe(false);
    });
  };

  it('6e : le changement d’état nommé est le bon', () => {
    const NOMS = {
      'devient de l’eau liquide': 'La fusion',
      'devient de la glace': 'La solidification',
      'devient de la vapeur': 'La vaporisation',
    };
    etape(sciences, 'SIXIEME', '6e-etape-1').forEach((m) => {
      const trouve = Object.keys(NOMS).find((k) => m.question.includes(k));
      expect(m.bonne).toBe(NOMS[trouve]);
    });
  });

  it('6e : la masse se conserve à la fusion, et v = d ÷ t', () => {
    etape(sciences, 'SIXIEME', '6e-etape-2').forEach((m) => {
      const [masse] = nombres(m.question);
      verifier(m, masse, 'g');
    });
    etape(sciences, 'SIXIEME', '6e-etape-4').forEach((m) => {
      const [d, t] = nombres(m.question);
      verifier(m, d / t, 'm/s');
    });
  });

  it('5e physique-chimie : masse conservée, mélanges, sources, volume par différence', () => {
    etape(physique, 'CINQUIEME', '5e-etape-2').forEach((m) => {
      const [masse] = nombres(m.question);
      verifier(m, masse, 'g');
    });
    etape(physique, 'CINQUIEME', '5e-etape-3').forEach((m) => {
      expect(m.bonne).toBe(/salée|sucrée/.test(m.question) ? 'Homogène' : 'Hétérogène');
    });
    etape(physique, 'CINQUIEME', '5e-etape-5').forEach((m) => {
      expect(['Une bougie allumée', 'Le Soleil', 'Une lampe allumée']).toContain(m.bonne);
      expect(Object.keys(m.pieges)).toContain('La Lune');
    });
    etape(physique, 'CINQUIEME', '5e-etape-6').forEach((m) => {
      const [v1, v2] = nombres(m.question);
      verifier(m, v2 - v1, 'mL');
    });
  });

  it('4e : bon appareil, U = R × I (I converti en ampères), P = m × g, formule, ρ = m ÷ V', () => {
    etape(physique, 'QUATRIEME', '4e-etape-1').forEach((m) => {
      expect(m.bonne).toBe(m.question.includes('tension') ? 'Voltmètre, en dérivation' : 'Ampèremètre, en série');
    });
    etape(physique, 'QUATRIEME', '4e-etape-2').forEach((m) => {
      const [r, ma] = nombres(m.question);
      verifier(m, r * (ma / 1000), 'V');
    });
    etape(physique, 'QUATRIEME', '4e-etape-3').forEach((m) => {
      const [masse, g] = nombres(m.question);
      expect(g).toBe(1.6);
      verifier(m, masse * g, 'N');
    });
    const FORMULES = {
      'd’eau': 'H₂O', 'de dioxyde de carbone': 'CO₂', 'de méthane': 'CH₄', 'd’ammoniac': 'NH₃',
    };
    etape(physique, 'QUATRIEME', '4e-etape-5').forEach((m) => {
      const nom = Object.keys(FORMULES).find((k) => m.question.startsWith(`Une molécule ${k} :`));
      expect(m.bonne).toBe(FORMULES[nom]);
    });
    etape(physique, 'QUATRIEME', '4e-etape-6').forEach((m) => {
      const [masse, v] = nombres(m.question);
      verifier(m, masse / v, 'g/cm³');
      expect([2.7, 7.1, 7.9, 10.5]).toContain(masse / v);
    });
  });

  it('3e : pH, tests d’ions, gaz, ions, E = P × t et Ec = ½ × m × v²', () => {
    etape(physique, 'TROISIEME', '3e-etape-1').forEach((m) => {
      const [ph] = nombres(m.question);
      expect(ph).not.toBe(7);
      expect(m.bonne).toBe(ph < 7 ? 'Acide' : 'Basique');
    });
    const PRECIPITES = { bleu: 'Cu²⁺', vert: 'Fe²⁺', rouille: 'Fe³⁺' };
    etape(physique, 'TROISIEME', '3e-etape-2').forEach((m) => {
      const couleur = m.question.match(/précipité (\S+)\./)[1];
      expect(m.bonne).toBe(PRECIPITES[couleur]);
    });
    etape(physique, 'TROISIEME', '3e-etape-3').forEach((m) => expect(m.bonne).toBe('Le dihydrogène'));
    const SYMBOLES = {
      zinc: 'Zn', cuivre: 'Cu', magnésium: 'Mg', sodium: 'Na', aluminium: 'Al', chlore: 'Cl', oxygène: 'O',
    };
    const SUP = { 1: '', 2: '²', 3: '³' };
    etape(physique, 'TROISIEME', '3e-etape-4').forEach((m) => {
      const [, element, verbe, combien] = m.question.match(/Un atome d(?:e |’)(\S+) (perd|gagne) (un|\d)/);
      const n = combien === 'un' ? 1 : Number(combien);
      const signe = verbe === 'perd' ? '⁺' : '⁻';
      expect(m.bonne).toBe(`${SYMBOLES[element]}${SUP[n]}${signe}`);
    });
    etape(physique, 'TROISIEME', '3e-etape-5').forEach((m) => {
      const [p, t] = nombres(m.question);
      verifier(m, (p / 1000) * t, 'kWh');
    });
    etape(physique, 'TROISIEME', '3e-etape-6').forEach((m) => {
      const [masse, v] = nombres(m.question);
      verifier(m, 0.5 * masse * v * v, 'J');
    });
  });

  it('SVT : microbes triés, la chaîne commence par un végétal, la mitose garde le nombre de chromosomes', () => {
    const utiles = ['La levure du pain', 'Les bactéries du yaourt', 'La moisissure du roquefort'];
    etape(svt, 'CINQUIEME', '5e-etape-3').forEach((m) => {
      expect(utiles.includes(m.bonne)).toBe(m.question.includes('utile'));
      Object.keys(m.pieges).forEach((p) => expect(utiles.includes(p)).toBe(!m.question.includes('utile')));
    });
    etape(svt, 'QUATRIEME', '4e-etape-6').forEach((m) => {
      expect(m.bonne).toMatch(/^(Herbe|Feuille|Graines) → /);
      Object.keys(m.pieges).forEach((p) => expect(p).not.toMatch(/^(Herbe|Feuille|Graines) → /));
    });
    etape(svt, 'TROISIEME', '3e-etape-3').forEach((m) => {
      const [n] = nombres(m.question);
      expect(m.bonne).toBe(`${n} chromosomes`);
    });
  });
});
