/**
 * LES ESCAPE GAMES DE SCIENCES DU LYCÉE — Yann (physique-chimie) et Inès (SVT),
 * de la 2de à la terminale, dans les trois voies. Soixante parties par classe :
 * une bonne réponse parmi des choix distincts, une méthode pour chaque erreur ;
 * puis ce qui fait un escape game (six cadenas dans l'ordre du récit, le code
 * qui se construit), le titre de l'illustration, et l'exactitude : chaque
 * calcul est refait ici à partir de la question, et aucun piège n'est aussi juste.
 */

import * as physique from '../lib/jeux/lycee/escape-physique-chimie-lycee.js';
import * as svt from '../lib/jeux/lycee/escape-svt-lycee.js';

// Des petites graines et de grandes, comme Date.now().
const graines = Array.from({ length: 60 }, (_, i) => (i % 2 ? (i + 1) * 104729 + 1758000000000 : i + 1));

/** Les codes utiles, recopiés de competences-lycee.txt (hors du dépôt), avec leur colonne NIVEAU. */
const CLASSE_DU_CODE = {
  // physique-chimie, voie générale
  PC_2DE_SIG_REFRACTION: 'SECONDE',
  PC_2DE_CHIM_ESPECES: 'SECONDE',
  PC_2DE_CHIM_ENTITES: 'SECONDE',
  PC_2DE_CHIM_MOLE: 'SECONDE',
  PC_2DE_CHIM_CONCENTRATION: 'SECONDE',
  PC_2DE_CHIM_TRANSFO: 'SECONDE',
  PC_2DE_SIG_ELECTRIQUE: 'SECONDE',
  PC_2DE_SIG_CAPTEUR: 'SECONDE',
  PC_2DE_SIG_SON: 'SECONDE',
  PC_2DE_METH_PROTOCOLE: 'SECONDE',
  PC_2DE_METH_HOMOGENEITE: 'SECONDE',
  PC_2DE_MOUV_INERTIE: 'SECONDE',
  PC_2DE_MOUV_VITESSE: 'SECONDE',
  PC_2DE_MOUV_FORCES: 'SECONDE',
  PC_1RE_ONDES_COULEURS: 'PREMIERE',
  PC_1RE_CHIM_COMPOSITION: 'PREMIERE',
  PC_1RE_CHIM_OXYDO: 'PREMIERE',
  PC_1RE_CHIM_AVANCEMENT: 'PREMIERE',
  PC_1RE_CHIM_DOSAGE: 'PREMIERE',
  PC_1RE_MOUV_STATIQUE: 'PREMIERE',
  PC_TLE_MOUV_KEPLER: 'TERMINALE',
  PC_TLE_ONDES_PHOTOELEC: 'TERMINALE',
  PC_TLE_ELEC_CONDENSATEUR: 'TERMINALE',
  PC_TLE_ONDES_DIFFRACTION: 'TERMINALE',
  PC_TLE_ONDES_DUALITE: 'TERMINALE',
  PC_TLE_ONDES_DOPPLER: 'TERMINALE',
  // physique-chimie, série ST2S
  PCS1_COMBUSTION_HYDROLYSE: 'PREMIERE_ST2S',
  PCS1_PRESSION: 'PREMIERE_ST2S',
  PCS1_TRANSFERTS_THERMIQUES: 'PREMIERE_ST2S',
  PCS1_TENSION_SECTEUR: 'PREMIERE_ST2S',
  PCS1_RISQUE_ELECTRIQUE: 'PREMIERE_ST2S',
  PCS1_BILAN_MUSCLE: 'PREMIERE_ST2S',
  CBPHT_ONDES_RAYONS_X: 'TERMINALE_ST2S',
  CBPHT_PROTECTION_SOLAIRE: 'TERMINALE_ST2S',
  CBPHT_OZONE_GES: 'TERMINALE_ST2S',
  CBPHT_DOSAGE_ETALONNAGE: 'TERMINALE_ST2S',
  CBPHT_RADIOGRAPHIE: 'TERMINALE_ST2S',
  CBPHT_DEMI_VIE: 'TERMINALE_ST2S',
  // SVT
  SV_2DE_VIV_BIODIVERSITE: 'SECONDE',
  SV_2DE_VIV_CELLULE: 'SECONDE',
  SV_2DE_VIV_ADN: 'SECONDE',
  SV_2DE_VIV_METABOLISME: 'SECONDE',
  SV_2DE_VIV_ECOSYSTEME: 'SECONDE',
  SV_2DE_VIV_AGROSYSTEME: 'SECONDE',
  SV_2DE_TERRE_EROSION: 'SECONDE',
  SV_2DE_TERRE_RESSOURCES: 'SECONDE',
  SV_2DE_CORPS_MICROBIOTE: 'SECONDE',
  SV_2DE_CORPS_EFFORT: 'SECONDE',
  SV_2DE_CORPS_PATHOGENES: 'SECONDE',
  SV_2DE_METH_DEMARCHE: 'SECONDE',
  SV_2DE_METH_STATISTIQUE: 'SECONDE',
  SV_1RE_VIV_ENZYMES: 'PREMIERE',
  SV_1RE_GEN_EXPRESSION: 'PREMIERE',
  SV_1RE_GEN_MUTATIONS: 'PREMIERE',
  SV_1RE_GEN_PHENOTYPE: 'PREMIERE',
  SV_1RE_SANTE_MUTATION: 'PREMIERE',
  SV_1RE_GEN_MITOSE: 'PREMIERE',
  SV_TLE_TERRE_ARCHIVES: 'TERMINALE',
  SV_TLE_TERRE_OPHIOLITES: 'TERMINALE',
  SV_TLE_TERRE_ATMOSPHERE: 'TERMINALE',
  SV_TLE_GEN_POPULATION: 'TERMINALE',
  SV_TLE_GEN_DERIVE: 'TERMINALE',
  SV_TLE_GEN_ESPECE: 'TERMINALE',
};

/**
 * LA CLASSE DE REPLI. La SVT n'est enseignée ni en voie technologique ni en
 * voie professionnelle, et la physique-chimie de la voie professionnelle n'a
 * pas de codes à elle : ces escape games sont des jeux de culture
 * scientifique, bâtis sur les notions de 2de (codes de NIVEAU SECONDE). La
 * physique-chimie de la voie technologique, elle, prend les codes de la série
 * ST2S, les seuls de la voie dans le référentiel.
 */
const REPLI = {
  PHYSIQUE_CHIMIE: {
    SECONDE_PRO: 'SECONDE',
    PREMIERE_TECHNO: 'PREMIERE_ST2S',
    PREMIERE_PRO: 'SECONDE',
    TERMINALE_TECHNO: 'TERMINALE_ST2S',
    TERMINALE_PRO: 'SECONDE',
  },
  SVT: {
    SECONDE_PRO: 'SECONDE',
    PREMIERE_TECHNO: 'SECONDE',
    PREMIERE_PRO: 'SECONDE',
    TERMINALE_TECHNO: 'SECONDE',
    TERMINALE_PRO: 'SECONDE',
  },
};

/** Les titres peints sur les illustrations (src/assets/Jeux/<classe>/<matière>/<titre>.png). */
const TITRES = {
  PHYSIQUE_CHIMIE: {
    SECONDE: 'Le signal du laboratoire',
    SECONDE_PRO: 'La panne de l’atelier',
    PREMIERE: 'La réaction disparue',
    PREMIERE_TECHNO: 'L’énergie introuvable',
    PREMIERE_PRO: 'Le circuit du chantier',
    TERMINALE: 'L’orbite du signal perdu',
    TERMINALE_TECHNO: 'Le spectre invisible',
    TERMINALE_PRO: 'La chaleur sous contrôle',
  },
  SVT: {
    SECONDE: 'L’énigme de la mare',
    SECONDE_PRO: 'Le jardin sous surveillance',
    PREMIERE: 'Le secret des cellules',
    PREMIERE_TECHNO: 'L’alerte du bassin vivant',
    PREMIERE_PRO: 'La trace dans la serre',
    TERMINALE: 'La faille des origines',
    TERMINALE_TECHNO: 'Le vivant en équilibre',
    TERMINALE_PRO: 'Le secret du sol',
  },
};

const PREFIXES = {
  SECONDE: '2de',
  SECONDE_PRO: '2pro',
  PREMIERE: '1re',
  PREMIERE_TECHNO: '1tec',
  PREMIERE_PRO: '1pro',
  TERMINALE: 'tle',
  TERMINALE_TECHNO: 'ttec',
  TERMINALE_PRO: 'tpro',
};

const TOUTES = ['SECONDE', 'SECONDE_PRO', 'PREMIERE', 'PREMIERE_TECHNO', 'PREMIERE_PRO', 'TERMINALE', 'TERMINALE_TECHNO', 'TERMINALE_PRO'];

/** [nom, module, clé, matière, classes]. */
const MODULES = [
  ['la physique-chimie', physique, 'escape-physique-chimie-lycee', 'PHYSIQUE_CHIMIE', TOUTES],
  ['les SVT', svt, 'escape-svt-lycee', 'SVT', TOUTES],
];

const CAS = MODULES.flatMap(([nom, module, , matiere, classes]) => classes.map((niveau) => [nom, niveau, module, matiere]));

/** Un nombre écrit à la française (« 16 384 », « −19,62 », « 0,0600 »). */
const lire = (texte) => Number(texte.replace(/(\d)\s(?=\d)/g, '$1').replace('−', '-').replace(',', '.'));

/** Les nombres d'un texte : espace des milliers retirée, virgule décimale lue. */
const nombres = (texte) => (texte.replace(/(\d)\s(?=\d)/g, '$1').match(/\d+(?:,\d+)?/g) || [])
  .map((x) => Number(x.replace(',', '.')));

/** Un libellé « 6 V » → { valeur: 6, unite: 'V' }. */
const mesure = (libelle) => {
  const propre = libelle.replace(/(\d)\s(?=\d)/g, '$1');
  const trouve = propre.match(/^(−?\d+(?:,\d+)?)\s(.+)$/);
  return trouve ? { valeur: lire(trouve[1]), unite: trouve[2] } : { valeur: NaN, unite: '' };
};

const proche = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

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

  it('aucune clé ne sert à la fois de consigne et d’erreur', () => {
    const consignes = new Set();
    const erreurs = new Set();
    module.CLASSES.forEach((niveau) => graines.forEach((g) => module.serie(g, niveau).forEach((m) => {
      consignes.add(m.consigne);
      Object.values(m.pieges).forEach((p) => erreurs.add(p));
    })));
    expect([...consignes].filter((c) => erreurs.has(c))).toEqual([]);
  });
});

describe.each(CAS)('%s — %s', (_, niveau, module, matiere) => {
  const prefixe = PREFIXES[niveau];

  it('PAR_CLASSE : le titre de l’illustration, accroche courte, intro, fin et compétences officielles', () => {
    const c = module.PAR_CLASSE[niveau];
    expect(c.titre).toBe(TITRES[matiere][niveau]);
    expect(c.accroche.trim()).not.toBe('');
    expect(c.accroche.length).toBeLessThanOrEqual(45);
    expect(c.intro.trim()).not.toBe('');
    expect(c.intro).not.toMatch(/minute|chrono|compte à rebours|seconde/i);
    expect(c.fin.trim()).not.toBe('');
    expect(c.competences).toHaveLength(6);
    expect(new Set(c.competences).size).toBe(6);
    // La classe elle-même, ou sa classe de repli (voir REPLI).
    const permises = [niveau, REPLI[matiere][niveau]].filter(Boolean);
    const ecarts = c.competences.filter((code) => !permises.includes(CLASSE_DU_CODE[code]));
    expect(ecarts).toEqual([]);
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

  /**
   * La bonne réponse vaut `attendu` dans l'unité `unite`, et aucun piège n'est
   * aussi juste. Rend la liste des écarts (vide si tout va bien).
   */
  const ecartsDe = (m, attendu, unite) => {
    const ecarts = [];
    const b = mesure(m.bonne);
    if (b.unite !== unite || !proche(b.valeur, attendu)) ecarts.push(`${m.question} → ${m.bonne}, attendu ${attendu} ${unite}`);
    Object.keys(m.pieges).forEach((p) => {
      const x = mesure(p);
      if (x.unite === unite && proche(x.valeur, attendu)) ecarts.push(`${m.question} → piège juste : ${p}`);
    });
    return ecarts;
  };

  /** Même chose pour une réponse sans unité. */
  const ecartsSansUnite = (m, attendu) => {
    const ecarts = [];
    if (!proche(lire(m.bonne), attendu)) ecarts.push(`${m.question} → ${m.bonne}, attendu ${attendu}`);
    Object.keys(m.pieges).forEach((p) => { if (proche(lire(p), attendu)) ecarts.push(`${m.question} → piège juste : ${p}`); });
    return ecarts;
  };

  /** Une réponse qualitative : la bonne est `attendue`, et aucun piège ne l'est. */
  const ecartsTexte = (m, attendue) => {
    const ecarts = [];
    if (m.bonne !== attendue) ecarts.push(`${m.question} → ${m.bonne}, attendu ${attendue}`);
    if (Object.keys(m.pieges).includes(attendue)) ecarts.push(`${m.question} → piège juste : ${attendue}`);
    return ecarts;
  };

  /** Les étapes dont la réponse ne dépend d'aucun tirage : [module, classe, consigne, bonne réponse]. */
  const FIXES = [
    [physique, 'SECONDE_PRO', '2pro-etape-1', 'Ne passe plus nulle part'],
    [physique, 'SECONDE_PRO', '2pro-etape-2', 'En série avec le moteur'],
    [physique, 'SECONDE_PRO', '2pro-etape-5', 'Diminue'],
    [physique, 'SECONDE_PRO', '2pro-etape-6', 'Se compensent'],
    [physique, 'PREMIERE_TECHNO', '1tec-etape-1', 'CO₂ et H₂O'],
    [physique, 'PREMIERE_PRO', '1pro-etape-1', 'En dérivation, à ses bornes'],
    [physique, 'PREMIERE_PRO', '1pro-etape-4', 'Augmente'],
    [physique, 'TERMINALE_TECHNO', 'ttec-etape-2', 'Les UVB'],
    [svt, 'SECONDE_PRO', '2pro-etape-3', 'Les récoltes emportent les sels minéraux'],
    [svt, 'SECONDE_PRO', '2pro-etape-4', 'Des plants pareils, bien arrosés'],
    [svt, 'SECONDE_PRO', '2pro-etape-6', 'Couvrir la cuve d’eau de pluie'],
    [svt, 'PREMIERE_TECHNO', '1tec-etape-1', 'Les algues prolifèrent'],
    [svt, 'PREMIERE_TECHNO', '1tec-etape-2', 'Consomment le dioxygène'],
    [svt, 'PREMIERE_TECHNO', '1tec-etape-4', 'Une paroi et des chloroplastes'],
    [svt, 'PREMIERE_TECHNO', '1tec-etape-5', 'L’humain y apporte la nourriture et récolte les poissons'],
    [svt, 'PREMIERE_PRO', '1pro-etape-1', 'Les algues prolifèrent'],
    [svt, 'PREMIERE_PRO', '1pro-etape-2', 'Des plants pareils, sans excès d’engrais'],
    [svt, 'PREMIERE_PRO', '1pro-etape-3', 'De l’eau et des sels minéraux'],
    [svt, 'PREMIERE_PRO', '1pro-etape-4', 'Des chloroplastes'],
    [svt, 'PREMIERE_PRO', '1pro-etape-6', 'Pour polliniser les fleurs'],
    [svt, 'TERMINALE', 'tle-etape-2', 'Un étirement : le continent se déchire'],
    [svt, 'TERMINALE', 'tle-etape-3', 'Dioxygène'],
    [svt, 'TERMINALE', 'tle-etape-5', 'La dérive génétique'],
    [svt, 'TERMINALE', 'tle-etape-6', 'Elles ne donnent plus de descendants fertiles ensemble'],
    [svt, 'TERMINALE_TECHNO', 'ttec-etape-2', 'D’engrais aux plantes'],
    [svt, 'TERMINALE_TECHNO', 'ttec-etape-3', 'Se déposent : c’est la sédimentation'],
    [svt, 'TERMINALE_TECHNO', 'ttec-etape-6', 'T’aident à digérer et à te défendre'],
    [svt, 'TERMINALE_PRO', 'tpro-etape-1', 'Une ressource lente à se refaire'],
    [svt, 'TERMINALE_PRO', 'tpro-etape-2', 'Les racines des plantes'],
    [svt, 'TERMINALE_PRO', 'tpro-etape-3', 'Les décomposeurs : vers, champignons, bactéries'],
    [svt, 'TERMINALE_PRO', 'tpro-etape-4', 'Un noyau'],
    [svt, 'TERMINALE_PRO', 'tpro-etape-6', 'Enfouir du compost'],
  ];

  it('les étapes sans tirage : toujours la même bonne réponse, jamais en piège', () => {
    const ecarts = FIXES.flatMap(([module, niveau, consigne, bonne]) => {
      const manches = etape(module, niveau, consigne);
      return manches.length ? manches.flatMap((m) => ecartsTexte(m, bonne)) : [`aucune manche ${consigne}`];
    });
    expect(ecarts).toEqual([]);
  });

  // ------------------------------------------------------------ physique-chimie

  it('2de : Snell-Descartes et dispersion, palier, n = m ÷ M, dilution, réactif limitant, U = R × I', () => {
    const ecarts = [];
    const deux = (x) => x.toFixed(2).replace('.', ',');
    const sin = (d) => Math.sin((d * Math.PI) / 180);
    etape(physique, 'SECONDE', '2de-etape-1').forEach((m) => {
      if (!m.question.includes('Indice')) {
        ecarts.push(...ecartsTexte(m, 'Le violet'));
        return;
      }
      const i1 = Number(m.question.match(/incidence : (\d+)°/)[1]);
      const i2 = lire(m.question.match(/réfraction : (\d+,\d)°/)[1]);
      const n = sin(i1) / sin(i2);
      if (n < 1.4 || n > 1.65) ecarts.push(`indice peu vraisemblable : ${m.question}`);
      ecarts.push(...ecartsTexte(m, deux(n)));
    });
    etape(physique, 'SECONDE', '2de-etape-2').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('reste fixée') ? 'Un corps pur' : 'Un mélange'));
    });
    etape(physique, 'SECONDE', '2de-etape-3').forEach((m) => {
      const [masse, M] = nombres(m.question);
      ecarts.push(...ecartsDe(m, masse / M, 'mol'));
    });
    etape(physique, 'SECONDE', '2de-etape-4').forEach((m) => {
      const [c0, vf, c1] = nombres(m.question);
      ecarts.push(...ecartsDe(m, (c1 * vf) / c0, 'mL'));
    });
    const COEFFICIENTS = {
      'Zn + 2 H⁺': { Zn: 1, 'H⁺': 2 },
      'Mg + 2 H⁺': { Mg: 1, 'H⁺': 2 },
      'CaCO₃ + 2 H⁺': { 'CaCO₃': 1, 'H⁺': 2 },
    };
    const NOMS = {
      Zn: 'Le zinc Zn', Mg: 'Le magnésium Mg', 'CaCO₃': 'Le carbonate de calcium CaCO₃', 'H⁺': 'Les ions H⁺',
    };
    etape(physique, 'SECONDE', '2de-etape-5').forEach((m) => {
      const coef = COEFFICIENTS[Object.keys(COEFFICIENTS).find((k) => m.question.startsWith(k))];
      const quantites = [...m.question.matchAll(/n\((\S+)\) = (\d+(?:,\d+)?) mol/g)].map(([, esp, n]) => [esp, lire(n) / coef[esp]]);
      if (quantites.length !== 2) {
        ecarts.push(`deux quantités attendues : ${m.question}`);
        return;
      }
      const [[a, qa], [b, qb]] = quantites;
      if (proche(qa, qb)) ecarts.push(`stœchiométrique : ${m.question}`);
      ecarts.push(...ecartsTexte(m, NOMS[qa < qb ? a : b]));
    });
    etape(physique, 'SECONDE', '2de-etape-6').forEach((m) => {
      const [r, i] = nombres(m.question);
      ecarts.push(...ecartsDe(m, r * (i / 1000), 'V'));
    });
    expect(ecarts).toEqual([]);
  });

  it('2de pro : U = R × I en milliampères, les électrons d’un ion', () => {
    const ecarts = [];
    etape(physique, 'SECONDE_PRO', '2pro-etape-3').forEach((m) => {
      const [r, i] = nombres(m.question);
      ecarts.push(...ecartsDe(m, r * (i / 1000), 'V'));
    });
    const Z = { cuivre: 29, fer: 26, zinc: 30, aluminium: 13 };
    const CHARGE = { '²⁺': 2, '³⁺': 3 };
    etape(physique, 'SECONDE_PRO', '2pro-etape-4').forEach((m) => {
      const [, atome, z] = m.question.match(/L’atome d(?:e |’)(\S+) a Z = (\d+)/);
      const [, charge] = m.question.match(/ion \S+?(²⁺|³⁺)/);
      if (Z[atome] !== Number(z)) ecarts.push(`Z faux : ${m.question}`);
      ecarts.push(...ecartsSansUnite(m, Z[atome] - CHARGE[charge]));
    });
    expect(ecarts).toEqual([]);
  });

  it('1re : couleur complémentaire, absorbance, oxydoréduction, avancement, titrage au permanganate, Mariotte', () => {
    const ecarts = [];
    const COMPLEMENTAIRE = { vert: 'Magenta', rouge: 'Cyan', bleu: 'Jaune' };
    etape(physique, 'PREMIERE', '1re-etape-1').forEach((m) => {
      ecarts.push(...ecartsTexte(m, COMPLEMENTAIRE[m.question.match(/absorbe surtout le (\S+)\./)[1]]));
    });
    etape(physique, 'PREMIERE', '1re-etape-2').forEach((m) => {
      const [k, a] = nombres(m.question);
      ecarts.push(...ecartsDe(m, a / k, 'mmol/L'));
    });
    etape(physique, 'PREMIERE', '1re-etape-3').forEach((m) => {
      // Les électrons à droite de la flèche : l'espèce en perd, c'est une oxydation.
      const [, droite] = m.question.split('→');
      ecarts.push(...ecartsTexte(m, droite.includes('e⁻') ? 'Une oxydation' : 'Une réduction'));
    });
    etape(physique, 'PREMIERE', '1re-etape-4').forEach((m) => {
      // MnO₄⁻ + 5 Fe²⁺ → … : x_max = min(n(MnO₄⁻) ÷ 1, n(Fe²⁺) ÷ 5).
      const [, a, b] = m.question.match(/n\(MnO₄⁻\) = (\d+) mmol ; n\(Fe²⁺\) = (\d+) mmol/);
      ecarts.push(...ecartsDe(m, Math.min(Number(a), Number(b) / 5), 'mmol'));
    });
    etape(physique, 'PREMIERE', '1re-etape-5').forEach((m) => {
      if (!m.question.startsWith('MnO₄⁻ + 5 Fe²⁺')) ecarts.push(`équation : ${m.question}`);
      const va = lire(m.question.match(/Prise d’essai : (\S+) mL/)[1]);
      const c = lire(m.question.match(/permanganate à (\S+) mol\/L/)[1]);
      const ve = lire(m.question.match(/équivalence à (\S+) mL/)[1]);
      // À l'équivalence : n(Fe²⁺) = 5 × n(MnO₄⁻) versé.
      ecarts.push(...ecartsDe(m, (5 * c * ve) / va, 'mol/L'));
    });
    etape(physique, 'PREMIERE', '1re-etape-6').forEach((m) => {
      const [v1, p1, v2] = nombres(m.question);
      ecarts.push(...ecartsDe(m, (p1 * v1) / v2, 'kPa'));
    });
    expect(ecarts).toEqual([]);
  });

  it('1re techno : P = F ÷ S, transferts thermiques, sinusoïde, sécurité électrique, bilan d’énergie', () => {
    const ecarts = [];
    etape(physique, 'PREMIERE_TECHNO', '1tec-etape-2').forEach((m) => {
      const [f, s] = nombres(m.question);
      ecarts.push(...ecartsDe(m, f / (s * 1e-4) / 1000, 'kPa'));
    });
    etape(physique, 'PREMIERE_TECHNO', '1tec-etape-3').forEach((m) => {
      let attendu = 'Le rayonnement';
      if (m.question.includes('main')) attendu = 'La conduction';
      else if (m.question.includes('s’élève')) attendu = 'La convection';
      ecarts.push(...ecartsTexte(m, attendu));
    });
    etape(physique, 'PREMIERE_TECHNO', '1tec-etape-4').forEach((m) => {
      const [x] = nombres(m.question);
      if (m.question.includes('efficace')) ecarts.push(...ecartsDe(m, Math.round(x * Math.sqrt(2)), 'V'));
      else ecarts.push(...ecartsDe(m, 1 / (x / 1000), 'Hz'));
    });
    etape(physique, 'PREMIERE_TECHNO', '1tec-etape-5').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('défaut') ? 'Le disjoncteur différentiel' : 'Une électrisation'));
    });
    etape(physique, 'PREMIERE_TECHNO', '1tec-etape-6').forEach((m) => {
      const [recue, utile] = nombres(m.question);
      const [valeur, reste] = m.bonne.split(' kJ');
      if (!proche(lire(valeur), recue - utile) || reste !== ', en chaleur') ecarts.push(`${m.question} → ${m.bonne}`);
      Object.keys(m.pieges).forEach((p) => { if (p.endsWith('en chaleur')) ecarts.push(`piège juste : ${p}`); });
    });
    expect(ecarts).toEqual([]);
  });

  it('1re pro : I = U ÷ R, mAh, vitesse moyenne, poids', () => {
    const ecarts = [];
    etape(physique, 'PREMIERE_PRO', '1pro-etape-2').forEach((m) => {
      const [u, r] = nombres(m.question);
      ecarts.push(...ecartsDe(m, u / r, 'A'));
    });
    etape(physique, 'PREMIERE_PRO', '1pro-etape-3').forEach((m) => {
      const [c] = nombres(m.question);
      ecarts.push(...ecartsDe(m, c / 1000, 'Ah'));
    });
    etape(physique, 'PREMIERE_PRO', '1pro-etape-5').forEach((m) => {
      const [d, minutes] = nombres(m.question);
      ecarts.push(...ecartsDe(m, d / (minutes * 60), 'm/s'));
    });
    etape(physique, 'PREMIERE_PRO', '1pro-etape-6').forEach((m) => {
      const [masse, g] = nombres(m.question);
      ecarts.push(...ecartsDe(m, masse * g, 'N'));
    });
    expect(ecarts).toEqual([]);
  });

  it('terminale : Kepler, rendement photovoltaïque, Q = C × U, diffraction, dualité, Doppler', () => {
    const ecarts = [];
    etape(physique, 'TERMINALE', 'tle-etape-1').forEach((m) => {
      const [t, k] = nombres(m.question);
      // T² ∝ r³ : T_B = T_A × k^(3/2).
      ecarts.push(...ecartsDe(m, t * k ** 1.5, 'h'));
    });
    etape(physique, 'TERMINALE', 'tle-etape-2').forEach((m) => {
      const [s, eclairement, pe] = nombres(m.question);
      ecarts.push(...ecartsDe(m, (100 * pe) / (eclairement * s), '%'));
    });
    etape(physique, 'TERMINALE', 'tle-etape-3').forEach((m) => {
      const [c, u] = nombres(m.question);
      ecarts.push(...ecartsDe(m, c * u, 'µC'));
    });
    etape(physique, 'TERMINALE', 'tle-etape-4').forEach((m) => {
      if (!m.question.includes('λ')) {
        ecarts.push(...ecartsTexte(m, 'Plus large'));
        return;
      }
      const [lambda, a] = nombres(m.question);
      // θ = λ ÷ a, en radians, rendu en milliradians.
      ecarts.push(...ecartsDe(m, ((lambda * 1e-9) / (a * 1e-3)) * 1000, 'mrad'));
    });
    etape(physique, 'TERMINALE', 'tle-etape-5').forEach((m) => {
      const onde = /fente|franges/.test(m.question);
      ecarts.push(...ecartsTexte(m, onde ? 'Le modèle ondulatoire' : 'Le modèle particulaire'));
    });
    etape(physique, 'TERMINALE', 'tle-etape-6').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('s’éloigne') ? 'Plus basse qu’à l’émission' : 'Plus haute qu’à l’émission'));
    });
    expect(ecarts).toEqual([]);
  });

  it('terminale techno : domaines du spectre, ozone, absorbance, rayons X, période radioactive', () => {
    const ecarts = [];
    etape(physique, 'TERMINALE_TECHNO', 'ttec-etape-1').forEach((m) => {
      const l = lire(m.question.match(/λ = ([\d ,]+) nm/)[1]);
      let attendu = 'Infrarouge';
      if (l < 10) attendu = 'Rayons X';
      else if (l < 400) attendu = 'Ultraviolet';
      else if (l <= 800) attendu = 'Visible';
      ecarts.push(...ecartsTexte(m, attendu));
    });
    etape(physique, 'TERMINALE_TECHNO', 'ttec-etape-3').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('haute atmosphère') ? 'Absorbe une grande partie des UV solaires' : 'Irrite les voies respiratoires'));
    });
    etape(physique, 'TERMINALE_TECHNO', 'ttec-etape-4').forEach((m) => {
      const [k, a] = nombres(m.question);
      ecarts.push(...ecartsDe(m, a / k, 'mmol/L'));
    });
    etape(physique, 'TERMINALE_TECHNO', 'ttec-etape-5').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('les os') ? 'Ils absorbent davantage les rayons X' : 'La radiothérapie'));
    });
    const PERIODES = { 'technétium 99m': '6 h', 'iode 131': '8 jours', 'fluor 18': '110 min' };
    etape(physique, 'TERMINALE_TECHNO', 'ttec-etape-6').forEach((m) => {
      const [, nom, t, unite, duree] = m.question.match(/^Traceur (?:au |à l’)(.+) : on prend t½ = (\d+) (\S+)\. .* au bout de (\d+) /);
      if (PERIODES[nom] !== `${t} ${unite}`) ecarts.push(`période fausse : ${m.question}`);
      const reste = 0.5 ** (Number(duree) / Number(t));
      const fraction = (texte) => {
        const f = texte.match(/^1\/(\d+)$/);
        return f ? 1 / Number(f[1]) : 0;
      };
      if (!proche(fraction(m.bonne), reste)) ecarts.push(m.question);
      Object.keys(m.pieges).forEach((p) => { if (proche(fraction(p), reste)) ecarts.push(`piège juste : ${p}`); });
    });
    expect(ecarts).toEqual([]);
  });

  it('terminale pro : T = 1 ÷ f, loi des nœuds, poids, sonde de platine, kelvins, palier', () => {
    const ecarts = [];
    etape(physique, 'TERMINALE_PRO', 'tpro-etape-1').forEach((m) => {
      const [f] = nombres(m.question);
      ecarts.push(...ecartsDe(m, (1 / f) * 1000, 'ms'));
    });
    etape(physique, 'TERMINALE_PRO', 'tpro-etape-2').forEach((m) => {
      const [i] = nombres(m.question);
      ecarts.push(...ecartsDe(m, 2 * i, 'A'));
    });
    etape(physique, 'TERMINALE_PRO', 'tpro-etape-3').forEach((m) => {
      const [masse, g] = nombres(m.question);
      ecarts.push(...ecartsDe(m, masse * g, 'N'));
    });
    etape(physique, 'TERMINALE_PRO', 'tpro-etape-4').forEach((m) => {
      if (!m.question.includes('100 Ω à 0 °C') || !m.question.includes('0,385 Ω par degré')) ecarts.push(`étalonnage : ${m.question}`);
      const r = lire(m.question.match(/affiche (\S+) Ω/)[1]);
      ecarts.push(...ecartsDe(m, (r - 100) / 0.385, '°C'));
    });
    etape(physique, 'TERMINALE_PRO', 'tpro-etape-5').forEach((m) => {
      const [theta] = nombres(m.question);
      ecarts.push(...ecartsDe(m, theta + 273.15, 'K'));
    });
    etape(physique, 'TERMINALE_PRO', 'tpro-etape-6').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('glace') ? 'Reste à 0 °C' : 'Reste à 100 °C'));
    });
    expect(ecarts).toEqual([]);
  });

  // ------------------------------------------------------------ SVT

  /** L'échelle de la biodiversité que décrit une observation. */
  const echelle = (question) => {
    if (question.includes('allèles')) return 'Diversité génétique';
    if (question.includes('milieux')) return 'Diversité des écosystèmes';
    return 'Diversité des espèces';
  };

  /** Le gaz que rejette une plante : du CO₂ dans le noir, du O₂ quand la photosynthèse l'emporte. */
  const gaz = (question) => (question.includes('obscurité') ? 'Du dioxyde de carbone' : 'Du dioxygène');

  /** Cinq mesures et leur moyenne. */
  const moyenne = (m, unite) => {
    const valeurs = nombres(m.question);
    if (valeurs.length !== 5) return [`cinq mesures attendues : ${m.question}`];
    return ecartsDe(m, valeurs.reduce((s, v) => s + v, 0) / 5, unite);
  };

  it('SVT, échelles de la biodiversité, gaz des plantes et moyennes, dans toutes les classes', () => {
    const ecarts = [];
    [['SECONDE', '2de-etape-1'], ['SECONDE_PRO', '2pro-etape-1'], ['PREMIERE_TECHNO', '1tec-etape-6'], ['TERMINALE_TECHNO', 'ttec-etape-4']]
      .forEach(([niveau, consigne]) => etape(svt, niveau, consigne).forEach((m) => ecarts.push(...ecartsTexte(m, echelle(m.question)))));
    [['SECONDE', '2de-etape-4'], ['SECONDE_PRO', '2pro-etape-2'], ['TERMINALE_TECHNO', 'ttec-etape-1']]
      .forEach(([niveau, consigne]) => etape(svt, niveau, consigne).forEach((m) => ecarts.push(...ecartsTexte(m, gaz(m.question)))));
    [['SECONDE_PRO', '2pro-etape-5', 'kg'], ['PREMIERE_TECHNO', '1tec-etape-3', 'mg/L'], ['PREMIERE_PRO', '1pro-etape-5', 'cm']]
      .forEach(([niveau, consigne, unite]) => etape(svt, niveau, consigne).forEach((m) => ecarts.push(...moyenne(m, unite))));
    expect(ecarts).toEqual([]);
  });

  it('SVT 2de : ce que toute cellule possède, A = T et G = C, la chaîne de la mare, les maladies à moustique', () => {
    const ecarts = [];
    etape(svt, 'SECONDE', '2de-etape-2').forEach((m) => ecarts.push(...ecartsTexte(m, 'Membrane, cytoplasme et ADN')));
    etape(svt, 'SECONDE', '2de-etape-3').forEach((m) => {
      const [a] = nombres(m.question);
      ecarts.push(...ecartsDe(m, (100 - 2 * a) / 2, '%'));
    });
    const ROLE = { 'les algues microscopiques': 'Des producteurs', 'les daphnies': 'Des consommateurs primaires', 'les épinoches': 'Des consommateurs secondaires' };
    etape(svt, 'SECONDE', '2de-etape-5').forEach((m) => {
      ecarts.push(...ecartsTexte(m, ROLE[m.question.match(/Que sont (.+) \?$/)[1]]));
    });
    etape(svt, 'SECONDE', '2de-etape-6').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('paludisme') ? 'Un parasite unicellulaire' : 'Supprimer les eaux stagnantes'));
    });
    expect(ecarts).toEqual([]);
  });

  it('SVT 1re : enzymes, trois nucléotides par acide aminé, code génétique, phénotype, cancer, mitose', () => {
    const ecarts = [];
    etape(svt, 'PREMIERE', '1re-etape-1').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('°C') ? 'Elle a été dénaturée' : 'Son site actif est spécifique'));
    });
    etape(svt, 'PREMIERE', '1re-etape-2').forEach((m) => {
      const [aa] = nombres(m.question);
      ecarts.push(...ecartsSansUnite(m, 3 * aa));
    });
    // Le code génétique, pour les seuls codons utiles.
    const CODE = {
      GAA: 'Glu', GAG: 'Glu', GUG: 'Val', CAG: 'Gln', UAG: 'stop',
    };
    etape(svt, 'PREMIERE', '1re-etape-3').forEach((m) => {
      const [, avant, apres] = m.question.match(/ARNm (\w+) changé en (\w+)/);
      let attendu = 'Un acide aminé changé';
      if (CODE[apres] === 'stop') attendu = 'Une protéine raccourcie';
      else if (CODE[apres] === CODE[avant]) attendu = 'Aucun changement';
      ecarts.push(...ecartsTexte(m, attendu));
    });
    etape(svt, 'PREMIERE', '1re-etape-4').forEach((m) => {
      let attendu = 'Macroscopique';
      if (m.question.includes('molécules')) attendu = 'Moléculaire';
      else if (m.question.includes('globules')) attendu = 'Cellulaire';
      ecarts.push(...ecartsTexte(m, attendu));
    });
    etape(svt, 'PREMIERE', '1re-etape-5').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('UV') ? 'Ils provoquent des mutations de l’ADN' : 'Non : il en faut plusieurs, accumulées'));
    });
    etape(svt, 'PREMIERE', '1re-etape-6').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('46 chromosomes') ? '46' : 'Un brin ancien et un brin nouveau'));
    });
    expect(ecarts).toEqual([]);
  });

  it('SVT terminale : datation relative, Hardy-Weinberg', () => {
    const ecarts = [];
    etape(svt, 'TERMINALE', 'tle-etape-1').forEach((m) => {
      ecarts.push(...ecartsTexte(m, m.question.includes('filon') ? 'Plus récent que les couches' : 'La plus ancienne'));
    });
    etape(svt, 'TERMINALE', 'tle-etape-4').forEach((m) => {
      const [pourcent] = nombres(m.question);
      ecarts.push(...ecartsSansUnite(m, Math.sqrt(pourcent / 100)));
    });
    expect(ecarts).toEqual([]);
  });

  it('SVT voies techno et pro : débit cardiaque, pourcentage d’eau du sol', () => {
    const ecarts = [];
    etape(svt, 'TERMINALE_TECHNO', 'ttec-etape-5').forEach((m) => {
      const [fc, ves] = nombres(m.question);
      ecarts.push(...ecartsDe(m, (fc * ves) / 1000, 'L/min'));
    });
    etape(svt, 'TERMINALE_PRO', 'tpro-etape-5').forEach((m) => {
      const [humide, sec] = nombres(m.question);
      ecarts.push(...ecartsDe(m, ((humide - sec) / humide) * 100, '%'));
    });
    expect(ecarts).toEqual([]);
  });
});
